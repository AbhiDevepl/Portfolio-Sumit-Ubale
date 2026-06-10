## 2024-05-24 - [Optimizing sorting and rendering for large datasets]
**Learning:** In client-side galleries with >1,000 items, the primary performance bottleneck is often $O(N \log N \cdot K)$ complexity caused by calling $O(K)$ methods like `Array.indexOf()` or performing string manipulations inside the sort comparator or rendering loop. Pre-calculating comparison metadata (weights) and display strings into hash maps or item properties reduces the complexity to $O(N \log N)$ and $O(N)$ respectively.
**Action:** Always pre-calculate sorting weights and formatted labels before entering high-frequency loops (sort, render). Use `textContent` instead of `innerHTML` for simple text updates to bypass the HTML parser.

## 2024-05-24 - [Environment Compatibility]
**Learning:** Cloudflare Workers CI environment (and some static host environments) may have older ES engine constraints. Specifically, `Array.prototype.flat()` and nullish coalescing `??` can cause build failures.
**Action:** Use `.reduce((acc, val) => acc.concat(val), [])` for flattening and ternary operators for defaults unless ES2020+ support is guaranteed.
