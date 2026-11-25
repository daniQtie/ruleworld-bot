# Production plan: Kit script 001, "In This Town, Only The Person You Lie To Can See Your Monster"

Status: **WAITING FOR OWNER APPROVAL**. No narration, render or upload happens until the owner approves this plan.
Source: `docs/storytelling-kit/03_SCRIPTS/001_every_lie_creates_a_monster.md`. This is an owner-supplied script, so the premise, dialogue and turning points stay as written.
Episode id (proposed): `2026-11-22-story-02`.

## 1. Story QA (pre-production, quality-reviewer)
Verdict: **PASS on every blocking item.**
- The hook is clear in 3 s.
- The rule is simple.
- Noah wants to protect Lily from disappointment; the stake is her trust.
- The conflict comes from the rule: every lie grows the monster.
- Escalation runs in 4 steps (shoe → knee → waist → taller than Noah), each in a new situation.
- The confession is the choice and the solution is foreshadowed ("tell the truth"), so the payoff is earned.
- The landing is strong: the empty chair stays, but the monster is gone.
- It is original and differs from the last 5 uploads (GTA ×3, the hat-kindness town).

Notes. None of these change the story, and items 1–2 are the owner's decision:
1. **Runtime is short (blocking for length, not for story).** There are about 222 spoken words. Adam at speed 0.85 plus the delivery-map pauses gives about 1:25–1:35 of speech. The kit's target is 2:15–2:25.
   - Plan A (recommended): keep the text exactly as written.
   - Add planned silent visual beats, each from the kit's storyboard:
     - the monster crawling out from behind Noah's shoe
     - the phone insert
     - Lily stepping back
     - three montage transitions with the monster growing
     - the empty-chair push-in
     - the crack-and-dissolve (~4 s)
     - the crown on Noah's head and the dance (~6 s)
     - a final hold
   - Estimated final: **~2:00–2:10**. This passes our 2–3 min rule but is under the kit's 2:15.
   - Plan B: Plan A plus 3–4 short narrator bridge lines in Noah's voice. They would not change any event; for example, before the montage: "So I kept saying yes." Plan B reaches ~2:20 but adds words, so it needs the owner's OK.
2. **Character voices.** Adam is the only narrator (identity lock). The story is first-person, so Adam = Noah, which is natural. Lily's lines are also performed by Adam with `(soft tone)` plus emotion tags.
   - Option: a separate Fish voice for Lily. This needs the owner to choose and approve a voice, and costs a little more.
   - Recommended: Adam only (kit: "never change voices").
3. **Captions per speaker** (proposal): narrator white, Lily pink, Noah light blue. Viewers see who speaks without labels.
4. "At school" in the montage becomes "after school, at the front gate" (the kit allows this) so a 15- and 8-year-old can share the shot.
5. **Rotation.** This script is exempt from hook rotation, and the rotation stays at hook #6 / format #2 for the next AI-written episode. Note that the format ("In This Town") repeats the previous episode's format. This is accepted because the owner chose the script.

## 2. Voice plan (voice-director, `config/voice_profile.json`)
- Fish s1, Adam, default temperature/top_p, one call per line, and the same settings for every line.
- Delivery map → per-line `say` tags, `speed` and `pause`:

| Line | Tags in `say` | Speed | Pause after |
|---|---|---|---|
| Hook | `(nervous)(soft tone)` | 0.85 | 0.25 s after "monster" (line split) |
| Rule | `(calm)` | 0.9 | `(break)` before "Tell the truth" |
| Lily hope | `(hopeful)(soft tone)` | 0.9 | — |
| Noah "Of course. He promised." | `(confident)` | 0.9 | 0.15 s hesitation |
| Lily "what's standing behind you?" | `(scared)(whispering)` | 0.8 | 0.35 s before |
| Noah dismissal | `(relaxed)` | 1.0 | — |
| Montage | Lily `(hopeful)`, Noah `(nervous)` → `(frustrated)` then softer | 0.9–0.95 | — |
| Birthday | `(sad)(soft tone)` | 0.8 | 0.5 s before |
| "That's when I realized..." | `(worried)` | 0.8 | 0.55 s before "she had seen every lie" |
| Confession | `(guilty)` → `(regretful)` | 0.8 | 0.4 s after "Lily" |
| Lily response | `(sad)(soft tone)` | 0.8 | 0.3 s after "Noah" |
| "Can you stay for the dance?" | `(hopeful)(soft tone)` | 0.85 | — |
| Noah "And this time..." | `(empathetic)` | 0.85 | `(break)` before "I mean it" |
| Final narration | `(moved)(soft tone)` | 0.85 | 0.4 s between the two sentences |

