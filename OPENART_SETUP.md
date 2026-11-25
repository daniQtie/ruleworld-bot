# OpenArt setup

The project connects to the official OpenArt MCP server at `https://mcp.openart.ai/mcp`. It is declared in `.mcp.json` in this folder, so Claude Code picks it up when a session opens here.

## Sign in (owner, one time)
1. Open Claude Code in this folder. If asked, **approve the project MCP server "openart"**.
2. The server needs sign-in: OAuth in the browser with your OpenArt account.
   - **Claude Code in a terminal:** run `/mcp`, select `openart`, then Authenticate.
   - **Claude desktop app:** use the app's connector or MCP sign-in prompt for `openart`.
3. Never give Claude your OpenArt password. No API key is needed or stored.

## Optional: the official OpenArt skills
OpenArt publishes skills (e.g. `ugc`, `tvc`, `hook-variants`) at https://github.com/OpenArt-AI/skills. In a terminal Claude Code session:
```
/plugin marketplace add OpenArt-AI/skills
/plugin install openart@openart
```
The plugin needs a paid Claude plan. Without it, the MCP alone is enough for generation. Our own agents (`.claude/agents/video-generator.md`) do the story planning.

## Verify
After sign-in, ask Claude to "list the OpenArt MCP tools and models". The results are written into [OPENART_MODEL_GUIDE.md](OPENART_MODEL_GUIDE.md) and [OPENART_COST_GUIDE.md](OPENART_COST_GUIDE.md). Discovery spends no credits.
