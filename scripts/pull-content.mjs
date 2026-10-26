/**
 * scripts/pull-content.mjs — snapshot the live Neon content into _src/content/live.json
 *
 * Why this exists
 * ---------------
 * `_src/content/site.json` is the seed/structure. This script snapshots the approved
 * capacity, programme counts, active batch labels/schedules/fees/seat fills and related
 * settings from Neon into `_src/content/live.json`. `_src/build.py` overlays that full
 * snapshot before rendering the HTML baseline, table, visible FAQ and JSON-LD.
 *
 * Failure policy: if DATABASE_URL is missing, capacity is not 15, required programme
 * counts are invalid, there are no active batches, or Neon is unreachable, the script
 * exits nonzero WITHOUT changing live.json. npm run build then stops; an older snapshot
 * remains recoverable but must not be represented as a successful fresh pull.
 *
 *   node scripts/pull-content.mjs          # npm run content:pull
 *   npm run build                          # pull + build in one step
 */
import { writeFileSync, renameSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from '../lib/env.js';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = path.join(ROOT, '_src/content/live.json');
const TMP = OUT + '.' + process.pid + '.tmp';

loadEnv();

function bail(msg) {
  console.error('[content:pull] ABORTED — ' + msg + ' · live.json unchanged');
  process.exit(1);
}

if (!process.env.DATABASE_URL) bail('DATABASE_URL is not set');

let rows, settings, updatedAt;
try {
  const { neon } = await import('@neondatabase/serverless');
  const sql = neon(process.env.DATABASE_URL);
  rows = await sql`
    select id, name_bn, code, classes_bn, days_bn, time_bn, fee, filled,
           hot, wa_text, sort_order
    from batches
    where active = true
    order by sort_order asc, id`;
  const s = await sql`select key, value, updated_at from settings`;
  settings = Object.fromEntries(s.map((r) => [r.key, r.value]));
  updatedAt = s.reduce((a, r) => (r.updated_at > a ? r.updated_at : a), '');
} catch (e) {
  bail('Neon unreachable (' + (e && e.message ? e.message : e) + ')');
}

const capacity = settings.capacity ? Number(settings.capacity.per_batch) : null;
const programme = settings.programme || null;
const team = settings.team || null;
if (capacity !== 15) bail('owner-approved capacity must be 15 (database returned ' + capacity + ')');
if (!team || team.founded_year !== 2022) bail('owner-corrected founding year must be 2022 (database returned ' + (team?.founded_year ?? 'missing') + ')');
if (!programme ||
    typeof programme.classes_per_month !== 'number' || !Number.isInteger(programme.classes_per_month) || programme.classes_per_month <= 0 ||
    typeof programme.mock_per_month !== 'number' || !Number.isInteger(programme.mock_per_month) || programme.mock_per_month <= 0) {
  bail('programme must include positive numeric classes_per_month and mock_per_month');
}
if (!Array.isArray(rows) || rows.length === 0) bail('no active batches found');
const badRow = rows.find((r) =>
  !r || typeof r.id !== 'string' || !r.id ||
  typeof r.name_bn !== 'string' || !r.name_bn || typeof r.code !== 'string' || !r.code ||
  typeof r.classes_bn !== 'string' || !r.classes_bn || typeof r.days_bn !== 'string' || !r.days_bn ||
  typeof r.time_bn !== 'string' || !r.time_bn || typeof r.hot !== 'boolean' ||
  !Number.isInteger(Number(r.sort_order)) ||
  !Number.isInteger(Number(r.fee)) || Number(r.fee) <= 0 ||
  !Number.isInteger(Number(r.filled)) || Number(r.filled) < 0 || Number(r.filled) > capacity ||
  typeof r.wa_text !== 'string' || !r.wa_text);
if (badRow) bail('active batch data is incomplete or contains invalid fee/filled values');

const snapshot = {
  generatedAt: new Date().toISOString(),
  dbUpdatedAt: updatedAt || null,
  capacity,
  foundedYear: team.founded_year,
  nextBatch: settings.next_batch || null,
  pricing: settings.pricing || null,
  programme,
  batches: rows.map((r) => ({
    id: r.id,
    name_bn: r.name_bn,
    code: r.code,
    classes_bn: r.classes_bn,
    days_bn: r.days_bn,
    time_bn: r.time_bn,
    fee: Number(r.fee),
    filled: Number(r.filled),
    hot: Boolean(r.hot),
    wa_text: r.wa_text,
    sort_order: Number(r.sort_order),
  })),
};

try {
  writeFileSync(TMP, JSON.stringify(snapshot, null, 2) + '\n', 'utf8');
  renameSync(TMP, OUT); // old snapshot is replaced only after full validation + complete write
} catch (e) {
  try { rmSync(TMP, { force: true }); } catch {}
  throw e;
}
const totalLeft = snapshot.batches.reduce(
  (n, b) => n + Math.max(0, (snapshot.capacity || 0) - b.filled), 0);
console.log('[content:pull] capacity ' + snapshot.capacity +
            ' · ' + snapshot.batches.length + ' batches · seatsLeft ' + totalLeft +
            ' → _src/content/live.json');
