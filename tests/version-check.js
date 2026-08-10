// index.html, sw.js and every asset reference must agree on one version.
//
// They are three files that have to be edited together by hand, and that ritual
// failed silently for ten releases: sw.js's PRECACHE stayed pinned at ?v=156
// while index.html shipped ?v=165. Cache keys include the query string, so not
// one precached script could serve a real request — the app kept working purely
// on the runtime cache, which is exactly why nobody noticed.
//
// Static, no browser. Run it before every release, or let run-all do it.
//
//   node tests/version-check.js
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

let fails = 0;
const check = (label, ok, detail = '') => {
  if (!ok) fails++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
};

const index = read('index.html');
const sw = read('sw.js');
const app = read('js/app.js');

// --- what version does each file think it is? ---
const indexVersions = [...new Set([...index.matchAll(/\?v=(\d+)/g)].map(m => m[1]))];
const cacheName = (sw.match(/fitforge-v(\d+)/) || [])[1];
const appSw = (app.match(/sw\.js\?v=(\d+)/) || [])[1];

console.log('=== one version, three files ===');
console.log(`  index.html assets : ${indexVersions.join(', ') || '(none)'}`);
console.log(`  sw.js CACHE       : ${cacheName || '(none)'}`);
console.log(`  app.js SW register: ${appSw || '(none)'}`);

check('index.html uses a single version for every asset',
  indexVersions.length === 1, indexVersions.join(', '));
check('sw.js CACHE matches index.html', cacheName === indexVersions[0],
  `${cacheName} vs ${indexVersions[0]}`);
check("app.js's SW registration matches", appSw === indexVersions[0],
  `${appSw} vs ${indexVersions[0]}`);

// --- sw.js must not hand-pin versions any more ---
const swPins = [...new Set([...sw.matchAll(/["'`]\.\/[^"'`]*\?v=(\d+)/g)].map(m => m[1]))];
check('sw.js hard-codes no asset versions of its own',
  swPins.length === 0, swPins.length ? `still pins ?v=${swPins.join(', ')}` : '');

// --- every script index.html loads must be precachable ---
const indexAssets = [...index.matchAll(/(?:src|href)="\.\/([^"?]+)(?:\?v=\d+)?"/g)]
  .map(m => m[1])
  .filter(f => /\.(js|css)$/.test(f));
const swList = (sw.match(/const VERSIONED = \[([\s\S]*?)\];/) || [])[1] || '';
const missing = indexAssets.filter(f => !swList.includes(f));
check('every JS/CSS asset in index.html is in the precache list',
  missing.length === 0, missing.join(', '));

// --- and each of those files actually exists ---
const gone = indexAssets.filter(f => !fs.existsSync(path.join(ROOT, f)));
check('every referenced asset exists on disk', gone.length === 0, gone.join(', '));

// --- nothing may reach off-origin on the critical path ---
//
// An offline-first app cannot depend on a third party to boot. Inter used to
// arrive from fonts.googleapis.com as a render-blocking stylesheet, which held
// every script behind it (12.7s to DOMContentLoaded, against 122ms without it)
// and never arrived at all offline. It is self-hosted now, and the service
// worker deliberately passes cross-origin requests straight through — so
// anything added here in future would be uncacheable and unavailable offline.
const offOrigin = [...index.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)].map(m => m[1]);
check('index.html requests nothing from another origin',
  offOrigin.length === 0, offOrigin.join(', '));

const cssUrls = [...fs.readFileSync(path.join(ROOT, 'css/styles.css'), 'utf8')
  .matchAll(/url\(\s*["']?(https?:\/\/[^)"']+)/g)].map(m => m[1]);
check('styles.css loads no remote fonts or images',
  cssUrls.length === 0, cssUrls.join(', '));

// The font files themselves have to exist and be precached, or the first
// offline launch renders in the fallback stack.
const fontRefs = [...fs.readFileSync(path.join(ROOT, 'css/styles.css'), 'utf8')
  .matchAll(/url\(\s*["']?\.\.\/(fonts\/[^)"']+)/g)].map(m => m[1]);
check('the self-hosted fonts are referenced', fontRefs.length > 0, `${fontRefs.length} face(s)`);
const missingFonts = fontRefs.filter(f => !fs.existsSync(path.join(ROOT, f)));
check('every font file exists on disk', missingFonts.length === 0, missingFonts.join(', '));
const unprecached = fontRefs.filter(f => !sw.includes(f));
check('every font file is in the precache list', unprecached.length === 0, unprecached.join(', '));

// --- the default accent is stated in two files and must match ---
//
// styles.css carries a bare :root accent as well as one block per accent id.
// The bare one is what paints the splash, because that is on screen before
// app.js has read the stored preference and set data-accent. Change the
// default in app.js alone and every cold launch opens on the old colour for
// about a second and then swaps — which reads as a bug in the splash rather
// than as the stale default it is.
const css = fs.readFileSync(path.join(ROOT, 'css/styles.css'), 'utf8');
const appjs = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8');

// The version is now stated in four places, and Settings prints one of them.
// A stale constant there is worse than none: it would name the wrong build to
// someone trying to work out what they are running.
const appVer = (appjs.match(/const APP_VERSION = (\d+);/) || [])[1];
check('app.js states an APP_VERSION', !!appVer, appVer || 'not found');
check('and it matches the service worker cache', appVer === cacheName,
  `APP_VERSION ${appVer} vs cache ${cacheName}`);

const defAccent = (appjs.match(/const DEFAULT_ACCENT = "([a-z]+)"/) || [])[1];
check('app.js names a default accent', !!defAccent, defAccent || 'not found');

if (defAccent) {
  // Pull the tokens for the default from its own light and dark blocks, then
  // from whatever the bare :root and .dark say before any attribute is set.
  const tokens = (block) => {
    const out = {};
    for (const m of block.matchAll(/(--(?:accent|accent-hover|accent-soft|on-accent))\s*:\s*([^;]+);/g)) {
      out[m[1]] = m[2].trim();
    }
    return out;
  };
  const named = (sel) => {
    const re = new RegExp(`${sel}\\[data-accent="${defAccent}"\\]\\s*\\{([^}]*)\\}`);
    const m = css.match(re);
    return m ? tokens(m[1]) : null;
  };
  // The bare declarations: everything before the first data-accent block.
  const bare = css.slice(0, css.indexOf('[data-accent='));
  const lightBare = tokens(bare.slice(0, bare.indexOf('.dark')));
  const darkBare = tokens(bare.slice(bare.indexOf('.dark')));

  for (const [mode, want, got] of [
    ['light', named(':root'), lightBare],
    ['dark', named('.dark'), darkBare]
  ]) {
    if (!want) { check(`the ${defAccent} ${mode} block exists`, false); continue; }
    const differs = Object.keys(want).filter(k => got[k] && got[k] !== want[k]);
    check(`the pre-JS ${mode} accent is ${defAccent}`, differs.length === 0,
      differs.map(k => `${k}: ${got[k]} vs ${want[k]}`).join(', ') || defAccent);
  }
}

console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
process.exit(fails ? 1 : 0);
