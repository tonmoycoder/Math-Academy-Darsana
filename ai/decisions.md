# ai/decisions.md — chronological technical decision record

> Evidence-based: every entry names where it lives in the project. "Why" is marked **verified** when the code/docs state it, **inferred** when it is my reading of the evidence.

## 0 · How to read this log

Entries are historical decisions, not all current behavior. Follow the latest entry plus `docs/START-HERE.md`; do not repeat a superseded decision merely because it appears earlier in the timeline.

[ASSUMPTION] The owner expects this log to remain chronological and each current release to append a dated note rather than silently rewriting history.

[DECISION NEEDED] If a new owner instruction changes an existing decision, record which entry is superseded and why.

---

### D-001 · Single self-contained HTML deliverable
- **Decision:** ship one `math-academy.html` with CSS, JS, fonts, images inlined; plus an optional `dist/` split build.
- **Why:** owner asked for a demo that opens offline, no CDN, no network (**verified**, user constraint). **Inferred:** simulates an emailed/downloaded demo.
- **Implementation:** `_src/build.py` (`TOKENS`, `swap()`, base64) → `math-academy.html`; `--publish` extracts assets.
- **Trade-off:** ~800 KB file; no per-asset caching in the single-file mode.
- **Evidence:** `build.py`, README "ডেলিভারেবল এক ফাইল".

### D-002 · Python-stdlib build instead of a bundler
- **Why:** zero install, deterministic, 0.2 s rebuild; owner is non-technical (**inferred** from the request for "very fast update path").
- **Implementation:** fragment concatenation + token substitution.
- **Trade-off:** no minification, no tree-shaking, no HMR.
- **Evidence:** `_src/build.py`, absence of `package.json`.

### D-003 · Vanilla JS + vendored GSAP (intro only)
- **Why:** GSAP gives a reliable timeline for the shard-slam preloader; everything else is CSS/rAF (**verified** by usage).
- **Implementation:** `_src/gsap.min.js` inlined; `site.js` uses GSAP only in `runPreloader`/`heroIntro`.
- **Trade-off:** 70 KB of vendored library for one screen.
- **Evidence:** `site.js` §PRELOADER.

### D-004 · No authentication, no accounts
- **Decision:** visitors cannot sign up or log in; there is no admin UI.
- **Why:** **verified** — owner stated in v5 that users do not need accounts.
- **Impact:** no sessions, no DB, no roles; `docs/BACKEND-PLAN.md`/`docs/ARCHITECTURE.md Part B` are intentionally thin.
- **Evidence:** this repository has no auth code; owner message.

### D-005 · WhatsApp deep link as the only conversion channel
- **Why:** the audience lives in WhatsApp; no payment/booking backend requested (**verified** by the copy "এখনই সিট বুক করুন" → `wa.me`).
- **Implementation:** `WA_NUMBER` in `site.js`, `data-wa` rewriting, 3 hardcoded `href`s.
- **Trade-off:** no server-side lead record; conversion depends on the teacher answering.
- **Evidence:** `site.js` §whatsapp links; `04-bottom.html` booking.

### D-006 · Palette: paper/ink/vermillion/blueprint-brass
- **Why:** the owner asked for a kinetic neo-brutalist blueprint identity (**verified**).
- **Implementation:** `:root` tokens in `site.css`.
- **Later change:** vermillion moved `#E4362D → #D42C24` to pass WCAG AA (**verified**, Lighthouse a11y 100 after the change).
- **Trade-off:** slightly less saturated brand red.

### D-007 · Noto Sans Bengali for all Bengali text; Archivo + JetBrains Mono for Latin
- **Why:** **verified** — Hind Siliguri clipped Bangla digits at 9–11 px (owner complaint about "১").
- **Implementation:** three families, six subsetted faces, `--bn/--sans/--mono` stacks.
- **Trade-off:** ~91 KB for the Bengali face.

