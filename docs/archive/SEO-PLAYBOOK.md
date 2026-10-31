# SEO-PLAYBOOK.md — historical local SEO draft

> **ARCHIVED / NOT CURRENT:** examples below include a 12-student cap, seat-booking promises, weekly guardian reports and other unverified copy. The current owner-approved cap is 15; WhatsApp requests information only. Use `docs/START-HERE.md` and the active SEO/content docs; do not publish this historical copy.
>
> [ASSUMPTION] The preserved material is useful only for history and may contain obsolete claims.
>
> [DECISION NEEDED] Obtain owner approval and re-verify every fact before adapting any archived text.
>
> Written against the old deployed snapshot: a static one-pager on a free Vercel subdomain, one teacher, one locality.
> Companion: `PRD.md` §9 (acceptance criteria) · `docs/CDN-REFERENCES.md` (tools) · `llms.txt` (AI fact sheet).

---

## 0. The honest strategy in one paragraph

You cannot out-rank a school website or a Facebook page on generic terms ("গণিত শিক্ষক"). You **can** own the long, specific, high-intent searches where the answer is a *person in a place*: "দর্শনার ম্যাথ টিউটর", "ক্লাস ৬–১০ গণিত প্রাইভেট দর্শনা", "দর্শনা আইডিয়াল স্কুল গণিত স্যার". So the plan is: (1) make the page the best factual answer for those queries, (2) put the same NAP everywhere Google looks (site, schema, Google Business Profile, Facebook), (3) earn 5–10 local reviews, (4) publish one page — because a thin subdomain ranks on *entity clarity*, not volume.

**Reality check on the subdomain:** `math-academy-darsana.vercel.app` can rank, but a real domain (≈৳1,200/yr) always outperforms it for trust and click-through. Treat the subdomain as v1 and the domain as the first upgrade — the build already centralises the canonical URL in one constant.

---

## 1. Keyword strategy

### 1.1 Primary brand keywords (own these completely)

| Bangla | English / transliteration | Intent |
|---|---|---|
| ম্যাথ একাডেমি | Math Academy | brand |
| ম্যাথ একাডেমি দর্শনা | Math Academy Darshana | brand + geo |
| প্রান্ত রায় / প্রান্ত রায় স্যার | Pranto Roy / Pranto Rai | person |
| দর্শনা আইডিয়াল স্কুল গণিত শিক্ষক | Darshana Ideal School math teacher | person + institution |

### 1.2 Local / geo-targeted (the money keywords)

- দর্শনার ম্যাথ টিউটর · দর্শনায় গণিত শিক্ষক · দর্শনা গণিত কোচিং
- চুয়াডাঙ্গা গণিত শিক্ষক · চুয়াডাঙ্গা ম্যাথ টিউটর · দামুড়হুদা গণিত ক্লাস
- দর্শনা SSC গণিত প্রাইভেট · দর্শনা ক্লাস ৬–১০ গণিত · SSC Math Private Darshana
- দর্শনা আইডিয়াল স্কুলের গণিত স্যার · দর্শনার সেরা গণিত স্যার
- ম্যাথ একাডেমি চুয়াডাঙ্গা · দর্শনা ম্যাথ ব্যাচ

### 1.3 Service / niche keywords

- SSC ২০২৭ গণিত কোচিং · ক্লাস ৬–১০ গণিত ব্যাচ দর্শনা
- ক্লাস ৮–৯ গণিত ব্যাচ · ১২ জনের ছোট ব্যাচ গণিত
- জ্যামিতি প্রমাণ শেখানো · ত্রিকোণমিতি সহজ নিয়ম · মুখস্থ ছাড়া গণিত
- গাণিতিক যুক্তি কোর্স (parents care about "why", not "which book")

### 1.4 Long-tail conversational (what parents actually type — feed these to the FAQ)

- "আমার ছেলের গণিত খুব দুর্বল, দর্শনায় কোথায় পড়াবো?"
- "দর্শনায় SSC গণিতের প্রাইভেট কোচিং কোথায় ভালো?"
- "ক্লাস ১০-এ গণিত সহজে বোঝার উপায় কী?" → the method lab answers this
- "দর্শনা আইডিয়াল স্কুলের গণিত শিক্ষকের নাম কী?"
- "১২ জনের ব্যাচে গণিত পড়ালে কী লাভ?" → the batches section answers this
- "ম্যাথ একাডেমির ফি কত?"

