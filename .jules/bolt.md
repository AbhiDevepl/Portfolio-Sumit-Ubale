## 2024-05-15 - Schwartzian Transform for Large Portfolio Datasets
**Learning:** In datasets exceeding 1,000 items (like this portfolio's 1,192 entries), performing regex-based numeric extraction and type detection within a sort comparator creates a significant bottleneck (O(N log N) with heavy constant factors). Moving these operations to a pre-sort map phase (Schwartzian Transform) reduced sort execution time by ~75% (from ~800ms to ~200ms for 100 iterations).

**Action:** Always pre-calculate sort keys and metadata during the initial data mapping phase for any collection larger than 500 items, especially when keys are derived from string parsing.

## 2024-05-15 - Centralized Gallery Data vs. DOM Scraping
**Learning:** Relying on the DOM as a source of truth for gallery metadata (via `querySelectorAll` scraping) results in O(N) overhead every time the lightbox is initialized. By maintaining a global `GalleryManager.allImages` store and using `data-index` attributes for O(1) lookups, we eliminate redundant DOM traversals and potential layout thrashing.

**Action:** Prefer a centralized data store for media-heavy components. Use stable `globalIndex` pointers in the DOM to map back to the pre-processed data source.
