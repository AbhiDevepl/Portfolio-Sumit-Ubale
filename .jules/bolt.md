## 2025-05-14 - [O(N^2) Aggregation in Rendering Loops]
**Learning:** In the `GalleryLoader` (and likely other similar components), calling `getGalleryData()` inside a loop that iterates over ~1,200 items created an $O(N^2)$ bottleneck. `getGalleryData()` performs its own iteration and object mapping to build the full dataset for the Lightbox.
**Action:** Always hoist data aggregation or "full view" calculations outside of rendering loops. Pre-compute the shared state once and pass it into the item creation functions as a reference to ensure $O(N)$ complexity.
