// Accessibility: can this be used without seeing it, and without a mouse?
//
// The two failures here are invisible to everyone who is not affected by them,
// which is why they survived twenty other suites.
//
// 1. The app confirmed everything visually and said none of it. You could log
//    a set and get no spoken confirmation at all — on a screen whose entire
//    job is one-tap logging. There were zero aria-live regions in 15k lines.
//
// 2. Dialogs opened without taking focus. Measured across the meal fork, the
//    modals and the article reader: focus stayed on the button behind, so Tab
//    walked the page underneath something covering the whole screen.
//
// Section 3 is the one that will catch a regression: it does not look for
// attributes, it opens each dialog and asks where the focus actually went.
//
//   node tests/a11y.js   (needs `python3 -m http.server 8199` at the root)
const { chromium } = require('/opt/node22/lib/node_modules/playwright/index.js');
const path = require('path');
const fs = require('fs');

let fails = 0;
const check = (label, ok, detail = '') => {
  if (!ok) fails++;
  console.log(`   ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
};
const ROOT = path.resolve(__dirname, '..');

// ================= 1. the static promises =================
console.log('=== 1. the pieces exist ===');
{
  const app = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8');
  const css = fs.readFileSync(path.join(ROOT, 'css/styles.css'), 'utf8');
  check('there is an sr-only utility', /\.sr-only\s*\{/.test(css));
  check('it is hidden visually but not from AT',
    /\.sr-only[^}]*clip-path:\s*inset\(50%\)/.test(css.replace(/\n/g, ' ')));
  check('announce() exists', /function announce\(/.test(app));
  check('and offers both politeness levels', /assertive/.test(app) && /polite/.test(app));
  check('trapFocus() exists and restores the previous element',
    /function trapFocus\(/.test(app) && /previous\.focus/.test(app));
  // A trap that is never released strands focus on a removed node.
  const traps = (app.match(/trapFocus\(/g) || []).length - 1;   // minus the definition
  const releases = (app.match(/release[A-Za-z]*Focus\s*\(\)|release\(\)/g) || []).length;
  check('every trap has a release path', releases >= traps, `${traps} traps, ${releases} release calls`);
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  // Block the service worker, as every other browser suite does. Without it a
  // version bump can activate a new worker mid-run, the app's own
  // controllerchange handler reloads the page, and whatever evaluate was in
  // flight fails with "execution context was destroyed".
  const c = await b.newContext({
    viewport: { width: 390, height: 844 }, hasTouch: true, serviceWorkers: 'block'
  });
  const page = await c.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push('PAGEERR: ' + e.message));
  const T = (s) => `[data-testid="${s}"]`;

  await page.goto('http://localhost:8199/index.html', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.Storage && window.U);
  await page.evaluate(async () => {
    await Storage.clearAll();
    for (const [k, v] of Object.entries({
      onboarded: true, profileName: 'Alex', sex: 'male', dob: '1992-03-04', heightCm: 180,
      activityLevel: 'light', kcalGoal: 2200
    })) await Storage.setPref(k, v);
    await Storage.saveBodyweight({ date: U.todayISO(), kg: 82 });
    const d = new Date(); d.setDate(d.getDate() - 2);
    await Storage.saveWorkout({
      id: 'prev', name: 'Push', date: U.todayISO(d),
      startedAt: Date.now() - 172800000, completedAt: Date.now() - 169200000, durationSec: 3600,
      exercises: [{ exerciseId: 'bench-press-barbell', name: 'Barbell Bench Press', type: 'strength',
        category: 'chest', sets: [{ weight: 80, reps: 8, done: true }] }]
    });
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2600);

  const goTab = async (i) => {
    await page.evaluate((n) => document.querySelectorAll('.dock button')[n].click(), i);
    await page.waitForTimeout(600);
    await page.evaluate(() => document.querySelector('[data-testid="learn-fork-centre"]')?.click());
    await page.waitForTimeout(1500);
  };

  // ================= 2. every control has a name, every screen a heading =====
  console.log('\n=== 2. names and headings, on every screen ===');
  const audit = () => page.evaluate(() => {
    const nameOf = (n) => (
      n.getAttribute('aria-label') || n.getAttribute('title') ||
      (n.innerText || '').trim() || (n.value || '')
    ).trim();
    const controls = [...document.querySelectorAll('button, a[href], input, select, textarea, [role="button"]')]
      .filter((n) => n.getAttribute('aria-hidden') !== 'true' &&
        (n.offsetParent !== null || getComputedStyle(n).position === 'fixed'));
    const unnamed = controls.filter((n) => !nameOf(n));
    const inputs = [...document.querySelectorAll('input:not([type=hidden]), select, textarea')]
      .filter((i) => !(i.getAttribute('aria-label') || i.getAttribute('title') ||
        (i.id && document.querySelector(`label[for="${i.id}"]`)) || i.closest('label')));
    return {
      controls: controls.length,
      unnamed: unnamed.map((n) => `${n.tagName}.${String(n.className).split(' ')[0]}`),
      inputs: inputs.map((n) => `${n.tagName}.${String(n.className).split(' ')[0]}`),
      h1: document.querySelectorAll('h1').length
    };
  });
  for (const [i, label] of [[0, 'Home'], [1, 'Nutrition'], [3, 'You'], [4, 'Learn']]) {
    await goTab(i);
    const r = await audit();
    check(`${label}: every control has an accessible name`,
      r.unnamed.length === 0, `${r.controls} controls · unnamed: ${r.unnamed.join(', ')}`);
    check(`${label}: every input is labelled`, r.inputs.length === 0, r.inputs.join(', '));
    check(`${label}: exactly one top-level heading`, r.h1 === 1, `h1 count ${r.h1}`);
  }

  // ================= 3. dialogs take focus, hold it, and give it back =======
  console.log('\n=== 3. dialogs and focus ===');
  const focusProbe = async (name, open) => {
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2400);
    await open();
    await page.waitForTimeout(900);
    const inside = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"]');
      const a = document.activeElement;
      return { has: !!d, within: !!(d && a && d.contains(a)) };
    });
    check(`${name}: focus moves into the dialog`, inside.has && inside.within);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    const held = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"]');
      return d ? d.contains(document.activeElement) : null;
    });
    check(`${name}: Tab stays inside it`, held === true);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(700);
    const back = await page.evaluate(() => !document.querySelector('[role="dialog"]'));
    check(`${name}: Escape closes it`, back);
  };
  await focusProbe('meal fork', async () => {
    await goTab(1); await page.click(T('donut-add'));
  });
  await focusProbe('reminders modal', async () => {
    await goTab(1); await page.evaluate(() => document.querySelector('[data-testid="reminder-times-btn"]').click());
  });
  await focusProbe('article reader', async () => {
    await goTab(4); await page.evaluate(() => document.querySelector('[data-testid="learn-card"]').click());
  });

  // ================= 4. it says what it did =================
  console.log('\n=== 4. announcements ===');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2400);
  const said = () => page.evaluate(() => {
    const n = document.getElementById('a11y-status');
    return n ? n.textContent.replace(/ /g, '').trim() : null;
  });

  // Log a set through the runner and listen.
  await page.click(T('dock-fab')); await page.waitForTimeout(500);
  await page.click(T('quick-start-workout')); await page.waitForTimeout(1400);
  await page.evaluate(() => [...document.querySelectorAll('.xrow')][0].click());
  await page.waitForTimeout(350);
  await page.evaluate(() => [...document.querySelectorAll('button')].find((x) => /start workout/i.test(x.textContent)).click());
  await page.waitForTimeout(1500);
  await page.evaluate(() => [...document.querySelectorAll('button')].find((x) => /skip warm-up/i.test(x.textContent))?.click());
  await page.waitForTimeout(1500);

  const region = await page.evaluate(() => {
    const n = document.getElementById('a11y-status');
    return n ? { live: n.getAttribute('aria-live'), atomic: n.getAttribute('aria-atomic'), cls: n.className } : null;
  });
  check('a polite live region exists', !!region && region.live === 'polite', JSON.stringify(region));
  check('and it is visually hidden', !!region && /sr-only/.test(region.cls));

  await page.evaluate(() => {
    const r = document.querySelector('[data-testid="set-runner"]');
    [...r.querySelectorAll('button')].find((x) => /LOG SET/.test(x.textContent)).click();
  });
  await page.waitForTimeout(1400);
  const afterLog = await said();
  check('logging a set is announced', /Logged .*Bench Press/i.test(afterLog || ''), afterLog || '(silence)');
  check('and it names the weight and reps',
    /\d+\s*(kg|lb)\b.*\b\d+ reps/i.test(afterLog || ''), afterLog || '');

  // The rest timer is the one thing allowed to interrupt.
  const alert = await page.evaluate(() => {
    const n = document.getElementById('a11y-alert');
    return n ? n.getAttribute('aria-live') : null;
  });
  check('an assertive region exists for the rest timer', alert === 'assertive', String(alert));

  // A live countdown must not be read out four times a second.
  const quiet = await page.evaluate(() => {
    const v = document.getElementById('rest-value');
    const ivr = document.querySelector('[data-testid="ivr-clock"]');
    return { rest: v ? v.getAttribute('aria-hidden') : 'absent', ivr: ivr ? ivr.getAttribute('aria-hidden') : 'absent' };
  });
  check('the rest countdown digits are not read out', quiet.rest !== null, `rest-value aria-hidden=${quiet.rest}`);

  console.log('\nERRORS:', errs.length ? errs : 'none');
  console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
