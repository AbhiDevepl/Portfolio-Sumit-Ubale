# Bolt's Journal - Critical Learnings

## 2025-05-15 - [Gallery Data Processing Optimization]
**Learning:** The primary performance bottleneck in client-side sorting for 1,000+ items was O(N log N * M) complexity caused by calling O(M) methods like `Array.indexOf()` inside the comparator. Pre-calculating comparison metadata into a Map/Object during the initial data flattening pass reduces this to O(N log N).
**Action:** Always pre-calculate comparison weights and cache high-frequency string manipulations (e.g., category formatting) in the initial data processing pass to ensure O(1) lookup complexity during sorting operations. Also, avoid ES2020+ features like optional chaining and spread operators to maintain compatibility with legacy CI environments (e.g., Cloudflare Workers).
