# AUDIT v10 — full-site review, 2026-10-26

**Audience:** the owner (plain-language summary is in the chat reply) and the next agent.
**Correction overlay (2026-10-27):** the owner superseded the old cap-20/2020 data: current approved capacity is 15, academy founding year is 2022, and the library now has one direct-download “English Dialogue Format” test PDF. All earlier score/data/package statements below are historical snapshots; use `docs/START-HERE.md`, `docs/TEST-PLAN.md`, and `ai/current-state.md` for the corrected release.
**Scope:** SEO · security · file structure · frontend · backend · performance · accessibility.
**Method:** built `dist/`, served it locally, then static analysis + headless Chromium
(320 / 390 / 820 / 1280 / 1440 px) + Lighthouse 12. Every number below was measured, not estimated.

[ASSUMPTION] This is a historical v10 audit; its scores and findings are superseded by the current `docs/TEST-PLAN.md` and `ai/current-state.md` where they differ.

[DECISION NEEDED] Re-run any historical check against the current build before relying on it for a release.

---

## 1 · Scoreboard

| Area | Result | Note |
|---|---|---|
| Lighthouse `/` (mobile, throttled) | **90–92 · 100 · 100 · 100** (LCP 2.6–2.8 s, TBT 220–290 ms, CLS 0) | performance fluctuates ±2 between runs |
| Lighthouse `/blog/` | **100 · 100 · 100 · 100** (LCP 1.8 s) | static article page |
| Horizontal overflow | **0 px** at all five widths | |
| Console / page errors | **0** | after the CSP fix in §2.1 |
| Dead in-page anchors | **0** of 60 fragments | every `#id` resolves |
| Duplicate `id`s | **0** of 192 ids | |
| Heading structure | **1 × h1, 12 × h2, 26 × h3** | no skipped level |
| Images without `alt` | **0** of 6 | 2 are `loading="lazy"` |
| `target="_blank"` without `rel=noopener` | **0** of 10 | |
| Third-party requests | **0** | no CDN, no font host, no analytics |
| JSON-LD | 1 block, parses clean | Organization/LocalBusiness, Person, Course, WebSite, FAQPage, BreadcrumbList |

---

## 2 · Findings and what was done

### 2.1 · CSP blocked the sound probe → console error (fixed)
Lighthouse best-practices fell to **93** because the v10 `probeMedia()` played a `data:` WAV while
the policy had no `media-src`. Two ways out: widen the CSP or drop the probe. **The probe was
removed** — the same policy blocks an `<audio>` element and Web Audio together, so it added nothing.
CSP is now exactly as strict as v9 and best-practices is back to **100**.

### 2.2 · Brand link failed WCAG 2.5.3 (fixed)
`aria-label="ম্যাথ একাডেমি — হোম"` did not contain the visible text `MATH ACADEMY`, so the label and
the visible name disagreed. Now: `aria-label="MATH ACADEMY — ম্যাথ একাডেমি, দর্শনা — হোম"`.

### 2.3 · Hard-coded business data (fixed)
Nine numbers were typed into HTML in **31 places** (seats, capacity, fees, month, contact links).
All now resolve from `_src/content/site.json` at build time; the batch table itself is generated
(`docs/CONTENT.md`). Grep proof: `grep -c "{{" dist/index.html` → `0`, and the old literals
`৯/১২` / `১২ জন` no longer exist anywhere in the output.

