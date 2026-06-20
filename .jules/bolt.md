# Bolt's Performance Journal

## 2026-06-20 - [O(1) Weight Lookups in Sorting]
**Learning:** The primary performance bottleneck when sorting 1,000+ items in client-side JavaScript is often the repeated execution of expensive operations like `Array.indexOf()` inside the sort comparator, leading to O(N log N * M) complexity.
**Action:** Always pre-calculate comparison weights and cache high-frequency string manipulations (e.g., category formatting) in the initial data processing pass to ensure O(1) lookup complexity during the sort operation.

## 2026-06-20 - [Cloudflare Workers CI Compatibility]
**Learning:** The Cloudflare Workers CI environment strictly rejects ES2020+ features such as optional chaining (`?.`), nullish coalescing (`??`), and static class fields, despite passing local `node -c` syntax checks. It also fails on any trailing commas in literals or method lists.
**Action:** Use "Clean ES6" syntax but strictly avoid ES2020+ operators, static class fields, and trailing commas. Replace `?.` with manual logical checks (e.g., `(a && a.b)`).
