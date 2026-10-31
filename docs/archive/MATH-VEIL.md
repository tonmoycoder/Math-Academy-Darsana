# 1 · What it is

The hover on the two instructor portraits (`.tphoto` in the hero, `.tport` in `#teacher`).
**The photograph never changes.** On hover a scrim deepens, a hairline frame draws its corners in,
and 16 bold maths glyphs — `sin cos √ π φ β γ ± ∑ θ Δ ∞ ∫ tan ω λ` — rise into place with a short
stagger. It replaces the earlier "liquid metal" ripple, which the client asked to be removed.

# 2 · Files

| Piece | Where |
|---|---|
| Layer creation + state classes | `_src/site.js`, the `MATH VEIL` IIFE (end of the file, after the lab code) |
| Glyph table | `const SYMS = [['sin','10%','26%',0], …]` — `[text, x, y, index]` |
| Styles | `_src/site.css`, the `MATH VEIL` block |
| States | `.tphoto.is-math`, `.tport.is-math` |

# 3 · Structure

```
figure.tphoto (or .tport)
├── img.tphoto__img          ← unchanged, untouched on hover
├── .tphoto__grain / __grid  ← existing texture, z 3
└── .mveil                   ← injected, z 6, pointer-events:none
    ├── .mveil__wash         ← radial scrim, opacity 0 → 1
    ├── .mveil__frame        ← 1px inset border + 4 corner ticks
    └── 16 × .mveil__sym     ← --x --y --i --rot
```

# 4 · Why the glyphs sit where they do

`--x/--y` are hand-placed in **two edge columns** (≈10 % / 21 % and ≈79 % / 90 % of the width).
That keeps three zones clear regardless of the photo:

- the face in the middle,
- the historical top HUD (`INSTRUCTOR FILE // 01`, `EST. 2020`; superseded by the owner-corrected 2022 founding year),
- the bottom quote bar (`"কেউ পিছিয়ে থাকলে ক্লাস এগোয় না"`).

An earlier attempt spread glyphs over the whole surface and landed on top of those labels — do not
go back to a random spread.

# 5 · Motion budget

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

# 6 · Input modes

| Mode | Trigger | Release |
|---|---|---|
| desktop | `pointerenter` | `pointerleave` |
| touch | `pointerdown` | automatic after **1.8 s** |
| keyboard | `focus` (both figures are `tabindex="0"`) | `blur` |
| reduced motion | `.mveil{display:none}` | — |

# 7 · Checks

1. Hover the hero portrait: 16 glyphs appear, the face is clear, the photo is unchanged.
2. Leave: everything fades, `is-math` removed.
3. Tap on a phone: 1.8 s then it releases itself (never stuck).
4. Tab to the portrait: same reveal.
5. `prefers-reduced-motion` → nothing appears.
