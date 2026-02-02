## 2025-05-24 - [Smooth Scroll Conflict & Redundant Listeners]
**Learning:** Found that global `scroll-behavior: smooth` in CSS conflicts with Lenis smooth-scroll library, causing jittery scroll behavior. Also, GSAP hover listeners were redundant as CSS transitions were already defined for the same elements.
**Action:** Always check for existing smooth-scroll libraries before setting global CSS scroll behavior. Prefer CSS transitions over GSAP for simple interaction states (hover/active) to reduce JS execution.
