## 2026-03-25 - [Gallery Rendering Optimization]
**Learning:** In vanilla JS architectures with high-volume rendering (1,192 items), calling data-aggregation getters like `getGalleryData()` inside a loop creates an $O(N^2)$ bottleneck. For the full gallery, this added ~330ms of scripting overhead.
**Action:** Always hoist data aggregation and metadata lookups out of `forEach` or `map` rendering loops. Pass the pre-aggregated data as an argument to item creation functions.
