"""Owner approval over Telegram (Phase 2). Standard library only.

  python -m pipeline.approve chatid         # after you message your bot once: prints your chat id for .env
  python -m pipeline.approve send <id>      # sends output/<id>/final.mp4 (or en.mp4) with ✅ Approve / ✏️ Revise / ❌ Reject buttons
  python -m pipeline.approve wait [<id>]    # listens for your tap (+ notes for Revise/Reject) and records it
  python -m pipeline.approve status <id>    # shows the latest decision and whether it still matches the file

Every decision is appended to logs/approvals.csv and written to output/<id>/approval.json with who, when (PHT),
the decision, notes and the sha256 of the exact MP4 you saw. Phase 3 uploads only if that hash still matches.
"""
import csv
import hashlib
import json
import sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # Windows console is cp1252; we print emoji
import time
import urllib.request
import uuid
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).parent.parent
LOG = ROOT / "logs" / "approvals.csv"
STATE = ROOT / "logs" / "telegram_state.json"  # update offset + pending note requests
PHT = ZoneInfo("Asia/Manila")
FIELDS = ["video_id", "decision", "notes", "approved_by", "decided_at_pht", "file", "file_sha256"]
LABELS = {"approve": "✅ Approve", "revise": "✏️ Revise", "reject": "❌ Reject"}


def env():
    """Read KEY=VALUE lines from .env (no dependency). Secrets never get printed."""
    out = {}
    p = ROOT / ".env"
    if p.exists():
        for line in p.read_text(encoding="utf-8").splitlines():
            if "=" in line and not line.lstrip().startswith("#"):
                k, v = line.split("=", 1)
                out[k.strip()] = v.strip().strip('"').strip("'")
    return out


class Bot:
    def __init__(self, token):
        if not token:
            sys.exit("TELEGRAM_BOT_TOKEN is missing in .env (see .env.example)")
        self.base = f"https://api.telegram.org/bot{token}/"

    def call(self, method, timeout=70, **params):
        req = urllib.request.Request(self.base + method, data=json.dumps(params).encode(),
                                     headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=timeout) as r:
            res = json.load(r)
        if not res.get("ok"):
            raise RuntimeError(f"Telegram {method} failed: {res.get('description')}")
        return res["result"]

    def send_video(self, chat_id, path, caption, keyboard):
        """multipart/form-data upload (bots may upload up to 50 MB)."""
        b = uuid.uuid4().hex
        fields = {"chat_id": str(chat_id), "caption": caption, "supports_streaming": "true",
                  "reply_markup": json.dumps(keyboard)}
        try:  # without width/height Telegram may not show a vertical 9:16 video full screen
            import subprocess
            info = json.loads(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                                              "stream=width,height:format=duration", "-of", "json", str(path)],
                                             capture_output=True, text=True).stdout)
            st = info["streams"][0]
            fields.update(width=str(st["width"]), height=str(st["height"]), duration=str(int(float(info["format"]["duration"]))))
        except Exception:
            pass
        body = b"".join(f'--{b}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode() for k, v in fields.items())
        body += (f'--{b}\r\nContent-Disposition: form-data; name="video"; filename="{path.name}"\r\n'
                 f"Content-Type: video/mp4\r\n\r\n").encode() + path.read_bytes() + f"\r\n--{b}--\r\n".encode()
        req = urllib.request.Request(self.base + "sendVideo", data=body,
                                     headers={"Content-Type": f"multipart/form-data; boundary={b}"})
        with urllib.request.urlopen(req, timeout=300) as r:
            res = json.load(r)
        if not res.get("ok"):
            raise RuntimeError(f"Telegram sendVideo failed: {res.get('description')}")
        return res["result"]


def sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def _video(video_id):
    """final.mp4 (OpenArt story pipeline) or en.mp4 (older Stickman episodes)."""
    d = ROOT / "output" / video_id
    return d / "final.mp4" if (d / "final.mp4").exists() else d / "en.mp4"


def video_path(video_id):
    p = _video(video_id)
    if not p.exists():
        sys.exit(f"not found: {p}")
    return p


def load_state():
    return json.loads(STATE.read_text()) if STATE.exists() else {"offset": 0, "awaiting_notes": None}


def save_state(s):
    STATE.parent.mkdir(exist_ok=True)
    STATE.write_text(json.dumps(s))


def record(video_id, decision, notes, who, now=None):
    """Append the decision to logs/approvals.csv and output/<id>/approval.json. Returns the row."""
    p = video_path(video_id)
    row = dict(video_id=video_id, decision=decision, notes=notes or "", approved_by=who,
               decided_at_pht=(now or datetime.now(PHT)).isoformat(timespec="seconds"),
               file=str(p.relative_to(ROOT)), file_sha256=sha256(p))
    LOG.parent.mkdir(exist_ok=True)
    new = not LOG.exists()
    with LOG.open("a", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, FIELDS)
        if new:
            w.writeheader()
        w.writerow(row)
    (p.parent / "approval.json").write_text(json.dumps(row, indent=1, ensure_ascii=False), encoding="utf-8")
    return row


def is_approved(video_id):
    """True only if the latest decision is 'approve' AND the MP4 is byte-identical to what was approved."""
    a = ROOT / "output" / video_id / "approval.json"
    if not a.exists():
        return False
    row = json.loads(a.read_text(encoding="utf-8"))
    return row["decision"] == "approve" and row["file_sha256"] == sha256(video_path(video_id))


def transcribe_voice(bot, file_id):
    """Telegram voice note (OGG/Opus) -> text with multilingual Whisper 'small' (handles Taglish). Local, free."""
    import subprocess
    import tempfile
    import soundfile as sf
    from faster_whisper import WhisperModel
    f = bot.call("getFile", file_id=file_id)
    with tempfile.TemporaryDirectory() as d:
        ogg, wav = Path(d) / "v.ogg", Path(d) / "v.wav"
        with urllib.request.urlopen(bot.base.replace("/bot", "/file/bot") + f["file_path"], timeout=120) as r:
            ogg.write_bytes(r.read())
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(ogg), "-ar", "16000", "-ac", "1", str(wav)], check=True)
        audio, _ = sf.read(str(wav), dtype="float32")
    segs, _ = WhisperModel("small", device="cpu", compute_type="int8").transcribe(audio)
    return " ".join(s.text.strip() for s in segs).strip()


