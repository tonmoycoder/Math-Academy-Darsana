/**
 * tests/api.test.mjs — proves the endpoint contract without a database.
 * Run: MA_FAKE_DB=1 node tests/api.test.mjs   (npm run test:api does this)
 */
process.env.MA_FAKE_DB = '1';
process.env.NODE_ENV = 'test';
process.env.ADMIN_TOKEN = 'test-token-1234567890';

const { default: handler } = await import('../api/content.js');
const { shape } = await import('../lib/db.js');

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; console.log('  ✓', name); }
  else { fail++; console.log('  ✗', name, extra); }
};

const req = (url, init) => handler.fetch(new Request('https://x.test' + url, init));

console.log('\nGET /api/content');
const r1 = await req('/api/content');
const d1 = await r1.json();
ok('200', r1.status === 200);
ok('cache header', r1.headers.get('cache-control').includes('s-maxage=60'), r1.headers.get('cache-control'));
ok('3 batches', d1.batches.length === 3, d1.batches.length);
ok('capacity 15', d1.capacity === 15, d1.capacity);
ok('seatsLeft is a number', typeof d1.seatsLeft === 'number', d1.seatsLeft);
ok('every batch shaped', d1.batches.every(b => b.cap === 15 && typeof b.left === 'number' && typeof b.pct === 'number'));
ok('no booking/PII table exposed', !('bookings' in d1) && !('bookings' in d1.settings));
ok('programme counts are present and numeric', Number.isInteger(d1.settings.programme?.classes_per_month) && Number.isInteger(d1.settings.programme?.mock_per_month));

console.log('\nSnapshot/data-shape guards');
const settingsRows = Object.entries(d1.settings).map(([key, value]) => ({ key, value }));
const throws = (fn) => { try { fn(); return false; } catch { return true; } };
ok('reject empty active batch rows', throws(() => shape(settingsRows, [])));
ok('reject legacy capacity 20', throws(() => shape([{ key: 'capacity', value: { per_batch: 20 } }, ...settingsRows.filter(x => x.key !== 'capacity')], d1.batches)));
ok('reject any capacity other than 15', throws(() => shape([{ key: 'capacity', value: { per_batch: 14 } }, ...settingsRows.filter(x => x.key !== 'capacity')], d1.batches)));
ok('reject historical founding year 2020', throws(() => shape(settingsRows.map(x => x.key === 'team' ? { ...x, value: { ...x.value, founded_year: 2020 } } : x), d1.batches)));
const legacyOverflow = shape(settingsRows, d1.batches.map((b, i) => i === 0 ? { ...b, filled: 99 } : b));
ok('legacy over-cap fills never render above 15', legacyOverflow.batches.every(b => b.filled <= 15 && b.cap === 15));
ok('reject missing programme counts', throws(() => shape(settingsRows.filter(x => x.key !== 'programme'), d1.batches)));
ok('reject non-numeric programme counts', throws(() => shape(settingsRows.map(x => x.key === 'programme' ? { ...x, value: { ...x.value, classes_per_month: '12' } } : x), d1.batches)));

console.log('\nGET /api/content?health=1');
const r2 = await req('/api/content?health=1');
ok('200 + ok:true', r2.status === 200 && (await r2.json()).ok === true);
ok('no-store', r2.headers.get('cache-control') === 'no-store');

console.log('\nPOST without token');
const r3 = await req('/api/content', { method: 'POST', body: '{}' });
ok('401', r3.status === 401);

console.log('\nPOST with wrong token');
const r4 = await req('/api/content', { method: 'POST', headers: { authorization: 'Bearer nope' }, body: '{}' });
ok('401', r4.status === 401);

console.log('\nPOST with token, valid batch patch');
const r5 = await req('/api/content', {
  method: 'POST',
  headers: { authorization: 'Bearer test-token-1234567890', 'content-type': 'application/json' },
  body: JSON.stringify({ batch: { id: 'ssc', patch: { filled: 15 } } }),
});
ok('200', r5.status === 200, r5.status);
ok('no-store on write', r5.headers.get('cache-control') === 'no-store');
const r5b = await req('/api/content', {
  method: 'POST',
  headers: { authorization: 'Bearer test-token-1234567890', 'content-type': 'application/json' },
  body: JSON.stringify({ batch: { id: 'ssc', patch: { filled: 16 } } }),
});
ok('reject filled count above 15', r5b.status === 400, r5b.status);

console.log('\nPOST with token, invalid payload');
const r6 = await req('/api/content', {
  method: 'POST',
  headers: { authorization: 'Bearer test-token-1234567890' },
  body: JSON.stringify({ nothing: true }),
});
ok('400', r6.status === 400);

console.log('\nCapacity policy');
const rCap = await req('/api/content', {
  method: 'POST',
  headers: { authorization: 'Bearer test-token-1234567890', 'content-type': 'application/json' },
  body: JSON.stringify({ setting: { key: 'capacity', value: { per_batch: 20 } } }),
});
ok('reject legacy capacity 20', rCap.status === 400, rCap.status);
const rYear = await req('/api/content', {
  method: 'POST',
  headers: { authorization: 'Bearer test-token-1234567890', 'content-type': 'application/json' },
  body: JSON.stringify({ setting: { key: 'team', value: { founded_year: 2020 } } }),
});
ok('reject historical founding year 2020', rYear.status === 400, rYear.status);
const rProgramme = await req('/api/content', {
  method: 'POST',
  headers: { authorization: 'Bearer test-token-1234567890', 'content-type': 'application/json' },
  body: JSON.stringify({ setting: { key: 'programme', value: { classes_per_month: 12, mock_per_month: null } } }),
});
ok('reject invalid programme counts', rProgramme.status === 400, rProgramme.status);
const rOverride = await req('/api/content', {
  method: 'POST',
  headers: { authorization: 'Bearer test-token-1234567890', 'content-type': 'application/json' },
  body: JSON.stringify({ batch: { id: 'ssc', patch: { cap_override: 12 } } }),
});
ok('reject per-batch capacity override', rOverride.status === 400, rOverride.status);

console.log('\nmethod not allowed');
const r7 = await req('/api/content', { method: 'DELETE' });
ok('405', r7.status === 405);

console.log('\nOPTIONS');
const r8 = await req('/api/content', { method: 'OPTIONS' });
ok('204 + Allow', r8.status === 204 && r8.headers.get('allow').includes('POST'));

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
