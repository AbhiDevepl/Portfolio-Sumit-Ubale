# 📸 Editorial Photographer Portfolio

A minimalist, high-performance portfolio website for editorial and portrait photography. Built with vanilla HTML, CSS, and JavaScript with GSAP animations for a cinematic, magazine-quality experience.

![Portfolio Preview](assets/images/og-image.jpg)

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
├── favicon.png             # PNG favicon (512x512)
├── site.webmanifest        # PWA manifest
│
├── styles/
│   ├── theme.css          # Design tokens & variables
│   ├── base.css           # Reset & typography
│   ├── layout.css         # Grid systems & containers
│   ├── components.css     # Section-specific styles
│   └── animations.css     # Motion & transitions
│
├── scripts/
│   ├── gsap-init.js       # GSAP configuration
│   ├── smooth-scroll.js   # Lenis setup
│   ├── hero.js            # Hero animations
│   ├── sections.js        # Scroll-triggered reveals
│   ├── gallery.js         # Filtering & lightbox
│   └── contact.js         # Form validation
│
├── data/
│   └── portfolio.json     # Gallery & content data
│
└── assets/
    └── images/
        ├── hero/          # Hero section images
        ├── portraits/     # Portfolio images
        └── events/        # Event photography
```

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

### Adding Portfolio Images

1. **Add images to appropriate folder**

   ```
   /assets/images/portraits/your-image.webp
   ```

2. **Update `data/portfolio.json`**

   ```json
   {
     "id": 7,
     "title": "Your Image Title",
     "category": "portraits",
     "src": "/assets/images/portraits/your-image.webp",
     "alt": "Descriptive alt text",
     "aspectRatio": "3/4"
   }
   ```

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

### Netlify (Recommended)

1. Connect your Git repository
2. Build settings: None (static site)
3. Publish directory: `/` (root)
4. Deploy!

### GitHub Pages

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

Enable GitHub Pages in repository settings.

### Vercel

```bash
vercel --prod
```

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
