// Eating patterns: the guides, and the rules each one can be checked against.
//
// The rule is the reason this file exists at all. FitForge stores a meal's
// time, date and macros — nothing else. So a pattern earns a place here only
// if its own definition can be expressed in those four fields and checked
// honestly. Time-restricted eating can (times are stored). Reduced-intake
// days can (daily kcal). Macro-split patterns can. Vegetarian, Mediterranean,
// Whole30 and every other ingredient-defined pattern cannot, and adding them
// would mean shipping a guideline the app silently never checks — worse than
// not offering it, because the silence reads as approval.
//
// What the app does with these is report adherence to the pattern's own rules:
// "outside your window", "over the cap you set". It never recommends a pattern,
// never scores you, and never says whether one is working. That line is the
// whole reason this can exist alongside the Learning Centre's promise not to
// give dietary advice — a statement about a rule you chose is not advice.
//
// Each plan's `guide` is a LEARN article body ({h, p, list}); the articles are
// appended to LEARN_ARTICLES at the bottom of this file so the Learning Centre
// renders them with the machinery it already has, disclaimer and all.

window.DIET_PLAN_NOTE =
  "These are descriptions of well-known eating patterns, not recommendations. FitForge does not suggest a pattern, does not score you against one, and cannot tell you whether one suits you. Choosing one here only tells the app which rules to report against. Fasting and restricted eating do not suit everyone — they are not appropriate during pregnancy, with a history of disordered eating, or alongside several common medications, including insulin. Speak to a doctor or a registered dietitian before changing how you eat.";

