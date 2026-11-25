# Existing System Integration Notes

## Preserve working automation

The package is intended to improve the user's existing system, not replace it blindly.

Preserve existing working modules unless an audit proves they are unused or broken:
- Claude Code orchestration.
- Owner rules and feedback.
- Researcher and hook rotation (update only with approval).
- Scriptwriter and script QA.
- Current video-generation/rendering implementation (inspect and reuse the existing Three.js-based GitHub repository if it is the active renderer).
- Current voice/TTS provider and voice identity.
- Current caption/audio workflow if still used.
- Video QA.
- Telegram preview and Approve / Revise / Reject workflow.
- YouTube OAuth, upload and scheduling.

Do not assume any previously tested provider is still active. The owner may use a code-based Three.js renderer or another provider. Audit the actual configured integration and reuse the current working implementation unless the owner directs otherwise.

## Video-generation implementation verification

If the owner already has a working Three.js-based GitHub repository, treat it as the current renderer after verifying the actual project configuration. Do not replace it with a hosted video provider. Inspect its scripts, rendering path, output format, voice integration, and dependencies before changing anything.

## Provider verification

Before generation, inspect:
- Official provider documentation.
- Available MCP tools or API methods.
- Supported reference-image workflow.
- Maximum clip duration.
- Aspect ratio and resolution.
- Native audio/dialogue support.
- Lip-sync support.
- Character consistency features.
- Current credit cost and remaining quota.
- Commercial-use rights for the current plan/model.

Do not invent endpoints, tools or free allowances.

## Cost protection

- Never subscribe or purchase credits.
- Never silently switch to a paid model.
- Estimate costs before generation.
- Use a low-cost or free test if available.
- Ask for owner approval when cost is nonzero or unclear.
- Reuse approved character reference assets.
- Regenerate only defective scenes when the provider allows it.

## Telegram and YouTube

- Keep Approve / Revise / Reject behavior.
- Verify callback-to-video ID mapping.
- Do not upload without approval.
- Preserve current OAuth and scheduler configuration.
- Verify scheduled time zone and publication status.

## Current output defaults

- Content: original rule-based world animated stories.
- Format: YouTube Shorts, vertical 9:16.
- Target duration: 2:00–2:40; aim around 2:20 when the story supports it.
- Language: English for worldwide audience.
- Primary competitor reference: TeamDeam.
- Priority: story quality, hook clarity, voice consistency, emotional performance and character continuity over upload quantity.
