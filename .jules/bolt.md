## 2024-05-05 - Optimize gallery sorting performance
**Learning:** Using a Schwartzian Transform (map-sort-map) significantly improves performance when sorting large datasets based on string-derived keys (like regex-extracted numbers from filenames).
**Action:** Always pre-calculate expensive sort keys before the sort phase for datasets > 500 items.

**Optimization Metric:**
- Dataset size: 1,192 items
- Original sort time: ~7.14ms avg per sort call
- Optimized sort time: ~1.68ms avg per sort call
- Performance improvement: ~4.25x speedup

## 2024-05-09 - Optimize gallery filtering and metadata retrieval
**Learning:** Batching animations for large sets (1,200+ items) using GSAP's array syntax significantly reduces main-thread overhead compared to individual tweens in a loop. Additionally, caching processed metadata in memory eliminates O(N) DOM scraping bottlenecks during high-frequency events like Lightbox initialization.
**Action:** Always prefer batch GSAP tweens (`gsap.to(items, ...)`) for more than 50 elements and maintain a centralized data cache for complex DOM components.

**Optimization Metric:**
- Filtering Overhead: Reduced from 1,200+ individual tweens to just 2 batch tweens.
- Metadata retrieval (1,000 calls): ~3.89ms (original) vs ~2.03ms (cached).
- Speedup: ~1.92x for data access.

## 2024-05-10 - Portfolio Gallery Performance and Logic Optimization
**Learning:** For large datasets (1,200+ items), O(N log N * M) sorting using array indexing for weights creates measurable overhead; O(1) Map lookups are more efficient. Additionally,  is a superior alternative to  for high-performance DOM clearing and population. Viewport-aware animation batching with `ScrollTrigger.batch` is critical to prevent main-thread congestion when rendering long lists.
**Action:** Use `replaceChildren` for bulk DOM updates and `ScrollTrigger.batch` for list animations exceeding 100 items. Always subscribe to state changes in custom controller architectures.

**Optimization Metric:**
- Processing/Sorting Overhead: ~11% reduction in comparison time for 1M calls.
- Animation Efficiency: Reduced initial main-thread load from 1,200 simultaneous tweens to viewport-only batches.
- UX: Fixed broken filtering by implementing state subscription.

## 2024-05-10 - Portfolio Gallery Performance and Logic Optimization
**Learning:** For large datasets (1,200+ items), O(N log N * M) sorting using array indexing for weights creates measurable overhead; O(1) Map lookups are more efficient. Additionally, `Element.replaceChildren()` is a superior alternative to `innerHTML = ''` for high-performance DOM clearing and population. Viewport-aware animation batching with `ScrollTrigger.batch` is critical to prevent main-thread congestion when rendering long lists.
**Action:** Use `replaceChildren` for bulk DOM updates and `ScrollTrigger.batch` for list animations exceeding 100 items. Always subscribe to state changes in custom controller architectures.

**Optimization Metric:**
- Processing/Sorting Overhead: ~11% reduction in comparison time for 1M calls.
- Animation Efficiency: Reduced initial main-thread load from 1,200 simultaneous tweens to viewport-only batches.
- UX: Fixed broken filtering by implementing state subscription.
