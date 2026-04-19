# Bolt's Performance Journal

## 2025-05-15 - [Optimize gallery sorting with Schwartzian Transform]
**Learning:** In datasets with ~1,200 items, performing regex matching and string manipulation inside a sort comparison callback ($O(N \log N)$) creates a measurable bottleneck. Moving these operations to a pre-sort mapping pass (Schwartzian Transform) reduces sorting overhead by ~80%.
**Action:** Always pre-calculate sort keys and metadata in an $O(N)$ pass before sorting large arrays, especially when keys involve regex or complex string parsing.
