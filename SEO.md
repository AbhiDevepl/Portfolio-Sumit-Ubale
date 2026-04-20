# 📄 SEO Strategy & Documentation
**Sumit Ubale Photography - Portfolio Website**

This document outlines the comprehensive Search Engine Optimization (SEO) strategy implemented for the Sumit Ubale Photography portfolio. The site employs an aggressive local SEO strategy focused on Shrigonda, Ahilyanagar, and Maharashtra, utilizing semantic HTML, rich structured data, and high-performance Web Vitals best practices.

## 🎯 Target Keywords
The primary focus is capturing local and regional search traffic for wedding photography and cinematography.

**Primary Keywords:**
- Wedding Photographer Shrigonda
- Best Wedding Photographer Shrigonda
- Candid Wedding Photographer Shrigonda
- Pre Wedding Shoot Shrigonda

**Secondary / Regional Keywords:**
- Wedding Photographer Ahilyanagar
- Candid Wedding Photographer Maharashtra
- Cinematic Wedding Films Pune
- Luxury Wedding Photographer Mumbai
**
---

## 🏷️ Meta Tags & Headers

### Core Meta Tags
Every page is optimized with specific Title, Description, and Author tags.
- **Title Example:** `Sumit Ubale Photography – Wedding Photographer in Shrigonda`
- **Description:** Optimized for both CTR and exact-match local keywords.

### Geographical Meta Data
Local business SEO utilizes specific Meta Tags to pin the location to search engines.
```html
<meta name="geo.region" content="IN-MH">
<meta name="geo.placename" content="Shrigonda, Ahilyanagar">
<meta name="geo.position" content="18.6148;74.6953">
<meta name="ICBM" content="18.6148, 74.6953">
```

---

## 🔗 Social Graph (Open Graph & Twitter Cards)
To ensure the website looks premium when shared on WhatsApp, Facebook, Instagram, and Twitter (X), Open Graph (`og:`) and Twitter (`twitter:`) tags are included.

- **`og:image` & `twitter:image`**: Preloaded with a high-quality WebP format hero image served via the Sirv CDN.
- **`og:type`**: Set to `website`.
- **`twitter:card`**: Set to `summary_large_image` to command maximum screen real-estate over social platforms.

---

## 📊 Structured Data (JSON-LD)
We implemented a robust JSON-LD structured data payload. This helps Google populate "Rich Snippets" and exact local knowledge graph panels.

**Assigned Schemas:**
- `@type`: `["LocalBusiness", "Photographer"]`

**Key Inclusions:**
- **Name, Image, and Contact Details** (WhatsApp URL, Email)
- **Local Address** (PostalCode: 413701, Country: IN, Region: Maharashtra)
- **GeoCoordinates** (Lat/Long for exact Shrigonda mapping)
- **Opening Hours** (Mon-Sun, 09:00 - 21:00)
- **Social Graph Links** (`sameAs` points directly to Instagram)
- **Services Array** explicitly listing `Wedding Photography`, `Pre Wedding Shoots`, `Cinematic Wedding Films`, `Drone Videography`, etc.

---

## ⚡ Technical SEO & Performance
Speed is a confirmed ranking factor (Core Web Vitals). We rely on several strategies to ensure lightning-fast performance:

1. **Sirv CDN Delivery:** All media is served via a CDN equipped with automatic WebP conversion and responsive scaling.
2. **Lazy Loading:** `loading="lazy"` and `decoding="async"` applied to all below-the-fold media.
3. **Preloading:** The Hero webp image and external Google fonts are preloaded to drastically reduce LCP (Largest Contentful Paint).
4. **No UI Blocking:** Used `defer` on all script tags and moved CSS into modular files.
5. **DOM Optimization:** Heavy gallery rendering is offloaded to vanilla JS DOM Fragments (`document.createDocumentFragment()`).

---

## ♿ Accessibility (A11Y) = SEO
A highly accessible site ranks better on Google. Modern features implemented:

- **Semantic HTML5:** Native usage of `<main>`, `<article>`, `<nav>`, and `<section>`.
- **ARIA Labeling:** Added `aria-label`, `aria-hidden`, and `role="region"` for screen-reader bots.
- **Focus States:** High-visibility hover states and `Skip to main content` navigation link.
- **Alt Text:** Comprehensive `alt` tags parsed directly from JSON data arrays for all gallery images.

---

## 📝 On-Page Strategies
- **Single Page Application (SPA) Routing gracefully handled.** URL modifications via `window.history.pushState` on category filtering allow users (and bots) to copy/share direct category URLs.
- **Local SEO Footer Block:** A subtle text block inside `<footer/contact>` containing hyper-local keywords (`Shrigonda, Ahilyanagar, Pune, Mumbai, Nashik`) strictly to optimize localized crawler indexing.
- **Canonicalization:** A clear `<link rel="canonical" href="...">` tag enforces the absolute truth of page content across potential duplicates.
