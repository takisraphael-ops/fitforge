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
//
// Two taxonomies, deliberately orthogonal:
//   pillar — what kind of training it is (conditioning / strength / recovery).
//            This drives the picker's swipe panels, so it stays at three.
//   venue  — where you can actually do it (gym / home / outdoors), authored.
//   gear   — what it needs, DERIVED from the exercises at load time so it can
//            never drift when a session is edited. See the block at the end.
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
    preset: true, pillar: "conditioning", venue: ["outdoors", "gym"],
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
    preset: true, pillar: "conditioning", venue: ["outdoors", "gym"],
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
    preset: true, pillar: "conditioning", venue: ["gym"],
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
    preset: true, pillar: "conditioning", venue: ["gym"],
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
    preset: true, pillar: "conditioning", venue: ["gym", "outdoors"],
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
    preset: true, pillar: "conditioning", venue: ["outdoors", "gym"],
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
    preset: true, pillar: "conditioning", venue: ["gym"],
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
    preset: true, pillar: "conditioning", venue: ["outdoors", "gym"],
    desc: "45 min weighted walk",
    detail: "Load a pack or set the treadmill to a stiff incline and walk. Pace and grade are the dial — it should feel like steady work, not a stroll or a march.",
    exercises: [{
      exerciseId: "run", name: "Ruck / Incline Walk",
      intervals: { steps: [step(45 * 60, "moderate", "Steady")] }
    }]
  });

  // ---- scored formats ----------------------------------------------------
  // The two ways a conditioning session gets a number attached to it. AMRAP
  // fixes the clock and counts your rounds; For Time fixes the work and
  // counts the clock. Both need the runner's scoring mode, not a timeline —
  // there is no per-station schedule to walk when you set the pace.
  // This is Cindy. It was shipped as a generic "20-Minute AMRAP" one commit
  // ago, before the benchmarks went in — and then adding Cindy alongside it
  // would have meant two identical sessions under two names. Renamed rather
  // than duplicated. The id stays put so a session already in flight against
  // it keeps resolving its circuit spec.
  S.push({
    id: "preset-amrap-20",
    name: "Cindy · 20-Minute AMRAP",
    preset: true, pillar: "conditioning", venue: ["gym", "home"],
    circuit: { mode: "amrap", capSec: 20 * 60 },
    desc: "20 min · as many rounds as possible",
    detail: "A CrossFit benchmark. Five pull-ups, ten push-ups, fifteen squats. Repeat for twenty minutes and count the rounds — tap the button each time you finish one. Pace it: the first five minutes should feel too easy. Twenty rounds is a strong score; ten is a real workout.",
    exercises: [
      { exerciseId: "pull-up", name: "Pull-Up", targetSets: 1, targetReps: 5 },
      { exerciseId: "push-up", name: "Push-Up", targetSets: 1, targetReps: 10 },
      { exerciseId: "box-squat-bodyweight", name: "Box Squat (Bodyweight)", targetSets: 1, targetReps: 15 }
    ]
  });

  S.push({
    id: "preset-fortime-500",
    name: "For Time · 500 Reps",
    preset: true, pillar: "conditioning", venue: ["gym", "home"],
    circuit: { mode: "fortime", capSec: 30 * 60 },
    desc: "Fixed work · stop the clock",
    detail: "One hundred of each, broken into whatever sets you like, in any order you like. The clock runs until you stop it. Thirty-minute cap — hitting it is a result too, and it is recorded as one.",
    exercises: [
      { exerciseId: "push-up", name: "Push-Up", targetSets: 1, targetReps: 100 },
      { exerciseId: "box-squat-bodyweight", name: "Box Squat (Bodyweight)", targetSets: 1, targetReps: 100 },
      { exerciseId: "burpee", name: "Burpee", targetSets: 1, targetReps: 100 },
      { exerciseId: "hanging-leg-raise", name: "Hanging Leg Raise", targetSets: 1, targetReps: 100 },
      { exerciseId: "lunge-walking", name: "Walking Lunge", targetSets: 1, targetReps: 100 }
    ]
  });

  // ---- benchmark workouts -------------------------------------------------
  // The named CrossFit workouts exist so a score means something across time
  // and across people: "Fran in 6:12" is a sentence, "some thrusters" is not.
  // That only works if the prescription is not quietly altered, so the reps
  // and the order here are the standard ones.
  //
  // The Rx loads are named in the detail rather than pre-filled as targets.
  // Fran is 43 kg for men and 30 kg for women as written, and pre-filling that
  // for someone whose thruster is 30 kg turns a benchmark into a bad idea. The
  // number belongs in the description, where it reads as the standard; the
  // weight box stays yours.
  S.push({
    id: "preset-fran",
    name: "Fran",
    preset: true, pillar: "conditioning", venue: ["gym"],
    circuit: { mode: "fortime", capSec: 12 * 60 },
    desc: "21-15-9 · thrusters and pull-ups",
    detail: "The benchmark. Twenty-one thrusters, twenty-one pull-ups, then fifteen and fifteen, then nine and nine. Rx is 43 kg for men, 30 kg for women — scale it, and write down what you used, because the load is half of what the time means. Under five minutes is fast. It is meant to hurt in a way that is over quickly.",
    exercises: [
      // Pinned to the barbell. The thruster is barbell-or-dumbbell-or-kettlebell
      // in the library and that is correct there, but Fran is 43 kg on a bar —
      // the load is half of what the time means, so a dumbbell version is a
      // different workout wearing a name that refers to a specific one.
      { exerciseId: "thruster", name: "Thruster", repScheme: [21, 15, 9], gear: ["barbell"] },
      { exerciseId: "pull-up", name: "Pull-Up", repScheme: [21, 15, 9] }
    ]
  });

  S.push({
    id: "preset-murph",
    name: "Murph",
    preset: true, pillar: "conditioning", venue: ["gym", "outdoors"],
    circuit: { mode: "fortime", capSec: 75 * 60 },
    desc: "2 × 1 mile · 100 / 200 / 300",
    detail: "A mile, then a hundred pull-ups, two hundred push-ups, three hundred squats, then another mile. Almost everyone partitions the middle into twenty rounds of five, ten and fifteen — that is standard, not scaling. Rx adds a 20 lb vest; the app has no vest field, so note it in the session notes if you wore one. Expect 45 to 60 minutes without a vest.",
    exercises: [
      // Two sets of one mile, not one row of two: the runs bookend the session
      // and are logged as the two separate efforts they are. Pinned to no gear
      // because Murph is a road mile — leaving the exercise's cardio-machine
      // option in put a "Cardio machine" chip on a session tagged Outdoors.
      { exerciseId: "run", name: "Run", targetSets: 2, targetDistanceKm: 1.61, targetIntensity: "hard", gear: ["none"] },
      { exerciseId: "pull-up", name: "Pull-Up", targetSets: 1, targetReps: 100 },
      { exerciseId: "push-up", name: "Push-Up", targetSets: 1, targetReps: 200 },
      { exerciseId: "box-squat-bodyweight", name: "Air Squat", targetSets: 1, targetReps: 300 }
    ]
  });

  // ---- barbell cycling ----------------------------------------------------
  // Grace and Isabel are thirty reps of one lift at a fixed load, for time.
  // There is no pacing puzzle and no second movement to hide in: the only
  // variable is how you break the thirty up, which is what barbell cycling
  // means. Log the sets you actually did — 10/8/7/5 is a different workout
  // from 30 unbroken and the record should show which one happened.
  //
  // Both are pinned to the barbell. A dumbbell version is a fine workout and
  // is not Grace, and the whole point of a named benchmark is that the number
  // compares.
  S.push({
    id: "preset-grace",
    name: "Grace",
    preset: true, pillar: "conditioning", venue: ["gym"],
    circuit: { mode: "fortime", capSec: 12 * 60 },
    desc: "30 clean & jerks · for time",
    detail: "Thirty clean and jerks. Rx is 61 kg for men, 43 kg for women. Under three minutes is quick, and most people land between four and eight. Singles on a running clock beat a big first set you cannot repeat — pick a pace you can hold from rep one and do not let the bar rest on the floor.",
    exercises: [
      { exerciseId: "clean-and-jerk", name: "Clean and Jerk", targetSets: 1, targetReps: 30, gear: ["barbell"] }
    ]
  });

  S.push({
    id: "preset-isabel",
    name: "Isabel",
    preset: true, pillar: "conditioning", venue: ["gym"],
    circuit: { mode: "fortime", capSec: 12 * 60 },
    desc: "30 snatches · for time",
    detail: "Thirty snatches, same loads as Grace — 61 kg and 43 kg. Technically the harder of the two, because a tired snatch is a missed snatch rather than a slow one. Drop the bar from overhead between reps if that keeps the positions honest; the clock does not care how it gets back down.",
    exercises: [
      { exerciseId: "snatch", name: "Barbell Snatch", targetSets: 1, targetReps: 30, gear: ["barbell"] }
    ]
  });

  S.push({
    id: "preset-dt",
    name: "DT",
    preset: true, pillar: "conditioning", venue: ["gym"],
    circuit: { mode: "fortime", capSec: 20 * 60 },
    desc: "5 rounds · 12-9-6 on one bar",
    detail: "Five rounds of twelve deadlifts, nine hang power cleans and six push jerks, at 70 kg for men and 47.5 kg for women. The bar should not need to touch the floor between the cleans and the jerks — that transition is the workout. A hero WOD, named for a fallen airman.",
    exercises: [
      { exerciseId: "deadlift-conventional", name: "Conventional Deadlift", targetSets: 5, targetReps: 12, gear: ["barbell"] },
      { exerciseId: "hang-clean-power", name: "Hang Power Clean", targetSets: 5, targetReps: 9 },
      { exerciseId: "push-jerk", name: "Push Jerk", targetSets: 5, targetReps: 6 }
    ]
  });

  // ---- complexes ----------------------------------------------------------
  // One bar, one load, a fixed sequence. The complex is a single exercise as
  // far as the log is concerned — the sequence lives on the exercise itself —
  // so these sessions only have to say how many rounds and how to load them.
  S.push({
    id: "preset-bear-complex",
    name: "The Bear Complex",
    preset: true, pillar: "strength", venue: ["gym"],
    desc: "5 rounds of 7 · going up",
    detail: "Seven unbroken reps is one round; five rounds, adding weight each time, and the fifth should be the heaviest you can complete. Rest as long as you need between rounds — the round itself is the hard part. Log the load you finished each round with; the app counts the reps but cannot see whether the bar stayed off the floor.",
    exercises: [
      { exerciseId: "bear-complex", name: "Bear Complex", targetSets: 5, targetReps: 7 }
    ]
  });

  S.push({
    id: "preset-clean-emom",
    name: "Clean Complex EMOM",
    preset: true, pillar: "strength", venue: ["gym"],
    // An actual EMOM, not a name. Ten one-minute slots is exactly ten minutes,
    // and the runner will call each one — which is the entire mechanism of the
    // format. Without this the session said EMOM in its title and nothing in
    // the data agreed, so the card estimated it at 35 minutes.
    circuit: { mode: "emom", rounds: 10, slotSec: 60 },
    desc: "10 min · one complex a minute",
    detail: "Every minute on the minute for ten minutes: one power clean, one front squat, one push jerk, without putting the bar down. Start around 60% of your clean and add a little every couple of minutes. Stop adding the moment the front squat stops being easy to stand up — the clock keeps running either way.",
    exercises: [
      { exerciseId: "clean-complex", name: "Clean Complex", targetSets: 10, targetReps: 1 }
    ]
  });

  // ---- the Hyrox race -----------------------------------------------------
  // Eight kilometres of running and eight stations, run alternately: 1 km,
  // station, 1 km, station, and so on. The list below cannot interleave them —
  // an exercise appears once — so the running is one entry of eight kilometre
  // repeats and the order lives in the detail. For Time does not schedule
  // anything anyway; it times what you do.
  S.push({
    id: "preset-hyrox-sim",
    name: "Hyrox Simulation",
    preset: true, pillar: "conditioning", venue: ["gym"],
    circuit: { mode: "fortime", capSec: 120 * 60 },
    desc: "8 km · 8 stations · one clock",
    // Six of the eight stations are prescribed as a distance, and the app logs
    // reps or seconds. The targets below are therefore estimates of what those
    // distances cost — they are not the standard, and presenting them as if
    // they were would quietly redefine the race. The real prescription is
    // written out here, in the units the race uses.
    detail: "The full race. Run 1 km, then a station, and repeat until all eight are done. In order: ski erg 1000 m, sled push 50 m, sled pull 50 m, burpee broad jumps 80 m, row 1000 m, farmer's carry 200 m, sandbag lunges 100 m, wall balls 100 reps. The station targets on the rows are rough estimates of what those distances take — the distances above are the actual standard, so log what you really did. The runs appear as eight one-kilometre efforts because a session lists each exercise once; do them where they belong. Ninety minutes is a respectable first attempt and the clock does not stop between stations.",
    exercises: [
      // Same as Murph: the race is run on a course, not a treadmill, so the
      // machine option does not belong on the card.
      { exerciseId: "run", name: "Run", targetSets: 8, targetDistanceKm: 1, targetIntensity: "hard", gear: ["none"] },
      { exerciseId: "ski-erg", name: "Ski Erg", targetSets: 1, targetDistanceKm: 1 },
      { exerciseId: "sled-push", name: "Sled Push", targetSets: 1, targetSeconds: 90 },
      { exerciseId: "sled-pull", name: "Sled Pull", targetSets: 1, targetSeconds: 120 },
      { exerciseId: "burpee-broad-jump", name: "Burpee Broad Jump", targetSets: 1, targetReps: 40 },
      { exerciseId: "rowing", name: "Rowing (Erg)", targetSets: 1, targetDistanceKm: 1 },
      { exerciseId: "farmers-carry", name: "Farmer's Carry", targetSets: 1, targetSeconds: 120 },
      { exerciseId: "sandbag-lunge", name: "Sandbag Lunge", targetSets: 1, targetReps: 100 },
      { exerciseId: "wall-ball", name: "Wall Ball", targetSets: 1, targetReps: 100 }
    ]
  });

  S.push({
    // Named "Sled & Carry Circuit" until now, and there was never a sled in
    // it — farmer's carry, swings and burpees. Harmless while the library had
    // no sled at all; actively misleading now that it does, since the name
    // promises a station this session does not contain. Renamed rather than
    // rebuilt: adding a sled would make it need one, and hide a session that
    // home users can currently do.
    id: "preset-sled-carry",
    name: "Carry & Swing Circuit",
    preset: true, pillar: "conditioning", venue: ["gym", "home"],
    circuit: { rounds: 5, workSec: 45, transitionSec: 20, restSec: 60 },
    desc: "5 rounds · carries and swings",
    detail: "Loaded carries and swings back to back. Rest as needed between rounds, but keep the grip working — that's usually what gives out first.",
    exercises: [
      { exerciseId: "farmers-carry", name: "Farmer's Carry", targetSets: 5, targetSeconds: 45 },
      { exerciseId: "kettlebell-swing", name: "Kettlebell Swing", targetSets: 5, targetReps: 15 },
      { exerciseId: "burpee", name: "Burpee", targetSets: 5, targetReps: 10 }
    ]
  });

  S.push({
    id: "preset-hill-sprints",
    name: "Hill Sprints",
    preset: true, pillar: "conditioning", venue: ["outdoors"],
    desc: "10 × 20 s uphill, walk down",
    detail: "Find a hill steep enough that you have to work but shallow enough to run properly on. Twenty seconds up hard, walk back down, go again. The gradient caps your speed, which is what makes this far kinder on the hamstrings than flat sprinting.",
    exercises: [{
      exerciseId: "run", name: "Hill Sprint",
      intervals: {
        steps: [
          ...warmup(10),
          ...times(10, [step(20, "max", "Uphill"), step(100, "easy", "Walk down", false)]),
          ...cooldown(5)
        ]
      }
    }]
  });

  S.push({
    id: "preset-fartlek",
    name: "Fartlek Run",
    preset: true, pillar: "conditioning", venue: ["outdoors"],
    desc: "30 min of unstructured surges",
    detail: "Swedish for “speed play”, and that's the whole idea. Run easy, then pick a landmark and push to it — a lamppost, the top of a rise, the next corner. No watch-watching. This is the session for when structured intervals feel like a chore.",
    exercises: [{
      exerciseId: "run", name: "Running",
      intervals: {
        steps: [
          ...warmup(8),
          ...times(6, [
            step(60, "moderate", "Surge"),
            step(90, "easy", "Float", false),
            step(30, "hard", "Push"),
            step(120, "easy", "Easy", false)
          ]),
          ...cooldown(5)
        ]
      }
    }]
  });

  S.push({
    id: "preset-stair-repeats",
    name: "Stair Repeats",
    preset: true, pillar: "conditioning", venue: ["outdoors", "gym"],
    desc: "8 × up hard, walk down",
    detail: "A long flight of steps is one of the best conditioning tools going and it's free. Run or march up hard, walk down as the recovery. Watch your feet on the way down — that's where people come unstuck.",
    exercises: [{
      exerciseId: "run", name: "Stair Repeat",
      intervals: {
        steps: [
          ...warmup(8),
          ...times(8, [step(45, "hard", "Up"), step(90, "easy", "Walk down", false)]),
          ...cooldown(5)
        ]
      }
    }]
  });

  S.push({
    id: "preset-carry-walk",
    name: "Loaded Carry Walk",
    preset: true, pillar: "conditioning", venue: ["outdoors", "gym"],
    desc: "6 × 60 s carry, walk between",
    detail: "Pick the weight up, walk until the grip starts to go, put it down and keep walking. Simple, unglamorous, and it builds a torso that holds together under load better than most gym work.",
    exercises: [
      { exerciseId: "farmers-carry", name: "Farmer's Carry", targetSets: 6, targetSeconds: 60 },
      { exerciseId: "kb-front-rack-carry", name: "Front Rack Carry", targetSets: 3, targetSeconds: 45 }
    ]
  });

  S.push({
    id: "preset-rower-intervals",
    name: "Rower Intervals",
    preset: true, pillar: "conditioning", venue: ["gym"],
    desc: "6 × 500 m pace, 2 min easy",
    detail: "Six efforts at roughly your 2 km pace, about ninety seconds to two minutes each depending on where you are. Full two minutes of easy paddling between — the recovery is what lets the next one be as good as the last.",
    exercises: [{
      exerciseId: "rowing", name: "Rowing (Erg)",
      intervals: {
        steps: [
          ...warmup(8),
          ...times(6, [step(105, "hard", "500 m"), step(120, "easy", "Paddle", false)]),
          ...cooldown(5)
        ]
      }
    }]
  });

  S.push({
    id: "preset-bike-sprints",
    name: "Bike Sprints",
    preset: true, pillar: "conditioning", venue: ["gym"],
    desc: "10 × 15 s all-out, 45 s easy",
    detail: "Set the resistance high enough that you can't just spin — you should have to fight the pedals. Fifteen seconds is short enough to go genuinely all-out, which is the entire point.",
    exercises: [{
      exerciseId: "cycling", name: "Cycling",
      intervals: {
        steps: [
          ...warmup(8),
          ...times(10, [step(15, "max", "Sprint"), step(45, "easy", "Spin", false)]),
          ...cooldown(5)
        ]
      }
    }]
  });

  S.push({
    id: "preset-stair-pyramid",
    name: "Stair Climber Pyramid",
    preset: true, pillar: "conditioning", venue: ["gym"],
    desc: "1-2-3-2-1 min hard, 1 min easy",
    detail: "Climbing loads the glutes in a way flat cardio doesn't, and the machine won't let you coast. Hands off the rails on the hard blocks — if you need them to hold the pace, the pace is too high.",
    exercises: [{
      exerciseId: "stair-climber", name: "Stair Climber",
      intervals: {
        steps: [
          ...warmup(5),
          ...[1, 2, 3, 2, 1].flatMap(m => [
            step(m * 60, "hard", `${m} min hard`),
            step(60, "easy", "Easy", false)
          ]),
          ...cooldown(5)
        ]
      }
    }]
  });

  S.push({
    id: "preset-jump-rope",
    name: "Jump Rope Ladder",
    preset: true, pillar: "conditioning", venue: ["home", "gym", "outdoors"],
    desc: "8 rounds, 30 s up to 60 s",
    detail: "A rope, two metres of floor and fifteen minutes. Rounds get longer as you go, so pace the early ones. Trips don't count against you — pick the rope up and carry on.",
    exercises: [{
      exerciseId: "jump-rope", name: "Jump Rope",
      intervals: {
        steps: [
          ...warmup(3),
          ...[30, 30, 45, 45, 60, 45, 45, 30].flatMap(sec => [
            step(sec, "hard", `${sec} s`),
            step(30, "easy", "Rest", false)
          ]),
          ...cooldown(3)
        ]
      }
    }]
  });

  // ---- Boxing ----
  // Rounds are the unit: three minutes on, one minute off, which is what a
  // boxing gym runs and what the guided timer already models. Each work step
  // is labelled with what to do in that round, so the runner tells you the
  // focus instead of leaving you to invent one while a clock counts down.
  //
  // Shadow first, then the bag — the order every gym uses, because throwing
  // hard at a bag cold is how wrists and shoulders get hurt. They are separate
  // exercise entries so the time lands against the right activity, and each
  // gets its own guided run.
  const boxRounds = (n, focus, intensity = "hard") =>
    Array.from({ length: n }, (_, i) => [
      step(180, intensity, focus[i % focus.length]),
      step(60, "easy", "Corner", false)
    ]).flat();

  S.push({
    id: "preset-boxing-rounds",
    name: "Boxing Rounds",
    preset: true, pillar: "conditioning", venue: ["gym", "home"],
    desc: "12 × 3 min rounds · shadow then bag",
    detail: "A full boxing session in the shape a gym actually runs it: three rounds shadow boxing to warm into it, then nine on the bag, each with a focus so you are not just hitting it. Three minutes on, one minute in the corner. If a round falls apart, finish it anyway — that is usually the round that teaches you something.",
    exercises: [
      {
        exerciseId: "shadow-boxing", name: "Shadow Boxing",
        intervals: {
          steps: [
            ...warmup(5),
            ...boxRounds(3, ["Loose — footwork only", "Jab and move", "Full combinations"], "moderate")
          ]
        }
      },
      {
        exerciseId: "heavy-bag", name: "Heavy Bag",
        intervals: {
          steps: [
            ...boxRounds(9, [
              "Jab — range and timing",
              "1-2 straight down the middle",
              "Body shots",
              "Hooks — turn the hips",
              "Free — your combinations",
              "Uppercuts on the inside",
              "Move after every combination",
              "Output — keep the hands going",
              "Last round — empty the tank"
            ]),
            ...cooldown(5)
          ]
        }
      }
    ]
  });

  S.push({
    id: "preset-shadow-rounds",
    name: "Shadow Boxing Rounds",
    preset: true, pillar: "conditioning", venue: ["home", "gym", "outdoors"],
    desc: "6 × 3 min rounds · no equipment",
    detail: "Six rounds, nothing but floor space — no bag, no gloves, no partner. Shadow boxing is where technique is actually built, because nothing absorbs a sloppy punch for you. Hands up between combinations, and move after every one.",
    exercises: [{
      exerciseId: "shadow-boxing", name: "Shadow Boxing",
      intervals: {
        steps: [
          ...warmup(4),
          ...boxRounds(6, [
            "Footwork only — no punches",
            "Jab and move",
            "1-2 with the hips",
            "Add the hook",
            "Head movement between combinations",
            "Free — keep the output up"
          ], "moderate"),
          ...cooldown(4)
        ]
      }
    }]
  });

  S.push({
    id: "preset-kb-complex",
    name: "Kettlebell Complex",
    preset: true, pillar: "conditioning", venue: ["home", "gym"],
    // A complex is unbroken inside a round — no transition, long rest after.
    circuit: { rounds: 5, workSec: 45, transitionSec: 0, restSec: 90 },
    desc: "5 rounds · swing, clean & press, snatch",
    detail: "One bell, three movements, no putting it down inside a round. Rest a full minute between rounds. Pick a bell you'd call easy for any one of these on its own — the complex does the rest.",
    exercises: [
      { exerciseId: "kettlebell-swing", name: "Kettlebell Swing", targetSets: 5, targetReps: 15 },
      { exerciseId: "kb-clean-press", name: "Kettlebell Clean & Press", targetSets: 5, targetReps: 6 },
      { exerciseId: "kb-snatch", name: "Kettlebell Snatch", targetSets: 5, targetReps: 6 },
      { exerciseId: "goblet-squat", name: "Goblet Squat", targetSets: 5, targetReps: 10 }
    ]
  });

  // ============ STRENGTH ============
  // ex(id, name, sets, reps) — strength entries expand to sets×reps targets.
  const ex = (exerciseId, name, targetSets, targetReps) => ({ exerciseId, name, targetSets, targetReps });
  /** A timed entry: planks, hollow holds and carries are seconds, not reps. */
  const held = (exerciseId, name, targetSets, targetSeconds) => ({ exerciseId, name, targetSets, targetSeconds });
  const strength = (id, name, venue, desc, detail, exercises, extra = {}) =>
    S.push({ id, name, preset: true, pillar: "strength", venue, desc, detail, exercises, ...extra });

  strength("preset-full-body-a", "Full Body A", ["gym"], "Squat · Bench · Row · 5 exercises",
    "The first of three rotating full-body days for 3×/week training. Every session hits legs, a push and a pull, so missing one day costs you less than it would on a split.",
    [
      ex("squat-back", "Barbell Back Squat", 3, 5),
      ex("bench-press-barbell", "Barbell Bench Press", 3, 5),
      ex("row-barbell", "Barbell Bent-Over Row", 3, 8),
      ex("ohp-dumbbell", "Dumbbell Shoulder Press", 2, 10),
      held("plank", "Plank", 3, 45)
    ]);

  strength("preset-full-body-b", "Full Body B", ["gym"], "Deadlift · OHP · Pulldown · 5 exercises",
    "The second full-body day. Deadlift replaces squat and pressing goes overhead, so the same muscles get worked from different angles across the week.",
    [
      ex("deadlift-conventional", "Conventional Deadlift", 3, 5),
      ex("ohp-barbell", "Barbell Overhead Press", 3, 5),
      ex("lat-pulldown", "Lat Pulldown", 3, 10),
      ex("lunge-walking", "Walking Lunge", 2, 10),
      ex("hanging-leg-raise", "Hanging Leg Raise", 3, 10)
    ]);

  strength("preset-full-body-c", "Full Body C", ["gym"], "Front squat · Incline · Chin-up · 5 exercises",
    "The third full-body day, biased toward the front squat and vertical pulling. Rotate A → B → C across the week and repeat.",
    [
      ex("squat-front", "Barbell Front Squat", 3, 5),
      ex("incline-bench-dumbbell", "Incline Dumbbell Press", 3, 8),
      ex("chin-up", "Chin-Up", 3, 6),
      ex("hip-thrust", "Barbell Hip Thrust", 3, 10),
      held("side-plank", "Side Plank", 2, 30)
    ]);

  strength("preset-upper", "Upper Body", ["gym"], "Push & pull · 6 exercises",
    "The upper half of a 4×/week upper–lower split. Two presses, two pulls and direct arm work, balanced so nothing gets left behind.",
    [
      ex("bench-press-barbell", "Barbell Bench Press", 4, 6),
      ex("row-barbell", "Barbell Bent-Over Row", 4, 8),
      ex("ohp-dumbbell", "Dumbbell Shoulder Press", 3, 10),
      ex("lat-pulldown", "Lat Pulldown", 3, 10),
      ex("curl-dumbbell", "Dumbbell Curl", 3, 12),
      ex("tricep-pushdown", "Tricep Pushdown", 3, 12)
    ]);

  strength("preset-lower", "Lower Body", ["gym"], "Squat, hinge & accessories · 6 exercises",
    "The lower half of a 4×/week upper–lower split. A squat, a hinge, single-leg work, then the smaller muscles that usually get skipped.",
    [
      ex("squat-back", "Barbell Back Squat", 4, 6),
      ex("deadlift-romanian", "Romanian Deadlift", 3, 8),
      ex("bulgarian-split-squat", "Bulgarian Split Squat", 3, 10),
      ex("leg-curl-lying", "Lying Leg Curl", 3, 12),
      ex("calf-raise-standing", "Standing Calf Raise", 4, 15),
      ex("dead-bug", "Dead Bug", 3, 10)
    ]);

  strength("preset-push", "Push Day", ["gym"], "Chest, shoulders & triceps · 6 exercises",
    "The push day of a push/pull/legs rotation. Heavy horizontal press first, then vertical, then the isolation work that finishes the job.",
    [
      ex("bench-press-barbell", "Barbell Bench Press", 4, 6),
      ex("ohp-barbell", "Barbell Overhead Press", 3, 8),
      ex("incline-bench-dumbbell", "Incline Dumbbell Press", 3, 10),
      ex("lateral-raise", "Lateral Raise", 3, 15),
      ex("tricep-pushdown", "Tricep Pushdown", 3, 12),
      ex("overhead-tricep-extension", "Overhead Tricep Extension", 3, 12)
    ]);

  strength("preset-pull", "Pull Day", ["gym"], "Back & biceps · 6 exercises",
    "The pull day of a push/pull/legs rotation. Vertical and horizontal pulling, rear delts, then curls — the mirror of push day.",
    [
      ex("pull-up", "Pull-Up", 4, 6),
      ex("row-barbell", "Barbell Bent-Over Row", 4, 8),
      ex("row-seated-cable", "Seated Cable Row", 3, 10),
      ex("face-pull", "Face Pull", 3, 15),
      ex("curl-barbell", "Barbell Biceps Curl", 3, 10),
      ex("hammer-curl", "Hammer Curl", 3, 12)
    ]);

  strength("preset-legs", "Leg Day", ["gym"], "Quads, hamstrings & glutes · 6 exercises",
    "The leg day of a push/pull/legs rotation. Squat, hinge, then quad and hamstring isolation so both sides of the thigh get direct work.",
    [
      ex("squat-back", "Barbell Back Squat", 4, 6),
      ex("deadlift-romanian", "Romanian Deadlift", 3, 8),
      ex("leg-press", "Leg Press", 3, 12),
      ex("leg-curl-lying", "Lying Leg Curl", 3, 12),
      ex("leg-extension", "Leg Extension", 3, 15),
      ex("calf-raise-seated", "Seated Calf Raise", 4, 15)
    ]);

  strength("preset-machines", "Machines Only", ["gym"], "Full body, no free weights · 6 exercises",
    "Every movement on a machine — useful when the free-weight area is packed, when you're new and would rather not fight a barbell, or on a deload where you want the work without the coordination cost.",
    [
      ex("leg-press", "Leg Press", 3, 12),
      ex("machine-chest-press", "Machine Chest Press", 3, 12),
      ex("lat-pulldown", "Lat Pulldown", 3, 12),
      ex("machine-shoulder-press", "Machine Shoulder Press", 3, 12),
      ex("leg-curl-seated", "Seated Leg Curl", 3, 12),
      ex("cable-crunch", "Cable Crunch", 3, 15)
    ]);

  strength("preset-cable-only", "Cable Only", ["gym"], "Constant tension, full body · 6 exercises",
    "One station, six movements. Cables keep tension on through the whole range, which makes them unusually kind to joints that don't love free weights on a given day.",
    [
      ex("lat-pulldown", "Lat Pulldown", 3, 12),
      ex("row-seated-cable", "Seated Cable Row", 3, 12),
      ex("cable-crossover", "Cable Crossover", 3, 15),
      ex("face-pull", "Face Pull", 3, 15),
      ex("tricep-pushdown", "Triceps Pushdown", 3, 15),
      ex("cable-crunch", "Cable Crunch", 3, 15)
    ]);

  strength("preset-dumbbell", "Dumbbell Only", ["gym", "home"], "Full body with a pair of dumbbells · 6 exercises",
    "Everything here needs one pair of dumbbells. Built for hotel gyms and home setups where that's all there is.",
    [
      ex("goblet-squat", "Goblet Squat", 3, 12),
      ex("bench-press-dumbbell", "Dumbbell Bench Press", 3, 10),
      ex("row-dumbbell", "Dumbbell Row", 3, 10),
      ex("ohp-dumbbell", "Dumbbell Shoulder Press", 3, 10),
      ex("bulgarian-split-squat", "Bulgarian Split Squat", 3, 10),
      ex("hammer-curl", "Hammer Curl", 3, 12)
    ]);

  strength("preset-bodyweight", "Bodyweight — No Equipment", ["home", "gym", "outdoors"], "Nothing but the floor · 6 exercises",
    "No equipment at all. For travel, illness, or a closed gym — the session that means you don't lose the week.",
    [
      ex("push-up", "Push-Up", 4, 12),
      ex("lunge-walking", "Walking Lunge", 3, 12),
      ex("glute-bridge", "Glute Bridge", 3, 15),
      held("plank", "Plank", 3, 45),
      held("hollow-hold", "Hollow Hold", 3, 30),
      ex("dead-bug", "Dead Bug", 3, 12)
    ]);

  strength("preset-30-min", "30-Minute Express", ["gym"], "Four compounds, in and out",
    "A deliberately short session: four compound lifts, nothing isolation. Pair the first two and the last two to save time. Built for the days you nearly skipped entirely.",
    [
      ex("squat-back", "Barbell Back Squat", 3, 8),
      ex("bench-press-barbell", "Barbell Bench Press", 3, 8),
      ex("row-barbell", "Barbell Bent-Over Row", 3, 8),
      ex("ohp-dumbbell", "Dumbbell Shoulder Press", 2, 12)
    ]);

  strength("preset-15-min", "15-Minute Minimum", ["home", "gym", "outdoors"], "Three moves, no gear, no excuse",
    "The floor of what counts as a session. Three rounds of three bodyweight movements, straight through. It is not enough to build much, but it is enough to keep the habit intact on a bad week — which is worth more.",
    [
      ex("push-up", "Push-Up", 3, 15),
      ex("bulgarian-split-squat", "Bulgarian Split Squat", 3, 12),
      held("plank", "Plank", 3, 40)
    ], { circuit: { rounds: 3, workSec: 40, transitionSec: 20, restSec: 45 } });

  strength("preset-45-min", "45-Minute Full Body", ["gym"], "Six movements, one session",
    "A middle ground between the express session and a full split day. One squat, one hinge, one push, one pull, and two accessories — enough volume to progress on if you only train twice a week.",
    [
      ex("squat-back", "Barbell Back Squat", 4, 6),
      ex("deadlift-romanian", "Romanian Deadlift", 3, 8),
      ex("bench-press-dumbbell", "Dumbbell Bench Press", 3, 10),
      ex("row-dumbbell", "Dumbbell Row", 3, 10),
      ex("lateral-raise", "Lateral Raise", 3, 15),
      ex("hanging-leg-raise", "Hanging Leg Raise", 3, 12)
    ]);

  strength("preset-deload", "Deload — Full Body", ["gym"], "Same movements, half the work",
    "A planned easy week. The same pattern as a full-body day at noticeably lighter loads and fewer sets — the point is to move well and recover, not to chase anything.",
    [
      ex("squat-back", "Barbell Back Squat", 2, 5),
      ex("bench-press-barbell", "Barbell Bench Press", 2, 5),
      ex("row-barbell", "Barbell Bent-Over Row", 2, 8),
      ex("face-pull", "Face Pull", 2, 15)
    ]);

  // ---- gym splits ----

  strength("preset-arms", "Arms Day", ["gym"], "Biceps & triceps · 6 exercises",
    "Direct arm work only. Alternate a curl and a triceps movement so one recovers while the other works — you'll get through it in half the time.",
    [
      ex("curl-barbell", "Barbell Biceps Curl", 3, 10),
      ex("skull-crusher", "Skull Crusher", 3, 10),
      ex("hammer-curl", "Hammer Curl", 3, 12),
      ex("tricep-pushdown", "Triceps Pushdown", 3, 12),
      ex("concentration-curl", "Concentration Curl", 3, 12),
      ex("overhead-tricep-extension", "Overhead Triceps Extension", 3, 12)
    ]);

  strength("preset-shoulders", "Shoulders & Delts", ["gym"], "All three heads · 6 exercises",
    "Press first while you're fresh, then hit the side and rear delts directly. Most people are front-delt dominant from pressing, so the last three movements matter more than the first.",
    [
      ex("ohp-barbell", "Barbell Overhead Press", 4, 6),
      ex("arnold-press", "Arnold Press", 3, 10),
      ex("lateral-raise", "Lateral Raise", 4, 15),
      ex("rear-delt-fly", "Rear Delt Fly", 3, 15),
      ex("face-pull", "Face Pull", 3, 15),
      ex("shrug-barbell", "Barbell Shrug", 3, 12)
    ]);

  strength("preset-back-thickness", "Back Thickness", ["gym"], "Rows before pulls · 6 exercises",
    "Horizontal pulling first, which is what actually builds the mid-back. Vertical work and rear delts after. If your posture bothers you, this is the session to run twice a week.",
    [
      ex("row-barbell", "Barbell Bent-Over Row", 4, 8),
      ex("t-bar-row", "T-Bar Row", 3, 10),
      ex("row-seated-cable", "Seated Cable Row", 3, 12),
      ex("lat-pulldown", "Lat Pulldown", 3, 12),
      ex("pullover", "Dumbbell Pullover", 3, 12),
      ex("face-pull", "Face Pull", 3, 20)
    ]);

  strength("preset-chest-triceps", "Chest & Triceps", ["gym"], "Press, fly, extend · 6 exercises",
    "A classic pairing — the triceps are already warm from pressing, so they take the isolation work well. Flat, incline, then flies to finish the chest off.",
    [
      ex("bench-press-barbell", "Barbell Bench Press", 4, 6),
      ex("incline-bench-dumbbell", "Incline Dumbbell Press", 3, 10),
      ex("dumbbell-fly", "Dumbbell Fly", 3, 12),
      ex("dips-chest", "Chest Dip", 3, 10),
      ex("tricep-pushdown", "Triceps Pushdown", 3, 12),
      ex("skull-crusher", "Skull Crusher", 3, 12)
    ]);

  strength("preset-glutes-hams", "Glutes & Hamstrings", ["gym"], "Hinge-led posterior chain · 6 exercises",
    "The back of the legs, trained properly. Hip thrusts and RDLs do the heavy lifting; the leg curl and Nordic cover the knee-flexion side that hinging alone misses.",
    [
      ex("hip-thrust", "Barbell Hip Thrust", 4, 10),
      ex("deadlift-romanian", "Romanian Deadlift", 4, 8),
      ex("leg-curl-lying", "Lying Leg Curl", 3, 12),
      ex("bulgarian-split-squat", "Bulgarian Split Squat", 3, 10),
      ex("nordic-curl", "Nordic Hamstring Curl", 3, 6),
      ex("calf-raise-standing", "Standing Calf Raise", 4, 15)
    ]);

  // ---- resistance bands ----

  strength("preset-band-full-body", "Bands — Full Body", ["home", "gym", "outdoors"], "One band, whole body · 6 exercises",
    "A set of bands weighs nothing and fits in a drawer, and this session proves that's enough. Bands are hardest at the top of the range rather than the bottom, so control the return — that's where most of the work is.",
    [
      ex("band-squat", "Band Squat", 3, 15),
      ex("band-chest-press", "Band Chest Press", 3, 15),
      ex("band-row", "Band Seated Row", 3, 15),
      ex("band-rdl", "Band Romanian Deadlift", 3, 15),
      ex("band-overhead-press", "Band Overhead Press", 3, 12),
      ex("band-woodchop", "Band Woodchop", 3, 12)
    ]);

  strength("preset-band-upper", "Bands — Upper Body", ["home", "gym", "outdoors"], "Push, pull & arms · 6 exercises",
    "Everything above the waist with a band and a door anchor. Higher reps than a barbell session — aim for the point where the last two or three get genuinely hard rather than counting to a number.",
    [
      ex("band-chest-press", "Band Chest Press", 3, 15),
      ex("band-pulldown", "Band Lat Pulldown", 3, 15),
      ex("band-overhead-press", "Band Overhead Press", 3, 12),
      ex("band-row", "Band Seated Row", 3, 15),
      ex("band-curl", "Band Biceps Curl", 3, 20),
      ex("band-pushdown", "Band Triceps Pushdown", 3, 20)
    ]);

  strength("preset-band-lower", "Bands — Lower Body", ["home", "gym", "outdoors"], "Legs & glutes · 5 exercises",
    "Bands can't load a squat the way a bar can, so this leans on movements where they shine — hinges, lateral work and the glute medius, which barely gets touched by heavy bilateral lifting anyway.",
    [
      ex("band-squat", "Band Squat", 4, 20),
      ex("band-rdl", "Band Romanian Deadlift", 4, 15),
      ex("band-lateral-walk", "Band Lateral Walk", 3, 20),
      ex("glute-bridge", "Glute Bridge", 3, 20),
      ex("bulgarian-split-squat", "Bulgarian Split Squat", 3, 12)
    ]);

  strength("preset-band-travel", "Bands — Travel Kit", ["home", "outdoors"], "20 minutes, one band, any room",
    "The hotel-room session. Four movements, three rounds, no anchor point needed beyond your own feet. Built so that a week away doesn't turn into a week off.",
    [
      ex("band-squat", "Band Squat", 3, 20),
      ex("band-row", "Band Seated Row", 3, 15),
      ex("band-overhead-press", "Band Overhead Press", 3, 12),
      ex("push-up", "Push-Up", 3, 15)
    ]);

  // ---- kettlebell ----

  strength("preset-kb-basics", "Kettlebell Basics", ["home", "gym"], "Swing, squat, press, carry · 5 exercises",
    "The four things a single kettlebell does better than anything else its size. Learn the hinge on the swings before you add load anywhere else — everything here is built on it.",
    [
      ex("kettlebell-swing", "Kettlebell Swing", 4, 15),
      ex("goblet-squat", "Goblet Squat", 3, 12),
      ex("kb-clean-press", "Kettlebell Clean & Press", 3, 8),
      held("kb-front-rack-carry", "Front Rack Carry", 3, 45),
      ex("kb-halo", "Kettlebell Halo", 2, 10)
    ]);

  strength("preset-kb-getup", "Turkish Get-Up Practice", ["home", "gym"], "Skill work · 4 exercises",
    "The get-up is a skill session disguised as a lift. Go light, go slow, and treat every rep as practice rather than training. Five a side is plenty.",
    [
      ex("kb-turkish-getup", "Turkish Get-Up", 5, 1),
      ex("kb-halo", "Kettlebell Halo", 3, 10),
      ex("kettlebell-swing", "Kettlebell Swing", 3, 12),
      held("side-plank", "Side Plank", 3, 30)
    ]);

  // ---- home & outdoors, no gear ----

  strength("preset-bodyweight-emom", "Bodyweight EMOM", ["home", "outdoors", "gym"], "20 min · every minute on the minute",
    "Four movements on a rotation, one per minute, for twenty minutes. Whatever's left of the minute is your rest, which means going faster only buys you more recovery — pace it honestly.",
    [
      ex("push-up", "Push-Up", 5, 12),
      ex("lunge-walking", "Walking Lunge", 5, 16),
      ex("burpee", "Burpee", 5, 8),
      held("hollow-hold", "Hollow Hold", 5, 30)
    ], { circuit: { mode: "emom", rounds: 5, slotSec: 60 } });

  strength("preset-bw-push-pull", "Bodyweight Push & Pull", ["home", "gym", "outdoors"], "Bar + floor · 6 exercises",
    "A pull-up bar turns bodyweight training from a leg-and-push affair into a complete session. If you can't do a full pull-up yet, log negatives here — they still count.",
    [
      ex("pull-up", "Pull-Up", 4, 6),
      ex("push-up", "Push-Up", 4, 15),
      ex("chin-up", "Chin-Up", 3, 8),
      ex("tricep-dip", "Triceps Dip", 3, 10),
      ex("hanging-leg-raise", "Hanging Leg Raise", 3, 10),
      held("hollow-hold", "Hollow Hold", 3, 30)
    ]);

  strength("preset-small-space", "Small Space — No Jumping", ["home"], "Quiet, one mat, 6 exercises",
    "Built for a flat with neighbours below and about two square metres of floor. Nothing here jumps, thuds or needs a run-up, and it still gets the legs and core properly.",
    [
      ex("bulgarian-split-squat", "Bulgarian Split Squat", 3, 12),
      ex("glute-bridge", "Glute Bridge", 3, 20),
      ex("push-up", "Push-Up", 3, 15),
      ex("dead-bug", "Dead Bug", 3, 12),
      held("side-plank", "Side Plank", 3, 30),
      ex("nordic-curl", "Nordic Hamstring Curl", 3, 5)
    ]);

  strength("preset-park-circuit", "Park Bench Circuit", ["outdoors"], "4 rounds · a bench and the grass",
    "Everything here uses a park bench or the ground. Four rounds, minimal rest, walk a lap between them. Good for the days when being outside is half the reason you're training.",
    [
      ex("step-up", "Step-Up", 4, 12),
      ex("push-up", "Push-Up", 4, 15),
      ex("tricep-dip", "Triceps Dip", 4, 12),
      ex("bulgarian-split-squat", "Bulgarian Split Squat", 4, 10),
      ex("burpee", "Burpee", 4, 10),
      held("plank", "Plank", 4, 45)
    ], { circuit: { rounds: 4, workSec: 40, transitionSec: 15, restSec: 60 } });

  // ============ RECOVERY ============
  const recovery = (id, name, venue, desc, detail, exercises) =>
    S.push({ id, name, preset: true, pillar: "recovery", venue, desc, detail, exercises });
  /** A single timed stretch. Forty-five seconds is the flow default. */
  const hold = (exerciseId, name, targetSeconds = 45) => ({ exerciseId, name, targetSets: 1, targetSeconds });

  recovery("preset-mobility-flow", "Mobility Flow", ["home", "gym"], "8 stretches · ~12 min",
    "A full-body flow through the areas that tighten most. Hold each for around forty-five seconds and breathe — this is the session to do on a rest day or after a hard week.",
    [
      hold("mob-cat-cow", "Cat-Cow"),
      hold("mob-worlds-greatest", "World's Greatest Stretch"),
      hold("mob-hip-flexor-kneel", "Kneeling Hip Flexor Stretch"),
      hold("mob-pigeon", "Pigeon Pose"),
      hold("mob-hamstring-seated", "Seated Hamstring Stretch"),
      hold("mob-thoracic-rotation", "Thoracic Rotation (Open Book)"),
      hold("mob-doorway-chest", "Doorway Chest Stretch"),
      hold("mob-childs-pose", "Child's Pose")
    ]);

  recovery("preset-hip-ankle", "Hip & Ankle Mobility", ["home", "gym"], "7 stretches · ~12 min",
    "The two joints that quietly limit everything below the waist. Stiff ankles turn a squat into a good morning, and stiff hips send the work into the lower back. Worth doing before a leg day, not just after.",
    [
      hold("mob-ankle-rocks", "Ankle Rocks"),
      hold("mob-90-90-hip", "90/90 Hip Stretch"),
      hold("mob-couch-stretch", "Couch Stretch"),
      hold("mob-pigeon", "Pigeon Pose"),
      hold("mob-butterfly", "Butterfly Stretch"),
      hold("mob-calf-wall", "Standing Calf Stretch"),
      hold("mob-hip-circles", "Standing Hip Circles")
    ]);

  recovery("preset-back-care", "Lower-Back Care", ["home"], "7 movements · ~12 min",
    "For a back that aches rather than one that's injured — if something is genuinely wrong, see someone qualified. This is gentle spinal movement plus the bracing work that usually prevents the ache coming back.",
    [
      hold("mob-cat-cow", "Cat-Cow"),
      hold("mob-childs-pose", "Child's Pose"),
      hold("mob-cobra", "Cobra Stretch"),
      hold("mob-figure-4-supine", "Supine Figure-4 Stretch"),
      hold("mob-thread-needle", "Thread the Needle"),
      ex("dead-bug", "Dead Bug", 3, 10),
      held("side-plank", "Side Plank", 3, 30)
    ]);

  recovery("preset-shoulder-prehab", "Shoulder Prehab", ["home", "gym"], "6 movements · ~10 min",
    "Ten minutes that keeps pressing pain-free. High reps, light band, no grinding — if a movement pinches, shorten the range rather than pushing through it.",
    [
      ex("band-pull-apart", "Band Pull-Apart", 3, 20),
      hold("mob-scap-wall-slide", "Scapular Wall Slides"),
      hold("mob-arm-circles", "Arm Circles"),
      hold("mob-doorway-chest", "Doorway Chest Stretch"),
      hold("mob-shoulder-cross-body", "Cross-Body Shoulder Stretch"),
      hold("mob-thoracic-rotation", "Thoracic Rotation (Open Book)")
    ]);

  recovery("preset-wind-down", "Wind-Down & Breathing", ["home"], "6 holds · ~10 min",
    "The last thing before bed on a heavy day. Long holds, nose breathing, nothing that raises the heart rate. It won't make you fitter, but it will help you sleep, and that will.",
    [
      hold("mob-childs-pose", "Child's Pose"),
      hold("mob-figure-4-supine", "Supine Figure-4 Stretch"),
      hold("mob-butterfly", "Butterfly Stretch"),
      hold("mob-fold-standing", "Standing Forward Fold"),
      hold("mob-neck-lateral", "Lateral Neck Stretch"),
      hold("mob-cat-cow", "Cat-Cow")
    ]);

  recovery("preset-active-recovery", "Active Recovery", ["gym", "outdoors"], "25 min easy",
    "Deliberately easy movement to push blood around without adding fatigue. If you're working hard enough to notice, you're going too hard.",
    [{
      exerciseId: "cycling", name: "Cycling",
      intervals: { steps: [step(25 * 60, "easy", "Easy spin")] }
    }]);

  recovery("preset-core-finisher", "Core & Anti-Rotation", ["gym", "home"], "5 exercises · ~10 min",
    "A short finisher built around bracing and resisting rotation rather than crunching. Do it at the end of a session or on its own.",
    [
      ex("pallof-press", "Pallof Press", 3, 12),
      ex("dead-bug", "Dead Bug", 3, 10),
      held("side-plank", "Side Plank", 3, 30),
      held("hollow-hold", "Hollow Hold", 3, 30),
      ex("ab-wheel", "Ab Wheel Rollout", 3, 8)
    ]);

  recovery("preset-grip", "Grip & Forearms", ["gym", "home"], "4 exercises · ~10 min",
    "Direct grip and forearm work — usually the first thing to fail on heavy pulls, and almost never trained on purpose.",
    [
      held("farmers-carry", "Farmer's Carry", 4, 45),
      ex("wrist-curl", "Wrist Curl", 3, 15),
      ex("hammer-curl", "Hammer Curl", 3, 12),
      ex("shrug-barbell", "Barbell Shrug", 3, 12)
    ]);

  // ---- derived gear ----------------------------------------------------
  // A session's kit requirements come from its exercises, not from a hand-typed
  // tag, so they cannot drift when a session is edited.
  //
  //   needs — one OR-list per exercise. You can do the session if every list
  //           has at least one item you own ("none" is always satisfied).
  //   gear  — the flat union, minus "none", for display and browse filters.
  const defsById = new Map((window.EXERCISE_DB || []).map(e => [e.id, e]));
  // Mirrors GEAR_ORDER in app.js — kept in step so a session's gear chips read
  // in the same order everywhere. A tag missing here sorts to the front rather
  // than failing, which is exactly the kind of quiet drift worth avoiding.
  const GEAR_ORDER = ["none", "band", "dumbbell", "kettlebell", "barbell", "pullup-bar",
    "dip-bars", "jump-rope", "ab-wheel", "machine", "cable", "cardio-machine",
    "sled", "sandbag", "med-ball", "heavy-bag", "focus-pads"];

  for (const s of S) {
    const needs = [];
    const all = new Set();
    for (const e of (s.exercises || [])) {
      const def = defsById.get(e.exerciseId);
      // Mirrors sessionMeta in app.js. An entry may narrow the exercise's gear
      // options — never widen them — so a session whose prescription names a
      // specific implement asks for that one. Kept in step with app.js; the
      // suite fails if the two derivations disagree.
      const g = (e.gear && e.gear.length) ? e.gear
        : ((def && def.gear && def.gear.length) ? def.gear : ["none"]);
      needs.push(g);
      for (const x of g) all.add(x);
    }
    s.needs = needs;
    s.gear = [...all].filter(x => x !== "none")
      .sort((a, b) => GEAR_ORDER.indexOf(a) - GEAR_ORDER.indexOf(b));
    // A session with no gear at all in any slot is doable anywhere, bare.
    s.bodyweightOnly = needs.every(g => g.includes("none"));
    if (!s.venue || !s.venue.length) s.venue = ["gym"];
  }

  return S;
})();
