

Below is a **clean, framework-agnostic rewrite** — **HTML + CSS + vanilla JS only**, with **GSAP via CDN**.
Same philosophy. Same restraint. Same cinematic intent.
No React. No Tailwind. No Framer Motion. No build step.

---

# 🎨 DESIGN & MOTION DOCUMENT

## Project: Editorial Photographer Portfolio (HTML + CSS + JS Only)

---

## 1. Design Philosophy (Non-Negotiable Rules)

This site lives or dies on **restraint**.

Asymmetric whitespace is intentional, not accidental.
Typography does the heavy lifting.
Motion should feel *weighted*, not reactive.
Nothing animates without purpose.

Think **fashion magazine**, not **tech landing page**.

If an element feels decorative, remove it.

---

## 2. Global Theme (CSS Variables – Locked In)

No utility frameworks.
All visual authority comes from **type, spacing, and restraint**.

```css
/* styles/theme.css */
:root {
  --editorial-bg: #E8E4E1;
  --editorial-rose: #C68B7A;
  --editorial-olive: #4A483F;

  --font-serif: "Cormorant Garamond", serif;
  --font-sans: "Inter", sans-serif;

  --tracking-tight: -0.05em;
}
```

### Typography Rules

* Serif = authority (headings only)
* Sans = clarity (body + captions)
* Never mix font weights casually
* Uppercase serif only when hierarchy demands it

---

## 3. Page Architecture (Section by Section)

### A. Navigation — *Invisible Luxury*

* `position: fixed; top: 0`
* Minimal height
* Uses `mix-blend-mode: difference` over hero
* Logo: serif, letter-spaced, understated
* CTA: outlined pill, no fill

No entrance animation.
Confidence doesn’t announce itself.

---

### B. Hero Section (GSAP-Controlled)

#### Layout

* Full viewport height
* Background image via `background-image`, never `<img>`
* Text anchored bottom-left or center-left

#### Typography

* Uppercase serif
* Tight leading (`line-height: 0.9`)
* Negative letter spacing

This is where **GSAP earns its keep**.

---

## 4. GSAP Setup (Global, Once)

### Include GSAP

```html
<!-- index.html -->
<script src="https://unpkg.com/gsap@3/dist/gsap.min.js"></script>
<script src="https://unpkg.com/gsap@3/dist/ScrollTrigger.min.js"></script>
```

### Register Plugin

```js
// scripts/gsap-init.js
gsap.registerPlugin(ScrollTrigger);
```

This file is loaded once.
All motion builds on this foundation.

---

## 5. Hero Animation (Pixel-Precise)

### Intent

* Text arrives with gravity
* Image moves slower than scroll (parallax)
* No bounce
* No overshoot

### HTML

```html
<section class="hero">
  <div class="hero-image"></div>

  <h1 class="hero-title">
    RANI<br />SINGH
  </h1>
</section>
```

### CSS

```css
.hero {
  position: relative;
  height: 100vh;
  overflow: hidden;
  background: var(--editorial-bg);
}

.hero-image {
  position: absolute;
  inset: 0;
  background-image: url("hero.jpg");
  background-size: cover;
  background-position: center;
  will-change: transform;
}

.hero-title {
  position: absolute;
  bottom: 6rem;
  left: 4rem;
  font-family: var(--font-serif);
  font-size: clamp(3rem, 8vw, 7rem);
  line-height: 0.9;
  letter-spacing: var(--tracking-tight);
  text-transform: uppercase;
  color: white;
}
```

### JS (GSAP)

```js
// scripts/hero.js
gsap.from(".hero-title", {
  y: 80,
  opacity: 0,
  duration: 1.2,
  ease: "power4.out",
  delay: 0.2
});

gsap.to(".hero-image", {
  yPercent: 10,
  ease: "none",
  scrollTrigger: {
    trigger: ".hero",
    start: "top top",
    end: "bottom top",
    scrub: true
  }
});
```

This alone sets the emotional tone of the entire site.

---

## 6. About Section (Asymmetric Grid)

Rules are architectural, not decorative:

* Image never centered
* Text never full-width
* Empty space is intentional

Motion:

* Subtle fade + rise on scroll
* No parallax
* No delays longer than needed

```js
gsap.from(".about-block", {
  y: 40,
  opacity: 0,
  duration: 0.8,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".about",
    start: "top 75%"
  }
});
```

---

## 7. Portraits / Headshots (Micro Interaction Only)

No libraries.
No layout animation.
Only **opacity and transform**.

Hover behavior:

* Image: grayscale → color
* Arrow icon fades in
* 200–300ms max

CSS does most of the work.
JS is optional.

This section should feel *precise*, not playful.

---

## 8. Events Section (Asymmetry by Design)

* Use flexbox with bottom alignment
* Vary aspect ratios deliberately
* Let imbalance feel composed, not random

Animation rules:

* No animation on page load
* Animate only on scroll entry
* Short, controlled easing

---

## 9. Contact Footer (Stillness)

This is where motion stops.

* Soft background
* Optional backdrop blur
* Button hover only

No GSAP.
Stillness is a design decision.

---

## 10. Motion Rules (Agency Standard)

Hard constraints:

* No animation under 300ms (except hero)
* Only `power3` and `power4` easing
* Never animate width or height
* Kill ScrollTriggers when sections are removed
* If motion is noticeable, it’s already too much

---

## 11. File Structure (HTML-First, Clean)

```txt
/
├─ index.html
├─ styles/
│  ├─ theme.css
│  ├─ layout.css
│  └─ components.css
├─ scripts/
│  ├─ gsap-init.js
│  ├─ hero.js
│  └─ sections.js
└─ assets/
   └─ images/
```

No build tools.
No abstraction debt.
Everything debuggable in DevTools.

---

## Final Thought

This is not a “website.”
It’s a **controlled visual narrative**.

GSAP gives you cinematography.
CSS gives you discipline.
Whitespace gives you authority.

