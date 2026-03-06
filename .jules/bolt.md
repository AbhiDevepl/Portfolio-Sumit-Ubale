## 2026-03-06 - [Gallery Rendering $O(N^2)$ Bottleneck]
**Learning:** Calling data aggregation/enrichment getters (like `getGalleryData()`) inside a rendering loop created an $O(N^2)$ bottleneck. As the portfolio grew, this caused noticeable main-thread jank during page initialization.
**Action:** Always hoist data preparation logic out of rendering loops. Pre-calculate the necessary dataset once and pass it as a parameter to item creation functions.
