// Swipe a saved meal right to log it.
//
// A gesture has a problem no button has: there is nothing on screen saying it
// exists. Build it without an affordance and it is a feature only the person
// who wrote it can find. So half this suite is about the three signals — the
// rail that never leaves, and the hint line and the one-off nudge that both
// retire the first time a swipe lands — and half is about the gesture itself.
//
// The gesture half is mostly about restraint. A row that slides when you meant
// to scroll the sheet is worse than no gesture at all, and a row that fires
// because your thumb twitched past the threshold is worse still. So: the axis
// is decided once and stuck to, leftward does nothing, and a short pull
// springs back having changed nothing.
//
// The one thing this must never become is the only way to log a saved meal.
// A gesture is unreachable by keyboard and by a screen reader, so section 4
// pins the tap that does the same job.
//
//   node tests/swipe-to-log.js   (needs `python3 -m http.server 8199`)
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

const MEALS = [
  { name: 'Overnight Oats', kcal: 420, protein: 22, carbs: 58, fat: 11, section: 'breakfast' },
  { name: 'Chicken & Rice', kcal: 610, protein: 48, carbs: 70, fat: 12, section: 'lunch' },
  { name: 'Protein Shake', kcal: 180, protein: 30, carbs: 6, fat: 3, section: 'snack' }
];

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', hasTouch: true });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push('PAGEERR: ' + e.message.slice(0, 160)));
  const cdp = await ctx.newCDPSession(page);

  /** A real finger. Synthetic TouchEvents skip the passive/preventDefault
      machinery this gesture is built on, so they would pass while the real
      thing failed to stop the sheet scrolling. */
  const drag = async (x, y, dx, dy = 0, steps = 14) => {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let i = 1; i <= steps; i++) {
      await cdp.send('Input.dispatchTouchEvent',
        { type: 'touchMove', touchPoints: [{ x: x + dx * i / steps, y: y + dy * i / steps }] });
      await new Promise((r) => setTimeout(r, 12));
    }
  };
  const lift = () => cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });

  const seed = async (prefs = {}) => {
    await page.evaluate(async ({ meals, prefs }) => {
      await Storage.clearAll();
      for (const [k, v] of Object.entries({
        onboarded: true, sex: 'male', dob: '1992-03-04', heightCm: 180,
        activityLevel: 'light', kcalGoal: 2200, ...prefs
      })) await Storage.setPref(k, v);
      // Fixed lastUsedAt so the sort order is deterministic: the list is
      // newest-used first, and a test that swipes "the first row" has to know
      // which meal that is.
      let t = 3000;
      for (const m of meals) await Storage.saveMealTemplate({ id: 'tpl-' + m.section, ...m, lastUsedAt: t--, updatedAt: t });
    }, { meals: MEALS, prefs });
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(1800);
    await page.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"],.splash').forEach((n) => n.remove()));
  };

  const openSheet = async () => {
    await page.evaluate(() => document.querySelectorAll('.modal-overlay').forEach((n) => n.remove()));
    await page.evaluate(() => document.querySelector('[data-testid="dock-nutrition"]').click());
    await page.waitForTimeout(1300);
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')]
        .find((x) => /log a saved meal/i.test(x.getAttribute('title') || ''));
      if (btn) btn.click();
    });
    await page.waitForTimeout(1400);
    return !!(await page.$('[data-testid="saved-sheet-body"]'));
  };

  const rowNames = () => page.evaluate(() =>
    [...document.querySelectorAll('[data-testid="saved-sheet-item"]')]
      .map((n) => n.querySelector('.saved-sheet-name').textContent.trim()));
  const slideX = () => page.evaluate(() => {
    const s = document.querySelector('.smeal-slide');
    return s ? (s.style.transform || '') : '(no slide)';
  });
  const logged = () => page.evaluate(async () => (await Storage.getMeals()).map((m) => m.name));
  const rowBox = async (i = 0) => (await page.$$('[data-testid="saved-sheet-item"]'))[i].boundingBox();

  await page.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
  await page.waitForFunction(() => window.Storage && window.U);

  // ================= 1. it can be discovered =============================
  console.log('=== 1. the gesture announces itself ===');
  await seed();
  check('the saved meals sheet opens', await openSheet());
  check('all three meals are listed', (await rowNames()).length === 3, JSON.stringify(await rowNames()));
  check('a hint line says what to do',
    /swipe.*right.*log/i.test(await page.textContent('[data-testid="saved-swipe-hint"]').catch(() => '')),
    await page.textContent('[data-testid="saved-swipe-hint"]').catch(() => '(none)'));
  // The permanent half. A row with nothing at its leading edge gives no reason
  // to try pulling it, so every row shows a sliver of where it comes from.
  check('every row carries the leading rail',
    await page.evaluate(() => {
      const rows = [...document.querySelectorAll('.smeal .smeal-slide')];
      return rows.length > 0 && rows.every((s) => {
        const w = getComputedStyle(s, '::before').width;
        return w && w !== 'auto' && parseFloat(w) > 0;
      });
    }));
  check('and a Log panel waiting underneath it',
    (await page.$$('[data-testid="saved-swipe-action"]')).length === 3);
  // A gesture panel is scenery. Announcing it would offer a screen reader a
  // control it has no way to operate.
  check('the panel is hidden from assistive tech',
    await page.evaluate(() => [...document.querySelectorAll('[data-testid="saved-swipe-action"]')]
      .every((n) => n.getAttribute('aria-hidden') === 'true')));
  check('the first row demonstrates it once', !!(await page.$('.smeal-slide.is-nudging')));
  await page.waitForTimeout(1700);
  await page.screenshot({ path: `${SS}/swipe-sheet.png` });

  // ================= 2. it does not fire by accident =====================
  console.log('\n=== 2. restraint ===');
  {
    let bb = await rowBox(0);
    const first = (await rowNames())[0];

    // Vertical. The sheet scrolls; a row that slides because a scroll drifted
    // sideways is the failure that makes people stop using the list.
    await drag(bb.x + 40, bb.y + bb.height / 2, 6, 90);
    check('a vertical drag leaves the row alone', (await slideX()) === '', await slideX());
    await lift(); await page.waitForTimeout(300);

    // Leftward is where a swipe-to-delete would live. Deleting a saved meal
    // asks for confirmation, and a gesture that skips it is not a shortcut.
    bb = await rowBox(0);
    await drag(bb.x + 140, bb.y + bb.height / 2, -110);
    check('a leftward drag does nothing at all', (await slideX()) === '', await slideX());
    await lift(); await page.waitForTimeout(300);

    // Short pull: follows the finger, but is not armed and fires nothing.
    bb = await rowBox(0);
    await drag(bb.x + 40, bb.y + bb.height / 2, 50);
    const partial = await slideX();
    check('a short pull follows the finger', /translateX\(\d+px\)/.test(partial), partial);
    check('but does not arm', !(await page.evaluate(() => document.querySelector('.smeal').classList.contains('is-armed'))));
    await page.screenshot({ path: `${SS}/swipe-partial.png` });
    await lift(); await page.waitForTimeout(500);
    check('and springs back on release', (await slideX()) === '', await slideX());
    check('having logged nothing', (await logged()).length === 0, JSON.stringify(await logged()));
    check('with the sheet still open', !!(await page.$('[data-testid="saved-sheet-body"]')));
    check('and the row still the same one', (await rowNames())[0] === first);
  }

  // ================= 3. a full pull logs that meal =======================
  console.log('\n=== 3. the gesture ===');
  {
    const names = await rowNames();
    const target = names[1];          // deliberately not the first row
    const bb = await rowBox(1);
    await drag(bb.x + 40, bb.y + bb.height / 2, 150);
    check('a full pull arms',
      await page.evaluate(() => [...document.querySelectorAll('.smeal')].some((n) => n.classList.contains('is-armed'))));
    await page.screenshot({ path: `${SS}/swipe-armed.png` });
    await lift();
    await page.waitForTimeout(1700);
    check('the sheet closes, as a tap would', !(await page.$('[data-testid="saved-sheet-body"]')));
    // The closure-over-the-loop check. Every row shares one handler shape, and
    // capturing the wrong template would log a plausible meal — just not the
    // one under your thumb.
    check(`it logs the row that was pulled, not another one`,
      JSON.stringify(await logged()) === JSON.stringify([target]),
      `swiped ${target}, logged ${JSON.stringify(await logged())}`);
    const stored = await page.evaluate(async () => (await Storage.getMeals())[0]);
    const src = MEALS.find((m) => m.name === target);
    check('with the saved meal\'s own numbers',
      stored.kcal === src.kcal && stored.protein === src.protein,
      JSON.stringify({ kcal: stored.kcal, protein: stored.protein }));
    check('and into its own section', stored.section === src.section, stored.section);
  }

  console.log('\n   -- the teaching aids retire --');
  {
    check('the gesture is recorded as learned',
      (await page.evaluate(async () => await Storage.getPref('savedSwipeUsed'))) === true);
    await openSheet();
    check('the hint line is gone', !(await page.$('[data-testid="saved-swipe-hint"]')));
    check('and the nudge no longer plays', !(await page.$('.smeal-slide.is-nudging')));
    // The rail is the affordance, not the tutorial — it stays.
    check('but the rail and the panel stay',
      (await page.$$('[data-testid="saved-swipe-action"]')).length === 3);
  }

  // ================= 4. the gesture is never the only way ================
  console.log('\n=== 4. a gesture may only ever be a shortcut ===');
  {
    await seed();
    await openSheet();
    const target = (await rowNames())[0];
    await page.evaluate(() => document.querySelectorAll('[data-testid="saved-sheet-log"]')[0].click());
    await page.waitForTimeout(1500);
    check('tapping the row logs it, same as the swipe',
      JSON.stringify(await logged()) === JSON.stringify([target]),
      `${target} vs ${JSON.stringify(await logged())}`);
    // The equivalent path has to be a real focusable control with a name, not
    // a div someone wired a click to.
    await openSheet();
    const btn = await page.evaluate(() => {
      const n = document.querySelector('[data-testid="saved-sheet-log"]');
      if (!n) return null;
      n.focus();
      return {
        tag: n.tagName,
        disabled: !!n.disabled,
        focused: document.activeElement === n,
        name: (n.getAttribute('title') || n.textContent || '').trim().slice(0, 40)
      };
    });
    check('the equivalent control is a focusable button',
      btn && btn.tag === 'BUTTON' && btn.focused && !btn.disabled, JSON.stringify(btn));
    check('and it says what it does', btn && /log/i.test(btn.name), btn && btn.name);
  }

  console.log('\n=== 5. reduced motion ===');
  {
    // A row that moves on its own is exactly what this setting is asking us
    // not to do. The rail and the hint line carry the message instead.
    const rm = await ctx.newPage();
    await rm.emulateMedia({ reducedMotion: 'reduce' });
    await rm.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
    await rm.waitForFunction(() => window.Storage && window.U);
    await rm.evaluate(async () => { await Storage.setPref('savedSwipeUsed', false); });
    await rm.reload({ waitUntil: 'load' });
    await rm.waitForTimeout(1800);
    await rm.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"],.splash').forEach((n) => n.remove()));
    await rm.evaluate(() => document.querySelector('[data-testid="dock-nutrition"]').click());
    await rm.waitForTimeout(1300);
    await rm.evaluate(() => {
      const btn = [...document.querySelectorAll('button')]
        .find((x) => /log a saved meal/i.test(x.getAttribute('title') || ''));
      if (btn) btn.click();
    });
    await rm.waitForTimeout(1600);
    check('no row animates itself', !(await rm.$('.smeal-slide.is-nudging')));
    check('but the hint line is still offered', !!(await rm.$('[data-testid="saved-swipe-hint"]')));
    await rm.close();
  }

  console.log('\nERRORS:', errs.length ? errs : 'none');
  console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
