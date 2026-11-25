"""Storyboard sheets for the owner: ONE picture per script line, 6 per page, numbered, with the exact line under each picture.

  python -m pipeline.storyboard <episode-id>            -> output/<id>/storyboard-N.png (renders the stills first if missing)
  python -m pipeline.storyboard <episode-id> --no-stills  -> only rebuild the sheets from the existing stills

Owner workflow (2026-11-23): script -> storyboard -> owner says "shot 7: ..." -> fix only those shots, rebuild the sheets
-> when approved, render the full video. Needs output/<id>/shotspec.json (render/specs/<id>.mjs) and the narration.
Pillow is required (pip install pillow, already present in the system Python used by the project scripts).
"""
import json
import subprocess
import sys
import textwrap
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def main(ep: str, stills: bool = True):
    from PIL import Image, ImageDraw, ImageFont
    out = ROOT / "output" / ep
    vs = sorted((ROOT / "scripts").glob(f"{ep}.v*.json"), key=lambda p: int(p.stem.split(".v")[-1].split(".")[0]) if p.stem.split(".v")[-1].split(".")[0].isdigit() else 0)
    vs = [p for p in vs if not p.name.endswith(".qa.json")]
    lines = json.loads(vs[-1].read_text(encoding="utf-8"))["lines"]
    st = out / "stills"
    if stills:
        subprocess.run(["powershell", "-File", str(ROOT / "render" / "stills-ep.ps1"), ep], check=True)
    fnt, fb = ImageFont.truetype("arial.ttf", 27), ImageFont.truetype("arialbd.ttf", 40)
    W, H, per = 360, 640, 6
    pages = []
    for p in range(0, len(lines), per):
        sheet = Image.new("RGB", (3 * (W + 20) + 20, 2 * (H + 190) + 20), (18, 18, 22))
        d = ImageDraw.Draw(sheet)
        for k, i in enumerate(range(p, min(p + per, len(lines)))):
            x, y = 20 + (k % 3) * (W + 20), 20 + (k // 3) * (H + 190)
            im = Image.open(st / f"s{i:03d}.png")
            third = im.width // 3                      # stills hold 3 frames (15 / 55 / 95 %): use the middle one
            sheet.paste(im.crop((third, 0, 2 * third, im.height)).resize((W, H)), (x, y))
            d.rectangle([x, y, x + 70, y + 54], fill=(230, 60, 60))
            d.text((x + 10, y + 5), str(i + 1), font=fb, fill="white")
            d.multiline_text((x, y + H + 8), "\n".join(textwrap.wrap(lines[i]["text"], 24)), font=fnt, fill=(235, 235, 235), spacing=4)
        f = out / f"storyboard-{p // per + 1}.png"
        sheet.save(f)
        pages.append(f)
    print("\n".join(str(x) for x in pages))


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1], "--no-stills" not in sys.argv)
