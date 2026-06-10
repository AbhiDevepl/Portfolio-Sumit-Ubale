# Bolt's Journal - Critical Learnings

## 2025-06-11 - [Optimization Bottleneck in Client-Side Sorting]
**Learning:** The primary performance bottleneck in client-side sorting for large datasets (1,000+ items) is often the $O(M)$ operations (like `Array.indexOf()`) executed within the $O(N \log N)$ sort comparator. This leads to $O(N \log N \cdot M)$ complexity.
**Action:** Always pre-calculate comparison metadata (like category weights) into an $O(1)$ lookup Map or object before starting the sort operation.

## 2025-06-11 - [Redundant String Manipulations in Loops]
**Learning:** String formatting (e.g., slug-to-title conversion) is expensive when performed repeatedly within a loop of 1,000+ items or during each render cycle.
**Action:** Pre-calculate formatted strings during the initial data processing pass and cache results for reused tokens (like category names).

## 2025-06-11 - [DOM Manipulation Security and Performance]
**Learning:** Using `innerHTML` is slower and less secure than `textContent` combined with manual element creation via `createElement`.
**Action:** Favor `textContent` for dynamic text and `appendChild` for structured content to improve both rendering speed and security (XSS prevention).
