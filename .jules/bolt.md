
## 2026-06-17 - [O(1) Sorting and DOM Optimization for Large Lists]
**Learning:** In client-side gallery rendering for 1,000+ items, the primary bottleneck was O(N log N * C) complexity caused by calling `Array.indexOf` on a category order array inside the sort comparator. Additionally, redundant string manipulations and `innerHTML` parsing in the rendering loop added significant overhead.
**Action:** Always pre-calculate sort weights into a Map or object property during a single linear data pass. Replace `innerHTML` with `textContent` and pre-allocate formatted strings to minimize DOM engine and string processing work.
