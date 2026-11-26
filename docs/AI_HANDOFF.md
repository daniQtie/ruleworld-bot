# Handoff for an AI assistant: Rule World Stories (cloud setup, 2026-11-26)

You are helping the owner of the YouTube Shorts channel **Rule World Stories**. Read this file first. It says what runs where, where every secret lives, how to fix common problems and what you must never do. **This file contains no secrets.** Never paste a secret into chat, an issue, a commit or a log.

## 1. Talking to the owner
- The owner reads **Taglish**. Reply in short Taglish. Everything inside the videos is pure English.
- The owner does not code. Give one step at a time. Say exactly which button or link to press.
- The owner creates accounts and keys. Never type passwords, card numbers or tokens for them.
- Ask before installing anything or using a paid service.

## 2. What the system does
An automated pipeline makes original Roblox-style animated stories (about 30–120 s, 9:16, English) and uploads them to YouTube Shorts. **The owner approves every video in Telegram before anything is uploaded.**

```
Telegram button / Cloudflare cron
   -> Cloudflare Worker (cloud/worker/worker.js)  -- starts a GitHub Actions workflow
        -> make.yml:   Gemini writes the script -> Fish Audio voice -> three.js render (headless Chromium)
                       -> ffmpeg + Whisper captions -> final.mp4 -> stored as a GitHub Release -> sent to Telegram with ✅ ✏️ ❌
   owner taps ✅ -> Worker marks the Release APPROVED -> upload.yml -> YouTube (scheduled, private until the slot)
```

| Part | Where | Cost |
|---|---|---|
| Telegram bot, buttons, auto schedule | Cloudflare Worker `ruleworld-bot`, address `https://ruleworld-bot.ruleworld.workers.dev` | free |
| Making videos, uploading, reconnecting YouTube, stats | GitHub Actions in the **public** repo `daniQtie/ruleworld-bot` | free (public repo = unlimited minutes) |
| Videos waiting for a decision | GitHub Releases named `ep-<episode-id>` | free |
| Script writer | Gemini API (free key), `pipeline/writer.py` | free, daily limits, sometimes busy (503) |
| Voice | Fish Audio "Adam", model `s2.1-pro-free` (`FISH_MODEL`), `pipeline/audio.py` | free model; the paid model `s1` retires 2026-12-31 |
| Pages for Google OAuth (home page + privacy policy) | GitHub Pages `https://daniqtie.github.io/ruleworld-bot/site/` (folder `docs/site/`) | free |

The repo is public **on purpose** (a private repo has only 2,000 free minutes per month and one video takes about 70 minutes on the 2-CPU private runner). Because it is public: never commit `.env`, `secrets/`, tokens or the owner's email, and remember that videos waiting for approval are downloadable from the Releases page.

## 3. Schedule
- **Auto videos:** the Cloudflare cron `0 3,13 * * *` UTC = **11:00 and 21:00 Philippine time** makes one video each. It skips a slot if 4 videos already wait for a decision, or if the owner pressed ⏸ Pause.
- **YouTube upload slots:** 2 PM and 7 PM New York time (= 3 AM and 8 AM Philippine time in winter), 2 videos a day. Set in `pipeline/upload_youtube.py` (`SLOTS_ET`). Do not change without the owner asking.

## 4. Telegram buttons
🎬 New video (choose a format) · 📋 Status · 📊 Stats · ⏸ Pause · ▶️ Resume · 🔑 Reconnect YouTube · ❓ Help. Under each video: ✅ Approve · ✏️ Revise (typed or voice note) · ❌ Reject. Owner-only: the Worker ignores every other chat.

## 5. Where every secret lives
Never print values. Setting a secret without printing: `printf %s "$VALUE" | gh secret set NAME -R daniQtie/ruleworld-bot`.

**GitHub → repo `daniQtie/ruleworld-bot` → Settings → Secrets and variables → Actions**

