# Bolt's Performance Journal - Critical Learnings Only

## 2025-05-02 - Optimize gallery sorting with Schwartzian Transform
**Learning:** In datasets with ~1,200 items, performing regex matches and string splits inside a sort comparator creates significant overhead (O(N log N) regex executions). Implementing the Schwartzian Transform (map-sort-map) reduces this to O(N) regex executions. Additionally, using the `delete` operator on objects after sorting is a performance anti-pattern in V8 as it triggers 'dictionary mode'; object destructuring is a more efficient way to clean up temporary sort keys.
**Action:** Always pre-calculate expensive sort keys using a mapping phase before sorting large datasets. Use object destructuring instead of `delete` to maintain stable object shapes in V8.
