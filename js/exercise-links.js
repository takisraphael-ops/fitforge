// Turning the `variations` and `alternatives` text into links, where and only
// where the text genuinely names an exercise this app has.
//
// 904 references across the library, and almost none of them went anywhere.
// The obvious fix — fuzzy-match each string to the nearest exercise — is the
// wrong one, and worth spelling out because it looks so reasonable:
//
//   "Weighted pull-up"  is 90% of the way to  "Pull-Up"
//   "Wide push-up"      is 90% of the way to  "Push-Up"
//   "L-sit pull-up"     is 90% of the way to  "Pull-Up"
//
// Every one of those would send you back to the page you are already reading.
// A dead string is honest; a link that lands you where you started is worse
// than dead, because you tapped it expecting somewhere new. Extra qualifying
// words mean a *different, harder movement we do not stock* — which is exactly
// when the answer is "no link", not "close enough".
//
// So resolution is deterministic and refuses to guess:
//
//   1. the string, normalised, equals an exercise name  → link
//   2. the same words in a different order              → link
//   3. the string is in the hand-written ALIASES below  → link
//   4. anything else                                    → plain text
//
// Rule 3 exists because a handful of strings really are the same movement
// under a shorter name — "Barbell row" for "Barbell Bent-Over Row". Each one
// is a judgement someone made, which is why they are written out rather than
// inferred, and why the suite checks none of them is a variation-of in
// disguise.
window.ExerciseLinks = (function () {
  "use strict";

  /** Only a genuine plural: "push-ups" → "push-up", but "Press" and "Raise"
      keep their endings. Getting this wrong turns Raise into Raie. */
  const singular = (w) => (w.length > 2 && w.endsWith("s") && !w.endsWith("ss")) ? w.slice(0, -1) : w;

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/\([^)]*\)/g, " ")     // "Bench dip (beginner)" is still a bench dip
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean)
      .map(singular)
      .join(" ");
  }

  /** Same words, any order. "Chest press machine" is "Machine Chest Press". */
  const orderless = (s) => norm(s).split(" ").sort().join(" ");

  /**
   * Shorter names for exercises this library stores under a longer one. Each
   * pair names the SAME movement — never a harder variation of it.
   *
   * The test that guards this list rejects any entry whose key contains the
   * target's full name plus extra words, because that is the signature of
   * "Weighted pull-up → pull-up".
   */
  const ALIASES = {
    // back
    "barbell row": "row-barbell",
    "bent over row": "row-barbell",
    "dumbbell row": "row-dumbbell",
    "cable row": "row-seated-cable",
    "rdl": "deadlift-romanian",
    // chest
    "bench press": "bench-press-barbell",
    "barbell bench": "bench-press-barbell",
    "chest press machine": "machine-chest-press",
    "dumbbell bench": "bench-press-dumbbell",
    // shoulders
    "barbell ohp": "ohp-barbell",
    "military press": "ohp-barbell",
    "shoulder press machine": "machine-shoulder-press",
    // arms
    "barbell curl": "curl-barbell",
    "dumbbell curl": "curl-dumbbell",
    // legs
    "front squat": "squat-front",
    "back squat": "squat-back",
    "barbell squat": "squat-back",
    "step up": "step-up",
    "nordic curl": "nordic-curl",
    // core
    "hollow hold": "hollow-hold",
    "hanging knee raise": "hanging-leg-raise",
    // mobility
    "hip circle": "mob-hip-circles",
    "supine figure 4": "mob-figure-4-supine",
    "child pose": "mob-childs-pose",
    "world greatest stretch": "mob-worlds-greatest",
  };

  let index = null;
  function build(db) {
    const byName = new Map();
    const byWords = new Map();
    for (const e of db) {
      // First wins, both times. "Glute Bridge" and "Glute Bridge (Warm-up)"
      // normalise to the same string once the parenthetical is stripped, and
      // letting the later one overwrite sent a plain "Glute bridge" to the
      // mobility warm-up instead of the exercise.
      const n = norm(e.name);
      if (!byName.has(n)) byName.set(n, e.id);
      const k = orderless(e.name);
      if (!byWords.has(k)) byWords.set(k, e.id);
    }
    index = { byName, byWords, size: db.length };
  }

  /** The exercise this string names, or null. Never a guess. */
  function resolve(text, db) {
    const list = db || window.EXERCISE_DB || [];
    if (!index || index.size !== list.length) build(list);
    const n = norm(text);
    if (!n) return null;
    return index.byName.get(n)
      || ALIASES[n]
      || index.byWords.get(orderless(text))
      || null;
  }

  /** How much of a list will become tappable — used by the tests, and handy
      for judging whether a curation pass was worth it. */
  function coverage(db) {
    const list = db || window.EXERCISE_DB || [];
    let refs = 0, linked = 0;
    for (const e of list) {
      for (const v of [...(e.variations || []), ...(e.alternatives || [])]) {
        refs++;
        if (resolve(v, list)) linked++;
      }
    }
    return { refs, linked, pct: refs ? Math.round((linked / refs) * 100) : 0 };
  }

  return { norm, orderless, resolve, coverage, ALIASES };
})();
