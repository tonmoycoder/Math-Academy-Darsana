import json

with open('vercel.json', 'r', encoding='utf-8') as f:
    cfg = json.load(f)

# check headers
headers = cfg.get('headers', [])
for h in headers:
    if h.get('source') == '/manifest.webmanifest':
        h['source'] = '/(manifest\\.webmanifest|site\\.webmanifest)'
    if h.get('source') == '/(icon-.*\\.png)':
        h['source'] = '/(icon-.*\\.png|logo.*\\.png|favicon.*\\.png|apple-touch-icon\\.png)'

with open('vercel.json', 'w', encoding='utf-8') as f:
    json.dump(cfg, f, indent=2)

print('vercel.json headers updated successfully!')

