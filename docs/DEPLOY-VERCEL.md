# DEPLOY — Vercel production, data, and verification

**Audience:** the owner and anyone publishing a release.
**Last reviewed:** 2026-10-27 · **Target:** `https://mathacademydarsana.vercel.app`.
**Authority:** `docs/START-HERE.md` is the master project brain; this file describes deployment steps.

[ASSUMPTION] `vercel.json` describes the intended Vercel deployment shape; it does not prove that the owner has linked or deployed a project.

[DECISION NEEDED] The owner must link/authorize the correct Vercel project and confirm the public business facts before calling this package a live production release.

---

## 0 · Observed production status (rechecked: 2026-10-27)

A direct request to `https://mathacademydarsana.vercel.app/` returned HTTP **404** with `X-Vercel-Error: DEPLOYMENT_NOT_FOUND`. `/blog/` and `/api/content?health=1` produced the same deployment-not-found result. This is a Vercel deployment-level error, not the site's themed 404 page.

This workspace had no Vercel CLI, `.vercel` project link, or Vercel token environment variable. No production deploy was attempted. The corrected local build and QA are complete, but production still requires an owner-authorized deployment and live verification.

## 1 · Current deployment shape

- **Static output:** `dist/` (homepage, `/blog/`, ten article routes, assets, SEO files, themed 404, PWA files).
- **Vercel output directory:** `dist`.
- **Vercel build command:** empty; the deploy serves the already-generated output. Build and test before uploading/committing a release.
- **Vercel Function:** exactly one, `api/content.js`, 512 MB / max duration 10 seconds in `vercel.json`.
- **Database:** Neon Postgres, reached only by the Function or local pull script.
- **Canonical host:** `https://mathacademydarsana.vercel.app`.
- **Routing:** `cleanUrls: false`, `trailingSlash: true` for the generated `index.html` route folders.

## 2 · Build and pre-deploy checks

```bash
cd /home/user
npm run build                  # validates a fresh Neon snapshot, then publishes dist/
npm run test:api               # API + snapshot/data-shape guard tests (see the current assertion count in `docs/TEST-PLAN.md`)
```

For a deliberate local-only build from an already verified snapshot/seed (not a release pull):

```bash
MA_SKIP_PULL=1 python3 _src/build.py --publish
```

Before deployment, verify:

1. The Neon pull succeeded and reported capacity **15**, at least one complete active batch row, positive numeric programme counts, and the current update time. Any validation/connection failure must stop the build and leave the previous snapshot unchanged; do not release a fallback.
2. `dist/blog/` contains exactly the ten current article folders and `/blog/index.html`.
3. Homepage has exactly four article cards and the CTA **«আরও ব্লগ দেখুন»** points to `/blog/`.
4. No unresolved template tokens or stale host/post routes exist; the library’s single PDF link downloads `/assets/english-dialogue-format.pdf` directly.
5. API tests, responsive browser QA, sound-toggle QA, SEO/JSON-LD and current Lighthouse checks are recorded in `docs/TEST-PLAN.md`.
6. The archive excludes `.env.local`, credentials, `node_modules/`, caches, screenshots, and previous package folders.

## 3 · Vercel project settings

In the owner-controlled Vercel project:

| Setting | Value |
|---|---|
| Framework preset | Other |
| Root directory | repository root |
| Build command | empty |
| Output directory | `dist` |
| Install command | empty/not required for the static output; the Function dependencies are in the lockfile |
| Production domain | `mathacademydarsana.vercel.app` |
| Function | only `api/content.js` |

The current `vercel.json` is authoritative for routing, headers, caching and function settings. Do not copy an old example from this document or overwrite the file with a generic template.

## 4 · Required server-side environment variables

Vercel → Project → Settings → Environment Variables (Production and any required Preview environment):

| Name | Purpose | Rule |
|---|---|---|
| `DATABASE_URL` | Pooled Neon connection string for the Function | Never expose to the browser or output files |
| `ADMIN_TOKEN` | Authorizes limited data writes | Use a long random value; store only in Vercel/ignored local env |

`DATABASE_URL_UNPOOLED` is only for an approved migration workflow. Never paste secret values into chat, docs, screenshots, or the release zip. Rotate any credential that was previously exposed.

## 5 · Deploy workflow

### 5.1 Dashboard/Git deploy

1. Ensure the current release output and source docs are saved in the approved repository/package.
2. Import or select the owner’s Vercel project; use the settings in §3.
3. Confirm the two environment-variable names exist without exposing their values.
4. Deploy `dist/` and `api/content.js` as the same release so the one function is present.
5. Wait for the deployment to finish and confirm the production domain points to it.

### 5.2 CLI deploy (only from the owner’s authenticated machine)

```bash
vercel                 # link/select the owner’s project
vercel --prod          # deploy the configured dist/ output and api/content.js
```

Do not run a production deploy from an unauthenticated or unrelated sandbox. The owner must approve any production action.

## 6 · Post-deploy verification

Use the exact canonical domain:

```bash
curl -sI https://mathacademydarsana.vercel.app/
curl -s  https://mathacademydarsana.vercel.app/api/content?health=1
curl -s  https://mathacademydarsana.vercel.app/api/content
curl -sI https://mathacademydarsana.vercel.app/blog/
curl -sI https://mathacademydarsana.vercel.app/blog/ssc-goniter-sob-sutro/
curl -sI https://mathacademydarsana.vercel.app/robots.txt
curl -sI https://mathacademydarsana.vercel.app/sitemap.xml
curl -sI https://mathacademydarsana.vercel.app/404-not-a-real-page/
```

Expected: normal routes return 200, API health reports `db: "up"` when production env vars are correct, the public API reports the current capacity/batches, and an unknown URL returns a themed 404 **with HTTP 404**. Check `Cache-Control`, security headers, `/sw.js` no-cache behavior, and `/assets/*` immutable caching against `vercel.json`.

Also verify on the deployed domain:

- no JavaScript/page errors in a browser;
- the CTA opens the intended WhatsApp number;
- the blog hub and all ten routes render complete content;
- no audio permission UI appears and sound remains mutable;
- canonical, sitemap and `llms.txt` use the correct host;
- Lighthouse scores are measured and recorded for the current audit version. Target is 100 across all categories without changing the design or shortening the intro; do not report a score without an actual run.

## 7 · PWA, cache, and rollback

- `manifest.webmanifest`, icons and `sw.js` are generated from `_src/pwa/`.
- Service-worker navigation caching is network-first and must never intercept `/api/*`; keep `sw.js` revalidating rather than immutable.
- Hashed-like assets may use immutable caching; HTML/SEO pages use the Vercel cache rules in `vercel.json`.
- A PWA install can earn durable autoplay treatment on supported browsers, but a stored local preference is not itself autoplay permission.
- Rollback is done in the owner’s Vercel dashboard by promoting the previous known-good deployment. Record which release was promoted.

## 8 · Status boundaries

Production deployment, Vercel environment-variable presence, live function health, Search Console ownership/indexing, and real-device behavior are external states. Mark them verified only after checking the owner’s service/account. Update `ai/current-state.md` and `ai/known-issues.md` with the exact evidence after a deploy.
