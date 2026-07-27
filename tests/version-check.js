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

console.log(`\n${fails} failing check${fails === 1 ? '' : 's'}`);
process.exit(fails ? 1 : 0);
