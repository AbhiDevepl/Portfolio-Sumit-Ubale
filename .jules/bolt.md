# Bolt's Journal - Critical Learnings

## 2025-02-27 - Critical Rendering Path & FOUC Prevention
**Learning:** Using `DOMContentLoaded` for injecting CSS variables via JavaScript (e.g., in `colors.js`) causes a Flash of Unstyled Content (FOUC). CSS `@import` for fonts creates a sequential loading waterfall that blocks rendering.
**Action:** Execute color injection scripts immediately in the `<head>` and replace `@import` with prioritized HTML `<link>` tags and resource hints (preconnect/preload) to flatten the loading waterfall.
