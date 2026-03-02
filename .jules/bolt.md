# Bolt's Journal - Critical Learnings

## 2025-05-15 - Optimizing Resource Loading and Rendering

**Learning:** When preloading same-origin JSON data intended for use with `fetch()`, the `crossorigin` attribute MUST be included in the `<link rel="preload">` tag. Since `fetch()` defaults to CORS mode even on the same origin, omitting `crossorigin` in the preload tag results in a request mismatch ('no-cors' vs 'cors') and triggers duplicate downloads.

**Learning:** To prevent Flash of Unstyled Content (FOUC) when using JS-injected CSS variables, the injecting script should be placed in the `<head>` and executed immediately without waiting for `DOMContentLoaded`.

**Learning:** Replacing CSS `@import` statements with HTML `<link>` tags in the `<head>` flattens the resource loading waterfall, allowing the browser to discover and download fonts in parallel with the CSS files.

**Action:** Always use `crossorigin` for preloading JSON data. Ensure theme-critical JS executes as early as possible. Prefer `<link>` over `@import` for fonts.
