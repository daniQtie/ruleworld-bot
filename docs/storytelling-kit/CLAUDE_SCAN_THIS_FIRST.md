# Claude Code — Scan and Integrate This Kit

You are receiving a reference package for improving an existing automated YouTube Shorts production system.

## Objective

Improve the system's storytelling, emotional narration, stable voice identity, character consistency, facial expressions, animation, scene continuity and final quality for an original Roblox-style animated story channel.

Primary competitor reference: https://www.youtube.com/@TeamDeam-q6r

Our intended niche: **Roblox rule-based world animated stories** — original fictional worlds with one memorable rule, a character with a personal goal, escalating consequences and a satisfying or surprising payoff.

## Required first action: read before changing anything

Read every relevant file in this package, especially:

- `README_FIRST.md`
- `01_COMPETITOR_RESEARCH/TEAMDEAM_CHANNEL_ANALYSIS.md`
- `02_STORY_IDEAS/STORY_FORMULA_AND_HOOKS.md`
- `03_SCRIPTS/001_every_lie_creates_a_monster.md`
- `04_VOICE/voice_profile.json`
- `04_VOICE/VOICE_ACTING_GUIDE.md`
- `05_CHARACTERS/CHARACTER_BIBLE.md`
- `06_REACTIONS/FACIAL_EXPRESSION_GUIDE.md`
- `07_SCENES_AND_PROMPTS/STORYBOARD_AND_GENERATION_PROMPTS.md`
- all five files under `08_SKILLS/`
- all checklists under `09_QA/`
- `11_WORKFLOW/EXISTING_SYSTEM_INTEGRATION.md`
- the PNG/SVG reference sheets under `assets/character-sheets/`

Do not treat stage directions as spoken narration. Do not send labels such as `[SAD]`, `[PAUSE]`, or `[SLOW]` to the TTS engine unless its documented markup format requires and supports them.

## Audit your current project

Before modifying files, inspect the existing system and identify:

1. Current video-generation provider and supported models.
2. Current TTS provider, exact voice ID, model ID and supported emotion/prosody controls.
3. Whether voice generation supports SSML, stability, style, speed, pitch or seed.
4. How generated video and audio are assembled today.
5. How character references are passed to the generator.
6. Existing storyboard/scene workflow.
7. Existing QA checks.
8. Telegram approval buttons and callback logic.
9. YouTube OAuth, upload and scheduling implementation.
10. Existing paid/free limits and credit balance visibility.

Do not assume an API/MCP exists just because a website has a browser interface. Use only documented, actually available integrations. Do not invent tool names or endpoints.

## Implementation priorities

### A. Story quality
- Use the story skill and the formulas in `02_STORY_IDEAS/`.
- Every story needs a specific protagonist goal, relationship, fear/desire, conflict, escalating consequences and earned payoff.
- Avoid generic filler dialogue, vague stakes, and random twists.
- Compare each new idea with the previous five uploads to avoid repetitive premises.
- Have the story QA reviewer critique the first 3 seconds and the full narrative before generation.

### B. Voice quality and consistency
- Use the exact currently configured narrator identity by default.
- Save its actual voice ID/model/settings in a persistent config.
- Never randomly select a new voice for each video or scene.
- Apply line-by-line emotion, pace, volume, pauses and emphasis using only features the current provider supports.
- If per-line generation is necessary, preserve the exact voice/model/settings and perform a short continuity test before generating the full narration.

### C. Character and facial continuity
- Treat the Noah and Lily sheets in `assets/character-sheets/` as original visual references for the sample story only.
- Do not force these characters into unrelated stories. Create new character sheets when a story needs different characters.
- Preserve face shape, eyes, hair, clothes, accessories, proportions and color palette across shots.
- Use the expression catalogue in `06_REACTIONS/` and avoid static faces during emotional dialogue.

### D. Video generation
- Keep the existing generation provider unless the owner chooses to change it.
- Check model duration, aspect ratio, character-reference support, audio support, credit cost and commercial-use terms before production.
- Build scene-by-scene prompts with explicit character and environment continuity.
- If the provider cannot create the whole story in one generation, create coherent shots and join them using the system's existing supported workflow.
- Never claim that a video is complete until the actual output file has been checked.

### E. Keep existing automation safe
- Do not break or replace Telegram approval.
- Do not break YouTube OAuth, upload or scheduling.
- Do not automatically publish a video that has not been approved.
- Do not silently purchase credits or subscriptions.
- Do not remove working modules just because this kit contains a preferred approach.

## Approval gate

Your first deliverable must be an audit and a proposed implementation plan. Do not edit production code, change credentials, spend credits, or publish videos until the owner approves the plan.

## First quality-control test

Use `03_SCRIPTS/001_every_lie_creates_a_monster.md`.

Before generating the full Short:
1. Review and improve the story without changing its core emotional premise.
2. Prepare the storyboard and shot list.
3. Prepare the narrator performance map.
4. Create/verify character sheets and expression continuity.
5. Generate one short test narration using the existing voice.
6. Generate or preview one low-cost visual test if the provider offers a free/preview mode.
7. Show the owner the materials and estimated generation cost.

Only proceed to the complete video after approval.
