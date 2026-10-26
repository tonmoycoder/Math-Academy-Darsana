/**
 * db/migrate.mjs — apply db/schema.sql over the Neon HTTP driver.
 * One statement per request, split on the `-- @@ split` marker (never on ';',
 * which would break the plpgsql function body).
 *
 *   DATABASE_URL=... node db/migrate.mjs
 */
import { readFileSync } from 'node:fs';
import { loadEnv } from '../lib/env.js';

loadEnv();

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set (checked the environment, .env.local, .env)');
  process.exit(1);
}

const { neon } = await import('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

const file = new URL('./schema.sql', import.meta.url);
const parts = readFileSync(file, 'utf8')
  .split(/^-- @@ split\s*$/m)
  .map((s) => s.trim())
  .filter((s) => s && !/^--\s*=+$/.test(s) && !s.startsWith('-- ===='));

let ok = 0;
for (const [i, stmt] of parts.entries()) {
  const label = stmt.split('\n').find((l) => l.trim() && !l.trim().startsWith('--'))?.slice(0, 64) || 'statement';
  try {
    await sql.query(stmt);
    ok++;
    console.log(`  ✓ ${String(i + 1).padStart(2)} ${label}`);
  } catch (e) {
    console.error(`  ✗ ${String(i + 1).padStart(2)} ${label}\n    ${e.message}`);
    process.exit(1);
  }
}
console.log(`\nmigrated ${ok}/${parts.length} statements`);
