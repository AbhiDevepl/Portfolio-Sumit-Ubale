# 📋 TODO - Editorial Photographer Portfolio

**Project**: HTML + CSS + Vanilla JS + GSAP Portfolio Website  
**Stack**: HTML5, CSS3, Vanilla JavaScript (ES6+), GSAP, Lenis  
**Philosophy**: Restraint, Editorial Design, Cinematic Motion

---

## 🎯 Project Setup & Foundation

### Directory Structure

- [ ] Create root project directory structure
- [ ] Set up `/styles` directory with all CSS files
- [ ] Set up `/scripts` directory with all JS modules
- [ ] Set up `/data` directory for JSON content
- [ ] Set up `/assets/images` directory with subdirectories
  - [ ] `/assets/images/hero`
  - [ ] `/assets/images/portraits`
  - [ ] `/assets/images/events`
- [ ] Add `favicon.ico` to root

### Core Files

- [ ] Create `index.html` (main entry point)
- [ ] Set up Git repository and `.gitignore`
- [ ] Create `README.md` with project documentation

---

## 🎨 CSS Architecture (Modular & Editorial)

### Theme & Variables (`styles/theme.css`)

- [ ] Define CSS custom properties (`:root`)
  - [ ] `--editorial-bg: #E8E4E1`
  - [ ] `--editorial-rose: #C68B7A`
  - [ ] `--editorial-olive: #4A483F`
  - [ ] `--font-serif: "Cormorant Garamond", serif`
  - [ ] `--font-sans: "Inter", sans-serif`
  - [ ] `--tracking-tight: -0.05em`
- [ ] Import Google Fonts (Cormorant Garamond, Inter)

### Base Styles (`styles/base.css`)

- [ ] CSS reset / normalize
- [ ] Base typography rules
  - [ ] Serif for headings (uppercase, tight tracking)
  - [ ] Sans-serif for body text
- [ ] Global box-sizing and margin/padding reset
- [ ] Accessibility foundations (focus states, skip links)

### Layout System (`styles/layout.css`)

- [ ] Global layout containers
- [ ] Flexbox and Grid utilities
- [ ] Responsive breakpoints
- [ ] Section spacing rhythm
- [ ] Asymmetric whitespace patterns

### Component Styles (`styles/components.css`)

- [ ] Navigation styling
  - [ ] Fixed positioning
  - [ ] `mix-blend-mode: difference` over hero
  - [ ] Minimal height, understated logo
  - [ ] Outlined pill CTA (no fill)
- [ ] Hero section styling
  - [ ] Full viewport height
  - [ ] Background image positioning
  - [ ] Text anchoring (bottom-left/center-left)
  - [ ] Typography: uppercase serif, tight leading
- [ ] About section styling
  - [ ] Asymmetric grid layout
  - [ ] Image positioning (never centered)
  - [ ] Text blocks (never full-width)
- [ ] Portfolio/Gallery grid
  - [ ] Masonry or grid layout
  - [ ] Hover state transitions
  - [ ] Portrait aspect ratios (3:4 or 4:5)
- [ ] Project view styling
  - [ ] Full-width imagery
  - [ ] Vertical storytelling flow
  - [ ] No sidebars or distractions
- [ ] Events section styling
  - [ ] Flexbox with bottom alignment
  - [ ] Varied aspect ratios
  - [ ] Intentional imbalance
- [ ] Contact footer styling
  - [ ] Soft background
  - [ ] Optional backdrop blur
  - [ ] Simple form layout
  - [ ] Button hover states

### Animation Styles (`styles/animations.css`)

- [ ] Motion-related CSS classes
- [ ] Transition definitions
- [ ] Transform utilities
- [ ] `will-change` optimizations
- [ ] Clip-path utilities for reveals

---

## 🚀 JavaScript Architecture (Vanilla ES6+)

### GSAP Setup (`scripts/gsap-init.js`)

- [ ] Include GSAP CDN in HTML
  - [ ] `gsap.min.js`
  - [ ] `ScrollTrigger.min.js`
- [ ] Register ScrollTrigger plugin
- [ ] Configure global GSAP settings

### Smooth Scroll (`scripts/smooth-scroll.js`)

- [ ] Include Lenis CDN in HTML
- [ ] Initialize Lenis with settings
  - [ ] `smooth: true`
  - [ ] `lerp: 0.08`
- [ ] Set up `requestAnimationFrame` loop
- [ ] Integrate with GSAP ScrollTrigger

### Hero Animations (`scripts/hero.js`)

