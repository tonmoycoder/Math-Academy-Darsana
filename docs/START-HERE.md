# START HERE — Math Academy project brain

**Authority:** this is the single master instruction file for any human or AI changing the project. Read it first; when project docs conflict, this file wins. Record unresolved conflicts in `ai/known-issues.md`, never guess.

**Audience:** project owner, editor, developer, Gemini 2.8 Flash / Antigravity, or another coding agent.
**Status:** corrected v10.3.0 build/QA passed; `package/math-academy-v10.3.0.zip` is uploaded and verified in Dropbox `/Math Academy/`. The configured Vercel hostname was rechecked on 2026-10-27 and returned `DEPLOYMENT_NOT_FOUND`; this is not a live-production claim.
**Last reviewed:** 2026-10-27.

[ASSUMPTION] The project stays a Bengali-first, mobile-first coaching site unless the owner explicitly changes scope.

[DECISION NEEDED] Owner must link/authorize the Vercel project and verify the school-affiliation permission plus real fee, schedule, and seat data. Local test results do not establish production availability or owner approval of business facts.

---

## 1 · Product and fixed facts

A single-page, offline-coaching website for **ম্যাথ একাডেমি (Math Academy), দর্শনা, চুয়াডাঙ্গা**, teaching classes 6–10 and SSC. Teacher: **প্রান্ত রায়**, of **দর্শনা আইডিয়াল স্কুল**. Deployment target: Vercel.

| Fact | Exact value / rule |
|---|---|
| Live/canonical domain | `https://mathacademydarsana.vercel.app` |
| Language | Bengali (`bn-BD`); keep Bengali digits readable and unclipped |
| Teacher | প্রান্ত রায় · দর্শনা আইডিয়াল স্কুল · ১০+ বছর অভিজ্ঞতা |
| Academy founded | **2022** (owner-corrected; supersedes historical 2020 claims) |
| Phone / WhatsApp | `+8801641045469` · visible form `০১৬৪১-০৪৫৪৬৯` |
| Facebook | `pranto.rai.37` |
| Map | `https://maps.app.goo.gl/UyNxwUBw3sjnmGE29` |
| Class mode | অফলাইন ব্যাচ; no free-trial claims |
| Capacity | **15 students per batch** everywhere; capacity and changing values are data-driven, never hard-coded in copy |
| Database | Neon Postgres; exactly one Vercel Function (`api/content.js`); all other Neon services stay off |
| Developer | তানভীর ইসলাম তন্ময় · `https://www.facebook.com/tanverislamtonmoyofficial` |

**Out of scope:** HSC, login/accounts, student authentication, payments, CDN resources, and unnecessary root-level files. Do not invent testimonials, outcome percentages, seat counts, fees, or school endorsements.

## 2 · Active acceptance criteria

1. The blog is exactly **ten** full articles, not eleven. Each is sourced from a Markdown draft and rendered at `/blog/<slug>/`.
2. `/blog/` lists those same ten articles and is visually/sonically consistent with the landing page.
3. The homepage shows exactly **four** curated article cards and a working **«আরও ব্লগ দেখুন»** link to `/blog/`.
4. Each article route contains its complete, carefully formatted article, metadata, three FAQs, navigation, and relevant sources; it is not a teaser or copied card summary.
5. Article/hub audio uses the same quiet synthesized sound character as the landing page, has a working mute control, subtle scroll cues, and no sound-permission UI. Autoplay is attempted automatically and its audible grant is persisted, while browser autoplay policy is respected without a prompt.
6. Build, all ten article routes, hub, homepage cards/CTA, styling, mobile layout, sound, links, and generated SEO output pass QA before release.
7. Library contains exactly one temporary test PDF, titled honestly as “English Dialogue Format” from the supplied file; the hosted button directly downloads a same-origin PDF, and offline HTML embeds the PDF data.
8. Update the master brain and relevant Markdown docs in the same round; package and upload each completed release to the owner's Dropbox folder; verify the uploaded metadata.

### 2.1 · Current source-of-truth files

- `_src/build.py` — build, parser, exact-ten validation, route generation, featured slugs.
- `docs/blog-drafts/01-*.md` … `10-*.md` — full article sources.
- `docs/blog-drafts/README.md` — writer/AI contract and parser workflow.
- `docs/BLOG-CONTENT-PLAN.md` — topic/intent map, official sources, release checklist.
- `_src/blog.css` — hub/article presentation; `_src/site.css` and `_src/site.js` — landing page.

Legacy `_src/blog/posts.py` and `_src/blog/posts_v11.py` are not loaded by the current blog build. Do not append posts there or edit generated `dist/` output.

## 3 · Non-negotiable design, copy, and behavior rules

