## 2025-02-01 - Redundant Animation Loops (Lenis + GSAP)
**Learning:** When using Lenis alongside GSAP, it is common to accidentally create redundant update loops. Both libraries often compete to drive the `requestAnimationFrame` (RAF). In this codebase, Lenis was being updated by both a native RAF loop and a GSAP ticker listener, leading to double-execution of scroll calculations every frame.
**Action:** Always consolidate animation/scroll updates into a single loop (preferably `gsap.ticker` if GSAP is present) to ensure synchronization and reduce CPU overhead. Use `gsap.ticker.add((time) => lenis.raf(time * 1000))` for optimal results.

## 2025-05-15 - Critical Rendering Path Chained Requests
**Learning:** Using `@import` for fonts inside a CSS file creates a chained request (HTML -> CSS -> Font) that delays font discovery and rendering. Additionally, critical assets like hero images and data JSONs used by initialization scripts should be preloaded to avoid waiting for the full DOM or script execution.
**Action:** Move font declarations to HTML `<link>` tags with `preconnect`, and use `<link rel="preload">` for above-the-fold images and critical data files to parallelize downloads and speed up the "Time to Interactive".
