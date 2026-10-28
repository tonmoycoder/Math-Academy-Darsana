import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('_src/build.py', 'r', encoding='utf-8') as f:
    code = f.read()

target = '''    pub = pub.replace('<!--__PWA__-->',
        '<link rel="manifest" href="/site.webmanifest">\\n'
        '<link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png">\\n'
        '<meta name="apple-mobile-web-app-capable" content="yes">\\n'
        '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\\n'
        '<meta name="apple-mobile-web-app-title" content="ম্যাথ একাডেমি">\\n'
        '<meta name="mobile-web-app-capable" content="yes">')'''

replacement = '''    pub = pub.replace('<!--__PWA__-->',
        '<meta name="apple-mobile-web-app-capable" content="yes">\\n'
        '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\\n'
        '<meta name="apple-mobile-web-app-title" content="Math Academy Darsana">\\n'
        '<meta name="mobile-web-app-capable" content="yes">')'''

if target in code:
    code = code.replace(target, replacement)
    with open('_src/build.py', 'w', encoding='utf-8') as f:
        f.write(code)
    print('PWA replacement updated in build.py')
else:
    # try normalization
    code_norm = code.replace('\r\n', '\n')
    target_norm = target.replace('\r\n', '\n')
    replacement_norm = replacement.replace('\r\n', '\n')
    if target_norm in code_norm:
        code_norm = code_norm.replace(target_norm, replacement_norm)
        with open('_src/build.py', 'w', encoding='utf-8') as f:
            f.write(code_norm)
        print('PWA replacement updated (normalized)!')
    else:
        print('Target not found for PWA replacement')