### 2.4 · Navbar carried a link that was not needed (fixed)
`কেন আমরা` removed from the desktop nav **and** the drawer. The section itself stays (it is the
page's opening argument and a landing anchor for ads), but it no longer competes for nav space.
Nothing dangles: the skip-link still points at `#why`, and all 60 in-page fragments resolve.
Drawer numbering keeps the on-page section numbers (02–09) so a visitor never sees two different
numbers for the same block.

### 2.5 · Autoplay was not remembered (fixed, within browser limits)
v9 started sound on every load but kept no record. v10 adds a durable grant
(`localStorage` + IndexedDB + `navigator.storage.persist()`), an MEI-building timer at 7.6 s, and
`data-snd` on `<html>`. Measured: relaxed policy → 29 oscillators with **zero** interactions on
first **and** second visit; strict policy → 26 oscillators on a single mouse move.
Honest limit: no website can start audible sound on a browser that hard-blocks it before any
input, and a stored flag cannot create that permission. `AUDIO-INTERACTION.md` §v10 says so.

### 2.6 · Vercel caching was correct but incomplete (fixed)
HTML had no edge TTL, so the first request in each region paid full origin latency. Added
`public, max-age=0, s-maxage=600, stale-while-revalidate=86400` for `/` and `/(blog|guide)/**`.
Hashed assets keep `max-age=31536000, immutable`. `docs/DEPLOY-VERCEL.md` §6.5 documents it,
including how to read `x-vercel-cache`.

### 2.7 · Documentation had grown into 20 overlapping files (fixed)
Now 15 files + `docs/archive/` (superseded originals, not for reading). One entry point
(`START-HERE.md`), one file per question, every file carrying audience / read-next / last-updated,
all sections numbered for a small-context model. See `PROJECT-MAP.md` §2 for the current map.

---

## 3 · Checked and found clean

* **Links:** only four external hosts — `wa.me`, `maps.app.goo.gl`, two `facebook.com` profiles.
  No `http://` link anywhere. No `href="#"` dead link.
* **Forms:** two (`#lookupForm`, `#bookForm`), `novalidate` + JS validation, no `action`, so nothing
  leaves the page except an intentional `wa.me` hand-off.
* **Network:** zero `fetch()` / XHR in the shipped JS. The page works offline from `file://`.
* **Secrets:** no key, token or credential in the repo or the HTML (the future backend keeps them
  in env vars — `BACKEND-PLAN.md` §5).
* **Headers:** HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy`, COOP and CSP are all present in `vercel.json`, `deploy/netlify.toml`
  and `deploy/cloudflare-_headers`.
* **i18n:** `lang="bn-BD"`, Bengali numerals everywhere they belong; the 404 keeps Latin `4 0 4`
  on purpose (Bengali ৪/৮ are indistinguishable at display size).
* **404:** genuinely returns a 404 status (verified on `/nope/`, `/blog/nope/`, `/x/y/z/`) and
  matches the theme.
* **Offline build:** `math-academy.html` opens with no network, no `{{` left, blog links absolute.

---

## 4 · Known issues that remain (deliberately)

| # | Issue | Why it stays | Owner action |
|---|---|---|---|
| K-22 | Sound cannot start before the first input on Safari/Firefox or a fresh Chrome profile | browser policy; Chromium states it cannot be overridden | accept, or install-the-PWA route (`AUDIO-INTERACTION.md` §v10.5) |
| K-24 | Historical Neon fills 17/18/16 exceeded the new 15 cap; migration reconciled each to 15 | actual enrollment/availability still needs owner confirmation; no `17/15` totals may ship | confirm true active enrollment before claiming seats available |
| K-25 | Fees ৳১,৫০০ / ৳১,৮০০ / ৳২,২০০ are placeholders | owner has not confirmed | confirm → `site.json` |
| K-26 | Reviews / results are illustrative | permission not given | send 2–3 real quotes with permission |
| K-27 | No admin UI — editing means editing JSON and rebuilding | the site is static by design | optional: `BACKEND-PLAN.md` |
| K-28 | Historical v10.1 concern: no PWA manifest/service worker | closed in v10.2; PWA is now implemented | no action unless the owner changes scope |

---

## 5 · Re-test commands

```bash
python3 _src/build.py --publish
python3 -m http.server 8096 -d dist &
# Lighthouse (needs a Chrome binary):
CHROME_PATH=~/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell \
  npx lighthouse@12 http://127.0.0.1:8096/ --only-categories=performance,accessibility,best-practices,seo
# then run the Playwright matrix in docs/TEST-PLAN.md §3
```

---

## 6 · v10.1 delta (backend + PWA + capacity sweep)

| Item | Before | Now | Why |
|---|---|---|---|
| Capacity text | `১২ জন` in 6 blog posts, 404, llms-full | **২০ everywhere at that historical 2026-10-26 snapshot; superseded by D-62 (15)** | one number, one source |
| Server-side | none | `api/content.js` + `lib/db.js` + `db/schema.sql` + seed | editable seats without a rebuild |
| Client | none | `LIVE` block → `data-live` on `<html>` | numbers refresh after paint, never block |
| PWA | none | manifest + service worker + 4 icons | the only durable autoplay grant |
| Verification | browser only | + 16 API assertions, offline reload test | proof, not hope |
| Lighthouse `/` | 90–92·100·100·100 | 90·100·100·100 | unchanged |
| Free-tier cost | ৳0 | ৳0 | Neon free + Vercel Hobby |

### 6.1 · Fixed in this delta

* `probeMedia` CSP console error (from §2.1) stayed fixed; the new function does not add any
  console noise — verified with `data-live="synced"` and 0 errors.
* Blog posts, `404.html` and `llms-full.txt` no longer carry the old 12-seat copy.
* `vercel.json` gained `outputDirectory`, `functions`, `sw.js`/manifest/icon headers and an
  `/api/*` header block.

### 6.2 · Still open

| # | Issue | Owner action |
|---|---|---|
| K-29 | Neon sign-in + `neon deploy` not run (needs the owner's account) | run `npx neon@latest login` on a machine with a browser, then `neon deploy` |
| K-30 | `DATABASE_URL` / `ADMIN_TOKEN` not set in Vercel | add both in Project → Settings → Environment Variables |
| K-31 | Optional services (auth, ai-gateway, object-storage, functions, realtime) deliberately off | confirm they stay off |
| K-24…K-28 | legacy seats, fees, reviews, no admin UI, PWA decision | PWA is implemented; seat/founding facts corrected in D-62/D-63 |

---

## 7 · v10.2 round — audit (2026-10-26)

### 7.1 · What changed and how it was verified

| Item | Before | Now | Proof |
|---|---|---|---|
| Neon database | planned | **live**, branch `production` (historical 2026-10-26 cap-20 state; schema/data corrected 2026-10-27) | `migrate 12/12` · old seed cap 20 · `GET` 200 · `health db:"up"` · `POST` 200 → revert 200 → bad token 401 |
| `neon deploy` | failed (no `@neon/config`) | `No changes — branch production already matches the policy` | installed `@neon/config`, 3 vars pulled to `.env.local` |
| Seat numbers in HTML | baked from `site.json` | pulled from the DB by `scripts/pull-content.mjs` → `live.json` | historical `[content:pull] capacity 20 · 3 batches · seatsLeft 9`; current 15 · 3 batches · seatsLeft 0 |
| Batch size wording | ২০ in text, ১২ on the OG card | ২০ everywhere at that historical point; superseded by the 2026-10-27 15-cap update | `grep "১২ জন" dist/index.html` → 0; card re-rendered |
| Canonical host | `mathacademydarsan…` (missing final *a*) | `mathacademydarsana…` | 40 files rewritten, `grep` → 0, canonical/JSON-LD/sitemap/llms all read the new host |
| Blog | 6 posts, all on the homepage | ১১ posts; **3** on `/` + «আরও ব্লগ পড়ুন» | `grep -c 'class="postcard"' dist/index.html` → 3 |
| Blog hub | flat list | starter path (ভিত → পদ্ধতি → সূত্র) + all ১১ | `/blog/` screenshot |
| Post numerals | Latin minutes/date | Bengali minutes + `২৬ অক্টোবর ২০২৬` inside `<time>` | `grep '<time'` |

### 7.2 · New files

`scripts/pull-content.mjs` · `_src/blog/posts_v11.py` · `_src/tools/og-card.html` ·
`_src/tools/make_og.py` · `docs/BLOG-CONTENT-PLAN.md` · `_src/content/live.json` (generated).

### 7.2b · Quality gates re-run after the changes

| Gate | Result |
|---|---|
| Build | `built 753 KB` · `published dist/index.html 350 KB` |
| Tokens left in output | `grep -rIl '{{'` on html/txt/xml/js/css → **0** |
| Code points | 320 / 390 / 820 / 1280 / 1440 px × 7 routes → **0 horizontal scroll, 0 console errors** |
| Lighthouse `/` (gzip, mobile emulation) | **96 · 100 · 100 · 100** (LCP 2.6 s, TBT 20 ms, CLS 0.0002) |
| Lighthouse `/blog/` | **100 · 100 · 100 · 100** |
| Offline `math-academy.html` | opens from `file://` with **0 console errors**, no `/api/content` call |
| Live API through `tests/dev-server.mjs` | `health db:"up"` → page flips to `data-live="synced"`, capacity ২০, seats ৯ (historical; superseded by 15/0 on 2026-10-27) |
| `npm run test:api` | 16 passed, 0 failed |

Three real bugs were found and fixed by these gates:

1. The rotated `.band` leaked 5–22 px of sideways scroll at every width because
   `body{overflow-x:hidden}` makes the body a scroll container → now `overflow-x:clip`.
2. The offline file threw `LIVE is not defined`: the scheduler lines sat *outside* the
   `LIVE_START…LIVE_END` block that the offline build strips → moved inside.
3. The blog hub had two a11y findings (`.card__tag` contrast, brand `aria-label` mismatch) →
   `--red-deep` + a visually-hidden “— হোমপেজ”, hub is back to 100.

### 7.3 · Still open

| # | Issue | Owner action |
|---|---|---|
| K-30 | `DATABASE_URL` + `ADMIN_TOKEN` not set in Vercel | add both, redeploy, check `/api/content?health=1` |
| K-31 | Pasted DB password + Neon API key are burned | reset the role password, revoke the API key |
| K-32 | OG card is a manual render step | run `_src/tools/make_og.py` after any capacity/fee change |
| K-33 | Search Console not submitted | verify property, submit `sitemap.xml`, request indexing |

---

## 8 · v10.2.1 — preview repaired (2026-10-26)

**What was broken when the session resumed:** no process listening on 8124, `/tmp` preview
script gone, `dist/` gone (excluded from snapshots), `node_modules` gone, Python Playwright and
its browser gone. Rebuilt all of it and made the preview reproducible instead of ad-hoc.

| Fix | Detail |
|---|---|
| `npm run preview` | new `scripts/preview-server.mjs`: gzip (358 KB → **96 KB**), correct MIME, immutable asset caching, `404.html`, `/api/content` on the same origin, `0.0.0.0`, Host/Origin-agnostic |
| gzip bug | first version called `createGzip().pipe(res).end(buf)` — `pipe()` returns `res`, so the write bypassed the compressor; fixed to `gz.pipe(res); gz.end(buf)` |
| hero stat | `১২ প্রতি ব্যাচে সর্বোচ্চ শিক্ষার্থী` → `≤ ২০ প্রতি ব্যাচে সর্বোচ্চ আসন`, driven by `{{CAP_NUM}}` |
| seat pips | 12 pips (9 filled) hard-coded in `site.js` → 20 pips / 16 filled from `#seatDots` data attributes, following the **featured** batch (ssc=16) not “row zero” (vitti=17), and re-synced by the live API |
| count labels | `মোট ৯টি সিট বাকি` (all batches) vs `বাকি ৪টি` + pips (featured batch) |
| verification | 320 / 390 / 820 / 1440 px × 3 routes: no horizontal scroll, no console errors; `data-live="synced"`; `data-snd="granted"`; 16/16 API tests |
