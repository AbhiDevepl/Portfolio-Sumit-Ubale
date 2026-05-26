## 2026-05-26 - Optimized Data Processing with Schwartzian-like Transform
**Learning:** In a dataset of 1,000+ items, repeated `indexOf` calls inside a sort comparator create a significant bottleneck ((M \cdot N \log N)$ where $ is the number of categories). Pre-calculating a sort key during the data enrichment pass reduces this to (N \log N)$ and provides a measurable speed boost.
**Action:** Use a weight lookup map and pre-calculate numeric sort keys during initial data processing passes for large collections.
