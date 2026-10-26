#!/usr/bin/env bash
# ---------------------------------------------------------------------------
#  One-shot Neon setup for ম্যাথ একাডেমি.
#  Needs NEON_API_KEY (neon.tech → Account settings → API keys).
#
#    NEON_API_KEY=napi_xxx bash scripts/neon-bootstrap.sh
#
#  Steps: link check → deploy (provisions from neon.ts, pulls env) → migrate → seed → health check.
# ---------------------------------------------------------------------------
set -euo pipefail
cd "$(dirname "$0")/.."

: "${NEON_API_KEY:?set NEON_API_KEY first}"

echo "1/5  project link"
cat .neon

echo "2/5  neon deploy"
NEON_API_KEY="$NEON_API_KEY" npx -y neon@latest deploy -y --env-pull

echo "3/5  load DATABASE_URL"
node -e "import('./lib/env.js').then(m=>{m.loadEnv(); if(!process.env.DATABASE_URL){console.error('no DATABASE_URL after deploy');process.exit(1)}; console.log('  DATABASE_URL length', process.env.DATABASE_URL.length)})"

echo "4/5  schema + seed"
node db/migrate.mjs
node db/seed.mjs

echo "5/5  health check"
node -e "
import('./lib/env.js').then(async (m)=>{
  m.loadEnv();
  const { neon } = await import('@neondatabase/serverless');
  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql\`select count(*)::int as n from batches\`;
  console.log('  batches in Neon:', rows[0].n);
})"

echo "done — set DATABASE_URL and ADMIN_TOKEN in Vercel, then deploy."
