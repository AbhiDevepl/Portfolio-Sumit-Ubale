## 2025-05-14 - [O(N²) Rendering Bottleneck in Gallery]
**Learning:** Re-calculating or re-aggregating full data sets (e.g., `getGalleryData()`) inside a loop for creating individual DOM items causes O(N²) complexity. This becomes a significant bottleneck as the portfolio size grows.
**Action:** Always pre-calculate or cache expensive data aggregations outside of loops and pass the result to the item renderer.

## 2025-05-14 - [CSS @import Font Waterfall]
**Learning:** Using `@import` for Google Fonts inside CSS files creates a synchronous, render-blocking waterfall that delays the critical path, even if preconnect hints are present in the HTML.
**Action:** Prefer HTML `<link rel="preload" as="style">` and `<link rel="stylesheet">` with `media="print" onload="this.media='all'"` to flatten the loading waterfall and ensure non-blocking font delivery.
