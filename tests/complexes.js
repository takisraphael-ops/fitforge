// Barbell complexes and the cycling benchmarks.
//
// A complex is the one exercise whose name tells you nothing about what you
// do. "Bear Complex" is five lifts on one bar, and knowing which five — and in
// what order — is the entire content of the page. So the sequence is data
// rather than prose, every step points at a real exercise, and the detail view
// renders it as a list of destinations you can actually go to.
//
// That creates a specific way to rot. The sequence names movements by id, and
// an id that stops resolving does not throw — it renders a dead row with a
// slug in it, and the page still looks fine. Section 1 pins every step.
//
// The other half is what the app is careful NOT to claim. The rule that makes
// a complex a complex is that the bar never touches the floor, and that is
// exactly the thing the app cannot see. A logged round would otherwise imply
// it. Section 3 checks the caveat is on screen next to the sequence, not
// buried in a description someone has to go looking for.
//
//   node tests/complexes.js   (needs `python3 -m http.server 8199`)
const { chromium } = require('/opt/node22/lib/node_modules/playwright/index.js');
const path = require('path');
const fs = require('fs');

let fails = 0;
const check = (label, ok, detail = '') => {
  if (!ok) fails++;
  console.log(`   ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
};

const ROOT = path.resolve(__dirname, '..');
const SS = process.env.FITFORGE_SHOTS || path.resolve(ROOT, '.shots');
try { fs.mkdirSync(SS, { recursive: true }); } catch (_) {}

const G = {};
const load = (rel) => new Function('window', fs.readFileSync(path.join(ROOT, rel), 'utf8'))(G);
load('data/exercises.js');
load('data/sessions.js');
load('data/learn.js');
load('data/disciplines.js');
const DB = G.EXERCISE_DB;
const ids = new Set(DB.map((e) => e.id));
const byId = (id) => DB.find((e) => e.id === id);
const preset = (id) => G.PRESET_SESSIONS.find((s) => s.id === id);
const complexes = DB.filter((e) => Array.isArray(e.complex) && e.complex.length);

// ================= 1. the sequences =======================================
console.log('=== 1. every step of every complex goes somewhere ===');
{
  check('there are complexes', complexes.length >= 3, complexes.map((e) => e.id).join(', '));

  const dead = [];
  for (const c of complexes) {
    for (const s of c.complex) if (!ids.has(s.exerciseId)) dead.push(`${c.id}->${s.exerciseId}`);
  }
  // A dead id does not throw. It renders a disabled row with a slug in it and
  // the page still looks finished, which is why this is checked and not left
  // to be noticed.
  check('no step points at a movement that does not exist', dead.length === 0, dead.join(', '));

  for (const c of complexes) {
    check(`${c.id}: has at least two movements`, c.complex.length >= 2, String(c.complex.length));
    check(`${c.id}: every step states its reps`, c.complex.every((s) => s.reps > 0));
    // A complex is logged as one load and one rep count, which only works if
    // it is an ordinary weighted exercise. A hold or a cardio entry would get
    // a seconds box and nowhere to put the bar weight.
    const t = c.type || null;
    check(`${c.id}: logs as a normal weighted lift`, t === null || t === 'weighted', String(t));
    check(`${c.id}: says what a rep is`, !!c.complexNote && c.complexNote.length > 30);
    check(`${c.id}: needs a barbell`, (c.gear || []).includes('barbell'), JSON.stringify(c.gear));
    // The sequence is not a set: a complex may repeat a movement, and the
    // Bear Complex does — push press twice, in two different rack positions.
    console.log(`      ${c.id.padEnd(16)} ${c.complex.map((s) => (byId(s.exerciseId) || {}).name).join(' → ')}`);
  }

  const bear = byId('bear-complex');
  check('the Bear Complex is the five movements it is supposed to be',
    bear && bear.complex.map((s) => s.exerciseId).join(',') ===
      'clean-power,squat-front,push-press,squat-back,push-press',
    bear && bear.complex.map((s) => s.exerciseId).join(','));
  check('and a repeated movement is kept, not deduplicated',
    bear && bear.complex.filter((s) => s.exerciseId === 'push-press').length === 2);
}

// ================= 2. the movements they are built from ===================
console.log('\n=== 2. the lifts that had to exist first ===');
{
  // The library had the power clean and the snatch and nothing to put on the
  // end of them, which is why there were no complexes.
  const NEW = ['push-press', 'push-jerk', 'hang-clean-power', 'overhead-squat', 'clean-and-jerk'];
  for (const id of NEW) {
    const e = byId(id);
    check(`${id} exists`, !!e);
    if (!e) continue;
    check(`  complete record`, e.technique.length >= 4 && e.mistakes.length >= 3 &&
      e.variations.length >= 2 && e.alternatives.length >= 2);
    check(`  plausible MET`, e.met > 3 && e.met < 13, String(e.met));
  }
  // A clean and press is not a clean and jerk, and Grace is the jerk.
  check('the clean and jerk is its own movement, not the press',
    ids.has('clean-and-jerk') && ids.has('clean-and-press') &&
    byId('clean-and-jerk').name !== byId('clean-and-press').name);
  // The push jerk's whole distinction is the second dip.
  check('the push jerk explains what makes it not a push press',
    /dip|under/i.test(byId('push-jerk').technique.join(' ')));

  console.log('\n   -- the cycling benchmarks --');
  // The published prescriptions, typed in from outside so an edit to the file
  // has to disagree with something.
  const WODS = {
    'preset-grace': { mode: 'fortime', work: { 'clean-and-jerk': 30 } },
    'preset-isabel': { mode: 'fortime', work: { snatch: 30 } },
    'preset-dt': { mode: 'fortime', work: { 'deadlift-conventional': 12, 'hang-clean-power': 9, 'push-jerk': 6 } }
  };
  for (const [id, spec] of Object.entries(WODS)) {
    const s = preset(id);
    check(`${id} exists and is for time`, s && s.circuit.mode === spec.mode);
    if (!s) continue;
    for (const [ex, reps] of Object.entries(spec.work)) {
      const e = s.exercises.find((x) => x.exerciseId === ex);
      check(`  ${ex} × ${reps}`, e && e.targetReps === reps, e && String(e.targetReps));
    }
    // A named benchmark compares only if the load is the standard one, and
    // the app cannot store "61 kg for men, 43 for women" — so it is said.
    check(`  names the Rx load rather than pre-filling it`,
      /\d+(\.\d+)?\s*kg/.test(s.detail) && s.exercises.every((e) => e.targetWeight == null),
      s.detail.slice(0, 60));
  }
  check('DT is five rounds', preset('preset-dt').exercises.every((e) => e.targetSets === 5));
  // A dumbbell Grace is a fine workout and is not Grace.
  for (const id of ['preset-grace', 'preset-isabel']) {
    check(`${id} is pinned to the barbell`,
      JSON.stringify(preset(id).gear) === '["barbell"]', JSON.stringify(preset(id).gear));
  }

  console.log('\n   -- the complex sessions --');
  for (const id of ['preset-bear-complex', 'preset-clean-emom']) {
    const s = preset(id);
    check(`${id} exists`, !!s);
    if (!s) continue;
    // A complex is one exercise in the log — the sequence lives on the
    // exercise. A session that listed the movements separately would be
    // recording something else entirely.
    check(`  is a single complex entry, not the movements spelled out`,
      s.exercises.length === 1 && !!byId(s.exercises[0].exerciseId).complex,
      s.exercises.map((e) => e.exerciseId).join(', '));
  }
  check('the Bear session is five rounds of seven',
    preset('preset-bear-complex').exercises[0].targetSets === 5 &&
    preset('preset-bear-complex').exercises[0].targetReps === 7);

  console.log('\n   -- the article --');
  const art = G.LEARN_ARTICLES.find((a) => a.slug === 'barbell-cycling');
  check('there is an article on cycling', !!art);
  if (art) {
    const text = JSON.stringify(art.body);
    check('  it covers touch-and-go against singles', /touch-and-go/i.test(text) && /singles/i.test(text));
    check('  it says to log the split you actually did', /log the sets|split/i.test(text));
    // The same limit the exercise page states, stated here too.
    check('  and admits the app cannot see an unbroken set',
      /cannot see|cannot tell/i.test(text), text.slice(0, 60));
  }
}

// ================= 3. on screen ===========================================
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', hasTouch: true });
  const page = await c.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push('PAGEERR: ' + e.message.slice(0, 160)));

  await page.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
  await page.waitForFunction(() => window.Storage && window.EXERCISE_DB);
  await page.evaluate(async () => {
    await Storage.clearAll();
    await Storage.setPref('onboarded', true);
  });
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(1700);
  await page.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"],.splash').forEach((n) => n.remove()));

  const openEx = async (id) => {
    await page.evaluate(() => document.querySelectorAll('.modal-overlay').forEach((n) => n.remove()));
    await page.evaluate((x) => window.openExerciseDetailForTest
      ? window.openExerciseDetailForTest(x)
      : document.dispatchEvent(new CustomEvent('noop')), id);
    await page.waitForTimeout(900);
  };
  void openEx;

  /** Reach an exercise page the way a person does: Learn → the library →
      search → tap the card. */
  const openViaLibrary = async (name) => {
    await page.evaluate(() => document.querySelectorAll('.modal-overlay').forEach((n) => n.remove()));
    await page.waitForTimeout(300);
    await page.evaluate(() => document.querySelector('[data-testid="dock-library"]').click());
    await page.waitForTimeout(700);
    await page.evaluate(() => document.querySelector('[data-testid="learn-fork-centre"]')?.click());
    await page.waitForTimeout(1500);
    const hit = await page.evaluate((n) => {
      const card = [...document.querySelectorAll('[data-ex-id]')]
        .find((c) => c.textContent.trim().toLowerCase().startsWith(n.toLowerCase()));
      if (!card) return false;
      card.scrollIntoView({ block: 'center' });
      card.click();
      return true;
    }, name);
    await page.waitForTimeout(1200);
    return hit;
  };

  console.log('\n=== 3. the sequence on the page ===');
  {
    check('the Bear Complex opens from the library', await openViaLibrary('Bear Complex'));
    check('its sequence is rendered', !!(await page.$('[data-testid="complex-section"]')));
    const steps = await page.$$eval('[data-testid="complex-step"]',
      (ns) => ns.map((n) => n.textContent.replace(/\s+/g, ' ').trim()));
    check('all five movements, in order', steps.length === 5, JSON.stringify(steps));
    // Position, name and reps on every row. The names are the library's own,
    // so "Front Squat" arrives as "Barbell Front Squat" — the point is that a
    // name resolved at all, not that it matches the shorthand.
    check('numbered, named and counted',
      /^1Power Clean×1$/.test(steps[0] || '') && /^5Push Press×1$/.test(steps[4] || ''),
      JSON.stringify(steps));
    check('none of them rendered as a raw id',
      steps.every((s) => !/-/.test(s.replace(/×\d+/, ''))), JSON.stringify(steps));
    // The caveat is the point of the section as much as the list is.
    const caveat = await page.textContent('[data-testid="complex-caveat"]').catch(() => '');
    check('the page says what the app cannot see',
      /cannot tell whether you set the bar down/i.test(caveat), caveat);
    check('and it sits with the sequence, not somewhere else',
      await page.evaluate(() => {
        const sec = document.querySelector('[data-testid="complex-section"]');
        return !!sec && !!sec.querySelector('[data-testid="complex-caveat"]');
      }));
    await page.evaluate(() => document.querySelector('[data-testid="complex-section"]')?.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${SS}/complex-bear.png` });

    // The reason the steps are buttons: "what is a push jerk" is the question
    // someone reading a complex actually has. This is also the shape of a bug
    // already made once on the ladder rungs — openExerciseDetail takes an id,
    // and passing it the object silently opened nothing at all.
    const title = () => page.evaluate(() =>
      document.querySelector('.modal-overlay .modal-title')?.textContent.trim() || '');
    check('the open page is the complex', (await title()) === 'Bear Complex', await title());
    await page.evaluate(() => [...document.querySelectorAll('[data-testid="complex-step"]')]
      .find((n) => /Front Squat/.test(n.textContent))?.click());
    await page.waitForTimeout(1300);
    check('tapping a step opens that movement', /Front Squat/.test(await title()), await title());
    check('and it is a real page, not an empty shell',
      (await page.$$eval('.modal-overlay .detail-section h3', (ns) => ns.map((n) => n.textContent))).length >= 2,
      JSON.stringify(await page.$$eval('.modal-overlay .detail-section h3', (ns) => ns.map((n) => n.textContent))));
  }

  console.log('\n=== 4. an ordinary lift has no sequence ===');
  {
    check('the push jerk opens', await openViaLibrary('Push Jerk'));
    check('and shows no complex section', !(await page.$('[data-testid="complex-section"]')),
      'a plain movement must not sprout one');
    check('the Clean Complex does', await openViaLibrary('Clean Complex') &&
      !!(await page.$('[data-testid="complex-section"]')));
    check('with three steps',
      (await page.$$('[data-testid="complex-step"]')).length === 3);
  }

  console.log('\nERRORS:', errs.length ? errs : 'none');
  console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
