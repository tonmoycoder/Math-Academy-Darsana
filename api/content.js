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
import { readContent, updateBatch, updateSetting, getAdminAuth, setAdminAuth } from '../lib/db.js';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const CACHE_OK = 'public, max-age=0, s-maxage=60, stale-while-revalidate=300';
const NO_STORE = 'no-store';

const json = (body, status = 200, cache = NO_STORE, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': cache,
      'x-content-type-options': 'nosniff',
      ...headers,
    },
  });

function timingSafeEqual(given, want) {
  if (!given || !want) return false;
  const a = Buffer.isBuffer(given) ? given : Buffer.from(String(given));
  const b = Buffer.isBuffer(want) ? want : Buffer.from(String(want));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

async function verifyPassword(given) {
  if (!given || typeof given !== 'string') return false;
  const clean = given.trim();
  if (!clean) return false;

  // 1. Check custom DB-stored hash if available
  try {
    const authRecord = await getAdminAuth();
    if (authRecord && authRecord.hash && authRecord.salt) {
      const computed = hashPassword(clean, authRecord.salt);
      const a = Buffer.from(computed, 'hex');
      const b = Buffer.from(authRecord.hash, 'hex');
      if (a.length === b.length && timingSafeEqual(a, b)) {
        return true;
      }
      return false;
    }
  } catch (err) {
    console.error('[auth] verifyPassword db error:', err.message);
  }

  // 2. Fallback to configured environment secrets (ADMIN_PASSWORD or ADMIN_TOKEN)
  const allowed = [
    process.env.ADMIN_PASSWORD,
    process.env.ADMIN_TOKEN,
  ].filter(Boolean);
  if (allowed.length === 0) return false;
  return allowed.some((secret) => timingSafeEqual(clean, secret));
}

function getSessionSecret() {
  return process.env.ADMIN_TOKEN || process.env.ADMIN_PASSWORD || 'ma-secure-session-key-2026';
}

function createSessionToken() {
  const payload = {
    role: 'admin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
    nonce: crypto.randomBytes(8).toString('hex'),
  };
  const b64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', getSessionSecret()).update(b64).digest('base64url');
  return `${b64}.${sig}`;
}

function verifySessionToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;
  const [b64, sig] = token.split('.');
  if (!b64 || !sig) return false;
  const expectedSig = crypto.createHmac('sha256', getSessionSecret()).update(b64).digest('base64url');
  if (!timingSafeEqual(sig, expectedSig)) return false;
  try {
    const payload = JSON.parse(Buffer.from(b64, 'base64url').toString('utf8'));
    if (payload.role !== 'admin') return false;
    if (payload.exp < Math.floor(Date.now() / 1000)) return false;
    return true;
  } catch {
    return false;
  }
}

async function tokenOk(given) {
  if (!given) return false;
  if (verifySessionToken(given)) return true;
  return await verifyPassword(given);
}

function extractToken(request) {
  const auth = request.headers.get('authorization') || '';
  if (auth) return auth.replace(/^Bearer\s+/i, '').trim();
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/ma_session=([^;]+)/);
  if (match) return match[1].trim();
  return '';
}

function trySyncLocalBatch(id, patch) {
  if (process.env.MA_FAKE_DB === '1' || process.env.NODE_ENV === 'test') return;
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
  if (process.env.MA_FAKE_DB === '1' || process.env.NODE_ENV === 'test') return;
  try {
    const p = path.join(ROOT, '_src/content/site.json');
    const data = JSON.parse(readFileSync(p, 'utf8'));
    if (key === 'mock_results' || key === 'library' || Array.isArray(value)) {
      data[key] = value;
    } else if (typeof data[key] === 'object' && data[key] !== null && typeof value === 'object' && value !== null) {
      data[key] = { ...data[key], ...value };
    } else {
      data[key] = value;
    }
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
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid json' }, 400, NO_STORE);
  }

  // 1. Explicit Login Action
  if (body?.action === 'login') {
    const password = body.password;
    if (!password || typeof password !== 'string') {
      return json({ error: 'password_required', message: 'পাসওয়ার্ড দিন' }, 400, NO_STORE);
    }
    const valid = await verifyPassword(password);
    if (!valid) {
      return json({ error: 'invalid_credentials', message: 'ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিন।' }, 401, NO_STORE);
    }
    const token = createSessionToken();
    return new Response(JSON.stringify({
      ok: true,
      token,
      expires_in: 86400,
      message: 'সফলভাবে লগইন করেছেন'
    }), {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': NO_STORE,
        'set-cookie': `ma_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400; Secure`
      }
    });
  }

  // 2. All other actions require valid authentication
  const token = extractToken(request);
  const isAuthorized = await tokenOk(token);
  if (!isAuthorized) {
    return json({ error: 'unauthorized' }, 401, NO_STORE);
  }

  // 3. Password Change Action
  if (body?.change_password || body?.action === 'change_password') {
    const cp = body.change_password || body;
    const currentPass = cp.current_password;
    const newPass = cp.new_password;

    if (!currentPass || typeof currentPass !== 'string') {
      return json({ error: 'current_password_required', message: 'বর্তমান পাসওয়ার্ড প্রয়োজন' }, 400, NO_STORE);
    }
    const currentValid = await verifyPassword(currentPass);
    if (!currentValid) {
      return json({ error: 'current_password_incorrect', message: 'বর্তমান পাসওয়ার্ড সঠিক নয়' }, 401, NO_STORE);
    }
    if (!newPass || typeof newPass !== 'string' || newPass.trim().length < 8) {
      return json({ error: 'new_password_invalid', message: 'নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে' }, 400, NO_STORE);
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(newPass.trim(), salt);
    const authRecord = {
      salt,
      hash,
      algo: 'scrypt',
      updated_at: new Date().toISOString()
    };
    await setAdminAuth(authRecord);

    const freshToken = createSessionToken();
    return new Response(JSON.stringify({
      ok: true,
      message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে',
      token: freshToken
    }), {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': NO_STORE,
        'set-cookie': `ma_session=${freshToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400; Secure`
      }
    });
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
