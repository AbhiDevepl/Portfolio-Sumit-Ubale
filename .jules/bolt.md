# Bolt's Journal: Performance-Obsessed Learnings

## 2024-07-18 - [Progressive Batch Gallery Rendering]
**Learning:** Synchronously rendering over 1,010 gallery items at once on the portfolio page created over 5,000 DOM nodes, blocking the main thread for over 1.5 seconds on mobile. Progressive rendering using an `IntersectionObserver` to append elements in batches of 36 reduces initial DOM node creation by 96% and keeps the UI fluid. By decoupling the Lightbox from the DOM elements (passing the full data array to it directly), we preserved full lightbox pagination capabilities across all 1,000+ items without having to keep all elements in the DOM.
**Action:** Always decouple media viewer/lightbox data state from DOM element states so that we can optimize DOM density (via virtual list or progressive rendering) without breaking secondary interactive features like pagination or slideshows.
