// The strength tiers, and who they are measured against.
//
// "Advanced" is a claim about where you sit among other people, so it cannot be
// made without knowing which people. The app had two problems with that.
//
// It scaled the women's thresholds off the men's with a single 0.72 for every
// lift. One number cannot be right for both ends of the body: the sex
// difference is much larger in the upper body than the lower — roughly 55-65%
// of male strength above the waist against 70-80% below it — so a flat factor
// is wrong in both directions at once. At 65kg it wanted 70kg of bench before
// it would say Advanced, where the evidence puts that nearer 58, and it handed
// out Advanced for a 94kg squat that should have been closer to 104.
//
// And with no sex on file it fell through to the men's table without saying so.
//
// This suite had no predecessor. Strength tiers were the last of the app's
// claim-making systems with no coverage at all, which is the usual reason a
// thing like the 0.72 survives.
//
//   node tests/strength-standards.js   (needs `python3 -m http.server 8199`)
const { chromium } = require('/opt/node22/lib/node_modules/playwright/index.js');
const path = require('path');
const fs = require('fs');

let fails = 0;
const check = (label, ok, detail = '') => {
  if (!ok) fails++;
  console.log(`   ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
};

// Both tables live inside app.js's IIFE, so they cannot be reached from the
// page. Lifted out of the source as plain literals instead — the same trick
// tests/taxonomy.js uses on the data files.
const APP = fs.readFileSync(path.resolve(__dirname, '..', 'js/app.js'), 'utf8');
const literal = (name) => {
  const at = APP.indexOf(`const ${name} = {`);
  if (at < 0) return null;
  const open = APP.indexOf('{', at);
  let depth = 0;
  for (let i = open; i < APP.length; i++) {
    if (APP[i] === '{') depth++;
    else if (APP[i] === '}' && --depth === 0) {
      // Strip line comments so the literal parses.
      const src = APP.slice(open, i + 1).replace(/\/\/[^\n]*/g, '');
      return new Function('return ' + src)();
    }
  }
  return null;
};

(async () => {
  const MALE = literal('STRENGTH_STANDARDS');
  const FEM = literal('FEMALE_STANDARD_RATIO');

  // ================= 1. the tables line up ================================
  console.log('=== 1. every lift has a women\'s figure, and it is plausible ===');
  {
    check('the men\'s standards were found', !!MALE && Object.keys(MALE).length >= 7,
      MALE ? Object.keys(MALE).join(', ') : 'not found');
    check('and the women\'s ratios', !!FEM, FEM ? Object.keys(FEM).join(', ') : 'not found');
    if (!MALE || !FEM) throw new Error('could not read the standards out of app.js');

    // A lift with no ratio would silently fall back and be wrong quietly,
    // which is exactly how the flat factor lasted as long as it did.
    const missing = Object.keys(MALE).filter((k) => !(k in FEM));
    check('no lift is left without one', missing.length === 0, missing.join(', '));
    const orphan = Object.keys(FEM).filter((k) => !(k in MALE));
    check('and none names a lift that does not exist', orphan.length === 0, orphan.join(', '));

    const vals = Object.values(FEM);
    check('every ratio is inside the range the evidence supports',
      vals.every((v) => v >= 0.5 && v <= 0.9), JSON.stringify(FEM));
    // The whole point of the change: it is no longer one number.
    check('they are not all the same number', new Set(vals).size > 1, JSON.stringify(vals));
  }

  // ================= 2. the shape of the difference ======================
  console.log('\n=== 2. upper body differs more than lower, which is why one factor failed ===');
  {
    const press = Math.max(FEM.bench, FEM.ohp);
    const lower = Math.min(FEM.squat, FEM.deadlift);
    check('pressing is scaled down further than the legs are',
      press < lower, `press ${press} vs legs ${lower}`);
    check('pulling sits between the two',
      FEM.pulldown > FEM.bench && FEM.pulldown < FEM.squat,
      `${FEM.bench} < ${FEM.pulldown} < ${FEM.squat}`);
    // The old flat value, stated so a revert to it is a visible failure rather
    // than a quiet one.
    check('nothing has crept back to the old single 0.72',
      !Object.values(FEM).includes(0.72), JSON.stringify(FEM));
  }

  // ================= 3. what it means in kilos ============================
  console.log('\n=== 3. and what that is worth on the bar ===');
  {
    const bw = 65;
    const adv = (lift) => ({
      now: Math.round(MALE[lift][2] * FEM[lift] * bw),
      flat: Math.round(MALE[lift][2] * 0.72 * bw)
    });
    const bench = adv('bench'), squat = adv('squat');
    console.log(`      65kg woman, Advanced: bench ${bench.now}kg (was ${bench.flat}), squat ${squat.now}kg (was ${squat.flat})`);
    // The two directions. A change that moved both the same way would mean the
    // flat factor had only been mis-scaled rather than the wrong shape.
    check('the bench bar comes DOWN — it was too hard', bench.now < bench.flat,
      `${bench.now} vs ${bench.flat}`);
    check('and the squat bar goes UP — it was too easy', squat.now > squat.flat,
      `${squat.now} vs ${squat.flat}`);
  }

  // ================= 4. through the app ==================================
  console.log('\n=== 4. the tier a card actually shows ===');
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const c = await b.newContext({ viewport: { width: 390, height: 900 }, serviceWorkers: 'block', hasTouch: true });
  const page = await c.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push('PAGEERR: ' + e.message.slice(0, 170)));
  await page.route(/fonts\.googleapis\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await page.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
  await page.waitForFunction(() => window.Storage && window.U);

  // Single reps, so the e1RM is exactly the weight on the bar.
  const tierFor = async ({ sex, bwKg, exerciseId, name, kg }) => {
    await page.evaluate(async (o) => {
      await Storage.clearAll();
      const prefs = { onboarded: true, dob: '1995-04-12', heightCm: 170, activityLevel: 'moderate' };
      if (o.sex) prefs.sex = o.sex;
      for (const [k, v] of Object.entries(prefs)) await Storage.setPref(k, v);
      await Storage.saveBodyweight({ date: U.todayISO(), kg: o.bwKg });
      const d = new Date(); d.setDate(d.getDate() - 1);
      await Storage.saveWorkout({
        id: 'sw', name: 'Session', date: U.todayISO(d), startedAt: d.getTime(),
        completedAt: d.getTime() + 3.6e6, durationSec: 3600,
        exercises: [{ exerciseId: o.exerciseId, name: o.name, type: 'weighted',
          sets: [{ weight: o.kg, reps: 1, done: true }] }]
      });
    }, { sex, bwKg, exerciseId, name, kg });
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(2400);
    await page.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"],.splash').forEach((n) => n.remove()));
    await page.evaluate(() => document.querySelector('[data-testid="dock-library"]').click());
    await page.waitForTimeout(700);
    await page.evaluate(() => document.querySelector('[data-testid="learn-fork-bodymap"]')?.click());
    await page.waitForTimeout(1600);
    return page.evaluate((id) => {
      const card = document.querySelector(`[data-ex-id="${id}"]`);
      if (!card) return { card: false };
      return { card: true, tier: card.querySelector('.ex-tier-name')?.textContent.trim() || null };
    }, exerciseId);
  };

  {
    // 65kg woman, 62kg bench. New: 1.5 × 0.6 × 65 = 58.5, so Advanced.
    // Old flat 0.72 wanted 70.2 and would have said Intermediate.
    const r = await tierFor({ sex: 'female', bwKg: 65, exerciseId: 'bench-press-barbell',
      name: 'Barbell Bench Press', kg: 62 });
    check('the bench card is there to read', r.card);
    check('62kg at 65kg bodyweight is Advanced for a woman', r.tier === 'Advanced',
      String(r.tier) + ' (the flat factor would have said Intermediate)');

    // 98kg squat at 65kg. New: 2.0 × 0.8 × 65 = 104, so NOT yet Advanced.
    // Old flat 0.72 wanted 93.6 and would have handed out Advanced.
    const s = await tierFor({ sex: 'female', bwKg: 65, exerciseId: 'squat-back',
      name: 'Barbell Back Squat', kg: 98 });
    check('98kg squat at 65kg is Intermediate, not Advanced', s.tier === 'Intermediate',
      String(s.tier) + ' (the flat factor would have said Advanced)');

    // Men are untouched: 1.5x bodyweight bench is exactly Advanced.
    const m = await tierFor({ sex: 'male', bwKg: 80, exerciseId: 'bench-press-barbell',
      name: 'Barbell Bench Press', kg: 120 });
    check('the men\'s standards are unchanged', m.tier === 'Advanced', String(m.tier));

    // No sex on file: no tier. It used to quietly grade you as a man.
    const n = await tierFor({ sex: null, bwKg: 80, exerciseId: 'bench-press-barbell',
      name: 'Barbell Bench Press', kg: 120 });
    check('with no sex on file the card still renders', n.card);
    check('but it claims no tier rather than grading you as a man',
      n.tier === null, String(n.tier));
  }

  console.log('\nERRORS:', errs.length ? errs : 'none');
  console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
