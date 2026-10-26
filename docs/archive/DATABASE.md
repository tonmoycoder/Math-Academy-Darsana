# DATABASE.md — data model

> **Verdict: this product has no database in MVP, and that is a deliberate architectural decision, not an omission.**
> Companion to `PRD.md` §10, `ARCHITECTURE.md` §5.

---

## 1. Why there is no database

| Question | Answer |
|---|---|
| Does any visitor create an account? | No (approved: authentication not required) |
| Is anything the visitor types stored? | No — the booking form composes a WhatsApp message in the visitor's own app |
| Does the page read data at runtime? | No — every value is baked into the HTML at build time |
| Who owns the content? | The teacher, in `_src/*.html` (a text file he can edit) |
| What would a database add? | A server, credentials, backups, an admin UI, a monthly bill, a failure mode — for zero user-facing benefit at this scale |

**Consequence:** no tables, no migrations, no RLS, no backups, no PII, no GDPR/DPDP exposure. If the site were breached, the attacker gets the same data as a visitor.

The "data model" of the product is therefore the **content model in the repository**:

---

## 2. Content model (file-backed)

### 2.1 `batch` — 4 records

| Field | Type | Constraint | Example |
|---|---|---|---|
| `name_bn` | text | required, unique | ফাউন্ডেশন ব্যাচ |
| `code_en` | text | required, uppercase | `CLASS 6–7 · FOUNDATION` |
| `class_range` | text | required | ক্লাস ৬–৭ |
| `days` | text | required | শনি · সোম · বুধ |
| `time` | text | required | বিকাল ৪:০০ – ৬:০০ |
| `fee_bdt` | integer | 500–10,000 | 1500 |
| `seats_taken` | integer | 0 ≤ x ≤ `seats_cap` | 9 |
| `seats_cap` | integer | fixed 12 | 12 |
| `status` | enum | `open` \| `waitlist` | `open` |
| `is_featured` | boolean | at most one true | false |
| `wa_message` | text | pre-filled Bengali | আসসালামু আলাইকুম, SSC ২০২৭ ব্যাচে… |

Stored as `<tr>` rows in `_src/03-sections.html` (§`#batches`). Derived, never stored: `seats_left = seats_cap − seats_taken`, meter width `= seats_taken / seats_cap`.

**Validation rule at build time (manual):** `seats_taken ≤ 12`; if `seats_taken = 12` then `status = waitlist` and the row CTA reads "ওয়েটিং লিস্ট".

### 2.2 `method_example` — 4 records (`_src/site.js`)

| Field | Type | Note |
|---|---|---|
| `id` | string | `gauss`, `pct`, `square`, `tangent` |
| `title` | text | chip label (Bengali) |
| `question` | text | Bengali |
| `long_path` | text | the memorising route + why it is slow |
| `shortcut` | text | the reasoning route |
| `answer` | text | Bengali numerals, mathematically correct |

### 2.3 `result` — demo records (`_src/site.js`)

| Field | Type | Note |
|---|---|---|
| `roll` | string | `MA-2026-084` etc. — **demo only** |
| `name` | text | first name only |
| `score` | number | 0–100 |
| `grade` | text | `A+` |
| `batch` | text | SSC ২০২৭ · ব্যাচ গামা |

### 2.4 `testimonial` — 3 records (`_src/04-bottom.html`), `faq` — 6 records, `note_sheet` — 6 records (filterable library).

### 2.5 `teacher` — 1 record

| Field | Value |
|---|---|
| name_bn / name_en | প্রান্ত রায় / Pranto Roy |
| role | প্রতিষ্ঠাতা ও শিক্ষক |
| affiliation | দর্শনা আইডিয়াল স্কুল (https://www.darsanaidealschool.com/) |
| degrees | গণিতে অনার্স ও মাস্টার্স (no institution named) |
| experience | ১০+ বছর |
| phone | +8801641045469 |
| facebook | https://www.facebook.com/pranto.rai.37 |
| location | দর্শনা, চুয়াডাঙ্গা + maps link |

**Invariant:** the teacher facts appear in exactly four places and must stay identical — hero card, teacher section, footer, JSON-LD (`build.py`). A change script should grep for the old value and replace all four.

---

## 3. Relationships

```
teacher 1 ──< batch (all batches belong to the single teacher)
teacher 1 ──< method_example, testimonial, note_sheet
batch   1 ──< result (a result cites one batch, demo only)
```

No many-to-many. No joins at runtime.

---

## 4. Indexes, RLS, ownership

Not applicable — there is no query engine. Ownership is filesystem ownership of the repository.

---

## 5. Sensitive data handling

| Data | Sensitivity | Handling |
|---|---|---|
| Teacher's public phone / Facebook / map pin | public by design | printed and in schema |
| Student names in testimonials/results | **demo/fictional** | labelled "ডেমো" in the footer |
| Real student names, marks, guardians' numbers | **must never be committed** | if ever added: first name + initial, written consent, or keep it off the site |
| Visitor data | none collected | no analytics, no cookies |

**Rule:** never put a real minor's name + school + marks together on a public page. That is a safeguarding decision, not a legal nicety.

---

## 6. Migration & seed strategy

- **Seed** = the current `_src/` content (demo values, clearly flagged).
- **Migration** = an edit + rebuild. There is no schema to migrate.
- When the owner supplies real data, do a single "content migration" pass:
  1. replace fees/schedules/seats in `#batches`
  2. replace demo results with real rolls **or** delete the results section
  3. replace/delete demo testimonials
  4. update the footer credit line ("ডেমো" → real)
  5. rebuild, verify, redeploy

---

## 7. Backup & recovery

| What | How |
|---|---|
| Source | git repository (GitHub/GitLab); every `dist/` deploy is also an immutable Vercel deployment |
| Restore | `git checkout` any commit → rebuild → redeploy (≈ 1 minute) |
| Catastrophic | the repo is small (< 5 MB excluding `uploads/`); keep a zip in Dropbox/Drive |
| Data loss risk | only the repo — nothing user-generated exists to lose |

---

## 8. If a database is ever required (future, NOT MVP)

Only if the owner wants to **stop using WhatsApp for booking** or run a **student portal**. Minimum viable schema (Postgres / Supabase), ~3 tables:

```sql
-- enquiries: one row per booking attempt
create table enquiries (
  id uuid primary key default gen_random_uuid(),
  student_name text not null check (char_length(student_name) between 2 and 80),
  guardian_phone text not null check (guardian_phone ~ '^01[3-9][0-9]{8}$'),
  class_level smallint not null check (class_level between 6 and 12),
  batch_id uuid not null references batches(id),
  status text not null default 'new' check (status in ('new','contacted','booked','lost')),
  created_at timestamptz not null default now()
);

-- batches: single source of seats
create table batches (
  id uuid primary key default gen_random_uuid(),
  name_bn text not null unique,
  fee_bdt integer not null check (fee_bdt between 500 and 20000),
  seats_cap smallint not null default 12 check (seats_cap between 1 and 30),
  seats_taken smallint not null default 0,
  is_active boolean not null default true,
  constraint seats_within_cap check (seats_taken <= seats_cap)
);

-- admin_users: the only authenticated role
create table admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner'))
);
```

Then and only then: RLS on every table (`admin_users` only), no public read of `enquiries`, server-side validation, rate limiting, and a written retention policy (delete `lost` rows after 90 days). **Do not build this now** — it contradicts PRD §13 out-of-scope.
