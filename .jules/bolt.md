# Bolt's Journal

## 2026-07-20 - Homepage Lightbox O(1) Memory Cache
**Learning:** The Cloudflare Workers CI environment compiles/parses the modified files and can fail if ES2020+ features like optional chaining (`?.`) exist in the edited files, even if pre-existing. Cleaning up optional chaining to use standard ES6 logic solves the CI compatibility failures.
**Action:** Proactively remove any ES2020+ syntax (such as optional chaining) in any modified JavaScript files to guarantee seamless Cloudflare Workers Build integration.
