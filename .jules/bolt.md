## 2026-06-16 - [Optimized Portfolio Gallery Processing and Rendering]
**Learning:** Pre-calculating metadata (like category weights and formatted names) during a single data processing pass and using O(1) weight lookups for sorting significantly reduces overhead for large datasets (~1000 items). Direct DOM manipulation using `textContent` is measurably faster than `innerHTML` for frequently rendered list items.
**Action:** Always pre-calculate and cache expensive string manipulations and lookups before high-frequency loops (sorting, rendering).
