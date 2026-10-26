# MCP-SETUP.md — wiring the SEO tooling (operator, not part of the site)

> These tools run **on your machine, with your Google account**. They never enter the build, the bundle, or the repo.
> Status in this workspace: **documented, not connected** (needs your Google OAuth in a browser, which cannot happen inside the sandbox).

---

## 1. Which one to use

| Need | Use | Why |
|---|---|---|
| Search Console data + AI-citation tracking + PageSpeed + technical checks | **seo-monster** (`uvx seo-monster`) | 70 tools, one config, read-first defaults |
| Only Search Console, lighter install | **mcp-gsc** (`uvx mcp-search-console`) | 20 tools, minimal |
| AI-visibility score + `llms.txt` generation | **geo-optimizer-skill** (`uvx --from geo-optimizer-skill geo`) | deterministic 0–100 audit, no credentials |
| Visual ranking dashboard | open-seo (self-hosted) | optional, extra moving part |

Do **not** run seo-monster and mcp-gsc at the same time — they duplicate GSC access.

---

## 2. Prerequisites

- Python 3.11+ and [`uv`](https://docs.astral.sh/uv/) (`which uvx`)
- A Google Cloud project with the **Search Console API** enabled
- Access to the deployed site's property in Search Console

## 3. Google credentials (once)

1. console.cloud.google.com → new/select project → enable **Search Console API**.
2. APIs & Services → Credentials → **Create credentials → OAuth client ID → Desktop app**.
3. Download the JSON → save as `~/Documents/gsc-client-secret.json` (never inside this repo).
4. First run opens a browser once; the refresh token is cached locally.

## 4. Claude Desktop / Cursor config

`claude_desktop_config.json` (or `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "seomonster": {
      "command": "uvx",
      "args": ["seo-monster"],
      "env": { "GOOGLE_APPLICATION_CREDENTIALS": "/Users/you/Documents/gsc-client-secret.json" }
    }
  }
}
```

Then: `uvx --from seo-monster seo-monster auth` → restart the client → ask **`system_status`**.

Alternative (`mcp-gsc`):
```json
{ "mcpServers": { "gsc": { "command": "uvx", "args": ["mcp-search-console"] } } }
```

## 5. First five prompts that actually help this project

1. `system_status` — what is connected?
2. "List my properties and confirm `math-academy-darsana.vercel.app` is verified."
3. "`gsc_query_opportunities` for the last 28 days, Bengali and English queries, top 20."
4. "`gsc_inspect_url` for the homepage — is it indexed? Any rich-result problems?"
5. "Compare the last 28 days to the previous 28 and summarise movers."

## 6. GEO audit (no credentials)

```bash
uvx --from geo-optimizer-skill geo audit --url https://math-academy-darsana.vercel.app
uvx --from geo-optimizer-skill geo fix  --url https://math-academy-darsana.vercel.app   # preview only
```
We already ship what it usually asks for (`llms.txt`, AI-bot allow rules, 6-node JSON-LD). Re-run weekly and keep the score ≥ 85.

## 7. Least-privilege rules

- Read-only scopes for GSC; no Cloudflare token unless you actually move DNS there.
- Never paste a client-secret JSON into a chat, a commit, or `dist/`.
- The site itself makes **zero** calls to these tools — if a future change requires a runtime API call, that is an architecture decision (see `ARCHITECTURE.md` §14).
