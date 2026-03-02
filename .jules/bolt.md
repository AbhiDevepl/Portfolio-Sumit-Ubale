# BOLT'S JOURNAL - PERFORMANCE OPTIMIZATIONS

## 2025-05-15 - Critical Rendering Path & FOUC Optimization
**Learning:** Using `@import` in CSS files for fonts creates a sequential dependency (HTML -> CSS -> Font) that delays the first meaningful paint. Additionally, injecting CSS variables via `DOMContentLoaded` in JavaScript causes a Flash of Unstyled Content (FOUC).
**Action:** Move font imports to HTML `<link>` tags with `preconnect` and `preload` hints. Execute theme-related style injection scripts immediately in the `<head>` to ensure variables are available before the browser renders the body.
