## 2025-04-27 - Optimized Gallery Sorting with Schwartzian Transform
**Learning:** Sorting ~1,200 items using regex-based filename extraction inside a comparator creates a significant bottleneck (O(N log N) regex executions). Implementing a Map-Sort-Map (Schwartzian Transform) pattern reduces regex execution to exactly once per item (O(N)).
**Action:** Always use a Map-Sort-Map pattern for datasets > 500 items where the sort key requires parsing (regex, string splitting, or complex logic).
