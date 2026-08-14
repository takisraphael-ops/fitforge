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
// Which hero you get depends on what today is, so every fixture states it.
// Without this the suite passes or fails on the day of the week: the training
// sections quietly got the rest hero on a Wednesday and looked for controls
// that were never rendered.

// Sessions placed inside the current calendar week, never in the future.
const seed = async (o) => {
  await Storage.clearAll();
  for (const [k, v] of Object.entries({ onboarded: true, sex: 'male', dob: '1995-04-12', heightCm: 180,
    activityLevel: 'moderate', kcalGoal: 2600, profileName: 'Raphael', radialDiscovered: true,
    theme: o.theme || 'dark' })) await Storage.setPref(k, v);
  const plan = { ...o.plan };
  const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  if (o.todaySlot) plan[WEEKDAYS[(new Date().getDay() + 6) % 7]] = o.todaySlot;
  await Storage.setPref('weeklyPlan', plan);
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
    await open({ plan: TRAIN, todaySlot: 'preset-pull', weekWork: 2 });
    const m = await page.evaluate(() => {
      const hdr = document.getElementById('header');
      const hero = document.querySelector('[data-testid="today-hero"]');
      // By testid, not by class: the CTA's class changed when it became the
      // ignition cap and this check silently reported -1 instead of failing loudly.
      const cta = document.querySelector('[data-testid="hero-start-workout"], [data-testid="hero-start-focus"]');
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
    await open({ plan: REST, todaySlot: 'rest', weekWork: 4, lastWeek: true });
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
      const stored = await Storage.getWorkouts();
      const all = stored.filter(w => w.completedAt && week.has(w.date));
      let vol = 0, secs = 0;
      for (const w of all) {
        for (const ex of w.exercises || []) vol += U.volume(ex.sets);
        secs += w.durationSec || 0;
      }
      // The last-week fixture, and what it would add if the window leaked.
      const old = stored.find(w => w.id === 'old');
      const oldVol = old ? (old.exercises || []).reduce((s, ex) => s + U.volume(ex.sets), 0) : 0;
      return {
        sessions: all.length, volume: Math.round(vol), mins: Math.round(secs / 60),
        oldExists: !!old, oldInWindow: !!old && week.has(old.date), oldVol: Math.round(oldVol)
      };
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
      //
      // This used to pattern-match the rendered string for "2.0k" and reject
      // anything shaped like it. On a Monday the fixture can only place one
      // session in the current week — the loop stops at today — and one
      // session is 3 x 90 x 8 = 2160 kg, which renders "2.2k" and matched the
      // guard. The suite failed one day in seven, on a day nobody had run it,
      // and the thing it flagged was correct behaviour.
      //
      // Compare numbers instead: the old session must exist, must fall outside
      // the window, and its volume must not be in the total.
      check('the last-week fixture is actually there', want.oldExists);
      check('and falls outside this week\'s window', !want.oldInWindow);
      const leaked = want.volume + want.oldVol;
      const asShown = (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v));
      check('last week is not counted',
        want.oldVol > 0 && got[1].value !== asShown(leaked),
        `shown ${got[1].value}; would be ${asShown(leaked)} if it leaked`);
    }
    await page.screenshot({ path: `${SS}/landing_rest.png` });
  }

  console.log('\n=== 3. nothing banked yet shows nothing, not a row of zeroes ===');
  {
    await open({ plan: REST, todaySlot: 'rest', weekWork: 0 });
    const shown = await page.evaluate(() => !!document.querySelector('[data-testid="rest-banked"]'));
    check('no banked block when the week is empty', !shown);
    check('the rest hero still renders',
      await page.evaluate(() => !!document.querySelector('[data-testid="today-hero"]')));
  }

  // =============== 4. the wash, and only two of it =========================
  console.log('\n=== 4. day and night tint the hero, in both themes ===');
  {
    for (const theme of ['dark', 'light']) {
      await open({ plan: TRAIN, todaySlot: 'preset-pull', weekWork: 2, theme });
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

  // =============== 5. the ignition cluster =================================
  //
  // Starting a workout is the biggest commitment the app asks for and it was a
  // rounded rectangle identical to every other primary button. It is a round
  // cap in a bezel now, ringed by the week and beside a labelled satellite.
  //
  // The checks are about what makes it work rather than what makes it look
  // good: it is round and large, it still scrolls the page, the ring tells the
  // truth about the week (against storage, and against the ledger cell it
  // shares a card with — never against itself), the satellite has a name, and
  // holding it offers the same three ways in on every day of the week.
  console.log('\n=== 5. the ignition cluster ===');
  {
    await open({ plan: TRAIN, todaySlot: 'preset-pull', weekWork: 2 });
    const cap = await page.evaluate(() => {
      const n = document.querySelector('[data-testid="hero-start-workout"]');
      if (!n) return null;
      const r = n.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      const swap = document.querySelector('[data-testid="hero-swap"]');
      return {
        w: Math.round(r.width), h: Math.round(r.height), left: Math.round(r.left),
        radiusPct: /50%|9999/.test(getComputedStyle(n).borderTopLeftRadius) ||
                   parseFloat(getComputedStyle(n).borderTopLeftRadius) >= r.width / 2 - 1,
        reachable: !!(hit && (hit === n || n.contains(hit))),
        // 116px of the page scroller: a drag starting here has to still scroll.
        touchAction: getComputedStyle(n).touchAction,
        ringOn: !!n.querySelector('.ignition-ring'),
        // The satellite was an unlabelled glyph; it needs a readable name.
        swapText: swap ? swap.textContent.trim() : null
      };
    });
    console.log('   ', JSON.stringify(cap));
    check('there is a start cap', !!cap);
    check('it is round', !!cap && cap.w === cap.h && cap.radiusPct, cap && `${cap.w}x${cap.h}`);
    check('and big — bigger than any other control on the screen',
      !!cap && cap.w >= 100, cap && String(cap.w));
    check('it is hit-testable at its own centre', !!cap && cap.reachable);
    check('its ring clears the screen edge', !!cap && cap.left >= 12, cap && String(cap.left));
    check('it does not swallow scrolls', !!cap && cap.touchAction !== 'none', cap && cap.touchAction);
    check('the swap control has a name, not just a glyph',
      !!cap && !!cap.swapText && cap.swapText.length > 3, cap && cap.swapText);

    // Hold: three ways in, the same three whatever the day holds.
    const at = await page.evaluate(() => {
      const r = document.querySelector('[data-testid="hero-start-workout"]').getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    await page.mouse.move(at.x, at.y);
    await page.mouse.down();
    await page.waitForTimeout(600);
    const rad = await page.evaluate(() => {
      const o = document.querySelector('[data-testid="radial-overlay"]');
      if (!o) return { open: false };
      const s = [...o.querySelectorAll('.radial-slice')];
      return {
        open: true,
        ids: s.map(x => x.getAttribute('data-testid')),
        unreachable: s.filter(x => {
          const b = x.getBoundingClientRect();
          const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
          return !(hit && (hit === x || x.contains(hit)));
        }).map(x => x.getAttribute('data-testid'))
      };
    });
    console.log('   hold ->', JSON.stringify(rad));
    check('holding it offers the other ways to start',
      rad.open && JSON.stringify(rad.ids) === JSON.stringify(['radial-empty', 'radial-sessions', 'radial-repeat']),
      JSON.stringify(rad.ids));
    check('all of them reachable', rad.open && rad.unreachable.length === 0, JSON.stringify(rad.unreachable));
    await page.screenshot({ path: `${SS}/landing_ignition_hold.png` });
    await page.mouse.up();
    await page.waitForTimeout(200);
    await page.evaluate(() => document.querySelectorAll('[data-testid="radial-overlay"]').forEach(n => n.remove()));

    // A plain tap still starts today's session.
    await open({ plan: TRAIN, todaySlot: 'preset-pull', weekWork: 2 });
    const at2 = await page.evaluate(() => {
      const r = document.querySelector('[data-testid="hero-start-workout"]').getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    await page.mouse.click(at2.x, at2.y);
    await page.waitForTimeout(1400);
    check('a tap starts the workout',
      await page.evaluate(() => Storage.getPref('activeWorkoutId').then(v => !!v)));

    // The week ring is state, not ambience: one segment per goal session,
    // lit as banked — counted from what is painted (lit vs dim segments),
    // asserted against what is actually in storage, and required to agree to
    // the digit with the ledger's Week cell in the same card. The expected
    // count is derived from storage rather than hardcoded at the fixture's
    // 2, because the fixture seeds from Monday and stops at today — run on a
    // Monday it banks one, and a literal here would fail on the weekday.
    await open({ plan: TRAIN, todaySlot: 'preset-pull', weekWork: 2 });
    const banked = await page.evaluate(async () => {
      const ws = await Storage.getWorkouts();
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      return ws.filter(w => w.completedAt && new Date(w.date) >= weekAgo).length;
    });
    const ring = await page.evaluate(() => {
      const svg = document.querySelector('[data-testid="hero-start-workout"] .ignition-ring');
      const segs = svg ? [...svg.querySelectorAll('path, circle')] : [];
      const ledger = document.querySelector('[data-testid="ledger-week"] .ledger-value');
      return {
        segments: segs.length,
        lit: segs.filter(s => parseFloat(s.style.opacity) > 0.6).length,
        ledgerText: ledger ? ledger.textContent.trim() : null
      };
    });
    console.log('   ', JSON.stringify({ banked, ...ring }));
    check('the ring has one segment per goal session', ring.segments === 4, String(ring.segments));
    check('and lights exactly the sessions banked', ring.lit === banked, `${ring.lit} vs ${banked} in storage`);
    check('and agrees with the ledger Week cell to the digit',
      ring.ledgerText === `${banked} of 4`, String(ring.ledgerText));

    // A goal of one is a full circle, not a zero-length arc — and two banked
    // sessions against a goal of one caps at all-lit rather than overdrawing.
    await page.evaluate(() => Storage.setPref('weeklyWorkoutGoal', 1));
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(4200);
    const one = await page.evaluate(() => {
      const svg = document.querySelector('[data-testid="hero-start-workout"] .ignition-ring');
      const segs = svg ? [...svg.querySelectorAll('path, circle')] : [];
      return {
        n: segs.length,
        shape: segs[0] ? segs[0].tagName.toLowerCase() : null,
        lit: segs.filter(s => parseFloat(s.style.opacity) > 0.6).length
      };
    });
    check('a goal of one draws one full circle, lit once banked',
      one.n === 1 && one.shape === 'circle' && one.lit === 1, JSON.stringify(one));

    // The open day used to fall back to a plain rectangle and a second
    // stacked button — the one state that abandoned the ignition, on exactly
    // the day the other ways in matter most. It gets the same cluster now:
    // same cap, same truthful ring, the satellite carrying the sessions
    // library. The fixture plans tomorrow and leaves today unset, which is
    // what makes today an open day whatever weekday the suite runs on.
    const notToday = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'][((new Date().getDay() + 6) % 7 + 1) % 7];
    await open({ plan: { [notToday]: 'preset-push' }, weekWork: 2 });
    const openDay = await page.evaluate(() => {
      const n = document.querySelector('[data-testid="hero-start-open"]');
      if (!n) return null;
      const r = n.getBoundingClientRect();
      const svg = n.querySelector('.ignition-ring');
      const segs = svg ? [...svg.querySelectorAll('path, circle')] : [];
      const swap = document.querySelector('[data-testid="hero-swap"]');
      return {
        w: Math.round(r.width),
        round: Math.round(r.width) === Math.round(r.height) &&
          (/50%|9999/.test(getComputedStyle(n).borderTopLeftRadius) ||
           parseFloat(getComputedStyle(n).borderTopLeftRadius) >= r.width / 2 - 1),
        segments: segs.length,
        lit: segs.filter(s => parseFloat(s.style.opacity) > 0.6).length,
        swapText: swap ? swap.textContent.trim() : null,
        oldButtons: !!document.querySelector('[data-testid="hero-pick-session"]')
      };
    });
    console.log('   open day ->', JSON.stringify(openDay));
    check('an open day gets the ignition, not a rectangle',
      !!openDay && openDay.round && openDay.w >= 100, openDay ? `${openDay.w}px` : 'missing');
    check('its ring still tells the week',
      !!openDay && openDay.segments === 4 && openDay.lit === banked,
      openDay ? `${openDay.lit}/${openDay.segments} vs ${banked} in storage` : 'missing');
    check('the satellite carries the sessions library',
      !!openDay && openDay.swapText === 'Pick a session', openDay && openDay.swapText);
    check('and the stacked pair of buttons is gone', !!openDay && !openDay.oldButtons);

    // The hold hint retires itself. Every fixture above seeds
    // radialDiscovered true, so first flip it back: a fresh user is told
    // "Hold Start for more"; one real use of the hold sets the pref (that is
    // attachRadial's own discovery mark), and on the next render the line is
    // advice already taken and stops appearing — the quick sheet tip's rule,
    // now enforced on the ignition too.
    await open({ plan: TRAIN, todaySlot: 'preset-pull', weekWork: 2 });
    await page.evaluate(() => Storage.setPref('radialDiscovered', false));
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(4200);
    const hintFresh = await page.evaluate(() => {
      const h = document.querySelector('.ignition-hint');
      return h ? h.textContent.trim() : null;
    });
    check('a fresh user is taught the hold', hintFresh === 'Hold Start for more', String(hintFresh));

    const at3 = await page.evaluate(() => {
      const r = document.querySelector('[data-testid="hero-start-workout"]').getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    await page.mouse.move(at3.x, at3.y);
    await page.mouse.down();
    await page.waitForTimeout(600);
    await page.mouse.up();
    await page.waitForTimeout(200);
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(4200);
    const hintAfter = await page.evaluate(async () => ({
      discovered: await Storage.getPref('radialDiscovered'),
      hint: !!document.querySelector('.ignition-hint')
    }));
    check('one real hold retires it for good',
      hintAfter.discovered === true && !hintAfter.hint, JSON.stringify(hintAfter));

    // The status line is last-trained context now, not a constant READY.
    // Four truths, each against storage: a planned session never done before
    // says so; one with history says when it last happened; an open day says
    // when anything was; and "Ready" survives only with no history at all.
    await open({ plan: TRAIN, todaySlot: 'preset-pull', weekWork: 2 });
    const firstTime = await page.evaluate(() =>
      document.querySelector('[data-testid="ignition-status"]')?.textContent.trim());
    check('a planned session never done before says so',
      firstTime === 'First time', String(firstTime));

    // Bank this very session yesterday (by templateId) and the line becomes
    // a date — "yesterday" is weekday-proof, unlike the Monday-seeded bank.
    await page.evaluate(async () => {
      const d = new Date(); d.setDate(d.getDate() - 1);
      await Storage.saveWorkout({
        id: 'pull-yesterday', name: 'Renamed', templateId: 'preset-pull',
        date: U.todayISO(d), startedAt: d.getTime(),
        completedAt: d.getTime() + 50 * 60 * 1000, durationSec: 50 * 60,
        exercises: [{ exerciseId: 'bench-press-barbell', name: 'Bench', type: 'weighted',
          sets: [{ weight: 60, reps: 8, done: true }] }]
      });
    });
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(4200);
    const lastTime = await page.evaluate(() =>
      document.querySelector('[data-testid="ignition-status"]')?.textContent.trim());
    check('a session with history says when it last happened',
      lastTime === 'Last time · yesterday', String(lastTime));

    // The open day speaks to any training, recomputed from storage with the
    // suite's own arithmetic rather than read back from the app's.
    await open({ plan: { [notToday]: 'preset-push' }, weekWork: 2 });
    const openStatus = await page.evaluate(async () => {
      const shown = document.querySelector('[data-testid="ignition-status"]')?.textContent.trim();
      const ws = (await Storage.getWorkouts()).filter(w => w.completedAt && w.date);
      const latest = ws.reduce((a, b) => (a.date > b.date ? a : b));
      const d = Math.round((Date.parse(U.todayISO()) - Date.parse(latest.date)) / 86400000);
      const want = d <= 0 ? 'today' : d === 1 ? 'yesterday' : `${d} days ago`;
      return { shown, want: `Last trained · ${want}` };
    });
    check('an open day says when anything was last trained',
      openStatus.shown === openStatus.want, JSON.stringify(openStatus));

    await open({ plan: TRAIN, todaySlot: 'preset-pull', weekWork: 0 });
    const fresh = await page.evaluate(() =>
      document.querySelector('[data-testid="ignition-status"]')?.textContent.trim());
    check('with no history at all it still just says Ready',
      fresh === 'Ready', String(fresh));

    // The hold cue rides the week ring, not a foreign instrument on the cap.
    // Mid-hold: the ring's track sweeps, its duration pinned to the radial's
    // own constants (parsed from the source, so drift is a failure); the
    // small centred fill ring is gone for this trigger; the ghost previews —
    // which are the radial's knowledge of where its slices land — survive.
    // The release steps 60px off the cap first, so no click fires and no
    // workout starts under the remaining checks.
    await open({ plan: TRAIN, todaySlot: 'preset-pull', weekWork: 2 });
    const src = fs.readFileSync(path.resolve(__dirname, '..', 'js', 'app.js'), 'utf8');
    const holdMs = Number((src.match(/RADIAL_HOLD_MS = (\d+)/) || [])[1]);
    const hintMs = Number((src.match(/RADIAL_HINT_MS = (\d+)/) || [])[1]);
    const at4 = await page.evaluate(() => {
      const r = document.querySelector('[data-testid="hero-start-workout"]').getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    await page.mouse.move(at4.x, at4.y);
    await page.mouse.down();
    await page.waitForTimeout(260);   // past the hint's 130ms, short of the 420ms hold
    const mid = await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="hero-start-workout"]');
      const arc = btn.querySelector('.ignition-hold-arc circle');
      const cs = arc ? getComputedStyle(arc) : null;
      return {
        holding: btn.classList.contains('is-holding'),
        anim: cs ? cs.animationName : null,
        durMs: cs ? Math.round(parseFloat(cs.animationDuration) * 1000) : null,
        centredRing: !!document.querySelector('.radial-hint-ring'),
        ghosts: document.querySelectorAll('.radial-hint-ghost').length
      };
    });
    console.log('   mid-hold ->', JSON.stringify(mid));
    check('mid-hold the week ring sweeps',
      mid.holding && mid.anim === 'ignHoldSweep', JSON.stringify({ holding: mid.holding, anim: mid.anim }));
    check('and the sweep ends exactly when the menu opens',
      hintMs + mid.durMs === holdMs, `${hintMs} + ${mid.durMs} vs ${holdMs}`);
    check('the centred fill ring is gone for this trigger', !mid.centredRing);
    check('the ghost previews survive', mid.ghosts === 3, String(mid.ghosts));
    await page.mouse.move(at4.x, at4.y + 60, { steps: 4 });
    await page.mouse.up();
    await page.waitForTimeout(150);
    const withdrawn = await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="hero-start-workout"]');
      return btn ? !btn.classList.contains('is-holding') : false;
    });
    check('releasing short of the hold withdraws the cue', withdrawn);

    // Static by construction: nothing animates, with or without motion off —
    // and mid-hold the sweep sits out along with the rest of the motion.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open({ plan: TRAIN, todaySlot: 'preset-pull', weekWork: 2 });
    const still = await page.evaluate(() => {
      const r = document.querySelector('.ignition-ring');
      return r ? getComputedStyle(r).animationName : 'missing';
    });
    check('with motion off the week ring holds still', still === 'none', still);
    const at5 = await page.evaluate(() => {
      const r = document.querySelector('[data-testid="hero-start-workout"]').getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    await page.mouse.move(at5.x, at5.y);
    await page.mouse.down();
    await page.waitForTimeout(260);
    const quiet = await page.evaluate(() => {
      const arc = document.querySelector('[data-testid="hero-start-workout"] .ignition-hold-arc circle');
      return arc ? getComputedStyle(arc).animationName : 'missing';
    });
    check('and with motion off the hold sweep sits out', quiet === 'none', quiet);
    await page.mouse.move(at5.x, at5.y + 60, { steps: 4 });
    await page.mouse.up();
    await page.emulateMedia({ reducedMotion: 'no-preference' });
  }

  console.log('\nERRORS:', errs.length ? errs : 'none');
  console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
