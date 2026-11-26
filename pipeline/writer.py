"""Script writer on the Gemini free API (2026-11-24, replaces Claude after the move to the Oracle server).

  python -m pipeline.writer new [<episode-id>] [--format town|power|monster|mystery|choice|school]   -> scripts/<id>.v1.json
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
from pipeline import story_gate
ROOT = Path(__file__).resolve().parent.parent
PHT = ZoneInfo("Asia/Manila")

FORMATS = {  # the owner's themes (2026-11-26). The writer invents the plot; every example idea must be new.
    "town": ("Strange town law", "Starts with 'In this town, ...' and a new, funny or strange LAW with a clear sign or penalty (never "
             "jail-for-life or anything cruel). Characters: a Mayor who made the law, an Officer who enforces it, and a kid who "
             "gets in trouble. The kid finds the Mayor's secret in a hidden place (vault, bunker or lab); the twist shows why the "
             "law really exists and turns it against the Mayor. Sets: town, city, police, vault, lab, bunker, shop. 11-13 lines."),
    "power": ("Special power world", "Starts with 'In this world, ...': everyone gets one special power or visible sign. A kid gets "
              "the one everybody calls useless, gets laughed at, then a crisis happens that only that power can solve, in a way "
              "planted early. Sets: city, town, street, rooftop, lab, hospital. 11-13 lines."),
    "monster": ("Monster world", "Starts with 'In this world, ...': when someone does ONE specific thing or feels ONE feeling (anger, "
                "jealousy, lying, greed...), they turn into a monster. A character holds it in, then it happens at a big moment. "
                "Monsters look wild but NEVER hurt anyone; what turns them back is something warm and specific that was planted "
                "early (a song, a keepsake, an honest sentence). Turning into a monster IS the one rule in line 1 (never a second "
                "magic such as shrinking things or numbers). Include a surprising twist about who else is secretly a monster or why. Mark monster form with shot \"monster\" on EVERY line where that character is a monster "
                "(and put them first in cast on the line where they change). Do not set it in a school: use town, street, house, forest, "
                "rooftop, cave or shop. 11-13 lines."),
    "mystery": ("Mystery adventure", "A kid finds one impossible thing (a door, a map, a message, a sound) that appears again and "
                "again. Each clue leads somewhere new (forest, cave, rooftop, bunker, lab, library). The last place reveals a "
                "twist that changes what the first clue meant. Exciting, not scary. 11-13 lines."),
    "choice": ("Pick one", "Ask the viewer to pick 1 of 3 options (doors, rooms, pills, places, powers...). Show each one in a "
               "different set. Options 1 and 2 each have a strong catch. Option 3 sounds perfect; the last line says that to pick "
               "option 3 you have to subscribe and comment which one you chose. 10-11 lines."),
    "school": ("School twist", "A strange school rule or a quiet classmate with a secret, with a smart, funny or warm twist. 11-12 lines."),
}
DAILY_MIX = ["town", "monster", "power", "mystery", "town", "choice", "monster", "power", "school"]   # owner 2026-11-26: school only 1 in 9
SHOT_SETS = ["town", "city", "street", "house", "bedroom", "police", "hospital", "shop", "vault", "lab", "bunker", "rooftop", "cave",
             "forest", "field", "soccer", "library", "classroom", "hallway"]
SHOT_ACTIONS = ["talk", "walk", "run", "jump", "cheer", "point", "sit", "cry", "shiver", "think", "shock", "wave", "hug", "still",
                "agree", "disagree", "pickup", "dance", "hurt"]
MAX_DRAFTS, FRESH_AT = 5, 4
SKILL = Path(__file__).resolve().parent.parent / "rubrics" / "script-skill.md"
SAFE_TAGS = ["(confident)", "(happy)", "(sad)", "(nervous)", "(worried)", "(soft tone)", "(angry)", "(serious)"]
CAST = ["Hana", "Kaito", "Eli", "Mason", "Lucy", "Leo", "Pia", "Mia", "Zoe", "Jada", "Marcus", "Rex", "Ollie", "Vince", "Gwen", "Noob",
        "Beanie", "Noel", "Baby", "Mom", "Dad", "Grandma", "Grandpa", "Teacher", "Stranger", "Doctor", "Mayor", "Officer"]
SHOT_SCHEMA = ('{"set": "town|city|street|house|bedroom|police|hospital|shop|vault|lab|bunker|rooftop|cave|forest|field|soccer|library|classroom|hallway", "time": "day|sunset|night", '
               '"mood": "day|sad|danger|win|cold", "cast": ["focus name", "others..."], '
               '"face": "happy|sad|angry|scared|shocked|surprised|confused|nervous|determined|neutral|sob|laugh|starstruck|worried|smirk|thinking", '
               '"action": "talk|walk|run|jump|cheer|point|sit|cry|shiver|think|shock|wave|hug|still|agree|disagree|pickup|dance|hurt", '
               '"camera": "push|pull|close|eye|ots|low|high|feet|wide|drone|dutch|follow", '
               '"prop": {"type": "sign|screen|cake|stack|pill|number|fire|smoke|crack|wave|cabin|tower|bunker", "text": "short text"}, '
               '"board": "classroom board text", "monster": ["names who are in monster form on this line"], "trans": "zoom|flash|whip|cut"}')


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

THE SCRIPT SKILL (follow every part; drafts that break it are rejected):
{SKILL.read_text(encoding="utf-8")}

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
- ACTING (most important for the video): every line needs a strong, SPECIFIC "face" that matches its feeling and an "action"
  that shows it (cry, shock, point, run, hug, cheer, think, shiver, hurt, pickup...). Do not use "neutral" or "talk" on more
  than 2 lines. "cast": who is on screen, the one who feels or acts FIRST; add the second person whose reaction we see.
- WORLD: use at least 3 different "set" values and change place at big story moments. Use "mood": "danger" (dark storm look)
  only for the crisis or twist, "sad" and "win" where they fit. Give a "prop" to 3-5 lines to SHOW the key object or rule
  (sign/screen text of 1-2 words, a number, cake, stack, fire...). No prop on the other lines. A prop text must name a thing
  in the story, never a stage note.
- Tell the whole story in THIRD person. Never switch to "I", "me" or "my" outside a short quoted line of dialogue.
- No contradictions (an "empty" bag cannot be heavy; a monster cannot be a giant giant). Read it back and fix them.
- The animation cannot show small hand-held objects (backpacks, hats, keys, photos). Build the story on what it CAN show:
  faces, monsters, places, people, and the listed props. A small keepsake may be mentioned only if the line's prop is a "sign" or "screen".
- ONE rule only. The rule in line 1 is the ONLY magic in the whole story; everything that happens comes from it. Never add a
  second rule, power or curse later.
- First line usually camera "drone" or "push"; use "trans" "flash" on the twist line.

- "emotions": for EVERY name in shot.cast give one face from: {", ".join(story_gate.FACES)}.
- "beat": one of {", ".join(story_gate.BEATS)}. "scene": one full sentence of what we see.
- Exactly one character in story.characters has the role "hero". EVERY name that appears in any shot.cast must be listed in story.characters.
- PLACES, count them before answering: no single "set" on more than 6 lines. Unless this is a School twist, use classroom/hallway/library
  on 3 lines at most; set the story in town, city, street, house, bedroom, forest, rooftop, shop, cave, lab, vault or police instead.

Reply with JSON only, exactly this shape:
{{"title": "...", "hook_text": "...", "music": "drift",
 "story": {{"theme_rule": "...", "logline": "...", "characters": [{{"name": "...", "role": "hero", "want": "...", "personality": "..."}}],
           "clue": {{"line": 3, "text": "..."}}, "twist": {{"line": 9, "text": "..."}}, "ending": "..."}},
 "lines": [{{"beat": "hook", "text": "...", "say": "(tag) ...", "scene": "...", "emotions": {{"Name": "worried"}}, "shot": {{...}}}}],
 "description": "2 short lines for YouTube", "tags": ["8-10 search tags"]}}"""


