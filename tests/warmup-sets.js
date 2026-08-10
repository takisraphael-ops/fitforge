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

  console.log('\n=== 6. the ramp becomes W rows, and the card can pull one ===');
  {
    // The pre-session sheet computes a ramp into your first lift and used to
    // throw it away. This drives the real route: history at 100 kg → start a
    // session through the picker → the sheet appears → one tap logs the ramp
    // as warm-up sets. Then the card's own "+ Warm-up" for everything else.
    await page.evaluate(async () => {
      await Storage.clearAll();
      for (const [k, v] of Object.entries({
        onboarded: true, sex: 'male', dob: '1990-01-01', heightCm: 180, guidedSets: false
      })) await Storage.setPref(k, v);
      const d = new Date(); d.setDate(d.getDate() - 3);
      await Storage.saveWorkout({
        id: 'h1', name: 'Push', date: U.todayISO(d), startedAt: d.getTime(),
        completedAt: d.getTime() + 3600e3,
        exercises: [{ exerciseId: 'bench-press-barbell', name: 'Barbell Bench Press', type: 'weighted',
          sets: [{ weight: 100, reps: 5, done: true }] }]
      });
    });
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(2400);
    await page.evaluate(() => document.querySelectorAll('.splash').forEach(n => n.remove()));

    await page.evaluate(() => document.querySelector('[data-testid="dock-fab"]').click());
    await page.waitForTimeout(900);
    await page.evaluate(() => document.querySelector('[data-testid="quick-start-workout"]')?.click());
    await page.waitForTimeout(2400);
    await page.evaluate(() => {
      const inp = document.querySelector('input[aria-label="Search exercises to add"]');
      if (!inp) return;
      inp.value = 'barbell bench';
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.waitForTimeout(700);
    await page.evaluate(() => {
      [...document.querySelectorAll('.xrow')].find(r => /Barbell Bench Press/i.test(r.textContent))?.click();
    });
    await page.waitForTimeout(500);
    await page.evaluate(() => document.querySelector('[data-testid="xpick-cta"]')?.click());
    await page.waitForTimeout(2600);

    const sheet = await page.evaluate(() => ({
      up: !!document.querySelector('[data-testid="warmup"]'),
      btn: !!document.querySelector('[data-testid="warmup-log-ramp"]')
    }));
    check('the pre-session sheet offers to log its ramp', sheet.up && sheet.btn, JSON.stringify(sheet));

    await page.evaluate(() => document.querySelector('[data-testid="warmup-log-ramp"]')?.click());
    await page.waitForTimeout(900);
    const logged = await page.evaluate(async () => {
      const id = await Storage.getPref('activeWorkoutId', null);
      const w = id ? await Storage.getWorkout(id) : null;
      const sets = w ? w.exercises[0].sets : [];
      const btn = document.querySelector('[data-testid="warmup-log-ramp"]');
      return {
        shape: sets.map(s => `${s.weight ?? '·'}${s.warmup ? 'W' : ''}`).join(','),
        warmCount: sets.filter(s => s.warmup).length,
        // Ramp weights must sit below the working weight they build to.
        underWorking: sets.filter(s => s.warmup).every(s => s.weight > 0 && s.weight < 100),
        undone: sets.filter(s => s.warmup).every(s => !s.done),
        disabled: btn ? btn.disabled : null
      };
    });
    check('one tap writes the ramp in as warm-up sets', logged.warmCount === 3, logged.shape);
    check('every ramp set is under the working weight and unticked',
      logged.underWorking && logged.undone, logged.shape);
    check('the button spends itself, so a second tap stacks nothing', logged.disabled === true);
    await page.evaluate(() => document.querySelector('[data-testid="warmup-log-ramp"]')?.click());
    await page.waitForTimeout(500);
    const stacked = await page.evaluate(async () => {
      const id = await Storage.getPref('activeWorkoutId', null);
      return (await Storage.getWorkout(id)).exercises[0].sets.length;
    });
    check('and the set count holds', stacked === 4, `${stacked} sets`);

    await page.evaluate(() => document.querySelector('[data-testid="warmup-go"]')?.click());
    await page.waitForTimeout(900);
    const rows = await page.evaluate(() =>
      [...document.querySelectorAll('[data-testid^="set-row-"]')].map(r =>
        (r.querySelector('.set-index') || {}).textContent).join(','));
    check('the card reads W,W,W,1', rows === 'W,W,W,1', rows);

    // The card's own pull, for exercises the ramp never reaches. It lands
    // after the warm-ups, never in the middle of the work.
    await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="add-warmup-set"]');
      btn?.scrollIntoView({ block: 'center' });
      btn?.click();
    });
    await page.waitForTimeout(900);
    const pulled = await page.evaluate(async () => {
      const id = await Storage.getPref('activeWorkoutId', null);
      const sets = (await Storage.getWorkout(id)).exercises[0].sets;
      return {
        shape: sets.map(s => (s.warmup ? 'W' : 'k')).join(''),
        blank: sets[3] && sets[3].warmup && sets[3].weight == null && !sets[3].done
      };
    });
    check('"+ Warm-up" inserts after the warm-ups, before the work', pulled.shape === 'WWWWk', pulled.shape);
    check('and arrives blank and unticked', pulled.blank === true);

    // A warm-up must not auto-open the tools tray — three ramp rows each
    // dragging one open would bury the working sets in chrome.
    const trays = await page.evaluate(() =>
      [...document.querySelectorAll('[data-testid^="set-row-"]')]
        .filter(r => r.classList.contains('has-tools-open')).length);
    check('warm-up rows keep their tools tray shut', trays === 0, `${trays} open`);
  }

  console.log('\n=== 7. holds and intervals carry the mark too ===');
  {
    // The mark matters most on holds — the movement ladders gate on hold
    // seconds, so an easy 20s before a max dead hang must not read as the
    // attempt. These rows have no tools tray, so their "···" opens the menu
    // on a press rather than a hold.
    await page.evaluate(async () => {
      await Storage.clearAll();
      for (const [k, v] of Object.entries({
        onboarded: true, sex: 'male', dob: '1990-01-01', heightCm: 180,
        guidedSets: false, warmupPrompt: false, radialDiscovered: true
      })) await Storage.setPref(k, v);
      await Storage.saveWorkout({
        id: 'hw', name: 'Hang day', date: U.todayISO(), startedAt: Date.now(),
        exercises: [
          { exerciseId: 'dead-hang', name: 'Dead Hang', type: 'hold',
            sets: [{ seconds: 20, done: true }, { seconds: 45, done: true }] },
          { exerciseId: 'assault-bike', name: 'Bike', type: 'interval',
            sets: [{ seconds: 30, intensity: 'easy', done: false }, { seconds: 60, intensity: 'hard', done: false }] }
        ]
      });
      await Storage.setPref('activeWorkoutId', 'hw');
    });
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(2400);
    await page.evaluate(() => document.querySelectorAll('.splash').forEach(n => n.remove()));
    await page.evaluate(() => document.querySelector('.home-active-workout .btn-primary')?.click());
    await page.waitForTimeout(1600);

    // Press the ··· on a row inside a given exercise block, slide to a slice.
    const pressPick = async (exIdx, rowIdx, sliceId) => {
      const box = await page.evaluate(({ exIdx, rowIdx }) => {
        const blk = document.querySelector(`.exercise-block[data-ex-idx="${exIdx}"]`);
        const btn = blk && blk.querySelector(`[data-testid="set-row-${rowIdx}"] .set-more-btn`);
        if (!btn) return null;
        btn.scrollIntoView({ block: 'center' });
        const r = btn.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }, { exIdx, rowIdx });
      if (!box) return { ok: false, why: 'no ··· on the row' };
      await page.mouse.move(box.x, box.y);
      await page.mouse.down();
      await page.waitForTimeout(400);
      const slices = await page.evaluate(() =>
        [...document.querySelectorAll('.radial-slice')].map(n => n.dataset.testid));
      const sb = await page.evaluate((id) => {
        const s = document.querySelector(`[data-testid="${id}"]`);
        if (!s) return null;
        const r = s.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }, sliceId);
      if (sb) { await page.mouse.move(sb.x, sb.y, { steps: 8 }); await page.waitForTimeout(120); }
      await page.mouse.up();
      await page.waitForTimeout(900);
      return { ok: !!sb, slices };
    };
    const rowsOf = (exIdx) => page.evaluate((i) => {
      const blk = document.querySelector(`.exercise-block[data-ex-idx="${i}"]`);
      return [...blk.querySelectorAll('[data-testid^="set-row-"]')].map(r => ({
        idx: (r.querySelector('.set-index') || {}).textContent,
        warm: r.classList.contains('is-warmup')
      }));
    }, exIdx);

    const hold = await pressPick(0, 0, 'radial-warmup');
    check('a press on the hold row\'s ··· offers Warm-up and Delete',
      hold.ok && JSON.stringify(hold.slices) === '["radial-warmup","radial-delete"]',
      JSON.stringify(hold.slices || hold.why));
    const holdRows = await rowsOf(0);
    check('the warm-up hold reads W and the max attempt renumbers to 1',
      JSON.stringify(holdRows) === '[{"idx":"W","warm":true},{"idx":"1","warm":false}]',
      JSON.stringify(holdRows));

    const ivl = await pressPick(1, 0, 'radial-warmup');
    check('a press on the interval row\'s ··· offers Warm-up',
      ivl.ok && JSON.stringify(ivl.slices) === '["radial-warmup"]',
      JSON.stringify(ivl.slices || ivl.why));
    const ivlRows = await rowsOf(1);
    check('the warm-up effort reads W and the work renumbers',
      JSON.stringify(ivlRows) === '[{"idx":"W","warm":true},{"idx":"1","warm":false}]',
      JSON.stringify(ivlRows));

    const stored = await page.evaluate(async () => {
      const w = await Storage.getWorkout('hw');
      return w.exercises.map(e => e.sets.map(s => !!s.warmup).join(','));
    });
    check('both marks survive to storage',
      JSON.stringify(stored) === '["true,false","true,false"]', JSON.stringify(stored));
  }

  console.log('\n=== 8. records read history around the warm-ups ===');
  {
    // getPRsFor sums records out of saved history, and a done warm-up lives
    // in that history. Without the guard, a 220 kg ramp set in last week's
    // log raises maxWeight — and today's genuine 200 kg lift, a real PR over
    // the real 100 kg best, is silently denied its badge.
    await page.evaluate(async () => {
      await Storage.clearAll();
      for (const [k, v] of Object.entries({
        onboarded: true, sex: 'male', dob: '1990-01-01', heightCm: 180,
        guidedSets: false, warmupPrompt: false, radialDiscovered: true
      })) await Storage.setPref(k, v);
      const d = new Date(); d.setDate(d.getDate() - 5);
      await Storage.saveWorkout({
        id: 'past', name: 'Push', date: U.todayISO(d), startedAt: d.getTime(),
        completedAt: d.getTime() + 3600e3,
        exercises: [{ exerciseId: 'bench-press-barbell', name: 'Bench', type: 'weighted',
          sets: [
            { weight: 220, reps: 1, done: true, warmup: true },
            { weight: 100, reps: 5, done: true }
          ] }]
      });
      await Storage.saveWorkout({
        id: 'now', name: 'Push', date: U.todayISO(), startedAt: Date.now(),
        exercises: [{ exerciseId: 'bench-press-barbell', name: 'Bench', type: 'weighted',
          sets: [{ weight: 200, reps: 1, done: false }] }]
      });
      await Storage.setPref('activeWorkoutId', 'now');
    });
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(2400);
    await page.evaluate(() => document.querySelectorAll('.splash').forEach(n => n.remove()));
    await page.evaluate(() => document.querySelector('.home-active-workout .btn-primary')?.click());
    await page.waitForTimeout(1600);
    await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="set-done-0"]');
      btn?.scrollIntoView({ block: 'center' });
      btn?.click();
    });
    await page.waitForTimeout(1200);
    const pr = await page.evaluate(async () => {
      const w = await Storage.getWorkout('now');
      const s = w.exercises[0].sets[0];
      return { isPR: !!s.isPR, types: (s.prTypes || []).join(',') };
    });
    check('a real 200 beats the real 100, despite a 220 warm-up in history',
      pr.isPR === true && pr.types.includes('weight'), JSON.stringify(pr));

    // The learning centre's per-exercise stats read the same history through
    // a second door. A 90s warm-up hold must not become "best hold 90s".
    await page.evaluate(async () => {
      const d = new Date(); d.setDate(d.getDate() - 2);
      await Storage.setPref('activeWorkoutId', null);
      await Storage.saveWorkout({
        id: 'mob', name: 'Stretch', date: U.todayISO(d), startedAt: d.getTime(),
        completedAt: d.getTime() + 1800e3,
        exercises: [{ exerciseId: 'mob-pigeon', name: 'Pigeon Pose', type: 'hold',
          sets: [
            { seconds: 90, done: true, warmup: true },
            { seconds: 45, done: true }
          ] }]
      });
    });
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(2400);
    await page.evaluate(() => document.querySelectorAll('.splash,[data-testid="tab-loader"]').forEach(n => n.remove()));
    // The Learn dock button forks first: Learning Centre or body map.
    await page.evaluate(() => document.querySelector('[data-testid="dock-library"]').click());
    await page.waitForTimeout(700);
    await page.evaluate(() => document.querySelector('[data-testid="learn-fork-centre"]')?.click());
    await page.waitForTimeout(2200);
    await page.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"]').forEach(n => n.remove()));
    await page.evaluate(() => {
      const inp = document.querySelector('input[aria-label="Search the exercise library"]');
      if (!inp) return;
      inp.value = 'pigeon';
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.waitForTimeout(900);
    const label = await page.evaluate(() => {
      const card = [...document.querySelectorAll('.exercise-card-top')]
        .find(n => /Pigeon Pose/i.test(n.textContent));
      return card ? card.textContent.replace(/Pigeon Pose/i, '').trim() : null;
    });
    check('the library calls the best hold 45s, not the 90s warm-up',
      label != null && /45s/.test(label) && !/90s/.test(label), String(label));
  }

  console.log('\n=== 9. nothing downstream still counts a raw done set ===');
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
