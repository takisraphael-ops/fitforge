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

### Canaries

Two, both for the same reason — a checker that can only ever print "ok" has not
been shown to detect anything:

- a full-screen transparent blocker is added, and the reachability pass must
  report the controls it covers;
- an empty modal body is injected, and the empty-sheet pass must flag it, then
  fall silent once it is given content.

If either canary fails, treat every other result on the run as meaningless.

## `tap.js`

`safeTap(page, selector)` for the Playwright suites. Asserts the element is
genuinely the thing at its own coordinates, then taps for real. It also waits
out transient full-screen layers — the cold-start splash and the tab-transition
loader — which the old `.click()` calls sailed straight through.

`reportTapMisses()` prints anything it refused to tap.
