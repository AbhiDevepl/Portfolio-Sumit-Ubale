# Bolt's Performance Journal

## 2025-05-15 - [O(1) Sorting Weight Lookups]
**Learning:** Client-side sorting of large datasets (1,000+ items) becomes a bottleneck when the comparator performs linear searches (like `Array.indexOf`) to determine sort order. This turns an $O(N \log N)$ operation into $O(N \log N \cdot M)$.
**Action:** Always pre-calculate sorting weights into a `Map` or `Object.create(null)` lookup table before starting the sort operation to ensure $O(1)$ comparisons.

## 2025-05-15 - [Micro-optimizations vs. Algorithms]
**Learning:** Algorithmic improvements (like the Schwartzian Transform for sorting) provide significantly higher returns (~70% speedup) compared to micro-optimizations like `textContent` vs `innerHTML` (~5-10% in isolation). However, combined with DOM pre-allocation and string caching, the compound effect is substantial.
**Action:** Prioritize algorithmic complexity reductions first, then layer on DOM and memory optimizations.
