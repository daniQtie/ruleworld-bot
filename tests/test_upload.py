"""Run: .venv/Scripts/python -m tests.test_upload  (offline: no Google calls)"""
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from pipeline import approve as A, uploads_log as L, upload_youtube as Y

# publish slots: 12 PM + 7 PM US Eastern, DST-aware, at least 1 h ahead, skipping slots already taken
s = Y.next_slot(datetime(2026, 11, 17, 5, 0, tzinfo=timezone.utc))  # = 00:00 ET Nov 17 (EST, UTC-5)
assert s.strftime("%Y-%m-%d %H:%M %z") == "2026-11-17 12:00 -0500", s
assert s.astimezone(Y.PHT).strftime("%m-%d %H:%M") == "11-18 01:00"  # 1 AM PHT in winter
s = Y.next_slot(datetime(2026, 11, 17, 18, 0, tzinfo=timezone.utc))  # 13:00 ET -> noon gone, 7 PM next
assert s.strftime("%m-%d %H:%M") == "11-17 19:00" and s.astimezone(Y.PHT).strftime("%H:%M") == "08:00", s
s = Y.next_slot(datetime(2026, 11, 17, 23, 30, tzinfo=timezone.utc))  # 18:30 ET -> too close, roll to next noon
assert s.strftime("%m-%d %H:%M") == "11-18 12:00", s
taken = {"2026-11-17 19:00 ET", "2026-11-18 12:00 ET"}
s = Y.next_slot(datetime(2026, 11, 17, 18, 0, tzinfo=timezone.utc), taken)  # both taken -> Nov 18 7 PM
assert s.strftime("%m-%d %H:%M") == "11-18 19:00", s
s = Y.next_slot(datetime(2026, 7, 1, 4, 0, tzinfo=timezone.utc))  # summer: EDT, UTC-4 -> noon ET = midnight PHT
assert s.strftime("%z") == "-0400" and s.astimezone(Y.PHT).hour == 0

with tempfile.TemporaryDirectory() as d:
    A.ROOT = Y.ROOT = Path(d)
    L.LOG = Path(d) / "logs" / "uploads.csv"
    (Path(d) / "output" / "ep").mkdir(parents=True)
    (Path(d) / "output" / "ep" / "en.mp4").write_bytes(b"mp4")
    # refuses unapproved video before touching the network
    try:
        Y.upload("ep")
        raise AssertionError("uploaded an unapproved video")
    except SystemExit as e:
        assert "not approved" in str(e)
    # idempotency: a logged scheduled upload of the same file blocks a second one; a failed one does not
    L.append(video_id="ep", platform="youtube", status="failed", file_sha256="abc")
    assert not L.already_uploaded("ep", "youtube", "abc")
    L.append(video_id="ep", platform="youtube", status="scheduled", file_sha256="abc")
    assert L.already_uploaded("ep", "youtube", "abc") and not L.already_uploaded("ep", "facebook", "abc")
    assert not L.already_uploaded("ep", "youtube", "changed-file")
print("ok")

# time-bound scripts ("Tomorrow, ...") must not be scheduled after their not_after_et
from datetime import datetime as _dt
_s = _dt(2026, 11, 18, 19, 0, tzinfo=Y.ET)
assert not Y.too_late(_s, "2026-11-18 19:00") and Y.too_late(_s, "2026-11-18 18:59") and not Y.too_late(_s, None)
print("ok (not_after_et)")
