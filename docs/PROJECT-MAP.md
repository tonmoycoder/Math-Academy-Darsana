# PROJECT MAP — what lives where

**Audience:** everyone, first · **Last updated:** 2026-10-27 (corrected v10.3.0 rebuild/QA in progress; production target previously returned `DEPLOYMENT_NOT_FOUND`)
**Read next:** `START-HERE.md`, `CONTENT.md`, `COMPONENTS.md`

[ASSUMPTION] The described tree is the active project source; generated `dist/` files are not edited by hand.

[DECISION NEEDED] The owner still needs to authorize/link the Vercel project and confirm public business facts; package/Dropbox status is recorded in `ai/current-state.md` after upload verification.
**Merged from:** `docs/archive/ROOT-FILES.md` (merged into §8–12)

> Read this first. Then `docs/DESIGN-TOKENS.md` for the visual system,
> `docs/COMPONENTS.md` for the piece-by-piece build, and `ai/current-state.md`
> for what changed most recently.

## 1 · The shape of the project

A **single-page site** plus a **static blog**, produced by one Python build from
hand-written HTML/CSS/JS fragments. No framework, no bundler, no CDN, no runtime
dependencies. GSAP is the only third-party script and it is inlined.

```
_src/  ──build.py──▶  math-academy.html   (one self-contained offline file; includes the test PDF)
                  └─▶ dist/               (deployable folder: /, /blog/, /guide/, 404)
```

## 2 · Directory map

| Path | What it is | Touch it when |
|---|---|---|
| `_src/build.py` | **the build.** Token substitution, image/font inlining, `/blog/` routes, sitemap, `llms.txt`, 404, legacy redirects | adding a page, changing the domain, changing routes |
| `_src/02-top.html` | sprite + preloader markup + `<header>` + drawer + hero section | preloader, nav, hero |
| `_src/03-sections.html` | `#why` `#method` `#lab` `#teacher` `#batches` `#library` `#results` | the main page body |
| `_src/04-bottom.html` | `#voice` `#faq` `#blog` `#book` `#maker` footer + sticky CTA | review/result transparency, FAQ, WhatsApp information request, footer |
| `_src/404-body.html` | the 404 page body (`dist/404.html` is generated from it) | error page |
| `_src/site.css` | design tokens and landing-page components; no ripple/displacement layer | all styling |
| `_src/site.js` | preloader/SFX, automatic-audio attempt, maths veil (portraits only), live data, labs, forms, toasts | all behaviour |
| `docs/blog-drafts/` | sole blog source: ten Markdown articles with metadata, publish markers, FAQ and source notes | writing/editing a post; read its `README.md` first |
| `_src/blog.css` | reading-page stylesheet, inlined into each post | blog design |
| `_src/fonts.inline.css` | base64 `@font-face` declarations (Bengali subset + Archivo + JetBrains) | font work — see `ai/known-issues.md` K-19 first |
| `_src/content/site.json` | seed/structure data; Neon snapshot is `_src/content/live.json` | changing dynamic data — see `CONTENT.md` |
| `assets/english-dialogue-format.pdf` | single 5-page library test PDF; copied to hosted assets and embedded in offline HTML | library file/download work |
| `api/content.js` | **the only server route** (v10.1): one Web-standard fetch handler, GET/POST/OPTIONS | backend |
| `lib/db.js` | the only SQL: read/update + the `shape()` that computes cap/left/pct/seatsLeft | data work |
| `db/schema.sql`, `db/migrate.mjs`, `db/seed.mjs` | Neon schema (14 statements), migration runner, and seed; `filled` constrained to 0–15 | provisioning |
| `scripts/neon-bootstrap.sh` | `NEON_API_KEY=… bash scripts/neon-bootstrap.sh` — deploy, migrate, seed, health check | first setup |
| `lib/env.js` | tiny `.env.local` reader used by the scripts | tooling |
| `scripts/preview-server.mjs` | `npm run preview` — static preview server: gzip, MIME, cache policy, 404, and `/api/content` on the same origin | showing the site to a human / a sandbox preview |
| `scripts/pull-content.mjs` | Neon → `_src/content/live.json` snapshot, run by `npm run build` | making the page follow the database |
| `tests/api.test.mjs`, `tests/dev-server.mjs`, `tests/browser_qa.py` | API/data-shape and browser checks; hosted/offline direct PDF downloads are covered | verification |
| `neon.ts`, `.neon` | Neon project config and the link written by `neon init` | Neon CLI |
| `_src/pwa/` | manifest, service worker, 4 icons — copied to `dist/` by the build | PWA |
| `package.json` | scripts (`build`, `db:push`, `test:api`, `dev:api`) + one dependency | tooling |
| `_src/gsap.min.js` | GSAP, inlined | never |
| `_src/fonts/`, `_src/../assets-src/` | source woff2 / images | asset work |
| `dist/` | **deploy this** to Vercel/Netlify/Cloudflare | — |
| `math-academy.html` | the offline single file (same content, `/blog/` links absolute) | — |
| `vercel.json` | headers + `trailingSlash:true` + `cleanUrls:false` + redirects | hosting / security headers |
| `deploy/` | `netlify.toml`, `_redirects`, `cloudflare-_headers` for other hosts | hosting |
| `docs/` | documentation for humans and AI — start at `docs/START-HERE.md` | when writing docs |
| `docs/archive/` | superseded originals kept for history — **do not read** unless asked | never |
| `docs/AUDIT-v10.md` | this round's full audit (SEO, security, structure, frontend, backend) | before a release |
| `ai/` | short operational memory: `instructions`, `decisions`, `known-issues`, `current-state` | at the start/end of a working session |
| `package/` | zipped deliverables (`math-academy-vN.zip`) | shipping |