1. Keep one self-contained `math-academy.html`; inline GSAP, CSS, JavaScript, fonts, and required images. No CDN.
2. Never crop or re-tint the logo. Do not clip Bengali digits at any viewport size.
3. Keep the intro at its full authored duration; sync its sound to the sequence. Do not shorten it.
4. Attempt sound autoplay automatically and persist the audible grant. Respect browser policy silently: **no** sound-permission banner, chip, dialog, or “tap for sound” UI. Sound remains mutable; scroll sound is subtle.
5. Always-sticky navbar. Keep a discoverable blog link in the navbar. Remove “কেন আমরা” and unnecessary navigation links if they reappear.
6. Every button/link looks interactive and works. No dead `href="#"`, no ripple effect, and no hidden/ambiguous CTA.
7. No free-trial claims; no HSC; frame the offer as offline batches; state **১০+ বছর** as the experience claim.
8. Batch size stays at **15** per batch. Seats, fees, and other changing values must be read dynamically from the backend/configuration, never embedded as stale literals in page content.
9. Maths/metal effects apply only to instructor photos. Do not add the circular logo badge below the portrait. The developer mark is the large Facebook mark with its pulse.
10. Keep the long-form landing design intact while optimizing delivery; target Lighthouse 100 without redesign. 404 must match the theme and return a real 404.
11. Footer must retain the developer credit, HTTPS/SSL badge, and authentic social-brand marks. Do not add a CREDITS & LICENCES block.
12. Every project Markdown file must be numbered and AI-readable, with uncertainty marked `[ASSUMPTION]` / `[DECISION NEEDED]`. Avoid useless root files and duplicated “brain” documents.

## 4 · Build, deployment, and dynamic data

`_src/build.py` creates:

```bash
python3 _src/build.py             # math-academy.html: one self-contained offline file
python3 _src/build.py --publish   # dist/: Vercel-ready site and generated routes/assets
```

`dist/` is generated; never hand-edit it. The publishing build pulls the latest available content snapshot from Neon through `scripts/pull-content.mjs`, merges it with `_src/content/site.json`, and emits dynamic HTML. The database is the live data source; JSON is a seed/structure fallback. If Neon is unreachable, verify the build log/state and do not silently ship stale numbers as current.

- Neon Postgres is the database.
- `api/content.js` is the **one and only** Vercel Function. Keep helper modules outside `api/`, or Vercel may deploy extra functions.
- Vercel is the target; keep the canonical domain exactly as in §1.
- Batch capacity is exactly **15** in the database, seed, UI, structured data, and documentation; reject other values. Legacy filled counts above 15 are reconciled before snapshot/build. Seat fills are volatile; do not present them as permanent facts. Current legacy fills were capped at 15 and therefore render as full; owner confirmation of actual enrollment/availability is still required.
- Backend schema, deployment, security, and operational details: `docs/BACKEND-PLAN.md`, `docs/DEPLOY-VERCEL.md`, `docs/SECURITY.md`, `docs/OPERATIONS.md`.

[ASSUMPTION] A static build can contain the latest fetched snapshot while retaining the one-function live refresh; do not introduce a second Vercel route without owner approval.

## 5 · Blog authoring and release contract

1. Read `docs/blog-drafts/README.md` and `docs/BLOG-CONTENT-PLAN.md` before editing a post.
2. Exactly ten numbered `*.md` drafts, with unique slugs. Do not append an eleventh article; a new topic requires an explicit replacement decision.
3. Each file needs `slug`, `tag`, `title`, `h1`, `desc`, `keyword`, `date`, `updated`, and integer `mins`; a public body bounded by `PUBLISH_BODY_START/END`; and exactly three FAQ pairs.
4. Keep `[ASSUMPTION]` and `[DECISION NEEDED]` notes outside the published body. Never leave draft comments, translation scratch text, accidental foreign-script words, or QA notes in the public article.
5. Research exam facts from the official documents for the stated year. Mark yearly facts by year and set an update reminder. Do not predict exact questions, guarantee results, or inflate evidence.
6. Homepage featured order: `gonit-valo-kore-podar-upay`, `ssc-goniter-sob-sutro`, `goniter-voy-katanor-7-obhyas`, `gonit-practice-sera-upay`.
7. Hub featured row must stay in sync with the same four homepage posts. Every article route must be linked from the hub and appear in sitemap/AI-readable output.
8. Test the CTA wording **«আরও ব্লগ দেখুন»**, destination `/blog/`, and the visible blog navbar link.

## 6 · Project map and supporting documents

