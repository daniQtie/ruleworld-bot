"""Run: .venv/Scripts/python -m tests.test_budget"""
from pipeline.budget import decide
off = {"OPENART_AUTO_SPEND": False, "OPENART_MAX_CREDITS_PER_VIDEO": None}
assert decide(10, 100, off)[0] == "ask"                       # initial config: never auto-spend
assert decide(10, 100, {"OPENART_AUTO_SPEND": True, "OPENART_MAX_CREDITS_PER_VIDEO": None})[0] == "ask"  # cap unset
on = {"OPENART_AUTO_SPEND": True, "OPENART_MAX_CREDITS_PER_VIDEO": 50}
assert decide(50, 100, on)[0] == "ok" and decide(51, 100, on)[0] == "ask"
assert decide(120, 100, on)[0] == "insufficient" and decide(120, 100, off)[0] == "insufficient"
print("ok")
