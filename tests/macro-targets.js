// Protein follows the goal.
//
// Protein is the one macro whose requirement genuinely moves with what you are
// trying to do, and it moves the opposite way to intuition: you need MORE of it
// eating less, not eating more. In a deficit the body will break down muscle
// for energy and a high intake is most of what stops it; in a surplus nothing
// is under threat and the requirement falls back to what it takes to build.
//
// The app already knew this. The 2.2 g/kg option was labelled "Aggressive cut /
// recomp" and the goal was two fields further up the same settings screen —
// and then it made the user join those up by hand, silently holding everyone
// at 1.8 whatever they had said they were doing.
//
// The trap here is the opposite mistake: a goal that quietly overwrites a
// figure the user chose on purpose. Section 3 is the one that matters, because
// it is the one a "simplification" would break.
//
//   node tests/macro-targets.js   (needs `python3 -m http.server 8199`)
const { chromium } = require('/opt/node22/lib/node_modules/playwright/index.js');

let fails = 0;
const check = (label, ok, detail = '') => {
  if (!ok) fails++;
  console.log(`   ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
};

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const c = await b.newContext({ viewport: { width: 390, height: 900 }, serviceWorkers: 'block', hasTouch: true });
  const page = await c.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push('PAGEERR: ' + e.message.slice(0, 170)));
  await page.route(/fonts\.googleapis\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));

  await page.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
  await page.waitForFunction(() => window.Storage && window.U);

  const BW = 80;
  // A complete profile, so the budget resolves and the macro tiles carry real
  // targets rather than starter estimates.
  const seed = (prefs) => page.evaluate(async ({ p, bw }) => {
    await Storage.clearAll();
    const base = {
      onboarded: true, sex: 'male', dob: '1995-04-12', heightCm: 180,
      activityLevel: 'light', macroGoalMode: 'auto'
    };
    for (const [k, v] of Object.entries({ ...base, ...p })) await Storage.setPref(k, v);
    await Storage.saveBodyweight({ date: U.todayISO(), kg: bw });
  }, { p: prefs, bw: BW });

  // Read the protein goal off the screen, not out of a function: what the user
  // is told is the thing under test.
  const proteinGoalShown = async () => {
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(2600);
    await page.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"],.splash').forEach((n) => n.remove()));
    return page.evaluate(() => {
      const tile = document.querySelector('[data-testid="macro-tile-protein"]');
      if (!tile) return null;
      // Home renders either the tile row ("of 144g") or the stacked legend
      // ("/ 144"); both carry the same testid, so match either shape.
      const m = tile.textContent.match(/(?:of|\/)\s*([\d.]+)\s*g?/);
      return m ? Number(m[1]) : null;
    });
  };

  // ================= 1. every goal states a protein figure ==================
  console.log('=== 1. no goal is left without one ===');
  {
    const t = await page.evaluate(() => {
      const goals = Object.keys(U.GOAL_INTENTS);
      return {
        goals,
        missing: goals.filter((g) => !(g in U.PROTEIN_PER_KG_BY_GOAL)),
        // A figure for a goal that does not exist is a rule nothing can reach.
        orphans: Object.keys(U.PROTEIN_PER_KG_BY_GOAL).filter((g) => !goals.includes(g)),
        byGoal: Object.fromEntries(goals.map((g) => [g, U.proteinPerKgForGoal(g)])),
        unknown: U.proteinPerKgForGoal('nonsense')
      };
    });
    check('every goal the app offers has a protein figure', t.missing.length === 0, t.missing.join(', '));
    check('and no figure names a goal that does not exist', t.orphans.length === 0, t.orphans.join(', '));
    check('an unrecognised goal falls back to the plain default', t.unknown === 1.8, String(t.unknown));
    console.log('      ' + Object.entries(t.byGoal).map(([g, v]) => `${g} ${v}`).join('  ·  '));
  }

  // ================= 2. it moves the right way ==============================
  console.log('\n=== 2. more protein when eating less, not more ===');
  {
    const v = await page.evaluate(() => ({
      cutHard: U.proteinPerKgForGoal('cut_hard'),
      cut: U.proteinPerKgForGoal('cut'),
      maintain: U.proteinPerKgForGoal('maintain'),
      bulk: U.proteinPerKgForGoal('bulk'),
      all: Object.values(U.PROTEIN_PER_KG_BY_GOAL)
    }));
    check('cutting asks for more than maintaining', v.cut > v.maintain, `${v.cut} vs ${v.maintain}`);
    check('a steeper cut asks for more still', v.cutHard >= v.cut, `${v.cutHard} vs ${v.cut}`);
    // The counter-intuitive one, and the reason this is worth a rule: a surplus
    // is the situation where protein matters least, not most.
    check('a surplus asks for less, not more', v.bulk < v.maintain, `${v.bulk} vs ${v.maintain}`);
    // Anything outside this is no longer a defensible reading of the evidence:
    // roughly 1.6 g/kg is where the benefit plateaus for building, and past
    // ~2.4 there is nothing left to buy at any goal.
    check('every figure is inside the evidenced range',
      v.all.every((n) => n >= 1.4 && n <= 2.4), v.all.join(', '));
  }

  // ================= 3. a chosen number outranks the goal ===================
  console.log('\n=== 3. the goal never overwrites a figure you picked ===');
  {
    const r = await page.evaluate(() => ({
      absent: U.resolveProteinPerKg(null, 'cut_hard'),
      empty: U.resolveProteinPerKg('', 'cut_hard'),
      zero: U.resolveProteinPerKg(0, 'cut_hard'),
      chosen: U.resolveProteinPerKg(1.6, 'cut_hard')
    }));
    check('no stored figure means the goal decides', r.absent.perKg === 2.2 && r.absent.fromGoal === true,
      JSON.stringify(r.absent));
    check('and so do the empty shapes a form can produce',
      r.empty.perKg === 2.2 && r.zero.perKg === 2.2, JSON.stringify([r.empty, r.zero]));
    check('a figure you chose is kept, even against a goal that wants more',
      r.chosen.perKg === 1.6 && r.chosen.fromGoal === false, JSON.stringify(r.chosen));
  }

  // ================= 4. it reaches the screen ===============================
  console.log('\n=== 4. the number on the screen actually moves ===');
  {
    await seed({ goalIntent: 'maintain' });
    const hold = await proteinGoalShown();
    check('holding weight targets 1.8 g/kg', hold === Math.round(BW * 1.8), `${hold}g at ${BW}kg`);

    await seed({ goalIntent: 'cut_hard' });
    const cut = await proteinGoalShown();
    check('the steepest cut raises it to 2.2 g/kg', cut === Math.round(BW * 2.2), `${cut}g at ${BW}kg`);
    check('and that is a real change, not the same number twice', cut > hold, `${cut} vs ${hold}`);

    await seed({ goalIntent: 'bulk' });
    const bulk = await proteinGoalShown();
    check('a surplus lowers it to 1.6 g/kg', bulk === Math.round(BW * 1.6), `${bulk}g at ${BW}kg`);

    // The guard: someone who went to the trouble of choosing 1.6 must not be
    // moved to 2.2 by changing what they are aiming for.
    await seed({ goalIntent: 'cut_hard', proteinPerKg: 1.6 });
    const pinned = await proteinGoalShown();
    check('a chosen figure survives the steepest cut', pinned === Math.round(BW * 1.6),
      `${pinned}g at ${BW}kg`);
  }

  // ================= 5. the way back exists =================================
  console.log('\n=== 5. "follow my goal" is reachable and means null ===');
  {
    // A pinned figure with no way to unpin it is a one-way door: the goal would
    // be permanently disconnected for anyone who ever touched the select.
    await seed({ goalIntent: 'cut', proteinPerKg: 1.6 });
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(2600);
    await page.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"],.splash').forEach((n) => n.remove()));
    // The "You" tab is dock-stats — the tab was renamed, the id was not.
    await page.evaluate(() => document.querySelector('[data-testid="dock-stats"]')?.click());
    await page.waitForTimeout(1400);
    await page.evaluate(() => document.querySelector('[data-testid="you-settings"]')?.click());
    await page.waitForTimeout(1400);
    const opts = await page.evaluate(() => {
      const s = [...document.querySelectorAll('select')]
        .find((x) => [...x.options].some((o) => /g\/kg/.test(o.textContent)));
      if (!s) return null;
      return {
        values: [...s.options].map((o) => o.value),
        labels: [...s.options].map((o) => o.textContent),
        selected: s.value
      };
    });
    check('the settings screen opened and the protein select is on it', !!opts);
    if (!opts) throw new Error('could not reach the protein select — section 5 proves nothing without it');
    check('it offers a way back to the goal', opts.values.includes(''), opts.labels.join(' | '));
    check('and that way is the first option, because it is the right answer',
      opts.values[0] === '', opts.values.join(','));
    check('a pinned figure shows as pinned, not as "follow my goal"',
      opts.selected === '1.6', opts.selected);
    // Whatever the screen does, storing null must read back as "follow the goal".
    const roundTrip = await page.evaluate(async () => {
      await Storage.setPref('proteinPerKg', null);
      const back = await Storage.getPref('proteinPerKg', 'MISSING');
      return { back, resolved: U.resolveProteinPerKg(back, 'cut_hard') };
    });
    check('a stored null survives the round trip as null', roundTrip.back === null, String(roundTrip.back));
    check('and puts the goal back in charge',
      roundTrip.resolved.perKg === 2.2 && roundTrip.resolved.fromGoal === true,
      JSON.stringify(roundTrip.resolved));
  }

  // ================= 6. the fat floor ======================================
  console.log('\n=== 6. fat has a floor, and it scales with the body ===');
  {
    // The floor was a flat 20g, dropping to a flat 15g when protein and fat
    // would not both fit — and the branch under that could take fat to ZERO.
    // At 120kg on 2.2 g/kg with a 1000 kcal budget the app returned 250g
    // protein, no fat and no carbs, and offered it as the day's target.
    const t = await page.evaluate(() => {
      const at = (bw, ppk, budget) => {
        const g = U.computeMacroGoals({ weightKg: bw, kcalBudget: budget, proteinPerKg: ppk, fatPercent: 30 });
        return { ...g, perKg: g.fat / bw, kcal: g.protein * 4 + g.carbs * 4 + g.fat * 9 };
      };
      return {
        minPerKg: U.MIN_FAT_PER_KG,
        tight: at(120, 2.2, 1000),   // the case that used to return zero fat
        mid: at(100, 2.2, 1300),
        roomy: at(80, 1.8, 2400),
        low: at(80, 1.8, 1200),
        impossible: at(80, 1.8, 400)
      };
    });
    check('the floor is stated per kg, not as a flat gram figure',
      t.minPerKg >= 0.4 && t.minPerKg <= 1.0, String(t.minPerKg));
    // The specific regression.
    check('the case that used to return zero fat no longer does',
      t.tight.fat > 0, `P${t.tight.protein} C${t.tight.carbs} F${t.tight.fat}`);
    for (const [name, g] of [['tight', t.tight], ['mid', t.mid], ['roomy', t.roomy], ['low', t.low]]) {
      check(`  ${name}: fat is at or above the floor`,
        g.perKg >= t.minPerKg - 0.005, `${g.fat}g = ${g.perKg.toFixed(2)} g/kg at ${g.weightKg}kg`);
      check(`  ${name}: and the macros still fit the budget`,
        g.kcal <= g.kcalBudget, `${g.kcal} vs ${g.kcalBudget}`);
    }
    // Fat holds; protein is the one with headroom, so protein is what yields.
    check('when they do not both fit, protein gives way rather than fat',
      t.tight.squeezed && t.tight.fat === t.tight.fatFloorG && t.tight.protein < Math.round(120 * 2.2),
      `F${t.tight.fat} (floor ${t.tight.fatFloorG}), P${t.tight.protein} of ${Math.round(120 * 2.2)}`);
    check('a roomy budget is not squeezed at all', !t.roomy.squeezed && t.roomy.carbs > 0,
      `P${t.roomy.protein} C${t.roomy.carbs} F${t.roomy.fat}`);

    // A budget too small to hold essential fat is reported, not resolved.
    // Shaving the floor to make the sum balance would hide the real problem.
    check('a budget below essential fat says so rather than shaving the floor',
      t.impossible.belowFatFloor === true && t.impossible.fat === t.impossible.fatFloorG,
      JSON.stringify({ fat: t.impossible.fat, floor: t.impossible.fatFloorG, flag: t.impossible.belowFatFloor }));
    check('and it does not pretend the sum fits',
      t.impossible.kcal > t.impossible.kcalBudget, `${t.impossible.kcal} vs ${t.impossible.kcalBudget}`);

    // Sweep, because the floor is easy to satisfy in one case and miss in
    // another: heavier bodies and higher protein are where it bites.
    const sweep = await page.evaluate(() => {
      const bad = [];
      for (const bw of [45, 60, 80, 100, 120, 150]) {
        for (const ppk of [1.6, 1.8, 2.0, 2.2]) {
          for (const budget of [1200, 1500, 1800, 2200, 2800, 3500]) {
            const g = U.computeMacroGoals({ weightKg: bw, kcalBudget: budget, proteinPerKg: ppk, fatPercent: 30 });
            const kcal = g.protein * 4 + g.carbs * 4 + g.fat * 9;
            if (g.fat / bw < U.MIN_FAT_PER_KG - 0.005) bad.push(`${bw}kg ${ppk} ${budget}: fat ${g.fat}`);
            else if (!g.belowFatFloor && kcal > budget) bad.push(`${bw}kg ${ppk} ${budget}: ${kcal}>${budget}`);
            else if (g.protein < 0 || g.carbs < 0 || g.fat < 0) bad.push(`${bw}kg ${ppk} ${budget}: negative`);
          }
        }
      }
      return bad;
    });
    check('144 bodyweight/protein/budget combinations all respect the floor and the budget',
      sweep.length === 0, sweep.slice(0, 4).join(' | '));
  }

  console.log('\nERRORS:', errs.length ? errs : 'none');
  console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
