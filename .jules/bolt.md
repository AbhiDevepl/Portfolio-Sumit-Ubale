# Bolt's Journal - Critical Learnings

## 2026-07-02 - Consolidating Duplicate Fetches
**Learning:** Found that the homepage was fetching 'portfolio.json' twice (once in content-loader.js and once in index.html) because of a race to populate the same gallery grid. Consolidating logic into a single class reduces network overhead by ~300KB and prevents layout shifts from competing render loops.
**Action:** Always check if multiple scripts are targeting the same DOM element or data source during initialization.

## 2026-07-02 - Repository Hygiene
**Learning:** Verification artifacts like standalone Python scripts and screenshots are useful during development but should NEVER be committed to the repository. They clutter the codebase and are flagged in code reviews.
**Action:** Use temporary directories for verification scripts or ensure they are deleted before submission.
