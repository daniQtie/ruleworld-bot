# Owner feedback log (QA agents MUST read this before grading)

Every time the owner sends a correction or revision, it is added here as a dated lesson with a concrete rule. Script QA and Video QA grade against these rules, so past mistakes are caught before the owner sees them. Newest first.

## 2026-11-20: episode 1 (code-rendered) revised in Telegram
The owner pressed revise (voice note): "ratio is hindi 9x16, hindi full screen... too much gray... walang color yung damit, yung background... yung hulog yung bread is makalat... hindi maintindihan yung ibang movement... yung hat, ribbon, clip hindi mo maintindihan kung ano." The video was NOT uploaded.
- **Rule I (full screen):** the file was already 1080×1920, but the Telegram preview lacked width/height, so it did not show full screen. `approve.send_video` now sends width/height/duration. Every preview must open full screen 9:16 on a phone.
- **Rule J (colour):** no "grey world". Every character wears clear, saturated clothes in different colours, and backgrounds are colourful (buildings, ground, sky, props). A story that needs a "grey town" shows it in some other way, never with grey clothes on everyone. Video QA fails frames that are mostly grey.
- **Rule K (clean motion):** every movement must be clean and readable on one view. There are no chaotic piles or scattering objects (like the bread drop). One clear action per moment, with motion that eases in and out, and the camera holds long enough to read it.
- **Rule L (readable props):** every story object must be instantly recognisable at phone size: a hat looks like a hat, a ribbon like a bow, a hair clip like a clip. Make them big, iconic and high-contrast. Show the object in close-up when the narration names it.
- **Rule M (mood colour):** each scene's colour follows the story or drama: warm for kindness and celebration, cool blue for loneliness and night, tense for anger, golden for the reveal. It stays colourful throughout.
- **Rule N (character design):** every character, townsfolk included, has distinct characteristics (face design and expressions that change with the beat, hairstyle and hair colour, clothing details) and can be recognised at a glance.
- **Rule O (clear narration match):** whatever the voice names must be clearly identifiable on screen at that moment. No sudden or unexplained movement, and nothing pops or teleports without visible motion.

## 2026-11-20: new production mode (Stickman removed, OpenArt + Adam)
The owner replaced the Stickman/Benny pipeline with **original Roblox-style rule-based world stories** (format reference: TeamDeam; never copy). The visuals come from the OpenArt MCP. The narration is the owner's Fish Audio voice "Adam". Captions are word-synced with Whisper, and the music is lo-fi (Rule G).
- **Rule E is updated:** the target is **2–3 min** (120–180 s), not 50–60 s.
- **Rule F is updated:** the niche is rule-based world stories (`TEAMDEAM_CONTENT_FRAMEWORK.md`), no longer GTA hype.
- Rules A–D and G still apply. Rule D's GTA example becomes "say every name/acronym the normal way".
- **Rule H (credits):** no paid OpenArt generation without the owner's approval of the quoted cost, while `config/openart.json` has auto-spend off or no cap. Never buy credits.

## 2026-11-19: price-tag episode, owner wants a different background music
After QA 8.0 / 11/11 the owner pressed revise on `2026-11-19-gta6-problem-agitate` (voice note): he wants alternative background music and will choose one. The video was NOT uploaded. Samples are in `output/2026-11-19-gta6-problem-agitate/music-options/` (current plucky, lo-fi chill, upbeat bouncy, tense suspense, hype trap). **Rule G:** the music bed is the owner's choice; once he picks a style it becomes the default for all future episodes. The video QA audio check must confirm music is ducked and does not mask the voice.

## 2026-11-18: Houser episode rejected in Telegram (story, script, length)
The owner pressed revise on `2026-11-19-gta6-curiosity` (it had passed QA 11/11) and wrote: "Hindi ko gusto ung story. And script. Gawin mong naka aligned na sa script and niche natin. Plus every time na gagawa ka ng video wag masyado short. Atleast make it 50 seconds."
- **Rule E (hard gate):** every video is **at least 50 s** (target 50-60 s, ~115-140 words). Script QA fails any script under 50 s of speech; video QA fails any MP4 under 50 s (`pipeline/check_video.py` limit must match). Applies to all future episodes.
- **Rule F:** the story and script must stay aligned with the channel niche (Benny stickman GTA 6 hype) and with the script/topic the owner chose (the Short he linked). An original side-story that drifts from that (the restaurant/chef parable) was rejected. The video was NOT uploaded.

