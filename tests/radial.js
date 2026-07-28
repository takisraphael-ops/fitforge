// The radial hold menu on the dock's + button.
//
// Hold it, flick toward what you want, let go. The payoff is that the choice
// becomes a direction rather than a target — which means the things worth
// testing are not "does a menu appear" but the four ways a hidden gesture
// ruins an app:
//
//   1. It fires when you did not mean it. A tap must still be a tap; the
//      button's own action has to survive, and it must not ALSO fire when a
//      hold picks something.
//   2. It eats your scroll. A press that becomes a drag is someone scrolling
//      past the dock, and swallowing that is worse than having no menu.
//   3. It goes somewhere unreachable. Slices are positioned by trigonometry
//      against a control pinned to the bottom of the viewport, so an arc that
//      opens the wrong way puts them under the home indicator or off-screen.
//   4. There is no way out. A hidden gesture with no dismissal is a trap.
//
// Everything here drives real pointer events, because that is what the code
// listens to; dispatching synthetic clicks would pass while the gesture was
// completely broken.
//
//   node tests/radial.js   (needs `python3 -m http.server 8199` at the repo root)
const { chromium } = require('/opt/node22/lib/node_modules/playwright/index.js');
const path = require('path');
const fs = require('fs');
const SS = process.env.FITFORGE_SHOTS || path.resolve(__dirname, '..', '.shots');
try { fs.mkdirSync(SS, { recursive: true }); } catch (_) {}

