# Bolt's Performance Journal

## 2026-07-07 - [Architecture] Consolidated Content Loading
**Learning:** Inlining large data-fetching and rendering logic in `index.html` created a maintenance and performance debt. It caused duplicate ~300KB network requests for `portfolio.json` because both the inline script and `content-loader.js` were fetching it. Additionally, sequential fetches in loops delayed "Time to Interactive".
**Action:** Consolidate all homepage and gallery data logic into a single cached script (`scripts/content-loader.js`). Use `Promise.all` for parallel JSON fetching and an object-map (O(1) lookup) for category filtering instead of O(N) array scans.

## 2026-07-07 - [CI] Cloudflare Workers CI Compatibility
**Learning:** The project's CI environment strictly rejects ES2020+ features, specifically optional chaining (`?.`), nullish coalescing (`??`), and `Array.prototype.flat()`. Using these results in build failures even if the local environment supports them.
**Action:** Strictly use "Clean ES6" (classes, arrow functions, `const`/`let`) but manually check for null/undefined and implement manual flattening/cloning (using `Object.assign` or loops). Always verify with `node -c scripts/content-loader.js`.
