"""Jobs that GitHub Actions runs (2026-11-26: Oracle needed a card, so the channel moved to GitHub Actions + a Cloudflare Worker).

  python -m pipeline.cloudjobs env                       write .env and secrets/*.json from the Actions secrets (never printed)
  python -m pipeline.cloudjobs make --mode new|revise [--format rule|choice|underdog|school|any]
  python -m pipeline.cloudjobs uploads                   upload every APPROVED video, log REJECTED ones
  python -m pipeline.cloudjobs reconnect                 YouTube phone sign-in, saves the new token as a GitHub secret
  python -m pipeline.cloudjobs stats                     views/likes of the last 10 Shorts to Telegram
  python -m pipeline.cloudjobs publish <episode-id>      store final.mp4 + upload.json in the GitHub release "ep-<id>"

How the pieces talk:
- The Cloudflare Worker (cloud/worker/worker.js) receives every Telegram tap and starts these workflows.
- Each finished video is a GitHub release "ep-<id>". Its body is JSON: {"ep", "sha256", "title", "status", "decisions": [...]}.
  status: WAITING -> APPROVED -> UPLOADED, or REVISE -> REVISING -> WAITING, or REJECTED.
- The Worker only records the tap (after checking the button's sha8 against the release). This job re-checks the full
  sha256 of the downloaded file, writes approval.json + logs/approvals.csv, and only then upload_youtube.upload() runs
  (which refuses anything not approved for that exact file). Nothing uploads without the owner's ✅ on that file.
"""
import json
import os
import subprocess
import sys
import tempfile
import urllib.request
from datetime import datetime
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
from pipeline import approve

ROOT = approve.ROOT
REPO = os.environ.get("GITHUB_REPOSITORY", "")
RUN_URL = f"{os.environ.get('GITHUB_SERVER_URL', 'https://github.com')}/{REPO}/actions/runs/{os.environ.get('GITHUB_RUN_ID', '')}"
RECONNECT_KB = {"inline_keyboard": [[{"text": "🔑 Reconnect YouTube", "callback_data": "yt:reconnect"}]]}
ENV_KEYS = ["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID", "FISH_API_KEY", "FISH_VOICE_ID", "FISH_MODEL", "GEMINI_API_KEY",
            "GEMINI_MODEL", "YOUTUBE_REFRESH_TOKEN", "YOUTUBE_OAUTH_CLIENT"]


# ---------- helpers ----------
def say(text, kb=None):
    e = approve.env()
    try:
        approve.Bot(e.get("TELEGRAM_BOT_TOKEN")).call("sendMessage", chat_id=e.get("TELEGRAM_CHAT_ID"), text=text,
                                                      disable_web_page_preview=True, **({"reply_markup": kb} if kb else {}))
    except Exception as err:
        print("telegram failed:", err)
    print(text)


def gh(*args, token=None):
    env = {**os.environ, **({"GH_TOKEN": token} if token else {})}
    r = subprocess.run(["gh", *map(str, args)], capture_output=True, text=True, encoding="utf-8", errors="replace", env=env)
    if r.returncode:
        raise RuntimeError(f"gh {args[0]} {args[1] if len(args) > 1 else ''} failed: {r.stderr[-400:]}")
    return r.stdout


def name_of(info):
    return f"{info['status']} · {info['ep']} · {info.get('title', '')}"[:120]


def releases():
    """[(release, info)] for every episode release, newest first."""
    out = []
    for r in json.loads(gh("api", f"repos/{REPO}/releases?per_page=100")):
        if not r["tag_name"].startswith("ep-"):
            continue
        try:
            out.append((r, json.loads(r.get("body") or "{}")))
        except json.JSONDecodeError:
            pass
    return out


def save(r, info):
    gh("api", "-X", "PATCH", f"repos/{REPO}/releases/{r['id']}", "-f", f"name={name_of(info)}",
       "-f", f"body={json.dumps(info, ensure_ascii=False)}")


