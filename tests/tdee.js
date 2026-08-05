// Maintenance, measured rather than predicted.
//
// Mifflin-St Jeor predicts. The logs measure. Over a long enough window it is
// conservation of energy:
//
//     maintenance = average intake - (weight change x 7700) / days
//
// The app has always had the right mechanism for "the equation is wrong about
// me" — the personal tweak — and never said what to put in it, so it sat at
// zero for everyone.
//
// THE RISK IS NOT THE ARITHMETIC, IT IS THE CONFIDENCE. Both inputs are noisy
// in ways that do not average out quickly: bodyweight swings a kilo on water
// alone, and at 7700 kcal to the kilo that is 550 kcal/day of error over a
// fortnight — larger than the effect being measured. Food logs are
// under-reported far more often than over-reported, and a window with half its
// days missing is a guess wearing an average's clothes.
//
// So most of this suite is about REFUSING to answer. Section 2 is the one that
// matters: every gate there is the difference between a number worth acting on
// and a number that would be acted on and should not have been.
//
//   node tests/tdee.js   (needs `python3 -m http.server 8199`)
const { chromium } = require('/opt/node22/lib/node_modules/playwright/index.js');

let fails = 0;
const check = (label, ok, detail = '') => {
  if (!ok) fails++;
  console.log(`   ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
};

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const c = await b.newContext({ viewport: { width: 390, height: 1000 }, serviceWorkers: 'block', hasTouch: true });
  const page = await c.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push('PAGEERR: ' + e.message.slice(0, 170)));
  await page.route(/fonts\.googleapis\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await page.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
  await page.waitForFunction(() => window.Storage && window.U);

  // Build a fixture in the page: `days` of daily weigh-ins moving `deltaKg` in
  // total while eating `kcal`, with food logged on `foodDays` of them.
  const fixture = (o) => page.evaluate((opt) => {
    const iso = (n) => {
      const d = new Date(); d.setDate(d.getDate() - n); return U.todayISO(d);
    };
    const weighIns = [], intakeByDate = {};
    for (let i = opt.days - 1; i >= 0; i--) {
      if (i % (opt.everyNDays || 1) === 0) {
        weighIns.push({ date: iso(i), kg: opt.startKg + (opt.days - 1 - i) * (opt.deltaKg / (opt.days - 1)) });
      }
      if (opt.foodDays == null || i < opt.foodDays) intakeByDate[iso(i)] = opt.kcal;
    }
    return U.estimateMaintenance({ weighIns, intakeByDate });
  }, o);

  // ================= 1. the arithmetic ======================================
  console.log('=== 1. conservation of energy, both directions ===');
  {
    // 2000 a day, a kilo lost across the compared midpoints -> you were eating
    // under by a kilo's worth spread over those days.
    const lost = await fixture({ days: 21, startKg: 80, deltaKg: -1.5, kcal: 2000 });
    check('a clean fortnight produces a figure', lost.ok, JSON.stringify(lost.reasons || []));
    const expected = Math.round(2000 + (Math.abs(lost.deltaKg) * 7700) / lost.elapsedDays);
    check('losing weight puts maintenance ABOVE intake',
      lost.maintenance > 2000, `${lost.maintenance} vs 2000 eaten`);
    check('and by the amount the weight change accounts for',
      Math.abs(lost.exact - expected) <= 1, `${lost.exact} vs ${expected}`);

    const gained = await fixture({ days: 21, startKg: 80, deltaKg: 1.5, kcal: 3000 });
    check('gaining weight puts maintenance BELOW intake',
      gained.ok && gained.maintenance < 3000, `${gained.maintenance} vs 3000 eaten`);

    const flat = await fixture({ days: 21, startKg: 80, deltaKg: 0, kcal: 2400 });
    check('holding steady means intake WAS maintenance',
      flat.ok && Math.abs(flat.exact - 2400) < 5, `${flat.exact} vs 2400`);

    // Displayed to 25 kcal. A figure this noisy printed to the calorie would be
    // claiming a precision the method cannot support.
    check('the answer is rounded, not exact to the calorie',
      lost.maintenance % 25 === 0, String(lost.maintenance));
  }

  // ================= 2. when it refuses ====================================
  console.log('\n=== 2. it says nothing rather than something shaky ===');
  {
    const few = await fixture({ days: 28, startKg: 80, deltaKg: -1, kcal: 2000, everyNDays: 10 });
    check('too few weigh-ins is refused', !few.ok && few.reasons[0].code === 'weigh-ins',
      JSON.stringify(few.reasons));

    const short = await fixture({ days: 9, startKg: 80, deltaKg: -1, kcal: 2000 });
    check('too short a span is refused', !short.ok && short.reasons.some((r) => r.code === 'span'),
      JSON.stringify(short.reasons));

    // The one that would otherwise slip through: plenty of weigh-ins, plenty of
    // span, and almost no food logged. The intake average is the guess here.
    const patchy = await fixture({ days: 21, startKg: 80, deltaKg: -1, kcal: 2000, foodDays: 5 });
    check('a patchy food log is refused', !patchy.ok && patchy.reasons[0].code === 'coverage',
      JSON.stringify(patchy.reasons));

    // Weigh-ins bunched at one end span the window on paper while measuring
    // nothing at the other end of it.
    const clustered = await page.evaluate(() => {
      const iso = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return U.todayISO(d); };
      const weighIns = [20, 19, 18, 17, 16].map((n) => ({ date: iso(n), kg: 80 }));
      weighIns.push({ date: iso(0), kg: 79 });
      const intakeByDate = {};
      for (let i = 0; i <= 20; i++) intakeByDate[iso(i)] = 2000;
      return U.estimateMaintenance({ weighIns, intakeByDate });
    });
    check('weigh-ins bunched at one end are refused',
      !clustered.ok && clustered.reasons[0].code === 'clustered', JSON.stringify(clustered.reasons));

    // Every refusal has to say what would fix it, or the gate is just a wall.
    for (const r of [few, short, patchy, clustered]) {
      check(`  the refusal says what is missing (${r.reasons[0].code})`,
        typeof r.reasons[0].text === 'string' && r.reasons[0].text.length > 15, r.reasons[0].text);
    }
    check('nothing is left with an empty reason list',
      [few, short, patchy, clustered].every((r) => r.reasons.length > 0));
  }

  // ================= 3. what it suggests putting in the field ==============
  console.log('\n=== 3. the tweak it offers ===');
  {
    const s = await page.evaluate(() => ({
      max: U.KCAL_OFFSET_MAX,
      above: U.offsetFromMeasured(2600, 2400),
      below: U.offsetFromMeasured(2200, 2400),
      huge: U.offsetFromMeasured(4000, 2400),
      bad: U.offsetFromMeasured(2600, 0)
    }));
    check('a higher measured maintenance suggests a positive tweak',
      s.above.offset === 200 && !s.above.clamped, JSON.stringify(s.above));
    check('and a lower one a negative tweak',
      s.below.offset === -200, JSON.stringify(s.below));
    // Silently clamping 1600 to 800 would be the app claiming to have taken an
    // instruction it did not take.
    check('an implausible gap is clamped AND says so',
      s.huge.offset === s.max && s.huge.clamped === true && s.huge.raw === 1600,
      JSON.stringify(s.huge));
    check('a missing prediction produces nothing, not a number', s.bad === null, JSON.stringify(s.bad));
  }

  // ================= 4. it reaches the screen ==============================
  console.log('\n=== 4. the card, on the settings screen ===');
  const seed = (opt) => page.evaluate(async (o) => {
    await Storage.clearAll();
    const prefs = {
      onboarded: true, sex: 'male', dob: '1995-04-12', heightCm: 180,
      activityLevel: 'light', goalIntent: 'cut', macroGoalMode: 'auto',
      includeTrainingInFoodRoom: !!o.includeTraining
    };
    for (const [k, v] of Object.entries(prefs)) await Storage.setPref(k, v);
    const iso = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return U.todayISO(d); };
    for (let i = o.days - 1; i >= 0; i--) {
      await Storage.saveBodyweight({ date: iso(i), kg: o.startKg + (o.days - 1 - i) * (o.deltaKg / (o.days - 1)) });
      if (o.foodDays == null || i < o.foodDays) {
        await Storage.saveMeal({ id: 'm' + i, date: iso(i), name: 'Day', section: 'lunch', kcal: o.kcal, protein: 150, carbs: 200, fat: 70 });
      }
    }
  }, opt);

  const openSettings = async () => {
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(2600);
    await page.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"],.splash').forEach((n) => n.remove()));
    await page.evaluate(() => document.querySelector('[data-testid="dock-stats"]')?.click());
    await page.waitForTimeout(1300);
    await page.evaluate(() => document.querySelector('[data-testid="you-settings"]')?.click());
    await page.waitForTimeout(1900);
    return page.evaluate(() => {
      const card = document.querySelector('[data-testid="calib-card"]');
      return card ? { text: card.innerText, blocked: !!card.querySelector('[data-testid="calib-blocked"]'),
        apply: card.querySelector('[data-testid="calib-apply"]')?.textContent || null,
        warns: !!card.querySelector('[data-testid="calib-training-warning"]') } : null;
    });
  };

  {
    // Eating 2100 and losing fast: real maintenance is well above the equation.
    await seed({ days: 21, startKg: 84, deltaKg: -2.4, kcal: 2100 });
    const shown = await openSettings();
    check('the card is on the settings screen', !!shown);
    if (!shown) throw new Error('calibration card missing — section 4 proves nothing without it');
    const measured = (shown.text.match(/maintenance near (\d+)/) || [])[1];
    check('it reports a measured maintenance', !!measured, measured || shown.text);
    check('and offers to set the tweak', !!shown.apply, String(shown.apply));
    check('the offer is a positive number, because they are under-eating',
      /\+\d+/.test(shown.apply || ''), String(shown.apply));
    check('it names its own provenance rather than just asserting',
      /weigh-ins and \d+ days of food/.test(shown.text),
      (shown.text.match(/From .*/) || [''])[0]);

    // Pressing it must actually fill the field it is talking about.
    const before = await page.$eval('[data-testid="calib-apply"]', (n) => n.textContent);
    const want = Number((before.match(/(-?\d+)/) || [])[1]);
    await page.click('[data-testid="calib-apply"]');
    await page.waitForTimeout(600);
    const inField = await page.evaluate(() => {
      const i = [...document.querySelectorAll('input[type="number"]')]
        .find((x) => x.min === String(U.KCAL_OFFSET_MIN));
      return i ? Number(i.value) : null;
    });
    check('pressing it fills in the personal tweak', inField === want, `${inField} vs ${want}`);
  }

  {
    // The double count: measured maintenance already contains their training,
    // so adding the workout estimate on top counts it twice.
    await seed({ days: 21, startKg: 84, deltaKg: -2.4, kcal: 2100, includeTraining: true });
    const shown = await openSettings();
    check('with training added to food room, it warns about double counting',
      !!shown && shown.warns, shown && shown.warns ? 'warned about the double count' : (shown ? shown.text : 'no card'));
  }

  {
    await seed({ days: 21, startKg: 84, deltaKg: -2.4, kcal: 2100, foodDays: 4 });
    const shown = await openSettings();
    check('with a patchy food log it shows the blocked state, not a number',
      !!shown && shown.blocked && !/maintenance near/.test(shown.text),
      shown ? (shown.text.split('\n')[1] || shown.text) : 'no card');
    check('and the blocked state says what would unlock it',
      !!shown && /food logged on \d+/.test(shown.text),
      shown ? (shown.text.match(/This needs [^.]*/) || [''])[0] : '');
    check('with no figure, there is nothing to press',
      !!shown && shown.apply === null, String(shown && shown.apply));
  }

  // ================= 5. the activity bands mean what they are =============
  //
  // 1.2 / 1.375 / 1.55 / 1.725 / 1.9 is the standard PAL ladder and every one
  // of those numbers was calibrated against a definition that names exercise:
  // 1.55 is "moderate exercise 3-5 days a week", not "a standing job".
  //
  // The app used to describe them as the opposite. The quiz said in as many
  // words to answer "outside the gym — gym sessions are tracked separately",
  // which put a desk-job lifter on 1.2 — the figure for somebody who does not
  // train at all — and roughly six hundred calories a day under their own
  // maintenance. Worse, the settings hint called 1.375 "typical for gym-goers",
  // so the answer you got depended on which screen you set it from.
  console.log('\n=== 5. the activity ladder says it includes training ===');
  {
    const a = await page.evaluate(() => {
      const levels = Object.entries(U.ACTIVITY_LEVELS).map(([k, v]) => ({
        key: k, mult: v.mult, label: v.label, hint: v.hint
      }));
      const bmr = U.bmrMifflin({ sex: 'male', weightKg: 80, heightCm: 180, age: 30 });
      return {
        levels,
        mults: levels.map((l) => l.mult),
        deskLifter: {
          sedentary: U.tdeeFromBmr(bmr, 'sedentary'),
          moderate: U.tdeeFromBmr(bmr, 'moderate')
        }
      };
    });
    // Pinned because the tempting fix is to invent a lower, exercise-free
    // ladder to match the old labels. The published bands do not come in that
    // form, and a made-up number that matched the label would be worse than a
    // real one that needed explaining.
    check('the multipliers are the standard PAL ladder, unchanged',
      JSON.stringify(a.mults) === '[1.2,1.375,1.55,1.725,1.9]', JSON.stringify(a.mults));

    // Every band has to say where training fits, or the user is guessing again.
    const silent = a.levels.filter((l) =>
      !/train|exercis/i.test(`${l.label} ${l.hint}`));
    check('every band says what it assumes about training', silent.length === 0,
      silent.map((l) => `${l.key}: ${l.label} — ${l.hint}`).join(' | '));

    // The specific instruction that caused it. Swept over the shipped strings
    // rather than spot-checked, so the phrasing cannot come back somewhere else.
    const excludes = a.levels.filter((l) =>
      /not the gym|outside the gym|excluding|apart from (your )?training|gym sessions are tracked/i
        .test(`${l.label} ${l.hint}`));
    check('and none of them tells you to leave training out',
      excludes.length === 0, excludes.map((l) => l.hint).join(' | '));

    check('the gap the mislabelling opened is real, and is what it cost',
      a.deskLifter.moderate - a.deskLifter.sedentary > 500,
      `${a.deskLifter.sedentary} on 1.2 vs ${a.deskLifter.moderate} on 1.55`);

    // The onboarding step is where most people answer this exactly once.
    await page.evaluate(async () => { await Storage.clearAll(); });
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(2600);
    await page.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"],.splash').forEach((n) => n.remove()));
    for (let i = 0; i < 12; i++) {
      if (await page.$('[data-testid="pquiz-activity-moderate"]')) break;
      const next = await page.$('[data-testid="pquiz-next"], [data-testid="pquiz-start"]');
      if (next) { await next.click(); await page.waitForTimeout(550); continue; }
      const card = await page.$('.pquiz-list button, .pquiz-choice');
      if (card) { await card.click(); await page.waitForTimeout(550); continue; }
      break;
    }
    const step = await page.evaluate(() => {
      if (!document.querySelector('[data-testid="pquiz-activity-moderate"]')) return null;
      return document.body.innerText;
    });
    check('the onboarding step is reachable to check', !!step);
    if (step) {
      check('it asks about the week, not the day', /normal week/i.test(step),
        (step.match(/How active[^\n]*/) || [''])[0]);
      check('and tells you to count your training',
        /count your training/i.test(step), (step.match(/Count[^\n]*/) || [''])[0]);
      check('rather than to leave it out',
        !/outside the gym|tracked separately|not the gym/i.test(step));
    }
  }

  console.log('\nERRORS:', errs.length ? errs : 'none');
  console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
