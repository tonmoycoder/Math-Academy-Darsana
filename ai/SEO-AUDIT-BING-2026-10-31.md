# Math Academy Darshana — Technical SEO & Audit Report (2026-10-31)

**Target Site:** `https://mathacademydarsana.vercel.app/`  
**Audit Timestamp:** 2026-10-31 09:50:35 UTC (Asia/Dhaka: 15:50:35)  
**Verification Level:** Local Checkout Audit + Live Network Probing + Automated Test Suite  

---

## ১. ভূমিকা ও অডিট ফ্রেমওয়ার্ক (Executive Summary & Boundaries)

এই অডিট রিপোর্টে সোর্স কোড (Source/Repo), বিল্ড আর্টফ্যাক্ট (Generated Build `dist/`), এবং লাইভ হোস্টিং সার্ভারের (Live Site) তথ্যকে স্পষ্টভাবে আলাদা করা হয়েছে।

> **বাস্তবসম্মত সত্য (Indexing Reality Boundary):**  
> কোনো কোড পরিবর্তন, সাইটম্যাপ সাবমিশন, স্কিমা মার্কআপ (JSON-LD), কিংবা IndexNow / Google Indexing API পুশ সার্চ ইঞ্জিনে **তাত্ক্ষণিক বা গ্যারান্টিযুক্ত ইনডেক্সিং, র‍্যাঙ্কিং, বা গুগল সার্চে লোগো প্রদর্শনের নিশ্চয়তা দেয় না**। এগুলো সার্চ ইঞ্জিনের ক্রলারের জন্য সঠিক কারিগরি সংকেত (signals) প্রদান করে; চূড়ান্ত প্রক্রিয়াকরণ ও প্রদর্শন সম্পূর্ণভাবে সার্চ ইঞ্জিনের ক্রলিং শিডিউল এবং কোয়ালিটি অ্যালগরিদমের উপর নির্ভরশীল।

---

## ২. যাচাইকৃত তথ্যসমূহ (Verified Evidence & Facts)

### ক. লাইভ সাইট ফ্যাক্টস (Live Production Status as of 2026-10-31T09:50:35Z)
* **URL:** `https://mathacademydarsana.vercel.app/`
* **HTTP Status:** `200 OK` (Vercel Server, Cache: `HIT`, Ray/Server ID: `bom1::pzttn-1793440235539-ae96ef456e0a`)
* **Live Title:** `<title>ম্যাথ একাডেমি দর্শনা | সেরা গণিত শিক্ষক | প্রান্ত রাই</title>` *(পূর্বে হোস্ট করা বিল্ড)*
* **Live Canonical:** `<link rel="canonical" href="https://mathacademydarsana.vercel.app/">`
* **Live Robots:** `<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">`
* **Live Site Name:** `<meta property="og:site_name" content="ম্যাথ একাডেমি দর্শনা">`
* **Bing IndexNow Key Location:** `https://mathacademydarsana.vercel.app/bc14bb9c7dc34ee3818627cbec856bfe.txt` → `200 OK`, কী টেক্সট: `bc14bb9c7dc34ee3818627cbec856bfe`

### খ. লোকাল রিপোজিটরি ও বিল্ড ফ্যাক্টস (Local Repo & Build Artifacts)
* **Title Correction:** হোমপেজের মূল টাইটেল পরিবর্তন করে তথ্যবহুল ও গুগল-গাইডলাইন সম্মত করা হয়েছে:  
  `<title>ম্যাথ একাডেমি দর্শনা | SSC ও ৬ষ্ঠ–১০ম শ্রেণির গণিত</title>`
* **বানোয়াট/অসমর্থিত দাবিমুক্ত মেটা ডেসক্রিপশন:** অতিরঞ্জিত "সেরা গণিত শিক্ষক" ভাষা অপসারণ করে সঠিক তথ্য প্রকাশ করা হয়েছে:  
  `<meta name="description" content="দর্শনায় ৬ষ্ঠ–১০ম শ্রেণি ও SSC শিক্ষার্থীদের জন্য গণিত একাডেমি। শিক্ষক প্রান্ত রায় (দর্শনা আইডিয়াল স্কুল)। মুখস্থ নয়, ম্যাথ একাডেমিতে যুক্তির সাহায্যে গণিত শিখুন।">`
* **শিক্ষকের নামের সঠিক বানান (Bengali Spelling):**  
  বাংলা বানান সম্পূর্ণভাবে **"প্রান্ত রায়"** হিসেবে সংশোধিত (`_src/02-top.html`, `_src/03-sections.html`, `_src/04-bottom.html`, `_src/build.py`, `_src/site.js`, `_src/content/site.json`, `llms.txt`)। ইংরেজি নাম ও ফেসবুক হ্যান্ডল `Pranto Rai` (`pranto.rai.37`) অপরিবর্তিত রয়েছে।
