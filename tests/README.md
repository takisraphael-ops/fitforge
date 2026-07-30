# UI reachability checks

These exist because of one bug: the weekly plan's assign sheet rendered behind
its own overlay — present in the DOM, invisible, and untappable — and it passed
every test it had. The tests drove the app with `element.click()`, which
dispatches straight at the node and never asks whether a finger could reach it.

Run against a local server (`python3 -m http.server 8199` from the repo root),
or let `run-all.js` start one for you.

## `run-all.js`

    node tests/run-all.js

Runs everything and exits non-zero if anything fails. Starts a static server on
8199 if one is not already up, and stops it afterwards.

This is the one that matters. The recurring failure here was never a missing
test — it was that nothing ran the tests. Five suites sat broken for months,
driving UI that had been redesigned away, and the only reason it came to light
was a bug report about something else entirely. A suite nobody runs is not
coverage; it is a note claiming coverage.

## `version-check.js`

    node tests/version-check.js

`index.html`, `sw.js` and `js/app.js` must all agree on one release version, and
`sw.js` must not hard-code asset versions of its own. Static, no browser.

This exists because the hand-sync ritual failed ten times running: `sw.js`'s
precache list stayed pinned at `?v=156` while the app shipped `?v=165`. Cache
keys include the query string, so **not one precached script could serve a real
request** — the app kept working purely on the runtime cache, which is exactly
why nobody noticed. The precache list is now derived from `CACHE`, and
`tools/bump.js` moves all three together so the mistake is not available.

## `finish-workout.js`

    node tests/finish-workout.js

Finishing is the commit point of the primary journey and it had no test — which
is how it shipped a loop that rewrote every set's numbers down one row and
discarded the last one, on every single Finish.

Everything is asserted against what lands in IndexedDB, not against what the
screen showed a moment earlier. Covers: the numbers you logged are the numbers
you keep; timed holds you typed but never ticked survive; declining "end
anyway?" leaves the workout untouched; and opening a numpad to *look* at a
prefilled value does not record that set as performed.

Confirm it can fail by restoring the old flush loop — it reports
`[[100,8],[100,8],[90,6]]` where you logged `100×8 / 90×6 / 80×5`.

## `tab-loader.js`

    node tests/tab-loader.js

Two constant-cost performance defects — the kind a stopwatch finds and a code
read talks you out of.

The first visit to each tab dropped a full-screen overlay at `z-index: 9000`
for 1.9s with no way out of it. It is decoration, and while it was up it ate
every tap aimed at the tab underneath: three tabs, every fresh install. It is
dismissible now, it releases pointer events the moment it starts fading, and
`.tabload` sets `touch-action: none` so the touch stack does not sit on the
`pointerdown` while it works out whether a scroll is starting. Without that,
roughly one tap in twelve was simply ignored.

The other is the Nutrition saved-meals highlight, which swept by animating
`left` — a layout property — on a 6s infinite loop for as long as the tab was
open. A reflow every frame, forever, at any data size. It moves on `transform`
now, and the check parks the element at both ends of the old and the new
version and compares: `left` percentages resolve against the containing block
and `translateX` percentages against the element, so the conversion factor is
easy to get wrong in a way nothing would ever report. Both are 528px.

Neither of these gets worse as history grows, which is exactly why they were
worth doing and the read-amplification findings alongside them were not — three
years of seeded data renders indistinguishably from a fresh install.

Section 1 is the control: left alone, the loader must still be up at 60% of its
hold. Without it, "the tap removed it" and "it was never up long" look the same.

## `import.js`

    node tests/import.js

Restore is the one operation that can destroy everything you have, and it was
guarded by a single truthy check on `version`.

Two consequences, both found by feeding it files a real person could plausibly
pick. Any JSON with a version key counted as a backup — a **package.json**
cleared all nine stores in "replace" mode, wrote the nine empty arrays it did
not have, threw nothing, and reported success. Twelve sessions became zero with
a cheerful toast. And because replace clears first and then writes record by
record with no transaction, anything that threw part-way through left whatever
had been written so far: four of sixteen hostile files ended with an **empty
database**, having started with real data.