MODELS = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-3-flash-preview", "gemini-flash-latest",
          "gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-flash-lite-latest"]   # 2026-11-26: free tier = 20 requests/day on each bigger model, so keep many


def ask(text, key, first=None, temperature=1.0):
    """Try each model in turn: a busy (503), rate-limited (429) or retired (404) model falls through to the next one."""
    import time
    import urllib.error
    last = None
    for rnd in (0, 60, 180):   # whole-list retries: Gemini's free tier is often busy for a few minutes (503 on every model)
        time.sleep(rnd)
        for m in ([first] if first else []) + [x for x in MODELS if x != first]:
            for wait in (0, 20):
                time.sleep(wait)
                try:
                    return call_gemini(text, key, m, temperature)
                except urllib.error.HTTPError as e:
                    last = f"{m}: HTTP {e.code}"
                    print("  gemini", last, flush=True)
                    if e.code not in (500, 503):
                        break
                except (json.JSONDecodeError, KeyError) as e:
                    last = f"{m}: bad reply {e}"
                    print("  gemini", last, flush=True)
                except (TimeoutError, OSError) as e:   # a slow or dropped connection: try again, then the next model
                    last = f"{m}: {type(e).__name__}"
    raise RuntimeError(f"all Gemini models failed (last: {last})")


