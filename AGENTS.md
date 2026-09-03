# AGENTS.md

Technical reference for this repository. Written against the code as it
actually exists — if something here disagrees with the code, the code wins and
this file is the bug.

## Project overview

A static photography portfolio for Sumit Ubale (Shrigonda / Ahilyanagar,
Maharashtra). Plain HTML, CSS and vanilla JavaScript.

- **No build step, no bundler, no package.json.** Files are served as authored.
- **No framework.** Do not introduce React/Next/Vue/Three.js.
- Animation is GSAP + ScrollTrigger, smooth scrolling is Lenis, both from a
  pinned CDN.
- Deployed to **Netlify**. Production origin is **https://supf.in**.

## Running it locally

There is nothing to install or compile:

```bash
python3 -m http.server 8000
# then open http://127.0.0.1:8000/
```

Use a server, not `file://` — every page fetches JSON with absolute paths
(`/data/portfolio.json`) and uses a JS module, both of which need HTTP.

### Checks

```bash
node tests/check-portfolio-data.mjs   # data <-> filter-chip integrity
node --check scripts/<file>.js        # syntax
```

`tests/check-portfolio-data.mjs` has no dependencies. It asserts that every
filter chip in `pages/portfolio.html` maps to a non-empty category in
`data/portfolio.json`, that every declared category has an images array, and
that every item has a valid absolute `src`, `alt` and `type`. It also prints
the media-host breakdown, which is how a dead CDN becomes visible. Run it after
touching portfolio data or the chips.

## Repository layout

```
index.html              Single-page home (hero, portfolio, about, contact)
pages/
  portfolio.html        Full gallery + category filter chips
  gallery.html          Single-category gallery (?category=<slug>)
  albums.html           Album index
  service.html          Service detail (?s=<slug>)
  wedding-photographer-shrigonda.html      \
  pre-wedding-shoot-ahilyanagar.html        | four self-contained
  candid-photographer-maharashtra.html      | SEO landing pages
  cinematic-wedding-films-maharashtra.html /
scripts/                Vanilla JS, no modules except portfolio-gallery.js
styles/                 Plain CSS, loaded per page
data/
  portfolio.json        All gallery media + categories + about
  services.json         Service pages content
tests/                  Dependency-free node checks
Python/main.py          Local-only Tkinter helper for bulk-adding image URLs.
                        Not part of the site; not run in CI or at deploy.
netlify.toml            Deployment config: redirects AND headers (single source)
sitemap.xml robots.txt site.webmanifest
```

## Data model

`data/portfolio.json` has two top-level keys, `portfolio` and `about`.

```jsonc
{
  "portfolio": {
    "categories": [ { "id": "weddings", "name": "Weddings", "slug": "weddings" } ],
    "images": {
      "weddings":  [ { "id": 1, "title": "...", "type": "image",
                       "src": "https://...", "alt": "...", "aspectRatio": "3/4" } ],
      "cinematics": [ { "type": "video", "src": "https://.../1.mp4" } ]
    }
  },
  "about": { "name": "...", "tagline": "...", "bio": "...", "image": "...", "social": {} }
}
```

Rules that are easy to break:

- **The key of `portfolio.images` IS the category slug.** `portfolio-gallery.js`
  copies it onto each item as `item.category`, and the filter chips in
  `pages/portfolio.html` filter on exactly that string. A chip whose
  `data-category` has no matching key renders an empty grid, silently.
- Every entry in `categories` must have a matching `images` key, or the
  category button on `gallery.html` leads nowhere.
- `type` is `"image"` or `"video"`. Videos are lazy-loaded and never autoplay
  with sound.

Current categories: `weddings`, `portraits`, `pre-wedding-photos-and-videos`,
`maternity`, `engagement`, `haldi`, `cinematics` (video), `events`, `kids`.

## Media / CDN

Two image hosts appear in the data:

| Host | Status | Count |
|---|---|---|
| `res.cloudinary.com/portfolio-sumit-ubale` | **live** | 231 (pre-wedding) |
| `exdevx.sirv.com` | **DEAD — account deactivated, HTTP 403** | 905 |

> **The Sirv account is deactivated.** Every `exdevx.sirv.com` URL returns 403
> with an "Account deactivated" page, so all categories except pre-wedding
> render placeholder tiles. The original image files are **not** in this repo,
> so this cannot be fixed from here — it needs either the Sirv account
> reactivated or the originals re-uploaded (Cloudinary already hosts some) and
> the `src` values rewritten. Do not "fix" this by deleting the data.

Tiles whose media fails to load get a `.media-error` class and show a quiet
"Image unavailable" placeholder rather than an invisible box
(`portfolio-gallery.js`, `core.js`, styled in both gallery stylesheets).

There is no Sirv API integration, no sync script, and no `SIRV_*` credential in
this repo — only plain delivery URLs sitting in the JSON.

## Pages and their scripts

Load order matters: GSAP → ScrollTrigger → (Lenis) → `core.js` →
`gsap-init.js` → `motion.js` → page script.

