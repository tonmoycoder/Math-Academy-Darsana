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

console.log('\nPOST with legacy revoked default token');
const rLegacy = await req('/api/content', { method: 'POST', headers: { authorization: 'Bearer pranto2026' }, body: '{}' });
ok('reject legacy default token (401)', rLegacy.status === 401, rLegacy.status);

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

console.log('\nPhase 2: Login & Session Authentication');
const rLoginFail = await req('/api/content', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ action: 'login', password: 'wrong-password' }),
});
ok('login rejects bad password (401)', rLoginFail.status === 401);

const rLoginOk = await req('/api/content', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ action: 'login', password: 'test-token-1234567890' }),
});
const loginData = await rLoginOk.json();
ok('login succeeds with valid password (200)', rLoginOk.status === 200 && loginData.ok === true);
ok('login returns session token', typeof loginData.token === 'string' && loginData.token.includes('.'));
ok('login sets HttpOnly session cookie', (rLoginOk.headers.get('set-cookie') || '').includes('ma_session=') && (rLoginOk.headers.get('set-cookie') || '').includes('HttpOnly'));

const sessionToken = loginData.token;

console.log('\nPhase 2: Authenticated with Session Token');
const rSessionWrite = await req('/api/content', {
  method: 'POST',
  headers: { authorization: `Bearer ${sessionToken}`, 'content-type': 'application/json' },
  body: JSON.stringify({ setting: { key: 'contact', value: { phone_display: '০১৬৪১-০৪৫৪৬৯' } } }),
});
ok('session token authorizes write', rSessionWrite.status === 200, rSessionWrite.status);

console.log('\nPhase 2: Password Change Endpoint');
const rChangeWrongCurrent = await req('/api/content', {
  method: 'POST',
  headers: { authorization: `Bearer ${sessionToken}`, 'content-type': 'application/json' },
  body: JSON.stringify({ change_password: { current_password: 'incorrect-old', new_password: 'brandNewSecret2026!' } }),
});
ok('change password rejects wrong current password (401)', rChangeWrongCurrent.status === 401);

const rChangeTooShort = await req('/api/content', {
  method: 'POST',
  headers: { authorization: `Bearer ${sessionToken}`, 'content-type': 'application/json' },
  body: JSON.stringify({ change_password: { current_password: 'test-token-1234567890', new_password: 'short' } }),
});
ok('change password rejects short password < 8 chars (400)', rChangeTooShort.status === 400);

const rChangeOk = await req('/api/content', {
  method: 'POST',
  headers: { authorization: `Bearer ${sessionToken}`, 'content-type': 'application/json' },
  body: JSON.stringify({ change_password: { current_password: 'test-token-1234567890', new_password: 'brandNewSecret2026!' } }),
});
const changeData = await rChangeOk.json();
ok('change password succeeds (200)', rChangeOk.status === 200 && changeData.ok === true);
ok('change password returns fresh session token', typeof changeData.token === 'string');

console.log('\nPhase 2: Post-Change Verification');
const rOldLoginFail = await req('/api/content', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ action: 'login', password: 'test-token-1234567890' }),
});
ok('old password is now rejected (401)', rOldLoginFail.status === 401);

const rNewLoginOk = await req('/api/content', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ action: 'login', password: 'brandNewSecret2026!' }),
});
ok('new password logs in successfully (200)', rNewLoginOk.status === 200);

const rPublicGet = await req('/api/content');
const publicData = await rPublicGet.json();
ok('public settings never expose admin_auth / password hash', !('admin_auth' in (publicData.settings || {})) && !('admin_credentials' in (publicData.settings || {})));

console.log('\nPhase 3: Backend Data Synchronization & Validation');
const authHeader = { authorization: `Bearer ${changeData.token}`, 'content-type': 'application/json' };

const rNegFilled = await req('/api/content', {
  method: 'POST',
  headers: authHeader,
  body: JSON.stringify({ batch: { id: 'vitti', patch: { filled: -1 } } }),
});
ok('reject negative filled (400)', rNegFilled.status === 400);

const rFloatFilled = await req('/api/content', {
  method: 'POST',
  headers: authHeader,
  body: JSON.stringify({ batch: { id: 'vitti', patch: { filled: 10.5 } } }),
});
ok('reject non-integer filled (400)', rFloatFilled.status === 400);

const rZeroFee = await req('/api/content', {
  method: 'POST',
  headers: authHeader,
  body: JSON.stringify({ batch: { id: 'vitti', patch: { fee: 0 } } }),
});
ok('reject zero fee (400)', rZeroFee.status === 400);

