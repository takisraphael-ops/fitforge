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

  // ---- Units -----------------------------------------------------------
  //
  // Everything on disk is metric, always: kilograms, centimetres, kilometres.
  // Imperial exists only at the edges — what a number looks like on screen and
  // what a typed number means on the way in. Nothing else in the app knows
  // which system is on, which is the point: a backup written on one setting
  // restores correctly on the other, and no arithmetic anywhere has to care.
  //
  // The one thing to be careful of is round-tripping. 100 kg shown as 220.5 lb
  // and typed straight back must not drift to 100.02 kg, so display rounds to
  // one decimal and the inverse conversion is applied to that rounded figure.
  LB_PER_KG: 2.2046226218,
  MI_PER_KM: 0.6213711922,
  DEFAULT_UNITS: "metric",

  _units: "metric",
  setUnits(system) { U._units = system === "imperial" ? "imperial" : "metric"; },
  units() { return U._units; },
  isImperial() { return U._units === "imperial"; },

  weightUnit() { return U.isImperial() ? "lb" : "kg"; },
  distanceUnit() { return U.isImperial() ? "mi" : "km"; },

  /** Smallest sensible nudge on a weight input: plates come in 2.5 kg or 5 lb. */
  weightStep() { return U.isImperial() ? 5 : 2.5; },
  /** Upper bound for weight wheels, in display units. */
  weightWheelMax() { return U.isImperial() ? 900 : 400; },

  /** Stored kilograms to the number shown on screen. */
  toDisplayWeight(kg) {
    if (kg == null || kg === "") return kg;
    const n = Number(kg);
    if (!Number.isFinite(n)) return null;
    return U.isImperial() ? Math.round(n * U.LB_PER_KG * 10) / 10 : Math.round(n * 100) / 100;
  },

  /** A number the user typed or spun, back to stored kilograms. */
  fromDisplayWeight(value) {
    if (value == null || value === "") return null;
    const n = typeof value === "number" ? value : parseFloat(String(value).replace(",", "."));
    if (!Number.isFinite(n)) return null;
    return U.isImperial() ? Math.round((n / U.LB_PER_KG) * 10000) / 10000 : n;
  },

  /** Trim a display number: 80 not 80.0, 82.5 kept. */
  trimNum(n) {
    if (n == null || !Number.isFinite(Number(n))) return "—";
    const v = Math.round(Number(n) * 100) / 100;
    return String(v);
  },

  /** "80 kg" / "176.4 lb". `space:false` gives "80kg" for tight rows. */
  formatWeight(kg, opts = {}) {
    const v = U.toDisplayWeight(kg);
    if (v == null) return "—";
    const num = opts.round ? String(Math.round(v)) : U.trimNum(v);
    return `${num}${opts.space === false ? "" : " "}${U.weightUnit()}`;
  },

  /** Volume totals — big numbers, never fractional. */
  formatVolume(kg) {
    const v = U.toDisplayWeight(kg);
    if (v == null) return "—";
    return `${Math.round(v).toLocaleString("en-GB")} ${U.weightUnit()}`;
  },

  toDisplayDistance(km) {
    if (km == null || km === "") return km;
    const n = Number(km);
    if (!Number.isFinite(n)) return null;
    return Math.round((U.isImperial() ? n * U.MI_PER_KM : n) * 100) / 100;
  },
  fromDisplayDistance(value) {
    if (value == null || value === "") return null;
    const n = typeof value === "number" ? value : parseFloat(String(value).replace(",", "."));
    if (!Number.isFinite(n)) return null;
    return U.isImperial() ? Math.round((n / U.MI_PER_KM) * 10000) / 10000 : n;
  },
  formatDistance(km) {
    const v = U.toDisplayDistance(km);
    return v == null ? "—" : `${U.trimNum(v)} ${U.distanceUnit()}`;
  },

  /** Height is the odd one: imperial wants feet and inches, not a decimal. */
  cmToFtIn(cm) {
    const total = Math.round(Number(cm) / 2.54);
    return { ft: Math.floor(total / 12), in: total % 12 };
  },
  ftInToCm(ft, inch) {
    return Math.round(((Number(ft) || 0) * 12 + (Number(inch) || 0)) * 2.54);
  },
  formatHeight(cm) {
    if (!cm) return "—";
    if (!U.isImperial()) return `${Math.round(cm)} cm`;
    const { ft, in: i } = U.cmToFtIn(cm);
    return `${ft}′ ${i}″`;
  },

  /** Barbell weights offered by the plate calculator, in kilograms. The
      imperial set is the real-world one (45 lb bar), not a converted 20 kg. */
  barOptions() {
    return U.isImperial()
      ? [{ kg: 20.4117, label: "45 lb (Olympic)" }, { kg: 15.8757, label: "35 lb (Women's)" },
         { kg: 11.3398, label: "25 lb (Training bar)" }, { kg: 6.8039, label: "15 lb (EZ / short bar)" }]
      : [{ kg: 20, label: "20 kg (Olympic)" }, { kg: 15, label: "15 kg (Women's Olympic)" },
         { kg: 10, label: "10 kg (Training bar)" }, { kg: 7, label: "7 kg (EZ / short bar)" }];
  },

  /** Plate denominations actually found on a rack, in kilograms. */
  plateSet() {
    return U.isImperial()
      ? [20.4117, 15.8757, 11.3398, 4.5359, 2.2680, 1.1340]   // 45/35/25/10/5/2.5 lb
      : [25, 20, 15, 10, 5, 2.5, 1.25];
  },
  // Past this many reps a one-rep-max estimate stops being an estimate.
  //
  // Epley holds to about 3% up to ten reps and is still usable at twelve. Past
  // that it climbs away from reality: at twenty reps it claims you could lift
  // 1.67x the bar you just did twenty with, which is true of almost nobody —
  // high-rep capacity is largely a different quality from maximal strength, and
  // no rep-max formula can convert between them. Brzycki and Lombardi disagree
  // with Epley and with each other by more than 15% out there, which is itself
  // the tell: the model has run out.
  //
  // So the app stops rather than rounding a fiction to one decimal place. This
  // is the same rule the progression gates live by — a number the app cannot
  // stand behind does not get shown.
  E1RM_MAX_REPS: 12,
  epley(weight, reps) {
    if (!weight || !reps) return 0;
    if (reps === 1) return weight;
    if (reps > U.E1RM_MAX_REPS) return 0;
    return weight * (1 + reps / 30);
  },
  /** The e1RM as display text, or null when the set cannot honestly give one.
   *  One place, so the four screens that print it cannot drift apart on when
   *  to print nothing. */
  e1rmLabel(weight, reps) {
    const e = U.epley(weight, reps);
    return e > 0 ? e.toFixed(1) : null;
  },
  // Both tolerate a missing list. They are called on whatever is in storage,
  // and an exercise entry saved without a `sets` array — an older format, a
  // hand-edited backup — took the History tab blank rather than skipping one
  // row. Guarding here covers every call site at once.
  // ---- Warm-ups ------------------------------------------------------------
  // A warm-up is preparation, not training. It stays in the session log and
  // counts toward nothing: not tonnage, not the muscle map, not sets per week,
  // not a PR, not an e1RM, not a progression gate.
  //
  // The rule lives here rather than at each call site because it is needed in
  // app.js, body-map.js and progression.js, and three copies of a one-line
  // predicate is how the three drift apart.
  isWarmup(s) { return !!(s && s.warmup); },

  /** The sets that count as work: ticked off, and not a warm-up. */
  workingSets(sets) {
    return (sets || []).filter(s => s && s.done && !s.warmup);
  },

  volume(sets) {
    return (sets || []).reduce(
      (sum, s) => sum + (U.isWarmup(s) ? 0 : (s.weight || 0) * (s.reps || 0)), 0);
  },
  bestSet(sets) {
    let best = null;
    for (const s of (sets || [])) {
      // A warm-up must never become the best set: it would set the e1RM that
      // drives the strength tier off a weight you lifted to get ready.
      if (!s.done || s.warmup || !s.weight || !s.reps) continue;
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
    boxing: 7.0,
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
  /** METs above resting — what the activity actually costs you.
   *
   *  A MET is a multiple of resting metabolism, so a 5-MET exercise burns five
   *  times resting, of which one times resting was going to be spent anyway:
   *  lying on the sofa for that hour is not free. The energy the training added
   *  is the other four. Every figure here used to be gross, which overstated
   *  lifting by about a quarter and stretching — MET 2.0 to 3.5 across the
   *  thirty mobility exercises — by roughly three quarters.
   *
   *  It matters twice over, because the budget adds workout kcal on top of a
   *  lifestyle TDEE that already contains a full day of resting metabolism.
   *  Gross numbers charged that hour's resting burn to both sides. */
  netMET(met) {
    return Math.max(0, (Number(met) || 0) - 1);
  },
  estimateKcal(met, bodyweightKg, durationMin) {
    if (!met || !durationMin || durationMin <= 0) return 0;
    const bw = bodyweightKg > 0 ? bodyweightKg : U.DEFAULT_BW_KG;
    return Math.max(0, Math.round(U.netMET(met) * bw * (durationMin / 60)));
  },
  /** Approx kcal/min at a given bodyweight for library display. */
  kcalPerMin(ex, bodyweightKg, intensity = "moderate") {
    const met = U.getMET(ex, intensity);
    const bw = bodyweightKg > 0 ? bodyweightKg : U.DEFAULT_BW_KG;
    return Math.round((U.netMET(met) * bw / 60) * 10) / 10;
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
  // The least fat a target may ask for, per kg of bodyweight. Below roughly
  // half a gram per kilo is where hormone production and the absorption of the
  // fat-soluble vitamins start to suffer, so 0.6 sits just clear of it rather
  // than on it. Per kg because that is the shape of the requirement — a flat
  // gram figure is generous for a small person and meaningless for a large one.
  MIN_FAT_PER_KG: 0.6,

  // ---- Training volume ---------------------------------------------------
  //
  // Hard sets per muscle per week is the best-evidenced dose for growth, and
  // the range where the dose-response work sits is roughly ten to twenty. Below
  // ten the gains are real but smaller; past twenty the evidence thins and
  // recovery starts to be the limit rather than the stimulus.
  //
  // The map has always counted sets. What it could not do was tell you whether
  // a number was any good, because it normalised everything to your own
  // busiest muscle — so three sets of chest and nothing else lit up chest at
  // full heat. "Most trained" is not the same question as "enough", and only
  // one of them has an answer outside your own history.
  //
  // Stated as a range and never as a target. It is what the evidence covers,
  // not what this user said they wanted: the app has no strength/hypertrophy/
  // endurance axis to read an intent off, and someone training for a sport or
  // for health is not failing by sitting under ten.
  SETS_PER_WEEK_MIN: 10,
  SETS_PER_WEEK_MAX: 20,

  /** Sets in a window, as a weekly rate. Fractional because a bench press is
   *  a whole set for the chest and a fraction of one for the triceps. */
  setsPerWeek(setsInWindow, windowDays) {
    const d = Number(windowDays);
    if (!Number.isFinite(d) || d <= 0) return 0;
    return Math.round(((Number(setsInWindow) || 0) / d) * 7 * 10) / 10;
  },

  /** Where a weekly figure sits against the evidenced range. */
  setsBand(perWeek) {
    const n = Number(perWeek) || 0;
    if (n <= 0) return "none";
    if (n < U.SETS_PER_WEEK_MIN) return "under";
    if (n <= U.SETS_PER_WEEK_MAX) return "in";
    return "over";
  },
  PROTEIN_PER_KG_OPTIONS: [
    { value: 1.6, label: "1.6 g/kg", hint: "Enough to build on" },
    { value: 1.8, label: "1.8 g/kg", hint: "Comfortable middle" },
    { value: 2.0, label: "2.0 g/kg", hint: "Protects muscle in a deficit" },
    { value: 2.2, label: "2.2 g/kg", hint: "Steep deficit, or very lean" }
  ],

  /** How much protein each goal asks for, in grams per kg of bodyweight.
   *
   *  Protein is the one macro whose requirement genuinely moves with the goal,
   *  and it moves the opposite way to intuition: you need MORE of it when
   *  eating less, not when eating more. In a deficit the body is willing to
   *  break down muscle for energy, and a high protein intake is most of what
   *  stops it — the steeper the cut and the leaner you already are, the more
   *  it matters. In a surplus, energy is plentiful, nothing is under threat,
   *  and the requirement falls back to what it takes to build: Morton's 2018
   *  meta-analysis put that plateau around 1.6 g/kg, with the confidence
   *  interval reaching 2.2.
   *
   *  The app knew all of this already — the 2.2 option was labelled for
   *  cutting — and then made the user apply it by hand.
   *
   *  Total bodyweight, not lean mass, which over-prescribes for anyone
   *  carrying a lot of fat. Lean mass is the better denominator and the app
   *  cannot see it: body fat is not measured, and asking for a number people
   *  guess at would make the target look precise while making it worse. */
  PROTEIN_PER_KG_BY_GOAL: {
    cut_hard: 2.2,
    cut: 2.0,
    maintain: 1.8,
    bulk: 1.6,
    bulk_hard: 1.6
  },

  /** The g/kg a goal implies. Falls back to the plain default for an unknown
   *  or missing goal, which is also exactly the `maintain` figure. */
  proteinPerKgForGoal(goalIntent) {
    return U.PROTEIN_PER_KG_BY_GOAL[U.normalizeGoalIntent(goalIntent)] || U.DEFAULT_PROTEIN_PER_KG;
  },

  /** What protein target to actually use.
   *
   *  A stored number is a choice the user made on the settings screen and
   *  outranks the goal — changing goal must not silently overwrite it. Absent
   *  means they never touched it, so the goal decides. There is no third
   *  "mode" pref for this because absence already carries the meaning, and a
   *  mode flag would need migrating for everyone who has ever opened the
   *  screen. */
  resolveProteinPerKg(storedPerKg, goalIntent) {
    const n = Number(storedPerKg);
    if (Number.isFinite(n) && n > 0) return { perKg: n, fromGoal: false };
    return { perKg: U.proteinPerKgForGoal(goalIntent), fromGoal: true };
  },

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

    // The fat floor scales with the body it belongs to. It used to be a flat
    // 20g, dropping to a flat 15g under pressure, and both are the wrong shape:
    // fat requirement tracks bodyweight, so one number is simultaneously
    // generous for a small person and meaningless for a large one. 20g is
    // 0.4 g/kg at 50kg and 0.17 g/kg at 120kg.
    const fatFloor = Math.round(bw * U.MIN_FAT_PER_KG);

    let protein = Math.round(bw * ppk);
    let fat = budget > 0
      ? Math.max(fatFloor, Math.round((budget * (fatPct / 100)) / U.MACRO_KCAL.fat))
      // No budget to take a percentage of, so straight from bodyweight. This
      // branch was always per-kg; the floors below simply never caught up.
      : Math.round(bw * 0.8);

    // Protein and fat together can outgrow a small budget, and something has
    // to give. The old order gave up fat first and could take it to ZERO: at
    // 120kg on 2.2 g/kg with a 1000 kcal budget it returned 250g protein, no
    // fat and no carbs, and presented that as the day's target.
    //
    // Fat above the floor is discretionary and goes first. The floor itself is
    // not — below roughly half a gram per kilo you are into hormone production
    // and fat-soluble vitamin absorption — so past that point it is protein
    // that yields, being the macro with headroom: the target sits well above
    // the ~1.6 g/kg where the benefit for building plateaus.
    let squeezed = false, belowFatFloor = false;
    if (budget > 0 && protein * U.MACRO_KCAL.protein + fat * U.MACRO_KCAL.fat > budget) {
      squeezed = true;
      const roomForFat = budget - protein * U.MACRO_KCAL.protein;
      fat = Math.max(fatFloor, Math.floor(roomForFat / U.MACRO_KCAL.fat));
      if (protein * U.MACRO_KCAL.protein + fat * U.MACRO_KCAL.fat > budget) {
        fat = fatFloor;
        protein = Math.max(0, Math.floor((budget - fat * U.MACRO_KCAL.fat) / U.MACRO_KCAL.protein));
      }
    }
    // A budget too small to hold essential fat at all. Reported rather than
    // resolved: the honest answer is that the budget is wrong, and quietly
    // shaving the floor to make the sum balance would hide exactly that.
    if (budget > 0 && fat * U.MACRO_KCAL.fat > budget) belowFatFloor = true;

    let proteinKcal = protein * U.MACRO_KCAL.protein;
    let fatKcal = fat * U.MACRO_KCAL.fat;

    const remaining = budget > 0 ? Math.max(0, budget - proteinKcal - fatKcal) : 0;
    // Floor, not round. Carbs are the remainder, so rounding them up let the
    // three targets add up to a couple of calories MORE than the food room
    // they were divided out of — small, but it is the one arithmetic on this
    // screen a user can check by hand.
    const carbs = budget > 0 ? Math.floor(remaining / U.MACRO_KCAL.carbs) : Math.round(bw * 3);

    return {
      complete: budget > 0 || bw > 0,
      weightKg: bw,
      kcalBudget: budget || null,
      proteinPerKg: ppk,
      fatPercent: fatPct,
      fatFloorG: fatFloor,
      // True when the budget could not hold the requested protein and fat, so
      // one of them was cut back to fit.
      squeezed,
      // True when it could not even hold essential fat. The macros returned
      // then add up to more than the budget, on purpose.
      belowFatFloor,
      protein,
      carbs,
      fat,
      proteinKcal,
      carbsKcal: carbs * U.MACRO_KCAL.carbs,
      fatKcal: fat * U.MACRO_KCAL.fat
    };
  },

  // ---- Energy budget (Mifflin–St Jeor × activity) ----
  //
  // THESE BANDS INCLUDE TRAINING. 1.2 / 1.375 / 1.55 / 1.725 / 1.9 is the
  // standard PAL ladder, and every one of those numbers was calibrated against
  // a definition that names exercise: 1.55 is "moderate exercise 3–5 days a
  // week", not "a standing job". The multiplier cannot be separated from that
  // because it was never measured separately.
  //
  // This used to claim the opposite. The comment here said LIFESTYLE / NEAT
  // ONLY, and the quiz told people in as many words to answer "outside the gym
  // — gym sessions are tracked separately", while handing them a ladder that
  // assumes the gym. Someone with a desk job who trains four times a week was
  // steered to 1.2, which is the figure for a person who does not train at all:
  // 2136 kcal against the 2759 the band they should have picked describes. Six
  // hundred calories a day, on the app's most ordinary user.
  //
  // The two screens did not even agree with each other. The hint on 1.375 said
  // "typical for gym-goers" — the exercise-inclusive reading — so the number
  // you ended up with depended on whether you set it during onboarding or in
  // settings, 312 kcal apart.
  //
  // The numbers are the standard ladder and stay. Re-deriving a genuinely
  // exercise-free ladder would mean inventing multipliers: the published bands
  // do not come in that form, and a made-up number that matched the label would
  // be worse than a real one that needed explaining.
  //
  // It is a weekly average, so a rest day is covered by the same figure as a
  // training day. That is what a PAL is and it is why the measured maintenance
  // on the settings screen beats it whenever there is enough logged to compute.
  ACTIVITY_LEVELS: {
    sedentary: {
      key: "sedentary",
      label: "Sitting, no training",
      mult: 1.2,
      hint: "Desk or driving most of the day, and little or no exercise"
    },
    light: {
      key: "light",
      label: "Lightly active",
      mult: 1.375,
      hint: "Some walking in the day, or training 1–3 days a week"
    },
    moderate: {
      key: "moderate",
      label: "Moderately active",
      mult: 1.55,
      hint: "On your feet often, or training 3–5 days a week"
    },
    active: {
      key: "active",
      label: "Very active",
      mult: 1.725,
      hint: "Physical job, or training hard 6–7 days a week"
    },
    very_active: {
      key: "very_active",
      label: "Extremely active",
      mult: 1.9,
      hint: "Hard physical work and training on top of it"
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

  // ---- Measured maintenance ---------------------------------------------
  //
  // Mifflin-St Jeor predicts. The logs measure. Over a long enough window the
  // arithmetic is simply conservation of energy:
  //
  //     maintenance = average intake - (weight change x kcal per kg) / days
  //
  // Lose a kilo in a fortnight while eating 2000 and you were eating about
  // 550 under; that puts real maintenance near 2550 whatever the equation
  // said. This is worth having because the equation is wrong for a lot of
  // people in ways it cannot know about — it cannot see body composition, it
  // cannot see how much you fidget, and during a sustained deficit measured
  // expenditure drifts below predicted as the body economises.
  //
  // THE DANGER IS THAT IT LOOKS MORE CERTAIN THAN IT IS. Both inputs are
  // noisy in ways that do not average out over a short window:
  //
  //   * Bodyweight swings a kilo or more on water, glycogen, salt, gut
  //     contents and the menstrual cycle. At 7700 kcal to the kilo, one kilo
  //     of water misread as fat over 14 days is 550 kcal/day of pure error —
  //     bigger than the effect being measured.
  //   * Food logging is under-reported far more often than over-reported,
  //     and a window with half its days missing is not an average, it is a
  //     guess wearing one.
  //
  // Which is why the gates below are strict and the function returns reasons
  // rather than a number when they are not met. A confident figure from four
  // days of logging would be worse than no figure at all: it would be acted
  // on. The gates are the whole feature.
  KCAL_PER_KG_BODYWEIGHT: 7700,   // energy density of the tissue gained or lost
  RECAL_WINDOW_DAYS: 28,          // how far back to look at all
  RECAL_MIN_SPAN_DAYS: 14,        // shorter than this and water noise dominates
  RECAL_END_BUCKET_DAYS: 7,       // weigh-ins averaged at each end, not endpoints
  RECAL_MIN_BUCKET_WEIGH_INS: 2,  // per end, or there is nothing to average
  RECAL_MIN_WEIGH_INS: 5,
  RECAL_MIN_COVERAGE: 0.8,        // share of days in the span that need food logged

  /** Maintenance as the logs measure it, or the reasons it cannot be said.
   *
   *  weighIns    [{ date: "YYYY-MM-DD", kg }]  (any order)
   *  intakeByDate { "YYYY-MM-DD": kcal }       (days with no food logged omitted)
   *
   *  Endpoints are averaged over a week at each end rather than taken as
   *  single readings, which is what makes the difference between a usable
   *  number and a coin flip: one bloated morning at either end otherwise
   *  moves the answer by hundreds of calories. */
  estimateMaintenance({ weighIns = [], intakeByDate = {}, today = U.todayISO() } = {}) {
    const reasons = [];
    const back = (n) => {
      const d = new Date(today + "T00:00:00");
      d.setDate(d.getDate() - n);
      return U.todayISO(d);
    };
    const from = back(U.RECAL_WINDOW_DAYS - 1);
    const daysBetween = (a, b) =>
      Math.round((new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 86400000);

    const ws = (weighIns || [])
      .filter((w) => w && w.date >= from && w.date <= today && Number(w.kg) > 0)
      .map((w) => ({ date: w.date, kg: Number(w.kg) }))
      .sort((a, b) => a.date.localeCompare(b.date));

    if (ws.length < U.RECAL_MIN_WEIGH_INS) {
      reasons.push({
        code: "weigh-ins",
        need: U.RECAL_MIN_WEIGH_INS, have: ws.length,
        text: `${U.RECAL_MIN_WEIGH_INS} weigh-ins in the last ${U.RECAL_WINDOW_DAYS} days (you have ${ws.length})`
      });
    }
    const spanDays = ws.length >= 2 ? daysBetween(ws[0].date, ws[ws.length - 1].date) : 0;
    if (spanDays < U.RECAL_MIN_SPAN_DAYS) {
      reasons.push({
        code: "span",
        need: U.RECAL_MIN_SPAN_DAYS, have: spanDays,
        text: `weigh-ins spanning ${U.RECAL_MIN_SPAN_DAYS} days (yours span ${spanDays})`
      });
    }
    if (reasons.length) return { ok: false, reasons, spanDays, weighIns: ws.length };

    const firstEnd = U.todayISO(new Date(new Date(ws[0].date + "T00:00:00")
      .setDate(new Date(ws[0].date + "T00:00:00").getDate() + U.RECAL_END_BUCKET_DAYS - 1)));
    const lastStart = U.todayISO(new Date(new Date(ws[ws.length - 1].date + "T00:00:00")
      .setDate(new Date(ws[ws.length - 1].date + "T00:00:00").getDate() - U.RECAL_END_BUCKET_DAYS + 1)));
    const startBucket = ws.filter((w) => w.date <= firstEnd);
    const endBucket = ws.filter((w) => w.date >= lastStart);
    if (startBucket.length < U.RECAL_MIN_BUCKET_WEIGH_INS || endBucket.length < U.RECAL_MIN_BUCKET_WEIGH_INS) {
      return {
        ok: false, spanDays, weighIns: ws.length,
        reasons: [{
          code: "clustered",
          text: `at least ${U.RECAL_MIN_BUCKET_WEIGH_INS} weigh-ins near the start and ${U.RECAL_MIN_BUCKET_WEIGH_INS} near the end ` +
                `(you have ${startBucket.length} and ${endBucket.length})`
        }]
      };
    }
    const mean = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;
    const startKg = mean(startBucket.map((w) => w.kg));
    const endKg = mean(endBucket.map((w) => w.kg));
    // Midpoints of the two buckets, so the elapsed time matches the weights
    // being compared rather than the outermost readings.
    const midDate = (bucket) => bucket[Math.floor(bucket.length / 2)].date;
    const elapsed = Math.max(1, daysBetween(midDate(startBucket), midDate(endBucket)));

    const logged = [];
    for (let i = 0; i <= daysBetween(ws[0].date, ws[ws.length - 1].date); i++) {
      const d = U.todayISO(new Date(new Date(ws[0].date + "T00:00:00")
        .setDate(new Date(ws[0].date + "T00:00:00").getDate() + i)));
      const k = Number(intakeByDate[d]);
      if (Number.isFinite(k) && k > 0) logged.push(k);
    }
    const coverage = spanDays > 0 ? logged.length / (spanDays + 1) : 0;
    if (coverage < U.RECAL_MIN_COVERAGE) {
      return {
        ok: false, spanDays, weighIns: ws.length, coverage,
        reasons: [{
          code: "coverage",
          need: Math.ceil(U.RECAL_MIN_COVERAGE * (spanDays + 1)), have: logged.length,
          text: `food logged on ${Math.ceil(U.RECAL_MIN_COVERAGE * (spanDays + 1))} of those ${spanDays + 1} days ` +
                `(you logged ${logged.length})`
        }]
      };
    }

    const avgIntake = Math.round(mean(logged));
    const deltaKg = endKg - startKg;
    const maintenance = Math.round(avgIntake - (deltaKg * U.KCAL_PER_KG_BODYWEIGHT) / elapsed);
    return {
      ok: true,
      // Rounded to 25 because this is not a to-the-calorie number and should
      // not be dressed as one.
      maintenance: Math.round(maintenance / 25) * 25,
      exact: maintenance,
      avgIntake,
      startKg: Math.round(startKg * 10) / 10,
      endKg: Math.round(endKg * 10) / 10,
      deltaKg: Math.round(deltaKg * 100) / 100,
      elapsedDays: elapsed,
      spanDays,
      weighIns: ws.length,
      loggedDays: logged.length,
      coverage,
      reasons: []
    };
  },

  /** The kcalOffset that would make the app agree with the logs.
   *
   *  Against the rest-day prediction on purpose: a measured maintenance is a
   *  long-run average that already contains however much the person trains,
   *  so comparing it with a figure that has today's session added would fold
   *  that session in twice. `clamped` is surfaced rather than applied
   *  silently — a suggestion of 1400 quietly becoming 800 is the app
   *  pretending to have taken an instruction it did not take. */
  offsetFromMeasured(measuredMaintenance, predictedRestDayTdee) {
    const m = Number(measuredMaintenance), p = Number(predictedRestDayTdee);
    if (!Number.isFinite(m) || !Number.isFinite(p) || p <= 0) return null;
    const raw = Math.round(m - p);
    const clamped = U.normalizeKcalOffset(raw);
    return { raw, offset: clamped, clamped: clamped !== raw };
  },

  profileComplete(prefs) {
    if (!prefs) return false;
    const sex = prefs.sex;
    const age = Number(U.effectiveAge(prefs));
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
  /** Whole years from an ISO yyyy-mm-dd date of birth, or null. */
  ageFromDob(dob) {
    if (!dob || typeof dob !== "string") return null;
    const m = dob.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const y = +m[1], mo = +m[2], d = +m[3];
    const now = new Date();
    let age = now.getFullYear() - y;
    // Not had this year's birthday yet? Then they're a year younger.
    const beforeBirthday = (now.getMonth() + 1) < mo || ((now.getMonth() + 1) === mo && now.getDate() < d);
    if (beforeBirthday) age -= 1;
    return (age >= 0 && age <= 120) ? age : null;
  },

  /** Age the app should use: derived from DOB when set, else the stored age. */
  effectiveAge(prefs) {
    const fromDob = U.ageFromDob(prefs && prefs.dob);
    if (fromDob != null) return fromDob;
    const a = Number(prefs && prefs.age);
    return Number.isFinite(a) ? a : null;
  },

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
      // Numbers are the easy slip — el("div", {}, count) reads fine but
      // appendChild throws on anything that isn't a Node, taking the whole
      // render down. Coerce any primitive to text instead.
      e.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
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
