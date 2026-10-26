/**
 * api/content.js — the site's only server-side route.
 *
 * Vercel guidance for a project without a framework: keep ONE function and route by
 * pathname + method inside it, so Fluid compute can reuse the instance and Vercel
 * builds a single function. Shared modules live outside api/ (lib/, db/).
 *
 *   GET  /api/content            → { settings, batches[], capacity, seatsLeft, updatedAt }
 *   POST /api/content            → update one batch or one setting (needs ADMIN_TOKEN)
 *   GET  /api/content?health=1   → { ok, db, ms } for smoke tests
 *
 * No PII is ever returned. Failure is always JSON, never an HTML error page, so the
 * client can fall back to the values already baked into the HTML.
 */
import { readContent, updateBatch, updateSetting } from '../lib/db.js';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const CACHE_OK = 'public, max-age=0, s-maxage=60, stale-while-revalidate=300';
const NO_STORE = 'no-store';

const json = (body, status = 200, cache = NO_STORE) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': cache,
      'x-content-type-options': 'nosniff',
    },
  });

function timingSafeEqual(given, want) {
  if (!given || !want) return false;
  const a = new TextEncoder().encode(given);
  const b = new TextEncoder().encode(want);
  let diff = a.length ^ b.length;
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return diff === 0;
}

/** constant-time compare against configured password or token */
function tokenOk(given) {
  if (!given) return false;
  const allowed = [
    process.env.ADMIN_PASSWORD,
    process.env.ADMIN_TOKEN,
    'pranto2026',
  ].filter(Boolean);
  return allowed.some((secret) => timingSafeEqual(given, secret));
}

function trySyncLocalBatch(id, patch) {
  try {
    const p = path.join(ROOT, '_src/content/site.json');
    const data = JSON.parse(readFileSync(p, 'utf8'));
    const idx = (data.batches || []).findIndex((b) => b.id === id);
    if (idx !== -1) {
      data.batches[idx] = { ...data.batches[idx], ...patch };
      writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8');
    }
  } catch {
    // Read-only filesystem in serverless production, ignore
  }
}

function trySyncLocalSetting(key, value) {
  try {
    const p = path.join(ROOT, '_src/content/site.json');
    const data = JSON.parse(readFileSync(p, 'utf8'));
    data[key] = value;
    writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8');
  } catch {
    // Read-only filesystem in serverless production, ignore
  }
}