| Page | Scripts (after colors.js) |
|---|---|
| `index.html` | core, gsap-init, motion, smooth-scroll, hero, sections, navigation, contact, loader, whatsapp |
| `pages/portfolio.html` | core, gsap-init, motion, **portfolio-gallery** (module), navigation, smooth-scroll |
| `pages/gallery.html` | core, gsap-init, motion, **gallery-loader**, sections, navigation, loader |
| `pages/albums.html` | core, gsap-init, motion, **album-loader**, sections, navigation, loader, whatsapp |
| `pages/service.html` | core, gsap-init, motion, **service-loader**, sections, navigation, loader |
| 4 SEO landing pages | gsap-init, motion, **landing-motion** |

`colors.js` runs in `<head>` (before paint) and injects CSS colour custom
properties, so it must stay a blocking script.

### Script responsibilities

- **`core.js`** — shared `Core` namespace: `Core.Lightbox`, `Core.Media`
  (the gallery-item factory used by gallery/albums), `Core.VideoHover`,
  `Core.VideoObserver`, `Core.DOM` (fragment helper +
  `injectGlobalComponents()`, which fills the empty `#main-nav` /
  `#main-footer` placeholders on sub-pages). Every page with those
  placeholders must call it, or it ships with no navigation.
- **`portfolio-gallery.js`** — the portfolio page only. ES module. State →
  renderer → filter controller. Owns its own item factory (not `Core.Media`)
  because it renders a different overlay and card shape.
- **`gallery-loader.js` / `album-loader.js` / `service-loader.js`** — fetch
  JSON and render via `Core.DOM` / `Core.Media`.
- **`motion.js`** — the shared motion system (below).
- **`landing-motion.js`** — applies `motion.js` to the `.lp-*` markup shared by
  all four SEO landing pages. One file covers all four; there is no per-page
  animation code.
- **`smooth-scroll.js`** — Lenis, driven from the GSAP ticker and synced to
  ScrollTrigger. Falls back to native anchor scrolling when Lenis is absent or
  reduced motion is on.

## Motion system

`window.Motion` (in `scripts/motion.js`) is the only thing that should be
creating reveals. Its API:

- `Motion.reveal(targets, {y, scale, duration, stagger, threshold, owner})`
- `Motion.parallax(target, {amount, trigger, owner})`
- `Motion.kill(owner)` / `Motion.refresh()` / `Motion.reduced`

Design decisions worth preserving:

- **Reveals use ONE IntersectionObserver, not a ScrollTrigger per element.**
  The grid can hold 1000+ items; a trigger each is far more expensive. GSAP
  still drives the tween.
- ScrollTrigger is reserved for genuinely scroll-linked work (scrubbed
  parallax).
- Everything animates `transform` / `opacity` only — no layout-triggering
  properties.
- **`owner` is how re-renders stay clean.** Every filter change calls
  `Motion.kill('portfolio-grid')` before rendering, so observers and tweens do
  not stack up. If you add a reveal inside re-rendered markup, give it an owner
  and kill it.
- `Motion.kill()` makes anything still pending visible. Content must never be
  stranded at `opacity: 0`.

### Reduced motion

`motion.js` checks `prefers-reduced-motion` and, when set, shows every element
immediately and creates no tweens, observers or parallax. It also listens for
the setting changing mid-session. CSS has matching
`@media (prefers-reduced-motion: reduce)` blocks. **No content may depend on an
animation to become visible or reachable.**

### Pinned dependencies

```
gsap@3.15.0, ScrollTrigger@3.15.0, @studio-freight/lenis@1.0.29  (unpkg)
```

Pin exact versions — a floating `gsap@3` can ship a breaking build. The global
is **`window.gsap`** (lowercase); `window.GSAP` does not exist.

## Deployment

Netlify, publishing the repo root (`publish = "."`, no build command).

**`netlify.toml` is the single source of truth for redirects and headers.** The
old `_redirects` and `_headers` files were removed so host rules are not
defined in two places — do not reintroduce them.

It defines: https + non-www canonicalisation to `supf.in`, friendly short URLs
(`/portfolio`, `/gallery`, `/shrigonda`, …), security headers including a CSP
that allowlists unpkg / Google Fonts / Cloudinary / Sirv / FormSubmit, and
cache headers (immutable for `/scripts` + `/styles`, no-cache for HTML).

There is **no SPA catch-all rewrite** and there should not be one: this is a
multi-page static site, and `/*  ->  /index.html` would only mask real 404s.

The site is not on Vercel or Cloudflare; there is no `vercel.json` or
`wrangler.jsonc`. Canonical URLs, `og:url`, sitemap and robots all use
`https://supf.in` and must stay consistent.

## Contact form

`scripts/contact.js` POSTs to FormSubmit's AJAX endpoint. The destination email
is visible in the client source, which is inherent to a static site with no
backend — do not try to obfuscate it and call that security.

## Conventions

- Render text from JSON with `textContent`, never `innerHTML`. `innerHTML` is
  fine only for markup literals authored in the file.
- Prefer `Core.DOM.createFragment` for list rendering; append once.
- Images get `loading="lazy"` + `decoding="async"`; videos get `preload="none"`
  and are observed for lazy loading.
- Keep `console.error` / `console.warn` for genuine failures; no debug logging.
- Match the surrounding style: 2-space indent, no semicolon-free style, plain
  classes over frameworks.
