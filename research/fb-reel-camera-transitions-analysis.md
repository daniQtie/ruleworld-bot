# Facebook reel: camera, shots and transitions (checked 2026-11-24)

**Source.** The owner sent https://www.facebook.com/reel/2051322002251700/ to show the shots, camera angles and transitions they want. It is a 127 s Roblox-style detective story about a smiley-face serial killer, told one word on screen at a time.
- The file was downloaded for analysis only and deleted afterwards. Story, names and words are **not** copied; only the camera and edit techniques are.

## Techniques worth copying
1. **The camera almost never stands still.** Every shot is a push-in, an orbit, a track or a slow drift. There are very few hard cuts: scene detection found only about 20 in 127 s.
2. **Drone opener.** The video opens on a high aerial of the town at dusk. The camera dives down to the street and rushes at the main character until he fills the frame. Then a name tag pops in above his head (name + role).
3. **Zoom-through transitions.** This is the signature move:
   - The camera pushes into a face, an eye or the hair until it fills the screen and goes blank or dark.
   - The next scene starts on an extreme close-up of an object (for example a coffee cup) and pulls out.
   - Example: eye → black → white light → cup.
4. **White flash** between scenes (about 0.2 s), plus a soft light bloom.
5. **Glitch / RGB split** on shocking moments, for example a hacked screen. Chromatic aberration ramps up and stripes flicker.
6. **Shot variety inside one scene:**
   - extreme close-up of an eye;
   - big face fill;
   - a feet-only walking shot;
   - over-the-shoulder;
   - a high wide shot of the room;
   - Dutch (tilted) angle;
   - an insert of a prop or clue (TV, monitor, case file, fingerprints, coffee stain).
7. **Screens as storytelling.** TV news, a monitor inbox, suspect cards. The text on screen carries the plot.
8. **Name tags** when a character is introduced: a small dark label above the head with the name and a role line.
9. **Captions:** one word at a time, centred, bold white with a dark outline. Key words pop bigger.
10. **Lighting moods:** dusk town (purple/orange), cool blue office, red tint for the villain reveal at the end (cliffhanger).

## How it maps to our engine
- Zoom-through, white flash, whip blur: use the ffmpeg `xfade` transitions (`zoomin`, `fadewhite`, `hblur`, `smoothleft`) between clips. Also ease the render camera into an extreme close-up at the end of a shot. This is cheap and works in the cloud.
- Glitch: animate the existing `aberration` in `render/fx.js` inside time windows, and add RGB stripe noise.
- Drone opener and multi-point moves: add a camera `path` with 3+ keyframes, plus `roll` for Dutch angles.
- Name tags: a label sprite above the head (like the counter sprites).
- Screens: a `screen` prop with text, like the `sign` prop.
- Captions: switch to word-by-word with a pop on key words (Whisper already gives word times).
- Limits: we have no town street or office set yet. The closest are the field (school front), hallway and classroom.
