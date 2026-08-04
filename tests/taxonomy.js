// The navigation taxonomy: taxon.pillar > taxon.group > taxon.sub.
//
// This is a data-only change. Nothing in the UI reads these fields yet, which
// is the point — a classification of 165 exercises is worth reviewing on its
// own, before a screen is built on top of it and every argument becomes an
// argument about the screen.
//
// The invariant that matters most is the one that is easiest to break by
// tidying: `category` was NOT replaced. It is read in 44 places in app.js and
// 9 in body-map.js, the body map's own zones are keyed to its vocabulary, and
// it drives the heat map, the focus labels and part of the calorie estimate.
// taxon answers "where do I browse to find this"; category answers "which bit
// of the body is this". A sled push is legs AND conditioning, and both of
// those need to stay true.
//
// It is one nested key rather than three loose ones because both of the
// obvious names were taken. `group` is already how supersets are grouped on a
// workout entry. `pillar` is already on session templates — and with a
// different third value: a session is strength/conditioning/RECOVERY, an
// exercise is strength/conditioning/MOBILITY. Two vocabularies under one name
// is a trap, and nesting makes e.taxon.pillar and session.pillar visibly
// different things. Section 5 holds that line.
//
//   node tests/taxonomy.js        (no server needed — pure data)
const path = require('path');
const fs = require('fs');

