## 2025-05-15 - [O(N²) Loop Bottleneck in GalleryLoader]
**Learning:** In architectures where data is shared across multiple factory methods (e.g., `Core.Media.createItem`), calling heavy data aggregation methods (like `getGalleryData()`) inside a rendering loop creates an O(N²) bottleneck. This is particularly severe in vanilla JS when the dataset grows to ~1,200 items, as the browser must re-process the entire image collection for every single DOM element created.
**Action:** Always hoist data aggregation out of rendering loops and pass the result as a parameter to item factory functions.
