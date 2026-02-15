## 2026-02-15 - Optimizing Resource Loading in Multi-Page Portfolio

**Learning:** In a data-driven portfolio where content is injected via JavaScript based on JSON data, the critical rendering path is blocked until the JSON is fetched. Standardizing resource hints (`preconnect` and `preload`) across all entry points (root and `pages/`) significantly reduces Time to Interactive. Specifically, preloading JSON data with `as="fetch"` and `crossorigin` prevents duplicate downloads and ensures the data is available immediately when the loader scripts execute.

**Action:** Always audit HTML entry points for missing resource hints for high-priority external origins (e.g., Cloudinary, CDNs) and internal JSON data. Use the non-blocking CSS pattern for non-critical stylesheets to further optimize the LCP.
