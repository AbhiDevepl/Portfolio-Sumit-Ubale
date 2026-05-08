## 2024-05-05 - Optimize gallery sorting performance
**Learning:** Using a Schwartzian Transform (map-sort-map) significantly improves performance when sorting large datasets based on string-derived keys (like regex-extracted numbers from filenames).
**Action:** Always pre-calculate expensive sort keys before the sort phase for datasets > 500 items.

**Optimization Metric:**
- Dataset size: 1,192 items
- Original sort time: ~7.14ms avg per sort call
- Optimized sort time: ~1.68ms avg per sort call
- Performance improvement: ~4.25x speedup

## 2024-05-20 - Avoid expensive DOM scraping for Lightbox metadata
**Learning:** Querying the DOM for metadata (sources, titles, categories) on every item during Lightbox initialization is expensive for large galleries (> 1000 items). Using a centralized state/cache and mapping via `data-index` provides O(1) lookup per item.
**Action:** Centralize processed media metadata in a global object (e.g., `window.GalleryManager.allImages`) and use it as the source of truth for dynamic components like Lightboxes.

**Optimization Metric:**
- Dataset size: 1,192 items
- Original `getVisibleData` time: ~0.51ms (mock env)
- Optimized `getVisibleData` time: ~0.28ms (mock env)
- Expected Speedup: ~1.83x (Higher in real browser due to layout/style overhead of DOM queries)
