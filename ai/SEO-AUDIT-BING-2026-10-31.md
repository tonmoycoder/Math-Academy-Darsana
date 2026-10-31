# Bing ও সার্চ-ভিজিবিলিটি অডিট — ২০২৬-১০-৩১

## ১. সারাংশ

**প্রধান সিদ্ধান্ত:** Bing Webmaster Tools-এ “Discovered but not crawled” এবং “Request indexing” বারবার দেওয়ার পরও একই থাকা—এটি একা robots.txt বা sitemap-এর ত্রুটির প্রমাণ নয়। Bing-এর নিজস্ব নথি বলে URL submission অগ্রাধিকারভিত্তিক crawl-এ সাহায্য করতে পারে, কিন্তু Bing-কে crawl/index করাতে বাধ্য করে না। Bing-এর index-এ কোন page ঢুকবে তা availability, crawl, content quality, authority ও তাদের নিজস্ব নির্বাচন প্রক্রিয়ার ওপর নির্ভর করে।

এই অডিটে পাওয়া সবচেয়ে গুরুত্বপূর্ণ **সংশোধনযোগ্য repo-side সমস্যা**:

1. Repo-র source/build-এ বদল থাকলেও live homepage এখনও পুরোনো title/description এবং “best math teacher” ধরনের unsupported claim দেখাচ্ছিল। এই branch/build Vercel-এ deploy না হলে search engine পুরোনো HTML-ই পাবে।
2. Teacher-এর বাংলা নাম বহু source, blog, manifest ও generated page-এ “প্রান্ত রাই”/“প্রান্ত রায়” ছিল—মালিকের চাওয়া “প্রান্ত রায়” বানানের সঙ্গে তা মিলছিল না। বানান সমন্বয় করা হয়েছে।
3. Production homepage-এ live extraction-এ একই batch-এর আসনসংখ্যা পরস্পরবিরোধী মনে হয়েছে; repository-র `ai/current-state.md` আবার ০ আসন বলছে, আর production extraction-এ ১১টি/৩টি—এ ধরনের ভিন্ন সংখ্যা দেখা গেছে। এগুলো সরাসরি ডেটা/বিশ্বাসযোগ্যতার সমস্যা; owner-confirmed actual data না দেখে কোনো সংখ্যা সত্য ধরে নেওয়া উচিত নয়।
4. Google result-এ full brand logo, favicon, social-share image এবং Maps/local-business panel—এগুলো আলাদা ব্যবস্থা। একটি site-এর Open Graph image বদলালে Google Search বা Maps-এর ছবির display নিয়ন্ত্রণ করা যায় না।

**সীমাবদ্ধতা:** Bing Webmaster Tools account-এর private diagnostics, quota, server response headers/logs, Bingbot crawl log, GSC coverage/indexed canonical এবং Google Business Profile owner view এই পরিবেশ থেকে দেখা যায়নি। তাই Bing-এর selection reason-কে নিশ্চিত করে বলা যায় না।

## ২. পরীক্ষা ও প্রমাণ

### Repository/build

- Canonical host source-এ `https://mathacademydarsana.vercel.app`; `robots.txt` public crawl allow করে এবং sitemap declare করে। Sitemap-এ homepage, blog hub ও ১০টি article—মোট ১২টি URL আছে।
- Publish build-এ homepage static HTML-এ server-rendered কনটেন্ট, canonical, WebSite/Organization structured data, sitemap এবং favicon reference আছে; অতএব এই snapshot-এ homepage পুরোপুরি client-rendered app shell নয়।
- Vercel config-এ `/`-এর জন্য `noindex` header নেই; `/api/` ও `/admin/`-এর noindex path rule আলাদা।
- Production root fetch-এ title `ম্যাথ একাডেমি দর্শনা | সেরা গণিত শিক্ষক | প্রান্ত রাই` দেখা গেছে, যেখানে বর্তমান branch-এর source/build title আলাদা। এটি **live deployment/source drift**-এর প্রমাণ। Vercel config `dist`-কে output directory ধরে এবং build command ফাঁকা; ফলে deploy-এ নতুন generated `dist/` থাকা আবশ্যক। শুধু source edit যথেষ্ট নয়।
- Production content extraction-এ teacher name-ও পুরোনো বানানে দেখা গেছে। এই repository-তে global name fix rebuild করার পর পুরোনো বাংলা বানান আর মেলেনি।
- `ai/current-state.md`, `ai/known-issues.md`, `ai/instructions.md`-এর production status, seat count ও deploy status পরস্পরের সঙ্গে/বর্তমান fetch-এর সঙ্গে মেলে না। Docs-কে live evidence-এর বিকল্প ধরা যাবে না।

