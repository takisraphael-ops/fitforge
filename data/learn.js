// The Learning Centre's content: articles, and the glossary that powers both
// the glossary page and the tap-to-explain popovers.
//
// Two sources. The training articles and every glossary term were written for
// Baseline (github.com/takisraphael-ops/baseline) and are ported here; the
// nutrition articles are new. Baseline is a fixed twelve-week programme that
// computes your next target and deloads a stalled lift by itself, so its prose
// promised things FitForge does not do. Those claims were rewritten rather
// than copied — if you port more from that repo, read it for 'the app does X'
// before shipping it.
//
// The nutrition half explains numbers this app already shows you and stops
// there. No target weights, no rates of loss, no meal plans. LEARN_NUTRITION_NOTE
// renders above that section and is not optional.
//
// A term's `auto` flag says it is safe to auto-link in prose. Ordinary words
// that happen to have a gym meaning — set, rep, block, volume, machine — are
// off, because linking every 'set' turns a paragraph into a minefield.

window.LEARN_GROUP_LABELS = {
  "session": "While you are training",
  "programme": "Planning and progress",
  "cardio": "Cardio and conditioning",
  "exercise": "Kinds of exercise"
};

window.LEARN_NUTRITION_NOTE =
  "These articles explain general principles and the numbers this app calculates. They are not medical, dietary or personal advice, and none of it is tailored to you. For anything specific to your health, or if you have or have had a condition affecting how you eat, speak to a doctor or a registered dietitian.";

window.LEARN_TERMS = [
  {
    "id": "rep",
    "label": "Rep",
    "short": "One repetition. Lifting the weight and lowering it once.",
    "group": "session"
  },
  {
    "id": "set",
    "label": "Set",
    "short": "A group of reps done back to back, then a rest. \"3 × 10\" means three sets of ten reps.",
    "group": "session"
  },
  {
    "id": "primer",
    "label": "Primer",
    "short": "One or two deliberately light sets at the start, to find the muscle before you load it. Not meant to be hard, and never counted.",
    "group": "session",
    "more": "pre-exhaustion"
  },
  {
    "id": "main-lift",
    "label": "Main lift",
    "short": "The most important exercise of the session, done while you are freshest.",
    "group": "session"
  },
  {
    "id": "accessory",
    "label": "Accessory",
    "short": "Supporting work after the main lifts. Smaller muscles, usually a bit lighter.",
    "group": "session"
  },
  {
    "id": "finisher",
    "label": "Finisher",
    "short": "The last exercise for a muscle, done when you are already tired.",
    "group": "session"
  },
  {
    "id": "superset",
    "label": "Superset",
    "short": "Two exercises done back to back with no rest between them. Yours pair opposite muscles, so each one rests while the other works — which saves you time for free.",
    "group": "session",
    "more": "supersets",
    "aliases": [
      "supersets",
      "superset them",
      "supersetted"
    ],
    "auto": true
  },
  {
    "id": "drop-set",
    "label": "Drop set",
    "short": "Take a set close to your limit, immediately strip 20 to 30% of the weight, and keep going without resting. A way to make a muscle work past where it would normally stop.",
    "group": "session",
    "more": "drop-sets",
    "aliases": [
      "drop sets",
      "dropset",
      "dropsets"
    ],
    "auto": true
  },
  {
    "id": "ramp-up-sets",
    "label": "Ramp-up sets",
    "short": "Light rehearsal sets before your first real one — roughly half the weight, then 70%, then 85%. Never logged, never counted.",
    "group": "session",
    "more": "warming-up",
    "aliases": [
      "ramp-up set",
      "ramp up sets",
      "warm-up sets"
    ],
    "auto": true
  },
  {
    "id": "movement-prep",
    "label": "Movement prep",
    "short": "Three minutes of drills that open the specific joints you are about to load. Different from a walk, which only warms you up in general.",
    "group": "session",
    "more": "warming-up",
    "auto": true
  },
  {
    "id": "hard-set",
    "label": "Hard set",
    "short": "A working set taken close to your limit. The count of these per week is the number that predicts whether muscle gets built — not calories burned.",
    "group": "session",
    "more": "progressive-overload",
    "aliases": [
      "hard sets"
    ],
    "auto": true
  },
  {
    "id": "rir",
    "label": "Reps in reserve",
    "short": "How many more reps you could have done if someone made you. Stopping with about 2 in reserve is the target — hard, but not to failure.",
    "group": "session",
    "more": "rir",
    "aliases": [
      "RIR"
    ],
    "auto": true
  },
  {
    "id": "pre-exhaustion",
    "label": "Pre-exhaustion",
    "short": "Tiring a muscle with an isolation exercise immediately before a big lift that uses it. A real technique, but it makes you weaker on the lift that matters, so it is worth saving until your technique is solid.",
    "group": "session",
    "more": "pre-exhaustion",
    "aliases": [
      "pre-exhausting",
      "pre-exhaust",
      "pre-exhausted"
    ],
    "auto": true
  },
  {
    "id": "block",
    "label": "Block",
    "short": "A four-week chunk of the twelve. Each one has a different job, and new techniques unlock as you reach it.",
    "group": "programme"
  },
  {
    "id": "deload",
    "label": "Deload",
    "short": "A deliberately easier week — same weights, about 40% fewer sets — so your body catches up and comes back stronger. Not a week off.",
    "group": "programme",
    "more": "deloads",
    "aliases": [
      "deloads",
      "deloaded",
      "deload week",
      "deloading"
    ],
    "auto": true
  },
  {
    "id": "progressive-overload",
    "label": "Progressive overload",
    "short": "Doing slightly more than last time — one more rep, or a little more weight. The single idea the whole plan runs on.",
    "group": "programme",
    "more": "progressive-overload",
    "auto": true
  },
  {
    "id": "double-progression",
    "label": "Double progression",
    "short": "The method behind your targets. Add reps until you hit the top of the range on every set, then add weight and drop back to the bottom.",
    "group": "programme",
    "more": "progressive-overload",
    "auto": true
  },
  {
    "id": "volume",
    "label": "Volume",
    "short": "How many hard sets a muscle gets in a week. More is better, up to a point.",
    "group": "programme",
    "more": "progressive-overload"
  },
  {
    "id": "stall",
    "label": "Stall",
    "short": "Two sessions in a row on a lift with no progress. When it happens, drop that one lift back about 10% and build it up again — there is no need to wait for a deload week.",
    "group": "programme",
    "more": "deloads",
    "aliases": [
      "stalls",
      "stalled",
      "stalling"
    ],
    "auto": true
  },
  {
    "id": "zone-2",
    "label": "Zone 2",
    "short": "Easy aerobic effort. You can hold a conversation in full sentences, but would not want to sing. It builds the base everything else runs on.",
    "group": "cardio",
    "more": "zone-2",
    "auto": true
  },
  {
    "id": "zone-4-5",
    "label": "Zones 4 and 5",
    "short": "Hard, and very hard. A few words at a time, then none. Where intervals live.",
    "group": "cardio",
    "more": "vo2-max",
    "aliases": [
      "zone 4 and 5",
      "zone 4",
      "zone 5"
    ],
    "auto": true
  },
  {
    "id": "intervals",
    "label": "Intervals",
    "short": "Short hard efforts with easy recovery between them. The thing that actually raises VO2 max — steady easy work does not.",
    "group": "cardio",
    "more": "vo2-max",
    "aliases": [
      "interval"
    ],
    "auto": true
  },
  {
    "id": "vo2-max",
    "label": "VO2 max",
    "short": "The most oxygen your body can use per minute when working flat out — the size of your aerobic engine, and the best single measure of cardio fitness. Estimated here, never measured exactly.",
    "group": "cardio",
    "more": "vo2-max",
    "aliases": [
      "VO2max",
      "VO₂ max"
    ],
    "auto": true
  },
  {
    "id": "talk-test",
    "label": "Talk test",
    "short": "Judging your effort by how easily you can speak. More reliable than any number on a screen — when the two disagree, the talk test wins.",
    "group": "cardio",
    "more": "zone-2",
    "auto": true
  },
  {
    "id": "resting-heart-rate",
    "label": "Resting heart rate",
    "short": "Your pulse on waking, before you get up. Used to work out your zones, and it drops as your fitness improves.",
    "group": "cardio",
    "aliases": [
      "resting pulse"
    ],
    "auto": true
  },
  {
    "id": "max-heart-rate",
    "label": "Maximum heart rate",
    "short": "The fastest your heart can beat. Estimated from your age, and the estimate is wrong by 10 to 12 beats for most people — which is why the talk test comes first.",
    "group": "cardio",
    "more": "zone-2",
    "aliases": [
      "max heart rate"
    ],
    "auto": true
  },
  {
    "id": "heart-rate-reserve",
    "label": "Heart-rate reserve",
    "short": "The gap between your resting and maximum heart rate. Zones worked out from this fit you better than zones taken as a flat share of maximum.",
    "group": "cardio",
    "aliases": [
      "heart rate reserve"
    ],
    "auto": true
  },
  {
    "id": "rockport",
    "label": "Walk test",
    "short": "Walk 1.61 km as fast as you can sustain, then record your time and heart rate. Gives a VO2 max estimate without ever going flat out. Also called the Rockport test.",
    "group": "cardio",
    "more": "vo2-max",
    "aliases": [
      "Rockport test",
      "Rockport walk test",
      "Rockport"
    ],
    "auto": true
  },
  {
    "id": "cooper-test",
    "label": "Cooper test",
    "short": "Cover as much distance as you can in exactly twelve minutes. Sharper than the walk test, but it needs a genuinely maximal effort — save it until you have a few months of training behind you.",
    "group": "cardio",
    "more": "vo2-max",
    "aliases": [
      "12-minute test"
    ],
    "auto": true
  },
  {
    "id": "norwegian-4x4",
    "label": "Norwegian 4×4",
    "short": "Four minutes near your maximum, three minutes easy, four times through. The best-established way to raise VO2 max — which is why the intervals build towards it.",
    "group": "cardio",
    "more": "vo2-max",
    "aliases": [
      "4×4",
      "4x4"
    ],
    "auto": true
  },
  {
    "id": "interference-effect",
    "label": "Interference effect",
    "short": "Hard cardio done immediately before lifting measurably reduces what you get from the lifting. The reverse order costs you almost nothing — which is why cardio always comes last here.",
    "group": "cardio",
    "more": "lift-before-cardio",
    "auto": true
  },
  {
    "id": "machine",
    "label": "Machine",
    "short": "A fixed-path piece of equipment. The path is chosen for you, so you can push hard without also having to balance the weight. This is why you start here.",
    "group": "exercise",
    "more": "machines-vs-free-weights"
  },
  {
    "id": "cable",
    "label": "Cable",
    "short": "A weight stack pulled through a pulley. Keeps tension on the muscle the whole way through the rep.",
    "group": "exercise"
  },
  {
    "id": "free-weight",
    "label": "Free weight",
    "short": "Dumbbells and barbells. Nothing guides the path, so you balance it yourself — more useful in the long run, harder to learn.",
    "group": "exercise",
    "more": "machines-vs-free-weights",
    "aliases": [
      "free weights"
    ]
  },
  {
    "id": "compound",
    "label": "Compound",
    "short": "A movement using several joints and muscles at once, like a leg press.",
    "group": "exercise",
    "more": "machines-vs-free-weights",
    "aliases": [
      "compound lift",
      "compound movement",
      "compound exercise"
    ],
    "auto": true
  },
  {
    "id": "isolation",
    "label": "Isolation",
    "short": "A movement using one joint, targeting one muscle, like a leg extension.",
    "group": "exercise",
    "aliases": [
      "isolation exercise",
      "isolation work",
      "isolation movement"
    ]
  },
  {
    "id": "eccentric",
    "label": "Eccentric",
    "short": "The lowering half of a rep. Slowing it down makes the same weight harder, at no extra cost.",
    "group": "exercise",
    "aliases": [
      "eccentrics"
    ],
    "auto": true
  },
  {
    "id": "ladder",
    "label": "Ladder",
    "short": "The order to learn a movement in, from the machine version up to the free-weight one. You move up a rung when you have earned it, not on a date.",
    "group": "exercise",
    "more": "machines-vs-free-weights"
  }
];

