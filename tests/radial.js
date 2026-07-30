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

  // =============== 9. the press hint ========================================
  //
  // Nothing on screen says the + can be held, so pressing it starts filling a
  // ring and, past halfway, ghosts the slices outward. It has to appear only
  // for a press that is genuinely lingering, and it has to be gone in every
  // way the hold can end — otherwise it is litter on top of the app.
  console.log('\n=== 9. the press hint teaches, then gets out of the way ===');
  {
    await reset();
    const hintUp = () => page.evaluate(() => !!document.querySelector('[data-testid="radial-hint"]'));
    const f = await fab();

    // A crisp tap must not flash anything.
    await page.mouse.move(f.x, f.y);
    await page.mouse.down();
    await page.waitForTimeout(80);
    const early = await hintUp();
    await page.mouse.up();
    await page.waitForTimeout(400);
    check('a quick tap shows no hint', !early);
    await dismissAll();

    // Mid-hold it is up, with one ghost per slice.
    await page.mouse.move(f.x, f.y);
    await page.mouse.down();
    await page.waitForTimeout(250);
    const mid = await page.evaluate(() => {
      const h = document.querySelector('[data-testid="radial-hint"]');
      if (!h) return { up: false };
      return {
        up: true,
        ghosts: h.querySelectorAll('.radial-hint-ghost').length,
        ring: !!h.querySelector('.radial-hint-fill'),
        // It teaches a gesture, so it must never be the thing you hit.
        takesTaps: getComputedStyle(h).pointerEvents !== 'none'
      };
    });
    console.log('   ', JSON.stringify(mid));
    check('mid-hold the hint is up', mid.up);
    check('with a ring and one ghost per slice', mid.ring && mid.ghosts === 3, JSON.stringify(mid.ghosts));
    check('and it cannot be tapped', !mid.takesTaps);
    // Once the real menu exists, the rehearsal has to be gone.
    await page.waitForTimeout(400);
    check('the menu opened', await isOpen());
    check('the hint went with it', !(await hintUp()));
    await page.mouse.up();
    await page.waitForTimeout(200);
    await dismissAll();

    // Cancelled by a drag: no hint left behind.
    await reset();
    const f2 = await fab();
    await page.mouse.move(f2.x, f2.y);
    await page.mouse.down();
    await page.waitForTimeout(200);
    await page.mouse.move(f2.x, f2.y - 44, { steps: 6 });
    await page.waitForTimeout(400);
    check('a drag clears the hint', !(await hintUp()));
    check('and still opens nothing', !(await isOpen()));
    await page.mouse.up();
    await page.waitForTimeout(200);
    await dismissAll();
  }

  // =============== 10. the tip that retires itself ==========================
  //
  // The sheet carries a line teaching the hold, shown at the one moment
  // someone is demonstrably taking the long way to the same three choices. It
  // has to stop the first time the hold is actually used, or it is advice you
  // have already taken.
  console.log('\n=== 10. the sheet tip stops once you have used the hold ===');
  {
    await page.evaluate(async () => { await Storage.setPref('radialDiscovered', false); });
    await reset();
    const f = await fab();
    await page.mouse.click(f.x, f.y);
    await page.waitForTimeout(900);
    check('before discovery, the sheet teaches the shortcut',
      await page.evaluate(() => !!document.querySelector('[data-testid="quick-sheet-tip"]')));
    await dismissAll();

    // Use the hold for real.
    await page.mouse.move(f.x, f.y);
    await page.mouse.down();
    await page.waitForTimeout(HOLD_MS + 180);
    await page.mouse.up();
    await page.waitForTimeout(200);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    check('using it is recorded',
      await page.evaluate(() => Storage.getPref('radialDiscovered')));

    await page.waitForTimeout(700);
    await page.mouse.click(f.x, f.y);
    await page.waitForTimeout(900);
    check('the sheet still opens', await sheetOpen());
    check('but no longer teaches what you already know',
      !(await page.evaluate(() => !!document.querySelector('[data-testid="quick-sheet-tip"]'))));
    await dismissAll();

    // And it stays retired across a reload.
    await reset();
    const f3 = await fab();
    await page.mouse.click(f3.x, f3.y);
    await page.waitForTimeout(900);
    check('and it is still retired after a reload',
      !(await page.evaluate(() => !!document.querySelector('[data-testid="quick-sheet-tip"]'))));
    await dismissAll();
  }

  // =============== 11. every tab's menu fits, at every width ================
  //
  // The + sits dead centre, so a symmetric fan always fitted and hid this
  // entirely. The dock's outer tabs sit ~60px from the edge, where a fan wide
  // enough to be comfortable throws its outermost slice off-screen — so the
  // arc is fitted to the room on each side and slides inward.
  //
  // Two things are checked that "it opened" would not catch: each slice has to
  // be the thing at its own coordinates, and adjacent LABELS must not overlap.
  // Compressing the fan makes the circles fit long before it makes the words
  // fit — "This week" sat underneath the next slice's circle, and "Supplements"
  // could not fit at 320px at all, which is why it now reads "Supps".
  console.log('\n=== 11. every tab menu fits and stays legible, 320-430px ===');
  {
    const TRIGGERS = ['home', 'nutrition', 'fab', 'stats', 'library'];
    let worst = [];
    for (const vw of [320, 390, 430]) {
      await page.setViewportSize({ width: vw, height: 844 });
      await reset();
      for (const t of TRIGGERS) {
        const sel = `[data-testid="dock-${t}"]`;
        const at = await page.evaluate((s) => {
          const n = document.querySelector(s);
          if (!n) return null;
          const r = n.getBoundingClientRect();
          return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }, sel);
        if (!at) { worst.push(`${vw}/${t}: no trigger`); continue; }
        await page.mouse.move(at.x, at.y);
        await page.mouse.down();
        await page.waitForTimeout(HOLD_MS + 160);
        const r = await page.evaluate((vw) => {
          const o = document.querySelector('[data-testid="radial-overlay"]');
          if (!o) return { open: false };
          const slices = [...o.querySelectorAll('.radial-slice')];
          const off = slices.filter(s => {
            const b = s.getBoundingClientRect();
            return b.left < -1 || b.right > vw + 1 || b.top < -1;
          }).map(s => s.getAttribute('data-testid'));
          const unreachable = slices.filter(s => {
            const b = s.getBoundingClientRect();
            const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
            return !(hit && (hit === s || s.contains(hit)));
          }).map(s => s.getAttribute('data-testid'));
          // Label against label AND label against every other slice's circle.
          // Checking only label-to-label misses the way this actually went
          // wrong: "This week" was legible against its neighbour's label and
          // sat squarely underneath its neighbour's icon.
          const parts = slices.map(s => ({
            id: s.getAttribute('data-testid'),
            label: s.querySelector('.radial-slice-label').getBoundingClientRect(),
            icon: s.querySelector('.radial-slice-ic').getBoundingClientRect()
          }));
          const hits = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
          const clashes = [];
          for (let i = 0; i < parts.length; i++) {
            for (let j = 0; j < parts.length; j++) {
              if (i === j) continue;
              if (j > i && hits(parts[i].label, parts[j].label)) clashes.push(`${parts[i].id}/${parts[j].id} labels`);
              if (hits(parts[i].label, parts[j].icon)) clashes.push(`${parts[i].id} label under ${parts[j].id}`);
            }
          }
          return { open: true, n: slices.length, off, unreachable, clash: clashes.length, clashes };
        }, vw);
        if (!r.open) worst.push(`${vw}/${t}: did not open`);
        else if (r.off.length) worst.push(`${vw}/${t}: off-screen ${r.off.join(',')}`);
        else if (r.unreachable.length) worst.push(`${vw}/${t}: unreachable ${r.unreachable.join(',')}`);
        else if (r.clash) worst.push(`${vw}/${t}: ${r.clashes.join(', ')}`);
        await page.mouse.up();
        await page.waitForTimeout(120);
        await dismissAll();
        await page.evaluate(() => document.querySelectorAll('.modal-overlay').forEach(n => n.remove()));
      }
    }
    console.log(`   checked ${TRIGGERS.length * 3} trigger/width pairs`);
    check('every menu opens, fits, is hit-testable and stays legible',
      worst.length === 0, worst.join(' | '));
    await page.setViewportSize({ width: 390, height: 844 });
  }

  // =============== 12. the slices go where they say ========================
  console.log('\n=== 12. tab slices land on their destinations ===');
  {
    await reset();
    const pick = async (tab, slice) => {
      const at = await page.evaluate((s) => {
        const r = document.querySelector(s).getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }, `[data-testid="dock-${tab}"]`);
      await page.mouse.move(at.x, at.y);
      await page.mouse.down();
      await page.waitForTimeout(HOLD_MS + 160);
      const t = await page.evaluate((s) => {
        const n = document.querySelector(s);
        if (!n) return null;
        const r = n.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }, `[data-testid="radial-${slice}"]`);
      if (!t) { await page.mouse.up(); return false; }
      await page.mouse.move(t.x, t.y, { steps: 8 });
      await page.waitForTimeout(120);
      await page.mouse.up();
      await page.waitForTimeout(1000);
      return true;
    };

    check('You -> History lands on History',
      (await pick('stats', 'history')) &&
      (await page.evaluate(() => !!document.querySelector('[data-testid="seg-history"].active'))));
    await dismissAll();

    await reset();
    check('Exercises -> Sessions opens the sessions sheet',
      (await pick('library', 'sessions')) &&
      (await page.evaluate(() => {
        const m = document.querySelector('.modal-overlay');
        return !!m && /Sessions/.test(m.textContent);
      })));
    await page.evaluate(() => document.querySelectorAll('.modal-overlay').forEach(n => n.remove()));

    await reset();
    const before = await page.evaluate(() => window.scrollY);
    const landed = await pick('home', 'trends');
    const after = await page.evaluate(() => ({
      y: window.scrollY,
      trendsNearTop: (() => {
        const n = document.querySelector('[data-testid="home-section-trends"]');
        if (!n) return false;
        const t = n.getBoundingClientRect().top;
        return t > -40 && t < 200;
      })()
    }));
    console.log(`   home scrollY ${before} -> ${after.y}`);
    check('Home -> Trends scrolls Trends into view',
      landed && after.y > before && after.trendsNearTop, JSON.stringify(after));
    await dismissAll();
  }

  // =============== 13. the set row, mid-workout ============================
  //
  // Attached to "···" rather than the row: the row is mostly number inputs,
  // where a tap opens the numpad and a hold would be arguing with it.
  //
  // This is the first trigger that lives inside a scroller and the first that
  // can sit near the top of the screen, so it exercises two things the dock
  // never could — keeping its touch-action so a drag still scrolls, and
  // flipping the fan downward when there is no room above.
  console.log('\n=== 13. holding "···" on a set row ===');
  {
    await page.evaluate(async () => {
      await Storage.clearAll();
      for (const [k, v] of Object.entries({ onboarded: true, sex: 'male', dob: '1995-04-12',
        heightCm: 180, activityLevel: 'moderate', kcalGoal: 2600, radialDiscovered: true,
        // Section 13 is about the set row's own hold menu, so it needs the set
        // rows on screen. Guided logging is the default and draws over them;
        // its number-nudge radial is covered in tests/guided.js.
        guidedSets: false })) await Storage.setPref(k, v);
      await Storage.saveBodyweight({ date: U.todayISO(), kg: 82 });
      // Eight sets so the workout screen is taller than the viewport — the
      // downward flip cannot be reached on a page that does not scroll.
      const ex = (id, name) => ({ exerciseId: id, name, type: 'weighted',
        sets: Array.from({ length: 8 }, () => ({ weight: 100, reps: 8, done: false })) });
      await Storage.saveWorkout({ id: 'aw', name: 'Session', date: U.todayISO(), startedAt: Date.now() - 6e5,
        exercises: [ex('bench-press-barbell', 'Barbell Bench Press')] });
      await Storage.setPref('activeWorkoutId', 'aw');
    });
    const openWorkout = async () => {
      await page.reload({ waitUntil: 'load' });
      await page.waitForTimeout(4200);
      await page.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"],.splash').forEach(n => n.remove()));
      await page.evaluate(() => {
        const r = document.querySelector('[data-testid="button-resume-workout"]');
        if (r) r.click(); else document.querySelector('[data-testid="dock-fab"]').click();
      });
      await page.waitForTimeout(1500);
    };
    const moreAt = () => page.evaluate(() => {
      const n = document.querySelector('[data-testid="set-more-0"]');
      if (!n) return null;
      const r = n.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    await openWorkout();

    const mb = await moreAt();
    check('the workout screen has a "···" to hold', !!mb);
    check('it keeps its touch-action so the list can still be dragged',
      (await page.evaluate(() => getComputedStyle(document.querySelector('[data-testid="set-more-0"]')).touchAction)) !== 'none');

    // A drag from the trigger scrolls, and opens nothing.
    await page.mouse.move(mb.x, mb.y);
    await page.mouse.down();
    await page.mouse.move(mb.x, mb.y - 60, { steps: 8 });
    await page.waitForTimeout(HOLD_MS + 200);
    check('a drag from it opens nothing', !(await isOpen()));
    await page.mouse.up();
    await page.waitForTimeout(200);
    await dismissAll();

    // Held still, it opens with its three slices.
    await page.mouse.move(mb.x, mb.y);
    await page.mouse.down();
    await page.waitForTimeout(HOLD_MS + 180);
    const held = await page.evaluate(() => {
      const o = document.querySelector('[data-testid="radial-overlay"]');
      if (!o) return { open: false };
      const slices = [...o.querySelectorAll('.radial-slice')];
      return {
        open: true,
        ids: slices.map(s => s.getAttribute('data-testid')),
        unreachable: slices.filter(s => {
          const b = s.getBoundingClientRect();
          const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
          return !(hit && (hit === s || s.contains(hit)));
        }).map(s => s.getAttribute('data-testid'))
      };
    });
    console.log('   ', JSON.stringify(held));
    check('three slices, the same three on every exercise type',
      held.open && held.ids.length === 3, JSON.stringify(held.ids));
    check('all reachable', held.open && held.unreachable.length === 0, JSON.stringify(held.unreachable));
    await page.screenshot({ path: `${SS}/radial_setrow.png` });
    await page.mouse.up();
    await page.waitForTimeout(200);
    await dismissAll();

    // Drop set actually toggles, against storage rather than the screen.
    const mb3 = await moreAt();
    await page.mouse.move(mb3.x, mb3.y);
    await page.mouse.down();
    await page.waitForTimeout(HOLD_MS + 180);
    const dropAt = await page.evaluate(() => {
      const n = document.querySelector('[data-testid="radial-drop"]');
      if (!n) return null;
      const r = n.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    if (dropAt) {
      await page.mouse.move(dropAt.x, dropAt.y, { steps: 8 });
      await page.waitForTimeout(120);
      await page.mouse.up();
      await page.waitForTimeout(900);
    } else { await page.mouse.up(); }
    const dropped = await page.evaluate(async () => {
      const w = (await Storage.getWorkouts()).find(x => x.id === 'aw');
      return !!(w && w.exercises[0].sets[0].drop);
    });
    check('the Drop set slice marks the set as a drop set', dropped);
    await dismissAll();
  }

  // =============== 14. picking twice in a row actually goes twice ===========
  //
  // Reported from real use: the Nutrition menu took you to Trends, and then
  // every later pick left you sitting on Trends.
  //
  // The panel navigation went through nutritionScrollKey, which is a memory of
  // where you were rather than a request to be moved — and the pager restores
  // an exact pixel offset in preference to it. So the first pick worked
  // (offset 0) and every one after it was overruled by the position the last
  // one had left behind. A single pick can never catch this; the sequence is
  // the test.
  console.log('\n=== 14. a second pick is not overruled by the first ===');
  {
    await page.evaluate(async () => {
      await Storage.clearAll();
      for (const [k, v] of Object.entries({ onboarded: true, sex: 'male', dob: '1995-04-12',
        heightCm: 180, activityLevel: 'moderate', kcalGoal: 2600, radialDiscovered: true })) await Storage.setPref(k, v);
      for (let i = 0; i < 6; i++) {
        const d = new Date(); d.setDate(d.getDate() - i);
        for (const m of [['Oats', 520], ['Chicken & rice', 700]]) {
          await Storage.saveMeal({ id: `m${i}-${m[0]}`, date: U.todayISO(d), name: m[0], kcal: m[1], protein: 40, carbs: 60, fat: 14 });
        }
      }
    });
    await reset();

    const pickNutrition = async (slice) => {
      const at = await page.evaluate(() => {
        const r = document.querySelector('[data-testid="dock-nutrition"]').getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });
      await page.mouse.move(at.x, at.y);
      await page.mouse.down();
      await page.waitForTimeout(HOLD_MS + 170);
      const t = await page.evaluate((s) => {
        const n = document.querySelector(`[data-testid="radial-${s}"]`);
        if (!n) return null;
        const r = n.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }, slice);
      if (!t) { await page.mouse.up(); return null; }
      await page.mouse.move(t.x, t.y, { steps: 8 });
      await page.waitForTimeout(120);
      await page.mouse.up();
      await page.waitForTimeout(1100);
      // Which panel is actually centred, not which one we asked for.
      return page.evaluate(() => {
        const pager = document.querySelector('.npager');
        if (!pager) return null;
        const centre = pager.scrollTop + pager.clientHeight / 2;
        let best = -1, bd = Infinity;
        for (let i = 0; i < pager.children.length; i++) {
          const c = pager.children[i].offsetTop + pager.children[i].offsetHeight / 2;
          if (Math.abs(c - centre) < bd) { bd = Math.abs(c - centre); best = i; }
        }
        return { panel: best, last: pager.children.length - 1 };
      });
    };

    const first = await pickNutrition('trends');
    check('Trends goes to the last panel', !!first && first.panel === first.last, JSON.stringify(first));
    const second = await pickNutrition('supps');
    check('Supps after Trends goes to Supps, not back to Trends',
      !!second && second.panel === second.last - 1, JSON.stringify(second));
    const third = await pickNutrition('today');
    check('Today after that goes to the top', !!third && third.panel === 0, JSON.stringify(third));
    const fourth = await pickNutrition('trends');
    check('and Trends again still works', !!fourth && fourth.panel === fourth.last, JSON.stringify(fourth));
    await dismissAll();
  }

  console.log('\nERRORS:', errs.length ? errs : 'none');
  console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
