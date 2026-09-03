# 📸 Editorial Photographer Portfolio

A minimalist, high-performance portfolio website for editorial and portrait photography. Built with vanilla HTML, CSS, and JavaScript with GSAP animations for a cinematic, magazine-quality experience.

Portfolio for **Sumit Ubale Photography** – wedding photographer in Shrigonda, Maharashtra. Images are served via CDN (Sirv/Cloudinary).

---

## 🎨 Design Philosophy

This portfolio embodies **restraint, editorial elegance, and cinematic motion**:

- **Restraint** - No unnecessary decoration or features
- **Editorial** - Fashion magazine aesthetic with asymmetric layouts
- **Cinematic** - Weighted, intentional motion using GSAP
- **Typography** - Serif authority (Cormorant Garamond) + Sans clarity (Inter)
- **Asymmetry** - Purposeful imbalance in whitespace and composition

> _"This is not a website. It's a controlled visual narrative."_

---

## 🛠️ Tech Stack

### Core Technologies

- **HTML5** - Semantic, accessible markup
- **CSS3** - Modern layout (Flexbox + Grid), custom properties
- **JavaScript (ES6+)** - Vanilla JS, no frameworks
- **GSAP 3** - Professional-grade animations
- **Lenis** - Smooth scroll implementation

### Key Features

- ✅ Zero framework dependencies
- ✅ Mobile-first responsive design
- ✅ WCAG AA accessibility compliant
- ✅ SEO optimized with meta tags
- ✅ Progressive Web App (PWA) ready
- ✅ Optimized for performance (Lighthouse 90+)

---

## 📁 Project Structure

```
/
├── index.html              # Main entry point
├── favicon.svg             # SVG favicon
├── favicon.png             # Optional: add 512×512 PNG for PWA/manifest
├── site.webmanifest        # PWA manifest (single source at root)
├── robots.txt
├── sitemap.xml
│
├── pages/
│   ├── gallery.html       # Full gallery by category
│   ├── albums.html        # Wedding albums
│   ├── portfolio.html     # Filterable portfolio grid
│   ├── service.html       # Service landing (dynamic content)
│   └── *-maharashtra.html # 4 static SEO landing pages
│
├── styles/
│   ├── theme.css          # Design tokens (colors from colors.js)
│   ├── base.css           # Reset & typography
│   ├── layout.css         # Grid & containers
│   ├── components.css     # Sections, nav, hero, gallery, contact
│   ├── animations.css     # Motion & reduced-motion
│   ├── loader.css         # Page loader
│   ├── lightbox-video.css # Lightbox & video controls
│   ├── service.css        # Service page
│   └── portfolio-gallery.css # Portfolio grid, chips, empty/error states
│
├── scripts/
│   ├── colors.js          # Color system (injected into :root)
│   ├── core.js            # Lightbox, VideoObserver, Media factory, DOM utils
│   ├── loader.js          # Page loader lifecycle
│   ├── portfolio-gallery.js # Portfolio page gallery, chips & modal
│   ├── gallery-loader.js  # Gallery page
│   ├── album-loader.js    # Albums page
│   ├── service-loader.js  # Service page
│   ├── navigation.js      # Mobile menu
│   ├── hero.js            # Hero animations
│   ├── sections.js        # Scroll reveals
│   ├── gsap-init.js       # GSAP config
│   ├── smooth-scroll.js   # Lenis
│   ├── contact.js         # Form validation & FormSubmit
│   └── whatsapp.js        # WhatsApp CTA with context messages
│
├── data/
│   ├── portfolio.json     # Gallery images by category
│   ├── services.json      # Service copy & deliverables
│   └── new_portfolio.json # Newer pre-wedding uploads (Cloudinary)
│
└── Python/                # Local dev tooling, not part of the deploy
    ├── main.py            # Tkinter helper: append entries to new_portfolio.json
    └── b2-proxy.py        # Unused stub
```

Images and video are loaded from CDN (Sirv, Cloudinary). There is no local `assets/images` folder.