So the property under test is not "are bad files rejected" but **"does my
existing data survive being shown a bad file"**. Every rejection case asserts
that the workouts, meals, bodyweights and prefs that were already there are
still exactly there — and separately that the file was not accepted *silently*,
because being told it worked is the worst outcome of the three.

Validation now runs before a byte is written, and names what is wrong:
`"workouts" is not a list`, `bodyweights[0] has no "date"`, `made by a newer
version of FitForge (v99)`. A snapshot is taken before a replace and restored
best-effort if any write fails — best-effort because giving up on store three
of nine while store two is still unhappy is the worst possible moment to stop
trying.

Section 3 injects a write failure at the platform boundary rather than through
app code, and section 4 round-trips a real export through JSON text to prove the
app can still read what it writes.

Four mutations, each losing a different guarantee: the original one-line check
(5 failures), the rollback removed (2), the rollback no longer best-effort (1),
and just the "no FitForge data in it" test removed — the silent wipe on its own
(3).

## `robustness.js`

    node tests/robustness.js

Does the app survive data that is plausible but broken? Every fixture is a
shape a real install could genuinely reach: an exercise deleted from the
library, a session saved before a field existed, an older or hand-edited backup
restored, a plan pointing at a template that is gone, a meal typed as zero.

It exists because two of them took the History tab **completely blank**:

    renderHistory   w.exercises.length      — workout with no exercises array
    U.volume(sets)  sets.reduce(...)        — exercise entry with no sets array

Each was one unguarded read among a dozen guarded ones in the same function,
and neither broke only its own row: the throw happened mid-render, so the whole
tab came out empty. `U.volume` and `U.bestSet` are guarded at the source now,
which covers all seven call sites at once.

The reason nothing else caught them is worth remembering. Every other suite
builds its fixtures by driving the app, so it only ever reads data the app
itself just wrote — correct by construction. This one writes to storage
directly, which is the only way to reproduce what a restore or an old version
leaves behind.

The check is not "did it throw" alone but "is the screen empty", because that
is the symptom a user would actually report. Confirmed on three mutations, each
naming its own line: `renderHistory:11884`, `renderHistory:11858` (which also
reports `blank: home`), and `renderHistory:11859`.

## `landing.js`

    node tests/landing.js

The Home landing screen: what it spends the first fold on, and the two things
that fill or tint it.

It used to spend 173px of an 844px screen — a fifth — on a logo bar carrying no
controls, plus a greeting set larger than the session title it sat above. The
first section holds that back. Its sharpest check is not a pixel budget but a
claim about *what the screen is about*: the biggest text painted above the fold
has to be the name of today's session. Restoring the ring number to 48px fails
it and names the culprit — `48px "2,674" vs title 46px`. Layout regressions
arrive one innocuous margin at a time, and nothing else in the suite would
notice.

The rest-day summary is derived arithmetic presented as fact, so it is checked
against what is in storage rather than against itself, and the fixture plants a
200kg session in the *previous* week on purpose. Switching the window from the
calendar week to a rolling seven days fails three checks with the exact numbers
— `3 vs 2`, `6.3k vs 4.3k`, `3h 20 vs 1h 50`. The block is also required to be
absent when nothing has been banked yet: a row of zeroes is a worse void than
the empty one it replaced.

Section five covers the ignition cluster — the round start cap that replaced a
rounded rectangle identical to every other primary button. Its checks are about
what makes it work rather than what makes it look good: round and ≥100px, its
ring clear of the screen edge, hit-testable at its own centre, a `touch-action`
it does not steal, a satellite control with a readable name, and the same three
ways in whenever you hold it. Four mutations are caught — rectangle (1), the
scroll opt-out removed (1), the reduced-motion rule dropped (1), the swap label
removed (1).

