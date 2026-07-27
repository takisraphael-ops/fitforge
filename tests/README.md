# UI reachability checks

These exist because of one bug: the weekly plan's assign sheet rendered behind
its own overlay — present in the DOM, invisible, and untappable — and it passed
every test it had. The tests drove the app with `element.click()`, which
dispatches straight at the node and never asks whether a finger could reach it.

Run against a local server (`python3 -m http.server 8199` from the repo root).

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

## `tap.js`

`safeTap(page, selector)` for the Playwright suites. Asserts the element is
genuinely the thing at its own coordinates, then taps for real. It also waits
out transient full-screen layers — the cold-start splash and the tab-transition
loader — which the old `.click()` calls sailed straight through.

`reportTapMisses()` prints anything it refused to tap.
