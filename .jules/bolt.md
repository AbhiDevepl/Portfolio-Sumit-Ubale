# Bolt's Performance Journal

## 2026-07-05 - [Duplicate Homepage Fetches & DOM Bloat]
**Learning:** The homepage was fetching `portfolio.json` twice (once in an inline script and once in `content-loader.js`) and rendering the entire 1000+ item dataset into the DOM immediately. This caused unnecessary network overhead (~291KB) and high Total Blocking Time (TBT).
**Action:** Consolidate fetching into a single class instance, implement batch rendering (4 items initially, then 6 on 'Load More'), and move inline logic into the deferred script.

## 2026-07-05 - [CI Compatibility in Legacy Environments]
**Learning:** The Cloudflare Workers CI environment strictly rejects ES2020+ features like optional chaining (`?.`), nullish coalescing (`??`), and `Array.prototype.flat()`.
**Action:** Use manual logical checks (`a && a.b`) and traditional loops for flattening to ensure build stability without sacrificing functionality.

## 2026-07-05 - [Regression via Decoupling]
**Learning:** Moving inline event listeners to a centralized class requires explicit manual attachment in `setupListeners`. Deleting the inline scripts broke category filters because the new class didn't "know" about the existing HTML buttons.
**Action:** Always verify that interactive elements (buttons, filters) are re-wired when consolidating scripts.
