"""Voice gate helper: narrate, check every line with Whisper, and re-render ONLY the failing lines (same voice + settings).

  python -m pipeline.voicecheck <id> [--tries 4]

A line fails when Whisper hears a Fish tag word (e.g. "regretful") that is not in the caption, or when the spoken
words differ from the caption words (Rule A: voice = caption). Known Whisper name quirks are tolerated (NAME_ALIASES).
Fish s1 output varies per call, so a failing line is simply re-rendered (up to --tries rounds).
Writes output/<id>/qa/voice-check.json.
"""
import difflib
import hashlib
import json
import re
import sys
from pathlib import Path

from pipeline import audio
from pipeline.assemble import ROOT, narrate, script_for, TAG

# Whisper spelling quirks that are NOT voice errors (names, US/UK spelling). Keep this list small and specific.
NAME_ALIASES = {"noa": "noah", "lilly": "lily", "lili": "lily", "pel": "pell", "mom": "mum", "harbor": "harbour", "fairy": "ferry", "mom's": "mum's", "marlow": "marlo"}
ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()


def num_words(n):
    """1234 -> ['one', 'thousand', 'two', 'hundred', 'and', 'thirtyfour'] (script style: 'forty-five' -> 'fortyfive')."""
    out = []
    if n >= 1000:
        out += num_words(n // 1000) + ["thousand"]; n %= 1000
        if n and n < 100: out.append("and")
    if n >= 100:
        out += [ONES[n // 100], "hundred"]; n %= 100
        if n: out.append("and")
    if n >= 20:
        out.append(TENS[n // 10] + (ONES[n % 10] if n % 10 else ""))
    elif n or not out:
        out.append(ONES[n])
    return out


def norm_words(words):
    out = []
    for w in words:
        w = re.sub(r"[^a-z0-9']", "", w.lower().replace("-", ""))
        if w.isdigit():
            out += num_words(int(w))
        elif w:
            w = NAME_ALIASES.get(w, w)
            if out and out[-1] in TENS[2:] and w in ONES[1:10]:   # "forty five" -> "fortyfive"
                out[-1] += w
            else:
                out.append(w)
    return out


norm = lambda w: re.sub(r"[^a-z0-9']", "", w.lower())


def line_cache(line, ref):
    said = line.get("say", line["text"].replace("*", ""))
    sp = line.get("speed", 1.0)
    vol = line.get("volume", 0)
    return "line-" + hashlib.sha256((f"{said}|{sp}|{ref}|s1" + (f"|v{vol}" if vol else "")).encode()).hexdigest()[:16] + ".npy"


def check(lines, data):
    bad = {}
    tagw = {w for l in lines for t in TAG.findall(l.get("say", "")) for w in t.split()}
    owner = []  # each heard word belongs to the line whose span is nearest to the word's middle
    for h in data["heard"]:
        m = (h[1] + h[2]) / 2
        owner.append(min(range(len(lines)), key=lambda i: max(data["times"][i]["start"] - m, 0, m - data["times"][i]["end"])))
    for i, (l, t) in enumerate(zip(lines, data["times"])):
        heard = norm_words([h[0] for h, o in zip(data["heard"], owner) if o == i])
        want = norm_words(l["text"].split())
        drop_and = lambda ws: [w for w in ws if w != "and"] if any(x in ("hundred", "thousand") for x in ws) else ws   # "eight hundred (and) fifty"
        heard, want = drop_and(heard), drop_and(want)
        leaks = [w for w in heard if w in tagw and w not in want]
        diff = [(want[a1:a2], heard[b1:b2]) for op, a1, a2, b1, b2 in difflib.SequenceMatcher(a=want, b=heard, autojunk=False).get_opcodes() if op != "equal"]
        if leaks or diff:
            bad[i] = {"text": l["text"], "leaks": leaks, "diff": diff, "_want": want, "_heard": heard}
    for i in sorted(bad):  # a word Whisper timed into the neighbouring line is not an error if the two lines match together
        if i + 1 in bad and not bad[i]["leaks"] and not bad[i + 1]["leaks"] and bad[i]["_want"] + bad[i + 1]["_want"] == bad[i]["_heard"] + bad[i + 1]["_heard"]:
            bad[i]["ok"] = bad[i + 1]["ok"] = True
    return {i: {k: v for k, v in b.items() if not k.startswith("_")} for i, b in bad.items() if not b.get("ok")}


def main(vid, tries=4):
    out = ROOT / "output" / vid
    sc = script_for(vid)
    ref = audio._env_file()["FISH_VOICE_ID"]
    bad = {}
    for k in range(tries):
        data, wav = narrate(sc["lines"], out)
        bad = check(sc["lines"], data)
        print(f"round {k + 1}: {len(bad)} failing line(s)" + "".join(f"\n  line {i}: {b['text']} | leaks {b['leaks']} | diff {b['diff']}" for i, b in bad.items()))
        if not bad:
            break
        if k + 1 < tries:  # drop the failing lines' audio + the assembled narration, then re-render
            for i in bad:
                (out / "tts-lines" / line_cache(sc["lines"][i], ref)).unlink(missing_ok=True)
            for f in list(out.glob("narration-*.json")) + list(out.glob("voice-*.wav")):
                f.unlink()
    (out / "qa").mkdir(exist_ok=True)
    total = data["times"][-1]["end"] + sc.get("tail_hold", 0.8)
    rep = {"pass": not bad, "failing_lines": bad, "whisper_match": data["match_ratio"], "seconds": round(total, 1)}
    (out / "qa" / "voice-check.json").write_text(json.dumps(rep, indent=1, ensure_ascii=False), encoding="utf-8")
    print("VOICE CHECK", "PASS" if not bad else "FAIL", f"({total:.1f}s)")
    sys.exit(0 if not bad else 1)


if __name__ == "__main__":
    a = sys.argv[1:]
    main(a[0], int(a[a.index("--tries") + 1]) if "--tries" in a else 4)
