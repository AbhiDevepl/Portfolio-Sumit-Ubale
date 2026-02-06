## 2025-02-01 - Redundant Animation Loops (Lenis + GSAP)
**Learning:** When using Lenis alongside GSAP, it is common to accidentally create redundant update loops. Both libraries often compete to drive the `requestAnimationFrame` (RAF). In this codebase, Lenis was being updated by both a native RAF loop and a GSAP ticker listener, leading to double-execution of scroll calculations every frame.
**Action:** Always consolidate animation/scroll updates into a single loop (preferably `gsap.ticker` if GSAP is present) to ensure synchronization and reduce CPU overhead. Use `gsap.ticker.add((time) => lenis.raf(time * 1000))` for optimal results.

## 2025-05-15 - Optimizing Critical Rendering Path and Gallery Interaction
**Learning:** Using CSS @import for fonts creates a sequential loading bottleneck. Additionally, repeated DOM queries and redundant GSAP animations (even for items already in their target state) consume unnecessary CPU cycles during user interactions.
**Action:** Move font loads to HTML <link> with preconnect, preload critical assets (Hero/Data), cache DOM elements, and add state checks before triggering animations.
