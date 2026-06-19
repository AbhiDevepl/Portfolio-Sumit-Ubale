## 2026-06-19 - Sorting Complexity and DOM Optimization

**Learning:** The primary performance bottleneck for the portfolio gallery (~1,000 items) was the $O(N \log N \cdot M)$ complexity in the sort comparator, caused by repeated `Array.indexOf` calls for category weights. Additionally, using `innerHTML` for high-frequency rendering added unnecessary parsing overhead.

**Action:** Always pre-calculate sorting weights and display strings (like formatted categories) into a single data processing pass. Use `textContent` and manual DOM element creation instead of `innerHTML` to minimize layout thrashing and improve rendering speed. Explicitly trigger UI updates when avoiding complex event subscription patterns to maintain predictability in legacy environments.
