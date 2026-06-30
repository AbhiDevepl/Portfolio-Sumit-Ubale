
## 2026-06-30 - Redundant Homepage Fetch Consolidation
**Learning:** The homepage was performing two redundant 300KB fetches of the same portfolio data—one via script and one inline. Centralizing this logic into the `ContentLoader` class allowed for better cache management and reduced HTML payload size.
**Action:** Always check `index.html` for inline scripts that fetch data already handled by the app's main classes. Consolidated rendering logic in a single class (`ContentLoader`) using `DocumentFragment` and specific performance hints like `decoding="async"` provides measurable load-time improvements.
