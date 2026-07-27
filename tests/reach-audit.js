// Reachability audit.
//
// The weekly-plan bug — a sheet rendered behind its own overlay, invisible and
// untappable — passed every test, because the tests drove it with
// element.click(), which dispatches straight at the node and never asks
// whether a finger could reach it.
//
// This walks the real app surface by surface and, for every interactive
// element on the topmost layer, checks that elementFromPoint at its centre
// actually lands on that element. It finds the whole class of bug, including
// on screens that have no test at all.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const SS = process.env.SHOT_DIR || require('os').tmpdir();

// Roots that, when present, own the screen. The audit only inspects the
// topmost one — background content is *supposed* to be unreachable behind a
// scrim, and flagging it would bury the real findings.
const LAYER_ROOTS = [
  '.tabload', '.splash', '.celebration', '.ivr', '.wplan', '.wplan-sheet',
  '.rest-overlay', '.warmup-overlay', '.numpad-overlay', '.qa-fork-overlay',
  '.pquiz', '.wsheet-overlay', '.modal-overlay'
];

const AUDIT = `
window.__audit = async function (layerRoots) {
  // Find the layer that actually owns the screen. A sheet nested inside an
  // overlay wins over its own container — otherwise every control behind the
  // sheet's scrim reads as unreachable, which is exactly what a scrim is for
  // and would bury any real finding.
  const cands = [];
  layerRoots.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      const z = parseInt(cs.zIndex, 10);
      cands.push({ el: el, sel: sel, z: Number.isFinite(z) ? z : 0 });
    });
  });
  let root = document.body, rootName = 'page';
  if (cands.length) {
    const inner = cands.filter(function (a) {
      return !cands.some(function (b) { return b.el !== a.el && a.el.contains(b.el); });
    });
    const pool = inner.length ? inner : cands;
    let best = pool[0];
    for (const cnd of pool) {
      if (cnd.z > best.z) best = cnd;
      else if (cnd.z === best.z &&
        (best.el.compareDocumentPosition(cnd.el) & Node.DOCUMENT_POSITION_FOLLOWING)) best = cnd;
    }
    root = best.el; rootName = best.sel;
  }

  const sel = 'button, [role="button"], a[href], input, select, textarea, .wday, .xrow, .sess-card, .wheel-item';
  const nodes = [...root.querySelectorAll(sel)];
  if (root !== document.body && root.matches(sel)) nodes.push(root);

  const out = { layer: rootName, checked: 0, offscreen: 0, hidden: 0, recovered: 0, fails: [] };
  const vw = window.innerWidth, vh = window.innerHeight;

  for (const el of nodes) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.pointerEvents === 'none' || cs.opacity === '0') { out.hidden++; continue; }
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) { out.hidden++; continue; }
    // Only a centre point genuinely on screen can be hit-tested. Clamping it
    // into the viewport — which this did at first — makes every scrolled-away
    // control report whatever happens to sit at the clamped coordinate, which
    // is noise, not a finding.
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    if (x < 0 || x > vw || y < 0 || y > vh) { out.offscreen++; continue; }
    out.checked++;
    const first = probe(el, x, y);
    if (first.ok) continue;
    // A fixed bottom bar overlaps whatever happens to sit under it at the
    // current scroll position — that is normal, not a defect. The question
    // worth asking is whether the element can be reached AT ALL, so anything
    // that fails is scrolled into view and retested before being reported.
    el.scrollIntoView({ block: 'center', inline: 'nearest' });
    await new Promise(r => setTimeout(r, 90));
    const r2 = el.getBoundingClientRect();
    const x2 = r2.left + r2.width / 2, y2 = r2.top + r2.height / 2;
    if (r2.width < 2 || r2.height < 2 || x2 < 0 || x2 > vw || y2 < 0 || y2 > vh) { out.offscreen++; out.checked--; continue; }
    const second = probe(el, x2, y2);
    if (second.ok) { out.recovered++; continue; }
    out.fails.push({ label: describe(el), by: second.by });
  }
  return out;

  // Reachable = SOME point on the control accepts a tap. A single centre
  // probe is wrong for non-convex shapes: the body map's shoulder zone is two
  // separate deltoids, so the centre of its bounding box lands on the chest.
  // Sample the centre first, then a grid, and pass if any point lands.
  function probe(el, cx, cy) {
    const r = el.getBoundingClientRect();
    const pts = [[cx, cy]];
    for (const fx of [0.25, 0.5, 0.75]) {
      for (const fy of [0.25, 0.5, 0.75]) {
        pts.push([r.left + r.width * fx, r.top + r.height * fy]);
      }
    }
    let firstMiss = null;
    for (const [x, y] of pts) {
      if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) continue;
      const hit = document.elementFromPoint(x, y);
      if (!hit) { firstMiss = firstMiss || '(nothing)'; continue; }
      if (hit === el || el.contains(hit) || hit.contains(el)) return { ok: true };
      if (hit.closest && hit.closest(sel) === el) return { ok: true };
      firstMiss = firstMiss || describe(hit);
    }
    return { ok: false, by: firstMiss || '(offscreen)' };
  }

  function describe(el) {
    const tid = el.getAttribute && el.getAttribute('data-testid');
    const txt = (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 26);
    // SVG elements have an SVGAnimatedString className, hence the baseVal.
    const cn = typeof el.className === 'string' ? el.className
      : (el.className && el.className.baseVal) || '';
    return (tid ? '#' + tid : (cn ? String(cn).split(' ')[0] : el.tagName.toLowerCase()))
      + (txt ? ' "' + txt + '"' : '');
  }
};
`;

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--autoplay-policy=no-user-gesture-required'] });
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', hasTouch: true });
  const page = await c.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERR: ' + e.message));

  await page.goto('http://localhost:8199/index.html', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.Storage && window.U);
  await page.evaluate(async () => {
    await Storage.clearAll();
    for (const [k, v] of Object.entries({
      onboarded: true, sex: 'male', dob: '1995-04-12', heightCm: 180,
      activityLevel: 'moderate', goalIntent: 'cut', kcalGoal: 2200, kcalGoalMode: 'manual',
      warmupPrompt: false, weeklyPlan: { mon: 'focus:push', wed: 'focus:pull', fri: 'focus:legs' }
    })) await Storage.setPref(k, v);
    await Storage.saveBodyweight({ date: U.todayISO(), kg: 82 });
    await Storage.saveSupplement({ id: 's1', name: 'Creatine', defaultDose: 5, unit: 'g', reminderTime: '09:00' });
    const iso = n => { const d = new Date(); d.setDate(d.getDate() - n); return U.todayISO(d); };
    await Storage.saveMeal({ id: 'm1', name: 'Chicken Rice', kcal: 600, protein: 40, carbs: 60, fat: 12, section: 'lunch', time: '13:00', date: iso(2) });
    await Storage.saveWorkout({
      id: 'w1', date: iso(2), completedAt: Date.now() - 2 * 864e5, name: 'Push Day', durationSec: 3300,
      exercises: [{ exerciseId: 'bench-press-barbell', name: 'Barbell Bench Press', category: 'chest',
        muscles: ['Pectorals'], type: 'weighted', sets: [{ weight: 80, reps: 8, done: true }] }]
    });
  });
  await page.reload({ waitUntil: 'networkidle' });
  // The splash overlay holds for 3.5s and owns the screen until dismissed.
  await page.waitForTimeout(600);
  await page.evaluate(() => { const s = document.getElementById('splash'); if (s) s.remove(); });
  await page.waitForTimeout(2200);
  await page.addScriptTag({ content: AUDIT });

  const results = [];
  const check = async (name, setup, { shots = false } = {}) => {
    try { await setup(); } catch (e) { results.push({ name, error: String(e).slice(0, 120) }); return; }
    await sleep(900);
    // The audit helper is lost on reload/navigation, so re-inject defensively.
    const has = await page.evaluate(() => typeof window.__audit === 'function');
    if (!has) await page.addScriptTag({ content: AUDIT });
    const r = await page.evaluate(roots => window.__audit(roots), LAYER_ROOTS);
    results.push({ name, ...r });
    if (shots) await page.screenshot({ path: `${SS}/audit_${name.replace(/\W+/g, '_')}.png` });
  };

  const closeLayers = () => page.evaluate(() => {
    document.querySelectorAll('.modal-overlay, .wplan, .ivr, .warmup-overlay, .numpad-overlay, .qa-fork-overlay, .pquiz, .wsheet-overlay, .rest-overlay, .celebration').forEach(n => n.remove());
  });
  const tapT = async (t) => { await closeLayers(); await page.evaluate(s => document.querySelector(s) && document.querySelector(s).click(), t); };

  // ---- top-level tabs ----
  await check('home', async () => { await tapT('[data-testid="dock-home"]'); }, { shots: true });
  await check('nutrition', async () => { await tapT('[data-testid="dock-nutrition"]'); await sleep(1800); });
  await check('you', async () => { await tapT('[data-testid="dock-stats"]'); await sleep(1600); });
  await check('library', async () => { await tapT('[data-testid="dock-library"]'); await sleep(1400); });

  // The History segment of "You" — its own screen, with the back-log entry
  // and a repeat button on every logged session.
  await check('history', async () => {
    await tapT('[data-testid="dock-stats"]');
    await sleep(1800);
    await page.evaluate(() => document.querySelector('[data-testid="seg-history"]').click());
    await sleep(1400);
  }, { shots: true });

  await check('past-session-picker', async () => {
    await page.evaluate(() => document.querySelector('[data-testid="log-past-session"]').click());
    await sleep(800);
    await page.evaluate(() => document.querySelector('[data-testid="date-sheet-ok"]').click());
    await sleep(1300);
  });

  // ---- overlays and sheets ----
  await check('quick-sheet', async () => {
    await closeLayers();
    await page.evaluate(() => document.querySelector('[data-testid="dock-fab"]').click());
  }, { shots: true });

  await check('start-exercises', async () => {
    await closeLayers();
    await page.evaluate(() => document.querySelector('[data-testid="dock-fab"]').click());
    await sleep(600);
    await page.evaluate(() => document.querySelector('[data-testid="quick-start-workout"]').click());
    await sleep(1500);
  });

  await check('start-sessions', async () => {
    await page.evaluate(() => document.querySelector('[data-testid="start-mode-sessions"]').click());
    await sleep(1200);
  }, { shots: true });

  await check('session-detail', async () => {
    await page.evaluate(() => {
      const btns = [...document.querySelectorAll('.sess-card .btn')];
      const d = btns.find(x => /Details/i.test(x.textContent));
      if (d) d.click();
    });
    await sleep(900);
  });

  await check('weekly-plan', async () => {
    await closeLayers();
    await page.evaluate(() => document.querySelector('[data-testid="dock-home"]').click());
    await sleep(1200);
    await page.evaluate(() => {
      const b = document.querySelector('[data-testid="hero-edit-week"]') || document.querySelector('[data-testid="hero-plan-week"]');
      if (b) b.click();
    });
    await sleep(1000);
  }, { shots: true });

  await check('weekly-plan-sheet', async () => {
    await page.evaluate(() => document.querySelector('[data-testid="wplan-day-mon"]').click());
    await sleep(800);
  }, { shots: true });

  await check('settings', async () => {
    await closeLayers();
    await page.evaluate(() => document.querySelector('[data-testid="dock-stats"]').click());
    await sleep(1600);
    await page.evaluate(() => document.querySelector('[data-testid="you-settings"]').click());
    await sleep(1200);
  }, { shots: true });

  await check('meal-fork', async () => {
    await closeLayers();
    await page.evaluate(() => document.querySelector('[data-testid="dock-fab"]').click());
    await sleep(600);
    await page.evaluate(() => document.querySelector('[data-testid="quick-log-meal"]').click());
    await sleep(1400);
  }, { shots: true });

  await check('exercise-detail', async () => {
    await closeLayers();
    await page.evaluate(() => document.querySelector('[data-testid="dock-library"]').click());
    await sleep(1600);
    await page.evaluate(() => {
      const card = document.querySelector('.exercise-card') || document.querySelector('.xrow');
      if (card) card.click();
    });
    await sleep(1100);
  });

  await check('active-workout', async () => {
    await closeLayers();
    await page.evaluate(async () => {
      await Storage.saveWorkout({
        id: 'wa', name: 'Audit Session', date: U.todayISO(), startedAt: Date.now(), completedAt: null,
        exercises: [{ exerciseId: 'bench-press-barbell', name: 'Barbell Bench Press', category: 'chest', type: 'weighted',
          sets: [{ weight: 80, reps: 8, done: false }, { weight: 80, reps: 8, done: false }] }]
      });
      await Storage.setPref('activeWorkoutId', 'wa');
    });
    await page.reload({ waitUntil: 'networkidle' });
    await sleep(2400);
    await page.evaluate(() => document.querySelector('[data-testid="dock-fab"]').click());
    await sleep(600);
    await page.evaluate(() => document.querySelector('[data-testid="quick-start-workout"]').click());
    await sleep(1600);
  }, { shots: true });

  await check('rest-timer', async () => {
    await page.evaluate(() => {
      const b = document.querySelector('[data-testid="set-done-0"]');
      if (b) b.click();
    });
    await sleep(1200);
  }, { shots: true });

  await check('numpad', async () => {
    await closeLayers();
    await sleep(400);
    await page.evaluate(() => {
      const i = document.querySelector('[data-testid="set-weight-0"]');
      if (i) i.click();
    });
    await sleep(900);
  }, { shots: true });

  // ---- canary ----
  // A checker that can only ever print "ok" proves nothing. Cover a control
  // that just passed and confirm the audit notices; if this does not fail,
  // every other "ok" above is worthless.
  await closeLayers();
  await page.evaluate(() => document.querySelector('[data-testid="dock-home"]').click());
  await sleep(1200);
  const canary = await page.evaluate(async (roots) => {
    const before = await window.__audit(roots);
    // Full-viewport, exactly like the real bug: a layer the user cannot
    // scroll out from under. A blocker pinned to one control would be escaped
    // by the audit's own scroll-into-view retry, which is correct behaviour
    // for that retry but makes for a canary that proves nothing.
    const blocker = document.createElement('div');
    blocker.className = 'audit-canary';
    blocker.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:transparent';
    document.body.appendChild(blocker);
    const after = await window.__audit(roots);
    blocker.remove();
    return { beforeFails: before.fails.length, afterFails: after.fails.length,
      caught: after.fails.some(f => /audit-canary/.test(f.by)) };
  }, LAYER_ROOTS);
  console.log('=== canary: a deliberately covered control ===');
  console.log(`   before ${canary.beforeFails} fails, after ${canary.afterFails} fails, blocker identified: ${canary.caught}`);
  console.log(`   the audit detects a covered control: ${canary.caught ? 'PASS' : 'FAIL — this tool is not measuring anything'}\n`);

  // ---- report ----
  console.log('=== reachability audit ===\n');
  let totalChecked = 0, totalFails = 0;
  for (const r of results) {
    if (r.error) { console.log(`${r.name.padEnd(20)} ERROR ${r.error}`); continue; }
    totalChecked += r.checked;
    totalFails += r.fails.length;
    const status = r.fails.length ? `${r.fails.length} UNREACHABLE` : 'ok';
    console.log(`${r.name.padEnd(20)} layer=${String(r.layer).padEnd(18)} checked=${String(r.checked).padStart(3)} offscreen=${String(r.offscreen).padStart(3)} scrolled-clear=${String(r.recovered).padStart(3)}  ${status}`);
    for (const f of r.fails) console.log(`    ✗ ${f.label}   covered by  ${f.by}`);
  }
  console.log(`\ntotal interactive elements hit-tested: ${totalChecked}`);
  console.log(`unreachable: ${totalFails}`);
  console.log('page errors:', errs.length ? errs : 'none');
  await b.close();
})();
