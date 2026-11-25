"""Template shots (2026-11-24, cloud migration): turn a script's per-line "shot" tags into output/<id>/shotspec.json,
so a new episode needs no hand-written render/specs/<id>.mjs (no Claude after the move to the Oracle server).

  python -m pipeline.autoshots <episode-id>

Each script line may carry  "shot": {
   "set":    classroom | hallway | library | house | bedroom | field | forest | city | street | soccer   (default: previous line's set, else field)
   "time":   day | sunset | night                                               (default day)
   "mood":   day | sad | danger | win | cold                                     (colour only; no blur, Rule AA)
   "cast":   ["Eli", "Mom", ...]   names from CAST below; the first is the focus (default: previous line's cast)
   "face":   happy | sad | angry | scared | shocked | surprised | confused | nervous | determined | neutral |
             sob | laugh | starstruck | worried | smirk | thinking                (focus face; others stay neutral/happy)
   "action": talk | walk | run | jump | cheer | point | sit | cry | shiver | think | shock | wave | hug | still |
             agree | disagree | pickup | dance | hurt   (2026-11-25: real Kenney / Quaternius clips)
   "camera": push | pull | close | eye | ots | low | high | feet | wide | drone | dutch | follow   (default by action)
   "prop":   {"type": "sign|screen|cake|stack|pill|number|fire|smoke|crack|wave|cabin|tower|bunker", "text": "..."}
   "board":  text on the classroom board ('|' = new line)
   "tag":    {"name": "...", "role": "..."}  name tag over the focus (first appearance)
   "trans":  zoom | flash | whip | glitch | cut   (into this shot; default zoom on a set change)
   "glitch": true                                  (RGB-split burst in the middle of the shot)
}
Everything has a safe default, so a script with no "shot" tags still renders (a talking narrator kid in the field).
Camera helpers and indoor shifts mirror render/specs/_common.mjs (keep them in sync).
"""
import json
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

CAST = {  # story name -> kit character (render/kit.js KIT_CAST). Fixed recurring cast = recognisable series.
    "hana": "hana", "kaito": "kaito", "eli": "eli", "mason": "mason", "lucy": "lucy", "leo": "leo", "pia": "pia", "mia": "mia", "zoe": "zoe",
    "jada": "jada", "marcus": "marcus", "rex": "rex", "ollie": "ollie", "vince": "vince", "gwen": "gwen",
    "noob": "noob", "beanie": "beanie", "noel": "noel", "baby": "babyb",
    "mom": "mumn", "mother": "mumn", "dad": "oldman", "grandpa": "oldman", "old man": "oldman",
    "teacher": "suitman", "boss": "suitman", "grandma": "pell", "granny": "pell", "stranger": "suitman", "man in a suit": "suitman", "doctor": "doc",
}
FACES = {"happy", "sad", "angry", "scared", "shocked", "surprised", "confused", "nervous", "determined", "neutral",
         "sob", "laugh", "starstruck", "worried", "smirk", "thinking"}
SETS = {  # loc, base exposure (Rule AA floor), indoor z shift and camera z max (world), x shift
    "classroom": ("classroom", 0.8, -8, 16, 0), "hallway": ("hallway", 0.8, -8, 16, 0), "library": ("library", 0.8, -8, 16, 0),
    "house": ("house", 0.9, 8, 30, 9), "bedroom": ("lilyroom", 0.5, -7, 11.5, 0),
    "field": ("field", 0.95, 0, None, 0), "forest": ("forest", 0.95, 0, None, 0),
    # 2026-11-25 (owner: backgrounds were ugly): real Kenney streets. city = shop street + fountain plaza (stage at z -20),
    # street = suburban neighborhood with houses, fences, trees across the road.
    "city": ("city", 1.0, -20, None, 0), "soccer": ("field", 0.95, 0, None, 0), "street": ("suburb", 1.0, 0, None, 0),
}
OUTDOOR = {"field", "forest", "city", "street", "soccer"}
FX = {  # clean colour grades only (Rule AA): no grain / vignette / fringe / glow
    "day": {"sat": 1.1, "contrast": 1.05, "sparkles": {"color": "#fff6c8", "count": 70, "size": 0.4, "speed": 0.35}},
    "sad": {"sat": 0.92, "contrast": 1.05, "tint": [0.95, 0.98, 1.05]},
    "danger": {"sat": 1.05, "contrast": 1.1, "tint": [0.95, 0.98, 1.08]},
    "win": {"sat": 1.15, "contrast": 1.05, "sparkles": {"color": "#ffe9a0", "count": 160, "size": 0.5, "speed": 0.6}},
    "cold": {"sat": 0.85, "contrast": 1.05, "tint": [0.85, 0.95, 1.15], "sparkles": {"color": "#ffffff", "count": 200, "size": 0.45, "speed": -0.9}},
}
SLOTS = [(0, 4), (-2.6, 4.6), (2.6, 4.6), (-5, 6), (5, 6)]   # stage positions for up to 5 people (x, z)


