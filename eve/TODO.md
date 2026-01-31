# 📋 TODO - Editorial Photographer Portfolio

**Project**: HTML + CSS + Vanilla JS + GSAP Portfolio Website  
**Stack**: HTML5, CSS3, Vanilla JavaScript (ES6+), GSAP, Lenis  
**Philosophy**: Restraint, Editorial Design, Cinematic Motion

---

## 🎯 Project Setup & Foundation

### Directory Structure

- [x] Create root project directory structure
- [x] Set up `/styles` directory with all CSS files
- [x] Set up `/scripts` directory with all JS modules
- [x] Set up `/data` directory for JSON content
- [x] Set up `/assets/images` directory with subdirectories
  - [x] `/assets/images/hero`
  - [x] `/assets/images/portraits`
  - [x] `/assets/images/events`
- [x] Add `favicon.ico` to root

### Core Files

- [x] Create `index.html` (main entry point)
- [x] Set up Git repository and `.gitignore`
- [x] Create `README.md` with project documentation

---

## 🎨 CSS Architecture (Modular & Editorial)

### Theme & Variables (`styles/theme.css`)

- [x] Define CSS custom properties (`:root`)
  - [x] `--editorial-bg: #E8E4E1`
  - [x] `--editorial-rose: #C68B7A`
  - [x] `--editorial-olive: #4A483F`
  - [x] `--font-serif: "Cormorant Garamond", serif`
  - [x] `--font-sans: "Inter", sans-serif`
  - [x] `--tracking-tight: -0.05em`
- [x] Import Google Fonts (Cormorant Garamond, Inter)

### Base Styles (`styles/base.css`)

- [x] CSS reset / normalize
- [x] Base typography rules
  - [x] Serif for headings (uppercase, tight tracking)
  - [x] Sans-serif for body text
- [x] Global box-sizing and margin/padding reset
- [x] Accessibility foundations (focus states, skip links)

### Layout System (`styles/layout.css`)

- [x] Global layout containers
- [x] Flexbox and Grid utilities
- [x] Responsive breakpoints
- [x] Section spacing rhythm
- [x] Asymmetric whitespace patterns

### Component Styles (`styles/components.css`)

- [x] Navigation styling
  - [x] Fixed positioning
  - [x] `mix-blend-mode: difference` over hero
  - [x] Minimal height, understated logo
  - [x] Outlined pill CTA (no fill)
- [x] Hero section styling
  - [x] Full viewport height
  - [x] Background image positioning
  - [x] Text anchoring (bottom-left/center-left)
  - [x] Typography: uppercase serif, tight leading
- [x] About section styling
  - [x] Asymmetric grid layout
  - [x] Image positioning (never centered)
  - [x] Text blocks (never full-width)
- [x] Portfolio/Gallery grid
  - [x] Masonry or grid layout
  - [x] Hover state transitions
  - [x] Portrait aspect ratios (3:4 or 4:5)
- [x] Project view styling
  - [x] Full-width imagery
  - [x] Vertical storytelling flow
  - [x] No sidebars or distractions
- [x] Events section styling
  - [x] Flexbox with bottom alignment
  - [x] Varied aspect ratios
  - [x] Intentional imbalance
- [x] Contact footer styling
  - [x] Soft background
  - [x] Optional backdrop blur
  - [x] Simple form layout
  - [x] Button hover states

### Animation Styles (`styles/animations.css`)

- [x] Motion-related CSS classes
- [x] Transition definitions
- [x] Transform utilities
- [x] `will-change` optimizations
- [x] Clip-path utilities for reveals

---

## 🚀 JavaScript Architecture (Vanilla ES6+)

### GSAP Setup (`scripts/gsap-init.js`)

- [x] Include GSAP CDN in HTML
  - [x] `gsap.min.js`
  - [x] `ScrollTrigger.min.js`
- [x] Register ScrollTrigger plugin
- [x] Configure global GSAP settings

### Smooth Scroll (`scripts/smooth-scroll.js`)

- [x] Include Lenis CDN in HTML
- [x] Initialize Lenis with settings
  - [x] `smooth: true`
  - [x] `lerp: 0.08`
