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
//   Body part and browse group are one axis. "Chest" plus "Legs › Squat" is an
//   empty grid with no way to see why, so choosing on either clears the other.
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
    // The rows it must not have become another of.
    check('the body-part chips are still there', (await page.$$('.filter-chip[data-cat]')).length > 5);
    check('the discipline chips are still there', !!(await page.$('[data-testid="discipline-row"]')));
    check('and nothing is filtered yet', !(await page.$('[data-testid="browse-crumb"]')));
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
  console.log('\n=== 4. body part and browse group cannot both be on ===');
  {
    // Both answer "which part of the body", so composing them produces an
    // empty grid and no way to see which of the two did it.
    await page.evaluate(() => [...document.querySelectorAll('.filter-chip')]
      .find((c) => c.dataset.cat === 'chest')?.click());
    await page.waitForTimeout(900);
    check('picking a body-part chip clears the browse', !(await page.$('[data-testid="browse-crumb"]')));
    check('and shows that body part', (await shown()) > 0 && (await shown()) < DB.length, String(await shown()));

    await openSheet();
    await clickRow('browse-pillar-conditioning');
    await clickRow('browse-whole-pillar');
    check('and browsing clears the chip',
      await page.evaluate(() => document.querySelector('.filter-chip[data-cat="all"]')?.classList.contains('active')));
    check('showing the whole pillar', (await shown()) === countIn('conditioning'),
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

  console.log('\nERRORS:', errs.length ? errs : 'none');
  console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