window.LEARN_ARTICLES = [
  {
    "slug": "glossary",
    "title": "Every word this app uses",
    "oneLiner": "One page. If a term on any screen is unfamiliar, it is defined here.",
    "topic": "reference",
    "body": [
      {
        "p": [
          "Gyms have a lot of vocabulary, and most of it is never explained to anyone. Nothing here is complicated once someone says it plainly.",
          "You should not need this page often — every one of these words is tappable wherever it appears in an article, and tapping it gives you the same definition without losing your place."
        ]
      },
      {
        "h": "While you are training",
        "list": [
          "Rep — one repetition. Lifting the weight and lowering it once.",
          "Set — a group of reps done back to back, then a rest. \"3 × 10\" means three sets of ten reps.",
          "Primer — one or two deliberately light sets at the start, to find the muscle before you load it. Not meant to be hard, and never counted.",
          "Main lift — the most important exercise of the session, done while you are freshest.",
          "Accessory — supporting work after the main lifts. Smaller muscles, usually a bit lighter.",
          "Finisher — the last exercise for a muscle, done when you are already tired.",
          "Superset — two exercises done back to back with no rest between them. Yours pair opposite muscles, so each one rests while the other works — which saves you time for free.",
          "Drop set — take a set close to your limit, immediately strip 20 to 30% of the weight, and keep going without resting. A way to make a muscle work past where it would normally stop.",
          "Ramp-up sets — light rehearsal sets before your first real one — roughly half the weight, then 70%, then 85%. Never logged, never counted.",
          "Movement prep — three minutes of drills that open the specific joints you are about to load. Different from a walk, which only warms you up in general.",
          "Hard set — a working set taken close to your limit. The count of these per week is the number that predicts whether muscle gets built — not calories burned.",
          "Reps in reserve — how many more reps you could have done if someone made you. Stopping with about 2 in reserve is the target — hard, but not to failure.",
          "Pre-exhaustion — tiring a muscle with an isolation exercise immediately before a big lift that uses it. A real technique, but it makes you weaker on the lift that matters, so it is worth saving until your technique is solid."
        ]
      },
      {
        "h": "Planning and progress",
        "list": [
          "Block — a four-week chunk of the twelve. Each one has a different job, and new techniques unlock as you reach it.",
          "Deload — a deliberately easier week — same weights, about 40% fewer sets — so your body catches up and comes back stronger. Not a week off.",
          "Progressive overload — doing slightly more than last time — one more rep, or a little more weight. The single idea the whole plan runs on.",
          "Double progression — the method behind your targets. Add reps until you hit the top of the range on every set, then add weight and drop back to the bottom.",
          "Volume — how many hard sets a muscle gets in a week. More is better, up to a point.",
          "Stall — two sessions in a row on a lift with no progress. When it happens, drop that one lift back about 10% and build it up again — there is no need to wait for a deload week."
        ]
      },
      {
        "h": "Cardio and conditioning",
        "list": [
          "Zone 2 — easy aerobic effort. You can hold a conversation in full sentences, but would not want to sing. It builds the base everything else runs on.",
          "Zones 4 and 5 — hard, and very hard. A few words at a time, then none. Where intervals live.",
          "Intervals — short hard efforts with easy recovery between them. The thing that actually raises VO2 max — steady easy work does not.",
          "VO2 max — the most oxygen your body can use per minute when working flat out — the size of your aerobic engine, and the best single measure of cardio fitness. Estimated here, never measured exactly.",
          "Talk test — judging your effort by how easily you can speak. More reliable than any number on a screen — when the two disagree, the talk test wins.",
          "Resting heart rate — your pulse on waking, before you get up. Used to work out your zones, and it drops as your fitness improves.",
          "Maximum heart rate — the fastest your heart can beat. Estimated from your age, and the estimate is wrong by 10 to 12 beats for most people — which is why the talk test comes first.",
          "Heart-rate reserve — the gap between your resting and maximum heart rate. Zones worked out from this fit you better than zones taken as a flat share of maximum.",
          "Walk test — walk 1.61 km as fast as you can sustain, then record your time and heart rate. Gives a VO2 max estimate without ever going flat out. Also called the Rockport test.",
          "Cooper test — cover as much distance as you can in exactly twelve minutes. Sharper than the walk test, but it needs a genuinely maximal effort — save it until you have a few months of training behind you.",
          "Norwegian 4×4 — four minutes near your maximum, three minutes easy, four times through. The best-established way to raise VO2 max — which is why the intervals build towards it.",
          "Interference effect — hard cardio done immediately before lifting measurably reduces what you get from the lifting. The reverse order costs you almost nothing — which is why cardio always comes last here."
        ]
      },
      {
        "h": "Kinds of exercise",
        "list": [
          "Machine — a fixed-path piece of equipment. The path is chosen for you, so you can push hard without also having to balance the weight. This is why you start here.",
          "Cable — a weight stack pulled through a pulley. Keeps tension on the muscle the whole way through the rep.",
          "Free weight — dumbbells and barbells. Nothing guides the path, so you balance it yourself — more useful in the long run, harder to learn.",
          "Compound — a movement using several joints and muscles at once, like a leg press.",
          "Isolation — a movement using one joint, targeting one muscle, like a leg extension.",
          "Eccentric — the lowering half of a rep. Slowing it down makes the same weight harder, at no extra cost.",
          "Ladder — the order to learn a movement in, from the machine version up to the free-weight one. You move up a rung when you have earned it, not on a date."
        ]
      }
    ]
  },
  {
    "slug": "what-toned-means",
    "title": "What \"toned\" actually means",
    "oneLiner": "There is no toning tissue. Toned is muscle you can see.",
    "topic": "training",
    "body": [
      {
        "p": [
          "This one matters more than anything else here, because it decides whether the rest of the plan makes sense to you.",
          "There is no such thing as a \"toning\" tissue. Your body has muscle, and it has fat on top of it. When people say someone looks toned, they mean two things are true at once: there is enough muscle to have a shape, and there is little enough fat on top for that shape to show."
        ]
      },
      {
        "h": "Which means two jobs, not one",
        "p": [
          "Build muscle. That comes from lifting progressively heavier weights over months. There is no other route.",
          "Keep body fat moderate. That comes from how you eat, and you already have this handled — it is why you are in good shape now."
        ]
      },
      {
        "h": "So the missing half is the lifting",
        "p": [
          "Dieting alone gets you smaller. It does not give you shape, because there is no extra muscle underneath to reveal. That is the gap lifting fills."
        ]
      },
      {
        "h": "And no, you will not get bulky",
        "p": [
          "This is the fear that keeps people using weights so light they achieve nothing, for years.",
          "A woman training naturally and eating at roughly maintenance builds muscle slowly. Slowly is the only speed available to you. The visible result of two solid years of hard training is exactly the thing you are calling \"toned\".",
          "You cannot accidentally overshoot. Nobody has ever woken up too muscular by surprise. If you ever decided you had built more than you wanted, it takes months of not training to lose it. You have an enormous amount of runway, and no risk to manage."
        ]
      }
    ]
  },
  {
    "slug": "progressive-overload",
    "title": "Progressive overload",
    "oneLiner": "Your body only changes when you ask it to do something it has not done before.",
    "topic": "training",
    "body": [
      {
        "p": [
          "Muscle is expensive for your body to build and to carry. It will not build any unless there is a reason. Doing the same workout with the same weights for the same reps is not a reason — after a few weeks your body has already handled that, and it stops adapting.",
          "Progressive overload just means: do slightly more than last time. That is the entire principle. Everything else — the sets, the rest, the logging — exists to make it happen."
        ]
      },
      {
        "h": "What \"more\" can mean",
        "list": [
          "More reps at the same weight",
          "The same reps at a heavier weight",
          "An extra set",
          "The same set with a slower, more controlled lowering",
          "The same set with better technique and less momentum"
        ]
      },
      {
        "h": "The method: double progression",
        "p": [
          "Each exercise has a rep range, say 8 to 12. You pick a weight you can do 8 solid reps with.",
          "Each session you try to add a rep. When you can do 12 on every set with something left in the tank, the weight goes up and you drop back to 8. Then it starts again.",
          "You do not have to remember any of it. FitForge opens each set on the numbers you used last time, so beating them is one tap and matching them is no work at all."
        ]
      },
      {
        "h": "Why it feels too slow",
        "p": [
          "One extra rep a week sounds like nothing. Over three months it is the difference between lifting 20 kg for 8 and lifting 35 kg for 12. That is a completely different body.",
          "The people who get results are not the ones training hardest on any given day. They are the ones who added a rep, boringly, for a year."
        ]
      }
    ]
  },
  {
    "slug": "rir",
    "title": "How hard is hard enough",
    "oneLiner": "Reps in reserve: how many more you could have done.",
    "topic": "training",
    "body": [
      {
        "p": [
          "The most common reason a beginner sees no results is not doing too much. It is stopping a set well before it got hard, because nothing told them where hard was.",
          "RIR means \"reps in reserve\" — how many more reps you could have done if someone had made you. Finishing a set with 2 RIR means you could have managed roughly two more."
        ]
      },
      {
        "h": "What each number feels like",
        "list": [
          "4 RIR — comfortably hard. You could clearly do several more. This is where priming sets live.",
          "3 RIR — getting hard. The bar speed is still fast.",
          "2 RIR — hard. The last rep slowed down noticeably. This is the working target.",
          "1 RIR — very hard. One more, maybe.",
          "0 RIR — failure. You physically could not do another."
        ]
      },
      {
        "h": "Why not just go to failure every set?",
        "p": [
          "Because failure costs far more in recovery than it returns in stimulus. A set at 2 RIR builds almost exactly as much muscle as a set at 0 RIR, and leaves you able to train hard again in two days rather than four.",
          "Beginners also cannot judge their own limit accurately yet — most people who think they are at failure have three reps left. Yours will calibrate over the first month or two. Until then, assume you have more left than it feels like."
        ]
      },
      {
        "h": "How this ramps",
        "list": [
          "Weeks 1-2: leave 3-4 in reserve. You are learning movements, not chasing fatigue.",
          "Weeks 3-4: leave 2-3.",
          "Weeks 5-8: leave 2. This is the sweet spot.",
          "Weeks 9-12: leave 1-2, and only on the last set of an exercise."
        ]
      }
    ]
  },
  {
    "slug": "machines-vs-free-weights",
    "title": "Why start on machines",
    "oneLiner": "Machines fix the path so you can learn to push hard. Free weights come after.",
    "topic": "training",
    "body": [
      {
        "p": [
          "There is a snobbery about machines that is worth ignoring for the next three months.",
          "A barbell squat asks you to do two things simultaneously: produce force with your legs, and balance a loaded bar while your body works out a movement it has never done. When you are new, the balance problem is the limit. You stop the set because you feel wobbly, not because your legs are done — so your legs never get the message that they need to grow.",
          "A leg press removes the balance problem entirely. All that is left is pushing hard. That is what builds the base."
        ]
      },
      {
        "h": "What machines are genuinely better at",
        "list": [
          "Letting you go close to failure safely, with no spotter and nothing to drop",
          "Teaching you what a specific muscle feels like when it works",
          "Being repeatable — same seat setting, same path, so the numbers actually compare week to week",
          "Being far less intimidating, which means you use them, which is the whole point"
        ]
      },
      {
        "h": "What free weights are better at",
        "list": [
          "Training the stabilising muscles that hold you together",
          "Carrying over into ordinary life — lifting, carrying, sport",
          "Far more room to keep progressing over years"
        ]
      },
      {
        "h": "So the order is",
        "p": [
          "Machines to build the base and learn the pattern. Then the free-weight version of the same pattern, once you can load it properly.",
          "Every exercise in the library shows its ladder — where it sits and what comes next. You move up a rung when you can hit the top of the rep range on every set with clean technique, not on a date."
        ]
      }
    ]
  },
  {
    "slug": "lift-before-cardio",
    "title": "Why lifting comes before cardio",
    "oneLiner": "Hard cardio first measurably blunts the strength work. The other order costs you almost nothing.",
    "topic": "training",
    "body": [
      {
        "p": [
          "Doing both in one session is efficient, and it is the right call given four trips a week. The order is not optional though.",
          "There is a well-documented interference effect: doing significant cardio immediately before lifting reduces the strength and muscle you get from that lifting. Your legs arrive at the leg press already tired, you use less weight, and less weight is less signal to grow.",
          "Doing the cardio afterwards causes far less interference. Zone 2 specifically is the least disruptive intensity there is."
        ]
      },
      {
        "h": "So every session runs",
        "list": [
          "Walk in — general warm-up, and free training volume",
          "Five minutes of specific prep and ramp-up sets",
          "The lifting, hardest work first while you are fresh",
          "Cardio finisher",
          "Walk home — cool-down"
        ]
      },
      {
        "h": "One exception worth knowing",
        "p": [
          "Hard intervals go on an upper-body day, never after legs. Your legs do the intervals, and they have already worked on lower days. This is why the interval session is scheduled on Upper B."
        ]
      }
    ]
  },
  {
    "slug": "why-the-walk-counts",
    "title": "Why the walk counts",
    "oneLiner": "Two twenty-minute walks, four days a week, is more training than any clever gym trick.",
    "topic": "training",
    "body": [
      {
        "p": [
          "You walk to the gym and back. That is not commuting — it is roughly 160 minutes a week of low-intensity aerobic work, and it is doing more for you than anything you could engineer by rearranging your gym hour.",
          "The standard public health guideline is 150 minutes a week of moderate activity. You clear it on the walk alone, before touching a cardio machine."
        ]
      },
      {
        "h": "What it does",
        "list": [
          "Warms you up on the way in, so you arrive ready to lift rather than cold",
          "Flushes the legs on the way home, which genuinely helps you feel better the next day",
          "Adds real daily energy expenditure — and unlike a gym session, it costs you no extra time or recovery",
          "Builds the aerobic base that makes the hard intervals possible later"
        ]
      },
      {
        "h": "One correction",
        "p": [
          "A walk is a general warm-up. It raises your body temperature, but it does not prepare the specific joints you are about to load. You still need five minutes of movement prep and a couple of ramp-up sets on the first lift — do not skip them because you walked.",
          "And if you arrive cold or soaked, treat the walk as not having happened and take the longer warm-up option."
        ]
      },
      {
        "h": "Make it count for more",
        "p": [
          "If you can walk briskly enough to be in Zone 2 — breathing noticeably deeper, still able to talk in full sentences — that same walk becomes properly useful aerobic training rather than just movement. Check it once with the walk-pace test in the Cardio section, and then you will know."
        ]
      }
    ]
  },
  {
    "slug": "zone-2",
    "title": "Zone 2",
    "oneLiner": "The easy cardio that builds the engine everything else runs on.",
    "topic": "training",
    "body": [
      {
        "p": [
          "Zone 2 is deliberately easy aerobic work. It feels almost too easy to be doing anything, which is why most people skip it and go straight to hard sessions they cannot sustain.",
          "It builds your aerobic base: more capillaries, better fat use for fuel, a heart that pumps more per beat. That base is what lets you recover between hard sets, between sessions, and eventually do the intervals that raise VO2 max."
        ]
      },
      {
        "h": "How to find it — the talk test comes first",
        "p": [
          "You should be able to hold a conversation in full sentences, but you would not want to sing. Your breathing is noticeably deeper, and you could still just about breathe through your nose. Effort around 3 or 4 out of 10.",
          "That is the definition. Heart rate is a confirmation, not the target."
        ]
      },
      {
        "h": "Why not lead with heart rate",
        "p": [
          "Because the numbers disagree with each other. The \"Zone 2\" band on a treadmill display and the Zone 2 a coach means can differ by 20 beats. And the formula everyone uses for maximum heart rate is wrong by 10 to 12 beats for most people.",
          "Hand a beginner a wrong number and they will train at the wrong intensity with total confidence. The Cardio page shows your bands calculated properly, with both conventions side by side — but if the number and the talk test disagree, the talk test wins."
        ]
      },
      {
        "h": "How much",
        "p": [
          "You are already getting a large amount from the walk. The 12 to 15 minutes on the bike after your upper-body sessions is a top-up, not the main event. If you cannot hold it conversationally for the whole time, you started too hard."
        ]
      }
    ]
  },
  {
    "slug": "vo2-max",
    "title": "VO2 max",
    "oneLiner": "The size of your aerobic engine — and the single best-evidenced number in fitness.",
    "topic": "training",
    "body": [
      {
        "p": [
          "VO2 max is the most oxygen your body can use per minute when working as hard as it can. It is the best single measure of aerobic fitness, and it tracks long-term health more closely than almost anything else that can be measured.",
          "It is also the one number that says whether your cardio is actually improving, rather than whether a session felt hard."
        ]
      },
      {
        "h": "An honest caveat",
        "p": [
          "A true VO2 max reading needs a lab, a mask and a metabolic cart. Everything else — your watch, any gym test, any calculator — is an estimate carrying roughly 10 to 15% error.",
          "That is completely fine, as long as you use it correctly. The trend across repeated tests is the signal. A single number is not, and neither is a small change between two tests. Treat any single reading as a range, not a point."
        ]
      },
      {
        "h": "How you will measure it",
        "list": [
          "Start with the Rockport walk test. Walk 1.61 km as fast as you can sustain, record the time and your heart rate at the finish. Submaximal, safe, and it uses a skill you already have.",
          "Repeat it every six to twelve weeks. Same protocol every time, so the comparison is clean.",
          "Once you have a few months behind you, the Cooper test — maximum distance in 12 minutes — is a harder, sharper measure."
        ]
      },
      {
        "h": "What actually raises it",
        "p": [
          "Not Zone 2. Zone 2 builds the base that makes the hard work possible, but the thing that moves VO2 max is time spent near your maximum.",
          "The best-established protocol is the Norwegian 4x4: four minutes at close to your maximum, three minutes easy, four times. That is not a starting point for someone with no training background. Ramp to it over a couple of months — 30-second efforts first, then two minutes, then the full four."
        ]
      }
    ]
  },
  {
    "slug": "supersets",
    "title": "Supersets",
    "oneLiner": "Two exercises back to back. Used correctly, they buy you time for free.",
    "topic": "training",
    "body": [
      {
        "p": [
          "A superset is two exercises done back to back with no rest in between. There are two kinds and they are not remotely the same thing."
        ]
      },
      {
        "h": "Antagonist supersets — free time, no downside",
        "p": [
          "Pair two exercises that work opposing muscles: a push with a pull, or the front of the leg with the back of it. While your triceps work, your biceps rest — so by the time you come back round, each muscle has had a normal rest without you standing around for it.",
          "You cut 20 to 30% off the session with essentially no cost to your strength. This is why pairing accessory work is worth the small amount of extra planning."
        ]
      },
      {
        "h": "Same-muscle supersets — a genuine intensity tool",
        "p": [
          "Two exercises for the same muscle back to back — a chest press straight into a chest fly. This is not a time saver. It is a way to make a muscle work far harder than one exercise could, and it costs a lot in fatigue.",
          "It is worth holding back until straight sets stop giving you much, because the extra fatigue eats into recovery before then."
        ]
      },
      {
        "h": "One practical note",
        "p": [
          "Supersets need two pieces of equipment free at once. In a busy gym, do not stress it — do them as straight sets and take the extra few minutes. A missed superset costs you almost nothing. Hovering anxiously over someone else's machine costs you the session."
        ]
      }
    ]
  },
  {
    "slug": "drop-sets",
    "title": "Drop sets",
    "oneLiner": "Take a set to the limit, strip the weight, keep going. Powerful and expensive.",
    "topic": "training",
    "body": [
      {
        "p": [
          "A drop set: you take a set close to failure, immediately reduce the weight by roughly 20 to 30%, and keep going without rest. Sometimes twice.",
          "The point is to keep a muscle working past where it would normally have to stop. Your strongest muscle fibres are the last to be called on, and they only get recruited when everything else is already tired — a drop set keeps you in that zone for longer."
        ]
      },
      {
        "h": "Why not from day one",
        "p": [
          "Because as a beginner you are already getting close to the maximum available adaptation from ordinary straight sets. Adding a technique like this early adds fatigue before it adds any benefit.",
          "Its real value arrives later, when straight sets stop producing progress — which is exactly when it will feel like a discovery rather than a chore."
        ]
      },
      {
        "h": "The rules when it unlocks in week 5",
        "list": [
          "Machines and cables only. Never a free-weight lift — stripping plates while exhausted is how technique falls apart.",
          "Last exercise of the session only. It should not affect anything that comes after it.",
          "One or two exercises maximum, once a week. Not on everything.",
          "Never on your main compound lift. That one needs you fresh."
        ]
      }
    ]
  },
  {
    "slug": "pre-exhaustion",
    "title": "Pre-exhaustion, and why we do the opposite first",
    "oneLiner": "Tiring a muscle before the big lift. A real tool, but wrong for a first block.",
    "topic": "training",
    "body": [
      {
        "p": [
          "Pre-exhaustion means doing a hard isolation exercise immediately before a compound lift that uses the same muscle — leg extensions to failure, then straight onto the leg press.",
          "The idea is intuitive and appealing: tire out the target muscle first, so it is the thing that fails on the big lift rather than everything else giving out around it."
        ]
      },
      {
        "h": "Why it is held back to week 9",
        "list": [
          "It makes you weaker on the compound lift, and the compound lift is what builds the strength base you do not have yet.",
          "Fatiguing a muscle before a movement you are still learning makes your technique worse, exactly when technique matters most.",
          "The evidence does not really support the mechanism. Research measuring muscle activity found pre-exhaustion actually reduced activation of the target muscle during the following compound lift — the opposite of what it is supposed to do."
        ]
      },
      {
        "h": "What the programme does instead",
        "p": [
          "Prime, then compound, then isolate.",
          "You start with one or two very light isolation sets — enough to feel the muscle and switch it on, nowhere near enough to tire it. Then the compound lift while you are fresh. Then the isolation work properly, afterwards, when tiring the muscle out costs nothing.",
          "You keep everything you wanted from the isolation-first instinct — knowing which muscle you are meant to feel, which is genuinely the hardest thing about being new — without paying for it in the lift that matters."
        ]
      },
      {
        "h": "When it does unlock",
        "p": [
          "Once your technique is solid and straight sets have started to give less back — on machine-based movements, one exercise per session at most."
        ]
      }
    ]
  },
  {
    "slug": "warming-up",
    "title": "Warming up, and cooling down",
    "oneLiner": "Two different jobs. Only one of them is stretching.",
    "topic": "training",
    "body": [
      {
        "p": [
          "Most people treat warming up as a formality — five minutes on a bike, a couple of arm swings, then straight to the heavy thing. That misses what a warm-up is actually for.",
          "There are two separate jobs, and they are not interchangeable."
        ]
      },
      {
        "h": "1. Movement prep — open the joints",
        "p": [
          "Four drills, about three minutes, chosen for the session you are about to do. Ankle rocks before a leg press because ankle range is what lets you reach depth. Wall slides before a shoulder press because that is the movement the shoulder blade needs to be able to make.",
          "None of it should tire you. If a drill leaves you out of breath, it has stopped being a warm-up and started being a workout."
        ]
      },
      {
        "h": "2. Ramp-up sets — rehearse the lift",
        "p": [
          "This is the part beginners skip, because light sets feel pointless. They are not. Roughly half your working weight for 8, then 70% for 5, then 85% for 3.",
          "What they buy you: your nervous system gets to practise the exact movement at rising loads, so the first working set feels like the third rather than a cold shock. You will lift more, with better technique, for the entire session.",
          "They are rehearsal, not work. Do not log them, and do not count them toward your weekly sets."
        ]
      },
      {
        "h": "What about static stretching first?",
        "p": [
          "Holding a long stretch before lifting temporarily reduces how much force a muscle can produce. The effect is small and short-lived, but there is no reason to pay it — so the long holds go at the end, not the beginning."
        ]
      },
      {
        "h": "And the cool-down",
        "p": [
          "Here is the honest version: a cool-down will not prevent soreness. Nothing reliably does. Anyone selling you a stretch that stops next-day ache is overselling.",
          "What it does do is get your breathing and heart rate down before you walk home, and keep range at the joints that lifting quietly shortens — the front of the hips after leg day, the chest after pressing. Three stretches, two minutes. Worth it, for what it actually is rather than what it is usually claimed to be."
        ]
      }
    ]
  },
  {
    "slug": "deloads",
    "title": "Deloads",
    "oneLiner": "Backing off on purpose, so the progress catches up.",
    "topic": "training",
    "body": [
      {
        "p": [
          "Training does not make you stronger. Recovering from training makes you stronger. Training is just the request.",
          "If you keep making the request without ever letting your body fill it, fatigue stacks up until progress stops and everything starts to feel heavy — including weights you handled easily a fortnight ago."
        ]
      },
      {
        "h": "What a deload is",
        "p": [
          "A week where you keep the same weights but cut the sets by about 40%. It is not a week off, and it is not going through the motions — the loads stay heavy so your body has no reason to give up any of what it built. There is just far less of it.",
          "You will almost always come back stronger the following week. That is not a coincidence; it is the point."
        ]
      },
      {
        "h": "When they happen",
        "list": [
          "Scheduled — weeks 5 and 9, between training blocks.",
          "Triggered — if any lift fails to progress for two sessions in a row, deload that lift on its own schedule rather than waiting."
        ]
      },
      {
        "h": "The hard part",
        "p": [
          "Deload weeks feel like slacking, and the temptation to skip them is strong precisely when you most need one. Nobody has ever lost progress from an easy week. Plenty of people have lost months to pushing through one they should have taken."
        ]
      }
    ]
  },
  {
    "slug": "where-your-calorie-number-comes-from",
    "title": "Where your calorie number comes from",
    "oneLiner": "The app did some arithmetic on four facts about you. Here is which arithmetic, and how much to trust it.",
    "topic": "nutrition",
    "body": [
      {
        "p": [
          "When you finished the setup questions, FitForge produced a daily calorie number. It did not look you up in a table or compare you to anyone. It ran two calculations, and both are worth understanding, because the number is far less precise than its three digits suggest."
        ]
      },
      {
        "h": "Step one: what you burn doing nothing",
        "p": [
          "The first calculation is your basal metabolic rate — the energy your body spends staying alive. Breathing, pumping blood, keeping your brain running and your temperature steady. This is most of your daily burn, which surprises people who assume exercise dominates.",
          "FitForge uses the Mifflin-St Jeor equation, which takes your sex, age, height and weight. It has been the standard for decades because it is the least wrong of the simple formulas. It is still a population average: two people identical on all four inputs can differ by a few hundred calories a day."
        ]
      },
      {
        "h": "Step two: multiply by how much you move",
        "p": [
          "Your BMR is then multiplied by an activity factor — the sedentary/moderate/active answer you gave. That produces your total daily energy expenditure, or TDEE: roughly what you burn across a whole day.",
          "This step is the loose one. Activity levels are broad buckets, and the honest range between them is wide. Someone who walks to work and stands all day genuinely burns hundreds more than someone who drives and sits, and both might reasonably pick \"moderate\"."
        ]
      },
      {
        "h": "So treat it as a starting hypothesis",
        "p": [
          "The number is a starting point to test, not a fact about your body. The way to find your real maintenance is to eat around the estimate for two or three weeks, log honestly, and watch the weight trend. If the trend is flat, the estimate was close. If it moves steadily in a direction you did not intend, the estimate was off and now you know by roughly how much.",
          "That is not a failure of the app. It is the only way anyone finds their real number without a metabolic ward."
        ]
      }
    ]
  },
  {
    "slug": "what-a-deficit-actually-is",
    "title": "What a calorie deficit actually is",
    "oneLiner": "Energy in, energy out, and why the arithmetic is honest even when it does not feel like it.",
    "topic": "nutrition",
    "body": [
      {
        "p": [
          "A deficit means taking in less energy than you spend, so your body makes up the difference from stored energy. That is the whole mechanism. Every diet that has ever worked, whatever it called itself, worked by producing one."
        ]
      },
      {
        "h": "Why the approaches all sound different",
        "p": [
          "Low-carb, high-protein, fasting windows, cutting out a food group — these are not competing theories of fat loss. They are different tactics for the same job: making it easier to eat less without feeling constantly hungry.",
          "That is a real problem worth solving, and it is why the tactics are not interchangeable between people. Some find protein and fibre keep them full. Some find a narrow eating window stops evening grazing. The best one is the one you can keep doing, and nobody can tell you in advance which that is."
        ]
      },
      {
        "h": "The part that trips people up",
        "p": [
          "Both sides of the equation move. Eat less for long enough and you fidget less, feel colder, move less without deciding to, and your maintenance drifts down. This is normal and it is not your metabolism being \"damaged\" — it is a smaller body costing less to run, plus a real reduction in unconscious movement.",
          "The practical consequence: a deficit that worked for a month may stop working, and the answer is information, not panic. Your logged data will show it before the scale explains it."
        ]
      },
      {
        "h": "Muscle is the reason to care about how",
        "p": [
          "Weight loss is not fat loss. A deficit takes some of both, and how much of each depends heavily on whether you are lifting and eating enough protein. This is why the training and nutrition halves of this app are not separate topics: an aggressive deficit with no resistance training gets you a smaller version of the same shape."
        ]
      }
    ]
  },
  {
    "slug": "why-protein-gets-its-own-number",
    "title": "Why protein gets its own number",
    "oneLiner": "The one macro where the amount genuinely changes the outcome.",
    "topic": "nutrition",
    "body": [
      {
        "p": [
          "FitForge tracks three macros, but protein is the one with its own goal for a reason: it is the one where being short of the mark changes what happens to your body, not just how you feel."
        ]
      },
      {
        "h": "What it actually does",
        "p": [
          "Protein supplies the amino acids your body uses to repair and build tissue, including the muscle you damaged in training. Training is the signal to build; protein is the material. A strong signal with no material does not produce much.",
          "It is also the most filling of the three per calorie, and the most expensive for your body to digest — a modest but real chunk of the energy is spent processing it. Both of those help in a deficit."
        ]
      },
      {
        "h": "The number, and what kind of number it is",
        "p": [
          "Across the research, intakes somewhere around 1.6 to 2.2 grams per kilogram of bodyweight per day is where the muscle-building benefit stops improving much for people doing resistance training. Below that range there is usually something left on the table; above it, the extra mostly just gets used as energy.",
          "That is a general finding across studies of groups, not a prescription for you, and FitForge's default sits in that band as a starting point rather than a target you must hit. Individual needs vary with age, training, health and a dozen other things."
        ]
      },
      {
        "h": "It matters most exactly when it is hardest",
        "p": [
          "In a deficit your body is looking for energy, and muscle is a candidate source. Eating enough protein while training is what pushes it toward fat instead. This is the difference between finishing a cut looking leaner and finishing it looking like a smaller version of where you started."
        ]
      }
    ]
  },
  {
    "slug": "what-the-three-macros-do",
    "title": "What the three macros do",
    "oneLiner": "Protein, carbs and fat are not rivals. They have different jobs.",
    "topic": "nutrition",
    "body": [
      {
        "p": [
          "Everything with calories in it is some combination of three things. Protein and carbohydrate carry about four calories per gram, fat about nine. That difference is most of why fat-heavy foods add up quickly — not because fat is uniquely fattening."
        ]
      },
      {
        "h": "Protein — the building material",
        "p": [
          "Repair and construction. Covered properly in its own article; the short version is that this is the one worth paying attention to."
        ]
      },
      {
        "h": "Carbohydrate — the fuel you can reach quickly",
        "p": [
          "Your body's preferred fuel for hard efforts. Carbs are stored in muscle and liver as glycogen, and glycogen is what a heavy set actually runs on. Cut them very low and lifting usually feels flat and heavy long before anything is wrong with you.",
          "Carbs are not required in the way protein and fat are — your body can make glucose from other things. But for someone training hard, they are the difference between sessions that go well and sessions that grind."
        ]
      },
      {
        "h": "Fat — the one you cannot cut to zero",
        "p": [
          "Hormone production, absorbing vitamins A, D, E and K, and the structure of every cell membrane you own. Going very low on fat for a long time causes real problems, which is why every sensible approach keeps a floor under it."
        ]
      },
      {
        "h": "How much this matters",
        "p": [
          "Total calories decide whether you gain or lose. Protein decides how much of that change is muscle. The carb-versus-fat split, once protein is covered and fat is not stupidly low, is mostly a question of what makes your day easier to eat and your training feel better. Treat the rings as a guide, not a test you can fail."
        ]
      }
    ]
  },
  {
    "slug": "why-the-scale-jumps",
    "title": "Why the scale jumps overnight",
    "oneLiner": "You did not gain two kilos of fat on Saturday. Here is what actually moved.",
    "topic": "nutrition",
    "body": [
      {
        "p": [
          "A kilogram of body fat holds roughly seven thousand calories. To genuinely gain two kilos of fat in a day you would have to eat about fourteen thousand calories beyond what you burned. Almost nobody has ever done that. So when the scale jumps two kilos, it is not fat, and the number is telling you about something else."
        ]
      },
      {
        "h": "What is actually moving",
        "list": [
          "Water. By far the biggest factor. Salt, heat, sleep, alcohol, stress and hormones all shift how much water you hold, easily by a kilo or more in either direction.",
          "Glycogen. Stored carbohydrate binds water with it — roughly three grams of water per gram of glycogen. A high-carb day refills the tank and the scale follows. This is most of what \"losing five pounds in the first week\" of a low-carb diet is.",
          "Food and drink still in transit. What you ate yesterday has mass and has not finished its journey.",
          "Training. A hard session causes muscle to hold extra water while it repairs. Training more can make the scale go up for a week or two while you are getting leaner."
        ]
      },
      {
        "h": "What to do about it",
        "p": [
          "Weigh under the same conditions — same time of day, same point in your routine — so you are at least comparing like with like. Then ignore individual readings entirely and look at the direction over two to three weeks.",
          "A single weigh-in is one noisy sample of a number that moves for a dozen reasons. The trend is the signal. If you find daily weighing makes you miserable rather than informed, weighing less often costs you very little."
        ]
      }
    ]
  },
  {
    "slug": "why-logging-works",
    "title": "Why logging works even when you are not strict",
    "oneLiner": "The benefit is mostly the noticing, not the accuracy.",
    "topic": "nutrition",
    "body": [
      {
        "p": [
          "People assume food logging works because it makes the arithmetic exact. It does not — home logging carries real error, from portion estimates, from database entries, from the things that never get logged at all. And it still works, which tells you the mechanism is something else."
        ]
      },
      {
        "h": "What it is actually doing",
        "p": [
          "Most of the benefit is attention. Eating is largely automatic, and the gap between what people believe they eat and what they actually eat is consistently large in studies — usually in the same direction. Writing it down closes that gap, not by being precise, but by making it visible.",
          "The second benefit is calibration. After a few weeks you develop an intuition for what a day looks like, and that intuition survives long after you stop logging."
        ]
      },
      {
        "h": "Consistently wrong beats occasionally right",
        "p": [
          "If you estimate the same way every day, your error is roughly constant, and a constant error cancels out when you compare weeks. A log that is 10% off but steady tells you more about the direction you are heading than one that is perfect on the days you feel organised and absent on the rest.",
          "Which means the failure mode worth avoiding is not inaccuracy. It is stopping — especially on the days you would rather not look. Those are the informative ones."
        ]
      }
    ]
  },
  {
    "slug": "eating-around-training",
    "title": "Eating around training",
    "oneLiner": "The timing questions people worry about matter far less than the daily total.",
    "topic": "nutrition",
    "body": [
      {
        "p": [
          "This is where most nutrition folklore lives — the anabolic window, protein immediately after the last set, never training fasted. Nearly all of it is a small effect dressed up as a large one."
        ]
      },
      {
        "h": "The window is a barn door",
        "p": [
          "The idea that you must eat protein within thirty minutes of finishing or waste the session does not hold up. Your muscles stay sensitised to protein for many hours afterwards, and what dominates the outcome is how much protein you ate across the whole day.",
          "If it is convenient to eat after training, do. If it is not, the session is not wasted."
        ]
      },
      {
        "h": "What does make a noticeable difference",
        "list": [
          "Not being empty for a hard session. Something with carbs in the few hours beforehand generally makes heavy work feel better. How long beforehand is entirely a question of what your stomach tolerates.",
          "Spreading protein across the day rather than stacking it all at dinner. The effect is modest, and it is easier than one enormous meal anyway.",
          "Being hydrated. Dull, and more likely to affect how a session feels than any supplement."
        ]
      },
      {
        "h": "Training fasted",
        "p": [
          "Fine if it suits you, and it does not burn meaningfully more fat over a day — the body settles that over twenty-four hours, not one session. Some people feel sharp; others feel weak and cut sets short, which does cost something. Try it and use what you notice."
        ]
      }
    ]
  }
];

