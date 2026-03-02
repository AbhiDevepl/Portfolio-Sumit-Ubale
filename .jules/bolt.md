## 2026-03-02 - [Homepage DOM Weight & Interaction Bottleneck]
**Learning:** Initializing the homepage gallery with over 350 DOM elements (most hidden) caused significant main-thread overhead during page load and triggered expensive layout thrashing when opening the Lightbox due to `getComputedStyle` lookups in a loop.
**Action:** Limit initial homepage rendering to preview items (~20 items) and implement in-memory state tracking (`visibleData`) in `GalleryManager` to eliminate DOM-heavy lookups during high-frequency interactions.
