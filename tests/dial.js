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
    // empty-muscle-start-workout now lives inside the folded Trends
    // chapter; the planner pitch's own picker link is the visible route.
    for (const t of ['hero-start-workout', 'hero-start-focus', 'hero-just-start', 'empty-muscle-start-workout']) {
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
    // This asked for 48px, and was right to while the menu was an arc: seven
    // full-size slices could not fit into the angle above the trigger, so the
    // wheel asking to be compact was the thing standing between it and a row
    // of overlapping circles.
    //
    // A ring removed that constraint rather than working around it. Seven 64px
    // slices need a radius of about 90 and there is 135 to spend, so the menu
    // now restores full size even though it still asks for compact — which is
    // the arc fallback's setting, and still applies there.
    const dia = Math.round(geom.out[0].icon.r - geom.out[0].icon.l);
    const isRing = await page.evaluate(() =>
      !!document.querySelector('[data-testid="radial-overlay"].radial-ring'));
    check('the slices are as big as the layout can afford',
      isRing ? dia === 64 : (dia === 48 && dia >= 44),
      `${dia}px on ${isRing ? 'a ring' : 'an arc'}`);

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

  // =============== 5. the ways across, without the chip row =================
  //
  // "The ability to navigate to other body parts and categories is essential."
  // The chip row is dropped below 560px because it and the dial do the same
  // job and it cost 57px of a screen with none to spare — so the ways that
  // remain have to actually work, and the row has to come back where there is
  // room for it.
  console.log('\n=== 5. dropping the chips on phones left three ways across ===');
  {
    check('the chip row is gone on a phone',
      await page.$eval('[data-testid="xpick-chips"]', e => getComputedStyle(e).display === 'none'));
    // It carried "create your own", which must not have gone with it.
    check('and "create your own" survived the cut', !!(await page.$('.xdial-custom')));
    check('without being duplicated', (await page.$$('[data-testid="xchip-custom"]')).length === 1,
      String((await page.$$('[data-testid="xchip-custom"]')).length));

    // Way two: swipe the pager.
    await page.evaluate(() => {
      const p = document.querySelector('.xpick-pager');
      const panel = p.querySelector('.xpick-panel[data-cat="shoulders"]');
      if (panel) p.scrollLeft = panel.offsetLeft;
    });
    await page.waitForTimeout(600);
    check('swiping still moves you, and the dial follows',
      (await page.textContent('[data-testid="xdial-label"]')) === 'Shoulders',
      await page.textContent('[data-testid="xdial-label"]'));
    // Way three: the dots still say where you are.
    check('the position dots are still there', (await page.$$('.xpick-dot')).length > 3,
      String((await page.$$('.xpick-dot')).length));

    // And on a screen with room, the fastest way across comes back.
    await page.setViewportSize({ width: 820, height: 900 });
    await page.waitForTimeout(500);
    check('a wide screen keeps the chip row',
      await page.$eval('[data-testid="xpick-chips"]', e => getComputedStyle(e).display !== 'none'));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);

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

  // =============== 7. the list gets the screen ==============================
  //
  // The complaint that started this: "once I choose one the screen real estate
  // for adding more exercises is very small". Measured, it was 245px of an
  // 844px screen — three exercises out of eleven — and three separate things
  // were eating it. Each is pinned here with the number it was worth, because
  // a stray margin re-inflates this the same way it deflated in the first
  // place: one innocuous row at a time.
  console.log('\n=== 7. how much of the screen the list actually gets ===');
  {
    await page.click('.xpick-panel[data-cat="chest"] .xrow');
    await page.waitForTimeout(500);

    const m = () => page.evaluate(() => {
      const list = document.querySelector('.xpick-panel[data-cat="chest"] .xpick-panel-list');
      const cs = getComputedStyle(list);
      const row = list.querySelector('.xrow').getBoundingClientRect().height + 6;
      const cta = document.querySelector('.xpick-cta');
      const cr = cta.getBoundingClientRect();
      const dock = document.querySelector('.dock').getBoundingClientRect();
      const head = document.querySelector('.xpick-panel-head');
      return {
        listH: Math.round(list.clientHeight),
        rows: +(list.clientHeight / row).toFixed(1),
        pad: Math.round(parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)),
        ctaH: Math.round(cr.height),
        belowCta: Math.round(dock.top - cr.bottom),
        headShown: head ? getComputedStyle(head).display !== 'none' : false,
        tucked: document.querySelector('[data-testid="xpick-tuck"]').classList.contains('is-tucked')
      };
    });

    const at = await m();
    console.log('   ', JSON.stringify(at));

    // The confirm bar padded itself by a whole --dock-clear on top of the
    // allowance the screen already makes: a 53px button in a 161px block.
    check('the confirm bar does not clear the dock twice', at.ctaH < 90, `${at.ctaH}px`);
    check('and leaves no dead band above the dock', at.belowCta < 44, `${at.belowCta}px`);
    // padding: 34% resolves against WIDTH — 122px top and bottom regardless of
    // how short the list was.
    check('the wheel centring is capped, not 34% of the width', at.pad <= 130, `${at.pad}px`);
    check('the category is not printed twice', !at.headShown);
    check('five exercises visible with one already picked', at.rows >= 5, `${at.rows} rows in ${at.listH}px`);

    // Scrolling hands the navigation's space to the list and gives it back.
    const box = await page.$eval('.xpick-panel[data-cat="chest"] .xpick-panel-list',
      e => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    await page.mouse.move(box.x, box.y);
    await page.mouse.wheel(0, 220);
    await page.waitForTimeout(700);
    const browsing = await m();
    console.log('   ', JSON.stringify(browsing));
    check('scrolling tucks the navigation away', browsing.tucked);
    check('and hands the list eight exercises', browsing.rows >= 8, `${browsing.rows} rows in ${browsing.listH}px`);

    await page.mouse.wheel(0, -60);
    await page.waitForTimeout(700);
    const back = await m();
    check('scrolling up brings it straight back', !back.tucked && back.rows < browsing.rows,
      `${back.rows} rows, tucked=${back.tucked}`);

    // Collapsing changes the list height, which fires another scroll event with
    // the opposite sign. Without a settling window the row flaps under a thumb.
    const flips = await page.evaluate(() => new Promise(res => {
      const t = document.querySelector('[data-testid="xpick-tuck"]');
      let n = 0;
      const mo = new MutationObserver(() => n++);
      mo.observe(t, { attributes: true, attributeFilter: ['class'] });
      setTimeout(() => { mo.disconnect(); res(n); }, 1200);
    }));
    check('and it does not flap once left alone', flips === 0, `${flips} class changes`);

    // Reaching for search must not leave you typing into something hidden.
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(600);
    await page.fill('.xpick input.input', 'row');
    await page.waitForTimeout(500);
    check('searching un-tucks, so the field you typed in is on screen',
      await page.$eval('[data-testid="xpick-tuck"]', e => !e.classList.contains('is-tucked')));
    await page.fill('.xpick input.input', '');
    await page.waitForTimeout(400);
  }

  // =============== 8. the ring ==============================================
  //
  // An arc has to fit every slice into the angle above the trigger, and seven
  // do not fit in 390px — the reason this menu asks for compact slices and a
  // 78-degree sweep in the first place. A ring has the whole turn to spend.
  console.log('\n=== 8. seven spokes in a ring, not an arc ===');
  {
    await dismiss();
    const d = await dialAt();
    await page.mouse.move(d.x, d.y); await page.mouse.down();
    await page.waitForTimeout(500);

    const g = await page.evaluate(() => {
      const o = document.querySelector('[data-testid="radial-overlay"]');
      const hub = o && o.querySelector('[data-testid="radial-hub"]');
      const hr = hub && hub.getBoundingClientRect();
      const c = hr ? { x: hr.left + hr.width / 2, y: hr.top + hr.height / 2 } : null;
      const sl = [...document.querySelectorAll('.radial-slice')];
      return {
        ring: !!o && o.classList.contains('radial-ring'),
        hub: hub ? hub.textContent.trim() : null,
        n: sl.length,
        vw: window.innerWidth, vh: window.innerHeight,
        centre: c,
        // The slice element, not the icon inside it. A slice is translated by
        // -50%,-50% so its own centre is the point the layout placed; the icon
        // sits above that, with the label below, so measuring the icon reads a
        // constant upward offset as a wobble in the radius.
        radii: c ? sl.map((e) => {
          const r = e.getBoundingClientRect();
          return Math.round(Math.hypot(r.left + r.width / 2 - c.x, r.top + r.height / 2 - c.y));
        }) : [],
        angles: c ? sl.map((e) => {
          const r = e.getBoundingClientRect();
          return Math.atan2(r.top + r.height / 2 - c.y, r.left + r.width / 2 - c.x) * 180 / Math.PI;
        }) : [],
        offscreen: sl.filter((e) => {
          const r = e.getBoundingClientRect();
          return r.left < 0 || r.top < 0 || r.right > window.innerWidth || r.bottom > window.innerHeight;
        }).map((e) => e.textContent.trim())
      };
    });

    check('it opens as a ring', g.ring);
    check('with a word in the middle saying what to do', g.hub === 'CHOOSE' || /choose/i.test(g.hub || ''), g.hub);
    check('all seven spokes are on it', g.n === 7, String(g.n));
    // Every spoke the same reach from the middle is the whole point of a ring:
    // no slice is further away than another.
    const spread = Math.max(...g.radii) - Math.min(...g.radii);
    check('every spoke is the same distance from the centre', spread <= 2, `${spread}px spread`);
    // Evenly spaced, which is what buys the room an arc did not have.
    const sorted = g.angles.slice().sort((a, b) => a - b);
    const gaps = sorted.map((a, i) => (i ? a - sorted[i - 1] : a + 360 - sorted[sorted.length - 1]));
    const off = Math.max(...gaps.map((x) => Math.abs(x - 360 / g.n)));
    check('and evenly spaced around it', off < 2, `worst gap is ${off.toFixed(1)}° off ${(360 / g.n).toFixed(0)}°`);
    check('nothing is pushed off screen', g.offscreen.length === 0, g.offscreen.join(', '));

    // Centred on the screen, not hung off the trigger. The dial sits near the
    // top; a ring hung off it would sit high with half of it over the list.
    check('the ring is centred on the screen, not on the dial',
      Math.abs(g.centre.x - g.vw / 2) < 3 && Math.abs(g.centre.y - d.y) > 120,
      `ring at ${Math.round(g.centre.x)},${Math.round(g.centre.y)}; dial at ${Math.round(d.x)},${Math.round(d.y)}`);
    check('and clear of the dock', g.centre.y + Math.max(...g.radii) < g.vh - 60,
      `lowest spoke at ${Math.round(g.centre.y + Math.max(...g.radii))} of ${g.vh}`);

    // Which is why aiming has to wait for the thumb to move: the centre is
    // nowhere near where the press landed, so the very first pointermove
    // already sits at a real angle and would otherwise pre-select.
    await page.mouse.move(d.x + 3, d.y + 3);
    await page.waitForTimeout(120);
    check('a twitch aims at nothing', (await page.$$('.radial-slice.is-aimed')).length === 0);
    // A real move does aim.
    await page.mouse.move(g.centre.x, g.centre.y - 130, { steps: 8 });
    await page.waitForTimeout(200);
    const aimed = await page.$$eval('.radial-slice.is-aimed', (n) => n.map((e) => e.textContent.trim()));
    check('a deliberate move aims at the spoke it points to',
      aimed.length === 1 && /chest/i.test(aimed[0]), JSON.stringify(aimed));
    await page.mouse.up();
    await page.waitForTimeout(500);
    check('and releasing on it picks that one',
      /Chest/.test(await page.textContent('[data-testid="xdial-label"]')),
      await page.textContent('[data-testid="xdial-label"]'));
    await dismiss();
  }

  // =============== 9. a small menu stays a fan ==============================
  console.log('\n=== 9. three items do not become a ring ===');
  {
    // Three points of a triangle with a hole in the middle is worse than the
    // fan, so the ring only takes over once an arc gets cramped.
    await page.evaluate(() => document.querySelectorAll('[data-testid="radial-overlay"]').forEach((n) => n.remove()));
    const fab = await page.$('[data-testid="dock-fab"]');
    const fb = fab && await fab.boundingBox();
    if (fb) {
      await page.mouse.move(fb.x + fb.width / 2, fb.y + fb.height / 2);
      await page.mouse.down();
      // RADIAL_HOLD_MS in js/app.js is 420; this one is a hold, not a press.
      await page.waitForTimeout(760);
    }
    const small = await page.evaluate(() => {
      const o = document.querySelector('[data-testid="radial-overlay"]');
      return o ? { ring: o.classList.contains('radial-ring'), hub: !!o.querySelector('[data-testid="radial-hub"]'),
        n: o.querySelectorAll('.radial-slice').length } : null;
    });
    if (small && small.n) {
      check('a three-item menu is still an arc', !small.ring, JSON.stringify(small));
      check('and has no hub', !small.hub);
    } else {
      check('the small menu opened', false, 'could not open the FAB radial');
    }
    await page.mouse.up();
    await dismiss();
  }

  // =============== 10. changing level does not blink ========================
  console.log('\n=== 10. More and Back repaint the ring, not the screen ===');
  {
    // "More" used to close the menu and open a new one on a zero-delay timer.
    // Between those two the overlay was out of the document, so the scrim, the
    // blur, the ring and every spoke went with it and the screen behind flashed
    // through for a frame — then the whole entrance replayed. It read as a
    // jolt because it was one.
    //
    // Sampled across the swap rather than at the end, because the end looks
    // identical either way. What is being asserted is that there is never a
    // frame with no menu on it.
    await dismiss();
    await openPicker();
    const d = await dialAt();
    await page.mouse.move(d.x, d.y); await page.mouse.down();
    await page.waitForTimeout(120); await page.mouse.up();
    await page.waitForTimeout(300);

    const sample = () => page.evaluate(() => {
      const o = document.querySelector('[data-testid="radial-overlay"]');
      if (!o) return { up: false };
      return {
        up: true,
        scrim: !!o.querySelector('.radial-scrim'),
        ringline: !!o.querySelector('.radial-ringline'),
        hub: !!o.querySelector('[data-testid="radial-hub"]'),
        leaving: o.querySelectorAll('.radial-slice.is-leaving').length,
        fresh: o.querySelectorAll('.radial-slice:not(.is-leaving)').length
      };
    });
    await page.click('[data-testid="radial-cat-more"]');
    const frames = [];
    for (const gap of [0, 30, 40, 50, 60]) {
      await page.waitForTimeout(gap);
      frames.push(await sample());
    }
    check('the menu is on screen in every frame of the swap',
      frames.every((f) => f.up && f.scrim && f.ringline && f.hub),
      JSON.stringify(frames));
    // The point of keeping the overlay is the cross-dissolve; without an exit
    // the outgoing spokes would simply be gone by the first sample.
    check('the outgoing spokes leave rather than vanish',
      frames[0].leaving > 0 && frames[0].fresh > 0, JSON.stringify(frames[0]));
    // And they must not linger: two levels' worth of spokes on the ring is its
    // own kind of mess.
    await page.waitForTimeout(400);
    const settled = await sample();
    check('and they are gone once it settles', settled.leaving === 0 && settled.fresh > 1,
      JSON.stringify(settled));

    // Aiming has to work on the new level. The dead-zone guard measures from
    // where the press began, and that press ended two levels ago — left as it
    // was, the second ring would refuse every aim.
    const hub = await page.evaluate(() => {
      const h = document.querySelector('[data-testid="radial-hub"]').getBoundingClientRect();
      return { x: h.left + h.width / 2, y: h.top + h.height / 2 };
    });
    await page.mouse.move(hub.x, hub.y - 130, { steps: 8 });
    await page.waitForTimeout(200);
    check('and the new level can be aimed at',
      await page.evaluate(() => !!document.querySelector('.radial-slice.is-aimed')));

    // Back is the same move in reverse, and it is the one that would be left
    // behind by a fix that only special-cased More.
    await page.click('[data-testid="radial-cat-back"]');
    const backFrames = [];
    for (const gap of [0, 40, 50]) {
      await page.waitForTimeout(gap);
      backFrames.push(await sample());
    }
    check('Back repaints in place too', backFrames.every((f) => f.up && f.scrim && f.hub),
      JSON.stringify(backFrames));
    await page.waitForTimeout(400);
    check('and lands on the body parts',
      (await spokes()).includes('radial-cat-chest'), (await spokes()).join(','));
    await dismiss();
  }

  console.log('\nERRORS:', errs.length ? errs : 'none');
  console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
