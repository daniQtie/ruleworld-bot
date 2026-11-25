"""Assemble an OpenArt story: downloaded shot clips + Adam narration (Fish Audio) + word-synced captions + lo-fi bed.

  python -m pipeline.assemble <id>            # needs scripts/<id>.v*.json (latest) and output/<id>/shots.json
  python -m pipeline.assemble <id> --narrate  # only make the narration + timings (before generating shots, to size them)

shots.json: {"shots": [{"line": 0, "job_id": "...", "file": "clips/s00.mp4"}, ...]}  (one clip per script line)
Each clip fills its line's time slot: trimmed if long, last frame held if short (never looped or repeated).
Writes output/<id>/final.mp4, final.srt, narration-<key>.json, voice-<key>.wav.
"""
import hashlib
import re
import json
import subprocess
import sys
from pathlib import Path

from pipeline import audio, captions

ROOT = Path(__file__).resolve().parent.parent
FPS, W, H = 30, 1080, 1920


def script_for(vid):
    vs = sorted(ROOT.glob(f"scripts/{vid}.v*.json"), key=lambda p: int(p.stem.rsplit(".v", 1)[1]) if p.stem.rsplit(".v", 1)[1].isdigit() else -1)
    vs = [p for p in vs if not p.name.endswith(".qa.json")]
    return json.loads(vs[-1].read_text(encoding="utf-8"))


def narrate(lines, out, speed=1.0):
    key = hashlib.sha256(json.dumps([lines, "fish", speed], sort_keys=True).encode()).hexdigest()[:12]
    cache, wav = out / f"narration-{key}.json", out / f"voice-{key}.wav"
    if cache.exists() and wav.exists():
        data = json.loads(cache.read_text())
        captions.settle(data["words"])
        return data, wav
    v, times = audio.tts(lines, speed=speed, cache_dir=out / "tts-lines")
    audio.write(wav, v)
    heard = captions.whisper_words(wav)
    words, ratio = captions.align(lines, times, heard)
    data = dict(times=times, words=words, match_ratio=round(ratio, 3), heard=[[h[0], round(h[1], 3), round(h[2], 3)] for h in heard])
    cache.write_text(json.dumps(data, indent=1))
    return data, wav


def ff(*a):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *map(str, a)], check=True)


def kenburns(i, dur):
    """Still image -> slow camera move (Hybrid approach): alternate push-in / pull-out / pans so cuts feel alive."""
    n = max(1, round(dur * FPS))
    z0, z1, dx, dy = [(1.0, 1.12, 0, 0), (1.12, 1.0, 0, 0), (1.1, 1.1, -1, 0), (1.1, 1.1, 1, 0), (1.0, 1.1, 0, -1)][i % 5]
    z = f"({z0}+({z1}-{z0})*on/{n})"
    x = f"(iw-iw/zoom)/2+{dx}*(iw-iw/zoom)/2*(on/{n}*2-1)"
    y = f"(ih-ih/zoom)/2+{dy}*(ih-ih/zoom)/2*(on/{n}*2-1)"
    return (f"scale={W*2}:{H*2}:force_original_aspect_ratio=increase,crop={W*2}:{H*2},"
            f"zoompan=z='{z}':x='{x}':y='{y}':d={n}:s={W}x{H}:fps={FPS},format=yuv420p")


TAG = re.compile(r"\(([a-z ]+)\)")


def tag_leaks(lines, heard):
    """Voice gate: words of Fish tags (e.g. 'regretful') that Whisper heard but that are not in the captions."""
    tagw = {w for l in lines for t in TAG.findall(l.get("say", "")) for w in t.split()}
    capw = {captions._norm(w) for l in lines for w in l["text"].split()}
    heard = [h[0] if isinstance(h, list) else h for h in heard]
    return sorted({h for h in heard if captions._norm(h) in tagw and captions._norm(h) not in capw})


