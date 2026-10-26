# AI operating instructions — supplement to the master brain

**Authority:** `docs/START-HERE.md` is the one master instruction file and wins over this summary or any old package copy.
**Audience:** Gemini 2.8 Flash / Antigravity and other future coding agents.
**Status:** updated 2026-10-27; owner-corrected v10.3.0 build, API/browser QA and Lighthouse pass. Archive is uploaded and verified in Dropbox; production deployment is unavailable at the target (`DEPLOYMENT_NOT_FOUND`). See `ai/current-state.md` for exact metadata.

[ASSUMPTION] A future agent can work from the source tree and the documented build/test commands without re-reading every historical note.

[DECISION NEEDED] Ask the owner before changing business facts, the exact ten-post inventory, the canonical domain, architecture, visual design, intro timing, or release scope.

---

## 1 · Start here, then use the smallest relevant source

1. Read `docs/START-HERE.md` in full.
2. Read `ai/current-state.md` for the latest verified factual status; it is a snapshot, not a second master file.
3. Open the smallest task-specific source from the master brain's routing table.
4. Treat `docs/archive/` and `package/math-academy/` as historical; do not use them as current instructions unless the task explicitly concerns history or the older package.

## 2 · Project facts and architecture that must stay aligned

- Bengali-first Math Academy, Darshana/Chuadanga; founded **2022**; teacher প্রান্ত রায়, দর্শনা আইডিয়াল স্কুল; ১০+ years; WhatsApp `+8801641045469`; Facebook `pranto.rai.37`; map id `UyNxwUBw3sjnmGE29`.
- Vercel is the deployment target and `https://mathacademydarsana.vercel.app` is the exact canonical domain.
- Neon Postgres is the database. Keep exactly one Vercel Function, `api/content.js`; no other Neon services/functions.
- Batch capacity is **15**. Live seats, fees and changing content are dynamic; never hard-code a volatile count into copy or generated HTML.
- No HSC, no free-trial claim, no student login/auth, no payments, no CDN, and no external runtime font/script dependency.
- Library: exactly one temporary test PDF titled **English Dialogue Format**, with direct-download behavior; do not relabel it as a math/formula sheet.
- Every `.md` must have numbered sections and mark uncertainty `[ASSUMPTION]` / `[DECISION NEEDED]`.

## 3 · Blog contract — exactly ten articles

- Sole source: `docs/blog-drafts/01-*.md` through `10-*.md`; read `docs/blog-drafts/README.md` and `docs/BLOG-CONTENT-PLAN.md` before editing.
- Exactly ten unique slugs and exactly three FAQ pairs per draft. Do not append an eleventh post; a new topic requires an explicit replacement decision.
- Published hub `/blog/` lists all ten; each full article is a standalone `/blog/<slug>/` route.
- Homepage has exactly four cards — `gonit-valo-kore-podar-upay`, `ssc-goniter-sob-sutro`, `goniter-voy-katanor-7-obhyas`, `gonit-practice-sera-upay` — and a working **«আরও ব্লগ দেখুন»** link to `/blog/`.
- Keep article and hub design/sound consistent with the landing page; sound is synthesized, muted by a visible control, scroll cue subtle, autoplay attempted automatically, and no sound-permission UI is allowed.
- Do not edit generated `dist/blog/`, `dist/`, or `math-academy.html`. Legacy `_src/blog/posts.py` and `_src/blog/posts_v11.py` are not loaded by the current build.

## 4 · Editing and engineering guardrails

1. Edit source files only. Confirm every source edit survives a rebuild.
2. Preserve the single self-contained offline HTML output; inline GSAP and do not add a CDN/dependency without owner approval.
3. Keep the navbar sticky and the blog link visible. Every control needs a clear accessible name, working destination/action, and visible affordance.
4. Intro timing is not to be shortened. Do not introduce ripple effects. Maths/metal effects apply only to instructor photos; do not restore the circular badge below the portrait.
5. Do not crop/re-tint the logo or clip Bengali digits. Keep the developer credit, authentic brand marks and SSL badge; no CREDITS & LICENCES panel.
6. Preserve private student data; real minors' names/marks must not be committed. External new-window links need `rel="noopener"`.
7. Do not store an audio-mute preference that silences a later visit. Persist only the real audible-grant record; browser autoplay limits must be handled without permission prompts.

## 5 · Build, tests, and release sequence

```bash
node --check _src/site.js
python3 -c "import ast; ast.parse(open('_src/build.py', encoding='utf-8').read())"
python3 _src/build.py --publish
```

Then run the tests in `docs/TEST-PLAN.md`, validate the homepage/hub/all ten routes at phone and desktop widths, check zero console errors/overflow, the one hosted/offline direct PDF download, metadata/JSON-LD/sitemap/internal links, dynamic capacity 15 and sound. Run Lighthouse per the master brain; improve delivery without changing the approved design. Verify Vercel's one-function setup. Only after successful QA, create and upload the release zip to Dropbox `/Math Academy/` and explain the work in Bengali.

## 6 · Security and content safeguards

- The public phone, Facebook, map and school/teacher facts are intentional; never commit credentials or secrets.
- The booking form composes a WhatsApp link client-side and must not submit student data to a new endpoint.
- Do not invent student results, testimonials, reviews, search volume, ranking, fee/seat counts, endorsements, or guaranteed outcomes.
- For exam facts, use the official NCTB/board document for the named year; do not forecast exact questions or carry an old syllabus forward by assumption.
- Update `docs/START-HERE.md`, the relevant docs, `ai/decisions.md`, and `ai/current-state.md` in the same round when behavior or source ownership changes.