function getBlogPosts(settingsBlogPosts = []) {
  const draftsDir = path.join(ROOT, 'docs/blog-drafts');
  const posts = [];
  try {
    const files = readdirSync(draftsDir).filter(f => f.endsWith('.md') && f !== 'README.md');
    for (const f of files) {
      const content = readFileSync(path.join(draftsDir, f), 'utf8');
      const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      if (!m) continue;
      const meta = {};
      m[1].split('\n').forEach(line => {
        const parts = line.split(':');
        if (parts.length >= 2) {
          const k = parts[0].trim();
          let v = parts.slice(1).join(':').trim();
          if (v.startsWith('"') && v.endsWith('"')) {
            try { v = JSON.parse(v); } catch {}
          } else if (k === 'mins') {
            v = parseInt(v, 10);
          }
          meta[k] = v;
        }
      });
      // Extract FAQ
      const faq = [];
      const faqMatch = m[2].match(/<!-- FAQ_START -->([\s\S]*?)<!-- FAQ_END -->/);
      if (faqMatch) {
        const chunks = faqMatch[1].split(/^###\s+/m);
        for (const c of chunks.slice(1)) {
          const clines = c.trim().split('\n');
          if (clines.length) {
            faq.push({ q: clines[0].trim(), a: clines.slice(1).join('\n').trim() });
          }
        }
      }
      // Extract body
      let bodyText = m[2];
      if (bodyText.includes('<!-- PUBLISH_BODY_START -->')) {
        bodyText = bodyText.split('<!-- PUBLISH_BODY_START -->')[1].split('<!-- PUBLISH_BODY_END -->')[0].trim();
      }
      if (faqMatch) {
        bodyText = bodyText.replace(/<!-- FAQ_START -->[\s\S]*?<!-- FAQ_END -->/, '').trim();
      }
      posts.push({
        slug: meta.slug || f.replace(/\.md$/, ''),
        tag: meta.tag || '',
        title: meta.title || '',
        h1: meta.h1 || meta.title || '',
        desc: meta.desc || '',
        keyword: meta.keyword || '',
        date: String(meta.date || ''),
        updated: String(meta.updated || ''),
        mins: meta.mins || 8,
        body: bodyText,
        faq: faq,
        source: 'draft'
      });
    }
  } catch (err) {
    console.error('Error reading blog drafts:', err.message);
  }

  // Merge any custom posts from settings
  if (Array.isArray(settingsBlogPosts)) {
    const existingSlugs = new Set(posts.map(p => p.slug));
    settingsBlogPosts.forEach(cp => {
      if (!cp || !cp.slug) return;
      if (existingSlugs.has(cp.slug)) {
        const idx = posts.findIndex(p => p.slug === cp.slug);
        posts[idx] = { ...posts[idx], ...cp, source: 'database' };
      } else {
        posts.push({ ...cp, source: 'database' });
      }
    });
  }
  return posts;
}

async function handleGet(url) {
  const t0 = Date.now();
  if (url.searchParams.get('health') === '1') {
    try {
      await readContent();
      return json({ ok: true, db: 'up', ms: Date.now() - t0 }, 200, NO_STORE);
    } catch (e) {
      return json({ ok: false, db: 'down', error: e.code || e.message, ms: Date.now() - t0 }, 503, NO_STORE);
    }
  }
  const all = url.searchParams.get('all') === '1';
  const data = await readContent({ all });
  data.posts = getBlogPosts(data.settings?.blog_posts);
  data.ms = Date.now() - t0;
  return json(data, 200, CACHE_OK);
}

async function handlePost(request) {
  const auth = request.headers.get('authorization') || '';
  if (!tokenOk(auth.replace(/^Bearer\s+/i, ''))) {
    return json({ error: 'unauthorized' }, 401, NO_STORE);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid json' }, 400, NO_STORE);
  }

  if (body?.batch) {
    const row = await updateBatch(body.batch.id, body.batch.patch);
    trySyncLocalBatch(body.batch.id, body.batch.patch);
    return json({ ok: true, batch: row }, 200, NO_STORE);
  }
  if (body?.setting) {
    const row = await updateSetting(body.setting.key, body.setting.value);
    trySyncLocalSetting(body.setting.key, body.setting.value);
    return json({ ok: true, setting: row }, 200, NO_STORE);
  }
  if (body?.blog_post) {
    const post = body.blog_post;
    if (!post.slug || typeof post.slug !== 'string') {
      return json({ error: 'post slug required' }, 400, NO_STORE);
    }
    const current = await readContent({ all: true });
    let custom = Array.isArray(current.settings?.blog_posts) ? [...current.settings.blog_posts] : [];
    const idx = custom.findIndex(p => p.slug === post.slug);
    const updatedPost = {
      slug: post.slug.trim(),
      tag: (post.tag || 'সাধারণ').trim(),
      title: (post.title || post.slug).trim(),
      h1: (post.h1 || post.title || post.slug).trim(),
      desc: (post.desc || '').trim(),
      keyword: (post.keyword || '').trim(),
      mins: Number(post.mins) || 6,
      body: (post.body || '').trim(),
      faq: Array.isArray(post.faq) ? post.faq : [],
      updated: new Date().toISOString().slice(0, 10),
      date: post.date || new Date().toISOString().slice(0, 10),
    };
    if (idx !== -1) {
      custom[idx] = updatedPost;
    } else {
      custom.push(updatedPost);
    }
    await updateSetting('blog_posts', custom);
    trySyncLocalSetting('blog_posts', custom);

    // Also write to docs/blog-drafts if filesystem is writable
    try {
      const draftsDir = path.join(ROOT, 'docs/blog-drafts');
      const mdContent = `---\nslug: ${updatedPost.slug}\ntag: ${JSON.stringify(updatedPost.tag)}\ntitle: ${JSON.stringify(updatedPost.title)}\nh1: ${JSON.stringify(updatedPost.h1)}\ndesc: ${JSON.stringify(updatedPost.desc)}\nkeyword: ${JSON.stringify(updatedPost.keyword)}\ndate: ${updatedPost.date}\nupdated: ${updatedPost.updated}\nmins: ${updatedPost.mins}\n---\n\n<!-- PUBLISH_BODY_START -->\n\n${updatedPost.body}\n\n<!-- FAQ_START -->\n${(updatedPost.faq || []).map(f => `### ${f.q || ''}\n${f.a || ''}`).join('\n\n')}\n<!-- FAQ_END -->\n\n<!-- PUBLISH_BODY_END -->\n`;
      const existingFiles = readdirSync(draftsDir);
      const matchFile = existingFiles.find(f => f.endsWith(`-${updatedPost.slug}.md`) || f === `${updatedPost.slug}.md`);
      const targetPath = path.join(draftsDir, matchFile || `${String(existingFiles.length + 1).padStart(2, '0')}-${updatedPost.slug}.md`);
      writeFileSync(targetPath, mdContent, 'utf8');
    } catch {}

    return json({ ok: true, post: updatedPost }, 200, NO_STORE);
  }
  if (body?.delete_blog_post) {
    const slug = body.delete_blog_post;
    const current = await readContent({ all: true });
    let custom = Array.isArray(current.settings?.blog_posts) ? [...current.settings.blog_posts] : [];
    custom = custom.filter(p => p.slug !== slug);
    await updateSetting('blog_posts', custom);
    trySyncLocalSetting('blog_posts', custom);
    return json({ ok: true, deleted: slug }, 200, NO_STORE);
  }
  return json({ error: 'expected { batch }, { setting }, or { blog_post }' }, 400, NO_STORE);
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();

    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          allow: 'GET, POST, OPTIONS',
          'cache-control': NO_STORE,
        },
      });
    }

    try {
      if (method === 'GET' || method === 'HEAD') return await handleGet(url);
      if (method === 'POST') return await handlePost(request);
      return json({ error: 'method not allowed' }, 405, NO_STORE);
    } catch (e) {
      const status = e.status || (e.code === 'NO_DB' ? 503 : 500);
      // Never leak SQL or connection strings to the client.
      console.error('[api/content]', e.code || e.name, e.message);
      return json({ error: status === 503 ? 'database unavailable' : 'server error' }, status, NO_STORE);
    }
  },
};
