## 2025-02-01 - Redundant Animation Loops (Lenis + GSAP)
**Learning:** When using Lenis alongside GSAP, it is common to accidentally create redundant update loops. Both libraries often compete to drive the `requestAnimationFrame` (RAF). In this codebase, Lenis was being updated by both a native RAF loop and a GSAP ticker listener, leading to double-execution of scroll calculations every frame.
**Action:** Always consolidate animation/scroll updates into a single loop (preferably `gsap.ticker` if GSAP is present) to ensure synchronization and reduce CPU overhead. Use `gsap.ticker.add((time) => lenis.raf(time * 1000))` for optimal results.

## 2025-05-15 - Critical Rendering Path & DOM Batching
**Learning:** Moving font imports from CSS `@import` to HTML `<link>` tags prevents the browser from waiting for CSS parsing to discover font assets, effectively flattening the critical request chain. Additionally, using `DocumentFragment` for batching multiple DOM insertions (e.g., gallery items) significantly reduces layout reflows compared to iterative `appendChild` calls.
**Action:** Prioritize HTML-based resource hinting (preconnect/preload) for critical assets and always batch DOM updates when inserting more than 3 elements to maintain 60FPS during dynamic content loading.
