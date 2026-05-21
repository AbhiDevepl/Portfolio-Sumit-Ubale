## 2025-05-15 - Portfolio Gallery Optimization
**Learning:** In `scripts/portfolio-gallery.js`, using a Map for O(1) category weight lookups and pre-calculating them (Schwartzian Transform) significantly reduces sorting overhead for large datasets (~1,000 items). Additionally, `replaceChildren` is faster than `innerHTML = ''` for DOM updates, and batching state updates with `patchState` prevents redundant re-renders.
**Action:** Always prefer Map lookups over `indexOf` in hot paths (like sort comparators) and use `replaceChildren` for bulk DOM updates with a fallback for compatibility.
