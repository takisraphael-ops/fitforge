// Home's muscle balance, drawn on the body instead of as six flat bars.
//
// The bars were accurate and said almost nothing: "Chest 30 / Back 0" is a
// fact you have to assemble into a picture yourself, and the question the
// block exists to answer — what am I neglecting? — is a spatial one.
//
// Three things have to hold, and each one is a way this could ship broken
// while still looking fine in a screenshot:
//
//   1. The heat has to mean something. A body with every muscle the same
//      colour is decoration, and so is one where the colours do not track
//      what was actually logged.
//   2. It has to be a picture, not a control. Home already has a dock, a
//      hero and a food ring competing for taps; a figure with 15 invisible
//      tap targets on it is a trap, and it would also make the reach audit's
//      job meaningless.
//   3. It has to disappear cleanly. body-map.js is a separate script tag, so
//      on a cold start with a partial cache it can genuinely be missing —
//      and Home still has to render something that answers the question.
//
//   node tests/muscle-map.js   (needs `python3 -m http.server 8199` at the repo root)
const { chromium } = require('/opt/node22/lib/node_modules/playwright/index.js');
const path = require('path');
const fs = require('fs');
const SS = process.env.FITFORGE_SHOTS || path.resolve(__dirname, '..', '.shots');
try { fs.mkdirSync(SS, { recursive: true }); } catch (_) {}

