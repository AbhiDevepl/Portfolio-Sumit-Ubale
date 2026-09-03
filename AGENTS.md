# AGENTS.md

Guidance for AI agents (Claude Code, Codex, etc.) working in this repository.

## Project Overview

A **photography portfolio website** for Sumit Ubale, a wedding photographer in
Shrigonda, Maharashtra, India. It is a **static multi-page site** built with
vanilla HTML/CSS/JS — no framework, no bundler, no build step, no
`package.json`. Files are served exactly as they sit in the repo.

Production site: **https://supf.in**

SEO target keywords: Wedding Photographer Shrigonda, Wedding Photographer
Ahilyanagar, Candid Wedding Photographer Maharashtra, Pre Wedding Shoot
Shrigonda.

## Development

There is nothing to install or compile. Serve the repo root over HTTP:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

Use a real HTTP server, not `file://` — several scripts `fetch()` JSON from
root-absolute paths (`/data/portfolio.json`), which only resolve when the repo
root is the web root.

## Deployment

Hosted on **Netlify**, deployed by pushing to `main`. The Netlify site ID lives
in `.netlify/state.json`. There is no build command; `publish = "."`.

| File | Role |
|------|------|
| `netlify.toml` | Authoritative config: HTTPS/www redirects, security headers (incl. **CSP**), `Cache-Control` rules |
| `_redirects` | Short friendly URLs (`/portfolio` → `/pages/portfolio.html`) and HTTPS/www forcing |
| `_headers` | Cache/security headers; **duplicates** most of `netlify.toml`'s header block. Netlify merges both — edit `netlify.toml` first and keep `_headers` in sync or it will drift |
| `robots.txt` | Allows the site, disallows `/Python/`; points at the sitemap |
| `sitemap.xml` | All 8 pages plus the root, all on `https://supf.in` |

**The CSP in `netlify.toml` is a real deploy hazard.** It is an allowlist, so
any new third-party origin must be added there or the browser silently blocks
it. Origins currently required:

- `script-src` — `https://unpkg.com` (GSAP, ScrollTrigger, Lenis)
- `style-src` / `font-src` — Google Fonts
- `img-src` / `media-src` — `https://*.sirv.com`, `https://res.cloudinary.com`
- `connect-src` — `https://formsubmit.co` (contact form)

Canonical URLs, `sitemap.xml`, `robots.txt` and the redirect rules must all
agree on the bare apex domain `https://supf.in` (no `www`).

## Media & Data

Images and video are **never stored in the repo** — they are served from two
CDNs, and the JSON files under `data/` are the source of truth for what is
displayed.

| File | Contents |
|------|----------|
| `data/portfolio.json` | `portfolio.categories` (11 filter definitions), `portfolio.images` (9 category arrays), and an `about` block. Media on **Sirv** (`exdevx.sirv.com`), with `?w=800&q=80` sizing params |
| `data/new_portfolio.json` | A single `pre-wedding-photos-and-videos` array of newer uploads on **Cloudinary** (`res.cloudinary.com`). Merged with the above on the home page |
| `data/services.json` | Static service definitions and copy for `pages/service.html` |

Populated categories in `portfolio.images`: `weddings`, `portraits`,
`pre-wedding-photos-and-videos`, `maternity`, `engagement`, `haldi`,
`cinematics` (videos), `events`, `kids`. Note that `portfolio.categories`
also declares `commercial`, which has **no** images array — anything iterating
categories must tolerate a category with zero items.

There is **no sync script in this repo.** `data/portfolio.json` is maintained by
hand. `Python/main.py` is a local Tkinter helper for appending entries to
`new_portfolio.json` (edit `CATEGORY_KEY` / `START_ID` at the top before
running); `Python/b2-proxy.py` is an unused stub. Nothing under `Python/` is
part of the deployed site.

## Architecture

### Colour tokens are injected at runtime

`styles/theme.css` defines **only** spacing, typography, radius, shadow and
z-index tokens. Every colour token (`--text-primary`, `--bg-primary`,
`--accent`, `--border-color`, …) is generated and injected into `:root` by
`scripts/colors.js` at load time. That is why `colors.js` is the **first**
script on every single page — remove or defer it and the site renders
unstyled. CSS referencing a colour token has no static fallback.

### Pages and their scripts

