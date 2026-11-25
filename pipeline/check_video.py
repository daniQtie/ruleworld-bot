"""Measure an encoded MP4 against the objective parts of the Video QA rubric (rubrics/video-qa.md).

Usage: python -m pipeline.check_video output/<id>/final.mp4
Writes <dir>/qa/<name>-report.json, a contact sheet (up to 60 evenly spaced frames) and the first frame. Judgement items (on-model, layout,
pacing vs script) are left for the video-qa agent, which must look at the contact sheet + frames.
"""
import json
import re
import subprocess
import sys
from pathlib import Path
import numpy as np

SAFE = dict(top=220, bottom=420, right=140)


def probe(mp4):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                        "stream=codec_type,codec_name,width,height,r_frame_rate:format=duration", "-of", "json", str(mp4)],
                       capture_output=True, text=True, check=True)
    return json.loads(r.stdout)


def loudness(mp4):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(mp4), "-af", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True)
    tail = r.stderr[r.stderr.rfind("Summary:"):]
    i = re.search(r"I:\s+(-?[\d.]+) LUFS", tail)
    p = re.search(r"Peak:\s+(-?[\d.]+) dBFS", tail)
    return float(i.group(1)), float(p.group(1))


def frames(mp4, fps=10, w=108, h=192):
    """Small greyscale frames for motion analysis."""
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(mp4), "-vf", f"fps={fps},scale={w}:{h},format=gray",
                          "-f", "rawvideo", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.int16)


def static_holds(fr, fps=10, cap_rows=(136, 152), thresh=1.2, max_hold=2.5):
    """Runs where the picture (captions band masked out) barely changes for > max_hold s."""
    pic = fr.copy()
    pic[:, cap_rows[0]:cap_rows[1], :] = 0  # captions band (y ~1360-1520 at full size) is not "principal picture"
    diff = np.abs(np.diff(pic, axis=0)).mean(axis=(1, 2))
    holds, start = [], None
    for i, d in enumerate(np.append(diff, 99)):
        if d < thresh and start is None:
            start = i
        elif d >= thresh and start is not None:
            if (i - start) / fps > max_hold:
                holds.append([round(start / fps, 1), round(i / fps, 1)])
            start = None
    # big changes = cuts / new elements; report the longest gap between them
    events = np.where(diff > 6)[0] / fps
    gaps = np.diff(np.concatenate([[0], events, [len(fr) / fps]]))
    return holds, round(float(gaps.max()), 2) if len(gaps) else None


def safe_zone_ink(mp4, dur):
    """Fraction of non-background pixels in the platform-UI zones, sampled every 0.5 s (full-res)."""
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(mp4), "-vf", "fps=2,format=gray", "-f", "rawvideo", "-"],
                         capture_output=True, check=True).stdout
    fr = np.frombuffer(raw, np.uint8).reshape(-1, 1920, 1080)
    busy = np.empty(fr.shape, dtype=bool)
    for i in range(len(fr)):  # one frame at a time (a 2-min Short at full res does not fit in memory at once)
        f = fr[i].astype(np.int16)
        busy[i] = np.abs(f - int(np.median(f))) > 40
    return dict(top=round(float(busy[:, :SAFE["top"], :].mean()), 4),
                bottom=round(float(busy[:, 1920 - SAFE["bottom"]:, :].mean()), 4),
                right=round(float(busy[:, SAFE["top"]:1920 - SAFE["bottom"], 1080 - SAFE["right"]:].mean()), 4))


def main(mp4):
    mp4 = Path(mp4)
    qa = mp4.parent / "qa"
    qa.mkdir(exist_ok=True)
    info = probe(mp4)
    v = next(s for s in info["streams"] if s["codec_type"] == "video")
    a = next((s for s in info["streams"] if s["codec_type"] == "audio"), None)
    dur = float(info["format"]["duration"])
    lufs, peak = loudness(mp4)
    fr = frames(mp4)
    holds, max_gap = static_holds(fr)
    zones = safe_zone_ink(mp4, dur)
    checks = {
        "format": v["width"] == 1080 and v["height"] == 1920 and v["r_frame_rate"] == "30/1" and v["codec_name"] == "h264"
                  and a is not None and a["codec_name"] == "aac",
        "duration_120_180s": 120 <= dur <= 180,
        "loudness_-14_LUFS_±1.5": abs(lufs + 14) <= 1.5,
        "no_clipping": peak <= -0.5,
        "no_static_hold_over_2.5s": not holds,
        "safe_zones_clear": zones["top"] < 0.01 and zones["bottom"] < 0.01 and zones["right"] < 0.02,
    }
    rep = dict(file=str(mp4), duration=round(dur, 2), video=v, audio=a, lufs=lufs, true_peak_dbfs=peak,
               static_holds=holds, longest_gap_between_big_changes_s=max_gap, safe_zone_ink=zones,
               checks=checks, auto_pass=all(checks.values()))
    (qa / f"{mp4.stem}-report.json").write_text(json.dumps(rep, indent=1))
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(mp4), "-vf", f"fps={min(1, 59 / max(dur, 1)):.4f},scale=216:384,tile=10x6", "-frames:v", "1",
                    str(qa / f"{mp4.stem}-contact.png")], check=True)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(mp4), "-frames:v", "1", str(qa / f"{mp4.stem}-first.png")], check=True)
    print(json.dumps(rep, indent=1))


if __name__ == "__main__":
    main(sys.argv[1])
