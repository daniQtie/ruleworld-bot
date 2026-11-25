# OpenArt cost guide

Every OpenArt generation consumes the owner's credits, and Fish Audio (Adam) uses its own credits too.

## Config: `config/openart.json`
```json
{"OPENART_AUTO_SPEND": false, "OPENART_MAX_CREDITS_PER_VIDEO": null}
```
- `null` means **UNSET**. Nothing paid is generated without the owner approving the quoted cost in chat.
- The owner may later set a cap and `OPENART_AUTO_SPEND: true`. After that, a video is generated automatically only if its full estimate fits within the cap.

## Before every paid generation (enforced by `.venv/Scripts/python -m pipeline.budget <id> <estimate> <balance>`)
1. Read the current balance from OpenArt.
2. Name the model.
3. Read its current cost per image or clip.
4. Estimate the total: reference images, every shot, and one retry allowance if asked.
5. Present it as: model · cost per item · items · total · balance after.
6. Check the exit code:
   - `0`: within the approved cap, go ahead.
   - `2`: ask the owner.
   - `3`: not enough credits. Stop production; a Telegram alert is sent.

## Never
- Buy credits, subscribe or upgrade a plan.
- Silently switch to a more expensive model.
- Regenerate (revisions, QA fixes) without quoting the extra cost first.

## Prices (live quotes, 2026-11-20; Free plan, balance 40 credits)
| Item | Config | Credits | Per second |
|---|---|---|---|
| Reference image, `gpt-image-2-5-flare` / `kling-3-omni` | text2image default | 10 | — |
| `pixverseV6` image→video | 5 s, 540p (default) | 50 | 10 |
| `pixverseV6` image→video | 15 s, 720p | 210 | 14 |
| `fal-h3-max-turbo` image→video | 15 s, 768P | 300 | 20 |
| `wan3-0` element→video | 30 s, 720p, 9:16, standard | 1,200 | 40 |
| `smart-shot` preview-shot-plan | default | 60 | — |
| `smart-shot` generate-shot-video | default (5 s, 480p) | 235 | ~47 |

## What one 2–3 min video costs (estimates, ~150 s)
| Approach | Credits per video |
|---|---|
| A. `pixverseV6` 540p, all motion (~30 × 5 s clips) + ~5 refs | **≈ 1,550** |
| B. `pixverseV6` 720p, all motion | **≈ 2,150** |
| C. `wan3-0` 720p element (best consistency) | **≈ 6,000** |
| D. Hybrid: ~25 still images (10 each) animated with pan/zoom in assembly + ~6 key `pixverseV6` 5 s motion clips | **≈ 550** |
| E. Stills only (~30 images, pan/zoom) | **≈ 300** |

**The current balance (40) cannot pay for even one 5 s video clip** (the cheapest is 50). It is enough for up to 4 reference images. We never buy credits: adding credits or upgrading is the owner's choice at https://openart.ai/pricing.

## Test log
- 2026-11-20: 1 character reference image (`gpt-image-2-5-flare`, 9:16, 2k, medium) = **10 credits**, approved by the owner. The download worked (1296×2304). **The Free plan adds a large "OpenArt" watermark in the centre of the image**, which is not usable for publishing. The balance after is 30.

- 2026-11-20: Roblox-style test scene (`gpt-image-2-5-flare`, 9:16, 2k, medium) = **10 credits**, approved by the owner. It is much closer to Roblox: classic blocky avatars and a studded baseplate. The trees still lean Minecraft-like, and the watermark is still there. The balance after is 20.

## Fish Audio (Adam)
This is billed per character of narration. A 2–3 min story (~500 words, ~2,800 characters) is a small amount per video. Check the Fish Audio balance occasionally.
