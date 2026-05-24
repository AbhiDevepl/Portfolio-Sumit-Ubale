## 2025-05-24 - Performance vs Readability Balance
**Learning:** Programmatic DOM creation for complex SVG icons significantly hurts code readability and maintainability without providing measurable performance benefits over `innerHTML` for small, static snippets. High-impact optimizations should focus on the DOM tree structure (`replaceChildren`) and data processing algorithms (Schwartzian Transform).
**Action:** Use `innerHTML` for complex static SVGs and template strings for basic string concatenation unless working in an extremely hot loop where every microsecond is critical and verified by profiling.

## 2025-05-24 - Cloudflare Workers CI ES compatibility
**Learning:** Cloudflare Workers Builds (Pages) environment for this project lacks support for ES2020+ features like optional chaining (`?.`), nullish coalescing (`??`), and the spread operator (`...`). Using these features causes build failures.
**Action:** Always use ES6-compatible alternatives: `&&` for optional chaining, `||` or ternary for nullish coalescing, and `Object.assign` for object spreading. Verify with `node -c` and grep for restricted patterns before submission.