const HOLD_MS = 420;   // RADIAL_HOLD_MS in js/app.js
let fails = 0;
const check = (label, ok, detail = '') => {
  if (!ok) fails++;
  console.log(`   ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
};

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', hasTouch: true });
  const page = await c.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load|net::/.test(m.text())) errs.push('con: ' + m.text().slice(0, 140)); });
  await page.route(/fonts\.googleapis\.com/, r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));

  await page.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
  await page.waitForFunction(() => window.Storage && window.U);
  await page.evaluate(async () => {
    await Storage.clearAll();
    for (const [k, v] of Object.entries({ onboarded: true, sex: 'male', dob: '1995-04-12',
      heightCm: 180, activityLevel: 'moderate', kcalGoal: 2600 })) await Storage.setPref(k, v);
    // Enough history that Home scrolls — section 2 needs somewhere to scroll to.
    const iso = d => U.todayISO(d);
    for (let i = 0; i < 20; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      await Storage.saveWorkout({ id: 'w' + i, name: 'Push', date: iso(d), startedAt: d.getTime(),
        completedAt: d.getTime() + 3.6e6, durationSec: 3300,
        exercises: [{ exerciseId: 'bench-press-barbell', name: 'Barbell Bench Press', type: 'weighted',
          sets: [{ weight: 80, reps: 8, done: true }] }] });
    }
  });
  const reset = async () => {
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(4200);
    await page.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"],.splash').forEach(n => n.remove()));
  };
  await reset();

  const fab = () => page.evaluate(() => {
    const r = document.querySelector('[data-testid="dock-fab"]').getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  const isOpen = () => page.evaluate(() => !!document.querySelector('[data-testid="radial-overlay"]'));
  const sheetOpen = () => page.evaluate(() => !!document.querySelector('[data-testid="quick-sheet"]'));
  const dismissAll = () => page.evaluate(() => {
    document.querySelectorAll('[data-testid="radial-overlay"],[data-testid="quick-sheet"]').forEach(n => n.remove());
  });

  // =============== 1. it opens where a thumb can reach ======================
  console.log('=== 1. every slice lands somewhere a thumb can actually reach ===');
  {
    const f = await fab();
    await page.mouse.move(f.x, f.y);
    await page.mouse.down();
    await page.waitForTimeout(HOLD_MS + 180);
    check('the hold opened it', await isOpen());
    const slices = await page.evaluate(() => [...document.querySelectorAll('.radial-slice')].map(s => {
      const r = s.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const hit = document.elementFromPoint(cx, cy);
      return {
        id: s.getAttribute('data-testid'),
        onScreen: r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight,
        // Not merely on-screen: the thing at its own coordinates has to BE it.
        reachable: !!(hit && (hit === s || s.contains(hit))),
        // Clear of the dock it grew out of, or you cannot see what you picked.
        aboveDock: r.bottom <= document.querySelector('.dock').getBoundingClientRect().top + 4
      };
    }));
    console.log('   ', JSON.stringify(slices));
    check('three slices', slices.length === 3, String(slices.length));
    check('all on screen', slices.every(s => s.onScreen));
    check('all hit-testable at their own centre', slices.every(s => s.reachable));
    check('none buried under the dock', slices.every(s => s.aboveDock),
      slices.filter(s => !s.aboveDock).map(s => s.id).join(', '));
    await page.screenshot({ path: `${SS}/radial_open.png` });
    await page.mouse.up();
    await page.waitForTimeout(150);
    await dismissAll();
  }

  // =============== 2. aiming, and going where it says =======================
  console.log('\n=== 2. flicking at a slice goes where that slice says ===');
  {
    await reset();
    const f = await fab();
    await page.mouse.move(f.x, f.y);
    await page.mouse.down();
    await page.waitForTimeout(HOLD_MS + 180);
    const target = await page.evaluate(() => {
      const s = document.querySelector('[data-testid="radial-meal"]');
      const r = s.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    await page.mouse.move(target.x, target.y, { steps: 10 });
    await page.waitForTimeout(150);
    const aimed = await page.evaluate(() =>
      [...document.querySelectorAll('.radial-slice.is-aimed')].map(s => s.getAttribute('data-testid')));
    check('the slice under the thumb is the one that lights up',
      aimed.length === 1 && aimed[0] === 'radial-meal', JSON.stringify(aimed));
    await page.screenshot({ path: `${SS}/radial_aimed.png` });
    await page.mouse.up();
    await page.waitForTimeout(900);
    check('releasing closed it', !(await isOpen()));
    check('it went to Nutrition', await page.evaluate(() =>
      !!document.querySelector('[data-testid="nutrition-view"], .npager') ||
      document.querySelector('[data-testid="dock-nutrition"]')?.classList.contains('active')));
    // The hold must not ALSO fire the button's own tap action.
    check('the quick sheet did not open as well', !(await sheetOpen()));
    await dismissAll();
  }

  // =============== 3. a tap is still a tap ==================================
  console.log('\n=== 3. a tap is still a tap ===');
  {
    await reset();
    const f = await fab();
    await page.mouse.move(f.x, f.y);
    await page.mouse.down();
    await page.waitForTimeout(90);          // well under the threshold
    await page.mouse.up();
    await page.waitForTimeout(500);
    check('no radial', !(await isOpen()));
    check('the quick sheet opened, as it always did', await sheetOpen());
    await dismissAll();
  }

  // =============== 4. it does not eat a scroll ==============================
  console.log('\n=== 4. a press that turns into a drag is a scroll, not a hold ===');
  {
    await reset();
    const f = await fab();
    const before = await page.evaluate(() => window.scrollY);
    await page.mouse.move(f.x, f.y);
    await page.mouse.down();
    // Move past the slop well before the threshold, then keep holding.
    await page.mouse.move(f.x, f.y - 40, { steps: 6 });
    await page.waitForTimeout(HOLD_MS + 250);
    check('nothing opened', !(await isOpen()));
    await page.mouse.up();
    await page.waitForTimeout(300);
    check('and it did not open on release either', !(await isOpen()));
    console.log(`   scrollY ${before} -> ${await page.evaluate(() => window.scrollY)}`);
    await dismissAll();
  }

  // =============== 5. holding still leaves it up to be tapped ===============
  console.log('\n=== 5. hold, release without moving, then tap a slice ===');
  {
    await reset();
    const f = await fab();
    await page.mouse.move(f.x, f.y);
    await page.mouse.down();
    await page.waitForTimeout(HOLD_MS + 180);
    await page.mouse.up();
    await page.waitForTimeout(200);
    check('it stayed up', await isOpen());
    check('the button\'s own action did not fire', !(await sheetOpen()));
    const t = await page.evaluate(() => {
      const s = document.querySelector('[data-testid="radial-sessions"]');
      const r = s.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    await page.mouse.click(t.x, t.y);
    await page.waitForTimeout(900);
    check('tapping a slice works too', !(await isOpen()));
    await dismissAll();
  }

  // =============== 6. no stale suppression ==================================
  //
  // The click that follows a hold is swallowed so the button's own action does
  // not fire as well. That swallow has to disarm itself even when the click it
  // was waiting for never arrives — once the menu is up, the scrim can take
  // the pointerup instead, and a boolean would then sit armed and kill the
  // next genuine tap minutes later.
  //
  // Deliberately dismissed with Escape and not by picking a slice: picking
  // navigates, which re-renders the dock and hands you a brand new button with
  // brand new state, so it could never catch this.
  console.log('\n=== 6. a swallowed tap does not stay swallowed ===');
  {
    await reset();
    const f = await fab();
    await page.mouse.move(f.x, f.y);
    await page.mouse.down();
    await page.waitForTimeout(HOLD_MS + 180);
    await page.mouse.up();                    // sticky: menu stays up
    await page.waitForTimeout(200);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    check('the menu is gone', !(await isOpen()));
    check('and the hold did not fire the tap action', !(await sheetOpen()));

    const sameButton = await page.evaluate(() =>
      !!document.querySelector('[data-testid="dock-fab"]'));
    check('the same button is still mounted', sameButton);
    // Well past the 500ms deadline, so this is a plainly separate gesture.
    await page.waitForTimeout(700);
    await page.mouse.click(f.x, f.y);
    await page.waitForTimeout(700);
    check('the next ordinary tap still opens the sheet', await sheetOpen());
    await dismissAll();
  }

  // =============== 7. there is a way out ====================================
  console.log('\n=== 7. Escape and the scrim both dismiss it ===');
  {
    await reset();
    for (const how of ['escape', 'scrim']) {
      const f = await fab();
      await page.mouse.move(f.x, f.y);
      await page.mouse.down();
      await page.waitForTimeout(HOLD_MS + 180);
      await page.mouse.up();
      await page.waitForTimeout(150);
      if (!(await isOpen())) { check(`${how}: it was open to dismiss`, false); continue; }
      if (how === 'escape') await page.keyboard.press('Escape');
      else await page.mouse.click(20, 120);
      await page.waitForTimeout(350);
      check(`${how} closes it`, !(await isOpen()));
      await dismissAll();
    }
  }

  // =============== 8. the highlight is not made of motion ==================
  //
  // The aimed slice scales, haloes, and its artwork comes alive. All of that
  // is decoration: with motion switched off the selection still has to be
  // obvious, or someone who turned it off cannot use the menu at all.
  console.log('\n=== 8. with motion off, you can still see what is selected ===');
  {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await reset();
    const f = await fab();
    await page.mouse.move(f.x, f.y);
    await page.mouse.down();
    await page.waitForTimeout(HOLD_MS + 180);
    const t = await page.evaluate(() => {
      const r = document.querySelector('[data-testid="radial-meal"]').getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    await page.mouse.move(t.x, t.y, { steps: 8 });
    await page.waitForTimeout(300);
    const m = await page.evaluate(() => {
      const aim = document.querySelector('.radial-slice.is-aimed');
      const idle = document.querySelector('.radial-slice:not(.is-aimed)');
      const ic = n => n && getComputedStyle(n.querySelector('.radial-slice-ic'));
      const anims = [...document.querySelectorAll('.radial-slice, .radial-slice *')]
        .map(n => getComputedStyle(n).animationName).filter(a => a && a !== 'none');
      return {
        aimedBg: ic(aim) && ic(aim).backgroundColor,
        idleBg: ic(idle) && ic(idle).backgroundColor,
        aimedTransform: ic(aim) && ic(aim).transform,
        running: [...new Set(anims)]
      };
    });
    console.log('   ', JSON.stringify(m));
    check('the aimed slice still looks different from the others',
      !!m.aimedBg && m.aimedBg !== m.idleBg, `${m.aimedBg} vs ${m.idleBg}`);
    check('and it is not doing it by moving',
      m.aimedTransform === 'none' && m.running.length === 0, JSON.stringify(m.running));
    await page.mouse.up();
    await page.waitForTimeout(200);
    await dismissAll();
    await page.emulateMedia({ reducedMotion: 'no-preference' });
  }

  console.log('\nERRORS:', errs.length ? errs : 'none');
  console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
