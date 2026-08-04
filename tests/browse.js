// Browsing the library by pillar.
//
// The complaint this answers was that getting to an exercise is a slog. So the
// thing to be careful about is adding to the slog: the library page already
// had a search box, a row of body-part chips, a row of discipline chips and a
// sort row, and a fourth row would have been answering "too much to wade
// through" with more of the cause. It is one line that opens a drill-down.
//
// Two behaviours carry the whole design and both are easy to get wrong:
//
//   Depth follows content. A group splits into leaves only when it is big
//   enough AND actually divides. Ten stretches that are all static stretches
//   must not cost a tap to find out they were all one thing.
//
//   Body part and browse group are one axis. A body zone plus "Legs › Squat" is
//   an empty grid with no way to see why, so choosing on either clears the other.
//
// The body-part chip row is gone. The figure above does the same job and does
// it better — both set the same filter, and the map can say "lats" where a
// chip could only say "back". It still renders when body-map.js fails to load,
// because then there would be no body-part filter at all; section 7 pins that.
//
//   node tests/browse.js   (needs `python3 -m http.server 8199`)
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

const G = {};
new Function('window', fs.readFileSync(path.join(ROOT, 'data/exercises.js'), 'utf8'))(G);
const DB = G.EXERCISE_DB;
const tx = (e) => e.taxon || {};
const countIn = (p, g, s) => DB.filter((e) =>
  tx(e).pillar === p && (!g || tx(e).group === g) && (!s || tx(e).sub === s)).length;

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', hasTouch: true });
  const page = await c.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push('PAGEERR: ' + e.message.slice(0, 170)));

  await page.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
  await page.waitForFunction(() => window.Storage && window.EXERCISE_DB);
  await page.evaluate(async () => { await Storage.clearAll(); await Storage.setPref('onboarded', true); });
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(1900);
  await page.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"],.splash').forEach((n) => n.remove()));

  const toLibrary = async () => {
    await page.evaluate(() => document.querySelector('[data-testid="dock-library"]').click());
    await page.waitForTimeout(700);
    await page.evaluate(() => document.querySelector('[data-testid="learn-fork-bodymap"]')?.click());
    await page.waitForTimeout(1800);
  };
  const shown = () => page.evaluate(() => document.querySelectorAll('[data-ex-id]').length);
  const names = () => page.evaluate(() =>
    [...document.querySelectorAll('[data-ex-id]')].map((n) => n.querySelector('.exercise-card-name')?.textContent.trim()));
  const openSheet = async () => {
    await page.evaluate(() => (document.querySelector('[data-testid="browse-open"]')
      || document.querySelector('[data-testid="browse-crumb"]')).click());
    await page.waitForTimeout(800);
  };
  const clickRow = async (testid, text) => {
    const ok = await page.evaluate(({ t, x }) => {
      const n = [...document.querySelectorAll(`[data-testid="${t}"]`)]
        .find((e) => !x || e.innerText.includes(x));
      if (!n) return false; n.click(); return true;
    }, { t: testid, x: text });
    await page.waitForTimeout(800);
    return ok;
  };

  await toLibrary();

  // ================= 1. the entry point ==================================
  console.log('=== 1. one line, not a fourth row of chips ===');
  {
    check('the whole library is shown to begin with', (await shown()) === DB.length,
      `${await shown()} of ${DB.length}`);
    check('there is a way in', !!(await page.$('[data-testid="browse-open"]')));
    check('it says what it browses by',
      /strength/i.test(await page.textContent('[data-testid="browse-open"]')),
      (await page.textContent('[data-testid="browse-open"]')).replace(/\s+/g, ' '));
    check('and a second line for equipment and discipline', !!(await page.$('[data-testid="refine-open"]')));
    // Step 5: the chip row is retired from the normal page. The figure does
    // that job, and two controls for one filter was the fourth row nobody
    // wanted to scroll past.
    check('the body-part chip row is gone', (await page.$$('.filter-chip[data-cat]')).length === 0);
    check('the figure that replaced it is there', !!(await page.$('.body-map-region')));
    // Two lines in, not four rows. The sort row is untouched.
    check('the sort row survived', (await page.$$('.sort-chip')).length >= 3);
    check('and nothing is filtered yet',
      !(await page.$('[data-testid="browse-crumb"]')) && !(await page.$('[data-testid="refine-count"]')));
    await page.evaluate(() => document.querySelector('[data-testid="browse-open"]').scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${SS}/browse-bar.png` });
  }

  // ================= 2. the drill-down ===================================
  console.log('\n=== 2. pillar → group → leaf ===');
  {
    await openSheet();
    check('the sheet opens on the three pillars',
      (await page.$$('[data-testid^="browse-pillar-"]')).length === 3);
    // The counts are the point: they say whether a room is worth entering.
    for (const p of ['strength', 'conditioning', 'mobility']) {
      const txt = await page.textContent(`[data-testid="browse-pillar-${p}"]`);
      check(`${p} shows its real count`, txt.includes(String(countIn(p))),
        `${txt.replace(/\s+/g, ' ').slice(0, 58)} (expected ${countIn(p)})`);
    }
    await page.screenshot({ path: `${SS}/browse-pillars.png` });

    await clickRow('browse-pillar-strength');
    check('strength opens its groups', (await page.$$('[data-testid="browse-group"]')).length >= 5);
    check('and a breadcrumb says where you are',
      /Strength/.test(await page.textContent('[data-testid="browse-crumbs"]')));
    await page.screenshot({ path: `${SS}/browse-groups.png` });

    // Legs is 24 across six kinds — it earns a third level.
    check('a big, varied group drills in', await clickRow('browse-group', 'Legs'));
    const leaves = await page.$$('[data-testid="browse-sub"]');
    check('into its leaves', leaves.length >= 4, String(leaves.length));
    await page.screenshot({ path: `${SS}/browse-leaves.png` });

    await clickRow('browse-sub', 'Squat');
    check('picking a leaf closes the sheet', !(await page.$('[data-testid="browse-sheet"]')));
    check('and filters the grid to exactly that leaf',
      (await shown()) === countIn('strength', 'Legs', 'Squat'),
      `${await shown()} shown, ${countIn('strength', 'Legs', 'Squat')} in the data`);
    // The correction this suite exists to hold: /squat/ used to fire before
    // the single-leg rule, so pistol and Bulgarian split squats landed here.
    const sq = await names();
    check('and a squat leaf holds squats, not single-leg work',
      !sq.some((n) => /Pistol|Bulgarian/i.test(n)), sq.join(', '));
    check('the crumb says what is being shown',
      /Strength › Legs › Squat/.test(await page.textContent('[data-testid="browse-crumb"]')),
      (await page.textContent('[data-testid="browse-crumb"]')).replace(/\s+/g, ' '));
    await page.evaluate(() => document.querySelector('[data-testid="browse-crumb"]').scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${SS}/browse-filtered.png` });
  }

  // ================= 3. depth follows content ============================
  console.log('\n=== 3. a group only splits when splitting helps ===');
  {
    await openSheet();
    // Reopening from a crumb lands where you are, not back at the top.
    check('reopening starts where you left off',
      /Legs/.test(await page.textContent('[data-testid="browse-crumbs"]')),
      (await page.textContent('[data-testid="browse-crumbs"]')).replace(/\s+/g, ' '));
    // "All exercises" is the first crumb at any depth, so one tap returns to
    // the top rather than unwinding a level at a time.
    await page.evaluate(() => [...document.querySelectorAll('[data-testid="browse-crumbs"] .browse-crumb-back')]
      .find((n) => /All exercises/.test(n.textContent)).click());
    await page.waitForTimeout(700);
    check('the first crumb goes all the way back',
      (await page.$$('[data-testid^="browse-pillar-"]')).length === 3);
    await clickRow('browse-pillar-mobility');
    // Ten exercises, all static stretches. Splitting would cost a tap to be
    // told they were all one thing.
    check('a big group of one kind filters straight away, no leaf level',
      await clickRow('browse-group', 'Lower body') && !(await page.$('[data-testid="browse-sheet"]')));
    check('and shows that whole group',
      (await shown()) === countIn('mobility', 'Lower body'),
      `${await shown()} of ${countIn('mobility', 'Lower body')}`);
    check('the warm-up drills are not among them',
      !(await names()).some((n) => /warm-?up/i.test(n)), (await names()).join(', '));
  }

  // ================= 4. one axis, one choice =============================
  console.log('\n=== 4. the figure and the browse tree cannot both be on ===');
  {
    // Both answer "which part of the body", so composing them gives an empty
    // grid and no way to see which of the two emptied it. This used to be
    // tested through the chips; the figure inherits the rule.
    // An SVG <g> is an EventTarget but not an HTMLElement, so it has no
    // .click(). A real mouse click is no good either: the listener is on the
    // group, and the centre of a group's bounding box is usually the gap
    // between the shapes in it. Dispatch the event the listener is waiting for.
    const zoneOk = await page.evaluate(() => {
      const z = document.querySelector('.body-map-region[data-zone="chest"]');
      if (!z) return false;
      z.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return true;
    });
    check('a body zone can be picked on the figure', zoneOk);
    await page.waitForTimeout(1100);
    check('picking one clears the browse', !(await page.$('[data-testid="browse-crumb"]')));
    const chestN = await shown();
    check('and shows that body part', chestN > 0 && chestN < DB.length, String(chestN));

    await openSheet();
    check('the sheet opens at the top again, since the browse was cleared',
      (await page.$$('[data-testid^="browse-pillar-"]')).length === 3);
    await clickRow('browse-pillar-conditioning');
    await clickRow('browse-whole-pillar');
    check('and browsing clears the zone', (await shown()) === countIn('conditioning'),
      `${await shown()} of ${countIn('conditioning')}`);
  }

  // ================= 5. no dead ends =====================================
  console.log('\n=== 5. every path back out ===');
  {
    check('the crumb has a clear button', !!(await page.$('[data-testid="browse-clear"]')));
    await page.evaluate(() => document.querySelector('[data-testid="browse-clear"]').click());
    await page.waitForTimeout(800);
    check('clearing restores the whole library', (await shown()) === DB.length,
      `${await shown()} of ${DB.length}`);
    check('and the entry point comes back', !!(await page.$('[data-testid="browse-open"]')));

    // Browsing can empty the grid — a leaf plus a search that matches nothing
    // in it — so "Clear filters" has to clear the browse too or it lies.
    await openSheet();
    await clickRow('browse-pillar-strength');
    await clickRow('browse-group', 'Arms');
    if (await page.$('[data-testid="browse-sheet"]')) await clickRow('browse-sub', 'Biceps');
    await page.fill('#lib-search', 'sled');
    await page.waitForTimeout(800);
    check('a browse plus a contradicting search empties the grid', (await shown()) === 0);
    const clear = await page.$('[data-testid="empty-exercises-clear"]');
    check('and offers a way out', !!clear);
    if (clear) {
      await clear.click();
      await page.waitForTimeout(900);
      check('which really does clear everything', (await shown()) === DB.length,
        `${await shown()} of ${DB.length}`);
      check('including the browse', !(await page.$('[data-testid="browse-crumb"]')));
    }
    // Search on its own still ignores the tree entirely.
    await page.fill('#lib-search', 'pistol');
    await page.waitForTimeout(700);
    check('search still reaches across the whole library', (await shown()) > 0, String(await shown()));
  }

  // ================= 6. refine cuts across the tree =======================
  console.log('\n=== 6. equipment and discipline cut across, they do not nest ===');
  {
    await page.evaluate(() => document.querySelector('[data-testid="browse-clear"]')?.click());
    await page.waitForTimeout(600);
    await page.fill('#lib-search', '');
    await page.waitForTimeout(500);

    await page.evaluate(() => document.querySelector('[data-testid="refine-open"]').click());
    await page.waitForTimeout(800);
    check('the refine sheet opens', !!(await page.$('[data-testid="refine-sheet"]')));
    check('it offers equipment', (await page.$$('[data-testid^="refine-gear-"]')).length >= 4);
    check('and the disciplines that used to be a row', (await page.$$('[data-testid^="disc-"]')).length >= 3);
    // A chip that narrows 165 exercises to one wastes a tap.
    check('no kit chip is offered for a token amount of kit',
      await page.evaluate(() => [...document.querySelectorAll('[data-testid^="refine-gear-"]')]
        .every((n) => Number((n.textContent.match(/· (\d+)$/) || [])[1]) >= 3)));
    await page.screenshot({ path: `${SS}/browse-refine.png` });

    await page.evaluate(() => document.querySelector('[data-testid="refine-gear-barbell"]').click());
    await page.waitForTimeout(700);
    await page.evaluate(() => document.querySelector('[data-testid="disc-crossfit"]').click());
    await page.waitForTimeout(700);
    await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => /^done$/i.test(b.textContent.trim()))?.click());
    await page.waitForTimeout(900);
    check('the line shows how many are on', (await page.textContent('[data-testid="refine-count"]')) === '2',
      await page.textContent('[data-testid="refine-count"]').catch(() => 'none'));
    const both = await shown();
    const expect = DB.filter((e) => (e.gear || []).includes('barbell')).length;
    check('and the grid is narrowed by both', both > 0 && both < expect, `${both}, barbell alone is ${expect}`);
    check('the discipline note still says what the library lacks',
      await page.evaluate(() => {
        const n = document.querySelector('[data-testid="discipline-note"]');
        return !!n && n.style.display !== 'none' && n.textContent.length > 20;
      }));

    // The point of step 4: these compose with the tree rather than living
    // inside it, so a strength movement stays findable as CrossFit work.
    await openSheet();
    await clickRow('browse-pillar-strength');
    await clickRow('browse-group', 'Olympic');
    if (await page.$('[data-testid="browse-sheet"]')) await clickRow('browse-whole-group');
    await page.waitForTimeout(600);
    const layered = await shown();
    check('a browse path and the refine filters apply together',
      layered > 0 && layered < both, `${layered} with the path, ${both} without`);
    check('and both are still shown as on',
      !!(await page.$('[data-testid="browse-crumb"]')) && !!(await page.$('[data-testid="refine-count"]')));
    await page.screenshot({ path: `${SS}/browse-layered.png` });

    await page.evaluate(() => document.querySelector('[data-testid="refine-clear"]').click());
    await page.waitForTimeout(800);
    check('clearing refine leaves the browse alone',
      !(await page.$('[data-testid="refine-count"]')) && !!(await page.$('[data-testid="browse-crumb"]')));
  }

  // ================= 7. the fallback ======================================
  console.log('\n=== 7. with no figure, the chips come back ===');
  {
    // Retiring the chips is only safe because the figure does their job. When
    // body-map.js cannot load there is no figure, and without this the library
    // would have no body-part filter at all.
    const c2 = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', hasTouch: true });
    const p2 = await c2.newPage();
    p2.on('console', () => {});
    await p2.route(/body-map\.js/, (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: '/* gone */' }));
    await p2.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
    await p2.waitForFunction(() => window.Storage && window.EXERCISE_DB);
    await p2.evaluate(async () => { await Storage.clearAll(); await Storage.setPref('onboarded', true); });
    await p2.reload({ waitUntil: 'load' });
    await p2.waitForTimeout(2000);
    await p2.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"],.splash').forEach((n) => n.remove()));
    await p2.evaluate(() => document.querySelector('[data-testid="dock-library"]').click());
    await p2.waitForTimeout(700);
    await p2.evaluate(() => document.querySelector('[data-testid="learn-fork-bodymap"]')?.click());
    await p2.waitForTimeout(1800);
    check('there is no figure', !(await p2.$('.body-map-region')));
    check('so the chip row is rendered instead', (await p2.$$('.filter-chip[data-cat]')).length > 5);
    check('and it still filters',
      await p2.evaluate(() => {
        const before = document.querySelectorAll('[data-ex-id]').length;
        [...document.querySelectorAll('.filter-chip')].find((c) => c.dataset.cat === 'chest')?.click();
        return before;
      }) === DB.length);
    await p2.waitForTimeout(900);
    const n2 = await p2.evaluate(() => document.querySelectorAll('[data-ex-id]').length);
    check('down to that body part', n2 > 0 && n2 < DB.length, String(n2));
    check('browse still works without a figure', !!(await p2.$('[data-testid="browse-open"]')));
    await c2.close();
  }

  console.log('\nERRORS:', errs.length ? errs : 'none');
  console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
