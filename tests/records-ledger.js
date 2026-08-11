// The You tab's records ledger: one ranked list where there used to be the
// same numbers twice (hero tiles above, "All records" below) with a giant
// weekly-goal ring between them that Home's ledger already owns. Each row
// now tells the story — best on the right, last-trained and session count
// on the left, and the e1RM trend drawn as a sparkline, rounded and wearing
// its ≈ because an estimate pretending to two decimals is a lie of type.
//
//   node tests/records-ledger.js   (needs `python3 -m http.server 8199`)
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

  const boot = async (units) => {
    await p.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
    await p.waitForFunction(() => window.Storage && window.U);
    await p.evaluate(async (u) => {
      await Storage.clearAll();
      for (const [k, v] of Object.entries({ onboarded: true, radialDiscovered: true, units: u,
        lastBackupAt: new Date().toISOString() })) await Storage.setPref(k, v);
      const today = new Date();
      // Bench rises across five sessions; the squat is heavier; the row
      // exercise trained once has no trend to draw.
      for (let i = 0; i < 5; i++) {
        const dt = new Date(today); dt.setDate(dt.getDate() - (10 - i * 2));
        await Storage.saveWorkout({ id: `w${i}`, name: 'S', date: U.todayISO(dt),
          startedAt: dt.getTime(), completedAt: dt.getTime() + 3600e3,
          exercises: [
            { exerciseId: 'bench-press-barbell', name: 'Bench', type: 'weighted',
              sets: [{ weight: 80 + i * 2.5, reps: 5, done: true }] },
            { exerciseId: 'squat-barbell-back', name: 'Squat', type: 'weighted',
              sets: [{ weight: 120 + i * 2.5, reps: 5, done: true }] }
          ] });
      }
      const dt = new Date(today); dt.setDate(dt.getDate() - 1);
      await Storage.saveWorkout({ id: 'once', name: 'Once', date: U.todayISO(dt),
        startedAt: dt.getTime(), completedAt: dt.getTime() + 3600e3,
        exercises: [{ exerciseId: 'bicep-curl-dumbbell', name: 'Curl', type: 'weighted',
          sets: [{ weight: 14, reps: 10, done: true }] }] });
    }, units);
    await p.reload({ waitUntil: 'load' });
    await p.waitForTimeout(2400);
    await p.evaluate(() => document.querySelectorAll('.splash').forEach(n => n.remove()));
    await p.evaluate(() => document.querySelector('[data-testid="dock-stats"]')?.click());
    await p.waitForTimeout(2600);
    await p.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"]').forEach(n => n.remove()));
    await p.waitForTimeout(400);
  };

  console.log('=== 1. one list, no duplicates, no borrowed ring ===');
  await boot('metric');
  const shape = await p.evaluate(() => ({
    heroTiles: !!document.querySelector('.stats-hero-card, .stats-hero-pr'),
    ring: !!document.querySelector('.stats-ring, .stats-week-card'),
    ledger: !!document.querySelector('[data-testid="records-row-bench-press-barbell"]'),
    rows: document.querySelectorAll('.stats-record-row').length
  }));
  check('the hero tiles are gone', !shape.heroTiles);
  check('the weekly-goal ring is gone — Home owns that number', !shape.ring);
  check('the ledger lists every trained exercise once', shape.ledger && shape.rows === 3, `${shape.rows} rows`);

  console.log('\n=== 2. each row tells the story ===');
  const bench = await p.evaluate(() => {
    const r = document.querySelector('[data-testid="records-row-bench-press-barbell"]');
    return r ? {
      meta: r.querySelector('.stats-record-meta')?.textContent,
      value: r.querySelector('.stats-record-value')?.textContent,
      spark: !!r.querySelector('[data-testid="records-spark"] svg, [data-testid="records-spark"] .sparkline, [data-testid="records-spark"] *')
    } : null;
  });
  check('best weight on the right, in display units', !!bench && /90/.test(bench.value) && /kg/.test(bench.value), bench && bench.value);
  check('last-trained and session count on the left', !!bench && /sessions/.test(bench.meta) && /(d ago|Today|Yesterday)/.test(bench.meta), bench && bench.meta);
  check('e1RM wears its ≈ and rounds whole — no false precision',
    !!bench && /e1RM ≈\d+kg/.test(bench.meta) && !/≈\d+\.\d/.test(bench.meta), bench && bench.meta);
  check('a lift with history draws its trend', !!bench && bench.spark);

  const curl = await p.evaluate(() => {
    const r = document.querySelector('[data-testid="records-row-bicep-curl-dumbbell"]');
    return r ? { spark: !!r.querySelector('[data-testid="records-spark"]') } : null;
  });
  check('one session means no trend line, not a fake one', !!curl && !curl.spark);

  const order = await p.evaluate(() =>
    [...document.querySelectorAll('.stats-record-row .stats-record-name')].map(n => n.textContent.slice(0, 12)));
  check('ranked heaviest first', order[0].includes('Squat'), order.join(' | '));

  const opens = await p.evaluate(async () => {
    document.querySelector('[data-testid="records-row-bench-press-barbell"]')?.click();
    await new Promise(r => setTimeout(r, 1000));
    const m = document.querySelector('.modal, .sheet, [role="dialog"], .exercise-detail');
    return m ? /Bench Press/i.test(m.textContent) : false;
  });
  check('tapping a row opens the exercise', opens === true);

  console.log('\n=== 3. imperial mode speaks pounds ===');
  await boot('imperial');
  const imp = await p.evaluate(() => {
    const r = document.querySelector('[data-testid="records-row-bench-press-barbell"]');
    return r ? {
      value: r.querySelector('.stats-record-value')?.textContent,
      meta: r.querySelector('.stats-record-meta')?.textContent
    } : null;
  });
  // 90 kg must ARRIVE as 198.4 lb — a raw kilogram number wearing a lb
  // suffix once shipped here and passed a unit-only check.
  check('best is in pounds, magnitude converted', !!imp && /198\.4/.test(imp.value) && /lb/.test(imp.value) && !/kg/.test(imp.value), imp && imp.value);
  check('so is the e1RM estimate', !!imp && /e1RM ≈\d+lb/.test(imp.meta), imp && imp.meta);

  await p.evaluate(async () => { await Storage.clearAll(); });
  await b.close();
  console.log(`\n${fails === 0 ? 'ALL PASS' : fails + ' FAILED'}`);
  process.exit(fails === 0 ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
