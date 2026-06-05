# Bolt's Journal - Critical Performance Learnings

## 2026-06-05 - O(1) Sort Weight Lookups
**Learning:** For large datasets (>1,000 items), using `Array.indexOf` inside a sort comparator is a major bottleneck (O(N*M log N)). Pre-calculating weights into a lookup object reduces processing time by ~70-80%.
**Action:** Always pre-calculate sort weights into an object for $O(1)$ lookup if sorting by a fixed list of categories.

## 2026-06-05 - Class Method Syntax Errors
**Learning:** Trailing commas between class methods are illegal in JavaScript and cause SyntaxErrors in many environments (including Node and Cloudflare Workers CI).
**Action:** Use `node -c` to validate syntax before submission and ensure no trailing commas exist between class methods.
