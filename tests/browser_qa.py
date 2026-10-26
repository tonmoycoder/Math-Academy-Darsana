import asyncio
import os
import pathlib
import subprocess
import sys
import time

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')
from urllib.parse import unquote
from playwright.async_api import async_playwright

PORT = "8123"
BASE = f"http://127.0.0.1:{PORT}"
ENV = os.environ.copy()
ENV.update({"MA_FAKE_DB": "1", "MA_FAKE_SHIFT": "-1", "NODE_ENV": "test"})


ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def start_server():
    proc = subprocess.Popen(
        ["node", "tests/dev-server.mjs", PORT],
        cwd=ROOT, env=ENV,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True,
    )
    line = proc.stdout.readline().strip()
    if "dev server on" not in line:
        print("server output:", line)
        proc.terminate()
        raise RuntimeError("dev server failed")
    print("TEST SERVER:", line)
    return proc


async def main():
    errors = []
    http_errors = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=["--no-sandbox"])
        context = await browser.new_context(
            viewport={"width": 390, "height": 844}, reduced_motion="reduce"
        )
        page = await context.new_page()
        page.on("pageerror", lambda e: errors.append("pageerror: " + str(e)))
        page.on("console", lambda m: errors.append("console: " + m.text)
                if m.type == "error" and "server responded with a status of 404" not in m.text else None)
        page.on("response", lambda r: http_errors.append((r.status, r.url)) if r.status >= 400 else None)
        response = await page.goto(BASE + "/", wait_until="load")
        assert response and response.status == 200
        await page.wait_for_timeout(2300)
        print("home title:", await page.title())
        print("live state:", await page.locator("html").get_attribute("data-live"),
              "live seats:", await page.locator("#bookSeatNum").inner_text())
        assert await page.locator("html").get_attribute("data-live") == "updated"
        assert await page.locator("#bookSeatNum").inner_text() == "৯"
        assert await page.locator("#bkBatch option").count() == 3
        print("home dynamic API: shifted fixture updates seat total to ৯; batch selector options:",
              await page.locator("#bkBatch option").count())

        widths = [320, 360, 390, 820, 1280, 1440]
        overflow = []
        for width in widths:
            await page.set_viewport_size({"width": width, "height": 844})
            await page.wait_for_timeout(120)
            state = await page.evaluate("""() => ({
                w: innerWidth,
                doc: document.documentElement.scrollWidth,
                body: document.body.scrollWidth,
                h1: document.querySelector('h1')?.getBoundingClientRect().width,
                burger: (() => { const e=document.querySelector('#burger'), r=e.getBoundingClientRect(); return {left:r.left,right:r.right,visible:getComputedStyle(e).display!=='none'}; })(),
                sound: (() => { const e=document.querySelector('#sndBtn'), r=e.getBoundingClientRect(); return {left:r.left,right:r.right,visible:getComputedStyle(e).display!=='none'}; })()
            })""")
            if (state["doc"] > state["w"] + 1 or
                any(x["visible"] and (x["left"] < -1 or x["right"] > state["w"] + 1)
                    for x in (state["burger"], state["sound"]))):
                overflow.append(state)
        print("responsive widths:", widths, "overflow:", overflow)

        nameless = await page.evaluate("""() => [...document.querySelectorAll('button')]
            .filter(b => !(b.innerText || '').trim() && !b.getAttribute('aria-label')
                && !b.getAttribute('aria-labelledby') && !b.title)
            .map(b => b.outerHTML.slice(0, 180))""")
        print("icon buttons without accessible names:", nameless)

        # Reduced-motion is intentionally muted on first render; explicit sound toggles work.
        sound = page.locator("#sndBtn")
        before = await sound.get_attribute("aria-pressed")
        await sound.click()
        after_on = await sound.get_attribute("aria-pressed")
        await sound.click()
        after_off = await sound.get_attribute("aria-pressed")
        print("sound toggle aria-pressed:", before, "→", after_on, "→", after_off)
        assert before == "false" and after_on == "true" and after_off == "false"
        body_text = (await page.locator("body").inner_text()).lower()
        prompt_copy = ("tap for sound", "permission to play", "সাউন্ড চালু করতে ট্যাপ", "শব্দ চালু করতে অনুমতি")
        assert not any(x in body_text for x in prompt_copy)

        await page.set_viewport_size({"width": 390, "height": 844})
        await page.locator("#burger").click()
        assert await page.locator("#drawer").get_attribute("aria-hidden") == "false"
        await page.keyboard.press("Escape")
        assert await page.locator("#drawer").get_attribute("aria-hidden") == "true"
        print("drawer open/escape close: OK")

        await page.locator("#library").scroll_into_view_if_needed()
        await page.wait_for_timeout(150)
        library_cards = page.locator("#vaultGrid .sheet")
        assert await library_cards.count() == 1
        assert await library_cards.first.locator("h3").inner_text() == "English Dialogue Format"
        download_link = page.locator('#vaultGrid a[download="English-Dialogue-Format.pdf"]')
        assert await download_link.count() == 1
        assert await download_link.get_attribute("href") == "/assets/english-dialogue-format.pdf"
        async with page.expect_download() as download_info:
            await download_link.click()
        library_download = await download_info.value
        downloaded_path = await library_download.path()
        with open(downloaded_path, "rb") as f:
            pdf_magic = f.read(5)
        assert library_download.suggested_filename == "English-Dialogue-Format.pdf"
        assert pdf_magic == b"%PDF-", pdf_magic
        print("library: one accurate-title PDF, same-origin direct download:", library_download.suggested_filename)

        offline_page = await context.new_page()
        offline_url = pathlib.Path(ROOT, "math-academy.html").as_uri()
        await offline_page.goto(offline_url, wait_until="domcontentloaded")
        await offline_page.locator("#library").scroll_into_view_if_needed()
        offline_link = offline_page.locator('#vaultGrid a[download="English-Dialogue-Format.pdf"]')
        offline_href = await offline_link.get_attribute("href")
        assert offline_href.startswith("data:application/pdf;base64,"), offline_href[:80]
        async with offline_page.expect_download() as offline_info:
            await offline_link.click()
        offline_download = await offline_info.value
        offline_path = await offline_download.path()
        with open(offline_path, "rb") as f:
            offline_magic = f.read(5)
        assert offline_download.suggested_filename == "English-Dialogue-Format.pdf"
        assert offline_magic == b"%PDF-", offline_magic
        await offline_page.close()
        print("offline HTML: embedded PDF downloaded successfully")

        await page.locator("#lookupForm input").scroll_into_view_if_needed()
        await page.wait_for_timeout(150)
        await page.locator("#lookupForm input").fill("MA-2026-084")
        await page.locator("#lookupForm button[type=submit]").click()
        result_text = await page.locator("#resultCard").inner_text()
        assert "তানভীর আহমেদ" in result_text
        print("results interaction: OK")

        # Lazy-initialized geometry tools must still work when their section is reached.
        await page.locator("#lab").scroll_into_view_if_needed()
        await page.wait_for_timeout(400)
        await page.locator("#tab-tri").click()
        assert await page.locator("#tab-tri").get_attribute("aria-selected") == "true"
        await page.locator("#aRange").focus()
        await page.locator("#aRange").press("ArrowRight")
        assert await page.locator("#triSum").text_content() == "A + B + C = 180 deg"
        await page.locator('[data-preset="90,45"]').click()
        assert await page.locator("#aVal").inner_text() == "৯০°"
        assert await page.locator("#bVal").inner_text() == "৪৫°"
        print("lazy geometry tabs/sliders/preset interaction: OK")

        wa_href = await page.locator(".header__cta a[data-wa]").get_attribute("href")
        assert "wa.me/8801641045469" in wa_href
        assert "বুক" not in unquote(wa_href)
        print("WhatsApp information CTA:", unquote(wa_href))

        external_requests = []
        async def intercept_wa(route):
            external_requests.append(route.request.url)
            await route.abort()
        await context.route("https://wa.me/**", intercept_wa)
        await page.locator("#bkName").fill("পরীক্ষা শিক্ষার্থী")
        await page.locator("#bkPhone").fill("০১৭১২৩৪৫৬৭৮")
        async with page.expect_popup(timeout=7000) as popup_info:
            await page.locator("#bookForm button[type=submit]").click()
        popup = await popup_info.value
        await page.wait_for_timeout(1000)
        if popup and not popup.is_closed():
            await popup.close()
        assert external_requests and "বর্তমান আসন" in unquote(external_requests[0]), external_requests
        assert await page.locator("#bkName").input_value() == ""
        print("information form: opens WhatsApp, resets fields, no site-side submission")

        article_slugs = [
            "gonit-valo-kore-podar-upay", "ssc-goniter-sob-sutro",
            "goniter-voy-katanor-7-obhyas", "gonite-durobolota-katanor-upay",
            "gonit-practice-sera-upay", "darshanay-math-academy-keno",
            "ssc-gonit-kon-odhyay-age", "gonite-durbal-shishu-30-diner-rutin",
            "ashtom-shrenir-gonit-vit", "jessore-board-ssc-gonit-prashna",
        ]
        await page.goto(BASE + "/blog/", wait_until="load")
        assert await page.locator("h1").count() == 1
        assert await page.locator("#blogSoundBtn").count() == 1
        print("blog hub title:", await page.locator("h1").inner_text(),
              "sound button:", await page.locator("#blogSoundBtn").count())
        blog_sound = page.locator("#blogSoundBtn")
        blog_before = await blog_sound.get_attribute("aria-pressed")
        await blog_sound.click()
        blog_after = await blog_sound.get_attribute("aria-pressed")
        await blog_sound.click()
        blog_final = await blog_sound.get_attribute("aria-pressed")
        print("blog sound aria-pressed:", blog_before, "→", blog_after, "→", blog_final)
        assert blog_before != blog_after and blog_before == blog_final

        for slug in article_slugs:
            route_response = await page.goto(BASE + "/blog/" + slug + "/", wait_until="domcontentloaded")
            assert route_response and route_response.status == 200, (slug, route_response.status if route_response else None)
            assert await page.locator("h1").count() == 1, slug
            article_body = await page.locator("main article .prose").inner_text()
            assert len(article_body) > 400, (slug, len(article_body))
            assert await page.locator("main article .faq details").count() == 3, slug
            canonical = await page.locator('link[rel="canonical"]').get_attribute("href")
            assert canonical.endswith("/blog/" + slug + "/"), (slug, canonical)
            assert await page.locator("#blogSoundBtn").count() == 1, slug
            await page.set_viewport_size({"width": 390, "height": 844})
            has_overflow = await page.evaluate("document.documentElement.scrollWidth > innerWidth")
            assert not has_overflow, slug
        print("article routes:", len(article_slugs), "all 200, H1, full body, 3 FAQs, canonical, sound control, 390px no overflow")

        not_found = await page.goto(BASE + "/not-a-real-route/", wait_until="domcontentloaded")
        assert not_found and not_found.status == 404
        print("unknown path status:", not_found.status)

        # Standard browser autoplay behavior: intro remains authored at ~4.7s; no permission UI.
        normal_context = await browser.new_context(viewport={"width": 390, "height": 844})
        normal_page = await normal_context.new_page()
        normal_errors = []
        normal_page.on("pageerror", lambda e: normal_errors.append(str(e)))
        t0 = time.monotonic()
        normal_response = await normal_page.goto(BASE + "/", wait_until="domcontentloaded")
        assert normal_response and normal_response.status == 200
        await normal_page.locator("#preloader").wait_for(state="hidden", timeout=9000)
        intro_elapsed = time.monotonic() - t0
        print("normal intro duration until hidden:", round(intro_elapsed, 2), "seconds; authored target ~4.7s")
        normal_text = (await normal_page.locator("body").inner_text()).lower()
        assert not any(x in normal_text for x in prompt_copy)

        all_errors = errors + ["normal pageerror: " + x for x in normal_errors]
        unexpected_http = [item for item in http_errors
                           if not (item[0] == 404 and item[1].endswith('/not-a-real-route/'))]
        print("console/page errors:", all_errors)
        print("HTTP error responses (expected missing route only):", http_errors)
        await browser.close()
        assert not all_errors, all_errors
        assert not unexpected_http, unexpected_http
        assert not overflow, overflow
        assert not nameless, nameless
        print("BROWSER QA PASSED")


if __name__ == "__main__":
    server = start_server()
    try:
        asyncio.run(main())
    finally:
        server.terminate()
        try:
            server.wait(timeout=5)
        except subprocess.TimeoutExpired:
            server.kill()
