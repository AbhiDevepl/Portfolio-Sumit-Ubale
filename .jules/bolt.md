## 2024-05-23 - Performance of Object Merging in Data Processing
**Learning:** In high-frequency loops (e.g., processing 1000+ items), the spread operator (`{...item}`) can be significantly faster than `Object.assign({}, item)`. Benchmarking showed a ~5x difference in per-item processing time (~0.12ms vs ~0.61ms). While `Object.assign` is sometimes preferred for compatibility, the spread operator is a critical optimization when processing large datasets in the browser or Node.js.
**Action:** Always benchmark different object merging techniques when optimizing data-heavy initialization paths.

## 2024-05-23 - Sorting Optimization with Schwartzian Transform
**Learning:** Using `Array.prototype.indexOf` inside a sort comparator creates an O(N * M * log N) complexity where M is the number of categories. Pre-calculating a sort key (Schwartzian Transform) reduces this to O(N log N) with O(1) comparisons.
**Action:** Avoid expensive lookups or string manipulations inside sort comparators; pre-calculate a numeric sort key during the data enrichment pass.
