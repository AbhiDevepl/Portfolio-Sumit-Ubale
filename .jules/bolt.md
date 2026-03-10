## 2025-05-15 - O(N²) Rendering Bottleneck in GalleryLoader
**Learning:** The `renderGallery` function was calling `getGalleryData()` for every item rendered. `getGalleryData` aggregates and maps the entire portfolio data (~1,200 items), leading to O(N²) complexity during initial render and category switches.
**Action:** Always cache enriched data objects outside of loops when populating large lists (DocumentFragments) to maintain O(N) performance. Ensure helper methods used in loops don't perform expensive aggregations.
