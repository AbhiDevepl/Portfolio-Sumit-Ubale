# Bolt's Performance Journal

## 2025-05-15 - O(N²) Rendering Bottleneck in GalleryLoader
**Learning:** In vanilla JS architectures with high-volume rendering (1,000+ items), avoid re-executing data getters that iterate over the entire dataset inside a loop. The `GalleryLoader` was calling `getGalleryData()` (which does a full data enrichment) for every single item created, turning an O(N) operation into O(N²).
**Action:** Hoist data aggregation and metadata enrichment outside of loops. Use pre-cached lookup maps for O(1) metadata resolution (like category name lookups) during item creation.

## 2025-05-15 - Layout Thrashing in Gallery Visibility Checks
**Learning:** Using `getComputedStyle(item).display` and `innerText` in visibility-based filtering logic (like lightbox item gathering) triggers expensive layout reflows. For galleries with ~1,200 items, this causes noticeable jank when opening the lightbox.
**Action:** Prefer `item.offsetParent !== null` for display-none checks as it avoids `getComputedStyle` in most layout-positioned environments. Use `textContent` instead of `innerText` for title extraction to avoid triggering a layout pass for style/visibility calculations.