SPEAKER_STYLE = {"Lily": "L", "Noah": "N", "Kai": "N", "Pell": "L", "Marlo": "M", "Theo": "N", "Kid": "M", "Maya": "L", "Mia": "L", "Sam": "N"}  # caption colour per speaker (kit 001 plan); narrator / others = white


def ass(cue_list, path, speakers=None, hook=None, hook_until=2.6, cards=()):
    """Burn-in captions: one line, bold, white with black outline, above the bottom Shorts UI.
    `speakers[line]` picks a colour style per speaker (Lily pink, Noah light blue)."""
    t = lambda s: f"{int(s//3600)}:{int(s%3600//60):02}:{s%60:05.2f}"
    head = ("[Script Info]\nScriptType: v4.00+\nPlayResX: 1080\nPlayResY: 1920\n\n[V4+ Styles]\n"
            "Format: Name, Fontname, Fontsize, PrimaryColour, OutlineColour, BackColour, Bold, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV\n"
            "Style: C,Archivo Black,110,&H00FFFFFF,&H00000000,&H64000000,1,1,7,2,2,160,160,560\n"
            "Style: L,Archivo Black,110,&H00C89CFF,&H00000000,&H64000000,1,1,7,2,2,160,160,560\n"
            "Style: N,Archivo Black,110,&H00FFD08F,&H00000000,&H64000000,1,1,7,2,2,160,160,560\n"
            "Style: M,Archivo Black,110,&H006BD3FF,&H00000000,&H64000000,1,1,7,2,2,160,160,560\n"
            "Style: H,Archivo Black,96,&H0000E1FF,&H00000000,&H96000000,1,1,8,3,8,90,90,300\n\n[Events]\n"
            "Format: Layer, Start, End, Style, Text\n")
    sty = lambda c: SPEAKER_STYLE.get((speakers or {}).get(c[0].get("line"), ""), "C")
    last = {}
    for c in cue_list:
        last[c[-1].get("line")] = c[-1].get("start")
    def pop(c):   # 2026-11-24: each word pops in; long words and each line's last word are bigger + yellow (FB reel style)
        txt = " ".join(w["word"] for w in c).upper()
        core = re.sub(r"[^A-Z0-9]", "", txt)
        big = len(core) >= 8 or c[-1].get("start") == last.get(c[-1].get("line"))
        anim = r"{\fscx70\fscy70\t(0,90,\fscx112\fscy112)\t(90,160,\fscx100\fscy100)" + (r"\c&H0000E1FF&\fs132" if big else "") + "}"
        return anim + txt
    ev = [f"Dialogue: 0,{t(c[0]['start'])},{t(max(c[-1]['hold'], c[0]['start'] + 0.15))},{sty(c)},{pop(c)}"
          for c in cue_list]
    for st, txt in cards:   # 2026-11-24: big yellow chapter cards ("MONDAY") at the start of a line, like the owner's reference reel
        ev.append(f"Dialogue: 1,{t(st)},{t(st + 1.5)},H,{{\\fad(120,200)\\fscx70\\fscy70\\t(0,140,\\fscx105\\fscy105)\\t(140,240,\\fscx100\\fscy100)}}{txt.upper()}")
    if hook:   # 2026-11-23 owner growth plan: a big yellow hook title on the very first frame, seen before any word is spoken
        ev.insert(0, f"Dialogue: 1,{t(0)},{t(hook_until)},H,{{\\fad(0,250)}}{hook.upper()}")
    Path(path).write_text(head + "\n".join(ev) + "\n", encoding="utf-8")


TR = 0.28   # seconds each side of a cut used by a transition