- [x] Set up `requestAnimationFrame` loop
- [x] Integrate with GSAP ScrollTrigger

### Hero Animations (`scripts/hero.js`)

- [x] Hero title reveal animation
  - [x] Fade in from bottom (`y: 80, opacity: 0`)
  - [x] Duration: 1.2s
  - [x] Easing: `power4.out`
  - [x] Delay: 0.2s
- [x] Hero image parallax on scroll
  - [x] `yPercent: 10`
  - [x] ScrollTrigger with scrub
- [x] Optional: Clip-path reveal animation
  - [x] `clip-path: inset(100% 0 0 0)` → `inset(0% 0 0 0)`
  - [x] Duration: 1.4s
  - [x] Easing: `power4.out`

### Section Animations (`scripts/sections.js`)

- [x] About section scroll reveal
  - [x] Fade + rise on scroll (`y: 40, opacity: 0`)
  - [x] Duration: 0.8s
  - [x] Easing: `power3.out`
  - [x] Trigger: `start: "top 75%"`
- [x] Events section parallax
  - [x] Different speeds for different images
  - [x] `.event-image.slow` moves up (`y: -50`)
  - [x] `.event-image.fast` moves down (`y: 50`)
  - [x] ScrollTrigger with scrub
- [x] General scroll-triggered reveals for other sections

### Gallery Interactions (`scripts/gallery.js`)

- [x] Category-based filtering logic
- [x] Image hover interactions
  - [x] Grayscale to color transition
  - [x] Arrow icon fade-in
  - [x] 200-300ms duration
- [x] Lightbox or project view modal
  - [x] Open/close functionality
  - [x] Keyboard navigation (ESC, arrows)
  - [x] Accessibility (focus trap, ARIA)
- [x] Lazy loading implementation (native or custom)

### Contact Form (`scripts/contact.js`)

- [x] Form validation (Name, Email, Message)
- [x] Submit handler
  - [x] Integration with email service or form handler
  - [x] Success/error feedback
- [x] Input focus states and animations
- [x] Prevent default form submission

---

## 📄 HTML Structure & Content

### Main HTML (`index.html`)

- [x] Semantic HTML5 structure
- [x] `<head>` setup
  - [x] Meta tags (charset, viewport)
  - [x] SEO meta tags (title, description)
  - [x] Open Graph tags (og:title, og:description, og:image)
  - [x] Favicon link
  - [x] CSS file links (in order: theme → base → layout → components → animations)
- [x] Navigation section
  - [x] Logo/brand name
  - [x] Menu links (Home, Portfolio, About, Contact)
  - [x] CTA button
- [x] Hero section
  - [x] Background image container
  - [x] Hero title (photographer name)
  - [x] Optional tagline
  - [x] Scroll cue indicator
- [x] About section
  - [x] Photographer portrait image
  - [x] Bio text (short, human story)
  - [x] Social proof (logos, testimonials, publications)
- [x] Portfolio/Gallery section
  - [x] Category navigation
  - [x] Image grid container
  - [x] Individual image cards with metadata
- [x] Project view template (if separate page)
  - [x] Full-width image containers
  - [x] Vertical scroll layout
- [x] Events section
  - [x] Event image containers
  - [x] Varied aspect ratios
  - [x] Minimal text overlays
- [x] Contact section
  - [x] Contact form (Name, Email, Message fields)
  - [x] Submit button
  - [x] Social links (Instagram, WhatsApp, etc.)
- [x] Footer
  - [x] Copyright notice
  - [x] Additional links
- [x] Script includes (at end of `<body>`)
  - [x] GSAP CDN
  - [x] ScrollTrigger CDN
  - [x] Lenis CDN
  - [x] Custom scripts (in order: gsap-init → smooth-scroll → hero → sections → gallery → contact)

---

## 📊 Data & Content Management

### Portfolio Data (`data/portfolio.json`)

- [x] Create JSON structure for gallery images
  - [x] Image paths
  - [x] Categories (Weddings, Portraits, Commercial, Events)
  - [x] Metadata (title, description, date)
  - [x] Alt text for accessibility