### D-008 · Metric-matched fallback + font gate (CLS = 0.001)
- **Why:** **inferred** — font swap caused a 0.28 CLS spike; the owner demanded Lighthouse 100 without design changes.
- **Implementation:** `@font-face 'BN Metric'` with `size-adjust: 83.2%`, `ascent-override: 110.2%`, `descent-override: 49%`, plus `html.fonts-loading` hiding the body until `document.fonts.ready`.
- **Trade-off:** the page can be blank for up to 2.5 s on a very slow font fetch (safety net) — acceptable because the preloader follows anyway.

### D-009 · Preloader composed behind the hero, ~1.3 s
- **Why:** the intro was the LCP blocker. Moving the hero timeline to run under the opaque shutter made the first contentful paint the real headline (**verified** by Lighthouse LCP element change).
- **Trade-off:** the intro is shorter and simpler than the original 2.4 s choreography; `#replayBtn` still exists.

### D-010 · Ink reveal with 4 CSS-mask lobes (not SVG displacement)
- **Why:** **verified** — `feTurbulence` + `feDisplacementMap` washed out the photo and exposed a filter rectangle.
- **Implementation:** four radial-gradient `mask-image` layers at `--mx/--sx/--tx/--qx`, driven by rAF-updated CSS vars; hard-ish stops (`#000 58% → transparent 62%` originally, reduced to ~24 % lobes for a contained "ink" feel).
- **Trade-off:** Chromium composites multiple masks additively; stops must stay hard.

### D-011 · Two portrait treatments share one engine
- **Decision:** `[data-ink]` on both `.tphoto` (hero) and `.tport` (teacher section).
- **Why:** **inferred** — consistency; the teacher section looked flat next to the hero.
- **Trade-off:** one more rAF listener per figure (stops when idle).

### D-012 · Mobile 2×2 grids for chips/tabs
- **Why:** **verified** — the 4 method tabs and 4 tool tabs scrolled off-screen at 390 px, so they looked unclickable (owner complaint).
- **Implementation:** `@media (max-width:600px)` flex-wrap + `flex:1 1 calc(50% - 5px)`.
- **Trade-off:** taller section on phones.

### D-013 · SEO as structured data + llms.txt, not plugins
- **Why:** **verified** by the v4 SEO requirement and the v5 local-SEO brief.
- **Implementation:** JSON-LD `@graph` in `build.py`, `robots.txt` (search + AI bots), `sitemap.xml`, `llms.txt`.
- **Trade-off:** facts are duplicated in schema + HTML; a change must touch both (documented in `docs/START-HERE.md`).

### D-014 · Canonical host = Vercel subdomain for now
- **Why:** **verified** — the owner plans free Vercel hosting.
- **Implementation:** `S` constant in `build.py`; same string in `sitemap.xml`/`robots.txt`.
- **Trade-off:** must be changed in three places when a custom domain arrives.

### D-015 · ~~HSC added, "ফাইনাল রিভিশন" batch replaced~~ **SUPERSEDED by D-018 (2026-10-25)**
- **Why:** **verified** — the v5 brief names SSC **and** HSC as the audience.
- **Implementation:** `#batches` row 4 → "HSC ২০২৭ ব্যাচ" (class 11–12, Fri–Sat 4:00–6:30, ৳1,500, 8/12), plus HSC mentions in hero label, footer, FAQ, JSON-LD.
- **Trade-off:** the crash-course positioning is gone; a fifth row can return if the owner wants it.

### D-016 · Real contact + affiliations wired in
- **Why:** **verified** — owner supplied the number, school, Facebook and map.
- **Implementation:** `WA_NUMBER='8801641045469'`, `tel:` links, footer social/map links, `sameAs`, `worksFor` (school + academy), `hasMap`.
- **Trade-off:** publishing the school affiliation is a reputational decision → flagged in `PRD.md` D-1 for approval.

