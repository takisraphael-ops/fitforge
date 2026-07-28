// Run every committed check in one go.
//
// This exists because the recurring failure here was never a missing test — it
// was that nothing ran the tests. Five suites sat broken for months, driving
// UI that had been redesigned away, and the only reason anyone found out was
// a bug report about something else.
//
//   node tests/run-all.js
//
// Starts a static server on 8199 if one is not already up, runs the browser
// suites and the two static checks, and exits non-zero if anything fails.
const { spawn, spawnSync } = require('child_process');
const http = require('http');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.FITFORGE_PORT || 8199);
const NODE_PATH = process.env.NODE_PATH || '/opt/node22/lib/node_modules';

// Browser suites need the server; the sweep does not, so it runs either way.
const SUITES = [
  { name: 'version-check', file: 'version-check.js', needsServer: false },
  { name: 'existence-sweep', file: 'existence-sweep.js', args: [__dirname], needsServer: false },
  { name: 'reach-audit', file: 'reach-audit.js', needsServer: true },
  { name: 'quiz', file: 'quiz.js', needsServer: true },
  { name: 'numpad', file: 'numpad.js', needsServer: true },
  { name: 'set-logging', file: 'set-logging.js', needsServer: true },
  { name: 'round-timer', file: 'round-timer.js', needsServer: true },
  { name: 'tab-loader', file: 'tab-loader.js', needsServer: true },
  { name: 'muscle-map', file: 'muscle-map.js', needsServer: true },
  { name: 'radial', file: 'radial.js', needsServer: true },
  { name: 'finish-workout', file: 'finish-workout.js', needsServer: true }
];

const up = () => new Promise((resolve) => {
  const req = http.get({ host: '127.0.0.1', port: PORT, path: '/index.html', timeout: 1500 },
    (res) => { res.resume(); resolve(res.statusCode === 200); });
  req.on('error', () => resolve(false));
  req.on('timeout', () => { req.destroy(); resolve(false); });
});

(async () => {
  let server = null;
  if (!(await up())) {
    console.log(`starting a static server on :${PORT}`);
    server = spawn('python3', ['-m', 'http.server', String(PORT)],
      { cwd: ROOT, stdio: 'ignore', detached: true });
    for (let i = 0; i < 20 && !(await up()); i++) await new Promise(r => setTimeout(r, 300));
    if (!(await up())) {
      console.error(`could not serve ${ROOT} on :${PORT}`);
      if (server) process.kill(-server.pid);
      process.exit(1);
    }
  } else {
    console.log(`using the server already on :${PORT}`);
  }

  const results = [];
  for (const s of SUITES) {
    process.stdout.write(`\n${'='.repeat(60)}\n${s.name}\n${'='.repeat(60)}\n`);
    const t0 = Date.now();
    const run = spawnSync('node', [path.join(__dirname, s.file), ...(s.args || [])], {
      cwd: ROOT, stdio: 'inherit', env: { ...process.env, NODE_PATH }
    });
    results.push({ name: s.name, code: run.status, secs: Math.round((Date.now() - t0) / 1000) });
  }

  if (server) { try { process.kill(-server.pid); } catch (_) {} }

  console.log(`\n${'='.repeat(60)}\nsummary\n${'='.repeat(60)}`);
  let bad = 0;
  for (const r of results) {
    if (r.code !== 0) bad++;
    console.log(`  ${r.code === 0 ? 'ok  ' : 'FAIL'}  ${r.name.padEnd(18)} ${String(r.secs).padStart(3)}s`);
  }
  console.log(bad ? `\n${bad} of ${results.length} failed` : `\nall ${results.length} passed`);
  process.exit(bad ? 1 : 0);
})();
