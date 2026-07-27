// Onboarding, end to end.
//
// Replaces a suite that had been broken for months without anyone noticing:
// it drove the quiz through `pquiz-range` and `pquiz-bignum`, a slider and a
// big-number readout that were replaced by wheels. Nothing else in the suites
// reaches `pquiz-finish`, so while it sat broken the one flow every user walks
// exactly once — and cannot retry — had no coverage at all.
//
// The steps themselves did not change: name, sex, age (as DOB), height,
// weight, activity, goal, reveal.
//
//   node tests/quiz.js        (needs `python3 -m http.server 8199` at the repo root)
const { chromium } = require('/opt/node22/lib/node_modules/playwright/index.js');
const path = require('path');
const SS = process.env.FITFORGE_SHOTS || path.resolve(__dirname, '..', '.shots');
const fs = require('fs');
try { fs.mkdirSync(SS, { recursive: true }); } catch (_) {}

const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0;
const check = (label, ok, detail = '') => {
  if (!ok) fails++;
  console.log(`   ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
};

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const c = await b.newContext({ viewport: { width: 390, height: 900 }, serviceWorkers: 'block', deviceScaleFactor: 2, hasTouch: true });
  const page = await c.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load|net::/.test(m.text())) errs.push('con: ' + m.text().slice(0, 200)); });

  const T = s => `[data-testid="${s}"]`;
  const at = (s) => page.evaluate(sel => !!document.querySelector(sel), T(s));
  // .pquiz-title is a class, not a testid — used for readable failure output.
  const stepTitle = () => page.evaluate(() =>
    (document.querySelector('.pquiz-panel .pquiz-title') || {}).textContent || null);

  /** Real taps, so a control buried under another layer fails here rather than
      passing the way `.click()` would. */
  async function tap(id) {
    const sel = T(id);
    await page.waitForSelector(sel, { timeout: 5000 });
    const reach = await page.evaluate((s) => {
      const el = document.querySelector(s);
      el.scrollIntoView({ block: 'center' });
      const r = el.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !!hit && (hit === el || el.contains(hit) || hit.contains(el));
    }, sel);
    if (!reach) throw new Error(`${id} is not reachable — a finger could not tap it`);
    await page.tap(sel);
    await sleep(650);
  }

  /** Wheels are scroll-snap lists; tapping an item centres it and fires onChange. */
  async function spin(id, label) {
    const picked = await page.evaluate(({ sel, want }) => {
      const w = document.querySelector(sel);
      if (!w) return { missing: true };
      const items = [...w.querySelectorAll('.wheel-item')];
      const hit = items.find(x => x.textContent.trim() === String(want));
      if (!hit) return { notFound: true, sample: items.slice(0, 4).map(x => x.textContent.trim()) };
      hit.click();
      return { ok: true };
    }, { sel: T(id), want: label });
    if (!picked.ok) throw new Error(`${id}: could not select "${label}" ${JSON.stringify(picked)}`);
    await sleep(700);
    return page.evaluate(sel => {
      const a = document.querySelector(sel + ' .wheel-item.is-active .wheel-item-label');
      return a ? a.textContent.trim() : null;
    }, T(id));
  }

  await page.goto('http://localhost:8199/index.html', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.Storage && window.U);
  await page.evaluate(async () => { await Storage.clearAll(); });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(4200); // splash, then the quiz lets itself in

  // ================= 1. it opens itself on a cold install =================
  console.log('=== 1. first run opens the quiz ===');
  check('the quiz opens unprompted', await at('profile-quiz'));
  check('it starts on the name step', await at('pquiz-name'));
  console.log('   step title ->', JSON.stringify(await stepTitle()));
  await page.screenshot({ path: `${SS}/quiz_1_name.png` });

  // ================= 2. walk every step =================
  console.log('\n=== 2. walking the eight steps ===');
  await page.fill(T('pquiz-name'), 'Sam');
  await tap('pquiz-next');
  check('name advances to sex', await at('pquiz-sex-male'), await stepTitle());

  // Choice cards commit and advance in one tap — no separate Next.
  await tap('pquiz-sex-male');
  check('sex advances straight to date of birth', await at('quiz-wheel-dob-day'), await stepTitle());

  const day = await spin('quiz-wheel-dob-day', '12');
  const month = await spin('quiz-wheel-dob-month', 'Apr');
  const year = await spin('quiz-wheel-dob-year', '1995');
  const caption = await page.evaluate(() =>
    (document.querySelector('[data-testid="quiz-dob-caption"]') || {}).textContent);
  console.log(`   dob wheels -> ${day} ${month} ${year} | caption ${JSON.stringify(caption)}`);
  check('all three DOB wheels hold what was picked',
    day === '12' && month === 'Apr' && year === '1995');
  check('the caption derives an age from the date', /\d{2}/.test(caption || ''), caption);
  await page.screenshot({ path: `${SS}/quiz_2_dob.png` });

  await tap('pquiz-next');
  check('DOB advances to height', await at('quiz-wheel-height'), await stepTitle());
  const h = await spin('quiz-wheel-height', '180');
  check('height wheel holds 180', h === '180', h);

  await tap('pquiz-next');
  check('height advances to weight', await at('quiz-wheel-weight'), await stepTitle());
  const w = await spin('quiz-wheel-weight', '82');
  check('weight wheel holds 82', w === '82', w);

  await tap('pquiz-next');
  check('weight advances to activity', await at('pquiz-activity-moderate'), await stepTitle());
  await tap('pquiz-activity-moderate');
  check('activity advances to goal', await at('pquiz-goal-cut'), await stepTitle());
  await tap('pquiz-goal-cut');
  await page.screenshot({ path: `${SS}/quiz_3_goal.png` });

  // ================= 3. the payoff =================
  console.log('\n=== 3. the reveal ===');
  check('the goal step lands on the reveal', await at('pquiz-reveal-kcal'), await stepTitle());
  const reveal = await page.evaluate(() => ({
    kcal: (document.querySelector('[data-testid="pquiz-reveal-kcal"]') || {}).textContent,
    protein: (document.querySelector('[data-testid="pquiz-protein"]') || {}).textContent,
    finish: (document.querySelector('[data-testid="pquiz-finish"]') || {}).textContent
  }));
  console.log('   reveal ->', JSON.stringify(reveal));
  const kcalNum = parseInt(String(reveal.kcal).replace(/[^0-9]/g, ''), 10);
  // A 30-year-old 180cm 82kg male, moderately active, cutting: BMR ~1830,
  // TDEE ~2830, minus a cut deficit. Anything outside this band means the
  // wheels did not reach the calculation.
  check('the number is a plausible cutting target for what was entered',
    kcalNum >= 1600 && kcalNum <= 2800, String(kcalNum));
  check('a protein target came with it', /\d+\s*g/.test(reveal.protein || ''), reveal.protein);
  await page.screenshot({ path: `${SS}/quiz_4_reveal.png` });

  // ================= 4. back preserves what you typed =================
  console.log('\n=== 4. going back does not lose answers ===');
  await tap('pquiz-back');
  check('back lands on the goal step', await at('pquiz-goal-cut'), await stepTitle());
  const goalKept = await page.evaluate(() => {
    const c = document.querySelector('[data-testid="pquiz-goal-cut"]');
    return !!(c && (c.classList.contains('is-selected') || c.querySelector('.pquiz-choice-tick')));
  });
  check('the goal you chose is still selected', goalKept);
  await tap('pquiz-goal-cut');
  check('choosing again returns to the reveal', await at('pquiz-reveal-kcal'));

  // ================= 5. finishing writes the profile =================
  console.log('\n=== 5. finishing ===');
  await tap('pquiz-finish');
  await sleep(1800);
  const saved = await page.evaluate(async () => {
    const keys = ['onboarded', 'profileName', 'sex', 'dob', 'heightCm', 'activityLevel', 'goalIntent', 'kcalGoal'];
    const out = {};
    for (const k of keys) out[k] = await Storage.getPref(k);
    const bw = await Storage.getBodyweights();
    out.weightKg = bw.length ? bw[bw.length - 1].kg : null;
    return out;
  });
  console.log('   stored ->', JSON.stringify(saved));
  check('the quiz closed itself', !(await at('profile-quiz')));
  check('it recorded that onboarding is done', saved.onboarded === true);
  check('the name survived', saved.profileName === 'Sam', saved.profileName);
  check('sex, height and activity survived',
    saved.sex === 'male' && Number(saved.heightCm) === 180 && saved.activityLevel === 'moderate');
  check('the DOB survived as a date, not an age', /^1995-04-12$/.test(String(saved.dob)), String(saved.dob));
  check('the weight was written as a bodyweight entry', Number(saved.weightKg) === 82, String(saved.weightKg));
  check('the goal survived', saved.goalIntent === 'cut', saved.goalIntent);
  await page.screenshot({ path: `${SS}/quiz_5_done.png` });

  // ================= 6. it does not come back =================
  console.log('\n=== 6. a returning user is left alone ===');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(4200);
  check('the quiz does not reopen on the next launch', !(await at('profile-quiz')));

  // ================= 7. skipping is still allowed =================
  console.log('\n=== 7. skipping out of a cold start ===');
  await page.evaluate(async () => { await Storage.clearAll(); });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(4200);
  check('the quiz is back for a fresh install', await at('profile-quiz'));
  await tap('pquiz-close');
  await sleep(1200);
  const skipped = await page.evaluate(async () => ({
    onboarded: await Storage.getPref('onboarded'),
    open: !!document.querySelector('[data-testid="profile-quiz"]')
  }));
  check('closing dismisses it', !skipped.open);
  check('closing still counts as onboarded, so it stops nagging', skipped.onboarded === true);

  console.log('\nERRORS:', errs.length ? errs : 'none');
  console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
