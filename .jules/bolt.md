# Bolt's Journal - Critical Performance Learnings

## 2025-05-14 - Redundant Data Fetching and HTML Payload Consolidation
**Learning:** Consolidating redundant inline scripts and styles into externalized, cached files significantly reduces the "Initial Download" time. In this project, removing ~270 lines of duplicate logic from `index.html` saved 291KB of redundant network traffic and reduced the HTML payload by ~80%.
**Action:** Always check for overlapping logic between inline scripts and external JS files. Externalize specific styles to CSS files to leverage browser caching.

## 2025-05-14 - Metadata Merging in Multi-Source Fetching
**Learning:** When fetching from multiple JSON sources (e.g., `portfolio.json` and `new_portfolio.json`), simple object overwriting of a global `data` state can lead to "Metadata Loss." If a secondary file lacks certain keys (like `recentEvents`), it can overwrite the primary data with empty results.
**Action:** Use a selective merge strategy or existence checks (e.g., `if (result.portfolio && result.portfolio.recentEvents) ...`) when caching global metadata from multiple sources.

## 2025-05-14 - Structural Integrity during Large Refactors
**Learning:** During major HTML cleanup (removing hundreds of lines of inline code), it's easy to accidentally delete a closing tag (like `</section>`). This breaks the DOM tree and nests subsequent sections (Testimonials, Footer) inside the modified section, potentially breaking layout and accessibility.
**Action:** Use Playwright to verify DOM nesting (e.g., `page.evaluate("container.contains(sibling)") === false`) after any significant HTML refactoring.
