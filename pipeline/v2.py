"""Style v2 video (owner approved 2026-11-26): auto-director + render + sound. Replaces autoshots/render/assemble.

  python -m pipeline.v2 <episode-id>               scripts/<id>.v*.json -> output/<id>/final.mp4
  python -m pipeline.v2 <episode-id> --spec-only   only output/<id>/v2spec.json (to check the shot plan)

Each script line is cut into 1-3 shots (a new shot about every 2-3 s): the scripted camera and action first, then a
close-up of the focus face, then a reaction or a new angle. render/v2/engine.html draws the whole video in one pass
(captions, hook title and transitions included). Music: drift (owner pick), plus small synthesized sound effects.
"""
import json
import os
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

from pipeline import audio, captions
from pipeline.assemble import narrate, script_for, tag_leaks

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
ROOT = Path(__file__).resolve().parent.parent
MUSIC, MUSIC_GAIN, DUCK = "drift", 0.3, 0.5

NAMES = {"police": "officer", "policeman": "officer", "police officer": "officer", "mother": "mom", "father": "dad", "old man": "grandpa", "granny": "grandma", "boss": "teacher", "man in a suit": "stranger", "kai": "kaito"}
KNOWN = {"hana", "kaito", "eli", "mason", "lucy", "leo", "pia", "mia", "zoe", "jada", "marcus", "rex", "ollie", "vince", "gwen",
         "noob", "beanie", "noel", "baby", "mom", "dad", "grandma", "grandpa", "teacher", "stranger", "doctor", "mayor", "officer"}
SETS = {"classroom", "hallway", "library", "house", "bedroom", "field", "forest", "city", "street", "soccer", "town",
        "hospital", "police", "vault", "lab", "bunker", "shop", "rooftop", "cave"}
FACES = {"happy", "sad", "angry", "scared", "shocked", "surprised", "confused", "nervous", "determined", "neutral",
         "sob", "laugh", "starstruck", "worried", "smirk", "thinking", "cry", "fake"}
POSE = {"talk": "talk", "walk": "walk", "run": "run", "jump": "jump", "cheer": "cheer", "point": "point", "sit": "sit", "cry": "cry",
        "shiver": "shiver", "think": "think", "shock": "shock", "wave": "wave", "hug": "hug", "still": "still", "agree": "agree",
        "disagree": "disagree", "pickup": "pickup", "dance": "dance", "hurt": "hurt"}
ACTION_FACE = {"cry": "cry", "cheer": "laugh", "jump": "laugh", "dance": "laugh", "shock": "shocked", "shiver": "scared", "think": "thinking",
               "hurt": "sad", "disagree": "angry", "agree": "happy", "hug": "happy", "wave": "happy"}
# what the others do and feel when the focus shows a given face
REACT = {"smirk": ("sad", "idle"), "angry": ("scared", "idle"), "sad": ("worried", "idle"), "sob": ("worried", "idle"), "cry": ("worried", "idle"),
         "scared": ("worried", "idle"), "shocked": ("shocked", "shock"), "surprised": ("surprised", "idle"), "happy": ("happy", "idle"),
         "laugh": ("laugh", "cheer"), "starstruck": ("starstruck", "cheer"), "determined": ("surprised", "idle"), "worried": ("worried", "idle"),
         "nervous": ("confused", "idle"), "confused": ("confused", "think"), "thinking": ("neutral", "idle"), "neutral": ("neutral", "idle"), "fake": ("fake", "stiffwave")}
SLOTS = [(0.0, 1.0), (-3.7, -1.3), (3.7, -1.3), (-6.6, -3.2), (6.6, -3.2)]   # >= 3.2 apart: bodies never overlap
CAMS = {"push", "pull", "close", "eye", "ots", "low", "high", "feet", "wide", "drone", "dutch", "follow", "two"}


def who(name):
    n = str(name).strip().lower()
    n = NAMES.get(n, n)
    if n in KNOWN:
        return n
    first = n.split()[0] if n else ""
    return NAMES.get(first, first) if NAMES.get(first, first) in KNOWN else "eli"


def mood_of(sh, face, action):
    m = sh.get("mood")
    if m == "danger":
        return "storm"
    if m in ("sad", "win", "cold"):
        return m
    if sh.get("time") == "night":
        return "night"
    if sh.get("time") == "sunset":
        return "sunset"
    return "cold" if action == "shiver" else "sad" if face in ("sob", "cry") else "day"


