// Movement ladders: the data, the gate rules, and where they put you.
//
// Two failures matter more than the rest.
//
// The first is dead data. A rung pointing at an exercise that does not exist
// renders as a blank row and can never be cleared, and 408 of the DB's
// existing `variations` strings are already exactly that kind of dangling
// reference. Section 1 resolves every rung and every prerequisite.
//
// The second is a gate the app cannot actually check. The whole model rests on
// gates being answerable from a logged set — reps, seconds, weight, done. The
// moment one asks for "clean form" it becomes a gate that opens itself, and
// the ladder is lying about what it knows. Section 1 enforces the vocabulary.
//
//   node tests/progression.js   (needs `python3 -m http.server 8199` at the root)
const path = require('path');
const fs = require('fs');

let fails = 0;
const check = (label, ok, detail = '') => {
  if (!ok) fails++;
  console.log(`   ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
};

const ROOT = path.resolve(__dirname, '..');
const G = {};
const load = (rel) => new Function('window', fs.readFileSync(path.join(ROOT, rel), 'utf8'))(G);
load('data/exercises.js');
load('data/progressions.js');
load('js/progression.js');
global.window = G;
const P = G.Progression;
const CHAINS = G.PROGRESSIONS;
const DB = G.EXERCISE_DB;
const byId = (id) => DB.find((e) => e.id === id);

// ================= 1. the data holds together =================
console.log('=== 1. every rung is a real exercise, every gate is checkable ===');
{
  check('chains loaded', CHAINS.length >= 5, `${CHAINS.length}`);
  check('ids are unique', new Set(CHAINS.map((c) => c.id)).size === CHAINS.length);
  check('every chain names itself and what it is for',
    CHAINS.every((c) => c.id && c.name && c.pattern && c.oneLiner && c.rungs && c.rungs.length >= 3));

  // The dangling-reference check. This is the one that would silently rot.
  const dangling = [];
  for (const c of CHAINS) {
    for (const r of c.rungs) {
      if (!byId(r.exerciseId)) dangling.push(`${c.id}:${r.exerciseId}`);
      for (const req of r.requires || []) if (!byId(req)) dangling.push(`${c.id}:requires:${req}`);
    }
  }
  check('every rung resolves to a real exercise', dangling.length === 0, dangling.join(', '));

  // A prerequisite must itself be a rung somewhere, or nothing can ever clear it.
  const allRungIds = new Set(CHAINS.flatMap((c) => c.rungs.map((r) => r.exerciseId)));
  const unreachable = CHAINS.flatMap((c) => c.rungs.flatMap((r) => (r.requires || [])))
    .filter((id) => !allRungIds.has(id));
  check('every prerequisite is a rung on some chain', unreachable.length === 0, unreachable.join(', '));

  // The gate vocabulary. Four shapes, no others.
  const ALLOWED = new Set(['sets', 'reps', 'holdSec', 'addedKg']);
  const badKeys = [];
  const badShape = [];
  for (const c of CHAINS) {
    for (const r of c.rungs) {
      if (!r.gate) { badShape.push(`${c.id}:${r.exerciseId}:no gate`); continue; }
      for (const k of Object.keys(r.gate)) if (!ALLOWED.has(k)) badKeys.push(`${c.id}:${r.exerciseId}:${k}`);
      const hasReps = r.gate.reps != null, hasHold = r.gate.holdSec != null;
      if (hasReps === hasHold) badShape.push(`${c.id}:${r.exerciseId}: needs exactly one of reps/holdSec`);
      if (!(r.gate.sets >= 1)) badShape.push(`${c.id}:${r.exerciseId}: sets must be at least 1`);
    }
  }
  check('no gate asks for anything outside the vocabulary', badKeys.length === 0, badKeys.join(', '));
  check('every gate is a well-formed shape', badShape.length === 0, badShape.join(', '));

  // A hold gate on a rep exercise (or vice versa) can never be satisfied,
  // because the set record will not carry the field the gate reads.
  const mismatched = [];
  for (const c of CHAINS) {
    for (const r of c.rungs) {
      const def = byId(r.exerciseId);
      if (!def) continue;
      const isHold = def.type === 'hold';
      if (isHold && r.gate.reps != null) mismatched.push(`${r.exerciseId}: hold exercise with a reps gate`);
      if (!isHold && r.gate.holdSec != null) mismatched.push(`${r.exerciseId}: rep exercise with a hold gate`);
    }
  }
  check('gates match the kind of set the exercise records', mismatched.length === 0, mismatched.join(', '));

  // Rungs should get harder. Not checkable in general, but a chain that
  // repeats an exercise is certainly wrong.
  const repeats = CHAINS.filter((c) => new Set(c.rungs.map((r) => r.exerciseId)).size !== c.rungs.length);
  check('no chain lists the same exercise twice', repeats.length === 0, repeats.map((c) => c.id).join(', '));

  // Notes are guidance, not conditions. If one reads like a gate the app is
  // implying a check it does not perform.
  const notes = CHAINS.flatMap((c) => c.rungs.map((r) => r.note).filter(Boolean));
  check('rung notes exist where the form is the real limit', notes.length >= 10, `${notes.length} notes`);
}

// ================= 2. the gate rules =================
console.log('\n=== 2. what clears a rung ===');
{
  const rep = (r, n, extra = {}) => Array.from({ length: n }, () => ({ reps: r, weight: 0, done: true, ...extra }));
  const hold = (sec, n) => Array.from({ length: n }, () => ({ seconds: sec, done: true }));

  check('three sets of eight clears a 3×8 gate', P.sessionMeets(rep(8, 3), { sets: 3, reps: 8 }));
  check('three sets of nine also clears it', P.sessionMeets(rep(9, 3), { sets: 3, reps: 8 }));
  check('two sets of eight does not', !P.sessionMeets(rep(8, 2), { sets: 3, reps: 8 }));
  check('three sets of seven does not', !P.sessionMeets(rep(7, 3), { sets: 3, reps: 8 }));
  check('four sets where only two reached eight does not',
    !P.sessionMeets([...rep(8, 2), ...rep(6, 2)], { sets: 3, reps: 8 }));
  check('unfinished sets do not count',
    !P.sessionMeets(rep(8, 3).map((s) => ({ ...s, done: false })), { sets: 3, reps: 8 }));

  check('a 45s hold gate reads seconds, not reps', P.sessionMeets(hold(50, 2), { sets: 2, holdSec: 45 }));
  check('and a short hold does not clear it', !P.sessionMeets(hold(30, 2), { sets: 2, holdSec: 45 }));
  check('reps cannot satisfy a hold gate', !P.sessionMeets(rep(60, 3), { sets: 2, holdSec: 45 }));

  check('a loaded gate checks the weight too',
    P.sessionMeets(rep(5, 3, { weight: 25 }), { sets: 3, reps: 5, addedKg: 20 }));
  check('and refuses an unloaded session',
    !P.sessionMeets(rep(5, 3), { sets: 3, reps: 5, addedKg: 20 }));

  check('gate prose matches the rule',
    P.gateText({ sets: 3, reps: 8 }) === '3 × 8' &&
    P.gateText({ sets: 2, holdSec: 45 }) === '2 sets of 45s' &&
    P.gateText({ sets: 1, reps: 1 }) === '1 rep',
    [P.gateText({ sets: 3, reps: 8 }), P.gateText({ sets: 2, holdSec: 45 }), P.gateText({ sets: 1, reps: 1 })].join(' | '));
}

// ================= 3. walking a chain =================
console.log('\n=== 3. where your logs put you ===');
{
  const day = (n) => `2026-07-${String(31 - n).padStart(2, '0')}`;
  const w = (n, exerciseId, sets) => ({
    id: 'w' + n + exerciseId, date: day(n), completedAt: 1,
    exercises: [{ exerciseId, sets }]
  });
  const rep = (r, n) => Array.from({ length: n }, () => ({ reps: r, weight: 0, done: true }));
  const hold = (sec, n) => Array.from({ length: n }, () => ({ seconds: sec, done: true }));

  const chain = P.byId('vertical-pull');
  check('the vertical pull chain exists', !!chain);

  const empty = P.evaluate(chain, []);
  check('with no history the first rung is current', empty.rows[0].state === 'current', empty.rows[0].state);
  check('and nothing is cleared', empty.clearedCount === 0);
  check('the summary says so', /nothing logged yet/.test(P.summary(empty)), P.summary(empty));

  const history = [
    w(8, 'dead-hang', hold(50, 2)),
    w(6, 'inverted-row', rep(12, 3)),
    w(4, 'negative-pull-up', rep(5, 3)),
    w(2, 'pull-up', rep(6, 3))            // a near miss: gate is 3×8
  ];
  const v = P.evaluate(chain, history);
  const state = (id) => v.rows.find((r) => r.exerciseId === id).state;
  check('cleared rungs are cleared', state('dead-hang') === 'cleared' && state('inverted-row') === 'cleared'
    && state('negative-pull-up') === 'cleared');
  check('the near miss is the current rung', state('pull-up') === 'current', state('pull-up'));
  check('rungs beyond it are locked', state('chest-to-bar-pull-up') === 'locked');
  check('the count is right', v.clearedCount === 3 && v.total === 7, `${v.clearedCount}/${v.total}`);

  // The DAG. The muscle-up needs a dip from a different chain entirely.
  check('the muscle-up is blocked, not merely locked', state('muscle-up') === 'blocked', state('muscle-up'));
  const mu = v.rows.find((r) => r.exerciseId === 'muscle-up');
  check('and it names what is missing',
    mu.missing.length === 1 && mu.missing[0] === 'straight-bar-dip', mu.missing.join(', '));

  // Clear the dip chain's top rung and the block should lift.
  const withDip = [...history, w(3, 'straight-bar-dip', rep(5, 3))];
  const v2 = P.evaluate(chain, withDip);
  const mu2 = v2.rows.find((r) => r.exerciseId === 'muscle-up');
  check('clearing the prerequisite unblocks it', mu2.state !== 'blocked' && mu2.missing.length === 0, mu2.state);

  // A near miss should be reportable as one.
  const pu = v.rows.find((r) => r.exerciseId === 'pull-up');
  check('the near miss carries the best session', pu.best && pu.best.score === 6 && pu.best.sets === 3,
    JSON.stringify(pu.best));
  check('and does not claim any qualifying sets', pu.best.count === 0, String(pu.best.count));

  // Out-of-order logging must not un-earn anything.
  const skipped = [w(2, 'pull-up', rep(10, 3))];
  const v3 = P.evaluate(chain, skipped);
  check('a pull-up logged before the lower rungs still counts',
    v3.rows.find((r) => r.exerciseId === 'pull-up').cleared);
  check('and the first uncleared rung below it becomes current',
    v3.rows[0].state === 'current', v3.rows[0].state);

  // Every rung cleared.
  const all = chain.rungs.map((r, i) => w(i + 1, r.exerciseId,
    r.gate.holdSec ? hold(r.gate.holdSec + 5, r.gate.sets) : rep(r.gate.reps + 2, r.gate.sets)));
  all.push(w(20, 'straight-bar-dip', rep(7, 3)));
  const v4 = P.evaluate(chain, all);
  check('a fully cleared chain reports done', v4.done && !v4.current, `done=${v4.done}`);
  check('and says so', /All 7 rungs cleared/.test(P.summary(v4)), P.summary(v4));

  check('every chain evaluates without throwing on an empty history',
    CHAINS.every((c) => { try { return !!P.evaluate(c, []); } catch (_) { return false; } }));
}

// ================= the app =================
const { chromium } = require('/opt/node22/lib/node_modules/playwright/index.js');
const SS = process.env.FITFORGE_SHOTS || path.resolve(ROOT, '.shots');
try { fs.mkdirSync(SS, { recursive: true }); } catch (_) {}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', hasTouch: true });
  const page = await c.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push('PAGEERR: ' + e.message));

  await page.goto('http://localhost:8199/index.html', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.Storage && window.Progression);
  await page.evaluate(async () => {
    await Storage.clearAll();
    for (const [k, v] of Object.entries({
      onboarded: true, sex: 'male', dob: '1992-03-04', heightCm: 180, activityLevel: 'light', kcalGoal: 2200
    })) await Storage.setPref(k, v);
    await Storage.saveBodyweight({ date: U.todayISO(), kg: 82 });
    const day = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return U.todayISO(d); };
    const mk = (n, id, sets) => ({ id: 'w' + n, name: 'S', date: day(n), startedAt: 1,
      completedAt: Date.now() - n * 86400000, durationSec: 600, exercises: [{ exerciseId: id, name: id, sets }] });
    const rep = (r, k) => Array.from({ length: k }, () => ({ reps: r, weight: 0, done: true }));
    const hold = (s, k) => Array.from({ length: k }, () => ({ seconds: s, done: true }));
    await Storage.saveWorkout(mk(8, 'dead-hang', hold(50, 2)));
    await Storage.saveWorkout(mk(6, 'inverted-row', rep(12, 3)));
    await Storage.saveWorkout(mk(4, 'negative-pull-up', rep(5, 3)));
    await Storage.saveWorkout(mk(2, 'pull-up', rep(6, 3)));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2600);

  console.log('\n=== 4. the ladder on the exercise page ===');
  await page.evaluate(() => document.querySelector('[data-testid="dock-library"]').click());
  await page.waitForTimeout(700);
  await page.evaluate(() => document.querySelector('[data-testid="learn-fork-centre"]').click());
  await page.waitForTimeout(1600);
  await page.evaluate(() => {
    const s = [...document.querySelectorAll('input')].find((i) => /search/i.test(i.placeholder || ''));
    s.value = 'pull-up'; s.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.waitForTimeout(900);
  await page.evaluate(() => document.querySelector('[data-ex-id="pull-up"]')?.click());
  await page.waitForTimeout(1500);

  check('the ladder appears on a charted exercise', !!(await page.$('[data-testid="ladder-section"]')));
  const chip = await page.$eval('[data-testid="ladder-progress"]', (e) => e.textContent).catch(() => '');
  check('with the progress on it', /3 of 7 rungs cleared/.test(chip), chip);
  const rungs = await page.$$eval('[data-testid="ladder-rung"]',
    (ns) => ns.map((n) => `${n.dataset.rung}:${n.dataset.state}`));
  check('every rung is drawn', rungs.length === 7, rungs.length + '');
  check('states reach the DOM', rungs.join(' ').includes('pull-up:current'), rungs.join(' '));
  const here = await page.$$eval('.ladder-here', (n) => n.length);
  check('the exercise you opened is marked', here === 1, String(here));
  const best = await page.$eval('.ladder-best', (e) => e.textContent).catch(() => '');
  check('the near miss reads as a real session, not "0 × 6"',
    /3 sets, best 6 reps/.test(best), best || '(none)');
  const blocked = await page.$eval('[data-rung="muscle-up"] .ladder-note', (e) => e.textContent).catch(() => '');
  check('the muscle-up names its prerequisite', /Straight-Bar Dip/i.test(blocked), blocked || '(none)');
  await page.evaluate(() => document.querySelector('[data-testid="ladder-section"]')?.scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${SS}/ladder.png` });

  // An exercise on no chain must not grow an empty section.
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  await page.evaluate(() => {
    const s = [...document.querySelectorAll('input')].find((i) => /search/i.test(i.placeholder || ''));
    s.value = 'lateral raise'; s.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.waitForTimeout(900);
  await page.evaluate(() => document.querySelector('[data-ex-id="lateral-raise"]')?.click());
  await page.waitForTimeout(1400);
  check('an uncharted exercise shows no ladder', !(await page.$('[data-testid="ladder-section"]')));

  console.log('\nERRORS:', errs.length ? errs : 'none');
  console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
