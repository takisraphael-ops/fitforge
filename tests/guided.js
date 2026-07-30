// The guided set runner — the default way a strength set gets logged.
//
// It exists because of one specific piece of clunk: the app knew what you did
// last week, showed it to you in grey placeholder text, and then refused to
// log it until you typed the same numbers back in. So the property under test
// is not "does the screen render" but:
//
//     a set identical to last session costs exactly one tap, and stores the
//     same record the classic row would have stored.
//
// The second half of that matters as much as the first. There are now two
// presentations of the same set objects, and the failure mode of two UIs over
// one model is that they drift — one gets a PR-detection fix, the other keeps
// the bug for a year. Section 3 pins them together by logging the same set
// both ways and diffing the stored record field by field.
//
//   node tests/guided.js   (needs `python3 -m http.server 8199` at the repo root)
const { chromium } = require('/opt/node22/lib/node_modules/playwright/index.js');

const HOLD_MS = 420;   // RADIAL_HOLD_MS in js/app.js
let fails = 0;
const check = (label, ok, detail = '') => {
  if (!ok) fails++;
  console.log(`   ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
};

// Last week's session, so there is something for the prefill to find.
const HISTORY = {
  id: 'past1', name: 'Last week', date: '2026-07-20',
  startedAt: 1, completedAt: 2, durationSec: 3000,
  exercises: [
    { exerciseId: 'bench-press-barbell', name: 'Barbell Bench Press', type: 'weighted',
      sets: [{ weight: 100, reps: 5, done: true }, { weight: 100, reps: 5, done: true }] },
    { exerciseId: 'push-up', name: 'Push-Up', type: 'bodyweight',
      sets: [{ weight: 0, reps: 20, done: true }] }
  ]
};

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', hasTouch: true });
  const page = await c.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERR: ' + e.message.slice(0, 160)));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load|net::/.test(m.text())) errs.push('con: ' + m.text().slice(0, 140)); });
  await page.route(/fonts\.googleapis\.com/, r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await page.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
  await page.waitForFunction(() => window.Storage && window.U);

  /** Put a live session in the database and land on the workout screen. */
  const session = async (exercises, prefs = {}) => {
    await page.evaluate(async ({ exercises, prefs, HISTORY }) => {
      await Storage.clearAll();
      await Storage.setPref('onboarded', true);
      await Storage.setPref('warmupPrompt', false);
      for (const [k, v] of Object.entries(prefs)) await Storage.setPref(k, v);
      await Storage.saveWorkout(HISTORY);
      const w = { id: 'live1', name: 'Today', date: U.todayISO(), startedAt: Date.now(), exercises };
      await Storage.saveWorkout(w);
      await Storage.setPref('activeWorkoutId', w.id);
    }, { exercises, prefs, HISTORY });
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(1400);
    await page.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"],.splash').forEach(n => n.remove()));
    await page.click('[data-testid="button-resume-workout"]');
    await page.waitForTimeout(1800);
    await page.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"]').forEach(n => n.remove()));
  };

  const BENCH = (sets = 2) => ({
    exerciseId: 'bench-press-barbell', name: 'Barbell Bench Press', type: 'weighted',
    sets: Array.from({ length: sets }, () => ({ weight: null, reps: null, done: false }))
  });
  const PUSHUP = () => ({
    exerciseId: 'push-up', name: 'Push-Up', type: 'bodyweight',
    sets: [{ weight: null, reps: null, done: false }]
  });
  const RUN = () => ({
    exerciseId: 'running', name: 'Running', type: 'cardio',
    sets: [{ durationMin: null, intensity: 'moderate', distanceKm: null, done: false }]
  });

  const open = () => page.$('[data-testid="set-runner"]');
  const txt = (t) => page.textContent(`[data-testid="${t}"]`).catch(() => null);
  const stored = () => page.evaluate(async () => (await Storage.getWorkout('live1')).exercises);

  // =============== 1. one tap, no typing ====================================
  console.log('=== 1. a set identical to last session costs one tap ===');
  {
    await session([BENCH(2)]);
    check('the runner is what you land in', !!(await open()));
    check('it opens on the first set', (await txt('srun-setline')) === 'SET 1 OF 2', await txt('srun-setline'));
    check('last week\'s weight is already there', /100/.test(await txt('srun-weight') || ''), await txt('srun-weight'));
    check('and last week\'s reps', /^5/.test(await txt('srun-reps') || ''), await txt('srun-reps'));
    check('with the source shown, not hidden', /100 kg × 5/.test(await txt('srun-last') || ''), await txt('srun-last'));

    // The whole feature, in one line.
    await page.click('[data-testid="srun-log"]');
    await page.waitForTimeout(600);
    const ex = (await stored())[0];
    check('one tap logged it', ex.sets[0].done === true && ex.sets[0].weight === 100 && ex.sets[0].reps === 5,
      JSON.stringify(ex.sets[0]));
    check('and only it', ex.sets[1].done !== true, JSON.stringify(ex.sets[1]));
    check('kcal was estimated, as the classic row would have', ex.sets[0].kcal > 0, String(ex.sets[0].kcal));
  }

  // =============== 2. rest happens here, not on top of here =================
  console.log('\n=== 2. rest is drawn in place, on the same screen ===');
  {
    check('the rest view took over the runner', !!(await page.$('[data-testid="srun-rest"]')));
    check('no second full-screen overlay stacked on it', !(await page.$('.rest-overlay')));
    const v = await page.$eval('#rest-value', e => e.textContent).catch(() => null);
    check('the countdown driver found its element', !!v && /^\d+:\d\d$/.test(v), v || 'missing #rest-value');
    check('the ring driver found its element', !!(await page.$('#rest-ring-fill')));
    check('it names the set it leads to', /set 2 of 2/.test(await txt('srun-rest-next') || ''), await txt('srun-rest-next'));
    // A rest window you cannot leave is a trap; the way out must be on both views.
    check('the way out is still on screen during rest', !!(await page.$('[data-testid="srun-exit"]')));

    const before = await page.$eval('#rest-value', e => e.textContent);
    await page.click('[data-testid="srun-rest-add15"]');
    await page.waitForTimeout(150);
    const after = await page.$eval('#rest-value', e => e.textContent);
    check('+15s adds fifteen seconds', after !== before, `${before} -> ${after}`);

    await page.click('[data-testid="srun-rest-skip"]');
    await page.waitForTimeout(400);
    check('skipping rest lands on the next set', (await txt('srun-setline')) === 'SET 2 OF 2', await txt('srun-setline'));
    check('nothing is left ticking', await page.evaluate(() => !document.getElementById('rest-value')));
  }

  // =============== 3. the two presentations cannot drift ====================
  //
  // Both write through commitStrengthSet. If someone reimplements logging in
  // one of them, the records stop matching and this fails — which is the only
  // thing standing between "two views of one model" and "two apps".
  console.log('\n=== 3. runner and classic row store the same record ===');
  {
    const viaRunner = await (async () => {
      await session([BENCH(1)]);
      await page.click('[data-testid="srun-log"]');
      await page.waitForTimeout(600);
      return (await stored())[0].sets[0];
    })();

    const viaRow = await (async () => {
      await session([BENCH(1)], { guidedSets: false });
      check('with the preference off, it does not open', !(await open()));
      // Drive the classic row exactly as a person would: numpad, numpad, log.
      await page.click('[data-testid="set-weight-0"]');
      await page.waitForTimeout(300);
      await page.evaluate(() => {
        const i = document.querySelector('[data-testid="set-weight-0"]');
        i.value = '100'; i.dispatchEvent(new Event('input', { bubbles: true }));
      });
      await page.click('[data-testid="numpad-done"]');
      await page.waitForTimeout(250);
      await page.click('[data-testid="set-reps-0"]');
      await page.waitForTimeout(300);
      await page.evaluate(() => {
        const i = document.querySelector('[data-testid="set-reps-0"]');
        i.value = '5'; i.dispatchEvent(new Event('input', { bubbles: true }));
      });
      await page.click('[data-testid="numpad-logset"]');
      await page.waitForTimeout(700);
      return (await stored())[0].sets[0];
    })();

    const keys = [...new Set([...Object.keys(viaRunner), ...Object.keys(viaRow)])].sort();
    const diff = keys.filter(k => JSON.stringify(viaRunner[k]) !== JSON.stringify(viaRow[k]));
    check('every field of the stored set matches', diff.length === 0,
      diff.length ? diff.map(k => `${k}: ${JSON.stringify(viaRunner[k])} vs ${JSON.stringify(viaRow[k])}`).join(', ') : keys.join(','));
    check('and it is a real record, not two empty objects', keys.includes('weight') && keys.includes('kcal') && keys.includes('isPR'),
      keys.join(','));
  }

  // =============== 4. it knows what it cannot do ============================
  console.log('\n=== 4. it stays out of the way of everything it does not handle ===');
  {
    await session([RUN()]);
    check('a cardio-only session does not open it', !(await open()));
    check('and does not offer to', !(await page.$('[data-testid="open-guided"]')));
    check('the cardio row is there instead', !!(await page.$('[data-testid="set-duration-0"]')) || !!(await page.$('.exercise-block')));

    await session([RUN(), BENCH(1)]);
    check('a mixed session opens for the part it does handle', !!(await open()));
    check('and counts only the strength sets', (await txt('srun-count')) === '0 of 1 sets', await txt('srun-count'));
    check('landing on the bench, not the run', (await txt('srun-name')) === 'Barbell Bench Press', await txt('srun-name'));
  }

  // =============== 5. bodyweight logs without a weight ======================
  console.log('\n=== 5. a bodyweight exercise asks only for reps ===');
  {
    await session([PUSHUP()]);
    check('no weight figure to fill in', !(await page.$('[data-testid="srun-weight"]')));
    check('reps prefilled from last time', /^20/.test(await txt('srun-reps') || ''), await txt('srun-reps'));
    await page.click('[data-testid="srun-log"]');
    await page.waitForTimeout(600);
    const s = (await stored())[0].sets[0];
    check('it logs with weight 0, the way bodyweight sets are stored',
      s.done === true && s.reps === 20 && s.weight === 0, JSON.stringify(s));
  }

  // =============== 6. changing the number =================================
  console.log('\n=== 6. tap for the exact number, hold to nudge it ===');
  {
    await session([BENCH(1)]);
    const box = await page.$eval('[data-testid="srun-weight"]', e => {
      const r = e.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
    });

    // Tap: the full numpad, wheels and all.
    await page.click('[data-testid="srun-weight"]');
    await page.waitForTimeout(350);
    check('a tap opens the number pad', !!(await page.$('[data-testid="numpad"]')));
    // A pad opened for a lone figure must not offer to walk to some unrelated
    // input behind the overlay.
    check('and does not offer "Next" to a field that is not there', !(await page.$('[data-testid="numpad-next"]')));
    await page.click('[data-testid="numpad-done"]');
    await page.waitForTimeout(250);

    // Hold: deltas around the thumb, because lifters think in "same but heavier".
    await page.mouse.move(box.x, box.y);
    await page.mouse.down();
    await page.waitForTimeout(HOLD_MS + 160);
    const radial = await page.$('[data-testid="radial-overlay"]');
    check('a hold opens the nudge menu', !!radial);
    if (radial) {
      const slices = await page.$$eval('.radial-slice', els => els.map(e => e.dataset.testid));
      check('four deltas, both directions', slices.length === 4, slices.join(','));
      const glyphs = await page.$$eval('.radial-slice-ic', els => els.map(e => e.textContent.trim()));
      const labels = await page.$$eval('.radial-slice-label', els => els.map(e => e.textContent.trim()));
      // What you land on is the thing worth reading mid-flick; the step is a
      // caption. If those swap, the menu stops telling you anything new.
      check('each slice leads with the number it will produce',
        glyphs.join(',') === '95,97.5,102.5,105', glyphs.join(','));
      check('and captions it with the step', labels.join(',') === '−5,−2.5,+2.5,+5', labels.join(','));
      await page.mouse.up();
      await page.waitForTimeout(120);
      await page.click('[data-testid="radial-weightp2_5"]');
      await page.waitForTimeout(300);
      check('picking +2.5 moves the number', /102\.5/.test(await txt('srun-weight') || ''), await txt('srun-weight'));
      await page.click('[data-testid="srun-log"]');
      await page.waitForTimeout(600);
      check('and that is what gets logged', (await stored())[0].sets[0].weight === 102.5,
        String((await stored())[0].sets[0].weight));
    } else {
      await page.mouse.up();
    }
  }

  // =============== 7. it walks the whole plan ===============================
  console.log('\n=== 7. it drives the session end to end ===');
  {
    await session([BENCH(2), PUSHUP()]);
    check('three sets across two exercises', (await txt('srun-count')) === '0 of 3 sets', await txt('srun-count'));
    for (let i = 0; i < 3; i++) {
      await page.click('[data-testid="srun-log"]');
      await page.waitForTimeout(550);
      if (await page.$('[data-testid="srun-rest-skip"]')) {
        await page.click('[data-testid="srun-rest-skip"]');
        await page.waitForTimeout(350);
      }
    }
    check('it ends on the all-done screen', !!(await page.$('[data-testid="srun-done"]')));
    const exs = await stored();
    check('every set is logged', exs.every(e => e.sets.every(s => s.done)),
      JSON.stringify(exs.map(e => e.sets.map(s => s.done))));
    // Leaving the runner must not show cards that look untouched.
    check('and both exercises are marked finished for the classic view',
      exs.every(e => e.finished === true), JSON.stringify(exs.map(e => e.finished)));

    await page.click('[data-testid="srun-done-cta"]');
    await page.waitForTimeout(600);
    check('the review screen is the classic list', !(await open()) && !!(await page.$('.exercise-block')));
    check('with nothing left for it to do, it does not offer to reopen',
      !(await page.$('[data-testid="open-guided"]')));
  }

  // =============== 8. stepping out stays out ================================
  console.log('\n=== 8. leaving it does not drag you back ===');
  {
    await session([BENCH(2)]);
    await page.click('[data-testid="srun-exit"]');
    await page.waitForTimeout(700);
    check('exiting lands on the classic list', !(await open()) && !!(await page.$('.exercise-block')));
    // A re-render must not reopen it — that is an app that argues with you.
    await page.evaluate(() => document.querySelector('[data-testid="set-weight-0"]')?.click());
    await page.waitForTimeout(300);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    check('and a re-render does not reopen it', !(await open()));
    check('but the way back is offered', !!(await page.$('[data-testid="open-guided"]')));
    await page.click('[data-testid="open-guided"]');
    await page.waitForTimeout(700);
    check('and it works', !!(await open()));
    // Two runners stacked would mean two "LOG SET" buttons over one set.
    check('only ever one of it', (await page.$$('[data-testid="set-runner"]')).length === 1,
      String((await page.$$('[data-testid="set-runner"]')).length));
  }

  // =============== 9. big enough to hit ====================================
  //
  // The brief was "size, not ceremony". A guided flow whose controls are the
  // same size as the row it replaced has not solved anything.
  console.log('\n=== 9. it is actually bigger than what it replaces ===');
  {
    await session([BENCH(1)]);
    const sizes = await page.evaluate(() => {
      const g = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; };
      const fs = (s) => { const e = document.querySelector(s); return e ? Math.round(parseFloat(getComputedStyle(e).fontSize)) : null; };
      return { log: g('[data-testid="srun-log"]'), weight: g('[data-testid="srun-weight"]'),
        reps: g('[data-testid="srun-reps"]'), exit: g('[data-testid="srun-exit"]'),
        digits: fs('.srun-fig-val') };
    });
    console.log('   ', JSON.stringify(sizes));
    check('the log button clears the 44px touch minimum twice over', sizes.log.h >= 60, `${sizes.log.h}px`);
    check('the numbers are readable at arm\'s length', sizes.digits >= 56, `${sizes.digits}px`);
    for (const [k, v] of Object.entries({ weight: sizes.weight, reps: sizes.reps, exit: sizes.exit })) {
      check(`${k} is a real touch target`, v && v.h >= 44 && v.w >= 44, v ? `${v.w}×${v.h}` : 'missing');
    }
    // Nothing may run off a 390px screen.
    const overflow = await page.evaluate(() => {
      const bad = [];
      document.querySelectorAll('.srun *').forEach(e => {
        const r = e.getBoundingClientRect();
        if (r.width && (r.left < -1 || r.right > window.innerWidth + 1)) bad.push(e.className + ` ${Math.round(r.left)}..${Math.round(r.right)}`);
      });
      return bad;
    });
    check('nothing overflows the screen', overflow.length === 0, overflow.join(' | '));

    // A heavy, awkward number must still fit beside the reps.
    await page.evaluate(() => {
      const el = document.querySelector('[data-testid="srun-weight"] .srun-fig-val');
      el.textContent = '182.5';
      el.style.fontSize = 'clamp(34px, 12vw, 54px)';
    });
    const wide = await page.evaluate(() => {
      const r = document.querySelector('.srun-figures').getBoundingClientRect();
      return { right: Math.round(r.right), vw: window.innerWidth,
        rows: Math.round(document.querySelector('[data-testid="srun-reps"]').getBoundingClientRect().top) };
    });
    check('182.5 kg × reps still fits on one line', wide.right <= wide.vw + 1, JSON.stringify(wide));
  }

  console.log('\nERRORS:', errs.length ? errs : 'none');
  console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
