## 2026-06-01 - Optimizing Large Portfolio Data Processing
**Learning:** Using Array.prototype.indexOf() inside a sort comparator for 1,000+ items creates an O(N log N * K) bottleneck. Additionally, repeated string formatting (slug to title case) for each item adds significant O(N) overhead.
**Action:** Implement a Schwartzian Transform pattern by pre-calculating sort weights in an O(1) Map and memoizing string transformations to reduce processing time by ~30-45%.
