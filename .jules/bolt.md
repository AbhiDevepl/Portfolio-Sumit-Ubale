# Bolt's Journal - Critical Learnings

This journal contains critical performance-related learnings specific to this codebase.

## 2026-07-20 - [Caching In-Memory Filtering and Flattening Results on 1000+ Items Dataset]
**Learning:** The portfolio dataset contains over 1,000 items and is queried on every pagination, filtering, and page load event. Repeatedly calling `.filter()` on `this.portfolioData` inside `appendItems()` and `.flat()` on `this.mediaData` inside `getFilteredItems()` incurs significant CPU overhead, especially during scrolling and category transitions. Adding a simple, lazy-initialized in-memory cache (`this.filteredCache` and `this._flatMediaDataCache`) avoids this redundant O(N) overhead entirely after the first access.
**Action:** Always verify if large datasets are queried frequently in high-speed interaction paths (like scrolling or category tabs), and apply lazy-initialized memoization/caching to keep operations at O(1) complexity.

## 2026-07-21 - [Caching Appended Portfolio Items to Prevent O(N) DOM-Queries and Layout Thrashing]
**Learning:** Querying the DOM dynamically inside high-frequency interaction events (such as fetching visible elements to pass to the Lightbox upon clicking a portfolio item) triggers expensive browser layout calculations and element lookups (`document.querySelectorAll` + nested `.querySelector`). By tracking the appended items in-memory during insertion via `this.currentlyAppendedItems`, we can bypass the DOM query entirely and retrieve the exact items structure in O(1) time complexity.
**Action:** Maintain a parallel in-memory array/cache of dynamic visual elements inside loaders/renderers to avoid querying the DOM when those structures are requested for interactive features (like Lightboxes).

## 2026-07-25 - [Caching Aggregation and One-Time Navigation Rendering on 1000+ Items Gallery Page]
**Learning:** In page-specific gallery loaders (such as `gallery-loader.js`), transitioning category filter chips originally triggered a complete rebuild/mapping of over 1,000 image/video items from raw JSON keys. It also fully destroyed and recreated the category navigation chip DOM nodes, triggering heavy layout thrashing, repaint storm, and garbage collection pauses. Adding lazy-initialized in-memory caches (`_imagesCache` and `_galleryDataCache`) and rendering navigation chips exactly once with `.active` class toggles keeps transitions instantaneous and fluid.
**Action:** In page-level category transitions, cache both raw aggregate datasets and mapped component arrays, and avoid destroying/recreating control UI elements; toggle CSS states on cached structures instead.
