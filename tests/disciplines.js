// Disciplines: a second axis across the library, and the two ways it rots.
//
// The first is a tag that stops narrowing anything. "Bodybuilding" would match
// most of the library, and a filter that returns 110 of 151 exercises is not a
// filter. Section 1 puts a ceiling on how much of the library any one tag may
// claim, so the next tag added has to earn its place.
//
// The second is a tag that quietly implies completeness. Nine exercises under
// "Hyrox" reads as "Hyrox is nine exercises" unless something says otherwise —
// five of the eight stations have no exercise in the library at all. Each
// discipline that is short carries a `missing` note, and section 1 checks the
// short ones have one.
//
//   node tests/disciplines.js   (needs `python3 -m http.server 8199`)
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
load('data/disciplines.js');
const DB = G.EXERCISE_DB;
const D = G.DISCIPLINES;
const ids = new Set(DB.map((e) => e.id));

// ================= 1. the data =================
console.log('=== 1. the tags ===');
{
  check('disciplines loaded', D.length >= 3, `${D.length}`);
  check('ids are unique', new Set(D.map((d) => d.id)).size === D.length);
  check('each has a label and a blurb', D.every((d) => d.id && d.label && d.blurb));

  const dangling = D.flatMap((d) => d.exercises.filter((x) => !ids.has(x)).map((x) => `${d.id}:${x}`));
  check('every tagged exercise exists', dangling.length === 0, dangling.join(', '));

  const dupes = D.flatMap((d) => {
    const seen = new Set(), out = [];
    for (const x of d.exercises) { if (seen.has(x)) out.push(`${d.id}:${x}`); seen.add(x); }
    return out;
  });
  check('no discipline lists the same exercise twice', dupes.length === 0, dupes.join(', '));

  // The ceiling. A tag matching most of the library tells you nothing.
  const wide = D.filter((d) => d.exercises.length / DB.length > 0.4);
  check('no tag claims more than 40% of the library', wide.length === 0,
    wide.map((d) => `${d.id} ${Math.round(d.exercises.length / DB.length * 100)}%`).join(', '));
  // And a floor: a tag with three exercises is not worth a chip.
  const thin = D.filter((d) => d.exercises.length < 5);
  check('no tag is too thin to be worth filtering by', thin.length === 0,
    thin.map((d) => `${d.id} ${d.exercises.length}`).join(', '));

  for (const d of D) {
    console.log(`   ${d.id.padEnd(14)} ${String(d.exercises.length).padStart(3)}  (${Math.round(d.exercises.length / DB.length * 100)}%)`);
  }

  // Overlap is the point — a back squat is powerlifting and CrossFit — but two
  // tags with the same membership would be one tag with two names.
  const pairs = [];
  for (let i = 0; i < D.length; i++) {
    for (let j = i + 1; j < D.length; j++) {
      const a = new Set(D[i].exercises), b = D[j].exercises;
      const shared = b.filter((x) => a.has(x)).length;
      const smaller = Math.min(a.size, b.length);
      if (shared / smaller > 0.9) pairs.push(`${D[i].id}/${D[j].id}`);
    }
  }
  check('no two disciplines are the same set under different names',
    pairs.length === 0, pairs.join(', '));

  // Honesty about coverage: a discipline the library only partly covers must
  // say so, or the chip overstates what is there.
  const shortOnes = D.filter((d) => d.exercises.length < 20);
  const silent = shortOnes.filter((d) => !d.missing);
  check('a thinly covered discipline admits what is missing', silent.length === 0,
    silent.map((d) => d.id).join(', '));

  // This is an axis, not a re-categorisation: it must cut across body parts.
  for (const d of D) {
    const cats = new Set(d.exercises.map((x) => DB.find((e) => e.id === x).category));
    check(`${d.id} spans more than one body part`, cats.size > 1, [...cats].join(', '));
  }
}

