
## 2026-05-03 - [Gallery Sorting Optimization]
**Learning:** For datasets exceeding 1,000 items (like this project's 1,192 images), regex-heavy sort comparators cause measurable main-thread lag. The Schwartzian Transform (Map-Sort-Map) reliably achieves a ~10x speedup in this environment.
**Action:** Use pre-calculated sort keys for any dataset > 500 items where sorting involves string parsing or regex.
