// Disciplines: a second axis across the exercise library.
//
// `category` is a body part, and the body map depends on that — every category
// resolves to a set of zones on the figure. Calisthenics is not a body part,
// so making it a category would mean a muscle-up highlighting nothing and the
// map quietly gaining a seventh region that is not anywhere on a person.
//
// So this is a separate axis. One exercise can hold several tags, because a
// back squat genuinely is a powerlifting movement and a CrossFit movement and
// a Hyrox movement, and it is still a legs exercise on the body map.
//
// ---------------------------------------------------------------------------
// WHAT EARNS A TAG
//
// A tag is only worth having if it narrows the library. "Bodybuilding" would
// match about 110 of 151 exercises, which is not a filter, it is a mood — so
// it is not here. Each of these four answers a question someone actually asks
// the search box, and each returns a set small enough to scan.
//
// Membership is judgement, not derivation. It cannot be computed from `gear`:
// a barbell squat is powerlifting and a barbell curl is not, and both are
// `gear: ["barbell"]`. So the lists are written out, and the suite checks that
// every id resolves and that no tag has swallowed the library.
//
// Where a discipline's real roster is bigger than what the library holds, the
// `missing` note says so rather than letting the short list imply completeness.
// ---------------------------------------------------------------------------

window.DISCIPLINES = [
  {
    id: "calisthenics",
    label: "Calisthenics",
    blurb: "Bodyweight strength and skill work, most of it on a bar or the floor.",
    exercises: [
      // pushing
      "push-up", "incline-push-up", "knee-push-up", "diamond-push-up",
      "archer-push-up", "one-arm-push-up", "bench-dip", "band-assisted-dip",
      "tricep-dip", "dips-chest", "straight-bar-dip",
      // pulling
      "dead-hang", "inverted-row", "negative-pull-up", "pull-up", "chin-up",
      "chest-to-bar-pull-up", "explosive-pull-up", "muscle-up",
      // legs
      "box-squat-bodyweight", "assisted-pistol-squat", "pistol-squat", "nordic-curl",
      // core and skills
      "plank", "side-plank", "hollow-hold", "dead-bug", "hanging-leg-raise",
      "tuck-front-lever", "advanced-tuck-front-lever", "straddle-front-lever", "front-lever",
      "pike-hold", "wall-handstand", "freestanding-handstand"
    ]
  },

  {
    id: "powerlifting",
    label: "Powerlifting",
    blurb: "The three competition lifts and the accessories that most directly feed them.",
    missing: "Competition-standard variations — paused bench, comp-stance squat, sumo deadlift — are not in the library yet.",
    exercises: [
      // the three
      "squat-back", "bench-press-barbell", "deadlift-conventional",
      // direct accessories
      "squat-front", "incline-bench-barbell", "decline-bench-press",
      "deadlift-romanian", "ohp-barbell", "row-barbell", "t-bar-row",
      "hip-thrust", "leg-press", "bulgarian-split-squat", "shrug-barbell",
      "skull-crusher", "curl-barbell", "pull-up", "plank"
    ]
  },

  {
    id: "crossfit",
    label: "CrossFit",
    blurb: "Olympic lifts, gymnastics and the conditioning movements benchmark workouts are built from.",
    missing: "Fran, Cindy and Murph are in Sessions now. The Olympic lifts are here as single movements, but the complexes and the barbell cycling that benchmark workouts are really built on are not.",
    exercises: [
      "clean-power", "snatch", "clean-and-press", "thruster", "kettlebell-swing",
      "burpee", "burpee-broad-jump", "pull-up", "chin-up", "chest-to-bar-pull-up", "muscle-up",
      "push-up", "wall-ball",
      "dips-chest", "box-squat-bodyweight", "squat-front", "squat-back",
      "deadlift-conventional", "ohp-barbell", "wall-handstand", "hanging-leg-raise",
      "rowing", "ski-erg", "run", "jump-rope", "farmers-carry", "kb-snatch"
    ]
  },

  {
    id: "hyrox",
    label: "Hyrox",
    blurb: "The running and all eight stations, plus the work that feeds them.",
    // The previous note said five stations were missing. It was six — the
    // burpee broad jump is its own movement and the plain burpee was standing
    // in for it. All eight are in the library now; what is still absent is the
    // competition detail, not the movements.
    missing: "All eight stations are here, but not the race rules — the roxzone, the sled weights by division, or the penalty box.",
    exercises: [
      "run", "rowing", "ski-erg", "sled-push", "sled-pull", "burpee-broad-jump",
      "farmers-carry", "sandbag-lunge", "wall-ball",
      "kb-front-rack-carry", "burpee", "lunge-walking", "kettlebell-swing",
      "thruster", "step-up"
    ]
  }
];
