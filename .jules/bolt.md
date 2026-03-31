## 2026-03-31 - [Gallery Rendering Optimization]
**Learning:** In a vanilla JS architecture with 1,000+ items, even simple data aggregation methods like `getGalleryData()` can become a critical bottleneck if called inside a rendering loop (O(N^2)). Hoisting the aggregation and using O(1) lookup maps for metadata (like category names) is essential for maintaining a responsive UI.
**Action:** Always check for redundant data processing or repeated getter calls within high-frequency loops, especially when the dataset exceeds 100 items.
