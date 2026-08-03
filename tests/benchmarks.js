// Benchmark workouts and the Hyrox stations.
//
// A benchmark is the one kind of session where being *right* matters more than
// being good. "Fran in 6:12" is a sentence people compare across years and
// across gyms, and it only means something because Fran is always twenty-one,
// fifteen and nine thrusters and pull-ups. The moment someone tidies the
// prescription — rounds the reps, swaps an exercise, adds a warm-up — every
// score ever recorded against it quietly stops being comparable, and nothing
// in the app would say so. Section 1 pins the prescriptions.
//
// The Hyrox half has the opposite failure. The discipline chip previously said
// five stations were missing when the true number was six: the burpee broad
// jump is its own movement and the plain burpee was standing in for it. A
// roster that is nearly complete reads exactly like one that is complete, so
// section 2 pins all eight stations to real ids rather than trusting a note.
//
// Section 3 is about two pieces of machinery this needed and the app did not
// have: a rep ladder that is one number per set, and cardio that honours a set
// count. Both are the kind of thing that works when written and silently stops
// working later, because the fallback — three sets of the first number, one
// row instead of eight — looks plausible.
//
//   node tests/benchmarks.js   (needs `python3 -m http.server 8199`)
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
load('data/disciplines.js');
const DB = G.EXERCISE_DB;
const ids = new Set(DB.map((e) => e.id));
const preset = (id) => G.PRESET_SESSIONS.find((s) => s.id === id);
const byId = (id) => DB.find((e) => e.id === id);

// ================= 1. the prescriptions ===================================
// Written out here rather than derived from the file, on purpose. A test that
// reads the same data it checks proves only that the file parses. These are
// the published standards, typed in from outside, so an edit to sessions.js
// has to disagree with something.
console.log('=== 1. the benchmarks are the benchmarks ===');
{
  const FRAN = { mode: 'fortime', work: { thruster: [21, 15, 9], 'pull-up': [21, 15, 9] } };
  const CINDY = { mode: 'amrap', cap: 20 * 60, work: { 'pull-up': 5, 'push-up': 10, 'box-squat-bodyweight': 15 } };
  const MURPH = { mode: 'fortime', work: { 'pull-up': 100, 'push-up': 200, 'box-squat-bodyweight': 300 } };

  const fran = preset('preset-fran');
  check('Fran exists', !!fran);
  check('Fran is scored for time', fran.circuit.mode === FRAN.mode, fran.circuit.mode);
  check('Fran is thrusters and pull-ups, nothing else',
    fran.exercises.map((e) => e.exerciseId).sort().join(',') === 'pull-up,thruster',
    fran.exercises.map((e) => e.exerciseId).join(','));
  for (const [id, scheme] of Object.entries(FRAN.work)) {
    const e = fran.exercises.find((x) => x.exerciseId === id);
    check(`Fran: ${id} is ${scheme.join('-')}`,
      JSON.stringify(e && e.repScheme) === JSON.stringify(scheme), JSON.stringify(e && e.repScheme));
  }

  const cindy = preset('preset-amrap-20');
  check('Cindy exists', !!cindy);
  check('Cindy is named so it can be recognised', /cindy/i.test(cindy.name), cindy.name);
  check('Cindy is a 20 minute AMRAP',
    cindy.circuit.mode === CINDY.mode && cindy.circuit.capSec === CINDY.cap,
    JSON.stringify(cindy.circuit));
  for (const [id, reps] of Object.entries(CINDY.work)) {
    const e = cindy.exercises.find((x) => x.exerciseId === id);
    check(`Cindy: ${reps} × ${id}`, e && e.targetReps === reps, e && String(e.targetReps));
  }
  // Two identical sessions under two names is the thing this rename avoided.
  const twins = G.PRESET_SESSIONS.filter((s) => s.id !== cindy.id &&
    s.circuit && s.circuit.mode === 'amrap' &&
    JSON.stringify((s.exercises || []).map((e) => [e.exerciseId, e.targetReps])) ===
    JSON.stringify(cindy.exercises.map((e) => [e.exerciseId, e.targetReps])));
  check('and there is no second copy of it under another name',
    twins.length === 0, twins.map((s) => s.id).join(', '));

  const murph = preset('preset-murph');
  check('Murph exists', !!murph);
  check('Murph is scored for time', murph.circuit.mode === MURPH.mode);
  for (const [id, reps] of Object.entries(MURPH.work)) {
    const e = murph.exercises.find((x) => x.exerciseId === id);
    check(`Murph: ${reps} × ${id}`, e && e.targetReps === reps, e && String(e.targetReps));
  }
  const run = murph.exercises.find((x) => x.exerciseId === 'run');
  // Two miles, as the two separate efforts they are — a mile at each end.
  check('Murph: two one-mile runs',
    run && run.targetSets === 2 && Math.abs(run.targetDistanceKm - 1.61) < 0.02,
    JSON.stringify(run && { sets: run.targetSets, km: run.targetDistanceKm }));

  console.log('\n   -- what the description has to carry --');
  // The app has no vest field and no scaling model, so anything the
  // prescription depends on that the data cannot hold has to be written down.
  // Otherwise the session silently becomes a different, easier one.
  check('Fran names the Rx load rather than pre-filling it',
    /43|30/.test(fran.detail) && fran.exercises.every((e) => e.targetWeight == null),
    fran.exercises.map((e) => e.targetWeight).join(','));
  check('Murph mentions the vest it cannot store', /vest/i.test(murph.detail));
  check('Murph explains the partitioning', /partition|round/i.test(murph.detail));
  for (const id of ['preset-fran', 'preset-amrap-20', 'preset-murph']) {
    const s = preset(id);
    check(`${id}: says how it is scored`, /time|clock|round/i.test(s.detail || ''));
  }
  // A cap that is shorter than the workout turns every attempt into "capped".
  check('Fran\'s cap is generous enough to be a cap and not a wall',
    preset('preset-fran').circuit.capSec >= 8 * 60);
  check('Murph\'s cap clears a realistic finish',
    preset('preset-murph').circuit.capSec >= 60 * 60,
    String(preset('preset-murph').circuit.capSec));
}

