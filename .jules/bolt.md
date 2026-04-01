## 2025-05-15 - Gallery Rendering Optimization
**Learning:** In a vanilla JS application with 1,200+ items, repeated execution of data aggregation getters (like `getGalleryData()`) inside a rendering loop creates an O(N²) bottleneck, increasing rendering time from ~200ms to ~2,000ms+. Additionally, using `window.getComputedStyle()` to check for element visibility (`display: none`) inside a loop triggers expensive synchronous layout reflows.

**Action:**
1. Hoist data aggregation and expensive calculations outside of loops.
2. Use `element.offsetParent !== null` as a high-performance alternative to `getComputedStyle` for detecting `display: none` in items with `position: relative`.
3. Use `textContent` instead of `innerText` to avoid layout thrashing when reading element content.
4. Pre-calculate metadata lookup maps (e.g., category names) during data initialization to ensure O(1) resolution during the rendering cycle.
