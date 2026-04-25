## 2025-04-25 - Schwartzian Transform for Large Gallery Sorting

**Learning:** In datasets with ~1,200 items where sorting relies on regex-based string parsing (like numeric filename extraction), the `Array.prototype.sort()` method becomes a bottleneck due to redundant regex executions (O(N log N) regex calls). Implementing a Schwartzian Transform (map-sort-map pattern) reduces this to O(N) regex calls, improving performance by ~58% in this codebase.

**Action:** Always use a Schwartzian Transform or pre-calculated sort keys when sorting large datasets (>500 items) that depend on expensive extraction logic.