def shot_fx(out, n):
    """2026-11-24 (owner's FB reel reference): transitions between shots + glitch windows, read from shotspec.json.
    A shot's "trans" is the transition INTO it: zoom (zoom-through), flash (white), whip (motion blur), glitch, cut.
    Default: zoom when the location changes, a plain cut otherwise. "glitch": [[a, b], ...] = fractions of the shot."""
    f = out / "shotspec.json"
    if not f.exists():
        return [{} for _ in range(n)]
    sh = [s for s in json.loads(f.read_text(encoding="utf-8"))["shots"] if s.get("partOf") is None]
    by = {s["line"]: s for s in sh}
    res = []
    for i in range(n):
        s, p = by.get(i, {}), by.get(i - 1)
        tin = s.get("trans") or ("zoom" if p and p.get("loc") != s.get("loc") else "cut")
        res.append({"in": "cut" if i == 0 else tin, "glitch": s.get("glitch", []), "blackout": s.get("blackout")})
    for i in range(n):
        res[i]["out"] = res[i + 1]["in"] if i + 1 < n else "cut"
    return res


def fx_filters(fx, d):
    """ffmpeg filters for one part of duration d (time starts at 0 in the part)."""
    f, a, b = [], fx.get("in", "cut"), fx.get("out", "cut")
    zin = f"2.2*pow(max(0,1-(in/{FPS})/{TR}),2)" if a == "zoom" else "0"
    zout = f"2.2*pow(max(0,((in/{FPS})-{d - TR:.3f})/{TR}),2)" if b == "zoom" else "0"
    if a == "zoom" or b == "zoom":
        f.append(f"zoompan=z='1+{zin}+{zout}':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps={FPS}")
        if a == "zoom":
            f.append(f"boxblur=8:1:enable='lt(t,{TR * 0.6:.3f})'")
        if b == "zoom":
            f.append(f"boxblur=8:1:enable='gt(t,{d - TR * 0.6:.3f})'")
    if a == "flash":
        f.append("fade=t=in:st=0:d=0.22:color=white")
    if b == "flash":
        f.append(f"fade=t=out:st={max(0, d - 0.08):.3f}:d=0.08:color=white")
    if a == "whip":
        f.append("gblur=sigma=40:sigmaV=0.5:enable='lt(t,0.14)'")
    if b == "whip":
        f.append(f"gblur=sigma=40:sigmaV=0.5:enable='gt(t,{d - 0.14:.3f})'")
    if fx.get("blackout") is not None:   # 2026-11-24 ep17: white flash, then black to the end of the shot (an off-screen accident, nothing shown)
        x = float(fx["blackout"]) * d
        f.append(f"fade=t=out:st={x:.3f}:d=0.12:color=white")
        f.append(f"drawbox=x=0:y=0:w=iw:h=ih:color=black:t=fill:enable='gt(t,{x + 0.2:.3f})'")
    if a == "black":
        f.append("fade=t=in:st=0:d=0.8:color=black")
    wins = [(0, 0.3)] if a == "glitch" else []
    wins += [(x * d, y * d) for x, y in fx.get("glitch", [])]
    for x, y in wins:
        en = f"enable='between(t,{x:.3f},{y:.3f})'"
        f.append(f"rgbashift=rh=-16:bh=16:gv=5:{en}")
        f.append(f"noise=alls=28:allf=t:{en}")
    return f


