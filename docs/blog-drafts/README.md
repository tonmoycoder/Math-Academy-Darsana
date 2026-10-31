# Blog Drafts — writer and AI handoff

**Audience:** a human editor or another AI preparing a publishable article for ম্যাথ একাডেমি, দর্শনা.
**Status:** this directory is the sole source of truth for the public blog copy.
**Rules:** exactly ten draft files / ten article routes; four curated landing-page cards; no extra post without an explicit decision to replace one.

[ASSUMPTION] Readers are Bengali-speaking students and parents in Darshana/Chuadanga, with some national SSC-search intent.

[DECISION NEEDED] Confirm a new exam year's official syllabus and marks distribution before updating year-specific articles; never carry a prior year's data forward by guess.

---

## 1 · What lives here

The ten numbered Markdown files are the complete editorial source for the ten public article routes. `_src/build.py` reads these files at publish-build time, renders their marked public sections, and generates:

- `/blog/` — one hub containing all ten articles;
- `/blog/<slug>/` — one complete, separately addressable article page per draft slug;
- four curated article cards on `/` and the CTA “আরও ব্লগ দেখুন” linking to `/blog/`.

Do not add a post to `_src/blog/posts.py` or `_src/blog/posts_v11.py`; those are legacy files and are not loaded by the current blog builder. Do not hand-edit `dist/blog/` or generated HTML.

## 2 · Draft contract — keep the parser happy

Every article file must contain valid, simple front matter with these required keys:

```yaml
---
slug: unique-lowercase-hyphenated-id
tag: "বাংলা বিষয়-ট্যাগ"
title: "SEO title"
h1: "Visible article heading"
desc: "Accurate summary for search and cards"
keyword: "Primary phrase, close variants"
date: 2026-10-26
updated: 2026-10-26
mins: 8
---
```

`slug` must be unique and must match the route; `mins` is an integer. Quote Bengali strings. Do not put `:` followed by an unquoted ambiguous value in front matter. The build currently expects exactly ten `*.md` files other than this `README.md`.

The rest of each file has two zones:

1. **AI handoff / editorial notes** before the public marker. Use numbered headings and label uncertainty explicitly with `[ASSUMPTION]` or `[DECISION NEEDED]`.
2. **Public article**, bounded by `<!-- PUBLISH_BODY_START -->` and `<!-- PUBLISH_BODY_END -->`. Only this marked region is rendered. Do not leave editorial QA comments, multilingual scratch text, or uncited research notes inside it.

Within the public region, include a single `<!-- FAQ_START -->` / `<!-- FAQ_END -->` block containing exactly three `### Question` headings with a non-empty answer after each. The build fails if there are not exactly three pairs.

## 3 · Markdown supported by this build

Use plain Markdown supported by the in-repo renderer: headings `##`–`####`, paragraphs, ordered/unordered lists, tables, blockquotes, horizontal rules, inline links, `**bold**`, `*emphasis*`, and backtick code. Keep tables narrow enough for a 360 px phone; the article stylesheet provides a horizontally scrollable table wrapper. Avoid raw HTML, nested lists, footnotes, image syntax, and unsupported plugins unless the renderer is deliberately extended and tested.

Use Bengali digits for visible Bengali prose when appropriate. Greek letters and Latin symbols inside formulas are intentional. Proofread for accidental characters from other scripts, broken Unicode, inconsistent transliteration, and year/mark mismatches.

## 4 · Research, factual claims, and sourcing

1. Prefer primary sources: NCTB and education-board notices for syllabus/marks; peer-reviewed research and evidence summaries for learning advice.
2. Link the source near the claim and list it again after the public body in a numbered `Sources and evidence notes` section.
3. State the year next to any syllabus or marks information. Add a clear update reminder for future years.
4. Distinguish official facts from practical examples, editorial recommendations, and assumptions. Never invent search volume, ranking, results, endorsements, student outcomes, or exact exam questions.
5. Research supports useful guidance; it does not guarantee marks, cure anxiety, or predict what a board will ask.
6. Recheck internal links against the ten live slugs. Every link to an article must resolve to `/blog/<one-of-the-ten-slugs>/`.

