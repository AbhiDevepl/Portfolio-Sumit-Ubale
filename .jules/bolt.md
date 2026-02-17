# Bolt's Journal - Sumit Ubale Photography

## 2025-05-15 - Preloading Dynamic Data Assets
**Learning:** In a vanilla JS application where content is entirely driven by JSON data, the browser's default discovery of these data dependencies is late (only after the main JS bundle is parsed and executed). This creates a sequential waterfall that delays the first paint of meaningful content. Preloading these JSON assets with `<link rel="preload" as="fetch" crossorigin>` allows the browser to fetch data in parallel with scripts and CSS.

**Action:** Always identify the core data source (JSON/API) for dynamic pages and add high-priority resource hints (`preload`) in the `<head>`. For same-origin fetch requests, ensure `crossorigin` is present in the preload tag to match the CORS mode of the standard `fetch()` API and avoid duplicate downloads.
