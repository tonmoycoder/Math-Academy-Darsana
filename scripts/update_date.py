with open('_src/build.py', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("'2026-10-27'", "'2026-10-28'")
with open('_src/build.py', 'w', encoding='utf-8') as f:
    f.write(text)

print('build.py sitemap date updated!')

