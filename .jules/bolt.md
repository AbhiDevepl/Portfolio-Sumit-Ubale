# ⚡ Bolt's Performance Journal

## 2026-06-19 - [O(1) Sort weights & DOM Optimization]
**Learning:** In client-side galleries with 1,000+ items, `Array.prototype.sort()` using `indexOf()` on every comparison creates an O(N log N * M) bottleneck. Pre-calculating weights into a Map/Object reduces this to O(N log N). Additionally, while `textContent` and `createElement` might show higher overhead in Node.js mock environments compared to `innerHTML`, they provide significant benefits in real browsers by avoiding HTML parsing and reducing XSS risk.
**Action:** Always pre-calculate comparison metadata and prefer atomic DOM operations over `innerHTML` for high-frequency rendering.
