# Gemini 3.8 Flash on Google Antigravity — project handoff prompt

You are continuing work in the existing repository `tonmoycoder/Math-Academy-Darsana`. Work only in the already-open checkout and current Arena branch. Do not create/switch branches, commit, push, open a PR, deploy, or make production database changes. The owner will review and push/deploy manually. Do not request credentials, tokens, or secrets. Respond to the owner in Bangla.

## Objective

Independently review the current repository changes and finish any remaining **verified, local** improvements for Math Academy Darsana’s SEO/search visibility, usability, and launch-promo deliverables. Preserve the current work; do not recreate files blindly or revert unrelated owner work. Be evidence-led: distinguish source/repo facts, generated-build facts, live-site facts, and hypotheses. Never claim that a crawl/index request, sitemap submission, structured data, or a code change guarantees indexing, ranking, a Google logo, or a Bing result.

## Start by inspecting the actual checkout

1. Run `git status --short`, inspect the active branch, and review diffs before editing. Preserve all pre-existing/uncommitted edits, including SEO files and generated output. Do not stage/commit/push.
2. Inspect `README.md`, `ai/SEO-AUDIT-BING-2026-10-31.md`, relevant source under `_src/`, `scripts/`, `docs/`, and current generated `dist/` output. Do not assume every existing report or source comment is current; verify claims against the files/build.
3. Inspect `promo-video/SPEC.md`, `promo-video/STORYLINES.md`, `promo-video/index.html`, local assets and the rendered MP4. Existing intended concept: demonstrate `1+2+…+100` by pairing first/last numbers, `50 × 101 = 5,050`, then introduce teacher Pranto Roy, teaching approach, and the real site/brand end card.
4. Confirm the Bengali spelling is exactly **`প্রান্ত রায়`** wherever this repo’s visible content is changed. Do not “correct” it to `প্রান্ত রায়` or `প্রান্ত রাই`.

## SEO/source verification requirements

Read the relevant primary documentation directly before applying SEO recommendations. At minimum review:

- Google title links: https://developers.google.com/search/docs/appearance/title-link
- Google recrawl guidance: https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
- Google technical requirements: https://developers.google.com/search/docs/essentials/technical
- Google site names: https://developers.google.com/search/docs/appearance/site-names
- Google structured-data policies: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Google favicon guidance: https://developers.google.com/search/docs/appearance/favicon-in-search
- Bing URL Inspection: https://www.bing.com/webmasters/help/url-inspection-55a30305
- Bing index troubleshooting: https://www.bing.com/webmasters/help/why-is-my-site-not-in-the-index-2141dfab
- Bing Webmaster Guidelines: https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a
- Bing IndexNow: https://www.bing.com/webmasters/help/indexnow-0z209wby
- `claude-seo` audit framework and its technical/local/schema agents: https://github.com/AgriciDaniel/claude-seo

Use the repo’s real build/audit commands where practical. Treat a network/TLS failure as **unknown/unverified**, not a website defect. Do not disable TLS verification to force a live check. If live fetch is reachable, report exact URL, status/redirect/canonical/title/robots facts and timestamp; do not extrapolate indexing status from a page fetch. Keep Bing Live URL inspection distinct from Bing’s index state, and Google recrawl requests distinct from inclusion. Don’t fabricate analytics, search volume, backlinks, rank, user counts, business hours, tuition/fees, enrolment/seat counts, ratings, school affiliations, credentials, or review data.

Existing audit notes to verify rather than repeat uncritically:

- The source-side title was changed to `ম্যাথ একাডেমি দর্শনা | SSC ও ৬ষ্ঠ–১০ম শ্রেণির গণিত`; canonical is `https://mathacademydarsana.vercel.app/`.
- “Best math teacher”/`সেরা গণিত শিক্ষক` language and inconsistent Bengali teacher-name spellings were removed from tracked source/build content.
- Actual seat/schedule/fee information must be owner-confirmed and consistent across hero, batch cards, FAQ and structured data; do not invent or silently select among conflicting counts.
- Earlier repo checks reported: `python3 _src/build.py --publish --skip-pull` built 863 KB and published `dist/index.html` at 327 KB; `python3 scripts/verify_all.py` passed all 5 suites; `npm run test:api` reported 65 passed, 0 failed. Verify again if source edits affect these results.
- `claude-seo` parsing of generated HTML reported title/canonical/robots, 6 images and schema types `WebSite`, `EducationalOrganization`, `Person`, `Course`, `FAQPage`, `BreadcrumbList`; content-quality output included a repetitive-content flag. Such automated scores do not establish correctness or rankings.
- Prior live production fetches failed at the TLS/network layer, so live deployment/index state was not verified. The branch was not deployed.

