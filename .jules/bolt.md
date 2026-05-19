## 2026-05-19 - Optimized Portfolio Data Processing
**Learning:** Using a Map for O(1) weight lookups in sort comparators significantly outperforms `Array.indexOf` (O(M)). Additionally, `Element.replaceChildren()` is a modern and highly efficient alternative to clearing and re-populating DOM containers, reducing layout thrashing.
**Action:** Always prefer Map-based weights for custom sorting and `replaceChildren()` for bulk DOM updates in performance-critical paths.
