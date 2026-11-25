"""OpenArt credit guard (mandatory before every paid generation). No network calls: Claude reads the balance and
per-shot cost from the OpenArt MCP, then asks this module whether it may spend.

  python -m pipeline.budget <video_id> <estimated_credits> <balance>
  exit 0 = auto-spend allowed; 2 = needs the owner's approval in chat; 3 = not enough credits (Telegram alert sent)
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CFG = ROOT / "config" / "openart.json"


def decide(estimate, balance, cfg=None):
    cfg = cfg if cfg is not None else json.loads(CFG.read_text(encoding="utf-8"))
    cap = cfg.get("OPENART_MAX_CREDITS_PER_VIDEO")
    if estimate > balance:
        return "insufficient", f"estimate {estimate} > balance {balance}"
    if not cfg.get("OPENART_AUTO_SPEND") or cap is None:
        return "ask", f"auto-spend off or no cap set: ask the owner to approve {estimate} credits"
    if estimate > cap:
        return "ask", f"estimate {estimate} > per-video cap {cap}: ask the owner"
    return "ok", f"estimate {estimate} <= cap {cap} and balance {balance}"


def main(vid, estimate, balance):
    verdict, why = decide(float(estimate), float(balance))
    print(verdict, "-", why)
    if verdict == "insufficient":
        from pipeline import approve
        e = approve.env()
        approve.Bot(e["TELEGRAM_BOT_TOKEN"]).call("sendMessage", chat_id=e["TELEGRAM_CHAT_ID"],
            text=f"⚠️ OpenArt credits kulang para sa {vid}: {why}. Production stopped. Walang binili.")
    sys.exit({"ok": 0, "ask": 2, "insufficient": 3}[verdict])


if __name__ == "__main__":
    main(*sys.argv[1:4])
