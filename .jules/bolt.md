## 2025-05-14 - Optimized Gallery Rendering and Layout Thrashing

**Learning:** In a vanilla JS architecture with 1,200+ DOM elements, calling a data aggregation getter (like `getGalleryData()`) inside a rendering loop creates an $O(N^2)$ bottleneck. Additionally, using `getComputedStyle` or `innerText` for visibility checks during high-frequency updates (like GSAP animations) triggers layout thrashing, significantly slowing down the UI.

**Action:** Always hoist data fetching/aggregation outside of loops and use $O(1)$ lookup maps for metadata. Use `element.offsetParent === null` for cheap visibility checks and `textContent` instead of `innerText` to avoid unnecessary reflows. Batch GSAP animations to minimize overhead.