Two things this file got wrong and now does not. Every fixture states what
**today** is, because which hero renders depends on the weekday and the
training sections were quietly getting the rest hero on a Wednesday and looking
for controls that were never drawn. And the CTA is found by testid rather than
by class: when it became the ignition cap its class changed, and the old
selector reported `-1` instead of failing loudly.

The wash is two states, day and night, and the check reads the hour rule back
rather than trusting the attribute. The grain is asserted to be a whisper
(≤0.09 opacity) and to take no pointer events, because decoration that
intercepts a tap is not decoration.

## `guided.js`

    node tests/guided.js

The guided set runner — the default way a strength set gets logged.

It exists because of one specific complaint: inputting a set was clunky. The
diagnosis mattered more than the fix. It was never the number of controls; it
was that the app knew what you did last week, showed it to you as grey
placeholder text on the row, and then refused to log it until you typed the
same two numbers back in. `Done` on a prefilled-looking row answered *"Enter
weight and reps first"*. So the property under test is not "does the screen
render" but **a set identical to last session costs exactly one tap** —
section 1 drives that literally: open, read the two figures, press once, and
assert the stored record.

The second half matters as much. There are now two presentations over one set
model, and the failure mode of that arrangement is drift: one gets a
PR-detection fix and the other keeps the bug for a year. Section 3 pins them
together by logging the identical set both ways — once through the runner, once
by driving the classic row's numpad — and diffing the stored record field by
field. It found a real divergence on its first run (`touched: undefined vs
true`), which is now set inside `commitStrengthSet` where it belongs rather
than by whichever UI happened to collect the numbers.

Section 9 is the one that would be easy to skip and is the whole brief. The ask
was explicitly *size, not ceremony*, so the numbers must be ≥56px, the log
button ≥60px tall, and every figure a real 44px touch target — a guided flow
whose controls are the same size as the row it replaced has not solved
anything. It also plants `182.5` and checks it still fits beside the reps on a
390px screen, because the digit-count size step is the sort of thing that gets
refactored out.

The rest of it covers the ways a full-screen flow becomes a trap or a liar:
rest is drawn in place with no second overlay stacked on it and the exit
present on *both* views; the runner refuses to open for a session with nothing
that logs in sets and reps, and takes only the strength sets out of a mixed
one; leaving it does not drag you back on the next render; and there is only
ever one of it, which is what the in-flight open flag is for.

Nine mutations, each caught by the check that should catch it — prefill made
blind (8 failures), the rest-overlay suppression removed (1), the top bar drawn
only on the set view (1), the numpad's `Next` suppression removed (1), cardio
allowed into the plan (4), leaving the runner no longer opting out (2),
exercises never marked finished (1), the digits shrunk to row size (1), and the
one-field divergence above (1).

## `dial.js`

    node tests/dial.js

The body-part dial on the start-a-workout screen — the front door to choosing
an exercise.

Two decisions are load-bearing and both are easy to undo by accident. It opens
on **press**, not on a hold: hold is the right price for a shortcut nobody has
to find, and charging it for the primary path makes the app feel slow and the
menu invisible to anyone who was not told it exists. And **only the first level
is a radial** — `legs` alone has 19 exercises, so the second level stays the
wheel it already was. Section 1 pins the first by opening the menu at 120ms,
well inside `RADIAL_HOLD_MS`.

Section 3 is the reason this file earns its place. Building the dial found a
real bug in the shared radial layout that had been invisible since the feature
shipped: `legible()` compared label-to-label and label-to-icon but never
icon-to-icon. With four slices or fewer the labels — wider than the circles —
always collided first, so the gap never showed. At seven spokes the circles
overlap while the labels still clear, and Playwright refused to click `legs`
because `core` was sitting on top of it.

Fixing it turned up two more things, both now load-bearing:

* Seven 64px slices do not fit inside the dock's ±52° arc on a 390px screen at
  *any* radius — the widest achievable gap between adjacent centres is about
  62px against the 66px they need. That cap is a fact about the dock, not about
  radials, so it is now per-menu, and a wheel that still cannot fit asks for
  compact 48px slices instead of degrading into a row of overlapping circles.
* Icons are compared as circles, not boxes. Slices on an arc sit diagonally
  from each other, so two comfortably separated circles still have bounding
  boxes that clip corners; rejecting on that pushes the radius past anything
  that fits and lands straight back in the degraded branch.

The downward flip is also back. It was written for triggers too near the top of
the screen for a fan above them, removed when no such trigger turned out to
exist, and is reachable again now that a dial lives at the top of the picker.
Down is only tried after up has failed, so every existing menu opens exactly
where it did.

Section 5 exists because "the ability to navigate to other body parts and
categories is essential" was a requirement, not a nicety: the chip row, the
horizontal swipe and search all still have to work, and the dial has to step
aside during a search since it has nothing to say about results that span every
category.

Five mutations — press reverted to hold (4 failures), the wide sweep and
compact slices removed (2), all nine categories on one wheel (2), the second
level never resetting (2), and the kit filter matching everything (3).

## `radial.js`

    node tests/radial.js

The hold menu on the dock's + button. Hold it, flick toward what you want, let
go — the choice becomes a direction rather than a target, which is the only
thing a radial buys over a sheet.

It is a shortcut, never the only route: tapping still opens the quick sheet,
and that tap path is also the accessible one, because a long press has no
keyboard equivalent and fights VoiceOver.

So the checks are not "does a menu appear" but the four ways a hidden gesture
ruins an app, one section each:

- **It fires when you did not mean it.** A 90ms press must open the sheet and
  no menu. Confirmed by dropping the threshold to 60ms: 2 failures.
- **It eats your scroll.** A press that travels more than 10px before the
  threshold is someone scrolling past the dock. Confirmed by deleting the
  cancellation: 2 failures.
- **It goes somewhere unreachable.** Slices are placed by trigonometry around a
  control pinned to the bottom of the viewport, so the arc has to open upward.
  Confirmed by flipping it: 4 failures, including slices buried under the dock
  — and note "on screen" alone would not have caught that, so each slice is
  hit-tested at its own centre the way `reach-audit` does.
- **There is no way out.** Escape and the scrim both dismiss it.

Section fourteen exists because of a bug report, and it is the shape of report
worth remembering: *"it doesn't go to Supplements if you choose Trends first."*

Panel navigation went through `nutritionScrollKey`, which is a memory of where
you were rather than a request to be moved — and the pager restores an exact
pixel offset in preference to it. So the first pick worked, because the offset
was 0, and every pick after it was overruled by the position the previous one
had left behind. Not just Supplements: everything, for the rest of the session.

**No single-pick test could ever have caught it.** Every check written up to
that point held a control, picked one slice, and asserted where it landed —
and all of them passed while the feature was broken on the second use. The
sequence is the test. Restoring the old lookup fails three of its four checks.

Section thirteen covers the set row's "···", which is the first trigger inside
a scroller: it keeps its `touch-action` so a drag still scrolls the list, and
removing that opt-out is caught.

Section eleven is the one that earned its keep when the menu spread from the
centre button to the four tabs. The `+` sits dead centre, so a symmetric fan
always fitted and hid the whole problem; the outer tabs sit ~60px from the edge,
where a comfortable fan throws its outermost slice off-screen. The arc is fitted
to the room on each side now — a fan from the middle, a quarter turn from the
edges — and fifteen trigger/width pairs are checked.

It checks **labels against other slices' circles**, not just label against
label, and that distinction is the whole value of the section. A compressed fan
makes the circles fit long before it makes the words fit: "This week" was
perfectly clear of its neighbour's *label* while sitting squarely underneath its
neighbour's *icon*. The first version of this check compared labels only, said
everything was fine, and a mutation that removed the fix passed clean. The app's
layout now models the same boxes and picks the first radius where nothing covers
a label — pinning the radius reproduces seven failures across three widths.

