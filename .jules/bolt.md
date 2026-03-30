## 2026-03-04 - [Algorithmic Efficiency in Gallery Rendering]
**Learning:** Redundant aggregation of large JSON datasets inside rendering loops can lead to $O(N^2)$ complexity, significantly impacting performance as data grows. In `scripts/gallery-loader.js`, `getGalleryData()` was being called for every item, despite the data being static during a single render pass.
**Action:** Always hoist data processing and aggregation out of loops. Cache the results of expensive operations at the start of rendering functions and pass the cached data to item creation helpers.
