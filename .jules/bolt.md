# Bolt's Performance Journal

## 2025-05-15 - Sorting & State Optimization in Portfolio Gallery
**Learning:** For large datasets (1,000+ items), `Array.prototype.sort` with nested `indexOf` calls creates an O(N*M) bottleneck. A Schwartzian Transform with O(1) Map lookups for weights is significantly faster.
**Learning:** Cloudflare Workers build environments for static sites may lack support for ES2020+ features like optional chaining (`?.`) and nullish coalescing (`??`). Reverting to ES6-compatible logical checks (`&&`, `||`) is necessary for CI stability.
**Learning:** `replaceChildren()` is a high-performance alternative to `innerHTML = ''` for clearing and updating DOM nodes in a single operation.
**Action:** Always prefer Map-based lookups for sort weights and batch state updates to prevent redundant re-renders. Check for ES2020 compatibility in the project's build pipeline early.