| Secret | What it is | How to renew |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | @BotFather → `/token`. Also update the Cloudflare secret `BOT_TOKEN`. |
| `TELEGRAM_CHAT_ID` | the owner's chat id | does not change. Also the Cloudflare secret `OWNER_ID`. |
| `FISH_API_KEY`, `FISH_VOICE_ID`, `FISH_MODEL` | Fish Audio key, the Adam voice id, the model name | fish.audio dashboard |
| `GEMINI_API_KEY` | Gemini key | aistudio.google.com → Get API key |
| `YOUTUBE_REFRESH_TOKEN`, `YOUTUBE_OAUTH_CLIENT` | the channel's YouTube sign-in and which Google client issued it | **tap 🔑 Reconnect YouTube in Telegram.** The bot writes both secrets itself (via `GH_PAT`). |
| `CLIENT_SECRET_JSON` | Google OAuth "Desktop app" client JSON (older sign-in) | Google Cloud → Credentials |
| `CLIENT_TV_JSON` | Google OAuth "TVs and Limited Input devices" client JSON. Used by 🔑. | Google Cloud → Credentials → download JSON |
| `GH_PAT` | GitHub fine-grained token, only this repo, permissions Actions + Contents + Secrets = read/write, no expiry | github.com/settings/personal-access-tokens |
| `TG_WEBHOOK_SECRET` | random string. **Must equal the Worker's `WEBHOOK_SECRET`.** | see section 8 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account id (not secret) | Cloudflare dashboard URL |
| `CLOUDFLARE_API_TOKEN` | **not set yet.** Only needed for the `Deploy Telegram bot` workflow. | Cloudflare → My Profile → API Tokens → "Edit Cloudflare Workers" template |

**Cloudflare → Workers & Pages → `ruleworld-bot` → Settings** (secrets, set with `wrangler secret put`): `BOT_TOKEN`, `OWNER_ID`, `GH_TOKEN` (same token as `GH_PAT`), `WEBHOOK_SECRET`. Variable `REPO = daniQtie/ruleworld-bot`. KV namespace binding `KV` (namespace name `ruleworld`; keeps the pause flag and the "waiting for notes" state). Cron trigger as in section 3.

**Google Cloud** project **Benny Shorts**: Google Auth Platform → app is **In production** (so the sign-in does not expire every 7 days). YouTube Data API is enabled. Branding uses the two GitHub Pages links above and the authorized domain `daniqtie.github.io`. **Do not upload a logo** (it forces Google verification).

## 6. Repository map
- `.github/workflows/` `make.yml` (new video / revisions) · `upload.yml` (upload approved videos, log rejected) · `reconnect.yml` (YouTube phone sign-in) · `stats.yml` · `deploy-worker.yml` (deploys the Worker; needs `CLOUDFLARE_API_TOKEN`) · `.github/actions/setup` and `commit` (shared steps).
- `cloud/worker/worker.js`, `wrangler.toml` – the Telegram bot. `cloud/README.md` – the owner's runbook.
- `pipeline/cloudjobs.py` – the jobs the workflows run (Release states, upload, reconnect). `writer.py` (Gemini), `audio.py` (Fish), `autoshots.py` (shots from templates), `produce.py` (whole pipeline), `assemble.py` (ffmpeg), `approve.py` (sha256 approval lock), `upload_youtube.py`.
- `render/` – three.js scenes and `render.js` (headless Chromium). `scripts/` – every script as JSON. `rubrics/owner-feedback.md` – the owner's permanent rules. `rubrics/lessons.md` – the writer's lessons (the bot appends to it).
- `CLAUDE.md` – project rules. Read it too.

## 7. How a video moves (GitHub Release `ep-<id>`)
The Release **name starts with the status** and its **body is JSON** `{ep, sha256, title, status, decisions[]}`.
`WAITING` → owner ✅ → `APPROVED` → `UPLOADED` · owner ✏️ → `REVISE` → `REVISING` → back to `WAITING` with a new file · owner ❌ → `REJECTED`. Failures: `FAILED`, `MISMATCH`.
The Worker only records the tap (after checking the 8-character hash on the button). `cloudjobs.py uploads` re-checks the **full sha256** of the stored file and only then calls `upload_youtube.upload()`, which refuses anything not approved for that exact file.

## 8. Fixing problems
**Always start here:** the bot sends "⚠️ … failed" with a link to the failed GitHub Actions run. Open it, read the failed step.

