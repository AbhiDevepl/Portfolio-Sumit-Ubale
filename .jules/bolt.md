# Bolt Performance Journal

## 2026-06-13 - [O(1) Sorting and DOM TextContent Optimization]
**Learning:** The primary performance bottleneck in client-side sorting for 1,000+ items is $O(N \log N \cdot M)$ complexity caused by calling $O(M)$ methods like `Array.indexOf()` inside the comparator. Pre-calculating comparison metadata into a Map is the preferred fix. Additionally, `textContent` rendering is significantly faster and more secure than `innerHTML`.
**Action:** Always pre-calculate sort weights and cache string manipulations in the initial data processing pass. Use `textContent` for high-frequency DOM updates.
