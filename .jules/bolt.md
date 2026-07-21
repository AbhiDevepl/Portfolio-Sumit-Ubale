# Bolt's Journal - Critical Learnings

This journal contains critical performance-related learnings specific to this codebase.

## 2026-07-20 - [Caching In-Memory Filtering and Flattening Results on 1000+ Items Dataset]
**Learning:** The portfolio dataset contains over 1,000 items and is queried on every pagination, filtering, and page load event. Repeatedly calling `.filter()` on `this.portfolioData` inside `appendItems()` and `.flat()` on `this.mediaData` inside `getFilteredItems()` incurs significant CPU overhead, especially during scrolling and category transitions. Adding a simple, lazy-initialized in-memory cache (`this.filteredCache` and `this._flatMediaDataCache`) avoids this redundant O(N) overhead entirely after the first access.
**Action:** Always verify if large datasets are queried frequently in high-speed interaction paths (like scrolling or category tabs), and apply lazy-initialized memoization/caching to keep operations at O(1) complexity.

## 2026-07-21 - [Caching Appended Portfolio Items to Prevent O(N) DOM-Queries and Layout Thrashing]
**Learning:** Querying the DOM dynamically inside high-frequency interaction events (such as fetching visible elements to pass to the Lightbox upon clicking a portfolio item) triggers expensive browser layout calculations and element lookups (`document.querySelectorAll` + nested `.querySelector`). By tracking the appended items in-memory during insertion via `this.currentlyAppendedItems`, we can bypass the DOM query entirely and retrieve the exact items structure in O(1) time complexity.
**Action:** Maintain a parallel in-memory array/cache of dynamic visual elements inside loaders/renderers to avoid querying the DOM when those structures are requested for interactive features (like Lightboxes).
