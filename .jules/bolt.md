## 2025-05-15 - O(N²) rendering bottleneck in gallery-loader.js
**Learning:** Calling data aggregation methods like `getGalleryData()` (which iterates over collections) inside a rendering loop for ~1,200 items created a massive O(N²) bottleneck, increasing rendering logic time from <1ms to ~134ms.
**Action:** Always hoist data aggregation and lookup map creation outside of loops. Pass pre-calculated data or maps as arguments to item creation functions.

## 2025-05-15 - Layout thrashing via getComputedStyle and innerText
**Learning:** Using `window.getComputedStyle(item).display` for visibility checks on 1,200 items triggered expensive layout reflows. Similarly, `innerText` is slower than `textContent` because it requires layout awareness.
**Action:** Use `item.offsetParent !== null` to check for `display: none` (works when parent is not `display: none` and item is not `fixed`) and prefer `textContent` for DOM reads that don't require layout-aware text rendering.

## 2025-05-15 - Regex overhead in sort comparators
**Learning:** Using regex inside a sort comparator (e.g. `parseInt(a.match(/\d+/))`) on ~1,200 items causes redundant $O(N \log N)$ regex executions.
**Action:** Use a Schwartzian Transform: Pre-calculate the numeric sort value in a single $O(N)$ pass and store it on the object, then perform simple numeric comparison in the sort. This reduced sort time from ~250ms to ~1.8ms.

## 2025-05-15 - Absolute vs Relative URL in DOM lookups
**Learning:** Accessing `img.src` returns the fully qualified absolute URL. If the source data uses relative paths, lookups will fail.
**Action:** Use `img.getAttribute('src')` to retrieve the original relative path for consistent matching against JSON data sources in event-delegated handlers.
