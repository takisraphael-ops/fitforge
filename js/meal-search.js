// FitForge Quick Add — offline fuzzy meal search.
// No dependencies, no network. Scores combine token-prefix matching,
// trigram (Dice) similarity and light typo tolerance so "spag bol",
// "tikka masla" or "porrige" still land on the right meal.
(function () {
  "use strict";

  function norm(s) {
    return (s || "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9 ]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function trigrams(s) {
    const t = new Set();
    const padded = "  " + s + " ";
    for (let i = 0; i < padded.length - 2; i++) t.add(padded.slice(i, i + 3));
    return t;
  }

  function dice(aSet, bSet) {
    if (!aSet.size || !bSet.size) return 0;
    let inter = 0;
    for (const g of aSet) if (bSet.has(g)) inter++;
    return (2 * inter) / (aSet.size + bSet.size);
  }

  // Bounded Levenshtein — early-outs at max 2 edits (enough for typos).
  function editsWithin2(a, b) {
    if (Math.abs(a.length - b.length) > 2) return false;
    const dp = [];
    for (let i = 0; i <= a.length; i++) dp[i] = [i];
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      let rowMin = Infinity;
      for (let j = 1; j <= b.length; j++) {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
        if (dp[i][j] < rowMin) rowMin = dp[i][j];
      }
      if (rowMin > 2) return false;
    }
    return dp[a.length][b.length] <= 2;
  }

  // Precomputed index: built once on first search.
  let index = null;
  function buildIndex(db) {
    index = db.map(e => {
      const names = [norm(e.name)].concat((e.syn || []).map(norm));
      return {
        entry: e,
        names,
        tokens: names.map(n => n.split(" ")),
        tris: names.map(n => trigrams(n))
      };
    });
  }

  function scoreQuery(qNorm, qTokens, qTri, item) {
    let best = 0;
    for (let v = 0; v < item.names.length; v++) {
      const name = item.names[v];
      let s = 0;
      if (name === qNorm) s = 1.0;
      else if (name.startsWith(qNorm)) s = 0.92;
      else if (name.includes(qNorm)) s = 0.85;
      else {
        // token-level: every query token should prefix-match, fuzzy-match
        // or trigram-match some name token.
        const nameTokens = item.tokens[v];
        let matched = 0;
        for (const qt of qTokens) {
          let hit = 0;
          for (const nt of nameTokens) {
            if (nt === qt) { hit = Math.max(hit, 1); }
            else if (nt.startsWith(qt) && qt.length >= 2) { hit = Math.max(hit, 0.85); }
            else if (qt.length >= 4 && editsWithin2(qt, nt)) { hit = Math.max(hit, 0.7); }
          }
          matched += hit;
        }
        const tokenScore = qTokens.length ? (matched / qTokens.length) * 0.8 : 0;
        const triScore = dice(qTri, item.tris[v]) * 0.75;
        s = Math.max(tokenScore, triScore);
        // small boost when both signals agree
        if (tokenScore > 0.4 && triScore > 0.3) s = Math.min(0.84, s + 0.08);
        // specificity tie-breaker: shorter names that the query covers more
        // of rank above long names that merely contain the same tokens.
        if (s > 0.3) s += 0.04 * Math.min(1, qTokens.length / nameTokens.length);
      }
      // synonym matches score slightly under the primary-name equivalent
      if (v > 0) s *= 0.97;
      if (s > best) best = s;
    }
    return best;
  }

  /**
   * Search the meal DB. Returns { results, confident }.
   * results: [{ entry, score }] sorted best-first, max `limit`.
   * confident: false when even the best hit is a weak guess — the UI then
   * frames results as "nearest matches" instead of direct hits.
   */
  function search(query, db, limit) {
    if (!index || index.length !== db.length) buildIndex(db);
    const qNorm = norm(query);
    if (!qNorm) return { results: [], confident: false };
    const qTokens = qNorm.split(" ");
    const qTri = trigrams(qNorm);
    const scored = [];
    for (const item of index) {
      const s = scoreQuery(qNorm, qTokens, qTri, item);
      if (s > 0.12) scored.push({ entry: item.entry, score: s });
    }
    scored.sort((a, b) => b.score - a.score);
    const results = scored.slice(0, limit || 8);
    return { results, confident: results.length > 0 && results[0].score >= 0.45 };
  }

  // kcal always derived from macros (4/4/9) so totals reconcile; `xk` carries
  // non-macro energy (alcohol) for the few entries that need it.
  function macrosFor(entry, grams) {
    const k = grams / 100;
    const protein = entry.p * k;
    const carbs = entry.c * k;
    const fat = entry.f * k;
    const kcal = Math.round(4 * (protein + carbs) + 9 * fat + (entry.xk || 0) * k);
    return {
      kcal,
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fat * 10) / 10
    };
  }

  window.MealSearch = { search, macrosFor, norm };
})();