def split_points(words, start, end, n):
    """n-1 cut times inside (start, end): word starts near equal parts, preferably right after punctuation."""
    cuts, prev = [], start
    for k in range(1, n):
        want = start + (end - start) * k / n
        cand = [(abs(w["start"] - want) - (0.45 if i and re.search(r"[,.;:!?]$", words[i - 1]["word"]) else 0), w["start"])
                for i, w in enumerate(words) if prev + 1.1 <= w["start"] <= end - 1.1]
        if cand:
            prev = min(cand)[1] - 0.05
            cuts.append(round(prev, 3))
    return cuts


def direct(sc, data):
    lines, times, words = sc["lines"], data["times"], data["words"]
    total = round(times[-1]["end"] + sc.get("tail_hold", 0.9), 3)
    shots, prev = [], {"set": "town", "cast": ["eli"], "monsters": []}
    last_cam = ""
    for i, line in enumerate(lines[:len(times)]):
        sh = line.get("shot") or {}
        asked_set = {"school": "hallway", "home": "house", "park": "field", "police station": "police"}.get(sh.get("set"), sh.get("set"))
        set_ = asked_set if asked_set in SETS else prev["set"]
        cast = []
        for n in (sh.get("cast") or prev["cast"])[:5]:
            if who(n) not in cast:
                cast.append(who(n))
        action = sh.get("action") if sh.get("action") in POSE else "talk"
        face = sh.get("face") if sh.get("face") in FACES else ACTION_FACE.get(action, "neutral")
        mood = mood_of(sh, face, action)
        a = 0.0 if i == 0 else max(0.0, times[i]["start"] - 0.08)
        b = (times[i + 1]["start"] - 0.08) if i + 1 < len(times) else total
        lw = [w for w in words if w.get("line") == i]
        n = 1 if b - a < 3.2 else 2 if b - a < 6.0 else 3
        pts = [a] + split_points(lw, a, b, n) + [b]
        prop = sh.get("prop") if isinstance(sh.get("prop"), dict) and sh["prop"].get("type") else None
        monsters = [who(n) for n in sh.get("monster") or []]          # names in monster form on this line
        if prop and prev.get("had_prop"):                            # never a prop on two lines in a row: keeps close framing
            prop = None
        rface, rpose = REACT.get(face, ("neutral", "idle"))
        feelings = {who(k_): v for k_, v in (sh.get("faces") or {}).items() if v in FACES}   # from the script, per character

        def stage(focus_pose, focus_face, order, talk):
            out = []
            for k, name in enumerate(order[:5]):
                x, z = SLOTS[k]
                lead = k == 0
                c = {"who": name + (":monster" if name in monsters else ""), "x": x, "z": z, "ry": 0.0 if lead else round(-0.24 if x > 0 else 0.24, 2),
                     "pose": focus_pose if lead else (rpose if name != cast[0] else POSE[action]),
                     "face": focus_face if lead else feelings.get(name, rface if name != cast[0] else face), "talk": bool(talk and lead)}
                if lead and len(order) > 1 and focus_pose not in ("walk", "run"):
                    c["ry"] = 0.2 if order[1] and SLOTS[1][0] < 0 else -0.2
                if lead and focus_pose in ("walk", "run"):   # three-quarter toward the camera, never a flat side view
                    c.update({"from": -4.6, "x": 0.6, "ry": 0.55})
                out.append(c)
            if focus_pose == "hug" and len(out) > 1:
                out[0].update({"x": -1.15, "z": 1.0, "ry": 0.75, "pose": "hug", "face": focus_face})
                out[1].update({"x": 1.15, "z": 1.0, "ry": -0.75, "pose": "hug", "face": "happy" if focus_face in ("happy", "laugh") else focus_face})
            return out

        main_cam = sh.get("camera") if sh.get("camera") in CAMS else {"walk": "follow", "run": "follow", "cheer": "wide", "hug": "two", "shock": "push"}.get(action, "push")
        if i == 0 and main_cam not in ("drone", "push", "follow"):
            main_cam = "push"
        if action == "hug":
            main_cam = "two"
        if main_cam in ("close", "eye") and action in ("walk", "run", "jump", "cheer", "dance"):
            main_cam = "push"
        if main_cam == last_cam:
            main_cam = {"push": "low", "low": "push", "close": "ots", "wide": "push", "eye": "close"}.get(main_cam, "push")

        for k in range(len(pts) - 1):
            talk = action == "talk"
            if k == 0:
                cam = main_cam
                st = stage(POSE[action], face, cast, talk)
                if len(cast) > 1 and cam in ("push", "pull") and i % 2 == 0:
                    cam = "two"
            elif k == 1:   # the face: close-up of the focus with the emotion readable
                cam = "dutch" if mood == "storm" or face in ("angry", "shocked", "scared") else ("eye" if face in ("sob", "cry", "thinking", "starstruck", "smirk") else "close")
                if cam == last_cam:
                    cam = "close" if cam != "close" else "eye"
                body = "cry" if face in ("sob", "cry") else "talk" if talk else "shock" if face == "shocked" else "think" if face == "thinking" else "rant" if face == "angry" else "idle"
                if action == "sit":
                    body = "sit"
                if cam in ("close", "eye", "dutch") and body in ("shock", "cry"):
                    cam = "push"
                st = stage(body, face, cast, talk)
            else:          # reaction of someone else, or a fresh angle with the scripted action
                if len(cast) > 1:
                    order = cast[1:] + cast[:1]
                    st = stage(rpose, feelings.get(order[0], rface), order, False)
                    cam = "close" if rpose in ("idle", "think") else "low"
                else:
                    cam = "low" if last_cam != "low" else "wide"
                    st = stage(POSE[action] if action not in ("walk", "run") else "idle", face, cast, talk)
            if action == "sit" and cam in ("close", "eye", "dutch"):
                cam = "push"
            trans = "cut"
            if k == 0 and i:
                asked = sh.get("trans")
                if mood == "storm" and prev.get("mood") != "storm":
                    trans = "black"
                elif asked in ("flash", "glitch"):
                    trans = "flash"
                elif set_ != prev["set"]:
                    trans = "whip"
                elif asked in ("zoom", "whip"):
                    trans = asked
                elif i % 3 == 0:
                    trans = "zoom"
            elif k == 1:
                trans = "zoom" if face in ("angry", "shocked", "surprised", "starstruck", "determined", "scared") or i % 2 == 0 else "cut"
            shot = {"at": round(pts[k], 3), "in": trans, "set": set_, "mood": mood, "camera": cam, "cast": st, "side": 1 if (len(shots) % 2 == 0) else -1}
            if sh.get("board"):
                shot["board"] = str(sh["board"])[:40]
            if prop and k == 0:
                shot["prop"] = {"type": prop["type"], "text": str(prop.get("text", ""))[:24]}
                if cam in ("close", "eye", "dutch"):
                    shot["camera"] = "push"
            if st and st[0]["pose"] in ("shock", "cheer", "jump", "dance") and shot["camera"] in ("close", "eye", "dutch"):
                shot["camera"] = "push"
            if k == 0 and st and st[0]["who"].endswith(":monster") and cast[0] not in prev.get("monsters", []):
                shot.update({"in": "flash", "morph": round(pts[k], 3), "camera": "low" if len(cast) < 2 else "push"})   # the change itself
                st[0]["pose"] = "rant"
            if "morph" in shot:
                shot["shake"] = 0.12
            elif mood == "storm":
                shot["shake"] = 0.07
                shot["bolts"] = [round(pts[k] + 0.35, 3)] if k != 1 else []
            elif face in ("angry", "shocked") and k == 1:
                shot["shake"] = 0.06
            shots.append(shot)
            last_cam = shot["camera"]
        prev = {"set": set_, "cast": cast, "mood": mood, "monsters": monsters, "had_prop": bool(prop)}

    cap = []
    line_last = {w.get("line"): idx for idx, w in enumerate(words)}
    for idx, w in enumerate(words):
        core = re.sub(r"[^A-Za-z0-9]", "", w["word"])
        cap.append({"text": re.sub(r"[.,;:]+$", "", w["word"]).upper(), "start": round(w["start"], 3), "end": round(w["end"], 3),
                    "hot": bool(w.get("hot") or len(core) >= 9 or line_last.get(w.get("line")) == idx)})
    hook = {"text": sc["hook_text"].upper(), "until": sc.get("hook_until", 2.6)} if sc.get("hook_text") else None
    return {"total": total, "hook": hook, "words": cap, "shots": shots}