## Promo-video acceptance criteria

- Keep the video editable in HyperFrames under `promo-video/`; use only local, supplied brand assets and bundled local fonts/scripts. Do not fetch runtime fonts or assets from a CDN.
- Preserve the authentic math proof and the exact teacher spelling `প্রান্ত রায়`. Do not invent success claims, testimonials, reviews, student counts, schedules, prices, or guaranteed results. The published location and classes may be stated only as verified in repo/owner-confirmed information.
- Existing deliverable is `promo-video/renders/math-academy-darsana-promo.mp4`, 25 seconds, 1920×1080, 30 fps, H.264/MP4. Inspect and play/review it; don’t assume it is good merely because it exists. Confirm file, duration, video codec, dimensions, frame rate, audio tracks, and representative frames. If you change the composition, rerun HyperFrames `check`, snapshots/review, render, and FFprobe checks.
- The current film is intentionally **silent** because no licensed music/audio asset or voiceover was provided. Do not add unlicensed music, generate a voiceover, or imply audio is present. Note this limitation and offer integration only if the owner supplies or approves licensed audio.
- Preserve local project assets: `assets/teacher-pranto.webp`, academy logo/lockup PNGs, `assets/fonts/noto-sans-bengali.woff2`, and `assets/gsap.min.js`. The visible scene order is: sum challenge → pairing proof → 5,050 answer → teacher intro → learning method → brand/site end card.
- A previous HyperFrames run achieved `check: ok`, 0 lint errors/warnings, 0 runtime/layout errors, and 40/40 contrast checks. Re-run against current files; do not repeat this result if your check differs.

## Prioritized product/UX review

Inspect whether the following improvements are actually needed and safe; rank them by user impact and evidence, and recommend rather than fabricate implementation where authoritative business data is missing:

1. **P0 — trust and data correctness:** one owner-confirmed source of truth for batch status, class range, schedule, fees, and seats; never publish stale or conflicting availability. Keep public contact/location consistent.
2. **P1 — conversion/accessibility:** visible tap-to-WhatsApp/contact action with a clear accessible label; keyboard/focus states; mobile-friendly readable type and spacing; reduced-motion support; ensure the enquiry action works without JS where feasible.
3. **P1 — useful learning content:** a short genuine sample lesson or worked example; clearly organized class/SSC topic pages with original explanations and examples, not thin keyword pages.
4. **P2 — local clarity:** an accurate Darshana/Chuadanga location/contact page and map only if owner-verified; distinguish site metadata/social previews from Google Search/Maps controls.
5. **P2 — QA/maintainability:** report real bugs with file/line and reproduction; check production build, API tests, accessibility/contrast, internal links, schema validity and mobile layout. Do not claim social/Google preview will display a particular image or format merely because metadata exists.

## Work and verification rules

- Make only small, evidence-backed edits. Prefer the smallest fix; explain uncertain or owner-dependent items instead of guessing.
- Do not run destructive commands, rewrite history, discard user changes, expose secrets, contact students, or mutate production data.
- After edits, run the relevant build, verification suites, API tests, HyperFrames check, and MP4 verification. Report exact commands/results and what could not be tested.
- `dist/` is generated output in this repository: if a source fix changes public HTML, rebuild using the project’s documented process and compare generated output; don’t hand-edit stale generated pages.
- Do not push or deploy. Leave changes uncommitted for owner review.

## Required final response (Bangla)

Give a concise but complete handoff with: (1) what you inspected and changed; (2) exact verified test/build/render results; (3) clickable paths to the MP4, editable HyperFrames project, and relevant audit/review notes; (4) prioritized findings with severity, evidence, and recommended fix; (5) clear live-network/indexing/audio limitations; and (6) explicit confirmation that you did not commit, push, or deploy. Separate verified facts from recommendations and owner decisions.