[ASSUMPTION] Search-intent priorities are qualitative (student usefulness, likely query intent, local relevance), not based on fabricated search-volume estimates.

## 5 · SEO and student usefulness checklist

- One primary query intent per article; write a direct answer in the opening paragraph.
- Match `title`, `h1`, `desc`, `keyword`, and slug to that intent naturally; avoid keyword stuffing.
- Use descriptive section headings, examples, a table/checklist when it genuinely clarifies the idea, and actionable next steps.
- Link to two or three related articles where relevant, using meaningful Bengali anchor text.
- Keep limits and dated context visible. Do not imply a promised result or guaranteed rank.
- Make the article complete and formatted on its own route; a card summary is not a substitute for the full Markdown article.
- Preserve the academy's exact public facts if it is relevant: teacher প্রান্ত রায়, দর্শনা আইডিয়াল স্কুল, WhatsApp +880 1641-045469, Facebook `pranto.rai.37`, and Darshana/Chuadanga. Avoid unrelated business claims.

## 6 · Source and build workflow

1. Read `docs/START-HERE.md` first, then `docs/BLOG-CONTENT-PLAN.md` and this file.
2. Read the current article and the relevant primary source before editing it.
3. Edit the numbered Markdown draft; preserve front matter and marker structure.
4. Confirm exactly ten drafts, ten unique slugs, three FAQ pairs each, and no broken internal article links.
5. Run `python3 _src/build.py --publish` from the project root. Fix parser errors at the draft source, then rebuild.
6. Inspect `/`, `/blog/`, and each article route on desktop and mobile; verify the CTA, sound behavior, visible Bengali, table overflow, metadata, and links.
7. Update `docs/BLOG-CONTENT-PLAN.md`, `docs/CONTENT.md`, `docs/PROJECT-MAP.md`, `docs/START-HERE.md`, and `ai/current-state.md` whenever the implementation changes.
8. Before release, follow the project master brain's test and Dropbox package checklist. Do not upload an untested intermediate build.

## 7 · The ten current article drafts

| # | File / slug | Reader intent |
|---:|---|---|
| 1 | `01-gonit-valo-kore-podar-upay.md` / `gonit-valo-kore-podar-upay` | Effective math-study habits |
| 2 | `02-ssc-goniter-sob-sutro.md` / `ssc-goniter-sob-sutro` | SSC formulas, official 2026 syllabus and marks reference |
| 3 | `03-goniter-voy-katanor-7-obhyas.md` / `goniter-voy-katanor-7-obhyas` | Supportive habits for math anxiety, without diagnosis claims |
| 4 | `04-gonite-durobolota-katanor-upay.md` / `gonite-durobolota-katanor-upay` | Diagnose the learning gap and plan targeted practice |
| 5 | `05-gonit-practice-sera-upay.md` / `gonit-practice-sera-upay` | Evidence-informed math practice routine |
| 6 | `06-darshanay-math-academy-keno.md` / `darshanay-math-academy-keno` | Local academy explainer with cautious outcome claims |
| 7 | `07-ssc-gonit-kon-odhyay-age.md` / `ssc-gonit-kon-odhyay-age` | SSC chapter sequence; check the current syllabus |
| 8 | `08-gonite-durbal-shishu-30-diner-rutin.md` / `gonite-durbal-shishu-30-diner-rutin` | A flexible 30-day routine for building foundations |
| 9 | `09-ashtom-shrenir-gonit-vit.md` / `ashtom-shrenir-gonit-vit` | Class-eight math skills that support later learning |
| 10 | `10-jessore-board-ssc-gonit-prashna.md` / `jessore-board-ssc-gonit-prashna` | Dated 2026 SSC pattern; not a Jashore-only structure or prediction |

The landing page features exactly #1, #2, #3, and #5. The other six remain discoverable on the hub and through related-article links.

## 8 · Current known caveats

- The 2026 SSC article facts are year-specific. Review them against the latest official NCTB/board documents before a later exam year.
- Drafts are human-editable sources, not a promise that a claim has already passed visual or final build QA. Check the release record in `ai/current-state.md`.
- The old `_src/blog/posts.py` and `_src/blog/posts_v11.py` may contain superseded copy and are not part of the published ten-article set.
