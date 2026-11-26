"""Telegram = full control (2026-11-24, cloud migration). One always-on process on the Oracle server:

  python -m pipeline.controller            (systemd service "ruleworld-bot" on the server)

Owner-only. Buttons on the keyboard:
  🎬 New video   📋 Status   📊 Stats   ⏸ Pause   ▶️ Resume   🔑 Reconnect YouTube   ❓ Help
Approval buttons under each video work as before (✅ / ✏️ notes / ❌). ✅ uploads at once to the next slot,
✏️ notes make Gemini rewrite the script and the video is made again, ❌ drops it.
Auto mode: makes one episode at each MAKE_AT time (PHT) unless paused or too many videos wait for a decision.
An upload that fails because the Google sign-in expired sends the 🔑 button by itself.
Never run this together with `python -m pipeline.approve wait` (two pollers steal each other's taps).
"""
import json
import queue
import sys
import threading
import time
import traceback
from datetime import datetime
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
from pipeline import approve, produce, upload_youtube, uploads_log, writer

ROOT = approve.ROOT
CSTATE = ROOT / "logs" / "controller.json"
MAKE_AT = ["11:00", "21:00"]   # PHT: each makes 1 episode (about 30-40 min on the server), ready long before the 3 and 8 AM slots
MAX_WAITING = 4                          # don't pile up videos the owner hasn't decided on
KB = {"keyboard": [["🎬 New video", "📋 Status"], ["📊 Stats", "⏸ Pause", "▶️ Resume"], ["🔑 Reconnect YouTube", "❓ Help"]],
      "resize_keyboard": True, "is_persistent": True}
FORMAT_KB = {"inline_keyboard": [[{"text": "🌍 Rule world", "callback_data": "new:rule"}, {"text": "🔢 Choice", "callback_data": "new:choice"}],
                                 [{"text": "💪 Underdog", "callback_data": "new:underdog"}, {"text": "🏫 School twist", "callback_data": "new:school"}],
                                 [{"text": "🎲 Any", "callback_data": "new:any"}]]}
RECONNECT_KB = {"inline_keyboard": [[{"text": "🔑 Reconnect YouTube", "callback_data": "yt:reconnect"}]]}


def cload():
    return json.loads(CSTATE.read_text()) if CSTATE.exists() else {"paused": False, "made": {}}


def csave(s):
    CSTATE.parent.mkdir(exist_ok=True)
    CSTATE.write_text(json.dumps(s, indent=1))


