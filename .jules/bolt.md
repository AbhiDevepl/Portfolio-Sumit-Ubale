# Bolt's Performance Journal

## 2025-05-15 - [Redundant Data Fetch & Processing Optimization]
**Learning:** Found that `index.html` was performing a redundant fetch of the 291KB `portfolio.json` file and executing a heavy initial render of 1,000+ items, even though `content-loader.js` was also present. Additionally, the data processing logic used O(N log N) sorting and repeated string formatting within the render loop.
**Action:** Consolidated all data loading and rendering logic into `scripts/content-loader.js`, implementing a "Load More" pagination system for the homepage. Optimized the data ingestion pass to flatten the hierarchy and pre-calculate display names in O(N) time, reducing redundant computations during filter switches.
