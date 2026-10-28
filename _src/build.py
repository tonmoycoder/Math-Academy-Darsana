VERCEL_ANALYTICS_SCRIPTS = (
    '<script>\n'
    '  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };\n'
    '  window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };\n'
    '</script>\n'
    '<script defer src="/_vercel/insights/script.js"></script>\n'
    '<script defer src="/_vercel/speed-insights/script.js"></script>'
)

import os, json, pathlib, base64, html as _html, re as _re, math as _math
from urllib.parse import quote as _quote

S = pathlib.Path('_src')
A = pathlib.Path('assets')


def b64(p):
    return base64.b64encode(pathlib.Path(p).read_bytes()).decode()


TOKENS = {
    '__LOGO_CIRCLE__': b64(A / 'logo-avatar-1024.png'),      # circle-safe badge (dark disc, paper ring)
    '__LOGO_TIGHT__':  b64(A / 'logo-badge-128.png'),          # 40px header mark
    '__LOGO_DARK__':   b64(A / 'mark-dark-256.png'),           # mark for dark backgrounds
    '__MARK__':        b64(A / 'mark-light-256.png'),          # mark on paper
    '__PHOTO__':       ('image/webp', b64(A / 'hero-color.webp')),           # hero poster (4:5)
    '__PHOTO_BIG__':   ('image/webp', b64(A / 'teacher-color.webp')),        # section 04 (3:4)
    '__PHOTO_AV__':    ('image/webp', b64(A / 'av-160.webp')),              # compact 40px avatar source
}

SITE = globals().get('SITE_URL', None)  # (declared below for --publish overrides)

head = """<!DOCTYPE html>
<html lang="bn-BD">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>ম্যাথ একাডেমি দর্শনা | সেরা গণিত শিক্ষক | প্রান্ত রাই</title>
<meta name="description" content="দর্শনায় ৬ষ্ঠ-১০ম শ্রেণি ও SSC-এর সেরা গণিত শিক্ষক প্রান্ত রাই (দর্শনা আইডিয়াল স্কুল)। মুখস্থ নয়, ম্যাথ একাডেমিতে যুক্তির সাহায্যে গণিত শিখুন। আজই যোগাযোগ করুন।">
<meta name="keywords" content="Math Academy Darsana, Pranto Rai, best math teacher in Darsana, Darsana Ideal School, Chuadanga, গণিত শিক্ষক দর্শনা, প্রান্ত রাই, SSC গণিত দর্শনা">
<meta name="author" content="Pranto Rai">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
<meta name="google-site-verification" content="googlee3840f5ed89d0b8b.html">
<meta name="google-site-verification" content="googlee3840f5ed89d0b8b">
<meta name="google-site-verification" content="e3840f5ed89d0b8b">
<meta name="theme-color" content="#1a4d3e">
<meta name="color-scheme" content="light">
<meta name="format-detection" content="telephone=yes">
<meta name="geo.region" content="BD-19">
<meta name="geo.placename" content="Darshana, Chuadanga, Bangladesh">
<link rel="canonical" href="__SITE__/">
<link rel="alternate" hreflang="bn-BD" href="__SITE__/">
<link rel="alternate" hreflang="x-default" href="__SITE__/">

<!-- Brand and Site Name (Stops Google from showing Vercel) -->
<meta property="og:site_name" content="ম্যাথ একাডেমি দর্শনা">
<meta name="application-name" content="ম্যাথ একাডেমি দর্শনা">
<meta name="apple-mobile-web-app-title" content="ম্যাথ একাডেমি দর্শনা">

<!-- Open Graph (OG) -->
<meta property="og:type" content="website">
<meta property="og:url" content="__SITE__/">
<meta property="og:title" content="ম্যাথ একাডেমি দর্শনা | সেরা গণিত শিক্ষক | প্রান্ত রাই">
<meta property="og:description" content="দর্শনায় ৬ষ্ঠ-১০ম শ্রেণি ও SSC-এর সেরা গণিত শিক্ষক প্রান্ত রাই (দর্শনা আইডিয়াল স্কুল)। মুখস্থ নয়, ম্যাথ একাডেমিতে যুক্তির সাহায্যে গণিত শিখুন। আজই যোগাযোগ করুন।">
<meta property="og:image" content="__SITE__/logo.png">
<meta property="og:image:width" content="1024">
<meta property="og:image:height" content="1024">
<meta property="og:image:alt" content="Math Academy Darsana Logo - Founded by Pranto Rai">
<meta property="og:locale" content="bn_BD">
<meta property="og:phone_number" content="+8801641045469">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="ম্যাথ একাডেমি দর্শনা | সেরা গণিত শিক্ষক | প্রান্ত রাই">
<meta name="twitter:description" content="দর্শনায় ৬ষ্ঠ-১০ম শ্রেণি ও SSC-এর সেরা গণিত শিক্ষক প্রান্ত রাই (দর্শনা আইডিয়াল স্কুল)। যুক্তির সাহায্যে গণিত শিখুন।">
<meta name="twitter:image" content="__SITE__/logo.png">

<!-- Google Search Compliant Favicons -->
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon-48x48.png" sizes="48x48" type="image/png">
<link rel="icon" href="/favicon-96x96.png" sizes="96x96" type="image/png">
<link rel="icon" href="/favicon-192x192.png" sizes="192x192" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
__CSP__
<!--__PWA__-->
<!--__PRELOAD__-->
</head>
<body>
"""

top   = (S/'02-top.html').read_text(encoding='utf-8')
mid   = (S/'03-sections.html').read_text(encoding='utf-8')
bot   = (S/'04-bottom.html').read_text(encoding='utf-8')
css   = (S/'site.css').read_text(encoding='utf-8')
fonts = (S/'fonts.inline.css').read_text(encoding='utf-8')
js    = (S/'site.js').read_text(encoding='utf-8')
gsap  = (S/'gsap.min.js').read_text(encoding='utf-8')
spec  = (S/'SPEC-COMMENT.html').read_text(encoding='utf-8') if (S/'SPEC-COMMENT.html').exists() else ''

extra_css = """
/* scroll progress bar pinned under the sticky header */
.scrollprog{position:fixed;left:0;top:var(--header);height:3px;width:0;background:var(--red);z-index:95;pointer-events:none;transition:width .08s linear}
"""

def swap(text, key, val):
    if isinstance(val, tuple):                     # (mime, base64) -> fix the declared mime too
        mime, data = val
        text = text.replace('data:image/jpeg;base64,' + key, 'data:%s;base64,%s' % (mime, data))
        text = text.replace('data:image/webp;base64,' + key, 'data:%s;base64,%s' % (mime, data))
        return text.replace(key, data)
    return text.replace(key, val)


# ============================================================================
#  DYNAMIC CONTENT — site.json is the seed; a successful Neon snapshot supplies
#  current capacity, programme counts and every active batch row. The same values
#  drive HTML, the visible FAQ and the structured data. See docs/CONTENT.md.
# ============================================================================
# ---- refresh the live snapshot before reading anything -----------------------------
# Direct Python builds attempt a fresh pull unless MA_SKIP_PULL=1. A failed pull
# blocks the build; seed/stale-snapshot values are never silently shipped as fresh.
import subprocess as _sp, sys as _sys
if not os.environ.get('MA_SKIP_PULL') and '--skip-pull' not in _sys.argv:
    try:
        _pull = _sp.run(['node', 'scripts/pull-content.mjs'], check=False, timeout=60,
                        stdout=_sp.DEVNULL, stderr=_sp.DEVNULL)
        if _pull.returncode != 0:
            raise RuntimeError('Neon content pull failed; build blocked. Inspect `npm run content:pull`.')
    except Exception as _err:
        raise RuntimeError('Neon content pull failed; build blocked. Use MA_SKIP_PULL=1 only with an explicitly verified snapshot.') from _err

CFG = json.loads(pathlib.Path('_src/content/site.json').read_text(encoding='utf-8'))

# ---- live overlay ------------------------------------------------------------------
# site.json is the *seed*. `npm run content:pull` snapshots what Neon says right now
# into _src/content/live.json; whatever is in there wins. Seed-only output is allowed
# solely when MA_SKIP_PULL=1 is used deliberately for a local/offline build.
_LIVE_PATH = pathlib.Path('_src/content/live.json')
LIVE = None
if _LIVE_PATH.exists():
    try:
        LIVE = json.loads(_LIVE_PATH.read_text(encoding='utf-8'))
    except Exception as _err:
        raise ValueError('Release build blocked: live snapshot is not valid JSON.') from _err

if LIVE is not None:
    if not isinstance(LIVE, dict):
        raise ValueError('Release build blocked: live snapshot must be a JSON object.')
    if LIVE.get('capacity') != 15 or isinstance(LIVE.get('capacity'), bool):
        raise ValueError('Release build blocked: approved capacity must be exactly 15 per batch.')
    if LIVE.get('foundedYear') != 2022:
        raise ValueError('Release build blocked: owner-corrected academy founding year must be 2022.')
    CFG['team']['founded_year'] = LIVE['foundedYear']
    _programme = LIVE.get('programme')
    if not isinstance(_programme, dict):
        raise ValueError('Release build blocked: live snapshot has no programme object.')
    for _field in ('classes_per_month', 'mock_per_month'):
        _value = _programme.get(_field)
        if (not isinstance(_value, (int, float)) or isinstance(_value, bool) or
                not _math.isfinite(_value) or int(_value) != _value or _value <= 0):
            raise ValueError('Release build blocked: programme.%s must be a positive numeric integer.' % _field)
    if not isinstance(LIVE.get('batches'), list) or not LIVE['batches']:
        raise ValueError('Release build blocked: live snapshot must contain at least one active batch row.')
    if LIVE.get('nextBatch'):
        CFG['next_batch'].update({k: v for k, v in LIVE['nextBatch'].items() if v})
    if LIVE.get('pricing'):
        CFG['pricing'].update({k: v for k, v in LIVE['pricing'].items() if v is not None})
    CFG['capacity']['per_batch'] = LIVE['capacity']
    CFG['programme'].update({k: v for k, v in _programme.items() if v is not None})
    if isinstance(LIVE.get('batches'), list):
        _seed_by_id = {b['id']: b for b in CFG['batches']}
        _live_batches = []
        for _row in LIVE['batches']:
            _base = _seed_by_id.get(_row.get('id'), {})
            _merged = {**_base, **_row}
            _required = ('id', 'name_bn', 'code', 'classes_bn', 'days_bn', 'time_bn',
                         'fee', 'filled', 'hot', 'wa_text')
            _missing = [k for k in _required if k not in _row]
            if _missing:
                raise ValueError('Release build blocked: incomplete live batch %s (%s).' %
                                 (_row.get('id', '?'), ', '.join(_missing)))
            for _field in ('id', 'name_bn', 'code', 'classes_bn', 'days_bn', 'time_bn', 'wa_text'):
                if not isinstance(_row.get(_field), str) or not _row[_field]:
                    raise ValueError('Release build blocked: live batch %s has invalid %s.' % (_row.get('id', '?'), _field))
            if not isinstance(_row.get('hot'), bool):
                raise ValueError('Release build blocked: live batch %s has invalid hot flag.' % _row.get('id', '?'))
            for _field, _min in (('fee', 1), ('filled', 0)):
                _value = _row.get(_field)
                if (not isinstance(_value, (int, float)) or isinstance(_value, bool) or
                        not _math.isfinite(_value) or int(_value) != _value or _value < _min):
                    raise ValueError('Release build blocked: live batch %s has invalid %s.' % (_row.get('id', '?'), _field))
            if _row['filled'] > 15:
                raise ValueError('Release build blocked: live batch %s exceeds the 15-student capacity.' % _row.get('id', '?'))
            _merged['fee'] = int(_row['fee'])
            _merged['filled'] = int(_row['filled'])
            _live_batches.append(_merged)
        CFG['batches'] = _live_batches

if int(CFG['capacity']['per_batch']) != 15:
    raise ValueError('Release build blocked: approved capacity must remain 15 per batch.')

_BN_DIGITS = str.maketrans('0123456789', '০১২৩৪৫৬৭৮৯')


def bn(n):
    """Any number → Bengali numerals (১,২৩ / ১,৫০০)."""
    return str(n).translate(_BN_DIGITS)


def bn_money(n):
    return '৳' + bn(format(int(n), ',d'))


def _seats():
    cap = int(CFG['capacity']['per_batch'])
    rows, left_total = [], 0
    for b in CFG['batches']:
        filled = min(int(b['filled']), cap)
        left = cap - filled
        left_total += left
        rows.append({**b, 'cap': cap, 'filled': filled, 'left': left,
                     'pct': round(filled / cap * 100)})
    return rows, left_total


BATCHES, SEATS_LEFT = _seats()
CAP = int(CFG['capacity']['per_batch'])
FEES = [int(b['fee']) for b in CFG['batches']]
FEE_MIN, FEE_MAX = min(FEES), max(FEES)


