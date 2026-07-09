## 2025-07-09 - Pre-calculating attributes for large lists
**Learning:** In applications rendering 1000+ items, performing string manipulations (like category formatting) or array lookups (like sort weights) inside the render loop or sort comparator significantly impacts performance. Pre-calculating these once during data ingestion improves both sort and render speed.
**Action:** Use a "flatten and enhance" pass during data loading to attach all display-ready attributes to the objects.

## 2025-07-09 - DOM Overhead for 1000+ nodes
**Learning:** Appending 1000+ nodes at once, even using a DocumentFragment, can cause significant main-thread blockage and jank.
**Action:** Implement pagination or progressive rendering for large galleries.
