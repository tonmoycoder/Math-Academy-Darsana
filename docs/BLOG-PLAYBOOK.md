# BLOG-PLAYBOOK — legacy pointer

**Status:** superseded on 2026-10-26. Do not use the old `_src/blog/posts.py` workflow or the `/guide/` routes described in earlier versions.

[ASSUMPTION] This file is retained only because older project notes link to its filename; the current writer contract is documented in the Markdown draft directory.

## 1 · Current source of truth

Read `docs/START-HERE.md`, then `docs/blog-drafts/README.md` and `docs/BLOG-CONTENT-PLAN.md`. The exact ten article sources are `docs/blog-drafts/01-*.md` through `10-*.md`.

## 2 · Current publishing rules

- Exactly ten articles/routes; do not add an eleventh post without an explicit replacement decision.
- Four curated homepage cards; the CTA is **«আরও ব্লগ দেখুন»** and links to `/blog/`.
- Each Markdown file has required front matter, a `PUBLISH_BODY_START/END` region, and exactly three FAQ pairs.
- Build with `python3 _src/build.py --publish`; never hand-edit generated `dist/` files.
- Recheck the current NCTB/board document whenever publishing or refreshing year-specific claims.

## 3 · Open decisions

[DECISION NEEDED] Any future change to the ten-topic set must identify which current slug is being replaced. Do not revive the archived eleven-post inventory by default.
