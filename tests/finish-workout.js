// Finishing a workout — the commit point of the primary journey.
//
// It had no test, and that is how it shipped a bug that rewrote every set's
// numbers down one row and discarded the last set, on every single Finish, for
// as long as anyone can tell. The flush loop queried `.set-row` and the column
// header carries that class, so it was row 0.
//
// Everything here is asserted against what lands in IndexedDB, because that is
// the thing that survives; what the screen showed a moment earlier is not
// evidence.
//
//   node tests/finish-workout.js   (needs `python3 -m http.server 8199` at the repo root)
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
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load|net::/.test(m.text())) errs.push('con: ' + m.text().slice(0, 160)); });
  // The app loads Inter from a CDN; stub it so a slow font never times the run out.
  await page.route(/fonts\.googleapis\.com/, r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));

  const PREFS = { onboarded: true, sex: 'male', dob: '1995-04-12', heightCm: 180, activityLevel: 'moderate', kcalGoal: 2200, warmupPrompt: false };

  const seed = (exercises, bwKg = 82) => page.evaluate(async ({ ex, prefs, bw }) => {
    await Storage.clearAll();
    for (const [k, v] of Object.entries(prefs)) await Storage.setPref(k, v);
    await Storage.saveBodyweight({ date: U.todayISO(), kg: bw });
    await Storage.saveWorkout({ id: 'aw', name: 'Session', date: U.todayISO(), startedAt: Date.now() - 6e5, exercises: ex });
    await Storage.setPref('activeWorkoutId', 'aw');
  }, { ex: exercises, prefs: PREFS, bw: bwKg });

  const open = async () => {
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(4200);
    await page.evaluate(() => {
      const r = document.querySelector('[data-testid="button-resume-workout"]');
      if (r) r.click(); else document.querySelector('[data-testid="dock-fab"]').click();
    });
    await page.waitForTimeout(1500);
  };
  const finish = async (confirm = true) => {
    await page.evaluate(() => {
      const f = [...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Finish');
      if (f) f.click();
    });
    await page.waitForTimeout(1300);
    // A "no sets logged" dialog may appear before the celebration.
    await page.evaluate((ok) => {
      const d = document.querySelector('[data-testid="confirm-dialog"]');
      if (!d) return;
      const btns = [...d.querySelectorAll('.modal-footer button')];
      const b = ok ? btns.find(x => /End workout/i.test(x.textContent)) : btns.find(x => /Cancel/i.test(x.textContent));
      if (b) b.click();
    }, confirm);
    await page.waitForTimeout(1000);
    await page.evaluate(() => {
      const cel = document.querySelector('.celebration');
      const btn = cel && [...cel.querySelectorAll('button')].find(x => /Finish workout/i.test(x.textContent));
      if (btn) btn.click();
    });
    await page.waitForTimeout(2200);
  };
  const stored = () => page.evaluate(async () => {
    const w = (await Storage.getWorkouts()).find(x => x.id === 'aw');
    if (!w) return null;
    return {
      completed: !!w.completedAt,
      ex: (w.exercises || []).map(e => ({
        n: e.name, t: e.type,
        sets: (e.sets || []).map(s => ({ w: s.weight, r: s.reps, sec: s.seconds, min: s.durationMin, k: s.kcal, done: s.done }))
      }))
    };
  });

  await page.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
  await page.waitForFunction(() => window.Storage && window.U);

  // ================= 1. the numbers you logged are the numbers you keep =========
  console.log('=== 1. Finish does not rewrite your sets ===');
  await seed([{ exerciseId: 'bench-press-barbell', name: 'Barbell Bench Press', type: 'weighted',
    sets: [{ weight: null, reps: null, done: false }, { weight: null, reps: null, done: false }, { weight: null, reps: null, done: false }] }]);
  await open();
  const WANT = [[100, 8], [90, 6], [80, 5]];
  for (const [i, [wt, rp]] of WANT.entries()) {
    await page.evaluate(({ i, wt, rp }) => {
      const set = (sel, v) => { const el = document.querySelector(sel); if (!el) return;
        el.value = String(v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true })); };
      set(`[data-testid="set-weight-${i}"]`, wt);
      set(`[data-testid="set-reps-${i}"]`, rp);
    }, { i, wt, rp });
    await sleep(350);
    await page.evaluate((i) => { const d = document.querySelector(`[data-testid="set-done-${i}"]`); if (d) d.click(); }, i);
    await sleep(800);
    await page.evaluate(() => document.querySelectorAll('.rest-overlay').forEach(n => n.remove()));
  }
  const before = await stored();
  console.log('   before Finish ->', JSON.stringify(before.ex[0].sets.map(s => [s.w, s.r])));
  await finish();
  const after = await stored();
  console.log('   after Finish  ->', JSON.stringify(after.ex[0].sets.map(s => [s.w, s.r])));
  check('every set keeps its own numbers',
    JSON.stringify(after.ex[0].sets.map(s => [s.w, s.r])) === JSON.stringify(WANT),
    JSON.stringify(after.ex[0].sets.map(s => [s.w, s.r])));
  check('the last set is not dropped', after.ex[0].sets.length === 3, String(after.ex[0].sets.length));
  check('the session is marked complete', after.completed);
  await page.screenshot({ path: `${SS}/finish_sets.png` });

  // ================= 2. timed work typed but not ticked survives ===============
  console.log('\n=== 2. holds you timed but did not tick ===');
  await seed([{ exerciseId: 'plank', name: 'Plank', category: 'core', type: 'hold',
    sets: [{ seconds: null, done: false }, { seconds: null, done: false }] }]);
  await open();
  for (const [i, secs] of [[0, 40], [1, 45]]) {
    await page.evaluate(({ i, secs }) => {
      const el = document.querySelector(`[data-testid="set-hold-${i}"]`);
      if (!el) return;
      el.value = String(secs);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, { i, secs });
    await sleep(500);
  }
  await sleep(600);
  const heldBefore = await stored();
  console.log('   typed, none ticked ->', JSON.stringify(heldBefore.ex[0].sets.map(s => s.sec)));
  await finish();
  const heldAfter = await stored();
  console.log('   after Finish       ->', JSON.stringify(heldAfter.ex[0].sets.map(s => [s.sec, s.done])));
  check('the exercise is still in the session', heldAfter.ex.length === 1, JSON.stringify(heldAfter.ex.map(e => e.n)));
  check('both timed holds are kept, with their seconds',
    heldAfter.ex.length === 1 && heldAfter.ex[0].sets.length === 2 &&
    heldAfter.ex[0].sets.every(s => s.done) &&
    JSON.stringify(heldAfter.ex[0].sets.map(s => s.sec)) === '[40,45]',
    JSON.stringify(heldAfter.ex[0] && heldAfter.ex[0].sets));

  // ================= 3. declining the confirm leaves the workout alone =========
  console.log('\n=== 3. saying "no" to "end anyway?" changes nothing ===');
  await seed([{ exerciseId: 'squat-back', name: 'Barbell Back Squat', type: 'weighted',
    sets: [{ weight: 100, reps: 5, done: false }, { weight: 100, reps: 5, done: false }] }]);
  await open();
  await finish(false);   // decline
  const declined = await page.evaluate(async () => {
    const w = (await Storage.getWorkouts()).find(x => x.id === 'aw');
    return { exCount: (w.exercises || []).length, setCount: ((w.exercises || [])[0] || {}).sets?.length ?? 0,
      completed: !!w.completedAt, stillActive: await Storage.getPref('activeWorkoutId') };
  });
  console.log('   after declining ->', JSON.stringify(declined));
  check('the exercises are still there', declined.exCount === 1, String(declined.exCount));
  check('their sets are still there', declined.setCount === 2, String(declined.setCount));
  check('the workout is still active, not finished',
    !declined.completed && declined.stillActive === 'aw', JSON.stringify(declined));

  // ================= 4. merely looking at a value does not log it ==============
  console.log('\n=== 4. opening a numpad is not the same as performing a set ===');
  await seed([{ exerciseId: 'bench-press-barbell', name: 'Barbell Bench Press', type: 'weighted',
    sets: [{ weight: 60, reps: 10, done: false }, { weight: 60, reps: 10, done: false }] }]);
  await open();
  await page.evaluate(() => { const i = document.querySelector('[data-testid="set-weight-0"]'); if (i) i.click(); });
  await sleep(1100);
  await page.evaluate(() => { const d = document.querySelector('[data-testid="numpad-done"]'); if (d) d.click(); });
  await sleep(900);
  await finish(true);
  const peeked = await stored();
  console.log('   after peeking then finishing ->', JSON.stringify(peeked.ex.map(e => e.sets)));
  check('a set you only looked at is not recorded as performed',
    peeked.ex.length === 0 || peeked.ex[0].sets.length === 0,
    JSON.stringify(peeked.ex));

  // ================= 5. an auto-committed set costs what YOU cost ==============
  //
  // The same cardio set was worth two different numbers depending on how the
  // workout ended. Tick it yourself and the burn was estimated at your logged
  // bodyweight; type the minutes and let Finish sweep the row up, and it was
  // estimated at U.DEFAULT_BW_KG — 75kg, whoever you are. commitFilledSets is
  // synchronous and the bodyweight lookup is not, so it had reached for the
  // constant. At 110kg that is a third of the burn missing from a set the user
  // did perform.
  //
  // Asserted against U's own arithmetic rather than a hardcoded number, so this
  // pins WHOSE bodyweight was used without also freezing the MET table or the
  // net-of-resting correction.
  console.log('\n=== 5. Finish estimates the burn at your weight, not 75kg ===');
  {
    const HEAVY = 110;
    await seed([{ exerciseId: 'rowing', name: 'Rowing Machine', category: 'cardio', type: 'cardio',
      sets: [{ durationMin: null, intensity: 'moderate', distanceKm: null, done: false }] }], HEAVY);
    await open();
    await page.evaluate(() => {
      const el = document.querySelector('[data-cardio-field="durationMin"]');
      if (!el) return;
      el.value = '20';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await sleep(700);
    const expect = await page.evaluate((bw) => {
      const def = EXERCISE_DB.find(e => e.id === 'rowing');
      const met = U.getMET({ type: 'cardio', category: 'cardio', met: def.met }, 'moderate');
      return { mine: U.estimateKcal(met, bw, 20), default_: U.estimateKcal(met, U.DEFAULT_BW_KG, 20) };
    }, HEAVY);
    await finish();
    const rowed = await stored();
    const got = rowed.ex.length === 1 && rowed.ex[0].sets.length === 1 ? rowed.ex[0].sets[0].k : null;
    console.log(`   typed 20 min, never ticked -> stored ${got} kcal (at ${HEAVY}kg: ${expect.mine}, at 75kg: ${expect.default_})`);
    check('the set survived Finish', got != null, JSON.stringify(rowed.ex));
    // The two must differ, or the check above proves nothing.
    check('the fixture can tell the two apart', expect.mine !== expect.default_,
      `${expect.mine} vs ${expect.default_}`);
    check('and it was costed at the logged bodyweight', got === expect.mine,
      `got ${got}, expected ${expect.mine}`);
    check('not at the 75kg default', got !== expect.default_, `got ${got}`);
  }

  // ================= 6. the burn is what training ADDED =======================
  //
  // A MET is a multiple of resting metabolism, so a 5-MET hour burns five times
  // resting, of which one times resting was going to happen anyway. Charging
  // the gross figure overstated lifting by about a fifth and stretching by
  // roughly three quarters — and did it twice over in the food budget, which
  // adds workout kcal on top of a lifestyle TDEE that already contains a whole
  // day of resting burn.
  console.log('\n=== 6. calories are net of resting, not gross ===');
  {
    const m = await page.evaluate(() => ({
      met5: U.estimateKcal(5, 100, 60),      // 5 METs, 100kg, an hour
      met1: U.estimateKcal(1, 100, 60),      // resting: costs nothing extra
      met2_3: U.estimateKcal(2.3, 100, 60),  // a stretch
      perMin: U.kcalPerMin({ met: 5, category: 'chest' }, 100),
      netExists: typeof U.netMET === 'function'
    }));
    check('there is one place that defines net METs', m.netExists);
    check('5 METs for an hour at 100kg costs 400, not 500', m.met5 === 400, String(m.met5));
    check('an activity at resting intensity adds nothing', m.met1 === 0, String(m.met1));
    check('a MET 2.3 stretch costs 130, not 230', m.met2_3 === 130, String(m.met2_3));
    // Within rounding: kcalPerMin reports one decimal, so 6.667 becomes 6.7 and
    // an hour of it is 402 rather than 400. The failure this guards against is
    // one of them going back to gross, which is a 100 kcal gap, not a 2.
    check('the per-minute figure agrees with the per-hour one',
      Math.abs(m.perMin * 60 - m.met5) < 10, `${m.perMin}/min vs ${m.met5}/hr`);
  }

  // ================= 7. e1RM stops where the formula stops ====================
  //
  // Epley holds to about 3% up to ten reps and is usable at twelve. At twenty
  // it claims 1.67x the bar, which is true of almost nobody. The app printed it
  // to one decimal place regardless, and that number fed the PR chip, the
  // strength tier and the CSV export.
  console.log('\n=== 7. no one-rep max is invented from a twenty-rep set ===');
  {
    const e = await page.evaluate(() => ({
      cap: U.E1RM_MAX_REPS,
      at1: U.epley(100, 1), at5: U.epley(100, 5), at12: U.epley(100, 12),
      at13: U.epley(100, 13), at20: U.epley(100, 20),
      label12: U.e1rmLabel(100, 12), label20: U.e1rmLabel(100, 20)
    }));
    check('the honest range is stated in one place', e.cap === 12, String(e.cap));
    check('a single is its own one-rep max', e.at1 === 100, String(e.at1));
    check('five reps still estimates', Math.abs(e.at5 - 116.67) < 0.1, String(e.at5));
    check('twelve reps is the last one that does', e.at12 === 140, String(e.at12));
    check('thirteen does not', e.at13 === 0, String(e.at13));
    check('and neither does twenty', e.at20 === 0, String(e.at20));
    check('the label prints a number inside the range', e.label12 === '140.0', String(e.label12));
    check('and prints nothing outside it', e.label20 === null, String(e.label20));
  }

  console.log('\nERRORS:', errs.length ? errs : 'none');
  console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
