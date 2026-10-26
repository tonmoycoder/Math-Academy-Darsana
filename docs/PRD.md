# PRD — Math Academy website and blog

**Audience:** owner, editor, developer, Gemini 2.8 Flash / Antigravity, and future agents.
**Last reviewed:** 2026-10-27 · **Release line:** v10.3.0 candidate.
**Authority:** `docs/START-HERE.md` owns fixed facts and non-negotiable constraints; this file describes the current product contract.

[ASSUMPTION] The primary audience remains Bengali-first students and parents in Darshana/Chuadanga, using phones and mobile data.

[DECISION NEEDED] Before any live public release, the owner must confirm that current fees, schedules, seat-fill values, monthly class/mock counts, venue/map wording, and public school affiliation are accurate and approved. Database values must not be represented as owner-verified facts without confirmation.

---

## 1 · Product summary

A Bengali-first, mobile-first website for **ম্যাথ একাডেমি, দর্শনা, চুয়াডাঙ্গা**. Its landing page explains the offline math batches and offers a direct WhatsApp contact route. A static, SEO-oriented blog contains exactly ten complete articles, with Markdown drafts as the source of truth. Dynamic batch data is stored in Neon Postgres and served through exactly one Vercel Function, `api/content.js`; the generated HTML remains the fast baseline/fallback.

The canonical domain is `https://mathacademydarsana.vercel.app`. The project also generates one self-contained offline `math-academy.html` file; the hosted build is `dist/`.

## 2 · Fixed facts and business scope

| Fact | Current value / rule |
|---|---|
| Academy | ম্যাথ একাডেমি · দর্শনা, চুয়াডাঙ্গা · founded **2022** |
| Teacher | প্রান্ত রায় · দর্শনা আইডিয়াল স্কুল · ১০+ বছর অভিজ্ঞতা |
| Phone / WhatsApp | `+8801641045469` · visible form `০১৬৪১-০৪৫৪৬৯` |
| Facebook | `pranto.rai.37` |
| Google Maps | short id `UyNxwUBw3sjnmGE29` |
| Teaching mode | অফলাইন ব্যাচ; no free-trial claim |
| Learners | Classes 6–10 and SSC; **HSC is out of scope** |
| Batch capacity | **15 per batch**; stored in the data layer and rendered dynamically |
| Hosting | Vercel; canonical host listed above |
| Database | Neon Postgres; only the `postgres` service is enabled |
| Server functions | Exactly one Vercel Function: `api/content.js` |
| Auth/payments | No visitor accounts, login, student authentication, payments, or admin UI |

Do not invent or promise student results, reviews, ranking, search volume, school endorsement, or guaranteed marks. Any demonstration result or illustrative quote must remain clearly labelled as such.

## 3 · Product goals

1. Explain who teaches, what classes are served, and how a parent can contact the academy.
2. Let a student reach a useful math-learning article without a login or app.
3. Keep current batch seats, fees, schedules, and capacity consistent across the page, API, structured data, and fallback output.
4. Make every navigation item, CTA, control, and article link visibly interactive and functional.
5. Provide accurate, year-labelled exam references with primary sources; never predict exact questions.
6. Keep the delivered page fast, accessible, self-contained where required, and free of CDN/runtime dependencies.

## 4 · Users and core journeys

| User | Need | Successful journey |
|---|---|---|
| Parent/guardian | Understand teaching, capacity, fee/schedule and contact | Landing page → batch section → WhatsApp or phone |
| Student | Learn a concept or plan practice | Search/social share → full article → related article or hub |
| Owner/teacher | Change live batch data without editing page copy | Update Neon data → API/build snapshot → verify rendered values |
| Search/answer engine | Read accurate Bengali pages and crawlable metadata | Canonical route → HTML, schema, sitemap and `llms.txt` agree |

## 5 · Acceptance criteria

### 5.1 Landing page and navigation

1. The homepage remains the designed one-page site and produces a complete offline `math-academy.html` build.
2. The navbar stays sticky and includes a visible **ব্লগ** link. Do not restore a “কেন আমরা” nav item or unnecessary links.
3. The landing page displays exactly four curated blog cards in this order:
   1. `gonit-valo-kore-podar-upay`
   2. `ssc-goniter-sob-sutro`
   3. `goniter-voy-katanor-7-obhyas`
   4. `gonit-practice-sera-upay`
4. The blog section includes a working **«আরও ব্লগ দেখুন»** link to `/blog/`.
5. Every button and link works, has a clear click affordance, and has an accessible name. Contact CTAs request current batch information; they must not promise a seat reservation. No decorative ripple effect is allowed.
6. The theme-matched 404 must return a real HTTP 404 on the deployed host.

### 5.2 Blog

1. There are exactly ten complete article routes plus the hub `/blog/`; a new topic requires an explicit replacement decision.
2. Each article is generated from one Markdown draft at `/blog/<slug>/`, with its full public body, metadata, three FAQs, related links, and appropriate structured data.
3. `/blog/` lists all ten articles; its four featured articles mirror the homepage's four in the same order.
4. The hub and article pages share the landing page's design language, typography, footer developer credit, HTTPS/SSL mark, and synthesized-sound character.
5. Blog audio has no permission/prompt UI. It attempts automatically where the browser permits, silently resumes on ordinary interaction when policy blocks autoplay, persists the audible-grant record, includes a working mute control, and keeps scroll cues subtle.
6. Blog source rules and slugs are in `docs/blog-drafts/README.md` and `docs/BLOG-CONTENT-PLAN.md`.

