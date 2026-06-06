## 2025-05-15 - [O(N log N) Sorting Optimization]
**Learning:** $O(M)$ `indexOf` lookups inside a sort comparator for large datasets (1,000+ items) create significant UI thread blocking. Moving to a pre-calculated $O(1)$ weight map reduced processing time by over 90%.
**Action:** Always use lookup objects for sorting weights and pre-enrich data items during flattening to avoid redundant string manipulation in the rendering loop.

## 2025-05-15 - [Environment Compatibility: CI Constraints]
**Learning:** The target environment (Cloudflare Workers CI) has strict JavaScript version constraints. ES2022 features (static class fields), ES2020 (Optional Chaining `?.`), and even some ES2019 features (`Array.prototype.flat()`, `Object.values()`) can cause build or execution failures.
**Action:** For maximum compatibility in this repository, use ES2018 or lower syntax. Replace modern features with manual loops (`Object.keys()`), explicit null checks, and `Object.assign()` for object copying. Always verify syntax with `node -c` before submission.
