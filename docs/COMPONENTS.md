# COMPONENTS — markup, classes, behaviour, states

**Audience:** whoever edits a component · **Last updated:** 2026-10-26 (v10.3.0 candidate)
**Read next:** `DESIGN-TOKENS.md`, `AUDIO-INTERACTION.md`
**Merged from:** `docs/archive/MATH-VEIL.md` (merged into §13–19)

> Every component below lists: markup location · CSS class · behaviour · states ·
> accessibility. Read together with `docs/DESIGN-TOKENS.md`.

[ASSUMPTION] Component behavior described here follows the current source tree; generated pages must be rebuilt before visual verification.

[DECISION NEEDED] Get owner approval before changing intro timing, the design language, data ownership, or audio behavior.

## 1 · Preloader (`#preloader`)

| | |
|---|---|
| Markup | `_src/02-top.html` (top of file, before the header) |
| CSS | `_src/site.css` — the `pre__*` block |
| JS | `runPreloader()` in `_src/site.js` |
| Duration | authored 3.6 s → played at **4.7 s** (`tl.timeScale(1 / 1.306)`) |
| Stages | `BOOT 0` · `SPIN-UP 0.5` · `ASSEMBLE 1.35` · `CHARGE 2.35` · `LOCK 2.8` |

Layers, bottom to top: grid → crosshair (`.pre__cx/.pre__cy`) → 24-tick ring (`#preTicks`) →
`.pre__mark` (logo) + three rings → sweep → two band slices (`#sliceTop/#sliceBot`) with the
`PROOF OVER MEMORY` type → lockup (brand + `#preBar` + `#preBeat`) → `#preSlash` → `.pre__flash`.
HUD: `#preStage`, `#prePct`, `#preAngle`.

Behaviour: plays on **every** load (nothing is stored); `#preSkip` kills the timeline and the audio
context; `#replayBtn` in the hero calls `runPreloader(true)` and replays it; `heroIntro()` runs once
per play and animates the hero in.

Reduced motion ⇒ skipped entirely.

## 2 · Sound engine (`SFX`)

| | |
|---|---|
| JS | `_src/site.js` — `var SFX = (function(){…})()` at the top |
| Voices | `hover press slider scroll tick sweep shutter lock kick hat arp riser impact chord whoosh toast success error open` |
| API | `.play(name, arg)` · `.cue(name, delay, arg)` · `.arm()` · `.isArmed()` · `.isOn()` · `.set(bool)` · `.toggle()` · `.stopAll()` |

`boot()` creates the context, compressor and master gain when the automatic attempt/ordinary interaction reaches it. The `PERM` module records an audible grant in localStorage/IndexedDB and requests persistent storage where supported. Mute is session-only; it does not suppress later visits. `stopAll()` closes the context so scheduled notes are stopped. A stored grant is not browser autoplay permission; browser policy may still require an interaction.

Full autoplay strategy and browser limits: `docs/AUDIO-INTERACTION.md`.

## 3 · Maths veil — the portrait hover

| | |
|---|---|
| Markup | injected by the `MATH VEIL` IIFE into `.tphoto` and `.tport` |
| CSS | `_src/site.css` — `.mveil*` |
| Layer | `.mveil` at `z-index:6`, `pointer-events:none` |

On hover the **photo does not change**; a scrim fades in, a hairline frame draws its corners, and
16 bold glyphs (`sin cos √ π φ β γ ± ∑ θ Δ ∞ ∫ tan ω λ`) rise into place in two edge columns with a
28 ms stagger and ±8° rotation. Two of every few glyphs are mint, one in four coral.

States: `.tphoto.is-math` / `.tport.is-math`. Desktop = pointerenter/leave, touch = 1.8 s flash on
tap, keyboard = `focus`/`blur` (both figures are `tabindex="0"`). Reduced motion hides `.mveil`.

Positions live in the `SYMS` array in `site.js` — hand-placed so nothing sits on the face or on the
existing HUD labels.

## 4 · Cards (`.pillar`, `.sheet`, `.fame-card`, `.lib-item`, `.postcard`)

2 px ink border, hard offset shadow, a teal (`::before`) panel that slides up on hover, content at
`z-index:1`. Hover: `translate(-3px,-3px)`, shadow `9px 9px`, text flips to paper.
**No filters, no displacement, no ripple** — that treatment was removed in v9.

`.postcard` is the blog teaser card; `.postcard--all` is the inverted "সব লেখা" card which turns red
on hover.

## 5 · Interactive lab (`#lab`)

Four tabs (`circle`, `tri`, `pyth`, `unit`), each an inline SVG driven by `<input type=range>`.
Ranges: `#rRange #dRange #aRange #bRange #paRange #pbRange #thetaRange`. Every input fires the
`slider` sound voice. State text uses Bengali digits. Keyboard-operable; each SVG has
`role="img"` + `aria-label`, and the live numbers are `aria-live="polite"`.

## 6 · Result lookup (`#results`)

A **demo**, clearly labelled: three hard-coded roll numbers (`MA-2026-084`, `-021`, `-112`) return a
fixed report card with animated bars. No network, no database. Guarded by
`aria-live="polite"` on the result card and a visible "ডেমো" note.

## 7 · Sound toggle

