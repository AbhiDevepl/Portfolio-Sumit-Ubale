## 2025-05-21 - Batching GSAP and Avoiding Layout Thrashing in Large Collections

**Learning:** Individual GSAP calls (`gsap.to`) within a loop for 1,000+ items incur significant overhead. Batching elements into arrays and animating them collectively reduces execution time drastically. Furthermore, using `window.getComputedStyle` inside loops triggers layout thrashing; using `offsetParent === null` for quick visibility checks and reading inline styles before falling back to `getComputedStyle` improves performance.

**Action:** Always batch GSAP animations when dealing with large sets of elements. Prioritize `offsetParent` and inline style checks for visibility logic in rendering loops.