| Task | Read these sources after this master file |
|---|---|
| Edit business facts/content | `docs/CONTENT.md` and `_src/content/site.json` |
| Write/edit blog articles | `docs/blog-drafts/README.md`, `docs/BLOG-CONTENT-PLAN.md`, the specific draft |
| Touch audio/autoplay | `docs/AUDIO-INTERACTION.md`, `docs/COMPONENTS.md`, `_src/site.js`, blog script in `_src/build.py` |
| Backend / Neon / single Function | `docs/BACKEND-PLAN.md`, `docs/SECURITY.md` |
| Deploy to Vercel | `docs/DEPLOY-VERCEL.md`, `docs/OPERATIONS.md` |
| SEO, metadata, schema, sitemap | `docs/SEO.md`, `docs/BLOG-CONTENT-PLAN.md` |
| Component markup/styling/motion | `docs/COMPONENTS.md`, `docs/DESIGN-TOKENS.md`, `docs/ARCHITECTURE.md` |
| Project file locations | `docs/PROJECT-MAP.md` |
| Test plan | `docs/TEST-PLAN.md` |
| Prior audit history | `docs/AUDIT-v10.md` (historical; verify current files before relying on a finding) |
| Decisions and unresolved issues | `ai/decisions.md`, `ai/known-issues.md` |
| Latest factual snapshot | `ai/current-state.md` (operational snapshot, not another master instruction file) |

Do not read `docs/archive/` or `package/math-academy/` unless history/package inspection is explicitly needed. The latter may contain a stale copy of an older release.

## 7 · Test and release checklist

1. Build `python3 _src/build.py --publish`; resolve parser/build errors in source Markdown or source code.
2. Confirm exactly ten unique article slugs, three FAQ pairs per article, ten individual routes, ten article links in the hub, four homepage cards, and 12 sitemap URLs (home + hub + ten articles).
3. Confirm homepage has exactly four article cards and a working “আরও ব্লগ দেখুন” link to `/blog/`.
4. Check all ten article routes, the hub, the landing page, `404.html`, and generated SEO metadata. All internal links resolve; no stale/legacy post route is indexed.
5. Visual QA at mobile and desktop sizes: no horizontal page overflow, tables scroll within their region, no clipped Bengali, cards/CTA are visible, and hub/article look like the landing-page family.
6. Audio QA: no permission UI, autoplay attempted without a required user prompt, sound mute control works, scroll cue stays subtle, autoplay grant persists, preloader music remains synchronized, and no console errors occur.
7. Run project tests and Lighthouse using `docs/TEST-PLAN.md`; verify single-function Vercel setup, dynamic batch data, security, and all user-required buttons/links.
8. Update `docs/CONTENT.md`, `docs/PROJECT-MAP.md`, `docs/BLOG-CONTENT-PLAN.md`, `ai/decisions.md`, and `ai/current-state.md` as appropriate. Ensure every `.md` changed is numbered and AI-readable.
9. Only after complete QA, create the release zip under `package/`, upload/replace the matching round in Dropbox `/Math Academy/`, and report the result in Bengali. Never upload a scratch/intermediate build.

## 8 · Definition of done for the v10.3.0 package round

- [x] Exactly ten complete Markdown articles with unique slugs; the directory `README.md` is not an article.
- [x] Build succeeds; `/blog/` and all ten full article routes render.
- [x] Homepage shows four article cards and the exact **«আরও ব্লগ দেখুন»** CTA to `/blog/`.
- [x] Hub featured row, full list, article routes, sitemap and AI-readable output agree with the Markdown sources.
- [x] Responsive, FAQ/JSON-LD, links, audio controls, slider, sample transparency, and local themed-404 QA pass.
- [x] API/data validation tests pass; the intro remains at its authored duration.
- [x] v10.3.0 source/build archive is prepared and Dropbox delivery is recorded in `ai/current-state.md` after metadata verification.
- [ ] Production Vercel routes/API are live and verified. Current evidence is HTTP 404 `DEPLOYMENT_NOT_FOUND`; see `docs/DEPLOY-VERCEL.md`.
- [ ] Mobile homepage Performance reaches 100 without changing the design or shortening the intro. Latest three-run median is 93; see `docs/TEST-PLAN.md`.
- [ ] Owner confirms school-affiliation permission and the accuracy of public fee/schedule/seat values; real-device iOS/Android checks remain.
- [ ] Deliver the complete Bengali audit/explanation in chat.

## 9 · Glossary

| Term | Meaning in this project |
|---|---|
| master brain | this `docs/START-HERE.md` file |
| draft source | Markdown in `docs/blog-drafts/`; only the marked publish body is rendered |
| hub | `/blog/`, the index of all ten posts |
| featured posts | the same four curated slugs shown on `/` and at the top of `/blog/` |
| dynamic data | current backend-fed capacity/seats/fees; not stale literals in article copy |
| sound grant | stored record that audible sound played; it is not a browser permission or mute setting |
| publish build | `_src/build.py --publish`, which generates `dist/` |