Sections nine and ten cover how anyone finds out the gesture exists, because
nothing on screen says a button can be held.

Nine is the press hint: a ring fills around the held control and, past halfway,
the slices ghost outward. It must not appear for a crisp tap (confirmed by
setting its delay to 0: the quick-tap check fails), must appear mid-hold with
one ghost per slice (confirmed by removing it: 2 failures), must never take a
tap itself, and must be gone in every way the hold can end — including when the
menu it was rehearsing actually opens, which is easy to forget and looks like
litter (confirmed by dropping that one `hideHint()`: 1 failure).

Ten is the tip in the quick sheet, which retires itself the first time the hold
is used. Its last check — that the tip is still gone *after a reload* — caught a
real bug: `loadPrefs` returns an explicit map of known keys, so the pref was
being written and never read back, and the tip would have reappeared forever.
Confirmed by removing that line again: 1 failure, and only that check catches
it. Anything written by `Storage.setPref` and expected in `state.prefs` has to
be listed in `loadPrefs`, and nothing else in the app enforces that.

The eighth section guards the highlight. The aimed slice scales, haloes, and
its artwork comes alive — all decoration. With motion switched off the
selection still has to be obvious, or someone who turned it off cannot use the
menu at all. Confirmed by making the highlight motion-only: it reports the same
colour on both slices.

The sixth section is the subtle one. The click that follows a hold is swallowed
so the button's own action does not fire as well — but that click only arrives
if the pointerup lands back on the trigger, and once the menu is up the scrim
can take it instead. A boolean would then stay armed and kill the next genuine
tap, minutes later. It is a deadline for that reason, and the section dismisses
with **Escape rather than by picking a slice**: picking navigates, which
re-renders the dock and hands you a brand new button with brand new state, so
it could never catch this. Confirmed by making the deadline effectively
permanent: 1 failure, and it is the right one.

## `muscle-map.js`

    node tests/muscle-map.js

Home's muscle balance, drawn on the body instead of as six flat bars. The bars
were accurate and said almost nothing — "Chest 30 / Back 0" is a fact you have
to assemble into a picture yourself, and the question the block exists to
answer is a spatial one.

It does **not** use `BodyMap.create()`. That builds an interactive widget: a
title, front/back and male/female toggles, a heat checkbox, a status line, a
legend, and a tap target on all fifteen zones. Home wants a picture. The
compact version draws the same geometry with the same class names, so every
heat colour in both themes comes from CSS that already existed, with no
listeners, no `tabindex` and no `role="button"` anywhere in it.

Three ways it could ship broken while still photographing well, one section
each:

- **The heat means nothing.** A body with every muscle the same colour is
  decoration. So "chest is hot" is paired with a control — lats and hamstrings,
  which the fixture never trains, must be `heat-0`. Without that control the
  check is satisfied by painting everything hot, which is exactly the failure
  that looks fine. Confirmed by making `heatClass` return `heat-4`
  unconditionally: 3 failures.
- **It becomes a control.** Home already has a dock, a hero and a food ring
  competing for taps. Fifteen invisible tap targets on a figure is a trap, and
  it would also make the reach audit's job meaningless. Confirmed by restoring
  `role="button"` / `tabindex` on the regions: it reports 21.
- **It cannot disappear.** `body-map.js` is its own script tag, so a cold start
  on a partial cache can genuinely be missing it.

That last one is worth spelling out. There are two independent mechanisms — a
capability guard and a `try`/`catch` — and removing either one alone still
passes, because the other catches it. Removing **both** does not just lose the
map: `[data-testid="home-week-volume"]` disappears too, because the throw takes
out the entire Home render. The fallback is not politeness about one card.

## `reach-audit.js`

