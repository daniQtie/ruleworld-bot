# Story Shorts automation (OpenArt + Adam)

This project makes original 2–3 min vertical animated stories set in **Roblox-style rule-based worlds** (a TeamDeam-style *format*; we never copy). It runs from research to script to QA to OpenArt video to QA, then the owner approves in Telegram, and YouTube publishes it privately on a schedule.

The Stickman/Benny mode was removed on 2026-11-20. A backup of all removed code and config is in `backups/stickman-2026-11-20.zip`. Older episodes stay in `output/`.

## One episode
```
researcher       → research/<id>.json                       (hook type + story format from pipeline.hook_rotation)
scriptwriter     → scripts/<id>.v<n>.json                   ┐ max 3 rewrites, then the owner decides
script-qa        → scripts/<id>.v<n>.qa.json                ┘ rubrics/script-qa.md
video-generator  → output/<id>/shots.json, refs/, clips/, final.mp4   (OpenArt MCP + Adam; credit-checked)
video-qa         → output/<id>/qa/video-qa.json             rubrics/video-qa.md
owner (Telegram) → ✅ approve / ✏️ revise / ❌ reject
YouTube          → private + scheduled 12 PM / 7 PM America/New_York (1 AM / 8 AM PHT in winter)
```
The agents are in `.claude/agents/`. Full step list: [VIDEO_GENERATION_WORKFLOW.md](VIDEO_GENERATION_WORKFLOW.md).

## Docs
- [OPENART_SETUP.md](OPENART_SETUP.md): how to connect and sign in to the OpenArt MCP
- [OPENART_MODEL_GUIDE.md](OPENART_MODEL_GUIDE.md): the models, what they support and their limits
- [OPENART_COST_GUIDE.md](OPENART_COST_GUIDE.md): credit costs, the budget config and approval rules
- [TEAMDEAM_CONTENT_FRAMEWORK.md](TEAMDEAM_CONTENT_FRAMEWORK.md): the niche, the 10 formats, story structure and visual style
- `rubrics/`: owner rules (`owner-feedback.md`), script QA, video QA, hook rotation

## Commands (from this folder)
```
.venv/Scripts/python -m pipeline.hook_rotation assign <id>          # hook type + story format (idempotent)
.venv/Scripts/python -m pipeline.budget <id> <estimate> <balance>   # 0 = may spend, 2 = ask owner, 3 = not enough (Telegram alert)
.venv/Scripts/python -m pipeline.assemble <id> --narrate             # Adam narration + per-line slot lengths
.venv/Scripts/python -m pipeline.assemble <id>                       # clips + Adam + captions + lo-fi → final.mp4
.venv/Scripts/python -m pipeline.check_video output/<id>/final.mp4   # objective QA
.venv/Scripts/python -m pipeline.approve send <id>                   # Telegram (videos > 49 MB get a compressed preview)
.venv/Scripts/python -m pipeline.approve wait <id>
.venv/Scripts/python -m pipeline.upload_youtube upload <id>          # only if approved for this exact file
.venv/Scripts/python -m pipeline.upload_youtube verify <id>
```
Tests: `.venv/Scripts/python -m tests.test_<name>` for approve, upload, captions, hook_rotation and budget.

## Layout
- `pipeline/`:
  - `audio.py`: Fish Audio Adam TTS, lo-fi bed and mix
  - `captions.py`: Whisper word alignment and caption cues
  - `assemble.py`: builds `final.mp4`
  - `budget.py`: the credit guard
  - `check_video.py`
  - `approve.py`: Telegram
  - `upload_youtube.py`, `uploads_log.py`
  - `hook_rotation.py`
- `config/openart.json`: `OPENART_AUTO_SPEND=false`, `OPENART_MAX_CREDITS_PER_VIDEO=null` (UNSET)
- `.mcp.json`: the OpenArt MCP server (`https://mcp.openart.ai/mcp`, OAuth sign-in)
- `assets/fonts/`: the caption font

## Dependencies
- **Python venv:** `numpy`, `soundfile`, `faster-whisper` (captions + Telegram voice notes).
- **FFmpeg:** assembly, QA probing and the Telegram preview.
- **Services:** OpenArt (visuals, credits), Fish Audio (Adam voice, credits), Telegram bot, YouTube Data API.
- **Secrets:** in `.env` and `secrets/` (gitignored, never printed).
- **Removed:** Kokoro, resvg, the Benny renderer and the stickman skill.

## Telegram and YouTube setup
These are unchanged from the earlier phases. They use the bot token and chat id in `.env`, and the OAuth client in `secrets/client_secret.json` plus `YOUTUBE_REFRESH_TOKEN`. The Google app is in Testing, so the refresh token expires every 7 days; re-run `python -m pipeline.upload_youtube auth` when that happens.