# ---- camera helpers (same maths as render/specs/_common.mjs) ----
def cam(a, b, look, fov=38, look_to=None, **kw):
    return {"from": a, "to": b, "look": look, "lookTo": look_to or look, "fov": fov, **kw}
def push(x, z, h=3.4, d0=17, d1=13, fov=38, dx=1.2):
    return cam([x + dx, h + 2.2, z + d0], [x + dx * 0.4, h + 1.7, z + d1], [x, h, z], fov)
def pull(x, z, h=3.4, d0=12, d1=18, fov=38, dx=0.6):
    return cam([x + dx, h + 1.8, z + d0], [x + dx * 2, h + 2.4, z + d1], [x, h, z], fov)
def low(x, z, h=3.6, d=14, fov=42):
    return cam([x + 1.5, 1.2, z + d], [x + 0.5, 2.0, z + d - 1.8], [x, h + 0.5, z], fov)
def high(x, z, h=2.6, d=13, fov=42):
    return cam([x + 1.5, 12, z + d], [x - 0.5, 11, z + d - 1.5], [x, h, z], fov)
def follow(x0, x1, z, h=3.2, d=16, fov=40):
    return cam([x0, h + 2, z + d], [x1, h + 2, z + d], [x0 + 2, h, z], fov, [x1 + 2, h, z])
def eye(x, z, h=4.4):
    return cam([x + 0.4, h + 0.2, z + 5.2], [x + 0.15, h + 0.15, z + 3.9], [x, h, z], 32)
def feet(x, z):
    return cam([x + 1.4, 1.1, z + 10], [x + 0.6, 1.0, z + 8.5], [x, 1.0, z], 46)
def ots(x, z, tx, tz, h=3.6):
    dx, dz = x - tx, z - tz
    L = math.hypot(dx, dz) or 1
    ux, uz = dx / L, dz / L
    return cam([x + ux * 4.4 - uz * 1.9, h + 1.8, z + uz * 4.4 + ux * 1.9], [x + ux * 3.6 - uz * 1.7, h + 1.6, z + uz * 3.6 + ux * 1.7], [tx, h + 0.4, tz], 40)
def drone(x, z, h=3.6):
    return {"keys": [{"t": 0, "pos": [x + 10, 34, z + 55], "look": [x, 0, z - 10], "fov": 50},
                     {"t": 0.55, "pos": [x + 2.5, 7, z + 16], "look": [x, h, z], "fov": 44},
                     {"t": 1, "pos": [x + 0.6, h + 1.6, z + 8.5], "look": [x, h + 1.2, z], "fov": 38}], "ease": "lin"}


def arm(who, x, z, t, a="R"):
    return {"who": who, "do": "arm", "arm": a, "x": x, "z": z, "t": t, "hold": True}
def both(who, t, x=-2.9):
    return [arm(who, x, 0.3, t, "R"), arm(who, x, -0.3, t, "L")]


def cast_key(name):
    n = str(name).strip().lower()
    return CAST.get(n) or CAST.get(n.split()[0] if n else "", "eli")


