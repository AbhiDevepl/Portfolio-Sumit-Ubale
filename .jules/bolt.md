## 2025-05-30 - Optimize Gallery Data Processing
**Learning:** For a portfolio dataset of ~1,000 items, the original `processData` method was inefficient due to O(C) lookups (`Array.indexOf`) inside the O(N log N) sort and redundant string formatting for every item. By pre-calculating category weights and caching formatted names, processing time was reduced by ~45%.
**Action:** Use a Schwartzian Transform-like approach (pre-calculating sort keys/weights) and cache expensive computations when processing large datasets for rendering.
