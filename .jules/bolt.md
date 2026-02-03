## 2025-02-01 - Redundant Animation Loops (Lenis + GSAP)
**Learning:** When using Lenis alongside GSAP, it is common to accidentally create redundant update loops. Both libraries often compete to drive the `requestAnimationFrame` (RAF). In this codebase, Lenis was being updated by both a native RAF loop and a GSAP ticker listener, leading to double-execution of scroll calculations every frame.
**Action:** Always consolidate animation/scroll updates into a single loop (preferably `gsap.ticker` if GSAP is present) to ensure synchronization and reduce CPU overhead. Use `gsap.ticker.add((time) => lenis.raf(time * 1000))` for optimal results.

## 2026-02-03 - Critical Request Chain Optimization
**Learning:** CSS `@import` for fonts creates a sequential dependency (HTML -> CSS -> Font), which delays text rendering. Additionally, not preloading critical assets like hero images and data JSONs delays the Largest Contentful Paint (LCP).
**Action:** Optimize the critical rendering path by replacing CSS `@import` with HTML `<link rel="preconnect">` and `<link rel="preload">` for fonts, hero images, and critical JSON data. This enables parallel fetching and reduces the time to first render.
