## 2026-05-30 - O(1) Sorting and String Caching in Large Datasets
**Learning:** In datasets with 1,000+ items, using `Array.prototype.indexOf()` inside a sort comparator creates a significant bottleneck ($O(N \cdot M \log N)$). Pre-calculating weights into a hash map and caching string transformations (like slug-to-title-case) can reduce processing time by over 40%.
**Action:** Always check for repeated lookups or expensive string operations inside loops or sort comparators for datasets over 500 items.
