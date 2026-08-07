// Warm-up sets: the mark, and everything the mark has to stop counting toward.
//
// The UI half of this is one menu entry. The half that can actually be wrong
// is the arithmetic: a warm-up sits in the log alongside real work, and every
// place that reads sets has to agree it is not work. There are a lot of those
// places — tonnage, the muscle map, sets per week, PRs, e1RM, progression
// gates, the ramp suggestion, the finish-workout summary — and each one is an
// independent chance to credit preparation as training.
//
// So the tests here are mostly not about the toggle. They are about the six
// modules downstream of it giving the same answer to "does this count".
//
//   node tests/warmup-sets.js   (needs `python3 -m http.server 8199` at the repo root)
const { chromium } = require('/opt/node22/lib/node_modules/playwright/index.js');
const fs = require('fs');
const path = require('path');

let fails = 0;
const check = (label, ok, detail = '') => {
  if (!ok) fails++;
  console.log(`   ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
};

const ROOT = path.join(__dirname, '..');
const APP = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', hasTouch: true, isMobile: true });
  const page = await c.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERR: ' + e.message.slice(0, 200)));
  await page.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
  await page.waitForFunction(() => window.Storage && window.U && window.BodyMap && window.Progression);
  await page.evaluate(async () => {
    await Storage.clearAll();
    for (const [k, v] of Object.entries({
      onboarded: true, sex: 'male', dob: '1990-01-01', heightCm: 180, warmupPrompt: false
    })) await Storage.setPref(k, v);
  });
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(1600);
  await page.evaluate(() => document.querySelectorAll('.splash').forEach(n => n.remove()));

  console.log('=== 1. the shared predicate ===');
  {
    const r = await page.evaluate(() => {
      const sets = [
        { weight: 40, reps: 10, done: true, warmup: true },
        { weight: 100, reps: 5, done: true },
        { weight: 100, reps: 5, done: false }
      ];
      return {
        yes: U.isWarmup({ warmup: true }),
        no: U.isWarmup({ warmup: false }),
        missing: U.isWarmup({}),
        nullish: U.isWarmup(null),
        working: U.workingSets(sets).length,
        // volume has never filtered on done — callers hand it the sets they
        // mean. The only thing it drops is the warm-up: 1400 without the
        // rule, 1000 with it.
        volume: U.volume(sets),
        best: (U.bestSet(sets) || {}).weight
      };
    });
    check('isWarmup is true only for a marked set',
      r.yes === true && r.no === false && r.missing === false && r.nullish === false);
    check('workingSets keeps only done, non-warm-up sets', r.working === 1, `${r.working} of 3`);
    check('volume skips the warm-up', r.volume === 1000, `${r.volume} (1000 expected, 1400 if counted)`);
    check('bestSet never returns a warm-up', r.best === 100, `${r.best} kg`);
  }

  // A warm-up heavier than the work is the case that separates "excluded"
  // from "happens not to win": if the filter were missing, the 140 would take
  // both the best set and the e1RM.
  {
    const r = await page.evaluate(() => {
      const sets = [
        { weight: 140, reps: 3, done: true, warmup: true },
        { weight: 100, reps: 5, done: true }
      ];
      const best = U.bestSet(sets);
      return { w: best ? best.weight : null, vol: U.volume(sets) };
    });
    check('a heavy warm-up does not take the best set', r.w === 100, `${r.w} kg`);
    check('a heavy warm-up adds no tonnage', r.vol === 500, `${r.vol}`);
  }

  console.log('\n=== 2. the muscle map and sets per week ===');
  {
    const r = await page.evaluate(() => {
      const defs = { bench: { id: 'bench', name: 'Bench', category: 'chest', muscles: ['chest', 'triceps'] } };
      const mk = (sets) => ([{
        id: 'w1', date: U.todayISO(), completedAt: Date.now(),
        exercises: [{ exerciseId: 'bench', name: 'Bench', type: 'weighted', sets }]
      }]);
      const total = (h) => Object.values(h.sets || h).reduce((a, n) => a + n, 0);
      const onlyWarm = BodyMap.heatFromWorkouts(mk([
        { weight: 40, reps: 10, done: true, warmup: true },
        { weight: 60, reps: 5, done: true, warmup: true }
      ]), defs, 14);
      const mixed = BodyMap.heatFromWorkouts(mk([
        { weight: 40, reps: 10, done: true, warmup: true },
        { weight: 100, reps: 5, done: true },
        { weight: 100, reps: 5, done: true }
      ]), defs, 14);
      const workOnly = BodyMap.heatFromWorkouts(mk([
        { weight: 100, reps: 5, done: true },
        { weight: 100, reps: 5, done: true }
      ]), defs, 14);
      const sum = (h) => total(h.sets ? h.sets : h);
      return { onlyWarm: sum(onlyWarm), mixed: sum(mixed), workOnly: sum(workOnly) };
    });
    check('an exercise of nothing but warm-ups trains no muscle', r.onlyWarm === 0, `${r.onlyWarm}`);
    check('a mixed exercise counts only its working sets',
      r.mixed === r.workOnly && r.workOnly > 0, `mixed ${r.mixed} vs work-only ${r.workOnly}`);
  }

  console.log('\n=== 3. progression gates ===');
  {
    const r = await page.evaluate(() => {
      const gate = { sets: 1, reps: 5 };
      const meetsWarm = Progression.sessionMeets([{ reps: 8, done: true, warmup: true }], gate);
      const meetsWork = Progression.sessionMeets([{ reps: 8, done: true }], gate);
      const bestWarm = Progression.bestEffort([{ date: '2026-01-01', sets: [
        { reps: 12, done: true, warmup: true }, { reps: 4, done: true }
      ] }], gate);
      return { meetsWarm, meetsWork, bestScore: bestWarm ? bestWarm.score : null };
    });
    check('a warm-up cannot clear a rung', r.meetsWarm === false);
    check('the same set as work does clear it', r.meetsWork === true,
      'the gate itself must still be satisfiable, or the test above proves nothing');
    check('bestEffort reports the working effort, not the warm-up', r.bestScore === 4, `${r.bestScore} reps`);
  }

  console.log('\n=== 4. the row, in a live session ===');
  {
    // Seed the session rather than driving the picker: this suite is about
    // what the row does with a warm-up, not about navigation.
    await page.evaluate(async () => {
      const w = {
        id: 'wu-live', name: 'Warm-up test', date: U.todayISO(), startedAt: Date.now(),
        exercises: [{
          exerciseId: 'bench-press-barbell', name: 'Bench', type: 'weighted', category: 'chest',
          sets: [
            { weight: 40, reps: 10, done: true },
            { weight: 100, reps: 5, done: true },
            { weight: 100, reps: 5, done: true }
          ]
        }]
      };
      await Storage.saveWorkout(w);
      await Storage.setPref('activeWorkoutId', w.id);
    });
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(2200);
    await page.evaluate(() => document.querySelectorAll('.splash,.qa-fork-overlay').forEach(n => n.remove()));
    // Home shows the resume card; the rows live inside the session it opens.
    const opened = await page.evaluate(() => {
      const card = document.querySelector('.home-active-workout');
      const btn = card && card.querySelector('.btn-primary');
      if (btn) btn.click();
      return !!btn;
    });
    check('the seeded session offers a resume', opened);
    await page.waitForTimeout(1600);
    await page.evaluate(() => document.querySelectorAll('.splash,.qa-fork-overlay').forEach(n => n.remove()));

    // [data-testid] rather than .set-row: the header carries the same class
    // and would shift every index by one.
    const readRows = () => page.evaluate(() =>
      [...document.querySelectorAll('[data-testid^="set-row-"]')].map(r => ({
        idx: (r.querySelector('.set-index') || {}).textContent,
        warm: r.classList.contains('is-warmup')
      })));

    const before = await readRows();
    check('three set rows are on screen', before.length >= 3, `${before.length} rows`);
    check('they number 1, 2, 3 before anything is marked',
      before.slice(0, 3).map(r => r.idx).join(',') === '1,2,3',
      before.slice(0, 3).map(r => r.idx).join(','));

    // Mark the first set as a warm-up through the menu the user actually has.
    // Real pointer input, because the radial listens on pointerdown and a
    // synthesised TouchEvent never reaches it.
    const box = await page.evaluate(() => {
      const more = document.querySelector('[data-testid="set-row-0"] .set-more-btn');
      if (!more) return null;
      more.scrollIntoView({ block: 'center' });
      const r = more.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    check('the set row has a "···" to hold', !!box);
    let marked = 'no button';
    if (box) {
      await page.mouse.move(box.x, box.y);
      await page.mouse.down();
      await page.waitForTimeout(700);
      const slice = await page.$('[data-testid="radial-warmup"]');
      marked = slice ? 'ok' : 'no warm-up slice';
      if (slice) {
        // The gesture is hold, slide onto the slice, release — so drag the
        // held pointer there rather than clicking, which would need a second
        // press the trigger has already captured.
        const sb = await slice.boundingBox();
        await page.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2, { steps: 8 });
        await page.waitForTimeout(120);
      }
      await page.mouse.up();
      await page.waitForTimeout(900);
    }
    check('the menu offers Warm-up', marked === 'ok', marked);

    await page.evaluate(() => document.querySelectorAll('.radial-overlay').forEach(n => n.remove()));
    const after = await readRows();
    check('the marked row carries is-warmup', !!(after[0] && after[0].warm));
    check('the marked row reads W, not a number', after[0] && after[0].idx === 'W', after[0] && after[0].idx);
    check('the working sets renumber to 1 and 2',
      after.slice(1, 3).map(r => r.idx).join(',') === '1,2',
      after.slice(1, 3).map(r => r.idx).join(','));

    const stored = await page.evaluate(async () => {
      const w = await Storage.getWorkout('wu-live');
      const sets = w.exercises[0].sets;
      return { warm: !!sets[0].warmup, rest: sets.slice(1).some(s => s.warmup) };
    });
    check('the mark survives to storage', stored.warm === true && stored.rest === false);
  }

  console.log('\n=== 5. no record is claimed by preparation ===');
  {
    // The rule that matters most, and the one worth logging a real set for: a
    // warm-up heavier than anything in your history must still take no record.
    // Both sets below are identical apart from the mark, so the second one
    // proves the first is being refused rather than simply not qualifying.
    const logAt = async (warm, weight) => page.evaluate(async ({ warm, weight }) => {
      const w = await Storage.getWorkout('wu-live');
      const ex = w.exercises[0];
      ex.sets.push({ weight, reps: 3, done: false, warmup: warm });
      await Storage.saveWorkout(w);
      return ex.sets.length - 1;
    }, { warm, weight });

    // Resuming can raise the guided runner over the list. Clear it and click
    // the row's own button: the PR rule is what this section is about, not
    // which surface the tap came from.
    const tapDone = async (si) => {
      const hit = await page.evaluate((i) => {
        document.querySelectorAll('.srun,.radial-overlay').forEach(n => n.remove());
        const btn = document.querySelector(`[data-testid="set-done-${i}"]`);
        if (!btn) return false;
        btn.click();
        return true;
      }, si);
      await page.waitForTimeout(1100);
      return hit;
    };
    const prOf = (si) => page.evaluate(async (i) => {
      const w = await Storage.getWorkout('wu-live');
      const s = w.exercises[0].sets[i];
      return { isPR: !!s.isPR, types: (s.prTypes || []).join(','), done: !!s.done };
    }, si);

    const wi = await logAt(true, 220);
    await page.evaluate(() => location.reload());
    await page.waitForTimeout(2400);
    await page.evaluate(() => document.querySelectorAll('.splash').forEach(n => n.remove()));
    await page.evaluate(() => {
      const btn = document.querySelector('.home-active-workout .btn-primary');
      if (btn) btn.click();
    });
    await page.waitForTimeout(1600);
    await tapDone(wi);
    const warmPR = await prOf(wi);
    check('the warm-up set was actually logged', warmPR.done,
      'if it never logged, the PR check below proves nothing');
    check('a 220 kg warm-up takes no record', warmPR.isPR === false, warmPR.types || 'none');

    const ki = await logAt(false, 220);
    await page.evaluate(() => location.reload());
    await page.waitForTimeout(2400);
    await page.evaluate(() => document.querySelectorAll('.splash').forEach(n => n.remove()));
    await page.evaluate(() => {
      const btn = document.querySelector('.home-active-workout .btn-primary');
      if (btn) btn.click();
    });
    await page.waitForTimeout(1600);
    await tapDone(ki);
    const workPR = await prOf(ki);
    check('the same 220 kg as work does take one', workPR.isPR === true, workPR.types || 'none');

    // And marking a set warm-up after the fact hands back what it already had.
    const handedBack = await page.evaluate(async (i) => {
      const w = await Storage.getWorkout('wu-live');
      const s = w.exercises[0].sets[i];
      if (!s.isPR) return 'nothing to hand back';
      return null;
    }, ki);
    check('there is a record to hand back', handedBack === null, handedBack);
    const box2 = await page.evaluate((i) => {
      const more = document.querySelector(`[data-testid="set-row-${i}"] .set-more-btn`);
      if (!more) return null;
      more.scrollIntoView({ block: 'center' });
      const r = more.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }, ki);
    if (box2) {
      await page.mouse.move(box2.x, box2.y);
      await page.mouse.down();
      await page.waitForTimeout(700);
      const slice = await page.$('[data-testid="radial-warmup"]');
      if (slice) {
        const sb = await slice.boundingBox();
        await page.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2, { steps: 8 });
        await page.waitForTimeout(120);
      }
      await page.mouse.up();
      await page.waitForTimeout(900);
    }
    const afterMark = await prOf(ki);
    check('marking it warm gives the record back',
      afterMark.isPR === false && afterMark.types === '', afterMark.types || 'cleared');
  }

  console.log('\n=== 6. nothing downstream still counts a raw done set ===');
  {
    // The failure this catches is a new counter added later that filters on
    // `.done` alone. Every set counter that feeds a training number has to
    // consult the predicate; this asserts the ones that exist do.
    // Anchored on `.sets`, so the settings setup checklist — which also has
    // done steps, and nothing to do with training — is not swept in.
    const raw = [];
    APP.split('\n').forEach((line, i) => {
      if (!/\.sets\s*\|\|\s*\[\]\)\.filter\(\s*\(?\s*[a-z]\)?\s*=>\s*[a-z]\.done\s*\)\.length/.test(line)) return;
      if (/warmup|workingSets/.test(line)) return;
      raw.push(i + 1);
    });
    check('no training count filters on done alone', raw.length === 0,
      raw.length ? `lines ${raw.join(', ')}` : 'all go through workingSets');

    const usesShared = (APP.match(/U\.workingSets\(/g) || []).length;
    check('workingSets is the shared counter', usesShared >= 4, `${usesShared} call sites`);
  }

  check('no page errors', errs.length === 0, errs.slice(0, 2).join(' | '));

  await c.close();
  await b.close();
  console.log(`\n${fails === 0 ? 'ALL PASS' : fails + ' FAILED'}`);
  process.exit(fails === 0 ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
