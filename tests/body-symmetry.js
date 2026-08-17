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
    // The trailing comma is optional. The last zone in each `regions` object
    // does not have one, and requiring it silently skipped that zone — four of
    // them: both figures' hip_flexors and both figures' back calves.
    for (const m of block.matchAll(/^\s{10}(\w+): \[\n([\s\S]*?)\n\s{10}\],?$/gm)) {
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
  // A zone with nothing on one side is the worst version of this bug, not an
  // edge case to skip — and skipping it is exactly what this line used to do,
  // on the strength of a "(none today)" that was untrue when it was written.
  // The male back's lower_back held two shapes, both right of the midline, and
  // sailed through the sweep that was supposed to have caught it. Division by
  // zero was the only thing that comment was really guarding against.
  const key = `${b.figure} ${b.view} ${b.zone}`;
  if (left === 0 || right === 0) {
    check(`${b.figure} ${b.view} · ${b.zone}`, false,
      `drawn on one side only (L ${left.toFixed(0)} / R ${right.toFixed(0)})`);
    continue;
  }
  const skew = Math.abs(right - left) / Math.max(right, left) * 100;
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

console.log(`\n=== every declared zone is drawn, badged, and nothing more ===`);
// The female back calf was the other class of this bug: not a zone drawn
// unevenly, but a zone missing from one figure entirely — declared in ZONES,
// rendered fine on the male, absent on the female, and invisible in testing
// because every suite drove whichever figure the fixture happened to pick.
// Area symmetry within a figure cannot see it. These checks close that class:
// the declaration table, the artwork, and the badge positions must agree,
// per figure, per view, in both directions.

// ZONES declarations: name -> declared views. Coarse chip-only zones declare
// views: [] and must own no artwork.
const zoneDecls = {};
{
  const zsrc = src.slice(src.indexOf('const ZONES = {'), src.indexOf('const GEOMETRY = {'));
  const heads = [...zsrc.matchAll(/^ {4}(\w+): \{/gm)];
  for (let i = 0; i < heads.length; i++) {
    const seg = zsrc.slice(heads[i].index, i + 1 < heads.length ? heads[i + 1].index : zsrc.length);
    const vm = seg.match(/views:\s*\[([^\]]*)\]/);
    zoneDecls[heads[i][1]] = vm
      ? vm[1].split(',').map((s) => s.trim().replace(/"/g, '')).filter(Boolean)
      : [];
  }
}
check('the parser found the ZONES table', Object.keys(zoneDecls).length > 0,
  `${Object.keys(zoneDecls).length} zones declared`);

// Badge positions per figure + view, parsed the same way the artwork was.
function badgeKeys() {
  const out = {};
  const views = [...src.matchAll(/^ {6}(front|back): \{/gm)].map((m) => ({ view: m[1], at: m.index }));
  for (let i = 0; i < views.length; i++) {
    const block = src.slice(views[i].at, i + 1 < views.length ? views[i + 1].at : src.length);
    const figure = Math.floor(i / 2) === 0 ? 'male' : 'female';
    const bm = block.match(/badges: \{([\s\S]*?)\n {8}\}/);
    out[`${figure} ${views[i].view}`] = new Set(
      bm ? [...bm[1].matchAll(/(\w+): \{/g)].map((m) => m[1]) : []);
  }
  return out;
}

const drawn = {};
for (const b of blocks) {
  const k = `${b.figure} ${b.view}`;
  (drawn[k] = drawn[k] || new Set()).add(b.zone);
}
const badges = badgeKeys();

for (const figure of ['male', 'female']) {
  for (const view of ['front', 'back']) {
    const k = `${figure} ${view}`;
    const drawnHere = drawn[k] || new Set();
    const badgedHere = badges[k] || new Set();
    const declaredHere = Object.keys(zoneDecls).filter((z) => zoneDecls[z].includes(view));

    const undrawn = declaredHere.filter((z) => !drawnHere.has(z));
    check(`${k}: every declared zone has artwork`, undrawn.length === 0,
      undrawn.length ? `missing: ${undrawn.join(', ')}` : `all ${declaredHere.length} drawn`);

    const orphans = [...drawnHere].filter((z) => !(zoneDecls[z] || []).includes(view));
    check(`${k}: every drawn zone is declared for this view`, orphans.length === 0,
      orphans.length ? `undeclared: ${orphans.join(', ')}` : `${drawnHere.size} zones, all declared`);

    const unbadged = [...drawnHere].filter((z) => !badgedHere.has(z));
    const deadBadges = [...badgedHere].filter((z) => !drawnHere.has(z));
    check(`${k}: badges and artwork agree`, unbadged.length === 0 && deadBadges.length === 0,
      unbadged.length || deadBadges.length
        ? `no badge: ${unbadged.join(', ') || '—'} · badge without artwork: ${deadBadges.join(', ') || '—'}`
        : `${badgedHere.size} badges`);
  }
}

console.log(`\n=== every badge sits on its own muscle ===`);
// Existence was pinned above; placement was still on trust. A badge is a
// count bubble drawn at raw {x, y} — nothing relates those coordinates to
// the artwork, so a badge can float off its muscle (or sit on a neighbour)
// and every render succeeds. Not hypothetical: the male back lower_back
// badge was found at (139, 217), five units clear of the body's right flank
// — a fossil of the one-sided artwork this suite's first section caught.
// When the zone was redrawn symmetric about the spine, the badge stayed
// where the old right-heavy artwork had been.
//
// The check is point-in-polygon against the zone's own paths, with a couple
// of units of slack: four badges sit a hair outside an edge (0.1–1.2 units,
// invisible under a 10-unit-radius bubble), and tightening them would be
// churn, not correctness. Fifteen units is a different thing entirely.
const BADGE_SLACK = 2;

const insidePoly = ([x, y], poly) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
  }
  return c;
};
const distToPoly = ([x, y], poly) => {
  let best = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i];
    const [x2, y2] = poly[(i + 1) % poly.length];
    const dx = x2 - x1, dy = y2 - y1;
    const len2 = dx * dx + dy * dy;
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / len2));
    best = Math.min(best, Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy)));
  }
  return best;
};

