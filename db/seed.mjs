/**
 * db/seed.mjs — push _src/content/site.json into Neon.
 * Idempotent: running it twice changes nothing except updated_at.
 *
 *   DATABASE_URL=... node db/seed.mjs
 */
import { readFileSync } from 'node:fs';
import { loadEnv } from '../lib/env.js';

loadEnv();
const { neon } = await import('@neondatabase/serverless');

const cfg = JSON.parse(readFileSync(new URL('../_src/content/site.json', import.meta.url), 'utf8'));
const capPerBatch = Number(cfg.capacity?.per_batch);
if (capPerBatch !== 15) throw new Error('approved capacity must be exactly 15 students per batch');
if (cfg.team?.founded_year !== 2022) throw new Error('academy founding year must remain 2022');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Add it to .env.local or export it first.');
  process.exit(1);
}
const sql = neon(process.env.DATABASE_URL);

const settings = {
  capacity: { per_batch: cfg.capacity.per_batch },
  next_batch: cfg.next_batch,
  contact: cfg.contact,
  programme: cfg.programme,
  pricing: cfg.pricing,
  team: cfg.team,
};

for (const [key, value] of Object.entries(settings)) {
  await sql`
    insert into settings (key, value) values (${key}, ${JSON.stringify(value)}::jsonb)
    on conflict (key) do update set value = excluded.value, updated_at = now()`;
}

for (const [i, b] of cfg.batches.entries()) {
  const filled = Math.min(capPerBatch, Math.max(0, Math.trunc(Number(b.filled))));
  await sql`
    insert into batches (id, name_bn, code, classes_bn, days_bn, time_bn, fee, filled,
                         hot, wa_text, sort_order, active)
    values (${b.id}, ${b.name_bn}, ${b.code}, ${b.classes_bn}, ${b.days_bn}, ${b.time_bn},
            ${b.fee}, ${filled}, ${!!b.hot}, ${b.wa_text}, ${i}, ${true})
    on conflict (id) do update set
      name_bn = excluded.name_bn, code = excluded.code, classes_bn = excluded.classes_bn,
      days_bn = excluded.days_bn, time_bn = excluded.time_bn, fee = excluded.fee,
      filled = excluded.filled, hot = excluded.hot, wa_text = excluded.wa_text,
      sort_order = excluded.sort_order, updated_at = now()`;
}

const rows = await sql`select id, filled from batches order by sort_order`;
const cap = await sql`select value from settings where key = 'capacity'`;
console.log('seeded', rows.length, 'batches · capacity', cap[0]?.value?.per_batch);
