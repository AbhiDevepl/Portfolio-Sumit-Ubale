## 2025-05-15 - O(N²) Data Aggregation in Rendering Loops
**Learning:** In architectures where data is aggregated via getters (e.g., `getGalleryData()`), calling these getters inside a loop that iterates over a large dataset (1,200+ items) creates a massive O(N²) bottleneck. This was the primary cause of the ~2.6s gallery rendering time.
**Action:** Always hoist data aggregation and metadata lookups out of loops. Use hash maps (objects) for O(1) resolution of related data (like category names from slugs) during the rendering cycle.

## 2025-05-15 - Layout Thrashing from Computed Styles
**Learning:** Using `window.getComputedStyle` to check visibility (opacity/display) and `innerText` for data extraction on 1,000+ DOM elements triggers significant layout thrashing, as these properties force the browser to recalculate the box model.
**Action:** Use `element.offsetParent !== null` to check if an element is hidden via `display: none` and `textContent` instead of `innerText` for faster, non-reflow-triggering DOM reads.
