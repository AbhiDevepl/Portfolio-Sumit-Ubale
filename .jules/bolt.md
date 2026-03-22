# Bolt's Performance Journal - Portfolio Optimization

## 2026-03-22 - [Gallery Rendering Optimization]
**Learning:** Found an O(N^2) bottleneck in `scripts/gallery-loader.js` where `getGalleryData()` was called for every item rendered. This function aggregates the entire data set of 1,192 items, leading to millions of operations during initial render.
**Action:** Hoist the data aggregation out of the loop and pass it as an argument to ensure O(N) rendering complexity.
