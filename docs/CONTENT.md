# CONTENT — dynamic data contract

**Audience:** a human editor or AI changing public facts, batch data, fees, seats, class counts, or related copy.  
**Release:** v10.3.0 candidate · **Last reviewed:** 2026-10-27  
**Read next:** `docs/START-HERE.md`, `docs/BACKEND-PLAN.md`, `docs/SECURITY.md`

[ASSUMPTION] The values in a successful Neon pull reflect the owner-approved offer. A database value is not proof of public approval; verify the numbers and schedules with the owner before launch.

---

## 1 · Source of truth and rendering path

`_src/content/site.json` is the schema/seed and local fallback. Neon Postgres is the live source for approved per-batch capacity, active batch rows, schedules, fees, filled seats, next-batch settings, and programme counts. `scripts/pull-content.mjs` reads and validates that data, then writes a complete snapshot to `_src/content/live.json`. `_src/build.py` overlays the snapshot before generating the HTML baseline, visible FAQ and JSON-LD. The single Vercel Function, `api/content.js`, serves the same public data; current `site.js` runtime enhancement refreshes seat fills, remaining counts and meters only. Fees, schedules, labels, counts, FAQ and JSON-LD update in the next validated build.

The dynamic rules are enforced twice:

1. The pull must have non-empty active batch rows, capacity exactly `15`, owner-corrected `team.founded_year` exactly `2022`, every filled count within 0–15, and positive numeric `classes_per_month` / `mock_per_month` before it writes `live.json`.
2. The release build validates the snapshot again. Invalid data aborts the build; it must not silently publish a partial or stale snapshot.

A failed pull leaves the existing `live.json` unchanged and exits nonzero. `npm run build` therefore stops. Do not run with `MA_SKIP_PULL=1` unless intentionally using a previously verified snapshot or the reviewed seed for a local-only preview.

---

## 2 · Data model

| Key | Controls | Notes |
|---|---|---|
| `brand` | academy and teacher naming | `team.founded_year` is owner-corrected to 2022 and rendered in metadata/portrait seal |
| `contact` | phone, WhatsApp, Facebook, map, school affiliation, locality | school name/affiliation is owner-supplied; confirm permission before launch |
| `capacity.per_batch` | maximum students per active batch | exactly **15**, global; no per-batch override |
| `next_batch` | month labels and optional precise start time | countdown stays hidden unless a valid future `start_at` is provided |
| `batches[]` | one active batch row | labels, class range, schedule, fee, filled count, CTA text, sort order |
| `programme` | class range, monthly class count, monthly mock count | numeric counts are required in every valid live snapshot |
| `pricing` | currency and optional explanatory note | actual fee values come from each batch row, never a fixed HTML range |
| `team` | teacher, qualification, experience, founding year, developer credit | founded year is 2022; keep fixed identity facts consistent |
| `site` | canonical host, locale, audio preference | canonical host is `https://mathacademydarsana.vercel.app` |

**Batch row shape:**

```json
{
  "id": "ssc",
  "name_bn": "SSC ২০২৭ ব্যাচ",
  "code": "SSC 2027 · TARGET",
  "classes_bn": "ক্লাস ১০ (SSC)",
  "days_bn": "শুক্র · শনি",
  "time_bn": "সকাল ৯:০০ – ১১:৩০",
  "fee": 2200,
  "filled": 15,
  "hot": true,
  "wa_text": "আসসালামু আলাইকুম, …",
  "sort_order": 2
}
```

[ASSUMPTION] The example shows shape only; its fee, filled count, schedule, and labels are not a statement about current public values. Read `live.json` after a successful Neon pull.

---

## 3 · Safe editing and publishing recipes

### 3.1 Seat count changes

Change `filled` for the correct database batch; rebuild. Capacity, remaining seats, meter width, `X/Y`, the “সিট বাকি” text, header pill, drawer, CTA strip, booking heading and sticky button badge derive from the same validated rows. Filled count is constrained to 0–15 in Postgres and API writes; the legacy display guard still clamps overflow to 15.

### 3.2 Add or deactivate a batch

Edit the owner-approved Neon row and active state. The build generates the matching table row and the public API returns active rows only. Do not edit generated HTML or hand-copy a new batch into only one view. The site should remain usable on mobile if the list grows; recheck horizontal table overflow.

### 3.3 Capacity

Capacity is exactly **15 students per active batch**. There is no supported per-batch override. The pull, build and API reject any other capacity. The schema constrains `filled` to 0–15 and migration reconciles legacy over-cap counts to 15 before the guard is installed. A legacy `cap_override` column may exist in an older database; the application ignores it. The OG card is generated from `site.json` and now includes the 15-capacity and EST. 2022 facts. Any future capacity change requires explicit owner approval, a separately reviewed migration, and updates to all tests/docs/assets.

### 3.4 Fees, class counts and mock counts

Batch fees come from `batches[].fee`; monthly class and mock counts come from `programme.classes_per_month` and `programme.mock_per_month`. These values drive page copy and relevant JSON-LD. Never hard-code fee ranges, remaining seats, class counts or mock counts in HTML or article copy. Before launch, cross-check the Neon values against the owner's current offer.

### 3.5 Admission month and countdown

`next_batch.label_bn` and `after_bn` provide month-only copy. Do not inherit an old example date. `start_at` must be a real ISO-8601 timestamp with timezone and a future instant. If missing, invalid or expired, the countdown remains hidden.

### 3.6 Library test PDF

