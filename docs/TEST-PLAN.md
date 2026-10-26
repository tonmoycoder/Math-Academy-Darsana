# Test plan and current results — v10.3.0 corrected release

**Audience:** the owner, release editor, or coding agent shipping this site.  
**Last run:** 2026-10-27 · **Master:** `docs/START-HERE.md`.  
**Current state:** corrected build/QA pass; archive uploaded and verified in Dropbox; Vercel production remains unavailable.

[ASSUMPTION] Chromium/Playwright checks are repeatable local evidence, but they do not replace a real Safari/iOS test or verification against the public Vercel deployment.

[DECISION NEEDED] The owner must link/authorize the correct Vercel project before a production deployment can be verified. Current active enrolment/seat availability also needs owner confirmation because legacy counts exceeded the newly approved cap and were reconciled to 15.

---

## 1 · Commands

```bash
node --check _src/site.js
node --check lib/db.js
node --check scripts/pull-content.mjs
node --check db/seed.mjs
python3 -m py_compile _src/build.py tests/browser_qa.py
npm run build                  # fresh Neon pull validates cap/year/fills, then builds offline HTML + dist/
npm run test:api               # API and data-shape guards
python3 tests/browser_qa.py    # browser QA, all ten article routes, hosted/offline PDF download
```

Lighthouse must use the production-like local server so gzip, cache headers, assets, and same-origin `/api/content` are represented:

```bash
MA_FAKE_DB=1 NODE_ENV=test node scripts/preview-server.mjs 8157
npx --yes lighthouse@12 http://127.0.0.1:8157/ \
  --form-factor=mobile --throttling-method=simulate \
  --only-categories=performance,accessibility,best-practices,seo \
  --chrome-flags="--headless --no-sandbox" --output=json --output-path=/tmp/lh.json
```

## 2 · Release acceptance checks

| Area | Required evidence | Latest result |
|---|---|---|
| Build/snapshot | fresh Neon pull; capacity 15; founded year 2022; 3 complete active batches; each `filled` 0–15; numeric programme counts | **Pass** — capacity 15, year 2022, fills 15/15/15, 0 seats left; offline HTML 888 KB, `dist/index.html` 308 KB |
| Database invariant | Postgres `filled` check constraint 0–15; old values above 15 reconciled; capacity/year settings updated | **Pass** — migration 14/14; Neon confirms cap 15, year 2022, three fills of 15 |
| Snapshot guard | wrong cap/year, missing/empty batches, invalid counts or fill above 15 abort without replacing `live.json` | **Pass** in pull/build/API guard review and tests |
| Blog inventory | ten numbered Markdown articles, ten unique slugs, ten full routes and one hub | **Pass** |
| Homepage blog | exactly four curated cards; **«আরও ব্লগ দেখুন»** resolves to `/blog/` | **Pass** |
| Article quality | each route has H1, full body, three FAQ pairs, canonical URL and sound control | **Pass** on all ten routes |
| Library | exactly one test PDF, accurately titled **English Dialogue Format**; hosted same-origin direct download; offline HTML embeds it | **Pass** — both downloads returned valid PDF bytes; filename `English-Dialogue-Format.pdf`; five pages |
| Sitemap/SEO | 12 URLs, canonical host, parseable JSON-LD, visible FAQ/FAQPage parity, no unresolved output tokens | **Pass** — five FAQ pairs match; foundingDate 2022; capacity 15 |
| Data/output audit | `site.json`, Neon snapshot, UI, FAQ, schema, OG card, `llms.txt` and docs agree on cap/year | **Pass** — OG card reads max 15 and EST. 2022; no stale 20-cap or 2020-year text in current outputs |
| CTA/form | WhatsApp `8801641045469`; asks for current information; opens WhatsApp and resets; no site-side student-data submission | **Pass** |
| 404 | unknown local route returns themed page with HTTP 404 | **Pass** |
| Security/content | no secret in release files; one Vercel Function; no auth; no free-trial/HSC claim; no booking/seat-reservation promise | **Pass** in source/build review |

## 3 · Browser flows

