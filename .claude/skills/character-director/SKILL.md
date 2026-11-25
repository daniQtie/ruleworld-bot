---
name: character-director
description: Use when designing a story's cast, building or changing avatars/faces in render/, or writing per-shot acting (expressions, gaze, body language, lip movement). Keeps every character identical across shots and makes faces match emotions.
---
# Character Director

## Read first
- `docs/storytelling-kit/05_CHARACTERS/CHARACTER_BIBLE.md`
- `docs/storytelling-kit/05_CHARACTERS/CHARACTER_CONSISTENCY_PROMPT.md`
- `docs/storytelling-kit/06_REACTIONS/FACIAL_EXPRESSION_GUIDE.md`
- `docs/storytelling-kit/06_REACTIONS/REACTION_LIBRARY.csv`
- The face sheets in `docs/storytelling-kit/assets/character-sheets/*.png`. Their design language:
  - classic block-face decals
  - oval black eyes with a white highlight
  - thick dark brows
  - simple line mouths
  - blush on happy and relieved faces
  - blue tear drops, and a sweat drop on scared faces
- Owner rules:
  - N: distinct designs.
  - L: readable props.
  - O: whatever is named is on screen.

## Character bible for each story
Write it in the script and in the cast section of `render/world.js`. For each character give:
- name, age and role
- personality and arc
- a locked look:
  - skin tone
  - face style: eye size and spacing, brows, lashes, freckles, and so on
  - hair style and colour
  - clothes, print and palette
  - accessories
  - scale: kids about 0.8–0.9, teens about 0.95–1.0, adults 1.0–1.18

The kit's sheets are references for story 001 only. A new story gets new, original characters.

## Continuity locks (every shot)
- These never change: head and face design, eye style, brows, hair silhouette and colour, skin tone, outfit, accessories and scale.
- Only these change: expression, gaze, head angle, pose, light and framing.
- Accessory state follows the story. An item that is gained or lost stays that way.

## Acting for each line
Acting is set in each shot's `cast[].face` and acts.

**Expressions.**
- The core set: neutral, happy, sad, angry, scared, surprised, confused, crying and relieved.
- Also available: guilty, nervous smile, determined, trying not to cry, and comforting.
- Show the stimulus first, then the reaction.
- Hold each expression for at least ~0.8 s. Never swap faces frame by frame.
- Change faces with a short blend, not a hard pop.
- Never keep a static smile on a sad, scared or guilty line. Do not exaggerate every expression.

**Gaze.** Every character has a gaze target: a person, the phone, the monster or the empty chair. Use the eyes to show what a character notices or avoids.

**Body.** The body matches the face:

| Emotion | Body |
|---|---|
| Sad | The head lowers and the shoulders soften. |
| Scared | The character leans back. |
| Guilty | The character looks down or away. |
| Relieved | The character exhales and the shoulders drop. |

**Mouth and blinks.**
- The speaker's mouth moves with the voice: it opens and closes on the syllable rhythm, and stays small on quiet lines.
- Listeners keep their mouths closed and react instead.
- Blinks are natural, never on every important syllable.

## Check
- Make stills of every shot with `render/stills.sh`.
- Compare each face with the character bible and the sheet. Fix any drift before the full render.
- The gate is the character checks in `rubrics/video-qa.md`.
