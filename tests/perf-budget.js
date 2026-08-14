// Performance budgets — so "sub-200 ms boot" cannot rot silently.
//
// The audit's headline numbers (181 ms boot, ~160 ms tab switches, with a
// year of data on board) were measured once, at v273, and then quoted as if
// current while eighteen releases landed on top of them. Nothing would have
// said anything if boot had quietly become two seconds. This suite makes the
// claim self-enforcing: seed a year of use, measure the real app, and fail
// when a budget is blown.
//
// What "boot" means here: navigation start until app.js releases the splash —
// the call it makes the moment its first render is on screen. That is the
// app's own definition of ready (the splash's cosmetic minimum hold is
// excluded; it is a floor, not work). The mark is taken by trapping the
// window.__ffSplashDone assignment before any page script runs, so a boot
// that crashes before readiness never sets it — the suite fails loudly
// instead of timing a blank page.
//
// What "tab switch" means: dock tap until the tab is active and #main has
// painted a frame of its content. The first visit to a tab may lazy-load its
// module, so round one warms every tab and only round two is measured —
// steady-state switching is what the claim has always described.
//
// Everything is measured under 4× CPU throttling — the standard mid-range
// phone approximation — because the unthrottled CI container boots in ~35 ms
// and would be measuring itself, not the app a lifter holds.
//
// Measured at v291 under that throttle: boot median ≈ 126 ms; tab switch
// median ≈ 520 ms. The tab figure is by design, not rot: since the staged-
// swap redesign, a switch builds the destination completely off screen,
// waits for it to stop growing, and only then swaps — a beat of latency
// deliberately traded for never flashing a half-built page. The budgets sit
// ~3–5× over those medians: wide enough to absorb scheduler jitter on shared
// hardware, far too narrow to pass the order-of-magnitude rot this suite
// exists to catch. If a budget fails without an obvious cause, re-run once
// before believing it — and if it fails twice, believe it.
//
//   node tests/perf-budget.js   (needs `python3 -m http.server 8199` at the repo root)
const { chromium } = require('/opt/node22/lib/node_modules/playwright/index.js');

let fails = 0;
const check = (label, ok, detail = '') => { if (!ok) fails++; console.log(`   ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`); };
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };

