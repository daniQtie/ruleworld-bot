---
name: voice-director
description: Use when writing per-line voice direction for a script, generating or re-generating Adam's narration with Fish Audio, or checking narration quality. Keeps one locked narrator identity and adds emotion only through documented Fish s1 controls.
---
# Voice Director

Read first:
- `config/voice_profile.json`: the locked values and the supported controls.
- `docs/storytelling-kit/04_VOICE/VOICE_ACTING_GUIDE.md`
- The episode's delivery map. For an example, see `docs/storytelling-kit/04_VOICE/001_SCRIPT_DELIVERY_MAP.md`.

## Identity lock
- Adam is the only voice. Every line of every upload uses the same `FISH_VOICE_ID`, model `s1`, and the default temperature and top_p.
- Never pick another voice. A second character voice needs the owner's approval first.
- s1 retires on 2026-12-31; after that, tags use `[bracket]` syntax on s2.1-pro. Migrating needs owner approval and a continuity test.

## Per-line direction
This is metadata. It is never spoken and never captioned. Each script line gets these fields:

| Field | Meaning |
|---|---|
| `speaker` | Who says the line. |
| `emotion` | The intended emotion. |
| `speed` | Speed multiplier (the pace). |
| `volume` | Volume in dB, usually 0. |
| `pause` | Seconds of silence after the line. |
| `emphasis` | The words to stress. |
| `say` | The exact text sent to Fish. |

**Emotion tags.**
- Map the emotion to Fish s1 tags at the START of a sentence, in `say` only. Example: `(worried)(soft tone) Noah... what's standing behind you?`
- Use at most 3 tags per sentence.
- Use only the tags listed in `config/voice_profile.json`. Never use the `unsafe_tags` there; for example, `(regretful)` was spoken aloud.

**Pauses.**
- Prefer the exact pipeline gap (`pause` after the line). Use `(break)` or `(long-break)` only inside a line.
- The kit's pause guide:
  - Before a reveal: 0.2–0.35 s.
  - A realization: 0.4–0.7 s.
  - Searching for words: 0.25–0.5 s.
- Do not pause after every sentence.

**Pace, pauses and volume (owner Rule Q, 2026-11-21).**
Do not over-slow Adam: the 0.65–0.75 pacing of the Lie-Monster episode was too slow. Read `speed_policy`, `pause_policy` and `volume_policy` in `config/voice_profile.json`.

| Line type | Speed | Volume (dB) |
|---|---|---|
| Narration | 0.9 | 0 |
| Normal dialogue | 0.92 | 0 |
| Sad or tender | 0.8 | -3 to -4 |
| Worry or unease | 0.85 | -2 to -3 |
| Shock or surprise | 0.95–1.0 | +3 to +5 |
| Anger or urgency | 0.95 | +2 |

- Never go below 0.75.
- Pauses: 0.15–0.35 s between lines and at most 0.6 s for drama. A longer silence is allowed only for a planned visual beat where something happens on screen.
- Emotion must be audible: shock sounds louder and sharper, worry softer and lower. Voice QA checks the per-line loudness against the intended emotion.

**Emphasis.** Fish s1 has no emphasis tag. Get emphasis from:
- word order
- a short sentence
- a `(break)` before the word
- a separate line

**Child characters (voiced by Adam).**
- Use `(soft tone)`, plus emotion tags with slightly more energy (hopeful, curious, scared).
- Keep the phrasing short.
- Never use a cartoon voice.

**Emotion palette (from the kit).**

| Emotion | Delivery |
|---|---|
| Suspense | Slower, quiet, controlled. |
| Fear | Slower, tense. |
| Sadness | Slower, soft, restrained. |
| Guilt | Hesitant, lower energy. |
| Warmth | Gentle, sincere. |
| Urgency | Faster, clear. |

Avoid whispering everything, screaming, sobbing melodrama and a presenter voice.

## Procedure
1. If anything in the profile changed, test before a full render. Render the hook line and the most emotional line with the same profile. Check identity, pronunciation and loudness, then get the owner's approval.
2. Render the full narration with `.venv/Scripts/python -m pipeline.assemble <id> --narrate`. It is cached by a hash of the text and settings.
3. Run the tag-leak check: compare the Whisper words with the caption words. If a tag word is spoken, re-render that line.
4. Pass the gate in `rubrics/voice-qa.md`. Re-render only the failing lines, with the same profile.