`#sndBtn` in the header, `#sndBtn2` in the drawer. Both toggle the same state via
`paintSound()` (HTML class `snd-off`, `aria-pressed`, label text) and a toast. **The choice is
session-only** — it never silences the next visit.

## 8 · Forms & CTAs

Every `.btn` with `data-wa` turns into a WhatsApp click-through with a pre-filled Bengali message.
`#book` is the contact section with a client-side form that composes a WhatsApp information request; it does not reserve a seat or submit personal data to the site. The section shows locality/map, asks visitors to confirm the current schedule on WhatsApp, and has the form. All header/hero/batch/footer/sticky CTAs request current batch information, not a booking.

## 9 · Blog

| | |
|---|---|
| Data | `docs/blog-drafts/` — ten Markdown sources; `_src/build.py` renders each public body into its own route |
| Hub | `/blog/` — generated in `build.py` (`hub_body`) |
| Post | `/blog/<slug>/` — `Article` + `FAQPage` + `Breadcrumb` JSON-LD |
| Teaser | `blog_section()` in `build.py`, rendered into `<!--__BLOG_SECTION__-->` (SEC 09) |
| Nav | `<!--__BLOG_NAV__-->` in the header + a drawer entry + footer link |
| Legacy | `/guide/**` redirect stubs, `noindex,follow`, canonical to `/blog/` |

Adding or replacing a post = edit one numbered Markdown draft in `docs/blog-drafts/`, preserve its parser contract, then rebuild. The exact-ten rule requires an explicit replacement; the homepage still features exactly four curated slugs.

## 10 · 404

`_src/404-body.html` + build-time `404.html`. Real 404 status on every host
(`vercel.json` uses the platform default, Netlify/Cloudflare use `_redirects`). Assets are rewritten
to root-absolute at build time so the page renders correctly from **any** URL depth.

## 11 · Header, drawer, sticky CTA

Sticky `.header` (`--header:76px`), `#burger` opens `.drawer` (`inert` when closed; Escape closes), scroll-spy adds `.is-active` to the current section link, and `.sticky-cta` appears on mobile after the hero. Keyboard focus behavior must be verified manually; do not claim a focus trap.

## 12 · Reduced motion

One guard at the top of `site.js` (`var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches`)
feeds the preloader, the veil, the sound defaults and every `.rv` reveal. Nothing may animate when
this is set.

---

## 13 · Part B — the MATH VEIL hover effect (merged from MATH-VEIL.md)

**The photograph never changes.** On hover a scrim deepens, a hairline frame draws its corners in,
and 16 bold maths glyphs — `sin cos √ π φ β γ ± ∑ θ Δ ∞ ∫ tan ω λ` — rise into place with a short
stagger. It replaces the earlier "liquid metal" ripple, which the client asked to be removed.

## 14 · Files

| Piece | Where |
|---|---|
| Layer creation + state classes | `_src/site.js`, the `MATH VEIL` IIFE (end of the file, after the lab code) |
| Glyph table | `const SYMS = [['sin','10%','26%',0], …]` — `[text, x, y, index]` |
| Styles | `_src/site.css`, the `MATH VEIL` block |
| States | `.tphoto.is-math`, `.tport.is-math` |

## 15 · Structure

```
figure.tphoto (or .tport)
├── img.tphoto__img          ← unchanged, untouched on hover
├── .tphoto__grain / __grid  ← existing texture, z 3
└── .mveil                   ← injected, z 6, pointer-events:none
    ├── .mveil__wash         ← radial scrim, opacity 0 → 1
    ├── .mveil__frame        ← 1px inset border + 4 corner ticks
    └── 16 × .mveil__sym     ← --x --y --i --rot
```

## 16 · Why the glyphs sit where they do

`--x/--y` are hand-placed in **two edge columns** (≈10 % / 21 % and ≈79 % / 90 % of the width).
That keeps three zones clear regardless of the photo:

- the face in the middle,
- the top instructor HUD and its short labels,
- the bottom quote bar (`"কেউ পিছিয়ে থাকলে ক্লাস এগোয় না"`).

An earlier attempt spread glyphs over the whole surface and landed on top of those labels — do not
go back to a random spread.

## 17 · Motion budget

| Property | Value |
|---|---|
| per-glyph stagger | `--i * 28 ms` |
| fade / rise | `.34 s` / `.46 s` |
| entry transform | `scale(.62) rotate(--rot) → scale(1) rotate(--rot)` |
| rotation | `−8° … +8°`, stable per slot |
| frame | `.4 s` opacity, corners slide 6 px |
| cost | CSS transitions only; **no rAF, no SVG filters, no per-frame JS** |

Colour: glyphs are paper white; every 3rd is mint, every 4th coral — enough to look designed without
turning into confetti.

## 18 · Input modes

| Mode | Trigger | Release |
|---|---|---|
| desktop | `pointerenter` | `pointerleave` |
| touch | `pointerdown` | automatic after **1.8 s** |
| keyboard | `focus` (both figures are `tabindex="0"`) | `blur` |
| reduced motion | `.mveil{display:none}` | — |

## 19 · Checks

1. Hover the hero portrait: 16 glyphs appear, the face is clear, the photo is unchanged.
2. Leave: everything fades, `is-math` removed.
3. Tap on a phone: 1.8 s then it releases itself (never stuck).
4. Tab to the portrait: same reveal.
5. `prefers-reduced-motion` → nothing appears.
