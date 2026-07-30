// The number pad in the active workout — the primary logging flow.
//
// Replaces a suite that drove `numpad-wheel-whole` and `numpad-wheel-reps`.
// Standard weight was split into tens + ones + ¼ columns so heavy loads are a
// quick spin rather than a long scroll, and the reps column is
// `numpad-wheel-int`, so the old suite failed on a null wheel every run.
//
//   node tests/numpad.js     (needs `python3 -m http.server 8199` at the repo root)
const { chromium } = require('/opt/node22/lib/node_modules/playwright/index.js');
const path = require('path');
const fs = require('fs');
const SS = process.env.FITFORGE_SHOTS || path.resolve(__dirname, '..', '.shots');
try { fs.mkdirSync(SS, { recursive: true }); } catch (_) {}

const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0;
const check = (label, ok, detail = '') => { if (!ok) fails++; console.log(`   ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`); };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const c = await b.newContext({ viewport: { width: 390, height: 900 }, serviceWorkers: 'block', hasTouch: true });
  const page = await c.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load|net::/.test(m.text())) errs.push('con: ' + m.text().slice(0, 200)); });

  const T = s => `[data-testid="${s}"]`;
  /** Pick a labelled item on a wheel. Clicking centres it and fires onChange —
      far steadier than driving scrollTop, which the old suite did. */
  const spin = async (id, label) => {
    const r = await page.evaluate(({ sel, want }) => {
      const w = document.querySelector(sel);
      if (!w) return { missing: true };
      const items = [...w.querySelectorAll('.wheel-item')];
      const hit = items.find(x => x.textContent.trim() === String(want));
      if (!hit) return { notFound: true, sample: items.slice(0, 5).map(x => x.textContent.trim()) };
      hit.click();
      return { ok: true };
    }, { sel: T(id), want: label });
    if (!r.ok) throw new Error(`${id}: cannot select "${label}" ${JSON.stringify(r)}`);
    await sleep(500);
  };

  await page.goto('http://localhost:8199/index.html', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.Storage && window.U);
  await page.evaluate(async () => {
    await Storage.clearAll();
    for (const [k, v] of Object.entries({ onboarded: true, sex: 'male', dob: '1995-04-12', heightCm: 180, activityLevel: 'moderate', kcalGoal: 2200, warmupPrompt: false,
      // This suite drives the classic set row, so it has to ask for it: guided
      // logging is the default and covers the workout screen with its own view.
      guidedSets: false })) await Storage.setPref(k, v);
    await Storage.saveBodyweight({ date: U.todayISO(), kg: 82 });
    const d = new Date(); d.setDate(d.getDate() - 3);
    // A previous session, so the pad has a "Last 80" chip to offer.
    await Storage.saveWorkout({
      id: 'wlast', name: 'Push', date: U.todayISO(d), startedAt: Date.now() - 3 * 864e5, completedAt: Date.now() - 3 * 864e5 + 1e6,
      exercises: [{ exerciseId: 'bench-press-barbell', name: 'Barbell Bench Press', type: 'weighted', sets: [{ weight: 80, reps: 8, done: true }] }]
    });
    await Storage.saveWorkout({
      id: 'aw', name: 'Push A', date: U.todayISO(), startedAt: Date.now(),
      exercises: [{ exerciseId: 'bench-press-barbell', name: 'Barbell Bench Press', type: 'weighted',
        sets: [{ weight: null, reps: null, done: false }] }], notes: ''
    });
    await Storage.setPref('activeWorkoutId', 'aw');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(3600);
  await page.evaluate(() => {
    const r = document.querySelector('[data-testid="button-resume-workout"]');
    if (r) r.click(); else document.querySelector('[data-testid="dock-fab"]').click();
  });
  await page.waitForTimeout(1200);
  await page.waitForSelector(T('set-weight-0'));

  // ================= 1. the weight pad =================
  console.log('=== 1. weight ===');
  await page.tap(T('set-weight-0'));
  await page.waitForTimeout(900);
  const w = await page.evaluate(() => ({
    onTop: (() => {
      const o = document.querySelector('.numpad-overlay');
      if (!o) return false;
      const r = o.getBoundingClientRect();
      const hit = document.elementFromPoint(r.width / 2, r.height - 40);
      return !!hit && o.contains(hit);
    })(),
    tens: [...document.querySelectorAll('[data-testid="numpad-wheel-tens"] .wheel-item')].map(x => x.textContent.trim()).slice(0, 3),
    ones: document.querySelectorAll('[data-testid="numpad-wheel-ones"] .wheel-item').length,
    frac: [...document.querySelectorAll('[data-testid="numpad-wheel-frac"] .wheel-item')].map(x => x.textContent.trim()),
    caption: (document.querySelector('.numpad-wheel-caption') || {}).textContent,
    chips: [...document.querySelectorAll('.numpad-chip')].map(x => x.textContent.trim())
  }));
  console.log('   pad ->', JSON.stringify(w));
  check('the pad is on top of the workout, not behind it', w.onTop);
  check('weight spins on tens + ones + quarters',
    w.tens[0] === '0' && w.tens[1] === '10' && w.ones === 10 && w.frac.join(',') === '.00,.25,.50,.75',
    JSON.stringify({ tens: w.tens, ones: w.ones, frac: w.frac }));
  check('it offers last session as a chip', w.chips.some(x => /80/.test(x)), JSON.stringify(w.chips));
  await page.screenshot({ path: `${SS}/numpad_weight.png` });

  // 82.5 — the case the quarter column exists for.
  await spin('numpad-wheel-tens', '80');
  await spin('numpad-wheel-ones', '2');
  await spin('numpad-wheel-frac', '.50');
  const after = await page.evaluate(() => ({
    caption: (document.querySelector('.numpad-wheel-caption') || {}).textContent,
    field: document.querySelector('[data-testid="set-weight-0"]').value
  }));
  console.log('   after spinning ->', JSON.stringify(after));
  check('a quarter-kg weight reaches the field', after.field === '82.5', after.field);
  check('the caption agrees', /82\.5/.test(after.caption || ''), after.caption);

  // ================= 2. next moves to reps =================
  console.log('\n=== 2. reps ===');
  await page.tap(T('numpad-next'));
  await page.waitForTimeout(900);
  const r = await page.evaluate(() => ({
    int: document.querySelectorAll('[data-testid="numpad-wheel-int"] .wheel-item').length,
    first: (document.querySelector('[data-testid="numpad-wheel-int"] .wheel-item') || {}).textContent,
    log: !!document.querySelector('[data-testid="numpad-logset"]'),
    // The split weight columns must be gone — reps is a single column.
    tens: !!document.querySelector('[data-testid="numpad-wheel-tens"]')
  }));
  console.log('   reps pad ->', JSON.stringify(r));
  check('Next moves the pad to reps', r.int === 60 && (r.first || '').trim() === '1', JSON.stringify(r));
  check('reps is one column, not the weight split', !r.tens);
  check('it offers to log the set', r.log);
  await spin('numpad-wheel-int', '10');

  // ================= 3. logging the set =================
  console.log('\n=== 3. log set ===');
  await page.tap(T('numpad-logset'));
  await page.waitForTimeout(1400);
  const logged = await page.evaluate(async () => {
    const wk = await Storage.getWorkout('aw');
    const s = wk.exercises[0].sets[0];
    return { done: s.done, weight: s.weight, reps: s.reps, rest: !!document.getElementById('rest-timer'), pad: !!document.querySelector('.numpad-overlay') };
  });
  console.log('   logged ->', JSON.stringify(logged));
  check('the set is stored with what was spun', logged.done === true && logged.weight === 82.5 && logged.reps === 10,
    JSON.stringify(logged));
  check('the pad closed', !logged.pad);
  check('rest starts automatically', logged.rest);
  await page.screenshot({ path: `${SS}/numpad_logged.png` });

  // ================= 4. closing commits =================
  // Closing the pad IS the commit point. While it only dispatched "input",
  // fields that save on change/blur kept the number and never wrote it.
  console.log('\n=== 4. closing the pad commits the value ===');
  await page.evaluate(() => document.querySelectorAll('.rest-overlay').forEach(n => n.remove()));
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('[data-testid^="set-done-"]')][0];
    if (btn && btn.classList.contains('checked')) btn.click(); // untick to edit again
  });
  await page.waitForTimeout(800);
  await page.evaluate(() => document.querySelectorAll('.rest-overlay').forEach(n => n.remove()));
  await page.tap(T('set-weight-0'));
  await page.waitForTimeout(800);
  await spin('numpad-wheel-tens', '90');
  await spin('numpad-wheel-ones', '5');
  await spin('numpad-wheel-frac', '.00');
  await page.tap(T('numpad-done'));
  await page.waitForTimeout(1200);
  const closed = await page.evaluate(async () => {
    const wk = await Storage.getWorkout('aw');
    return { stored: wk.exercises[0].sets[0].weight, field: document.querySelector('[data-testid="set-weight-0"]').value };
  });
  console.log('   after Done ->', JSON.stringify(closed));
  check('the value survives closing the pad', closed.stored === 95, JSON.stringify(closed));

  console.log('\nERRORS:', errs.length ? errs : 'none');
  console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
