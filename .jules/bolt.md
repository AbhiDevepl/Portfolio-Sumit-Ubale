# Bolt's Performance Journal ⚡

## 2025-05-15 - [Critical Rendering Path] Flattened Font Waterfall
**Learning:** Using `@import` in CSS files for external fonts creates a sequential loading waterfall (HTML -> CSS -> Font Request). Replacing this with HTML `<link>` tags with `preconnect` and `preload` hints allows the browser to discover and initiate font requests in parallel with CSS parsing. Additionally, implementing non-blocking font delivery (`media="print" onload="this.media='all'"`) prevents font stylesheets from blocking the critical rendering path entirely.

**Action:** Always move font declarations from CSS `@import` to HTML `<link>` tags. Use `preconnect` for font domains and `preload` for critical assets like fonts or JSON data that are known to be needed immediately.

## 2025-05-15 - [Resource Hints] Preloading JSON for Fetch
**Learning:** When preloading same-origin JSON data intended for use with standard JavaScript `fetch()`, the `crossorigin` attribute MUST be included in the `<link rel="preload">` tag. Since `fetch()` defaults to CORS mode, omitting `crossorigin` in the preload tag results in a request mismatch ('no-cors' vs 'cors') and triggers duplicate downloads, defeating the purpose of the preload.

**Action:** Always use `crossorigin` when preloading resources that will be consumed via `fetch()`, even for same-origin requests.
