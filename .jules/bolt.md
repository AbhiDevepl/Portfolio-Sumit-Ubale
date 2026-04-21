# Bolt's Performance Journal

## 2025-01-24 - Efficient sorting with Schwartzian Transform
**Learning:** For large datasets (e.g., 1000+ items) in vanilla JS, performing repeated regex matches and string operations inside a `.sort()` comparator creates a significant main-thread bottleneck.
**Action:** Use a Schwartzian Transform (map-sort-map) to pre-calculate sort keys once per item. This reduced sorting execution time by ~7.7x (from ~10.6ms to ~1.4ms per run).

## 2025-01-24 - Batch DOM injection with DocumentFragment
**Learning:** Repeatedly calling `appendChild` in a loop triggers multiple layout reflows (layout thrashing), which degrades performance as the item count grows.
**Action:** Use `DocumentFragment` to batch DOM updates. Inject the fragment once at the end of the loop to ensure only a single reflow occurs.
