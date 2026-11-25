---
name: scene-director
description: Use when turning an approved script into a storyboard and shot specs for the three.js renderer (render/specs/<id>.mjs -> output/<id>/shotspec.json), or when reframing/re-rendering shots. One clear action per shot, vertical 9:16, voice = screen.
---
# Scene Director

Read first:
- `docs/storytelling-kit/07_SCENES_AND_PROMPTS/STORYBOARD_AND_GENERATION_PROMPTS.md`
- `docs/storytelling-kit/07_SCENES_AND_PROMPTS/VIDEO_GENERATION_PROMPT_TEMPLATE.md`
- `.claude/agents/video-generator.md`: the shot spec format and what the engine can do.
- `rubrics/owner-feedback.md`: Rules C, J, K, L, M and O.

Our "provider" is code: three.js plus Kenney CC0 assets and procedural props, rendered in headless Edge. There is no AI video and no credits are spent. The engine can do only what `render/world.js` and `render/story.html` implement. Do not claim a feature (lip sync, a new location, an effect) until it exists and a still proves it.

## What each shot specifies
Write one shot per script line, or more if a line needs a reaction cut. Each shot has:
- the scene ID and its duration (the line's slot + 0.3 s)
- the location, the time of day and the light preset
- the characters on screen
- ONE visible action: who does what, and what the viewer must notice
- the acting (from `character-director`)
- the camera: framing, angle, movement and focus target
- the mood colour
- the props
- the continuity locks
- a sound cue

## Rules
- **Voice = caption = screen.** The shot shows exactly what the voice says at that moment.
- **Continuity:**
  - Establish each location's geography once.
  - Keep layout, props and light consistent between neighbouring shots.
- **Varied framing:**
  - close-ups for emotion
  - over-the-shoulder for reveals
  - wide shots for geography
  - inserts for key props. A phone message, for example, has its exact text drawn in code and must be readable.
- **Vertical framing:**
  - Stage two-shots in depth.
  - Keep faces in the upper-middle.
  - Keep anything important out of the top ~220 px and the bottom ~560 px (captions).
- **Silent beats:** silent visual beats (a dissolve, a dance, a look) are allowed. Plan them in the timeline; they count toward the duration honestly.
- **Motion:** smooth and eased (Rule K). No sudden pops, except deliberate reveals.
- **Colour:** a mood colour per scene (Rule M), never grey (Rule J).
- **Plot:** do not invent plot events that are not in the script.

## Body animation (owner-approved 2026-11-25)
- Characters move with **real animation clips** from Kenney Blocky Characters (CC0, `render/assets/kenney/blocky-characters`), retargeted onto our kit characters every frame.
- Act: `{ do: 'clip', who, clip, t: [a, b] }`. Clips:
  - idle, walk, sprint, sit, pick-up
  - emote-yes, emote-no
  - interact-right, interact-left
  - holding-right, holding-left, holding-both
  - attack-kick-right
  - die (do not use it on kids)
- `autoshots.py` gives everyone on stage `idle` by default, the focus `walk`/`sprint` while moving, and `emote-yes`/`emote-no`/`pick-up` for the script actions `agree`/`disagree`/`pickup`.
- Gesture acts (point, wave, face, lookdown …) layer on top of the clip.
- Hand-posed procedural limbs looked stiff to the owner ("pangit ang movement"). Never ship a shot where the only motion is procedural arm poses.

## Camera grammar (adapted from DirectorSKILL, MIT, github.com/wuwangzhang1216/DirectorSKILL)
**Size ladder:** extreme wide → wide → medium → medium close-up → close-up.
- When cutting between two shots of the same people, change by **two rungs** or by **at least 30° of angle**, else the cut reads as a jump.
- `autoshots.py` enforces this for repeated cameras.

**180° rule:** in a scene between two people, the camera stays on one side of the line between them.
- Our stage is always filmed from +z, so do not put a camera behind the characters (negative z offset) in the middle of a dialogue.
- Cross the line only with a wide re-establishing shot.

**Coverage for a two-person beat:** one wide (geography) → singles of each speaker (close/push) → a two-shot for the reaction → an insert of the key prop.
- Cut on the line change; the listener's reaction is its own short shot.

**Angle means something:**
- low: power or threat (bully, teacher, monster)
- high: small or helpless
- eye level: default
- Dutch/roll: unease, at most twice a scene
- OTS: confrontation; only with a real second person in frame and the camera ≥4 units behind their shoulder

**Never static:** every hold creeps (a slow push or drift).
- Use smootherstep glides between keyframes.
- Use a 3–5° roll only on tense or emotional beats.
- Use a short decaying shake (about 0.25 s) on impacts and shocks. The `test-anim.html` camera is the reference.

**Hide weak animation with framing:** if a pose looks bad, cut tighter on the face or wider on the action instead of showing it full-body.

## Editing for retention (Shorts guides, 2026: OpusClip, Hooked, Kapwing)
- **A new shot about every 2 s.** A script line longer than about 3 s gets a reaction cut or a punch-in.
- **No dead air.**
- **Punch-ins:** a fast punch-in zoom on the punchline or twist line; a slow push for tension. Use punch-ins at most once every ~8 s so they keep their power.
- **Sound:** a short sound cue on each cut (whoosh or pop) sits about 10 dB under the voice.
- **Transitions:** no fancy ones. Use a hard cut by default, and flash or glitch only on the twist.
- **One focal point per frame.**

## Sets (2026-11-25, owner: "pangit ang background")
- Outdoor scenes default to `street` (suburban houses, fences and trees across the road) or `city` (shop street, fountain plaza, towers). Both are built from real Kenney kits.
- `field` (the gym brick wall and high-jump bar) is for sports scenes only.
- Indoor sets: `classroom`, `hallway`, `library`, `house`, `bedroom`.
- Night outdoors: `forest`, or `street` / `city` with `time: "night"`.
