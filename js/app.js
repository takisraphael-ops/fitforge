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
    workoutInterval: null,
    prefs: {}              // { kcalGoal, kcalGoalMode, sex, age, heightCm, activityLevel, defaultRestSec, theme }
  };

  // ============ Bootstrap ============
  async function init() {
    // Register service worker for PWA. Poll for updates so bug fixes propagate.
    if ("serviceWorker" in navigator) {
      // Register with a version query so browsers re-fetch sw.js after deploys.
      // Keep this ?v= in lockstep with index.html / sw.js on every version bump.
      navigator.serviceWorker.register("./sw.js?v=64").then(reg => {
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
      // When a new SW takes control, reload once so the new app.js runs.
      let reloaded = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (reloaded) return;
        reloaded = true;
        location.reload();
      });
    }
    await Storage.open();
    // Best-effort: ask browser not to evict workout data under storage pressure.
    try { await Storage.requestPersistent(); } catch (_) {}
    state.prefs = await loadPrefs();
    applyTheme(state.prefs.theme);
    // Resume active workout if any
    const active = await Storage.getPref("activeWorkoutId", null);
    if (active) {
      const w = await Storage.getWorkout(active);
      if (w && !w.completedAt) {
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
      }
    }
    // Force a SW update check on every cold start so cardio fixes propagate.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => reg && reg.update().catch(() => {})).catch(() => {});
    }
    render();
    if (!Storage.isPersistent()) {
      setTimeout(() => toast("Storage is temporary in this browser — export a backup after workouts"), 600);
    }
  }

  // ============ Theme ============
  // Dark is the default look; users can flip to light and it persists.
  function applyTheme(pref) {
    const theme = pref || "dark";
    document.documentElement.classList.toggle("dark", theme === "dark");
  }
  async function toggleTheme() {
    const current = document.documentElement.classList.contains("dark") ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    state.prefs.theme = next;
    document.documentElement.classList.toggle("dark", next === "dark");
    await Storage.setPref("theme", next);
    renderHeader();
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
            if (!s.done) return false;
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

  // ============ Compute PRs for an exercise ============
  async function getPRsFor(exerciseId) {
    const history = await getHistoryFor(exerciseId);
    let maxWeight = 0, maxE1RM = 0, maxReps = 0, maxVolume = 0;
    let maxDuration = 0, maxDistance = 0, maxKcal = 0;
    let maxWeightDate = null, maxE1RMDate = null;
    for (const h of history) {
      for (const s of h.sets) {
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
          sessionCount: 0,
          lastTrained: null,
          isCardio: type === "cardio"
        };
        map.set(id, r);
      }
      return r;
    };

    const completed = workouts.filter(w => w.completedAt);
    for (const w of completed) {
      for (const ex of (w.exercises || [])) {
        const isCardio = ex.type === "cardio";
        const doneSets = (ex.sets || []).filter(s => {
          if (!s.done) return false;
          if (isCardio || s.durationMin != null) return !!s.durationMin;
          return s.reps != null && s.reps > 0;
        });
        if (!doneSets.length) continue;

        const r = ensure(ex.exerciseId, ex.name, ex.type);
        r.sessionCount += 1;
        if (!r.lastTrained || w.date > r.lastTrained) r.lastTrained = w.date;
        if (exerciseById.get(ex.exerciseId)?.name) r.name = exerciseById.get(ex.exerciseId).name;

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
    return {
      profileName: await Storage.getPref("profileName", ""),
      kcalGoal: await Storage.getPref("kcalGoal", 2200),
      // auto = Mifflin/TDEE budget; manual = user override
      kcalGoalMode: await Storage.getPref("kcalGoalMode", "auto"),
      sex: await Storage.getPref("sex", null),
      age: await Storage.getPref("age", null),
      heightCm: await Storage.getPref("heightCm", null),
      // Lifestyle / NEAT only — training burn optional (default off for real-world accuracy)
      activityLevel: await Storage.getPref("activityLevel", "light"),
      goalIntent: await Storage.getPref("goalIntent", U.DEFAULT_GOAL_INTENT),
      kcalOffset: await Storage.getPref("kcalOffset", U.DEFAULT_KCAL_OFFSET),
      // When false (default): show training estimate but do not raise food room
      includeTrainingInFoodRoom: !!(await Storage.getPref("includeTrainingInFoodRoom", false)),
      // Macro goals: auto from bodyweight + kcal budget, or full manual P/C/F
      macroGoalMode: await Storage.getPref("macroGoalMode", "auto"),
      proteinPerKg: await Storage.getPref("proteinPerKg", U.DEFAULT_PROTEIN_PER_KG),
      fatPercent: await Storage.getPref("fatPercent", U.DEFAULT_FAT_PERCENT),
      proteinGoal: await Storage.getPref("proteinGoal", 0),
      carbsGoal: await Storage.getPref("carbsGoal", 0),
      fatGoal: await Storage.getPref("fatGoal", 0),
      weeklyWorkoutGoal: await Storage.getPref("weeklyWorkoutGoal", 4),
      defaultRestSec: await Storage.getPref("defaultRestSec", 90),
      // Offline-first data safety: remind to export a backup every N logged workouts
      backupReminder: !!(await Storage.getPref("backupReminder", true)),
      // Count of completed workouts at the last export/dismiss, so the reminder
      // fires once per BACKUP_REMINDER_EVERY new workouts rather than repeatedly.
      lastBackupWorkoutCount: Number(await Storage.getPref("lastBackupWorkoutCount", 0)) || 0,
      // ISO timestamp of last successful export (null if never backed up).
      lastBackupAt: await Storage.getPref("lastBackupAt", null),
      // ISO timestamp: hide Home backup CTA until this time (snooze).
      backupSnoozedUntil: await Storage.getPref("backupSnoozedUntil", null),
      theme: await Storage.getPref("theme", null)
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
      age: prefs.age,
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
    const proteinPerKg = Number(prefs.proteinPerKg) > 0 ? Number(prefs.proteinPerKg) : U.DEFAULT_PROTEIN_PER_KG;
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
    return { weight: null, reps: null, done: false };
  }

  /** Clone logged (or planned) sets into a fresh session — values filled, none marked done. */
  function cloneSetsForReplay(sets, type) {
    const src = (sets || []).filter(s => {
      if (!s) return false;
      if (type === "cardio" || s.durationMin != null) {
        return s.done || s.durationMin != null || s.distanceKm != null;
      }
      return s.done || s.weight != null || s.reps != null;
    });
    if (!src.length) return [emptySetForType(type)];
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
      drop: !!s.drop
    }));
  }

  function formatPrevSetsSummary(sets, exType) {
    return (sets || []).map(s => {
      if (s.durationMin != null) {
        const dist = s.distanceKm ? ` · ${s.distanceKm}km` : "";
        return `${s.durationMin} min · ${U.intensityLabel(s.intensity)}${dist}`;
      }
      if (exType === "bodyweight" || ((!s.weight || s.weight === 0) && s.reps)) return `${s.reps} reps`;
      return `${s.weight}×${s.reps}`;
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

  async function buildExerciseEntry(exerciseId, name) {
    const all = await getAllExercises();
    const def = all.find(x => x.id === exerciseId);
    // Prefer definition classification; fall back to name when the id is missing.
    let type = def ? inferExerciseType(def) : "weighted";
    if (type !== "cardio" && looksLikeCardio({ id: exerciseId, name: name || def?.name })) {
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
  // Uses standard metric plates: 25, 20, 15, 10, 5, 2.5, 1.25 kg.
  function computePlates(target, barKg = 20) {
    if (target == null || isNaN(target) || target <= barKg) return { perSide: [], leftover: 0, barKg };
    const perSideKg = (target - barKg) / 2;
    const plates = [25, 20, 15, 10, 5, 2.5, 1.25];
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
    let target = initialWeight || 60;
    let bar = 20;

    const body = el("div", {});
    const targetI = el("input", { type: "number", step: "0.5", inputmode: "decimal", class: "input input-num", value: target });
    const barS = el("select", { class: "select" },
      el("option", { value: "20" }, "20 kg (Olympic)"),
      el("option", { value: "15" }, "15 kg (Women's Olympic)"),
      el("option", { value: "10" }, "10 kg (Training bar)"),
      el("option", { value: "7" }, "7 kg (EZ / short bar)"),
      el("option", { value: "0" }, "No bar (dumbbell)")
    );
    barS.value = String(bar);

    const output = el("div", { class: "plate-output" });
    function refresh() {
      target = parseFloat(targetI.value) || 0;
      bar = parseFloat(barS.value);
      clear(output);
      const { perSide, leftover } = computePlates(target, bar);
      if (target <= bar) {
        output.appendChild(el("div", { class: "text-muted text-sm" },
          target === bar ? "Just the bar." : `Target is below bar weight (${bar}kg).`));
        return;
      }
      const perSideKg = (target - bar) / 2;
      output.appendChild(el("div", { class: "text-sm text-muted", style: "margin-bottom: 8px" },
        `Per side: ${perSideKg.toFixed(2)}kg · total plates: ${(perSideKg * 2).toFixed(2)}kg + ${bar}kg bar`));
      const plateRow = el("div", { class: "plate-row" });
      for (const { kg, count } of perSide) {
        for (let i = 0; i < count; i++) {
          plateRow.appendChild(el("div", { class: "plate", "data-kg": String(kg) }, `${kg}`));
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
              r.appendChild(el("div", { class: "plate", "data-kg": String(kg) }, `${kg}`));
            }
          }
          return r;
        })())
      );
      output.appendChild(barVis);
      // Breakdown text
      if (perSide.length) {
        output.appendChild(el("div", { class: "text-sm mt-8" },
          "Per side: " + perSide.map(p => `${p.count}×${p.kg}kg`).join(" + ")
        ));
      }
      if (leftover > 0.01) {
        output.appendChild(el("div", { class: "text-sm text-muted mt-8" },
          `Can’t make exact with these plates. Short by ${leftover.toFixed(2)}kg per side.`));
      }
    }

    body.appendChild(el("div", { class: "form-row" },
      el("div", { style: "flex:2" }, el("label", { class: "label" }, "Target weight (kg)"), targetI),
      el("div", { style: "flex:1" }, el("label", { class: "label" }, "Bar"), barS)
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

  /** Whether a cardio exercise should show/track a distance (km) field. */
  function cardioTracksDistance(ex) {
    if (!ex) return true;
    const id = String(ex.exerciseId || ex.id || "").toLowerCase();
    if (NO_DISTANCE_CARDIO_IDS.has(id)) return false;
    const name = String(ex.name || "").toLowerCase();
    if (/\b(jump\s*rope|skip(ping|s)?)\b/.test(name)) return false;
    return true;
  }

  function looksLikeCardio(ex) {
    if (!ex) return false;
    if (ex.category === "cardio") return true;
    if (ex.type === "cardio") return true;
    const id = String(ex.id || ex.exerciseId || "").toLowerCase();
    if (CARDIO_IDS.has(id)) return true;
    const name = String(ex.name || "").toLowerCase();
    // NB: match "rowing"/"erg" but NOT bare "row" — the latter also appears in
    // strength moves (bent-over row, cable row, upright row, …) which are not cardio.
    return /\b(run|running|rowing|rower|cycle|cycling|bike|erg|ergometer|jump\s*rope|treadmill|cardio|elliptical|assault\s*bike)\b/.test(name);
  }

  function inferExerciseType(ex) {
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
    renderHeader();
    renderMain();
  }

  function renderHeader() {
    const header = $("#header");
    clear(header);
    header.appendChild(el("div", { class: "logo" },
      el("span", { class: "logo-mark", html: `<svg viewBox="0 0 32 32" aria-label="FitForge logo"><circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" stroke-opacity=".2" stroke-width="2"/><circle cx="16" cy="16" r="13" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-dasharray="22 60" transform="rotate(-90 16 16)"/><circle cx="16" cy="16" r="7" fill="none" stroke="var(--accent)" stroke-opacity=".45" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="11 33" transform="rotate(120 16 16)"/><circle cx="16" cy="16" r="2.6" fill="var(--accent)"/></svg>` }),
      "FitForge"
    ));
    const isDark = document.documentElement.classList.contains("dark");
    header.appendChild(el("div", { class: "header-actions" },
      el("button", { class: "icon-btn", title: "Toggle theme", on: { click: toggleTheme }, html: isDark ? icons.sun : icons.moon }),
      el("button", { class: "icon-btn", title: "Settings", on: { click: openSettings }, html: icons.settings })
    ));
  }

  function renderMain() {
    const main = $("#main");
    clear(main);

    const view = el("div", { class: "view" });
    main.appendChild(view);
    switch (state.tab) {
      case "home": renderHome(view); break;
      case "workout": renderWorkout(view); break;
      case "library": renderLibrary(view); break;
      case "nutrition": renderNutrition(view); break;
      case "stats": case "history": renderStatsShell(view); break;
    }

    // Bottom dock navigation
    renderDock(main);

    // Rest timer overlay
    renderRestTimer();
  }

  // ============ Bottom dock ============
  const dockIcons = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/></svg>',
    utensils: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 3v7a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3"/><path d="M6 3v18"/><path d="M15 3c-1.5 1.5-2 4-2 6 0 2.5 1.5 4 3 4v8"/><path d="M18 3c1 1.5 1.5 4 1.5 6"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m6 15 4-5 3 3 5-7"/></svg>'
  };

  function renderDock(main) {
    const old = document.querySelector(".dock");
    if (old) old.remove();
    const items = [
      { id: "home", icon: dockIcons.home, label: "Home" },
      { id: "nutrition", icon: dockIcons.utensils, label: "Nutrition" },
      { id: "__fab", icon: icons.plus, label: "Quick actions" },
      { id: "stats", icon: dockIcons.chart, label: "Stats" },
      { id: "library", icon: icons.dumbbell, label: "Exercises" }
    ];
    const dock = el("nav", { class: "dock", "data-testid": "dock" });
    for (const it of items) {
      if (it.id === "__fab") {
        dock.appendChild(el("button", {
          class: "dock-fab" + (state.tab === "workout" ? " active" : ""),
          title: it.label,
          "data-testid": "dock-fab",
          html: state.tab === "workout" ? icons.dumbbell : icons.plus,
          on: { click: openQuickSheet }
        }));
        continue;
      }
      const active = state.tab === it.id || (it.id === "stats" && state.tab === "history");
      dock.appendChild(el("button", {
        class: "dock-item" + (active ? " active" : ""),
        title: it.label,
        "data-testid": "dock-" + it.id,
        html: it.icon,
        on: { click: () => { state.tab = it.id; renderMain(); window.scrollTo(0, 0); } }
      }));
    }
    document.body.appendChild(dock);
  }

  // ============ Numeric keypad (tap-first input for weights, reps, cardio) ============
  // Typing is the slowest input on mobile, so numeric fields open a bottom
  // sheet with big +/- steppers and a keypad (48px+ targets) instead of the
  // system keyboard. Physical keyboards still work while the pad is open.
  let numpadState = null;

  function closeNumPad() {
    if (!numpadState) return;
    document.removeEventListener("keydown", numpadState.keyHandler, true);
    numpadState.overlay.remove();
    numpadState = null;
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
      commit(); updateDisplay();
    };

    const nextInput = (() => {
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

    const minus = el("button", { type: "button", class: "numpad-step", "data-testid": "numpad-minus", "aria-label": `Decrease by ${step}`, on: { click: () => nudge(-1) } }, `−${step}`);
    const plus = el("button", { type: "button", class: "numpad-step", "data-testid": "numpad-plus", "aria-label": `Increase by ${step}`, on: { click: () => nudge(1) } }, `+${step}`);

    const doneBtn = el("button", {
      type: "button", class: "btn numpad-done", "data-testid": "numpad-done",
      on: { click: () => closeNumPad() }
    }, "Done");
    const nextBtn = nextInput ? el("button", {
      type: "button", class: "btn btn-primary numpad-next", "data-testid": "numpad-next",
      on: { click: () => { closeNumPad(); openNumPad(nextInput); } }
    }, "Next \u2192") : null;

    const sheet = el("div", { class: "numpad-sheet", "data-testid": "numpad" },
      el("div", { class: "numpad-label" }, opts.label || "Enter value"),
      el("div", { class: "numpad-display-row" }, minus, display, plus),
      grid,
      el("div", { class: "numpad-actions" }, doneBtn, nextBtn)
    );
    overlay.appendChild(sheet);
    document.body.appendChild(overlay);
    updateDisplay();

    const keyHandler = (e) => {
      if (e.key >= "0" && e.key <= "9") { press(e.key); }
      else if (e.key === ".") { press("."); }
      else if (e.key === "-") { if (allowMinus) press("sign"); }
      else if (e.key === "Backspace") { press("back"); }
      else if (e.key === "ArrowUp") { nudge(1); }
      else if (e.key === "ArrowDown") { nudge(-1); }
      else if (e.key === "Enter") { if (nextInput) { closeNumPad(); openNumPad(nextInput); } else closeNumPad(); }
      else if (e.key === "Escape") { closeNumPad(); }
      else if (e.key === "Tab") { return; }
      else return;
      e.preventDefault(); e.stopPropagation();
    };
    document.addEventListener("keydown", keyHandler, true);
    numpadState = { overlay, input, keyHandler };
  }

  function openQuickSheet() {
    if (state.tab === "workout") { renderMain(); window.scrollTo(0, 0); return; }
    // Full-screen "fork in the road" — the screen splits down the middle into
    // two paths. Covers the app; dismiss with the close button or Escape.
    const overlay = el("div", { class: "qa-fork-overlay", "data-testid": "quick-sheet", role: "dialog", "aria-label": "Quick actions" });
    function onKey(e) { if (e.key === "Escape") { e.preventDefault(); close(); } }
    const close = () => { document.removeEventListener("keydown", onKey, true); overlay.remove(); };
    document.addEventListener("keydown", onKey, true);
    const go = (tab) => { close(); goTab(tab); window.scrollTo(0, 0); };
    // Animated marks — dumbbell "reps" on the workout path, steam rises off the meal bowl.
    const DUMBBELL_ART = `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><g class="qa2-dumbbell" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"><line x1="18" y1="24" x2="30" y2="24"/><line x1="13" y1="18" x2="13" y2="30"/><line x1="8.5" y1="21" x2="8.5" y2="27"/><line x1="35" y1="18" x2="35" y2="30"/><line x1="39.5" y1="21" x2="39.5" y2="27"/></g></svg>`;
    const MEAL_ART = `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><g class="qa2-steam" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M18 15c-2.5-2-2.5-4 0-6"/><path d="M24 15c-2.5-2-2.5-4 0-6"/><path d="M30 15c-2.5-2-2.5-4 0-6"/></g><path d="M9 25h30a15 15 0 0 1-30 0z" fill="currentColor" fill-opacity="0.16"/><path d="M9 25h30a15 15 0 0 1-30 0z" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><line x1="7" y1="25" x2="41" y2="25" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`;
    const CLOSE_ART = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>`;
    const workoutPanel = el("button", {
      class: "qa-fork-panel qa2-workout", "data-testid": "quick-start-workout",
      on: { click: () => go("workout") }
    },
      el("span", { class: "qa2-art", html: DUMBBELL_ART }),
      el("span", { class: "qa2-label" }, state.activeWorkout ? "Resume workout" : "Start workout"),
      el("span", { class: "qa2-sub" }, state.activeWorkout ? "Pick up where you left off" : "Pick an exercise to begin")
    );
    const mealPanel = el("button", {
      class: "qa-fork-panel qa2-meal", "data-testid": "quick-log-meal",
      on: { click: () => go("nutrition") }
    },
      el("span", { class: "qa2-art", html: MEAL_ART }),
      el("span", { class: "qa2-label" }, "Log meal"),
      el("span", { class: "qa2-sub" }, "Add food to today")
    );
    overlay.appendChild(workoutPanel);
    overlay.appendChild(mealPanel);
    overlay.appendChild(el("button", { class: "qa-fork-close", "aria-label": "Close", title: "Close", html: CLOSE_ART, on: { click: close } }));
    document.body.appendChild(overlay);
  }

  // ============ Stats shell (Trends | History) ============
  function renderStatsShell(view) {
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
    view.appendChild(seg);
    const inner = el("div");
    view.appendChild(inner);
    if (state.tab === "history") renderHistory(inner); else renderStats(inner);
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
        const doneSets = ex.sets.filter(s => s.done);
        const vol = U.volume(doneSets);
        for (const key of buckets) {
          totals[key].sets += doneSets.length;
          totals[key].volume += vol;
        }
      }
    }
    return Object.entries(totals).map(([group, v]) => ({ group, ...v }));
  }

  function renderMuscleBalance(balance) {
    const card = el("div", { class: "card" });
    card.appendChild(el("div", { class: "card-title" }, "Muscle-group balance (last 14 days)"));
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
          latest ? `${latest.kg}kg` : el("span", { class: "text-faint", style: "font-size: 14px; font-weight: 400" }, "Add your weight below")
        ),
        latest && list.length > 1 ? (() => {
          const first = list[0];
          const delta = latest.kg - first.kg;
          const cls = delta > 0 ? "text-success" : (delta < 0 ? "text-danger" : "text-muted");
          const sign = delta > 0 ? "+" : "";
          return el("div", { class: "text-xs " + cls, style: "margin-top: 4px" },
            `${sign}${delta.toFixed(1)}kg since ${U.formatDate(first.date)}`);
        })() : null
      )
    );
    card.appendChild(header);

    // Input row
    const wI = el("input", { type: "number", step: "0.1", inputmode: "decimal",
      class: "input input-num", placeholder: latest ? `${latest.kg}` : "kg",
      value: todayEntry?.kg ?? "", style: "max-width: 140px" });
    // Tap-first numeric keypad, same as logging reps/weight in a workout.
    attachNumPad(wI, { decimals: true, step: 0.1, unit: "kg", label: "Log bodyweight" });
    const saveBtn = el("button", { class: "btn btn-primary btn-sm", on: { click: async () => {
      const kg = parseFloat(wI.value);
      if (isNaN(kg) || kg <= 0) return toast("Enter a valid weight");
      await Storage.saveBodyweight({ date: today, kg });
      toast("Weight logged");
      renderMain();
    } } }, "Log today");
    card.appendChild(el("div", { class: "row mt-8", style: "gap: 8px; align-items: center;" },
      wI,
      el("span", { class: "text-sm text-muted" }, "kg"),
      saveBtn,
      todayEntry ? el("button", { class: "icon-btn", title: "Delete today’s entry", on: { click: async () => {
        if (!(await confirmDialog("Delete today’s bodyweight entry?", { title: "Delete entry?", okLabel: "Delete", danger: true }))) return;
        await Storage.deleteBodyweight(today);
        renderMain();
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

  function buildEnergyRing(pct, overBudget) {
    const size = 176;
    const stroke = 12;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const fillPct = Math.max(0, Math.min(100, pct));
    const dashOffset = c * (1 - fillPct / 100);
    const strokeColor = overBudget ? "var(--danger)" : (fillPct >= 85 ? "var(--warning, #c48a2a)" : "var(--accent)");

    const wrap = el("div", { class: "energy-ring-wrap" });
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
    svg.setAttribute("class", "energy-ring");
    svg.setAttribute("width", String(size));
    svg.setAttribute("height", String(size));
    svg.setAttribute("aria-hidden", "true");

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
    fg.setAttribute("stroke", strokeColor);
    fg.setAttribute("stroke-width", String(stroke));
    fg.setAttribute("stroke-linecap", "round");
    fg.setAttribute("stroke-dasharray", String(c));
    fg.setAttribute("stroke-dashoffset", String(dashOffset));
    fg.setAttribute("transform", `rotate(-90 ${size / 2} ${size / 2})`);

    svg.appendChild(bg);
    svg.appendChild(fg);
    wrap.appendChild(svg);
    return wrap;
  }

  function energyBreakdownRows(energy) {
    const rows = [];
    if (!energy.profileReady) return rows;
    const fmt = (n) => (n > 0 ? `+${n}` : String(n));
    // Lifestyle TDEE already includes body baseline × daily movement; show both pieces.
    // Body baseline = BMR; Daily movement = lifestyle TDEE − BMR (extra from being up and about).
    const movementExtra = (energy.tdee != null && energy.bmr != null)
      ? Math.max(0, energy.tdee - energy.bmr)
      : null;
    if (energy.bmr != null) {
      rows.push({ label: "Body baseline", value: String(energy.bmr), note: "what you burn at rest" });
    }
    if (movementExtra != null) {
      rows.push({
        label: "Daily movement",
        value: fmt(movementExtra),
        note: energy.activityLabel || "normal day, not the gym"
      });
    }
    const trainingBurn = energy.workoutKcal || 0;
    const trainingCounted = !!energy.includeTrainingInFoodRoom;
    rows.push({
      label: "Training today",
      value: trainingBurn ? fmt(trainingBurn) : "+0",
      note: trainingCounted
        ? "added into today's food room"
        : "estimate only — not added to food room"
    });
    if (energy.maintenance != null) {
      rows.push({
        label: "Hold-weight level",
        value: String(energy.maintenance),
        note: trainingCounted
          ? "before your goal tweak"
          : "body + daily movement (training not included)"
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

  function renderEnergyBudgetCard(energy, eatenKcal) {
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
        class: "energy-ring-main" + (remaining < 0 ? " over" : "") + (isPersonal ? "" : " is-estimate")
      }, (remaining >= 0 ? remaining : Math.abs(remaining)).toLocaleString("en-GB")),
      el("div", { class: "energy-ring-sub" }, remaining >= 0 ? "kcal left" : "kcal over")
    ));

    card.appendChild(el("div", { class: "energy-ring-block" }, ringWrap));

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
          renderMain();
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
        el("div", { class: "card-title", style: "margin: 0" }, opts.title || "Nutrition (14 days)"),
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

    // 1) Greeting
    const profileName = (state.prefs?.profileName || "").trim();
    view.appendChild(el("h1", { class: "home-greeting" },
      el("span", { class: "greet-part" }, profileName ? `Good ${greeting()}, ` : `Good ${greeting()}.`),
      profileName ? el("span", { class: "greet-name" }, profileName) : null
    ));

    // Active workout stays above everything — interrupt context
    if (state.activeWorkout) {
      const active = state.activeWorkout;
      const doneSets = (active.exercises || []).reduce((s, e) => s + e.sets.filter(x => x.done).length, 0);
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

    // 2) Today — food room hero + macro tiles
    const todayBlock = homeSection(
      "Today",
      "home-section-today",
      renderEnergyBudgetCard(energy, todaysKcal),
      renderMacroTiles(todayMacros, macroGoals, energy)
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
        miniBars(dayVols, { height: 58 })
      ),
      el("div", { class: "card week-mini-card", "data-testid": "home-week-bodyweight" },
        el("div", { class: "week-mini-title" }, "Bodyweight trend"),
        bwVals.length >= 2
          ? sparkline(bwVals, { height: 58 })
          : el("div", { class: "sparkline-empty", style: "height:58px" }, "No data yet")
      )
    );
    view.appendChild(homeSection("This week", "home-section-week", weekDuo, weekStats));

    // 5) Trends — longer-range signals, secondary to action + today
    const trends = homeSection(
      "Trends",
      "home-section-trends",
      renderNutritionTrendCard(meals, goal, macroGoals, todayMacros, {
        estimate: !macrosArePersonal(macroGoals, energy),
        hideMacros: true,
        title: "Nutrition (14 days)"
      }),
      await renderBodyweightCard(),
      renderMuscleBalance(await computeMuscleBalance(14)),
      renderHeatmap(completed)
    );
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

  function renderHeatmap(completed) {
    const card = el("div", { class: "card" });
    card.appendChild(el("div", { class: "card-title" }, "Training frequency (last 24 weeks)"));

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

  // ============ WORKOUT ============
  async function renderWorkout(view) {
    if (!state.activeWorkout) {
      // Primary path — pick an exercise and the session starts immediately.
      const all = await getAllExercises();
      const startCard = el("div", { class: "card" },
        el("h2", { style: "margin-bottom: 6px;" }, "Start a workout"),
        el("p", { class: "text-muted text-sm mb-8" },
          "Pick an exercise to begin — your session starts the moment you choose one. Add more as you go.")
      );
      const picker = buildExercisePickerUI(all, async (id, name) => {
        await beginWorkoutSession({
          name: suggestedName(),
          exercises: [await buildExerciseEntry(id, name)],
          source: "empty"
        });
      });
      startCard.appendChild(picker.body);
      view.appendChild(startCard);
      picker.refresh();

      // Repeat last completed session — compact fast path.
      const last = await getLastCompletedWorkout();
      if (last) {
        const exCount = (last.exercises || []).length;
        const names = (last.exercises || []).slice(0, 4).map(e => e.name).join(" · ");
        const more = exCount > 4 ? ` +${exCount - 4} more` : "";
        view.appendChild(el("div", { class: "card session-speed-card" },
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

      // Templates section
      const templates = await Storage.getTemplates();
      const tplCard = el("div", { class: "card" });
      tplCard.appendChild(el("div", { class: "row-between" },
        el("div", { class: "card-title", style: "margin: 0" }, "Templates"),
        el("span", { class: "text-xs text-faint" }, "Save routines when you finish a workout")
      ));
      if (templates.length === 0) {
        tplCard.appendChild(el("p", { class: "text-sm text-faint", style: "margin: 8px 0" },
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
                renderMain();
              } }, html: icons.trash })
            )
          ));
        }
        tplCard.appendChild(grid);
      }
      // Manual "New template" button
      tplCard.appendChild(el("button", { class: "btn btn-ghost btn-sm mt-8", on: { click: () => openTemplateEditor(null) } },
        el("span", { html: icons.plus }), "Create template manually"
      ));
      view.appendChild(tplCard);
      return;
    }

    const w = state.activeWorkout;

    // Header — name, timer, actions
    const timeElapsed = Math.floor((Date.now() - w.startedAt) / 1000);
    view.appendChild(el("div", { class: "workout-header" },
      el("div", {},
        el("h1", { style: "font-size: 24px;" }, w.name || "Workout"),
        el("div", { class: "text-xs text-faint mt-8" }, U.formatDate(w.date, { weekday: "long" }))
      ),
      el("div", { class: "row" },
        el("div", { class: "workout-timer", id: "workout-elapsed" }, U.formatTime(timeElapsed)),
        el("button", { class: "btn btn-primary", on: { click: finishWorkout } }, "Finish")
      )
    ));

    // Workout-level notes (collapsed by default)
    const notesArea = el("textarea", {
      class: "input workout-notes",
      placeholder: "Session notes (energy, sleep, how it felt)…",
      rows: "2"
    });
    notesArea.value = w.notes || "";
    const debouncedNotes = U.debounce(async () => {
      w.notes = notesArea.value;
      await Storage.saveWorkout(w);
    }, 400);
    notesArea.addEventListener("input", debouncedNotes);
    view.appendChild(el("div", { class: "workout-notes-wrap" }, notesArea));

    // Exercises
    for (const [idx, ex] of (w.exercises || []).entries()) {
      view.appendChild(await renderExerciseBlock(ex, idx));
    }

    // Add exercise
    view.appendChild(el("button", { class: "btn btn-block mt-16", on: { click: () => openExercisePicker(async (exerciseId, name) => {
      w.exercises.push(await buildExerciseEntry(exerciseId, name));
      await Storage.saveWorkout(w);
      renderMain();
    }) } },
      el("span", { html: icons.plus }), "Add exercise"
    ));

    view.appendChild(el("div", { class: "row mt-16", style: "gap: 8px; justify-content: flex-end;" },
      el("button", { class: "btn btn-ghost text-danger", on: { click: cancelWorkout } }, "Cancel workout")
    ));
  }

  function suggestedName() {
    const d = new Date();
    const weekday = d.toLocaleDateString("en-GB", { weekday: "long" });
    return `${weekday} Workout`;
  }

  async function startNewWorkout(template = null) {
    const nameInput = document.getElementById("new-workout-name");
    let name = (nameInput?.value || suggestedName()).trim();
    if (template && (!nameInput || !nameInput.value.trim())) name = template.name;

    let exercises = [];
    if (template && Array.isArray(template.exercises)) {
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
      exercises = template.exercises.map(te => {
        const def = all.find(x => x.id === te.exerciseId);
        const type = def ? inferExerciseType(def) : "weighted";
        const prev = lastById.get(te.exerciseId);
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
          const sets = [{
            durationMin: te.targetDurationMin ?? null,
            intensity: te.targetIntensity || "moderate",
            distanceKm: te.targetDistanceKm ?? null,
            done: false
          }];
          return {
            exerciseId: te.exerciseId,
            name: te.name || def?.name || "Exercise",
            type,
            met: def?.met,
            sets
          };
        }
        // Strength: template targets are explicit so they stay as values;
        // last-session loads are hints only (placeholders), never pre-typed.
        const hasTplLoad = te.targetWeight != null || te.targetReps != null;
        if (!hasTplLoad && prev && prev.sets && prev.sets.length) {
          return {
            exerciseId: te.exerciseId,
            name: te.name || def?.name || "Exercise",
            type,
            met: def?.met,
            sets: prev.sets.map(() => emptySetForType(type))
          };
        }
        const targetSets = Math.max(1, te.targetSets || (prev?.sets?.length) || 3);
        const sets = Array.from({ length: targetSets }, () => ({
          weight: te.targetWeight ?? null,
          reps: te.targetReps ?? null,
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

    return beginWorkoutSession({
      name,
      exercises,
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
    renderMain();
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
          const setsI = el("input", {
            type: "number", inputmode: "numeric", min: "1", max: "20",
            class: "input input-sm input-num", value: te.targetSets ?? 3
          });
          const repsI = el("input", {
            type: "number", inputmode: "numeric", min: "1", max: "100",
            class: "input input-sm input-num", value: te.targetReps ?? 8
          });
          setsI.addEventListener("input", () => { te.targetSets = parseInt(setsI.value) || 3; });
          repsI.addEventListener("input", () => { te.targetReps = parseInt(repsI.value) || 8; });
          fields = [
            el("div", { class: "template-editor-field" },
              el("label", {}, "Sets"), setsI),
            el("div", { class: "template-editor-field" },
              el("label", {}, "Reps"), repsI)
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

    const addBtn = el("button", { class: "btn btn-block mt-8", on: { click: () => openExercisePicker((exerciseId, name) => {
      const def = all.find(x => x.id === exerciseId);
      const isCardio = def ? inferExerciseType(def) === "cardio" : looksLikeCardio({ id: exerciseId, name });
      template.exercises.push(isCardio
        ? { exerciseId, name, targetDurationMin: 20, targetIntensity: "moderate" }
        : { exerciseId, name, targetSets: 3, targetReps: 8 });
      // openExercisePicker closes its own modal; re-open editor
      openTemplateEditor(template);
    }) } }, el("span", { html: icons.plus }), "Add exercise");

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
      Untouched rows (replayed values, template targets) are never auto-logged. */
  function commitFilledSets(workout) {
    let autoCommitted = 0;
    for (const ex of (workout.exercises || [])) {
      const isCardio = ex.type === "cardio";
      for (const s of (ex.sets || [])) {
        if (s.done) continue;
        if (!s.touched) continue;
        if (isCardio) {
          const dur = s.durationMin != null ? Number(s.durationMin) : NaN;
          if (dur > 0) {
            s.done = true;
            if (s.kcal == null) {
              try {
                const met = U.getMET({ type: "cardio", category: "cardio", met: ex.met }, s.intensity || "moderate");
                s.kcal = U.estimateKcal(met, U.DEFAULT_BW_KG, dur);
              } catch (_) {}
            }
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

    // Flush any live set-row inputs into the workout model before commit.
    // Covers the case where the user typed values and hit Finish without waiting
    // for debounced save or without tapping the check button.
    try {
      const blocks = document.querySelectorAll(".exercise-block");
      blocks.forEach((block, exIdx) => {
        const ex = (w.exercises || [])[exIdx];
        if (!ex) return;
        const rows = block.querySelectorAll(".set-row");
        rows.forEach((row, si) => {
          const s = (ex.sets || [])[si];
          if (!s) return;
          const inputs = row.querySelectorAll("input.input-num, select");
          if (ex.type === "cardio") {
            // cardio row: duration, intensity, distance, optional manual kcal
            const byField = (name) => row.querySelector(`[data-cardio-field="${name}"]`);
            const durEl = byField("durationMin");
            const intenEl = byField("intensity");
            const distEl = byField("distanceKm");
            const kcalEl = byField("kcal");
            if (durEl && durEl.value !== "") s.durationMin = parseFloat(durEl.value);
            if (intenEl) s.intensity = intenEl.value || s.intensity || "moderate";
            if (distEl && distEl.value !== "") s.distanceKm = parseFloat(distEl.value);
            if (kcalEl && kcalEl.value !== "") {
              const k = parseFloat(kcalEl.value);
              if (Number.isFinite(k) && k >= 0) {
                s.kcal = Math.round(k);
                s.kcalManual = true;
              }
            }
          } else {
            const nums = row.querySelectorAll("input.input-num");
            // bodyweight: only reps; weighted: weight then reps
            if (ex.type === "bodyweight") {
              s.weight = 0;
              if (nums[0] && nums[0].value !== "") s.reps = parseInt(nums[0].value, 10);
            } else {
              if (nums[0] && nums[0].value !== "") s.weight = parseFloat(nums[0].value);
              if (nums[1] && nums[1].value !== "") s.reps = parseInt(nums[1].value, 10);
            }
          }
        });
      });
    } catch (err) {
      console.error("finishWorkout flush failed", err);
    }

    const autoN = commitFilledSets(w);

    // Remove empty exercises / trim empty sets
    w.exercises = (w.exercises || []).map(ex => ({
      ...ex,
      sets: (ex.sets || []).filter(s => s.done)
    })).filter(ex => ex.sets.length > 0);
    if (w.exercises.length === 0) {
      if (!(await confirmDialog("No sets were logged. End workout anyway?", { title: "Finish workout?", okLabel: "End workout", danger: true }))) return;
    }
    w.completedAt = Date.now();
    w.durationSec = Math.floor((w.completedAt - w.startedAt) / 1000);
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
    state.tab = "history";
    renderMain();
    const burned = finishedWorkout.kcalBurned || 0;
    const autoBit = autoN > 0 ? ` · ${autoN} set${autoN === 1 ? "" : "s"} auto-logged` : "";
    toast(burned > 0 ? `Workout saved · ≈ ${burned} kcal${autoBit}` : `Workout saved${autoBit}`);
    // Offline data safety: after logging, offer a backup every N workouts.
    await maybePromptBackup();
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
    const isCardio = looksLikeCardio(def) || looksLikeCardio(ex) || ex.type === "cardio";
    if (isCardio) ex.type = "cardio";
    const exType = isCardio ? "cardio" : (ex.type || (def ? inferExerciseType(def) : "weighted") || "weighted");
    const bwKg = await getBodyweightKg();
    const defForMet = def || { category: isCardio ? "cardio" : "full_body", met: ex.met };
    const exKcal = exerciseKcalTotal(ex);

    // Determine if next exercise exists (for superset link)
    const nextEx = state.activeWorkout.exercises[idx + 1];

    const block = el("div", { class: "exercise-block" });
    if (ex.supersetGroup) block.classList.add("in-superset");

    // Type menu — only modes that make sense for this exercise. Single-mode
    // exercises show a plain label instead of a dropdown.
    const TYPE_LABELS = {
      weighted: "Weighted",
      bodyweight: "Bodyweight",
      weighted_bodyweight: "BW +kg",
      cardio: "Cardio"
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
          if (!ok) { typeMenu.value = exType; return; }
          ex.sets = [emptySetForType(nextType)];
        } else if (!hasLogged) {
          ex.sets = [emptySetForType(nextType)];
        }
        ex.type = nextType;
        await Storage.saveWorkout(state.activeWorkout);
        renderMain();
      });
    }

    block.appendChild(el("div", { class: "exercise-block-header" },
      el("div", { class: "exercise-block-title" },
        ex.name,
        ex.supersetGroup ? el("span", { class: "chip chip-sm", style: "margin-left:8px" }, "Superset") : null,
        exKcal > 0 ? el("span", { class: "chip chip-sm", style: "margin-left:8px" }, `≈ ${exKcal} kcal`) : null
      ),
      el("div", { class: "row" },
        typeMenu,
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
            renderMain();
          } }
        }) : null,
        el("button", { class: "icon-btn", title: "Exercise info", on: { click: () => openExerciseDetail(ex.exerciseId) },
          html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>' }),
        el("button", { class: "icon-btn", title: "Remove exercise", on: { click: async () => {
          if (!(await confirmDialog(`Remove ${ex.name} from this workout?`, { title: "Remove exercise?", okLabel: "Remove", danger: true }))) return;
          state.activeWorkout.exercises.splice(idx, 1);
          await Storage.saveWorkout(state.activeWorkout);
          renderMain();
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
          label = `${s.weight}×${s.reps}`;
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
          renderMainKeepScroll();
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
    const kpm = U.kcalPerMin({ ...defForMet, type: exType, category: def?.category || (isCardio ? "cardio" : defForMet.category) }, bwKg);
    body.appendChild(el("div", { class: "text-xs text-faint", style: "margin-bottom:8px" },
      `≈ ${kpm} kcal/min at ${bwKg}kg` + (isCardio ? " · type your machine/watch reading to override" : " · estimate from effort")));

    if (isCardio) {
      const showDist = cardioTracksDistance(ex);
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
      const controls = el("div", { class: "row", style: "gap:12px; align-items:center; margin-top:8px; flex-wrap:wrap;" },
        el("button", { class: "btn btn-ghost btn-sm", on: { click: async () => {
          const last = [...ex.sets].reverse().find(x => x.done) || ex.sets[ex.sets.length - 1];
          ex.sets.push({
            durationMin: last?.durationMin ?? null,
            intensity: last?.intensity || "moderate",
            distanceKm: last?.distanceKm ?? null,
            done: false
          });
          await Storage.saveWorkout(state.activeWorkout);
          renderMainKeepScroll();
        } } }, el("span", { html: icons.plus }), "Add interval"),
        ex.sets.length > 1 ? el("span", { class: "text-xs text-faint" }, "Double-tap the number to delete") : null
      );
      body.appendChild(controls);
    } else {
      // Sets table — e1RM/kcal are meta columns (hidden on phone to keep weight/reps readable)
      const weightHead = exType === "bodyweight" ? "" : (exType === "weighted_bodyweight" ? "+kg" : "kg");
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
      const controls = el("div", { class: "row", style: "gap:12px; align-items:center; margin-top:8px; flex-wrap:wrap;" },
        el("button", { class: "btn btn-ghost btn-sm", on: { click: async () => {
          const lastDone = [...ex.sets].reverse().find(x => x.done);
          const lastAny = ex.sets[ex.sets.length - 1];
          const prevSet = prev?.sets?.[ex.sets.length] || prev?.sets?.[(prev.sets || []).length - 1];
          ex.sets.push({
            weight: lastDone?.weight ?? lastAny?.weight ?? prevSet?.weight ?? null,
            reps: lastDone?.reps ?? lastAny?.reps ?? prevSet?.reps ?? null,
            done: false
          });
          await Storage.saveWorkout(state.activeWorkout);
          renderMainKeepScroll();
        } } }, el("span", { html: icons.plus }), "Add set"),
        ex.sets.length > 1 ? el("span", { class: "text-xs text-faint" }, "Double-tap the set number to delete") : null
      );
      body.appendChild(controls);
    }

    block.appendChild(body);
    return block;
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
      placeholder: prevSet?.distanceKm != null ? String(prevSet.distanceKm) : "—",
      value: s.distanceKm ?? "",
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
      s.touched = true;
      s.durationMin = durInput.value === "" ? null : parseFloat(durInput.value);
      if (!s.intensity) s.intensity = "moderate";
      if (distInput) s.distanceKm = distInput.value === "" ? null : parseFloat(distInput.value);
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
    attachNumPad(durInput, { label: `${ex.name} \u00b7 interval ${si + 1} \u00b7 minutes`, unit: "min", step: 5, decimals: true });
    attachNumPad(kcalInput, { label: `${ex.name} \u00b7 interval ${si + 1} \u00b7 calories`, unit: "kcal", step: 10 });
    selectOnFocus(kcalInput);
    if (distInput) {
      attachNumPad(distInput, { label: `${ex.name} \u00b7 interval ${si + 1} \u00b7 distance`, unit: "km", step: 0.5, decimals: true });
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
          if (distInput) s.distanceKm = distInput.value === "" ? null : parseFloat(distInput.value);
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
          const isDurPR = s.durationMin > (beforePRs.maxDuration || 0);
          const isDistPR = (s.distanceKm || 0) > (beforePRs.maxDistance || 0);
          const isKcalPR = (s.kcal || 0) > (beforePRs.maxKcal || 0);
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
        renderMainKeepScroll();
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
            renderMainKeepScroll();
          } } }, "Save")
        );
        openModal("Interval note", body, footer);
        setTimeout(() => ta.focus(), 40);
      } }
    });

    const row = el("div", { class: "set-row type-cardio" + (showDist ? "" : " no-dist") + (isPR ? " is-pr" : "") + (s.kcalManual ? " has-manual-kcal" : "") },
      el("div", { class: "set-index" }, String(si + 1)),
      durInput,
      distInput,
      kcalInput,
      el("div", { class: "set-row-actions" }, noteBtn, doneBtn)
    );
    if (isPR) {
      row.appendChild(el("span", { class: "pr-badge", style: "position:absolute; margin-left: -60px; margin-top: -18px" }, "PR"));
    }
    if (s.note) row.appendChild(el("div", { class: "set-note-inline" }, s.note));

    const tryDelete = async () => {
      if (ex.sets.length <= 1) return;
      if (await confirmDialog("Delete this interval?", { title: "Delete interval?", okLabel: "Delete", danger: true })) {
        ex.sets.splice(si, 1);
        await Storage.saveWorkout(state.activeWorkout);
        renderMainKeepScroll();
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
    indexCell.title = "Double-tap to delete interval";
    return row;
  }

  async function renderSetRow(ex, si, s, prs, prev, exType = "weighted", def = null, bwKg = U.DEFAULT_BW_KG) {
    const prevSet = prev?.sets[si];
    const isBodyweight = exType === "bodyweight";
    const showPlates = !isBodyweight && supportsPlateCalculator(def, ex);
    const placeholder = prevSet && prevSet.weight != null ? `${prevSet.weight}` : "";
    const placeholderReps = prevSet && prevSet.reps != null ? `${prevSet.reps}` : "";
    const toolsKey = `${state.activeWorkout?.id || "aw"}:${ex.exerciseId || ex.name}:${si}`;
    const closedKey = toolsKey + ":closed";
    // Open when user expanded, or when note/drop exists — unless user explicitly closed
    const toolsOpen = !expandedSetTools.has(closedKey) && (
      expandedSetTools.has(toolsKey) || !!(s.note || s.drop)
    );

    const e1rm = s.done && s.weight && s.reps
      ? U.epley(s.weight, s.reps).toFixed(1)
      : (s.done && isBodyweight && s.reps ? `${s.reps}` : "—");

    const weightInput = el("input", {
      type: "number", step: "0.5", inputmode: "decimal",
      class: "input input-sm input-num",
      placeholder: placeholder || "kg",
      value: s.weight != null && s.weight !== "" ? String(s.weight) : "",
      title: "Weight (kg)",
      autocomplete: "off",
      "aria-label": `Set ${si + 1} weight in kilograms`,
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
      s.touched = true;
      s.weight = isBodyweight ? (s.weight ?? 0) : (weightInput.value === "" ? null : parseFloat(weightInput.value));
      s.reps = repsInput.value === "" ? null : parseInt(repsInput.value, 10);
      const e1 = s.weight && s.reps
        ? U.epley(s.weight, s.reps).toFixed(1)
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
    attachNumPad(weightInput, {
      label: `${ex.name} \u00b7 set ${si + 1} \u00b7 ${exType === "weighted_bodyweight" ? "added weight" : "weight"}`,
      unit: "kg", step: 2.5, decimals: exType !== "weighted_bodyweight",
      allowMinus: exType === "weighted_bodyweight"
    });
    attachNumPad(repsInput, { label: `${ex.name} \u00b7 set ${si + 1} \u00b7 reps`, unit: "reps", step: 1 });

    const openPlates = () => openPlateCalculator(parseFloat(weightInput.value) || (prevSet?.weight ?? 60));
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
          if (isBodyweight) {
            s.weight = 0;
          } else {
            s.weight = weightInput.value === "" ? null : parseFloat(weightInput.value);
          }
          s.reps = repsInput.value === "" ? null : parseInt(repsInput.value, 10);
          if (!s.reps || (!isBodyweight && !s.weight && exType !== "weighted_bodyweight")) {
            toast("Enter weight and reps first");
            return;
          }
          if (!isBodyweight && !s.weight) s.weight = 0;
          s.done = true;
          s.kcal = calcStrengthKcal();
          const beforePRs = await getPRsFor(ex.exerciseId);
          const e = U.epley(s.weight, s.reps);
          const isWeightPR = s.weight > beforePRs.maxWeight;
          const isE1RMPR = e > beforePRs.maxE1RM;
          const isRepsPR = s.reps > beforePRs.maxReps;
          s.isPR = isWeightPR || isE1RMPR;
          s.prTypes = [];
          if (isWeightPR) s.prTypes.push("weight");
          if (isE1RMPR) s.prTypes.push("e1rm");
          if (isRepsPR) s.prTypes.push("reps");
          await Storage.saveWorkout(state.activeWorkout);
          if (s.isPR) toast(`🏆 New PR on ${ex.name}`);
          startRestTimer(ex.exerciseId);
        } else {
          s.done = false;
          s.isPR = false;
          s.prTypes = [];
          s.kcal = undefined;
          await Storage.saveWorkout(state.activeWorkout);
          stopRestTimer();
        }
        renderMainKeepScroll();
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
        renderMainKeepScroll();
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
            renderMain();
          } } }, "Save")
        );
        openModal("Set note", body, footer);
        setTimeout(() => ta.focus(), 40);
      } }
    });

    const moreBtn = el("button", {
      type: "button",
      class: "set-more-btn" + (toolsOpen ? " is-open" : "") + ((s.note || s.drop) ? " has-extra" : ""),
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
        renderMainKeepScroll();
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
    tools.appendChild(toolsMeta);

    const rowChildren = [
      el("div", { class: "set-index" }, String(si + 1)),
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
      if (ex.sets.length <= 1) return;
      if (await confirmDialog("Delete this set?", { title: "Delete set?", okLabel: "Delete", danger: true })) {
        ex.sets.splice(si, 1);
        await Storage.saveWorkout(state.activeWorkout);
        renderMainKeepScroll();
      }
    };
    row.addEventListener("dblclick", (e) => {
      if (e.target.closest("input,button,textarea,select")) return;
      e.preventDefault();
      tryDelete();
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
    const secs = state.prefs.defaultRestSec || 90;
    state.restTimer = { endsAt: Date.now() + secs * 1000, exerciseId, totalSec: secs };
    if (state.restInterval) clearInterval(state.restInterval);
    // Light pulse so you feel the rest window start (phones that support it).
    try { if (navigator.vibrate) navigator.vibrate(40); } catch (_) {}
    state.restInterval = setInterval(() => {
      if (!state.restTimer) return;
      const remaining = Math.round((state.restTimer.endsAt - Date.now()) / 1000);
      if (remaining <= 0) {
        // Beep and dismiss
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.frequency.value = 880; g.gain.value = 0.2;
          o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.15);
        } catch(e) {}
        try { if (navigator.vibrate) navigator.vibrate([200, 100, 200]); } catch (_) {}
        // Look up exercise name for a nicer notification body
        let exName = "";
        if (state.activeWorkout && exerciseId) {
          const ex = state.activeWorkout.exercises.find(e => e.exerciseId === exerciseId);
          if (ex) exName = ex.name;
        }
        fireRestCompleteNotification(exName);
        stopRestTimer();
      } else {
        updateRestTimerUI(remaining);
      }
    }, 250);
    renderRestTimer();
  }
  function stopRestTimer() {
    if (state.restInterval) { clearInterval(state.restInterval); state.restInterval = null; }
    state.restTimer = null;
    document.title = BASE_DOC_TITLE;
    renderRestTimer();
  }
  function renderRestTimer() {
    let el_ = document.getElementById("rest-timer");
    if (!state.restTimer) {
      if (el_) el_.remove();
      document.title = BASE_DOC_TITLE;
      return;
    }
    if (!el_) {
      el_ = el("div", { class: "rest-timer", id: "rest-timer" });
      el_.appendChild(el("div", {},
        el("div", { class: "rest-timer-label" }, "Rest"),
        el("div", { class: "rest-timer-value", id: "rest-value" }, "—")
      ));
      el_.appendChild(el("button", { class: "rest-timer-btn", on: { click: () => {
        if (!state.restTimer) return;
        state.restTimer.endsAt += 15000;
        updateRestTimerUI(Math.max(0, Math.round((state.restTimer.endsAt - Date.now()) / 1000)));
      } } }, "+15"));
      el_.appendChild(el("button", { class: "rest-timer-btn", on: { click: stopRestTimer } }, "Skip"));
      document.body.appendChild(el_);
    }
    const remaining = Math.max(0, Math.round((state.restTimer.endsAt - Date.now()) / 1000));
    updateRestTimerUI(remaining);
  }
  function updateRestTimerUI(remaining) {
    const v = document.getElementById("rest-value");
    if (v) v.textContent = U.formatTime(remaining);
    // Lock-screen / tab switch: remaining rest visible in the browser title.
    if (state.restTimer) {
      document.title = `${U.formatTime(remaining)} rest · FitForge`;
    }
  }

  // ============ EXERCISE LIBRARY ============
  async function renderLibrary(view) {
    const all = await getAllExercises();
    const bwKg = await getBodyweightKg();
    const workouts = await Storage.getWorkouts();

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
    const heat = (window.BodyMap && BodyMap.heatFromWorkouts)
      ? BodyMap.heatFromWorkouts(workouts, byId, 14)
      : {};

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
      syncChips();
      refresh();
    }

    function setFromChip(cat) {
      activeZone = cat || "all";
      syncChips();
      if (bodyMapApi) bodyMapApi.setActive(activeZone);
      refresh();
    }

    // Interactive body map (front / back SVG, fine zones + heat)
    if (window.BodyMap && typeof window.BodyMap.create === "function") {
      bodyMapApi = window.BodyMap.create({
        activeZone,
        counts: zoneCounts,
        heat,
        heatEnabled: true,
        onSelect: setFromMap
      });
      view.appendChild(bodyMapApi.el);
    }

    const controls = el("div", { class: "library-controls" });
    const searchInput = el("input", { class: "input", placeholder: "Search exercises…", id: "lib-search" });
    controls.appendChild(searchInput);
    view.appendChild(controls);

    // Muscle group filter chips (fallback + cardio / full body)
    const filterRow = el("div", { class: "filter-row" });
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

    // Custom exercise button
    view.appendChild(el("button", { class: "btn btn-block mb-8", on: { click: openCustomExerciseForm } },
      el("span", { html: icons.plus }), "Add custom exercise"
    ));

    const grid = el("div", { class: "exercise-grid" });
    view.appendChild(grid);

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

    function refresh() {
      const q = searchInput.value.trim().toLowerCase();
      clear(grid);
      const filtered = all.filter(ex => {
        if (!matchesActiveZone(ex)) return false;
        if (!q) return true;
        return ex.name.toLowerCase().includes(q) ||
               (ex.muscles || []).some(m => m.toLowerCase().includes(q)) ||
               (ex.equipment || "").toLowerCase().includes(q);
      });
      if (filtered.length === 0) {
        grid.appendChild(emptyState({
          title: "No exercises found",
          body: "Try a different search or clear the body zone filter.",
          primaryLabel: "Clear filters",
          onPrimary: () => {
            if (bodyMapApi) bodyMapApi.clear();
            searchInput.value = "";
            refresh();
          },
          primaryTestId: "empty-exercises-clear",
          secondaryLabel: "Add custom",
          onSecondary: () => openCustomExerciseForm()
        }));
        return;
      }
      for (const ex of filtered) {
        const kpm = U.kcalPerMin(ex, bwKg);
        grid.appendChild(el("div", {
          class: "exercise-card",
          on: { click: () => openExerciseDetail(ex.id) }
        },
          el("div", { class: "exercise-card-name" }, ex.name, ex.isCustom ? el("span", { class: "chip chip-accent" }, "Custom") : null),
          el("div", { class: "exercise-card-meta" }, `${EXERCISE_CATEGORIES[ex.category]} · ${ex.equipment || "—"} · ≈ ${kpm} kcal/min`),
          el("div", { class: "exercise-card-muscles" }, (ex.muscles || []).join(" · "))
        ));
      }
    }
    searchInput.addEventListener("input", U.debounce(refresh, 150));
    refresh();
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
    const kpmEasy = U.kcalPerMin({ ...ex, category: "cardio", type: "cardio" }, bwKg, "easy");
    const kpmMod = U.kcalPerMin(ex, bwKg, isCardio ? "moderate" : "moderate");
    const kpmHard = U.kcalPerMin({ ...ex, category: "cardio", type: "cardio" }, bwKg, "hard");

    const body = el("div", {},
      el("div", { class: "chip" }, EXERCISE_CATEGORIES[ex.category]),
      el("div", { class: "chip" }, ex.equipment || "—"),
      (ex.muscles || []).map(m => el("div", { class: "chip" }, m)),
      // Approx calories
      el("div", { class: "card mt-16" },
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
                el("div", { class: "stat-value" }, prs.maxDistance ? `${prs.maxDistance} km` : "—")
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
                el("div", { class: "stat-value" }, prs.maxWeight ? `${prs.maxWeight}kg` : "—")
              ),
              el("div", { class: "stat" },
                el("div", { class: "stat-label" }, "e1RM"),
                el("div", { class: "stat-value" }, prs.maxE1RM ? `${prs.maxE1RM.toFixed(1)}kg` : "—")
              ),
              el("div", { class: "stat" },
                el("div", { class: "stat-label" }, "Max reps"),
                el("div", { class: "stat-value" }, prs.maxReps || "—")
              )
            )
          ) : null),
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
              el("div", { class: "rm-weight" }, `${rounded.toFixed(1)}kg`)
            );
          })
        )
      ) : null,
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
        el("ul", { class: "detail-list bullet" }, ex.variations.map(v => el("li", {}, v)))
      ) : null,
      // Alternatives
      ex.alternatives?.length ? el("div", { class: "detail-section" },
        el("h3", {}, "Alternatives"),
        el("ul", { class: "detail-list bullet" }, ex.alternatives.map(a => el("li", {}, a)))
      ) : null,
      // Recent history
      history.length ? el("div", { class: "detail-section" },
        el("h3", {}, "Recent history"),
        ...history.slice(0, 5).map(h => el("div", { class: "history-item", style: "cursor:default" },
          el("div", { class: "history-item-date" }, U.formatDate(h.date, { year: "numeric" })),
          el("div", { class: "history-item-summary" }, h.sets.map(s => {
            if (s.durationMin != null) {
              const dist = s.distanceKm ? ` · ${s.distanceKm}km` : "";
              const kcal = s.kcal ? ` · ${s.kcal} kcal` : "";
              return `${s.durationMin} min · ${U.intensityLabel(s.intensity)}${dist}${kcal}`;
            }
            if (!s.weight && s.reps) return `${s.reps} reps`;
            return `${s.weight}kg × ${s.reps}`;
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

  function openCustomExerciseForm() {
    const nameI = el("input", { class: "input", placeholder: "Exercise name" });
    const catS = el("select", { class: "select" },
      ...Object.entries(EXERCISE_CATEGORIES).map(([k, v]) => el("option", { value: k }, v))
    );
    const equipI = el("input", { class: "input", placeholder: "Equipment (optional)" });
    const musclesI = el("input", { class: "input", placeholder: "Muscles worked, comma-separated" });
    const metI = el("input", { class: "input input-num", type: "number", step: "0.1", placeholder: "Auto from category" });
    const notesI = el("textarea", { class: "textarea", rows: "3", placeholder: "Notes / technique (optional)" });

    const body = el("div", {},
      el("div", { class: "form-row" }, el("div", { style: "flex:1" }, el("label", { class: "label" }, "Name"), nameI)),
      el("div", { class: "form-row" },
        el("div", { style: "flex:1" }, el("label", { class: "label" }, "Category"), catS),
        el("div", { style: "flex:1" }, el("label", { class: "label" }, "Equipment"), equipI)
      ),
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
        await Storage.saveCustomExercise(ex);
        closeModal();
        toast("Custom exercise saved");
        renderMain();
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

  // Category-first exercise picker: choose a muscle group (animated tiles) → browse
  // its exercises. A search box on top jumps straight to any exercise by name.
  // Reused by both the start-a-workout screen and the in-workout "Add exercise" modal.
  function buildExercisePickerUI(all, onPick) {
    const BACK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;
    let mode = "categories"; // "categories" | "exercises"
    let activeCat = null;
    const searchI = el("input", { class: "input", placeholder: "Search exercises…" });
    const content = el("div", { class: "xpick-content" });

    const catLabel = (c) => c === "all" ? "All" : EXERCISE_CATEGORIES[c];
    const countFor = (c) => c === "all" ? all.length : all.filter(e => e.category === c).length;

    function exerciseGrid(list) {
      const grid = el("div", { class: "exercise-grid" });
      if (!list.length) {
        grid.appendChild(el("div", { class: "text-sm text-faint", style: "padding: 16px 4px" }, "No exercises found."));
      }
      for (const ex of list.slice(0, 150)) {
        grid.appendChild(el("div", { class: "exercise-card", on: { click: () => onPick(ex.id, ex.name) } },
          el("div", { class: "exercise-card-name" }, ex.name),
          el("div", { class: "exercise-card-meta" }, `${EXERCISE_CATEGORIES[ex.category]} · ${ex.equipment || "—"}`)
        ));
      }
      return grid;
    }

    function showCategories() {
      clear(content);
      const grid = el("div", { class: "xcat-grid" });
      for (const c of ["all", ...Object.keys(EXERCISE_CATEGORIES)]) {
        grid.appendChild(el("button", {
          class: `xcat-tile xcat-${c}`, "data-testid": `xcat-${c}`,
          on: { click: () => { activeCat = c; mode = "exercises"; showExercises(); } }
        },
          categoryIconNode(c),
          el("span", { class: "xcat-name" }, catLabel(c)),
          el("span", { class: "xcat-count" }, `${countFor(c)}`)
        ));
      }
      content.appendChild(grid);
    }

    function showExercises() {
      clear(content);
      content.appendChild(el("button", {
        class: "xpick-back", "data-testid": "xpick-back",
        on: { click: () => { mode = "categories"; activeCat = null; showCategories(); } }
      }, el("span", { class: "xpick-back-ic", html: BACK }), catLabel(activeCat)));
      const list = all.filter(e => activeCat === "all" || e.category === activeCat);
      content.appendChild(exerciseGrid(list));
    }

    function showSearch(q) {
      clear(content);
      const matches = all.filter(ex =>
        ex.name.toLowerCase().includes(q) ||
        (ex.muscles || []).some(m => m.toLowerCase().includes(q)) ||
        (ex.equipment || "").toLowerCase().includes(q));
      content.appendChild(el("div", { class: "xpick-search-head" }, `${matches.length} result${matches.length === 1 ? "" : "s"}`));
      content.appendChild(exerciseGrid(matches));
    }

    function refresh() {
      const q = searchI.value.trim().toLowerCase();
      if (q) showSearch(q);
      else if (mode === "exercises" && activeCat) showExercises();
      else showCategories();
    }

    searchI.addEventListener("input", U.debounce(refresh, 120));
    const body = el("div", { class: "xpick" }, searchI, content);
    return { body, refresh, focus: () => searchI.focus() };
  }

  function openExercisePicker(onPick) {
    getAllExercises().then(all => {
      const picker = buildExercisePickerUI(all, (id, name) => { closeModal(); onPick(id, name); });
      openModal("Add exercise", picker.body, null);
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

  function mealRowMeta(m) {
    const bits = [];
    const t = U.normalizeMealTime(m?.time);
    if (t) bits.push(t);
    const rest = mealMacroMeta(m);
    if (rest) bits.push(rest);
    return bits.length ? bits.join(" · ") : null;
  }

  function mealSectionSelect(selected) {
    const s = el("select", { class: "select" });
    for (const opt of U.mealSectionOptions()) {
      s.appendChild(el("option", { value: opt.value }, opt.label));
    }
    s.value = U.normalizeMealSection(selected || "snack");
    return s;
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
    toast("Meal saved for reuse");
    return tpl;
  }

  async function logMealFromTemplate(tpl, sectionOverride = null) {
    const section = U.normalizeMealSection(sectionOverride || tpl.section || "snack");
    const meal = {
      id: U.uid(),
      name: tpl.name,
      kcal: tpl.kcal || 0,
      protein: tpl.protein || 0,
      carbs: tpl.carbs || 0,
      fat: tpl.fat || 0,
      section,
      time: U.nowMealTime(),
      date: U.todayISO(),
      notes: tpl.notes || "",
      savedAt: Date.now(),
      fromTemplateId: tpl.id
    };
    await Storage.saveMeal(meal);
    try {
      await Storage.saveMealTemplate({ ...tpl, lastUsedAt: Date.now(), updatedAt: tpl.updatedAt || Date.now() });
    } catch (_) {}
    toast(`Logged ${tpl.name}`);
    renderMain();
  }

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

    const body = el("div", {},
      el("label", { class: "label" }, "Name"),
      nameI,
      el("div", { class: "supplement-dose-row", style: "margin-top:12px" },
        el("div", {}, el("label", { class: "label" }, "Usual dose"), doseI),
        el("div", {}, el("label", { class: "label" }, "Unit"), unitSel)
      ),
      el("label", { class: "label", style: "margin-top:12px" }, "Notes"),
      notesI,
      el("p", { class: "text-xs text-faint", style: "margin-top:10px" },
        "Tick it off each day on the Nutrition tab. Nothing is auto-logged to food calories.")
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
          createdAt: existing?.createdAt || Date.now(),
          updatedAt: Date.now()
        };
        await Storage.saveSupplement(payload);
        closeModal();
        toast(existing ? "Supplement updated" : "Supplement added");
        renderMain();
      } } }, existing ? "Save" : "Add")
    );
    openModal(existing ? "Edit supplement" : "Add supplement", body, footer);
    setTimeout(() => nameI.focus(), 40);
  }

  async function toggleSupplementTaken(supp, todayLogs) {
    const today = U.todayISO();
    const existing = (todayLogs || []).find(l => l.supplementId === supp.id && l.date === today);
    if (existing) {
      await Storage.deleteSupplementLog(existing.id);
      toast(`${supp.name} unmarked`);
    } else {
      await Storage.saveSupplementLog({
        id: U.uid(),
        date: today,
        supplementId: supp.id,
        name: supp.name,
        dose: supp.defaultDose ?? null,
        unit: supp.unit || "serving",
        time: U.nowMealTime ? U.nowMealTime() : new Date().toTimeString().slice(0, 5),
        taken: true,
        savedAt: Date.now()
      });
      toast(`${supp.name} logged`);
    }
    renderMain();
  }

  async function renderSupplementsCard() {
    const [supplements, logs] = await Promise.all([
      Storage.getSupplements(),
      Storage.getSupplementLogs()
    ]);
    const today = U.todayISO();
    const todayLogs = logs.filter(l => l.date === today);
    const takenIds = new Set(todayLogs.map(l => l.supplementId));
    const sorted = supplements.slice().sort((a, b) =>
      String(a.name || "").localeCompare(String(b.name || ""), undefined, { sensitivity: "base" })
    );
    const takenCount = sorted.filter(s => takenIds.has(s.id)).length;

    const card = el("div", { class: "card supplement-card" });
    card.appendChild(el("div", { class: "row-between", style: "align-items:flex-start; gap:8px" },
      el("div", {},
        el("div", { class: "card-title", style: "margin:0 0 4px 0" }, "Supplements"),
        el("div", { class: "text-xs text-faint" },
          sorted.length
            ? `${takenCount} of ${sorted.length} taken today · tap Taken to log`
            : "Track daily supplements separately from meals.")
      ),
      el("button", {
        class: "btn btn-ghost btn-sm",
        on: { click: () => openSupplementForm(null) }
      }, el("span", { html: icons.plus }), "Add")
    ));

    if (!sorted.length) {
      card.appendChild(emptyState({
        compact: true,
        className: "supplement-empty",
        body: "Add creatine, vitamin D, protein powder, or anything you take by hand.",
        primaryLabel: "Add supplement",
        onPrimary: () => openSupplementForm(null),
        primaryTestId: "empty-add-supplement"
      }));
      return card;
    }

    const list = el("div", { class: "supplement-list" });
    for (const s of sorted) {
      const taken = takenIds.has(s.id);
      const log = todayLogs.find(l => l.supplementId === s.id);
      const doseLine = formatSupplementDose(s) +
        (log?.time ? ` · ${log.time}` : "") +
        (s.notes ? ` · ${s.notes}` : "");
      list.appendChild(el("div", { class: "supplement-row" + (taken ? " is-taken" : "") },
        el("div", { class: "supplement-main" },
          el("div", { class: "supplement-name" }, s.name),
          el("div", { class: "supplement-meta" }, doseLine)
        ),
        el("div", { class: "supplement-actions" },
          el("button", {
            type: "button",
            class: "supplement-taken-btn" + (taken ? " is-on" : ""),
            title: taken ? "Unmark for today" : "Mark as taken today",
            on: { click: () => toggleSupplementTaken(s, todayLogs) }
          }, taken ? "Taken" : "Take"),
          el("button", {
            type: "button",
            class: "icon-btn",
            title: "Edit supplement",
            on: { click: () => openSupplementForm(s) },
            html: icons.edit
          }),
          el("button", {
            type: "button",
            class: "icon-btn",
            title: "Remove supplement",
            on: { click: async () => {
              if (!(await confirmDialog(`Remove “${s.name}” from your list?`, {
                title: "Remove supplement?",
                okLabel: "Remove",
                danger: true
              }))) return;
              // Clear today's log for this supplement if present
              for (const l of todayLogs.filter(x => x.supplementId === s.id)) {
                await Storage.deleteSupplementLog(l.id);
              }
              await Storage.deleteSupplement(s.id);
              toast("Supplement removed");
              renderMain();
            } },
            html: icons.trash
          })
        )
      ));
    }
    card.appendChild(list);
    return card;
  }

  async function renderNutrition(view) {
    const [meals, mealTemplates] = await Promise.all([
      Storage.getMeals(),
      Storage.getMealTemplates()
    ]);
    const today = U.todayISO();
    const todaysMeals = meals.filter(m => m.date === today);
    const totalKcal = todaysMeals.reduce((s, m) => s + (m.kcal || 0), 0);
    const dayMacros = U.sumMacros(todaysMeals);
    const energy = await resolveEnergyBudget(today);
    const macroGoals = await resolveMacroGoals(today, energy);
    const goal = energy.goal || 2200;
    const pct = Math.min(100, (totalKcal / goal) * 100);
    const over = totalKcal > goal;

    // Header card — plain language, matches Home food-room wording
    const energyPersonal = targetsArePersonal(energy);
    const macrosPersonal = macrosArePersonal(macroGoals, energy);
    const goalHint = energySourceLabel(energy);
    const left = goal - totalKcal;
    const roomLine = left >= 0
      ? `${left} left of ${goal} room · ${goalHint}`
      : `${Math.abs(left)} over ${goal} room · ${goalHint}`;
    const macroHint = macrosPersonal
      ? (macroGoals.source === "auto" || macroGoals.source === "auto-fallback"
          ? `Suggested · ${macroGoals.proteinPerKg} g/kg · fat ${macroGoals.fatPercent}%`
          : macroGoals.source === "manual"
            ? "Set by you"
            : "Set targets in Settings")
      : (macroGoals.source === "manual"
          ? "Set by you"
          : "Starter estimate · personalise in Settings");
    const header = el("div", {
      class: "card" + (energyPersonal ? "" : " is-estimate"),
      "data-testid": "nutrition-today-card"
    },
      el("div", { class: "row-between" },
        el("div", {},
          el("div", { class: "card-title", style: "margin:0 0 4px 0" }, "Today's food"),
          el("div", {
            class: energyPersonal ? "" : "is-estimate",
            style: "font-family: var(--font-mono); font-size: 28px; font-weight: 600;"
          }, `${totalKcal}`),
          el("div", { class: "text-xs text-faint", style: "margin-top: 2px" }, "eaten today"),
          el("div", { class: "text-sm text-muted mt-8" + (energyPersonal ? "" : " is-estimate") }, roomLine)
        ),
        el("button", { class: "btn btn-primary", on: { click: () => openQuickAdd() } },
          el("span", { html: icons.plus }), "Log meal"
        )
      ),
      el("div", { class: "kcal-progress" },
        el("div", { class: "kcal-progress-fill" + (over ? " over" : ""), style: `width: ${pct}%` })
      )
    );
    if (!energyPersonal) {
      const needsProfile = !energy.profileReady;
      header.appendChild(el("div", { class: "energy-setup-banner mt-12" },
        el("div", { class: "text-sm text-muted" },
          needsProfile
            ? "These room numbers are a starter estimate. Set up your profile to personalise them."
            : "Log your bodyweight so room and macros use your numbers, not a default."
        ),
        el("button", {
          class: "btn btn-primary btn-sm mt-8",
          on: {
            click: () => {
              if (needsProfile) openSettings();
              else scrollToBodyweightCard();
            }
          }
        }, needsProfile ? "Set up food room" : "Log bodyweight")
      ));
    }
    header.appendChild(renderMacroBreakdown(dayMacros, {
      title: "Macros",
      goalHint: macroHint,
      goals: macroGoals.hasGoals ? macroGoals.goals : null,
      estimate: !macrosPersonal,
      emptyText: todaysMeals.length
        ? "Add protein, carbs and fat on meals for a macro breakdown."
        : "Log a meal with macros to track daily protein, carbs and fat."
    }));
    view.appendChild(header);

    // Saved meals — one-tap re-log of common foods
    const savedCard = el("div", { class: "card meal-saved-card" });
    savedCard.appendChild(el("div", { class: "row-between", style: "align-items:flex-start; gap:8px" },
      el("div", {},
        el("div", { class: "card-title", style: "margin:0 0 4px 0" }, "Saved meals"),
        el("div", { class: "text-xs text-faint" }, "Tap to log again with the same calories and macros.")
      ),
      el("button", {
        class: "btn btn-ghost btn-sm",
        on: { click: () => openMealTemplateEditor(null) }
      }, el("span", { html: icons.plus }), "New saved")
    ));
    if (!mealTemplates.length) {
      savedCard.appendChild(emptyState({
        compact: true,
        body: "No saved meals yet. Log a meal, then tap the bookmark to keep it for next time.",
        primaryLabel: "Log meal",
        onPrimary: () => openQuickAdd(),
        primaryTestId: "empty-saved-log-meal"
      }));
    } else {
      const sorted = mealTemplates.slice().sort((a, b) =>
        (b.lastUsedAt || b.updatedAt || 0) - (a.lastUsedAt || a.updatedAt || 0)
      );
      const grid = el("div", { class: "meal-saved-grid" });
      for (const tpl of sorted) {
        const macroLine = U.formatMacroLine(tpl);
        grid.appendChild(el("div", { class: "meal-saved-item" },
          el("button", {
            type: "button",
            class: "meal-saved-main",
            title: `Log ${tpl.name} today`,
            on: { click: () => logMealFromTemplate(tpl) }
          },
            el("div", { class: "meal-saved-name" }, tpl.name),
            el("div", { class: "meal-saved-meta" },
              `${tpl.kcal || 0} kcal` +
              (macroLine ? ` · ${macroLine}` : "") +
              (tpl.section ? ` · ${String(tpl.section).charAt(0).toUpperCase()}${String(tpl.section).slice(1)}` : "")
            )
          ),
          el("div", { class: "meal-saved-actions" },
            el("button", {
              type: "button",
              class: "icon-btn",
              title: "Edit saved meal",
              on: { click: () => openMealTemplateEditor(tpl) },
              html: icons.edit
            }),
            el("button", {
              type: "button",
              class: "icon-btn",
              title: "Delete saved meal",
              on: { click: async () => {
                if (!(await confirmDialog(`Remove saved meal “${tpl.name}”?`, { title: "Delete saved meal?", okLabel: "Delete", danger: true }))) return;
                await Storage.deleteMealTemplate(tpl.id);
                renderMain();
              } },
              html: icons.trash
            })
          )
        ));
      }
      savedCard.appendChild(grid);
    }
    view.appendChild(savedCard);

    // Manual supplement tracker (daily checklist, separate from food calories)
    view.appendChild(await renderSupplementsCard());

    // Meals grouped by section; core four always shown, extras only when used.
    const groups = U.groupMealsBySection(todaysMeals);
    for (const key of U.MEAL_SECTION_ORDER) {
      const metaSec = U.MEAL_SECTIONS[key];
      const items = groups[key] || [];
      if (!metaSec.alwaysShow && items.length === 0) continue;
      const label = metaSec.label;
      const kcal = items.reduce((s, m) => s + (m.kcal || 0), 0);
      const sectionMacros = U.sumMacros(items);
      const group = el("div", { class: "card meal-group" });
      group.appendChild(el("div", { class: "meal-group-header" },
        el("div", {},
          el("div", { class: "meal-group-title" }, label),
          sectionMacros.hasMacros
            ? el("div", { class: "meal-group-macros text-xs text-faint" }, U.formatMacroLine(sectionMacros))
            : null
        ),
        el("div", { class: "meal-group-kcal" }, `${kcal} kcal`)
      ));
      if (items.length === 0) {
        group.appendChild(emptyState({
          compact: true,
          body: "Nothing logged yet.",
          primaryLabel: `Log ${label.toLowerCase()}`,
          onPrimary: () => openQuickAdd(key),
          primaryTestId: `empty-log-meal-${key}`
        }));
      } else {
        for (const m of items) {
          const meta = mealRowMeta(m);
          group.appendChild(el("div", { class: "meal-item" },
            el("div", { style: "min-width:0; flex:1" },
              el("div", { class: "meal-item-name" }, m.name),
              meta ? el("div", { class: "meal-item-meta" }, meta) : null
            ),
            el("div", { class: "row" },
              el("div", { class: "meal-item-kcal" }, `${m.kcal} kcal`),
              el("button", {
                class: "icon-btn",
                title: "Save meal for reuse",
                on: { click: async () => {
                  await saveMealAsTemplate(m);
                  renderMain();
                } },
                html: icons.bookmark
              }),
              el("button", { class: "icon-btn", title: "Edit", on: { click: () => openMealForm(m) }, html: icons.edit }),
              el("button", { class: "icon-btn", title: "Delete", on: { click: async () => {
                if (!(await confirmDialog(`Delete “${m.name}”?`, { title: "Delete meal?", okLabel: "Delete", danger: true }))) return;
                await Storage.deleteMeal(m.id);
                renderMain();
              } }, html: icons.trash })
            )
          ));
        }
      }
      const addLabel = label === "Snacks" ? "snacks" : label.toLowerCase();
      group.appendChild(el("button", { class: "btn btn-ghost btn-sm mt-8", on: { click: () => openQuickAdd(key) } },
        el("span", { html: icons.plus }), `Add to ${addLabel}`
      ));
      view.appendChild(group);
    }

    // Quick-add for hidden categories when none logged yet
    const hiddenEmpty = U.MEAL_SECTION_ORDER.filter(k => !U.MEAL_SECTIONS[k].alwaysShow && !(groups[k] || []).length);
    if (hiddenEmpty.length) {
      const extra = el("div", { class: "card" },
        el("div", { class: "card-title", style: "margin: 0 0 8px 0" }, "More categories"),
        el("div", { class: "text-xs text-faint", style: "margin-bottom: 10px" },
          "Pre-workout, post-workout and other appear above once you log something there."),
        el("div", { class: "row", style: "gap: 8px; flex-wrap: wrap" },
          ...hiddenEmpty.map(key => el("button", {
            class: "btn btn-ghost btn-sm",
            on: { click: () => openQuickAdd(key) }
          }, el("span", { html: icons.plus }), U.mealSectionOptions().find(o => o.value === key)?.label || key))
        )
      );
      view.appendChild(extra);
    }

    // ============ Nutrition history (Feature 1) ============
    // Aggregate kcal per day for the last 14 days (excluding today), show trend + list.
    const byDate = {};
    for (const m of meals) {
      byDate[m.date] = byDate[m.date] || { kcal: 0, protein: 0, count: 0 };
      byDate[m.date].kcal += (m.kcal || 0);
      byDate[m.date].protein += (m.protein || 0);
      byDate[m.date].count++;
    }
    // 14-day series (oldest → newest); null for missing days.
    const days = 14;
    const trendVals = [];
    const trendDates = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const iso = U.todayISO(d);
      trendDates.push(iso);
      trendVals.push(byDate[iso]?.kcal ?? null);
    }
    const loggedDays = trendVals.filter(v => v != null && v > 0);
    if (loggedDays.length) {
      const avg = loggedDays.reduce((s, v) => s + v, 0) / loggedDays.length;
      const card = el("div", { class: "card" });
      card.appendChild(el("div", { class: "row-between" },
        el("div", { class: "card-title", style: "margin: 0" }, "Calorie trend (14 days)"),
        el("div", { class: "text-sm text-muted" }, `Avg ${Math.round(avg)} kcal`)
      ));
      card.appendChild(el("div", { style: "margin-top: 8px" },
        sparkline(trendVals, { width: 320, height: 60, goal })
      ));
      card.appendChild(el("div", { class: "text-xs text-faint", style: "margin-top: 4px" },
        `Dashed line = daily goal (${goal} kcal). Only days with meals logged are counted in the average.`));
      view.appendChild(card);
    }

    // Past days — summary rows that open a full intake breakdown for that day.
    const past = meals.filter(m => m.date !== today).sort((a, b) => b.date.localeCompare(a.date));
    if (past.length) {
      const pastByDate = {};
      for (const m of past) {
        pastByDate[m.date] = pastByDate[m.date] || { kcal: 0, protein: 0, carbs: 0, fat: 0, count: 0, sections: {}, meals: [] };
        pastByDate[m.date].kcal += (m.kcal || 0);
        pastByDate[m.date].protein += (m.protein || 0);
        pastByDate[m.date].carbs += (m.carbs || 0);
        pastByDate[m.date].fat += (m.fat || 0);
        pastByDate[m.date].count++;
        pastByDate[m.date].meals.push(m);
        const sec = U.normalizeMealSection(m.section);
        pastByDate[m.date].sections[sec] = (pastByDate[m.date].sections[sec] || 0) + (m.kcal || 0);
      }
      // Stable newest-first order (Object.entries is insertion-order; past was sorted desc)
      const entries = Object.entries(pastByDate).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 30);
      const list = el("div", { class: "card" });
      list.appendChild(el("div", { class: "card-title" }, "Recent days"));
      list.appendChild(el("div", { class: "text-xs text-faint", style: "margin: -4px 0 8px" },
        "Tap a day to see the full meal breakdown."));
      for (const [date, d] of entries) {
        const pctOfGoal = goal ? Math.round(d.kcal / goal * 100) : 0;
        const overGoal = d.kcal > goal;
        const sectionBits = U.MEAL_SECTION_ORDER
          .filter(k => d.sections[k])
          .map(k => `${U.mealSectionShort(k)} ${d.sections[k]}`)
          .join(" · ");
        list.appendChild(el("div", {
          class: "meal-item nutrition-history-row",
          role: "button",
          tabindex: "0",
          title: "View full day breakdown",
          on: {
            click: () => openNutritionDayDetail(date),
            keydown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openNutritionDayDetail(date); } }
          }
        },
          el("div", { style: "min-width:0; flex:1" },
            el("div", { class: "meal-item-name" }, U.formatDate(date, { year: "numeric" })),
            el("div", { class: "meal-item-meta" },
              `${d.count} ${d.count === 1 ? "entry" : "entries"} · ${pctOfGoal}% of goal` +
              (sectionBits ? ` · ${sectionBits}` : "") +
              ((d.protein || d.carbs || d.fat)
                ? ` · ${U.formatMacroLine({ protein: d.protein, carbs: d.carbs, fat: d.fat })}`
                : "")
            )
          ),
          el("div", { class: "row", style: "flex-shrink:0; gap: 6px; align-items:center" },
            el("div", { class: "meal-item-kcal" + (overGoal ? " over" : "") }, `${d.kcal} kcal`),
            el("span", { class: "text-faint", style: "font-size:16px; line-height:1" }, "›")
          )
        ));
      }
      view.appendChild(list);
    }
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
        onPrimary: () => openQuickAdd("breakfast", dayIso),
        primaryTestId: "empty-day-log-meal"
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
          const meta = mealRowMeta(m);
          group.appendChild(el("div", { class: "meal-item" },
            el("div", { style: "min-width:0; flex:1" },
              el("div", { class: "meal-item-name" }, m.name),
              meta ? el("div", { class: "meal-item-meta" }, meta) : null
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

    const footer = el("div", {},
      el("button", { class: "btn", on: { click: closeModal } }, "Close"),
      el("button", { class: "btn btn-primary", on: { click: () => {
        closeModal();
        openQuickAdd("snack", date);
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
    toast(`Logged ${name} · about ${meal.kcal} kcal`);
    renderMain();
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
      return el("div", {}, row, adjust);
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
        el("div", { style: "flex:1" }, el("label", { class: "label" }, "Category"), sectionS)
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
          renderMain();
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
        el("div", { style: "flex:1" }, el("label", { class: "label" }, "Default category"), sectionS)
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
          if (ex.type !== "cardio" && s.durationMin == null) {
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
            el("span", { class: "stats-hero-unit" }, "kg")
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
          r.isCardio
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
        if (rec.isCardio) {
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
                  rec.maxDistance ? `${rec.maxDistance} km` : null,
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
            rec.maxE1RM ? `e1RM ${rec.maxE1RM.toFixed(1)}kg` : null,
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
              el("span", { class: "stats-record-unit" }, rec.maxWeight > 0 ? "kg" : (rec.maxReps ? "reps" : ""))
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

    if (completed.length === 0) {
      view.appendChild(emptyState({
        title: "No workouts logged yet",
        body: "Finish a session and it will show up here with volume, sets and PRs.",
        primaryLabel: state.activeWorkout ? "Continue workout" : "Start workout",
        onPrimary: () => goTab("workout"),
        primaryTestId: "empty-history-start-workout"
      }));
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
          el("div", { class: "pr-item", on: { click: () => openExerciseDetail(p.ex.id) }, style: "cursor:pointer" },
            el("div", {},
              el("div", { class: "pr-name" }, p.ex.name),
              el("div", { class: "pr-date" }, `Best set: ${p.bestWeight}kg × ${p.bestReps} · top weight ${p.maxWeight}kg · best reps ${p.maxReps}`)
            ),
            el("div", { class: "pr-value" }, `${p.maxE1RM.toFixed(1)}kg`, el("span", { class: "text-xs text-faint" }, " e1RM"))
          )
        )
      ));
    }

    // Workout log
    const card = el("div", { class: "card" });
    card.appendChild(el("div", { class: "card-title" }, `Workout log (${completed.length})`));
    for (const w of completed) {
      const totalVol = (w.exercises || []).reduce((s, e) => s + U.volume(e.sets), 0);
      const totalSets = (w.exercises || []).reduce((s, e) => s + e.sets.length, 0);
      const burned = w.kcalBurned != null ? w.kcalBurned : workoutKcalTotal(w);
      const hasStrength = (w.exercises || []).some(e => e.type !== "cardio");
      const volBit = hasStrength && totalVol > 0 ? ` · ${totalVol.toLocaleString()}kg volume` : "";
      const burnBit = burned > 0 ? ` · ≈ ${burned} kcal` : "";
      card.appendChild(el("div", { class: "history-item", on: { click: () => openWorkoutDetail(w) } },
        el("div", { class: "history-item-date" }, U.formatDate(w.date, { year: "numeric" })),
        el("div", { class: "history-item-name" }, w.name || "Workout"),
        el("div", { class: "history-item-summary" },
          `${w.exercises.length} ${w.exercises.length === 1 ? "exercise" : "exercises"} · ${totalSets} ${totalSets === 1 ? "set" : "sets"}${volBit}${burnBit} · ${U.formatDuration(w.durationSec)}`)
      ));
    }
    view.appendChild(card);
  }

  function openWorkoutDetail(w) {
    const burned = w.kcalBurned != null ? w.kcalBurned : workoutKcalTotal(w);
    const body = el("div", {},
      el("div", { class: "text-sm text-muted mb-8" },
        `${U.formatDate(w.date, { year: "numeric", weekday: "long" })} · ${U.formatDuration(w.durationSec)}` +
        (burned > 0 ? ` · ≈ ${burned} kcal burned` : "")
      ),
      w.notes ? el("div", { class: "workout-notes-view" },
        el("div", { class: "label" }, "Session notes"),
        el("div", { class: "text-sm" }, w.notes)
      ) : null,
      ...(w.exercises || []).map(ex =>
        el("div", { class: "exercise-block", style: "margin-bottom: 12px" },
          el("div", { class: "exercise-block-header" }, el("div", { class: "exercise-block-title" },
            ex.name,
            ex.supersetGroup ? el("span", { class: "chip chip-sm", style: "margin-left:8px" }, "SS") : null,
            exerciseKcalTotal(ex) > 0 ? el("span", { class: "chip chip-sm", style: "margin-left:8px" }, `≈ ${exerciseKcalTotal(ex)} kcal`) : null)),
          el("div", { class: "exercise-block-body" },
            ...ex.sets.map((s, i) => {
              if (ex.type === "cardio" || s.durationMin != null) {
                const showDist = cardioTracksDistance(ex) && s.distanceKm != null;
                const cols = showDist ? "40px 1fr 1fr 1fr" : "40px 1fr 1fr";
                return el("div", { class: "set-row type-cardio", style: `grid-template-columns: ${cols}` },
                  el("div", { class: "set-index" }, String(i + 1)),
                  el("div", { class: "mono", style: "text-align:center" }, `${s.durationMin || 0} min`),
                  showDist ? el("div", { class: "mono", style: "text-align:center" }, `${s.distanceKm} km`) : null,
                  el("div", { class: "mono text-muted", style: "text-align:center" },
                    s.kcal ? `≈ ${s.kcal} kcal` : "—",
                    s.isPR ? el("span", { class: "pr-badge" }, "PR") : null,
                    s.note ? el("span", { class: "text-xs text-faint", style: "display:block" }, s.note) : null)
                );
              }
              const isBW = (ex.type === "bodyweight") || (!s.weight && s.reps);
              return el("div", { class: "set-row" + (s.drop ? " is-drop" : ""), style: "grid-template-columns: 40px 1fr 1fr 1fr 1fr" },
                el("div", { class: "set-index" }, String(i + 1) + (s.drop ? " • drop" : "")),
                el("div", { class: "mono", style: "text-align:center" }, isBW ? "BW" : `${s.weight}kg`),
                el("div", { class: "mono", style: "text-align:center" }, `${s.reps}`),
                el("div", { class: "mono text-muted", style: "text-align:center" },
                  s.weight && s.reps ? `e1RM ${U.epley(s.weight, s.reps).toFixed(1)}` : "—"),
                el("div", { class: "mono text-muted", style: "text-align:center" },
                  s.kcal ? `≈ ${s.kcal}` : "—",
                  s.isPR ? el("span", { class: "pr-badge" }, "PR") : null,
                  s.note ? el("span", { class: "text-xs text-faint", style: "display:block" }, s.note) : null)
              );
            })
          )
        )
      )
    );
    const footer = el("div", {},
      el("button", { class: "btn btn-danger", on: { click: async () => {
        if (!(await confirmDialog("Delete this workout permanently?", { title: "Delete workout?", okLabel: "Delete", danger: true }))) return;
        await Storage.deleteWorkout(w.id);
        closeModal();
        renderMain();
      } } }, "Delete"),
      el("button", { class: "btn", on: { click: closeModal } }, "Close")
    );
    openModal(w.name || "Workout", body, footer);
  }

  // ============ SETTINGS / EXPORT / IMPORT ============
  async function openSettings(opts = {}) {
    const weightKg = await getBodyweightKg();
    const restI = el("input", { class: "input input-num", type: "number", value: state.prefs.defaultRestSec });
    const weeklyGoalI = el("input", {
      class: "input input-num", type: "number", inputmode: "numeric",
      min: "1", max: "14", step: "1",
      value: state.prefs.weeklyWorkoutGoal || 4
    });

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
      value: state.prefs.age ?? ""
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

    const includeTrainingCb = el("input", {
      type: "checkbox",
      id: "include-training-food-room"
    });
    includeTrainingCb.checked = !!state.prefs.includeTrainingInFoodRoom;
    const includeTrainingHint = el("div", { class: "text-xs text-faint mt-8" },
      "Off by default. Workout burn estimates are rough; leaving this off usually matches the scale better. You still see the estimate on Home."
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

    const proteinPerKgS = el("select", { class: "select" });
    for (const opt of U.PROTEIN_PER_KG_OPTIONS) {
      proteinPerKgS.appendChild(el("option", { value: String(opt.value) }, `${opt.label} — ${opt.hint}`));
    }
    const curPpk = Number(state.prefs.proteinPerKg) || U.DEFAULT_PROTEIN_PER_KG;
    const ppkMatch = U.PROTEIN_PER_KG_OPTIONS.find(o => Math.abs(o.value - curPpk) < 0.05);
    proteinPerKgS.value = String(ppkMatch ? ppkMatch.value : U.DEFAULT_PROTEIN_PER_KG);

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
      const ppk = parseFloat(proteinPerKgS.value) || U.DEFAULT_PROTEIN_PER_KG;
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
        macroPreview.textContent =
          `From ${weightKg} kg bodyweight, protein at ${ppk} g/kg, fat ${fatPct}% of ${budget} food room, carbs fill the rest: ` +
          `P ${auto.protein}g · C ${auto.carbs}g · F ${auto.fat}g.`;
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
      const macrosDone = macroMode === "manual"
        ? !!(parseFloat(proteinGoalI.value) || parseFloat(carbsGoalI.value) || parseFloat(fatGoalI.value))
        : !!(proteinPerKgS.value && fatPctI.value);
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
            ? (macroMode === "manual" ? "Your gram targets" : `${proteinPerKgS.value} g/kg · fat ${fatPctI.value}%`)
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
          `daily movement +${movementExtra}`,
          `hold-weight ${calc.maintenance}`
        ];
        if (calc.goalAdj) detailBits.push(`${calc.goalLabel || "goal"} ${fmtAdj(calc.goalAdj)}`);
        if (calc.kcalOffset) detailBits.push(`personal tweak ${fmtAdj(calc.kcalOffset)}`);
        detailBits.push(`room ${calc.budget}`);
        const trainNote = includeTrainingCb.checked
          ? "Training burn will be added on Home when you log workouts."
          : "Training burn is shown on Home but not added to food room.";
        preview.textContent = detailBits.join(" · ") + ". " + trainNote;
      } else {
        heroSub.textContent = "Starter estimate until body details are complete";
        preview.textContent = "Add sex, age, height and how active a normal day is to unlock a suggested food room.";
        if (goalMode === "auto") {
          kcalI.disabled = false;
        }
      }

      // Macro line on hero
      const ppk = parseFloat(proteinPerKgS.value) || U.DEFAULT_PROTEIN_PER_KG;
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

    autoMacroFields.append(
      el("div", { class: "form-row" },
        el("div", { style: "flex:1" },
          el("label", { class: "label" }, "Protein target"),
          proteinPerKgS
        ),
        el("div", { style: "flex:1" },
          el("label", { class: "label" }, "Fat (% of kcal)"),
          fatPctI
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

    const body = el("div", { class: "settings-body" },
      // Hero — always first so setup feels outcome-led
      settingsHero,

      el("div", { class: "settings-section-title mt-16", "data-step": "1" }, "1 · Body"),
      el("div", { class: "text-xs text-faint", style: "margin: -4px 0 10px" },
        "Sex, age and height unlock a suggested food room. Weight uses your latest bodyweight entry on Home."),
      el("div", { class: "form-row" },
        el("div", { style: "flex:1" }, el("label", { class: "label" }, "Name (for the home greeting)"), nameI)
      ),
      el("div", { class: "form-row" },
        el("div", { style: "flex:1" }, el("label", { class: "label" }, "Sex"), sexS),
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
          activityS, activityHint)
      ),

      el("div", { class: "settings-section-title mt-16", "data-step": "3" }, "3 · Goal"),
      el("div", { class: "form-row" },
        el("div", { style: "flex:1" },
          el("label", { class: "label" }, "What are you aiming for?"),
          goalIntentS, goalIntentHint),
        el("div", { style: "flex:1" },
          el("label", { class: "label" }, "Personal tweak"),
          offsetI, offsetHint)
      ),
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
      el("div", { class: "form-row" },
        el("div", { style: "flex:1" }, el("label", { class: "label" }, "Default rest timer (seconds)"), restI),
        el("div", { style: "flex:1" }, el("label", { class: "label" }, "Weekly workout goal"), weeklyGoalI)
      ),

      el("div", { class: "form-row mt-16" }, el("div", { style: "flex:1" },
        el("label", { class: "label" }, "Backup & restore"),
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
            proteinPerKg: U.DEFAULT_PROTEIN_PER_KG,
            fatPercent: U.DEFAULT_FAT_PERCENT,
            proteinGoal: 0,
            carbsGoal: 0,
            fatGoal: 0,
            weeklyWorkoutGoal: 4,
            defaultRestSec: 90,
            backupReminder: true,
            lastBackupWorkoutCount: 0,
            lastBackupAt: null,
            backupSnoozedUntil: null,
            theme: null
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

        const proteinPerKg = parseFloat(proteinPerKgS.value) || U.DEFAULT_PROTEIN_PER_KG;
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

        state.prefs.sex = sex;
        state.prefs.age = age;
        state.prefs.heightCm = heightCm;
        state.prefs.activityLevel = activityLevel;
        state.prefs.goalIntent = goalIntent;
        state.prefs.kcalOffset = kcalOffset;
        state.prefs.kcalGoalMode = goalMode;
        state.prefs.kcalGoal = kcalGoal;
        state.prefs.macroGoalMode = macroMode;
        state.prefs.proteinPerKg = proteinPerKg;
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
        await Storage.setPref("proteinPerKg", proteinPerKg);
        await Storage.setPref("fatPercent", fatPercent);
        await Storage.setPref("proteinGoal", proteinGoal);
        await Storage.setPref("carbsGoal", carbsGoal);
        await Storage.setPref("fatGoal", fatGoal);
        await Storage.setPref("defaultRestSec", state.prefs.defaultRestSec);
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
    return el("div", { class: "card backup-cta-card" },
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
          rows.push([w.date, w.name || "", ex.name, i + 1, s.weight, s.reps, U.epley(s.weight, s.reps).toFixed(1), s.isPR ? "Y" : ""]);
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
      await loadPrefs();
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
  function confirmDialog(message, opts = {}) {
    return new Promise((resolve) => {
      closeModal();
      const okLabel = opts.okLabel || "Confirm";
      const cancelLabel = opts.cancelLabel || "Cancel";
      const danger = !!opts.danger;
      let settled = false;
      const done = (v) => { if (settled) return; settled = true; closeModal(); resolve(v); };

      const overlay = el("div", { class: "modal-overlay", id: "modal-overlay",
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
      closeModal();
      let settled = false;
      const done = () => { if (settled) return; settled = true; closeModal(); resolve(); };

      const overlay = el("div", { class: "modal-overlay", id: "modal-overlay",
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

  function openModal(title, body, footer) {
    closeModal();
    const overlay = el("div", { class: "modal-overlay", id: "modal-overlay", on: { click: (e) => { if (e.target === overlay) closeModal(); } } });
    const modal = el("div", { class: "modal" });
    modal.appendChild(el("div", { class: "modal-header" },
      el("div", { class: "modal-title" }, title),
      el("button", { class: "icon-btn", on: { click: closeModal }, html: icons.x })
    ));
    modal.appendChild(el("div", { class: "modal-body" }, body));
    if (footer) modal.appendChild(el("div", { class: "modal-footer" }, footer));
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }
  function closeModal() {
    const o = document.getElementById("modal-overlay");
    if (o) o.remove();
  }

  // ============ Toast ============
  let toastTimer = null;
  function toast(msg) {
    let t = document.getElementById("toast");
    if (!t) {
      t = el("div", { id: "toast", style: "position:fixed; top: 20px; left: 50%; transform: translateX(-50%); background: var(--text); color: var(--bg); padding: 10px 20px; border-radius: 100px; z-index: 200; font-size: 14px; box-shadow: var(--shadow-md); pointer-events: none; opacity: 0; transition: opacity 200ms ease;" });
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = "1";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.style.opacity = "0"; }, 2200);
  }

  // ============ Kickoff ============
  document.addEventListener("DOMContentLoaded", init);
})();
