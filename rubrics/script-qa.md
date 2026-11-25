# Script QA rubric (rule-based world stories)

Score each item 1–10. This rubric includes the owner's kit checklist `docs/storytelling-kit/09_QA/STORY_QA_CHECKLIST.md`. **Pass = all hard gates true, average ≥ 8, and no item below 7.** Grade as a viewer who owes the video nothing, not as an editor. A 10 should be rare.

**Hard gates (automatic fail):**
- **Hook rotation:** the opener follows the assigned hook type, and the story follows the assigned format (`.venv/Scripts/python -m pipeline.hook_rotation show <id>`, `rubrics/hook-rotation.md`). Both differ from the previous episode.
- **Story structure:** every element from `TEAMDEAM_CONTENT_FRAMEWORK.md` is present: hook, world rule, protagonist with a want, supporting characters with motivations, conflict, escalating consequences, major reveal, resolution and a memorable ending.
- **Originality:** the premise, characters and dialogue are original. Nothing is copied or closely paraphrased from TeamDeam or any other creator. No Roblox logos/UI, no copyrighted characters, no real people.
- **Length:** the estimated runtime (words ÷ (6.26 × speed^0.83) per line (Adam's measured speech rate; see `config/voice_profile.json` estimate_formula) + pauses + planned silent beats) lands at 2:00–2:40 (aim ~2:20), and it is not padded. That is usually 330–400 spoken words.
- **Clear English:** understood on one listen by a non-native speaker. Sentences have 14 words or fewer, with no slang.
- **Producibility:** every line has a `shot` that shows what the line says (Rule C), plus `voice` direction (`voice-director` skill) and `acting` (`character-director` skill). Every character and location has a fixed `look`. Everything can be built with the three.js renderer (no AI video).
- **Kit Story QA blocking items** (`docs/storytelling-kit/09_QA/STORY_QA_CHECKLIST.md`): the hook is clear in 3 s, the protagonist has a goal, the conflict is caused by the rule, the story is original vs the last 5 scripts, and the ending pays off the hook. If any fails, rewrite.
- **Voice direction safety:** stage directions appear only in `say` as documented Fish s1 tags (`config/voice_profile.json`), never in `text`, and there are no invented tags.
- **Title first (owner Rule R):** line 1 is the episode title as the spoken hook, and it matches the upload title minus " #Shorts". If it is missing, the script fails.
- **Owner-supplied scripts:** they are exempt from hook rotation. The premise, dialogue and turning points must not change without owner approval; QA only notes suggested polish.

| # | Criterion | What "10" looks like |
|---|---|---|
| 1 | **Hook (0–3 s)** | You can picture the strange world rule or the stakes instantly, and it pays off later. |
| 2 | **World rule** | It is simple, original and has consequences you want to see play out. |
| 3 | **Characters** | The protagonist wants something clear. The side characters have their own motives. |
| 4 | **Conflict & escalation** | Each beat raises the stakes. There is no filler. |
| 5 | **Reveal** | A real "wait, what?" that re-frames the story. It is earned, not random. |
| 6 | **Resolution & ending** | It is satisfying and memorable: a twist, an emotional beat or an A/B question. |
| 7 | **Clarity** | One listen is enough. Story order is clear. |
| 8 | **Visual storytelling** | The shots show the story even with the sound off. Camera angles vary. |
| 9 | **Consistency** | Names, looks, places and rules never contradict each other. Voice = caption = screen (Rules A–C). |
| 10 | **Originality & safety** | It is fresh, kid-safe and brand-safe. |
| 11 | **Retention** | Open loops keep viewers to the end. Something changes every ~5 s. |
| 12 | **Emotional performance plan** | Every line has an emotion, pace and pause that fit the moment (kit delivery map style). Faces and gaze are planned for every emotional beat. |
| 13 | **Dialogue** | It sounds natural and distinct for each character, kids sound like kids, and there is no filler or repeated exposition. |

## Output format
```json
{"pass": false, "average": 7.6,
 "scores": {"hook": 8, "world_rule": 7, "characters": 8, "escalation": 8, "reveal": 7, "ending": 8, "clarity": 9, "visual": 8, "consistency": 9, "originality": 8, "retention": 7, "performance": 8, "dialogue": 8},
 "hard_gates": {"rotation": true, "structure": true, "original": true, "length": true, "english_clear": true, "producible": true, "kit_story_blockers": true, "voice_tags_safe": true},
 "fixes": ["Line 12: the reveal is stated, not shown; give it a close-up shot of ..."]}
```
Every score below 9 needs a specific fix that names the line.
