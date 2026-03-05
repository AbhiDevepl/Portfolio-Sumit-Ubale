## 2026-03-05 - [O(N^2) Rendering Bottleneck in Gallery Loader]
**Learning:** The `gallery-loader.js` was re-aggregating the entire portfolio dataset for every single image rendered via `getGalleryData()`, leading to quadratic complexity. In a portfolio with 350+ items, this causes significant main-thread blocking during initial render.
**Action:** Always pre-calculate and cache enriched data arrays once per render cycle when using loop-based DOM fragment generation.

## 2026-03-05 - [Global Component Injection Dependency]
**Learning:** Shared UI components injected via `Core.DOM.injectGlobalComponents` create a hard dependency on `core.js` across all entry points. Missing this script tag in sub-pages results in ReferenceErrors during initialization.
**Action:** Ensure `core.js` is prioritized in the `<head>` or at the top of the script list in all HTML entry points to satisfy global utility requirements.
