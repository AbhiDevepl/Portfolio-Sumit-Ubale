# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **static photography portfolio website** for Sumit Ubale (wedding photographer in Shrigonda, Maharashtra, India). Built with vanilla HTML/CSS/JS, GSAP for cinematic animations, and Lenis for smooth scrolling. Images are served from Sirv CDN, not stored locally.

## Development Commands

No build process required - this is a static site:

```bash
# Serve locally with Python
python -m http.server 8000

# Or with Node.js
npx http-server -p 8000
```

Then open `http://localhost:8000`.

## Content Management

Images are managed via **Sirv CDN sync** (not local files):
1. Upload images to Sirv in folders named `/Wedding`, `/PreWedding`, `/Portraits`, etc.
2. Run sync script to regenerate `data/portfolio.json`:
   ```bash
   python Python/main.py
   ```

## Architecture

### Content Flow
```
Sirv CDN → Python/main.py (sync) → data/portfolio.json → scripts/content-loader.js → Gallery/Lightbox
```

### Key JavaScript Modules
- `core.js` - Lightbox engine, VideoObserver, Media factory, DOM utilities
- `content-loader.js` - Fetches portfolio.json, populates homepage gallery
- `gallery.js` - Homepage filtering and lightbox
- `portfolio-gallery.js` - Gallery page with filter-chip and category filtering
- `whatsapp.js` - Context-aware WhatsApp CTAs with pre-filled messages

### CSS Architecture
- `theme.css` - Design tokens (colors, typography)
- `base.css` - Reset, typography, utilities
- `components.css` - Sections, nav, hero, gallery
- `animations.css` - GSAP animation classes
- `portfolio-gallery.css` - Gallery-specific styles

## Important Patterns

- Images always use Sirv CDN URLs with optimization params (`?w=800&q=80`)
- Videos use IntersectionObserver for lazy loading + auto-pause when out of view
- Gallery filtering uses `history.pushState` for shareable URLs
- All pages must include JSON-LD structured data (`LocalBusiness` + `Photographer`)

## Constraints

- **No frameworks** - Pure vanilla JS only
- **Performance** - Minimize DOM operations, lazy load everything below fold
- **Accessibility** - WCAG AA compliant, keyboard navigation for lightbox
- **SEO** - Every page needs unique title, meta description, Open Graph tags, canonical URL

## Deployment

Push to `main` branch → auto-deploys to Netlify (configured in `netlify.toml`).