- **Voice test first.** Render only the hook line and the confession line (~20 s of audio, a few cents of Fish usage).
  - The owner listens: is it the same Adam, and is the emotion right?
  - Run the tag-leak check with Whisper.

## 3. Characters (character-director)
**Noah (15)**
- Look: messy dark-brown hair, blue hoodie (hood + drawstrings), dark jeans, white sneakers, scale 1.0.
- Body language: shoulders tense; he looks away when uncomfortable.

**Lily (8)**
- Look: long brown hair with a pink bow, pink sweater, cream skirt or leggings, scale 0.8.
- Body language: open posture, head tilts.

**Faces**
- Rebuilt to match the kit's sheets:
  - peach skin (not classic yellow)
  - oval black eyes with highlights
  - thick brows
  - line mouths
  - blush on happy/relieved
  - blue tears, and a sweat drop on scared
- 9 sheet expressions, plus guilty, nervous smile and trying-not-to-cry.
- New behaviour:
  - expression blending (cross-fade, no pop)
  - natural blinks
  - a talking mouth driven by the narration's loudness on the speaking character's lines only

**Lie-Monster**
- Original design: a blocky shadow body with long readable limbs and dim violet eyes that brighten as it grows.
- Growth stages: shoe → knee → waist → taller than Noah → dissolve.
- Motion: slow creeping and swaying, no lunges.
- Ending: it cracks with light seams, then breaks into drifting dark cubes.
- Noah never looks at it.

**Owner check**
- 3D turnaround stills of Noah, Lily and the monster, plus a 9-expression grid for each kid, made from the actual renderer.
- The owner approves the look before any shot is rendered.

## 4. Scenes and shots (scene-director)
**Locations:** all are built in code from blocky shapes and CC0 assets. Nothing is downloaded.

| Location | Contents | Mood colour |
|---|---|---|
| Kitchen | Table, chairs, counter, window | Warm |
| Hallway | Hallway behind the kitchen | Dim |
| Lily's bedroom | Night window with moon | Blue |
| Birthday room | Table, cake + candles, plates, empty chair, string lights | Warm gold vs a cold empty chair |
| Town street | Reused Kenney city, for the rule demo and the after-school gate | — |

**Inserts:**
- the phone message "I'm sorry. I can't make it this weekend." (exact text drawn in code)
- the paper crown
- Lily's drawing (two kids and a dad)

**Shot plan:** about 30–36 shots, following the kit's 8 scenes. The kit's storyboard prompts become shot specs:
- one clear action per shot
- reaction cuts for Lily
- over-the-shoulder reveals of the monster from Lily's point of view

**New acts:** dance, place the crown on a head, wipe eyes, trembling hands, a monster grow/creep/crack/dissolve, and a phone insert.

## 5. Code changes needed (after approval; no installs, no downloads)
All of these are in existing files, plus new specs:
- `render/world.js` and `lib.js`:
  - per-character skin tone
  - the new face set and blending
  - blinks and a talking mouth
  - long hair
  - hoodie and sweater prints
  - interiors, props, the monster and the new acts
- `pipeline/audio.py`: a per-line `volume`.
- `pipeline/assemble.py`:
  - per-speaker caption colours
  - the tag-leak check
  - a per-speaker mouth-envelope export for the renderer
- Telegram approval, YouTube OAuth, the upload code and the schedule are **not touched**.