def fetch(ep):
    out = ROOT / "output" / ep
    out.mkdir(parents=True, exist_ok=True)
    gh("release", "download", f"ep-{ep}", "-D", out, "--clobber")
    return out


def notes_of(d):
    """Typed notes, or a Telegram voice note transcribed here (Whisper 'small', handles Taglish)."""
    if d.get("notes"):
        return d["notes"], ""
    if d.get("voice"):
        heard = approve.transcribe_voice(approve.Bot(approve.env().get("TELEGRAM_BOT_TOKEN")), d["voice"])
        return heard, heard
    return "", ""


# ---------- jobs ----------
def write_env():
    lines = [f"{k}={os.environ[k]}" for k in ENV_KEYS if os.environ.get(k)]
    (ROOT / ".env").write_text("\n".join(lines) + "\n", encoding="utf-8")
    (ROOT / "secrets").mkdir(exist_ok=True)
    for var, name in (("CLIENT_SECRET_JSON", "client_secret.json"), ("CLIENT_TV_JSON", "client_tv.json")):
        if os.environ.get(var):
            (ROOT / "secrets" / name).write_text(os.environ[var], encoding="utf-8")
    print(f".env written ({len(lines)} keys)")


def publish(ep):
    """Called by produce.make() before the video goes to Telegram, so the Worker can find it when the owner taps."""
    out = ROOT / "output" / ep
    files = [out / "final.mp4", out / "upload.json"]
    info = {"ep": ep, "sha256": approve.sha256(files[0]), "status": "WAITING", "decisions": [],
            "title": json.loads(files[1].read_text(encoding="utf-8")).get("title", "")}
    tag = f"ep-{ep}"
    try:
        r = json.loads(gh("api", f"repos/{REPO}/releases/tags/{tag}"))
    except RuntimeError:
        r = None
    if r:   # a revision: same release, new files, old decisions kept
        info["decisions"] = json.loads(r.get("body") or "{}").get("decisions", [])
        gh("release", "upload", tag, *files, "--clobber")
        save(r, info)
    else:
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as f:
            json.dump(info, f, ensure_ascii=False)
        gh("release", "create", tag, *files, "--title", name_of(info), "--notes-file", f.name, "--latest=false")
    print(f"published {tag} sha256 {info['sha256'][:12]}")


def revisions():
    from pipeline import produce, writer
    for r, info in releases():
        if info.get("status") != "REVISE":
            continue
        ep, d = info["ep"], info["decisions"][-1]
        info["status"] = "REVISING"
        save(r, info)
        try:
            notes, heard = notes_of(d)
            if heard:
                say(f"🎙️ I heard: \"{heard}\"\n(If that's wrong, tap ✏️ Revise again on the new video.)")
            fetch(ep)
            approve.record(ep, "revise", notes + (" [voice]" if heard else ""), d.get("who", "owner"))
            say(f"✏️ Rewriting {ep} with your notes, then making it again…")
            writer.write(ep, None, notes)
            produce.make(ep)   # publishes the new file (status WAITING) and sends it with fresh buttons
        except Exception as err:
            info["status"] = "WAITING"
            save(r, info)
            say(f"⚠️ Revising {ep} failed: {str(err)[:300]}\nThe old video still waits for your ✅/✏️/❌.\n{RUN_URL}")


def make(mode, fmt):
    revisions()
    if mode == "new":
        from pipeline import produce, writer
        ep = writer.write(None, None if fmt in (None, "", "any") else fmt)
        produce.make(ep)


