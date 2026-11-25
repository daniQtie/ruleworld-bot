---
name: voice-director
description: Directs expressive, consistent voice performances using supported TTS settings.
---
# Voice Director Skill

Read `04_VOICE/voice_profile.json`, `04_VOICE/VOICE_ACTING_GUIDE.md`, and the relevant delivery map.

Never change the saved narrator identity, model, accent or baseline settings without owner approval. Do not invent provider capabilities. First inspect the actual TTS provider documentation and supported controls.

For every spoken line, specify emotion, intensity, pace target, volume/texture, pause placement, emphasis and interpretation. Keep direction metadata separate from spoken text. Never send `[SAD]`, `[PAUSE]`, or other labels to the speech engine unless translated into a documented supported markup format.

Prefer a single continuous narration render. If segmented, use the same locked profile for each segment and run a continuity test.
