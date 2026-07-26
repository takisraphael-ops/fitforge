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

It ends with a canary: a full-screen transparent blocker is added and the audit
must notice. A checker that can only print "ok" proves nothing, so if the
canary fails, treat every other result as meaningless.

## `tap.js`

`safeTap(page, selector)` for the Playwright suites. Asserts the element is
genuinely the thing at its own coordinates, then taps for real. It also waits
out transient full-screen layers — the cold-start splash and the tab-transition
loader — which the old `.click()` calls sailed straight through.

`reportTapMisses()` prints anything it refused to tap.