The library currently has one explicitly temporary test item: the supplied five-page PDF’s actual title is “English Dialogue Format.” Do not mislabel it as a math formula sheet. The hosted button must be a direct same-origin download of `/assets/english-dialogue-format.pdf`; the offline single-file HTML embeds the PDF data so its button also downloads without a companion asset.

### 3.7 Contact and schedule copy

The site does not claim public office hours; the contact block asks visitors to confirm the current schedule on WhatsApp. The batch table displays the schedule from Neon. Confirm the actual venue, schedule, fees and school-affiliation wording before public launch. No booking, seat hold, reply-time, online-class, weekly-report, or result guarantee is implied.

### 3.8 Build commands

```bash
npm run content:pull
npm run build
```

`npm run build` performs a fresh pull and stops if it fails. A direct Python build also attempts a pull. For a deliberate offline/dev build only, use `MA_SKIP_PULL=1` with a verified snapshot/seed, then inspect the output status. A successful build must contain no unresolved template tokens:

```bash
grep -R "{{" dist/index.html dist/blog dist/404.html
```

---

## 4 · Build tokens and generated views

| Token / marker | Source | Use |
|---|---|---|
| `{{CAP}}` | `capacity.per_batch` | page copy and metadata |
| `{{SEATS_LEFT}}` | sum of `capacity − filled` for active rows | header, drawer, CTA and sticky badge |
| `{{FEE_MIN}}` `{{FEE_MAX}}` `{{FEE_RANGE}}` | min/max of active `batches[].fee` | fee copy and JSON-LD `priceRange` |
| `{{NEXT_BATCH}}` `{{AFTER_BATCH}}` `{{NEXT_BATCH_DATE}}` `{{NEXT_BATCH_ISO}}` | `next_batch` | admission label; optional countdown |
| `{{CLASSES_PM}}` `{{MOCK}}` | `programme` | visible FAQ and related copy |
| `{{PHONE}}` `{{LOCALITY}}` `{{SCHOOL}}` | `contact` | contact links, footer and relevant copy |
| `{{TEACHER}}` `{{DEGREE}}` `{{EXPERIENCE}}` `{{DEVELOPER}}` | `team` | instructor, biography and required developer credit |
| `{{FEAT_*}}` | the active row marked `hot` | hero batch card |
| `<!--__BATCH_ROWS__-->` | generated batch rows | full batch-table `<tbody>` |

Anything else should be fixed brand copy or belong to a component (`docs/COMPONENTS.md`). Add a new token rather than pasting a changing number into an HTML file. Keep the visible FAQ and JSON-LD generated from the same values.

---

## 5 · Live API hooks and fallback behavior

The initial HTML is crawlable and contains the validated build snapshot. If `/api/content` responds, `site.js` refreshes the same elements after paint and marks `<html data-live>`. If the API fails, the page retains its HTML baseline; never describe an unverified fallback as live.

| Hook | Meaning |
|---|---|
| `tr[data-batch="<id>"]` + `data-filled`, `data-cap`, `data-left` | matching row and its meter |
| `[data-count]`, `[data-left-txt]`, `[data-meter]` | row count, remaining text and bar width |
| `#pillSeats`, `#drawerSeats`, `#ctaSeatNum`, `#bookSeatNum`, `#stickySeatNum` | repeated headline seat totals |

Do not rename these hooks without updating both `apply_content()` and the live refresh logic.

---

## 6 · Backend and privacy boundary

Neon stores batch/settings data. `api/content.js` is the sole Vercel Function for reading the public data and handling owner-authorized updates. Keep SQL helpers in `lib/`; keep Neon services other than the required Postgres database off. Contact identity stays in the reviewed seed/source unless the data model is deliberately extended. Do not add authentication, payment collection, or public booking endpoints without a separate decision.

See `docs/BACKEND-PLAN.md`, `docs/SECURITY.md`, and `docs/TEST-PLAN.md` for schema, migration, environment, and regression details.

---

## 7 · Exact ten-article blog data contract

The sole public editorial source is `docs/blog-drafts/`: exactly ten complete Markdown articles with unique slugs and three FAQ pairs apiece. `_src/build.py` generates one `/blog/` hub, ten full slug routes, four curated homepage cards, and the working **«আরও ব্লগ দেখুন»** link to `/blog/`. `_src/blog/posts.py` and `_src/blog/posts_v11.py` are legacy and are not loaded.

1. Do not hard-code current capacity, seat availability, fees, or monthly class/mock counts in article copy; use supported tokens when a current academy fact is needed.
2. Keep date-specific syllabus and marks claims next to their year and recheck official NCTB/board sources before carrying them forward.
3. No invented results, reviews, endorsements, guaranteed outcomes, address, schedule, report, library/PDF, booking or online-class promise.
4. Keep full article pages distinct and styled/audio-consistent with the homepage; preserve the single self-contained HTML output and embedded assets.
5. The draft parser and research instructions live in `docs/blog-drafts/README.md`; the content plan and QA record live in `docs/BLOG-CONTENT-PLAN.md`.

---

## 8 · Owner verification before launch

[DECISION NEEDED] Confirm current batch labels, schedules, fees, active seat counts, monthly class/mock counts, next-batch timing, venue/address wording, school-affiliation permission, and every claim about available resources or outcomes. The website is not to imply an actual booking, verified student results/reviews, real PDF library, or an unverified report service.

[ASSUMPTION] The current snapshot and owner-provided copy are intended as a working build input, not independently audited proof of the offer. After confirmation, perform the release checklist in the master AI guide and upload only the tested, clean archive to Dropbox `/Math Academy/`.
