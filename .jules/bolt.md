## 2025-05-15 - [DOM Weight & Layout Thrashing]
**Learning:** Rendering the entire gallery (~350 items) on the homepage caused significant DOM weight and TTI lag. Additionally, using `window.getComputedStyle` inside filtering loops and lightbox logic triggered repeated layout thrashing, causing visible stutter.
**Action:** Use a preview flag (`isPreview`) to limit initial homepage rendering. Replace computed style checks with a cached state array (`visibleData`) and pre-cached DOM element references to ensure $O(1)$ data access during interactions.

## 2025-05-15 - [FOUC Prevention]
**Learning:** Executing style injection inside `DOMContentLoaded` causes a Flash of Unstyled Content (FOUC) when scripts are located in the `<head>`, as the browser may perform a first paint before the event fires.
**Action:** Execute critical style injection (like color palettes or theme variables) immediately upon script load in the `<head>` to ensure styles are applied before the body is rendered.
