# Video QA rubric (code-rendered story videos; mandatory gate before Telegram)

This rubric includes the owner's kit checklists `docs/storytelling-kit/09_QA/CHARACTER_AND_VISUAL_QA_CHECKLIST.md` and `FINAL_SHORT_QA_CHECKLIST.md`. Run the voice gate `rubrics/voice-qa.md` as well.

## Before grading
**First read `rubrics/owner-feedback.md`** (hard rules A–O).

Check the **actual final MP4** (`output/<id>/final.mp4`):
1. Run `.venv/Scripts/python -m pipeline.check_video output/<id>/final.mp4`. It measures format, duration, loudness, clipping and static holds, and writes a contact sheet and the first frame to `output/<id>/qa/`.
   - Known false fail: its safe-zone check flags full-bleed 3D frames. Judge safe zones visually instead.
2. Look at the contact sheet, the first frame, and a still at every shot change (`ffmpeg -ss <t> -i final.mp4 -frames:v 1 qa/s<t>.png`).
3. Compare faces with the episode's character bible and any sheet in `docs/storytelling-kit/assets/character-sheets/`.

## Checks
| # | Check | Pass condition |
|---|---|---|
| 1 | Output exists | `final.mp4` decodes fully. Every planned shot is in `shots.json`, and nothing is missing, truncated or black. |
| 2 | Format | 1080×1920 (9:16), 30 fps, H.264 + AAC, no letterboxing. |
| 3 | Duration | 120–180 s, and appropriate to the story (not padded). |
| 4 | First frame | It gives a clear reason to stop scrolling. There is no logo or title intro. |
| 5 | Story | The shots tell the script's story in order. |
| 6 | Character identity | Each character has the same face design, eyes, brows, skin tone, hair and colour, outfit, accessories and scale in every shot. The right character appears in each scene. |
| 7 | Expressions | Each face matches the line's emotion. There is no static smile on sad, scared or guilty lines. Expressions are held long enough to read and blend rather than pop. |
| 8 | Gaze and body | Characters look at their target (a person, a prop, the monster). Body language matches the face. Listeners react instead of freezing. |
| 9 | Mouth | The speaker's mouth moves while their line plays, and stays still while listening. This applies only once the renderer supports it; until then it is a polish note. |
| 10 | Animation quality | Motion is smooth and eased (Rule K). No sudden pops except deliberate reveals. No limb clipping, floating, sliding feet or jitter. |
| 11 | Scene continuity | Location layout, time of day, light and props stay consistent between neighbouring shots. Character scale and geography are coherent. |
| 12 | Colour and mood | There is a mood colour per scene (Rule M), never a grey world (Rule J). Props are readable (Rule L). |
| 13 | Narration = visuals | Each shot shows what Adam is saying at that moment, and whatever is named is clearly on screen (Rules A–C, O). |
| 14 | Artifacts and text | No missing models, z-fighting, flicker or garbled in-frame text. Phone or sign text is exact and readable. |
| 15 | Repeats | No shot is repeated or near-duplicated, and none is reused from an earlier episode. |
| 16 | Captions | Word-synced to Adam, one line, unclipped and inside safe margins. No cue is shorter than 0.15 s, and acronym+number stays together (Rule D). |
| 17 | Audio | The voice gate passes. The lo-fi bed is ducked under Adam (Rule G), and there is no clipping. |
| 18 | Safe zones | Nothing important under the Shorts UI (top ~220 px, bottom ~560 px, right ~140 px). |
| 19 | Originality and rights | Original story. Assets are CC0 or our own code. Music is our procedural bed. No watermark. |

## Output format
```json
{"pass": false,
 "checks": {"output_exists": true, "format": true, "duration": true, "first_frame": true, "story": true, "characters": true, "expressions": false, "gaze_body": true, "mouth": true, "animation": true, "continuity": true, "colour": true, "narration_match": true, "artifacts": true, "repeats": true, "captions": true, "audio": true, "safe_zones": true, "originality": true},
 "blocking": ["01:12 shot 19: Noah smiles while confessing; use the 'guilty' face"],
 "polish": ["..."],
 "rerender_shots": [19]}
```

**Pass = every check is true**, except that check 9 is polish until lip movement exists. List blocking notes apart from polish notes, with timestamps, and name the shots to re-render.
