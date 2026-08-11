// The four training-quality gaps a daily lifter feels, closed and held
// closed: per-exercise rest targets, RPE on sets, mid-session reordering
// that keeps logged sets, and the what-to-load-next line built from the
// lifter's own history.
//
//   node tests/training-quality.js   (needs `python3 -m http.server 8199`)
const { chromium } = require('/opt/node22/lib/node_modules/playwright/index.js');

let fails = 0;
const check = (label, ok, detail = '') => {
  if (!ok) fails++;
  console.log(`   ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
};

const PREFS = { onboarded: true, guidedSets: false, warmupPrompt: false, radialDiscovered: true };

async function bootWith(p, seed) {
  await p.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
  await p.waitForFunction(() => window.Storage && window.U);
  await p.evaluate(async (fn) => {
    await Storage.clearAll();
    // eslint-disable-next-line no-eval
    await eval(`(${fn})`)();
  }, seed.toString());
  await p.reload({ waitUntil: 'load' });
  await p.waitForTimeout(2400);
  await p.evaluate(() => document.querySelectorAll('.splash').forEach(n => n.remove()));
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', hasTouch: true, isMobile: true });
  const p = await c.newPage();

  console.log('=== 1. per-exercise rest targets ===');
  await bootWith(p, async () => {
    const P = { onboarded: true, guidedSets: false, warmupPrompt: false, radialDiscovered: true };
    for (const [k, v] of Object.entries(P)) await Storage.setPref(k, v);
    await Storage.saveWorkout({ id: 'aw', name: 'Session', date: U.todayISO(), startedAt: Date.now(),
      exercises: [
        { exerciseId: 'squat-barbell-back', name: 'Squat', type: 'weighted', sets: [{ weight: 100, reps: 5, done: false }, { weight: 100, reps: 5, done: false }] },
        { exerciseId: 'bicep-curl-dumbbell', name: 'Curl', type: 'weighted', sets: [{ weight: 14, reps: 10, done: false }] }
      ] });
    await Storage.setPref('activeWorkoutId', 'aw');
  });
  await p.evaluate(() => document.querySelector('[data-testid="button-resume-workout"]')?.click());
  await p.waitForTimeout(1600);

  const chip = await p.evaluate(() => {
    const chips = [...document.querySelectorAll('[data-testid="rest-target-chip"]')];
    return chips.length ? chips[0].textContent : null;
  });
  check('each weighted exercise carries a rest chip', !!chip, String(chip));
  check('and it starts at the global default', !!chip && /1:30/.test(chip), String(chip));

  // Set the squat's target to 3:00 through the picker.
  await p.evaluate(() => document.querySelectorAll('[data-testid="rest-target-chip"]')[0]?.click());
  await p.waitForTimeout(600);
  const pickerUp = await p.evaluate(() => !!document.querySelector('[data-testid="rest-target-list"]'));
  check('the picker opens', pickerUp);
  await p.evaluate(() => document.querySelector('[data-testid="rest-target-180"]')?.click());
  await p.waitForTimeout(1000);
  const after = await p.evaluate(async () => ({
    chip: document.querySelectorAll('[data-testid="rest-target-chip"]')[0]?.textContent,
    curlChip: document.querySelectorAll('[data-testid="rest-target-chip"]')[1]?.textContent,
    pref: await Storage.getPref('restTargets', null)
  }));
  check('the squat chip shows 3:00', /3:00/.test(after.chip || ''), after.chip);
  check('the curl keeps the default', /1:30/.test(after.curlChip || ''), after.curlChip);
  check('the target persists as a pref', !!after.pref && after.pref['squat-barbell-back'] === 180, JSON.stringify(after.pref));

  // Logging a squat set must start a 180 s rest; a curl set a 90 s one.
  await p.evaluate(() => {
    const rows = document.querySelectorAll('.exercise-block')[0];
    rows.querySelector('[data-testid="set-done-0"]')?.click();
  });
  await p.waitForTimeout(800);
  const squatRest = await p.evaluate(() => document.getElementById('rest-value')?.textContent || null);
  check('logging a squat set rests 180 s, not the global 90', !!squatRest && /^(3:00|2:5\d)$/.test(squatRest), String(squatRest));
  await p.evaluate(() => document.querySelector('[data-testid="rest-skip"]')?.click());
  await p.waitForTimeout(400);

  console.log('\n=== 2. RPE on sets ===');
  const rpe = await p.evaluate(async () => {
    const block = document.querySelectorAll('.exercise-block')[0];
    block.querySelector('[data-testid="set-more-1"]')?.click();
    await new Promise(r => setTimeout(r, 500));
    const sel = block.querySelector('[data-testid="set-rpe-1"]');
    if (!sel) return { found: false };
    sel.value = '8.5';
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise(r => setTimeout(r, 800));
    const w = await Storage.getWorkout('aw');
    return { found: true, stored: w.exercises[0].sets[1].rpe };
  });
  check('the tools tray carries an RPE selector', rpe.found);
  check('a picked RPE is stored on the set', rpe.stored === 8.5, String(rpe.stored));

  console.log('\n=== 3. reorder keeps every logged set ===');
  const order1 = await p.evaluate(async () => {
    document.querySelectorAll('.exercise-block')[0].querySelector('[data-testid="move-ex-down"]')?.click();
    await new Promise(r => setTimeout(r, 900));
    const w = await Storage.getWorkout('aw');
    return {
      names: w.exercises.map(e => e.name),
      squatDone: w.exercises.find(e => e.name === 'Squat').sets.filter(s => s.done).length,
      squatRpe: w.exercises.find(e => e.name === 'Squat').sets[1].rpe
    };
  });
  check('move-down swaps the order in storage', order1.names.join(',') === 'Curl,Squat', order1.names.join(','));
  check('the logged set survives the move', order1.squatDone === 1, String(order1.squatDone));
  check('so does its RPE', order1.squatRpe === 8.5, String(order1.squatRpe));
  const topUp = await p.evaluate(() => {
    const first = document.querySelectorAll('.exercise-block')[0];
    return { name: first.querySelector('.exercise-block-title')?.textContent?.trim().slice(0, 4), upDisabled: !!first.querySelector('[data-testid="move-ex-up"][disabled]') };
  });
  check('the UI re-renders with the new order, top arrow dead', topUp.name === 'Curl' && topUp.upDisabled, JSON.stringify(topUp));

  // A separated superset must dissolve rather than link across the page.
  const ssResult = await p.evaluate(async () => {
    const w = await Storage.getWorkout('aw');
    w.exercises.push({ exerciseId: 'lat-pulldown-cable', name: 'Pulldown', type: 'weighted', sets: [{ weight: 50, reps: 10, done: false }] });
    w.exercises[0].supersetGroup = 'ss-test';
    w.exercises[1].supersetGroup = 'ss-test';
    await Storage.saveWorkout(w);
    return w.exercises.map(e => e.name);
  });
  // The live session owns its in-memory copy; storage edits behind its back
  // only become real after a reload-resume, so stage it that way.
  await p.reload({ waitUntil: 'load' });
  await p.waitForTimeout(2400);
  await p.evaluate(() => document.querySelectorAll('.splash').forEach(n => n.remove()));
  await p.evaluate(() => document.querySelector('[data-testid="button-resume-workout"]')?.click());
  await p.waitForTimeout(1600);
  const ssAfter = await p.evaluate(async () => {
    // Move the second exercise (Squat, in the pact) down past Pulldown.
    document.querySelectorAll('.exercise-block')[1].querySelector('[data-testid="move-ex-down"]')?.click();
    await new Promise(r => setTimeout(r, 900));
    const w = await Storage.getWorkout('aw');
    return { names: w.exercises.map(e => e.name), groups: w.exercises.map(e => e.supersetGroup || null) };
  });
  check('separating a superset dissolves it', ssAfter.groups.every(g => g === null),
    `${ssAfter.names.join(',')} · groups ${JSON.stringify(ssAfter.groups)}`);

  console.log('\n=== 4. the what-to-load-next line ===');
  // Three histories, three verdicts. Seed completed sessions and read the hint.
  const seedHistory = async (p, sessions) => {
    // Seed BEFORE the boot that resumes: history sessions newest-last, one
    // active workout pointing at the same exercise, then reload and resume.
    await p.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
    await p.waitForFunction(() => window.Storage && window.U);
    await p.evaluate(async (sess) => {
      await Storage.clearAll();
      const P = { onboarded: true, guidedSets: false, warmupPrompt: false, radialDiscovered: true };
      for (const [k, v] of Object.entries(P)) await Storage.setPref(k, v);
      // sess is oldest-first; space sessions 3 days apart ending yesterday.
      for (let i = 0; i < sess.length; i++) {
        const d = new Date(); d.setDate(d.getDate() - ((sess.length - 1 - i) * 3 + 1));
        await Storage.saveWorkout({ id: `h${i}`, name: 'Past', date: U.todayISO(d),
          startedAt: d.getTime(), completedAt: d.getTime() + 3600e3,
          exercises: [{ exerciseId: 'bench-press-barbell', name: 'Bench', type: 'weighted',
            sets: sess[i].map(([w, r, extra]) => ({ weight: w, reps: r, done: true, ...(extra || {}) })) }] });
      }
      await Storage.saveWorkout({ id: 'now', name: 'Today', date: U.todayISO(), startedAt: Date.now(),
        exercises: [{ exerciseId: 'bench-press-barbell', name: 'Bench', type: 'weighted',
          sets: [{ weight: null, reps: null, done: false }] }] });
      await Storage.setPref('activeWorkoutId', 'now');
    }, sessions);
    await p.reload({ waitUntil: 'load' });
    await p.waitForTimeout(2400);
    await p.evaluate(() => document.querySelectorAll('.splash').forEach(n => n.remove()));
    await p.evaluate(() => document.querySelector('[data-testid="button-resume-workout"]')?.click());
    await p.waitForTimeout(1600);
    return p.evaluate(() => {
      const h = document.querySelector('[data-testid="progression-hint"]');
      return h ? { kind: h.getAttribute('data-kind'), text: h.textContent } : null;
    });
  };

  // 8+ reps on the top set → add weight (80 kg → 82.5).
  const up = await seedHistory(p, [[[80, 8], [80, 8], [80, 8]]]);
  check('8 reps at 80 earns "try 82.5"', !!up && up.kind === 'add-weight' && /82\.5/.test(up.text), JSON.stringify(up));

  // Short of 8 → chase the rep, not the plate.
  const rep = await seedHistory(p, [[[80, 6], [80, 6], [80, 5]]]);
  check('6 reps at 80 aims 7 reps, same bar', !!rep && rep.kind === 'add-rep' && /aim 7 reps/.test(rep.text), JSON.stringify(rep));

  // e1RM down on the session before → repeat, never auto-escalate.
  const hold = await seedHistory(p, [[[80, 10]], [[80, 8]]]);
  check('a dipped e1RM says repeat', !!hold && hold.kind === 'hold', JSON.stringify(hold));

  // Warm-ups must not masquerade as the top set.
  const warm = await seedHistory(p, [[[100, 10, { warmup: true }], [80, 8]]]);
  check('warm-ups are excluded from the verdict', !!warm && warm.kind === 'add-weight' && /82\.5/.test(warm.text), JSON.stringify(warm));

  // No history → no guess.
  const fresh = await seedHistory(p, []);
  check('no history means no hint, not a fabricated one', fresh === null, JSON.stringify(fresh));

  await p.evaluate(async () => { await Storage.clearAll(); });
  await b.close();
  console.log(`\n${fails === 0 ? 'ALL PASS' : fails + ' FAILED'}`);
  process.exit(fails === 0 ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
