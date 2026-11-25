# Benny Shorts: project instructions (read every session)

An automated YouTube Shorts channel. It makes **original Roblox-style rule-based world stories**, 2–3 min long, vertical 9:16, in English. TeamDeam is the *format* reference only. The owner's permanent production standards are the **Roblox Storytelling Kit** in `docs/storytelling-kit/` (installed 2026-11-20). Every script and every video must follow them.

## Talking to the owner
- Reply in short Taglish. Everything inside the videos is pure, natural English.
- Give one-click links to every file you ask the owner to watch or check.
- Write every owner correction into `rubrics/owner-feedback.md` (rules A–O so far, all hard rules) and re-run QA before resending.

## Hard safety rules
- Ask before installing anything or using any paid service. Do not add duplicate tools.
- Never print or paste secrets. `.env` and `secrets/` hold the Fish key, the Telegram token and YouTube OAuth.
- **Nothing uploads without the owner's Telegram ✅ on that exact file** (sha256 lock in `pipeline/approve.py`).
- Never change `pipeline/approve.py` callbacks, `pipeline/upload_youtube.py` OAuth or the schedule (2 PM / 4 PM / 6 PM America/New_York = 3 / 5 / 7 AM PHT in winter, owner 2026-11-24) unless the owner asks.
- OpenArt is connected but **not used**. Never spend its credits or buy a plan (`config/openart.json`).
- Do not delete the owner's files without permission.

## Storyboard first (owner, 2026-11-23)
Before any full render, send the owner a storyboard: one picture per script line (`python -m pipeline.storyboard <id>`). The owner revises by shot number; render the full video only after the pictures are approved.

## Pipeline (all $0 except Fish TTS)
researcher → scriptwriter (Opus) → **script QA gate** → voice direction + narration → video-generator (three.js render) → **video QA gate** → Telegram ✅/✏️/❌ → YouTube upload (private, scheduled).

| Stage | Where | Skill to follow |
|---|---|---|
| Idea + research | `.claude/agents/researcher.md` | `story-writer` (originality gate) |
| Script | `.claude/agents/scriptwriter.md` → `scripts/<id>.vN.json` | `story-writer`, `voice-director`, `hook-rotation` |
| Script QA | `.claude/agents/script-qa.md` → `rubrics/script-qa.md` | `quality-reviewer` |
| Narration | `pipeline/audio.py`, `pipeline/assemble.py --narrate` | `voice-director` |
| Shots + render | `.claude/agents/video-generator.md`, `render/` | `scene-director`, `character-director` |
| Video QA | `.claude/agents/video-qa.md` → `rubrics/video-qa.md`, `rubrics/voice-qa.md` | `quality-reviewer` |
| Approval / upload | `pipeline/approve.py`, `pipeline/upload_youtube.py` | (unchanged) |

## Permanent standards (summary; the skills hold the detail)
1. **Story.** The formula is: strange rule + personal stake + escalating consequences + earned payoff. Use the 8 beats: hook (0–3 s) → context → goal → first consequence → escalation → choice → reveal/payoff → emotional landing.
   - The rule must be understandable in 3 s.
   - The protagonist needs a specific goal and something personal to lose.
   - The conflict must be caused by the rule, not by coincidence.
   - Every scene adds something new.
   - Dialogue sounds natural.
   - The story is materially different from the last 5 uploads.
2. **Voice.** Adam is the only narrator (`config/voice_profile.json`): same Fish voice, model and settings every time.
   - Each line carries direction metadata (emotion, pace, pause, emphasis). It is never spoken and never put in captions.
   - Only documented Fish s1 controls are used: prosody speed and volume, `(emotion)` tags at the start of a sentence, and `(break)`.
   - No flat or robotic reads. No overacting.
3. **Characters.** Each story has its own character bible. Every shot keeps the same:
   - face design, skin tone, eyes and brows
   - hair and its colour
   - clothes, palette and accessories
   - scale
4. **Faces and acting.** Use the expression set from `docs/storytelling-kit/06_REACTIONS/`.
   - Show the stimulus first, then the reaction.
   - Hold each expression long enough to read.
   - Give the character a gaze target.
   - Never a static smile on a sad, scared or guilty line.
   - When a character speaks the mouth moves; when they listen it stays still.
5. **Scenes.** One clear action per shot. The screen shows what the voice says (Rules A–C and O).
   - Use a mood colour per scene (Rule M), never a grey world (Rule J), and clean motion (Rule K).
   - Faces sit in the upper-middle. Nothing important goes in the top ~220 px or the bottom ~560 px.
6. **QA gates are mandatory** (PAUSED by the owner on 2026-11-22, see rubrics/owner-feedback.md: one render, auto-checks only, no QA subagents).
   - A script is not ready until it passes `rubrics/script-qa.md`, including the kit's Story QA blocking items.
   - A video is not ready for Telegram until it passes `rubrics/video-qa.md` and `rubrics/voice-qa.md`.
   - Never claim you watched or listened to something you did not check. Audio is checked by meter + Whisper.

## Key files
- `docs/storytelling-kit/`: the full kit (research, formula, script 001, voice guide, character bible, expressions, storyboard, QA).
- `TEAMDEAM_CONTENT_FRAMEWORK.md`: the 10 story formats and the copy/never-copy rules.
- `config/voice_profile.json`: Adam's locked voice settings and the supported Fish controls. **s1 is retired 2026-12-31**, so plan the migration.
- `pipeline/hook_rotation.py`: the hook and format rotation. Owner-supplied scripts are exempt and do not advance it.
- `render/`: three.js 0.170 + Kenney CC0, rendered in headless Edge. Render through PowerShell, because Git Bash leaves Edge processes behind. Disk space is tight (~8 GB), so delete `parts/` after a final passes.
