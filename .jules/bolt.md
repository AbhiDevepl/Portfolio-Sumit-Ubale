# Bolt's Performance Journal

## 2025-05-15 - [Consolidated Homepage Content Loading]
**Learning:** Found a major redundancy where `index.html` was fetching `data/portfolio.json` (~300KB) twice: once via an inline script for the initial grid and once via `scripts/content-loader.js`.
**Action:** Consolidate all fetching and rendering into a single `ContentLoader` class in `scripts/content-loader.js`. Use `Promise.all` for parallel JSON fetching and `DocumentFragment` for batch DOM updates.

## 2025-05-15 - [Preserving UX during Refactor]
**Learning:** Large architectural refactors (moving inline JS to classes) often lose visual polish like staggered animations or hover effects if not explicitly handled.
**Action:** Always verify `animationDelay` logic and event listener bindings (like video hovers) when migrating legacy code to modern class-based systems.
