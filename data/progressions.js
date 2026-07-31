// Movement ladders: the order to learn something in, and how you know you are
// ready for the next rung.
//
// The Learning Centre has defined "Ladder" since it shipped — "the order to
// learn a movement in… you move up a rung when you have earned it, not on a
// date" — and nothing implemented it. This is that.
//
// ---------------------------------------------------------------------------
// THE GATE VOCABULARY
//
// A gate is the evidence that a rung is behind you. The rule it lives by is
// the same one the eating patterns live by: **a gate may only ask for
// something the app can already see in a logged set.** A meal record holds a
// time and four numbers; a set record holds reps, weight, seconds and done.
// So these are the only four shapes a gate may take:
//
//   { sets: 3, reps: 8 }               three sets of eight or more, one session
//   { sets: 2, holdSec: 45 }           two holds of forty-five seconds or more
//   { sets: 3, reps: 5, addedKg: 20 }  as above, carrying at least 20 kg
//   { sets: 1, reps: 1 }               one clean rep
//
// "Clean form", "no kipping", "full depth" are all real criteria and none of
// them may appear here, because the app cannot check them and a gate it cannot
// check is a gate that opens itself. Where form is the actual limit, the rung
// says so in its `note`, which is advice from the guide rather than a
// condition the app pretends to verify.
//
// `requires` handles the case a straight ladder cannot: the muscle-up is not
// the next rung after a pull-up, it is the point where a pull chain and a dip
// chain meet. A rung with unmet requirements reports what is missing rather
// than silently sitting there as "next".
//
// Nothing here forbids anything. You can log any exercise at any time; the
// ladder reports where your logs put you, and says what the next rung asks
// for. It is a readout, not a gate on the door.
// ---------------------------------------------------------------------------