---

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (optional, for development)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/portfolio.git
   cd portfolio
   ```

2. **Serve locally** (choose one method)

   **Option A: Python**

   ```bash
   python -m http.server 8000
   ```

   **Option B: Node.js (http-server)**

   ```bash
   npx http-server -p 8000
   ```

   **Option C: VS Code Live Server**
   - Install "Live Server" extension
   - Right-click `index.html` → "Open with Live Server"

3. **Open in browser**
   ```
   http://localhost:8000
   ```

---

## 📝 Content Management

### Where media lives

Images and video are **not stored in this repo**. They are served from two CDNs,
and the JSON files under `data/` decide what appears on the site:

- `data/portfolio.json` — the main library. Media hosted on **Sirv**
  (`exdevx.sirv.com`), sized with `?w=800&q=80`. Holds `portfolio.categories`
  (filter definitions), `portfolio.images` (one array per category) and `about`.
- `data/new_portfolio.json` — newer pre-wedding uploads hosted on
  **Cloudinary**. Merged with the above on the home page.

There is **no sync script**: `portfolio.json` is edited by hand.
`Python/main.py` is a small local Tkinter helper for appending entries to
`new_portfolio.json` — set `CATEGORY_KEY` and `START_ID` at the top of the file
before running it. Nothing under `Python/` is deployed.

Populated categories are `weddings`, `portraits`,
`pre-wedding-photos-and-videos`, `maternity`, `engagement`, `haldi`,
`cinematics` (videos), `events` and `kids`. A filter chip must reference one of
these ids; `commercial` is declared as a category but has no images.

### 📝 Manual Additions (Legacy)

If you still need to add a one-off image manually:
...

3. **Optimize images**
   - Convert to WebP format
   - Recommended sizes: 800-1200px width
   - Use tools like Squoosh or ImageOptim

### Updating Content

- **About section**: Edit text in `index.html` (lines ~80-110)
- **Contact info**: Update social links in `index.html` (lines ~240-245)
- **SEO metadata**: Edit meta tags in `<head>` section

---

## 🎯 Key Sections

### Hero Section

- Full-viewport cinematic entrance
- GSAP-powered title reveal
- Parallax image on scroll
- Blend mode navigation overlay

### Portfolio Gallery

- Category-based filtering
- Lightbox with keyboard navigation
- Lazy loading for performance
- Masonry grid layout

### Contact Form

- Client-side validation
- Animated error states
- Ready for FormSpree/Netlify Forms integration

---

## 🎨 Customization

### Colors

Edit CSS variables in `styles/theme.css`:

```css
:root {
  --editorial-bg: #e8e4e1; /* Background */
  --editorial-rose: #c68b7a; /* Accent */
  --editorial-olive: #4a483f; /* Primary */
}
```

### Typography

Change fonts in `styles/theme.css`:

```css
:root {
  --font-serif: "Cormorant Garamond", serif;
  --font-sans: "Inter", sans-serif;
}
```

### Animations

Adjust timing in `scripts/hero.js` and `scripts/sections.js`:

```javascript
gsap.from(".hero-title", {
  y: 80,
  opacity: 0,
  duration: 1.2, // Adjust duration
  ease: "power4.out",
});
```

---

## 📱 Responsive Design

Mobile-first approach with breakpoints:

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

All animations are optimized for mobile with `prefers-reduced-motion` support.

---

## ♿ Accessibility

- ✅ Semantic HTML5 elements
- ✅ ARIA labels and roles
- ✅ Keyboard navigation support
- ✅ Skip to main content link
- ✅ Focus indicators
- ✅ Alt text for all images
- ✅ Color contrast WCAG AA compliant

---

## ⚡ Performance

### Optimization Checklist

- [x] Lazy loading images
- [x] Minified CSS/JS (for production)
- [x] WebP image format
- [x] Efficient GSAP animations
- [x] No render-blocking resources
- [x] Optimized font loading

### Lighthouse Scores (Target)

- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

---

## 🚀 Deployment

Hosted on **Netlify** at **https://supf.in**. Pushing to `main` deploys.

- Build command: none (static site)
- Publish directory: `.` (repo root)
- Site ID: `.netlify/state.json`

Configuration lives in `netlify.toml` (redirects, security headers including the
CSP, and `Cache-Control`), with `_redirects` for short friendly URLs and
`_headers` duplicating most of the header block.

> **Adding a third-party script, font, image host or API endpoint?** Add its
> origin to the `Content-Security-Policy` in `netlify.toml`. The CSP is an
> allowlist — anything missing works locally and is silently blocked in
> production.

Canonical URLs, `sitemap.xml` and `robots.txt` all use the bare apex domain
`https://supf.in`; keep them consistent when adding pages.

---

## 🔧 Development Workflow

### Making Changes

1. Edit files in your code editor
2. Refresh browser to see changes
3. Test across different devices/browsers

### Before Deployment

- [ ] Optimize all images
- [ ] Test all links and forms
- [ ] Run Lighthouse audit
- [ ] Test on mobile devices
- [ ] Verify SEO meta tags

---

## 📚 Resources

### Design Inspiration

- [Awwwards](https://www.awwwards.com/websites/portfolio/)
- [Behance Photography](https://www.behance.net/galleries/photography)

### Tools Used

- [GSAP Documentation](https://greensock.com/docs/)
- [Lenis Smooth Scroll](https://github.com/studio-freight/lenis)
- [Google Fonts](https://fonts.google.com/)
- [Squoosh (Image Optimization)](https://squoosh.app/)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Sumit Ubale**

- Website: [sumitubale.com](https://sumitubale.com)
- Instagram: [@sumitubale](https://instagram.com/sumitubale)
- Email: hello@sumitubale.com

---

## 🙏 Acknowledgments

- Typography: Cormorant Garamond by Christian Thalmann
- Sans-serif: Inter by Rasmus Andersson
- Animation: GSAP by GreenSock
- Smooth Scroll: Lenis by Studio Freight

---

**Built with restraint. Designed with intention. Animated with purpose.**
#Portfolio-Sumit-Ubale