### D-017 · Operator SEO tools kept out of the build
- **Why:** **inferred** — the MCP/CLI tools need personal Google credentials and a deployed URL; embedding them would add runtime dependencies to a static site.
- **Implementation:** documented in `docs/OPERATIONS.md Part C` + `docs/OPERATIONS.md Part B`; only `llms.txt` and the AI-bot allow-list were adopted as shipped artifacts.

### D-018 · HSC removed — scope is SSC + class 6–10 only · 2026-10-25
- **Why:** **verified** — owner, 2026-10-25: "akhane hsc eigula bad jabe. sudhu ssc ar class 6 - 10 porjonto porai."
- **Implementation:** batch row 4 deleted (table is now 3 rows); hero HUD, hero `__en` line, preloader HUD,
  FAQ answer, booking `<select>`, footer line, `<title>`, description, keywords, `og:*`, `twitter:*`,
  `knowsAbout`, `Course.name/description`, `CourseInstance` list (now SSC ২০২৭ + ক্লাস ৬–৭ + ক্লাস ৮–৯),
  FAQ node (HSC question → the guardian-report question that is actually visible), `llms.txt`,
  PRD / SEO-PLAYBOOK / _FACTS, README.
- **Verification:** `grep -c HSC dist/index.html` → **0**; `grep -c HSC _src/build.py` → **0**.
- **Do not** re-add HSC. If a future brief asks for it, it needs a new decision entry.

### D-019 · 404 page generated from the same theme · 2026-10-25
- **Why:** owner asked for a theme-consistent 404 with the same "add" (extra polish).
- **Implementation:** `_src/404-body.html` (markup + scoped CSS + 8-line year script). `build.py --publish`
  emits `dist/404.html` through the **same** font-extraction cache as `index.html`, so the 404 reuses
  `assets/f1–f4.woff2` instead of shipping a second copy. `noindex,follow` by meta **and** header.
- **Verified:** 390 and 1440 — overflow 0, zero console errors, fonts loaded, HTTP 404 status on host.

### D-020 · Technical-SEO + security layer · 2026-10-25
- **Sitemap:** single URL, `priority 1.0`, `changefreq weekly`, `lastmod`, `image:image` for the OG card.
- **robots.txt:** allow-all + absolute `Sitemap:` + AI-crawler allow-list (GEO).
- **Head:** canonical + `hreflang` (bn-BD, x-default) + a `meta` CSP that mirrors the header policy.
- **Headers:** `vercel.json` (primary) with HSTS 2y/includeSubDomains/preload, XFO SAMEORIGIN,
  nosniff, `strict-origin-when-cross-origin`, Permissions-Policy, COOP, CSP; Netlify + Cloudflare
  equivalents live in `deploy/`.
- **Deliberate deviation:** the generic brief says "allow Google Fonts"; this site self-hosts all
  fonts, so `fonts.googleapis.com` is **not** allowed. Strictly better security + LCP.
- **Single source of truth:** `SITE_HOST` in `_src/build.py` — canonical, hreflang, og:url, JSON-LD
  `@id`s, sitemap `<loc>` and robots `Sitemap:` all derive from it.
- **Docs:** `docs/SEO.md Part C`.

### D-021 · Developer credit (তানভীর ইসলাম তন্ময়) · 2026-10-25
- **Why:** verified — the owner names তানভীর ইসলাম তন্ময় (Tanver Islam Tonmoy) as designer/developer and gives
  `https://www.facebook.com/tanverislamtonmoyofficial`.
- **Implementation:** a dark byline band **directly above the footer** (`section.maker`) with name, English name,
  role line and a `rel="noopener me"` profile link; plus the same credit in the footer of every `/guide/` page and
  in `humans.txt` and `llms-full` chrome.
- **Do not** move it back into a collapsed block — the owner asked for it to be visible near the footer.

### D-022 · CREDITS & LICENCES block removed · 2026-10-25
- **Why:** verified — "CREDITS & LICENCES etar dorker nai".
- **Removed:** the `<details id="credits">` markup, its CSS (`.credits*`), the footer link, and its line in the
  dev-only spec comment. Font/GSAP licence obligations still apply — they are satisfied by shipping the license
  headers inside `gsap.min.js` and by the OFL files remaining in the project `assets-src/`.

