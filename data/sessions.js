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

  // ============ STRENGTH ============
  // ex(id, name, sets, reps) — strength entries expand to sets×reps targets.
  const ex = (exerciseId, name, targetSets, targetReps) => ({ exerciseId, name, targetSets, targetReps });
  const strength = (id, name, desc, detail, exercises, extra = {}) =>
    S.push({ id, name, preset: true, pillar: "strength", desc, detail, exercises, ...extra });

  strength("preset-full-body-a", "Full Body A", "Squat · Bench · Row · 5 exercises",
    "The first of three rotating full-body days for 3×/week training. Every session hits legs, a push and a pull, so missing one day costs you less than it would on a split.",
    [
      ex("squat-back", "Barbell Back Squat", 3, 5),
      ex("bench-press-barbell", "Barbell Bench Press", 3, 5),
      ex("row-barbell", "Barbell Bent-Over Row", 3, 8),
      ex("ohp-dumbbell", "Dumbbell Shoulder Press", 2, 10),
      ex("plank", "Plank", 3, 1)
    ]);

  strength("preset-full-body-b", "Full Body B", "Deadlift · OHP · Pulldown · 5 exercises",
    "The second full-body day. Deadlift replaces squat and pressing goes overhead, so the same muscles get worked from different angles across the week.",
    [
      ex("deadlift-conventional", "Conventional Deadlift", 3, 5),
      ex("ohp-barbell", "Barbell Overhead Press", 3, 5),
      ex("lat-pulldown", "Lat Pulldown", 3, 10),
      ex("lunge-walking", "Walking Lunge", 2, 10),
      ex("hanging-leg-raise", "Hanging Leg Raise", 3, 10)
    ]);

  strength("preset-full-body-c", "Full Body C", "Front squat · Incline · Chin-up · 5 exercises",
    "The third full-body day, biased toward the front squat and vertical pulling. Rotate A → B → C across the week and repeat.",
    [
      ex("squat-front", "Barbell Front Squat", 3, 5),
      ex("incline-bench-dumbbell", "Incline Dumbbell Press", 3, 8),
      ex("chin-up", "Chin-Up", 3, 6),
      ex("hip-thrust", "Barbell Hip Thrust", 3, 10),
      ex("side-plank", "Side Plank", 2, 1)
    ]);

  strength("preset-upper", "Upper Body", "Push & pull · 6 exercises",
    "The upper half of a 4×/week upper–lower split. Two presses, two pulls and direct arm work, balanced so nothing gets left behind.",
    [
      ex("bench-press-barbell", "Barbell Bench Press", 4, 6),
      ex("row-barbell", "Barbell Bent-Over Row", 4, 8),
      ex("ohp-dumbbell", "Dumbbell Shoulder Press", 3, 10),
      ex("lat-pulldown", "Lat Pulldown", 3, 10),
      ex("curl-dumbbell", "Dumbbell Curl", 3, 12),
      ex("tricep-pushdown", "Tricep Pushdown", 3, 12)
    ]);

  strength("preset-lower", "Lower Body", "Squat, hinge & accessories · 6 exercises",
    "The lower half of a 4×/week upper–lower split. A squat, a hinge, single-leg work, then the smaller muscles that usually get skipped.",
    [
      ex("squat-back", "Barbell Back Squat", 4, 6),
      ex("deadlift-romanian", "Romanian Deadlift", 3, 8),
      ex("bulgarian-split-squat", "Bulgarian Split Squat", 3, 10),
      ex("leg-curl-lying", "Lying Leg Curl", 3, 12),
      ex("calf-raise-standing", "Standing Calf Raise", 4, 15),
      ex("dead-bug", "Dead Bug", 3, 10)
    ]);

  strength("preset-push", "Push Day", "Chest, shoulders & triceps · 6 exercises",
    "The push day of a push/pull/legs rotation. Heavy horizontal press first, then vertical, then the isolation work that finishes the job.",
    [
      ex("bench-press-barbell", "Barbell Bench Press", 4, 6),
      ex("ohp-barbell", "Barbell Overhead Press", 3, 8),
      ex("incline-bench-dumbbell", "Incline Dumbbell Press", 3, 10),
      ex("lateral-raise", "Lateral Raise", 3, 15),
      ex("tricep-pushdown", "Tricep Pushdown", 3, 12),
      ex("overhead-tricep-extension", "Overhead Tricep Extension", 3, 12)
    ]);

  strength("preset-pull", "Pull Day", "Back & biceps · 6 exercises",
    "The pull day of a push/pull/legs rotation. Vertical and horizontal pulling, rear delts, then curls — the mirror of push day.",
    [
      ex("pull-up", "Pull-Up", 4, 6),
      ex("row-barbell", "Barbell Bent-Over Row", 4, 8),
      ex("row-seated-cable", "Seated Cable Row", 3, 10),
      ex("face-pull", "Face Pull", 3, 15),
      ex("curl-barbell", "Barbell Biceps Curl", 3, 10),
      ex("hammer-curl", "Hammer Curl", 3, 12)
    ]);

  strength("preset-legs", "Leg Day", "Quads, hamstrings & glutes · 6 exercises",
    "The leg day of a push/pull/legs rotation. Squat, hinge, then quad and hamstring isolation so both sides of the thigh get direct work.",
    [
      ex("squat-back", "Barbell Back Squat", 4, 6),
      ex("deadlift-romanian", "Romanian Deadlift", 3, 8),
      ex("leg-press", "Leg Press", 3, 12),
      ex("leg-curl-lying", "Lying Leg Curl", 3, 12),
      ex("leg-extension", "Leg Extension", 3, 15),
      ex("calf-raise-seated", "Seated Calf Raise", 4, 15)
    ]);

  strength("preset-machines", "Machines Only", "Full body, no free weights · 6 exercises",
    "Every movement on a machine — useful when the free-weight area is packed, when you're new and would rather not fight a barbell, or on a deload where you want the work without the coordination cost.",
    [
      ex("leg-press", "Leg Press", 3, 12),
      ex("machine-chest-press", "Machine Chest Press", 3, 12),
      ex("lat-pulldown", "Lat Pulldown", 3, 12),
      ex("machine-shoulder-press", "Machine Shoulder Press", 3, 12),
      ex("leg-curl-seated", "Seated Leg Curl", 3, 12),
      ex("cable-crunch", "Cable Crunch", 3, 15)
    ]);

  strength("preset-dumbbell", "Dumbbell Only", "Full body with a pair of dumbbells · 6 exercises",
    "Everything here needs one pair of dumbbells. Built for hotel gyms and home setups where that's all there is.",
    [
      ex("goblet-squat", "Goblet Squat", 3, 12),
      ex("bench-press-dumbbell", "Dumbbell Bench Press", 3, 10),
      ex("row-dumbbell", "Dumbbell Row", 3, 10),
      ex("ohp-dumbbell", "Dumbbell Shoulder Press", 3, 10),
      ex("bulgarian-split-squat", "Bulgarian Split Squat", 3, 10),
      ex("hammer-curl", "Hammer Curl", 3, 12)
    ]);

  strength("preset-bodyweight", "Bodyweight — No Equipment", "Nothing but the floor · 6 exercises",
    "No equipment at all. For travel, illness, or a closed gym — the session that means you don't lose the week.",
    [
      ex("push-up", "Push-Up", 4, 12),
      ex("lunge-walking", "Walking Lunge", 3, 12),
      ex("glute-bridge", "Glute Bridge", 3, 15),
      ex("plank", "Plank", 3, 1),
      ex("hollow-hold", "Hollow Hold", 3, 1),
      ex("dead-bug", "Dead Bug", 3, 12)
    ]);

  strength("preset-30-min", "30-Minute Express", "Four compounds, in and out",
    "A deliberately short session: four compound lifts, nothing isolation. Pair the first two and the last two to save time. Built for the days you nearly skipped entirely.",
    [
      ex("squat-back", "Barbell Back Squat", 3, 8),
      ex("bench-press-barbell", "Barbell Bench Press", 3, 8),
      ex("row-barbell", "Barbell Bent-Over Row", 3, 8),
      ex("ohp-dumbbell", "Dumbbell Shoulder Press", 2, 12)
    ]);

  strength("preset-deload", "Deload — Full Body", "Same movements, half the work",
    "A planned easy week. The same pattern as a full-body day at noticeably lighter loads and fewer sets — the point is to move well and recover, not to chase anything.",
    [
      ex("squat-back", "Barbell Back Squat", 2, 5),
      ex("bench-press-barbell", "Barbell Bench Press", 2, 5),
      ex("row-barbell", "Barbell Bent-Over Row", 2, 8),
      ex("face-pull", "Face Pull", 2, 15)
    ]);

  // ============ RECOVERY ============
  const recovery = (id, name, desc, detail, exercises) =>
    S.push({ id, name, preset: true, pillar: "recovery", desc, detail, exercises });

  recovery("preset-mobility-flow", "Mobility Flow", "8 stretches · ~12 min",
    "A full-body flow through the areas that tighten most. Hold each for around forty-five seconds and breathe — this is the session to do on a rest day or after a hard week.",
    [
      { exerciseId: "mob-cat-cow", name: "Cat-Cow", targetSets: 1, targetReps: 1 },
      { exerciseId: "mob-worlds-greatest", name: "World's Greatest Stretch", targetSets: 1, targetReps: 1 },
      { exerciseId: "mob-hip-flexor-kneel", name: "Kneeling Hip Flexor Stretch", targetSets: 1, targetReps: 1 },
      { exerciseId: "mob-pigeon", name: "Pigeon Pose", targetSets: 1, targetReps: 1 },
      { exerciseId: "mob-hamstring-seated", name: "Seated Hamstring Stretch", targetSets: 1, targetReps: 1 },
      { exerciseId: "mob-thoracic-rotation", name: "Thoracic Rotation (Open Book)", targetSets: 1, targetReps: 1 },
      { exerciseId: "mob-doorway-chest", name: "Doorway Chest Stretch", targetSets: 1, targetReps: 1 },
      { exerciseId: "mob-childs-pose", name: "Child's Pose", targetSets: 1, targetReps: 1 }
    ]);

  recovery("preset-active-recovery", "Active Recovery", "25 min easy",
    "Deliberately easy movement to push blood around without adding fatigue. If you're working hard enough to notice, you're going too hard.",
    [{
      exerciseId: "cycling", name: "Cycling",
      intervals: { steps: [step(25 * 60, "easy", "Easy spin")] }
    }]);

  recovery("preset-core-finisher", "Core & Anti-Rotation", "5 exercises · ~10 min",
    "A short finisher built around bracing and resisting rotation rather than crunching. Do it at the end of a session or on its own.",
    [
      ex("pallof-press", "Pallof Press", 3, 12),
      ex("dead-bug", "Dead Bug", 3, 10),
      ex("side-plank", "Side Plank", 3, 1),
      ex("hollow-hold", "Hollow Hold", 3, 1),
      ex("ab-wheel", "Ab Wheel Rollout", 3, 8)
    ]);

  recovery("preset-grip", "Grip & Forearms", "4 exercises · ~10 min",
    "Direct grip and forearm work — usually the first thing to fail on heavy pulls, and almost never trained on purpose.",
    [
      ex("farmers-carry", "Farmer's Carry", 4, 1),
      ex("wrist-curl", "Wrist Curl", 3, 15),
      ex("hammer-curl", "Hammer Curl", 3, 12),
      ex("shrug-barbell", "Barbell Shrug", 3, 12)
    ]);

  return S;
})();
