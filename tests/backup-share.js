// Share-sheet backup — the iOS half of data safety. Where the File System
// Access API doesn't exist but the Web Share API takes files (iOS Safari),
// exporting goes through the share sheet: one tap lands the backup in Files
// or iCloud. Unlike the blind download anchor, the sheet reports what
// happened — so a completed share is a real backup and a cancelled one
// honestly isn't. The suite stubs navigator.share/canShare (headless
// Chromium has neither) and drives the real export paths.
//
//   node tests/backup-share.js   (needs `python3 -m http.server 8199` at the repo root)
const { chromium } = require('/opt/node22/lib/node_modules/playwright/index.js');

const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0;
const check = (label, ok, detail = '') => { if (!ok) fails++; console.log(`   ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`); };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctxOpts = { viewport: { width: 390, height: 900 }, serviceWorkers: 'block', hasTouch: true };

  const PREFS = { onboarded: true, sex: 'male', dob: '1995-04-12', heightCm: 180, warmupPrompt: false };

  // iosLike: no file picker, share takes files. Desktop: picker present too.
  const newPage = async (c, { iosLike = true } = {}) => {
    const p = await c.newPage();
    const errs = [];
    p.on('pageerror', e => errs.push('PAGEERR: ' + e.message));
    await p.addInitScript((iosLike) => {
      if (iosLike) {
        try { delete window.showSaveFilePicker; } catch (_) {}
        window.showSaveFilePicker = undefined;
      } else {
        window.showSaveFilePicker = async () => { throw new Error('unused in this suite'); };
      }
      window.__shares = [];
      window.__downloads = [];
      window.__shareMode = 'accept'; // 'accept' | 'abort' | 'fail'
      navigator.canShare = (d) => !!(d && Array.isArray(d.files) && d.files.length > 0);
      navigator.share = async (d) => {
        window.__shares.push(d);
        if (window.__shareMode === 'abort') { const e = new Error('user closed the sheet'); e.name = 'AbortError'; throw e; }
        if (window.__shareMode === 'fail') { const e = new Error('sharing not allowed'); e.name = 'NotAllowedError'; throw e; }
      };
      // Swallow download-anchor clicks; record the filename instead.
      const origClick = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function () {
        if (this.download) { window.__downloads.push(this.download); return; }
        return origClick.apply(this);
      };
    }, iosLike);
    return { p, errs };
  };

  const seed = (p, { completed = true } = {}) => p.evaluate(async ({ prefs, completed }) => {
    await Storage.clearAll();
    for (const [k, v] of Object.entries(prefs)) await Storage.setPref(k, v);
    if (completed) {
      await Storage.saveWorkout({ id: 'w1', name: 'Session', date: U.todayISO(),
        startedAt: Date.now() - 6e5, completedAt: Date.now() - 3e5,
        exercises: [{ exerciseId: 'bench-press-barbell', name: 'Barbell Bench Press', type: 'weighted', sets: [{ weight: 100, reps: 8, done: true }] }] });
    }
  }, { prefs: PREFS, completed });

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

  const clickExport = async (p) => {
    await p.evaluate(() => { [...document.querySelectorAll('.modal button')].find(x => x.textContent.trim() === 'Export all data (JSON)')?.click(); });
    await sleep(1500);
  };

  const shareCount = (p) => p.evaluate(() => window.__shares.length);
  const lastBackupAt = (p) => p.evaluate(() => Storage.getPref('lastBackupAt'));

  // ============ 1. the Settings row tells the iOS truth ==================
  console.log('=== 1. no picker + share sheet: the row says which world you are in ===');
  {
    const c = await b.newContext(ctxOpts);
    const { p, errs } = await newPage(c);
    await p.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
    await p.waitForFunction(() => window.Storage && window.U);
    await seed(p);
    await boot(p);
    await openSettings(p);

    const row = await p.evaluate(() => {
      const r = document.querySelector('[data-testid="auto-backup-row"]');
      return r ? { text: r.textContent, hasSetup: !!r.querySelector('[data-testid="auto-backup-setup"]'),
                   hasNote: !!r.querySelector('[data-testid="backup-share-note"]') } : null;
    });
    check('the row offers no setup button — the API is not there', !!row && !row.hasSetup);
    check('it names the share sheet as the mechanism, not Chrome or Edge',
      !!row && row.hasNote && /share sheet/.test(row.text) && !/Chrome or Edge/.test(row.text),
      row && row.text.slice(0, 140));

    // ============ 2. export goes through the sheet and counts ============
    console.log('\n=== 2. a completed share is a real backup ===');
    await clickExport(p);
    check('navigator.share was called exactly once', (await shareCount(p)) === 1);
    const shared = await p.evaluate(async () => {
      const d = window.__shares[0];
      if (!d || !Array.isArray(d.files) || d.files.length !== 1) return null;
      const f = d.files[0];
      let parsed = null;
      try { parsed = JSON.parse(await f.text()); } catch (_) {}
      return { name: f.name, type: f.type, workouts: parsed && Array.isArray(parsed.workouts) ? parsed.workouts.length : -1,
               hasBench: !!(parsed && JSON.stringify(parsed).includes('Barbell Bench Press')) };
    });
    check('one JSON file, named with today\'s date',
      !!shared && /^fitforge-backup-\d{4}-\d{2}-\d{2}\.json$/.test(shared.name) && shared.type === 'application/json',
      shared && shared.name);
    check('the file is the full export — the seeded workout is inside',
      !!shared && shared.workouts === 1 && shared.hasBench);
    check('lastBackupAt advanced — the reminders go quiet', !!(await lastBackupAt(p)));
    check('no download anchor fired — the sheet replaced it, not doubled it',
      await p.evaluate(() => window.__downloads.length === 0));
    check('no page errors', errs.length === 0, errs.join(' | '));
    await c.close();
  }

  // ============ 3. a cancelled share is not a backup ======================
  console.log('\n=== 3. cancelling the sheet leaves the reminders armed ===');
  {
    const c = await b.newContext(ctxOpts);
    const { p, errs } = await newPage(c);
    await p.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
    await p.waitForFunction(() => window.Storage && window.U);
    await seed(p);
    await boot(p);

    check('with data and no backup, Home shows the reminder card',
      await p.evaluate(() => !!document.querySelector('[data-testid="backup-cta"]')));

    await p.evaluate(() => { window.__shareMode = 'abort'; });
    await p.evaluate(() => { [...document.querySelectorAll('[data-testid="backup-cta"] button')].find(x => x.textContent.trim() === 'Backup now')?.click(); });
    await sleep(1800);

    check('the sheet was offered', (await shareCount(p)) === 1);
    check('but lastBackupAt is untouched — a cancel is not a backup', !(await lastBackupAt(p)));
    check('and the reminder card is still there',
      await p.evaluate(() => !!document.querySelector('[data-testid="backup-cta"]')));
    check('no page errors on the cancel path', errs.length === 0, errs.join(' | '));
    await c.close();
  }

  // ============ 4. a failed share falls back to the download ==============
  console.log('\n=== 4. a share that errors (not cancelled) still delivers a backup ===');
  {
    const c = await b.newContext(ctxOpts);
    const { p, errs } = await newPage(c);
    await p.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
    await p.waitForFunction(() => window.Storage && window.U);
    await seed(p);
    await boot(p);
    await openSettings(p);
    await p.evaluate(() => { window.__shareMode = 'fail'; });
    await clickExport(p);

    check('share was attempted first', (await shareCount(p)) === 1);
    check('the download anchor took over',
      await p.evaluate(() => window.__downloads.length === 1 && /^fitforge-backup-.*\.json$/.test(window.__downloads[0])),
      await p.evaluate(() => window.__downloads.join(', ')));
    check('and the fallback still counts as a backup', !!(await lastBackupAt(p)));
    check('no page errors on the fallback path', errs.length === 0, errs.join(' | '));
    await c.close();
  }

  // ============ 5. where auto-backup exists, share stays out of the way ===
  console.log('\n=== 5. with the file picker present, export is the plain download ===');
  {
    const c = await b.newContext(ctxOpts);
    const { p, errs } = await newPage(c, { iosLike: false });
    await p.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
    await p.waitForFunction(() => window.Storage && window.U);
    await seed(p);
    await boot(p);
    await openSettings(p);
    await clickExport(p);

    check('navigator.share was never called', (await shareCount(p)) === 0);
    check('the export was the ordinary download',
      await p.evaluate(() => window.__downloads.length === 1));
    check('no page errors', errs.length === 0, errs.join(' | '));
    await c.close();
  }

  await b.close();
  console.log(fails ? `\n${fails} CHECK(S) FAILED` : '\nALL CHECKS PASSED');
  process.exit(fails ? 1 : 0);
})();
