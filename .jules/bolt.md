## 2025-05-15 - [O(N²) Loop Bottleneck in Gallery Rendering]
**Learning:** Calling data aggregation methods (like `getGalleryData()` which filters/maps a large dataset) inside a rendering loop for that same dataset creates an O(N²) performance bottleneck. This is particularly noticeable when rendering 1,000+ items, as the browser spends significant time on redundant calculations for each node.
**Action:** Always hoist data aggregation or lookup map creation out of the rendering loop and pass the results as parameters to the item creation functions.
