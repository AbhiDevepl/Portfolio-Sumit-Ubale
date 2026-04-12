## 2025-05-15 - O(N²) rendering bottleneck in gallery-loader.js
**Learning:** Calling data aggregation methods like `getGalleryData()` (which iterates over collections) inside a rendering loop for ~1,200 items created a massive O(N²) bottleneck, increasing rendering logic time from <1ms to ~134ms.
**Action:** Always hoist data aggregation and lookup map creation outside of loops. Pass pre-calculated data or maps as arguments to item creation functions.

## 2025-05-15 - Layout thrashing via getComputedStyle and innerText
**Learning:** Using `window.getComputedStyle(item).display` for visibility checks on 1,200 items triggered expensive layout reflows. Similarly, `innerText` is slower than `textContent` because it requires layout awareness.
**Action:** Use `item.offsetParent !== null` to check for `display: none` (works when parent is not `display: none` and item is not `fixed`) and prefer `textContent` for DOM reads that don't require layout-aware text rendering.

## 2025-05-15 - Redundant regex in O(N log N) sorting
**Learning:** Performing regex matching and string parsing inside an `Array.sort()` comparator for 1,200 items resulted in thousands of redundant operations, significantly slowing down initial data population.
**Action:** Use a Schwartzian Transform (Decorate-Sort-Undecorate) to pre-calculate numeric sort keys in an O(N) pass before sorting. Re-use these keys if multiple sorts (e.g., per-category and global) are required.
