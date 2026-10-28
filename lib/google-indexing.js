import { google } from 'googleapis';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

const INDEXING_SCOPES = ['https://www.googleapis.com/auth/indexing'];

/**
 * Resolves credentials from environment variables or local service-account.json file.
 */
export function getServiceAccountCredentials() {
  // Option 1: Full JSON string in environment variable (Ideal for Vercel)
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    } catch (e) {
      console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON environment variable:', e.message);
    }
  }

  // Option 2: Split Email and Private Key in environment variables
  if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    return {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }

  // Option 3: Local file (service-account.json)
  const localKeyPath = path.join(ROOT_DIR, 'service-account.json');
  if (fs.existsSync(localKeyPath)) {
    try {
      return JSON.parse(fs.readFileSync(localKeyPath, 'utf8'));
    } catch (e) {
      console.error('Failed to read service-account.json:', e.message);
    }
  }

  throw new Error(
    'Google Service Account credentials not found! Set GOOGLE_SERVICE_ACCOUNT_JSON (or GOOGLE_CLIENT_EMAIL & GOOGLE_PRIVATE_KEY), or place service-account.json in project root.'
  );
}

/**
 * Creates authenticated Google Indexing API client
 */
export async function getGoogleIndexingClient() {
  const credentials = getServiceAccountCredentials();

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: INDEXING_SCOPES,
  });

  const authClient = await auth.getClient();
  return google.indexing({
    version: 'v3',
    auth: authClient,
  });
}

/**
 * Notify Google of a URL update or deletion.
 * @param {string} url - Absolute URL (e.g., https://mathacademydarsana.vercel.app/)
 * @param {'URL_UPDATED' | 'URL_DELETED'} type - Notification type
 */
export async function notifyUrl(url, type = 'URL_UPDATED') {
  const indexing = await getGoogleIndexingClient();
  const res = await indexing.urlNotifications.publish({
    requestBody: {
      url,
      type,
    },
  });
  return res.data;
}

/**
 * Check the latest indexing notification status for a URL
 * @param {string} url 
 */
export async function getUrlStatus(url) {
  const indexing = await getGoogleIndexingClient();
  const res = await indexing.urlNotifications.getMetadata({
    url,
  });
  return res.data;
}

/**
 * Notify Google of multiple URLs with sequential throttling
 * @param {string[]} urls 
 * @param {'URL_UPDATED' | 'URL_DELETED'} type 
 */
export async function notifyBatchUrls(urls, type = 'URL_UPDATED') {
  const results = [];
  for (const url of urls) {
    try {
      const data = await notifyUrl(url, type);
      results.push({ url, success: true, data });
      // Throttling: Google Indexing API allows up to 200 requests/day by default
      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      results.push({ url, success: false, error: err.message, status: err.status || err.code });
    }
  }
  return results;
}

