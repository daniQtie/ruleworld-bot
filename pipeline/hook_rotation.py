"""Hook rotation (owner skill: .claude/skills/hook-rotation/SKILL.md).
Each new episode gets the NEXT of the 10 hook types (1→10, then back to 1), so no two videos in a row share a hook.

  python -m pipeline.hook_rotation assign <episode_id>   # idempotent: the first call assigns the next hook, later calls (rewrites) return the same one
  python -m pipeline.hook_rotation show [<episode_id>]   # history, the previous episode's hook, and the next number
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
STATE = ROOT / "logs" / "hook_rotation.json"
HOOKS = ["The What If Hook", "The Listicle / Number Hook", "The Curiosity / Shock Hook", "The Problem-Agitate Hook",
         "The Bold Statement / Controversial Hook", "The Question Hook", 'The "Before You..." Hook',
         "The Story / Personal Hook", 'The "Secret / Nobody Tells You" Hook', "The Fast-Result / Time Hook"]
# Story-format rotation for the Roblox-style rule-based world stories (TEAMDEAM_CONTENT_FRAMEWORK.md), same idea, own counter.
FORMATS = ["In This Town...", "In This World...", "The Town Where...", "Everyone Has... Except Me...",
           "Strange Rules and Consequences", "Mystery and Suspense Stories", "Emotional Character Stories",
           "Unusual Powers and Abilities", "Family and School Situations", "Interactive Choice-Based Stories"]


def load():
    return json.loads(STATE.read_text(encoding="utf-8")) if STATE.exists() else {"history": []}


def assign(episode_id):
    s = load()
    for h in s["history"]:
        if h["id"] == episode_id:
            return h
    n = (s["history"][-1]["hook"] % 10 + 1) if s["history"] else 1
    last_f = next((x["format"] for x in reversed(s["history"]) if "format" in x), 0)
    f = last_f % 10 + 1
    h = {"id": episode_id, "hook": n, "name": HOOKS[n - 1], "format": f, "format_name": FORMATS[f - 1]}
    s["history"].append(h)
    STATE.parent.mkdir(exist_ok=True)
    STATE.write_text(json.dumps(s, indent=1, ensure_ascii=False), encoding="utf-8")
    return h


def previous(episode_id):
    """Hook of the episode right before `episode_id` in the history (None if first)."""
    ids = [h["id"] for h in load()["history"]]
    i = ids.index(episode_id)
    return load()["history"][i - 1] if i else None


if __name__ == "__main__":
    a = sys.argv[1:]
    if len(a) == 2 and a[0] == "assign":
        print(json.dumps(assign(a[1]), ensure_ascii=False))
    elif a and a[0] == "show":
        s = load()
        last = s["history"][-1]["hook"] if s["history"] else 0
        out = {"history": s["history"], "next_hook": last % 10 + 1, "next_name": HOOKS[last % 10]}
        lf = next((x["format"] for x in reversed(s["history"]) if "format" in x), 0)
        out.update(next_format=lf % 10 + 1, next_format_name=FORMATS[lf % 10])
        if len(a) == 2:
            out["this_episode"] = next((h for h in s["history"] if h["id"] == a[1]), None)
            out["previous_episode"] = previous(a[1]) if out["this_episode"] else None
        print(json.dumps(out, indent=1, ensure_ascii=False))
    else:
        sys.exit(__doc__)