### Bing

Screenshot-এ homepage “Discovered but not crawled”; blog index-এর screenshot “Indexed successfully”। Bing-এর URL Inspection help অনুযায়ী Live URL test হলো Bingbot-কে live fetch/render করিয়ে দেখা; Index status হলো Bing-এর বর্তমান index সিদ্ধান্ত। Live fetch pass হওয়া মানে index inclusion নিশ্চিত নয়।

### Google

Google-এর Search Central নথি বলে homepage re-crawl request একই URL-এর জন্য বারবার দিলে crawl দ্রুত হয় না; quota আছে; indexing বা search-result inclusion নিশ্চিত নয়। Google site name স্বয়ংক্রিয়ভাবে নির্ধারণ করে, তবে homepage-এর WebSite structured data, `og:site_name`, headings ও অন্যান্য web references দেখে। Title link-ও শুধু `<title>` থেকে নয়—visible heading, prominence, `og:title` ও link text থেকেও তৈরি হতে পারে।

## ৩. Bing “Request indexing” বারবার করেও কেন ফল নেই

- Request বোতামটি **crawl/index-এর নিশ্চয়তা নয়**। Bing-এর help page-এ URL action availability/quota-সাপেক্ষ বলা আছে।
- Bing-এর “Why is My Site Not in the Index?” নথিতে নতুন/কম পরিচিত site, অনাবিষ্কৃত URL, crawl সমস্যা, robots/noindex, external links-এর অভাব এবং quality threshold—সম্ভাব্য কারণ হিসেবে রয়েছে।
- Bing-এর live URL tab কেবল live fetch পরীক্ষা করে; index eligibility বা content selection আলাদা সিদ্ধান্ত।
- Screenshot অনুযায়ী blog-এর একটি URL index হয়েছে। এটি প্রমাণ করে অন্তত কিছু route Bing-এ গিয়েছে; কিন্তু homepage-এর crawl priority বা quality acceptance নিশ্চিত করে না।
- একাধিকবার একই URL request করে লাভ না হলে একই বোতাম পুনরায় চাপার চেয়ে Bing Site Explorer-এ homepage-এর category/status, crawl errors, `URLs selected but not crawled`, backlinks ও guideline issue দেখতে হবে। Bing-এর URL Inspection result-এ exact card/message এবং HTTP response/HTML থাকলে diagnosis আরও নির্দিষ্ট হবে।

## ৪. Finding ও করণীয়

