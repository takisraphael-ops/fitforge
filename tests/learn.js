// The Learning Centre: articles, the glossary mechanism, and the Watch button.
//
// Two things here are worth more than the rest.
//
// The content check is static and runs first, because the risk with ported
// prose is not that it fails to render — it is that it renders perfectly while
// telling you the app computes your next target and deloads a stalled lift on
// its own. FitForge does none of that. Baseline does. Every sentence promising
// it had to be rewritten, and one of those rewrites silently did nothing
// during development because the find string had a typo, so the assertion is
// on the shipped text rather than on the porting script.
//
// The Watch button is checked on both branches. Only a fifth of the library
// has a curated clip, so the fallback is the common path, not the edge case.
//
//   node tests/learn.js   (needs `python3 -m http.server 8199` at the repo root)
const { chromium } = require('/opt/node22/lib/node_modules/playwright/index.js');
const path = require('path');
const fs = require('fs');
const SS = process.env.FITFORGE_SHOTS || path.resolve(__dirname, '..', '.shots');
try { fs.mkdirSync(SS, { recursive: true }); } catch (_) {}

let fails = 0;
const check = (label, ok, detail = '') => {
  if (!ok) fails++;
  console.log(`   ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
};

// ================= 0. the content itself =================
console.log('=== 0. shipped content makes no claims FitForge cannot keep ===');
{
  const g = {};
  new Function('window', fs.readFileSync(path.resolve(__dirname, '..', 'data/learn.js'), 'utf8'))(g);
  const articles = g.LEARN_ARTICLES || [];
  const terms = g.LEARN_TERMS || [];

  check('articles loaded', articles.length >= 20, `${articles.length}`);
  check('glossary terms loaded', terms.length === 38, `${terms.length}`);
  check('all three topics present',
    ['training', 'nutrition', 'reference'].every((t) => articles.some((a) => a.topic === t)),
    [...new Set(articles.map((a) => a.topic))].join(', '));

  const prose = articles
    .flatMap((a) => (a.body || []).flatMap((s) => [...(s.p || []), ...(s.list || [])]))
    .concat(terms.map((t) => t.short));

  // Baseline's programme vocabulary, and its promises about what the app does.
  const banned = [
    [/\bprogramme\b/i, 'refers to a programme FitForge does not have'],
    [/\bweek[ -]\d/i, 'refers to a numbered programme week'],
    [/\bthe app (does|looks|shows|never|builds|will|drops|deloads)/i, 'claims an app behaviour']
  ];
  for (const [re, why] of banned) {
    const hit = prose.find((p) => re.test(p));
    check(`no prose ${why}`, !hit, hit ? hit.slice(0, 110) : '');
  }

  check('every nutrition article is marked as such',
    articles.filter((a) => a.topic === 'nutrition').length === 7);
  check('the nutrition disclaimer exists and names a professional',
    /dietitian|doctor/i.test(g.LEARN_NUTRITION_NOTE || ''));
  // A "more" pointing at a slug that does not exist renders a dead button.
  const bad = terms.filter((t) => t.more && !articles.some((a) => a.slug === t.more));
  check('every term cross-reference resolves to a real article', bad.length === 0,
    bad.map((t) => `${t.id}->${t.more}`).join(', '));
  // Ordinary words must stay unlinked or prose becomes a minefield.
  const ordinary = ['set', 'rep', 'block', 'volume', 'machine'];
  const wrongAuto = terms.filter((t) => t.auto && ordinary.includes(t.label.toLowerCase()));
  check('ordinary words are not auto-linked', wrongAuto.length === 0,
    wrongAuto.map((t) => t.label).join(', '));

  // The glossary article's headings were generated from baseline's group
  // labels at port time and kept its screen names ("On the session screen")
  // after the labels here were renamed — the page and the popovers disagreed
  // about what the app is called. They have to stay the same list.
  const glossary = articles.find((a) => a.slug === 'glossary');
  const headings = (glossary.body || []).filter((s) => s.h).map((s) => s.h);
  check('the glossary page groups match LEARN_GROUP_LABELS',
    JSON.stringify(headings) === JSON.stringify(Object.values(g.LEARN_GROUP_LABELS || {})),
    headings.join(' | '));
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const c = await b.newContext({ viewport: { width: 390, height: 900 }, serviceWorkers: 'block', hasTouch: true });
  const page = await c.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push('PAGEERR: ' + e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/Failed to load|net::/.test(m.text())) errs.push('con: ' + m.text().slice(0, 180));
  });
  const T = (s) => `[data-testid="${s}"]`;
  const gone = (s) => page.evaluate((sel) => !document.querySelector(sel), s);

  await page.goto('http://localhost:8199/index.html', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.Storage && window.U);
  await page.evaluate(async () => {
    await Storage.clearAll();
    for (const [k, v] of Object.entries({
      onboarded: true, sex: 'male', dob: '1995-04-12', heightCm: 180,
      activityLevel: 'moderate', kcalGoal: 2200
    })) await Storage.setPref(k, v);
    await Storage.saveBodyweight({ date: U.todayISO(), kg: 82 });
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(3800);
  await page.evaluate(() => document.querySelector('.dock button:last-child').click());
  await page.waitForTimeout(1400);

  // ================= 1. the tab =================
  console.log('\n=== 1. the tab leads with the Learning Centre ===');
  check('the section is on the tab', !!(await page.$(T('learn-section'))));
  // The dock is icon-only — the label is the tooltip and the accessible name,
  // not visible text, so textContent is empty here by design.
  check('the dock calls it Learn',
    (await page.evaluate(() => document.querySelector('.dock button:last-child').getAttribute('title'))) === 'Learn');
  // The library was not moved out to make room for it.
  check('the exercise library is still on the same tab', !!(await page.$('.exercise-card, .library-grid, [data-testid="body-map"]')));
  check('training is the topic it opens on',
    await page.evaluate(() => document.querySelector('[data-testid="learn-tab-training"]').classList.contains('active')));
  const trainingCards = (await page.$$(T('learn-card'))).length;
  check('training articles are listed', trainingCards === 13, String(trainingCards));
  await page.screenshot({ path: `${SS}/learn_list.png` });

  // ================= 2. topics =================
  console.log('\n=== 2. switching topic ===');
  check('training carries no dietary disclaimer', await gone(T('learn-note')));
  await page.click(T('learn-tab-nutrition'));
  await page.waitForTimeout(500);
  check('nutrition articles are listed', (await page.$$(T('learn-card'))).length === 7);
  check('and the disclaimer is shown with them', !!(await page.$(T('learn-note'))));
  await page.click(T('learn-tab-reference'));
  await page.waitForTimeout(500);
  check('reference holds the glossary', (await page.$$(T('learn-card'))).length === 1);

  // ================= 3. reading one =================
  console.log('\n=== 3. reading an article ===');
  await page.click(T('learn-tab-training'));
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    [...document.querySelectorAll('[data-testid="learn-card"]')]
      .find((x) => /Progressive overload/i.test(x.textContent)).click();
  });
  await page.waitForTimeout(700);
  check('it opens', !!(await page.$(T('learn-overlay'))));
  check('with the right title',
    (await page.$eval(T('article-title'), (e) => e.textContent)) === 'Progressive overload');
  check('a training article shows no dietary disclaimer', await gone(T('article-note')));
  const links = (await page.$$(T('term-link'))).length;
  check('jargon in the prose is tappable', links >= 1, `${links} linked`);

  // ================= 4. tap to explain =================
  console.log('\n=== 4. tap to explain ===');
  await page.click(T('term-link'));
  await page.waitForTimeout(400);
  check('the definition appears in place', !!(await page.$(T('term-popover'))));
  const short = await page.$eval('.term-popover-short', (e) => e.textContent);
  check('and it says something', short.length > 20, short.slice(0, 60));
  // Its "more" is this very article, so offering to open it would do nothing.
  check('no Read more back to the article you are already in', await gone(T('term-popover-more')));
  await page.screenshot({ path: `${SS}/learn_popover.png` });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  check('Escape closes the popover first', await gone(T('term-popover')));
  check('and leaves the article open', !!(await page.$(T('learn-overlay'))));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  check('a second Escape closes the article', await gone(T('learn-overlay')));

  // ================= 5. the glossary =================
  console.log('\n=== 5. the glossary page ===');
  await page.click(T('learn-tab-reference'));
  await page.waitForTimeout(400);
  await page.click(T('learn-card'));
  await page.waitForTimeout(700);
  const gloss = await page.evaluate(() => ({
    headings: [...document.querySelectorAll('.article-h')].map((h) => h.textContent),
    items: document.querySelectorAll('.article-list li').length
  }));
  check('it is grouped', gloss.headings.length >= 4, gloss.headings.join(' | '));
  check('and every term is on it', gloss.items === 38, String(gloss.items));
  check('it uses FitForge vocabulary, not baseline screen names',
    !gloss.headings.some((h) => /session screen|cardio screen|exercise pages/i.test(h)),
    gloss.headings.join(' | '));
  await page.evaluate(() => document.querySelector('[data-testid="learn-back"]').click());
  await page.waitForTimeout(400);

  // ================= 6. the Watch button =================
  console.log('\n=== 6. every exercise offers a form video ===');
  const watch = await page.evaluate(() => {
    // Straight at the helper: opening 127 detail sheets is a slower way to
    // learn the same thing, and the button reads its URL from here.
    const ids = Object.keys(window.EXERCISE_VIDEOS || {});
    const all = window.EXERCISE_DB;
    const missing = all.filter((e) => !e.name || !e.id).length;
    const curatedEx = all.find((e) => ids.includes(e.id));
    const plainEx = all.find((e) => !ids.includes(e.id));
    const dead = all.filter((e) => {
      const v = (window.EXERCISE_VIDEOS || {})[e.id];
      const url = v && v.url ? v.url : 'https://www.youtube.com/results?search_query=' + encodeURIComponent(e.name + ' proper form technique');
      return !/^https:\/\/www\.youtube\.com\//.test(url);
    }).length;
    return { count: ids.length, total: all.length, missing, dead, curatedEx: curatedEx && curatedEx.id, plainEx: plainEx && plainEx.id };
  });
  check('some exercises have a curated clip', watch.count === 25, String(watch.count));
  check('every exercise resolves to a real YouTube URL', watch.dead === 0,
    `${watch.dead} of ${watch.total} did not`);
  check('every exercise has the name the fallback search needs', watch.missing === 0);

  // and the button itself, on both branches
  for (const [id, expectCurated] of [[watch.curatedEx, '1'], [watch.plainEx, '0']]) {
    // The grid is filtered and virtualised, so search the exercise into view
    // rather than hoping its card is already mounted.
    const name = await page.evaluate((exId) => window.EXERCISE_DB.find((e) => e.id === exId).name, id);
    await page.evaluate((n) => {
      const s = document.querySelector('.library-search, input[type="search"], [data-testid="library-search"]')
        || [...document.querySelectorAll('input')].find((i) => /search/i.test(i.placeholder || ''));
      if (s) { s.value = n; s.dispatchEvent(new Event('input', { bubbles: true })); }
    }, name);
    await page.waitForTimeout(700);
    const clicked = await page.evaluate((exId) => {
      const card = document.querySelector(`[data-ex-id="${exId}"]`);
      if (!card) return false;
      card.click();
      return true;
    }, id);
    check(`${expectCurated === '1' ? 'a curated' : 'an uncurated'} exercise opens its detail`, clicked, id);
    await page.waitForTimeout(800);
    const info = await page.evaluate(() => {
      const b = document.querySelector('[data-testid="watch-form"]');
      return b ? { href: b.getAttribute('href'), curated: b.getAttribute('data-curated'), text: b.textContent.trim() } : null;
    });
    check(`${expectCurated === '1' ? 'curated' : 'uncurated'} exercise shows a Watch button`, !!info);
    if (info) {
      check(`  and it points at YouTube on the ${expectCurated === '1' ? 'curated' : 'search'} branch`,
        info.curated === expectCurated && /^https:\/\/www\.youtube\.com\//.test(info.href),
        `${info.text} -> ${info.href.slice(0, 68)}`);
    }
    await page.screenshot({ path: `${SS}/learn_watch_${expectCurated}.png` });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
  }

  console.log('\nERRORS:', errs.length ? errs : 'none');
  console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