**Rule:** one page = one page of answers. Each long-tail question must have a visible, plain-language answer on the page (or in the FAQ), because AI answer engines quote the sentence, not the keyword.

---

## 2. On-page elements

### 2.1 `<title>` — three options

1. **`ম্যাথ একাডেমি দর্শনা | SSC ও ৬–১০ গণিত · প্রান্ত রায়`** *(in use, 53 chars)* — brand + scope + name + location.
2. `প্রান্ত রায় · দর্শনা গণিত শিক্ষক | Math Academy` *(50)* — person-first, best if people search the name.
3. `SSC ও ক্লাস ৬–১০ গণিত কোচিং দর্শনা | ম্যাথ একাডেমি` *(51)* — service-first, best for cold local queries.

### 2.2 `<meta name="description">` — three options (≤150 chars, Bengali, with a call action)

1. **`দর্শনার ম্যাথ একাডেমি — SSC ও ক্লাস ৬–১০ গণিতের ছোট ব্যাচ (১২ জন)। শিক্ষক প্রান্ত রায়, দর্শনা আইডিয়াল স্কুল। সিট বুকিং ০১৬৪১-০৪৫৪৬৯।`** *(134 — in use)*
2. `দর্শনায় SSC ও ক্লাস ৬–১০ গণিত প্রাইভেট — ১২ জনের ব্যাচ, প্রতি শনিবার অভিভাবক রিপোর্ট। প্রান্ত রায় (দর্শনা আইডিয়াল স্কুল)। ০১৬৪১-০৪৫৪৬৯।`
3. `গণিত মুখস্থ নয় — যুক্তির ভাষা। দর্শনা আইডিয়াল স্কুলের শিক্ষক প্রান্ত রায়ের ম্যাথ একাডেমি, SSC ও ক্লাস ৬–১০ ব্যাচ। সিট আছে কি না জানুন ০১৬৪১-০৪৫৪৬৯।`

> Options 2 and 3 are ready to swap into `_src/build.py` if you prefer them; each is written to survive Google's truncation.

### 2.3 On-page placement (already implemented, keep it this way)

| Element | Content |
|---|---|
| `<h1>` | "গণিত মুখস্থ নয় — এটা যুক্তির ভাষা" (brand promise, not a keyword soup) |
| First 100 words | contains ম্যাথ একাডেমি, দর্শনা, SSC, ক্লাস ৬–১০, প্রান্ত রায়, ১২ জন |
| H2s | কেন আমরা · পদ্ধতি · হাতে-কলমে ল্যাব · শিক্ষক পরিচিতি · ব্যাচ ও আসন · লাইব্রেরি · ফলাফল |
| About block | 3 paragraphs with school, degrees, 10+ years, phone |
| Footer | NAP block + phone + map + Facebook |
| Images | `alt="প্রান্ত রায় — ম্যাথ একাডেমির শিক্ষক, দর্শনা চুয়াডাঙ্গা"` |
| Internal anchors | nav uses descriptive Bengali labels, not "এখানে ক্লিক করুন" |

---

## 3. JSON-LD (deployed)

The live `@graph` contains 6 nodes and is generated in `_src/build.py` (`LD` dict). Key relationships to keep intact:

- `EducationalOrganization` + `LocalBusiness` (one node, two types) → `telephone: +8801641045469`, `hasMap` = your Maps link, `areaServed` = দর্শনা/চুয়াডাঙ্গা, `openingHoursSpecification`, `sameAs` = Facebook profile, `founder` → the Person node.
- `Person` → `worksFor` **both** the school (`https://www.darsanaidealschool.com/`) and the academy; `sameAs` = the Facebook profile; `telephone`; `knowsAbout` lists "SSC গণিত" and "ক্লাস ৬–১০ গণিত" (no HSC — out of scope).
- `Course` → three `CourseInstance`s (SSC ২০২৭, ক্লাস ৬–৭ ভিত্তি, ক্লাস ৮–৯ প্রগ্রেস).
- `FAQPage` → 5 questions, each a real on-page answer.
- `BreadcrumbList` → হোম → শিক্ষক → ব্যাচ → বুকিং.

**Do not** mark up `AggregateRating` or testimonials as `Review` until the reviews are real and attributable — fake review markup is a manual-action risk.

**Advanced option (after the domain is live):** add `"@type": "Person"` `"@id"` to every mention and reference it with `"author"`/`"founder"`; add `"@type":"Place"` for the studio once you share the exact address.

---

## 4. "About the teacher" section (shipped, in the teacher block)