## 3 · Build pipeline (`python3 _src/build.py [--publish]`)

1. Read the four HTML fragments, concatenate, substitute `__TOKEN__` placeholders
   with base64 image data and inlined CSS/JS.
2. `--publish` only: copy `assets/` (fonts, images), write `/blog/` hub + one folder per post,
   write the `/guide/**` redirect stubs, generate `sitemap.xml`, `llms.txt`, `llms-full.txt`,
   `robots.txt`, `.well-known/security.txt`, `humans.txt`, `design-notes.txt`, `404.html`, `_redirects`.
3. Emit `math-academy.html` (no `--publish` needed) and `dist/index.html`.
4. Post-process: absolute asset URLs on `404.html` and every nested page, preload the webfonts,
   inline the font CSS.

**Never hand-edit `dist/` or `math-academy.html`** — both are generated. If a change does not
survive a rebuild, it was made in the wrong place.

## 4 · Routes

| Route | File | Notes |
|---|---|---|
| `/` | `dist/index.html` | the one-pager, 10 sections |
| `/blog/` | `dist/blog/index.html` | hub — four homepage-featured articles + all ten posts |
| `/blog/<slug>/` | `dist/blog/<slug>/index.html` | title, body, FAQ, JSON-LD |
| `/guide/`, `/guide/<slug>/` | redirect stubs | `canonical` → `/blog/…`, `noindex,follow` |
| anything else | `dist/404.html` | **real 404 status**, theme-matched |
| `/assets/*` | fonts + images | immutable cache |
| `/llms.txt`, `/llms-full.txt` | AI-readable summary | generated |
| `/design-notes.txt` | plain-text copy of `docs/DESIGN-TOKENS.md` | generated at build |
| `/sitemap.xml`, `/robots.txt` | SEO | generated |

## 5 · Sections of the homepage

| # | `id` | What |
|---|---|---|
| — | — | preloader (`#preloader`), header, drawer, hero |
| 01 | `#why` | three reasons + `.pillar` cards |
| 02 | `#method` | long vs short path comparison lab |
| 03 | `#lab` | interactive geometry sliders (`circle / triangle / pythagoras / unit circle`) |
| 04 | `#teacher` | instructor portrait + credentials |
| 05 | `#batches` | three batches, fees, seat meters |
| 06 | `#library` | exactly one clearly labelled test PDF, “English Dialogue Format,” with direct download |
| 07 | `#results` | sample-data lookup interaction; no live result service |
| 08 | — | transparency cards; no fabricated reviews/results (`#voice`) |
| — | `#faq` | accordion |
| 09 | `#blog` | the blog teaser (generated) |
| 10 | `#book` | WhatsApp information request; no seat reservation or server-side submission |
| — | `.maker` | developer credit |
| — | `.footer` | links, SSL badge, socials |

## 6 · Hard constraints (do not break these)

1. **One self-contained `math-academy.html`** — no CDN, no external CSS/JS for the offline file.
2. **Domain** comes only from `SITE_HOST` in `_src/build.py`.
3. **Logo is never cropped**; no free trial; no HSC content; batches are offline; academy founded in 2022.
4. **Every `.md` is numbered and AI-readable**; assumptions are marked `[ASSUMPTION]`,
   open questions `[DECISION NEEDED]`.
5. **Capacity is exactly 15 students per batch** in Neon, seed, UI, schema, generated data and docs. Legacy fills above 15 are reconciled; no impossible seat totals may be published.
6. **No user auth or student accounts.** Neon Postgres powers the dynamic site data through exactly one Vercel Function (`api/content.js`); the "result lookup" remains a hard-coded demo.
6. **Facts are fixed**: প্রান্ত রায় · দর্শনা আইডিয়াল স্কুল · FB `pranto.rai.37` ·
   map `UyNxwUBw3sjnmGE29` · WhatsApp `+880 1641-045469` · ১০+ বছর · দর্শনা, চুয়াডাঙ্গা.
