## 2025-05-15 - O(N²) rendering bottleneck in gallery-loader.js
**Learning:** Calling data aggregation methods like `getGalleryData()` (which iterates over collections) inside a rendering loop for ~1,200 items created a massive O(N²) bottleneck, increasing rendering logic time from <1ms to ~134ms.
**Action:** Always hoist data aggregation and lookup map creation outside of loops. Pass pre-calculated data or maps as arguments to item creation functions.

## 2025-05-15 - Layout thrashing via getComputedStyle and innerText
**Learning:** Using `window.getComputedStyle(item).display` for visibility checks on 1,200 items triggered expensive layout reflows. Similarly, `innerText` is slower than `textContent` because it requires layout awareness.
**Action:** Use `item.offsetParent !== null` to check for `display: none` (works when parent is not `display: none` and item is not `fixed`) and prefer `textContent` for DOM reads that don't require layout-aware text rendering.

## 2025-05-15 - Redundant regex overhead in Array.prototype.sort
**Learning:** Performing regex extraction or string manipulation inside a `.sort()` comparator for large datasets (e.g., 1,200 items) results in (N \log N)$ redundant operations, significantly blocking the main thread during initialization.
**Action:** Use a Schwartzian Transform: map the data to a temporary array of objects containing the pre-calculated sort keys and the original data in (N)$, sort the mapped array in (N \log N)$, and then map back to the final result in (N)$.
