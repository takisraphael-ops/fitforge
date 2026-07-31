// Does the app survive data that is plausible but broken?
//
// Every fixture here is a shape a real install could genuinely end up with: an
// exercise the user deleted from their library, a session saved before a field
// existed, a hand-edited or older backup restored, a plan pointing at a
// template that is gone, a meal typed as zero.
//
// It exists because two of them took the History tab completely blank:
//
//   renderHistory:11881  w.exercises.length          — no exercises array
//   U.volume(e.sets)     sets.reduce(...)            — no sets array
//
// Both were one unguarded read among a dozen guarded ones in the same
// function, and neither broke only its own row — the throw happened mid-render,
// so the whole tab came out empty. Nothing else in the suite reads storage that
// did not come from the app itself, so nothing else could have caught them.
//
//   node tests/robustness.js   (needs `python3 -m http.server 8199` at the repo root)
const { chromium } = require('/opt/node22/lib/node_modules/playwright/index.js');

let fails = 0;
const check = (label, ok, detail = '') => {
  if (!ok) fails++;
  console.log(`   ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
};

const PREFS = { onboarded: true, sex: 'male', dob: '1995-04-12', heightCm: 180,
  activityLevel: 'moderate', kcalGoal: 2600, radialDiscovered: true };

// Each fixture returns nothing; it just leaves storage in the shape under test.
const CASES = [
  {
    name: 'a fresh install with no data at all',
    seed: async (P) => { await Storage.clearAll();
      for (const [k, v] of Object.entries(P)) await Storage.setPref(k, v); }
  },
  {
    name: 'a completed workout with no exercises array',
    seed: async (P) => { await Storage.clearAll();
      for (const [k, v] of Object.entries(P)) await Storage.setPref(k, v);
      await Storage.saveWorkout({ id: 'a', name: 'Broken', date: U.todayISO(),
        startedAt: Date.now() - 1e6, completedAt: Date.now() }); }
  },
  {
    name: 'an exercise entry with no sets array',
    seed: async (P) => { await Storage.clearAll();
      for (const [k, v] of Object.entries(P)) await Storage.setPref(k, v);
      await Storage.saveWorkout({ id: 'b', name: 'NoSets', date: U.todayISO(),
        startedAt: Date.now() - 1e6, completedAt: Date.now(), durationSec: 900,
        exercises: [{ exerciseId: 'bench-press-barbell', name: 'Bench', type: 'weighted' }] }); }
  },
  {
    name: 'a workout referencing an exercise that no longer exists',
    seed: async (P) => { await Storage.clearAll();
      for (const [k, v] of Object.entries(P)) await Storage.setPref(k, v);
      await Storage.saveWorkout({ id: 'c', name: 'Ghost', date: U.todayISO(),
        startedAt: Date.now() - 1e6, completedAt: Date.now(), durationSec: 1200,
        exercises: [{ exerciseId: 'no-such-exercise-xyz', name: 'Ghost Lift', type: 'weighted',
          sets: [{ weight: 100, reps: 5, done: true }] }] }); }
  },
  {
    name: 'nulls, zeroes and negatives where numbers belong',
    seed: async (P) => { await Storage.clearAll();
      for (const [k, v] of Object.entries(P)) await Storage.setPref(k, v);
      await Storage.saveWorkout({ id: 'd', name: 'Odd', date: U.todayISO(),
        startedAt: Date.now() - 1e6, completedAt: Date.now(), durationSec: null,
        exercises: [{ exerciseId: 'bench-press-barbell', name: 'Bench', type: 'weighted',
          sets: [{ weight: null, reps: null, done: true }, { weight: -20, reps: 0, done: true }] }] });
      await Storage.saveMeal({ id: 'm0', date: U.todayISO(), name: 'Zero', kcal: 0, protein: null, fat: -3 });
      await Storage.saveBodyweight({ date: U.todayISO(), kg: 0 }); }
  },
  {
    name: 'a completed workout with no date',
    seed: async (P) => { await Storage.clearAll();
      for (const [k, v] of Object.entries(P)) await Storage.setPref(k, v);
      await Storage.saveWorkout({ id: 'e', name: 'Undated', startedAt: Date.now() - 1e6,
        completedAt: Date.now(), exercises: [{ exerciseId: 'bench-press-barbell', name: 'Bench',
          type: 'weighted', sets: [{ weight: 80, reps: 5, done: true }] }] }); }
  },
  {
    name: 'a weekly plan pointing at a deleted template',
    seed: async (P) => { await Storage.clearAll();
      for (const [k, v] of Object.entries(P)) await Storage.setPref(k, v);
      const KEYS = ['mon','tue','wed','thu','fri','sat','sun'];
      const plan = {}; for (const k of KEYS) plan[k] = 'rest';
      plan[KEYS[(new Date().getDay() + 6) % 7]] = 'tpl-that-was-deleted';
      await Storage.setPref('weeklyPlan', plan); }
  },
  {
    name: 'a custom exercise with no category and no muscles',
    seed: async (P) => { await Storage.clearAll();
      for (const [k, v] of Object.entries(P)) await Storage.setPref(k, v);
      await Storage.saveCustomExercise({ id: 'cx1', name: 'Mystery Move', category: '', muscles: [], type: 'weighted' });
      await Storage.saveWorkout({ id: 'f', name: 'Custom', date: U.todayISO(),
        startedAt: Date.now() - 1e6, completedAt: Date.now(), durationSec: 900,
        exercises: [{ exerciseId: 'cx1', name: 'Mystery Move', type: 'weighted',
          sets: [{ weight: 40, reps: 10, done: true }] }] }); }
  },
  {
    name: 'an active workout with no exercises array',
    seed: async (P) => { await Storage.clearAll();
      for (const [k, v] of Object.entries(P)) await Storage.setPref(k, v);
      await Storage.saveWorkout({ id: 'aw', name: 'Live', date: U.todayISO(), startedAt: Date.now() - 6e5 });
      await Storage.setPref('activeWorkoutId', 'aw'); }
  }
];

// Every tab, plus History, which is where both crashes landed.
const SURFACES = [
  ['home', null],
  ['nutrition', '[data-testid="dock-nutrition"]'],
  ['you', '[data-testid="dock-stats"]'],
  ['history', '[data-testid="seg-history"]'],
  ['library', '[data-testid="dock-library"]']
];

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const c of CASES) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', hasTouch: true });
    const page = await ctx.newPage();
    const errs = new Set();
    page.on('pageerror', e => {
      const at = ((e.stack || '').match(/at (\w+) \(.*?:(\d+):/) || []).slice(1).join(':');
      errs.add(e.message.slice(0, 90) + (at ? ` @ ${at}` : ''));
    });
    page.on('console', m => {
      const t = m.text();
      if (m.type() === 'error' && !/Failed to load|net::|sw\.js|manifest/i.test(t)) errs.add('con: ' + t.slice(0, 90));
    });
    await page.route(/fonts\.googleapis\.com/, r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await page.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
    await page.waitForFunction(() => window.Storage && window.U);
    await page.evaluate(c.seed, PREFS);
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(4200);
    await page.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"],.splash').forEach(n => n.remove()));

    const blank = [];
    for (const [label, sel] of SURFACES) {
      if (sel) await page.evaluate(s => { const n = document.querySelector(s); if (n) n.click(); }, sel);
      await page.waitForTimeout(1000);
      // Learn forks on the way in; take the reading side so the tab renders.
      await page.evaluate(() => document.querySelector('[data-testid="learn-fork-centre"]')?.click());
      await page.waitForTimeout(600);
      await page.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"]').forEach(n => n.remove()));
      // A screen that threw mid-render leaves an empty .view — the symptom
      // both real bugs produced, and the one a user would actually report.
      const len = await page.evaluate(() => {
        const v = document.querySelector('.view');
        return v ? v.innerText.trim().length : -1;
      });
      if (len <= 0) blank.push(label);
    }
    check(c.name, errs.size === 0 && blank.length === 0,
      [errs.size ? [...errs].join(' | ') : '', blank.length ? `blank: ${blank.join(', ')}` : ''].filter(Boolean).join('  '));
    await ctx.close();
  }

  console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
  await b.close();
  process.exit(fails ? 1 : 0);
})();