`tests/browser_qa.py` covers viewport widths **320, 360, 390, 820, 1280, 1440 px**. Latest run: no overflow, console/page errors, or unnamed icon buttons.

1. Home title and live `/api/content` refresh; the deliberately shifted fake fixture changes total remaining seats to ৩; three batch options remain.
2. Sound toggle: `aria-pressed` false → true → false; no sound-permission UI.
3. Sticky/mobile drawer opens and closes on Escape.
4. Library shows exactly one accurately titled PDF. Hosted button directly downloads a same-origin PDF; offline `file://` HTML downloads the embedded PDF. Both have the expected filename and `%PDF-` signature.
5. Results lookup returns explicitly sample-labelled data.
6. Triangle geometry tool: tab selection, keyboard slider, and ৯০°/৪৫° preset work.
7. WhatsApp CTA/form uses the correct phone and information-only message; popup handoff works, fields reset, and no server-side submission occurs.
8. Blog hub audio toggle works; all ten article routes return HTTP 200 with H1, full body, three FAQs, canonical, sound control, and no 390px overflow.
9. Unknown URL returns the themed HTTP 404.
10. Normal intro hides after **5.05 s**; the authored intro was not shortened.

## 4 · API and dynamic-data checks

Latest `npm run test:api`: **29 passed, 0 failed**. Coverage includes public GET/cache/health behavior, three batches, capacity exactly 15, founding year 2022, seat calculations, overflow-safe shaping, rejection of capacity 20/14, rejection of founding year 2020 and fill writes above 15, protected writes, programme validation, no public bookings/PII, method handling, and OPTIONS.

Snapshot/release rule: do not write/update the snapshot or publish if active rows are absent/empty, capacity is not 15, founding year is not 2022, any filled count exceeds 15, or either monthly programme count is absent/non-numeric. A failed pull leaves the previous snapshot unchanged and blocks the release build.

## 5 · Lighthouse results — Lighthouse 12, 2026-10-27

Measured against `scripts/preview-server.mjs` with simulated mobile throttling. Three homepage runs are reported rather than cherry-picking a best score.

| Page/profile | Performance | Accessibility | Best Practices | SEO | FCP | LCP | TBT | CLS |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Home · mobile run 1 | 95 | 100 | 100 | 100 | 1.4 s | 2.4 s | 160 ms | 0.001 |
| Home · mobile run 2 | 97 | 100 | 100 | 100 | 1.3 s | 2.4 s | 100 ms | 0.001 |
| Home · mobile run 3 | 96 | 100 | 100 | 100 | 1.3 s | 2.4 s | 160 ms | 0.001 |
| Home · desktop | 100 | 100 | 100 | 100 | — | — | — | — |
| `/blog/` · mobile | 100 | 100 | 100 | 100 | — | — | — | — |

The standing **mobile homepage Performance 100** target is not met (three-run median **96**). Accessibility, Best Practices, and SEO scored 100 in all runs; desktop homepage and mobile blog hub scored 100 in every recorded category. Do not claim mobile 100, shorten the full intro, or redesign the approved visual system to chase a single score.

## 6 · Production verification boundary

On 2026-10-27, direct requests to `https://mathacademydarsana.vercel.app/`, `/blog/`, `/api/content?health=1`, and an unknown path all returned HTTP **404** with Vercel header `X-Vercel-Error: DEPLOYMENT_NOT_FOUND`. This does not prove a production deployment is present; no production deploy was attempted from this workspace.

After the owner links/authorizes the correct project, repeat §2 against the live domain, check `DATABASE_URL` and `ADMIN_TOKEN` exist in Vercel without exposing their values, and confirm the real themed 404, security/cache headers, dynamic API state, and all routes.

## 7 · Outstanding device/owner checks

- Real iOS Safari/Android test of sound, drawer, and WhatsApp handoff.
- Owner confirmation of school-affiliation permission, fee/schedule values, and actual enrolled-seat counts; the current safe display is 15/15/15 (no seats left) until real values are confirmed.
- Search Console ownership, sitemap submission, and indexing request.
- Production Vercel deployment and health (blocked as described in §6).
