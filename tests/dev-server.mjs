/**
 * tests/dev-server.mjs — serves dist/ and /api/content on one port, exactly like
 * Vercel does in production (static first, one function behind /api).
 *
 *   MA_FAKE_DB=1 MA_FAKE_SHIFT=1 node tests/dev-server.mjs 8111
 *
 * With DATABASE_URL set and MA_FAKE_DB unset, it talks to the real Neon branch.
 */
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from '../lib/env.js';

/* local only: Vercel injects the real variables, a laptop needs .env.local */
loadEnv();

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.argv[2] || 8111);

const { default: api } = await import('../api/content.js');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml',
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.startsWith('/api/')) {
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
    const out = await api.fetch(request);
    res.writeHead(out.status, Object.fromEntries(out.headers));
    res.end(Buffer.from(await out.arrayBuffer()));
    return;
  }
  let file = path.join(DIST, decodeURIComponent(url.pathname));
  try {
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
  } catch {
    const alt = path.join(DIST, decodeURIComponent(url.pathname).replace(/\/$/, '') + '.html');
    try { await stat(alt); file = alt; } catch {
      res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
      res.end(await readFile(path.join(DIST, '404.html')).catch(() => 'not found'));
      return;
    }
  }
  try {
    const buf = await readFile(file);
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(buf);
  } catch {
    res.writeHead(404).end('not found');
  }
});

server.listen(PORT, '0.0.0.0', () => console.log('dev server on http://0.0.0.0:' + PORT));
