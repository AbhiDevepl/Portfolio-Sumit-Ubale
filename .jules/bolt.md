## 2025-03-11 - [Algorithmic Efficiency & Layout Thrashing]
**Learning:** For large datasets (1,200+ items), O(N²) operations in the rendering loop (like repeated data aggregation) cause visible main-thread stutters (~0.5s). Additionally, using `window.getComputedStyle` in a loop for visibility checks triggers layout thrashing, which is expensive when the DOM is large.
**Action:** Always cache aggregated data outside loops and favor `offsetParent` or inline style checks over `getComputedStyle` for high-frequency visibility checks.