def batch_rows():
    """The batch table body — generated from the validated Neon overlay/seed."""
    out = []
    for b in BATCHES:
        hot = ' class="is-hot"' if b.get('hot') else ''
        badge = ' <em class="hot">সবচেয়ে চাহিদা</em>' if b.get('hot') else ''
        full_cls = ' is-full' if b['left'] == 0 else ''
        out.append(
            '<tr%s data-batch="%s" data-filled="%d" data-cap="%d" data-left="%d">'
            '<td><span class="bname">%s%s</span><span class="bcode">%s</span></td>'
            '<td>%s</td>'
            '<td>%s<br><small>%s</small></td>'
            '<td><span class="fee">%s</span></td>'
            '<td><div class="seats"><div class="seats__meter%s"><i data-meter style="--w:%d%%"></i></div>'
            '<div class="seats__txt"><b class="seats__count" data-filled-txt>%s/%s</b><span data-left-txt>%s সিট বাকি</span></div></div></td>'
            '<td><a class="btn btn--red btn--sm" href="#book" data-wa="%s">আসন জানতে লিখুন</a></td>'
            '</tr>' % (
                hot, _html.escape(str(b['id']), quote=True), b['filled'], b['cap'], b['left'],
                _html.escape(str(b['name_bn']), quote=True), badge,
                _html.escape(str(b['code']), quote=True),
                _html.escape(str(b['classes_bn']), quote=True),
                _html.escape(str(b['days_bn']), quote=True),
                _html.escape(str(b['time_bn']), quote=True), bn_money(b['fee']),
                full_cls, b['pct'], bn(b['filled']), bn(b['cap']), bn(b['left']),
                _html.escape(str(b['wa_text']), quote=True)))
    return ''.join(out)


def book_batch_options():
    """Build a safe, DB-driven select list and default to the currently featured batch."""
    selected_id = next((b['id'] for b in BATCHES if b.get('hot')), BATCHES[0]['id'])
    options = []
    for b in BATCHES:
        label = _html.escape(str(b['name_bn']), quote=True)
        selected = ' selected' if b['id'] == selected_id else ''
        options.append('<option value="%s"%s>%s</option>' % (label, selected, label))
    return ''.join(options)


def get_direct_download_url(url):
    if not url:
        return ''
    url = str(url).strip()
    m = _re.search(r'/file/d/([a-zA-Z0-9_-]+)', url) or _re.search(r'[?&]id=([a-zA-Z0-9_-]+)', url)
    if m:
        return f'https://drive.google.com/uc?export=download&id={m.group(1)}'
    return url


def render_library_cards(items, is_offline=False):
    cards = []
    for it in (items or []):
        tag_color = it.get('tag_color', 'red')
        tag_class = 'sheet__tag sheet__tag--red' if tag_color == 'red' else 'sheet__tag'
        tag = _html.escape(str(it.get('tag', 'রিসোর্স')), quote=True)
        code = _html.escape(str(it.get('code', 'PDF')), quote=True)
        title = _html.escape(str(it.get('title', 'ডাউনলোড ফাইল')), quote=True)
        desc = _html.escape(str(it.get('desc', '')), quote=True)
        meta = _html.escape(str(it.get('meta_info', 'PDF ফাইল')), quote=True)
        drive_url = str(it.get('drive_url') or '').strip()
        local_file = str(it.get('local_file') or 'english-dialogue-format.pdf').strip()

        if is_offline and local_file and (A / local_file).exists():
            href = 'data:application/pdf;base64,' + b64(A / local_file)
        elif drive_url:
            href = _html.escape(get_direct_download_url(drive_url), quote=True)
        else:
            href = _html.escape(str(it.get('file_url') or f'/assets/{local_file}'), quote=True)

        filename = _html.escape(str(it.get('filename') or (title.replace(' ', '-') + '.pdf')), quote=True)
        card = (
            f'<article class="sheet rv in" data-id="{_html.escape(str(it.get("id", "")), quote=True)}">\n'
            f'  <span class="{tag_class}">{tag}</span>\n'
            f'  <div>\n'
            f'    <div class="sheet__code"><svg class="ico" style="width:13px;height:13px"><use href="#i-dl"/></svg> {code}</div>\n'
            f'    <h3>{title}</h3>\n'
            f'    <p>{desc}</p>\n'
            f'  </div>\n'
            f'  <div>\n'
            f'    <div class="sheet__foot"><span>{meta}</span><b>DIRECT DOWNLOAD</b></div>\n'
            f'    <a class="btn btn--sm btn--block" href="{href}" target="_blank" rel="noopener noreferrer" download="{filename}" aria-label="{title} সরাসরি ডাউনলোড করুন">PDF ডাউনলোড <svg class="ico"><use href="#i-dl"/></svg></a>\n'
            f'  </div>\n'
            f'</article>'
        )
        cards.append(card)
    return '\n'.join(cards)


def render_hall_of_fame(items):
    cards = []
    for it in (items or []):
        color = str(it.get('badge_color', '')).strip().lower()
        color_cls = f' {color}' if color in ('red', 'brass') else ''
        badge = _html.escape(str(it.get('badge_text', 'A+\nSSC')), quote=True).replace('\n', '<br>')
        name = _html.escape(str(it.get('name', '')), quote=True)
        meta = _html.escape(str(it.get('meta', '')), quote=True)
        card = (
            f'<div class="fame-card">'
            f'<div class="inst{color_cls}">{badge}</div>'
            f'<div><b>{name}</b><small>{meta}</small></div>'
            f'</div>'
        )
        cards.append(card)
    return ''.join(cards)


def content_tokens():
    c, tm = CFG['contact'], CFG['team']
    pro, pr = CFG['programme'], CFG['pricing']
    feat = next((b for b in BATCHES if b.get('hot')), BATCHES[0])
    lib = CFG.get('library', {})
    items = lib.get('items', [])
    fame_items = CFG.get('hall_of_fame', [])
    return {
        '{{FEAT_NAME}}':      feat['name_bn'],
        '{{FEAT_CODE}}':      feat['code'],
        '{{FEAT_FILLED}}':    bn(feat['filled']),
        '{{FEAT_LEFT}}':      bn(feat['left']),
        '{{FEAT_CAP}}':       bn(feat['cap']),
        '{{FEAT_FEE}}':       bn_money(feat['fee']),
        '{{CAP}}':            bn(CAP),
        # Latin numerals for JS/CSS attributes (the counter parses them with parseFloat
        # and converts to Bengali itself, so a Bengali token here would read as 0)
        '{{CAP_NUM}}':        str(CAP),
        '{{EXP_NUM}}':        str(int(tm['experience_years'])),
        '{{FOUNDED_YEAR}}':   str(int(tm['founded_year'])),
        '{{LIBRARY_KICKER}}': lib.get('section_kicker', 'SEC 06 // রিসোর্স ও ডাউনলোড লাইব্রেরি'),
        '{{LIBRARY_TITLE}}':  lib.get('section_title', 'গণিত ও স্টাডি রিসোর্স লাইব্রেরি'),
        '{{LIBRARY_LEAD}}':   lib.get('section_lead', 'SSC ও ক্লাস ৬–১০ গণিতের গুরুত্বপূর্ণ হ্যান্ডনোট, অধ্যায়ভিত্তিক সূত্র, সাজেশন ও অনুশীলনী শিট সরাসরি ডাউনলোড করুন।'),
        '{{LIBRARY_CARDS}}':  render_library_cards(items, is_offline=False),
        '{{LIBRARY_PDF_HREF}}': '/assets/english-dialogue-format.pdf',
        '{{HALL_OF_FAME_CARDS}}': render_hall_of_fame(fame_items),
        '{{MOCK_NUM}}':       str(int(pro['mock_per_month'])),
        '{{FEAT_FILLED_NUM}}': str(int(feat['filled'])),
        '{{FEAT_ID}}':        feat['id'],
        '{{SEATS_LEFT}}':     bn(SEATS_LEFT),
        '{{FEE_MIN}}':        bn_money(FEE_MIN),
        '{{FEE_MAX}}':        bn_money(FEE_MAX),
        '{{FEE_RANGE}}':      bn_money(FEE_MIN) + ' – ' + bn_money(FEE_MAX),
        '{{PRICE_NOTE}}':     pr['note_bn'],
        '{{NEXT_BATCH}}':     CFG['next_batch']['label_bn'],
        '{{NEXT_BATCH_DATE}}': CFG['next_batch'].get('date_bn', CFG['next_batch']['label_bn']),
        '{{NEXT_BATCH_ISO}}':  CFG['next_batch'].get('start_at', ''),
        '{{AFTER_BATCH}}':    CFG['next_batch']['after_bn'],
        '{{PHONE}}':          c['phone_display'],
        '{{LOCALITY}}':       c['locality_bn'],
        '{{BOOK_BATCH_OPTIONS}}': book_batch_options(),
        '{{TEACHER}}':        tm['teacher_bn'],
        '{{SCHOOL}}':         c['school_name'],
        '{{EXPERIENCE}}':     bn(tm['experience_years']),
        '{{DEGREE}}':         tm['degree_bn'],
        '{{DEVELOPER}}':      tm['developer_bn'],
        '{{MOCK}}':           bn(pro['mock_per_month']),
        '{{CLASSES_PM}}':     bn(pro['classes_per_month']),
        '{{CLASS_RANGE}}':    pro['classes_bn'],
        '{{EXAM}}':           pro['exam'],
    }


CONTACT_SWAPS = [
    ('+8801641045469', '+' + CFG['contact']['whatsapp']),
    ('8801641045469',  CFG['contact']['whatsapp']),
    ('০১৬৪১-০৪৫৪৬৯',   CFG['contact']['phone_display']),
    ('pranto.rai.37',  CFG['contact']['facebook']),
    ('UyNxwUBw3sjnmGE29', CFG['contact']['map_short']),
    ('https://www.darsanaidealschool.com/', CFG['contact']['school_url']),
]


def apply_content(html):
    """Resolve every {{TOKEN}}, the generated batch table and the contact literals."""
    for k, v in content_tokens().items():
        html = html.replace(k, v)
    html = html.replace('<!--__BATCH_ROWS__-->', batch_rows())
    # last line of defence: no hard-coded batch size may survive anywhere in the file
    for _lit in ('১২ জনের', '১২ জন', '১২ আসন', '১২টি সিট'):
        html = html.replace(_lit, bn(CAP) + _lit[2:])
    # any prose that still says "১২ জন" (JSON-LD, og:description, comments) follows the cap
    html = (html.replace('১২ জনের', bn(CAP) + ' জনের')
                .replace('১২ জন',   bn(CAP) + ' জন')
                .replace('১২ আসন',  bn(CAP) + ' আসন')
                .replace('১২টি ক্লাস', bn(int(CFG['programme']['classes_per_month'])) + 'টি ক্লাস')
                .replace('৪টি মক', bn(int(CFG['programme']['mock_per_month'])) + 'টি মক'))
    for a, b in CONTACT_SWAPS:
        html = html.replace(a, b)
    return html


import re as _re0
if os.environ.get('MA_STATIC_ONLY') == '1':
    # hosts without functions (Netlify static, Cloudflare Pages, file://) — no API call at all
    js = _re0.sub(r'/\*__LIVE_START__\*/.*?/\*__LIVE_END__\*/', '', js, flags=_re0.S)

for k, v in TOKENS.items():
    head = swap(head, k, v)
    top = swap(top, k, v)
    mid = swap(mid, k, v)
    bot = swap(bot, k, v)

# ---- CANONICAL HOST — the only line to edit when a custom domain lands ----
# Change SITE_HOST, run `python3 _src/build.py --publish`, and canonical / hreflang /
# og:url / JSON-LD @ids / sitemap <loc> / robots Sitemap: all follow automatically.
SITE_HOST = "https://mathacademydarsana.vercel.app"   # ← the live Vercel subdomain
S = SITE_HOST

# ---- CSP meta (same policy as the vercel.json header; meta is the portable fallback) ----
# 'unsafe-inline' is required by the design: the build inlines every style + script.
# No external origins are allowed — fonts are self-hosted, there is no CDN, no API call.
CSP_META = ('<meta http-equiv="Content-Security-Policy" content="'
            "default-src 'self'; "
            "img-src 'self' data:; "
            "style-src 'self' 'unsafe-inline'; "
            "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://vitals.vercel-insights.com; "
            "font-src 'self' data:; "
            "connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com https://*.vercel-analytics.com https://*.vercel-insights.com; "
            "object-src 'none'; "
            "base-uri 'self'; "
            "form-action 'self'"
            '">')

# Homepage copy and FAQPage schema share this single source so visible answers
# cannot drift away from the JSON-LD. Tokens are resolved by apply_content().
HOME_FAQS = [
  ("ক্লাস কোথায় হয়? অনলাইন ক্লাস আছে?",
   "ক্লাসগুলো দর্শনা, চুয়াডাঙ্গায় অফলাইন ব্যাচে হয়; অনলাইন ক্লাস এই অফারের অংশ নয়। নির্দিষ্ট লোকেশন, বর্তমান ব্যাচের সময় ও আসন ভর্তি আগে WhatsApp-এ নিশ্চিত করুন."),
  ("কোন শ্রেণির শিক্ষার্থীরা ভর্তি হতে পারে?",
   "বর্তমান প্রোগ্রামে {{CLASS_RANGE}} অন্তর্ভুক্ত; প্রতি ব্যাচে সর্বোচ্চ {{CAP}} জন। কোন শ্রেণির ব্যাচ চালু আছে, তার সময় ও আসন ব্যাচের তালিকা বা WhatsApp-এ নিশ্চিত করুন."),
  ("মাসে কতগুলো ক্লাস, মক টেস্ট, আর ফি কত?",
   "বর্তমান প্রোগ্রামে মাসে {{CLASSES_PM}}টি ক্লাস ও {{MOCK}}টি মক টেস্ট। ব্যাচভেদে মাসিক ফি {{FEE_RANGE}}। ভর্তি আগে নিজের শ্রেণির ব্যাচ, সময় ও ফি WhatsApp-এ নিশ্চিত করুন."),
  ("বর্তমান আসন ও ভর্তি-প্রক্রিয়া কীভাবে জানব?",
   "WhatsApp-এ শিক্ষার্থীর নাম, শ্রেণি ও পছন্দের ব্যাচ লিখে চলতি আসন ও ভর্তি-প্রক্রিয়া জেনে নিন। এই ফর্ম আসন সংরক্ষণ করে না; ভর্তি নিশ্চিত করার আগে মালিকের কাছ থেকে উত্তর নিন."),
  ("গণিতে দুর্বল হলে কীভাবে শুরু করব?",
   "শ্রেণি, সমস্যার অধ্যায় বা ধাপ, এবং পছন্দের ব্যাচ জানিয়ে WhatsApp-এ জিজ্ঞেস করুন বর্তমান অফলাইন ব্যাচটি উপযুক্ত কি না। কোনো নির্দিষ্ট নম্বর বা পরীক্ষার ফলের নিশ্চয়তা দেওয়া হয় না."),
]

