// Pre-built sessions — ready-made workouts assignable to a day in the weekly
// plan, or startable directly. They share the template shape (id, name,
// exercises[]) so the planner, Templates sheet and "Start" flow treat them
// like any other template; `preset: true` marks them read-only.
//
// Conditioning sessions carry an `intervals` spec on their exercise entry:
//   intervals: { steps: [{ sec, intensity, label, work }] }
// Steps are flattened at authoring time so any structure is expressible —
// fixed work/rest, pyramids, or nested blocks like 10-20-30. `work: false`
// marks a recovery step (prescribed, but not logged as an effort).
window.PRESET_SESSIONS = (function () {
  // ---- authoring helpers (flatten a protocol into explicit steps) ----
  const step = (sec, intensity, label, work = true) => ({ sec, intensity, label, work });
  const warmup = (min = 10) => [step(min * 60, "easy", "Warm-up", false)];
  const cooldown = (min = 5) => [step(min * 60, "easy", "Cool-down", false)];
  /** repeat a block of steps n times */
  const times = (n, block) => Array.from({ length: n }, () => block).flat();

  const S = [];

  // ============ CONDITIONING ============

  S.push({
    id: "preset-norwegian-4x4",
    name: "Norwegian 4×4",
    preset: true, pillar: "conditioning",
    desc: "4 × 4 min hard / 3 min easy",
    detail: "The classic NTNU VO₂max protocol. Four hard four-minute efforts at around 90–95% of max effort, each followed by three minutes easy. Hard should feel unsustainable past four minutes, but controlled.",
    exercises: [{
      exerciseId: "run", name: "Running",
      intervals: {
        steps: [
          ...warmup(10),
          ...times(4, [step(240, "hard", "Hard"), step(180, "easy", "Recover", false)]),
          ...cooldown(5)
        ]
      }
    }]
  });

  S.push({
    id: "preset-30-30",
    name: "30/30 Intervals",
    preset: true, pillar: "conditioning",
    desc: "12 × 30 s hard / 30 s easy",
    detail: "Short intervals are far more approachable than a 4×4 — the effort ends before it gets truly unpleasant. A solid first taste of interval work.",
    exercises: [{
      exerciseId: "run", name: "Running",
      intervals: {
        steps: [
          ...warmup(10),
          ...times(12, [step(30, "hard", "Hard"), step(30, "easy", "Easy", false)]),
          ...cooldown(5)
        ]
      }
    }]
  });

  S.push({
    id: "preset-30-15",
    name: "30/15 Intervals",
    preset: true, pillar: "conditioning",
    desc: "12 × 30 s hard / 15 s easy",
    detail: "The same shape as 30/30 with half the recovery, so fatigue accumulates across the set. Step up to this once 30/30 feels comfortable.",
    exercises: [{
      exerciseId: "rowing", name: "Rowing (Erg)",
      intervals: {
        steps: [
          ...warmup(8),
          ...times(12, [step(30, "hard", "Hard"), step(15, "easy", "Easy", false)]),
          ...cooldown(5)
        ]
      }
    }]
  });

  S.push({
    id: "preset-tabata",
    name: "Tabata",
    preset: true, pillar: "conditioning",
    desc: "8 × 20 s max / 10 s rest — 4 min",
    detail: "Four minutes of work, all-out. Twenty seconds at maximum effort, ten seconds rest, eight times through. Brutal, unambiguous, and it fits in any gap in the day.",
    exercises: [{
      exerciseId: "cycling", name: "Cycling",
      intervals: {
        steps: [
          ...warmup(5),
          ...times(8, [step(20, "max", "Max"), step(10, "easy", "Rest", false)]),
          ...cooldown(3)
        ]
      }
    }]
  });

  S.push({
    id: "preset-zone-2",
    name: "Zone 2 Steady State",
    preset: true, pillar: "conditioning",
    desc: "50 min easy, conversational",
    detail: "The least exciting and most valuable session here. Hold a pace you could talk in complete sentences at — if you're gasping, slow down. The point is time, not effort.",
    exercises: [{
      exerciseId: "cycling", name: "Cycling",
      intervals: { steps: [step(50 * 60, "easy", "Steady")] }
    }]
  });

  S.push({
    id: "preset-10-20-30",
    name: "10-20-30 Running",
    preset: true, pillar: "conditioning",
    desc: "4 blocks of 5 × (30 s easy · 20 s moderate · 10 s sprint)",
    detail: "A Copenhagen protocol that front-loads recovery: jog thirty seconds, pick it up for twenty, then sprint the last ten. Five straight reps make a block; two minutes walking between blocks.",
    exercises: [{
      exerciseId: "run", name: "Running",
      intervals: {
        steps: [
          ...warmup(10),
          ...times(4, [
            ...times(5, [
              step(30, "easy", "Jog", false),
              step(20, "moderate", "Moderate"),
              step(10, "max", "Sprint")
            ]),
            step(120, "easy", "Walk", false)
          ]),
          ...cooldown(5)
        ]
      }
    }]
  });

  S.push({
    id: "preset-sprint-pyramid",
    name: "Sprint Pyramid",
    preset: true, pillar: "conditioning",
    desc: "1-2-3-4-3-2-1 min hard, equal recovery",
    detail: "Efforts build to a four-minute peak then come back down, with matched easy recovery after each. The descending half is where it earns its keep — you're tired and the intervals keep shortening.",
    exercises: [{
      exerciseId: "rowing", name: "Rowing (Erg)",
      intervals: {
        steps: [
          ...warmup(8),
          ...[1, 2, 3, 4, 3, 2, 1].flatMap(m => [
            step(m * 60, "hard", `${m} min hard`),
            step(m * 60, "easy", "Recover", false)
          ]),
          ...cooldown(5)
        ]
      }
    }]
  });

  S.push({
    id: "preset-ruck",
    name: "Ruck / Incline Walk",
    preset: true, pillar: "conditioning",
    desc: "45 min weighted walk",
    detail: "Load a pack or set the treadmill to a stiff incline and walk. Pace and grade are the dial — it should feel like steady work, not a stroll or a march.",
    exercises: [{
      exerciseId: "run", name: "Ruck / Incline Walk",
      intervals: { steps: [step(45 * 60, "moderate", "Steady")] }
    }]
  });

  S.push({
    id: "preset-sled-carry",
    name: "Sled & Carry Circuit",
    preset: true, pillar: "conditioning",
    desc: "5 rounds · carries and swings",
    detail: "Loaded carries and swings back to back. Rest as needed between rounds, but keep the grip working — that's usually what gives out first.",
    exercises: [
      { exerciseId: "farmers-carry", name: "Farmer's Carry", targetSets: 5, targetReps: 1 },
      { exerciseId: "kettlebell-swing", name: "Kettlebell Swing", targetSets: 5, targetReps: 15 },
      { exerciseId: "burpee", name: "Burpee", targetSets: 5, targetReps: 10 }
    ]
  });

  return S;
})();
