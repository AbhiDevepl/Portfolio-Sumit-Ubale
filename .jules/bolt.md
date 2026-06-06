## 2025-05-15 - [O(N log N) Sorting Optimization]
**Learning:** $O(M)$ `indexOf` lookups inside a sort comparator for large datasets (1,000+ items) create significant UI thread blocking. Moving to a pre-calculated $O(1)$ weight map reduced processing time by over 90%.
**Action:** Always use lookup objects for sorting weights and pre-enrich data items during flattening to avoid redundant string manipulation in the rendering loop.

## 2025-05-15 - [Environment Compatibility: Static Fields]
**Learning:** The target environment (Cloudflare Workers CI) does not support ES2022 static class fields. Using them causes immediate execution failure.
**Action:** Define static-like constants by attaching them to the class constructor outside the class body for better compatibility.
