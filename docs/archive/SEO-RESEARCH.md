# SEO Research → Implementation Register

> **Purpose.** Nine published SEO resources were read; this file records **what each one actually says**,
> **what is already done** in this project, **what is still open**, and **what was deliberately skipped as useless
> for a one-page local business site**.
> **Owner:** প্রান্ত রায় · **Canonical host:** `https://mathacademydarsana.vercel.app`
> **Last updated:** 2026-10-25 (v7)

---

## 1. Sources read

| # | Source | Core thesis that mattered here |
|---|---|---|
| 1 | Semrush — *What Is Search Intent?* | Google classifies **intent before relevance**. Four types: informational, navigational, commercial, transactional. One page cannot serve two intents well. |
| 2 | Semrush — *SEO Basics* | SEO = crawl → understand → rank → **convert**. Technical health is the floor, not the ceiling. |
| 3 | Michigan Tech — *Six Ways to Improve SEO* | **One keyword phrase per page**; if you want a second phrase you need a **second page**. Repeat the phrase in the opening and closing paragraph. |
| 4 | Digital Climax — *SEO tips* | Local/business hygiene: consistent NAP, fast mobile, descriptive file names, internal links with intent-bearing anchors. |
| 5 | Webflow — *Website SEO* | Page experience is a ranking input: Core Web Vitals, mobile-first layout, clean semantic HTML. |
| 6 | Moz — *What is SEO* | Authority is earned off-page: citations, reviews, links. On-page can only *enable* it. |
| 7 | Backlinko — *SEO Best Practices 2026* | Main keyword **early** (title + first 100 words); unique title/description per page; **optimize images**; **internal linking**; **AI visibility** (be quotable). |
| 8 | Elementor — *Best SEO tips* | Content freshness, internal linking, image compression, schema, and page speed beat tricks. |
| 9 | *(repeat of 4)* | — |

**Reading distilled to one line:** a single landing page can only ever rank for **one intent**;
to rank for more it needs **more pages**, each with **one phrase**, each **linked** to the others, each with
**schema** and a **short, quotable answer**.

---

## 2. Implementation register

Legend: **DONE** shipped and verified · **OPEN** not done yet · **SKIP** deliberately not doing (with reason)

### 2.1 Foundational (Semrush basics, Moz, Backlinko)

| Item | State | Where |
|---|---|---|
| Crawlable single-page site, no JS-gated content | **DONE** | `dist/index.html` |
| One unique `<title>` (53 chars) + description (134 chars) | **DONE** | `_src/build.py` head |
| Main keyword early — brand + place are in the H1 sub-line and first 100 words | **DONE** | `_src/02-top.html` |
| Semantic HTML: header/nav/main/section/footer, one H1, H2 per section | **DONE** | all `_src/*.html` |
| Clean URLs, no query-string navigation | **DONE** | `vercel.json` → `cleanUrls` |
| HTTPS + HSTS + security headers | **DONE** | `vercel.json`, `docs/SEO-SECURITY-CONFIG.md` |
| Mobile-first layout (320–1440 verified, 0 overflow) | **DONE** | `_src/site.css` |
| Core Web Vitals: CLS 0.001, LCP 2.8s, TBT ~150–390ms | **PARTLY** | see 2.6 — LCP is font-bound |
| NAP consistency (name/place/phone identical everywhere + schema) | **DONE** | footer + JSON-LD `#org` |

### 2.2 Intent & keyword architecture (Semrush intent, MTU rule)

The MTU rule ("separate page per keyword phrase") is why the **`/guide/` section exists** — three pages, three
different intents. This is the single biggest structural change in v7.

| Page | Intent | Phrase it owns |
|---|---|---|
| `/` | **Transactional / visit-in-person** | ম্যাথ একাডেমি দর্শনা · SSC গণিত শিক্ষক |
| `/guide/ssc-gonit-kon-odhyay-age/` | **Informational** (student) | SSC গণিত অধ্যায় ক্রম |
| `/guide/gonite-durbal-shishu-30-diner-rutin/` | **Informational** (parent, anxiety) | গণিতে দুর্বল ছাত্র |
| `/guide/darshana-ssc-gonit-coaching-7-proshno/` | **Commercial investigation** | দর্শনায় SSC গণিত কোচিং |

| Item | State | Note |
|---|---|---|
| Keyword map written down, one phrase per page | **DONE** | `docs/SEO-PLAYBOOK.md` §1 + `_src/blog/posts.py` `keyword` field |
| Each guide page: phrase in H1, first paragraph, ≥1 H2, `<title>`, description, `keywords` in JSON-LD | **DONE** | generated |
| Topic cluster: hub `/guide/` ↔ posts ↔ homepage sections | **DONE** | breadcrumbs + "আরও পড়ুন" + footer link |
| Homepage internal links carry intent-bearing anchor text | **DONE** | "গণিত গাইড (লেখা)" etc. |
| Long-tail conversational questions answered verbatim | **DONE** | homepage FAQ (5Q) + each post's FAQ (3Q each) |

### 2.3 On-page and content (Backlinko, Elementor, MTU)

