## 2026-03-24 - Hoisting expensive data aggregation in rendering loops
**Learning:** In a vanilla JS architecture handling 1,000+ items, calling a data flattening/getter function (like `getGalleryData`) inside a rendering loop creates an $O(N^2)$ bottleneck that blocks the main thread for over a second.
**Action:** Always hoist data aggregation and mapping outside of loops. Pass pre-calculated data as an argument to item creation functions to ensure $O(N)$ rendering complexity.
