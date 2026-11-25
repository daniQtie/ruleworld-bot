"""Upload log (spec §10): one row per video per platform in logs/uploads.csv. Also guards against double uploads."""
import csv
from pathlib import Path

ROOT = Path(__file__).parent.parent
LOG = ROOT / "logs" / "uploads.csv"
FIELDS = ["video_id", "title", "platform", "scheduled_at_local", "scheduled_at_pht", "uploaded_at_pht",
          "status", "post_id", "url", "error", "file_sha256"]


def rows():
    return list(csv.DictReader(LOG.open(encoding="utf-8"))) if LOG.exists() else []


def current():
    """Latest row per post (a later 'deleted'/'published'/'failed' row replaces the earlier 'scheduled' one)."""
    latest = {}
    for i, r in enumerate(rows()):
        latest[r["post_id"] or f"row{i}"] = r
    return list(latest.values())


def already_uploaded(video_id, platform, sha):
    """True if this exact file is currently live or scheduled on this platform (deleted/failed ones don't count)."""
    return any(r["video_id"] == video_id and r["platform"] == platform and r["file_sha256"] == sha
               and r["status"] in ("scheduled", "published", "uploaded") for r in current())


def append(**row):
    LOG.parent.mkdir(exist_ok=True)
    new = not LOG.exists()
    with LOG.open("a", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, FIELDS)
        if new:
            w.writeheader()
        w.writerow({k: row.get(k, "") for k in FIELDS})
