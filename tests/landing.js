// The Home landing screen: what it spends the first fold on, and the two
// things that fill or tint it.
//
// It used to spend 173px of an 844px screen — a fifth — on a logo bar carrying
// no controls and a greeting set larger than the session it sat above. The
// first section holds that back, because layout regressions arrive one
// innocuous margin at a time and nothing else in the suite would notice.
//
// The other two sections cover the rest-day summary and the day/night wash.
// The summary is derived arithmetic shown as fact, so it is asserted against
// what is actually in storage rather than against itself.
//
//   node tests/landing.js   (needs `python3 -m http.server 8199` at the repo root)
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

const REST = { mon: 'rest', tue: 'rest', wed: 'rest', thu: 'rest', fri: 'rest', sat: 'rest', sun: 'rest' };
const TRAIN = { mon: 'preset-push', tue: 'preset-pull', wed: 'rest', thu: 'preset-legs', fri: 'preset-push', sat: 'rest', sun: 'rest' };

// Sessions placed inside the current calendar week, never in the future.
const seed = async (o) => {
  await Storage.clearAll();
  for (const [k, v] of Object.entries({ onboarded: true, sex: 'male', dob: '1995-04-12', heightCm: 180,
    activityLevel: 'moderate', kcalGoal: 2600, profileName: 'Raphael', radialDiscovered: true,
    theme: o.theme || 'dark' })) await Storage.setPref(k, v);
  await Storage.setPref('weeklyPlan', o.plan);
  const iso = d => U.todayISO(d);
  const mon = new Date(); mon.setDate(mon.getDate() - ((mon.getDay() + 6) % 7));
  const now = new Date();
  for (let i = 0; i < (o.weekWork || 0); i++) {
    const d = new Date(mon); d.setDate(mon.getDate() + i);
    if (d > now) break;
    await Storage.saveWorkout({
      id: 'wk' + i, name: 'Push', date: iso(d), startedAt: d.getTime(),
      completedAt: d.getTime() + 55 * 60 * 1000, durationSec: 55 * 60,
      exercises: [{ exerciseId: 'bench-press-barbell', name: 'Bench', type: 'weighted',
        sets: [{ weight: 90, reps: 8, done: true }, { weight: 90, reps: 8, done: true }, { weight: 90, reps: 8, done: true }] }]
    });
  }
  // A session from *last* week, which must not be counted.
  if (o.lastWeek) {
    const d = new Date(mon); d.setDate(mon.getDate() - 3);
    await Storage.saveWorkout({
      id: 'old', name: 'Push', date: iso(d), startedAt: d.getTime(),
      completedAt: d.getTime() + 90 * 60 * 1000, durationSec: 90 * 60,
      exercises: [{ exerciseId: 'bench-press-barbell', name: 'Bench', type: 'weighted',
        sets: [{ weight: 200, reps: 10, done: true }] }]
    });
  }
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

  const open = async (o) => {
    await page.evaluate(seed, o);
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(4200);
    await page.evaluate(() => document.querySelectorAll('[data-testid="tab-loader"],.splash').forEach(n => n.remove()));
  };

  // =============== 1. the first fold is spent on the subject ================
  console.log('=== 1. the landing screen leads with today, not with chrome ===');
  {
    await open({ plan: TRAIN, weekWork: 2 });
    const m = await page.evaluate(() => {
      const hdr = document.getElementById('header');
      const hero = document.querySelector('[data-testid="today-hero"]');
      const cta = document.querySelector('.today-hero-start');
      const px = el => el ? parseFloat(getComputedStyle(el).fontSize) : 0;
      // Every bit of text painted above the fold, by size.
      let biggest = { size: 0, text: '' };
      for (const n of document.querySelectorAll('.view *')) {
        const r = n.getBoundingClientRect();
        if (r.top > 844 || r.bottom < 0) continue;
        const t = [...n.childNodes].filter(x => x.nodeType === 3).map(x => x.textContent.trim()).join('');
        if (!t) continue;
        const s = parseFloat(getComputedStyle(n).fontSize);
        if (s > biggest.size) biggest = { size: s, text: t.slice(0, 24) };
      }
      return {
        headerVisible: !!(hdr && getComputedStyle(hdr).display !== 'none' && hdr.getBoundingClientRect().height > 0),
        heroTop: hero ? Math.round(hero.getBoundingClientRect().top) : -1,
        ctaTop: cta ? Math.round(cta.getBoundingClientRect().top) : -1,
        titlePx: px(document.querySelector('.today-hero-title')),
        ringPx: px(document.querySelector('.energy-ring-main')),
        biggest
      };
    });
    console.log('   ', JSON.stringify(m));
    check('no logo bar', !m.headerVisible);
    check('the hero starts in the first 100px', m.heroTop >= 0 && m.heroTop < 100, String(m.heroTop));
    check('Start workout is above the fold', m.ctaTop > 0 && m.ctaTop < 500, String(m.ctaTop));
    // The point of the whole pass: the session title is the display line.
    check('the session title is the biggest text on the screen',
      m.biggest.size === m.titlePx, `${m.biggest.size}px "${m.biggest.text}" vs title ${m.titlePx}px`);
    check('and it beats the food ring', m.titlePx > m.ringPx, `${m.titlePx} vs ${m.ringPx}`);
    await page.screenshot({ path: `${SS}/landing.png` });
  }

  // =============== 2. the rest day shows what the rest is for ==============
  console.log('\n=== 2. a rest day is not a void ===');
  {
    await open({ plan: REST, weekWork: 4, lastWeek: true });
    const got = await page.evaluate(() => {
      const bk = document.querySelector('[data-testid="rest-banked"]');
      if (!bk) return null;
      return [...bk.querySelectorAll('.rest-banked-cell')].map(cell => ({
        value: cell.querySelector('.rest-banked-value').textContent.trim(),
        unit: cell.querySelector('.rest-banked-unit').textContent.trim()
      }));
    });
    // Recompute from storage, not from the screen.
    const want = await page.evaluate(async () => {
      const mon = new Date(); mon.setDate(mon.getDate() - ((mon.getDay() + 6) % 7));
      const iso = d => U.todayISO(d);
      const week = new Set(Array.from({ length: 7 }, (_, i) => {
        const d = new Date(mon); d.setDate(mon.getDate() + i); return iso(d);
      }));
      const all = (await Storage.getWorkouts()).filter(w => w.completedAt && week.has(w.date));
      let vol = 0, secs = 0;
      for (const w of all) {
        for (const ex of w.exercises || []) vol += U.volume(ex.sets);
        secs += w.durationSec || 0;
      }
      return { sessions: all.length, volume: Math.round(vol), mins: Math.round(secs / 60) };
    });
    console.log('   shown  ', JSON.stringify(got));
    console.log('   storage', JSON.stringify(want));
    check('the banked block is there', !!got && got.length === 3, JSON.stringify(got));
    if (got && got.length === 3) {
      check('sessions match storage', got[0].value === String(want.sessions),
        `${got[0].value} vs ${want.sessions}`);
      const expVol = want.volume >= 1000 ? `${(want.volume / 1000).toFixed(1)}k` : String(want.volume);
      check('volume matches storage', got[1].value === expVol, `${got[1].value} vs ${expVol}`);
      const expTime = want.mins < 60 ? String(want.mins)
        : `${Math.floor(want.mins / 60)}h ${String(want.mins % 60).padStart(2, '0')}`;
      check('time matches storage', got[2].value === expTime, `${got[2].value} vs ${expTime}`);
      // The fixture puts a 200kg x 10 session in the previous week on purpose.
      check('last week is not counted', !/\b(2|20)\.?\dk\b/.test(got[1].value) && want.sessions < 5,
        `${got[1].value}, ${want.sessions} sessions`);
    }
    await page.screenshot({ path: `${SS}/landing_rest.png` });
  }

  console.log('\n=== 3. nothing banked yet shows nothing, not a row of zeroes ===');
  {
    await open({ plan: REST, weekWork: 0 });
    const shown = await page.evaluate(() => !!document.querySelector('[data-testid="rest-banked"]'));
    check('no banked block when the week is empty', !shown);
    check('the rest hero still renders',
      await page.evaluate(() => !!document.querySelector('[data-testid="today-hero"]')));
  }

  // =============== 4. the wash, and only two of it =========================
  console.log('\n=== 4. day and night tint the hero, in both themes ===');
  {
    for (const theme of ['dark', 'light']) {
      await open({ plan: TRAIN, weekWork: 2, theme });
      const r = await page.evaluate(() => {
        const read = () => getComputedStyle(document.documentElement).getPropertyValue('--hero-wash-a').trim();
        const auto = document.documentElement.getAttribute('data-daypart');
        document.documentElement.setAttribute('data-daypart', 'day');
        const day = read();
        document.documentElement.setAttribute('data-daypart', 'night');
        const night = read();
        document.documentElement.setAttribute('data-daypart', auto);
        // The hour rule, recomputed rather than trusted.
        const h = new Date().getHours();
        return { auto, day, night, expected: (h >= 19 || h < 6) ? 'night' : 'day' };
      });
      console.log(`   ${theme}`, JSON.stringify(r));
      check(`${theme}: day and night are different washes`, r.day && r.night && r.day !== r.night,
        `${r.day} vs ${r.night}`);
      check(`${theme}: the attribute matches the hour`, r.auto === r.expected, `${r.auto} vs ${r.expected}`);
    }
    // Grain is decoration and must never intercept a tap.
    const grain = await page.evaluate(() => {
      const h = document.querySelector('.today-hero.home-bleed');
      if (!h) return null;
      const cs = getComputedStyle(h, '::after');
      return { img: cs.backgroundImage.slice(0, 24), opacity: cs.opacity, pe: cs.pointerEvents };
    });
    console.log('   grain', JSON.stringify(grain));
    check('the hero carries a grain layer', !!grain && /url\(/.test(grain.img), JSON.stringify(grain));
    check('it is a whisper, not a texture', !!grain && parseFloat(grain.opacity) <= 0.09, grain && grain.opacity);
    check('and it takes no pointer events', !!grain && grain.pe === 'none', grain && grain.pe);
  }

  console.log('\nERRORS:', errs.length ? errs : 'none');
  console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
