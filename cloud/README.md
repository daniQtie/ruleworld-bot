# Moving Rule World Stories to the Oracle free server

After this move, the channel runs without this laptop and without Claude. The owner controls everything from the Telegram bot.

## What runs where

| Part | Tool | Cost |
|---|---|---|
| Server, always on | Oracle Cloud Always Free (Ampere A1, 4 CPU, 24 GB, Ubuntu) | ₱0 (card only for verification) |
| Script writer | Gemini API (free key), `pipeline/writer.py` | ₱0 |
| Shots | Templates, `pipeline/autoshots.py` (no hand-written specs) | ₱0 |
| Voice | Fish Audio "Adam" (`FISH_API_KEY`) | paid, as now |
| Render | three.js in headless Chromium (CPU), `render/render.js` | ₱0 |
| Video | ffmpeg + Whisper captions, `pipeline/assemble.py` | ₱0 |
| Control | Telegram bot, `pipeline/controller.py` (systemd service `ruleworld-bot`) | ₱0 |
| Upload | YouTube Data API, `pipeline/upload_youtube.py`; slots 3 / 5 / 7 AM PHT | ₱0 |

## Owner's to-do (accounts and keys only the owner can make)

1. **Oracle Cloud Free Tier** at oracle.com/cloud/free.
   - Home region: Singapore.
   - Use a password **without your name**.
   - Do **not** upgrade to Pay As You Go.
2. **Create the server** (Claude guides this live).
   - Go to Compute → Instances → Create instance.
   - Image: **Ubuntu 24.04**. Shape: **Ampere VM.Standard.A1.Flex, 4 OCPU, 24 GB**. Boot volume: 100 GB.
   - "Save private key": keep the downloaded `.key` file safe. It is the only way in.
   - If you get "Out of capacity", try again later or pick another availability domain.
3. **Gemini API key** at aistudio.google.com → Get API key (free). Claude adds it to `.env` as `GEMINI_API_KEY`. Never paste it in chat.
4. **YouTube app → In production** so the sign-in stops expiring every 7 days.
   - Open console.cloud.google.com → Google Auth Platform → Audience → **Publish app**.
5. **Phone sign-in client** for the Telegram 🔑 button.
   - Open Google Cloud → APIs & Services → Credentials → Create credentials → OAuth client ID → **TVs and Limited Input devices**.
   - Download the JSON and save it as `secrets/client_tv.json`.

## Install (Claude does this over SSH)

```bash
# from the laptop: copy the project (without old videos) to the server
tar --exclude=output --exclude=.venv --exclude=render/node_modules --exclude=backups -czf ruleworld.tgz -C .. benny-handoff
scp -i server.key ruleworld.tgz ubuntu@SERVER_IP:~
ssh -i server.key ubuntu@SERVER_IP 'tar xzf ruleworld.tgz && cd benny-handoff && bash cloud/install.sh'
# .env and secrets/ go in the same archive (they are inside benny-handoff); they never leave the two machines
```

Then:
- Stop every listener on the laptop. **Only one Telegram poller may run.**
- Start the bot on the server: `sudo systemctl start ruleworld-bot`, then check `journalctl -u ruleworld-bot -f`.

## Daily use (Telegram only)

- Automatic: the bot makes one video at **11:00, 15:00 and 21:00 PHT** and sends each one to you.
  - ✅ uploads it to the next free slot (3, 5 or 7 AM PHT).
  - ✏️ plus a typed or voice note makes Gemini rewrite it and the video is made again.
  - ❌ drops it.
- **🎬 New video**: make one now. You pick the format: rule world, choice, underdog or school twist.
- **📋 Status**: what is being made, what waits for you, and the latest uploads.
- **📊 Stats**: views and likes of the last 10 Shorts.
- **⏸ Pause / ▶️ Resume**: stop or restart automatic videos. Approved videos still upload while paused.
- **🔑 Reconnect YouTube**: the bot sends a code.
  1. Open google.com/device on your phone.
  2. Type the code and pick the channel's Google account.
  3. Videos that failed to upload are retried by themselves.

  The button also appears by itself when an upload fails because the sign-in expired.

## If something breaks

- No messages from the bot: the server may be stopped.
  - In the Oracle console, open Instances → Start.
  - The bot restarts by itself (systemd `Restart=always`).
- "Gemini … failed": the free quota is used up for the day. It works again tomorrow, or press 🎬 later.
- Disk full: delete old folders in `output/` (an uploaded video is safe on YouTube).
- Rules that still apply: see `CLAUDE.md` and `rubrics/owner-feedback.md`.
  - Rule AA: sharp and bright, no blur effects.
  - Nothing uploads without your ✅ on that exact file.
