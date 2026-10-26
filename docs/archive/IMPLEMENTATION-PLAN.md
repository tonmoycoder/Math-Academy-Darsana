# IMPLEMENTATION-PLAN.md — phased build plan

> Read `PRD.md`, `DESIGN.md`, `ARCHITECTURE.md`, `DATABASE.md`, `API.md`, `AGENTS.md` first.
> Status legend: **DONE** (exists and verified) · **PARTIAL** (exists, needs the listed work) · **TODO** (not started).
> No phase may introduce a feature outside `PRD.md` §13.

---

## Phase 0 — Foundations · DONE
- **Goal:** a repo that builds a deployable page in one command.
- **Files:** `_src/build.py`, `_src/02-top.html`, `03-sections.html`, `04-bottom.html`, `site.css`, `site.js`, `fonts.inline.css`, `gsap.min.js`, `assets/`, `uploads/`.
- **DB/API:** none.
- **Tests:** `python3 _src/build.py` exits 0; `node --check site.js`; page opens from `file://`.
- **Completion criteria:** `math-academy.html` exists, opens offline, shows the hero, no console error.

## Phase 1 — Design system & tokens · DONE
- **Goal:** one source of colour, type, spacing, components.
- **Files:** `site.css` (`:root`, `.btn`, `.chip`, `.tab`, `.pillar`, `.sheet`, `.stat`, `.seats`), `fonts.inline.css`.
- **Key decisions:** `--red` moved to `#D42C24` for AA; 6 subsetted @font-face; `BN Metric` fallback.
- **Tests:** Lighthouse a11y 100; contrast spot-check; 390/820/1440 screenshots.
- **Done when:** every component in `DESIGN.md` §5 exists with its states.

## Phase 2 — Content sections (1 page, 13 blocks) · DONE
- **Goal:** the full narrative in Bengali: hero → why → method → lab → teacher → batches → library → results → voices → FAQ → booking → footer.
- **Files:** `02-top.html`, `03-sections.html`, `04-bottom.html`.
- **Tests:** one `<h1>`; heading order; no lorem ipsum; demo data labelled.
- **Done when:** a parent can answer the 4 PRD questions without leaving the page.

## Phase 3 — Interactivity · DONE
- **Goal:** method lab (4 examples), live geometry lab (4 tools), results lookup, library filter, booking form → WhatsApp, drawer, sticky CTA, scroll progress.
- **Files:** `site.js`, markup hooks (`data-tool`, `data-filter`, `data-wa`).
- **Tests:** Playwright touch flow at 390 px (drawer, 4 tabs, sliders, form → toast); keyboard pass on tabs/sliders.
- **Done when:** every interactive element works with a finger and with a keyboard.

## Phase 4 — Kinetic identity (v4) · DONE
- **Goal:** portraits read as bold/energetic; pointer-driven ink reveal; click affordances everywhere.
- **Files:** `.tphoto*`, `.tport*` in `site.css`; `[data-ink]` engine and lobe maths in `site.js`; `tabout` block.
- **Tests:** two-pointer-position screenshots; `prefers-reduced-motion` off-switch; touch breathing fallback; tap targets ≥ 44 px.
- **Done when:** the owner says the image finally feels "bold" (approved in v4).

## Phase 5 — SEO & GEO surface · DONE
- **Goal:** be indexable and citable.
- **Files:** `build.py` (`<head>`, JSON-LD `@graph`), `robots.txt`, `sitemap.xml`, `llms.txt`.
- **Tests:** JSON-LD parses; canonical/hreflang present; title ≤ 60; description ≤ 150; Rich Results eligible; Lighthouse SEO 100.
- **Done when:** all SEO-1…SEO-10 in `PRD.md` §9 pass.

## Phase 6 — Performance & accessibility hardening · PARTIAL
- **Goal:** no layout shift, fast first paint, AA everywhere.
- **Done:** font gate, metric-matched fallback, preloader behind the hero, `inert` drawer, skip link, reduced-motion, AA red.
- **Remaining:** LCP is font-bound (~2.8 s). Optional next step: **critical Bengali subset** (~30 KB, hero glyphs only, `unicode-range`) + moving lab/init work into `requestIdleCallback`.
- **Tests:** Lighthouse ×3 runs; CrUX after launch.
- **Completion criteria:** SEO/A11y/BP 100 and Performance ≥ 95 on mobile.

## Phase 7 — Real content migration · TODO (blocked on owner)
- **Goal:** replace every demo value with the truth.
- **Inputs needed:** exact fees, schedules, seat counts, real result rolls (or delete the section), real testimonials with consent, library PDFs, `og-1200x630.jpg`, confirmed street address, domain.
- **Files:** `#batches`, results data, testimonials, footer credits, `build.py` (`S`), `sitemap.xml`, `robots.txt`.
- **Tests:** rebuild + full Playwright sweep + JSON-LD re-validate.
- **Done when:** no "ডেমো" claim is false; the footer credit reflects reality.

## Phase 8 — Local SEO operations · TODO (owner-led, tool-assisted)
- **Goal:** actually rank in Darshana/Chuadanga.
- **Tasks:** Google Business Profile (name/address/phone identical to the site), Search Console verification + sitemap submit, Facebook page ↔ profile cross-links, 3–5 local citations (school directory, business listings), ask 5 guardians for Google reviews.
- **Tools:** `docs/CDN-REFERENCES.md` (seo-monster or mcp-gsc for GSC data; `geo audit` weekly).
- **Done when:** homepage indexed, GBP verified, first non-brand impressions recorded.

## Phase 9 — Deployment to Vercel · TODO (owner-led)
- **Goal:** live on the free tier over HTTPS.
- **Files:** `vercel.json` (see `docs/DEPLOY-VERCEL.md`), `dist/` committed or built by Vercel.
- **Tests:** production URL loads with no console error; assets cached; Lighthouse on the live URL; `robots.txt`/`sitemap.xml`/`llms.txt` reachable.
- **Done when:** the live URL passes the same checks as local.

## Phase 10 — Post-launch monitoring · TODO
- **Tasks:** weekly GSC query check (positions 8–20), monthly Lighthouse run, monthly `geo audit`, uptime check (Vercel dashboard is enough at this scale), review the "কীভাবে জানলেন?" answers monthly.
- **Done when:** a one-page monthly report exists.

---

## Dependency graph

```
P0 → P1 → P2 → P3 → P4
           ↘ P5 → P6
P7 (blocked on owner data) → P9
P8 depends on P9
P10 depends on P9
```

## Recommended first task

**Phase 7, item 1: confirm the four business facts** (school-publication approval, street address, real fees/schedules/seats, domain). Everything else that is product-facing is already built; these are the only blockers between the current demo and a launchable site.
