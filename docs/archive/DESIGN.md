# 1 · This file moved

The design system now lives in **two** documents, because "how it looks" and "how it is built"
answer different questions:

| Question | File |
|---|---|
| What are the colours, type scale, spacing, shadows, motion and sound values? | [`DESIGN-TOKENS.md`](DESIGN-TOKENS.md) |
| How is a given component assembled, and what are its states? | [`COMPONENTS.md`](COMPONENTS.md) |

# 2 · The one-paragraph summary

A "kinetic drafting system": warm paper (`#FDFBF7`) with a faint teal grid, black 2 px borders and
hard offset shadows (no blur, radius 0), vermillion `#D42C24` reserved for one call to action per
screen, teal `#0E4B43` as the brand surface, and a mono HUD voice (`JetBrains Mono`, uppercase,
.1–.22em tracking) talking over Bengali display type. Motion is expo-out and short; the preloader is
the one long, loud exception.