def parse_json(text):
    """Models sometimes add ``` fences or a trailing comma; fix those before giving up on a reply."""
    t = re.sub(r"^\s*```(?:json)?|```\s*$", "", text.strip()).strip()
    try:
        return json.loads(t, strict=False)
    except json.JSONDecodeError:
        return json.loads(re.sub(r",(\s*[}\]])", r"\1", t[t.find("{"):t.rfind("}") + 1]), strict=False)


def call_gemini(text, key, model, temperature=1.0):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    body = {"contents": [{"role": "user", "parts": [{"text": text}]}],
            "generationConfig": {"temperature": temperature, "responseMimeType": "application/json"}}
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": key})
    with urllib.request.urlopen(req, timeout=120) as r:
        res = json.load(r)
    return parse_json(res["candidates"][0]["content"]["parts"][0]["text"])


FEEL_TAG = {"happy": "(happy)", "laugh": "(happy)", "starstruck": "(happy)", "sad": "(sad)", "sob": "(sad)", "scared": "(nervous)",
            "nervous": "(nervous)", "shocked": "(worried)", "surprised": "(worried)", "worried": "(worried)", "confused": "(worried)",
            "angry": "(angry)", "determined": "(confident)", "smirk": "(confident)", "thinking": "(soft tone)", "neutral": "(serious)"}
SET_ALIAS = {"school": "hallway", "home": "house", "living room": "house", "kitchen": "house", "room": "bedroom", "attic": "bunker",
             "basement": "bunker", "tunnel": "cave", "park": "field", "garden": "field", "playground": "field", "woods": "forest",
             "police station": "police", "city hall": "town", "town square": "town", "plaza": "town", "market": "shop", "store": "shop",
             "bank": "vault", "roof": "rooftop", "laboratory": "lab", "gym": "soccer", "cafeteria": "classroom", "office": "police"}
ACTION_ALIAS = {"show": "point", "look": "think", "stare": "shock", "smile": "talk", "speak": "talk", "whisper": "talk", "shout": "talk",
                "scream": "shock", "laugh": "cheer", "celebrate": "cheer", "stand": "still", "idle": "still", "hide": "shiver",
                "sing": "talk", "transform": "hurt", "fall": "hurt", "nod": "agree", "shake": "disagree", "kneel": "pickup", "sneak": "walk"}


BEAT_ALIAS = {"inciting incident": "consequence", "context": "setup", "rising action": "escalation", "conflict": "escalation", "complication": "escalation",
              "obstacle": "escalation", "crisis": "escalation", "climax": "choice", "decision": "choice", "reveal": "twist", "payoff": "resolution",
              "reaction": "escalation", "clue": "setup", "development": "escalation", "outro": "ending", "loop": "ending", "conclusion": "ending"}


