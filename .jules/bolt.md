## 2025-05-15 - Optimize Critical Rendering Path by Removing CSS @import
**Learning:** Using `@import` in CSS files (especially for fonts) creates a sequential dependency waterfall, blocking the CSS parser and delaying the discovery of font files. Moving these to HTML `<link>` tags allows parallel discovery and download.
**Action:** Always prefer HTML `<link>` tags with `preconnect` and `preload` (or non-blocking media="print" trick) for external assets like fonts and CDNs. Avoid `@import` in global stylesheets.
