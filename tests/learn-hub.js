// The Learn hub: the tab lands on a library, not a question. One search
// across everything the app knows, the old fork's two destinations as jump
// tiles (same testids — they are the same two doors), and the reading plus
// the exercise library untouched below.
//
//   node tests/learn-hub.js   (needs `python3 -m http.server 8199`)
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
  await p.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
  await p.waitForFunction(() => window.Storage && window.U);
  await p.evaluate(async () => {
    await Storage.clearAll();
    for (const [k, v] of Object.entries({ onboarded: true, radialDiscovered: true, lastBackupAt: new Date().toISOString() })) await Storage.setPref(k, v);
  });
  await p.reload({ waitUntil: 'load' });
  await p.waitForTimeout(2400);
  await p.evaluate(() => document.querySelectorAll('.splash').forEach(n => n.remove()));

  console.log('=== 1. the dock lands on the library, not a fork ===');
  await p.evaluate(() => document.querySelector('[data-testid="dock-library"]')?.click());
  await p.waitForTimeout(2600);
  await p.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"]').forEach(n => n.remove()));
  const landed = await p.evaluate(() => ({
    hub: !!document.querySelector('[data-testid="learn-hub"]'),
    forkSheet: !!document.querySelector('[data-testid="learn-fork"]'),
    search: !!document.querySelector('[data-testid="hub-search"]'),
    // The whole library is on the page beneath, nothing removed.
    articles: !!document.querySelector('[data-testid="learn-section"]'),
    map: !!document.querySelector('[data-testid="body-map"]')
  }));
  check('the hub is the landing', landed.hub && landed.search, JSON.stringify(landed));
  check('no fork sheet in the way', !landed.forkSheet);
  check('articles and the body map still live on the tab', landed.articles && landed.map);

  console.log('\n=== 2. one search across exercises and articles ===');
  await p.fill('[data-testid="hub-search"]', 'bench');
  await p.waitForTimeout(400);
  const bench = await p.evaluate(() =>
    [...document.querySelectorAll('.hub-result')].map(n => ({
      name: n.querySelector('.hub-result-name')?.textContent,
      kind: n.querySelector('.hub-result-kind')?.textContent
    })));
  check('"bench" finds the bench presses', bench.some(r => /Barbell Bench Press/.test(r.name)),
    bench.map(r => r.name).slice(0, 3).join(' | '));
  check('prefix beats word-prefix, then alphabetical',
    bench.length >= 2 && /^Bench/.test(bench[0].name) && /Barbell Bench Press/.test(bench[1].name),
    `${bench[0]?.name} then ${bench[1]?.name}`);

  await p.fill('[data-testid="hub-search"]', 'protein');
  await p.waitForTimeout(400);
  const protein = await p.evaluate(() =>
    [...document.querySelectorAll('.hub-result')].map(n => n.querySelector('.hub-result-kind')?.textContent));
  check('"protein" surfaces articles in the same list', protein.includes('article'), protein.join(','));

  // An exercise hit opens the exercise detail sheet.
  await p.fill('[data-testid="hub-search"]', 'barbell bench press');
  await p.waitForTimeout(400);
  await p.evaluate(() => document.querySelector('[data-testid="hub-result-exercise-bench-press-barbell"]')?.click());
  await p.waitForTimeout(1000);
  const exOpen = await p.evaluate(() => {
    const m = document.querySelector('.modal, .sheet, [role="dialog"], .exercise-detail');
    return m ? /Barbell Bench Press/i.test(m.textContent) : false;
  });
  check('tapping an exercise result opens its detail', exOpen === true);
  await p.evaluate(() => document.querySelectorAll('.modal-overlay, .modal, .sheet').forEach(n => n.remove()));

  // Nonsense gets an honest empty state, not a blank void.
  await p.fill('[data-testid="hub-search"]', 'zzzqqq');
  await p.waitForTimeout(400);
  check('no matches says so', await p.evaluate(() => !!document.querySelector('[data-testid="hub-no-results"]')));

  console.log('\n=== 3. the fork\'s doors survive as jump tiles ===');
  await p.fill('[data-testid="hub-search"]', '');
  await p.waitForTimeout(300);
  const centreJump = await p.evaluate(async () => {
    document.querySelector('[data-testid="learn-fork-centre"]')?.click();
    await new Promise(r => setTimeout(r, 900));
    const s = document.querySelector('[data-testid="learn-section"]');
    return s ? Math.round(s.getBoundingClientRect().top) : null;
  });
  check('Learning Centre tile lands on the reading', centreJump != null && centreJump > -80 && centreJump < 240, String(centreJump));
  const mapJump = await p.evaluate(async () => {
    window.scrollTo(0, 0);
    document.querySelector('[data-testid="learn-fork-bodymap"]')?.click();
    await new Promise(r => setTimeout(r, 900));
    const s = document.querySelector('[data-testid="body-map"]');
    return s ? Math.round(s.getBoundingClientRect().top) : null;
  });
  check('Body map tile lands on the map', mapJump != null && mapJump > -80 && mapJump < 300, String(mapJump));

  await p.evaluate(async () => { await Storage.clearAll(); });
  await b.close();
  console.log(`\n${fails === 0 ? 'ALL PASS' : fails + ' FAILED'}`);
  process.exit(fails === 0 ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