| Page | Scripts (in load order) |
|------|-------------------------|
| `index.html` | `colors`, `core`, `gsap-init`, `smooth-scroll`, `hero`, `sections`, `navigation`, `contact`, `loader`, `whatsapp` + an **inline** gallery script |
| `pages/portfolio.html` | `colors`, `core`, `portfolio-gallery`, `navigation`, `smooth-scroll` |
| `pages/gallery.html` | `colors`, `core`, `gallery-loader`, `navigation`, `loader` |
| `pages/albums.html` | `colors`, `core`, `album-loader`, `navigation`, `loader`, `whatsapp` |
| `pages/service.html` | `colors`, `core`, `service-loader`, `navigation`, `loader` |
| 4 SEO landing pages | `colors` only (static content) |

### Script modules

| File | Purpose |
|------|---------|
| `core.js` | Shared engine: Lightbox, VideoObserver (lazy load + auto-pause), VideoHover, `Media.createItem()` factory, `DOM.injectGlobalComponents()` for shared nav/footer |
| `colors.js` | Injects the colour design tokens into `:root` (see above) |
| `portfolio-gallery.js` | Portfolio page gallery: state store, renderer, chip filtering, modal viewer |
| `gallery-loader.js` | Gallery page loader |
| `album-loader.js` | Albums page loader |
| `service-loader.js` | Service page loader, reads `services.json` |
| `hero.js`, `sections.js`, `gsap-init.js` | GSAP animation setup and scroll reveals |
| `navigation.js` | Mobile menu toggle |
| `smooth-scroll.js` | Lenis smooth scrolling |
| `contact.js` | Contact form validation, POSTs to FormSubmit.co |
| `whatsapp.js` | Context-aware pre-filled WhatsApp CTAs |
| `loader.js` | Page loading lifecycle |

### Three independent gallery implementations

This is the main thing to understand before editing gallery code — they do
**not** share a filtering path:

1. **Home page** (`index.html`) — a self-contained inline `<script>`. Renders
   `.portfolio-item` divs into `#portfolio-inline-grid`, merges both portfolio
   JSON files, shuffles, and paginates with a "load more" button. No lightbox.
2. **Portfolio page** — `portfolio-gallery.js`. A `GalleryState` store whose
   subscribers re-render `#gallery-grid`; `.filter-chip` buttons filter by
   `data-category` and sync a `?category=` query param. Renders `.gallery-item`
   articles and opens `Core.Lightbox`.
3. **Gallery / Albums / Service pages** — `*-loader.js` built on
   `Core.Media.createItem()`.

Filter chips must use category ids that exist as keys in
`portfolio.images`. A chip pointing at a missing or empty category renders the
empty state rather than a blank grid.

### CSS

| File | Purpose |
|------|---------|
| `theme.css` | Non-colour design tokens |
| `base.css` | Reset, typography, utilities |
| `layout.css` | Grid, containers, breakpoints |
| `components.css` | Nav, hero, sections, contact, footer, home-page grid |
| `animations.css` | Animation classes, reduced-motion fallbacks |
| `loader.css` | Page loader |
| `lightbox-video.css` | Lightbox and custom video controls |
| `portfolio-gallery.css` | Portfolio page grid, chips, loading/empty/error states |
| `service.css` | Service page |

## Conventions

- **Vanilla JS only.** No frameworks, no bundler, no npm dependency.
- **Pin CDN versions.** Third-party scripts load from unpkg with exact
  versions (`gsap@3.15.0`, `lenis@1.0.29`). Never use a floating major-version
  range — it turns an upstream release into an unannounced production deploy.
- **Add new third-party origins to the CSP** in `netlify.toml`, or they are
  blocked in production while working fine locally.
- **Media URLs come from the JSON files**, never hardcoded and never local.
- **Fetch with root-absolute paths** (`/data/...`) so a page works regardless
  of the directory it is served from.
- **Keep SEO markup intact**: unique title, meta description, Open Graph,
  Twitter Card, JSON-LD (`LocalBusiness` + `Photographer`), canonical URL,
  and alt text on every image.
- **Accessibility**: semantic landmarks, ARIA on interactive elements,
  keyboard support in the lightbox (Escape / arrows / space), visible focus,
  WCAG AA contrast.
- **Performance**: lazy-load below the fold, batch DOM writes with
  `DocumentFragment`, `preload="none"` on video, respect
  `prefers-reduced-motion`.
- `console.error` / `console.warn` in failure paths are intentional; there is
  no debug logging to strip.

## Repository automation

Historically a bot opened a large number of near-duplicate
"optimize gallery" pull requests, and roughly 140 stale `bolt-*` branches
remain on the remote. There is **no automation configuration in this repo** —
no `.github/` directory and no workflow files — so the bot is configured
outside the repository (GitHub App / external service) and cannot be disabled
by a code change here. Do not open further automated optimization PRs. Branch
and PR cleanup has to be done through GitHub itself.
