## 2025-03-31 - [Hoisting O(N) operations out of rendering loops]
**Learning:** In a vanilla JS architecture handling 1,000+ items, re-executing heavy data aggregation methods (like `getGalleryData()`) inside a `forEach` loop creates a significant O(N^2) bottleneck. Additionally, re-creating lookup objects on every iteration adds unnecessary allocation pressure.
**Action:** Always hoist expensive computations, data aggregation, and static mapping objects out of loops. Pass pre-computed data as arguments to item creation functions.
