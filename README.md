# FitForge

An **offline-first workout and nutrition tracker**, built as a Progressive Web App (PWA). No accounts, no servers, no tracking — all your data lives locally in your browser and works fully offline. Install it to your phone's home screen and it behaves like a native app.

## Features

- **🏠 Home dashboard** — daily energy/calorie budget, macro tiles (protein / carbs / fat), muscle-group balance, bodyweight trend, a training-frequency heatmap, and a backup reminder that appears when one is actually due.
- **💪 Workout tracking** — log exercises and sets with automatic personal-record (PR) detection, a plate calculator, per-exercise rest targets, RPE, warm-up sets, supersets, drop sets, mid-session reordering, and a what-to-load-next hint built from your own history.
- **📚 Exercise library** — 165 built-in exercises with technique notes, common mistakes and form videos, plus support for adding your own custom ones. Guided interval, circuit, AMRAP and mobility runners; calisthenics progression ladders.
- **🥗 Nutrition** — log meals against personalized macro goals. 276 built-in foods: ~210 UK dishes and 66 weigh-it raw ingredients, all stored per-100 g so any entry scales exactly to what your scale says. TDEE recalibration measures your real maintenance from logged weigh-ins vs logged intake — and says so when the data can't support a number.
- **📊 Stats & history** — training-volume trends, e1RM and strength standards, muscle-group distribution over time, and full workout history with a past-workout editor.
- **🧍 Body map** — interactive muscle diagram.
- **📴 Offline-first PWA** — service worker caching means it loads instantly and works with no connection. Installable on mobile and desktop.

## Tech stack

Deliberately simple — **vanilla HTML, CSS, and JavaScript**. No framework, no build step, no dependencies.

| Path | What it is |
|------|-----------|
| `index.html` | App shell + launch splash |
| `css/styles.css` | All styling |
| `js/app.js` | Main application logic (views, state, rendering) |
| `js/storage.js` | Local persistence — IndexedDB, with a memory fallback that drains back in when the database recovers |
| `js/utils.js` | Shared helpers (units, energy, e1RM, dates) |
| `js/body-map.js` | Interactive muscle map |
| `js/meal-search.js` | Offline fuzzy food search (typo-tolerant) |
| `js/interval-runner.js` | Guided interval/circuit timing engine with audio cues |
| `js/progression.js` | Calisthenics progression ladders |
| `js/diet-plan.js` | Eating-pattern guidelines |
| `js/exercise-links.js` | Curated form-video links |
| `data/exercises.js` | Built-in exercise dataset (165 exercises) |
| `data/meals.js` | Built-in dish dataset (~210 UK meals, per-100 g) |
| `data/ingredients.js` | Raw-ingredient dataset (66 entries, per-100 g, state-explicit) |
| `data/sessions.js` | Preset workout sessions |
| `data/learn.js` | Learning-centre articles |
| `sw.js` | Service worker (network-first for code, cache-first for assets) |
| `manifest.webmanifest` | PWA manifest |
| `tests/` | Browser-driven test suites (`node tests/run-all.js`) |
| `tools/bump.js` | Version bump — keeps index.html, sw.js and app.js in lockstep |
| `tools/build_meals.py` | Helper script for regenerating the meals dataset |

## Running locally

Because it's a static site, you just need any local web server. With Node installed:

```bash
npx serve -l 3000 .
```

Then open **http://localhost:3000** in your browser.

To run the test suites (Playwright + Chromium required):

```bash
python3 -m http.server 8199 &   # from the repo root
node tests/run-all.js
```

## Data & privacy

All workout, nutrition, and bodyweight data is stored **only in your browser's IndexedDB**. Nothing is uploaded anywhere — the app makes no network requests beyond fetching its own files, and the service worker refuses cross-origin traffic outright.

The flip side of local-only storage: clearing site data, uninstalling the PWA, or (on iOS Safari, when the app is used in a tab rather than installed) seven days of not visiting can erase everything. The app asks the browser for persistent storage, tells you in Settings whether your data is protected, and reminds you to export a JSON backup when one is overdue — take it up on that.

## License

Personal project — all rights reserved (for now).