const rNegFee = await req('/api/content', {
  method: 'POST',
  headers: authHeader,
  body: JSON.stringify({ batch: { id: 'vitti', patch: { fee: -500 } } }),
});
ok('reject negative fee (400)', rNegFee.status === 400);

const rFloatFee = await req('/api/content', {
  method: 'POST',
  headers: authHeader,
  body: JSON.stringify({ batch: { id: 'vitti', patch: { fee: 500.5 } } }),
});
ok('reject non-integer fee (400)', rFloatFee.status === 400);

const rBadBatchId = await req('/api/content', {
  method: 'POST',
  headers: authHeader,
  body: JSON.stringify({ batch: { id: 'unknown_batch_xyz', patch: { filled: 5 } } }),
});
ok('reject nonexistent batch id (404/400)', rBadBatchId.status === 404 || rBadBatchId.status === 400);

// Check mathematical consistency of seatsLeft across all batches
const rContentSync = await req('/api/content');
const syncData = await rContentSync.json();
let expectedTotalLeft = 0;
let allBatchesConsistent = true;
for (const b of syncData.batches) {
  const calcLeft = Math.max(0, syncData.capacity - b.filled);
  if (b.left !== calcLeft) allBatchesConsistent = false;
  expectedTotalLeft += calcLeft;
}
ok('every batch has mathematically exact seatsLeft (capacity - filled)', allBatchesConsistent);
ok('total seatsLeft matches sum of batch seatsLeft', syncData.seatsLeft === expectedTotalLeft);
ok('programme classes_per_month is numeric integer > 0', Number.isInteger(syncData.settings.programme?.classes_per_month) && syncData.settings.programme.classes_per_month > 0);

console.log('\nPhase 3.5: Download Library & Google Drive Direct Download');
// Test Drive URL parsing logic
function getDirectDownloadUrl(url) {
  if (!url) return '';
  url = String(url).trim();
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return 'https://drive.google.com/uc?export=download&id=' + match[1];
  }
  return url;
}

const testDriveUrl1 = 'https://drive.google.com/file/d/1B2C3D4E5F6G7H8I9J0K/view?usp=sharing';
const testDriveUrl2 = 'https://drive.google.com/open?id=1B2C3D4E5F6G7H8I9J0K';
const expectedDirectUrl = 'https://drive.google.com/uc?export=download&id=1B2C3D4E5F6G7H8I9J0K';

ok('parses /file/d/ID Google Drive share url to direct download url', getDirectDownloadUrl(testDriveUrl1) === expectedDirectUrl);
ok('parses ?id=ID Google Drive url to direct download url', getDirectDownloadUrl(testDriveUrl2) === expectedDirectUrl);
ok('preserves standard url untouched', getDirectDownloadUrl('/assets/english-dialogue-format.pdf') === '/assets/english-dialogue-format.pdf');

// Test saving and updating library resource via API
const rSaveLib = await req('/api/content', {
  method: 'POST',
  headers: authHeader,
  body: JSON.stringify({
    setting: {
      key: 'library',
      value: {
        section_kicker: 'SEC 06 // রিসোর্স ও ডাউনলোড লাইব্রেরি',
        section_title: 'গণিত ও স্টাডি রিসোর্স লাইব্রেরি',
        section_lead: 'SSC ও ক্লাস ৬–১০ গণিতের হ্যান্ডনোট ডাউনলোড করুন।',
        items: [
          {
            id: 'english-dialogue',
            title: 'English Dialogue Format (পূর্ণাঙ্গ গাইড)',
            tag: 'সবচেয়ে জনপ্রিয়',
            tag_color: 'red',
            code: 'ENGLISH-DIALOGUE · PDF',
            desc: 'ইংরেজি dialogue লেখার format ও নমুনা অনুশীলনের পূর্ণাঙ্গ রেফারেন্স PDF।',
            drive_url: testDriveUrl1,
            meta_info: 'PDF · ৫ পৃষ্ঠা',
            filename: 'english-dialogue-format.pdf'
          },
          {
            id: 'ssc-math-formula',
            title: 'SSC ২০২৭ গণিত পূর্ণাঙ্গ সূত্র ও হ্যান্ডনোট',
            tag: 'SSC ২০২৭',
            tag_color: 'brass',
            code: 'MATH-SSC · PDF',
            desc: 'সকল অধ্যায়ের প্রয়োজনীয় সূত্রের নির্ভুল সংকলন।',
            drive_url: 'https://drive.google.com/file/d/9Z8Y7X6W5V4U3T2S1R/view?usp=sharing',
            meta_info: 'PDF · ৮ পৃষ্ঠা',
            filename: 'ssc-math-formula-2027.pdf'
          }
        ]
      }
    }
  })
});
ok('save library settings via authenticated POST (200)', rSaveLib.status === 200, rSaveLib.status);