- [ ] Hero title reveal animation
  - [ ] Fade in from bottom (`y: 80, opacity: 0`)
  - [ ] Duration: 1.2s
  - [ ] Easing: `power4.out`
  - [ ] Delay: 0.2s
- [ ] Hero image parallax on scroll
  - [ ] `yPercent: 10`
  - [ ] ScrollTrigger with scrub
- [ ] Optional: Clip-path reveal animation
  - [ ] `clip-path: inset(100% 0 0 0)` → `inset(0% 0 0 0)`
  - [ ] Duration: 1.4s
  - [ ] Easing: `power4.out`

### Section Animations (`scripts/sections.js`)

- [ ] About section scroll reveal
  - [ ] Fade + rise on scroll (`y: 40, opacity: 0`)
  - [ ] Duration: 0.8s
  - [ ] Easing: `power3.out`
  - [ ] Trigger: `start: "top 75%"`
- [ ] Events section parallax
  - [ ] Different speeds for different images
  - [ ] `.event-image.slow` moves up (`y: -50`)
  - [ ] `.event-image.fast` moves down (`y: 50`)
  - [ ] ScrollTrigger with scrub
- [ ] General scroll-triggered reveals for other sections

### Gallery Interactions (`scripts/gallery.js`)

- [ ] Category-based filtering logic
- [ ] Image hover interactions
  - [ ] Grayscale to color transition
  - [ ] Arrow icon fade-in
  - [ ] 200-300ms duration
- [ ] Lightbox or project view modal
  - [ ] Open/close functionality
  - [ ] Keyboard navigation (ESC, arrows)
  - [ ] Accessibility (focus trap, ARIA)
- [ ] Lazy loading implementation (native or custom)

### Contact Form (`scripts/contact.js`)

- [ ] Form validation (Name, Email, Message)
- [ ] Submit handler
  - [ ] Integration with email service or form handler
  - [ ] Success/error feedback
- [ ] Input focus states and animations
- [ ] Prevent default form submission

---

## 📄 HTML Structure & Content

### Main HTML (`index.html`)

- [ ] Semantic HTML5 structure
- [ ] `<head>` setup
  - [ ] Meta tags (charset, viewport)
  - [ ] SEO meta tags (title, description)
  - [ ] Open Graph tags (og:title, og:description, og:image)
  - [ ] Favicon link
  - [ ] CSS file links (in order: theme → base → layout → components → animations)
- [ ] Navigation section
  - [ ] Logo/brand name
  - [ ] Menu links (Home, Portfolio, About, Contact)
  - [ ] CTA button
- [ ] Hero section
  - [ ] Background image container
  - [ ] Hero title (photographer name)
  - [ ] Optional tagline
  - [ ] Scroll cue indicator
- [ ] About section
  - [ ] Photographer portrait image
  - [ ] Bio text (short, human story)
  - [ ] Social proof (logos, testimonials, publications)
- [ ] Portfolio/Gallery section
  - [ ] Category navigation
  - [ ] Image grid container
  - [ ] Individual image cards with metadata
- [ ] Project view template (if separate page)
  - [ ] Full-width image containers
  - [ ] Vertical scroll layout
- [ ] Events section
  - [ ] Event image containers
  - [ ] Varied aspect ratios
  - [ ] Minimal text overlays
- [ ] Contact section
  - [ ] Contact form (Name, Email, Message fields)
  - [ ] Submit button
  - [ ] Social links (Instagram, WhatsApp, etc.)
- [ ] Footer
  - [ ] Copyright notice
  - [ ] Additional links
- [ ] Script includes (at end of `<body>`)
  - [ ] GSAP CDN
  - [ ] ScrollTrigger CDN
  - [ ] Lenis CDN
  - [ ] Custom scripts (in order: gsap-init → smooth-scroll → hero → sections → gallery → contact)

---

## 📊 Data & Content Management

### Portfolio Data (`data/portfolio.json`)

- [ ] Create JSON structure for gallery images
  - [ ] Image paths
  - [ ] Categories (Weddings, Portraits, Commercial, Events)
  - [ ] Metadata (title, description, date)
  - [ ] Alt text for accessibility
- [ ] Create JSON structure for testimonials
  - [ ] Client name
  - [ ] Quote
  - [ ] Optional photo/logo
- [ ] Create JSON structure for social proof
  - [ ] Publication logos
  - [ ] Awards
  - [ ] Client logos

### Content Loading

- [ ] Fetch and parse JSON data
- [ ] Dynamically populate gallery grid
- [ ] Dynamically populate testimonials
- [ ] Error handling for failed data loads

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
