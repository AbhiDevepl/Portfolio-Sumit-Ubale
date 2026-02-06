## 2025-02-01 - Redundant Animation Loops (Lenis + GSAP)
**Learning:** When using Lenis alongside GSAP, it is common to accidentally create redundant update loops. Both libraries often compete to drive the `requestAnimationFrame` (RAF). In this codebase, Lenis was being updated by both a native RAF loop and a GSAP ticker listener, leading to double-execution of scroll calculations every frame.
**Action:** Always consolidate animation/scroll updates into a single loop (preferably `gsap.ticker` if GSAP is present) to ensure synchronization and reduce CPU overhead. Use `gsap.ticker.add((time) => lenis.raf(time * 1000))` for optimal results.

## 2025-02-01 - Critical Rendering Path & Interaction Caching
**Learning:** Sequential resource loading (CSS @import) and repeated DOM querying (gallery filtering) significantly delay visual readiness and interaction response. Transitioning to parallel resource fetching and in-memory element caching drastically reduces Main Thread work.
**Action:** Replace CSS `@import` with HTML `<link>` tags for fonts. Cache frequently accessed DOM nodes (like gallery items) in the Manager object to avoid repeated `querySelectorAll` calls during frequent events like filtering.
