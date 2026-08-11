// Grams-based portions: the feature that turns "180 g chicken, 250 g rice"
// from mental arithmetic into typing two numbers. Everything in MEALS_DB is
// stored per-100 g, so any weight is an exact scale — the suite checks the
// data (including the new raw ingredients), the arithmetic, and the flow.
//
//   node tests/grams.js   (needs `python3 -m http.server 8199` at the repo root)
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright/index.js');

let fails = 0;
const check = (label, ok, detail = '') => {
  if (!ok) fails++;
  console.log(`   ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
};

// ---- static: the database is sound ----------------------------------------
console.log('=== 1. every entry, dish or ingredient, is scalable and sane ===');
{
  const window = {};
  eval(fs.readFileSync(path.resolve(__dirname, '../data/meals.js'), 'utf8'));
  eval(fs.readFileSync(path.resolve(__dirname, '../data/ingredients.js'), 'utf8'));
  const db = window.MEALS_DB;
  check('the merged database holds the dishes plus the new ingredients', db.length >= 260, `${db.length} entries`);

  const ids = new Set();
  let dupes = 0, badShape = 0, badKcal = 0, badPresets = 0;
  const offenders = [];
  for (const e of db) {
    if (ids.has(e.id)) { dupes++; offenders.push(`dupe:${e.id}`); }
    ids.add(e.id);
    const shapeOk = e.id && e.name && Number.isFinite(e.p) && Number.isFinite(e.c) &&
      Number.isFinite(e.f) && Array.isArray(e.g) && e.g.length === 3 && e.unit;
    if (!shapeOk) { badShape++; offenders.push(`shape:${e.id}`); continue; }
    // Derived energy per 100 g must be physically plausible for food:
    // nothing edible except pure oil approaches 900 kcal/100 g.
    const kcal100 = 4 * (e.p + e.c) + 9 * e.f + (e.xk || 0);
    if (kcal100 < 0 || kcal100 > 905) { badKcal++; offenders.push(`kcal:${e.id}=${Math.round(kcal100)}`); }
    if (!(e.g[0] < e.g[1] && e.g[1] < e.g[2]) || e.g[0] < 3 || e.g[2] > 1500) {
      badPresets++; offenders.push(`presets:${e.id}=[${e.g}]`);
    }
  }
  check('no duplicate ids', dupes === 0, offenders.filter(s => s.startsWith('dupe')).join(', '));
  check('every entry has the full shape', badShape === 0, offenders.filter(s => s.startsWith('shape')).join(', '));
  check('every derived kcal/100g is physically plausible', badKcal === 0, offenders.filter(s => s.startsWith('kcal')).join(', '));
  check('every preset triple ascends and stays real-world', badPresets === 0, offenders.filter(s => s.startsWith('presets')).slice(0, 4).join(', '));

  // The staples a lifter actually weighs must exist, with state suffixes.
  const names = db.map(e => e.name.toLowerCase());
  for (const staple of ['chicken breast (raw)', 'white rice (dry)', 'white rice (cooked)',
    'rolled oats', 'whey protein', 'olive oil', 'whole egg', 'peanut butter']) {
    check(`the database carries ${staple}`, names.some(n => n.includes(staple.split(' (')[0]) &&
      (staple.includes('(') ? n.includes(staple.match(/\((\w+)/)[1]) : true)),
      staple);
  }

  // Spot-check the arithmetic anchors: values every reference agrees on.
  const anchor = (id, field, lo, hi) => {
    const e = db.find(x => x.id === id);
    if (!e) { check(`anchor ${id} exists`, false); return; }
    check(`${id}.${field} within [${lo}, ${hi}]`, e[field] >= lo && e[field] <= hi, `${e[field]}`);
  };
  anchor('chicken-breast-raw', 'p', 20, 25);
  anchor('olive-oil', 'f', 91, 100);
  anchor('rolled-oats-dry', 'c', 55, 70);
  anchor('whole-egg', 'p', 11, 14);
}

// ---- live: the flow --------------------------------------------------------
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctxOpts = { viewport: { width: 390, height: 844 }, serviceWorkers: 'block', hasTouch: true, isMobile: true };
  const c = await b.newContext(ctxOpts);
  const p = await c.newPage();
  await p.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
  await p.waitForFunction(() => window.Storage && window.U && window.MEALS_DB);
  await p.evaluate(async () => {
    await Storage.clearAll();
    for (const [k, v] of Object.entries({ onboarded: true, sex: 'male', dob: '1990-01-01', heightCm: 180 })) await Storage.setPref(k, v);
  });
  await p.reload({ waitUntil: 'load' });
  await p.waitForTimeout(2200);
  await p.evaluate(() => document.querySelectorAll('.splash').forEach(n => n.remove()));

  console.log('\n=== 2. search finds the raw ingredient, not just the dish ===');
  const hit = await p.evaluate(() => {
    const r = MealSearch.search('chicken breast raw', window.MEALS_DB, 5).results;
    return r.length ? { id: r[0].entry.id, name: r[0].entry.name } : null;
  });
  check('"chicken breast raw" resolves to the ingredient', !!hit && hit.id === 'chicken-breast-raw', JSON.stringify(hit));
  const typo = await p.evaluate(() => {
    const r = MealSearch.search('chiken brest', window.MEALS_DB, 5).results;
    return r.slice(0, 3).map(x => x.entry.id);
  });
  check('the typo tolerance covers it too', typo.some(id => id.startsWith('chicken-breast')), typo.join(', '));

  console.log('\n=== 3. the scale row: type a weight, macros follow exactly ===');
  // Open Quick Add through the real UI path.
  await p.evaluate(() => document.querySelector('[data-testid="dock-nutrition"]')?.click());
  await p.waitForTimeout(1600);
  await p.evaluate(() => document.querySelector('.nadd-btn')?.click());
  await p.waitForTimeout(700);
  await p.evaluate(() => document.querySelector('[data-testid="meal-fork-quick"]')?.click());
  await p.waitForTimeout(900);
  const hasSearch = await p.evaluate(() => !!document.querySelector('[data-testid="qa-search"]'));
  check('Quick Add is open', hasSearch);

  await p.fill('[data-testid="qa-search"]', 'chicken breast raw');
  await p.waitForTimeout(500);
  await p.evaluate(() => document.querySelector('[data-testid="qa-result-chicken-breast-raw"]')?.click());
  await p.waitForTimeout(500);
  const row = await p.evaluate(() => ({
    grams: !!document.querySelector('[data-testid="qa-grams-row"]'),
    presets: document.querySelectorAll('.qa-portion').length
  }));
  check('the expanded entry shows presets AND the scale row', row.grams && row.presets === 3, JSON.stringify(row));

  // 200 g of a per-100g entry must be exactly double the 100 g macros.
  const expected = await p.evaluate(() => {
    const e = window.MEALS_DB.find(x => x.id === 'chicken-breast-raw');
    return MealSearch.macrosFor(e, 200);
  });
  await p.fill('[data-testid="qa-grams-input"]', '200');
  await p.waitForTimeout(300);
  const preview = await p.evaluate(() => document.querySelector('[data-testid="qa-grams-preview"]')?.textContent || '');
  check('the live preview shows the scaled kcal', preview.includes(String(expected.kcal)), `${preview} vs ${expected.kcal}`);

  await p.evaluate(() => document.querySelector('[data-testid="qa-grams-log"]')?.click());
  await p.waitForTimeout(900);
  const logged = await p.evaluate(async () => {
    const meals = await Storage.getMeals();
    return meals[meals.length - 1] || null;
  });
  check('the meal is stored with the weight in its name', !!logged && /\(200 g\)/.test(logged.name), logged && logged.name);
  check('and with exactly the scaled macros',
    !!logged && logged.kcal === expected.kcal && logged.protein === expected.protein &&
    logged.carbs === expected.carbs && logged.fat === expected.fat,
    logged && `${logged.kcal} kcal P${logged.protein} C${logged.carbs} F${logged.fat}`);

  console.log('\n=== 4. dishes scale too, and nonsense weights are refused ===');
  await p.evaluate(() => document.querySelector('.nadd-btn')?.click());
  await p.waitForTimeout(700);
  await p.evaluate(() => document.querySelector('[data-testid="meal-fork-quick"]')?.click());
  await p.waitForTimeout(900);
  await p.fill('[data-testid="qa-search"]', 'spag bol');
  await p.waitForTimeout(500);
  await p.evaluate(() => document.querySelector('[data-testid="qa-result-spaghetti-bolognese"]')?.click());
  await p.waitForTimeout(500);
  const dishRow = await p.evaluate(() => !!document.querySelector('[data-testid="qa-grams-row"]'));
  check('a composite dish gets the scale row as well', dishRow);
  const before = await p.evaluate(async () => (await Storage.getMeals()).length);
  await p.fill('[data-testid="qa-grams-input"]', '0');
  await p.evaluate(() => document.querySelector('[data-testid="qa-grams-log"]')?.click());
  await p.waitForTimeout(700);
  const after = await p.evaluate(async () => ({
    meals: (await Storage.getMeals()).length,
    stillOpen: !!document.querySelector('[data-testid="qa-search"]')
  }));
  check('zero grams logs nothing and keeps the sheet open', after.meals === before && after.stillOpen, JSON.stringify(after));

  // A negative weight must refuse, and an absurd one must clamp: the scale
  // row cannot become the door for a -50 g or 50 kg meal poisoning the day.
  await p.fill('[data-testid="qa-grams-input"]', '-50');
  await p.evaluate(() => document.querySelector('[data-testid="qa-grams-log"]')?.click());
  await p.waitForTimeout(600);
  const negAfter = await p.evaluate(async () => (await Storage.getMeals()).length);
  check('negative grams are refused', negAfter === before, `${negAfter} meals`);

  await p.fill('[data-testid="qa-grams-input"]', '50000');
  await p.evaluate(() => document.querySelector('[data-testid="qa-grams-log"]')?.click());
  await p.waitForTimeout(900);
  const huge = await p.evaluate(async () => {
    const meals = await Storage.getMeals();
    return meals[meals.length - 1] || null;
  });
  const capExpected = await p.evaluate(() => {
    const e = window.MEALS_DB.find(x => x.id === 'spaghetti-bolognese');
    return MealSearch.macrosFor(e, 2000);
  });
  check('an absurd weight clamps to 2 kg, not 50', !!huge && huge.kcal === capExpected.kcal && /\(2000 g\)/.test(huge.name),
    huge && `${huge.name} · ${huge.kcal} kcal (cap ${capExpected.kcal})`);

  await p.evaluate(async () => { await Storage.clearAll(); });
  await b.close();
  console.log(`\n${fails === 0 ? 'ALL PASS' : fails + ' FAILED'}`);
  process.exit(fails === 0 ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
