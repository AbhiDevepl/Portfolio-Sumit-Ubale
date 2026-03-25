## 2025-05-15 - [Algorithmic] $O(N^2)$ Gallery Rendering Bottleneck
**Learning:** In the vanilla JS architecture of this portfolio, helper methods like `getGalleryData()` (which flattens the entire portfolio JSON) were being called inside rendering loops (e.g., `Core.DOM.createFragment`). With ~1,200 items, this created a massive $O(N^2)$ bottleneck (~1.4M operations) that significantly delayed the initial gallery render.
**Action:** Always hoist data aggregation and flattening logic out of rendering loops. Pass pre-calculated data as arguments to item creation functions.

## 2025-05-15 - [DOM] Layout Thrashing in Visibility Checks
**Learning:** `GalleryManager.getVisibleData()` was using `window.getComputedStyle(item)` inside a filter loop for ~1,200 items. This triggers multiple synchronous layout reflows.
**Action:** Use `item.offsetParent !== null` to check for `display: none` and only check inline `style.opacity` if set by animations. This avoids expensive `getComputedStyle` calls.