// ================= the app =================
const { chromium } = require('/opt/node22/lib/node_modules/playwright/index.js');
const SS = process.env.FITFORGE_SHOTS || path.resolve(ROOT, '.shots');
try { fs.mkdirSync(SS, { recursive: true }); } catch (_) {}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', hasTouch: true });
  const page = await c.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push('PAGEERR: ' + e.message));

  await page.goto('http://localhost:8199/index.html', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.Storage && window.DISCIPLINES);
  await page.evaluate(async () => {
    await Storage.clearAll();
    for (const [k, v] of Object.entries({
      onboarded: true, sex: 'male', dob: '1992-03-04', heightCm: 180, activityLevel: 'light', kcalGoal: 2200
    })) await Storage.setPref(k, v);
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2600);
  await page.evaluate(() => document.querySelector('[data-testid="dock-library"]').click());
  await page.waitForTimeout(700);
  await page.evaluate(() => document.querySelector('[data-testid="learn-fork-centre"]')?.click());
  await page.waitForTimeout(1700);

  const shown = () => page.evaluate(() => document.querySelectorAll('[data-ex-id]').length);
  const shownIds = () => page.evaluate(() => [...document.querySelectorAll('[data-ex-id]')].map((n) => n.dataset.exId));

  console.log('\n=== 2. filtering ===');
  const total = await shown();
  check('the library starts unfiltered', total === DB.length, `${total} of ${DB.length}`);
  check('the note is hidden until one is picked',
    await page.evaluate(() => document.querySelector('[data-testid="discipline-note"]').style.display === 'none'));

  // The chips used to be a row on the page. They live behind the Refine line
  // now, alongside equipment — two rows of chips became one button when the
  // body-part row was retired. The note they drive still sits on the page,
  // because it explains what the grid behind the sheet is showing.
  const openRefine = async () => {
    if (await page.$('[data-testid="refine-sheet"]')) return;
    await page.evaluate(() => document.querySelector('[data-testid="refine-open"]').click());
    await page.waitForTimeout(800);
  };
  await openRefine();
  check('a chip exists for each discipline',
    (await page.$$('[data-testid="refine-sheet"] .disc-chip')).length === D.length,
    String((await page.$$('[data-testid="refine-sheet"] .disc-chip')).length));

  for (const d of D) {
    await openRefine();
    await page.click(`[data-testid="disc-${d.id}"]`);
    await page.waitForTimeout(700);
    const got = await shownIds();
    check(`${d.id}: shows exactly its own exercises`,
      got.length === d.exercises.length && got.every((x) => d.exercises.includes(x)),
      `${got.length} shown, expected ${d.exercises.length}`);
    if (d.missing) {
      const note = await page.$eval('[data-testid="discipline-note"]', (e) => e.textContent);
      check(`${d.id}: says what the library is missing`, note.includes(d.missing.slice(0, 25)), note.slice(0, 70));
    }
    await openRefine();
    await page.click(`[data-testid="disc-${d.id}"]`);   // toggle off
    await page.waitForTimeout(500);
  }
  check('toggling off restores the full library', (await shown()) === DB.length);

  console.log('\n=== 3. it composes with the muscle filter ===');
  // The whole reason this is a second axis rather than more categories.
  await openRefine();
  await page.click('[data-testid="disc-calisthenics"]');
  await page.waitForTimeout(600);
  await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => /^done$/i.test(b.textContent.trim()))?.click());
  await page.waitForTimeout(700);
  // The body-part chip row is retired; the figure is the body-part control
  // now. Two consequences for driving it: the back zones are not in the DOM
  // until the figure is flipped, and an SVG group is not an HTMLElement, so
  // it has no .click() — dispatch the event its listener is waiting for.
  await page.click('[data-testid="body-map-back"]');
  await page.waitForTimeout(700);
  // `lats`, not `back`. The coarse zones arms/back/core/legs carry views: []
  // — they are never drawn on the figure, and the retired chips were the only
  // way to pick them. What replaces a coarse "back" is either a fine zone like
  // this one or Browse › Strength › Back, and both are more specific than the
  // chip was.
  const picked = await page.evaluate(() => {
    const z = document.querySelector('.body-map-region[data-zone="lats"]');
    if (!z) return false;
    z.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  });
  check('a back zone is reachable once the figure is flipped', picked);
  await page.waitForTimeout(1000);
  const both = await shownIds();
  check('calisthenics + lats narrows to the pull movements',
    both.length > 0 && both.length < 15 && both.includes('pull-up') && both.includes('muscle-up'),
    both.join(', '));
  check('and excludes barbell back work', !both.includes('row-barbell') && !both.includes('deadlift-conventional'));
  check('and excludes calisthenics from other body parts',
    !both.includes('pistol-squat') && !both.includes('push-up'), both.join(', '));
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${SS}/disciplines.png` });

  console.log('\nERRORS:', errs.length ? errs : 'none');
  console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