def tidy(d):
    """Fix format slips in code (voice tag, near-miss place/action names, faces) so a good story is not thrown away for them."""
    for l in d.get("lines") or []:
        shot = l["shot"] = l.get("shot") if isinstance(l.get("shot"), dict) else {}
        for key, allowed, alias in (("set", SHOT_SETS, SET_ALIAS), ("action", SHOT_ACTIONS, ACTION_ALIAS)):
            v = str(shot.get(key, "")).strip().lower()
            v = alias.get(v, v)
            shot[key] = v if v in allowed else ("talk" if key == "action" else shot.get(key))
        names = {c.lower(): c for c in CAST}
        shot["cast"] = list(dict.fromkeys(names.get(str(n).lower(), n) for n in shot.get("cast") or []))[:5]
        feel = {names.get(str(k).lower(), k): str(v).lower() for k, v in (l.get("emotions") or {}).items()} if isinstance(l.get("emotions"), dict) else {}
        lead = shot["cast"][0] if shot["cast"] else None
        if lead and feel.get(lead) not in story_gate.FACES and shot.get("face") in story_gate.FACES:
            feel[lead] = shot["face"]
        l["emotions"] = {n: feel[n] for n in shot["cast"] if n in feel}
        beat = str(l.get("beat", "")).strip().lower()
        l["beat"] = BEAT_ALIAS.get(beat, beat if beat in story_gate.BEATS else "escalation")
        text = str(l.get("text", "")).strip()
        tag = re.match(r"^\(([a-z ]+)\)", str(l.get("say", "")))
        tag = tag.group(0) if tag and tag.group(0) in SAFE_TAGS else FEEL_TAG.get(l["emotions"].get(lead), "(serious)")
        l["text"], l["say"] = text, f"{tag} {text}"
    d["hook_text"] = re.sub(r"[^A-Z0-9 ?!'.,]", "", str(d.get("hook_text", "")).upper().replace("\u2019", "'"))[:40].strip()
    return d


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
        shot = l.get("shot") or {}
        if shot.get("set") not in SHOT_SETS:
            bad.append(f"line {i}: shot set must be one of {SHOT_SETS}, not {shot.get('set')!r}")
        if shot.get("action") not in SHOT_ACTIONS:
            bad.append(f"line {i}: shot action must be one of {SHOT_ACTIONS}, not {shot.get('action')!r}")
        for n in shot.get("cast", []):
            if n not in CAST:
                bad.append(f"line {i}: unknown cast name {n!r}")
    if d.get("title", "").lower() in (t.lower() for t in recent_titles()):
        bad.append("title already used")
    if fmt == "choice" and "subscribe" not in (L[-1].get("text", "").lower() if L else ""):
        bad.append("choice videos end with the subscribe line")
    return bad + story_gate.check(d, fmt, CAST)


def to_script(ep, d, fmt):
    lines = []
    for l in d["lines"]:
        tag = re.match(r"^\(([a-z ]+)\)", l["say"]).group(0)
        lines.append(dict(text=l["text"].strip(), say=l["say"].strip(), speaker="narrator", speed=0.94, volume=0, pause=0.25,
                          beat=l.get("beat", ""), scene=l.get("scene", ""), emotions=l.get("emotions") or {},
                          voice=dict(emotion=tag.strip("()"), tags=tag), acting={},
                          shot={**(l.get("shot") or {}), "faces": l.get("emotions") or {},
                                "face": (l.get("emotions") or {}).get(((l.get("shot") or {}).get("cast") or [""])[0], (l.get("shot") or {}).get("face"))}))
    lines[0]["volume"] = 2
    wc = sum(len(l["text"].split()) for l in lines)
    return dict(id=ep, version=1, story=d.get("story") or {}, source=f"Gemini writer, format bank: {FORMATS[fmt][0]}", hook_type=dict(number=None, name="format bank"),
                format=dict(number=None, name=FORMATS[fmt][0]), title_working=d["title"].strip(), hook_text=d["hook_text"].strip().upper(),
                hook_until=2.6, music="drift", music_gain=0.3,
                world_rule=d["title"].strip(), lines=lines, word_count=wc, est_seconds=round(wc / 3.4, 1), tail_hold=2.5,
                upload=dict(title=d["title"].strip() + " #Shorts",
                            description=d.get("description", "").strip() + "\nOriginal animated story. Not affiliated with Roblox or any creator.\n#robloxstory #animatedstory #storytime #shorts",
                            tags=(d.get("tags") or [])[:10] + ["animated story", "roblox story"]))


def _plain(s):
    return " ".join(re.sub(r"[^a-z0-9 ]", " ", s.lower().replace("’", "'").replace("'", "")).split())


def owner_checks(d, source, strict_words):
    """Only what the video needs. The story itself is the owner's: it is never rejected, and their words are never changed."""
    bad, L, src = [], d.get("lines") or [], _plain(source)
    if not 3 <= len(L) <= 60:
        bad.append(f"needs 3 to 60 lines, has {len(L)}")
    if sum(len(l.get("text", "").split()) for l in L) > 700:
        bad.append("the script is longer than about 3.5 minutes (700 words)")
    at = 0
    for i, l in enumerate(L, 1):
        if not str(l.get("text", "")).strip():
            bad.append(f"line {i}: empty text")
        elif strict_words:
            j = src.find(_plain(l["text"]), at)
            if j < 0:
                bad.append(f"line {i}: text must be copied word for word, in order, from the owner's script: {l['text'][:60]!r}")
            else:
                at = j + len(_plain(l["text"]))
        shot = l.get("shot") or {}
        if shot.get("set") not in SHOT_SETS:
            bad.append(f"line {i}: shot set must be one of {SHOT_SETS}")
        if shot.get("action") not in SHOT_ACTIONS:
            bad.append(f"line {i}: shot action must be one of {SHOT_ACTIONS}")
        if not shot.get("cast"):
            bad.append(f"line {i}: shot.cast is empty")
        for n in shot.get("cast", []):
            if n not in CAST:
                bad.append(f"line {i}: {n!r} is not in the cast list; map the owner's character to a cast name")
            elif (l.get("emotions") or {}).get(n) not in story_gate.FACES:
                bad.append(f"line {i}: emotions must give {n} one of {story_gate.FACES}")
    return bad


