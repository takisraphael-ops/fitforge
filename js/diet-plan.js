// Matching logged food against the eating pattern you chose as a guideline.
//
// Every sentence this module produces is a statement about a rule the user set
// and a number the app already stores. "Outside your 12:00–20:00 window" is a
// fact. "You should eat earlier" is advice, and nothing here is allowed to
// drift into it — no scores, no streaks, no verdicts, no adjectives about the
// day. The distinction is what lets FitForge report on eating patterns at all
// while the Learning Centre goes on refusing to give dietary advice.
//
// Deliberately free of dependencies — no U, no Storage, no DOM — so the rules
// can be exercised directly by tests/diet-plan.js without a browser. The one
// duplicated thing is the Atwater factors, which are three integers and would
// cost more in load-order coupling than they save.
window.DietPlan = (function () {
  "use strict";

  const MACRO_KCAL = { protein: 4, carbs: 4, fat: 9 };
  const MACRO_LABELS = { protein: "Protein", carbs: "Carbs", fat: "Fat" };
  // "Carbs is 38%" — the one label of the three that takes a plural verb.
  const MACRO_VERB = { protein: "is", carbs: "are", fat: "is" };
  const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const WEEKDAY_LABELS = {
    sun: "Sun", mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat"
  };

  const plans = () => window.DIET_PLANS || [];
  const byId = (id) => plans().find((p) => p.id === id) || null;

  // ---- time ----

  /** "HH:MM" to minutes past midnight, or null if it isn't a time. */
  function toMinutes(hhmm) {
    const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || "").trim());
    if (!m) return null;
    const h = +m[1], min = +m[2];
    if (h < 0 || h > 23 || min < 0 || min > 59) return null;
    return h * 60 + min;
  }

  function toClock(mins) {
    const m = ((mins % 1440) + 1440) % 1440;
    return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  }

  /** A duration in words: "8h", "13h 28m", "45m". */
  function formatSpan(mins) {
    const n = Math.max(0, Math.round(mins));
    const h = Math.floor(n / 60), m = n % 60;
    if (!h) return `${m}m`;
    if (!m) return `${h}h`;
    return `${h}h ${m}m`;
  }

  /** Local weekday key for a yyyy-mm-dd date, without going via UTC. */
  function weekdayKey(dateIso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateIso || ""));
    if (!m) return null;
    return WEEKDAY_KEYS[new Date(+m[1], +m[2] - 1, +m[3]).getDay()];
  }

  /** The Monday-to-Sunday week containing a date, as ISO strings. */
  function weekDates(dateIso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateIso || ""));
    if (!m) return [];
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    const back = (d.getDay() + 6) % 7;              // Monday = 0
    d.setDate(d.getDate() - back);
    const out = [];
    for (let i = 0; i < 7; i++) {
      out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
      d.setDate(d.getDate() + 1);
    }
    return out;
  }

  // ---- config ----

  /** A usable config for a plan, whatever the stored one is missing. */
  function normalizeConfig(plan, cfg) {
    if (!plan) return {};
    const c = (cfg && typeof cfg === "object") ? cfg : {};
    if (plan.kind === "window") {
      const start = toMinutes(c.start) != null ? c.start : plan.defaults.start;
      const end = toMinutes(c.end) != null ? c.end : plan.defaults.end;
      return { start, end };
    }
    if (plan.kind === "dayType") {
      const days = Array.isArray(c.days) ? c.days.filter((d) => WEEKDAY_KEYS.includes(d)) : [];
      const range = plan.capRange || { min: 200, max: 1200 };
      let cap = Math.round(Number(c.cap));
      if (!Number.isFinite(cap)) cap = plan.defaults.cap;
      cap = Math.max(range.min, Math.min(range.max, cap));
      return { days: days.length ? days : plan.defaults.days.slice(), cap };
    }
    return {};
  }

  /** The chosen rule in one line, for headers and the picker. */
  function summaryLine(plan, cfg) {
    if (!plan) return "";
    const c = normalizeConfig(plan, cfg);
    if (plan.kind === "window") {
      const w = windowOf(c);
      return `${c.start} – ${c.end} · ${formatSpan(w.length)} window`;
    }
    if (plan.kind === "dayType") {
      const days = c.days.slice().sort((a, b) => WEEKDAY_KEYS.indexOf(a) - WEEKDAY_KEYS.indexOf(b));
      return `${days.map((d) => WEEKDAY_LABELS[d]).join(", ")} · ${c.cap} kcal cap`;
    }
    if (plan.kind === "composition") {
      return plan.targets.map((t) => `${MACRO_LABELS[t.macro]} ${t.minPct}–${t.maxPct}%`).join(" · ");
    }
    return "";
  }

  // ---- the window rule ----

  /** Window bounds in minutes. A window whose end is at or before its start
      runs through midnight; start === end is the whole day. */
  function windowOf(cfg) {
    const s = toMinutes(cfg.start), e = toMinutes(cfg.end);
    const wraps = e <= s;
    return { start: s, end: e, wraps, length: wraps ? 1440 - s + e : e - s };
  }

  function inWindow(mins, w) {
    return w.wraps ? (mins >= w.start || mins <= w.end) : (mins >= w.start && mins <= w.end);
  }

  /**
   * Where a clock time sits relative to the window. Outside, it reports the
   * nearer edge and which one — "40m before it opens" is a more useful fact
   * than a distance with no direction, and it is the same fact either way.
   */
  function windowOffset(mins, w) {
    if (inWindow(mins, w)) return { inside: true };
    const mod = (n) => ((n % 1440) + 1440) % 1440;
    const before = mod(w.start - mins);   // until it opens
    const after = mod(mins - w.end);      // since it closed
    return before <= after
      ? { inside: false, dir: "before", mins: before }
      : { inside: false, dir: "after", mins: after };
  }

  /**
   * One meal against the pattern. Returns null when the pattern has nothing to
   * say about a single item — a daily calorie cap and a macro split are both
   * properties of the whole day, and flagging one meal against them would be
   * inventing a rule the pattern does not have.
   */
  function checkMeal(plan, cfg, meal) {
    if (!plan || plan.kind !== "window") return null;
    const w = windowOf(normalizeConfig(plan, cfg));
    const mins = toMinutes(meal && meal.time);
    if (mins == null) return { state: "untimed", label: "No time", detail: "This item has no time recorded, so it is not compared to your window." };
    const off = windowOffset(mins, w);
    if (off.inside) return { state: "inside", label: "In window", detail: `Inside your ${toClock(w.start)}–${toClock(w.end)} window.` };
    return {
      state: "outside",
      label: `${formatSpan(off.mins)} ${off.dir === "before" ? "early" : "late"}`,
      detail: off.dir === "before"
        ? `${formatSpan(off.mins)} before your window opens at ${toClock(w.start)}.`
        : `${formatSpan(off.mins)} after your window closed at ${toClock(w.end)}.`
    };
  }

  // ---- the day ----

  function dayTotals(meals) {
    const t = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
    for (const m of meals) {
      t.kcal += Number(m.kcal) || 0;
      t.protein += Number(m.protein) || 0;
      t.carbs += Number(m.carbs) || 0;
      t.fat += Number(m.fat) || 0;
    }
    return t;
  }

  /** Each macro's share of the energy the macros themselves account for. */
  function energySplit(totals) {
    const kc = {
      protein: totals.protein * MACRO_KCAL.protein,
      carbs: totals.carbs * MACRO_KCAL.carbs,
      fat: totals.fat * MACRO_KCAL.fat
    };
    const sum = kc.protein + kc.carbs + kc.fat;
    if (sum <= 0) return null;
    return {
      totalKcal: Math.round(sum),
      protein: Math.round((kc.protein / sum) * 100),
      carbs: Math.round((kc.carbs / sum) * 100),
      fat: Math.round((kc.fat / sum) * 100)
    };
  }

  function windowDay(plan, cfg, dayMeals) {
    const c = normalizeConfig(plan, cfg);
    const w = windowOf(c);
    const facts = [];
    const items = [];
    const timed = dayMeals
      .map((m) => ({ meal: m, mins: toMinutes(m.time) }))
      .filter((x) => x.mins != null)
      .sort((a, b) => a.mins - b.mins);
    const untimed = dayMeals.length - timed.length;

    if (!dayMeals.length) {
      return { measurable: false, headline: "Nothing logged yet today.", facts: [], items: [] };
    }
    if (!timed.length) {
      return {
        measurable: false,
        headline: "Nothing logged today has a time on it.",
        facts: ["Your window is compared against the time on each item, so there is nothing to compare yet."],
        items: []
      };
    }

    let outside = 0;
    for (const t of timed) {
      const off = windowOffset(t.mins, w);
      if (off.inside) continue;
      outside++;
      items.push({
        name: t.meal.name || "Item",
        time: toClock(t.mins),
        text: off.dir === "before"
          ? `${formatSpan(off.mins)} before it opens`
          : `${formatSpan(off.mins)} after it closed`
      });
    }

    const first = timed[0].mins, last = timed[timed.length - 1].mins;
    const headline = outside === 0
      ? `All ${timed.length} timed item${timed.length === 1 ? "" : "s"} fell inside your window.`
      : `${outside} of ${timed.length} timed item${timed.length === 1 ? "" : "s"} fell outside your window.`;

    facts.push(timed.length === 1
      ? `One item, logged at ${toClock(first)}.`
      : `First at ${toClock(first)}, last at ${toClock(last)} — a ${formatSpan(last - first)} spread. Your window is ${formatSpan(w.length)}.`);
    if (untimed) {
      facts.push(`${untimed} item${untimed === 1 ? " has" : "s have"} no time recorded, so ${untimed === 1 ? "it is" : "they are"} not compared either way.`);
    }
    return { measurable: true, headline, facts, items };
  }

  function dayTypeDay(plan, cfg, dayMeals, allMeals, dateIso) {
    const c = normalizeConfig(plan, cfg);
    const today = weekdayKey(dateIso);
    const isReduced = c.days.includes(today);
    const facts = [];

    // The week's reduced days, so a single day is not the only thing on offer.
    const week = weekDates(dateIso).filter((d) => c.days.includes(weekdayKey(d)));
    const byDate = {};
    for (const m of allMeals || []) {
      if (!week.includes(m.date)) continue;
      byDate[m.date] = (byDate[m.date] || 0) + (Number(m.kcal) || 0);
    }
    const loggedDays = Object.keys(byDate).length;
    const underCap = Object.values(byDate).filter((v) => v <= c.cap).length;

    if (!isReduced) {
      facts.push(`Your reduced days are ${c.days.map((d) => WEEKDAY_LABELS[d]).join(" and ")}.`);
      if (loggedDays) {
        facts.push(`This week: ${loggedDays} of ${week.length} logged, ${underCap} at or under the ${c.cap} kcal cap.`);
      }
      return {
        measurable: true,
        headline: "Today is a normal day on this pattern — no cap applies.",
        facts, items: []
      };
    }

    const kcal = Math.round(dayTotals(dayMeals).kcal);
    if (!dayMeals.length) {
      return {
        measurable: false,
        headline: `Today is one of your reduced days. Nothing logged yet.`,
        facts: [`The cap you set is ${c.cap} kcal.`],
        items: []
      };
    }
    const diff = kcal - c.cap;
    facts.push(diff > 0
      ? `That is ${diff} kcal above the ${c.cap} kcal cap you set.`
      : `That leaves ${Math.abs(diff)} kcal under the ${c.cap} kcal cap you set.`);
    if (week.length > 1 && loggedDays) {
      facts.push(`This week: ${loggedDays} of ${week.length} reduced days logged, ${underCap} at or under the cap.`);
    }
    return {
      measurable: true,
      headline: `Today is a reduced day. ${kcal} kcal logged.`,
      facts, items: []
    };
  }

  function compositionDay(plan, cfg, dayMeals) {
    const totals = dayTotals(dayMeals);
    const split = energySplit(totals);
    if (!split) {
      return {
        measurable: false,
        headline: dayMeals.length ? "Nothing logged today has macros on it." : "Nothing logged yet today.",
        facts: dayMeals.length
          ? ["This pattern is a split of protein, carbohydrate and fat, so it needs macros to compare against."]
          : [],
        items: []
      };
    }
    const facts = [];
    const items = [];
    for (const t of plan.targets) {
      const pct = split[t.macro];
      const grams = Math.round(totals[t.macro]);
      const where = pct < t.minPct
        ? `${t.minPct - pct} points below the ${t.minPct}–${t.maxPct}% this pattern describes`
        : pct > t.maxPct
          ? `${pct - t.maxPct} points above the ${t.minPct}–${t.maxPct}% this pattern describes`
          : `inside the ${t.minPct}–${t.maxPct}% this pattern describes`;
      items.push({
        name: MACRO_LABELS[t.macro],
        time: `${pct}%`,
        text: where
      });
      facts.push(`${MACRO_LABELS[t.macro]}: ${pct}% of today's logged energy (${grams} g) — ${where}.`);
    }
    const inRange = plan.targets.filter((t) => split[t.macro] >= t.minPct && split[t.macro] <= t.maxPct).length;
    const one = plan.targets[0].macro;
    const headline = plan.targets.length === 1
      ? `${MACRO_LABELS[one]} ${MACRO_VERB[one]} ${split[one]}% of today's logged energy.`
      : `${inRange} of ${plan.targets.length} shares are inside the ranges this pattern describes.`;
    // A day logged as calories with no macros on some items produces a split
    // for only the part that had them. Saying so beats a confident percentage.
    const withoutMacros = dayMeals.filter((m) => !(Number(m.protein) || Number(m.carbs) || Number(m.fat))).length;
    if (withoutMacros) {
      facts.push(`${withoutMacros} item${withoutMacros === 1 ? "" : "s"} logged without macros ${withoutMacros === 1 ? "is" : "are"} not in this split.`);
    }
    return { measurable: true, headline, facts, items };
  }

  /**
   * The day against the pattern: a headline, supporting facts, and the
   * individual things the rule picked out. `allMeals` is every meal in
   * storage — the reduced-day pattern reports on its week, not just today.
   */
  function checkDay(plan, cfg, allMeals, dateIso) {
    if (!plan) return null;
    const dayMeals = (allMeals || []).filter((m) => m.date === dateIso);
    if (plan.kind === "window") return windowDay(plan, cfg, dayMeals);
    if (plan.kind === "dayType") return dayTypeDay(plan, cfg, dayMeals, allMeals, dateIso);
    if (plan.kind === "composition") return compositionDay(plan, cfg, dayMeals);
    return null;
  }

  return {
    WEEKDAY_KEYS, WEEKDAY_LABELS, MACRO_LABELS,
    plans, byId, normalizeConfig, summaryLine,
    toMinutes, toClock, formatSpan, weekdayKey, weekDates,
    windowOf, inWindow, windowOffset, energySplit, dayTotals,
    checkMeal, checkDay
  };
})();
