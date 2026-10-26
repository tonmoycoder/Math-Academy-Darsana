# MONITORING.md — keeping it alive at this scale

> Rule: monitor only what someone will act on. This is a static page; there is no server to page you about.

## 1. What to watch

| Signal | Where | Threshold → action |
|---|---|---|
| Site up | Vercel dashboard / any uptime pinger (free) | 2 failed checks → check deployment status, promote the previous |
| Console errors | after every deploy: open the URL, DevTools console | any error → roll back or hot-fix |
| Core Web Vitals | PageSpeed Insights / CrUX (after traffic) | LCP > 4 s or CLS > 0.1 → investigate fonts/images |
| Lighthouse scores | monthly, mobile | SEO/A11y drop below 100 → fix before anything else |
| Indexing | GSC → Pages | homepage not indexed 7 days after launch → request indexing, check canonical |
| Queries | GSC → Performance (weekly) | new query at position 8–20 → add that question to the FAQ |
| AI visibility | `geo audit`, ChatGPT/Perplexity spot-check (monthly) | score < 85 → follow its top fixes |
| Leads | WhatsApp + "কীভাবে জানলেন?" | drop for 2 weeks → check GBP and reviews |
| Broken links | quarterly: phone/Facebook/Maps/school link | 404 → fix in `_src/` + schema |

## 2. What we deliberately do NOT collect
No analytics script, no cookies, no pixels, no session recording, no user identifiers. The only stored client value is `sessionStorage['ma-intro']`.

## 3. Alerts
At this scale, one manual weekly check (5 minutes: GSC + the live URL + WhatsApp) beats any alerting stack. If the owner wants automation later: Vercel → Integrations → uptime monitor on `/` (1-minute interval), email only.

## 4. Backups / recovery verification
| What | How | Verified |
|---|---|---|
| Source | git (commit every change) | `git log` |
| Build | `dist/` regenerated in 0.2 s | `python3 _src/build.py --publish` |
| Deploy | Vercel keeps every deployment | promote previous |
| Disaster | clone repo → rebuild → redeploy (≈ 2 min) | run once per quarter |

## 5. Observability gaps (known)
- No server logs to inspect (there is no server).
- No bot/fraud analysis on WhatsApp (spam messages are handled in WhatsApp itself).
- Attribution relies on asking the parent — documented as a limitation, not a bug.
