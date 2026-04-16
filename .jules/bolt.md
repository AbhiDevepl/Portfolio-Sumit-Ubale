## 2025-05-15 - O(N²) rendering bottleneck in gallery-loader.js
**Learning:** Calling data aggregation methods like `getGalleryData()` (which iterates over collections) inside a rendering loop for ~1,200 items created a massive O(N²) bottleneck, increasing rendering logic time from <1ms to ~134ms.
**Action:** Always hoist data aggregation and lookup map creation outside of loops. Pass pre-calculated data or maps as arguments to item creation functions.

## 2025-05-15 - Layout thrashing via getComputedStyle and innerText
**Learning:** Using `window.getComputedStyle(item).display` for visibility checks on 1,200 items triggered expensive layout reflows. Similarly, `innerText` is slower than `textContent` because it requires layout awareness.
**Action:** Use `item.offsetParent !== null` to check for `display: none` (works when parent is not `display: none` and item is not `fixed`) and prefer `textContent` for DOM reads that don't require layout-aware text rendering.

## 2025-05-15 - Efficient sorting with Schwartzian Transform
**Learning:** Performing regex-based string manipulation (like extracting numbers from filenames) inside a sort comparator for ~1,200 items is expensive ($O(N \log N)$ regex calls).
**Action:** Use a Schwartzian Transform: map the data to a temporary array containing pre-calculated sort keys, sort that array, and then map back to the original format. This reduces regex calls to $O(N)$.

## 2025-05-15 - DOM scraping vs. Model-driven Interaction
**Learning:** Scraping the DOM (e.g., searching for visible elements) to determine the state for interactions like Lightbox navigation causes layout thrashing and is significantly slower than maintaining a clean data model.
**Action:** Maintain a "source of truth" in JavaScript (e.g., `window.contentLoader.allImages`) and derive interaction state (filtered/visible items) from that model instead of querying the DOM.
