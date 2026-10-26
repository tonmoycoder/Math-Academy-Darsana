# CDN / MCP reference stack — what we actually used, and what is wired where

Status: **partially adopted (see table).** None of these tools run at build time and none
ships to the browser. They are *operator tools*: you point them at the deployed site.

| # | Tool | What it gives us | How it applies to Math Academy | Status |
|---|---|---|---|---|
| 1 | [avansaber/seo-monster](https://github.com/avansaber/seo-monster) | MCP server: GSC + GA4 + PageSpeed + Cloudflare + AI-citation tracking, 70 tools, plain-language workflows | Week-2 onward: `gsc_query_opportunities` (8–20 position queries), `gsc_inspect_url` after every deploy, AI share-of-voice for "দর্শনার ম্যাথ টিউটর" | Configured in `docs/MCP-SETUP.md` (needs your Google OAuth) |
| 2 | [AminForou/mcp-gsc](https://github.com/AminForou/mcp-gsc) | Lighter GSC MCP (20 tools: search analytics, URL inspection, sitemaps) | Use instead of #1 if you only want Search Console. Do not run both. | Documented, not installed |
| 3 | [every-app/open-seo](https://github.com/every-app/open-seo) | Self-hosted SEO dashboard / audit UI | Optional: run locally to see ranking trends visually; not needed for launch | Evaluated — not adopted (extra moving part) |
| 4 | [Auriti-Labs/geo-optimizer-skill](https://github.com/Auriti-Labs/geo-optimizer-skill) | `geo audit` 0–100 AI-visibility score, `llms.txt`/schema generator, 27 AI crawlers | Weekly `uvx --from geo-optimizer-skill geo audit --url https://<site>`; we already ship `llms.txt` + AI-bot `robots.txt` | **Adopted** (our `llms.txt` follows its rules) |
| 5 | [AgricIDaniel/claude-seo](https://github.com/AgricIDaniel/claude-seo) | Prompt-library for SEO copy/technical checks | Reference only | Not adopted — our `docs/SEO-PLAYBOOK.md` covers the same ground, domain-specific |

## Why not "install at build time"
All five are either MCP clients or CLIs that need *your* credentials and *your* deployed URL.
The static site must stay dependency-free (offline demo + free Vercel hosting), so the tools
live outside the build. `python3 _src/build.py` never calls them.

## What we shipped instead of "the tool does it"
- `llms.txt` (AI answer engines), AI-bot allow-list in `robots.txt`
- `sitemap.xml`, canonical, hreflang, OG/Twitter
- JSON-LD @graph: EducationalOrganization+LocalBusiness, Person, Course, WebSite, FAQPage, BreadcrumbList
- Bengali keyword targeting on one page (see `docs/SEO-PLAYBOOK.md`)
