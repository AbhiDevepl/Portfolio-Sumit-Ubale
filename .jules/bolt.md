## 2025-02-26 - Optimized Gallery Filtering and Resource Discovery
**Learning:** Using `window.getComputedStyle` inside a loop (as seen in `scripts/gallery.js`) triggers expensive layout thrashing by forcing the browser to recalculate styles repeatedly. Additionally, CSS `@import` for fonts creates a sequential loading waterfall that delays the first contentful paint.
**Action:** Replace `getComputedStyle` with `item.offsetHeight > 0` for visibility checks and move font imports to HTML `<link>` tags with `preconnect` and `preload` hints for critical assets.
