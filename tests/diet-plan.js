// Eating patterns: the rules, the prose that describes them, and the screens.
//
// Two failures are worth more than the rest of this file.
//
// The first is drift between a guide and the rule it describes. The prose says
// "26% or below" and the checker uses 30, and nothing anywhere complains —
// the app quietly reports against a rule the user never read. Section 1 pulls
// every number out of the targets and demands the guide contains it.
//
// The second is tone. The whole feature is allowed to exist because it reports
// a rule back to the person who set it rather than judging them by it, and
// that distinction lives entirely in generated strings. Section 3 runs the
// checker over a spread of days and greps everything it produces for advice.
//
//   node tests/diet-plan.js   (needs `python3 -m http.server 8199` at the root)
const path = require('path');
const fs = require('fs');
const SS = process.env.FITFORGE_SHOTS || path.resolve(__dirname, '..', '.shots');
try { fs.mkdirSync(SS, { recursive: true }); } catch (_) {}

let fails = 0;
const check = (label, ok, detail = '') => {
  if (!ok) fails++;
  console.log(`   ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
};

const ROOT = path.resolve(__dirname, '..');
const load = (rel, g) => new Function('window', fs.readFileSync(path.join(ROOT, rel), 'utf8'))(g);

const G = {};
load('data/diet-plans.js', G);
load('js/diet-plan.js', G);
const DP = G.DietPlan;
const PLANS = G.DIET_PLANS;

// ================= 1. the definitions, and the prose about them =================
console.log('=== 1. every pattern is checkable, and its guide says what the rule says ===');
{
  check('patterns loaded', PLANS.length === 5, `${PLANS.length}`);
  check('every kind is one the checker implements',
    PLANS.every((p) => ['window', 'dayType', 'composition'].includes(p.kind)),
    [...new Set(PLANS.map((p) => p.kind))].join(', '));
  check('every pattern says what it is checked against',
    PLANS.every((p) => p.id && p.name && p.oneLiner && p.checks && Array.isArray(p.guide) && p.guide.length));

  const prose = (plan) => plan.guide
    .flatMap((s) => [s.h || '', ...(s.p || []), ...(s.list || [])]).join(' ');

  // The drift check. Every threshold the checker uses has to appear in the
  // prose the user read before agreeing to it.
  for (const plan of PLANS.filter((p) => p.kind === 'composition')) {
    const text = prose(plan);
    for (const t of plan.targets) {
      const both = text.includes(String(t.minPct)) && text.includes(String(t.maxPct));
      check(`${plan.id}: the guide quotes the ${t.macro} range it is checked on (${t.minPct}–${t.maxPct}%)`,
        both, both ? '' : text.slice(0, 90));
    }
    check(`${plan.id}: targets are ordered and name a real macro`,
      plan.targets.every((t) => t.minPct < t.maxPct && ['protein', 'carbs', 'fat'].includes(t.macro)));
  }
  for (const plan of PLANS.filter((p) => p.kind === 'window')) {
    check(`${plan.id}: default window is a pair of times`,
      DP.toMinutes(plan.defaults.start) != null && DP.toMinutes(plan.defaults.end) != null);
    check(`${plan.id}: every preset is a pair of times`,
      plan.presets.every((p) => DP.toMinutes(p.start) != null && DP.toMinutes(p.end) != null));
  }
  for (const plan of PLANS.filter((p) => p.kind === 'dayType')) {
    check(`${plan.id}: default days are real weekdays`,
      plan.defaults.days.every((d) => DP.WEEKDAY_KEYS.includes(d)));
    check(`${plan.id}: the default cap is inside its own range`,
      plan.defaults.cap >= plan.capRange.min && plan.defaults.cap <= plan.capRange.max);
    check(`${plan.id}: the guide quotes the default cap (${plan.defaults.cap})`,
      prose(plan).includes(String(plan.defaults.cap)));
  }

  // Every guide has to admit what the app cannot see, or the reporting reads
  // as more complete than it is.
  for (const plan of PLANS) {
    check(`${plan.id}: the guide says what the app can and cannot tell you`,
      /What this app can tell you/.test(prose(plan)) &&
      /(not logged|only knows|did not|cannot see|logged without macros|stopped logging|not in the split|not in this split)/i.test(prose(plan)));
  }

  // The guides join the Learning Centre, and a duplicate slug silently wins.
  const eating = (G.LEARN_ARTICLES || []).filter((a) => a.topic === 'eating');
  check('each guide is a Learning Centre article', eating.length === PLANS.length, `${eating.length}`);
  check('each carries the plan it belongs to', eating.every((a) => PLANS.some((p) => p.id === a.planId)));
  check('slugs are unique', new Set(eating.map((a) => a.slug)).size === eating.length);

  const note = G.DIET_PLAN_NOTE || '';
  check('the note names a professional', /dietitian|doctor/i.test(note));
  check('the note says the app does not recommend or score', /not recommendations|does not suggest/i.test(note) && /score/i.test(note));
  check('the note names who should not fast', /pregnan/i.test(note) && /disordered eating/i.test(note));
}

// ================= 2. the rules =================
console.log('\n=== 2. the checker ===');
{
  const win = PLANS.find((p) => p.kind === 'window');
  const cfg = { start: '12:00', end: '20:00' };

  check('a window has the length it looks like', DP.windowOf(cfg).length === 8 * 60);
  check('midday is inside it', DP.windowOffset(12 * 60, DP.windowOf(cfg)).inside);
  check('20:00 exactly is inside it', DP.windowOffset(20 * 60, DP.windowOf(cfg)).inside);
  const early = DP.windowOffset(8 * 60 + 12, DP.windowOf(cfg));
  check('08:12 is 3h 48m before it opens',
    !early.inside && early.dir === 'before' && early.mins === 228, JSON.stringify(early));
  const late = DP.windowOffset(21 * 60 + 40, DP.windowOf(cfg));
  check('21:40 is 1h 40m after it closed',
    !late.inside && late.dir === 'after' && late.mins === 100, JSON.stringify(late));

  // A night-shift window runs through midnight, and the naive comparison
  // reports every hour of it as outside.
  const night = DP.windowOf({ start: '20:00', end: '04:00' });
  check('a window through midnight is 8h', night.length === 8 * 60, String(night.length));
  check('02:00 is inside a 20:00–04:00 window', DP.inWindow(2 * 60, night));
  check('12:00 is not', !DP.inWindow(12 * 60, night));
  const nOff = DP.windowOffset(5 * 60, night);
  check('05:00 reports the nearer edge — 1h after it closed',
    nOff.dir === 'after' && nOff.mins === 60, JSON.stringify(nOff));

  check('a start equal to its end is the whole day',
    DP.windowOf({ start: '09:00', end: '09:00' }).length === 1440 &&
    DP.inWindow(3 * 60, DP.windowOf({ start: '09:00', end: '09:00' })));

  check('the rule reads back in one line',
    DP.summaryLine(win, cfg) === '12:00 – 20:00 · 8h window', DP.summaryLine(win, cfg));

  // A meal with no time is not counted either way, rather than counted wrong.
  check('an untimed item is untimed, not outside',
    DP.checkMeal(win, cfg, { time: '' }).state === 'untimed');
  check('a timed item outside says how far and which way',
    DP.checkMeal(win, cfg, { time: '21:40' }).label === '1h 40m late');
  check('and an inside one is marked inside',
    DP.checkMeal(win, cfg, { time: '13:00' }).state === 'inside');
  check('the window pattern is the only one that speaks about one item',
    PLANS.filter((p) => p.kind !== 'window')
      .every((p) => DP.checkMeal(p, {}, { time: '21:40' }) === null));

  const D = '2026-07-31';   // a Friday
  const day = [
    { date: D, time: '08:12', name: 'Bacon sandwich', kcal: 400 },
    { date: D, time: '13:00', name: 'Chicken wrap', kcal: 500 },
    { date: D, time: '21:40', name: 'Crisps', kcal: 170 },
    { date: D, time: '', name: 'Coffee', kcal: 40 }
  ];
  const wd = DP.checkDay(win, cfg, day, D);
  check('the day counts what fell outside', /2 of 3 timed items fell outside/.test(wd.headline), wd.headline);
  check('two items are listed with their offsets', wd.items.length === 2,
    wd.items.map((i) => `${i.time} ${i.text}`).join(' | '));
  check('the spread is reported against the window length',
    /First at 08:12, last at 21:40 — a 13h 28m spread\. Your window is 8h\./.test(wd.facts[0]), wd.facts[0]);
  check('the untimed item is accounted for, not silently dropped',
    /1 item has no time recorded/.test(wd.facts[1] || ''), wd.facts[1]);
  check('an empty day says so and claims nothing',
    DP.checkDay(win, cfg, [], D).measurable === false);
  check('a day of untimed items is not reported as a perfect one',
    DP.checkDay(win, cfg, [{ date: D, time: '', kcal: 100 }], D).measurable === false);

  // ---- reduced days ----
  const rd = PLANS.find((p) => p.kind === 'dayType');
  const rcfg = { days: ['mon', 'thu'], cap: 600 };
  check('Friday is not one of Monday and Thursday',
    /normal day/.test(DP.checkDay(rd, rcfg, [], D).headline), DP.checkDay(rd, rcfg, [], D).headline);
  const THU = '2026-07-30';
  const thu = DP.checkDay(rd, rcfg, [{ date: THU, kcal: 780, time: '19:00' }], THU);
  check('a reduced day reports the total against the cap',
    /Today is a reduced day\. 780 kcal logged\./.test(thu.headline), thu.headline);
  check('and states the difference without judging it',
    /180 kcal above the 600 kcal cap you set/.test(thu.facts[0]), thu.facts[0]);
  const under = DP.checkDay(rd, rcfg, [{ date: THU, kcal: 420 }], THU);
  check('under the cap is phrased the same way',
    /180 kcal under the 600 kcal cap you set/.test(under.facts[0]), under.facts[0]);
  const week = DP.checkDay(rd, rcfg, [
    { date: '2026-07-27', kcal: 550 },   // Mon, under
    { date: THU, kcal: 780 }             // Thu, over
  ], THU);
  check('the week both reduced days belong to is counted',
    /2 of 2 reduced days logged, 1 at or under the cap/.test(week.facts[1] || ''), week.facts[1]);
  check('a reduced day with nothing logged is not reported as under the cap',
    DP.checkDay(rd, rcfg, [], THU).measurable === false);
  check('the reduced-day rule reads back in one line',
    DP.summaryLine(rd, rcfg) === 'Mon, Thu · 600 kcal cap', DP.summaryLine(rd, rcfg));

  // ---- macro splits ----
  const lc = PLANS.find((p) => p.id === 'lower-carb');
  // 150P / 100C / 80F = 600 + 400 + 720 = 1720 kcal; carbs 23%.
  const macroDay = [{ date: D, protein: 150, carbs: 100, fat: 80, kcal: 1720, name: 'All of it' }];
  const split = DP.energySplit({ protein: 150, carbs: 100, fat: 80 });
  check('the split is a share of the energy the macros account for',
    split.carbs === 23 && split.protein === 35 && split.fat === 42, JSON.stringify(split));
  const cd = DP.checkDay(lc, {}, macroDay, D);
  check('a share inside the range is reported as inside',
    /inside the 10–26%/.test(cd.facts[0]), cd.facts[0]);
  const over = DP.checkDay(lc, {}, [{ date: D, protein: 100, carbs: 300, fat: 50 }], D);
  check('and one outside says by how many points',
    /points above the 10–26%/.test(over.facts[0]), over.facts[0]);
  check('a day logged without macros is not given a split',
    DP.checkDay(lc, {}, [{ date: D, kcal: 900 }], D).measurable === false);
  check('a partly-macroed day says how much of it is missing',
    /1 item logged without macros is not in this split/.test(
      DP.checkDay(lc, {}, [...macroDay, { date: D, kcal: 300, name: 'Pint' }], D).facts.join(' ')));
  const bal = PLANS.find((p) => p.id === 'balanced-403030');
  check('a three-target pattern reports all three',
    DP.checkDay(bal, {}, macroDay, D).items.length === 3);

  // ---- config hygiene ----
  check('a junk window falls back to the default',
    DP.normalizeConfig(win, { start: 'nonsense', end: '25:99' }).start === win.defaults.start);
  check('a cap above the range is clamped',
    DP.normalizeConfig(rd, { days: ['mon'], cap: 99999 }).cap === rd.capRange.max);
  check('junk days are dropped and the default used',
    JSON.stringify(DP.normalizeConfig(rd, { days: ['funday'] }).days) === JSON.stringify(rd.defaults.days));
  check('no plan means no reading', DP.checkDay(null, {}, [], D) === null);
}

// ================= 3. it reports, it does not advise =================
console.log('\n=== 3. nothing it generates is advice ===');
{
  const D = '2026-07-31', THU = '2026-07-30';
  const sample = [
    { date: D, time: '06:00', name: 'Porridge', kcal: 300, protein: 10, carbs: 50, fat: 5 },
    { date: D, time: '14:00', name: 'Curry', kcal: 800, protein: 40, carbs: 90, fat: 30 },
    { date: D, time: '23:30', name: 'Chocolate', kcal: 250, protein: 3, carbs: 30, fat: 14 },
    { date: THU, time: '12:00', name: 'Soup', kcal: 900, protein: 20, carbs: 60, fat: 40 }
  ];
  const said = [];
  for (const plan of PLANS) {
    for (const date of [D, THU]) {
      const r = DP.checkDay(plan, DP.normalizeConfig(plan, null), sample, date);
      if (r) said.push(r.headline, ...r.facts, ...r.items.map((i) => i.text));
      for (const m of sample) {
        const cm = DP.checkMeal(plan, DP.normalizeConfig(plan, null), m);
        if (cm) said.push(cm.label, cm.detail);
      }
    }
    said.push(DP.summaryLine(plan, DP.normalizeConfig(plan, null)));
  }
  console.log(`   (${said.length} generated strings)`);

  // Second person imperatives, verdicts, and anything that implies a mark.
  const banned = [
    [/\byou should\b/i, 'tells the user what to do'],
    [/\b(try|aim|consider|avoid|cut back|make sure|remember to)\b/i, 'gives an instruction'],
    [/\b(good|bad|great|poor|well done|nice|perfect|excellent|on track|off track|failed?|success)\b/i, 'passes a verdict'],
    [/\b(streak|score|grade|points out of|\d+\s*\/\s*\d+\s*(day|score))\b/i, 'keeps a score'],
    [/\b(healthy|unhealthy|too (much|many|late|early))\b/i, 'judges the food']
  ];
  for (const [re, why] of banned) {
    const hit = said.find((s) => re.test(s));
    check(`nothing ${why}`, !hit, hit || '');
  }
  check('every string it produces is non-empty', said.every((s) => typeof s === 'string' && s.trim()));
  // "points" is used for percentage differences, which is the one legitimate
  // use of a scoring word here — make sure that is all it is.
  const pts = said.filter((s) => /points/.test(s));
  check('"points" only ever means percentage points',
    pts.every((s) => /points (above|below)/.test(s)), pts.find((s) => !/points (above|below)/.test(s)) || '');
}

// ================= the app =================
const { chromium } = require('/opt/node22/lib/node_modules/playwright/index.js');

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const c = await b.newContext({ viewport: { width: 390, height: 900 }, serviceWorkers: 'block', hasTouch: true });
  const page = await c.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push('PAGEERR: ' + e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/Failed to load|net::/.test(m.text())) errs.push('con: ' + m.text().slice(0, 180));
  });
  const T = (s) => `[data-testid="${s}"]`;
  const gone = (s) => page.evaluate((sel) => !document.querySelector(sel), s);
  const txt = (s) => page.$eval(T(s), (e) => e.textContent.trim());

  /** Switch tabs and wait for the loader to actually leave.
      It covers the whole screen at z-index 9000 for 1.5s plus a 430ms fade and
      eats every tap underneath, so a fixed sleep sits right on the boundary and
      the next click retries against the overlay until Playwright times out. */
  async function goTab(i) {
    await page.evaluate((n) => document.querySelectorAll('.dock button')[n].click(), i);
    // Learn forks into the reading and the body map; the patterns live in the
    // reading, so take that side.
    await page.waitForTimeout(500);
    await page.evaluate(() => document.querySelector('[data-testid="learn-fork-centre"]')?.click());
    await page.waitForSelector(T('tab-loader'), { state: 'detached', timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(600);
  }
  const NUTRITION = 1, LEARN = 4;

  await page.goto('http://localhost:8199/index.html', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.Storage && window.U && window.DietPlan);
  await page.evaluate(async () => {
    await Storage.clearAll();
    for (const [k, v] of Object.entries({
      onboarded: true, sex: 'male', dob: '1995-04-12', heightCm: 180,
      activityLevel: 'moderate', kcalGoal: 2200
    })) await Storage.setPref(k, v);
    await Storage.saveBodyweight({ date: U.todayISO(), kg: 82 });
    // A day that straddles a 12:00–20:00 window in both directions.
    const d = U.todayISO();
    const mk = (name, time, section, kcal) => ({
      id: U.uid(), name, time, section, date: d, kcal,
      protein: 20, carbs: 40, fat: 10, savedAt: Date.now()
    });
    await Storage.saveMeal(mk('Bacon sandwich', '08:12', 'breakfast', 400));
    await Storage.saveMeal(mk('Chicken wrap', '13:00', 'lunch', 500));
    await Storage.saveMeal(mk('Crisps', '21:40', 'snack', 170));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(3800);

  // ---- 4. the guides are in the Learning Centre ----
  console.log('\n=== 4. the guides sit with the rest of the reading ===');
  await goTab(LEARN);
  check('there is a Patterns topic', !!(await page.$(T('learn-tab-eating'))));
  await page.click(T('learn-tab-eating'));
  await page.waitForTimeout(500);
  const cards = (await page.$$(T('learn-card'))).length;
  check('every pattern is listed', cards === 5, String(cards));
  const note = await txt('learn-note');
  check('and the topic carries its own stronger note', /dietitian|doctor/i.test(note) && /pregnan/i.test(note));
  check('the four topic tabs fit on one row without wrapping',
    await page.evaluate(() => {
      const tabs = [...document.querySelectorAll('.learn-tab')];
      return tabs.length === 4 && new Set(tabs.map((t) => Math.round(t.getBoundingClientRect().top))).size === 1;
    }));
  await page.screenshot({ path: `${SS}/plans_list.png` });

  // ---- 5. adopting one ----
  console.log('\n=== 5. choosing a guideline ===');
  await page.evaluate(() => {
    [...document.querySelectorAll('[data-testid="learn-card"]')]
      .find((x) => /Time-restricted/i.test(x.textContent)).click();
  });
  await page.waitForTimeout(700);
  check('the guide opens', !!(await page.$(T('learn-overlay'))));
  check('with the pattern note on it', !!(await page.$(T('article-note'))));
  check('and the control to adopt it', !!(await page.$(T('plan-use'))));
  check('nothing is a guideline yet', await gone(T('plan-foot-rule')));
  await page.screenshot({ path: `${SS}/plans_guide.png` });

  // Reading comes first: adopting a window opens the editor, it does not
  // silently save a window the user never saw.
  await page.click(T('plan-use'));
  await page.waitForTimeout(500);
  check('a window pattern asks for its window first', !!(await page.$(T('plan-editor-summary'))));
  check('the summary tracks the presets', (await txt('plan-editor-summary')).includes('window'));
  await page.click(T('plan-preset-14-10'));
  await page.waitForTimeout(300);
  check('picking 14:10 sets a 10h window',
    (await txt('plan-editor-summary')) === '10:00 – 20:00 · 10h window', await txt('plan-editor-summary'));
  await page.click(T('plan-preset-16-8'));
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${SS}/plans_editor.png` });
  await page.click(T('plan-editor-save'));
  await page.waitForTimeout(700);

  const stored = await page.evaluate(async () => ({
    id: await Storage.getPref('dietPlanId', null),
    cfg: await Storage.getPref('dietPlanConfig', null)
  }));
  check('the choice is persisted', stored.id === 'time-restricted', JSON.stringify(stored));
  check('with the window that was on screen',
    stored.cfg && stored.cfg.start === '12:00' && stored.cfg.end === '20:00', JSON.stringify(stored.cfg));
  check('the guide now shows the rule', !!(await page.$(T('plan-foot-rule'))));
  check('and offers a way out', !!(await page.$(T('plan-stop'))));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  check('the list marks which one is yours', !!(await page.$(T('learn-card-flag'))));

  // ---- 6. logged food, matched ----
  console.log('\n=== 6. the day, reported against the rule ===');
  await goTab(NUTRITION);
  check('the Nutrition tab shows the guideline', !!(await page.$(T('plan-card'))));
  check('named', (await txt('plan-card-name')) === 'Time-restricted eating');
  check('with the rule under it', (await txt('plan-card-rule')) === '12:00 – 20:00 · 8h window',
    await txt('plan-card-rule'));
  const headline = await txt('plan-card-headline');
  check('and the count for today', /2 of 3 timed items fell outside your window/.test(headline), headline);
  const items = await page.$$eval(`${T('plan-card-items')} .plan-item`,
    (ns) => ns.map((n) => n.textContent.replace(/\s+/g, ' ').trim()));
  check('both offenders are named with their offsets', items.length === 2, items.join(' | '));
  check('the early one is described as early',
    /08:12.*Bacon sandwich.*3h 48m before it opens/.test(items[0] || ''), items[0]);
  check('the late one as late',
    /21:40.*Crisps.*1h 40m after it closed/.test(items[1] || ''), items[1]);
  check('the prompt to pick one is gone now that one is picked', await gone(T('plan-prompt')));
  await page.screenshot({ path: `${SS}/plans_card.png` });

  // The per-meal mark, on the meal panel rather than the overview.
  const chips = await page.evaluate(() => {
    const idx = [...document.querySelectorAll('.npanel')].findIndex((p) => p.dataset.key === 'snack');
    const pager = document.querySelector('.npager');
    pager.scrollTop = pager.children[idx].offsetTop;
    return new Promise((r) => setTimeout(() => r(
      [...document.querySelectorAll('[data-testid="meal-plan-chip"]')].map((n) => n.textContent)), 400));
  });
  check('a meal outside the window is marked on its row', chips.includes('1h 40m late'), chips.join(', '));
  const insideMarked = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('.nfood')];
    const wrap = rows.find((r) => /Chicken wrap/.test(r.textContent));
    return wrap ? !!wrap.querySelector('[data-testid="meal-plan-chip"]') : null;
  });
  check('and a meal inside it is not marked at all', insideMarked === false, String(insideMarked));

  // ---- 7. logging against the rule ----
  //
  // Quick Add stamps the meal with the real clock, so the window is placed
  // relative to now — two hours ahead of it, one hour long. Whatever time the
  // suite runs at, the meal it logs lands two hours before that window opens.
  console.log('\n=== 7. logging something outside it says so at the time ===');
  await page.evaluate(async () => {
    const pad = (n) => String(n).padStart(2, '0');
    const at = (mins) => {
      const d = new Date(Date.now() + mins * 60000);
      return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    await Storage.setPref('dietPlanId', 'time-restricted');
    await Storage.setPref('dietPlanConfig', { start: at(120), end: at(180) });
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(3800);
  await goTab(NUTRITION);
  await page.click(T('donut-add'));
  await page.waitForTimeout(500);
  await page.click(T('meal-fork-quick'));
  await page.waitForTimeout(600);
  await page.fill(T('qa-search'), 'banana');
  await page.waitForTimeout(700);
  await page.click(T('qa-result-banana'));
  await page.waitForTimeout(400);
  await page.click(T('qa-portion-regular'));
  await page.waitForTimeout(700);
  const toastText = await page.evaluate(() => {
    const t = document.getElementById('toast');
    return t && t.style.opacity === '1' ? t.textContent : null;
  });
  // Roughly two hours, not exactly: the window is pinned to the clock and a
  // minute can tick over between setting it and logging against it.
  check('the log confirmation reports the rule it fell outside',
    !!toastText && /(2h|1h 5\dm) before your window opens at \d{2}:\d{2}/.test(toastText),
    toastText || '(no toast)');
  check('and still says what was logged', !!toastText && /Logged Banana/.test(toastText), toastText || '');
  await page.screenshot({ path: `${SS}/plans_toast.png` });

  // ---- 8. a pattern with no dial adopts without a modal ----
  console.log('\n=== 8. a macro-split pattern has nothing to configure ===');
  await goTab(LEARN);
  await page.click(T('learn-tab-eating'));
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    [...document.querySelectorAll('[data-testid="learn-card"]')]
      .find((x) => /Lower-carbohydrate/i.test(x.textContent)).click();
  });
  await page.waitForTimeout(600);
  await page.click(T('plan-use'));
  await page.waitForTimeout(600);
  check('it is adopted straight away', await gone(T('plan-editor-summary')));
  check('no rule dial is offered for it', await gone(T('plan-change')));
  check('the stored plan changed',
    (await page.evaluate(() => Storage.getPref('dietPlanId', null))) === 'lower-carb');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  await goTab(NUTRITION);
  const cHead = await txt('plan-card-headline');
  check('and Nutrition reports the split instead of a window',
    /Carbs are \d+% of today's logged energy/.test(cHead), cHead);
  await page.screenshot({ path: `${SS}/plans_card_split.png` });

  // ---- 9. switching, through the picker, to the pattern with the most dials ----
  //
  // The reduced-day editor is the one with real configuration in it: a set of
  // weekdays and a cap, either of which can be left in a state the checker
  // cannot use. Driving it through the picker also covers the route from
  // Nutrition into the guides.
  console.log('\n=== 9. the reduced-day rule is set through the UI ===');
  await page.click(T('plan-card-edit'));
  await page.waitForTimeout(500);
  check('the picker lists every pattern', (await page.$$(T('plan-pick'))).length === 5);
  await page.evaluate(() => {
    [...document.querySelectorAll('[data-testid="plan-pick"]')]
      .find((x) => x.dataset.plan === 'reduced-days').click();
  });
  await page.waitForTimeout(700);
  check('the picker opens that pattern\'s guide, not the rule editor',
    !!(await page.$(T('learn-overlay'))) && (await gone(T('plan-editor-summary'))));
  await page.click(T('plan-use'));
  await page.waitForTimeout(600);
  check('the reduced-day editor offers the days', !!(await page.$(T('plan-days'))));
  check('and starts on the 5:2 default',
    (await txt('plan-editor-summary')) === 'Mon, Thu · 600 kcal cap', await txt('plan-editor-summary'));
  // Deselecting every day leaves a rule the checker cannot apply.
  await page.click(T('plan-day-mon'));
  await page.click(T('plan-day-thu'));
  await page.waitForTimeout(300);
  check('with no day picked it says so rather than showing an empty rule',
    (await txt('plan-editor-summary')) === 'Pick at least one day.', await txt('plan-editor-summary'));
  await page.click(T('plan-editor-save'));
  await page.waitForTimeout(600);
  check('and saving is refused', !!(await page.$(T('plan-editor-summary'))));
  check('nothing was written', (await page.evaluate(() => Storage.getPref('dietPlanId', null))) === 'lower-carb');
  // Now a real rule: Tuesday and Saturday, 500 kcal.
  await page.click(T('plan-day-tue'));
  await page.click(T('plan-day-sat'));
  await page.fill(T('plan-cap'), '500');
  await page.waitForTimeout(300);
  check('the summary tracks the days and the cap',
    (await txt('plan-editor-summary')) === 'Tue, Sat · 500 kcal cap', await txt('plan-editor-summary'));
  await page.screenshot({ path: `${SS}/plans_days_editor.png` });
  await page.click(T('plan-editor-save'));
  await page.waitForTimeout(700);
  const rdCfg = await page.evaluate(() => Storage.getPref('dietPlanConfig', null));
  check('the days and cap are persisted in weekday order',
    JSON.stringify(rdCfg) === JSON.stringify({ days: ['tue', 'sat'], cap: 500 }), JSON.stringify(rdCfg));
  check('the guide shows the new rule',
    (await txt('plan-foot-rule')) === 'Tue, Sat · 500 kcal cap', await txt('plan-foot-rule'));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  await goTab(NUTRITION);
  const rdHead = await txt('plan-card-headline');
  check('and Nutrition reports against it',
    /(reduced day|normal day on this pattern)/.test(rdHead), rdHead);

  // ---- 10. and it can be turned off ----
  console.log('\n=== 10. stopping ===');
  await page.click(T('plan-card-edit'));
  await page.waitForTimeout(500);
  await page.click(T('plan-picker-clear'));
  await page.waitForTimeout(900);
  check('no guideline is set', (await page.evaluate(() => Storage.getPref('dietPlanId', null))) === null);
  check('the card is gone', await gone(T('plan-card')));
  check('and the quiet prompt is back in its place', !!(await page.$(T('plan-prompt'))));
  await page.click(T('plan-prompt-dismiss'));
  await page.waitForTimeout(800);
  check('dismissing the prompt hides it for good', await gone(T('plan-prompt')));
  check('and that is remembered',
    (await page.evaluate(() => Storage.getPref('dietPlanPromptSeen', false))) === true);

  console.log('\nERRORS:', errs.length ? errs : 'none');
  console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
