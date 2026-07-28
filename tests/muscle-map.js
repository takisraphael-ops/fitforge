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
};

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const errs = [];

  // One page per scenario: the fallback case has to block a script at load.
  const open = async (opts) => {
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
    await page.evaluate(seed, opts);
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

  console.log('\nERRORS:', errs.length ? errs : 'none');
  console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