def build_shot(i, line, prev):
    sh = dict(line.get("shot") or {})
    set_ = sh.get("set") if sh.get("set") in SETS else prev.get("set", "field")
    names = sh.get("cast") or prev.get("cast") or ["Eli"]
    names = names[:5]
    action = sh.get("action", "talk")
    face = sh.get("face") if sh.get("face") in FACES else {"cry": "sob", "cheer": "laugh", "jump": "laugh", "shock": "shocked",
                                                             "shiver": "scared", "think": "thinking"}.get(action, "neutral")
    loc, expo, dz, zmax, dx = SETS[set_]
    time_ = sh.get("time", "day")
    mood = sh.get("mood") or ("cold" if action == "shiver" else "sad" if face in ("sob", "sad") else
                              "win" if face in ("laugh", "starstruck") else "day")
    light = {"night": "night", "sunset": "sunset"}.get(time_, "day")
    # 2026-11-25: indoor rooms keep their lights on at night (0.35 made faces unreadable)
    s = {"loc": loc, "light": light, "exposure": expo if light != "night" else (0.35 if set_ in OUTDOOR else expo * 0.9), "fx": FX.get(mood, FX["day"])}
    if set_ == "soccer":
        s["soccer"] = True
    if loc == "house":
        s["time"] = "evening" if time_ in ("sunset", "night") else "day"
    if loc == "classroom":
        s["boardText"], s["boardSub"] = sh.get("board", prev.get("board", "CLASS")), ""
    if set_ == "bedroom":
        s["fx"] = {k: v for k, v in s["fx"].items() if k != "sparkles"} if mood != "cold" else s["fx"]

    # cast on stage
    ids = []
    cast = []
    for k, n in enumerate(names):
        cid = "c%d" % k
        x, z = SLOTS[k]
        rot = 0 if k == 0 else (25 if x < 0 else -25)
        c = {"id": cid, "who": cast_key(n), "at": [x, z], "rot": rot, "face": face if k == 0 else ("happy" if mood == "win" else "worried" if mood in ("sad", "danger", "cold") else "neutral")}
        if k == 0 and sh.get("tag"):
            c["tag"] = {"name": sh["tag"].get("name", n), "role": sh["tag"].get("role", ""), "from": 0.15}
        cast.append(c)
        ids.append(cid)
    f = cast[0]
    if len(cast) > 1 and action not in ("walk", "run", "hug"):   # 2026-11-25: in a two-person beat the focus half-turns to the partner
        f["rot"] = -25 if cast[1]["at"][0] < f["at"][0] else 25
    if action == "talk" and sh.get("camera") == "close":   # talking gestures cross the face in a tight close-up
        sh["camera"] = "push"
    fx_, fz = f["at"]
    acts = []
    if action == "talk":
        f["talk"] = [[0.1, 0.9]]   # 2026-11-25: mouth moves; Quaternius Idle_Talking_Loop clip (below) gives the gestures
    elif action in ("walk", "run"):
        f["at"], f["rot"] = [fx_ - 5, fz], 90
        acts.append({"who": "c0", "do": action, "to": [fx_ + 5, fz], "t": [0.05, 0.95]})
    elif action in ("jump", "cheer"):
        acts += both("c0", [0.15, 0.35])
        if action == "jump":
            acts.append({"who": "c0", "do": "jump", "to": [fx_, fz], "toY": 0, "h": 3, "t": [0.3, 0.7], "crouch": 0.15})
        for c in ids[1:3]:
            acts += both(c, [0.25, 0.45])
    elif action == "point":
        acts.append(arm("c0", -1.55, 0.1, [0.1, 0.3]))
    elif action == "sit":
        acts.append({"who": "c0", "do": "sit", "seat": 0.2, "t": [0, 1], "hold": True})
    elif action == "cry":
        acts += [{"who": "c0", "do": "lookdown", "t": [0.15, 1], "hold": True}, {"who": "c0", "do": "tremble", "t": [0.2, 1]}]
    elif action == "shiver":
        acts += [{"who": "c0", "do": "shiver", "t": [0, 1]}, arm("c0", -1.2, 0.9, [0.1, 0.3]), arm("c0", -1.2, -0.9, [0.1, 0.3], "L")]
    elif action == "think":
        acts.append({"who": "c0", "do": "lookup", "t": [0.2, 1], "hold": True})
    elif action == "shock":
        acts += [arm("c0", -2.1, 1.1, [0.1, 0.3]), arm("c0", -2.1, -1.1, [0.1, 0.3], "L"), {"who": "c0", "do": "tremble", "t": [0.3, 1]}]
    elif action == "wave":
        acts.append({"who": "c0", "do": "wave", "t": [0.15, 0.8]})
    elif action == "hug" and len(cast) > 1:
        cast[0]["at"], cast[0]["rot"] = [-1.2, 4], 70
        cast[1]["at"], cast[1]["rot"] = [1.2, 4], -70
        acts += [arm("c0", -1.4, -0.5, [0.2, 0.4], "L"), arm("c1", -1.4, 0.5, [0.2, 0.4])]
    elif action == "wheelchair":   # 2026-11-25: focus sits in a wheelchair (Kenney wheelchair clips)
        pass   # wheelchair prop is added with the other props below
    elif action in ("agree", "disagree", "pickup", "dance", "hurt"):   # 2026-11-25: real Kenney emote clips (see body clips below)
        pass
    fx_, fz = f["at"] if action not in ("walk", "run") else (fx_, fz)

    # body clips (2026-11-25, owner-approved): real Kenney animation as the base pose for everyone on stage.
    # Focus: walk/sprint while moving, emote clips for agree/disagree/pickup, otherwise idle. Others: idle.
    # Seated / jumping / hugging focus keeps the procedural pose (no clip) so the sit/jump maths is not fought.
    focus_clip = {"walk": "walk", "run": "sprint", "agree": "emote-yes", "disagree": "emote-no", "pickup": "pick-up",
                  "talk": "ual:Idle_Talking_Loop", "dance": "ual:Dance_Loop", "hurt": "ual:Hit_Head",
                  "wheelchair": "wheelchair-sit"}.get(action, "idle")
    for k, cid in enumerate(ids):
        if k == 0 and action in ("sit", "jump", "hug", "cheer"):
            continue
        if k > 0 and action == "hug":
            continue
        clip = focus_clip if k == 0 else "idle"
        if k == 0 and clip in ("emote-yes", "emote-no", "pick-up"):
            acts += [{"who": cid, "do": "clip", "clip": "idle", "t": [0, 0.2]}, {"who": cid, "do": "clip", "clip": clip, "t": [0.2, 0.75]},
                     {"who": cid, "do": "clip", "clip": "idle", "t": [0.75, 1]}]
        else:
            acts.append({"who": cid, "do": "clip", "clip": clip, "t": [0, 1]})

    # props
    props = []
    if action == "wheelchair":
        props.append({"id": "wc", "type": "wheelchair", "at": [fx_, fz], "rot": f.get("rot", 0)})
    p = sh.get("prop") or {}
    pt, txt = p.get("type"), p.get("text", "")
    if pt in ("sign", "screen", "number"):
        props.append({"id": "p0", "type": "sign" if pt == "number" else pt, "color": txt or ("1" if pt == "number" else "!"),
                      "at": [fx_ + 1.6, 0, fz + 2.4], "rot": -22, "scale": 1.0 if pt != "screen" else 0.8})
    elif pt == "crack":   # flat ground decal: put it in front of the focus, bigger, so a high/drone camera sees it
        props.append({"id": "p0", "type": "crack", "at": [fx_ + 0.6, 0.55, fz + 2.6], "scale": 1.7})
    elif pt in ("cake", "stack", "fire", "smoke"):
        props.append({"id": "p0", "type": pt, "at": [fx_ + 2.6, 0, fz + 1.2]})
    elif pt in ("walkie", "plate", "notebook"):   # 2026-11-25: held items float at hand height, in front of the focus
        props.append({"id": "p0", "type": pt, "at": [fx_ + 1.2, 2.3 if pt != "notebook" else 3.0, fz + 1.6], "rot": -15,
                      **({"color": txt} if txt else {})})
    elif pt == "goal":
        props.append({"id": "p0", "type": "goal", "at": [0, fz - 10]})
    elif pt == "pill":
        props.append({"id": "p0", "type": "pill", "color": txt or "#e02f2f", "at": [fx_ + 1.8, 3.0, fz + 2.5], "scale": 1.6})
    elif pt in ("wave", "cabin", "tower", "bunker"):
        props.append({"id": "p0", "type": pt, "at": [0, 0, -16 if pt == "wave" else -8], **({"scale": 2.2} if pt == "wave" else {})})

    # camera (default per action)
    c = sh.get("camera") or {"walk": "follow", "run": "follow", "cry": "high", "shock": "low", "jump": "low",
                             "cheer": "pull", "think": "low", "sit": "high"}.get(action, "push")
    # 2026-11-25 cut rule (DirectorSKILL, MIT): the same people in two shots in a row must change framing by two
    # steps on the size ladder (or angle), else the cut looks like a jump. Repeat camera -> jump two rungs.
    LADDER = ["wide", "pull", "push", "close", "eye"]
    if c == prev.get("cam") and names == prev.get("cast") and c in LADDER:
        i0 = LADDER.index(c)
        c = LADDER[i0 + 2] if i0 + 2 < len(LADDER) else LADDER[i0 - 2]
    if c == "drone" and set_ not in OUTDOOR:
        c = "push"
    if c == "ots" and len(cast) < 2:
        c = "close"
    if action in ("walk", "run"):
        c = "follow" if c not in ("feet",) else "feetfollow"
    h = 3.4
    camspec = {
        "push": lambda: push(fx_, fz, h, 16, 12, 40), "pull": lambda: pull(fx_, fz, h, 13, 19, 42),
        "close": lambda: push(fx_, fz, 3.8, 10, 7.5, 34), "eye": lambda: eye(fx_, fz),
        "ots": lambda: ots(cast[1]["at"][0], cast[1]["at"][1], fx_, fz), "low": lambda: low(fx_, fz, 3.6, 13, 44),
        "high": lambda: high(fx_, fz, 2.4, 14, 44), "feet": lambda: feet(fx_, fz),
        "wide": lambda: pull(0, 5, 3.6, 18, 23, 48), "drone": lambda: drone(fx_, fz),
        "dutch": lambda: {**push(fx_, fz, h, 15, 11, 40), "roll": 12},
        "follow": lambda: follow(fx_ - 5, fx_ + 5, fz, 3.2, 16, 42),
        "feetfollow": lambda: cam([fx_ - 4, 1.0, fz + 8], [fx_ + 4, 1.0, fz + 8], [fx_ - 3.5, 1.0, fz], 46, [fx_ + 4.5, 1.0, fz]),
    }.get(c, lambda: push(fx_, fz, h, 16, 12, 40))()
    if action == "shock":
        camspec["shake"] = 0.04
    s.update(cast=cast, acts=acts, props=props, cam=camspec)
    if sh.get("trans") in ("zoom", "flash", "whip", "glitch", "cut"):
        s["trans"] = sh["trans"]
    if sh.get("glitch"):
        s["glitch"] = [[0.35, 0.55]]
    s["_set"], s["_cast"], s["_board"], s["_cam"] = set_, names, s.get("boardText", prev.get("board")), c
    return s


