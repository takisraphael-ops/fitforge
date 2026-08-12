// Logging a session on a past day, after the user report that exercises
// could not be searched from there. The wall was real: the "What did you
// do?" sheet offered 69 presets with no search, and the only exercise-level
// route was a footer button called "Blank session" that never said where it
// led. Now the sheet searches sessions BY the exercises inside them, jumps
// to the panel that has the hits, and "Pick exercises" goes straight into
// the searchable exercise picker and lands in the editor with the picks
// in place and ticked.
//
//   node tests/past-session.js   (needs `python3 -m http.server 8199`)
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

  const toSheet = async () => {
    await p.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
    await p.waitForFunction(() => window.Storage && window.U);
    await p.evaluate(async () => {
      await Storage.clearAll();
      for (const [k, v] of Object.entries({ onboarded: true, radialDiscovered: true, lastBackupAt: new Date().toISOString() })) await Storage.setPref(k, v);
      const dt = new Date(); dt.setDate(dt.getDate() - 3);
      await Storage.saveWorkout({ id: 'seed', name: 'Push', date: U.todayISO(dt), startedAt: dt.getTime(), completedAt: dt.getTime() + 3600e3,
        exercises: [{ exerciseId: 'bench-press-barbell', name: 'Bench', type: 'weighted', sets: [{ weight: 80, reps: 8, done: true }] }] });
    });
    await p.reload({ waitUntil: 'load' });
    await p.waitForTimeout(2400);
    await p.evaluate(() => document.querySelectorAll('.splash').forEach(n => n.remove()));
    await p.evaluate(() => document.querySelector('[data-testid="dock-stats"]')?.click());
    await p.waitForTimeout(2400);
    await p.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"]').forEach(n => n.remove()));
    await p.evaluate(() => { [...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'History')?.click(); });
    await p.waitForTimeout(1400);
    await p.evaluate(() => document.querySelector('[data-testid="log-past-session"]')?.click());
    await p.waitForTimeout(900);
    await p.evaluate(() => document.querySelector('[data-testid="date-sheet-ok"]')?.click());
    await p.waitForTimeout(1100);
  };

  console.log('=== 1. the session sheet searches — by exercise, not just name ===');
  await toSheet();
  check('the sheet has a search field', await p.evaluate(() => !!document.querySelector('[data-testid="sess-search"]')));
  const bench = await p.evaluate(async () => {
    const s = document.querySelector('[data-testid="sess-search"]');
    s.value = 'bench';
    s.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise(r => setTimeout(r, 700));
    const cards = [...document.querySelectorAll('.sess-card')];
    // The panel the pager settled on after the search.
    const activeChip = document.querySelector('[data-testid="sess-chips"] .xpick-chip.active');
    const activeKey = activeChip?.getAttribute('data-cat');
    const activePanel = document.querySelector(`.xpick-panel[data-cat="${activeKey}"]`);
    return {
      total: cards.length,
      activeKey,
      activeHasCards: activePanel ? activePanel.querySelectorAll('.sess-card').length : 0
    };
  });
  check('"bench" finds the sessions that bench', bench.total > 0, `${bench.total} cards`);
  check('and the pager jumped to a panel that has them — never "0" with hits elsewhere',
    bench.activeHasCards > 0, `${bench.activeKey}: ${bench.activeHasCards}`);

  // A refinement typed while already on the winning panel must not bounce
  // the pager somewhere else.
  const stable = await p.evaluate(async () => {
    const before = document.querySelector('[data-testid="sess-chips"] .xpick-chip.active')?.getAttribute('data-cat');
    const s = document.querySelector('[data-testid="sess-search"]');
    s.value = 'bench press';
    s.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise(r => setTimeout(r, 700));
    const after = document.querySelector('[data-testid="sess-chips"] .xpick-chip.active')?.getAttribute('data-cat');
    const activePanel = document.querySelector(`.xpick-panel[data-cat="${after}"]`);
    return { before, after, hits: activePanel ? activePanel.querySelectorAll('.sess-card').length : 0 };
  });
  check('refining the query does not bounce a panel that still has hits',
    stable.hits > 0 && stable.before === stable.after, JSON.stringify(stable));

  const none = await p.evaluate(async () => {
    const s = document.querySelector('[data-testid="sess-search"]');
    s.value = 'zzzqqq';
    s.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise(r => setTimeout(r, 500));
    return document.body.textContent.includes('No sessions match');
  });
  check('nonsense says "no sessions match", with the clear escape', none === true);

  console.log('\n=== 2. Pick exercises: search-first, lands ready ===');
  const btnLabel = await p.evaluate(() => document.querySelector('[data-testid="past-blank"]')?.textContent);
  check('the footer button says where it goes', btnLabel === 'Pick exercises', String(btnLabel));
  await p.evaluate(() => document.querySelector('[data-testid="past-blank"]')?.click());
  await p.waitForTimeout(1200);
  const picker = await p.evaluate(() => {
    const search = [...document.querySelectorAll('input')].find(i => /Search exercises/i.test(i.placeholder || ''));
    if (!search) return { search: false };
    const r = search.getBoundingClientRect();
    return { search: true, visible: r.width > 0 && r.top >= 0 && r.top < 400 };
  });
  check('the exercise picker opens with search front and centre', picker.search && picker.visible, JSON.stringify(picker));

  const found = await p.evaluate(async () => {
    const search = [...document.querySelectorAll('input')].find(i => /Search exercises/i.test(i.placeholder || ''));
    search.value = 'deadlift';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise(r => setTimeout(r, 600));
    return [...document.querySelectorAll('.xrow')].length;
  });
  check('typing "deadlift" finds the deadlifts', found >= 2, `${found} rows`);

  const created = await p.evaluate(async () => {
    const row = document.querySelector('.xrow');
    (row.querySelector('button') || row).click();
    await new Promise(r => setTimeout(r, 500));
    const cta = document.querySelector('[data-testid="xpick-cta"]');
    const label = cta?.textContent || '';
    cta?.click();
    await new Promise(r => setTimeout(r, 1800));
    const w = (await Storage.getWorkouts()).find(x => x.source === 'backlog');
    return {
      label,
      exists: !!w,
      onDate: w ? w.date : null,
      names: w ? w.exercises.map(e => e.name) : [],
      ticked: w ? w.exercises.every(e => e.sets.every(s => s.done)) : false,
      editorOpen: !!document.querySelector('[data-testid="wd-add-exercise"]')
    };
  });
  check('the confirm names the day', /Log 1 on/.test(created.label), created.label);
  check('the workout lands on the chosen past day', created.exists && !!created.onDate, created.onDate);
  check('with the picked exercise, sets arriving ticked', /Deadlift/i.test(created.names.join()) && created.ticked, created.names.join(', '));
  check('and the editor opens to fill in the numbers', created.editorOpen);

  console.log('\n=== 3. the empty-session escape survives ===');
  await toSheet();
  await p.evaluate(() => document.querySelector('[data-testid="past-blank"]')?.click());
  await p.waitForTimeout(1200);
  await p.evaluate(() => document.querySelector('[data-testid="past-empty"]')?.click());
  await p.waitForTimeout(1600);
  const empty = await p.evaluate(async () => {
    const w = (await Storage.getWorkouts()).find(x => x.source === 'backlog');
    return { exists: !!w, exercises: w ? (w.exercises || []).length : null, editorOpen: !!document.querySelector('[data-testid="wd-add-exercise"]') };
  });
  check('"Empty session" still creates the bare record in the editor',
    empty.exists && empty.exercises === 0 && empty.editorOpen, JSON.stringify(empty));

  await p.evaluate(async () => { await Storage.clearAll(); });
  await b.close();
  console.log(`\n${fails === 0 ? 'ALL PASS' : fails + ' FAILED'}`);
  process.exit(fails === 0 ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
