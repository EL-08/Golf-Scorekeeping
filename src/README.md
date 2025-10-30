# Golf Scorekeeper (Mobile-first Web App)

A lightweight, offline-friendly golf scorekeeper for **1–4 players** and **9 or 18 holes**. Built as a mobile-first responsive web app—no backend required. Scores persist in the browser.

## Features
- ✅ 9 or 18 holes selectable at start
- ✅ 1–4 players with per-hole stroke inputs
- ✅ Auto-calculated running totals (header pills + table footer)
- ✅ Mobile-friendly numeric keypad (`inputmode="numeric"`)
- ✅ Undo (reverts the last change) and clear-last (empties the current/last edited cell)
- ✅ Full reset
- ✅ Persistence via `localStorage` (survives refresh)
- ✅ Attempts to prevent screen sleep using the **Screen Wake Lock API** (if supported)

## How to run locally
1. Download the repository files or the zip.
2. Open `index.html` in a modern browser (Chrome, Edge, Safari, Firefox).
   - For best mobile experience, add to home screen / standalone mode if your browser supports it.
3. Start a new round from the setup screen.

> No build step or server is required for the MVP.

## Known issues & future work
- Some browsers restrict the Wake Lock API unless there is a user gesture or under battery/OS policies.
- No par/handicap support in the MVP—only strokes and totals.
- Accessibility is basic; could add better labels, row/column summaries, and keyboard shortcuts.
- Future: 18/9 toggle mid-round with safe migration, share/export round, PWA install prompt and offline caching, par/birdie/handicap/net scoring, theme toggle, haptics on change, and per-hole notes.
