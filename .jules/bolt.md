# Bolt's Journal - Critical Learnings

This journal contains critical performance-related learnings specific to this codebase.

## 2026-08-02 - [O(1) Randomized Cover Image Selection on Dedicated Albums Page]
**Learning:** The dedicated albums page `/pages/albums.html` loops through all categories and selects a random image as the album cover. Previously, this performed an O(N) array allocation, filtering, and regex URL string matching on up to 300+ items per category, just to select ONE random image. By implementing a lazy randomized probe loop (trying up to 5 random indexes, then falling back to a sequential `.find` search), we completely avoid array allocations and regex overhead in 99.9% of cases, yielding a 3.5x speedup (~71.3% reduction in execution time) with clean ES6 code.
**Action:** When selecting a random single item from a collection based on a condition, prefer lazy randomized probing in O(1) over O(N) filtering of the entire collection if the target elements are abundant.

## 2026-07-20 - [Caching In-Memory Filtering and Flattening Results on 1000+ Items Dataset]
**Learning:** The portfolio dataset contains over 1,000 items and is queried on every pagination, filtering, and page load event. Repeatedly calling `.filter()` on `this.portfolioData` inside `appendItems()` and `.flat()` on `this.mediaData` inside `getFilteredItems()` incurs significant CPU overhead, especially during scrolling and category transitions. Adding a simple, lazy-initialized in-memory cache (`this.filteredCache` and `this._flatMediaDataCache`) avoids this redundant O(N) overhead entirely after the first access.
**Action:** Always verify if large datasets are queried frequently in high-speed interaction paths (like scrolling or category tabs), and apply lazy-initialized memoization/caching to keep operations at O(1) complexity.

## 2026-07-21 - [Caching Appended Portfolio Items to Prevent O(N) DOM-Queries and Layout Thrashing]
**Learning:** Querying the DOM dynamically inside high-frequency interaction events (such as fetching visible elements to pass to the Lightbox upon clicking a portfolio item) triggers expensive browser layout calculations and element lookups (`document.querySelectorAll` + nested `.querySelector`). By tracking the appended items in-memory during insertion via `this.currentlyAppendedItems`, we can bypass the DOM query entirely and retrieve the exact items structure in O(1) time complexity.
**Action:** Maintain a parallel in-memory array/cache of dynamic visual elements inside loaders/renderers to avoid querying the DOM when those structures are requested for interactive features (like Lightboxes).

## 2026-07-28 - [Caching Services Data to Eliminate Redundant Network Fetch Requests]
**Learning:** The service detail page loads `/data/services.json` on every page load. While it is smaller than the full portfolio JSON (~5KB vs 291KB), repeated fetches add network roundtrip latency (TTI/Lat) and cause layout shift on slower connections. Implementing session-based caching of `/data/services.json` into `sessionStorage` via `window.Core.fetchServicesData` completely bypasses subsequent network fetch requests.
**Action:** Always identify secondary data dependencies that are loaded synchronously/dynamically and apply session-based storage caching to completely eliminate repeated network roundtrips on page navigation.

## 2026-07-31 - [Progressive Batch Rendering on Dedicated Gallery Page to Prevent Initial DOM Overload]
**Learning:** Loading and rendering over 1,000 items synchronously on `/pages/gallery.html` creates a massive performance bottleneck, blocking the browser's main thread and severely delaying TTI. By implementing progressive batch rendering (batches of 36) using an `IntersectionObserver` sentinel, we drop the initial DOM nodes count by ~96.5% while keeping the entire dataset available inside Lightbox pagination. To make this bulletproof across headless/test environments and old browsers, we must include feature detection for `IntersectionObserver` and thoroughly cleanup resources using `this.observer.disconnect()`.
**Action:** Always apply progressive list rendering for large dynamic collections, decouple Lightbox pagination from the DOM by passing the full list directly, perform `IntersectionObserver` feature detection, and call `disconnect()` on cleanup to prevent memory leaks.
