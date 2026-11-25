"""YouTube Shorts upload (Phase 3). Standard library only; no Google SDK.

  python -m pipeline.upload_youtube auth                  # one time: sign in to the Benny channel in your browser
  python -m pipeline.upload_youtube upload <id> [--at "YYYY-MM-DD HH:MM"]   # schedule (US Eastern; default = next free 12 PM or 7 PM ET slot)
  python -m pipeline.upload_youtube deleted <id>          # you deleted it in YouTube Studio: frees its slot
  python -m pipeline.upload_youtube verify <id>           # after publish time: is it really public? logs + Telegram

Needs secrets/client_secret.json (Google Cloud "Desktop app" OAuth client) and output/<id>/upload.json
({"title", "description", "tags"}). Uploads only files whose Telegram approval matches the exact MP4 (sha256),
and never the same file twice. The video goes up as private with publishAt, so YouTube publishes it at that time
even if this PC is off.
"""
import base64
import hashlib
import http.server
import json
import re
import secrets as pysecrets
import sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # Windows console is cp1252; we print emoji
import urllib.parse
import urllib.request
import webbrowser
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

from pipeline import approve, uploads_log

ROOT = Path(__file__).parent.parent
CLIENT = ROOT / "secrets" / "client_secret.json"
ET, PHT = ZoneInfo("America/New_York"), ZoneInfo("Asia/Manila")
SCOPES = "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly"
TOKEN_URL = "https://oauth2.googleapis.com/token"


def client():
    # 2026-11-24 (owner asked for a Telegram "Reconnect YouTube" button): the phone-friendly device flow needs a
    # "TVs and Limited Input devices" OAuth client (secrets/client_tv.json); .env YOUTUBE_OAUTH_CLIENT says which client
    # issued the current refresh token. Default: the original desktop client.
    name = approve.env().get("YOUTUBE_OAUTH_CLIENT", "")
    if name:
        f = ROOT / "secrets" / Path(name).name
        c = json.loads(f.read_text())
        return c.get("installed") or c.get("web") or c
    if not CLIENT.exists():
        sys.exit(f"missing {CLIENT}: download your OAuth client (Desktop app) JSON from Google Cloud and save it there")
    c = json.loads(CLIENT.read_text())
    return c.get("installed") or c["web"]


def post_form(url, data):
    req = urllib.request.Request(url, data=urllib.parse.urlencode(data).encode())
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def set_env(key, value):
    """Write/replace KEY=value in .env without printing it."""
    p = ROOT / ".env"
    s = p.read_text(encoding="utf-8") if p.exists() else ""
    s = re.sub(rf"(?m)^{key}=.*\n?", "", s).rstrip("\n") + f"\n{key}={value}\n"
    p.write_text(s, encoding="utf-8")


def auth():
    """OAuth 'installed app' loopback flow with PKCE: browser sign-in, refresh token saved to .env."""
    c = client()
    verifier = base64.urlsafe_b64encode(pysecrets.token_bytes(32)).rstrip(b"=").decode()
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).rstrip(b"=").decode()
    state = pysecrets.token_urlsafe(16)
    got = {}

    class H(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            got.update(urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query))
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write("<h2>Benny: YouTube connected. You can close this tab.</h2>".encode())

        def log_message(self, *a):
            pass

    srv = http.server.HTTPServer(("127.0.0.1", 0), H)
    redirect = f"http://127.0.0.1:{srv.server_port}"
    url = "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode(dict(
        client_id=c["client_id"], redirect_uri=redirect, response_type="code", scope=SCOPES, state=state,
        access_type="offline", prompt="consent", code_challenge=challenge, code_challenge_method="S256"))
    print("Opening your browser. Sign in with the Google account that owns the Benny YouTube channel…")
    webbrowser.open(url)
    srv.handle_request()
    if got.get("state", [""])[0] != state or "code" not in got:
        sys.exit(f"sign-in failed: {got.get('error', ['no code returned'])[0]}")
    tok = post_form(TOKEN_URL, dict(code=got["code"][0], client_id=c["client_id"], client_secret=c.get("client_secret", ""),
                                    redirect_uri=redirect, grant_type="authorization_code", code_verifier=verifier))
    if "refresh_token" not in tok:
        sys.exit("Google returned no refresh token; remove the app's access at myaccount.google.com/permissions and run auth again")
    set_env("YOUTUBE_REFRESH_TOKEN", tok["refresh_token"])
    print("✅ connected; refresh token saved to .env")


DEVICE_SCOPE = "https://www.googleapis.com/auth/youtube"   # device flow allows "youtube" (covers upload + read), not "youtube.upload"


