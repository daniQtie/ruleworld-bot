"""Run: .venv/Scripts/python -m tests.test_captions"""
from pipeline.captions import align, cues

lines = [{"text": "This jar turns *$1 into $66,795."}, {"text": "Most people quit."}]
times = [{"start": 0.0, "end": 3.0}, {"start": 3.2, "end": 4.5}]
heard = [("This", 0.0, 0.2), ("jar", 0.2, 0.4), ("turns", 0.4, 0.8), ("$1", 0.8, 1.2), ("into", 1.2, 1.7),
         ("$66", 1.7, 2.2), (",000.", 2.2, 2.9), ("Most", 3.2, 3.5), ("people", 3.5, 3.9), ("quit.", 3.9, 4.4)]
words, ratio = align(lines, times, heard)

assert [w["word"] for w in words] == ["This", "jar", "turns", "$1", "into", "$66,795.", "Most", "people", "quit."]
assert words[3]["hot"] and words[5]["hot"] and not words[0]["hot"]          # *marked and numeric words are gold
assert words[3]["start"] == 0.8                                              # matched word keeps Whisper time
assert 1.7 <= words[5]["start"] < words[5]["end"] <= 3.0                     # unmatched word interpolated in its gap
assert all(a["start"] <= b["start"] for a, b in zip(words, words[1:]))       # monotonic
assert 0.85 < ratio < 0.95, ratio

cs = cues(words)
assert all(len({w["line"] for w in c}) == 1 for c in cs)                     # cues never span two lines
assert all(len(" ".join(w["word"] for w in c)) <= 16 or len(c) == 1 for c in cs)
assert all(c[-1]["hold"] <= n[0]["start"] for c, n in zip(cs, cs[1:]))       # no overlapping cues
# a zero-length Whisper word must stay on screen long enough to read, and cues must not overlap
lines2 = [{"text": "Ultimate, or keep $20?"}]
heard2 = [("Ultimate", 5.0, 5.0), ("or", 5.0, 5.3), ("keep", 5.3, 5.6), ("$20", 5.6, 6.0)]
w2, _ = align(lines2, [{"start": 5.0, "end": 6.0}], heard2)
assert all(w["end"] - w["start"] >= 0.15 - 1e-6 for w in w2[:2]), w2
assert all(a["end"] <= b["start"] + 1e-9 for a, b in zip(w2, w2[1:])), w2
cs2 = cues(w2)
assert all(c[-1]["hold"] - c[0]["start"] >= 0.15 - 1e-6 for c in cs2), cs2
# "GTA 6" is never split across cues (owner Rule D / video QA 2026-11-19)
lines3 = [{"text": "That $79.99 price tag on GTA 6 is a *trap."}]
ws3 = [dict(word=x, line=0, start=i * 0.3, end=i * 0.3 + 0.3, hot=False) for i, x in enumerate(lines3[0]["text"].split())]
cs3 = [" ".join(w["word"] for w in c) for c in cues(ws3)]
assert not any(c.split()[-1] == "GTA" for c in cs3) and any("GTA 6" in c for c in cs3), cs3
print("ok", [" ".join(w["word"] for w in c) for c in cs])