## 2026-11-18: say "GTA" normally, never spell it out
The owner reviewed a script where the voice spelled the name as "G, T, A, six" and said: always say it normally, never separate the letters. **Rule D (supersedes the example in Rule B):** the narration says "GTA six" / "GTA five" as one word, with no commas, no spaces between letters and no hyphens in `say` (NEVER "G, T, A", "G T A" or "G-T-A"), and the caption shows "GTA 6" / "GTA 5". The same applies to every acronym: say it the way people normally say it, written in one piece. QA fails any `say` that spells GTA out, and any caption that differs from the spoken form (Rule B still means the caption shows the heard words: "GTA six" is captioned "GTA 6").

## 2026-11-17: hook rotation
The owner supplied the skill `hook-rotation` and wants it used **always** by the researcher, scriptwriter and QA: 10 hook types in fixed order, a different one each video. This **replaces** the 2026-11-16 rule "always open with What if / If you" (What-if is now hook #1 of 10). The purpose of the old rule stays: a weak, unhooked opener is still a fail. Rules and guardrails are in `rubrics/hook-rotation.md`; the state is `logs/hook_rotation.json`. Script QA fails a script whose opener is not the assigned type; video QA checks the spoken opener.

## 2026-11-17: sick-day episode, approved in Telegram, then the owner found mismatches
The video passed QA (10/10) and the owner still found three problems after approving:

1. **Numbers: voice vs screen.** The voice said "two hundred fifty dollars" and the caption said "$250", but the counter on screen landed on "-$247".
   **Rule A:** every number must be identical in the voice, the caption and every on-screen element (counter, badge, stamp). If a number is rounded, say "about" aloud and show "about"/"~" on screen, or just use the exact figure everywhere. Never let two different values appear for the same thing.
2. **Caption text vs spoken words ("GTA 6" vs "G T A six").** The caption read "GTA 6" while the voice spelled "G, T, A, six".
   **Rule B:** the caption must show what is actually heard, word for word. For spelled-out acronyms use the spoken form, SUPERSEDED by Rule D (2026-11-18): speech "GTA six", caption "GTA 6". (Headlines/badges may use the normal written form "GTA 6", but check them against Rule C.)
3. **On-screen text vs voice/design.** Some UI text (badges, stamps, headlines) did not match what was being said at that moment.
   **Rule C:** every piece of on-screen text must agree with the voice at the moment it appears: same figure, same claim, same wording. Nothing on screen may say more, less or something different from the narration.

### How QA applies this
- **Video QA** must build a *consistency table* from `scene.json`: for each line of narration, list the spoken `say`, the caption `text`, and every item (headline, counter, badge, stamp, bubble) shown during that line, with their numbers. Any row where a number or claim differs is a FAIL, even if every other check passes. Put the table in `qa/video-qa.json` under `consistency`.
- **Script QA** must flag, in the script, any number whose spoken form, caption text and on-screen `visual` do not agree, and any acronym whose `text` differs from its `say`.
- Do not wave these through as "minor". The owner approved a video that QA had passed, so QA's bar was too low here.

## 2026-11-20: Roblox Storytelling Kit = permanent standards (Rule P)
The owner supplied `docs/storytelling-kit/` and ordered that it apply to every future video without being repeated.
- **Rule P:** every script follows the kit's story formula and Story QA. Every narration follows the voice guide: one locked Adam profile (`config/voice_profile.json`), per-line emotion through documented Fish controls only, and no spoken stage directions. Every video follows the character bible, the expression guide and the animation guide, and passes `rubrics/voice-qa.md` + `rubrics/video-qa.md` before Telegram. The project skills story-writer, voice-director, character-director, scene-director and quality-reviewer hold the details.
- Visuals are code-rendered (three.js), not OpenArt. Rule H still protects OpenArt credits if it is ever used again.
- Owner-supplied scripts (first: kit script 001 "In This Town, Only The Person You Lie To Can See Your Monster") are not simplified or replaced without the owner's permission.
- **2026-11-20, Rule E exception (episode 2026-11-22-story-02, kit script 001 only):** the owner accepted a runtime of about 1:35 so the kit's text stays unchanged ("OK na ang ~1:35"). For this episode, video QA's duration check passes from 80 s up to 180 s. Every other episode still needs 2:00–3:00.

## 2026-11-21: narration pacing and emotion (Rule Q)
The owner found the Lie-Monster episode's narration (speeds 0.65–0.75, pauses up to 1 s+) far too slow.
- **Rule Q1, pace:** do not over-slow Adam. Narration and dialogue sit near his natural pace. Use speed 0.85–0.95 for normal lines and 0.8 for sad or tender lines. Never go below 0.75 again.
- **Rule Q2, pauses:** pause only where it is needed (a reveal, a realization, a change of speaker), and keep it short. The usual gap is 0.15–0.35 s. Dramatic pauses are at most 0.6 s. Only planned silent visual beats (an effect or an action the viewer must watch) may run longer, and the screen must be busy during them.
- **Rule Q3, emotion is audible:**
  - Shock or surprise: louder and sharper, with `prosody.volume` +3 to +5 dB, an emotion tag such as (surprised)/(scared), and a slightly faster speed.
  - Worry, unease or sadness: softer and lower, with volume -2 to -4 dB, (soft tone) and a slightly slower speed.
  - Anger or urgency: firmer and faster, with volume +2 dB.
  - Voice QA checks that the per-line loudness follows the intended emotion (shock lines louder than the line before, worry lines quieter) instead of every line being flat.

## 2026-11-21: music bed + title-first opener (Rules G2, R)
- **Rule G2, music:** the owner listened to the options and chose the **original music box** bed (`pipeline/music.py` musicbox, code-made, $0, no copyright risk) for episode 3 and later episodes. It replaces the lo-fi bed (Rule G).
  - TeamDeam's top Shorts use Radiohead's "No Surprises". That is copyrighted, so we never use it.
  - Override per episode only with the script's `"music"` field.
- **Rule R, title first:** the first words heard in EVERY video are the episode's title hook, spoken at 0 s. For episode 3 that is "In this world, every step you take is counted." The question or other hook follows right after.
  - The title line is always kept.
  - The YouTube title (minus " #Shorts") and the first spoken line must match.

## 2026-11-21: school-vote story modelled on the competitor's top Short (Rule E exception)
The owner approved `scripts/2026-11-22-story-04.DRAFT.md` ("Nobody Noticed Her, Until The Votes Came In"), modelled on the beat structure of TeamDeam's top Short (analysis: `research/teamdeam-top-short-analysis.md`).
- The text follows the same skeleton but uses new people, lines and details. Never copy a competitor's words (Rule on originality).
- Runtime of about 40 s is accepted as a Rule E exception for this episode only (the competitor's top Short is 28 s). QA's duration check passes from 25 s up to 180 s for this episode.
- This owner-directed script is exempt from hook rotation, which stays where it is.
- **2026-11-21, audio mix fix (affects every future episode):** ffmpeg `loudnorm` flattened Rule Q's loud/soft lines (it falls back to dynamic mode when the gain would push past the true-peak limit). `pipeline/assemble.py` now applies ONE constant gain plus an `alimiter` (limit 0.8, `level=0`), and `pipeline/audio.py` ducks the music fully under any speech. Verified: shock lines about +3 to +4 dB over worry lines, -14.5 LUFS, no clipping.

## 2026-11-21: second competitor-modelled story (Rule E exception again)
The owner approved `scripts/2026-11-22-story-05.DRAFT.md` ("The Smallest Kid In School Just Jumped Over The Gym"), modelled on the beat plan of TeamDeam's #2 Short (analysis: `research/teamdeam-top2-short-analysis.md`), with a new ability (jump), a new event, new names and looks, new lines, and extra retention hooks.
- A runtime of about 55 s is accepted for this episode only (duration check passes from 25 s to 180 s).
- The hooks the owner asked for: a title with a "how?", an open-loop promise paid off at the end, a one-chance stake, a raised rival, foreshadowing plus a beat of silence, numbers on screen, micro cliffhangers, a camera change about every 2 s, and a loop ending.
- Owner-directed script: exempt from hook rotation.

## 2026-11-22: QA gates paused (owner order, saves limit and tokens)
The owner said: render once, and do not run the QA subagents ("try natin alisin muna yung QA").
- Until the owner turns QA back on, there is **no script-QA or video-QA subagent**. Make one render, run only the free automatic checks (`pipeline.voicecheck` for tag leaks and wrong words, `pipeline.check_video` for format and loudness), then send the result to Telegram.
- Telegram approval and the sha256 upload lock are unchanged: nothing uploads without the owner's ✅.
- This overrides the "QA gates are mandatory" line in CLAUDE.md while it is in force.

## 2026-11-23: storyboard before every render (owner approved)
New workflow for every episode: **script, then storyboard pictures (one per script line), then the owner's notes, then the full render.**
- Build the sheets with `python -m pipeline.storyboard <episode-id>` (6 numbered pictures per page, the exact line under each). Send them to the owner with one-click links.
- The owner revises by shot number ("shot 7: ..."). Fix only those shots, rebuild the sheets, and render the full video only after the owner approves the pictures.
- Stills take about 2–3 minutes, a full render about 6–8, so this saves limit and tokens.


## 2026-11-23: lead-in, music level and camera (owner, hard rules, all episodes)
- **Rule S, lead-in:** leave about 0.7 s of silence before the first spoken word. On Reels/Shorts the first word ("In this world") was being cut off when the video started. `pipeline/audio.py tts(lead=0.7)` now does this, so the first caption and the first shot also start 0.7 s in. Never above 1 s.
- **Rule T, music level:** the music was too quiet in episodes 6 and 7. Default bed gain is now 0.13 (it was 0.11 in those two, 0.16 before): a little louder, only a little, and the script must stay clearly audible. The music still ducks under speech.
- **Rule U, camera distance and movement:** the last video had the camera too close to faces. From now on:
  - default shots are medium or wide, with the upper body or the full body in frame and room around the character (use `fc(..., d >= 11)`). Close-ups only for one or two key beats per video;
  - cut variety: a wide establishing shot, mediums, two-shots, a low angle for power, a high angle for weakness, and an insert on an object;
  - almost every shot moves: a slow dolly in or out, a short orbit, a pan, or a tracking follow, with clean cuts between shots (Rule K).

## 2026-11-24: voice "crash" fix (owner heard it near 7 s in episode 9)
- Cause: the Fish `(surprised)` tag made a short noise burst (white-noise-like, spectral flatness 1.0) at the start of line 3. The line was re-recorded with `(happy)`, and the start is now clean.
- Every line now gets a short fade-in and fade-out, and the music stays ducked through gaps under 0.5 s (no pumping).
- **Rule V:** avoid `(surprised)` at the very start of a line. After narration, check every line start: flatness above 0.8 on the first 20 ms means a noise burst, so re-record that line.


## 2026-11-23: growth plan (owner approved, hard rules from now on)
The channel was getting 5–10 views per Short. Monetization needs 1,000 subscribers and 10M Shorts views in 90 days (or 500 and 3M for the lower tier).
- **Rule W, length:** 25–40 s per Short (top competitor Shorts are 28–41 s). Longer only if the owner asks.
- **Rule X, first frame:** a big yellow hook text, 4–7 words, shown from 0 to about 2.6 s (`hook_text` in the script JSON, drawn by `pipeline/assemble.py`). It must be a curiosity gap, not the full title (for example "BORN WITH ZERO?").
- **Rule Y, loop ending:** the last line or shot leads back into the first one, so the Short replays.
- **Rule Z, volume:** 3 Shorts a day. `pipeline/upload_youtube.py SLOTS_ET = (14, 16, 18)`, which is 3 AM, 5 AM and 7 AM PHT in winter. Owner 2026-11-24: analytics showed Ep 11 (3 AM PHT) climbing to 886 views between 3 PM and 9 PM ET, then stopping; slots now sit inside the US 3-9 PM peak (was 12/14/19 ET).
- The old GTA/money Shorts were deleted by the owner.
- Prefer the competitor formats that win: "In this world…" rule worlds with a number or counter and a twist, plus "Part 2" series to grow subscribers.
- Every week, check Studio analytics ("viewed vs swiped away", "average % viewed") and copy what works.

## Rule AA: sharp and bright, no haze (owner, 2026-11-24)
The owner said videos from Episode 9 on looked blurry and dim compared with Episodes 1–8 ("gawin mong sobrang linaw pa rin").

**Cause.** The post-effects layer added on 2026-11-24 (`render/fx.js`). Resolution was unchanged at 1080×1920.
- Film grain: hard for YouTube to compress, so the whole video goes soft. Files were 5–9 times bigger.
- Chromatic aberration: colour fringes on edges.
- Vignette: dark frame edges.
- Bloom: glow haze.
- Indoor exposure lowered to 0.55–0.7.
- No anti-aliasing in the effects render target.

**Fix, now hard rules:**
- `fx.js` always forces grain, aberration and vignette to 0. Bloom is off unless a shot explicitly sets `allowGlow`. Do not set `allowGlow` without the owner's OK.
- The effects render target uses 4× MSAA.
- `_common.mjs write()` enforces a minimum exposure per set: hallway, classroom and library 0.8; house 0.9; field and forest 0.95; lilyroom 0.45. Night scenes are exempt.
- Allowed: colour tint per mood, saturation and contrast near 1.05–1.1, sparkles and snow, short glitch or flash only at transitions, and name tags.
- Before/after: `output/clarity-before-after.png`.

## Rule AB: free Adam voice (owner, 2026-11-24)
- The owner compared Adam on `s1` (paid) with `s2.1-pro-free` ($0): "kaboses niya", but the free one was slower.
- **Fix:** `.env FISH_MODEL=s2.1-pro-free`, and `pipeline/audio.py` multiplies the speed by `S2_PACE = 1.14` for s2 models. This matched 14.8 s against 15.0 s on the same 4 lines. Tags are sent as `[tag]`.
- Same voice (FISH_VOICE_ID), same per-line volume. The Whisper tag-leak check still runs on every narration.
- If the free model is rate-limited or sounds off, set `FISH_MODEL=s1` (paid, about $0.015 a video, retires 2026-12-31) and tell the owner.

## Rule AC: pretty girl, handsome boy, a writer that learns (owner, 2026-11-24)
- The owner sent two reference pictures. The new leads are:
  - **Hana** (`hana`): long layered honey-blonde hair, pink hairband, sparkly pink top and skirt, lashes and blush, happy closed-eye smile.
  - **Kaito** (`kaito`, and `kaitoh` with headphones): stylish side-swept spiky brown hair with highlights, white tee printed ほし, black pants, smirk.
  - This side-swept spiky hair is the owner's own reference. The older ban on the old spiky style still applies to other characters.
- Faces and hair must look attractive in close-ups. Check every close-up in the storyboard.
- Be strict on script and emotion. `rubrics/lessons.md` is the writer's memory: each ✏️ note and each repeated validator failure is added there and fed into every new script, so mistakes do not repeat.
- Day cards (`"card": "Monday"` on a script line) show a big yellow title, like the owner's reference reel.
- **Exception to Rule W (owner, 2026-11-24):** Episode 17, the headphones love story, is one complete episode of about 85–90 s with 20 lines, because the owner asked for the whole story. Rule W (25–40 s) still applies to normal episodes.

## Rule AD: Episodes 18–20 rejected in full (owner, 2026-11-25)
- The owner rejected all three Claude-written Shorts (story-18 promise cracks, story-19 blank future card, story-20 "never say it's quiet today") before any upload: "ang pangit ng animation, ang pangit ng movement, ang pangit ng character, pati yung text."
- Script verdict: "Walang katuturan, walang magandang plot, no hook."
- **What this means, now hard rules:**
  - The `pipeline/autoshots.py` template look (stiff stage poses, generic actions, props stuck beside the character, board/sign text cut off at the frame edge) is not good enough for the owner. Do not send template-only renders as finished videos.
  - A hook-rotation label is not a hook. Line 1 must make a viewer stop scrolling on its own merit; a soft warning ("Before you make a promise…") or a vague tease ("Nobody tells new kids…") fails.
  - The plot needs a clear, surprising, logical twist and a reason to care. Moral-of-the-story endings (late promise still counts, blank card means you choose, secret prank remote) read as pointless.
- Nothing from 18–20 was uploaded. Their Telegram messages are not to be approved.

## Rule AE: explain the plot, give the ending justice (owner, 2026-11-25)
- The owner revised stories 21–23 (walkie-talkie, empty goal, vegetable war): "masyadong short kaya na-cut agad ang dulo. Hindi binibigyang linaw ang plot… gusto ko may maayos na ending kahit umabot ng 1–2 mins… bigyang linaw mo ang plot, like 'he is his father'."
- **Now hard rules (this changes Rule W's 25–40 s):**
  - **Length:** whatever the story needs, usually **60–90 s** and up to 2 min. Never cut a story short to hit a time.
  - **Say the twist in plain words.** After the reveal image, one line states it outright, e.g. "The boy on the walkie-talkie was my dad."
  - **Explain the "why":** the backstory behind the strange behaviour (the accident and the promise; the lonely grandparents).
  - **Resolution:** after the twist, 3–5 lines show what happens next and how the characters feel.
  - **Final line:** a clear closing image or line, not a cliff.
  - **End hold:** keep at least 2.5 s of picture and music after the last word (`tail_hold` ≥ 2.5) so the ending never feels cut.
