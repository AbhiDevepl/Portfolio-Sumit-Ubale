## 2025-05-14 - [Schwartzian Transform & DOM Performance]
**Learning:** In large photography galleries (1,000+ items), performance is heavily impacted by both DOM manipulation and array sorting. Using `replaceChildren()` is measurably faster than `innerHTML = ''` + `appendChild()`. For sorting, the Schwartzian Transform (map-sort-map) provides a significant speed boost (~10x) by pre-calculating sort weights, especially when using `Map` for weight lookups.
**Action:** Always prefer `replaceChildren` for bulk DOM updates. Use Schwartzian Transform for complex sorting logic in data-heavy components.

## 2025-05-14 - [Reactive State Subscription in Vanilla JS]
**Learning:** Implementing a simple pub/sub reactive state can simplify rendering logic, but requires care to avoid double-rendering. Subscribing *before* initial data load allows the initial state update to trigger the first render, removing the need for a manual `render()` call in the initialization flow.
**Action:** Set up state subscriptions early in the lifecycle and let state updates drive all rendering to maintain a single source of truth and avoid redundant UI updates.
