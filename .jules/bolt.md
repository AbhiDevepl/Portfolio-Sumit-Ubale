## 2025-05-15 - Optimizing Gallery Rendering and Visibility Checks

**Learning:** Re-calculating full gallery data inside a loop (O(N^2)) and using expensive `getComputedStyle` / `innerText` during visibility checks were major performance bottlenecks. Hoisting data aggregation and using `offsetParent` / `textContent` significantly improved rendering and filtering speed.

**Action:** Always hoist O(N) computations out of loops and prefer faster DOM properties like `offsetParent` and `textContent` for high-frequency operations.
