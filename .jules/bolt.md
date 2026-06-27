## 2024-05-24 - Redundant Fetches in Hybrid Script Architectures
**Learning:** In projects transitioning from legacy inline scripts to modular external scripts, redundant fetches of large JSON assets can easily occur if both systems attempt to manage the same DOM elements. This doubles network overhead and causes race conditions in rendering.
**Action:** Consolidate data fetching into a single external module that manages state and rendering, and completely remove legacy inline logic. Always monitor the Network tab for duplicate requests to the same resource.

## 2024-05-24 - O(N log N * M) Sort Bottlenecks
**Learning:** Client-side sorting of 1,000+ items becomes a bottleneck when the comparator performs lookups (like `indexOf`) or string manipulations.
**Action:** Use a Schwartzian Transform pattern to pre-calculate sort keys and weights into a Map during the initial data processing pass, reducing comparator complexity to O(1) lookups.