def shift(s, dz, zmax, dx):
    """Indoor sets: move the stage into the room (and away from the kitchen table); clamp the camera inside the walls."""
    if dx:
        X = lambda a: a and [a[0] + dx, *a[1:]]
        for c in s["cast"]:
            c["at"] = [c["at"][0] + dx, c["at"][1]]
        for p in s["props"]:
            p["at"] = [p["at"][0] + dx, *p["at"][1:]]
        for a in s["acts"]:
            if "to" in a:
                a["to"] = [a["to"][0] + dx, a["to"][1]]
        cm = s["cam"]
        if "keys" in cm:
            cm["keys"] = [{**k, "pos": X(k["pos"]), "look": X(k["look"])} for k in cm["keys"]]
        else:
            for k in ("from", "to", "look", "lookTo"):
                cm[k] = X(cm[k])
    if not dz:
        return s
    P = lambda a: [a[0], a[1], a[2] + dz if zmax is None else min(a[2] + dz, zmax)]
    for c in s["cast"]:
        c["at"] = [c["at"][0], c["at"][1] + dz]
    for p in s["props"]:
        p["at"] = [p["at"][0], p["at"][1], p["at"][2] + dz] if len(p["at"]) > 2 else [p["at"][0], p["at"][1] + dz]
    for a in s["acts"]:
        if "to" in a:
            a["to"] = [a["to"][0], a["to"][1] + dz]
    cm = s["cam"]
    if "keys" in cm:
        cm["keys"] = [{**k, "pos": P(k["pos"]), "look": [k["look"][0], k["look"][1], k["look"][2] + dz]} for k in cm["keys"]]
    else:
        cm["from"], cm["to"] = P(cm["from"]), P(cm["to"])
        cm["look"] = [cm["look"][0], cm["look"][1], cm["look"][2] + dz]
        cm["lookTo"] = [cm["lookTo"][0], cm["lookTo"][1], cm["lookTo"][2] + dz]
    return s