Walks the app surface by surface and, for every interactive element on the
topmost layer, checks that `elementFromPoint` at its own position actually
lands on that element. It finds the whole class of bug, including on screens
that have no test at all.

    node tests/reach-audit.js

Three things it deliberately does **not** report, learned the hard way:

- **Content behind a scrim.** The topmost layer is resolved first, preferring a
  sheet nested inside an overlay over its container. Otherwise every control
  behind a scrim reads as broken, which is precisely what a scrim is for.
- **Content under the fixed dock at the current scroll position.** Anything
  that fails is scrolled into view and retested; a fixed bottom bar overlapping
  something until you scroll is normal. Only elements that cannot be reached
  *at all* are reported.
- **Non-convex shapes.** The body map's shoulder zone is two separate deltoids,
  so the centre of its bounding box lands on the chest. Probes sample a grid
  and pass if any point lands.

### Empty sheets

Reachability alone has a blind spot: a sheet with nothing in it fails no check,
because there is nothing to be covered by. "Add exercise" on a past session
opened a completely empty modal for weeks — `openModal(title, picker.el)` where
the builder returns `.body` — and no test noticed, because every test only
asserted the *button* existed.

So each surface also reports whether a deliberately-opened sheet rendered
nothing at all. Deliberately "no children and no text", not "few controls":
plenty of sheets are legitimately just text, and flagging those trains you to
ignore the column.

### Buried layers

The audit only walks the layer that owns the screen — background content
behind a scrim is *supposed* to be unreachable. That leaves a hole: if the
thing you just opened is not the layer on top, every control in it is skipped
and the surface still prints `ok`.

That is exactly how the numpad at `z-index: 95` sat under the modal scrim at
`100` and looked clean while being completely untappable, so the weight and rep
boxes on a past session could not be used at all. Pass `expectLayer` on any
surface that opens something, and a mismatch reports `BURIED` instead of a
silent pass on the wrong layer.

### Canaries

Two, both for the same reason — a checker that can only ever print "ok" has not
been shown to detect anything:

- a full-screen transparent blocker is added, and the reachability pass must
  report the controls it covers;
- an empty modal body is injected, and the empty-sheet pass must flag it, then
  fall silent once it is given content.

If either canary fails, treat every other result on the run as meaningless.

### It can actually fail now

The audit printed `UNREACHABLE`, `BURIED`, `EMPTY SHEET` and canary failures and
then **exited 0**, so `run-all.js` — which keys on the exit code — summarised it
as `ok` no matter what it found. The check the top of this file calls "the one
that matters" was the one that could not fail. It now exits non-zero on any
finding, any failed surface setup, any page error, or a failed canary.

The same shape had bitten `existence-sweep.js`: it globbed for `*_test.js`,
every committed suite is named `quiz.js`, `numpad.js`… and pointed at `tests/`
it matched **nothing** and printed a clean bill of health for zero files. It now
refuses to report a clean sweep of an empty set.

## `existence-sweep.js`

Static, no browser. Reads what the app renders out of `js/*.js`, then reads
each suite and reports two things:

    node tests/existence-sweep.js [suites-dir]

**Undriven controls.** Every interactive testid a suite *observes* but never
*operates*. This is the `wd-add-exercise` shape: the suite asserted the button
was there, never pressed it, and a sheet that opened completely empty passed
for weeks. Interactivity is read from the app source — `<button>`, an `on:`
handler, `role="button"` — rather than guessed from the name, so containers and
static labels are not reported.

**Dead selectors.** Testids the app can no longer render. If the suite taps one
it fails loudly, which is fine. If it asserts `!document.querySelector(...)` it
passes forever no matter what the app does — an existence-only check that has
become a tautology, which is worse than having no check at all.

Reading `data-testid` values needs the *whole* value expression, not just the
`"data-testid": "x"` form: the app also builds them by concatenation
(`"dock-" + t.id`), by ternary, and by template literal. Matching only the
simple form marks ~140 live selectors dead and buries the real ones.

