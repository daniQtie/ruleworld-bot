# OpenArt model guide

Discovered from the live OpenArt MCP on **2026-11-20**. The account is on the **Free** plan with a balance of **40 credits**. Prices change, so re-check with `openart_model_cost` before every generation.

## MCP tools (21)
- **Account:** `openart_account_get` (plan + credits, free) and `openart_plan_show` (free).
- **Discovery:** `openart_model_list`, `openart_model_form_get` and `openart_model_cost` (all free).
- **Generate (these spend credits):**
  - `openart_generate_image` / `openart_generate_image_batch`
  - `openart_generate_video` / `openart_generate_video_batch`
  - `openart_run_video_tool`: dub-video, replace-background, relight-video, depth-map, video-swap, resize-video. Price it first with `openart_tool_form_get`, which is free.
- **Results:** `openart_creation_get` / `openart_creation_list` / `openart_creation_show` (to download outputs).
- **Uploads:** `openart_upload_sign` / `openart_upload_import` / `openart_upload_list` / `openart_upload_pick` / `openart_upload_metadata_get` (reference images).
- **Projects:** `openart_project_create` / `openart_project_list`.

## Video models: key facts (from the model descriptions)
| Model | Modes | Clip length | 9:16 | Native audio | Consistency / multi-shot |
|---|---|---|---|---|---|
| `pixverseV6` | text/image→video, start+end frame | 1–15 s | via the start image | optional `generateAudio` | strong 3D-anime motion; no element refs |
| `fal-h3-max-turbo` | text/image→video | 5–15 s, 480P/768P/1080P | via the start image | — | cheapest proof-of-concept |
| `wan3-0` | text/image/element→video | 2–30 s single pass | yes (`aspectRatio`) | audio track; a voice via audio ref | up to 20 refs (image/video/audio) |
| `kling-3-omni` | text/image/element→video | — | — | — | multi-shot + element refs, "batch production" |
| `kling-v3` | text/image→video | 3–15 s | — | synchronized audio | native multi-shot |
| `kling-4-flash` / `kling-4-omni` | text/image/element→video | 3–20 s / 3–30 s | — | — | built for consistent characters |
| `byte-plus-seedance-2*` / `-2-5*` | text/image/element→video | up to 30 s (2.5) | — | BGM, SFX, dialogue + lip-sync | high-consistency refs for short dramas |
| `veo3-1` | text/image/element→video | 4/6/8 s | — | native audio | start/end frame |
| `gemini-omni-*` | text/image/element→video | 3–15 s | — | native dialogue/SFX/music | up to 10 image refs |
| `minimax-h3`, `grok-imagine-1-5`, `flux-3-video`, `wan2-7`, `fal-h3-max` | various | 5–20 s | — | some native audio | see `openart_model_list` |
| `smart-shot` | `preview-shot-plan` (60 credits, image sheet), `generate-shot-video` (235 credits default) | 4–30 s | yes | — | plans the shots and sheet from a scene description + up to 3 character refs |

"—" means the summary did not say. Check with `openart_model_form_get` before relying on it.

