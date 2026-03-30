## 2025-03-30 - O(N²) Bottleneck in High-Volume Rendering
**Learning:** In vanilla JS architectures with high item counts (1,000+), calling data aggregation methods like `getGalleryData()` inside a rendering loop creates an O(N²) bottleneck. This is especially dangerous when the aggregation method itself iterates over large datasets or category structures.
**Action:** Always hoist data aggregation and metadata lookups (like category names) out of rendering loops. Use pre-calculated lookup maps for O(1) resolution during item creation.