// ================= 2. the eight stations ==================================
console.log('\n=== 2. Hyrox: all eight stations, or say so ===');
{
  // The race, from outside the file.
  const STATIONS = [
    ['ski erg', 'ski-erg'],
    ['sled push', 'sled-push'],
    ['sled pull', 'sled-pull'],
    ['burpee broad jump', 'burpee-broad-jump'],
    ['row', 'rowing'],
    ["farmer's carry", 'farmers-carry'],
    ['sandbag lunge', 'sandbag-lunge'],
    ['wall ball', 'wall-ball']
  ];
  const hyrox = G.DISCIPLINES.find((d) => d.id === 'hyrox');
  for (const [label, id] of STATIONS) {
    check(`${label} is a real exercise`, ids.has(id), id);
    check(`  and is tagged Hyrox`, hyrox.exercises.includes(id));
  }
  // The burpee broad jump is not a burpee, and letting one cover the other is
  // how the roster came to claim five missing stations when it was six.
  check('the burpee broad jump is its own movement, not the plain burpee',
    ids.has('burpee-broad-jump') && ids.has('burpee') &&
    byId('burpee-broad-jump').name !== byId('burpee').name);
  check('the note no longer claims stations are missing',
    !/station[s]? (have no|are missing)|five of the eight/i.test(hyrox.missing || ''), hyrox.missing);
  check('but it still says what is absent', !!hyrox.missing && hyrox.missing.length > 20);

  console.log('\n   -- the new exercises are complete records --');
  const NEW = ['ski-erg', 'sled-push', 'sled-pull', 'sandbag-lunge', 'wall-ball', 'burpee-broad-jump'];
  for (const id of NEW) {
    const e = byId(id);
    check(`${id}: has technique, mistakes and a way out`,
      e && e.technique.length >= 4 && e.mistakes.length >= 3 &&
      e.variations.length >= 2 && e.alternatives.length >= 2);
    check(`${id}: has a MET value that is not a guess at zero`, e.met > 3 && e.met < 13, String(e.met));
    check(`${id}: declares its gear`, Array.isArray(e.gear) && e.gear.length > 0, JSON.stringify(e.gear));
    check(`${id}: names its muscles`, (e.muscles || []).length >= 3);
  }
  // Both sleds log in seconds, like the carries already do. It is the only
  // shape in the app for "a loaded effort measured by how long it took".
  for (const id of ['sled-push', 'sled-pull']) {
    check(`${id}: is a timed effort, like the carries`, byId(id).type === 'hold', byId(id).type);
  }

  console.log('\n   -- the kit --');
  // GEAR_ORDER is written out twice, in app.js and sessions.js, with a comment
  // saying they are kept in step. That is a promise, not a mechanism.
  const appSrc = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8');
  const sesSrc = fs.readFileSync(path.join(ROOT, 'data/sessions.js'), 'utf8');
  const order = (src) => (src.match(/const GEAR_ORDER = \[([\s\S]*?)\];/)[1].match(/"[^"]+"/g) || [])
    .map((x) => x.slice(1, -1));
  const appOrder = order(appSrc);
  const sesOrder = order(sesSrc).filter((g) => g !== 'none');
  check('the two GEAR_ORDER lists are actually in step',
    JSON.stringify(appOrder) === JSON.stringify(sesOrder),
    `app ${appOrder.length} / sessions ${sesOrder.length}`);
  // A tag with no label renders as "undefined" in the kit picker.
  const meta = appSrc.match(/const GEAR_META = \{([\s\S]*?)\n {2}\};/)[1];
  const unlabelled = appOrder.filter((g) => !new RegExp(`["']?${g}["']?\\s*:`).test(meta));
  check('every gear tag has a label', unlabelled.length === 0, unlabelled.join(', '));
  // And a tag nothing uses is a checkbox that can never help.
  const used = new Set(DB.flatMap((e) => e.gear || []));
  const orphan = appOrder.filter((g) => !used.has(g));
  check('every gear tag is on at least one exercise', orphan.length === 0, orphan.join(', '));

  // A session name is a promise about what is in it. "Sled & Carry Circuit"
  // had no sled in it — harmless while the library had no sled at all, and
  // misleading the moment it did.
  const SLED_EX = new Set(['sled-push', 'sled-pull']);
  const liars = G.PRESET_SESSIONS.filter((s) => /sled/i.test(s.name) &&
    !(s.exercises || []).some((e) => SLED_EX.has(e.exerciseId)));
  check('no session names a sled it does not contain', liars.length === 0,
    liars.map((s) => s.name).join(', '));

  // ---- pinned equipment ----
  // A thruster is barbell OR dumbbell OR kettlebell, which is right in the
  // library and wrong on Fran: it is 43 kg on a bar, the load is half of what
  // the time means, and a dumbbell version is a different workout under a name
  // that refers to a specific one. An entry may therefore narrow the
  // exercise's options — and only narrow them, or the card would claim kit
  // that does not do the movement.
  console.log('\n   -- pinned equipment --');
  {
    const widened = [];
    for (const s of G.PRESET_SESSIONS) {
      for (const e of (s.exercises || [])) {
        if (!e.gear) continue;
        const own = (byId(e.exerciseId) || {}).gear || ['none'];
        const extra = e.gear.filter((g) => !own.includes(g));
        if (extra.length) widened.push(`${s.id}/${e.exerciseId} invents ${extra.join('+')}`);
      }
    }
    check('a pinned entry narrows the exercise\'s gear, never invents any',
      widened.length === 0, widened.join(', '));

    const fran = preset('preset-fran');
    check('Fran asks for a barbell and a bar, and nothing looser',
      JSON.stringify(fran.gear) === JSON.stringify(['barbell', 'pullup-bar']), JSON.stringify(fran.gear));
    check('and the kit filter will actually require the barbell',
      fran.needs.some((or) => or.length === 1 && or[0] === 'barbell'), JSON.stringify(fran.needs));
    // Murph and the Hyrox race are run on a road and a course. Leaving the
    // exercise's treadmill option in put a "Cardio machine" chip on a session
    // tagged Outdoors.
    check('Murph does not claim to need a cardio machine',
      !preset('preset-murph').gear.includes('cardio-machine'),
      JSON.stringify(preset('preset-murph').gear));
    check('and neither does the Hyrox running',
      preset('preset-hyrox-sim').needs[0].join() === 'none',
      JSON.stringify(preset('preset-hyrox-sim').needs[0]));
    // The ski erg and the rower genuinely are machines, so that chip stays.
    check('but the Hyrox ergs still declare a machine',
      preset('preset-hyrox-sim').gear.includes('cardio-machine'));

    // The narrowing is implemented twice — sessions.js for presets, app.js
    // sessionMeta for user templates — with a comment promising they match.
    const appSrc = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8');
    const sesSrc = fs.readFileSync(path.join(ROOT, 'data/sessions.js'), 'utf8');
    const narrows = (src) => /\(e\.gear && e\.gear\.length\) \? e\.gear/.test(src);
    check('both gear derivations honour the override', narrows(appSrc) && narrows(sesSrc),
      `app ${narrows(appSrc)} / sessions ${narrows(sesSrc)}`);
  }

  const sim = preset('preset-hyrox-sim');
  check('there is a session that runs the race', !!sim);
  check('it is scored for time', sim.circuit.mode === 'fortime');
  const simIds = sim.exercises.map((e) => e.exerciseId);
  for (const [label, id] of STATIONS) check(`the simulation includes ${label}`, simIds.includes(id));
  const simRun = sim.exercises.find((e) => e.exerciseId === 'run');
  check('and eight kilometres of running', simRun && simRun.targetSets === 8 && simRun.targetDistanceKm === 1,
    JSON.stringify(simRun && { sets: simRun.targetSets, km: simRun.targetDistanceKm }));
  // A list cannot interleave, so the order has to be stated somewhere.
  check('the detail explains that the runs go between the stations',
    /between|then a station|1 km, then|repeat until/i.test(sim.detail), sim.detail.slice(0, 60));
  // Six of the eight stations are prescribed as a distance and logged as reps
  // or seconds. Those targets are estimates of what the distance costs, and a
  // number presented without that caveat silently becomes the standard.
  check('the real distances are written out, in the units the race uses',
    ['1000 m', '50 m', '80 m', '200 m', '100 m'].every((d) => sim.detail.includes(d)),
    sim.detail.slice(0, 80));
  check('and it admits the row targets are estimates',
    /estimate/i.test(sim.detail));
  check('the sled work makes the session need a sled',
    (sim.gear || []).includes('sled'), JSON.stringify(sim.gear));
}

// ================= 3. the two engine paths ================================
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', hasTouch: true });
  const page = await c.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push('PAGEERR: ' + e.message.slice(0, 160)));

  await page.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
  await page.waitForFunction(() => window.Storage && window.U && window.PRESET_SESSIONS);

  /** Start a preset the way a person does — quick sheet, Sessions, the card,
      Start — and read back the rows it actually produced.

      Going through the real path is the whole point. The template holds
      [21, 15, 9]; whether three rows of 21, 15 and 9 come out the other end is
      a separate question, and the plausible failure is three rows of 21. */
  const startPreset = async (presetId, history = null) => {
    await page.evaluate(async ({ kit, history }) => {
      await Storage.clearAll();
      await Storage.setPref('onboarded', true);
      await Storage.setPref('warmupPrompt', false);
      await Storage.setPref('guidedSets', false);
      // A full gym, so the kit filter never hides the card being tested —
      // Fran needs a barbell and the Hyrox sim needs a sled.
      await Storage.setPref('myKit', kit);
      if (history) await Storage.saveWorkout(history);
    }, {
      kit: ['band', 'dumbbell', 'kettlebell', 'barbell', 'pullup-bar', 'dip-bars', 'jump-rope',
        'ab-wheel', 'machine', 'cable', 'cardio-machine', 'sled', 'sandbag', 'med-ball',
        'heavy-bag', 'focus-pads'],
      history
    });
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(1500);
    await page.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"],.splash').forEach((n) => n.remove()));
    await page.evaluate(() => document.querySelector('[data-testid="dock-fab"]').click());
    await page.waitForTimeout(700);
    await page.evaluate(() => document.querySelector('[data-testid="quick-sessions"]').click());
    await page.waitForTimeout(1600);
    const found = await page.evaluate((id) => {
      const card = document.querySelector(`[data-testid="preset-${id}"]`);
      if (!card) return false;
      const btn = [...card.querySelectorAll('button')].find((x) => /^start$/i.test(x.textContent.trim()));
      if (!btn) return false;
      btn.click();
      return true;
    }, presetId);
    await page.waitForTimeout(1800);
    await page.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"]').forEach((n) => n.remove()));
    if (!found) return null;
    return page.evaluate(async () => {
      const id = await Storage.getPref('activeWorkoutId');
      const w = id ? await Storage.getWorkout(id) : null;
      if (!w) return null;
      return {
        templateId: w.templateId,
        exercises: (w.exercises || []).map((e) => ({
          id: e.exerciseId, type: e.type,
          reps: (e.sets || []).map((s) => s.reps),
          km: (e.sets || []).map((s) => s.distanceKm),
          weights: (e.sets || []).map((s) => s.weight)
        }))
      };
    });
  };

  // ---- the length on the card ----
  // The card is how you decide whether you have time for a session, so the
  // number on it is the one that has to be right. The estimator guesses 3.5
  // minutes per set, which is fine for a strength session and meaningless for
  // a scored one, where the clock is the format rather than a consequence of
  // it: Cindy is twenty minutes by definition and the card said "~10 min".
  console.log('\n=== 2b. the length shown on the card ===');
  {
    const cardMeta = async (id) => {
      await page.evaluate(async (kit) => {
        await Storage.clearAll();
        await Storage.setPref('onboarded', true);
        await Storage.setPref('myKit', kit);
      }, ['band', 'dumbbell', 'kettlebell', 'barbell', 'pullup-bar', 'dip-bars', 'jump-rope',
        'ab-wheel', 'machine', 'cable', 'cardio-machine', 'sled', 'sandbag', 'med-ball',
        'heavy-bag', 'focus-pads']);
      await page.reload({ waitUntil: 'load' });
      await page.waitForTimeout(1500);
      await page.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"],.splash').forEach((n) => n.remove()));
      await page.evaluate(() => document.querySelector('[data-testid="dock-fab"]').click());
      await page.waitForTimeout(600);
      await page.evaluate(() => document.querySelector('[data-testid="quick-sessions"]').click());
      await page.waitForTimeout(1700);
      return page.evaluate((x) =>
        document.querySelector(`[data-testid="preset-${x}"] .sess-card-meta`)?.textContent || '', id);
    };

    // An AMRAP runs exactly its cap. Not "about" — exactly.
    const cindyMeta = await cardMeta('preset-amrap-20');
    check('Cindy is advertised as the twenty minutes it actually is',
      /(^|\s)20 min/.test(cindyMeta) && !/~/.test(cindyMeta), cindyMeta);
    // For Time ends when the work does, so the cap is a ceiling, not a guess.
    const hyroxMeta = await cardMeta('preset-hyrox-sim');
    check('the Hyrox sim says "up to", not a number below its own description',
      /up to 120 min/.test(hyroxMeta), hyroxMeta);
    const murphMeta = await cardMeta('preset-murph');
    check('Murph does not advertise a 45-minute workout as 20 minutes',
      /up to 75 min/.test(murphMeta), murphMeta);
    // A circuit runs to a schedule the app wrote itself, so its length is a
    // fact. Estimating it anyway was badly wrong — the Carry & Swing Circuit
    // is five rounds of three 45-second stations with transitions and a
    // minute's rest, and the per-set guess called that 40 minutes.
    const carryMeta = await cardMeta('preset-sled-carry');
    check('a timed circuit states its length rather than guessing',
      /·\s*\d+ min$/.test(carryMeta) && !/~/.test(carryMeta), carryMeta);
    const emomMeta = await cardMeta('preset-bodyweight-emom');
    check('an EMOM states its length too', !/~/.test(emomMeta), emomMeta);

    // The strongest version of that: whatever the card promises, the runner's
    // own clock has to agree. Two numbers for one schedule is exactly the kind
    // of thing that drifts once and never gets noticed.
    const cardVsClock = async (id) => {
      const meta = await cardMeta(id);
      await page.evaluate((x) => {
        const card = document.querySelector(`[data-testid="preset-${x}"]`);
        [...card.querySelectorAll('button')].find((y) => /^start$/i.test(y.textContent.trim())).click();
      }, id);
      await page.waitForTimeout(2200);
      await page.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"]').forEach((n) => n.remove()));
      await page.evaluate(() => document.querySelector('[data-testid="start-circuit"]').click());
      await page.waitForTimeout(1600);
      const totals = await page.textContent('[data-testid="ivr-totals"]').catch(() => '');
      await page.evaluate(() => document.querySelector('[data-testid="interval-runner"]')?.remove());
      const shown = Number((meta.match(/(\d+) min\s*$/) || [])[1]);
      const clock = (totals.match(/of (\d+):(\d\d)/) || []).slice(1).map(Number);
      return { shown, clockMin: clock.length ? clock[0] + clock[1] / 60 : null, meta, totals };
    };
    for (const id of ['preset-sled-carry', 'preset-bodyweight-emom']) {
      const r = await cardVsClock(id);
      check(`${id}: the card and the runner's clock agree`,
        r.clockMin != null && Math.abs(r.shown - r.clockMin) < 0.6,
        `card ${r.shown} min vs clock ${r.totals}`);
    }

    // The pin has to reach the filter, not just the chips. Someone holding two
    // dumbbells and a pull-up bar can do a thruster — but not Fran.
    console.log('\n   -- and the filter respects it --');
    const withKit = async (kit) => {
      await page.evaluate(async (k) => {
        await Storage.clearAll();
        await Storage.setPref('onboarded', true);
        await Storage.setPref('myKit', k);
      }, kit);
      await page.reload({ waitUntil: 'load' });
      await page.waitForTimeout(1500);
      await page.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"],.splash').forEach((n) => n.remove()));
      await page.evaluate(() => document.querySelector('[data-testid="dock-fab"]').click());
      await page.waitForTimeout(600);
      await page.evaluate(() => document.querySelector('[data-testid="quick-sessions"]').click());
      await page.waitForTimeout(1700);
      return page.evaluate(() => ({
        fran: !!document.querySelector('[data-testid="preset-preset-fran"]'),
        cindy: !!document.querySelector('[data-testid="preset-preset-amrap-20"]'),
        murph: !!document.querySelector('[data-testid="preset-preset-murph"]'),
        escape: !!document.querySelector('[data-testid="sess-show-all"]')
      }));
    };
    const noBar = await withKit(['dumbbell', 'kettlebell', 'pullup-bar', 'cardio-machine']);
    check('dumbbells and a bar do not get you Fran', noBar.fran === false, JSON.stringify(noBar));
    check('but the bodyweight benchmarks are still offered',
      noBar.cindy && noBar.murph, JSON.stringify(noBar));
    // Hidden, not vanished — the sheet says so and offers a way through.
    check('and the sheet admits something is hidden', noBar.escape === true);
    const withBar = await withKit(['dumbbell', 'kettlebell', 'pullup-bar', 'barbell']);
    check('add a barbell and Fran appears', withBar.fran === true, JSON.stringify(withBar));
  }

  // ---- the details sheet ----
  // Every entry was rendered as `targetSets || 3` × `targetReps || 8`, which
  // is right for the 185 preset entries prescribed in reps and invents a
  // number for the other 58. Fran read "3 × 8" directly beneath prose saying
  // twenty-one, fifteen and nine — the sheet contradicting itself on screen.
  console.log('\n=== 2c. the details sheet states the real prescription ===');
  {
    const rows = async (id) => {
      await page.evaluate(async (kit) => {
        await Storage.clearAll();
        await Storage.setPref('onboarded', true);
        await Storage.setPref('myKit', kit);
      }, ['band', 'dumbbell', 'kettlebell', 'barbell', 'pullup-bar', 'dip-bars', 'jump-rope',
        'ab-wheel', 'machine', 'cable', 'cardio-machine', 'sled', 'sandbag', 'med-ball',
        'heavy-bag', 'focus-pads']);
      await page.reload({ waitUntil: 'load' });
      await page.waitForTimeout(1500);
      await page.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"],.splash').forEach((n) => n.remove()));
      await page.evaluate(() => document.querySelector('[data-testid="dock-fab"]').click());
      await page.waitForTimeout(600);
      await page.evaluate(() => document.querySelector('[data-testid="quick-sessions"]').click());
      await page.waitForTimeout(1700);
      await page.evaluate((x) => {
        const card = document.querySelector(`[data-testid="preset-${x}"]`);
        [...card.querySelectorAll('button')].find((y) => /^details$/i.test(y.textContent.trim())).click();
      }, id);
      await page.waitForTimeout(1300);
      return page.evaluate(() => [...document.querySelectorAll('.ivl-detail-row')]
        .map((r) => [r.querySelector('.ivl-detail-label')?.textContent,
          r.querySelector('.ivl-detail-time')?.textContent]));
    };

    const franRows = await rows('preset-fran');
    check('Fran lists the ladder, not an invented 3 × 8',
      franRows.every(([, v]) => v === '21-15-9'), JSON.stringify(franRows));
    const murphRows = await rows('preset-murph');
    const runRow = murphRows.find(([n]) => /run/i.test(n));
    check('Murph\'s runs are stated as a distance, not "2 × 8"',
      runRow && /2 × 1\.61 km/.test(runRow[1]), JSON.stringify(runRow));
    check('and its rep work is unchanged',
      murphRows.filter(([n]) => !/run/i.test(n)).map(([, v]) => v).join(',') === '1 × 100,1 × 200,1 × 300',
      JSON.stringify(murphRows));
    // 52 preset entries are prescribed in seconds and every one of them read
    // "N × 8". This one is pre-existing, and nothing to do with benchmarks.
    const carryRows = await rows('preset-sled-carry');
    const hold = carryRows.find(([n]) => /carry/i.test(n));
    check('a timed carry states its seconds rather than phantom reps',
      hold && /45s/.test(hold[1]), JSON.stringify(carryRows));
    const simRows = await rows('preset-hyrox-sim');
    check('the Hyrox sled push states its seconds',
      /90s/.test((simRows.find(([n]) => /sled push/i.test(n)) || [])[1] || ''), JSON.stringify(simRows));
    check('and its eight runs state the distance',
      /8 × 1 km/.test((simRows.find(([n]) => /^run$/i.test(n)) || [])[1] || ''), JSON.stringify(simRows));
  }

  console.log('\n=== 3. rep ladders and cardio set counts ===');
  {
    const fran = await startPreset('preset-fran');
    check('Fran starts from the sessions sheet', !!fran, JSON.stringify(fran));
    if (fran) {
      check('and it carries the template id so the circuit spec resolves',
        fran.templateId === 'preset-fran', String(fran.templateId));
      for (const id of ['thruster', 'pull-up']) {
        const e = fran.exercises.find((x) => x.id === id);
        // The failure this exists for: three rows all reading 21.
        check(`${id}: three rows reading 21, 15 and 9`,
          e && JSON.stringify(e.reps) === '[21,15,9]', JSON.stringify(e && e.reps));
      }
      check('and no load was pre-typed for you',
        fran.exercises.every((e) => e.weights.every((w) => w == null)),
        JSON.stringify(fran.exercises.map((e) => e.weights)));
    }

    // The same thing again, for someone who has done thrusters and pull-ups
    // before. The strength branch prefers "shape this like last time" whenever
    // the template names no load, and a repScheme is a load the template names
    // — so without that, the ladder worked on a fresh install and silently
    // stopped the first time you had history. Which is the worse bug.
    const PAST = {
      id: 'past-fran', name: 'Last Tuesday', date: '2026-07-14',
      startedAt: 1, completedAt: 2, durationSec: 2400,
      exercises: [
        { exerciseId: 'thruster', name: 'Thruster', type: 'weighted',
          sets: [{ weight: 40, reps: 8, done: true }, { weight: 40, reps: 8, done: true }] },
        { exerciseId: 'pull-up', name: 'Pull-Up', type: 'bodyweight',
          sets: [{ weight: 0, reps: 12, done: true }, { weight: 0, reps: 10, done: true },
            { weight: 0, reps: 8, done: true }, { weight: 0, reps: 8, done: true }] }
      ]
    };
    const franAgain = await startPreset('preset-fran', PAST);
    check('Fran starts for someone with history', !!franAgain);
    if (franAgain) {
      for (const id of ['thruster', 'pull-up']) {
        const e = franAgain.exercises.find((x) => x.id === id);
        check(`${id}: still 21, 15 and 9 — history does not override the ladder`,
          e && JSON.stringify(e.reps) === '[21,15,9]', JSON.stringify(e && e.reps));
      }
      check('and last week\'s load is still only a hint, not a value',
        franAgain.exercises.every((e) => e.weights.every((w) => w == null)),
        JSON.stringify(franAgain.exercises.map((e) => e.weights)));
    }

    const murph = await startPreset('preset-murph');
    check('Murph starts', !!murph);
    if (murph) {
      const run = murph.exercises.find((x) => x.id === 'run');
      // Cardio used to build exactly one row and drop targetSets silently.
      check('the two miles arrive as two rows, not one',
        run && run.km.length === 2 && run.km.every((k) => Math.abs(k - 1.61) < 0.02),
        JSON.stringify(run && run.km));
      check('run is typed as cardio', run && run.type === 'cardio', run && run.type);
      const pu = murph.exercises.find((x) => x.id === 'pull-up');
      check('and the hundred pull-ups are one row of a hundred',
        pu && JSON.stringify(pu.reps) === '[100]', JSON.stringify(pu && pu.reps));
    }

    const sim = await startPreset('preset-hyrox-sim');
    check('the Hyrox simulation starts', !!sim);
    if (sim) {
      const run = sim.exercises.find((x) => x.id === 'run');
      check('eight kilometre repeats arrive as eight rows',
        run && run.km.length === 8 && run.km.every((k) => k === 1), JSON.stringify(run && run.km));
      check('all nine entries survive the trip',
        sim.exercises.length === 9, String(sim.exercises.length));
      const sled = sim.exercises.find((x) => x.id === 'sled-push');
      check('the sled push is a timed hold, not a rep counter',
        sled && sled.type === 'hold' && sled.reps.every((r) => r == null),
        JSON.stringify(sled && { type: sled.type, reps: sled.reps }));
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${SS}/benchmarks-hyrox.png` });
    }

    // Found while looking at Murph. Both it and the Hyrox sim open on a cardio
    // row, which carries an interval CTA built as `btn btn-block rb-cta`, and
    // `.btn-block { display: block }` sits ~950 lines below `.rb-cta`'s
    // `display: flex` in the same stylesheet. Same specificity, later wins, so
    // the two labels rendered on one line: "Set up intervals8 x 0:30 with a
    // timer". Nothing to do with benchmarks; this is just where it surfaced.
    if (sim) {
      const cta = await page.evaluate(() => {
        const n = document.querySelector('[data-testid="rounds-cta"]');
        if (!n) return null;
        const main = n.querySelector('.rb-cta-main'), sub = n.querySelector('.rb-cta-sub');
        if (!main || !sub) return null;
        return { display: getComputedStyle(n).display, mainTop: main.getBoundingClientRect().top,
          subTop: sub.getBoundingClientRect().top };
      });
      check('the interval CTA stacks its two labels instead of running them together',
        cta && cta.display === 'flex' && cta.subTop > cta.mainTop, JSON.stringify(cta));
    }

    // Cindy is the one that already worked; it must not have been disturbed.
    const cindy = await startPreset('preset-amrap-20');
    check('Cindy still starts under her new name', !!cindy);
    if (cindy) {
      check('and still prescribes 5 / 10 / 15',
        JSON.stringify(cindy.exercises.map((e) => e.reps)) === '[[5],[10],[15]]',
        JSON.stringify(cindy.exercises.map((e) => e.reps)));
    }
  }

  console.log('\nERRORS:', errs.length ? errs : 'none');
  console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
