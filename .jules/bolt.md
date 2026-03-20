## 2025-03-20 - Optimized O(N²) rendering in gallery-loader.js
**Learning:** In vanilla JS architectures with high-volume rendering (1,100+ items), calling data-aggregation getters or performing metadata lookups (e.g., category slug to name) inside the main rendering loop creates a significant O(N²) or O(N*M) bottleneck. In this case, `getGalleryData()` was re-aggregating thousands of items for every single gallery item created.

**Action:** Always hoist data aggregation and metadata lookups outside of `forEach`/`map` rendering loops. Use cached lookup maps for O(1) metadata resolution (e.g., slug-to-name) to maintain performance as the portfolio grows.
