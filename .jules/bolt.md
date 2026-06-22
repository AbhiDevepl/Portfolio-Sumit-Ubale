# Bolt's Performance Journal

## 2025-05-15 - [Sorting Optimization for Large Datasets]
**Learning:** In client-side sorting of large (1,000+ item) datasets, calling `Array.indexOf` or performing string manipulations inside a comparator function leads to $O(N \log N \cdot M)$ complexity, where $M$ is the cost of the lookup/manipulation. Pre-calculating comparison weights and caching formatted values into a Map or during a single processing pass reduces this to $O(N \log N + N)$, providing significant measurable gains.
**Action:** Always pre-calculate sorting metadata and cache high-frequency string transformations in the initial data processing pass before handing the data to sorting or rendering logic.

## 2025-05-15 - [DOM Rendering Efficiency]
**Learning:** For high-frequency gallery rendering, `textContent` is measurably faster than `innerHTML` for clearing containers, and pre-constructing elements via `createElement` prevents redundant HTML parsing cycles.
**Action:** Prefer `textContent` for clearing and `createElement` for structural updates in large-scale list rendering.