Its canary runs nine fixtures — one per drive form the matcher claims to
understand, plus two that must be flagged. Each is a place the matcher can fail
silently and leave a whole suite looking clean; the first version's quote class
stopped at the inner quote of `'[data-testid="x"]'` and reported every suite as
driving nothing.

## `quiz.js`

Onboarding, end to end: eight steps, back-navigation, what lands in storage,
that it does not reopen for a returning user, and that closing it still counts
as onboarded so it stops nagging.

    node tests/quiz.js

It replaces a suite that had been broken for months without anyone noticing.
That one drove the quiz through `pquiz-range` and `pquiz-bignum` — a slider and
a big-number readout replaced by wheels — and it was the only suite reaching
`pquiz-finish`, so while it sat broken the one flow every user walks exactly
once, and cannot retry, had no coverage at all.

Two things it is careful about, both learned from the suites it replaces:

- It asserts the *values that land in storage*, not that the steps rendered.
  `dob` in particular has to come out as a date rather than an age, which is
  the shape of the change that broke the original.
- Its taps are hit-tested, so a control buried under another layer fails here
  instead of passing the way `element.click()` would.

Worth confirming it can fail before trusting it — break the `dob` write in
`saveQuiz` and the run should report `the DOB survived as a date, not an age`.

## `numpad.js`

The number pad in the active workout — the primary logging flow: the
tens/ones/quarter columns for weight, the last-session chip, Next moving to
reps, Log set, and that closing the pad commits the value.

    node tests/numpad.js

Replaces a suite that drove `numpad-wheel-whole` and `numpad-wheel-reps`.
Standard weight was split into tens + ones + ¼ so heavy loads are a quick spin
rather than a long scroll, and the reps column is `numpad-wheel-int`, so the
old one failed on a null wheel every run.

## `set-logging.js`

Ticking a set updates in place rather than re-mounting the screen. Node
identity is the whole assertion: if the pager and dock are the same objects
afterwards, nothing rebuilt them. A full re-render loses scroll position and
flashes the screen on every tap, which mid-set on a phone is the difference
between usable and not.

    node tests/set-logging.js

Replaces a suite that tapped the same set button twice in a row. Completing a
set opens the rest timer, which owns the screen by design, so the second tap
was intercepted and the run died before testing anything. Dismissing rest first
is what a real user does.

## `round-timer.js`

The round timer's readout has to fit inside the ring's hole.

    node tests/round-timer.js

It did not. The label sits ~60px above centre, where the hole's chord is only
~166px, but its box was 190px wide — so the ends of a long label ran out across
the stroke. Because the label is painted in the same accent as the ring, that
did not read as clipping: the text simply vanished. `1-2 STRAIGHT DOWN THE
MIDDLE` showed as `-2 STRAIGHT DOWN THE`.

Geometry rather than pixels: a circle's usable width at any row is the chord at
that height, so each row is checked against its own chord, across four labels
including one longer than anything the app ships. Confirm it can fail by
restoring the old `max-width: min(190px, 54vw)` on `.ivr-label`.

### On the general version of this

The audit gained a narrow companion check — text that its own box clips with no
ellipsis to show for it. Deliberately narrow. A wider version that hit-tested
each end of every text run flagged around thirty things per screen, nearly all
of them the fixed dock overlapping content at the current scroll position, or a
decorative SVG painted behind the words. It did not catch the ring bug either,
because that text was inside its own box — the box was wrong. A check that
cries wolf gets ignored, so it only fires where text is provably lost.

## `tap.js`

`safeTap(page, selector)` for the Playwright suites. Asserts the element is
genuinely the thing at its own coordinates, then taps for real. It also waits
out transient full-screen layers — the cold-start splash and the tab-transition
loader — which the old `.click()` calls sailed straight through.

`reportTapMisses()` prints anything it refused to tap.