window.PROGRESSIONS = [
  {
    id: "vertical-pull",
    name: "Pull-up to muscle-up",
    pattern: "Vertical pull",
    oneLiner: "Hang, row, pull, then over the bar. The long one — expect months, not weeks.",
    rungs: [
      { exerciseId: "dead-hang", gate: { sets: 2, holdSec: 45 },
        note: "Grip gives out long before the back does. This is the rung most people skip and then stall on." },
      { exerciseId: "inverted-row", gate: { sets: 3, reps: 10 },
        note: "Walk the feet forward to make it harder — the flatter you are, the closer to a pull-up." },
      { exerciseId: "negative-pull-up", gate: { sets: 3, reps: 5 },
        note: "Five seconds down. A fast drop is not a negative and trains nothing." },
      { exerciseId: "pull-up", gate: { sets: 3, reps: 8 } },
      { exerciseId: "chest-to-bar-pull-up", gate: { sets: 3, reps: 5 },
        note: "Chin over the bar is not the same as chest to the bar. The extra range is what the muscle-up needs." },
      { exerciseId: "explosive-pull-up", gate: { sets: 3, reps: 3 },
        note: "Height, not reps. Aim the bar at your stomach." },
      { exerciseId: "muscle-up", gate: { sets: 1, reps: 1 }, requires: ["straight-bar-dip"],
        note: "Two separate strengths meet here: pulling high enough, and pressing out of a deep dip. Missing either is why the transition stalls." }
    ]
  },

  {
    id: "dip",
    name: "Bench dip to straight-bar dip",
    pattern: "Vertical push",
    oneLiner: "The other half of the muscle-up, and a good chest and triceps builder on its own.",
    rungs: [
      { exerciseId: "bench-dip", gate: { sets: 3, reps: 12 } },
      { exerciseId: "band-assisted-dip", gate: { sets: 3, reps: 8 },
        note: "Move to a lighter band rather than adding reps once eight is comfortable." },
      { exerciseId: "tricep-dip", gate: { sets: 3, reps: 8 } },
      { exerciseId: "straight-bar-dip", gate: { sets: 3, reps: 5 },
        note: "The forward lean is what keeps you on the bar. Upright and you go backwards." }
    ]
  },

  {
    id: "horizontal-push",
    name: "Push-up to one-arm push-up",
    pattern: "Horizontal push",
    oneLiner: "Every push-up variation in the order that makes the next one possible.",
    rungs: [
      { exerciseId: "incline-push-up", gate: { sets: 3, reps: 12 },
        note: "Lower the surface a little each time rather than jumping straight to the floor." },
      { exerciseId: "knee-push-up", gate: { sets: 3, reps: 12 } },
      { exerciseId: "push-up", gate: { sets: 3, reps: 15 } },
      { exerciseId: "diamond-push-up", gate: { sets: 3, reps: 10 },
        note: "Mostly triceps. If the elbows flare, the hands are too far forward." },
      { exerciseId: "archer-push-up", gate: { sets: 3, reps: 5 },
        note: "Reps are per side. The straight arm is a lever helping you, not a passenger." },
      { exerciseId: "one-arm-push-up", gate: { sets: 1, reps: 1 },
        note: "Most of this is resisting rotation, which is why the feet go wide." }
    ]
  },

  {
    id: "squat-pattern",
    name: "Squat to pistol squat",
    pattern: "Squat",
    oneLiner: "Two legs to one. Ankle mobility stops more people here than leg strength does.",
    rungs: [
      { exerciseId: "box-squat-bodyweight", gate: { sets: 3, reps: 15 },
        note: "Touch the box, do not sit on it. Lower the box over time." },
      { exerciseId: "goblet-squat", gate: { sets: 3, reps: 12 } },
      { exerciseId: "bulgarian-split-squat", gate: { sets: 3, reps: 10 },
        note: "The first genuinely single-leg rung, and the one that exposes a weak side." },
      { exerciseId: "assisted-pistol-squat", gate: { sets: 3, reps: 5 },
        note: "Progress by using the hands less, not by adding reps." },
      { exerciseId: "pistol-squat", gate: { sets: 1, reps: 3 },
        note: "If the heel lifts, it is ankles rather than strength — work the ankle drills in the mobility library." }
    ]
  },

  {
    id: "front-lever",
    name: "Hollow hold to front lever",
    pattern: "Straight-arm pull",
    oneLiner: "A straight-arm pulling skill. Shorten the lever, then lengthen it as you get stronger.",
    rungs: [
      { exerciseId: "hollow-hold", gate: { sets: 2, holdSec: 45 } },
      { exerciseId: "tuck-front-lever", gate: { sets: 3, holdSec: 15 },
        note: "Arms stay locked. The moment they bend it becomes a different exercise." },
      { exerciseId: "advanced-tuck-front-lever", gate: { sets: 3, holdSec: 15 },
        note: "Open at the hips, not the knees — thighs in line with the torso." },
      { exerciseId: "straddle-front-lever", gate: { sets: 3, holdSec: 10 },
        note: "Narrow the straddle to progress. A wide one is a shorter lever and an easier hold." },
      { exerciseId: "front-lever", gate: { sets: 1, holdSec: 8 } }
    ]
  },

  {
    id: "handstand",
    name: "Plank to freestanding handstand",
    pattern: "Balance",
    oneLiner: "Shoulders first, then the wall, then the balance. The balance is a skill, not a strength.",
    rungs: [
      { exerciseId: "plank", gate: { sets: 2, holdSec: 60 } },
      { exerciseId: "pike-hold", gate: { sets: 3, holdSec: 30 },
        note: "Arms straight, ears between the biceps. This is the shoulder position the handstand needs." },
      { exerciseId: "wall-handstand", gate: { sets: 3, holdSec: 30 },
        note: "Chest to the wall, not back to it — back-to-wall teaches an arch you then have to unlearn." },
      { exerciseId: "freestanding-handstand", gate: { sets: 1, holdSec: 10 },
        note: "Learn the bail before you need it. Balance comes from the fingers, not the shoulders." }
    ]
  }
];