def home_faq_markup():
    parts = []
    for i, (question, answer) in enumerate(HOME_FAQS):
        opened = ' open' if i == 0 else ''
        parts.append(
            '<details class="faq__item"%s><summary class="faq__q"><span>%s</span><span class="faq__ic" aria-hidden="true">+</span></summary>'
            '<div class="faq__a"><p>%s</p></div></details>' %
            (opened, _html.escape(question), _html.escape(answer)))
    return '\n'.join(parts)

bot = bot.replace('<!--__HOME_FAQ__-->', home_faq_markup())

LD = {"@context": "https://schema.org", "@graph": [
  {"@type": "WebSite", "@id": S + "/#website",
   "url": S + "/", "name": "ম্যাথ একাডেমি দর্শনা",
   "alternateName": ["Math Academy Darshana", "Math Academy Darsana"],
   "publisher": {"@id": S + "/#organization"},
   "inLanguage": "bn-BD"},
  {"@type": "EducationalOrganization", "@id": S + "/#organization",
   "name": "Math Academy", "alternateName": ["Math Academy Darsana", "ম্যাথ একাডেমি", "ম্যাথ একাডেমি দর্শনা"],
   "url": S + "/",
   "logo": {
     "@type": "ImageObject",
     "@id": S + "/#logo",
     "url": S + "/logo.png",
     "caption": "Math Academy Darsana Official Logo"
   },
   "image": S + "/logo.png",
   "telephone": "+8801641045469",
   "priceRange": "{{FEE_RANGE}} / মাস",
   "currenciesAccepted": "BDT",
   "address": {
     "@type": "PostalAddress",
     "streetAddress": "Darshana, Chuadanga, Bangladesh",
     "addressLocality": "Darshana",
     "addressRegion": "Chuadanga",
     "postalCode": "7200",
     "addressCountry": "BD"
   },
   "hasMap": "https://maps.app.goo.gl/UyNxwUBw3sjnmGE29",
   "areaServed": [
     {"@type": "City", "name": "Darshana"},
     {"@type": "AdministrativeArea", "name": "Chuadanga"}
   ],
   "founder": {"@id": S + "/#person-pranto-rai"},
   "sameAs": ["https://www.facebook.com/pranto.rai.37"]},
  {"@type": "Person", "@id": S + "/#person-pranto-rai",
   "name": "Pranto Rai",
   "alternateName": "প্রান্ত রাই",
   "jobTitle": "Mathematics Teacher",
   "description": "Founder and lead instructor at Math Academy Darsana, and Mathematics Teacher at Darsana Ideal School.",
   "worksFor": {
     "@type": "EducationalOrganization",
     "name": "Darsana Ideal School",
     "url": "https://www.darsanaidealschool.com/"
   },
   "affiliation": {"@id": S + "/#organization"},
   "telephone": "+8801641045469",
   "sameAs": ["https://www.facebook.com/pranto.rai.37"],
   "knowsAbout": ["Mathematics", "Higher Mathematics", "Secondary School Certificate (SSC) Mathematics", "গণিত", "উচ্চতর গণিত", "জ্যামিতি", "ত্রিকোণমিতি", "বীজগণিত"],
   "knowsLanguage": ["bn", "en"]},
  {"@type": "Course", "@id": S + "/#courses", "name": "{{CLASS_RANGE}} গণিতের অফলাইন ব্যাচ (দর্শনা)",
   "description": "{{CLASS_RANGE}}-এর অফলাইন গণিতের ব্যাচ; প্রতি ব্যাচে সর্বোচ্চ {{CAP}} জন। মাসে {{CLASSES_PM}}টি ক্লাস ও {{MOCK}}টি মক টেস্ট। ব্যাচভেদে মাসিক ফি {{FEE_RANGE}}।",
   "provider": {"@id": S + "/#organization"},
   "hasCourseInstance": [
     {"@type": "CourseInstance", "courseMode": "onsite", "name": b['name_bn'],
      "description": b['classes_bn'] + ' · ' + b['days_bn'] + ' · ' + b['time_bn']}
     for b in BATCHES]},
  {"@type": "FAQPage", "@id": S + "/#faq", "mainEntity": [
    {"@type": "Question", "name": q,
     "acceptedAnswer": {"@type": "Answer", "text": a}}
    for q, a in HOME_FAQS]},
  {"@type": "BreadcrumbList", "@id": S + "/#crumbs", "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "হোম", "item": S + "/"},
    {"@type": "ListItem", "position": 2, "name": "শিক্ষক প্রান্ত রাই", "item": S + "/#teacher"},
    {"@type": "ListItem", "position": 3, "name": "ব্যাচ ও আসন", "item": S + "/#batches"},
    {"@type": "ListItem", "position": 4, "name": "ভর্তি-তথ্য", "item": S + "/#book"}]}
]}
jsonld = '<script type="application/ld+json">' + json.dumps(LD, ensure_ascii=False, separators=(',', ':')) + '</script>\n'

# inline build carries the photo itself, so a preload link would only duplicate ~96 KB
head = head.replace('<!--__PRELOAD__-->', '__KEEP_PRELOAD__')

doc = (head
       + spec
       + '<style>\n' + fonts + '\n' + css + '\n' + extra_css + '\n</style>\n'
       + top + mid + bot
       + '\n<script>\n' + gsap + '\n</script>\n'
       + '<script>\n' + js + '\n</script>\n'
       + jsonld
       + '</body>\n</html>\n')

doc = doc.replace('__KEEP_PRELOAD__', '')          # inline: nothing to preload
doc = doc.replace('__CSP__', '')                   # inline: file:// page — policy ships with the host
doc = doc.replace('<!--__PWA__-->', '')             # inline: file:// page — no manifest, no SW
doc = _re0.sub(r'/\*__LIVE_START__\*/.*?/\*__LIVE_END__\*/', '', doc, flags=_re0.S)  # no API from file://
# ----------------------------------------------------------------------------
#  BLOG DATA — loaded once, used by the homepage teaser and the /blog/ routes
# ----------------------------------------------------------------------------
import importlib.util as _ilu
# ---------------------------------------------------------------------------
# BLOG CONTENT — full Bengali drafts in docs/blog-drafts/ are the source of truth.
# Each file contains author handoff notes + a complete publishable article in
# Markdown. This tiny renderer intentionally supports only the Markdown used in
# those drafts (headings, paragraphs, lists, tables, quotes, links, emphasis,
# inline code), so builds need no network package or fragile converter dependency.
# ---------------------------------------------------------------------------

def _md_inline(text):
    text = _html.escape(text, quote=False)
    text = _re.sub(r'`([^`]+)`', r'<code>\1</code>', text)
    def _link(m):
        label, href = m.group(1), m.group(2).strip()
        safe = _html.escape(href, quote=True)
        external = href.startswith('https://') or href.startswith('http://')
        rel = ' rel="noopener noreferrer"' if external else ''
        return '<a href="%s"%s>%s</a>' % (safe, rel, label)
    text = _re.sub(r'\[([^\]]+)\]\(([^)]+)\)', _link, text)
    text = _re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
    text = _re.sub(r'(?<!\*)\*([^*]+)\*(?!\*)', r'<em>\1</em>', text)
    return text


def _md_table_row(line):
    line = line.strip().strip('|')
    return [_md_inline(x.strip()) for x in line.split('|')]


def _markdown_to_html(markdown):
    lines = markdown.strip().splitlines()
    out, para = [], []
    list_tag = None
    code = False
    code_lines = []
    def flush_para():
        if para:
            out.append('<p>' + ' '.join(_md_inline(x.strip()) for x in para) + '</p>')
            para.clear()
    def close_list():
        nonlocal list_tag
        if list_tag:
            out.append('</' + list_tag + '>')
            list_tag = None
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        if stripped.startswith('```'):
            flush_para(); close_list()
            if code:
                out.append('<pre><code>' + _html.escape('\n'.join(code_lines)) + '</code></pre>')
                code_lines = []; code = False
            else:
                code = True
            i += 1; continue
        if code:
            code_lines.append(line); i += 1; continue
        if not stripped:
            flush_para(); close_list(); i += 1; continue
        if stripped.startswith('|') and i + 1 < len(lines) and _re.match(r'^\s*\|?\s*:?-{3,}', lines[i + 1]):
            flush_para(); close_list()
            heads = _md_table_row(stripped)
            i += 2
            rows = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                rows.append(_md_table_row(lines[i])); i += 1
            out.append('<div class="t-scroll" role="region" aria-label="তথ্য-সারণি" tabindex="0"><table><thead><tr>'
                       + ''.join('<th scope="col">' + c + '</th>' for c in heads)
                       + '</tr></thead><tbody>'
                       + ''.join('<tr>' + ''.join('<td>' + c + '</td>' for c in row) + '</tr>' for row in rows)
                       + '</tbody></table></div>')
            continue
        hm = _re.match(r'^(#{2,4})\s+(.+)$', stripped)
        if hm:
            flush_para(); close_list()
            level = min(4, len(hm.group(1)))
            out.append('<h%d>%s</h%d>' % (level, _md_inline(hm.group(2)), level))
            i += 1; continue
        if stripped in ('---', '***'):
            flush_para(); close_list(); out.append('<hr>'); i += 1; continue
        if stripped.startswith('>'):
            flush_para(); close_list(); quote = []
            while i < len(lines) and lines[i].strip().startswith('>'):
                quote.append(lines[i].strip()[1:].strip()); i += 1
            out.append('<blockquote><p>' + ' '.join(_md_inline(x) for x in quote) + '</p></blockquote>')
            continue
        um = _re.match(r'^[-*]\s+(.+)$', stripped)
        om = _re.match(r'^\d+[.)]\s+(.+)$', stripped)
        marker = 'ul' if um else ('ol' if om else None)
        if marker:
            flush_para()
            if list_tag != marker:
                close_list(); out.append('<' + marker + '>'); list_tag = marker
            out.append('<li>' + _md_inline((um or om).group(1)) + '</li>')
            i += 1; continue
        flush_para(); close_list(); para.append(stripped); i += 1
    flush_para(); close_list()
    if code:
        out.append('<pre><code>' + _html.escape('\n'.join(code_lines)) + '</code></pre>')
    return '\n'.join(out)


def _plain_answer(markdown):
    text = _re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', markdown)
    text = _re.sub(r'[`*_>#]', '', text)
    return ' '.join(text.split())


def _parse_draft(path):
    raw = path.read_text(encoding='utf-8')
    match = _re.match(r'\A---\s*\n(.*?)\n---\s*\n(.*)\Z', raw, _re.S)
    if not match:
        raise ValueError('Blog draft needs YAML-like front matter: ' + str(path))
    meta = {}
    for line in match.group(1).splitlines():
        if not line.strip() or line.lstrip().startswith('#') or ':' not in line:
            continue
        key, value = line.split(':', 1); value = value.strip()
        if value.startswith('"') and value.endswith('"'):
            value = json.loads(value)
        elif key == 'mins':
            value = int(value)
        meta[key.strip()] = value
    raw_body = match.group(2)
    if '<!-- PUBLISH_BODY_START -->' not in raw_body or '<!-- PUBLISH_BODY_END -->' not in raw_body:
        raise ValueError('Blog draft needs PUBLISH_BODY markers: ' + str(path))
    publish = raw_body.split('<!-- PUBLISH_BODY_START -->', 1)[1].split('<!-- PUBLISH_BODY_END -->', 1)[0].strip()
    faq = []
    faq_match = _re.search(r'<!-- FAQ_START -->(.*?)<!-- FAQ_END -->', publish, _re.S)
    if faq_match:
        faq_raw = faq_match.group(1).strip()
        chunks = _re.split(r'(?m)^###\s+', faq_raw)
        for chunk in chunks[1:]:
            lines = chunk.strip().splitlines()
            if not lines:
                continue
            q = lines[0].strip()
            answer = '\n'.join(lines[1:]).strip()
            if q and answer:
                faq.append((q, _plain_answer(answer)))
        publish = publish[:faq_match.start()] + publish[faq_match.end():]
    if len(faq) != 3:
        raise ValueError('Each blog draft must have exactly 3 FAQ pairs: %s has %d' % (path, len(faq)))
    body = _markdown_to_html(publish)
    required = ('slug','tag','title','h1','desc','keyword','date','updated','mins')
    missing = [k for k in required if k not in meta]
    if missing:
        raise ValueError('Blog draft missing %s: %s' % (', '.join(missing), path))
    meta['faq'] = faq
    meta['body'] = body
    return meta


