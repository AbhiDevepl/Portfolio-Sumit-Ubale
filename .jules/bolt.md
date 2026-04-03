## 2026-04-03 - Hoisting expensive O(N) getters in gallery rendering loops
**Learning:** In `scripts/gallery-loader.js`, calling `getGalleryData()` (an O(N) operation) inside a `forEach` loop of 1,192 items created an O(N²) bottleneck. This performed ~1.4 million object operations, causing ~542ms of main-thread blockage during gallery rendering. Additionally, resolving category slugs to names via a search inside the loop added unnecessary overhead.

**Action:** Always hoist data aggregation and metadata lookups outside of rendering loops. Use a pre-calculated hash map (O(1)) for metadata resolution (like category names) and pass the static aggregate data into the loop to ensure O(N) complexity.
