// Silent auto-backup — the File System Access half of data safety. Where
// the API exists the user picks a file once and the app rewrites it after
// every finished workout and every import; where it doesn't, Settings says
// so instead of pretending. OPFS stands in for the picker here: its handles
// are real FileSystemFileHandles that survive the structured-clone trip
// through IndexedDB, so the whole path — store, reload, permission check,
// createWritable — is the production path, not a mock of it.
//
//   node tests/auto-backup.js   (needs `python3 -m http.server 8199` at the repo root)
const { chromium } = require('/opt/node22/lib/node_modules/playwright/index.js');

const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0;
const check = (label, ok, detail = '') => { if (!ok) fails++; console.log(`   ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`); };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctxOpts = { viewport: { width: 390, height: 900 }, serviceWorkers: 'block', hasTouch: true };

  const PREFS = { onboarded: true, sex: 'male', dob: '1995-04-12', heightCm: 180, warmupPrompt: false };

  const newPage = async (c, { pickerToOpfs = true } = {}) => {
    const p = await c.newPage();
    const errs = [];
    p.on('pageerror', e => errs.push('PAGEERR: ' + e.message));
    if (pickerToOpfs) {
      await p.addInitScript(() => {
        window.showSaveFilePicker = async () => {
          const root = await navigator.storage.getDirectory();
          return root.getFileHandle('fitforge-backup.json', { create: true });
        };
      });
    } else {
      await p.addInitScript(() => { try { delete window.showSaveFilePicker; } catch (_) {} window.showSaveFilePicker = undefined; });
    }
    return { p, errs };
  };

  const seed = (p, withActive = true) => p.evaluate(async ({ prefs, withActive }) => {
    await Storage.clearAll();
    try { const r = await navigator.storage.getDirectory(); await r.removeEntry('fitforge-backup.json'); } catch (_) {}
    for (const [k, v] of Object.entries(prefs)) await Storage.setPref(k, v);
    if (withActive) {
      await Storage.saveWorkout({ id: 'aw', name: 'Session', date: U.todayISO(), startedAt: Date.now() - 6e5,
        exercises: [{ exerciseId: 'bench-press-barbell', name: 'Barbell Bench Press', type: 'weighted', sets: [{ weight: 100, reps: 8, done: true }] }] });
      await Storage.setPref('activeWorkoutId', 'aw');
    }
  }, { prefs: PREFS, withActive });

  const boot = async (p) => {
    await p.reload({ waitUntil: 'load' });
    await p.waitForTimeout(4200);
    await p.evaluate(() => document.querySelectorAll('.splash').forEach(n => n.remove()));
  };

  const openSettings = async (p) => {
    await p.evaluate(() => document.querySelector('[data-testid="dock-stats"]')?.click());
    await sleep(1500);
    await p.evaluate(() => document.querySelector('[data-testid="you-settings"]')?.click());
    await sleep(1800);
  };

  const closeSettings = async (p) => {
    await p.evaluate(() => { [...document.querySelectorAll('.modal-footer button, .modal button')].find(x => x.textContent.trim() === 'Cancel')?.click(); });
    await sleep(600);
    await p.evaluate(() => document.querySelectorAll('.modal-backdrop, .modal').forEach(n => n.remove()));
  };

  const finishActive = async (p) => {
    await p.evaluate(() => document.querySelector('[data-testid="dock-home"]')?.click());
    await sleep(1400);
    await p.evaluate(() => {
      const r = document.querySelector('[data-testid="button-resume-workout"]');
      if (r) r.click(); else document.querySelector('[data-testid="dock-fab"]')?.click();
    });
    await sleep(1500);
    await p.evaluate(() => { [...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Finish')?.click(); });
    await sleep(1300);
    await p.evaluate(() => {
      const d = document.querySelector('[data-testid="confirm-dialog"]');
      if (d) [...d.querySelectorAll('.modal-footer button')].find(x => /End workout/i.test(x.textContent))?.click();
    });
    await sleep(1000);
    await p.evaluate(() => {
      const cel = document.querySelector('.celebration');
      const btn = cel && [...cel.querySelectorAll('button')].find(x => /Finish workout/i.test(x.textContent));
      if (btn) btn.click();
    });
    await sleep(2500);
  };

  const readBackupFile = (p) => p.evaluate(async () => {
    try {
      const root = await navigator.storage.getDirectory();
      const f = await (await root.getFileHandle('fitforge-backup.json')).getFile();
      return await f.text();
    } catch (_) { return null; }
  });

  // ================= 1. setup: one tap, first write, honest row ==========
  console.log('=== 1. setup writes the first backup and the row says so ===');
  {
    const c = await b.newContext(ctxOpts);
    const { p, errs } = await newPage(c);
    await p.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
    await p.waitForFunction(() => window.Storage && window.U);
    await seed(p);
    await boot(p);
    await openSettings(p);

    check('the row exists inside Backup & restore',
      await p.evaluate(() => !!document.querySelector('[data-testid="auto-backup-row"]')));
    check('before setup it offers the setup button, not a fake on-state',
      await p.evaluate(() => !!document.querySelector('[data-testid="auto-backup-setup"]') &&
                             !document.querySelector('[data-testid="auto-backup-now"]')));

    await p.evaluate(() => document.querySelector('[data-testid="auto-backup-setup"]')?.click());
    await sleep(2500);

    const txt = await readBackupFile(p);
    check('one tap produced a real first backup file', !!txt && txt.includes('Barbell Bench Press'),
      txt ? `${txt.length} bytes` : 'no file');
    check('the backup is valid JSON with the workouts inside', (() => {
      try { const j = JSON.parse(txt); return Array.isArray(j.workouts) && j.workouts.length === 1; } catch (_) { return false; }
    })());
    check('the row flipped to on — with the file named',
      await p.evaluate(() => {
        const r = document.querySelector('[data-testid="auto-backup-row"]');
        return !!r && /Auto-backup on/.test(r.textContent) && /fitforge-backup\.json/.test(r.textContent);
      }));
    check('…and now offers Back up now + Turn off',
      await p.evaluate(() => !!document.querySelector('[data-testid="auto-backup-now"]') &&
                             !!document.querySelector('[data-testid="auto-backup-off"]')));
    check('a silent backup counts as a real one — lastBackupAt is set',
      await p.evaluate(async () => !!(await Storage.getPref('lastBackupAt'))));
    check('no page errors', errs.length === 0, errs.join(' | '));

    // ============ 2. the silent write on finishWorkout =============
    console.log('\n=== 2. finishing a workout rewrites the file, unasked ===');
    await p.evaluate(async () => {
      const root = await navigator.storage.getDirectory();
      const w = await (await root.getFileHandle('fitforge-backup.json')).createWritable();
      await w.write('WIPED'); await w.close();
    });
    await closeSettings(p);
    await finishActive(p);

    const after = await readBackupFile(p);
    check('the file was rewritten by the finish — no button involved',
      !!after && after !== 'WIPED' && after.includes('Barbell Bench Press'),
      after ? `${after.length} bytes` : 'no file');
    check('and it holds the FINISHED workout, completedAt included', (() => {
      try { const j = JSON.parse(after); const w = (j.workouts || []).find(x => x.id === 'aw'); return !!(w && w.completedAt); } catch (_) { return false; }
    })());
    check('the home backup reminder card stays quiet after a silent backup',
      await p.evaluate(() => !document.querySelector('[data-testid="backup-cta"]')));
    check('no page errors across the finish', errs.length === 0, errs.join(' | '));

    // ============ 3. the handle survives a full reload =============
    console.log('\n=== 3. the stored handle survives a reload (structured clone) ===');
    await boot(p);
    await openSettings(p);
    check('after reload the row still says on — handle round-tripped IndexedDB',
      await p.evaluate(() => {
        const r = document.querySelector('[data-testid="auto-backup-row"]');
        return !!r && /Auto-backup on/.test(r.textContent);
      }));

    // ============ 4. turn off = off ===============================
    console.log('\n=== 4. Turn off actually stops the writes ===');
    await p.evaluate(() => document.querySelector('[data-testid="auto-backup-off"]')?.click());
    await sleep(1500);
    check('the row falls back to the setup offer',
      await p.evaluate(() => !!document.querySelector('[data-testid="auto-backup-setup"]')));
    await p.evaluate(async () => {
      const root = await navigator.storage.getDirectory();
      const w = await (await root.getFileHandle('fitforge-backup.json')).createWritable();
      await w.write('OFF'); await w.close();
      await Storage.saveWorkout({ id: 'aw2', name: 'S2', date: U.todayISO(), startedAt: Date.now() - 3e5,
        exercises: [{ exerciseId: 'squat-barbell', name: 'Squat', type: 'weighted', sets: [{ weight: 60, reps: 5, done: true }] }] });
      await Storage.setPref('activeWorkoutId', 'aw2');
    });
    await closeSettings(p);
    await finishActive(p);
    check('after Turn off, finishing a workout leaves the file alone',
      (await readBackupFile(p)) === 'OFF');
    await c.close();
  }

  // ================= 5. permission lapse: paused, honestly ===============
  console.log('\n=== 5. a permission lapse shows as paused — and blocks quietly ===');
  {
    const c = await b.newContext(ctxOpts);
    const { p, errs } = await newPage(c);
    // queryPermission lies 'prompt' after the handle is stored — the browser
    // wanting a fresh yes is exactly the state a returning user hits.
    await p.addInitScript(() => {
      window.__ffPermLapse = false;
      const orig = FileSystemFileHandle.prototype.queryPermission;
      FileSystemFileHandle.prototype.queryPermission = function (...a) {
        if (window.__ffPermLapse) return Promise.resolve('prompt');
        return orig ? orig.apply(this, a) : Promise.resolve('granted');
      };
    });
    await p.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
    await p.waitForFunction(() => window.Storage && window.U);
    await seed(p);
    await boot(p);
    await openSettings(p);
    await p.evaluate(() => document.querySelector('[data-testid="auto-backup-setup"]')?.click());
    await sleep(2500);
    const t0 = await p.evaluate(() => Storage.getPref('lastBackupAt'));

    await p.evaluate(async () => {
      window.__ffPermLapse = true;
      const root = await navigator.storage.getDirectory();
      const w = await (await root.getFileHandle('fitforge-backup.json')).createWritable();
      await w.write('LAPSED'); await w.close();
    });
    await closeSettings(p);
    await finishActive(p);
    check('with permission lapsed, the silent write does NOT happen',
      (await readBackupFile(p)) === 'LAPSED');
    check('and lastBackupAt is untouched — the reminder system re-arms',
      await p.evaluate((t0) => Storage.getPref('lastBackupAt').then(t => t === t0), t0));

    await openSettings(p);
    check('Settings says paused, with a Re-allow button — not a fake on-state',
      await p.evaluate(() => !!document.querySelector('[data-testid="auto-backup-paused"]') &&
                             !!document.querySelector('[data-testid="auto-backup-reallow"]')));
    check('no page errors on the lapse path', errs.length === 0, errs.join(' | '));
    await c.close();
  }

  // ================= 6. no API, no pretending =============================
  console.log('\n=== 6. a browser without the API gets the honest line ===');
  {
    const c = await b.newContext(ctxOpts);
    const { p } = await newPage(c, { pickerToOpfs: false });
    await p.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
    await p.waitForFunction(() => window.Storage && window.U);
    await seed(p, false);
    await boot(p);
    await openSettings(p);
    const row = await p.evaluate(() => {
      const r = document.querySelector('[data-testid="auto-backup-row"]');
      return r ? { text: r.textContent, hasSetup: !!r.querySelector('[data-testid="auto-backup-setup"]') } : null;
    });
    check('the row exists but offers no setup button', !!row && !row.hasSetup);
    check('it says what is true: needs Chrome/Edge, reminders stay on',
      !!row && /Chrome or Edge/.test(row.text) && /remind/.test(row.text), row && row.text.slice(0, 120));
    await c.close();
  }

  await b.close();
  console.log(fails ? `\n${fails} CHECK(S) FAILED` : '\nALL CHECKS PASSED');
  process.exit(fails ? 1 : 0);
})();
