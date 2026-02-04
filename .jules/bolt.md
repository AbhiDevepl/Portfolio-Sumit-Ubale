## 2025-02-01 - Redundant Animation Loops (Lenis + GSAP)
**Learning:** When using Lenis alongside GSAP, it is common to accidentally create redundant update loops. Both libraries often compete to drive the `requestAnimationFrame` (RAF). In this codebase, Lenis was being updated by both a native RAF loop and a GSAP ticker listener, leading to double-execution of scroll calculations every frame.
**Action:** Always consolidate animation/scroll updates into a single loop (preferably `gsap.ticker` if GSAP is present) to ensure synchronization and reduce CPU overhead. Use `gsap.ticker.add((time) => lenis.raf(time * 1000))` for optimal results.

## 2026-02-04 - CRLF and Diffs
**Learning:** The codebase uses CRLF line endings in some JavaScript files, which causes `replace_with_git_merge_diff` and other search-based tools to fail if the search block does not account for them.
**Action:** Convert files to LF line endings using `sed -i 's/\r//' [file]` before attempting to apply targeted patches to ensure reliable search matching.
