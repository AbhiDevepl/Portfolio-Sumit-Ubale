## 2025-05-15 - [Gallery Rendering Optimization]
**Learning:** In projects with large datasets (1,100+ items), logic that appears $O(N)$ can easily become $O(N^2)$ if data enrichment or aggregation happens inside a loop. In this codebase, `GalleryLoader` was re-mapping the entire image set for every item rendered. Additionally, layout thrashing via `getComputedStyle` in filtering loops creates significant jank when the DOM is large.

**Action:** Always cache enriched data sets outside of rendering loops. Use "fast-path" visibility checks (like `offsetParent === null`) to avoid triggering reflows via `getComputedStyle` in large loops.

## 2025-05-15 - [Redundant Event Listeners]
**Learning:** Attaching individual event listeners to 1,200+ DOM nodes on the homepage is a memory and CPU bottleneck, especially when a parent grid already implements event delegation.

**Action:** Use a `skipHandler` pattern in media factories to avoid attaching redundant listeners when event delegation is active at a higher level.