- **The bot does not answer at all.** Check the webhook: `https://api.telegram.org/bot<TOKEN>/getWebhookInfo` (read `last_error_message`). To set it again, pick a new random string `S`, then: `printf %s "$S" | wrangler secret put WEBHOOK_SECRET` (inside `cloud/worker`, needs `wrangler login`), `printf %s "$S" | gh secret set TG_WEBHOOK_SECRET -R daniQtie/ruleworld-bot`, and call Telegram `setWebhook` with `url=https://ruleworld-bot.ruleworld.workers.dev/tg`, `secret_token=$S`, `allowed_updates=["message","callback_query"]`. Check `GH_TOKEN` in the Worker has not been revoked. **Only one consumer may read Telegram updates**: if a laptop process runs `getUpdates` (`pipeline.controller`, `approve wait`), delete it; the webhook and `getUpdates` cannot coexist.
- **Upload fails with `invalid_grant` or "sign-in expired".** Tap 🔑 Reconnect YouTube in Telegram, open google.com/device on the phone, type the code, choose the channel's Google account. Then `upload.yml` runs by itself.
- **"all Gemini models failed".** Quota used up or Gemini busy (503). Try again later (the quota resets daily). If a model was retired (404), edit `MODELS` in `pipeline/writer.py`.
- **Fish voice fails.** Check the key and the balance at fish.audio. If the free model changed, edit `FISH_MODEL` (secret) and, if needed, `S2_PACE` in `pipeline/audio.py`.
- **Render too slow or killed.** `make.yml` has a 180-minute limit. A normal video takes about 70 minutes (2-CPU) or less. Rendering is CPU WebGL (SwiftShader) in `render/render.js`.
- **Worker code changed.** Deploy: either run the `Deploy Telegram bot` workflow (after setting `CLOUDFLARE_API_TOKEN`) or from `cloud/worker`: `wrangler login`, fill `__KV_ID__` and `__REPO__` in `wrangler.toml` (KV id is in Cloudflare → Workers KV), `wrangler deploy`. Do not commit the filled `wrangler.toml`.
- **Run a job by hand:** Actions tab → pick the workflow → Run workflow. Or `gh workflow run make.yml -R daniQtie/ruleworld-bot -f mode=new -f format=any` (this uses Gemini and Fish).
- **Video quality problems:** read `rubrics/owner-feedback.md` (Rule AA: sharp and bright, no blur, grain or vignette) before changing the renderer.

## 9. Limits and costs to know
- Gemini free tier: daily limit. Fish: currently the free model; watch the balance. GitHub Actions on a public repo: unlimited minutes. Cloudflare Workers free plan: plenty for this use.
- Do not delete: the GitHub repo, the Cloudflare Worker and KV namespace, the Google Cloud project "Benny Shorts". Keep the owner's email reachable for account recovery.

## 10. Never do these
- Never upload to YouTube without the owner's ✅ on that exact file. Do not weaken the sha256 check in `approve.py` / `cloudjobs.py`.
- Never print, commit or paste secrets; never add them to the public repo or its Pages.
- Do not change `pipeline/approve.py` callbacks, the YouTube OAuth code or the upload slots unless the owner asks.
- Never copy a competitor's words. Keep every video original.
- Never spend paid credits (OpenArt is not used; Fish s1 is paid) without asking.
- Never run a second Telegram update consumer.

## 11. Making a change (new format, new style, fixed bug)
1. Clone the repo, make the change, test with `python -m pipeline.writer prompt` or a small script, not a full render.
2. Commit and push to `main`. The workflows use the code on `main`.
3. A full test is `make.yml` (about 70 minutes, uses Gemini and Fish). Tell the owner before starting it.
4. If you changed `cloud/worker/`, redeploy the Worker (section 8).
5. Add what you learned to `rubrics/lessons.md` (script rules) or `rubrics/owner-feedback.md` (the owner's rules), one short line.

## 12. Style v2 (2026-11-26, current look)
- `pipeline/v2.py` (auto-director: 1-3 shots per line, camera, transitions, sound effects, drift music) + `render/v2/` (`cast.js` characters, faces,
  poses, monster form; `looks.js` one look per name; `sets.js` locations and props; `engine.html` renderer). All assets are original and drawn in code.
  `STYLE=v1` switches back to the old templates. New set / name / action: add it in `sets.js` or `looks.js`, in `pipeline/v2.py` and in `pipeline/writer.py`.
- Themes: `FORMATS` and `DAILY_MIX` in `writer.py`; menu in `cloud/worker/worker.js` (`FORMAT_KB`).
- **Strict script gate:** `rubrics/script-skill.md` (the owner's standard), `pipeline/story_gate.py` (code checks + story editor; pass = every score >= 7 and
  average >= 8, constants `MIN_EACH`, `MIN_AVG`). Up to 5 drafts; if none passes, no video is made and Telegram says why. If videos are rarely made,
  ask the owner before lowering the bar.
- **Owner's own script:** Telegram "My script" -> `make.yml` mode `owner` -> `writer.from_owner` (words are copied exactly; no story rejection).
  A message starting with "Idea:" goes through the writer and the gate.
- Gemini free tier: 20 requests per day on each bigger model, so `MODELS` lists many. Do not use extra accounts or keys to get around limits.
- Every video is sent to Telegram with a script sheet (characters, scenes, feelings).
- Do not use third-party Roblox asset exports or commercial songs.