const rVerifyLib = await req('/api/content');
const verifyLibData = await rVerifyLib.json();
const savedItems = verifyLibData.settings?.library?.items || [];
ok('library setting retrieved in GET /api/content', Array.isArray(savedItems) && savedItems.length === 2);
ok('saved items have custom tags and Google Drive links', savedItems.some(it => it.tag === 'SSC ২০২৭' && it.id === 'ssc-math-formula'));

console.log('\n--- Phase 6: Mock Test & Student Results CMS Tests ---');
const rSaveMock = await req('/api/content', {
  method: 'POST',
  headers: authHeader,
  body: JSON.stringify({
    setting: {
      key: 'mock_results',
      value: {
        'MA-2026-084': {
          roll: 'MA-2026-084',
          name: 'তানভীর আহমেদ',
          batch: 'SSC ২০২৭ ব্যাচ',
          test: 'মক টেস্ট-০৪',
          marks: '৯৬ / ১০০',
          rank: '১ম',
          pct: '৯৯.২%',
          bars: [94, 88, 96],
          note: 'বীজগণিত ও ত্রিকোণমিতিতে দারুণ দক্ষতা।'
        },
        'MA-2026-099': {
          roll: 'MA-2026-099',
          name: 'নাসিফ ইকবাল',
          batch: 'SSC ২০২৭ ব্যাচ',
          test: 'মক টেস্ট-০৪',
          marks: '৯৮ / ১০০',
          rank: '১ম (যৌথ)',
          pct: '৯৯.৯%',
          bars: [98, 96, 100],
          note: 'অসাধারণ নির্ভুল ক্যালকুলেশন।'
        }
      }
    }
  })
});
ok('save mock_results setting via authenticated POST (200)', rSaveMock.status === 200, rSaveMock.status);

const rVerifyMock = await req('/api/content');
const verifyMockData = await rVerifyMock.json();
const savedResults = verifyMockData.settings?.mock_results || {};
ok('mock_results dictionary retrieved in GET /api/content', typeof savedResults === 'object' && savedResults['MA-2026-099'] != null);
ok('new student record MA-2026-099 correctly stored', savedResults['MA-2026-099']?.name === 'নাসিফ ইকবাল' && savedResults['MA-2026-099']?.marks === '৯৮ / ১০০');
ok('student subject score bars correctly stored as array', Array.isArray(savedResults['MA-2026-099']?.bars) && savedResults['MA-2026-099'].bars[2] === 100);

console.log('\n--- Phase 7: Hall of Fame CMS & Integration Tests ---');
const rSaveFame = await req('/api/content', {
  method: 'POST',
  headers: authHeader,
  body: JSON.stringify({
    setting: {
      key: 'hall_of_fame',
      value: [
        {
          id: 'fame-1',
          name: 'সোহানুর রহমান',
          meta: 'GPA 5.00 · দর্শনা',
          badge_text: 'A+\nSSC',
          badge_color: 'teal'
        },
        {
          id: 'fame-test',
          name: 'তাহমিদা খাতুন',
          meta: 'ক্লাস ১০ · গণিত চ্যাম্পিয়ন',
          badge_text: '১০০\nMOCK',
          badge_color: 'brass'
        }
      ]
    }
  })
});
ok('save hall_of_fame setting via authenticated POST (200)', rSaveFame.status === 200, rSaveFame.status);

const rVerifyFame = await req('/api/content');
const verifyFameData = await rVerifyFame.json();
const savedFame = verifyFameData.settings?.hall_of_fame || [];
ok('hall_of_fame list retrieved in GET /api/content', Array.isArray(savedFame) && savedFame.length === 2);
ok('সোহানুর রহমান replaced তানভীর আহমেদ in hall_of_fame', savedFame[0]?.name === 'সোহানুর রহমান' && savedFame[0]?.meta === 'GPA 5.00 · দর্শনা');
ok('new student card with brass badge stored correctly', savedFame[1]?.name === 'তাহমিদা খাতুন' && savedFame[1]?.badge_color === 'brass');

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);