def main(ep):
    out = ROOT / "output" / ep
    narr = sorted(out.glob("narration-*.json"), key=lambda p: p.stat().st_mtime)
    if not narr:
        sys.exit(f"no narration in {out}: run python -m pipeline.voicecheck {ep} first")
    T = json.loads(narr[-1].read_text())["times"]
    vs = sorted(p for p in (ROOT / "scripts").glob(f"{ep}.v*.json") if not p.name.endswith(".qa.json"))
    sc = json.loads(vs[-1].read_text(encoding="utf-8"))
    total = T[-1]["end"] + sc.get("tail_hold", 0.8)
    slot = lambda i: (T[i + 1]["start"] if i + 1 < len(T) else total) - (0 if i == 0 else T[i]["start"])
    shots, prev = [], {}
    for i, line in enumerate(sc["lines"][:len(T)]):
        s = build_shot(i, line, prev)
        prev = {"set": s.pop("_set"), "cast": s.pop("_cast"), "board": s.pop("_board"), "cam": s.pop("_cam")}
        _, _, dz, zmax, dx = SETS[prev["set"]]
        s = shift(s, dz, zmax, dx)
        shots.append({"line": i, "dur": round(slot(i) + 0.3, 3), "monsters": [], "lively": True, **s})
    (out / "shotspec.json").write_text(json.dumps({"id": ep, "shots": shots}, indent=1), encoding="utf-8")
    print(f"{ep}: {len(shots)} template shots, {sum(s['dur'] for s in shots):.1f} s")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1])
