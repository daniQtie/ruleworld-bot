# Character style reference (owner, 2026-11-22)

The owner's reference images are in `docs/style-reference/` (4.jpg lineup, 5.jpg face sheet, 6.jpg group, 7.jpg and 8.jpg the deer trio, 1.png banner, 2.png mirror selfie). From now on, cast faces, bodies and the monster follow these. Build our **own** versions with the same look; never trace or reuse a third-party asset.

## What the references show
- **Bodies:** blocky Roblox-style avatars with real outfits:
  - a hoodie with drawstrings
  - a black suit
  - a sparkly hoodie with a skirt
  - an open jacket over a tee
  - cargo pants
  - a dress
  - accessories: headphones, a cap, a visor, glasses, an eyepatch
  - each character has one strong outfit colour
- **Faces:** big, readable emotions that fill the face.

| Face | What it looks like | Our expression name |
|---|---|---|
| Crying | squeezed eyes, two tear streams, wobbly open frown | `sob` |
| Smirk | one-sided smile, one brow raised | `smirk` |
| Star-struck | gold star eyes, big open smile with tongue, sparkles | `starstruck` |
| Shocked | white eyes with tiny pupils, open mouth with top teeth | `shocked` |
| Worried | raised inner brows, sweat drops, wavy mouth | `worried` |
| Laughing | ^ ^ eyes, big open mouth | `laugh` |
| Angry | heavy slanted brows, flat mouth | `angry` |
| Thinking | one brow up, small flat mouth | `thinking` |

- **Lighting:** bright saturated daylight, or a moody night forest with a teal glow and a flashlight for horror.
- **Monster, "the Deer":** a tall thin brown humanoid with a deer head and branching pale antlers. It has big round white staring eyes with small pupils, a wide open mouth, pink inner ears and long arms raised with dark claws. It is playful-creepy: the same character also does peace signs and selfies with the kids, so it can be funny or scary.

## What is built in the renderer
- **Faces:** `render/kit.js` has the new expressions `sob`, `laugh`, `starstruck`, `shocked`, `worried`, `smirk` and `thinking`. The existing ones still work.
- **Outfits:** `render/lib.js` has two new shirt prints, `jacket` (open jacket over an inner shirt, option `inner`) and `suit` (white shirt, option `tie`). Shirts can also take `sparkle: true`.
- **Extras:** `eyepatch`, `headphones(color)`, `cap(color, brim)`, `visor(color)`, `skirt(color, length, sparkle)`, `curls(color)`.
- **Cast v2** (original names, looks follow the refs):

| Name | Look | Default face |
|---|---|---|
| leo | blue hoodie | sob |
| vince | black suit, eyepatch | smirk |
| jada | pink sparkle hoodie and skirt, headphones, bun | starstruck |
| marcus | blue open jacket, cargo pants | shocked |
| pia | pink hair, lavender dress | worried |
| gwen | blonde, visor, glasses, denim jacket | happy |
| rex | black jacket, spiky hair | angry |
| zoe | orange jacket, cap, headphones | laugh |
| ollie | curly hair | thinking |

- **Monster:** `KIT.deerMonster()`. In a shot spec, use `monsters: [{ kind: 'deer', at, rot, h: 7.4, eyes: 0–1 (1 = tiny pupils), reach: 0–1 (arms up), lean }]`.
- **Test renders:** `output/brand/style1.png` (lineup), `style2.png` (the deer with two kids), `style3.png` (face close-ups), `style4.png` (a vertical horror frame).

## Pass 2 (owner: "ilapit pa", 2026-11-22)
- Cast v2 now uses `style.round`: a Roblox-classic rounded-cylinder head with the face decal wrapped around it, so the features are about 20% bigger. Older casts keep the box head, so shipped episodes are unchanged.
- New set `loc: 'forest'`: blocky trees around a clearing. Use `light: 'day'` for bright scenes, or `light: 'night'` plus `fog: [12, 60, '#0d2a33']` for teal moonlight horror.
- Test renders: `style2.png` (day forest, the deer with two kids), `style3.png` (round faces), `style4.png` (vertical night chase), `style5.png` (night chase, banner size).

## Next ideas
- A flashlight prop with a light cone.
- A deer pose library: run, peek from behind a tree, peace-sign selfie.

## Luck Short reference (owner, 2026-11-24): @Gneef "In This World, You Can See Your Luck"
Frames saved in `docs/style-reference/luck-short/`. What was copied into the renderer (story 009 cast in `render/kit.js`):
- **Hero (Noel):** bright orange messy swoop hair, beige skin, plain light-grey tee, green pants, big grin or wide-eyed shock.
- **Chest number:** printed straight on the shirt as a big outlined `%` number, green when positive and red when negative (`counter: 'L1000'`, `'L-1000000'`).
- **Extras:** `suitman` (brown hair, black suit, white shirt, tie), `oldman` (white messy hair and a white beard, brown plaid), `mumn` (long brown hair, blue-grey top), `mia` (little sister, yellow top, red pants and shoes).
- **Graphics:** a big white "FREE" sign, bright city daylight, a sunset sky, and a kitchen with a blue-green floor.

## Effects (owner, 2026-11-24): `render/fx.js`
Opt-in per shot with `fx: { bloom, bloomThreshold, vignette, grain, aberration, sat, contrast, tint: [r,g,b], sparkles: { color, count, size, speed } }`.
Glow, vignette, film grain, a touch of chromatic aberration, a colour grade and floating sparkles. Used in story 009 (warm gold sparkles for the lucky day, a cool grade for the sad kitchen). Keep bloom low on bright sets (bedroom, white rooms).
Audio polish (pedalboard, installed 2026-11-24): `music.polish()` adds reverb, EQ and compression to every bed, and `audio.mix` now holds the music duck through gaps shorter than 0.5 s and fades each voice line in and out (no clicks).
