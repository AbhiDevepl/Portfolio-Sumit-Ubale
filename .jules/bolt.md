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

## 2026-07-31 - [Progressive Batch Rendering on Dedicated Gallery Page to Prevent Initial DOM Overload]
**Learning:** Loading and rendering over 1,000 items synchronously on `/pages/gallery.html` creates a massive performance bottleneck, blocking the browser's main thread and severely delaying TTI. By implementing progressive batch rendering (batches of 36) using an `IntersectionObserver` sentinel, we drop the initial DOM nodes count by ~96.5% while keeping the entire dataset available inside Lightbox pagination. To make this bulletproof across headless/test environments and old browsers, we must include feature detection for `IntersectionObserver` and thoroughly cleanup resources using `this.observer.disconnect()`.
**Action:** Always apply progressive list rendering for large dynamic collections, decouple Lightbox pagination from the DOM by passing the full list directly, perform `IntersectionObserver` feature detection, and call `disconnect()` on cleanup to prevent memory leaks.

## 2026-08-01 - [Defensive Dependency Wrapping to Prevent Script Crashes & Enable Light Native Fallback]
**Learning:** Including heavy scroll orchestrators like Lenis or GSAP ScrollTrigger on some but not all pages can cause scripts loaded globally (such as `scripts/smooth-scroll.js`) to completely crash on lightweight pages like `/pages/portfolio.html`. By wrapping the scroll engine and integration hooks with defensive `typeof` checks, we avoid fatal script crashes, completely skip unused event/ticker bindings, and can implement clean native fallback `scrollIntoView({ behavior: 'smooth' })` patterns for a lightweight, crash-free, high-performance experience.
**Action:** Always wrap third-party script integrations and scroll tickers with defensive `typeof` guards to ensure lightweight pages don't crash, and provide a lightweight native browser fallback whenever possible.