## All video modes at their default config (cheapest first)
| Default credits | Model id | Name | Mode |
|---|---|---|---|
| 50 | `pixverseV6` | PixVerse V6 | image2video |
| 50 | `pixverseV6` | PixVerse V6 | text2video |
| 75 | `fal-h3-max-turbo` | MiniMax H3 Max Turbo | image2video |
| 75 | `fal-h3-max-turbo` | MiniMax H3 Max Turbo | text2video |
| 100 | `wan3-0` | Wan 3.0 | element2video |
| 100 | `wan3-0` | Wan 3.0 | image2video |
| 100 | `wan3-0` | Wan 3.0 | text2video |
| 120 | `veo3-1` | Veo 3.1 | image2video |
| 120 | `veo3-1` | Veo 3.1 | text2video |
| 125 | `fal-h3-max` | MiniMax H3 Max | element2video |
| 125 | `fal-h3-max` | MiniMax H3 Max | image2video |
| 125 | `fal-h3-max` | MiniMax H3 Max | text2video |
| 125 | `wan2-7` | Wan 2.7 | element2video |
| 125 | `wan2-7` | Wan 2.7 | image2video |
| 125 | `wan2-7` | Wan 2.7 | text2video |
| 175 | `kling-3-omni` | Kling 3 Omni | element2video |
| 175 | `kling-3-omni` | Kling 3 Omni | image2video |
| 175 | `kling-3-omni` | Kling 3 Omni | text2video |
| 175 | `kling-v3` | Kling 3.0 | image2video |
| 175 | `kling-v3` | Kling 3.0 | text2video |
| 185 | `gemini-omni-1-2-flash` | Gemini Omni 1.2 Flash | element2video |
| 185 | `gemini-omni-1-2-flash` | Gemini Omni 1.2 Flash | image2video |
| 185 | `gemini-omni-1-2-flash` | Gemini Omni 1.2 Flash | text2video |
| 200 | `byte-plus-seedance-2-mini` | Seedance 2.0 Mini | element2video |
| 200 | `byte-plus-seedance-2-mini` | Seedance 2.0 Mini | image2video |
| 200 | `byte-plus-seedance-2-mini` | Seedance 2.0 Mini | text2video |
| 235 | `smart-shot` | Smart Shot | generate-shot-video |
| 250 | `gemini-omni-1-1-flash` | Gemini Omni 1.1 Flash | element2video |
| 250 | `gemini-omni-1-1-flash` | Gemini Omni 1.1 Flash | image2video |
| 250 | `gemini-omni-1-1-flash` | Gemini Omni 1.1 Flash | text2video |
| 250 | `gemini-omni-flash` | Gemini Omni Flash | element2video |
| 250 | `gemini-omni-flash` | Gemini Omni Flash | image2video |
| 250 | `gemini-omni-flash` | Gemini Omni Flash | text2video |
| 250 | `kling-4-flash` | Kling 4.0 Flash | element2video |
| 250 | `kling-4-flash` | Kling 4.0 Flash | image2video |
| 250 | `kling-4-flash` | Kling 4.0 Flash | text2video |
| 300 | `byte-plus-seedance-2-5` | Seedance 2.5 | element2video |
| 300 | `byte-plus-seedance-2-5` | Seedance 2.5 | image2video |
| 300 | `byte-plus-seedance-2-5` | Seedance 2.5 | text2video |
| 300 | `byte-plus-seedance-2-5-draft` | Seedance 2.5 Draft | element2video |
| 300 | `byte-plus-seedance-2-5-draft` | Seedance 2.5 Draft | image2video |
| 300 | `byte-plus-seedance-2-5-draft` | Seedance 2.5 Draft | text2video |
| 320 | `veo3-1` | Veo 3.1 | element2video |
| 350 | `byte-plus-seedance-2-fast` | Seedance 2.0 Fast | element2video |
| 350 | `byte-plus-seedance-2-fast` | Seedance 2.0 Fast | image2video |
| 350 | `byte-plus-seedance-2-fast` | Seedance 2.0 Fast | text2video |
| 400 | `byte-plus-seedance-2` | Seedance 2.0 | element2video |
| 400 | `byte-plus-seedance-2` | Seedance 2.0 | image2video |
| 400 | `byte-plus-seedance-2` | Seedance 2.0 | text2video |
| 400 | `grok-imagine-1-5` | Grok Imagine 1.5 | text2video |
| 405 | `grok-imagine-1-5` | Grok Imagine 1.5 | image2video |
| 425 | `byte-plus-seedance-2-5-flash` | Seedance 2.5 Flash | element2video |
| 425 | `byte-plus-seedance-2-5-flash` | Seedance 2.5 Flash | image2video |
| 425 | `byte-plus-seedance-2-5-flash` | Seedance 2.5 Flash | text2video |
| 450 | `minimax-h3` | MiniMax H3 | element2video |
| 450 | `minimax-h3` | MiniMax H3 | image2video |
| 450 | `minimax-h3` | MiniMax H3 | text2video |
| 600 | `flux-3-video` | FLUX 3 Video | image2video |
| 600 | `flux-3-video` | FLUX 3 Video | text2video |
| 600 | `kling-4-omni` | Kling 4.0 | element2video |
| 600 | `kling-4-omni` | Kling 4.0 | image2video |
| 600 | `kling-4-omni` | Kling 4.0 | text2video |

## Image models (references)
The cheapest are `gpt-image-2-5-flare`, `gpt-image-2-5-sunburst` and `kling-3-omni` at **10 credits** (text2image; kling also does image2image at 10). `nano-banana-2-lite`, `seedream-4-5` and `wan2-7-image` cost 15.

## Pipeline choices
- **Narration:** Adam via Fish Audio (owner decision). Model audio is off unless it adds SFX at no extra cost.
- **Video model:** not chosen yet. It depends on the owner's credit decision (see [OPENART_COST_GUIDE.md](OPENART_COST_GUIDE.md)). Candidates:
  - `pixverseV6` image→video: cheapest per second, good 3D-anime motion.
  - `wan3-0` element→video: best consistency, but expensive.
- **Smart Shot** is not free to preview (60 credits).
