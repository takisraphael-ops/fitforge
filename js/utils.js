// Shared utilities
window.U = {
  uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); },
  todayISO(date = new Date()) {
    const y = date.getFullYear(), m = String(date.getMonth() + 1).padStart(2, "0"), d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  },
  formatDate(iso, opts = {}) {
    if (!iso) return "";
    // Date-only ISO (YYYY-MM-DD) must be treated as local calendar day,
    // otherwise UTC midnight shifts the weekday in non-UTC timezones.
    let d;
    if (typeof iso === "string" && /^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      const [y, m, day] = iso.split("-").map(Number);
      d = new Date(y, m - 1, day);
    } else {
      d = new Date(iso);
    }
    if (Number.isNaN(d.getTime())) return String(iso);
    return d.toLocaleDateString("en-GB", { weekday: opts.weekday || "short", day: "numeric", month: "short", year: opts.year });
  },
  formatTime(seconds) {
    if (!seconds || seconds < 0) return "0:00";
    const m = Math.floor(seconds / 60), s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  },

  // ---- Meal categories & times (24h, en-GB) ----
  MEAL_SECTION_ORDER: [
    "breakfast", "lunch", "dinner", "snack",
    "pre_workout", "post_workout", "other"
  ],
  MEAL_SECTIONS: {
    breakfast: { key: "breakfast", label: "Breakfast", short: "B", alwaysShow: true, defaultTime: "08:00" },
    lunch: { key: "lunch", label: "Lunch", short: "L", alwaysShow: true, defaultTime: "13:00" },
    dinner: { key: "dinner", label: "Dinner", short: "D", alwaysShow: true, defaultTime: "19:00" },
    snack: { key: "snack", label: "Snacks", short: "S", alwaysShow: true, defaultTime: "15:30" },
    pre_workout: { key: "pre_workout", label: "Pre-workout", short: "Pre", alwaysShow: false, defaultTime: "16:30" },
    post_workout: { key: "post_workout", label: "Post-workout", short: "Post", alwaysShow: false, defaultTime: "18:00" },
    other: { key: "other", label: "Other", short: "O", alwaysShow: false, defaultTime: "12:00" }
  },

  normalizeMealSection(key) {
    if (key == null || key === "") return "snack";
    const k = String(key).toLowerCase().trim().replace(/[\s-]+/g, "_");
    if (U.MEAL_SECTIONS[k]) return k;
    // Legacy / free-text fallbacks
    if (k === "snacks") return "snack";
    if (k === "preworkout" || k === "pre") return "pre_workout";
    if (k === "postworkout" || k === "post") return "post_workout";
    return "snack";
  },

  mealSectionLabel(key) {
    return U.MEAL_SECTIONS[U.normalizeMealSection(key)]?.label || "Snack";
  },

  mealSectionShort(key) {
    return U.MEAL_SECTIONS[U.normalizeMealSection(key)]?.short || "?";
  },

  mealSectionAlwaysShow(key) {
    return !!U.MEAL_SECTIONS[U.normalizeMealSection(key)]?.alwaysShow;
  },

  /** Normalise to HH:mm (24h) or empty string if missing/invalid. */
  normalizeMealTime(value) {
    if (value == null || value === "") return "";
    const s = String(value).trim();
    const m = s.match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return "";
    const h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    if (!Number.isFinite(h) || !Number.isFinite(min) || h < 0 || h > 23 || min < 0 || min > 59) return "";
    return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  },

  nowMealTime(date = new Date()) {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  },

  defaultMealTimeForSection(section, dateIso) {
    if (dateIso && dateIso === U.todayISO()) return U.nowMealTime();
    return U.MEAL_SECTIONS[U.normalizeMealSection(section)]?.defaultTime || "12:00";
  },

  /** Rough category suggestion from clock time (optional UX helper). */
  suggestMealSectionFromTime(time) {
    const t = U.normalizeMealTime(time);
    if (!t) return "snack";
    const [h, min] = t.split(":").map(Number);
    const mins = h * 60 + min;
    if (mins >= 5 * 60 && mins < 10 * 60 + 30) return "breakfast";
    if (mins >= 11 * 60 && mins < 15 * 60) return "lunch";
    if (mins >= 17 * 60 && mins < 22 * 60) return "dinner";
    return "snack";
  },

  compareMealsByTime(a, b) {
    const ta = U.normalizeMealTime(a?.time);
    const tb = U.normalizeMealTime(b?.time);
    if (ta && tb && ta !== tb) return ta.localeCompare(tb);
    if (ta && !tb) return -1;
    if (!ta && tb) return 1;
    return (a?.savedAt || 0) - (b?.savedAt || 0);
  },

  emptyMealGroups() {
    const groups = {};
    for (const key of U.MEAL_SECTION_ORDER) groups[key] = [];
    return groups;
  },

  groupMealsBySection(meals) {
    const groups = U.emptyMealGroups();
    for (const m of meals || []) {
      const key = U.normalizeMealSection(m.section);
      groups[key].push(m);
    }
    for (const key of U.MEAL_SECTION_ORDER) {
      groups[key].sort(U.compareMealsByTime);
    }
    return groups;
  },

  mealSectionOptions() {
    return U.MEAL_SECTION_ORDER.map(key => ({
      value: key,
      label: U.MEAL_SECTIONS[key].label === "Snacks" ? "Snack" : U.MEAL_SECTIONS[key].label
    }));
  },
  formatDuration(seconds) {
    if (!seconds) return "—";
    const h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  },
  epley(weight, reps) {
    if (!weight || !reps) return 0;
    if (reps === 1) return weight;
    return weight * (1 + reps / 30);
  },
  volume(sets) {
    return sets.reduce((sum, s) => sum + ((s.weight || 0) * (s.reps || 0)), 0);
  },
  bestSet(sets) {
    let best = null;
    for (const s of sets) {
      if (!s.done || !s.weight || !s.reps) continue;
      const e = U.epley(s.weight, s.reps);
      if (!best || e > best.e1rm) best = { weight: s.weight, reps: s.reps, e1rm: e };
    }
    return best;
  },

  // ---- Calories (MET × bodyweight × hours) ----
  // Approximate MET values (Compendium of Physical Activities style).
  DEFAULT_BW_KG: 75,
  // Minutes of effort assumed per strength set (work + transition).
  STRENGTH_MIN_PER_SET: 2,
  MET_BY_CATEGORY: {
    chest: 5.0,
    back: 5.5,
    shoulders: 4.5,
    arms: 3.5,
    legs: 5.5,
    core: 3.8,
    cardio: 8.0,
    full_body: 6.5
  },
  // Intensity multipliers for cardio intervals.
  INTENSITY: {
    // Short labels so the mobile interval row does not truncate.
    easy: { label: "Easy", mult: 0.75 },
    moderate: { label: "Mod", mult: 1.0 },
    hard: { label: "Hard", mult: 1.25 },
    max: { label: "Max", mult: 1.5 }
  },
  baseMET(ex) {
    if (!ex) return 5;
    if (typeof ex.met === "number" && ex.met > 0) return ex.met;
    return U.MET_BY_CATEGORY[ex.category] || 5;
  },
  /** Effective MET after intensity (cardio) or base MET (strength). */
  getMET(ex, intensity = "moderate") {
    const base = U.baseMET(ex);
    if (ex?.category === "cardio" || ex?.type === "cardio") {
      const mult = U.INTENSITY[intensity]?.mult || 1;
      return +(base * mult).toFixed(2);
    }
    return base;
  },
  estimateKcal(met, bodyweightKg, durationMin) {
    if (!met || !durationMin || durationMin <= 0) return 0;
    const bw = bodyweightKg > 0 ? bodyweightKg : U.DEFAULT_BW_KG;
    return Math.max(0, Math.round(met * bw * (durationMin / 60)));
  },
  /** Approx kcal/min at a given bodyweight for library display. */
  kcalPerMin(ex, bodyweightKg, intensity = "moderate") {
    const met = U.getMET(ex, intensity);
    const bw = bodyweightKg > 0 ? bodyweightKg : U.DEFAULT_BW_KG;
    return Math.round((met * bw / 60) * 10) / 10;
  },
  /** Sum kcal across done sets (uses stored s.kcal when present). */
  setsKcal(sets) {
    return (sets || []).reduce((sum, s) => sum + (s.done ? (s.kcal || 0) : 0), 0);
  },
  intensityLabel(key) {
    return U.INTENSITY[key]?.label || key || "Moderate";
  },

  // ---- Meal macros (g) ----
  // Atwater factors: protein 4, carbs 4, fat 9 kcal/g.
  MACRO_KCAL: { protein: 4, carbs: 4, fat: 9 },

  parseMacro(value) {
    if (value === "" || value == null) return null;
    const n = typeof value === "number" ? value : parseFloat(String(value).replace(",", "."));
    if (!Number.isFinite(n) || n < 0) return null;
    // Keep one decimal for grams when needed; store integers cleanly.
    return Math.round(n * 10) / 10;
  },

  mealMacros(meal) {
    return {
      protein: Number(meal?.protein) > 0 ? Number(meal.protein) : 0,
      carbs: Number(meal?.carbs) > 0 ? Number(meal.carbs) : 0,
      fat: Number(meal?.fat) > 0 ? Number(meal.fat) : 0
    };
  },

  sumMacros(meals) {
    const out = { protein: 0, carbs: 0, fat: 0, kcal: 0, hasMacros: false };
    for (const m of meals || []) {
      const mac = U.mealMacros(m);
      out.protein += mac.protein;
      out.carbs += mac.carbs;
      out.fat += mac.fat;
      out.kcal += m.kcal || 0;
      if (mac.protein || mac.carbs || mac.fat) out.hasMacros = true;
    }
    out.protein = Math.round(out.protein * 10) / 10;
    out.carbs = Math.round(out.carbs * 10) / 10;
    out.fat = Math.round(out.fat * 10) / 10;
    return out;
  },

  /** Estimated kcal from macros (Atwater). */
  kcalFromMacros({ protein = 0, carbs = 0, fat = 0 } = {}) {
    const p = Number(protein) || 0;
    const c = Number(carbs) || 0;
    const f = Number(fat) || 0;
    return Math.round((p * U.MACRO_KCAL.protein) + (c * U.MACRO_KCAL.carbs) + (f * U.MACRO_KCAL.fat));
  },

  /** Share of macro energy for bar display (0–100 each). */
  macroEnergySplit({ protein = 0, carbs = 0, fat = 0 } = {}) {
    const pK = (Number(protein) || 0) * U.MACRO_KCAL.protein;
    const cK = (Number(carbs) || 0) * U.MACRO_KCAL.carbs;
    const fK = (Number(fat) || 0) * U.MACRO_KCAL.fat;
    const total = pK + cK + fK;
    if (total <= 0) return { protein: 0, carbs: 0, fat: 0, totalKcal: 0 };
    return {
      protein: Math.round((pK / total) * 100),
      carbs: Math.round((cK / total) * 100),
      fat: Math.round((fK / total) * 100),
      totalKcal: Math.round(total)
    };
  },

  formatMacroG(n) {
    if (n == null || n === 0) return "0g";
    const v = Math.round(Number(n) * 10) / 10;
    return Number.isInteger(v) ? `${v}g` : `${v}g`;
  },

  formatMacroLine(mealOrTotals) {
    const m = mealOrTotals?.protein != null || mealOrTotals?.carbs != null || mealOrTotals?.fat != null
      ? {
          protein: Number(mealOrTotals.protein) || 0,
          carbs: Number(mealOrTotals.carbs) || 0,
          fat: Number(mealOrTotals.fat) || 0
        }
      : U.mealMacros(mealOrTotals);
    if (!m.protein && !m.carbs && !m.fat) return "";
    return `P ${U.formatMacroG(m.protein)} · C ${U.formatMacroG(m.carbs)} · F ${U.formatMacroG(m.fat)}`;
  },

  // ---- Daily macro goals ----
  // Auto: protein from bodyweight (g/kg), fat as % of calorie budget, carbs fill remainder.
  DEFAULT_PROTEIN_PER_KG: 1.8,
  DEFAULT_FAT_PERCENT: 30,
  PROTEIN_PER_KG_OPTIONS: [
    { value: 1.6, label: "1.6 g/kg", hint: "General fitness" },
    { value: 1.8, label: "1.8 g/kg", hint: "Strength training (default)" },
    { value: 2.0, label: "2.0 g/kg", hint: "Higher protein" },
    { value: 2.2, label: "2.2 g/kg", hint: "Aggressive cut / recomp" }
  ],

  /**
   * Compute auto macro targets from weight + daily kcal budget.
   * proteinG = weightKg × proteinPerKg
   * fatG from fatPercent of budget
   * carbsG from remaining kcal
   */
  computeMacroGoals({
    weightKg,
    kcalBudget,
    proteinPerKg = U.DEFAULT_PROTEIN_PER_KG,
    fatPercent = U.DEFAULT_FAT_PERCENT
  } = {}) {
    const bw = Number(weightKg) > 0 ? Number(weightKg) : U.DEFAULT_BW_KG;
    const budget = Math.max(0, Math.round(Number(kcalBudget) || 0));
    const ppk = Number(proteinPerKg) > 0 ? Number(proteinPerKg) : U.DEFAULT_PROTEIN_PER_KG;
    let fatPct = Number(fatPercent);
    if (!Number.isFinite(fatPct) || fatPct < 15) fatPct = U.DEFAULT_FAT_PERCENT;
    if (fatPct > 45) fatPct = 45;

    let protein = Math.round(bw * ppk);
    let fat = budget > 0 ? Math.round((budget * (fatPct / 100)) / U.MACRO_KCAL.fat) : Math.round(bw * 0.8);
    // Floor fat so it's never absurdly low when budget is set
    if (budget > 0) fat = Math.max(20, fat);

    let proteinKcal = protein * U.MACRO_KCAL.protein;
    let fatKcal = fat * U.MACRO_KCAL.fat;

    // If P+F exceed budget, scale fat down first, then protein if needed.
    if (budget > 0 && proteinKcal + fatKcal > budget) {
      const roomForFat = Math.max(0, budget - proteinKcal);
      fat = Math.max(15, Math.floor(roomForFat / U.MACRO_KCAL.fat));
      fatKcal = fat * U.MACRO_KCAL.fat;
      if (proteinKcal + fatKcal > budget) {
        protein = Math.max(0, Math.floor(budget / U.MACRO_KCAL.protein));
        proteinKcal = protein * U.MACRO_KCAL.protein;
        fat = Math.max(0, Math.floor((budget - proteinKcal) / U.MACRO_KCAL.fat));
        fatKcal = fat * U.MACRO_KCAL.fat;
      }
    }

    const remaining = budget > 0 ? Math.max(0, budget - proteinKcal - fatKcal) : 0;
    const carbs = budget > 0 ? Math.round(remaining / U.MACRO_KCAL.carbs) : Math.round(bw * 3);

    return {
      complete: budget > 0 || bw > 0,
      weightKg: bw,
      kcalBudget: budget || null,
      proteinPerKg: ppk,
      fatPercent: fatPct,
      protein,
      carbs,
      fat,
      proteinKcal,
      carbsKcal: carbs * U.MACRO_KCAL.carbs,
      fatKcal: fat * U.MACRO_KCAL.fat
    };
  },

  // ---- Energy budget (Mifflin–St Jeor + lifestyle + training) ----
  // Activity multipliers are LIFESTYLE / NEAT only (not gym days).
  // Logged workout kcal is added once on top — avoids double-counting training.
  ACTIVITY_LEVELS: {
    sedentary: {
      key: "sedentary",
      label: "Mostly sitting",
      mult: 1.2,
      hint: "Desk / driving most of the day, little walking"
    },
    light: {
      key: "light",
      label: "Light daily movement",
      mult: 1.375,
      hint: "Desk job with regular walking (typical for gym-goers)"
    },
    moderate: {
      key: "moderate",
      label: "On your feet often",
      mult: 1.55,
      hint: "Standing / walking job, or very active daily life"
    },
    active: {
      key: "active",
      label: "Physically demanding job",
      mult: 1.725,
      hint: "Manual work most of the day"
    },
    very_active: {
      key: "very_active",
      label: "Heavy labour",
      mult: 1.9,
      hint: "Hard physical work all day"
    }
  },

  // Goal intent applies after lifestyle TDEE + workout burn (maintenance estimate).
  GOAL_INTENTS: {
    maintain: {
      key: "maintain",
      label: "Hold weight",
      percent: 0,
      hint: "Keep weight roughly steady"
    },
    cut: {
      key: "cut",
      label: "Lose weight",
      percent: -15,
      hint: "Gentle fat loss pace"
    },
    cut_hard: {
      key: "cut_hard",
      label: "Lose weight faster",
      percent: -20,
      hint: "Faster loss — harder to stick with"
    },
    bulk: {
      key: "bulk",
      label: "Gain weight",
      percent: 10,
      hint: "Steady surplus for muscle gain"
    },
    bulk_hard: {
      key: "bulk_hard",
      label: "Gain weight faster",
      percent: 15,
      hint: "Larger surplus"
    }
  },

  DEFAULT_GOAL_INTENT: "maintain",
  DEFAULT_KCAL_OFFSET: 0,
  KCAL_OFFSET_MIN: -800,
  KCAL_OFFSET_MAX: 800,
  // Floor so auto budgets never collapse to unsafe lows after cut + offset.
  MIN_AUTO_BUDGET_KCAL: 1200,

  profileComplete(prefs) {
    if (!prefs) return false;
    const sex = prefs.sex;
    const age = Number(prefs.age);
    const heightCm = Number(prefs.heightCm);
    const activity = prefs.activityLevel;
    return (sex === "male" || sex === "female") &&
      Number.isFinite(age) && age >= 13 && age <= 100 &&
      Number.isFinite(heightCm) && heightCm >= 100 && heightCm <= 250 &&
      !!U.ACTIVITY_LEVELS[activity];
  },

  normalizeGoalIntent(key) {
    return U.GOAL_INTENTS[key] ? key : U.DEFAULT_GOAL_INTENT;
  },

  normalizeKcalOffset(value) {
    const n = Math.round(Number(value));
    if (!Number.isFinite(n)) return U.DEFAULT_KCAL_OFFSET;
    return Math.max(U.KCAL_OFFSET_MIN, Math.min(U.KCAL_OFFSET_MAX, n));
  },

  /**
   * Mifflin–St Jeor BMR (kcal/day).
   * Male: 10w + 6.25h − 5a + 5
   * Female: 10w + 6.25h − 5a − 161
   */
  bmrMifflin({ sex, weightKg, heightCm, age }) {
    const w = Number(weightKg);
    const h = Number(heightCm);
    const a = Number(age);
    if (!Number.isFinite(w) || w <= 0 || !Number.isFinite(h) || h <= 0 || !Number.isFinite(a) || a <= 0) {
      return null;
    }
    const base = (10 * w) + (6.25 * h) - (5 * a);
    if (sex === "male") return Math.round(base + 5);
    if (sex === "female") return Math.round(base - 161);
    return null;
  },

  /** Lifestyle TDEE only (BMR × NEAT multiplier). Does not include gym training. */
  tdeeFromBmr(bmr, activityLevel) {
    if (!bmr) return null;
    const mult = U.ACTIVITY_LEVELS[activityLevel]?.mult || 1.2;
    return Math.round(bmr * mult);
  },

  /**
   * Hybrid energy budget (no double-counted training).
   * maintenance = lifestyle TDEE + logged workout kcal
   * budget = maintenance × (1 + goal%) + calibration offset
   */
  computeEnergyBudget({
    sex,
    age,
    heightCm,
    activityLevel,
    weightKg,
    workoutKcal = 0,
    goalIntent = U.DEFAULT_GOAL_INTENT,
    kcalOffset = 0
  }) {
    const bw = Number(weightKg) > 0 ? Number(weightKg) : U.DEFAULT_BW_KG;
    const intentKey = U.normalizeGoalIntent(goalIntent);
    const intent = U.GOAL_INTENTS[intentKey];
    const offset = U.normalizeKcalOffset(kcalOffset);
    const bmr = U.bmrMifflin({ sex, weightKg: bw, heightCm, age });
    const tdee = U.tdeeFromBmr(bmr, activityLevel);
    const wk = Math.max(0, Math.round(workoutKcal || 0));

    if (bmr == null || tdee == null) {
      return {
        complete: false,
        weightKg: bw,
        bmr: null,
        tdee: null,
        workoutKcal: wk,
        maintenance: null,
        goalIntent: intentKey,
        goalLabel: intent.label,
        goalPercent: intent.percent,
        goalAdj: 0,
        kcalOffset: offset,
        budget: null,
        activityLevel: activityLevel || null,
        activityLabel: U.ACTIVITY_LEVELS[activityLevel]?.label || null
      };
    }

    const maintenance = tdee + wk;
    const goalAdj = Math.round(maintenance * (intent.percent / 100));
    const rawBudget = maintenance + goalAdj + offset;
    const budget = Math.max(U.MIN_AUTO_BUDGET_KCAL, Math.round(rawBudget));

    return {
      complete: true,
      weightKg: bw,
      bmr,
      tdee,
      workoutKcal: wk,
      maintenance,
      goalIntent: intentKey,
      goalLabel: intent.label,
      goalPercent: intent.percent,
      goalAdj,
      kcalOffset: offset,
      budget,
      activityLevel,
      activityLabel: U.ACTIVITY_LEVELS[activityLevel]?.label || activityLevel
    };
  },

  el(tag, attrs = {}, ...children) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") e.className = v;
      else if (k === "on" && typeof v === "object") {
        for (const [ev, fn] of Object.entries(v)) e.addEventListener(ev, fn);
      } else if (k === "html") e.innerHTML = v;
      else if (k.startsWith("data-")) e.setAttribute(k, v);
      else if (v !== null && v !== undefined && v !== false) e.setAttribute(k, v);
    }
    for (const c of children.flat()) {
      if (c == null || c === false) continue;
      e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return e;
  },
  clear(node) { while (node.firstChild) node.removeChild(node.firstChild); },
  debounce(fn, ms = 200) {
    let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  },
  daysBetween(a, b) {
    const A = new Date(a), B = new Date(b);
    return Math.round((B - A) / (1000 * 60 * 60 * 24));
  }
};
