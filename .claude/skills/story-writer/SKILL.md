---
name: story-writer
description: Use when inventing, writing, rewriting or self-critiquing a story script for the channel (rule-based world Roblox-style Shorts). Applies the owner's storytelling kit - formula, 8 beats, hook rules, originality gate, natural dialogue.
---
# Story Writer

## Read first
- `docs/storytelling-kit/02_STORY_IDEAS/STORY_FORMULA_AND_HOOKS.md`
- `docs/storytelling-kit/01_COMPETITOR_RESEARCH/TEAMDEAM_CHANNEL_ANALYSIS.md`
- `TEAMDEAM_CONTENT_FRAMEWORK.md`
- `rubrics/owner-feedback.md`
- `rubrics/hook-rotation.md`
- Template: `docs/storytelling-kit/03_SCRIPTS/SCRIPT_TEMPLATE.md`
- Gold example: `docs/storytelling-kit/03_SCRIPTS/001_every_lie_creates_a_monster.md`

## Formula
**Strange rule + personal stake + escalating consequences + earned payoff.** A rule alone is a premise, not a story.

## 8 beats (all required)
1. **Hook (0–3 s):** line 1 is ALWAYS the episode title spoken as the hook (owner Rule R), e.g. "In this world, every step you take is counted." The assigned hook type (question, etc.) follows in the next line. Show the rule or its shocking consequence on screen at once.
2. **Context:** only what the viewer needs. Do not re-explain the rule later.
3. **Character goal:** a specific, immediate want.
4. **First consequence:** the rule hits the protagonist personally.
5. **Escalation:** every scene changes the situation or makes it harder. No repeats.
6. **Choice:** the protagonist acts. No rescue by coincidence.
7. **Reveal / payoff:** resolves or reframes the opening promise, and is foreshadowed.
8. **Emotional landing:** a feeling, a consequence, or a memorable image or line.

## Hook, logic and twist method (owner rejected stories 18–20 on 2026-11-25: "walang katuturan, walang magandang plot, no hook")
Do these steps on paper before writing the script.

**1. Hook line = a person + a concrete impossible or strange fact + an open question.** The viewer must want the answer.
- Good: "My dad gave me a walkie-talkie instead of a phone. Then a kid answered from 1995."
- Good: "Every day at recess, Leo picks the same team. The one with nobody on it."
- Banned: a warning or teaser ("Before you…", "Nobody tells you…", "The secret behind…").
- Banned: a rule lecture ("This is the town where…", "In this world, X happens") unless a named kid and a stake are in the same line.
- Write 10 hook lines and keep the one that makes you ask "wait, why?" the most.

**2. Logic chain.** Every line must follow from the line before it by "so…" or "but…", never "and then…".
- No coincidences.
- A 10-year-old must be able to retell the plot in one breath.

**3. Fair twist.**
- Plant one small clue in lines 2–4 that seems unimportant: a name, an object, something someone says.
- The twist uses that clue to change what the beginning meant.
- Write 3 twist options and pick the most surprising one that still makes total sense.
- Test: would a viewer say "WAIT, WHAT?" and rewatch to find the clue?

**4. Stakes kids feel:** a friend, a sibling, a pet, a parent or grandparent, being laughed at, a secret, a promise.

**5. Give the ending justice (Rule AE).**
- After the twist image, state the twist in plain words ("The boy on the walkie-talkie was my dad.").
- Explain the why (the backstory).
- Add 3–5 lines of resolution, then a clear closing line.
- Set `tail_hold` to at least 2.5 s.

**5b. No moral-lesson ending.** Never end on "a late promise still counts" or "blank means you choose".
- End on the twist image or line.
- Or end on a short loop line that sends the viewer back to line 1.
- The feeling should land without being explained.

**6. Self-check before sending.** Reject the script if any of these is "no":
- Does line 1 alone make me want line 2?
- Does every line change something?
- Is the twist both unexpected and logical?
- Is the ending a feeling, not a lesson?

## Rules
- **Openings:**
  - Never open with "Imagine a world...", "Have you ever wondered..." or "Once upon a time...".
  - Never use a hook the story does not pay off.
- **Cast:**
  - One protagonist, one meaningful relationship, and something personal to lose.
  - 2–4 named, original characters.
- **Dialogue:**
  - Short, natural and specific to each character.
  - Kids sound like kids, with no adult exposition.
  - No generic filler, and no overused AI phrasing ("little did they know", "a journey", "a testament to").
- **Narrator:** the first-person narrator (Adam) is the default voice ("my little sister..."). Adam also performs the character lines, using emotion tags (see `voice-director`).
- **Language:** plain English that a non-native speaker understands on one listen. Sentences are 14 words or fewer.
- **Length (Rule AE, owner 2026-11-25, replaces Rule W's 25–40 s):** whatever the story needs, usually 60–90 s (about 200–300 words), up to 2 min. Never cut the ending short.
- **Safety:** kid-safe and brand-safe. No Roblox logos and no real people. Never copy premises, characters, dialogue or shot sequences from TeamDeam or anyone else.
- **Originality gate:** compare the story with the last 5 scripts in `scripts/` (ideally the last 20). Reject anything that is a noun-swap of an existing story.
- **Hook rotation and format:** run `.venv/Scripts/python -m pipeline.hook_rotation assign <id>`. Scripts supplied by the owner are exempt.

## Deliverable
Write the fields in `scripts/<id>.vN.json` (see `.claude/agents/scriptwriter.md`):
- title and logline
- world rule
- protagonist goal and stakes
- character bible (look, personality and arc for each character)
- locations
- the 8 beats
- for every line:
  - spoken text and speaker
  - beat
  - voice direction (`voice-director`)
  - shot (`scene-director`)
  - acting (`character-director`)

End with a QA self-critique against `docs/storytelling-kit/09_QA/STORY_QA_CHECKLIST.md`.