def uploads():
    for r, info in releases():
        st, ep = info.get("status"), info.get("ep")
        if st == "REJECTED" and not info.get("logged"):
            d = info["decisions"][-1]
            fetch(ep)
            notes, heard = notes_of(d)
            approve.record(ep, "reject", notes + (" [voice]" if heard else ""), d.get("who", "owner"))
            info["logged"] = True
            save(r, info)
            continue
        if st != "APPROVED":
            continue
        out = fetch(ep)
        if approve.sha256(out / "final.mp4") != info["sha256"]:
            info["status"] = "MISMATCH"
            save(r, info)
            say(f"❌ {ep} NOT uploaded: the stored file is not the one you approved. Make it again.")
            continue
        d = [x for x in info["decisions"] if x["decision"] == "approve"][-1]
        approve.record(ep, "approve", "", d.get("who", "owner"), now=datetime.fromisoformat(d["at"]))
        p = subprocess.run([sys.executable, "-m", "pipeline.upload_youtube", "upload", ep], cwd=ROOT,
                           capture_output=True, text=True, encoding="utf-8", errors="replace")
        res = (p.stdout or "") + (p.stderr or "")
        link = next((w for w in res.split() if w.startswith("https://youtube.com/")), None)
        if link or "already uploaded" in res:
            info["status"], info["url"] = "UPLOADED", link or info.get("url", "")
            save(r, info)   # upload_youtube already sent "✅ … scheduled" to Telegram
        elif "invalid_grant" in res or "YOUTUBE_REFRESH_TOKEN" in res or "not connected" in res:
            say(f"⚠️ {ep} was NOT uploaded: the YouTube sign-in expired.\nTap the button, sign in, then I'll upload it.", RECONNECT_KB)
            return   # stays APPROVED; reconnect starts this job again
        else:
            info["status"] = "FAILED"
            save(r, info)
            say(f"⚠️ Upload of {ep} failed:\n{res.strip()[-500:]}")


def reconnect():
    from pipeline import upload_youtube
    d = upload_youtube.device_start()
    say(f"🔑 YouTube sign-in\n1. Open {d['verification_url']}\n2. Type this code: {d['user_code']}\n"
        f"3. Choose the Google account that owns the channel and allow access.\n(Code works for {int(d['expires_in']) // 60} min.)")
    upload_youtube.device_poll(d)   # writes the new token into .env
    e, pat = approve.env(), os.environ.get("GH_PAT")
    for k in ("YOUTUBE_REFRESH_TOKEN", "YOUTUBE_OAUTH_CLIENT"):
        subprocess.run(["gh", "secret", "set", k, "-R", REPO], input=e[k], text=True, check=True,
                       env={**os.environ, "GH_TOKEN": pat}, capture_output=True)
    say("✅ YouTube connected again. Uploading anything that was waiting…")
    gh("workflow", "run", "upload.yml", "-R", REPO)


def stats():
    from pipeline import upload_youtube, uploads_log
    rows = [r for r in uploads_log.current() if r.get("platform") == "youtube" and r.get("post_id")][-10:]
    if not rows:
        return say("No uploads yet.")
    req = urllib.request.Request(f"https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id={','.join(r['post_id'] for r in rows)}",
                                 headers={"Authorization": f"Bearer {upload_youtube.access_token()}"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        items = json.load(resp).get("items", [])
    items.sort(key=lambda v: -int(v["statistics"].get("viewCount", 0)))
    say("📊 Last 10 Shorts by views\n" + "\n".join(
        f"{int(v['statistics'].get('viewCount', 0)):>7,} 👁  {int(v['statistics'].get('likeCount', 0)):>4} 👍  {v['snippet']['title'][:40]}" for v in items))


if __name__ == "__main__":
    a = sys.argv[1:]
    if not a:
        sys.exit(__doc__)
    try:
        if a[0] == "env":
            write_env()
        elif a[0] == "make":
            make(a[a.index("--mode") + 1] if "--mode" in a else "new", a[a.index("--format") + 1] if "--format" in a else None)
        elif a[0] == "uploads":
            uploads()
        elif a[0] == "reconnect":
            reconnect()
        elif a[0] == "stats":
            stats()
        elif a[0] == "publish" and len(a) > 1:
            publish(a[1])
        else:
            sys.exit(__doc__)
    except Exception as err:
        say(f"⚠️ {a[0]} failed: {str(err)[:400]}\n{RUN_URL}" + ("\nIf it says 401/invalid_grant, tap 🔑." if a[0] == "stats" else ""),
            RECONNECT_KB if a[0] == "stats" else None)
        raise
