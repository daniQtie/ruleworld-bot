"""One command makes a whole episode, on Windows or the Linux server (2026-11-24, cloud migration):

  python -m pipeline.produce new [--format choice|rule|underdog|school]   Gemini script -> voice -> shots -> render -> video -> Telegram
  python -m pipeline.produce make <episode-id>                           same, from an existing scripts/<id>.v*.json
  python -m pipeline.produce render <episode-id>                         only render the shots + join clips (python port of render/render-ep.ps1)

Every step logs to logs/produce.log. Nothing is uploaded here: the video goes to Telegram and waits for the owner's ✅.
"""
import json
import os
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
ROOT = Path(__file__).resolve().parent.parent
PY = sys.executable
LOG = ROOT / "logs" / "produce.log"


def log(msg):
    line = f"{datetime.now():%Y-%m-%d %H:%M:%S} {msg}"
    print(line, flush=True)
    LOG.parent.mkdir(exist_ok=True)
    with LOG.open("a", encoding="utf-8") as f:
        f.write(line + "\n")


def run(args, cwd=ROOT, check=True):
    r = subprocess.run(args, cwd=cwd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if check and r.returncode:
        raise RuntimeError(f"{' '.join(map(str, args[:4]))} failed: {(r.stderr or r.stdout)[-600:]}")
    return r.stdout


def render(ep):
    out = ROOT / "output" / ep
    (out / "clips").mkdir(parents=True, exist_ok=True)
    spec = json.loads((out / "shotspec.json").read_text(encoding="utf-8"))["shots"]
    for s in spec:
        run(["node", "render.js", f"story.html?ep={ep}&shot={s['line']}", str(out / "clips" / f"raw{s['line']:03d}.mp4"), str(s["dur"])], cwd=ROOT / "render")
    mains = [s["line"] for s in spec if s.get("partOf") is None]
    for n in mains:
        parts = [n] + [s["line"] for s in spec if s.get("partOf") == n]
        raws = [out / "clips" / f"raw{p:03d}.mp4" for p in parts]
        dst = out / "clips" / f"s{n:02d}.mp4"
        if len(raws) == 1:
            shutil.copyfile(raws[0], dst)
        else:
            lst = out / "clips" / "join.txt"
            lst.write_text("".join(f"file '{r.as_posix()}'\n" for r in raws))
            run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", str(dst)])
    (out / "shots.json").write_text(json.dumps({"shots": [{"line": n, "file": f"clips/s{n:02d}.mp4"} for n in mains]}), encoding="utf-8")


def make(ep):
    out = ROOT / "output" / ep
    out.mkdir(parents=True, exist_ok=True)
    log(f"{ep}: voice")
    run([PY, "-m", "pipeline.voicecheck", ep, "--tries", "2"], check=False)
    if not json.loads((out / "qa" / "voice-check.json").read_text()).get("pass"):
        log(f"{ep}: voice check failed on some lines (continuing; captions follow the real audio)")
    log(f"{ep}: shots")
    sc = json.loads(sorted((ROOT / "scripts").glob(f"{ep}.v*.json"))[-1].read_text(encoding="utf-8"))
    if any(l.get("shot") for l in sc["lines"]) or not (ROOT / "render" / "specs" / f"{ep}.mjs").exists():
        run([PY, "-m", "pipeline.autoshots", ep])
    else:
        run(["node", f"render/specs/{ep}.mjs"])
    log(f"{ep}: render")
    render(ep)
    log(f"{ep}: assemble")
    run([PY, "-m", "pipeline.assemble", ep])
    chk = run([PY, "-m", "pipeline.check_video", str(out / "final.mp4")], check=False)
    (out / "upload.json").write_text(json.dumps(sc["upload"], indent=1, ensure_ascii=False), encoding="utf-8")
    shutil.rmtree(out / "parts", ignore_errors=True)   # disk: parts are only needed while assembling
    if os.environ.get("GITHUB_ACTIONS"):   # cloud: store the file first so the Worker can find it when the owner taps
        from pipeline import cloudjobs
        cloudjobs.publish(ep)
    log(f"{ep}: send to Telegram")
    run([PY, "-m", "pipeline.approve", "send", ep])
    log(f"{ep}: done ({'checks ok' if 'false' not in chk.lower() else 'check warnings, see output'})")
    return ep


if __name__ == "__main__":
    a = sys.argv[1:]
    if not a:
        sys.exit(__doc__)
    if a[0] == "new":
        from pipeline import writer
        fmt = a[a.index("--format") + 1] if "--format" in a else None
        make(writer.write(None, fmt))
    elif a[0] == "make" and len(a) > 1:
        make(a[1])
    elif a[0] == "render" and len(a) > 1:
        render(a[1])
    else:
        sys.exit(__doc__)
