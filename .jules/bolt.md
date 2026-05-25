## 2025-05-15 - Optimizing Large Portfolio Data Processing
**Learning:** For datasets exceeding 1,000 items, traditional array methods like `indexOf` inside a `sort` function create an $O(N \cdot M)$ bottleneck ($N$ items, $M$ categories). Transitioning to a Map-based Schwartzian Transform reduces this to $O(N \log N)$ by pre-calculating weights.
**Action:** Always pre-calculate lookup values (weights, IDs, formats) in the initial data-traversal pass rather than computing them during sorting or rendering.

## 2025-05-15 - Reactive Rendering in Vanilla JS
**Learning:** Manual DOM updates spread across multiple controllers (Filter, Modal, Main) lead to inconsistent UI states and redundant renders. A centralized `GalleryState` with a `patchState` method and a single reactive subscription ensures atomic updates.
**Action:** Use a "Single Source of Truth" state object and batch notifications to the renderer to prevent layout thrashing and "double-render" flashes.
