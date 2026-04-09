## 2025-05-15 - O(N²) rendering bottleneck in gallery-loader.js
**Learning:** Calling data aggregation methods like `getGalleryData()` (which iterates over collections) inside a rendering loop for ~1,200 items created a massive O(N²) bottleneck, increasing rendering logic time from <1ms to ~134ms.
**Action:** Always hoist data aggregation and lookup map creation outside of loops. Pass pre-calculated data or maps as arguments to item creation functions.

## 2025-05-15 - Layout thrashing via getComputedStyle and innerText
**Learning:** Using `window.getComputedStyle(item).display` for visibility checks on 1,200 items triggered expensive layout reflows. Similarly, `innerText` is slower than `textContent` because it requires layout awareness.
**Action:** Use `item.offsetParent !== null` to check for `display: none` (works when parent is not `display: none` and item is not `fixed`) and prefer `textContent` for DOM reads that don't require layout-aware text rendering.

## 2025-05-15 - Redundant regex parsing in sorting loops
**Learning:** Sorting ~1,200 items by numeric filename using regex extraction inside the `.sort()` comparator is $O(N \log N)$ in terms of regex executions.
**Action:** Use a Schwartzian Transform (map-sort-map) to extract the sort key once per item in an $O(N)$ pass, significantly reducing CPU cycles during the sort.

## 2025-05-15 - DOM listener overhead and Event Delegation
**Learning:** Attaching individual click listeners to 1,200+ items consumes significant memory and increases initialization time.
**Action:** Implement event delegation on the parent container. Avoid complex persistent DOM caches (like `itemsCache`) in dynamic rendering environments where they can become stale; instead, use lightweight property checks like `offsetParent` and `textContent` to minimize layout thrashing during on-demand DOM queries.
