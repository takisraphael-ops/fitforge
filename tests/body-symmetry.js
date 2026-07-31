// Every bilateral muscle zone must be drawn the same on both sides.
//
// The bug this exists to catch: the male front quads shipped nine paths — five
// for one leg, four for the other. The leg missing the outer strip rendered
// with a dark unhighlighted band down the side of the thigh, and because both
// legs were *present* it read as a shading quirk rather than missing artwork.
// The adductors were worse and had gone unnoticed entirely: one side carried a
// full muscle, the other a 67-unit sliver, a 90% difference.
//
// Nobody was going to spot this by eye on a phone-sized silhouette, and no
// existing suite looked at the geometry at all — tests/muscle-map.js drives the
// map's behaviour (tapping, filtering, heat) and never asks what it draws.
//
// The check is area, not path count. Counting paths would have passed the
// adductors, whose two sides had a plausible-looking 3-vs-1 split, and would
// fail spuriously whenever one side is legitimately drawn as one shape and the
// other as two. Filled area is what the eye actually sees.
//
// Static, no browser.
//
//   node tests/body-symmetry.js
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'js/body-map.js'), 'utf8');

let fails = 0;
const check = (label, ok, detail = '') => {
  if (!ok) fails++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
};

/** The figures are drawn about x = 110.8. Derived from the zone pairs that were
    already correct (calves, biceps, abs all agree on it to within 0.1). */
const AXIS = 110.8;
/** Hand-drawn artwork never mirrors to the pixel; the real faults were 16% and
    90%. Anything past 8% is a missing shape, not a wobbly hand. */
const TOLERANCE = 8;

const points = (d) =>
  [...d.matchAll(/(-?[\d.]+)\s+(-?[\d.]+)/g)].map((m) => [+m[1], +m[2]]);

/** Shoelace. Every path here is a closed polyline of M/L segments, so the
    vertex list is the polygon — no curve flattening needed. */
const area = (pts) => {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a) / 2;
};

// Zones that legitimately straddle the midline rather than coming in pairs.
const CENTRE_ZONES = new Set(['abs', 'core', 'chest_centre']);

// Empty, and meant to stay that way. Fifteen zones were listed here when this
// check was written — every one has since been redrawn by mirroring its fuller
// side, so each figure's two halves are identical by construction rather than
// by a steady hand. A new entry means somebody drew a zone on one side only.
//
// The recorded number would be the skew at the time of listing. The check
// fails if a listed zone gets worse, and also fails if it gets better — a
// fixed zone has to come off this list or the list quietly becomes a lie.
const KNOWN_ASYMMETRIC = {};
/** How far a listed zone may drift before the entry is treated as stale. */
const DRIFT = 1.5;

/** Pull every `zoneName: [ "M…", … ]` block, tagged with the figure and view it
    sits in so a failure names the silhouette to open. */
function zoneBlocks() {
  const out = [];
  const views = [...src.matchAll(/^\s{6}(front|back): \{/gm)].map((m) => ({
    view: m[1],
    at: m.index
  }));
  for (let i = 0; i < views.length; i++) {
    const start = views[i].at;
    const end = i + 1 < views.length ? views[i + 1].at : src.length;
    const figure = Math.floor(i / 2) === 0 ? 'male' : 'female';
    const block = src.slice(start, end);
    for (const m of block.matchAll(/^\s{10}(\w+): \[\n([\s\S]*?)\n\s{10}\],/gm)) {
      if (m[1] === 'silhouette') continue;
      out.push({
        figure,
        view: views[i].view,
        zone: m[1],
        paths: [...m[2].matchAll(/"([^"]+)"/g)].map((p) => p[1])
      });
    }
  }
  return out;
}

console.log('=== bilateral zones are drawn evenly on both sides ===');
const blocks = zoneBlocks();
check('the parser found the zone geometry', blocks.length > 0, `${blocks.length} zone blocks`);

for (const b of blocks) {
  if (CENTRE_ZONES.has(b.zone)) continue;
  let left = 0;
  let right = 0;
  for (const d of b.paths) {
    const pts = points(d);
    if (!pts.length) continue;
    const x0 = Math.min(...pts.map((p) => p[0]));
    const x1 = Math.max(...pts.map((p) => p[0]));
    // A shape centred on the midline (the adductor origin arch) belongs to
    // neither side and would otherwise be charged entirely to one of them.
    if (x0 < AXIS && x1 > AXIS && Math.abs(Math.abs(x0 - AXIS) - Math.abs(x1 - AXIS)) < 3) continue;
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
    if (cx < AXIS) left += area(pts);
    else right += area(pts);
  }
  // Zones drawn entirely on one side (none today) would divide by zero.
  if (left === 0 || right === 0) continue;
  const skew = Math.abs(right - left) / Math.max(right, left) * 100;
  const key = `${b.figure} ${b.view} ${b.zone}`;
  const known = KNOWN_ASYMMETRIC[key];
  const detail = `${skew.toFixed(1)}% apart (L ${left.toFixed(0)} / R ${right.toFixed(0)})`;

  if (known == null) {
    check(`${b.figure} ${b.view} · ${b.zone}`, skew <= TOLERANCE, detail);
    continue;
  }
  if (skew <= TOLERANCE) {
    check(`${b.figure} ${b.view} · ${b.zone} — FIXED, delete its KNOWN_ASYMMETRIC entry`,
      false, detail);
  } else {
    check(`${b.figure} ${b.view} · ${b.zone} (known, tracked at ${known}%)`,
      Math.abs(skew - known) <= DRIFT, detail);
  }
}

console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
process.exit(fails ? 1 : 0);
