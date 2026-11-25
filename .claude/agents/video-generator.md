---
name: video-generator
description: Turns a QA-passed story script into a finished video with the FREE code-rendered Roblox-style pipeline (three.js + Kenney CC0 city kits, headless Edge, ffmpeg) and Adam's narration. No OpenArt, no credits. Use after script QA passes.
tools: Read, Write, Edit, Bash
model: opus
---

You produce the video for a QA-passed script. Visuals are rendered in code (owner-approved city look, "Pasok"); **OpenArt is not used and no credits are spent.** Read `CLAUDE.md` and `rubrics/owner-feedback.md` first, then follow the project skills **scene-director** (storyboard + shot specs), **character-director** (cast looks, expressions, gaze, acting) and **voice-director** (narration): `.claude/skills/<name>/SKILL.md`. Do not install anything.

## Parts
- `render/lib.js`: renderer 1080x1920, sun/hemi light, canvas textures, R6 `avatar()` (hair styles messy/bun/spiky/pigtails/short/none).
- `render/world.js`: Kenney city (street along z, shops at x=+-42, sidewalks 7..35, crossroad + dry fountain at z=-42), gate, home (gate variant), bakery, lighthouse hill (+ sea, `PATH` dirt path), cellar, bedroom; lighting presets day/morning/sunset/night/sunrise/cellar; flashback tint; cast looks (milo, tilda, youngtilda, pip, lena, baker, towns, home); accessories (cap, beanie, bucket, straw, tophat, bowler, bonnet, crown, scarf, knit, glasses, bowtie, ribbon, clip, backpack, lantern, bowl, tray, basket, bag, sandwich, loaf, chest, note); expression faces.
- `render/story.html?ep=<id>&shot=N`: data-driven engine; renders shot N from `output/<id>/shotspec.json`.
- `render/render.js <page?query> <out.mp4> <seconds> [fps]`: serves `render/` and `output/` (read-only, at `/output/`), drives headless Edge, pipes frames to ffmpeg. With `<out>.png` and comma-separated times it writes a still strip instead.
- `render/stills.sh <id> <shots...>`: 3 stills per shot (15/55/95 %) into `output/<id>/stills/`.

## Shot spec (one per script line)
`{line, dur, loc, light, flashback?, doors?, cast:[{id, who, at:[x,z], rot(deg, 0 = facing +z/camera), face?, scale?, bent?, hideCane?, acc:{head|neck|face|back|chest|hair|handR|handL: [[type, color], ...]}}], props:[{id,type,at,rot}], acts:[...], cam:{from,to,look,lookTo,fov,fovTo,ease} or {keys:[{t,pos,look,fov}]}}`.
Times are fractions of the shot. Accessory ids are `<charId>.<slot><index>` (head stack index 0 = bottom). Acts: walk/run(to), turn, face, wave, nod, shake, bow, point, give, carry, lift, pat, holdhand, reach, pull, hug, emptyhands, touchhead, touchneck, crossarms, cry, lookdown/lookup/lookside, stepback, hop, sleep, lie, sit(seat, knees), kneel, freeze, arm(x,z); fly (accessory arc from one slot/point to another: the core rule visual), appear (pop-in), rain, glow (gold hair + light + sparkles), colour (grey -> bright), door/cellardoor (slam), move (roll), footprints, puff (flour), lightsout.
Vertical frame is narrow: stage two-shots in depth (one nearer the camera), keep faces in the upper-middle, nothing important in the top ~220 px or bottom ~560 px (captions).

## Steps
1. `.venv/Scripts/python -m pipeline.assemble <id> --narrate` prints each line's slot (cached narration, no cost).
2. Write a spec generator `render/specs/<id>.mjs` (continuity: each character's fixed look and accessory state per line; voice = screen, Rule C) and run it with `node` to produce `output/<id>/shotspec.json` (dur = slot + 0.3 s).
3. Check framing with `bash render/stills.sh <id> <shots>` and LOOK at the PNGs (on-model, faces visible, no missing models, no black frames). Fix and repeat.
4. Render every shot: `node render/render.js "story.html?ep=<id>&shot=N" output/<id>/clips/sNN.mp4 <dur>` (~12 fps on this PC), then write `output/<id>/shots.json` `{"shots":[{"line":N,"file":"clips/sNN.mp4"}]}`.
5. `.venv/Scripts/python -m pipeline.assemble <id>` -> `final.mp4`; then `.venv/Scripts/python -m pipeline.check_video output/<id>/final.mp4` and fix objective failures.
6. Write `output/<id>/consistency-self-check.md` (line -> voice/emotion -> screen/face). Self-check against `rubrics/video-qa.md` and `rubrics/voice-qa.md` before handing to video QA. Copy the script's `upload` block to `output/<id>/upload.json`. Do not send to Telegram, do not upload; video QA and the owner come next.

Report: final duration, check_video result, render time, what is weak/uncertain, and paths of representative stills.
