// The body-part dial on the start-a-workout screen.
//
// Picking an exercise is a two-level tree, and the first level — which body
// part — is the one people already hold in their heads spatially. The dial
// makes that level a direction instead of a target in a list.
//
// Two decisions here are load-bearing and both are easy to undo by accident:
//
//   * It opens on PRESS, not on a hold. Hold is the right price for a shortcut
//     nobody has to find; charging it for the primary path makes the app feel
//     slow and makes the menu invisible to anyone who was not told it exists.
//
//   * Only the first level is a radial. `legs` alone has 19 exercises, and a
//     radial tops out around eight before the labels start covering each
//     other, so the second level stays a wheel.
//
// Building it also surfaced a real bug in the shared radial layout, which
// section 3 now pins: the legibility check compared label-to-label and
// label-to-icon but never icon-to-icon. With four slices or fewer the labels —
// wider than the circles — always collided first, so the gap never showed. At
// seven spokes the circles overlap while the labels still clear, and `core`
// sat on top of `legs`, swallowing its taps.
//
//   node tests/dial.js   (needs `python3 -m http.server 8199` at the repo root)
const { chromium } = require('/opt/node22/lib/node_modules/playwright/index.js');

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
  page.on('pageerror', e => errs.push('PAGEERR: ' + e.message.slice(0, 160)));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load|net::/.test(m.text())) errs.push('con: ' + m.text().slice(0, 140)); });
  await page.route(/fonts\.googleapis\.com/, r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await page.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
  await page.waitForFunction(() => window.Storage && window.U);
  await page.evaluate(async () => {
    await Storage.clearAll();
    await Storage.setPref('onboarded', true);
    await Storage.setPref('warmupPrompt', false);
  });

  const openPicker = async () => {
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(1500);
    await page.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"],.splash').forEach(n => n.remove()));
    for (const t of ['hero-start-workout', 'hero-start-focus', 'empty-muscle-start-workout']) {
      const el = await page.$(`[data-testid="${t}"]`);
      if (el) { await el.click(); break; }
    }
    await page.waitForTimeout(2200);
    await page.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"]').forEach(n => n.remove()));
  };
  const dialAt = () => page.$eval('[data-testid="xpick-dial"]', e => {
    const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  const spokes = () => page.$$eval('.radial-slice', els => els.map(e => e.dataset.testid));
  const dismiss = () => page.evaluate(() => document.querySelectorAll('[data-testid="radial-overlay"]').forEach(n => n.remove()));

  await openPicker();

  // =============== 1. it opens on a press ==================================
  console.log('=== 1. the primary path does not cost a hold ===');
  {
    check('the dial is on the screen', !!(await page.$('[data-testid="xpick-dial"]')));
    check('and says what is open', (await page.textContent('[data-testid="xdial-label"]')) === 'Chest',
      await page.textContent('[data-testid="xdial-label"]'));

    const d = await dialAt();
    await page.mouse.move(d.x, d.y);
    await page.mouse.down();
    await page.waitForTimeout(120);   // well under RADIAL_HOLD_MS (420)
    const early = !!(await page.$('[data-testid="radial-overlay"]'));
    check('open in 120ms, not after a 420ms hold', early);
    // A press-to-open menu must stay up when the thumb lifts without aiming,
    // or the gesture is a hold again by another name.
    await page.mouse.up();
    await page.waitForTimeout(250);
    check('and stays up when the thumb lifts', !!(await page.$('[data-testid="radial-overlay"]')));

    const s = await spokes();
    check('six body parts and a way to the rest', s.length === 7, s.join(','));
    check('and they are body parts, not categories',
      ['chest', 'back', 'shoulders', 'arms', 'legs', 'core'].every(k => s.includes(`radial-cat-${k}`)), s.join(','));
    // Mobility is not a body part; nine equal spokes is past what a radial can
    // label, so it belongs behind "More".
    check('mobility is not among them', !s.includes('radial-cat-mobility'), s.join(','));
  }

  // =============== 2. every spoke goes somewhere =============================
  console.log('\n=== 2. each spoke lands on its category ===');
  {
    await page.click('[data-testid="radial-cat-legs"]');
    await page.waitForTimeout(700);
    check('picking Legs opens Legs', (await page.textContent('[data-testid="xdial-label"]')) === 'Legs',
      await page.textContent('[data-testid="xdial-label"]'));
    check('and the card underneath followed', await page.evaluate(() => {
      const p = document.querySelector('.xpick-pager');
      const panel = p && p.querySelector('.xpick-panel[data-cat="legs"]');
      if (!panel) return false;
      return Math.abs(panel.offsetLeft - p.scrollLeft) < 40;
    }));

    // Second level: the things that are not body parts, plus a way back.
    const d = await dialAt();
    await page.mouse.move(d.x, d.y); await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up();
    await page.waitForTimeout(200);
    await page.click('[data-testid="radial-cat-more"]');
    await page.waitForTimeout(400);
    const s2 = await spokes();
    check('"More" opens a second wheel', s2.length > 1, s2.join(','));
    check('holding what is not a body part', s2.includes('radial-cat-mobility') && s2.includes('radial-cat-cardio'), s2.join(','));
    check('with a way back to the first', s2.includes('radial-cat-back'), s2.join(','));
    await page.click('[data-testid="radial-cat-mobility"]');
    await page.waitForTimeout(700);
    check('and it lands too', (await page.textContent('[data-testid="xdial-label"]')) === 'Mobility',
      await page.textContent('[data-testid="xdial-label"]'));

    // Going back to the top level must not leave the dial stuck on level two.
    const d2 = await dialAt();
    await page.mouse.move(d2.x, d2.y); await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up();
    await page.waitForTimeout(250);
    check('the next press is the body parts again, not where you left off',
      (await spokes()).includes('radial-cat-chest'), (await spokes()).join(','));
    await dismiss();
  }

  // =============== 3. seven spokes do not sit on each other =================
  //
  // The bug this found. Every slice must be hit-testable at its own centre —
  // a menu whose entries cover each other is worse than a list.
  console.log('\n=== 3. no slice covers another ===');
  {
    const d = await dialAt();
    await page.mouse.move(d.x, d.y); await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up();
    await page.waitForTimeout(300);

    const geom = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('.radial-slice').forEach(e => {
        const r = e.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        // The icon circle, which is what a thumb actually aims at.
        const ic = e.querySelector('.radial-slice-ic').getBoundingClientRect();
        const hit = document.elementFromPoint(ic.left + ic.width / 2, ic.top + ic.height / 2);
        out.push({
          id: e.dataset.testid,
          icon: { l: ic.left, r: ic.right, t: ic.top, b: ic.bottom },
          box: { l: r.left, r: r.right, t: r.top, b: r.bottom },
          cx, cy,
          mine: !!(hit && hit.closest('.radial-slice') === e)
        });
      });
      return { out, vw: window.innerWidth, vh: window.innerHeight };
    });

    // Compared as circles, because that is what they are. Slices on an arc sit
    // diagonally from each other, so two comfortably separated circles still
    // have bounding boxes that clip corners — an AABB test here rejects
    // layouts that are visually fine and never converges.
    const overlapping = [];
    for (let i = 0; i < geom.out.length; i++) {
      for (let j = i + 1; j < geom.out.length; j++) {
        const a = geom.out[i], z = geom.out[j];
        const d = Math.hypot((a.icon.l + a.icon.r) / 2 - (z.icon.l + z.icon.r) / 2,
                             (a.icon.t + a.icon.b) / 2 - (z.icon.t + z.icon.b) / 2);
        const need = (a.icon.r - a.icon.l + z.icon.r - z.icon.l) / 2;
        if (d < need) overlapping.push(`${a.id}/${z.id} ${Math.round(d)}<${Math.round(need)}`);
      }
    }
    check('no two icons overlap', overlapping.length === 0, overlapping.join(', '));
    // Seven at full size cannot fit; the wheel is expected to have asked for
    // compact slices rather than degrading into a row of overlapping circles.
    const dia = Math.round(geom.out[0].icon.r - geom.out[0].icon.l);
    check('the slices shrank to fit instead of piling up', dia === 48 && dia >= 44, `${dia}px`);

    const stolen = geom.out.filter(s => !s.mine).map(s => s.id);
    check('every spoke is hit-testable at its own centre', stolen.length === 0, stolen.join(', '));

    const off = geom.out.filter(s => s.box.t < 0 || s.box.b > geom.vh || s.box.l < 0 || s.box.r > geom.vw).map(s => s.id);
    check('and none of them is off the screen', off.length === 0, off.join(', '));

    // The dial sits near the top, so the only arc that fits is downward. That
    // branch existed, was removed as unreachable, and is now reachable again.
    const above = geom.out.filter(s => s.cy < 0).length;
    check('the arc opened somewhere it fits', above === 0 && geom.out.length === 7,
      `${geom.out.length} spokes, ${above} above the viewport`);
    await dismiss();
  }

  // =============== 4. the kit filter ========================================
  console.log('\n=== 4. filtering by what you can get to ===');
  {
    await page.evaluate(() => {
      const p = document.querySelector('.xpick-pager');
      const panel = p.querySelector('.xpick-panel[data-cat="chest"]');
      if (panel) p.scrollLeft = panel.offsetLeft;
    });
    await page.waitForTimeout(500);
    const countRows = () => page.evaluate(() => {
      const p = document.querySelector('.xpick-pager');
      const panel = p.querySelector('.xpick-panel[data-cat="chest"]');
      return panel ? panel.querySelectorAll('.xrow').length : -1;
    });
    const all = await countRows();
    check('chest has exercises to start with', all > 3, String(all));

    await page.click('[data-testid="xgear-barbell"]');
    await page.waitForTimeout(600);
    const barbell = await countRows();
    check('picking Barbell narrows the list', barbell > 0 && barbell < all, `${barbell} of ${all}`);
    check('and every survivor is a barbell exercise', await page.evaluate(() => {
      const panel = document.querySelector('.xpick-panel[data-cat="chest"]');
      return [...panel.querySelectorAll('.xrow-equip')].every(e => /barbell/i.test(e.textContent));
    }));
    check('the dial recounts against the filter', /\d+ exercises/.test(await page.textContent('[data-testid="xpick-dial"]')),
      await page.textContent('[data-testid="xpick-dial"]'));

    await page.click('[data-testid="xgear-barbell"]');
    await page.waitForTimeout(600);
    check('tapping it again clears it', (await countRows()) === all, `${await countRows()} vs ${all}`);

    // A filter that empties a category must say so rather than showing a void.
    await page.click('[data-testid="xgear-jump-rope"]');
    await page.waitForTimeout(600);
    check('an empty result explains itself', await page.evaluate(() => {
      const panel = document.querySelector('.xpick-panel[data-cat="chest"]');
      return !panel.querySelector('.xrow') && /only that kit/.test(panel.textContent);
    }));
    await page.click('[data-testid="xgear-jump-rope"]');
    await page.waitForTimeout(500);
  }

  // =============== 5. the flat way across is still there ====================
  //
  // "The ability to navigate to other body parts and categories is essential."
  // The dial is one way; it must not have eaten the others.
  console.log('\n=== 5. the dial did not replace the other ways across ===');
  {
    check('the category chips are still there', (await page.$$('.xpick-chip')).length > 3,
      String((await page.$$('.xpick-chip')).length));
    await page.click('[data-testid="xchip-back"]');
    await page.waitForTimeout(700);
    check('and still work', (await page.textContent('[data-testid="xdial-label"]')) === 'Back',
      await page.textContent('[data-testid="xdial-label"]'));

    await page.fill('.xpick input.input', 'squat');
    await page.waitForTimeout(500);
    check('search still spans every category', (await page.$$('.xpick-section')).length >= 1,
      String((await page.$$('.xpick-section')).length));
    check('and the dial steps aside, having nothing to say about a search',
      await page.$eval('[data-testid="xpick-dial"]', e => getComputedStyle(e).display === 'none'));
    await page.fill('.xpick input.input', '');
    await page.waitForTimeout(500);
    check('and comes back', await page.$eval('[data-testid="xpick-dial"]', e => getComputedStyle(e).display !== 'none'));
  }

  // =============== 6. it is a real target ===================================
  console.log('\n=== 6. size ===');
  {
    const g = await page.$eval('[data-testid="xpick-dial"]', e => {
      const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) };
    });
    check('the dial is a comfortable target', g.h >= 56 && g.w >= 200, `${g.w}×${g.h}`);
    const chip = await page.$eval('.xgear-chip', e => Math.round(e.getBoundingClientRect().height));
    check('kit chips are tappable', chip >= 28, `${chip}px`);
    const wide = await page.evaluate(() => {
      const bad = [];
      document.querySelectorAll('.xpick > *').forEach(e => {
        const r = e.getBoundingClientRect();
        if (r.width && (r.left < -1 || r.right > window.innerWidth + 1)) bad.push(e.className);
      });
      return bad;
    });
    check('nothing in the picker overflows the screen', wide.length === 0, wide.join(' | '));
  }

  console.log('\nERRORS:', errs.length ? errs : 'none');
  console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
