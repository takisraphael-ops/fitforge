// Guided interval runner — the engine behind "press start and go".
//
// Two clocks, deliberately kept apart, because the browser will take one of
// them away the moment your screen locks:
//
//   position — where you are in the protocol. Derived from wall-clock elapsed
//              time on every read, never accumulated from ticks, so it cannot
//              drift and is correct the instant you look at it after any
//              suspension. Measured at ±10 ms after a 40 s dead main thread.
//   cues     — the beeps. Every one for the whole session is queued onto the
//              AudioContext timeline inside the Start gesture. The audio clock
//              runs on its own thread, so a throttled or frozen page still
//              gets its cues: measured at 6.7 ms accuracy with the JS thread
//              suspended, against 22 s late when driven from a JS callback.
//
// The paint loop only paints. If it stops dead, the run is still correct and
// the efforts still log.
(function () {
  "use strict";

  /** Flatten a step list into absolute offsets, and map work steps to set rows. */
  function buildTimeline(steps) {
    const out = [];
    let at = 0;
    let workIndex = 0;
    for (let i = 0; i < (steps || []).length; i++) {
      const s = steps[i];
      const sec = Math.max(0, Number(s.sec) || 0);
      out.push({
        i, start: at, end: at + sec, sec,
        work: !!s.work,
        // Held on each side: one step, cued at the midpoint, logged as the
        // whole thing — splitting it into two steps would double the set rows.
        perSide: !!s.perSide,
        // Opaque routing tag. Interval sessions leave it undefined and use
        // setIndex; a mobility flow spans several exercises and uses this to
        // say which one each effort belongs to.
        ref: s.ref || null,
        // Work steps only, in order — so the nth effort maps to sets[n] and
        // the stored workout shape needs no change.
        setIndex: s.work ? workIndex++ : -1,
        label: s.label || "",
        intensity: s.intensity || "moderate"
      });
      at += sec;
    }
    return { steps: out, totalSec: at, workCount: workIndex };
  }

  function create(opts) {
    opts = opts || {};
    const plan = buildTimeline(opts.steps);
    const onPaint = opts.onPaint || function () {};
    const onStepChange = opts.onStepChange || function () {};
    const onComplete = opts.onComplete || function () {};

    let startedAt = null;      // epoch ms
    let pausedAt = null;       // epoch ms, while paused
    let pausedTotal = 0;       // ms accumulated across pauses
    let lastStepIndex = -1;
    let tick = null;
    let ctx = null;
    let bus = null;
    let scheduled = [];
    let keepAlive = null;
    let wakeLock = null;
    let finished = false;

    // Audio health, for the self-test. If the context is interrupted while the
    // screen is off, the cues stop — the run stays correct but the coaching
    // goes quiet, and the user deserves to be told rather than left guessing.
    const health = { everSuspended: false, hiddenMs: 0, reschedules: 0, cuesQueued: 0 };
    let hiddenSince = null;

    // How each step was actually experienced. A step that ran to its end
    // untouched can be auto-logged; one paused through or skipped cannot, and
    // carries the seconds actually served instead.
    const record = plan.steps.map(s => ({
      i: s.i, setIndex: s.setIndex, ref: s.ref, work: s.work,
      targetSec: s.sec, actualSec: 0, pausedDuring: false, skipped: false, clean: false
    }));

    function elapsedMs() {
      if (startedAt == null) return 0;
      const paused = pausedTotal + (pausedAt != null ? Date.now() - pausedAt : 0);
      return Math.max(0, Date.now() - startedAt - paused);
    }

    // Binary search — 10-20-30 Running has 66 steps and this runs every paint.
    function stepAt(sec) {
      const a = plan.steps;
      if (!a.length || sec >= plan.totalSec) return -1;
      let lo = 0, hi = a.length - 1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (sec < a[mid].start) hi = mid - 1;
        else if (sec >= a[mid].end) lo = mid + 1;
        else return mid;
      }
      return -1;
    }

    function state() {
      const sec = elapsedMs() / 1000;
      const idx = stepAt(sec);
      const done = idx === -1 && startedAt != null;
      const step = idx >= 0 ? plan.steps[idx] : null;
      const half = step && step.perSide
        ? (sec - step.start < step.sec / 2 ? 1 : 2)
        : null;
      return {
        elapsedSec: sec,
        stepIndex: idx,
        step,
        side: half,
        nextStep: idx >= 0 && idx + 1 < plan.steps.length ? plan.steps[idx + 1] : null,
        remainInStep: step ? step.end - sec : 0,
        remainTotal: Math.max(0, plan.totalSec - sec),
        totalSec: plan.totalSec,
        running: startedAt != null && pausedAt == null && !done,
        paused: pausedAt != null,
        done
      };
    }

    // ---- cues ----------------------------------------------------------

    function tone(at, freq, durSec, gain) {
      // Protocols that open on a work step want lead-in beeps before t=0.
      // There is no such time — drop them rather than throwing.
      if (!ctx || at < ctx.currentTime) return null;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = freq;
      // A raw gate on an oscillator clicks; ramp it.
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(gain, at + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, at + durSec);
      o.connect(g); g.connect(bus || ctx.destination);
      o.start(at); o.stop(at + durSec + 0.02);
      scheduled.push({ osc: o, at });
      return o;
    }

    /** Queue every remaining cue in one pass. 148 oscillators for the longest
        protocol in the library, scheduled 43 minutes ahead, costs ~29 ms. */
    function scheduleCues(fromSec) {
      if (!ctx) return 0;
      const base = ctx.currentTime - fromSec;
      let n = 0;
      for (const s of plan.steps) {
        if (s.end <= fromSec) continue;
        const at = base + s.start;
        if (at < ctx.currentTime) continue;
        if (s.work) {
          // Going INTO an effort gets a count-in and a higher tone — that is
          // the cue that matters. Recovery gets a single lower note.
          tone(at - 0.30, 660, 0.09, 0.15);
          tone(at - 0.15, 660, 0.09, 0.15);
          tone(at, 990, 0.20, 0.22);
        } else {
          tone(at, 440, 0.18, 0.16);
        }
        // Switch sides: two quick notes, unmistakably not a step change.
        if (s.perSide) {
          const mid = at + s.sec / 2;
          tone(mid, 780, 0.10, 0.17);
          tone(mid + 0.16, 780, 0.10, 0.17);
        }
        n++;
      }
      const endAt = base + plan.totalSec;
      if (endAt > ctx.currentTime) {
        tone(endAt, 880, 0.15, 0.2);
        tone(endAt + 0.22, 1320, 0.3, 0.2);
        n++;
      }
      health.cuesQueued = n;
      return n;
    }

    function clearCues() {
      for (const s of scheduled) { try { s.osc.stop(); } catch (_) {} }
      scheduled = [];
    }

    // A near-silent looping source holds the audio session open. Without an
    // active source some platforms let the context lapse when the page is
    // hidden, which would take the scheduled cues with it.
    function startKeepAlive() {
      if (!ctx || keepAlive) return;
      const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (i % 2 ? 1 : -1) * 1e-7;
      const src = ctx.createBufferSource();
      const g = ctx.createGain();
      g.gain.value = 0.0005;
      src.buffer = buf; src.loop = true;
      src.connect(g); g.connect(bus || ctx.destination);
      src.start();
      keepAlive = src;
    }

    function stopKeepAlive() {
      if (keepAlive) { try { keepAlive.stop(); } catch (_) {} keepAlive = null; }
    }

    async function openAudio(AudioCtor) {
      const AC = AudioCtor || window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      try {
        ctx = new AC();
        if (ctx.state === "suspended") await ctx.resume();
        bus = ctx.createGain();
        bus.gain.value = 1;
        bus.connect(ctx.destination);
        if (opts.onAudioReady) await opts.onAudioReady(ctx, bus);
        startKeepAlive();
        return true;
      } catch (_) { ctx = null; bus = null; return false; }
    }

    // ---- screen + visibility -------------------------------------------

    async function acquireWakeLock() {
      if (!navigator.wakeLock) return;
      try {
        wakeLock = await navigator.wakeLock.request("screen");
        wakeLock.addEventListener("release", () => { wakeLock = null; });
      } catch (_) { wakeLock = null; }
    }

    function releaseWakeLock() {
      if (wakeLock) { try { wakeLock.release(); } catch (_) {} wakeLock = null; }
    }

    // Coming back from a hidden tab: the position needs nothing (it is derived),
    // but the audio context may have been interrupted, which silently drops
    // every queued cue. Re-open and re-queue from wherever we now are.
    async function onVisibility() {
      if (document.hidden) {
        hiddenSince = Date.now();
        return;
      }
      if (hiddenSince != null) { health.hiddenMs += Date.now() - hiddenSince; hiddenSince = null; }
      if (startedAt == null || pausedAt != null || finished) return;
      acquireWakeLock();
      if (ctx && ctx.state !== "running") {
        health.everSuspended = true;
        try { await ctx.resume(); } catch (_) {}
      }
      if (ctx && ctx.state === "running") {
        // Anything queued before an interruption is gone or misaligned.
        clearCues();
        scheduleCues(elapsedMs() / 1000);
        health.reschedules++;
      }
      if (!tick) loop();
    }

    // ---- paint loop ----------------------------------------------------

    function loop() {
      if (startedAt == null || pausedAt != null) { tick = null; return; }
      const st = state();
      if (st.stepIndex !== lastStepIndex) {
        creditThrough(lastStepIndex, st.stepIndex);
        lastStepIndex = st.stepIndex;
        onStepChange(st);
      }
      onPaint(st);
      if (st.done && !finished) {
        finished = true;
        finalise();
        onComplete(summary());
        tick = null;
        return;
      }
      // Land the next tick ON the boundary rather than polling past it —
      // otherwise every step change reports up to a full tick late.
      const untilBoundary = st.step ? st.remainInStep * 1000 : 100;
      tick = setTimeout(loop, Math.max(16, Math.min(100, untilBoundary + 4)));
    }

    // Credit whole steps crossed since the last paint. A page frozen for two
    // minutes returns having crossed several at once; they still record.
    function creditThrough(from, to) {
      const upTo = to === -1 ? plan.steps.length - 1 : to - 1;
      for (let i = Math.max(0, from); i <= upTo; i++) {
        const r = record[i];
        if (r.actualSec >= r.targetSec) continue;
        r.actualSec = r.targetSec;
        r.clean = !r.pausedDuring && !r.skipped;
      }
    }

    function finalise() {
      const st = state();
      if (st.stepIndex >= 0) {
        const r = record[st.stepIndex];
        r.actualSec = Math.max(r.actualSec, Math.round(st.elapsedSec - plan.steps[st.stepIndex].start));
      } else {
        creditThrough(lastStepIndex === -1 ? 0 : lastStepIndex, -1);
      }
      stopKeepAlive();
      releaseWakeLock();
    }

    /** What to write back into the workout. Only work steps become sets, and
        only steps that ran clean auto-tick. */
    function summary() {
      const sets = record.filter(r => r.work).map(r => {
        const seconds = Math.round(r.clean ? r.targetSec : r.actualSec);
        return {
          setIndex: r.setIndex,
          ref: r.ref,
          seconds,
          targetSec: r.targetSec,
          autoLogged: r.clean,
          adjusted: !r.clean && !r.skipped && seconds > 0,
          skipped: seconds === 0
        };
      });
      return {
        sets,
        totalSec: plan.totalSec,
        elapsedSec: Math.round(elapsedMs() / 1000),
        cleanCount: sets.filter(s => s.autoLogged).length,
        loggedCount: sets.filter(s => !s.skipped).length,
        workCount: plan.workCount,
        health: {
          audio: !!ctx,
          everSuspended: health.everSuspended,
          hiddenMs: health.hiddenMs + (hiddenSince ? Date.now() - hiddenSince : 0),
          reschedules: health.reschedules,
          wakeLock: !!wakeLock
        }
      };
    }

    document.addEventListener("visibilitychange", onVisibility);

    return {
      plan,
      state,
      summary,
      health: () => health,

      /** Must be called from a user gesture — that is what unlocks audio on iOS. */
      async start(AudioCtor) {
        const audio = await openAudio(AudioCtor);
        startedAt = Date.now();
        pausedTotal = 0; pausedAt = null; finished = false; lastStepIndex = -1;
        const cues = scheduleCues(0);
        acquireWakeLock();
        loop();
        return { audio, audioState: ctx ? ctx.state : "none", cuesScheduled: cues };
      },

      /** Pick a run back up after a reload. The timeline is reconstructed from
          the stored start time, so the position is exact rather than guessed. */
      async resume(persisted, AudioCtor) {
        if (!persisted || !persisted.startedAt) return { audio: false, cuesScheduled: 0 };
        startedAt = persisted.startedAt;
        pausedTotal = persisted.pausedTotal || 0;
        pausedAt = persisted.pausedAt || null;
        finished = false; lastStepIndex = -1;
        // Everything already elapsed is credited, so a run finished while the
        // app was closed still logs its efforts.
        const nowSec = elapsedMs() / 1000;
        creditThrough(0, stepAt(nowSec));
        const audio = await openAudio(AudioCtor);
        const cues = scheduleCues(nowSec);
        acquireWakeLock();
        loop();
        return { audio, cuesScheduled: cues, resumedAtSec: nowSec };
      },

      /** The three numbers needed to rebuild this run exactly. */
      persist() {
        return { startedAt, pausedTotal, pausedAt };
      },

      pause() {
        if (startedAt == null || pausedAt != null || finished) return;
        pausedAt = Date.now();
        const st = state();
        if (st.stepIndex >= 0) record[st.stepIndex].pausedDuring = true;
        clearCues();
        if (tick) { clearTimeout(tick); tick = null; }
        releaseWakeLock();
        onPaint(state());
      },

      unpause() {
        if (pausedAt == null) return;
        pausedTotal += Date.now() - pausedAt;
        pausedAt = null;
        // Everything downstream shifted, so the cue timeline is rebuilt whole.
        clearCues();
        scheduleCues(elapsedMs() / 1000);
        acquireWakeLock();
        loop();
      },

      /** Jump to the next step, crediting only the seconds actually served. */
      skip() {
        const st = state();
        if (st.stepIndex < 0 || finished) return;
        const s = plan.steps[st.stepIndex];
        const r = record[st.stepIndex];
        r.actualSec = Math.round(st.elapsedSec - s.start);
        r.skipped = true;
        r.clean = false;
        // Shift the origin so "now" lands on the next boundary.
        pausedTotal -= (s.end - st.elapsedSec) * 1000;
        clearCues();
        scheduleCues(elapsedMs() / 1000);
        if (!tick) loop();
      },

      /** End early. Everything served so far is still credited. */
      stop() {
        if (!finished) { finished = true; finalise(); }
        clearCues();
        if (tick) { clearTimeout(tick); tick = null; }
        document.removeEventListener("visibilitychange", onVisibility);
        const s = summary();
        if (ctx) { try { ctx.close(); } catch (_) {} ctx = null; bus = null; }
        return s;
      },

      _debug: () => ({ ctx, bus, scheduled, record, plan })
    };
  }

  // ---- shared cue bus -------------------------------------------------
  // One app-wide AudioContext, opened inside a user gesture and kept. The rest
  // timer used to build a fresh context at fire time, outside any gesture,
  // which on iOS yields a suspended context and silence. Scheduling ahead on
  // one long-lived context also means the beep survives a backgrounded tab —
  // a JS-timer beep does not.
  const shared = { ctx: null, bus: null, keepAlive: null };

  function unlock() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      if (!shared.ctx) {
        shared.ctx = new AC();
        shared.bus = shared.ctx.createGain();
        shared.bus.gain.value = 1;
        shared.bus.connect(shared.ctx.destination);
      }
      if (shared.ctx.state === "suspended") shared.ctx.resume();
      return shared.ctx;
    } catch (_) { shared.ctx = null; return null; }
  }

  function sharedTone(at, freq, durSec, gain) {
    const ctx = shared.ctx;
    if (!ctx || at < ctx.currentTime) return null;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(gain, at + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, at + durSec);
    o.connect(g); g.connect(shared.bus);
    o.start(at); o.stop(at + durSec + 0.02);
    return o;
  }

  /** Queue a "time's up" chime `inSec` from now. Returns a canceller. */
  function scheduleChime(inSec) {
    const ctx = unlock();
    if (!ctx) return () => {};
    const at = ctx.currentTime + Math.max(0, inSec);
    const oscs = [
      sharedTone(at, 880, 0.15, 0.2),
      sharedTone(at + 0.2, 1320, 0.28, 0.2)
    ].filter(Boolean);
    return () => { for (const o of oscs) { try { o.stop(); } catch (_) {} } };
  }

  window.IntervalRunner = { create, buildTimeline, unlock, scheduleChime };
})();
