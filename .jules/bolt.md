## 2025-05-15 - O(N²) rendering bottleneck in gallery-loader.js
**Learning:** Calling data aggregation methods like `getGalleryData()` (which iterates over collections) inside a rendering loop for ~1,200 items created a massive O(N²) bottleneck, increasing rendering logic time from <1ms to ~134ms.
**Action:** Always hoist data aggregation and lookup map creation outside of loops. Pass pre-calculated data or maps as arguments to item creation functions.

## 2025-05-15 - Layout thrashing via getComputedStyle and innerText
**Learning:** Using `window.getComputedStyle(item).display` for visibility checks on 1,200 items triggered expensive layout reflows. Similarly, `innerText` is slower than `textContent` because it requires layout awareness.
**Action:** Use `item.offsetParent !== null` to check for `display: none` (works when parent is not `display: none` and item is not `fixed`) and prefer `textContent` for DOM reads that don't require layout-aware text rendering.

## 2026-04-14 - Expensive regex in sort comparators
**Learning:** Performing regex matches inside a sort comparator for large arrays (1,000+ items) is extremely slow because it executes $O(N \log N)$ regex operations.
**Action:** Use a Schwartzian Transform (map-sort-map) to pre-calculate numeric sort keys once per item ($O(N)$ operations), which reduced sorting time from ~203ms to ~5.5ms in this codebase.

## 2026-04-14 - Layout thrashing via iterative appendChild
**Learning:** Repeatedly calling `appendChild` on a live DOM container triggers layout calculations for every insertion.
**Action:** Use `DocumentFragment` to batch DOM updates or the project's `Core.DOM.createFragment` utility to perform a single insertion, significantly reducing rendering overhead.
