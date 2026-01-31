Got it. This needs the **same workflow clarity**, but rewritten for **HTML + CSS + vanilla JS only**—no App Router, no TSX, no Tailwind, no Next.js assumptions.

Below is the **correct development workflow for this exact project**, translated cleanly to the stack you’ve locked in.

---

# 🛠️ DEVELOPMENT WORKFLOW

## Photographer Portfolio (HTML + CSS + JavaScript + GSAP)

This workflow is designed to be:

* Modular
* Scalable
* Debuggable in DevTools
* Agency-grade without framework overhead

No magic. No hidden abstractions.

---

## 1. Project Directory Structure

Clean, flat, and intentional.

```text
/
├─ index.html            // Main entry point
├─ styles/
│  ├─ theme.css          // Colors, fonts, variables
│  ├─ base.css           // Reset + typography rules
│  ├─ layout.css         // Global layout + grids
│  ├─ components.css    // Section-specific styling
│  └─ animations.css    // Motion-related styles only
│
├─ scripts/
│  ├─ gsap-init.js       // GSAP + ScrollTrigger registration
│  ├─ smooth-scroll.js  // Lenis setup
│  ├─ hero.js            // Hero reveal + parallax
│  ├─ sections.js        // About / Events scroll reveals
│  ├─ gallery.js         // Gallery interactions
│  └─ contact.js         // Form handling
│
├─ data/
│  └─ portfolio.json    // Gallery content (read-only)
│
├─ assets/
│  └─ images/
│     ├─ hero.webp
│     ├─ portraits/
│     └─ events/
│
└─ favicon.ico
```

Why this structure works:

* CSS is split by responsibility, not pages
* JS is behavior-based, not component-based
* Easy to reason about in isolation
* No bundler required

---

## 2. Implementation Details (Deep Dive)

### 🎨 Styling (Pure CSS, Editorial Discipline)

This design **relies on typography and spacing**, not UI tricks.

#### Typography Rules

* Headings:

  * Serif font
  * Uppercase
  * Tight tracking (`letter-spacing: -0.05em`)
  * Tight leading (`line-height: 0.85–0.9`)
* Body text:

  * Sans-serif
  * Normal tracking
  * Comfortable line height

Example:

```css
.heading-xl {
  font-family: var(--font-serif);
  letter-spacing: -0.05em;
  line-height: 0.88;
  text-transform: uppercase;
}
```

#### Editorial Grid Rhythm

Portrait images **must feel vertical**:

```css
.portrait {
  aspect-ratio: 3 / 4;
}
```

or

```css
.portrait {
  aspect-ratio: 4 / 5;
}
```

This keeps visual cadence consistent across sections.

---

### 🚀 Animations (GSAP + ScrollTrigger)

GSAP handles **macro motion only**.

#### Hero Reveal (Clip-Path)

On load, the hero image reveals itself with weight:

```css
.hero-image {
  clip-path: inset(100% 0 0 0);
}
```

```js
gsap.to(".hero-image", {
  clipPath: "inset(0% 0 0 0)",
  duration: 1.4,
  ease: "power4.out"
});
```

No bounce. No overshoot.

---

#### Scroll Parallax (Events Section)

Different images move at slightly different speeds:

```js
gsap.to(".event-image.slow", {
  y: -50,
  scrollTrigger: {
    trigger: ".events",
    start: "top bottom",
    scrub: true
  }
});

gsap.to(".event-image.fast", {
  y: 50,
  scrollTrigger: {
    trigger: ".events",
    start: "top bottom",
    scrub: true
  }
});
```

The imbalance is intentional.

---

### 🧈 Smooth Scroll (Lenis)

Lenis is used to make scrolling feel *cinematic*, not floaty.

```html
<script src="https://unpkg.com/@studio-freight/lenis"></script>
```

```js
// scripts/smooth-scroll.js
const lenis = new Lenis({
  smooth: true,
  lerp: 0.08
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);
```

GSAP integrates naturally with this setup.

---

### 🖼️ Image Optimization (No Framework Magic)

Because this is static:

* Use **WebP / AVIF**
* Define `width` and `height` in HTML to prevent layout shift
* Use native lazy loading

```html
<img
  src="portrait.webp"
  width="800"
  height="1000"
  loading="lazy"
  alt="Editorial portrait"
/>
```

Hero image:

* Not lazy-loaded
* Loaded immediately
* Largest visual priority

---

## 3. SEO & Metadata (Static HTML)

Handled directly in `<head>`.

```html
<title>Rani Singh Photography | Editorial & Portrait Studio</title>

<meta
  name="description"
  content="Award-winning photography studio specializing in curated editorial portraits and events."
/>

<meta property="og:title" content="Rani Singh Photography" />
<meta property="og:description" content="Editorial portraits and curated visual storytelling." />
<meta property="og:image" content="/assets/og-image.jpg" />
```

Simple. Predictable. Search-engine friendly.

---

## 4. First Development Step (Correct Order)

Before touching animations or galleries:

1. Define **theme variables**
2. Set up **base typography**
3. Build **static layout** with no JS
4. Verify spacing and hierarchy
5. Add GSAP **only after layout is locked**

Motion comes last. Always.

---

## Final Alignment

What you’re building is not “a site.”
It’s a **controlled visual system**.

HTML defines structure.
CSS defines authority.
JavaScript defines intention.

Frameworks accelerate teams.
Taste defines outcomes.

The next logical step here is to generate:

* A **production-ready `index.html` skeleton**
* Or a **Hero section (HTML + CSS + GSAP) built end-to-end**

Both move this from theory into execution without compromising the vision.
