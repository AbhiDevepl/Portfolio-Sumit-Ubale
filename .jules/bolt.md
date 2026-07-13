# BOLT JOURNAL - Sumit Ubale Photography

## 2025-07-13 - O(N) Flattening and Pre-calculation Optimization
**Learning:** For datasets exceeding 1,000 items, O(N log N) sorting with redundant string formatting in the comparator becomes a noticeable bottleneck during initial data ingestion. Additionally, thousands of redundant `formatCategoryName` calls during rendering can be eliminated by pre-calculating and attaching metadata to items during the initial flattening pass.

**Action:** Replace global `sort()` with O(N) flattening using a prescribed category order array. Pre-calculate `formattedCategory` during ingestion and update the renderer to use `textContent` and cached attributes.

## 2025-07-13 - CI Compatibility for Cloudflare Workers
**Learning:** The Cloudflare Workers CI environment (and the restricted Node environment used for syntax checks) fails on ES2020+ features like static class fields, optional chaining, and trailing commas in class methods.

**Action:** Avoid `static` fields in classes; use instance properties or constructor-assigned constants. Ensure no trailing commas exist after class methods. Use `Object.assign` instead of the spread operator for object cloning to ensure maximum compatibility.
