// The custody of the data, which is the one thing an offline app cannot get
// wrong. Everything a user builds lives in one browser's IndexedDB; these
// tests are about what the app does when that arrangement is threatened —
// a blocked database, a transient open failure, a renderer that throws, an
// update landing mid-workout.
//
// The standing rule applies with extra force here: every failure mode this
// suite covers used to be met with silence, so each check was verified to
// fail against the silent version.
//
//   node tests/durability.js   (needs `python3 -m http.server 8199` at the repo root)
const { chromium } = require('/opt/node22/lib/node_modules/playwright/index.js');

let fails = 0;
const check = (label, ok, detail = '') => {
  if (!ok) fails++;
  console.log(`   ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
};

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctxOpts = { viewport: { width: 390, height: 844 }, serviceWorkers: 'block', hasTouch: true, isMobile: true };

  console.log('=== 1. a healthy browser: no banner, an honest Settings line ===');
  {
    const c = await b.newContext(ctxOpts);
    const p = await c.newPage();
    await p.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
    await p.waitForFunction(() => window.Storage && window.U);
    await p.evaluate(async () => {
      await Storage.clearAll();
      for (const [k, v] of Object.entries({ onboarded: true, sex: 'male', dob: '1990-01-01', heightCm: 180 })) await Storage.setPref(k, v);
    });
    await p.reload({ waitUntil: 'load' });
    await p.waitForTimeout(2200);
    const h = await p.evaluate(() => Storage.storageHealth());
    check('storage reports the IndexedDB engine', h.engine === 'idb', JSON.stringify(h));
    check('no memory writes are pending', h.pendingMemWrites === 0, String(h.pendingMemWrites));
    check('no banner on a healthy browser', await p.evaluate(() => !document.getElementById('storage-banner')));

    // The Settings line exists and matches the actual persistence state.
    await p.evaluate(() => document.querySelectorAll('.splash').forEach(n => n.remove()));
    await p.evaluate(() => document.querySelector('[data-testid="dock-stats"]')?.click());
    await p.waitForTimeout(1400);
    await p.evaluate(() => document.querySelector('[data-testid="you-settings"]')?.click());
    await p.waitForTimeout(1800);
    const line = await p.evaluate(() => {
      const n = document.querySelector('[data-testid="storage-health"]');
      return n ? { text: n.textContent.slice(0, 80), tone: n.className.match(/tone-(\w+)/)?.[1] } : null;
    });
    check('Settings carries a storage-durability line', !!line, JSON.stringify(line));
    // Headless Chromium denies persist() to an unengaged origin, so the
    // honest answer here is the warning, not the reassurance.
    check('and it does not overclaim safety in an evictable tab',
      !!line && line.tone !== 'good', line && line.tone);
    await c.close();
  }

  console.log('\n=== 2. storage blocked: the banner stays, writes still round-trip ===');
  {
    const c = await b.newContext(ctxOpts);
    const p = await c.newPage();
    await p.addInitScript(() => {
      try { Object.defineProperty(window, 'indexedDB', { get() { return null; } }); } catch (_) {}
    });
    await p.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
    await p.waitForFunction(() => window.Storage && window.U);
    await p.waitForTimeout(2500);
    const banner = await p.evaluate(() => {
      const n = document.getElementById('storage-banner');
      return n ? { text: n.textContent, hasExport: !!n.querySelector('.storage-banner-btn') } : null;
    });
    check('the banner is up', !!banner);
    check('it says nothing is being saved', !!banner && /Nothing is being saved/i.test(banner.text), banner && banner.text.slice(0, 50));
    check('and offers an export right there', !!banner && banner.hasExport);
    check('it is a banner, not a toast — still present seconds later', await p.evaluate(async () => {
      await new Promise(r => setTimeout(r, 3000));
      return !!document.getElementById('storage-banner');
    }));
    const rt = await p.evaluate(async () => {
      await Storage.saveWorkout({ id: 'm1', name: 'Mem', date: U.todayISO(), startedAt: Date.now(),
        exercises: [{ exerciseId: 'x', name: 'X', type: 'weighted', sets: [{ weight: 50, reps: 5, done: true }] }] });
      return { got: !!(await Storage.getWorkout('m1')), health: Storage.storageHealth() };
    });
    check('memory-mode writes still read back within the session', rt.got);
    check('and health counts them as at-risk', rt.health.engine === 'memory' && rt.health.pendingMemWrites > 0,
      JSON.stringify(rt.health));
    await c.close();
  }

  console.log('\n=== 3. the drain: writes made while the database was down reach it ===');
  {
    // The transient window, staged deterministically: boot normally, then
    // sever the app's connection (deleteDatabase fires versionchange, which
    // closes it), block the engine, and write. Those writes land in memory.
    // Unblock, write again — the reopen must drain everything held, deletes
    // included, or the tombstone-less delete resurrects on recovery.
    const c = await b.newContext(ctxOpts);
    const p = await c.newPage();
    await p.addInitScript(() => {
      const real = window.indexedDB;
      window.__idbBlocked = false;
      const shim = {
        open(...args) {
          if (window.__idbBlocked) throw new Error('simulated transient open failure');
          return real.open(...args);
        },
        deleteDatabase: real.deleteDatabase.bind(real),
        databases: real.databases ? real.databases.bind(real) : undefined,
        cmp: real.cmp ? real.cmp.bind(real) : undefined
      };
      Object.defineProperty(window, 'indexedDB', { get() { return shim; } });
    });
    await p.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
    await p.waitForFunction(() => window.Storage && window.U);
    const staged = await p.evaluate(async () => {
      // Healthy first — then the outage: block the engine, THEN sever the
      // live connection. Order matters; a background read raced an earlier
      // version of this and reopened the database before the block landed.
      await Storage.setPref('preOutage', 'yes');
      window.__idbBlocked = true;
      await new Promise((res) => {
        const del = indexedDB.deleteDatabase('fitforge_db');
        del.onsuccess = del.onerror = del.onblocked = () => res();
        setTimeout(res, 1500);
      });
      await Storage.saveWorkout({ id: 'drain1', name: 'Drain', date: U.todayISO(), startedAt: Date.now(),
        exercises: [{ exerciseId: 'x', name: 'X', type: 'weighted', sets: [{ weight: 70, reps: 5, done: true }] }] });
      await Storage.saveWorkout({ id: 'drain2', name: 'Gone', date: U.todayISO(), startedAt: Date.now(), exercises: [] });
      await Storage.deleteWorkout('drain2');
      const during = Storage.storageHealth();
      window.__idbBlocked = false;
      // Failed attempts arm a short retry back-off; recovery is allowed to
      // take one back-off period, not to take forever.
      await new Promise(r => setTimeout(r, 6000));
      await Storage.setPref('drainPref', 'held');
      return { during, after: Storage.storageHealth() };
    });
    check('the outage put writes into memory', staged.during.engine === 'memory' && staged.during.pendingMemWrites > 0,
      JSON.stringify(staged.during));
    staged.engine = staged.after.engine;
    staged.pendingMemWrites = staged.after.pendingMemWrites;
    check('the database recovered', staged.engine === 'idb', JSON.stringify(staged));
    check('nothing is left stranded in memory', staged.pendingMemWrites === 0, String(staged.pendingMemWrites));

    // A fresh page with an unshimmed engine is the proof: if the drain did
    // not run, drain1 and the pref exist only in the dead page's memory.
    const p2 = await c.newPage();
    await p2.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
    await p2.waitForFunction(() => window.Storage);
    const persisted = await p2.evaluate(async () => ({
      w: !!(await Storage.getWorkout('drain1')),
      deleted: !(await Storage.getWorkout('drain2')),
      pref: await Storage.getPref('drainPref', null)
    }));
    check('a write made during the outage reached the database', persisted.w);
    check('a delete made during the outage held — no resurrection', persisted.deleted);
    check('prefs written during the outage survived too', persisted.pref === 'held', String(persisted.pref));
    await p2.evaluate(async () => { await Storage.clearAll(); });
    await c.close();
  }

  console.log('\n=== 4. a broken renderer leaves a navigable page, not a void ===');
  {
    const c = await b.newContext(ctxOpts);
    const p = await c.newPage();
    await p.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
    await p.waitForFunction(() => window.Storage && window.U);
    await p.evaluate(async () => {
      await Storage.clearAll();
      await Storage.setPref('onboarded', true);
    });
    await p.reload({ waitUntil: 'load' });
    await p.waitForTimeout(2200);
    await p.evaluate(() => document.querySelectorAll('.splash').forEach(n => n.remove()));
    // Break the next render in the most direct way possible.
    const after = await p.evaluate(async () => {
      const main = document.querySelector('#main');
      const realQS = main.querySelectorAll.bind(main);
      let armed = true;
      // Sabotage: make the first thing every renderer does throw once.
      const orig = window.U.todayISO;
      window.U.todayISO = function (...a) {
        if (armed) { armed = false; throw new Error('simulated renderer crash'); }
        return orig.apply(this, a);
      };
      document.querySelector('[data-testid="dock-nutrition"]').click();
      await new Promise(r => setTimeout(r, 2500));
      window.U.todayISO = orig;
      return {
        dock: !!document.querySelector('.dock'),
        errorCard: !!document.querySelector('[data-testid="render-error"]'),
        content: (document.querySelector('#main')?.textContent || '').length
      };
    });
    check('the dock survives a renderer crash', after.dock);
    // Either the error card is on screen, or a fallback render actually put
    // real content up. An empty view with neither is the dead screen this
    // exists to prevent — content length 0 must not pass.
    check('the crash is visible or recovered, never a dead screen',
      after.errorCard || after.content > 100,
      `error card: ${after.errorCard}, content length ${after.content}`);
    await c.close();
  }

  console.log('\n=== 5. an update never reloads the app mid-workout ===');
  {
    // The gate lives between controllerchange and location.reload. Drive the
    // decision the way the browser would: fire the handler with a workout
    // active and assert the app is still here, then clear the workout, hide
    // the tab, and assert the deferred reload fires.
    const c = await b.newContext(ctxOpts);
    const p = await c.newPage();
    await p.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
    await p.waitForFunction(() => window.Storage && window.U);
    await p.evaluate(async () => {
      await Storage.clearAll();
      for (const [k, v] of Object.entries({ onboarded: true, guidedSets: false, warmupPrompt: false })) await Storage.setPref(k, v);
      await Storage.saveWorkout({ id: 'live', name: 'Live', date: U.todayISO(), startedAt: Date.now(),
        exercises: [{ exerciseId: 'bench-press-barbell', name: 'Bench', type: 'weighted', sets: [{ weight: 60, reps: 5, done: false }] }] });
      await Storage.setPref('activeWorkoutId', 'live');
    });
    // serviceWorkers are blocked in this context, so the handler cannot be
    // reached through the real event. The property that must hold is in the
    // source: the reload path checks for an active workout before firing.
    const src = await p.evaluate(async () => (await (await fetch('/js/app.js')).text()));
    const guarded = /const reloadForUpdate = \(\) => \{[\s\S]{0,400}?if \(state\.activeWorkout\) \{ pendingReload = true; return; \}[\s\S]{0,200}?location\.reload\(\)/.test(src);
    check('the update reload is gated on no active workout', guarded);
    const deferred = /if \(pendingReload && document\.hidden && !state\.activeWorkout\)/.test(src);
    check('and the deferred reload waits for hidden + workout over', deferred);
    await p.evaluate(async () => { await Storage.clearAll(); });
    await c.close();
  }

  console.log('\n=== 6. the backup reminder is visible, not buried in a dialog ===');
  {
    // The card was written, styled, and never called — so the 7-day staleness
    // trigger and the snooze existed only in source. This drives the revived
    // path: real data, no backup ever taken, Home must say so.
    const c = await b.newContext(ctxOpts);
    const p = await c.newPage();
    await p.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
    await p.waitForFunction(() => window.Storage && window.U);
    await p.evaluate(async () => {
      await Storage.clearAll();
      for (const [k, v] of Object.entries({ onboarded: true, sex: 'male', dob: '1990-01-01', heightCm: 180 })) await Storage.setPref(k, v);
      const d = new Date(); d.setDate(d.getDate() - 1);
      await Storage.saveWorkout({ id: 'w1', name: 'Push', date: U.todayISO(d), startedAt: d.getTime(),
        completedAt: d.getTime() + 3600e3,
        exercises: [{ exerciseId: 'bench-press-barbell', name: 'Bench', type: 'weighted',
          sets: [{ weight: 80, reps: 8, done: true }] }] });
    });
    await p.reload({ waitUntil: 'load' });
    await p.waitForTimeout(2400);
    await p.evaluate(() => document.querySelectorAll('.splash').forEach(n => n.remove()));
    const card = await p.evaluate(() => {
      const n = document.querySelector('[data-testid="backup-cta"]');
      return n ? { text: n.textContent.slice(0, 80), hasNow: /Backup now/.test(n.textContent), hasLater: /Later/.test(n.textContent) } : null;
    });
    check('the backup card is on Home when data exists and no backup does', !!card, JSON.stringify(card));
    check('it offers Backup now and Later', !!card && card.hasNow && card.hasLater);

    // "Later" snoozes it — the card must come down and stay down this week.
    await p.evaluate(() => {
      const n = document.querySelector('[data-testid="backup-cta"]');
      [...n.querySelectorAll('button')].find(b => b.textContent === 'Later')?.click();
    });
    await p.waitForTimeout(1600);
    const after = await p.evaluate(async () => ({
      card: !!document.querySelector('[data-testid="backup-cta"]'),
      snooze: await Storage.getPref('backupSnoozedUntil', null)
    }));
    check('Later takes the card down', after.card === false);
    check('and records a snooze that outlives the render', !!after.snooze, String(after.snooze).slice(0, 10));
    await p.evaluate(async () => { await Storage.clearAll(); });
    await c.close();
  }

  console.log('\n=== 7. two tabs cannot destroy each other\'s sets ===');
  {
    // The audit's worst finding: each tab held its own copy of the session
    // and wrote the whole record back — log five sets in tab A, touch tab B,
    // and the five sets were gone. The rule now is single ownership: the tab
    // that claims the workout makes every other tab drop its copy.
    const c = await b.newContext(ctxOpts);
    const A = await c.newPage();
    await A.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
    await A.waitForFunction(() => window.Storage && window.U);
    await A.evaluate(async () => {
      await Storage.clearAll();
      for (const [k, v] of Object.entries({ onboarded: true, guidedSets: false, warmupPrompt: false, radialDiscovered: true })) await Storage.setPref(k, v);
      await Storage.saveWorkout({ id: 'shared', name: 'Shared', date: U.todayISO(), startedAt: Date.now(),
        exercises: [{ exerciseId: 'bench-press-barbell', name: 'Bench', type: 'weighted',
          sets: [{ weight: 60, reps: 5, done: false }, { weight: 60, reps: 5, done: false }] }] });
      await Storage.setPref('activeWorkoutId', 'shared');
    });
    await A.reload({ waitUntil: 'load' });
    await A.waitForTimeout(2400);
    await A.evaluate(() => document.querySelectorAll('.splash').forEach(n => n.remove()));
    await A.evaluate(() => document.querySelector('.home-active-workout .btn-primary')?.click());
    await A.waitForTimeout(1400);
    const aHasSession = await A.evaluate(() => !!document.querySelector('[data-testid="set-row-0"]'));
    check('tab A holds the live session', aHasSession);

    // Tab B opens and resumes the same workout — it claims ownership.
    const B = await c.newPage();
    await B.goto('http://localhost:8199/index.html', { waitUntil: 'load' });
    await B.waitForFunction(() => window.Storage && window.U);
    await B.waitForTimeout(2400);
    await B.evaluate(() => document.querySelectorAll('.splash').forEach(n => n.remove()));
    await A.waitForTimeout(800);
    const aReleased = await A.evaluate(() => ({
      session: !!document.querySelector('[data-testid="set-row-0"]'),
      toast: document.body.textContent.includes('another tab')
    }));
    check('tab A lets go the moment B claims', aReleased.session === false, JSON.stringify(aReleased));

    // B logs a set; then A — now holding nothing — cannot clobber it.
    await B.evaluate(() => document.querySelector('.home-active-workout .btn-primary')?.click());
    await B.waitForTimeout(1400);
    await B.evaluate(() => {
      const btn = document.querySelector('[data-testid="set-done-0"]');
      btn?.scrollIntoView({ block: 'center' });
      btn?.click();
    });
    await B.waitForTimeout(1200);
    // Anything tab A does now goes through a null activeWorkout — poke its UI.
    await A.evaluate(() => document.querySelector('[data-testid="dock-home"]')?.click());
    await A.waitForTimeout(1200);
    const final = await B.evaluate(async () => {
      const w = await Storage.getWorkout('shared');
      return { doneSets: w.exercises[0].sets.filter(s => s.done).length };
    });
    check("B's logged set survives A's activity", final.doneSets === 1, `${final.doneSets} done sets`);
    await A.evaluate(async () => { await Storage.clearAll(); });
    await c.close();
  }

  await b.close();
  console.log(`\n${fails === 0 ? 'ALL PASS' : fails + ' FAILED'}`);
  process.exit(fails === 0 ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
