# Math Academy — project entry point

**Purpose:** a Bengali-first Math Academy site for Darshana, Chuadanga, with a Vercel-ready landing page and a ten-article Markdown-backed blog.

**Authority:** `docs/START-HERE.md` is the one master project brain. This README is only a short index; if wording conflicts, follow the master brain and record an unresolved issue in `ai/known-issues.md`.

**Current round:** corrected v10.3.0 build and QA pass, 2026-10-27; the archive is uploaded and verified in Dropbox. The Vercel hostname was rechecked and returned `DEPLOYMENT_NOT_FOUND`, so this is not a claim of live production.

[ASSUMPTION] The site remains Bengali-first and mobile-first unless the owner changes scope.

[DECISION NEEDED] Confirm public approval for the school affiliation and confirm real fee/schedule/seat values before describing the seeded values as owner-verified facts.

---

## 1 · Fixed facts and scope

- Academy: ম্যাথ একাডেমি · দর্শনা, চুয়াডাঙ্গা.
- Teacher: প্রান্ত রায় · দর্শনা আইডিয়াল স্কুল · ১০+ বছর. Academy founded: **2022** (owner-corrected).
- Canonical domain: `https://mathacademydarsana.vercel.app`.
- Phone/WhatsApp: `+8801641045469` · Facebook: `pranto.rai.37` · Map id: `UyNxwUBw3sjnmGE29`.
- Offline batches for classes 6–10 and SSC; no HSC and no free-trial claim.
- Batch capacity: **15 students per batch**. Live seat, fee, and schedule values come from Neon/configuration; do not hard-code changing values in page copy.
- Backend: Neon Postgres and exactly one Vercel Function, `api/content.js`; all other Neon services stay off. No visitor accounts, authentication, or payments.
- Library: one temporary test PDF, accurately titled **English Dialogue Format**; direct-download button (same-origin on the hosted build, embedded in the offline HTML).
- Blog: exactly ten complete articles, four homepage cards, and **«আরও ব্লগ দেখুন»** → `/blog/`.

## 2 · Build and test

```bash
# Build the single self-contained offline file and the Vercel publish output
python3 _src/build.py --publish

# Pull the latest Neon content snapshot, then publish (requires DATABASE_URL)
npm run build

# API contract tests
node tests/api.test.mjs
```

`dist/` and `math-academy.html` are generated; edit source files only. Never put `.env.local`, database credentials, API keys, or other secrets in a release archive.

## 3 · Routes and key source files

| Path | Purpose |
|---|---|
| `/` | Main one-page site, four article cards, blog CTA |
| `/blog/` | Ten-article hub, four featured cards and full list |
| `/blog/<slug>/` | Complete article page rendered from the matching Markdown draft |
| `/guide/**` | Compatibility redirects only; not the current article source |
| `/404.html` | Theme-matched not-found page |

| Source | Purpose |
|---|---|
| `docs/START-HERE.md` | Master facts, constraints, workflows and acceptance criteria |
| `_src/build.py` | HTML generator, Markdown parser, route/SEO output |
| `_src/02-top.html`, `_src/03-sections.html`, `_src/04-bottom.html` | Landing-page markup fragments |
| `_src/site.css`, `_src/site.js` | Landing-page styling and behaviour |
| `_src/blog.css` | Blog hub/article presentation |
| `docs/blog-drafts/01-*.md` … `10-*.md` | Ten full article sources; each has front matter, a marked publish body, three FAQs and sources |
| `_src/content/site.json` | Seed/structure data; Neon snapshot is stored separately in generated `live.json` |
| `api/content.js`, `lib/`, `db/` | Single Vercel Function, shared database logic and Neon schema/seed |
| `docs/TEST-PLAN.md`, `docs/SEO.md` | Verification and technical SEO contract |
| `ai/current-state.md`, `ai/known-issues.md`, `ai/decisions.md` | Operational status, active risks and decision history |

## 4 · Release

1. Read `docs/START-HERE.md` before editing.
2. Run the build, API tests, route/responsive/audio checks, and the release checklist in `docs/TEST-PLAN.md`.
3. Confirm ten unique article routes, four homepage cards, the `/blog/` CTA, dynamic data, and no unresolved tokens.
4. Current package target: `package/math-academy-v10.3.0.zip`. Create it only after corrected build and QA; include source and `dist/`, but exclude credentials, `node_modules/`, caches, screenshots, uploads, and prior package folders.
5. Dropbox destination: `/Math Academy/math-academy-v10.3.0.zip`; recorded path and verified metadata in `ai/current-state.md`.
6. Production Vercel is a separate owner-controlled step. The requested canonical host returned HTTP 404 `DEPLOYMENT_NOT_FOUND` during this round; see `docs/DEPLOY-VERCEL.md`.
