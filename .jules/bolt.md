## 2025-05-15 - [Schwartzian Transform for Gallery Sorting]
**Learning:** In galleries with a large number of items (~1200), redundant regex operations and string manipulations within the sort comparison function become a significant bottleneck for main-thread performance.
**Action:** Use a Schwartzian Transform pattern to pre-calculate sort keys (e.g., numeric values from filenames) and metadata (e.g., media type) in a single O(N) pass before performing the O(N log N) sort.
