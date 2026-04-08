## 2025-05-15 - O(N²) rendering bottleneck in gallery-loader.js
**Learning:** Calling data aggregation methods like `getGalleryData()` (which iterates over collections) inside a rendering loop for ~1,200 items created a massive O(N²) bottleneck, increasing rendering logic time from <1ms to ~134ms.
**Action:** Always hoist data aggregation and lookup map creation outside of loops. Pass pre-calculated data or maps as arguments to item creation functions.

## 2025-05-15 - Layout thrashing via getComputedStyle and innerText
**Learning:** Using `window.getComputedStyle(item).display` for visibility checks on 1,200 items triggered expensive layout reflows. Similarly, `innerText` is slower than `textContent` because it requires layout awareness.
**Action:** Use `item.offsetParent !== null` to check for `display: none` (works when parent is not `display: none` and item is not `fixed`) and prefer `textContent` for DOM reads that don't require layout-aware text rendering.

## 2025-05-15 - Scalability of Event Listeners and Lightbox Navigation
**Learning:** Attaching individual click listeners to 1,200+ items increases memory overhead and slows down initialization. Furthermore, performing DOM queries to find "visible" items every time the Lightbox opens is $O(N)$ and causes perceived lag.
**Action:** Use Event Delegation on the parent container to handle interactions for all children with a single listener. Maintain a `visibleData` tracking array that is updated only during filtering to ensure $O(1)$ Lightbox index lookups.
