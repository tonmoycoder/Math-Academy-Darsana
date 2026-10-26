# Release record — Math Academy v10.3.0 corrected build

**Release date:** 2026-10-27 · **Audience:** owner, release editor, future agents.  
**Authority:** `docs/START-HERE.md` is the master project brain.  
**Status:** corrected source/build/QA pass; archive uploaded and verified to Dropbox `/Math Academy/`.

[ASSUMPTION] This corrected archive is the first Dropbox artifact published under the v10.3.0 release label; no previous v10.3.0 archive existed at the start of this correction round.

[DECISION NEEDED] Owner confirmation is still required for actual enrolled-seat counts, fee/schedule values, and permission to publish the school affiliation. The corrected capacity is 15, and all three current legacy counts were safely reconciled to 15; the site therefore displays the batches as full with zero seats left until actual enrolment data is confirmed.

---

## 1 · Scope delivered

1. Maximum capacity is exactly **15 students per batch** in Neon, seed/configuration, schema, pull/build validation, API validation, page copy, FAQ/JSON-LD, OG card, tests, and active documentation.
2. Academy establishment year is **2022** in Neon, seed/configuration, generated metadata, visible portrait seal, OG image, AI-readable facts, tests, and active documentation. Historical 2020 claims are superseded.
3. The Neon migration added a Postgres `filled` constraint of 0–15 and reconciled the previous 17/18/16 batch fills to 15/15/15. The fresh snapshot reports **0 seats left** across three batches; no impossible `17/15` total is published.
4. The library contains exactly one five-page test PDF, accurately titled **English Dialogue Format**. The hosted button downloads `/assets/english-dialogue-format.pdf` directly; the offline single-file HTML embeds the PDF so the download works without a companion asset.
5. Blog scope remains exactly ten full Markdown-backed articles, four homepage cards, and the working **«আরও ব্লগ দেখুন»** link to `/blog/`.

## 2 · Build and QA results

- `npm run db:migrate`: **14/14 statements passed**; Postgres constraint and capacity/year settings verified.
- `npm run content:pull`: passed; capacity 15, founding year 2022, three batches, fills 15/15/15, 0 seats left.
- `npm run build`: passed; single-file offline HTML **888 KB**; hosted `dist/index.html` **308 KB**.
- API contract/data-shape tests: **29 passed, 0 failed**.
- Browser QA: passed at 320, 360, 390, 820, 1280 and 1440 px; no overflow, browser-console/page errors, or unnamed icon buttons. All ten blog routes passed.
- Library QA: hosted same-origin direct download and offline data-embedded download both returned valid five-page PDF bytes with filename `English-Dialogue-Format.pdf`.
- Static audit: capacity/year/snapshot/HTML/JSON-LD/OG/LLM output agree; visible FAQ matches FAQPage schema; ten blog routes, four homepage cards, one blog CTA, and 12 sitemap URLs verified.
- Lighthouse 12 mobile homepage runs: Performance **95 / 97 / 96** (median **96**); Accessibility/Best Practices/SEO **100** in all runs. Desktop homepage and mobile blog hub scored **100** in all four categories.
- The user’s standing mobile Performance target of 100 remains unmet. Do not shorten the intro or redesign the site to chase it.

## 3 · Production boundary and external checks

- On 2026-10-27, the canonical Vercel hostname returned HTTP 404 `DEPLOYMENT_NOT_FOUND` for `/`, `/blog/`, `/api/content?health=1`, and an unknown route.
- No production deployment was attempted; this workspace has no linked/authorized Vercel project. The archive is not represented as a live deployment.
- Real iOS/Android audio/device checks, Search Console ownership/indexing, and owner confirmation of mutable business facts remain external follow-ups.

## 4 · Package and Dropbox handoff

- Package target: `package/math-academy-v10.3.0.zip`.
- Dropbox destination: `/Math Academy/math-academy-v10.3.0.zip`.
- Exclude secrets, `.env.local`, `.neon` project-link files, dependency/cache folders, screenshots, uploads, temporary QA files, and prior package archives.
- Dropbox upload is verified at `/Math Academy/math-academy-v10.3.0.zip`. The workspace master status records the final uploaded file's exact size, revision, and content hash; those self-referential values are intentionally not embedded in the archive.
