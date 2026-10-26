# Root Files — what lives at `/` and why

> Every file below sits in the **top-level root** of the deployed site (`https://mathacademydarsana.vercel.app/…`).
> All of them are plain text and work on any host (Vercel, Netlify, Cloudflare Pages, Apache, Nginx).
> `dist/` is generated — edit the repo copies, then `python3 _src/build.py --publish`.

---

## 1. The table

| File | Root path | Purpose | Read by | Status here |
|---|---|---|---|---|
| `sitemap.xml` | `/sitemap.xml` | lists every indexable URL + `lastmod` | Google, Bing, DuckDuckGo | **shipped** (generated) |
| `robots.txt` | `/robots.txt` | crawl permission + sitemap pointer + AI-bot allow-list | every crawler | **shipped** |
| `llms.txt` | `/llms.txt` | short Markdown fact sheet for AI engines | LLMs, chat assistants | **shipped** |
| `llms-full.txt` | `/llms-full.txt` | full readable text of every page (~68 KB) | LLMs, agents | **shipped** (generated) |
| `.well-known/security.txt` | `/.well-known/security.txt` | RFC 9116 vulnerability-report contact | security researchers, scanners | **shipped** |
| `humans.txt` | `/humans.txt` | who built the site (teacher + developer) | humans, some scanners | **shipped** |
| `ads.txt` | `/ads.txt` | authorises ad sellers | AdSense / programmatic buyers | **not shipped — no ads** |
| `app-ads.txt` | `/app-ads.txt` | authorises sellers for a linked mobile app | App Store / Play crawlers | **not shipped — no app** |
| `404.html` | `/404.html` | themed error page, real 404 status | browsers, crawlers | **shipped** |
| `og-1200x630.jpg` | `/og-1200x630.jpg` | social preview card | Facebook, WhatsApp, X, LinkedIn | **shipped** |

### Why `ads.txt` and `app-ads.txt` are intentionally absent

They are **permission lists**, not SEO files. Publishing an empty or placeholder `ads.txt` does not help
rankings and can confuse ad platforms later ("file exists but authorises nobody"). The correct moment to add
`ads.txt` is the day an AdSense account is approved — it then contains exactly one line:

```
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

`app-ads.txt` is only meaningful when a **mobile app** lists this domain as its developer website. This project
has no app, so the file would be dead weight.

---

## 2. Where each file is produced

| File | Source in repo | Produced by |
|---|---|---|
| `sitemap.xml` | generated inside `_src/build.py` | build (also rewrites the repo copy) |
| `robots.txt` | repo root `robots.txt` | copied + host rewritten by build |
| `llms.txt` | repo root `llms.txt` | copied + host rewritten by build |
| `llms-full.txt` | generated from the rendered HTML | build |
| `.well-known/security.txt` | generated string in `_src/build.py` | build |
| `humans.txt` | generated string in `_src/build.py` | build |
| `404.html` | `_src/404-body.html` + theme CSS | build |
| `og-1200x630.jpg` | `assets/og-1200x630.jpg` | copied verbatim |

**Rule:** never edit anything inside `dist/`. It is overwritten on the next build.

---

## 3. Host notes

| Host | Nothing to do | Watch out for |
|---|---|---|
| **Vercel** (current) | all files served from the output directory as-is | `cleanUrls: true` makes `/index.html` redirect to `/` — keep canonicals pointing at `/` |
| **Netlify** | files served as-is; `_redirects` not needed | `publish = "dist"` must point at the folder, not the repo root |
| **Cloudflare Pages** | files served as-is | dot-directories (`.well-known`) are served, but the file must be inside the uploaded folder |
| Apache / Nginx | works if `AllowOverride` / `location` serves dot-files | some hosts block `.well-known` by default — test it |

### Verify in 30 seconds after any deploy

```bash
for u in /robots.txt /sitemap.xml /llms.txt /llms-full.txt /humans.txt \
         /.well-known/security.txt /404.html /og-1200x630.jpg; do
  printf '%s  %s\n' "$(curl -s -o /dev/null -w '%{http_code}' https://mathacademydarsana.vercel.app$u)" "$u"
done
curl -s -o /dev/null -w 'real-404=%{http_code}\n' https://mathacademydarsana.vercel.app/does-not-exist
```

Expected: eight `200`s and `real-404=404`.

---

## 4. Rules that keep these files honest

1. **`sitemap.xml` must list only indexable URLs.** The 404 page is excluded by design.
2. **`lastmod` = the date the content really changed.** A fake date gets ignored.
3. **`robots.txt` must not block what the sitemap advertises.** Contradiction = soft exclusion.
4. **`llms.txt` must match the page.** It is a fact sheet; a stale fact sheet is worse than none.
5. **`security.txt` shows correct contact endpoints** — a researcher must not have to guess. Keep `Expires:` in the future.
6. **`humans.txt` is credit, not SEO.** It now carries the developer byline (তানভীর ইসলাম তন্ময়).
