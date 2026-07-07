# Bolt's Performance Journal

## 2025-05-15 - Optimized Portfolio Sorting & DOM Performance
**Learning:** Sorting large data sets (1,000+ items) in the browser can become a bottleneck if the comparator function performs redundant operations like regex, string lookups, or array index lookups (e.g., `Array.prototype.indexOf`). Implementing a Schwartzian Transform-like pattern to pre-calculate sort weights and formatted attributes during the initial data processing pass reduces comparator complexity from O(C) to O(1). Additionally, replacing `innerHTML` with `createElement` and `textContent` in high-frequency rendering loops significantly reduces parsing overhead and improves security.

**Action:** Always profile data processing logic for galleries exceeding 500 items. Move formatting and weight assignments to the ingestion phase (`processData`) rather than the rendering or sorting phase. Avoid DOM lookups (like `getElementById`) inside rendering loops.
