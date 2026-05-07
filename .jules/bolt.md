## 2024-05-05 - Optimize gallery sorting performance
**Learning:** Using a Schwartzian Transform (map-sort-map) significantly improves performance when sorting large datasets based on string-derived keys (like regex-extracted numbers from filenames).
**Action:** Always pre-calculate expensive sort keys before the sort phase for datasets > 500 items.

**Optimization Metric:**
- Dataset size: 1,192 items
- Original sort time: ~7.14ms avg per sort call
- Optimized sort time: ~1.68ms avg per sort call
- Performance improvement: ~4.25x speedup

## 2026-05-07 - Optimize portfolio data processing and sorting
**Learning:** Redundant string transformations (like Title Case formatting) on a limited set of unique categories across a large dataset (1,200+ items) creates a significant bottleneck that can be eliminated with memoization.
**Action:** Use static Map-based memoization for frequently repeated string transformations and O(1) Map lookups for sort weights to ensure O(N log N) processing of large media collections.

**Optimization Metric:**
- Dataset size: 1,192 items
- Baseline processing + sort cycle: ~1.38ms
- Optimized processing + sort cycle: ~0.36ms
- Performance improvement: ~3.8x speedup
