# CODE-REVIEW.md — pre-release review

## 1. Architecture conformance

| Check | Verdict |
|---|---|
| Editable source only in `_src/`; output generated | pass |
| No framework / bundler / `package.json` | pass |
| Tokens centralised in `:root`; components reused | pass |
| One IIFE, ordered blocks, no globals | pass |
| SEO block generated in one place (`build.py`) | pass |
| Demo data clearly separated (`site.js` arrays) | pass |

## 2. Findings

| # | Severity | Area | Finding | Action |
|---|---|---|---|---|
| R-1 | Medium | Maintainability | Business truth (phone, fees, seats) is duplicated across HTML, JS and JSON-LD. | Documented in `AGENTS.md` §13 as a controlled duplication; a single JSON source + template loop is the future fix, intentionally deferred (it would add a build dependency). |
| R-2 | Medium | Performance | Bengali font (91 KB) dominates LCP. | Documented; optional critical-subset plan in `README.md` + `IMPLEMENTATION-PLAN.md` P6. |
| R-3 | Low | Dead code | Older asset exports remain in `assets/` (`pranto-*`, `mark-560*`) and are not referenced by the build. | Kept intentionally as source material; not shipped in `dist/`. Safe to delete in a later cleanup. |
| R-4 | Low | Consistency | Some inline `style=""` attributes remain in markup (e.g. `tel:` buttons, icon sizes). | Left in place: they carry one-off tokenised values the refactor would not simplify. |
| R-5 | Low | Accessibility | Slider outputs are visual text; screen readers get the range value natively. | Acceptable; `aria-label` present on every range. |
| R-6 | Info | Naming | `.tphoto` / `.tport` are domain-specific names for the two portrait treatments. | Renaming would churn CSS for no benefit; documented in `DESIGN.md`. |

## 3. Refactoring performed (this cycle)
- Generalised the ink engine to `[data-ink]` so the hero poster and the teacher portrait share one implementation (removed a duplicate pointer handler).
- Consolidated the publish pipeline (deduplicated assets by content hash, single `_emit()` helper).
- Replaced the ad-hoc preloader timings with a single fast timeline and moved the hero intro under the shutter.

## 4. Remaining technical debt
1. Font strategy (critical subset) — blocked on approval.
2. Single source for business facts — deferred by design.
3. No CI job — the Playwright/Lighthouse checks are run manually; adding a GitHub Action is the next infra step, not required for launch.
