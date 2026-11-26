# Rule World Stories in the cloud: GitHub Actions + Cloudflare (free, no card)

Since 2026-11-26, Oracle is no longer used because it would not accept the owner's cards. The channel now runs without the laptop and without Claude, and the owner controls everything from Telegram.

## What runs where

| Part | Where | Cost |
|---|---|---|
| Telegram bot (buttons, schedule 11:00 / 21:00 PHT) | Cloudflare Worker `ruleworld-bot` (`cloud/worker/worker.js`) | ₱0 |
| Making a video (Gemini script → Fish voice → three.js render → ffmpeg) | GitHub Actions `make.yml` (public repo `daniQtie/ruleworld-bot`) | ₱0, unlimited minutes |
| Upload after ✅ (slots 3 AM / 8 AM PHT) | GitHub Actions `upload.yml` | ₱0 |
| 🔑 Reconnect YouTube / 📊 Stats | `reconnect.yml` / `stats.yml` | ₱0 |
| Finished videos waiting for a decision | GitHub Releases `ep-<id>` (title starts with WAITING / APPROVED / UPLOADED …) | ₱0 |

All keys live in the repo's **Settings → Secrets and variables → Actions**. They are never in the code. The deploy workflow copies the bot's keys to Cloudflare by itself.

## Owner's one-time to-do

1. **Cloudflare account** (free, no card): sign up at dash.cloudflare.com.
   - Open **Workers & Pages** once and accept the free `workers.dev` subdomain.
   - Then create an API token: **My Profile → API Tokens → Create Token → "Edit Cloudflare Workers" template → Create**.
   - Put the token in the GitHub secret `CLOUDFLARE_API_TOKEN`.
   - Put the Account ID (shown on the Workers page) in `CLOUDFLARE_ACCOUNT_ID`.
2. **GitHub token for the bot**: github.com → Settings → Developer settings → **Fine-grained tokens** → Generate.
   - Repository access: only `ruleworld-bot`.
   - Permissions: **Actions**, **Contents** and **Secrets** = Read and write.
   - Expiration: the longest allowed. Write down the date: the bot stops when it expires.
   - Save it as the secret `GH_PAT`.
3. **YouTube "Publish app"**: console.cloud.google.com → Google Auth Platform → Audience → Publish app. This stops the sign-in from expiring every 7 days.
4. **Phone sign-in client** for 🔑:
   - Google Cloud → Credentials → Create OAuth client ID → **TVs and Limited Input devices**.
   - Download the JSON and save its full text as the secret `CLIENT_TV_JSON`.
5. Run **Actions → Deploy Telegram bot → Run workflow**.
   - From then on, Telegram talks to the Worker, so **no laptop listener may run** (`approve wait`, `wait-many`, `controller`).

## Daily use: same buttons as before

- 📝 My script (paste your own script, or "Idea: ..."), 🎬 New video, 📋 Status, 📊 Stats, ⏸ Pause, ▶️ Resume, 🔑 Reconnect YouTube, ❓ Help.
- Every video comes with ✅ / ✏️ / ❌ buttons.
  - ✅ checks that the button matches the exact file (sha256), then uploads.
  - ✏️ takes typed or voice notes and makes a new version.
  - ❌ drops the video and saves your notes.
- Auto mode makes one video at 11:00 and 21:00 PHT. It skips a slot when 4 videos are already waiting for your decision.

## If something breaks

- **The bot says "⚠️ … failed" with a link:** open the link to see the failed step. You can re-run it there with **Re-run jobs**.
- **The bot does not answer at all:**
  - Run **Actions → Deploy Telegram bot** again.
  - Check that `GH_PAT` has not expired. If it has, make a new one (step 2) and replace the secret.
- **Keep the repo public:** a private repo has only 2,000 free minutes a month, too few for 2 videos a day. The keys stay hidden in Secrets.
- **Going back to the laptop bot:** open `https://api.telegram.org/bot<TOKEN>/deleteWebhook` once, then start `python -m pipeline.controller`.
