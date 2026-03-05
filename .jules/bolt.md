# Bolt's Performance Journal ⚡

## 2025-05-15 - [Hidden O(N²) Bottleneck in Gallery Logic]
**Learning:** Functions that look like simple getters (e.g., `getGalleryData()`) may actually perform expensive re-computation or data aggregation. When called inside a loop for every item (e.g., `createGalleryItem`), this results in O(N²) complexity.
**Action:** Always verify the internals of "getter" functions used in loops. Prefer caching the result of such functions before entering the loop to ensure O(N) performance.

## 2025-05-15 - [Optimizing Visibility Checks]
**Learning:** `window.getComputedStyle(element)` is expensive as it can force synchronous layout (reflow). Using `element.offsetParent === null` is a fast-fail way to check if an element is hidden via `display: none` without triggering a reflow. Inline style checks (`element.style.opacity`) are also faster than computed styles when state is managed via JS.
**Action:** Replace redundant `getComputedStyle` calls with a tiered priority check: `offsetParent` -> inline style -> `getComputedStyle` fallback.

## 2025-05-15 - [Balancing Content and Performance]
**Learning:** Reducing DOM weight by filtering items (e.g., only showing `isPreview: true` items) can be an effective performance boost, but it changes the user experience.
**Action:** Performance optimizations should strive to be non-destructive. If content must be removed, it should be an explicit architectural decision, not a side-effect of "optimization".