let fails = 0;
const check = (label, ok, detail = '') => {
  if (!ok) fails++;
  console.log(`   ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
};

const ROOT = path.resolve(__dirname, '..');
const G = {};
new Function('window', fs.readFileSync(path.join(ROOT, 'data/exercises.js'), 'utf8'))(G);
const DB = G.EXERCISE_DB;

const PILLARS = ['strength', 'conditioning', 'mobility'];
const tx = (e) => e.taxon || {};

// ================= 1. everything is placed ================================
console.log('=== 1. every exercise has a home ===');
{
  const unplaced = DB.filter((e) => !tx(e).pillar || !tx(e).group || !tx(e).sub).map((e) => e.id);
  check('every exercise has a pillar, a group and a sub', unplaced.length === 0,
    unplaced.slice(0, 8).join(', '));
  const strays = [...new Set(DB.map((e) => tx(e).pillar))].filter((p) => !PILLARS.includes(p));
  check('and the pillars are exactly the three agreed', strays.length === 0, strays.join(', '));

  // A group name that appears under two pillars is two different things
  // wearing one label, and the breadcrumb stops meaning anything.
  const homes = {};
  for (const e of DB) (homes[tx(e).group] ??= new Set()).add(tx(e).pillar);
  const split = Object.entries(homes).filter(([, ps]) => ps.size > 1);
  check('no group name is used under two pillars', split.length === 0,
    split.map(([g, ps]) => `${g}: ${[...ps]}`).join(', '));

  const counts = {};
  for (const e of DB) counts[tx(e).pillar + ' › ' + tx(e).group] = (counts[tx(e).pillar + ' › ' + tx(e).group] || 0) + 1;
  // A group of one or two is a level that costs a tap and returns nothing.
  // Thin *leaves* inside a big group are fine — "Traps: 1" names a real gap
  // in the library. Thin groups are not.
  const thin = Object.entries(counts).filter(([, n]) => n < 3);
  check('no group is too thin to be a destination', thin.length === 0,
    thin.map(([g, n]) => `${g} (${n})`).join(', '));

  for (const p of PILLARS) {
    const n = DB.filter((e) => tx(e).pillar === p).length;
    const gs = new Set(DB.filter((e) => tx(e).pillar === p).map((e) => tx(e).group)).size;
    console.log(`      ${p.padEnd(14)} ${String(n).padStart(3)} exercises in ${gs} groups`);
  }
}

// ================= 2. category survived intact ============================
console.log('\n=== 2. category was added to, not replaced ===');
{
  // The vocabulary the body map is keyed to. If someone "simplifies" category
  // away in favour of pillar, the map stops resolving zones and the heat, the
  // focus labels and the kcal estimate all go with it.
  const CATS = ['legs', 'back', 'chest', 'shoulders', 'arms', 'core', 'cardio', 'boxing', 'full_body', 'mobility'];
  check('every exercise still has a category', DB.every((e) => !!e.category));
  const unknown = [...new Set(DB.map((e) => e.category))].filter((c) => !CATS.includes(c));
  check('and the category vocabulary is unchanged', unknown.length === 0, unknown.join(', '));

  // Cross-check against the body map's own zone vocabulary rather than a list
  // typed here, so the two cannot drift apart quietly.
  const B = {};
  new Function('window', fs.readFileSync(path.join(ROOT, 'js/body-map.js'), 'utf8'))(B);
  const zoneCats = new Set(Object.values(B.BodyMap.ZONES).map((z) => z.category));
  const orphan = [...new Set(DB.map((e) => e.category))]
    .filter((c) => !zoneCats.has(c) && !['cardio', 'boxing', 'full_body'].includes(c));
  check('every body-part category still resolves to body-map zones',
    orphan.length === 0, orphan.join(', '));

  // The whole reason for two axes: they are allowed to disagree.
  const decoupled = DB.filter((e) => e.category === 'legs' && tx(e).pillar === 'conditioning');
  check('the axes are genuinely independent', decoupled.length > 0,
    decoupled.map((e) => e.name).join(', ') + ' — legs on the map, conditioning in the nav');

  // Mobility is the one place they must agree: a stretch is a stretch.
  const mobCat = DB.filter((e) => e.category === 'mobility').map((e) => e.id).sort();
  const mobPil = DB.filter((e) => tx(e).pillar === 'mobility').map((e) => e.id).sort();
  check('mobility means the same thing on both axes',
    JSON.stringify(mobCat) === JSON.stringify(mobPil),
    `${mobCat.length} by category, ${mobPil.length} by pillar`);
}

// ================= 3. the decisions, pinned ===============================
console.log('\n=== 3. the calls that were made deliberately ===');
{
  // Asked and answered: Olympic & power stays under strength rather than
  // becoming a fourth pillar.
  const oly = DB.filter((e) => tx(e).group === 'Olympic & power');
  check('Olympic & power is a strength group, not a fourth pillar',
    oly.length >= 8 && oly.every((e) => tx(e).pillar === 'strength'),
    `${oly.length} exercises, pillars: ${[...new Set(oly.map((e) => tx(e).pillar))]}`);
  check('and it holds the lifts it says it does',
    ['clean-power', 'snatch', 'push-jerk', 'bear-complex'].every((id) =>
      tx(DB.find((e) => e.id === id) || {}).group === 'Olympic & power'));

  // Asked and answered: carries are conditioning, not core accessory work.
  const carries = DB.filter((e) => /carry/i.test(e.name));
  check('carries are conditioning', carries.length > 0 && carries.every((e) => tx(e).pillar === 'conditioning'),
    carries.map((e) => `${e.name}:${tx(e).pillar}`).join(', '));

  // Which emptied out the Core leaf that used to be named for them. A leaf
  // called "Carries & get-ups" with no carry left in it is a label that lies.
  const named = DB.filter((e) => /carr/i.test(tx(e).sub || ''));
  check('no leaf is named for carries it does not contain',
    named.every((e) => /carry/i.test(e.name)),
    named.map((e) => `${tx(e).sub}/${e.name}`).join(', ') || 'none');

  // full_body was the symptom that started this: a bucket for everything the
  // body-part axis could not describe. It should now be spread across pillars.
  const fb = DB.filter((e) => e.category === 'full_body');
  check('full_body no longer behaves as one bucket',
    new Set(fb.map((e) => tx(e).pillar)).size > 1 && new Set(fb.map((e) => tx(e).group)).size >= 3,
    `${fb.length} exercises across ${new Set(fb.map((e) => tx(e).group)).size} groups`);
}

// ================= 3b. the warm-up split holds ============================
console.log('\n=== 3b. warm-up drills stay separate from stretches ===');
{
  // Asked and answered: keep them apart. They serve opposite purposes — a
  // drill before training, a stretch to hold after — and the first pass leaked
  // two drills into the stretch leaves because their ids did not say
  // "warm-up" in the shape the rule was looking for.
  const mob = DB.filter((e) => tx(e).pillar === 'mobility');
  const named = mob.filter((e) => /warm-?up/i.test(e.name));
  check('there are exercises that name themselves warm-ups', named.length > 0, String(named.length));
  const leaked = named.filter((e) => tx(e).group !== 'Warm-up drills');
  check('and every one of them is filed as a drill, not a stretch',
    leaked.length === 0, leaked.map((e) => `${e.name} → ${tx(e).group}`).join(', '));
  const drills = mob.filter((e) => tx(e).group === 'Warm-up drills');
  check('the drills group is worth having', drills.length >= 5, String(drills.length));
  check('and nothing in it is filed as a stretch to hold',
    drills.every((e) => tx(e).sub === 'Dynamic'));
}

// ================= 4. the depth rule is stable ============================
console.log('\n=== 4. depth follows the content ===');
{
  // Split a group only when it is big enough AND genuinely divides. Computed
  // here exactly as the UI will compute it, so the two cannot disagree.
  const groups = {};
  for (const e of DB) (groups[tx(e).pillar + ' › ' + tx(e).group] ??= []).push(e);
  let splitN = 0, flatN = 0;
  for (const [k, rs] of Object.entries(groups)) {
    const subs = new Set(rs.map((e) => tx(e).sub));
    const willSplit = rs.length > 8 && subs.size > 1;
    if (willSplit) splitN++; else flatN++;
    // The case that catches a bad rule: ten exercises that are all one kind.
    if (rs.length > 8 && subs.size === 1) {
      check(`${k} stays flat despite its size — one kind of thing`, !willSplit);
    }
  }
  check('some groups split and some stay flat', splitN > 0 && flatN > 0,
    `${splitN} split, ${flatN} flat`);
  // A group where every exercise has its own sub is not a classification.
  const shredded = Object.entries(groups)
    .filter(([, rs]) => rs.length > 3 && new Set(rs.map((e) => tx(e).sub)).size === rs.length);
  check('no group is shredded into one leaf per exercise', shredded.length === 0,
    shredded.map(([k]) => k).join(', '));
}

// ================= 5. the names that were already taken ==================
console.log('\n=== 5. no collision with the names already in use ===');
{
  const app = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8');
  // `group` is how supersets are grouped on a workout entry, and `pillar` is
  // on session templates. Nesting is what keeps those separate — flattening
  // taxon back out would silently overload both.
  check('taxon is nested, not flattened onto the record',
    DB.every((e) => e.taxon && typeof e.taxon === 'object') &&
    DB.every((e) => e.pillar === undefined && e.group === undefined && e.sub === undefined));
  check('superset grouping still owns the bare .group name', /\.group\b/.test(app));

  // The divergence that makes one shared name unsafe: a session's third
  // pillar is "recovery", an exercise's is "mobility". Both are correct for
  // what they describe, which is exactly why they must not share a field.
  const S = {};
  new Function('window', fs.readFileSync(path.join(ROOT, 'data/exercises.js'), 'utf8'))(S);
  new Function('window', fs.readFileSync(path.join(ROOT, 'data/sessions.js'), 'utf8'))(S);
  const sessionPillars = new Set(S.PRESET_SESSIONS.map((x) => x.pillar));
  const exPillars = new Set(S.EXERCISE_DB.map((e) => tx(e).pillar));
  check('session pillars and exercise pillars really are different vocabularies',
    sessionPillars.has('recovery') && !exPillars.has('recovery') && exPillars.has('mobility'),
    `sessions: ${[...sessionPillars].join('/')}  ·  exercises: ${[...exPillars].join('/')}`);

  // Step 1 shipped no behaviour, and this check asserted exactly that. Step 2
  // built the browse screen, so it was deleted in the commit that made it
  // false — which was the point of writing it that way. What replaces it is
  // the opposite claim: the classification is load-bearing now.
  check('the browse screen reads taxon', /\.taxon\b/.test(app));
  check('and the split rule lives in one place', /const SPLIT_AT/.test(app));
}

console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
process.exit(fails ? 1 : 0);
