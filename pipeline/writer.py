"""Script writer on the Gemini free API (2026-11-24, replaces Claude after the move to the Oracle server).

  python -m pipeline.writer new [<episode-id>] [--format choice|rule|underdog|school]   -> scripts/<id>.v1.json
  python -m pipeline.writer revise <episode-id> "<owner notes>"                         -> scripts/<id>.v(N+1).json
  python -m pipeline.writer prompt                                                      -> print the prompt only (no API call)

Needs GEMINI_API_KEY in .env (free key from Google AI Studio). Optional GEMINI_MODEL (else tries MODELS in order).
The output follows the same script JSON as before, plus per-line "shot" tags for pipeline/autoshots.py.
Every draft is checked by validate(); a failing draft is sent back to Gemini with the problems, up to 3 tries.
"""
import json
import re
import sys
import urllib.request
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
ROOT = Path(__file__).resolve().parent.parent
PHT = ZoneInfo("Asia/Manila")

FORMATS = {  # the format bank (owner 2026-11-24: no per-video competitor research; these already won)
    "choice": ("Choice video", "Ask the viewer to pick 1 of 3 options (rooms, pills, places, doors, powers...). "
               "Options 1 and 2 each have a strong catch. Option 3 sounds perfect; the last line says that to pick option 3 "
               "you have to subscribe and comment which one you chose. 8-9 lines."),
    "rule": ("Rule world", "Starts with 'In this town/world, ...' and a strange rule with a number, counter or visible sign. "
             "A kid gets the 'worst' result, people laugh, then the rule causes a crisis and that kid's 'bad' result saves "
             "everyone. The last line loops back to the first idea. 10-12 lines."),
    "underdog": ("Underdog twist", "A quiet, ignored or laughed-at kid. Small hints of a secret. A public moment reveals "
                 "the secret (kindness, a hidden skill, a sacrifice) and everyone changes. Emotional, warm ending. 10-12 lines."),
    "school": ("Funny school twist", "A strict teacher or school rule. The class obeys too literally and the rule backfires "
               "on the teacher in a smart, funny way. One extra twist at the end. 9-11 lines."),
}
DAILY_MIX = ["rule", "choice", "underdog", "choice", "school", "rule", "underdog"]   # rotates; stories beat choices (owner analytics)
SAFE_TAGS = ["(confident)", "(happy)", "(sad)", "(nervous)", "(worried)", "(soft tone)", "(angry)", "(serious)"]
CAST = ["Hana", "Kaito", "Eli", "Mason", "Lucy", "Leo", "Pia", "Mia", "Zoe", "Jada", "Marcus", "Rex", "Ollie", "Vince", "Gwen", "Noob",
        "Beanie", "Noel", "Baby", "Mom", "Dad", "Grandma", "Grandpa", "Teacher", "Stranger", "Doctor"]
SHOT_SCHEMA = ('{"set": "classroom|hallway|library|house|bedroom|field|forest|city|street|soccer", "time": "day|sunset|night", '
               '"mood": "day|sad|danger|win|cold", "cast": ["focus name", "others..."], '
               '"face": "happy|sad|angry|scared|shocked|surprised|confused|nervous|determined|neutral|sob|laugh|starstruck|worried|smirk|thinking", '
               '"action": "talk|walk|run|jump|cheer|point|sit|cry|shiver|think|shock|wave|hug|still|agree|disagree|pickup|dance|hurt", '
               '"camera": "push|pull|close|eye|ots|low|high|feet|wide|drone|dutch|follow", '
               '"prop": {"type": "sign|screen|cake|stack|pill|number|fire|smoke|crack|wave|cabin|tower|bunker", "text": "short text"}, '
               '"board": "classroom board text", "tag": {"name": "Name", "role": "2-3 words"}, '
               '"trans": "zoom|flash|whip|glitch|cut", "glitch": true}')


