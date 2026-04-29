## 2026-04-29 - [Schwartzian Transform for Gallery Sorting]
**Learning:** For datasets exceeding 1,000 items where sorting involves regex or string parsing, the overhead of (N \log N)$ repeated operations (like regex matches on every comparison) can block the main thread for over 10ms. Using a Schwartzian Transform (map-sort-map) reduces this to (N)$ regex matches, providing a ~4x-5x speedup.
**Action:** Always pre-calculate sort keys and metadata in a mapping phase before executing complex sorts on large UI-bound collections.
