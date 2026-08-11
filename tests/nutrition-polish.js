// The Nutrition polish: one source for "kcal left" (the ring — the header
// figure sixty pixels above it is gone), the saved-meals shortcut sized as
// a shortcut, and the one genuinely new number the screen lacked — how
// today compares to your own typical day at this hour, in the calibrator's
// refusal-first voice.
//
//   node tests/nutrition-polish.js   (needs `python3 -m http.server 8199`)
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

  const boot = async (histDays) => {
    await p.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
    await p.waitForFunction(() => window.Storage && window.U);
    await p.evaluate(async (days) => {
      await Storage.clearAll();
      for (const [k, v] of Object.entries({ onboarded: true, radialDiscovered: true, lastBackupAt: new Date().toISOString() })) await Storage.setPref(k, v);
      const today = new Date();
      // History: `days` past days, each 500 kcal at 00:05 + 700 at 23:55 —
      // so whatever hour the test runs, "by now" ≥ 500 and the late meal is
      // out of the by-now window unless it is nearly midnight.
      for (let d = 1; d <= days; d++) {
        const dt = new Date(today); dt.setDate(dt.getDate() - d);
        const iso = U.todayISO(dt);
        await Storage.saveMeal({ id: `a${d}`, name: 'Early', kcal: 500, protein: 30, carbs: 50, fat: 15, section: 'breakfast', time: '00:05', date: iso, savedAt: dt.getTime() });
        await Storage.saveMeal({ id: `b${d}`, name: 'Late', kcal: 700, protein: 40, carbs: 60, fat: 20, section: 'dinner', time: '23:55', date: iso, savedAt: dt.getTime() });
      }
      await Storage.saveMeal({ id: 'today1', name: 'Today early', kcal: 300, protein: 20, carbs: 30, fat: 10, section: 'breakfast', time: '00:10', date: U.todayISO(), savedAt: Date.now() });
    }, histDays);
    await p.reload({ waitUntil: 'load' });
    await p.waitForTimeout(2400);
    await p.evaluate(() => document.querySelectorAll('.splash').forEach(n => n.remove()));
    await p.evaluate(() => document.querySelector('[data-testid="dock-nutrition"]')?.click());
    await p.waitForTimeout(2600);
    await p.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"]').forEach(n => n.remove()));
    await p.waitForTimeout(400);
  };

  console.log('=== 1. one source for kcal-left ===');
  await boot(10);
  const heads = await p.evaluate(() => ({
    headKcal: !!document.querySelector('.npanel-overview .npanel-head-kcal'),
    ringSaysLeft: /LEFT/i.test(document.querySelector('.npanel-overview')?.textContent || ''),
    savedRow: (() => {
      const n = document.querySelector('[data-testid="saved-hero"]');
      return n ? Math.round(n.getBoundingClientRect().height) : null;
    })()
  }));
  check('the header no longer repeats the ring\'s number', !heads.headKcal);
  check('the ring still owns it', heads.ringSaysLeft);
  check('saved meals is a row, not a hero card', heads.savedRow != null && heads.savedRow <= 62, `${heads.savedRow}px tall`);

  console.log('\n=== 2. "most days by now" — the median, honestly ===');
  // 10 identical history days at 500 kcal by-now (the 23:55 meal is outside
  // the window unless the suite runs at midnight) → median 500; today 300.
  const line = await p.evaluate(() => document.querySelector('[data-testid="usual-line"]')?.textContent || null);
  const nearMidnight = new Date().getHours() === 23 && new Date().getMinutes() >= 55;
  if (!nearMidnight) {
    check('the line is up with the median of the user\'s own days', !!line && /≈500 kcal/.test(line), String(line));
    check('and today\'s by-now figure beside it', !!line && /today 300/.test(line), String(line));
    check('the median wears its ≈', !!line && line.includes('≈'));
  } else {
    console.log('   (skipping exact-figure checks within 5 minutes of midnight)');
  }

  console.log('\n=== 3. it refuses without the data ===');
  await boot(4); // four days of history — below the seven-day floor
  const thin = await p.evaluate(() => !!document.querySelector('[data-testid="usual-line"]'));
  check('under seven logged days: no line, not a guessed one', !thin);

  await p.evaluate(async () => { await Storage.clearAll(); });
  await b.close();
  console.log(`\n${fails === 0 ? 'ALL PASS' : fails + ' FAILED'}`);
  process.exit(fails === 0 ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
