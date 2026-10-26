# API.md — interfaces

> Companion to `PRD.md`, `ARCHITECTURE.md`, `DATABASE.md`.
> **There is no first-party HTTP API, no JSON endpoint, and no webhook in this product.** What follows is (1) the contract the front end actually depends on, (2) the conventions any future API must follow, (3) the third-party link contracts.

---

## 1. Delivered interfaces (what the site relies on)

### 1.1 `wa.me` deep link — the conversion endpoint

```
GET https://wa.me/8801641045469?text=<url-encoded message>
```

| Aspect | Contract |
|---|---|
| Method | browser navigation (new tab, `rel="noopener"`) |
| Auth | none |
| Request | `text` = pre-composed Bengali message including class + batch |
| Response | WhatsApp UI; no data returns to the site |
| Validation (client) | message length ≤ 1,000 chars, `encodeURIComponent` applied |
| Failure | app absent → WhatsApp Web; web blocked → user copies the visible number |
| Privacy | the message never touches our infrastructure |

**Canonical builder** (`_src/site.js`):
```js
var WA_NUMBER = '8801641045469';
a.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
```
Every element with `data-wa="…"` gets rewritten at load; the same number is also hardcoded in 3 `href`s (`tel:`, footer WhatsApp, booking fallback). **Any change requires all four places** (grep `8801641045469`).

### 1.2 `tel:` — voice channel

```
tel:+8801641045469
```
Present in: drawer, booking section, footer, sticky CTA.

### 1.3 Outbound reference links

| Purpose | URL | `rel` |
|---|---|---|
| Facebook (trust/`sameAs`) | `https://www.facebook.com/pranto.rai.37` | `noopener` |
| Directions | `https://maps.app.goo.gl/UyNxwUBw3sjnmGE29` | `noopener` |
| School affiliation | `https://www.darsanaidealschool.com/` | `noopener` (used in copy/schema, optional link) |

### 1.4 Static files served by the host

| Path | Content type | Cache |
|---|---|---|
| `/` | `text/html` | short (per deploy) |
| `/assets/*.woff2` | `font/woff2` | 1 year, immutable |
| `/assets/*.webp` `/assets/*.png` `/assets/*.jpg` | image | 1 year, immutable |
| `/robots.txt` | text | 1 hour |
| `/sitemap.xml` | application/xml | 1 hour |
| `/llms.txt` | text | 1 hour |

### 1.5 Structured-data "interface" (consumed by crawlers, not by us)

`<script type="application/ld+json">` `@graph` with 6 nodes: `EducationalOrganization`+`LocalBusiness`, `Person`, `Course` (+2 `CourseInstance`), `WebSite`, `FAQPage` (5 questions), `BreadcrumbList`. Contract: valid JSON, absolute URLs, phone in E.164 (`+8801641045469`), `sameAs` = Facebook profile, `hasMap` = the Maps short link, `worksFor` includes both the school and the academy.

---

## 2. Client-side "endpoints" (pure functions, no network)

| Function (in `site.js`) | Input | Output | On invalid |
|---|---|---|---|
| `methodLab(id)` | example id | re-renders question/long path/shortcut/answer | ignores unknown id |
| `toolCircle(r, d)` / `toolTri(a,b)` / `toolPyth(a,b)` / `toolUnit(θ)` | numbers from range inputs | SVG path/points + text labels | clamps to the input's `min`/`max` |
| `lookupResult(roll)` | text | success card or NOT FOUND block | trims, uppercases, guards empty |
| `validateBooking(form)` | form values | `{ ok, errors }` | named + phone required; phone `^01[3-9]\d{8}$` after digit normalisation (Bengali digits → Latin) |
| `submitBooking(form)` | valid values | builds the wa.me URL, opens tab, shows toast | never throws; falls back to a plain link |

---

## 3. Conventions any future API must follow

| Topic | Rule |
|---|---|
| Base path | `/api/*` (Vercel Functions only — the static site must keep working without them) |
| Method | `GET` read, `POST` create; never `PUT`/`PATCH` for MVP |
| Auth | none for public reads; for writes, a server-checked secret header — never a client-side check |
| Request body | `application/json`, max 5 KB, reject unknown fields |
| Success | `200/201` + `{ "ok": true, "data": … }` |
| Error | `4xx/5xx` + `{ "ok": false, "error": { "code": "...", "message": "বাংলা বার্তা" } }` |
| Codes | `invalid_input` (400), `phone_invalid` (422), `batch_full` (409), `rate_limited` (429), `server_error` (500) |
| Idempotency | booking POST accepts `Idempotency-Key`; duplicates return the original result |
| Rate limit | 5 requests / 10 min / IP on writes; 429 with `Retry-After` |
| Timeout | upstream calls ≤ 5 s; the handler returns before Vercel's 10 s limit |
| Logging | log request id + code only; **never** name, phone or message body |
| CORS | same-origin only; no wildcard |
| Secrets | `process.env` on the server; never in `dist/`, never in git |
| Versioning | path prefix `/api/v1/…` if a breaking change ever lands |

**Suggested future endpoints (not built, requires approval):**
`GET /api/v1/batches` · `POST /api/v1/enquiries` · `GET /api/v1/results/:roll` (PIN header) — see `DATABASE.md` §8.

---

## 4. Environment variables

| Variable | Needed now? | Purpose |
|---|---|---|
| — | **none** | the current build and deploy require no env vars, no secrets, no tokens |

If the future API lands: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server only), `ADMIN_API_TOKEN` (server only), `SITE_URL`. All set in the Vercel dashboard; `.env.example` documents names, values never committed.

---

## 5. Failure handling summary

| Failure | Behaviour |
|---|---|
| WhatsApp unreachable | visible number + `tel:` link remain |
| Maps/Facebook link dead | remove from footer + schema `sameAs`; nothing breaks |
| CDN down | single-file `math-academy.html` still opens offline |
| JS blocked | all content and links are static HTML |
| Future API down | page must render identically; only the enhanced feature degrades |
