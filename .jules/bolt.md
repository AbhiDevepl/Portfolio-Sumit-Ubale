## 2026-03-26 - [Hoisting Redundant Data Getters in Rendering Loops]
**Learning:** In vanilla JS architectures with high-volume rendering (1,000+ items), calling a data getter (e.g., `getGalleryData()`) inside a `forEach` loop creates an O(N²) or O(N*M) bottleneck if that getter performs any aggregation or processing. Hoisting the call outside the loop and passing it as a parameter provides a massive speedup.
**Action:** Always audit loops that instantiate components or DOM elements to ensure no repetitive data fetching or processing is happening inside the loop body.
