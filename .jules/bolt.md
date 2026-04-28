## 2025-01-24 - Schwartzian Transform for Large Gallery Sorting
**Learning:** For datasets exceeding 1,000 items, performing string manipulations and regex matches inside a sort comparison function causes significant main-thread blocking (O(N log N) regex overhead). In this project, sorting ~1,200 items was taking ~700ms in some environments because `split`, `match`, and `parseInt` were called repeatedly.
**Action:** Always use a Schwartzian Transform (Decorate-Sort-Undecorate) pattern. Extract all sort keys and media types once during a mapping phase to ensure the comparison function only handles primitive numeric/string comparisons. This reduced sorting overhead by ~4.2x to 52x depending on the JS engine's optimization state.

## 2025-01-24 - GSAP Animation Batching for Gallery Filtering
**Learning:** Creating individual GSAP tweens in a loop for 1,200 items causes heavy memory allocation and animation engine overhead, leading to "stutter" during category filtering.
**Action:** Use GSAP's array-based animation capability (`gsap.to(elements, { ... stagger: 0.02 })`) to batch DOM updates. This allows the animation engine to optimize the timeline internally and reduces the number of active tween objects.