def env():
    out = {}
    p = ROOT / ".env"
    if p.exists():
        for line in p.read_text(encoding="utf-8").splitlines():
            if "=" in line and not line.lstrip().startswith("#"):
                k, v = line.split("=", 1)
                out[k.strip()] = v.strip().strip('"').strip("'")
    return out


def recent_titles(n=30):
    ts = []
    for p in sorted((ROOT / "scripts").glob("*.v1.json"))[-n:]:
        try:
            ts.append(json.loads(p.read_text(encoding="utf-8")).get("title_working", ""))
        except Exception:
            pass
    return [t for t in ts if t]


LESSONS = ROOT / "rubrics" / "lessons.md"


def lessons():
    t = LESSONS.read_text(encoding="utf-8") if LESSONS.exists() else ""
    return "\n".join(l for l in t.split("## Lessons", 1)[-1].splitlines() if l.startswith("- "))


def learn(text):
    """Append one lesson (owner revise notes, repeated validator failures) so the next scripts avoid it."""
    text = " ".join(str(text).split())[:300]
    if not text or text in (LESSONS.read_text(encoding="utf-8") if LESSONS.exists() else ""):
        return
    with LESSONS.open("a", encoding="utf-8") as f:
        f.write(f"- {datetime.now(PHT):%Y-%m-%d}: {text}\n")


def prompt(fmt, notes=None, old=None):
    name, how = FORMATS[fmt]
    recent = "\n".join(f"- {t}" for t in recent_titles())
    task = (f"Rewrite this script following the owner's notes: {notes}\nOLD SCRIPT JSON:\n{json.dumps(old, ensure_ascii=False)}"
            if notes else f"Write ONE brand-new original script. Format: {name}. {how}")
    return f"""You write scripts for a YouTube Shorts channel called "Rule World Stories": original Roblox-style animated stories
narrated by one male narrator ("Adam"). Audience: US kids and teens. Target: as many views and subscribers as possible.

{task}

LESSONS FROM PAST MISTAKES (obey every one):
{lessons()}

HARD RULES
- Pure, natural, simple English. 60 to 90 seconds when read aloud (about 200-300 words), up to 2 minutes if the story needs it (owner Rule AE).
- After the twist, SAY it in plain words (e.g. "The boy on the walkie-talkie was my dad."), explain the why, then 3-5 lines of resolution and a clear ending.
- Line 1 is the hook AND the title: a named person + a concrete impossible or strange fact + an open question the viewer
  needs answered (e.g. "Every day at recess, Leo picks the same team. The one with nobody on it."). Never a warning or
  teaser ("Before you...", "Nobody tells you...", "The secret behind...") and never a bare rule lecture.
- Every line follows from the previous one by "so" or "but", never "and then". No coincidences; a 10-year-old can retell it.
- A FAIR plot twist near the end: plant a small clue in lines 2-4 that looks unimportant; the twist uses it to change what
  the beginning meant. Unexpected AND logical. Stakes kids feel (friend, sibling, pet, grandparent, a secret, a promise).
- Never end on a moral or lesson. End on the twist image or a short loop line.
- The ending loops back to line 1 so the Short replays (choice videos end with the subscribe line instead).
- 100% original: do NOT reuse any of these recent titles or their ideas:
{recent}
- No real brands, no real people, no copyrighted characters, nothing scary for kids, no violence or death.
- Characters ONLY from this cast list: {", ".join(CAST)}. Keep the same names through the story.
- Each line has a "say" field = the same text with ONE tag at the start, chosen ONLY from {", ".join(SAFE_TAGS)}.
  Never use (surprised), (excited) or any other tag.
- "hook_text": 2-5 WORDS in CAPS shown on the first frame, a curiosity gap, NOT the title (e.g. "WORST POWER EVER?").
- Each line gets a "shot" object that shows exactly what the line says, using only these values:
  {SHOT_SCHEMA}
  First line usually camera "drone" (outdoor) or "push"; introduce each main character once with "tag"; use "trans" "flash" or
  "glitch" on the twist line; vary cameras (never the same camera 3 lines in a row).

Reply with JSON only, exactly this shape:
{{"title": "...", "hook_text": "...", "music": "drift|bounce|tender", "lines": [{{"text": "...", "say": "(tag) ...", "shot": {{...}}}}],
 "description": "2 short lines for YouTube", "tags": ["8-10 search tags"]}}"""


