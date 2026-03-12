# Bolt's Performance Journal ⚡

This journal tracks critical performance learnings, surprising bottlenecks, and rejected optimizations.

## 2025-03-12 - O(N²) Rendering Bottleneck in GalleryLoader
**Learning:** Calling `getGalleryData()` (which re-aggregates 1,200+ items) inside a loop that iterates over those same items created an O(N²) complexity bottleneck, causing a noticeable delay (~200ms) during gallery rendering.
**Action:** Always cache aggregated data results outside of rendering loops when the data is used for subsequent item initialization (e.g., lightbox context).