def from_owner(text, ep=None, notes=None, ver=1):
    """The owner sends their own script (any layout). Gemini only turns it into scenes; the spoken words stay theirs."""
    e = env()
    key = e.get("GEMINI_API_KEY") or sys.exit("GEMINI_API_KEY is missing in .env (free key: aistudio.google.com)")
    ep, text = ep or next_id(), text.strip()[:9000]
    change = (f"\nThe owner now asks for these changes (apply them, and keep every other spoken word as it is):\n{notes}\n" if notes else "")
    p = f"""Turn the owner's own script into the JSON that our animation uses. The script is the OWNER'S: do NOT rewrite, improve,
translate, shorten or add to the story. Each "text" is the narration copied WORD FOR WORD and in order from the script.
Leave out only things that are not meant to be spoken (titles, scene headings, character lists, stage notes, emotion labels);
use those notes to choose the shot, the emotions and the scene. If a character speaks, keep their words in the text.
Split long paragraphs into lines of one or two sentences (one scene each).
{change}
THE OWNER'S SCRIPT:
<<<
{text}
>>>

Characters on screen must use these cast names: {", ".join(CAST)}. If the owner's characters have other names, pick one fitting
cast name for each, use it everywhere in shot.cast and emotions, and list the choice in story.characters as
{{"name": "<cast name>", "role": "<owner's character name and role; mark the main one 'hero'>", "want": "...", "personality": "..."}}.
The spoken text keeps the owner's names.

For each line give "beat" (one of {", ".join(story_gate.BEATS)}), "scene" (one sentence of what we see), "emotions" (every name in
shot.cast -> one of {", ".join(story_gate.FACES)}), "say" (one tag from {", ".join(SAFE_TAGS)} + the same text) and "shot" using only:
{SHOT_SCHEMA}
Use a prop on at most 6 lines. Mark "monster" only if the script says someone is a monster.
"title": the owner's title if there is one, else a short one from line 1 (under 90 characters). "hook_text": 2-5 words in CAPS.

Reply with JSON only:
{{"title": "...", "hook_text": "...", "story": {{"theme_rule": "...", "logline": "...", "characters": [], "clue": {{"line": 0, "text": ""}},
 "twist": {{"line": 0, "text": ""}}, "ending": "..."}}, "lines": [...], "description": "2 short lines for YouTube", "tags": ["8-10 tags"]}}"""
    problems, last = [], None
    for attempt in range(1, 5):
        d = ask(p + (("\n\nFIX THESE PROBLEMS IN YOUR LAST ANSWER:\n- " + "\n- ".join(problems[:25]) + "\nLAST ANSWER:\n" + json.dumps(last, ensure_ascii=False)) if problems else ""),
                key, e.get("GEMINI_MODEL"), temperature=0.3)
        last = d
        for l in d.get("lines") or []:           # the voice tag is ours; the words are never taken from "say"
            tag = re.match(r"^\(([a-z ]+)\)", str(l.get("say", "")))
            tag = tag.group(0) if tag and tag.group(0) in SAFE_TAGS else "(serious)"
            l["say"] = f"{tag} {str(l.get('text', '')).strip()}"
        problems = owner_checks(d, text, strict_words=not notes)
        print(f"owner script, pass {attempt}: {len(problems)} problem(s)")
        if not problems:
            break
    if problems:
        raise RuntimeError("could not turn your script into scenes: " + "; ".join(problems[:4]))
    d["title"] = str(d.get("title") or d["lines"][0]["text"])[:90]
    d["hook_text"] = re.sub(r"[^A-Z0-9 ?!'.,]", "", str(d.get("hook_text", "")).upper())[:40]
    sc = to_script(ep, d, "town")
    sc.update(version=ver, source="Owner's own script", format=dict(number=None, name="Your script"), owner_text=text, review=None)
    try:   # advice only: the owner decides
        sc["review"] = story_gate.review(d, lambda q: ask(q, key, e.get("GEMINI_MODEL"), temperature=0.2))[0]
    except Exception as err:
        print("editor advice skipped:", err)
    f = ROOT / "scripts" / f"{ep}.v{ver}.json"
    f.write_text(json.dumps(sc, indent=1, ensure_ascii=False), encoding="utf-8")
    print(f"{ep} v{ver}: {sc['title_working']} (your script, {sc['word_count']} words, ~{sc['est_seconds']} s)")
    return ep


