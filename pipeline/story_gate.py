"""Strict script gate (owner 2026-11-26): hard checks in code + a separate "story editor" review. See rubrics/script-skill.md.

check(d, fmt, cast)      -> list of rule breaks found by code (structure, characters, emotions, scenes, places, props...)
review(d, ask)           -> (scores, problems, passed): a second Gemini call that judges the plot like a harsh editor
sheet(script)            -> the readable script sheet sent to the owner in Telegram
"""
import json
import re

BEATS = ["hook", "setup", "goal", "consequence", "escalation", "choice", "twist", "explanation", "resolution", "ending"]
FACES = ["happy", "sad", "angry", "scared", "shocked", "surprised", "confused", "nervous", "determined", "neutral",
         "sob", "laugh", "starstruck", "worried", "smirk", "thinking"]
SCORES = ["hook", "clarity", "one_rule", "cause_and_effect", "hero_drives_story", "twist", "ending", "emotion", "originality", "can_be_animated"]
MIN_EACH, MIN_AVG = 7, 8.0
BAD_OPENERS = ("before you", "nobody tells you", "no one tells you", "the secret behind", "hey ", "have you ever", "imagine ")


def check(d, fmt, cast):
    bad = []
    L = d.get("lines") or []
    st = d.get("story") or {}
    n = len(L)
    if not L:
        return ["no lines"]
    for k in ("theme_rule", "logline", "clue", "twist", "ending"):
        if len(str((st.get(k) or {}).get("text", "") if isinstance(st.get(k), dict) else st.get(k) or "").split()) < 4:
            bad.append(f'story.{k} is missing or too short')
    people = {c.get("name"): c for c in st.get("characters") or [] if isinstance(c, dict)}
    if not 2 <= len(people) <= 5:
        bad.append("story.characters needs 2 to 4 characters (5 at most)")
    for name, c in people.items():
        if name not in cast:
            bad.append(f"story.characters: {name!r} is not in the cast list")
        for k in ("role", "want", "personality"):
            if not str(c.get(k, "")).strip():
                bad.append(f"story.characters: {name} has no {k}")
    beats = []
    for i, l in enumerate(L, 1):
        beat = l.get("beat")
        beats.append(beat)
        if beat not in BEATS:
            bad.append(f"line {i}: beat must be one of {BEATS}")
        if len(str(l.get("scene", "")).split()) < 6:
            bad.append(f"line {i}: scene must say in a full sentence what we see (who, where, doing what)")
        shot = l.get("shot") or {}
        on = shot.get("cast") or []
        feel = l.get("emotions") or {}
        if not on:
            bad.append(f"line {i}: shot.cast is empty")
        for name in on:
            if name not in people:
                bad.append(f"line {i}: {name!r} is on screen but not in story.characters")
            if feel.get(name) not in FACES:
                bad.append(f"line {i}: emotions must give {name} one of {FACES}")
        for name in shot.get("monster") or []:
            if name not in on:
                bad.append(f"line {i}: monster {name!r} must also be in shot.cast")
    if beats[0] != "hook":
        bad.append("line 1 must be the hook beat")
    for need in ("setup", "goal", "consequence", "escalation", "choice", "twist", "explanation", "resolution"):
        if need not in beats:
            bad.append(f"missing the '{need}' beat")
    order = [BEATS.index(b) for b in beats if b in BEATS]
    if "twist" in beats:
        t = beats.index("twist")
        if t < n * 0.55:
            bad.append("the twist comes too early: it belongs in the last 45% of the story")
        if sum(b in ("explanation", "resolution", "ending") for b in beats[t + 1:]) < 3:
            bad.append("after the twist, explain it and resolve it in at least 3 lines")
    if order and order != sorted(order):
        jumps = sum(1 for a, b in zip(order, order[1:]) if b < a and not (a, b) == (BEATS.index("escalation"), BEATS.index("consequence")))
        if jumps > 1:
            bad.append("beats are out of order")
    clue = st.get("clue") if isinstance(st.get("clue"), dict) else {}
    if not 2 <= int(clue.get("line") or 0) <= 5:
        bad.append("story.clue must be an object with line 2-5 and text")
    if people:
        hero = next((nm for nm, c in people.items() if "hero" in str(c.get("role", "")).lower()), None)
        if not hero:
            bad.append("exactly one character must have the role 'hero'")
        elif sum(hero in ((l.get("shot") or {}).get("cast") or []) for l in L) < 0.6 * n:
            bad.append(f"the hero {hero} must be on screen in most lines")
    for i, l in enumerate(L, 1):
        plain = re.sub(r"[\"“”'‘’][^\"“”]{0,160}?[\"“”'‘’](?=\W|$)", " ", l.get("text", "")) if re.search(r"[\"“”]", l.get("text", "")) else l.get("text", "")
        if re.search(r"(?<![\w'])(I|my|My|me|I'm|I've)(?![\w'])", plain):
            bad.append(f"line {i}: tell it in third person (no I / my / me outside a quoted line)")
    if L[0].get("text", "").lower().startswith(BAD_OPENERS):
        bad.append("line 1 uses a banned opener")
    sets = [(l.get("shot") or {}).get("set") for l in L]
    if len(set(sets)) < 3:
        bad.append("use at least 3 different places")
    top = max(set(sets), key=sets.count)
    if sets.count(top) > 0.65 * n:
        bad.append(f"too many lines in one place ({top}): move the story")
    school = sum(s in ("classroom", "hallway", "library") for s in sets)
    if school > 0.35 * n and fmt != "school":
        bad.append(f"this is not a school story: classroom/hallway/library on at most {int(0.35 * n)} lines (now {school}); move scenes to town, street, house, forest, rooftop, shop, cave...")
    props = [l for l in L if isinstance((l.get("shot") or {}).get("prop"), dict) and l["shot"]["prop"].get("type")]
    if not 2 <= len(props) <= 6:
        bad.append(f"use a prop on 3 to 5 lines (now {len(props)})")
    main = [(l.get("emotions") or {}).get(((l.get("shot") or {}).get("cast") or [""])[0]) for l in L]
    if main.count("neutral") > 2:
        bad.append("too many neutral faces")
    if len(set(main)) < 5:
        bad.append("the emotions barely change: use at least 5 different feelings across the story")
    if fmt == "monster" and sum(bool((l.get("shot") or {}).get("monster")) for l in L) < 3:
        bad.append('monster story: mark shot "monster" on at least 3 lines')
    return bad


