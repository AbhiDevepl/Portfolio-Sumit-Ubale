# Performance Journal - Bolt⚡

## 2026-06-21 - [Sorting and Rendering Optimizations in Portfolio Gallery]
**Learning:** Client-side sorting of 1,000+ items with O(M) methods (like `indexOf`) inside the comparator creates an O(N log N * M) bottleneck. DOM rendering using `innerHTML` template literals is significantly slower than `createElement` + `textContent` for high-frequency rendering of large lists.
**Action:** Always pre-calculate sorting weights and metadata into a hash map before sorting. Favor direct DOM manipulation (`textContent`) over HTML string parsing in rendering loops.

## 2026-06-21 - [Environment Compatibility: Cloudflare Workers CI]
**Learning:** The project's CI environment rejects ES2020+ features (optional chaining `?.`, nullish coalescing `??`) and is sensitive to trailing commas in literals and class methods. It also requires explicit operator precedence for null checks.
**Action:** Use "Clean ES6" (ES2015-ES2017) syntax. Replace `?.` and `??` with traditional logical operators and ternary checks. Use `Object.assign` for cloning if spread syntax is uncertain.

## 2026-06-21 - [Gallery State Synchronization]
**Learning:** Removing 'risky' event subscriptions to avoid lifecycle issues can lead to UI desynchronization if state updates don't explicitly trigger re-renders.
**Action:** Explicitly call `renderer.render()` from state update methods (like `setFilteredList`) when the observer pattern is decoupled or restricted.