# ---------- small synthesized sound effects ----------
def _noise(n, seed):
    return np.random.default_rng(seed).uniform(-1, 1, n)


def sfx(kind):
    sr = audio.SR
    if kind == "whoosh":
        t = np.arange(int(0.34 * sr)) / sr
        x = _noise(len(t), 1)
        k = 24
        x = np.convolve(x, np.ones(k) / k, "same") * 3
        return x * np.sin(np.pi * np.clip(t / 0.34, 0, 1)) ** 2 * 0.55
    if kind == "boom":
        t = np.arange(int(0.5 * sr)) / sr
        return np.sin(2 * np.pi * np.cumsum(45 + 90 * np.exp(-t * 22)) / sr) * np.exp(-t * 8) * 0.9
    if kind == "flash":
        t = np.arange(int(0.45 * sr)) / sr
        return sum(np.sin(2 * np.pi * f * t) for f in (1318, 1760, 2637)) / 3 * np.exp(-t * 9) * np.minimum(t / 0.004, 1) * 0.45
    if kind == "roar":                       # soft cartoon growl
        t = np.arange(int(0.9 * sr)) / sr
        ph = 2 * np.pi * np.cumsum(95 - 30 * t + 6 * np.sin(2 * np.pi * 7 * t)) / sr
        x = np.tanh(3 * (np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.6 * np.convolve(_noise(len(t), 7), np.ones(30) / 30, "same") * 4))
        return x * np.minimum(t / 0.05, 1) * np.exp(-t * 2.6) * 0.6
    if kind == "thunder":
        t = np.arange(int(1.1 * sr)) / sr
        x = np.convolve(_noise(len(t), 4), np.ones(60) / 60, "same") * 7
        return np.clip(x, -1, 1) * np.exp(-t * 3.2) * np.minimum(t / 0.01, 1) * 0.75
    return np.zeros(1)


