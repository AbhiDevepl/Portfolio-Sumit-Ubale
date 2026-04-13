## 2025-05-15 - O(N²) rendering bottleneck in gallery-loader.js
**Learning:** Calling data aggregation methods like `getGalleryData()` (which iterates over collections) inside a rendering loop for ~1,200 items created a massive O(N²) bottleneck, increasing rendering logic time from <1ms to ~134ms.
**Action:** Always hoist data aggregation and lookup map creation outside of loops. Pass pre-calculated data or maps as arguments to item creation functions.

## 2025-05-15 - Layout thrashing via getComputedStyle and innerText
**Learning:** Using `window.getComputedStyle(item).display` for visibility checks on 1,200 items triggered expensive layout reflows. Similarly, `innerText` is slower than `textContent` because it requires layout awareness.
**Action:** Use `item.offsetParent !== null` to check for `display: none` (works when parent is not `display: none` and item is not `fixed`) and prefer `textContent` for DOM reads that don't require layout-aware text rendering.

## 2026-04-13 - Schwartzian Transform for numerical filename sorting
**Learning:** Performing regex matches inside a sort comparator for ~1,200 items (O(N log N)) is significantly slower than pre-calculating the numeric sort key once (O(N)). In this codebase, it reduced sorting logic time from ~466ms to ~83ms.
**Action:** Use a Schwartzian Transform (map-sort-map) for any sort operations that involve expensive string parsing or regex.

## 2026-04-13 - DocumentFragment for batch DOM injection
**Learning:** Appending ~1,200 items individually to the DOM triggers repeated layout reflows and repaints.
**Action:** Use `DocumentFragment` to batch DOM updates. Collect all items into a fragment first, then perform a single append operation to the live DOM.
