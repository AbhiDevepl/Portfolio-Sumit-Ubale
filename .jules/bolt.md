## 2026-03-27 - [Gallery Aggregation Optimization]
**Learning:** Found an O(N²) bottleneck in the gallery rendering logic where `getGalleryData()` was called for every item in a loop of ~1,200 items. Each call re-scanned the entire portfolio JSON, leading to significant overhead.

**Action:** Always hoist data aggregation and metadata lookups (like category names) out of rendering loops. Use pre-calculated arrays and O(1) lookup maps when processing high-volume datasets (1,000+ items).