class _BlogData: pass
BLOG = _BlogData()
_DRAFT_DIR = pathlib.Path('docs/blog-drafts')
BLOG.POSTS = [_parse_draft(p) for p in sorted(_DRAFT_DIR.glob('*.md')) if p.name != 'README.md']
# Merge any dynamic/custom blog posts from CFG
custom_posts = CFG.get('settings', {}).get('blog_posts', []) or CFG.get('blog_posts', [])
existing_slugs = {p['slug']: p for p in BLOG.POSTS}
for cp in custom_posts:
    if not isinstance(cp, dict) or not cp.get('slug'):
        continue
    cp_shaped = {
        'slug': str(cp['slug']),
        'tag': str(cp.get('tag', 'সাধারণ')),
        'title': str(cp.get('title', cp['slug'])),
        'h1': str(cp.get('h1', cp.get('title', cp['slug']))),
        'desc': str(cp.get('desc', '')),
        'keyword': str(cp.get('keyword', cp.get('tag', 'গণিত'))),
        'date': str(cp.get('date', '2026-10-28')),
        'updated': str(cp.get('updated', '2026-10-28')),
        'mins': int(cp.get('mins', 5)),
        'faq': cp.get('faq') if isinstance(cp.get('faq'), list) and len(cp.get('faq')) == 3 else [
            ('এই লেখাটি কাদের জন্য?', 'ম্যাথ একাডেমির শিক্ষার্থী ও অভিভাবকদের জন্য।'),
            ('কীভাবে প্রস্তুতি নেব?', 'নিয়মিত অনুশীলন ও মক টেস্টের মাধ্যমে।'),
            ('আরও জানতে কোথায় যোগাযোগ করব?', 'আমাদের হোয়াটসঅ্যাপ নম্বরে যোগাযোগ করুন।')
        ],
        'body': cp.get('body', '') if '<p>' in cp.get('body', '') else _markdown_to_html(cp.get('body', ''))
    }
    if cp_shaped['slug'] in existing_slugs:
        existing_slugs[cp_shaped['slug']].update(cp_shaped)
    else:
        BLOG.POSTS.append(cp_shaped)

if len(BLOG.POSTS) < 10:
    raise ValueError('The public blog must contain at least 10 full drafts; found %d' % len(BLOG.POSTS))

# Four featured posts on the landing page; the remaining six live on /blog/.
HOME_SLUGS = ['gonit-valo-kore-podar-upay', 'ssc-goniter-sob-sutro',
              'goniter-voy-katanor-7-obhyas', 'gonit-practice-sera-upay']


def home_posts(n=4):
    picked = [p for s_ in HOME_SLUGS for p in BLOG.POSTS if p['slug'] == s_]
    if len(picked) < n:
        picked += [p for p in BLOG.POSTS if p not in picked]
    return picked[:n]

_BN = {ord('0') + i: c for i, c in enumerate('০১২৩৪৫৬৭৮৯')}


def bn(n):
    return str(n).translate(_BN)


_BN_MONTHS = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই',
              'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর']


def bn_date(iso):
    """'2026-10-28' → '২৬ অক্টোবর ২০২৬' — no Latin digits anywhere in visible text."""
    try:
        y, m, d = iso.split('-')
        return '%s %s %s' % (bn(int(d)), _BN_MONTHS[int(m) - 1], bn(int(y)))
    except Exception:
        return iso


def blog_section(linked=True, n=4):
    """Homepage teaser. `linked=False` for the offline single file, where /blog/
    does not exist — the cards stay (so nobody thinks the blog vanished) but
    they stop pretending to be links."""
    tag = 'a' if linked else 'div'
    cards = []
    for pst in home_posts(n):
        href = ' href="/blog/%s/"' % pst['slug'] if linked else ''
        cards.append(
            '<%s class="postcard"%s>'
            '<span class="postcard__tag">%s</span>'
            '<h3>%s</h3><p>%s</p>'
            '<span class="postcard__foot"><span>%s মিনিট পড়া</span>'
            '<b>%s</b></span></%s>'
            % (tag, href, pst['tag'], pst['h1'], pst['desc'], bn(pst['mins']),
               'পড়ুন →' if linked else 'অনলাইনে পড়ুন', tag))
    more = ''
    if linked:
        more = ('<div class="blogsec__more">'
                '<a class="btn btn--red btn--lg" href="/blog/">আরও ব্লগ দেখুন '
                '<svg class="ico ar"><use href="#i-arrow"/></svg></a>'
                '<p class="blogsec__more-note">বাকি ' + bn(len(BLOG.POSTS) - n) +
                'টি লেখা ব্লগ পাতায় — সূত্রের তালিকা, রুটিন, অভিভাবকের প্রশ্ন আর '
                'পরীক্ষার কৌশল।</p></div>')
    note = '' if linked else (
        '<p class="blogsec__note">পূর্ণ লেখাগুলো অনলাইন সাইটে — '
        '<b>mathacademydarsana.vercel.app/blog</b></p>')
    return (
        '<section class="sec sec--paper" id="blog" aria-labelledby="blogTitle">'
        '<div class="wrap">'
        '<div class="sec-head"><div>'
        '<span class="kicker kicker--red">SEC 09 // ব্লগ ও লেখা</span>'
        '<h2 class="sec-title" id="blogTitle">গণিত নিয়ে <span class="bn">যা লিখি</span></h2>'
        '<p class="sec-lead">ক্লাসরুমে যে প্রশ্নগুলো বারবার আসে — সেগুলোর উত্তর লিখে রাখি। '
        'দর্শনা ও চুয়াডাঙ্গার অভিভাবকদের জন্য, বইয়ের অনুবাদ নয়।</p>'
        '</div><div class="sec-no">09</div></div>'
        '<div class="bloggrid">' + ''.join(cards) + '</div>' + note + more +
        '</div></section>')


