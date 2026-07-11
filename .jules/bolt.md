# ⚡ Bolt's Performance Journal

Critical learnings from performance optimizations in the Sumit Ubale Portfolio project.

## 2025-06-24 - [O(N) Flattening & Pre-calculation Speedup]
**Learning:** For datasets around 1,000 items, replacing an $O(N \log N)$ sort (with $O(M)$ lookups) with an $O(N)$ ordered flattening pass yielded a ~75% reduction in data processing time. Additionally, moving string formatting (`formatCategoryName`) from the render loop to the ingestion phase eliminates thousands of redundant calculations during UI updates.
**Action:** Always prefer ordered data ingestion over global sorting when the desired order is known. Pre-calculate UI-specific strings during ingestion to keep render loops "lean".
