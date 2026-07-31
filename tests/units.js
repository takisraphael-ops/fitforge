// Imperial units: conversion, round-tripping, and what actually reaches disk.
//
// The failure this exists to prevent is silent and permanent. Every weight in
// storage is kilograms; imperial is a costume worn at the edges. Get one input
// boundary wrong and the app writes 225 — the pounds figure — into a kilogram
// field, and nothing complains. The set looks fine on the imperial screen it
// was typed on, and the user's history is quietly ruined the moment they
// switch back, or open a backup, or look at their e1RM.
//
// So section 2 does not check labels. It logs sets through the real UI in
// imperial, reads the database, and demands kilograms.
//
//   node tests/units.js   (needs `python3 -m http.server 8199` at the root)
const path = require('path');
const fs = require('fs');
const SS = process.env.FITFORGE_SHOTS || path.resolve(__dirname, '..', '.shots');
try { fs.mkdirSync(SS, { recursive: true }); } catch (_) {}

let fails = 0;
const check = (label, ok, detail = '') => {
  if (!ok) fails++;
  console.log(`   ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
};

const ROOT = path.resolve(__dirname, '..');
// utils.js refers to `U` by name from inside its own methods — the file has
// always assumed it is a browser global. Give it one.
const G = {};
new Function('window', fs.readFileSync(path.join(ROOT, 'js/utils.js'), 'utf8'))(G);
const U = G.U;
global.U = U;

// ================= 1. the conversion layer =================
console.log('=== 1. conversions and round-tripping ===');
{
  U.setUnits('metric');
  check('metric is the default and passes weight through',
    U.toDisplayWeight(80) === 80 && U.fromDisplayWeight(80) === 80);
  check('metric labels', U.weightUnit() === 'kg' && U.distanceUnit() === 'km');

  U.setUnits('imperial');
  check('imperial labels', U.weightUnit() === 'lb' && U.distanceUnit() === 'mi');
  check('100 kg reads as 220.5 lb', U.toDisplayWeight(100) === 220.5, String(U.toDisplayWeight(100)));
  check('225 lb stores as 102.0583 kg',
    Math.abs(U.fromDisplayWeight(225) - 102.0583) < 0.001, String(U.fromDisplayWeight(225)));

  // The one that bites: show a stored weight, let the user retype exactly what
  // they saw, and the stored value must not creep.
  let worst = 0, worstAt = null;
  for (let kg = 2.5; kg <= 300; kg += 2.5) {
    const back = U.fromDisplayWeight(U.toDisplayWeight(kg));
    const drift = Math.abs(back - kg);
    if (drift > worst) { worst = drift; worstAt = kg; }
  }
  check('a kg → lb → kg round trip never drifts past 25 g',
    worst < 0.025, `worst ${(worst * 1000).toFixed(1)} g at ${worstAt} kg`);

  // And the same trip ten times over, which is what editing a set repeatedly does.
  let v = 100;
  for (let i = 0; i < 10; i++) v = U.fromDisplayWeight(U.toDisplayWeight(v));
  check('ten round trips stay inside 25 g of 100 kg', Math.abs(v - 100) < 0.025, `${v}`);

  check('display trims trailing zeros', U.trimNum(80.0) === '80' && U.trimNum(82.5) === '82.5');
  check('formatWeight reads naturally', U.formatWeight(100) === '220.5 lb', U.formatWeight(100));
  check('volume rounds and groups', U.formatVolume(4535.92) === '10,000 lb', U.formatVolume(4535.92));

  check('5 km is 3.11 mi', U.toDisplayDistance(5) === 3.11, String(U.toDisplayDistance(5)));
  check('distance round-trips', Math.abs(U.fromDisplayDistance(U.toDisplayDistance(5)) - 5) < 0.01);

  check('180 cm is 5′ 11″', U.formatHeight(180) === '5′ 11″', U.formatHeight(180));
  check('height round-trips', Math.abs(U.ftInToCm(5, 11) - 180) <= 1, String(U.ftInToCm(5, 11)));

  // Real plates, not converted metric discs.
  const lbPlates = U.plateSet().map((kg) => Math.round(kg * U.LB_PER_KG * 10) / 10);
  check('the imperial rack is 45/35/25/10/5/2.5 lb',
    JSON.stringify(lbPlates) === JSON.stringify([45, 35, 25, 10, 5, 2.5]), lbPlates.join(', '));
  check('the imperial bar is 45 lb',
    Math.round(U.barOptions()[0].kg * U.LB_PER_KG) === 45);
  check('the step is 5 lb, not 2.5', U.weightStep() === 5);

  U.setUnits('metric');
  check('the metric rack is unchanged',
    JSON.stringify(U.plateSet()) === JSON.stringify([25, 20, 15, 10, 5, 2.5, 1.25]));
  check('the metric bar is 20 kg', U.barOptions()[0].kg === 20);

  check('junk in gives null, not NaN',
    U.fromDisplayWeight('') === null && U.fromDisplayWeight('abc') === null && U.toDisplayWeight(null) === null);
}

// ================= the app =================
const { chromium } = require('/opt/node22/lib/node_modules/playwright/index.js');

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', hasTouch: true });
  const page = await c.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push('PAGEERR: ' + e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/Failed to load|net::/.test(m.text())) errs.push('con: ' + m.text().slice(0, 160));
  });
  const T = (s) => `[data-testid="${s}"]`;
  const hit = (re) => page.evaluate((r) => {
    const x = [...document.querySelectorAll('button')].find((n) => new RegExp(r, 'i').test(n.textContent.trim()));
    if (x) { x.click(); return x.textContent.trim().slice(0, 30); } return null;
  }, re);

  await page.goto('http://localhost:8199/index.html', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.Storage && window.U);
  await page.evaluate(async () => {
    await Storage.clearAll();
    for (const [k, v] of Object.entries({
      onboarded: true, sex: 'male', dob: '1992-03-04', heightCm: 180,
      activityLevel: 'light', kcalGoal: 2200, units: 'imperial'
    })) await Storage.setPref(k, v);
    await Storage.saveBodyweight({ date: U.todayISO(), kg: 82 });
    // A previous session at exactly 100 kg. The runner prefills from it, so
    // the figure on screen is a conversion of a stored kilogram value — and
    // logging it straight back is the exact round trip that corrupts data if
    // any boundary is wrong.
    const d = new Date(); d.setDate(d.getDate() - 2);
    await Storage.saveWorkout({
      id: 'seed-prev', name: 'Push', date: U.todayISO(d),
      startedAt: Date.now() - 172800000, completedAt: Date.now() - 169200000, durationSec: 3600,
      exercises: [{ exerciseId: 'bench-press-barbell', name: 'Barbell Bench Press', type: 'strength',
        category: 'chest', sets: [{ weight: 100, reps: 5, done: true }] }]
    });
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2600);

  // ---- 2. what reaches disk ----
  console.log('\n=== 2. logging in pounds still stores kilograms ===');
  check('the app booted in imperial', await page.evaluate(() => U.isImperial()));

  await page.click(T('dock-fab')); await page.waitForTimeout(500);
  await page.click(T('quick-start-workout')); await page.waitForTimeout(1400);
  await page.evaluate(() => [...document.querySelectorAll('.xrow')][0].click()); await page.waitForTimeout(350);
  await hit('start workout'); await page.waitForTimeout(1500);
  await hit('skip warm-up'); await page.waitForTimeout(1400);

  // The runner should be prefilled from that 100 kg set, shown in pounds.
  const shown = await page.evaluate(() => {
    const r = document.querySelector('[data-testid="set-runner"]');
    if (!r) return 'no runner';
    const w = [...r.querySelectorAll('button')].find((x) => /lb$/.test(x.textContent.trim()));
    return w ? w.textContent.trim() : 'no weight figure';
  });
  check('a stored 100 kg set prefills the runner as 220.5 lb',
    /^220\.5\s*lb$/.test(shown.replace(/\s+/g, ' ')), shown);

  // Pick the bench-press exercise, then log exactly what is on screen.
  await page.evaluate(() => {
    const r = document.querySelector('[data-testid="set-runner"]');
    const log = [...r.querySelectorAll('button')].find((x) => /LOG SET/.test(x.textContent));
    if (log) log.click();
  });
  await page.waitForTimeout(2200);

  const stored = await page.evaluate(async () => {
    const ws = await Storage.getWorkouts();
    const live = ws.find((w) => !w.completedAt) || ws[0];
    const set = (live.exercises || []).flatMap((e) => e.sets || []).find((s) => s.done);
    return set ? set.weight : null;
  });
  check('logging the shown figure stores kilograms, not the pounds number',
    stored != null && stored > 90 && stored < 115, `stored ${stored}`);
  check('and it comes back to the 100 kg it started as',
    stored != null && Math.abs(stored - 100) < 0.05, `${stored} kg`);

  // ---- 3. switching back shows the same lift in kg ----
  console.log('\n=== 3. switching system re-reads, never rewrites ===');
  const before = await page.evaluate(async () => {
    const ws = await Storage.getWorkouts();
    return ws.flatMap((w) => (w.exercises || []).flatMap((e) => e.sets || [])).map((s) => s.weight);
  });
  await page.evaluate(async () => { await Storage.setPref('units', 'metric'); });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2600);
  const after = await page.evaluate(async () => {
    const ws = await Storage.getWorkouts();
    return ws.flatMap((w) => (w.exercises || []).flatMap((e) => e.sets || [])).map((s) => s.weight);
  });
  check('stored weights are byte-identical after the switch',
    JSON.stringify(before) === JSON.stringify(after), `${JSON.stringify(before)} vs ${JSON.stringify(after)}`);
  check('and the app is now metric', await page.evaluate(() => !U.isImperial()));

  // ---- 4. the toggle is reachable and labels follow it ----
  console.log('\n=== 4. the setting itself ===');
  await page.evaluate(() => document.querySelectorAll('.dock button')[3].click());
  await page.waitForTimeout(2000);
  await page.click(T('you-settings')); await page.waitForTimeout(1000);
  const hasToggle = !!(await page.$(T('units-imperial')));
  check('Settings offers a units toggle', hasToggle);
  if (hasToggle) {
    await page.click(T('units-imperial'));
    await page.waitForTimeout(1600);
    check('choosing imperial sticks',
      (await page.evaluate(() => Storage.getPref('units', null))) === 'imperial');
    await page.screenshot({ path: `${SS}/units_settings.png` });
  }

  console.log('\nERRORS:', errs.length ? errs : 'none');
  console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
