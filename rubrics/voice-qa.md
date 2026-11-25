# Voice QA rubric (mandatory gate; from the owner's kit `docs/storytelling-kit/09_QA/VOICE_QA_CHECKLIST.md`)

Check the real narration: `output/<id>/voice-<key>.wav`, `narration-<key>.json` (Whisper words), and the final mix. You cannot listen. Say that each check was "checked by settings, meter and Whisper" and leave the by-ear judgement to the owner (Telegram).

| # | Check | How to check | Pass condition |
|---|---|---|---|
| 1 | Same narrator | The settings used match `config/voice_profile.json`. | Same voice ID, model and temperature/top_p for every line. |
| 2 | No speaker change | `pipeline/audio.py` uses one reference ID. | No line uses another voice. |
| 3 | No spoken stage directions | Compare the Whisper words with the caption words. | No tag word (sad, whispering, break, …) is heard that is not in the caption. No bracket labels appear in `text`. |
| 4 | Pronunciation and intelligibility | Whisper match ratio, plus per-line word diffs. | Match ≥ 0.9, and every name and key word is recognised. |
| 5 | No clipped words or missing line endings | Each line's last caption word appears in Whisper before the next line starts. | Nothing is cut off. |
| 6 | Pacing | Words/s for each line. | Normal lines run ≤ 3.3 w/s, emotional lines ≤ 3.0 w/s, and none is below 1.8 w/s (robotic). |
| 7 | Pauses are intentional | Gaps between lines vs the delivery map. | Reveal and realization pauses exist where the map puts them, and there is no pause after every line. |
| 8 | Emotion fits the scene | Each line's `emotion` / tags vs its beat (kit palette). | No mismatch, such as a happy tag on a sad line. No line overacts (no screaming or sobbing tags unless the script demands it). |
| 9 | Loudness | `check_video` meter. | The final is -14 LUFS ±1.5, true peak ≤ -1 dBTP, and no line is noticeably louder than the rest (per-line RMS within ±3 dB). |
| 10 | Sync | Line start times vs shot slots. | Narration lines up with the shot that shows them (Rules A–C). |

**Blocking:** any failure on 1–5, 9 or 10. Fix only the failing lines with the same profile, re-run, and re-check.
