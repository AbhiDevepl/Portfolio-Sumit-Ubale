## 2025-05-15 - Optimizing the Critical Rendering Path
**Learning:** CSS `@import` statements for fonts create a render-blocking waterfall, where the browser must fetch the CSS before it can discover the font URL. Additionally, missing `preconnect` and `preload` hints for critical assets and data increases the time-to-interactive.
**Action:** Always prefer flattening the font-loading waterfall by moving font `<link>` tags to the HTML `<head>`. Use `preconnect` for cross-origin CDNs and `preload` for critical dynamic data (like JSON) to initiate early fetches.
