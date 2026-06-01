## 2025-06-01 - Optimized Portfolio Data Processing
**Learning:** For a dataset of ~1,000 items, using `Array.indexOf` inside a sort comparator creates an O(N * log N * C) bottleneck (where C is the number of categories).
**Action:** Pre-calculate sorting weights into a Map or Object for O(1) lookups during sort. Additionally, caching string transformations (slug to title case) for category labels further reduces overhead on large datasets.
