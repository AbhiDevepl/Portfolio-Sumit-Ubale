## 2025-05-14 - Optimized Gallery Rendering Complexity
**Learning:** In vanilla JS architectures with high-item counts (~1,200), calling data aggregation getters (like `getGalleryData()`) inside a rendering loop creates an O(N²) bottleneck. For the portfolio gallery, this caused an ~1.8s delay.
**Action:** Hoist data aggregation out of loops and pass pre-calculated results to item creation methods. Use O(1) lookup maps for metadata (like category names) to eliminate redundant searching.
