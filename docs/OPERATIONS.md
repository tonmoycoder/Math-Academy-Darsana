# OPERATIONS — routine maintenance, monitoring, and recovery

**Audience:** owner and anyone operating the website after a release.
**Last reviewed:** 2026-10-27 · **Authority:** `docs/START-HERE.md`.

[ASSUMPTION] The owner can access the Vercel project and Neon dashboard, but does not want a separate admin UI in the website.

[DECISION NEEDED] Verify production health, real business values, and search-console ownership in the owner’s accounts; a local build does not establish those external states.

---

## 1 · Weekly or after-change checks

| Check | Where / command | Action if it fails |
|---|---|---|
| Homepage up | Vercel dashboard and live URL | Inspect deployment, then promote the last known-good release if needed |
| Blog routes | `/blog/` and ten current slugs | Fix source drafts/build output and rebuild; do not edit `dist/` manually |
| Data freshness | `/api/content` and latest pull/build log | Confirm Neon state; do not present fallback numbers as live |
| API health | `/api/content?health=1` | Check Vercel environment variables and Neon connectivity from the owner’s dashboard |
| Browser errors | Current Chromium smoke on home, hub and articles | Fix console/page errors before release |
| Lighthouse | Current audit version, mobile/desktop as required | Record exact measured scores; do not shorten the intro or change approved design to mask a result |
| CTA links | WhatsApp, phone, Maps, Facebook | Verify phone/profile/map still belong to the owner |
| SEO files | `sitemap.xml`, `robots.txt`, `llms.txt`, canonicals | Ensure host and ten-post inventory agree |
| Security headers | `vercel.json` and live response headers | Fix configuration; never add an external CDN exception without approval |
| Search indexing | Owner’s Search Console property, after deploy | Submit current sitemap and inspect actual indexing state |

## 2 · Build and content updates

```bash
npm run build                  # pull current Neon content, then publish dist/
npm run test:api               # API contract and data-shape guards
npm run preview                # local production-like preview (default port in script)
```

If the fresh Neon pull fails, `npm run build` aborts and leaves the prior snapshot unchanged. Do not treat seed values or an old snapshot as a fresh pull; use `MA_SKIP_PULL=1` only for a deliberately local build with a verified snapshot. Capacity remains exactly **15 per batch**. Never hand-edit `_src/content/live.json`, generated routes, or `dist/`.

For blog work, edit exactly one of the ten Markdown sources, preserve the metadata/FAQ/parser contract, rebuild, and check the hub, four homepage cards, CTA, sitemap and all routes. For library work, preserve the one accurate-title test PDF and direct-download behavior in both hosted and offline outputs. See `docs/blog-drafts/README.md` and `docs/BLOG-CONTENT-PLAN.md`.

## 3 · Backups and rollback

| Item | Source / recovery |
|---|---|
| Website source | Keep the approved source archive/repository; never rely only on generated HTML |
| Dynamic data | Neon Postgres; export/backup through the owner’s Neon account |
| Generated site | Rebuild from source; retain the last known-good release zip |
| Production deploy | Vercel deployment history; owner promotes the previous healthy deployment |
| Secrets | Vercel Environment Variables and ignored local secret store only; never include them in backups shared through chat/Dropbox |

After rollback, verify homepage, `/blog/`, one article, API health, canonical host, and the 404 status.

## 4 · Privacy and storage

The site does not use analytics, ad pixels, session replay, or a third-party chat widget. The booking form opens WhatsApp; it does not persist form data on this site. A local audio-grant record supports autoplay attempts; it is not a user account or a browser permission. The PWA service worker caches same-origin pages and must not intercept `/api/*`.

Do not add student names/marks, an admin UI, cookies, or new data collection without an owner-approved privacy/security review.

## 5 · Release record

Every round must:

1. pass the build, API, route, responsive, audio, SEO, console and security checks in `docs/TEST-PLAN.md`;
2. update `docs/START-HERE.md`, relevant topic docs, `ai/decisions.md`, `ai/known-issues.md` and `ai/current-state.md`;
3. package only a complete QA-passed build, excluding credentials, dependency folders and scratch files;
4. upload the archive to the owner’s Dropbox `/Math Academy/` folder and record the exact remote path/result;
5. tell the owner in Bengali what changed, what passed, what remains open, and what was uploaded.

## 6 · External tooling

Search Console, PageSpeed Insights, Lighthouse, and uptime tools are operator-side checks, not browser dependencies. Their accounts and production measurements are external evidence. Do not invent search rankings, analytics, or monitoring results when the owner’s account is not available.
