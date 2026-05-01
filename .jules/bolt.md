## 2025-05-15 - Optimized Gallery Sorting via Schwartzian Transform
**Learning:** In datasets with ~1,200+ items where sorting depends on string parsing or regex extraction (e.g., extracting numeric IDs from filenames like `media_123.jpg`), performing these operations inside the `sort()` comparator creates a significant performance bottleneck due to O(N log N) repeated executions.
**Action:** Use a map-sort-map (Schwartzian Transform) pattern to pre-calculate sort keys once per item. This reduced gallery sort time from ~252ms to ~4.8ms (~52x improvement) in the `content-loader.js` logic.

## 2025-05-15 - Early Returns for Conditional DOM Elements
**Learning:** The `content-loader.js` was attempting to process and inject data into multiple grid containers (`.events-grid`, `#publications`, etc.) regardless of whether they existed on the current page. This led to wasted CPU cycles and potential errors.
**Action:** Implement early returns in population functions if the target DOM container is not found. This is particularly important for performance in multi-page sites sharing a common loader script.
