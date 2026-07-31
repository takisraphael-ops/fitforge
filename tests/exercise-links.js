// Variations and alternatives: link the ones that go somewhere, and only those.
//
// 904 references sat in the library as dead text. The tempting fix is fuzzy
// matching, and it is a trap:
//
//   "Weighted pull-up" is 90% of the way to "Pull-Up"
//
// A link there returns you to the page you are already on. Dead text is
// honest; a link that lands you where you started is worse, because you tapped
// it expecting somewhere new. So the single most important thing this suite
// does is section 2 — it takes every qualified variation in the library and
// demands that none of them resolves to its own base exercise.
//
//   node tests/exercise-links.js   (needs `python3 -m http.server 8199`)
const path = require('path');
const fs = require('fs');

let fails = 0;
const check = (label, ok, detail = '') => {
  if (!ok) fails++;
  console.log(`   ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
};

const ROOT = path.resolve(__dirname, '..');
const G = {};
const load = (rel) => new Function('window', fs.readFileSync(path.join(ROOT, rel), 'utf8'))(G);
load('data/exercises.js');
load('js/exercise-links.js');
global.window = G;
const L = G.ExerciseLinks;
const DB = G.EXERCISE_DB;
const byId = (id) => DB.find((e) => e.id === id);

// ================= 1. the normaliser =================
console.log('=== 1. normalising names ===');
{
  check('case and punctuation do not matter', L.norm('Push-Up') === L.norm('push up'));
  check('parentheticals are dropped',
    L.norm('Bench dip (beginner)') === L.norm('Bench Dip'), L.norm('Bench dip (beginner)'));
  check('a genuine plural is singularised', L.norm('Push-ups') === L.norm('Push-Up'), L.norm('Push-ups'));
  // The bug that made the first measurement wrong: a blanket trailing-s strip
  // turns Raise into Raie and Press into Pres.
  check('"Raise" survives singularisation', L.norm('Lateral Raise') === 'lateral raise', L.norm('Lateral Raise'));
  check('"Press" survives it too', L.norm('Bench Press') === 'bench press', L.norm('Bench Press'));
  check('word order is normalised separately, not by default',
    L.norm('Chest press machine') !== L.norm('Machine Chest Press') &&
    L.orderless('Chest press machine') === L.orderless('Machine Chest Press'));
}

// ================= 2. no link may lie =================
console.log('\n=== 2. a link never returns you to where you started ===');
{
  // Every variation and alternative, checked against the exercise it is
  // listed on. Resolving to yourself is the failure mode.
  const selfLinks = [];
  for (const e of DB) {
    for (const v of [...(e.variations || []), ...(e.alternatives || [])]) {
      if (L.resolve(v) === e.id) selfLinks.push(`${e.id}: "${v}"`);
    }
  }
  // Some of these are legitimate data duplicates rather than bad matching —
  // report them either way, because the renderer must not draw them as links.
  check('no entry resolves to the exercise it is listed on',
    selfLinks.length === 0, selfLinks.slice(0, 6).join(' | '));

  // The specific trap, spelled out.
  const traps = [
    ['Weighted pull-up', 'pull-up'], ['Wide push-up', 'push-up'],
    ['L-sit pull-up', 'pull-up'], ['Archer pull-up', 'pull-up'],
    ['Incline dumbbell fly', 'dumbbell-fly'], ['Weighted chin-up', 'chin-up'],
    ['Deficit push-up', 'push-up'], ['Single-leg press', 'leg-press']
  ];
  const wrong = traps.filter(([text, base]) => L.resolve(text) === base);
  check('a qualified variation never resolves to its base movement',
    wrong.length === 0, wrong.map(([t]) => t).join(', '));
  check('and those strings resolve to nothing at all',
    traps.every(([t]) => L.resolve(t) === null),
    traps.filter(([t]) => L.resolve(t)).map(([t]) => `${t}->${L.resolve(t)}`).join(', '));
}

// ================= 3. the hand-written aliases =================
console.log('\n=== 3. the curated list ===');
{
  const aliases = Object.entries(L.ALIASES);
  check('there are some', aliases.length > 0, `${aliases.length}`);
  const dead = aliases.filter(([, id]) => !byId(id));
  check('every alias points at a real exercise', dead.length === 0, dead.map(([k]) => k).join(', '));

  // The guard that keeps the list honest: an alias may be a SHORTER name for
  // the same movement, never the full name plus qualifying words.
  const qualifiers = aliases.filter(([k, id]) => {
    const target = L.norm(byId(id).name).split(' ');
    const key = k.split(' ');
    return key.length > target.length && target.every((w) => key.includes(w));
  });
  check('no alias is its target plus extra words', qualifiers.length === 0,
    qualifiers.map(([k, id]) => `${k} -> ${id}`).join(', '));

  // An alias that the name already matches is noise, and implies the two
  // differ when they do not.
  const byName = new Map(DB.map((e) => [L.norm(e.name), e.id]));
  const redundant = aliases.filter(([k]) => byName.has(k));
  check('no alias duplicates an exact name match', redundant.length === 0,
    redundant.map(([k]) => k).join(', '));

  check('every alias key is already normalised',
    aliases.every(([k]) => L.norm(k) === k),
    aliases.filter(([k]) => L.norm(k) !== k).map(([k]) => k).join(', '));

  // Two exercises can normalise to the same string — "Glute Bridge" and
  // "Glute Bridge (Warm-up)" do, once the parenthetical goes. That is allowed
  // as long as resolution is deterministic and picks the one a reader means,
  // which is the training exercise rather than the mobility drill. Asserting
  // no collisions at all would be stricter than the problem.
  const seen = new Map();
  const collisions = [];
  for (const e of DB) {
    const k = L.orderless(e.name);
    if (seen.has(k)) collisions.push([seen.get(k), e.id]);
    else seen.set(k, e.id);
  }
  const wrongWinner = collisions.filter(([first, second]) => {
    const winner = L.resolve(byId(first).name);
    // The mobility copy must never win a collision.
    return winner === second || String(winner).startsWith('mob-');
  });
  check('where two names collide, the training exercise wins',
    wrongWinner.length === 0, wrongWinner.map((p) => p.join(' / ')).join(', '));
  if (collisions.length) console.log(`   (${collisions.length} benign collision: ${collisions.map((p) => p.join(' / ')).join(', ')})`);
}

// ================= 4. how much actually lights up =================
console.log('\n=== 4. coverage ===');
{
  const c = L.coverage(DB);
  console.log(`   ${c.linked} of ${c.refs} references resolve (${c.pct}%)`);
  // A floor, not a target. If a future change drops it sharply something has
  // broken in the normaliser rather than in the data.
  check('a meaningful share of references link', c.pct >= 25, `${c.pct}%`);
  check('and the rest are left alone rather than guessed at', c.linked < c.refs);

  // Spot-check a few that must work.
  const must = [
    ['Chin-up', 'chin-up'], ['Lat pulldown', 'lat-pulldown'], ['Goblet squat', 'goblet-squat'],
    ['Barbell row', 'row-barbell'], ['Front squat', 'squat-front'], ['Chest press machine', 'machine-chest-press'],
    ['Bench dip (beginner)', 'bench-dip'], ['Push-ups', 'push-up']
  ];
  const broken = must.filter(([t, id]) => L.resolve(t) !== id);
  check('the obvious ones all resolve', broken.length === 0,
    broken.map(([t, id]) => `${t} -> ${L.resolve(t)} (want ${id})`).join('; '));
}

// ================= the app =================
const { chromium } = require('/opt/node22/lib/node_modules/playwright/index.js');

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', hasTouch: true });
  const page = await c.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push('PAGEERR: ' + e.message));

  await page.goto('http://localhost:8199/index.html', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.Storage && window.ExerciseLinks);
  await page.evaluate(async () => {
    await Storage.clearAll();
    for (const [k, v] of Object.entries({
      onboarded: true, sex: 'male', dob: '1992-03-04', heightCm: 180, activityLevel: 'light', kcalGoal: 2200
    })) await Storage.setPref(k, v);
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2600);

  const openEx = async (id) => {
    await page.evaluate(() => document.querySelector('[data-testid="dock-library"]').click());
    await page.waitForTimeout(700);
    await page.evaluate(() => document.querySelector('[data-testid="learn-fork-centre"]')?.click());
    await page.waitForTimeout(1500);
    await page.evaluate((exId) => {
      const s = [...document.querySelectorAll('input')].find((i) => /search/i.test(i.placeholder || ''));
      s.value = exId; s.dispatchEvent(new Event('input', { bubbles: true }));
    }, id);
    await page.waitForTimeout(900);
    await page.evaluate((exId) => document.querySelector(`[data-ex-id="${exId}"]`)?.click(), id);
    await page.waitForTimeout(1400);
  };

  console.log('\n=== 5. on the page ===');
  await openEx('pull-up');
  const links = await page.$$eval('[data-testid="related-link"]',
    (ns) => ns.map((n) => `${n.textContent.replace(/›/g, '').trim()}->${n.dataset.target}`));
  check('some entries are links', links.length > 0, links.join(', '));
  const plain = await page.$$eval('.detail-section ul li:not(.related-li)', (ns) => ns.length);
  check('and the unresolvable ones are still plain text', plain > 0, `${plain} plain`);
  check('no link points back at the page you are on',
    !links.some((l) => l.endsWith('->pull-up')), links.join(', '));

  // Tapping one has to actually land somewhere else.
  const before = await page.$eval('.modal-title, .modal-header', (e) => e.textContent.trim()).catch(() => '');
  await page.click('[data-testid="related-link"]');
  await page.waitForTimeout(1400);
  const after = await page.$eval('.modal-title, .modal-header', (e) => e.textContent.trim()).catch(() => '');
  check('tapping one opens a different exercise', before && after && before !== after, `${before} -> ${after}`);

  console.log('\nERRORS:', errs.length ? errs : 'none');
  console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
