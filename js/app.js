// FitForge — main application
(function () {
  const $ = (sel) => document.querySelector(sel);
  const { el, clear } = U;

  // ============ Icons (inline SVG) ============
  const icons = {
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    dumbbell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5l11 11"/><path d="M21 21l-1-1"/><path d="M3 3l1 1"/><path d="M18 22l4-4"/><path d="M2 6l4-4"/><path d="M3 10l7-7"/><path d="M14 21l7-7"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    repeat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
    bookmark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>'
  };

  // ============ App state ============
  /** Mobile set-row: which tool trays are expanded (session-only). */
  const expandedSetTools = new Set();

  const state = {
    tab: "home",
    activeWorkout: null,   // {id, name, date, startedAt, exercises: [{exerciseId, name, sets: [{weight, reps, done, isPR}]}], notes}
    restTimer: null,       // { endsAt, exerciseId, defaultSec }
    restInterval: null,
    restCancelChime: null, // cancels the queued end-of-rest tone
    workoutInterval: null,
    prefs: {}              // { kcalGoal, kcalGoalMode, sex, age, heightCm, activityLevel, defaultRestSec, theme }
  };

  // ============ Bootstrap ============
  // ---- One tab owns the live workout -------------------------------------
  //
  // Two tabs used to hold independent in-memory copies of the same session
  // and write whole records over each other — log five sets in one tab,
  // touch the other, and the five sets were gone with no error. The rule
  // now: claiming the workout makes every other tab drop its copy on the
  // spot. A tab that cannot write a stale copy cannot destroy anything.
  const TAB_ID = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const tabChannel = (typeof BroadcastChannel !== "undefined")
    ? new BroadcastChannel("fitforge-workout")
    : null;

  function claimActiveWorkout() {
    if (tabChannel) tabChannel.postMessage({ type: "claim", tab: TAB_ID });
  }

  function releaseActiveWorkout() {
    if (!state.activeWorkout) return;
    state.activeWorkout = null;
    if (state.workoutInterval) { clearInterval(state.workoutInterval); state.workoutInterval = null; }
    state.restTimer = null;
    // Runner overlays hold their own copy of the session; they go too.
    document.querySelectorAll(".srun, .rest-overlay, [data-testid=\"rest-timer\"]").forEach(n => n.remove());
    toast("Workout continued in another tab");
    renderMain();
  }

  if (tabChannel) {
    tabChannel.addEventListener("message", (e) => {
      const msg = e.data || {};
      if (msg.type === "claim" && msg.tab !== TAB_ID) releaseActiveWorkout();
    });
  }

  /** The not-being-saved warning. Present exactly while it is true. */
  function updateStorageBanner(health) {
    const existing = document.getElementById("storage-banner");
    const inMemory = health.engine === "memory" || health.pendingMemWrites > 0;
    if (!inMemory) {
      if (existing) {
        existing.remove();
        document.body.classList.remove("has-storage-banner");
        toast("Storage recovered — everything held in memory has been saved");
      }
      return;
    }
    if (existing) return;
    const banner = el("div", { id: "storage-banner", "data-testid": "storage-banner", role: "alert" },
      el("strong", {}, "Nothing is being saved. "),
      el("span", {}, "This browser is blocking storage — export a backup before closing. "),
      el("button", {
        class: "storage-banner-btn", type: "button",
        on: { click: () => exportData() }
      }, "Export now")
    );
    document.body.appendChild(banner);
    document.body.classList.add("has-storage-banner");
  }

  async function init() {
    // Register service worker for PWA. Poll for updates so bug fixes propagate.
    if ("serviceWorker" in navigator) {
      // Register with a version query so browsers re-fetch sw.js after deploys.
      // Keep this ?v= in lockstep with index.html / sw.js on every version bump.
      navigator.serviceWorker.register("./sw.js?v=276").then(reg => {
        // Nudge the waiting worker to activate immediately when one appears.
        const promote = (worker) => {
          if (!worker) return;
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            worker.postMessage("SKIP_WAITING");
          }
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              worker.postMessage("SKIP_WAITING");
            }
          });
        };
        promote(reg.waiting);
        promote(reg.installing);
        reg.addEventListener("updatefound", () => promote(reg.installing));
        // Check for updates on load and periodically while the tab is open.
        reg.update().catch(() => {});
        setInterval(() => reg.update().catch(() => {}), 5 * 60 * 1000);
      }).catch(() => {});
      // When a new SW takes control, reload once so the new app.js runs — but
      // never out from under a live session. Updates poll every 5 minutes and
      // workouts run longer than that, so without this gate a deploy lands
      // mid-set: the sets survive (autosave), but the rest timer and any open
      // form do not. Mid-workout the reload waits for the session to end.
      let reloaded = false;
      let pendingReload = false;
      const reloadForUpdate = () => {
        if (reloaded) return;
        if (state.activeWorkout) { pendingReload = true; return; }
        reloaded = true;
        location.reload();
      };
      navigator.serviceWorker.addEventListener("controllerchange", reloadForUpdate);
      document.addEventListener("visibilitychange", () => {
        if (pendingReload && document.hidden && !state.activeWorkout) {
          reloaded = true;
          location.reload();
        }
      });
    }
    await Storage.open();
    // Wrapped before anything writes, so no change can slip past unstamped
    // and leave a swipe showing a pane built from data that has since moved.
    watchStorageWrites();
    // Ask the browser not to evict this origin's data under storage pressure,
    // and keep the answer: Settings shows it, because "protected" versus
    // "evictable" is the difference between keeping a year of history and
    // losing it to a storage sweep the user was never warned about.
    try { state.persistGranted = await Storage.requestPersistent(); } catch (_) { state.persistGranted = false; }
    // Catch the install prompt where the platform offers one, so Settings can
    // present "Install app" instead of a paragraph of browser-menu directions.
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      state.installPrompt = e;
    });
    state.prefs = await loadPrefs();
    initA11yRegions();
    applyAccent(state.prefs.accent);
    applyTheme(state.prefs.theme);
    // Resume active workout if any
    const active = await Storage.getPref("activeWorkoutId", null);
    if (active) {
      const w = await Storage.getWorkout(active);
      if (w && !w.completedAt) {
        // Repair the shape at the door. A workout without an exercises array
        // (older build, hand-edited import) crashed the renderer — silently,
        // until the crash started being surfaced, which is how this was found.
        if (!Array.isArray(w.exercises)) w.exercises = [];
        // Fix any cardio exercises that older builds saved as weighted (kg/reps).
        try {
          const all = typeof EXERCISE_DB !== "undefined" ? EXERCISE_DB : [];
          let changed = false;
          for (const ex of (w.exercises || [])) {
            const def = all.find(x => x.id === ex.exerciseId);
            const before = ex.type;
            normalizeWorkoutExercise(ex, def);
            if (ex.type !== before) changed = true;
          }
          if (changed) await Storage.saveWorkout(w);
        } catch (_) { /* non-fatal */ }
        state.activeWorkout = w;
        startWorkoutTimer();
        // This tab now owns the session; any other tab holding it lets go.
        claimActiveWorkout();
        // A guided run that was in flight when the app closed picks up exactly
        // where the clock says it should be — including finishing itself and
        // logging the efforts if the whole protocol elapsed while you were away.
        const running = (w.exercises || []).find(e => e.run && e.run.startedAt);
        if (running) setTimeout(() => resumeIntervalRun(running), 400);
        else if (w.flowRun && w.flowRun.startedAt) {
          setTimeout(() => (circuitSpecFor(w) ? resumeCircuitRun(w) : resumeMobilityFlow(w)), 400);
        }
      }
    }
    // Force a SW update check on every cold start so cardio fixes propagate.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => reg && reg.update().catch(() => {})).catch(() => {});
    }
    // iOS only lets an AudioContext open inside a user gesture. Take the very
    // first one, so every later cue has a live context to schedule onto.
    const unlockAudio = () => {
      try { IntervalRunner.unlock(); } catch (_) {}
      document.removeEventListener("pointerdown", unlockAudio);
      document.removeEventListener("keydown", unlockAudio);
    };
    document.addEventListener("pointerdown", unlockAudio, { once: false });
    document.addEventListener("keydown", unlockAudio, { once: false });

    migrateTimedHolds();
    render();
    initTabSwipe();
    // A browser that is not persisting data gets a banner that stays, not a
    // toast that fades in 2 seconds under the splash. The banner also appears
    // mid-session if writes start landing in memory, and comes down on its
    // own if the database recovers and the held writes drain back in.
    Storage.onStorageHealth(updateStorageBanner);
    updateStorageBanner(Storage.storageHealth());
    // A rejected renderer or a thrown handler used to be a console line and a
    // blank screen. Surface it: the user learns their last action may not
    // have saved, instead of finding out from a hole in their history.
    let lastErrToast = 0;
    const surfaceError = (err) => {
      console.error(err);
      const now = Date.now();
      if (now - lastErrToast < 30000) return;
      lastErrToast = now;
      toast("Something went wrong — the last action may not have saved");
    };
    window.addEventListener("unhandledrejection", (e) => surfaceError(e.reason));
    window.addEventListener("error", (e) => surfaceError(e.error || e.message));
    // First run: greet new users with the guided setup quiz rather than the dense
    // settings form. Only auto-opens once (until profile is complete or skipped).
    if (!state.prefs.onboarded && !U.profileComplete(state.prefs) && !state.activeWorkout) {
      setTimeout(() => openProfileQuiz({ firstRun: true }), 400);
    }
  }

  // ============ Theme ============
  // Two independent axes: light/dark (the `dark` class) and the accent colour
  // (`data-accent`). Each accent ships a light and a dark tone — a single tone
  // cannot serve both, since a colour bright enough to read on near-black is
  // illegible on near-white.
  const ACCENTS = [
    { id: "ice", label: "Ice", swatch: "#4ecdc4" },
    { id: "mint", label: "Mint", swatch: "#4ade80" },
    { id: "cobalt", label: "Cobalt", swatch: "#8ba4ff" },
    { id: "amber", label: "Amber", swatch: "#f0a23a" }
  ];
  const DEFAULT_ACCENT = "amber";

  // Bumped by tools/bump.js in lockstep with the service worker cache name,
  // and shown at the foot of Settings. There was no way, from a phone, to
  // tell which build you were looking at — which cost several rounds of
  // debugging a fix that turned out never to have deployed.
  const APP_VERSION = 276;
  const isAccent = (id) => ACCENTS.some(a => a.id === id);

  // Keep the browser chrome (iOS status bar, Android task switcher) in step
  // with the theme rather than pinned to one dark navy.
  function syncThemeColorMeta() {
    const m = document.querySelector('meta[name="theme-color"]');
    if (!m) return;
    const cs = getComputedStyle(document.documentElement);
    const bg = (cs.getPropertyValue("--bg") || "").trim();
    if (bg) m.setAttribute("content", bg);
  }

  // Dark is the default look; users can flip to light and it persists.
  function applyTheme(pref) {
    const theme = pref || "dark";
    document.documentElement.classList.toggle("dark", theme === "dark");
    syncThemeColorMeta();
  }
  function applyAccent(pref) {
    const accent = isAccent(pref) ? pref : DEFAULT_ACCENT;
    document.documentElement.setAttribute("data-accent", accent);
  }
  async function toggleTheme() {
    const current = document.documentElement.classList.contains("dark") ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    state.prefs.theme = next;
    document.documentElement.classList.toggle("dark", next === "dark");
    syncThemeColorMeta();
    await Storage.setPref("theme", next);
  }

  // ============ Combined exercise list (built-in + custom) ============
  async function getAllExercises() {
    const custom = await Storage.getCustomExercises();
    return [...EXERCISE_DB, ...custom.map(c => ({ ...c, isCustom: true }))];
  }

  // ============ Get history for an exercise (all completed sets) ============
  async function getHistoryFor(exerciseId) {
    const workouts = await Storage.getWorkouts();
    const history = [];
    for (const w of workouts) {
      if (!w.completedAt) continue;
      for (const ex of (w.exercises || [])) {
        if (ex.exerciseId === exerciseId) {
          const isCardio = ex.type === "cardio";
          const doneSets = (ex.sets || []).filter(s => {
            if (!s.done || U.isWarmup(s)) return false;
            if (ex.type === "hold" || ex.type === "interval" || s.seconds != null) return !!s.seconds;
            if (isCardio || s.durationMin != null) return !!s.durationMin;
            // Bodyweight sets store weight as 0 — still valid if reps logged.
            return s.reps != null && s.reps > 0;
          });
          if (doneSets.length) history.push({ workoutId: w.id, date: w.date, sets: doneSets, type: ex.type });
        }
      }
    }
    history.sort((a, b) => b.date.localeCompare(a.date));
    return history;
  }

  // ============ Strength levels (gamified, from e1RM vs bodyweight) ============
  const STRENGTH_TIERS = ["Beginner", "Novice", "Intermediate", "Advanced", "Elite"];
  const STRENGTH_TIER_COLORS = ["#8a94a6", "#5bb8c9", "#4bbd6a", "#e0913f", "#e8c14a"];
  // Entry ratios (e1RM ÷ bodyweight) to reach Novice / Intermediate / Advanced / Elite.
  const STRENGTH_STANDARDS = {
    bench:    [0.75, 1.0, 1.5, 2.0],
    squat:    [1.0, 1.5, 2.0, 2.5],
    deadlift: [1.25, 1.75, 2.25, 2.75],
    ohp:      [0.45, 0.65, 0.9, 1.15],
    row:      [0.6, 0.9, 1.2, 1.5],
    pulldown: [0.6, 0.85, 1.1, 1.4],
    curl:     [0.3, 0.45, 0.6, 0.8],
    generic:  [0.5, 0.8, 1.2, 1.6]
  };
  function liftKeyForStandards(ex) {
    const n = (ex && ex.name || "").toLowerCase();
    if (/bench press/.test(n)) return "bench";
    if (/deadlift/.test(n)) return "deadlift";
    if (/squat/.test(n)) return "squat";
    if (/(overhead|shoulder|military).*press|\bohp\b/.test(n)) return "ohp";
    if (/pulldown|pull-?up|chin-?up/.test(n)) return "pulldown";
    if (/row/.test(n)) return "row";
    if (/curl/.test(n)) return "curl";
    return "generic";
  }
  // How the women's thresholds scale off the men's, per lift.
  //
  // This was a single 0.72 for everything, and one number cannot be right for
  // both ends of the body. The sex difference in strength is much larger in the
  // upper body than the lower — women carry proportionally less muscle above
  // the waist — so the usual figures are around 55–65% of male strength for
  // upper-body work and 70–80% for the legs. A flat factor splits the
  // difference and is therefore wrong in both directions at once: at 65kg it
  // asked a woman for 70kg to call her bench Advanced when the evidence puts it
  // near 58, and let a 94kg squat count as Advanced when it should be nearer
  // 104. Twenty per cent too hard on the press, ten per cent too easy on the
  // legs.
  //
  // Three values, not eight, because three is the granularity the evidence
  // supports: pressing, pulling, and lower body. Pulling sits between them —
  // women do relatively better at it than at pressing.
  //
  // Still an approximation, and worth being plain about: the sources that do
  // this properly publish separate women's tables rather than scaling the
  // men's, because the shape of the distribution differs and not only its
  // scale. This is a better approximation than one number. It is not the same
  // thing as real women's standards.
  const FEMALE_STANDARD_RATIO = {
    bench: 0.6, ohp: 0.6, curl: 0.6,       // upper-body press and isolation
    row: 0.65, pulldown: 0.65,             // upper-body pull
    squat: 0.8, deadlift: 0.8,             // lower body
    generic: 0.7                           // mixed / unknown lift
  };
  // How the thresholds come down with age, and from when.
  //
  // The tiers already normalise for bodyweight and for sex, which makes them a
  // claim about people like you rather than about people in general. Leaving
  // age out of that was not restraint, it was an inconsistency: it measured a
  // sixty-year-old against a twenty-five-year-old's yardstick for ever.
  //
  // Nothing moves before forty, because the decline is the part that is well
  // characterised. The way up is dominated by training age and by maturation,
  // neither of which the app can see, so a young lifter is measured against
  // the adult standard and left alone.
  //
  // The bands come from comparing two sources that mostly agree — the masters
  // powerlifting coefficients, and a flat one per cent a year from forty — and
  // taking the SMALLER adjustment at every step. Erring that way means the tier
  // is occasionally harder than it should be and never softer, which is the
  // side to be wrong on when the output is a compliment.
  //
  // Bands rather than a curve on purpose. A per-year figure would imply a
  // precision that is not there, and a band is something the label can say out
  // loud: see `ageBand` below, which is the part that keeps this honest.
  const AGE_STANDARD_BANDS = [
    { from: 70, ratio: 0.70, label: "70+" },
    { from: 60, ratio: 0.80, label: "60+" },
    { from: 50, ratio: 0.88, label: "50+" },
    { from: 40, ratio: 0.95, label: "40+" }
  ];
  function ageStandardFor(age) {
    const a = Number(age);
    if (!Number.isFinite(a)) return null;
    return AGE_STANDARD_BANDS.find(b => a >= b.from) || null;
  }
  // Returns a strength tier for a lift, or null when it can't be computed.
  function strengthLevel(ex, e1rm, bwKg, sex, age) {
    if (!e1rm || !bwKg || bwKg <= 0) return null;
    // No sex on file means no standard to measure against. This used to fall
    // through to the men's table, so anyone who had not answered that question
    // was being graded against it without being told — a tier is a claim about
    // where you sit among people, and it cannot be made without knowing which
    // people. Every caller already handles a null.
    if (sex !== "male" && sex !== "female") return null;
    const key = liftKeyForStandards(ex);
    const base = STRENGTH_STANDARDS[key] || STRENGTH_STANDARDS.generic;
    const f = sex === "female" ? (FEMALE_STANDARD_RATIO[key] ?? FEMALE_STANDARD_RATIO.generic) : 1;
    // No age on file means the plain adult standard, which is a real standard
    // rather than a guess — unlike a missing sex, where there is no sensible
    // default at all. So this one degrades quietly and that is honest.
    const band = ageStandardFor(age);
    const th = base.map(v => v * f * (band ? band.ratio : 1));
    const ratio = e1rm / bwKg;
    let idx = 0;
    for (let i = 0; i < th.length; i++) if (ratio >= th[i]) idx = i + 1;
    const lower = idx === 0 ? 0 : th[idx - 1];
    const upper = idx < th.length ? th[idx] : null;
    const pctToNext = upper != null ? Math.max(0, Math.min(100, Math.round(((ratio - lower) / (upper - lower)) * 100))) : 100;
    return {
      tier: STRENGTH_TIERS[idx], tierIndex: idx, color: STRENGTH_TIER_COLORS[idx], ratio,
      nextTier: idx < 4 ? STRENGTH_TIERS[idx + 1] : null,
      pctToNext, nextAt: upper != null ? Math.round(upper * bwKg) : null,
      // The band the thresholds were graded to, or null when they were not.
      // Every screen that prints the tier has to print this alongside it: the
      // adjustment is defensible, "Advanced" on its own when it means "advanced
      // for seventy" is not. Sex needs no such note because sex-specific
      // standards are what everybody already assumes a tier to be; age-graded
      // ones are not, and an unlabelled one would quietly flatter people.
      ageBand: band ? band.label : null
    };
  }

  // ============ Compute PRs for an exercise ============
  async function getPRsFor(exerciseId) {
    const history = await getHistoryFor(exerciseId);
    let maxWeight = 0, maxE1RM = 0, maxReps = 0, maxVolume = 0;
    let maxDuration = 0, maxDistance = 0, maxKcal = 0;
    let maxValue = 0, minValue = 0, maxSeconds = 0, totalHoldSec = 0;
    let maxWeightDate = null, maxE1RMDate = null;
    // Warm-ups never reach this loop: getHistoryFor drops them at the door,
    // so a done ramp set cannot raise maxWeight/maxSeconds and deny the next
    // genuine lift its record. tests/warmup-sets.js pins that behaviour.
    for (const h of history) {
      for (const s of h.sets) {
        if (s.seconds != null && s.seconds !== "") {
          const sec = Number(s.seconds);
          if (Number.isFinite(sec) && sec > 0) {
            if (sec > maxSeconds) maxSeconds = sec;
            totalHoldSec += sec;
          }
          continue;
        }
        if (s.value != null && s.value !== "") {
          const v = Number(s.value);
          if (Number.isFinite(v)) {
            if (v > maxValue) maxValue = v;
            if (v > 0 && (minValue === 0 || v < minValue)) minValue = v;
          }
          continue;
        }
        if (s.durationMin) {
          if (s.durationMin > maxDuration) maxDuration = s.durationMin;
          if ((s.distanceKm || 0) > maxDistance) maxDistance = s.distanceKm || 0;
          if ((s.kcal || 0) > maxKcal) maxKcal = s.kcal || 0;
          continue;
        }
        if ((s.weight || 0) > maxWeight) {
          maxWeight = s.weight || 0;
          maxWeightDate = h.date;
        }
        if (s.weight && s.reps) {
          const e = U.epley(s.weight, s.reps);
          if (e > maxE1RM) {
            maxE1RM = e;
            maxE1RMDate = h.date;
          }
        }
        if ((s.reps || 0) > maxReps) maxReps = s.reps || 0;
      }
      const v = U.volume(h.sets);
      if (v > maxVolume) maxVolume = v;
    }
    return {
      maxWeight, maxE1RM, maxReps, maxVolume,
      maxDuration, maxDistance, maxKcal,
      maxValue, minValue, maxSeconds, totalHoldSec,
      maxWeightDate, maxE1RMDate
    };
  }

  /**
   * One-pass board of personal records across all exercises.
   * Strength: max load, e1RM, reps, session count, last trained.
   * Cardio: max duration / distance.
   */
  async function computeExerciseRecords() {
    const [workouts, allExercises] = await Promise.all([
      Storage.getWorkouts(),
      getAllExercises()
    ]);
    const exerciseById = new Map(allExercises.map(e => [e.id, e]));
    const map = new Map();

    const ensure = (id, name, type) => {
      let r = map.get(id);
      if (!r) {
        r = {
          exerciseId: id,
          name: name || "Exercise",
          type: type || "strength",
          category: exerciseById.get(id)?.category || null,
          maxWeight: 0,
          maxWeightDate: null,
          maxWeightReps: 0,
          maxE1RM: 0,
          maxE1RMDate: null,
          bestWeight: 0,
          bestReps: 0,
          maxReps: 0,
          maxVolume: 0,
          maxDuration: 0,
          maxDistance: 0,
          maxKcal: 0,
          maxValue: 0,
          minValue: 0,
          metric: null,
          sessionCount: 0,
          lastTrained: null,
          isCardio: type === "cardio",
          isCustom: type === "custom"
        };
        map.set(id, r);
      }
      return r;
    };

    const completed = workouts.filter(w => w.completedAt);
    for (const w of completed) {
      for (const ex of (w.exercises || [])) {
        const isCardio = ex.type === "cardio";
        const isCustom = ex.type === "custom";
        const doneSets = (ex.sets || []).filter(s => {
          if (!s.done || U.isWarmup(s)) return false;
          if (isCustom || s.value != null) return s.value != null && s.value !== "";
          if (isCardio || s.durationMin != null) return !!s.durationMin;
          return s.reps != null && s.reps > 0;
        });
        if (!doneSets.length) continue;

        const r = ensure(ex.exerciseId, ex.name, ex.type);
        r.sessionCount += 1;
        if (!r.lastTrained || w.date > r.lastTrained) r.lastTrained = w.date;
        if (exerciseById.get(ex.exerciseId)?.name) r.name = exerciseById.get(ex.exerciseId).name;

        if (isCustom) {
          r.isCustom = true;
          r.metric = normalizeMetric(ex.metric || exerciseById.get(ex.exerciseId)?.metric);
          for (const s of doneSets) {
            const v = Number(s.value);
            if (!Number.isFinite(v)) continue;
            if (v > r.maxValue) r.maxValue = v;
            if (v > 0 && (r.minValue === 0 || v < r.minValue)) r.minValue = v;
          }
          continue;
        }

        if (isCardio) {
          r.isCardio = true;
          for (const s of doneSets) {
            if ((s.durationMin || 0) > r.maxDuration) r.maxDuration = s.durationMin || 0;
            if ((s.distanceKm || 0) > r.maxDistance) r.maxDistance = s.distanceKm || 0;
            if ((s.kcal || 0) > r.maxKcal) r.maxKcal = s.kcal || 0;
          }
          continue;
        }

        for (const s of doneSets) {
          const wgt = Number(s.weight) || 0;
          const reps = Number(s.reps) || 0;
          if (wgt > r.maxWeight) {
            r.maxWeight = wgt;
            r.maxWeightDate = w.date;
            r.maxWeightReps = reps;
          }
          if (reps > r.maxReps) r.maxReps = reps;
          if (wgt > 0 && reps > 0) {
            const e1 = U.epley(wgt, reps);
            if (e1 > r.maxE1RM) {
              r.maxE1RM = e1;
              r.maxE1RMDate = w.date;
              r.bestWeight = wgt;
              r.bestReps = reps;
            }
          }
        }
        const vol = U.volume(doneSets);
        if (vol > r.maxVolume) r.maxVolume = vol;
      }
    }

    const list = [...map.values()];
    list.sort((a, b) => {
      // Prefer heavier max loads, then e1RM, then name
      if ((b.maxWeight || 0) !== (a.maxWeight || 0)) return (b.maxWeight || 0) - (a.maxWeight || 0);
      if ((b.maxE1RM || 0) !== (a.maxE1RM || 0)) return (b.maxE1RM || 0) - (a.maxE1RM || 0);
      return (a.name || "").localeCompare(b.name || "");
    });
    return list;
  }

  /** Highlight main lifts for the hero PR strip (deadlift, squat, bench, OHP…). */
  function pickHeroRecords(records, limit = 2) {
    const strength = records.filter(r => !r.isCardio && r.maxWeight > 0);
    if (!strength.length) return [];
    const priority = [
      /deadlift/i, /bench/i, /squat/i, /overhead|ohp|military press|shoulder press/i,
      /row/i, /pull.?up/i, /rdl|romanian/i
    ];
    const picked = [];
    const used = new Set();
    for (const re of priority) {
      const hit = strength.find(r => re.test(r.name) && !used.has(r.exerciseId));
      if (hit) {
        picked.push(hit);
        used.add(hit.exerciseId);
      }
      if (picked.length >= limit) return picked;
    }
    for (const r of strength) {
      if (used.has(r.exerciseId)) continue;
      picked.push(r);
      used.add(r.exerciseId);
      if (picked.length >= limit) break;
    }
    return picked;
  }

  function weekBoundsISO(ref = new Date()) {
    // Monday-start week in local time
    const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
    const day = d.getDay(); // 0 Sun
    const diffToMon = day === 0 ? -6 : 1 - day;
    const mon = new Date(d);
    mon.setDate(d.getDate() + diffToMon);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    const iso = (x) => {
      const y = x.getFullYear();
      const m = String(x.getMonth() + 1).padStart(2, "0");
      const dd = String(x.getDate()).padStart(2, "0");
      return `${y}-${m}-${dd}`;
    };
    return { start: iso(mon), end: iso(sun) };
  }

  // Latest logged bodyweight (kg), or default for calorie estimates.
  async function getBodyweightKg() {
    const list = await Storage.getBodyweights();
    if (!list || !list.length) return U.DEFAULT_BW_KG;
    const sorted = list.slice().sort((a, b) => a.date.localeCompare(b.date));
    const latest = sorted[sorted.length - 1];
    return (latest && latest.kg > 0) ? latest.kg : U.DEFAULT_BW_KG;
  }

  // Whether the user has logged a real bodyweight (vs the 75kg default).
  // Used to separate personal targets from starter estimates.
  async function hasLoggedBodyweight() {
    const list = await Storage.getBodyweights();
    return !!(list && list.some(b => b.kg > 0));
  }

  async function loadPrefs() {
    // Push the unit system into U before anything reads it. Doing it here
    // rather than at the two call sites means an import cannot leave the app
    // rendering pounds against a restored metric profile.
    const units = await Storage.getPref("units", U.DEFAULT_UNITS);
    U.setUnits(units);
    return {
      units,
      profileName: await Storage.getPref("profileName", ""),
      kcalGoal: await Storage.getPref("kcalGoal", 2200),
      // auto = Mifflin/TDEE budget; manual = user override
      kcalGoalMode: await Storage.getPref("kcalGoalMode", "auto"),
      sex: await Storage.getPref("sex", null),
      age: await Storage.getPref("age", null),
      // Date of birth (yyyy-mm-dd). Preferred over `age`, which stays for
      // profiles created before DOB existed.
      dob: await Storage.getPref("dob", null),
      // Which figure the body map draws ("male" | "female"); defaults to sex.
      bodyMapSex: await Storage.getPref("bodyMapSex", null),
      // Set the first time the hold menu is opened. Only controls whether the
      // quick sheet still teaches the shortcut. This list is explicit, so a
      // pref written but not read here is written to nowhere the app can see.
      radialDiscovered: !!(await Storage.getPref("radialDiscovered", false)),
      heightCm: await Storage.getPref("heightCm", null),
      // Lifestyle / NEAT only — training burn optional (default off for real-world accuracy)
      activityLevel: await Storage.getPref("activityLevel", "light"),
      goalIntent: await Storage.getPref("goalIntent", U.DEFAULT_GOAL_INTENT),
      kcalOffset: await Storage.getPref("kcalOffset", U.DEFAULT_KCAL_OFFSET),
      // When false (default): show training estimate but do not raise food room
      includeTrainingInFoodRoom: !!(await Storage.getPref("includeTrainingInFoodRoom", false)),
      // Macro goals: auto from bodyweight + kcal budget, or full manual P/C/F
      macroGoalMode: await Storage.getPref("macroGoalMode", "auto"),
      // null means "never chosen", which is what lets the goal drive it —
      // see U.resolveProteinPerKg. Defaulting this to 1.8 would make every
      // user look like someone who had deliberately picked 1.8.
      proteinPerKg: await Storage.getPref("proteinPerKg", null),
      fatPercent: await Storage.getPref("fatPercent", U.DEFAULT_FAT_PERCENT),
      proteinGoal: await Storage.getPref("proteinGoal", 0),
      carbsGoal: await Storage.getPref("carbsGoal", 0),
      fatGoal: await Storage.getPref("fatGoal", 0),
      weeklyWorkoutGoal: await Storage.getPref("weeklyWorkoutGoal", 4),
      defaultRestSec: await Storage.getPref("defaultRestSec", 90),
      // Per-exercise rest targets ({exerciseId: seconds}). The 3-minute squat
      // rest and the 45-second curl rest were the same number before this.
      restTargets: (await Storage.getPref("restTargets", null)) || {},
      // Log strength sets through the big one-tap runner rather than the row
      // of small inputs. Default on; the classic list is always one tap away
      // and stays the way to edit anything already logged.
      guidedSets: (await Storage.getPref("guidedSets", true)) !== false,
      // Equipment the user actually has. Empty = not set, so nothing is hidden.
      myKit: (await Storage.getPref("myKit", null)) || [],
      // Offline-first data safety: remind to export a backup every N logged workouts
      backupReminder: !!(await Storage.getPref("backupReminder", true)),
      // Count of completed workouts at the last export/dismiss, so the reminder
      // fires once per BACKUP_REMINDER_EVERY new workouts rather than repeatedly.
      lastBackupWorkoutCount: Number(await Storage.getPref("lastBackupWorkoutCount", 0)) || 0,
      // ISO timestamp of last successful export (null if never backed up).
      lastBackupAt: await Storage.getPref("lastBackupAt", null),
      // ISO timestamp: hide Home backup CTA until this time (snooze).
      backupSnoozedUntil: await Storage.getPref("backupSnoozedUntil", null),
      // First-run guided setup: once shown/finished/skipped we don't auto-open again.
      onboarded: !!(await Storage.getPref("onboarded", false)),
      // Weekly split/program: { mon: templateId | "rest", ... } (missing = open day).
      weeklyPlan: await Storage.getPref("weeklyPlan", {}),
      // Offer a guided warm-up before a session (dynamic prep + ramp sets).
      warmupPrompt: !!(await Storage.getPref("warmupPrompt", true)),
      // Meal reminder times: { breakfast: "08:00", ... } — only sections the user opted in.
      mealReminders: await Storage.getPref("mealReminders", {}),
      // Eating pattern chosen as a guideline, and its rule ({start,end} /
      // {days,cap}). Null = none, which is the default and stays the default:
      // the app never picks one for you.
      dietPlanId: await Storage.getPref("dietPlanId", null),
      dietPlanConfig: await Storage.getPref("dietPlanConfig", {}),
      // The one-line prompt on Nutrition, once dismissed, stays dismissed.
      dietPlanPromptSeen: !!(await Storage.getPref("dietPlanPromptSeen", false)),
      theme: await Storage.getPref("theme", null),
      // Accent colour — a separate axis from light/dark.
      accent: await Storage.getPref("accent", null)
    };
  }

  // Prompt a backup after this many newly logged workouts (offline data safety).
  const BACKUP_REMINDER_EVERY = 10;
  // Also surface a Home CTA when the last export is older than this many days.
  const BACKUP_STALE_DAYS = 7;

  /** Sum estimated workout burn for a calendar day (completed + active). */
  async function getWorkoutKcalForDate(isoDate) {
    const workouts = await Storage.getWorkouts();
    let total = 0;
    for (const w of workouts) {
      if (w.date !== isoDate) continue;
      if (w.kcalBurned != null) total += w.kcalBurned || 0;
      else total += workoutKcalTotal(w);
    }
    if (state.activeWorkout && state.activeWorkout.date === isoDate) {
      // Active workout may not be in the list yet or may be stale — prefer live total.
      const live = workoutKcalTotal(state.activeWorkout);
      const listed = workouts.find(w => w.id === state.activeWorkout.id);
      if (!listed) total += live;
      else {
        // Replace listed contribution with live if higher fidelity mid-session
        const listedKcal = listed.kcalBurned != null ? listed.kcalBurned : workoutKcalTotal(listed);
        total = total - listedKcal + live;
      }
    }
    return Math.max(0, Math.round(total));
  }

  /**
   * Hybrid goal resolver.
   * Auto: lifestyle TDEE + (optional) today's workout burn + goal intent + calibration offset.
   * Training burn is estimated from MET but excluded from food room by default.
   * Manual / incomplete profile: stored kcalGoal (default 2200).
   */
  async function resolveEnergyBudget(isoDate = U.todayISO()) {
    const weightKg = await getBodyweightKg();
    const workoutKcalActual = await getWorkoutKcalForDate(isoDate);
    const prefs = state.prefs || {};
    const includeTraining = !!prefs.includeTrainingInFoodRoom;
    const workoutKcalForBudget = includeTraining ? workoutKcalActual : 0;
    const goalIntent = U.normalizeGoalIntent(prefs.goalIntent);
    const kcalOffset = U.normalizeKcalOffset(prefs.kcalOffset);
    const calc = U.computeEnergyBudget({
      sex: prefs.sex,
      age: U.effectiveAge(prefs),
      heightCm: prefs.heightCm,
      activityLevel: prefs.activityLevel,
      weightKg,
      workoutKcal: workoutKcalForBudget,
      goalIntent,
      kcalOffset
    });
    const manualGoal = Math.max(0, parseInt(prefs.kcalGoal, 10) || 2200);
    const mode = prefs.kcalGoalMode === "manual" ? "manual" : "auto";
    const profileReady = U.profileComplete(prefs) && calc.complete;
    const bwLogged = await hasLoggedBodyweight();
    // Personal = built from this user's own details (profile + real bodyweight),
    // or an explicit manual target. Otherwise treat numbers as starter estimates.
    const isPersonal = mode === "manual" || (profileReady && bwLogged);

    let goal, source;
    if (mode === "manual") {
      goal = manualGoal;
      source = "manual";
    } else if (profileReady) {
      goal = calc.budget;
      source = "auto";
    } else {
      goal = manualGoal;
      source = "fallback";
    }

    return {
      date: isoDate,
      goal,
      source,
      mode,
      profileReady,
      bwLogged,
      isPersonal,
      weightKg,
      manualGoal,
      ...calc,
      // Keep true session estimate for display even when excluded from room
      workoutKcal: workoutKcalActual,
      workoutKcalCounted: workoutKcalForBudget,
      includeTrainingInFoodRoom: includeTraining,
      goalIntent,
      kcalOffset,
      // Ensure budget field reflects auto math even when source is manual
      autoBudget: calc.budget
    };
  }

  /** Effective daily kcal goal used across Home + Nutrition. */
  async function getEffectiveKcalGoal(isoDate = U.todayISO()) {
    const e = await resolveEnergyBudget(isoDate);
    return e.goal;
  }

  /**
   * Hybrid macro goals.
   * Auto: protein g/kg × bodyweight, fat % of kcal budget, carbs fill remainder.
   * Manual: stored proteinGoal / carbsGoal / fatGoal.
   */
  async function resolveMacroGoals(isoDate = U.todayISO(), energy = null) {
    const e = energy || await resolveEnergyBudget(isoDate);
    const prefs = state.prefs || {};
    const mode = prefs.macroGoalMode === "manual" ? "manual" : "auto";
    const weightKg = e.weightKg || await getBodyweightKg();
    const kcalBudget = e.goal || prefs.kcalGoal || 2200;
    // Protein follows the goal unless the user has set a figure themselves.
    const ppk = U.resolveProteinPerKg(prefs.proteinPerKg, e.goalIntent || prefs.goalIntent);
    const proteinPerKg = ppk.perKg;
    const fatPercent = Number(prefs.fatPercent) > 0 ? Number(prefs.fatPercent) : U.DEFAULT_FAT_PERCENT;

    const auto = U.computeMacroGoals({
      weightKg,
      kcalBudget,
      proteinPerKg,
      fatPercent
    });

    const manual = {
      protein: Math.max(0, Math.round(Number(prefs.proteinGoal) || 0)),
      carbs: Math.max(0, Math.round(Number(prefs.carbsGoal) || 0)),
      fat: Math.max(0, Math.round(Number(prefs.fatGoal) || 0))
    };
    const manualReady = manual.protein > 0 || manual.carbs > 0 || manual.fat > 0;

    let goals, source;
    if (mode === "manual" && manualReady) {
      goals = manual;
      source = "manual";
    } else if (auto.complete) {
      goals = { protein: auto.protein, carbs: auto.carbs, fat: auto.fat };
      source = mode === "manual" ? "auto-fallback" : "auto";
    } else {
      goals = manualReady ? manual : { protein: 0, carbs: 0, fat: 0 };
      source = manualReady ? "manual" : "none";
    }

    return {
      date: isoDate,
      mode,
      source,
      weightKg,
      kcalBudget,
      proteinPerKg,
      proteinFromGoal: ppk.fromGoal,
      goalIntent: e.goalIntent || U.normalizeGoalIntent(prefs.goalIntent),
      fatPercent,
      goals,
      auto,
      hasGoals: (goals.protein || goals.carbs || goals.fat) > 0
    };
  }

  function emptySetForType(type) {
    if (type === "cardio") {
      return {
        durationMin: null,
        intensity: "moderate",
        distanceKm: null,
        kcal: null,
        kcalManual: false,
        done: false
      };
    }
    if (type === "custom") {
      return { value: null, done: false };
    }
    if (type === "hold") {
      // Mobility: a timed hold in seconds (per side when the exercise says so).
      return { seconds: null, done: false };
    }
    if (type === "interval") {
      // Conditioning: one prescribed effort in seconds at a target intensity.
      return { seconds: null, intensity: "moderate", done: false };
    }
    return { weight: null, reps: null, done: false };
  }

  /** Normalise a custom-exercise metric descriptor to a safe shape. */
  function normalizeMetric(metric) {
    const m = metric || {};
    return {
      label: (m.label && String(m.label).trim()) || "Value",
      unit: m.unit != null ? String(m.unit).trim() : "",
      higherIsBetter: m.higherIsBetter !== false // default: more is better
    };
  }

  /** Clone logged (or planned) sets into a fresh session — values filled, none marked done. */
  function cloneSetsForReplay(sets, type) {
    const src = (sets || []).filter(s => {
      if (!s) return false;
      if (type === "custom" || s.value != null) return s.done || s.value != null;
      if (type === "hold" || type === "interval" || s.seconds != null) return s.done || s.seconds != null;
      if (type === "cardio" || s.durationMin != null) {
        return s.done || s.durationMin != null || s.distanceKm != null;
      }
      return s.done || s.weight != null || s.reps != null;
    });
    if (!src.length) return [emptySetForType(type)];
    if (type === "custom") {
      return src.map(s => ({ value: s.value ?? null, done: false }));
    }
    if (type === "hold") {
      return src.map(s => ({ seconds: s.seconds ?? null, done: false }));
    }
    if (type === "interval") {
      return src.map(s => ({ seconds: s.seconds ?? null, intensity: s.intensity || "moderate", label: s.label ?? null, done: false }));
    }
    if (type === "cardio") {
      return src.map(s => ({
        durationMin: s.durationMin ?? null,
        intensity: s.intensity || "moderate",
        distanceKm: s.distanceKm ?? null,
        kcal: s.kcal ?? null,
        kcalManual: !!(s.kcalManual || (s.kcal != null && s.kcal > 0)),
        done: false
      }));
    }
    return src.map(s => ({
      weight: s.weight ?? null,
      reps: s.reps ?? null,
      done: false,
      drop: !!s.drop,
      warmup: !!s.warmup
    }));
  }

  function formatPrevSetsSummary(sets, exType) {
    return (sets || []).map(s => {
      if (s.durationMin != null) {
        const dist = s.distanceKm ? ` · ${U.formatDistance(s.distanceKm)}` : "";
        return `${s.durationMin} min · ${U.intensityLabel(s.intensity)}${dist}`;
      }
      if (exType === "bodyweight" || ((!s.weight || s.weight === 0) && s.reps)) return `${s.reps} reps`;
      return `${U.trimNum(U.toDisplayWeight(s.weight))}×${s.reps}`;
    }).join(" · ");
  }

  /** Most recently completed workout (by completedAt, then date). */
  async function getLastCompletedWorkout() {
    const workouts = await Storage.getWorkouts();
    return workouts
      .filter(w => w.completedAt && (w.exercises || []).length)
      .sort((a, b) => {
        const ca = Number(a.completedAt) || 0;
        const cb = Number(b.completedAt) || 0;
        if (cb !== ca) return cb - ca;
        return String(b.date || "").localeCompare(String(a.date || ""));
      })[0] || null;
  }

  async function buildExercisesFromWorkout(source) {
    const all = await getAllExercises();
    return (source.exercises || []).map(ex => {
      const def = all.find(x => x.id === ex.exerciseId);
      let type = ex.type || (def ? inferExerciseType(def) : "weighted");
      if (type !== "cardio" && looksLikeCardio({ id: ex.exerciseId, name: ex.name || def?.name })) {
        type = "cardio";
      }
      return {
        exerciseId: ex.exerciseId,
        name: ex.name || def?.name || "Exercise",
        type,
        category: def?.category || ex.category,
        met: ex.met ?? def?.met,
        supersetGroup: ex.supersetGroup || null,
        sets: cloneSetsForReplay(ex.sets, type)
      };
    });
  }

  /** Select existing content when a number field gains focus so typing replaces it. */
  function selectOnFocus(input) {
    input.addEventListener("focus", () => {
      requestAnimationFrame(() => { try { input.select(); } catch (_) {} });
    });
  }

  /** Re-render current tab but keep scroll position (logging sets mid-session). */
  function renderMainKeepScroll() {
    const y = window.scrollY || 0;
    renderMain();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, y);
      });
    });
  }

  // Swap just one exercise card in place after a set change, instead of
  // rebuilding the whole screen. Keeps logging a set feeling instant — no
  // full-page flash, scroll jump, or card re-mount. Falls back to a full
  // re-render if the block isn't on screen (e.g. outside the active workout).
  async function refreshExerciseBlock(ex) {
    const w = state.activeWorkout;
    const idx = w && Array.isArray(w.exercises) ? w.exercises.indexOf(ex) : -1;
    if (idx < 0) { renderMainKeepScroll(); return; }
    const old = document.querySelector(`.exercise-block[data-ex-idx="${idx}"]`);
    if (!old) { renderMainKeepScroll(); return; }
    const fresh = await renderExerciseBlock(ex, idx);
    old.replaceWith(fresh);
  }

  // Celebrate a just-logged set: flash its row and pop the check (Tier B).
  function flashCompletedSet(ex, si) {
    if (reduceMotion()) return;
    const w = state.activeWorkout;
    const idx = w && Array.isArray(w.exercises) ? w.exercises.indexOf(ex) : -1;
    if (idx < 0) return;
    const block = document.querySelector(`.exercise-block[data-ex-idx="${idx}"]`);
    if (!block) return;
    // Only the editable set rows carry a Done button; ignore any history strip.
    const rows = [...block.querySelectorAll(".set-row")].filter(r => r.querySelector(".set-done"));
    const row = rows[si];
    if (!row) return;
    row.classList.add("set-row-flash");
    const btn = row.querySelector(".set-done");
    if (btn) btn.classList.add("set-check-pop");
  }

  async function buildExerciseEntry(exerciseId, name) {
    const all = await getAllExercises();
    const def = all.find(x => x.id === exerciseId);
    // Prefer definition classification; fall back to name when the id is missing.
    let type = def ? inferExerciseType(def) : "weighted";
    if (type !== "cardio" && type !== "custom" && looksLikeCardio({ id: exerciseId, name: name || def?.name })) {
      type = "cardio";
    }
    // Start with a single empty set. Matching last session's sets is
    // optional — the "Use last" button on the exercise card copies them.
    const sets = [emptySetForType(type)];
    return {
      exerciseId,
      name: name || def?.name || "Exercise",
      type,
      category: def?.category,
      met: def?.met,
      ...(def?.metric ? { metric: def.metric } : {}),
      ...(def?.perSide ? { perSide: true } : {}),
      sets
    };
  }

  function exerciseKcalTotal(ex) {
    return U.setsKcal(ex?.sets || []);
  }

  function workoutKcalTotal(w) {
    return (w?.exercises || []).reduce((s, ex) => s + exerciseKcalTotal(ex), 0);
  }

  // ============ Sparkline SVG helper ============
  // values: array of numbers (may include nulls to represent missing days).
  // returns an SVG element sized to width x height.
  function sparkline(values, opts = {}) {
    const w = opts.width || 240;
    const h = opts.height || 48;
    const pad = 4;
    const stroke = opts.stroke || "var(--accent)";
    const fill = opts.fill || "color-mix(in srgb, var(--accent) 12%, transparent)";
    const goalLine = opts.goal;
    const nums = values.filter(v => typeof v === "number" && !isNaN(v));
    // Empty state: return plain HTML so text doesn't get stretched by SVG scaling.
    if (nums.length === 0) {
      const empty = document.createElement("div");
      empty.className = "sparkline-empty";
      empty.style.height = h + "px";
      empty.textContent = "No data yet";
      return empty;
    }
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    // Keep the intrinsic height fixed regardless of container width so the chart
    // doesn't balloon on wide desktop screens.
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", h);
    svg.style.height = h + "px";
    svg.setAttribute("class", "sparkline");
    let min = Math.min(...nums);
    let max = Math.max(...nums);
    if (goalLine != null) { min = Math.min(min, goalLine); max = Math.max(max, goalLine); }
    if (max === min) { max = min + 1; }
    const xStep = values.length > 1 ? (w - pad * 2) / (values.length - 1) : 0;
    const yFor = (v) => h - pad - ((v - min) / (max - min)) * (h - pad * 2);
    // Build path, skipping null gaps.
    let d = "", areaTop = "", started = false;
    for (let i = 0; i < values.length; i++) {
      const v = values[i];
      if (v == null || isNaN(v)) { started = false; continue; }
      const x = pad + i * xStep;
      const y = yFor(v);
      if (!started) { d += `M ${x.toFixed(1)} ${y.toFixed(1)} `; areaTop += `M ${x.toFixed(1)} ${(h - pad).toFixed(1)} L ${x.toFixed(1)} ${y.toFixed(1)} `; started = true; }
      else { d += `L ${x.toFixed(1)} ${y.toFixed(1)} `; areaTop += `L ${x.toFixed(1)} ${y.toFixed(1)} `; }
    }
    // Close area to baseline
    if (nums.length > 0) {
      const lastIdx = values.map((v, i) => v == null ? -1 : i).filter(i => i >= 0).pop();
      const lastX = pad + lastIdx * xStep;
      areaTop += `L ${lastX.toFixed(1)} ${(h - pad).toFixed(1)} Z`;
    }
    if (opts.fill !== false) {
      const area = document.createElementNS("http://www.w3.org/2000/svg", "path");
      area.setAttribute("d", areaTop);
      area.setAttribute("fill", fill);
      area.setAttribute("stroke", "none");
      svg.appendChild(area);
    }
    // Goal line
    if (goalLine != null) {
      const gy = yFor(goalLine);
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", pad); line.setAttribute("x2", w - pad);
      line.setAttribute("y1", gy); line.setAttribute("y2", gy);
      line.setAttribute("stroke", "var(--text-faint)");
      line.setAttribute("stroke-dasharray", "3 3");
      line.setAttribute("stroke-width", "1");
      svg.appendChild(line);
    }
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", stroke);
    path.setAttribute("stroke-width", "1.75");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    svg.appendChild(path);
    // Last point dot
    const lastIdx = values.map((v, i) => v == null ? -1 : i).filter(i => i >= 0).pop();
    if (lastIdx != null && lastIdx >= 0) {
      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("cx", pad + lastIdx * xStep);
      dot.setAttribute("cy", yFor(values[lastIdx]));
      dot.setAttribute("r", "2.5");
      dot.setAttribute("fill", stroke);
      svg.appendChild(dot);
    }
    return svg;
  }

  // ============ Plate calculator ============
  // Given a target weight and bar weight, returns the smallest plate set (per side).
  // Everything here is kilograms; the plate denominations themselves come from
  // U.plateSet(), which returns the real imperial rack (45/35/25/10/5/2.5 lb
  // expressed in kg) rather than converted metric discs. A gym does not have a
  // 20 kg plate labelled 44.09 lb.
  function computePlates(target, barKg = 20) {
    if (target == null || isNaN(target) || target <= barKg) return { perSide: [], leftover: 0, barKg };
    const perSideKg = (target - barKg) / 2;
    const plates = U.plateSet();
    const result = [];
    let remaining = perSideKg;
    for (const p of plates) {
      const count = Math.floor(remaining / p);
      if (count > 0) {
        result.push({ kg: p, count });
        remaining -= count * p;
      }
    }
    return { perSide: result, leftover: Math.round(remaining * 100) / 100, barKg };
  }

  function openPlateCalculator(initialWeight) {
    // target and bar are kilograms throughout; only the input and the labels
    // are in display units.
    let target = initialWeight || 60;
    let bar = 20;

    const body = el("div", {});
    const targetI = el("input", { type: "number", step: "0.5", inputmode: "decimal", class: "input input-num",
      value: U.trimNum(U.toDisplayWeight(target)) });
    const barS = el("select", { class: "select" },
      ...U.barOptions().map(o => el("option", { value: String(o.kg) }, o.label)),
      el("option", { value: "0" }, "No bar (dumbbell)")
    );
    bar = U.barOptions()[0].kg;
    barS.value = String(bar);

    const output = el("div", { class: "plate-output" });
    // Plates are drawn with their real printed number — a 45 lb disc says 45,
    // not 20.41 — so the label is the display value, while data-kg keeps the
    // stored figure the CSS sizes itself from.
    const plateLabel = (kg) => U.trimNum(U.toDisplayWeight(kg));
    function refresh() {
      target = U.fromDisplayWeight(targetI.value) || 0;
      bar = parseFloat(barS.value);
      clear(output);
      const { perSide, leftover } = computePlates(target, bar);
      if (target <= bar) {
        output.appendChild(el("div", { class: "text-muted text-sm" },
          target === bar ? "Just the bar." : `Target is below bar weight (${U.formatWeight(bar, { space: false })}).`));
        return;
      }
      const perSideKg = (target - bar) / 2;
      output.appendChild(el("div", { class: "text-sm text-muted", style: "margin-bottom: 8px" },
        `Per side: ${U.formatWeight(perSideKg, { space: false })} · total plates: ${U.formatWeight(perSideKg * 2, { space: false })} + ${U.formatWeight(bar, { space: false })} bar`));
      const plateRow = el("div", { class: "plate-row" });
      for (const { kg, count } of perSide) {
        for (let i = 0; i < count; i++) {
          plateRow.appendChild(el("div", { class: "plate", "data-kg": String(kg) }, plateLabel(kg)));
        }
      }
      // Bar visual
      const barVis = el("div", { class: "bar-visual" },
        el("div", { class: "bar-side" }, plateRow),
        el("div", { class: "bar-bar" }),
        el("div", { class: "bar-side mirror" }, (() => {
          const r = el("div", { class: "plate-row" });
          for (const { kg, count } of [...perSide].reverse()) {
            for (let i = 0; i < count; i++) {
              r.appendChild(el("div", { class: "plate", "data-kg": String(kg) }, plateLabel(kg)));
            }
          }
          return r;
        })())
      );
      output.appendChild(barVis);
      // Breakdown text
      if (perSide.length) {
        output.appendChild(el("div", { class: "text-sm mt-8" },
          "Per side: " + perSide.map(p => `${p.count}×${plateLabel(p.kg)}${U.weightUnit()}`).join(" + ")
        ));
      }
      if (leftover > 0.01) {
        output.appendChild(el("div", { class: "text-sm text-muted mt-8" },
          `Can’t make exact with these plates. Short by ${U.formatWeight(leftover, { space: false })} per side.`));
      }
    }

    body.appendChild(el("div", { class: "form-row" },
      el("div", { style: "flex:2" }, el("label", { class: "label" }, "Target weight (kg)"), targetI),
      el("div", { style: "flex:1" }, el("label", { class: "label" }, "Bar"), wheelizeSelect(barS, { title: "Bar weight" }))
    ));
    body.appendChild(output);

    targetI.addEventListener("input", refresh);
    barS.addEventListener("change", refresh);
    refresh();
    openModal("Plate calculator", body, el("div", {},
      el("button", { class: "btn", on: { click: closeModal } }, "Close")
    ));
    setTimeout(() => targetI.focus(), 40);
  }

  // ============ Determine exercise "type" (weighted / bodyweight / weighted+bw / cardio) ============
  // Built-in cardio ids from the exercise database.
  const CARDIO_IDS = new Set(["run", "rowing", "cycling", "jump-rope"]);
  // Cardio exercises that are not distance-based (e.g. jump rope) hide the km field.
  const NO_DISTANCE_CARDIO_IDS = new Set(["jump-rope"]);
  // Categories logged by time rather than by sets and reps. Boxing rounds are
  // minutes on the bag or the pads — nobody counts punches — so these log the
  // same way cardio does, and none of them cover ground.
  const DURATION_CATEGORIES = new Set(["cardio", "boxing"]);
  const NO_DISTANCE_CATEGORIES = new Set(["boxing"]);
  // Anything trained in repeated timed bouts rather than one block of minutes
  // gets a builder on its card, writing the same interval plan the preset
  // sessions use — so the guided timer, the cues and the per-bout logging all
  // come from machinery that already exists.
  //
  // Two vocabularies over identical mechanics. Nobody does "rounds" on a
  // rowing erg and nobody does "intervals" on a heavy bag; the noun is the
  // only difference, and getting it wrong makes the feature read as though it
  // was built for a different sport.
  const ROUND_VOCAB = {
    rounds: {
      key: "rounds", noun: "rounds", one: "Round", rest: "Corner",
      defaults: { rounds: 3, workSec: 180, restSec: 60 },
      opts: { rounds: [3, 5, 6, 9, 12], workSec: [60, 90, 120, 180], restSec: [0, 30, 60] }
    },
    intervals: {
      key: "intervals", noun: "intervals", one: "Interval", rest: "Recover",
      // 30/30 — what the preset library already calls a solid first taste of
      // interval work, and a far gentler default than a 4-minute effort.
      defaults: { rounds: 8, workSec: 30, restSec: 30 },
      opts: { rounds: [4, 6, 8, 10, 12], workSec: [30, 60, 120, 240], restSec: [0, 30, 60, 180] }
    }
  };
  const ROUND_CATEGORIES = new Set(["boxing"]);
  // Jump rope is filed under cardio but is trained in rounds like boxing, so
  // it is named rather than inferred.
  const ROUND_ID_VOCAB = { "jump-rope": "rounds" };

  /** Which vocabulary this exercise speaks, or null if it has no bouts. */
  function roundVocab(def, ex) {
    const id = (def && def.id) || (ex && ex.exerciseId);
    if (id && ROUND_ID_VOCAB[id]) return ROUND_VOCAB[ROUND_ID_VOCAB[id]];
    const cat = (def && def.category) || (ex && ex.category);
    if (ROUND_CATEGORIES.has(cat)) return ROUND_VOCAB.rounds;
    if (DURATION_CATEGORIES.has(cat)) return ROUND_VOCAB.intervals;
    return null;
  }
  /** Whether to offer the builder on this exercise. */
  function supportsRounds(def, ex) { return !!roundVocab(def, ex); }

  /** Turn a bout count into the interval plan the runner already understands. */
  function roundPlanSteps({ rounds, workSec, restSec }, vocab) {
    const v = vocab || ROUND_VOCAB.rounds;
    const steps = [];
    for (let i = 0; i < rounds; i++) {
      steps.push({ sec: workSec, intensity: "hard", label: `${v.one} ${i + 1}`, work: true });
      // No trailing rest — the session is over, there is nothing to recover for.
      if (restSec > 0 && i < rounds - 1) {
        steps.push({ sec: restSec, intensity: "easy", label: v.rest, work: false });
      }
    }
    return steps;
  }

  function applyRoundPlan(ex, spec, vocab) {
    const steps = roundPlanSteps(spec, vocab);
    ex.type = "interval";
    ex.plan = { steps };
    ex.rounds = { ...spec, vocab: (vocab || ROUND_VOCAB.rounds).key };
    ex.sets = steps.filter(s => s.work).map(s => ({
      seconds: s.sec, intensity: s.intensity, label: s.label, done: false
    }));
    delete ex.run;
  }

  /** Back to a single minutes box. Anything already served is rolled into it
      rather than dropped — the rounds happened, whatever the row looks like. */
  function revertToDuration(ex) {
    const servedSec = (ex.sets || [])
      .filter(s => s.done)
      .reduce((n, s) => n + (s.seconds || 0), 0);
    const mins = servedSec > 0 ? Math.max(1, Math.round(servedSec / 60)) : null;
    ex.type = "cardio";
    delete ex.plan;
    delete ex.run;
    delete ex.rounds;
    ex.sets = [{ durationMin: mins, intensity: "moderate", distanceKm: null, done: mins != null }];
    return mins;
  }

  /** Rounds sheet: how many, how long, how long between. Defaults to 3 × 3:00
      with a minute in the corner, which is what a boxing gym runs. */
  function openRoundBuilder(ex, opts = {}) {
    const V = opts.vocab || roundVocab(null, ex) || ROUND_VOCAB.rounds;
    const D = V.defaults;
    const OPTS = V.opts;
    const spec = {
      rounds: (ex.rounds && ex.rounds.rounds) || D.rounds,
      workSec: (ex.rounds && ex.rounds.workSec) || D.workSec,
      restSec: (ex.rounds && ex.rounds.restSec) != null ? ex.rounds.restSec : D.restSec
    };
    const secLabel = (s) => s === 0 ? "None" : U.formatTime(s);
    const summary = el("div", { class: "rb-summary", "data-testid": "rb-summary" });
    const rows = [];

    function paint() {
      for (const r of rows) {
        for (const b of Array.from(r.el.children)) {
          const on = String(spec[r.key]) === b.getAttribute("data-val");
          b.classList.toggle("active", on);
          b.setAttribute("aria-pressed", on ? "true" : "false");
        }
      }
      const total = spec.rounds * spec.workSec + Math.max(0, spec.rounds - 1) * spec.restSec;
      clear(summary);
      summary.appendChild(el("div", { class: "rb-summary-main" },
        `${spec.rounds} × ${U.formatTime(spec.workSec)}`));
      summary.appendChild(el("div", { class: "rb-summary-sub" },
        (spec.restSec ? `${U.formatTime(spec.restSec)} between · ` : "straight through · ") +
        `${Math.round(total / 60)} min total`));
    }

    function row(key, label, values, fmt) {
      const chips = el("div", { class: "rb-chips", "data-testid": `rb-${key}` });
      for (const v of values) {
        chips.appendChild(el("button", {
          class: "xpick-chip rb-chip", type: "button", "data-val": String(v),
          "aria-pressed": "false",
          on: { click: () => { spec[key] = v; paint(); } }
        }, fmt(v)));
      }
      rows.push({ key, el: chips });
      return el("div", { class: "rb-row" }, el("div", { class: "rb-label" }, label), chips);
    }

    const Noun = V.noun.charAt(0).toUpperCase() + V.noun.slice(1);
    const body = el("div", { class: "rb" },
      summary,
      row("rounds", Noun, OPTS.rounds, String),
      row("workSec", `${V.one} length`, OPTS.workSec, U.formatTime),
      row("restSec", `Between ${V.noun}`, OPTS.restSec, secLabel)
    );
    paint();

    const footer = el("div", {},
      el("button", { class: "btn", on: { click: closeModal } }, "Cancel"),
      // The type chip cannot switch an interval exercise back, so this sheet
      // has to carry the way out. Without it, choosing rounds once would be a
      // one-way door.
      ex.type === "interval" ? el("button", {
        class: "btn", "data-testid": "rb-plain",
        on: { click: async () => {
          const mins = revertToDuration(ex);
          await Storage.saveWorkout(state.activeWorkout);
          closeModal();
          refreshExerciseBlock(ex);
          toast(mins ? `Back to minutes — kept ${mins} min` : "Back to logging minutes");
        } }
      }, "Just log minutes") : null,
      el("button", {
        class: "btn btn-primary", "data-testid": "rb-start",
        on: { click: async () => {
          const anyLogged = (ex.sets || []).some(s => s.done);
          if (anyLogged && !(await confirmDialog(
            "This replaces what is already logged for this exercise.",
            { title: `Set up ${V.noun}?`, okLabel: "Replace" }))) return;
          applyRoundPlan(ex, spec, V);
          await Storage.saveWorkout(state.activeWorkout);
          closeModal();
          await refreshExerciseBlock(ex);
          if (opts.thenRun !== false) openIntervalRunner(ex);
        } }
      }, `${ex.type === "interval" ? "Update" : "Set up"} ${V.noun}`)
    );
    openModal(ex.name || Noun, body, footer);
  }

  /** Whether a cardio exercise should show/track a distance (km) field. */
  function cardioTracksDistance(ex) {
    if (!ex) return true;
    if (NO_DISTANCE_CATEGORIES.has(ex.category)) return false;
    const id = String(ex.exerciseId || ex.id || "").toLowerCase();
    if (NO_DISTANCE_CARDIO_IDS.has(id)) return false;
    const name = String(ex.name || "").toLowerCase();
    if (/\b(jump\s*rope|skip(ping|s)?)\b/.test(name)) return false;
    return true;
  }

  function looksLikeCardio(ex) {
    if (!ex) return false;
    if (DURATION_CATEGORIES.has(ex.category)) return true;
    if (ex.type === "cardio") return true;
    const id = String(ex.id || ex.exerciseId || "").toLowerCase();
    if (CARDIO_IDS.has(id)) return true;
    const name = String(ex.name || "").toLowerCase();
    // NB: match "rowing"/"erg" but NOT bare "row" — the latter also appears in
    // strength moves (bent-over row, cable row, upright row, …) which are not cardio.
    return /\b(run|running|rowing|rower|cycle|cycling|bike|erg|ergometer|jump\s*rope|treadmill|cardio|elliptical|assault\s*bike)\b/.test(name);
  }

  function inferExerciseType(ex) {
    // An explicit custom-metric exercise always logs with its own metric.
    if (ex && ex.type === "custom") return "custom";
    // Mobility work is a timed hold, never sets×reps — classify before cardio so
    // a stretch is never mistaken for a duration-based cardio interval.
    if (ex && (ex.type === "hold" || ex.category === "mobility")) return "hold";
    // Interval protocols keep their own step plan and log in seconds.
    if (ex && ex.type === "interval") return "interval";
    // Cardio classification always wins over a stale stored type so Running never
    // falls back to kg/reps just because an older session saved type: "weighted".
    if (looksLikeCardio(ex)) return "cardio";
    if (ex && ex.type) return ex.type;
    const equipment = (ex?.equipment || "").toLowerCase();
    const name = (ex?.name || "").toLowerCase();
    const id = String(ex?.id || ex?.exerciseId || "").toLowerCase();
    const hay = `${name} ${id} ${equipment}`;

    // Dip bars / pull-up bar / pure bodyweight calisthenics
    const isBwEquip =
      equipment.includes("bodyweight") ||
      equipment.includes("pull-up bar") ||
      equipment.includes("dip bars") ||
      equipment === "none / treadmill";
    const isLoadableBw = /(pull-?up|chin-?up|\bdip\b|dips)/.test(hay);
    const isPureBw =
      /(push-?up|plank|dead.?bug|hollow|nordic|burpee|rollout|ab wheel)/.test(hay) ||
      (isBwEquip && !isLoadableBw);
    // A bodyweight-capable move whose name calls out a load implement
    // (e.g. "Dumbbell Step-Up") should default to BW +kg so the added weight
    // gets logged, rather than reps-only bodyweight.
    const nameNamesLoad = /\b(dumbbell|barbell|kettlebell)\b/.test(name);

    // Loadable calisthenics (pull-ups / chin-ups / dips) default to plain
    // Bodyweight — most sets are done unweighted. The "BW +kg" mode is still
    // available from the type dropdown for anyone using a belt or vest.
    if (isLoadableBw) return "bodyweight";
    if (isBwEquip && nameNamesLoad) return "weighted_bodyweight";
    if (isPureBw || (isBwEquip && !/barbell|dumbbell|machine|cable|kettlebell/.test(equipment))) {
      return "bodyweight";
    }
    return "weighted";
  }

  /** Free-barbell plate math only — stack machines and dumbbells do not use a 20 kg bar. */
  function supportsPlateCalculator(def, ex = null) {
    const source = def || ex || {};
    const equipment = String(source.equipment || ex?.equipment || "").toLowerCase();
    const name = String(source.name || ex?.name || "").toLowerCase();
    const id = String(source.id || ex?.exerciseId || "").toLowerCase();
    const hay = `${equipment} ${name} ${id}`;

    // Explicit non-barbell load types
    if (/\bcable\b/.test(equipment)) return false;
    if (/\bmachine\b/.test(equipment) && !/barbell|smith/.test(equipment)) return false;
    if (/dumbbell/.test(equipment) && !/barbell/.test(equipment)) return false;
    if (/kettlebell/.test(equipment) && !/barbell/.test(equipment)) return false;
    if (/bodyweight|pull-up bar|dip bars|jump rope|rowing|bike|none \//.test(equipment) && !/barbell/.test(equipment)) {
      return false;
    }
    if (/machine (chest|shoulder|leg)|leg press|hack squat|leg extension|leg curl|pec deck|lat pulldown|cable|dumbbell|kettlebell/.test(hay)
        && !/barbell/.test(hay)) {
      return false;
    }

    // Free barbell / EZ / landmine / T-bar / smith (plates on a bar)
    if (/barbell|ez-bar|t-bar|landmine|smith/.test(equipment)) return true;
    if (/barbell|deadlift|back squat|front squat|hip thrust|power clean|snatch|overhead press|ohp|romanian|bench press|skull crusher|shrug|bent-over row|thruster|clean and press/.test(hay)) {
      // Exclude machine / dumbbell variants of those names
      if (/machine|dumbbell|cable/.test(name) && !/barbell/.test(name)) return false;
      return true;
    }
    return false;
  }

  /** Logging modes that make sense for an exercise. Cardio moves only log time/distance;
      barbell/dumbbell/machine lifts only log kg; calisthenics get BW and BW +kg. */
  function allowedTypesFor(def, ex = null) {
    const source = def || ex || {};
    // Custom-metric exercises are logged only with their own metric.
    if (source.type === "custom" || ex?.type === "custom") return ["custom"];
    // Mobility is always a timed hold — no other logging mode makes sense.
    if (source.type === "hold" || ex?.type === "hold" || source.category === "mobility") return ["hold"];
    if (source.type === "interval" || ex?.type === "interval") return ["interval"];
    if (looksLikeCardio(source) || looksLikeCardio(ex)) return ["cardio"];
    const equipment = String(source.equipment || ex?.equipment || "").toLowerCase();
    const name = String(source.name || ex?.name || "").toLowerCase();
    const id = String(source.id || ex?.exerciseId || "").toLowerCase();
    const hay = `${name} ${id} ${equipment}`;

    // Calisthenics — loadable (belt/vest) or pure bodyweight both allow BW and BW +kg.
    const isBwEquip =
      equipment.includes("bodyweight") ||
      equipment.includes("pull-up bar") ||
      equipment.includes("dip bars");
    const isCalisthenic =
      isBwEquip ||
      /(pull-?up|chin-?up|\bdip\b|dips|push-?up|muscle-?up|pistol squat|nordic|inverted row|front lever|back lever|l-sit|handstand)/.test(hay);
    if (isCalisthenic) return ["bodyweight", "weighted_bodyweight"];

    // Static holds / floor core — bodyweight only.
    if (/(plank|dead.?bug|hollow|bird.?dog|side plank|superman|crunch|sit-?up|leg raise|mountain climber|rollout|ab wheel)/.test(hay) &&
        !/cable|machine|weighted/.test(hay)) {
      return ["bodyweight", "weighted_bodyweight"];
    }

    // External-load equipment — weighted only.
    if (/barbell|dumbbell|machine|cable|kettlebell|ez-bar|smith|landmine|t-bar|trap bar|plate/.test(hay)) {
      return ["weighted"];
    }

    // Unknown / custom exercise — leave every option open.
    return ["weighted", "bodyweight", "weighted_bodyweight", "cardio"];
  }

  // Ensure a workout exercise entry has the correct type + set shape for cardio / bodyweight.
  // Safe to call repeatedly; only rewrites empty/unlogged strength rows.
  function normalizeWorkoutExercise(ex, def) {
    if (!ex) return ex;
    const source = def || ex;
    // Custom-metric exercises: lock the type, carry the metric onto the entry,
    // and ensure the set shape holds a single numeric value.
    if (source.type === "custom" || ex.type === "custom") {
      ex.type = "custom";
      if (def?.metric && !ex.metric) ex.metric = def.metric;
      const onlyEmpty = !(ex.sets || []).length ||
        (ex.sets || []).every(s => !s.done && s.value == null);
      // Same as holds: reshape, but never collapse a multi-set exercise to one.
      if (onlyEmpty) {
        const n = Math.max(1, (ex.sets || []).length);
        ex.sets = Array.from({ length: n }, () => emptySetForType("custom"));
      }
      if (def?.met != null && ex.met == null) ex.met = def.met;
      return ex;
    }
    // Interval protocols: lock the type; the plan lives on the entry.
    if (source.type === "interval" || ex.type === "interval") {
      ex.type = "interval";
      if (def?.met != null && ex.met == null) ex.met = def.met;
      const onlyEmpty = !(ex.sets || []).length ||
        (ex.sets || []).every(s => !s.done && s.seconds == null);
      if (onlyEmpty && !(ex.sets || []).length) ex.sets = [emptySetForType("interval")];
      return ex;
    }
    // Mobility holds: lock the type and keep the seconds-based set shape.
    if (source.type === "hold" || ex.type === "hold" || source.category === "mobility") {
      ex.type = "hold";
      if (source.perSide && !ex.perSide) ex.perSide = true;
      if (def?.met != null && ex.met == null) ex.met = def.met;
      const onlyEmpty = !(ex.sets || []).length ||
        (ex.sets || []).every(s => !s.done && s.seconds == null);
      // Reshape without losing the count — a stretch is one hold, but a plank
      // is three and a circuit station is one per round.
      if (onlyEmpty) {
        const n = Math.max(1, (ex.sets || []).length);
        ex.sets = Array.from({ length: n }, () => emptySetForType("hold"));
      }
      return ex;
    }
    const shouldBeCardio = looksLikeCardio(source) || looksLikeCardio(ex);
    const hasCardioData = (ex.sets || []).some(s => s.done || s.durationMin != null || s.distanceKm != null);
    const hasStrengthData = (ex.sets || []).some(s => s.done || (s.weight != null && s.weight !== "") || (s.reps != null && s.reps !== ""));
    const onlyEmpty =
      !(ex.sets || []).length ||
      (ex.sets || []).every(s =>
        !s.done &&
        s.durationMin == null &&
        (s.weight == null || s.weight === "") &&
        (s.reps == null || s.reps === "")
      );

    if (shouldBeCardio) {
      // Force cardio UI when definition is cardio, unless the user has already logged strength sets.
      if (ex.type !== "cardio") {
        if (!hasStrengthData || hasCardioData || !ex.type || ex.type === "weighted") {
          ex.type = "cardio";
        }
      }
      if (ex.type === "cardio" && !hasCardioData) {
        if (onlyEmpty) ex.sets = [emptySetForType("cardio")];
      }
    } else {
      const inferred = def ? inferExerciseType({ ...def, type: undefined }) : inferExerciseType({ ...ex, type: undefined });
      // Correct stale "weighted" on dips / pull-ups / pure BW when nothing is logged yet.
      if (!ex.type) {
        ex.type = inferred;
      } else if (onlyEmpty && !hasStrengthData) {
        // Only auto-correct a stale generic "weighted" default (e.g. a pull-up
        // that was saved as plain weighted) toward the inferred shape. Never
        // auto-upgrade an explicit "bodyweight" choice to BW +kg — that fought
        // the user's dropdown selection on every re-render.
        if (
          ex.type === "weighted" &&
          (inferred === "bodyweight" || inferred === "weighted_bodyweight" || inferred === "cardio")
        ) {
          ex.type = inferred;
          if (inferred === "cardio") ex.sets = [emptySetForType("cardio")];
        }
      }
    }
    if (def?.met != null && ex.met == null) ex.met = def.met;
    return ex;
  }

  // ============ Render root ============
  function render() {
    renderMain();
  }

  // The app mark. It used to sit in a 62px header bar shown on Home and
  // nowhere else — a brand plate, with no controls on it, costing a fifth of
  // the landing screen to tell you which app you had just opened. It is inline
  // in the greeting row now and the bar is gone.
  const LOGO_MARK = `<svg viewBox="0 0 32 32" aria-label="FitForge logo"><circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" stroke-opacity=".2" stroke-width="2"/><circle cx="16" cy="16" r="13" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-dasharray="22 60" transform="rotate(-90 16 16)"/><circle cx="16" cy="16" r="7" fill="none" stroke="var(--accent)" stroke-opacity=".45" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="11 33" transform="rotate(120 16 16)"/><circle cx="16" cy="16" r="2.6" fill="var(--accent)"/></svg>`;

  function reduceMotion() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }
  // Roll big stat numbers up to their value so logging feels consequential.
  // Any element with class "count-up" (holding a formatted number) animates once.
  function applyCountUps(root) {
    if (!root || reduceMotion()) return;
    root.querySelectorAll(".count-up").forEach(elm => {
      if (elm._counted) return;
      const raw = (elm.textContent || "").trim();
      const target = parseFloat(raw.replace(/[^0-9.-]/g, ""));
      if (!isFinite(target) || target <= 0) return;
      elm._counted = true;
      const dur = 650, t0 = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - p, 3);
        elm.textContent = Math.round(target * e).toLocaleString("en-GB");
        if (p < 1) requestAnimationFrame(step); else elm.textContent = raw;
      };
      requestAnimationFrame(step);
    });
  }

  /** Build the current tab into `container`, which need not be #main. Split
      out so a tab can be assembled off screen and only shown once finished —
      see the staging in switchTab. Returns the view and, when the renderer is
      async, the promise that says it is done. */
  function buildTabView(container) {
    const view = el("div", { class: "view" });
    container.appendChild(view);
    let rendered;
    switch (state.tab) {
      case "home": rendered = renderHome(view); break;
      case "workout": rendered = renderWorkout(view); break;
      case "library": rendered = renderLibrary(view); break;
      case "nutrition": rendered = renderNutrition(view); break;
      case "stats": case "history": rendered = renderStatsShell(view); break;
    }
    return { view, rendered };
  }

  /** Put an already-finished view into #main with the dock and the usual
      extras, so a staged tab lands exactly as a freshly rendered one would. */
  function mountView(view) {
    applyDaypart();
    const headerEl = document.getElementById("header");
    if (headerEl) headerEl.style.display = "none";
    const main = $("#main");
    clear(main);
    main.appendChild(view);
    renderDock(main);
    renderRestTimer();
    requestAnimationFrame(() => applyCountUps(main));
  }

  function renderMain() {
    applyDaypart();
    // No header bar anywhere: it carried the logo and nothing else, and the
    // mark now rides in Home's greeting row.
    const headerEl = document.getElementById("header");
    if (headerEl) {
      headerEl.style.display = "none";
    }

    const main = $("#main");
    clear(main);

    // #main is already emptied, so a renderer that throws here used to leave
    // a blank screen with no dock and no way out but knowing to reload. The
    // page must always end this function navigable: an error state and the
    // dock, never a void.
    let rendered = null;
    try {
      ({ rendered } = buildTabView(main));
    } catch (err) {
      console.error("renderMain failed", err);
      renderMainError(main);
    }

    // Bottom dock navigation
    renderDock(main);

    // Rest timer overlay
    renderRestTimer();

    // Roll the big stat numbers up once they're on screen. Tab renderers are
    // async, so wait for the render to settle before the numbers exist. A
    // rejected renderer surfaces instead of silently truncating the tab.
    const rollUp = () => requestAnimationFrame(() => applyCountUps(main));
    if (rendered && typeof rendered.then === "function") {
      rendered.then(rollUp, (err) => {
        console.error("tab render failed", err);
        if (!main.querySelector(".render-error")) renderMainError(main);
        rollUp();
      });
    } else rollUp();
  }

  /** The screen a failed render shows instead of a void. */
  function renderMainError(main) {
    main.appendChild(el("div", { class: "view render-error", "data-testid": "render-error" },
      el("div", { class: "card", style: "margin: 24px 16px" },
        el("div", { class: "card-title" }, "This screen hit a problem"),
        el("p", { class: "text-sm text-muted" },
          "Your data is safe — the screen just failed to draw. Reloading usually clears it."),
        el("button", { class: "btn btn-primary", on: { click: () => location.reload() } }, "Reload"))));
  }

  // ============ Bottom dock ============
  const dockIcons = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/></svg>',
    utensils: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 3v7a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3"/><path d="M6 3v18"/><path d="M15 3c-1.5 1.5-2 4-2 6 0 2.5 1.5 4 3 4v8"/><path d="M18 3c1 1.5 1.5 4 1.5 6"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m6 15 4-5 3 3 5-7"/></svg>',
    person: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M5 21c0-3.9 3.1-7 7-7s7 3.1 7 7"/></svg>'
  };

  // Quick-action artwork. Shared by the fork sheet and the radial hold menu,
  // because they are the same three choices — a generic "+" for Log meal is
  // also the glyph on the button you are holding, which is exactly why it
  // reads as nothing.
  const QA_ART = {
    workout: `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><g class="qa2-dumbbell" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"><line x1="18" y1="24" x2="30" y2="24"/><line x1="13" y1="18" x2="13" y2="30"/><line x1="8.5" y1="21" x2="8.5" y2="27"/><line x1="35" y1="18" x2="35" y2="30"/><line x1="39.5" y1="21" x2="39.5" y2="27"/></g></svg>`,
    meal: `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><g class="qa2-steam" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M18 15c-2.5-2-2.5-4 0-6"/><path d="M24 15c-2.5-2-2.5-4 0-6"/><path d="M30 15c-2.5-2-2.5-4 0-6"/></g><path d="M9 25h30a15 15 0 0 1-30 0z" fill="currentColor" fill-opacity="0.16"/><path d="M9 25h30a15 15 0 0 1-30 0z" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><line x1="7" y1="25" x2="41" y2="25" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`,
    sessions: `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><rect x="9" y="8" width="30" height="32" rx="4" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><g class="qa2-lines" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="16" y1="18" x2="32" y2="18"/><line x1="16" y1="25" x2="32" y2="25"/><line x1="16" y1="32" x2="26" y2="32"/></g></svg>`,
    // An open book for the reading, a figure for the map. Same weight as the
    // other three so the two forks look like one family.
    learn: `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M24 13c-3.5-3-8-4-14-4v27c6 0 10.5 1 14 4 3.5-3 8-4 14-4V9c-6 0-10.5 1-14 4z" fill="currentColor" fill-opacity="0.16" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><line x1="24" y1="13" x2="24" y2="40" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`,
    // The same body as the exercise figure, drawn as an outline rather than a
    // silhouette. Filled, it would be the only solid mark among five and stop
    // the two forks reading as one family — so this keeps the family's stroke
    // and takes the proportions: shoulders wider than the waist, arms with
    // mass, legs from the trunk rather than a crotch vertex.
    bodymap: `<svg viewBox="0 0 44 44" fill="none" aria-hidden="true" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="22" cy="7.2" r="3.5"/><path d="M14.4 15.2 Q22 12.8 29.6 15.2 L27.6 23.4 Q27 27.6 26.2 29.6 L17.8 29.6 Q17 27.6 16.4 23.4 Z"/><path d="M14.2 15.8 Q11 21 10.8 28.4"/><path d="M29.8 15.8 Q33 21 33.2 28.4"/><path d="M18.4 30.2 17.6 41"/><path d="M25.6 30.2 26.4 41"/></svg>`
  };

  // Marks for the set-row hold menu. "D" on a button is enough when it sits
  // next to its own tooltip; on a 34px slice with a word under it, a drawing
  // reads faster than a letter.
  const setIcons = {
    warmup: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18h3v-4H4z"/><path d="M10 18h3v-8h-3z"/><path d="M16 18h3V6h-3z"/><path d="M3 21h18"/></svg>',
    drop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h9M4 12h6M4 18h3"/><path d="M18 5v12"/><path d="m14.5 13.5 3.5 3.5 3.5-3.5"/></svg>'
  };

  // Small marks for the tab hold menus. Deliberately plain line icons rather
  // than the quick-actions artwork: those three are the app's headline verbs,
  // and reusing that weight for "jump to the supplements panel" would flatten
  // the distinction between starting something and navigating somewhere.
  const navIcons = {
    today: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/></svg>',
    week: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    trend: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l5-6 4 4 8-9"/><path d="M15 6h5v5"/></svg>',
    saved: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/></svg>',
    pill: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="8" width="19" height="8" rx="4" transform="rotate(-45 12 12)"/><path d="M9 9l6 6"/></svg>',
    history: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v4h4"/><path d="M12 7v5l3 2"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7.6 19.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3 14a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10 3.6V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    // Drawn for 24, not scaled down from the big one: at this size its curves
    // close up into blobs. Slightly lighter than the stroke the other marks
    // use, because a body carries interior detail a chart or a book does not,
    // and at 22px the trunk fills in at 2.
    body: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="2.1"/><path d="M8.4 8.4 Q12 7 15.6 8.4 L14.9 12.6 Q14.6 15 14.2 16.2 L9.8 16.2 Q9.4 15 9.1 12.6 Z"/><path d="M8.3 8.7 Q6.4 11.4 6.3 15.4"/><path d="M15.7 8.7 Q17.6 11.4 17.7 15.4"/><path d="M10.2 16.5 9.8 22"/><path d="M13.8 16.5 14.2 22"/></svg>'
  };

  // Go to a tab and then put the screen where the slice said it would.
  // renderMain is what goTab does; calling it directly skips the tab-switch
  // animation, which is right for a shortcut — you asked for a destination,
  // not a journey.
  function jumpTo(tab, after) {
    state.tab = tab;
    renderMain();
    window.scrollTo(0, 0);
    if (after) setTimeout(after, 90);
  }
  function scrollToTestId(testId) {
    const n = document.querySelector(`[data-testid="${testId}"]`);
    if (!n) return;
    const y = n.getBoundingClientRect().top + window.scrollY - 74;
    window.scrollTo({ top: Math.max(0, y), behavior: reduceMotion() ? "auto" : "smooth" });
  }

  // The hold menus for the four tab buttons. Fixed order, always — the whole
  // value of a radial is that the third slice is in the same place tomorrow,
  // so nothing here may ever be sorted by recency or filtered by state.
  const TAB_RADIALS = {
    home: {
      label: "Home sections",
      items: [
        { key: "today", label: "Today", icon: navIcons.today, onPick: () => jumpTo("home", () => scrollToTestId("home-section-today")) },
        { key: "week", label: "This week", icon: navIcons.week, onPick: () => jumpTo("home", () => scrollToTestId("home-section-week")) },
        { key: "trends", label: "Trends", icon: navIcons.trend, onPick: () => jumpTo("home", () => scrollToTestId("home-section-trends")) }
      ]
    },
    nutrition: {
      label: "Nutrition sections",
      items: [
        { key: "today", label: "Today", icon: navIcons.today, onPick: () => { pendingNutritionPanel = "overview"; jumpTo("nutrition"); } },
        { key: "saved", label: "Saved", icon: navIcons.saved, onPick: () => jumpTo("nutrition", () => openSavedMealsSheet()) },
        { key: "supps", label: "Supps", icon: navIcons.pill, onPick: () => { pendingNutritionPanel = "supplements"; jumpTo("nutrition"); } },
        { key: "trends", label: "Trends", icon: navIcons.trend, onPick: () => { pendingNutritionPanel = "trends"; jumpTo("nutrition"); } }
      ]
    },
    stats: {
      label: "You sections",
      items: [
        { key: "trends", label: "Trends", icon: navIcons.trend, onPick: () => jumpTo("stats") },
        { key: "history", label: "History", icon: navIcons.history, onPick: () => jumpTo("history") },
        { key: "settings", label: "Settings", icon: navIcons.gear, onPick: () => openSettings() }
      ]
    },
    library: {
      label: "Exercise sections",
      items: [
        { key: "sessions", label: "Sessions", icon: QA_ART.sessions, onPick: () => jumpTo("library", openSessionsSheet) },
        { key: "search", label: "Search", icon: navIcons.search, onPick: () => jumpTo("library", () => {
            const i = document.getElementById("lib-search");
            if (!i) return;
            scrollToTestId("body-map");
            i.focus({ preventScroll: true });
          }) },
        { key: "bodymap", label: "Body map", icon: navIcons.body, onPick: () => jumpTo("library", () => scrollToTestId("body-map")) }
      ]
    }
  };


  function renderDock(main) {
    const old = document.querySelector(".dock");
    if (old) old.remove();
    const items = [
      { id: "home", icon: dockIcons.home, label: "Home" },
      { id: "nutrition", icon: dockIcons.utensils, label: "Nutrition" },
      { id: "__fab", icon: icons.plus, label: "Quick actions" },
      { id: "stats", icon: dockIcons.person, label: "You" },
      // "Learn" rather than "Learning Centre": the dock gives a label about
      // eight characters before it wraps under the icon.
      { id: "library", icon: icons.dumbbell, label: "Learn" }
    ];
    const dock = el("nav", { class: "dock", "data-testid": "dock" });
    for (const it of items) {
      if (it.id === "__fab") {
        const fab = el("button", {
          class: "dock-fab" + (state.tab === "workout" ? " active" : ""),
          title: it.label,
          "data-testid": "dock-fab",
          html: state.tab === "workout" ? icons.dumbbell : icons.plus,
          on: { click: openQuickSheet }
        });
        // Hold for the same three choices the quick sheet offers, without the
        // round trip. Tapping still opens the sheet — that path stays the one
        // that has to work for everyone.
        attachRadial(fab, {
          label: "Quick actions",
          items: [
            {
              key: "workout", label: state.activeWorkout ? "Resume" : "Workout", icon: QA_ART.workout,
              onPick: () => { goTab("workout"); window.scrollTo(0, 0); }
            },
            {
              key: "sessions", label: "Sessions", icon: QA_ART.sessions,
              onPick: () => { goTab("workout"); window.scrollTo(0, 0); setTimeout(openSessionsSheet, 260); }
            },
            {
              key: "meal", label: "Log meal", icon: QA_ART.meal,
              onPick: () => { goTab("nutrition"); window.scrollTo(0, 0); }
            }
          ]
        });
        dock.appendChild(fab);
        continue;
      }
      const active = state.tab === it.id || (it.id === "stats" && state.tab === "history");
      // Learn is the one tab holding two unrelated destinations, so it forks
      // rather than landing you on whichever happens to be at the top. Every
      // other tab is one place and goes straight there.
      const opens = it.id === "library" ? openLearnFork : () => switchTab(it.id);
      const btn = el("button", {
        class: "dock-item" + (active ? " active" : ""),
        title: it.label,
        "data-testid": "dock-" + it.id,
        html: it.icon,
        on: { click: opens }
      });
      // Hold a tab to land inside it rather than at the top of it. Tapping
      // still just switches tabs, and every one of these is somewhere you can
      // still reach by scrolling or tapping once you are there.
      const radial = TAB_RADIALS[it.id];
      if (radial) attachRadial(btn, { label: radial.label, items: radial.items });
      dock.appendChild(btn);
    }
    document.body.appendChild(dock);
  }

  // Switch to a top-level tab, resetting remembered pager scroll so it opens
  // fresh. `dir` (-1/0/+1) drives the slide direction; 0 = infer from dock order.
  // `animate: false` is for the swipe pager, which has already moved the
  // screen with the finger — animating again would play the same journey
  // twice.
  function switchTab(id, dir = 0, { animate = true, onShown = null } = {}) {
    if (id === state.tab) return;
    if (!dir) {
      const a = SWIPE_TABS.indexOf(state.tab === "history" ? "stats" : state.tab);
      const b = SWIPE_TABS.indexOf(id);
      dir = (a >= 0 && b >= 0) ? Math.sign(b - a) : 0;
    }
    // Taken before the tab changes, so a later swipe back has something to
    // show while the real render catches up.
    snapshotPane(state.tab);

    // First time this tab is opened this session, play its tailored loader.
    // The loader covers the whole screen for 1.5s, so on a first visit it *is*
    // the entrance and the slide is skipped rather than played underneath it.
    const firstVisit = TAB_LOADERS[id] && !seenTabLoaders.has(id);

    // Build the destination off screen, then show it whole.
    //
    // This is the shape a flash kept coming back through. renderMain() empties
    // #main and the tab renderers fill it afterwards, so there was always a
    // window with the old page destroyed and the new one not yet built.
    // Several attempts at waiting for the right moment each picked a signal
    // that turned out true too early — children exist, height settled —
    // because the window opens before any of that code gets a say, and how
    // long it stays open depends on the device, the data and the tab.
    //
    // Nothing here waits for the visible page to catch up, because the visible
    // page is never taken apart: the tab is assembled in a container parked
    // off to the side, and #main is cleared only at the moment there is a
    // finished view to put in it.
    const stage = makeTabStage();
    nutritionScrollKey = null; nutritionScrollTop = 0;
    workoutScrollIdx = 0; workoutScrollTop = 0;
    state.tab = id;

    let staged;
    try {
      staged = buildTabView(stage);
    } catch (e) {
      // A renderer that throws must not strand the app on the tab being left.
      stage.remove();
      renderMain();
      window.scrollTo(0, 0);
      if (firstVisit) { seenTabLoaders.add(id); showTabLoader(id); }
      if (onShown) onShown();
      return;
    }

    const show = () => {
      if (stage.dataset.spent) return;
      stage.dataset.spent = "1";
      const doRender = () => { mountView(staged.view); window.scrollTo(0, 0); };
      stage.remove();
      animateTabSwitch((firstVisit || !animate) ? 0 : dir, doRender);
      if (firstVisit) { seenTabLoaders.add(id); showTabLoader(id); }
      if (onShown) onShown();
    };

    whenTabReady(staged, show);
  }

  /** A container that is in the document — so widths, wrapped text and
      anything else a renderer measures come out as they will on screen — but
      parked far enough aside that nobody sees it being assembled. */
  function makeTabStage() {
    const main = $("#main");
    const stage = el("div", { class: "tab-stage", "aria-hidden": "true" });
    stage.style.width = ((main && main.clientWidth) || window.innerWidth || 390) + "px";
    document.body.appendChild(stage);
    return stage;
  }

  /** Ready means the renderer's own promise has resolved and the view has
      stopped growing. Capped, because a tab that never settles still has to
      appear — better a late transition than a screen you cannot leave. */
  function whenTabReady({ view, rendered }, done, cap = 1200) {
    const started = performance.now();
    let settled = !(rendered && typeof rendered.then === "function");
    // A rejected renderer still mounts — hiding a crash behind a frozen stage
    // would be worse — but it mounts wearing the error card, not silently
    // truncated at wherever the throw happened to land.
    if (!settled) rendered.then(() => { settled = true; }, (err) => {
      settled = true;
      console.error("tab render failed", err);
      if (!view.querySelector('[data-testid="render-error"]')) {
        view.appendChild(el("div", { class: "card render-error", "data-testid": "render-error", style: "margin: 24px 16px" },
          el("div", { class: "card-title" }, "This screen hit a problem"),
          el("p", { class: "text-sm text-muted" },
            "Your data is safe — the screen just failed to draw fully. Reloading usually clears it."),
          el("button", { class: "btn btn-primary", on: { click: () => location.reload() } }, "Reload")));
      }
    });
    let lastH = -1, steady = 0;
    const poll = () => {
      const h = view.scrollHeight;
      if (h > 0 && h === lastH) steady++;
      else { steady = 0; lastH = h; }
      if ((settled && steady >= 2) || performance.now() - started > cap) { done(); return; }
      requestAnimationFrame(poll);
    };
    requestAnimationFrame(poll);
  }

  // ============ Tab loading screens (first visit per tab, per session) ============
  // Built on the brand orbit; each tab gets a motif matching its function.
  const TAB_LOADERS = {
    home:      { word: "FitForge", sub: "SYNCING · YOUR DAY",   motif: "orbit" },
    nutrition: { word: "FitForge", sub: "LOADING · MACROS",     motif: "macro" },
    stats:     { word: "FitForge", sub: "LOADING · YOUR STATS", motif: "bars" },
    library:   { word: "FitForge", sub: "LOADING · WORKOUTS",   motif: "dumbbell" }
  };
  // Home is already covered by the launch splash, so don't replay it on nav.
  const seenTabLoaders = new Set(["home"]);

  function tabLoaderMark(motif) {
    const mark = el("div", { class: "tabload-mark" });
    mark.appendChild(el("div", { class: "tl-ring0" }));
    if (motif === "macro") {
      mark.appendChild(el("div", { class: "tl-macro", html:
        '<svg width="132" height="132" viewBox="0 0 132 132">'
        + '<circle class="tl-track" cx="66" cy="66" r="52" fill="none" stroke-width="7"/>'
        + '<circle class="tl-arc1" cx="66" cy="66" r="52" fill="none" stroke-width="7" stroke-linecap="round" transform="rotate(-90 66 66)"/>'
        + '<circle class="tl-arc2" cx="66" cy="66" r="52" fill="none" stroke-width="7" stroke-linecap="round" transform="rotate(68 66 66)"/>'
        + '<circle class="tl-arc3" cx="66" cy="66" r="52" fill="none" stroke-width="7" stroke-linecap="round" transform="rotate(176 66 66)"/>'
        + '</svg>' }));
      mark.appendChild(el("div", { class: "tl-core" }));
    } else if (motif === "bars") {
      mark.appendChild(el("div", { class: "tl-spin" }, el("div", { class: "tl-arc-top" })));
      mark.appendChild(el("div", { class: "tl-bars" },
        el("div", { class: "tl-bar tl-bar1" }), el("div", { class: "tl-bar tl-bar2" }), el("div", { class: "tl-bar tl-bar3" })));
    } else if (motif === "dumbbell") {
      mark.appendChild(el("div", { class: "tl-spin" }, el("div", { class: "tl-arc-top" })));
      mark.appendChild(el("div", { class: "tl-db" }, el("div", { class: "tl-db-inner", html:
        '<div class="tl-db-bar"></div><div class="tl-plate tl-plate-l1"></div><div class="tl-plate tl-plate-r1"></div><div class="tl-plate tl-plate-l2"></div><div class="tl-plate tl-plate-r2"></div>' })));
    } else {
      mark.appendChild(el("div", { class: "tl-spin" }, el("div", { class: "tl-arc-top" })));
      mark.appendChild(el("div", { class: "tl-spinrev" }, el("div", { class: "tl-arc-bot" })));
      mark.appendChild(el("div", { class: "tl-core" }));
    }
    return mark;
  }

  function showTabLoader(tabId) {
    const cfg = TAB_LOADERS[tabId];
    if (!cfg || reduceMotion()) return;
    const overlay = el("div", {
      class: "tabload", "data-testid": "tab-loader", "data-tab": tabId,
      role: "button", "aria-label": `${cfg.word} — ${cfg.sub}. Tap to skip.`
    },
      tabLoaderMark(cfg.motif),
      el("div", { class: "tabload-text" },
        el("div", { class: "tabload-word" }, cfg.word),
        el("div", { class: "tabload-sub" }, cfg.sub)),
      el("div", { class: "tabload-bar" }, el("i", {}))
    );
    document.body.appendChild(overlay);

    // Tap (or any key) skips it. This covers the whole screen at z-index 9000,
    // so while it is up it eats every tap aimed at the tab underneath — once on
    // each of three tabs, on a fresh install. The animation is decoration; a
    // finger on the screen is someone who has finished looking at it.
    let hold = null, gone = false;
    const dismiss = () => {
      if (gone) return;
      gone = true;
      clearTimeout(hold);
      document.removeEventListener("keydown", onKey, true);
      overlay.classList.add("tabload-out");   // also drops pointer-events
      setTimeout(() => overlay.remove(), 430);
    };
    const onKey = () => dismiss();
    overlay.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", onKey, true);
    hold = setTimeout(dismiss, 1500);
  }

  // Slide the outgoing view off in the travel direction while the incoming one
  // slides in from the opposite edge. Falls back to an instant swap when there's
  // no direction, nothing to animate, or the user prefers reduced motion.
  let tabAnimating = false;   // read when a switch interrupts one already running
  let tabSpring = null;       // the spring driving it, so its velocity can carry
  let tabCleanup = null;      // lets anyone finish the transition early
  let tabRaf = 0, tabGuard = 0;
  // ============ Navigation springs ============
  // Semi-implicit Euler on fixed 1/480s substeps. The substepping is what
  // makes it frame-rate independent: without it a 30Hz phone integrates half
  // as often and the same move takes visibly longer than it does at 120Hz.
  //
  // Settled means "close enough that another frame would not move a pixel" —
  // 6e-4 of the travel is well under a tenth of a pixel across a phone.
  function makeSpring(v = 0) { return { v, target: v, vel: 0 }; }

  function stepSpring(s, k, c, dt) {
    let t = dt;
    while (t > 0) {
      const h = Math.min(1 / 480, t);
      t -= h;
      s.vel += (-k * (s.v - s.target) - c * s.vel) * h;
      s.v += s.vel * h;
    }
    if (Math.abs(s.v - s.target) < 6e-4 && Math.abs(s.vel) < 6e-3) {
      s.v = s.target;
      s.vel = 0;
      return false;
    }
    return true;
  }

  // k420/c38 rather than anything softer. A transition is judged by its
  // duration, a spring by when it arrives: these values reach 99% of the
  // travel at 283ms against the 280ms the fixed transition took, so the move
  // gains velocity carry-over and interruptibility without getting slower.
  // Gentler springs measured 380ms+, which on the most repeated gesture in
  // the app reads as lag, not as polish.
  const TAB_SPRING_K = 420, TAB_SPRING_C = 38;

  function animateTabSwitch(dir, doRender) {
    const main = $("#main");
    const oldView = main && main.querySelector(".view");
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!main || !oldView || !dir || reduce) { settleTabSwitch(); doRender(); return; }

    // Clear any half-finished previous transition so rapid swipes stay clean.
    main.querySelectorAll(".view.tab-ghost").forEach(g => g.remove());

    const ghost = oldView;
    ghost.classList.add("tab-ghost");
    // Where the reader actually was. The mount scrolls to the top and the
    // ghost is positioned from the top of #main, so without this the page you
    // are leaving snaps to its own first screen before sliding away — you see
    // a page you were not looking at, which reads as the previous page
    // flashing up.
    const leftAt = window.scrollY || 0;
    main.removeChild(ghost);           // detach so renderMain's clear() won't destroy it
    main.classList.add("tab-anim");

    doRender();                         // builds the new .view into #main (scrolls to top)
    const newView = main.querySelector(".view");
    if (!newView) { ghost.remove(); main.classList.remove("tab-anim"); return; }
    if (leftAt) ghost.style.top = (-leftAt) + "px";
    main.appendChild(ghost);            // overlay the outgoing view on top

    // A switch arriving mid-flight inherits the velocity of the one it
    // interrupts, so a fast double-swipe reads as one continuous movement
    // instead of two transitions played back to back. `tabAnimating` was set
    // and never read before this — the old version just restarted from zero.
    const carried = tabAnimating && tabSpring ? tabSpring.vel : 0;
    settleTabSwitch();

    const sign = dir > 0 ? 1 : -1;      // forward: the new view comes from the right
    const s = makeSpring(0);            // 0 = new view offscreen, 1 = arrived
    s.target = 1;
    s.vel = carried;

    newView.style.willChange = "transform";
    ghost.style.willChange = "transform, opacity";

    const paint = () => {
      const p = s.v;
      newView.style.transform = `translate3d(${(1 - p) * 100 * sign}%,0,0)`;
      ghost.style.transform = `translate3d(${-p * 100 * sign}%,0,0)`;
      ghost.style.opacity = String(1 - p * 0.65);
    };
    paint();

    let done = false;
    const cleanup = () => {
      if (done) return;
      done = true;
      tabAnimating = false;
      tabSpring = null;
      tabCleanup = null;
      if (tabRaf) { cancelAnimationFrame(tabRaf); tabRaf = 0; }
      clearTimeout(tabGuard);
      ghost.remove();
      newView.style.transform = ""; newView.style.willChange = "";
      main.classList.remove("tab-anim");
    };

    let last = performance.now();
    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);   // a long stall must not explode it
      last = now;
      const running = stepSpring(s, TAB_SPRING_K, TAB_SPRING_C, dt);
      paint();
      if (running) tabRaf = requestAnimationFrame(frame);
      else cleanup();
    };

    tabAnimating = true;
    tabSpring = s;
    tabCleanup = cleanup;
    // Nothing to wait for. switchTab is the only caller and it hands over a
    // view that is already finished — the rounds of waiting that used to live
    // here were compensating for a page taken apart before its replacement
    // existed, which staging removed.
    tabRaf = requestAnimationFrame(frame);
    // Belt and braces, as the fixed-duration version had: a full settle is
    // 400ms at these constants.
    tabGuard = setTimeout(cleanup, 1200);
  }

  // Finish any tab transition immediately, leaving the destination exactly
  // where it would have landed. Called before starting another one, and when
  // the page is hidden: a backgrounded tab gets no animation frames, so a
  // spring stops dead where a CSS transition would have completed. Without
  // this you come back to a view frozen halfway across the screen.
  function settleTabSwitch() {
    if (tabCleanup) tabCleanup();
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) settleTabSwitch();
  });

  // ============ Drag a sheet away ============
  // Bottom sheets could only be dismissed by a button, the scrim or Escape.
  // On a phone the gesture people already try is to push the thing back down,
  // so give them a grip and let the spring finish what the finger started.
  //
  // Listeners live on the grip and use pointer capture rather than sitting on
  // window: sheets here are built and thrown away constantly, and a pair of
  // window listeners per sheet with no removal is an unbounded leak.
  const SHEET_SPRING_K = 480, SHEET_SPRING_C = 42;

  /** Should a released drag dismiss the sheet?
   *
   *  `vel` is px/ms downward, `far` the furthest it actually travelled, and
   *  `open` how much of the sheet is still on screen (1 = untouched).
   *
   *  Two rules, because either alone gets a case wrong. Distance alone means
   *  a fast flick that stops short does nothing, which feels stuck. Speed
   *  alone means a slip of the thumb closes the sheet, and a single coalesced
   *  pointer event can report a speed no finger ever produced — that is why
   *  the flick must also have gone somewhere.
   */
  function shouldDismissSheet(vel, far, open) {
    if (vel > 0.5 && far >= 24) return true;   // a committed flick
    return open < 0.62;                        // or simply dragged most of the way down
  }

  function makeDismissible(sheet, onClose) {
    if (!sheet) return null;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const grip = el("div", { class: "sheet-grip", "data-testid": "sheet-grip", "aria-hidden": "true" },
      el("span", { class: "sheet-grip-bar" }));
    sheet.insertBefore(grip, sheet.firstChild);
    if (reduce) return grip;            // the handle still reads as "this closes"

    // The scrim is the sheet's own overlay parent, not a sibling: every sheet
    // here is <div class="…-overlay"><div class="sheet">.
    const scrim = sheet.parentElement;
    const s = makeSpring(1);            // 1 = fully open, 0 = gone
    let raf = 0, last = 0, drag = null;

    const paint = () => {
      sheet.style.transform = `translate3d(0,${(1 - s.v) * 100}%,0)`;
      if (scrim) scrim.style.opacity = String(Math.max(0, Math.min(s.v, 1)));
    };

    const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };

    const run = () => {
      if (raf) return;
      last = performance.now();
      const frame = (now) => {
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        const running = stepSpring(s, SHEET_SPRING_K, SHEET_SPRING_C, dt);
        paint();
        if (running) { raf = requestAnimationFrame(frame); return; }
        raf = 0;
        if (s.target === 0) onClose();
        else { sheet.style.transform = ""; if (scrim) scrim.style.opacity = ""; }
      };
      raf = requestAnimationFrame(frame);
    };

    grip.style.touchAction = "none";
    grip.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      grip.setPointerCapture(e.pointerId);
      stop();
      // The sheet animates up on open; measuring mid-animation gives a height
      // that is right but a position that is not, so read the box now.
      drag = { y: e.clientY, prev: e.clientY, t: performance.now(), vel: 0, far: 0,
               h: Math.max(sheet.getBoundingClientRect().height, 1) };
    });

    grip.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const now = performance.now();
      let dy = e.clientY - drag.y;
      if (dy < 0) dy *= 0.28;           // rubber band: it gives, but not much
      // Smoothed, because one coalesced move can report an absurd instantaneous
      // speed and a twitch should never read as a flick.
      const inst = (e.clientY - drag.prev) / Math.max(now - drag.t, 8);
      drag.vel = drag.vel * 0.6 + inst * 0.4;
      drag.far = Math.max(drag.far, e.clientY - drag.y);
      drag.prev = e.clientY;
      drag.t = now;
      s.v = Math.min(1 - dy / drag.h, 1.06);
      s.vel = 0;
      paint();
    });

    const release = () => {
      if (!drag) return;
      // Hand the flick to the spring so a fast flick keeps going and a slow
      // drag past halfway still commits.
      s.vel = -drag.vel * 1000 / drag.h;
      s.target = shouldDismissSheet(drag.vel, drag.far, s.v) ? 0 : 1;
      drag = null;
      run();
    };
    grip.addEventListener("pointerup", release);
    grip.addEventListener("pointercancel", release);

    return grip;
  }

  // Set after saving a meal so the Saved-meals hero pulses on the next render.
  let pulseSavedHero = false;
  // Set on workout finish so the just-saved session card flourishes in History.
  let finishFlourish = false;

  // Horizontal swipe anywhere moves between the main tabs (in dock order).
  // ============ Tab snapshots, for the swipe pager ============
  // A tab pane costs 95–176ms to build, because building it means reading
  // IndexedDB. That is far too slow to do at the start of a drag, so a
  // finger-tracked swipe needs a pane it already has.
  //
  // The pane is a clone of the outgoing view, taken as you leave a tab. That
  // is deliberately not a re-render: re-entering a tab renderer with a
  // different state.tab, while its own async render may still be in flight,
  // is a much larger hazard than anything this feature is worth. A clone
  // carries no listeners, which is exactly right — it only has to look
  // correct for the length of a drag, and the real render lands on commit.
  //
  // Anything written to storage invalidates every snapshot. A stale pane
  // would flash last week's numbers mid-drag, and this app does not show a
  // number it cannot stand behind. An invalid pane simply means no finger
  // tracking for that swipe, which is what the app did before all of this.
  const paneSnaps = new Map();     // tab id -> { el, stamp }
  let dataStamp = 0;

  function bumpDataStamp() { dataStamp++; }

  // One wrap at startup beats a bump at every call site, which is the version
  // that goes stale the first time someone adds a new write.
  function watchStorageWrites() {
    if (typeof Storage === "undefined" || Storage.__stampWrapped) return;
    for (const name of Object.keys(Storage)) {
      if (!/^(save|delete|import|clear)/.test(name)) continue;
      const fn = Storage[name];
      if (typeof fn !== "function") continue;
      Storage[name] = function (...args) {
        bumpDataStamp();
        return fn.apply(Storage, args);
      };
    }
    Storage.__stampWrapped = true;
  }

  function snapshotPane(tabId) {
    if (!SWIPE_TABS.includes(tabId)) return;
    const view = $("#main") && $("#main").querySelector(".view:not(.tab-ghost)");
    if (!view) return;
    const clone = view.cloneNode(true);
    // The live view may be mid-drag when this is taken, and cloneNode copies
    // inline styles with it. Left in, the pane would appear already shoved to
    // one side the next time it is used.
    clone.style.transform = "";
    clone.style.willChange = "";
    // Ids would be duplicated the moment this is put back on screen.
    clone.querySelectorAll("[id]").forEach(n => n.removeAttribute("id"));
    paneSnaps.set(tabId, { el: clone, stamp: dataStamp });
  }

  function takePane(tabId) {
    const snap = paneSnaps.get(tabId);
    if (!snap || snap.stamp !== dataStamp) return null;
    return snap.el.cloneNode(true);
  }

  const SWIPE_TABS = ["home", "nutrition", "stats", "library"];
  function initTabSwipe() {
    // Sheets/modals/quizzes that should own the gesture while open.
    // Anything full-screen owns the gesture. The last four were missing and
    // happened to be safe anyway — the reader and the runners cover the dock
    // and absorb the touch themselves — but that is incidental protection,
    // one CSS change away from a swipe that changes the tab underneath an
    // overlay and leaves it stranded there. Listed explicitly so the intent
    // survives the next layout change.
    const BLOCKING = ".modal-overlay, .qa-fork-overlay, .qa-overlay, .numpad-overlay, " +
      ".rest-overlay, .wsheet-overlay, .pquiz, .learn-overlay, .srun, .ivr, .radial-overlay";
    // Walk up from the touch target: if something scrolls horizontally itself
    // (category pager, week strip, a wheel, a range slider), let it have the swipe.
    function ownsHorizontal(node) {
      for (let n = node; n && n !== document.body; n = n.parentNode) {
        if (n.nodeType !== 1) continue;
        if (n.classList && (n.classList.contains("wheel") || n.classList.contains("xpick-pager"))) return true;
        if (n.tagName === "INPUT" && n.type === "range") return true;
        const ox = getComputedStyle(n).overflowX;
        if ((ox === "auto" || ox === "scroll") && n.scrollWidth > n.clientWidth + 4) return true;
      }
      return false;
    }
    // Where a swipe from here would land, or null at either end.
    function neighbourTab(dx) {
      const cur = state.tab === "history" ? "stats" : state.tab;
      const i = SWIPE_TABS.indexOf(cur);
      if (i < 0) return null;            // e.g. mid-workout — don't swipe out of a session
      const ni = dx < 0 ? i + 1 : i - 1; // swipe left → next tab, right → previous
      return (ni < 0 || ni >= SWIPE_TABS.length) ? null : SWIPE_TABS[ni];
    }

    const CLAIM_PX = 14;        // enough travel to be sure this is not a scroll
    const RUBBER = 0.32;        // how much the ends give when there is nowhere to go
    const COMMIT_FRAC = 0.5;    // past halfway and it goes, on distance alone
    const COMMIT_VEL = 0.45;    // px/ms — a flick commits from anywhere

    let sx = 0, sy = 0, tracking = false, skip = false;
    let drag = null;            // live once the gesture is ours
    let cover = null;           // the settled pane, held over the handover

    // Everything the drag put on screen, undone. Safe to call twice.
    function clearDrag() {
      if (!drag) return;
      const { main, view, pane } = drag;
      if (pane && pane.parentNode) pane.remove();
      if (view) { view.style.transform = ""; view.style.willChange = ""; }
      if (main) main.classList.remove("tab-anim");
      drag = null;
    }

    function paint() {
      if (!drag || drag.noPane) return;
      const { view, pane, w, p, sign } = drag;
      // p is 0 at rest and 1 fully swapped, always positive; sign says which
      // way the finger went.
      view.style.transform = `translate3d(${-p * w * sign}px,0,0)`;
      if (pane) pane.style.transform = `translate3d(${(1 - p) * w * sign}px,0,0)`;
    }

    function beginDrag(dx) {
      const main = $("#main");
      const view = main && main.querySelector(".view:not(.tab-ghost)");
      if (!main || !view) return false;
      // A swipe arriving while the previous handover is still covered takes
      // the screen from it, rather than stacking a second pane on top.
      if (cover) { if (cover.parentNode) cover.remove(); cover = null; }

      const sign = dx < 0 ? 1 : -1;
      const dest = neighbourTab(dx);
      // No pane means no tracking: a tab never shown this session, or a
      // snapshot a write has since invalidated. There is nothing honest to
      // put on screen, so the gesture reverts to what it was before the pager
      // existed — measure it, and switch on release if it was a real swipe.
      const pane = dest ? takePane(dest) : null;
      const noPane = !!dest && !pane;

      if (!noPane) {
        main.classList.add("tab-anim");
        if (pane) {
          pane.style.willChange = "transform";
          // On <body> as a fixed layer, never inside #main. Inside, it was
          // wrong twice over: top:0 meant the top of the document, so a swipe
          // made while scrolled put it above the screen; and renderMain()
          // empties #main on commit, leaving it zero-height with
          // `overflow: hidden`, which clips every absolutely-positioned child
          // — the cover included, exactly when it is holding the screen.
          pane.classList.add("tab-pane");
          // In pixels, measured now — see the note on .view.tab-pane.
          pane.style.minHeight = (window.innerHeight || 800) + "px";
          document.body.appendChild(pane);
        }
        view.style.willChange = "transform";
      }
      drag = {
        main, view, pane, dest, sign, noPane,
        w: main.clientWidth || window.innerWidth || 390,
        p: 0, atEnd: !dest, vel: 0, lastX: 0, lastT: 0, far: 0
      };
      return true;
    }

    function endDrag(commit) {
      if (!drag) return;
      const d = drag;
      if (d.noPane) {
        // Nothing was moved, so there is nothing to spring. Commit the way the
        // app always did, animation and all.
        clearDrag();
        if (commit) switchTab(d.dest, d.sign);
        return;
      }
      if (!d.dest || !d.pane) { clearDrag(); return; }   // at the end of the row
      if (reduceMotion()) {
        clearDrag();
        if (commit) switchTab(d.dest, d.sign, { animate: false });
        return;
      }
      // Hand the finger's speed to the same spring the dock taps use, so a
      // flick and a tap resolve at the same rate.
      const s = makeSpring(d.p);
      s.target = commit ? 1 : 0;
      s.vel = (d.vel / d.w) * 1000 * d.sign * -1;
      let last = performance.now();
      const frame = (now) => {
        if (!drag) return;
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        const running = stepSpring(s, TAB_SPRING_K, TAB_SPRING_C, dt);
        drag.p = s.v;
        paint();
        if (running) { drag.raf = requestAnimationFrame(frame); return; }
        if (!commit) { clearDrag(); return; }
        commitTo(d);
      };
      drag.raf = requestAnimationFrame(frame);
    }

    // Hand the screen over without letting it go blank for a frame.
    //
    // renderMain() empties #main and the tab renderers fill it asynchronously,
    // so between the two there is a frame with nothing painted at all. Take
    // the settled pane away first and that frame is what you see: a flash,
    // right at the end of an otherwise smooth drag.
    //
    // So the pane stays on as a cover. renderMain wipes it along with
    // everything else, it goes straight back on top, and it only comes off
    // once the real view has something in it.
    function commitTo(d) {
      const { main, pane, dest, sign } = d;
      if (drag && drag.raf) cancelAnimationFrame(drag.raf);
      drag = null;

      // The pane lives on <body>, so renderMain() cannot touch it: it simply
      // stays put across the swap, holding the screen while the destination
      // builds underneath.
      // The pane lives on <body>, so nothing renderMain does can touch it: it
      // holds the screen from the moment the finger lifts until the staged tab
      // is mounted. switchTab no longer finishes before it returns, so the
      // cover comes off on its signal rather than by polling whatever is in
      // #main — which at this point is still the tab being left.
      if (pane) pane.style.transform = "translate3d(0,0,0)";
      if (!pane) { switchTab(dest, sign, { animate: false }); return; }

      cover = pane;
      let dropped = false;
      const drop = () => {
        if (dropped || cover !== pane) return;      // a new gesture took over
        dropped = true;
        // A frame later, so the mounted view has painted underneath first.
        requestAnimationFrame(() => dropCover(main, pane));
      };
      switchTab(dest, sign, { animate: false, onShown: drop });
      // Capped, so a destination that never arrives cannot strand a cover on
      // top of a live screen, swallowing every tap.
      setTimeout(drop, 1600);
    }

    function dropCover(main, pane) {
      if (pane && pane.parentNode) pane.remove();
      if (cover === pane) cover = null;
      // Only if nothing else is mid-flight — a drag that started while the
      // cover was up owns the class now.
      if (main && !drag && !cover) main.classList.remove("tab-anim");
    }

    document.addEventListener("touchstart", (e) => {
      if (drag && drag.raf) { cancelAnimationFrame(drag.raf); clearDrag(); }
      if (e.touches.length !== 1) { tracking = false; return; }
      const t = e.touches[0];
      sx = t.clientX; sy = t.clientY; tracking = true;
      skip = !!document.querySelector(BLOCKING) || ownsHorizontal(e.target);
    }, { passive: true });

    // Non-passive because once the gesture is ours the page must not also
    // scroll. It returns immediately for every touch that is not a candidate,
    // which is nearly all of them.
    document.addEventListener("touchmove", (e) => {
      if (!tracking || skip || e.touches.length !== 1) return;
      const t = e.touches[0];
      const dx = t.clientX - sx, dy = t.clientY - sy;

      if (!drag) {
        if (Math.abs(dx) < CLAIM_PX || Math.abs(dx) < Math.abs(dy) * 1.2) {
          // A mostly-vertical move settles it: this is a scroll, hands off
          // for the rest of the gesture.
          if (Math.abs(dy) > CLAIM_PX) skip = true;
          return;
        }
        if (!beginDrag(dx)) { skip = true; return; }
        drag.lastX = t.clientX;
        drag.lastT = e.timeStamp || performance.now();
      }

      e.preventDefault();
      const now = e.timeStamp || performance.now();
      const inst = (t.clientX - drag.lastX) / Math.max(now - drag.lastT, 8);
      drag.vel = drag.vel * 0.6 + inst * 0.4;
      drag.lastX = t.clientX;
      drag.lastT = now;

      // Travel in the direction the gesture started. Pulling back past the
      // start just returns to rest; it never drags the far neighbour in.
      let travelled = Math.max(0, dx * -drag.sign);
      drag.far = Math.max(drag.far, travelled);
      if (drag.atEnd) travelled *= RUBBER;   // the row gives, then stops
      drag.p = Math.min(travelled / drag.w, drag.atEnd ? 0.18 : 1);
      paint();
    }, { passive: false });

    document.addEventListener("touchend", () => {
      if (!tracking) return;
      tracking = false;
      if (!drag) return;
      const flick = (drag.vel * -drag.sign) > COMMIT_VEL;
      // Untracked swipes keep the old 64px rule rather than inheriting the
      // pager's halfway line, which on a 390px screen would be three times
      // further than this gesture has ever needed.
      const commit = drag.noPane
        ? (drag.far >= 64 || flick)
        : (drag.p >= COMMIT_FRAC || flick);
      endDrag(commit && !drag.atEnd);
    }, { passive: true });

    document.addEventListener("touchcancel", () => {
      tracking = false;
      if (drag) endDrag(false);
    }, { passive: true });
  }

  // ============ Numeric keypad (tap-first input for weights, reps, cardio) ============
  // Typing is the slowest input on mobile, so numeric fields open a bottom
  // sheet with big +/- steppers and a keypad (48px+ targets) instead of the
  // system keyboard. Physical keyboards still work while the pad is open.
  let numpadState = null;

  function closeNumPad() {
    if (!numpadState) return;
    document.removeEventListener("keydown", numpadState.keyHandler, true);
    const input = numpadState.input;
    numpadState.overlay.remove();
    numpadState = null;
    // Closing the pad IS the commit point — it is the whole editing session
    // for that field. While it only dispatched "input", any field that saves
    // on "change"/"blur" kept the number on screen and never wrote it, so it
    // survived only if the user happened to tap another field afterwards.
    if (input && input.isConnected) {
      input.dispatchEvent(new Event("change", { bubbles: true }));
      try { input.blur(); } catch (_) {}
    }
  }

  function attachNumPad(input, opts = {}) {
    input.readOnly = true;
    input.setAttribute("inputmode", "none");
    input.classList.add("num-tap");
    input._numpadOpts = opts;
    const open = () => {
      if (numpadState && numpadState.input === input) return;
      openNumPad(input);
    };
    input.addEventListener("click", open);
    input.addEventListener("focus", open);
  }

  function openNumPad(input) {
    closeNumPad();
    const opts = input._numpadOpts || {};
    const step = opts.step || 1;
    const decimals = !!opts.decimals;
    const allowMinus = !!opts.allowMinus;
    const unit = opts.unit || "";
    // A range config — { min, max, frac?, tens? } — or null for the digit
    // keypad. Anything else (a bare name, a partial object) would reach the
    // clamp as undefined and turn the value into NaN, so refuse it here and
    // fall back to the keypad: a caller that gets this wrong should lose the
    // wheel, not the ability to enter a number.
    const wheelCfg = opts.wheel;
    const wheelUsable = !!wheelCfg && typeof wheelCfg === "object" &&
      Number.isFinite(wheelCfg.min) && Number.isFinite(wheelCfg.max) && wheelCfg.max > wheelCfg.min;
    if (wheelCfg && !wheelUsable) {
      console.warn("openNumPad: ignoring unusable wheel config", wheelCfg, "for", opts.label || opts.unit || input);
    }
    const wheelMode = wheelUsable ? wheelCfg : null;
    let raw = input.value || "";
    let fresh = true; // first digit replaces the current value

    const phNum = parseFloat(input.placeholder);
    const seed = isNaN(phNum) ? 0 : phNum;

    const commit = () => {
      // Number inputs reject partial values like "142." or "-" — commit the
      // parseable part while the display keeps showing what was typed.
      let out = raw;
      if (out.endsWith(".")) out = out.slice(0, -1);
      if (out === "-") out = "";
      input.value = out;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    };

    const fmt = (v) => {
      const r = Math.round(v * 100) / 100;
      return String(r);
    };

    const haptic = (ms = 8) => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (_) {} };

    const display = el("div", { class: "numpad-value", "data-testid": "numpad-value" });
    const updateDisplay = () => {
      clear(display);
      if (raw === "") {
        display.appendChild(el("span", { class: "numpad-ph" }, isNaN(phNum) ? "0" : String(phNum)));
      } else {
        display.appendChild(el("span", {}, raw));
      }
      if (unit) display.appendChild(el("span", { class: "numpad-unit" }, unit));
    };

    const nudge = (dir) => {
      const base = raw !== "" ? (parseFloat(raw) || 0) : seed;
      let v = base + dir * step;
      if (!allowMinus && v < 0) v = 0;
      raw = fmt(v);
      // Keep "fresh" so typing right after a stepper starts a new number
      commit(); updateDisplay();
    };

    const setRaw = (v) => { raw = fmt(Number(v)); fresh = true; commit(); updateDisplay(); };

    const press = (key) => {
      if (key === "back") {
        raw = fresh ? "" : raw.slice(0, -1);
        fresh = false;
      } else if (key === "sign") {
        if (raw.startsWith("-")) raw = raw.slice(1);
        else raw = raw === "" ? "-" : "-" + raw;
        fresh = false;
      } else if (key === ".") {
        if (!decimals) return;
        if (fresh || raw === "") { raw = "0."; }
        else if (!raw.includes(".")) { raw += "."; }
        fresh = false;
      } else { // digit
        if (fresh) raw = key;
        else if (raw.replace(/[-.]/g, "").length < 6) raw += key;
        fresh = false;
      }
      haptic(6);
      commit(); updateDisplay();
    };

    // A pad opened for a field that is not part of a row of fields (the guided
    // runner's single number) must not offer "Next →". Without this the scope
    // falls back to the whole document and it lands on some unrelated input
    // behind the overlay.
    const nextInput = opts.noNext ? null : (() => {
      const scope = input.closest(".exercise-block-body") || input.closest(".modal") || document;
      const all = [...scope.querySelectorAll("input.num-tap")].filter(x => x.offsetParent !== null || x === input);
      const i = all.indexOf(input);
      return i >= 0 && i < all.length - 1 ? all[i + 1] : null;
    })();

    const overlay = el("div", {
      class: "numpad-overlay",
      on: { click: (e) => { if (e.target === overlay) closeNumPad(); } }
    });

    const mkKey = (label, key, cls) => el("button", {
      type: "button",
      class: "numpad-key" + (cls ? ` ${cls}` : ""),
      "data-testid": `numpad-${key === "." ? "dot" : key}`,
      on: { click: () => press(key) }
    }, label);

    const rows = [["7","8","9"],["4","5","6"],["1","2","3"]];
    const grid = el("div", { class: "numpad-grid" });
    for (const r of rows) for (const k of r) grid.appendChild(mkKey(k, k));
    if (allowMinus) grid.appendChild(mkKey("±", "sign", "numpad-key-fn"));
    else if (decimals) grid.appendChild(mkKey(".", ".", "numpad-key-fn"));
    else grid.appendChild(el("span", { class: "numpad-spacer" }));
    grid.appendChild(mkKey("0", "0"));
    grid.appendChild(el("button", {
      type: "button", class: "numpad-key numpad-key-fn", "data-testid": "numpad-back",
      "aria-label": "Delete last digit",
      html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>',
      on: { click: () => press("back") }
    }));

    const minus = el("button", { type: "button", class: "numpad-step", "data-testid": "numpad-minus", "aria-label": `Decrease by ${step}` }, `−${step}`);
    const plus = el("button", { type: "button", class: "numpad-step", "data-testid": "numpad-plus", "aria-label": `Increase by ${step}` }, `+${step}`);
    // Press-and-hold to repeat (spin reps/weight quickly). One buzz on press.
    const holdRepeat = (btn, dir) => {
      let to = null, iv = null;
      const stop = () => { if (to) clearTimeout(to); if (iv) clearInterval(iv); to = iv = null; };
      btn.addEventListener("pointerdown", (e) => {
        e.preventDefault(); nudge(dir); haptic(10);
        to = setTimeout(() => { iv = setInterval(() => nudge(dir), 90); }, 380);
      });
      for (const ev of ["pointerup", "pointerleave", "pointercancel"]) btn.addEventListener(ev, stop);
    };
    holdRepeat(minus, -1); holdRepeat(plus, 1);

    // ---- Wheel mode: spin kg/reps instead of typing ----
    // Weight uses two wheels (whole kg + .00/.25/.50/.75) so any 0.25 step is
    // reachable; reps uses a single 1–60 wheel. Seeds from the current value or
    // the previous-session placeholder, and commits it so it's the default.
    let applyValueToWheels = null;
    const caption = el("div", { class: "numpad-wheel-caption" });
    // wheelMode is a config: { min, max, frac } — frac "quarter"|"tenth" adds a
    // second column for decimals; omitted = single integer wheel.
    function buildWheelArea() {
      const wc = wheelMode;
      const iv = raw !== "" ? parseFloat(raw) : seed;
      if (wc.frac) {
        const denom = wc.frac === "tenth" ? 10 : 4;
        const fracItems = (wc.frac === "tenth"
          ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => ({ value: n / 10, label: "." + n }))
          : [0, 1, 2, 3].map(n => ({ value: n / 4, label: "." + String(n * 25).padStart(2, "0") })));
        let whole = Math.floor(iv || 0);
        let frac = Math.round(((iv || 0) - whole) * denom) / denom;
        if (frac >= 1) { whole += 1; frac = 0; }
        let syncW = () => {}; // reassigned per layout below; fracWheel calls it at runtime
        const fracWheel = buildWheel({ items: fracItems, value: frac, variant: "wheel-sheet", itemHeight: 44, testid: "numpad-wheel-frac", onChange: (v) => { frac = v; syncW(); } });

        // Weight: split the whole number into a tens wheel + a ones wheel so
        // heavy loads are a quick spin instead of a long single-column scroll.
        if (wc.tens && wc.min >= 0) {
          const maxTens = Math.floor(wc.max / 10) * 10;
          let tens = Math.floor(whole / 10) * 10;
          let ones = whole - tens;
          syncW = () => { whole = tens + ones; const w = whole + frac; raw = fmt(w); fresh = true; commit(); caption.textContent = `${fmt(w)} ${unit}`.trim(); };
          const tensWheel = buildWheel({ items: wheelRange(0, maxTens, 10), value: tens, variant: "wheel-sheet", itemHeight: 44, testid: "numpad-wheel-tens", onChange: (v) => { tens = v; syncW(); } });
          const onesWheel = buildWheel({ items: wheelRange(0, 9, 1), value: ones, variant: "wheel-sheet", itemHeight: 44, testid: "numpad-wheel-ones", onChange: (v) => { ones = v; syncW(); } });
          applyValueToWheels = (val) => {
            let wl = Math.floor(val); let fr = Math.round((val - wl) * denom) / denom;
            if (fr >= 1) { wl += 1; fr = 0; }
            wl = Math.max(0, Math.min(wc.max, wl));
            tens = Math.floor(wl / 10) * 10; ones = wl - tens; frac = fr;
            tensWheel.setValue(tens); onesWheel.setValue(ones); fracWheel.setValue(fr); syncW();
          };
          syncW();
          return el("div", { class: "numpad-wheel-cols numpad-wheel-cols-tens" },
            el("div", { class: "numpad-wheel-col numpad-wheel-tensw" }, tensWheel.el),
            el("div", { class: "numpad-wheel-col numpad-wheel-onesw" }, onesWheel.el),
            el("div", { class: "numpad-wheel-col numpad-wheel-fracw" }, fracWheel.el),
            el("div", { class: "numpad-wheel-unit" }, unit)
          );
        }

        syncW = () => { const w = whole + frac; raw = fmt(w); fresh = true; commit(); caption.textContent = `${fmt(w)} ${unit}`.trim(); };
        const wholeWheel = buildWheel({ items: wheelRange(wc.min, wc.max, 1), value: whole, variant: "wheel-sheet", itemHeight: 44, testid: "numpad-wheel-whole", onChange: (v) => { whole = v; syncW(); } });
        applyValueToWheels = (val) => {
          let wl = Math.floor(val); let fr = Math.round((val - wl) * denom) / denom;
          if (fr >= 1) { wl += 1; fr = 0; }
          whole = wl; frac = fr; wholeWheel.setValue(wl); fracWheel.setValue(fr); syncW();
        };
        syncW();
        return el("div", { class: "numpad-wheel-cols" },
          el("div", { class: "numpad-wheel-col numpad-wheel-whole" }, wholeWheel.el),
          el("div", { class: "numpad-wheel-col numpad-wheel-fracw" }, fracWheel.el),
          el("div", { class: "numpad-wheel-unit" }, unit)
        );
      }
      // Single integer wheel
      let cur = Math.max(wc.min, Math.min(wc.max, Math.round(iv || wc.min)));
      const w = buildWheel({ items: wheelRange(wc.min, wc.max, 1), value: cur, variant: "wheel-sheet", itemHeight: 44, testid: "numpad-wheel-int", onChange: (v) => { raw = String(v); fresh = true; commit(); caption.textContent = `${v} ${unit}`.trim(); } });
      applyValueToWheels = (val) => { const rv = Math.max(wc.min, Math.min(wc.max, Math.round(val))); w.setValue(rv); raw = String(rv); fresh = true; commit(); caption.textContent = `${rv} ${unit}`.trim(); };
      raw = String(cur); fresh = true; commit(); caption.textContent = `${cur} ${unit}`.trim();
      return el("div", { class: "numpad-wheel-single" }, w.el);
    }
    const applyValue = (v) => { if (wheelMode && applyValueToWheels) applyValueToWheels(v); else setRaw(v); haptic(12); };

    // Quick-fill chips (previous set / last session) — one tap fills the value.
    const chipList = Array.isArray(opts.chips) ? opts.chips.filter(c => c && c.value != null) : [];
    const chipsRow = chipList.length ? el("div", { class: "numpad-chips" },
      ...chipList.map(c => el("button", {
        type: "button", class: "numpad-chip", "data-testid": `numpad-chip-${c.value}`,
        on: { click: () => applyValue(c.value) }
      }, c.label))
    ) : null;
    const hintEl = opts.hint ? el("div", { class: "numpad-hint text-xs text-faint" }, opts.hint) : null;

    const doneBtn = el("button", {
      type: "button", class: "btn numpad-done", "data-testid": "numpad-done",
      on: { click: () => closeNumPad() }
    }, "Done");
    const nextBtn = nextInput ? el("button", {
      type: "button", class: "btn btn-primary numpad-next", "data-testid": "numpad-next",
      on: { click: () => { closeNumPad(); openNumPad(nextInput); } }
    }, "Next \u2192") : null;
    // On the reps field, log the whole set in one tap (preferred over Next).
    const logSet = () => { commit(); haptic(25); closeNumPad(); opts.onLogSet(); };
    const logBtn = (typeof opts.onLogSet === "function") ? el("button", {
      type: "button", class: "btn btn-primary numpad-log", "data-testid": "numpad-logset",
      on: { click: logSet }
    }, "Log set \u2713") : null;

    const middle = wheelMode
      ? [caption, buildWheelArea()]
      : [el("div", { class: "numpad-display-row" }, minus, display, plus), grid];
    const sheet = el("div", { class: "numpad-sheet" + (wheelMode ? " numpad-sheet-wheel" : ""), "data-testid": "numpad" },
      el("div", { class: "numpad-label" }, opts.label || "Enter value"),
      hintEl,
      chipsRow,
      ...middle,
      el("div", { class: "numpad-actions" }, doneBtn, logBtn || nextBtn)
    );
    overlay.appendChild(sheet);
    document.body.appendChild(overlay);
    updateDisplay();

    const keyHandler = (e) => {
      if (!wheelMode && e.key >= "0" && e.key <= "9") { press(e.key); }
      else if (!wheelMode && e.key === ".") { press("."); }
      else if (!wheelMode && e.key === "-") { if (allowMinus) press("sign"); }
      else if (!wheelMode && e.key === "Backspace") { press("back"); }
      else if (!wheelMode && e.key === "ArrowUp") { nudge(1); }
      else if (!wheelMode && e.key === "ArrowDown") { nudge(-1); }
      else if (e.key === "Enter") { if (logBtn) { logSet(); } else if (nextInput) { closeNumPad(); openNumPad(nextInput); } else closeNumPad(); }
      else if (e.key === "Escape") { closeNumPad(); }
      else if (e.key === "Tab") { return; }
      else return;
      e.preventDefault(); e.stopPropagation();
    };
    document.addEventListener("keydown", keyHandler, true);
    numpadState = { overlay, input, keyHandler };
  }

  /**
   * The full-screen "fork in the road": the screen splits into panels, one per
   * route, chosen by tapping or by swiping toward the side you want.
   *
   * Extracted so the + and the Learn tab are the same object rather than two
   * that resemble each other. A second hand-rolled copy is how the swipe
   * threshold, the Escape handler and the did-swipe-so-suppress-the-tap guard
   * end up subtly different on one of them.
   *
   * `panels` are given outermost-first; a swipe picks the first or the last,
   * which is what "toward the side you want" means with two or with three.
   */
  function openForkSheet({ label, testid, panels, tip }) {
    const overlay = el("div", { class: "qa-fork-overlay", "data-testid": testid, role: "dialog", "aria-modal": "true", "aria-label": label });
    function onKey(e) { if (e.key === "Escape") { e.preventDefault(); close(); } }
    let release = null;
    const close = () => {
      document.removeEventListener("keydown", onKey, true);
      overlay.remove();
      if (release) { release(); release = null; }
    };
    document.addEventListener("keydown", onKey, true);

    const CLOSE_ART = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>`;
    const nodes = panels.map((p) => el("button", {
      class: `qa-fork-panel ${p.cls}`, "data-testid": p.testid,
      on: { click: () => { close(); p.onPick(); } }
    },
      el("span", { class: "qa2-art", html: p.art }),
      el("span", { class: "qa2-label" }, p.label),
      el("span", { class: "qa2-sub" }, p.sub)
    ));
    for (const n of nodes) overlay.appendChild(n);
    overlay.appendChild(el("button", { class: "qa-fork-close", "aria-label": "Close", title: "Close", html: CLOSE_ART, on: { click: close } }));

    if (tip) overlay.appendChild(tip);

    const CHEV_L = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
    const CHEV_R = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
    overlay.appendChild(el("div", { class: "qa-fork-hint", "aria-hidden": "true" },
      el("span", { class: "qa-fork-chev qa-fork-chev-l", html: CHEV_L }),
      el("span", { class: "qa-fork-hint-text" }, "Swipe or tap"),
      el("span", { class: "qa-fork-chev qa-fork-chev-r", html: CHEV_R })
    ));

    // Swipe toward the side you want: left picks the first panel, right the last.
    const first = nodes[0], last = nodes[nodes.length - 1];
    let sx = 0, sy = 0, swiping = false, didSwipe = false;
    overlay.addEventListener("touchstart", (e) => {
      if (e.touches.length !== 1) { swiping = false; return; }
      sx = e.touches[0].clientX; sy = e.touches[0].clientY; swiping = true; didSwipe = false;
    }, { passive: true });
    overlay.addEventListener("touchend", (e) => {
      if (!swiping) return; swiping = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      didSwipe = true;
      const idx = dx < 0 ? 0 : panels.length - 1;
      nodes[idx].classList.add("qa2-chosen");
      setTimeout(() => { close(); panels[idx].onPick(); }, 140);
    }, { passive: true });
    // A swipe that ends on a panel shouldn't also fire its tap.
    [first, last].forEach((n) => n.addEventListener("click", (e) => {
      if (didSwipe) { e.preventDefault(); e.stopPropagation(); }
    }, true));

    document.body.appendChild(overlay);
    release = trapFocus(overlay);
    return { close };
  }

  function openQuickSheet() {
    if (state.tab === "workout") { renderMain(); window.scrollTo(0, 0); return; }
    const go = (tab, after) => { goTab(tab); window.scrollTo(0, 0); if (after) setTimeout(after, 260); };
    // Teach the shortcut at the one moment someone is demonstrably in the
    // market for it — they are here, taking the long way to these same three
    // choices. It stops appearing the first time the hold is actually used,
    // so it is never advice you have already taken.
    const tip = (state.prefs && !state.prefs.radialDiscovered)
      ? el("div", { class: "qa-fork-tip", "data-testid": "quick-sheet-tip" },
          el("span", { class: "qa-fork-tip-hold", "aria-hidden": "true" }),
          el("span", {}, "Next time, "),
          el("strong", {}, "hold the +"),
          el("span", {}, " to jump straight there."))
      : null;
    openForkSheet({
      label: "Quick actions", testid: "quick-sheet", tip,
      panels: [
        {
          cls: "qa2-workout", testid: "quick-start-workout", art: QA_ART.workout,
          label: state.activeWorkout ? "Resume workout" : "Start workout",
          sub: state.activeWorkout ? "Pick up where you left off" : "Pick an exercise to begin",
          onPick: () => go("workout")
        },
        {
          cls: "qa2-sessions", testid: "quick-sessions", art: QA_ART.sessions,
          label: "Sessions", sub: "Ready-made workouts",
          onPick: () => go("workout", openSessionsSheet)
        },
        {
          cls: "qa2-meal", testid: "quick-log-meal", art: QA_ART.meal,
          label: "Log meal", sub: "Add food to today",
          onPick: () => go("nutrition")
        }
      ]
    });
  }

  /**
   * The Learn tab holds two quite different things stacked on one page — the
   * reading, then the exercise library with the body map at its head — and the
   * map sits below the fold, so arriving on the tab only ever showed you one
   * of them. Same fork as the +, two ways instead of three.
   */
  function openLearnFork() {
    const go = (after) => { jumpTo("library", after); };
    openForkSheet({
      label: "Learn", testid: "learn-fork",
      panels: [
        {
          cls: "qa2-learn", testid: "learn-fork-centre", art: QA_ART.learn,
          label: "Learning Centre", sub: "Why the training works, and what the numbers mean",
          onPick: () => go(() => window.scrollTo(0, 0))
        },
        {
          cls: "qa2-bodymap", testid: "learn-fork-bodymap", art: QA_ART.bodymap,
          label: "Body map", sub: "Tap a muscle to find exercises for it",
          onPick: () => go(() => scrollToTestId("body-map"))
        }
      ]
    });
  }

  // ============ Radial hold menu ============
  //
  // Hold a control, flick toward what you want, let go. The payoff is not that
  // a menu appears — it is that after a few uses the choice stops being a
  // target you read and becomes a direction you throw your thumb in. Every
  // slice sits at the same distance and the same angular width, so selection
  // time stops depending on which one you want.
  //
  // That only pays off when the item set is small and, more importantly,
  // *fixed*: if the slices ever reorder, muscle memory never forms and this is
  // just a slower sheet. So callers pass a static list, never a sorted one.
  //
  // It is always a shortcut, never the only way. The control keeps its own tap
  // behaviour, which is also the accessible route — a long press has no
  // keyboard equivalent and fights VoiceOver, so the tap path is the one that
  // has to reach everything.
  const RADIAL_HOLD_MS = 420;   // under ~300 and ordinary taps start firing it
  const HUB_R = 40;             // the centre disc on a ring menu
  const RADIAL_HINT_MS = 130;   // a crisp tap is over before the hint appears
  const RADIAL_SLOP = 10;       // px of movement that means "this was a scroll"
  const RADIAL_DEAD = 42;       // px around the centre that selects nothing
  const RADIAL_SWAP_MS = 170;   // how long the outgoing spokes take to leave

  function attachRadial(trigger, opts) {
    // Items may be a function when the menu has more than one level — the
    // spokes are then resolved at open time rather than frozen at attach time.
    const itemsOf = () => (typeof opts.items === "function" ? opts.items() : (opts.items || [])).filter(Boolean);
    if (!trigger || !itemsOf().length) return null;
    trigger.classList.add("has-radial");
    // A trigger inside a scroller must keep its touch-action, or a drag that
    // happens to start on it silently refuses to scroll the page. The 10px
    // slop and pointercancel do the work instead — slightly later, but a hold
    // that occasionally needs a second try beats a control that eats swipes.
    if (opts.scrollable) trigger.classList.add("radial-scrolls");

    // A deadline rather than a flag. The click that follows a hold is swallowed
    // so the control's own tap action does not also fire — but that click only
    // arrives if the pointerup lands back on the trigger, and once the menu is
    // up the scrim can take it instead. A boolean would then stay armed and eat
    // the next genuine tap, minutes later. A deadline cannot.
    let timer = null, hintTimer = null, open = null, startX = 0, startY = 0, moved = false, suppressUntil = 0;

    const clearTimer = () => {
      if (timer) { clearTimeout(timer); timer = null; }
      if (hintTimer) { clearTimeout(hintTimer); hintTimer = null; }
      hideHint();
    };
    const buzz = (ms) => { try { navigator.vibrate && navigator.vibrate(ms); } catch (_) {} };

    // close() never arms the suppression. Only a pointer sequence that began
    // on the trigger produces a click for us to swallow — a slice tap does
    // not, and arming it there left the next real tap on the control dead.
    function close() {
      if (!open) return;
      const o = open;
      open = null;
      document.removeEventListener("keydown", o.onKey, true);
      document.removeEventListener("pointermove", o.onMove, true);
      o.overlay.remove();
    }

    // The press hint. Nothing on screen says this control can be held, and for
    // the whole 420ms a hold currently gives no feedback at all — so a press
    // that stops just short feels like the app ignored you.
    //
    // A ring fills around the trigger, and past the halfway mark the slices
    // ghost outward from it. Anyone whose thumb lingers discovers the menu by
    // accident and never has to be told; anyone who taps crisply never sees it,
    // because it does not start until 130ms in.
    let hint = null;
    function hideHint() {
      if (!hint) return;
      hint.remove();
      hint = null;
    }
    function showHint() {
      if (hint || open) return;
      const r = trigger.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const RING = 34, SW = 3, box = (RING + SW) * 2;
      const circ = 2 * Math.PI * RING;
      const wrap = el("div", { class: "radial-hint", "data-testid": "radial-hint", "aria-hidden": "true" });

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", `0 0 ${box} ${box}`);
      svg.setAttribute("class", "radial-hint-ring");
      svg.style.cssText = `left:${cx}px; top:${cy}px; width:${box}px; height:${box}px`;
      for (const [cls, extra] of [["radial-hint-track", ""], ["radial-hint-fill", `stroke-dasharray:${circ}; stroke-dashoffset:${circ}`]]) {
        const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        c.setAttribute("cx", box / 2); c.setAttribute("cy", box / 2);
        c.setAttribute("r", RING); c.setAttribute("class", cls);
        if (extra) c.style.cssText = extra;
        svg.appendChild(c);
      }
      // The fill is the remaining hold, honestly: it starts when the hint does
      // and completes exactly when the menu opens.
      svg.querySelector(".radial-hint-fill").style.animation =
        `radialHintFill ${RADIAL_HOLD_MS - RADIAL_HINT_MS}ms linear forwards`;
      wrap.appendChild(svg);

      for (const [i, p] of layout(cx, cy, itemsOf()).entries()) {
        const g = el("div", {
          class: "radial-hint-ghost",
          style: `left:${p.x}px; top:${p.y}px; animation-delay:${(RADIAL_HOLD_MS - RADIAL_HINT_MS) * 0.35 + i * 26}ms`
        }, el("span", { class: "radial-slice-ic", html: p.item.icon || "" }));
        wrap.appendChild(g);
      }
      document.body.appendChild(wrap);
      hint = wrap;
    }

    // Where the slices go. Shared by the menu and by the press hint, because a
    // hint whose ghosts point somewhere the real slices do not is worse than
    // no hint — it teaches the wrong gesture.
    //
    // Angles are measured from straight up, because up is the only direction
    // guaranteed to be free: every trigger lives in a fixed dock at the bottom
    // of the screen, so anything placed below one is under the home indicator.
    //
    // A symmetric fan is right for the centre button and wrong for everything
    // else. The dock's outer items sit ~60px from the edge, and a fan wide
    // enough to be comfortable there puts its outermost slice off-screen — so
    // the arc is fitted to the room actually available on each side and slides
    // inward when one side runs out. From the middle you get a fan; from the
    // left-hand tab you get a quarter turn opening up and to the right.
    const SLICE_HALF = 46;   // widest a slice box gets, including its label
    const EDGE = 6;
    // Past ±52° a slice stops clearing the dock — which is a fact about the
    // dock, not about radials. A trigger with room all round can open into a
    // much wider sweep, and needs to: seven 64px slices do not fit inside 104°
    // on a 390px screen at any radius, so the fan silently degraded into a row
    // of overlapping circles.
    const MAX_PHI = Number.isFinite(opts.sweep) ? opts.sweep : 52;

    /** A full ring instead of an arc.
     *
     *  An arc has to fit every slice into the angle the screen leaves above
     *  the trigger, and seven of them do not fit in 390px: the comment on
     *  MAX_PHI is the scar from finding that out. A ring has the whole 360° to
     *  spend, so seven spokes sit 51 degrees apart instead of thirty, and the
     *  radius can come in rather than being pushed out until the labels stop
     *  colliding.
     *
     *  Which leaves the middle empty, so it says what the menu is for.
     *
     *  Centred on the screen, not on the trigger. An arc hangs off whatever
     *  you pressed because it has a direction; a ring does not, and one hung
     *  off a control near the top of the screen sits high with its lower half
     *  over the content it came from. Centred, it reads as a thing in its own
     *  right and every spoke is the same reach from the middle.
     *
     *  Which does mean the centre is nowhere near the thumb, so aiming waits
     *  for real movement — see the guard in aim(). */
    function ringLayout(_cx, _cy, items) {
      const n = items.length;
      const vw = window.innerWidth || 390;
      const vh = window.innerHeight || 844;
      // Full size, whatever the menu asked for. `compact` exists because an
      // arc could not fit seven 64px slices into the angle above the trigger;
      // a ring can — seven of them need a radius of about 90 and there is 135
      // to play with — so the reason for shrinking them does not apply here.
      const ICON = 64;
      const PAD = ICON / 2 + 22;           // half a slice, plus its label
      // Enough circumference for every slice, and never so tight that the
      // centre disc touches the ring.
      const rMin = Math.max(84, (n * (ICON + 16)) / (2 * Math.PI), HUB_R + ICON / 2 + 10);
      const rMax = Math.max(rMin, Math.min(vw / 2 - EDGE - PAD, (vh - 84) / 2 - EDGE - PAD));
      const at = (r, rx, ry) => items.map((it, i) => {
        // First slice at twelve o'clock, then clockwise — the order they were
        // written in reads top-down, the way a list would.
        const phi = -Math.PI / 2 + (2 * Math.PI / n) * i;
        return { item: it, x: rx + Math.cos(phi) * r, y: ry + Math.sin(phi) * r };
      });
      // Middle of the screen, lifted clear of the dock so the lowest spoke's
      // label is not sitting on the tab bar.
      const DOCK = 84;
      const cx = vw / 2;
      const cy = (vh - DOCK) / 2;
      const place = (r) => ({
        rx: Math.max(EDGE + PAD + r, Math.min(vw - EDGE - PAD - r, cx)),
        ry: Math.max(EDGE + PAD + r, Math.min(vh - DOCK - EDGE - PAD - r, cy))
      });
      for (let r = rMin; r <= rMax + 0.01; r += 6) {
        const { rx, ry } = place(r);
        const pts = at(r, rx, ry);
        if (legibleRing(pts, ICON)) return { pts, cx: rx, cy: ry, r };
      }
      const r = rMax;
      const { rx, ry } = place(r);
      return { pts: at(r, rx, ry), cx: rx, cy: ry, r };
    }
    /** Circles apart AND labels clear, the same two failures the arc guards.
     *
     *  Circles alone looked sufficient while the slices were 48px: they touch
     *  before the labels reach anything. At 64px that reverses — "Shoulders"
     *  is wider than the circle it belongs to and lands on its neighbour while
     *  the circles are still comfortably apart. Checked in the same terms the
     *  layout renders: a slice is icon, a 6px gap, then a 16px label, the lot
     *  centred on the placed point. */
    function legibleRing(pts, ICON) {
      // LPAD: a ring label sits on a pill rather than bare text, which makes it
      // wider than the string. Modelled here or the pills touch at the radius
      // this says is fine.
      const LGAP = 6, LH = 20, LPAD = 16, H = ICON + LGAP + LH;
      const box = (p) => {
        const w = Math.max(40, String(p.item.label || "").length * 7) + LPAD;
        return {
          icon: { l: p.x - ICON / 2, r: p.x + ICON / 2, t: p.y - H / 2, b: p.y - H / 2 + ICON },
          label: { l: p.x - w / 2, r: p.x + w / 2, t: p.y + H / 2 - LH, b: p.y + H / 2 }
        };
      };
      const hits = (a, b) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
      const bs = pts.map(box);
      for (let i = 0; i < pts.length; i++) {
        for (let j = 0; j < pts.length; j++) {
          if (i === j) continue;
          if (hits(bs[i].label, bs[j].icon)) return false;
          if (j > i) {
            if (hits(bs[i].label, bs[j].label)) return false;
            // Circles compared as circles: two slices offset diagonally have
            // bounding boxes that clip corners while the discs are well clear.
            if (Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y) < ICON + 14) return false;
          }
        }
      }
      return true;
    }

    function layout(cx, cy, items) {
      const n = items.length;
      const natural = n === 1 ? 0 : Math.min(150, 44 * (n - 1));
      const vw = window.innerWidth || 390;

      const build = (r, vs) => {
        const roomL = Math.max(0, cx - EDGE - SLICE_HALF);
        const roomR = Math.max(0, vw - EDGE - SLICE_HALF - cx);
        const deg = (v) => Math.asin(Math.min(1, v)) * 180 / Math.PI;
        const lo = -Math.min(MAX_PHI, deg(roomL / r));
        const hi = Math.min(MAX_PHI, deg(roomR / r));
        if (hi - lo <= 0) return null;
        const span = Math.min(natural, hi - lo);
        let start = -span / 2;                    // centred on straight up...
        if (start < lo) start = lo;               // ...unless a side is short
        if (start + span > hi) start = hi - span;
        return items.map((it, i) => {
          const phi = (n === 1 ? (lo + hi) / 2 : start + (span / (n - 1)) * i) * Math.PI / 180;
          // 104 put the aimed slice, scaled up, into its neighbour's label.
          return { item: it, x: cx + Math.sin(phi) * r, y: cy + vs * Math.cos(phi) * r };
        });
      };

      // Near an edge the fan gets compressed and the slices bunch up. Angular
      // room cannot grow, but arc length can — separation is r * delta-phi, so
      // pushing the radius out is the only lever left.
      //
      // How far out is decided by the thing that actually breaks, rather than
      // by a guessed minimum gap: a slice's label is wider than its circle, so
      // it goes under the *next slice's circle* long before the circles
      // themselves touch. Boxes are modelled here in the same terms the layout
      // renders them, and the first radius where nothing covers a label wins.
      // As laid out in CSS. A seven-spoke wheel does not fit on a 390px screen
      // at full size — the widest achievable gap between adjacent centres is
      // about 62px against the 66px two 64px circles need — so a menu that big
      // asks for compact slices and gets 48px ones.
      const ICON = opts.compact ? 48 : 64, LGAP = 6, LH = 16;
      const boxes = (p) => {
        const w = Math.max(40, String(p.item.label || "").length * 7);
        return {
          icon: { l: p.x - ICON / 2, r: p.x + ICON / 2, t: p.y - (ICON + LGAP + LH) / 2, b: p.y - (ICON + LGAP + LH) / 2 + ICON },
          label: { l: p.x - w / 2, r: p.x + w / 2, t: p.y + (ICON + LGAP + LH) / 2 - LH, b: p.y + (ICON + LGAP + LH) / 2 }
        };
      };
      const overlaps = (a, b) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
      const legible = (pts) => {
        const bs = pts.map(boxes);
        for (let i = 0; i < bs.length; i++) {
          for (let j = 0; j < bs.length; j++) {
            if (i === j) continue;
            if (overlaps(bs[i].label, bs[j].icon)) return false;
            if (j > i && overlaps(bs[i].label, bs[j].label)) return false;
            // Icon on icon. This was missing, and stayed invisible for as
            // long as every menu had four slices or fewer: with a short arc
            // the labels — which are wider than the circles — always collided
            // first, so the check appeared to be doing the work. At seven
            // spokes the circles overlap while the labels still clear, and one
            // slice ends up sitting on top of its neighbour, unclickable.
            //
            // Compared as circles, not boxes. Slices on an arc are offset
            // diagonally, so two circles a comfortable 50px apart still have
            // bounding boxes that clip corners — rejecting on that pushes the
            // radius out past anything that fits and lands back in the
            // degraded branch this was written to avoid.
            if (j > i && Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y) < ICON + 2) return false;
          }
        }
        return true;
      };
      const vh = window.innerHeight || 844;
      const onScreen = (pts) => pts.every(p => p.y - 48 >= EDGE && p.y + 48 <= vh - EDGE);

      // Up first, always: a menu that covers the control you just pressed is
      // worse than one above it, and every trigger that existed when this was
      // written sat low enough for a fan above it to fit.
      //
      // The downward flip is back, and this time there is something that needs
      // it. The body-part dial lives at the TOP of the picker screen with
      // seven spokes; no upward arc both clears the status bar and keeps the
      // circles off each other, so it used to fall through to the degraded
      // branch and hand back an arc with two slices stacked. Trying down only
      // after up has failed keeps every existing menu exactly where it was.
      const base = opts.radius || 114;
      for (const vs of [-1, 1]) {
        for (let k = 1; k <= 2.4; k += 0.08) {
          const pts = build(base * k, vs);
          if (pts && onScreen(pts) && legible(pts)) return pts;
        }
      }
      // Nothing fully legible fits either way; take the widest arc that is
      // still on screen rather than refusing to open.
      for (const vs of [-1, 1]) {
        for (let k = 2.4; k >= 0.8; k -= 0.1) {
          const pts = build(base * k, vs);
          if (pts && onScreen(pts)) return pts;
        }
      }
      return build(base, -1) || [];
    }

    /** Draw the spokes into an overlay, reusing whatever furniture is there.
     *
     *  Split out of openMenu so that a menu with levels can repaint inside the
     *  surface it is already showing. `prev` is the open menu's own record when
     *  this is a repaint and null when it is a first paint; the ring line and
     *  the hub come from it rather than being rebuilt, because both carry an
     *  entrance animation and re-adding them replays it. */
    function paintMenu(overlay, cx, cy, prev) {
      const items = itemsOf();
      if (!items.length) return null;
      // A ring once there are enough spokes to make an arc cramped, or when a
      // menu asks for one. Three items in a full circle would be three points
      // of a triangle with a hole in the middle — worse than the fan.
      const asRing = opts.ring === true || (opts.ring !== false && items.length >= 6);
      const ring = asRing ? ringLayout(cx, cy, items) : null;
      const pts = ring ? ring.pts : layout(cx, cy, items);
      const ax = ring ? ring.cx : cx, ay = ring ? ring.cy : cy;
      // `radial-compact` depends on whether this is a ring: a ring restores
      // full-size slices even for a menu that asked to be compact, because the
      // constraint that shrank them was the arc.
      overlay.classList.toggle("radial-compact", !!(opts.compact && !ring));
      overlay.classList.toggle("radial-ring", !!ring);
      let ringline = prev ? prev.ringline : null;
      let hub = prev ? prev.hub : null;
      if (ring) {
        // The line the spokes sit on. Without it this is seven circles and a
        // word that happen to be arranged in a circle; with it, it is a dial.
        // Drawn from the same radius the layout settled on, so it cannot drift
        // away from the slices it is threading — and resized rather than
        // replaced between levels, so the dial visibly changes gear instead of
        // blinking out and back.
        if (!ringline) {
          ringline = el("div", { class: "radial-ringline", "aria-hidden": "true" });
          overlay.appendChild(ringline);
        }
        // Sized after it exists, either way. On a first paint the browser has
        // not laid it out yet, so there is nothing for the size transition to
        // run from; on a repaint that transition is the whole point.
        Object.assign(ringline.style, {
          left: `${ax}px`, top: `${ay}px`,
          width: `${ring.r * 2}px`, height: `${ring.r * 2}px`
        });
        // The empty middle, saying what the menu is for. Not a button: the
        // dead zone was always there, and this only makes it visible.
        if (!hub) {
          hub = el("div", {
            class: "radial-hub", "data-testid": "radial-hub", "aria-hidden": "true",
            style: `width:${HUB_R * 2}px; height:${HUB_R * 2}px`
          }, el("span", {}, opts.centre || "Choose"));
          overlay.appendChild(hub);
        }
        hub.style.left = `${ax}px`;
        hub.style.top = `${ay}px`;
      }
      const slices = [];
      pts.forEach(({ item: it, x, y }) => {
        const btn = el("button", {
          class: "radial-slice", type: "button", role: "menuitem",
          "data-testid": `radial-${it.key}`,
          style: `left:${x}px; top:${y}px`,
          on: { click: (e) => { e.preventDefault(); e.stopPropagation(); choose(it); } }
        },
          el("span", { class: "radial-slice-ic", html: it.icon || "", "aria-hidden": "true" }),
          el("span", { class: "radial-slice-label" }, it.label)
        );
        overlay.appendChild(btn);
        slices.push({ btn, x, y, item: it });
      });
      return { slices, ax, ay, ring: !!ring, ringline, hub };
    }

    /** Acting on a slice. A `keepOpen` item changes what the menu is showing
     *  rather than choosing from it, so it must not tear the menu down. */
    function choose(it) {
      if (it.keepOpen) { it.onPick(); relayout(); return; }
      close();
      it.onPick();
    }

    /** Repaint the spokes for a new level, in place.
     *
     *  This used to be close() plus an open() on a zero-delay timer, and it
     *  showed: the overlay came out of the document, so the scrim, the blur,
     *  the ring and every spoke vanished for a frame and the screen behind
     *  flashed through — then the whole entrance replayed from scratch. Nothing
     *  about a level change is a new menu, so nothing about it should look like
     *  one. The surface stays up, the ring resizes, and the old spokes shrink
     *  away while the new ones grow in. */
    function relayout() {
      if (!open) return;
      const o = open;
      const dying = o.slices.map((s) => s.btn);
      for (const b of dying) { b.classList.add("is-leaving"); b.tabIndex = -1; }
      const painted = paintMenu(o.overlay, o.baseX, o.baseY, o);
      // Removed after their exit has run, not before it starts.
      setTimeout(() => { for (const b of dying) b.remove(); }, RADIAL_SWAP_MS);
      if (!painted) { close(); return; }
      o.slices = painted.slices;
      o.cx = painted.ax; o.cy = painted.ay;
      o.ring = painted.ring;
      o.ringline = painted.ringline; o.hub = painted.hub;
      o.active = null;
      // The dead-zone guard measures from where the press began, and that press
      // is long over. Measuring from the new centre is what makes aiming work
      // on the second level at all.
      o.fromX = o.cx; o.fromY = o.cy;
      buzz(8);
    }

    function openMenu(cx, cy) {
      if (open) return;
      hideHint();
      const overlay = el("div", {
        class: "radial-overlay", "data-testid": "radial-overlay",
        role: "menu", "aria-label": opts.label || "Quick actions"
      });
      const scrim = el("div", { class: "radial-scrim" });
      overlay.appendChild(scrim);

      const painted = paintMenu(overlay, cx, cy, null);
      if (!painted) return;
      const { slices, ax, ay, ring } = painted;
      // Whoever gets here has found the gesture, so stop advertising it.
      if (state.prefs && !state.prefs.radialDiscovered) {
        state.prefs.radialDiscovered = true;
        Storage.setPref("radialDiscovered", true);
      }

      const onKey = (e) => {
        if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); }
      };
      // Tracked on the document, not the trigger. Pointer capture is the tidy
      // way to keep moves coming once the thumb leaves the control, but it is
      // allowed to fail, and if it does the aim goes dead the moment you move
      // — which is the only thing this menu is for.
      const onMove = (e) => aim(e.clientX, e.clientY);
      document.addEventListener("keydown", onKey, true);
      document.addEventListener("pointermove", onMove, true);
      scrim.addEventListener("pointerdown", () => close());

      document.body.appendChild(overlay);
      // Aim from the ring's centre, which clamping may have moved away from
      // the thumb — and record where the press began, so aiming can wait for
      // the thumb to actually go somewhere.
      // baseX/baseY are where the menu was summoned from, kept so a repaint can
      // lay the next level out from the same origin the first one used.
      open = { overlay, slices, cx: ax, cy: ay, onKey, onMove, active: null,
        ring: !!ring, ringline: painted.ringline, hub: painted.hub,
        baseX: cx, baseY: cy, fromX: startX, fromY: startY };
      buzz(12);
    }

    // Which slice is the thumb pointing at? Angle, not proximity — the whole
    // point is that a direction is enough and the distance stops mattering.
    function aim(px, py) {
      if (!open) return;
      // On a ring the centre is wherever the ring fitted, not where the thumb
      // is, so the very first pointermove can already sit at a real angle from
      // it and pre-select a slice nobody aimed at. Aiming only starts once the
      // thumb has left where the press began.
      if (open.ring && Math.hypot(px - open.fromX, py - open.fromY) < RADIAL_DEAD) {
        if (open.active) {
          open.active = null;
          for (const s of open.slices) s.btn.classList.remove("is-aimed");
        }
        return;
      }
      const dx = px - open.cx, dy = py - open.cy;
      let pick = null;
      if (Math.hypot(dx, dy) >= RADIAL_DEAD) {
        const a = Math.atan2(dy, dx);
        let best = Infinity;
        for (const s of open.slices) {
          const sa = Math.atan2(s.y - open.cy, s.x - open.cx);
          let d = Math.abs(a - sa);
          if (d > Math.PI) d = 2 * Math.PI - d;
          if (d < best) { best = d; pick = s; }
        }
        // Beyond ~50 degrees off any slice, the thumb is not pointing at one.
        if (best > 0.9) pick = null;
      }
      if (pick === open.active) return;
      open.active = pick;
      for (const s of open.slices) s.btn.classList.toggle("is-aimed", s === pick);
      if (pick) buzz(6);
    }

    trigger.addEventListener("pointerdown", (e) => {
      if (e.button != null && e.button !== 0) return;
      // Something else can take the overlay out from under us — a re-render
      // that clears body-level layers, or a screen being torn down while the
      // menu is up. Holding a stale reference to a detached node makes the
      // next press "close" a menu that is not there and open nothing.
      if (open && !document.body.contains(open.overlay)) close();
      // Pressing the control again while its menu is up puts it away.
      if (open) { close(); suppressUntil = Date.now() + 500; return; }
      moved = false;
      startX = e.clientX; startY = e.clientY;
      clearTimer();
      // A radial that IS the primary way to choose must not cost a 420ms hold.
      // Hold is the right price for a shortcut nobody has to find; charging it
      // for the main path makes the app feel slow and makes the menu invisible
      // to anyone who was not told. Opened synchronously rather than on a 0ms
      // timer, so a quick tap cannot cancel it before it fires.
      if (opts.press) {
        const r0 = trigger.getBoundingClientRect();
        openMenu(r0.left + r0.width / 2, r0.top + r0.height / 2);
        try { trigger.setPointerCapture(e.pointerId); } catch (_) {}
        return;
      }
      hintTimer = setTimeout(showHint, RADIAL_HINT_MS);
      timer = setTimeout(() => {
        timer = null;
        const r = trigger.getBoundingClientRect();
        openMenu(r.left + r.width / 2, r.top + r.height / 2);
        try { trigger.setPointerCapture(e.pointerId); } catch (_) {}
      }, RADIAL_HOLD_MS);
    });

    // Movement before the menu opens is a scroll starting, not a hold.
    trigger.addEventListener("pointermove", (e) => {
      if (open || moved) return;
      if (Math.hypot(e.clientX - startX, e.clientY - startY) > RADIAL_SLOP) {
        moved = true;
        clearTimer();
      }
    });

    const release = (e) => {
      clearTimer();
      if (!open) return;
      try { trigger.releasePointerCapture(e.pointerId); } catch (_) {}
      // A click always follows this pointerup, whatever we do next, because
      // the press began on the trigger. Swallow it in every branch.
      suppressUntil = Date.now() + 500;
      const picked = open.active;
      if (picked) { choose(picked.item); return; }
      // Released in the dead centre. Having travelled means "I changed my
      // mind"; never having moved means the hold was the whole gesture, so
      // leave the menu up and let it be tapped.
      const travelled = Math.hypot(e.clientX - startX, e.clientY - startY) > RADIAL_DEAD;
      if (travelled) close();
    };
    trigger.addEventListener("pointerup", release);
    trigger.addEventListener("pointercancel", () => { clearTimer(); close(); });

    // A hold must never also fire the control's own tap action.
    trigger.addEventListener("click", (e) => {
      if (Date.now() >= suppressUntil) return;
      suppressUntil = 0;
      e.preventDefault(); e.stopPropagation();
    }, true);
    // Desktop and Android raise their own menu on a long press.
    trigger.addEventListener("contextmenu", (e) => e.preventDefault());

    // A handle, so a menu with a second level can reopen itself on the same
    // trigger instead of needing a second hidden one to hang off.
    return {
      open: () => {
        const r = trigger.getBoundingClientRect();
        if (open) close();
        openMenu(r.left + r.width / 2, r.top + r.height / 2);
      },
      close
    };
  }

  // ============ Stats shell (Trends | History) ============
  async function renderStatsShell(view) {
    // "You" tab: profile header (targets + setup/settings) then your stats.
    const headerHost = el("div", { "data-testid": "you-header" });
    view.appendChild(headerHost);
    buildYouHeader().then(node => { if (node) headerHost.appendChild(node); });

    const seg = el("div", { class: "seg-control", "data-testid": "stats-seg" },
      el("button", {
        class: "seg-btn" + (state.tab === "stats" ? " active" : ""),
        "data-testid": "seg-trends",
        on: { click: () => { state.tab = "stats"; renderMain(); } }
      }, "Trends"),
      el("button", {
        class: "seg-btn" + (state.tab === "history" ? " active" : ""),
        "data-testid": "seg-history",
        on: { click: () => { state.tab = "history"; renderMain(); } }
      }, "History")
    );
    view.appendChild(el("div", { class: "you-stats-label" }, "Your stats"));
    view.appendChild(seg);
    const inner = el("div");
    view.appendChild(inner);
    if (state.tab === "history") renderHistory(inner); else renderStats(inner);
  }

  // Profile header for the You tab — targets + setup/edit/settings entry points.
  async function buildYouHeader() {
    const today = U.todayISO();
    const energy = await resolveEnergyBudget(today);
    const macroGoals = await resolveMacroGoals(today, energy);
    const complete = U.profileComplete(state.prefs);
    const name = (state.prefs.profileName || "").trim();

    // Incomplete → hero that launches the guided setup quiz.
    if (!complete) {
      return el("div", { class: "card you-profile you-profile-setup", "data-testid": "you-profile" },
        el("div", { class: "you-avatar you-avatar-empty", html: dockIcons.person }),
        el("div", { class: "you-profile-title" }, "Set up your profile"),
        el("div", { class: "you-profile-sub" }, "Answer a few quick questions to unlock your daily targets."),
        el("button", {
          class: "btn btn-primary btn-block mt-8", "data-testid": "you-setup",
          on: { click: () => openProfileQuiz({ firstRun: false }) }
        }, "Set up profile")
      );
    }

    const goals = macroGoals?.hasGoals ? macroGoals.goals : null;
    const macroLine = goals
      ? `${Math.round(goals.protein)}P · ${Math.round(goals.carbs)}C · ${Math.round(goals.fat)}F`
      : "";
    const badge = energy.source === "manual" ? "Your number" : "Suggested";
    const initial = (name || "Y").charAt(0).toUpperCase();

    return el("div", { class: "card you-profile", "data-testid": "you-profile" },
      el("div", { class: "you-profile-top" },
        el("div", { class: "you-avatar" }, initial),
        el("div", { class: "you-profile-id" },
          el("div", { class: "you-profile-name" }, name || "Your profile"),
          el("div", { class: "you-profile-target" },
            el("strong", {}, `${(energy.goal || 0).toLocaleString("en-GB")} kcal`),
            macroLine ? el("span", { class: "you-profile-macros" }, ` · ${macroLine}` ) : null
          )
        ),
        el("div", { class: "you-profile-badge" + (badge === "Your number" ? " is-manual" : "") }, badge)
      ),
      el("div", { class: "you-profile-actions" },
        el("button", { class: "btn btn-sm you-act", "data-testid": "you-edit",
          on: { click: () => openProfileQuiz({ firstRun: false }) } },
          el("span", { html: icons.edit }), "Edit profile"),
        el("button", { class: "btn btn-sm you-act", "data-testid": "you-mynumber",
          on: { click: () => openSettings({ focusBudget: true }) } }, "My number"),
        el("button", { class: "btn btn-sm you-act you-act-gear", title: "Settings", "data-testid": "you-settings",
          on: { click: () => openSettings() }, html: icons.settings })
      )
    );
  }

  // ============ Extra icons ============
  const iconsExtra = {
    note: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>',
    plates: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="3" height="12" rx="1"/><rect x="18" y="6" width="3" height="12" rx="1"/><line x1="6" y1="12" x2="18" y2="12"/><rect x="7" y="9" width="2" height="6"/><rect x="15" y="9" width="2" height="6"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    dots: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>'
  };
  Object.assign(icons, iconsExtra);

  // ============ Muscle-group volume (last N days) ============
  // Returns [{group, sets, volume}] sorted by sets desc.
  async function computeMuscleBalance(days = 14) {
    const workouts = (await Storage.getWorkouts()).filter(w => w.completedAt);
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days);
    const all = await getAllExercises();
    const byId = new Map(all.map(e => [e.id, e]));
    // Group muscles into broader buckets so the chart stays readable.
    const BUCKETS = [
      { key: "Chest", match: /pector|chest/i },
      { key: "Back", match: /lat|rhomboid|traps?|erector|back/i },
      { key: "Shoulders", match: /deltoid|shoulder/i },
      { key: "Arms", match: /bicep|tricep|forearm|brachial/i },
      { key: "Legs", match: /quad|hamstring|glute|calf|calves|adductor|abductor|hip/i },
      { key: "Core", match: /abdominal|oblique|core|quadratus/i }
    ];
    const totals = {};
    for (const b of BUCKETS) totals[b.key] = { sets: 0, volume: 0 };
    for (const w of workouts) {
      if (new Date(w.date) < cutoff) continue;
      for (const ex of (w.exercises || [])) {
        const def = byId.get(ex.exerciseId);
        const muscles = (def?.muscles || []);
        const buckets = new Set();
        for (const m of muscles) {
          for (const b of BUCKETS) if (b.match.test(m)) buckets.add(b.key);
        }
        if (!buckets.size) continue;
        const doneSets = U.workingSets(ex.sets);
        const vol = U.volume(doneSets);
        for (const key of buckets) {
          totals[key].sets += doneSets.length;
          totals[key].volume += vol;
        }
      }
    }
    return Object.entries(totals).map(([group, v]) => ({ group, ...v }));
  }

  // Stretching and timed holds are training, but they are not what "which
  // muscles am I neglecting" is asking about. Hoisted so Home and the library
  // grade the same sessions the same way.
  const isMobilityEx = (e) => (e?.category === "mobility") || e?.type === "hold";

  // ============ Muscle balance, drawn on the body ============
  //
  // Home showed this as six flat horizontal bars. The bars were accurate and
  // said almost nothing: "Chest 30 / Back 0" is a fact you have to assemble
  // into a picture yourself, and the whole question the block exists to answer
  // — what am I neglecting? — is a spatial one. The library already ships the
  // figures and the heat palette, so the picture costs no new assets.
  //
  // Deliberately not BodyMap.create(): that builds an interactive widget with
  // a title, front/back toggle, sex toggle, heat checkbox, tap targets on
  // every zone, a status line and a legend. Home wants a picture. This draws
  // the same geometry with the same class names — so every heat colour, in
  // both themes, comes from the CSS the library already has — with no
  // listeners, no tabindex and no role="button" anywhere in it.
  const MUSCLE_MAP_VIEWS = [
    { view: "front", label: "Front" },
    { view: "back", label: "Back" }
  ];

  function buildMuscleFigure(sex, view, heat) {
    const NS = "http://www.w3.org/2000/svg";
    const geo = (BodyMap.GEOMETRY[sex] || BodyMap.GEOMETRY.male)[view];
    if (!geo) return null;
    const node = (name, attrs) => {
      const n = document.createElementNS(NS, name);
      for (const [k, v] of Object.entries(attrs || {})) {
        if (v == null || v === false) continue;
        n.setAttribute(k, String(v));
      }
      return n;
    };
    // Same thresholds as the library's heatClass, so the two screens grade the
    // same training identically.
    const heatClass = (id) => {
      const h = typeof heat[id] === "number" ? heat[id] : 0;
      if (h <= 0) return "heat-0";
      if (h < 0.25) return "heat-1";
      if (h < 0.5) return "heat-2";
      if (h < 0.75) return "heat-3";
      return "heat-4";
    };

    const svg = node("svg", {
      viewBox: "0 0 220 480", class: "body-map-svg", role: "img",
      "aria-label": `${view === "front" ? "Front" : "Back"} view, muscles shaded by how much they were trained in the last 14 days`
    });
    svg.appendChild(node("ellipse", {
      cx: 110, cy: 473, rx: sex === "female" ? 52 : 56, ry: 6, class: "body-map-ground"
    }));

    const under = node("g", { class: "body-map-underlay", "aria-hidden": "true" });
    for (const d of (geo.silhouette || [])) {
      under.appendChild(node("path", { d, class: "body-map-underlay-part" }));
    }
    svg.appendChild(under);

    for (const zoneId of Object.keys(geo.regions || {})) {
      if (!BodyMap.ZONES[zoneId]) continue;
      const g = node("g", {
        class: "body-map-region " + heatClass(zoneId),
        "data-zone": zoneId, "aria-hidden": "true"
      });
      for (const part of (geo.regions[zoneId] || [])) {
        if (typeof part === "string") g.appendChild(node("path", { d: part, class: "body-map-region-part" }));
        else if (part && part.type === "ellipse") {
          g.appendChild(node("ellipse", { cx: part.cx, cy: part.cy, rx: part.rx, ry: part.ry, class: "body-map-region-part" }));
        } else if (part && part.d) g.appendChild(node("path", { d: part.d, class: "body-map-region-part" }));
      }
      svg.appendChild(g);
    }

    if (geo.detail && geo.detail.length) {
      const det = node("g", { class: "body-map-detail", "aria-hidden": "true" });
      for (const d of geo.detail) {
        det.appendChild(node("path", { d, class: "body-map-detail-line", "fill-rule": "evenodd" }));
      }
      svg.appendChild(det);
    }
    return svg;
  }

  // A picture with no numbers would be a straight information loss against the
  // bars, so the counts stay — as the two readings the bars made you derive.
  // `windowDays` is how long the tally covers; null when the account has not
  // been running long enough to divide it into a weekly rate honestly.
  function muscleMapReadout(heat, windowDays) {
    const major = new Set(BodyMap.MAJOR_ZONES || []);
    const drawn = Object.entries(BodyMap.ZONES)
      .filter(([, z]) => (z.views || []).length && z.category !== "mobility")
      .map(([id, z]) => {
        const exact = heat[id + "_setsExact"] != null ? heat[id + "_setsExact"] : (heat[id + "_sets"] || 0);
        return {
          id, label: z.label,
          sets: Math.round(heat[id + "_sets"] || 0),
          perWeek: windowDays ? U.setsPerWeek(exact, windowDays) : null,
          major: major.has(id)
        };
      });
    const busiest = drawn.filter(z => z.sets > 0).sort((a, b) => b.sets - a.sets).slice(0, 3);
    const untouched = drawn.filter(z => z.sets === 0);
    const row = el("div", { class: "mmap-readout" });
    if (busiest.length) {
      // A weekly rate rather than a fortnight's total, because a total can only
      // be compared with your own other totals. Ten a week is a number from
      // outside your history, which is the whole point of showing it.
      row.appendChild(el("div", { class: "mmap-read", "data-testid": "mmap-busiest" },
        el("span", { class: "mmap-read-key" }, "Most work"),
        el("span", { class: "mmap-read-val" },
          busiest.map(z => windowDays ? `${z.label} ${z.perWeek}/wk` : `${z.label} ${z.sets}`).join(" · "))
      ));
    }
    // Trained, but under the range the evidence covers. Only the major groups:
    // forearms and lower back are worked as synergists and nobody programmes
    // ten direct sets a week for them, so listing them here would make the line
    // permanently red and teach you to skip it.
    if (windowDays) {
      const light = drawn
        .filter(z => z.major && z.sets > 0 && U.setsBand(z.perWeek) === "under")
        .sort((a, b) => a.perWeek - b.perWeek);
      if (light.length) {
        const shown = light.slice(0, 4).map(z => `${z.label} ${z.perWeek}`);
        row.appendChild(el("div", { class: "mmap-read", "data-testid": "mmap-under" },
          el("span", { class: "mmap-read-key" }, `Under ${U.SETS_PER_WEEK_MIN}/wk`),
          el("span", { class: "mmap-read-val is-quiet" },
            light.length > 4 ? `${shown.join(", ")} +${light.length - 4}` : shown.join(", "))
        ));
      }
    }
    if (untouched.length) {
      const names = untouched.map(z => z.label);
      const shown = names.slice(0, 4).join(", ");
      row.appendChild(el("div", { class: "mmap-read", "data-testid": "mmap-untouched" },
        el("span", { class: "mmap-read-key" }, "Nothing logged"),
        el("span", { class: "mmap-read-val is-quiet" },
          names.length > 4 ? `${shown} +${names.length - 4}` : shown)
      ));
    }
    return row.childNodes.length ? row : null;
  }

  function renderMuscleMap(heat, sex, windowDays) {
    const wrap = el("div", { class: "card mmap-card", "data-testid": "home-muscle-map" });
    wrap.appendChild(cardHead("Muscle balance", windowDays ? "Per week, last 14 days" : "Last 14 days"));
    const stage = el("div", { class: "body-map body-map-mini heat-on mmap-stage" });
    for (const v of MUSCLE_MAP_VIEWS) {
      const fig = buildMuscleFigure(sex, v.view, heat);
      if (!fig) continue;
      stage.appendChild(el("figure", { class: "mmap-fig" },
        fig, el("figcaption", { class: "mmap-cap" }, v.label)));
    }
    if (!stage.childNodes.length) return null;   // geometry missing — caller falls back
    wrap.appendChild(stage);
    const readout = muscleMapReadout(heat, windowDays);
    if (readout) wrap.appendChild(readout);
    return wrap;
  }

  // The map when it can be drawn, the bars when it cannot.
  //
  // body-map.js is a separate script tag, so on a cold start with a stale or
  // partial cache it can genuinely be absent — and the geometry is data, so a
  // bad entry could throw mid-draw. Either way Home still has to render, and
  // the bars it replaces are a complete answer on their own rather than a
  // placeholder. The empty state is the bars' too: "finish a workout" reads
  // better than a body with nothing lit on it.
  async function buildMuscleBalanceBlock(completed, exById) {
    const balance = await computeMuscleBalance(14);
    const bars = () => renderMuscleBalance(balance);
    const usable = window.BodyMap
      && typeof BodyMap.heatFromWorkouts === "function"
      && BodyMap.GEOMETRY && BodyMap.ZONES;
    if (!usable || balance.every(b => b.sets === 0)) return bars();
    try {
      const heat = BodyMap.heatFromWorkouts(completed, exById, 14, {
        include: (e) => !isMobilityEx(e)
      });
      // Dividing a fortnight's tally in half only gives a weekly rate if there
      // was a fortnight to tally. Someone three days in would have their real
      // week's work halved and reported as a shortfall they do not have, so
      // until the history is that long the readout stays on raw counts.
      const first = completed.length
        ? completed.map(w => w.date).filter(Boolean).sort()[0] : null;
      const historyDays = first
        ? Math.round((new Date(U.todayISO() + "T00:00:00") - new Date(first + "T00:00:00")) / 86400000) + 1
        : 0;
      const windowDays = historyDays >= 14 ? 14 : null;
      return renderMuscleMap(heat, state.prefs?.sex === "female" ? "female" : "male", windowDays) || bars();
    } catch (err) {
      console.error("muscle map failed, falling back to bars", err);
      return bars();
    }
  }

  function renderMuscleBalance(balance) {
    const card = el("div", { class: "card" });
    card.appendChild(cardHead("Muscle balance", "Last 14 days"));
    const maxSets = Math.max(1, ...balance.map(b => b.sets));
    if (balance.every(b => b.sets === 0)) {
      card.appendChild(emptyState({
        compact: true,
        body: "Finish a workout to see how your training is distributed across muscle groups.",
        primaryLabel: state.activeWorkout ? "Continue workout" : "Start workout",
        onPrimary: () => goTab("workout"),
        primaryTestId: "empty-muscle-start-workout"
      }));
      return card;
    }
    const grid = el("div", { class: "muscle-balance" });
    for (const b of balance) {
      grid.appendChild(el("div", { class: "muscle-row" },
        el("div", { class: "muscle-name" }, b.group),
        el("div", { class: "muscle-bar" },
          el("div", { class: "muscle-bar-fill", style: `width: ${(b.sets / maxSets * 100).toFixed(1)}%` })
        ),
        el("div", { class: "muscle-count" }, `${b.sets} ${b.sets === 1 ? "set" : "sets"}`)
      ));
    }
    card.appendChild(grid);
    return card;
  }

  // ============ Bodyweight card ============
  async function renderBodyweightCard() {
    const list = (await Storage.getBodyweights()).slice().sort((a, b) => a.date.localeCompare(b.date));
    const today = U.todayISO();
    const todayEntry = list.find(b => b.date === today);
    const latest = list[list.length - 1];
    // Build 30-day series (with nulls for missing days).
    const days = 30;
    const byDate = new Map(list.map(b => [b.date, b.kg]));
    const values = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const iso = U.todayISO(d);
      values.push(byDate.get(iso) ?? null);
    }

    const card = el("div", { class: "card", "data-testid": "bodyweight-card" });
    const header = el("div", { class: "row-between" },
      el("div", {},
        el("div", { class: "card-title", style: "margin: 0 0 4px 0" }, "Bodyweight"),
        el("div", { style: "font-family: var(--font-numeric); font-size: 22px; font-weight: 600;" },
          latest ? U.formatWeight(latest.kg, { space: false }) : el("span", { class: "text-faint", style: "font-size: 14px; font-weight: 400" }, "Add your weight below")
        ),
        latest && list.length > 1 ? (() => {
          const first = list[0];
          const delta = latest.kg - first.kg;
          // Neutral on purpose. This was green for a gain and red for a loss,
          // which asserts that up is good — true if you are bulking, exactly
          // wrong if you are cutting, and the app is not told which. The sign
          // already carries the direction; the colour was adding a verdict.
          const sign = delta > 0 ? "+" : "";
          return el("div", { class: "text-xs text-muted", style: "margin-top: 4px" },
            `${sign}${U.trimNum(Math.abs(U.toDisplayWeight(Math.abs(delta))))}${U.weightUnit()} since ${U.formatDate(first.date)}`);
        })() : null
      )
    );
    card.appendChild(header);

    // Input row
    const wI = el("input", { type: "number", step: "0.1", inputmode: "decimal",
      class: "input input-num", placeholder: latest ? String(U.toDisplayWeight(latest.kg)) : U.weightUnit(),
      "aria-label": `Today's bodyweight in ${U.isImperial() ? "pounds" : "kilograms"}`,
      value: todayEntry?.kg ?? "", style: "max-width: 140px" });
    // Tap-first numeric keypad, same as logging reps/weight in a workout.
    attachNumPad(wI, { decimals: true, step: U.isImperial() ? 0.2 : 0.1, unit: U.weightUnit(), label: "Log bodyweight" });
    const saveBtn = el("button", { class: "btn btn-primary btn-sm", on: { click: async () => {
      const kg = U.fromDisplayWeight(wI.value);
      if (kg == null || isNaN(kg) || kg <= 0) return toast("Enter a valid weight");
      await Storage.saveBodyweight({ date: today, kg });
      toast("Weight logged");
      renderMainKeepScroll();
    } } }, "Log today");
    card.appendChild(el("div", { class: "row mt-8", style: "gap: 8px; align-items: center;" },
      wI,
      el("span", { class: "text-sm text-muted" }, U.weightUnit()),
      saveBtn,
      todayEntry ? el("button", { class: "icon-btn", title: "Delete today’s entry", on: { click: async () => {
        if (!(await confirmDialog("Delete today’s bodyweight entry?", { title: "Delete entry?", okLabel: "Delete", danger: true }))) return;
        await Storage.deleteBodyweight(today);
        renderMainKeepScroll();
      } }, html: icons.trash }) : null
    ));

    // Sparkline
    const spark = el("div", { style: "margin-top: 12px" }, sparkline(values, { width: 320, height: 48 }));
    card.appendChild(spark);
    if (list.length >= 2) {
      card.appendChild(el("div", { class: "text-xs text-faint", style: "margin-top: 4px" },
        `Last 30 days · ${list.length} ${list.length === 1 ? "entry" : "entries"} logged`));
    }
    return card;
  }

  // ============ HOME ============
  function energySourcePlain(source) {
    if (source === "auto") return "Suggested for you";
    if (source === "manual") return "Set by you";
    return "Starter estimate";
  }

  /** True when food-room / macro targets should be treated as personalised. */
  function targetsArePersonal(energy) {
    return !!(energy && energy.isPersonal);
  }

  /**
   * Macro targets are personal when:
   * - user set manual P/C/F, or
   * - auto macros rest on a real bodyweight and a ready profile.
   */
  function macrosArePersonal(macroGoals, energy) {
    if (!macroGoals) return false;
    if (macroGoals.source === "manual") return true;
    if ((macroGoals.source === "auto" || macroGoals.source === "auto-fallback") &&
        energy && energy.profileReady && energy.bwLogged) {
      return true;
    }
    return false;
  }

  function energySourceLabel(energy) {
    if (!energy) return "Starter estimate";
    if (!targetsArePersonal(energy)) return "Starter estimate";
    return energySourcePlain(energy.source);
  }

  function scrollToBodyweightCard() {
    state.tab = "home";
    renderMain().then(() => {
      const node = document.querySelector('[data-testid="bodyweight-card"]');
      if (node) node.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function energyStatusFromFill(pct, remaining) {
    if (remaining < 0) {
      return { className: "energy-status-surplus", label: "Over for today" };
    }
    if (pct < 70) {
      return { className: "energy-status-deficit", label: "Plenty left" };
    }
    return { className: "energy-status-maintain", label: "About right" };
  }

  let ringSeq = 0;
  const SVGNS = "http://www.w3.org/2000/svg";
  function buildEnergyRing(pct, overBudget) {
    const size = 176;
    const stroke = 13;
    const cx = size / 2;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const fillPct = Math.max(0, Math.min(100, pct));
    const dashOffset = c * (1 - fillPct / 100);
    // Three stops of one state scale, never the brand accent — the ring is a
    // reading, and the accent means "you can touch this".
    const near = fillPct >= 85 && !overBudget;
    const endColor = overBudget ? "var(--state-over)" : (near ? "var(--state-warn)" : "var(--state-ok)");
    const startColor = overBudget ? "var(--state-warn)" : (near ? "var(--state-ok)" : "var(--state-ok)");
    const gid = "ering-" + (++ringSeq);

    const wrap = el("div", { class: "energy-ring-wrap" });
    const svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
    svg.setAttribute("class", "energy-ring");
    svg.setAttribute("width", String(size));
    svg.setAttribute("height", String(size));
    svg.setAttribute("aria-hidden", "true");

    // Gradient so the arc shades from bright to accent as it sweeps.
    const defs = document.createElementNS(SVGNS, "defs");
    const grad = document.createElementNS(SVGNS, "linearGradient");
    grad.setAttribute("id", gid);
    grad.setAttribute("x1", "0%"); grad.setAttribute("y1", "0%");
    grad.setAttribute("x2", "100%"); grad.setAttribute("y2", "100%");
    const s1 = document.createElementNS(SVGNS, "stop");
    s1.setAttribute("offset", "0%"); s1.setAttribute("stop-color", startColor);
    const s2 = document.createElementNS(SVGNS, "stop");
    s2.setAttribute("offset", "100%"); s2.setAttribute("stop-color", endColor);
    grad.appendChild(s1); grad.appendChild(s2);
    defs.appendChild(grad);
    svg.appendChild(defs);

    const bg = document.createElementNS(SVGNS, "circle");
    bg.setAttribute("cx", String(cx)); bg.setAttribute("cy", String(cx)); bg.setAttribute("r", String(r));
    bg.setAttribute("fill", "none"); bg.setAttribute("stroke", "var(--bg-sunken)"); bg.setAttribute("stroke-width", String(stroke));
    svg.appendChild(bg);

    const fg = document.createElementNS(SVGNS, "circle");
    fg.setAttribute("cx", String(cx)); fg.setAttribute("cy", String(cx)); fg.setAttribute("r", String(r));
    fg.setAttribute("fill", "none"); fg.setAttribute("stroke", `url(#${gid})`);
    fg.setAttribute("stroke-width", String(stroke));
    fg.setAttribute("stroke-linecap", "round");
    fg.setAttribute("stroke-dasharray", String(c));
    fg.setAttribute("stroke-dashoffset", String(c)); // start empty, animate to target
    fg.setAttribute("transform", `rotate(-90 ${cx} ${cx})`);
    fg.setAttribute("class", "energy-ring-fg");
    svg.appendChild(fg);

    // Glowing dot at the leading edge of the arc.
    let dot = null;
    if (fillPct > 1 && fillPct < 99.5) {
      const ang = (-90 + 360 * fillPct / 100) * Math.PI / 180;
      dot = document.createElementNS(SVGNS, "circle");
      dot.setAttribute("cx", String(cx + r * Math.cos(ang)));
      dot.setAttribute("cy", String(cx + r * Math.sin(ang)));
      dot.setAttribute("r", String(stroke / 2 - 1));
      dot.setAttribute("fill", "#fff");
      dot.setAttribute("class", "energy-ring-dot");
      svg.appendChild(dot);
    }

    wrap.appendChild(svg);
    // Animate the sweep on mount.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fg.style.transition = "stroke-dashoffset 900ms cubic-bezier(.2,.8,.2,1)";
      fg.setAttribute("stroke-dashoffset", String(dashOffset));
      if (dot) dot.classList.add("is-in");
    }));
    return wrap;
  }

  // Distinct colours per meal section for the meals-today donut + legend.
  const MEAL_COLORS = {
    breakfast: "#f0a35e",
    lunch: "#57c9d6",
    dinner: "#7c8cff",
    snack: "#58c07f",
    pre_workout: "#d98cff",
    post_workout: "#ffce54",
    other: "#8a94a4"
  };
  const mealColor = (key) => MEAL_COLORS[key] || "#8a94a4";

  // Nutrition hub: one widget carrying both readings of today's intake that
  // used to sit in separate blocks — the outer arc is progress toward the
  // calorie goal, the inner donut is the split by meal. Merging them saves a
  // screenful on the Overview panel and puts the number you act on (what's
  // left) in the middle of the thing you tap to log.
  function buildEnergyHub({ entries, eaten, goal, pct, over, remaining }) {
    const size = 190;
    const oStroke = 11, iStroke = 17, gap = 5;
    const cx = size / 2;
    const rO = (size - oStroke) / 2;
    const rI = rO - oStroke / 2 - gap - iStroke / 2;
    const cO = 2 * Math.PI * rO, cI = 2 * Math.PI * rI;
    const fillPct = Math.max(0, Math.min(100, pct));
    const near = fillPct >= 85 && !over;
    const endColor = over ? "var(--danger, #e5484d)" : (near ? "var(--warning, #c48a2a)" : "var(--accent)");
    const startColor = over ? "#f0883e" : (near ? "#e0b04a" : "var(--accent-hover, #74d6e1)");
    const gid = "ehub-" + (++ringSeq);

    const wrap = el("div", { class: "nhub-wrap", "data-testid": "meals-donut" });
    const svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
    svg.setAttribute("class", "nhub-svg");
    svg.setAttribute("width", String(size)); svg.setAttribute("height", String(size));
    svg.setAttribute("aria-hidden", "true");

    const circle = (r, stroke, colour, cls) => {
      const n = document.createElementNS(SVGNS, "circle");
      n.setAttribute("cx", String(cx)); n.setAttribute("cy", String(cx)); n.setAttribute("r", String(r));
      n.setAttribute("fill", "none"); n.setAttribute("stroke", colour);
      n.setAttribute("stroke-width", String(stroke));
      if (cls) n.setAttribute("class", cls);
      return n;
    };

    const defs = document.createElementNS(SVGNS, "defs");
    const grad = document.createElementNS(SVGNS, "linearGradient");
    grad.setAttribute("id", gid);
    grad.setAttribute("x1", "0%"); grad.setAttribute("y1", "0%");
    grad.setAttribute("x2", "100%"); grad.setAttribute("y2", "100%");
    for (const [off, col] of [["0%", startColor], ["100%", endColor]]) {
      const s = document.createElementNS(SVGNS, "stop");
      s.setAttribute("offset", off); s.setAttribute("stop-color", col);
      grad.appendChild(s);
    }
    defs.appendChild(grad);
    svg.appendChild(defs);

    // —— outer: progress toward the calorie goal ——
    svg.appendChild(circle(rO, oStroke, "var(--bg-sunken)"));
    const fg = circle(rO, oStroke, `url(#${gid})`, "energy-ring-fg");
    fg.setAttribute("stroke-linecap", "round");
    fg.setAttribute("stroke-dasharray", String(cO));
    fg.setAttribute("stroke-dashoffset", String(cO)); // start empty, animate in
    fg.setAttribute("transform", `rotate(-90 ${cx} ${cx})`);
    svg.appendChild(fg);

    let dot = null;
    if (fillPct > 1 && fillPct < 99.5) {
      const ang = (-90 + 360 * fillPct / 100) * Math.PI / 180;
      dot = document.createElementNS(SVGNS, "circle");
      dot.setAttribute("cx", String(cx + rO * Math.cos(ang)));
      dot.setAttribute("cy", String(cx + rO * Math.sin(ang)));
      dot.setAttribute("r", String(oStroke / 2 - 1));
      dot.setAttribute("fill", "#fff");
      dot.setAttribute("class", "energy-ring-dot");
      svg.appendChild(dot);
    }

    // —— inner: today's split by meal ——
    svg.appendChild(circle(rI, iStroke, "var(--bg-sunken)"));
    const slices = (entries || []).filter(e => e.kcal > 0);
    const total = slices.reduce((s, e) => s + e.kcal, 0);
    if (total > 0) {
      const sliceGap = slices.length > 1 ? 3 : 0;
      let accum = 0;
      for (const e of slices) {
        const frac = e.kcal / total;
        const len = Math.max(1, frac * cI - sliceGap);
        const seg = circle(rI, iStroke, e.color, "nhub-slice");
        seg.setAttribute("stroke-dasharray", `${len} ${cI - len}`);
        seg.setAttribute("stroke-dashoffset", String(-accum));
        seg.setAttribute("transform", `rotate(-90 ${cx} ${cx})`);
        svg.appendChild(seg);
        accum += frac * cI;
      }
    }
    wrap.appendChild(svg);

    // Centre: what's left is the number you act on; eaten/goal stays as context.
    wrap.appendChild(el("div", { class: "nhub-center" },
      el("div", { class: "nhub-main count-up" + (remaining < 0 ? " over" : "") },
        Math.abs(Math.round(remaining)).toLocaleString("en-GB")),
      el("div", { class: "nhub-sub" }, remaining >= 0 ? "LEFT" : "OVER"),
      el("div", { class: "nhub-detail" },
        `${Math.round(eaten).toLocaleString("en-GB")} / ${Math.round(goal).toLocaleString("en-GB")} kcal`)
    ));

    requestAnimationFrame(() => requestAnimationFrame(() => {
      fg.style.transition = "stroke-dashoffset 900ms cubic-bezier(.2,.8,.2,1)";
      fg.setAttribute("stroke-dashoffset", String(cO * (1 - fillPct / 100)));
      if (dot) dot.classList.add("is-in");
    }));
    return wrap;
  }

  // Donut of today's calories split by meal. entries: [{key,label,kcal,color}].
  function buildMealsDonut(entries, totalEaten) {
    const size = 168, stroke = 20, cx = size / 2, r = (size - stroke) / 2, c = 2 * Math.PI * r;
    const wrap = el("div", { class: "nmeals-donut-wrap", "data-testid": "meals-donut" });
    const svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
    svg.setAttribute("class", "nmeals-donut");
    svg.setAttribute("width", String(size)); svg.setAttribute("height", String(size));
    svg.setAttribute("aria-hidden", "true");

    const track = document.createElementNS(SVGNS, "circle");
    track.setAttribute("cx", String(cx)); track.setAttribute("cy", String(cx)); track.setAttribute("r", String(r));
    track.setAttribute("fill", "none"); track.setAttribute("stroke", "var(--bg-sunken)"); track.setAttribute("stroke-width", String(stroke));
    svg.appendChild(track);

    const slices = (entries || []).filter(e => e.kcal > 0);
    const total = slices.reduce((s, e) => s + e.kcal, 0);
    if (total > 0) {
      const gap = slices.length > 1 ? 3 : 0;
      let accum = 0;
      for (const e of slices) {
        const frac = e.kcal / total;
        const len = Math.max(1, frac * c - gap);
        const seg = document.createElementNS(SVGNS, "circle");
        seg.setAttribute("cx", String(cx)); seg.setAttribute("cy", String(cx)); seg.setAttribute("r", String(r));
        seg.setAttribute("fill", "none"); seg.setAttribute("stroke", e.color);
        seg.setAttribute("stroke-width", String(stroke));
        seg.setAttribute("stroke-dasharray", `${len} ${c - len}`);
        seg.setAttribute("stroke-dashoffset", String(-accum));
        seg.setAttribute("transform", `rotate(-90 ${cx} ${cx})`);
        svg.appendChild(seg);
        accum += frac * c;
      }
    }
    wrap.appendChild(svg);
    wrap.appendChild(el("div", { class: "nmeals-donut-center" },
      el("div", { class: "nmeals-donut-num count-up" }, Math.round(totalEaten || 0).toLocaleString("en-GB")),
      el("div", { class: "nmeals-donut-sub" }, total > 0 ? "eaten" : "no meals yet")
    ));
    return wrap;
  }

  function energyBreakdownRows(energy) {
    const rows = [];
    if (!energy.profileReady) return rows;
    const fmt = (n) => (n > 0 ? `+${n}` : String(n));
    // TDEE is body baseline × the activity band; show both pieces.
    // Body baseline = BMR; Activity = TDEE − BMR, which is everything the band
    // covers — moving about AND training, because the band already includes it.
    const movementExtra = (energy.tdee != null && energy.bmr != null)
      ? Math.max(0, energy.tdee - energy.bmr)
      : null;
    if (energy.bmr != null) {
      rows.push({ label: "Body baseline", value: String(energy.bmr), note: "what you burn at rest" });
    }
    if (movementExtra != null) {
      rows.push({
        label: "Activity",
        value: fmt(movementExtra),
        // Named for the band the user picked. It used to say "normal day, not
        // the gym", which is the reading that put people on the wrong band.
        note: energy.activityLabel || "your usual week, training included"
      });
    }
    const trainingBurn = energy.workoutKcal || 0;
    const trainingCounted = !!energy.includeTrainingInFoodRoom;
    rows.push({
      label: "Training today",
      value: trainingBurn ? fmt(trainingBurn) : "+0",
      note: trainingCounted
        ? "added into today's food room"
        : "estimate only — your activity band already covers it"
    });
    if (energy.maintenance != null) {
      rows.push({
        label: "Hold-weight level",
        value: String(energy.maintenance),
        note: trainingCounted
          ? "before your goal tweak"
          : "body baseline + your activity band, which covers training"
      });
    }
    if (energy.goalAdj) {
      rows.push({
        label: energy.goalLabel || "Your goal",
        value: fmt(energy.goalAdj),
        note: "aim for the day"
      });
    }
    if (energy.kcalOffset) {
      rows.push({
        label: "Personal tweak",
        value: fmt(energy.kcalOffset),
        note: "your real-world adjustment"
      });
    }
    if (energy.source === "manual" && energy.autoBudget != null) {
      rows.push({
        label: "Suggested would be",
        value: String(energy.autoBudget),
        note: "if you used suggested mode"
      });
    }
    rows.push({
      label: "Room for today",
      value: String(energy.goal || energy.budget || 0),
      note: "food target",
      strong: true
    });
    return rows;
  }

  // One sentence under the ring, or nothing at all.
  //
  // The bar for saying something is that it has to be a fact this app knows
  // and the reader does not. Generated encouragement ("you're doing great!")
  // reads as wallpaper by the second week, and restating the status chip six
  // pixels above it is worse than silence — so every branch here either
  // measures the remainder against the size of meals this person actually
  // logs, or returns null.
  function energyNarrative({ remaining, eaten, goal, meals }) {
    if (!goal) return null;
    if (!eaten) return "Nothing logged yet today.";
    if (remaining < 0) {
      return `${Math.abs(Math.round(remaining)).toLocaleString("en-GB")} kcal past today's room.`;
    }
    const since = new Date(); since.setDate(since.getDate() - 14);
    const cutoff = U.todayISO(since);
    const sizes = (meals || [])
      .filter(m => m.date >= cutoff && (m.kcal || 0) > 0)
      .map(m => m.kcal)
      .sort((a, b) => a - b);
    // Too few meals to know what "a meal" means for this person yet.
    if (sizes.length < 4) return null;
    const typical = sizes[Math.floor(sizes.length / 2)];
    const n = remaining / typical;
    if (n >= 1.6) return "Room for two more meals, going by your usual.";
    if (n >= 0.85) return "Room for one more meal, going by your usual.";
    if (n >= 0.4) return "Room for something light.";
    return "About a snack's worth left.";
  }

  function renderEnergyBudgetCard(energy, eatenKcal, opts = {}) {
    const isPersonal = targetsArePersonal(energy);
    const card = el("div", {
      class: "card energy-budget-card" + (isPersonal ? " is-personal" : " is-estimate"),
      "data-testid": "food-room-card"
    });
    const goal = energy.goal || 0;
    const eaten = Math.max(0, Math.round(eatenKcal || 0));
    const remaining = goal - eaten;
    const pct = goal > 0 ? Math.min(100, (eaten / goal) * 100) : 0;
    const overBudget = eaten > goal;
    const status = energyStatusFromFill(pct, remaining);

    const subtitleBits = [energySourceLabel(energy)];
    if (isPersonal && energy.goalLabel) subtitleBits.push(energy.goalLabel);
    if (isPersonal && energy.activityLabel) subtitleBits.push(energy.activityLabel);
    if (!isPersonal) subtitleBits.push("based on defaults until you set your details");

    card.appendChild(el("div", { class: "row-between", style: "align-items:flex-start; gap: 12px" },
      el("div", {},
        el("div", { class: "card-title", style: "margin: 0 0 4px 0" }, "Today's food room"),
        el("div", { class: "text-xs text-faint energy-source-label" }, subtitleBits.join(" · "))
      ),
      isPersonal
        ? el("div", { class: "energy-status-chip " + status.className }, status.label)
        : el("div", {
            class: "energy-status-chip energy-status-estimate",
            "data-testid": "food-room-estimate-badge"
          }, "Estimate")
    ));

    // Ring + centre remaining
    const ringWrap = buildEnergyRing(pct, overBudget);
    if (!isPersonal) ringWrap.classList.add("is-estimate");
    ringWrap.appendChild(el("div", { class: "energy-ring-center" },
      el("div", {
        class: "energy-ring-main count-up" + (remaining < 0 ? " over" : "") + (isPersonal ? "" : " is-estimate")
      }, (remaining >= 0 ? remaining : Math.abs(remaining)).toLocaleString("en-GB")),
      el("div", { class: "energy-ring-sub" }, remaining >= 0 ? "kcal left" : "kcal over")
    ));

    card.appendChild(el("div", { class: "energy-ring-block" }, ringWrap));

    const narrative = energyNarrative({ remaining, eaten, goal, meals: opts.meals });
    if (narrative) {
      card.appendChild(el("div", {
        class: "energy-narrative", "data-testid": "food-room-narrative"
      }, narrative));
    }

    card.appendChild(el("div", {
      class: "energy-summary-line" + (isPersonal ? "" : " is-estimate")
    },
      el("span", {}, "eaten "),
      el("strong", {}, eaten.toLocaleString("en-GB")),
      el("span", {}, ` / goal ${goal ? goal.toLocaleString("en-GB") : "—"}`)
    ));

    // Sticky setup path until targets are personal
    if (!isPersonal) {
      const needsProfile = !energy.profileReady;
      const needsBw = !energy.bwLogged;
      let setupCopy;
      if (needsProfile && needsBw) {
        setupCopy = "Add your age, sex, height, daily activity and bodyweight so FitForge can personalise today's food room.";
      } else if (needsProfile) {
        setupCopy = "Add your age, sex, height and how active a normal day is in Settings so FitForge can suggest today's food room for you.";
      } else {
        setupCopy = "Log your bodyweight so protein and calories use your numbers, not a default.";
      }
      const setup = el("div", { class: "energy-setup-banner mt-12", "data-testid": "food-room-setup" },
        el("div", { class: "text-sm text-muted" }, setupCopy),
        el("button", {
          class: "btn btn-primary btn-sm mt-8",
          "data-testid": "button-setup-food-room",
          on: {
            click: () => {
              if (needsProfile) openSettings();
              else scrollToBodyweightCard();
            }
          }
        }, needsProfile ? "Set up food room" : "Log bodyweight")
      );
      card.appendChild(setup);
    } else if (energy.profileReady) {
      const detail = el("div", { class: "energy-breakdown", style: "display:none" });
      detail.appendChild(el("div", { class: "text-xs text-faint", style: "margin-bottom: 8px" },
        energy.includeTrainingInFoodRoom
          ? "Built from your body, a normal day of movement, today's training, and your goal. Estimate only."
          : "Built from your body, a normal day of movement, and your goal. Training burn is shown but not added (usually closer to real life). Estimate only."));
      for (const row of energyBreakdownRows(energy)) {
        detail.appendChild(el("div", {
          class: "energy-breakdown-row" + (row.strong ? " strong" : "")
        },
          el("div", { class: "energy-breakdown-text" },
            el("div", { class: "energy-breakdown-label" }, row.label),
            row.note ? el("div", { class: "energy-breakdown-note" }, row.note) : null
          ),
          el("div", { class: "energy-breakdown-value" }, row.value)
        ));
      }

      const toggle = el("button", {
        type: "button",
        class: "btn btn-ghost btn-sm energy-breakdown-toggle",
        style: "display: block; margin: 0 auto;",
        on: { click: () => {
          const open = detail.style.display !== "none";
          detail.style.display = open ? "none" : "";
          toggle.textContent = open ? "See how it's built" : "Hide breakdown";
          toggle.setAttribute("aria-expanded", open ? "false" : "true");
        } }
      }, "See how it's built");
      toggle.setAttribute("aria-expanded", "false");

      card.appendChild(el("div", { class: "energy-breakdown-wrap mt-8" }, toggle, detail));
    }

    const actions = el("div", { class: "row mt-8", style: "gap: 8px; flex-wrap: wrap; justify-content: center" });
    if (energy.source === "manual") {
      actions.appendChild(el("button", {
        class: "btn btn-ghost btn-sm",
        on: { click: async () => {
          state.prefs.kcalGoalMode = "auto";
          await Storage.setPref("kcalGoalMode", "auto");
          if (energy.autoBudget != null) {
            state.prefs.kcalGoal = energy.autoBudget;
            await Storage.setPref("kcalGoal", energy.autoBudget);
          }
          if (state.tab === "nutrition") afterNutritionChange(); else renderMainKeepScroll();
          toast("Using suggested food room");
        } }
      }, "Use suggestion"));
    } else if (isPersonal) {
      actions.appendChild(el("button", {
        class: "btn btn-ghost btn-sm",
        on: { click: () => openSettings({ focusBudget: true }) }
      }, "Set my own number"));
    }
    if (actions.childNodes.length) card.appendChild(actions);

    return card;
  }

  function renderNutritionTrendCard(meals, goal, macroGoals = null, todayMacros = null, opts = {}) {
    // Build 14-day series ending today
    const days = 14;
    const today = new Date(U.todayISO());
    const series = [];
    const labels = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const kcal = meals.filter(m => m.date === iso).reduce((s, m) => s + (m.kcal || 0), 0);
      series.push(kcal);
      labels.push(iso);
    }
    const loggedDays = series.filter(v => v > 0);
    const avg = loggedDays.length ? Math.round(loggedDays.reduce((a, b) => a + b, 0) / loggedDays.length) : 0;
    const todayKcal = series[series.length - 1];
    const pctOfGoal = goal ? Math.round((todayKcal / goal) * 100) : 0;

    const hideMacros = !!opts.hideMacros;
    const card = el("div", { class: "card", "data-testid": "home-nutrition-trend" },
      el("div", { class: "row-between" },
        cardHead(opts.title || "Nutrition", opts.titleMeta || "Last 14 days"),
        el("button", { class: "btn btn-ghost btn-sm", on: { click: () => { state.tab = "nutrition"; renderMain(); } } }, "Open")
      )
    );

    if (loggedDays.length === 0 && !(todayMacros && (todayMacros.protein || todayMacros.carbs || todayMacros.fat))) {
      card.appendChild(emptyState({
        compact: true,
        body: "Log a meal to start tracking your daily kcal trend.",
        primaryLabel: "Log meal",
        onPrimary: () => goTab("nutrition"),
        primaryTestId: "empty-nutrition-log-meal"
      }));
      if (!hideMacros && macroGoals?.hasGoals) {
        card.appendChild(renderMacroBreakdown({ protein: 0, carbs: 0, fat: 0 }, {
          compact: true,
          hideBar: true,
          title: "Macro goals",
          goalHint: macroGoals.source === "manual" ? "manual" : `${macroGoals.proteinPerKg} g/kg`,
          goals: macroGoals.goals,
          estimate: !!opts.estimate
        }));
      }
      return card;
    }

    card.appendChild(el("div", { class: "nutrition-trend-stats" },
      el("div", { class: "nutrition-trend-stat" },
        el("div", { class: "stat-label" }, "Today"),
        el("div", { class: "stat-value", style: "font-size: 20px" }, todayKcal.toString()),
        el("div", { class: "stat-sub" }, `${pctOfGoal}% of goal`)
      ),
      el("div", { class: "nutrition-trend-stat" },
        el("div", { class: "stat-label" }, "14-day avg"),
        el("div", { class: "stat-value", style: "font-size: 20px" }, avg.toString()),
        el("div", { class: "stat-sub" }, `${loggedDays.length} of ${days} days`)
      )
    ));

    if (loggedDays.length) {
      card.appendChild(sparkline(series, { height: 42, goal, showDot: true }));
    }

    if (!hideMacros && (macroGoals?.hasGoals || (todayMacros && (todayMacros.protein || todayMacros.carbs || todayMacros.fat)))) {
      card.appendChild(renderMacroBreakdown(todayMacros || { protein: 0, carbs: 0, fat: 0 }, {
        compact: true,
        hideBar: true,
        title: "Macros today",
        goalHint: macroGoals?.hasGoals
          ? (macroGoals.source === "manual" ? "manual" : `${macroGoals.proteinPerKg} g/kg`)
          : null,
        goals: macroGoals?.hasGoals ? macroGoals.goals : null,
        estimate: !!opts.estimate
      }));
    }

    return card;
  }

  /**
   * Consistent empty-state block: short explanation + primary action.
   * Prefer verbs ("Log breakfast") over pure description.
   */
  function emptyState(opts = {}) {
    const wrap = el("div", {
      class: "empty empty-state" + (opts.compact ? " empty-state-compact" : "") + (opts.className ? " " + opts.className : ""),
      "data-testid": opts.testId || "empty-state"
    });
    if (opts.title) wrap.appendChild(el("h3", {}, opts.title));
    if (opts.body) wrap.appendChild(el("p", {}, opts.body));
    if (opts.primaryLabel && opts.onPrimary) {
      wrap.appendChild(el("button", {
        type: "button",
        class: "btn btn-primary btn-sm empty-state-cta",
        "data-testid": opts.primaryTestId || "empty-state-primary",
        on: { click: opts.onPrimary }
      }, opts.primaryLabel));
    }
    if (opts.secondaryLabel && opts.onSecondary) {
      wrap.appendChild(el("button", {
        type: "button",
        class: "btn btn-ghost btn-sm empty-state-cta-secondary",
        on: { click: opts.onSecondary }
      }, opts.secondaryLabel));
    }
    return wrap;
  }

  function goTab(tab) {
    state.tab = tab;
    renderMain();
  }

  /** Home section wrapper — quiet label above a cluster of cards. */
  // Card header: a title, and the window it covers as quiet meta beside it.
  //
  // These titles used to carry their own range in brackets — "Muscle-group
  // balance (last 14 days)", "Training frequency (last 24 weeks)" — which
  // reads like a column name rather than a heading, and puts the least
  // interesting half of the string in the most prominent type on the card.
  function cardHead(title, meta) {
    return el("div", { class: "card-head" },
      el("div", { class: "card-title", style: "margin: 0" }, title),
      meta ? el("div", { class: "card-head-meta" }, meta) : null
    );
  }

  function homeSection(title, testId, ...children) {
    const wrap = el("section", {
      class: "home-section",
      "data-testid": testId || ("home-section-" + title.toLowerCase().replace(/\s+/g, "-"))
    });
    wrap.appendChild(el("div", { class: "home-section-label" }, title));
    for (const child of children) {
      if (child) wrap.appendChild(child);
    }
    return wrap;
  }

  // Today's-workout hero for Home — driven by the weekly plan.
  // One-tap starter weeks, built from the preset session library. Rest days
  // are whatever's left, so a tap fills all seven days.
  const STARTER_SPLITS = [
    {
      key: "full-body", label: "3-Day Full Body", hint: "Best if you're starting out",
      days: { mon: "preset-full-body-a", wed: "preset-full-body-b", fri: "preset-full-body-c" }
    },
    {
      key: "upper-lower", label: "Upper / Lower", hint: "Four days, balanced",
      days: { mon: "preset-upper", tue: "preset-lower", thu: "preset-upper", fri: "preset-lower" }
    },
    {
      key: "ppl", label: "Push / Pull / Legs", hint: "Six days, most volume",
      days: {
        mon: "preset-push", tue: "preset-pull", wed: "preset-legs",
        thu: "preset-push", fri: "preset-pull", sat: "preset-legs"
      }
    }
  ];

  // ============ The ignition cluster ============
  //
  // Starting a workout is the biggest commitment the app asks for, and it was
  // a rounded rectangle identical to every other primary button. This is the
  // one control on the landing screen that should not look like a button.
  //
  // Borrowed from an engine-start button: a round cap sunk in a bezel, an
  // engraved label, a ring that says ready, and a satellite control beside it.
  // Deliberately NOT borrowed: the red (red means over-budget here, and the
  // accent already means "you can touch this"), the flip cover (deliberate
  // friction is right for 1,000hp and wrong for something you do four times a
  // week — never add a step), and photoreal carbon and chrome, which read as
  // 2010 on a flat interface. The language transfers; the materials do not.
  function ignitionCluster({ testId, onStart, onSwap, swapLabel }) {
    const btn = el("button", {
      class: "ignition-btn", type: "button", "data-testid": testId,
      "aria-label": "Start workout",
      on: { click: onStart }
    },
      el("span", { class: "ignition-ring", "aria-hidden": "true" }),
      el("span", { class: "ignition-face" },
        el("span", { class: "ignition-label" }, "START"),
        el("span", { class: "ignition-sub" }, "WORKOUT")
      )
    );

    // Hold for the other ways in. None of these duplicates the swap beside it,
    // and the set is the same three whatever the day holds — "Repeat" stays
    // put on a fresh install and says so rather than going missing.
    attachRadial(btn, {
      label: "Other ways to start",
      // 116px of the page scroller: without this a drag that starts on the cap
      // refuses to move the page, which is a lot of dead zone for a control
      // sitting in the middle of the landing screen.
      scrollable: true,
      items: [
        { key: "empty", label: "Empty", icon: icons.plus, onPick: () => startNewWorkout(null) },
        { key: "sessions", label: "Sessions", icon: QA_ART.sessions, onPick: () => openSessionsSheet() },
        { key: "repeat", label: "Repeat", icon: icons.repeat,
          onPick: async () => startFromLastWorkout(await getLastCompletedWorkout()) }
      ]
    });

    return el("div", { class: "ignition" },
      btn,
      el("div", { class: "ignition-side" },
        el("div", { class: "ignition-status" },
          el("i", { class: "ignition-dot", "aria-hidden": "true" }), "Ready"),
        el("button", {
          class: "ignition-swap", type: "button", "data-testid": "hero-swap",
          title: "Start a different workout", on: { click: onSwap }
        },
          el("span", { class: "ignition-swap-ic", "aria-hidden": "true", html: '<svg viewBox="0 0 24 24" width="17" height="17"><path d="M4 7h11M4 7l3-3M4 7l3 3M20 17H9m11 0l-3-3m3 3l-3 3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' }),
          swapLabel || "Swap session"
        ),
        el("div", { class: "ignition-hint" }, "Hold Start for more")
      )
    );
  }

  function buildTodayWorkoutHero(opts) {
    const { plan, tplById, exById } = opts;
    const hasPlan = planHasAny(plan);
    const todayKey = weekdayKeyFor();
    const assign = plan[todayKey];
    const arrow = '<svg viewBox="0 0 16 16" width="16" height="16"><path d="M3 8h9M8 3.5L12.5 8 8 12.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const editLink = () => el("button", {
      class: "today-hero-edit", type: "button", "data-testid": "hero-edit-week",
      on: { click: openWeeklyPlanQuiz }
    }, "Edit week");

    // No plan configured at all. Rather than handing over a 7-screen quiz,
    // show the week you'd get and let one tap fill it from the preset library.
    if (!hasPlan) {
      const card = el("div", { class: "card today-hero today-hero-plan", "data-testid": "today-hero" });
      const strip = el("div", { class: "plan-preview", "data-testid": "plan-preview" });
      const dayCells = {};
      for (const k of WEEKDAY_KEYS) {
        const cell = el("div", { class: "plan-preview-day", "data-day": k },
          el("span", { class: "plan-preview-letter" }, WEEKDAY_LETTERS[k]),
          el("span", { class: "plan-preview-fill" })
        );
        dayCells[k] = cell;
        strip.appendChild(cell);
      }
      const previewLabel = el("div", { class: "plan-preview-label" }, "Seven days, yours to fill");

      // Preview a split on the strip without committing to it.
      const paintPreview = (split) => {
        for (const k of WEEKDAY_KEYS) {
          const on = split ? !!split.days[k] : false;
          dayCells[k].classList.toggle("is-on", on);
          dayCells[k].classList.toggle("is-rest", !!split && !on);
        }
        previewLabel.textContent = split
          ? `${Object.keys(split.days).length} training days · ${split.label}`
          : "Seven days, yours to fill";
      };

      const splitRow = el("div", { class: "split-row", "data-testid": "starter-splits" });
      for (const split of STARTER_SPLITS) {
        const btn = el("button", {
          class: "split-card", type: "button", "data-testid": `split-${split.key}`,
          on: {
            click: async () => {
              const plan2 = {};
              for (const k of WEEKDAY_KEYS) plan2[k] = split.days[k] || "rest";
              state.prefs.weeklyPlan = plan2;
              await Storage.setPref("weeklyPlan", plan2);
              paintPreview(split);
              toast(`${split.label} set — ${Object.keys(split.days).length} training days`);
              setTimeout(renderMainKeepScroll, 420);
            },
            pointerenter: () => paintPreview(split),
            pointerleave: () => paintPreview(null)
          }
        },
          el("span", { class: "split-card-days" }, String(Object.keys(split.days).length)),
          el("span", { class: "split-card-main" },
            el("span", { class: "split-card-name" }, split.label),
            el("span", { class: "split-card-hint" }, split.hint))
        );
        splitRow.appendChild(btn);
      }

      card.append(
        el("div", { class: "today-hero-eyebrow" }, "Your week"),
        el("div", { class: "today-hero-title" }, "Build your week in one tap"),
        el("div", { class: "today-hero-sub" },
          "Pick a split and FitForge fills the week from its session library. Change any day later."),
        strip,
        previewLabel,
        splitRow,
        el("div", { class: "today-hero-quiet" },
          el("button", { class: "hero-quiet-link", type: "button", "data-testid": "hero-plan-week",
            on: { click: openWeeklyPlanQuiz } }, "Plan day by day"),
          el("span", { class: "hero-quiet-sep" }, "·"),
          el("button", { class: "hero-quiet-link", type: "button", "data-testid": "hero-pick-session-noplan",
            on: { click: () => { goTab("workout"); setTimeout(openSessionsSheet, 260); } } }, "Pick a session"),
          el("span", { class: "hero-quiet-sep" }, "·"),
          el("button", { class: "hero-quiet-link", type: "button",
            on: { click: () => goTab("workout") } }, "Just start")
        )
      );
      return card;
    }

    // Rest day.
    if (assign === "rest") {
      // Edit week rides the eyebrow's row, the way it does on a training day.
      // Left where it was — after the copy — the pill wrapped underneath and
      // sat directly above "Train anyway", reading as two equal buttons when
      // one is a quiet aside.
      // A rest day was a title, one line, two small links and then ~250px of
      // nothing — the one state where the landing screen looked unfinished
      // rather than calm. It shows what the rest is *for*: the week already
      // banked. Only when there is something banked; a grid of zeroes would
      // be a worse void than an empty one.
      const banked = weekBanked(opts.completed);
      const bankedTime = fmtBankedTime(banked.secs);
      const bankedCells = banked.sessions > 0 ? [
        { value: String(banked.sessions), unit: banked.sessions === 1 ? "session" : "sessions" },
        banked.volume > 0
          ? { value: banked.volume >= 1000 ? `${(banked.volume / 1000).toFixed(1)}k` : String(banked.volume), unit: "kg moved" }
          : null,
        bankedTime
      ].filter(Boolean) : [];

      return el("div", { class: "card today-hero today-hero-rest", "data-testid": "today-hero" },
        el("div", { class: "row-between", style: "align-items:center;gap:10px" },
          el("div", { class: "today-hero-eyebrow" }, "Today · Rest"),
          editLink()
        ),
        el("div", { class: "today-hero-title" }, "Rest day"),
        el("div", { class: "today-hero-sub" }, "Recovery is where the work pays off. Enjoy it."),
        bankedCells.length
          ? el("div", { class: "rest-banked", "data-testid": "rest-banked" },
              el("div", { class: "rest-banked-row" },
                ...bankedCells.map(c => el("div", { class: "rest-banked-cell" },
                  el("div", { class: "rest-banked-value" }, c.value),
                  el("div", { class: "rest-banked-unit" }, c.unit)
                ))
              ),
              el("div", { class: "rest-banked-cap" },
                "Banked this week. Today is when it turns into progress.")
            )
          : null,
        el("button", {
          class: "btn btn-sm today-hero-rest-cta mt-8",
          on: { click: () => goTab("workout") }
        }, "Train anyway")
      );
    }

    // Focus day (Push / Pull / Legs / Cardio / …) — no template, just a target.
    const focusDay = focusFromValue(assign);
    if (focusDay) {
      return el("div", { class: "card today-hero today-hero-train", "data-testid": "today-hero" },
        el("div", { class: "today-hero-glow" }),
        el("div", { class: "today-hero-body" },
          el("div", { class: "row-between", style: "align-items:flex-start;gap:10px" },
            el("div", { class: "today-hero-eyebrow" }, `Today · ${WEEKDAY_LABELS[todayKey]}`),
            editLink()
          ),
          el("div", { class: "row-between", style: "align-items:center;gap:12px;margin-top:4px" },
            el("div", { class: "today-hero-title today-hero-focus-title" },
              el("span", { class: "today-hero-ficon", html: focusDay.icon }),
              focusDay.label
            ),
            el("div", { class: "today-hero-focus" }, "Focus")
          ),
          el("div", { class: "today-hero-sub" }, focusDay.desc),
          ignitionCluster({
            testId: "hero-start-focus",
            onStart: () => { pendingPickerCat = focusDay.cat; goTab("workout"); },
            onSwap: () => { pendingPickerCat = null; goTab("workout"); },
            swapLabel: "Something else"
          })
        )
      );
    }

    const tpl = (assign && assign !== "rest") ? tplById.get(assign) : null;

    // Planned training day with a valid template.
    if (tpl) {
      const focus = templateFocus(tpl, exById);
      const exCount = (tpl.exercises || []).length;
      const meta = `${exCount} exercise${exCount === 1 ? "" : "s"} · ${templateLengthLabel(tpl)}`;
      const names = (tpl.exercises || []).map(e => e.name);
      const chipRow = el("div", { class: "today-hero-chips" });
      names.slice(0, 3).forEach(n => chipRow.appendChild(el("span", { class: "today-hero-chip" }, n)));
      if (names.length > 3) chipRow.appendChild(el("span", { class: "today-hero-chip is-more" }, `+${names.length - 3}`));

      return el("div", { class: "card today-hero today-hero-train", "data-testid": "today-hero" },
        el("div", { class: "today-hero-glow" }),
        el("div", { class: "today-hero-body" },
          el("div", { class: "row-between", style: "align-items:flex-start;gap:10px" },
            el("div", { class: "today-hero-eyebrow" }, `Today · ${WEEKDAY_LABELS[todayKey]}`),
            editLink()
          ),
          // The focus used to be right-aligned on the title's baseline, where
          // it read as orphaned — too far from the title to belong to it, too
          // small to be its own thing. It is the title's subtitle.
          el("div", { class: "today-hero-title" }, tpl.name),
          el("div", { class: "today-hero-meta" },
            focus ? el("span", { class: "today-hero-focus" }, focus) : null,
            focus ? el("span", { class: "today-hero-metasep" }, "·") : null,
            el("span", {}, meta)
          ),
          chipRow,
          ignitionCluster({
            testId: "hero-start-workout",
            onStart: () => startNewWorkout(tpl),
            onSwap: () => goTab("workout")
          })
        )
      );
    }

    // Plan exists but today is open (or its template was deleted).
    return el("div", { class: "card today-hero today-hero-open", "data-testid": "today-hero" },
      el("div", { class: "row-between", style: "align-items:flex-start;gap:10px" },
        el("div", {},
          el("div", { class: "today-hero-eyebrow" }, `Today · ${WEEKDAY_LABELS[todayKey]}`),
          el("div", { class: "today-hero-title" }, "Nothing planned today"),
          el("div", { class: "today-hero-sub" }, "Open day — start whatever you feel like.")
        ),
        editLink()
      ),
      el("button", {
        class: "btn btn-primary btn-block today-hero-start mt-8", "data-testid": "hero-start-open",
        on: { click: () => goTab("workout") }
      }, "Start a workout", el("span", { class: "today-hero-arrow", html: arrow })),
      // On an open day the real question is "what should I do?" — offer the
      // ready-made library right here rather than making them go find it.
      el("button", {
        class: "btn btn-block mt-8", "data-testid": "hero-pick-session",
        on: { click: () => { goTab("workout"); setTimeout(openSessionsSheet, 260); } }
      }, "Pick a ready-made session")
    );
  }

  // Monday-first 7-day cadence strip: done / today / rest / open.
  function buildWeekStrip(completed, plan) {
    const doneDates = new Set(completed.map(w => w.date));
    const today = U.todayISO();
    const week = weekDatesFor();
    const goal = state.prefs.weeklyWorkoutGoal || 4;
    let doneCount = 0;

    const row = el("div", { class: "week-strip-row" });
    for (const { key, iso } of week) {
      const isDone = doneDates.has(iso);
      const isToday = iso === today;
      const isRest = plan[key] === "rest";
      if (isDone) doneCount++;
      let state2 = "open";
      if (isDone) state2 = "done";
      else if (isToday) state2 = "today";
      else if (isRest) state2 = "rest";
      const tile = el("div", { class: `week-tile is-${state2}` });
      if (isDone) {
        tile.appendChild(el("span", { class: "week-tile-check",
          html: '<svg viewBox="0 0 16 16" width="15" height="15"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>' }));
      } else if (isRest) {
        tile.appendChild(el("span", { class: "week-tile-dot" }));
      }
      row.appendChild(el("div", { class: "week-strip-day" + (isToday ? " is-today" : "") },
        el("span", { class: "week-strip-letter" }, WEEKDAY_LETTERS[key]),
        tile
      ));
    }

    return el("div", { class: "card week-strip-card", "data-testid": "home-week-strip" },
      el("div", { class: "row-between" },
        el("div", { class: "week-strip-heading" }, "Cadence"),
        el("div", { class: "week-strip-count" },
          el("span", { class: "week-strip-count-num" }, String(doneCount)),
          ` / ${goal} workouts`)
      ),
      row
    );
  }

  async function renderHome(view) {
    const [workouts, meals] = await Promise.all([Storage.getWorkouts(), Storage.getMeals()]);
    const completed = workouts.filter(w => w.completedAt);
    const today = U.todayISO();
    const todaysMeals = meals.filter(m => m.date === today);
    const todaysKcal = todaysMeals.reduce((s, m) => s + (m.kcal || 0), 0);
    const energy = await resolveEnergyBudget(today);
    const goal = energy.goal;
    const macroGoals = await resolveMacroGoals(today, energy);
    const todayMacros = U.sumMacros(todaysMeals);
    const personal = targetsArePersonal(energy);

    // Streak + this week volume
    const streak = computeStreak(completed);
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const weekWorkouts = completed.filter(w => new Date(w.date) >= weekAgo);
    const weekVolume = weekWorkouts.reduce((s, w) => {
      return s + (w.exercises || []).reduce((s2, ex) => s2 + U.volume(ex.sets), 0);
    }, 0);

    // 1) Greeting — date eyebrow, greeting, streak flame pill
    const profileName = (state.prefs?.profileName || "").trim();
    const dateStr = new Date().toLocaleDateString("en-GB",
      { weekday: "short", day: "numeric", month: "short" }).toUpperCase();
    // One line, not three. This block used to be a 62px logo bar plus a 58px
    // greeting in 26px type — 173px, a fifth of the first screen, before the
    // thing the screen is about even started. And the greeting set at 26px sat
    // directly above the session title at 34px, so two display lines competed
    // and the ambient one won on position. The mark comes inline, the date and
    // the greeting share a row at eyebrow size, and the hero gets the voice.
    const topbar = el("div", { class: "home-topbar" },
      el("div", { class: "home-topbar-main" },
        el("div", { class: "home-idrow" },
          el("span", { class: "home-mark", "aria-hidden": "true", html: LOGO_MARK }),
          el("h1", { class: "home-greeting" },
            el("span", { class: "home-date" }, dateStr),
            el("span", { class: "greet-sep" }, "·"),
            el("span", { class: "greet-part" }, profileName ? `Good ${greeting()}, ` : `Good ${greeting()}`),
            profileName ? el("span", { class: "greet-name" }, profileName) : null
          )
        )
      )
    );
    if (streak >= 1) {
      topbar.appendChild(el("div", { class: "streak-pill", title: `${streak}-day streak`, "data-testid": "home-streak-pill" },
        el("span", { class: "streak-flame", html: '<svg viewBox="0 0 15 17" width="15" height="17"><path d="M7.5 1C8 4 11 5 11 8.5A3.5 3.5 0 0 1 4 8.5c0-1 .4-1.6.9-2.2C5.6 7 6.5 7 6.5 5.4 6.5 3.6 6 2.3 7.5 1Z" fill="#f0883e"/><path d="M7.5 16a4 4 0 0 1-4-4c0-2.2 1.7-3.2 2.4-4.6.3 1.4 1.3 1.6 1.3 2.8 0 .9-.5 1.2-.5 1.9A1.8 1.8 0 0 0 10 12c0-1.6-.8-2.3-.8-2.3S11.5 10.5 11.5 12a4 4 0 0 1-4 4Z" fill="#ffb454"/></svg>' }),
        el("span", { class: "streak-num" }, String(streak))
      ));
    }
    view.appendChild(topbar);

    // Weekly-plan data for the today hero + week strip
    const [allEx, templates] = await Promise.all([getAllExercises(), getAllTemplates()]);
    const exById = new Map(allEx.map(e => [e.id, e]));
    const tplById = new Map(templates.map(t => [t.id, t]));
    const plan = getWeeklyPlan();

    // Active workout stays above everything — interrupt context
    if (state.activeWorkout) {
      const active = state.activeWorkout;
      const doneSets = (active.exercises || []).reduce((s, e) => s + U.workingSets(e.sets).length, 0);
      view.appendChild(el("div", {
        class: "card home-active-workout",
        style: "border-left: 3px solid var(--accent);",
        "data-testid": "home-active-workout"
      },
        el("div", { class: "row-between" },
          el("div", {},
            el("div", { class: "card-title", style: "margin: 0 0 4px 0;" }, "Active workout"),
            el("div", { style: "font-weight: 600; font-size: 16px;" }, active.name || "Workout"),
            el("div", { class: "text-xs text-faint mt-8" },
              `${active.exercises.length} ${active.exercises.length === 1 ? "exercise" : "exercises"} · ${doneSets} ${doneSets === 1 ? "set" : "sets"} logged`)
          ),
          el("button", {
            class: "btn btn-primary",
            "data-testid": "button-resume-workout",
            on: { click: () => { state.tab = "workout"; renderMain(); } }
          }, "Resume")
        )
      ));
    }

    // 2) Today's training — plan-driven hero (hidden while a workout is active).
    // Tier 1: the one block on Home that breaks the page inset.
    if (!state.activeWorkout) {
      const hero = buildTodayWorkoutHero({ plan, tplById, exById, completed });
      hero.classList.add("home-bleed");
      view.appendChild(hero);
    }

    // 2b) Back up your data — surfaced only when actually due (never exported,
    // a week stale, or 10 workouts on). The always-visible half of the
    // reminder; the every-10-workouts dialog on finish is the other half.
    const backupStatus = getBackupStatus(completed.length);
    if (backupStatus.needsBackup) {
      view.appendChild(renderHomeBackupCard(backupStatus));
    }

    // 3) Today — food room hero + stacked macro balance bar
    const todayBlock = homeSection(
      "Today",
      "home-section-today",
      renderEnergyBudgetCard(energy, todaysKcal, { meals, todaysMeals }),
      renderMacroStackBar(todayMacros, macroGoals, energy)
    );
    view.appendChild(todayBlock);

    // 4) This week — training cadence only (kcal lives under Today)
    const weekStats = el("div", { class: "card", "data-testid": "home-week-stats" },
      el("div", { class: "stat-row home-week-stat-row" },
        el("div", { class: "stat" },
          el("div", { class: "stat-label" }, "Streak"),
          el("div", { class: "stat-value" }, streak.toString()),
          el("div", { class: "stat-sub" }, streak === 1 ? "day" : "days")
        ),
        el("div", { class: "stat" },
          el("div", { class: "stat-label" }, "Sessions"),
          el("div", { class: "stat-value" }, weekWorkouts.length.toString()),
          el("div", { class: "stat-sub" }, "last 7 days")
        ),
        el("div", { class: "stat" },
          el("div", { class: "stat-label" }, "Volume"),
          el("div", {
            class: "stat-value"
          }, weekVolume >= 1000 ? (weekVolume / 1000).toFixed(1) + "k" : weekVolume.toString()),
          el("div", { class: "stat-sub" }, "kg lifted")
        )
      )
    );
    // Per-day volume, last 7 days
    const dayVols = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const iso = U.todayISO(d);
      dayVols.push(completed.filter(w => w.date === iso).reduce((sv, w) =>
        sv + (w.exercises || []).reduce((s2, ex) => s2 + U.volume(ex.sets), 0), 0));
    }
    const bwEntries = (await Storage.getBodyweights()).filter(b => b.kg > 0)
      .sort((a, b) => (a.date < b.date ? -1 : 1)).slice(-30);
    const bwVals = bwEntries.map(b => b.kg);
    const weekDuo = el("div", { class: "week-duo" },
      el("div", { class: "card week-mini-card", "data-testid": "home-week-volume" },
        el("div", { class: "week-mini-title" }, "Training volume"),
        miniBars(dayVols, { height: 58 }),
        // Both charts shipped with no axis, no dates and no numbers, so the
        // shape was the entire message and the scale was a guess.
        el("div", { class: "week-mini-foot" },
          el("span", {}, "Last 7 days"),
          el("span", { class: "week-mini-peak" }, (() => {
            const peak = Math.max(0, ...dayVols);
            // No k-suffix here: "1.7k" + "kg" reads as "1.7kkg".
            return peak ? `peak ${U.formatVolume(peak).replace(" ", "")}` : "nothing logged";
          })())
        )
      ),
      el("div", { class: "card week-mini-card", "data-testid": "home-week-bodyweight" },
        el("div", { class: "week-mini-title" }, "Bodyweight trend"),
        bwVals.length >= 2
          ? sparkline(bwVals, { height: 58 })
          : el("div", { class: "sparkline-empty", style: "height:58px" }, "No data yet"),
        el("div", { class: "week-mini-foot" },
          el("span", {}, "Last 30 days"),
          // Net change only. The full range wrapped to two lines in a card
          // this narrow, which looked like a rendering fault.
          el("span", { class: "week-mini-peak" }, (() => {
            if (bwVals.length < 2) return "log to start";
            const d = bwVals[bwVals.length - 1] - bwVals[0];
            return `${d > 0 ? "+" : ""}${U.trimNum(U.toDisplayWeight(d))}${U.weightUnit()}`;
          })())
        )
      )
    );
    const weekStrip = buildWeekStrip(completed, plan);
    view.appendChild(homeSection("This week", "home-section-week", weekStrip, weekStats, weekDuo));

    // 5) Trends — longer-range signals, secondary to action + today
    const trends = homeSection(
      "Trends",
      "home-section-trends",
      renderNutritionTrendCard(meals, goal, macroGoals, todayMacros, {
        estimate: !macrosArePersonal(macroGoals, energy),
        hideMacros: true,
        title: "Nutrition",
        titleMeta: "Last 14 days"
      }),
      await renderBodyweightCard(),
      await buildMuscleBalanceBlock(completed, exById),
      renderHeatmap(completed)
    );
    // Tier 3: reference material. Same content, no card furniture.
    trends.classList.add("home-chapter-quiet");
    view.appendChild(trends);

    // Quiet personalisation cue if still on estimates (setup CTA also lives on food room)
    if (!personal) {
      view.appendChild(el("div", {
        class: "home-estimate-foot text-xs text-faint",
        "data-testid": "home-estimate-foot"
      }, "Food room and macros above are starter estimates until you set your profile and bodyweight."));
    }
  }

  function renderMacroTiles(totals, macroGoals, energy) {
    const t = totals || { protein: 0, carbs: 0, fat: 0 };
    const goals = macroGoals?.hasGoals ? macroGoals.goals : null;
    const estimate = !macrosArePersonal(macroGoals, energy);
    const defs = [
      { key: "protein", label: "Protein", cls: "is-protein" },
      { key: "carbs", label: "Carbs", cls: "is-carbs" },
      { key: "fat", label: "Fat", cls: "is-fat" }
    ];
    const row = el("div", { class: "macro-tiles", "data-testid": "home-today-macros" });
    for (const d of defs) {
      const val = Math.round(t[d.key] || 0);
      const goal = goals ? Math.round(goals[d.key] || 0) : 0;
      const pct = goal > 0 ? Math.min(100, (val / goal) * 100) : (val > 0 ? 100 : 0);
      const tile = el("div", { class: "macro-tile " + d.cls, "data-testid": "macro-tile-" + d.key },
        el("div", { class: "macro-tile-label" }, d.label),
        el("div", { class: "macro-tile-value" }, `${val}g`),
        el("div", { class: "macro-tile-bar" },
          el("div", { class: "macro-tile-fill", style: `width:${pct}%` })
        ),
        goal > 0 ? el("div", { class: "macro-tile-goal" }, `of ${goal}g${estimate ? " est." : ""}`) : null
      );
      row.appendChild(tile);
    }
    return row;
  }

  // Single stacked bar showing macro *balance* (share of eaten calories) plus a
  // compact grams-vs-goal legend. Replaces the 3 flat tiles on Home.
  function renderMacroStackBar(totals, macroGoals, energy) {
    const t = totals || { protein: 0, carbs: 0, fat: 0 };
    const goals = macroGoals?.hasGoals ? macroGoals.goals : null;
    const estimate = !macrosArePersonal(macroGoals, energy);
    const defs = [
      { key: "protein", label: "Protein", cls: "is-protein", perG: 4 },
      { key: "carbs", label: "Carbs", cls: "is-carbs", perG: 4 },
      { key: "fat", label: "Fat", cls: "is-fat", perG: 9 }
    ];
    const kcals = defs.map(d => Math.max(0, (t[d.key] || 0)) * d.perG);
    const totalKcal = kcals.reduce((a, b) => a + b, 0);

    const card = el("div", { class: "card macro-stack-card", "data-testid": "home-today-macros" });
    card.appendChild(el("div", { class: "row-between", style: "align-items:baseline" },
      el("div", { class: "macro-stack-title" }, "Macros"),
      el("div", { class: "text-xs text-faint" }, totalKcal > 0 ? "share of calories eaten" : (estimate ? "targets are estimates" : ""))
    ));

    const bar = el("div", { class: "macro-stack-bar" });
    if (totalKcal > 0) {
      defs.forEach((d, i) => {
        const w = (kcals[i] / totalKcal) * 100;
        if (w > 0) bar.appendChild(el("div", { class: "macro-stack-seg " + d.cls, style: `width:${w}%`, title: d.label }));
      });
    } else {
      bar.appendChild(el("div", { class: "macro-stack-empty" }));
    }
    card.appendChild(bar);

    const legend = el("div", { class: "macro-stack-legend" });
    for (const d of defs) {
      const val = Math.round(t[d.key] || 0);
      const goal = goals ? Math.round(goals[d.key] || 0) : 0;
      legend.appendChild(el("div", { class: "macro-stack-item", "data-testid": "macro-tile-" + d.key },
        el("span", { class: "macro-stack-dot " + d.cls }),
        el("span", { class: "macro-stack-name" }, d.label),
        el("span", { class: "macro-stack-val" }, `${val}g`),
        goal > 0 ? el("span", { class: "macro-stack-goal" }, `/ ${goal}${estimate ? " est" : ""}`) : null
      ));
    }
    card.appendChild(legend);
    return card;
  }

  function miniBars(values, opts = {}) {
    const w = opts.width || 160;
    const h = opts.height || 56;
    const gap = 6;
    const nums = values.map(v => (typeof v === "number" && !isNaN(v)) ? v : 0);
    const max = Math.max(...nums, 1);
    const any = nums.some(v => v > 0);
    if (!any) {
      const empty = document.createElement("div");
      empty.className = "sparkline-empty";
      empty.style.height = h + "px";
      empty.textContent = "No sessions yet";
      return empty;
    }
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", h);
    svg.style.height = h + "px";
    svg.setAttribute("class", "mini-bars");
    const bw = (w - gap * (nums.length - 1)) / nums.length;
    nums.forEach((v, i) => {
      const bh = v > 0 ? Math.max(6, (v / max) * (h - 4)) : 4;
      const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      r.setAttribute("x", String(i * (bw + gap)));
      r.setAttribute("y", String(h - bh));
      r.setAttribute("width", String(bw));
      r.setAttribute("height", String(bh));
      r.setAttribute("rx", "3");
      r.setAttribute("fill", v > 0 ? "var(--accent)" : "var(--border)");
      svg.appendChild(r);
    });
    return svg;
  }

  function greeting() {
    const h = new Date().getHours();
    if (h < 12) return "morning";
    if (h < 18) return "afternoon";
    return "evening";
  }

  // Day or night, nothing in between. It only tints the hero band, and it is
  // an attribute rather than inline style so the whole thing lives in CSS and
  // costs one string comparison per render.
  function applyDaypart() {
    const h = new Date().getHours();
    document.documentElement.setAttribute("data-daypart", (h >= 19 || h < 6) ? "night" : "day");
  }

  function computeStreak(completed) {
    if (!completed.length) return 0;
    const dates = new Set(completed.map(w => w.date));
    let streak = 0;
    const d = new Date();
    // If not worked out today, check whether yesterday counts
    if (!dates.has(U.todayISO(d))) d.setDate(d.getDate() - 1);
    while (dates.has(U.todayISO(d))) { streak++; d.setDate(d.getDate() - 1); }
    return streak;
  }

  // ============ Weekly plan (lightweight split/program) ============
  // A plan maps weekdays to a template id or the literal "rest". Missing keys
  // are "open" days (decide at the gym). Weekday-based so "today's plan" needs
  // no rotation state and the week strip stays calendar-aligned.
  const WEEKDAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const WEEKDAY_LABELS = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" };
  const WEEKDAY_LETTERS = { mon: "M", tue: "T", wed: "W", thu: "T", fri: "F", sat: "S", sun: "S" };

  // Preset day focuses — assignable without a full template. `cat` pre-scopes
  // the exercise picker to that category when the session is started (null =
  // no scope). Stored on a day as "focus:<key>".
  const focusSvg = (inner) =>
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
  const DAY_FOCUSES = [
    { key: "push", label: "Push", short: "Push", cat: "chest", desc: "Chest, shoulders & triceps",
      icon: focusSvg('<path d="M4 12h9"/><path d="M10 8l4 4-4 4"/><path d="M18 4v16"/>') },
    { key: "pull", label: "Pull", short: "Pull", cat: "back", desc: "Back & biceps",
      icon: focusSvg('<path d="M20 12h-9"/><path d="M14 8l-4 4 4 4"/><path d="M6 4v16"/>') },
    { key: "legs", label: "Legs", short: "Legs", cat: "legs", desc: "Quads, hamstrings & glutes",
      icon: focusSvg('<path d="M9 3l-1 9-2 9"/><path d="M15 3l1 9 2 9"/><path d="M8.5 12h7"/>') },
    { key: "upper", label: "Upper body", short: "Upper", cat: "chest", desc: "Chest, back, shoulders & arms",
      icon: focusSvg('<path d="M6 8l2.5-3h7L18 8"/><path d="M8 5v6a4 4 0 008 0V5"/>') },
    { key: "lower", label: "Lower body", short: "Lower", cat: "legs", desc: "Legs & glutes",
      icon: focusSvg('<path d="M6 6h12l-1 6H7z"/><path d="M8.5 12l-1.5 9M15.5 12l1.5 9"/>') },
    { key: "full", label: "Full body", short: "Full", cat: null, desc: "A bit of everything",
      icon: focusSvg('<circle cx="12" cy="4.5" r="2"/><path d="M12 7v7"/><path d="M6.5 9.5l5.5 2 5.5-2"/><path d="M12 14l-3.5 6M12 14l3.5 6"/>') },
    { key: "arms", label: "Arms", short: "Arms", cat: "arms", desc: "Biceps & triceps",
      icon: focusSvg('<path d="M7 21v-6a3 3 0 013-3h1"/><path d="M11 12V6a2.5 2.5 0 015 0c0 3 2 4 2 7a4 4 0 01-8 .5"/>') },
    { key: "chest", label: "Chest", short: "Chest", cat: "chest", desc: "Chest focus",
      icon: focusSvg('<path d="M4 8h16v3a4 4 0 01-4 4h-2a2 2 0 01-4 0H8a4 4 0 01-4-4z"/><path d="M12 8v7"/>') },
    { key: "back", label: "Back", short: "Back", cat: "back", desc: "Back focus",
      icon: focusSvg('<path d="M12 3v18"/><path d="M12 7L6 9v4M12 7l6 2v4"/>') },
    { key: "shoulders", label: "Shoulders", short: "Delts", cat: "shoulders", desc: "Delts",
      icon: focusSvg('<circle cx="6.5" cy="12" r="3.5"/><circle cx="17.5" cy="12" r="3.5"/><path d="M10 12h4"/>') },
    { key: "core", label: "Core", short: "Core", cat: "core", desc: "Abs & core",
      icon: focusSvg('<rect x="8.5" y="4" width="7" height="16" rx="2"/><path d="M8.5 9.5h7M8.5 14.5h7"/>') },
    { key: "cardio", label: "Cardio", short: "Cardio", cat: "cardio", desc: "Conditioning",
      icon: focusSvg('<path d="M3 12h4l2-6 4 13 2.5-7H21"/>') }
  ];
  const REST_ICON = focusSvg('<path d="M20.5 14.5A8 8 0 1110.2 3.6a6 6 0 0010.3 10.9z"/>');
  const OPEN_ICON = focusSvg('<circle cx="12" cy="12" r="8" stroke-dasharray="3 3"/><path d="M12 8v4l3 2"/>');
  const TEMPLATE_ICON = focusSvg('<rect x="6" y="3.5" width="12" height="17" rx="2"/><path d="M9.5 9h5M9.5 13h5M9.5 17h3"/>');
  const DAY_FOCUS_BY_KEY = Object.fromEntries(DAY_FOCUSES.map(f => [f.key, f]));
  // Resolve a stored day value to a focus preset (or null).
  function focusFromValue(v) {
    return (typeof v === "string" && v.startsWith("focus:")) ? (DAY_FOCUS_BY_KEY[v.slice(6)] || null) : null;
  }
  // Category to pre-open the picker with after a focus-day "Start".
  let pendingPickerCat = null;

  // JS getDay(): 0=Sun..6=Sat → our Monday-first keys.
  function weekdayKeyFor(date = new Date()) {
    return WEEKDAY_KEYS[(date.getDay() + 6) % 7];
  }

  function getWeeklyPlan() {
    const p = state.prefs.weeklyPlan;
    return (p && typeof p === "object") ? p : {};
  }

  function planHasAny(plan) {
    return WEEKDAY_KEYS.some(k => plan[k] === "rest" || (plan[k] && plan[k] !== ""));
  }

  // Dates (ISO) for the Monday-first week containing `ref`.
  // What this week has already banked. Calendar week, not a rolling seven
  // days, so it can never disagree with the week strip sitting a screen below.
  function weekBanked(completed) {
    const inWeek = new Set(weekDatesFor().map(w => w.iso));
    let sessions = 0, volume = 0, secs = 0;
    for (const w of completed || []) {
      if (!inWeek.has(w.date)) continue;
      sessions += 1;
      for (const ex of (w.exercises || [])) volume += U.volume(ex.sets);
      // durationSec is null on a back-logged session, so fall back to the
      // clock and ignore anything implausible rather than inventing time.
      let s = Number(w.durationSec);
      if (!(s > 0) && w.completedAt && w.startedAt) s = (w.completedAt - w.startedAt) / 1000;
      if (s > 0 && s < 8 * 3600) secs += s;
    }
    return { sessions, volume: Math.round(volume), secs: Math.round(secs) };
  }

  function fmtBankedTime(secs) {
    if (!secs) return null;
    const m = Math.round(secs / 60);
    if (m < 60) return { value: String(m), unit: "minutes trained" };
    return { value: `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}`, unit: "time trained" };
  }

  function weekDatesFor(ref = new Date()) {
    const monday = new Date(ref);
    monday.setDate(ref.getDate() - ((ref.getDay() + 6) % 7));
    return WEEKDAY_KEYS.map((key, i) => {
      const d = new Date(monday); d.setDate(monday.getDate() + i);
      return { key, iso: U.todayISO(d) };
    });
  }

  const FOCUS_BUCKETS = [
    { key: "Chest", match: /pector|chest/i },
    { key: "Back", match: /lat|rhomboid|trap|erector|\bback\b/i },
    { key: "Shoulders", match: /deltoid|shoulder/i },
    { key: "Arms", match: /bicep|tricep|forearm|brachial/i },
    { key: "Legs", match: /quad|hamstring|glute|calf|calves|adductor|abductor|hip/i },
    { key: "Core", match: /abdominal|oblique|core|quadratus/i }
  ];

  // ============ Pre-built sessions ============
  // Presets share the template shape, so the planner, Templates sheet and
  // "Start" flow treat them like any other template — they're just read-only.
  function presetSessions() {
    return (typeof window !== "undefined" && Array.isArray(window.PRESET_SESSIONS))
      ? window.PRESET_SESSIONS : [];
  }
  // ---- kit & venue taxonomy ----------------------------------------------
  // Orthogonal to `pillar`. Equipment is an OR-list per exercise: you can do a
  // move if you have ANY item in its list, and a session if that holds for
  // every exercise in it.
  const GEAR_ORDER = ["band", "dumbbell", "kettlebell", "barbell", "pullup-bar",
    "dip-bars", "jump-rope", "ab-wheel", "machine", "cable", "cardio-machine",
    "sled", "sandbag", "med-ball", "heavy-bag", "focus-pads"];
  const GEAR_META = {
    band: "Bands", dumbbell: "Dumbbells", kettlebell: "Kettlebells", barbell: "Barbell",
    "pullup-bar": "Pull-up bar", "dip-bars": "Dip bars", "jump-rope": "Jump rope",
    "ab-wheel": "Ab wheel", machine: "Machines", cable: "Cables", "cardio-machine": "Cardio machine",
    // The Hyrox kit. Each of these is genuinely the thing that decides whether
    // a session is on today — no amount of improvising gets you a sled — so
    // they are separate entries rather than being folded into "Machines".
    sled: "Sled", sandbag: "Sandbag", "med-ball": "Medicine ball",
    // Pad work needs someone to hold them, so the kit entry says so — it is
    // the thing that decides whether a session is on today.
    "heavy-bag": "Heavy bag", "focus-pads": "Pads + partner"
  };
  const VENUE_META = { gym: "Gym", home: "Home", outdoors: "Outdoors" };

  let _gearById = null, _gearN = -1;
  function gearDefs() {
    const defs = window.EXERCISE_DB || [];
    if (!_gearById || _gearN !== defs.length) {
      _gearById = new Map(defs.map(e => [e.id, e]));
      _gearN = defs.length;
    }
    return _gearById;
  }

  /** Kit + venue metadata for any template. Presets ship with it derived at load;
      user templates get the same treatment on demand. Custom exercises aren't in
      the DB, so they count as no-gear — the honest default for a made-up move. */
  function sessionMeta(t) {
    if (!t) return t;
    if (Array.isArray(t.needs) && Array.isArray(t.gear)) return t;
    const byId = gearDefs();
    const needs = [];
    const all = new Set();
    for (const e of (t.exercises || [])) {
      const def = byId.get(e.exerciseId);
      // An entry may narrow the exercise's options. A thruster is barbell OR
      // dumbbell OR kettlebell, and that is right in the library — but Fran is
      // a barbell at 43 kg, and offering it to someone holding two dumbbells
      // is offering them a different workout under a name that means a
      // specific one. Narrowing only: see the subset check in the suite.
      const g = (e.gear && e.gear.length) ? e.gear
        : ((def && def.gear && def.gear.length) ? def.gear : ["none"]);
      needs.push(g);
      for (const x of g) all.add(x);
    }
    t.needs = needs;
    t.gear = [...all].filter(x => x !== "none")
      .sort((a, b) => GEAR_ORDER.indexOf(a) - GEAR_ORDER.indexOf(b));
    t.bodyweightOnly = needs.length > 0 && needs.every(g => g.includes("none"));
    if (!t.venue || !t.venue.length) {
      t.venue = t.bodyweightOnly ? ["home", "gym", "outdoors"] : ["gym"];
    }
    return t;
  }

  /** What the user says they own, as a Set. Empty means "not configured yet". */
  function myKit() {
    return new Set(Array.isArray(state.prefs.myKit) ? state.prefs.myKit : []);
  }

  /** Doable with `kit`: every exercise has at least one option you own. */
  function sessionFitsKit(t, kit) {
    const m = sessionMeta(t);
    if (!m.needs || !m.needs.length) return true;
    return m.needs.every(or => or.some(g => g === "none" || kit.has(g)));
  }

  /** User templates plus the built-in sessions, newest user templates first. */
  async function getAllTemplates() {
    const mine = (await Storage.getTemplates()).slice().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    return [...mine, ...presetSessions()];
  }
  const isPresetId = (id) => typeof id === "string" && id.startsWith("preset-");

  /** Total prescribed seconds for an interval plan. */
  function intervalTotalSec(intervals) {
    return (intervals?.steps || []).reduce((s, st) => s + (st.sec || 0), 0);
  }
  /** Compact human summary, e.g. "4 × 4:00 hard · 43 min". */
  function intervalSummary(intervals) {
    const steps = intervals?.steps || [];
    const work = steps.filter(s => s.work);
    const mins = Math.round(intervalTotalSec(intervals) / 60);
    if (!work.length) return `${mins} min`;
    const first = work[0];
    const uniform = work.every(s => s.sec === first.sec && s.intensity === first.intensity);
    if (uniform && work.length > 1) {
      return `${work.length} × ${U.formatTime(first.sec)} ${(U.INTENSITY[first.intensity]?.label || "").toLowerCase()} · ${mins} min`;
    }
    if (work.length === 1) return `${U.formatTime(first.sec)} ${(U.INTENSITY[first.intensity]?.label || "").toLowerCase()} · ${mins} min`;
    return `${work.length} efforts · ${mins} min`;
  }

  // Short "Chest & Triceps"-style label from a template's exercises.
  function templateFocus(template, byId) {
    // A conditioning protocol's focus is the protocol, not whichever muscles
    // running happens to list — "Core" on a 4×4 would be nonsense.
    if (template?.pillar === "conditioning") return "Conditioning";
    if (template?.pillar === "recovery") return "Recovery";
    const counts = {};
    for (const te of (template.exercises || [])) {
      const def = byId.get(te.exerciseId);
      const muscles = def?.muscles || [];
      const hit = new Set();
      for (const m of muscles) for (const b of FOCUS_BUCKETS) if (b.match.test(m)) hit.add(b.key);
      for (const k of hit) counts[k] = (counts[k] || 0) + 1;
    }
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(e => e[0]);
    return top.length ? top.slice(0, 2).join(" & ") : null;
  }

  // Rough session length: ~3.5 min per strength set (incl rest) + cardio minutes.
  const SET_MIN = 3.5;          // a normal working set, rest included
  const LIFT_SEC = 4;           // one barbell movement inside a complex
  const COMPLEX_REST_SEC = 150; // a complex round earns a real rest

  function templateEstMin(template) {
    const defs = gearDefs();
    let min = 0;
    for (const te of (template.exercises || [])) {
      const sets = Math.max(1, te.targetSets || 1);
      // Interval protocols carry their own prescribed length.
      if (te.intervals) min += intervalTotalSec(te.intervals) / 60;
      else if (te.targetDurationMin != null) min += te.targetDurationMin;
      // A timed hold states its own seconds. Counting it as 3.5 minutes of
      // strength set is a guess standing in front of an exact number.
      else if (te.targetSeconds != null) min += (sets * te.targetSeconds) / 60;
      else {
        // A set of a complex is not one lift, it is the whole sequence. Seven
        // reps of the Bear is thirty-five barbell movements without setting
        // the bar down, and charging that the same 3.5 minutes as a set of
        // eight curls understates both the work and the rest it earns.
        const seq = (defs.get(te.exerciseId) || {}).complex;
        if (seq && seq.length) {
          const lifts = Math.max(1, te.targetReps || 1) * seq.reduce((a, s) => a + (s.reps || 1), 0);
          min += sets * (lifts * LIFT_SEC + COMPLEX_REST_SEC) / 60;
        } else {
          min += (te.targetSets || 3) * SET_MIN;
        }
      }
    }
    return Math.max(5, Math.round(min / 5) * 5);
  }

  /** The exact planned length of a circuit, in seconds.
   *
   *  Every circuit's timeline is fully determined by its spec and its station
   *  count, so there is nothing to estimate — and estimating anyway was badly
   *  wrong. The Carry & Swing Circuit is five rounds of three 45-second
   *  stations with transitions and a minute's rest, which is 21 minutes; the
   *  per-set guess called it 40.
   *
   *  Computed by the step builder itself rather than by arithmetic repeated
   *  here, so the number on the card and the clock in the runner cannot
   *  disagree. Template entries hold `targetSeconds` where workout entries
   *  hold `sets[r].seconds`, so they are shimmed into that shape. */
  function circuitPlannedSec(t) {
    const spec = t && t.circuit;
    if (!spec) return 0;
    const defs = gearDefs();
    const rounds = Math.max(1, spec.rounds || 1);
    const shim = (t.exercises || []).map(e => ({
      exerciseId: e.exerciseId,
      name: e.name,
      type: (defs.get(e.exerciseId) || {}).type,
      sets: Array.from({ length: rounds },
        () => ({ seconds: e.targetSeconds != null ? e.targetSeconds : null }))
    }));
    return buildCircuitSteps(shim, spec, defs).reduce((a, s) => a + s.sec, 0);
  }

  /** What a template entry actually prescribes, in whatever terms it uses.
   *
   *  The details sheet rendered every entry as `targetSets || 3` × `targetReps
   *  || 8`, which is right for the 185 preset entries prescribed in reps and
   *  invented a number for the other 58. A farmer's carry of 5 × 45 seconds
   *  read "5 × 8". Fran read "3 × 8" directly underneath prose saying
   *  twenty-one, fifteen and nine, and Murph's two one-mile runs read "2 × 8".
   *
   *  Nothing in the library states no prescription at all, so the invented
   *  defaults were never load-bearing — they only ever fired where the entry
   *  was measured in something other than reps. */
  function templateEntryPrescription(e) {
    if (!e) return "—";
    const sets = Math.max(1, e.targetSets || 1);
    const times = (v) => (sets > 1 ? `${sets} × ${v}` : String(v));
    // A ladder is the prescription; a set count alongside it would be noise.
    if (Array.isArray(e.repScheme) && e.repScheme.length) return e.repScheme.join("-");
    if (e.targetReps != null) return `${e.targetSets || 3} × ${e.targetReps}`;
    if (e.targetSeconds != null) return times(`${e.targetSeconds}s`);
    if (e.targetDistanceKm != null) return times(U.formatDistance(e.targetDistanceKm));
    if (e.targetDurationMin != null) return times(`${e.targetDurationMin} min`);
    return e.targetSets ? `${e.targetSets} set${e.targetSets === 1 ? "" : "s"}` : "—";
  }

  /** How long a session takes, in the terms that session actually has.
   *
   *  The per-set estimate above is a reasonable guess for a strength session
   *  and nonsense for a scored one, where the clock is the format rather than
   *  a consequence of it. Cindy is twenty minutes by definition and was
   *  advertised as "~10 min" — three exercises at one set each — which is the
   *  wrong number in the one place you use to decide whether you have time.
   *
   *  An AMRAP runs exactly its cap, so it is stated flat. For Time ends when
   *  the work does, so the cap is an upper bound and says so: "up to 75 min"
   *  is true of Murph in a way "~75 min" and "~20 min" both are not. */
  function templateLengthLabel(template) {
    const cap = template && template.circuit && template.circuit.capSec;
    if (cap > 0) {
      const mins = Math.round(cap / 60);
      if (template.circuit.mode === "amrap") return `${mins} min`;
      if (template.circuit.mode === "fortime") return `up to ${mins} min`;
    }
    // An EMOM or a timed circuit runs to a schedule the app wrote itself, so
    // its length is a fact rather than a guess and is stated without a tilde.
    if (template && template.circuit) {
      const sec = circuitPlannedSec(template);
      if (sec > 0) return `${Math.round(sec / 60)} min`;
    }
    return `~${templateEstMin(template)} min`;
  }

  function renderHeatmap(completed) {
    const card = el("div", { class: "card" });
    card.appendChild(cardHead("Training frequency", "Last 24 weeks"));

    const map = new Map(); // date → count
    for (const w of completed) map.set(w.date, (map.get(w.date) || 0) + 1);

    const weeks = 24;
    const today = new Date();
    const grid = el("div", { class: "heatmap" });
    // Column-per-week layout (grid-auto-flow: column, 7 rows Mon-Sun).
    // Anchor start to a Monday `weeks-1` weeks before this week's Monday.
    const start = new Date(today);
    const dayIdx = (start.getDay() + 6) % 7; // Mon=0 ... Sun=6
    start.setDate(start.getDate() - dayIdx - (weeks - 1) * 7);
    const totalDays = weeks * 7;
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const iso = U.todayISO(d);
      const count = map.get(iso) || 0;
      const level = Math.min(4, count);
      const cell = el("div", {
        class: "heatmap-cell",
        title: `${U.formatDate(iso, { year: "numeric" })}${count ? ` — ${count} workout${count > 1 ? "s" : ""}` : " — rest"}`,
        "data-level": level
      });
      grid.appendChild(cell);
    }
    card.appendChild(grid);
    card.appendChild(el("div", { class: "heatmap-legend" },
      "Less",
      el("div", { class: "heatmap-cell", "data-level": "0", style: "width:10px;height:10px;cursor:default" }),
      el("div", { class: "heatmap-cell", "data-level": "1", style: "width:10px;height:10px;cursor:default" }),
      el("div", { class: "heatmap-cell", "data-level": "2", style: "width:10px;height:10px;cursor:default" }),
      el("div", { class: "heatmap-cell", "data-level": "3", style: "width:10px;height:10px;cursor:default" }),
      el("div", { class: "heatmap-cell", "data-level": "4", style: "width:10px;height:10px;cursor:default" }),
      "More"
    ));
    return card;
  }

  // Size the exercise picker to the gap between where it actually starts and
  // the top of the dock. One listener at a time: renderWorkout runs on every
  // re-render, and adding a fresh resize handler each time would pile them up
  // against nodes that are no longer on the page.
  let pickerFitHandler = null;
  function fitPickerScreen(host) {
    const fit = () => {
      if (!host.isConnected) return;
      const top = host.getBoundingClientRect().top;
      const dock = document.querySelector(".dock");
      const floor = dock ? dock.getBoundingClientRect().top : window.innerHeight;
      const h = Math.round(floor - top - 8);
      if (h > 240) host.style.height = h + "px";
    };
    if (pickerFitHandler) window.removeEventListener("resize", pickerFitHandler);
    pickerFitHandler = fit;
    window.addEventListener("resize", fit);
    requestAnimationFrame(() => requestAnimationFrame(fit));
  }

  // ============ WORKOUT ============
  async function renderWorkout(view) {
    if (!state.activeWorkout) {
      // Primary path — tap to add exercises, then start when ready.
      const all = await getAllExercises();
      // A focus day's "Start" pre-opens the picker on that category (once).
      const initialCat = pendingPickerCat;
      pendingPickerCat = null;
      const picker = buildExercisePickerUI(all, {
        confirmLabel: (n) => `Start workout · ${n} exercise${n === 1 ? "" : "s"}`,
        allowCustom: true,
        customImmediate: false,
        wheel: true,
        dial: true,
        initialCat,
        onConfirm: async (items) => {
          const exercises = [];
          for (const it of items) exercises.push(await buildExerciseEntry(it.id, it.name));
          await beginWorkoutSession({ name: suggestedName(), exercises, source: "empty" });
        }
      });
      // Two equal ways to start: build it yourself, or take one off the shelf.
      const pickerHost = el("div", { class: "xpick-screen" }, picker.body);
      const sessionsHost = el("div", { style: "display:none" });
      const modeRow = el("div", { class: "start-mode", "data-testid": "start-mode" },
        el("button", { class: "start-mode-btn active", type: "button", "data-mode": "exercises", "data-testid": "start-mode-exercises" }, "Exercises"),
        el("button", { class: "start-mode-btn", type: "button", "data-mode": "sessions", "data-testid": "start-mode-sessions" }, "Sessions")
      );
      let sessionsBuilt = false;
      const setMode = async (m) => {
        modeRow.querySelectorAll(".start-mode-btn").forEach(b =>
          b.classList.toggle("active", b.getAttribute("data-mode") === m));
        pickerHost.style.display = m === "exercises" ? "" : "none";
        sessionsHost.style.display = m === "sessions" ? "" : "none";
        extras.style.display = m === "exercises" ? "" : "none";
        if (m === "sessions" && !sessionsBuilt) {
          sessionsBuilt = true;
          const mine = (await Storage.getTemplates()).slice().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
          const sp = buildSessionPickerUI(mine, presetSessions(), {});
          sessionsHost.appendChild(sp.body);
          sp.refresh();
        }
      };
      modeRow.querySelectorAll(".start-mode-btn").forEach(b =>
        b.addEventListener("click", () => setMode(b.getAttribute("data-mode"))));
      // Trailing cards belong to the "build it yourself" flow — Sessions mode
      // replaces them, so they hide rather than trail underneath.
      const extras = el("div", { "data-testid": "start-extras" });
      view.appendChild(modeRow);
      view.appendChild(pickerHost);
      view.appendChild(sessionsHost);
      view.appendChild(extras);
      picker.refresh();

      // The picker's height was `100dvh - 120px`, which assumes it starts at
      // the top of the page. It starts below the Exercises/Sessions row, so
      // the guess ran ~13px past the dock — and the confirm bar then padded
      // itself by a whole dock height to compensate, costing 108px of list the
      // moment you selected anything. Measure where it actually starts and end
      // it at the dock; the guess stays in CSS as the pre-paint fallback.
      fitPickerScreen(pickerHost);

      // Edge handles: Weekly plan (left) and Templates (right). They surface two
      // buried flows and — being pinned to the screen edge — don't clash with
      // the exercise picker's centre horizontal swipe (category paging).
      const CHEV_R = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
      const CHEV_L = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
      view.appendChild(el("button", {
        class: "wk-edge wk-edge-left", type: "button", "data-testid": "edge-plan", "aria-label": "Weekly plan",
        on: { click: openWeeklyPlanQuiz }
      }, el("span", { class: "wk-edge-chev", html: CHEV_R }), el("span", { class: "wk-edge-text" }, "Plan")));
      view.appendChild(el("button", {
        class: "wk-edge wk-edge-right", type: "button", "data-testid": "edge-templates", "aria-label": "Sessions",
        on: { click: openSessionsSheet }
      }, el("span", { class: "wk-edge-chev", html: CHEV_L }), el("span", { class: "wk-edge-text" }, "Sessions")));

      // Edge-swipe: a horizontal swipe that STARTS at the screen edge opens the
      // matching flow. Starting at the edge is what keeps it clear of the picker.
      const EDGE = 30;
      let esx = 0, esy = 0, esEdge = null;
      view.addEventListener("touchstart", (e) => {
        if (e.touches.length !== 1) { esEdge = null; return; }
        const x = e.touches[0].clientX, w = window.innerWidth;
        esEdge = x <= EDGE ? "left" : (x >= w - EDGE ? "right" : null);
        esx = x; esy = e.touches[0].clientY;
      }, { passive: true });
      view.addEventListener("touchend", (e) => {
        if (!esEdge) return;
        const t = e.changedTouches[0], dx = t.clientX - esx, dy = t.clientY - esy, was = esEdge;
        esEdge = null;
        if (Math.abs(dx) < 46 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
        if (was === "left" && dx > 0) openWeeklyPlanQuiz();
        else if (was === "right" && dx < 0) openTemplatesSheet();
      }, { passive: true });

      // Repeat last completed session — compact fast path.
      const last = await getLastCompletedWorkout();
      if (last) {
        const exCount = (last.exercises || []).length;
        const names = (last.exercises || []).slice(0, 4).map(e => e.name).join(" · ");
        const more = exCount > 4 ? ` +${exCount - 4} more` : "";
        extras.appendChild(el("div", { class: "card session-speed-card" },
          el("div", { class: "row-between", style: "gap: 12px; align-items: center" },
            el("div", { style: "min-width: 0" },
              el("div", { class: "card-title", style: "margin: 0 0 4px 0" }, "Repeat last session"),
              el("div", { class: "text-xs text-muted session-speed-preview" },
                (last.name ? last.name + " · " : "") + names + more)
            ),
            el("button", {
              class: "btn btn-primary btn-sm",
              style: "flex: none",
              on: { click: () => startFromLastWorkout(last) }
            }, "Start")
          )
        ));
      }

      // Weekly plan entry — summarises the split and opens the editor.
      const wplan = getWeeklyPlan();
      const trainingDays = WEEKDAY_KEYS.filter(k => wplan[k] && wplan[k] !== "rest").length;
      const restDays = WEEKDAY_KEYS.filter(k => wplan[k] === "rest").length;
      const planSummary = planHasAny(wplan)
        ? `${trainingDays} training day${trainingDays === 1 ? "" : "s"}` + (restDays ? ` · ${restDays} rest` : "")
        : "Not set up yet";
      extras.appendChild(el("div", { class: "card wplan-entry", "data-testid": "workout-weekly-plan" },
        el("div", { class: "row-between", style: "gap:12px;align-items:center" },
          el("div", { style: "min-width:0" },
            el("div", { class: "card-title", style: "margin:0 0 4px 0" }, "Weekly plan"),
            el("div", { class: "text-xs text-muted" }, planSummary)
          ),
          el("button", {
            class: "btn btn-sm", style: "flex:none",
            on: { click: openWeeklyPlanQuiz }
          }, planHasAny(wplan) ? "Edit" : "Set up")
        )
      ));

      // Templates section — collapsible, collapsed by default to keep the
      // exercise card the focus on small screens.
      const templates = await Storage.getTemplates();
      const tplBody = el("div", { class: "xcollapse-body" });
      if (templates.length === 0) {
        tplBody.appendChild(el("p", { class: "text-sm text-faint", style: "margin: 8px 0" },
          "No templates yet. Build one below, or finish a workout and save it as a template."));
      } else {
        const grid = el("div", { class: "template-grid" });
        for (const t of templates.slice().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))) {
          const isCardioEntry = e => e.targetDurationMin != null || looksLikeCardio({ id: e.exerciseId, name: e.name });
          const setsTotal = t.exercises.reduce((s, e) => s + (isCardioEntry(e) ? 0 : (e.targetSets || 3)), 0);
          const cardioMin = t.exercises.reduce((s, e) => s + (isCardioEntry(e) ? (e.targetDurationMin || 0) : 0), 0);
          grid.appendChild(el("div", { class: "template-card" },
            el("div", { class: "template-card-name" }, t.name),
            el("div", { class: "template-card-meta" },
              [
                `${t.exercises.length} ${t.exercises.length === 1 ? "exercise" : "exercises"}`,
                setsTotal > 0 ? `${setsTotal} sets` : null,
                cardioMin > 0 ? `${cardioMin} min cardio` : null
              ].filter(Boolean).join(" · ")),
            el("div", { class: "template-card-exercises" },
              t.exercises.slice(0, 4).map(e => e.name).join(" · "),
              t.exercises.length > 4 ? ` +${t.exercises.length - 4} more` : ""),
            el("div", { class: "row mt-8", style: "gap: 6px" },
              el("button", { class: "btn btn-primary btn-sm", on: { click: () => startNewWorkout(t) } }, "Start"),
              el("button", { class: "btn btn-sm", on: { click: () => openTemplateEditor(t) } }, "Edit"),
              el("button", { class: "icon-btn", title: "Delete template", on: { click: async () => {
                if (!(await confirmDialog(`Delete template “${t.name}”?`, { title: "Delete template?", okLabel: "Delete", danger: true }))) return;
                await Storage.deleteTemplate(t.id);
                renderMainKeepScroll();
              } }, html: icons.trash })
            )
          ));
        }
        tplBody.appendChild(grid);
      }
      // Manual "New template" button
      tplBody.appendChild(el("button", { class: "btn btn-ghost btn-sm mt-8", on: { click: () => openTemplateEditor(null) } },
        el("span", { html: icons.plus }), "Create template manually"
      ));
      const tplChevron = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
      const tplHead = el("button", { class: "xcollapse-head", type: "button", "aria-expanded": "false", "data-testid": "templates-toggle" },
        el("span", { class: "xcollapse-title" }, "Templates"),
        el("span", { class: "xcollapse-count" }, String(templates.length)),
        el("span", { class: "xcollapse-spacer" }),
        el("span", { class: "xcollapse-chev", html: tplChevron })
      );
      const tplCard = el("div", { class: "card xcollapse" }, tplHead, tplBody);
      tplHead.addEventListener("click", () => {
        const open = tplCard.classList.toggle("open");
        tplHead.setAttribute("aria-expanded", open ? "true" : "false");
      });
      extras.appendChild(tplCard);
      return;
    }

    await renderActiveWorkout(view);
  }

  // Full-screen celebration overlay. Tap anywhere or the CTA to continue.
  const EX_CHEERS = [
    { e: "💪", t: "Crushed it!" }, { e: "🔥", t: "On fire!" },
    { e: "😤", t: "Strong work!" }, { e: "⚡", t: "Electric!" },
    { e: "🎯", t: "Dialled in!" }, { e: "🚀", t: "Keep climbing!" },
    { e: "🦁", t: "Beast mode!" }, { e: "👏", t: "Well done!" }
  ];
  function showCelebration({ emoji, title, message, stats, ctaLabel = "Continue", onContinue, big = false }) {
    const prev = document.getElementById("celebration");
    if (prev) prev.remove();
    const overlay = el("div", { id: "celebration", class: "celebration" + (big ? " celebration-big" : "") });
    let fired = false;
    const done = () => {
      if (fired) return; fired = true;
      overlay.classList.add("out");
      setTimeout(() => overlay.remove(), 240);
      if (onContinue) onContinue();
    };
    const inner = el("div", { class: "celebration-inner" },
      el("div", { class: "celebration-emoji" }, emoji),
      el("div", { class: "celebration-title" }, title),
      message ? el("div", { class: "celebration-msg" }, message) : null,
      (stats && stats.length) ? el("div", { class: "celebration-stats" },
        ...stats.map(s => el("div", { class: "celebration-stat" },
          el("div", { class: "celebration-stat-val" }, s.value),
          el("div", { class: "celebration-stat-lbl" }, s.label)
        ))
      ) : null,
      el("button", { class: "btn btn-primary btn-block celebration-cta", on: { click: (e) => { e.stopPropagation(); done(); } } }, ctaLabel)
    );
    overlay.appendChild(inner);
    overlay.addEventListener("click", done);
    document.body.appendChild(overlay);
  }

  // Active workout as a vertical card pager — one card per exercise (or per
  // superset group), a Finish card at the end, celebrations on completion.
  async function renderActiveWorkout(view) {
    const w = state.activeWorkout;
    const exs = w.exercises || [];

    // Group consecutive exercises that share a supersetGroup into one card.
    const cards = [];
    for (let i = 0; i < exs.length; i++) {
      const g = exs[i].supersetGroup;
      const last = cards[cards.length - 1];
      if (g && last && last.group === g) last.idxs.push(i);
      else cards.push({ group: g || null, idxs: [i] });
    }
    const totalCards = cards.length;
    const panelCount = totalCards + 1; // + Finish card

    const screen = el("div", { class: "wpager-screen" });

    // Slim top bar: name + timer + Finish
    const timeElapsed = Math.floor((Date.now() - w.startedAt) / 1000);
    // The day is editable while the session is live. Two reasons: you can log
    // a session you forgot to record yesterday without inventing a live timer
    // for it, and a session that runs past midnight stops silently landing on
    // the wrong day with nothing on screen to reveal it.
    const dayChip = el("button", {
      class: "wtopbar-day" + (w.date !== U.todayISO() ? " is-past" : ""),
      type: "button", "data-testid": "wtopbar-day",
      title: "Change the day this session is logged on",
      on: { click: () => openDateSheet({
        title: "Log this session on", confirmLabel: "Use this day", date: w.date,
        onPick: async (d) => {
          if (d === w.date) return;
          w.date = d;
          await Storage.saveWorkout(w);
          renderMainKeepScroll();
          toast(d === U.todayISO() ? "Logging to today" : `Logging to ${U.formatDate(d)}`);
        }
      }) }
    }, w.date === U.todayISO() ? "Today" : U.formatDate(w.date));

    screen.appendChild(el("div", { class: "wtopbar" },
      el("div", { class: "wtopbar-main" },
        el("div", { class: "wtopbar-name" }, w.name || "Workout"),
        el("div", { class: "wtopbar-meta" },
          el("div", { class: "workout-timer", id: "workout-elapsed" }, U.formatTime(timeElapsed)),
          dayChip)
      ),
      // Back into the runner after stepping out of it. Only offered while it
      // still has something to do — a button that opens an empty flow is worse
      // than no button.
      guidedHasWork(w) ? el("button", {
        class: "btn btn-sm wtopbar-guided", type: "button", "data-testid": "open-guided",
        title: "Log sets one at a time, full screen",
        on: { click: () => openSetRunner() }
      }, "Guided") : null,
      el("button", { class: "btn btn-primary btn-sm", on: { click: onFinishWorkout } }, "Finish")
    ));

    // Sessions the timer can run end to end rather than one guessed number at
    // a time: a stretch flow, or a round-based circuit. Offered, never forced,
    // and the manual rows stay exactly as they were.
    {
      const byId = new Map((await getAllExercises()).map(e => [e.id, e]));
      const spec = circuitSpecFor(w);
      let cta = null;

      if (spec) {
        const steps = buildCircuitSteps(exs, spec, byId);
        const mins = Math.round(steps.reduce((a, st) => a + st.sec, 0) / 60);
        const rounds = spec.rounds || 1;
        // A scored format has no round count to advertise — that is the thing
        // being measured. Falling through to the generic line printed
        // "1 rounds · 3 stations" on a twenty-minute AMRAP.
        const scoredSub = spec.mode === "amrap"
          ? `As many rounds as possible · ${exs.length} stations · ${mins} min cap`
          : `For time · ${exs.length} stations · ${mins} min cap`;
        cta = {
          title: w.score ? "Run it again" : "Run this circuit",
          sub: SCORED_MODES[spec.mode] ? scoredSub
            : (spec.mode === "emom"
              ? `${rounds} rounds · every ${spec.slotSec || 60}s on the minute · ~${mins} min`
              : `${rounds} rounds · ${exs.length} stations · ~${mins} min`),
          testid: "start-circuit",
          go: () => openCircuitRun(w)
        };
      } else {
        const flow = flowEntries(w, byId);
        const holdSets = flow.reduce((n, f) => n + (f.ex.sets || []).length, 0);
        const allSets = exs.reduce((n, e) => n + (e.sets || []).length, 0);
        if (holdSets >= 3 && holdSets / Math.max(1, allSets) >= 0.6) {
          const mins = Math.round(buildFlowSteps(flow, byId).reduce((a, st) => a + st.sec, 0) / 60);
          const doneAll = flow.every(f => (f.ex.sets || []).every(x => x.done));
          cta = {
            title: doneAll ? "Run the flow again" : "Run this flow",
            sub: `${holdSets} hold${holdSets === 1 ? "" : "s"} · ~${mins} min · cues each change`,
            testid: "start-flow",
            go: () => openMobilityFlow(w)
          };
        }
      }

      // A scored run's whole output is one number, and it does not appear in
      // the set rows. Without this the screen looks identical before and
      // after: you finish a twenty-minute AMRAP, a toast goes by, and nothing
      // on the page says it was recorded.
      if (w.score) screen.appendChild(scoreCard(w.score));

      if (cta) {
        screen.appendChild(el("div", { class: "flow-cta", "data-testid": "flow-cta" },
          el("div", { class: "flow-cta-text" },
            el("div", { class: "flow-cta-title" }, cta.title),
            el("div", { class: "flow-cta-sub" }, cta.sub)),
          el("button", {
            class: "btn btn-primary btn-sm", type: "button", "data-testid": cta.testid,
            on: { click: cta.go }
          }, el("span", { html: icons.play }), "Start")
        ));
      }
    }

    const pager = el("div", { class: "wpager", "data-testid": "wpager" });
    const dots = el("div", { class: "wpager-dots" });
    screen.appendChild(pager);
    screen.appendChild(dots);

    let activeIdx = 0;
    function goToPanel(i) {
      const p = pager.children[i];
      if (p) { workoutScrollIdx = i; pager.scrollTo({ top: p.offsetTop, behavior: "smooth" }); }
    }
    function renderDots() {
      clear(dots);
      for (let i = 0; i < panelCount; i++) {
        const finished = i < totalCards && cards[i].idxs.every(x => exs[x].finished);
        dots.appendChild(el("button", {
          class: "wdot" + (i === activeIdx ? " active" : "") + (finished ? " done" : ""),
          type: "button", "data-idx": String(i), on: { click: () => goToPanel(i) }
        }));
      }
    }
    function syncDots() {
      for (const d of Array.from(dots.children)) d.classList.toggle("active", Number(d.getAttribute("data-idx")) === activeIdx);
    }

    function finishCard(ci) {
      for (const i of cards[ci].idxs) exs[i].finished = true;
      Storage.saveWorkout(w);
      const cheer = EX_CHEERS[Math.floor(Math.random() * EX_CHEERS.length)];
      const remaining = cards.filter((c, i) => i !== ci && !c.idxs.every(x => exs[x].finished)).length;
      showCelebration({
        emoji: cheer.e,
        title: cheer.t,
        message: remaining > 0 ? `${remaining} exercise${remaining === 1 ? "" : "s"} to go` : "Last one done — finish up!",
        ctaLabel: ci + 1 < totalCards ? "Next exercise" : "Review & finish",
        onContinue: () => goToPanel(ci + 1)
      });
    }

    async function onFinishWorkout() {
      // The celebration reports training, so it reports working sets. A
      // session of nothing but ramps has nothing to celebrate and falls
      // through to the plain finish.
      const doneSets = exs.reduce((s, e) => s + U.workingSets(e.sets).length, 0);
      if (!doneSets) { await finishWorkout(); return; }
      const volume = Math.round(exs.reduce((s, e) => s + U.volume(U.workingSets(e.sets)), 0));
      const kcal = workoutKcalTotal(w);
      const dur = U.formatDuration(Math.floor((Date.now() - w.startedAt) / 1000));
      showCelebration({
        big: true,
        emoji: "🎉",
        title: "Workout complete!",
        message: "Great session — logged and saved.",
        stats: [
          { value: String(doneSets), label: "sets" },
          { value: volume > 0 ? volume.toLocaleString("en-GB") : "—", label: "kg volume" },
          { value: kcal > 0 ? String(kcal) : "—", label: "kcal" },
          { value: dur, label: "time" }
        ],
        ctaLabel: "Finish workout",
        onContinue: () => { finishWorkout(); }
      });
    }

    // ---- Exercise / superset cards ----
    for (let ci = 0; ci < cards.length; ci++) {
      const card = cards[ci];
      const finished = card.idxs.every(i => exs[i].finished);
      const panel = el("div", { class: "wpanel" + (finished ? " is-finished" : ""), "data-ci": String(ci) });
      panel.appendChild(el("div", { class: "wpanel-eyebrow" },
        card.group ? `SUPERSET · ${ci + 1} of ${totalCards}` : `EXERCISE ${ci + 1} of ${totalCards}`));
      const bodyWrap = el("div", { class: "wpanel-body" });
      for (const i of card.idxs) bodyWrap.appendChild(await renderExerciseBlock(exs[i], i));
      panel.appendChild(bodyWrap);
      const foot = el("div", { class: "wpanel-foot" });
      foot.appendChild(el("button", {
        class: "btn btn-block wfinish-btn" + (finished ? " is-done" : " btn-primary"),
        on: { click: () => finishCard(ci) }
      }, finished ? "✓ Done · Next" : (card.group ? "Finish superset" : "Finish exercise")));
      panel.appendChild(foot);
      pager.appendChild(panel);
    }

    // ---- Finish card ----
    const fin = el("div", { class: "wpanel wpanel-finish" });
    fin.appendChild(el("div", { class: "wpanel-eyebrow" }, "WRAP UP"));
    fin.appendChild(el("h2", { class: "wfinish-title" }, "Finish workout"));
    const finishedCount = cards.filter(c => c.idxs.every(x => exs[x].finished)).length;
    fin.appendChild(el("div", { class: "wfinish-progress" }, `${finishedCount} of ${totalCards} exercises done`));
    const notesArea = el("textarea", { class: "input workout-notes", placeholder: "Session notes (energy, sleep, how it felt)…", rows: "2" });
    notesArea.value = w.notes || "";
    notesArea.addEventListener("input", U.debounce(async () => { w.notes = notesArea.value; await Storage.saveWorkout(w); }, 400));
    fin.appendChild(el("div", { class: "workout-notes-wrap" }, notesArea));
    fin.appendChild(el("button", { class: "btn btn-block mt-8", on: { click: () => openExercisePicker(async (items) => {
      for (const it of items) w.exercises.push(await buildExerciseEntry(it.id, it.name));
      await Storage.saveWorkout(w);
      afterExerciseChange();
      toast(`Added ${items.length} exercise${items.length === 1 ? "" : "s"}`);
    }, { existingIds: new Set(exs.map(e => e.exerciseId)), title: "Add exercises" }) } },
      el("span", { html: icons.plus }), "Add exercise"));
    fin.appendChild(el("button", { class: "btn btn-primary btn-block mt-8", on: { click: onFinishWorkout } }, "Finish workout"));
    fin.appendChild(el("button", { class: "btn btn-ghost text-danger btn-block mt-8", on: { click: cancelWorkout } }, "Cancel workout"));
    pager.appendChild(fin);

    // ---- Dots + scroll sync ----
    renderDots();
    let sRAF = null;
    pager.addEventListener("scroll", () => {
      if (sRAF) return;
      sRAF = requestAnimationFrame(() => {
        sRAF = null;
        const center = pager.scrollTop + pager.clientHeight / 2;
        let best = 0, bd = Infinity;
        for (let i = 0; i < pager.children.length; i++) {
          const cc = pager.children[i].offsetTop + pager.children[i].offsetHeight / 2;
          const d = Math.abs(cc - center);
          if (d < bd) { bd = d; best = i; }
        }
        if (best !== activeIdx) { activeIdx = best; workoutScrollIdx = best; syncDots(); }
      });
    }, { passive: true });
    pager.addEventListener("scroll", () => { workoutScrollTop = pager.scrollTop; }, { passive: true });

    view.appendChild(screen);
    // Restore exact scroll (set synchronously to avoid a painted frame at 0),
    // falling back to the remembered card the first time we land here.
    const restoreScroll = () => {
      if (workoutScrollTop > 0) { pager.scrollTop = workoutScrollTop; }
      else if (workoutScrollIdx > 0 && workoutScrollIdx < panelCount && pager.children[workoutScrollIdx]) {
        pager.scrollTop = pager.children[workoutScrollIdx].offsetTop;
      }
      const center = pager.scrollTop + pager.clientHeight / 2;
      let best = 0, bd = Infinity;
      for (let i = 0; i < pager.children.length; i++) {
        const cc = pager.children[i].offsetTop + pager.children[i].offsetHeight / 2;
        const d = Math.abs(cc - center);
        if (d < bd) { bd = d; best = i; }
      }
      activeIdx = best; syncDots();
    };
    restoreScroll();
    requestAnimationFrame(restoreScroll);

    // Guided is the default. Unless it has been switched off in settings or
    // stepped out of during this session, the workout screen opens straight
    // into the one-tap runner; this list is what it falls back to, and what
    // edits anything already logged.
    if (state.prefs.guidedSets && !guidedDismissed && !runnerState && guidedHasWork(w)) {
      openSetRunner();
    }
  }

  function suggestedName() {
    const d = new Date();
    const weekday = d.toLocaleDateString("en-GB", { weekday: "long" });
    return `${weekday} Workout`;
  }

  /** Turn a template or preset into a session's worth of exercises: template
      targets become values, and anything the template leaves open is shaped by
      the last time you did that movement. Shared by "start this now" and
      "log the one I forgot", which want identical contents and differ only in
      whether the sets arrive ticked. */
  async function expandTemplateExercises(template) {
    if (!template || !Array.isArray(template.exercises)) return [];
    {
      const all = await getAllExercises();
      // Prefill missing template targets from each exercise's last session.
      const lastById = new Map();
      for (const te of template.exercises) {
        if (!te.exerciseId || lastById.has(te.exerciseId)) continue;
        try {
          const hist = await getHistoryFor(te.exerciseId);
          if (hist[0]) lastById.set(te.exerciseId, hist[0]);
        } catch (_) {}
      }
      return template.exercises.map(te => {
        const def = all.find(x => x.id === te.exerciseId);
        const type = def ? inferExerciseType(def) : "weighted";
        const prev = lastById.get(te.exerciseId);
        // Interval protocols carry their own step plan; one loggable set per
        // work effort, with the prescribed duration pre-filled.
        if (te.intervals && (te.intervals.steps || []).length) {
          const work = te.intervals.steps.filter(s => s.work);
          return {
            exerciseId: te.exerciseId,
            name: te.name || def?.name || "Exercise",
            type: "interval",
            met: def?.met,
            plan: te.intervals,
            sets: (work.length ? work : te.intervals.steps).map(s => ({
              seconds: s.sec, intensity: s.intensity || "moderate", label: s.label || null, done: false
            }))
          };
        }
        if (type === "cardio") {
          // Prefer last logged interval when template has no targets.
          if (prev && prev.sets && prev.sets.length &&
              te.targetDurationMin == null && te.targetDistanceKm == null) {
            return {
              exerciseId: te.exerciseId,
              name: te.name || def?.name || "Exercise",
              type,
              met: def?.met,
              sets: prev.sets.map(() => emptySetForType("cardio"))
            };
          }
          // Cardio built exactly one row and dropped targetSets on the floor,
          // so a template asking for two one-mile runs — or four 400s — got a
          // single line and you had to add the rest yourself. No shipped
          // template set it, so honouring it changes nothing that existed.
          const sets = Array.from({ length: Math.max(1, te.targetSets || 1) }, () => ({
            durationMin: te.targetDurationMin ?? null,
            intensity: te.targetIntensity || "moderate",
            distanceKm: te.targetDistanceKm ?? null,
            done: false
          }));
          return {
            exerciseId: te.exerciseId,
            name: te.name || def?.name || "Exercise",
            type,
            met: def?.met,
            sets
          };
        }
        // Timed holds — stretches, planks, carries. These were falling through
        // to the strength branch and arriving with a rep counter attached.
        if (type === "hold") {
          const targetSets = Math.max(1, te.targetSets || 1);
          const secs = te.targetSeconds ?? (prev?.sets?.[0]?.seconds ?? null);
          return {
            exerciseId: te.exerciseId,
            name: te.name || def?.name || "Exercise",
            type,
            met: def?.met,
            perSide: !!def?.perSide,
            sets: Array.from({ length: targetSets }, () => ({ seconds: secs, done: false }))
          };
        }

        // Strength: template targets are explicit so they stay as values;
        // last-session loads are hints only (placeholders), never pre-typed.
        // A rep ladder is a template target as much as targetReps is. Without
        // it here, Fran fell through to "shape this like last time you did
        // thrusters" for anyone who had ever done thrusters — so the ladder
        // worked on a fresh install and quietly stopped working once you had
        // history, which is the worst version of this bug.
        const hasTplLoad = te.targetWeight != null || te.targetReps != null ||
          (Array.isArray(te.repScheme) && te.repScheme.length > 0);
        if (!hasTplLoad && prev && prev.sets && prev.sets.length) {
          return {
            exerciseId: te.exerciseId,
            name: te.name || def?.name || "Exercise",
            type,
            met: def?.met,
            sets: prev.sets.map(() => emptySetForType(type))
          };
        }
        // A rep ladder — 21-15-9, or 10 down to 1 — is one number per set, not
        // one number repeated. Without this the only way to write Fran was
        // "3 × 21", which is not Fran and is not anything else either.
        const ladder = Array.isArray(te.repScheme) && te.repScheme.length ? te.repScheme : null;
        const targetSets = ladder
          ? ladder.length
          : Math.max(1, te.targetSets || (prev?.sets?.length) || 3);
        const sets = Array.from({ length: targetSets }, (_, i) => ({
          weight: te.targetWeight ?? null,
          reps: ladder ? ladder[i] : (te.targetReps ?? null),
          done: false
        }));
        return {
          exerciseId: te.exerciseId,
          name: te.name || def?.name || "Exercise",
          type,
          met: def?.met,
          sets
        };
      });
    }
  }

  async function startNewWorkout(template = null) {
    const nameInput = document.getElementById("new-workout-name");
    let name = (nameInput?.value || suggestedName()).trim();
    if (template && (!nameInput || !nameInput.value.trim())) name = template.name;

    return beginWorkoutSession({
      name,
      exercises: await expandTemplateExercises(template),
      templateId: template?.id || null,
      source: template ? "template" : "empty"
    });
  }

  async function startFromLastWorkout(last) {
    if (!last) {
      toast("No completed workout to repeat yet");
      return;
    }
    const exercises = await buildExercisesFromWorkout(last);
    if (!exercises.length) {
      toast("Last workout had no exercises");
      return;
    }
    const nameInput = document.getElementById("new-workout-name");
    const customName = (nameInput?.value || "").trim();
    const name = customName || last.name || suggestedName();
    await beginWorkoutSession({
      name,
      exercises,
      templateId: null,
      source: "last",
      sourceWorkoutId: last.id
    });
    toast(`Loaded ${exercises.length} exercise${exercises.length === 1 ? "" : "s"} from last time`);
  }

  async function beginWorkoutSession({ name, exercises, templateId = null, source = "empty", sourceWorkoutId = null }) {
    workoutScrollIdx = 0;
    workoutScrollTop = 0;
    // A new session earns a fresh answer to "guided or classic?" — leaving the
    // runner during last Tuesday's workout should not opt you out for good.
    guidedDismissed = false;
    const workout = {
      id: U.uid(),
      name: (name || suggestedName()).trim() || suggestedName(),
      date: U.todayISO(),
      startedAt: Date.now(),
      exercises: exercises || [],
      notes: "",
      templateId,
      source,
      sourceWorkoutId
    };
    state.activeWorkout = workout;
    try {
      await Storage.saveWorkout(workout);
      await Storage.setPref("activeWorkoutId", workout.id);
    } catch (err) {
      console.error("beginWorkoutSession save failed", err);
      toast("Could not start workout — storage error");
      state.activeWorkout = null;
      return;
    }
    startWorkoutTimer();
    // A fresh session belongs to the tab that started it.
    claimActiveWorkout();
    renderMain();
    // Offer movement prep once the session screen is up, so skipping it lands
    // you straight in the workout.
    offerWarmup(workout);
  }

  function startWorkoutTimer() {
    if (state.workoutInterval) clearInterval(state.workoutInterval);
    state.workoutInterval = setInterval(() => {
      const elapsed = document.getElementById("workout-elapsed");
      if (elapsed && state.activeWorkout) {
        elapsed.textContent = U.formatTime(Math.floor((Date.now() - state.activeWorkout.startedAt) / 1000));
      }
    }, 1000);
  }

  // ============ Guided warm-up ============
  // Dynamic mobility matched to the session's muscles, plus ramp sets on the
  // first main lift. Deliberately NOT static stretching: holding a stretch
  // before lifting measurably reduces force output — those belong afterwards.
  const RAMP_STEPS = [
    { pct: 0.4, reps: 8, label: "Empty-ish bar" },
    { pct: 0.6, reps: 5, label: "Building" },
    { pct: 0.8, reps: 3, label: "Last primer" }
  ];

  async function buildWarmupPlan(workout) {
    const all = await getAllExercises();
    const byId = new Map(all.map(e => [e.id, e]));
    const entries = (workout.exercises || []);
    if (!entries.length) return null;

    // Muscles the session actually trains (skip mobility entries themselves).
    const muscles = new Set();
    let hasStrength = false;
    for (const e of entries) {
      const def = byId.get(e.exerciseId);
      if (!def || def.category === "mobility") continue;
      if (e.type !== "cardio" && e.type !== "interval" && e.type !== "hold") hasStrength = true;
      for (const m of (def.muscles || [])) muscles.add(m.toLowerCase());
    }
    if (!muscles.size) return null;

    // Score each dynamic drill by how much it overlaps the session.
    const drills = all.filter(e => e.category === "mobility" && e.dynamic);
    const scored = drills.map(d => {
      let score = 0;
      for (const m of (d.muscles || [])) {
        const lm = m.toLowerCase();
        for (const sm of muscles) {
          if (sm.includes(lm) || lm.includes(sm)) { score += 2; break; }
        }
      }
      return { d, score };
    }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);
    // Always include a spine/whole-body opener even if nothing else matched.
    const picked = scored.slice(0, 4).map(x => x.d);
    if (!picked.length) picked.push(...drills.slice(0, 3));

    // Ramp sets for the first loaded compound, based on your last working set.
    let ramp = null;
    if (hasStrength) {
      const first = entries.find(e => {
        const def = byId.get(e.exerciseId);
        return def && def.category !== "mobility" && e.type !== "cardio" && e.type !== "interval" && e.type !== "hold";
      });
      if (first) {
        const prs = await getPRsFor(first.exerciseId);
        const hist = await getHistoryFor(first.exerciseId);
        const lastWorking = (() => {
          for (const h of hist) {
            // The ramp is built up to your working weight, so a previous
            // warm-up must not be mistaken for one — that would ramp you up
            // to a ramp.
            const best = (h.sets || []).filter(s => s.weight && !U.isWarmup(s))
              .sort((a, b) => b.weight - a.weight)[0];
            if (best) return best.weight;
          }
          return prs.maxWeight || null;
        })();
        if (lastWorking > 20) {
          ramp = {
            name: first.name,
            exerciseId: first.exerciseId,
            working: lastWorking,
            sets: RAMP_STEPS.map(r => ({
              // Round to the nearest 2.5kg so it's actually loadable.
              weight: Math.max(20, Math.round((lastWorking * r.pct) / 2.5) * 2.5),
              reps: r.reps, label: r.label
            }))
          };
        }
      }
    }
    return { drills: picked, ramp };
  }

  // Offer the warm-up before a session. Skipping is one tap and is remembered
  // for the session; "Don't ask again" turns the prompt off for good.
  async function offerWarmup(workout) {
    if (!state.prefs.warmupPrompt) return;
    const plan = await buildWarmupPlan(workout);
    if (!plan || (!plan.drills.length && !plan.ramp)) return;

    const overlay = el("div", { class: "warmup-overlay", "data-testid": "warmup" });
    const close = () => { overlay.classList.add("is-closing"); setTimeout(() => overlay.remove(), 200); };

    const list = el("div", { class: "warmup-list" });
    for (const d of plan.drills) {
      list.appendChild(el("div", { class: "warmup-item" },
        exerciseFigureIcon(d.category),
        el("div", { class: "warmup-item-main" },
          el("div", { class: "warmup-item-name" }, d.name),
          el("div", { class: "warmup-item-sub" }, (d.muscles || []).slice(0, 3).join(" · "))),
        el("div", { class: "warmup-item-dose" }, d.perSide ? "30s / side" : "30s")
      ));
    }
    if (plan.ramp) {
      list.appendChild(el("div", { class: "warmup-sep" }, `RAMP · ${plan.ramp.name}`));
      for (const r of plan.ramp.sets) {
        list.appendChild(el("div", { class: "warmup-item" },
          el("div", { class: "warmup-ramp-badge" }, `${r.weight}`),
          el("div", { class: "warmup-item-main" },
            el("div", { class: "warmup-item-name" }, `${U.formatWeight(r.weight, { space: false })} × ${r.reps}`),
            el("div", { class: "warmup-item-sub" }, r.label)),
          el("div", { class: "warmup-item-dose" }, U.weightUnit())
        ));
      }
      // The sheet used to show these numbers and then throw them away: doing
      // the ramp meant re-typing every one of them through the set menu. One
      // tap now writes them into the exercise as W rows, ready to tick off.
      // Hidden if the exercise already carries warm-ups, so the button cannot
      // stack a second ramp on top of one logged a moment ago.
      const target = (workout.exercises || []).find(e => e.exerciseId === plan.ramp.exerciseId);
      if (target && !(target.sets || []).some(s => U.isWarmup(s))) {
        const logBtn = el("button", {
          class: "btn btn-block warmup-log-ramp", type: "button",
          "data-testid": "warmup-log-ramp",
          on: { click: async () => {
            if (logBtn.disabled) return;
            logBtn.disabled = true;
            target.sets = [
              ...plan.ramp.sets.map(r => ({ weight: r.weight, reps: r.reps, done: false, warmup: true })),
              ...(target.sets || [])
            ];
            await Storage.saveWorkout(workout);
            logBtn.textContent = `Added to ${plan.ramp.name} ✓`;
            refreshExerciseBlock(target);
          } }
        }, "Log ramp as warm-up sets");
        list.appendChild(logBtn);
      }
    }

    const body = el("div", { class: "warmup-sheet" },
      el("div", { class: "warmup-head" },
        el("div", {},
          el("div", { class: "warmup-eyebrow" }, "BEFORE YOU START"),
          el("h2", { class: "warmup-title" }, "Quick warm-up"),
          el("div", { class: "warmup-sub" },
            plan.ramp
              ? "Movement prep for today's muscles, then ramp sets into your first lift."
              : "Movement prep matched to today's session.")),
        el("button", { class: "warmup-skip-x", type: "button", "aria-label": "Skip warm-up",
          "data-testid": "warmup-skip-x", on: { click: close },
          html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>' })
      ),
      list,
      el("div", { class: "warmup-actions" },
        // Run the drills on the same timer the flows use. The ramp sets are
        // loaded reps, not durations, so the guided part stops at the drills
        // and the sheet's ramp list stands on its own.
        plan.drills.length
          ? el("button", {
              class: "btn btn-primary btn-block warmup-guided", "data-testid": "warmup-guided",
              on: { click: () => { close(); runGuidedWarmup(plan); } }
            }, el("span", { html: icons.play }), "Run it guided")
          : null,
        el("button", {
          class: "btn btn-block" + (plan.drills.length ? "" : " btn-primary"),
          "data-testid": "warmup-go", on: { click: close }
        }, plan.drills.length ? "I'll do it myself" : "Got it — let's go"),
        el("button", { class: "btn btn-ghost btn-sm", "data-testid": "warmup-skip", on: { click: close } }, "Skip warm-up"),
        el("button", { class: "btn btn-ghost btn-sm warmup-never", "data-testid": "warmup-never", on: { click: async () => {
          state.prefs.warmupPrompt = false;
          await Storage.setPref("warmupPrompt", false);
          toast("Warm-up prompt turned off — re-enable it in Settings");
          close();
        } } }, "Don't ask again")
      )
    );
    overlay.appendChild(body);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    document.body.appendChild(overlay);
  }

  // What a preset session actually asks of you, before you commit to it.
  function openSessionDetail(t) {
    sessionMeta(t);
    const ivl = (t.exercises || []).find(e => e.intervals)?.intervals;
    const body = el("div", {});
    body.appendChild(el("div", { class: "sess-card-tags", style: "margin-bottom:12px" },
      ...(t.venue || []).map(v => el("span", { class: "sess-tag sess-tag-venue" }, VENUE_META[v] || v)),
      ...(t.bodyweightOnly
        ? [el("span", { class: "sess-tag" }, "No equipment")]
        : t.gear.map(g => el("span", { class: "sess-tag" }, GEAR_META[g] || g)))
    ));
    if (t.detail) body.appendChild(el("p", { class: "text-sm text-muted", style: "margin:0 0 14px" }, t.detail));
    if (ivl) {
      body.appendChild(el("div", { class: "nsection-label", style: "margin-bottom:6px" }, "THE PLAN"));
      const strip = el("div", { class: "ivl-plan" });
      for (const st of ivl.steps) {
        strip.appendChild(el("div", {
          class: "ivl-step" + (st.work ? " is-work" : "") + ` ivl-${st.intensity || "moderate"}`,
          style: `flex-grow:${Math.max(1, st.sec)}`, title: `${st.label || ""} · ${U.formatTime(st.sec)}`
        }));
      }
      body.appendChild(strip);
      body.appendChild(el("div", { class: "text-xs text-faint", style: "margin:8px 0 12px" }, intervalSummary(ivl)));
      // Collapse consecutive identical steps so a 66-step protocol stays readable.
      const rows = [];
      for (const st of ivl.steps) {
        const last = rows[rows.length - 1];
        if (last && last.sec === st.sec && last.intensity === st.intensity && last.label === st.label) last.n++;
        else rows.push({ ...st, n: 1 });
      }
      const list = el("div", { class: "ivl-detail-list" });
      for (const r of rows) {
        list.appendChild(el("div", { class: "ivl-detail-row" },
          el("span", { class: `ivl-dot ivl-${r.intensity || "moderate"}` }),
          el("span", { class: "ivl-detail-label" }, (r.n > 1 ? `${r.n} × ` : "") + (r.label || U.INTENSITY[r.intensity]?.label || "")),
          el("span", { class: "ivl-detail-time" }, U.formatTime(r.sec))
        ));
      }
      body.appendChild(list);
    } else {
      body.appendChild(el("div", { class: "nsection-label", style: "margin-bottom:6px" }, "EXERCISES"));
      const list = el("div", { class: "ivl-detail-list" });
      for (const e of (t.exercises || [])) {
        list.appendChild(el("div", { class: "ivl-detail-row" },
          el("span", { class: "ivl-detail-label" }, e.name),
          el("span", { class: "ivl-detail-time" }, templateEntryPrescription(e))
        ));
      }
      body.appendChild(list);
    }
    const footer = el("div", {},
      el("button", { class: "btn", on: { click: closeModal } }, "Close"),
      el("button", { class: "btn btn-primary", on: { click: () => { closeModal(); startNewWorkout(t); } } }, "Start session")
    );
    openModal(t.name, body, footer);
  }

  // Sessions hub — your templates plus the built-in library, as swipeable
  // category panels rather than one very long scroll.
  //
  // Two filters sit above the panels. `pillar` stays the pager (three answers,
  // three panels); venue and kit are orthogonal to it and so are chips, not
  // more panels — eleven swipe targets would be unusable on a phone.
  function buildSessionPickerUI(mine, presets, opts = {}) {
    const onPicked = opts.onPicked || (() => {});
    // What the primary button on a card does. Defaults to starting the session
    // right now; the back-logging flow swaps in "record that I did this".
    const onChoose = opts.onChoose || startNewWorkout;
    const actionLabel = opts.actionLabel || "Start";
    const GROUPS = [
      { key: "conditioning", label: "Conditioning", items: presets.filter(t => t.pillar === "conditioning") },
      { key: "strength", label: "Strength", items: presets.filter(t => t.pillar === "strength") },
      { key: "recovery", label: "Recovery", items: presets.filter(t => t.pillar === "recovery") },
      { key: "mine", label: "Yours", items: mine }
    ].filter(g => g.items.length);
    if (!GROUPS.length) {
      return { body: el("div", { class: "ncard-empty" },
        el("div", { class: "ncard-empty-title" }, "No sessions yet"),
        el("div", { class: "ncard-empty-sub" }, "Build a template and it will appear here.")), refresh: () => {} };
    }
    const ALL = GROUPS.flatMap(g => g.items);
    ALL.forEach(sessionMeta);

    // ---- filter state ----
    // venue and kit are separate axes: a session must match something in each
    // axis you've picked, but nothing in an axis you've left alone.
    const picked = { venue: new Set(), kit: new Set() };
    // "Fits my kit" hides sessions needing gear you've said you don't have.
    // On by default once a kit is configured, and always escapable.
    let kitOnly = myKit().size > 0;

    const venueOpts = Object.keys(VENUE_META).filter(v => ALL.some(t => (t.venue || []).includes(v)));
    // Only offer a kit chip where there is more than one session behind it —
    // a filter that yields a single card is noise.
    const gearCount = {};
    for (const t of ALL) for (const g of t.gear) gearCount[g] = (gearCount[g] || 0) + 1;
    const kitOpts = GEAR_ORDER.filter(g => (gearCount[g] || 0) >= 2);
    const anyBodyweight = ALL.some(t => t.bodyweightOnly);

    function matches(t) {
      if (picked.venue.size && !(t.venue || []).some(v => picked.venue.has(v))) return false;
      if (picked.kit.size) {
        const hit = (picked.kit.has("bodyweight") && t.bodyweightOnly) ||
          t.gear.some(g => picked.kit.has(g));
        if (!hit) return false;
      }
      if (kitOnly && !sessionFitsKit(t, myKit())) return false;
      return true;
    }

    let activeKey = GROUPS[0].key;
    const filterRow = el("div", { class: "xpick-chips sess-filters", "data-testid": "sess-filters" });
    const filterNote = el("div", { class: "sess-filter-note", "data-testid": "sess-filter-note" });
    const chipRow = el("div", { class: "xpick-chips", "data-testid": "sess-chips" });
    const dotsRow = el("div", { class: "xpick-dots", "data-testid": "sess-dots" });
    const pager = el("div", { class: "xpick-pager", "data-testid": "sess-pager" });

    function cardFor(t) {
      const preset = !!t.preset;
      const ivl = (t.exercises || []).find(e => e.intervals)?.intervals;
      const isCardioEntry = e => e.targetDurationMin != null || looksLikeCardio({ id: e.exerciseId, name: e.name });
      const setsTotal = t.exercises.reduce((s2, e) => s2 + (e.intervals || isCardioEntry(e) ? 0 : (e.targetSets || 3)), 0);
      const meta = ivl ? intervalSummary(ivl)
        : `${t.exercises.length} exercise${t.exercises.length === 1 ? "" : "s"}` + (setsTotal > 0 ? ` · ${setsTotal} sets` : "") + ` · ${templateLengthLabel(t)}`;
      return el("div", { class: "sess-card", "data-testid": preset ? `preset-${t.id}` : `tpl-${t.id}` },
        el("div", { class: "sess-card-top" },
          el("div", { class: "sess-card-name" }, t.name),
          el("div", { class: "sess-card-meta" }, meta)),
        el("div", { class: "sess-card-desc" },
          t.desc || t.exercises.slice(0, 4).map(e => e.name).join(" · ")),
        el("div", { class: "sess-card-tags" },
          ...(t.venue || []).map(v => el("span", { class: "sess-tag sess-tag-venue" }, VENUE_META[v] || v)),
          ...(t.bodyweightOnly
            ? [el("span", { class: "sess-tag" }, "No equipment")]
            : t.gear.map(g => el("span", { class: "sess-tag" }, GEAR_META[g] || g)))
        ),
        el("div", { class: "sess-card-actions" },
          el("button", { class: "btn btn-primary btn-sm", on: { click: () => { onPicked(); onChoose(t); } } }, actionLabel),
          preset
            ? el("button", { class: "btn btn-sm", on: { click: () => openSessionDetail(t) } }, "Details")
            : el("button", { class: "btn btn-sm", on: { click: () => { onPicked(); openTemplateEditor(t); } } }, "Edit"),
          preset ? null : el("button", { class: "icon-btn", title: "Delete template", html: icons.trash, on: { click: async () => {
            if (!(await confirmDialog(`Delete template \u201c${t.name}\u201d?`, { title: "Delete template?", okLabel: "Delete", danger: true }))) return;
            await Storage.deleteTemplate(t.id);
            onPicked(); openSessionsSheet();
          } } })
        )
      );
    }

    function panelFor(g) {
      g.countEl = el("span", { class: "xpick-panel-count" }, String(g.items.length));
      g.listEl = el("div", { class: "xpick-panel-list" });
      return el("div", { class: "xpick-panel", "data-cat": g.key },
        el("div", { class: "xpick-card" },
          el("div", { class: "xpick-panel-head" },
            el("span", { class: "xpick-panel-title" }, g.label),
            g.countEl),
          g.listEl
        )
      );
    }

    // Re-render every panel against the current filters. Groups stay put even
    // when they empty out, so the pager index and swipe position never jump
    // under the user's thumb mid-filter.
    function applyFilters() {
      let shown = 0;
      for (const g of GROUPS) {
        const hits = g.items.filter(matches);
        shown += hits.length;
        clear(g.listEl);
        if (hits.length) hits.forEach(t => g.listEl.appendChild(cardFor(t)));
        else g.listEl.appendChild(el("div", { class: "sess-panel-empty" }, "Nothing here with these filters."));
        g.countEl.textContent = String(hits.length);
        const chip = chipRow.querySelector(`.xpick-chip[data-cat="${g.key}"]`);
        if (chip) chip.classList.toggle("is-dim", !hits.length);
      }
      for (const c of Array.from(filterRow.children)) {
        const kind = c.getAttribute("data-kind");
        const val = c.getAttribute("data-val");
        const on = kind === "clear"
          ? (!picked.venue.size && !picked.kit.size && !kitOnly)
          : kind === "kitonly" ? kitOnly : picked[kind].has(val);
        c.classList.toggle("active", on);
        c.setAttribute("aria-pressed", on ? "true" : "false");
      }
      const hidden = ALL.length - shown;
      clear(filterNote);
      if (!shown) {
        filterNote.appendChild(el("span", {}, "No sessions match. "));
        filterNote.appendChild(el("button", { class: "link-btn", type: "button",
          "data-testid": "sess-filter-clear", on: { click: clearFilters } }, "Clear filters"));
      } else if (kitOnly && hidden) {
        filterNote.appendChild(el("span", {}, `${hidden} hidden — need kit you don't have. `));
        filterNote.appendChild(el("button", { class: "link-btn", type: "button",
          "data-testid": "sess-show-all", on: { click: () => { kitOnly = false; applyFilters(); } } }, "Show all"));
      }
      filterNote.style.display = filterNote.childNodes.length ? "" : "none";
    }

    function clearFilters() {
      picked.venue.clear();
      picked.kit.clear();
      kitOnly = false;
      applyFilters();
    }
    function sync() {
      for (const c of Array.from(chipRow.children)) {
        const on = c.getAttribute("data-cat") === activeKey;
        c.classList.toggle("active", on);
        if (on) {
          const target = c.offsetLeft - (chipRow.clientWidth - c.clientWidth) / 2;
          chipRow.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
        }
      }
      for (const d of Array.from(dotsRow.children)) {
        d.classList.toggle("active", d.getAttribute("data-cat") === activeKey);
      }
    }
    function goTo(key) {
      activeKey = key; sync();
      const panel = pager.querySelector(`.xpick-panel[data-cat="${key}"]`);
      if (panel) pager.scrollTo({ left: panel.offsetLeft, behavior: "smooth" });
    }
    for (const g of GROUPS) {
      chipRow.appendChild(el("button", { class: "xpick-chip", type: "button", "data-cat": g.key,
        "data-testid": `sess-chip-${g.key}`, on: { click: () => goTo(g.key) } }, g.label));
      dotsRow.appendChild(el("button", { class: "xpick-dot", type: "button", "data-cat": g.key,
        "aria-label": g.label, on: { click: () => goTo(g.key) } }));
      pager.appendChild(panelFor(g));
    }

    // ---- filter chips ----
    const filterChip = (kind, val, label, testid) => el("button", {
      class: "xpick-chip sess-filter-chip", type: "button",
      "data-kind": kind, "data-val": val || "", "data-testid": testid,
      "aria-pressed": "false",
      on: { click: (e) => {
        // Keep the chip you just tapped fully in view — the row is wider than
        // the screen, so an edge chip would otherwise stay half cut off.
        e.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
        if (kind === "clear") return clearFilters();
        if (kind === "kitonly") { kitOnly = !kitOnly; return applyFilters(); }
        const set = picked[kind];
        if (set.has(val)) set.delete(val); else set.add(val);
        applyFilters();
      } }
    }, label);

    filterRow.appendChild(filterChip("clear", "", "All", "sess-filter-all"));
    if (myKit().size) filterRow.appendChild(filterChip("kitonly", "", "My kit", "sess-filter-mykit"));
    for (const v of venueOpts) filterRow.appendChild(filterChip("venue", v, VENUE_META[v], `sess-filter-venue-${v}`));
    if (anyBodyweight) filterRow.appendChild(filterChip("kit", "bodyweight", "No equipment", "sess-filter-kit-bodyweight"));
    for (const g of kitOpts) filterRow.appendChild(filterChip("kit", g, GEAR_META[g], `sess-filter-kit-${g}`));

    let raf = null;
    pager.addEventListener("scroll", () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const center = pager.scrollLeft + pager.clientWidth / 2;
        let best = 0, bd = Infinity;
        for (let i = 0; i < pager.children.length; i++) {
          const c = pager.children[i].offsetLeft + pager.children[i].offsetWidth / 2;
          const d = Math.abs(c - center);
          if (d < bd) { bd = d; best = i; }
        }
        const key = GROUPS[best] && GROUPS[best].key;
        if (key && key !== activeKey) { activeKey = key; sync(); }
      });
    }, { passive: true });

    const body = el("div", { class: "xpick sess-pick" }, filterRow, filterNote, chipRow, pager, dotsRow);
    applyFilters();
    return { body, refresh: () => { sync(); requestAnimationFrame(() => { const p = pager.querySelector(`.xpick-panel[data-cat="${activeKey}"]`); if (p) pager.scrollLeft = p.offsetLeft; }); } };
  }

  async function openSessionsSheet() {
    const mine = (await Storage.getTemplates()).slice().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    const picker = buildSessionPickerUI(mine, presetSessions(), { onPicked: closeModal });
    const footer = el("div", {},
      el("button", { class: "btn", on: { click: closeModal } }, "Close"),
      el("button", { class: "btn btn-primary", on: { click: () => { closeModal(); openTemplateEditor(null); } } },
        el("span", { html: icons.plus }), "New template")
    );
    openModal("Sessions", picker.body, footer);
    picker.refresh();
  }
  // Back-compat alias — older call sites still say "templates".
  const openTemplatesSheet = openSessionsSheet;

  async function openTemplateEditor(existing = null) {
    const all = await getAllExercises();
    const template = existing
      ? { id: existing.id, name: existing.name, exercises: existing.exercises.map(e => ({ ...e })) }
      : { id: U.uid(), name: "", exercises: [] };

    const nameI = el("input", { class: "input", placeholder: "e.g. Push Day A", value: template.name });
    const list = el("div", { class: "template-editor-list" });

    function refresh() {
      clear(list);
      if (template.exercises.length === 0) {
        list.appendChild(el("div", { class: "text-sm text-faint", style: "padding: 12px 0" },
          "No exercises yet. Tap “Add exercise” below."));
        return;
      }
      template.exercises.forEach((te, i) => {
        const def = all.find(x => x.id === te.exerciseId);
        const isCardio = def ? inferExerciseType(def) === "cardio" : looksLikeCardio({ id: te.exerciseId, name: te.name });

        let fields;
        if (isCardio) {
          // Cardio targets are minutes, not sets/reps.
          delete te.targetSets;
          delete te.targetReps;
          if (te.targetDurationMin == null) te.targetDurationMin = 20;
          const minsI = el("input", {
            type: "number", inputmode: "numeric", min: "1", max: "600",
            class: "input input-sm input-num", value: te.targetDurationMin
          });
          minsI.addEventListener("input", () => { te.targetDurationMin = parseInt(minsI.value) || 20; });
          fields = [
            el("div", { class: "template-editor-field" },
              el("label", {}, "Minutes"), minsI)
          ];
        } else {
          const setsField = wheelField({
            value: te.targetSets ?? 3, items: wheelRange(1, 12, 1), title: `${te.name} · sets`,
            onPick: (v) => { te.targetSets = v; }
          });
          const repsField = wheelField({
            value: te.targetReps ?? 8, items: wheelRange(1, 30, 1), title: `${te.name} · reps`,
            onPick: (v) => { te.targetReps = v; }
          });
          fields = [
            el("div", { class: "template-editor-field" },
              el("label", {}, "Sets"), setsField),
            el("div", { class: "template-editor-field" },
              el("label", {}, "Reps"), repsField)
          ];
        }

        list.appendChild(el("div", { class: "template-editor-row" },
          el("div", { class: "template-editor-name" }, te.name),
          el("div", { class: "template-editor-controls" },
            ...fields,
            el("button", { class: "icon-btn", title: "Move up", on: { click: () => {
              if (i === 0) return;
              [template.exercises[i - 1], template.exercises[i]] = [template.exercises[i], template.exercises[i - 1]];
              refresh();
            } } }, "↑"),
            el("button", { class: "icon-btn", title: "Move down", on: { click: () => {
              if (i === template.exercises.length - 1) return;
              [template.exercises[i + 1], template.exercises[i]] = [template.exercises[i], template.exercises[i + 1]];
              refresh();
            } } }, "↓"),
            el("button", { class: "icon-btn", title: "Remove", html: icons.trash, on: { click: () => {
              template.exercises.splice(i, 1);
              refresh();
            } } })
          )
        ));
      });
    }

    const addBtn = el("button", { class: "btn btn-block mt-8", on: { click: () => openExercisePicker((items) => {
      for (const it of items) {
        const def = all.find(x => x.id === it.id);
        const isCardio = def ? inferExerciseType(def) === "cardio" : looksLikeCardio({ id: it.id, name: it.name });
        template.exercises.push(isCardio
          ? { exerciseId: it.id, name: it.name, targetDurationMin: 20, targetIntensity: "moderate" }
          : { exerciseId: it.id, name: it.name, targetSets: 3, targetReps: 8 });
      }
      // openExercisePicker closes its own modal; re-open editor
      openTemplateEditor(template);
    }, { existingIds: new Set((template.exercises || []).map(e => e.exerciseId)), title: "Add to template" }) } }, el("span", { html: icons.plus }), "Add exercise");

    const body = el("div", {},
      el("label", { class: "label" }, "Template name"),
      nameI,
      el("div", { class: "label mt-16" }, "Exercises"),
      list,
      addBtn
    );

    const footer = el("div", {},
      el("button", { class: "btn", on: { click: closeModal } }, "Cancel"),
      el("button", { class: "btn btn-primary", on: { click: async () => {
        const name = nameI.value.trim();
        if (!name) { toast("Give the template a name"); return; }
        if (template.exercises.length === 0) { toast("Add at least one exercise"); return; }
        template.name = name;
        template.updatedAt = Date.now();
        await Storage.saveTemplate(template);
        closeModal();
        renderMain();
        toast(existing ? "Template updated" : "Template saved");
      } } }, existing ? "Save changes" : "Save template")
    );

    openModal(existing ? "Edit template" : "New template", body, footer);
    refresh();
  }

  // Guided, one-day-per-screen weekly plan builder — same stepped feel as the
  // profile quiz. Assigns a template / Rest / Open to each weekday.
  // Weekly plan — the whole week on one screen, left to right.
  //
  // This replaced an eight-screen wizard (one per day, plus a review). The
  // wizard made you spin a wheel and confirm seven times even though most
  // people assign three to five days and leave the rest open, and you could
  // never see the week while building it. Here a push/pull/legs week is six
  // taps with the week visible throughout, and days you skip are simply open.
  async function openWeeklyPlanQuiz() {
    const templates = await getAllTemplates();
    const tplById = new Map(templates.map(t => [t.id, t]));
    const draft = { ...getWeeklyPlan() };
    const todayKey = weekdayKeyFor();
    // Long-press a filled day to pick it up, then tap others to copy it —
    // building PPL twice over is three picks and three taps, not six picks.
    let copyFrom = null;

    const overlay = el("div", { class: "wplan", "data-testid": "weekly-plan-quiz" });
    const cells = {};

    function assignInfo(v) {
      if (v === "rest") return { label: "Rest", full: "Rest day", icon: REST_ICON, kind: "rest" };
      const f = focusFromValue(v);
      if (f) return { label: f.short || f.label, full: f.label, icon: f.icon, kind: "focus" };
      const t = v && tplById.get(v);
      if (t) {
        // "Push Day" -> "Push", "Bands — Upper Body" -> "Upper Body", then a
        // hard cap so the column never has to ellipsise.
        const base = String(t.name).split(" — ").pop().replace(/\s+Day$/i, "").trim();
        let sh = base;
        if (sh.length > 7) sh = sh.split(/[\s/]+/)[0];
        // A template called "Push Day" should look like Push, not like a
        // generic document — seven identical icons defeat the whole grid.
        const lower = base.toLowerCase();
        const f2 = DAY_FOCUSES.find(x => {
          const l = x.label.toLowerCase();
          return lower === l || lower.startsWith(l) || (l.length >= 3 && l.startsWith(lower));
        });
        return {
          label: f2 ? (f2.short || f2.label) : (sh || t.name),
          full: t.name,
          icon: f2 ? f2.icon : TEMPLATE_ICON,
          kind: "template"
        };
      }
      return { label: "Open", full: "Open — decide at the gym", icon: OPEN_ICON, kind: "open" };
    }

    // A one-shot draw-on. pathLength normalises every icon to 100 units so one
    // keyframe works whatever the path actually measures.
    function playDrawIn(host) {
      if (reduceMotion()) return;
      const parts = host.querySelectorAll("path, circle, rect, line, polyline, polygon");
      parts.forEach((n, i) => {
        n.setAttribute("pathLength", "100");
        n.style.animation = "none";
        void n.getBoundingClientRect();
        n.style.animation = `wday-draw 460ms ${i * 70}ms cubic-bezier(.4,0,.2,1) both`;
      });
      host.classList.remove("just-set");
      void host.getBoundingClientRect();
      host.classList.add("just-set");
    }

    function paintCell(key, { animate = false } = {}) {
      const cell = cells[key];
      const v = draft[key];
      const info = assignInfo(v);
      const icon = cell.querySelector(".wday-icon");
      const label = cell.querySelector(".wday-label");
      icon.innerHTML = info.icon;
      label.textContent = info.label;
      cell.className = "wday" +
        // An unassigned day must not read as assigned — only a focus or a
        // template earns the accent.
        (info.kind === "open" ? " is-open" : "") +
        (info.kind === "rest" ? " is-rest" : "") +
        (info.kind === "focus" || info.kind === "template" ? " is-set" : "") +
        (key === todayKey ? " is-today" : "") +
        (copyFrom === key ? " is-source" : "") +
        (copyFrom && copyFrom !== key ? " is-target" : "");
      cell.setAttribute("aria-label", `${WEEKDAY_LABELS[key]} — ${info.full}`);
      const rowVal = dayRows[key];
      if (rowVal) {
        rowVal.textContent = info.full;
        rowVal.classList.toggle("has", info.kind !== "open");
      }
      if (animate) playDrawIn(icon);
    }

    function paintAll(opts) { for (const k of WEEKDAY_KEYS) paintCell(k, opts); }

    function setHint() {
      const n = WEEKDAY_KEYS.filter(k => draft[k] && draft[k] !== "rest").length;
      hint.textContent = copyFrom
        ? `Tap days to copy ${assignInfo(draft[copyFrom]).full} into · tap ${WEEKDAY_LABELS[copyFrom]} again to stop`
        : n
          ? `${n} training day${n === 1 ? "" : "s"} · tap a day to change it, hold to copy it`
          : "Tap a day to assign it, or start from a split above";
      hint.classList.toggle("is-copying", !!copyFrom);
    }

    // ---- the assign sheet ----
    function openAssign(key) {
      const items = [];
      for (const f of DAY_FOCUSES) {
        items.push({ value: "focus:" + f.key, label: f.label, hint: f.desc, icon: f.icon, testid: `wplan-pick-focus-${f.key}` });
      }
      items.push({ value: "rest", label: "Rest day", hint: "Recovery — no session", icon: REST_ICON, testid: "wplan-pick-rest" });
      items.push({ value: null, label: "Open", hint: "Decide at the gym", icon: OPEN_ICON, testid: "wplan-pick-open" });
      for (const t of templates) {
        const n = (t.exercises || []).length;
        const h = t.preset
          ? `${(t.pillar || "preset").replace(/^./, c => c.toUpperCase())} · ${t.desc || templateLengthLabel(t)}`
          : `${n} exercise${n === 1 ? "" : "s"} · template`;
        items.push({ value: t.id, label: t.name, hint: h, icon: TEMPLATE_ICON, testid: `wplan-pick-${t.id}` });
      }
      const cur = draft[key] != null ? draft[key] : null;
      const list = el("div", { class: "wassign-list", "data-testid": "wplan-assign" });

      // The sheet lives INSIDE this overlay rather than going through
      // openModal. The shared modal sits at z-index 100 and the planner at
      // 2500, so a modal opened from here renders behind it — visible to
      // nothing and tappable by no one.
      const sheet = el("div", { class: "wplan-sheet", "data-testid": "wplan-sheet" });
      const closeSheet = () => {
        sheet.classList.add("is-closing");
        setTimeout(() => sheet.remove(), 180);
      };
      for (const it of items) {
        list.appendChild(el("button", {
          type: "button",
          class: "wassign-row" + (it.value === cur ? " is-sel" : ""),
          "data-testid": it.testid,
          on: { click: () => {
            if (it.value == null) delete draft[key]; else draft[key] = it.value;
            closeSheet();
            paintCell(key, { animate: true });
            setHint();
          } }
        },
          el("span", { class: "wassign-icon", html: it.icon }),
          el("span", { class: "wassign-main" },
            el("span", { class: "wassign-label" }, it.label),
            el("span", { class: "wassign-hint" }, it.hint)),
          it.value === cur ? el("span", { class: "wassign-tick", html: icons.check }) : null
        ));
      }
      const scrim = el("div", { class: "wplan-sheet-scrim", "data-testid": "wplan-sheet-scrim",
        on: { click: closeSheet } });
      sheet.append(scrim,
        el("div", { class: "wplan-sheet-panel", role: "dialog", "aria-label": `Assign ${WEEKDAY_LABELS[key]}` },
          el("div", { class: "wplan-sheet-head" },
            el("h3", { class: "wplan-sheet-title" }, WEEKDAY_LABELS[key]),
            el("button", {
              type: "button", class: "pquiz-close", "data-testid": "wplan-sheet-close",
              on: { click: closeSheet },
              html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>'
            })),
          list));
      overlay.appendChild(sheet);
    }

    // ---- the week row ----
    const row = el("div", { class: "wplan-row", "data-testid": "wplan-row" });
    for (const key of WEEKDAY_KEYS) {
      const cell = el("button", {
        type: "button", class: "wday", "data-day": key, "data-testid": `wplan-day-${key}`
      },
        el("span", { class: "wday-letter" }, WEEKDAY_LETTERS[key]),
        el("span", { class: "wday-icon" }),
        el("span", { class: "wday-label" })
      );
      cells[key] = cell;

      // Hold to pick up, tap to assign — or to paste while something is held.
      let holdTimer = null, held = false;
      const startHold = () => {
        held = false;
        clearTimeout(holdTimer);
        holdTimer = setTimeout(() => {
          held = true;
          if (!draft[key]) return;                 // nothing to copy from an open day
          copyFrom = copyFrom === key ? null : key;
          try { if (navigator.vibrate) navigator.vibrate(12); } catch (_) {}
          paintAll();
          setHint();
        }, 480);
      };
      const cancelHold = () => { clearTimeout(holdTimer); };
      cell.addEventListener("pointerdown", startHold);
      cell.addEventListener("pointerup", cancelHold);
      cell.addEventListener("pointerleave", cancelHold);
      cell.addEventListener("pointercancel", cancelHold);
      cell.addEventListener("click", () => {
        if (held) { held = false; return; }        // the hold already acted
        if (copyFrom && copyFrom !== key) {
          draft[key] = draft[copyFrom];
          paintCell(key, { animate: true });
          setHint();
          return;
        }
        if (copyFrom === key) { copyFrom = null; paintAll(); setHint(); return; }
        openAssign(key);
      });
      row.appendChild(cell);
    }

    // ---- split shortcuts ----
    const splitRow = el("div", { class: "wplan-splits", "data-testid": "wplan-splits" });
    for (const split of STARTER_SPLITS) {
      splitRow.appendChild(el("button", {
        type: "button", class: "wplan-split-chip", "data-testid": `wplan-split-${split.key}`,
        on: { click: () => {
          for (const k of WEEKDAY_KEYS) {
            if (split.days[k]) draft[k] = split.days[k]; else draft[k] = "rest";
          }
          copyFrom = null;
          paintAll({ animate: true });
          setHint();
        } }
      }, split.label));
    }
    splitRow.appendChild(el("button", {
      type: "button", class: "wplan-split-chip is-clear", "data-testid": "wplan-clear",
      on: { click: () => {
        for (const k of WEEKDAY_KEYS) delete draft[k];
        copyFrom = null;
        paintAll({ animate: true });
        setHint();
      } }
    }, "Clear"));

    const hint = el("div", { class: "wplan-hint", "data-testid": "wplan-hint" });

    // The grid is a glance; this is the detail. Same tap target, full names.
    const dayList = el("div", { class: "wplan-days", "data-testid": "wplan-days" });
    const dayRows = {};
    for (const key of WEEKDAY_KEYS) {
      const val = el("span", { class: "wplan-dayrow-val" });
      const rowEl = el("button", {
        type: "button", class: "wplan-dayrow" + (key === todayKey ? " is-today" : ""),
        "data-testid": `wplan-dayrow-${key}`,
        on: { click: () => {
          if (copyFrom && copyFrom !== key) {
            draft[key] = draft[copyFrom];
            paintCell(key, { animate: true });
            setHint();
            return;
          }
          openAssign(key);
        } }
      },
        el("span", { class: "wplan-dayrow-day" }, WEEKDAY_LABELS[key],
          key === todayKey ? el("span", { class: "wplan-dayrow-today" }, "Today") : null),
        val
      );
      dayRows[key] = val;
      dayList.appendChild(rowEl);
    }

    const closeBtn = el("button", {
      type: "button", class: "pquiz-close", "data-testid": "wplan-close",
      html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>'
    });
    const close = () => { overlay.classList.add("is-closing"); setTimeout(() => overlay.remove(), 220); };
    closeBtn.addEventListener("click", close);

    overlay.append(
      el("div", { class: "wplan-top" },
        el("div", {},
          el("div", { class: "pquiz-eyebrow" }, "Your week"),
          el("h2", { class: "wplan-title" }, "Weekly plan")),
        closeBtn),
      splitRow,
      row,
      hint,
      dayList,
      el("div", { class: "wplan-foot" },
        el("button", {
          type: "button", class: "btn btn-primary btn-block", "data-testid": "wplan-save",
          on: { click: async () => {
            const next = {};
            for (const key of WEEKDAY_KEYS) { if (draft[key]) next[key] = draft[key]; }
            state.prefs.weeklyPlan = next;
            await Storage.setPref("weeklyPlan", next);
            close();
            renderMainKeepScroll();
            toast("Weekly plan saved");
          } }
        }, "Save plan"),
        templates.length ? null : el("button", {
          type: "button", class: "pquiz-skip", "data-testid": "wplan-new-template",
          on: { click: () => { close(); openTemplateEditor(null); } }
        }, "＋ Create a template first")
      )
    );

    document.body.appendChild(overlay);
    paintAll();
    setHint();
  }

  async function offerSaveAsTemplate(workout) {
    if (!workout?.exercises?.length) return;
    const nameI = el("input", { class: "input", value: workout.name || "New template" });
    const body = el("div", {},
      el("p", { class: "text-sm text-muted mb-8" }, "Save this workout as a reusable template."),
      el("label", { class: "label" }, "Template name"),
      nameI
    );
    return new Promise(resolve => {
      const footer = el("div", {},
        el("button", { class: "btn", on: { click: () => { closeModal(); resolve(false); } } }, "Not now"),
        el("button", { class: "btn btn-primary", on: { click: async () => {
          const n = nameI.value.trim();
          if (!n) { toast("Name it first"); return; }
          const tpl = {
            id: U.uid(),
            name: n,
            exercises: workout.exercises.map(ex => {
              if (ex.type === "cardio") {
                return {
                  exerciseId: ex.exerciseId,
                  name: ex.name,
                  targetDurationMin: ex.sets[0]?.durationMin ?? null,
                  targetIntensity: ex.sets[0]?.intensity || "moderate"
                };
              }
              return {
                exerciseId: ex.exerciseId,
                name: ex.name,
                targetSets: ex.sets.length,
                targetReps: ex.sets[0]?.reps ?? null
              };
            }),
            updatedAt: Date.now()
          };
          await Storage.saveTemplate(tpl);
          closeModal();
          toast("Template saved");
          resolve(true);
        } } }, "Save template")
      );
      openModal("Save as template?", body, footer);
    });
  }

  async function cancelWorkout() {
    if (!(await confirmDialog("Cancel this workout? Any logged sets will be discarded.", { title: "Cancel workout?", okLabel: "Discard workout", danger: true }))) return;
    if (state.activeWorkout) await Storage.deleteWorkout(state.activeWorkout.id);
    state.activeWorkout = null;
    if (state.workoutInterval) { clearInterval(state.workoutInterval); state.workoutInterval = null; }
    stopRestTimer();
    await Storage.setPref("activeWorkoutId", null);
    renderMain();
  }

  /** Auto-mark sets the user actually typed into but never checked off.
      Untouched rows (replayed values, template targets) are never auto-logged.

      `bwKg` is passed in rather than read here because this is synchronous and
      the bodyweight lookup is not. It used to fall back to U.DEFAULT_BW_KG,
      which meant the same cardio set was worth a different number of calories
      depending on how the workout ended: tick it yourself and it costed at your
      real weight, let Finish sweep it up and it costed at 75kg. At 100kg that
      is a quarter of the burn missing, on a set the user did tick — just not in
      the way that happened to be wired to their own body. */
  function commitFilledSets(workout, bwKg) {
    let autoCommitted = 0;
    for (const ex of (workout.exercises || [])) {
      const isCardio = ex.type === "cardio";
      const isCustom = ex.type === "custom";
      for (const s of (ex.sets || [])) {
        if (s.done) continue;
        if (!s.touched) continue;
        if (isCustom) {
          const v = s.value == null || s.value === "" ? NaN : Number(s.value);
          if (Number.isFinite(v)) {
            s.done = true;
            autoCommitted += 1;
          }
        } else if (isCardio) {
          const dur = s.durationMin != null ? Number(s.durationMin) : NaN;
          if (dur > 0) {
            s.done = true;
            if (s.kcal == null) {
              try {
                const met = U.getMET({ type: "cardio", category: "cardio", met: ex.met }, s.intensity || "moderate");
                s.kcal = U.estimateKcal(met, bwKg, dur);
              } catch (_) {}
            }
            autoCommitted += 1;
          }
        } else if (ex.type === "hold" || ex.type === "interval") {
          // Timed work: seconds are the whole record. Without this branch a
          // plank you timed but did not tick was dropped by the finish prune,
          // and if it was that exercise's only set the exercise vanished too.
          const secs = s.seconds == null || s.seconds === "" ? NaN : Number(s.seconds);
          if (secs > 0) {
            s.done = true;
            autoCommitted += 1;
          }
        } else {
          const weight = s.weight == null || s.weight === "" ? null : Number(s.weight);
          const reps = s.reps == null || s.reps === "" ? null : Number(s.reps);
          const isBw = ex.type === "bodyweight";
          if (reps > 0 && (isBw || weight > 0 || weight === 0 && ex.type === "weighted_bodyweight")) {
            s.done = true;
            if (weight == null) s.weight = isBw ? 0 : weight;
            autoCommitted += 1;
          }
        }
      }
    }
    return autoCommitted;
  }

  async function finishWorkout() {
    const w = state.activeWorkout;
    if (!w) return;

    // NOTE: there was a pre-save "flush" here that walked .set-row elements and
    // wrote their inputs back into the model. It was both wrong and unnecessary.
    //
    // Wrong: every set table's column header also carries class .set-row (see
    // the headers around :5711-5809), so it was rows[0]. Set 1's inputs were
    // written into set 2, set 2's into set 3, and the last set — having no row
    // after it — was silently dropped. Reproduced: 100x8 / 90x6 / 80x5 typed and
    // correctly stored was saved by Finish as 100x8 / 100x8 / 90x6. Volume,
    // e1RM, PR detection and the CSV export all read the corrupted numbers, and
    // it looked exactly like your own data-entry mistake.
    //
    // Unnecessary: mirrorStrengthInputs and mirrorCardioInputs already write
    // every keystroke into the model on input, which is the job this loop
    // claimed to do. commitFilledSets below handles typed-but-unticked sets.
    // (flashCompletedSet at :854 shows the correct idiom for this query — it
    // filters the header out by requiring a .set-done button.)

    const autoN = commitFilledSets(w, await getBodyweightKg());

    // Ask FIRST, then prune. This used to assign the pruned array to
    // w.exercises before the confirm, so answering "no" returned with
    // w.exercises === [] — the pager still showed the exercises while the model
    // was empty, and the next set you logged saved an empty session to disk.
    // Declining a confirmation must leave the workout exactly as it was.
    const kept = (w.exercises || []).map(ex => ({
      ...ex,
      sets: (ex.sets || []).filter(s => s.done)
    })).filter(ex => ex.sets.length > 0);
    if (kept.length === 0) {
      if (!(await confirmDialog("No sets were logged. End workout anyway?", { title: "Finish workout?", okLabel: "End workout", danger: true }))) return;
    }
    w.exercises = kept;
    // A session logged against another day must complete on that day —
    // stamping Date.now() would put it in the right list with the wrong
    // timestamp, and completedAt drives the 14-day body-map heat window.
    const elapsedSec = Math.max(0, Math.floor((Date.now() - w.startedAt) / 1000));
    if (w.date && w.date !== U.todayISO()) {
      const at = new Date(w.date + "T12:00:00");
      w.completedAt = Number.isFinite(at.getTime()) ? at.getTime() : Date.now();
    } else {
      w.completedAt = Date.now();
    }
    w.durationSec = elapsedSec;
    w.kcalBurned = workoutKcalTotal(w);

    try {
      await Storage.saveWorkout(w);
      await Storage.setPref("activeWorkoutId", null);
    } catch (err) {
      console.error("finishWorkout save failed", err);
      toast("Could not save workout — try again");
      return;
    }

    const finishedWorkout = w;
    state.activeWorkout = null;
    if (state.workoutInterval) { clearInterval(state.workoutInterval); state.workoutInterval = null; }
    stopRestTimer();
    // Offer to save as template if not started from one and has enough content
    if (!finishedWorkout.templateId && finishedWorkout.exercises.length >= 1) {
      await offerSaveAsTemplate(finishedWorkout);
    }
    // Land on History so the saved session is immediately visible.
    finishFlourish = true;
    state.tab = "history";
    renderMain();
    const burned = finishedWorkout.kcalBurned || 0;
    const autoBit = autoN > 0 ? ` · ${autoN} set${autoN === 1 ? "" : "s"} auto-logged` : "";
    toast(burned > 0 ? `Workout saved · ≈ ${burned} kcal${autoBit}` : `Workout saved${autoBit}`);
    // Offline data safety: after logging, offer a backup every N workouts.
    await maybePromptBackup();
  }

  /** Move an exercise up or down the session without touching its sets.
      Before this, the only way past a taken squat rack was remove-and-re-add,
      which discarded everything already logged. */
  async function moveExercise(idx, dir) {
    const list = state.activeWorkout.exercises;
    const to = idx + dir;
    if (to < 0 || to >= list.length) return;
    const [moved] = list.splice(idx, 1);
    list.splice(to, 0, moved);
    // Supersets are an adjacency pact; a move that separates the pair
    // dissolves it rather than leaving a phantom link across the page.
    const groups = {};
    list.forEach((e, i) => {
      if (!e.supersetGroup) return;
      (groups[e.supersetGroup] = groups[e.supersetGroup] || []).push(i);
    });
    for (const [g, idxs] of Object.entries(groups)) {
      const adjacent = idxs.every((v, i) => i === 0 || v === idxs[i - 1] + 1);
      if (!adjacent) for (const e of list) if (e.supersetGroup === g) e.supersetGroup = null;
    }
    await Storage.saveWorkout(state.activeWorkout);
    afterExerciseChange();
  }

  /** The rest this exercise gets when a set is logged: its own target if one
      is set, the global default otherwise. */
  function restTargetFor(exerciseId) {
    const own = Number((state.prefs.restTargets || {})[exerciseId]);
    if (Number.isFinite(own) && own >= 10) return own;
    return state.prefs.defaultRestSec || 90;
  }

  /** Pick a rest target for one exercise. Plain buttons, not a wheel — this
      is a set-once decision, and the options are the whole vocabulary of
      real rest prescriptions. */
  function openRestTargetPicker(ex) {
    const current = (state.prefs.restTargets || {})[ex.exerciseId] || null;
    const OPTIONS = [30, 45, 60, 90, 120, 150, 180, 240, 300];
    const body = el("div", { class: "rest-target-list", "data-testid": "rest-target-list" });
    const save = async (secs) => {
      const map = { ...(state.prefs.restTargets || {}) };
      if (secs == null) delete map[ex.exerciseId];
      else map[ex.exerciseId] = secs;
      state.prefs.restTargets = map;
      await Storage.setPref("restTargets", map);
      closeModal();
      toast(secs == null
        ? `${ex.name} rests use the default again`
        : `${ex.name} rest target: ${U.formatTime(secs)}`);
      afterExerciseChange();
    };
    body.appendChild(el("button", {
      class: "btn btn-block" + (current == null ? " btn-primary" : ""),
      "data-testid": "rest-target-default",
      on: { click: () => save(null) }
    }, `Default · ${U.formatTime(state.prefs.defaultRestSec || 90)}`));
    for (const secs of OPTIONS) {
      body.appendChild(el("button", {
        class: "btn btn-block mt-8" + (current === secs ? " btn-primary" : ""),
        "data-testid": `rest-target-${secs}`,
        on: { click: () => save(secs) }
      }, U.formatTime(secs)));
    }
    openModal(`Rest after ${ex.name} sets`, body);
  }

  async function renderExerciseBlock(ex, idx) {
    // Fetch previous session sets and PRs to show hints
    const history = await getHistoryFor(ex.exerciseId);
    const prev = history.find(h => h.workoutId !== state.activeWorkout.id);
    const prs = await getPRsFor(ex.exerciseId);
    const allDefs = await getAllExercises();
    const def = allDefs.find(x => x.id === ex.exerciseId);
    // Always normalise type from the exercise definition so cardio never shows kg/reps.
    normalizeWorkoutExercise(ex, def);
    if (def?.met != null && ex.met == null) ex.met = def.met;
    const isCustom = (def?.type === "custom") || ex.type === "custom";
    const isInterval = !isCustom && ex.type === "interval";
    // Mobility holds are checked before cardio so a timed stretch stays a hold.
    const isHold = !isCustom && !isInterval && (ex.type === "hold" || def?.type === "hold" || def?.category === "mobility");
    if (isHold) ex.type = "hold";
    const isCardio = !isCustom && !isHold && !isInterval && (looksLikeCardio(def) || looksLikeCardio(ex) || ex.type === "cardio");
    if (isCardio) ex.type = "cardio";
    const exType = isCustom ? "custom" : (isInterval ? "interval" : (isHold ? "hold" : (isCardio ? "cardio" : (ex.type || (def ? inferExerciseType(def) : "weighted") || "weighted"))));
    const metric = isCustom ? normalizeMetric(def?.metric || ex.metric) : null;
    if (isCustom && def?.metric && !ex.metric) ex.metric = def.metric;
    const bwKg = await getBodyweightKg();
    const defForMet = def || { category: isCardio ? "cardio" : "full_body", met: ex.met };
    const exKcal = exerciseKcalTotal(ex);

    // Determine if next exercise exists (for superset link)
    const nextEx = state.activeWorkout.exercises[idx + 1];

    const block = el("div", { class: "exercise-block", "data-ex-idx": String(idx) });
    if (ex.supersetGroup) block.classList.add("in-superset");

    // Type menu — only modes that make sense for this exercise. Single-mode
    // exercises show a plain label instead of a dropdown.
    const TYPE_LABELS = {
      weighted: "Weighted",
      bodyweight: "Bodyweight",
      weighted_bodyweight: `BW +${U.weightUnit()}`,
      cardio: "Cardio",
      hold: "Hold",
      interval: "Intervals",
      custom: metric ? metric.label : "Custom"
    };
    const allowedTypes = allowedTypesFor(def, ex);
    if (!allowedTypes.includes(exType)) allowedTypes.unshift(exType);
    let typeMenu;
    if (allowedTypes.length <= 1) {
      typeMenu = el("span", {
        class: "chip chip-sm",
        title: "How this exercise is logged",
        "data-testid": "exercise-type-label"
      }, TYPE_LABELS[exType] || exType);
    } else {
      typeMenu = el("select", {
        class: "input input-sm",
        style: "width:auto",
        title: "How this exercise is logged",
        "data-testid": "exercise-type-menu"
      });
      for (const val of allowedTypes) {
        const opt = el("option", { value: val }, TYPE_LABELS[val] || val);
        if (val === exType) opt.selected = true;
        typeMenu.appendChild(opt);
      }
      typeMenu.addEventListener("change", async () => {
        const nextType = typeMenu.value;
        const hasLogged = (ex.sets || []).some(st => st.done);
        const shapeChanges = (nextType === "cardio") !== (exType === "cardio");
        if (hasLogged && shapeChanges) {
          const ok = await confirmDialog(
            "Switching how this exercise is logged will clear its logged sets. Continue?",
            { title: "Change logging type?", okLabel: "Switch", danger: true }
          );
          if (!ok) { typeMenu.value = exType; afterExerciseChange(); return; }
          ex.sets = [emptySetForType(nextType)];
        } else if (!hasLogged) {
          ex.sets = [emptySetForType(nextType)];
        }
        ex.type = nextType;
        await Storage.saveWorkout(state.activeWorkout);
        afterExerciseChange();
      });
    }
    const typeControl = (typeMenu.tagName === "SELECT")
      ? wheelizeSelect(typeMenu, { title: "How it's logged" })
      : typeMenu;

    block.appendChild(el("div", { class: "exercise-block-header" },
      el("div", { class: "exercise-block-title" },
        ex.name,
        ex.supersetGroup ? el("span", { class: "chip chip-sm", style: "margin-left:8px" }, "Superset") : null,
        exKcal > 0 ? el("span", { class: "chip chip-sm", style: "margin-left:8px" }, `≈ ${exKcal} kcal`) : null
      ),
      el("div", { class: "row" },
        typeControl,
        // Rest target chip — only where the rest timer actually runs.
        (!isCardio && !isHold && !isInterval) ? el("button", {
          class: "chip chip-sm rest-target-chip" + ((state.prefs.restTargets || {})[ex.exerciseId] ? " is-custom" : ""),
          title: "Rest after each set of this exercise",
          "data-testid": "rest-target-chip",
          on: { click: () => openRestTargetPicker(ex) }
        }, `⏱ ${U.formatTime(restTargetFor(ex.exerciseId))}`) : null,
        // Reorder — the squat rack being taken should not cost logged sets.
        state.activeWorkout.exercises.length > 1 ? el("button", {
          class: "icon-btn move-ex-btn", title: "Move up", "data-testid": "move-ex-up",
          disabled: idx === 0 ? "disabled" : undefined,
          html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m18 15-6-6-6 6"/></svg>',
          on: { click: () => moveExercise(idx, -1) }
        }) : null,
        state.activeWorkout.exercises.length > 1 ? el("button", {
          class: "icon-btn move-ex-btn", title: "Move down", "data-testid": "move-ex-down",
          disabled: idx === state.activeWorkout.exercises.length - 1 ? "disabled" : undefined,
          html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>',
          on: { click: () => moveExercise(idx, 1) }
        }) : null,
        nextEx && !isCardio ? el("button", {
          class: "icon-btn",
          title: ex.supersetGroup && ex.supersetGroup === nextEx.supersetGroup ? "Unlink superset" : "Link with next",
          html: icons.link || "⇄",
          on: { click: async () => {
            if (ex.supersetGroup && ex.supersetGroup === nextEx.supersetGroup) {
              ex.supersetGroup = null;
              nextEx.supersetGroup = null;
            } else {
              const g = ex.supersetGroup || `ss-${U.uid()}`;
              ex.supersetGroup = g;
              nextEx.supersetGroup = g;
            }
            await Storage.saveWorkout(state.activeWorkout);
            afterExerciseChange();
          } }
        }) : null,
        el("button", { class: "icon-btn", title: "Exercise info", on: { click: () => openExerciseDetail(ex.exerciseId) },
          html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>' }),
        el("button", { class: "icon-btn", title: "Remove exercise", on: { click: async () => {
          if (!(await confirmDialog(`Remove ${ex.name} from this workout?`, { title: "Remove exercise?", okLabel: "Remove", danger: true }))) return;
          state.activeWorkout.exercises.splice(idx, 1);
          await Storage.saveWorkout(state.activeWorkout);
          afterExerciseChange();
        } }, html: icons.trash })
      )
    ));

    const body = el("div", { class: "exercise-block-body" });

    // Previous session strip + one-tap fill for empty / not-yet-done sets
    if (prev) {
      const summary = formatPrevSetsSummary(prev.sets, exType);
      const chips = el("div", { class: "prev-set-chips" });
      for (const [i, s] of (prev.sets || []).entries()) {
        let label;
        if (s.durationMin != null) {
          label = `${s.durationMin}m`;
        } else if (exType === "bodyweight" || ((!s.weight || s.weight === 0) && s.reps)) {
          label = `${s.reps}`;
        } else {
          label = `${U.trimNum(U.toDisplayWeight(s.weight))}×${s.reps}`;
        }
        chips.appendChild(el("span", { class: "prev-set-chip", title: `Set ${i + 1}` }, label));
      }
      const fillBtn = el("button", {
        type: "button",
        class: "btn btn-ghost btn-sm prev-fill-btn",
        title: "Copy last session into this exercise",
        on: { click: async () => {
          ex.sets = cloneSetsForReplay(prev.sets, exType);
          await Storage.saveWorkout(state.activeWorkout);
          toast(`Filled ${ex.name} from last time`);
          refreshExerciseBlock(ex);
        } }
      }, "Use last");
      body.appendChild(el("div", { class: "prev-hint-row" },
        el("div", { class: "prev-hint" },
          el("div", { class: "prev-hint-label" }, `Last · ${U.formatDate(prev.date)}`),
          chips,
          el("div", { class: "prev-hint-summary text-xs text-faint" }, summary)
        ),
        fillBtn
      ));
    }

    // Approx burn rate for this exercise
    // Mobility is about time under stretch, not energy burn — no kcal estimate.
    if (!isHold) {
      const kpm = U.kcalPerMin({ ...defForMet, type: exType, category: def?.category || (isCardio ? "cardio" : defForMet.category) }, bwKg);
      body.appendChild(el("div", { class: "text-xs text-faint", style: "margin-bottom:8px" },
        `≈ ${kpm} kcal/min at ${bwKg}kg` + (isCardio ? " · type your machine/watch reading to override" : " · estimate from effort")));
    }

    if (isInterval) {
      const plan = ex.plan || { steps: [] };
      const steps = plan.steps || [];
      // "Start guided run" said nothing about what it starts, and on Running it
      // read like an instruction to go for a run. A stored spec keeps the
      // wording it was built with; everything else — including the preset
      // protocols — is named from the exercise.
      const ivlVocab = (ex.rounds && ROUND_VOCAB[ex.rounds.vocab])
        || roundVocab(def, ex) || ROUND_VOCAB.intervals;
      // Plan overview — the whole protocol at a glance, recovery steps included.
      if (steps.length) {
        const strip = el("div", { class: "ivl-plan", "data-testid": "interval-plan" });
        for (const st of steps) {
          strip.appendChild(el("div", {
            class: "ivl-step" + (st.work ? " is-work" : "") + ` ivl-${st.intensity || "moderate"}`,
            style: `flex-grow:${Math.max(1, st.sec)}`,
            title: `${st.label || ""} · ${U.formatTime(st.sec)}`
          }));
        }
        body.appendChild(strip);
        body.appendChild(el("div", { class: "text-xs text-faint", style: "margin:6px 0 10px" },
          intervalSummary(plan)));
      }
      // Run it guided, or log the efforts by hand — plenty of people time
      // intervals off a watch and just want to record them afterwards.
      if (steps.length) {
        const anyLogged = ex.sets.some(s => s.done);
        body.appendChild(el("button", {
          class: "btn btn-primary btn-block ivr-start", type: "button",
          "data-testid": "start-interval-run",
          on: { click: async () => {
            if (anyLogged && !(await confirmDialog(
              "Some efforts are already logged. Running the protocol will overwrite them.",
              { title: "Run anyway?", okLabel: "Run it" }))) return;
            openIntervalRunner(ex);
          } }
        }, el("span", { html: icons.play || icons.check }),
          `${ex.run ? "Restart" : "Start"} ${ivlVocab.noun}`));
        body.appendChild(el("div", { class: "text-xs text-faint", style: "margin:6px 0 10px; text-align:center" },
          "Cues each change. Keep the screen on for sound."));
      }
      // Bouts you built yourself stay editable, and stay escapable — the type
      // chip refuses to move an interval exercise back to anything else.
      if (ex.rounds) {
        body.appendChild(el("button", {
          class: "btn btn-block btn-ghost rb-edit", type: "button", "data-testid": "rounds-edit",
          on: { click: () => openRoundBuilder(ex, { thenRun: false, vocab: ivlVocab }) }
        }, `Change ${ivlVocab.noun}`));
      }
      const header = el("div", { class: "set-row set-row-header type-interval" },
        el("div", { class: "set-index" }, "#"),
        el("div", {}, "Effort"),
        el("div", {}, "Target"),
        el("div", { style: "text-align:right" }, "Log")
      );
      body.appendChild(header);
      for (const [si, s] of ex.sets.entries()) {
        body.appendChild(renderIntervalRow(ex, si, s, defForMet, bwKg));
      }
    } else if (isHold) {
      const perSide = !!(def?.perSide || ex.perSide);
      const header = el("div", { class: "set-row set-row-header type-hold" },
        el("div", { class: "set-index" }, "#"),
        el("div", {}, perSide ? "Hold (each side)" : "Hold"),
        el("div", { style: "text-align:right" }, "Log")
      );
      body.appendChild(header);
      for (const [si, s] of ex.sets.entries()) {
        body.appendChild(renderHoldRow(ex, si, s, prev, perSide));
      }
      const controls = el("div", { class: "set-add-wrap" },
        el("button", { class: "btn add-set-btn", "data-testid": "add-set", on: { click: async () => {
          const last = [...ex.sets].reverse().find(x => x.done) || ex.sets[ex.sets.length - 1];
          ex.sets.push({ seconds: last?.seconds ?? null, done: false });
          await Storage.saveWorkout(state.activeWorkout);
          refreshExerciseBlock(ex);
        } } }, el("span", { html: icons.plus }), "Add hold"),
        ex.sets.length > 1 ? el("span", { class: "text-xs text-faint" }, "Double-tap the number to delete") : null
      );
      body.appendChild(controls);
    } else if (isCardio) {
      const showDist = cardioTracksDistance(ex);
      // Offer bouts — but ABOVE the minutes row, not instead of it. Someone who
      // did twenty minutes on the bag and wants to record twenty minutes
      // should not have to go through a builder to say so.
      const cardVocab = roundVocab(def, ex);
      if (cardVocab) {
        const d = cardVocab.defaults;
        body.appendChild(el("button", {
          class: "btn btn-block rb-cta", type: "button", "data-testid": "rounds-cta",
          on: { click: () => openRoundBuilder(ex, { vocab: cardVocab }) }
        },
          el("span", { class: "rb-cta-main" }, `Set up ${cardVocab.noun}`),
          el("span", { class: "rb-cta-sub" },
            `${d.rounds} × ${U.formatTime(d.workSec)} with a timer, or your own`)
        ));
      }
      const header = el("div", { class: "set-row set-row-header type-cardio" + (showDist ? "" : " no-dist") },
        el("div", { class: "set-index" }, "#"),
        el("div", {}, "Min"),
        showDist ? el("div", {}, "km") : null,
        el("div", {}, "kcal"),
        el("div", { style: "text-align:right" }, "Log")
      );
      body.appendChild(header);
      for (const [si, s] of ex.sets.entries()) {
        body.appendChild(await renderCardioRow(ex, si, s, prs, prev, defForMet, bwKg, showDist));
      }
      const controls = el("div", { class: "set-add-wrap" },
        el("button", { class: "btn add-set-btn", "data-testid": "add-set", on: { click: async () => {
          const last = [...ex.sets].reverse().find(x => x.done) || ex.sets[ex.sets.length - 1];
          ex.sets.push({
            durationMin: last?.durationMin ?? null,
            intensity: last?.intensity || "moderate",
            distanceKm: last?.distanceKm ?? null,
            done: false
          });
          await Storage.saveWorkout(state.activeWorkout);
          refreshExerciseBlock(ex);
        } } }, el("span", { html: icons.plus }), "Add interval"),
        ex.sets.length > 1 ? el("span", { class: "text-xs text-faint" }, "Double-tap the number to delete") : null
      );
      body.appendChild(controls);
    } else if (isCustom) {
      const unitLabel = metric.unit ? `${metric.label} (${metric.unit})` : metric.label;
      const header = el("div", { class: "set-row set-row-header type-custom" },
        el("div", { class: "set-index" }, "#"),
        el("div", {}, unitLabel),
        el("div", { style: "text-align:right" }, "Log")
      );
      body.appendChild(header);
      for (const [si, s] of ex.sets.entries()) {
        body.appendChild(await renderCustomRow(ex, si, s, prs, prev, metric));
      }
      const controls = el("div", { class: "set-add-wrap" },
        el("button", { class: "btn add-set-btn", "data-testid": "add-set", on: { click: async () => {
          const last = [...ex.sets].reverse().find(x => x.done) || ex.sets[ex.sets.length - 1];
          ex.sets.push({ value: last?.value ?? null, done: false });
          await Storage.saveWorkout(state.activeWorkout);
          refreshExerciseBlock(ex);
        } } }, el("span", { html: icons.plus }), "Add set"),
        ex.sets.length > 1 ? el("span", { class: "text-xs text-faint" }, "Double-tap the number to delete") : null
      );
      body.appendChild(controls);
    } else {
      // Sets table — e1RM/kcal are meta columns (hidden on phone to keep weight/reps readable)
      const weightHead = exType === "bodyweight" ? "" : (exType === "weighted_bodyweight" ? "+" + U.weightUnit() : U.weightUnit());
      const header = el("div", { class: `set-row set-row-header type-${exType}` },
        el("div", { class: "set-index" }, "#"),
        exType === "bodyweight" ? null : el("div", {}, weightHead),
        el("div", {}, "Reps"),
        el("div", { class: "set-meta-col" }, "e1RM"),
        el("div", { class: "set-meta-col" }, "kcal"),
        el("div", { style: "text-align:right" }, "Log")
      );
      body.appendChild(header);

      for (const [si, s] of ex.sets.entries()) {
        body.appendChild(await renderSetRow(ex, si, s, prs, prev, exType, def, bwKg));
      }

      // Add set button + delete hint
      const controls = el("div", { class: "set-add-wrap" },
        el("button", { class: "btn add-set-btn", "data-testid": "add-set", on: { click: async () => {
          const lastDone = [...ex.sets].reverse().find(x => x.done);
          const lastAny = ex.sets[ex.sets.length - 1];
          const prevSet = prev?.sets?.[ex.sets.length] || prev?.sets?.[(prev.sets || []).length - 1];
          ex.sets.push({
            weight: lastDone?.weight ?? lastAny?.weight ?? prevSet?.weight ?? null,
            reps: lastDone?.reps ?? lastAny?.reps ?? prevSet?.reps ?? null,
            done: false
          });
          await Storage.saveWorkout(state.activeWorkout);
          refreshExerciseBlock(ex);
        } } }, el("span", { html: icons.plus }), "Add set"),
        // A warm-up you can pull, for the exercises the pre-session ramp never
        // reaches. Inserted after any warm-ups already there, never into the
        // middle of the work, and left blank — the app knows your working
        // weight, not what you warm up with.
        el("button", { class: "btn add-set-btn add-warmup-btn", "data-testid": "add-warmup-set", on: { click: async () => {
          const at = ex.sets.findIndex(s => !U.isWarmup(s));
          ex.sets.splice(at < 0 ? ex.sets.length : at, 0, { weight: null, reps: null, done: false, warmup: true });
          await Storage.saveWorkout(state.activeWorkout);
          refreshExerciseBlock(ex);
        } } }, el("span", { html: icons.plus }), "Warm-up"),
        ex.sets.length > 1 ? el("span", { class: "text-xs text-faint" }, "Double-tap the set number to delete") : null
      );
      body.appendChild(controls);
    }

    block.appendChild(body);
    return block;
  }

  // One prescribed interval effort: target duration/intensity, logged actual.
  function renderIntervalRow(ex, si, s, def, bwKg) {
    const target = s.seconds != null ? s.seconds : null;
    const intens = U.INTENSITY[s.intensity]?.label || "Mod";
    const secInput = el("input", {
      type: "number", inputmode: "numeric",
      class: "input input-sm input-num",
      placeholder: target != null ? String(target) : "sec",
      value: s.seconds != null ? String(s.seconds) : "",
      title: "Seconds held at this effort",
      autocomplete: "off",
      "aria-label": `Interval ${si + 1} seconds`,
      "data-testid": `set-interval-${si}`
    });
    attachNumPad(secInput, {
      label: `${ex.name} · interval ${si + 1}`, unit: "sec", step: 5,
      chips: target != null ? [{ label: `Target ${target}s`, value: target }] : []
    });
    const persist = U.debounce(async () => {
      const v = secInput.value === "" ? null : parseInt(secInput.value, 10);
      const next = Number.isFinite(v) && v > 0 ? v : null;
      // Timed rows never set `touched`, so seconds you typed but did not tick
      // were invisible to commitFilledSets and deleted by the finish prune.
      if (next !== s.seconds) s.touched = true;
      s.seconds = next;
      await Storage.saveWorkout(state.activeWorkout);
    }, 300);
    secInput.addEventListener("input", persist);

    const doneBtn = el("button", {
      type: "button",
      class: "set-done" + (s.done ? " checked" : ""),
      title: s.done ? "Undo interval" : "Mark interval complete",
      "aria-label": s.done ? "Undo interval" : "Mark interval complete",
      "data-testid": `set-done-${si}`,
      on: { click: async () => {
        if (!s.done) {
          const v = secInput.value === "" ? null : parseInt(secInput.value, 10);
          s.seconds = Number.isFinite(v) && v > 0 ? v : null;
          if (!s.seconds) { toast("Enter how long the effort lasted"); return; }
          // Estimate burn from time at this intensity so totals stay meaningful.
          const kpm = U.kcalPerMin({ ...def, type: "cardio", category: "cardio" }, bwKg, s.intensity);
          s.kcal = Math.round((s.seconds / 60) * kpm);
          s.done = true;
        } else {
          s.done = false;
          s.kcal = null;
        }
        await Storage.saveWorkout(state.activeWorkout);
        const didComplete = s.done;
        await refreshExerciseBlock(ex);
        if (didComplete) flashCompletedSet(ex, si);
      } }
    },
      s.done ? el("span", { html: icons.check }) : null,
      el("span", { class: "set-done-label" }, s.done ? "Done" : "Log")
    );

    // Same numbering rule as the weighted rows: a warm-up effort shows W and
    // consumes no number, so the efforts you count are the ones numbered.
    const isWarm = U.isWarmup(s);
    const setLabel = isWarm
      ? "W"
      : String((ex.sets || []).slice(0, si + 1).filter(x => !U.isWarmup(x)).length);
    // No tools tray on this row, so the "···" opens its menu on a press
    // rather than a hold — hold is the price of a shortcut, not of the only
    // way in. One slice, because Warm-up is the only extra an interval has:
    // notes and drops don't exist here, and the efforts are prescribed by
    // the plan rather than deletable.
    const moreBtn = el("button", {
      type: "button",
      class: "set-more-btn" + (isWarm ? " has-extra" : ""),
      title: "Interval actions",
      "aria-label": `Interval ${si + 1} actions`,
      "data-testid": `set-more-${si}`
    }, "···");
    attachRadial(moreBtn, {
      label: `Interval ${si + 1} actions`,
      press: true,
      items: [
        {
          key: "warmup", label: s.warmup ? "Working effort" : "Warm-up", icon: setIcons.warmup,
          onPick: async () => {
            s.warmup = !s.warmup;
            await Storage.saveWorkout(state.activeWorkout);
            refreshExerciseBlock(ex);
          }
        }
      ]
    });

    return el("div", { class: "set-row type-interval" + (isWarm ? " is-warmup" : ""),
      "data-testid": `set-row-${si}` },
      el("div", { class: "set-index" }, setLabel),
      el("div", { class: "ivl-effort" },
        el("span", { class: `ivl-dot ivl-${s.intensity || "moderate"}` }),
        el("span", { class: "ivl-effort-label" }, s.label || intens)
      ),
      el("div", { class: "hold-input-wrap" },
        secInput,
        el("span", { class: "hold-unit" }, "sec")
      ),
      el("div", { class: "set-row-actions" }, moreBtn, doneBtn)
    );
  }

  // Mobility hold row — a timed hold in seconds, optionally per side.
  function renderHoldRow(ex, si, s, prev, perSide) {
    const prevSet = prev?.sets?.[si];
    const prevSecs = prevSet && prevSet.seconds != null ? prevSet.seconds : null;
    const secInput = el("input", {
      type: "number", inputmode: "numeric",
      class: "input input-sm input-num",
      placeholder: prevSecs != null ? String(prevSecs) : "30",
      value: s.seconds != null ? String(s.seconds) : "",
      title: "Hold (seconds)",
      autocomplete: "off",
      "aria-label": `Hold ${si + 1} in seconds`,
      "data-testid": `set-hold-${si}`
    });
    attachNumPad(secInput, {
      label: `${ex.name} · hold ${si + 1}`, unit: "sec", step: 5,
      chips: [
        prevSecs != null ? { label: `Last ${prevSecs}s`, value: prevSecs } : null,
        { label: "20s", value: 20 }, { label: "30s", value: 30 },
        { label: "45s", value: 45 }, { label: "60s", value: 60 }
      ].filter(Boolean),
      hint: perSide ? "Hold this long on each side" : null
    });
    const persist = U.debounce(async () => {
      const v = secInput.value === "" ? null : parseInt(secInput.value, 10);
      const next = Number.isFinite(v) && v > 0 ? v : null;
      // Timed rows never set `touched`, so seconds you typed but did not tick
      // were invisible to commitFilledSets and deleted by the finish prune.
      if (next !== s.seconds) s.touched = true;
      s.seconds = next;
      await Storage.saveWorkout(state.activeWorkout);
    }, 300);
    secInput.addEventListener("input", persist);

    const doneBtn = el("button", {
      type: "button",
      class: "set-done" + (s.done ? " checked" : ""),
      title: s.done ? "Undo hold" : "Mark hold complete",
      "aria-label": s.done ? "Undo hold" : "Mark hold complete",
      "data-testid": `set-done-${si}`,
      on: { click: async () => {
        if (!s.done) {
          const v = secInput.value === "" ? null : parseInt(secInput.value, 10);
          s.seconds = Number.isFinite(v) && v > 0 ? v : null;
          if (!s.seconds) { toast("Enter how long you held it"); return; }
          s.done = true;
        } else {
          s.done = false;
        }
        await Storage.saveWorkout(state.activeWorkout);
        const didComplete = s.done;
        await refreshExerciseBlock(ex);
        if (didComplete) flashCompletedSet(ex, si);
      } }
    },
      s.done ? el("span", { html: icons.check }) : null,
      el("span", { class: "set-done-label" }, s.done ? "Held" : "Done")
    );

    // Same numbering rule as the weighted rows: a warm-up hold shows W and
    // consumes no number. It matters most here of anywhere — the movement
    // ladders gate on hold seconds, and an easy 20s before a max dead hang
    // must not read as the attempt.
    const isWarm = U.isWarmup(s);
    const setLabel = isWarm
      ? "W"
      : String((ex.sets || []).slice(0, si + 1).filter(x => !U.isWarmup(x)).length);

    const tryDelete = async () => {
      if (ex.sets.length <= 1) { toast("An exercise needs at least one set"); return; }
      if (!(await confirmDialog("Delete this hold?", { title: "Delete hold?", okLabel: "Delete", danger: true }))) return;
      ex.sets.splice(si, 1);
      await Storage.saveWorkout(state.activeWorkout);
      refreshExerciseBlock(ex);
    };

    // No tools tray on this row, so the "···" opens its menu on a press
    // rather than a hold. Two slices — the two things a hold actually
    // supports. Notes and drops don't exist here.
    const moreBtn = el("button", {
      type: "button",
      class: "set-more-btn" + (isWarm ? " has-extra" : ""),
      title: "Hold actions",
      "aria-label": `Hold ${si + 1} actions`,
      "data-testid": `set-more-${si}`
    }, "···");
    attachRadial(moreBtn, {
      label: `Hold ${si + 1} actions`,
      press: true,
      items: [
        {
          key: "warmup", label: s.warmup ? "Working hold" : "Warm-up", icon: setIcons.warmup,
          onPick: async () => {
            s.warmup = !s.warmup;
            await Storage.saveWorkout(state.activeWorkout);
            refreshExerciseBlock(ex);
          }
        },
        { key: "delete", label: "Delete", icon: icons.trash, onPick: tryDelete }
      ]
    });

    const row = el("div", { class: "set-row type-hold" + (isWarm ? " is-warmup" : ""),
      "data-testid": `set-row-${si}` },
      el("div", { class: "set-index" }, setLabel),
      el("div", { class: "hold-input-wrap" },
        secInput,
        el("span", { class: "hold-unit" }, perSide ? "sec / side" : "sec")
      ),
      el("div", { class: "set-row-actions" }, moreBtn, doneBtn)
    );
    // Double-tap the index to delete this hold (matches the other set types).
    row.addEventListener("dblclick", async (e) => {
      e.preventDefault();
      tryDelete();
    });
    return row;
  }

  async function renderCardioRow(ex, si, s, prs, prev, def, bwKg, showDist = true) {
    const prevSet = prev?.sets[si];
    if (!s.intensity) s.intensity = "moderate";

    const durInput = el("input", {
      type: "number", step: "1", inputmode: "decimal", min: "0",
      class: "input input-sm input-num",
      "data-cardio-field": "durationMin",
      placeholder: prevSet?.durationMin != null ? String(prevSet.durationMin) : "20",
      value: s.durationMin ?? "",
      title: "Duration (minutes)"
    });
    const distInput = showDist ? el("input", {
      type: "number", step: "0.1", inputmode: "decimal", min: "0",
      class: "input input-sm input-num",
      "data-cardio-field": "distanceKm",
      placeholder: prevSet?.distanceKm != null ? String(U.toDisplayDistance(prevSet.distanceKm)) : "—",
      value: s.distanceKm != null ? String(U.toDisplayDistance(s.distanceKm)) : "",
      title: "Distance (km)"
    }) : null;

    const metFor = (durationMin) => {
      const met = U.getMET({ ...def, category: "cardio", type: "cardio", met: ex.met ?? def.met }, s.intensity || "moderate");
      return U.estimateKcal(met, bwKg, durationMin || 0);
    };

    const estimateFromUi = () => {
      const dur = durInput.value === ""
        ? (s.durationMin ?? 0)
        : parseFloat(durInput.value);
      return metFor(dur || 0) || 0;
    };

    // Manual kcal from machine/watch; placeholder shows MET estimate when empty.
    const estPlaceholder = (() => {
      const est = s.kcalManual && s.kcal != null
        ? null
        : (s.kcal != null && !s.kcalManual ? s.kcal : estimateFromUi());
      if (s.kcalManual) {
        const liveEst = estimateFromUi();
        return liveEst ? `est ${liveEst}` : (prevSet?.kcal != null ? String(prevSet.kcal) : "kcal");
      }
      return est ? String(est) : (prevSet?.kcal != null ? String(prevSet.kcal) : "kcal");
    })();

    const kcalInput = el("input", {
      type: "number", step: "1", inputmode: "numeric", min: "0",
      class: "input input-sm input-num input-kcal" + (s.kcalManual ? " is-manual" : ""),
      "data-cardio-field": "kcal",
      placeholder: estPlaceholder,
      value: s.kcalManual && s.kcal != null ? String(s.kcal) : (s.done && s.kcal != null && s.kcalManual ? String(s.kcal) : ""),
      title: "Calories burnt — type the reading from your machine or watch to override the estimate"
    });
    // Show stored kcal when logged (manual or estimate) so totals are visible and editable.
    if (!kcalInput.value && s.done && s.kcal != null) {
      kcalInput.value = String(s.kcal);
      if (s.kcalManual) kcalInput.classList.add("is-manual");
    }

    const refreshEstimatePlaceholder = () => {
      if (s.kcalManual && kcalInput.value !== "") return;
      const est = estimateFromUi();
      kcalInput.placeholder = est ? String(est) : "kcal";
      if (!s.kcalManual) kcalInput.classList.remove("is-manual");
    };

    const readManualKcal = () => {
      if (kcalInput.value === "") return null;
      const n = parseFloat(kcalInput.value);
      return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
    };

    const resolveKcal = () => {
      const manual = readManualKcal();
      if (manual != null) {
        s.kcalManual = true;
        s.kcal = manual;
        return manual;
      }
      s.kcalManual = false;
      const est = estimateFromUi();
      s.kcal = est || null;
      return s.kcal;
    };

    const mirrorCardioInputs = () => {
      const nextDur = durInput.value === "" ? null : parseFloat(durInput.value);
      if (nextDur !== s.durationMin) s.touched = true;   // see mirrorStrengthInputs
      s.durationMin = nextDur;
      if (!s.intensity) s.intensity = "moderate";
      if (distInput) s.distanceKm = U.fromDisplayDistance(distInput.value);
      // Keep manual kcal when the user typed it; otherwise refresh estimate.
      if (kcalInput.value !== "") {
        s.kcalManual = true;
        s.kcal = readManualKcal();
        kcalInput.classList.add("is-manual");
      } else {
        s.kcalManual = false;
        s.kcal = s.done ? (estimateFromUi() || null) : null;
        kcalInput.classList.remove("is-manual");
        refreshEstimatePlaceholder();
      }
    };
    // Persist to IndexedDB is debounced; mirror into set object immediately so Finish never loses typed values.
    const debouncedSave = U.debounce(async () => {
      mirrorCardioInputs();
      try { await Storage.saveWorkout(state.activeWorkout); } catch (err) { console.error(err); }
    }, 250);
    durInput.addEventListener("input", () => { mirrorCardioInputs(); debouncedSave(); });
    attachNumPad(durInput, { label: `${ex.name} \u00b7 interval ${si + 1} \u00b7 minutes`, unit: "min", step: 5, decimals: true, wheel: { min: 1, max: 240 } });
    attachNumPad(kcalInput, { label: `${ex.name} \u00b7 interval ${si + 1} \u00b7 calories`, unit: "kcal", step: 10 });
    selectOnFocus(kcalInput);
    if (distInput) {
      attachNumPad(distInput, { label: `${ex.name} \u00b7 interval ${si + 1} \u00b7 distance`, unit: "km", step: 0.5, decimals: true, wheel: { min: 0, max: 100, frac: "tenth" } });
      selectOnFocus(distInput);
      distInput.addEventListener("input", () => { mirrorCardioInputs(); debouncedSave(); });
    }
    kcalInput.addEventListener("input", () => {
      if (kcalInput.value === "") {
        s.kcalManual = false;
        s.kcal = null;
        kcalInput.classList.remove("is-manual");
        refreshEstimatePlaceholder();
      } else {
        s.kcalManual = true;
        s.kcal = readManualKcal();
        kcalInput.classList.add("is-manual");
      }
      debouncedSave();
    });

    const isPR = s.done && s.isPR;
    const doneBtn = el("button", {
      type: "button",
      class: "set-done" + (s.done ? " checked" : "") + (isPR ? " pr" : ""),
      title: s.done ? "Undo interval" : "Mark interval complete",
      "aria-label": s.done ? "Undo interval" : "Mark interval complete",
      on: { click: async () => {
        if (!s.done) {
          s.durationMin = durInput.value === "" ? null : parseFloat(durInput.value);
          if (!s.intensity) s.intensity = "moderate";
          if (distInput) s.distanceKm = U.fromDisplayDistance(distInput.value);
          if (!s.durationMin || s.durationMin <= 0) { toast("Enter duration in minutes first"); return; }
          // Prefer typed machine/watch kcal; fall back to MET estimate.
          const kcal = resolveKcal();
          if (kcal == null || kcal <= 0) {
            // Still allow log with estimate 0 only if duration set — recompute once more.
            s.kcal = estimateFromUi() || 0;
            s.kcalManual = false;
          }
          s.done = true;
          const beforePRs = await getPRsFor(ex.exerciseId);
          const warm = U.isWarmup(s);
          const isDurPR = !warm && s.durationMin > (beforePRs.maxDuration || 0);
          const isDistPR = !warm && (s.distanceKm || 0) > (beforePRs.maxDistance || 0);
          const isKcalPR = !warm && (s.kcal || 0) > (beforePRs.maxKcal || 0);
          s.isPR = isDurPR || isDistPR || isKcalPR;
          s.prTypes = [];
          if (isDurPR) s.prTypes.push("duration");
          if (isDistPR) s.prTypes.push("distance");
          if (isKcalPR) s.prTypes.push("kcal");
          await Storage.saveWorkout(state.activeWorkout);
          if (s.isPR) toast(`🏆 New PR on ${ex.name}`);
          // Short rest after cardio interval is optional; skip auto rest.
        } else {
          s.done = false;
          s.isPR = false;
          s.prTypes = [];
          // Keep manual kcal typed by the user; clear only auto estimate.
          if (!s.kcalManual) s.kcal = null;
          await Storage.saveWorkout(state.activeWorkout);
        }
        const didComplete = s.done;
        await refreshExerciseBlock(ex);
        if (didComplete) flashCompletedSet(ex, si);
      } }
    },
      s.done ? el("span", { html: icons.check }) : null,
      el("span", { class: "set-done-label" }, s.done ? "Logged" : "Done")
    );

    const noteBtn = el("button", {
      class: "note-btn" + (s.note ? " has-note" : ""),
      title: s.note ? "Edit note" : "Add note",
      html: icons.note || "✎",
      on: { click: async () => {
        const ta = el("textarea", { class: "input", rows: "3", placeholder: "Notes for this interval…" });
        ta.value = s.note || "";
        const body = el("div", {}, el("label", { class: "label" }, `Interval ${si + 1} note`), ta);
        const footer = el("div", {},
          el("button", { class: "btn", on: { click: closeModal } }, "Cancel"),
          el("button", { class: "btn btn-primary", on: { click: async () => {
            s.note = ta.value.trim() || undefined;
            await Storage.saveWorkout(state.activeWorkout);
            closeModal();
            refreshExerciseBlock(ex);
          } } }, "Save")
        );
        openModal("Interval note", body, footer);
        setTimeout(() => ta.focus(), 40);
      } }
    });

    // Same numbering rule as every other row: a warm-up shows W and consumes
    // no number. A warm-up jog before intervals is the ordinary case here.
    const isWarm = U.isWarmup(s);
    const setLabel = isWarm
      ? "W"
      : String((ex.sets || []).slice(0, si + 1).filter(x => !U.isWarmup(x)).length);

    const tryDelete = async () => {
      if (ex.sets.length <= 1) { toast("An exercise needs at least one set"); return; }
      if (await confirmDialog("Delete this interval?", { title: "Delete interval?", okLabel: "Delete", danger: true })) {
        ex.sets.splice(si, 1);
        await Storage.saveWorkout(state.activeWorkout);
        refreshExerciseBlock(ex);
      }
    };

    // No tools tray on this row either, so the "···" opens on a press. Note
    // lives in the menu rather than as a third row button — the row is four
    // inputs wide already, and every button here is paid for in kcal digits.
    // Marking a set warm hands back any record it had already taken.
    const moreBtn = el("button", {
      type: "button",
      class: "set-more-btn" + ((isWarm || s.note) ? " has-extra" : ""),
      title: "Interval actions",
      "aria-label": `Interval ${si + 1} actions`,
      "data-testid": `set-more-${si}`
    }, "···");
    attachRadial(moreBtn, {
      label: `Interval ${si + 1} actions`,
      press: true,
      items: [
        {
          key: "warmup", label: s.warmup ? "Working effort" : "Warm-up", icon: setIcons.warmup,
          onPick: async () => {
            s.warmup = !s.warmup;
            if (s.warmup) { s.isPR = false; s.prTypes = []; }
            await Storage.saveWorkout(state.activeWorkout);
            refreshExerciseBlock(ex);
          }
        },
        { key: "note", label: s.note ? "Edit note" : "Note", icon: icons.note, onPick: () => noteBtn.click() },
        { key: "delete", label: "Delete", icon: icons.trash, onPick: tryDelete }
      ]
    });

    const row = el("div", { class: "set-row type-cardio" + (showDist ? "" : " no-dist") + (isPR ? " is-pr" : "") + (s.kcalManual ? " has-manual-kcal" : "") + (isWarm ? " is-warmup" : ""),
      "data-testid": `set-row-${si}` },
      el("div", { class: "set-index" }, setLabel),
      durInput,
      distInput,
      kcalInput,
      el("div", { class: "set-row-actions" }, moreBtn, doneBtn)
    );
    if (isPR) {
      row.appendChild(el("span", { class: "pr-badge", style: "position:absolute; margin-left: -60px; margin-top: -18px" }, "PR"));
    }
    if (s.note) row.appendChild(el("div", { class: "set-note-inline" }, s.note));

    row.addEventListener("dblclick", (e) => { e.preventDefault(); tryDelete(); });
    const indexCell = row.firstChild;
    let lastTap = 0;
    indexCell.addEventListener("touchend", (e) => {
      const now = Date.now();
      if (now - lastTap < 350) { e.preventDefault(); tryDelete(); lastTap = 0; }
      else { lastTap = now; }
    });
    indexCell.style.cursor = "pointer";
    indexCell.title = "Double-tap to delete interval";
    return row;
  }

  // Row for a custom-metric exercise — a single numeric value per set.
  async function renderCustomRow(ex, si, s, prs, prev, metric) {
    metric = normalizeMetric(metric);
    const prevSet = prev?.sets[si];

    const valInput = el("input", {
      type: "number", step: "any", inputmode: "decimal", min: "0",
      class: "input input-sm input-num",
      "data-custom-field": "value",
      placeholder: prevSet?.value != null ? String(prevSet.value) : (metric.unit || metric.label),
      value: s.value ?? "",
      title: metric.label + (metric.unit ? ` (${metric.unit})` : "")
    });

    const mirror = () => {
      const next = valInput.value === "" ? null : parseFloat(valInput.value);
      if (next !== s.value) s.touched = true;             // see mirrorStrengthInputs
      s.value = next;
    };
    const debouncedSave = U.debounce(async () => {
      mirror();
      try { await Storage.saveWorkout(state.activeWorkout); } catch (err) { console.error(err); }
    }, 250);
    valInput.addEventListener("input", () => { mirror(); debouncedSave(); });
    attachNumPad(valInput, { label: `${ex.name} · set ${si + 1} · ${metric.label}`, unit: metric.unit || "", step: 1, decimals: true });
    selectOnFocus(valInput);

    const isPR = s.done && s.isPR;
    const doneBtn = el("button", {
      type: "button",
      class: "set-done" + (s.done ? " checked" : "") + (isPR ? " pr" : ""),
      title: s.done ? "Undo set" : "Mark set complete",
      "aria-label": s.done ? "Undo set" : "Mark set complete",
      on: { click: async () => {
        if (!s.done) {
          s.value = valInput.value === "" ? null : parseFloat(valInput.value);
          if (s.value == null || !Number.isFinite(s.value)) { toast(`Enter ${metric.label.toLowerCase()} first`); return; }
          s.done = true;
          const before = await getPRsFor(ex.exerciseId);
          const prevMax = before.maxValue || 0;
          const prevMin = before.minValue || 0;
          s.isPR = metric.higherIsBetter
            ? (s.value > prevMax)
            : (s.value > 0 && (prevMin === 0 || s.value < prevMin));
          s.prTypes = s.isPR ? ["value"] : [];
          await Storage.saveWorkout(state.activeWorkout);
          if (s.isPR) toast(`🏆 New PR on ${ex.name}`);
        } else {
          s.done = false;
          s.isPR = false;
          s.prTypes = [];
          await Storage.saveWorkout(state.activeWorkout);
        }
        const didComplete = s.done;
        await refreshExerciseBlock(ex);
        if (didComplete) flashCompletedSet(ex, si);
      } }
    },
      s.done ? el("span", { html: icons.check }) : null,
      el("span", { class: "set-done-label" }, s.done ? "Logged" : "Done")
    );

    const noteBtn = el("button", {
      class: "note-btn" + (s.note ? " has-note" : ""),
      title: s.note ? "Edit note" : "Add note",
      html: icons.note || "✎",
      on: { click: async () => {
        const ta = el("textarea", { class: "input", rows: "3", placeholder: "Notes for this set…" });
        ta.value = s.note || "";
        const body = el("div", {}, el("label", { class: "label" }, `Set ${si + 1} note`), ta);
        const footer = el("div", {},
          el("button", { class: "btn", on: { click: closeModal } }, "Cancel"),
          el("button", { class: "btn btn-primary", on: { click: async () => {
            s.note = ta.value.trim() || undefined;
            await Storage.saveWorkout(state.activeWorkout);
            closeModal();
            refreshExerciseBlock(ex);
          } } }, "Save")
        );
        openModal("Set note", body, footer);
        setTimeout(() => ta.focus(), 40);
      } }
    });

    const row = el("div", { class: "set-row type-custom" + (isPR ? " is-pr" : "") },
      el("div", { class: "set-index" }, String(si + 1)),
      valInput,
      el("div", { class: "set-row-actions" }, noteBtn, doneBtn)
    );
    if (isPR) {
      row.appendChild(el("span", { class: "pr-badge", style: "position:absolute; margin-left: -60px; margin-top: -18px" }, "PR"));
    }

    const tryDelete = async () => {
      if (ex.sets.length <= 1) return;
      if (await confirmDialog("Delete this set?", { title: "Delete set?", okLabel: "Delete", danger: true })) {
        ex.sets.splice(si, 1);
        await Storage.saveWorkout(state.activeWorkout);
        refreshExerciseBlock(ex);
      }
    };
    row.addEventListener("dblclick", (e) => { e.preventDefault(); tryDelete(); });
    const indexCell = row.firstChild;
    let lastTap = 0;
    indexCell.addEventListener("touchend", (e) => {
      const now = Date.now();
      if (now - lastTap < 350) { e.preventDefault(); tryDelete(); lastTap = 0; }
      else { lastTap = now; }
    });
    indexCell.style.cursor = "pointer";
    indexCell.title = "Double-tap to delete set";
    return row;
  }

  /** Is there another set still waiting to be logged anywhere in the session?
      Sets under an exercise you have already marked finished don't count: you
      said you were done with it, so its leftover rows are not work you are
      resting for. Deliberately spans every exercise type — a strength set
      followed by a cardio finisher still has something to come. */
  function hasUnloggedSetsLeft(w) {
    return (w?.exercises || []).some(ex =>
      !ex.finished && (ex.sets || []).some(s => !s.done));
  }

  /** Commit one weight×reps set: validate, PR-check, save, start the rest clock.
      The single point at which a strength set becomes "done". The classic row
      reads its two numbers out of two inputs and the guided runner holds them
      in a variable — but PR detection, the kcal estimate and the rest timer
      must not be able to drift apart between the two, so neither owns them.
      Both hand their numbers here and get back true/false. */
  async function commitStrengthSet(ex, s, { weight, reps, exType = "weighted", def = null, bwKg = U.DEFAULT_BW_KG }) {
    const num = (v) => {
      if (v == null || v === "") return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };
    const isBodyweight = exType === "bodyweight";
    const r = num(reps);
    // `weight` arrives in whatever the user is looking at — the classic row
    // reads an input, the runner holds a spun figure — and both are display
    // units. This is the one place a set becomes done, so it is the one place
    // that has to land in kilograms.
    s.weight = isBodyweight ? 0 : U.fromDisplayWeight(num(weight));
    s.reps = r == null ? null : Math.trunc(r);
    if (!s.reps || (!isBodyweight && !s.weight && exType !== "weighted_bodyweight")) {
      toast("Enter weight and reps first");
      return false;
    }
    if (!isBodyweight && !s.weight) s.weight = 0;
    s.done = true;
    // Set here rather than by whoever collected the numbers: a committed set
    // has by definition been touched, and leaving it to the caller is how the
    // two presentations end up storing subtly different records.
    s.touched = true;
    s.kcal = U.estimateKcal(
      U.getMET({ ...(def || {}), met: ex.met ?? def?.met, category: def?.category }),
      bwKg, U.STRENGTH_MIN_PER_SET);
    const beforePRs = await getPRsFor(ex.exerciseId);
    // A warm-up cannot take a record: it is the same bar you will lift again
    // properly in a minute, and a trophy on it would mean nothing. Suppressed
    // here rather than by returning early, because the set still has to be
    // saved and still buys you a rest — it just does not count.
    const warm = U.isWarmup(s);
    const e = U.epley(s.weight, s.reps);
    const isWeightPR = !warm && s.weight > beforePRs.maxWeight;
    const isE1RMPR = !warm && e > beforePRs.maxE1RM;
    const isRepsPR = !warm && s.reps > beforePRs.maxReps;
    s.isPR = isWeightPR || isE1RMPR;
    s.prTypes = [];
    if (isWeightPR) s.prTypes.push("weight");
    if (isE1RMPR) s.prTypes.push("e1rm");
    if (isRepsPR) s.prTypes.push("reps");
    await Storage.saveWorkout(state.activeWorkout);
    if (s.isPR) toast(`🏆 New PR on ${ex.name}`);
    // Rest is time bought for the set that comes next. After the last set of
    // the session there is no next set, and the countdown only stands between
    // you and the wrap-up screen — worse, it starts underneath the completion
    // celebration (z 3000 over the overlay's 250) and is revealed the instant
    // you tap "Review & finish", so it reads as the timer *appearing* at the
    // one moment it has nothing left to time. Same in the guided runner, where
    // closeSetRunner hands the standalone overlay back on the way out.
    if (hasUnloggedSetsLeft(state.activeWorkout)) startRestTimer(ex.exerciseId);
    return true;
  }

  async function renderSetRow(ex, si, s, prs, prev, exType = "weighted", def = null, bwKg = U.DEFAULT_BW_KG) {
    const prevSet = prev?.sets[si];
    const isBodyweight = exType === "bodyweight";
    const showPlates = !isBodyweight && supportsPlateCalculator(def, ex);
    const placeholder = prevSet && prevSet.weight != null ? `${prevSet.weight}` : "";
    const placeholderReps = prevSet && prevSet.reps != null ? `${prevSet.reps}` : "";
    const toolsKey = `${state.activeWorkout?.id || "aw"}:${ex.exerciseId || ex.name}:${si}`;
    const closedKey = toolsKey + ":closed";
    // Open when user expanded, or when note/drop exists — unless user
    // explicitly closed. A warm-up deliberately does not auto-open the tray:
    // the tray shows what a note or drop says, but a warm-up's whole state is
    // already the W badge and the greyed row. Three ramp sets each dragging a
    // tray open would bury the working sets in chrome.
    const toolsOpen = !expandedSetTools.has(closedKey) && (
      expandedSetTools.has(toolsKey) || !!(s.note || s.drop || s.rpe)
    );

    const e1rm = s.done && s.weight && s.reps
      ? (U.e1rmLabel(s.weight, s.reps) || "—")
      : (s.done && isBodyweight && s.reps ? `${s.reps}` : "—");

    const weightInput = el("input", {
      type: "number", step: "0.5", inputmode: "decimal",
      class: "input input-sm input-num",
      placeholder: placeholder || U.weightUnit(),
      value: s.weight != null && s.weight !== "" ? String(U.toDisplayWeight(s.weight)) : "",
      title: `Weight (${U.weightUnit()})`,
      autocomplete: "off",
      "aria-label": `Set ${si + 1} weight in ${U.isImperial() ? "pounds" : "kilograms"}`,
      "data-testid": `set-weight-${si}`
    });
    const repsInput = el("input", {
      type: "number", inputmode: "numeric",
      class: "input input-sm input-num",
      placeholder: placeholderReps || "reps",
      value: s.reps != null && s.reps !== "" ? String(s.reps) : "",
      title: "Reps",
      autocomplete: "off",
      "aria-label": `Set ${si + 1} reps`,
      "data-testid": `set-reps-${si}`
    });
    // A number the circuit runner filled in from the prescription rather than
    // one you counted. Clearing or retyping it drops the marker.
    if (s.prescribed) {
      repsInput.classList.add("set-prescribed");
      repsInput.addEventListener("input", () => {
        s.prescribed = false;
        repsInput.classList.remove("set-prescribed");
      }, { once: true });
    }

    const calcStrengthKcal = () => {
      const met = U.getMET({ ...(def || {}), met: ex.met ?? def?.met, category: def?.category });
      return U.estimateKcal(met, bwKg, U.STRENGTH_MIN_PER_SET);
    };

    const kcalVal = s.done ? String(s.kcal || calcStrengthKcal()) : "—";
    const kcalCell = el("div", {
      class: "mono text-sm text-muted set-meta-col",
      style: "text-align:center"
    }, kcalVal);
    const e1rmCell = el("div", {
      class: "mono text-sm text-muted set-meta-col",
      style: "text-align:center"
    }, e1rm);
    const toolsE1 = el("span", { class: "set-tools-e1rm" }, `e1RM ${e1rm}`);
    const toolsKcal = el("span", { class: "set-tools-kcal" }, s.done ? `${kcalVal} kcal` : "kcal —");
    const toolsMeta = el("div", { class: "set-tools-meta mono text-xs text-muted" }, toolsE1, toolsKcal);

    const mirrorStrengthInputs = () => {
      const nextW = isBodyweight ? (s.weight ?? 0) : U.fromDisplayWeight(weightInput.value);
      const nextR = repsInput.value === "" ? null : parseInt(repsInput.value, 10);
      // Only a real change counts as "touched" — opening the numpad on a
      // prefilled set commits its seeded value and fires input, which used to
      // be enough for that set to be auto-logged at Finish.
      if (nextW !== s.weight || nextR !== s.reps) s.touched = true;
      s.weight = nextW;
      s.reps = nextR;
      const e1 = s.weight && s.reps
        ? (U.e1rmLabel(s.weight, s.reps) || "—")
        : (isBodyweight && s.reps ? `${s.reps}` : "—");
      e1rmCell.textContent = e1;
      toolsE1.textContent = `e1RM ${e1}`;
    };
    const debouncedSave = U.debounce(async () => {
      mirrorStrengthInputs();
      try { await Storage.saveWorkout(state.activeWorkout); } catch (err) { console.error(err); }
    }, 250);
    if (!isBodyweight) weightInput.addEventListener("input", () => { mirrorStrengthInputs(); debouncedSave(); });
    repsInput.addEventListener("input", () => { mirrorStrengthInputs(); debouncedSave(); });
    // Quick-fill chips + a last-session hint for faster logging.
    const prevInSession = si > 0 ? ex.sets[si - 1] : null;
    const dedupeChips = (arr) => { const seen = new Set(); return arr.filter(c => { const k = String(c.value); if (seen.has(k)) return false; seen.add(k); return true; }); };
    const weightChips = dedupeChips([
      prevInSession && prevInSession.weight != null
        ? { label: `Prev ${U.trimNum(U.toDisplayWeight(prevInSession.weight))}`, value: U.toDisplayWeight(prevInSession.weight) } : null,
      prevSet && prevSet.weight != null
        ? { label: `Last ${U.trimNum(U.toDisplayWeight(prevSet.weight))}`, value: U.toDisplayWeight(prevSet.weight) } : null
    ].filter(Boolean));
    const repsChips = dedupeChips([
      prevInSession && prevInSession.reps != null ? { label: `Prev ${prevInSession.reps}`, value: prevInSession.reps } : null,
      prevSet && prevSet.reps != null ? { label: `Last ${prevSet.reps}`, value: prevSet.reps } : null
    ].filter(Boolean));
    const setHint = prevSet
      ? (isBodyweight ? `Last: ${prevSet.reps ?? "\u2014"} reps` : `Last: ${U.formatWeight(prevSet.weight ?? 0)} \u00d7 ${prevSet.reps ?? "\u2014"}`)
      : "";

    // Mark this set complete. The row owns only where the numbers come from \u2014
    // everything after that is commitStrengthSet, shared with the guided runner.
    async function markSetDone() {
      return commitStrengthSet(ex, s, {
        weight: isBodyweight ? 0 : weightInput.value,
        reps: repsInput.value,
        exType, def, bwKg
      });
    }

    attachNumPad(weightInput, {
      label: `${ex.name} \u00b7 set ${si + 1} \u00b7 ${exType === "weighted_bodyweight" ? "added weight" : "weight"}`,
      unit: U.weightUnit(), step: U.weightStep(), decimals: exType !== "weighted_bodyweight",
      allowMinus: exType === "weighted_bodyweight",
      // Added weight can be negative (assisted); plain weight starts at 0.
      // Standard weight gets a tens+ones+¼ split (fast to reach heavy loads);
      // assisted (negative) weight keeps the single whole-number column.
      wheel: { min: exType === "weighted_bodyweight" ? -100 : 0, max: U.weightWheelMax(), frac: "quarter", tens: exType !== "weighted_bodyweight" },
      chips: weightChips, hint: setHint
    });
    attachNumPad(repsInput, {
      label: `${ex.name} \u00b7 set ${si + 1} \u00b7 reps`, unit: "reps", step: 1, wheel: { min: 1, max: 60 },
      chips: repsChips, hint: setHint,
      onLogSet: async () => { if (await markSetDone()) { await refreshExerciseBlock(ex); flashCompletedSet(ex, si); } }
    });

    const openPlates = () => openPlateCalculator(U.fromDisplayWeight(weightInput.value) || (prevSet?.weight ?? 60));
    const makePlatesBtn = (extraClass) => {
      if (!showPlates) return null;
      return el("button", {
        type: "button",
        class: "plate-btn" + (extraClass ? ` ${extraClass}` : ""),
        title: "Plate calculator (barbell)",
        "aria-label": "Open plate calculator",
        "data-testid": `set-plates-${si}`,
        html: icons.plates || "≡",
        on: { click: openPlates }
      });
    };

    const weightCell = isBodyweight
      ? null
      : el("div", { class: "weight-cell" }, weightInput, makePlatesBtn("plates-inline"));

    const isPR = s.done && s.isPR;

    const doneBtn = el("button", {
      type: "button",
      class: "set-done" + (s.done ? " checked" : "") + (isPR ? " pr" : ""),
      title: s.done ? "Undo set" : "Mark set complete",
      "aria-label": s.done ? "Undo set" : "Mark set complete",
      "data-testid": `set-done-${si}`,
      on: { click: async () => {
        if (!s.done) {
          if (!(await markSetDone())) return;
        } else {
          s.done = false;
          s.isPR = false;
          s.prTypes = [];
          s.kcal = undefined;
          await Storage.saveWorkout(state.activeWorkout);
          stopRestTimer();
        }
        const didComplete = s.done;
        await refreshExerciseBlock(ex);
        if (didComplete) flashCompletedSet(ex, si);
      } }
    },
      s.done ? el("span", { html: icons.check }) : null,
      el("span", { class: "set-done-label" }, s.done ? "Logged" : "Done")
    );

    const makeDropBtn = (extraClass) => el("button", {
      type: "button",
      class: "drop-toggle" + (extraClass ? ` ${extraClass}` : "") + (s.drop ? " active" : ""),
      title: s.drop ? "Drop set (click to unmark)" : "Mark as drop set",
      "data-testid": `set-drop-${si}`,
      on: { click: async () => {
        s.drop = !s.drop;
        if (s.drop) {
          expandedSetTools.add(toolsKey);
          expandedSetTools.delete(closedKey);
        }
        await Storage.saveWorkout(state.activeWorkout);
        refreshExerciseBlock(ex);
      } }
    }, "D");

    const makeNoteBtn = (extraClass) => el("button", {
      type: "button",
      class: "note-btn" + (extraClass ? ` ${extraClass}` : "") + (s.note ? " has-note" : ""),
      title: s.note ? "Edit set note" : "Add set note",
      "data-testid": `set-note-${si}`,
      html: icons.note || "✎",
      on: { click: async () => {
        const ta = el("textarea", { class: "input", rows: "3", placeholder: "Notes for this set…" });
        ta.value = s.note || "";
        const body = el("div", {}, el("label", { class: "label" }, `Set ${si + 1} note`), ta);
        const footer = el("div", {},
          el("button", { class: "btn", on: { click: closeModal } }, "Cancel"),
          el("button", { class: "btn btn-primary", on: { click: async () => {
            s.note = ta.value.trim() || undefined;
            if (s.note) {
              expandedSetTools.add(toolsKey);
              expandedSetTools.delete(closedKey);
            }
            await Storage.saveWorkout(state.activeWorkout);
            closeModal();
            refreshExerciseBlock(ex);
          } } }, "Save")
        );
        openModal("Set note", body, footer);
        setTimeout(() => ta.focus(), 40);
      } }
    });

    // RPE — how hard the set actually was, on the 6-10 scale lifters use.
    // Optional and honest: unset means unset, never a guessed default.
    const makeRpeSel = () => {
      const sel = el("select", {
        class: "input input-sm rpe-select" + (s.rpe ? " has-rpe" : ""),
        title: "RPE — rated effort for this set (10 = nothing left)",
        "data-testid": `set-rpe-${si}`
      });
      sel.appendChild(el("option", { value: "" }, "RPE –"));
      for (let r = 6; r <= 10; r += 0.5) {
        const opt = el("option", { value: String(r) }, `RPE ${r}`);
        if (s.rpe === r) opt.selected = true;
        sel.appendChild(opt);
      }
      sel.addEventListener("change", async () => {
        s.rpe = sel.value ? Number(sel.value) : undefined;
        if (s.rpe) {
          expandedSetTools.add(toolsKey);
          expandedSetTools.delete(closedKey);
        }
        await Storage.saveWorkout(state.activeWorkout);
        refreshExerciseBlock(ex);
      });
      return sel;
    };

    const moreBtn = el("button", {
      type: "button",
      class: "set-more-btn" + (toolsOpen ? " is-open" : "") + ((s.note || s.drop || s.warmup || s.rpe) ? " has-extra" : ""),
      title: toolsOpen ? "Hide plates, notes and extras" : "Plates, notes and extras",
      "aria-label": toolsOpen ? "Hide set tools" : "Show set tools",
      "aria-expanded": toolsOpen ? "true" : "false",
      "data-testid": `set-more-${si}`,
      on: { click: () => {
        if (toolsOpen) {
          expandedSetTools.delete(toolsKey);
          expandedSetTools.add(closedKey);
        } else {
          expandedSetTools.delete(closedKey);
          expandedSetTools.add(toolsKey);
        }
        refreshExerciseBlock(ex);
      } }
    }, "···");

    const tools = el("div", {
      class: "set-tools" + (toolsOpen ? " is-open" : ""),
      "data-testid": `set-tools-${si}`
    });
    const trayPlates = makePlatesBtn("plates-tray");
    if (trayPlates) tools.appendChild(trayPlates);
    tools.appendChild(makeDropBtn("set-tool-tray"));
    tools.appendChild(makeNoteBtn("set-tool-tray"));
    tools.appendChild(makeRpeSel());
    tools.appendChild(toolsMeta);

    // A warm-up does not consume a set number. If it did, an exercise whose
    // first set was a ramp would read "2, 3, 4" for its three working sets,
    // and the log would disagree with what the person actually counted.
    const isWarm = U.isWarmup(s);
    const setLabel = isWarm
      ? "W"
      : String((ex.sets || []).slice(0, si + 1).filter(x => !U.isWarmup(x)).length);

    const rowChildren = [
      el("div", { class: "set-index" }, setLabel),
      weightCell,
      repsInput,
      e1rmCell,
      kcalCell,
      el("div", { class: "set-row-actions" },
        makeDropBtn("set-tool-desktop"),
        makeNoteBtn("set-tool-desktop"),
        moreBtn,
        doneBtn
      )
    ].filter(Boolean);

    const row = el("div", {
      class: `set-row type-${exType}`
        + (s.drop ? " is-drop" : "")
        + (s.warmup ? " is-warmup" : "")
        + (toolsOpen ? " has-tools-open" : ""),
      "data-testid": `set-row-${si}`
    }, ...rowChildren, tools);

    if (isPR) {
      row.appendChild(el("span", {
        class: "pr-badge",
        style: "position:absolute; margin-left: -60px; margin-top: -18px"
      }, "PR"));
    }
    if (s.note) {
      row.appendChild(el("div", { class: "set-note-inline" }, s.note));
    }

    const tryDelete = async () => {
      // Reachable from a radial slice now, where silently doing nothing would
      // read as the gesture having failed rather than as a rule.
      if (ex.sets.length <= 1) { toast("An exercise needs at least one set"); return; }
      if (await confirmDialog("Delete this set?", { title: "Delete set?", okLabel: "Delete", danger: true })) {
        ex.sets.splice(si, 1);
        await Storage.saveWorkout(state.activeWorkout);
        refreshExerciseBlock(ex);
      }
    };
    row.addEventListener("dblclick", (e) => {
      if (e.target.closest("input,button,textarea,select")) return;
      e.preventDefault();
      tryDelete();
    });

    // Hold "···" for the actions inside the tray, without opening it.
    //
    // On the button rather than the row: the row is mostly number inputs,
    // where a tap opens the numpad and a hold would be arguing with it. "···"
    // already means "there is more here", so tap opens the tray — which also
    // carries the e1RM and kcal readouts a radial cannot — and hold goes
    // straight to the thing you wanted. Same bargain as the dock's +.
    //
    // Three slices, identical on every exercise type. The plate calculator is
    // deliberately not among them: makePlatesBtn returns nothing for anything
    // that is not a barbell, and a slice that is sometimes the second one and
    // sometimes absent destroys the only thing a radial is for.
    attachRadial(moreBtn, {
      label: `Set ${si + 1} actions`,
      scrollable: true,
      items: [
        {
          key: "warmup", label: s.warmup ? "Working set" : "Warm-up", icon: setIcons.warmup,
          onPick: async () => {
            s.warmup = !s.warmup;
            // A warm-up counts toward nothing, so a record it already claimed
            // has to be given back rather than left sitting on the row.
            if (s.warmup) { s.isPR = false; s.prTypes = []; }
            await Storage.saveWorkout(state.activeWorkout);
            refreshExerciseBlock(ex);
          }
        },
        {
          key: "drop", label: s.drop ? "Undrop" : "Drop set", icon: setIcons.drop,
          onPick: async () => {
            s.drop = !s.drop;
            if (s.drop) { expandedSetTools.add(toolsKey); expandedSetTools.delete(closedKey); }
            await Storage.saveWorkout(state.activeWorkout);
            refreshExerciseBlock(ex);
          }
        },
        { key: "note", label: s.note ? "Edit note" : "Note", icon: icons.note, onPick: () => makeNoteBtn().click() },
        { key: "delete", label: "Delete", icon: icons.trash, onPick: tryDelete }
      ]
    });
    const indexCell = row.querySelector(".set-index");
    let lastTap = 0;
    indexCell.addEventListener("touchend", (e) => {
      const now = Date.now();
      if (now - lastTap < 350) { e.preventDefault(); tryDelete(); lastTap = 0; }
      else { lastTap = now; }
    });
    indexCell.style.cursor = "pointer";
    indexCell.title = "Double-tap to delete set";
    return row;
  }


  // Base tab title restored when no rest countdown is showing.
  const BASE_DOC_TITLE = "FitForge";

  /** Ask for notification permission the first time a rest timer starts (best-effort). */
  function maybeRequestNotifyPermission() {
    try {
      if (!("Notification" in window)) return;
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    } catch (_) { /* non-fatal */ }
  }

  /** Notify when rest is up, if the user allowed notifications; otherwise stay silent. */
  function fireRestCompleteNotification(exName) {
    try {
      if (!("Notification" in window) || Notification.permission !== "granted") return;
      const body = exName ? `Back to ${exName}` : "Next set";
      new Notification("Rest over", { body, tag: "fitforge-rest", silent: false });
    } catch (_) { /* non-fatal */ }
  }

  function startRestTimer(exerciseId) {
    maybeRequestNotifyPermission();
    const secs = restTargetFor(exerciseId);
    state.restTimer = { endsAt: Date.now() + secs * 1000, exerciseId, totalSec: secs };
    if (state.restInterval) clearInterval(state.restInterval);
    // Queue the chime on the shared audio clock now, inside the tap that
    // marked the set done. Building a context at fire time — which is what
    // this used to do — returns a suspended one on iOS and plays nothing, and
    // a JS-timer beep is late or missing whenever the tab is backgrounded.
    if (state.restCancelChime) { state.restCancelChime(); state.restCancelChime = null; }
    try { state.restCancelChime = IntervalRunner.scheduleChime(secs); } catch (_) {}
    // Light pulse so you feel the rest window start (phones that support it).
    try { if (navigator.vibrate) navigator.vibrate(40); } catch (_) {}
    announce(`Resting ${secs} seconds`);
    state.restInterval = setInterval(() => {
      if (!state.restTimer) return;
      const remaining = Math.round((state.restTimer.endsAt - Date.now()) / 1000);
      if (remaining <= 0) {
        // The chime was queued at start and has already sounded on time; this
        // path only has to handle the things that need the main thread.
        try { if (navigator.vibrate) navigator.vibrate([200, 100, 200]); } catch (_) {}
        // Look up exercise name for a nicer notification body
        let exName = "";
        if (state.activeWorkout && exerciseId) {
          const ex = state.activeWorkout.exercises.find(e => e.exerciseId === exerciseId);
          if (ex) exName = ex.name;
        }
        fireRestCompleteNotification(exName);
        // Assertive: the phone is face-down on a bench and the chime may be
        // the only other signal. This is the one interruption the app earns.
        announce(exName ? `Rest complete — ${exName}` : "Rest complete", { assertive: true });
        stopRestTimer();
      } else {
        updateRestTimerUI(remaining);
      }
    }, 250);
    renderRestTimer();
  }
  function stopRestTimer() {
    if (state.restInterval) { clearInterval(state.restInterval); state.restInterval = null; }
    // Skipping rest must take the queued chime with it.
    if (state.restCancelChime) { state.restCancelChime(); state.restCancelChime = null; }
    state.restTimer = null;
    document.title = BASE_DOC_TITLE;
    renderRestTimer();
  }
  // Circumference of the countdown ring (r = 100).
  const REST_RING_C = 2 * Math.PI * 100;

  function renderRestTimer() {
    // The guided runner draws rest itself, in place, using these same ids —
    // one screen holding the countdown and the set it leads to. Stacking a
    // second full-screen overlay on top would hide the one being used.
    if (runnerState) { runnerState.paint(); return; }
    let el_ = document.getElementById("rest-timer");
    if (!state.restTimer) {
      if (el_) el_.remove();
      document.title = BASE_DOC_TITLE;
      return;
    }
    // Full-screen overlay so the rest window can't be missed mid-session.
    if (!el_) {
      let nextName = "";
      if (state.activeWorkout && state.restTimer.exerciseId) {
        const ex = state.activeWorkout.exercises.find(e => e.exerciseId === state.restTimer.exerciseId);
        if (ex) nextName = ex.name;
      }
      // role=timer with the digits hidden: a live countdown re-read four times
      // a second is unusable, and the start and finish are already announced.
      el_ = el("div", { class: "rest-overlay", id: "rest-timer", role: "timer", "aria-label": "Rest timer" },
        el("div", { class: "rest-overlay-inner" },
          el("div", { class: "rest-eyebrow" }, "Rest"),
          el("div", { class: "rest-ring-wrap" },
            (() => {
              const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
              svg.setAttribute("class", "rest-ring");
              svg.setAttribute("viewBox", "0 0 220 220");
              const track = document.createElementNS("http://www.w3.org/2000/svg", "circle");
              track.setAttribute("class", "rest-ring-track");
              track.setAttribute("cx", "110"); track.setAttribute("cy", "110"); track.setAttribute("r", "100");
              const fill = document.createElementNS("http://www.w3.org/2000/svg", "circle");
              fill.setAttribute("class", "rest-ring-fill"); fill.setAttribute("id", "rest-ring-fill");
              fill.setAttribute("cx", "110"); fill.setAttribute("cy", "110"); fill.setAttribute("r", "100");
              fill.setAttribute("stroke-dasharray", String(REST_RING_C));
              fill.setAttribute("stroke-dashoffset", "0");
              svg.appendChild(track); svg.appendChild(fill);
              return svg;
            })(),
            el("div", { class: "rest-ring-center" },
              el("div", { class: "rest-value", id: "rest-value", "aria-hidden": "true" }, "—"),
              nextName ? el("div", { class: "rest-next" }, nextName) : null
            )
          ),
          el("div", { class: "rest-actions" },
            el("button", { class: "rest-btn", type: "button", "data-testid": "rest-add15", on: { click: () => {
              if (!state.restTimer) return;
              state.restTimer.endsAt += 15000;
              state.restTimer.totalSec = (state.restTimer.totalSec || 90) + 15;
              if (state.restCancelChime) state.restCancelChime();
              try {
                state.restCancelChime = IntervalRunner.scheduleChime(
                  (state.restTimer.endsAt - Date.now()) / 1000);
              } catch (_) {}
              updateRestTimerUI(Math.max(0, Math.round((state.restTimer.endsAt - Date.now()) / 1000)));
            } } }, "+15s"),
            el("button", { class: "rest-btn rest-btn-primary", type: "button", "data-testid": "rest-skip", on: { click: stopRestTimer } }, "Skip rest")
          )
        )
      );
      document.body.appendChild(el_);
    }
    const remaining = Math.max(0, Math.round((state.restTimer.endsAt - Date.now()) / 1000));
    updateRestTimerUI(remaining);
  }
  function updateRestTimerUI(remaining) {
    const v = document.getElementById("rest-value");
    if (v) v.textContent = U.formatTime(remaining);
    const fill = document.getElementById("rest-ring-fill");
    if (fill && state.restTimer) {
      const total = Math.max(1, state.restTimer.totalSec || 90);
      const frac = Math.max(0, Math.min(1, remaining / total));
      fill.setAttribute("stroke-dashoffset", String(REST_RING_C * (1 - frac)));
      const overlay = document.getElementById("rest-timer");
      if (overlay) overlay.classList.toggle("is-ending", remaining <= 10);
    }
    // Lock-screen / tab switch: remaining rest visible in the browser title.
    if (state.restTimer) {
      document.title = `${U.formatTime(remaining)} rest · FitForge`;
    }
  }

  // ============ Guided set runner ============
  //
  // The default way to log a strength set, and the answer to "inputting a set
  // is clunky". The clunk was never the number of controls — it was that the
  // app showed you last week's 100 × 5 in grey placeholder text and then
  // refused to log it until you typed it back in. Here those numbers are real,
  // already-committed values and the button is one tap. Changing them is the
  // exception, so changing them is what costs a gesture.
  //
  // Deliberately NOT a wizard. A screen per decision optimises the first set
  // and is paid for on the twentieth; this is one screen that morphs, so the
  // numbers never leave your sight and there is nothing to navigate back
  // through. Rest is drawn in place for the same reason.
  //
  // Everything is a presentation of the same set objects, and logging goes
  // through the same commitStrengthSet the classic rows use.

  let runnerState = null;
  // Set when the user leaves the runner, so re-rendering the workout screen
  // does not drag them straight back into it. Cleared when a session begins.
  let guidedDismissed = false;

  const GUIDED_TYPES = new Set(["weighted", "bodyweight", "weighted_bodyweight"]);

  /** Every strength set in the session, flat, in the order you do them.
      Cardio, holds, intervals and custom metrics are absent on purpose: each
      already has a purpose-built runner, and a flow that only understands
      kg × reps would have to guess at them. */
  function guidedSteps(w) {
    const out = [];
    (w?.exercises || []).forEach((ex, ei) => {
      if (!GUIDED_TYPES.has(ex.type || "weighted")) return;
      (ex.sets || []).forEach((s, si) => out.push({ ei, si, ex, s, exType: ex.type || "weighted" }));
    });
    return out;
  }

  /** Is there anything left for the guided runner to do in this session? */
  function guidedHasWork(w) {
    return guidedSteps(w).some(st => !st.s.done);
  }

  function closeSetRunner({ dismiss = true } = {}) {
    if (!runnerState) return;
    const o = runnerState;
    runnerState = null;
    document.removeEventListener("keydown", o.onKey, true);
    if (o.releaseFocus) o.releaseFocus();
    o.overlay.remove();
    if (dismiss) guidedDismissed = true;
    // A rest window that was running inside the runner needs its standalone
    // overlay back, or the countdown keeps ticking with nothing on screen.
    renderRestTimer();
  }

  // Opening is asynchronous (exercise defs, bodyweight, per-exercise history),
  // and renderActiveWorkout can fire twice in quick succession. Without an
  // in-flight flag the second call clears the `runnerState` guard before the
  // first has set it, and two runners stack.
  let guidedOpening = false;

  async function openSetRunner(opts = {}) {
    const w = state.activeWorkout;
    if (!w || guidedOpening) return;
    let steps = guidedSteps(w);
    if (!steps.length) { toast("Nothing in this session logs in sets and reps"); return; }
    if (runnerState) closeSetRunner({ dismiss: false });
    guidedOpening = true;
    try {
      await buildSetRunner(w, opts);
    } finally { guidedOpening = false; }
  }

  async function buildSetRunner(w, opts) {
    let steps = guidedSteps(w);
    const defs = await getAllExercises();
    const bwKg = await getBodyweightKg();
    // Last session's sets for every exercise in the plan, fetched once.
    // getHistoryFor walks the whole workout store, and the prefill reads it on
    // every render — doing it per set would re-read the database ~20 times.
    const prevByEx = new Map();
    for (const id of new Set(steps.map(st => st.ex.exerciseId))) {
      const h = await getHistoryFor(id);
      prevByEx.set(id, h.find(x => x.workoutId !== w.id) || null);
    }

    /** The number this set opens on. Anything already entered wins, then the
        set you just did in this session, then the same set index last time,
        then that session's final set. Null only when the movement has never
        been logged at all — which is the one case that needs typing. */
    function prefill(step, field) {
      const { ex, si, s } = step;
      if (s[field] != null && s[field] !== "") return s[field];
      for (let k = si - 1; k >= 0; k--) {
        const p = ex.sets[k];
        if (p && p[field] != null && p[field] !== "") return p[field];
      }
      const psets = prevByEx.get(ex.exerciseId)?.sets || [];
      const at = psets[si] || psets[psets.length - 1];
      return at && at[field] != null && at[field] !== "" ? at[field] : null;
    }

    let cursor = steps.findIndex(st => !st.s.done);
    if (cursor < 0) cursor = 0;
    if (opts.exIdx != null) {
      const i = steps.findIndex(st => st.ei === opts.exIdx && !st.s.done);
      if (i >= 0) cursor = i;
    }

    /** Next unlogged set after `from`, wrapping once so a set skipped earlier
        is still offered rather than stranded. -1 when the plan is complete. */
    function nextCursor(from) {
      for (let i = from + 1; i < steps.length; i++) if (!steps[i].s.done) return i;
      for (let i = 0; i <= from && i < steps.length; i++) if (!steps[i].s.done) return i;
      return -1;
    }

    const overlay = el("div", {
      class: "srun", "data-testid": "set-runner",
      role: "dialog", "aria-modal": "true", "aria-label": "Guided set logging"
    });
    const body = el("div", { class: "srun-body" });
    overlay.appendChild(body);
    // Focus lands on LOG SET, which is the only thing this screen is for.
    let releaseRunnerFocus = null;

    // True only while commitStrengthSet is in flight. Committing starts the
    // rest timer, which calls renderRestTimer, which asks us to repaint — with
    // the cursor still on the set we have only just logged. Advance first,
    // paint once.
    let committing = false;

    const fmtKg = (v) => (v == null ? "—" : String(Math.round(v * 100) / 100));

    function lastLine(step) {
      const prev = prevByEx.get(step.ex.exerciseId);
      if (!prev) return "First time logging this";
      const psets = prev.sets || [];
      const at = psets[step.si] || psets[psets.length - 1];
      if (!at) return "First time logging this";
      const when = U.formatDate ? U.formatDate(prev.date) : prev.date;
      return step.exType === "bodyweight"
        ? `${when} · ${at.reps ?? "—"} reps`
        : `${when} · ${U.formatWeight(at.weight)} × ${at.reps ?? "—"}`;
    }

    function render() {
      clear(body);
      // The way out belongs to both views. Drawing it only on the set view
      // meant a rest window you could not leave without skipping it first.
      body.appendChild(topBar());
      if (state.restTimer) { renderResting(); return; }
      renderSet();
    }

    function leave() { closeSetRunner(); renderMainKeepScroll(); }

    function topBar() {
      const doneCount = steps.filter(x => x.s.done).length;
      return el("div", { class: "srun-top" },
        el("button", {
          class: "srun-exit", type: "button", "data-testid": "srun-exit",
          "aria-label": "Switch to the classic set list",
          on: { click: leave }
        }, el("span", { html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>' }), "Classic"),
        el("div", { class: "srun-count", "data-testid": "srun-count" },
          `${doneCount} of ${steps.length} sets`),
        el("button", {
          class: "srun-finish", type: "button", "data-testid": "srun-finish",
          on: { click: leave }
        }, "Finish")
      );
    }

    // ---- the set view -----------------------------------------------------
    function renderSet() {
      const step = steps[cursor];
      if (!step) { renderAllDone(); return; }
      const { ex, si, exType } = step;
      const def = defs.find(d => d.id === ex.exerciseId) || null;
      const isBw = exType === "bodyweight";
      const setCount = (ex.sets || []).length;
      const exOrder = [...new Set(steps.map(x => x.ei))];

      // Display units for the whole of this screen: the figure, the deltas and
      // the wheel are all things the user reads and spins. commitStrengthSet
      // turns it back into kilograms on the way out.
      let curW = U.toDisplayWeight(prefill(step, "weight"));
      let curR = prefill(step, "reps");

      body.appendChild(el("div", { class: "srun-eyebrow" },
        `EXERCISE ${exOrder.indexOf(step.ei) + 1} OF ${exOrder.length}`));
      body.appendChild(el("h2", { class: "srun-name", "data-testid": "srun-name" }, ex.name));
      body.appendChild(el("div", { class: "srun-setline", "data-testid": "srun-setline" },
        `SET ${si + 1} OF ${setCount}`));

      // ---- the two numbers ------------------------------------------------
      // Tap for the exact value, hold for a nudge. Same bargain the set row's
      // "···" makes: the precise path is the obvious one, the fast path is a
      // gesture for whoever wants it.
      const figures = el("div", { class: "srun-figures" });

      const mkFigure = ({ key, unit, get, set, pad, deltas }) => {
        const valSpan = el("span", { class: "srun-fig-val" }, get() == null ? "—" : String(get()));
        const btn = el("button", {
          type: "button", class: "srun-fig", "data-testid": `srun-${key}`,
          "aria-label": `${key}: ${get() == null ? "not set" : get()} ${unit}. Tap to change.`
        }, valSpan, el("span", { class: "srun-fig-unit" }, unit));

        const paint = () => {
          const v = get();
          const txt = v == null ? "—" : String(v);
          valSpan.textContent = txt;
          // 82.5 has to fit beside a rep count on a 390px screen. Step the size
          // down by digit count rather than letting the row wrap or clip —
          // "1" and "112.5" both have to stay readable at arm's length.
          valSpan.style.fontSize = txt.length >= 5 ? "clamp(34px, 12vw, 54px)"
            : txt.length === 4 ? "clamp(42px, 15vw, 68px)" : "";
          btn.classList.toggle("is-empty", v == null);
          btn.setAttribute("aria-label", `${key}: ${v == null ? "not set" : v} ${unit}. Tap to change.`);
        };
        paint();

        // The pad writes into a real input so openNumPad — wheels, quick-fill
        // chips, the lot — is reused rather than reimplemented.
        const input = el("input", { type: "number", class: "srun-hidden-input", tabindex: "-1", "aria-hidden": "true" });
        input.value = get() == null ? "" : String(get());
        attachNumPad(input, { ...pad, noNext: true });
        input.addEventListener("input", () => {
          set(input.value === "" ? null : Number(input.value));
          paint();
        });
        btn.addEventListener("click", () => { if (!btn.classList.contains("radial-suppressed")) input.click(); });
        body.appendChild(input);

        attachRadial(btn, {
          label: `Adjust ${key}`,
          // The big glyph is where you land, the small label is the step. You
          // aim a radial by direction, so what wants confirming is the result
          // — "+2.5" tells you nothing you did not already intend.
          items: deltas.map(d => ({
            key: `${key}${d > 0 ? "p" : "m"}${String(Math.abs(d)).replace(".", "_")}`,
            icon: `<span class="radial-num">${get() == null ? (d > 0 ? "+" : "−") + Math.abs(d) : fmtKg(Math.max(0, get() + d))}</span>`,
            label: `${d > 0 ? "+" : "−"}${Math.abs(d)}`,
            onPick: () => {
              const base = get() == null ? 0 : get();
              const nv = Math.max(0, Math.round((base + d) * 100) / 100);
              set(nv);
              input.value = String(nv);
              paint();
              try { navigator.vibrate && navigator.vibrate(10); } catch (_) {}
            }
          }))
        });
        return btn;
      };

      if (!isBw) {
        figures.appendChild(mkFigure({
          key: "weight", unit: U.weightUnit(),
          get: () => curW, set: (v) => { curW = v; },
          deltas: U.isImperial() ? [-10, -5, 5, 10] : [-5, -2.5, 2.5, 5],
          pad: {
            label: `${ex.name} · set ${si + 1} · ${exType === "weighted_bodyweight" ? "added weight" : "weight"}`,
            unit: U.weightUnit(), step: U.weightStep(), decimals: exType !== "weighted_bodyweight",
            allowMinus: exType === "weighted_bodyweight",
            wheel: { min: exType === "weighted_bodyweight" ? -100 : 0, max: U.weightWheelMax(), frac: "quarter", tens: exType !== "weighted_bodyweight" },
            hint: lastLine(step)
          }
        }));
        figures.appendChild(el("span", { class: "srun-x", "aria-hidden": "true" }, "×"));
      }
      figures.appendChild(mkFigure({
        key: "reps", unit: "reps",
        get: () => curR, set: (v) => { curR = v; },
        deltas: [-2, -1, 1, 2],
        pad: {
          label: `${ex.name} · set ${si + 1} · reps`,
          unit: "reps", step: 1, wheel: { min: 1, max: 60 }, hint: lastLine(step)
        }
      }));
      // The numbers and what they came from are one object, centred together —
      // otherwise the reference line drifts to the bottom of the screen and
      // reads as a footnote about something else.
      body.appendChild(el("div", { class: "srun-center" }, figures,
        el("div", { class: "srun-last", "data-testid": "srun-last" }, lastLine(step))));

      // ---- the one tap ------------------------------------------------------
      const logBtn = el("button", {
        class: "srun-log", type: "button", "data-testid": "srun-log",
        on: { click: async () => {
          committing = true;
          let ok = false;
          try {
            ok = await commitStrengthSet(ex, step.s, { weight: isBw ? 0 : curW, reps: curR, exType, def, bwKg });
          } finally { committing = false; }
          if (!ok) { render(); return; }
          announce(isBw
            ? `Logged ${curR} reps of ${ex.name}`
            : `Logged ${U.formatWeight(U.fromDisplayWeight(curW))} for ${curR} reps of ${ex.name}`);
          markExerciseFinished(ex);
          steps = guidedSteps(w);
          const nxt = nextCursor(cursor);
          if (nxt < 0) { cursor = Math.max(0, steps.length - 1); renderAllDone(); return; }
          cursor = nxt;
          render();
        } }
      }, "LOG SET");
      // Copying last session's set count, which the classic card has always
      // offered and this screen did not. A new exercise starts with one set,
      // so the runner announced "SET 1 OF 1" and "Last one" to somebody who
      // did four of them last Tuesday — turning the one-tap screen into
      // Log, + Add set, Log, + Add set. Only offered before anything is
      // logged, because it replaces the set list rather than extending it.
      const prevForEx = prevByEx.get(ex.exerciseId);
      const canUseLast = prevForEx
        && !(ex.sets || []).some((x) => x.done)
        && cloneSetsForReplay(prevForEx.sets, exType).length > (ex.sets || []).length;
      const useLastBtn = canUseLast ? el("button", {
        class: "srun-minor-btn", type: "button", "data-testid": "srun-use-last",
        title: `Copy last session — ${U.formatDate(prevForEx.date)}`,
        on: { click: async () => {
          ex.sets = cloneSetsForReplay(prevForEx.sets, exType);
          await Storage.saveWorkout(w);
          steps = guidedSteps(w);
          const i = steps.findIndex((x) => x.ei === step.ei && x.si === 0);
          if (i >= 0) cursor = i;
          render();
        } }
      }, `Use last · ${cloneSetsForReplay(prevForEx.sets, exType).length} sets`) : null;

      const foot = el("div", { class: "srun-foot" }, logBtn,
        el("div", { class: "srun-minor" },
          useLastBtn,
          el("button", {
            class: "srun-minor-btn", type: "button", "data-testid": "srun-skip",
            on: { click: () => { const n = nextCursor(cursor); if (n < 0) { renderAllDone(); return; } cursor = n; render(); } }
          }, "Skip set"),
          el("button", {
            class: "srun-minor-btn", type: "button", "data-testid": "srun-addset",
            on: { click: async () => {
              ex.sets.push(emptySetForType(exType));
              await Storage.saveWorkout(w);
              steps = guidedSteps(w);
              const i = steps.findIndex(x => x.ei === step.ei && x.si === ex.sets.length - 1);
              if (i >= 0) cursor = i;
              render();
            } }
          }, "+ Add set")
        )
      );
      body.appendChild(foot);

      const nxt = steps[nextCursor(cursor)];
      body.appendChild(el("div", { class: "srun-next" },
        nxt && nxt !== step
          ? `Up next · ${nxt.ex.name} · set ${nxt.si + 1}`
          : "Last one"));
    }

    /** Once every set of an exercise is logged, the classic pager should agree
        that it is done — otherwise leaving the runner shows a card that looks
        untouched. */
    function markExerciseFinished(ex) {
      if (!ex.finished && (ex.sets || []).length && ex.sets.every(x => x.done)) {
        ex.finished = true;
        Storage.saveWorkout(w);
      }
    }

    // ---- the rest view ----------------------------------------------------
    // Same screen, same countdown driver. The ids are the ones
    // updateRestTimerUI writes to every 250ms, so nothing about the clock is
    // duplicated here — only how it looks.
    function renderResting() {
      const nxt = steps[nextCursor(cursor - 1)] || steps[cursor];
      const wrap = el("div", { class: "srun-rest", id: "rest-timer", "data-testid": "srun-rest" });
      wrap.appendChild(el("div", { class: "srun-eyebrow" }, "REST"));

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "rest-ring");
      svg.setAttribute("viewBox", "0 0 220 220");
      for (const [cls, id] of [["rest-ring-track", null], ["rest-ring-fill", "rest-ring-fill"]]) {
        const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        c.setAttribute("class", cls);
        c.setAttribute("cx", "110"); c.setAttribute("cy", "110"); c.setAttribute("r", "100");
        if (id) {
          c.setAttribute("id", id);
          c.setAttribute("stroke-dasharray", String(REST_RING_C));
          c.setAttribute("stroke-dashoffset", "0");
        }
        svg.appendChild(c);
      }
      wrap.appendChild(el("div", { class: "rest-ring-wrap" }, svg,
        el("div", { class: "rest-ring-center" },
          el("div", { class: "rest-value", id: "rest-value" }, "—"))));

      wrap.appendChild(el("div", { class: "srun-rest-next", "data-testid": "srun-rest-next" },
        nxt
          ? `Up next · ${nxt.ex.name} · set ${nxt.si + 1} of ${(nxt.ex.sets || []).length}`
          : "That was the last set"));

      wrap.appendChild(el("div", { class: "srun-rest-actions" },
        el("button", {
          class: "srun-minor-btn", type: "button", "data-testid": "srun-rest-add15",
          on: { click: () => {
            if (!state.restTimer) return;
            state.restTimer.endsAt += 15000;
            state.restTimer.totalSec = (state.restTimer.totalSec || 90) + 15;
            if (state.restCancelChime) state.restCancelChime();
            try { state.restCancelChime = IntervalRunner.scheduleChime((state.restTimer.endsAt - Date.now()) / 1000); } catch (_) {}
            updateRestTimerUI(Math.max(0, Math.round((state.restTimer.endsAt - Date.now()) / 1000)));
          } }
        }, "+15s"),
        el("button", {
          class: "srun-log srun-log-sm", type: "button", "data-testid": "srun-rest-skip",
          on: { click: () => stopRestTimer() }
        }, "Start next set")
      ));
      body.appendChild(wrap);
      updateRestTimerUI(Math.max(0, Math.round((state.restTimer.endsAt - Date.now()) / 1000)));
    }

    // ---- the end ----------------------------------------------------------
    // The only celebration in the runner. A cheer after every set stops being a
    // reward by the fourth one and becomes something to dismiss; a PR still
    // toasts from commitStrengthSet, which is the thing actually worth saying.
    function renderAllDone() {
      clear(body);
      const done = steps.filter(x => x.s.done);
      const vol = Math.round(done.reduce((a, x) => a + ((x.s.weight || 0) * (x.s.reps || 0)), 0));
      body.appendChild(el("div", { class: "srun-done", "data-testid": "srun-done" },
        el("div", { class: "srun-done-emoji" }, "💪"),
        el("h2", { class: "srun-name" }, "Every set logged"),
        el("div", { class: "srun-done-stats" },
          el("div", { class: "srun-done-stat" },
            el("div", { class: "srun-done-val" }, String(done.length)),
            el("div", { class: "srun-done-lbl" }, "sets")),
          el("div", { class: "srun-done-stat" },
            el("div", { class: "srun-done-val" }, vol > 0 ? vol.toLocaleString("en-GB") : "—"),
            el("div", { class: "srun-done-lbl" }, "kg volume"))
        ),
        el("button", {
          class: "srun-log", type: "button", "data-testid": "srun-done-cta",
          on: { click: () => { closeSetRunner(); renderMainKeepScroll(); } }
        }, "Review & finish")
      ));
    }

    const onKey = (e) => {
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); closeSetRunner(); renderMainKeepScroll(); }
    };
    document.addEventListener("keydown", onKey, true);
    document.body.appendChild(overlay);
    // paint() is what renderRestTimer calls; it is a no-op mid-commit so the
    // screen never shows the set that is in the middle of being logged.
    runnerState = { overlay, onKey, paint: () => { if (!committing) render(); } };
    render();
    // After the first render, so there is a LOG SET button to land on.
    releaseRunnerFocus = trapFocus(overlay, { initial: overlay.querySelector('[data-testid="srun-log"]') });
    runnerState.releaseFocus = () => { if (releaseRunnerFocus) { releaseRunnerFocus(); releaseRunnerFocus = null; } };
  }

  // ---- circuits ---------------------------------------------------------
  // Round-based sessions: EMOM, complexes, station circuits. Their timing used
  // to live only as prose in `detail`. A circuit spec makes it runnable.
  //
  // What gets auto-logged is deliberately narrower than for an interval. The
  // protocol determines how long you spend at a station, so a timed exercise
  // logs its seconds. It does NOT determine how many reps you managed, so a
  // rep exercise is marked done at the prescribed count and flagged — the
  // number is the prescription, not a count, and the row says so.
  /** Scored formats have no per-station timeline: the clock runs once over the
      whole thing and you are the one counting. So they collapse to a single
      capped window and the score comes from the runner's tally, not from
      where the clock happens to be. */
  const SCORED_MODES = { amrap: true, fortime: true };

  function buildCircuitSteps(exercises, spec, byId) {
    if (SCORED_MODES[spec.mode]) {
      const cap = Math.max(60, spec.capSec || 1200);
      // The label sits directly above the big number, so it should say what
      // that number is. Naming the format there instead just repeats the
      // title bar and leaves the clock unexplained — which matters here,
      // because one of these two counts down and the other counts up.
      return [{
        sec: cap, work: true, intensity: "hard",
        label: spec.mode === "amrap" ? "Time left" : "Elapsed"
      }];
    }
    const rounds = Math.max(1, spec.rounds || 1);
    const emom = spec.mode === "emom";
    const slot = spec.slotSec || 60;
    const steps = [];
    for (let r = 0; r < rounds; r++) {
      exercises.forEach((ex, exIndex) => {
        const def = byId.get(ex.exerciseId) || {};
        const timed = def.type === "hold" || ex.type === "hold";
        const perSide = !!(def.perSide || ex.perSide);
        // A timed station honours its own prescription where it has one.
        const prescribed = timed ? (ex.sets && ex.sets[r] && ex.sets[r].seconds) : null;
        const base = emom ? slot : (prescribed || spec.workSec || 40);
        steps.push({
          sec: perSide && !emom ? base * 2 : base,
          work: true, perSide: perSide && !emom,
          intensity: r === 0 ? "moderate" : "hard",
          label: ex.name,
          ref: { exIndex, setIndex: r, timed, perSide: perSide && !emom, round: r + 1 }
        });
        const lastInRound = exIndex === exercises.length - 1;
        if (!emom && !lastInRound && spec.transitionSec) {
          steps.push({ sec: spec.transitionSec, work: false, intensity: "easy", label: "Next station" });
        }
      });
      if (!emom && r < rounds - 1 && spec.restSec) {
        steps.push({ sec: spec.restSec, work: false, intensity: "easy", label: `Rest · round ${r + 2} next` });
      }
    }
    return steps;
  }

  /** The circuit spec for an active workout, if it came from one. */
  function circuitSpecFor(w) {
    if (w.circuit) return w.circuit;
    const t = presetSessions().find(x => x.id === w.templateId);
    return (t && t.circuit) || null;
  }

  async function openCircuitRun(w, opts = {}) {
    const spec = circuitSpecFor(w);
    if (!spec) return;
    const all = await getAllExercises();
    const byId = new Map(all.map(e => [e.id, e]));
    const exercises = w.exercises || [];
    const steps = buildCircuitSteps(exercises, spec, byId);
    if (!steps.length) return;

    return openGuidedRun({
      title: w.name || "Circuit",
      steps,
      scoring: SCORED_MODES[spec.mode] ? spec.mode : null,
      rounds: w.flowRounds || 0,
      onRounds: (n) => { w.flowRounds = n; Storage.saveWorkout(w).catch(() => {}); },
      resume: opts.resume,
      onPersist: (p) => { w.flowRun = p; Storage.saveWorkout(w).catch(() => {}); },
      onFinish: async (summary) => {
        // A scored format's artefact is the score. Rounds are not sets, and
        // inventing set rows from "rounds × the prescription" would record
        // reps nobody counted — so the score is stored and the set list is
        // left for you to fill in if you want it.
        if (summary.score) {
          w.score = summary.score;
          w.flowRun = null;
          w.flowRounds = 0;
          await Storage.saveWorkout(w);
          renderMain();
          toast(summary.score.mode === "amrap"
            ? `Logged ${summary.score.rounds} round${summary.score.rounds === 1 ? "" : "s"}`
            : `Logged ${U.formatTime(Math.round(summary.score.elapsedSec))}`);
          return;
        }
        let prescribedCount = 0;
        for (const res of summary.sets) {
          const ref = res.ref;
          if (!ref || res.skipped) continue;
          const ex = exercises[ref.exIndex];
          const set = ex && (ex.sets || [])[ref.setIndex];
          if (!set) continue;
          if (ref.timed) {
            set.seconds = ref.perSide ? Math.round(res.seconds / 2) : res.seconds;
          } else if (set.reps == null) {
            // No count of your own, so the prescription stands in — marked, so
            // it never reads as something the app watched you do.
            const tplReps = (ex.targetReps != null) ? ex.targetReps : null;
            if (tplReps == null) continue;
            set.reps = tplReps;
            set.prescribed = true;
            prescribedCount++;
          }
          set.done = true;
          set.autoLogged = res.autoLogged;
          set.adjusted = !!res.adjusted;
        }
        w.flowRun = null;
        await Storage.saveWorkout(w);
        renderMain();
        if (prescribedCount) {
          setTimeout(() => toast(`${prescribedCount} rounds logged at the prescribed reps — correct any that differed`), 2400);
        }
      }
    });
  }

  /** Warm-up drills, paced. Nothing is logged — a warm-up is preparation, not
      a set you did, and the app has never recorded it. The value here is being
      told when to change drill and when to switch sides. */
  const WARMUP_DRILL_SEC = 30;
  const WARMUP_CHANGE_SEC = 6;

  function runGuidedWarmup(plan) {
    const drills = plan.drills || [];
    if (!drills.length) return;
    const steps = [];
    drills.forEach((d, i) => {
      steps.push({
        sec: d.perSide ? WARMUP_DRILL_SEC * 2 : WARMUP_DRILL_SEC,
        work: true, perSide: !!d.perSide, intensity: "easy", label: d.name
      });
      if (i < drills.length - 1) {
        steps.push({ sec: WARMUP_CHANGE_SEC, work: false, intensity: "easy", label: "Change drill" });
      }
    });
    return openGuidedRun({
      title: "Warm-up",
      steps,
      onPersist: () => {},          // short and pre-session; nothing to resume
      onFinish: () => {
        toast(plan.ramp ? "Warmed up — ramp sets next" : "Warmed up — good to go");
      }
    });
  }

  // ============ Timed-hold migration ============
  // Plank, side plank, hollow hold and the two carries used to log as reps
  // because they had no type, so the presets prescribed the fiction "3 × 1".
  // They are timed now. Existing history has to be dealt with honestly:
  // a number big enough to have been seconds becomes seconds; the "1" that
  // was only ever a placeholder becomes nothing, because inventing a duration
  // would be worse than admitting one was never recorded.
  const RETYPED_HOLDS = new Set(["plank", "side-plank", "hollow-hold", "farmers-carry", "kb-front-rack-carry"]);
  // Below this, a rep count cannot plausibly have meant seconds.
  const HOLD_SECONDS_FLOOR = 5;

  async function migrateTimedHolds() {
    if (await Storage.getPref("holdsMigrated", false)) return;
    let touched = 0, converted = 0, blanked = 0;
    try {
      const workouts = await Storage.getWorkouts();
      for (const w of workouts) {
        let changed = false;
        for (const ex of (w.exercises || [])) {
          if (!RETYPED_HOLDS.has(ex.exerciseId)) continue;
          for (const set of (ex.sets || [])) {
            if (set.seconds != null) continue;
            if (set.reps == null) continue;
            const n = Number(set.reps);
            if (Number.isFinite(n) && n >= HOLD_SECONDS_FLOOR) { set.seconds = Math.round(n); converted++; }
            else { set.seconds = null; blanked++; }
            delete set.reps;
            changed = true;
          }
          if (changed) ex.type = "hold";
        }
        if (changed) { await Storage.saveWorkout(w); touched++; }
      }
      await Storage.setPref("holdsMigrated", true);
      if (converted || blanked) {
        // Say what happened rather than quietly rewriting someone's history.
        setTimeout(() => toast(
          `Planks and carries now log in seconds · ${converted} converted` +
          (blanked ? `, ${blanked} left blank` : "")), 1200);
      }
    } catch (_) { /* non-fatal: the app works either way */ }
    return { touched, converted, blanked };
  }

  // ============ Guided interval runner ============
  // Press start and go: the protocol runs itself, cues each transition, and
  // writes the efforts back as you complete them. See js/interval-runner.js
  // for why position and cues are on separate clocks.

  /** Efforts that ran to their end untouched log themselves; the rest carry the
      seconds actually served and are flagged rather than silently claimed. */
  async function applyRunSummary(ex, summary, def, bwKg) {
    for (const r of summary.sets) {
      const s = ex.sets[r.setIndex];
      if (!s) continue;
      if (r.skipped) { s.done = false; s.kcal = null; continue; }
      s.seconds = r.seconds;
      s.done = true;
      s.autoLogged = r.autoLogged;
      s.adjusted = !!r.adjusted;
      const kpm = U.kcalPerMin({ ...def, type: "cardio", category: "cardio" }, bwKg, s.intensity);
      s.kcal = Math.round((s.seconds / 60) * kpm);
    }
    ex.run = null;
    await Storage.saveWorkout(state.activeWorkout);
  }

  function runnerStepClass(st) {
    return "ivl-" + (st && st.step ? (st.step.intensity || "moderate") : "easy");
  }

  /** The full-screen runner. Same idiom as the rest overlay — one thing on
      screen, unmissable at arm's length, escapable at any moment. */
  async function openGuidedRun(cfg) {
    const steps = cfg.steps || [];
    if (!steps.length) return;

    const overlay = el("div", { class: "ivr", "data-testid": "interval-runner", role: "dialog",
      "aria-label": `${cfg.title} — ${cfg.noun || "guided run"}` });
    const label = el("div", { class: "ivr-label", "data-testid": "ivr-label" }, "—");
    const clock = el("div", { class: "ivr-clock", "data-testid": "ivr-clock", "aria-hidden": "true" }, "—");
    const sideTag = el("div", { class: "ivr-side", "data-testid": "ivr-side" }, "");
    const nextUp = el("div", { class: "ivr-next", "data-testid": "ivr-next" }, "");
    const totals = el("div", { class: "ivr-totals", "data-testid": "ivr-totals" }, "");

    // ---- scored formats -------------------------------------------------
    // AMRAP counts what you did inside a fixed window; For Time counts how
    // long a fixed amount of work took. Neither is a timeline the runner can
    // walk on your behalf, so the clock is the only thing it owns and the
    // tally belongs to you.
    const scoring = cfg.scoring || null;
    // Seeded from storage, not from zero. A twenty-minute AMRAP is long enough
    // for a phone call, and the runner's own position already survives that \u2014
    // a tally that did not would come back reading zero after eight rounds,
    // which is worse than not counting at all.
    let rounds = Math.max(0, Math.round(cfg.rounds || 0));
    const tally = el("div", { class: "ivr-tally", "data-testid": "ivr-tally" });
    const tallyNum = el("div", { class: "ivr-tally-num", "data-testid": "ivr-tally-num" }, String(rounds));
    const setRounds = (n) => {
      rounds = Math.max(0, n);
      tallyNum.textContent = String(rounds);
      if (cfg.onRounds) cfg.onRounds(rounds);
    };
    const roundBtn = el("button", {
      class: "btn btn-primary ivr-round", type: "button", "data-testid": "ivr-round",
      on: { click: () => {
        setRounds(rounds + 1);
        announce(`Round ${rounds}`);
        try { if (navigator.vibrate) navigator.vibrate(20); } catch (_) {}
      } }
    }, "+ Round");
    const undoBtn = el("button", {
      class: "btn btn-sm ivr-round-undo", type: "button", "data-testid": "ivr-round-undo",
      title: "Remove the last round", "aria-label": "Remove the last round",
      on: { click: () => { if (rounds > 0) { setRounds(rounds - 1); announce(`${rounds} round${rounds === 1 ? "" : "s"}`); } } }
    }, "\u2212");
    if (scoring === "amrap") {
      tally.appendChild(el("div", { class: "ivr-tally-label" }, "ROUNDS"));
      tally.appendChild(tallyNum);
      tally.appendChild(el("div", { class: "ivr-tally-row" }, undoBtn, roundBtn));
    }

    const strip = el("div", { class: "ivl-plan ivr-plan" });
    const segs = steps.map(st => {
      const s = el("div", {
        class: "ivl-step" + (st.work ? " is-work" : "") + ` ivl-${st.intensity || "moderate"}`,
        style: `flex-grow:${Math.max(1, st.sec)}`
      });
      strip.appendChild(s);
      return s;
    });
    const ring = el("div", { class: "ivr-ring" });

    let runner = null;
    let closed = false;

    const pauseBtn = el("button", { class: "rest-btn rest-btn-primary", type: "button", "data-testid": "ivr-pause" }, "Pause");
    const skipBtn = el("button", { class: "rest-btn", type: "button", "data-testid": "ivr-skip" }, "Skip");
    // On a timed plan, ending early is quitting. On a scored one it is how you
    // record a result — For Time ends when the work is done, not when the cap
    // runs out — so the button that does it should not read as abandoning.
    const endBtn = el("button", { class: "rest-btn ivr-end", type: "button", "data-testid": "ivr-end" },
      scoring ? "Finish" : "End");

    function paint(st) {
      if (st.done) {
        label.textContent = "Done";
        clock.textContent = "—";
        nextUp.textContent = "";
        sideTag.style.display = "none";
      } else {
        // A per-side hold is one step with a cue in the middle, so the readout
        // has to say which half you are in — otherwise the chime is ambiguous.
        // It gets its own line: exercise names are long and would push the
        // label outside the ring if they shared one.
        label.textContent = (st.step && st.step.label) || U.INTENSITY[st.step?.intensity]?.label || "Go";
        sideTag.textContent = st.side ? `Side ${st.side}` : "";
        sideTag.style.display = st.side ? "" : "none";
        // For Time counts up: the elapsed figure is the score, so showing the
        // cap draining is showing the wrong number.
        clock.textContent = scoring === "fortime"
          ? U.formatTime(Math.floor(st.elapsedSec))
          : U.formatTime(Math.ceil(st.remainInStep));
        // A scored run is one step, so there is no "next" — only "finish",
        // which is not news and reads as a countdown that has already ended.
        nextUp.textContent = scoring ? "" : (st.nextStep
          ? `Next: ${st.nextStep.label || U.INTENSITY[st.nextStep.intensity]?.label || ""} · ${U.formatTime(st.nextStep.sec)}`
          : "Next: finish");
      }
      totals.textContent = scoring === "fortime"
        ? `cap ${U.formatTime(st.totalSec)}`
        : `${U.formatTime(Math.ceil(st.remainTotal))} left of ${U.formatTime(st.totalSec)}`;
      overlay.className = "ivr " + runnerStepClass(st) + (st.paused ? " is-paused" : "") +
        (st.step && st.step.work ? " is-work" : " is-rest");
      // Ring drains within the current step, so the visual matches the number.
      // Except on For Time, where the number counts up: a ring draining while
      // the digits climb is two readings of the same clock disagreeing, so
      // there it fills toward the cap instead.
      let frac = st.step ? Math.max(0, Math.min(1, st.remainInStep / Math.max(1, st.step.sec))) : 0;
      if (scoring === "fortime") frac = 1 - frac;
      ring.style.setProperty("--frac", String(frac));
      segs.forEach((sg, i) => {
        sg.classList.toggle("is-past", i < st.stepIndex || st.done);
        sg.classList.toggle("is-now", i === st.stepIndex && !st.done);
      });
      pauseBtn.textContent = st.paused ? "Resume" : "Pause";
      // A guided run exists so you do not have to watch the screen, which is
      // exactly the case where a reader needs telling. Once per step, not once
      // per frame — paint runs continuously.
      if (st.step && st.stepIndex !== spokenStep) {
        spokenStep = st.stepIndex;
        announce(scoring
          // "Time left — 1200 seconds" is the step label read aloud, and it
          // tells a screen reader nothing about how this run is scored or
          // what it wants from them.
          ? (scoring === "amrap"
              ? `As many rounds as possible in ${U.formatDuration(st.step.sec)}. Add a round each time you finish one.`
              : `For time. The clock is running, with a ${U.formatDuration(st.step.sec)} cap.`)
          : `${st.step.label || (st.step.work ? "Work" : "Rest")} — ${Math.round(st.step.sec)} seconds`);
      }
    }
    let spokenStep = -1;

    // NOTE: the `announce` option below shadows the global announce() inside
    // this function. Do not try to speak from in here — say it from paint().
    async function finish(summary, { announce = true } = {}) {
      if (closed) return;
      closed = true;
      releaseIvr();
      if (scoring) {
        summary.score = scoring === "amrap"
          ? { mode: "amrap", rounds, capSec: Math.round(summary.totalSec || 0),
              elapsedSec: Math.round(summary.elapsedSec || 0) }
          : { mode: "fortime", elapsedSec: Math.round(summary.elapsedSec || 0),
              capSec: Math.round(summary.totalSec || 0),
              // Hitting the cap is a real outcome and a different one from
              // finishing: "capped" is how every scoreboard records it.
              capped: (summary.elapsedSec || 0) >= (summary.totalSec || 0) - 1 };
      }
      overlay.remove();
      await cfg.onFinish(summary);
      if (!announce) return;
      // The self-test: if the screen was off and the audio was interrupted, say
      // so plainly rather than letting someone conclude the cues are unreliable
      // without knowing why.
      const h = summary.health || {};
      const bits = [`${summary.loggedCount}/${summary.workCount} efforts logged`];
      if (summary.cleanCount < summary.loggedCount) bits.push(`${summary.loggedCount - summary.cleanCount} adjusted`);
      toast(bits.join(" · "));
      if (h.everSuspended && h.hiddenMs > 4000) {
        setTimeout(() => toast("Audio paused while the screen was off — efforts still logged"), 2600);
      }
    }

    pauseBtn.addEventListener("click", () => {
      if (!runner) return;
      const st = runner.state();
      if (st.paused) runner.unpause(); else runner.pause();
      persistRun();
      paint(runner.state());
    });
    skipBtn.addEventListener("click", () => {
      if (!runner) return;
      runner.skip();
      persistRun();
      paint(runner.state());
    });
    endBtn.addEventListener("click", async () => {
      if (!runner) return;
      // "End" reads as abandoning it. On a scored format, stopping early is
      // the normal way to finish — For Time ends when the work is done, not
      // when the cap runs out.
      const msg = scoring === "fortime"
        ? "Stop the clock and log your time?"
        : (scoring === "amrap"
            ? `Finish here and log ${rounds} round${rounds === 1 ? "" : "s"}?`
            : "End this run and log what you've done so far?");
      if (!(await confirmDialog(msg, {
        title: scoring ? "Finish?" : "End run?",
        okLabel: scoring ? "Finish and log" : "End and log"
      }))) return;
      const s = runner.stop();
      await finish(s);
    });

    function persistRun() {
      if (!runner || closed) return;
      cfg.onPersist(runner.persist());
    }

    overlay.appendChild(el("div", { class: "ivr-head" },
      el("div", { class: "ivr-name" }, cfg.title),
      totals
    ));
    overlay.appendChild(el("div", { class: "ivr-stage" }, ring,
      el("div", { class: "ivr-readout" }, label, clock, sideTag, nextUp)));
    if (scoring === "amrap") overlay.appendChild(tally);
    // One capped window has nothing to draw a plan strip from.
    if (!scoring) overlay.appendChild(strip);
    // Skip advances past the current step. On a scored run there is only one
    // step, so Skip is a button that silently ends the whole thing and files
    // a score — no confirm, no way back. It has no meaning here; drop it.
    overlay.appendChild(el("div", { class: "rest-actions ivr-actions" },
      ...(scoring ? [pauseBtn, endBtn] : [pauseBtn, skipBtn, endBtn])));
    document.body.appendChild(overlay);
    overlay.setAttribute("aria-modal", "true");
    // Escape ends the run the same way the End button does — with the same
    // confirmation, so a stray keypress cannot bin a set of efforts. This was
    // the only full-screen surface in the app with no keyboard way out.
    const onEsc = (e) => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); endBtn.click(); } };
    document.addEventListener("keydown", onEsc, true);
    const releaseIvrFocus = trapFocus(overlay, { initial: pauseBtn });
    const releaseIvr = () => { document.removeEventListener("keydown", onEsc, true); releaseIvrFocus(); };

    runner = IntervalRunner.create({
      steps,
      onPaint: paint,
      onComplete: (s) => finish(s)
    });

    // start() must run inside the tap that opened this — that gesture is what
    // unlocks audio on iOS, and it is the only chance we get.
    const res = cfg.resume
      ? await runner.resume(cfg.resume)
      : await runner.start();
    persistRun();
    paint(runner.state());
    if (!res.audio) toast("Sound unavailable — the timer still runs");
    return runner;
  }

  /** A conditioning protocol: one exercise carrying the whole step plan. */
  async function openIntervalRunner(ex, opts = {}) {
    const steps = (ex.plan || {}).steps || [];
    if (!steps.length) return;
    const all = await getAllExercises();
    const def = all.find(x => x.id === ex.exerciseId) || {};
    const bwKg = await getBodyweightKg();
    return openGuidedRun({
      title: ex.name,
      noun: ((ex.rounds && ROUND_VOCAB[ex.rounds.vocab]) || roundVocab(def, ex)
        || ROUND_VOCAB.intervals).noun,
      steps,
      resume: opts.resume,
      onPersist: (p) => {
        ex.run = p;
        Storage.saveWorkout(state.activeWorkout).catch(() => {});
      },
      onFinish: async (summary) => {
        await applyRunSummary(ex, summary, def, bwKg);
        await refreshExerciseBlock(ex);
      }
    });
  }

  // ---- mobility flows -------------------------------------------------
  // A flow is several exercises rather than one plan, so each step carries a
  // ref saying which exercise and set it belongs to. Per-side stretches stay
  // one step with a mid-point switch cue — splitting them would double the
  // rows you have to read back afterwards.
  const FLOW_DEFAULT_HOLD = 45;
  const FLOW_TRANSITION = 8;

  function isHoldEntry(ex, byId) {
    const def = byId.get(ex.exerciseId);
    return (def && (def.type === "hold" || def.category === "mobility")) ||
      ex.type === "hold" || ex.category === "mobility";
  }

  /** Which exercises in this workout form a flow, in order. */
  function flowEntries(w, byId) {
    return (w.exercises || [])
      .map((ex, i) => ({ ex, i }))
      .filter(({ ex }) => isHoldEntry(ex, byId));
  }

  function buildFlowSteps(entries, byId) {
    const steps = [];
    entries.forEach(({ ex, i }, n) => {
      const def = byId.get(ex.exerciseId) || {};
      const perSide = !!(def.perSide || ex.perSide);
      (ex.sets || []).forEach((set, si) => {
        // A stretch you have already timed keeps its own number; otherwise the
        // flow's default. Per-side holds get double, since the number is the
        // time per side.
        const base = Number(set.seconds) > 0 ? Number(set.seconds) : FLOW_DEFAULT_HOLD;
        steps.push({
          sec: perSide ? base * 2 : base,
          work: true, perSide,
          intensity: "easy",
          label: ex.name,
          ref: { exIndex: i, setIndex: si, perSide, perSideSec: base }
        });
        if (!(n === entries.length - 1 && si === (ex.sets || []).length - 1)) {
          steps.push({ sec: FLOW_TRANSITION, work: false, intensity: "easy", label: "Change position" });
        }
      });
    });
    return steps;
  }

  async function openMobilityFlow(w, opts = {}) {
    const all = await getAllExercises();
    const byId = new Map(all.map(e => [e.id, e]));
    const entries = flowEntries(w, byId);
    if (!entries.length) return;
    const steps = buildFlowSteps(entries, byId);

    return openGuidedRun({
      title: w.name || "Mobility flow",
      steps,
      resume: opts.resume,
      onPersist: (p) => {
        w.flowRun = p;
        Storage.saveWorkout(w).catch(() => {});
      },
      onFinish: async (summary) => {
        for (const r of summary.sets) {
          const ref = r.ref;
          if (!ref) continue;
          const ex = w.exercises[ref.exIndex];
          const set = ex && (ex.sets || [])[ref.setIndex];
          if (!set) continue;
          if (r.skipped) { set.done = false; continue; }
          // Per-side holds are logged per side, which is how the row reads.
          set.seconds = ref.perSide ? Math.round(r.seconds / 2) : r.seconds;
          set.done = true;
          set.autoLogged = r.autoLogged;
          set.adjusted = !!r.adjusted;
        }
        w.flowRun = null;
        await Storage.saveWorkout(w);
        renderMain();
      }
    });
  }

  /** A circuit interrupted mid-run. Same contract as the others: resume at the
      exact second, or settle up if it finished while the app was closed. */
  async function resumeCircuitRun(w) {
    const run = w.flowRun;
    const spec = circuitSpecFor(w);
    if (!run || !run.startedAt || !spec) return;
    const all = await getAllExercises();
    const byId = new Map(all.map(e => [e.id, e]));
    const steps = buildCircuitSteps(w.exercises || [], spec, byId);
    const total = steps.reduce((a, st) => a + st.sec, 0);
    // A run parked in pause has pausedAt set; that stretch has not been served
    // and must be discounted too. Reading only pausedTotal meant pausing for a
    // phone call and being killed made elapsed read as hours, so all three
    // resume paths took the "finished while you were away" branch, deleted the
    // run and marked the remaining efforts not-done.
    const elapsed = (Date.now() - run.startedAt - (run.pausedTotal || 0)
      - (run.pausedAt ? Date.now() - run.pausedAt : 0)) / 1000;
    if (elapsed >= total) {
      w.flowRun = null;
      // A scored format that runs out of clock while the app is closed still
      // has a result: the cap was reached. Throwing that away and asking for
      // rounds would also throw away the rounds already tallied, which are
      // the only part of an AMRAP the app cannot reconstruct.
      if (SCORED_MODES[spec.mode]) {
        const capSec = Math.round(total);
        w.score = spec.mode === "amrap"
          ? { mode: "amrap", rounds: w.flowRounds || 0, capSec, elapsedSec: capSec }
          : { mode: "fortime", elapsedSec: capSec, capSec, capped: true };
        w.flowRounds = 0;
        await Storage.saveWorkout(w);
        renderMain();
        toast(spec.mode === "amrap"
          ? `Time up — ${w.score.rounds} round${w.score.rounds === 1 ? "" : "s"} logged`
          : `Time up — logged at the ${U.formatTime(capSec)} cap`);
        return;
      }
      await Storage.saveWorkout(w);
      renderMain();
      toast("Circuit finished while you were away — log your rounds");
      return;
    }
    // Say the tally out loud before asking. "Discard" is destructive here in a
    // way it is not on a timed circuit — it throws away a count nothing else
    // recorded — so the dialog has to show what is at stake.
    const tallied = spec.mode === "amrap" && (w.flowRounds || 0) > 0
      ? ` ${w.flowRounds} round${w.flowRounds === 1 ? "" : "s"} counted so far.` : "";
    if (!(await confirmDialog(
      `${w.name || "The circuit"} is ${U.formatTime(Math.round(elapsed))} in, with ${U.formatTime(Math.round(total - elapsed))} to go.${tallied}`,
      { title: "Resume the circuit?", okLabel: "Resume", cancelLabel: "Discard" }))) {
      w.flowRun = null;
      w.flowRounds = 0;
      await Storage.saveWorkout(w);
      renderMain();
      return;
    }
    openCircuitRun(w, { resume: run });
  }

  /** Same deal for a flow: resume where the clock says, or settle up if it
      already finished while the app was closed. */
  async function resumeMobilityFlow(w) {
    const run = w.flowRun;
    if (!run || !run.startedAt) return;
    const all = await getAllExercises();
    const byId = new Map(all.map(e => [e.id, e]));
    const entries = flowEntries(w, byId);
    if (!entries.length) { w.flowRun = null; await Storage.saveWorkout(w); return; }
    const steps = buildFlowSteps(entries, byId);
    const total = steps.reduce((a, st) => a + st.sec, 0);
    // A run parked in pause has pausedAt set; that stretch has not been served
    // and must be discounted too. Reading only pausedTotal meant pausing for a
    // phone call and being killed made elapsed read as hours, so all three
    // resume paths took the "finished while you were away" branch, deleted the
    // run and marked the remaining efforts not-done.
    const elapsed = (Date.now() - run.startedAt - (run.pausedTotal || 0)
      - (run.pausedAt ? Date.now() - run.pausedAt : 0)) / 1000;

    if (elapsed >= total) {
      const r = IntervalRunner.create({ steps });
      await r.resume(run);
      const summary = r.stop();
      for (const res of summary.sets) {
        const ref = res.ref;
        const ex = ref && w.exercises[ref.exIndex];
        const set = ex && (ex.sets || [])[ref.setIndex];
        if (!set || res.skipped) continue;
        set.seconds = ref.perSide ? Math.round(res.seconds / 2) : res.seconds;
        set.done = true;
        set.autoLogged = res.autoLogged;
      }
      w.flowRun = null;
      await Storage.saveWorkout(w);
      renderMain();
      toast(`Flow finished while you were away · ${summary.loggedCount}/${summary.workCount} holds logged`);
      return;
    }
    if (!(await confirmDialog(
      `${w.name || "The flow"} is ${U.formatTime(Math.round(elapsed))} in, with ${U.formatTime(Math.round(total - elapsed))} to go.`,
      { title: "Resume the flow?", okLabel: "Resume", cancelLabel: "Discard" }))) {
      w.flowRun = null;
      await Storage.saveWorkout(w);
      renderMain();
      return;
    }
    openMobilityFlow(w, { resume: run });
  }

  /** Pick up a run that was in flight when the app was closed. If the whole
      protocol elapsed while you were away it settles up immediately rather
      than pretending the session is still going. */
  async function resumeIntervalRun(ex) {
    const run = ex.run;
    if (!run || !run.startedAt) return;
    const plan = ex.plan || { steps: [] };
    const total = (plan.steps || []).reduce((s, st) => s + (st.sec || 0), 0);
    // A run parked in pause has pausedAt set; that stretch has not been served
    // and must be discounted too. Reading only pausedTotal meant pausing for a
    // phone call and being killed made elapsed read as hours, so all three
    // resume paths took the "finished while you were away" branch, deleted the
    // run and marked the remaining efforts not-done.
    const elapsed = (Date.now() - run.startedAt - (run.pausedTotal || 0)
      - (run.pausedAt ? Date.now() - run.pausedAt : 0)) / 1000;
    const all = await getAllExercises();
    const def = all.find(x => x.id === ex.exerciseId) || {};
    const bwKg = await getBodyweightKg();

    if (elapsed >= total) {
      // Finished while away — credit it without putting a dead timer on screen.
      const r = IntervalRunner.create({ steps: plan.steps });
      await r.resume(run);
      const s = r.stop();
      await applyRunSummary(ex, s, def, bwKg);
      await refreshExerciseBlock(ex);
      toast(`Run finished while you were away · ${s.loggedCount}/${s.workCount} efforts logged`);
      return;
    }
    if (!(await confirmDialog(
      `${ex.name} is ${U.formatTime(Math.round(elapsed))} in, with ${U.formatTime(Math.round(total - elapsed))} to go.`,
      { title: "Resume the run?", okLabel: "Resume", cancelLabel: "Discard" }))) {
      ex.run = null;
      await Storage.saveWorkout(state.activeWorkout);
      await refreshExerciseBlock(ex);
      return;
    }
    openIntervalRunner(ex, { resume: run });
  }

  // ============ LEARNING CENTRE ============
  //
  // Articles and a glossary, sitting above the exercise library in the same
  // tab. They share a tab because they answer the same question from two
  // directions: the library tells you how to do a movement, the articles tell
  // you why the session is shaped the way it is.
  //
  // The glossary is not a page so much as a mechanism. Every term is tappable
  // wherever it appears in prose, which is the difference between a Learning
  // Centre you visit and one that is simply there when a word stops you. The
  // page at the end is generated from the same list, so a definition is
  // written once and cannot drift between the two.

  const LEARN_TOPICS = [
    { id: "training", label: "Training" },
    { id: "nutrition", label: "Nutrition" },
    // The eating-pattern guides, which arrive from data/diet-plans.js rather
    // than data/learn.js because each one ships with the rule it describes.
    { id: "eating", label: "Patterns" },
    { id: "reference", label: "Reference" }
  ];

  /** The disclaimer a topic must carry, or null. Nutrition explains the app's
      own numbers; the patterns go further and describe ways of eating, so they
      get the stronger note that names who to ask instead. */
  const learnTopicNote = (topic) =>
    topic === "eating" ? (window.DIET_PLAN_NOTE || null)
      : topic === "nutrition" ? (window.LEARN_NUTRITION_NOTE || null)
      : null;

  const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  /** Terms that may be linked automatically, longest label first so "reps in
      reserve" wins over "rep" at the same position. Ordinary words are
      excluded upstream by the `auto` flag — linking every "set" would turn a
      paragraph into a minefield. */
  const AUTO_TERMS = (() => {
    const terms = (window.LEARN_TERMS || []).filter((t) => t.auto);
    return terms
      .map((t) => {
        const forms = [t.label, ...(t.aliases || [])].sort((a, b) => b.length - a.length);
        return { term: t, re: new RegExp(`\\b(${forms.map(escapeRe).join("|")})\\b`, "i") };
      })
      .sort((a, b) => b.term.label.length - a.term.label.length);
  })();

  /** Where the Watch button points for an exercise: the curated clip if one
      has been picked, otherwise a search. Both callers go through here so they
      cannot disagree about which. `curated` is what the caption keys off —
      promising "the form video" and delivering a search results page is worse
      than saying which you are getting. */
  function learnDemoUrl(ex) {
    const v = (window.EXERCISE_VIDEOS || {})[ex.id];
    if (v && v.url) return { url: v.url, label: v.label || "Form and setup", curated: true };
    const q = `${ex.name} proper form technique`;
    return {
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
      label: null,
      curated: false
    };
  }

  const termById = (id) => (window.LEARN_TERMS || []).find((t) => t.id === id) || null;
  const articleBySlug = (slug) => (window.LEARN_ARTICLES || []).find((a) => a.slug === slug) || null;

  function closeTermPopover() {
    const p = document.getElementById("term-popover");
    if (p) p.remove();
  }

  /** Definition in place, anchored to the word, without leaving the article.
      Navigating away to a glossary and back is how you lose your place in a
      paragraph you were already struggling with. */
  function openTermPopover(term, anchor) {
    closeTermPopover();
    // "Read more" pointing at the article you are already reading is a button
    // that appears to do nothing.
    const openSlug = (document.getElementById("learn-overlay") || {}).dataset?.slug || null;
    const showMore = term.more && term.more !== openSlug && !!articleBySlug(term.more);
    const pop = el("div", { class: "term-popover", id: "term-popover", "data-testid": "term-popover", role: "dialog" },
      el("div", { class: "term-popover-label" }, term.label),
      el("div", { class: "term-popover-short" }, term.short),
      showMore
        ? el("button", {
            class: "term-popover-more", type: "button", "data-testid": "term-popover-more",
            on: { click: (e) => { e.stopPropagation(); closeTermPopover(); openArticle(term.more); } }
          }, "Read more")
        : null
    );
    document.body.appendChild(pop);
    // Anchor under the word, then pull back inside the viewport. A popover
    // half off the right edge is the common case on a phone.
    const r = anchor.getBoundingClientRect();
    const pw = pop.offsetWidth;
    let left = r.left + r.width / 2 - pw / 2;
    left = Math.max(10, Math.min(left, window.innerWidth - pw - 10));
    const below = r.bottom + 8;
    const fitsBelow = below + pop.offsetHeight < window.innerHeight - 10;
    pop.style.left = `${left}px`;
    pop.style.top = fitsBelow ? `${below}px` : `${Math.max(10, r.top - pop.offsetHeight - 8)}px`;
    setTimeout(() => {
      document.addEventListener("click", closeTermPopover, { once: true });
    }, 0);
  }

  /** Text with its jargon made tappable. `used` spans the whole article so a
      term is linked the first time it appears and left alone after — the point
      is to catch the word where you first meet it, not to decorate every
      instance of it. */
  function linkifyText(text, used) {
    const frag = document.createDocumentFragment();
    let rest = text;
    for (;;) {
      let best = null;
      for (const c of AUTO_TERMS) {
        if (used.has(c.term.id)) continue;
        const m = c.re.exec(rest);
        if (m && (!best || m.index < best.index)) best = { c, index: m.index, matched: m[0] };
      }
      if (!best) break;
      if (best.index) frag.appendChild(document.createTextNode(rest.slice(0, best.index)));
      const t = best.c.term;
      frag.appendChild(el("button", {
        class: "term-link", type: "button", "data-term": t.id, "data-testid": "term-link",
        on: { click: (e) => { e.preventDefault(); e.stopPropagation(); openTermPopover(t, e.currentTarget); } }
      }, best.matched));
      used.add(t.id);
      rest = rest.slice(best.index + best.matched.length);
    }
    if (rest) frag.appendChild(document.createTextNode(rest));
    return frag;
  }

  function articleBodyEl(article) {
    const used = new Set();
    const wrap = el("div", { class: "article-body" });
    for (const sec of article.body || []) {
      if (sec.h) wrap.appendChild(el("h3", { class: "article-h" }, sec.h));
      for (const p of sec.p || []) {
        const node = el("p", { class: "article-p" });
        node.appendChild(linkifyText(p, used));
        wrap.appendChild(node);
      }
      if (sec.list) {
        const ul = el("ul", { class: "article-list" });
        for (const item of sec.list) {
          const li = el("li", {});
          li.appendChild(linkifyText(item, used));
          ul.appendChild(li);
        }
        wrap.appendChild(ul);
      }
    }
    return wrap;
  }

  let learnOverlayKeyHandler = null;
  let releaseArticleFocus = null;
  function closeArticle() {
    closeTermPopover();
    const o = document.getElementById("learn-overlay");
    if (o) o.remove();
    if (learnOverlayKeyHandler) {
      document.removeEventListener("keydown", learnOverlayKeyHandler, true);
      learnOverlayKeyHandler = null;
    }
    if (releaseArticleFocus) { releaseArticleFocus(); releaseArticleFocus = null; }
  }

  function openArticle(slug) {
    const a = articleBySlug(slug);
    if (!a) return;
    closeArticle();
    const overlay = el("div", {
      class: "learn-overlay", id: "learn-overlay", "data-testid": "learn-overlay",
      "data-slug": a.slug,
      role: "dialog", "aria-modal": "true", "aria-label": a.title
    },
      el("div", { class: "learn-overlay-top" },
        el("button", {
          class: "learn-back", type: "button", "data-testid": "learn-back",
          "aria-label": "Back to the Learning Centre", on: { click: closeArticle }
        }, el("span", { html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>' }), "Back")
      ),
      el("div", { class: "learn-overlay-body" },
        el("div", { class: "article-eyebrow" }, (LEARN_TOPICS.find((t) => t.id === a.topic) || {}).label || "Learn"),
        el("h2", { class: "article-title", "data-testid": "article-title" }, a.title),
        el("div", { class: "article-oneliner" }, a.oneLiner),
        learnTopicNote(a.topic)
          ? el("div", { class: "article-note", "data-testid": "article-note" }, learnTopicNote(a.topic))
          : null,
        articleBodyEl(a),
        a.planId ? planArticleFooter(a.planId) : null
      )
    );
    learnOverlayKeyHandler = (e) => {
      if (e.key !== "Escape") return;
      e.preventDefault(); e.stopPropagation();
      if (document.getElementById("term-popover")) closeTermPopover();
      else closeArticle();
    };
    document.addEventListener("keydown", learnOverlayKeyHandler, true);
    document.body.appendChild(overlay);
    overlay.scrollTop = 0;
    // Land on the title, not the Back button: a reader should hear what it has
    // opened before it hears the way out of it.
    releaseArticleFocus = trapFocus(overlay, { initial: overlay.querySelector(".article-title") });
    const t = overlay.querySelector(".article-title");
    if (t) t.setAttribute("tabindex", "-1");
  }

  /** The Learning Centre block that sits at the top of the tab. */
  function renderLearnSection() {
    const articles = window.LEARN_ARTICLES || [];
    const section = el("div", { class: "learn-section", "data-testid": "learn-section" });
    if (!articles.length) return section;

    section.appendChild(el("div", { class: "learn-head" },
      el("h2", { class: "learn-title" }, "Learning Centre"),
      el("div", { class: "learn-sub" }, "Why the training works, and what the numbers mean.")));

    const listHost = el("div", { class: "learn-list", "data-testid": "learn-list" });
    const noteHost = el("div", { class: "learn-note-host" });
    let topic = state.prefs.learnTopic && LEARN_TOPICS.some((t) => t.id === state.prefs.learnTopic)
      ? state.prefs.learnTopic
      : "training";

    const tabs = el("div", { class: "learn-tabs", "data-testid": "learn-tabs" });
    function paint() {
      clear(listHost);
      clear(noteHost);
      for (const b of tabs.querySelectorAll(".learn-tab")) {
        b.classList.toggle("active", b.getAttribute("data-topic") === topic);
      }
      const note = learnTopicNote(topic);
      if (note) {
        noteHost.appendChild(el("div", { class: "learn-note", "data-testid": "learn-note" }, note));
      }
      for (const a of articles.filter((x) => x.topic === topic)) {
        const isGuideline = a.planId && a.planId === state.prefs.dietPlanId;
        listHost.appendChild(el("button", {
          class: "learn-card" + (isGuideline ? " is-guideline" : ""),
          type: "button", "data-slug": a.slug, "data-testid": "learn-card",
          on: { click: () => openArticle(a.slug) }
        },
          el("div", { class: "learn-card-title" }, a.title,
            isGuideline ? el("span", { class: "learn-card-flag", "data-testid": "learn-card-flag" }, "Your guideline") : null),
          el("div", { class: "learn-card-sub" }, a.oneLiner)));
      }
    }
    for (const t of LEARN_TOPICS) {
      tabs.appendChild(el("button", {
        class: "learn-tab", type: "button", "data-topic": t.id, "data-testid": `learn-tab-${t.id}`,
        on: { click: async () => { topic = t.id; state.prefs.learnTopic = t.id; await Storage.setPref("learnTopic", t.id); paint(); } }
      }, t.label));
    }
    section.appendChild(tabs);
    section.appendChild(noteHost);
    section.appendChild(listHost);
    paint();
    return section;
  }

  // ============ EATING PATTERNS ============
  //
  // You read a guide, and you may nominate one pattern as your own guideline.
  // From then on FitForge reports your logged food against that pattern's own
  // rules — which items fell outside the window you set, where the day landed
  // against the cap you chose — and nothing else.
  //
  // What it deliberately does not do: recommend a pattern, score you, keep a
  // streak, or say whether any of it is working. A score is something you can
  // fail, and the moment eating has a pass mark attached the app has changed
  // its relationship to your food. Reporting a rule back to the person who set
  // it is a different thing from judging them by it, and the whole feature
  // lives or dies on keeping those apart.
  //
  // Only patterns whose definition survives contact with what a meal record
  // actually holds are offered at all — see the note at the top of
  // data/diet-plans.js.

  const activePlan = () => (window.DietPlan ? DietPlan.byId(state.prefs.dietPlanId) : null);
  function activePlanConfig(plan) {
    const p = plan || activePlan();
    return p ? DietPlan.normalizeConfig(p, state.prefs.dietPlanConfig) : {};
  }

  async function setDietPlan(planId, config) {
    state.prefs.dietPlanId = planId || null;
    state.prefs.dietPlanConfig = planId ? (config || {}) : {};
    await Storage.setPref("dietPlanId", state.prefs.dietPlanId);
    await Storage.setPref("dietPlanConfig", state.prefs.dietPlanConfig);
  }

  /** The bit of a log toast that reports the pattern's rule, or null. Only the
      window pattern has anything to say about one item — a daily cap and a
      macro split are properties of the day, not of the sandwich. */
  function mealPlanNotice(meal) {
    const plan = activePlan();
    if (!plan) return null;
    const r = DietPlan.checkMeal(plan, activePlanConfig(plan), meal);
    if (!r || r.state !== "outside") return null;
    return r.detail.replace(/\.$/, "");
  }

  /** Log-time toast text: what was logged, plus the rule it fell outside of. */
  function withPlanNotice(base, meal) {
    const n = mealPlanNotice(meal);
    return n ? `${base} · ${n}` : base;
  }

  // ---- choosing one ----

  /** The follow / change / stop control at the foot of a pattern's guide. */
  function planArticleFooter(planId) {
    const plan = DietPlan.byId(planId);
    if (!plan) return null;
    const host = el("div", { class: "plan-foot", "data-testid": "plan-foot" });

    function paint() {
      clear(host);
      const mine = state.prefs.dietPlanId === plan.id;
      host.appendChild(el("div", { class: "plan-foot-head" },
        el("div", { class: "plan-foot-title" }, mine ? "This is your guideline" : "Follow this as a guideline"),
        el("div", { class: "plan-foot-sub" }, mine
          ? `FitForge reports your logged food against it. Checked: ${plan.checks.toLowerCase()}.`
          : "FitForge will report your logged food against this pattern's own rules. It will not score you, and nothing else in the app changes.")
      ));
      if (mine) {
        host.appendChild(el("div", { class: "plan-foot-rule", "data-testid": "plan-foot-rule" },
          DietPlan.summaryLine(plan, activePlanConfig(plan))));
      }
      const row = el("div", { class: "plan-foot-row" });
      if (mine) {
        if (plan.kind !== "composition") {
          row.appendChild(el("button", {
            class: "btn btn-sm", type: "button", "data-testid": "plan-change",
            on: { click: () => openPlanRuleEditor(plan, paint) }
          }, "Change the rule"));
        }
        row.appendChild(el("button", {
          class: "btn btn-sm btn-ghost", type: "button", "data-testid": "plan-stop",
          on: { click: async () => {
            await setDietPlan(null);
            toast("No guideline set");
            paint();
            renderMain();
          } }
        }, "Stop using this"));
      } else {
        row.appendChild(el("button", {
          class: "btn btn-primary btn-sm", type: "button", "data-testid": "plan-use",
          on: { click: async () => {
            // A window or a set of reduced days is the user's to choose, so
            // those open the editor before anything is saved. A macro split
            // has no dial to set — the pattern is the rule.
            if (plan.kind === "composition") {
              await setDietPlan(plan.id, {});
              toast(`${plan.name} is now your guideline`);
              paint();
              renderMain();
            } else {
              openPlanRuleEditor(plan, paint, { adopting: true });
            }
          } }
        }, "Use this as my guideline"));
      }
      host.appendChild(row);
    }

    paint();
    return host;
  }

  /** Set the window, or the reduced days and their cap. `onDone` repaints
      whatever opened it, since both callers show the rule they just changed. */
  function openPlanRuleEditor(plan, onDone, opts = {}) {
    const cfg = DietPlan.normalizeConfig(plan, state.prefs.dietPlanId === plan.id ? state.prefs.dietPlanConfig : null);
    const body = el("div", { class: "plan-editor" });
    const summary = el("div", { class: "plan-editor-summary", "data-testid": "plan-editor-summary" });
    let read = () => cfg;

    if (plan.kind === "window") {
      const startI = el("input", { class: "input", type: "time", value: cfg.start, "data-testid": "plan-window-start" });
      const endI = el("input", { class: "input", type: "time", value: cfg.end, "data-testid": "plan-window-end" });
      read = () => ({ start: startI.value, end: endI.value });
      const repaint = () => { summary.textContent = DietPlan.summaryLine(plan, read()); };

      body.appendChild(el("p", { class: "text-sm text-muted", style: "margin-bottom:12px" },
        "The hours you intend to eat between. Start from a preset if one fits, then move either end."));
      const presets = el("div", { class: "plan-presets" });
      for (const p of plan.presets) {
        presets.appendChild(el("button", {
          class: "plan-preset", type: "button", "data-testid": `plan-preset-${p.id}`,
          on: { click: () => { startI.value = p.start; endI.value = p.end; repaint(); } }
        }, el("span", { class: "plan-preset-label" }, p.label),
           el("span", { class: "plan-preset-hint" }, p.hint)));
      }
      body.appendChild(presets);
      body.appendChild(el("div", { class: "plan-times" },
        el("label", { class: "plan-time" }, el("span", {}, "Opens"), startI),
        el("label", { class: "plan-time" }, el("span", {}, "Closes"), endI)));
      startI.addEventListener("input", repaint);
      endI.addEventListener("input", repaint);
      repaint();
    } else if (plan.kind === "dayType") {
      const chosen = new Set(cfg.days);
      const capI = el("input", {
        class: "input", type: "number", inputmode: "numeric", value: String(cfg.cap),
        min: String(plan.capRange.min), max: String(plan.capRange.max), "data-testid": "plan-cap"
      });
      read = () => ({ days: DietPlan.WEEKDAY_KEYS.filter((d) => chosen.has(d)), cap: capI.value });
      const repaint = () => {
        summary.textContent = chosen.size
          ? DietPlan.summaryLine(plan, read())
          : "Pick at least one day.";
      };

      body.appendChild(el("p", { class: "text-sm text-muted", style: "margin-bottom:12px" },
        "Which days are the reduced ones, and the ceiling you are setting for them."));
      const presets = el("div", { class: "plan-presets" });
      for (const p of plan.presets) {
        presets.appendChild(el("button", {
          class: "plan-preset", type: "button", "data-testid": `plan-preset-${p.id}`,
          on: { click: () => {
            chosen.clear();
            for (const d of p.days) chosen.add(d);
            capI.value = String(p.cap);
            for (const b of days.children) b.classList.toggle("is-on", chosen.has(b.getAttribute("data-day")));
            repaint();
          } }
        }, el("span", { class: "plan-preset-label" }, p.label),
           el("span", { class: "plan-preset-hint" }, p.hint)));
      }
      body.appendChild(presets);
      // Monday-first, because the week the reduced days are counted over is.
      const days = el("div", { class: "plan-days", "data-testid": "plan-days" });
      for (const d of ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]) {
        days.appendChild(el("button", {
          class: "plan-day" + (chosen.has(d) ? " is-on" : ""), type: "button", "data-day": d,
          "data-testid": `plan-day-${d}`,
          on: { click: (e) => {
            if (chosen.has(d)) chosen.delete(d); else chosen.add(d);
            e.currentTarget.classList.toggle("is-on", chosen.has(d));
            repaint();
          } }
        }, DietPlan.WEEKDAY_LABELS[d]));
      }
      body.appendChild(days);
      body.appendChild(el("label", { class: "plan-cap-row" },
        el("span", {}, "Cap on those days"),
        capI,
        el("span", { class: "plan-cap-unit" }, "kcal")));
      capI.addEventListener("input", repaint);
      repaint();
    }

    body.appendChild(summary);
    const footer = el("div", {},
      el("button", { class: "btn", on: { click: closeModal } }, "Cancel"),
      el("button", { class: "btn btn-primary", "data-testid": "plan-editor-save", on: { click: async () => {
        const next = read();
        if (plan.kind === "dayType" && !next.days.length) return toast("Pick at least one day");
        await setDietPlan(plan.id, DietPlan.normalizeConfig(plan, next));
        closeModal();
        toast(opts.adopting ? `${plan.name} is now your guideline` : "Rule updated");
        if (onDone) onDone();
        renderMain();
      } } }, opts.adopting ? "Use this pattern" : "Save")
    );
    // Raised: this is nearly always opened from inside the guide's reader.
    openModal(opts.adopting ? `Set up ${plan.name}` : "Change the rule", body, footer, { raised: true });
  }

  /** The list of patterns, reached from Nutrition. Reading comes first — each
      row opens the guide, which is where the decision is actually made. */
  function openDietPlanPicker() {
    const body = el("div", {});
    body.appendChild(el("div", { class: "learn-note" }, window.DIET_PLAN_NOTE || ""));
    const list = el("div", { class: "plan-picker", "data-testid": "plan-picker" });
    for (const plan of DietPlan.plans()) {
      const mine = state.prefs.dietPlanId === plan.id;
      list.appendChild(el("button", {
        class: "plan-pick" + (mine ? " is-on" : ""), type: "button",
        "data-plan": plan.id, "data-testid": "plan-pick",
        on: { click: () => { closeModal(); openArticle("pattern-" + plan.id); } }
      },
        el("div", { class: "plan-pick-main" },
          el("div", { class: "plan-pick-name" }, plan.name,
            mine ? el("span", { class: "learn-card-flag" }, "Yours") : null),
          el("div", { class: "plan-pick-sub" }, plan.oneLiner),
          el("div", { class: "plan-pick-checks" }, `Checked against: ${plan.checks.toLowerCase()}`)),
        el("span", { class: "plan-pick-chev", html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>' })
      ));
    }
    body.appendChild(list);
    body.appendChild(el("p", { class: "text-xs text-faint", style: "margin-top:12px" },
      "Each one opens its guide. You choose a guideline from there, after reading what it asks of you."));
    const footer = el("div", {},
      el("button", { class: "btn", on: { click: closeModal } }, "Close"),
      state.prefs.dietPlanId ? el("button", {
        class: "btn btn-ghost", "data-testid": "plan-picker-clear", on: { click: async () => {
          await setDietPlan(null);
          closeModal();
          toast("No guideline set");
          afterNutritionChange();
        } }
      }, "Stop using one") : null
    );
    openModal("Eating patterns", body, footer);
  }

  /** Today against the guideline, for the Nutrition overview. Returns the
      quiet one-line prompt when no pattern is set, and nothing at all once
      that has been dismissed — an unasked-for feature should not nag. */
  function buildDietPlanCard(allMeals, dateIso) {
    if (!window.DietPlan) return null;
    const plan = activePlan();
    if (!plan) {
      if (state.prefs.dietPlanPromptSeen) return null;
      return el("div", { class: "plan-prompt", "data-testid": "plan-prompt" },
        el("button", {
          class: "plan-prompt-main", type: "button", "data-testid": "plan-prompt-open",
          on: { click: () => openDietPlanPicker() }
        },
          el("span", { class: "plan-prompt-text" }, "Following an eating pattern? Pick one and this screen will report against it."),
          el("span", { class: "plan-prompt-go" }, "Browse")),
        el("button", {
          class: "plan-prompt-x", type: "button", "aria-label": "Hide this", html: icons.x,
          "data-testid": "plan-prompt-dismiss",
          on: { click: async () => {
            state.prefs.dietPlanPromptSeen = true;
            await Storage.setPref("dietPlanPromptSeen", true);
            afterNutritionChange();
          } }
        })
      );
    }

    const cfg = activePlanConfig(plan);
    const day = DietPlan.checkDay(plan, cfg, allMeals, dateIso);
    const card = el("div", { class: "plan-card", "data-testid": "plan-card", "data-plan": plan.id });
    card.appendChild(el("div", { class: "plan-card-head" },
      el("div", { class: "plan-card-head-text" },
        el("div", { class: "nsection-label" }, "YOUR GUIDELINE"),
        el("div", { class: "plan-card-name", "data-testid": "plan-card-name" }, plan.name),
        el("div", { class: "plan-card-rule", "data-testid": "plan-card-rule" }, DietPlan.summaryLine(plan, cfg))),
      el("button", {
        class: "plan-card-edit", type: "button", "data-testid": "plan-card-edit",
        title: "Eating patterns", "aria-label": "Eating patterns",
        on: { click: () => openDietPlanPicker() }
      }, "Change")
    ));
    card.appendChild(el("div", {
      class: "plan-card-headline" + (day.measurable ? "" : " is-quiet"),
      "data-testid": "plan-card-headline"
    }, day.headline));
    for (const f of day.facts) {
      card.appendChild(el("div", { class: "plan-card-fact" }, f));
    }
    if (day.items.length) {
      const list = el("div", { class: "plan-card-items", "data-testid": "plan-card-items" });
      for (const it of day.items) {
        list.appendChild(el("div", { class: "plan-item" },
          el("span", { class: "plan-item-when" }, it.time),
          el("span", { class: "plan-item-name" }, it.name),
          el("span", { class: "plan-item-text" }, it.text)));
      }
      card.appendChild(list);
    }
    card.appendChild(el("button", {
      class: "plan-card-read", type: "button", "data-testid": "plan-card-read",
      on: { click: () => openArticle("pattern-" + plan.id) }
    }, "Read the guide"));
    return card;
  }

  // ============ EXERCISE LIBRARY ============
  const REFINE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg>';
  const BROWSE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h6M4 12h10M4 18h7"/><path d="M17 9l3 3-3 3"/></svg>';

  /** The three pillars, in the order they are offered.
   *
   *  `mobility` here and `recovery` on a session template are deliberately
   *  different words: an exercise is a stretch, a session made of stretches is
   *  a recovery day. They describe different things and are not interchangeable
   *  — see tests/taxonomy.js, which fails if anyone aligns them. */
  const PILLAR_META = {
    strength: { label: "Strength", blurb: "Lifting, by body part — plus the Olympic lifts and the complexes." },
    conditioning: { label: "Conditioning", blurb: "Cardio, metcon, boxing, and the loaded work Hyrox is made of." },
    mobility: { label: "Mobility", blurb: "Stretches to hold afterwards, and drills to move through before." }
  };
  const PILLAR_ORDER = ["strength", "conditioning", "mobility"];

  /** Split a group into its leaves only when that buys something: it has to be
   *  big enough to be worth wading through AND actually divide into more than
   *  one kind. Ten stretches that are all static stretches is not four taps
   *  better for being split; ten leg exercises spanning squat, hinge and calf
   *  is. Depth follows the content rather than the diagram. */
  const SPLIT_AT = 8;
  function browseLeaves(rows) {
    const subs = [...new Set(rows.map((e) => (e.taxon || {}).sub))];
    return (rows.length > SPLIT_AT && subs.length > 1) ? subs : null;
  }

  /** Pillar → group → leaf, one level at a time, with counts at every step and
   *  a way back. Ends by setting the library's filter and closing. */
  function openBrowseSheet(all, current, onPick) {
    const body = el("div", { "data-testid": "browse-sheet" });
    const tax = (e) => e.taxon || {};

    const row = ({ label, blurb, n, testid, onClick, here }) => el("button", {
      class: "browse-row" + (here ? " is-here" : ""), type: "button", "data-testid": testid,
      on: { click: onClick }
    },
      el("span", { class: "browse-row-main" },
        el("span", { class: "browse-row-label" }, label),
        blurb ? el("span", { class: "browse-row-blurb" }, blurb) : null),
      el("span", { class: "browse-row-n" }, String(n)),
      el("span", { class: "browse-row-chev", "aria-hidden": "true" }, "›")
    );

    const commit = (p) => { closeModal(); onPick(p); };

    function level(path) {
      clear(body);
      // Where you are, and every step of it tappable so you can go back to any
      // of them rather than only one at a time.
      const crumbs = el("div", { class: "browse-crumbs", "data-testid": "browse-crumbs" });
      const steps = [{ label: "All exercises", to: null }];
      if (path) {
        steps.push({ label: PILLAR_META[path.pillar].label, to: { pillar: path.pillar } });
        if (path.group) steps.push({ label: path.group, to: { pillar: path.pillar, group: path.group } });
      }
      steps.forEach((s, i) => {
        if (i) crumbs.appendChild(el("span", { class: "browse-sep", "aria-hidden": "true" }, "›"));
        const last = i === steps.length - 1;
        crumbs.appendChild(last
          ? el("span", { class: "browse-crumb-now" }, s.label)
          : el("button", { class: "browse-crumb-back", type: "button", on: { click: () => level(s.to) } }, s.label));
      });
      body.appendChild(crumbs);

      if (!path) {
        for (const p of PILLAR_ORDER) {
          const rows = all.filter((e) => tax(e).pillar === p);
          body.appendChild(row({
            label: PILLAR_META[p].label, blurb: PILLAR_META[p].blurb, n: rows.length,
            testid: "browse-pillar-" + p, onClick: () => level({ pillar: p })
          }));
        }
        // The escape hatch, and the honest one: browsing is a convenience, not
        // a gate, and search still ignores all of this.
        body.appendChild(el("button", {
          class: "browse-all", type: "button", "data-testid": "browse-show-all",
          on: { click: () => commit(null) }
        }, "Show the whole library"));
        return;
      }

      const inPillar = all.filter((e) => tax(e).pillar === path.pillar);
      if (!path.group) {
        const groups = [...new Set(inPillar.map((e) => tax(e).group))];
        for (const g of groups) {
          const rows = inPillar.filter((e) => tax(e).group === g);
          const leaves = browseLeaves(rows);
          body.appendChild(row({
            label: g, n: rows.length, testid: "browse-group",
            // A group that does not split has nothing to drill into, so it
            // filters immediately rather than opening a list of one thing.
            onClick: () => (leaves ? level({ pillar: path.pillar, group: g })
              : commit({ pillar: path.pillar, group: g }))
          }));
        }
        body.appendChild(el("button", {
          class: "browse-all", type: "button", "data-testid": "browse-whole-pillar",
          on: { click: () => commit({ pillar: path.pillar }) }
        }, `All ${PILLAR_META[path.pillar].label.toLowerCase()} (${inPillar.length})`));
        return;
      }

      const inGroup = inPillar.filter((e) => tax(e).group === path.group);
      for (const s of [...new Set(inGroup.map((e) => tax(e).sub))]) {
        const n = inGroup.filter((e) => tax(e).sub === s).length;
        body.appendChild(row({
          label: s, n, testid: "browse-sub",
          onClick: () => commit({ pillar: path.pillar, group: path.group, sub: s })
        }));
      }
      body.appendChild(el("button", {
        class: "browse-all", type: "button", "data-testid": "browse-whole-group",
        on: { click: () => commit({ pillar: path.pillar, group: path.group }) }
      }, `All ${path.group.toLowerCase()} (${inGroup.length})`));
    }

    // Reopening from a crumb starts where you already are, not at the top.
    level(current ? { pillar: current.pillar, group: current.sub ? current.group : null } : null);
    openModal("Browse", body, el("div", {},
      el("button", { class: "btn", on: { click: closeModal } }, "Close")));
  }

  async function renderLibrary(view) {
    const all = await getAllExercises();
    const bwKg = await getBodyweightKg();
    const workouts = await Storage.getWorkouts();

    // Per-exercise personal stats from completed sessions: how often, how
    // recently, your best, and an estimated-1RM trend for the mini sparkline.
    const exStats = {};
    const doneWorkouts = workouts.filter(w => w.completedAt).sort((a, b) => a.startedAt - b.startedAt);
    for (const w of doneWorkouts) {
      const seen = new Set();
      for (const entry of (w.exercises || [])) {
        const id = entry.exerciseId;
        if (!id) continue;
        let s = exStats[id];
        if (!s) s = exStats[id] = { sessions: 0, lastDate: null, bestWeight: 0, bestE1RM: 0, maxDuration: 0, maxDistance: 0, maxSeconds: 0, series: [] };
        if (!seen.has(id)) { s.sessions++; seen.add(id); }
        s.lastDate = w.date; // chronological → last assignment is the most recent
        let sessionBestE1RM = 0;
        for (const set of (entry.sets || [])) {
          if (!set.done || U.isWarmup(set)) continue;
          if (set.weight != null && set.reps) {
            const e = U.epley(set.weight, set.reps);
            if (e > sessionBestE1RM) sessionBestE1RM = e;
            if (e > s.bestE1RM) s.bestE1RM = e;
            if (set.weight > s.bestWeight) s.bestWeight = set.weight;
          }
          if (set.durationMin > s.maxDuration) s.maxDuration = set.durationMin;
          if (set.distanceKm > s.maxDistance) s.maxDistance = set.distanceKm;
          if (set.seconds > s.maxSeconds) s.maxSeconds = set.seconds;
        }
        if (sessionBestE1RM > 0) s.series.push(Math.round(sessionBestE1RM));
      }
    }
    const daysAgoLabel = (dateIso) => {
      if (!dateIso) return null;
      const d = Math.round((Date.parse(U.todayISO()) - Date.parse(dateIso)) / 86400000);
      if (d <= 0) return "Today";
      if (d === 1) return "Yesterday";
      if (d < 7) return `${d}d ago`;
      if (d < 30) return `${Math.floor(d / 7)}w ago`;
      return `${Math.floor(d / 30)}mo ago`;
    };
    const prLabelFor = (s) => {
      if (!s) return null;
      if (s.bestWeight > 0) return U.formatWeight(s.bestWeight, { space: false, round: true });
      if (s.maxDistance > 0) return U.formatDistance(s.maxDistance).replace(" ", "");
      if (s.maxDuration > 0) return `${Math.round(s.maxDuration)}m`;
      return null;
    };
    let sortMode = "az"; // az | recent | most | untried
    const prTrophy = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 3h12v2h3v3a4 4 0 0 1-4 4h-.4A6 6 0 0 1 13 15.9V18h3v2H8v-2h3v-2.1A6 6 0 0 1 7.4 12H7a4 4 0 0 1-4-4V5h3V3zm0 4H5v1a2 2 0 0 0 1 1.7V7zm12 0v2.7A2 2 0 0 0 19 8V7h-1z"/></svg>';

    // Zone counts + recent-training heat (last 14 days of completed sets)
    const zoneCounts = (window.BodyMap && BodyMap.countByZone)
      ? BodyMap.countByZone(all)
      : {};
    // Also keep category counts for chip badges / fallback
    for (const ex of all) {
      const c = ex.category || "full_body";
      zoneCounts[c] = (zoneCounts[c] || 0); // ensure keys exist; fine counts already set
    }
    // Ensure coarse category counts equal library category sizes
    const catCounts = {};
    for (const ex of all) {
      const c = ex.category || "full_body";
      catCounts[c] = (catCounts[c] || 0) + 1;
    }
    // Overlay coarse counts onto zoneCounts for chip-driven zones
    for (const [c, n] of Object.entries(catCounts)) zoneCounts[c] = n;

    const byId = new Map(all.map(e => [e.id, e]));
    // Two heat models, kept separate on purpose: mixing stretch reps into
    // training heat would make a well-stretched muscle read as "trained hard".
    const hasBodyMap = !!(window.BodyMap && BodyMap.heatFromWorkouts);
    const heat = hasBodyMap
      ? BodyMap.heatFromWorkouts(workouts, byId, 14, { include: (e) => !isMobilityEx(e) })
      : {};
    const stretchHeat = hasBodyMap
      ? BodyMap.heatFromWorkouts(workouts, byId, 14, { include: isMobilityEx })
      : {};
    // "Needs attention" = trained hard but barely stretched. Zones you've
    // hammered and neglected score highest; untrained zones stay cool.
    const attentionHeat = (() => {
      const out = {};
      const zoneIds = Object.keys((window.BodyMap && BodyMap.ZONES) || {});
      for (const id of zoneIds) {
        const trained = heat[id] || 0;              // 0–1, normalised training volume
        const stretched = stretchHeat[id] || 0;     // 0–1, normalised mobility volume
        const score = Math.max(0, trained * (1 - stretched));
        out[id] = score;
        out[id + "_sets"] = stretchHeat[id + "_sets"] || 0;
      }
      return out;
    })();
    let mapMode = "training"; // "training" | "mobility"

    // activeZone: "all" | zone id (chest, quads, lats, …) | coarse category id
    let activeZone = "all";
    let bodyMapApi = null;

    function syncChips() {
      // Chip highlights the parent category when a fine zone is active
      let chipId = "all";
      if (activeZone !== "all") {
        const z = window.BodyMap && BodyMap.ZONES && BodyMap.ZONES[activeZone];
        chipId = z ? z.category : activeZone;
      }
      filterRow.querySelectorAll(".filter-chip").forEach(chip => {
        const id = chip.getAttribute("data-cat");
        chip.classList.toggle("active", id === chipId);
      });
    }

    function setFromMap(sel) {
      if (sel && sel.heatOnly) return; // heat toggle only — no filter change
      activeZone = (sel && sel.zoneId) || "all";
      // Same rule as the retired chips: the figure and the browse tree are one
      // axis, so choosing on the figure clears the tree.
      if (activeZone !== "all" && browsePath) { browsePath = null; renderBrowseBar(); }
      syncChips();
      refresh(true);
    }

    function setFromChip(cat, keepBrowse) {
      activeZone = cat || "all";
      // The other half of the rule in setBrowsePath: these are two views of
      // one axis, so choosing on either clears the other. `keepBrowse` is how
      // setBrowsePath resets the chips without bouncing straight back.
      if (!keepBrowse && cat && cat !== "all" && browsePath) { browsePath = null; renderBrowseBar(); }
      syncChips();
      if (bodyMapApi) bodyMapApi.setActive(activeZone);
      refresh(true);
    }

    // Articles first, library below. The tab is the Learning Centre now: the
    // map and the exercise grid are one section of it rather than the whole
    // thing, and nothing that was here has moved somewhere else.
    view.appendChild(el("h1", { class: "sr-only" }, "Learn"));
    view.appendChild(renderLearnSection());
    view.appendChild(el("div", { class: "learn-divider" },
      el("span", {}, "Exercise library")));

    // Interactive body map (front / back SVG, fine zones + heat)
    if (window.BodyMap && typeof window.BodyMap.create === "function") {
      bodyMapApi = window.BodyMap.create({
        activeZone,
        counts: zoneCounts,
        heat,
        heatEnabled: true,
        onSelect: setFromMap,
        // Default the figure to the profile's sex; an explicit choice wins.
        sex: state.prefs.bodyMapSex || (state.prefs.sex === "female" ? "female" : "male"),
        onSexChange: async (v) => {
          state.prefs.bodyMapSex = v;
          await Storage.setPref("bodyMapSex", v);
        }
      });
      view.appendChild(bodyMapApi.el);

      // Training / Mobility switch — same map, two readings of it.
      const modeCaption = el("div", { class: "map-mode-caption", "data-testid": "map-mode-caption" });
      // Mobility heat is trained × (1 − stretched). With nothing stretched
      // that is trained × 1 — the training map, to the pixel. The switch then
      // does nothing whatsoever while the caption goes on claiming a second
      // reading, and since most people log no stretching at all that is the
      // usual state of this control rather than an edge case. Say it.
      const stretchedZones = Object.keys(stretchHeat)
        .filter(k => !k.endsWith("_sets") && stretchHeat[k] > 0).length;
      const setMapMode = (m) => {
        mapMode = m;
        modeRow.querySelectorAll(".map-mode-btn").forEach(b =>
          b.classList.toggle("active", b.getAttribute("data-mode") === m));
        bodyMapApi.setHeat(m === "mobility" ? attentionHeat : heat);
        const flat = m === "mobility" && !stretchedZones;
        modeCaption.textContent = m !== "mobility"
          ? "Warm = trained most in the last 14 days."
          : (flat
            ? "No mobility work logged in the last 14 days, so nothing is discounted here and this is the same map as Training. Log some stretching and the zones you cover will cool down."
            : "Warm = trained hard but barely stretched — mobility work needed here.");
        modeCaption.classList.toggle("is-flat", flat);
        modeCaption.setAttribute("data-flat", flat ? "1" : "0");
      };
      const modeRow = el("div", { class: "map-mode", "data-testid": "map-mode" },
        el("button", { class: "map-mode-btn active", type: "button", "data-mode": "training", "data-testid": "map-mode-training", on: { click: () => setMapMode("training") } }, "Training"),
        el("button", { class: "map-mode-btn", type: "button", "data-mode": "mobility", "data-testid": "map-mode-mobility", on: { click: () => setMapMode("mobility") } }, "Mobility")
      );
      view.appendChild(modeRow);
      view.appendChild(modeCaption);
      setMapMode("training");
    }

    // Muscle-balance nudge — a neglected major group over the last 14 days.
    (function balanceNudge() {
      const MAJORS = { chest: "Chest", back: "Back", shoulders: "Shoulders", arms: "Arms", legs: "Legs", core: "Core" };
      const cut = new Date(); cut.setDate(cut.getDate() - 14);
      const cutIso = cut.toISOString().slice(0, 10);
      const cnt = {}; for (const k in MAJORS) cnt[k] = 0;
      let total = 0;
      for (const w of doneWorkouts) {
        if (w.date < cutIso) continue;
        for (const entry of (w.exercises || [])) {
          const ex = byId.get(entry.exerciseId); if (!ex || !(ex.category in cnt)) continue;
          const done = U.workingSets(entry.sets).length;
          cnt[ex.category] += done; total += done;
        }
      }
      if (total < 8) return; // not enough recent training to judge fairly
      const ordered = Object.keys(MAJORS).map(k => ({ k, n: cnt[k] })).sort((a, b) => b.n - a.n);
      const top = ordered[0], low = ordered[ordered.length - 1];
      if (!top.n) return;
      if (low.n > 0 && low.n >= top.n * 0.5) return; // reasonably balanced — don't nag
      view.appendChild(el("button", { class: "balance-nudge", type: "button", "data-testid": "balance-nudge", on: { click: () => setFromChip(low.k) } },
        el("span", { class: "balance-ic", html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l3-9 4 18 3-9h4"/></svg>' }),
        el("span", { class: "balance-main" },
          el("span", { class: "balance-title" }, `${MAJORS[low.k]} is quiet this week`),
          el("span", { class: "balance-sub" }, `${MAJORS[top.k]} leads with ${top.n} set${top.n === 1 ? "" : "s"} · ${MAJORS[low.k]} ${low.n === 0 ? "none yet" : low.n + " set" + (low.n === 1 ? "" : "s")}`)),
        el("span", { class: "balance-cta" }, `Show ${MAJORS[low.k]}`)
      ));
    })();

    const controls = el("div", { class: "library-controls" });
    const searchInput = el("input", { class: "input", placeholder: "Search exercises…", id: "lib-search",
      type: "search", "aria-label": "Search the exercise library" });
    controls.appendChild(searchInput);
    view.appendChild(controls);

    // ---- browse by pillar ------------------------------------------------
    // The chips below ask "which body part". This asks "what kind of training",
    // which is the question the chips cannot ask at all: a hamstring stretch is
    // filed under mobility and so never appears under legs, and vice versa.
    //
    // It is a drill-down rather than a fourth row of chips because the page
    // already has three, and the complaint that started this was that there is
    // too much to wade through — adding another row would have been answering
    // it with more of the cause.
    let browsePath = null;   // { pillar, group?, sub? }
    const browseBar = el("div", { class: "browse-bar", "data-testid": "browse-bar" });

    const taxOf = (ex) => ex.taxon || {};
    const inPath = (ex) => {
      if (!browsePath) return true;
      const t = taxOf(ex);
      if (t.pillar !== browsePath.pillar) return false;
      if (browsePath.group && t.group !== browsePath.group) return false;
      if (browsePath.sub && t.sub !== browsePath.sub) return false;
      return true;
    };
    const pathLabel = (p) => [PILLAR_META[p.pillar].label, p.group, p.sub].filter(Boolean).join(" › ");

    function setBrowsePath(p) {
      browsePath = p;
      // Body part and browse group are two views of one axis, so only one can
      // be on. Left composing, "chest" plus "Legs › Squat" is an empty grid
      // and no way to see why.
      if (p && activeZone !== "all") setFromChip("all", true);
      renderBrowseBar();
      refresh(true);
    }

    function renderBrowseBar() {
      clear(browseBar);
      if (!browsePath) {
        browseBar.appendChild(el("button", {
          class: "browse-open", type: "button", "data-testid": "browse-open",
          on: { click: () => openBrowseSheet(all, browsePath, setBrowsePath) }
        },
          el("span", { class: "browse-open-ic", html: BROWSE_ICON }),
          el("span", {}, "Browse by type"),
          el("span", { class: "browse-open-hint" }, "strength · conditioning · mobility")));
        return;
      }
      browseBar.appendChild(el("button", {
        class: "browse-crumb", type: "button", "data-testid": "browse-crumb",
        title: "Change what you are browsing",
        on: { click: () => openBrowseSheet(all, browsePath, setBrowsePath) }
      },
        el("span", { class: "browse-crumb-ic", html: BROWSE_ICON }),
        el("span", { class: "browse-crumb-text" }, pathLabel(browsePath)),
        el("span", { class: "browse-crumb-n" }, String(all.filter(inPath).length))));
      browseBar.appendChild(el("button", {
        class: "browse-clear", type: "button", "data-testid": "browse-clear",
        "aria-label": "Show the whole library again", title: "Show the whole library again",
        html: icons.x, on: { click: () => setBrowsePath(null) }
      }));
    }
    // Browse and Refine are a pair — one narrows by what a thing is, the other
    // by what it needs and how it is trained — so they are one panel with a
    // divider rather than two dashed rows that happen to be stacked. Two
    // identical dashed outlines read as two leftovers.
    const filterPanel = el("div", { class: "libfilters", "data-testid": "library-filters" });
    renderBrowseBar();
    filterPanel.appendChild(browseBar);

    // Body-part chips — the fallback, not a fixture.
    //
    // Retired from the normal page. The figure above does the same job better:
    // both set `activeZone`, and the map can say "lats" where a chip could only
    // say "back". Keeping both meant two controls for one filter and a fourth
    // row to scroll past, which is the thing this rework set out to remove.
    // Cardio and boxing moved to Browse › Conditioning, which covers them
    // exactly; full_body is gone on purpose, since a bucket for everything the
    // body-part axis could not describe is what started all this.
    //
    // But the map is not guaranteed: body-map.js can fail to load, and then
    // the library would have no body-part filter at all. So the row still
    // renders in that case, and only in that case.
    const filterRow = el("div", { class: "filter-row", "data-testid": "cat-chip-row" });
    const canDrawMap = !!(window.BodyMap && typeof window.BodyMap.create === "function");
    if (!canDrawMap) {
      const cats = ["all", ...Object.keys(EXERCISE_CATEGORIES)];
      for (const c of cats) {
        const chip = el("button", {
          class: "filter-chip" + (c === "all" ? " active" : ""),
          "data-cat": c,
          on: { click: () => setFromChip(c) }
        }, c === "all" ? "All" : EXERCISE_CATEGORIES[c]);
        filterRow.appendChild(chip);
      }
      view.appendChild(filterRow);
    }

    // ---- refine: gear and discipline -------------------------------------
    // Both cut across the browse tree rather than sitting inside it, which is
    // the point. A back squat lives at Strength › Legs › Squat and is also
    // half of CrossFit; 26 exercises are used by conditioning workouts while
    // being strength movements. The tree can only give each of them one home,
    // so these two make them findable from the other direction.
    //
    // Behind one line rather than two rows of chips, for the same reason the
    // browse is: the page had four rows and the complaint was that there is
    // too much to wade through.
    let activeDiscipline = null;
    let activeGear = null;
    const refineBar = el("div", { class: "refine-bar", "data-testid": "refine-bar" });
    const discNote = el("div", { class: "disc-note text-xs text-faint", "data-testid": "discipline-note" });
    discNote.style.display = "none";

    const disciplineIds = (id) => {
      const d = (window.DISCIPLINES || []).find((x) => x.id === id);
      return d ? new Set(d.exercises) : null;
    };
    // Only offer kit the library actually has more than a token amount of.
    // A chip that narrows 165 exercises to one is a chip that wastes a tap.
    const gearCounts = {};
    for (const ex of all) for (const g of (ex.gear || [])) {
      if (g !== "none") gearCounts[g] = (gearCounts[g] || 0) + 1;
    }
    const gearOptions = GEAR_ORDER.filter((g) => (gearCounts[g] || 0) >= 3);

    const refineCount = () => (activeDiscipline ? 1 : 0) + (activeGear ? 1 : 0);

    function renderRefineBar() {
      clear(refineBar);
      const n = refineCount();
      refineBar.appendChild(el("button", {
        class: "refine-open" + (n ? " is-on" : ""), type: "button", "data-testid": "refine-open",
        on: { click: openRefineSheet }
      },
        el("span", { class: "refine-ic", html: REFINE_ICON }),
        el("span", {}, "Equipment & discipline"),
        n ? el("span", { class: "refine-n", "data-testid": "refine-count" }, String(n))
          : el("span", { class: "refine-hint" }, `${gearOptions.length} kinds of kit`)));
      if (n) {
        refineBar.appendChild(el("button", {
          class: "browse-clear", type: "button", "data-testid": "refine-clear",
          "aria-label": "Clear equipment and discipline", title: "Clear equipment and discipline",
          html: icons.x,
          on: { click: () => { activeDiscipline = null; activeGear = null; syncDiscNote(); renderRefineBar(); refresh(true); } }
        }));
      }
    }

    function syncDiscNote() {
      const sel = (window.DISCIPLINES || []).find((x) => x.id === activeDiscipline);
      clear(discNote);
      if (sel) {
        discNote.appendChild(el("span", {}, sel.blurb));
        // The honest bit: say what the library does not cover, rather than
        // letting fifteen Hyrox exercises imply Hyrox is fifteen exercises.
        if (sel.missing) discNote.appendChild(el("span", { class: "disc-missing" }, " " + sel.missing));
      }
      discNote.style.display = sel ? "" : "none";
    }

    function openRefineSheet() {
      const body = el("div", { "data-testid": "refine-sheet" });
      const section = (label, hint) => {
        body.appendChild(el("div", { class: "refine-head" },
          el("span", {}, label), hint ? el("span", { class: "refine-head-hint" }, hint) : null));
        const row = el("div", { class: "filter-row refine-row" });
        body.appendChild(row);
        return row;
      };

      const gearRow = section("Equipment", "what you have to hand");
      const paintGear = () => gearRow.querySelectorAll(".filter-chip").forEach((c) => {
        const on = c.getAttribute("data-gear") === (activeGear || "");
        c.classList.toggle("active", on);
        c.setAttribute("aria-pressed", on ? "true" : "false");
      });
      for (const g of gearOptions) {
        gearRow.appendChild(el("button", {
          class: "filter-chip", type: "button", "data-gear": g, "data-testid": "refine-gear-" + g,
          "aria-pressed": "false",
          on: { click: () => {
            activeGear = activeGear === g ? null : g;
            paintGear(); renderRefineBar(); refresh(true);
          } }
        }, `${GEAR_META[g] || g} · ${gearCounts[g]}`));
      }
      paintGear();

      if ((window.DISCIPLINES || []).length) {
        const discRow = section("Discipline", "how it is trained");
        const paintDisc = () => discRow.querySelectorAll(".filter-chip").forEach((c) => {
          const on = c.getAttribute("data-disc") === (activeDiscipline || "");
          c.classList.toggle("active", on);
          c.setAttribute("aria-pressed", on ? "true" : "false");
        });
        for (const d of window.DISCIPLINES) {
          discRow.appendChild(el("button", {
            class: "filter-chip disc-chip", type: "button",
            "data-disc": d.id, "data-testid": "disc-" + d.id, title: d.blurb,
            "aria-pressed": "false",
            on: { click: () => {
              activeDiscipline = activeDiscipline === d.id ? null : d.id;
              paintDisc(); syncDiscNote(); renderRefineBar(); refresh(true);
            } }
          }, `${d.label} · ${d.exercises.length}`));
        }
        paintDisc();
      }

      openModal("Refine", body, el("div", {},
        el("button", {
          class: "btn", "data-testid": "refine-sheet-clear",
          on: { click: () => { activeDiscipline = null; activeGear = null; syncDiscNote(); renderRefineBar(); refresh(true); closeModal(); } }
        }, "Clear"),
        el("button", { class: "btn btn-primary", on: { click: closeModal } }, "Done")), { raised: true });
    }

    renderRefineBar();
    filterPanel.appendChild(refineBar);
    view.appendChild(filterPanel);
    view.appendChild(discNote);

    // Sort control — order the library by your training relationship.
    const SORTS = [
      { id: "az", label: "A–Z" },
      { id: "recent", label: "Recent" },
      { id: "most", label: "Most trained" },
      { id: "untried", label: "Untried" }
    ];
    const sortRow = el("div", { class: "library-sort" });
    for (const s of SORTS) {
      sortRow.appendChild(el("button", {
        class: "sort-chip" + (s.id === sortMode ? " active" : ""), "data-sort": s.id,
        on: { click: () => {
          sortMode = s.id;
          sortRow.querySelectorAll(".sort-chip").forEach(c => c.classList.toggle("active", c.getAttribute("data-sort") === sortMode));
          refresh(true);
        } }
      }, s.label));
    }
    view.appendChild(sortRow);

    // Custom exercise button
    view.appendChild(el("button", { class: "btn btn-block mb-8", on: { click: openCustomExerciseForm } },
      el("span", { html: icons.plus }), "Add custom exercise"
    ));

    const grid = el("div", { class: "exercise-wheel", "data-testid": "exercise-wheel" });
    view.appendChild(grid);

    // Magnify wheel: the card nearest the wheel's centre grows and brightens,
    // neighbours shrink and fade. Runs on scroll (of the wheel and the page).
    function applyMagnify() {
      if (!grid.isConnected) { window.removeEventListener("scroll", scheduleMagnify); return; }
      const rect = grid.getBoundingClientRect();
      if (!rect.height) return;
      const mid = rect.top + rect.height / 2;
      const half = rect.height / 2;
      const cards = grid.querySelectorAll(".exercise-card");
      let closest = null, closestD = Infinity;
      cards.forEach(card => {
        const r = card.getBoundingClientRect();
        const d = Math.abs((r.top + r.height / 2) - mid);
        const t = Math.min(1, d / half);
        card.style.transform = `scale(${(1 - t * 0.17).toFixed(3)})`;
        card.style.opacity = (1 - t * 0.58).toFixed(2);
        if (d < closestD) { closestD = d; closest = card; }
      });
      cards.forEach(c => c.classList.toggle("is-center", c === closest));
      // Spin the wheel and the figure lights up with whatever the centred
      // lift works — primary movers solid, assistance faint.
      if (bodyMapApi && typeof bodyMapApi.setPreview === "function") {
        const id = closest && closest.getAttribute("data-ex-id");
        bodyMapApi.setPreview(id ? (byId.get(id) || null) : null);
      }
    }
    let magRAF = null;
    const scheduleMagnify = () => { if (magRAF) return; magRAF = requestAnimationFrame(() => { magRAF = null; applyMagnify(); }); };
    grid.addEventListener("scroll", scheduleMagnify, { passive: true });
    window.addEventListener("scroll", scheduleMagnify, { passive: true });

    function matchesActiveZone(ex) {
      if (!activeZone || activeZone === "all") return true;
      if (window.BodyMap && typeof BodyMap.exerciseMatchesZone === "function") {
        // Known zone (fine or coarse)
        if (BodyMap.ZONES && BodyMap.ZONES[activeZone]) {
          return BodyMap.exerciseMatchesZone(ex, activeZone);
        }
      }
      // Fallback: plain category chip (cardio / full_body)
      return ex.category === activeZone;
    }

    function refresh(stagger = false) {
      const q = searchInput.value.trim().toLowerCase();
      clear(grid);
      const discSet = activeDiscipline ? disciplineIds(activeDiscipline) : null;
      const filtered = all.filter(ex => {
        if (!inPath(ex)) return false;
        if (!matchesActiveZone(ex)) return false;
        if (discSet && !discSet.has(ex.id)) return false;
        if (activeGear && !(ex.gear || []).includes(activeGear)) return false;
        if (!q) return true;
        return ex.name.toLowerCase().includes(q) ||
               (ex.muscles || []).some(m => m.toLowerCase().includes(q)) ||
               (ex.equipment || "").toLowerCase().includes(q);
      });
      // Sort by the user's training relationship.
      filtered.sort((a, b) => {
        const sa = exStats[a.id], sb = exStats[b.id];
        const na = a.name.localeCompare(b.name);
        if (sortMode === "most") return ((sb?.sessions || 0) - (sa?.sessions || 0)) || na;
        if (sortMode === "recent") return String(sb?.lastDate || "").localeCompare(String(sa?.lastDate || "")) || na;
        if (sortMode === "untried") return (((sa?.sessions || 0) > 0 ? 1 : 0) - ((sb?.sessions || 0) > 0 ? 1 : 0)) || na;
        return na;
      });
      if (filtered.length === 0) {
        grid.appendChild(emptyState({
          title: "No exercises found",
          body: "Try a different search or clear the body zone filter.",
          primaryLabel: "Clear filters",
          onPrimary: () => {
            if (bodyMapApi) bodyMapApi.clear();
            searchInput.value = "";
            // Browsing can empty the grid too — "Squat" plus a search for
            // "curl" is nothing — so clearing has to clear that as well or
            // the button does not do what it says.
            browsePath = null;
            renderBrowseBar();
            refresh(true);
          },
          primaryTestId: "empty-exercises-clear",
          secondaryLabel: "Add custom",
          onSecondary: () => openCustomExerciseForm()
        }));
        return;
      }
      for (const ex of filtered) {
        const st = exStats[ex.id];
        const trained = st && st.sessions > 0;
        // Mobility is timed holds — PRs, strength tiers and e1RM trends are
        // meaningless here, so show best hold and recency instead.
        const isMob = ex.category === "mobility";
        const pr = trained ? (isMob ? (st.maxSeconds ? `${st.maxSeconds}s` : null) : prLabelFor(st)) : null;
        // The name owns the first line and the PR is pinned to its right, out
        // of the name's own wrap. Inside it, at 390px, "Barbell Bench Press"
        // plus a gold chip did not fit, so the chip dropped to a line of its
        // own directly under the name — where it read as a second heading and
        // was the loudest thing on the card.
        const topRow = el("div", { class: "exercise-card-top" },
          el("div", { class: "exercise-card-name" },
            ex.name,
            ex.isCustom ? el("span", { class: "chip chip-accent" }, "Custom") : null
          ),
          pr ? el("span", { class: "ex-pr-chip" + (isMob ? " is-hold" : "") },
                isMob ? null : el("span", { class: "ex-pr-ic", html: prTrophy }), pr) : null
        );
        // What it is, in one truncating line. The body part used to lead this
        // line and the muscle list sat on the line below it, which meant
        // "Chest" and "Lower Pectorals" were the same fact twice. kcal/min came
        // off with it: the detail sheet gives it at three intensities, so the
        // card was carrying a worse copy of a number one tap away, at the same
        // weight as the equipment you actually filter by.
        const meta = [ex.equipment, ...(ex.muscles || [])].filter(Boolean).join(" · ")
          || EXERCISE_CATEGORIES[ex.category];
        // Only for holds. Ten rep-based movements carry perSide too — a pistol
        // squat is unilateral — but nothing else in the app honours it there:
        // logging a pistol set never asks per side. Saying it on the card
        // would be promising a distinction the set logger does not make.
        const perSide = isMob && ex.perSide;
        const lvl = (!isMob && trained && st.bestE1RM) ? strengthLevel(ex, st.bestE1RM, bwKg, state.prefs.sex, U.effectiveAge(state.prefs)) : null;
        // Trained cards add a third line rather than swapping the second one
        // out, so a card gains detail as you train it instead of changing
        // shape — the muscle list used to vanish the moment you logged a set.
        const statRow = trained
          ? el("div", { class: "exercise-card-stat" },
              lvl ? el("span", { class: "ex-tier-dot", style: `--tier:${lvl.color}` }) : null,
              // The band travels with the tier. "Advanced" and "Advanced 60+"
              // are different claims and only one of them is true here.
              lvl ? el("span", { class: "ex-tier-name", style: `color:${lvl.color}` },
                lvl.ageBand ? `${lvl.tier} ${lvl.ageBand}` : lvl.tier) : null,
              // Non-breaking: a plain leading space at the start of an inline
              // element is collapsed away, and "Intermediate· Today" is what
              // that looks like.
              el("span", { class: "ex-stat-when" },
                `${lvl ? " · " : ""}${daysAgoLabel(st.lastDate)} · ${st.sessions} session${st.sessions === 1 ? "" : "s"}`),
              (!isMob && st.series.length >= 2)
                ? el("span", { class: "exercise-card-spark" }, sparkline(st.series, { width: 40, height: 15 }))
                : null)
          : null;
        grid.appendChild(el("div", {
          class: "exercise-card" + (trained ? " is-trained" : ""),
          "data-ex-id": ex.id,
          // A div with a click handler is invisible to keyboards and screen
          // readers; the whole library was mouse/touch-only without this.
          role: "button",
          tabindex: "0",
          "aria-label": ex.name,
          on: {
            click: () => openExerciseDetail(ex.id),
            keydown: (e) => {
              if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openExerciseDetail(ex.id); }
            }
          }
        },
          exerciseFigureIcon(ex.category),
          el("div", { class: "exercise-card-main" },
            topRow,
            // "per side" describes the movement, so it belongs on the line
            // that describes the movement. Next to the name it pushed itself
            // onto a second line on most stretches, since "Cross-Body Shoulder
            // Stretch" plus a chip does not fit 390px.
            el("div", { class: "exercise-card-meta", title: (perSide ? "per side · " : "") + meta },
              perSide ? el("span", { class: "ex-side-chip" }, "per side") : null,
              meta),
            statRow
          )
        ));
      }
      // Centre the first card in the wheel, then apply the magnify pass.
      requestAnimationFrame(() => {
        const first = grid.querySelector(".exercise-card");
        if (first) grid.scrollTop = Math.max(0, first.offsetTop - grid.clientHeight / 2 + first.offsetHeight / 2);
        applyMagnify();
      });
    }
    searchInput.addEventListener("input", U.debounce(() => refresh(false), 150));
    refresh(true);
  }

  /**
   * One line of Variations or Alternatives — a link when the text names an
   * exercise we actually hold, plain text otherwise.
   *
   * The plain ones are the majority and stay plain on purpose. "Landmine
   * press" and "Ring dip" are real movements this library does not stock, and
   * a link is a promise of somewhere to go; sending you to the nearest
   * spelling would be a lie told six times over on the push-up page alone.
   *
   * A string that resolves to the exercise you are already reading is dropped
   * back to plain text too — a list entry that reloads the current page reads
   * as a broken link, which is exactly what it is.
   */
  function relatedItem(text, currentEx) {
    const id = window.ExerciseLinks ? ExerciseLinks.resolve(text) : null;
    const target = id && id !== currentEx.id
      ? (window.EXERCISE_DB || []).find((e) => e.id === id)
      : null;
    if (!target) return el("li", {}, text);
    return el("li", { class: "related-li" },
      el("button", {
        class: "related-link", type: "button",
        "data-testid": "related-link", "data-target": target.id,
        title: `Open ${target.name}`,
        // openExerciseDetail takes an id, not the record. Passing the object
        // finds nothing and silently opens no sheet at all.
        on: { click: () => { closeModal(); openExerciseDetail(target.id); } }
      }, text, el("span", { class: "related-chev", "aria-hidden": "true" }, "\u203a"))
    );
  }

  // ============ Movement ladders ============
  //
  // The Learning Centre has defined "Ladder" since it shipped and nothing
  // implemented it. This is the readout: where your logs put you on a chain,
  // and what the next rung asks for.
  //
  // It reports, it does not gate. Every exercise stays loggable at any time —
  // the ladder just tells you what you have cleared and what is next.

  const ladderStateClass = { cleared: "is-cleared", current: "is-current", blocked: "is-blocked", locked: "is-locked" };

  /** The movements in a complex, in order, each one tappable.
   *
   *  A complex is the one kind of exercise whose name tells you nothing about
   *  what you do — "Bear Complex" is five lifts, and knowing which five is the
   *  whole content. So the sequence sits above Technique, and each step opens
   *  its own page, because "what is a push jerk" is the question someone
   *  reading this actually has.
   *
   *  What is deliberately absent: any claim about the bar staying off the
   *  floor. That is the rule that makes a complex a complex, and it is the one
   *  thing the app cannot see, so the note says so instead of letting a logged
   *  round imply it. */
  function buildComplexSection(ex) {
    const steps = Array.isArray(ex.complex) ? ex.complex : null;
    if (!steps || !steps.length) return null;
    const db = window.EXERCISE_DB || [];
    const wrap = el("div", { class: "detail-section mt-16", "data-testid": "complex-section" });
    wrap.appendChild(el("h3", {}, "The sequence"));

    const list = el("div", { class: "cplx", "data-testid": "complex-list" });
    steps.forEach((st, i) => {
      const def = db.find((e) => e.id === st.exerciseId);
      const name = def ? def.name : st.exerciseId;
      list.appendChild(el("button", {
        class: "cplx-step" + (def ? "" : " is-dead"),
        type: "button", "data-testid": "complex-step", "data-step-id": st.exerciseId,
        disabled: def ? null : "disabled",
        title: def ? `Open ${name}` : "Not in the library",
        on: { click: () => { if (def) { closeModal(); openExerciseDetail(def.id); } } }
      },
        el("span", { class: "cplx-num" }, String(i + 1)),
        el("span", { class: "cplx-name" }, name),
        el("span", { class: "cplx-reps" }, `×${st.reps || 1}`)
      ));
    });
    wrap.appendChild(list);

    if (ex.complexNote) wrap.appendChild(el("div", { class: "cplx-note" }, ex.complexNote));
    wrap.appendChild(el("div", { class: "cplx-caveat", "data-testid": "complex-caveat" },
      "One bar, one load. The app records the weight and the reps — it cannot tell whether you set the bar down, so going unbroken is on you."));
    return wrap;
  }

  async function buildLadderSection(ex) {
    if (!window.Progression || !window.PROGRESSIONS) return null;
    const found = Progression.chainsFor(ex.id);
    if (!found.length) return null;
    const workouts = (await Storage.getWorkouts()).filter((w) => w.completedAt);
    const wrap = el("div", { class: "detail-section mt-16", "data-testid": "ladder-section" });

    for (const { chain } of found) {
      const view = Progression.evaluate(chain, workouts);
      wrap.appendChild(el("div", { class: "ladder-head" },
        el("h3", {}, chain.name),
        el("div", { class: "ladder-sub" }, chain.oneLiner),
        el("div", { class: "ladder-progress", "data-testid": "ladder-progress" }, Progression.summary(view))
      ));

      const list = el("div", { class: "ladder", "data-testid": "ladder" });
      view.rows.forEach((row, i) => {
        const def = (window.EXERCISE_DB || []).find((e) => e.id === row.exerciseId);
        const isThis = row.exerciseId === ex.id;
        const node = el("button", {
          class: "ladder-rung " + ladderStateClass[row.state] + (isThis ? " is-here" : ""),
          type: "button", "data-rung": row.exerciseId, "data-state": row.state,
          "data-testid": "ladder-rung",
          "aria-current": isThis ? "step" : null,
          title: isThis ? "You are looking at this one" : `Open ${def ? def.name : row.exerciseId}`,
          on: { click: () => { if (!isThis && def) { closeModal(); openExerciseDetail(def.id); } } }
        },
          el("span", { class: "ladder-num" }, String(i + 1)),
          el("span", { class: "ladder-main" },
            el("span", { class: "ladder-name" }, def ? def.name : row.exerciseId,
              isThis ? el("span", { class: "ladder-here" }, "you are here") : null),
            el("span", { class: "ladder-gate" }, row.gateText),
            row.state === "blocked"
              ? el("span", { class: "ladder-note" },
                  "Needs " + row.missing.map((id) => {
                    const d = (window.EXERCISE_DB || []).find((e) => e.id === id);
                    return d ? d.name : id;
                  }).join(" and ") + " first")
              : null,
            // Only the rung you are on gets its coaching note and its near-miss
            // line. On every other rung it is noise.
            (row.state === "current" && row.note) ? el("span", { class: "ladder-note" }, row.note) : null,
            (row.state === "current" && row.best)
              ? el("span", { class: "ladder-best" },
                  row.gate.holdSec
                    ? `Best so far: ${row.best.score}s · ${U.formatDate(row.best.date)}`
                    // `count` is how many sets met the gate, which is zero on
                    // a near miss — "0 × 6" is not a thing anyone did. Report
                    // the session as it happened instead.
                    : `Best so far: ${row.best.sets} set${row.best.sets === 1 ? "" : "s"}, best ${row.best.score} reps · ${U.formatDate(row.best.date)}`)
              : null
          ),
          el("span", { class: "ladder-mark", "aria-hidden": "true" },
            row.cleared ? "\u2713" : (row.state === "blocked" ? "\u2013" : ""))
        );
        list.appendChild(node);
      });
      wrap.appendChild(list);
      wrap.appendChild(el("div", { class: "ladder-foot text-xs text-faint" },
        "Rungs clear when a logged session meets the figure beside them. Nothing is locked — you can log any of these whenever you like."));
    }
    return wrap;
  }

  async function openExerciseDetail(exerciseId, fallback = null) {
    const all = await getAllExercises();
    let ex = all.find(e => e.id === exerciseId);
    if (!ex && fallback) {
      ex = {
        id: exerciseId,
        name: fallback.name || "Exercise",
        category: fallback.category || "full_body",
        equipment: fallback.equipment || "—",
        muscles: fallback.muscles || [],
        type: fallback.type || (fallback.isCardio ? "cardio" : "strength")
      };
    }
    if (!ex) {
      toast("Exercise not found in library");
      return;
    }
    const prs = await getPRsFor(exerciseId);
    const history = await getHistoryFor(exerciseId);
    const bwKg = await getBodyweightKg();
    const isCardio = inferExerciseType(ex) === "cardio" || ex.category === "cardio";
    const isMobility = ex.category === "mobility" || inferExerciseType(ex) === "hold";
    const kpmEasy = U.kcalPerMin({ ...ex, category: "cardio", type: "cardio" }, bwKg, "easy");
    const kpmMod = U.kcalPerMin(ex, bwKg, isCardio ? "moderate" : "moderate");
    const kpmHard = U.kcalPerMin({ ...ex, category: "cardio", type: "cardio" }, bwKg, "hard");

    const body = el("div", {},
      el("div", { class: "chip" }, EXERCISE_CATEGORIES[ex.category]),
      el("div", { class: "chip" }, ex.equipment || "—"),
      (ex.muscles || []).map(m => el("div", { class: "chip" }, m)),
      // Approx calories — skipped for mobility, where burn is negligible and
      // the point is time under stretch, not energy cost.
      isMobility ? null : el("div", { class: "card mt-16" },
        el("div", { class: "card-title", style: "margin-bottom: 8px" }, "Approx. calories burned"),
        el("div", { class: "stat-row" },
          isCardio ? el("div", { class: "stat" },
            el("div", { class: "stat-label" }, "Easy"),
            el("div", { class: "stat-value" }, `${kpmEasy}`),
            el("div", { class: "text-xs text-faint" }, "kcal/min")
          ) : null,
          el("div", { class: "stat" },
            el("div", { class: "stat-label" }, isCardio ? "Moderate" : "Estimate"),
            el("div", { class: "stat-value" }, `${kpmMod}`),
            el("div", { class: "text-xs text-faint" }, "kcal/min")
          ),
          isCardio ? el("div", { class: "stat" },
            el("div", { class: "stat-label" }, "Hard"),
            el("div", { class: "stat-value" }, `${kpmHard}`),
            el("div", { class: "text-xs text-faint" }, "kcal/min")
          ) : null
        ),
        el("div", { class: "text-xs text-faint mt-8" },
          `Based on MET ${U.baseMET(ex)} at your bodyweight (${bwKg}kg). Estimates only — actual burn varies.`)
      ),
      // PRs
      isCardio
        ? ((prs.maxDuration || prs.maxDistance) ? el("div", { class: "card mt-16", style: "background: var(--pr-gold-soft); border-color: color-mix(in srgb, var(--pr-gold) 30%, transparent);" },
            el("div", { class: "card-title", style: "color: var(--pr-gold); margin-bottom: 8px" }, "🏆 Personal records"),
            el("div", { class: "stat-row" },
              el("div", { class: "stat" },
                el("div", { class: "stat-label" }, "Longest"),
                el("div", { class: "stat-value" }, prs.maxDuration ? `${prs.maxDuration} min` : "—")
              ),
              el("div", { class: "stat" },
                el("div", { class: "stat-label" }, "Distance"),
                el("div", { class: "stat-value" }, prs.maxDistance ? U.formatDistance(prs.maxDistance) : "—")
              ),
              el("div", { class: "stat" },
                el("div", { class: "stat-label" }, "Best burn"),
                el("div", { class: "stat-value" }, prs.maxKcal ? `${prs.maxKcal}` : "—")
              )
            )
          ) : null)
        : ((prs.maxWeight || prs.maxE1RM) ? el("div", { class: "card mt-16", style: "background: var(--pr-gold-soft); border-color: color-mix(in srgb, var(--pr-gold) 30%, transparent);" },
            el("div", { class: "card-title", style: "color: var(--pr-gold); margin-bottom: 8px" }, "🏆 Personal records"),
            el("div", { class: "stat-row" },
              el("div", { class: "stat" },
                el("div", { class: "stat-label" }, "Max weight"),
                el("div", { class: "stat-value" }, prs.maxWeight ? U.formatWeight(prs.maxWeight, { space: false }) : "—")
              ),
              el("div", { class: "stat" },
                el("div", { class: "stat-label" }, "e1RM"),
                el("div", { class: "stat-value" }, prs.maxE1RM ? U.formatWeight(prs.maxE1RM, { space: false }) : "—")
              ),
              el("div", { class: "stat" },
                el("div", { class: "stat-label" }, "Max reps"),
                el("div", { class: "stat-value" }, prs.maxReps ? String(prs.maxReps) : "—")
              )
            )
          ) : null),
      // Mobility — best hold and total time under stretch (no PRs/strength tiers).
      (ex.category === "mobility" && prs.maxSeconds) ? el("div", { class: "card mt-16" },
        el("div", { class: "card-title", style: "margin-bottom: 8px" }, "Your mobility work"),
        el("div", { class: "stat-row" },
          el("div", { class: "stat" },
            el("div", { class: "stat-label" }, "Best hold"),
            el("div", { class: "stat-value" }, `${prs.maxSeconds}s`),
            ex.perSide ? el("div", { class: "text-xs text-faint" }, "each side") : null
          ),
          el("div", { class: "stat" },
            el("div", { class: "stat-label" }, "Total time"),
            el("div", { class: "stat-value" }, prs.totalHoldSec >= 60 ? `${Math.round(prs.totalHoldSec / 60)}m` : `${prs.totalHoldSec}s`)
          ),
          el("div", { class: "stat" },
            el("div", { class: "stat-label" }, "Sessions"),
            el("div", { class: "stat-value" }, String(history.length))
          )
        )
      ) : null,
      // Strength level — gamified tier from e1RM vs bodyweight
      (!isCardio && prs.maxE1RM && bwKg) ? (() => {
        const lvl = strengthLevel(ex, prs.maxE1RM, bwKg, state.prefs.sex, U.effectiveAge(state.prefs));
        if (!lvl) return null;
        return el("div", { class: "card mt-16 strength-card" },
          el("div", { class: "row-between", style: "align-items: flex-start; margin-bottom: 12px" },
            el("div", {},
              el("div", { class: "card-title", style: "margin: 0 0 2px" }, "Strength level"),
              el("div", { class: "text-xs text-faint" }, `e1RM ${U.formatWeight(prs.maxE1RM, { space: false })} · ${lvl.ratio.toFixed(2)}× bodyweight`)),
            el("div", { class: "strength-badge", style: `--tier:${lvl.color}` },
              lvl.ageBand ? `${lvl.tier} ${lvl.ageBand}` : lvl.tier)),
          el("div", { class: "tier-ladder" },
            ...STRENGTH_TIERS.map((t, i) => el("div", { class: "tier-step" + (i <= lvl.tierIndex ? " on" : ""), style: `--tier:${lvl.color}`, title: t }))),
          lvl.nextTier
            ? el("div", { style: "margin-top: 10px" },
                el("div", { class: "strength-progress" }, el("i", { style: `width:${lvl.pctToNext}%; background:${lvl.color}` })),
                el("div", { class: "text-xs text-muted", style: "margin-top: 6px" }, `${lvl.pctToNext}% to ${lvl.nextTier} · reach ${U.formatWeight(lvl.nextAt, { space: false })} e1RM`))
            : el("div", { class: "text-sm", style: `color:${lvl.color}; margin-top: 10px; font-weight: 700` }, "Top tier — Elite 💪"),
          // Room here to say what the badge can only gesture at.
          el("div", { class: "text-xs text-faint", style: "margin-top: 10px" },
            "A rough guide from bodyweight ratios — real standards vary by lift and person."
            + (lvl.ageBand
                ? ` Graded against the ${lvl.ageBand} bracket, so these are lower than the open thresholds.`
                : ""))
        );
      })() : null,
      // Strength trend — e1RM over sessions
      (!isCardio) ? (() => {
        const asc = history.slice().sort((a, b) => a.date.localeCompare(b.date));
        const series = [];
        for (const h of asc) {
          let best = 0;
          for (const s of h.sets) { if (s.weight != null && s.reps) { const e = U.epley(s.weight, s.reps); if (e > best) best = e; } }
          if (best > 0) series.push(Math.round(best));
        }
        if (series.length < 2) return null;
        const first = series[0], last = series[series.length - 1];
        const pct = first > 0 ? Math.round(((last - first) / first) * 100) : 0;
        const up = last >= first;
        return el("div", { class: "card mt-16" },
          el("div", { class: "row-between", style: "margin-bottom: 8px" },
            el("div", { class: "card-title", style: "margin: 0" }, "Strength trend"),
            el("div", { class: "text-sm", style: `color:${up ? "var(--accent)" : "#e0913f"}; font-weight: 700` }, `${up ? "▲" : "▼"} ${Math.abs(pct)}% · ${series.length} sessions`)),
          sparkline(series, { width: 300, height: 56 }),
          el("div", { class: "text-xs text-faint", style: "margin-top: 6px" }, `Estimated 1RM per session (Epley). ${U.formatWeight(first, { space: false })} → ${U.formatWeight(last, { space: false })}.`)
        );
      })() : null,
      // 1RM projections — strength only
      (!isCardio && prs.maxE1RM) ? el("div", { class: "detail-section mt-16" },
        el("h3", {}, "1RM projections"),
        el("p", { class: "text-sm text-muted", style: "margin-bottom: 8px" }, `Based on your best set. Epley formula, rounded to 0.5kg.`),
        el("div", { class: "rm-grid" },
          ...[1,2,3,5,8,10,12].map(r => {
            const w = prs.maxE1RM / (1 + r / 30);
            const rounded = Math.round(w * 2) / 2;
            return el("div", { class: "rm-cell" },
              el("div", { class: "rm-reps" }, `${r} rep${r === 1 ? "" : "s"}`),
              el("div", { class: "rm-weight" }, U.formatWeight(rounded, { space: false }))
            );
          })
        )
      ) : null,
      // Watch — always offered. A curated clip when one has been picked for
      // this movement, otherwise a search, which cannot 404 the way a fixed
      // video id can once an upload is pulled.
      (() => {
        const v = learnDemoUrl(ex);
        return el("div", { class: "detail-section mt-16" },
          el("a", {
            class: "btn btn-block watch-btn", href: v.url, target: "_blank", rel: "noopener noreferrer",
            "data-testid": "watch-form", "data-curated": v.curated ? "1" : "0"
          },
            el("span", { html: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18 4.8 12 4.8 12 4.8s-6 0-7.7.5a2.7 2.7 0 0 0-1.9 1.9A28 28 0 0 0 1.9 12a28 28 0 0 0 .5 4.8 2.7 2.7 0 0 0 1.9 1.9c1.7.5 7.7.5 7.7.5s6 0 7.7-.5a2.7 2.7 0 0 0 1.9-1.9 28 28 0 0 0 .5-4.8 28 28 0 0 0-.5-4.8zM10 15.2V8.8l5.2 3.2z"/></svg>' }),
            v.curated ? "Watch the form" : "Find a form video"),
          el("div", { class: "watch-note" },
            v.curated ? v.label : "Opens a YouTube search — no clip has been picked for this one yet.")
        );
      })(),
      // Where this movement sits on its ladder, and what the next rung asks
      // for. Above Technique because "am I ready for this" comes before "how
      // do I do it" for anything on a chain.
      await buildLadderSection(ex),
      // What a complex actually consists of. Above Technique for the same
      // reason the ladder is: you cannot follow the cues for "Bear Complex"
      // without first knowing it is five lifts.
      buildComplexSection(ex),
      // Technique
      ex.technique?.length ? el("div", { class: "detail-section mt-16" },
        el("h3", {}, "Technique"),
        el("ol", { class: "detail-list numbered" }, ex.technique.map(t => el("li", {}, t)))
      ) : null,
      // Mistakes
      ex.mistakes?.length ? el("div", { class: "detail-section" },
        el("h3", {}, "Common mistakes"),
        el("ul", { class: "detail-list warn" }, ex.mistakes.map(m => el("li", {}, m)))
      ) : null,
      // Variations
      ex.variations?.length ? el("div", { class: "detail-section" },
        el("h3", {}, "Variations"),
        el("ul", { class: "detail-list bullet" }, ex.variations.map(v => relatedItem(v, ex)))
      ) : null,
      // Alternatives
      ex.alternatives?.length ? el("div", { class: "detail-section" },
        el("h3", {}, "Alternatives"),
        el("ul", { class: "detail-list bullet" }, ex.alternatives.map(a => relatedItem(a, ex)))
      ) : null,
      // Recent history
      history.length ? el("div", { class: "detail-section" },
        el("h3", {}, "Recent history"),
        ...history.slice(0, 5).map(h => el("div", { class: "history-item", style: "cursor:default" },
          el("div", { class: "history-item-date" }, U.formatDate(h.date, { year: "numeric" })),
          el("div", { class: "history-item-summary" }, h.sets.map(s => {
            if (s.durationMin != null) {
              const dist = s.distanceKm ? ` · ${U.formatDistance(s.distanceKm).replace(" ", "")}` : "";
              const kcal = s.kcal ? ` · ${s.kcal} kcal` : "";
              return `${s.durationMin} min · ${U.intensityLabel(s.intensity)}${dist}${kcal}`;
            }
            if (!s.weight && s.reps) return `${s.reps} reps`;
            return `${U.formatWeight(s.weight, { space: false })} × ${s.reps}`;
          }).join(" · "))
        ))
      ) : null
    );

    const footer = state.activeWorkout ? el("div", {},
      el("button", { class: "btn btn-primary", on: { click: async () => {
        state.activeWorkout.exercises.push(await buildExerciseEntry(ex.id, ex.name));
        await Storage.saveWorkout(state.activeWorkout);
        closeModal();
        state.tab = "workout";
        renderMain();
      } } }, "Add to workout")
    ) : null;

    openModal(ex.name, body, footer);
  }

  // onCreated(ex): optional. When provided (e.g. from the workout exercise
  // picker), it fires with the saved exercise so the caller can immediately
  // select it. Otherwise the library view is just re-rendered.
  function openCustomExerciseForm(onCreated = null) {
    const nameI = el("input", { class: "input", placeholder: "Exercise name" });
    const catS = el("select", { class: "select" },
      ...Object.entries(EXERCISE_CATEGORIES).map(([k, v]) => el("option", { value: k }, v))
    );
    const equipI = el("input", { class: "input", placeholder: "Equipment (optional)" });
    const musclesI = el("input", { class: "input", placeholder: "Muscles worked, comma-separated" });
    const metI = el("input", { class: "input input-num", type: "number", step: "0.1", placeholder: "Auto from category" });
    const notesI = el("textarea", { class: "textarea", rows: "3", placeholder: "Notes / technique (optional)" });

    // How is it logged?
    const logS = el("select", { class: "select" },
      el("option", { value: "auto" }, "Auto-detect"),
      el("option", { value: "weighted" }, "Weight × reps"),
      el("option", { value: "bodyweight" }, "Reps only (bodyweight)"),
      el("option", { value: "weighted_bodyweight" }, "Bodyweight + added weight"),
      el("option", { value: "cardio" }, "Time / distance (cardio)"),
      el("option", { value: "custom" }, "Custom metric…")
    );

    // Custom-metric fields (shown only when logType = custom)
    const metricLabelI = el("input", { class: "input", placeholder: "e.g. Skips, Metres, Hold" });
    const metricUnitI = el("input", { class: "input", placeholder: "e.g. reps, m, sec (optional)" });
    const betterS = el("select", { class: "select" },
      el("option", { value: "higher" }, "Higher is better (more = PR)"),
      el("option", { value: "lower" }, "Lower is better (less = PR, e.g. time)")
    );
    const metricWrap = el("div", { style: "display:none" },
      el("div", { class: "form-row" },
        el("div", { style: "flex:1" }, el("label", { class: "label" }, "Metric name"), metricLabelI),
        el("div", { style: "flex:1" }, el("label", { class: "label" }, "Unit"), metricUnitI)
      ),
      el("div", { class: "form-row" }, el("div", { style: "flex:1" }, el("label", { class: "label" }, "Personal best"), wheelizeSelect(betterS, { title: "Personal best" }))),
      el("div", { class: "text-xs text-faint", style: "margin-top:-4px;margin-bottom:8px" },
        "Log one number per set for this metric (e.g. skips, metres, seconds held, watts).")
    );
    logS.addEventListener("change", () => {
      metricWrap.style.display = logS.value === "custom" ? "" : "none";
    });

    const body = el("div", {},
      el("div", { class: "form-row" }, el("div", { style: "flex:1" }, el("label", { class: "label" }, "Name"), nameI)),
      el("div", { class: "form-row" },
        el("div", { style: "flex:1" }, el("label", { class: "label" }, "Category"), wheelizeSelect(catS, { title: "Category" })),
        el("div", { style: "flex:1" }, el("label", { class: "label" }, "Equipment"), equipI)
      ),
      el("div", { class: "form-row" }, el("div", { style: "flex:1" }, el("label", { class: "label" }, "How it's logged"), wheelizeSelect(logS, { title: "How it's logged" }))),
      metricWrap,
      el("div", { class: "form-row" },
        el("div", { style: "flex:1" }, el("label", { class: "label" }, "Muscles"), musclesI),
        el("div", { style: "flex:1" }, el("label", { class: "label" }, "MET (optional)"), metI)
      ),
      el("div", { class: "text-xs text-faint", style: "margin-top:-4px;margin-bottom:8px" },
        "MET is used for calorie estimates. Cardio ≈ 7–11, strength ≈ 3.5–6. Leave blank to use the category default."),
      el("div", { class: "form-row" }, el("div", { style: "flex:1" }, el("label", { class: "label" }, "Notes"), notesI))
    );

    const footer = el("div", {},
      el("button", { class: "btn", on: { click: closeModal } }, "Cancel"),
      el("button", { class: "btn btn-primary", on: { click: async () => {
        if (!nameI.value.trim()) return toast("Please give the exercise a name");
        const logType = logS.value;
        if (logType === "custom" && !metricLabelI.value.trim()) {
          return toast("Name the metric (e.g. Skips, Metres)");
        }
        const metVal = parseFloat(metI.value);
        const ex = {
          id: "custom-" + U.uid(),
          name: nameI.value.trim(),
          category: catS.value,
          equipment: equipI.value.trim() || "Custom",
          muscles: musclesI.value.split(",").map(s => s.trim()).filter(Boolean),
          technique: notesI.value.trim() ? notesI.value.split("\n").map(s => s.trim()).filter(Boolean) : [],
          mistakes: [], variations: [], alternatives: [],
          met: (!isNaN(metVal) && metVal > 0) ? metVal : (U.MET_BY_CATEGORY[catS.value] || 5)
        };
        if (logType === "custom") {
          ex.type = "custom";
          ex.metric = normalizeMetric({
            label: metricLabelI.value,
            unit: metricUnitI.value,
            higherIsBetter: betterS.value !== "lower"
          });
        } else if (logType !== "auto") {
          ex.type = logType;
        }
        await Storage.saveCustomExercise(ex);
        closeModal();
        toast("Custom exercise saved");
        if (onCreated) onCreated(ex);
        else renderMain();
      } } }, "Save exercise")
    );

    openModal("New custom exercise", body, footer);
  }

  /** Build the search + category-filter + exercise-grid UI. Reused by the
      "Add exercise" modal and the inline start-a-workout screen.
      onPick(id, name) fires when a card is tapped. Returns { body, refresh, focus }. */
  // Category tile visual: a custom PNG asset (icons/categories/<cat>.png) if one
  // exists, otherwise fall back to the built-in line icon. Missing files 404 →
  // onerror swaps in the SVG, so nothing looks broken while assets are added.
  function categoryIconNode(cat) {
    const span = el("span", { class: "xcat-glyph" });
    const img = el("img", { class: "xcat-img", alt: "", src: `./icons/categories/${cat}.png` });
    img.addEventListener("error", () => { span.innerHTML = categoryGlyphHTML(cat); }, { once: true });
    span.appendChild(img);
    return span;
  }

  // Clean line icon per muscle group — a recognizable gym symbol, static (fallback).
  function categoryGlyphHTML(cat) {
    const svg = (paths) => `<svg class="xcat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
    switch (cat) {
      case "chest": // bench press — barbell over a bench
        return svg(`<line x1="4" y1="7" x2="20" y2="7"/><line x1="7" y1="4.5" x2="7" y2="9.5"/><line x1="17" y1="4.5" x2="17" y2="9.5"/><line x1="6" y1="14" x2="18" y2="14"/><line x1="8" y1="14" x2="8" y2="19"/><line x1="16" y1="14" x2="16" y2="19"/>`);
      case "back": // pull-up bar with hanging handles
        return svg(`<line x1="3" y1="5" x2="21" y2="5"/><line x1="8" y1="5" x2="8" y2="12.5"/><line x1="16" y1="5" x2="16" y2="12.5"/><line x1="6.5" y1="13" x2="9.5" y2="13"/><line x1="14.5" y1="13" x2="17.5" y2="13"/>`);
      case "shoulders": // overhead press — barbell pushed up
        return svg(`<line x1="5" y1="6" x2="19" y2="6"/><line x1="8" y1="3.5" x2="8" y2="8.5"/><line x1="16" y1="3.5" x2="16" y2="8.5"/><polyline points="8.5 15 12 11.5 15.5 15"/><line x1="12" y1="11.5" x2="12" y2="20"/>`);
      case "arms": // dumbbell
        return svg(`<line x1="3.5" y1="12" x2="20.5" y2="12"/><line x1="6.5" y1="8" x2="6.5" y2="16"/><line x1="3.8" y1="9.5" x2="3.8" y2="14.5"/><line x1="17.5" y1="8" x2="17.5" y2="16"/><line x1="20.2" y1="9.5" x2="20.2" y2="14.5"/>`);
      case "legs": // two legs with feet under a hip bar
        return svg(`<line x1="6" y1="4.5" x2="18" y2="4.5"/><line x1="9" y1="4.5" x2="9" y2="17"/><line x1="15" y1="4.5" x2="15" y2="17"/><line x1="9" y1="17.5" x2="6" y2="17.5"/><line x1="15" y1="17.5" x2="18" y2="17.5"/>`);
      case "core": // torso with ab divisions
        return svg(`<rect x="7" y="4" width="10" height="16" rx="4"/><line x1="7.5" y1="10" x2="16.5" y2="10"/><line x1="7.5" y1="14" x2="16.5" y2="14"/><line x1="12" y1="5" x2="12" y2="19"/>`);
      case "cardio": // heart with a pulse line
        return svg(`<path d="M12 20s-6.5-4.2-6.5-9.2A3.7 3.7 0 0 1 12 8a3.7 3.7 0 0 1 6.5 2.8C18.5 15.8 12 20 12 20z"/><polyline points="6 12.2 9 12.2 10.6 9.6 12.4 14.6 14 12.2 18 12.2"/>`);
      case "full_body": // standing figure
        return svg(`<circle cx="12" cy="5" r="2.1"/><line x1="12" y1="7.5" x2="12" y2="14.5"/><line x1="12" y1="10" x2="8" y2="12.5"/><line x1="12" y1="10" x2="16" y2="12.5"/><line x1="12" y1="14.5" x2="9" y2="20"/><line x1="12" y1="14.5" x2="15" y2="20"/>`);
      default: // all — grid
        return svg(`<rect x="3.5" y="3.5" width="7.5" height="7.5" rx="2"/><rect x="13" y="3.5" width="7.5" height="7.5" rx="2"/><rect x="3.5" y="13" width="7.5" height="7.5" rx="2"/><rect x="13" y="13" width="7.5" height="7.5" rx="2"/>`);
    }
  }

  // Small per-category figure icon for exercise rows: a simple body silhouette
  // with the worked region highlighted in accent. Lightweight (inline SVG) so
  // it scales to long lists.
  function exerciseFigureIcon(category) {
    return el("span", { class: "xrow-fig", html: exerciseFigureSvg(category) });
  }

  function exerciseFigureSvg(category) {
    const accent = ({
      chest: ["torsoU"],
      back: ["torsoU"],
      shoulders: ["sh"],
      arms: ["armL", "armR"],
      legs: ["legL", "legR"],
      core: ["torsoL"],
      full_body: ["torsoU", "torsoL", "armL", "armR", "legL", "legR"],
      cardio: ["torsoU", "torsoL", "legL", "legR"],
      // Punching is shoulders and arms driven from the legs through the trunk.
      boxing: ["sh", "armL", "armR", "torsoU", "legL", "legR"]
    })[category] || ["torsoU"];
    const on = (id) => accent.includes(id) ? " xfig-on" : "";
    // A body rather than a diagram. The old figure read as a stickman for two
    // reasons, and neither was the torso: the arms floated clear of the
    // shoulders so the outline was never continuous, and every part was a
    // uniform-width block so nothing tapered.
    //
    // Same viewBox and the same region ids, so the accent map above, .xfig-base
    // and .xfig-on all keep working untouched. Eight parts become nine — the
    // extra one is the neck, which is what closes the head-to-shoulders gap.
    // Limbs are drawn after the trunk so an accented arm sits over it.
    const svg =
      '<svg viewBox="0 0 44 44" class="xfig-svg" aria-hidden="true">' +
      '<circle class="xfig-base" cx="22" cy="6.8" r="4.2"/>' +
      '<rect class="xfig-base" x="20.4" y="9.6" width="3.2" height="3.4" rx="1.4"/>' +
      '<rect class="xfig-base' + on("sh") + '" x="11" y="12.2" width="22" height="5.4" rx="2.7"/>' +
      '<path class="xfig-base' + on("torsoU") + '" d="M13.8 16.2 H30.2 L28.6 23.4 H15.4 Z"/>' +
      '<path class="xfig-base' + on("torsoL") + '" d="M15.4 23.2 H28.6 L27.8 28.8 H16.2 Z"/>' +
      '<rect class="xfig-base' + on("armL") + '" x="8.6" y="13.4" width="4.2" height="15.4" rx="2.1" transform="rotate(7 10.7 21.1)"/>' +
      '<rect class="xfig-base' + on("armR") + '" x="31.2" y="13.4" width="4.2" height="15.4" rx="2.1" transform="rotate(-7 33.3 21.1)"/>' +
      '<rect class="xfig-base' + on("legL") + '" x="16.1" y="27.9" width="5" height="14.3" rx="2.5" transform="rotate(2 18.6 35)"/>' +
      '<rect class="xfig-base' + on("legR") + '" x="22.9" y="27.9" width="5" height="14.3" rx="2.5" transform="rotate(-2 25.4 35)"/>' +
      '</svg>';
    return svg;
  }

  // The dial's spokes. Six body parts people actually think in, and a spoke
  // for everything that is not one. Mobility, cardio and boxing are not body
  // parts, and putting all nine on one wheel is past the number a radial can
  // label without the words fighting each other.
  const DIAL_PRIMARY = ["chest", "back", "shoulders", "arms", "legs", "core"];

  // Multi-select exercise picker: chip filters + a grouped, scrollable list of
  // exercise cards. Tap cards to add/remove; a sticky CTA confirms the batch.
  // Reused by the start-a-workout screen, the in-workout "Add exercise" modal,
  // and the template builder.
  //   opts.onConfirm(items)   items: [{id, name}] — the batch the user chose
  //   opts.confirmLabel(n)    CTA label for n selected
  //   opts.header             { eyebrow, title, subtitle } optional big header
  //   opts.allowCustom        show the "Add custom exercise" affordance (default true)
  //   opts.customImmediate    if true, creating a custom exercise confirms it at
  //                           once (modal contexts); otherwise it joins selection
  //   opts.existingIds        Set of ids already in the workout/template (shown "Added")
  function buildExercisePickerUI(all, opts = {}) {
    const {
      onConfirm = () => {},
      confirmLabel = (n) => `Add ${n}`,
      header = null,
      allowCustom = true,
      customImmediate = false,
      wheel: isWheel = false,
      dial: useDial = false
    } = opts;
    const existing = opts.existingIds instanceof Set ? opts.existingIds : new Set(opts.existingIds || []);
    const selected = new Map(); // id -> { id, name }

    const searchI = el("input", { class: "input", placeholder: "Search exercises…",
      type: "search", "aria-label": "Search exercises to add" });
    // Body-map figure that lights up the active category's muscle group.
    const catFigure = el("div", { class: "xpick-figure", "data-testid": "xpick-figure" });
    function updateFigure() {
      clear(catFigure);
      if (activeCat) catFigure.appendChild(exerciseFigureIcon(activeCat));
    }
    const chipRow = el("div", { class: "xpick-chips", "data-testid": "xpick-chips" });
    const dotsRow = el("div", { class: "xpick-dots", "data-testid": "xpick-dots" });
    const content = el("div", { class: "xpick-content" });
    const cta = el("button", { class: "btn btn-primary btn-block xpick-cta-btn", type: "button", "data-testid": "xpick-cta" });
    const footer = el("div", { class: "xpick-cta", style: "display:none" }, cta);

    const catLabel = (c) => EXERCISE_CATEGORIES[c] || c;
    const countFor = (c) => all.filter(e => e.category === c).length;
    // One card per category that actually has exercises (custom ones included).
    const known = Object.keys(EXERCISE_CATEGORIES).filter(c => countFor(c) > 0);
    const extra = [...new Set(all.map(e => e.category).filter(c => c && !EXERCISE_CATEGORIES[c]))]
      .filter(c => countFor(c) > 0);
    const cats = [...known, ...extra];
    let activeCat = cats[0] || null;
    let pager = null; // the horizontal scroll-snap container (null while searching)
    let gearFilter = null; // null = show everything
    let tuckEl = null;     // the collapsible navigation block (dial pickers only)

    // ---- the body-part dial ----------------------------------------------
    // Choosing what to train is a two-level tree — body part, then movement —
    // and the first level is the one people already hold in their heads
    // spatially. A dial makes it a direction instead of a target in a list.
    //
    // Only the first level. `legs` alone has 19 exercises and a radial tops
    // out around eight before the labels start covering each other, so the
    // second level stays the wheel it already was.
    const dialBtn = useDial ? el("button", {
      class: "xdial", type: "button", "data-testid": "xpick-dial",
      "aria-label": "Choose a body part"
    }) : null;

    let dialLevel = 0; // 0 = body parts, 1 = everything that is not one
    function dialItems() {
      const spoke = (c) => ({
        key: `cat-${c}`, label: catLabel(c), icon: exerciseFigureSvg(c),
        onPick: () => { dialLevel = 0; scrollToCat(c); }
      });
      const primary = DIAL_PRIMARY.filter(c => cats.includes(c));
      const rest = cats.filter(c => !DIAL_PRIMARY.includes(c));
      if (dialLevel === 1) {
        return [...rest.map(spoke), {
          key: "cat-back", label: "Back", icon: icons.chevronLeft || icons.close || "←",
          keepOpen: true, onPick: () => { dialLevel = 0; }
        }];
      }
      if (!rest.length) return primary.map(spoke);
      return [...primary.map(spoke), {
        key: "cat-more", label: "More", icon: icons.dots || icons.plus,
        // A second dial rather than nine crowded spokes on the first. keepOpen
        // makes it a change of level inside the menu that is already up, not a
        // close and a reopen — see relayout().
        keepOpen: true, onPick: () => { dialLevel = 1; }
      }];
    }

    function renderDial() {
      if (!dialBtn) return;
      clear(dialBtn);
      const c = activeCat;
      const n = all.filter(e => e.category === c && matchesGear(e)).length;
      dialBtn.appendChild(el("span", { class: "xdial-fig", html: exerciseFigureSvg(c) }));
      dialBtn.appendChild(el("span", { class: "xdial-text" },
        el("span", { class: "xdial-label", "data-testid": "xdial-label" }, catLabel(c) || "Choose"),
        el("span", { class: "xdial-sub" }, `${n} exercise${n === 1 ? "" : "s"} · press to change`)
      ));
      dialBtn.appendChild(el("span", { class: "xdial-caret" }, "▾"));
    }
    const dialCtl = dialBtn ? attachRadial(dialBtn, {
      // The menu that made the ring worth building: seven spokes, and its own
      // label already says what belongs in the middle.
      press: true, label: "Choose a body part", ring: true, centre: "Choose",
      sweep: 78, compact: true,
      items: () => dialItems()
    }) : null;

    // "Create your own" lived in the chip row, which phones no longer show.
    // Beside the dial it costs no height at all.
    const customBtn = (useDial && allowCustom) ? el("button", {
      class: "xdial-custom", type: "button", "data-testid": "xchip-custom",
      title: "Create a custom exercise", "aria-label": "Create a custom exercise",
      html: icons.plus,
      on: { click: () => openCustomExerciseForm(onCustomCreated) }
    }) : null;
    const dialRow = dialBtn ? el("div", { class: "xdial-row" }, dialBtn, customBtn) : null;

    // ---- tucking ----------------------------------------------------------
    // Scrolling the list collapses the navigation above it; scrolling back up
    // brings it straight back.
    let tucked = false, tuckLock = 0;
    function setTuck(on) {
      if (!tuckEl || on === tucked || Date.now() < tuckLock) return;
      tucked = on;
      tuckEl.classList.toggle("is-tucked", on);
      // Collapsing changes the list's height, which fires another scroll event
      // — with the opposite sign, because the browser clamps scrollTop. Without
      // a settling window the row oscillates under your thumb.
      tuckLock = Date.now() + 320;
    }
    function watchTuck(list) {
      if (!useDial) return;
      let lastTop = 0;
      list.addEventListener("scroll", () => {
        const t = list.scrollTop;
        // Back at the top there is nothing to make room for.
        if (t <= 4) { lastTop = t; setTuck(false); return; }
        const d = t - lastTop;
        if (Math.abs(d) < 8) return;   // jitter, not a decision
        lastTop = t;
        if (d > 0 && t > 56) setTuck(true);
        else if (d < 0) setTuck(false);
      }, { passive: true });
    }

    // ---- kit filter -------------------------------------------------------
    // Derived from the whole library rather than the open category, so the row
    // does not reshuffle under your thumb every time you swipe a card.
    const gearsPresent = GEAR_ORDER.filter(g => all.some(e => (e.gear || []).includes(g)));
    const hasBodyweight = all.some(e => !(e.gear || []).length);
    function matchesGear(e) {
      if (!gearFilter) return true;
      if (gearFilter === "bodyweight") return !(e.gear || []).length;
      return (e.gear || []).includes(gearFilter);
    }
    const gearRow = useDial ? el("div", { class: "xpick-gear", "data-testid": "xpick-gear" }) : null;
    function renderGear() {
      if (!gearRow) return;
      clear(gearRow);
      const chip = (val, label) => el("button", {
        class: "xgear-chip" + (gearFilter === val ? " active" : ""),
        type: "button", "data-testid": `xgear-${val || "all"}`,
        on: { click: () => { gearFilter = gearFilter === val ? null : val; renderGear(); renderContent(); renderDial(); } }
      }, label);
      gearRow.appendChild(chip(null, "Any kit"));
      if (hasBodyweight) gearRow.appendChild(chip("bodyweight", "Bodyweight"));
      for (const g of gearsPresent) gearRow.appendChild(chip(g, GEAR_META[g] || g));
    }

    function onCustomCreated(ex) {
      if (customImmediate) { onConfirm([{ id: ex.id, name: ex.name }]); return; }
      all.push({ ...ex, isCustom: true });
      if (!cats.includes(ex.category) && countFor(ex.category) > 0) cats.push(ex.category);
      selected.set(ex.id, { id: ex.id, name: ex.name });
      searchI.value = "";
      renderChips();
      renderDots();
      renderContent();
      scrollToCat(ex.category);
      updateCta();
    }

    function renderChips() {
      clear(chipRow);
      if (allowCustom && !useDial) {
        chipRow.appendChild(el("button", {
          class: "xpick-chip xpick-chip-custom",
          type: "button",
          "data-testid": "xchip-custom",
          on: { click: () => openCustomExerciseForm(onCustomCreated) }
        }, el("span", { class: "xpick-chip-plus", html: icons.plus }), "Custom"));
      }
      for (const c of cats) {
        chipRow.appendChild(el("button", {
          class: "xpick-chip" + (activeCat === c ? " active" : ""),
          type: "button",
          "data-cat": c,
          "data-testid": `xchip-${c}`,
          on: { click: () => scrollToCat(c) }
        }, catLabel(c)));
      }
    }

    function renderDots() {
      clear(dotsRow);
      for (const c of cats) {
        dotsRow.appendChild(el("button", {
          class: "xpick-dot" + (activeCat === c ? " active" : ""),
          type: "button",
          "data-cat": c,
          "aria-label": catLabel(c),
          on: { click: () => scrollToCat(c) }
        }));
      }
    }

    // Glide the chip row (horizontal only) so the active chip stays centred —
    // avoids the sudden jump scrollIntoView() causes mid-swipe.
    function centerChip(chip) {
      const target = chip.offsetLeft - (chipRow.clientWidth - chip.clientWidth) / 2;
      const max = chipRow.scrollWidth - chipRow.clientWidth;
      chipRow.scrollTo({ left: Math.max(0, Math.min(max, target)), behavior: "smooth" });
    }

    function syncActive() {
      for (const chip of Array.from(chipRow.children)) {
        const on = chip.getAttribute("data-cat") === activeCat;
        chip.classList.toggle("active", on);
        if (on) centerChip(chip);
      }
      for (const dot of Array.from(dotsRow.children)) {
        dot.classList.toggle("active", dot.getAttribute("data-cat") === activeCat);
      }
      updateFigure();
      renderDial();
    }

    function panelForCat(c) {
      if (!pager) return null;
      const key = (window.CSS && CSS.escape) ? CSS.escape(c) : c;
      return pager.querySelector('.xpick-panel[data-cat="' + key + '"]');
    }

    // Index of the panel nearest the pager's viewport centre — robust to
    // panel padding/margins (don't assume panel width === pager width).
    function nearestPanelIndex() {
      if (!pager || !pager.children.length) return Math.max(0, cats.indexOf(activeCat));
      const center = pager.scrollLeft + pager.clientWidth / 2;
      let best = 0, bestDist = Infinity;
      const panels = pager.children;
      for (let i = 0; i < panels.length; i++) {
        const c = panels[i].offsetLeft + panels[i].offsetWidth / 2;
        const d = Math.abs(c - center);
        if (d < bestDist) { bestDist = d; best = i; }
      }
      return best;
    }

    function scrollToCat(c) {
      if (!cats.includes(c)) return;
      activeCat = c;
      syncActive();
      const panel = panelForCat(c);
      if (pager && panel) pager.scrollTo({ left: panel.offsetLeft, behavior: "smooth" });
      if (isWheel) setTimeout(magnifyActive, 60);
    }

    // Magnify wheel for the exercise list (start-workout only): the row nearest
    // the list's centre grows and brightens; the + on each row still selects.
    function magnifyList(listEl) {
      if (!listEl) return;
      const rect = listEl.getBoundingClientRect();
      if (!rect.height) return;
      const mid = rect.top + rect.height / 2, half = rect.height / 2;
      let closest = null, cd = Infinity;
      const rows = listEl.querySelectorAll(".xrow");
      rows.forEach(r => {
        const b = r.getBoundingClientRect();
        const d = Math.abs((b.top + b.height / 2) - mid);
        const t = Math.min(1, d / half);
        r.style.transform = `scale(${(1 - t * 0.13).toFixed(3)})`;
        r.style.opacity = (1 - t * 0.5).toFixed(2);
        if (d < cd) { cd = d; closest = r; }
      });
      rows.forEach(r => r.classList.toggle("is-center", r === closest));
    }
    function magnifyActive() {
      const panel = panelForCat(activeCat);
      if (panel) magnifyList(panel.querySelector(".xpick-panel-list"));
    }

    function rowFor(ex) {
      const isSel = selected.has(ex.id);
      const isExisting = existing.has(ex.id);
      const metaBits = [];
      if (ex.equipment) metaBits.push(el("span", { class: "xrow-equip" }, ex.equipment));
      const muscles = (ex.muscles || []).slice(0, 2).join(", ");
      if (muscles) {
        if (metaBits.length) metaBits.push(el("span", { class: "xrow-sep" }, " · "));
        metaBits.push(el("span", { class: "xrow-muscles" }, muscles));
      }
      const addBtn = el("button", {
        class: "xrow-add" + (isSel ? " added" : ""),
        type: "button",
        tabindex: "-1",
        "aria-hidden": "true",
        html: isSel ? icons.check : icons.plus
      });
      const row = el("div", {
        class: "xrow" + (isSel ? " is-selected" : "") + (isExisting ? " is-existing" : ""),
        "data-testid": `xrow-${ex.id}`
      },
        exerciseFigureIcon(ex.category),
        el("div", { class: "xrow-main" },
          el("div", { class: "xrow-name" }, ex.name,
            ex.isCustom ? el("span", { class: "chip chip-accent xrow-custom" }, "Custom") : null),
          el("div", { class: "xrow-meta" }, ...metaBits)
        ),
        isExisting ? el("span", { class: "xrow-added-label" }, "Added") : addBtn
      );
      if (!isExisting) {
        row.addEventListener("click", () => {
          if (selected.has(ex.id)) selected.delete(ex.id);
          else selected.set(ex.id, { id: ex.id, name: ex.name });
          const nowSel = selected.has(ex.id);
          row.classList.toggle("is-selected", nowSel);
          addBtn.classList.toggle("added", nowSel);
          addBtn.innerHTML = nowSel ? icons.check : icons.plus;
          updateCta();
        });
      }
      return row;
    }

    // Flat, grouped results while searching (spans every category).
    function renderSearch(q) {
      const results = el("div", { class: "xpick-results" });
      const matches = all.filter(ex => matchesGear(ex) && (
        ex.name.toLowerCase().includes(q) ||
        (ex.muscles || []).some(m => m.toLowerCase().includes(q)) ||
        (ex.equipment || "").toLowerCase().includes(q)));
      if (!matches.length) {
        results.appendChild(el("div", { class: "text-sm text-faint", style: "padding: 16px 4px" }, "No exercises found."));
        return results;
      }
      const groups = new Map();
      for (const ex of matches) {
        const c = ex.category || "other";
        if (!groups.has(c)) groups.set(c, []);
        groups.get(c).push(ex);
      }
      const ordered = [...cats.filter(c => groups.has(c)), ...[...groups.keys()].filter(c => !cats.includes(c))];
      for (const c of ordered) {
        const sec = el("div", { class: "xpick-section" });
        sec.appendChild(el("div", { class: "xpick-section-head" },
          el("span", {}, catLabel(c).toUpperCase()),
          el("span", { class: "xpick-section-count" }, String(groups.get(c).length))
        ));
        for (const ex of groups.get(c)) sec.appendChild(rowFor(ex));
        results.appendChild(sec);
      }
      return results;
    }

    // One swipeable card per category, laid out in a horizontal snap pager.
    function buildPager() {
      const p = el("div", { class: "xpick-pager", "data-testid": "xpick-pager" });
      for (const c of cats) {
        const items = all.filter(e => e.category === c && matchesGear(e));
        const list = el("div", { class: "xpick-panel-list" + (isWheel ? " is-wheel" : "") },
          items.length ? null : el("div", { class: "text-sm text-faint", style: "padding:24px 8px;text-align:center" },
            "Nothing here needs only that kit."),
          ...items.map(rowFor));
        if (isWheel) {
          let lraf = null;
          list.addEventListener("scroll", () => { if (lraf) return; lraf = requestAnimationFrame(() => { lraf = null; magnifyList(list); }); }, { passive: true });
        }
        watchTuck(list);
        const panel = el("div", { class: "xpick-panel", "data-cat": c },
          el("div", { class: "xpick-card" },
            el("div", { class: "xpick-panel-head" },
              el("span", { class: "xpick-panel-title" }, catLabel(c)),
              el("span", { class: "xpick-panel-count" }, `${items.length}`)
            ),
            list
          )
        );
        p.appendChild(panel);
      }
      // Track the swipe in real time (rAF-throttled, not debounced) so the
      // category highlight follows the finger and flips smoothly at the
      // midpoint instead of snapping after the scroll settles. Uses actual
      // panel geometry (nearest to viewport centre) rather than assuming each
      // panel is exactly the pager width.
      let scrollRAF = null;
      p.addEventListener("scroll", () => {
        if (scrollRAF) return;
        scrollRAF = requestAnimationFrame(() => {
          scrollRAF = null;
          const c = cats[nearestPanelIndex()];
          if (c && c !== activeCat) { activeCat = c; syncActive(); if (isWheel) magnifyActive(); }
        });
      }, { passive: true });
      return p;
    }

    function renderContent() {
      clear(content);
      const q = searchI.value.trim().toLowerCase();
      if (q) {
        chipRow.style.display = "none";
        catFigure.style.display = "none";
        dotsRow.style.display = "none";
        // Searching means you are reaching for the field that is inside the
        // tuck; keeping it collapsed would hide what you are typing into.
        setTuck(false);
        // Search spans every category, so the dial has nothing to say about
        // what you are looking at.
        if (dialBtn) dialBtn.style.display = "none";
        pager = null;
        content.appendChild(renderSearch(q));
        return;
      }
      chipRow.style.display = "";
      catFigure.style.display = "";
      if (dialBtn) dialBtn.style.display = "";
      if (!cats.length) {
        dotsRow.style.display = "none";
        pager = null;
        content.appendChild(el("div", { class: "text-sm text-faint", style: "padding: 16px 4px" }, "No exercises found."));
        return;
      }
      dotsRow.style.display = cats.length > 1 ? "" : "none";
      pager = buildPager();
      content.appendChild(pager);
      if (!activeCat || !cats.includes(activeCat)) activeCat = cats[0];
      syncActive();
      // Jump (no animation) to the active card once laid out.
      requestAnimationFrame(() => {
        const panel = panelForCat(activeCat);
        if (pager && panel) pager.scrollLeft = panel.offsetLeft;
        if (isWheel) {
          // Centre the first row of each list, then apply the magnify pass.
          pager.querySelectorAll(".xpick-panel-list.is-wheel").forEach(list => {
            const first = list.querySelector(".xrow");
            if (first) list.scrollTop = Math.max(0, first.offsetTop - list.clientHeight / 2 + first.offsetHeight / 2);
            magnifyList(list);
          });
        }
      });
    }

    function updateCta() {
      const n = selected.size;
      footer.style.display = n > 0 ? "" : "none";
      if (n > 0) cta.textContent = confirmLabel(n);
    }

    cta.addEventListener("click", async () => {
      if (!selected.size) return;
      await onConfirm([...selected.values()]);
    });
    searchI.addEventListener("input", U.debounce(renderContent, 120));

    const headerEl = header ? el("div", { class: "xpick-header" },
      header.eyebrow ? el("div", { class: "xpick-eyebrow" }, header.eyebrow) : null,
      header.title ? el("h2", { class: "xpick-title" }, header.title) : null,
      header.subtitle ? el("div", { class: "xpick-subtitle" }, header.subtitle) : null
    ) : null;

    // The dial is the front door. The chip row stays in the markup — it is
    // still the fastest way across on a screen with room for it — and CSS
    // drops it below 560px, where the dial and the pager already cover it.
    // The figure is redundant once the dial carries one.
    tuckEl = useDial ? el("div", { class: "xpick-tuck", "data-testid": "xpick-tuck" },
      searchI, dialRow, gearRow) : null;
    const body = el("div", { class: "xpick xpick-multi" + (useDial ? " has-dial" : "") },
      headerEl, tuckEl || searchI,
      useDial ? null : catFigure, chipRow, content, dotsRow, footer
    );

    let didInitialScroll = false;
    function refresh() {
      renderGear(); renderChips(); renderDots(); renderContent(); updateCta(); renderDial();
      // Optionally open on a specific category (e.g. a focus day's "Start").
      if (!didInitialScroll && opts.initialCat && cats.includes(opts.initialCat)) {
        didInitialScroll = true;
        requestAnimationFrame(() => requestAnimationFrame(() => scrollToCat(opts.initialCat)));
      }
    }
    return { body, refresh, focus: () => searchI.focus() };
  }

  // Modal wrapper for the multi-select picker (in-workout add / template builder).
  //   onConfirm(items)  items: [{id, name}]
  //   opts.existingIds, opts.title
  function openExercisePicker(onConfirm, opts = {}) {
    getAllExercises().then(all => {
      const picker = buildExercisePickerUI(all, {
        existingIds: opts.existingIds,
        confirmLabel: (n) => `Add ${n} exercise${n === 1 ? "" : "s"}`,
        allowCustom: true,
        customImmediate: true,
        onConfirm: async (items) => { closeModal(); await onConfirm(items); }
      });
      openModal(opts.title || "Add exercises", picker.body, null);
      picker.refresh();
      setTimeout(picker.focus, 50);
    });
  }

  // ============ NUTRITION ============
  /** Compact P/C/F summary + optional goal progress + energy split bar. */
  function renderMacroBreakdown(totals, opts = {}) {
    const isEstimate = !!opts.estimate;
    const wrap = el("div", {
      class: "macro-breakdown" + (opts.compact ? " compact" : "") + (isEstimate ? " is-estimate" : "")
    });
    const p = totals.protein || 0;
    const c = totals.carbs || 0;
    const f = totals.fat || 0;
    const goals = opts.goals || null;
    const hasIntake = p > 0 || c > 0 || f > 0;
    const hasGoals = goals && (goals.protein || goals.carbs || goals.fat);

    if (!hasIntake && !hasGoals) {
      if (opts.emptyText) {
        wrap.appendChild(el("div", { class: "text-xs text-faint" }, opts.emptyText));
      }
      return wrap;
    }

    const hint = isEstimate
      ? (opts.goalHint ? `Estimate · ${opts.goalHint}` : "Estimate")
      : opts.goalHint;
    if (opts.title || hint) {
      wrap.appendChild(el("div", { class: "row-between", style: "margin-bottom: 8px; gap: 8px; align-items: baseline" },
        opts.title ? el("div", { class: "macro-breakdown-title" }, opts.title) : el("div", {}),
        hint ? el("div", { class: "text-xs text-faint" + (isEstimate ? " macro-estimate-hint" : "") }, hint) : null
      ));
    }

    const stats = el("div", { class: "macro-stats" });
    const items = [
      { key: "protein", label: "Protein", value: p, goal: goals?.protein || 0 },
      { key: "carbs", label: "Carbs", value: c, goal: goals?.carbs || 0 },
      { key: "fat", label: "Fat", value: f, goal: goals?.fat || 0 }
    ];
    for (const it of items) {
      const goal = it.goal || 0;
      const pct = goal > 0 ? Math.min(100, (it.value / goal) * 100) : 0;
      const over = goal > 0 && it.value > goal;
      const remaining = goal > 0 ? goal - it.value : null;
      const card = el("div", {
        class: `macro-stat macro-${it.key}` + (over ? " over" : "") + (isEstimate ? " is-estimate" : "")
      },
        el("div", { class: "macro-stat-label-row" },
          el("div", { class: "macro-stat-label" }, it.label),
          isEstimate && goal > 0
            ? el("span", { class: "macro-estimate-tag", "data-testid": `macro-estimate-${it.key}` }, "Estimate")
            : null
        ),
        el("div", { class: "macro-stat-value" + (isEstimate ? " is-estimate" : "") },
          goal > 0
            ? `${U.formatMacroG(it.value).replace("g", "")} / ${U.formatMacroG(goal)}`
            : U.formatMacroG(it.value)
        )
      );
      if (goal > 0) {
        card.appendChild(el("div", { class: "macro-goal-progress" },
          el("div", {
            class: "macro-goal-progress-fill" + (over ? " over" : ""),
            style: `width: ${pct}%`
          })
        ));
        card.appendChild(el("div", { class: "macro-stat-sub" },
          remaining >= 0 ? `${U.formatMacroG(remaining)} left` : `${U.formatMacroG(Math.abs(remaining))} over`
        ));
      }
      stats.appendChild(card);
    }
    wrap.appendChild(stats);

    if (!opts.hideBar && hasIntake) {
      const split = U.macroEnergySplit({ protein: p, carbs: c, fat: f });
      const bar = el("div", { class: "macro-bar", title: `Macro energy ≈ ${split.totalKcal} kcal` });
      if (split.protein) bar.appendChild(el("div", { class: "macro-bar-seg protein", style: `width:${split.protein}%` }));
      if (split.carbs) bar.appendChild(el("div", { class: "macro-bar-seg carbs", style: `width:${split.carbs}%` }));
      if (split.fat) bar.appendChild(el("div", { class: "macro-bar-seg fat", style: `width:${split.fat}%` }));
      wrap.appendChild(bar);
      wrap.appendChild(el("div", { class: "text-xs text-faint macro-bar-legend" },
        `Energy split P ${split.protein}% · C ${split.carbs}% · F ${split.fat}% · ≈ ${split.totalKcal} kcal from macros`
      ));
    }
    return wrap;
  }

  function mealMacroMeta(m) {
    const line = U.formatMacroLine(m);
    if (!line && !m.notes) return null;
    if (line && m.notes) return `${line} · ${m.notes}`;
    return line || m.notes || null;
  }

  // Meta line for a logged meal, with the time rendered as a tappable chip so
  // correcting when you ate something doesn't mean opening the whole form.
  function mealMetaLine(m, afterSave) {
    const t = U.normalizeMealTime(m?.time);
    const rest = mealMacroMeta(m);
    const line = el("div", { class: "meal-item-meta" });
    if (t) {
      line.appendChild(el("button", {
        type: "button", class: "meal-time-chip", "data-testid": "meal-time-chip",
        title: "Change when this was eaten",
        "aria-label": `Eaten at ${t} — change`,
        on: { click: (e) => { e.stopPropagation(); editMealWhen(m, afterSave); } }
      }, t));
    }
    if (rest) line.appendChild(el("span", { class: "meal-item-meta-rest" }, t ? ` · ${rest}` : rest));
    return (t || rest) ? line : null;
  }

  function mealSectionSelect(selected) {
    const s = el("select", { class: "select" });
    for (const opt of U.mealSectionOptions()) {
      s.appendChild(el("option", { value: opt.value }, opt.label));
    }
    s.value = U.normalizeMealSection(selected || "snack");
    return s;
  }

  // Day options for the "When" wheel: the last N days up to today, newest
  // first. No future days — you can't have eaten something tomorrow.
  function recentDayItems(days = 60, mustInclude = null) {
    const out = [];
    const today = U.todayISO();
    const d = new Date(today + "T00:00:00");
    for (let i = 0; i < days; i++) {
      const iso = U.todayISO(d);
      let label;
      if (i === 0) label = "Today";
      else if (i === 1) label = "Yesterday";
      else label = U.formatDate(iso, { weekday: "short", day: "numeric", month: "short" });
      out.push({ value: iso, label });
      d.setDate(d.getDate() - 1);
    }
    // A meal older than the window (or, defensively, dated ahead) must still be
    // selectable, or opening its sheet would silently move it.
    if (mustInclude && !out.some(o => o.value === mustInclude)) {
      const item = { value: mustInclude, label: U.formatDate(mustInclude, { weekday: "short", day: "numeric", month: "short" }) };
      if (mustInclude > today) out.unshift(item);
      else out.push(item);
    }
    return out;
  }

  // Bottom sheet with date + hour + minute wheels. Used to correct when an
  // entry happened without dragging the whole meal form open.
  function openWhenSheet({ title, date, time, onPick }) {
    const startDate = date || U.todayISO();
    const t = U.normalizeMealTime(time) || "12:00";
    let curDate = startDate;
    let curH = parseInt(t.slice(0, 2), 10) || 0;
    // Snap to the 5-minute grid the wheel offers, rounding to nearest.
    let curM = Math.round((parseInt(t.slice(3, 5), 10) || 0) / 5) * 5;
    if (curM >= 60) { curM = 0; curH = (curH + 1) % 24; }

    const overlay = el("div", { class: "wsheet-overlay", "data-testid": "when-sheet",
      on: { click: (e) => { if (e.target === overlay) close(); } } });
    function onKey(e) { if (e.key === "Escape") { e.preventDefault(); close(); } }
    const close = () => { document.removeEventListener("keydown", onKey); overlay.remove(); };
    document.addEventListener("keydown", onKey);

    const pad2 = (n) => String(n).padStart(2, "0");
    const dayC = buildWheel({
      items: recentDayItems(60, startDate), value: curDate, itemHeight: 44, visibleCount: 5,
      variant: "wheel-sheet wheel-when-day", testid: "when-wheel-day",
      onChange: (v) => { curDate = v; }
    });
    const hourC = buildWheel({
      items: wheelRange(0, 23, 1, pad2), value: curH, itemHeight: 44, visibleCount: 5,
      variant: "wheel-sheet", testid: "when-wheel-hour", onChange: (v) => { curH = v; }
    });
    const minC = buildWheel({
      items: wheelRange(0, 55, 5, pad2), value: curM, itemHeight: 44, visibleCount: 5,
      variant: "wheel-sheet", testid: "when-wheel-min", onChange: (v) => { curM = v; }
    });

    const sheet = el("div", { class: "wsheet" },
      el("div", { class: "wsheet-title" }, title || "When"),
      el("div", { class: "when-wheels" },
        el("div", { class: "when-col when-col-day" }, dayC.el),
        el("div", { class: "when-col" }, hourC.el),
        el("div", { class: "when-sep" }, ":"),
        el("div", { class: "when-col" }, minC.el)
      ),
      el("div", { class: "wsheet-actions" },
        el("button", { class: "btn", on: { click: close } }, "Cancel"),
        el("button", {
          class: "btn btn-primary", "data-testid": "when-sheet-done",
          on: {
            click: () => {
              const picked = { date: curDate, time: `${pad2(curH)}:${pad2(curM)}` };
              close();
              onPick && onPick(picked);
            }
          }
        }, "Done")
      )
    );
    overlay.appendChild(sheet);
    document.body.appendChild(overlay);
    makeDismissible(sheet, close);
  }

  // Open any past day's breakdown, including days with nothing logged — those
  // never appear in a history list, so this is the only way to reach them.
  // Generic date wheel. Used to open a past day, and to re-date a workout.
  function openDateSheet({ title, date, confirmLabel, testid, onPick }) {
    const items = recentDayItems(120, date);
    const overlay = el("div", { class: "wsheet-overlay", "data-testid": testid || "date-sheet",
      on: { click: (e) => { if (e.target === overlay) close(); } } });
    function onKey(e) { if (e.key === "Escape") { e.preventDefault(); close(); } }
    const close = () => { document.removeEventListener("keydown", onKey); overlay.remove(); };
    document.addEventListener("keydown", onKey);

    let picked = date || (items[1] ? items[1].value : U.todayISO());
    const wheelC = buildWheel({
      items, value: picked, itemHeight: 44, visibleCount: 5,
      variant: "wheel-sheet wheel-when-day", testid: "date-sheet-wheel",
      onChange: (v) => { picked = v; }
    });
    const sheet = el("div", { class: "wsheet" },
      el("div", { class: "wsheet-title" }, title || "Pick a day"),
      el("div", { class: "wsheet-wheel" }, wheelC.el),
      el("div", { class: "wsheet-actions" },
        el("button", { class: "btn", on: { click: close } }, "Cancel"),
        el("button", {
          class: "btn btn-primary", "data-testid": "date-sheet-ok",
          on: { click: () => { const d = picked; close(); onPick && onPick(d); } }
        }, confirmLabel || "Open")
      )
    );
    overlay.appendChild(sheet);
    document.body.appendChild(overlay);
    makeDismissible(sheet, close);
  }

  function openDayPicker() {
    openDateSheet({
      title: "Open a day", testid: "day-picker", confirmLabel: "Open",
      date: recentDayItems(2)[1] ? recentDayItems(2)[1].value : U.todayISO(),
      onPick: (d) => openNutritionDayDetail(d)
    });
  }

  // Shared handler: retime/re-date a logged meal from any list it appears in.
  async function editMealWhen(meal, afterSave) {
    openWhenSheet({
      title: "When did you eat this?",
      date: meal.date,
      time: meal.time,
      onPick: async ({ date, time }) => {
        if (date === meal.date && time === U.normalizeMealTime(meal.time)) return;
        await Storage.saveMeal({ ...meal, date, time });
        toast(date === meal.date
          ? `Moved to ${time}`
          : `Moved to ${U.formatDate(date, { weekday: "short", day: "numeric", month: "short" })} · ${time}`);
        if (afterSave) await afterSave(date);
      }
    });
  }

  function mealTemplatePayload(source) {
    return {
      name: (source.name || "").trim(),
      kcal: source.kcal || 0,
      protein: source.protein || 0,
      carbs: source.carbs || 0,
      fat: source.fat || 0,
      section: U.normalizeMealSection(source.section || "snack"),
      notes: source.notes || ""
    };
  }

  async function saveMealAsTemplate(source, opts = {}) {
    const payload = mealTemplatePayload(source);
    if (!payload.name) {
      toast("Meal needs a name to save");
      return null;
    }
    const existing = await Storage.getMealTemplates();
    const match = existing.find(t => t.name.toLowerCase() === payload.name.toLowerCase());
    if (match && !opts.forceUpdate) {
      const overwrite = await confirmDialog(
        `“${payload.name}” is already saved. Update it with these values?`,
        { title: "Update saved meal?", okLabel: "Update", cancelLabel: "Keep both" }
      );
      if (overwrite) {
        const updated = { ...match, ...payload, updatedAt: Date.now() };
        await Storage.saveMealTemplate(updated);
        toast("Saved meal updated");
        return updated;
      }
      payload.name = `${payload.name} (${existing.length + 1})`;
    } else if (match && opts.forceUpdate) {
      const updated = { ...match, ...payload, updatedAt: Date.now() };
      await Storage.saveMealTemplate(updated);
      toast("Saved meal updated");
      return updated;
    }
    const tpl = {
      id: U.uid(),
      ...payload,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await Storage.saveMealTemplate(tpl);
    pulseSavedHero = true; // draw the eye to the Saved-meals count next render
    toast("Meal saved for reuse");
    return tpl;
  }

  async function logMealFromTemplate(tpl, sectionOverride = null, dateHint = null) {
    const section = U.normalizeMealSection(sectionOverride || tpl.section || "snack");
    const date = dateHint || U.todayISO();
    const meal = {
      id: U.uid(),
      name: tpl.name,
      kcal: tpl.kcal || 0,
      protein: tpl.protein || 0,
      carbs: tpl.carbs || 0,
      fat: tpl.fat || 0,
      section,
      // "Now" only makes sense on today — backdating a saved meal should land at
      // a plausible hour for its section, not whatever o'clock it is right now.
      time: U.defaultMealTimeForSection(section, date),
      date,
      notes: tpl.notes || "",
      savedAt: Date.now(),
      fromTemplateId: tpl.id
    };
    await Storage.saveMeal(meal);
    try {
      await Storage.saveMealTemplate({ ...tpl, lastUsedAt: Date.now(), updatedAt: tpl.updatedAt || Date.now() });
    } catch (_) {}
    toast(date === U.todayISO()
      ? withPlanNotice(`Logged ${tpl.name}`, meal)
      : `Logged ${tpl.name} to ${U.formatDate(date, { weekday: "short", day: "numeric", month: "short" })}`);
    renderMain();
    // Backdated: drop the user back into the day they were editing.
    if (date !== U.todayISO()) openNutritionDayDetail(date);
  }

  /** Drag a row to the right to fire its primary action.
   *
   *  Rightward only. Left is where a delete-by-swipe would go, and deleting a
   *  saved meal already asks for confirmation — a gesture that skips the
   *  confirm because your thumb went the wrong way is not a shortcut.
   *
   *  Not an accessibility problem, but only because tapping the row does the
   *  same thing. A gesture is unreachable by keyboard and by a screen reader,
   *  so it may only ever be a faster route to something already reachable —
   *  never the only way to do it. The action panel is aria-hidden for the same
   *  reason: it is scenery for a gesture, not a second control to announce.
   */
  function attachSwipeAction(row, slide, onCommit) {
    const MAX = 132;     // furthest the row travels
    const COMMIT = 84;   // past here, letting go fires
    let sx = 0, sy = 0, dx = 0, axis = null, armed = false, live = false;

    const setX = (x, animate) => {
      slide.style.transition = animate ? "transform .22s var(--ease-spring)" : "none";
      slide.style.transform = x ? `translateX(${x}px)` : "";
    };

    row.addEventListener("touchstart", (e) => {
      if (e.touches.length !== 1) { live = false; return; }
      sx = e.touches[0].clientX; sy = e.touches[0].clientY;
      dx = 0; axis = null; armed = false; live = true;
      setX(0, false);
    }, { passive: true });

    row.addEventListener("touchmove", (e) => {
      if (!live) return;
      const mx = e.touches[0].clientX - sx;
      const my = e.touches[0].clientY - sy;
      // Pick the axis once, on the first movement big enough to read, and
      // stick to it. Deciding per-frame means a vertical scroll that drifts a
      // few pixels sideways drags the row open under your thumb.
      if (!axis) {
        if (Math.abs(mx) < 8 && Math.abs(my) < 8) return;
        axis = Math.abs(mx) > Math.abs(my) * 1.2 ? "x" : "y";
        if (axis === "y") { live = false; return; }   // the sheet keeps its scroll
      }
      if (mx <= 0) { dx = 0; setX(0, false); return; }
      e.preventDefault();                              // the gesture is ours now
      dx = Math.min(MAX, mx * 0.82);                   // drag, so the end feels like one
      setX(dx, false);
      const nowArmed = dx >= COMMIT;
      if (nowArmed !== armed) {
        armed = nowArmed;
        row.classList.toggle("is-armed", armed);
        // One tick when it arms, so you know it will fire without looking.
        if (armed) { try { if (navigator.vibrate) navigator.vibrate(15); } catch (_) {} }
      }
    }, { passive: false });

    row.addEventListener("touchend", () => {
      if (!live) return;
      live = false;
      row.classList.remove("is-armed");
      if (dx < COMMIT) { setX(0, true); return; }
      setX(MAX, true);
      row.classList.add("is-firing");
      setTimeout(onCommit, 140);
    }, { passive: true });

    row.addEventListener("touchcancel", () => {
      live = false; row.classList.remove("is-armed"); setX(0, true);
    }, { passive: true });
  }

  // Saved meals shortcut — quick sheet to re-log a saved meal (optionally into
  // a specific section) or jump to create/edit one.
  async function openSavedMealsSheet(sectionHint = null, dateHint = null) {
    const date = dateHint || U.todayISO();
    const isBackdated = date !== U.todayISO();
    const body = el("div", { "data-testid": "saved-sheet-body" });

    // Rebuilt in place after a delete rather than closed: clearing out a list
    // you no longer use is usually more than one item, and reopening the sheet
    // between each would make that tedious.
    async function fill() {
      const templates = await Storage.getMealTemplates();
      clear(body);
      if (isBackdated) {
        body.appendChild(el("div", { class: "saved-sheet-daynote", "data-testid": "saved-sheet-daynote" },
          `Logging to ${U.formatDate(date, { weekday: "long", day: "numeric", month: "short" })}`));
      }
      if (!templates.length) {
        body.appendChild(el("p", { class: "text-sm text-faint", style: "margin:4px 0 12px", "data-testid": "saved-sheet-empty" },
          "No saved meals yet. Log a meal, then tap the bookmark on it to keep it for next time."));
        return;
      }
      const sorted = templates.slice().sort((a, b) => (b.lastUsedAt || b.updatedAt || 0) - (a.lastUsedAt || a.updatedAt || 0));
      // Three signals, doing different jobs. The rail is permanent — a sliver
      // of the Log panel showing at the left edge of every row, so the gesture
      // has somewhere visible to come from. The hint line and the nudge are
      // teaching aids and retire the first time a swipe lands.
      const taught = !!(await Storage.getPref("savedSwipeUsed"));
      const list = el("div", { class: "saved-sheet-list" });
      if (!taught) {
        list.appendChild(el("div", { class: "smeal-hint", "data-testid": "saved-swipe-hint" },
          el("span", { class: "smeal-hint-arrow", "aria-hidden": "true" }, "→"),
          "Swipe a meal right to log it"));
      }
      for (const tpl of sorted) {
        const macroLine = U.formatMacroLine(tpl);
        const slide = el("div", { class: "smeal-slide" },
          el("button", {
            class: "saved-sheet-main", type: "button", title: `Log ${tpl.name}`,
            "data-testid": "saved-sheet-log",
            on: { click: async () => { closeModal(); await logMealFromTemplate(tpl, sectionHint, dateHint); } }
          },
            el("div", { class: "saved-sheet-name" }, tpl.name),
            el("div", { class: "saved-sheet-meta" }, `${tpl.kcal || 0} kcal${macroLine ? ` · ${macroLine}` : ""}`)
          ),
          el("button", {
            class: "icon-btn", title: `Edit ${tpl.name}`, "aria-label": `Edit ${tpl.name}`,
            "data-testid": "saved-sheet-edit", html: icons.edit,
            on: { click: () => { closeModal(); openMealTemplateEditor(tpl); } }
          }),
          el("button", {
            class: "icon-btn saved-sheet-del", title: `Delete ${tpl.name}`,
            "aria-label": `Delete saved meal ${tpl.name}`,
            "data-testid": "saved-sheet-delete", html: icons.trash,
            on: { click: () => deleteSavedMeal(tpl, fill) }
          })
        );
        const item = el("div", { class: "saved-sheet-item smeal", "data-testid": "saved-sheet-item" },
          el("div", { class: "smeal-action", "aria-hidden": "true", "data-testid": "saved-swipe-action" },
            el("span", { class: "smeal-action-icon", html: icons.check }),
            el("span", { class: "smeal-action-label" }, "Log")),
          slide
        );
        attachSwipeAction(item, slide, async () => {
          // Retire the teaching aids the moment the gesture lands once.
          if (!taught) Storage.setPref("savedSwipeUsed", true).catch(() => {});
          closeModal();
          await logMealFromTemplate(tpl, sectionHint, dateHint);
        });
        list.appendChild(item);
      }
      body.appendChild(list);

      // One demonstration, on the first row, the first time you open this. It
      // is the only signal that survives someone who does not read the hint.
      // Skipped under reduced motion — a row moving on its own is exactly the
      // thing that setting is asking us not to do — where the rail and the
      // hint line carry it instead.
      if (!taught && !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {
        const firstSlide = list.querySelector(".smeal .smeal-slide");
        if (firstSlide) setTimeout(() => firstSlide.classList.add("is-nudging"), 420);
      }
    }

    await fill();
    const footer = el("div", {},
      // Backdated: this sheet was opened from a day's breakdown, so going back
      // should land there rather than dumping you out to the tab.
      el("button", {
        class: "btn",
        on: { click: () => { closeModal(); if (isBackdated) openNutritionDayDetail(date); } }
      }, isBackdated ? "Back" : "Close"),
      el("button", { class: "btn btn-primary", on: { click: () => { closeModal(); openMealTemplateEditor(null); } } },
        el("span", { html: icons.plus }), "New saved meal")
    );
    const title = sectionHint ? `Saved → ${U.MEAL_SECTIONS[sectionHint].label}` : "Saved meals";
    openModal(title, body, footer);
  }

  /** Remove a saved meal. Deliberately does NOT touch the meals already logged
      from it — those are a record of what you ate, not references to the
      template. `after` re-renders whichever surface asked. */
  async function deleteSavedMeal(tpl, after) {
    const ok = await confirmDialog(
      `Remove “${tpl.name}” from your saved meals? Meals you have already logged from it stay in your diary.`,
      { title: "Delete saved meal?", okLabel: "Delete", danger: true });
    if (!ok) return false;
    await Storage.deleteMealTemplate(tpl.id);
    toast(`Deleted “${tpl.name}”`);
    // The tab behind the sheet shows a saved-meal count, so it has to refresh
    // whether or not the caller rebuilds itself.
    renderMain();
    if (after) await after();
    return true;
  }

  // ============ Reminders (in-app, time-aware nudges) ============
  // How long past its time before a due item is called "overdue" (minutes).
  const REMINDER_OVERDUE_MIN = 60;
  const hmToMin = (t) => {
    const m = U.normalizeMealTime(t);
    if (!m) return null;
    const [h, mm] = m.split(":").map(Number);
    return h * 60 + mm;
  };
  // For a reminder time on TODAY that isn't done yet: is it due (time reached)?
  // Returns null when there's no valid time. { due, overdue, time } otherwise.
  function reminderStatus(timeStr) {
    const at = hmToMin(timeStr);
    if (at == null) return null;
    const now = hmToMin(U.nowMealTime());
    const due = now >= at;
    return { due, overdue: due && now - at >= REMINDER_OVERDUE_MIN, time: U.normalizeMealTime(timeStr) };
  }
  const bellIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';

  // ============ Supplements (manual tracker on Nutrition) ============
  const SUPPLEMENT_UNITS = ["capsule", "tablet", "scoop", "g", "mg", "ml", "softgel", "drop", "serving"];

  function formatSupplementDose(item) {
    const dose = item?.dose ?? item?.defaultDose;
    const unit = item?.unit || "serving";
    if (dose == null || dose === "") return unit;
    return `${dose} ${unit}`;
  }

  async function openSupplementForm(existing = null) {
    const nameI = el("input", {
      class: "input",
      placeholder: "e.g. Creatine monohydrate",
      value: existing?.name || ""
    });
    const doseI = el("input", {
      class: "input input-num",
      type: "number",
      inputmode: "decimal",
      step: "0.1",
      min: "0",
      placeholder: "Dose",
      value: existing?.defaultDose ?? ""
    });
    const unitSel = el("select", { class: "input" });
    for (const u of SUPPLEMENT_UNITS) {
      const opt = el("option", { value: u }, u);
      if ((existing?.unit || "capsule") === u) opt.selected = true;
      unitSel.appendChild(opt);
    }
    const notesI = el("textarea", {
      class: "input",
      rows: "2",
      placeholder: "Optional note (timing, brand…)",
      value: existing?.notes || ""
    });
    // textarea value via property after create if el ignores value for textarea
    notesI.value = existing?.notes || "";

    // Optional daily reminder time — surfaces an in-app "due" nudge when unticked.
    const initRemind = U.normalizeMealTime(existing?.reminderTime || "");
    const timeI = el("input", { class: "input", type: "time", value: initRemind });
    const remindToggle = el("button", {
      type: "button",
      class: "remind-toggle" + (initRemind ? " is-on" : ""),
      "aria-pressed": initRemind ? "true" : "false"
    }, el("span", { html: bellIcon }), el("span", {}, "Remind me"));
    const remindRow = el("div", { class: "remind-field", style: initRemind ? "" : "display:none" },
      timeI,
      el("button", { type: "button", class: "btn btn-ghost btn-sm", on: { click: () => { timeI.value = ""; } } }, "Clear")
    );
    remindToggle.addEventListener("click", () => {
      const on = remindRow.style.display === "none";
      remindRow.style.display = on ? "" : "none";
      remindToggle.classList.toggle("is-on", on);
      remindToggle.setAttribute("aria-pressed", on ? "true" : "false");
      if (on && !timeI.value) timeI.value = "09:00";
      if (!on) timeI.value = "";
    });

    const body = el("div", {},
      el("label", { class: "label" }, "Name"),
      nameI,
      el("div", { class: "supplement-dose-row", style: "margin-top:12px" },
        el("div", {}, el("label", { class: "label" }, "Usual dose"), doseI),
        el("div", {}, el("label", { class: "label" }, "Unit"), wheelizeSelect(unitSel, { title: "Unit" }))
      ),
      el("label", { class: "label", style: "margin-top:12px" }, "Daily reminder"),
      remindToggle,
      remindRow,
      el("label", { class: "label", style: "margin-top:12px" }, "Notes"),
      notesI,
      el("p", { class: "text-xs text-faint", style: "margin-top:10px" },
        "Tick it off each day on the Nutrition tab. A reminder shows an in-app nudge when it's due — nothing is auto-logged to food calories.")
    );

    const footer = el("div", {},
      el("button", { class: "btn", on: { click: closeModal } }, "Cancel"),
      el("button", { class: "btn btn-primary", on: { click: async () => {
        const name = nameI.value.trim();
        if (!name) { toast("Give the supplement a name"); return; }
        const doseRaw = doseI.value === "" ? null : parseFloat(doseI.value);
        const defaultDose = Number.isFinite(doseRaw) && doseRaw >= 0 ? doseRaw : null;
        const payload = {
          id: existing?.id || U.uid(),
          name,
          defaultDose,
          unit: unitSel.value || "serving",
          notes: notesI.value.trim(),
          reminderTime: U.normalizeMealTime(timeI.value) || null,
          createdAt: existing?.createdAt || Date.now(),
          updatedAt: Date.now()
        };
        await Storage.saveSupplement(payload);
        closeModal();
        toast(existing ? "Supplement updated" : "Supplement added");
        afterNutritionChange();
      } } }, existing ? "Save" : "Add")
    );
    openModal(existing ? "Edit supplement" : "Add supplement", body, footer);
    setTimeout(() => nameI.focus(), 40);
  }

  // Sheet to set per-section meal reminder times (in-app nudges only).
  async function openReminderSettings() {
    const CORE = ["breakfast", "lunch", "dinner", "snack"];
    const cur = { ...(state.prefs.mealReminders || {}) };
    const rows = [];
    const body = el("div", {});
    body.appendChild(el("div", { class: "nsection-label", style: "margin:0 0 8px" }, "MEAL REMINDERS"));
    body.appendChild(el("p", { class: "text-sm text-muted", style: "margin-bottom:12px" },
      "Get an in-app nudge when a meal hasn't been logged by its time."));
    for (const key of CORE) {
      const meta = U.MEAL_SECTIONS[key];
      const on0 = !!U.normalizeMealTime(cur[key]);
      const timeI = el("input", { class: "input", type: "time", value: U.normalizeMealTime(cur[key]) || meta.defaultTime });
      timeI.disabled = !on0;
      const toggle = el("button", {
        type: "button", class: "remind-toggle" + (on0 ? " is-on" : ""), "aria-pressed": on0 ? "true" : "false"
      }, el("span", { html: bellIcon }), el("span", {}, on0 ? "On" : "Off"));
      toggle.addEventListener("click", () => {
        const on = toggle.getAttribute("aria-pressed") !== "true";
        toggle.classList.toggle("is-on", on);
        toggle.setAttribute("aria-pressed", on ? "true" : "false");
        toggle.lastChild.textContent = on ? "On" : "Off";
        timeI.disabled = !on;
      });
      rows.push({ key, timeI, toggle });
      body.appendChild(el("div", { class: "remind-row-edit" },
        el("div", { class: "remind-row-name" }, meta.label), toggle, timeI));
    }

    // Collect the current meal-reminder selections (shared by Save and Add).
    const collect = () => {
      const next = {};
      for (const r of rows) {
        if (r.toggle.getAttribute("aria-pressed") === "true") {
          const t = U.normalizeMealTime(r.timeI.value);
          if (t) next[r.key] = t;
        }
      }
      return next;
    };
    const persist = async () => { state.prefs.mealReminders = collect(); await Storage.setPref("mealReminders", state.prefs.mealReminders); };

    // Supplements share the reminders context — each carries its own daily time.
    body.appendChild(el("div", { class: "nsection-label", style: "margin:18px 0 6px" }, "SUPPLEMENTS"));
    body.appendChild(el("p", { class: "text-xs text-faint", style: "margin-bottom:10px" },
      "Add a supplement and set its own daily reminder time."));
    body.appendChild(el("button", { class: "btn btn-block", "data-testid": "reminders-add-supplement", on: { click: async () => {
      await persist();            // keep any meal-time edits made here
      closeModal();
      openSupplementForm(null);
    } } }, el("span", { html: icons.plus }), "Add supplement"));

    const footer = el("div", {},
      el("button", { class: "btn", on: { click: closeModal } }, "Cancel"),
      el("button", { class: "btn btn-primary", on: { click: async () => {
        await persist();
        closeModal();
        toast("Reminder times saved");
        afterNutritionChange();
      } } }, "Save")
    );
    openModal("Reminders", body, footer);
  }

  // Remembers which nutrition card was active so an action-triggered re-render
  // returns there instead of snapping back to Overview. Cleared on dock nav.
  let nutritionScrollKey = null;
  // An explicit "take me to this panel", as opposed to nutritionScrollKey,
  // which is a memory of where you were. The two are not the same thing and
  // sharing one variable made the hold menu work exactly once: the pager
  // remembers an exact pixel offset and restores that in preference to the
  // panel key, so after visiting Trends every later request was overruled by
  // the position Trends had left behind. Only the caller asking to be moved
  // ever writes this, and one render consumes it.
  let pendingNutritionPanel = null;
  // Exact pixel scroll of the nutrition pager, so an in-place refresh restores
  // the precise position (no snap-to-panel jump). Cleared on dock nav.
  let nutritionScrollTop = 0;

  // Re-render the Nutrition tab with no teardown flash: build a fresh view
  // off-screen (while the current one stays visible), then swap it in a single
  // synchronous step and restore the exact scroll. Used after logging/removing
  // a meal so the screen updates without the jarring rebuild + scroll lurch.
  async function refreshNutritionInPlace() {
    if (state.tab !== "nutrition") { renderMain(); return; }
    const main = $("#main");
    if (!main) { renderMain(); return; }
    const oldView = main.querySelector(".view");
    const fresh = el("div", { class: "view" });
    await renderNutrition(fresh);
    const freshPager = fresh.querySelector(".npager");
    if (oldView) oldView.replaceWith(fresh); else main.appendChild(fresh);
    if (freshPager) freshPager.scrollTop = nutritionScrollTop;
    requestAnimationFrame(() => applyCountUps(main));
  }
  // A meal/supplement/reminder change: update Nutrition in place (no rebuild
  // flash or scroll jump); anywhere else, a normal render.
  function afterNutritionChange() {
    if (state.tab === "nutrition") return refreshNutritionInPlace();
    renderMain();
  }
  // Same idea for the active-workout exercise pager (index of the active card).
  let workoutScrollIdx = 0;
  // Exact pixel scroll of the workout pager, for a jump-free in-place refresh.
  let workoutScrollTop = 0;

  // No-flash rebuild of the Workout tab (add/remove exercise, change type):
  // build off-screen, swap in one step, restore the exact scroll. Mirrors
  // refreshNutritionInPlace so the pager no longer lurches on those actions.
  async function refreshWorkoutInPlace() {
    if (state.tab !== "workout") { renderMain(); return; }
    const main = $("#main");
    if (!main) { renderMain(); return; }
    const oldView = main.querySelector(".view");
    const fresh = el("div", { class: "view" });
    await renderWorkout(fresh);
    const freshPager = fresh.querySelector(".wpager");
    if (oldView) oldView.replaceWith(fresh); else main.appendChild(fresh);
    if (freshPager) freshPager.scrollTop = workoutScrollTop;
  }
  // An exercise was added/removed/retyped: update Workout in place, else render.
  function afterExerciseChange() {
    if (state.tab === "workout") return refreshWorkoutInPlace();
    renderMain();
  }

  // Redesigned nutrition tab: a vertical card pager — Overview, then one card
  // per meal section, then a Trends card. Swipe up/down; dots on the right.
  async function renderNutrition(view) {
    const NCHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
    const NUP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>';
    const S = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
    const NICONS = {
      overview: `<svg ${S}><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>`,
      breakfast: `<svg ${S}><path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><line x1="23" y1="22" x2="1" y2="22"/><polyline points="8 6 12 2 16 6"/></svg>`,
      lunch: `<svg ${S}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`,
      dinner: `<svg ${S}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
      snack: `<svg ${S}><path d="M12 8c-1.6-2.6-4.6-3-6.6-1S3.4 12 5 15c1.2 2.4 2.7 4 4 4 1 0 1.5-.6 3-.6s2 .6 3 .6c1.3 0 2.8-1.6 4-4 .8-1.6 1.1-3.3.5-4.9"/><path d="M12 8c.3-2.3 1.9-3.9 3.9-3.9"/></svg>`,
      pre_workout: `<svg ${S}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
      post_workout: `<svg ${S}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
      other: `<svg ${S}><path d="M3 2v7a2 2 0 0 0 2 2 2 2 0 0 0 2-2V2"/><path d="M6 2v20"/><path d="M17 2c-1.7 0-3 2-3 5 0 2.5 1 4 2 4v11"/></svg>`,
      supplements: `<svg ${S}><path d="M10.5 20.5 3.5 13.5a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7z"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/></svg>`,
      trends: `<svg ${S}><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>`
    };
    const panelIcon = (key) => el("span", { class: "npanel-icon", html: NICONS[key] || NICONS.other });

    const [meals, supplements, suppLogs, savedMeals] = await Promise.all([
      Storage.getMeals(), Storage.getSupplements(), Storage.getSupplementLogs(), Storage.getMealTemplates()
    ]);
    const savedCount = (savedMeals || []).length;
    const today = U.todayISO();
    const todays = meals.filter(m => m.date === today);
    const energy = await resolveEnergyBudget(today);
    const macroGoals = await resolveMacroGoals(today, energy);
    const goal = energy.goal || 2200;
    const eaten = todays.reduce((s, m) => s + (m.kcal || 0), 0);
    const remaining = goal - eaten;
    const over = eaten > goal;
    const pct = goal > 0 ? Math.min(100, (eaten / goal) * 100) : 0;
    const dayMacros = U.sumMacros(todays);
    const groups = U.groupMealsBySection(todays);
    const isPersonal = targetsArePersonal(energy);
    const dateEyebrow = U.formatDate(today, { weekday: "short" }).toUpperCase();

    // Supplements are a separate daily "taken" checklist (not calorie foods).
    const todaySuppLogs = suppLogs.filter(l => l.date === today);
    const takenSuppIds = new Set(todaySuppLogs.map(l => l.supplementId));
    const suppSorted = supplements.slice().sort((a, b) =>
      String(a.name || "").localeCompare(String(b.name || ""), undefined, { sensitivity: "base" }));

    // Cards: core meals always, extras only when used, then Supplements, then Trends.
    const CORE = ["breakfast", "lunch", "dinner", "snack"];
    const EXTRAS = ["pre_workout", "post_workout", "other"];
    const mealSections = [
      ...CORE,
      ...EXTRAS.filter(k => (groups[k] || []).length)
    ];
    // Next meal to nudge: first with nothing logged, else the first card.
    const nextSection = mealSections.find(k => !(groups[k] || []).length) || mealSections[0];

    // ---- Supplement "taken" state, updated in place (no full re-render) ----
    const suppTotal = suppSorted.length;
    // Elements that display the taken count in various formats; refreshed on toggle.
    const suppCountEls = []; // { el, fmt(taken, total) }
    function bindSuppCount(node, fmt) { suppCountEls.push({ el: node, fmt }); node.textContent = fmt(takenSuppIds.size, suppTotal); return node; }
    function refreshSuppCounts() { for (const r of suppCountEls) r.el.textContent = r.fmt(takenSuppIds.size, suppTotal); }
    const suppPainters = {}; // supplementId -> repaint its row in place
    async function toggleSuppInPlace(s) {
      const t = U.todayISO();
      const existing = todaySuppLogs.find(l => l.supplementId === s.id && l.date === t);
      if (existing) {
        await Storage.deleteSupplementLog(existing.id);
        const i = todaySuppLogs.indexOf(existing); if (i >= 0) todaySuppLogs.splice(i, 1);
        takenSuppIds.delete(s.id);
        toast(`${s.name} unmarked`);
      } else {
        const logObj = { id: U.uid(), date: t, supplementId: s.id, name: s.name, dose: s.defaultDose ?? null, unit: s.unit || "serving", time: U.nowMealTime(), taken: true, savedAt: Date.now() };
        await Storage.saveSupplementLog(logObj);
        todaySuppLogs.push(logObj);
        takenSuppIds.add(s.id);
        toast(`${s.name} logged`);
      }
      suppPainters[s.id] && suppPainters[s.id]();
      refreshSuppCounts();
      refreshRemindersCard();
    }
    const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

    // Everything still "to do" today whose reminder time has arrived.
    function collectDueReminders() {
      const items = [];
      for (const s of suppSorted) {
        if (takenSuppIds.has(s.id)) continue;
        const st = reminderStatus(s.reminderTime);
        if (st && st.due) items.push({ kind: "supp", id: s.id, name: s.name, time: st.time, overdue: st.overdue, s });
      }
      const mr = state.prefs.mealReminders || {};
      for (const key of CORE) {
        const st = reminderStatus(mr[key]);
        if (!st || !st.due) continue;
        if ((groups[key] || []).length) continue;
        items.push({ kind: "meal", key, name: U.MEAL_SECTIONS[key].label, time: st.time, overdue: st.overdue });
      }
      items.sort((a, b) => (Number(b.overdue) - Number(a.overdue)) || a.time.localeCompare(b.time));
      return items;
    }

    // One supplement row on the Supplements panel — repaints itself in place on toggle.
    function suppRow(s) {
      const nameEl = el("div", { class: "nfood-name" }, s.name);
      const metaEl = el("div", { class: "nfood-meta" });
      const mainBtn = el("button", { class: "nfood-main", type: "button", title: "Edit", on: { click: () => openSupplementForm(s) } }, nameEl, metaEl);
      const chipEl = s.reminderTime ? el("span", { class: "supp-remind-chip" }) : null;
      const takeBtn = el("button", { class: "supp-take", type: "button", "data-testid": "supp-take-" + s.id });
      takeBtn.addEventListener("click", () => toggleSuppInPlace(s));
      const delBtn = el("button", {
        class: "nfood-del", type: "button", "aria-label": `Remove ${s.name}`, html: icons.x,
        on: { click: async () => {
          if (!(await confirmDialog(`Remove “${s.name}” from your list?`, { title: "Remove supplement?", okLabel: "Remove", danger: true }))) return;
          for (const l of todaySuppLogs.filter(x => x.supplementId === s.id)) await Storage.deleteSupplementLog(l.id);
          await Storage.deleteSupplement(s.id);
          toast("Supplement removed"); renderMain();
        } }
      });
      const row = el("div", { class: "nfood supp-row" }, mainBtn, chipEl, takeBtn, delBtn);
      function paint() {
        const taken = takenSuppIds.has(s.id);
        const log = todaySuppLogs.find(l => l.supplementId === s.id);
        metaEl.textContent = formatSupplementDose(s) + (taken && log?.time ? ` · ${log.time}` : "") + (s.notes ? ` · ${s.notes}` : "");
        row.classList.toggle("is-taken", taken);
        takeBtn.className = "supp-take" + (taken ? " is-on" : "");
        clear(takeBtn);
        if (taken) takeBtn.appendChild(el("span", { class: "supp-take-ic", html: CHECK }));
        takeBtn.appendChild(el("span", {}, taken ? "Taken" : "Take"));
        if (chipEl) {
          const st = reminderStatus(s.reminderTime);
          chipEl.style.display = taken ? "none" : "";
          chipEl.className = "supp-remind-chip" + (st && st.overdue ? " is-overdue" : (st && st.due ? " is-due" : ""));
          clear(chipEl);
          chipEl.appendChild(el("span", { class: "supp-remind-ic", html: bellIcon }));
          chipEl.appendChild(el("span", {}, st ? ((st.due ? (st.overdue ? "Overdue " : "Due ") : "") + st.time) : ""));
        }
      }
      suppPainters[s.id] = paint;
      paint();
      return row;
    }

    const screen = el("div", { class: "npager-screen" });
    // Every screen needs one top-level heading. This tab had none: the dock
    // tells a sighted user where they are, and told a reader nothing. Hidden
    // because the layout already says it — the panels carry their own h2s.
    screen.appendChild(el("h1", { class: "sr-only" }, "Nutrition"));
    const pager = el("div", { class: "npager", "data-testid": "npager" });
    const dots = el("div", { class: "npager-dots" });
    screen.appendChild(pager);
    screen.appendChild(dots);

    const panelKeys = ["overview", ...mealSections, "supplements", "trends"];
    let activeIdx = 0;

    function goToPanel(i) {
      const p = pager.children[i];
      if (p) { nutritionScrollKey = panelKeys[i]; pager.scrollTo({ top: p.offsetTop, behavior: "smooth" }); }
    }

    // Wrap the pager at both ends: pulling down on Overview lands on Trends
    // (where the past-day list lives), pulling up past Trends returns to
    // Overview. Without this the history sits six panels away from the screen
    // you always start on. Only fires when the pager was already pinned to an
    // edge when the drag started, so mid-panel scrolling never triggers it.
    function initPagerWrap() {
      const EDGE = 3;       // px tolerance for "at the end"
      const PULL = 72;      // px of overscroll drag before we wrap
      let sy = 0, atTop = false, atBottom = false, armed = false;
      const maxTop = () => pager.scrollHeight - pager.clientHeight;
      pager.addEventListener("touchstart", (e) => {
        if (e.touches.length !== 1) { armed = false; return; }
        // Sheets and overlays own the gesture while open.
        if (document.querySelector(".modal-overlay, .wsheet-overlay, .qa-overlay, .qa-fork-overlay")) { armed = false; return; }
        sy = e.touches[0].clientY;
        atTop = pager.scrollTop <= EDGE;
        atBottom = pager.scrollTop >= maxTop() - EDGE;
        armed = atTop || atBottom;
      }, { passive: true });
      pager.addEventListener("touchend", (e) => {
        if (!armed) return;
        armed = false;
        const dy = e.changedTouches[0].clientY - sy;
        // Still pinned at the edge? A real scroll would have moved us off it.
        if (atTop && dy > PULL && pager.scrollTop <= EDGE) goToPanel(panelKeys.length - 1);
        else if (atBottom && dy < -PULL && pager.scrollTop >= maxTop() - EDGE) goToPanel(0);
      }, { passive: true });
    }

    const idxOf = (key) => panelKeys.indexOf(key);
    function panelIndexForSection(key) { return idxOf(key); }
    function nextLabelFor(nk) {
      if (nk === "trends") return "See trends";
      if (nk === "supplements") return "Supplements";
      return `Log ${U.MEAL_SECTIONS[nk].label}`;
    }

    const panelLabel = (k) => k === "overview" ? "Overview"
      : k === "supplements" ? "Supplements"
      : k === "trends" ? "Trends & past days"
      : (U.MEAL_SECTIONS[k] ? U.MEAL_SECTIONS[k].label : k);

    function renderDots() {
      clear(dots);
      panelKeys.forEach((k, i) => {
        // The dot is 7px, which is far below a usable tap target, so the
        // button is padded out to ~44px and only its ::before is the dot.
        dots.appendChild(el("button", {
          class: "npager-dot" + (i === activeIdx ? " active" : ""),
          type: "button", "data-idx": String(i),
          "aria-label": panelLabel(k),
          "aria-current": i === activeIdx ? "true" : null,
          title: panelLabel(k),
          on: { click: () => goToPanel(i) }
        }));
      });
    }
    function syncDots() {
      for (const d of Array.from(dots.children)) {
        d.classList.toggle("active", Number(d.getAttribute("data-idx")) === activeIdx);
      }
    }

    // ---- reusable bits ----
    const macroTxt = (p, c, f) => `${Math.round(p || 0)}P · ${Math.round(c || 0)}C · ${Math.round(f || 0)}F`;

    function macroCard(label, val, goalVal, cls) {
      const p = goalVal > 0 ? Math.min(100, (val / goalVal) * 100) : 0;
      return el("div", { class: "nmacro-card" },
        el("div", { class: "nmacro-label" }, label),
        el("div", { class: "nmacro-val" }, `${Math.round(val || 0)}`,
          el("span", { class: "nmacro-goal" }, goalVal > 0 ? `/${Math.round(goalVal)}g` : "g")),
        el("div", { class: "nmacro-bar" }, el("div", { class: "nmacro-fill " + cls, style: `width:${p}%` }))
      );
    }

    // One node on the meals timeline rail.
    function timelineNode({ badge, color, name, sub, kcal, logged, onClick }) {
      return el("button", { class: "ntl-item", type: "button", on: { click: onClick } },
        el("div", { class: "ntl-rail" },
          el("div", { class: "ntl-node" + (logged ? " is-logged" : ""), style: "--meal-color:" + color }, badge)
        ),
        el("div", { class: "ntl-content" },
          el("div", { class: "ntl-main" },
            el("div", { class: "ntl-name" }, name),
            el("div", { class: "ntl-sub" }, sub)
          ),
          kcal != null ? el("div", { class: "ntl-kcal" + (logged ? "" : " is-zero") }, String(kcal)) : null,
          el("span", { class: "ntl-chev", html: NCHEV })
        )
      );
    }
    function mealTimelineItem(key) {
      const items = groups[key] || [];
      const kcal = items.reduce((s, m) => s + (m.kcal || 0), 0);
      const meta = U.MEAL_SECTIONS[key];
      // If a reminder is set for this section and nothing's logged past its time, flag it.
      let sub = items.length ? `${items.length} item${items.length === 1 ? "" : "s"}` : "Not logged";
      if (!items.length) {
        const st = reminderStatus((state.prefs.mealReminders || {})[key]);
        if (st && st.due) sub = (st.overdue ? "Overdue · " : "Due · ") + st.time;
      }
      return timelineNode({
        badge: meta.short, color: mealColor(key), name: meta.label,
        sub, kcal, logged: kcal > 0,
        onClick: () => goToPanel(panelIndexForSection(key))
      });
    }

    function mealPanel(key) {
      const items = groups[key] || [];
      const meta = U.MEAL_SECTIONS[key];
      const kcal = items.reduce((s, m) => s + (m.kcal || 0), 0);
      const mac = U.sumMacros(items);
      const panel = el("div", { class: "npanel", "data-key": key });
      panel.appendChild(el("div", { class: "npanel-head" },
        panelIcon(key),
        el("div", { class: "npanel-head-text" },
          el("div", { class: "npanel-eyebrow" }, dateEyebrow),
          el("h2", { class: "npanel-title" }, meta.label)
        ),
        el("div", { class: "npanel-head-right" },
          el("div", { class: "npanel-head-kcal" }, String(kcal)),
          el("div", { class: "npanel-head-sub" }, `${items.length} item${items.length === 1 ? "" : "s"}`)
        )
      ));
      const card = el("div", { class: "ncard" });
      card.appendChild(el("div", { class: "ncard-head" },
        el("span", { class: "ncard-badge" }, meta.short),
        el("div", { class: "ncard-head-main" },
          el("div", { class: "ncard-head-name" }, meta.label),
          el("div", { class: "ncard-head-macros" }, mac.hasMacros ? macroTxt(mac.protein, mac.carbs, mac.fat) : "No macros yet")
        ),
        el("div", { class: "ncard-head-kcal" }, String(kcal), el("span", { class: "ncard-head-kcal-unit" }, "KCAL"))
      ));
      const list = el("div", { class: "ncard-list" });
      if (!items.length) {
        list.appendChild(el("div", { class: "ncard-empty" },
          el("div", { class: "ncard-empty-title" }, "Nothing logged yet"),
          el("div", { class: "ncard-empty-sub" }, `Add your first item for ${meta.label.toLowerCase()}.`)
        ));
      } else {
        for (const m of items) {
          const hasMac = (m.protein || m.carbs || m.fat);
          const mtime = U.normalizeMealTime(m.time);
          // Only the window pattern says anything about a single item, and
          // only when that item fell outside it. Everything already inside the
          // window gets no mark — a row of green ticks is a score.
          const planHit = window.DietPlan ? DietPlan.checkMeal(activePlan(), activePlanConfig(), m) : null;
          const outside = planHit && planHit.state === "outside" ? planHit : null;
          list.appendChild(el("div", { class: "nfood" },
            el("button", { class: "nfood-main", type: "button", title: "Edit", on: { click: () => openMealForm(m) } },
              el("div", { class: "nfood-name" }, m.name),
              hasMac ? el("div", { class: "nfood-meta" }, `${Math.round(m.protein || 0)}P ${Math.round(m.carbs || 0)}C ${Math.round(m.fat || 0)}F`) : null,
              outside ? el("div", { class: "nfood-plan", "data-testid": "meal-plan-chip", title: outside.detail }, outside.label) : null
            ),
            // Sibling of nfood-main, not a child — a button can't nest in a button.
            mtime ? el("button", {
              class: "meal-time-chip nfood-time", type: "button",
              "data-testid": "meal-time-chip", title: "Change when this was eaten",
              "aria-label": `Eaten at ${mtime} — change`,
              on: { click: (e) => { e.stopPropagation(); editMealWhen(m, async () => afterNutritionChange()); } }
            }, mtime) : null,
            el("div", { class: "nfood-kcal" }, String(m.kcal || 0)),
            el("button", {
              class: "nfood-del", type: "button", "aria-label": `Remove ${m.name}`, html: icons.x,
              on: { click: async () => { await Storage.deleteMeal(m.id); toast(`Removed ${m.name}`); afterNutritionChange(); } }
            })
          ));
        }
      }
      card.appendChild(list);
      panel.appendChild(card);

      const foot = el("div", { class: "npanel-foot" });
      foot.appendChild(el("div", { class: "npanel-foot-row" },
        el("button", { class: "btn btn-primary btn-block nadd-btn", on: { click: () => openMealFork(key) } },
          el("span", { html: icons.plus }), "Add food"),
        el("button", { class: "btn nsaved-btn", title: "Log a saved meal", on: { click: () => openSavedMealsSheet(key) } },
          el("span", { html: icons.bookmark }), "Saved")
      ));
      const ni = panelIndexForSection(key) + 1;
      if (ni < panelKeys.length) {
        foot.appendChild(el("button", { class: "btn btn-ghost btn-sm nnext-btn", on: { click: () => goToPanel(ni) } },
          el("span", { html: NUP }), nextLabelFor(panelKeys[ni])));
      }
      panel.appendChild(foot);
      return panel;
    }

    // Supplements card — the original daily "taken" checklist (no calories).
    function supplementsPanel() {
      const panel = el("div", { class: "npanel", "data-key": "supplements" });
      const takenCount = takenSuppIds.size;
      panel.appendChild(el("div", { class: "npanel-head" },
        panelIcon("supplements"),
        el("div", { class: "npanel-head-text" },
          el("div", { class: "npanel-eyebrow" }, dateEyebrow),
          el("h2", { class: "npanel-title" }, "Supplements")
        ),
        el("div", { class: "npanel-head-right" },
          bindSuppCount(el("div", { class: "npanel-head-kcal" }), (t, n) => n ? `${t}/${n}` : "0"),
          el("div", { class: "npanel-head-sub" }, "taken")
        )
      ));
      const card = el("div", { class: "ncard" });
      card.appendChild(el("div", { class: "ncard-head" },
        el("span", { class: "ncard-badge" }, "Su"),
        el("div", { class: "ncard-head-main" },
          el("div", { class: "ncard-head-name" }, "Supplements"),
          bindSuppCount(el("div", { class: "ncard-head-macros" }), (t, n) => n ? `${t} of ${n} taken today` : "Daily checklist · no calories")
        )
      ));
      const list = el("div", { class: "ncard-list" });
      if (!suppSorted.length) {
        list.appendChild(el("div", { class: "ncard-empty" },
          el("div", { class: "ncard-empty-title" }, "No supplements yet"),
          el("div", { class: "ncard-empty-sub" }, "Add creatine, vitamin D, protein powder — anything you take by hand.")));
      } else {
        for (const s of suppSorted) list.appendChild(suppRow(s));
      }
      card.appendChild(list);
      panel.appendChild(card);
      const foot = el("div", { class: "npanel-foot" });
      foot.appendChild(el("button", { class: "btn btn-primary btn-block nadd-btn", on: { click: () => openSupplementForm(null) } },
        el("span", { html: icons.plus }), "Add supplement"));
      const ni = idxOf("supplements") + 1;
      if (ni < panelKeys.length) {
        foot.appendChild(el("button", { class: "btn btn-ghost btn-sm nnext-btn", on: { click: () => goToPanel(ni) } },
          el("span", { html: NUP }), nextLabelFor(panelKeys[ni])));
      }
      panel.appendChild(foot);
      return panel;
    }

    // ---- Overview panel ----
    const ov = el("div", { class: "npanel npanel-overview" });
    ov.appendChild(el("div", { class: "npanel-head" },
      panelIcon("overview"),
      el("div", { class: "npanel-head-text" },
        el("div", { class: "npanel-eyebrow" }, dateEyebrow),
        el("h2", { class: "npanel-title" }, "Overview")
      ),
      el("div", { class: "npanel-head-right" },
        el("div", { class: "npanel-head-kcal accent" }, (remaining >= 0 ? remaining : Math.abs(remaining)).toLocaleString("en-GB")),
        el("div", { class: "npanel-head-sub" }, remaining >= 0 ? "kcal left" : "kcal over")
      )
    ));

    // Saved meals — quick re-log, given the prominent top spot. Logging itself
    // now lives on the donut's + control below.
    const savedHeroIc = el("span", { class: "nsaved-hero-ic" + (pulseSavedHero ? " save-pulse" : ""), html: icons.bookmark });
    pulseSavedHero = false;
    ov.appendChild(el("div", { class: "nsaved-row" },
      el("button", {
        class: "nsaved-hero", type: "button", "data-testid": "saved-hero",
        title: "Log a saved meal", on: { click: () => openSavedMealsSheet() }
      },
        el("span", { class: "nsaved-hero-shine" }),
        savedHeroIc,
        el("span", { class: "nsaved-hero-text" },
          el("span", { class: "nsaved-hero-title" }, "Saved meals"),
          el("span", { class: "nsaved-hero-sub" }, savedCount ? `${savedCount} saved · tap to re-log` : "Bookmark a meal to re-log it fast")
        ),
        savedCount ? el("span", { class: "nsaved-hero-count" }, String(savedCount)) : el("span", { class: "nsaved-hero-chev", html: NCHEV })
      ),
      // Compact secondary control — set meal reminder times (low-frequency config).
      el("button", {
        class: "nsaved-remind", type: "button", title: "Meal reminder times",
        "aria-label": "Meal reminder times", "data-testid": "reminder-times-btn",
        on: { click: () => openReminderSettings() }
      }, el("span", { class: "nsaved-remind-ic", html: bellIcon }))
    ));

    // Reminders nudge — what's still to do today whose time has arrived. Rebuilt in place.
    const remindersCard = el("div", { class: "nremind-card", "data-testid": "reminders-card" });
    function refreshRemindersCard() {
      const due = collectDueReminders();
      clear(remindersCard);
      if (!due.length) { remindersCard.style.display = "none"; return; }
      remindersCard.style.display = "";
      const overdueN = due.filter(d => d.overdue).length;
      remindersCard.appendChild(el("div", { class: "nremind-head" },
        el("span", { class: "nremind-ic", html: bellIcon }),
        el("div", { class: "nremind-title" }, "Reminders"),
        el("div", { class: "nremind-count" + (overdueN ? " is-overdue" : "") }, String(due.length)),
        el("button", { class: "nremind-edit", type: "button", title: "Reminder times", on: { click: () => openReminderSettings() } }, "Edit")
      ));
      for (const item of due) {
        const when = (item.overdue ? "Overdue" : "Due") + " · " + item.time;
        remindersCard.appendChild(el("div", { class: "nremind-item" + (item.overdue ? " is-overdue" : "") },
          el("div", { class: "nremind-item-main" },
            el("div", { class: "nremind-item-name" }, item.kind === "supp" ? item.name : `Log ${item.name}`),
            el("div", { class: "nremind-item-when" }, when)
          ),
          item.kind === "supp"
            ? el("button", { class: "nremind-act", type: "button", on: { click: () => toggleSuppInPlace(item.s) } }, "Take")
            : el("button", { class: "nremind-act", type: "button", on: { click: () => openMealFork(item.key) } }, "Log")
        ));
      }
    }
    refreshRemindersCard();
    ov.appendChild(remindersCard);

    // Meals hub — the donut flanked by log (+) / remove (−), lifted above the
    // ring so logging is reachable in the first screenful. Captions + a pulse
    // on + make the actions legible; − is disabled until there's a meal to remove.
    const donutEntries = mealSections.map(key => ({
      key, label: U.MEAL_SECTIONS[key].label,
      kcal: (groups[key] || []).reduce((s, m) => s + (m.kcal || 0), 0),
      color: mealColor(key)
    }));
    const anyLogged = donutEntries.some(e => e.kcal > 0);
    const MINUS_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><line x1="6" y1="12" x2="18" y2="12"/></svg>';
    const PLUS_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><line x1="12" y1="6" x2="12" y2="18"/><line x1="6" y1="12" x2="18" y2="12"/></svg>';
    const fab = (side, label, svg, testid, opts) => el("div", { class: "ndonut-fab-wrap" },
      el("button", Object.assign({ class: "ndonut-fab ndonut-" + side, type: "button", "aria-label": label, title: label, "data-testid": testid }, opts),
        el("span", { class: "ndonut-fab-ic", html: svg })),
      el("span", { class: "ndonut-fab-cap" }, label.split(" ")[0])
    );
    const minusBtn = fab("minus", "Remove a meal", MINUS_SVG, "donut-remove",
      anyLogged ? { on: { click: () => openRemoveMealSheet() } } : { disabled: "", "aria-disabled": "true" });
    const plusBtn = fab("plus" + (anyLogged ? "" : " is-pulsing"), "Log a meal", PLUS_SVG, "donut-add",
      { on: { click: () => openMealFork(nextSection) } });
    ov.appendChild(el("div", { class: "ndonut-row nmeals-hub" },
      minusBtn,
      buildEnergyHub({ entries: donutEntries, eaten, goal, pct, over, remaining }),
      plusBtn));

    // Legend for the inner ring — without the old separate donut caption the
    // slice colours would be unlabelled.
    if (anyLogged) {
      const legend = el("div", { class: "nhub-legend", "data-testid": "hub-legend" });
      for (const e of donutEntries.filter(x => x.kcal > 0)) {
        legend.appendChild(el("span", { class: "nhub-legend-item" },
          el("span", { class: "nhub-legend-dot", style: `background:${e.color}` }),
          el("span", { class: "nhub-legend-label" }, e.label)));
      }
      ov.appendChild(legend);
    }

    const g = macroGoals.goals || {};
    ov.appendChild(el("div", { class: "nmacro-row" },
      macroCard("Protein", dayMacros.protein, g.protein, "is-protein"),
      macroCard("Carbs", dayMacros.carbs, g.carbs, "is-carbs"),
      macroCard("Fat", dayMacros.fat, g.fat, "is-fat")
    ));
    if (!isPersonal) {
      const needsProfile = !energy.profileReady;
      ov.appendChild(el("div", { class: "energy-setup-banner nsetup" },
        el("div", { class: "text-sm text-muted" },
          needsProfile
            ? "These numbers are a starter estimate. Set up your profile to personalise them."
            : "Log your bodyweight so room and macros use your numbers."),
        el("button", {
          class: "btn btn-primary btn-sm mt-8",
          on: { click: () => { if (needsProfile) openSettings(); else { goTab("home"); setTimeout(scrollToBodyweightCard, 60); } } }
        }, needsProfile ? "Set up" : "Log bodyweight")
      ));
    }
    // Today against the eating pattern chosen as a guideline, if there is one.
    // Below the macro tiles because the app's own targets come first — this
    // reports a rule the user set, it does not replace anything.
    {
      const planCard = buildDietPlanCard(meals, today);
      if (planCard) ov.appendChild(planCard);
    }

    const mealsWrap = el("div", { class: "nmeals-today" });
    mealsWrap.appendChild(el("div", { class: "nmeals-head" },
      el("div", { class: "nsection-label" }, "MEALS TODAY")
    ));
    // Vertical timeline rail — meals flow down the day, colour-keyed to the donut hub above.
    const timeline = el("div", { class: "nmeal-timeline" });
    for (const key of mealSections) timeline.appendChild(mealTimelineItem(key));
    timeline.appendChild(timelineNode({
      badge: "Su", color: mealColor("supplements"), name: "Supplements",
      sub: suppTotal ? bindSuppCount(el("div"), (t, n) => `${t} of ${n} taken`) : "None added",
      kcal: null, logged: suppTotal > 0 && takenSuppIds.size > 0,
      onClick: () => goToPanel(idxOf("supplements"))
    }));
    mealsWrap.appendChild(timeline);
    ov.appendChild(mealsWrap);

    // Past days — a short strip on the landing screen. The full list lives in
    // Trends, but nothing here hinted that earlier days can be opened and
    // edited at all, so the recent few get a one-tap route from the top.
    {
      const byDate = {};
      for (const m of meals) {
        if (m.date === today) continue;
        const b = byDate[m.date] || (byDate[m.date] = { kcal: 0, count: 0 });
        b.kcal += (m.kcal || 0);
        b.count++;
      }
      const recent = Object.entries(byDate).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 3);
      // Show the strip as soon as anything has ever been logged: a day you
      // forgot entirely has no meals, so it never appears in any history list
      // — the "another day" card is the only way to reach it.
      if (recent.length || meals.length) {
        const past = el("div", { class: "npast", "data-testid": "overview-past-days" });
        past.appendChild(el("div", { class: "nmeals-head" },
          el("div", { class: "nsection-label" }, "PAST DAYS"),
          recent.length ? el("button", {
            class: "npast-all", type: "button", "data-testid": "past-days-all",
            on: { click: () => goToPanel(idxOf("trends")) }
          }, "See all") : null
        ));
        const row = el("div", { class: "npast-row" });
        for (const [d, b] of recent) {
          const pctDay = goal ? Math.round(b.kcal / goal * 100) : 0;
          row.appendChild(el("button", {
            class: "npast-card", type: "button",
            "data-date": d, "data-testid": "past-day-card",
            title: `Open ${U.formatDate(d)}`,
            on: { click: () => openNutritionDayDetail(d) }
          },
            el("div", { class: "npast-day" }, U.formatDate(d).replace(/,.*/, "")),
            el("div", { class: "npast-date" }, U.formatDate(d).replace(/^[^,]*,\s*/, "")),
            el("div", { class: "npast-kcal" }, String(b.kcal)),
            el("div", { class: "npast-pct" + (b.kcal > goal ? " is-over" : "") }, goal ? `${pctDay}%` : `${b.count}`)
          ));
        }
        // Any date, not just ones with meals already on them.
        row.appendChild(el("button", {
          class: "npast-card npast-more", type: "button", "data-testid": "past-day-pick",
          title: "Open another day",
          on: { click: () => openDayPicker() }
        },
          el("div", { class: "npast-more-ic", html: icons.plus }),
          el("div", { class: "npast-more-label" }, "Another day")
        ));
        past.appendChild(row);
        past.appendChild(el("div", { class: "npast-hint text-xs text-faint" },
          recent.length
            ? "Tap a day to add, retime or remove meals."
            : "Forgot to log a day? Open it here and fill it in."));
        ov.appendChild(past);
      }
    }

    const ovFoot = el("div", { class: "npanel-foot" });
    ovFoot.appendChild(el("button", { class: "btn btn-primary btn-block", on: { click: () => goToPanel(panelIndexForSection(nextSection)) } },
      el("span", { html: NUP }), `Log ${U.MEAL_SECTIONS[nextSection].label}`));
    ov.appendChild(ovFoot);
    pager.appendChild(ov);

    // ---- Meal panels ----
    for (const key of mealSections) pager.appendChild(mealPanel(key));

    // ---- Supplements panel (daily "taken" checklist) ----
    pager.appendChild(supplementsPanel());

    // ---- Trends panel ----
    const trends = el("div", { class: "npanel npanel-trends" });
    trends.appendChild(el("div", { class: "npanel-head" },
      panelIcon("trends"),
      el("div", { class: "npanel-head-text" },
        el("div", { class: "npanel-eyebrow" }, "LAST 14 DAYS"),
        el("h2", { class: "npanel-title" }, "Trends")
      )
    ));
    const byDate = {};
    for (const m of meals) { byDate[m.date] = (byDate[m.date] || 0) + (m.kcal || 0); }
    const tVals = [];
    for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); tVals.push(byDate[U.todayISO(d)] ?? null); }
    const logged = tVals.filter(v => v != null && v > 0);
    const tcard = el("div", { class: "ncard", style: "padding:16px" });
    if (logged.length) {
      const avg = Math.round(logged.reduce((s, v) => s + v, 0) / logged.length);
      tcard.appendChild(el("div", { class: "row-between", style: "margin-bottom:8px" },
        el("div", { class: "ncard-head-name" }, "Calorie trend"),
        el("div", { class: "text-sm text-muted" }, `Avg ${avg} kcal`)));
      tcard.appendChild(sparkline(tVals, { width: 320, height: 60, goal }));
      tcard.appendChild(el("div", { class: "text-xs text-faint", style: "margin-top:6px" },
        `Dashed line = goal (${goal} kcal). Only logged days count toward the average.`));
    } else {
      tcard.appendChild(el("div", { class: "ncard-empty" },
        el("div", { class: "ncard-empty-title" }, "No history yet"),
        el("div", { class: "ncard-empty-sub" }, "Log meals across a few days to see your calorie trend.")));
    }
    trends.appendChild(tcard);
    // Recent days
    const past = meals.filter(m => m.date !== today);
    if (past.length) {
      const pastBy = {};
      for (const m of past) { pastBy[m.date] = (pastBy[m.date] || 0) + (m.kcal || 0); }
      const rows = Object.entries(pastBy).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 14);
      const rcard = el("div", { class: "ncard", style: "padding:8px 4px; margin-top:12px" });
      rcard.appendChild(el("div", { class: "nsection-label", style: "padding:8px 12px 4px" }, "RECENT DAYS"));
      for (const [date, kc] of rows) {
        rcard.appendChild(el("button", { class: "nfood", type: "button", style: "width:100%; text-align:left", on: { click: () => openNutritionDayDetail(date) } },
          el("div", { class: "nfood-main" }, el("div", { class: "nfood-name" }, U.formatDate(date, { weekday: "short" }))),
          el("div", { class: "nfood-kcal" }, `${kc}`),
          el("span", { class: "nmeal-row-chev", html: NCHEV })
        ));
      }
      trends.appendChild(rcard);
    }
    pager.appendChild(trends);

    // ---- Dots + scroll sync ----
    renderDots();
    initPagerWrap();
    let sRAF = null;
    pager.addEventListener("scroll", () => {
      nutritionScrollTop = pager.scrollTop; // exact position for in-place refresh
      if (sRAF) return;
      sRAF = requestAnimationFrame(() => {
        sRAF = null;
        const center = pager.scrollTop + pager.clientHeight / 2;
        let best = 0, bd = Infinity;
        for (let i = 0; i < pager.children.length; i++) {
          const cc = pager.children[i].offsetTop + pager.children[i].offsetHeight / 2;
          const d = Math.abs(cc - center);
          if (d < bd) { bd = d; best = i; }
        }
        if (best !== activeIdx) { activeIdx = best; nutritionScrollKey = panelKeys[best]; syncDots(); }
      });
    }, { passive: true });

    view.appendChild(screen);
    // Restore exact scroll (set synchronously to avoid a painted frame at 0),
    // falling back to the remembered panel the first time we land here.
    // Consumed by this render, and read by both restoreScroll passes — the
    // first runs before layout has settled, so the rAF one is the one that
    // usually lands.
    const wantPanel = pendingNutritionPanel;
    pendingNutritionPanel = null;
    const restoreScroll = () => {
      const ri = wantPanel && panelKeys.includes(wantPanel) ? idxOf(wantPanel) : -1;
      if (ri >= 0 && pager.children[ri]) {
        // Asked for, so it outranks both the remembered offset and the
        // remembered panel, and it updates them so the next in-place refresh
        // does not undo it.
        pager.scrollTop = pager.children[ri].offsetTop;
        nutritionScrollTop = pager.scrollTop;
        nutritionScrollKey = wantPanel;
      } else if (nutritionScrollTop > 0) { pager.scrollTop = nutritionScrollTop; }
      else if (nutritionScrollKey && panelKeys.includes(nutritionScrollKey)) {
        const k = idxOf(nutritionScrollKey);
        if (pager.children[k]) pager.scrollTop = pager.children[k].offsetTop;
      }
      // keep dots in sync with wherever we landed
      const center = pager.scrollTop + pager.clientHeight / 2;
      let best = 0, bd = Infinity;
      for (let i = 0; i < pager.children.length; i++) {
        const cc = pager.children[i].offsetTop + pager.children[i].offsetHeight / 2;
        const d = Math.abs(cc - center);
        if (d < bd) { bd = d; best = i; }
      }
      activeIdx = best; syncDots();
    };
    restoreScroll();
    requestAnimationFrame(restoreScroll);
    // Count-ups must run after this async render has attached its numbers.
    requestAnimationFrame(() => { if (document.contains(view)) applyCountUps(view); });
    return;
  }

  // Full intake breakdown for a past (or any) nutrition day — meal list + section totals.
  async function openNutritionDayDetail(date) {
    const meals = await Storage.getMeals();
    const dayMeals = meals
      .filter(m => m.date === date)
      .sort((a, b) => {
        const sa = U.MEAL_SECTION_ORDER.indexOf(U.normalizeMealSection(a.section));
        const sb = U.MEAL_SECTION_ORDER.indexOf(U.normalizeMealSection(b.section));
        const oa = sa < 0 ? 99 : sa;
        const ob = sb < 0 ? 99 : sb;
        if (oa !== ob) return oa - ob;
        return U.compareMealsByTime(a, b);
      });
    const dayEnergy = await resolveEnergyBudget(date);
    const goal = dayEnergy.goal || 2200;
    const totalKcal = dayMeals.reduce((s, m) => s + (m.kcal || 0), 0);
    const dayMacros = U.sumMacros(dayMeals);
    const macroGoals = await resolveMacroGoals(date, dayEnergy);
    const pct = goal ? Math.min(100, (totalKcal / goal) * 100) : 0;
    const over = totalKcal > goal;
    const remaining = goal - totalKcal;

    const groups = U.groupMealsBySection(dayMeals);

    const body = el("div", { class: "nutrition-day-detail" });

    // Day summary
    const summary = el("div", { class: "card", style: "margin-bottom: 12px; box-shadow: none; border: 1px solid var(--border)" },
      el("div", { class: "row-between", style: "align-items:flex-start" },
        el("div", {},
          el("div", { style: "font-family: var(--font-mono); font-size: 26px; font-weight: 600;" }, `${totalKcal} kcal`),
          el("div", { class: "text-sm text-muted mt-8" },
            `Goal ${goal} kcal · ${remaining >= 0 ? remaining + " remaining" : Math.abs(remaining) + " over"}`
          )
        ),
        el("div", { class: "text-sm text-muted", style: "text-align:right" },
          `${dayMeals.length} ${dayMeals.length === 1 ? "entry" : "entries"}`,
          el("div", { class: "text-xs text-faint mt-8" }, goal ? `${Math.round(totalKcal / goal * 100)}% of goal` : "")
        )
      ),
      el("div", { class: "kcal-progress" },
        el("div", { class: "kcal-progress-fill" + (over ? " over" : ""), style: `width: ${pct}%` })
      )
    );
    summary.appendChild(renderMacroBreakdown(dayMacros, {
      title: "Macros",
      goalHint: macroGoals.hasGoals
        ? (macroGoals.source === "manual" ? "manual targets" : `auto · ${macroGoals.proteinPerKg} g/kg`)
        : null,
      goals: macroGoals.hasGoals ? macroGoals.goals : null,
      emptyText: dayMeals.length ? "No macros logged for this day." : null
    }));
    body.appendChild(summary);

    // Section totals strip — core four always; extras only when used
    const strip = el("div", { class: "nutrition-section-strip" });
    for (const key of U.MEAL_SECTION_ORDER) {
      const items = groups[key] || [];
      if (!U.MEAL_SECTIONS[key].alwaysShow && !items.length) continue;
      const label = U.MEAL_SECTIONS[key].label;
      const kcal = items.reduce((s, m) => s + (m.kcal || 0), 0);
      strip.appendChild(el("div", { class: "nutrition-section-chip" + (items.length ? " has-data" : "") },
        el("div", { class: "nutrition-section-chip-label" }, label),
        el("div", { class: "nutrition-section-chip-kcal" }, items.length ? `${kcal}` : "—")
      ));
    }
    body.appendChild(strip);

    if (dayMeals.length === 0) {
      body.appendChild(emptyState({
        compact: true,
        body: "No meals logged on this day.",
        primaryLabel: "Log meal",
        onPrimary: () => { closeModal(); openMealFork("breakfast", date); },
        primaryTestId: "empty-day-log-meal",
        secondaryLabel: "Saved meals",
        onSecondary: () => { closeModal(); openSavedMealsSheet(null, date); }
      }));
    } else {
      for (const key of U.MEAL_SECTION_ORDER) {
        const items = groups[key] || [];
        if (!items.length) continue;
        const label = U.MEAL_SECTIONS[key].label;
        const kcal = items.reduce((s, m) => s + (m.kcal || 0), 0);
        const sectionMacros = U.sumMacros(items);
        const group = el("div", { class: "meal-group", style: "margin-bottom: 12px" });
        group.appendChild(el("div", { class: "meal-group-header" },
          el("div", {},
            el("div", { class: "meal-group-title" }, label),
            sectionMacros.hasMacros
              ? el("div", { class: "meal-group-macros text-xs text-faint" }, U.formatMacroLine(sectionMacros))
              : null
          ),
          el("div", { class: "meal-group-kcal" }, `${kcal} kcal`)
        ));
        for (const m of items) {
          // Retiming from here can move the meal off this day entirely, so
          // reopen whichever day it landed on.
          const meta = mealMetaLine(m, async (newDate) => {
            closeModal();
            renderMain();
            openNutritionDayDetail(newDate || date);
          });
          group.appendChild(el("div", { class: "meal-item" },
            el("div", { style: "min-width:0; flex:1" },
              el("div", { class: "meal-item-name" }, m.name),
              meta
            ),
            el("div", { class: "row" },
              el("div", { class: "meal-item-kcal" }, `${m.kcal} kcal`),
              el("button", { class: "icon-btn", title: "Edit", on: { click: () => {
                closeModal();
                openMealForm(m);
              } }, html: icons.edit }),
              el("button", { class: "icon-btn", title: "Delete", on: { click: async () => {
                if (!(await confirmDialog(`Delete “${m.name}”?`, { title: "Delete meal?", okLabel: "Delete", danger: true }))) return;
                await Storage.deleteMeal(m.id);
                closeModal();
                // Re-open if other meals remain, else refresh tab
                const left = (await Storage.getMeals()).filter(x => x.date === date);
                if (left.length) openNutritionDayDetail(date);
                else renderMain();
              } }, html: icons.trash })
            )
          ));
        }
        body.appendChild(group);
      }
    }

    // —— Supplements for this day ——
    // The daily checklist used to be today-only, so a day you forgot to tick
    // could never be corrected. Same list, same toggle, bound to this date.
    {
      const supplements = await Storage.getSupplements();
      if (supplements.length) {
        const logs = await Storage.getSupplementLogs();
        const dayLogs = logs.filter(l => l.date === date);
        const taken = new Set(dayLogs.map(l => l.supplementId));
        const sorted = supplements.slice().sort((a, b) =>
          String(a.name || "").localeCompare(String(b.name || ""), undefined, { sensitivity: "base" }));

        const group = el("div", { class: "meal-group", "data-testid": "day-supplements", style: "margin-bottom: 12px" });
        const head = el("div", { class: "meal-group-kcal", "data-testid": "day-supp-count" },
          `${taken.size} of ${sorted.length}`);
        group.appendChild(el("div", { class: "meal-group-header" },
          el("div", {}, el("div", { class: "meal-group-title" }, "Supplements")), head));

        for (const sup of sorted) {
          const row = el("div", { class: "meal-item day-supp-row", "data-supp": sup.id });
          const log = () => dayLogs.find(l => l.supplementId === sup.id);
          const meta = el("div", { class: "meal-item-meta" });
          const btn = el("button", {
            class: "supp-take", type: "button", "data-testid": "day-supp-take",
            "aria-label": `Mark ${sup.name} taken on this day`
          });
          const paint = () => {
            const l = log();
            const on = !!l;
            row.classList.toggle("is-taken", on);
            btn.className = "supp-take" + (on ? " is-on" : "");
            btn.textContent = on ? "Taken" : "Take";
            btn.setAttribute("aria-pressed", on ? "true" : "false");
            meta.textContent = formatSupplementDose(sup) + (on && l.time ? ` · ${l.time}` : "");
            head.textContent = `${taken.size} of ${sorted.length}`;
          };
          btn.addEventListener("click", async () => {
            const l = log();
            if (l) {
              await Storage.deleteSupplementLog(l.id);
              const i2 = dayLogs.indexOf(l); if (i2 >= 0) dayLogs.splice(i2, 1);
              taken.delete(sup.id);
            } else {
              // A backdated tick has no meaningful clock time, so use the
              // supplement's own reminder time when it has one.
              const obj = {
                id: U.uid(), date, supplementId: sup.id, name: sup.name,
                dose: sup.defaultDose ?? null, unit: sup.unit || "serving",
                time: U.normalizeMealTime(sup.reminderTime) || (date === U.todayISO() ? U.nowMealTime() : "09:00"),
                taken: true, savedAt: Date.now()
              };
              await Storage.saveSupplementLog(obj);
              dayLogs.push(obj);
              taken.add(sup.id);
            }
            paint();
            renderMain();
          });
          row.append(
            el("div", { style: "min-width:0; flex:1" },
              el("div", { class: "meal-item-name" }, sup.name), meta),
            btn
          );
          paint();
          group.appendChild(row);
        }
        body.appendChild(group);
      }
    }

    const footer = el("div", {},
      el("button", { class: "btn", on: { click: closeModal } }, "Close"),
      // Re-logging something you eat often is the common case for a past day,
      // so saved meals gets its own route rather than hiding behind the fork.
      el("button", {
        class: "btn", "data-testid": "day-detail-saved",
        on: { click: () => { closeModal(); openSavedMealsSheet(null, date); } }
      }, el("span", { html: icons.bookmark }), "Saved"),
      el("button", { class: "btn btn-primary", "data-testid": "day-detail-add", on: { click: () => {
        closeModal();
        openMealFork("snack", date);
      } } }, el("span", { html: icons.plus }), "Add meal")
    );

    openModal(U.formatDate(date, { year: "numeric", weekday: "long" }), body, footer);
  }

  // ============ Quick Add Meal (curated offline database) ============
  // Tier-1 logging: fuzzy search over ~200 bundled UK meals with portion
  // presets. Everything is an approximate estimate the user can override.
  function qaSectionForNow() {
    const h = new Date().getHours();
    if (h < 11) return "breakfast";
    if (h < 15) return "lunch";
    if (h < 17) return "snack";
    if (h < 21) return "dinner";
    return "snack";
  }

  /** A weight a kitchen scale could plausibly show, or 0. Bounded so a
      fat-fingered 18000 cannot poison the day's totals unnoticed. */
  function clampGrams(v) {
    const n = Math.round(Number(v));
    if (!Number.isFinite(n) || n < 1) return 0;
    return Math.min(n, 2000);
  }

  async function qaLogMeal(name, macros, section, dateHint) {
    const date = dateHint || U.todayISO();
    const meal = {
      id: U.uid(),
      name,
      kcal: macros.kcal || 0,
      protein: macros.protein || 0,
      carbs: macros.carbs || 0,
      fat: macros.fat || 0,
      section: U.normalizeMealSection(section),
      time: date === U.todayISO() ? U.nowMealTime() : U.defaultMealTimeForSection(section, date),
      date,
      notes: "",
      savedAt: Date.now()
    };
    await Storage.saveMeal(meal);
    toast(withPlanNotice(`Logged ${name} · about ${meal.kcal} kcal`, meal));
    afterNutritionChange();
  }

  // Sheet reached from the "−" beside the meals donut: pick a logged meal to remove.
  async function openRemoveMealSheet(dateHint = null) {
    const date = dateHint || U.todayISO();
    const ORDER = ["breakfast", "lunch", "dinner", "snack", "pre_workout", "post_workout", "other"];
    let listEl;
    async function buildList() {
      const meals = (await Storage.getMeals()).filter(m => m.date === date);
      const box = el("div", { class: "remove-meal-list" });
      if (!meals.length) {
        box.appendChild(el("div", { class: "ncard-empty" },
          el("div", { class: "ncard-empty-title" }, "Nothing to remove"),
          el("div", { class: "ncard-empty-sub" }, "No meals are logged for today yet.")));
        return box;
      }
      meals.sort((a, b) =>
        (ORDER.indexOf(U.normalizeMealSection(a.section)) - ORDER.indexOf(U.normalizeMealSection(b.section))) ||
        String(a.time || "").localeCompare(String(b.time || "")));
      for (const m of meals) {
        const meta = U.mealSectionLabel(m.section) + (m.time ? ` · ${m.time}` : "");
        box.appendChild(el("div", { class: "nfood" },
          el("div", { class: "nfood-main" },
            el("div", { class: "nfood-name" }, m.name),
            el("div", { class: "nfood-meta" }, meta)),
          el("div", { class: "nfood-kcal" }, String(m.kcal || 0)),
          el("button", {
            class: "nfood-del", type: "button", "aria-label": `Remove ${m.name}`, html: icons.x,
            on: { click: async () => {
              await Storage.deleteMeal(m.id);
              toast(`Removed ${m.name}`);
              afterNutritionChange();
              const fresh = await buildList();
              listEl.replaceWith(fresh);
              listEl = fresh;
            } }
          })
        ));
      }
      return box;
    }
    listEl = await buildList();
    const footer = el("div", {}, el("button", { class: "btn btn-primary", on: { click: closeModal } }, "Done"));
    openModal("Remove a meal", listEl, footer);
  }

  // Full-screen "fork in the road" for logging a meal — mirrors the + button.
  // Two paths: Quick Meal (search common meals) or Create meal (custom entry).
  function openMealFork(sectionHint = null, dateHint = null) {
    // The third copy of the fork, folded into the shared one. It had drifted
    // already — no focus handling at all, where the + at least had a dialog
    // role — which is exactly the argument for there being one of these.
    const BOLT_ART = `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path class="qa2-bolt" d="M28 5 13 27h9l-3 16 16-23H25z" fill="currentColor" fill-opacity="0.16" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/></svg>`;
    const CREATE_ART = `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><g class="qa2-plus"><path d="M9 28h30a15 15 0 0 1-30 0z" fill="currentColor" fill-opacity="0.16"/><path d="M9 28h30a15 15 0 0 1-30 0z" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><line x1="7" y1="28" x2="41" y2="28" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></g><g class="qa2-plusmark" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"><line x1="24" y1="7" x2="24" y2="19"/><line x1="18" y1="13" x2="30" y2="13"/></g></svg>`;
    const SAVED_ART = `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M13 6h22a3 3 0 0 1 3 3v33l-14-9-14 9V9a3 3 0 0 1 3-3z" fill="currentColor" fill-opacity="0.16" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/></svg>`;
    openForkSheet({
      label: "Log a meal", testid: "meal-fork",
      panels: [
        {
          cls: "qa2-workout", testid: "meal-fork-quick", art: BOLT_ART,
          label: "Quick Meal", sub: "Search common meals and log fast",
          onPick: () => openQuickAdd(sectionHint, dateHint)
        },
        {
          cls: "qa2-saved", testid: "meal-fork-saved", art: SAVED_ART,
          label: "Saved meals", sub: "Re-log something you eat often",
          onPick: () => openSavedMealsSheet(sectionHint, dateHint)
        },
        {
          cls: "qa2-meal", testid: "meal-fork-create", art: CREATE_ART,
          label: "Create meal", sub: "Enter your own calories and macros",
          onPick: () => openMealForm(null, sectionHint || qaSectionForNow(), dateHint)
        }
      ]
    });
  }

  function openQuickAdd(sectionHint = null, dateHint = null) {
    const db = window.MEALS_DB || [];
    const MS = window.MealSearch;
    if (!db.length || !MS) { openMealForm(null, sectionHint || "snack", dateHint); return; }
    const section = U.normalizeMealSection(sectionHint || qaSectionForNow());
    let recents = [];
    let expandedId = null;

    const overlay = el("div", { class: "qa-overlay", on: { click: (e) => { if (e.target === overlay) close(); } } });
    function onEsc(e) { if (e.key === "Escape") { e.preventDefault(); close(); } }
    function close() { document.removeEventListener("keydown", onEsc); overlay.remove(); }
    document.addEventListener("keydown", onEsc);

    const searchI = el("input", {
      class: "input qa-search",
      type: "text",
      placeholder: "Search meals — try \u201cspag bol\u201d",
      "data-testid": "qa-search",
      on: { input: () => { expandedId = null; renderBody(); } }
    });

    const body = el("div", { class: "qa-body" });

    function portionBlock(entry) {
      const labels = ["Small", "Regular", "Large"];
      const row = el("div", { class: "qa-portions" });
      labels.forEach((lab, i) => {
        const grams = entry.g[i];
        const mac = MS.macrosFor(entry, grams);
        row.appendChild(el("button", {
          class: "qa-portion" + (i === 1 ? " qa-portion-mid" : ""),
          "data-testid": `qa-portion-${lab.toLowerCase()}`,
          on: { click: async () => { close(); await qaLogMeal(entry.name, mac, section, dateHint); } }
        },
          el("span", { class: "qa-portion-name" }, lab),
          el("span", { class: "qa-portion-g" }, `${grams} g`),
          el("span", { class: "qa-portion-kcal" }, `\u2248 ${mac.kcal}`)
        ));
      });

      // The scale row. Every entry is stored per-100 g, so any weight is an
      // exact scale, not an estimate \u2014 this is what turns "180 g chicken,
      // 250 g rice" from mental arithmetic into typing two numbers.
      const gramsI = el("input", {
        class: "input qa-grams-input", type: "number", inputmode: "numeric",
        min: "1", max: "2000", step: "1", value: String(entry.g[1]),
        "data-testid": "qa-grams-input",
        "aria-label": `Weight in grams of ${entry.name}`
      });
      const preview = el("span", { class: "qa-grams-preview", "data-testid": "qa-grams-preview" });
      const logBtn = el("button", {
        class: "btn btn-primary qa-grams-log", "data-testid": "qa-grams-log",
        on: { click: async () => {
          const grams = clampGrams(gramsI.value);
          if (!grams) { toast("Enter a weight in grams"); return; }
          const mac = MS.macrosFor(entry, grams);
          close();
          await qaLogMeal(`${entry.name} (${grams} g)`, mac, section, dateHint);
        } }
      }, "Log");
      const updatePreview = () => {
        const grams = clampGrams(gramsI.value);
        if (!grams) { preview.textContent = "\u2014"; return; }
        const mac = MS.macrosFor(entry, grams);
        preview.textContent = `\u2248 ${mac.kcal} kcal \u00b7 P ${Math.round(mac.protein)} \u00b7 C ${Math.round(mac.carbs)} \u00b7 F ${Math.round(mac.fat)}`;
      };
      gramsI.addEventListener("input", updatePreview);
      updatePreview();
      const gramsRow = el("div", { class: "qa-grams-row", "data-testid": "qa-grams-row" },
        el("span", { class: "qa-grams-label" }, "Weighed it?"),
        gramsI,
        el("span", { class: "qa-grams-unit" }, "g"),
        preview,
        logBtn
      );

      const adjust = el("button", {
        class: "qa-adjust", "data-testid": "qa-adjust",
        on: {
          click: () => {
            const mac = MS.macrosFor(entry, entry.g[1]);
            close();
            openMealForm({
              name: entry.name, kcal: mac.kcal, protein: mac.protein, carbs: mac.carbs, fat: mac.fat,
              section, date: dateHint || U.todayISO()
            });
          }
        }
      }, "Adjust before logging");
      return el("div", {}, row, gramsRow, adjust);
    }

    function resultRow(entry) {
      const mac = MS.macrosFor(entry, entry.g[1]);
      const isOpen = expandedId === entry.id;
      const wrap = el("div", { class: "qa-item" + (isOpen ? " open" : "") });
      wrap.appendChild(el("button", {
        class: "qa-row", "data-testid": `qa-result-${entry.id}`,
        on: { click: () => { expandedId = isOpen ? null : entry.id; renderBody(); } }
      },
        el("span", { class: "qa-row-main" },
          el("span", { class: "qa-row-name" }, entry.name),
          el("span", { class: "qa-row-sub" }, `regular ${entry.unit} \u00b7 P ${Math.round(mac.protein)} \u00b7 C ${Math.round(mac.carbs)} \u00b7 F ${Math.round(mac.fat)}`)
        ),
        el("span", { class: "qa-row-kcal" }, `\u2248 ${mac.kcal} kcal`)
      ));
      if (isOpen) wrap.appendChild(portionBlock(entry));
      return wrap;
    }

    function renderBody() {
      body.innerHTML = "";
      const q = searchI.value.trim();
      if (!q) {
        if (recents.length) {
          body.appendChild(el("div", { class: "qa-section-label" }, "Recent"));
          for (const r of recents) {
            body.appendChild(el("button", {
              class: "qa-row", "data-testid": `qa-recent-${r.id}`,
              on: { click: async () => { close(); await qaLogMeal(r.name, r, section, dateHint); } }
            },
              el("span", { class: "qa-row-main" },
                el("span", { class: "qa-row-name" }, r.name),
                el("span", { class: "qa-row-sub" }, `log again \u00b7 P ${Math.round(r.protein || 0)} \u00b7 C ${Math.round(r.carbs || 0)} \u00b7 F ${Math.round(r.fat || 0)}`)
              ),
              el("span", { class: "qa-row-kcal" }, `${r.kcal || 0} kcal`)
            ));
          }
        } else {
          body.appendChild(el("div", { class: "qa-hint text-sm text-faint" },
            "Search around 200 common meals \u2014 try \u201cchicken and rice\u201d, \u201cspag bol\u201d or \u201cporridge\u201d."));
        }
        return;
      }
      const { results, confident } = MS.search(q, db, 8);
      if (!results.length) {
        body.appendChild(el("div", { class: "qa-hint text-sm text-faint" },
          "Nothing close found \u2014 use the link below to log it manually."));
        return;
      }
      if (!confident) {
        body.appendChild(el("div", { class: "qa-section-label" }, "No exact match \u2014 nearest"));
      }
      for (const r of (confident ? results : results.slice(0, 3))) body.appendChild(resultRow(r.entry));
    }

    const sheet = el("div", { class: "qa-sheet", "data-testid": "qa-sheet" },
      el("div", { class: "qa-head" },
        el("div", { class: "qa-title" }, "Quick add meal"),
        el("div", { class: "qa-sub text-xs text-faint" }, "General estimates \u2014 pick a portion, adjust any time")
      ),
      searchI,
      body,
      el("button", {
        class: "qa-manual", "data-testid": "qa-manual-link",
        on: { click: () => { close(); openMealForm(null, section, dateHint); } }
      }, "Log ingredients or create a custom meal")
    );
    overlay.appendChild(sheet);
    document.body.appendChild(overlay);
    renderBody();
    setTimeout(() => { try { searchI.focus(); } catch (_) {} }, 60);

    Storage.getMeals().then(ms => {
      const seen = new Set();
      recents = [];
      for (const mm of ms.slice().sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0))) {
        const k = (mm.name || "").toLowerCase().trim();
        if (!k || seen.has(k)) continue;
        seen.add(k);
        recents.push(mm);
        if (recents.length >= 10) break;
      }
      if (!searchI.value.trim()) renderBody();
    });
  }

  function openMealForm(existing = null, sectionHint = "breakfast", dateHint = null, opts = {}) {
    const nameI = el("input", { class: "input", placeholder: "e.g. Chicken and rice", value: existing?.name || "" });
    const kcalI = el("input", { class: "input input-num", type: "number", inputmode: "numeric", placeholder: "kcal", value: existing?.kcal ?? "" });
    const proteinI = el("input", {
      class: "input input-num", type: "number", inputmode: "decimal", step: "0.1", min: "0",
      placeholder: "g", value: existing?.protein ?? ""
    });
    const carbsI = el("input", {
      class: "input input-num", type: "number", inputmode: "decimal", step: "0.1", min: "0",
      placeholder: "g", value: existing?.carbs ?? ""
    });
    const fatI = el("input", {
      class: "input input-num", type: "number", inputmode: "decimal", step: "0.1", min: "0",
      placeholder: "g", value: existing?.fat ?? ""
    });
    const dateI = el("input", { class: "input", type: "date", value: existing?.date || dateHint || U.todayISO() });
    const sectionS = mealSectionSelect(existing?.section || sectionHint);
    const defaultTime = existing?.time
      ? U.normalizeMealTime(existing.time)
      : U.defaultMealTimeForSection(existing?.section || sectionHint, existing?.date || dateHint || U.todayISO());
    const timeI = el("input", { class: "input", type: "time", value: defaultTime || "" });
    // If user changes date and this is a new meal, refresh default time
    if (!existing) {
      dateI.addEventListener("change", () => {
        timeI.value = U.defaultMealTimeForSection(sectionS.value, dateI.value || U.todayISO());
      });
    }
    const notesI = el("input", { class: "input", placeholder: "Notes (optional)", value: existing?.notes || "" });
    const saveReuse = el("input", {
      type: "checkbox",
      id: "meal-save-reuse",
      checked: !!opts.saveForReuse
    });
    // el() uses setAttribute for checked which is unreliable for checkboxes — set property directly.
    saveReuse.checked = !!opts.saveForReuse;

    const macroHint = el("div", { class: "text-xs text-faint macro-form-hint" }, "Optional. Leave blank if you only want calories.");

    function readMacros() {
      return {
        protein: U.parseMacro(proteinI.value),
        carbs: U.parseMacro(carbsI.value),
        fat: U.parseMacro(fatI.value)
      };
    }

    function refreshMacroHint() {
      const m = readMacros();
      const p = m.protein || 0;
      const c = m.carbs || 0;
      const f = m.fat || 0;
      if (!p && !c && !f) {
        macroHint.textContent = "Optional. Leave blank if you only want calories.";
        return;
      }
      const est = U.kcalFromMacros({ protein: p, carbs: c, fat: f });
      macroHint.textContent = `Macro estimate ≈ ${est} kcal (P×4 + C×4 + F×9).`;
    }

    for (const node of [proteinI, carbsI, fatI]) {
      node.addEventListener("input", refreshMacroHint);
    }
    refreshMacroHint();

    const fillFromMacrosBtn = el("button", {
      type: "button",
      class: "btn btn-ghost btn-sm",
      on: { click: () => {
        const m = readMacros();
        const p = m.protein || 0;
        const c = m.carbs || 0;
        const f = m.fat || 0;
        if (!p && !c && !f) return toast("Enter protein, carbs or fat first");
        kcalI.value = String(U.kcalFromMacros({ protein: p, carbs: c, fat: f }));
        toast("Calories filled from macros");
      } }
    }, "Fill kcal from macros");

    const body = el("div", {},
      el("div", { class: "form-row" }, el("div", { style: "flex:1" }, el("label", { class: "label" }, "Meal name"), nameI)),
      el("div", { class: "form-row" },
        el("div", { style: "flex:1" }, el("label", { class: "label" }, "Calories"), kcalI),
        el("div", { style: "flex:1" }, el("label", { class: "label" }, "Category"), wheelizeSelect(sectionS, { title: "Meal category" }))
      ),
      el("div", { class: "settings-section-title", style: "margin-top: 4px" }, "Macros (g)"),
      el("div", { class: "form-row macro-fields" },
        el("div", { style: "flex:1" }, el("label", { class: "label" }, "Protein"), proteinI),
        el("div", { style: "flex:1" }, el("label", { class: "label" }, "Carbs"), carbsI),
        el("div", { style: "flex:1" }, el("label", { class: "label" }, "Fat"), fatI)
      ),
      el("div", { class: "row", style: "justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 8px" },
        macroHint,
        fillFromMacrosBtn
      ),
      el("div", { class: "form-row" },
        el("div", { style: "flex:1" }, el("label", { class: "label" }, "Date"), dateI),
        el("div", { style: "flex:1" }, el("label", { class: "label" }, "Time"), timeI)
      ),
      el("div", { class: "form-row" },
        el("div", { style: "flex:1" }, el("label", { class: "label" }, "Notes"), notesI)
      ),
      el("label", { class: "meal-reuse-check", for: "meal-save-reuse" },
        saveReuse,
        el("span", {}, "Also save this meal for reuse")
      )
    );

    const footer = el("div", {},
      el("button", { class: "btn", on: { click: closeModal } }, "Cancel"),
      el("button", { class: "btn btn-primary", on: { click: async () => {
        if (!nameI.value.trim()) return toast("Enter a meal name");
        let kcal = parseInt(kcalI.value, 10);
        const protein = U.parseMacro(proteinI.value);
        const carbs = U.parseMacro(carbsI.value);
        const fat = U.parseMacro(fatI.value);
        if ((isNaN(kcal) || kcalI.value === "") && (protein || carbs || fat)) {
          kcal = U.kcalFromMacros({
            protein: protein || 0,
            carbs: carbs || 0,
            fat: fat || 0
          });
        }
        if (isNaN(kcal) || kcal < 0) return toast("Enter valid calories");
        if (proteinI.value !== "" && protein == null) return toast("Enter a valid protein amount");
        if (carbsI.value !== "" && carbs == null) return toast("Enter a valid carbs amount");
        if (fatI.value !== "" && fat == null) return toast("Enter a valid fat amount");
        const mealDate = dateI.value || U.todayISO();
        const mealTime = U.normalizeMealTime(timeI.value) || U.defaultMealTimeForSection(sectionS.value, mealDate);
        const meal = {
          id: existing?.id || U.uid(),
          name: nameI.value.trim(),
          kcal,
          protein: protein || 0,
          carbs: carbs || 0,
          fat: fat || 0,
          section: U.normalizeMealSection(sectionS.value),
          time: mealTime,
          date: mealDate,
          notes: notesI.value.trim(),
          savedAt: existing?.savedAt || Date.now()
        };
        await Storage.saveMeal(meal);
        if (saveReuse.checked) {
          await saveMealAsTemplate(meal);
        }
        closeModal();
        // If this meal belongs to a past day, re-open that day's breakdown so context is kept.
        if (mealDate !== U.todayISO()) {
          renderMain();
          openNutritionDayDetail(mealDate);
        } else {
          afterNutritionChange();
        }
      } } }, existing?.id ? "Update" : "Save meal")
    );

    openModal(existing?.id ? "Edit meal" : "Log meal", body, footer);
    setTimeout(() => nameI.focus(), 50);
  }

  function openMealTemplateEditor(tpl = null) {
    const isNew = !tpl;
    const nameI = el("input", { class: "input", placeholder: "e.g. Overnight oats", value: tpl?.name || "" });
    const kcalI = el("input", { class: "input input-num", type: "number", inputmode: "numeric", value: tpl?.kcal ?? "" });
    const proteinI = el("input", { class: "input input-num", type: "number", inputmode: "decimal", step: "0.1", min: "0", value: tpl?.protein ?? "" });
    const carbsI = el("input", { class: "input input-num", type: "number", inputmode: "decimal", step: "0.1", min: "0", value: tpl?.carbs ?? "" });
    const fatI = el("input", { class: "input input-num", type: "number", inputmode: "decimal", step: "0.1", min: "0", value: tpl?.fat ?? "" });
    const sectionS = mealSectionSelect(tpl?.section || "snack");
    const notesI = el("input", { class: "input", placeholder: "Notes (optional)", value: tpl?.notes || "" });

    const body = el("div", {},
      el("p", { class: "text-sm text-muted", style: "margin: 0 0 12px" },
        isNew
          ? "Save values once, then re-log with one tap from Nutrition."
          : "Edits apply next time you log this saved meal."
      ),
      el("div", { class: "form-row" }, el("div", { style: "flex:1" }, el("label", { class: "label" }, "Name"), nameI)),
      el("div", { class: "form-row" },
        el("div", { style: "flex:1" }, el("label", { class: "label" }, "Calories"), kcalI),
        el("div", { style: "flex:1" }, el("label", { class: "label" }, "Default category"), wheelizeSelect(sectionS, { title: "Default category" }))
      ),
      el("div", { class: "form-row macro-fields" },
        el("div", { style: "flex:1" }, el("label", { class: "label" }, "Protein"), proteinI),
        el("div", { style: "flex:1" }, el("label", { class: "label" }, "Carbs"), carbsI),
        el("div", { style: "flex:1" }, el("label", { class: "label" }, "Fat"), fatI)
      ),
      el("div", { class: "form-row" }, el("div", { style: "flex:1" }, el("label", { class: "label" }, "Notes"), notesI))
    );

    const footer = el("div", {},
      el("button", { class: "btn", on: { click: closeModal } }, "Cancel"),
      // Only when editing one that already exists — there is nothing to delete
      // on a meal you have not saved yet.
      isNew ? null : el("button", {
        class: "btn btn-danger", type: "button", "data-testid": "meal-tpl-delete",
        on: { click: async () => { if (await deleteSavedMeal(tpl)) closeModal(); } }
      }, "Delete"),
      el("button", { class: "btn btn-primary", on: { click: async () => {
        if (!nameI.value.trim()) return toast("Enter a meal name");
        let kcal = parseInt(kcalI.value, 10);
        const protein = U.parseMacro(proteinI.value);
        const carbs = U.parseMacro(carbsI.value);
        const fat = U.parseMacro(fatI.value);
        if ((isNaN(kcal) || kcalI.value === "") && (protein || carbs || fat)) {
          kcal = U.kcalFromMacros({ protein: protein || 0, carbs: carbs || 0, fat: fat || 0 });
        }
        if (isNaN(kcal) || kcal < 0) return toast("Enter valid calories");
        const updated = {
          id: tpl?.id || U.uid(),
          name: nameI.value.trim(),
          kcal,
          protein: protein || 0,
          carbs: carbs || 0,
          fat: fat || 0,
          section: U.normalizeMealSection(sectionS.value),
          notes: notesI.value.trim(),
          createdAt: tpl?.createdAt || Date.now(),
          updatedAt: Date.now(),
          lastUsedAt: tpl?.lastUsedAt || null
        };
        await Storage.saveMealTemplate(updated);
        closeModal();
        renderMain();
        toast(isNew ? "Meal saved for reuse" : "Saved meal updated");
      } } }, isNew ? "Save meal" : "Save changes")
    );
    openModal(isNew ? "New saved meal" : "Edit saved meal", body, footer);
    setTimeout(() => nameI.focus(), 50);
  }

  // ============ HISTORY ============
  async function renderStats(view) {
    const records = await computeExerciseRecords();
    const strengthRecords = records.filter(r => !r.isCardio && (r.maxWeight > 0 || r.maxE1RM > 0 || r.maxReps > 0));
    const cardioRecords = records.filter(r => r.isCardio && (r.maxDuration > 0 || r.maxDistance > 0));
    const heroes = pickHeroRecords(records, 2);

    // Weekly workout goal (Mon–Sun)
    const workouts = (await Storage.getWorkouts()).filter(w => w.completedAt);
    const { start: weekStart, end: weekEnd } = weekBoundsISO();
    const weekWorkouts = workouts.filter(w => w.date >= weekStart && w.date <= weekEnd);
    const weekGoal = Math.max(1, parseInt(state.prefs?.weeklyWorkoutGoal, 10) || 4);
    const weekDone = weekWorkouts.length;
    const weekPct = Math.min(100, Math.round((weekDone / weekGoal) * 100));

    // Active session progress
    let sessionSetsDone = 0, sessionSetsTotal = 0, sessionRepsDone = 0, sessionRepsTarget = 0;
    if (state.activeWorkout) {
      for (const ex of (state.activeWorkout.exercises || [])) {
        for (const s of (ex.sets || [])) {
          sessionSetsTotal += 1;
          if (s.done) sessionSetsDone += 1;
          if (ex.type !== "cardio" && ex.type !== "custom" && s.durationMin == null && s.value == null) {
            const target = Number(s.reps) || 0;
            // Target from planned reps field; done sets count actual reps
            sessionRepsTarget += target || 0;
            if (s.done) sessionRepsDone += target || 0;
          }
        }
      }
    }

    // ---- Header ----
    view.appendChild(el("div", { class: "stats-header" },
      el("h1", { class: "stats-title" }, "Workout stats"),
      el("div", { class: "text-sm text-muted" }, "Personal records and weekly training pace")
    ));

    // ---- Hero PRs (reference-style large max weights) ----
    const heroCard = el("div", { class: "card stats-hero-card" });
    heroCard.appendChild(el("div", { class: "card-title" }, "Personal records"));
    if (heroes.length === 0) {
      heroCard.appendChild(el("div", { class: "text-sm text-faint" },
        "Log completed sets to unlock max-weight records. Deadlift, bench, squat and OHP are prioritised when present."));
    } else {
      const row = el("div", { class: "stats-hero-row" });
      for (const h of heroes) {
        const shortName = (h.name || "Lift").replace(/\s*\(.*?\)\s*/g, " ").trim();
        row.appendChild(el("button", {
          class: "stats-hero-pr",
          type: "button",
          on: { click: () => openExerciseDetail(h.exerciseId, h) }
        },
          el("div", { class: "stats-hero-value" },
            el("span", { class: "stats-hero-num" }, String(h.maxWeight)),
            el("span", { class: "stats-hero-unit" }, U.weightUnit())
          ),
          el("div", { class: "stats-hero-label" }, shortName.toUpperCase()),
          h.maxWeightDate
            ? el("div", { class: "stats-hero-date" }, U.formatDate(h.maxWeightDate))
            : null
        ));
      }
      // If only one hero, still fill layout
      if (heroes.length === 1) {
        row.appendChild(el("div", { class: "stats-hero-pr placeholder" },
          el("div", { class: "stats-hero-value" },
            el("span", { class: "stats-hero-num text-faint" }, "—")
          ),
          el("div", { class: "stats-hero-label text-faint" }, "NEXT PR")
        ));
      }
      heroCard.appendChild(row);
    }
    view.appendChild(heroCard);

    // ---- Weekly goal ring ----
    const ringCard = el("div", { class: "card stats-week-card" });
    const ringWrap = el("div", { class: "stats-ring-wrap" });
    const size = 148;
    const stroke = 10;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const offset = c * (1 - weekPct / 100);
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
    svg.setAttribute("class", "stats-ring");
    svg.setAttribute("width", String(size));
    svg.setAttribute("height", String(size));
    const bg = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    bg.setAttribute("cx", String(size / 2));
    bg.setAttribute("cy", String(size / 2));
    bg.setAttribute("r", String(r));
    bg.setAttribute("fill", "none");
    bg.setAttribute("stroke", "var(--border)");
    bg.setAttribute("stroke-width", String(stroke));
    const fg = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    fg.setAttribute("cx", String(size / 2));
    fg.setAttribute("cy", String(size / 2));
    fg.setAttribute("r", String(r));
    fg.setAttribute("fill", "none");
    fg.setAttribute("stroke", "var(--accent)");
    fg.setAttribute("stroke-width", String(stroke));
    fg.setAttribute("stroke-linecap", "round");
    fg.setAttribute("stroke-dasharray", String(c));
    fg.setAttribute("stroke-dashoffset", String(offset));
    fg.setAttribute("transform", `rotate(-90 ${size / 2} ${size / 2})`);
    svg.appendChild(bg);
    svg.appendChild(fg);
    ringWrap.appendChild(svg);
    ringWrap.appendChild(el("div", { class: "stats-ring-center" },
      el("div", { class: "stats-ring-icon", html: icons.dumbbell }),
      el("div", { class: "stats-ring-pct" }, `${weekPct}%`),
      el("div", { class: "stats-ring-label" }, "Weekly goal")
    ));
    ringCard.appendChild(ringWrap);
    ringCard.appendChild(el("div", { class: "text-sm text-muted text-center mt-8" },
      `${weekDone} of ${weekGoal} workouts this week · Mon–Sun`
    ));
    view.appendChild(ringCard);

    // ---- Current session (if active) ----
    if (state.activeWorkout && sessionSetsTotal > 0) {
      const setsPct = Math.min(100, Math.round((sessionSetsDone / sessionSetsTotal) * 100));
      const repsPct = sessionRepsTarget > 0
        ? Math.min(100, Math.round((sessionRepsDone / sessionRepsTarget) * 100))
        : 0;
      const sess = el("div", { class: "card" },
        el("div", { class: "card-title" }, "Current session"),
        el("div", { class: "text-sm text-muted mb-8" }, state.activeWorkout.name || "Workout"),
        el("div", { class: "stats-session-grid" },
          el("div", { class: "stats-session-metric" },
            el("div", { class: "stat-label" }, "Sets"),
            el("div", { class: "stats-session-value" }, `${sessionSetsDone}/${sessionSetsTotal}`),
            el("div", { class: "kcal-progress" },
              el("div", { class: "kcal-progress-fill", style: `width:${setsPct}%` })
            )
          ),
          el("div", { class: "stats-session-metric" },
            el("div", { class: "stat-label" }, "Reps logged"),
            el("div", { class: "stats-session-value" },
              sessionRepsTarget ? `${sessionRepsDone}/${sessionRepsTarget}` : String(sessionSetsDone)
            ),
            el("div", { class: "kcal-progress" },
              el("div", { class: "kcal-progress-fill", style: `width:${sessionRepsTarget ? repsPct : setsPct}%` })
            )
          )
        ),
        el("button", {
          class: "btn btn-primary btn-block mt-16",
          on: { click: () => { state.tab = "workout"; renderMain(); } }
        }, "Resume workout")
      );
      view.appendChild(sess);
    }

    // ---- Filter chips for full board ----
    let filter = "all"; // all | strength | cardio
    const boardHost = el("div", { class: "stats-board-host" });

    function shortLabel(name) {
      return (name || "Exercise").length > 28 ? (name.slice(0, 26) + "…") : name;
    }

    function renderBoard() {
      clear(boardHost);
      const list =
        filter === "strength" ? strengthRecords :
        filter === "cardio" ? cardioRecords :
        records.filter(r =>
          r.isCustom
            ? (r.maxValue > 0)
            : r.isCardio
              ? (r.maxDuration > 0 || r.maxDistance > 0)
              : (r.maxWeight > 0 || r.maxE1RM > 0 || r.maxReps > 0)
        );

      const card = el("div", { class: "card" });
      card.appendChild(el("div", { class: "row-between", style: "margin-bottom: 10px; gap: 8px" },
        el("div", { class: "card-title", style: "margin:0" }, "All records"),
        el("div", { class: "text-xs text-faint" }, `${list.length} exercise${list.length === 1 ? "" : "s"}`)
      ));

      const chips = el("div", { class: "stats-filter-row" });
      for (const [key, label] of [["all", "All"], ["strength", "Strength"], ["cardio", "Cardio"]]) {
        chips.appendChild(el("button", {
          type: "button",
          class: "chip stats-filter-chip" + (filter === key ? " active" : ""),
          on: { click: () => { filter = key; renderBoard(); } }
        }, label));
      }
      card.appendChild(chips);

      if (!list.length) {
        card.appendChild(emptyState({
          compact: true,
          body: "No records in this filter yet. Complete a workout to start building your board.",
          primaryLabel: state.activeWorkout ? "Continue workout" : "Start workout",
          onPrimary: () => goTab("workout"),
          primaryTestId: "empty-stats-start-workout"
        }));
        boardHost.appendChild(card);
        return;
      }

      for (const rec of list) {
        if (rec.isCustom) {
          const m = normalizeMetric(rec.metric);
          const best = m.higherIsBetter ? rec.maxValue : (rec.minValue || rec.maxValue);
          card.appendChild(el("button", {
            type: "button",
            class: "stats-record-row",
            on: { click: () => openExerciseDetail(rec.exerciseId, rec) }
          },
            el("div", { class: "stats-record-main" },
              el("div", { class: "stats-record-name" }, shortLabel(rec.name)),
              el("div", { class: "stats-record-meta" },
                [
                  m.label + (m.higherIsBetter ? " · best" : " · fastest"),
                  rec.sessionCount ? `${rec.sessionCount} session${rec.sessionCount === 1 ? "" : "s"}` : null
                ].filter(Boolean).join(" · ")
              )
            ),
            el("div", { class: "stats-record-value" },
              best != null ? String(best) : "—",
              m.unit ? el("span", { class: "stats-record-unit" }, m.unit) : null
            )
          ));
        } else if (rec.isCardio) {
          card.appendChild(el("button", {
            type: "button",
            class: "stats-record-row",
            on: { click: () => openExerciseDetail(rec.exerciseId, rec) }
          },
            el("div", { class: "stats-record-main" },
              el("div", { class: "stats-record-name" }, shortLabel(rec.name)),
              el("div", { class: "stats-record-meta" },
                [
                  rec.maxDuration ? `${rec.maxDuration} min` : null,
                  rec.maxDistance ? U.formatDistance(rec.maxDistance) : null,
                  rec.sessionCount ? `${rec.sessionCount} session${rec.sessionCount === 1 ? "" : "s"}` : null
                ].filter(Boolean).join(" · ")
              )
            ),
            el("div", { class: "stats-record-value" },
              rec.maxDuration ? `${rec.maxDuration}` : (rec.maxDistance || "—"),
              el("span", { class: "stats-record-unit" }, rec.maxDuration ? "min" : (rec.maxDistance ? "km" : ""))
            )
          ));
        } else {
          const sub = [
            rec.maxE1RM ? `e1RM ${U.formatWeight(rec.maxE1RM, { space: false })}` : null,
            rec.maxWeightDate ? U.formatDate(rec.maxWeightDate) : null,
            rec.sessionCount ? `${rec.sessionCount}×` : null
          ].filter(Boolean).join(" · ");
          card.appendChild(el("button", {
            type: "button",
            class: "stats-record-row",
            on: { click: () => openExerciseDetail(rec.exerciseId, rec) }
          },
            el("div", { class: "stats-record-main" },
              el("div", { class: "stats-record-name" }, shortLabel(rec.name)),
              el("div", { class: "stats-record-meta" }, sub || "Strength")
            ),
            el("div", { class: "stats-record-value" },
              rec.maxWeight > 0 ? String(rec.maxWeight) : (rec.maxReps ? String(rec.maxReps) : "—"),
              el("span", { class: "stats-record-unit" }, rec.maxWeight > 0 ? U.weightUnit() : (rec.maxReps ? "reps" : ""))
            )
          ));
        }
      }
      boardHost.appendChild(card);
    }
    renderBoard();
    view.appendChild(boardHost);

    // ---- View full history CTA ----
    view.appendChild(el("button", {
      class: "btn btn-primary btn-block stats-history-cta",
      on: { click: () => { state.tab = "history"; renderMain(); } }
    }, "View full history"));
  }

  async function renderHistory(view) {
    const [workouts, meals] = await Promise.all([Storage.getWorkouts(), Storage.getMeals()]);
    const completed = workouts.filter(w => w.completedAt).sort((a, b) => b.startedAt - a.startedAt);

    // Row zero of the log: the way in for a session that happened but was
    // never recorded. Sits with the history rather than the workout tab
    // because it is an act of book-keeping, not of training.
    const backlogRow = () => el("button", {
      class: "history-add", type: "button", "data-testid": "log-past-session",
      on: { click: logPastSession }
    },
      el("span", { class: "history-add-icon", html: icons.plus }),
      el("span", {},
        el("span", { class: "history-add-title" }, "Log a past session"),
        el("span", { class: "history-add-sub" }, "Trained but forgot to record it")
      )
    );

    if (completed.length === 0) {
      view.appendChild(emptyState({
        title: "No workouts logged yet",
        body: "Finish a session and it will show up here with volume, sets and PRs.",
        primaryLabel: state.activeWorkout ? "Continue workout" : "Start workout",
        onPrimary: () => goTab("workout"),
        primaryTestId: "empty-history-start-workout"
      }));
      view.appendChild(el("div", { class: "card" }, backlogRow()));
      return;
    }

    // PR summary — build in one pass from completed workouts (fast).
    const allExercises = await getAllExercises();
    const exerciseById = new Map(allExercises.map(e => [e.id, e]));
    const prMap = new Map(); // exerciseId -> { maxWeight, maxReps, maxE1RM, bestWeight, bestReps }
    for (const w of completed) {
      for (const ex of (w.exercises || [])) {
        let p = prMap.get(ex.exerciseId);
        if (!p) { p = { maxWeight: 0, maxReps: 0, maxE1RM: 0, bestWeight: 0, bestReps: 0 }; prMap.set(ex.exerciseId, p); }
        for (const s of (ex.sets || [])) {
          if (!s.done || !s.weight || !s.reps) continue;
          if (s.weight > p.maxWeight) p.maxWeight = s.weight;
          if (s.reps > p.maxReps) p.maxReps = s.reps;
          const e = U.epley(s.weight, s.reps);
          if (e > p.maxE1RM) { p.maxE1RM = e; p.bestWeight = s.weight; p.bestReps = s.reps; }
        }
      }
    }
    const prsList = [];
    for (const [exerciseId, p] of prMap) {
      const ex = exerciseById.get(exerciseId);
      if (!ex || p.maxE1RM <= 0) continue;
      prsList.push({ ex, ...p });
    }
    prsList.sort((a, b) => b.maxE1RM - a.maxE1RM);

    if (prsList.length) {
      view.appendChild(el("div", { class: "card" },
        el("div", { class: "card-title" }, "Personal records"),
        ...prsList.slice(0, 10).map(p =>
          el("div", {
            class: "pr-item", style: "cursor:pointer",
            role: "button", tabindex: "0", "aria-label": `${p.ex.name} — personal records`,
            on: {
              click: () => openExerciseDetail(p.ex.id),
              keydown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openExerciseDetail(p.ex.id); } }
            }
          },
            el("div", {},
              el("div", { class: "pr-name" }, p.ex.name),
              el("div", { class: "pr-date" }, `Best set: ${U.formatWeight(p.bestWeight, { space: false })} × ${p.bestReps} · top weight ${U.formatWeight(p.maxWeight, { space: false })} · best reps ${p.maxReps}`)
            ),
            el("div", { class: "pr-value" }, U.formatWeight(p.maxE1RM, { space: false }), el("span", { class: "text-xs text-faint" }, " e1RM"))
          )
        )
      ));
    }

    // Workout log
    const card = el("div", { class: "card" });
    card.appendChild(el("div", { class: "card-title" }, `Workout log (${completed.length})`));
    card.appendChild(backlogRow());
    let firstItem = true;
    for (const w of completed) {
      const totalVol = (w.exercises || []).reduce((s, e) => s + U.volume(e.sets), 0);
      const totalSets = (w.exercises || []).reduce((s, e) => s + (e.sets || []).length, 0);
      const burned = w.kcalBurned != null ? w.kcalBurned : workoutKcalTotal(w);
      const hasStrength = (w.exercises || []).some(e => e.type !== "cardio");
      const volBit = hasStrength && totalVol > 0 ? ` · ${U.formatVolume(totalVol)} volume` : "";
      const burnBit = burned > 0 ? ` · ≈ ${burned} kcal` : "";
      // The freshly-finished session (top of the list) gets a one-off flourish.
      const flourish = firstItem && finishFlourish ? " finish-flourish" : "";
      firstItem = false;
      card.appendChild(el("div", { class: "history-row" },
        el("div", {
          class: "history-item" + flourish,
          role: "button", tabindex: "0",
          "data-testid": "history-item",
          "aria-label": `${w.name || "Workout"}, ${U.formatDate(w.date, { year: "numeric" })}`,
          on: {
            click: () => openWorkoutDetail(w),
            keydown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openWorkoutDetail(w); } }
          }
        },
          el("div", { class: "history-item-date" }, U.formatDate(w.date, { year: "numeric" })),
          el("div", { class: "history-item-name" }, w.name || "Workout"),
          el("div", { class: "history-item-summary" },
            // Guarded like every other read of this list in the function: one
            // stored workout without an exercises array used to blank the whole
            // History tab, not just its own row.
            // A scored session leads with its score. Counting sets and volume
            // for an AMRAP describes the prescription, not the result — the
            // row would read "5 exercises · 5 sets" for a twenty-minute effort
            // whose entire point was the number of rounds.
            (w.score
              ? `${scoreLine(w.score)} · ${(w.exercises || []).length} ${(w.exercises || []).length === 1 ? "exercise" : "exercises"}${burnBit} · ${U.formatDuration(w.durationSec)}`
              : `${(w.exercises || []).length} ${(w.exercises || []).length === 1 ? "exercise" : "exercises"} · ${totalSets} ${totalSets === 1 ? "set" : "sets"}${volBit}${burnBit} · ${U.formatDuration(w.durationSec)}`))
        ),
        el("button", {
          class: "icon-btn history-repeat", type: "button",
          "data-testid": "history-repeat",
          title: `Log ${w.name || "this session"} on another day`,
          "aria-label": `Log ${w.name || "this session"} on another day`,
          html: icons.repeat,
          on: { click: (e) => { e.stopPropagation(); repeatWorkoutOnDay(w); } }
        })
      ));
    }
    finishFlourish = false;
    view.appendChild(card);
  }

  /** The other half of back-logging: a session you trained but never started
      in the app, and have no earlier copy of to repeat. This is the one path
      that has to ask what the session actually was, so it costs one extra
      screen — day, then session, then the numbers. */
  function logPastSession() {
    openDateSheet({
      title: "Log a session on",
      confirmLabel: "Next",
      // "I forgot to log it" nearly always means yesterday.
      date: (() => { const d = new Date(); d.setDate(d.getDate() - 1); return U.todayISO(d); })(),
      testid: "past-day",
      onPick: (day) => choosePastSession(day)
    });
  }

  async function choosePastSession(day) {
    const mine = (await Storage.getTemplates()).slice().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    const picker = buildSessionPickerUI(mine, presetSessions(), {
      onPicked: closeModal,
      actionLabel: "Log it",
      onChoose: (t) => createPastWorkout(day, t)
    });
    const footer = el("div", {},
      el("button", { class: "btn", on: { click: closeModal } }, "Cancel"),
      // Nothing in the library matches — start from an empty session and add
      // exercises in the editor, same as any other correction.
      // Deliberately not the primary button — the main path is "Log it" on a
      // card, and an accent button down here would pull the eye off it.
      el("button", {
        class: "btn", "data-testid": "past-blank",
        on: { click: () => { closeModal(); createPastWorkout(day, null); } }
      }, "Blank session")
    );
    openModal(`What did you do on ${U.formatDate(day)}?`, picker.body, footer);
    picker.refresh();
  }

  async function createPastWorkout(day, template) {
    const at = new Date(day + "T12:00:00");
    const when = Number.isFinite(at.getTime()) ? at.getTime() : Date.now();
    const exercises = await expandTemplateExercises(template);
    // Every set arrives ticked: you are recording what happened, not working
    // through a plan, so the only job left is correcting the numbers.
    for (const ex of exercises) for (const s of (ex.sets || [])) s.done = true;
    const w = {
      id: U.uid(),
      name: (template && template.name) || "Workout",
      date: day,
      startedAt: when,
      completedAt: when,
      // Unknown rather than zero — the log renders this as "—" instead of
      // claiming a session that took no time.
      durationSec: null,
      exercises,
      notes: "",
      templateId: (template && template.id) || null,
      source: "backlog"
    };
    await Storage.saveWorkout(w);
    renderMain();
    toast(`Logged to ${U.formatDate(day)} — fill in what you did`);
    setTimeout(() => openWorkoutDetail(w), 420);
  }

  /** Clone a finished session onto another day, keeping what you actually
      lifted. Most forgotten sessions are ones you have done before, so the
      fastest honest way to reconstruct one is to copy the last time you did
      it and correct whatever differed — rather than rebuild it from nothing. */
  async function repeatWorkoutOnDay(src) {
    return openDateSheet({
      title: `Repeat ${src.name || "this session"} on`,
      confirmLabel: "Log it",
      date: (() => {
        // Default to yesterday, which is what "I forgot to log it" nearly
        // always means.
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return U.todayISO(d);
      })(),
      testid: "repeat-day",
      onPick: async (day) => {
        const at = new Date(day + "T12:00:00");
        const when = Number.isFinite(at.getTime()) ? at.getTime() : Date.now();
        const copy = JSON.parse(JSON.stringify(src));
        copy.id = U.uid();
        copy.date = day;
        copy.completedAt = when;
        copy.startedAt = when - (src.durationSec || 0) * 1000;
        copy.notes = "";
        // Every set carries its previous numbers and arrives ticked — the
        // point is that you only touch what was different.
        for (const ex of (copy.exercises || [])) {
          for (const set of (ex.sets || [])) {
            set.done = true;
            delete set.isPR;      // a copy is not evidence of a new record
            delete set.autoLogged;
            delete set.adjusted;
            delete set.prescribed;
          }
        }
        copy.kcalBurned = workoutKcalTotal(copy);
        await Storage.saveWorkout(copy);
        renderMain();
        toast(`Logged to ${U.formatDate(day)} — tap it to adjust`);
        // Straight into the editor, since the numbers are a starting point.
        setTimeout(() => openWorkoutDetail(copy), 420);
      }
    });
  }

  // Past-session detail. Everything here is editable: a session you logged
  // last week is as correctable as one you logged five minutes ago, so this is
  // the same view whether you are reviewing or fixing.
  /** A scored result in one phrase, for a list row. */
  function scoreLine(score) {
    if (score.mode === "amrap") {
      return `${score.rounds} round${score.rounds === 1 ? "" : "s"} in ${U.formatTime(score.capSec)}`;
    }
    return U.formatTime(score.elapsedSec) + (score.capped ? " (capped)" : "");
  }

  /** A finished scored session, in the terms it was scored in. */
  function scoreCard(score) {
    const amrap = score.mode === "amrap";
    return el("div", { class: "score-card", "data-testid": "score-card", "data-mode": score.mode },
      el("div", { class: "score-label" }, amrap ? "ROUNDS COMPLETED" : "TIME"),
      el("div", { class: "score-value", "data-testid": "score-value" },
        amrap ? String(score.rounds) : U.formatTime(score.elapsedSec)),
      el("div", { class: "score-sub" },
        amrap
          ? `in ${U.formatTime(score.capSec)}`
          // Reaching the cap is not the same result as finishing, and a bare
          // time that happens to equal the cap hides which one happened.
          : (score.capped ? `capped at ${U.formatTime(score.capSec)}` : `under the ${U.formatTime(score.capSec)} cap`))
    );
  }

  function openWorkoutDetail(w) {
    // Work on a copy; nothing is written until a change is actually made.
    const draft = JSON.parse(JSON.stringify(w));

    async function persist(rerender) {
      draft.kcalBurned = workoutKcalTotal(draft);
      await Storage.saveWorkout(draft);
      Object.assign(w, JSON.parse(JSON.stringify(draft)));
      renderMain();
      if (rerender !== false) rebuild();
    }

    // A numeric cell that opens the app's numpad and writes straight back.
    function numCell(obj, key, opts) {
      const inp = el("input", {
        class: "input input-num set-edit-cell",
        type: "text", inputmode: "decimal",
        value: obj[key] == null ? "" : String(obj[key]),
        "data-testid": opts.testid || null
      });
      attachNumPad(inp, opts.pad || {});
      const commit = async () => {
        const raw = inp.value.trim();
        const n = raw === "" ? null : Number(raw);
        if (raw !== "" && !Number.isFinite(n)) { inp.value = obj[key] == null ? "" : String(obj[key]); return; }
        if (obj[key] === n) return;
        obj[key] = n;
        await persist(false);
        if (opts.onCommit) opts.onCommit();
      };
      inp.addEventListener("change", commit);
      inp.addEventListener("blur", commit);
      return inp;
    }

    function setRow(ex, s, i) {
      const del = el("button", {
        class: "icon-btn set-edit-del", title: "Delete set", "aria-label": `Delete set ${i + 1}`,
        html: icons.trash,
        on: { click: async () => {
          ex.sets.splice(i, 1);
          if (!ex.sets.length) {
            const keep = await confirmDialog(`Remove ${ex.name} from this session?`,
              { title: "No sets left", okLabel: "Remove exercise" });
            if (keep) draft.exercises = draft.exercises.filter(x => x !== ex);
            else ex.sets.push({});
          }
          await persist();
        } }
      });

      if (ex.type === "custom" || s.value != null) {
        const m = normalizeMetric(ex.metric);
        return el("div", { class: "set-row type-custom set-row-edit", style: "grid-template-columns: 34px 1fr 60px 36px" },
          el("div", { class: "set-index" }, String(i + 1)),
          numCell(s, "value", { testid: "wd-value" }),
          el("div", { class: "text-xs text-faint", style: "text-align:center" }, m.unit || ""),
          del
        );
      }
      if (ex.type === "cardio" || s.durationMin != null) {
        const showDist = cardioTracksDistance(ex);
        return el("div", { class: "set-row type-cardio set-row-edit", style: `grid-template-columns: 34px 1fr ${showDist ? "1fr " : ""}36px` },
          el("div", { class: "set-index" }, String(i + 1)),
          numCell(s, "durationMin", { testid: "wd-min", pad: { unit: "min" } }),
          showDist ? numCell(s, "distanceKm", { testid: "wd-km", pad: { decimals: true, unit: "km" } }) : null,
          del
        );
      }
      if (ex.type === "hold" || s.seconds != null) {
        return el("div", { class: "set-row set-row-edit", style: "grid-template-columns: 34px 1fr 60px 36px" },
          el("div", { class: "set-index" }, String(i + 1)),
          numCell(s, "seconds", { testid: "wd-sec", pad: { unit: "s" } }),
          el("div", { class: "text-xs text-faint", style: "text-align:center" }, ex.perSide ? "s/side" : "sec"),
          del
        );
      }
      const e1Text = () => {
        const l = U.e1rmLabel(s.weight, s.reps);
        return l ? `e1RM ${l}` : "—";
      };
      const e1 = el("div", { class: "mono text-muted set-edit-e1rm", style: "text-align:center" }, e1Text());
      const refreshE1 = () => { e1.textContent = e1Text(); };
      return el("div", { class: "set-row set-row-edit" + (s.drop ? " is-drop" : ""), style: "grid-template-columns: 34px 1fr 1fr 1fr 36px" },
        el("div", { class: "set-index" }, String(i + 1) + (s.drop ? " •" : "")),
        // wheel takes a range config, not a name. Passing the strings
        // "weight"/"reps" left min and max undefined, so the wheel's clamp
        // produced NaN and the cell filled with it — every weight and rep box
        // in this editor was unusable.
        numCell(s, "weight", {
          testid: "wd-weight", onCommit: refreshE1,
          pad: {
            decimals: true, unit: U.weightUnit(),
            wheel: { min: ex.type === "weighted_bodyweight" ? -100 : 0, max: 400,
              frac: "quarter", tens: ex.type !== "weighted_bodyweight" }
          }
        }),
        numCell(s, "reps", {
          testid: "wd-reps", onCommit: refreshE1,
          pad: { unit: "reps", step: 1, wheel: { min: 1, max: 60 } }
        }),
        e1,
        del
      );
    }

    function build() {
      const burned = draft.kcalBurned != null ? draft.kcalBurned : workoutKcalTotal(draft);
      const body = el("div", { class: "workout-edit" });

      // —— when + how long ——
      body.appendChild(el("div", { class: "wd-meta" },
        el("button", {
          class: "wd-meta-chip", type: "button", "data-testid": "wd-date",
          title: "Change the day this session was logged on",
          on: { click: () => openDateSheet({
            title: "Move this session", confirmLabel: "Move", date: draft.date,
            onPick: async (d) => {
              if (d === draft.date) return;
              draft.date = d;
              // completedAt drives the 14-day heat window, so it has to follow.
              const at = new Date(d + "T12:00:00");
              if (Number.isFinite(at.getTime())) draft.completedAt = at.getTime();
              await persist();
              toast(`Moved to ${U.formatDate(d)}`);
            }
          }) }
        }, U.formatDate(draft.date, { year: "numeric", weekday: "long" })),
        el("span", { class: "text-sm text-muted" },
          U.formatDuration(draft.durationSec) + (burned > 0 ? ` · ≈ ${burned} kcal` : ""))
      ));

      // —— the score, where the session had one ——
      // A scored session's result is the whole point of it and does not live
      // in the set rows, so it gets its own line rather than being inferable
      // from a duration that happens to equal the cap.
      if (draft.score) body.appendChild(scoreCard(draft.score));

      // —— name ——
      const nameI = el("input", {
        class: "input", type: "text", maxlength: "60", value: draft.name || "",
        placeholder: "Session name", "data-testid": "wd-name"
      });
      const commitName = async () => {
        const v = nameI.value.trim();
        if (v === (draft.name || "")) return;
        draft.name = v;
        await persist(false);
        // Keep the modal heading in step without rebuilding the whole form,
        // which would blur the field the user is still typing in.
        const t = document.querySelector(".modal-overlay .modal-title");
        if (t) t.textContent = v || "Workout";
      };
      nameI.addEventListener("change", commitName);
      nameI.addEventListener("blur", commitName);
      body.appendChild(el("label", { class: "field" },
        el("span", { class: "label" }, "Session name"), nameI));

      // —— exercises ——
      for (const ex of (draft.exercises || [])) {
        const block = el("div", { class: "exercise-block", style: "margin-bottom: 12px" });
        block.appendChild(el("div", { class: "exercise-block-header" },
          el("div", { class: "exercise-block-title" },
            ex.name,
            exerciseKcalTotal(ex) > 0
              ? el("span", { class: "chip chip-sm", style: "margin-left:8px" }, `≈ ${exerciseKcalTotal(ex)} kcal`) : null),
          el("button", {
            class: "icon-btn", title: `Remove ${ex.name}`, "aria-label": `Remove ${ex.name}`,
            html: icons.trash, "data-testid": "wd-del-exercise",
            on: { click: async () => {
              if (!(await confirmDialog(`Remove ${ex.name} from this session?`,
                { title: "Remove exercise?", okLabel: "Remove", danger: true }))) return;
              draft.exercises = draft.exercises.filter(x => x !== ex);
              await persist();
            } }
          })
        ));
        const bodyEl = el("div", { class: "exercise-block-body" });
        (ex.sets || []).forEach((s, i) => bodyEl.appendChild(setRow(ex, s, i)));
        bodyEl.appendChild(el("button", {
          class: "btn btn-ghost btn-sm wd-add-set", type: "button", "data-testid": "wd-add-set",
          on: { click: async () => {
            const last = (ex.sets || [])[ex.sets.length - 1] || {};
            const blank = ex.type === "cardio" ? { durationMin: last.durationMin ?? null, distanceKm: last.distanceKm ?? null }
              : ex.type === "hold" ? { seconds: last.seconds ?? null }
              : ex.type === "custom" ? { value: last.value ?? null }
              : { weight: last.weight ?? null, reps: last.reps ?? null };
            blank.done = true;
            ex.sets = (ex.sets || []).concat(blank);
            await persist();
          } }
        }, "+ Add set"));
        block.appendChild(bodyEl);
        body.appendChild(block);
      }

      body.appendChild(el("button", {
        class: "btn btn-block wd-add-ex", type: "button", "data-testid": "wd-add-exercise",
        on: { click: async () => {
          const all = await getAllExercises();
          const picker = buildExercisePickerUI(all, {
            confirmLabel: (n) => `Add ${n} to this session`,
            existingIds: new Set((draft.exercises || []).map(e => e.exerciseId)),
            customImmediate: true,
            onConfirm: async (items) => {
              closeModal();
              const byId = new Map(all.map(e => [e.id, e]));
              for (const it of items) {
                const def = byId.get(it.id) || {};
                const ex = { exerciseId: it.id, name: it.name, category: def.category || "", muscles: def.muscles || [], sets: [] };
                normalizeWorkoutExercise(ex, def);
                ex.sets = [ex.type === "cardio" ? { durationMin: null, done: true }
                  : ex.type === "hold" ? { seconds: null, done: true }
                  : ex.type === "custom" ? { value: null, done: true }
                  : { weight: null, reps: null, done: true }];
                draft.exercises = (draft.exercises || []).concat(ex);
              }
              await persist(false);
              rebuild();
            }
          });
          // .body, not .el — the picker has never exposed an `el`, so this
          // opened an empty sheet. refresh() then settles the pager on the
          // starting category, which it cannot do until it is in the document.
          openModal("Add exercise", picker.body, null);
          picker.refresh();
          setTimeout(picker.focus, 50);
        } }
      }, "+ Add exercise"));

      // —— notes ——
      const notesI = el("textarea", {
        class: "input", rows: "2", placeholder: "Session notes (optional)",
        "data-testid": "wd-notes"
      });
      notesI.value = draft.notes || "";
      const commitNotes = async () => {
        const v = notesI.value.trim();
        if (v === (draft.notes || "")) return;
        draft.notes = v;
        await persist(false);
      };
      notesI.addEventListener("change", commitNotes);
      notesI.addEventListener("blur", commitNotes);
      body.appendChild(el("label", { class: "field" },
        el("span", { class: "label" }, "Session notes"), notesI));

      const footer = el("div", {},
        el("button", { class: "btn btn-danger", "data-testid": "wd-delete", on: { click: async () => {
          if (!(await confirmDialog("Delete this workout permanently?", { title: "Delete workout?", okLabel: "Delete", danger: true }))) return;
          await Storage.deleteWorkout(draft.id);
          closeModal();
          renderMain();
        } } }, "Delete"),
        el("button", { class: "btn btn-primary", on: { click: closeModal } }, "Done")
      );
      return { body, footer };
    }

    function rebuild() {
      const { body, footer } = build();
      openModal(draft.name || "Workout", body, footer);
    }
    rebuild();
  }

  // ============ SETTINGS / EXPORT / IMPORT ============
  // ============ Guided profile setup (quiz) ============
  // A friendly, one-question-per-screen alternative to the dense settings form.
  // Auto-opens on first run; also reachable from Settings → "Guided setup".
  async function openProfileQuiz(opts = {}) {
    const firstRun = !!opts.firstRun;
    const startWeight = await getBodyweightKg();
    const bwLogged = await hasLoggedBodyweight();

    const draft = {
      profileName: state.prefs.profileName || "",
      sex: (state.prefs.sex === "male" || state.prefs.sex === "female") ? state.prefs.sex : null,
      age: (state.prefs.age != null && Number(state.prefs.age) >= 13) ? Number(state.prefs.age) : 25,
      dob: state.prefs.dob || null,
      heightCm: (state.prefs.heightCm != null && Number(state.prefs.heightCm) >= 100) ? Number(state.prefs.heightCm) : 175,
      weightKg: startWeight > 0 ? startWeight : U.DEFAULT_BW_KG,
      activityLevel: U.ACTIVITY_LEVELS[state.prefs.activityLevel] ? state.prefs.activityLevel : "light",
      goalIntent: U.normalizeGoalIntent(state.prefs.goalIntent)
    };

    const STEPS = ["name", "sex", "age", "height", "weight", "activity", "goal", "reveal"];
    const LAST_INPUT = STEPS.indexOf("goal"); // progress bar tops out here; reveal is the payoff
    let idx = 0;

    const overlay = el("div", { class: "pquiz", id: "profile-quiz", "data-testid": "profile-quiz" });

    const bar = el("div", { class: "pquiz-bar-fill" });
    const progress = el("div", { class: "pquiz-bar" }, bar);
    const backBtn = el("button", {
      type: "button", class: "pquiz-back", "data-testid": "pquiz-back",
      html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>'
    });
    const closeBtn = el("button", {
      type: "button", class: "pquiz-close", "data-testid": "pquiz-close",
      html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>'
    });
    const topbar = el("div", { class: "pquiz-topbar" }, backBtn, progress, closeBtn);
    const stage = el("div", { class: "pquiz-stage" });
    overlay.append(topbar, stage);

    function finishAndClose() {
      overlay.classList.add("is-closing");
      setTimeout(() => overlay.remove(), 220);
    }

    async function markSkipped() {
      if (!state.prefs.onboarded) {
        state.prefs.onboarded = true;
        await Storage.setPref("onboarded", true);
      }
    }

    backBtn.addEventListener("click", () => { if (idx > 0) goto(idx - 1, "back"); });
    closeBtn.addEventListener("click", async () => {
      if (firstRun) await markSkipped();
      finishAndClose();
    });

    // ---- small builders ----
    function choiceCard({ label, hint, icon, iconHtml, selected, onPick, testid }) {
      const card = el("button", {
        type: "button",
        class: "pquiz-choice" + (selected ? " is-sel" : ""),
        "data-testid": testid,
        on: { click: onPick }
      });
      if (iconHtml) card.appendChild(el("div", { class: "pquiz-choice-icon", html: iconHtml }));
      else if (icon) card.appendChild(el("div", { class: "pquiz-choice-icon" }, icon));
      card.appendChild(el("div", { class: "pquiz-choice-main" },
        el("div", { class: "pquiz-choice-label" }, label),
        hint ? el("div", { class: "pquiz-choice-hint" }, hint) : null
      ));
      if (selected) card.appendChild(el("div", {
        class: "pquiz-choice-tick",
        html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'
      }));
      return card;
    }


    function stepShell({ eyebrow, title, subtitle, content, footer }) {
      return el("div", { class: "pquiz-panel" },
        el("div", { class: "pquiz-head" },
          eyebrow ? el("div", { class: "pquiz-eyebrow" }, eyebrow) : null,
          el("h2", { class: "pquiz-title" }, title),
          subtitle ? el("div", { class: "pquiz-sub" }, subtitle) : null
        ),
        el("div", { class: "pquiz-content" }, content),
        footer ? el("div", { class: "pquiz-foot" }, footer) : null
      );
    }

    function primaryBtn(label, onClick, testid) {
      return el("button", {
        type: "button", class: "btn btn-primary btn-block pquiz-next", "data-testid": testid || "pquiz-next",
        on: { click: onClick }
      }, label);
    }

    // ---- step renderers ----
    function renderName() {
      const input = el("input", {
        class: "input pquiz-text", type: "text", maxlength: "40",
        placeholder: "Your name", value: draft.profileName,
        "data-testid": "pquiz-name"
      });
      input.addEventListener("input", () => { draft.profileName = input.value; });
      const go = () => { draft.profileName = input.value.trim(); goto(idx + 1, "next"); };
      input.addEventListener("keydown", (e) => { if (e.key === "Enter") go(); });
      return stepShell({
        eyebrow: firstRun ? "Welcome to FitForge" : "Profile",
        title: "First — what should we call you?",
        subtitle: "Just for your home greeting. You can skip this.",
        content: el("div", { class: "pquiz-textwrap" }, input),
        footer: el("div", { class: "pquiz-footcol" },
          primaryBtn("Continue", go),
          el("button", { type: "button", class: "pquiz-skip", on: { click: () => goto(idx + 1, "next") } }, "Skip")
        )
      });
    }

    function renderSex() {
      const grid = el("div", { class: "pquiz-grid-2" });
      const opts = [
        { key: "male", label: "Male", icon: "♂" },
        { key: "female", label: "Female", icon: "♀" }
      ];
      for (const o of opts) {
        grid.appendChild(choiceCard({
          label: o.label, icon: o.icon,
          selected: draft.sex === o.key,
          testid: "pquiz-sex-" + o.key,
          onPick: () => { draft.sex = o.key; goto(idx + 1, "next"); }
        }));
      }
      return stepShell({
        eyebrow: "About you",
        title: "What's your biological sex?",
        subtitle: "Used to estimate how many calories your body burns.",
        content: grid
      });
    }

    function cmToFtIn(cm) {
      const totalIn = cm / 2.54;
      const ft = Math.floor(totalIn / 12);
      const inch = Math.round(totalIn - ft * 12);
      return `${ft}′${inch}″`;
    }

    function renderAge() {
      // Date of birth rather than age: it stays correct as time passes, and a
      // birthday is easier to recall accurately than "how old am I now?".
      const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const now = new Date();
      const maxYear = now.getFullYear() - 13;   // matches the old 13+ floor
      const minYear = now.getFullYear() - 100;
      const parsed = (draft.dob || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
      let y = parsed ? +parsed[1] : (now.getFullYear() - 25);
      let mo = parsed ? +parsed[2] : 1;
      let d = parsed ? +parsed[3] : 1;
      const daysIn = (yy, mm) => new Date(yy, mm, 0).getDate();

      const caption = el("div", { class: "quiz-wheel-unit text-faint", "data-testid": "quiz-dob-caption" });
      let dayWheel;
      const sync = () => {
        const max = daysIn(y, mo);
        if (d > max) { d = max; if (dayWheel) dayWheel.setValue(d); }
        draft.dob = `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const age = U.ageFromDob(draft.dob);
        draft.age = age;   // keep the derived age for anything reading it
        caption.textContent = age != null ? `${age} years old` : "";
      };
      dayWheel = buildWheel({
        items: wheelRange(1, 31, 1), value: d, variant: "wheel-quiz", itemHeight: 54,
        testid: "quiz-wheel-dob-day", onChange: (v) => { d = v; sync(); }
      });
      const monWheel = buildWheel({
        items: MONTHS.map((m, i) => ({ value: i + 1, label: m })), value: mo,
        variant: "wheel-quiz", itemHeight: 54, testid: "quiz-wheel-dob-month",
        onChange: (v) => { mo = v; sync(); }
      });
      const yearWheel = buildWheel({
        items: wheelRange(minYear, maxYear, 1), value: y, variant: "wheel-quiz", itemHeight: 54,
        testid: "quiz-wheel-dob-year", onChange: (v) => { y = v; sync(); }
      });
      sync();
      return stepShell({
        eyebrow: "About you",
        title: "When were you born?",
        content: el("div", { class: "quiz-wheel" },
          el("div", { class: "dob-wheels" },
            el("div", { class: "dob-col" }, dayWheel.el),
            el("div", { class: "dob-col dob-col-month" }, monWheel.el),
            el("div", { class: "dob-col" }, yearWheel.el)
          ),
          caption),
        footer: primaryBtn("Continue", () => { sync(); goto(idx + 1, "next"); })
      });
    }

    function renderHeight() {
      // Imperial spins whole inches and reads out as feet-and-inches; metric
      // spins centimetres and shows the ft/in equivalent underneath. Either
      // way the draft holds centimetres.
      const imp = U.isImperial();
      const label = (cm) => imp ? `${U.formatHeight(cm)} · ${Math.round(cm)} cm` : `${cmToFtIn(cm)} · cm`;
      const cap = el("div", { class: "quiz-wheel-unit text-faint" }, label(draft.heightCm));
      const wheelC = buildWheel({
        items: imp
          ? wheelRange(48, 86, 1, (i) => `${Math.floor(i / 12)}′ ${i % 12}″`)
          : wheelRange(120, 220, 1),
        value: imp ? Math.round(draft.heightCm / 2.54) : Math.round(draft.heightCm),
        variant: "wheel-quiz", itemHeight: 54, testid: "quiz-wheel-height",
        onChange: (v) => {
          draft.heightCm = imp ? U.ftInToCm(Math.floor(v / 12), v % 12) : v;
          cap.textContent = label(draft.heightCm);
        }
      });
      return stepShell({
        eyebrow: "About you",
        title: "How tall are you?",
        content: el("div", { class: "quiz-wheel" }, wheelC.el, cap),
        footer: primaryBtn("Continue", () => {
          const v = wheelC.getValue();
          draft.heightCm = imp ? U.ftInToCm(Math.floor(v / 12), v % 12) : v;
          goto(idx + 1, "next");
        })
      });
    }

    function renderWeight() {
      // The wheel spins in whatever the user weighs themselves in; the draft
      // stays kilograms, because that is what gets stored.
      const imp = U.isImperial();
      const wheelC = buildWheel({
        items: imp ? wheelRange(66, 440, 1, v => String(v)) : wheelRange(30, 200, 0.5, v => String(v)),
        value: imp ? Math.round(U.toDisplayWeight(draft.weightKg)) : Math.round(draft.weightKg * 2) / 2,
        variant: "wheel-quiz", itemHeight: 54, testid: "quiz-wheel-weight",
        onChange: (v) => { draft.weightKg = imp ? U.fromDisplayWeight(v) : v; }
      });
      return stepShell({
        eyebrow: "About you",
        title: "What's your current weight?",
        subtitle: "You can update this any time from Home.",
        content: el("div", { class: "quiz-wheel" }, wheelC.el, el("div", { class: "quiz-wheel-unit text-faint" }, U.weightUnit())),
        footer: primaryBtn("Continue", () => {
          const v = wheelC.getValue();
          draft.weightKg = imp ? U.fromDisplayWeight(v) : v;
          goto(idx + 1, "next");
        })
      });
    }

    function renderActivity() {
      const list = el("div", { class: "pquiz-list" });
      for (const [key, meta] of Object.entries(U.ACTIVITY_LEVELS)) {
        list.appendChild(choiceCard({
          label: meta.label, hint: meta.hint,
          selected: draft.activityLevel === key,
          testid: "pquiz-activity-" + key,
          onPick: () => { draft.activityLevel = key; goto(idx + 1, "next"); }
        }));
      }
      return stepShell({
        eyebrow: "Your week",
        // A normal WEEK, training included. This said "outside the gym — gym
        // sessions are tracked separately" and it was the single most wrong
        // line in the app: the bands below already assume training, so
        // answering it that way put a desk-job lifter six hundred calories a
        // day under their own maintenance.
        title: "How active is a normal week?",
        subtitle: "Count your training — these already include it.",
        content: list
      });
    }

    function renderGoal() {
      const list = el("div", { class: "pquiz-list" });
      const goalIcon = { maintain: "⚖️", cut: "📉", cut_hard: "🔥", bulk: "📈", bulk_hard: "💪" };
      for (const [key, meta] of Object.entries(U.GOAL_INTENTS)) {
        list.appendChild(choiceCard({
          label: meta.label, hint: meta.hint, icon: goalIcon[key] || "🎯",
          selected: draft.goalIntent === key,
          testid: "pquiz-goal-" + key,
          onPick: () => { draft.goalIntent = key; goto(idx + 1, "next"); }
        }));
      }
      return stepShell({
        eyebrow: "Your goal",
        title: "What are you aiming for?",
        content: list
      });
    }

    function computeTargets() {
      const calc = U.computeEnergyBudget({
        sex: draft.sex, age: draft.age, dob: draft.dob, heightCm: draft.heightCm,
        activityLevel: draft.activityLevel, weightKg: draft.weightKg,
        workoutKcal: 0, goalIntent: draft.goalIntent,
        kcalOffset: state.prefs.kcalOffset || 0
      });
      const manualKcal = state.prefs.kcalGoalMode === "manual";
      const budget = manualKcal
        ? (state.prefs.kcalGoal || calc.budget || 2200)
        : (calc.complete ? calc.budget : (state.prefs.kcalGoal || 2200));
      const macros = U.computeMacroGoals({
        weightKg: draft.weightKg,
        kcalBudget: budget,
        // The goal the quiz just asked for, not the one on file — this runs
        // before anything is saved, and the reveal has to show the targets the
        // answers actually produce.
        proteinPerKg: U.resolveProteinPerKg(state.prefs.proteinPerKg, draft.goalIntent).perKg,
        fatPercent: state.prefs.fatPercent || U.DEFAULT_FAT_PERCENT
      });
      return { calc, budget, macros, manualKcal };
    }

    function renderReveal() {
      const { budget, macros } = computeTargets();
      const name = (draft.profileName || "").trim();
      const macroRow = el("div", { class: "pquiz-macros" },
        el("div", { class: "pquiz-macro" },
          el("div", { class: "pquiz-macro-v", "data-testid": "pquiz-protein" }, `${macros.protein}g`),
          el("div", { class: "pquiz-macro-k" }, "Protein")),
        el("div", { class: "pquiz-macro" },
          el("div", { class: "pquiz-macro-v" }, `${macros.carbs}g`),
          el("div", { class: "pquiz-macro-k" }, "Carbs")),
        el("div", { class: "pquiz-macro" },
          el("div", { class: "pquiz-macro-v" }, `${macros.fat}g`),
          el("div", { class: "pquiz-macro-k" }, "Fat"))
      );
      const content = el("div", { class: "pquiz-reveal" },
        el("div", { class: "pquiz-reveal-badge" }, "Your daily target"),
        el("div", { class: "pquiz-reveal-kcal", "data-testid": "pquiz-reveal-kcal" },
          el("span", { class: "pquiz-reveal-num" }, String(budget).replace(/\B(?=(\d{3})+(?!\d))/g, ",")),
          el("span", { class: "pquiz-reveal-unit" }, "kcal")
        ),
        macroRow,
        el("div", { class: "pquiz-reveal-note text-faint" },
          "Suggested from your profile — you can fine-tune everything in Settings.")
      );
      return stepShell({
        eyebrow: name ? `You're all set, ${name}` : "You're all set",
        title: "Here's your starting plan",
        content,
        footer: primaryBtn(firstRun ? "Start training" : "Save my profile", saveQuiz, "pquiz-finish")
      });
    }

    const RENDERERS = {
      name: renderName, sex: renderSex, age: renderAge, height: renderHeight,
      weight: renderWeight, activity: renderActivity, goal: renderGoal, reveal: renderReveal
    };

    async function saveQuiz() {
      const { budget, macros, manualKcal } = computeTargets();
      const manualMacros = state.prefs.macroGoalMode === "manual";

      // Persist profile basics
      state.prefs.profileName = (draft.profileName || "").trim();
      state.prefs.sex = draft.sex;
      // Telling us your sex here is more authoritative than a map toggle you
      // may have flipped earlier, so the body map follows the profile.
      if (draft.sex === "male" || draft.sex === "female") state.prefs.bodyMapSex = draft.sex;
      state.prefs.age = draft.age;
      state.prefs.dob = draft.dob || null;
      state.prefs.heightCm = draft.heightCm;
      state.prefs.activityLevel = draft.activityLevel;
      state.prefs.goalIntent = draft.goalIntent;
      state.prefs.onboarded = true;

      await Storage.setPref("profileName", state.prefs.profileName);
      await Storage.setPref("sex", draft.sex);
      if (draft.sex === "male" || draft.sex === "female") await Storage.setPref("bodyMapSex", draft.sex);
      await Storage.setPref("age", draft.age);
      await Storage.setPref("dob", draft.dob || null);
      await Storage.setPref("heightCm", draft.heightCm);
      await Storage.setPref("activityLevel", draft.activityLevel);
      await Storage.setPref("goalIntent", draft.goalIntent);
      await Storage.setPref("onboarded", true);

      // Log today's bodyweight if new or changed (never clobber an identical entry silently)
      if (!bwLogged || Math.abs(draft.weightKg - startWeight) > 0.01) {
        try {
          await Storage.saveBodyweight({ date: U.todayISO(), kg: draft.weightKg });
        } catch (_) { /* non-fatal */ }
      }

      // Auto modes: let the quiz set sensible calorie + macro targets. Manual
      // overrides set in Settings are left untouched.
      if (!manualKcal) {
        state.prefs.kcalGoalMode = "auto";
        state.prefs.kcalGoal = budget;
        await Storage.setPref("kcalGoalMode", "auto");
        await Storage.setPref("kcalGoal", budget);
      }
      if (!manualMacros) {
        state.prefs.macroGoalMode = "auto";
        state.prefs.proteinGoal = macros.protein;
        state.prefs.carbsGoal = macros.carbs;
        state.prefs.fatGoal = macros.fat;
        await Storage.setPref("macroGoalMode", "auto");
        await Storage.setPref("proteinGoal", macros.protein);
        await Storage.setPref("carbsGoal", macros.carbs);
        await Storage.setPref("fatGoal", macros.fat);
      }

      finishAndClose();
      renderMain();
      toast(`You're set — ${budget} kcal a day`);
    }

    function goto(next, dir) {
      idx = Math.max(0, Math.min(STEPS.length - 1, next));
      const stepId = STEPS[idx];
      const node = RENDERERS[stepId]();
      node.classList.add(dir === "back" ? "slide-in-back" : "slide-in-next");
      clear(stage);
      stage.appendChild(node);

      backBtn.style.visibility = idx > 0 ? "visible" : "hidden";
      const pct = Math.min(100, Math.round((Math.min(idx, LAST_INPUT) / LAST_INPUT) * 100));
      bar.style.width = pct + "%";
    }

    document.body.appendChild(overlay);
    goto(0, "next");
  }

  // ============ Reusable picker wheel ============
  // A vertical scroll picker: the centred item scales up + brightens.
  // Returns { el, getValue, setValue }. Used inline (setup quiz) and inside
  // openWheelSheet (tap-to-open bottom sheet for compact forms).
  function buildWheel({ items, value, onChange, itemHeight = 44, visibleCount = 5, variant = "", testid }) {
    const H = itemHeight * visibleCount;
    const pad = (H - itemHeight) / 2;
    const wheel = el("div", { class: "wheel" + (variant ? " " + variant : ""), "data-testid": testid || "wheel" });
    wheel.style.height = H + "px";
    wheel.style.padding = pad + "px 0";
    const itemEls = items.map((it, i) => {
      const b = el("button", { type: "button", class: "wheel-item", "data-i": String(i),
        on: { click: () => centerOn(i, true) } }, el("span", { class: "wheel-item-label" }, it.label));
      b.style.height = itemHeight + "px";
      return b;
    });
    itemEls.forEach(e => wheel.appendChild(e));
    const sel = el("div", { class: "wheel-selection" }); sel.style.height = itemHeight + "px";
    const wrap = el("div", { class: "wheel-wrap" }, sel, wheel);
    wrap.style.height = H + "px";

    let activeIdx = items.findIndex(it => String(it.value) === String(value));
    if (activeIdx < 0) activeIdx = 0;

    function paint() {
      const center = wheel.scrollTop + H / 2;
      let best = 0, bd = Infinity;
      for (let i = 0; i < itemEls.length; i++) {
        const c = itemEls[i].offsetTop + itemHeight / 2;
        const d = Math.abs(c - center);
        if (d < bd) { bd = d; best = i; }
        const dist = Math.min(3, d / itemHeight);
        itemEls[i].style.transform = `scale(${(1 - dist * 0.16).toFixed(3)})`;
        itemEls[i].style.opacity = String(Math.max(0.2, 1 - dist * 0.34).toFixed(3));
        itemEls[i].classList.remove("is-active");
      }
      itemEls[best].classList.add("is-active");
      if (best !== activeIdx) { activeIdx = best; onChange && onChange(items[best].value, items[best]); }
    }
    let raf = null;
    wheel.addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(() => { raf = null; paint(); }); }, { passive: true });
    function centerOn(i, smooth) { wheel.scrollTo({ top: i * itemHeight, behavior: smooth ? "smooth" : "auto" }); }
    requestAnimationFrame(() => { wheel.scrollTop = activeIdx * itemHeight; paint(); });

    return {
      el: wrap,
      getValue: () => items[activeIdx].value,
      setValue: (v) => { const i = items.findIndex(it => String(it.value) === String(v)); if (i >= 0) { activeIdx = i; centerOn(i, false); requestAnimationFrame(paint); } }
    };
  }

  // Build {value,label} items for a numeric range (inclusive).
  function wheelRange(min, max, step = 1, fmt) {
    const out = [];
    const n = Math.round((max - min) / step);
    for (let k = 0; k <= n; k++) {
      const v = Math.round((min + k * step) * 1000) / 1000;
      out.push({ value: v, label: fmt ? fmt(v) : String(v) });
    }
    return out;
  }

  // Bottom sheet with a wheel + Done — for compact fields.
  function openWheelSheet({ title, items, value, unit, onPick }) {
    const overlay = el("div", { class: "wsheet-overlay", "data-testid": "wheel-sheet",
      on: { click: (e) => { if (e.target === overlay) close(); } } });
    function onKey(e) { if (e.key === "Escape") { e.preventDefault(); close(); } }
    const close = () => { document.removeEventListener("keydown", onKey); overlay.remove(); };
    document.addEventListener("keydown", onKey);
    const wheelC = buildWheel({ items, value, itemHeight: 44, visibleCount: 5, variant: "wheel-sheet" });
    const sheet = el("div", { class: "wsheet" },
      el("div", { class: "wsheet-title" }, title || "Choose"),
      el("div", { class: "wsheet-wheel" }, wheelC.el, unit ? el("div", { class: "wsheet-unit" }, unit) : null),
      el("div", { class: "wsheet-actions" },
        el("button", { class: "btn", on: { click: close } }, "Cancel"),
        el("button", { class: "btn btn-primary", "data-testid": "wheel-sheet-done",
          on: { click: () => { const v = wheelC.getValue(); close(); onPick && onPick(v); } } }, "Done")
      )
    );
    overlay.appendChild(sheet);
    document.body.appendChild(overlay);
    makeDismissible(sheet, close);
  }

  // A field-style button showing the current value; tap opens a wheel sheet.
  function wheelField({ value, items, unit, title, testid, onPick }) {
    const btn = el("button", { type: "button", class: "wheel-field", "data-testid": testid });
    let cur = value;
    const render = () => {
      const item = items.find(it => String(it.value) === String(cur));
      btn.textContent = (item ? item.label : String(cur)) + (unit ? ` ${unit}` : "");
    };
    btn.addEventListener("click", () => openWheelSheet({
      title, items, value: cur, unit,
      onPick: (v) => { cur = v; render(); onPick && onPick(v); }
    }));
    render();
    return btn;
  }

  // Replace a <select> with a wheel field. The select stays in the DOM
  // (hidden) so its value + change listeners keep working; the wheel writes
  // back to it. Returns a wrapper to drop in wherever the select went.
  function wheelizeSelect(selectEl, opts = {}) {
    const items = Array.from(selectEl.options).map(o => ({ value: o.value, label: o.textContent }));
    selectEl.style.display = "none";
    selectEl.setAttribute("aria-hidden", "true");
    const field = wheelField({
      value: selectEl.value, items, title: opts.title || "Choose", testid: opts.testid,
      onPick: (v) => {
        selectEl.value = String(v);
        selectEl.dispatchEvent(new Event("change", { bubbles: true }));
        selectEl.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
    if (opts.class) field.classList.add(opts.class);
    return el("span", { class: "wheel-select" }, field, selectEl);
  }

  async function openSettings(opts = {}) {
    const weightKg = await getBodyweightKg();
    const restI = el("input", { class: "input input-num", type: "number", value: state.prefs.defaultRestSec });
    const weeklyGoalI = el("input", {
      class: "input input-num", type: "number", inputmode: "numeric",
      min: "1", max: "14", step: "1",
      value: state.prefs.weeklyWorkoutGoal || 4
    });

    // ---- My kit: what equipment the user can actually get to ----
    const kitPicked = new Set(Array.isArray(state.prefs.myKit) ? state.prefs.myKit : []);
    const kitGrid = el("div", { class: "kit-grid", "data-testid": "kit-grid" });
    function syncKit() {
      for (const b of Array.from(kitGrid.children)) {
        const on = kitPicked.has(b.getAttribute("data-gear"));
        b.classList.toggle("active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      }
    }
    function setKit(list) {
      kitPicked.clear();
      list.forEach(g => kitPicked.add(g));
      syncKit();
    }
    for (const g of GEAR_ORDER) {
      kitGrid.appendChild(el("button", {
        class: "kit-chip", type: "button", "data-gear": g, "aria-pressed": "false",
        "data-testid": `kit-${g}`,
        on: { click: () => { if (kitPicked.has(g)) kitPicked.delete(g); else kitPicked.add(g); syncKit(); } }
      }, GEAR_META[g]));
    }
    syncKit();

    // Wrap a hidden input/select with a tap-to-open wheel field. The original
    // control stays in the DOM (hidden) so existing preview/save reads and
    // change listeners keep working unchanged.
    function wheelWrap(inputEl, { title, items, unit, testid }) {
      inputEl.style.display = "none";
      const field = wheelField({
        value: inputEl.value, items, unit, title, testid,
        onPick: (v) => {
          inputEl.value = String(v);
          inputEl.dispatchEvent(new Event("input", { bubbles: true }));
          inputEl.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
      return el("div", { class: "wheel-field-wrap" }, field, inputEl);
    }

    const nameI = el("input", {
      class: "input", type: "text", maxlength: "40", placeholder: "e.g. Takis",
      value: state.prefs.profileName || "",
      "data-testid": "input-profile-name"
    });

    // ---- Energy profile fields ----
    const sexS = el("select", { class: "select" },
      el("option", { value: "" }, "Select…"),
      el("option", { value: "male" }, "Male"),
      el("option", { value: "female" }, "Female")
    );
    sexS.value = state.prefs.sex || "";

    const ageI = el("input", {
      class: "input input-num", type: "number", inputmode: "numeric",
      min: "13", max: "100", placeholder: "e.g. 28",
      // Shows the age derived from DOB when one is set.
      value: U.effectiveAge(state.prefs) ?? ""
    });
    const heightI = el("input", {
      class: "input input-num", type: "number", inputmode: "decimal",
      min: "100", max: "250", step: "0.1", placeholder: "e.g. 178",
      value: state.prefs.heightCm ?? ""
    });

    const activityS = el("select", { class: "select" });
    for (const [key, meta] of Object.entries(U.ACTIVITY_LEVELS)) {
      activityS.appendChild(el("option", { value: key }, meta.label));
    }
    activityS.value = state.prefs.activityLevel && U.ACTIVITY_LEVELS[state.prefs.activityLevel]
      ? state.prefs.activityLevel : "light";

    const activityHint = el("div", { class: "text-xs text-faint mt-8" },
      U.ACTIVITY_LEVELS[activityS.value]?.hint || "");

    const goalIntentS = el("select", { class: "select" });
    for (const [key, meta] of Object.entries(U.GOAL_INTENTS)) {
      goalIntentS.appendChild(el("option", { value: key }, meta.label));
    }
    goalIntentS.value = U.normalizeGoalIntent(state.prefs.goalIntent);
    const goalIntentHint = el("div", { class: "text-xs text-faint mt-8" },
      U.GOAL_INTENTS[goalIntentS.value]?.hint || "");

    const offsetI = el("input", {
      class: "input input-num", type: "number", inputmode: "numeric",
      min: String(U.KCAL_OFFSET_MIN), max: String(U.KCAL_OFFSET_MAX), step: "10",
      placeholder: "0",
      value: state.prefs.kcalOffset ?? 0
    });
    const offsetHint = el("div", { class: "text-xs text-faint mt-8" },
      "After a few weeks of tracking, nudge this if the scale isn't moving as expected (e.g. −150). Range " +
      `${U.KCAL_OFFSET_MIN} to +${U.KCAL_OFFSET_MAX}.`
    );

    // What the logs say, next to the field it would fill in. The offset has
    // always been the right mechanism for "the equation is wrong about me" —
    // it just never said what to put in it, so it stayed at zero.
    const calibCard = el("div", { class: "card calib-card", "data-testid": "calib-card" });
    async function renderCalibration() {
      clear(calibCard);
      const [bws, meals] = await Promise.all([Storage.getBodyweights(), Storage.getMeals()]);
      const intakeByDate = {};
      for (const m of meals || []) {
        if (!m || !m.date) continue;
        intakeByDate[m.date] = (intakeByDate[m.date] || 0) + (Number(m.kcal) || 0);
      }
      const est = U.estimateMaintenance({ weighIns: bws || [], intakeByDate });
      calibCard.appendChild(el("div", { class: "calib-title" }, "What your logs say"));

      if (!est.ok) {
        calibCard.appendChild(el("div", { class: "text-xs text-faint", "data-testid": "calib-blocked" },
          "Not enough logged yet to measure your maintenance. This needs " +
          est.reasons.map((r) => r.text).join(", and ") + "."));
        // Naming the arithmetic even while it is unavailable, because the
        // requirements read as arbitrary until you know what they are for.
        calibCard.appendChild(el("div", { class: "text-xs text-faint mt-8" },
          "Weight moves on water as much as on fat, so short stretches and patchy food logs " +
          "produce a number that looks exact and is mostly noise."));
        return;
      }

      // Against the rest-day figure: measured maintenance is a long-run
      // average that already includes however much this person trains.
      const restDay = U.computeEnergyBudget({
        sex: sexS.value, age: parseInt(ageI.value, 10), heightCm: parseFloat(heightI.value),
        activityLevel: activityS.value, weightKg, workoutKcal: 0,
        goalIntent: goalIntentS.value, kcalOffset: 0
      });
      const dir = est.deltaKg < 0 ? "lost" : (est.deltaKg > 0 ? "gained" : "held");
      const amount = Math.abs(est.deltaKg) < 0.05
        ? "held steady"
        : `${dir} ${U.trimNum(Math.abs(U.toDisplayWeight(est.deltaKg)))}${U.weightUnit()}`;
      calibCard.appendChild(el("div", { class: "text-sm", "data-testid": "calib-measured" },
        `Over ${est.elapsedDays} days you ${amount} while averaging ${est.avgIntake} kcal a day. ` +
        `That puts your maintenance near ${est.maintenance}.`));
      calibCard.appendChild(el("div", { class: "text-xs text-faint mt-8" },
        `From ${est.weighIns} weigh-ins and ${est.loggedDays} days of food. ` +
        "Rounded — it is not exact to the calorie."));

      if (!restDay.complete) {
        calibCard.appendChild(el("div", { class: "text-xs text-faint mt-8" },
          "Fill in the profile above and this can be compared with the estimate."));
        return;
      }
      const sug = U.offsetFromMeasured(est.maintenance, restDay.tdee);
      if (!sug) return;
      const gap = sug.raw;
      if (Math.abs(gap) < 50) {
        calibCard.appendChild(el("div", { class: "text-sm mt-8", "data-testid": "calib-agrees" },
          `The estimate says ${restDay.tdee}, so it already agrees with you. Nothing to change.`));
        return;
      }
      calibCard.appendChild(el("div", { class: "text-sm mt-8" },
        `The estimate says ${restDay.tdee} — ${Math.abs(gap)} ${gap > 0 ? "below" : "above"} what your logs show.`));
      if (sug.clamped) {
        calibCard.appendChild(el("div", { class: "text-xs text-faint mt-8" },
          `A tweak of ${gap} is outside the ${U.KCAL_OFFSET_MIN} to +${U.KCAL_OFFSET_MAX} range, so this would set ` +
          `${sug.offset}. A gap that large usually means a water swing rather than a real difference — ` +
          "worth another fortnight before trusting it."));
      }
      if (includeTrainingCb.checked) {
        calibCard.appendChild(el("div", { class: "text-xs text-faint mt-8", "data-testid": "calib-training-warning" },
          "Training burn is being added to your food room as well. What the scale measured already " +
          "includes your training, so applying this would count it twice — turn that off first."));
      }
      calibCard.appendChild(el("button", {
        class: "btn btn-sm btn-primary mt-8", type: "button", "data-testid": "calib-apply",
        on: { click: () => { offsetI.value = String(sug.offset); refreshPreview(); toast("Personal tweak set — Save to keep it"); } }
      }, `Set personal tweak to ${sug.offset > 0 ? "+" : ""}${sug.offset}`));
    }

    const includeTrainingCb = el("input", {
      type: "checkbox",
      id: "include-training-food-room"
    });
    includeTrainingCb.checked = !!state.prefs.includeTrainingInFoodRoom;
    // The honest reason to leave this off is not that MET estimates are rough,
    // though they are. It is that the activity band above already contains
    // training, so switching this on counts it a second time.
    const includeTrainingHint = el("div", { class: "text-xs text-faint mt-8" },
      "Off by default, and best left off: the activity level above already includes your training, " +
      "so adding the session estimate on top counts it twice. You still see the estimate on Home."
    );

    const warmupCb = el("input", { type: "checkbox", id: "warmup-toggle" });
    warmupCb.checked = state.prefs.warmupPrompt !== false;
    const warmupHint = el("div", { class: "text-xs text-faint mt-8" },
      "Before a session, suggest dynamic movement prep for the muscles you're about to train, plus ramp sets into your first lift. Always skippable in one tap."
    );

    const guidedSetsCb = el("input", { type: "checkbox", id: "guided-sets-toggle" });
    guidedSetsCb.checked = state.prefs.guidedSets !== false;
    const guidedSetsHint = el("div", { class: "text-xs text-faint mt-8" },
      "On by default. Strength sets open one at a time, full screen, with last session's numbers already filled in — one tap to log. " +
      "Tap a number to change it, or hold it to nudge. The set list is always one tap away and stays the way to edit anything already logged."
    );

    const backupReminderCb = el("input", {
      type: "checkbox",
      id: "backup-reminder-toggle"
    });
    backupReminderCb.checked = state.prefs.backupReminder !== false;
    const backupReminderHint = el("div", { class: "text-xs text-faint mt-8" },
      `On by default. Your data lives only on this device. Every ${BACKUP_REMINDER_EVERY} logged workouts, ` +
      "FitForge offers to save a backup file so nothing is lost."
    );

    // Food room mode + own number
    let goalMode = state.prefs.kcalGoalMode === "manual" ? "manual" : "auto";
    const modeAutoBtn = el("button", { type: "button", class: "btn btn-sm energy-mode-btn" }, "Suggested");
    const modeManualBtn = el("button", { type: "button", class: "btn btn-sm energy-mode-btn" }, "My number");

    const kcalI = el("input", {
      class: "input input-num", type: "number", inputmode: "numeric",
      value: state.prefs.kcalGoal || 2200
    });

    // ---- Macro goals ----
    let macroMode = state.prefs.macroGoalMode === "manual" ? "manual" : "auto";
    const macroAutoBtn = el("button", { type: "button", class: "btn btn-sm energy-mode-btn" }, "Suggested");
    const macroManualBtn = el("button", { type: "button", class: "btn btn-sm energy-mode-btn" }, "My numbers");

    // The empty value is "follow my goal", and it is first because it is the
    // right answer for almost everyone: protein need rises in a deficit and
    // falls in a surplus, and the goal is already on this screen. Picking a
    // number pins it and the goal stops moving it.
    const proteinPerKgS = el("select", { class: "select" });
    proteinPerKgS.appendChild(el("option", { value: "" }, "Follow my goal"));
    for (const opt of U.PROTEIN_PER_KG_OPTIONS) {
      proteinPerKgS.appendChild(el("option", { value: String(opt.value) }, `${opt.label} — ${opt.hint}`));
    }
    const curPpk = Number(state.prefs.proteinPerKg);
    const ppkMatch = curPpk > 0 && U.PROTEIN_PER_KG_OPTIONS.find(o => Math.abs(o.value - curPpk) < 0.05);
    proteinPerKgS.value = ppkMatch ? String(ppkMatch.value) : "";
    /** The g/kg the current selection means, resolving "follow my goal". */
    const ppkNow = () => U.resolveProteinPerKg(
      proteinPerKgS.value === "" ? null : parseFloat(proteinPerKgS.value),
      goalIntentS.value);

    const fatPctI = el("input", {
      class: "input input-num", type: "number", inputmode: "numeric",
      min: "15", max: "45", step: "1",
      value: state.prefs.fatPercent || U.DEFAULT_FAT_PERCENT
    });

    const proteinGoalI = el("input", {
      class: "input input-num", type: "number", inputmode: "decimal",
      min: "0", step: "1", placeholder: "g",
      value: state.prefs.proteinGoal || ""
    });
    const carbsGoalI = el("input", {
      class: "input input-num", type: "number", inputmode: "decimal",
      min: "0", step: "1", placeholder: "g",
      value: state.prefs.carbsGoal || ""
    });
    const fatGoalI = el("input", {
      class: "input input-num", type: "number", inputmode: "decimal",
      min: "0", step: "1", placeholder: "g",
      value: state.prefs.fatGoal || ""
    });

    const macroPreview = el("div", { class: "energy-settings-preview text-sm text-muted" });
    const autoMacroFields = el("div", { class: "macro-goal-auto-fields" });
    const manualMacroFields = el("div", { class: "macro-goal-manual-fields macro-fields" });

    const preview = el("div", { class: "energy-settings-preview text-sm text-muted" });

    // Live hero: big food-room number + checklist (updated as fields change)
    const heroKcal = el("div", {
      class: "settings-hero-kcal",
      "data-testid": "settings-hero-kcal"
    }, "—");
    const heroSub = el("div", { class: "settings-hero-sub text-xs text-faint" }, "");
    const heroMacros = el("div", {
      class: "settings-hero-macros",
      "data-testid": "settings-hero-macros"
    }, "");
    const heroBadge = el("div", {
      class: "settings-hero-badge",
      "data-testid": "settings-hero-badge"
    }, "Estimate");
    const checklistEl = el("div", {
      class: "settings-checklist",
      "data-testid": "settings-checklist"
    });
    const settingsHero = el("div", {
      class: "settings-hero card",
      "data-testid": "settings-food-room-hero"
    },
      el("div", { class: "row-between", style: "align-items:flex-start; gap:8px" },
        el("div", { class: "settings-hero-label" }, "Today's food room"),
        heroBadge
      ),
      heroKcal,
      heroSub,
      heroMacros,
      checklistEl
    );

    const bwLogged = await hasLoggedBodyweight();

    function readProfileDraft() {
      return {
        sex: sexS.value || null,
        age: ageI.value === "" ? null : parseInt(ageI.value, 10),
        heightCm: heightI.value === "" ? null : parseFloat(heightI.value),
        activityLevel: activityS.value,
        weightKg,
        goalIntent: U.normalizeGoalIntent(goalIntentS.value),
        kcalOffset: U.normalizeKcalOffset(offsetI.value === "" ? 0 : offsetI.value)
      };
    }

    function currentKcalBudget(calc) {
      if (goalMode === "auto" && calc.complete) return calc.budget;
      const n = parseInt(kcalI.value, 10);
      return Number.isFinite(n) && n > 0 ? n : (calc.budget || state.prefs.kcalGoal || 2200);
    }

    function refreshMacroPreview(calc) {
      macroAutoBtn.classList.toggle("btn-primary", macroMode === "auto");
      macroManualBtn.classList.toggle("btn-primary", macroMode === "manual");
      autoMacroFields.style.display = macroMode === "auto" ? "" : "none";
      manualMacroFields.style.display = macroMode === "manual" ? "" : "none";

      const budget = currentKcalBudget(calc);
      const resolvedPpk = ppkNow();
      const ppk = resolvedPpk.perKg;
      const fatPct = parseFloat(fatPctI.value) || U.DEFAULT_FAT_PERCENT;
      const auto = U.computeMacroGoals({
        weightKg,
        kcalBudget: budget,
        proteinPerKg: ppk,
        fatPercent: fatPct
      });

      if (macroMode === "auto") {
        proteinGoalI.value = String(auto.protein);
        carbsGoalI.value = String(auto.carbs);
        fatGoalI.value = String(auto.fat);
        // Say where the g/kg came from. "2.2 g/kg" on its own reads as a number
        // the app picked out of the air; naming the goal that chose it makes it
        // checkable, and makes it obvious why it moved when the goal did.
        const why = resolvedPpk.fromGoal
          ? `protein at ${ppk} g/kg (${(U.GOAL_INTENTS[goalIntentS.value]?.label || "your goal").toLowerCase()})`
          : `protein at ${ppk} g/kg`;
        // When the budget could not hold what was asked for, say which way it
        // gave and why. Otherwise the numbers simply come out different from
        // the settings above them and look like a bug.
        let squeeze = "";
        if (auto.belowFatFloor) {
          squeeze = ` That food room is below the ${auto.fatFloorG}g of fat this bodyweight needs, so these add up ` +
            "to more than it. The budget is the thing to change.";
        } else if (auto.squeezed) {
          squeeze = ` Protein and fat did not both fit, so fat held its ${auto.fatFloorG}g floor ` +
            `(${U.MIN_FAT_PER_KG} g/kg) and protein came down to ` +
            `${Math.round((auto.protein / weightKg) * 100) / 100} g/kg.`;
        }
        macroPreview.textContent =
          `From ${weightKg} kg bodyweight, ${why}, fat ${fatPct}% of ${budget} food room, carbs fill the rest: ` +
          `P ${auto.protein}g · C ${auto.carbs}g · F ${auto.fat}g.` + squeeze;
      } else {
        const p = parseFloat(proteinGoalI.value) || 0;
        const c = parseFloat(carbsGoalI.value) || 0;
        const f = parseFloat(fatGoalI.value) || 0;
        const est = U.kcalFromMacros({ protein: p, carbs: c, fat: f });
        macroPreview.textContent = p || c || f
          ? `Your targets: P ${p || 0}g · C ${c || 0}g · F ${f || 0}g (about ${est} from macros).`
          : "Enter protein, carbs and fat targets in grams.";
      }
    }

    function setupSteps(calc) {
      const bodyDone = !!(sexS.value && ageI.value && heightI.value);
      const dayDone = !!(activityS.value && U.ACTIVITY_LEVELS[activityS.value]);
      const goalDone = !!(goalIntentS.value && U.GOAL_INTENTS[goalIntentS.value]);
      // "Follow my goal" is an empty select value and a complete answer, so
      // only the fat field is still required for the auto branch to be done.
      const macrosDone = macroMode === "manual"
        ? !!(parseFloat(proteinGoalI.value) || parseFloat(carbsGoalI.value) || parseFloat(fatGoalI.value))
        : !!fatPctI.value;
      return [
        {
          id: "body",
          label: "Body",
          done: bodyDone,
          hint: bodyDone
            ? (bwLogged ? `${weightKg} kg logged` : "Profile set · log bodyweight on Home")
            : "Sex, age, height"
        },
        {
          id: "day",
          label: "Day",
          done: dayDone,
          hint: dayDone ? (U.ACTIVITY_LEVELS[activityS.value]?.label || "Activity set") : "How active a normal day is"
        },
        {
          id: "goal",
          label: "Goal",
          done: goalDone,
          hint: goalDone ? (U.GOAL_INTENTS[goalIntentS.value]?.label || "Goal set") : "Cut, maintain or bulk"
        },
        {
          id: "macros",
          label: "Macros",
          done: macrosDone,
          hint: macrosDone
            ? (macroMode === "manual" ? "Your gram targets" : `${ppkNow().perKg} g/kg · fat ${fatPctI.value}%`)
            : "Protein and fat targets"
        }
      ];
    }

    function paintChecklist(steps) {
      clear(checklistEl);
      const doneCount = steps.filter(s => s.done).length;
      checklistEl.appendChild(el("div", { class: "settings-checklist-progress text-xs text-faint" },
        `${doneCount} of ${steps.length} setup steps`));
      const row = el("div", { class: "settings-checklist-row" });
      for (const step of steps) {
        row.appendChild(el("div", {
          class: "settings-check-step" + (step.done ? " is-done" : ""),
          title: step.hint,
          "data-testid": `settings-step-${step.id}`
        },
          el("div", { class: "settings-check-step-label" }, step.label),
          el("div", { class: "settings-check-step-hint" }, step.hint)
        ));
      }
      checklistEl.appendChild(row);
    }

    function refreshPreview() {
      activityHint.textContent = U.ACTIVITY_LEVELS[activityS.value]?.hint || "";
      goalIntentHint.textContent = U.GOAL_INTENTS[goalIntentS.value]?.hint || "";
      const draft = readProfileDraft();
      // Settings preview is rest-day style (no session burn). Home may add training if enabled.
      const calc = U.computeEnergyBudget({ ...draft, workoutKcal: 0 });
      modeAutoBtn.classList.toggle("btn-primary", goalMode === "auto");
      modeManualBtn.classList.toggle("btn-primary", goalMode === "manual");
      kcalI.disabled = goalMode === "auto" && calc.complete;

      const budget = currentKcalBudget(calc);
      const steps = setupSteps(calc);
      const profileReady = !!calc.complete;
      const isPersonal = goalMode === "manual" || (profileReady && bwLogged);

      heroKcal.textContent = String(budget || "—");
      heroKcal.classList.toggle("is-estimate", !isPersonal);
      heroBadge.textContent = isPersonal
        ? (goalMode === "manual" ? "Set by you" : "Suggested")
        : "Estimate";
      heroBadge.className = "settings-hero-badge" + (isPersonal ? " is-personal" : " is-estimate");

      if (calc.complete) {
        if (goalMode === "auto") kcalI.value = String(calc.budget);
        const bits = [];
        if (goalMode === "manual") bits.push("Your number");
        else bits.push("Suggested");
        if (calc.goalLabel) bits.push(calc.goalLabel);
        if (calc.activityLabel) bits.push(calc.activityLabel);
        if (!bwLogged) bits.push("default bodyweight");
        heroSub.textContent = bits.join(" · ");

        const fmtAdj = (n) => (n > 0 ? `+${n}` : String(n));
        const movementExtra = Math.max(0, (calc.tdee || 0) - (calc.bmr || 0));
        const detailBits = [
          `${weightKg} kg`,
          `body baseline ${calc.bmr}`,
          `activity +${movementExtra}`,
          `hold-weight ${calc.maintenance}`
        ];
        if (calc.goalAdj) detailBits.push(`${calc.goalLabel || "goal"} ${fmtAdj(calc.goalAdj)}`);
        if (calc.kcalOffset) detailBits.push(`personal tweak ${fmtAdj(calc.kcalOffset)}`);
        detailBits.push(`room ${calc.budget}`);
        const trainNote = includeTrainingCb.checked
          ? "Training burn will be added on Home when you log workouts — on top of the activity level, which already counts it."
          : "Training burn is shown on Home; the activity level above already accounts for it.";
        preview.textContent = detailBits.join(" · ") + ". " + trainNote;
      } else {
        heroSub.textContent = "Starter estimate until body details are complete";
        preview.textContent = "Add sex, age, height and how active a normal day is to unlock a suggested food room.";
        if (goalMode === "auto") {
          kcalI.disabled = false;
        }
      }

      // Macro line on hero
      const ppk = ppkNow().perKg;
      const fatPct = parseFloat(fatPctI.value) || U.DEFAULT_FAT_PERCENT;
      let p, c, f;
      if (macroMode === "auto") {
        const auto = U.computeMacroGoals({
          weightKg,
          kcalBudget: budget,
          proteinPerKg: ppk,
          fatPercent: fatPct
        });
        p = auto.protein; c = auto.carbs; f = auto.fat;
      } else {
        p = parseFloat(proteinGoalI.value) || 0;
        c = parseFloat(carbsGoalI.value) || 0;
        f = parseFloat(fatGoalI.value) || 0;
      }
      heroMacros.textContent = (p || c || f)
        ? `P ${p || 0}g · C ${c || 0}g · F ${f || 0}g`
        : "Macros appear once targets are set";

      paintChecklist(steps);
      refreshMacroPreview(calc);
    }

    modeAutoBtn.addEventListener("click", () => { goalMode = "auto"; refreshPreview(); });
    modeManualBtn.addEventListener("click", () => {
      goalMode = "manual";
      kcalI.disabled = false;
      refreshPreview();
      setTimeout(() => kcalI.focus(), 30);
    });
    macroAutoBtn.addEventListener("click", () => { macroMode = "auto"; refreshPreview(); });
    macroManualBtn.addEventListener("click", () => {
      macroMode = "manual";
      refreshPreview();
      setTimeout(() => proteinGoalI.focus(), 30);
    });
    for (const node of [sexS, ageI, heightI, activityS, goalIntentS, offsetI, proteinPerKgS, fatPctI, kcalI, proteinGoalI, carbsGoalI, fatGoalI, includeTrainingCb]) {
      node.addEventListener("input", refreshPreview);
      node.addEventListener("change", refreshPreview);
    }
    refreshPreview();
    // Async because it reads the logs. Re-run when the profile or the training
    // toggle changes, since both change what it has to say — but not on every
    // keystroke in the offset field, which it does not depend on.
    renderCalibration();
    for (const node of [sexS, ageI, heightI, activityS, includeTrainingCb]) {
      node.addEventListener("change", () => { renderCalibration(); });
    }

    autoMacroFields.append(
      el("div", { class: "form-row" },
        el("div", { style: "flex:1" },
          el("label", { class: "label" }, "Protein target"),
          wheelWrap(proteinPerKgS, {
            title: "Protein per kg",
            items: U.PROTEIN_PER_KG_OPTIONS.map(o => ({ value: String(o.value), label: `${o.value} g/kg` })),
            testid: "wheel-proteinperkg"
          })
        ),
        el("div", { style: "flex:1" },
          el("label", { class: "label" }, "Fat (% of kcal)"),
          wheelWrap(fatPctI, {
            title: "Fat % of kcal", items: wheelRange(15, 45, 1), unit: "%", testid: "wheel-fatpct"
          })
        )
      )
    );
    manualMacroFields.append(
      el("div", { class: "form-row" },
        el("div", { style: "flex:1" }, el("label", { class: "label" }, "Protein (g)"), proteinGoalI),
        el("div", { style: "flex:1" }, el("label", { class: "label" }, "Carbs (g)"), carbsGoalI),
        el("div", { style: "flex:1" }, el("label", { class: "label" }, "Fat (g)"), fatGoalI)
      )
    );

    // Appearance / theme — moved here from the (now removed) header toggle.
    const isDarkNow = document.documentElement.classList.contains("dark");
    const themeLight = el("button", { type: "button", class: "seg-btn" + (!isDarkNow ? " active" : ""), "data-testid": "theme-light" }, "Light");
    const themeDark = el("button", { type: "button", class: "seg-btn" + (isDarkNow ? " active" : ""), "data-testid": "theme-dark" }, "Dark");
    const setThemeChoice = async (t) => {
      document.documentElement.classList.toggle("dark", t === "dark");
      syncThemeColorMeta();
      state.prefs.theme = t;
      await Storage.setPref("theme", t);
      themeLight.classList.toggle("active", t !== "dark");
      themeDark.classList.toggle("active", t === "dark");
      syncSwatches();
    };
    themeLight.addEventListener("click", () => setThemeChoice("light"));
    themeDark.addEventListener("click", () => setThemeChoice("dark"));

    // Accent swatches. Each shows its own colour for the mode you're currently
    // in, so what you tap is what you get rather than a fixed sample chip.
    const accentRow = el("div", { class: "accent-row", "data-testid": "accent-row", role: "radiogroup", "aria-label": "Theme colour" });
    const currentAccent = () => document.documentElement.getAttribute("data-accent") || DEFAULT_ACCENT;
    // The swatch fills come from CSS (`.accent-swatch[data-accent=…]`), which
    // carries a light and a dark pair just like the tokens do — so a swatch
    // always shows the tone you'd actually get in the mode you're in.
    function syncSwatches() {
      const cur = currentAccent();
      for (const b of Array.from(accentRow.children)) {
        const on = b.getAttribute("data-accent") === cur;
        b.classList.toggle("active", on);
        b.setAttribute("aria-checked", on ? "true" : "false");
      }
    }
    const setAccentChoice = async (id) => {
      applyAccent(id);
      state.prefs.accent = id;
      await Storage.setPref("accent", id);
      syncSwatches();
    };
    for (const a of ACCENTS) {
      accentRow.appendChild(el("button", {
        class: "accent-swatch", type: "button", role: "radio", "aria-checked": "false",
        "data-accent": a.id, "data-testid": `accent-${a.id}`,
        title: a.label, "aria-label": a.label,
        on: { click: () => setAccentChoice(a.id) }
      }, el("span", { class: "accent-swatch-tick", html: icons.check })));
    }
    syncSwatches();

    // Units. Stored data never changes — only what the app draws and what a
    // typed number is taken to mean — so switching is free and reversible.
    const unitBtn = (system, label, sub) => el("button", {
      class: "seg-btn" + (state.prefs.units === system ? " active" : ""),
      type: "button", "data-testid": `units-${system}`,
      on: { click: async () => {
        if (state.prefs.units === system) return;
        state.prefs.units = system;
        U.setUnits(system);
        await Storage.setPref("units", system);
        closeModal();
        renderMain();
        toast(system === "imperial" ? "Showing pounds and miles" : "Showing kilograms and kilometres");
        openSettings();
      } }
    }, el("span", {}, label), el("span", { class: "seg-btn-sub" }, sub));

    const unitsSection = el("div", {},
      el("div", { class: "settings-section-title mt-16" }, "Units"),
      el("div", { class: "seg-control seg-control-block" },
        unitBtn("metric", "Metric", "kg · km · cm"),
        unitBtn("imperial", "Imperial", "lb · mi · ft")),
      el("div", { class: "text-xs text-faint", style: "margin-top: 6px" },
        "Changes how weights and distances are shown and entered. Everything already logged is converted on screen, not rewritten — food macros stay in grams either way.")
    );

    const appearanceSection = el("div", {},
      el("div", { class: "settings-section-title mt-16" }, "Appearance"),
      el("div", { class: "seg-control seg-control-block" }, themeLight, themeDark),
      accentRow
    );

    const body = el("div", { class: "settings-body" },
      // Hero — always first so setup feels outcome-led
      settingsHero,

      // Friendly path: relaunch the guided quiz instead of editing the dense form.
      el("button", {
        class: "btn pquiz-launch", type: "button",
        "data-testid": "open-guided-setup",
        on: { click: () => { closeModal(); openProfileQuiz({ firstRun: false }); } }
      },
        el("span", { class: "pquiz-launch-emoji" }, "✨"),
        el("span", {},
          el("span", { class: "pquiz-launch-title" }, "Guided setup"),
          el("span", { class: "pquiz-launch-sub" }, "Redo your profile as a quick quiz")
        )
      ),

      appearanceSection,
      unitsSection,

      el("div", { class: "settings-section-title mt-16", "data-step": "1" }, "1 · Body"),
      el("div", { class: "text-xs text-faint", style: "margin: -4px 0 10px" },
        "Sex, age and height unlock a suggested food room. Weight uses your latest bodyweight entry on Home."),
      el("div", { class: "form-row" },
        el("div", { style: "flex:1" }, el("label", { class: "label" }, "Name (for the home greeting)"), nameI)
      ),
      el("div", { class: "form-row" },
        el("div", { style: "flex:1" }, el("label", { class: "label" }, "Sex"), wheelizeSelect(sexS, { title: "Sex" })),
        el("div", { style: "flex:1" }, el("label", { class: "label" }, "Age"), ageI)
      ),
      el("div", { class: "form-row" },
        el("div", { style: "flex:1" }, el("label", { class: "label" }, "Height (cm)"), heightI),
        el("div", { style: "flex:1" },
          el("label", { class: "label" }, "Bodyweight"),
          el("div", {
            class: "settings-bw-readout" + (bwLogged ? "" : " is-missing"),
            "data-testid": "settings-bw-readout"
          }, bwLogged ? `${weightKg} kg (from Home)` : "Not logged yet — use Home → Bodyweight")
        )
      ),

      el("div", { class: "settings-section-title mt-16", "data-step": "2" }, "2 · Your normal day"),
      el("div", { class: "text-xs text-faint", style: "margin: -4px 0 10px" },
        "How active you are outside the gym (desk day vs on your feet). Gym sessions are tracked separately."),
      el("div", { class: "form-row" },
        el("div", { style: "flex:1" },
          el("label", { class: "label" }, "How active is a normal day?"),
          wheelizeSelect(activityS, { title: "Daily activity" }), activityHint)
      ),

      el("div", { class: "settings-section-title mt-16", "data-step": "3" }, "3 · Goal"),
      el("div", { class: "form-row" },
        el("div", { style: "flex:1" },
          el("label", { class: "label" }, "What are you aiming for?"),
          wheelizeSelect(goalIntentS, { title: "Goal" }), goalIntentHint),
        el("div", { style: "flex:1" },
          el("label", { class: "label" }, "Personal tweak"),
          offsetI, offsetHint)
      ),
      calibCard,
      el("div", { class: "settings-check-row mt-8" },
        el("label", { class: "settings-check-label", for: "include-training-food-room" },
          includeTrainingCb,
          el("span", {}, "Include training burn in today's food room")
        ),
        includeTrainingHint
      ),
      preview,

      el("div", { class: "settings-section-title mt-16", "data-step": "4" }, "4 · Food room & macros"),
      el("div", { class: "text-xs text-faint", style: "margin: -4px 0 10px" },
        "Suggested updates with your profile. My number locks a fixed daily total."),
      el("div", { class: "row", style: "gap: 8px; margin-bottom: 10px" }, modeAutoBtn, modeManualBtn),
      el("div", { class: "form-row" },
        el("div", { style: "flex:1" },
          el("label", { class: "label" }, "Room for today"),
          kcalI
        )
      ),
      el("div", { class: "text-xs text-faint", style: "margin: 4px 0 10px" },
        "Macros: protein from bodyweight, fat as a share of food room, carbs fill the rest — or set exact grams."),
      el("div", { class: "row", style: "gap: 8px; margin-bottom: 10px" }, macroAutoBtn, macroManualBtn),
      autoMacroFields,
      manualMacroFields,
      macroPreview,

      el("div", { class: "settings-section-title mt-16" }, "Training"),
      el("div", { class: "settings-check-row" },
        el("label", { class: "settings-check-label", for: "warmup-toggle" },
          warmupCb,
          el("span", {}, "Offer a warm-up before each session")
        ),
        warmupHint
      ),
      el("div", { class: "settings-check-row mt-8" },
        el("label", { class: "settings-check-label", for: "guided-sets-toggle" },
          guidedSetsCb,
          el("span", {}, "Guided set logging")
        ),
        guidedSetsHint
      ),
      el("div", { class: "form-row mt-8" },
        el("div", { style: "flex:1" }, el("label", { class: "label" }, "Default rest timer"),
          wheelWrap(restI, { title: "Default rest", items: wheelRange(15, 300, 15, s => U.formatTime(s)), testid: "wheel-rest" })),
        el("div", { style: "flex:1" }, el("label", { class: "label" }, "Weekly workout goal"),
          wheelWrap(weeklyGoalI, { title: "Weekly goal", items: wheelRange(1, 14, 1), unit: "workouts", testid: "wheel-weeklygoal" }))
      ),

      el("div", { class: "settings-section-title mt-16" }, "My kit"),
      el("div", { class: "text-xs text-muted mb-8" },
        "Tick what you can get to. The Sessions library then leads with what you can actually do — you can always show the rest. Bodyweight sessions are never hidden."),
      kitGrid,
      el("div", { class: "row mt-8", style: "gap: 8px; flex-wrap: wrap" },
        el("button", { class: "btn btn-sm", type: "button", "data-testid": "kit-full-gym",
          on: { click: () => setKit(GEAR_ORDER) } }, "Full gym"),
        el("button", { class: "btn btn-sm", type: "button", "data-testid": "kit-home",
          on: { click: () => setKit(["band", "dumbbell", "pullup-bar"]) } }, "Home basics"),
        el("button", { class: "btn btn-sm", type: "button", "data-testid": "kit-none",
          on: { click: () => setKit([]) } }, "Nothing")
      ),

      el("div", { class: "form-row mt-16" }, el("div", { style: "flex:1" },
        el("label", { class: "label" }, "Backup & restore"),
        buildStorageHealthRow(),
        el("div", { class: "text-xs text-muted mb-8" },
          `Last backup: ${formatBackupWhen(state.prefs.lastBackupAt)}` +
          (state.prefs.lastBackupAt
            ? ""
            : " — export a file before you clear the browser or update iOS.")
        ),
        el("div", { class: "row", style: "gap: 8px; flex-wrap: wrap" },
          el("button", { class: "btn", on: { click: async () => { await exportData(); renderMain(); } } }, "Export all data (JSON)"),
          el("button", { class: "btn", on: { click: exportCSV } }, "Export workouts (CSV)"),
          el("button", { class: "btn", on: { click: () => document.getElementById("import-file").click() } }, "Import backup")
        ),
        el("input", { type: "file", accept: ".json,application/json", id: "import-file", style: "display:none", on: { change: importData } }),
        el("div", { class: "settings-check-row mt-16" },
          el("label", { class: "settings-check-label", for: "backup-reminder-toggle" },
            backupReminderCb,
            el("span", {}, `Remind me to back up every ${BACKUP_REMINDER_EVERY} workouts`)
          ),
          backupReminderHint
        ),
        el("div", { class: "text-xs text-faint mt-8 backup-safety-tip" },
          "Data lives only on this device. Export a backup before clearing browser data, reinstalling the PWA, or major iOS/browser updates. Keep the JSON file in Files or Drive."
        )
      )),
      el("div", { class: "form-row mt-16" }, el("div", { style: "flex:1" },
        el("button", { class: "btn btn-danger", on: { click: async () => {
          if (!(await confirmDialog("This will permanently delete ALL workouts, meals, and settings. Are you sure?", { title: "Clear all data?", okLabel: "Continue", danger: true }))) return;
          if (!(await confirmDialog("Really delete everything? This cannot be undone.", { title: "Final confirmation", okLabel: "Delete everything", danger: true }))) return;
          await Storage.clearAll();
          state.prefs = {
            kcalGoal: 2200,
            kcalGoalMode: "auto",
            sex: null,
            age: null,
            heightCm: null,
            activityLevel: "light",
            goalIntent: U.DEFAULT_GOAL_INTENT,
            kcalOffset: U.DEFAULT_KCAL_OFFSET,
            includeTrainingInFoodRoom: false,
            macroGoalMode: "auto",
            proteinPerKg: null,
            fatPercent: U.DEFAULT_FAT_PERCENT,
            proteinGoal: 0,
            carbsGoal: 0,
            fatGoal: 0,
            weeklyWorkoutGoal: 4,
            defaultRestSec: 90,
            myKit: [],
            guidedSets: true,
            backupReminder: true,
            lastBackupWorkoutCount: 0,
            lastBackupAt: null,
            backupSnoozedUntil: null,
            theme: null,
            accent: null
          };
          state.activeWorkout = null;
          closeModal();
          renderMain();
          toast("All data cleared");
        } } }, "Clear all data")
      ))
    );

    const footer = el("div", {},
      el("button", { class: "btn", on: { click: closeModal } }, "Cancel"),
      el("button", { class: "btn btn-primary", on: { click: async () => {
        const age = ageI.value === "" ? null : parseInt(ageI.value, 10);
        const heightCm = heightI.value === "" ? null : parseFloat(heightI.value);
        if (age != null && (isNaN(age) || age < 13 || age > 100)) return toast("Enter a valid age (13–100)");
        if (heightCm != null && (isNaN(heightCm) || heightCm < 100 || heightCm > 250)) return toast("Enter height in cm (100–250)");

        const sex = sexS.value || null;
        const activityLevel = activityS.value || "light";
        const goalIntent = U.normalizeGoalIntent(goalIntentS.value);
        const kcalOffset = U.normalizeKcalOffset(offsetI.value === "" ? 0 : offsetI.value);
        let kcalGoal = parseInt(kcalI.value, 10);
        if (isNaN(kcalGoal) || kcalGoal < 0) return toast("Enter a valid food room number");

        const includeTrainingInFoodRoom = !!includeTrainingCb.checked;
        const backupReminder = !!backupReminderCb.checked;

        // If auto + complete profile, store rest-day room (training only added live if toggle on).
        if (goalMode === "auto") {
          const calc = U.computeEnergyBudget({
            sex, age, heightCm, activityLevel, weightKg,
            workoutKcal: 0, goalIntent, kcalOffset
          });
          if (calc.complete) kcalGoal = calc.budget;
        }

        // null is stored deliberately: it is what "follow my goal" means, and
        // what keeps the goal in charge on every later change.
        const proteinPerKgChoice = proteinPerKgS.value === ""
          ? null
          : (parseFloat(proteinPerKgS.value) || null);
        const proteinPerKg = U.resolveProteinPerKg(proteinPerKgChoice, goalIntent).perKg;
        let fatPercent = parseFloat(fatPctI.value);
        if (!Number.isFinite(fatPercent) || fatPercent < 15 || fatPercent > 45) {
          return toast("Fat % must be between 15 and 45");
        }
        let proteinGoal = 0;
        let carbsGoal = 0;
        let fatGoal = 0;
        if (macroMode === "auto") {
          const autoM = U.computeMacroGoals({
            weightKg,
            kcalBudget: kcalGoal,
            proteinPerKg,
            fatPercent
          });
          proteinGoal = autoM.protein;
          carbsGoal = autoM.carbs;
          fatGoal = autoM.fat;
        } else {
          const parseG = (v) => {
            if (v === "" || v == null) return 0;
            const n = parseFloat(v);
            return Number.isFinite(n) ? n : NaN;
          };
          proteinGoal = parseG(proteinGoalI.value);
          carbsGoal = parseG(carbsGoalI.value);
          fatGoal = parseG(fatGoalI.value);
          if ([proteinGoal, carbsGoal, fatGoal].some(v => Number.isNaN(v) || v < 0)) {
            return toast("Enter valid macro targets (0 or more)");
          }
          proteinGoal = Math.max(0, Math.round(proteinGoal));
          carbsGoal = Math.max(0, Math.round(carbsGoal));
          fatGoal = Math.max(0, Math.round(fatGoal));
          if (!proteinGoal && !carbsGoal && !fatGoal) {
            return toast("Enter at least one macro target, or switch to Auto");
          }
        }

        if ((sex === "male" || sex === "female") && sex !== state.prefs.sex) {
          state.prefs.bodyMapSex = sex;
          await Storage.setPref("bodyMapSex", sex);
        }
        state.prefs.sex = sex;
        state.prefs.age = age;
        // Typing an age here overrides a stored birth date — otherwise the DOB
        // would silently win and the edit would look ignored.
        if (state.prefs.dob && U.ageFromDob(state.prefs.dob) !== age) {
          state.prefs.dob = null;
          await Storage.setPref("dob", null);
        }
        state.prefs.heightCm = heightCm;
        state.prefs.activityLevel = activityLevel;
        state.prefs.goalIntent = goalIntent;
        state.prefs.kcalOffset = kcalOffset;
        state.prefs.kcalGoalMode = goalMode;
        state.prefs.kcalGoal = kcalGoal;
        state.prefs.macroGoalMode = macroMode;
        state.prefs.proteinPerKg = proteinPerKgChoice;
        state.prefs.fatPercent = fatPercent;
        state.prefs.proteinGoal = proteinGoal;
        state.prefs.carbsGoal = carbsGoal;
        state.prefs.fatGoal = fatGoal;
        let weeklyWorkoutGoal = parseInt(weeklyGoalI.value, 10);
        if (isNaN(weeklyWorkoutGoal) || weeklyWorkoutGoal < 1 || weeklyWorkoutGoal > 14) {
          return toast("Weekly goal must be 1–14 workouts");
        }
        state.prefs.profileName = nameI.value.trim();
        state.prefs.defaultRestSec = parseInt(restI.value, 10) || 90;
        state.prefs.weeklyWorkoutGoal = weeklyWorkoutGoal;
        state.prefs.backupReminder = backupReminder;

        await Storage.setPref("profileName", state.prefs.profileName);
        await Storage.setPref("sex", sex);
        await Storage.setPref("age", age);
        await Storage.setPref("heightCm", heightCm);
        await Storage.setPref("activityLevel", activityLevel);
        await Storage.setPref("goalIntent", goalIntent);
        await Storage.setPref("kcalOffset", kcalOffset);
        await Storage.setPref("includeTrainingInFoodRoom", includeTrainingInFoodRoom);
        await Storage.setPref("kcalGoalMode", goalMode);
        await Storage.setPref("kcalGoal", kcalGoal);
        await Storage.setPref("macroGoalMode", macroMode);
        await Storage.setPref("proteinPerKg", proteinPerKgChoice);
        await Storage.setPref("fatPercent", fatPercent);
        await Storage.setPref("proteinGoal", proteinGoal);
        await Storage.setPref("carbsGoal", carbsGoal);
        await Storage.setPref("fatGoal", fatGoal);
        await Storage.setPref("defaultRestSec", state.prefs.defaultRestSec);
        state.prefs.myKit = GEAR_ORDER.filter(g => kitPicked.has(g));
        await Storage.setPref("myKit", state.prefs.myKit);
        state.prefs.warmupPrompt = warmupCb.checked;
        await Storage.setPref("warmupPrompt", warmupCb.checked);
        state.prefs.guidedSets = !!guidedSetsCb.checked;
        await Storage.setPref("guidedSets", state.prefs.guidedSets);
        await Storage.setPref("weeklyWorkoutGoal", weeklyWorkoutGoal);
        await Storage.setPref("backupReminder", backupReminder);

        closeModal();
        renderMain();
        const modeLabel = goalMode === "manual" ? "your number" : "your profile";
        const macroBit = (proteinGoal || carbsGoal || fatGoal)
          ? ` · P ${proteinGoal}g / C ${carbsGoal}g / F ${fatGoal}g`
          : "";
        toast(`Today's food room is now ${kcalGoal} kcal based on ${modeLabel}${macroBit}`);
      } } }, "Save")
    );
    body.appendChild(el("div", {
      class: "settings-version", "data-testid": "settings-version"
    }, `FitForge v${APP_VERSION}`));
    openModal("Settings", body, footer);
    if (opts.focusBudget) setTimeout(() => {
      goalMode = "manual";
      refreshPreview();
      kcalI.focus();
      kcalI.select?.();
    }, 50);
  }

  /** Summarise a backup payload for import preview / status lines. */
  function summarizeBackup(data) {
    if (!data || typeof data !== "object") return null;
    return {
      version: data.version,
      exportedAt: data.exportedAt || null,
      workouts: (data.workouts || []).length,
      completedWorkouts: (data.workouts || []).filter(w => w && w.completedAt).length,
      meals: (data.meals || []).length,
      customExercises: (data.customExercises || []).length,
      bodyweights: (data.bodyweights || []).length,
      templates: (data.templates || []).length,
      mealTemplates: (data.mealTemplates || []).length,
      supplements: (data.supplements || []).length,
      supplementLogs: (data.supplementLogs || []).length,
      prefs: (data.prefs || []).length
    };
  }

  function daysSinceIso(iso) {
    if (!iso) return null;
    const t = Date.parse(iso);
    if (!Number.isFinite(t)) return null;
    return Math.floor((Date.now() - t) / (24 * 60 * 60 * 1000));
  }

  /**
   * Whether Home should surface a backup CTA.
   * Triggers when there is real data and either never exported, export is older
   * than BACKUP_STALE_DAYS, or enough new workouts since last export.
   */
  function getBackupStatus(completedCount) {
    const completed = Number(completedCount) || 0;
    const lastAt = state.prefs.lastBackupAt || null;
    const sinceWorkouts = Math.max(0, completed - (Number(state.prefs.lastBackupWorkoutCount) || 0));
    const days = daysSinceIso(lastAt);
    const hasData = completed > 0;
    const snoozeUntil = state.prefs.backupSnoozedUntil || null;
    const snoozed = snoozeUntil && Date.parse(snoozeUntil) > Date.now();
    let needsBackup = false;
    let reason = "";
    if (hasData && !lastAt) {
      needsBackup = true;
      reason = "No backup file yet";
    } else if (hasData && days != null && days >= BACKUP_STALE_DAYS) {
      needsBackup = true;
      reason = `Last backup ${days} day${days === 1 ? "" : "s"} ago`;
    } else if (hasData && sinceWorkouts >= BACKUP_REMINDER_EVERY) {
      needsBackup = true;
      reason = `${sinceWorkouts} workouts since last backup`;
    }
    if (snoozed) needsBackup = false;
    return { completed, sinceWorkouts, lastAt, daysSince: days, needsBackup, reason, hasData, snoozed };
  }

  /** True when the app is running as an installed PWA rather than a browser tab. */
  function isInstalled() {
    return !!(
      (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
      window.navigator.standalone === true
    );
  }

  /** iOS Safari's own share-sheet is the only install path; there is no
      beforeinstallprompt there, so detect the platform to give real steps. */
  function isIOS() {
    return /iP(hone|ad|od)/.test(navigator.platform || "") ||
      (/Macintosh/.test(navigator.userAgent || "") && "ontouchend" in document);
  }

  /** The storage-durability row in Settings: is data protected, and — if the
      platform can be safer — how to make it so. Honest about the difference
      between an installed app and an evictable tab. */
  function buildStorageHealth() {
    const health = Storage.storageHealth ? Storage.storageHealth() : { engine: "idb", persistGranted: state.persistGranted };
    if (health.engine === "memory" || (health.pendingMemWrites || 0) > 0) {
      return { tone: "bad", title: "Not saving to this device",
        detail: "This browser is blocking storage. Export a backup now — data entered this session will be lost when you close the app." };
    }
    if (isInstalled()) {
      return { tone: "good", title: "Installed — data is protected",
        detail: "Your data is stored on this device. Keep exporting a backup now and then in case the app is uninstalled." };
    }
    if (isIOS()) {
      return { tone: "warn", title: "Add to Home Screen to keep your data",
        detail: "In a Safari tab, iOS can erase everything after 7 days without a visit. Tap Share, then “Add to Home Screen” — the installed app keeps its data. Until then, export backups often." };
    }
    if (state.installPrompt) {
      return { tone: "warn", title: "Install FitForge to protect your data", canInstall: true,
        detail: "Running in a browser tab, your data can be cleared by the browser. Install the app to keep it safe on this device." };
    }
    if (state.persistGranted) {
      return { tone: "good", title: "Storage marked persistent",
        detail: "The browser has agreed not to evict your data under storage pressure. A backup is still worth keeping off-device." };
    }
    return { tone: "warn", title: "Data lives in this browser only",
      detail: "The browser has not guaranteed persistence, so clearing site data or a storage sweep would erase everything. Install the app from your browser menu, and export backups often." };
  }

  function buildStorageHealthRow() {
    const s = buildStorageHealth();
    const row = el("div", { class: `storage-health tone-${s.tone}`, "data-testid": "storage-health" },
      el("div", { class: "storage-health-title" }, s.title),
      el("div", { class: "storage-health-detail" }, s.detail)
    );
    if (s.canInstall) {
      row.appendChild(el("button", {
        class: "btn btn-primary btn-sm mt-8", "data-testid": "install-app",
        on: { click: async () => {
          const p = state.installPrompt;
          if (!p) return;
          state.installPrompt = null;
          try { p.prompt(); await p.userChoice; } catch (_) {}
          renderMain();
        } }
      }, "Install app"));
    }
    return row;
  }

  function formatBackupWhen(iso) {
    if (!iso) return "Never";
    try {
      const d = new Date(iso);
      if (!Number.isFinite(d.getTime())) return "Unknown";
      // Prefer UK date; include time when useful.
      return d.toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit"
      });
    } catch (_) {
      return String(iso).slice(0, 16);
    }
  }

  function renderHomeBackupCard(status) {
    const detail = status.reason || "Protect offline training data";
    const lastLine = status.lastAt
      ? `Last file: ${formatBackupWhen(status.lastAt)}`
      : "Export a JSON file you can keep in Files or Drive.";
    return el("div", { class: "card backup-cta-card", "data-testid": "backup-cta" },
      el("div", { class: "row-between", style: "gap: 10px; align-items: flex-start" },
        el("div", { style: "flex: 1; min-width: 0" },
          el("div", { class: "card-title", style: "margin: 0 0 4px 0" }, "Back up your data"),
          el("div", { class: "text-sm" }, detail),
          el("div", { class: "text-xs text-faint mt-8" }, lastLine)
        )
      ),
      el("div", { class: "row mt-16", style: "gap: 8px; flex-wrap: wrap" },
        el("button", {
          class: "btn btn-primary",
          on: { click: async () => {
            await exportData();
            renderMain();
          } }
        }, "Backup now"),
        el("button", {
          class: "btn btn-ghost",
          on: { click: async () => {
            // Snooze Home CTA without downloading (still resets workout baseline).
            await markBackupDone({ exported: false });
            toast("Backup reminder snoozed");
            renderMain();
          } }
        }, "Later")
      )
    );
  }

  async function exportData() {
    const data = await Storage.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fitforge-backup-${U.todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Backup downloaded");
    // Reset the backup reminder baseline to the current completed-workout count.
    await markBackupDone({ exported: true });
  }

  /**
   * Record that a backup was taken (exported: true) or the reminder was snoozed.
   * Snooze advances the workout baseline and hides the Home CTA for BACKUP_STALE_DAYS;
   * only a real export updates lastBackupAt and clears the snooze.
   */
  async function markBackupDone(opts = {}) {
    const exported = opts.exported !== false;
    try {
      const completed = (await Storage.getWorkouts()).filter(w => w.completedAt).length;
      state.prefs.lastBackupWorkoutCount = completed;
      await Storage.setPref("lastBackupWorkoutCount", completed);
      if (exported) {
        const iso = new Date().toISOString();
        state.prefs.lastBackupAt = iso;
        state.prefs.backupSnoozedUntil = null;
        await Storage.setPref("lastBackupAt", iso);
        await Storage.setPref("backupSnoozedUntil", null);
      } else {
        const until = new Date();
        until.setDate(until.getDate() + BACKUP_STALE_DAYS);
        const snoozeIso = until.toISOString();
        state.prefs.backupSnoozedUntil = snoozeIso;
        await Storage.setPref("backupSnoozedUntil", snoozeIso);
      }
    } catch (err) {
      console.error("markBackupDone failed", err);
    }
  }

  /**
   * After a workout is logged, if the backup reminder is on and enough new
   * workouts have accumulated since the last backup, offer a one-tap export.
   * Fully offline — just triggers the existing JSON download.
   */
  async function maybePromptBackup() {
    if (!state.prefs.backupReminder) return;
    let completed;
    try {
      completed = (await Storage.getWorkouts()).filter(w => w.completedAt).length;
    } catch (_) {
      return;
    }
    const status = getBackupStatus(completed);
    // Dialog path: only when workout-count threshold is hit (avoid double-nag on day-stale alone).
    if (status.sinceWorkouts < BACKUP_REMINDER_EVERY) return;
    const doExport = await confirmDialog(
      `You have logged ${status.sinceWorkouts} workouts since your last backup. Export a backup file now so you do not lose your training data?`,
      { title: "Back up your data?", okLabel: "Export backup", cancelLabel: "Later" }
    );
    if (doExport) {
      await exportData();
    } else {
      // Snooze: reset baseline so we wait another full cycle before asking again.
      await markBackupDone({ exported: false });
    }
  }

  async function exportCSV() {
    const workouts = (await Storage.getWorkouts()).filter(w => w.completedAt);
    const rows = [["Date", "Workout", "Exercise", "Set", "Weight (kg)", "Reps", "e1RM", "PR"]];
    for (const w of workouts) {
      for (const ex of (w.exercises || [])) {
        for (const [i, s] of ex.sets.entries()) {
          rows.push([w.date, w.name || "", ex.name, i + 1, s.weight, s.reps, U.e1rmLabel(s.weight, s.reps) || "", s.isPR ? "Y" : ""]);
        }
      }
    }
    // Add meals sheet? Keep in a separate CSV for simplicity — most users want workouts as CSV
    const csv = rows.map(r => r.map(v => {
      const s = String(v ?? "");
      return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fitforge-workouts-${U.todayISO()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast("CSV downloaded");
  }

  function chooseImportMode(summary, fileName) {
    return new Promise((resolve) => {
      closeModal();
      let settled = false;
      const done = (v) => { if (settled) return; settled = true; closeModal(); resolve(v); };
      const overlay = el("div", { class: "modal-overlay", id: "modal-overlay",
        on: { click: (e) => { if (e.target === overlay) done(null); } } });
      const modal = el("div", { class: "modal modal-sm" });
      modal.appendChild(el("div", { class: "modal-header" },
        el("div", { class: "modal-title" }, "Import backup"),
        el("button", { class: "icon-btn", on: { click: () => done(null) }, html: icons.x })
      ));

      const body = el("div", { class: "modal-body" });
      if (fileName) {
        body.appendChild(el("div", { class: "text-xs text-faint mb-8" }, fileName));
      }
      if (summary) {
        const when = summary.exportedAt ? formatBackupWhen(summary.exportedAt) : "Unknown date";
        body.appendChild(el("div", { class: "text-sm mb-8" },
          `File from ${when}` + (summary.version != null ? ` · format v${summary.version}` : "")
        ));
        const list = el("ul", { class: "import-preview-list" });
        const rows = [
          [`Workouts`, `${summary.workouts}${summary.completedWorkouts != null ? ` (${summary.completedWorkouts} completed)` : ""}`],
          [`Meals`, String(summary.meals)],
          [`Workout templates`, String(summary.templates)],
          [`Meal templates`, String(summary.mealTemplates)],
          [`Supplements`, String(summary.supplements || 0)],
          [`Supplement logs`, String(summary.supplementLogs || 0)],
          [`Custom exercises`, String(summary.customExercises)],
          [`Bodyweight entries`, String(summary.bodyweights)]
        ];
        for (const [label, value] of rows) {
          list.appendChild(el("li", {},
            el("span", { class: "import-preview-label" }, label),
            el("span", { class: "import-preview-value mono" }, value)
          ));
        }
        body.appendChild(list);
      } else {
        body.appendChild(el("div", { class: "text-sm mb-8" }, "Could not read a summary from this file."));
      }
      body.appendChild(el("div", { class: "text-sm", style: "line-height: 1.5; margin-top: 12px" },
        "Merge keeps existing records and adds or overwrites matching IDs. Replace erases everything first."
      ));
      modal.appendChild(body);

      modal.appendChild(el("div", { class: "modal-footer" },
        el("button", { class: "btn", on: { click: () => done(null) } }, "Cancel"),
        el("button", { class: "btn btn-danger", on: { click: () => done("replace") } }, "Replace"),
        el("button", { class: "btn btn-primary", on: { click: () => done("merge") } }, "Merge")
      ));
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      const onKey = (e) => {
        if (settled) { document.removeEventListener("keydown", onKey); return; }
        if (e.key === "Escape") { document.removeEventListener("keydown", onKey); done(null); }
      };
      document.addEventListener("keydown", onKey);
    });
  }

  async function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data || data.version == null) {
        throw new Error("Not a FitForge backup (missing version)");
      }
      const summary = summarizeBackup(data);
      const mode = await chooseImportMode(summary, file.name);
      if (!mode) return; // cancelled
      if (mode === "replace") {
        if (!(await confirmDialog("Replace will erase all existing workouts, meals, and settings. Continue?", { title: "Confirm replace", okLabel: "Replace all", danger: true }))) return;
      }
      await Storage.importAll(data, mode);
      // Reload prefs into live state (import may have replaced prefs store).
      // The return value used to be dropped — loadPrefs is a pure reader, so
      // the restored calorie goal, macros, profile, weekly plan and theme all
      // stayed at their pre-import values until a manual reload, and opening
      // Settings would write the stale ones straight back over the restore.
      state.prefs = await loadPrefs();
      applyTheme(state.prefs.theme);
      applyAccent(state.prefs.accent);
      closeModal();
      renderMain();
      const bits = [];
      if (summary) {
        if (summary.workouts) bits.push(`${summary.workouts} workouts`);
        if (summary.meals) bits.push(`${summary.meals} meals`);
      }
      toast(bits.length ? `Imported ${bits.join(", ")}` : "Backup imported");
    } catch (err) {
      await alertDialog("Import failed: " + err.message, { title: "Import error" });
    } finally {
      // Reset the input so re-selecting the same file fires change again.
      try { e.target.value = ""; } catch (_) {}
    }
  }

  // ============ Modal helpers ============
  // ============ In-app confirm/alert (sandbox-safe replacements for window.confirm/alert) ============
  // Stacks ON TOP of whatever asked the question rather than replacing it.
  // It used to closeModal() on the way in and share the "modal-overlay" id, so
  // asking "delete this?" from inside a sheet destroyed the sheet — and
  // answering "no" left you staring at nothing you had chosen to leave.
  function confirmDialog(message, opts = {}) {
    return new Promise((resolve) => {
      const okLabel = opts.okLabel || "Confirm";
      const cancelLabel = opts.cancelLabel || "Cancel";
      const danger = !!opts.danger;
      let settled = false;
      const done = (v) => { if (settled) return; settled = true; overlay.remove(); resolve(v); };

      const overlay = el("div", { class: "modal-overlay dialog-overlay", "data-testid": "confirm-dialog",
        on: { click: (e) => { if (e.target === overlay) done(false); } } });
      const modal = el("div", { class: "modal modal-sm" });
      modal.appendChild(el("div", { class: "modal-header" },
        el("div", { class: "modal-title" }, opts.title || "Please confirm"),
        el("button", { class: "icon-btn", on: { click: () => done(false) }, html: icons.x })
      ));
      modal.appendChild(el("div", { class: "modal-body" },
        el("div", { style: "white-space: pre-wrap; line-height: 1.5;" }, message)
      ));
      const okBtn = el("button",
        { class: "btn " + (danger ? "btn-danger" : "btn-primary"), on: { click: () => done(true) } },
        okLabel);
      modal.appendChild(el("div", { class: "modal-footer" },
        el("button", { class: "btn", on: { click: () => done(false) } }, cancelLabel),
        okBtn
      ));
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      setTimeout(() => okBtn.focus(), 30);

      const onKey = (e) => {
        if (settled) { document.removeEventListener("keydown", onKey); return; }
        if (e.key === "Escape") { document.removeEventListener("keydown", onKey); done(false); }
        else if (e.key === "Enter") { document.removeEventListener("keydown", onKey); done(true); }
      };
      document.addEventListener("keydown", onKey);
    });
  }

  function alertDialog(message, opts = {}) {
    return new Promise((resolve) => {
      let settled = false;
      const done = () => { if (settled) return; settled = true; overlay.remove(); resolve(); };

      // Same stacking rule as confirmDialog — an alert must not take the
      // screen it was raised from with it.
      const overlay = el("div", { class: "modal-overlay dialog-overlay", "data-testid": "alert-dialog",
        on: { click: (e) => { if (e.target === overlay) done(); } } });
      const modal = el("div", { class: "modal modal-sm" });
      modal.appendChild(el("div", { class: "modal-header" },
        el("div", { class: "modal-title" }, opts.title || "Notice"),
        el("button", { class: "icon-btn", on: { click: done }, html: icons.x })
      ));
      modal.appendChild(el("div", { class: "modal-body" },
        el("div", { style: "white-space: pre-wrap; line-height: 1.5;" }, message)
      ));
      const okBtn = el("button", { class: "btn btn-primary", on: { click: done } }, opts.okLabel || "OK");
      modal.appendChild(el("div", { class: "modal-footer" }, okBtn));
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      setTimeout(() => okBtn.focus(), 30);

      const onKey = (e) => {
        if (settled) { document.removeEventListener("keydown", onKey); return; }
        if (e.key === "Escape" || e.key === "Enter") { document.removeEventListener("keydown", onKey); done(); }
      };
      document.addEventListener("keydown", onKey);
    });
  }

  /**
   * `opts.raised` lifts the modal above the full-screen layers — the article
   * reader sits at 2600, so a modal it opens at the default 100 renders
   * underneath it and cannot be seen or tapped. Same reasoning as
   * .dialog-overlay, which has needed it since the weekly planner.
   */
  function openModal(title, body, footer, opts = {}) {
    closeModal();
    const overlay = el("div", { class: "modal-overlay" + (opts.raised ? " is-raised" : ""), id: "modal-overlay", on: { click: (e) => { if (e.target === overlay) closeModal(); } } });
    const modal = el("div", { class: "modal" });
    modal.appendChild(el("div", { class: "modal-header" },
      el("div", { class: "modal-title" }, title),
      el("button", { class: "icon-btn", on: { click: closeModal }, html: icons.x })
    ));
    modal.appendChild(el("div", { class: "modal-body" }, body));
    if (footer) modal.appendChild(el("div", { class: "modal-footer" }, footer));
    overlay.appendChild(modal);
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", title);
    document.body.appendChild(overlay);
    releaseModalFocus = trapFocus(modal);
    // Every other overlay in the app closed on Escape; the plain modal — which
    // is most of them, including Settings and every editor — did not.
    modalKeyHandler = (e) => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); closeModal(); } };
    document.addEventListener("keydown", modalKeyHandler, true);
  }
  let releaseModalFocus = null;
  let modalKeyHandler = null;
  function closeModal() {
    const o = document.getElementById("modal-overlay");
    if (o) o.remove();
    if (modalKeyHandler) { document.removeEventListener("keydown", modalKeyHandler, true); modalKeyHandler = null; }
    if (releaseModalFocus) { releaseModalFocus(); releaseModalFocus = null; }
  }

  // ============ Announcements & focus ============
  //
  // The app talks to sighted users constantly — a toast, a ring filling, a set
  // row turning into "Logged" — and said none of it out loud. A screen-reader
  // user could log a set and get no confirmation that anything had happened,
  // which on a screen whose entire job is one-tap logging is the difference
  // between usable and not.
  //
  // Two regions, because the distinction matters more here than usual. Polite
  // waits for a gap: right for "Logged 80 kg × 8". Assertive interrupts: right
  // for the rest timer finishing, which is the one thing in the app that is
  // time-critical and happens while the phone is face-down on a bench.

  function a11yRegion(id, live) {
    let n = document.getElementById(id);
    if (!n) {
      n = el("div", { id, class: "sr-only", role: "status", "aria-live": live, "aria-atomic": "true" });
      document.body.appendChild(n);
    }
    return n;
  }

  /** Both regions, mounted empty at boot.
      A live region created and filled in the same tick is frequently not
      announced at all — the AT never saw an empty region to diff against. They
      have to be sitting there first, which means creating them before anything
      has happened rather than on the first thing that does. */
  function initA11yRegions() {
    a11yRegion("a11y-status", "polite");
    a11yRegion("a11y-alert", "assertive");
  }

  /** Say something to a screen reader. Identical consecutive text is ignored by
      every AT, so a set logged at the same weight twice would be silent —
      hence the alternating hair space. */
  let announceFlip = false;
  function announce(msg, { assertive = false } = {}) {
    if (!msg) return;
    const n = a11yRegion(assertive ? "a11y-alert" : "a11y-status", assertive ? "assertive" : "polite");
    announceFlip = !announceFlip;
    n.textContent = msg + (announceFlip ? "\u200a" : "");
  }

  /**
   * Hold keyboard focus inside a dialog until it closes, then put it back
   * where it came from.
   *
   * Without this a dialog opens and focus is still on the button behind it, so
   * Tab walks the page underneath something that visually covers the screen —
   * measured across the meal fork, the modals and the article reader, none of
   * which moved focus in. Returns a release function; every caller must invoke
   * it on close or focus is stranded on a node that no longer exists.
   */
  const FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  function trapFocus(container, opts = {}) {
    const previous = document.activeElement;
    const items = () => [...container.querySelectorAll(FOCUSABLE)]
      .filter((n) => n.offsetParent !== null || getComputedStyle(n).position === "fixed");

    const first = opts.initial || items()[0] || container;
    if (first === container && !container.hasAttribute("tabindex")) container.setAttribute("tabindex", "-1");
    // After paint: a dialog appended and focused in the same frame sometimes
    // loses it to the click that opened it.
    requestAnimationFrame(() => { try { first.focus({ preventScroll: true }); } catch (_) {} });

    const onKey = (e) => {
      if (e.key !== "Tab") return;
      const list = items();
      if (!list.length) { e.preventDefault(); return; }
      const i = list.indexOf(document.activeElement);
      // Focus outside the dialog entirely (it started on the trigger, or the
      // dialog re-rendered) — pull it back rather than letting Tab escape.
      if (i < 0) { e.preventDefault(); list[e.shiftKey ? list.length - 1 : 0].focus(); return; }
      if (!e.shiftKey && i === list.length - 1) { e.preventDefault(); list[0].focus(); }
      else if (e.shiftKey && i === 0) { e.preventDefault(); list[list.length - 1].focus(); }
    };
    document.addEventListener("keydown", onKey, true);

    return function release() {
      document.removeEventListener("keydown", onKey, true);
      if (previous && document.contains(previous)) {
        try { previous.focus({ preventScroll: true }); } catch (_) {}
      }
    };
  }

  // ============ Toast ============
  let toastTimer = null;
  function toast(msg) {
    let t = document.getElementById("toast");
    if (!t) {
      t = el("div", { id: "toast", "aria-hidden": "true", style: "position:fixed; top: 20px; left: 50%; transform: translateX(-50%); background: var(--text); color: var(--bg); padding: 10px 20px; border-radius: 100px; z-index: 200; font-size: 14px; box-shadow: var(--shadow-md); pointer-events: none; opacity: 0; transition: opacity 200ms ease;" });
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = "1";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.style.opacity = "0"; }, 2200);
    // Anything worth a toast is worth saying. The toast itself cannot be the
    // live region: it is aria-hidden decoration that appears and vanishes,
    // and its text is often set again with the same string.
    announce(msg);
  }

  // ============ Kickoff ============
  document.addEventListener("DOMContentLoaded", init);
})();
