## 2026-03-13 - [Gallery Rendering Complexity]
**Learning:** Redundant calls to data aggregation functions (like `getGalleryData()`) inside rendering loops for large datasets (1,000+ items) create an O(N²) bottleneck, severely impacting UI responsiveness during page load and category filtering.
**Action:** Always pre-calculate or cache expensive data aggregations outside of loops and pass them as arguments to item renderers.