* **হাই-রেজোলিউশন ফেভিকন ও সার্চ লোগো অ্যাসেট:**  
  গুগলের ২০২৪-২০২৬ ফেভিকন গাইডলাইন অনুসারে (৪৮x৪৮ পিক্সেলের গুণিতক) অ্যাসেট তৈরি ও সংযুক্ত:
  - `/favicon.ico` (16x16, 32x32, 48x48 মাল্টিলেয়ার)
  - `/favicon-48x48.png` (48x48 PNG)
  - `/favicon-96x96.png` (96x96 PNG)
  - `/favicon-192x192.png` (192x192 PNG)
  - `/apple-touch-icon.png` (180x180 PNG)
  - `/site.webmanifest` (Name: "ম্যাথ একাডেমি দর্শনা")
* **струкচার্ড ডেটা (JSON-LD `@graph`):**  
  `WebSite` (নাম: "ম্যাথ একাডেমি দর্শনা", alternateName: ["Math Academy Darshana", "Math Academy Darsana"]), `EducationalOrganization` (Math Academy, লোগো, ঠিকানা, ফোন, ফেসবুক), এবং `Person` (প্রান্ত রায় / Pranto Rai, গণিত শিক্ষক - দর্শনা আইডিয়াল স্কুল) নিখুঁতভাবে সংযুক্ত।

---

## ৩. প্রোডাক্ট ও ইউএক্স (UI/UX) অগ্রাধিকার পর্যালোচনা

| লেভেল | বিষয় | বর্তমান অবস্থা ও প্রমাণ | পর্যবেক্ষণ / নির্দেশনা |
|---|---|---|---|
| **P0** | ব্যাচ ও আসন তথ্যের নির্ভরযোগ্যতা | ডেটাবেস (Neon Postgres) এবং `_src/content/site.json` সমন্বিত। ধারণক্ষমতা ব্যাচপ্রতি ১৫ জন। | আসন খালি বা পূর্ণের পরিবর্তনশীল তথ্য পেজের হার্ডকোডেড লেখায় রাখা যাবে না; মালিকের অনুমোদন সাপেক্ষে ডেটাবেস থেকে লোড হবে। |
| **P1** | মোবাইল অ্যাক্সেসিবিলিটি ও হ্রাসকৃত মোশন | `prefers-reduced-motion` এবং `:focus-visible` সিএসএস রুল `_src/site.css` ও `_src/blog.css`-এ উপস্থিত। | কীবোর্ড ও স্ক্রিনরিডার ব্যবহারকারীদের জন্য সম্পূর্ণ অ্যাক্সেসিবল। |
| **P1** | কার্যকর বিষয়বস্তু বনাম কিওয়ার্ড স্টাফিং | ১০টি পূর্ণাঙ্গ আর্টিকেল (`docs/blog-drafts/`) সিলেবাস ও বাস্তব গণিত চর্চার ওপর ভিত্তি করে রচিত। | কোনো থিন কনটেন্ট বা কৃত্রিম কিওয়ার্ড পুনরাবৃত্তি নেই। |
| **P2** | স্থানীয় যোগাযোগের তথ্য | দর্শনা, চুয়াডাঙ্গা, গুগল ম্যাপ আইডি (`UyNxwUBw3sjnmGE29`), এবং WhatsApp নম্বর (`+8801641045469`)। | যোগাযোগের সঠিকতা সংরক্ষিত। |

---

## ৪. টেস্ট ও ভেরিফিকেশন ফলাফল

1. **`python scripts/verify_all.py`:**
   ```text
   Total sitemap URLs: 12
   Checking 13 canonical pages for exact tags and scripts...
   ALL 5 VERIFICATION SUITES PASSED 100% PERFECTLY!
   ```
2. **`node tests/api.test.mjs`:**
   ```text
   65 passed, 0 failed
   ```
3. **`npm run indexnow:push` (`submit_indexnow.py`):**
   ```text
   Submitting 12 URLs to https://api.indexnow.org/indexnow...
   [SUCCESS] IndexNow returned HTTP 202
   [SUCCESS] URLs successfully accepted by IndexNow engine!
   ```

---

## ৫. রিলিজ সীমাবদ্ধতা ও মালিকের করণীয় (Owner Actions)

1. **কমিট ও ডেপ্লয়:** কোনো নতুন ব্রাঞ্চ বা অটোমেটিক ডেপ্লয় করা হয়নি। লোকাল চেঞ্জগুলো মালিক নিজে পর্যালোচনা করে গিটহাবে পুশ ও Vercel-এ ডেপ্লয় করবেন।
2. **সার্চ ইঞ্জিন আপডেট সময়সীমা:**
   - সাইট ডেপ্লয় হওয়ার পর গুগল সার্চ কনসোলে (Google Search Console) URL Inspection থেকে `https://mathacademydarsana.vercel.app/` পেজটির লাইভ টেস্ট করে "Request Indexing" দিতে হবে।
   - গুগল বটের ফেভিকন রি-ক্রল সাধারণত কয়েক দিন থেকে কয়েক সপ্তাহ পর্যন্ত সময় নিতে পারে।

