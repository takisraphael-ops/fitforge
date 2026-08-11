// The Day Ledger Home: the first screen answers train, fuel, body and week
// in one glance, reference material starts folded, and the planner pitch
// demotes itself once it has been ignored. The redesign's claims, held:
// Home fell from ~3.9 screens to ~2 — this suite pins the behaviours that
// bought that, so they cannot quietly regress.
//
//   node tests/home-ledger.js   (needs `python3 -m http.server 8199`)
const { chromium } = require('/opt/node22/lib/node_modules/playwright/index.js');

let fails = 0;
const check = (label, ok, detail = '') => {
  if (!ok) fails++;
  console.log(`   ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
};

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', hasTouch: true, isMobile: true });
  const p = await c.newPage();

  const boot = async (seed, arg) => {
    await p.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
    await p.waitForFunction(() => window.Storage && window.U);
    await p.evaluate(async ({ fn, a }) => { await Storage.clearAll(); await eval(`(${fn})`)(a); }, { fn: seed.toString(), a: arg });
    await p.reload({ waitUntil: 'load' });
    await p.waitForTimeout(2400);
    await p.evaluate(() => document.querySelectorAll('.splash').forEach(n => n.remove()));
  };

  // A known-numbers profile: manual 2200 kcal goal, manual 150 g protein,
  // one 420 kcal / 22 g meal today, three sessions this week of a 4-goal,
  // weigh-ins falling 81.7 -> 81.3 across the week.
  const seedKnown = async (workoutsThisWeek) => {
    const P = { onboarded: true, profileName: 'T', radialDiscovered: true,
      kcalGoalMode: 'manual', kcalGoal: 2200,
      macroGoalMode: 'manual', proteinGoal: 150, carbsGoal: 200, fatGoal: 70,
      weeklyWorkoutGoal: 4, lastBackupAt: new Date().toISOString() };
    for (const [k, v] of Object.entries(P)) await Storage.setPref(k, v);
    for (let d = 1; d <= (workoutsThisWeek || 0); d++) {
      const dt = new Date(); dt.setDate(dt.getDate() - d);
      await Storage.saveWorkout({ id: `w${d}`, name: 'Past', date: U.todayISO(dt),
        startedAt: dt.getTime(), completedAt: dt.getTime() + 3600e3,
        exercises: [{ exerciseId: 'bench-press-barbell', name: 'Bench', type: 'weighted',
          sets: [{ weight: 80, reps: 8, done: true }] }] });
    }
    for (let d = 7; d >= 1; d--) {
      const dt = new Date(); dt.setDate(dt.getDate() - d);
      await Storage.saveBodyweight({ date: U.todayISO(dt), kg: 81.3 + d * 0.057 });
    }
    await Storage.saveBodyweight({ date: U.todayISO(), kg: 81.3 });
    await Storage.saveMeal({ id: 'm1', name: 'Breakfast', kcal: 420, protein: 22, carbs: 60, fat: 10,
      section: 'breakfast', time: '08:00', date: U.todayISO(), savedAt: Date.now() });
  };

  console.log('=== 1. the ledger: three honest numbers on the first screen ===');
  await boot(seedKnown, 3);
  const ledger = await p.evaluate(() => {
    const n = document.querySelector('[data-testid="day-ledger"]');
    if (!n) return null;
    const cell = (t) => {
      const c = n.querySelector(`[data-testid="${t}"]`);
      return c ? { value: c.querySelector('.ledger-value').textContent, sub: c.querySelector('.ledger-sub').textContent } : null;
    };
    return {
      onFirstScreen: n.getBoundingClientRect().top < 844,
      fuel: cell('ledger-fuel'), body: cell('ledger-body'), week: cell('ledger-week')
    };
  });
  check('the ledger renders on the first screen', !!ledger && ledger.onFirstScreen, JSON.stringify(ledger && ledger.onFirstScreen));
  // 2200 goal - 420 eaten = 1,780 left; 150 - 22 = 128 g protein to go.
  check('Fuel = goal minus eaten, exactly', !!ledger && ledger.fuel.value.includes('1,780'), ledger && ledger.fuel.value);
  check('with protein remaining beside it', !!ledger && /P 128g/.test(ledger.fuel.sub), ledger && ledger.fuel.sub);
  check('no ≈ on a manual goal — the number is the user\'s own', !!ledger && !ledger.fuel.value.includes('≈'), ledger && ledger.fuel.value);
  check('Body shows the latest weigh-in', !!ledger && /81\.3\s*kg/.test(ledger.body.value), ledger && ledger.body.value);
  check('with the week\'s direction', !!ledger && /▼.*this wk/.test(ledger.body.sub), ledger && ledger.body.sub);
  check('Week counts sessions against the goal', !!ledger && ledger.week.value === '3 of 4', ledger && ledger.week.value);

  console.log('\n=== 2. each cell is a door ===');
  const fuelJump = await p.evaluate(async () => {
    document.querySelector('[data-testid="ledger-fuel"]')?.click();
    await new Promise(r => setTimeout(r, 900));
    const s = document.querySelector('[data-testid="home-section-today"]');
    return s ? Math.round(s.getBoundingClientRect().top) : null;
  });
  check('Fuel jumps to the food section', fuelJump != null && fuelJump > -60 && fuelJump < 220, String(fuelJump));

  const bodyJump = await p.evaluate(async () => {
    window.scrollTo(0, 0);
    document.querySelector('[data-testid="ledger-body"]')?.click();
    await new Promise(r => setTimeout(r, 1200));
    const trends = document.querySelector('[data-testid="home-section-trends"]');
    return {
      opened: trends && !trends.classList.contains('is-collapsed'),
      near: trends ? trends.getBoundingClientRect().top < 260 : null,
      pref: await Storage.getPref('homeTrendsOpen', null)
    };
  });
  check('Body opens the folded Trends chapter and lands there',
    !!bodyJump.opened && bodyJump.near === true && bodyJump.pref === true, JSON.stringify(bodyJump));

  console.log('\n=== 3. Trends starts folded, stays whole, remembers ===');
  await boot(seedKnown, 3);
  const folded = await p.evaluate(() => {
    const trends = document.querySelector('[data-testid="home-section-trends"]');
    const body = trends?.querySelector('.home-section-body');
    return {
      collapsed: trends?.classList.contains('is-collapsed'),
      hidden: body ? getComputedStyle(body).display === 'none' : null,
      // The content must still be in the DOM — the map suite probes it and
      // the nav jump lands on it.
      mapInDom: !!trends?.querySelector('[data-testid="home-muscle-map"], .muscle-balance, [data-testid="empty-muscle-start-workout"]'),
      pageScreens: (document.querySelector('#main')?.scrollHeight || 0) / 844
    };
  });
  check('collapsed by default', folded.collapsed === true && folded.hidden === true, JSON.stringify(folded));
  check('content stays in the DOM while folded', folded.mapInDom === true);
  check('Home fits in about two screens', folded.pageScreens > 0 && folded.pageScreens < 2.6, folded.pageScreens.toFixed(1));

  await p.evaluate(() => document.querySelector('[data-testid="home-trends-toggle"]')?.click());
  await p.waitForTimeout(1200);
  const opened = await p.evaluate(() => {
    const trends = document.querySelector('[data-testid="home-section-trends"]');
    return !trends.classList.contains('is-collapsed');
  });
  check('the toggle opens it', opened === true);
  await p.reload({ waitUntil: 'load' });
  await p.waitForTimeout(2400);
  const remembered = await p.evaluate(() => {
    const trends = document.querySelector('[data-testid="home-section-trends"]');
    return trends && !trends.classList.contains('is-collapsed');
  });
  check('and the choice survives a reload', remembered === true);

  console.log('\n=== 4. the planner pitch demotes itself once ignored ===');
  // Brand new: no plan, no workouts -> the full pitch earns its screen.
  await boot(async () => {
    for (const [k, v] of Object.entries({ onboarded: true, radialDiscovered: true })) await Storage.setPref(k, v);
  });
  const fresh = await p.evaluate(() => ({
    pitch: !!document.querySelector('[data-testid="starter-splits"]'),
    compact: !!document.querySelector('[data-testid="today-hero-compact"]')
  }));
  check('a new user still gets the full planner pitch', fresh.pitch && !fresh.compact, JSON.stringify(fresh));

  // Three workouts in, still no plan -> one quiet row.
  await boot(seedKnown, 3);
  const ignored = await p.evaluate(() => ({
    pitch: !!document.querySelector('[data-testid="starter-splits"]'),
    compact: !!document.querySelector('[data-testid="today-hero-compact"]'),
    ledgerLeads: (() => {
      const l = document.querySelector('[data-testid="day-ledger"]');
      const c = document.querySelector('[data-testid="today-hero-compact"]');
      return l && c ? l.getBoundingClientRect().top < c.getBoundingClientRect().top : null;
    })()
  }));
  check('three ignored workouts demote it to one row', !ignored.pitch && ignored.compact, JSON.stringify(ignored));
  check('and the ledger leads the page', ignored.ledgerLeads === true);

  const trainNow = await p.evaluate(async () => {
    document.querySelector('[data-testid="compact-pick-session"]')?.click();
    await new Promise(r => setTimeout(r, 1400));
    return !!document.querySelector('.view')?.textContent.match(/session|workout|exercise/i);
  });
  check('"Train now" opens the workout tab', trainNow === true);

  console.log('\n=== 5. honesty survives the redesign ===');
  // Estimated targets carry their ≈ into the ledger.
  await boot(async () => {
    for (const [k, v] of Object.entries({ onboarded: true, radialDiscovered: true })) await Storage.setPref(k, v);
    await Storage.saveMeal({ id: 'm1', name: 'B', kcal: 400, protein: 20, carbs: 50, fat: 12,
      section: 'breakfast', time: '08:00', date: U.todayISO(), savedAt: Date.now() });
  });
  const est = await p.evaluate(() => {
    const f = document.querySelector('[data-testid="ledger-fuel"] .ledger-value');
    return f ? f.textContent : null;
  });
  check('an estimated budget wears its ≈ in the ledger', !!est && est.includes('≈'), String(est));

  // No weigh-in -> a dash, never an invented number.
  const noBw = await p.evaluate(() => {
    const v = document.querySelector('[data-testid="ledger-body"] .ledger-value');
    const s = document.querySelector('[data-testid="ledger-body"] .ledger-sub');
    return { value: v?.textContent, sub: s?.textContent };
  });
  check('no weigh-in shows a dash, not a guess', noBw.value === '—' && /no weigh-in/.test(noBw.sub || ''), JSON.stringify(noBw));

  await p.evaluate(async () => { await Storage.clearAll(); });
  await b.close();
  console.log(`\n${fails === 0 ? 'ALL PASS' : fails + ' FAILED'}`);
  process.exit(fails === 0 ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
