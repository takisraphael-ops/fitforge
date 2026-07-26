// Hit-tested tap helper for the Playwright suites.
//
// The suites used to drive the app with `element.click()` inside
// page.evaluate. That dispatches the event straight at the node and never asks
// whether a finger could reach it, so a control buried under another layer
// still reports success — which is how a weekly-plan sheet rendered behind its
// own overlay passed every test it had.
//
// safeTap asserts the element is actually the thing at its own coordinates
// before tapping, and shouts if it is not.
const MISSES = [];

/** Where a tap at this element's own position would actually land. */
async function reachability(page, selector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return { state: 'missing' };
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return { state: 'hidden' };
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return { state: 'zero-size' };
    // Non-convex controls (SVG zones) can have a centre that is not on them,
    // so sample a grid and accept if any point lands.
    const pts = [[r.left + r.width / 2, r.top + r.height / 2]];
    for (const fx of [0.25, 0.5, 0.75]) for (const fy of [0.25, 0.5, 0.75]) {
      pts.push([r.left + r.width * fx, r.top + r.height * fy]);
    }
    let by = null, onScreen = false;
    for (const [x, y] of pts) {
      if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) continue;
      onScreen = true;
      const hit = document.elementFromPoint(x, y);
      if (!hit) { by = by || '(nothing)'; continue; }
      if (hit === el || el.contains(hit) || hit.contains(el)) return { state: 'reachable' };
      if (!by) {
        const cn = typeof hit.className === 'string' ? hit.className : (hit.className && hit.className.baseVal) || '';
        by = (hit.getAttribute('data-testid') ? '#' + hit.getAttribute('data-testid') : cn || hit.tagName);
      }
    }
    return { state: onScreen ? 'covered' : 'offscreen', by };
  }, selector);
}

/**
 * Tap a selector for real, after checking a finger could land on it.
 * Scrolls it into view first — a fixed bottom bar overlapping content at the
 * current scroll position is normal, not a defect.
 */
// Transient full-screen layers a real finger has to wait out: the cold-start
// splash (~3.5s) and the tab-transition loader. element.click() sailed through
// both, which is why the suites were quietly tapping at a covered screen.
const TRANSIENT_LAYERS = ['#splash', '.tabload'];

async function waitForApp(page, timeout = 8000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    const covered = await page.evaluate((sels) => sels.some((sel) => {
      const s = document.querySelector(sel);
      if (!s) return false;
      const cs = getComputedStyle(s);
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return false;
      const r = s.getBoundingClientRect();
      return r.width > 2 && r.height > 2;
    }), TRANSIENT_LAYERS).catch(() => false);
    if (!covered) return true;
    await page.waitForTimeout(150);
  }
  return false;
}

async function safeTap(page, selector, { label = null, optional = false } = {}) {
  const name = label || selector;
  await waitForApp(page);
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'center', inline: 'nearest' });
  }, selector);
  await page.waitForTimeout(120);

  const r = await reachability(page, selector);
  if (r.state === 'missing' || r.state === 'hidden' || r.state === 'zero-size') {
    if (optional) return false;
    MISSES.push(`${name}: ${r.state}`);
    throw new Error(`safeTap: ${name} is ${r.state}`);
  }
  if (r.state === 'covered') {
    MISSES.push(`${name}: covered by ${r.by}`);
    throw new Error(`safeTap: ${name} is covered by ${r.by} — a real finger could not tap it`);
  }
  if (r.state === 'offscreen') {
    if (optional) return false;
    MISSES.push(`${name}: offscreen even after scrolling`);
    throw new Error(`safeTap: ${name} is offscreen even after scrolling`);
  }
  await page.tap(selector);
  return true;
}

/** Print anything safeTap refused to tap. Call at the end of a suite. */
function reportTapMisses() {
  console.log('unreachable controls encountered:', MISSES.length ? MISSES : 'none');
  return MISSES.length;
}

module.exports = { safeTap, reachability, reportTapMisses, waitForApp };
