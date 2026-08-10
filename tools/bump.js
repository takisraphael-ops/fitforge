// Move index.html, js/app.js and sw.js to the next release version together.
//
// These three have to agree, and the hand-sync ritual failed silently for ten
// releases running: sw.js's precache stayed pinned at ?v=156 while the app
// shipped ?v=165, so not one precached file could serve a real request. The
// precache list is derived from CACHE now, and this moves the rest as one step
// so the mistake is not available.
//
//   node tools/bump.js          bump to the next version
//   node tools/bump.js 170      set an explicit version
//
// Runs tests/version-check.js afterwards and exits non-zero if it fails.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const p = (f) => path.join(ROOT, f);
const read = (f) => fs.readFileSync(p(f), 'utf8');

const index = read('index.html');
const sw = read('sw.js');
const app = read('js/app.js');

const current = Number((sw.match(/fitforge-v(\d+)/) || [])[1]);
if (!Number.isFinite(current)) {
  console.error('could not read the current version out of sw.js');
  process.exit(1);
}

const arg = process.argv[2];
const next = arg == null ? current + 1 : Number(arg);
if (!Number.isInteger(next) || next < 1) {
  console.error(`not a version: ${arg}`);
  process.exit(1);
}
if (next === current) {
  console.error(`already at v${current}`);
  process.exit(1);
}

// index.html: every ?v= on an asset. app.js: only the SW registration.
// sw.js: only the cache name — its asset list is derived from it.
const writes = [
  ['index.html', index.replace(/\?v=\d+/g, `?v=${next}`)],
  // Two places in app.js now: the service worker query, and the constant
  // Settings prints so a build can be identified from the device itself.
  ['js/app.js', app.replace(/sw\.js\?v=\d+/g, `sw.js?v=${next}`)
                   .replace(/const APP_VERSION = \d+;/, `const APP_VERSION = ${next};`)],
  ['sw.js', sw.replace(/fitforge-v\d+/g, `fitforge-v${next}`)]
];
for (const [f, body] of writes) fs.writeFileSync(p(f), body);

console.log(`v${current} -> v${next}`);
for (const [f] of writes) console.log(`  ${f}`);

console.log('');
const check = spawnSync('node', [p('tests/version-check.js')], { stdio: 'inherit' });
process.exit(check.status || 0);
