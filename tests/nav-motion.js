// Navigation motion: the spring-driven tab switch, the loader that used to
// play on top of it, and dragging a sheet away.
//
// These three shipped together because they are one layer — moving between
// places in the app — and because two of them were only visible as a defect
// when the third was looked at closely.
//
//   node tests/nav-motion.js   (needs `python3 -m http.server 8199` at the repo root)
const { chromium } = require('/opt/node22/lib/node_modules/playwright/index.js');
const fs = require('fs');
const path = require('path');

let fails = 0;
const check = (label, ok, detail = '') => {
  if (!ok) fails++;
  console.log(`   ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
};

const SRC = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
const INK = require('./ink.js');

// stepSpring lives inside the app's IIFE, so reach it the way the strength
// standards suite reaches its tables: lift the source and evaluate it.
function liftSpring() {
  const m = SRC.match(/function stepSpring\(s, k, c, dt\) \{[\s\S]*?\n  \}/);
  if (!m) throw new Error('stepSpring not found in app.js');
  // eslint-disable-next-line no-new-func
  return new Function(`${m[0]}; return stepSpring;`)();
}

// Read the constants the app actually ships rather than restating them here.
// Stated twice, a softer spring could be dropped into app.js and this suite
// would go on measuring the numbers it wanted to be true.
function liftDecision() {
  const m = SRC.match(/function shouldDismissSheet\(vel, far, open\) \{[\s\S]*?\n  \}/);
  if (!m) throw new Error('shouldDismissSheet not found in app.js');
  // eslint-disable-next-line no-new-func
  return new Function(`${m[0]}; return shouldDismissSheet;`)();
}

function liftTabConstants() {
  const m = SRC.match(/const TAB_SPRING_K = (\d+), TAB_SPRING_C = (\d+);/);
  if (!m) throw new Error('TAB_SPRING_K/C not found in app.js');
  return { k: Number(m[1]), c: Number(m[2]) };
}

(async () => {
  console.log('=== 1. the integrator itself ===');
  {
    const stepSpring = liftSpring();
    const settle = (k, c, fps) => {
      const s = { v: 0, target: 1, vel: 0 };
      let ms = 0, to99 = null;
      while (stepSpring(s, k, c, 1 / fps) && ms < 5000) {
        ms += 1000 / fps;
        if (to99 === null && s.v >= 0.99) to99 = ms;
      }
      return { ms, to99 };
    };

    const { k: K, c: C } = liftTabConstants();
    console.log(`    (app ships k${K} c${C})`);
    const at60 = settle(K, C, 60);
    check('it settles rather than running forever', at60.ms < 1000, `${Math.round(at60.ms)}ms`);

    // The whole argument for these constants: a spring is judged by when it
    // arrives, and this one has to arrive no later than the 280ms transition
    // it replaces. A softer spring is the easy mistake and it reads as lag.
    check('and arrives within a frame of the 280ms it replaced',
      at60.to99 <= 300, `99% at ${Math.round(at60.to99)}ms`);

    // Fixed substeps are the reason for the inner while loop. Without them a
    // slow device integrates fewer times and the same move takes longer.
    const at30 = settle(K, C, 30);
    const at120 = settle(K, C, 120);
    const spread = Math.max(at30.ms, at120.ms, at60.ms) - Math.min(at30.ms, at120.ms, at60.ms);
    check('and takes the same time at 30, 60 and 120fps', spread <= 40,
      `${Math.round(at30.ms)} / ${Math.round(at60.ms)} / ${Math.round(at120.ms)}ms`);

    // A tab that was hidden for a minute must not integrate a minute of
    // physics on the first frame back.
    const s = { v: 0, target: 1, vel: 0 };
    stepSpring(s, K, C, 0.05);
    check('a long stall cannot blow it up', Number.isFinite(s.v) && Math.abs(s.v) < 2,
      `v=${s.v.toFixed(3)}`);
  }

  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', hasTouch: true });
  const page = await c.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERR: ' + e.message.slice(0, 160)));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load|net::/.test(m.text())) errs.push('con: ' + m.text().slice(0, 140)); });
  await page.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
  await page.waitForFunction(() => window.Storage && window.U);

  const reset = async (opts = {}) => {
    await page.evaluate(async (o) => {
      await Storage.clearAll();
      await Storage.setPref('onboarded', true);
      await Storage.setPref('warmupPrompt', false);
      // The past-day list only exists once there are days to list, and that
      // list is the shortest route to a draggable sheet.
      if (o.meals) {
        for (let i = 0; i < 4; i++) {
          const d = new Date(); d.setDate(d.getDate() - i);
          await Storage.saveMeal({ id: 'nm' + i, date: U.todayISO(d), name: 'Meal ' + i,
            section: 'lunch', kcal: 600, protein: 40, carbs: 60, fat: 20 });
        }
      }
    }, opts);
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(1600);
    await page.evaluate(() => document.querySelectorAll('.splash').forEach(n => n.remove()));
  };

  // Tab loaders are once per session, so burn them off when the test is about
  // the slide rather than about the loader.
  // Some dock buttons open a fork panel rather than switching tab, and a
  // panel left up swallows the next click — which is what this looked like
  // the first time, a timeout that read as a broken transition.
  const clearOverlays = () => page.evaluate(() => {
    document.querySelectorAll('.qa-fork-overlay, .modal-overlay, .wsheet-overlay, .radial-overlay')
      .forEach(n => n.remove());
  });

  const burnLoaders = async () => {
    for (const t of ['dock-nutrition', 'dock-stats', 'dock-library', 'dock-home']) {
      await clearOverlays();
      await page.click(`[data-testid="${t}"]`).catch(() => {});
      await page.waitForTimeout(300);
      await page.evaluate(() => {
        const l = document.querySelector('[data-testid="tab-loader"]');
        if (l) l.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      });
      await page.waitForTimeout(600);
    }
    await clearOverlays();
    // Land somewhere neutral so each section starts from the same place.
    await page.evaluate(() => document.querySelector('[data-testid="dock-home"]').click());
    await page.waitForTimeout(700);
  };

  console.log('\n=== 2. the loader no longer plays over the slide ===');
  {
    await reset();
    // Watch for both at once on a genuinely first visit.
    const seen = await page.evaluate(async () => {
      const out = { ghost: false, loader: false };
      const stop = Date.now() + 1200;
      const io = setInterval(() => {
        if (document.querySelector('.view.tab-ghost')) out.ghost = true;
        if (document.querySelector('[data-testid="tab-loader"]')) out.loader = true;
      }, 16);
      document.querySelector('[data-testid="dock-nutrition"]').click();
      await new Promise(r => setTimeout(r, stop - Date.now()));
      clearInterval(io);
      return out;
    });
    check('a first visit still plays its loader', seen.loader);
    check('and does not slide a ghost underneath it', !seen.ghost,
      seen.ghost ? 'both ran at once' : 'loader only');
  }

  console.log('\n=== 3. a normal switch still slides ===');
  {
    await reset();
    await burnLoaders();
    const r = await page.evaluate(async () => {
      let ghost = false, loader = false;
      const io = setInterval(() => {
        if (document.querySelector('.view.tab-ghost')) ghost = true;
        if (document.querySelector('[data-testid="tab-loader"]')) loader = true;
      }, 16);
      document.querySelector('[data-testid="dock-nutrition"]').click();
      await new Promise(r2 => setTimeout(r2, 700));
      clearInterval(io);
      return { ghost, loader, anim: document.querySelector('#main').classList.contains('tab-anim') };
    });
    check('the second visit slides', r.ghost);
    check('with no loader competing for the moment', !r.loader);
    check('and the transition class is cleaned up afterwards', !r.anim);
  }

  console.log('\n=== 4. it cleans up after itself ===');
  {
    await reset();
    await burnLoaders();
    await page.click('[data-testid="dock-nutrition"]');
    await page.waitForTimeout(900);
    const after = await page.evaluate(() => ({
      ghosts: document.querySelectorAll('.view.tab-ghost').length,
      anim: document.querySelector('#main').classList.contains('tab-anim'),
      transform: (document.querySelector('#main .view') || {}).style?.transform || '',
      willChange: (document.querySelector('#main .view') || {}).style?.willChange || ''
    }));
    check('no ghost is left behind', after.ghosts === 0, String(after.ghosts));
    check('the view keeps no inline transform', !after.transform, after.transform || 'clean');
    check('and no stale will-change', !after.willChange, after.willChange || 'clean');
  }

  console.log('\n=== 5. interrupting a switch does not strand the screen ===');
  {
    await reset();
    await burnLoaders();
    // Three switches inside the settle window of the first.
    await page.evaluate(async () => {
      const tap = (t) => document.querySelector(`[data-testid="${t}"]`).click();
      tap('dock-nutrition');
      await new Promise(r => setTimeout(r, 60));
      tap('dock-stats');
      await new Promise(r => setTimeout(r, 60));
      tap('dock-home');
    });
    await page.waitForTimeout(1500);
    const s = await page.evaluate(() => ({
      ghosts: document.querySelectorAll('.view.tab-ghost').length,
      views: document.querySelectorAll('#main .view').length,
      anim: document.querySelector('#main').classList.contains('tab-anim'),
      transform: (document.querySelector('#main .view') || {}).style?.transform || ''
    }));
    check('exactly one view survives', s.views === 1, String(s.views));
    check('no ghosts pile up', s.ghosts === 0, String(s.ghosts));
    check('the screen is not left mid-slide', !s.transform, s.transform || 'clean');
    check('and nothing is still marked animating', !s.anim);
  }

  console.log('\n=== 6. a hidden page settles instead of freezing ===');
  {
    await reset();
    await burnLoaders();
    // Start a switch, then hide the page mid-flight. Without the
    // visibilitychange settle the spring stops where it is, because a hidden
    // page is given no animation frames at all.
    const r = await page.evaluate(async () => {
      document.querySelector('[data-testid="dock-nutrition"]').click();
      // Poll for the in-flight ghost rather than sampling one instant: under
      // suite load the switch can start a frame or two late, and a single
      // 50ms snapshot flaked on exactly that.
      let mid = false;
      for (let i = 0; i < 30 && !mid; i++) {
        await new Promise(res => setTimeout(res, 10));
        mid = !!document.querySelector('.view.tab-ghost');
      }
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      document.dispatchEvent(new Event('visibilitychange'));
      await new Promise(res => setTimeout(res, 60));
      const v = document.querySelector('#main .view');
      return { mid, ghosts: document.querySelectorAll('.view.tab-ghost').length,
               transform: v ? v.style.transform : 'no view' };
    });
    check('the switch was genuinely in flight', r.mid);
    check('hiding the page finishes it', r.ghosts === 0, String(r.ghosts));
    check('and leaves the destination square on screen', !r.transform, r.transform || 'clean');
  }

  // The day picker is the shortest real route to one of the three sheets that
  // were wired up: Nutrition → Past days → Another day.
  const openASheet = async () => {
    await clearOverlays();
    await page.evaluate(() => document.querySelector('[data-testid="dock-nutrition"]').click());
    await page.waitForTimeout(400);
    await page.evaluate(() => {
      const l = document.querySelector('[data-testid="tab-loader"]');
      if (l) l.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    });
    await page.waitForTimeout(900);
    // The past-day list lives on the last panel of the nutrition pager.
    await page.evaluate(() => {
      const pager = document.querySelector('.npager');
      if (!pager || !pager.children.length) return;
      pager.scrollTo({ top: pager.children[pager.children.length - 1].offsetTop });
    });
    await page.waitForTimeout(700);
    const pick = await page.$('[data-testid="past-day-pick"]');
    if (!pick) return false;
    await pick.scrollIntoViewIfNeeded();
    await pick.click();
    await page.waitForTimeout(600);
    return !!(await page.$('.wsheet-overlay'));
  };

  const gripBox = async () => {
    const grip = await page.$('.wsheet-overlay [data-testid="sheet-grip"]');
    return grip ? grip.boundingBox() : null;
  };

  console.log('\n=== 7. sheets can be dragged away ===');
  {
    await reset({ meals: true });
    await burnLoaders();
    check('a sheet is open to test against', await openASheet());

    const box = await gripBox();
    check('it has a grab handle', !!box);

    if (box) {
      const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
      const before = await page.evaluate(() => document.querySelectorAll('.wsheet-overlay').length);
      await page.mouse.move(cx, cy);
      await page.mouse.down();
      // Follow the finger: the sheet must move while it is held, not only on
      // release, or this is just a fancy close button.
      await page.mouse.move(cx, cy + 60);
      await page.waitForTimeout(30);
      const held = await page.evaluate(() => ({
        transform: (document.querySelector('.wsheet-overlay .wsheet') || {}).style?.transform || '',
        // The scrim is the sheet's overlay parent. Looked up as a previous
        // sibling — which is what the original code did — this is simply null
        // and the backdrop never reacts to the drag at all.
        scrim: (document.querySelector('.wsheet-overlay') || {}).style?.opacity || ''
      }));
      check('the sheet tracks the finger while held', /translate3d/.test(held.transform),
        held.transform || 'no transform');
      check('and the scrim fades with it', held.scrim !== '' && Number(held.scrim) < 0.95,
        held.scrim === '' ? 'scrim never touched' : held.scrim);

      for (let i = 2; i <= 6; i++) {
        await page.mouse.move(cx, cy + i * 45);
        await page.waitForTimeout(16);
      }
      await page.mouse.up();
      await page.waitForTimeout(1000);
      const after = await page.evaluate(() => document.querySelectorAll('.wsheet-overlay').length);
      check('and a downward flick dismisses it', after < before, `${before} → ${after}`);
    }
  }

  console.log('\n=== 8. a small drag springs back rather than closing ===');
  {
    await reset({ meals: true });
    await burnLoaders();
    if (!(await openASheet())) {
      check('a sheet is open for the spring-back check', false);
    } else {
      const box = await gripBox();
      check('a sheet is open for the spring-back check', !!box);
      if (box) {
        const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
        await page.mouse.move(cx, cy);
        await page.mouse.down();
        await page.mouse.move(cx, cy + 12);
        await page.waitForTimeout(60);
        await page.mouse.up();
        await page.waitForTimeout(1000);
        const state = await page.evaluate(() => {
          const o = document.querySelector('.wsheet-overlay');
          if (!o) return { open: false };
          const s = o.querySelector('.wsheet');
          return { open: true, transform: s ? s.style.transform : '?', op: o.style.opacity };
        });
        check('a 12px nudge leaves the sheet open', state.open);
        check('and returns it exactly to its resting place',
          state.open && !state.transform, state.transform || 'clean');
        check('with the scrim back to full strength', state.open && !state.op,
          state.op || 'clean');
      }
    }
  }

  console.log('\n=== 9. a fast twitch is not a flick ===');
  {
    // Speed alone cannot separate a decisive flick from a thumb slipping, and
    // a coalesced pointer event can report an absurd instantaneous velocity.
    // This drags fast but barely moves: it must spring back.
    await reset({ meals: true });
    await burnLoaders();
    if (!(await openASheet())) {
      check('a sheet is open for the twitch check', false);
    } else {
      const box = await gripBox();
      check('a sheet is open for the twitch check', !!box);
      if (box) {
        const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
        // 21px in three back-to-back moves. Deliberately tuned to clear the
        // velocity threshold while staying under the distance floor, because
        // that is the only shape where the two rules disagree — a gentler
        // drag is caught by the smoothing alone and proves nothing.
        await page.mouse.move(cx, cy);
        await page.mouse.down();
        for (let i = 1; i <= 3; i++) await page.mouse.move(cx, cy + i * 7);
        await page.mouse.up();
        await page.waitForTimeout(900);
        const open = await page.evaluate(() => !!document.querySelector('.wsheet-overlay'));
        check('21px moved fast leaves the sheet open', open);
      }
    }

    // Driving this through a real pointer can only reach the cases the
    // browser's own event coalescing happens to produce, and the two rules
    // disagree in a window too narrow to hit that way. Test the decision
    // where it is actually decided.
    const decide = liftDecision();
    check('a committed flick dismisses', decide(1.2, 60, 0.8) === true);
    check('a slow drag most of the way down dismisses', decide(0.1, 200, 0.4) === true);
    check('a fast flick that barely moved does not', decide(1.2, 12, 0.96) === false,
      'speed without travel is a slipped thumb');
    check('a long slow drag that stayed near the top does not', decide(0.1, 30, 0.9) === false);
    check('an absurd coalesced velocity still needs travel', decide(40, 8, 0.97) === false);
    check('and the boundary is inclusive at 24px', decide(0.6, 24, 0.9) === true);
  }

  console.log('\n=== 10. the drag listeners do not accumulate ===');
  {
    // makeDismissible originally hung pointermove/pointerup on window with no
    // removal. Sheets here are built and discarded constantly, so that leaks
    // one pair per open. Pointer capture on the grip means the listeners die
    // with the element.
    await reset({ meals: true });
    await burnLoaders();
    await page.evaluate(() => {
      window.__pmAdded = 0;
      window.__origAdd = window.addEventListener;
      window.addEventListener = function (type, ...rest) {
        if (type === 'pointermove' || type === 'pointerup') window.__pmAdded++;
        return window.__origAdd.call(this, type, ...rest);
      };
    });

    const cycle = async (n) => {
      for (let i = 0; i < n; i++) {
        await openASheet();
        await page.evaluate(() => {
          const o = document.querySelector('.wsheet-overlay');
          if (o) o.remove();
        });
      }
      return page.evaluate(() => window.__pmAdded);
    };

    // Measured as growth, not as an absolute: Playwright's own hit-target
    // interceptor puts one pointerup on window, and counting that as a leak
    // is how the first version of this check failed on correct code.
    const afterOne = await cycle(1);
    const afterFour = await cycle(3);
    await page.evaluate(() => { window.addEventListener = window.__origAdd; });
    check('three more sheets add no further window pointer listeners',
      afterFour === afterOne, `${afterOne} → ${afterFour}`);
  }

  console.log('\n=== 10b. no route into a tab blanks the screen ===');
  {
    // The pager covers a swipe when it holds a pane. Everything else — a dock
    // tap, and a swipe whose pane a write has just invalidated — goes through
    // animateTabSwitch, and that path blanked for exactly the same reason:
    // during a change #main holds an absolutely-positioned ghost and an empty
    // new view, so it measures zero and `overflow: hidden` clips the ghost
    // away. Only the pager route was ever covered, which is why this survived
    // three rounds of fixing the flash.
    await reset({ meals: true });
    await burnLoaders();
    await page.evaluate(INK);

    const worstDuring = async (label, body) => {
      await clearOverlays();
      const low = await page.evaluate(async (src) => {
        let low = 100, stop = false;
        const tick = () => { if (!stop) { low = Math.min(low, window.__ink()); requestAnimationFrame(tick); } };
        requestAnimationFrame(tick);
        await eval('(' + src + ')()');
        await new Promise(r => setTimeout(r, 1400));
        stop = true;
        return low;
      }, body.toString());
      check(label, low >= 55, `worst ${low}% of the screen`);
      await page.evaluate(() => document.querySelector('[data-testid="dock-home"]').click());
      await page.waitForTimeout(1200);
      await clearOverlays();
    };

    const swipeSrc = async () => {
      const t = (type, cx, cy) => {
        const tg = document.elementFromPoint(cx, cy) || document.body;
        const tt = new Touch({ identifier: 9, target: tg, clientX: cx, clientY: cy });
        tg.dispatchEvent(new TouchEvent(type, { bubbles: true, cancelable: true,
          touches: type === 'touchend' ? [] : [tt], changedTouches: [tt],
          targetTouches: type === 'touchend' ? [] : [tt] }));
      };
      t('touchstart', 340, 430);
      for (let px = 20; px <= 260; px += 20) t('touchmove', 340 - px, 430);
      t('touchend', 80, 430);
      await new Promise(r => setTimeout(r, 100));
    };

    await worstDuring('a dock tap from the top', async () => {
      window.scrollTo(0, 0);
      document.querySelector('[data-testid="dock-nutrition"]').click();
    });
    await worstDuring('a dock tap while scrolled down', async () => {
      window.scrollTo(0, 900);
      await new Promise(r => setTimeout(r, 200));
      document.querySelector('[data-testid="dock-nutrition"]').click();
    });
    await worstDuring('a swipe the pager can serve', swipeSrc);
    await worstDuring('a swipe a write has just invalidated', async () => {
      window.scrollTo(0, 0);
      await Storage.saveMeal({ id: 'inval', date: U.todayISO(), name: 'x', section: 'snack', kcal: 10 });
      const t = (type, cx, cy) => {
        const tg = document.elementFromPoint(cx, cy) || document.body;
        const tt = new Touch({ identifier: 9, target: tg, clientX: cx, clientY: cy });
        tg.dispatchEvent(new TouchEvent(type, { bubbles: true, cancelable: true,
          touches: type === 'touchend' ? [] : [tt], changedTouches: [tt],
          targetTouches: type === 'touchend' ? [] : [tt] }));
      };
      t('touchstart', 340, 430);
      for (let px = 20; px <= 260; px += 20) t('touchmove', 340 - px, 430);
      t('touchend', 80, 430);
      await new Promise(r => setTimeout(r, 100));
    });
  }

  console.log('\n=== 10c. a slow device still never blanks ===');
  {
    // min-height alone fixes this machine; the wait for content only earns
    // its place on a slower one, where the render outlasts the slide. Without
    // throttling, removing the wait changes nothing measurable — so this is
    // the check that stops it being deleted as dead code.
    const slow = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', hasTouch: true });
    const sp = await slow.newPage();
    const cdp = await slow.newCDPSession(sp);
    await sp.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
    await sp.waitForFunction(() => window.Storage && window.U);
    await sp.evaluate(async () => {
      await Storage.clearAll();
      await Storage.setPref('onboarded', true);
      // Enough history that a render is real work rather than an empty list.
      for (let i = 0; i < 40; i++) {
        const d = new Date(); d.setDate(d.getDate() - i);
        await Storage.saveWorkout({ id: 'sw' + i, name: 'Push', date: U.todayISO(d), startedAt: d.getTime(),
          completedAt: d.getTime() + 3.5e6, durationSec: 3400,
          exercises: [{ exerciseId: 'bench-press-barbell', name: 'Bench', type: 'weighted',
            sets: [{ weight: 80, reps: 8, done: true }] }] });
        await Storage.saveMeal({ id: 'sm' + i, date: U.todayISO(d), name: 'Meal',
          section: 'lunch', kcal: 600, protein: 40, carbs: 60, fat: 20 });
      }
    });
    await sp.reload({ waitUntil: 'load' });
    await sp.waitForTimeout(2500);
    await sp.evaluate(() => document.querySelectorAll('.splash').forEach(n => n.remove()));
    await sp.evaluate(INK);
    const killSlow = () => sp.evaluate(() => document.querySelectorAll(
      '.qa-fork-overlay,.modal-overlay,.wsheet-overlay,[data-testid="tab-loader"]').forEach(n => n.remove()));
    for (const t of ['home', 'nutrition', 'stats', 'library', 'home']) {
      await killSlow();
      await sp.evaluate((id) => document.querySelector(`[data-testid="dock-${id}"]`).click(), t);
      await sp.waitForTimeout(1400);
      await killSlow();
      await sp.waitForTimeout(300);
    }
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
    await sp.waitForTimeout(500);
    const low = await sp.evaluate(async () => {
      let low = 100, stop = false;
      const tick = () => { if (!stop) { low = Math.min(low, window.__ink()); requestAnimationFrame(tick); } };
      requestAnimationFrame(tick);
      window.scrollTo(0, 0);
      document.querySelector('[data-testid="dock-nutrition"]').click();
      await new Promise(r => setTimeout(r, 2500));
      stop = true;
      return low;
    });
    check('a tab change at 6x CPU throttle keeps the screen', low >= 70,
      `worst ${low}% of the screen`);
    await slow.close();
  }

  console.log('\n=== 11. reduced motion ===');
  {
    await c.close();
    const c2 = await b.newContext({
      viewport: { width: 390, height: 844 }, serviceWorkers: 'block',
      hasTouch: true, reducedMotion: 'reduce'
    });
    const p2 = await c2.newPage();
    await p2.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
    await p2.waitForFunction(() => window.Storage && window.U);
    await p2.evaluate(async () => {
      await Storage.clearAll();
      await Storage.setPref('onboarded', true);
    });
    await p2.reload({ waitUntil: 'load' });
    await p2.waitForTimeout(1600);
    await p2.evaluate(() => document.querySelectorAll('.splash').forEach(n => n.remove()));

    const r = await p2.evaluate(async () => {
      let ghost = false;
      const io = setInterval(() => { if (document.querySelector('.view.tab-ghost')) ghost = true; }, 16);
      document.querySelector('[data-testid="dock-nutrition"]').click();
      await new Promise(res => setTimeout(res, 500));
      clearInterval(io);
      return ghost;
    });
    check('no slide when the OS asks for less motion', !r);
    await c2.close();
  }

  console.log('\n=== errors ===');
  console.log(errs.length ? errs.join('\n') : '   ERRORS: none');
  if (errs.length) fails += errs.length;

  await b.close();
  console.log(`\n${fails} failing checks`);
  process.exit(fails ? 1 : 0);
})();