| অগ্রাধিকার | Finding | করণীয় / যাচাই |
|---|---|---|
| Critical | Live homepage metadata/source এই branch-এর বর্তমান source থেকে পিছিয়ে | Build output deploy করুন; deploy-এর পর live `/`-এর `<title>`, description, OG tags, Bengali নাম, JSON-LD, favicon ও canonical source view-তে মিলিয়ে নিন। Search request শুধু deploy পরেই দিন। |
| High | Bing crawl selection এখনো unresolved; screenshot-এ discovered-not-crawled | Bing Site Explorer-এ `URLs selected but not crawled`, crawl errors, blocked URLs, backlinks/guideline issues দেখুন; exact inspection card text/HTTP response সংরক্ষণ করুন। IndexNow-তে homepage ও বাস্তবে পরিবর্তিত URL পাঠান—স্বীকৃত submission indexing guarantee নয়। |
| High | Production seat-count তথ্যের অমিল | Neon/ব্যবসার মালিকের নিশ্চিত actual fill/available seats একবারে ঠিক করুন; header/hero/batch table/FAQ/schema সব একই data source থেকে rebuild করুন। পুরোনো snapshot বা cache দিয়ে চালাবেন না। |
| High | Local panel-এ “Math Learning School”/অন্য ছবি দেখা যাচ্ছে | এটি Search OG preview নয়, screenshot অনুযায়ী Maps/local-business result হওয়ার সম্ভাবনা বেশি। Google Maps-এ listing খুলে নাম, category, address/pin, website ও photos owner account থেকে মিলিয়ে নিন। নিজের listing না হলে code দিয়ে বদলানো যাবে না; owner/Google Business Profile correction প্রয়োজন। |
| Medium | Generic “best math teacher” ইংরেজি দাবি content-এ ছিল | Source/footer এবং legacy injection script থেকে বাদ; প্রমাণহীন superlative search quality/বিশ্বাসযোগ্যতার জন্য উপকারী নয়। বাস্তব যোগ্যতা/শিক্ষাদানের পদ্ধতি লিখুন। |
| Medium | Teacher-এর বাংলা নাম বিভিন্নভাবে লেখা ছিল | এই পরিবর্তনে repo-তে “প্রান্ত রায়” করা হয়েছে; generated files rebuild-এও একই হয়েছে। Google/Bing-এ পুরোনো বানান পুনরায় crawl হওয়া পর্যন্ত দেখা যেতে পারে। |
| Medium | Google result-এর favicon এবং বড় logo একই জিনিস নয় | Homepage favicon link ও root asset accessible রাখুন, স্থিতিশীল filename ব্যবহার করুন। Google favicon refresh করতে homepage crawl দরকার; icon দেখানো নিশ্চিত নয়। Site name-এর জন্য homepage WebSite JSON-LD-তে `name`/canonical URL একরূপ রাখুন। |
| Medium | Ranking লক্ষ্য “specific search” না হলে দেখা যাচ্ছে না | Search Console/Bing performance query ও impressions দিয়ে বাস্তব query বের করুন। Local intent-এর নির্দিষ্ট পৃষ্ঠায় নিজের service, শ্রেণি, location, schedule/fees ও FAQ-এর factual তথ্য দিন; keyword stuffing নয়। |

## ৫. এই পরিবর্তনে যা করা হয়েছে

- সব tracked source/generated text-এ Bengali name `প্রান্ত রাই` ও `প্রান্ত রায়` → `প্রান্ত রায়` সমন্বয়।
- Homepage title/description-কে নির্দিষ্ট service, location ও audience-কেন্দ্রিক করা হয়েছে; “সেরা” দাবি সরানো হয়েছে।
- Open Graph/Twitter card-এ logo square-এর বদলে existing 1200×630 social-card image এবং সঠিক dimensions/alt ব্যবহার করা হয়েছে। এটি social preview metadata—Google SERP image নিয়ন্ত্রণের প্রতিশ্রুতি নয়।
- Homepage WebSite/Organization name consistency উন্নত করা হয়েছে।
- Source-এর footer ও legacy injection script থেকেও “best math teacher” দাবিটি বাদ দেওয়া হয়েছে।
- Publish build ও `scripts/verify_all.py` চালানো হয়েছে; **সব ৫টি verification suite pass**। Build হয়েছে `--skip-pull` দিয়ে; production database-এ কোনো পরিবর্তন করা হয়নি, এবং Vercel deploy করা হয়নি।

## ৬. পরবর্তী যাচাই—সঠিক ক্রম

