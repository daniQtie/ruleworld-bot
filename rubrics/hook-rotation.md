# Hook rotation (owner rule, 2026-11-17)

The owner supplied the skill `.claude/skills/hook-rotation/SKILL.md` and wants it used **always**: 10 hook types in a fixed order (1→10, then back to 1). Each new episode uses the NEXT hook. Never the same hook twice in a row. This **replaces** the earlier rule "the first words must be What if / If you" (that is now just hook #1).

## How each agent uses it
- **Researcher:** run `.venv/Scripts/python -m pipeline.hook_rotation assign <episode_id>`. It returns this episode's hook number and name (the first call assigns the next one; repeat calls return the same one, so rewrites keep it). Write it in `research/<id>.json` as `"hook_type": {"number": n, "name": "..."}`. Pick and frame the topic so that hook fits, and propose hook candidates **only of that type**.
- **Scriptwriter:** write the opener in the style of the assigned hook, matched to the topic. Put `hook_type` in the script JSON. Say which hook number you used in your reply. On a rewrite, keep the same hook type.
- **Script QA:** run `.venv/Scripts/python -m pipeline.hook_rotation show <episode_id>`. Hard gate: the opener matches the assigned type, and the previous episode used a different type. Judge the style, not just the number (a "Listicle" opener must really promise a number of points).
- **Video QA:** the spoken opener and the first shot match the script's assigned hook type.

## Adaptations for the story channel (2026-11-20; these override the skill's examples)
1. **Pure, natural English.** Never Taglish.
2. **Two rotations, one command:** `assign` also gives the **story format** (1–10 from `TEAMDEAM_CONTENT_FRAMEWORK.md`). The hook type shapes the first 3 s; the format shapes the whole story.
3. **The hook must pay off in the story.** No bait-and-switch.
4. **Guardrails per type:**
   - #2 Listicle: the story is told as 3–5 rules or steps.
   - #5 Bold statement: a bold claim *about the world*, inside the story; it must not be about real people.
   - #8 Story/Personal: the protagonist may say "I". Never claim real experiences of the owner.
   - #9 Secret: the hidden truth of the world, revealed later.
   - #10 Fast result: a time limit inside the story ("You have 24 hours...").
5. If a hook type fits the premise badly, change the premise (the researcher's job). Never ship a weak hook.
