## 2025-05-15 - Redundant Data Aggregation in Rendering Loops
**Learning:** In the `GalleryLoader` class, calling `getGalleryData()` (which aggregates ~1,200 items across categories) inside the rendering loop for each item created an $O(N^2)$ bottleneck. This resulted in significant UI-blocking latency during gallery initialization.

**Action:** Always hoist data aggregation or transformation logic out of rendering loops. By pre-calculating the full dataset and passing it to individual item creators, the complexity was reduced to $O(N)$, resulting in a ~1000x speedup for the data preparation phase.