def main(vid, narrate_only=False):
    out = ROOT / "output" / vid
    out.mkdir(parents=True, exist_ok=True)
    sc = script_for(vid)
    data, wav = narrate(sc["lines"], out)
    times = data["times"]
    total = times[-1]["end"] + sc.get("tail_hold", 0.8)
    print(f"narration: {len(data['words'])} words, whisper match {data['match_ratio']:.0%}, {total:.1f}s")
    leaks = tag_leaks(sc["lines"], data.get("heard", []))
    if leaks:
        sys.exit(f"VOICE GATE FAIL: Fish tag words were spoken aloud: {leaks}. Remove/replace those tags and re-narrate.")
    if narrate_only:
        for i, t in enumerate(times):
            print(f"line {i}: {(times[i + 1]['start'] if i + 1 < len(times) else total) - t['start']:.2f}s")
        return
    shots = {s["line"]: s for s in json.loads((out / "shots.json").read_text(encoding="utf-8"))["shots"]}
    missing = [i for i in range(len(times)) if i not in shots or not (out / shots[i]["file"]).exists()]
    if missing:
        sys.exit(f"missing downloaded clips for lines {missing}: not assembling an incomplete video")
    parts = []
    sfx = shot_fx(out, len(times))
    for i, t in enumerate(times):  # slot = from this line's start (0 for the first) to the next line's start
        a = 0 if i == 0 else t["start"]
        b = times[i + 1]["start"] if i + 1 < len(times) else total
        seg = out / "parts" / f"p{i:02}.mp4"
        seg.parent.mkdir(exist_ok=True)
        src = out / shots[i]["file"]
        if src.suffix.lower() in (".png", ".jpg", ".jpeg", ".webp"):
            ff("-loop", "1", "-i", src, "-vf", kenburns(i, b - a), "-t", f"{b - a:.3f}",
               "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", seg)
        else:
            ff("-i", src, "-an", "-vf",
               ",".join([f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS},tpad=stop_mode=clone:stop_duration=30"]
                        + fx_filters(sfx[i], b - a) + ["format=yuv420p"]),
               "-t", f"{b - a:.3f}", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", seg)
        parts.append(seg)
    lst = out / "parts" / "list.txt"
    lst.write_text("".join(f"file '{p.name}'\n" for p in parts))
    silent = out / "parts" / "silent.mp4"
    ff("-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", silent)
    mix = out / "mix.wav"
    import soundfile as sf
    v, sr = sf.read(str(wav))
    # 2026-11-25 (owner Rule AE: "na-cut agad ang dulo"): pad the voice with silence up to the full video length, so the
    # music bed and the picture keep playing for tail_hold after the last word (-shortest below used to cut the ending).
    need = int(round(total * sr))
    if len(v) < need:
        import numpy as np
        v = np.concatenate([v, np.zeros((need - len(v),) + v.shape[1:], dtype=v.dtype)])
    audio.write(mix, audio.mix(v, bed_name=sc.get("music", "musicbox"), music_gain=sc.get("music_gain", 0.13)))
    cl = captions.cues(data["words"], max_chars=1)  # one word per cue (competitor style)
    captions.srt(cl, out / "final.srt")
    ass(cl, out / "parts" / "captions.ass", {i: l.get("speaker", "") for i, l in enumerate(sc["lines"])},
        hook=sc.get("hook_text"), hook_until=sc.get("hook_until", 2.6),
        cards=[(times[i]["start"], l["card"]) for i, l in enumerate(sc["lines"][:len(times)]) if l.get("card")])
    fonts = (ROOT / "assets" / "fonts").as_posix().replace(":", "\\:")
    sub = (out / "parts" / "captions.ass").as_posix().replace(":", "\\:")
    # constant gain to the target loudness + a peak limiter (NOT ffmpeg's loudnorm, which falls back to dynamic mode when the
    # gain would exceed the true-peak limit and then flattens Rule Q's loud/soft differences between lines)
    pass1 = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(mix), "-af", "loudnorm=I=-14:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
    try:
        meas = float(json.loads(pass1[pass1.rindex("{"):pass1.rindex("}") + 1])["input_i"])
        ln = f"volume={-13.4 - meas:.2f}dB,alimiter=limit=0.8:attack=3:release=60:level=0"
    except Exception:
        ln = "loudnorm=I=-14:TP=-1.5:LRA=20"
    ff("-i", silent, "-i", mix, "-vf", f"ass='{sub}':fontsdir='{fonts}'", "-af", ln + ",aresample=48000",
       "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-r", FPS, "-c:a", "aac", "-b:a", "160k", "-shortest", out / "final.mp4")
    print("done:", out / "final.mp4")


if __name__ == "__main__":
    main(sys.argv[1], "--narrate" in sys.argv)
