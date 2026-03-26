## 2025-05-15 - Hoisting O(N²) data aggregation in GalleryLoader
**Learning:** In vanilla JS architectures handling large datasets (1,200+ items), calling data aggregation methods like `getGalleryData()` inside a rendering loop creates an O(N²) bottleneck. Additionally, repeated `.find()` calls on category metadata arrays contribute O(N*M) overhead.
**Action:** Always hoist data aggregation and metadata lookup map creation (e.g., `categoryNames` map) outside of rendering loops to ensure O(N) complexity.