## 6. Cost and time
- **Visuals:** $0 (local three.js render, about 10–15 min of render time for about 2 min of video).
- **Voice:** Fish Audio for about 2 min of narration plus the test, the same paid usage as episode 1 (a small amount, already approved). No OpenArt and no credits.
- **Order of work:**
  1. Cast and faces → owner approves the look.
  2. Voice test → owner approves the voice.
  3. Full narration.
  4. Shot specs and stills.
  5. Render.
  6. Voice QA + video QA.
  7. Telegram ✅/✏️/❌.
  8. On ✅, schedule at the next slot (1 AM or 8 AM PHT).

## 7. Platform notice
Fish s1 is retired on 2026-12-31. Before then, migrate Adam to s2.1-pro with `[bracket]` tags. This needs a continuity test and the owner's approval; it is a separate task.

## Status log
- **2026-11-20:** owner approved **Plan A**.
- **Built** (`render/kit.js`, `render/charsheet.html`, story.html hooks):
  - Noah and Lily in the kit sheet style, with 12 expressions each.
  - Expression blending, blinks, gaze and a talking mouth.
  - The Lie-Monster in an original design, with grow, creep, crack and dissolve.
  - The first monster draft looked too close to a known game creature (black body with purple eyes), so it was redesigned: navy smoke body, smoke spikes, round amber eyes.
- **Look sheets** are in `output/kit-001-look/`: `turn.png`, `faces-noah.png`, `faces-lily.png`, `monster.png`, and a 6 s animation test `anim-test.mp4`.
- **Script:** `scripts/2026-11-22-story-02.v1.json` keeps the kit text unchanged and adds voice direction to every line.
- **Voice test v1 problems:**
  - `(regretful)` was spoken aloud, so it is now banned in `config/voice_profile.json`.
  - Adam was measured at about 6.3 words/s at speed 1.0, far faster than the 3.4 w/s assumed in this plan.
- **Voice test v2** (`output/2026-11-22-story-02/voice-test.mp3`) passed the Whisper check: no tags were spoken.
  - Settings: speed 0.65/0.7, `(break)` at phrase boundaries.
- **Duration correction:** the real estimate for Plan A is **~1:25–1:40**, not 2:00–2:10. Section 1's runtime numbers were based on the wrong speech rate. Owner decision needed: accept the shorter runtime for this owner-supplied story, or approve added narrator lines (drafted for review first).
- **2026-11-20 decision:** owner chose to keep the text and accept ~1:35 (Rule E exception logged in owner-feedback). No lines will be added.
- **2026-11-20 (usage limit reached mid-production).**
  - **Done:**
    - The full narration passed the voice gate (`pipeline/voicecheck.py`): 102.7 s, Whisper match 97%, no spoken tags.
    - Built the sets and props: `render/kit-world.js` (house kitchen/dining, birthday decor, Lily's room) and the props (phone, paper crown, drawing, cake).
    - Added the engine features: camera cuts, dance/wipe/tremble/phone acts, prop hiding, speaker caption colours and the tag-leak gate.
    - Wrote the spec generator `render/specs/2026-11-22-story-02.mjs` (30 shots, 111.7 s incl. +0.3 s per shot).
    - Applied the staging fixes (`fix1`) to the spec.
  - **NEXT:**
    1. Re-render the stills, check every shot (occlusion, faces visible, birthday light), and fix.
    2. Render the 30 clips and write `shots.json`.
    3. Run `pipeline.assemble`, then `check_video` (80–180 s exception), then the video-qa agent.
    4. Telegram: the episode 1 waiter (pid 61240) is still polling. Do NOT start a second `approve wait` (getUpdates conflict); plan a combined waiter.
- **2026-11-21:** final passed video QA round 3 (rounds 1–2 failed: shots 1/6/12, then 1/9; all fixed) and the voice gate.
  - Final: 100.8 s, -15.1 LUFS, TP -1.4. Sent to Telegram as a 720p preview, with the sha lock on the real file.
  - Approval waiter: episode 1's waiter stays the only Telegram poller; the episode 2 upload runs after the ✅.
  - New tools: `pipeline/voicecheck.py` (per-line voice gate), `render/render-ep.ps1` (render + multi-part line join).
