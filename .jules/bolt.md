## 2025-05-15 - O(N²) rendering bottleneck in gallery-loader.js
**Learning:** Calling data aggregation methods like `getGalleryData()` (which iterates over collections) inside a rendering loop for ~1,200 items created a massive O(N²) bottleneck, increasing rendering logic time from <1ms to ~134ms.
**Action:** Always hoist data aggregation and lookup map creation outside of loops. Pass pre-calculated data or maps as arguments to item creation functions.

## 2025-05-15 - Layout thrashing via getComputedStyle and innerText
**Learning:** Using `window.getComputedStyle(item).display` for visibility checks on 1,200 items triggered expensive layout reflows. Similarly, `innerText` is slower than `textContent` because it requires layout awareness.
**Action:** Use `item.offsetParent !== null` to check for `display: none` (works when parent is not `display: none` and item is not `fixed`) and prefer `textContent` for DOM reads that don't require layout-aware text rendering.

## 2025-05-15 - Redundant Regex in Sort Loops
**Learning:** Performing regex matches inside a `.sort()` comparator for 1,200+ items is highly inefficient as it re-executes for every comparison ($O(N \log N)$).
**Action:** Use a Schwartzian Transform to map values once in $O(N)$ before sorting.

## 2025-05-15 - Layout Thrashing in Service Injections
**Learning:** Iteratively appending 100+ complex DOM elements directly to a container triggers multiple layout reflows.
**Action:** Use `DocumentFragment` to batch DOM injections, resulting in a single reflow and significantly faster rendering.