7. **Lighthouse:** target 100 in every category without changing the approved design or shortening the intro. Measure and report exact results; do not claim a score until a current run completes.

---

## 7 · Part B — files at the web root, and why

---

## 8 · The table

| File | Root path | Purpose | Read by | Status here |
|---|---|---|---|---|
| `sitemap.xml` | `/sitemap.xml` | lists every indexable URL + `lastmod` | Google, Bing, DuckDuckGo | **shipped** (generated) |
| `robots.txt` | `/robots.txt` | crawl permission + sitemap pointer + AI-bot allow-list | every crawler | **shipped** |
| `llms.txt` | `/llms.txt` | short Markdown fact sheet for AI engines | LLMs, chat assistants | **shipped** |
| `llms-full.txt` | `/llms-full.txt` | full readable text of every page (~68 KB) | LLMs, agents | **shipped** (generated) |
| `.well-known/security.txt` | `/.well-known/security.txt` | RFC 9116 vulnerability-report contact | security researchers, scanners | **shipped** |
| `humans.txt` | `/humans.txt` | who built the site (teacher + developer) | humans, some scanners | **shipped** |
| `ads.txt` | `/ads.txt` | authorises ad sellers | AdSense / programmatic buyers | **not shipped — no ads** |
| `app-ads.txt` | `/app-ads.txt` | authorises sellers for a linked mobile app | App Store / Play crawlers | **not shipped — no app** |
| `404.html` | `/404.html` | themed error page, real 404 status | browsers, crawlers | **shipped** |
| `og-1200x630.jpg` | `/og-1200x630.jpg` | social preview card | Facebook, WhatsApp, X, LinkedIn | **shipped** |

### Why `ads.txt` and `app-ads.txt` are intentionally absent

They are **permission lists**, not SEO files. Publishing an empty or placeholder `ads.txt` does not help
rankings and can confuse ad platforms later ("file exists but authorises nobody"). The correct moment to add
`ads.txt` is the day an AdSense account is approved — it then contains exactly one line:

```
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

`app-ads.txt` is only meaningful when a **mobile app** lists this domain as its developer website. This project
has no app, so the file would be dead weight.

---

## 9 · Where each file is produced

| File | Source in repo | Produced by |
|---|---|---|
| `sitemap.xml` | generated inside `_src/build.py` | build (also rewrites the repo copy) |
| `robots.txt` | repo root `robots.txt` | copied + host rewritten by build |
| `llms.txt` | repo root `llms.txt` | copied + host rewritten by build |
| `llms-full.txt` | generated from the rendered HTML | build |
| `.well-known/security.txt` | generated string in `_src/build.py` | build |
| `humans.txt` | generated string in `_src/build.py` | build |
| `404.html` | `_src/404-body.html` + theme CSS | build |
| `og-1200x630.jpg` | `assets/og-1200x630.jpg` | copied verbatim |

**Rule:** never edit anything inside `dist/`. It is overwritten on the next build.

---

## 10 · Host notes

| Host | Nothing to do | Watch out for |
|---|---|---|
| **Vercel** (current) | all files served from the output directory as-is | `cleanUrls: true` makes `/index.html` redirect to `/` — keep canonicals pointing at `/` |
| **Netlify** | files served as-is; `_redirects` not needed | `publish = "dist"` must point at the folder, not the repo root |
| **Cloudflare Pages** | files served as-is | dot-directories (`.well-known`) are served, but the file must be inside the uploaded folder |
| Apache / Nginx | works if `AllowOverride` / `location` serves dot-files | some hosts block `.well-known` by default — test it |

### Verify in 30 seconds after any deploy

```bash
for u in /robots.txt /sitemap.xml /llms.txt /llms-full.txt /humans.txt \
         /.well-known/security.txt /404.html /og-1200x630.jpg; do
  printf '%s  %s\n' "$(curl -s -o /dev/null -w '%{http_code}' https://mathacademydarsana.vercel.app$u)" "$u"
done
curl -s -o /dev/null -w 'real-404=%{http_code}\n' https://mathacademydarsana.vercel.app/does-not-exist
```

Expected: eight `200`s and `real-404=404`.

---

## 11 · Rules that keep these files honest

1. **`sitemap.xml` must list only indexable URLs.** The 404 page is excluded by design.
2. **`lastmod` = the date the content really changed.** A fake date gets ignored.
3. **`robots.txt` must not block what the sitemap advertises.** Contradiction = soft exclusion.
4. **`llms.txt` must match the page.** It is a fact sheet; a stale fact sheet is worse than none.
5. **`security.txt` shows correct contact endpoints** — a researcher must not have to guess. Keep `Expires:` in the future.
6. **`humans.txt` is credit, not SEO.** It now carries the developer byline (তানভীর ইসলাম তন্ময়).
