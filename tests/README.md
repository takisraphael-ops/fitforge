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
