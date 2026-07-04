## 2025-07-04 - Consolidating redundant gallery logic

**Learning:** Duplicate data fetching and rendering logic between inline scripts and external modules (e.g., `index.html` vs `scripts/content-loader.js`) leads to significant performance bloat, including redundant ~300KB JSON transfers and increased HTML document size. Consolidating these into a single cached module reduces network overhead and ensures consistent behavior across features.

**Action:** Always check for overlapping logic between `index.html` inline scripts and deferred JS modules. Consolidation is a high-impact optimization for both load speed and maintainability.
