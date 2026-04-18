## 2025-05-15 - O(N²) rendering bottleneck in gallery-loader.js
**Learning:** Calling data aggregation methods like `getGalleryData()` (which iterates over collections) inside a rendering loop for ~1,200 items created a massive O(N²) bottleneck, increasing rendering logic time from <1ms to ~134ms.
**Action:** Always hoist data aggregation and lookup map creation outside of loops. Pass pre-calculated data or maps as arguments to item creation functions.

## 2025-05-15 - Layout thrashing via getComputedStyle and innerText
**Learning:** Using `window.getComputedStyle(item).display` for visibility checks on 1,200 items triggered expensive layout reflows. Similarly, `innerText` is slower than `textContent` because it requires layout awareness.
**Action:** Use `item.offsetParent !== null` to check for `display: none` (works when parent is not `display: none` and item is not `fixed`) and prefer `textContent` for DOM reads that don't require layout-aware text rendering.

## 2025-05-18 - Schwartzian Transform for Gallery Sorting
**Learning:** Performing regex matches and string splits inside a sort comparator for ~1,200 items ($O(N \log N)$ operations) is significantly slower than pre-calculating sort keys in a single mapping pass. For this dataset, regex-heavy sorting took ~636ms vs ~150ms with pre-calculation.
**Action:** Use a Schwartzian Transform (Map-Sort-Map/Extract) when sorting large collections based on derived keys (like numeric IDs in filenames) to minimize redundant computations in the comparison loop.
