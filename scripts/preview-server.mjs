/**
 * scripts/preview-server.mjs — serve dist/ the way Vercel does, for a live preview.
 *
 * Why a custom server instead of `python3 -m http.server`:
 *   · gzip on text (the page is ~350 KB raw, ~90 KB gzipped — Lighthouse and the
 *     preview both behave very differently without it)
 *   · real MIME types (browsers refuse a .woff2 served as octet-stream)
 *   · `?query` handling, HEAD, directory → index.html, and dist/404.html for misses
 *   · the cache policy from vercel.json (immutable assets, short HTML)
 *
 * It binds 0.0.0.0 and never inspects the Host/Origin header, so the Arena preview
 * proxy (https://{port}-{sandbox}.e2b.app) works without an allow-list.
 *
 *   node scripts/preview-server.mjs            # 8124
 *   node scripts/preview-server.mjs 8125       # another port
 *   PREVIEW_PORT=9000 node scripts/preview-server.mjs
 */
import http from 'node:http';
import { createGzip } from 'node:zlib';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from '../lib/env.js';

const ROOT = path.join(path.dirname(path.dirname(fileURLToPath(import.meta.url))), 'dist');
const PORT = Number(process.argv[2] || process.env.PREVIEW_PORT || 8124);

/* The real project is "static files + exactly one Function". A preview that served the
   HTML without /api/content would log a 404 on every load and always claim
   data-live="offline", so the same function is mounted here — on one origin, like Vercel.
   If the database is unreachable the handler still answers (JSON 503), the page just
   stays on its baked numbers. `PREVIEW_NO_API=1` skips this entirely. */
loadEnv();
if (!process.env.DATABASE_URL && process.env.NODE_ENV !== 'production') {
  process.env.MA_FAKE_DB = '1';
}
let api = null;
if (!process.env.PREVIEW_NO_API) {
  try {
    ({ default: api } = await import('../api/content.js'));
  } catch (e) {
    console.warn('[preview] /api/content unavailable →', e.message);
  }
}

async function handleApi(req, res) {
  const body = await new Promise((ok) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => ok(Buffer.concat(chunks)));
  });
  const request = new Request('http://localhost' + req.url, {
    method: req.method,
    headers: req.headers,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : body,
  });
  let handler = api;
  try {
    const fresh = await import(`../api/content.js?t=${Date.now()}`);
    handler = fresh.default;
  } catch {}
  const out = await handler.fetch(request);
  res.writeHead(out.status, Object.fromEntries(out.headers));
  res.end(Buffer.from(await out.arrayBuffer()));
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.webmanifest': 'application/manifest+json',
  '.pdf': 'application/pdf',
};
const COMPRESSIBLE = /^(text\/|application\/(json|xml|manifest\+json)|image\/svg)/;

/** Resolve a URL path to a file inside ROOT, or null. Blocks ../ escapes. */
async function resolve(urlPath) {
  let p;
  try {
    p = path.normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, '');
  } catch {
    return null;
  }
  let file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) return null;
  try {
    const s = await stat(file);
    if (s.isDirectory()) file = path.join(file, 'index.html');
    const final = await stat(file);
    return final.isFile() ? file : null;
  } catch {
    return null;
  }
}

async function send(res, req, file, status = 200) {
  const ext = path.extname(file).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';
  const buf = await readFile(file);
  const cache =
    ext === '.html' || ext === '.xml' || ext === '.txt'
      ? 'public, max-age=0, must-revalidate, s-maxage=600, stale-while-revalidate=86400'
      : 'public, max-age=31536000, immutable';
  res.setHeader('content-type', type);
  res.setHeader('cache-control', cache);
  res.setHeader('x-content-type-options', 'nosniff');
  if (COMPRESSIBLE.test(type) && buf.length > 512 && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
    res.setHeader('content-encoding', 'gzip');
    res.setHeader('vary', 'accept-encoding');
    res.writeHead(status);
    if (req.method === 'HEAD') return res.end();
    const gz = createGzip({ level: 9 });
    gz.pipe(res);            // pipe() returns res — writing to its return value
    gz.end(buf);             // would bypass the compressor entirely
    return;
  }
  res.setHeader('content-length', buf.length);
  res.writeHead(status);
  if (req.method === 'HEAD') return res.end();
  res.end(buf);
}

const server = http.createServer(async (req, res) => {
  const urlPath = (req.url || '/').split('?')[0].split('#')[0] || '/';
  if (api && urlPath.startsWith('/api/')) {
    try {
      return await handleApi(req, res);
    } catch (e) {
      res.writeHead(500, { 'content-type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ error: 'API_FAILED', message: String(e && e.message) }));
    }
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { allow: 'GET, HEAD', 'content-type': 'text/plain; charset=utf-8' });
    return res.end('405 — read only preview');
  }
  try {
    const file = await resolve(urlPath);
    if (file) return await send(res, req, file);
    // directory URL without a trailing slash → redirect, like Vercel's cleanUrls
    if (!urlPath.endsWith('/') && (await resolve(urlPath + '/'))) {
      res.writeHead(308, { location: urlPath + '/' });
      return res.end();
    }
    const notFound = await resolve('/404.html');
    if (notFound) return await send(res, req, notFound, 404);
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('404 — not found');
  } catch (e) {
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('500 — ' + (e && e.message ? e.message : 'server error'));
  }
});

function startServer(port) {
  server.listen(port, '0.0.0.0', () => {
    console.log(`preview server on http://0.0.0.0:${port}  →  ${ROOT}`);
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const nextPort = (err.port || PORT) + 1;
    console.warn(`[preview] Port ${err.port || PORT} is already in use. Trying port ${nextPort}...`);
    startServer(nextPort);
  } else {
    console.error('[preview] Server error:', err);
    process.exit(1);
  }
});

startServer(PORT);