| Item | State | Note |
|---|---|---|
| Unique title/description on **every** URL (404 excluded, `noindex`) | **DONE** | 5 indexable URLs |
| Keyword in the first 100 words of every page | **DONE** | verified in the three posts |
| Content freshness signal (`dateModified`) | **DONE** | JSON-LD + visible "প্রকাশ / হালনাগাদ" line |
| Author attribution with real name, role, employer (`Article.author` Person) | **DONE** | `_src/blog/posts.py` |
| Images: descriptive file names + `alt` + width/height | **DONE** | `assets/i*.{webp,png,jpg}` |
| Internal links ≥3 per post | **DONE** | breadcrumb + 2 cards + CTA + footer |
| One `<h1>` per page | **DONE** | verified |
| Article word count 800+ Bengali characters-equivalent | **DONE** | ~2,400–2,800 chars each |

### 2.4 Technical (Elementor, Webflow, Digital Climax)

| Item | State | Note |
|---|---|---|
| `sitemap.xml` with all indexable URLs | **DONE** | generated, never drifts from pages |
| `robots.txt` + absolute sitemap line | **DONE** | |
| Canonical + `hreflang` on every indexable page | **DONE** | |
| Structured data: Organization/Person/Course/FAQ/Breadcrumb/Article | **DONE** | 6 nodes on `/`, 4 per guide page |
| `llms.txt` + `llms-full.txt` (AI visibility) | **DONE** | generated on every build |
| `.well-known/security.txt`, `humans.txt` | **DONE** | |
| 404 with real 404 status + `noindex` | **DONE** | `dist/404.html` |
| Web app manifest (PWA install) | **SKIP** | no service worker planned — would fight the "offline single file" model |
| `ads.txt` / `app-ads.txt` | **SKIP** | **this site shows no ads and has no app**; the files exist only to authorise ad sellers. Adding them empty is harmless but pointless; add the moment AdSense is ever enabled |
| AMP | **SKIP** | deprecated signal, would double the maintenance |
| Multilingual `hreflang` set | **SKIP** | one language (`bn-BD`); a fake `en` page with no content would be a thin-content risk |

### 2.5 Off-page (Moz, Digital Climax) — **the real bottleneck now**

| Item | State | Why it matters |
|---|---|---|
| Google Business Profile (even as a service-area listing) | **OPEN** | biggest single local-ranking lever; needs the owner's address decision |
| Facebook page ↔ website cross-link | **OPEN** | the profile exists personally; a page would give clean NAP + reviews |
| Consistent NAP in local directories (Bangla + English) | **OPEN** | 3–5 citations are enough for a small area |
| Real parent reviews / testimonials (with permission) | **OPEN** | also feeds `Review` schema later |
| Backlinks from the school site / local news / coaching directories | **OPEN** | one or two relevant links outweigh 50 spam ones |
| Search Console + Bing Webmaster verification | **OPEN** | needs the deploy first (`docs/MONITORING.md`) |

### 2.6 Performance — the one genuinely unfinished technical item

| Metric | Now | Target | Blocker |
|---|---|---|---|
| LCP | 2.8 s | < 2.5 s | 91 KB Bengali webfont + 1.3 s branded intro (both are required by the design spec) |
| TBT | 150–390 ms | < 200 ms | GSAP parse + inline scripts |
| CLS | 0.001 | < 0.1 | **done** |

**Fix plan (needs owner approval — it changes the design):**
1. Subset the Bengali face again from the ~600 glyphs actually used → ~30 KB (saves ~60 KB of LCP path).
2. Move the lab/demo initialisation into `requestIdleCallback` (removes most of TBT).
3. Optional: shorten the intro from 1.3 s to 0.9 s.

---

## 3. What was deliberately *not* done, and why

| Tempting tactic | Why it is not here |
|---|---|
| Keyword-stuffed H1 ("দর্শনা চুয়াডাঙ্গা SSC গণিত কোচিং …") | Google's title/H1 guidance and helpful-content update punish it; it also reads badly to a parent |
| 20 thin location pages ("গণিত কোচিং চুয়াডাঙ্গা", "…দামুড়হুদা" …) | no unique content per page → doorway-page risk. A page earns its place only if the teacher can write something only he knows |
| Blog cadence of 3 posts/week | the owner cannot sustain it; two good posts a month beat twelve rewritten ones |
| Buying backlinks / link exchange | Moz: authority must be earned; a manual action would wipe the local gains instantly |
| AI-generated bulk FAQ on every topic | every answer here is something the teacher can defend in person — that is the only durable advantage |
| Cookie banner / analytics script | there is no tracking; adding one would need consent UX, a CSP exception and a privacy policy rewrite |

---

## 4. Next 30 / 60 / 90 days

| Window | Action | Owner |
|---|---|---|
| **Day 0** | Deploy to Vercel, verify `sitemap.xml` + robots in Search Console, submit sitemap | developer |
| Day 1–7 | Real fee/hours/seats content; school-permission decision; **Google Business Profile** | owner |
| Day 8–30 | Publish 2 more guides: "মক টেস্ট কীভাবে বিশ্লেষণ করবেন", "ক্লাস ৬–৭ গণিতের ভিত" | owner + developer |
| Day 31–60 | 3 local citations, Facebook page, 3 real reviews, second internal-link pass | owner |
| Day 61–90 | Font subsetting + LCP pass; first Search Console review; decide on a custom domain | developer |
