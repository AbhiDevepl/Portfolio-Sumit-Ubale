## 2025-01-24 - Layout Thrashing in GalleryManager
**Learning:** Frequent calls to `getComputedStyle` within loops, especially during filtering or scroll events, trigger layout thrashing that degrades interaction performance.
**Action:** Move DOM state checks to a pre-calculated metadata cache during initialization. Use O(1) object lookups instead of O(N) DOM queries during high-frequency interactions.

## 2025-01-24 - JS vs CSS for Micro-Interactions
**Learning:** GSAP-driven hover effects on large grids can cause noticeable main-thread overhead on lower-end devices.
**Action:** Favor CSS transitions for simple opacity/transform hover states and reserve GSAP for complex sequence animations or state-driven visibility toggles.
