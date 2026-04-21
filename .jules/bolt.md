# Bolt's Performance Journal

## 2025-01-24 - Efficient Numeric Sorting for Large Galleries
**Learning:** In vanilla JavaScript, performing regex operations or string splitting inside `Array.sort` for a large dataset (~1,200 items) creates a significant performance bottleneck due to the O(N log N) frequency of the comparator. Implementing a Schwartzian Transform (pre-calculating numeric keys in a single O(N) pass) reduced the sorting execution time by approximately 11.4x (1.24s down to 109ms for 100 iterations).
**Action:** For any dataset exceeding 500 items where sorting depends on string parsing or regex, implement a map-sort-map pattern (Schwartzian Transform) to ensure the main thread remains responsive.
