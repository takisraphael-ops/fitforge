// How much of the screen is actually showing page content.
//
// Shared because two suites need it and because getting it wrong is the
// reason a blank-screen bug was reported fixed twice while it was still
// there. The first version measured getBoundingClientRect alone, which
// answers a layout question, not a painting one: it read 82% covered while
// the screen was blank, because the element it was measuring was being
// clipped out of existence by an ancestor.
//
// Clipping is the whole subject here — a tab change leaves #main holding an
// absolutely-positioned ghost and an empty new view, so #main measures zero
// and `overflow: hidden` erases the ghost — so this walks the ancestor chain
// and intersects every box that crops its children.
//
// Evaluate the exported source in the page, then call window.__ink().
module.exports = `window.__ink = function () {
  const vw = innerWidth, vh = innerHeight;
  let area = 0;
  for (const el of document.querySelectorAll('#main > .view, body > .view')) {
    if (!el.children.length) continue;                 // built but not filled
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) continue;
    const r = el.getBoundingClientRect();
    let box = { l: r.left, t: r.top, rt: r.right, b: r.bottom };
    for (let n = el.parentElement; n && n !== document.documentElement; n = n.parentElement) {
      const ncs = getComputedStyle(n);
      if (!/hidden|clip|auto|scroll/.test(ncs.overflow + ncs.overflowX + ncs.overflowY)) continue;
      // A fixed child escapes an ancestor's clipping unless that ancestor
      // establishes a containing block for it.
      if (cs.position === 'fixed' &&
          ncs.transform === 'none' && ncs.filter === 'none' && ncs.perspective === 'none') continue;
      const nr = n.getBoundingClientRect();
      box.l = Math.max(box.l, nr.left);
      box.t = Math.max(box.t, nr.top);
      box.rt = Math.min(box.rt, nr.right);
      box.b = Math.min(box.b, nr.bottom);
    }
    area += Math.max(0, Math.min(box.rt, vw) - Math.max(box.l, 0)) *
            Math.max(0, Math.min(box.b, vh) - Math.max(box.t, 0));
  }
  return Math.round((area / (vw * vh)) * 100);
};`;
