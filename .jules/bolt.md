# Bolt ⚡ Performance Journal

## 2025-05-14 - Gallery Rendering $O(N^2)$ and DOM Batching
**Learning:** In vanilla JS architectures handling large datasets (1200+ items), helper functions that perform array transformations (like `getGalleryData`) must be hoisted out of rendering loops. Calling such helpers inside a `forEach` loop created an $O(N^2)$ bottleneck that added ~80ms of scripting time for 1200 items. Additionally, batching GSAP animations into single array-based calls and using `offsetParent` for visibility checks significantly reduces layout thrashing and animation overhead.
**Action:** Always check loop bodies for data-transformation helpers and hoisting opportunities. Prefer `offsetParent` over `getComputedStyle` for visibility checks to avoid forced synchronous layouts.
