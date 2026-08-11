// The small-integrity batch: sanity bounds on every number a user can type
// (one typo used to poison PRs, e1RM, TDEE and every chart axis with no way
// to find the bad record later), the one-transaction pref load, the splash
// that waits for readiness instead of a stopwatch, and honest unit labels.
//
//   node tests/integrity.js   (needs `python3 -m http.server 8199`)
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright/index.js');

let fails = 0;
const check = (label, ok, detail = '') => {
  if (!ok) fails++;
  console.log(`   ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
};

// ---- static: the README tells the truth ------------------------------------
console.log('=== 1. the README matches the code ===');
{
  const ROOT = path.resolve(__dirname, '..');
  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
  const window = {};
  eval(fs.readFileSync(path.join(ROOT, 'data/exercises.js'), 'utf8'));
  const exCount = (window.EXERCISE_DB || []).length;
  check('the stated exercise count is the real one', readme.includes(`${exCount} built-in exercises`) || readme.includes(`(${exCount} exercises)`), `real: ${exCount}`);
  check('no inflated ~850 claim survives', !/850/.test(readme));
  check('storage is described as IndexedDB', /IndexedDB/.test(readme));
  check('and not as localStorage', !/localStorage|local storage\*\*/.test(readme), 'README mentions localStorage');
  check('the eviction risk is named, not hidden', /seven days|7 days/i.test(readme));
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', hasTouch: true, isMobile: true });
  const p = await c.newPage();
  const boot = async (seed) => {
    await p.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
    await p.waitForFunction(() => window.Storage && window.U);
    await p.evaluate(async (fn) => { await Storage.clearAll(); await eval(`(${fn})`)(); }, seed.toString());
    await p.reload({ waitUntil: 'load' });
    await p.waitForTimeout(2000);
    await p.evaluate(() => document.querySelectorAll('.splash').forEach(n => n.remove()));
  };

  console.log('\n=== 2. absurd numbers are refused at every door ===');
  await boot(async () => {
    const P = { onboarded: true, guidedSets: false, warmupPrompt: false, radialDiscovered: true };
    for (const [k, v] of Object.entries(P)) await Storage.setPref(k, v);
    await Storage.saveWorkout({ id: 'aw', name: 'S', date: U.todayISO(), startedAt: Date.now(),
      exercises: [{ exerciseId: 'bench-press-barbell', name: 'Bench', type: 'weighted',
        sets: [{ weight: null, reps: null, done: false }, { weight: null, reps: null, done: false }] }] });
    await Storage.setPref('activeWorkoutId', 'aw');
  });
  await p.waitForSelector('[data-testid="button-resume-workout"]', { timeout: 8000 });
  await p.evaluate(() => document.querySelector('[data-testid="button-resume-workout"]')?.click());
  await p.waitForSelector('[data-testid="set-row-0"]', { timeout: 8000 });
  await p.waitForTimeout(400);

  // A 1,000,000 kg bench press must not log.
  const absurd = await p.evaluate(async () => {
    const row = document.querySelector('[data-testid="set-row-0"]');
    const w = row.querySelector('input');
    const inputs = row.querySelectorAll('input');
    inputs[0].value = '1000000'; inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
    inputs[1].value = '5'; inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise(r => setTimeout(r, 400));
    document.querySelector('[data-testid="set-done-0"]')?.click();
    await new Promise(r => setTimeout(r, 800));
    const wk = await Storage.getWorkout('aw');
    return { done: wk.exercises[0].sets[0].done, toast: document.body.textContent.includes("can't be right") };
  });
  check('a 1,000,000 kg set is refused with a reason', absurd.done === false && absurd.toast, JSON.stringify(absurd));

  // 500 reps refused too.
  const reps = await p.evaluate(async () => {
    const row = document.querySelector('[data-testid="set-row-1"]');
    const inputs = row.querySelectorAll('input');
    inputs[0].value = '60'; inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
    inputs[1].value = '500'; inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise(r => setTimeout(r, 400));
    document.querySelector('[data-testid="set-done-1"]')?.click();
    await new Promise(r => setTimeout(r, 800));
    const wk = await Storage.getWorkout('aw');
    return wk.exercises[0].sets[1].done;
  });
  check('500 reps is refused', reps === false, String(reps));

  // A sane set still logs — the gate must not catch real lifting.
  const sane = await p.evaluate(async () => {
    const row = document.querySelector('[data-testid="set-row-0"]');
    const inputs = row.querySelectorAll('input');
    inputs[0].value = '100'; inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
    inputs[1].value = '5'; inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise(r => setTimeout(r, 400));
    document.querySelector('[data-testid="set-done-0"]')?.click();
    await new Promise(r => setTimeout(r, 800));
    const wk = await Storage.getWorkout('aw');
    return wk.exercises[0].sets[0];
  });
  check('100 kg × 5 logs normally', sane.done === true && sane.weight === 100, JSON.stringify({ done: sane.done, weight: sane.weight }));

  // Finish's sweep must skip a typo the Done button would refuse.
  const sweep = await p.evaluate(async () => {
    const wk = await Storage.getWorkout('aw');
    wk.exercises[0].sets[1] = { weight: 999999, reps: 5, done: false, touched: true };
    await Storage.saveWorkout(wk);
    return true;
  });
  await p.reload({ waitUntil: 'load' });
  await p.waitForTimeout(2000);
  await p.evaluate(() => document.querySelectorAll('.splash').forEach(n => n.remove()));
  await p.evaluate(() => document.querySelector('[data-testid="button-resume-workout"]')?.click());
  await p.waitForSelector('[data-testid="set-row-0"]', { timeout: 8000 });
  // The full Finish choreography, borrowed from the finish-workout suite:
  // Finish button, optional confirm dialog, celebration screen.
  await p.evaluate(() => {
    const f = [...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Finish');
    f?.click();
  });
  await p.waitForTimeout(1300);
  await p.evaluate(() => {
    const d = document.querySelector('[data-testid="confirm-dialog"]');
    if (!d) return;
    const b = [...d.querySelectorAll('.modal-footer button')].find(x => /End workout|Finish/i.test(x.textContent));
    b?.click();
  });
  await p.waitForTimeout(1000);
  await p.evaluate(() => {
    const cel = document.querySelector('.celebration');
    const btn = cel && [...cel.querySelectorAll('button')].find(x => /Finish workout/i.test(x.textContent));
    btn?.click();
  });
  await p.waitForTimeout(2200);
  const swept = await p.evaluate(async () => {
    const w = (await Storage.getWorkouts()).find(x => x.id === 'aw');
    return { completed: !!w.completedAt, typoDone: !!w.exercises[0].sets[1]?.done, saneDone: !!w.exercises[0].sets[0]?.done };
  });
  check('the workout actually finished (sweep ran)', swept.completed, JSON.stringify(swept));
  check('the finish sweep never commits the typo', swept.completed && swept.typoDone === false, JSON.stringify(swept));

  console.log('\n=== 3. bodyweight and meals have human bounds ===');
  await boot(async () => {
    const P = { onboarded: true };
    for (const [k, v] of Object.entries(P)) await Storage.setPref(k, v);
  });
  const bw = await p.evaluate(async () => {
    const wI = document.querySelector('input[aria-label*="bodyweight" i]');
    if (!wI) return { found: false };
    const btn = wI.closest('.card')?.querySelector('button.btn-primary');
    wI.value = '1000';
    wI.dispatchEvent(new Event('input', { bubbles: true }));
    btn?.click();
    await new Promise(r => setTimeout(r, 800));
    const rows = await Storage.getBodyweights();
    return { found: true, saved: rows.length, toast: document.body.textContent.includes('between') };
  });
  check('a 1,000 kg bodyweight is refused', bw.found && bw.saved === 0 && bw.toast, JSON.stringify(bw));

  const meal = await p.evaluate(async () => {
    // Straight to the meal form through the fork.
    document.querySelector('[data-testid="dock-nutrition"]')?.click();
    await new Promise(r => setTimeout(r, 1400));
    document.querySelector('.nadd-btn')?.click();
    await new Promise(r => setTimeout(r, 700));
    document.querySelector('[data-testid="meal-fork-create"]')?.click();
    await new Promise(r => setTimeout(r, 700));
    const modal = document.querySelector('.modal, [role="dialog"]');
    if (!modal) return { found: false };
    const name = modal.querySelector('input.input:not(.input-num)');
    const kcal = modal.querySelector('input[placeholder="kcal"]');
    if (!name || !kcal) return { found: false };
    name.value = 'Typo meal'; name.dispatchEvent(new Event('input', { bubbles: true }));
    kcal.value = '99999'; kcal.dispatchEvent(new Event('input', { bubbles: true }));
    const save = [...modal.parentNode.querySelectorAll('button')].find(x => /Save meal/.test(x.textContent));
    save?.click();
    await new Promise(r => setTimeout(r, 800));
    const meals = await Storage.getMeals();
    return { found: true, saved: meals.length, toast: document.body.textContent.includes("can't be right") };
  });
  check('a 99,999 kcal meal is refused', meal.found && meal.saved === 0 && meal.toast, JSON.stringify(meal));

  console.log('\n=== 4. boot reads prefs in one transaction, splash waits for readiness ===');
  // The pref-read count is observable by wrapping the storage layer before
  // the app boots.
  const counts = await p.evaluate(async () => {
    let single = 0, bulk = 0;
    const gp = Storage.getPref, gap = Storage.getAllPrefs;
    Storage.getPref = function (...a) { single++; return gp.apply(this, a); };
    Storage.getAllPrefs = function (...a) { bulk++; return gap.apply(this, a); };
    return { wrapped: true };
  });
  // Wrap-then-reload loses the wrapper; instead count via an init-script page.
  const p2 = await c.newPage();
  await p2.addInitScript(() => {
    window.__prefReads = { single: 0, bulk: 0 };
    const arm = () => {
      if (!window.Storage || !window.Storage.getPref) return setTimeout(arm, 5);
      const gp = window.Storage.getPref, gap = window.Storage.getAllPrefs;
      window.Storage.getPref = function (...a) { window.__prefReads.single++; return gp.apply(this, a); };
      if (gap) window.Storage.getAllPrefs = function (...a) { window.__prefReads.bulk++; return gap.apply(this, a); };
    };
    arm();
  });
  await p2.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
  await p2.waitForFunction(() => window.U && document.querySelector('.dock'), null, { timeout: 15000 });
  const reads = await p2.evaluate(() => window.__prefReads);
  check('boot loads the pref bag in one bulk read', reads.bulk >= 1, JSON.stringify(reads));
  check('and issues only a handful of single reads', reads.single <= 5, `${reads.single} single reads`);

  // Splash: the app hands readiness to the splash rather than racing it.
  const splashWired = await p2.evaluate(async () => {
    const html = await (await fetch('/index.html')).text();
    const app = await (await fetch('/js/app.js')).text();
    return {
      exposes: /__ffSplashDone/.test(html),
      called: /__ffSplashDone/.test(app),
      noFixedHold: !/hold = reduce \? 300 : 1400/.test(html),
      failsafe: /setTimeout\(done, 4000\)/.test(html)
    };
  });
  check('the splash is dismissed by readiness, not a stopwatch',
    splashWired.exposes && splashWired.called && splashWired.noFixedHold, JSON.stringify(splashWired));
  check('with a failsafe if boot never reports in', splashWired.failsafe);
  await p2.close();

  console.log('\n=== 5. imperial mode shows no stray kg ===');
  await boot(async () => {
    for (const [k, v] of Object.entries({ onboarded: true, units: 'imperial', guidedSets: false, warmupPrompt: false, radialDiscovered: true })) await Storage.setPref(k, v);
    await Storage.saveBodyweight({ date: U.todayISO(), kg: 90 });
    await Storage.saveWorkout({ id: 'aw', name: 'S', date: U.todayISO(), startedAt: Date.now(),
      exercises: [{ exerciseId: 'bench-press-barbell', name: 'Bench', type: 'weighted',
        sets: [{ weight: 60, reps: 5, done: false }] }] });
    await Storage.setPref('activeWorkoutId', 'aw');
  });
  await p.evaluate(() => document.querySelector('[data-testid="button-resume-workout"]')?.click());
  await p.waitForTimeout(1600);
  const kpmLine = await p.evaluate(() => {
    const t = [...document.querySelectorAll('.exercise-block .text-xs')].map(n => n.textContent).find(x => /kcal\/min at/.test(x));
    return t || null;
  });
  check('the kcal/min line speaks pounds to an imperial user',
    !!kpmLine && /lb\b/.test(kpmLine) && !/\dkg/.test(kpmLine), String(kpmLine));

  await p.evaluate(async () => { await Storage.clearAll(); });
  await b.close();
  console.log(`\n${fails === 0 ? 'ALL PASS' : fails + ' FAILED'}`);
  process.exit(fails === 0 ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
