// The swipe pager: a tab drag that tracks the finger, and the snapshot cache
// that makes it possible.
//
// The interesting part of this feature is not the drag, it is when the drag
// refuses to happen. A pane costs ~130ms to build from IndexedDB, so the
// pager can only track when it already holds a clone of the destination, and
// that clone is thrown away the moment anything is written. Every one of
// those refusals has to land back on the behaviour the app had before.
//
//   node tests/pager.js   (needs `python3 -m http.server 8199` at the repo root)
const { chromium } = require('/opt/node22/lib/node_modules/playwright/index.js');

let fails = 0;
const check = (label, ok, detail = '') => {
  if (!ok) fails++;
  console.log(`   ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
};

const TABS = ['home', 'nutrition', 'stats', 'library'];

const INK = require('./ink.js');

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const c = await b.newContext({
    viewport: { width: 390, height: 844 }, serviceWorkers: 'block', hasTouch: true
  });
  const page = await c.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERR: ' + e.message.slice(0, 160)));
  page.on('console', m => {
    if (m.type() === 'error' && !/Failed to load|net::/.test(m.text())) errs.push('con: ' + m.text().slice(0, 140));
  });
  await page.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
  await page.waitForFunction(() => window.Storage && window.U);

  const seed = async () => {
    await page.evaluate(async () => {
      await Storage.clearAll();
      await Storage.setPref('onboarded', true);
      await Storage.setPref('warmupPrompt', false);
      await Storage.setPref('sex', 'male');
      await Storage.setPref('dob', '1985-03-09');
      await Storage.setPref('heightCm', 180);
      for (let i = 0; i < 8; i++) {
        const d = new Date(); d.setDate(d.getDate() - i);
        await Storage.saveWorkout({
          id: 'w' + i, name: 'Push', date: U.todayISO(d), startedAt: d.getTime(),
          completedAt: d.getTime() + 3.6e6, durationSec: 3300,
          exercises: [{ exerciseId: 'bench-press-barbell', name: 'Bench', type: 'weighted',
            sets: [{ weight: 80, reps: 8, done: true }] }]
        });
        await Storage.saveMeal({ id: 'm' + i, date: U.todayISO(d), name: 'Meal',
          section: 'lunch', kcal: 600, protein: 40, carbs: 60, fat: 20 });
      }
    });
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(1800);
    await page.evaluate(() => document.querySelectorAll('.splash').forEach(n => n.remove()));
    await page.evaluate(INK);
  };

  const killOverlays = () => page.evaluate(() => {
    document.querySelectorAll('.qa-fork-overlay, .modal-overlay, .wsheet-overlay, .radial-overlay, [data-testid="tab-loader"]')
      .forEach(n => n.remove());
  });

  // Visiting every tab both spends the one-shot loaders and fills the
  // snapshot cache, which is the state the pager is designed for.
  const warmAll = async () => {
    for (const t of [...TABS, 'home']) {
      await killOverlays();
      await page.evaluate((id) => document.querySelector(`[data-testid="dock-${id}"]`).click(), t);
      await page.waitForTimeout(900);
      await killOverlays();
      await page.waitForTimeout(300);
    }
  };

  const activeTab = () => page.evaluate(() => {
    const on = document.querySelector('.dock-item.active');
    return on ? (on.dataset.testid || '').replace('dock-', '') : null;
  });

  // A real finger: many small moves, so velocity is measured the way the
  // handler expects rather than arriving as one enormous jump.
  const swipe = async (dxTotal, { steps = 12, holdMs = 12, release = true } = {}) => {
    const y = 420, x0 = dxTotal < 0 ? 330 : 60;
    await page.touchscreen.tap(1, 1).catch(() => {});
    await page.evaluate(({ x, y }) => {
      window.__t = (type, cx, cy) => {
        const t = new Touch({ identifier: 1, target: document.elementFromPoint(cx, cy) || document.body,
          clientX: cx, clientY: cy });
        document.elementFromPoint(cx, cy)?.dispatchEvent(new TouchEvent(type, {
          bubbles: true, cancelable: true, touches: type === 'touchend' ? [] : [t],
          changedTouches: [t], targetTouches: type === 'touchend' ? [] : [t]
        }));
      };
      window.__t('touchstart', x, y);
    }, { x: x0, y });
    for (let i = 1; i <= steps; i++) {
      await page.evaluate(({ x, y }) => window.__t('touchmove', x, y),
        { x: x0 + (dxTotal * i) / steps, y });
      await page.waitForTimeout(holdMs);
    }
    if (release) {
      await page.evaluate(({ x, y }) => window.__t('touchend', x, y), { x: x0 + dxTotal, y });
    }
    return { x0, y };
  };

  console.log('=== 1. a swipe tracks the finger ===');
  {
    await seed();
    await warmAll();
    check('starts on home', (await activeTab()) === 'home');

    await swipe(-140, { release: false });
    const mid = await page.evaluate(() => {
      const main = document.querySelector('#main');
      const live = main.querySelector('.view:not(.tab-ghost)');
      const pane = document.querySelector('body > .view.tab-pane');
      return {
        anim: main.classList.contains('tab-anim'),
        live: live ? live.style.transform : '',
        pane: pane ? pane.style.transform : ''
      };
    });
    check('the outgoing view moves under the finger', /translate3d\(-\d/.test(mid.live), mid.live || 'none');
    check('and the destination pane is on screen behind it', /translate3d/.test(mid.pane), mid.pane || 'none');
    check('with the transition class set', mid.anim);

    await page.evaluate(() => window.__t('touchend', 190, 420));
    await page.waitForTimeout(900);
    check('releasing past halfway lands on the next tab', (await activeTab()) === 'nutrition');
  }

  console.log('\n=== 2. a short drag springs back ===');
  {
    await seed();
    await warmAll();
    await swipe(-40);
    await page.waitForTimeout(900);
    check('40px is not a commit', (await activeTab()) === 'home');
    const after = await page.evaluate(() => {
      const main = document.querySelector('#main');
      const live = main.querySelector('.view:not(.tab-ghost)');
      return {
        ghosts: document.querySelectorAll('.view.tab-pane').length,
        transform: live ? live.style.transform : 'no view',
        anim: main.classList.contains('tab-anim')
      };
    });
    check('the pane is taken back off screen', after.ghosts === 0, String(after.ghosts));
    check('the view returns exactly to rest', !after.transform, after.transform || 'clean');
    check('and the transition class is cleared', !after.anim);
  }

  console.log('\n=== 3. a flick commits from anywhere ===');
  {
    await seed();
    await warmAll();
    // Short but fast: below the halfway line, above the velocity threshold.
    await swipe(-70, { steps: 5, holdMs: 4 });
    await page.waitForTimeout(1000);
    check('a fast 70px flick commits', (await activeTab()) === 'nutrition');
  }

  console.log('\n=== 3b. the journey is not played twice ===');
  {
    // The drag has already carried the screen across, so the commit must
    // render without animating.
    //
    // Counting inserted panes used to stand in for this, and stopped meaning
    // anything once the handover legitimately puts its cover back. The tell
    // that survives is the unit: animateTabSwitch positions in percentages,
    // the pager in pixels. A percentage transform appearing anywhere during a
    // swipe means the dock's slide ran on top of the drag.
    await seed();
    await warmAll();
    const pcts = await page.evaluate(async () => {
      const t = (type, cx, cy) => {
        const target = document.elementFromPoint(cx, cy) || document.body;
        const tt = new Touch({ identifier: 5, target, clientX: cx, clientY: cy });
        target.dispatchEvent(new TouchEvent(type, { bubbles: true, cancelable: true,
          touches: type === 'touchend' ? [] : [tt], changedTouches: [tt],
          targetTouches: type === 'touchend' ? [] : [tt] }));
      };
      const main = document.querySelector('#main');
      const seen = [];
      const sample = () => {
        for (const v of main.children) {
          const tx = v.style && v.style.transform;
          if (tx && tx.includes('%')) seen.push(tx);
        }
      };
      t('touchstart', 340, 430);
      for (let px = 10; px <= 260; px += 20) { t('touchmove', 340 - px, 430); sample(); }
      t('touchend', 80, 430);
      for (let i = 0; i < 45; i++) {
        await new Promise(r => requestAnimationFrame(r));
        sample();
      }
      return seen;
    });
    check('the swipe committed', (await activeTab()) === 'nutrition');
    check('no percentage transform ever appears', pcts.length === 0,
      pcts.length ? `${pcts.length}, first ${pcts[0]} — the commit animated on top of the drag` : 'pixels only');
  }

  console.log('\n=== 3c. the screen never goes blank at the handover ===');
  {
    // renderMain() empties #main and the tab renderers fill it asynchronously.
    // Removing the settled pane before that lands left exactly one frame with
    // nothing painted, at the end of an otherwise smooth drag — which is what
    // a flash is. Sampling after the fact cannot see it, so this records every
    // frame from release until well past the render.
    await seed();
    await warmAll();
    const frames = await page.evaluate(async () => {
      const t = (type, cx, cy) => {
        const target = document.elementFromPoint(cx, cy) || document.body;
        const tt = new Touch({ identifier: 4, target, clientX: cx, clientY: cy });
        target.dispatchEvent(new TouchEvent(type, { bubbles: true, cancelable: true,
          touches: type === 'touchend' ? [] : [tt], changedTouches: [tt],
          targetTouches: type === 'touchend' ? [] : [tt] }));
      };
      const painted = () => window.__ink();

      t('touchstart', 340, 430);
      for (let px = 10; px <= 260; px += 20) t('touchmove', 340 - px, 430);
      t('touchend', 80, 430);

      const out = [];
      for (let i = 0; i < 45; i++) {
        await new Promise(r => requestAnimationFrame(r));
        out.push(painted());
      }
      return out;
    });
    const blank = frames.filter(n => n < 55).length;
    check('no frame of the commit is empty', blank === 0,
      blank ? `${blank} near-empty frame(s) of ${frames.length}, min ${Math.min(...frames)}%`
            : `${frames.length} frames, min ${Math.min(...frames)}% covered`);
    check('and it still lands on the next tab', (await activeTab()) === 'nutrition');
    const left = await page.evaluate(() => document.querySelectorAll('.view.tab-pane').length);
    check('with the cover taken back off', left === 0, String(left));
  }

  console.log('\n=== 3d. swiping while scrolled down ===');
  {
    // The pane is absolutely positioned inside #main, so top:0 is the top of
    // the page, not of the screen. Scrolled down, it sat above the viewport
    // and the outgoing view slid off against nothing — the whole screen went
    // to 3% covered for sixteen frames. Every earlier check swiped from the
    // top, where the two happen to coincide, so none of them saw it.
    await seed();
    await warmAll();
    const worst = await page.evaluate(async () => {
      window.scrollTo(0, 900);
      await new Promise(r => setTimeout(r, 250));
      const t = (type, cx, cy) => {
        const target = document.elementFromPoint(cx, cy) || document.body;
        const tt = new Touch({ identifier: 6, target, clientX: cx, clientY: cy });
        target.dispatchEvent(new TouchEvent(type, { bubbles: true, cancelable: true,
          touches: type === 'touchend' ? [] : [tt], changedTouches: [tt],
          targetTouches: type === 'touchend' ? [] : [tt] }));
      };
      const covered = () => window.__ink();
      let low = 100;
      t('touchstart', 340, 430);
      for (let px = 20; px <= 260; px += 20) { t('touchmove', 340 - px, 430); low = Math.min(low, covered()); }
      t('touchend', 80, 430);
      for (let i = 0; i < 45; i++) {
        await new Promise(r => requestAnimationFrame(r));
        low = Math.min(low, covered());
      }
      return low;
    });
    check('the screen stays covered throughout', worst >= 55, `worst ${worst}% of the viewport`);
    check('and it lands on the next tab', (await activeTab()) === 'nutrition');
    check('with the page back at the top', await page.evaluate(() => window.scrollY) === 0,
      String(await page.evaluate(() => window.scrollY)));
  }

  console.log('\n=== 4. the ends of the row give, then stop ===');
  {
    await seed();
    await warmAll();
    check('on home, the first tab', (await activeTab()) === 'home');
    await swipe(140, { release: false });   // swipe right, nowhere to go
    const held = await page.evaluate(() => {
      const live = document.querySelector('#main .view:not(.tab-ghost)');
      const m = /translate3d\((-?[\d.]+)px/.exec(live ? live.style.transform : '');
      return { px: m ? Math.abs(Number(m[1])) : null,
               panes: document.querySelectorAll('.view.tab-pane').length };
    });
    check('it moves a little', held.px !== null && held.px > 0, held.px + 'px');
    check('but nowhere near the full 140', held.px !== null && held.px < 90, held.px + 'px');
    check('and no pane is brought in from nothing', held.panes === 0, String(held.panes));
    await page.evaluate(() => window.__t('touchend', 200, 420));
    await page.waitForTimeout(900);
    check('and it stays on home', (await activeTab()) === 'home');
  }

  console.log('\n=== 5. a write invalidates the snapshots ===');
  {
    await seed();
    await warmAll();
    // Nutrition has been visited, so a pane exists — until something is saved.
    await page.evaluate(async () => {
      await Storage.saveMeal({ id: 'fresh', date: U.todayISO(), name: 'New',
        section: 'snack', kcal: 210, protein: 20, carbs: 8, fat: 9 });
    });
    await swipe(-140, { release: false });
    const panes = await page.evaluate(() =>
      document.querySelectorAll('.view.tab-pane').length);
    check('a stale pane is never shown', panes === 0, String(panes));
    await page.evaluate(() => window.__t('touchend', 190, 420));
    await page.waitForTimeout(1200);
    // Falling back must still change the tab: the old swipe behaviour.
    check('but the swipe still works', (await activeTab()) === 'nutrition');
  }

  console.log('\n=== 6. a cold cache falls back rather than sticking ===');
  {
    await seed();     // no warmAll: nothing has ever been snapshotted
    await killOverlays();
    await swipe(-140);
    await page.waitForTimeout(1400);
    await killOverlays();
    check('the very first swipe of a session still switches tab',
      (await activeTab()) === 'nutrition');
  }

  console.log('\n=== 7. a vertical scroll is never stolen ===');
  {
    await seed();
    await warmAll();
    const before = await activeTab();
    // Mostly down, slightly across — a thumb scrolling a list. Sampled while
    // the finger is still down: checking only the outcome passes even when
    // the gesture was stolen, because a 30px drag does not reach the commit
    // line anyway. What matters is that no drag ever started.
    const during = await page.evaluate(() => {
      const t = (type, cx, cy) => {
        const touch = new Touch({ identifier: 2, target: document.body, clientX: cx, clientY: cy });
        document.body.dispatchEvent(new TouchEvent(type, { bubbles: true, cancelable: true,
          touches: type === 'touchend' ? [] : [touch], changedTouches: [touch],
          targetTouches: type === 'touchend' ? [] : [touch] }));
      };
      const main = document.querySelector('#main');
      let claimed = false;
      t('touchstart', 200, 600);
      for (let i = 1; i <= 10; i++) {
        t('touchmove', 200 - i * 3, 600 - i * 30);
        if (main.classList.contains('tab-anim') || document.querySelector('.view.tab-pane')) claimed = true;
      }
      t('touchend', 170, 300);
      return claimed;
    });
    check('a mostly-vertical drag is never claimed', !during, during ? 'the pager took it' : 'left alone');

    // A fast scroll-flick does not arrive as ten tidy steps: the browser
    // coalesces it into one big move. That single event clears the distance
    // threshold outright, so the only thing standing between it and a stolen
    // gesture is the dx-against-dy ratio.
    const coalesced = await page.evaluate(() => {
      const t = (type, cx, cy) => {
        const touch = new Touch({ identifier: 3, target: document.body, clientX: cx, clientY: cy });
        document.body.dispatchEvent(new TouchEvent(type, { bubbles: true, cancelable: true,
          touches: type === 'touchend' ? [] : [touch], changedTouches: [touch],
          targetTouches: type === 'touchend' ? [] : [touch] }));
      };
      const main = document.querySelector('#main');
      t('touchstart', 220, 640);
      t('touchmove', 180, 580);          // 40 across, 60 down, in one event
      const claimed = main.classList.contains('tab-anim') || !!document.querySelector('.view.tab-pane');
      t('touchend', 180, 580);
      return claimed;
    });
    check('nor is a single coalesced diagonal', !coalesced,
      coalesced ? 'the pager took it' : 'left alone');
    await page.waitForTimeout(700);
    await page.waitForTimeout(800);
    check('scrolling does not change tab', (await activeTab()) === before, before);
    const ghosts = await page.evaluate(() => document.querySelectorAll('.view.tab-pane').length);
    check('and leaves nothing behind', ghosts === 0, String(ghosts));
  }

  console.log('\n=== 8. an open sheet keeps the gesture ===');
  {
    await seed();
    await warmAll();
    const before = await activeTab();
    await page.evaluate(() => {
      const o = document.createElement('div');
      o.className = 'modal-overlay';
      o.style.cssText = 'position:fixed;inset:0;z-index:9999';
      document.body.appendChild(o);
    });
    await swipe(-160);
    await page.waitForTimeout(800);
    check('a swipe under a modal changes nothing', (await activeTab()) === before, before);
    await page.evaluate(() => document.querySelector('.modal-overlay').remove());
  }

  console.log('\n=== 9. dock taps still work alongside it ===');
  {
    await seed();
    await warmAll();
    await killOverlays();
    await page.evaluate(() => document.querySelector('[data-testid="dock-stats"]').click());
    await page.waitForTimeout(1200);
    await killOverlays();
    check('tapping a dock item still switches', (await activeTab()) === 'stats');
    const clean = await page.evaluate(() => ({
      ghosts: document.querySelectorAll('.view.tab-pane').length,
      anim: document.querySelector('#main').classList.contains('tab-anim')
    }));
    check('leaving nothing behind', clean.ghosts === 0 && !clean.anim,
      `${clean.ghosts} ghosts, anim=${clean.anim}`);
  }

  console.log('\n=== errors ===');
  console.log(errs.length ? errs.join('\n') : '   ERRORS: none');
  if (errs.length) fails += errs.length;

  await b.close();
  console.log(`\n${fails} failing checks`);
  process.exit(fails ? 1 : 0);
})();
