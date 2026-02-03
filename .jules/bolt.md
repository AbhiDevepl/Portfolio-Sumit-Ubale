## 2025-02-01 - Redundant Animation Loops (Lenis + GSAP)
**Learning:** When using Lenis alongside GSAP, it is common to accidentally create redundant update loops. Both libraries often compete to drive the `requestAnimationFrame` (RAF). In this codebase, Lenis was being updated by both a native RAF loop and a GSAP ticker listener, leading to double-execution of scroll calculations every frame.
**Action:** Always consolidate animation/scroll updates into a single loop (preferably `gsap.ticker` if GSAP is present) to ensure synchronization and reduce CPU overhead. Use `gsap.ticker.add((time) => lenis.raf(time * 1000))` for optimal results.

## 2025-05-15 - Critical Path Optimization (Fonts & Assets)
**Learning:** Using CSS `@import` for fonts creates a waterfall effect where the browser must download and parse the CSS before discovering the font URLs. This delays text rendering and contributes to FOUT/LCP issues. Additionally, high-priority data (JSON) and hero images not explicitly preloaded can delay the final page render.
**Action:** Replace CSS `@import` with HTML `<link>` tags and use `preconnect` for font CDNs. Implement `preload` for critical, above-the-fold assets like hero images and data files required for initial rendering.
