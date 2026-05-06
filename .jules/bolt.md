## 2024-05-05 - Optimize gallery sorting performance
**Learning:** Using a Schwartzian Transform (map-sort-map) significantly improves performance when sorting large datasets based on string-derived keys (like regex-extracted numbers from filenames).
**Action:** Always pre-calculate expensive sort keys before the sort phase for datasets > 500 items.

**Optimization Metric:**
- Dataset size: 1,192 items
- Original sort time: ~7.14ms avg per sort call
- Optimized sort time: ~1.68ms avg per sort call
- Performance improvement: ~4.25x speedup