def soundtrack(spec, voice, out):
    sr = audio.SR
    need = int(round(spec["total"] * sr))
    v = voice.astype(np.float32)
    if len(v) < need:
        v = np.concatenate([v, np.zeros(need - len(v), np.float32)])
    mix = audio.mix(v, bed_name=MUSIC, music_gain=MUSIC_GAIN, duck=DUCK)
    fx = np.zeros(len(mix))
    level = float(np.percentile(np.abs(v), 99.5)) or 0.5

    def put(sig, at, g):
        s = int(max(0, at) * sr)
        e = min(len(fx), s + len(sig))
        if e > s:
            fx[s:e] += sig[:e - s] * g * level
    for s in spec["shots"]:
        if s["in"] == "whip":
            put(sfx("whoosh"), s["at"] - 0.14, 0.4)
        elif s["in"] == "black":
            put(sfx("boom"), s["at"], 0.5)
        elif s["in"] == "flash":
            put(sfx("flash"), s["at"], 0.28)
        elif s["in"] == "zoom":
            put(sfx("boom"), s["at"], 0.2)
        if "morph" in s:
            put(sfx("boom"), s["morph"], 0.55)
            put(sfx("roar"), s["morph"] + 0.08, 0.36)
        for bt in s.get("bolts", []):
            put(sfx("thunder"), bt, 0.42)
    m = mix + fx
    audio.write(out, m / max(1.0, float(np.max(np.abs(m))) / 0.97))


def ff(*a):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *map(str, a)], check=True)


def main(ep, spec_only=False):
    out = ROOT / "output" / ep
    out.mkdir(parents=True, exist_ok=True)
    sc = script_for(ep)
    data, wav = narrate(sc["lines"], out)
    leaks = tag_leaks(sc["lines"], data.get("heard", []))
    if leaks:
        sys.exit(f"VOICE GATE FAIL: Fish tag words were spoken aloud: {leaks}. Remove/replace those tags and re-narrate.")
    spec = direct(sc, data)
    (out / "v2spec.json").write_text(json.dumps(spec, indent=1), encoding="utf-8")
    lens = np.diff([s["at"] for s in spec["shots"]] + [spec["total"]])
    print(f"directed: {len(sc['lines'])} lines -> {len(spec['shots'])} shots, average {lens.mean():.1f}s, longest {lens.max():.1f}s, {spec['total']:.1f}s total")
    if spec_only:
        return
    captions.srt(captions.cues(data["words"], max_chars=1), out / "final.srt")
    voice, _ = sf.read(str(wav), dtype="float32")
    soundtrack(spec, voice, out / "mix.wav")
    silent = out / "video-v2.mp4"
    page = f"v2/engine.html?ep={ep}" + ("&sm=1024" if os.environ.get("GITHUB_ACTIONS") else "")
    subprocess.run(["node", "render.js", page, str(silent), f"{spec['total']}"], cwd=ROOT / "render", check=True)
    ff("-i", silent, "-i", out / "mix.wav", "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-r", "30",
       "-af", "acompressor=threshold=-20dB:ratio=2.2:attack=8:release=160,loudnorm=I=-14:TP=-1.2:LRA=8,aresample=48000",
       "-c:a", "aac", "-b:a", "192k", "-t", f"{spec['total']:.3f}", "-movflags", "+faststart", out / "final.mp4")
    silent.unlink()
    print("done:", out / "final.mp4")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1], "--spec-only" in sys.argv)
