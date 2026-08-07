// Reading a movement ladder against what you have actually logged.
//
// The engine answers one question per rung: is there a logged session that
// meets this gate? Not "roughly", not "on average across the month" — one
// session, in the data, that satisfies it. That strictness is deliberate. A
// ladder that advances you on a good average is telling you that you can do
// something you have never once done.
//
// Deliberately free of dependencies — no U, no Storage, no DOM — so the rules
// can be exercised without a browser, the same arrangement as diet-plan.js.
window.Progression = (function () {
  "use strict";

  const chains = () => window.PROGRESSIONS || [];
  const byId = (id) => chains().find((c) => c.id === id) || null;

  /** Every chain that contains this exercise, and where in it. */
  function chainsFor(exerciseId) {
    const out = [];
    for (const c of chains()) {
      const i = c.rungs.findIndex((r) => r.exerciseId === exerciseId);
      if (i >= 0) out.push({ chain: c, index: i });
    }
    return out;
  }

  /** A gate as a sentence. One phrasing, so the guide and the readout cannot
      describe the same requirement differently. */
  function gateText(gate) {
    if (!gate) return "";
    const sets = gate.sets || 1;
    const setWord = sets === 1 ? "set" : "sets";
    if (gate.holdSec) {
      return sets === 1
        ? `hold ${gate.holdSec}s`
        : `${sets} ${setWord} of ${gate.holdSec}s`;
    }
    const load = gate.addedKg ? ` carrying ${gate.addedKg} kg` : "";
    return sets === 1
      ? `${gate.reps} rep${gate.reps === 1 ? "" : "s"}${load}`
      : `${sets} × ${gate.reps}${load}`;
  }

  /** Does one logged session satisfy the gate? */
  function sessionMeets(sets, gate) {
    if (!gate) return false;
    const need = gate.sets || 1;
    const qualifying = (sets || []).filter((s) => {
      if (!s || !s.done) return false;
      if (gate.holdSec) return Number(s.seconds) >= gate.holdSec;
      if (Number(s.reps) < gate.reps) return false;
      if (gate.addedKg != null && Number(s.weight || 0) < gate.addedKg) return false;
      return true;
    });
    return qualifying.length >= need;
  }

  /** The best single session for an exercise, in the gate's own terms, so a
      near miss can be reported as a near miss rather than just "not yet". */
  function bestEffort(sessions, gate) {
    let best = null;
    for (const ses of sessions) {
      // A warm-up cannot satisfy a rung: the gate asks for work at a weight,
      // and preparation at that weight is not the same claim.
      const done = (ses.sets || []).filter((s) => s && s.done && !s.warmup);
      if (!done.length) continue;
      const score = gate && gate.holdSec
        ? Math.max(...done.map((s) => Number(s.seconds) || 0))
        : Math.max(...done.map((s) => Number(s.reps) || 0));
      const count = gate && gate.holdSec
        ? done.filter((s) => Number(s.seconds) >= (gate.holdSec || 0)).length
        : done.filter((s) => Number(s.reps) >= (gate ? gate.reps : 0)).length;
      if (!best || score > best.score) best = { score, count, date: ses.date, sets: done.length };
    }
    return best;
  }

  /** Completed sessions for one exercise, newest first. */
  function sessionsFor(workouts, exerciseId) {
    const out = [];
    for (const w of workouts || []) {
      if (!w || !w.completedAt) continue;
      for (const ex of w.exercises || []) {
        if (ex.exerciseId !== exerciseId) continue;
        out.push({ date: w.date, sets: ex.sets || [] });
      }
    }
    return out.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }

  /**
   * Walk a chain against a workout history.
   *
   * Every rung comes back as one of:
   *   cleared  — a logged session met its gate
   *   current  — the first rung that has not been cleared, and can be worked
   *   blocked  — not cleared, and something in `requires` is also not cleared
   *   locked   — further up than the rung you are on
   *
   * `current` is the first uncleared rung whose requirements are satisfied.
   * A cleared rung above an uncleared one stays cleared — logging a pull-up
   * before you ever logged a dead hang does not un-earn the pull-up, and
   * pretending otherwise would be the app arguing with its own data.
   */
  function evaluate(chain, workouts) {
    if (!chain) return null;
    const cleared = new Set();
    const rows = chain.rungs.map((rung) => {
      const sessions = sessionsFor(workouts, rung.exerciseId);
      const meeting = sessions.filter((s) => sessionMeets(s.sets, rung.gate));
      const isCleared = meeting.length > 0;
      if (isCleared) cleared.add(rung.exerciseId);
      return {
        rung,
        exerciseId: rung.exerciseId,
        gate: rung.gate,
        gateText: gateText(rung.gate),
        note: rung.note || null,
        cleared: isCleared,
        clearedSessions: meeting.length,
        clearedOn: meeting.length ? meeting[meeting.length - 1].date : null,
        logged: sessions.length,
        best: bestEffort(sessions, rung.gate),
        missing: []
      };
    });

    // Second pass: requirements can point at rungs in other chains, so they
    // are resolved against everything logged rather than this chain's set.
    for (const row of rows) {
      const req = row.rung.requires || [];
      row.missing = req.filter((id) => {
        if (cleared.has(id)) return false;
        // Look it up wherever it lives.
        for (const c of chains()) {
          const r = c.rungs.find((x) => x.exerciseId === id);
          if (!r) continue;
          return !sessionsFor(workouts, id).some((s) => sessionMeets(s.sets, r.gate));
        }
        return true;
      });
    }

    let currentSet = false;
    for (const row of rows) {
      if (row.cleared) { row.state = "cleared"; continue; }
      if (row.missing.length) { row.state = "blocked"; continue; }
      if (!currentSet) { row.state = "current"; currentSet = true; }
      else row.state = "locked";
    }
    // Everything cleared: the chain is done, and nothing is "current".
    const done = rows.every((r) => r.cleared);
    const current = rows.find((r) => r.state === "current") || null;
    return {
      chain,
      rows,
      done,
      current,
      clearedCount: rows.filter((r) => r.cleared).length,
      total: rows.length
    };
  }

  /** One line for a chain's header: where you are in it. */
  function summary(view) {
    if (!view) return "";
    if (view.done) return `All ${view.total} rungs cleared`;
    if (!view.clearedCount) return `${view.total} rungs · nothing logged yet`;
    return `${view.clearedCount} of ${view.total} rungs cleared`;
  }

  return {
    chains, byId, chainsFor, gateText, sessionMeets, bestEffort,
    sessionsFor, evaluate, summary
  };
})();
