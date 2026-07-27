// The round timer's readout has to fit inside the ring's hole.
//
// It did not. The label sits ~60px above centre, where the hole's chord is
// only ~166px, but its box was 190px wide — so the ends of a long label ran
// out across the stroke. And because the label is painted in the same accent
// as the ring, that did not look like clipping: the text simply vanished.
// "1-2 STRAIGHT DOWN THE MIDDLE" read as "-2 STRAIGHT DOWN THE".
//
// Geometry, not pixels: a circle's usable width at any row is the chord at
// that height, so every row of the readout is checked against its own chord.
//
//   node tests/round-timer.js   (needs `python3 -m http.server 8199` at the repo root)
const { chromium } = require('/opt/node22/lib/node_modules/playwright/index.js');
const path = require('path');
const fs = require('fs');
const SS = process.env.FITFORGE_SHOTS || path.resolve(__dirname, '..', '.shots');
try { fs.mkdirSync(SS, { recursive: true }); } catch (_) {}

const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0;
const check = (label, ok, detail = '') => { if (!ok) fails++; console.log(`   ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`); };

// The longest labels the app ships, plus one longer than anything authored —
// the fix has to hold for content nobody has written yet.
const LABELS = [
  'Move after every combination',
  '1-2 straight down the middle',
  'Head movement between combinations',
  'A deliberately overlong round label that nobody would ever write'
];

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--autoplay-policy=no-user-gesture-required'] });
  const c = await b.newContext({ viewport: { width: 390, height: 900 }, serviceWorkers: 'block', hasTouch: true });
  const page = await c.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load|net::/.test(m.text())) errs.push('con: ' + m.text().slice(0, 200)); });

  await page.goto('http://localhost:8199/index.html', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.Storage && window.U);
  await page.evaluate(async (labels) => {
    await Storage.clearAll();
    for (const [k, v] of Object.entries({ onboarded: true, sex: 'male', dob: '1995-04-12', heightCm: 180, activityLevel: 'moderate', kcalGoal: 2200, warmupPrompt: false })) await Storage.setPref(k, v);
    await Storage.saveBodyweight({ date: U.todayISO(), kg: 82 });
    const steps = labels.map(l => ({ sec: 180, intensity: 'hard', label: l, work: true }));
    await Storage.saveWorkout({
      id: 'aw', name: 'Boxing', date: U.todayISO(), startedAt: Date.now(),
      exercises: [{
        exerciseId: 'heavy-bag', name: 'Heavy Bag', category: 'boxing', type: 'interval',
        rounds: { rounds: labels.length, workSec: 180, restSec: 0, vocab: 'rounds' },
        plan: { steps },
        sets: steps.map(s => ({ seconds: s.sec, label: s.label, done: false }))
      }]
    });
    await Storage.setPref('activeWorkoutId', 'aw');
  }, LABELS);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(3600);
  await page.evaluate(() => {
    const r = document.querySelector('[data-testid="button-resume-workout"]');
    if (r) r.click(); else document.querySelector('[data-testid="dock-fab"]').click();
  });
  await page.waitForTimeout(1400);

  console.log('=== the button says what it starts ===');
  const cta = await page.evaluate(() => {
    const b = document.querySelector('[data-testid="start-interval-run"]');
    return b ? b.textContent.trim() : null;
  });
  console.log('   CTA ->', JSON.stringify(cta));
  check('a boxing exercise offers rounds, not a "guided run"', /rounds/i.test(cta || ''), cta);

  await page.evaluate(() => document.querySelector('[data-testid="start-interval-run"]').click());
  await page.waitForTimeout(1500);

  console.log('\n=== every readout row fits the ring it sits in ===');
  for (let i = 0; i < LABELS.length; i++) {
    const geo = await page.evaluate(() => {
      const ring = document.querySelector('.ivr-ring');
      const rr = ring.getBoundingClientRect();
      const cx = rr.left + rr.width / 2, cy = rr.top + rr.height / 2;
      // The hole is the mask's transparent core: 78% of the ring's diameter.
      const holeR = (rr.width * 0.78) / 2;
      const rows = [];
      for (const sel of ['[data-testid="ivr-label"]', '[data-testid="ivr-clock"]', '[data-testid="ivr-next"]']) {
        const el = document.querySelector(sel);
        if (!el || getComputedStyle(el).display === 'none') continue;
        const r = el.getBoundingClientRect();
        if (r.width < 2) continue;
        // Worst case is whichever of the row's edges sits furthest from centre.
        const dy = Math.max(Math.abs(r.top - cy), Math.abs(r.bottom - cy));
        const chord = 2 * Math.sqrt(Math.max(0, holeR * holeR - dy * dy));
        rows.push({
          row: sel.replace(/.*ivr-|"]/g, ''),
          text: (el.textContent || '').trim().slice(0, 34),
          width: Math.round(r.width), chord: Math.round(chord),
          fits: r.width <= chord + 1
        });
      }
      return { label: (document.querySelector('[data-testid="ivr-label"]') || {}).textContent, rows };
    });
    console.log(`   ${JSON.stringify(geo.label)}`);
    for (const row of geo.rows) {
      check(`  ${row.row} fits the hole at its height`, row.fits,
        `${row.width}px wide, ${row.chord}px available`);
    }
    if (i === 0) await page.screenshot({ path: `${SS}/roundtimer_label.png` });
    if (i < LABELS.length - 1) {
      await page.evaluate(() => document.querySelector('[data-testid="ivr-skip"]').click());
      await page.waitForTimeout(1100);
    }
  }

  // A label too long to fit must be visibly truncated, never silently dropped.
  console.log('\n=== an overlong label is ellipsised, not vanished ===');
  const clamp = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="ivr-label"]');
    const cs = getComputedStyle(el);
    return { clamp: cs.webkitLineClamp, overflow: cs.overflow, shown: el.clientHeight, full: el.scrollHeight };
  });
  console.log('   label box ->', JSON.stringify(clamp));
  check('it clamps to a line count rather than overflowing', clamp.clamp !== 'none', clamp.clamp);

  console.log('\nERRORS:', errs.length ? errs : 'none');
  console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
