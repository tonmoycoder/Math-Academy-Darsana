# BLOG-CONTENT-PLAN — ten researched articles, one source of truth

**Audience:** the owner, editor, or AI writer responsible for the Math Academy blog.
**Last updated:** 2026-10-26 · **Status:** ten-post implementation, browser QA, release audit, and Dropbox archive are complete; see `ai/current-state.md` for current release metadata and the production caveat.
**Source of truth:** `docs/blog-drafts/*.md` (exactly ten articles; `README.md` is the writing contract).
**Master instructions:** `docs/START-HERE.md` wins if another document conflicts.

[ASSUMPTION] The primary audience is Bengali-speaking students and parents in Darshana/Chuadanga. Some articles target national SSC intent, but must remain useful to learners regardless of whether they join the academy.

[DECISION NEEDED] A future article may be added only if the owner explicitly replaces one of the existing ten or changes the exact-ten requirement. Never make this an eleven-post blog by appending a draft.

---

## 1 · Product contract

The published blog consists of exactly ten full article routes and one hub:

- Homepage: exactly four curated cards, with the button **«আরও ব্লগ দেখুন»** linking to `/blog/`.
- Hub: `/blog/`, showing the same article set and providing the full list.
- Articles: `/blog/<slug>/`, with each complete Markdown article rendered on its own slug route.
- Drafts: `docs/blog-drafts/01-*.md` through `10-*.md`; the Markdown files are the editorial source of truth.

`_src/build.py` enforces ten draft files, unique slugs, required metadata, and exactly three FAQ pairs per article. It renders the public region only. Do not edit generated `dist/` files or reintroduce the legacy `_src/blog/posts.py` sources.

## 2 · Files, routes, and editorial intent

| # | Slug | Primary intent | Featured on home? |
|---:|---|---|:---:|
| 1 | `gonit-valo-kore-podar-upay` | How a student can study math more effectively | Yes |
| 2 | `ssc-goniter-sob-sutro` | Formula reference plus dated 2026 syllabus/marks map | Yes |
| 3 | `goniter-voy-katanor-7-obhyas` | Supportive response to math anxiety; no diagnosis or cure claim | Yes |
| 4 | `gonite-durobolota-katanor-upay` | Identify the actual skill gap, then plan targeted practice | No |
| 5 | `gonit-practice-sera-upay` | Practice methods and a weekly routine | Yes |
| 6 | `darshanay-math-academy-keno` | Useful local academy explainer; careful with outcome claims | No |
| 7 | `ssc-gonit-kon-odhyay-age` | Learning sequence for SSC math; verify current syllabus | No |
| 8 | `gonite-durbal-shishu-30-diner-rutin` | Flexible, illustrative 30-day foundation routine | No |
| 9 | `ashtom-shrenir-gonit-vit` | Class-eight prerequisite skills and school-year book check | No |
| 10 | `jessore-board-ssc-gonit-prashna` | Dated official 2026 SSC structure for a local search query | No |

Exact filenames, primary keywords, the Markdown contract, and AI handoff rules are in `docs/blog-drafts/README.md` and in each draft's front matter.

## 3 · Search intent and ranking approach

No search-volume numbers have been invented. Prioritize queries by what the reader needs, then make each page answer that need more completely and accurately than a generic formula list:

| Intent group | Example query | Main answer route |
|---|---|---|
| Study method | গণিত ভালো করার উপায় | `/blog/gonit-valo-kore-podar-upay/` |
| SSC reference | SSC গণিতের সব সূত্র, SSC গণিত ২০২৬ মানবণ্টন | `/blog/ssc-goniter-sob-sutro/` |
| Emotional/parent support | গণিতের ভয় কাটানোর উপায় | `/blog/goniter-voy-katanor-7-obhyas/` |
| Skill diagnosis | গণিতে দুর্বলতা কাটানোর উপায় | `/blog/gonite-durobolota-katanor-upay/` |
| Practice routine | গণিত প্র্যাকটিস করার নিয়ম | `/blog/gonit-practice-sera-upay/` |
| Local commercial | দর্শনায় গণিতের কোচিং | `/blog/darshanay-math-academy-keno/` |
| Chapter sequence | SSC গণিত কোন অধ্যায় আগে | `/blog/ssc-gonit-kon-odhyay-age/` |
| Parent plan | গণিতে দুর্বল শিক্ষার্থীর রুটিন | `/blog/gonite-durbal-shishu-30-diner-rutin/` |
| Foundation | অষ্টম শ্রেণির গণিতের ভিত | `/blog/ashtom-shrenir-gonit-vit/` |
| Local board long-tail | যশোর বোর্ড SSC গণিত ২০২৬ | `/blog/jessore-board-ssc-gonit-prashna/` |

