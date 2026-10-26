"""Regenerate assets/og-1200x630.jpg from _src/tools/og-card.html.

    python3 _src/tools/make_og.py

Renders with headless Chromium (Playwright) so Bengali shaping is perfect.
The batch size is read from _src/content/site.json — never type it here.
"""
import asyncio, base64, json, pathlib, sys
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parents[2]
BN = str.maketrans('0123456789', '০১২৩৪৫৬৭৮৯')

cfg = json.loads((ROOT / '_src/content/site.json').read_text(encoding='utf-8'))
cap = str(cfg['capacity']['per_batch']).translate(BN)
year = str(cfg['team']['founded_year'])

html = (ROOT / '_src/tools/og-card.html').read_text(encoding='utf-8')
html = html.replace('__FONT_CSS__', (ROOT / '_src/fonts.inline.css').read_text(encoding='utf-8'))
html = html.replace('__CAP__', cap)
html = html.replace('__FOUNDED_YEAR__', year)
mark = base64.b64encode((ROOT / 'assets/logo-badge-1024.png').read_bytes()).decode()
photo = base64.b64encode((ROOT / 'assets/hero-color.webp').read_bytes()).decode()
html = html.replace('__MARK__', 'data:image/png;base64,' + mark)
html = html.replace('__PHOTO__', 'data:image/webp;base64,' + photo)

out_html = ROOT / '_src/tools/og-card.rendered.html'
out_html.write_text(html, encoding='utf-8')

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': 1200, 'height': 630}, device_scale_factor=1)
        await pg.goto(out_html.as_uri(), wait_until='load')
        await pg.evaluate("document.fonts.ready")
        await pg.wait_for_timeout(600)
        for target in (ROOT / 'assets/og-1200x630.jpg', ROOT / 'dist/og-1200x630.jpg'):
            await pg.screenshot(path=str(target), type='jpeg', quality=92, clip={'x':0,'y':0,'width':1200,'height':630})
            print('wrote', target)
        await b.close()

asyncio.run(main())