### D-023 · Security/SSL badge in the footer · 2026-10-25
- **Why:** verified — owner asked for an SSL/security certification mark in the footer.
- **Implementation:** `.ssl` chip in `.footer__bottom` → "HTTPS · SSL সুরক্ষিত / TLS · HSTS · সিকিউর কানেকশন",
  linking to `/.well-known/security.txt`. Deliberately **no** third-party "SSL certified" seal image: those are
  misleading badges that load a remote script (and would need a CSP exception).

### D-024 · Social icons redrawn, brand-accurate but theme-locked · 2026-10-25
- **Why:** owner asked for small Facebook/WhatsApp/Maps icons that are recognisable **and** match the theme.
- **Implementation:** inline SVG `<symbol>`s (`i-fb`, `i-wa2`, `i-gmap`) in the site sprite; `.soc__a` chips are
  paper/ink with the 3 px hard shadow; the true brand colour appears **only on hover/focus** (WhatsApp #25D366,
  Facebook #1877F2, Maps #EA4335). No external logo files → nothing to load, nothing to license.

### D-025 · Synthesised UI audio · 2026-10-25
- **Why:** verified — owner asked for sound that fits the preloader, hover/click feedback, and a subtle
  mobile scroll cue.
- **Implementation:** a ~2.5 KB Web Audio engine in `site.js` (`SFX`), zero audio files, lazily created on the
  first gesture, muted automatically for `prefers-reduced-motion`, toggle + `localStorage` persistence.
- **Doc:** `docs/AUDIO-INTERACTION.md` (cues, levels, debounce rules, test evidence).

### D-026 · Blog/guide section, generated from one content file · 2026-10-25
- **Why:** SEO research (Michigan Tech / Semrush) — one page ranks for one intent; the homepage is transactional,
  so informational and commercial-investigation phrases need their own pages.
- **Implementation:** `_src/blog/posts.py` → `dist/guide/…` by `build.py`, sharing one cached `assets/fonts.css`.
  Sitemap, `llms-full.txt` and the hub are regenerated automatically, so they can never drift.
- **Content rules:** `docs/BLOG-PLAYBOOK.md`.

### D-027 · Domain is `mathacademydarsana.vercel.app` · 2026-10-25
- **Why:** verified — owner is staying on free Vercel hosting and gave the exact subdomain.
- **Implementation:** `SITE_HOST` in `_src/build.py` (one line). `OLD_HOSTS` keeps previously-written
  robots/sitemap text from drifting.
- **Note:** the older `math-academy-darsana` name must not appear in any output again.


## v9 decisions

| # | Decision | Why |
|---|---|---|
| D-30 | **No sound permission UI at all.** `startIntroSound()` tries immediately, listens for the first input anywhere, and retries while the intro runs. | Client: "কোন পারমিশন লাগবে না, অটোমেটিক চালু হবে". The browser rule itself cannot be bypassed, so the design removes every *human* step instead. |
| D-31 | **Nothing about sound is persisted.** `localStorage` key `ma-snd` is gone. | Client: a stored mute was silencing later visits — the site must be musical every time. |
| D-32 | **Intro re-plays on reload; the sessionStorage `ma-intro` flag is deleted.** | Client: "প্রত্যেকবার লোড দিলে প্লে হবে". |
| D-33 | **Liquid/ripple removed entirely** (engine, CSS, SVG filter, dead markup). | Client disliked it twice. Replaced by the maths veil, which is cheaper and on-brand. |
| D-34 | **`trailingSlash:true`, `cleanUrls:false` on Vercel.** | The export is folder/`index.html` with slash links; `trailingSlash:false` stripped the slash and 404'd `/blog/<slug>/` — the "broken link" the client saw. |
| D-35 | **404 numerals are Latin `4 0 4`** (aria-label stays Bengali). | At display size বাংলা ৪ and ৮ are indistinguishable — the page read as "808". |
| D-36 | **404 asset URLs are rewritten to root-absolute at build time.** | Served from `/blog/x/typo`, relative `assets/` paths resolved wrongly, the webfont never loaded and the page rendered in tofu boxes. |
| D-37 | **Historical/superseded:** the old seal used `EST. 2020`; D-63 records the owner-corrected year 2022. The circular logo badge remains removed. | Client: a second copy of the logo read as a duplicate photo. |

---

## v10 decisions (2026-10-26)

| # | Decision | Why |
|---|---|---|
| D-38 | **`_src/content/site.json` is the single source of every changeable number.** The build renders `{{TOKENS}}` and generates the batch `<tbody>`. | Client: data must be dynamic and editable without touching code. Build-time resolution keeps the page static, crawlable and CLS-free. |
| D-39 | **Historical/superseded by D-62:** batch size was ২০ (`capacity.per_batch`). Current approved cap is 15; DB, API, build and docs enforce it. | This records the earlier decision only; do not use it as current configuration. |
| D-40 | **`কেন আমরা` removed from the navbar and the drawer; the section stays.** | Client: the nav link is not needed. Keeping the section preserves the page's argument and the `#why` skip-link target; keeping the on-page section numbers means no renumbering of 01–07. |
| D-41 | **Sound grant persisted in localStorage **and** IndexedDB, plus `navigator.storage.persist()`.** | Client: after one visit, later visits must play instantly. A flag cannot create browser permission, so the grant is a *preference* record that lets every return path skip re-deciding, and it doubles as the MEI-building trigger (7.6 s). |
| D-42 | **The `probeMedia()` `<audio>` probe was removed instead of widening the CSP.** | It tripped `default-src 'self'`, costing a Lighthouse best-practices point, and it could never succeed where Web Audio had already been blocked. |
| D-43 | **Backend recommendation: Neon Postgres behind one `/api/content` function + Edge Config for hot settings; the baked HTML stays the fallback.** | Vercel Postgres/KV no longer exist; Supabase is heavier and pauses when idle; static JSON cannot be edited by a non-developer. Full reasoning in `docs/BACKEND-PLAN.md` §2. |
| D-44 | **HTML gets `s-maxage=600, stale-while-revalidate=86400`; hashed assets stay `immutable`.** | Vercel's documented caching model; keeps TTFB flat after deploys without ever blocking a visitor on the origin. |
| D-45 | **Docs merged from 20 files to 15 + `docs/archive/`.** | Client: read and reorganise every MD so a small-context model (Gemini 2.8 Flash / Antigravity) can follow them. One entry point: `docs/START-HERE.md`. |


## v10.1 decisions (2026-10-26)

| # | Decision | Why |
|---|---|---|
| D-46 | **One Vercel Function for the whole API**, a Web-standard `fetch` handler with shared code in `lib/` — not one file per endpoint. | Vercel's own guidance for framework-less projects; keeps a single function instance warm under Fluid compute. |
| D-47 | **Neon Postgres via `@neondatabase/serverless` (HTTP), no ORM, no pool, no migration tool.** | One table set, one read query, a schema file that is safe to re-run. An ORM would be more code than the app. |
| D-48 | **Live numbers are progressive enhancement only** (`data-live="synced|updated|offline"`). | The baked HTML must stay correct for crawlers, first paint, offline and any DB outage. |
| D-49 | **Only the `postgres` Neon service is enabled.** | auth/ai-gateway/object-storage/functions/realtime have no use here and would add surface area for nothing (`BACKEND-PLAN.md` §11.6). |
| D-50 | **PWA shipped** (manifest + `sw.js` + 4 icons, registered 2.6 s after load). | The client asked for a permanent autoplay grant and approved the PWA idea; an installed app is the only durable browser permission. Network-first navigations mean it can never serve a stale deploy. |
| D-51 | **`MA_STATIC_ONLY=1` build switch** strips the API call. | Netlify/Cloudflare/`file://` have no functions; without the switch they would log a 404 and lose a Lighthouse point. |

## v10.2 decisions (2026-10-26)

| # | Decision | Why |
|---|---|---|
| D-52 | **Historical database verification:** Neon branch `production` was previously migrated/read/write-checked at the old cap ২০. D-62 supersedes the old capacity; the 2026-10-27 migration added the 0–15 `filled` constraint and reconciled legacy fills. | Owner supplied the string and asked for the deploy to be done, not planned. |
| D-53 | **Partially superseded by D-66:** the pull/build overlay remains, but missing/unreachable Neon no longer silently falls back or deletes the snapshot; fresh release builds fail closed. Seed-only output requires an explicit local `MA_SKIP_PULL=1`. | “Data must be dynamic” cannot mean “edit a JSON by hand”. |
| D-54 | **Historical/superseded:** the former landing page showed three curated posts with «আরও ব্লগ পড়ুন». See D-57 for the current exact-ten/four-card contract. | Replaced by the owner's newest explicit correction. |
| D-55 | **The canonical host is `https://mathacademydarsana.vercel.app`** (final *a*). `SITE_HOST` is the only definition; `build.py` rewrites the legacy hosts. | Owner correction; all page canonicals and generated routes must use this domain. |
| D-56 | **Historical/superseded:** the old blog sources lived in `_src/blog/posts_v11.py` and `posts.py`. See D-57; current content is Markdown in `docs/blog-drafts/`. | Retained for decision history only; legacy modules are not loaded by the current build. |
| D-57 | **Current blog contract:** exactly ten complete Markdown articles in `docs/blog-drafts/`, ten unique `/blog/<slug>/` routes plus `/blog/`, exactly four homepage cards, and a working «আরও ব্লগ দেখুন» link to `/blog/`. The hub's featured row mirrors the same four slugs. Each draft has required metadata, one marked publish body, exactly three FAQ pairs, source notes, and AI handoff tags. Blog and article pages must match the landing page's visual/sound language; no permission UI. | Owner's latest explicit correction (2026-10-26). The new contract supersedes D-54/D-56 and all eleven-post/three-card plans. |
| D-57b | **Every post ships with three FAQs → `FAQPage` JSON-LD, and `llms.txt` is generated from `BLOG.POSTS`.** | GEO: the owner asked for AI-search visibility. Generated lists cannot forget a new post, which is exactly how the old six URLs drifted. |

## v10.2.1 decisions (2026-10-26, preview repair)

| # | Decision | Why |
|---|---|---|
| D-58 | **`scripts/preview-server.mjs` is the preview** (`npm run preview`, default port 8124). It serves `dist/` with gzip, real MIME types, the `vercel.json` cache policy, `dist/404.html`, and mounts `api/content.js` on the same origin. | `python3 -m http.server` has no gzip/MIME and cannot answer `/api/content`, so every preview load logged a 404 and the page always claimed `data-live="offline"`. A preview that lies about the API is worse than no preview. It binds `0.0.0.0` and ignores Host/Origin, so the sandbox proxy works. |
| D-59 | **The hero stats and seat pips are generated, not typed**: `data-count="{{CAP_NUM}}"`, `data-count="{{EXP_NUM}}"`, `data-count="{{MOCK_NUM}}"` and `#seatDots[data-batch][data-cap][data-filled]`. | The historical preview caught a mismatch between fixed-cap text and pip count; the 2026-10-27 release now validates and renders exactly 15. |
| D-60 | **`{{CAP}}` stays Bengali for prose; `{{*_NUM}}` are Latin** for anything JavaScript parses. | The counters run `parseFloat` on the attribute and convert to Bengali themselves — a Bengali token there renders `০`. |
| D-61 | **Two different counts are labelled differently**: `মোট ৯টি সিট বাকি` (all three batches) vs `বাকি ৪টি` + pips (featured batch). | The pill said ৯ while the strip below it said ৪; both are correct, but unlabelled they read as a bug. |

## v10.3.0 corrected data decisions (2026-10-27)

| # | Decision | Why |
|---|---|---|
| D-62 | **Current capacity is exactly 15 students per batch**, superseding D-39/D-52. Neon `settings.capacity.per_batch`, `site.json`, seed, pull/build guards, API writes, UI/FAQ/JSON-LD, OG asset, tests and active docs agree. Postgres constrains `filled` to 0–15; old over-cap values are reconciled before the new snapshot/build. | Owner's latest correction supersedes the earlier ২০-student maximum. |
| D-63 | **Academy founding year is 2022**, superseding historical 2020 claims in D-37 and older assets. Neon `settings.team.founded_year`, `site.json`, visible seal, structured data and AI-readable facts are aligned and validated. | Owner corrected the establishment year. |
| D-64 | **Library contains exactly one temporary test PDF**, labeled by its actual title “English Dialogue Format”; do not call it a formula sheet. The hosted link is a direct same-origin download; the offline single-file HTML embeds the PDF data. | Owner selected the supplied file's actual title after the content mismatch was surfaced. |
| D-65 | **Legacy filled counts 17/18/16 were capped to 15 in Neon and seed data**; the live snapshot now reports 15/15/15 and zero remaining seats. API/build/schema prevent future impossible values, and release notes flag owner confirmation of actual enrollment before public availability claims. | The previous counts exceeded the newly approved maximum and must not be published as `17/15` or similar. |
| D-66 | **Snapshot/release builds fail closed** when Neon data is unavailable, capacity is not 15, founding year is not 2022, programme counts are invalid, rows are missing, or a filled count exceeds 15. The previous snapshot remains unchanged on a failed pull; only an explicit local `MA_SKIP_PULL=1` may use seed/snapshot data. | Prevent a stale or incompatible fallback from masquerading as fresh live data. |

## v10.3.0 pre-correction run (2026-10-26, historical)

1. The blog scope was exactly ten Markdown sources/routes, four homepage cards, and the working `/blog/` CTA. Browser QA automated the triangle angle slider and ৯০°/৪৫° preset.
2. The earlier build/browser/API run passed 24 API checks and responsive widths 320–1440; it predates the final capacity, year, and library corrections below.
3. The earlier mobile Lighthouse Performance runs were 94/91/93 (median 93); this is historical and is superseded by the corrected release results in `docs/RELEASE-v10.3.0.md`.
4. Direct production verification of `https://mathacademydarsana.vercel.app/` returned Vercel HTTP 404 with `DEPLOYMENT_NOT_FOUND`. No deployment was attempted because no linked Vercel project/credentials were available.

## v10.3.0 corrected release record (2026-10-27)

1. Corrected Neon pull and production-like build passed with capacity **15**, three batches, and **0** seats remaining; owner must confirm the real enrolment counts before public availability claims.
2. API tests passed **29/29**; browser QA passed at widths 320–1440, including dynamic seat fixtures, the one accurately labeled direct-download PDF, offline embedded download, all ten article routes, and themed 404.
3. Lighthouse: mobile homepage Performance 95/97/96 (median 96), other mobile categories 100; desktop homepage and mobile blog hub 100 in all categories. Do not claim mobile Lighthouse 100 or shorten the authored intro.
4. The v10.3.0 archive is uploaded and verified at `/Math Academy/math-academy-v10.3.0.zip`; exact Dropbox size, revision, and content hash are in `ai/current-state.md`.
5. The configured Vercel host still returns `DEPLOYMENT_NOT_FOUND`; no production deployment is claimed.

[ASSUMPTION] The version label v10.3.0 denotes the completed package/source round; it does not imply that the Vercel hostname serves that release.

[DECISION NEEDED] The owner must link/authorize the Vercel project and confirm the public business facts that still rely on seeded values.
