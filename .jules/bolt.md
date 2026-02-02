## 2025-02-01 - Redundant Animation Loops (Lenis + GSAP)
**Learning:** When using Lenis alongside GSAP, it is common to accidentally create redundant update loops. Both libraries often compete to drive the `requestAnimationFrame` (RAF). In this codebase, Lenis was being updated by both a native RAF loop and a GSAP ticker listener, leading to double-execution of scroll calculations every frame.
**Action:** Always consolidate animation/scroll updates into a single loop (preferably `gsap.ticker` if GSAP is present) to ensure synchronization and reduce CPU overhead. Use `gsap.ticker.add((time) => lenis.raf(time * 1000))` for optimal results.

## 2025-05-15 - Critical Path and DOM Batching
**Learning:** In minimalist portfolios loading data via JSON, the combination of CSS `@import` and sequential DOM injections (`appendChild` in loops) creates significant rendering lag. `@import` blocks the parallel download of fonts, and unbatched DOM updates trigger excessive reflows as the gallery grows.
**Action:** Move `@import` to `<link>` tags with `preconnect`/`preload` in `index.html`. Always use `DocumentFragment` for batching DOM injections when populating UI from JSON data to minimize layout thrashing.
