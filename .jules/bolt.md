# Bolt's Journal - Critical Learnings

This journal contains critical performance-related learnings specific to this codebase.

## 2026-07-20 - [Caching In-Memory Filtering and Flattening Results on 1000+ Items Dataset]
**Learning:** The portfolio dataset contains over 1,000 items and is queried on every pagination, filtering, and page load event. Repeatedly calling `.filter()` on `this.portfolioData` inside `appendItems()` and `.flat()` on `this.mediaData` inside `getFilteredItems()` incurs significant CPU overhead, especially during scrolling and category transitions. Adding a simple, lazy-initialized in-memory cache (`this.filteredCache` and `this._flatMediaDataCache`) avoids this redundant O(N) overhead entirely after the first access.
**Action:** Always verify if large datasets are queried frequently in high-speed interaction paths (like scrolling or category tabs), and apply lazy-initialized memoization/caching to keep operations at O(1) complexity.

## 2026-07-21 - [Caching Appended Portfolio Items to Prevent O(N) DOM-Queries and Layout Thrashing]
**Learning:** Querying the DOM dynamically inside high-frequency interaction events (such as fetching visible elements to pass to the Lightbox upon clicking a portfolio item) triggers expensive browser layout calculations and element lookups (`document.querySelectorAll` + nested `.querySelector`). By tracking the appended items in-memory during insertion via `this.currentlyAppendedItems`, we can bypass the DOM query entirely and retrieve the exact items structure in O(1) time complexity.
**Action:** Maintain a parallel in-memory array/cache of dynamic visual elements inside loaders/renderers to avoid querying the DOM when those structures are requested for interactive features (like Lightboxes).

## 2026-07-28 - [Caching Services Data to Eliminate Redundant Network Fetch Requests]
**Learning:** The service detail page loads `/data/services.json` on every page load. While it is smaller than the full portfolio JSON (~5KB vs 291KB), repeated fetches add network roundtrip latency (TTI/Lat) and cause layout shift on slower connections. Implementing session-based caching of `/data/services.json` into `sessionStorage` via `window.Core.fetchServicesData` completely bypasses subsequent network fetch requests.
**Action:** Always identify secondary data dependencies that are loaded synchronously/dynamically and apply session-based storage caching to completely eliminate repeated network roundtrips on page navigation.

## 2026-07-29 - [Bypassing SessionStorage retrieval/parsing with In-Memory Caching & Matching Dynamic Selectors]
**Learning:** For large datasets like a 291KB portfolio JSON, retrieving strings from sessionStorage and calling `JSON.parse` takes 1-3ms per call. Adding a simple synchronous in-memory variable cache on top of sessionStorage makes retrieving cached data O(1) with 0ms overhead during the same page load. Additionally, checking page-specific class names (e.g., `.portfolio-item` vs `.gallery-item`) inside core behaviors like `VideoHover` is critical to prevent silent script failures that disable critical performance features (like lazy-loading and auto-pausing).
**Action:** Pair Web Storage with synchronous in-memory variable caching for heavy payload files, and ensure closest() selectors support all page-specific variation classes across the workspace to avoid silent feature degradation.