> **প্রান্ত রায়** — দর্শনা আইডিয়াল স্কুলের গণিত শিক্ষক, ম্যাথ একাডেমির প্রতিষ্ঠাতা।
>
> আমি প্রান্ত রায়। দর্শনা আইডিয়াল স্কুলে গণিত পড়াই, আর দর্শনার ম্যাথ একাডেমিতে SSC ও ক্লাস ৬–১০ শিক্ষার্থীদের জন্য ছোট ব্যাচে ক্লাস নিই। এক দশকের বেশি ক্লাসরুমে কাজ করে যে জিনিসটা বারবার দেখেছি — গণিতে পিছিয়ে পড়ার কারণ মেধা নয়, একটা বাদ পড়া ধাপ। তাই এখানে শুরুতেই ছবি আর উদাহরণ দিয়ে সেই ধাপটা পূরণ করা হয়, মুখস্থ করানো হয় না।
>
> গণিতে অনার্স ও মাস্টার্স পড়াশোনা, ১০+ বছরের ক্লাসরুম অভিজ্ঞতা — এই সময়ে শুধু ভালো ছাত্রদের নয়, যারা বলে "স্যার, পারি না" তাদের নিয়েই বেশি কাজ করেছি। প্রতি ব্যাচে সর্বোচ্চ ১২ জন, প্রতিটি খাতা নিজে ধরে দেখা হয়, আর প্রতি শনিবার অভিভাবককে সত্যি রিপোর্ট দেওয়া হয়।
>
> দর্শনা বা চুয়াডাঙ্গার আশপাশে থাকলে সিট খালি আছে কি না জেনে নিন — হোয়াটসঅ্যাপে লিখুন ০১৬৪১-০৪৫৪৬৯।

**Why it works:** name + school + subjects + locality appear in the first two sentences (entity clarity); the paragraphs answer "do you care about weak students?" (parent anxiety); the CTA is the phone number in Bengali digits, which is what a parent will tap.

---

## 5. Off-page work (this is where local ranking is actually won)

| # | Task | Owner | Frequency |
|---|---|---|---|
| 1 | **Google Business Profile** — category "Tutor/Coaching centre", exact NAP matching the site, hours, photos, the WhatsApp number, service area Darshana + Chuadanga | you | once, then monthly post |
| 2 | **Search Console** — verify the Vercel URL (DNS or HTML file), submit `sitemap.xml`, request indexing of `/` | you | once + after edits |
| 3 | **Facebook** — add the site link to your profile's contact info and to the academy page; keep name spelling identical to the schema | you | once |
| 4 | **Citations** — 3–5 Bangladeshi directories (school/coaching listings, Chittagong/Jashore-region business lists) with identical NAP | you | once |
| 5 | **Reviews** — ask 5–10 guardians for a Google review mentioning "গণিত" and "দর্শনা" (never write them yourself) | you | ongoing |
| 6 | **School page mention** — if the school has a teachers page, ask for a link (one quality backlink from a `.com.bd` school site is worth more than 50 directories) | you (with school) | once |
| 7 | **Answer engine check** — `uvx --from geo-optimizer-skill geo audit --url <site>` weekly; ask ChatGPT/Perplexity "দর্শনার ভালো গণিত শিক্ষক কে?" monthly | assistant | weekly/monthly |

---

## 6. Measurement

- GSC: impressions/clicks for the brand and local query sets; positions 8–20 become the next content targets (`gsc_query_opportunities`).
- Ask every WhatsApp lead "কীভাবে জানলেন?" — that single question is your real attribution.
- Monthly: Lighthouse on the live URL, `geo audit` score, GBP insights.


---

## v8 additions

- **Blog route is `/blog/`** and every post is linked from the homepage section `#blog` — that section is
  the internal-link hub the previous round was missing. It renders as real links on the host build and as
  non-linked cards (plus an "online only" note) inside the single-file offline copy.
- **Legacy `/guide/**` URLs** return a canonicalised, `noindex,follow` redirect stub, so old links and any
  crawled URLs collapse onto `/blog/` instead of 404-ing.
- **`llms.txt`** now lists `/blog/` and all six posts (it had been pointing at `/guide/`).
- **Sitemap** contains only canonical URLs: `/`, `/blog/`, six post URLs. `lastmod` comes from each post's
  `updated` field.
- **E-E-A-T**: every post credits প্রান্ত রায় as `author` with `jobTitle` + a link to `/#teacher`; the
  posts are written from classroom practice, not rewritten from a textbook.
