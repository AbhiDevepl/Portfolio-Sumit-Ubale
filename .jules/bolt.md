# BOLT'S JOURNAL - PERFORMANCE OPTIMIZATIONS

## 2026-07-09 - O(N) Portfolio Data Processing
**Learning:** Replacing an O(N log N) global sort with an O(N) ordered flattening loop significantly reduces processing time for large JSON datasets (1,000+ items), especially when the comparator involves expensive indexOf lookups.
**Action:** Always prefer O(N) ingestion patterns for pre-grouped JSON data instead of flattening and re-sorting if a fixed category order is required.

## 2026-07-09 - CI Syntax Restrictions
**Learning:** The Cloudflare Workers CI for this repository rejects ES2020+ features like optional chaining (?.), nullish coalescing (??), and the spread operator (...), as well as trailing commas in objects and method lists.
**Action:** Use "Clean ES6" (classes, arrow functions) but strictly avoid ES2020+ syntax and trailing commas to ensure build success.

## 2026-07-09 - Programmatic DOM vs innerHTML
**Learning:** Utilizing document.createElement, textContent, and appendChild is consistently faster than innerHTML in high-frequency rendering loops, as it avoids the overhead of the browser's HTML parser.
**Action:** Default to programmatic DOM creation for gallery-style rendering loops.
