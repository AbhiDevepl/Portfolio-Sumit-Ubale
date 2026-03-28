## 2026-03-28 - Gallery Loading $O(N^2)$ Bottleneck
**Learning:** Calling `getGalleryData()` (which flattens the entire portfolio into a new array) inside the `createGalleryItem` loop in `GalleryLoader.js` caused an $O(N^2)$ bottleneck. For a portfolio of ~1,200 items, this resulted in ~1.44 million object operations during a single render, taking over 1.3 seconds.
**Action:** Always pre-calculate expensive data getters outside of rendering loops and pass the result as a parameter to item factory functions.
