import os
import sys
import xml.etree.ElementTree as ET

sys.stdout.reconfigure(encoding='utf-8')

errors = []

# 1. Verify IndexNow text file
txt_paths = ['bc14bb9c7dc34ee3818627cbec856bfe.txt', 'dist/bc14bb9c7dc34ee3818627cbec856bfe.txt']
for p in txt_paths:
    if not os.path.exists(p):
        errors.append(f"Missing {p}")
    else:
        with open(p, 'rb') as f:
            content = f.read().decode('utf-8').strip()
            if content != 'bc14bb9c7dc34ee3818627cbec856bfe':
                errors.append(f"Content mismatch in {p}: '{content}'")

# 2. Check sitemap vs canonicals
tree = ET.parse('dist/sitemap.xml')
root = tree.getroot()
urls = [elem.text for elem in root.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]

print(f"Total sitemap URLs: {len(urls)}")
checked_files = []
for u in urls:
    rel = u.replace('https://mathacademydarsana.vercel.app/', '')
    if rel == '':
        file_path = 'dist/index.html'
    else:
        file_path = os.path.join('dist', rel, 'index.html')
    if not os.path.exists(file_path):
        errors.append(f"File for URL {u} does not exist at {file_path}")
    else:
        checked_files.append(file_path)
        with open(file_path, 'r', encoding='utf-8') as f:
            html = f.read()
            expected_canonical = f'<link rel="canonical" href="{u}">'
            if expected_canonical not in html:
                errors.append(f"Canonical mismatch in {file_path} for {u}")

# Also add 404.html
checked_files.append('dist/404.html')

# 3. Check favicon files in dist/
favicons = [
    'dist/favicon.ico',
    'dist/favicon-48x48.png',
    'dist/favicon-96x96.png',
    'dist/favicon-192x192.png',
    'dist/apple-touch-icon.png',
    'dist/site.webmanifest',
    'dist/og-1200x630.jpg',
    'dist/logo.png'
]
for fav in favicons:
    if not os.path.exists(fav):
        errors.append(f"Missing asset {fav}")

# 4. Check all 13 canonical pages
print(f"Checking {len(checked_files)} canonical pages for exact tags and scripts...")
required_head_snippets = [
    '<link rel="icon" href="/favicon.ico" sizes="48x48">',
    '<link rel="icon" href="/favicon-48x48.png" sizes="48x48" type="image/png">',
    '<link rel="icon" href="/favicon-96x96.png" sizes="96x96" type="image/png">',
    '<link rel="icon" href="/favicon-192x192.png" sizes="192x192" type="image/png">',
    '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
    '<link rel="manifest" href="/site.webmanifest">',
    '<meta property="og:site_name" content="ম্যাথ একাডেমি দর্শনা">',
    '<meta name="application-name" content="ম্যাথ একাডেমি দর্শনা">'
]

for hf in checked_files:
    with open(hf, 'r', encoding='utf-8') as f:
        content = f.read()
        for snip in required_head_snippets:
            if snip not in content:
                errors.append(f"Missing snippet in {hf}: {snip}")
        if '/_vercel/insights/script.js' not in content:
            errors.append(f"Missing analytics script in {hf}")
        if '/_vercel/speed-insights/script.js' not in content:
            errors.append(f"Missing speed insights script in {hf}")

# 5. Check SEO Title, Name and JSON-LD in dist/index.html
with open('dist/index.html', 'r', encoding='utf-8') as f:
    idx_content = f.read()
    if '<title>ম্যাথ একাডেমি দর্শনা | SSC ও ৬ষ্ঠ–১০ম শ্রেণির গণিত</title>' not in idx_content:
        errors.append("Homepage title mismatch or not updated")
    if 'সেরা গণিত শিক্ষক' in idx_content:
        errors.append("Found unsupported boastful claim 'সেরা গণিত শিক্ষক' in dist/index.html")
    if 'best math teacher' in idx_content.lower():
        errors.append("Found unsupported English boastful claim 'best math teacher' in dist/index.html")
    if 'widely regarded' in idx_content.lower():
        errors.append("Found unsupported claim 'widely regarded' in dist/index.html")
    if 'recognized as the best' in idx_content.lower():
        errors.append("Found unsupported claim 'recognized as the best' in dist/index.html")
    if '"name":"ম্যাথ একাডেমি দর্শনা"' not in idx_content and '"name": "ম্যাথ একাডেমি দর্শনা"' not in idx_content:
        errors.append("WebSite name in JSON-LD is missing or incorrect")
    if 'Math Academy Darshana' not in idx_content:
        errors.append("Math Academy Darshana missing in alternateName")

    # Target spelling: U+09DF
    target_spelling = '\u09aa\u09cd\u09b0\u09be\u09a8\u09cd\u09a4 \u09b0\u09be\u09df'
    # Decomposed spelling: U+09AF U+09BC
    decomposed_spelling = '\u09aa\u09cd\u09b0\u09be\u09a8\u09cd\u09a4 \u09b0\u09be\u09af\u09bc'

    if target_spelling not in idx_content:
        errors.append("Required spelling 'প্রান্ত রায়' (U+09DF) not found in dist/index.html")
    if decomposed_spelling in idx_content:
        errors.append("Found forbidden decomposed spelling 'প্রান্ত রায়' (U+09AF U+09BC) in dist/index.html")
    if 'প্রান্ত রাই' in idx_content:
        errors.append("Found forbidden spelling 'প্রান্ত রাই' in dist/index.html")

    # OG / Twitter Image checks
    if 'content="https://mathacademydarsana.vercel.app/og-1200x630.jpg"' not in idx_content:
        errors.append("Homepage og:image must point to https://mathacademydarsana.vercel.app/og-1200x630.jpg")
    if 'content="1200"' not in idx_content or 'content="630"' not in idx_content:
        errors.append("Homepage og:image dimensions (1200x630) missing")

# 6. Check robots.txt
with open('dist/robots.txt', 'r', encoding='utf-8') as f:
    robots_content = f.read()
    if 'User-agent: Googlebot-Favicon' not in robots_content:
        errors.append("Googlebot-Favicon not explicitly defined in dist/robots.txt")

if errors:
    print(f"FAILED with {len(errors)} errors:")
    for e in errors:
        print(f" - {e}")
    sys.exit(1)
else:
    print("ALL VERIFICATION SUITES PASSED 100% PERFECTLY!")
