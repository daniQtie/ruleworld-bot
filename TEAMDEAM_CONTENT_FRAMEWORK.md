# Content framework: rule-based world stories

**Reference channel:** https://www.youtube.com/@TeamDeam-q6r. Use it for the **format** only: strange world rules, block-style characters, and fast, emotional storytelling. Never copy its premises, twists, characters, names, dialogue, animations or scenes.

## Audience and voice
- Worldwide, in natural, plain English. Narration is by Adam (Fish Audio).
- 2–3 min, vertical 9:16, published as Shorts.
- Kid-safe and brand-safe. No Roblox logos or UI, no real people, no copyrighted characters.

## The 10 formats (rotated by `pipeline.hook_rotation`)
1. **In This Town...** A town with one strange rule.
2. **In This World...** A whole world works differently.
3. **The Town Where...** Its defining feature is the hook.
4. **Everyone Has... Except Me...** The protagonist lacks what everyone has.
5. **Strange Rules and Consequences** A rule is broken and the consequences grow.
6. **Mystery and Suspense** Something is wrong, there are clues, then a reveal.
7. **Emotional Character Stories** A bond, a sacrifice, a loss or a reunion.
8. **Unusual Powers and Abilities** A power with a cost.
9. **Family and School Situations** Everyday stakes in a strange world.
10. **Interactive Choice-Based** The story ends on a choice for the viewer (comment A/B).

## Required story structure
Every story has these, in order:
1. A **strong opening hook** in the first 3 s, written in the assigned hook type's style.
2. An interesting **world rule**, stated simply.
3. A **protagonist** with a clear want.
4. **Supporting characters** with their own motivations.
5. A **conflict** that comes from the rule.
6. **Escalating consequences**, at least 3 steps.
7. A **major reveal** that re-frames the story.
8. A **resolution**.
9. A **memorable ending**: a twist, an emotional beat or a viewer choice.

## Visual style (put this line in every shot prompt)
"Roblox-style 3D game screenshot look: blocky R15-style avatar characters with square blocky limbs, smooth plastic shading, simple flat-textured faces, catalog-style hair and hat accessories, bright low-poly game map with round low-poly trees made of smooth parts, studded baseplate ground and simple buildings, default game lighting, vertical 9:16 framing, no logos, no UI, no text."
- Each character has a fixed `look` sentence (colours, hair or hat, clothes, signature item), reused word-for-word with a reference image.
- Vary the camera: wide establishing shots, close-ups for emotion, over-the-shoulder shots, low angles for threats, tracking shots for chases.
- Each episode gets its own palette and locations. Never reuse shots between episodes.

**Approved look (owner, 2026-11-20):** `assets/style-reference-approved.png`. It has classic blocky avatars (yellow head and hands, block arms and legs), a studded green baseplate, plastic shading, straw-roof huts and bright game daylight. One known fix: ask for "round low-poly Roblox-style trees made of smooth parts", not cube trees. Video QA compares every shot with this image.

## Originality check (script QA hard gate)
Before scripting, the researcher lists the closest existing video for each premise and explains why ours is different. If it is too close, it is dropped.

## Style study: TeamDeam (studied 2026-11-20)
**Channel:** 967K subscribers. Posts 1–2 Shorts a day. Recent views run 8K–256K, usually 40K–200K. The best recent ones: "I Got A Classroom That Didnt Exist..." (256K), "In This Town, You Only Get 10 Jumps A Year..." (202K), "In This Town, Snow Angels Comes Alive..." (200K).

**Reference video:** "In This Jungle, If You Lie You Become An Animal..." (https://youtube.com/shorts/0m8uFEfLv1g): 174.8 s, about 470 words (~2.7 words/s), 56.8K views.

**Story structure, as observed. Copy the pattern, never the story:**
1. **0–12 s: the rule and its examples.** "In this <place>, if you <action>, you <consequence>." Then 3 quick examples of the rule, then "Because of this, nobody ever ...".
2. **~12 s: the outsider.** "But one day, a new <person> arrived... and he had a very dangerous secret." A named protagonist comes from outside and doesn't know the rule.
3. **The first consequence** is visible but strange: half-done, or with a twist ("but something was strange").
4. **The mentor:** the oldest or wisest character explains the deeper rule and gives the one way to fix it, which the hero refuses.
5. **Escalation in the wider world:** other characters suffer from the rule too (2–3 quick examples).
6. **The mystery:** someone disappears, there are clues (footprints), and a hidden place.
7. **Reveals, stacked:** the hero's secret, then a family member who is also affected (an emotional beat).
8. **Resolution through the theme:** admitting the truth reverses it. The real meaning of the rule ("...the lies they told themselves").
9. **Second twist:** the mentor applies the rule to himself.
10. **Open-ended creepy final line** that sets up a sequel ("And deep inside the cave, one creature was still waiting...").

The narration is third-person past tense with simple sentences and lots of "Suddenly", "But then", "Meanwhile", and runs 2:30–3:00. There is no dialogue acting: the narrator tells everything.

**Visuals, as observed:**
- Real **Roblox avatars in Roblox maps**: blocky R15 avatars with catalog accessories, low-poly bright maps (jungle, huts, trees).
- Characters mostly **pose or stand**; the camera does the work. Cuts every ~2–4 s, alternating close-ups on faces and over-the-shoulder shots with wides.
- "Transformations" are shown by **swapping accessories** (a lion mane, a turtle shell, colours).
- **Captions:** ONE word at a time, big white bold text with a dark outline, low-centre of the frame. They are burned in and synced to the voice.
- Background music sits under a constant AI-style narrator.
- **Titles:** "In This Town, <rule>..." ending with "...", plus `#roblox #robloxstory #usa`.

## What we copy vs. what we never copy
- **Copy:** the format (rule-world premise, outsider hero, mentor, escalation, stacked reveals, sequel-hook ending), the pacing, the one-word captions, and the title pattern style.
- **Never copy:** their premises and twists (lying turns you into an animal, 10 jumps a year, etc.), names, lines, or specific scenes. Premises must be our own.

## Decision (owner, 2026-11-20, final): OpenArt, as close to Roblox as possible
The owner reversed the "real Roblox" choice: visuals stay on **OpenArt**, but they must **look like Roblox, not drift away from it**. They should match the reference video's look: blocky R15-style avatars, smooth plastic shading, catalog-style accessories, bright low-poly maps, and simple poses with the camera doing the work. No Roblox logos, UI or real catalog brand marks. Video QA fails any shot that drifts into a different style (realistic, anime, clay or Pixar-like).

### Background (why this was a decision)
TeamDeam films **inside Roblox itself**. Our engine is OpenArt (AI-generated), so the closest we get is "Roblox-like" blocky avatars. Two concerns:
1. **Look:** AI images will look similar, not identical, to real Roblox.
2. **Hashtags:** using `#roblox` on a video not made in Roblox may be seen as misleading. Use `#robloxstory`-style tags only if the owner accepts that, or use neutral tags (`#animation #story`).