def next_id():
    day = datetime.now(PHT).date() + timedelta(days=2)
    n = 1 + max([int(m.group(1)) for p in (ROOT / "scripts").glob("*-story-*.v1.json") if (m := re.search(r"story-(\d+)", p.name))] or [0])
    return f"{day.isoformat()}-story-{n:02d}"


def write(ep=None, fmt=None, notes=None, idea=None):
    e = env()
    key = e.get("GEMINI_API_KEY") or sys.exit("GEMINI_API_KEY is missing in .env (free key: aistudio.google.com)")
    model = e.get("GEMINI_MODEL")
    ep = ep or next_id()
    old, ver = None, 1
    if notes:
        vs = sorted((ROOT / "scripts").glob(f"{ep}.v*.json"), key=lambda p: int(re.search(r"\.v(\d+)", p.name).group(1)))
        old = json.loads(vs[-1].read_text(encoding="utf-8"))
        ver = int(re.search(r"\.v(\d+)", vs[-1].name).group(1)) + 1
        if old.get("owner_text"):          # their own script: apply the notes to their words, no story gate
            return from_owner(old["owner_text"], ep, notes, ver)
        fmt = fmt or next((k for k, v in FORMATS.items() if v[0] == old.get("format", {}).get("name")), "town")
    fmt = fmt or DAILY_MIX[len(list((ROOT / "scripts").glob("*.v1.json"))) % len(DAILY_MIX)]
    p, problems = prompt(fmt, notes, old and {"title": old["title_working"], "lines": [{"text": l["text"], "shot": l.get("shot")} for l in old["lines"]]}), []
    if notes:
        learn(f"Owner revision note ({ep}): {notes}")
    if idea:
        p += f"\n\nTHE OWNER'S IDEA (build this story from it, following every rule above):\n{idea[:3000]}"
    seen, review, best = {}, None, None
    for attempt in range(1, MAX_DRAFTS + 1):
        fresh = attempt == FRESH_AT and not notes        # still failing: throw the idea away and start a new one
        if fresh:
            problems, last = [], None
        feedback = ""
        if problems:
            feedback = ("\n\nYOUR LAST DRAFT WAS REJECTED. Fix every point. If the plot itself is weak, change the plot.\n- "
                        + "\n- ".join(problems) + (f"\nREJECTED DRAFT:\n{json.dumps(last, ensure_ascii=False)}" if last else ""))
        d = tidy(ask(p + feedback, key, model))
        last = d
        problems = validate(d, fmt)
        print(f"draft {attempt}: {d.get('title', '?')!r}: {len(problems)} rule break(s)")
        for pr in problems[:8]:
            print("    -", pr[:230])
        if not problems:
            review, problems, passed = story_gate.review(d, lambda q: ask(q, key, model, temperature=0.2))
            print(f"draft {attempt}: story editor {review['average']}/10, lowest {min(review['scores'].values()):.0f} -> {'PASS' if passed else 'REJECTED'}")
            if best is None or review["average"] > best:
                best = review["average"]
            if passed:
                problems = []
                break
        for pr in problems:
            k = re.sub(r"\d+", "N", pr)
            if not k.startswith(("story editor", "line N: problem")) and len(k) < 200:
                seen[k] = seen.get(k, 0) + 1
                if seen[k] == 3:
                    learn(f"Check failed again and again: {k}")
    if problems:
        raise RuntimeError(f"no script was good enough after {MAX_DRAFTS} drafts (best editor score: {best or 'none reached the editor'}), "
                           "so no video was made. Last reasons: " + "; ".join(problems[:4]))
    sc = to_script(ep, d, fmt)
    sc["version"] = ver
    sc["review"] = review
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
    if a[0] == "owner" and len(a) >= 2:      # python -m pipeline.writer owner <textfile> [<episode-id>]
        from_owner(Path(a[1]).read_text(encoding="utf-8"), a[2] if len(a) > 2 else None)
    elif a[0] == "prompt":
        print(prompt(fmt or "town"))
    elif a[0] == "new":
        write(a[1] if len(a) > 1 else None, fmt)
    elif a[0] == "revise" and len(a) >= 3:
        write(a[1], fmt, a[2])
    else:
        sys.exit(__doc__)
