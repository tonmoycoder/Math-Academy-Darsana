# DESIGN TOKENS — colour, type, space, shadow, motion

**Audience:** whoever changes anything visual · **Last updated:** 2026-10-26 (v10.3.0)
**Read next:** `COMPONENTS.md`; `design-notes.txt` is generated from this file

[ASSUMPTION] The approved visual system remains unchanged; delivery optimizations must preserve its appearance and the authored intro.

[DECISION NEEDED] Ask the owner before altering the visual tokens or motion identity.

> The single reference for colour, type, space, shadow, motion and sound values.
> Everything here is declared in `_src/site.css` `:root` or `_src/site.js` constants.
> **If a value is not in this file, it is not a token** — it is a one-off and should
> be questioned in review.

## 1 · Colour

| Token | Value | Where it is used | Contrast note |
|---|---|---|---|
| `--paper` | `#FDFBF7` | page background, light cards, text on ink | the warm off-white; never pure `#fff` |
| `--paper-2` | `#F5F1E8` | alternating section bands | one step darker than paper |
| `--ink` | `#0A0A0A` | body text, borders, hard shadows, dark sections | not pure black, prints warmer |
| `--teal` | `#0E4B43` | brand colour, `.pillar::before` hover panel, portrait background | 8.9:1 on paper |
| `--teal-deep` | `#08322D` | lab section gradient, depth under teal | |
| `--red` | `#D42C24` | CTA, kicker, `sec-no`, the "R" in the logo | **4.85:1 on paper, 5.02:1 with white text** — AA-safe, do not lighten |
| `--red-deep` | `#B81112` | pressed states | |
| `--brass` | `#C9A86A` | merit / hall-of-fame accents | decorative only, never small text |
| `--mint` | `#8DE3D0` | highlight on dark, sound-on, maths veil glyphs | on ink only |
| `--coral` | `#FF5A4E` | preloader beat bars, small live dots | on dark only |
| `--grid` | `rgba(14,75,67,.075)` | the drafting-paper grid (body background) | decorative |
| `--grid-strong` | `rgba(14,75,67,.14)` | grid on dark surfaces | decorative |

Rule of thumb: **paper + ink are the page, teal is the brand, red is one call to action per screen,
mint/brass/coral are accents that never carry text.**

## 2 · Type

| Token | Stack | Use |
|---|---|---|
| `--bn` | `"Noto Sans Bengali","Hind Siliguri","BN Metric",sans-serif` | **all Bengali copy** (body default) |
| `--sans` | `"Archivo","Noto Sans Bengali","BN Metric","Hind Siliguri",system-ui` | display headings, Latin brand words |
| `--mono` | `"JetBrains Mono","Noto Sans Bengali",ui-monospace,monospace` | HUD labels, numbers, kickers, `sec-no` |
| `--serif` | Bengali stack, serif fallback | pull quotes |

Scale in use: `clamp()` everywhere, never fixed px on headings.

| Element | Size |
|---|---|
| body | `16px / 1.6` |
| `.sec-title` | `clamp(27px,4.2vw,46px)`, weight 900 |
| `.hero h1` | `clamp(34px,7.4vw,86px)`, weight 900 |
| `.pillar h3` | `21px / 1.25` |
| `.postcard h3` | `19px / 1.32` |
| `.postcard p` | `13.5px / 1.62` |
| HUD / mono labels | `9–11px`, `letter-spacing .1–.22em`, uppercase |

**Bengali digits are ৪২ not 42** in all visible copy. Two exceptions, both deliberate:
the preloader HUD (`014 %`, `ANGLE: 172°`) and the 404 numerals, because বাংলা ৪ and ৮ are
visually identical at display size.

## 3 · Space & layout