[ASSUMPTION] Search intent is judged qualitatively; traffic or ranking is never guaranteed. The board article explains NCTB's national 2026 structure and does not claim a separate Jashore-only marking scheme.

## 4 · Research and trustworthy answer-engine content

Every article should be useful when read alone and safe for another AI to summarize:

1. Answer the title question directly in the first paragraph.
2. Put a year next to year-specific exam facts; link the primary NCTB/board source at the relevant section.
3. Separate official facts from practice examples and recommendations.
4. Use descriptive headings, correct tables, examples, and practical next steps; do not add a table only as SEO decoration.
5. Include exactly three real FAQs. Keep their answers in the body and the FAQ schema in the generated page synchronized.
6. Link to relevant articles using descriptive Bengali anchor text, and verify every slug exists in this ten-post set.
7. Do not promise marks, guarantee exam questions, claim a treatment for anxiety, or claim an intervention is proven if evidence quality does not support that.
8. Treat schema, sitemap, canonical metadata, article routes, and `llms.txt` as generated build output; verify them after a build.

### 4.1 · Primary sources already used

- NCTB SSC 2026 notice/archive: <https://nctb.gov.bd/pages/notices/6922e919dbfbab28ce0abfac>
- NCTB SSC 2026 subject-wise marks PDF: <https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-nctb/2024/12/a86c5e8c48464604938faeb805500453.pdf>
- NCTB SSC 2026 syllabus ZIP, including `5. Math_SSC_2026.pdf`: <https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-nctb/2024/12/a68d34aceea6453aa478c765c1892b8e.zip>
- NCTB 2026 class-eight textbook list: <https://nctb.gov.bd/pages/static-pages/695b9858c4774958d7b703d8>
- Institute of Education Sciences, *Organizing Instruction and Study to Improve Student Learning*: <https://ies.ed.gov/ncee/wwc/PracticeGuide/1>
- Institute of Education Sciences, *Assisting Students Struggling with Mathematics: Intervention in the Elementary Grades*: <https://ies.ed.gov/ncee/wwc/Docs/PracticeGuide/WWC2021006-Math-PG.pdf> (its scope is elementary grades; do not present it as a secondary-school protocol).
- PubMed PMID 37689437, meta-analysis on math-anxiety interventions: <https://pubmed.ncbi.nlm.nih.gov/37689437/> (17 studies / 1,786 K–12 students; interpret cautiously because differences were not statistically significant after accounting for study quality).

## 5 · Draft format and AI handoff

Follow `docs/blog-drafts/README.md` exactly. Each draft has:

- front matter: `slug`, `tag`, `title`, `h1`, `desc`, `keyword`, `date`, `updated`, `mins`;
- numbered, non-public author notes, with `[ASSUMPTION]` and `[DECISION NEEDED]` where appropriate;
- one `PUBLISH_BODY_START/END` region for reader-facing copy;
- one FAQ region with exactly three question/answer pairs;
- numbered source/evidence notes outside the public-body markers.

The renderer is deliberately small and dependency-free. Use only the supported Markdown documented in the README. Do not put scratch notes or editorial QA comments in the public region.

## 6 · Current build and verification checklist

From the project root:

1. `python3 _src/build.py --publish` — build succeeds from the ten Markdown drafts.
2. Check `dist/blog/index.html` shows exactly ten article cards and three introductory path cards.
3. Check exactly ten `dist/blog/<slug>/index.html` article routes; each has its own full body, metadata, FAQ and Breadcrumb/Article JSON-LD.
4. Check `dist/index.html` has exactly four `postcard` cards, the CTA text **«আরও ব্লগ দেখুন»**, and the CTA target `/blog/`.
5. Check all ten routes are included in `dist/sitemap.xml` and `dist/llms.txt`; verify each internal blog link resolves.
6. View `/`, `/blog/`, and every article route at phone and desktop widths. Tables must scroll inside the article rather than widening the page; Bengali digits/headings must not be clipped.
7. Check article/hub layout, footer developer credit, SSL badge, and shared sound behavior. Browser autoplay may be policy-gated; never add a prompt, banner, or permission UI to work around it.
8. Run the main test suite and relevant Lighthouse/route checks from `docs/START-HERE.md` and `docs/TEST-PLAN.md`.
9. Only after verification, update `ai/current-state.md`, package the release, and re-upload it to the owner's Dropbox folder.

## 7 · Limits and decisions still open

- [DECISION NEEDED] Future yearly updates require the new official exam syllabus/marks documents and a build/route QA pass.
- [DECISION NEEDED] Do not add an eleventh topic; if the owner requests a change, confirm which existing article to replace.
- [ASSUMPTION] The class-eight article names prerequisite skills without hard-coding chapter numbers so it stays useful if textbook editions change.
- [ASSUMPTION] Search ranking cannot be guaranteed; accurate sourcing, useful content, technical SEO, and correct indexing are the controllable inputs.
