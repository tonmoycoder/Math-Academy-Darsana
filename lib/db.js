/**
 * lib/db.js — the only place that talks to Postgres.
 *
 * Deliberately small: one tagged-template SQL helper, one read query, two writes.
 * No ORM, no pool (Neon's HTTP driver), no migrations framework — the schema is a
 * single SQL file that is safe to re-run.
 *
 * Local testing without a database: MA_FAKE_DB=1 loads db/fixture.json instead.
 * That flag is ignored when NODE_ENV === 'production', so it cannot leak.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const FAKE = process.env.MA_FAKE_DB === '1' && process.env.NODE_ENV !== 'production';
const APPROVED_CAPACITY = 15;
const APPROVED_FOUNDING_YEAR = 2022;

let _sql = null;

async function sql() {
  if (FAKE) return null;
  if (_sql) return _sql;
  const { neon } = await import('@neondatabase/serverless');
  if (!process.env.DATABASE_URL) {
    const e = new Error('DATABASE_URL is not set');
    e.code = 'NO_DB';
    throw e;
  }
  _sql = neon(process.env.DATABASE_URL, { fullResults: false, arrayMode: false });
  return _sql;
}

// ---------------------------------------------------------------- test fixture
function fixture() {
  const cfg = JSON.parse(readFileSync(path.join(ROOT, '_src/content/site.json'), 'utf8'));
  const cap = cfg.capacity.per_batch;
  // optional offset so a local run can prove the page really re-reads the API
  const shift = Number(process.env.MA_FAKE_SHIFT || 0);
  return {
    settings: {
      capacity: { per_batch: cap },
      next_batch: cfg.next_batch,
      contact: cfg.contact,
      programme: cfg.programme,
      pricing: cfg.pricing,
      team: cfg.team,
    },
    batches: cfg.batches.map((b, i) => ({
      id: b.id, name_bn: b.name_bn, code: b.code, classes_bn: b.classes_bn,
      days_bn: b.days_bn, time_bn: b.time_bn, fee: b.fee,
      filled: Math.min(cap, Math.max(0, b.filled + shift)),
      hot: !!b.hot, wa_text: b.wa_text, sort_order: i,
      active: true, updated_at: new Date().toISOString(),
    })),
  };
}

// ------------------------------------------------------------------- shaping
export function shape(settingsRows, batchRows) {
  const settings = {};
  for (const r of settingsRows) settings[r.key] = r.value;
  if (settings.capacity?.per_batch !== APPROVED_CAPACITY) {
    throw new Error(`configured batch capacity must be exactly ${APPROVED_CAPACITY}`);
  }
  const cap = APPROVED_CAPACITY;
  if (settings.team?.founded_year !== APPROVED_FOUNDING_YEAR) {
    throw new Error(`academy founding year must be ${APPROVED_FOUNDING_YEAR}`);
  }
  const programme = settings.programme;
  for (const key of ['classes_per_month', 'mock_per_month']) {
    if (!Number.isInteger(programme?.[key]) || programme[key] <= 0) {
      throw new Error(`programme.${key} must be a positive numeric integer`);
    }
  }
  if (!Array.isArray(batchRows) || batchRows.length === 0) {
    throw new Error('at least one active batch is required');
  }

  const batches = batchRows.map((b) => {
    const capB = cap;
    const rawFilled = Number(b.filled);
    if (!Number.isInteger(rawFilled) || rawFilled < 0) {
      throw new Error('batch filled must be a non-negative integer');
    }
    const filled = Math.min(rawFilled, capB);
    return {
      id: b.id,
      name_bn: b.name_bn,
      code: b.code,
      classes_bn: b.classes_bn,
      days_bn: b.days_bn,
      time_bn: b.time_bn,
      fee: b.fee,
      filled,
      cap: capB,
      left: capB - filled,
      pct: Math.round((filled / capB) * 100),
      hot: b.hot,
      wa_text: b.wa_text,
      active: b.active !== false,
    };
  });

  const seatsLeft = batches.filter((b) => b.active !== false).reduce((n, b) => n + b.left, 0);
  const newest = batchRows.reduce((d, b) => (b.updated_at > d ? b.updated_at : d), '');

  return {
    settings,
    batches,
    capacity: cap,
    seatsLeft,
    updatedAt: newest ? new Date(newest).toISOString() : null,
    source: 'database',
  };
}

// --------------------------------------------------------------------- reads
export async function readContent(options = {}) {
  const includeInactive = options && options.all === true;
  if (FAKE) {
    // read through shape() so the fixture exercises the real logic
    const f = fixture();
    const rows = f.batches.map((b) => ({ ...b }));
    return shape(Object.entries(f.settings).map(([key, value]) => ({ key, value })), rows);
  }
  const db = await sql();
  const batchQuery = includeInactive
    ? db`select id, name_bn, code, classes_bn, days_bn, time_bn, fee, filled,
                hot, wa_text, sort_order, active, updated_at
           from batches order by sort_order, id`
    : db`select id, name_bn, code, classes_bn, days_bn, time_bn, fee, filled,
                hot, wa_text, sort_order, active, updated_at
           from batches where active order by sort_order, id`;

  const [settings, batches] = await Promise.all([
    db`select key, value from settings`,
    batchQuery,
  ]);
  return shape(settings, batches);
}

// --------------------------------------------------------------------- writes
const BATCH_FIELDS = new Set([
  'name_bn', 'code', 'classes_bn', 'days_bn', 'time_bn',
  'fee', 'filled', 'hot', 'wa_text', 'sort_order', 'active',
]);

export async function updateBatch(id, patch) {
  if (!id || typeof id !== 'string') throw bad('batch id required');
  const keys = Object.keys(patch || {}).filter((k) => BATCH_FIELDS.has(k));
  if (!keys.length) throw bad('no updatable fields');

  const p = {
    name_bn: patch.name_bn ?? null,
    code: patch.code ?? null,
    classes_bn: patch.classes_bn ?? null,
    days_bn: patch.days_bn ?? null,
    time_bn: patch.time_bn ?? null,
    fee: patch.fee == null ? null : Number(patch.fee),
    filled: patch.filled == null ? null : Number(patch.filled),
    hot: patch.hot == null ? null : Boolean(patch.hot),
    wa_text: patch.wa_text ?? null,
    sort_order: patch.sort_order == null ? null : Number(patch.sort_order),
    active: patch.active == null ? null : Boolean(patch.active),
  };

  if (p.fee != null && !(p.fee > 0)) throw bad('fee must be > 0');
  if (p.filled != null && (!Number.isInteger(p.filled) || p.filled < 0 || p.filled > APPROVED_CAPACITY)) {
    throw bad(`filled must be an integer between 0 and ${APPROVED_CAPACITY}`);
  }

  if (FAKE) return { id, changed: keys };

  const db = await sql();
  // one static statement, every value parameterised — no string building from input
  const rows = await db`
    update batches set
      name_bn      = coalesce(${p.name_bn}, name_bn),
      code         = coalesce(${p.code}, code),
      classes_bn   = coalesce(${p.classes_bn}, classes_bn),
      days_bn      = coalesce(${p.days_bn}, days_bn),
      time_bn      = coalesce(${p.time_bn}, time_bn),
      fee          = coalesce(${p.fee}::int, fee),
      filled       = coalesce(${p.filled}::int, filled),
      hot          = coalesce(${p.hot}::boolean, hot),
      wa_text      = coalesce(${p.wa_text}, wa_text),
      sort_order   = coalesce(${p.sort_order}::int, sort_order),
      active       = coalesce(${p.active}::boolean, active),
      updated_at   = now()
    where id = ${id}
    returning id, filled, updated_at
  `;
  if (!rows.length) {
    const e = new Error('batch not found');
    e.status = 404;
    throw e;
  }
  return rows[0];
}

export async function updateSetting(key, value) {
  if (!key || typeof key !== 'string') throw bad('setting key required');
  if (value === undefined) throw bad('setting value required');
  // Capacity is an owner-approved invariant, not an admin-editable data field.
  // Change this policy deliberately in code only after the owner approves it.
  if (key === 'capacity' && (typeof value?.per_batch !== 'number' || value.per_batch !== APPROVED_CAPACITY)) {
    throw bad(`capacity must remain ${APPROVED_CAPACITY} per batch`);
  }
  if (key === 'team' && (typeof value?.founded_year !== 'number' || value.founded_year !== APPROVED_FOUNDING_YEAR)) {
    throw bad(`team.founded_year must remain ${APPROVED_FOUNDING_YEAR}`);
  }
  if (key === 'programme') {
    for (const field of ['classes_per_month', 'mock_per_month']) {
      if (!Number.isInteger(value?.[field]) || value[field] <= 0) {
        throw bad(`programme.${field} must be a positive numeric integer`);
      }
    }
  }
  if (FAKE) return { key };
  const db = await sql();
  const rows = await db`
    insert into settings (key, value) values (${key}, ${JSON.stringify(value)}::jsonb)
    on conflict (key) do update set value = excluded.value, updated_at = now()
    returning key, updated_at
  `;
  return rows[0];
}

function bad(msg) {
  const e = new Error(msg);
  e.status = 400;
  return e;
}
