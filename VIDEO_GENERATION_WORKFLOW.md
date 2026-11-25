# Video generation workflow

| # | Step | Who / what | Output |
|---|---|---|---|
| 1 | Research a story idea | `researcher` agent; `pipeline.hook_rotation assign <id>` | `research/<id>.json` |
| 2 | Write an original script, storyboard, characters, locations and shot list | `scriptwriter` (Opus) | `scripts/<id>.v<n>.json` |
| 3 | Script QA (max 3 rewrites, then the owner decides) | `script-qa` | `scripts/<id>.v<n>.qa.json` |
| 4 | Adam narration and per-line slot lengths | `pipeline.assemble <id> --narrate` (Fish Audio + Whisper) | `voice-*.wav`, `narration-*.json` |
| 5 | Shot plan: model, prompts, durations, references; Smart Shot preview if supported | `video-generator` | `output/<id>/shots.json` |
| 6 | **Cost check:** balance, model, unit cost, total | `pipeline.budget`; the owner approves while the cap is UNSET | approval in chat |
| 7 | Generate character and location references | OpenArt MCP | `output/<id>/refs/` |
| 8 | Generate shots (image-to-video from the refs) | OpenArt MCP | `output/<id>/clips/sNN.mp4` |
| 9 | Verify downloads: each file exists and decodes. A job ID is not proof. | `ffprobe` | `shots.json` updated |
| 10 | Assemble clips + Adam + captions + lo-fi bed | `pipeline.assemble <id>` | `final.mp4`, `final.srt` |
| 11 | Objective checks | `pipeline.check_video` | `qa/final-report.json` |
| 12 | Video QA (12 checks) | `video-qa` | `qa/video-qa.json` |
| 13 | Telegram approval (✅ / ✏️ / ❌, locked to this file's sha256) | `pipeline.approve send/wait` | `approval.json` |
| 14 | ✏️ Revise: notes go to `rubrics/owner-feedback.md`, the fix is quoted (credits), then regenerate only the affected shots and re-QA | the agents | new `final.mp4` |
| 15 | ✅ Approve: upload privately and schedule at 12 PM or 7 PM America/New_York | `pipeline.upload_youtube upload <id>` | `logs/uploads.csv` |
| 16 | After publish time, check it really went public | `pipeline.upload_youtube verify <id>` | log row |

**Rules:**
- Never upload an unapproved video, or a file that changed after approval.
- Never spend credits outside `OPENART_COST_GUIDE.md`.
- If a model limit prevents the intended output, report it. Do not pretend it is finished.
