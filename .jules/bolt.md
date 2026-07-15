# Bolt's Performance Journal

## 2025-07-15 - Consolidating Homepage Logic & Eliminating Redundant Fetches
**Learning:** Inlined scripts and styles in `index.html` often duplicate logic in externalized modules (like `content-loader.js`), leading to redundant ~300KB JSON network requests and conflicting render loops. Externalizing this logic and deduplicating data fetches significantly reduces the initial HTML payload and TTI.

**Action:** Always audit `index.html` for inline scripts that fetch the same data as deferred/external scripts. Consolidate into a single source of truth (e.g., `ContentLoader`) to ensure O(1) data fetching and consistent UI rendering.
