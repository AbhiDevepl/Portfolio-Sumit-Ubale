## 2026-03-09 - O(N²) Bottleneck in Gallery Rendering
**Learning:** In the `GalleryLoader`, calling `getGalleryData()` inside the `Core.DOM.createFragment` loop caused quadratic complexity because `getGalleryData()` re-processed the entire image dataset for every single item. With ~1,200 items, this resulted in over 1.4 million iterations.
**Action:** Always hoist data aggregation and enrichment logic outside of rendering loops. Pre-calculate the full dataset once and pass the reference to the renderer.
