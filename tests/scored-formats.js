// AMRAP and For Time — the two formats where the app does not know the answer.
//
// Every other session type the runner drives is a timeline: it knows what
// happens at second 340 because it laid the steps out itself, and "did you do
// it" is a question about the clock. These two invert that. AMRAP fixes the
// clock and asks you how many rounds; For Time fixes the work and asks the
// clock how long. In both, the number that matters is one the app cannot
// derive — so the whole feature is a promise to carry a figure it was handed
// without corrupting it.
//
// That gives the suite its shape. It is not "does the timer count". It is:
//
//   1. the two formats are opposites, and the screen says which one you are in
//   2. the count survives everything that can happen to a phone in 20 minutes
//   3. what gets stored is what happened, including the ways it can end badly
//   4. nothing here leaks into the timed circuits that already worked
//
// Section 2 is the one that earns its keep. A tally is the easiest thing in
// the app to lose — it lives in a closure, the runner's own position is
// already persisted separately, and losing it after eight rounds is worse
// than never having counted, because you only find out at the end.
//
//   node tests/scored-formats.js   (needs `python3 -m http.server 8199`)
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

// ================= 0. the presets, before a browser is involved ============
console.log('=== 0. the presets ===');
{
  const G = {};
  const load = (rel) => new Function('window', fs.readFileSync(path.join(ROOT, rel), 'utf8'))(G);
  load('data/exercises.js');
  load('data/sessions.js');
  const ids = new Set(G.EXERCISE_DB.map((e) => e.id));
  const scored = G.PRESET_SESSIONS.filter((s) => s.circuit && /^(amrap|fortime)$/.test(s.circuit.mode));

  // Not about scoring, but this is where it bit: `gear`, `needs` and
  // `bodyweightOnly` are computed at the bottom of sessions.js from what the
  // exercises actually require, and the loop assigns unconditionally. Writing
  // one by hand looks authoritative in the source and is silently discarded —
  // the version here claimed a 500-rep session was bodyweight-only when it
  // needs a pull-up bar for the leg raises, and nothing would ever have said so.
  const src = fs.readFileSync(path.join(ROOT, 'data/sessions.js'), 'utf8');
  const handSet = ['gear', 'needs', 'bodyweightOnly']
    .filter((f) => new RegExp(`^\\s{4}${f}:`, 'm').test(src));
  check('no preset hand-writes a field the derivation overwrites',
    handSet.length === 0, handSet.join(', '));

  check('both scored formats ship a preset', scored.length >= 2,
    scored.map((s) => `${s.id}(${s.circuit.mode})`).join(', '));
  check('one of each mode',
    new Set(scored.map((s) => s.circuit.mode)).size === 2);

  for (const s of scored) {
    // A cap is the entire contract of a scored format. Without one, AMRAP
    // never ends and For Time has nothing to be measured against.
    check(`${s.id}: has a cap`, s.circuit.capSec >= 60, String(s.circuit.capSec));
    const dangling = s.exercises.filter((e) => !ids.has(e.exerciseId)).map((e) => e.exerciseId);
    check(`${s.id}: every exercise exists`, dangling.length === 0, dangling.join(', '));
    // The prescription is the round. If it is not stated, "+ Round" counts
    // an undefined unit and the stored number means nothing later.
    check(`${s.id}: every exercise states its reps`,
      s.exercises.every((e) => e.targetReps > 0));
    check(`${s.id}: the detail explains how it is scored`,
      /round|clock|time/i.test(s.detail || ''), (s.detail || '').slice(0, 50));
  }
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', hasTouch: true });
  const page = await c.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push('PAGEERR: ' + e.message.slice(0, 160)));

  await page.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
  await page.waitForFunction(() => window.Storage && window.U && window.PRESET_SESSIONS);

  /** Put a scored session in the database and open its runner.
      `circuit` overrides the preset's own spec, so a test can use a five
      second cap instead of sitting through twenty minutes. */
  const start = async (presetId, circuit = null, seed = {}) => {
    await page.evaluate(async ({ presetId, circuit, seed }) => {
      await Storage.clearAll();
      await Storage.setPref('onboarded', true);
      await Storage.setPref('warmupPrompt', false);
      const t = window.PRESET_SESSIONS.find((x) => x.id === presetId);
      const w = {
        id: 'scored1', name: t.name, date: U.todayISO(), startedAt: Date.now(),
        templateId: presetId, circuit: circuit || t.circuit,
        exercises: t.exercises.map((e) => ({
          exerciseId: e.exerciseId, name: e.name, type: 'bodyweight',
          targetReps: e.targetReps, sets: [{ weight: null, reps: null, done: false }]
        })),
        ...seed
      };
      await Storage.saveWorkout(w);
      await Storage.setPref('activeWorkoutId', w.id);
    }, { presetId, circuit, seed });
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(1500);
    await page.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"],.splash').forEach((n) => n.remove()));
    await page.click('[data-testid="button-resume-workout"]');
    await page.waitForTimeout(1600);
    await page.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"]').forEach((n) => n.remove()));
    // The guided set runner opens over the workout screen on its own; it is
    // the other way to log this session and it sits on top of the button.
    await dismissSetRunner();
    const cta = await page.textContent('.flow-cta-sub').catch(() => '');
    await page.click('[data-testid="start-circuit"]');
    await page.waitForTimeout(1400);
    return cta;
  };

  const dismissSetRunner = async () => {
    if (!(await page.$('[data-testid="set-runner"]'))) return;
    await page.keyboard.press('Escape');
    await page.waitForTimeout(700);
    await page.evaluate(() => document.querySelectorAll('[data-testid="set-runner"]').forEach((n) => n.remove()));
    await page.waitForTimeout(300);
  };

  /** Cold-start the app with whatever is in storage. An interrupted run is
      picked up by boot itself, not by a tap, so this is all it takes to
      exercise the resume path. */
  const coldStart = async (settle = 2400) => {
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(settle);
    await page.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"],.splash').forEach((n) => n.remove()));
  };
  const dialogText = () => page.evaluate(() =>
    document.querySelector('.dialog-overlay, .modal-overlay')?.innerText.replace(/\n+/g, ' | ') || '');
  /** Answer the open dialog. Scoped to the overlay on purpose: the home
      screen has its own "Resume" behind it, which a real tap cannot reach
      through a modal but `.click()` in page context happily would. */
  const clickBtn = async (re, settle = 1600) => {
    const ok = await page.evaluate((src) => {
      const root = document.querySelector('.dialog-overlay, .modal-overlay');
      if (!root) return false;
      const btn = [...root.querySelectorAll('button')]
        .find((x) => new RegExp(src, 'i').test(x.textContent.trim()));
      if (!btn) return false;
      btn.click();
      return true;
    }, re.source);
    check(`a dialog offered "${re.source}"`, ok);
    await page.waitForTimeout(settle);
  };

  const has = async (t) => !!(await page.$(`[data-testid="${t}"]`));
  const txt = (t) => page.textContent(`[data-testid="${t}"]`).catch(() => null);
  const stored = () => page.evaluate(async () => await Storage.getWorkout('scored1'));
  /** Finish through the End/Finish button, answering the confirm. Returns the
      confirm's own text, because the copy is part of what is under test. */
  const finishRun = async () => {
    await page.click('[data-testid="ivr-end"]');
    await page.waitForTimeout(700);
    const copy = await dialogText();
    await clickBtn(/finish and log|end and log/);
    return copy;
  };

  // ================= 1. the two formats are opposites ======================
  console.log('\n=== 1. AMRAP: fixed clock, you supply the number ===');
  {
    const cta = await start('preset-amrap-20');
    // spec.rounds does not exist on a scored format — the generic line read
    // "1 rounds · 3 stations" for a twenty-minute AMRAP.
    check('the start card describes the format, not a round count',
      /as many rounds as possible/i.test(cta) && !/\b1 rounds\b/.test(cta), cta);
    check('and states the cap', /20 min cap/.test(cta), cta);
    check('the runner opened', await has('interval-runner'));
    check('the round tally is on screen', await has('ivr-tally'));
    check('the clock is labelled', /time left/i.test(await txt('ivr-label') || ''), await txt('ivr-label'));

    const c1 = await txt('ivr-clock');
    await page.waitForTimeout(2400);
    const c2 = await txt('ivr-clock');
    const toSec = (s) => { const [m, x] = (s || '0:0').split(':').map(Number); return m * 60 + x; };
    check('the clock counts down toward the cap', toSec(c2) < toSec(c1), `${c1} -> ${c2}`);
    check('the header shows the cap draining',
      /left of 20:00/.test(await txt('ivr-totals') || ''), await txt('ivr-totals'));

    // Skip advances one step. A scored run has exactly one, so Skip would end
    // it and file a score with no confirm and no way back.
    check('there is no Skip to fall through', !(await has('ivr-skip')));
    check('and no plan strip, because there is no plan',
      await page.evaluate(() => !document.querySelector('.ivr-plan')));
    check('and no "next up", because there is no next',
      ((await txt('ivr-next')) || '').trim() === '', await txt('ivr-next'));
    check('the end button reads as finishing, not quitting',
      /finish/i.test(await txt('ivr-end') || ''), await txt('ivr-end'));

    console.log('\n   -- the tally --');
    for (let i = 0; i < 4; i++) { await page.click('[data-testid="ivr-round"]'); await page.waitForTimeout(120); }
    check('four taps counts four', (await txt('ivr-tally-num')) === '4');
    await page.click('[data-testid="ivr-round-undo"]');
    await page.waitForTimeout(200);
    check('undo takes one back', (await txt('ivr-tally-num')) === '3');
    // Nobody completes minus one round.
    for (let i = 0; i < 6; i++) { await page.click('[data-testid="ivr-round-undo"]'); await page.waitForTimeout(90); }
    check('undo stops at zero', (await txt('ivr-tally-num')) === '0');
    for (let i = 0; i < 7; i++) { await page.click('[data-testid="ivr-round"]'); await page.waitForTimeout(110); }
    check('and counting resumes from zero', (await txt('ivr-tally-num')) === '7');
    await page.screenshot({ path: `${SS}/scored-amrap.png` });

    const copy = await finishRun();
    check('the confirm names the number it is about to file',
      /7 rounds/.test(copy), copy.slice(0, 90));
    const w = await stored();
    check('the score is stored as rounds in a cap',
      w.score && w.score.mode === 'amrap' && w.score.rounds === 7 && w.score.capSec === 1200,
      JSON.stringify(w.score));
    check('and the run is cleared', !w.flowRun && !w.flowRounds);
    // Seven rounds of 5/10/15 is not thirty sets of anything anyone counted.
    check('no set rows were invented from the round count',
      (w.exercises || []).every((e) => (e.sets || []).every((s) => !s.done)));

    // The score does not live in the set rows, so without a card the screen
    // is byte-identical before and after a twenty-minute effort.
    check('the score is on the workout screen, not just in a toast',
      (await txt('score-value')) === '7', await txt('score-value'));
    check('and the start card now offers a repeat',
      /run it again/i.test(await page.textContent('.flow-cta-title')),
      await page.textContent('.flow-cta-title'));
  }

  console.log('\n=== 1b. For Time: fixed work, the clock is the number ===');
  {
    const cta = await start('preset-fortime-500');
    check('the start card says the clock is the score',
      /for time/i.test(cta) && /30 min cap/.test(cta), cta);
    check('no tally — rounds are not the unit here', !(await has('ivr-tally')));
    check('the clock is labelled', /elapsed/i.test(await txt('ivr-label') || ''), await txt('ivr-label'));

    const toSec = (s) => { const [m, x] = (s || '0:0').split(':').map(Number); return m * 60 + x; };
    const c1 = toSec(await txt('ivr-clock'));
    await page.waitForTimeout(2600);
    const c2 = toSec(await txt('ivr-clock'));
    check('the clock counts up — elapsed is the score', c2 > c1, `${c1}s -> ${c2}s`);
    check('the cap is stated, not counted down',
      /^cap 30:00$/.test(((await txt('ivr-totals')) || '').trim()), await txt('ivr-totals'));
    // Two readings of one clock must not disagree about which way it is going.
    const frac = await page.evaluate(() =>
      parseFloat(getComputedStyle(document.querySelector('.ivr-ring')).getPropertyValue('--frac')));
    await page.waitForTimeout(1800);
    const frac2 = await page.evaluate(() =>
      parseFloat(getComputedStyle(document.querySelector('.ivr-ring')).getPropertyValue('--frac')));
    check('the ring fills with the digits rather than draining against them',
      frac2 > frac, `${frac} -> ${frac2}`);
    check('no Skip here either', !(await has('ivr-skip')));
    await page.screenshot({ path: `${SS}/scored-fortime.png` });

    const copy = await finishRun();
    check('the confirm is about stopping a clock, not abandoning a run',
      /stop the clock/i.test(copy) && !/end this run/i.test(copy), copy.slice(0, 90));
    const w = await stored();
    check('the score is stored as an elapsed time',
      w.score && w.score.mode === 'fortime' && w.score.elapsedSec >= 4 && w.score.capSec === 1800,
      JSON.stringify(w.score));
    check('finishing early is not recorded as capped', w.score.capped === false);
  }

  // ================= 2. the count survives the phone =======================
  console.log('\n=== 2. what the tally survives ===');
  {
    await start('preset-amrap-20');
    for (let i = 0; i < 5; i++) { await page.click('[data-testid="ivr-round"]'); await page.waitForTimeout(110); }
    check('five rounds counted', (await txt('ivr-tally-num')) === '5');
    // The runner's own position is persisted on every tick. If the tally is
    // not, this is where you find out — after five rounds, reading zero.
    const onDisk = await page.evaluate(async () => (await Storage.getWorkout('scored1')).flowRounds);
    check('each tap is written down, not just displayed', onDisk === 5, String(onDisk));

    await coldStart();
    // The resume prompt has to show the count, because the other button
    // discards it and nothing else in the app has a copy.
    const prompt = await dialogText();
    check('resuming offers the count back', /5 rounds/.test(prompt), prompt.slice(0, 110));
    await clickBtn(/^resume$/);
    check('the runner comes back up', await has('interval-runner'));
    check('and it comes back at five, not zero', (await txt('ivr-tally-num')) === '5');
    await page.click('[data-testid="ivr-round"]');
    await page.waitForTimeout(200);
    check('counting continues from where it was', (await txt('ivr-tally-num')) === '6');
    await finishRun();
    check('the resumed run stores the resumed count',
      (await stored()).score.rounds === 6, JSON.stringify((await stored()).score));
  }

  // ================= 3. the ways a scored run ends =========================
  console.log('\n=== 3. running out of clock ===');
  {
    // A cap the test can actually sit through.
    await start('preset-amrap-20', { mode: 'amrap', capSec: 60 });
    for (let i = 0; i < 3; i++) { await page.click('[data-testid="ivr-round"]'); await page.waitForTimeout(110); }
    // Wind the clock back rather than waiting a minute: the runner derives its
    // position from wall-clock start, so this is the same thing to it.
    await page.evaluate(async () => {
      const w = await Storage.getWorkout('scored1');
      w.flowRun.startedAt -= 70 * 1000;
      await Storage.saveWorkout(w);
    });
    await coldStart(3000);
    const w = await stored();
    check('a cap that expired while the app was shut still files a score',
      !!w.score && w.score.mode === 'amrap', JSON.stringify(w.score));
    check('and it files the rounds that were counted, not zero',
      w.score && w.score.rounds === 3, String(w.score && w.score.rounds));
    check('no half-finished run is left behind', !w.flowRun);
  }

  {
    await start('preset-fortime-500', { mode: 'fortime', capSec: 60 });
    await page.evaluate(async () => {
      const w = await Storage.getWorkout('scored1');
      w.flowRun.startedAt -= 70 * 1000;
      await Storage.saveWorkout(w);
    });
    await coldStart(3000);
    const w = await stored();
    // "Hit the cap" and "finished in exactly the cap" are different results,
    // and a bare elapsed time cannot tell them apart.
    check('running out of clock on For Time is recorded as capped',
      w.score && w.score.mode === 'fortime' && w.score.capped === true, JSON.stringify(w.score));
  }

  // ================= 4. the score in history ===============================
  console.log('\n=== 4. reading it back ===');
  {
    await page.evaluate(async () => {
      await Storage.clearAll();
      await Storage.setPref('onboarded', true);
      const base = { date: U.todayISO(), startedAt: 1, completedAt: 2, durationSec: 1200, exercises: [] };
      await Storage.saveWorkout({ ...base, id: 'h-amrap', name: '20-Minute AMRAP',
        score: { mode: 'amrap', rounds: 12, capSec: 1200, elapsedSec: 1200 } });
      await Storage.saveWorkout({ ...base, id: 'h-ft', name: 'For Time · 500 Reps',
        score: { mode: 'fortime', elapsedSec: 1105, capSec: 1800, capped: false } });
      await Storage.saveWorkout({ ...base, id: 'h-ftc', name: 'For Time · capped',
        score: { mode: 'fortime', elapsedSec: 1800, capSec: 1800, capped: true } });
    });
    await coldStart(1800);

    const openById = async (id) => {
      await page.evaluate((wid) => {
        const rows = [...document.querySelectorAll('[data-testid="history-item"]')];
        const names = { 'h-amrap': '20-Minute AMRAP', 'h-ft': 'For Time · 500 Reps', 'h-ftc': 'For Time · capped' };
        rows.find((r) => r.textContent.includes(names[wid]))?.click();
      }, id);
      await page.waitForTimeout(900);
    };
    await page.evaluate(() => document.querySelector('[data-testid="dock-stats"]').click());
    await page.waitForTimeout(1600);
    await page.evaluate(() => document.querySelector('[data-testid="seg-history"]').click());
    await page.waitForTimeout(1300);
    check('the sessions are in history',
      (await page.$$('[data-testid="history-item"]')).length === 3);

    // The list is where you scan for what you did. Counting sets and volume
    // on an AMRAP describes the prescription, not the result.
    const rowFor = (name) => page.evaluate((n) => [...document.querySelectorAll('[data-testid="history-item"]')]
      .find((r) => r.textContent.includes(n))?.innerText.replace(/\n+/g, ' · ') || '', name);
    const amrapRow = await rowFor('20-Minute AMRAP');
    check('the AMRAP row leads with its rounds', /12 rounds in 20:00/.test(amrapRow), amrapRow);
    check('and does not count sets nobody logged', !/\bsets?\b/.test(amrapRow), amrapRow);
    const ftRow = await rowFor('For Time · 500 Reps');
    check('the For Time row leads with its time', /18:25/.test(ftRow), ftRow);
    check('a capped row says so in the list too',
      /\(capped\)/.test(await rowFor('For Time · capped')), await rowFor('For Time · capped'));

    await openById('h-amrap');
    check('an AMRAP shows its rounds', (await txt('score-value')) === '12', await txt('score-value'));
    check('with the cap it was scored in',
      /20:00/.test(await page.textContent('.score-sub')), await page.textContent('.score-sub'));
    await page.screenshot({ path: `${SS}/scored-detail.png` });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(700);

    await openById('h-ft');
    check('a For Time shows its time', (await txt('score-value')) === '18:25', await txt('score-value'));
    check('and says it came in under the cap',
      /under the/.test(await page.textContent('.score-sub')), await page.textContent('.score-sub'));
    await page.keyboard.press('Escape');
    await page.waitForTimeout(700);

    await openById('h-ftc');
    // The number is identical to a session that finished on the buzzer.
    // Without the word, the two are indistinguishable in the record.
    check('a capped For Time says so rather than reading as a finish',
      /capped/.test(await page.textContent('.score-sub')), await page.textContent('.score-sub'));
    await page.keyboard.press('Escape');
    await page.waitForTimeout(600);
  }

  // ================= 5. the timed circuits still work ======================
  console.log('\n=== 5. nothing leaked into the formats that already worked ===');
  {
    const timed = await page.evaluate(() =>
      (window.PRESET_SESSIONS.find((s) => s.circuit && s.circuit.mode === 'emom')
        || window.PRESET_SESSIONS.find((s) => s.circuit && !/amrap|fortime/.test(s.circuit.mode)))?.id);
    check('there is still a timed circuit to check', !!timed, timed);
    await start(timed);
    check('a timed circuit has no tally', !(await has('ivr-tally')));
    check('it keeps its Skip', await has('ivr-skip'));
    check('and its plan strip',
      await page.evaluate(() => !!document.querySelector('.ivr-plan')));
    check('its clock still counts down',
      !/^0:0[0-3]$/.test(((await txt('ivr-clock')) || '').trim()), await txt('ivr-clock'));
    check('and it still says what is next',
      /next/i.test((await txt('ivr-next')) || ''), await txt('ivr-next'));
    await page.click('[data-testid="ivr-end"]');
    await page.waitForTimeout(700);
    const copy = await dialogText();
    check('and ending it still reads as ending it', /end this run/i.test(copy), copy.slice(0, 80));
    await clickBtn(/end and log/);
    check('a timed circuit files no score', !(await stored()).score);
  }

  console.log('\nERRORS:', errs.length ? errs : 'none');
  console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