MODELS = ["gemini-3.8-flash", "gemini-3.5-flash", "gemini-flash-latest", "gemini-3.5-flash-lite"]   # 2026-11-24: 2.5 closed to new users


def ask(text, key, first=None):
    """Try each model in turn: a busy (503), rate-limited (429) or retired (404) model falls through to the next one."""
    import time
    import urllib.error
    last = None
    for m in ([first] if first else []) + [x for x in MODELS if x != first]:
        for wait in (0, 20):
            time.sleep(wait)
            try:
                return call_gemini(text, key, m)
            except urllib.error.HTTPError as e:
                last = f"{m}: HTTP {e.code}"
                if e.code not in (429, 500, 503):
                    break
            except (json.JSONDecodeError, KeyError) as e:
                last = f"{m}: bad reply {e}"
    raise RuntimeError(f"all Gemini models failed (last: {last})")


def call_gemini(text, key, model):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    body = {"contents": [{"role": "user", "parts": [{"text": text}]}],
            "generationConfig": {"temperature": 1.0, "responseMimeType": "application/json"}}
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": key})
    with urllib.request.urlopen(req, timeout=120) as r:
        res = json.load(r)
    return json.loads(res["candidates"][0]["content"]["parts"][0]["text"])


def validate(d, fmt):
    bad = []
    L = d.get("lines") or []
    words = sum(len(l.get("text", "").split()) for l in L)
    if not 10 <= len(L) <= 30:   # owner Rule AE 2026-11-25: 60-90 s, up to 2 min
        bad.append(f"needs 10-30 lines, has {len(L)}")
    if not 180 <= words <= 380:
        bad.append(f"needs 200-330 words, has {words}")
    if not re.fullmatch(r"[A-Z0-9 ?!'.,]{4,40}", d.get("hook_text", "")):
        bad.append("hook_text must be 2-5 words in CAPS")
    for i, l in enumerate(L, 1):
        tag = re.match(r"^\(([a-z ]+)\)\s*", l.get("say", ""))
        if not tag or f"({tag.group(1)})" not in SAFE_TAGS:
            bad.append(f"line {i}: say must start with one tag from {SAFE_TAGS}")
        elif l["say"][tag.end():].strip() != l.get("text", "").strip():
            bad.append(f"line {i}: say must be the tag + exactly the text")
        for n in (l.get("shot") or {}).get("cast", []):
            if n not in CAST:
                bad.append(f"line {i}: unknown cast name {n!r}")
    if d.get("title", "").lower() in (t.lower() for t in recent_titles()):
        bad.append("title already used")
    if fmt == "choice" and "subscribe" not in (L[-1].get("text", "").lower() if L else ""):
        bad.append("choice videos end with the subscribe line")
    return bad


