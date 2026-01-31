

# 🎨 DESIGN & MOTION DOCUMENT

## Project: Editorial Photographer Portfolio (Frontend Only)

---

## 1. Design Philosophy (Non-Negotiable Rules)

This site lives or dies on **restraint**.

* Asymmetric whitespace is intentional, not accidental
* Typography does the heavy lifting
* Motion should feel *weighted*, not reactive
* Nothing animates without purpose

Think *fashion magazine*, not *tech landing page*.

---

## 2. Global Theme (Tailwind – Locked In)

Your config is solid. Keep it **unchanged**.

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      'editorial-bg': '#E8E4E1',
      'editorial-rose': '#C68B7A',
      'editorial-olive': '#4A483F',
    },
    fontFamily: {
      serif: ['Cormorant Garamond', 'serif'],
      sans: ['Inter', 'sans-serif'],
    },
    letterSpacing: {
      'tighter-plus': '-.05em',
    }
  }
}
```

Rules:

* Serif = authority (headings only)
* Sans = clarity (body + captions)
* Never mix weights casually

---

## 3. Page Architecture (Section-by-Section)

### A. Navigation (Invisible Luxury)

* `position: fixed; top: 0`
* Minimal height
* Uses `mix-blend-mode: difference` over hero
* Logo: serif, letter-spaced, understated
* CTA: outlined pill, no fill

No entrance animation. Confidence doesn’t announce itself.

---

### B. Hero Section (GSAP-Controlled)

**Layout**

* `h-screen`
* Background image via CSS (not `<img>`)
* Text overlay bottom-left or center-left

**Typography**

* Uppercase serif
* `leading-[0.9]`
* `tracking-tighter-plus`

This is where GSAP earns its keep.

---

## 4. GSAP Initialization (CORE)

This is the **global GSAP setup** you add once.

### Install

```bash
npm install gsap
```

### `lib/gsap.ts`

```ts
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
```

---

## 5. Hero GSAP Animation (Pixel-Perfect)

### Intent

* Text arrives with gravity
* Image moves slower than scroll (parallax)
* No bounce, no overshoot

### `Hero.tsx` (Key Parts Only)

```tsx
"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export default function Hero() {
  const container = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(heading.current, {
        y: 80,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
        delay: 0.2,
      });

      gsap.to(image.current, {
        yPercent: 10,
        ease: "none",
        scrollTrigger: {
          trigger: container.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={container} className="relative h-screen overflow-hidden">
      <div
        ref={image}
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero.jpg')" }}
      />

      <h1
        ref={heading}
        className="absolute bottom-24 left-12 text-[clamp(3rem,8vw,7rem)]
                   font-serif tracking-tighter-plus leading-[0.9] text-white"
      >
        RANI<br />SINGH
      </h1>
    </section>
  );
}
```

This alone sets the tone of the entire site.

---

## 6. About Section (Asymmetric Grid)

**Rules**

* Image never centered
* Text never spans full width
* Whitespace is part of the composition

GSAP usage here is minimal:

* Fade + rise on scroll
* No parallax

---

## 7. Portraits / Headshots (Framer Motion Layer)

GSAP handles **macro motion**
Framer Motion handles **micro interaction**

Hover logic:

* Image: grayscale → color
* Arrow icon fades in
* 200–300ms max

Never animate layout here. Only opacity and transform.

---

## 8. Events Section (Asymmetry Engineering)

* Use `flex items-end`
* Different `aspect-[x/y]` values
* Bottom alignment creates intentional imbalance

No animation on load.
Animate only on scroll entry.

---

## 9. Contact Footer (Stillness)

This section should feel calm.

* Background blur
* Minimal motion
* Button hover only

No GSAP here. Silence is a design choice.

---

## 10. Motion Rules (Agency Standard)

Hard constraints:

* No animation under 300ms except hero
* No easing other than `power3` / `power4`
* Never animate width/height
* Kill ScrollTriggers on unmount

If motion is noticeable, it’s already too much.

---

## 11. Dev Structure (AI IDE Friendly)

```txt
app/
 ├─ page.tsx
components/
 ├─ Hero.tsx
 ├─ About.tsx
 ├─ Portraits.tsx
 ├─ Events.tsx
 ├─ Contact.tsx
lib/
 ├─ gsap.ts
```

Your AI IDE can reason about this cleanly.

---

## Final Thought (Important)

This is not a “website.”
It’s a **controlled visual narrative**.

GSAP gives you *cinematography*.
Framer Motion gives you *polish*.
Whitespace gives you *authority*.

If you want, next logical step is:

* **Exact Tailwind + Framer Motion code for the Portraits / Headshots grid**
* Or **Lenis + GSAP smooth scroll integration**

Both push this into serious agency territory.