def device_start():
    """Phone sign-in step 1: returns {user_code, verification_url, device_code, interval, expires_in}."""
    f = ROOT / "secrets" / "client_tv.json"
    if not f.exists():
        raise RuntimeError("missing secrets/client_tv.json (Google Cloud > Credentials > OAuth client 'TVs and Limited Input devices')")
    c = json.loads(f.read_text())
    c = c.get("installed") or c.get("web") or c
    return {**post_form("https://oauth2.googleapis.com/device/code", dict(client_id=c["client_id"], scope=DEVICE_SCOPE)), "_c": c}


def device_poll(d):
    """Phone sign-in step 2: wait until the owner approves on google.com/device; saves the new refresh token."""
    import time
    c, end = d["_c"], time.time() + int(d.get("expires_in", 900))
    while time.time() < end:
        time.sleep(int(d.get("interval", 5)))
        try:
            tok = post_form(TOKEN_URL, dict(client_id=c["client_id"], client_secret=c.get("client_secret", ""), device_code=d["device_code"],
                                            grant_type="urn:ietf:params:oauth:grant-type:device_code"))
        except urllib.error.HTTPError as e:
            err = json.loads(e.read() or b"{}").get("error", "")
            if err in ("authorization_pending", "slow_down"):
                continue
            raise RuntimeError(f"sign-in failed: {err}")
        if "refresh_token" in tok:
            set_env("YOUTUBE_REFRESH_TOKEN", tok["refresh_token"])
            set_env("YOUTUBE_OAUTH_CLIENT", "client_tv.json")
            return True
    raise RuntimeError("sign-in timed out")


def access_token():
    c, rt = client(), approve.env().get("YOUTUBE_REFRESH_TOKEN")
    if not rt:
        sys.exit("not connected yet: run  python -m pipeline.upload_youtube auth")
    return post_form(TOKEN_URL, dict(client_id=c["client_id"], client_secret=c.get("client_secret", ""),
                                     refresh_token=rt, grant_type="refresh_token"))["access_token"]


SLOTS_ET = (14, 16, 18)  # owner 2026-11-24: US peak 3-9 PM ET seen in analytics -> 2, 4, 6 PM ET (= 3, 5, 7 AM PHT in winter); was (12, 14, 19) since 2026-11-23


def next_slot(now=None, taken=()):
    """Earliest daily slot (US Eastern, DST-aware) at least 1 h away that no other upload already uses."""
    now = (now or datetime.now(timezone.utc)).astimezone(ET)
    taken = set(taken)
    day = now.date()
    while True:
        for h in SLOTS_ET:
            slot = datetime(day.year, day.month, day.day, h, tzinfo=ET)
            if slot - now >= timedelta(hours=1) and slot.strftime("%Y-%m-%d %H:%M ET") not in taken:
                return slot
        day += timedelta(days=1)


def too_late(slot, not_after_et):
    """True if `upload.json` sets `not_after_et` ("YYYY-MM-DD HH:MM", US Eastern) and the slot is after it.
    Used for time-bound scripts ("Tomorrow, GTA six comes out") that become wrong if posted late."""
    return bool(not_after_et) and slot > datetime.strptime(not_after_et, "%Y-%m-%d %H:%M").replace(tzinfo=ET)


def taken_slots():
    """Slots already used by scheduled/published YouTube uploads (from logs/uploads.csv)."""
    return {r["scheduled_at_local"] for r in uploads_log.current()
            if r["platform"] == "youtube" and r["status"] in ("scheduled", "published", "uploaded")}


def metadata(video_id):
    p = ROOT / "output" / video_id / "upload.json"
    if not p.exists():
        sys.exit(f"missing {p} (title, description, tags)")
    m = json.loads(p.read_text(encoding="utf-8"))
    if "#shorts" not in (m["title"] + m["description"]).lower():
        m["description"] += "\n#Shorts"
    if len(m["title"]) > 100:
        sys.exit("title is over YouTube's 100-character limit")
    return m


def report(text):
    e = approve.env()
    if e.get("TELEGRAM_BOT_TOKEN") and e.get("TELEGRAM_CHAT_ID"):
        try:
            approve.Bot(e["TELEGRAM_BOT_TOKEN"]).call("sendMessage", chat_id=e["TELEGRAM_CHAT_ID"], text=text)
        except Exception as err:  # a report failure must never hide the upload result
            print("telegram report failed:", err)
    print(text)