// Curated form videos, keyed by exercise id.
//
// Ported from Baseline, where every id was resolved through YouTube's oembed
// endpoint and the returned title recorded beside it — that was the audit
// trail for spotting a video going private. That verification could not be
// repeated here (this environment has no outbound access to youtube.com), so
// these are trusted as-was rather than re-checked.
//
// Only a fifth of the library is covered, which is exactly why nothing depends
// on an entry existing: learnDemoUrl() falls back to a YouTube search built
// from the exercise name, and a search cannot 404. A dead link while you are
// standing at a machine is the failure worth designing out.
window.EXERCISE_VIDEOS = {
  "leg-extension": {
    "url": "https://www.youtube.com/watch?v=TJQmtXUEzNk",
    "label": "Leg extension — setup and form",
    "search": "leg extension machine proper form setup"
  },
  "leg-press": {
    "url": "https://www.youtube.com/watch?v=8nm863C0c60",
    "label": "Leg press — setup, depth and foot placement",
    "search": "leg press machine proper form beginner"
  },
  "goblet-squat": {
    "url": "https://www.youtube.com/watch?v=CkFzgR55gho",
    "label": "Goblet squat — the bridge to free-weight squatting",
    "search": "goblet squat form beginner"
  },
  "hack-squat": {
    "url": "https://www.youtube.com/watch?v=0tn5K9NlCfo",
    "label": "Hack squat — form",
    "search": "hack squat machine form"
  },
  "squat-back": {
    "url": "https://www.youtube.com/watch?v=8PMjqgR8Wa8",
    "label": "Back squat — rack setup and bracing",
    "search": "barbell back squat form beginner tutorial"
  },
  "leg-curl-seated": {
    "url": "https://www.youtube.com/watch?v=t9sTSr-JYSs",
    "label": "Seated leg curl — setup",
    "search": "seated leg curl machine form"
  },
  "leg-curl-lying": {
    "url": "https://www.youtube.com/watch?v=vl5nUdE9mWM",
    "label": "Lying leg curl — setup and form",
    "search": "lying leg curl machine proper form hips down"
  },
  "hip-thrust": {
    "url": "https://www.youtube.com/watch?v=6W-ViLupxKE",
    "label": "Barbell hip thrust — setup",
    "search": "barbell hip thrust setup form"
  },
  "bulgarian-split-squat": {
    "url": "https://www.youtube.com/watch?v=SkNsa3eBwLA",
    "label": "Bulgarian split squat — foot placement",
    "search": "bulgarian split squat form beginner"
  },
  "calf-raise-standing": {
    "url": "https://www.youtube.com/watch?v=SVtg-1loH4c",
    "label": "Calf raise — full range",
    "search": "standing calf raise machine form"
  },
  "bench-press-dumbbell": {
    "url": "https://www.youtube.com/watch?v=f1_LAtinmCo",
    "label": "DB bench press — getting into position",
    "search": "dumbbell bench press form beginner setup"
  },
  "bench-press-barbell": {
    "url": "https://www.youtube.com/watch?v=lWFknlOTbyM",
    "label": "Barbell bench — setup and safeties",
    "search": "barbell bench press form beginner"
  },
  "machine-shoulder-press": {
    "url": "https://www.youtube.com/watch?v=3R14MnZbcpw",
    "label": "Machine shoulder press — form",
    "search": "machine shoulder press form"
  },
  "lat-pulldown": {
    "url": "https://www.youtube.com/watch?v=AOpi-p0cJkc",
    "label": "Lat pulldown — leading with the elbows",
    "search": "lat pulldown proper form beginner mind muscle"
  },
  "pull-up": {
    "url": "https://www.youtube.com/watch?v=6zyx46Vpato",
    "label": "Pull-up — the progression",
    "search": "first pull up progression women"
  },
  "row-seated-cable": {
    "url": "https://www.youtube.com/watch?v=EU7bOadUsNI",
    "label": "Cable row — squeezing the shoulder blades",
    "search": "seated cable row proper form back"
  },
  "incline-bench-dumbbell": {
    "url": "https://www.youtube.com/watch?v=IP4oeKh1Sd4",
    "label": "Incline DB press — bench angle",
    "search": "incline dumbbell press 30 degrees form"
  },
  "lateral-raise": {
    "url": "https://www.youtube.com/watch?v=3VcKaXpzqRo",
    "label": "DB lateral raise — the width builder",
    "search": "dumbbell lateral raise form side delt"
  },
  "face-pull": {
    "url": "https://www.youtube.com/watch?v=3pToT5_DUiY",
    "label": "Face pull — posture insurance",
    "search": "face pull rope form rear delt"
  },
  "tricep-pushdown": {
    "url": "https://www.youtube.com/watch?v=-zLyUAo1gMw",
    "label": "Pushdown — elbow position",
    "search": "triceps pushdown cable form"
  },
  "calf-raise-seated": {
    "url": "https://www.youtube.com/watch?v=pz66Bw6HJ4s",
    "label": "Seated calf raise — form",
    "search": "seated calf raise machine proper form"
  },
  "overhead-tricep-extension": {
    "url": "https://www.youtube.com/watch?v=mRozZKkGIfg",
    "label": "Overhead triceps extension — form",
    "search": "cable overhead triceps extension rope form"
  },
  "curl-dumbbell": {
    "url": "https://www.youtube.com/watch?v=av7-8igSXTs",
    "label": "Dumbbell curl — form",
    "search": "dumbbell biceps curl proper form"
  },
  "plank": {
    "url": "https://www.youtube.com/watch?v=A2b2EmIg0dA",
    "label": "Plank — bracing properly",
    "search": "plank proper form hollow"
  },
  "dead-bug": {
    "url": "https://www.youtube.com/watch?v=GbSC02oU3To",
    "label": "Dead bug — form",
    "search": "dead bug exercise form core"
  }
};
