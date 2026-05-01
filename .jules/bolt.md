# Bolt's Performance Journal

## 2025-05-14 - Optimized Sorting with Schwartzian Transform
**Learning:** In datasets exceeding 1,000 items, performing regex extraction or string manipulation inside a sort comparator creates a significant $O(N \log N)$ bottleneck. The browser's main thread can be blocked during initial page load.
**Action:** Always use a Schwartzian Transform (map-sort-map) for complex sorting. Pre-calculate sort keys and metadata in a single $O(N)$ pass before sorting to ensure the comparator only performs simple comparisons.

## 2025-05-14 - Data-Index vs. DOM Scraping
**Learning:** Scraping the DOM for metadata (like image URLs or descriptions) during event-driven interactions (e.g., opening a lightbox) is an $O(N)$ operation that scales poorly.
**Action:** Maintain a global source of truth in JavaScript (e.g., `window.contentLoader.allImages`) and use `data-index` attributes on DOM elements to perform $O(1)$ lookups into the data array.