def upload(video_id, at=None):
    mp4 = approve.video_path(video_id)
    sha = approve.sha256(mp4)
    if not approve.is_approved(video_id):
        sys.exit("❌ not approved in Telegram (or the MP4 changed since approval); refusing to upload")
    if uploads_log.already_uploaded(video_id, "youtube", sha):
        sys.exit("already uploaded/scheduled on YouTube (see logs/uploads.csv); not uploading twice")
    m = metadata(video_id)
    slot = datetime.strptime(at, "%Y-%m-%d %H:%M").replace(tzinfo=ET) if at else next_slot(taken=taken_slots())
    if too_late(slot, m.get("not_after_et")):
        sys.exit(f"❌ not uploading: the next free slot ({slot.strftime('%b %d %I:%M %p ET')}) is later than this video's "
                 f"not_after_et ({m['not_after_et']}); its script says \"Tomorrow\" and would be wrong. Re-render it or pick another time.")
    if slot - datetime.now(timezone.utc) < timedelta(minutes=15):
        sys.exit("publish time must be at least 15 minutes in the future (US Eastern)")
    body = {"snippet": {"title": m["title"], "description": m["description"], "tags": m.get("tags", []), "categoryId": "24", "defaultLanguage": "en", "defaultAudioLanguage": "en"},
            "status": {"privacyStatus": "private", "publishAt": slot.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
                       "selfDeclaredMadeForKids": False}}
    base = dict(video_id=video_id, title=m["title"], platform="youtube", file_sha256=sha,
                scheduled_at_local=slot.strftime("%Y-%m-%d %H:%M ET"),
                scheduled_at_pht=slot.astimezone(PHT).strftime("%Y-%m-%d %H:%M PHT"))
    try:
        tok = access_token()
        req = urllib.request.Request(
            "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
            data=json.dumps(body).encode(), method="POST",
            headers={"Authorization": f"Bearer {tok}", "Content-Type": "application/json; charset=UTF-8",
                     "X-Upload-Content-Type": "video/mp4", "X-Upload-Content-Length": str(mp4.stat().st_size)})
        with urllib.request.urlopen(req, timeout=60) as r:
            session = r.headers["Location"]
        req = urllib.request.Request(session, data=mp4.read_bytes(), method="PUT",
                                     headers={"Authorization": f"Bearer {tok}", "Content-Type": "video/mp4"})
        with urllib.request.urlopen(req, timeout=600) as r:
            vid = json.load(r)["id"]
    except Exception as err:
        detail = err.read().decode()[:300] if hasattr(err, "read") else str(err)
        uploads_log.append(**base, status="failed", error=detail, uploaded_at_pht=datetime.now(PHT).strftime("%Y-%m-%d %H:%M"))
        report(f"❌ YouTube upload failed: {video_id}\n{detail}")
        sys.exit(1)
    url = f"https://youtube.com/shorts/{vid}"
    uploads_log.append(**base, status="scheduled", post_id=vid, url=url,
                       uploaded_at_pht=datetime.now(PHT).strftime("%Y-%m-%d %H:%M"))
    report(f"✅ Benny upload scheduled\n🎬 {m['title']}\n📺 YouTube: {slot.strftime('%b %d, %I:%M %p ET')} "
           f"({slot.astimezone(PHT).strftime('%b %d, %I:%M %p PHT')})\n{url}")


def verify(video_id):
    """After publish time: confirm the video really went public (old API policy locked unverified apps' uploads to private)."""
    sched = [r for r in uploads_log.rows() if r["video_id"] == video_id and r["platform"] == "youtube" and r["post_id"]]
    if not sched:
        sys.exit("no YouTube upload logged for this video")
    r = sched[-1]
    req = urllib.request.Request(f"https://www.googleapis.com/youtube/v3/videos?part=status&id={r['post_id']}",
                                 headers={"Authorization": f"Bearer {access_token()}"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        items = json.load(resp).get("items", [])
    if not items:
        status, note = "failed", "video not found (deleted or rejected)"
    else:
        st = items[0]["status"]
        status = "published" if st["privacyStatus"] == "public" else st.get("uploadStatus", st["privacyStatus"])
        note = "" if status == "published" else f"still {st['privacyStatus']}; open YouTube Studio and publish it manually"
    uploads_log.append(**{**r, "status": status, "error": note, "uploaded_at_pht": datetime.now(PHT).strftime("%Y-%m-%d %H:%M")})
    report(("✅ Live on YouTube: " if status == "published" else "⚠️ YouTube check: ") + f"{video_id}\n{r['url']}\n{note}".strip())


if __name__ == "__main__":
    a = sys.argv[1:]
    if not a:
        sys.exit(__doc__)
    if a[0] == "auth":
        auth()
    elif a[0] == "upload" and len(a) >= 2:
        upload(a[1], a[a.index("--at") + 1] if "--at" in a else None)
    elif a[0] == "verify" and len(a) == 2:
        verify(a[1])
    elif a[0] == "deleted" and len(a) == 2:  # owner deleted it in YouTube Studio: free its slot, allow a re-upload
        last = [r for r in uploads_log.current() if r["video_id"] == a[1] and r["platform"] == "youtube" and r["post_id"]]
        if not last:
            sys.exit("no YouTube upload logged for this video")
        uploads_log.append(**{**last[-1], "status": "deleted", "error": "deleted by owner in YouTube Studio"})
        print("logged as deleted; its slot is free again")
    else:
        sys.exit(__doc__)