class Controller:
    def __init__(self):
        e = approve.env()
        self.bot = approve.Bot(e.get("TELEGRAM_BOT_TOKEN"))
        self.owner = e.get("TELEGRAM_CHAT_ID") or sys.exit("TELEGRAM_CHAT_ID missing in .env")
        self.jobs = queue.Queue()
        self.busy = None

    def say(self, text, kb=None):
        try:
            self.bot.call("sendMessage", chat_id=self.owner, text=text, reply_markup=kb or KB, disable_web_page_preview=True)
        except Exception as err:
            print("send failed:", err)

    # ---------- background work (one at a time) ----------
    def worker(self):
        while True:
            kind, arg = self.jobs.get()
            self.busy = f"{kind} {arg or ''}".strip()
            try:
                if kind == "new":
                    self.say(f"🎬 Making a new video ({arg or 'any format'})… about 30-40 min. I'll send it here.")
                    ep = writer.write(None, None if arg in (None, "any") else arg)
                    produce.make(ep)
                elif kind == "revise":
                    ep, notes = arg
                    self.say(f"✏️ Rewriting {ep} with your notes, then making it again…")
                    writer.write(ep, None, notes)
                    produce.make(ep)
                elif kind == "upload":
                    self.upload(arg)
                elif kind == "reconnect":
                    self.reconnect()
            except Exception as err:
                traceback.print_exc()
                self.say(f"⚠️ {self.busy} failed: {str(err)[:400]}")
            finally:
                self.busy = None

    def upload(self, ep):
        import subprocess
        p = subprocess.run([produce.PY, "-m", "pipeline.upload_youtube", "upload", ep], cwd=ROOT, capture_output=True, text=True, encoding="utf-8", errors="replace")
        r = (p.stdout or "") + (p.stderr or "")
        link = next((w for w in r.split() if w.startswith("https://youtube.com/")), None)
        when = next((l for l in r.splitlines() if "PHT" in l), "")
        if link:
            self.say(f"✅ Scheduled on YouTube\n{when.strip()}\n{link}")
        elif "invalid_grant" in r or "not connected" in r:
            self.say(f"⚠️ {ep} was NOT uploaded: the YouTube sign-in expired.\nTap the button, sign in, then I'll upload it.", RECONNECT_KB)
            st = cload(); st.setdefault("retry_upload", []).append(ep); csave(st)
        else:
            self.say(f"⚠️ Upload of {ep} failed:\n{r[-500:]}")

    def reconnect(self):
        d = upload_youtube.device_start()
        self.say(f"🔑 YouTube sign-in\n1. Open {d['verification_url']}\n2. Type this code: {d['user_code']}\n"
                 f"3. Choose the Google account that owns the channel and allow access.\n(Code works for {int(d['expires_in']) // 60} min.)")
        upload_youtube.device_poll(d)
        self.say("✅ YouTube connected again.")
        st = cload()
        for ep in st.pop("retry_upload", []):
            self.jobs.put(("upload", ep))
        csave(st)

    # ---------- scheduler ----------
    def scheduler(self):
        while True:
            now = datetime.now(approve.PHT)
            key = now.strftime("%Y-%m-%d ") + now.strftime("%H:%M")
            st = cload()
            if now.strftime("%H:%M") in MAKE_AT and key not in st["made"] and not st["paused"]:
                st["made"][key] = True
                st["made"] = dict(list(st["made"].items())[-50:])
                csave(st)
                if len(self.waiting()) >= MAX_WAITING:
                    self.say(f"⏭ Skipped the {now:%H:%M} video: {len(self.waiting())} videos still wait for your ✅/❌.")
                else:
                    self.jobs.put(("new", None))
            time.sleep(20)

    def waiting(self):
        done = {r["video_id"] for r in uploads_log.current()} if hasattr(uploads_log, "current") else set()
        out = []
        for d in (ROOT / "output").iterdir():
            if (d / "final.mp4").exists() and (d / "upload.json").exists() and not (d / "approval.json").exists() and d.name not in done:
                out.append(d.name)
        return sorted(out)

    # ---------- commands ----------
    def status(self):
        st = cload()
        rows = [r for r in uploads_log.current() if r.get("platform") == "youtube" and r.get("post_id")][-6:]
        up = "\n".join(f"• {(r.get('scheduled_at_pht') or '')[5:16]} {r.get('title', r['video_id'])[:45]}" for r in rows) or "none"
        w = "\n".join(f"• {x}" for x in self.waiting()) or "none"
        return (f"{'⏸ PAUSED' if st['paused'] else '▶️ Auto mode ON'} (makes videos at {', '.join(MAKE_AT)} PHT)\n"
                f"Working now: {self.busy or 'nothing'}  · queue: {self.jobs.qsize()}\n\n⏳ Waiting for your decision:\n{w}\n\n📺 Latest uploads:\n{up}")

    def stats(self):
        rows = [r for r in uploads_log.current() if r.get("platform") == "youtube" and r.get("post_id")][-10:]
        if not rows:
            return "No uploads yet."
        import urllib.request
        ids = ",".join(r["post_id"] for r in rows)
        req = urllib.request.Request(f"https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id={ids}",
                                     headers={"Authorization": f"Bearer {upload_youtube.access_token()}"})
        with urllib.request.urlopen(req, timeout=60) as r:
            items = json.load(r).get("items", [])
        items.sort(key=lambda v: -int(v["statistics"].get("viewCount", 0)))
        return "📊 Last 10 Shorts by views\n" + "\n".join(
            f"{int(v['statistics'].get('viewCount', 0)):>7,} 👁  {int(v['statistics'].get('likeCount', 0)):>4} 👍  {v['snippet']['title'][:40]}" for v in items)

    def on_text(self, t):
        t = t.strip()
        if t in ("/start", "❓ Help", "/help"):
            self.say(__doc__.split("Owner-only.")[1].split("Never run")[0].strip())
        elif t in ("🎬 New video", "/new"):
            self.say("Which format?", FORMAT_KB)
        elif t in ("📋 Status", "/status"):
            self.say(self.status())
        elif t in ("📊 Stats", "/stats"):
            try:
                self.say(self.stats())
            except Exception as err:
                self.say(f"⚠️ Stats failed ({str(err)[:120]}). If it says 401/invalid_grant, tap 🔑.", RECONNECT_KB)
        elif t in ("⏸ Pause", "/pause"):
            st = cload(); st["paused"] = True; csave(st); self.say("⏸ Auto mode paused. Approved videos still upload.")
        elif t in ("▶️ Resume", "/resume"):
            st = cload(); st["paused"] = False; csave(st); self.say("▶️ Auto mode on again.")
        elif t in ("🔑 Reconnect YouTube", "/reconnect"):
            self.jobs.put(("reconnect", None))
        else:
            return False
        return True

    def loop(self):
        state = approve.load_state()
        threading.Thread(target=self.worker, daemon=True).start()
        threading.Thread(target=self.scheduler, daemon=True).start()
        self.say("🤖 Rule World bot is online.")
        while True:
            try:
                ups = self.bot.call("getUpdates", offset=state["offset"], timeout=50, allowed_updates=["message", "callback_query"])
            except Exception as err:
                print("network error, retrying:", err)
                time.sleep(10)
                continue
            for u in ups:
                state["offset"] = u["update_id"] + 1
                approve.save_state(state)
                cb, msg = u.get("callback_query"), u.get("message")
                chat = (cb or {}).get("message", {}).get("chat", {}).get("id") if cb else (msg or {}).get("chat", {}).get("id")
                if str(chat) != str(self.owner):
                    continue
                data = (cb or {}).get("data", "")
                if cb and (data.startswith("new:") or data == "yt:reconnect"):
                    try:
                        self.bot.call("answerCallbackQuery", callback_query_id=cb["id"])
                    except Exception:
                        pass
                    self.jobs.put(("new", data[4:]) if data.startswith("new:") else ("reconnect", None))
                    continue
                if msg and not state.get("awaiting_notes") and self.on_text(msg.get("text") or ""):
                    continue
                try:
                    reply, row, cb_id = approve.handle(u, self.owner, state, transcribe=lambda fid: approve.transcribe_voice(self.bot, fid))
                except SystemExit as err:   # e.g. a button for a video that was deleted
                    reply, row, cb_id = f"⚠️ {err}", None, (cb or {}).get("id")
                approve.save_state(state)
                if cb_id:
                    try:
                        self.bot.call("answerCallbackQuery", callback_query_id=cb_id)
                    except Exception:
                        pass
                if reply:
                    self.say(reply)
                if row and row["decision"] == "approve":
                    self.jobs.put(("upload", row["video_id"]))
                elif row and row["decision"] == "revise":
                    self.jobs.put(("revise", (row["video_id"], row["notes"])))


if __name__ == "__main__":
    Controller().loop()
