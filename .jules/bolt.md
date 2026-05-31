# ⚡ Bolt's Performance Journal

## 2025-05-31 - Data Processing Optimization for Large Portfolios
**Learning:** In a portfolio with over 1,000 items, using `Array.prototype.indexOf` inside a sort comparator creates an O(N log N * C) complexity where C is the number of categories. Additionally, repeated string manipulation for formatting category names during every render or data processing pass adds significant overhead. Batching state updates via a `patchState` pattern is essential to prevent redundant DOM thrashing during multi-step initialization.
**Action:** Always use pre-calculated lookup maps (O(1)) for sorting weights and implement caching for expensive string transformations (like slug-to-title-case). Use batching for state management to ensure only one render cycle occurs per logical update.