let fails = 0;
const check = (label, ok, detail = '') => {
  if (!ok) fails++;
  console.log(`   ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
};

// Deliberately lopsided: heavy push, nothing for back or hamstrings. An
// imbalance is the only thing a balance view has to make legible.
const seed = async (opts) => {
  await Storage.clearAll();
  const prefs = {
    onboarded: true, sex: opts.sex || 'male', dob: '1995-04-12', heightCm: 180,
    activityLevel: 'moderate', kcalGoal: 2600, theme: opts.theme || 'dark'
  };
  for (const [k, v] of Object.entries(prefs)) await Storage.setPref(k, v);
  if (opts.empty) return;
  const iso = d => U.todayISO(d);
  for (let i = 0; i < 10; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    await Storage.saveWorkout({
      id: 'w' + i, name: 'Push', date: iso(d), startedAt: d.getTime(),
      completedAt: d.getTime() + 3.6e6, durationSec: 3300,
      exercises: [{
        exerciseId: 'bench-press-barbell', name: 'Barbell Bench Press', type: 'weighted',
        sets: [{ weight: 80, reps: 8, done: true }, { weight: 85, reps: 6, done: true }]
      }]
    });
  }
  if (!opts.mobility) return;
  // Stretching only counts against training that happened. The first version
  // of this fixture trained chest and stretched legs, so nothing was ever
  // discounted and the two maps came out identical — which looked like the
  // switch was dead when it was the fixture that was wrong. Legs are trained
  // here as well as stretched, which is the only shape that shows a
  // difference at all.
  for (let i = 0; i < 4; i++) {
    const d = new Date(); d.setDate(d.getDate() - (i * 2 + 1));
    await Storage.saveWorkout({
      id: 'l' + i, name: 'Legs', date: iso(d), startedAt: d.getTime(),
      completedAt: d.getTime() + 3.6e6, durationSec: 3300,
      exercises: [{
        exerciseId: 'squat-back', name: 'Barbell Back Squat', type: 'weighted',
        sets: [{ weight: 100, reps: 5, done: true }, { weight: 100, reps: 5, done: true }]
      }]
    });
    await Storage.saveWorkout({
      id: 'm' + i, name: 'Stretch', date: iso(d), startedAt: d.getTime(),
      completedAt: d.getTime() + 9e5, durationSec: 900,
      exercises: [
        { exerciseId: 'mob-bodyweight-squat', name: 'Bodyweight Squat', type: 'hold',
          sets: [{ seconds: 60, done: true }, { seconds: 60, done: true }] },
        { exerciseId: 'mob-leg-swings', name: 'Leg Swings', type: 'hold',
          sets: [{ seconds: 60, done: true }, { seconds: 60, done: true }] }
      ]
    });
  }
};

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const errs = [];

  // One page per scenario: the fallback case has to block a script at load.
  // `customSeed` replaces the shared fixture for the cases that need a
  // specific length of history rather than a specific shape of imbalance.
  const open = async (opts, customSeed) => {
    const c = await b.newContext({ viewport: { width: 390, height: 900 }, serviceWorkers: 'block', hasTouch: true });
    const page = await c.newPage();
    page.on('pageerror', e => errs.push('PAGEERR: ' + e.message));
    page.on('console', m => {
      const t = m.text();
      if (m.type() === 'error' && !/Failed to load|net::/.test(t) && !(opts.noBodyMap && /muscle map failed/.test(t))) {
        errs.push('con: ' + t.slice(0, 140));
      }
    });
    await page.route(/fonts\.googleapis\.com/, r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    if (opts.noBodyMap) {
      await page.route(/body-map\.js/, r => r.fulfill({ status: 200, contentType: 'application/javascript', body: '/* gone */' }));
    }
    await page.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
    await page.waitForFunction(() => window.Storage && window.U);
    if (customSeed) await customSeed(page); else await page.evaluate(seed, opts);
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(4200);
    await page.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"],.splash').forEach(n => n.remove()));
    return { page, close: () => c.close() };
  };

  const probe = (page) => page.evaluate(() => {
    const map = document.querySelector('[data-testid="home-muscle-map"]');
    const trends = document.querySelector('[data-testid="home-section-trends"]');
    const out = {
      hasMap: !!map,
      hasBars: !!(trends && trends.querySelector('.muscle-balance')),
      hasEmptyState: !!(trends && trends.querySelector('[data-testid="empty-muscle-start-workout"]')),
      figures: map ? map.querySelectorAll('.body-map-svg').length : 0,
      // Anything a finger or a tab key could land on inside the picture.
      controls: map ? map.querySelectorAll('button,[role="button"],[tabindex],a,input').length : -1,
      pointerEvents: null, zones: {}, busiest: null, untouched: null
    };
    if (!map) return out;
    const region = map.querySelector('.body-map-region');
    if (region) out.pointerEvents = getComputedStyle(region).pointerEvents;
    for (const z of ['chest', 'lats', 'hams', 'shoulders']) {
      const g = map.querySelector(`[data-zone="${z}"]`);
      const part = g && g.querySelector('.body-map-region-part');
      if (!g) continue;
      out.zones[z] = {
        cls: ((g.getAttribute('class') || '').match(/heat-\d/) || [])[0] || null,
        fill: part ? getComputedStyle(part).fill : null
      };
    }
    const bz = map.querySelector('[data-testid="mmap-busiest"]');
    const uz = map.querySelector('[data-testid="mmap-untouched"]');
    out.busiest = bz ? bz.textContent.trim() : null;
    out.untouched = uz ? uz.textContent.trim() : null;
    return out;
  });

  // ============ 1. it is a picture, and the picture means something ==========
  console.log('=== 1. the map renders, and its heat tracks what was logged ===');
  {
    const { page, close } = await open({});
    const r = await probe(page);
    console.log('   ', JSON.stringify({ figures: r.figures, controls: r.controls, zones: r.zones }));
    check('the map replaced the bars', r.hasMap && !r.hasBars);
    check('both figures are drawn', r.figures === 2, String(r.figures));
    check('a heavily-trained muscle is hot',
      r.zones.chest && /heat-[34]/.test(r.zones.chest.cls), r.zones.chest && r.zones.chest.cls);
    // The control. Without it, "chest is hot" is satisfied by painting
    // everything hot, which is exactly the failure that looks fine.
    check('a muscle that was never trained is not',
      r.zones.lats && r.zones.lats.cls === 'heat-0' && r.zones.hams && r.zones.hams.cls === 'heat-0',
      JSON.stringify({ lats: r.zones.lats && r.zones.lats.cls, hams: r.zones.hams && r.zones.hams.cls }));
    check('hot and cold are actually different colours',
      r.zones.chest && r.zones.lats && r.zones.chest.fill !== r.zones.lats.fill,
      `${r.zones.chest && r.zones.chest.fill} vs ${r.zones.lats && r.zones.lats.fill}`);
    check('the numbers survived the redesign', !!r.busiest && !!r.untouched,
      `${r.busiest} | ${r.untouched}`);
    await page.screenshot({ path: `${SS}/muscle_map.png` });
    await close();
  }

  // ============ 2. not a control ===========================================
  console.log('\n=== 2. it is not something you can tap ===');
  {
    const { page, close } = await open({});
    const r = await probe(page);
    check('no buttons, links, inputs or tab stops inside it', r.controls === 0, String(r.controls));
    check('the muscle regions do not take pointer events',
      r.pointerEvents === 'none', String(r.pointerEvents));
    await close();
  }

  // ============ 3. the same in light theme =================================
  console.log('\n=== 3. the heat reads in light theme too ===');
  {
    const { page, close } = await open({ theme: 'light' });
    const r = await probe(page);
    const light = await page.evaluate(() => !document.documentElement.classList.contains('dark'));
    check('the page really is in light theme', light);
    check('hot and cold still differ', r.zones.chest && r.zones.lats &&
      r.zones.chest.fill !== r.zones.lats.fill,
      `${r.zones.chest && r.zones.chest.fill} vs ${r.zones.lats && r.zones.lats.fill}`);
    await close();
  }

  // ============ 4. it disappears cleanly ===================================
  console.log('\n=== 4. with body-map.js missing, Home still answers the question ===');
  {
    const { page, close } = await open({ noBodyMap: true });
    const r = await probe(page);
    console.log('   ', JSON.stringify({ hasMap: r.hasMap, hasBars: r.hasBars }));
    check('no map', !r.hasMap);
    check('the bars are back', r.hasBars);
    const stillRenders = await page.evaluate(() =>
      !!document.querySelector('[data-testid="home-section-trends"]') &&
      !!document.querySelector('[data-testid="home-week-volume"]'));
    check('the rest of Home rendered anyway', stillRenders);
    await close();
  }

  // ============ 5. nothing logged ==========================================
  console.log('\n=== 5. with no workouts, an empty state rather than an unlit body ===');
  {
    const { page, close } = await open({ empty: true });
    const r = await probe(page);
    check('no map', !r.hasMap);
    check('the "start a workout" prompt is shown', r.hasEmptyState);
    await close();
  }

  // ============ 6. the Training / Mobility switch ==========================
  // Mobility heat is trained x (1 - stretched). Stretch nothing and that is
  // trained x 1 — the training map, to the pixel — so the switch does nothing
  // whatsoever while its caption goes on describing a second reading. Since
  // most people log no mobility work at all, that is the normal state of this
  // control rather than an edge case, and it read as broken.
  console.log('\n=== 6. the map modes say what they are actually showing ===');
  {
    const zones = (page) => page.evaluate(() =>
      [...document.querySelectorAll('.body-map-region')].map((n) =>
        n.getAttribute('data-zone') + ':' + ([...n.classList].find((c) => /^heat-\d$/.test(c)) || '-')).join('|'));
    const toMap = async (page) => {
      await page.evaluate(() => document.querySelector('[data-testid="dock-library"]').click());
      await page.waitForTimeout(700);
      await page.evaluate(() => document.querySelector('[data-testid="learn-fork-bodymap"]')?.click());
      await page.waitForTimeout(1800);
    };
    const caption = (page) => page.textContent('[data-testid="map-mode-caption"]').catch(() => '');
    const flat = (page) => page.getAttribute('[data-testid="map-mode-caption"]', 'data-flat').catch(() => null);
    const pick = async (page, m) => {
      await page.evaluate((x) => document.querySelector(`[data-testid="map-mode-${x}"]`).click(), m);
      await page.waitForTimeout(600);
    };

    {
      const { page, close } = await open({});   // training only, no stretching
      await toMap(page);
      check('the mode switch is there', !!(await page.$('[data-testid="map-mode"]')));
      await pick(page, 'training');
      const t = await zones(page);
      await pick(page, 'mobility');
      const m = await zones(page);
      // Not a bug to be fixed by making the map differ — the maths is right.
      // Everything trained is neglected when nothing is stretched.
      check('with no mobility logged the two maps really are identical', t === m);
      check('so the caption says exactly that rather than claiming a reading',
        /no mobility work logged/i.test(await caption(page)), (await caption(page)).slice(0, 70));
      check('and it is marked as the flat case', (await flat(page)) === '1');
      check('it also says what would make it differ',
        /log some stretching|will cool down/i.test(await caption(page)));
      await close();
    }
    {
      const { page, close } = await open({ mobility: true });
      await toMap(page);
      await pick(page, 'training');
      const t = await zones(page);
      await pick(page, 'mobility');
      const m = await zones(page);
      check('with mobility logged the map actually changes', t !== m,
        t === m ? 'identical — the switch is dead' : 'differs');
      check('and the caption drops the explanation', !/no mobility work logged/i.test(await caption(page)),
        (await caption(page)).slice(0, 70));
      check('no longer the flat case', (await flat(page)) === '0');
      await close();
    }
  }

  // ============ 7. sets per muscle per week ================================
  //
  // The map counted sets and normalised them to your own busiest muscle, so
  // three sets of chest and nothing else lit chest at full heat. "Most trained"
  // and "enough" are different questions and only the second has an answer from
  // outside your own history: roughly ten to twenty hard sets a week per muscle
  // is where the dose-response evidence sits.
  //
  // The thing to be careful of is inventing a shortfall. Halving a fortnight's
  // tally is only a weekly rate if there was a fortnight of it, and the range
  // is evidence rather than this user's stated goal — the app has no
  // strength/hypertrophy/endurance axis to read an intent off.
  console.log('\n=== 7. sets per muscle, per week, against the evidenced range ===');
  {
    const { page, close } = await open({});
    const u = await page.evaluate(() => ({
      min: U.SETS_PER_WEEK_MIN, max: U.SETS_PER_WEEK_MAX,
      majors: BodyMap.MAJOR_ZONES,
      zoneIds: Object.keys(BodyMap.ZONES),
      // 20 sets in a fortnight is 10 a week, exactly on the line.
      rate: [U.setsPerWeek(20, 14), U.setsPerWeek(7, 7), U.setsPerWeek(0, 14), U.setsPerWeek(10, 0)],
      bands: [U.setsBand(0), U.setsBand(9.9), U.setsBand(10), U.setsBand(20), U.setsBand(20.1)],
      // Rounding the tally before dividing flips this one across the line.
      borderline: U.setsBand(U.setsPerWeek(19.6, 14))
    }));
    check('the range is the one the evidence covers', u.min === 10 && u.max === 20, `${u.min}-${u.max}`);
    check('a fortnight of 20 sets is 10 a week', u.rate[0] === 10, String(u.rate[0]));
    check('and a week of 7 is 7', u.rate[1] === 7, String(u.rate[1]));
    check('no window means no rate rather than a division by zero',
      u.rate[2] === 0 && u.rate[3] === 0, JSON.stringify(u.rate));
    check('the bands sit where they should',
      JSON.stringify(u.bands) === '["none","under","in","in","over"]', JSON.stringify(u.bands));
    // The reason the exact tally is carried alongside the rounded one.
    check('19.6 sets in a fortnight is under the line, not on it',
      u.borderline === 'under', u.borderline);
    // ...and the reason that matters: the map must actually EMIT the fraction.
    // Checking setsBand in isolation passes happily while the heat map hands it
    // a pre-rounded number, which is exactly the bug the constant exists for.
    const exact = await page.evaluate(() => {
      const workouts = [{
        date: U.todayISO(), completedAt: Date.now(),
        exercises: [{ exerciseId: 'bench-press-barbell',
          sets: [{ done: true }, { done: true }, { done: true }] }]
      }];
      const byId = new Map(EXERCISE_DB.map((e) => [e.id, e]));
      const h = BodyMap.heatFromWorkouts(workouts, byId, 14);
      // Three bench sets: chest is a prime mover and scores whole, triceps are
      // secondary and score a fraction of each.
      return { chest: h.chest_setsExact, triceps: h.triceps_setsExact, tricepsRounded: h.triceps_sets };
    });
    check('the map emits whole sets for a prime mover', exact.chest === 3, String(exact.chest));
    check('and a fraction for a secondary one, unrounded',
      exact.triceps > 0 && exact.triceps % 1 !== 0, String(exact.triceps));
    check('which is a different number from the rounded one it sits beside',
      exact.triceps !== exact.tricepsRounded, `${exact.triceps} vs ${exact.tricepsRounded}`);

    // Every major zone must be a real zone, and none may be a coarse bucket —
    // counting both `lats` and `back` would count the same set twice.
    const bad = u.majors.filter((z) => !u.zoneIds.includes(z));
    check('every major group names a real zone', bad.length === 0, bad.join(', '));
    const coarse = u.majors.filter((z) => ['arms', 'back', 'core', 'legs'].includes(z));
    check('and none of them is a coarse bucket that would double count',
      coarse.length === 0, coarse.join(', '));
    await close();
  }

  // A short history must NOT be halved into a shortfall.
  {
    const { page, close } = await open({}, async (p) => {
      await p.evaluate(async () => {
        await Storage.clearAll();
        for (const [k, v] of Object.entries({ onboarded: true, sex: 'male', dob: '1995-04-12', heightCm: 180, activityLevel: 'moderate' })) {
          await Storage.setPref(k, v);
        }
        const iso = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return U.todayISO(d); };
        // Four days old, trained hard every one of them.
        for (let i = 0; i < 4; i++) {
          const d = new Date(); d.setDate(d.getDate() - i);
          await Storage.saveWorkout({
            id: 'n' + i, name: 'Push', date: iso(i), startedAt: d.getTime(),
            completedAt: d.getTime() + 3.6e6, durationSec: 3300,
            exercises: [{ exerciseId: 'bench-press-barbell', name: 'Barbell Bench Press', type: 'weighted',
              sets: Array.from({ length: 5 }, () => ({ weight: 80, reps: 8, done: true })) }]
          });
        }
      });
    });
    const r = await page.evaluate(() => {
      const map = document.querySelector('[data-testid="home-muscle-map"]');
      if (!map) return null;
      return {
        head: map.textContent.slice(0, 90),
        busiest: map.querySelector('[data-testid="mmap-busiest"]')?.textContent || '',
        under: map.querySelector('[data-testid="mmap-under"]')?.textContent || null
      };
    });
    check('a four-day-old account still gets a map', !!r);
    if (!r) { await close(); throw new Error('no muscle map — the two checks below would prove nothing'); }
    check('it does not claim a weekly rate it cannot divide for',
      !/\/wk/.test(r.busiest), r.busiest.trim());
    check('and invents no shortfall from four days of history', r.under === null, String(r.under));
    await close();
  }

  // With a full window, the rate and the range appear.
  {
    const { page, close } = await open({}, async (p) => {
      await p.evaluate(async () => {
        await Storage.clearAll();
        for (const [k, v] of Object.entries({ onboarded: true, sex: 'male', dob: '1995-04-12', heightCm: 180, activityLevel: 'moderate' })) {
          await Storage.setPref(k, v);
        }
        const iso = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return U.todayISO(d); };
        // Three weeks of history, benching hard and neglecting everything else.
        for (let i = 20; i >= 0; i--) {
          if (i % 2) continue;
          const d = new Date(); d.setDate(d.getDate() - i);
          await Storage.saveWorkout({
            id: 'f' + i, name: 'Push', date: iso(i), startedAt: d.getTime(),
            completedAt: d.getTime() + 3.6e6, durationSec: 3300,
            exercises: [{ exerciseId: 'bench-press-barbell', name: 'Barbell Bench Press', type: 'weighted',
              sets: Array.from({ length: 6 }, () => ({ weight: 80, reps: 8, done: true })) }]
          });
        }
      });
    });
    const r = await page.evaluate(() => {
      const map = document.querySelector('[data-testid="home-muscle-map"]');
      if (!map) return null;
      const under = map.querySelector('[data-testid="mmap-under"]');
      return {
        head: map.textContent.slice(0, 80),
        busiest: map.querySelector('[data-testid="mmap-busiest"]')?.textContent || '',
        under: under ? under.textContent : null
      };
    });
    check('with a full window it reports a weekly rate', !!r && /\/wk/.test(r.busiest),
      r ? r.busiest.trim() : 'no map');
    check('and says so in the card heading', !!r && /per week/i.test(r.head), r ? r.head.trim() : '');
    check('chest, benched every other day, is not listed as under the range',
      !!r && !/Chest/.test(r.under || ''), String(r && r.under));
    // The list is majors only: forearms get worked by every pressing set and
    // nobody programmes ten direct sets a week for them.
    check('and the under-range list holds no minor groups',
      !!r && !/Forearms|Lower back|Obliques/.test(r.under || ''), String(r && r.under));
    await close();
  }

  console.log('\nERRORS:', errs.length ? errs : 'none');
  console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
