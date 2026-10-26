# Known issues and external blockers — v10.3.0

**Verified:** 2026-10-27. This file lists unresolved items only; historical fixes belong in `docs/AUDIT-v10.md` or the decision log.

[ASSUMPTION] Corrected source/build/API/browser/Lighthouse checks passed; the archive is uploaded and verified. The Vercel project/deployment remains an external owner-controlled blocker.

[DECISION NEEDED] Do not claim production availability or owner-verified business facts until the evidence listed below is checked.

---

## 1 · Production Vercel project is not serving the target hostname — release blocker

- Direct request to `https://mathacademydarsana.vercel.app/` returned HTTP **404** with `X-Vercel-Error: DEPLOYMENT_NOT_FOUND` on 2026-10-27. The blog and API health URL returned the same Vercel deployment-not-found response.
- This is not the site's themed 404 and does not prove an application deployment is available.
- This workspace has no Vercel CLI, `.vercel` project link, or Vercel credentials. A production deploy was not attempted.
- **Owner action:** link the correct Vercel project/repository or provide authorized deployment access; set `dist` as output; keep exactly one Function (`api/content.js`); set `DATABASE_URL` and `ADMIN_TOKEN` in Vercel without sharing their values in chat.
- **Verify after deploy:** `/`, `/blog/`, all ten article routes, `/api/content?health=1`, `/api/content`, security/cache headers, and an unknown route with the site's themed HTTP 404. See `docs/DEPLOY-VERCEL.md`.

## 2 · Mobile Lighthouse Performance is below the 100 target

- Three corrected Lighthouse 12 mobile homepage runs scored **95 / 97 / 96** (median **96**); LCP was 2.4 s, TBT 100–160 ms, and CLS 0.001. The run-to-run variance is material.
- Accessibility, Best Practices, and SEO were 100 in all three mobile runs. Desktop scored 100 in all four categories; the mobile blog hub scored 100 in all four categories in the recorded run.
- **Do not** report mobile Performance as 100, shorten the full intro, or redesign the approved visual system to chase a single score. Continue delivery/JS profiling and record repeatable runs.

## 3 · Owner confirmation is needed for mutable/public business facts

- The build reads live batch data from Neon, but the owner must confirm that current filled-seat counts, monthly fees, class schedule, next-batch labels, and programme counts are accurate and publishable. Capacity is exactly 15 per batch; academy founding year is owner-corrected to 2022. The prior Neon fills exceeded the new cap; migration/reconciliation caps them at 15, so every current batch is rendered full until the owner confirms actual enrolled counts and availability.
- Confirm permission to publish the teacher's school affiliation.
- Keep result lookups clearly marked as samples. The library now contains only one test item from the supplied Drive PDF: its actual title is “English Dialogue Format,” and the button directly downloads it. Do not relabel it as a math formula sheet or present sample scores, feedback, reviews, reports, home address, or unverified schedule as real.
- Do not change the WhatsApp enquiry to promise a seat reservation or completed booking. It should ask for information only.

## 4 · Browser autoplay policy cannot be overridden

- The site attempts sound automatically, persists the record that sound has actually played, and exposes mute controls. There is no permission chip, banner, or prompt.
- Browser policy can still block audible sound before a trusted user gesture on a fresh browser/profile. A website cannot grant itself that permission; do not promise guaranteed audible autoplay on every device. Preserve the silent fallback and no-permission-UI requirement.
- Physical iOS Safari/Android device checks remain outstanding. Chromium simulation is not a substitute for testing a real device.

## 5 · No continuous-integration gate

- Build, API, Playwright, and Lighthouse commands are run manually/agentically; no CI release gate is configured.
- Before each archive/deploy, follow `docs/TEST-PLAN.md`, rebuild from source, and confirm all ten routes and exact-ten/four-card counts.

## 6 · Search Console and indexing are owner tasks

- Search Console ownership, sitemap submission, and indexing requests were not verified in this workspace.
- After Vercel serves the correct deployment, confirm the property and submit `https://mathacademydarsana.vercel.app/sitemap.xml`.

## 7 · Secret handling

- Never copy `.env.local`, `.neon`, database URLs, tokens, browser credential stores, `node_modules/`, or caches into Dropbox/release archives.
- Use only `.env.example` as a safe environment-variable template. Rotate any credential that was exposed in an earlier session; do not repeat it in documentation.

## 8 · Release-state boundary

- The prior v10.3.0 test/build results predate the corrected capacity/year/PDF changes; do not reuse them as current evidence.
- Corrected source/build/API/browser/Lighthouse QA has passed; the local preview is not evidence that Vercel production is live.
- Dropbox upload is complete and verified; exact remote path, byte size, revision, and content hash are recorded in `ai/current-state.md`.
