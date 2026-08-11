// Two constant-cost performance defects, both of which a stopwatch finds and a
// code read talks you out of.
//
// 1. The first visit to each tab drops a full-screen overlay at z-index 9000
//    for 1.9s with no way out of it. It is decoration, and while it is up it
//    eats every tap aimed at the tab underneath — three tabs, every fresh
//    install. It is now dismissible.
//
// 2. The Nutrition saved-meals hero swept its highlight by animating `left`,
//    a layout property, on a 6s infinite loop that runs the whole time the tab
//    is open. That is a reflow every frame, forever, at any data size.
//
// Neither of these gets worse with history, which is why they are worth fixing
// and the read-amplification findings around them are not, yet.
//
//   node tests/tab-loader.js   (needs `python3 -m http.server 8199` at the repo root)
const { chromium } = require('/opt/node22/lib/node_modules/playwright/index.js');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0;
const check = (label, ok, detail = '') => {
  if (!ok) fails++;
  console.log(`   ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
};

const HOLD_MS = 1500;   // what showTabLoader waits before dismissing itself

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const c = await b.newContext({ viewport: { width: 390, height: 900 }, serviceWorkers: 'block', hasTouch: true });
  const page = await c.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERR: ' + e.message));
  await page.route(/fonts\.googleapis\.com/, r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));

  await page.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
  await page.waitForFunction(() => window.Storage && window.U);
  await page.evaluate(async () => {
    await Storage.clearAll();
    for (const [k, v] of Object.entries({ onboarded: true, sex: 'male', dob: '1995-04-12',
      heightCm: 180, activityLevel: 'moderate', kcalGoal: 2200 })) await Storage.setPref(k, v);
  });
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(4200);

  const loaderUp = () => page.evaluate(() => !!document.querySelector('[data-testid="tab-loader"]'));
  const openTab = async (id) => {
    await page.evaluate((t) => document.querySelector(`[data-testid="dock-${t}"]`).click(), id);
    await page.waitForSelector('[data-testid="tab-loader"]', { timeout: 3000 });
  };

  // === 1. the loader is there in the first place (control for everything below) ===
  console.log('=== 1. the loader appears on a tab\'s first visit ===');
  await openTab('stats');
  check('first visit to Stats raises the loader', await loaderUp());

  // Left alone, it must still be up most of the way through its hold. Without
  // this, "the tap removed it" is indistinguishable from "it was never long".
  await sleep(HOLD_MS * 0.6);
  const stillUp = await loaderUp();
  check('left alone it is still up at 60% of its hold', stillUp,
    stillUp ? '' : 'the hold is shorter than the test assumes — retune HOLD_MS');
  await page.waitForFunction(() => !document.querySelector('[data-testid="tab-loader"]'), { timeout: 4000 });

  // === 2. a tap skips it ===
  console.log('\n=== 2. a tap skips it, well before the hold expires ===');
  await openTab('nutrition');
  const box = await page.evaluate(() => {
    const r = document.querySelector('[data-testid="tab-loader"]').getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  const t0 = Date.now();
  await page.touchscreen.tap(box.x, box.y);
  const leaving = await page.evaluate(() => {
    const o = document.querySelector('[data-testid="tab-loader"]');
    return o ? o.className : 'already gone';
  });
  await page.waitForFunction(() => !document.querySelector('[data-testid="tab-loader"]'), { timeout: 3000 });
  const took = Date.now() - t0;
  console.log(`   ${leaving} — gone ${took}ms after the tap (hold is ${HOLD_MS}ms)`);
  check('the tap starts it leaving immediately', /tabload-out|already gone/.test(leaving), leaving);
  check('a tap dismisses it', took < HOLD_MS, `${took}ms`);

  // === 3. it stops swallowing taps the instant it starts leaving ===
  console.log('\n=== 3. it stops intercepting as soon as it is on the way out ===');
  // Loaders play once per tab per session and Learn no longer plays one at
  // all, so reload to get a fresh set rather than hunting for an unused tab.
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await openTab('stats');
  const passthrough = await page.evaluate(() => {
    const o = document.querySelector('[data-testid="tab-loader"]');
    const before = getComputedStyle(o).pointerEvents;
    o.classList.add('tabload-out');
    const after = getComputedStyle(o).pointerEvents;
    const r = o.getBoundingClientRect();
    const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return { before, after, stillHits: !!(hit && (hit === o || o.contains(hit))) };
  });
  console.log(`   pointer-events ${passthrough.before} -> ${passthrough.after}`);
  check('a leaving loader no longer takes the hit', !passthrough.stillHits,
    `pointer-events: ${passthrough.after}`);
  await page.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"]').forEach(n => n.remove()));

  // === 3b. Learn lands on the hub — one tap, one destination, no fork ===
  //
  // The full-screen fork is gone: the dock goes straight to the tab, whose
  // hub carries the fork's two destinations as jump tiles. One interstitial
  // maximum on that tap — the tab's own loader, same as every other tab.
  console.log('\n=== 3b. Learn lands on the hub, no fork in the way ===');
  await page.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"]').forEach(n => n.remove()));
  await page.evaluate(() => document.querySelector('[data-testid="dock-home"]').click());
  await sleep(900);
  await page.evaluate(() => document.querySelector('[data-testid="dock-library"]').click());
  await sleep(2600);
  await page.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"]').forEach(n => n.remove()));
  check('no fork sheet appears', !(await page.$('[data-testid="learn-fork"]')));
  check('the tab landed on the hub', !!(await page.$('[data-testid="learn-hub"]')));
  check('with the reading right there', !!(await page.$('[data-testid="learn-section"]')));
  check('and no loader left standing', !(await loaderUp()));

  // === 4. the Nutrition shine animates transform, not layout ===
  console.log('\n=== 4. the saved-meals shine does not reflow every frame ===');
  const css = fs.readFileSync(path.join(ROOT, 'css', 'styles.css'), 'utf8');
  // Brace-count rather than stopping at the first `\n}`: the block is written
  // on one line as often as not, and a loose match runs on into whatever rule
  // follows — which is how you end up reporting a property the block does not
  // contain.
  const kf = (() => {
    const at = css.search(/@keyframes\s+nsavedShine\s*\{/);
    if (at < 0) return '';
    const open = css.indexOf('{', at);
    let depth = 0;
    for (let i = open; i < css.length; i++) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}' && --depth === 0) return css.slice(open + 1, i);
    }
    return '';
  })();
  check('nsavedShine exists', kf.length > 0);
  check('it animates no layout property',
    !/(^|[;{\s])(left|right|top|bottom|width|height|margin)\s*:/.test(kf),
    kf.replace(/\s+/g, ' ').trim().slice(0, 120));
  check('it animates transform', /transform\s*:/.test(kf));

  // The conversion has to preserve the geometry, not just move off `left`.
  // translateX percentages are relative to the element, `left` percentages to
  // the containing block, so getting it wrong changes the travel silently.
  // Park it at both ends of each version and compare the distance.
  await page.evaluate(() => document.querySelector('[data-testid="dock-nutrition"]').click());
  await page.waitForTimeout(2400);
  const geom = await page.evaluate(() => {
    const s = document.querySelector('.nsaved-hero-shine');
    if (!s) return { found: false };
    const saved = { a: s.style.animation, t: s.style.transform, l: s.style.left };
    s.style.animation = 'none';
    s.style.transform = 'none';
    s.style.left = '-60%'; const oldStart = s.offsetLeft;
    s.style.left = '130%'; const oldEnd = s.offsetLeft;
    s.style.left = '-60%';
    s.style.transform = 'translateX(0)';   const newStart = s.getBoundingClientRect().x;
    s.style.transform = 'translateX(422%)'; const newEnd = s.getBoundingClientRect().x;
    Object.assign(s.style, { animation: saved.a, transform: saved.t, left: saved.l });
    return { found: true, old: oldEnd - oldStart, now: Math.round(newEnd - newStart) };
  });
  if (!geom.found) {
    console.log('   (no saved-meals hero on this screen — travel not checked)');
  } else {
    console.log(`   travel: ${geom.old}px on left, ${geom.now}px on transform`);
    check('the highlight still travels at all', geom.now > 100, `${geom.now}px`);
    check('it travels exactly as far as the layout version did',
      Math.abs(geom.now - geom.old) <= 2, `${geom.now} vs ${geom.old}`);
  }

  console.log('\nERRORS:', errs.length ? errs : 'none');
  console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
