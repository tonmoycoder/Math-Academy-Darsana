import { notifyUrl, notifyBatchUrls } from '../lib/google-indexing.js';

/**
 * Vercel Serverless Function: Trigger Google Indexing API
 * POST /api/index-url
 * Body: { "url": "https://mathacademydarsana.vercel.app/...", "type": "URL_UPDATED" }
 * Optional Header: Authorization: Bearer <ADMIN_TOKEN>
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Send POST request.' });
  }

  // Verify Admin Token if set
  const adminToken = process.env.ADMIN_TOKEN;
  if (adminToken) {
    const authHeader = req.headers['authorization'];
    if (authHeader !== `Bearer ${adminToken}`) {
      return res.status(401).json({ error: 'Unauthorized. Valid Bearer token required.' });
    }
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { url, urls, type = 'URL_UPDATED' } = body;

    if (urls && Array.isArray(urls)) {
      const results = await notifyBatchUrls(urls, type);
      return res.status(200).json({ ok: true, results });
    }

    const targetUrl = url || 'https://mathacademydarsana.vercel.app/';
    const result = await notifyUrl(targetUrl, type);
    return res.status(200).json({ ok: true, url: targetUrl, result });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}

