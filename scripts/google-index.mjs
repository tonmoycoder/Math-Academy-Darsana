import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from '../lib/env.js';
import { notifyUrl, getUrlStatus, notifyBatchUrls } from '../lib/google-indexing.js';

loadEnv();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

const DEFAULT_URL = 'https://mathacademydarsana.vercel.app/';

function parseSitemapUrls() {
  const sitemapPath = path.join(ROOT_DIR, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    return [DEFAULT_URL];
  }
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  const urls = [];
  const regex = /<loc>(https?:\/\/[^<]+)<\/loc>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    urls.push(match[1]);
  }
  return urls.length > 0 ? urls : [DEFAULT_URL];
}

async function main() {
  const args = process.argv.slice(2);
  console.log('\n=========================================');
  console.log('   Google Indexing API Push Utility');
  console.log('=========================================\n');

  if (args.includes('--status')) {
    const targetUrl = args.find(a => a.startsWith('http')) || DEFAULT_URL;
    console.log(`Checking status for: ${targetUrl} ...`);
    try {
      const status = await getUrlStatus(targetUrl);
      console.log('Latest notification metadata:');
      console.dir(status, { depth: null, colors: true });
    } catch (err) {
      console.error('Failed to get status:', err.message);
      if (err.code === 403 || err.status === 403) {
        console.error('\n[NOTE] Ensure service account email is added as an OWNER in Google Search Console:');
        console.error('Service Account: math-academy-darsana@fair-smile-513018-n1.iam.gserviceaccount.com\n');
      }
    }
    return;
  }

  const pushAll = args.includes('--all');
  const customUrl = args.find(a => a.startsWith('http'));

  let targetUrls = [];
  if (customUrl) {
    targetUrls = [customUrl];
  } else if (pushAll) {
    targetUrls = parseSitemapUrls();
  } else {
    // Default: prioritize homepage and blog index
    targetUrls = [
      'https://mathacademydarsana.vercel.app/',
      'https://mathacademydarsana.vercel.app/blog/'
    ];
  }

  console.log(`Target URLs to index (${targetUrls.length}):`);
  targetUrls.forEach(u => console.log(` - ${u}`));
  console.log('\nPublishing URL_UPDATED requests to Google Indexing API...\n');

  for (const url of targetUrls) {
    try {
      const res = await notifyUrl(url, 'URL_UPDATED');
      console.log(`[SUCCESS] ${url}`);
      console.log(`          Notification Time: ${res.urlNotificationMetadata?.latestUpdate?.notifyTime || 'OK'}`);
    } catch (err) {
      console.error(`[FAILED]  ${url}`);
      console.error(`          Error: ${err.message}`);
      if (err.code === 403 || err.status === 403) {
        console.error('\n>>> CRITICAL ACTION REQUIRED IN GOOGLE SEARCH CONSOLE <<<');
        console.error('The service account is NOT yet an OWNER of this property in Google Search Console.');
        console.error('Go to: Google Search Console -> Settings -> Users and permissions -> Add user');
        console.error('Email: math-academy-darsana@fair-smile-513018-n1.iam.gserviceaccount.com');
        console.error('Permission: Owner\n');
        break; // Stop further calls if permission is missing
      }
    }
  }

  console.log('\nIndexing request job completed.\n');
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});

