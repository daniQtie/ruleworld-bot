"""Run: .venv/Scripts/python -m tests.test_hook_rotation"""
import tempfile
from pathlib import Path
from pipeline import hook_rotation as H

with tempfile.TemporaryDirectory() as d:
    H.STATE = Path(d) / "logs" / "hook_rotation.json"
    got = [H.assign(f"ep{i}")["hook"] for i in range(12)]
    assert got == [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2], got            # fixed order, wraps 10 -> 1
    assert all(a != b for a, b in zip(got, got[1:]))                      # never the same hook twice in a row
    assert H.assign("ep3")["hook"] == 4                                   # idempotent: a rewrite keeps its hook
    assert len(H.load()["history"]) == 12                                 # ...and did not consume a new number
    assert H.previous("ep5")["hook"] == 5 and H.previous("ep0") is None
    assert H.assign("new")["hook"] == 3 and H.assign("new")["name"] == H.HOOKS[2]

# the real state file: the next episode must not repeat the hook of the last one
real = H.load()["history"] if (H.ROOT / "logs" / "hook_rotation.json").exists() else []
print("ok; next real hook:", (real[-1]["hook"] % 10 + 1) if real else 1)
