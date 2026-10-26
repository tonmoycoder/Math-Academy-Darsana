# SECURITY-AUDIT.md — findings and fixes

> Scope: a static marketing site with no accounts, no database, no server code, no third-party scripts. The attack surface is deliberately tiny; the audit focuses on what *is* there.

## 1. Posture summary

| Control | State |
|---|---|
| Authentication | not applicable (no accounts — by design) |
| Server-side authorization | not applicable (no server) |
| Secrets in repo/bundle | **none** (`grep -rni "secret\|api_key\|token\|password" dist/` → empty) |
| Third-party JS | **none** — GSAP is vendored and inlined |
| Cookies / storage | no cookies; `sessionStorage['ma-intro']` only |
| User input reaching a server | none — the booking form composes a WhatsApp URL locally |
| Injection surface | no CMS, no query params reflected into the DOM, no `innerHTML` with user data |
| Transport | HTTPS enforced by the host |
| Headers | recommended set in `docs/DEPLOY-VERCEL.md` §1 (nosniff, referrer-policy, frame-options, CSP, permissions-policy) |

## 2. Findings

| # | Severity | Finding | Evidence | Fix | Status |
|---|---|---|---|---|---|
| S-1 | Medium (pre-fix) | Brand red `#E4362D` failed AA at small sizes (a *content* accessibility defect, not a breach, but it blocks legal-grade accessibility claims) | Lighthouse color-contrast 4.17–4.31:1 | token moved to `#D42C24` (4.85:1 / 5.02:1) | **Fixed** |
| S-2 | Medium | Drawer was `aria-hidden` while containing focusable links | Lighthouse `aria-hidden-focus` | `inert` added on close, removed on open | **Fixed** |
| S-3 | Low | `div.stars` used `aria-label` on a non-semantic element | Lighthouse `aria-prohibited-attr` | `role="img"` added | **Fixed** |
| S-4 | Low | Preload link for the hero image caused a duplicate request + console error (`ERR_INVALID_URL` on an unsubstituted token in the publish build) | Lighthouse `errors-in-console` | head tokens now substituted; preload only injected in `--publish` when a real asset path exists | **Fixed** |
| S-5 | Low | Publish build carried the developer spec comment (implementation details publicly readable) | `dist/index.html` size | publish document assembled without `SPEC-COMMENT.html` | **Fixed** |
| S-6 | Low | Outbound links to Facebook/Maps lacked `rel="noopener"` in a couple of places | code review | added everywhere | **Fixed** |
| S-7 | Info | Public phone number, Facebook profile and map pin are published | by design | intended; the number is the business channel | Accepted |
| S-8 | Info | No CSP until deployment | n/a locally | shipped in `vercel.json` guidance | **Action for you at deploy** |
| S-9 | Info | Real student data must never be added to the demo results | `site.js` demo rolls are fictional | keep fictional, or delete the section | Watch |
| S-10 | Info | Publishing the school affiliation is an employment/reputational decision, not a technical one | page + JSON-LD now name দর্শনা আইডিয়াল স্কুল | confirm with the school (`PRD.md` D-1) | **Needs approval** |

## 3. Residual risk

- **Click-jacking:** mitigated by `X-Frame-Options: SAMEORIGIN` + `frame-ancestors 'self'` (at deploy).
- **Inline CSS/JS requires `unsafe-inline` in CSP.** Accepted because the bundle is authored, not user-generated, and `connect-src 'none'` blocks exfiltration. Tighten only if assets are ever split.
- **WhatsApp link is user-initiated** — no CSRF surface.
- **The only "back end" is the host.** Vercel account security (2FA) is the real perimeter; enable it.