doc = doc.replace('<!--__BLOG_SECTION__-->', blog_section(linked=False))
doc = doc.replace('<!--__BLOG_NAV__-->', '<a href="' + S + '/blog/">ব্লগ</a>')
# the footer's blog link must still work when the file is opened from disk
doc = doc.replace('href="/blog/', 'href="' + S + '/blog/')
doc = doc.replace('<!--__GUIDE_LINK__-->', '')     # inline: no /blog/ offline
doc = doc.replace('__SITE__', S)
# Self-contained offline HTML embeds the library PDF; the published page uses the same-origin asset path.
_pdf_data_uri = 'data:application/pdf;base64,' + b64(A / 'english-dialogue-format.pdf')
doc = doc.replace('{{LIBRARY_PDF_HREF}}', _pdf_data_uri)
doc = doc.replace('{{LIBRARY_CARDS}}', render_library_cards(CFG.get('library', {}).get('items', []), is_offline=True))
doc = apply_content(doc)
pathlib.Path('math-academy.html').write_text(doc, encoding='utf-8')
print('built', os.path.getsize('math-academy.html') // 1024, 'KB')


# ---------------------------------------------------------------- publish mode
# python3 _src/build.py --publish  →  dist/ with external fonts/images (best for real hosting)
import sys
if '--publish' in sys.argv:
    D = pathlib.Path('dist')
    (D / 'assets').mkdir(parents=True, exist_ok=True)
    (D / 'assets' / 'english-dialogue-format.pdf').write_bytes((A / 'english-dialogue-format.pdf').read_bytes())
    # production document = the same markup minus the developer spec comment
    head = head.replace('__CSP__', CSP_META)
    pub = (head + '<style>' + fonts + css + extra_css + '</style>'
           + top + mid + bot
           + '<script>' + gsap + '</script>' + '<script>' + js + '</script>' + jsonld
           + '\n' + VERCEL_ANALYTICS_SCRIPTS + '\n</body></html>')
    # __SITE__ must be resolved in the published build too (canonical, hreflang, og:url, og:image)
    pub = pub.replace('__SITE__', S)
    pub = pub.replace('<!--__PWA__-->',
        '<meta name="apple-mobile-web-app-capable" content="yes">\n'
        '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n'
        '<meta name="apple-mobile-web-app-title" content="ম্যাথ একাডেমি দর্শনা">\n'
        '<meta name="mobile-web-app-capable" content="yes">')
    pub = apply_content(pub)
    pub = pub.replace('__KEEP_PRELOAD__', '')      # the real preload links are injected below
    # the guide only exists on the hosted build — the offline single file must stay self-contained
    pub = pub.replace('<!--__GUIDE_LINK__-->', '<a href="/blog/">ব্লগ ও লেখা <span>09</span></a>')
    pub = pub.replace('<!--__BLOG_SECTION__-->', blog_section(linked=True))
    # the header nav gets the blog too — a drawer link alone was not discoverable
    pub = pub.replace('<!--__BLOG_NAV__-->', '<a href="/blog/">ব্লগ</a>')
    # 1. pull every base64 font out to assets/fonts/*.woff2
    import re as _re
    (D / 'assets').mkdir(exist_ok=True)
    idx = {'n': 0}
    cache = {}
    cache_names = set()
    def _emit(kind, ext, payload_b64):
        key = (kind, payload_b64)
        if key in cache:
            return cache[key]
        idx['n'] += 1
        name = 'assets/%s%d.%s' % (kind, idx['n'], ext)
        (D / name).write_bytes(base64.b64decode(payload_b64))
        cache[key] = name
        if kind == 'f':
            cache_names.add(name)
        return name
    def _font_repl(m):
        return "url(%s) format('woff2')" % _emit('f', 'woff2', m.group(1))
    pub = _re.sub(r"url\(data:font/woff2;base64,([A-Za-z0-9+/=]+)\) format\('woff2'\)", _font_repl, pub)
    def _img_repl(m):
        kind, data = m.group(1), m.group(2)
        ext = {'jpeg': 'jpg', 'webp': 'webp', 'png': 'png'}[kind]
        return _emit('i', ext, data)
    HERO_B64 = b64(A / 'hero-color.webp')
    hero = {'name': None}
    def _img_repl2(m):
        name = _img_repl(m)
        if m.group(2) == HERO_B64 and hero['name'] is None:
            hero['name'] = name
        return name
    pub = _re.sub(r'data:image/(jpeg|webp|png);base64,([A-Za-z0-9+/=]+)', _img_repl2, pub)

    # Ship DPR-aware hero and avatar variants; the one-file offline HTML above
    # still embeds the complete originals. These keep the published first view
    # sharp without downloading a desktop-sized photo on a small, low-DPR phone.
    hero_sizes = '(max-width: 520px) calc(100vw - 36px), 42vw'
    hero_srcset = []
    if hero['name']:
        for _width in (320, 400):
            _path = _emit('i', 'webp', b64(A / ('hero-%d.webp' % _width)))
            hero_srcset.append('/%s %dw' % (_path, _width))
        hero_srcset.append('/%s 640w' % hero['name'])
        _srcset = ', '.join(hero_srcset)
        def _hero_attrs(m):
            _tag = m.group(0)
            _tag = _tag.replace('src="%s"' % hero['name'],
                                'src="%s" srcset="%s" sizes="%s"' %
                                (hero['name'], _srcset, hero_sizes), 1)
            return _tag
        pub, _hero_count = _re.subn(
            r'<img\b[^>]*class="tphoto__img tphoto__img--color"[^>]*>',
            _hero_attrs, pub, count=1)
        if _hero_count != 1:
            raise ValueError('Release build blocked: hero image could not receive responsive sources.')
        pub = pub.replace('</head>',
            '<link rel="preload" as="image" href="/%s" imagesrcset="%s" imagesizes="%s" fetchpriority="high" media="(min-width: 720px)">\n</head>' %
            (hero['name'], _srcset, hero_sizes))

    _avatar_b64 = b64(A / 'av-160.webp')
    _avatar_name = cache.get(('i', _avatar_b64))
    if _avatar_name:
        _avatar_srcset = ', '.join('/%s %dw' %
            (_emit('i', 'webp', b64(A / ('av-%d.webp' % _width))), _width)
            for _width in (40, 80, 160))
        def _avatar_attrs(m):
            _tag = m.group(0)
            _tag = _tag.replace('src="%s"' % _avatar_name,
                                'src="%s" srcset="%s" sizes="40px"' %
                                (_avatar_name, _avatar_srcset), 1)
            return _tag
        pub, _avatar_count = _re.subn(
            r'<img\b[^>]*class="teacher-card__av"[^>]*>',
            _avatar_attrs, pub, count=1)
        if _avatar_count != 1:
            raise ValueError('Release build blocked: teacher avatar could not receive responsive sources.')
    # preload every webfont so the first paint already has the real metrics (CLS = 0)
    pre = ''.join('<link rel="preload" as="font" type="font/woff2" href="%s" crossorigin>\n' % f
                  for f in sorted(n for n in cache_names))
    pub = pub.replace('</head>', pre + '</head>')
    (D / 'index.html').write_text(pub, encoding='utf-8')
    OLD_HOSTS = ('https://math-academy-darsana.vercel.app', 'https://mathacademydarsana.vercel.app')
    for extra in ('robots.txt', 'sitemap.xml', 'llms.txt', 'bc14bb9c7dc34ee3818627cbec856bfe.txt'):
        src = pathlib.Path(extra)
        if src.exists():
            # rewrite the host so robots/sitemap can never drift from SITE_HOST
            body = src.read_text(encoding='utf-8')
            for h in OLD_HOSTS:
                body = body.replace(h, SITE_HOST)
            if extra == 'llms.txt':                    # keep the AI facts in sync with site.json
                body = apply_content(body)
                # the page list must be generated, or a new post is invisible to AI crawlers
                head, _, _tail = body.partition('## Pages')
                order = ['', 'blog/'] + ['blog/%s/' % p_['slug'] for p_ in BLOG.POSTS]
                seen, lines = set(), []
                for path_ in order:
                    if path_ in seen:
                        continue
                    seen.add(path_)
                    if path_ == '':
                        lines.append('- %s/ — homepage (about, method, teacher, batches, library, results, contact)' % SITE_HOST)
                    elif path_ == 'blog/':
                        lines.append('- %s/blog/ — blog index (%d posts, Bengali, with FAQ)' % (SITE_HOST, len(BLOG.POSTS)))
                    else:
                        _p = next(p_ for p_ in BLOG.POSTS if 'blog/%s/' % p_['slug'] == path_)
                        lines.append('- %s/%s — %s' % (SITE_HOST, path_, _p['title']))
                body = head + '## Pages\n' + '\n'.join(lines) + '\n'
            (D / extra).write_text(body, encoding='utf-8')

    # ---- 404: same theme, same font/asset pipeline, noindex ----
    head404 = '''<!DOCTYPE html>
<html lang="bn-BD">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>৪০৪ — পৃষ্ঠা পাওয়া যায়নি | ম্যাথ একাডেমি দর্শনা</title>
<meta name="description" content="এই ঠিকানায় কোনো পৃষ্ঠা নেই। ম্যাথ একাডেমি, দর্শনা — SSC ও ক্লাস ৬–১০ গণিত; প্রতি ব্যাচে সর্বোচ্চ {{CAP}} জন।">
<meta name="robots" content="noindex,follow">
<meta name="theme-color" content="#0A0A0A">
<meta name="color-scheme" content="light">
__CSP__
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon-48x48.png" sizes="48x48" type="image/png">
<link rel="icon" href="/favicon-96x96.png" sizes="96x96" type="image/png">
<link rel="icon" href="/favicon-192x192.png" sizes="192x192" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta property="og:site_name" content="ম্যাথ একাডেমি দর্শনা">
<meta name="application-name" content="ম্যাথ একাডেমি দর্শনা">
</head>
<body>
'''
    doc404 = (head404.replace('__CSP__', CSP_META)
              + '<style>' + fonts + css + '</style>'
              + pathlib.Path('_src/404-body.html').read_text(encoding='utf-8')
              + '\n' + VERCEL_ANALYTICS_SCRIPTS + '\n</body></html>')
    doc404 = _re.sub(r"url\(data:font/woff2;base64,([A-Za-z0-9+/=]+)\) format\('woff2'\)", _font_repl, doc404)
    doc404 = doc404.replace('</head>', pre + '</head>')
    # 404.html is served from ANY depth (/blog/<slug>/typo, /x/y/z …), so every
    # asset reference must be root-absolute — a relative "assets/…" resolves
    # against the broken URL, the webfonts never load, and the whole page
    # renders in tofu boxes. This is the bug that made 404 look "not added".
    for _a, _b in (('href="assets/', 'href="/assets/'),
                   ('src="assets/',  'src="/assets/'),
                   ('url(assets/',   'url(/assets/'),
                   ('url("assets/',  'url("/assets/'),
                   ("url('assets/",  "url('/assets/")):
        doc404 = doc404.replace(_a, _b)
    (D / '404.html').write_text(apply_content(doc404), encoding='utf-8')
    # ----------------------------------------------------------------------
    #   BLOG  →  dist/blog/…   (full Markdown drafts live in docs/blog-drafts/)
    #   Exactly ten source drafts; each route carries Article + FAQ + Breadcrumb JSON-LD.
    # ----------------------------------------------------------------------

    blog_css = pathlib.Path('_src/blog.css').read_text(encoding='utf-8')
    # the reading pages link one shared font sheet instead of inlining ~160 KB each
    fonts_css = _re.sub(r"url\(data:font/woff2;base64,([A-Za-z0-9+/=]+)\) format\('woff2'\)", _font_repl, fonts)
    # absolute paths: the same sheet is used at /, /blog/ and /blog/<slug>/
    fonts_css = fonts_css.replace('url(assets/', 'url(/assets/')
    # ---- PWA: manifest, icons, service worker (installable = durable autoplay grant)
    for _f in ('manifest.webmanifest', 'site.webmanifest', 'sw.js', 'logo.png', 'logo-512.png', 'favicon-48x48.png', 'favicon-96x96.png', 'favicon-192x192.png', 'icon-192x192.png', 'icon-512x512.png', 'apple-touch-icon.png', 'favicon.ico', 'icon-192.png', 'icon-512.png',
               'icon-192-maskable.png', 'icon-512-maskable.png'):
        (D / _f).write_bytes((pathlib.Path('_src/pwa') / _f).read_bytes())
    (D / 'assets' / 'fonts.css').write_text(fonts_css, encoding='utf-8')
    LOGO_TIGHT = TOKENS['__LOGO_TIGHT__']
    LOGO = '<img class="brand__svg" src="data:image/png;base64,' + LOGO_TIGHT + '" alt="ম্যাথ একাডেমি লোগো" width="40" height="40" aria-hidden="true">'
    WA = 'https://wa.me/8801641045469'

    SVG_SPRITE = '''<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
  <symbol id="i-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><path d="M4 12h15M13 6l6 6-6 6"/></symbol>
  <symbol id="i-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square"><path d="M4 12.5l5 5L20 6.5"/></symbol>
  <symbol id="i-wa" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 21l1.7-5A8.5 8.5 0 1 1 8 19.4L3 21z"/><path d="M8.5 8.5c0 3 2.5 5.3 5.5 5.5.7 0 1.4-.5 1.4-1.2 0-.5-1.6-1.2-2-1.2-.3 0-.6.7-1 .7-.8 0-2.3-1.5-2.3-2.3 0-.4.7-.7.7-1 0-.4-.7-2-1.2-2-.7 0-1.1.7-1.1 1.5z" fill="currentColor" stroke="none"/></symbol>
  <symbol id="i-phone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 4h4l2 5-2.5 1.5a12 12 0 0 0 6 6L15 14l5 2v4a12 12 0 0 1-16-16z"/></symbol>
  <symbol id="i-fb" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.62 23.1 24 18.1 24 12.07z"/></symbol>
  <symbol id="i-wa2" viewBox="0 0 24 24" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.44-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.49 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.69 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.48-8.42"/></symbol>
  <symbol id="i-gmap" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 21.5s7-6.4 7-11.5a7 7 0 1 0-14 0c0 5.1 7 11.5 7 11.5z"/><circle cx="12" cy="9.6" r="2.7"/></symbol>
  <symbol id="i-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 14.5v2.5"/></symbol>
</svg>'''

    # Reuse the landing page's Web Audio approach on the blog with rich cues,
    # shared volume levels, and sync with landing page mute state.
    BLOG_SOUND_SCRIPT = r'''<script>
(function(){
  'use strict';
  var btn=document.getElementById('blogSoundBtn');
  var burger=document.getElementById('blogBurger');
  var drawer=document.getElementById('blogDrawer');
  var AudioCtx=window.AudioContext||window.webkitAudioContext;
  var ctx=null,out=null,on=true,entered=false,lastScroll=0,lastY=window.scrollY||0;
  var reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  try{
    var st=JSON.parse(localStorage.getItem('ma.sound.v10')||'{}');
    if(st&&typeof st.muted==='boolean')on=!st.muted;
    else if(sessionStorage.getItem('ma.blog.muted')==='1')on=false;
  }catch(e){}
  if(reduced)on=false;
  function paint(){
    if(btn){
      btn.setAttribute('aria-pressed',on?'true':'false');
      btn.setAttribute('aria-label',on?'সাউন্ড বন্ধ করুন':'সাউন্ড চালু করুন');
      btn.title=on?'সাউন্ড বন্ধ করুন':'সাউন্ড চালু করুন';
      btn.classList.toggle('is-muted',!on);
    }
  }
  function grant(){
    try{
      var g=JSON.parse(localStorage.getItem('ma.sound.v10')||'{}');
      if(!g||typeof g!=='object')g={};
      g.muted=!on;
      if(!g.granted)g.visits=(g.visits||0)+1;
      g.granted=true;g.at=Date.now();
      localStorage.setItem('ma.sound.v10',JSON.stringify(g));
      sessionStorage.setItem('ma.blog.muted',on?'0':'1');
    }catch(e){}
  }
  function ensure(){
    if(!on||!AudioCtx)return Promise.resolve(false);
    try{
      if(!ctx){
        ctx=new AudioCtx();
        var comp=ctx.createDynamicsCompressor();
        comp.threshold.value=-16;comp.knee.value=16;comp.ratio.value=6;
        comp.attack.value=.003;comp.release.value=.25;
        out=ctx.createGain();out.gain.value=.80;
        out.connect(comp);comp.connect(ctx.destination);
        var b=ctx.createBuffer(1,1,22050);
        var s=ctx.createBufferSource();s.buffer=b;s.connect(ctx.destination);s.start(0);
      }
      if(ctx.state==='suspended'){
        return ctx.resume().then(function(){return ctx.state==='running';},function(){return false;});
      }
      return Promise.resolve(ctx.state==='running');
    }catch(e){return Promise.resolve(false);}
  }
  function tone(freq,dur,gain,type,to,delay){
    if(!ctx||!out||ctx.state!=='running')return;
    var t=ctx.currentTime+(delay||0),osc=ctx.createOscillator(),g=ctx.createGain();
    osc.type=type||'sine';osc.frequency.setValueAtTime(freq,t);
    if(to)osc.frequency.exponentialRampToValueAtTime(Math.max(30,to),t+dur);
    g.gain.setValueAtTime(.0001,t);
    g.gain.exponentialRampToValueAtTime(Math.max(.0003,gain||.05),t+.006);
    g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    osc.connect(g);g.connect(out);osc.start(t);osc.stop(t+dur+.03);
  }
  function noise(dur,freq,gain,filterType,to){
    if(!ctx||!out||ctx.state!=='running')return;
    var t=ctx.currentTime,len=Math.max(1,Math.floor(ctx.sampleRate*dur));
    var buf=ctx.createBuffer(1,len,ctx.sampleRate),d=buf.getChannelData(0);
    for(var i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);
    var src=ctx.createBufferSource(),flt=ctx.createBiquadFilter(),g=ctx.createGain();
    src.buffer=buf;flt.type=filterType||'bandpass';flt.frequency.setValueAtTime(freq||1800,t);
    if(to)flt.frequency.exponentialRampToValueAtTime(Math.max(60,to),t+dur);
    flt.Q.value=1.5;
    g.gain.setValueAtTime(gain||.08,t);
    g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    src.connect(flt);flt.connect(g);g.connect(out);src.start(t);src.stop(t+dur+.03);
  }
  function cueNow(name){
    if(!on||!ctx||ctx.state!=='running')return;
    if(name==='enter'||name==='toggle'){
      [523.25, 659.25, 783.99, 1046.5].forEach(function(f,i){
        tone(f,.40,.12,'triangle',null,i*.075);
        tone(f*2,.26,.045,'sine',null,i*.075);
      });
    }
    else if(name==='hover')tone(1480,.05,.040,'sine',1770);
    else if(name==='press'){tone(150,.10,.085,'triangle',72);noise(.05,2400,.080);}
    else if(name==='scroll'){noise(.07,1250+Math.random()*750,.025);tone(210+Math.random()*90,.035,.012,'sine');}
    else if(name==='open'){noise(.26,600,.10,'bandpass',2400);}
    grant();
  }
  function cue(name){ensure().then(function(ok){if(ok)cueNow(name);});}
  function enter(){
    if(entered||!on)return;
    ensure().then(function(ok){if(ok&&!entered){entered=true;cueNow('enter');unbind();}});
  }
  var unlockEvents=['pointerdown','keydown','wheel','scroll','touchstart','focus'];
  function unlock(){if(on)enter();}
  function unbind(){unlockEvents.forEach(function(ev){window.removeEventListener(ev,unlock,true);});}
  unlockEvents.forEach(function(ev){window.addEventListener(ev,unlock,{capture:true,passive:true});});
  function interactive(node){
    if(!node||!node.closest)return false;
    return !!node.closest('a,button,summary,.card,.card2,.btn,details');
  }
  document.addEventListener('pointerover',function(e){if(e.pointerType==='mouse'&&interactive(e.target))cue('hover');},{passive:true});
  document.addEventListener('pointerdown',function(e){if(interactive(e.target))cue('press');},{passive:true});
  window.addEventListener('scroll',function(){
    var y=window.scrollY||0,now=Date.now();
    if(Math.abs(y-lastY)>55&&now-lastScroll>240){lastY=y;lastScroll=now;cue('scroll');}
  },{passive:true});
  var toastEl=document.getElementById('blogToast'),toastTimer;
  function showToast(title,sub,isOk){
    if(!toastEl)return;
    var titleEl=document.getElementById('blogToastTitle');
    var subEl=document.getElementById('blogToastSub');
    if(titleEl)titleEl.textContent=title;
    if(subEl)subEl.textContent=sub||'';
    var icon=toastEl.querySelector('svg');
    if(icon)icon.style.color=isOk?'var(--mint)':'#FF9F97';
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer=setTimeout(function(){toastEl.classList.remove('show');},3600);
  }
  if(btn){
    btn.addEventListener('click',function(){
      on=!on;paint();grant();
      if(on){
        entered=true;cue('toggle');unbind();
        showToast('সাউন্ড চালু','হোভার, ক্লিক ও স্ক্রলে শব্দ — চাইলে আবার বন্ধ করুন',true);
      }else{
        showToast('সাউন্ড বন্ধ','সাইট এখন নীরব',false);
      }
    });
  }
  if(burger&&drawer){
    burger.addEventListener('click',function(){
      var open=document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded',open?'true':'false');
      drawer.setAttribute('aria-hidden',open?'false':'true');
      if(open)cue('open');
      else cue('toggle');
    });
    var closeBtn=document.getElementById('blogDrawerClose');
    if(closeBtn){
      closeBtn.addEventListener('click',function(){
        document.body.classList.remove('menu-open');
        burger.setAttribute('aria-expanded','false');
        drawer.setAttribute('aria-hidden','true');
        cue('toggle');
      });
    }
    drawer.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click',function(){
        document.body.classList.remove('menu-open');
        burger.setAttribute('aria-expanded','false');
        drawer.setAttribute('aria-hidden','true');
      });
    });
  }
  var yEl=document.getElementById('y');
  if(yEl)yEl.textContent=String(new Date().getFullYear()).replace(/\d/g,function(d){return "০১২৩৪৫৬৭৮৯"[+d];});

  var privBtn=document.getElementById('privacyBtn');
  var privModal=document.getElementById('privacyModal');
  var closePrivBtn=document.getElementById('closePrivacyBtn');
  var confirmPrivBtn=document.getElementById('confirmPrivacyBtn');
  if(privBtn&&privModal){
    privBtn.addEventListener('click',function(){if(privModal.showModal)privModal.showModal();else privModal.setAttribute('open','');});
    if(closePrivBtn)closePrivBtn.addEventListener('click',function(){if(privModal.close)privModal.close();else privModal.removeAttribute('open');});
    if(confirmPrivBtn)confirmPrivBtn.addEventListener('click',function(){if(privModal.close)privModal.close();else privModal.removeAttribute('open');});
    privModal.addEventListener('click',function(e){if(e.target===privModal){if(privModal.close)privModal.close();else privModal.removeAttribute('open');}});
  }
  paint();
  enter();
})();
</script>'''

    def chrome(head_html, body_html):
        return ('<!DOCTYPE html>\n<html lang="bn-BD">\n<head>\n<meta charset="utf-8">\n'
                '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">\n'
                + head_html +
                '\n' + CSP_META +
                '\n<meta name="theme-color" content="#1a4d3e">\n<meta name="color-scheme" content="light">\n'
                '<link rel="stylesheet" href="/assets/fonts.css">\n'
                '<link rel="icon" href="/favicon.ico" sizes="48x48">\n'
                '<link rel="icon" href="/favicon-48x48.png" sizes="48x48" type="image/png">\n'
                '<link rel="icon" href="/favicon-96x96.png" sizes="96x96" type="image/png">\n'
                '<link rel="icon" href="/favicon-192x192.png" sizes="192x192" type="image/png">\n'
                '<link rel="apple-touch-icon" href="/apple-touch-icon.png">\n'
                '<link rel="manifest" href="/site.webmanifest">\n'
                '<meta property="og:site_name" content="ম্যাথ একাডেমি দর্শনা">\n'
                '<meta name="application-name" content="ম্যাথ একাডেমি দর্শনা">\n'
                '</head>\n<body>\n' + SVG_SPRITE + '\n' + body_html + BLOG_SOUND_SCRIPT + '\n' + VERCEL_ANALYTICS_SCRIPTS + '\n</body>\n</html>\n')

    def head_for(title, desc, url, extra_ld):
        return ('<title>%s</title>\n<meta name="description" content="%s">\n'
                '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">\n'
                '<meta name="google-site-verification" content="googlee3840f5ed89d0b8b.html">\n'
                '<meta name="google-site-verification" content="googlee3840f5ed89d0b8b">\n'
                '<meta name="google-site-verification" content="e3840f5ed89d0b8b">\n'
                '<link rel="canonical" href="%s">\n'
                '<meta property="og:type" content="article">\n'
                '<meta property="og:site_name" content="ম্যাথ একাডেমি দর্শনা">\n'
                '<meta name="application-name" content="ম্যাথ একাডেমি দর্শনা">\n'
                '<meta property="og:locale" content="bn_BD">\n'
                '<meta property="og:title" content="%s">\n'
                '<meta property="og:description" content="%s">\n'
                '<meta property="og:url" content="%s">\n'
                '<meta property="og:image" content="%s/og-1200x630.jpg">\n'
                '<meta name="twitter:card" content="summary_large_image">\n'
                '<script type="application/ld+json">%s</script>'
                ) % (title, desc, url, title, desc, url, SITE_HOST,
                     json.dumps(extra_ld, ensure_ascii=False, separators=(',', ':')))

    def header_html(crumb):
        is_hub = crumb == '/blog/'
        hub_class = ' class="is-active"' if is_hub else ''
        return (
            '<header class="bhead"><div class="bhead__in">'
            '<a class="brand" href="/" aria-label="MATH ACADEMY — ম্যাথ একাডেমি, দর্শনা — হোম">'
            + LOGO +
            '<span class="brand__txt">'
            '<span class="brand__name">MATH ACADEMY</span>'
            '<span class="brand__bn">ম্যাথ একাডেমি · দর্শনা</span>'
            '</span></a>'
            '<nav class="bnav" aria-label="প্রধান নেভিগেশন">'
            '<a href="/#why">কেন আমরা</a>'
            '<a href="/#method">পদ্ধতি</a>'
            '<a href="/#lab">ল্যাব</a>'
            '<a href="/#teacher">শিক্ষক</a>'
            '<a href="/#batches">ব্যাচ</a>'
            '<a href="/#library">লাইব্রেরি</a>'
            '<a href="/#results">ফলাফল</a>'
            '<a href="/blog/"' + hub_class + '>ব্লগ</a>'
            '</nav>'
            '<div class="bhead__actions">'
            '<span class="live-pill"><span class="live-dot"></span>মোট <b id="pillSeats">' + bn(SEATS_LEFT) + '</b>টি সিট বাকি</span>'
            '<a class="btn btn--red btn--sm bhead__cta" href="' + WA + '?text=' + _quote('আসসালামু আলাইকুম, বর্তমান অফলাইন ব্যাচ, আসন, সময় ও ফি জানতে চাই।') + '" '
            'target="_blank" rel="noopener" aria-label="বর্তমান ব্যাচের তথ্য WhatsApp-এ জানতে লিখুন">'
            'ব্যাচের তথ্য <svg class="ico ar" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>'
            '<button class="sndbtn" id="blogSoundBtn" type="button" aria-pressed="true" aria-label="সাউন্ড বন্ধ করুন" title="সাউন্ড বন্ধ/চালু">'
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6l-5 4H4z"/>'
            '<path class="sound-wave" d="M16 9a5 5 0 0 1 0 6M18.5 6.5a9 9 0 0 1 0 11"/>'
            '<path class="sound-x" d="m16 9 5 6m0-6-5 6"/></svg></button>'
            '<button class="burger" id="blogBurger" aria-label="মেনু খুলুন" aria-expanded="false" aria-controls="blogDrawer">'
            '<span></span><span></span><span></span></button>'
            '</div></div></header>'
            '<div class="drawer" id="blogDrawer" aria-hidden="true">'
            '<div class="drawer__top-bar">'
            '<span class="live-pill" style="display:inline-flex"><span class="live-dot"></span>মোট ' + bn(SEATS_LEFT) + 'টি আসন বাকি</span>'
            '<button class="drawer__close" id="blogDrawerClose" type="button" aria-label="মেনু বন্ধ করুন">✕ বন্ধ করুন</button>'
            '</div>'
            '<nav class="drawer__nav" aria-label="মোবাইল নেভিগেশন">'
            '<a href="/#why">কেন আমরা <span>01</span></a>'
            '<a href="/#method">পদ্ধতি <span>02</span></a>'
            '<a href="/#lab">ল্যাব <span>03</span></a>'
            '<a href="/#teacher">শিক্ষক <span>04</span></a>'
            '<a href="/#batches">ব্যাচ ও ফি <span>05</span></a>'
            '<a href="/#library">লাইব্রেরি <span>06</span></a>'
            '<a href="/#results">ফলাফল <span>07</span></a>'
            '<a href="/blog/"' + hub_class + '>ব্লগ ও লেখা <span>09</span></a>'
            '</nav>'
            '<div class="drawer__foot">'
            '<a class="btn btn--red btn--block" href="' + WA + '?text=' + _quote('আসসালামু আলাইকুম, বর্তমান অফলাইন ব্যাচ, আসন, সময় ও ফি জানতে চাই।') + '" target="_blank" rel="noopener">ব্যাচের তথ্য জানতে লিখুন →</a>'
            '<a class="btn btn--block" style="--bg:#0A0A0A;--fg:#FDFBF7;--bd:#FDFBF7" href="tel:+8801641045469">📞 ০১৬৪১-০৪৫৪৬৯</a>'
            '<p class="drawer__meta">দর্শনা, চুয়াডাঙ্গা · অফলাইন ব্যাচ</p>'
            '</div></div>'
        )

    def footer_html():
        return (
            '<section class="maker" aria-labelledby="makerT">'
            '<div class="wrap maker__in">'
            '<div class="maker__l">'
            '<p class="maker__k mono">// DESIGN &amp; DEVELOPMENT</p>'
            '<h2 class="maker__t" id="makerT">এই সাইটের ডিজাইন ও কোড — <b>তানভীর ইসলাম তন্ময়</b></h2>'
            '<p class="maker__s">Tanver Islam Tonmoy · UI · মোশন · ফ্রন্টএন্ড</p>'
            '</div>'
            '<a class="maker__a" href="https://www.facebook.com/tanverislamtonmoyofficial" target="_blank" rel="noopener me">'
            '<span class="maker__mono" aria-hidden="true">'
            '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>'
            '</span>'
            '<span class="maker__meta"><b>প্রোফাইল দেখুন</b><small>facebook.com/tanverislamtonmoyofficial</small></span>'
            '<svg class="ico ar" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>'
            '</a></div></section>'
            '<footer class="footer">'
            '<div class="footer__marq" aria-hidden="true">'
            '<div class="marquee marquee--slow">'
            '<span>MATH ACADEMY <em>■</em> PROOF OVER MEMORY <em>■</em> দর্শনা, চুয়াডাঙ্গা <em>■</em> OFFLINE BATCH <em>■</em></span>'
            '<span>MATH ACADEMY <em>■</em> PROOF OVER MEMORY <em>■</em> দর্শনা, চুয়াডাঙ্গা <em>■</em> OFFLINE BATCH <em>■</em></span>'
            '<span>MATH ACADEMY <em>■</em> PROOF OVER MEMORY <em>■</em> দর্শনা, চুয়াডাঙ্গা <em>■</em> OFFLINE BATCH <em>■</em></span>'
            '<span>MATH ACADEMY <em>■</em> PROOF OVER MEMORY <em>■</em> দর্শনা, চুয়াডাঙ্গা <em>■</em> OFFLINE BATCH <em>■</em></span>'
            '</div></div>'
            '<div class="wrap">'
            '<div class="footer__grid">'
            '<div>'
            '<div class="footer__brand">'
            '<img src="data:image/png;base64,' + LOGO_TIGHT + '" alt="ম্যাথ একাডেমি লোগো" width="52" height="52" loading="lazy">'
            '<div><b>MATH ACADEMY</b><small>ম্যাথ একাডেমি · দর্শনা, চুয়াডাঙ্গা</small></div>'
            '</div>'
            '<p class="footer__desc">SSC ও ক্লাস ৬–১০ শিক্ষার্থীদের জন্য দর্শনার ভিজ্যুয়াল গণিতের স্টুডিও। ছবি দিয়ে শুরু, যুক্তি দিয়ে শেষ — তারপর গতি।</p>'
            '<div class="footer__note">'
            'আসন, ফি, সময়সূচি ও মাসিক ক্লাস/মক সংখ্যা ডেটাবেস-নির্ভর; ভর্তির পূর্বে WhatsApp-এ আসন প্রাপ্যতা ও চলতি তথ্য নিশ্চিত করে সরাসরি কেন্দ্রে যোগাযোগ করুন।'
            '</div>'
            '</div>'
            '<div>'
            '<h3 class="footer__h">একাডেমি</h3>'
            '<ul>'
            '<li><a href="/#why">কেন আমরা</a></li>'
            '<li><a href="/#method">সহজ পদ্ধতি</a></li>'
            '<li><a href="/#lab">হাতে-কলমে ল্যাব</a></li>'
            '<li><a href="/#teacher">শিক্ষক পরিচিতি</a></li>'
            '<li><a href="/#batches">ব্যাচ ও ফি</a></li>'
            '<li><a href="/#results">ফলাফল দেখুন</a></li>'
            '</ul></div>'
            '<div>'
            '<h3 class="footer__h">লাইব্রেরি ও রিসোর্স</h3>'
            '<ul>'
            '<li><a href="/blog/">সব ব্লগ ও লেখা</a></li>'
            '<li><a href="/blog/ssc-goniter-sob-sutro/">SSC গণিতের সব সূত্র</a></li>'
            '<li><a href="/blog/goniter-voy-katanor-7-obhyas/">ভয় কাটানোর ৭ অভ্যাস</a></li>'
            '<li><a href="/blog/gonit-valo-kore-podar-upay/">গণিত ভালো করার উপায়</a></li>'
            '<li><a href="/#library">অনুশীলন শিট</a></li>'
            '</ul></div>'
            '<div>'
            '<h3 class="footer__h">যোগাযোগ</h3>'
            '<address>দর্শনা, চুয়াডাঙ্গা<br>নির্দিষ্ট ঠিকানা ম্যাপে দেখুন</address>'
            '<div class="soc" role="group" aria-label="সোশ্যাল ও যোগাযোগ">'
            '<a class="soc__a soc__a--wa soc__a--pulse" href="https://wa.me/8801641045469" target="_blank" rel="noopener" aria-label="WhatsApp" title="WhatsApp">'
            '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-wa2"/></svg></a>'
            '<a class="soc__a soc__a--fb" href="https://www.facebook.com/pranto.rai.37" target="_blank" rel="noopener me" aria-label="Facebook — প্রান্ত রাই" title="Facebook">'
            '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-fb"/></svg></a>'
            '<a class="soc__a soc__a--map" href="https://maps.app.goo.gl/UyNxwUBw3sjnmGE29" target="_blank" rel="noopener" aria-label="Google Maps — দর্শনা" title="Google Maps">'
            '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-gmap"/></svg></a>'
            '<a class="soc__a soc__a--tel" href="tel:+8801641045469" aria-label="কল — ০১৬৪১-০৪৫৪৬৯" title="কল করুন">'
            '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-phone"/></svg></a>'
            '</div>'
            '<ul style="margin-top:14px">'
            '<li><a href="tel:+8801641045469"><svg class="ico" style="width:14px;height:14px"><use href="#i-phone"/></svg> ০১৬৪১-০৪৫৪৬৯</a></li>'
            '<li><a href="https://wa.me/8801641045469" target="_blank" rel="noopener" data-wa="আসসালামু আলাইকুম, বর্তমান অফলাইন ব্যাচ, আসন, সময় ও ফি জানতে চাই।"><svg class="ico" style="width:14px;height:14px"><use href="#i-wa"/></svg> WhatsApp · ০১৬৪১-০৪৫৪৬৯</a></li>'
            '<li><a href="https://www.facebook.com/pranto.rai.37" target="_blank" rel="noopener me"><svg class="ico" style="width:14px;height:14px"><use href="#i-fb"/></svg> Facebook — প্রান্ত রাই</a></li>'
            '<li><a href="https://maps.app.goo.gl/UyNxwUBw3sjnmGE29" target="_blank" rel="noopener"><svg class="ico" style="width:14px;height:14px"><use href="#i-gmap"/></svg> ম্যাপে দেখুন — দর্শনা</a></li>'
            '</ul></div>'
            '</div>'
            '<div class="footer__bottom">'
            '<span>© <span id="y">২০২৬</span> MATH ACADEMY · সর্বস্বত্ব সংরক্ষিত</span>'
            '<button type="button" class="link-u" id="privacyBtn" style="color:#d8d6cf;background:none;border:none;cursor:pointer;font-family:inherit;font-size:12px;padding:0" aria-haspopup="dialog">গোপনীয়তা ও ডেটা সুরক্ষা নীতি</button>'
            '<a class="ssl" href="/.well-known/security.txt" target="_blank" rel="noopener" title="HTTPS · TLS · HSTS — নিরাপত্তা নীতি">'
            '<svg viewBox="0 0 24 24" aria-hidden="true" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>'
            '<span><b>HTTPS · SSL সুরক্ষিত</b><small>TLS · HSTS · সিকিউর কানেকশন</small></span></a>'
            '<a href="#top" class="toplink">উপরে যাও ↑</a>'
            '</div></div></footer>'
            '<dialog id="privacyModal" class="pmodal" aria-labelledby="privTitle">'
            '<div class="pmodal__head">'
            '<div>'
            '<span class="kicker kicker--red" style="font-size:11px">স্বচ্ছতা ও সুরক্ষা</span>'
            '<h3 id="privTitle" style="font-size:20px;font-weight:700;margin-top:4px;color:var(--ink)">গোপনীয়তা ও ডেটা সুরক্ষা নীতি</h3>'
            '</div>'
            '<button type="button" id="closePrivacyBtn" aria-label="বন্ধ করুন" class="btn btn--outline btn--sm" style="padding:4px 10px;font-size:16px">✕</button>'
            '</div>'
            '<div class="pmodal__body">'
            '<p>ম্যাথ একাডেমি দর্শনা শিক্ষার্থীদের গোপনীয়তা এবং ব্যবহারকারীদের ডেটা সুরক্ষায় সম্পূর্ণ প্রতিশ্রুতিবদ্ধ। আমাদের ওয়েবসাইট সম্পূর্ণ বিজ্ঞাপনমুক্ত এবং ব্যবহারকারী-বান্ধব।</p>'
            '<h4>১. সম্পূর্ণ জিরো-ট্র্যাকিং নীতি (Zero Tracking Cookies)</h4>'
            '<p>সাধারণ দর্শকদের ব্রাউজিংয়ে আমরা কোনো থার্ড-পার্টি ট্র্যাকিং কুকি, ক্রস-সাইট ট্র্যাকার বা বাণিজ্যিক অ্যানালিটিক্স স্ক্রিপ্ট ব্যবহার করি না। আপনার ব্রাউজিং কার্যকলাপ কোনো বিজ্ঞাপনী সংস্থার কাছে বিক্রি বা শেয়ার করা হয় না।</p>'
            '<h4>২. সার্চ কনসোল ও ইনডেক্সিং (Google &amp; Bing)</h4>'
            '<p>ওয়েবসাইটটি সার্চ ইঞ্জিনে খুঁজে পাওয়ার জন্য আমরা স্ট্যান্ডার্ড সার্চ কনসোল ও সাইটম্যাপ ব্যবহার করি, যা কোনো ব্যক্তিগত ট্র্যাকিং বা ব্যবহারকারীর ডিভাইসে অতিরিক্ত মেমোরি খরচ করে না। এটি শতভাগ হালকা ও দ্রুতগতির ব্রাউজিং নিশ্চিত করে।</p>'
            '<h4>৩. মক টেস্ট ফলাফল ও শিক্ষার্থীর তথ্য</h4>'
            '<p>ফলাফল পোর্টালে প্রদর্শিত রোল নম্বর ও মূল্যায়ন কেবল শিক্ষার্থীদের একাডেমিক অগ্রগতি মূল্যায়নের সুবিধার্থে সংরক্ষিত। প্রাতিষ্ঠানিক অনুমোদন সাপেক্ষে এবং শিক্ষার্থীদের মেধার স্বীকৃতি স্বরূপ এগুলো প্রদর্শিত হয়।</p>'
            '<h4>৪. এনক্রিপ্টেড ও সুরক্ষিত সংযোগ</h4>'
            '<p>সম্পূর্ণ ওয়েবসাইটটি অত্যাধুনিক TLS/SSL এনক্রিপশন ও HSTS নিরাপত্তা প্রটোকলের অধীনে পরিচালিত। কোনো বহিরাগত অননুমোদিত ব্যক্তি ওয়েবসাইটের তথ্য বিকৃত করতে পারে না।</p>'
            '<h4>৫. যোগাযোগ ও জিজ্ঞাসা</h4>'
            '<p>যেকোনো তথ্য যাচাই বা ব্যাচ সংক্রান্ত অনুসন্ধানের জন্য সরাসরি আমাদের শিক্ষক প্রান্ত রাই-এর সাথে WhatsApp বা সরাসরি ফোনে যোগাযোগ করতে পারেন।</p>'
            '</div>'
            '<div class="pmodal__foot" style="padding:12px 20px;border-top:1px solid #ddd;background:#f3efe6">'
            '<button type="button" class="btn btn--ink" id="confirmPrivacyBtn">বুঝেছি</button>'
            '</div>'
            '</dialog>'
            '<div class="toast" id="blogToast" role="status" aria-live="polite">'
            '<svg viewBox="0 0 24 24" aria-hidden="true" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>'
            '<div><b id="blogToastTitle">সাউন্ড চালু</b><small id="blogToastSub">হোভার, ক্লিক ও স্ক্রলে শব্দ — চাইলে আবার বন্ধ করুন</small></div>'
            '</div>'
        )

    org_ld = {"@type": "EducationalOrganization", "@id": SITE_HOST + "/#org",
              "name": "ম্যাথ একাডেমি", "url": SITE_HOST + "/",
              "foundingDate": str(int(CFG['team']['founded_year'])),
              "telephone": "+8801641045469",
              "address": {"@type": "PostalAddress", "addressLocality": "দর্শনা",
                          "addressRegion": "চুয়াডাঙ্গা", "addressCountry": "BD"}}

    # ---------- hub ----------
    cards = []
    for pst in BLOG.POSTS:
        cards.append(
            '<a class="card" href="/blog/%s/">'
            '<span class="card__tag">%s</span><h2>%s</h2><p>%s</p>'
            '<span class="card__foot"><span>%s মিনিট পড়া</span><b>পড়ুন →</b></span></a>'
            % (pst['slug'], pst['tag'], pst['h1'], pst['desc'], bn(pst['mins'])))
    # Keep the hub's featured row identical to the four homepage articles.
    STARTER = HOME_SLUGS
    feat_cards = []
    for i, slug in enumerate(STARTER):
        pst = next((p_ for p_ in BLOG.POSTS if p_['slug'] == slug), None)
        if not pst:
            continue
        feat_cards.append(
            '<a class="card card--feat" href="/blog/%s/">'
            '<span class="card__tag">ধাপ %s · %s</span><h3>%s</h3><p>%s</p>'
            '<span class="card__foot"><span>%s মিনিট পড়া</span><b>পড়ুন →</b></span></a>'
            % (pst['slug'], bn(i + 1), pst['tag'], pst['h1'], pst['desc'], bn(pst['mins'])))
    hub_url = SITE_HOST + '/blog/'
    hub_ld = {"@context": "https://schema.org", "@graph": [
        org_ld,
        {"@type": "CollectionPage", "@id": hub_url + '#page', "url": hub_url,
         "name": "ব্লগ — ম্যাথ একাডেমি, দর্শনা",
         "description": "SSC ও ক্লাস ৬–১০ গণিতের প্রস্তুতি, রুটিন আর অভিভাবকের জন্য পরামর্শ।",
         "inLanguage": "bn-BD", "isPartOf": {"@id": SITE_HOST + "/#site"},
         "publisher": {"@id": SITE_HOST + "/#org"}},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "হোম", "item": SITE_HOST + "/"},
            {"@type": "ListItem", "position": 2, "name": "ব্লগ", "item": hub_url}]},
        {"@type": "ItemList", "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "url": SITE_HOST + '/blog/' + p_['slug'] + '/',
             "name": p_['title']} for i, p_ in enumerate(BLOG.POSTS)]}]}
    hub_body = (header_html('/blog/') +
        '<main class="wrap">'
        '<header class="hub-head">'
        '<span class="eyebrow">ব্লগ // MATH NOTES</span>'
        '<h1>গণিতের লেখা, রুটিন আর অভিভাবকের প্রশ্ন</h1>'
        '<p>দর্শনা ও চুয়াডাঙ্গার শিক্ষার্থীদের জন্য SSC ও ক্লাস ৬–১০ গণিতের প্রস্তুতি, অধ্যায়ের '
        'ক্রম, অনুশীলন আর অভিভাবকের প্রশ্ন নিয়ে দশটি পূর্ণ লেখা। প্রতিটি লেখায় প্রয়োজনীয় '
        'ব্যাখ্যা, ব্যবহারিক উদাহরণ ও প্রাসঙ্গিক উৎস রাখা হয়েছে।</p>'
        '</header>'
        '<h2 class="hub-sub" id="start">হোমপেজের নির্বাচিত লেখা</h2>'
        '<p class="hub-note">হোমপেজে থাকা চারটি লেখা এখানেও একই ক্রমে সাজানো। আপনার প্রশ্নের '
        'সঙ্গে মেলে এমনটি বেছে নিন; সব লেখা একসাথে পড়ার দরকার নেই।</p>'
        '<div class="cards cards--feat">' + ''.join(feat_cards) + '</div>'
        '<h2 class="hub-sub" id="all">সব লেখা <span>(' + bn(len(BLOG.POSTS)) + 'টি)</span></h2>'
        '<div class="cards">' + ''.join(cards) + '</div>'
        '<div class="cta" style="margin-top:30px">'
        '<p>গণিতের পড়া বা ব্যাচ সম্পর্কে প্রশ্ন থাকলে হোয়াটসঅ্যাপে বার্তা পাঠান।</p>'
        '<a class="btn" href="' + WA + '?text=%E0%A6%86%E0%A6%B8%E0%A6%B8%E0%A6%BE%E0%A6%B2%E0%A6%BE%E0%A6%AE%E0%A7%81%20%E0%A6%86%E0%A6%B2%E0%A6%BE%E0%A6%87%E0%A6%95%E0%A7%81%E0%A6%AE%2C%20%E0%A6%AA%E0%A7%9C%E0%A6%BE%E0%A6%B6%E0%A7%8B%E0%A6%A8%E0%A6%BE%20%E0%A6%A8%E0%A6%BF%E0%A7%9F%E0%A7%87%20%E0%A6%9C%E0%A6%BE%E0%A6%A8%E0%A6%A4%E0%A7%87%20%E0%A6%9A%E0%A6%BE%E0%A6%87%E0%A5%A4" '
        'target="_blank" rel="noopener">প্রশ্ন করুন</a></div>'
        '</main>' + footer_html())
    hub = chrome(head_for('ব্লগ | SSC ও ক্লাস ৬–১০ গণিত — ম্যাথ একাডেমি দর্শনা',
                          'দর্শনা ও চুয়াডাঙ্গার শিক্ষার্থীদের জন্য গণিতের নোট — SSC প্রস্তুতি, অধ্যায়ের ক্রম, রুটিন আর কোচিং বাছাইয়ের পরামর্শ।',
                          hub_url, hub_ld), hub_body)
    hub = hub.replace('</head>', '<style>' + blog_css + '</style>\n</head>')

    blog_dir = D / 'blog'
    # A prior round may have left slug folders in dist/blog/. Remove the generated
    # blog tree first so the public route set is exactly the ten current drafts.
    import shutil as _sh
    _sh.rmtree(blog_dir, ignore_errors=True)
    blog_dir.mkdir(parents=True, exist_ok=True)
    pages = {'/blog/': hub}
    for i, pst in enumerate(BLOG.POSTS):
        url = SITE_HOST + '/blog/' + pst['slug'] + '/'
        faq_html = ''.join(
            '<details%s><summary>%s</summary><div class="ans">%s</div></details>'
            % (' open' if j == 0 else '', q, a) for j, (q, a) in enumerate(pst['faq']))
        nxt = [x for x in BLOG.POSTS if x['slug'] != pst['slug']][:4]
        next_html = ''.join(
            '<a class="card2" href="/blog/%s/"><b>%s</b><small>%s · %s মিনিট</small></a>'
            % (x['slug'], x['h1'], x['tag'], bn(x['mins'])) for x in nxt)
        ld = {"@context": "https://schema.org", "@graph": [
            org_ld,
            {"@type": "Article", "@id": url + '#article', "headline": pst['title'],
             "description": pst['desc'], "inLanguage": "bn-BD", "url": url,
             "mainEntityOfPage": {"@id": url},
             "datePublished": pst['date'], "dateModified": pst['updated'],
             "author": {"@type": "Person", "name": "প্রান্ত রাই (Pranto Rai)",
                        "url": SITE_HOST + "/#teacher",
                        "jobTitle": "গণিত শিক্ষক, দর্শনা আইডিয়াল স্কুল"},
             "publisher": {"@id": SITE_HOST + "/#org"},
             "image": [SITE_HOST + "/og-1200x630.jpg"],
             "articleSection": pst['tag'], "keywords": pst['keyword'],
             "isPartOf": {"@id": SITE_HOST + "/#site"}},
            {"@type": "FAQPage", "@id": url + '#faq', "mainEntity": [
                {"@type": "Question", "name": q,
                 "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in pst['faq']]},
            {"@type": "BreadcrumbList", "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "হোম", "item": SITE_HOST + "/"},
                {"@type": "ListItem", "position": 2, "name": "ব্লগ", "item": hub_url},
                {"@type": "ListItem", "position": 3, "name": pst['h1'], "item": url}]}]}
        body = (header_html(pst['slug']) +
            '<main class="wrap">'
            '<nav class="crumbs" aria-label="ব্রেডক্রাম্ব"><a href="/">হোম</a><span>/</span>'
            '<a href="/blog/">ব্লগ</a><span>/</span><span>' + pst['tag'] + '</span></nav>'
            '<article class="post">'
            '<header class="post-head">'
            '<span class="eyebrow">' + pst['tag'] + '</span>'
            '<h1>' + pst['h1'] + '</h1>'
            '<div class="post-meta"><span>লিখেছেন <b>প্রান্ত রাই</b></span>'
            '<span>' + bn(pst['mins']) + ' মিনিট পড়া</span>'
            '<span>প্রকাশ <b><time datetime="' + pst['date'] + '">' + bn_date(pst['date']) + '</time></b></span>'
            '<span>দর্শনা, চুয়াডাঙ্গা</span></div>'
            '</header>'
            '<div class="prose">' + pst['body'] +
            '<h2>সাধারণ প্রশ্ন</h2><div class="faq">' + faq_html + '</div>'
            '</div></article>'
            '<div class="next"><h3>// আরও পড়ুন</h3><div class="next__grid">' + next_html + '</div></div>'
            '</main>' + footer_html())
        page = chrome(head_for(pst['title'], pst['desc'], url, ld), body)
        page = page.replace('</head>', '<style>' + blog_css + '</style>\n</head>')
        pages['/blog/' + pst['slug'] + '/'] = page

    for route, html in pages.items():
        out_dir = D / route.strip('/')
        out_dir.mkdir(parents=True, exist_ok=True)
        (out_dir / 'index.html').write_text(apply_content(html), encoding='utf-8')

    # ----------------------------------------------------------------------
    #   ADMIN ROUTE  /admin/  →  dist/admin/index.html
    # ----------------------------------------------------------------------
    _admin_src = pathlib.Path('_src/admin.html')
    if _admin_src.exists():
        (D / 'admin').mkdir(exist_ok=True)
        (D / 'admin' / 'index.html').write_text(apply_content(_admin_src.read_text(encoding='utf-8')), encoding='utf-8')


    # ----------------------------------------------------------------------
    #   LEGACY ROUTE  /guide/  →  /blog/   (the old URL existed for one round;
    #   these are soft redirects: canonical + refresh + JS, indexable-safe)
    # ----------------------------------------------------------------------
    import shutil as _sh
    _sh.rmtree(D / 'guide', ignore_errors=True)

    def _redirect_html(to):
        return (
            '<!doctype html><html lang="bn"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width,initial-scale=1">'
            '<title>লেখাটি সরানো হয়েছে — ম্যাথ একাডেমি</title>'
            '<link rel="canonical" href="' + SITE_HOST + to + '">'
            '<meta name="robots" content="noindex,follow">'
            '<meta http-equiv="refresh" content="0;url=' + to + '">'
            '<script>location.replace(' + json.dumps(to) + '+location.hash)</script>'
            '<style>html,body{height:100%;margin:0}body{display:grid;place-items:center;'
            'background:#FDFBF7;color:#0A0A0A;font-family:system-ui,"Hind Siliguri",sans-serif;'
            'text-align:center;padding:24px}a{color:#D42C24;font-weight:700}'
            'p{max-width:38ch;line-height:1.6}</style></head><body><div>'
            '<p>এই লেখাটি নতুন ঠিকানায় সরানো হয়েছে। না সরালে '
            '<a href="' + to + '">এখানে ক্লিক করুন</a>।</p></div></body></html>')

    (D / 'guide').mkdir(exist_ok=True)
    (D / 'guide' / 'index.html').write_text(_redirect_html('/blog/'), encoding='utf-8')
    for _p in BLOG.POSTS:
        _d = D / 'guide' / _p['slug']
        _d.mkdir(parents=True, exist_ok=True)
        (_d / 'index.html').write_text(_redirect_html('/blog/' + _p['slug'] + '/'), encoding='utf-8')

    # preload the same webfont files the homepage uses
    for route in pages:
        f = D / route.strip('/') / 'index.html'
        html = f.read_text(encoding='utf-8').replace('</head>', pre.replace('href="assets/', 'href="/assets/') + '</head>')
        f.write_text(html, encoding='utf-8')

    # ---------- sitemap: generated, so it can never drift from the pages ----------
    def _u(loc, lastmod, freq, pri, img=True):
        im = ('\n    <image:image>\n      <image:loc>%s/og-1200x630.jpg</image:loc>\n'
              '      <image:title>ম্যাথ একাডেমি — দর্শনা, চুয়াডাঙ্গা</image:title>\n'
              '    </image:image>' % SITE_HOST) if img else ''
        return ('  <url>\n    <loc>%s</loc>\n    <lastmod>%s</lastmod>\n'
                '    <changefreq>%s</changefreq>\n    <priority>%s</priority>%s\n  </url>\n'
                % (loc, lastmod, freq, pri, im))
    sm = ('<?xml version="1.0" encoding="UTF-8"?>\n'
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
          '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'
          + _u(SITE_HOST + '/', '2026-10-28', 'weekly', '1.0')
          + _u(hub_url, '2026-10-28', 'weekly', '0.8')
          + ''.join(_u(SITE_HOST + '/blog/' + x['slug'] + '/', x['updated'], 'monthly', '0.7', False)
                    for x in BLOG.POSTS)
          + '</urlset>\n')
    (D / 'sitemap.xml').write_text(sm, encoding='utf-8')
    pathlib.Path('sitemap.xml').write_text(sm, encoding='utf-8')     # keep the repo copy identical
    (D / 'googlee3840f5ed89d0b8b.html').write_text('google-site-verification: googlee3840f5ed89d0b8b.html\n', encoding='utf-8')
    pathlib.Path('googlee3840f5ed89d0b8b.html').write_text('google-site-verification: googlee3840f5ed89d0b8b.html\n', encoding='utf-8')

    # ---------- llms-full.txt: the readable text of every page, for AI engines ----------
    import re as _r2, html as _html
    def _plain(h):
        h = _r2.sub(r'<(script|style)[^>]*>.*?</\1>', ' ', h, flags=_r2.S | _r2.I)
        h = _r2.sub(r'<br\s*/?>|</(p|div|h1|h2|h3|h4|li|tr|section|summary|details|table)>', '\n', h, flags=_r2.I)
        h = _r2.sub(r'<[^>]+>', ' ', h)
        t = _html.unescape(h)
        t = _r2.sub(r'[ \t]+', ' ', t)
        t = _r2.sub(r'\n\s*\n\s*\n+', '\n\n', t)
        return '\n'.join(ln.strip() for ln in t.split('\n') if ln.strip())
    full = ['# ম্যাথ একাডেমি / Math Academy — Darshana, Chuadanga — full text',
            '', '> Complete readable copy of ' + SITE_HOST + ' for AI answer engines.',
            '> Generated by _src/build.py on every publish. Do not edit by hand.', '']
    for route in ['/'] + list(pages.keys()):
        f = D / route.strip('/') / 'index.html' if route != '/' else D / 'index.html'
        full.append('\n\n' + '=' * 70 + '\n## ' + SITE_HOST + route + '\n' + '=' * 70 + '\n')
        full.append(_plain(f.read_text(encoding='utf-8')))
    (D / 'llms-full.txt').write_text('\n'.join(full), encoding='utf-8')

    # ---------- .well-known/security.txt (RFC 9116) ----------
    (D / '.well-known').mkdir(exist_ok=True)
    (D / '.well-known' / 'security.txt').write_text(
        '# Security policy — ম্যাথ একাডেমি (Math Academy), Darshana\n'
        'Contact: https://www.facebook.com/pranto.rai.37\n'
        'Contact: tel:+8801641045469\n'
        'Expires: 2027-10-01T00:00:00.000Z\n'
        'Preferred-Languages: bn, en\n'
        'Canonical: ' + SITE_HOST + '/.well-known/security.txt\n'
        'Policy: ' + SITE_HOST + '/#privacy\n', encoding='utf-8')

    # ---------- humans.txt ----------
    (D / 'humans.txt').write_text(
        '/* TEAM */\n'
        '  Teacher / owner : প্রান্ত রাই — ম্যাথ একাডেমি, দর্শনা, চুয়াডাঙ্গা\n'
        '  Design & code   : তানভীর ইসলাম তন্ময় (Tanver Islam Tonmoy)\n'
        '                    https://www.facebook.com/tanverislamtonmoyofficial\n'
        '\n/* SITE */\n'
        '  Language   : বাংলা (bn-BD)\n'
        '  Standby    : ' + SITE_HOST + '\n'
        '  Built with : hand-written HTML, CSS and JavaScript (no framework)\n', encoding='utf-8')

    # ---------- design-notes.txt: the token sheet, readable at the domain root ----------
    # generated from docs/DESIGN-TOKENS.md so the published site documents its own system
    _tok = pathlib.Path('docs/DESIGN-TOKENS.md')
    if _tok.exists():
        (D / 'design-notes.txt').write_text(
            'MATH ACADEMY — DESIGN NOTES\n'
            'Plain-text copy of ' + SITE_HOST + '/design-notes.txt — generated from docs/DESIGN-TOKENS.md\n'
            + '=' * 70 + '\n\n' + _tok.read_text(encoding='utf-8'), encoding='utf-8')

    og = A / 'og-1200x630.jpg'          # social card (committed as an asset, copied verbatim)
    if og.exists():
        (D / 'og-1200x630.jpg').write_bytes(og.read_bytes())
    for f in ('favicon.png',):
        src = A / f
        if src.exists():
            (D / 'assets' / f).write_bytes(src.read_bytes())

    # Minify inline production CSS/JS while keeping the portable, readable
    # math-academy.html source build untouched. JSON-LD is preserved, and esbuild
    # retains legal /*! comments (including GSAP's required notice).
    def _minify_page(_path):
        _html_doc = _path.read_text(encoding='utf-8')
        _scripts, _styles = [], []
        def _script_slot(_m):
            _attrs, _body = _m.group(1), _m.group(2)
            if _re.search(r'\bsrc\s*=', _attrs, _re.I) or 'application/ld+json' in _attrs.lower():
                return _m.group(0)
            _i = len(_scripts)
            _scripts.append(_body)
            return '<script%s>__MA_JS_%d__</script>' % (_attrs, _i)
        _html_doc = _re.sub(r'<script\b([^>]*)>([\s\S]*?)</script\s*>', _script_slot,
                            _html_doc, flags=_re.I)
        def _style_slot(_m):
            _attrs, _body = _m.group(1), _m.group(2)
            _i = len(_styles)
            _styles.append(_body)
            return '<style%s>__MA_CSS_%d__</style>' % (_attrs, _i)
        _html_doc = _re.sub(r'<style\b([^>]*)>([\s\S]*?)</style\s*>', _style_slot,
                            _html_doc, flags=_re.I)
        if not _scripts and not _styles:
            return
        _request = json.dumps({'scripts': _scripts, 'styles': _styles}, ensure_ascii=False)
        _minified = _sp.run(['node', 'scripts/minify-inline.mjs'], input=_request,
                            text=True, encoding='utf-8', capture_output=True, check=True, timeout=60)
        _result = json.loads(_minified.stdout)
        for _i, _body in enumerate(_result['scripts']):
            _html_doc = _html_doc.replace('__MA_JS_%d__' % _i, _body)
        for _i, _body in enumerate(_result['styles']):
            _html_doc = _html_doc.replace('__MA_CSS_%d__' % _i, _body)
        _path.write_text(_html_doc, encoding='utf-8')

    for _page in sorted(D.rglob('*.html')):
        _minify_page(_page)

    print('published dist/index.html', os.path.getsize(D / 'index.html') // 1024, 'KB')
