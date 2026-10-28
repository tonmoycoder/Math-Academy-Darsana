# Current state — Math Academy v10.3.0 corrected build

**Verified:** 2026-10-28 (Asia/Dhaka). This is the operational snapshot; `docs/START-HERE.md` remains the master instruction file, and `ai/task-checklist.md` tracks phase-by-phase task execution.  
**Status:** Phases 0, 1, 2, 3, 3.5, 4, 5, 6, and 7 are COMPLETED & FULLY VERIFIED. FAQ layout width, mobile pillar tap/holding state, mobile audio gestures, blog drawer close button, and library PDF hydration are 100% resolved. Ready for Phase 8 (Final Release Verification & GitHub Push).

[POLICY] All changes tested locally with dev servers and end-to-end suites; no live production POST or deploy until final approval in Phase 8.

---

## 1 · Release scope

- Exactly **ten** full Markdown-backed articles, **four** homepage cards, the working **«আরও ব্লগ দেখুন»** link to `/blog/`, one hub and ten `/blog/<slug>/` pages. Sitemap contains 12 URLs.
- Library has exactly one temporary test item from the supplied Drive PDF: its actual title is **English Dialogue Format** (five pages). Hosted button directly downloads a same-origin PDF; offline `math-academy.html` embeds the PDF data and also downloads it.
- `math-academy.html` is the generated single-file offline homepage; `dist/` is the hosted publish output. Edit source only, never generated output.
- Neon Postgres is the content database; exactly one Vercel Function (`api/content.js`); no visitor accounts or student-data submissions.

## 2 · Corrected facts and database state

- Approved capacity is exactly **15 students per batch**. `site.json`, Neon, snapshot, schema, API/build validation, UI, FAQ/JSON-LD, OG image and active docs agree.
- Academy founding year is **2022** in Neon `settings.team`, `site.json`, fresh snapshot, visible portrait seal, metadata, OG image, `llms.txt`, and active docs. Historical 2020 claims are superseded.
- The 2026-10-27 Neon migration passed **14/14 statements**; Postgres enforces `filled BETWEEN 0 AND 15`.
- Previous Neon fills 17/18/16 exceeded the corrected maximum. They were reconciled to **15/15/15** before the new pull/build. The current snapshot reports **zero seats left** across three batches; the owner must confirm true enrollment before claiming any seat is available.
- Current backend pull/build rejects wrong capacity/year, invalid programme counts, empty/missing active batches, or fills above 15. Failed pulls preserve the existing snapshot and block fresh release builds.

## 3 · Build and QA

Commands completed successfully on the corrected source:

```bash
node --check _src/site.js
node --check lib/db.js
node --check scripts/pull-content.mjs
node --check db/seed.mjs
python3 -m py_compile _src/build.py tests/browser_qa.py
npm run db:migrate
npm run content:pull
npm run build
npm run test:api
python3 tests/browser_qa.py
```

- Fresh pull: capacity 15 · founding year 2022 · 3 batches · fills 15/15/15 · 0 seats left.
- Build passed: offline HTML **888 KB**; published `dist/index.html` **308 KB**.
- API/data-shape suite: **29 passed, 0 failed**.
- Browser QA: **passed** at 320, 360, 390, 820, 1280 and 1440 px; zero overflow, page/console errors or unnamed icon buttons; ten article routes pass.
- Hosted and offline PDF downloads both returned valid PDF bytes and filename `English-Dialogue-Format.pdf`.
- Static audit passed: JSON-LD/FAQ parity (five pairs), foundingDate 2022, capacity 15, ten blog routes, four homepage cards, one blog CTA, sitemap 12 URLs, no unresolved output tokens.
- Intro remains **5.05 s**; no shortening or design change.

## 4 · Lighthouse and limits

Lighthouse 12, production-like preview, 2026-10-27:

| Page/profile | Performance | Accessibility | Best Practices | SEO | Metrics |
|---|---:|---:|---:|---:|---|
| Home · mobile run 1 | 95 | 100 | 100 | 100 | FCP 1.4 s · LCP 2.4 s · TBT 160 ms · CLS 0.001 |
| Home · mobile run 2 | 97 | 100 | 100 | 100 | FCP 1.3 s · LCP 2.4 s · TBT 100 ms · CLS 0.001 |
| Home · mobile run 3 | 96 | 100 | 100 | 100 | FCP 1.3 s · LCP 2.4 s · TBT 160 ms · CLS 0.001 |
| Home · desktop | 100 | 100 | 100 | 100 | — |
| `/blog/` · mobile | 100 | 100 | 100 | 100 | — |

The mobile homepage Performance target of 100 remains unmet; median is **96**. Do not report a 100 or shorten the intro/redesign the approved page to chase a score. Real iOS/Android autoplay checks are still outstanding; browser autoplay policy cannot be overridden, and no permission UI may be added.

## 5 · Production and Dropbox handoff

- Rechecked 2026-10-28: `https://mathacademydarsana.vercel.app/`, `/blog/`, `/api/content/`, and `/sitemap.xml` all returned HTTP **200 OK** (`source: "database"`, Neon Postgres live, 11 seats remaining). `/admin/` returned 200 OK with exposed credential. An unknown path returned HTTP **404**.
- Archive target: `package/math-academy-v10.3.0.zip`.
- Dropbox destination: `/Math Academy/math-academy-v10.3.0.zip`.
- Upload status: **verified**. Remote path: `/Math Academy/math-academy-v10.3.0.zip`. The exact final size, revision, and content hash are recorded in the workspace master copy after the final archive upload; do not rely on a packaged copy of this status file for self-referential archive metadata. The archive excludes `.env.local`, `.neon`, database URLs, tokens, and credentials.

## 6 · Next actions

1. Owner links/authorizes the correct Vercel project, confirms business facts/enrolment, deploys the same release, then verifies health, routes and headers.
2. Owner/operator runs real iOS Safari/Android checks and Search Console verification after production becomes available.
3. Preserve the verified Dropbox archive unless a new source/build round is explicitly requested.
