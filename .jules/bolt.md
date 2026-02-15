## 2026-02-15 - Resource Loading Waterfall Optimization
**Learning:** Removing CSS `@import` for fonts and replacing them with HTML `<link>` tags flattens the loading waterfall. Preloading same-origin JSON data intended for `fetch()` REQUIRES the `crossorigin` attribute to prevent duplicate requests due to mode mismatch ('no-cors' vs 'cors').
**Action:** Always prefer HTML `<link>` over CSS `@import` for external resources. Use `crossorigin` for all preloads that will be consumed via `fetch()` or other CORS-enabled mechanisms.

## 2026-02-15 - Headless Verification Artifacts
**Learning:** Local headless verification environments (Playwright + Python http.server) can exhibit race conditions or 404s (e.g., 'Lenis is not defined') that don't necessarily reflect production browser behavior with CDN scripts and `defer`.
**Action:** Cross-reference console errors with known environment limitations before rolling back optimizations that follow standard browser specifications.