| Token | Value | Meaning |
|---|---|---|
| `--pad` | `clamp(18px,4.2vw,52px)` | page side gutter |
| `--header` | `76px` | sticky header height (scroll offsets use it) |
| `.wrap` | `max-width:1180px; margin:auto` | content column |
| section rhythm | `padding:clamp(48px,7vw,96px) 0` | vertical air between `.sec` blocks |
| grid gaps | `16–20px` cards · `30px` two-column splits | |

Breakpoints: **520 · 640 · 720 · 760 · 1020** px. Mobile-first; the header nav collapses to
`#burger` + drawer below 1020 px.

## 4 · Borders, radius, shadow

| Token | Value |
|---|---|
| `--line` | `2px solid var(--ink)` |
| `--shadow` | `6px 6px 0 var(--ink)` — the default hard offset |
| `--shadow-sm` | `4px 4px 0 var(--ink)` |
| `--shadow-lg` | `10px 10px 0 var(--ink)` |
| radius | **0** everywhere except `.tprofile__logo`-era circles (now a square seal) and the sound chip |

Hover language: cards translate `-3px,-3px` and grow the shadow to `9px 9px`. **Nothing scales up
above 1.04 and nothing blurs.** No ripples, liquid-metal, or displacement effects are used; the maths veil is limited to instructor photos.

## 5 · Motion

| Token | Value |
|---|---|
| `--ease` | `cubic-bezier(.16,1,.3,1)` (expo-ish out) |
| micro (hover, colour) | `280–420 ms` |
| reveal (`.rv` on scroll) | `520 ms`, `y:18px → 0`, staggered `60 ms` |
| preloader | authored at **3.6 s**, stretched to **4.7 s** with `tl.timeScale(1/1.306)` |
| intro track | 128 BPM, `TRACK_BEAT = 0.469 s` |
| maths veil stagger | `28 ms` per glyph, `.34 s` fade, `--rot` ±8° |
| scroll sound throttle | `190 ms` |
| slider blip debounce | `34 ms` |

`prefers-reduced-motion: reduce` ⇒ preloader skipped, maths veil hidden, liquid-free by default,
sound starts muted, all `.rv` reveals render final-state.

## 6 · Sound

All voices live in `SFX.VOICE` (`_src/site.js`). Master chain: `gain .32 → compressor
(threshold −24, ratio 8) → destination`.

| Voice | Synthesis | Gain |
|---|---|---|
| `hover` | sine 1480→1770 Hz, 50 ms | .020 |
| `press` | triangle 150→72 Hz + noise 2400 | .045 |
| `slider` | triangle 420→1180 Hz, 45 ms | .038 |
| `scroll` | band-pass noise 1250–2000 Hz + sine 210–300 Hz | .042 |
| `tick` | square 1180 Hz, 35 ms | .010 |
| `kick` | sine 118→44 Hz | .115 |
| `hat` | high-pass noise 7800 Hz | .030 |
| `arp` | triangle, scale `523.25 659.25 783.99 880 1046.5` | .055 |
| `riser` | band-pass noise 320→6200 Hz over 1.05 s | .070 |
| `impact` | noise 2400→90 Hz + sine 74→38 Hz | .130 |
| `chord` | triangle + sine fifth | .055 |
| `whoosh` | band-pass 5600→500 Hz | .055 |

Sound is **on at every load**, never persisted, never gated behind a prompt (see
`docs/AUDIO-INTERACTION.md`).

## 7 · z-index ladder

| Layer | z |
|---|---|
| body / sections | `auto` |
| section decoration (`::before`) | `0` |
| card content | `1–2` |
| maths veil | `6` |
| `.sticky-cta` (mobile) | `60` |
| `.header` | `70` |
| `.drawer` | `80` |
| `.toast` | `90` |
| `#preloader` | `999` |

## 8 · Iconography

- One sprite in `_src/02-top.html` (`<symbol id="i-*">`), 24×24, `stroke:currentColor`,
  `stroke-width:1.8–2.2`, square joins. Real brand marks for Facebook / WhatsApp / Maps.
- No icon fonts, no CDN, no emoji as UI.