### 5.3 Dynamic content and backend

1. Capacity, seats, fees, batch schedules, class counts and mock counts come from Neon/configuration; do not hard-code volatile data in article or page copy.
2. The approved capacity is **15 students per batch**. A database change must update rendered values and the structured output through the data pipeline.
3. Before writing `live.json`, abort without changing the prior snapshot if active batch rows are empty/missing, capacity is not exactly 15, `team.founded_year` is not 2022, any filled value exceeds 15, or `classes_per_month` / `mock_per_month` are absent or non-numeric. A failed pull blocks release build.
4. The visible homepage FAQ and JSON-LD must both describe the offline-only offer and use the same dynamic capacity, fee, monthly class and mock counts.
5. `api/content.js` is the only Vercel Function. Shared code lives outside `api/`.
6. Neon services other than Postgres remain disabled. Do not add Neon Auth, AI Gateway, Object Storage, Realtime, or Neon Functions.
7. The generated HTML remains readable if the API is unavailable; report the data state honestly and do not silently call an old value current.
8. Writes are guarded by a server-side admin token. Never expose secrets in client code, generated output, or release archives.

### 5.4 Design, motion, and sound

1. Do not crop or re-tint the logo; do not clip Bengali digits at any viewport.
2. Keep the authored intro duration and its synchronized sound; do not shorten it for a score.
3. Autoplay is attempted automatically and sound remains mutable. Browser policy cannot be bypassed by storing a flag; do not add a permission prompt to work around it.
4. Maths/metal-like visual treatment is limited to the instructor portraits. No circular logo badge below the portrait, no liquid/displacement effect, and no ripple effect.
5. Preserve the designed landing-page visual system; optimize delivery without redesign.
6. Keep the developer credit, large pulsing Facebook mark, HTTPS/SSL badge, and authentic inline brand icons in the footer. Do not add a “CREDITS & LICENCES” panel.
7. Respect reduced-motion settings.

### 5.5 · Library test file

The library has exactly one temporary test item from the supplied five-page PDF. Use the actual title, “English Dialogue Format,” not a math/formula label. Its hosted action is a direct same-origin PDF download; the offline HTML must embed the PDF so the action still downloads without an external asset.

## 6 · SEO, content, and evidence

- Use Bengali (`bn-BD`), one clear H1 per page, unique title/description/canonical, accessible headings, real internal links, sitemap and AI-readable inventory.
- Articles are student-useful and researched. Cite official NCTB/board documents for dated syllabus/marks claims and research sources for learning advice.
- Identify the year of exam facts and review them against a newer official document before reusing them. Do not fabricate keyword volume, ranking, or exam predictions.
- Keep titles concise (target ≤60 characters) and descriptions around ≤150 characters where practical; these are editing targets, not search-engine guarantees.
- The 2026 exam facts are historical, year-specific references, not promises about the 2027 exam.
- See `docs/SEO.md`, `docs/BLOG-CONTENT-PLAN.md`, and the source notes in each draft.

## 7 · Quality and release requirements

| Area | Requirement | Evidence |
|---|---|---|
| Routes/content | Exactly ten Markdown sources/routes, ten hub entries, four homepage cards | build audit + browser |
| Responsive | 320 px and larger widths; no document-level horizontal scrolling; tables scroll inside their wrappers | Playwright + screenshots |
| Runtime | No console/page errors on homepage, hub, or article routes | Playwright |
| API | Correct capacity/data schema and guarded write behavior | `node tests/api.test.mjs` |
| SEO | Canonical/schema/sitemap/llms reflect current routes | generated-file audit |
| Audio | Automatic attempt, mute works, no permission UI, grant record is not treated as browser permission | browser test + documented browser policy |
| Accessibility | Keyboard, focus, reduced motion, contrast and screen-reader names reviewed | Lighthouse + manual pass |
| Performance | Target Lighthouse **100 in all categories without a design change**; preserve the intro duration | Lighthouse on a production-like server |
| Release | Build + QA + docs + package + Dropbox upload complete before calling the release done | release checklist in `START-HERE.md` |

[ASSUMPTION] Lighthouse scores vary by browser, machine, network and audit version. Report exact measured results and environment; do not claim 100 before running the audit.

## 8 · Non-goals

- HSC courses, online trial classes, student accounts/auth, payment processing, dashboards, admin CMS, video lessons, live streaming, or assignment submission.
- External CSS/JS/font/CDN dependencies or analytics/pixels without an owner-approved change.
- An eleventh blog post without replacing one of the current ten.
- Unverified claims about fees, seat fill, outcomes, testimonials, school endorsement, or exam questions.

## 9 · Open owner decisions

| Decision | Why it matters | Safe default |
|---|---|---|
| Confirm public school-affiliation wording | Accuracy and reputational approval | Keep only the owner's supplied wording; no institutional endorsement claim |
| Confirm actual fee, schedule, seat-fill, monthly class/mock counts | Public trust and conversion | Treat current database values as provisional until verified |
| Confirm address detail if a street address is desired | Local schema and directions | Publish locality only |
| Confirm any change to the ten-post set or design | Current scope is explicit | No change until approved |
