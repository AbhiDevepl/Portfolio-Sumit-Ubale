## 2024-05-03 - Schwartzian Transform for Regex-based Sorting
**Learning:** For datasets exceeding 1,000 items where sorting depends on string parsing or regex (e.g., extracting numeric order from filenames like `10.jpg`), performing these operations inside the sort comparator leads to significant $O(N \log N)$ overhead. Pre-calculating these keys in a mapping phase (Schwartzian Transform) reduced execution time by ~5.4x in this codebase.
**Action:** Always pre-calculate sort keys and media types during the initial data processing pass for any collection that will be sorted or filtered multiple times.

## 2024-05-03 - DOM Scraping vs. JS Data Source
**Learning:** Scrapping metadata (titles, categories, absolute URLs) from the DOM for ~1,200 elements during Lightbox initialization or filtering is significantly slower than retrieving it from a pre-processed JavaScript array. It also introduces risks of mismatches due to absolute vs. relative URLs.
**Action:** Store the processed JSON data in a globally accessible array (e.g., `GalleryManager.allImages`) and use element `data-index` attributes for O(1) metadata retrieval instead of O(N) DOM traversal.