1. মালিক নিশ্চিত করবেন নাম, আসন, ফি, সময়, school affiliation, Maps listing এবং public photos সঠিক কি না।
2. Repo-র এই branch-এর পরিবর্তনসহ `dist/` build-টি Vercel-এ deploy করুন.
3. Live source/fetch-এ homepage status/HTML, self-canonical, `index,follow`, favicon URL, sitemap URL, exact Bengali spelling, OG card URL, JSON-LD এবং batch counts যাচাই করুন। Bing Live URL-এ redirects/HTTP/HTML এবং Bing Index tab আলাদাভাবে দেখুন।
4. GSC-তে homepage-এর “URL is on Google?”/indexing status-এর **Google-selected canonical**, last crawl, crawled HTML ও indexing reason দেখুন; Bing Site Explorer-এ no-crawl group/backlinks/crawl issue দেখুন। Screenshot-এ শুধু সবুজ Live URL থাকলেই indexing সমস্যা শেষ—এমন নয়।
5. তারপর homepage একবার re-crawl request; IndexNow-তে updated URLs submit; sitemap refresh থাকলে resubmit। কয়েক দিন/সপ্তাহের ব্যবধানে status দেখুন—বারবার submit করে তাৎক্ষণিক ফল আশা করবেন না।
6. Google Business Profile/Maps ও Facebook-এ একই official name, URL, phone ও location ব্যবহার; বাস্তব অভিভাবক/শিক্ষার্থীর স্বেচ্ছাসম্মত review এবং স্থানীয় বিশ্বাসযোগ্য প্রতিষ্ঠান থেকে প্রাসঙ্গিক link অর্জন করুন। কোনো review/ backlink কিনবেন না।

## ৭. গবেষণার সূত্র

### Search engine-এর primary docs

- Bing, URL Inspection: https://www.bing.com/webmasters/help/url-inspection-55a30305
- Bing, Why is My Site Not in the Index?: https://www.bing.com/webmasters/help/why-is-my-site-not-in-the-index-2141dfab
- Bing, Webmaster Guidelines: http://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a
- Bing, IndexNow: https://www.bing.com/webmasters/help/indexnow-0z209wby
- Google, Ask Google to Recrawl Your Website: https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
- Google, Technical Requirements: https://developers.google.com/search/docs/essentials/technical
- Google, Site Names: https://developers.google.com/search/docs/appearance/site-names
- Google, Title Links: https://developers.google.com/search/docs/appearance/title-link
- Google, Structured Data Policies: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Google, Favicon in Search: https://developers.google.com/search/docs/appearance/favicon-in-search

### Pet-Shot repository-র সঙ্গে তুলনা

`tonmoycoder/Pet-Shot-Full-Stack` repository-ও দেখা হয়েছে। Frontend metadata-তে Next.js `metadataBase` ও explicit production base URL, title/description, OG 1200×630 image, PNG/ICO favicon references এবং structured-data component আছে; sitemap route-এ static category/content URL-সহ CMS-এর dynamic records তৈরি করার code আছে। Math Academy-তেও root canonical, WebSite JSON-LD, OG card, favicon files ও ১২-URL sitemap ইতিমধ্যে ছিল। তাই Pet-Shot repository-তে এমন কোনো একক “logo rank hack” নেই যা প্রমাণ করে সেটিই Google-এ icon দেখানোর কারণ। Live indexed state, domain age/authority, external entity references, links ও crawl history আলাদা—শুধু source-code দেখে তুলনা করে icon display বা ranking-এর কারণ নিশ্চিত করা যাবে না।

### অনুরোধ করা claude-seo repository

- Project: https://github.com/AgriciDaniel/claude-seo
- Technical audit framework: https://github.com/AgriciDaniel/claude-seo/blob/main/agents/seo-technical.md
- Local SEO framework: https://github.com/AgriciDaniel/claude-seo/blob/main/agents/seo-local.md
- Schema framework: https://github.com/AgriciDaniel/claude-seo/blob/main/agents/seo-schema.md

এগুলো SEO-audit checklist/framework; Bing/Google indexing decision-এর primary source নয়। এখানে technical crawl/indexability, local NAP/GBP, structured data, content quality ও outside links—এই দৃষ্টিগুলো audit-এ প্রয়োগ করা হয়েছে। Plugin-টির পূর্ণ automated audit ও paid-data/API checks এই পরিবেশে চালানো হয়নি; তাই কোনো বানানো audit score, search volume, backlink metric বা rank দাবি করা হচ্ছে না।