def review(d, ask):
    """ask(prompt) -> parsed JSON. The pass decision is made here from the scores, not by the model."""
    story = {"title": d.get("title"), "story": d.get("story"),
             "lines": [{"n": i, "beat": l.get("beat"), "text": l.get("text"), "scene": l.get("scene")} for i, l in enumerate(d.get("lines") or [], 1)]}
    p = f"""You are a harsh, experienced story editor for a children's YouTube Shorts channel. Your job is to REJECT weak stories.
Most first drafts deserve 4 to 6. Give 8 or more only when it is truly good. Judge only what the LINES actually say.

Score each from 0 to 10:
hook (line 1 makes a viewer need the answer), clarity (a 10-year-old can retell it after one listen; nothing confusing),
one_rule (only one rule/magic from start to end, used consistently), cause_and_effect (every event follows from the last; no
coincidence, no contradiction, no logic hole), hero_drives_story (the hero wants something, can lose something, and solves it by
their own choice), twist (surprising AND set up by a clue AND it makes sense), ending (resolves the story clearly, no lecture),
emotion (we care; feelings are earned), originality (not a tired or copied premise), can_be_animated (works with only
characters, faces, places, monsters and big props; does not depend on small objects or on things that cannot be seen).

List every concrete problem with its line number and how to fix it.

STORY:
{json.dumps(story, ensure_ascii=False)}

Reply with JSON only: {{"scores": {{{", ".join(f'"{s}": 0' for s in SCORES)}}}, "problems": ["line N: problem -> fix"]}}"""
    r = ask(p)
    scores = {s: float((r.get("scores") or {}).get(s, 0)) for s in SCORES}
    avg = sum(scores.values()) / len(scores)
    passed = min(scores.values()) >= MIN_EACH and avg >= MIN_AVG
    problems = [str(x) for x in r.get("problems") or []][:12]
    if not passed:
        low = [f"{k} scored {v:.0f}" for k, v in scores.items() if v < max(MIN_EACH, 8)]
        problems = [f"story editor: {', '.join(low)} (average {avg:.1f}, needs {MIN_AVG})"] + problems
    return dict(scores=scores, average=round(avg, 1)), problems, passed


def sheet(sc):
    """Readable script sheet for the owner: story plan, characters, then every line with place, feelings and scene."""
    st = sc.get("story") or {}
    txt = lambda v: v.get("text", "") if isinstance(v, dict) else (v or "")
    out = [f"📝 SCRIPT: {sc.get('title_working', '')}", f"Theme: {sc.get('format', {}).get('name', '')}"]
    if sc.get("review"):
        out.append(f"Story editor score: {sc['review']['average']}/10")
    if st:
        out += ["", f"Rule: {txt(st.get('theme_rule'))}", f"Story: {txt(st.get('logline'))}", "", "CHARACTERS"]
        out += [f"• {c.get('name')} ({c.get('role')}, {c.get('personality')}): wants {c.get('want')}" for c in st.get("characters") or []]
        out += ["", f"Clue: {txt(st.get('clue'))}", f"Twist: {txt(st.get('twist'))}", f"Ending: {txt(st.get('ending'))}"]
    out += ["", "SCENES"]
    for i, l in enumerate(sc.get("lines") or [], 1):
        sh = l.get("shot") or {}
        feel = ", ".join(f"{k}: {v}{' (monster)' if k in (sh.get('monster') or []) else ''}" for k, v in (l.get("emotions") or {}).items())
        out += [f"{i}. [{l.get('beat') or '-'} | {sh.get('set', '-')}] {l.get('text', '')}", f"    👀 {l.get('scene', '-')}", f"    🎭 {feel or '-'}"]
    return "\n".join(out)