- [x] Create JSON structure for testimonials
  - [x] Client name
  - [x] Quote
  - [x] Optional photo/logo
- [x] Create JSON structure for social proof
  - [x] Publication logos
  - [x] Awards
  - [x] Client logos

### Content Loading

- [x] Fetch and parse JSON data
- [x] Dynamically populate gallery grid
- [x] Dynamically populate testimonials
- [x] Error handling for failed data loads

---

## 🖼️ Image Optimization & Assets

### Image Preparation

- [ ] Convert all images to WebP format
- [ ] Optional: Create AVIF versions for modern browsers
- [ ] Optimize image file sizes (compression)
- [ ] Create multiple sizes for responsive images
- [ ] Define explicit `width` and `height` attributes

### Image Loading Strategy

- [ ] Hero image: immediate load (no lazy loading)
- [ ] Below-fold images: native lazy loading (`loading="lazy"`)
- [ ] Implement `srcset` for responsive images
- [ ] Prevent layout shift with aspect ratio boxes
- [ ] Add meaningful alt text for all images

### Asset Organization

- [ ] Organize images by category in `/assets/images`
- [ ] Create Open Graph image (`og-image.jpg`)
- [ ] Add favicon and app icons

---

## ⚡ Performance Optimization

### Critical Performance

- [ ] Minimize CSS file sizes
- [ ] Inline critical CSS (optional)
- [ ] Defer non-critical JavaScript
- [ ] Optimize font loading (font-display: swap)
- [ ] Minimize layout shifts (CLS)
- [ ] Ensure smooth scroll performance (no jank)

### GSAP Performance

- [ ] Use `will-change` sparingly
- [ ] Only animate `transform` and `opacity`
- [ ] Never animate `width` or `height`
- [ ] Kill ScrollTriggers when sections are removed
- [ ] Use `scrub: true` for scroll-linked animations

### Testing

- [ ] Run Lighthouse audits (Performance, Accessibility, Best Practices, SEO)
- [ ] Test on throttled network (3G simulation)
- [ ] Test on real mobile devices
- [ ] Verify no JavaScript errors in console
- [ ] Test with JavaScript disabled (content still visible)

---

## ♿ Accessibility & SEO

### Accessibility

