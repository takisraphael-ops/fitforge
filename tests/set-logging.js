// Ticking a set updates in place instead of re-mounting the screen.
//
// The point is that marking a set does not rebuild the pager or the dock —
// a full re-render loses scroll position and makes the whole screen flash on
// every tap, which on a phone mid-set is the difference between usable and
// not.
//
// Replaces a suite that tapped the same set button twice in a row. Completing
// a set opens the rest timer, which owns the screen by design, so the second
// tap was intercepted and the run died there rather than testing anything.
//
//   node tests/set-logging.js   (needs `python3 -m http.server 8199` at the repo root)
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

  /** Rest owns the screen after a completed set — that is the design, not a
      bug. Skipping it is what a real user does before touching anything else. */
  async function dismissRest() {
    const had = await page.evaluate(() => !!document.getElementById('rest-timer'));
    if (!had) return false;
    const skipped = await page.evaluate(() => {
      const s = document.querySelector('[data-testid="rest-skip"]');
      if (s) { s.click(); return true; }
      return false;
    });
    if (!skipped) await page.evaluate(() => document.querySelectorAll('.rest-overlay').forEach(n => n.remove()));
    await sleep(700);
    return true;
  }

  await page.goto('http://localhost:8199/index.html', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.Storage && window.U);
  await page.evaluate(async () => {
    await Storage.clearAll();
    for (const [k, v] of Object.entries({ onboarded: true, sex: 'male', dob: '1995-04-12', heightCm: 180, activityLevel: 'moderate', kcalGoal: 2200, warmupPrompt: false,
      // The classic row is what this suite is about; guided logging is the
      // default and would sit on top of it. tests/guided.js covers that.
      guidedSets: false })) await Storage.setPref(k, v);
    await Storage.saveBodyweight({ date: U.todayISO(), kg: 82 });
    await Storage.saveWorkout({
      id: 'aw', name: 'Push A', date: U.todayISO(), startedAt: Date.now(),
      exercises: [{ exerciseId: 'bench-press-barbell', name: 'Barbell Bench Press', type: 'weighted',
        sets: [{ weight: 80, reps: 8, done: false }, { weight: 80, reps: 8, done: false }] }], notes: ''
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
  await page.waitForSelector(T('set-done-0'));

  // Stamp the nodes that must survive. Identity is the whole assertion: if
  // these are the same objects afterwards, nothing re-mounted them.
  await page.evaluate(() => {
    document.querySelector('[data-testid="wpager"]').__id = 'PAGER';
    document.querySelector('[data-testid="dock"]').__id = 'DOCK';
  });

  // ================= 1. marking =================
  console.log('=== 1. marking a set ===');
  await page.tap(T('set-done-0'));
  await page.waitForTimeout(700);
  const marked = await page.evaluate(() => ({
    pagerSame: document.querySelector('[data-testid="wpager"]').__id === 'PAGER',
    dockSame: document.querySelector('[data-testid="dock"]').__id === 'DOCK',
    checked: document.querySelector('[data-testid="set-done-0"]').classList.contains('checked'),
    rest: !!document.getElementById('rest-timer')
  }));
  console.log('   after marking ->', JSON.stringify(marked));
  check('the pager was not re-mounted', marked.pagerSame);
  check('the dock was not re-mounted', marked.dockSame);
  check('the set shows as done', marked.checked);
  check('rest starts on its own', marked.rest);
  await page.screenshot({ path: `${SS}/setlog_marked.png` });

  // ================= 2. undoing =================
  console.log('\n=== 2. undoing it ===');
  check('rest was up and had to be dismissed first', await dismissRest());
  await page.tap(T('set-done-0'));
  await page.waitForTimeout(700);
  const undone = await page.evaluate(() => ({
    pagerSame: document.querySelector('[data-testid="wpager"]').__id === 'PAGER',
    dockSame: document.querySelector('[data-testid="dock"]').__id === 'DOCK',
    checked: document.querySelector('[data-testid="set-done-0"]').classList.contains('checked'),
    rest: !!document.getElementById('rest-timer')
  }));
  console.log('   after undoing ->', JSON.stringify(undone));
  check('still no re-mount', undone.pagerSame && undone.dockSame);
  check('the set is unticked again', !undone.checked);
  check('undoing does not start a rest', !undone.rest);
  const storedUndone = await page.evaluate(async () => (await Storage.getWorkout('aw')).exercises[0].sets[0].done);
  check('the undo reached storage', storedUndone !== true, String(storedUndone));

  // ================= 3. it persists =================
  console.log('\n=== 3. marking again persists ===');
  await page.tap(T('set-done-0'));
  await page.waitForTimeout(800);
  const saved = await page.evaluate(async () => (await Storage.getWorkout('aw')).exercises[0].sets[0].done);
  check('the set is stored as done', saved === true, String(saved));
  await dismissRest();

  // The second set is independent — marking one must not tick the other.
  await page.tap(T('set-done-1'));
  await page.waitForTimeout(800);
  const both = await page.evaluate(async () => {
    const w = await Storage.getWorkout('aw');
    return w.exercises[0].sets.map(s => s.done);
  });
  console.log('   both sets ->', JSON.stringify(both));
  check('each set tracks independently', both[0] === true && both[1] === true, JSON.stringify(both));
  check('the screen still was not re-mounted', await page.evaluate(() =>
    document.querySelector('[data-testid="wpager"]').__id === 'PAGER' &&
    document.querySelector('[data-testid="dock"]').__id === 'DOCK'));
  await page.screenshot({ path: `${SS}/setlog_done.png` });

  console.log('\nERRORS:', errs.length ? errs : 'none');
  console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
