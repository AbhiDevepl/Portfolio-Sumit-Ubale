## 2024-05-24 - O(N²) Bottleneck in Gallery Rendering
**Learning:** Performing full dataset aggregation (e.g., `this.getGalleryData()`) inside a rendering loop for ~1,200 items created an O(N²) bottleneck, increasing rendering logic time from ~0.3ms to over 120ms. Additionally, repeated category metadata lookups added unnecessary overhead.
**Action:** Always hoist data aggregation and metadata resolution out of loops. Implement pre-cached O(1) lookup maps (e.g., `CATEGORY_NAMES`) for metadata resolution during high-volume item creation.
