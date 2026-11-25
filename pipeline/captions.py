"""Shared (OpenArt pipeline): word-level caption sync: Whisper timings mapped onto the script's own words (so "$66,795" shows as written)."""
import re
import subprocess
import tempfile
from difflib import SequenceMatcher
from pathlib import Path
import soundfile as sf


NUM = {"zero": "0", "one": "1", "two": "2", "three": "3", "four": "4", "five": "5", "six": "6", "seven": "7",
       "eight": "8", "nine": "9", "ten": "10", "twelve": "12", "twenty": "20", "thirty": "30", "hundred": "100"}


def _norm(w):
    w = re.sub(r"[^a-z0-9]", "", w.lower())
    return NUM.get(w, w)


def whisper_words(wav_path):
    """[(word, start, end)] from faster-whisper. Audio goes through ffmpeg (faster-whisper's own decoder breaks on av>=15)."""
    from faster_whisper import WhisperModel
    with tempfile.TemporaryDirectory() as d:
        p16 = Path(d) / "a16.wav"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav_path), "-ar", "16000", "-ac", "1", str(p16)], check=True)
        a, _ = sf.read(str(p16), dtype="float32")
    segs, _ = WhisperModel("base.en", device="cpu", compute_type="int8").transcribe(a, word_timestamps=True)
    return [(w.word.strip(), float(w.start), float(w.end)) for s in segs for w in s.words]


def settle(words):
    """Whisper sometimes returns zero-length or overlapping words: keep every word on screen >= 0.15 s, in order.
    Safe to run again on cached alignments."""
    for i, w in enumerate(words):
        if w["end"] - w["start"] < 0.15:
            w["end"] = round(w["start"] + 0.15, 3)
        if i + 1 < len(words) and words[i + 1]["start"] < w["end"]:
            words[i + 1]["start"] = w["end"]
    return words


def align(lines, line_times, heard):
    """Give every script word a (start, end). Matched words take Whisper times; unmatched runs are spread evenly
    between their matched neighbours inside the line's own TTS span. Returns (words, match_ratio)."""
    words, matched_total, total = [], 0, 0
    for li, (line, span) in enumerate(zip(lines, line_times)):
        script = line["text"].split()
        hw = [h for h in heard if span["start"] - 0.15 <= (h[1] + h[2]) / 2 <= span["end"] + 0.15]
        times = [None] * len(script)
        sm = SequenceMatcher(a=[_norm(w) for w in script], b=[_norm(h[0]) for h in hw], autojunk=False)
        for blk in sm.get_matching_blocks():
            for k in range(blk.size):
                times[blk.a + k] = (hw[blk.b + k][1], hw[blk.b + k][2])
        matched_total += sum(t is not None for t in times)
        total += len(script)
        i = 0
        while i < len(times):  # interpolate gaps
            if times[i] is None:
                j = i
                while j < len(times) and times[j] is None:
                    j += 1
                a = times[i-1][1] if i > 0 else span["start"]
                b = times[j][0] if j < len(times) else span["end"]
                step = max(b - a, 0.05) / (j - i)
                for k in range(i, j):
                    times[k] = (a + (k - i) * step, a + (k - i + 1) * step)
                i = j
            i += 1
        for w, (s, e) in zip(script, times):
            words.append(dict(word=w, start=round(s, 3), end=round(e, 3), line=li,
                              hot=w.strip(".,!?").startswith("*") or any(c.isdigit() for c in w)))
    settle(words)
    for w in words:
        w["word"] = w["word"].replace("*", "")
    return words, (matched_total / total if total else 0)


_ACRO = re.compile(r"^\*?[A-Z]{2,}\*?$")       # e.g. GTA (no trailing punctuation)
_NUM = re.compile(r"^\*?\d+[+]?[.,!?:;]*$")      # e.g. 6, 6., 5+


def _glued(a, b):
    """An acronym followed by its number ("GTA 6") is one name and must stay in the same cue."""
    return a["line"] == b["line"] and _ACRO.match(a["word"]) and _NUM.match(b["word"])


def cues(words, max_chars=16):
    """Group words into one-line cues: never across lines, break after punctuation or when too wide.
    Never split a name like "GTA 6": if the break would fall between them, the acronym moves to the next cue."""
    out, cur = [], []
    for w in words:
        if cur and (w["line"] != cur[-1]["line"] or len(" ".join(x["word"] for x in cur + [w])) > max_chars
                    or cur[-1]["word"][-1] in ".,!?:;") and not (len(cur) == 1 and _glued(cur[0], w)):
            carry = [cur.pop()] if len(cur) > 1 and _glued(cur[-1], w) else []
            out.append(cur)
            cur = carry
        cur.append(w)
    if cur:
        out.append(cur)
    for i, c in enumerate(out):  # hold each cue until the next one starts (no flicker), max 0.6 s past its last word
        nxt = out[i + 1][0]["start"] if i + 1 < len(out) else c[-1]["end"] + 0.6
        c[-1]["hold"] = min(nxt, c[-1]["end"] + 0.6)
    return out




def srt(cue_list, path):
    f = lambda s: f"{int(s//3600):02}:{int(s%3600//60):02}:{int(s%60):02},{int(s*1000%1000):03}"
    Path(path).write_text("\n".join(f"{i+1}\n{f(c[0]['start'])} --> {f(max(c[-1]['hold'], c[0]['start'] + 0.15))}\n{' '.join(w['word'] for w in c)}\n"
                                    for i, c in enumerate(cue_list)), encoding="utf-8")