def handle(update, owner_chat, state, transcribe=None):
    """Process one Telegram update. Returns (reply_text, recorded_row_or_None, callback_id_or_None).
    Only the owner's chat is trusted; everything else is ignored. `transcribe(file_id) -> text` enables voice notes."""
    cb = update.get("callback_query")
    msg = update.get("message")
    chat = (cb or {}).get("message", {}).get("chat", {}).get("id") if cb else (msg or {}).get("chat", {}).get("id")
    if str(chat) != str(owner_chat):
        return None, None, (cb or {}).get("id")
    if cb:
        action, _, rest = cb.get("data", "").partition(":")
        vid, _, sha8 = rest.rpartition(":")  # buttons carry the first 8 hex of the file hash they were sent with
        if action not in LABELS or not _video(vid).exists():
            return "Unknown button.", None, cb["id"]
        if sha256(_video(vid))[:8] != sha8:  # a button from an older version of this video
            return "⚠️ That button belongs to an OLDER version of this video. Use the buttons on the newest message.", None, cb["id"]
        who = cb["from"].get("username") or str(cb["from"]["id"])
        if action == "approve":
            row = record(vid, "approve", "", who)
            return f"✅ Approved {vid}\nsha256 {row['file_sha256'][:12]}… recorded.", row, cb["id"]
        state["awaiting_notes"] = {"video_id": vid, "decision": action, "who": who}
        return f"{LABELS[action]}: {vid}\nReply with your notes (what should change?).", None, cb["id"]
    if msg and state.get("awaiting_notes"):
        notes, heard = (msg.get("text") or "").strip(), ""
        voice = msg.get("voice") or msg.get("audio")
        if not notes and voice and transcribe:
            notes = heard = transcribe(voice["file_id"])
        if not notes:  # photo/sticker/unreadable voice: say so instead of ignoring it
            return "I couldn't read that. Please type your notes, or send a voice message.", None, None
        a = state["awaiting_notes"]
        state["awaiting_notes"] = None
        row = record(a["video_id"], a["decision"], notes + (" [voice]" if heard else ""), a["who"])
        echo = f"\nI heard: \"{heard}\"\n(If that's wrong, tap ✏️ Revise again and resend.)" if heard else ""
        return f"{LABELS[a['decision']]} recorded for {a['video_id']} with your notes.{echo}", row, None
    return None, None, None


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    cmd, args, e = sys.argv[1], sys.argv[2:], env()
    if cmd == "status":
        a = ROOT / "output" / args[0] / "approval.json"
        print(a.read_text(encoding="utf-8") if a.exists() else "no decision yet")
        print("upload allowed:", is_approved(args[0]))
        return
    bot = Bot(e.get("TELEGRAM_BOT_TOKEN"))
    if cmd == "chatid":
        ups = bot.call("getUpdates", timeout=30)
        chats = {u["message"]["chat"]["id"]: u["message"]["chat"].get("first_name", "") for u in ups if "message" in u}
        print("\n".join(f"TELEGRAM_CHAT_ID={c}   ({n})" for c, n in chats.items()) or "No messages yet: open your bot in Telegram, send /start, then run this again.")
        return
    owner = e.get("TELEGRAM_CHAT_ID") or sys.exit("TELEGRAM_CHAT_ID is missing in .env (run: python -m pipeline.approve chatid)")
    if cmd == "send":
        vid = args[0]
        p = video_path(vid)
        qa = ROOT / "output" / vid / "qa" / "video-qa.json"
        verdict = "PASS" if qa.exists() and json.loads(qa.read_text(encoding="utf-8")).get("pass") else "see qa/"
        send = p
        if p.stat().st_size / 1e6 > 20:  # bots upload max 50 MB and big uploads time out on slow links: send a smaller preview, buttons still lock the REAL file's sha
            send = p.with_name(p.stem + "-preview.mp4")
            import subprocess
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(p), "-vf", "scale=720:1280", "-c:v", "libx264",
                            "-crf", "30", "-preset", "veryfast", "-movflags", "+faststart", "-c:a", "aac", "-b:a", "96k", str(send)], check=True)
            if send.stat().st_size / 1e6 > 49:
                sys.exit(f"preview is still {send.stat().st_size / 1e6:.0f} MB; Telegram bots can upload max 50 MB")
        kb = {"inline_keyboard": [[{"text": t, "callback_data": f"{k}:{vid}:{sha256(p)[:8]}"} for k, t in LABELS.items()]]}
        bot.send_video(owner, send, f"🎬 Story episode for approval\n{vid}\nVideo QA: {verdict}\nsha256 {sha256(p)[:12]}…"
                       + ("\n(preview, compressed for Telegram)" if send != p else ""), kb)
        print(f"sent {vid} to Telegram; now run: python -m pipeline.approve wait {vid}")
        return
    if cmd == "wait":
        want = args[0] if args else None
        state = load_state()
        print("waiting for your decision in Telegram (Ctrl+C to stop)…")
        while True:
            try:
                ups = bot.call("getUpdates", offset=state["offset"], timeout=60, allowed_updates=["message", "callback_query"])
            except OSError as err:  # network blip: retry, don't lose the offset
                print("network error, retrying in 10 s:", err)
                time.sleep(10)
                continue
            for u in ups:
                state["offset"] = u["update_id"] + 1
                m = u.get("message", {})
                if "voice" in m and state.get("awaiting_notes") and str(m.get("chat", {}).get("id")) == str(owner):
                    bot.call("sendMessage", chat_id=owner, text="🎙️ Got your voice note, transcribing…")
                reply, row, cb_id = handle(u, owner, state, transcribe=lambda fid: transcribe_voice(bot, fid))
                if cb_id:
                    try:
                        bot.call("answerCallbackQuery", callback_query_id=cb_id)
                    except Exception as err:  # Telegram rejects answers to old taps (HTTP 400); never let that kill the listener
                        print("could not answer tap (probably an old one):", err)
                if reply:
                    bot.call("sendMessage", chat_id=owner, text=reply)
                save_state(state)
                if row:
                    print(json.dumps(row, indent=1, ensure_ascii=False))
                    if want is None or row["video_id"] == want:
                        return
    sys.exit(f"unknown command {cmd!r}\n{__doc__}")


if __name__ == "__main__":
    main()
