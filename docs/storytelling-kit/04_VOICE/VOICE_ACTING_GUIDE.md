# Voice Acting and Narrator Consistency Guide

## Goal

The narrator should sound like the same person across every upload, while changing the emotional interpretation to fit the story.

## Identity lock

- Use one persistent voice provider, model ID and voice ID.
- Save exact configuration in `voice_profile.json`.
- Do not let an agent randomly choose voices per scene.
- Keep accent, base pitch, timbre and default speaking rate stable.
- If the TTS provider supports a fixed seed, test and save it; do not invent seed support.
- Prefer a single continuous narration render for the whole Short.
- If separate dialogue renders are required, keep identical speaker and model settings and compare them for timbre and loudness before assembly.

## Emotional delivery palette

| Emotion | Pace | Vocal quality | Avoid |
|---|---|---|---|
| Suspense | Slightly slower | Quiet, controlled, focused | Whispering every word |
| Curiosity | Normal | Bright, inviting, slight lift | Overexcited presenter voice |
| Fear | Slightly slower | Tense, breath controlled | Screaming by default |
| Sadness | Slower | Softer, restrained | Melodramatic sobbing |
| Guilt | Slightly slower | Hesitant, lower energy | Flat monotone |
| Anger | Normal to brisk | Firm, clipped emphasis | Shouting throughout |
| Urgency | Faster | Clear, direct, energized | Unintelligible speed |
| Relief | Normal/slower | Softer, released tension | Instant exaggerated happiness |
| Warmth | Normal | Gentle, sincere | Commercial voice-over style |

## Direction format

Every line should carry separate metadata:

`[EMOTION: guilt] [PACE: slow] [VOLUME: soft] [PAUSE_BEFORE: 450ms] [EMPHASIS: “isn't coming”]`

This is director metadata. It must not be spoken aloud.

Only convert to SSML or provider-specific controls if the currently configured TTS provider documents support. Otherwise use supported pause and prosody features, or use a performance prompt with the text.

## Pause principles

- Short pause before a reveal: 200–350 ms.
- Emotional realization: 400–700 ms.
- A character searching for words: 250–500 ms.
- Do not insert pauses after every sentence.
- Keep dialogue timing natural; avoid pauses that make characters sound synthetic.

## Speed principles

Use 145 WPM as a starting point. Emotional lines can slow toward 120–130 WPM; urgent lines can rise toward 150–160 WPM. These are target ranges, not rigid per-sentence speed switches. Never sacrifice clarity for pace.

## Test procedure

1. Render the same 10–15 second sample with the saved profile.
2. Check voice identity, accent, pitch, pronunciation and loudness.
3. Render contrasting lines (suspense, guilt, warmth) using the same identity.
4. Check transitions between segments.
5. Save approved provider settings.
6. Reuse the profile by default for future episodes.