window.DIET_PLANS = [
  {
    id: "time-restricted",
    name: "Time-restricted eating",
    oneLiner: "All your food inside a set number of hours each day. 16:8 is the common one.",
    kind: "window",
    checks: "Meal times",
    defaults: { start: "12:00", end: "20:00" },
    presets: [
      { id: "16-8", label: "16:8", start: "12:00", end: "20:00", hint: "8-hour window" },
      { id: "14-10", label: "14:10", start: "10:00", end: "20:00", hint: "10-hour window" },
      { id: "12-12", label: "12:12", start: "08:00", end: "20:00", hint: "12-hour window" }
    ],
    guide: [
      {
        p: [
          "Time-restricted eating puts all of your food inside a set stretch of hours and leaves the rest of the day empty. Nothing is off the menu and nothing is counted differently — the only rule is when.",
          "The names are the two halves of the day. 16:8 means sixteen hours without food and an eight-hour window to eat in; 14:10 and 12:12 are gentler versions of the same idea. Most people are already doing something like 12:12 without calling it anything."
        ]
      },
      {
        h: "What it asks of you",
        list: [
          "Pick a window that fits your day and keep it roughly the same. A window that moves by four hours every day is not really a window.",
          "Water, black coffee and plain tea during the fast are the usual convention. Anything with calories in it ends the fast by most definitions.",
          "The window is the whole rule. Skipping breakfast and then eating the same food later is the entire mechanism — there is nothing else to it."
        ]
      },
      {
        h: "Worth knowing before you start",
        list: [
          "Much of the benefit attributed to it comes from people eating less overall once the window closes off late-night eating. If your intake stays the same, so, largely, does everything else.",
          "Training fasted suits some people and makes others feel terrible. If you lift in the morning, a window that opens at midday means training on nothing.",
          "It is the pattern most likely to collide with the rest of your life — shift work, family meals, a 21:00 finish at the gym. A window you break twice a week is not a failed window, it is the wrong window."
        ]
      },
      {
        h: "What this app can tell you",
        p: [
          "Every meal you log carries a time, so this one can be checked exactly. FitForge will show you which items fell outside your window and by how long, and the spread between your first and last item of the day.",
          "It cannot see what you drank, and it only knows about food you logged. An unlogged biscuit at 23:00 is invisible to it."
        ]
      }
    ]
  },

  {
    id: "reduced-days",
    name: "Reduced-intake days",
    oneLiner: "Eat normally most days, and much less on two or three of them. The 5:2 pattern.",
    kind: "dayType",
    checks: "Daily calories on the days you nominate",
    defaults: { days: ["mon", "thu"], cap: 600 },
    capRange: { min: 200, max: 1200 },
    presets: [
      { id: "5-2", label: "5:2", days: ["mon", "thu"], cap: 600, hint: "Two reduced days" },
      { id: "4-3", label: "4:3", days: ["mon", "wed", "fri"], cap: 600, hint: "Three reduced days" }
    ],
    guide: [
      {
        p: [
          "Instead of eating a little less every day, you eat normally on most days and a great deal less on a nominated few. 5:2 is the best-known version: five ordinary days, two reduced ones.",
          "The reduced days are not fasts in the strict sense — they usually allow around 500 to 600 kcal, which is a small meal or two. The figure most often quoted is 500 for women and 600 for men, but the number matters less than picking one and using the same one."
        ]
      },
      {
        h: "What it asks of you",
        list: [
          "Choose which days are the reduced ones and keep them fixed. Non-consecutive days are the usual advice, so you are never facing two in a row.",
          "Eat normally on the other days. Normally means normally — treating the five as licence to make up the difference removes the point of the two.",
          "Protein and volume are what make a 600 kcal day survivable. Soup, eggs and vegetables go a great deal further than 600 kcal of anything else."
        ]
      },
      {
        h: "Worth knowing before you start",
        list: [
          "Head-to-head against eating slightly less every day, the research has not found it clearly better for weight — it is a different way of arriving at the same weekly total. Some people find it far easier; some find the reduced days miserable.",
          "Training hard on a reduced day is difficult and frequently pointless. Most people put their reduced days on rest days.",
          "It is the pattern with the clearest reasons to avoid it. Reduced days interact badly with several medications, and with any history of restrictive eating."
        ]
      },
      {
        h: "What this app can tell you",
        p: [
          "On the days you nominate, FitForge compares your logged calories to the cap you set, and reports where the day landed against it. On the other days it says nothing, because the pattern asks nothing of them.",
          "It works from the food you logged. A reduced day looks like a triumph if you stopped logging halfway through it."
        ]
      }
    ]
  },

  {
    id: "lower-carb",
    name: "Lower-carbohydrate",
    oneLiner: "Fewer carbohydrates, more of everything else. A share of your energy, not a food list.",
    kind: "composition",
    checks: "Your macro split for the day",
    targets: [{ macro: "carbs", minPct: 10, maxPct: 26 }],
    guide: [
      {
        p: [
          "Lower-carbohydrate eating reduces the share of your energy that comes from carbohydrate and lets protein and fat make up the difference. There is no single definition, but the widely used one puts \"low\" at roughly 26% of energy or below, and \"very low\" — ketogenic territory — at around 10% or below.",
          "As a share of energy rather than a gram count, it scales with how much you eat. On 2,000 kcal, 26% is about 130 g of carbohydrate."
        ]
      },
      {
        h: "What it asks of you",
        list: [
          "Bread, rice, pasta, potatoes, most fruit and anything sweet are where the carbohydrates are. Reducing them is the whole intervention.",
          "Something has to replace that energy or you are simply eating less. Usually that is fat, sometimes protein.",
          "The first week or two commonly feel flat. This is well documented and usually passes."
        ]
      },
      {
        h: "Worth knowing before you start",
        list: [
          "Early weight loss on this pattern is largely water — carbohydrate is stored with it — so the first few days on the scale overstate what happened.",
          "It reliably reduces appetite for some people, which is the mechanism most likely to matter. Compared calorie-for-calorie against other splits, the differences are much smaller than the claims made for them.",
          "High-intensity training runs on carbohydrate. Lifters who cut it hard often find their last few reps go missing."
        ]
      },
      {
        h: "What this app can tell you",
        p: [
          "FitForge already stores protein, carbohydrate and fat for everything you log, so it can show you what share of the day's energy each one accounted for, against the range this pattern describes.",
          "That only works for meals you gave macros to. Anything logged as calories alone is not in the split."
        ]
      }
    ]
  },

  {
    id: "higher-protein",
    name: "Higher-protein",
    oneLiner: "A larger share of energy from protein. The one that overlaps most with lifting.",
    kind: "composition",
    checks: "Your macro split for the day",
    targets: [{ macro: "protein", minPct: 25, maxPct: 35 }],
    guide: [
      {
        p: [
          "Higher-protein eating raises protein's share of your energy, commonly to somewhere between a quarter and a third of it — the 25 to 35% this app checks against — with carbohydrate and fat sharing what is left.",
          "It is the pattern that overlaps most with what you are already doing here. FitForge sets a protein target in grams per kilogram of bodyweight regardless of which pattern you pick — this one describes the same thing from the other direction, as a share of the day's energy."
        ]
      },
      {
        h: "What it asks of you",
        list: [
          "Protein at every meal rather than all of it at dinner. Meat, fish, eggs, dairy, pulses and powder all count.",
          "Something else gives way. Raising protein's share means lowering carbohydrate's, or fat's, or both.",
          "Grams and shares can disagree. A large day at 30% protein is more grams than a small day at 35%."
        ]
      },
      {
        h: "Worth knowing before you start",
        list: [
          "Protein is the most filling of the three, which is the main reason this pattern shows up in weight studies at all.",
          "For building muscle, the gram total is what has been studied — the useful range tops out at around 1.6 to 2.2 g per kilogram of bodyweight, and more than that has not been shown to add anything.",
          "In healthy people, high protein has not been shown to harm the kidneys. If yours are not healthy, that is a conversation for a doctor rather than an app."
        ]
      },
      {
        h: "What this app can tell you",
        p: [
          "FitForge will show you protein's share of the day's logged energy against the range this pattern describes. Your gram target lives with the other macro tiles and does not change when you pick a pattern.",
          "Anything you logged as calories alone is not in the split."
        ]
      }
    ]
  },

  {
    id: "balanced-403030",
    name: "Balanced 40/30/30",
    oneLiner: "A fixed split — 40% carbohydrate, 30% protein, 30% fat — held every day.",
    kind: "composition",
    checks: "Your macro split for the day",
    targets: [
      { macro: "carbs", minPct: 35, maxPct: 45 },
      { macro: "protein", minPct: 25, maxPct: 35 },
      { macro: "fat", minPct: 25, maxPct: 35 }
    ],
    guide: [
      {
        p: [
          "A fixed macronutrient split, aimed at 40% of energy from carbohydrate, 30% from protein and 30% from fat, and held day to day. It is the shape popularised as the Zone diet, and it survives mostly as a default that people find easy to aim at.",
          "Nothing is excluded. It is a set of proportions, and the ranges allow five points either side of each target so an ordinary day is not treated as a miss: carbohydrate 35 to 45%, protein 25 to 35%, fat 25 to 35%."
        ]
      },
      {
        h: "What it asks of you",
        list: [
          "Every meal roughly the same shape, rather than a carbohydrate breakfast and a protein dinner that average out.",
          "It needs macros logged to mean anything at all. Of the patterns here, this is the one that asks most of your logging.",
          "The three shares move together — they always sum to 100%. Pushing one up pushes another down, which is not always the one you intended."
        ]
      },
      {
        h: "Worth knowing before you start",
        list: [
          "The specific numbers are not magic. Trials comparing splits at matched calories generally find small differences between them; the original claims made for 40/30/30 went a long way past what was shown.",
          "Its real use is as a target that stops any one macro drifting. If your days swing between extremes, aiming at a fixed split is a way of noticing.",
          "It sits alongside the app's own macro targets rather than replacing them — those are set from your bodyweight and your calorie budget, which is a different calculation."
        ]
      },
      {
        h: "What this app can tell you",
        p: [
          "FitForge will show you all three shares for the day against these ranges, from the macros you logged.",
          "Meals logged as calories alone are not in the split, and a day that is half logged will show a split for that half."
        ]
      }
    ]
  }
];

// The guides join the Learning Centre as ordinary articles, under their own
// topic, so they are read where all the other reading lives. Written here
// rather than in learn.js because the prose and the rule it describes have to
// change together — a guide that says 26% while the rule checks 30% is the
// exact failure this whole file is arranged to prevent.
(function attachGuides() {
  window.LEARN_ARTICLES = window.LEARN_ARTICLES || [];
  for (const plan of window.DIET_PLANS) {
    window.LEARN_ARTICLES.push({
      slug: "pattern-" + plan.id,
      title: plan.name,
      oneLiner: plan.oneLiner,
      topic: "eating",
      planId: plan.id,
      body: plan.guide
    });
  }
})();
