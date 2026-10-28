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
            content = f.read().decode('utf-8')
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
    'dist/site.webmanifest'
]
for fav in favicons:
    if not os.path.exists(fav):
        errors.append(f"Missing favicon asset {fav}")

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

# 5. Check JSON-LD in dist/index.html
with open('dist/index.html', 'r', encoding='utf-8') as f:
    idx_content = f.read()
    if '"name":"ম্যাথ একাডেমি দর্শনা"' not in idx_content and '"name": "ম্যাথ একাডেমি দর্শনা"' not in idx_content:
        errors.append("WebSite name in JSON-LD is missing or incorrect")
    if 'Math Academy Darshana' not in idx_content:
        errors.append("Math Academy Darshana missing in alternateName")
    if 'প্রান্ত রায়' in idx_content:
        errors.append("Found incorrect name 'প্রান্ত রায়' in dist/index.html")

if errors:
    print(f"FAILED with {len(errors)} errors:")
    for e in errors:
        print(f" - {e}")
    sys.exit(1)
else:
    print("ALL 5 VERIFICATION SUITES PASSED 100% PERFECTLY!")
