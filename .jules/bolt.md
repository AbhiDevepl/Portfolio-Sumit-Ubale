## 2025-02-24 - Flattening Critical Rendering Path (CRP)
**Learning:** In a minimalist portfolio without a build step, loading fonts via CSS `@import` and styles via JS on `DOMContentLoaded` creates significant Flash of Unstyled Content (FOUC) and slows down First Contentful Paint (FCP).
**Action:** Move font loading to HTML `<link>` tags with `preconnect`/`preload`, and ensure style-injecting scripts (like `colors.js`) execute immediately in the `<head>` rather than waiting for DOM events.

## 2025-02-24 - Cross-Origin Preload for JSON
**Learning:** When preloading same-origin JSON data intended for use with standard JavaScript `fetch()`, the `crossorigin` attribute MUST be included in the `<link rel="preload">` tag.
**Action:** Always include `crossorigin` in `<link rel="preload" as="fetch">` for JSON files even if they are on the same domain, to match the CORS mode used by `fetch()`.

## 2025-02-24 - Centralized Component Injection
**Learning:** Fragmented navigation and footer code across multiple pages makes performance maintenance difficult.
**Action:** Centralize global UI component injection (nav, footer) in `Core.DOM.injectGlobalComponents` within `core.js` and call it early in the page lifecycle to ensure a consistent user experience and shared caching.
