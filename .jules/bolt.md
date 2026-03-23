## 2025-05-15 - [Identify and Optimize O(N²) Bottleneck in Gallery Rendering]
**Learning:** In the `GalleryLoader` class, calling `getGalleryData()` (which iterates through ~1,200 images to aggregate data) inside a loop for each gallery item created an O(N²) bottleneck. This significantly degraded rendering performance as the portfolio grew.
**Action:** Always hoist data aggregation and metadata lookup methods out of rendering loops. Pre-calculating the full dataset once and passing it to individual item creation functions reduces complexity to O(N) and drastically improves UI responsiveness.
