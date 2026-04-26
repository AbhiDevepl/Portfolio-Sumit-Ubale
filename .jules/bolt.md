## 2026-04-26 - [Schwartzian Transform for Gallery Sorting]
**Learning:** Extracting numeric sort keys and media types from URLs using regex is expensive when done repeatedly during $O(N \log N)$ sorting of ~1,200 items. Implementing a Schwartzian Transform (Map-Sort-Map) reduces processing time significantly by performing regex matches only once per item ($O(N)$).
**Action:** Always implement a Schwartzian Transform for datasets exceeding 500 items where sorting depends on expensive string parsing or regex extraction.

## 2026-04-26 - [DOM Scraping vs Data-Driven UI]
**Learning:** Scraping the DOM for item metadata (src, category, title) during Lightbox initialization causes layout thrashing and is significantly slower than looking up data in a pre-cached array. Storing the processed dataset in a globally accessible object (`window.contentLoader.allImages`) allows UI components to retrieve data via a simple index lookup.
**Action:** Prefer data-driven property retrieval over DOM scraping for performance-critical interactions like gallery filtering and Lightbox navigation.
