// Sweep the suites for existence-only checks.
//
// The bug that prompted this: pastlog_test asserted [data-testid="wd-add-exercise"]
// was present and never tapped it, so a sheet that opened completely empty
// passed. Asserting a control renders is not asserting it works.
//
// This flags, per suite, every INTERACTIVE testid the suite observes but never
// drives. Interactivity is read out of app.js, not guessed from the name, so a
// static label or a container is not reported.
const fs = require('fs');
const path = require('path');

// The app is not one file — body-map.js and interval-runner.js render their
// own testids, and reading only app.js marks every one of them dead.
const JS_DIR = path.resolve(__dirname, '../js');
// Where the Playwright suites live. Defaults to this directory; point it
// somewhere else with `node tests/existence-sweep.js <dir>`.
const DIR = path.resolve(process.argv[2] || __dirname);

// ---------- 1. which testids belong to something a finger can operate ----------
const app = fs.readdirSync(JS_DIR).filter(f => f.endsWith('.js'))
  .map(f => fs.readFileSync(path.join(JS_DIR, f), 'utf8')).join('\n;\n');
const interactive = new Map(); // testid (or prefix) -> why

// Walk every `el("tag", { ... "data-testid": X ... })` and decide from the tag
// and the attribute bag, rather than from what the id is called.
const TAG_RE = /\bel\(\s*"([a-zA-Z]+)"\s*,\s*\{/g;
let m;
while ((m = TAG_RE.exec(app))) {
  const tag = m[1];
  // Balance braces from the attribute object so we read exactly one element's
  // own attributes and not its children's.
  let i = m.index + m[0].length - 1, depth = 0, end = -1;
  for (; i < app.length && i < m.index + 4000; i++) {
    const ch = app[i];
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end < 0) continue;
  const attrs = app.slice(m.index, end + 1);
  const tid = attrs.match(/"data-testid":\s*(?:"([^"]+)"|`([^`$]*)\$\{)/);
  if (!tid) continue;
  const name = tid[1] || (tid[2] + '*');

  const isControl = /^(button|input|select|textarea|a)$/.test(tag);
  const hasHandler = /\bon:\s*\{\s*(click|input|change|keydown|pointerdown|touchstart)/.test(attrs);
  const asButton = /role:\s*"button"/.test(attrs);
  if (isControl || hasHandler || asButton) {
    interactive.set(name, isControl ? `<${tag}>` : hasHandler ? 'has handler' : 'role=button');
  }
}

// ---------- 1b. every testid the app can actually produce ----------
// Not just `"data-testid": "x"` — the app also builds them by concatenation
// ("dock-" + t.id), by ternary, and by template literal. Reading only the
// simple form marks ~140 live selectors dead, which buries the few real ones.
const RENDERABLE = { exact: new Set(), prefix: new Set() };
{
  const re = /"data-testid":\s*/g;
  let k;
  while ((k = re.exec(app))) {
    // Take the whole value expression: to the next comma at brace/paren depth 0.
    let i = k.index + k[0].length, depth = 0, expr = '';
    for (; i < app.length; i++) {
      const ch = app[i];
      if ('([{`'.includes(ch)) depth++;
      else if (')]}'.includes(ch)) { if (depth === 0) break; depth--; }
      else if (ch === ',' && depth === 0) break;
      else if (ch === '\n' && depth === 0 && /,\s*$/.test(expr)) break;
      expr += ch;
    }
    // Plain literals in the expression are exact ids; a literal immediately
    // followed by an interpolation or a `+` is a prefix.
    for (const m of expr.matchAll(/"([^"]*)"/g)) if (m[1]) {
      const after = expr.slice(m.index + m[0].length, m.index + m[0].length + 4);
      (/^\s*\+/.test(after) ? RENDERABLE.prefix : RENDERABLE.exact).add(m[1]);
    }
    for (const m of expr.matchAll(/`([^`]*)`/g)) {
      const head = m[1].split('${')[0];
      if (m[1].includes('${')) { if (head) RENDERABLE.prefix.add(head); }
      else if (head) RENDERABLE.exact.add(head);
    }
  }
}
const canExist = (tid) => RENDERABLE.exact.has(tid) ||
  [...RENDERABLE.prefix].some(p => tid.startsWith(p));

const isInteractive = (tid) => {
  if (interactive.has(tid)) return interactive.get(tid);
  for (const [k, v] of interactive) {
    if (k.endsWith('*') && tid.startsWith(k.slice(0, -1))) return v;
  }
  return null;
};

// ---------- 2. per suite: what is observed vs what is driven ----------
// Anything that dispatches a real interaction at a selector counts as driving
// it. Reading it, measuring it, or asserting it exists does not.
// NB: selectors are '[data-testid="x"]' — quotes inside quotes. A naive
// [^'"`] class stops at the inner quote and captures '[data-testid=', which is
// exactly the false-clean result this sweep exists to avoid. Match the closing
// quote by backreference to the opening one.
// The backreference has to name the quote's own group number, which shifts
// when the pattern is embedded after other groups — get that wrong and it
// silently points at the previous capture instead.
const Q = (n) => `(['"\`])((?:(?!\\${n}).)*)\\${n}`;
const ACT = '(?:click|tap|focus|fill|type|dispatchEvent|press|check|selectOption)';
const DRIVE = [
  new RegExp(`safeTap\\(\\s*page\\s*,\\s*${Q(1)}`, 'g'),
  new RegExp(`page\\.(?:tap|click|fill|type|focus|hover|selectOption|dblclick)\\(\\s*${Q(1)}`, 'g'),
  new RegExp(`querySelector(?:All)?\\(\\s*${Q(1)}\\s*\\)[^;\\n]{0,120}\\.(?:click|focus|dispatchEvent)\\(`, 'g'),
  // page.locator('X').click() / page.$eval('X', el => el.click())
  new RegExp(`page\\.locator\\(\\s*${Q(1)}\\s*\\)\\s*\\.${ACT}\\(`, 'g'),
  new RegExp(`page\\.\\$eval\\(\\s*${Q(1)}[^)]{0,120}\\.${ACT}\\(`, 'g')
];
// Two-step: a node or an ElementHandle captured, then acted on later.
// Covers document.querySelector, page.$ and page.locator. varName is group 1,
// so the quote is group 2.
const TWO_STEP = new RegExp(
  `(?:const|let|var)\\s+(\\w+)\\s*=\\s*(?:await\\s+)?(?:document\\.querySelector|page\\.\\$|page\\.locator|page\\.waitForSelector)\\(\\s*${Q(2)}`, 'g');
const TESTID_IN_SEL = /\[data-testid\s*[\^~*|$]?=\s*"([^"]+)"\]/;

function testidsIn(text) {
  const out = new Set();
  const re = /\[data-testid\s*[\^~*|$]?=\s*"([^"]+)"\]/g;
  let x;
  while ((x = re.exec(text))) out.add(x[1]);
  return out;
}

function analyse(file) {
  const src = fs.readFileSync(path.join(DIR, file), 'utf8');
  const seen = testidsIn(src);
  if (!seen.size) return null;

  const driven = new Set();
  // Direct drives. Group 2 is the string body (group 1 is the quote char).
  for (const re of DRIVE) {
    let x; re.lastIndex = 0;
    while ((x = re.exec(src))) {
      const t = (x[2] || '').match(TESTID_IN_SEL);
      if (t) driven.add(t[1]);
    }
  }
  // Two-step: captured into a variable, then clicked/typed into.
  let x; TWO_STEP.lastIndex = 0;
  while ((x = TWO_STEP.exec(src))) {
    const varName = x[1], sel = x[3] || '';
    const t = sel.match(TESTID_IN_SEL);
    if (!t) continue;
    const after = src.slice(x.index, x.index + 1200);
    if (new RegExp(`\\b${varName}\\s*(?:&&\\s*${varName}\\s*)?\\.${ACT}\\(`).test(after) ||
        new RegExp(`\\b${varName}\\.value\\s*=`).test(after)) driven.add(t[1]);
  }

  const gaps = [];
  for (const t of seen) {
    if (driven.has(t)) continue;
    const why = isInteractive(t);
    if (!why) continue;                       // static/container — not a gap
    gaps.push({ testid: t, kind: why });
  }
  // A selector the app can never render is the same weakness at its worst:
  // asserted as `!!x` in a "should be absent" check, it passes forever.
  const dead = [...seen].filter(t => !t.includes('${') && !t.includes("' +") && !canExist(t));
  return { file, seen: seen.size, driven: driven.size, gaps, dead };
}

// ---------- 2b. canary ----------
// This sweep's first version captured '[data-testid=' out of every selector,
// because its quote class stopped at the inner quote — so every suite looked
// like it drove nothing, and the "0 partial" row was the only tell. Prove the
// matcher both fires and stays quiet before believing any of the output.
// Each case is (label, fixture source, should it flag). The drive forms are
// covered individually because each one is a place a matcher can quietly fail
// and leave a whole suite looking clean.
function canary() {
  const T = 'dock-fab', I = 'set-weight-0';
  const CASES = [
    ['observed only', `const ok = !!document.querySelector('[data-testid="${T}"]');`, T, true],
    ['safeTap', `await safeTap(page, '[data-testid="${T}"]');`, T, false],
    ['page.tap', `await page.tap('[data-testid="${T}"]');`, T, false],
    ['inline .click()', `document.querySelector('[data-testid="${T}"]').click();`, T, false],
    ['two-step .click()', `const b = document.querySelector('[data-testid="${T}"]');\nif (b) b.click();`, T, false],
    ['two-step .value =', `const i = document.querySelector('[data-testid="${I}"]');\ni.value = '80';\ni.dispatchEvent(new Event('input'));`, I, false],
    ['page.$ handle', `const r = await page.$('[data-testid="${T}"]'); if (r) await r.click();`, T, false],
    ['page.locator', `await page.locator('[data-testid="${T}"]').click();`, T, false],
    // A selector that is only ever waited on or measured is still a gap.
    ['waitForSelector only', `await page.waitForSelector('[data-testid="${T}"]');`, T, true]
  ];
  let allOk = true;
  console.log('=== canary: does this sweep detect anything? ===');
  for (const [label, body, tid, expectFlag] of CASES) {
    const name = '__canary_test.js';
    fs.writeFileSync(path.join(DIR, name), body + '\n');
    const r = analyse(name);
    fs.unlinkSync(path.join(DIR, name));
    const flagged = !!(r && r.gaps.some(g => g.testid === tid));
    const ok = flagged === expectFlag;
    if (!ok) allOk = false;
    console.log(`   ${label.padEnd(20)} ${expectFlag ? 'should flag' : 'should stay quiet'} -> ${flagged ? 'flagged' : 'quiet'}  ${ok ? 'PASS' : 'FAIL'}`);
  }
  console.log('');
  return allOk;
}

// ---------- 3. report ----------
const files = fs.readdirSync(DIR).filter(f => /_test\.js$/.test(f) && !f.startsWith('__canary')).sort();
if (!canary()) { console.log('canary failed — the sweep is not measuring anything. Stopping.'); process.exit(1); }
const rows = files.map(analyse).filter(Boolean);

// A suite that drives nothing at all is a different, larger problem than one
// that drives most things and misses a couple.
const inert = rows.filter(r => r.driven === 0 && r.gaps.length);
const partial = rows.filter(r => r.driven > 0 && r.gaps.length);
const clean = rows.filter(r => !r.gaps.length);

console.log(`=== existence-only sweep: ${rows.length} suites, ${interactive.size} interactive testids known ===\n`);

console.log(`--- suites that assert controls exist and drive NONE of them (${inert.length}) ---`);
for (const r of inert.sort((a, b) => b.gaps.length - a.gaps.length)) {
  console.log(`${r.file.padEnd(26)} ${String(r.gaps.length).padStart(2)} undriven: ${r.gaps.map(g => g.testid).join(', ').slice(0, 110)}`);
}

console.log(`\n--- suites that drive some controls but not others (${partial.length}) ---`);
for (const r of partial.sort((a, b) => b.gaps.length - a.gaps.length)) {
  console.log(`${r.file.padEnd(26)} drove ${String(r.driven).padStart(2)}/${String(r.seen).padStart(2)} · undriven: ${r.gaps.map(g => `${g.testid} ${g.kind}`).join(', ').slice(0, 150)}`);
}

console.log(`\n--- suites with no undriven interactive controls (${clean.length}) ---`);
console.log(clean.map(r => r.file.replace('_test.js', '')).join(', '));

const totalGaps = rows.reduce((s, r) => s + r.gaps.length, 0);
console.log(`\ntotal undriven interactive controls: ${totalGaps}`);

console.log('\n--- selectors the app can never render (a check that can never fail) ---');
const deadRows = rows.filter(r => r.dead.length);
for (const r of deadRows) console.log(`${r.file.padEnd(26)} ${r.dead.join(', ').slice(0, 130)}`);
console.log(`\nsuites with dead selectors: ${deadRows.length} · dead references: ${deadRows.reduce((s, r) => s + r.dead.length, 0)}`);
