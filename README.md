# FitForge

An **offline-first workout and nutrition tracker**, built as a Progressive Web App (PWA). No accounts, no servers, no tracking — all your data lives locally in your browser and works fully offline. Install it to your phone's home screen and it behaves like a native app.

## Features

- **🏠 Home dashboard** — daily energy/calorie budget, macro tiles (protein / carbs / fat), muscle-group balance, bodyweight trend, and a training-frequency heatmap.
- **💪 Workout tracking** — log exercises and sets with automatic personal-record (PR) detection, a plate calculator, a rest timer, and a tap-first numeric keypad for fast entry.
- **📚 Exercise library** — ~850 built-in exercises, plus support for adding your own custom ones.
- **🥗 Nutrition** — log meals, track macros against personalized goals, and search a built-in meal database.
- **📊 Stats & history** — training-volume trends, muscle-group distribution over time, and full workout history.
- **🧍 Body map** — interactive muscle diagram.
- **📴 Offline-first PWA** — service worker caching means it loads instantly and works with no connection. Installable on mobile and desktop.

## Tech stack

Deliberately simple — **vanilla HTML, CSS, and JavaScript**. No framework, no build step, no dependencies.

| Path | What it is |
|------|-----------|
| `index.html` | App shell |
| `css/styles.css` | All styling |
| `js/app.js` | Main application logic (views, state, rendering) |
| `js/storage.js` | Local data persistence (localStorage) |
| `js/utils.js` | Shared helpers |
| `js/body-map.js` | Interactive muscle map |
| `js/meal-search.js` | Meal database search |
| `data/exercises.js` | Built-in exercise dataset |
| `data/meals.js` | Built-in meal/nutrition dataset |
| `sw.js` | Service worker (offline caching) |
| `manifest.webmanifest` | PWA manifest |
| `tools/build_meals.py` | Helper script for regenerating the meals dataset |

## Running locally

Because it's a static site, you just need any local web server. With Node installed:

```bash
npx serve -l 3000 .
```

Then open **http://localhost:3000** in your browser.

## Data & privacy

All workout, nutrition, and bodyweight data is stored **only in your browser's local storage**. Nothing is uploaded anywhere. Clearing your browser data (or uninstalling the PWA) removes it, so export/back it up if that matters to you.

## License

Personal project — all rights reserved (for now).