const BOOT_BUDGET_MS = 650;
const TAB_BUDGET_MS = 1500;
const BOOT_RUNS = 4; // first run is discarded as cache warm-up
const TABS = ['nutrition', 'stats', 'library', 'home'];

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const c = await b.newContext({ viewport: { width: 390, height: 900 }, serviceWorkers: 'block', hasTouch: true });
  const p = await c.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERR: ' + e.message));

  // Trap the splash-release assignment: the wrapper records the moment the
  // app itself says "on screen", then hands through to the real splash.
  await p.addInitScript(() => {
    let real = null;
    const wrapper = function () {
      if (window.__bootReadyMs == null) window.__bootReadyMs = performance.now();
      return real ? real.apply(this, arguments) : undefined;
    };
    Object.defineProperty(window, '__ffSplashDone', {
      configurable: true,
      get() { return real ? wrapper : undefined; },
      set(fn) { real = fn; }
    });
  });

  // 4× CPU throttling — the standard mid-range-phone approximation. Without
  // it the CI container boots in ~35 ms and the budgets would be measuring
  // the container, not the app a lifter actually holds.
  const cdp = await c.newCDPSession(p);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  await p.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
  await p.waitForFunction(() => window.Storage && window.U);

  // ============ seed a full year of daily use =============================
  console.log('=== seeding a year of use ===');
  const seeded = await p.evaluate(async () => {
    await Storage.clearAll();
    const prefs = {
      onboarded: true, sex: 'male', dob: '1995-04-12', heightCm: 180,
      warmupPrompt: false, lastBackupAt: new Date().toISOString(),
      lastBackupWorkoutCount: 260
    };
    for (const [k, v] of Object.entries(prefs)) await Storage.setPref(k, v);

    const iso = (d) => d.toISOString().slice(0, 10);
    const day = 24 * 60 * 60 * 1000;
    const EX = [
      { exerciseId: 'bench-press-barbell', name: 'Barbell Bench Press' },
      { exerciseId: 'goblet-squat', name: 'Goblet Squat' },
      { exerciseId: 'deadlift-conventional', name: 'Deadlift' },
      { exerciseId: 'ohp-barbell', name: 'Overhead Press' }
    ];
    let workouts = 0, meals = 0, weights = 0;
    for (let d = 364; d >= 1; d--) {
      const date = new Date(Date.now() - d * day);
      const ds = iso(date);
      // 5 sessions a week, drifting slowly upward like a real year
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        const base = 60 + Math.round((364 - d) / 20);
        await Storage.saveWorkout({
          id: 'w' + d, name: 'Session ' + ds, date: ds,
          startedAt: date.getTime(), completedAt: date.getTime() + 45 * 60 * 1000,
          exercises: EX.map((e, i) => ({
            ...e, type: 'weighted',
            sets: [0, 1, 2].map(s => ({ weight: base + i * 10 + s * 2.5, reps: 8 - s, done: true }))
          }))
        });
        workouts++;
      }
      // three meals a day, every day
      for (const [j, sec] of [['08:00', 'breakfast'], ['13:00', 'lunch'], ['19:00', 'dinner']].entries()) {
        await Storage.saveMeal({
          id: 'm' + d + '-' + j[1], name: 'Meal ' + j[1], date: ds, time: j[0], section: j[1],
          kcal: 550 + (d % 7) * 20, protein: 35, carbs: 60, fat: 18
        });
        meals++;
      }
      // weigh-ins every other day
      if (d % 2 === 0) {
        await Storage.saveBodyweight({ date: ds, kg: 82 - (364 - d) * 0.005 });
        weights++;
      }
    }
    return { workouts, meals, weights };
  });
  check('a year of data is in the database',
    seeded.workouts >= 250 && seeded.meals >= 1000 && seeded.weights >= 150,
    `${seeded.workouts} workouts, ${seeded.meals} meals, ${seeded.weights} weigh-ins`);

  // ============ boot, measured the app's own way ==========================
  console.log('\n=== boot: navigation to splash release, year of data on board ===');
  const boots = [];
  for (let i = 0; i < BOOT_RUNS; i++) {
    await p.reload({ waitUntil: 'load' });
    await p.waitForFunction(() => window.__bootReadyMs != null, null, { timeout: 15000 });
    boots.push(await p.evaluate(() => window.__bootReadyMs));
  }
  const warmBoots = boots.slice(1);
  const bootMed = median(warmBoots);
  check('every boot reached readiness — none timed a blank page', boots.every(x => x > 0),
    boots.map(x => Math.round(x) + 'ms').join(', '));
  check(`median warm boot is under the ${BOOT_BUDGET_MS} ms budget`, bootMed <= BOOT_BUDGET_MS,
    `median ${Math.round(bootMed)} ms of [${warmBoots.map(x => Math.round(x)).join(', ')}]`);

  // ============ tab switches, steady-state ================================
  console.log('\n=== tab switches: dock tap to painted content, warm ===');
  await p.waitForTimeout(1500);
  await p.evaluate(() => document.querySelectorAll('.splash').forEach(n => n.remove()));
  const switchTo = (tab) => p.evaluate(async (tab) => {
    const raf = () => new Promise(r => requestAnimationFrame(r));
    // The dock re-renders on switch, so the tapped button node is replaced —
    // re-query every frame or the active class is checked on a detached node.
    const q = () => document.querySelector(`[data-testid="dock-${tab}"]`);
    if (!q()) return -1;
    const t0 = performance.now();
    q().click();
    while (performance.now() - t0 < 10000) {
      const btn = q();
      if (btn && btn.classList.contains('active') && document.getElementById('main').childElementCount > 0) break;
      await raf();
    }
    await raf(); // the painted frame
    return performance.now() - t0;
  }, tab);

  for (const tab of TABS) { await switchTo(tab); await p.waitForTimeout(400); } // warm lazy modules
  const times = [];
  for (const tab of TABS) {
    const t = await switchTo(tab);
    times.push({ tab, t });
    await p.waitForTimeout(400);
  }
  const tabMed = median(times.map(x => x.t));
  check('every tab switch landed (a 10 s deadline hit is a miss, not a slow pass)',
    times.every(x => x.t >= 0 && x.t < 9000),
    times.map(x => `${x.tab} ${Math.round(x.t)}ms`).join(', '));
  check(`median warm switch is under the ${TAB_BUDGET_MS} ms budget`, tabMed <= TAB_BUDGET_MS,
    `median ${Math.round(tabMed)} ms`);

  check('no page errors across seeding, boots and switches', errs.length === 0, errs.slice(0, 3).join(' | '));

  await b.close();
  console.log(`\nmeasured: boot ${Math.round(bootMed)} ms (budget ${BOOT_BUDGET_MS}), tab ${Math.round(tabMed)} ms (budget ${TAB_BUDGET_MS})`);
  console.log(fails ? `\n${fails} CHECK(S) FAILED` : '\nALL CHECKS PASSED');
  process.exit(fails ? 1 : 0);
})();
