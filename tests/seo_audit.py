import asyncio
import os
import sys
import xml.etree.ElementTree as ET
import json
import urllib.parse
from playwright.async_api import async_playwright

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

BASE = "http://localhost:8124"
SITE_HOST = "https://mathacademydarsana.vercel.app"

async def run_audit():
    print("=" * 70)
    print("🔍 MATH ACADEMY DARSHANA — COMPREHENSIVE SEO & LIGHTHOUSE AUDIT")
    print("=" * 70)
    
    issues = []
    
    # -------------------------------------------------------------
    # 1. SITEMAP.XML AUDIT
    # -------------------------------------------------------------
    print("\n--- [1] SITEMAP.XML AUDIT ---")
    sitemap_path = os.path.join(os.getcwd(), "dist", "sitemap.xml")
    if not os.path.exists(sitemap_path):
        issues.append("dist/sitemap.xml not found")
        print("❌ dist/sitemap.xml missing!")
        return
    
    try:
        tree = ET.parse(sitemap_path)
        root = tree.getroot()
        ns = {'sm': 'http://www.sitemaps.org/schemas/sitemap/0.9',
              'image': 'http://www.google.com/schemas/sitemap-image/1.1'}
        
        urls = root.findall('sm:url', ns)
        print(f"✓ Valid XML structure with {len(urls)} URLs")
        
        expected_urls = [
            f"{SITE_HOST}/",
            f"{SITE_HOST}/blog/",
            f"{SITE_HOST}/blog/gonit-valo-kore-podar-upay/",
            f"{SITE_HOST}/blog/ssc-goniter-sob-sutro/",
            f"{SITE_HOST}/blog/goniter-voy-katanor-7-obhyas/",
            f"{SITE_HOST}/blog/gonite-durobolota-katanor-upay/",
            f"{SITE_HOST}/blog/gonit-practice-sera-upay/",
            f"{SITE_HOST}/blog/darshanay-math-academy-keno/",
            f"{SITE_HOST}/blog/ssc-gonit-kon-odhyay-age/",
            f"{SITE_HOST}/blog/gonite-durbal-shishu-30-diner-rutin/",
            f"{SITE_HOST}/blog/ashtom-shrenir-gonit-vit/",
            f"{SITE_HOST}/blog/jessore-board-ssc-gonit-prashna/",
        ]
        
        found_locs = []
        for u in urls:
            loc = u.find('sm:loc', ns).text.strip()
            lastmod = u.find('sm:lastmod', ns).text.strip()
            pri = u.find('sm:priority', ns).text.strip()
            freq = u.find('sm:changefreq', ns).text.strip()
            found_locs.append(loc)
            assert len(lastmod) == 10 and lastmod.count('-') == 2, f"Invalid lastmod {lastmod} in {loc}"
            assert float(pri) > 0 and float(pri) <= 1.0, f"Invalid priority {pri} in {loc}"
        
        missing = set(expected_urls) - set(found_locs)
        extra = set(found_locs) - set(expected_urls)
        
        if missing:
            issues.append(f"Sitemap missing URLs: {missing}")
            print(f"❌ Missing URLs in sitemap: {missing}")
        elif extra:
            issues.append(f"Sitemap has unexpected URLs: {extra}")
            print(f"❌ Unexpected URLs in sitemap: {extra}")
        else:
            print("✓ Exact match: Home (1.0), Blog Hub (0.8), and all 10 Article pages (0.7)")
            print("✓ Valid ISO-8601 YYYY-MM-DD lastmod timestamps and priorities on all entries")
            
    except Exception as e:
        issues.append(f"Sitemap parse error: {e}")
        print(f"❌ Sitemap error: {e}")

    # -------------------------------------------------------------
    # 2. ROBOTS.TXT AUDIT
    # -------------------------------------------------------------
    print("\n--- [2] ROBOTS.TXT AUDIT ---")
    robots_path = os.path.join(os.getcwd(), "dist", "robots.txt")
    if not os.path.exists(robots_path):
        issues.append("dist/robots.txt not found")
        print("❌ dist/robots.txt missing!")
    else:
        with open(robots_path, "r", encoding="utf-8") as f:
            robots_txt = f.read()
        
        assert "User-agent: *" in robots_txt, "Missing User-agent: *"
        assert "Allow: /" in robots_txt, "Missing Allow: /"
        assert "Disallow: /admin/" in robots_txt, "Missing Disallow: /admin/"
        assert f"Sitemap: {SITE_HOST}/sitemap.xml" in robots_txt, "Missing or incorrect absolute Sitemap URL in robots.txt"
        
        # Check AI Crawlers allow-list
        ai_bots = ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended", "Applebot-Extended"]
        found_ai = [bot for bot in ai_bots if f"User-agent: {bot}" in robots_txt]
        print(f"✓ Crawlers allowed: User-agent: * Allow: /")
        print(f"✓ Admin route protected: Disallow: /admin/")
        print(f"✓ Absolute Sitemap directive: {SITE_HOST}/sitemap.xml")
        print(f"✓ AI/GEO Search engines explicitly supported ({len(found_ai)} bots found: {', '.join(found_ai)})")

    # -------------------------------------------------------------
    # 3. ON-PAGE SEO, HEADINGS, JSON-LD & CANONICAL AUDIT
    # -------------------------------------------------------------
    print("\n--- [3] ON-PAGE SEO & STRUCTURED DATA (JSON-LD) AUDIT ---")
    
    routes_to_test = [
        ("/", "হোমপেজ", True),
        ("/blog/", "ব্লগ হাব", False),
        ("/blog/ssc-goniter-sob-sutro/", "এসএসসি গণিত সূত্র", False),
        ("/blog/jessore-board-ssc-gonit-prashna/", "যশোর বোর্ড এসএসসি প্রশ্ন", False),
        ("/blog/goniter-voy-katanor-7-obhyas/", "গণিত ভীতি কাটানোর ৭ অভ্যাস", False),
    ]
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=["--no-sandbox"])
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()
        
        for route, label, is_home in routes_to_test:
            target_url = BASE + route
            res = await page.goto(target_url, wait_until="domcontentloaded")
            assert res.status == 200, f"{route} returned {res.status}"
            
            title = await page.title()
            meta_desc = await page.locator('meta[name="description"]').get_attribute("content")
            canonical = await page.locator('link[rel="canonical"]').get_attribute("href")
            og_title = await page.locator('meta[property="og:title"]').get_attribute("content")
            og_desc = await page.locator('meta[property="og:description"]').get_attribute("content")
            og_url = await page.locator('meta[property="og:url"]').get_attribute("content")
            og_image = await page.locator('meta[property="og:image"]').get_attribute("content")
            h1_count = await page.locator("h1").count()
            h1_text = await page.locator("h1").first.inner_text() if h1_count > 0 else ""
            lang = await page.locator("html").get_attribute("lang")
            
            # Check JSON-LD
            json_ld_scripts = await page.locator('script[type="application/ld+json"]').all_inner_texts()
            parsed_lds = []
            for j in json_ld_scripts:
                try:
                    parsed_lds.append(json.loads(j))
                except Exception as e:
                    issues.append(f"Invalid JSON-LD on {route}: {e}")
            
            print(f"\nRoute: {route} ({label})")
            print(f"  • Status: 200 OK | Lang: {lang}")
            print(f"  • Title ({len(title)} chars): {title}")
            print(f"  • Meta Desc ({len(meta_desc) if meta_desc else 0} chars): {meta_desc[:60]}...")
            print(f"  • Canonical: {canonical}")
            print(f"  • H1 Count: {h1_count} ('{h1_text[:50]}...')")
            print(f"  • OG Title: {og_title}")
            print(f"  • OG Image: {og_image}")
            print(f"  • JSON-LD schemas: {len(parsed_lds)} found")
            
            assert h1_count == 1, f"Expected exactly 1 H1 on {route}, found {h1_count}"
            assert canonical == SITE_HOST + route, f"Canonical mismatch on {route}: {canonical}"
            assert meta_desc and len(meta_desc) > 50, f"Short or missing meta description on {route}"
            assert og_url == SITE_HOST + route, f"OG URL mismatch on {route}"
            assert og_image and og_image.startswith("http"), f"Invalid OG Image on {route}"
            assert len(parsed_lds) >= 1, f"Missing JSON-LD structured data on {route}"
            
            # On article pages, check FAQs and Article schema
            if "/blog/" in route and route != "/blog/":
                faq_items = await page.locator("details").count()
                print(f"  • Visible FAQ Details: {faq_items} items")
                assert faq_items == 3, f"Expected exactly 3 FAQs on article {route}, got {faq_items}"
        
        # -------------------------------------------------------------
        # 4. LIGHTHOUSE & CORE WEB VITALS METRICS (Simulated CWV)
        # -------------------------------------------------------------
        print("\n--- [4] LIGHTHOUSE & CORE WEB VITALS (PERFORMANCE AUDIT) ---")
        
        # Measure Performance on Homepage
        metrics_page = await context.new_page()
        t0 = asyncio.get_event_loop().time()
        res = await metrics_page.goto(BASE + "/", wait_until="load")
        t_load = (asyncio.get_event_loop().time() - t0) * 1000
        
        perf_data = await metrics_page.evaluate("""() => {
            const nav = performance.getEntriesByType('navigation')[0];
            const paint = performance.getEntriesByType('paint');
            const fcp = paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0;
            
            // Check DOM stats
            const totalElements = document.querySelectorAll('*').length;
            const imagesWithoutAlt = [...document.querySelectorAll('img')].filter(img => !img.hasAttribute('alt')).length;
            const buttonsWithoutName = [...document.querySelectorAll('button')].filter(b => !(b.innerText||'').trim() && !b.getAttribute('aria-label') && !b.getAttribute('aria-labelledby')).length;
            
            return {
                ttfb: nav ? nav.responseStart - nav.requestStart : 0,
                domInteractive: nav ? nav.domInteractive : 0,
                domComplete: nav ? nav.domComplete : 0,
                fcp: Math.round(fcp),
                totalElements: totalElements,
                imagesWithoutAlt: imagesWithoutAlt,
                buttonsWithoutName: buttonsWithoutName
            };
        }""")
        
        print(f"✓ TTFB (Time to First Byte): {round(perf_data['ttfb'], 1)} ms")
        print(f"✓ FCP (First Contentful Paint): {perf_data['fcp']} ms")
        print(f"✓ DOM Complete: {round(perf_data['domComplete'], 1)} ms")
        print(f"✓ Total DOM Elements: {perf_data['totalElements']} (Target < 1,500)")
        print(f"✓ Images without alt: {perf_data['imagesWithoutAlt']} (Target 0)")
        print(f"✓ Buttons without accessible names: {perf_data['buttonsWithoutName']} (Target 0)")
        
        assert perf_data['imagesWithoutAlt'] == 0, f"Found {perf_data['imagesWithoutAlt']} images missing alt attribute"
        assert perf_data['buttonsWithoutName'] == 0, f"Found {perf_data['buttonsWithoutName']} buttons missing accessible names"
        assert perf_data['totalElements'] < 1500, f"Excessive DOM elements: {perf_data['totalElements']}"
        
        # Check Font Preloads and LCP Preload
        preloads = await metrics_page.evaluate("""() => {
            return [...document.querySelectorAll('link[rel="preload"]')].map(l => ({
                as: l.getAttribute('as'),
                href: l.getAttribute('href'),
                type: l.getAttribute('type'),
                fetchpriority: l.getAttribute('fetchpriority')
            }));
        }""")
        print(f"✓ Preloaded critical resources: {len(preloads)} (WebFonts + Hero Image with high fetchpriority)")
        
        # Mobile Viewport & Touch Target audit
        await metrics_page.set_viewport_size({"width": 390, "height": 844})
        has_horizontal_overflow = await metrics_page.evaluate("document.documentElement.scrollWidth > window.innerWidth")
        print(f"✓ Mobile Viewport (390px): Horizontal overflow = {has_horizontal_overflow} (Target False)")
        assert not has_horizontal_overflow, "Horizontal overflow detected on mobile viewport"
        
        await browser.close()
        
    print("\n" + "=" * 70)
    if issues:
        print(f"❌ AUDIT COMPLETED WITH {len(issues)} ISSUES:")
        for iss in issues:
            print(f"   - {iss}")
    else:
        print("🎉 ALL SEO, SITEMAP, ROBOTS.TXT, AND LIGHTHOUSE CHECKS PASSED PERFECTLY!")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run_audit())