/** Badge coordinates per figure + view, from the same view blocks. */
function badgePositions() {
  const out = {};
  const views = [...src.matchAll(/^ {6}(front|back): \{/gm)].map((m) => ({ view: m[1], at: m.index }));
  for (let i = 0; i < views.length; i++) {
    const block = src.slice(views[i].at, i + 1 < views.length ? views[i + 1].at : src.length);
    const figure = Math.floor(i / 2) === 0 ? 'male' : 'female';
    const bm = block.match(/badges: \{([\s\S]*?)\n {8}\}/);
    out[`${figure} ${views[i].view}`] = bm
      ? [...bm[1].matchAll(/(\w+): \{ x: ([\d.]+), y: ([\d.]+) \}/g)]
          .map((m) => ({ zone: m[1], x: +m[2], y: +m[3] }))
      : [];
  }
  return out;
}

{
  const artwork = {};
  for (const b of blocks) {
    artwork[`${b.figure} ${b.view} ${b.zone}`] = b.paths.map(points).filter((p) => p.length);
  }
  for (const [where, list] of Object.entries(badgePositions())) {
    for (const badge of list) {
      const polys = artwork[`${where} ${badge.zone}`] || [];
      const on = polys.some((p) => insidePoly([badge.x, badge.y], p));
      const d = on ? 0 : Math.min(...polys.map((p) => distToPoly([badge.x, badge.y], p)), Infinity);
      check(`${where} · ${badge.zone} badge sits on its muscle`, on || d <= BADGE_SLACK,
        on ? 'inside' : `(${badge.x}, ${badge.y}) is ${d.toFixed(1)} units off the artwork`);
    }
  }
}

console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
process.exit(fails ? 1 : 0);
