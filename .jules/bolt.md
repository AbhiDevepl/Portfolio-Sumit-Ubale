## 2026-07-01 - Sorting Bottleneck with Large Datasets
**Learning:** In a dataset with 1,000+ items, using `Array.indexOf` inside a sort comparator creates an $O(N \log N \cdot M)$ complexity that noticeably lags on mobile devices.
**Action:** Always pre-calculate sorting weights into a Map or object property (Schwartzian Transform) during the initial data processing pass to achieve $O(N \log N)$ complexity with $O(1)$ lookups during the sort.

## 2026-07-01 - DOM Performance in High-Frequency Loops
**Learning:** `innerHTML` is significantly slower than `createElement` and `textContent` when rendering 1,000+ items because it triggers the HTML parser for every iteration.
**Action:** Prefer direct DOM manipulation (`appendChild`, `textContent`) in large rendering loops to minimize parsing overhead and improve security.

## 2026-07-01 - Cloudflare CI Syntax Constraints
**Learning:** The Cloudflare Workers CI for this project fails on trailing commas in class method definitions, even if valid in modern Node.js.
**Action:** Use `node -c` to verify syntax and ensure no trailing commas remain after class methods or in object/array literals before submission.
