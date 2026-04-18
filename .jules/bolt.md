## 2025-05-15 - O(N²) rendering bottleneck in gallery-loader.js
**Learning:** Calling data aggregation methods like `getGalleryData()` (which iterates over collections) inside a rendering loop for ~1,200 items created a massive O(N²) bottleneck, increasing rendering logic time from <1ms to ~134ms.
**Action:** Always hoist data aggregation and lookup map creation outside of loops. Pass pre-calculated data or maps as arguments to item creation functions.

## 2025-05-15 - Layout thrashing via getComputedStyle and innerText
**Learning:** Using `window.getComputedStyle(item).display` for visibility checks on 1,200 items triggered expensive layout reflows. Similarly, `innerText` is slower than `textContent` because it requires layout awareness.
**Action:** Use `item.offsetParent !== null` to check for `display: none` (works when parent is not `display: none` and item is not `fixed`) and prefer `textContent` for DOM reads that don't require layout-aware text rendering.

## 2025-05-15 - Schwartzian Transform for numerical sorting
**Learning:** Performing regex matches and string splits inside a sort comparison function for ~1,200 items is expensive ($O(K \cdot N \log N)$ where K is cost of extraction).
**Action:** Use a Schwartzian Transform (Map-Sort-Map) to pre-calculate sort keys and metadata in a single $O(N)$ pass before sorting. This reduced logic time from ~8.4ms to ~1.5ms.

## 2025-05-15 - Redundant event listeners vs Event Delegation
**Learning:** Attaching individual `onclick` handlers to 1,200+ DOM elements consumes significant memory and increases main-thread initialization time, even if a parent delegator already exists.
**Action:** Introduce a `skipHandler` option in media creation utilities to allow bypassing individual listener attachment when event delegation is active on the parent container.
