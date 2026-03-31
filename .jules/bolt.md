## 2024-05-22 - O(n²) rendering bottleneck in GalleryLoader
**Learning:** In this vanilla JS architecture, calling `getGalleryData()` (which iterates over all categories and images) inside the `renderGallery` loop created an O(n²) complexity bottleneck as the portfolio grew to ~1,200 items. This resulted in measurable UI thread blocking during gallery initialization.
**Action:** Hoist data aggregation and metadata enrichment out of rendering loops. Use pre-calculated lookup maps (e.g., category slug to name) to ensure O(1) metadata resolution during item creation.