def to_script(ep, d, fmt):
    lines = []
    for l in d["lines"]:
        tag = re.match(r"^\(([a-z ]+)\)", l["say"]).group(0)
        lines.append(dict(text=l["text"].strip(), say=l["say"].strip(), speaker="narrator", speed=0.94, volume=0, pause=0.25,
                          beat="", voice=dict(emotion=tag.strip("()"), tags=tag), shot=l.get("shot") or {}, acting={}))
    lines[0]["volume"] = 2
    wc = sum(len(l["text"].split()) for l in lines)
    return dict(id=ep, version=1, source=f"Gemini writer, format bank: {FORMATS[fmt][0]}", hook_type=dict(number=None, name="format bank"),
                format=dict(number=None, name=FORMATS[fmt][0]), title_working=d["title"].strip(), hook_text=d["hook_text"].strip().upper(),
                hook_until=2.6, music=d.get("music") if d.get("music") in ("drift", "bounce", "tender") else "drift", music_gain=0.13,
                world_rule=d["title"].strip(), lines=lines, word_count=wc, est_seconds=round(wc / 3.4, 1), tail_hold=2.5,
                upload=dict(title=d["title"].strip() + " #Shorts",
                            description=d.get("description", "").strip() + "\nOriginal animated story. Not affiliated with Roblox or any creator.\n#robloxstory #animatedstory #storytime #shorts",
                            tags=(d.get("tags") or [])[:10] + ["animated story", "roblox story"]))


def next_id():
    day = datetime.now(PHT).date() + timedelta(days=2)
    n = 1 + max([int(m.group(1)) for p in (ROOT / "scripts").glob("*-story-*.v1.json") if (m := re.search(r"story-(\d+)", p.name))] or [0])
    return f"{day.isoformat()}-story-{n:02d}"


def write(ep=None, fmt=None, notes=None):
    e = env()
    key = e.get("GEMINI_API_KEY") or sys.exit("GEMINI_API_KEY is missing in .env (free key: aistudio.google.com)")
    model = e.get("GEMINI_MODEL")
    ep = ep or next_id()
    old, ver = None, 1
    if notes:
        vs = sorted((ROOT / "scripts").glob(f"{ep}.v*.json"), key=lambda p: int(re.search(r"\.v(\d+)", p.name).group(1)))
        old = json.loads(vs[-1].read_text(encoding="utf-8"))
        ver = int(re.search(r"\.v(\d+)", vs[-1].name).group(1)) + 1
        fmt = fmt or next((k for k, v in FORMATS.items() if v[0] == old.get("format", {}).get("name")), "rule")
    fmt = fmt or DAILY_MIX[len(list((ROOT / "scripts").glob("*.v1.json"))) % len(DAILY_MIX)]
    p, problems = prompt(fmt, notes, old and {"title": old["title_working"], "lines": [{"text": l["text"], "shot": l.get("shot")} for l in old["lines"]]}), []
    if notes:
        learn(f"Owner revision note ({ep}): {notes}")
    seen = {}
    for attempt in range(3):
        d = ask(p + (f"\n\nYOUR LAST DRAFT FAILED THESE CHECKS, FIX THEM:\n- " + "\n- ".join(problems) if problems else ""), key, model)
        problems = validate(d, fmt)
        for pr in problems:
            k = re.sub(r"\d+", "N", pr)
            seen[k] = seen.get(k, 0) + 1
            if seen[k] == 2:
                learn(f"Check failed twice: {k}")
        if not problems:
            break
    if problems:
        sys.exit("Gemini draft still failing after 3 tries: " + "; ".join(problems))
    sc = to_script(ep, d, fmt)
    sc["version"] = ver
    f = ROOT / "scripts" / f"{ep}.v{ver}.json"
    f.write_text(json.dumps(sc, indent=1, ensure_ascii=False), encoding="utf-8")
    print(f"{ep} v{ver}: {sc['title_working']} ({sc['word_count']} words, ~{sc['est_seconds']} s, {FORMATS[fmt][0]})")
    return ep


if __name__ == "__main__":
    a = sys.argv[1:]
    fmt = a[a.index("--format") + 1] if "--format" in a else None
    if fmt:
        a = [x for x in a if x not in ("--format", fmt)]
    if not a:
        sys.exit(__doc__)
    if a[0] == "prompt":
        print(prompt(fmt or "rule"))
    elif a[0] == "new":
        write(a[1] if len(a) > 1 else None, fmt)
    elif a[0] == "revise" and len(a) >= 3:
        write(a[1], fmt, a[2])
    else:
        sys.exit(__doc__)
