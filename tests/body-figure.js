// The body figure, and the two marks that draw the same body elsewhere.
//
// The figure is not decoration: picking Chest on the dial accents the chest
// and nothing else, which is the only thing telling you what a spoke means
// before you read its label. Nothing covered that, so a redraw could have
// silently accented the wrong part — or none at all — and every suite would
// still have passed.
//
//   node tests/body-figure.js   (needs `python3 -m http.server 8199` at the repo root)
const { chromium } = require('/opt/node22/lib/node_modules/playwright/index.js');
const fs = require('fs');
const path = require('path');

let fails = 0;
const check = (label, ok, detail = '') => {
  if (!ok) fails++;
  console.log(`   ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
};

const SRC = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');

// Which parts each category should light, read off the source rather than
// restated here — a table stated twice is a table that drifts.
function liftAccentMap() {
  const m = SRC.match(/function exerciseFigureSvg\(category\) \{\s*const accent = \(\{([\s\S]*?)\}\)\[category\]/);
  if (!m) throw new Error('the accent map was not found in exerciseFigureSvg');
  const out = {};
  for (const line of m[1].split('\n')) {
    const e = line.match(/^\s*([a-z_]+):\s*\[([^\]]*)\]/);
    if (!e) continue;
    out[e[1]] = e[2].split(',').map(s => s.trim().replace(/"/g, '')).filter(Boolean);
  }
  return out;
}

(async () => {
  console.log('=== 1. the figure itself ===');
  const accentMap = liftAccentMap();
  check('the accent map was read', Object.keys(accentMap).length >= 8,
    `${Object.keys(accentMap).length} categories`);

  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', hasTouch: true });
  const page = await c.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERR: ' + e.message.slice(0, 160)));
  await page.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
  await page.waitForFunction(() => window.Storage && window.U);
  await page.evaluate(async () => {
    await Storage.clearAll();
    await Storage.setPref('onboarded', true);
  });
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(1600);
  await page.evaluate(() => document.querySelectorAll('.splash').forEach(n => n.remove()));

  // exerciseFigureSvg lives inside the IIFE, so drive it through the DOM: the
  // dial renders one, and the markup it produces is what this is about.
  const shape = await page.evaluate(() => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    // The radial spokes carry the same figure; borrow one by rendering the
    // library picker, which builds them for every category.
    return null;
  });

  // Simpler and more direct: re-evaluate the function's own output by pulling
  // the builder out of source, the way the strength tables are reached.
  const svgFor = await page.evaluate((src) => {
    const m = src.match(/function exerciseFigureSvg\(category\) \{[\s\S]*?\n  \}/);
    if (!m) return null;
    // eslint-disable-next-line no-new-func
    const fn = new Function(`${m[0]}; return exerciseFigureSvg;`)();
    const out = {};
    for (const cat of ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'full_body', 'cardio', 'boxing', 'nonsense']) {
      out[cat] = fn(cat);
    }
    return out;
  }, SRC);
  check('the figure builder runs', !!svgFor && !!svgFor.chest);

  if (svgFor) {
    // Order of the nine parts, so an id can be named by position.
    const IDS = [null, null, 'sh', 'torsoU', 'torsoL', 'armL', 'armR', 'legL', 'legR'];
    const litParts = (svg) => {
      const tags = svg.match(/<(circle|rect|path)[^>]*>/g) || [];
      const lit = [];
      tags.forEach((t, i) => { if (/xfig-on/.test(t)) lit.push(IDS[i] || `part${i}`); });
      return lit;
    };

    check('every part is present', (svgFor.chest.match(/<(circle|rect|path)/g) || []).length === 9,
      `${(svgFor.chest.match(/<(circle|rect|path)/g) || []).length} parts`);
    check('the head and neck are never accented',
      !/xfig-on/.test((svgFor.full_body.match(/<(circle|rect|path)[^>]*>/g) || [])[0] + (svgFor.full_body.match(/<(circle|rect|path)[^>]*>/g) || [])[1]));

    for (const [cat, want] of Object.entries(accentMap)) {
      const got = litParts(svgFor[cat]);
      const same = want.length === got.length && want.every(w => got.includes(w));
      check(`${cat} lights ${want.join('+')}`, same, got.join('+') || 'nothing');
    }

    check('an unknown category still lights something', litParts(svgFor.nonsense).length > 0,
      litParts(svgFor.nonsense).join('+'));

    // The classes are what colour it; hardcoded fills would ignore the accent.
    check('no part carries a hardcoded fill', !/fill="#/.test(svgFor.chest),
      /fill="#/.test(svgFor.chest) ? 'a literal colour is baked in' : 'classes only');
    check('every part is classed xfig-base',
      (svgFor.chest.match(/xfig-base/g) || []).length === 9,
      `${(svgFor.chest.match(/xfig-base/g) || []).length} of 9`);
  }

  console.log('\n=== 2. it renders where it is used ===');
  {
    // The exercise picker is where these actually live — the dial carries one
    // and every row carries another. Checking the built string alone would
    // miss a figure that never reaches the screen.
    await page.evaluate(() => document.querySelector('[data-testid="dock-fab"]').click());
    await page.waitForTimeout(900);
    await page.evaluate(() => document.querySelector('[data-testid="quick-start-workout"]').click());
    await page.waitForTimeout(2400);
    await page.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"]').forEach(n => n.remove()));

    const seen = await page.evaluate(() => {
      const all = [...document.querySelectorAll('.xfig-svg')];
      if (!all.length) return null;
      const f = all[0];
      const r = f.getBoundingClientRect();
      return {
        count: all.length,
        parts: f.children.length,
        w: Math.round(r.width), h: Math.round(r.height),
        // Anything painted has to resolve to a real colour, or the redraw
        // landed but the classes stopped matching.
        fill: getComputedStyle(f.children[0]).fill
      };
    });
    check('figures reach the screen', !!seen, seen ? `${seen.count} of them` : 'none rendered');
    if (seen) {
      check('each has all nine parts', seen.parts === 9, String(seen.parts));
      check('and is square', Math.abs(seen.w - seen.h) <= 1, `${seen.w}x${seen.h}`);
      check('and is actually painted', seen.fill && seen.fill !== 'none',
        seen.fill || 'nothing');
    }

    const dialFig = await page.evaluate(() =>
      !!document.querySelector('[data-testid="xpick-dial"] .xfig-svg'));
    check('the dial carries one too', dialFig);
  }

  console.log('\n=== 3. the two line marks ===');
  {
    const marks = await page.evaluate((src) => {
      const grab = (k) => {
        const i = src.indexOf(k + ': `');
        if (i < 0) return null;
        return src.slice(i + k.length + 3, src.indexOf('`', i + k.length + 3));
      };
      const navBody = (src.match(/    body: '([^']*)'/) || [])[1] || null;
      return { bodymap: grab('bodymap'), navBody };
    }, SRC);

    check('the fork mark exists', !!marks.bodymap);
    check('the nav mark exists', !!marks.navBody);

    if (marks.bodymap) {
      check('the fork mark is stroked, not filled',
        /stroke="currentColor"/.test(marks.bodymap) && !/fill="currentColor"/.test(marks.bodymap),
        /fill="currentColor"/.test(marks.bodymap) ? 'it is filled — it will not match its siblings' : 'stroked');
      // Its four siblings sit between 2.6 and 3.2; drifting outside that is
      // what makes one of five look like it came from somewhere else.
      const sw = Number((marks.bodymap.match(/stroke-width="([\d.]+)"/) || [])[1]);
      check('at the family stroke weight', sw >= 2.4 && sw <= 3.3, String(sw));
    }
    if (marks.navBody) {
      check('the nav mark is stroked', /stroke="currentColor"/.test(marks.navBody));
      const sw = Number((marks.navBody.match(/stroke-width="([\d.]+)"/) || [])[1]);
      check('and light enough to stay open at 22px', sw <= 2, String(sw));
    }
  }

  console.log('\n=== errors ===');
  console.log(errs.length ? errs.join('\n') : '   ERRORS: none');
  if (errs.length) fails += errs.length;

  await b.close();
  console.log(`\n${fails} failing checks`);
  process.exit(fails ? 1 : 0);
})();
