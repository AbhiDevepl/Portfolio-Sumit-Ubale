## 2025-05-15 - [Gallery Rendering O(N^2) Bottleneck]
**Learning:** In vanilla JS architectures with high-volume rendering (1,200+ items), avoid re-executing data getters (e.g., `getGalleryData()`) or performing redundant metadata lookups inside `forEach` loops. These operations, while seemingly cheap individually, aggregate into an O(N^2) or O(N*M) bottleneck that significantly delays initial UI rendering.
**Action:** Always hoist data aggregation and metadata lookup maps out of rendering loops. Use pre-cached lookup maps for O(1) metadata resolution during item creation.
