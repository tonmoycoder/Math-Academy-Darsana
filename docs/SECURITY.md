# SECURITY — current posture, boundaries, and release checks

**Audience:** anyone changing headers, API behavior, forms, secrets, or release packaging.
**Last reviewed:** 2026-10-26 · **Related:** `docs/BACKEND-PLAN.md`, `docs/DEPLOY-VERCEL.md`, `docs/TEST-PLAN.md`.
**Authority:** `docs/START-HERE.md` is the master project brain.

[ASSUMPTION] Visitors only need to read public academy information and start a WhatsApp conversation; no personal data should be stored by the site.

[DECISION NEEDED] Rotate any previously exposed Neon credentials and verify Vercel environment variables from the owner’s account before production writes are enabled.

---

## 1 · Security posture

| Area | Current design |
|---|---|
| Accounts/auth | No visitor accounts, student login, or application roles |
| Vercel server routes | Exactly one Function: `api/content.js` |
| Database | Neon Postgres only; keep other Neon services off |
| Public read | `/api/content` exposes supported public batch/settings data only |
| Writes | `POST /api/content` requires a server-side `ADMIN_TOKEN`; no token in the client |
| Booking form | Composes a WhatsApp URL; does not submit a name/phone to this site |
| Student records | Not collected or returned by the current public API; demo results must remain clearly labelled |
| Third-party code | None at runtime; GSAP is vendored and inlined, fonts/assets are local |
| Transport | HTTPS on Vercel; HSTS and other headers are configured in `vercel.json` |
| Browser storage | Sound grant and mute state use limited local/session storage; no analytics or tracking cookies |
| Content Security Policy | Same-origin plus inline authored scripts/styles; no external script/font origins |

## 2 · API and database controls

1. Keep shared code under `lib/`, `db/`, or `scripts/`; `api/content.js` remains the only file under `api/` that Vercel can deploy as a Function.
2. Use tagged/parameterized SQL. Do not concatenate request values into SQL or expose raw database errors to the client.
3. Public reads must never include the unused/private `bookings` table or student records.
4. Writes require a token comparison on the server and strict allow-listed fields; return method/validation errors with appropriate status codes.
5. Keep `DATABASE_URL`, `ADMIN_TOKEN`, Neon API keys, and deployment tokens out of source control, `dist/`, the offline HTML, screenshots and release zips.
6. The owner should enable account-level MFA and rotate exposed credentials. Never request secret values in chat.

## 3 · Known security/accessibility findings

| Finding | State | Action |
|---|---|---|
| Public phone, Facebook and map | Intentional public business information | Keep accurate and owner-approved |
| School affiliation | Reputational/public claim | Do not imply institutional endorsement; obtain/confirm owner approval |
| Inline CSS/JS in CSP | Required by the self-contained design | Keep scripts authored and non-user-generated; do not widen CSP to an external CDN |
| Demo result/quote content | Illustrative, not private data | Keep visibly labelled; never replace with real minors’ data without explicit consent and a privacy review |
| `.env.local` exists locally | Secret store, not a release asset | Exclude from every archive; rotate if exposed |
| API rate limiting | Not configured in the app | Reassess only if abuse appears; do not add an extra function |
| Service worker | Same-origin cache; must bypass `/api/*` | Check `sw.js` and test after changes |
| Autoplay grant | Browser storage remembers an audible grant/preference | It is not a browser permission; do not misrepresent it or add a permission prompt |

## 4 · Required release security checks

- [ ] `find api -maxdepth 1 -type f` shows only `api/content.js`.
- [ ] `vercel.json` configures only `api/content.js` as a Function.
- [ ] Neon Postgres is the only enabled Neon service.
- [ ] `dist/` and the release archive contain no `.env*`, database URL, token, API key, or credentials.
- [ ] `POST` rejects missing/wrong tokens and invalid payloads; `GET` never returns booking/student records.
- [ ] CSP, HSTS, frame, MIME, referrer and permissions headers match `vercel.json`.
- [ ] All external links use safe `rel` attributes where they open a new tab.
- [ ] Blog and home pages have no console errors and do not load third-party scripts/fonts.
- [ ] Production health is checked from the owner-controlled Vercel deployment before calling it live.

## 5 · Incident response

If a secret is exposed: revoke/rotate it at the source, update Vercel and the ignored local secret store, redeploy, verify health, and record the rotation **without writing the secret itself** into this repository or chat. If private student information is accidentally published, remove it immediately, redeploy, and follow the owner’s applicable privacy obligations.
