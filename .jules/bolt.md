## 2025-05-15 - O(N²) rendering bottleneck in gallery-loader.js
**Learning:** Calling data aggregation methods like `getGalleryData()` (which iterates over collections) inside a rendering loop for ~1,200 items created a massive O(N²) bottleneck, increasing rendering logic time from <1ms to ~134ms.
**Action:** Always hoist data aggregation and lookup map creation outside of loops. Pass pre-calculated data or maps as arguments to item creation functions.

## 2025-05-15 - Layout thrashing via getComputedStyle and innerText
**Learning:** Using `window.getComputedStyle(item).display` for visibility checks on 1,200 items triggered expensive layout reflows. Similarly, `innerText` is slower than `textContent` because it requires layout awareness.
**Action:** Use `item.offsetParent !== null` to check for `display: none` (works when parent is not `display: none` and item is not `fixed`) and prefer `textContent` for DOM reads that don't require layout-aware text rendering.

## 2026-04-13 - Schwartzian Transform for Gallery Sorting
**Learning:** Performing expensive regex extraction and string manipulation inside a sort comparator for ~1,200 items ((N \log N)$) caused a significant delay (~250ms). Implementing a Schwartzian Transform to pre-calculate numeric sort keys in a single (N)$ pass reduced execution time to ~5ms.
**Action:** Always pre-calculate expensive sorting keys (Schwartzian Transform) when sorting large arrays to avoid redundant computations inside the comparison function.