- [ ] Semantic HTML elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`)
- [ ] ARIA labels where needed
- [ ] Keyboard navigation support
- [ ] Focus indicators for interactive elements
- [ ] Alt text for all images
- [ ] Color contrast compliance (WCAG AA minimum)
- [ ] Skip to main content link
- [ ] Screen reader testing

### SEO

- [ ] Unique, descriptive `<title>` tag
- [ ] Meta description (compelling, accurate)
- [ ] Proper heading hierarchy (single `<h1>`, logical `<h2>`-`<h6>`)
- [ ] Structured data (JSON-LD for Person/Organization)
- [ ] Sitemap.xml (if multi-page)
- [ ] Robots.txt
- [ ] Canonical URLs
- [ ] Open Graph tags for social sharing

---

## 📱 Responsive Design

### Breakpoints

- [ ] Mobile-first CSS approach
- [ ] Define breakpoints (e.g., 640px, 768px, 1024px, 1280px)
- [ ] Test layouts at all breakpoints
- [ ] Adjust typography scales for mobile
- [ ] Adjust spacing for mobile

### Mobile Optimizations

- [ ] Touch-friendly button sizes (min 44x44px)
- [ ] Simplified navigation for mobile
- [ ] Optimized image sizes for mobile
- [ ] Disable parallax on mobile (performance)
- [ ] Test gesture interactions (swipe, pinch)

---

## 🧪 Testing & Quality Assurance

### Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Functional Testing

- [ ] Navigation links work correctly
- [ ] Gallery filtering works
- [ ] Lightbox/modal opens and closes
- [ ] Contact form submits successfully
- [ ] All animations trigger correctly
- [ ] Smooth scroll works across browsers
- [ ] Lazy loading works

### Edge Cases

- [ ] Very slow network
- [ ] JavaScript disabled
- [ ] Ad blockers enabled
- [ ] High contrast mode
- [ ] Zoom levels (100%, 150%, 200%)

---

## 🚀 Deployment & Hosting

### Pre-Deployment

- [ ] Minify CSS files
- [ ] Minify JavaScript files
- [ ] Optimize all images
- [ ] Test production build locally
- [ ] Verify all links are absolute/correct

### Hosting Setup

- [ ] Choose hosting platform (Netlify, GitHub Pages, Vercel, etc.)
- [ ] Configure custom domain (if applicable)
- [ ] Set up SSL certificate (HTTPS)
- [ ] Configure caching headers
- [ ] Set up 404 page

### Post-Deployment

- [ ] Verify site loads correctly on live URL
- [ ] Test all functionality on live site
- [ ] Submit to Google Search Console
- [ ] Set up analytics (optional: Google Analytics, Plausible)
- [ ] Monitor performance metrics

---

## 📚 Documentation

### Code Documentation

- [ ] Add comments to complex CSS
- [ ] Add comments to JavaScript functions
- [ ] Document animation timings and easings
- [ ] Create component usage guide

### Project Documentation

- [ ] Update README.md with:
  - [ ] Project overview
  - [ ] Tech stack
  - [ ] Setup instructions
  - [ ] Development workflow
  - [ ] Deployment instructions
- [ ] Document design decisions
- [ ] Create content update guide for client

---

## 🎯 Motion & Animation Rules (Quality Control)

### Hard Constraints

- [ ] No animation under 300ms (except hero)
- [ ] Only use `power3` and `power4` easing
- [ ] Never animate width or height
- [ ] Kill ScrollTriggers when sections are removed
- [ ] If motion is noticeable, reduce it

### Animation Checklist

- [ ] Hero title reveal: weighted, intentional
- [ ] Hero parallax: subtle, smooth
- [ ] About section reveal: controlled fade + rise
- [ ] Events parallax: intentional imbalance
- [ ] Gallery hover: precise, 200-300ms
- [ ] No bounce, no overshoot
- [ ] Stillness in contact footer (design decision)

---

## 🎨 Design Quality Control

### Typography Audit

- [ ] Serif used only for headings
- [ ] Sans-serif for body and captions
- [ ] Uppercase serif only where hierarchy demands
- [ ] Tight tracking on headings (`-0.05em`)
- [ ] Tight leading on hero text (`0.9`)
- [ ] No mixed font weights without purpose

### Layout Audit

- [ ] Asymmetric whitespace is intentional
- [ ] Images never centered (unless intentional)
- [ ] Text never full-width
- [ ] Empty space is purposeful
- [ ] Portrait aspect ratios consistent (3:4 or 4:5)

### Visual Audit

- [ ] Site feels editorial, not tech-focused
- [ ] Design feels premium and cinematic
- [ ] No decorative elements without function
- [ ] Restraint is evident throughout
- [ ] First screen makes immediate impact

---

## 🔄 Future Enhancements (Out of Scope for V1)

- [ ] CMS integration (Contentful, Sanity, etc.)
- [ ] Backend development for contact form
- [ ] User accounts / authentication
- [ ] Blog system
- [ ] E-commerce integration (print sales)
- [ ] Multi-language support
- [ ] Advanced analytics and tracking

---

## ✅ Final Checklist Before Launch

- [ ] All images optimized and loading correctly
- [ ] All animations smooth and intentional
- [ ] Contact form tested and working
- [ ] SEO meta tags complete
- [ ] Lighthouse score: 90+ on all metrics
- [ ] Mobile experience tested on real devices
- [ ] Cross-browser compatibility verified
- [ ] Accessibility audit passed
- [ ] No console errors
- [ ] Analytics configured (if applicable)
- [ ] Domain and SSL configured
- [ ] Client/stakeholder approval received

---

**Philosophy Reminder**: This is not a "website." It's a **controlled visual narrative**. GSAP gives you cinematography. CSS gives you discipline. Whitespace gives you authority.

**Execution Standard**: Restraint > Features. Taste > Technology. Intention > Animation.
