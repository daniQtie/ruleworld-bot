"""Run: .venv/Scripts/python -m tests.test_approve  (offline: fake Telegram updates, temp folder)"""
import csv
import tempfile
from pathlib import Path
from pipeline import approve as A

with tempfile.TemporaryDirectory() as d:
    A.ROOT, A.LOG = Path(d), Path(d) / "logs" / "approvals.csv"
    (A.ROOT / "output" / "ep1").mkdir(parents=True)
    mp4 = A.ROOT / "output" / "ep1" / "en.mp4"
    mp4.write_bytes(b"video v1")
    OWNER = 111
    s8 = lambda: A.sha256(mp4)[:8]
    tap = lambda data, chat=OWNER: {"callback_query": {"id": "cb", "data": data, "from": {"id": 5, "username": "owner"},
                                                       "message": {"chat": {"id": chat}}}}
    text = lambda t, chat=OWNER: {"message": {"chat": {"id": chat}, "text": t}}
    st = {"offset": 0, "awaiting_notes": None}

    # strangers are ignored (trust boundary)
    assert A.handle(tap(f"approve:ep1:{s8()}", chat=999), OWNER, st)[1] is None
    assert not A.is_approved("ep1")

    # revise asks for notes, the next owner message is recorded as the notes
    reply, row, _ = A.handle(tap(f"revise:ep1:{s8()}"), OWNER, st)
    assert row is None and "notes" in reply and st["awaiting_notes"]["decision"] == "revise"
    _, row, _ = A.handle(text("Make the hook louder"), OWNER, st)
    assert row["decision"] == "revise" and row["notes"] == "Make the hook louder" and st["awaiting_notes"] is None
    assert not A.is_approved("ep1")

    # approve records who/when/hash; editing the file afterwards invalidates the approval
    _, row, _ = A.handle(tap(f"approve:ep1:{s8()}"), OWNER, st)
    assert row["approved_by"] == "owner" and row["decided_at_pht"].endswith("+08:00") and len(row["file_sha256"]) == 64
    assert A.is_approved("ep1")
    mp4.write_bytes(b"video v2")
    assert not A.is_approved("ep1")

    # voice notes are transcribed and recorded; with no transcriber (or a sticker) the bot asks again
    A.handle(tap(f"reject:ep1:{s8()}"), OWNER, st)
    voice = {"message": {"chat": {"id": OWNER}, "voice": {"file_id": "F1"}}}
    reply, row, _ = A.handle(voice, OWNER, st)
    assert row is None and "type" in reply and st["awaiting_notes"]
    reply, row, _ = A.handle(voice, OWNER, st, transcribe=lambda fid: "bagalan pa yung boses")
    assert row["decision"] == "reject" and row["notes"] == "bagalan pa yung boses [voice]" and "I heard" in reply

    # a button from an older version of the video is refused (cannot approve a file the owner has not seen)
    old = A.handle(tap("approve:ep1:deadbeef"), OWNER, st)
    assert old[1] is None and "OLDER" in old[0], old
    assert A.handle(tap("approve:ep1"), OWNER, st)[1] is None  # pre-hash buttons are refused too

    # unknown buttons / unknown videos are refused
    assert A.handle(tap(f"approve:nope:{s8()}"), OWNER, st)[1] is None
    assert A.handle(tap(f"hack:ep1:{s8()}"), OWNER, st)[1] is None

    rows = list(csv.DictReader(A.LOG.open(encoding="utf-8")))
    assert [r["decision"] for r in rows] == ["revise", "approve", "reject"]
print("ok")
