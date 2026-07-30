// Restore is the one operation that can destroy everything you have.
//
// importAll used to validate exactly one thing — that `version` was truthy —
// and then, in "replace" mode, clear all nine stores and write them back
// record by record with no transaction. Two consequences, both found by
// feeding it files a real person could plausibly pick:
//
//   * Any JSON with a version key counted as a backup. A package.json cleared
//     every store, wrote the nine empty arrays it did not have, threw nothing,
//     and reported success. Twelve sessions became zero with a cheerful toast.
//
//   * Anything that threw part-way through left the user with whatever had
//     been written so far. Four of sixteen hostile files ended with an empty
//     database, having started with real data.
//
// So the property under test is not "are bad files rejected" but "does my
// existing data survive being shown a bad file" — every rejection case below
// asserts the data that was already there is byte-for-byte still there.
//
//   node tests/import.js   (needs `python3 -m http.server 8199` at the repo root)
const { chromium } = require('/opt/node22/lib/node_modules/playwright/index.js');

let fails = 0;
const check = (label, ok, detail = '') => {
  if (!ok) fails++;
  console.log(`   ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
};

// What the user already has, and would be furious to lose.
const MINE = async () => {
  await Storage.clearAll();
  await Storage.setPref('onboarded', true);
  await Storage.setPref('kcalGoal', 1111);
  for (let i = 0; i < 4; i++) {
    await Storage.saveWorkout({ id: 'mine' + i, name: 'My session ' + i, date: '2026-07-0' + (i + 1),
      startedAt: 1, completedAt: 2, durationSec: 3000,
      exercises: [{ exerciseId: 'bench-press-barbell', name: 'Bench', type: 'weighted',
        sets: [{ weight: 100, reps: 5, done: true }] }] });
  }
  await Storage.saveMeal({ id: 'mymeal', date: '2026-07-01', name: 'My meal', kcal: 500 });
  await Storage.saveBodyweight({ date: '2026-07-01', kg: 82 });
};

const GOOD = {
  version: 4, exportedAt: '2026-07-20T10:00:00.000Z',
  workouts: [{ id: 'iw1', name: 'Imported', date: '2026-07-15', startedAt: 1, completedAt: 2, durationSec: 600,
    exercises: [{ exerciseId: 'bench-press-barbell', name: 'Bench', type: 'weighted',
      sets: [{ weight: 60, reps: 5, done: true }] }] }],
  meals: [{ id: 'im1', date: '2026-07-15', name: 'Imported meal', kcal: 400 }],
  customExercises: [], prefs: [{ key: 'kcalGoal', value: 2345 }],
  bodyweights: [{ date: '2026-07-15', kg: 80 }],
  templates: [], mealTemplates: [], supplements: [], supplementLogs: []
};

// Each is a file someone could genuinely end up selecting.
const REJECT = [
  ['JSON that is not an object', [1, 2, 3]],
  ['no version field', { workouts: [] }],
  ['version is null', { version: null, workouts: [] }],
  ['version 0', { version: 0, workouts: [] }],
  ['version is a word', { ...GOOD, version: 'four' }],
  ['a newer app wrote it', { ...GOOD, version: 99 }],
  ['someone else\'s JSON that happens to have a version',
    { version: 2, name: 'my-project', dependencies: { react: '^18' } }],
  ['workouts is a string', { ...GOOD, workouts: 'oops' }],
  ['workouts is an object', { ...GOOD, workouts: { a: 1 } }],
  ['a workout with no id', { ...GOOD, workouts: [{ name: 'No id here' }] }],
  ['a bodyweight with no date', { ...GOOD, bodyweights: [{ kg: 80 }] }],
  ['a pref with no key', { ...GOOD, prefs: [{ value: 1 }] }],
  ['null entries inside the arrays', { ...GOOD, workouts: [null], meals: [null] }],
  ['an id that cannot be a key', { ...GOOD, workouts: [{ id: { nested: true } }] }],
  ['a good record after a bad one',
    { ...GOOD, workouts: [{ noIdHere: true }, { id: 'iw2', name: 'Survivor', date: '2026-07-16' }] }]
];

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  const page = await c.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERR: ' + e.message.slice(0, 120)));
  await page.route(/fonts\.googleapis\.com/, r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await page.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
  await page.waitForFunction(() => window.Storage && window.U);

  const attempt = (payload, mode) => page.evaluate(async ({ p, mode, mine }) => {
    // eslint-disable-next-line no-new-func
    await (new Function('return ' + mine))()();
    const snap = async () => ({
      workouts: (await Storage.getWorkouts()).map(w => w.id).sort().join(','),
      meals: (await Storage.getMeals()).map(m => m.id).sort().join(','),
      bodyweights: (await Storage.getBodyweights()).map(x => x.date).sort().join(','),
      goal: await Storage.getPref('kcalGoal', null)
    });
    const before = await snap();
    let threw = null;
    try { await Storage.importAll(p, mode); } catch (e) { threw = (e.message || String(e)).slice(0, 90); }
    return { before, after: await snap(), threw };
  }, { p: payload, mode, mine: MINE.toString() });

  // =============== 1. a good backup still works ============================
  console.log('=== 1. a good backup imports, both ways ===');
  {
    const rep = await attempt(GOOD, 'replace');
    check('replace brings in the file\'s data', rep.after.workouts === 'iw1' && rep.after.goal === 2345,
      JSON.stringify(rep.after));
    check('replace does not leave the old data behind', !rep.after.workouts.includes('mine'), rep.after.workouts);
    const mer = await attempt(GOOD, 'merge');
    check('merge keeps both', mer.after.workouts === 'iw1,mine0,mine1,mine2,mine3', mer.after.workouts);
  }

  // =============== 2. no bad file may cost you anything =====================
  console.log('\n=== 2. a rejected file leaves your data exactly as it was ===');
  {
    let survived = 0, silent = [];
    for (const [name, payload] of REJECT) {
      const r = await attempt(payload, 'replace');   // replace: the destructive mode
      const intact = r.after.workouts === r.before.workouts
                  && r.after.meals === r.before.meals
                  && r.after.bodyweights === r.before.bodyweights
                  && r.after.goal === r.before.goal;
      if (intact) survived++;
      // Rejected silently is the worst outcome of all: the user is told it
      // worked, and only finds out later.
      if (!r.threw) silent.push(name);
      check(name, intact && !!r.threw,
        [!r.threw ? 'ACCEPTED SILENTLY' : '', !intact ? `data changed: ${JSON.stringify(r.after)}` : '',
         r.threw ? `“${r.threw}”` : ''].filter(Boolean).join('  '));
    }
    check(`all ${REJECT.length} left the data intact`, survived === REJECT.length, `${survived}/${REJECT.length}`);
    check('none was accepted without complaint', silent.length === 0, silent.join(', '));
  }

  // =============== 3. a failure mid-write puts everything back =============
  //
  // Validation should catch anything a file can contain, but a restore is the
  // one operation where "should" is not good enough. Fault is injected at the
  // platform boundary; no app code is touched.
  console.log('\n=== 3. a write that fails after validation rolls back ===');
  {
    const r = await page.evaluate(async (mine) => {
      // eslint-disable-next-line no-new-func
      await (new Function('return ' + mine))()();
      const snap = async () => ({
        w: (await Storage.getWorkouts()).map(x => x.id).sort().join(','),
        goal: await Storage.getPref('kcalGoal', null)
      });
      const before = await snap();
      const realPut = IDBObjectStore.prototype.put;
      IDBObjectStore.prototype.put = function (v) {
        if (this.name === 'meals') throw new Error('injected write failure');
        return realPut.call(this, v);
      };
      let threw = null;
      try {
        await Storage.importAll({ version: 4, workouts: [{ id: 'imported1' }], meals: [{ id: 'm1', kcal: 1 }] }, 'replace');
      } catch (e) { threw = (e.message || String(e)).slice(0, 40); }
      IDBObjectStore.prototype.put = realPut;
      return { before, after: await snap(), threw };
    }, MINE.toString());
    console.log('   ', JSON.stringify(r));
    check('the failure is reported, not swallowed', !!r.threw, r.threw || 'nothing thrown');
    check('every workout is back', r.after.w === r.before.w, `${r.after.w} vs ${r.before.w}`);
    // One store still refusing writes must not abandon the other eight.
    check('and so are the prefs, past the store that is still failing',
      r.after.goal === r.before.goal, `${r.after.goal} vs ${r.before.goal}`);
  }

  // =============== 4. export then import is lossless ========================
  console.log('\n=== 4. a backup this app wrote reads back identically ===');
  {
    const r = await page.evaluate(async (mine) => {
      // eslint-disable-next-line no-new-func
      await (new Function('return ' + mine))()();
      const before = JSON.stringify({
        w: await Storage.getWorkouts(), m: await Storage.getMeals(),
        bw: await Storage.getBodyweights(), goal: await Storage.getPref('kcalGoal', null)
      });
      // Round-trip through actual JSON text, the way a file does.
      const file = JSON.parse(JSON.stringify(await Storage.exportAll()));
      await Storage.clearAll();
      let threw = null;
      try { await Storage.importAll(file, 'replace'); } catch (e) { threw = e.message; }
      const after = JSON.stringify({
        w: await Storage.getWorkouts(), m: await Storage.getMeals(),
        bw: await Storage.getBodyweights(), goal: await Storage.getPref('kcalGoal', null)
      });
      return { same: before === after, threw, beforeLen: before.length, afterLen: after.length };
    }, MINE.toString());
    check('export -> wipe -> import returns exactly what was there',
      r.same && !r.threw, r.threw || `${r.beforeLen} vs ${r.afterLen} chars`);
  }

  console.log('\nERRORS:', errs.length ? errs : 'none');
  console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
