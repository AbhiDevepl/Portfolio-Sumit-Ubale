# Sumit Ubale Photography

Editorial photography portfolio for Sumit Ubale — wedding, pre-wedding and
candid photography in Shrigonda, Ahilyanagar and across Maharashtra.

**Live:** https://supf.in

A static site: plain HTML, CSS and vanilla JavaScript, with GSAP + ScrollTrigger
for motion and Lenis for smooth scrolling. No framework, no bundler, no build
step.

---

## Quick start

Nothing to install. Serve the folder over HTTP:

```bash
git clone <repo-url>
cd Portfolio-Sumit-Ubale
python3 -m http.server 8000
```

Open http://127.0.0.1:8000/.

Opening the files directly with `file://` will not work — the pages fetch JSON
from absolute paths and one script is an ES module, both of which require a
real server.

### Checks

```bash
node tests/check-portfolio-data.mjs
```

Verifies that every category filter chip maps to real, non-empty data, that
every item has a valid `src`/`alt`/`type`, and reports which media hosts the
portfolio is currently pointing at. No dependencies.

---

## ⚠️ Known issue: most gallery images are offline

The Sirv CDN account (`exdevx.sirv.com`) that hosts most of the portfolio is
**deactivated** — those URLs return HTTP 403 ("Account deactivated").

| Host | Status | Images |
|---|---|---|
| Cloudinary | working | 231 (Pre-Wedding) |
| Sirv | **dead** | 905 (everything else) |

So the **Pre-Wedding** category displays normally; the other categories render
a neutral "Image unavailable" placeholder. The site itself works — the images
are simply not being served.

Fixing it needs one of:

1. reactivating the Sirv account, or
2. re-uploading the originals (Cloudinary already hosts part of the library)
   and updating the `src` values in `data/portfolio.json`.

The original image files are not stored in this repository.

---

## Project structure

```
index.html              Home: hero, portfolio preview, about, contact
pages/
  portfolio.html        Full gallery with category filter chips
  gallery.html          One category at a time (?category=<slug>)
  albums.html           Album index
  service.html          Service detail (?s=<slug>)
  …four SEO landing pages for wedding / pre-wedding / candid / films
scripts/                Vanilla JS (see AGENTS.md for what each file does)
styles/                 Plain CSS, loaded per page
data/
  portfolio.json        Gallery media, categories, about content
  services.json         Service page content
tests/                  Dependency-free node checks
netlify.toml            Redirects + headers (single source of truth)
```

---

## Editing content

All content lives in JSON — no HTML editing required for routine updates.

### Adding photos

Edit `data/portfolio.json` under `portfolio.images.<category>`:

```jsonc
{
  "id": 12,
  "title": "Wedding Session",
  "type": "image",                      // "image" or "video"
  "src": "https://res.cloudinary.com/portfolio-sumit-ubale/image/upload/v.../photo.jpg",
  "alt": "Candid wedding photograph by Sumit Ubale in Shrigonda",
  "aspectRatio": "3/4"
}
```

Then run `node tests/check-portfolio-data.mjs`.

**`alt` text matters** — it is real SEO copy on a photography site, so describe
the photograph and the location rather than writing "image1".

### Adding a category

Three things must line up, or the category renders an empty grid:

1. a key under `portfolio.images` — the key **is** the category slug,
2. an entry in `portfolio.categories` with the same `id`,
3. a `<button class="filter-chip" data-category="<slug>">` in
   `pages/portfolio.html`.

The test enforces all three.

### Services

Edit `data/services.json`; `pages/service.html?s=<slug>` renders it.

---

## How it works

- **Galleries** fetch `data/portfolio.json`, flatten every category into one
  list (tagging each item with its category), then filter in memory. The
  category is reflected in the URL (`?category=…`) so views are shareable.
- **Lightbox** is shared (`Core.Lightbox`) and supports keyboard navigation and
  touch swipe.
- **Images** are lazy-loaded and fade in; videos use `preload="none"` and load
  only when scrolled near.
- **Motion** goes through one small system (`scripts/motion.js`): reveals use a
  single IntersectionObserver driving GSAP tweens, and ScrollTrigger is kept
  for genuinely scroll-linked effects. Every re-render kills its previous
  observers so nothing stacks up.
- **Accessibility:** with `prefers-reduced-motion: reduce`, all animation is
  skipped and content renders immediately. Nothing requires an animation to
  become visible.

Dependencies are pinned:
`gsap@3.15.0`, `ScrollTrigger@3.15.0`, `@studio-freight/lenis@1.0.29`.

---

## Deployment

Hosted on **Netlify**, publishing the repository root with no build command.
Push to `main` deploys.

`netlify.toml` holds all redirects and headers — https/non-www
canonicalisation, friendly short URLs, security headers with a CSP, and cache
policy. It is the only place these are configured.

### Before deploying

- [ ] `node tests/check-portfolio-data.mjs` passes
- [ ] New pages added to `sitemap.xml`
- [ ] Canonical + `og:url` use `https://supf.in`
- [ ] New images have meaningful `alt` text
- [ ] Checked at mobile width and with reduced motion enabled

---

## Contact form

Submissions go to [FormSubmit](https://formsubmit.co) via its AJAX endpoint.
There is no backend. The destination address is visible in the client source —
unavoidable for a static site, and not something to paper over.

---

## Admin panel (Backblaze B2)

`/admin` is a single-admin panel for the images and videos in one Backblaze B2
bucket: list, preview, upload (drag & drop, multiple files, progress) and
delete. It is `noindex, nofollow` and disallowed in `robots.txt`.

### Architecture

```
React admin UI  ->  Netlify Functions  ->  Backblaze B2 API  ->  bucket
```

B2 credentials exist only inside the functions. The browser never receives the
key id, the application key, the bucket id, or an account authorization token.

| Endpoint | Purpose |
| --- | --- |
| `/.netlify/functions/admin-login` | password -> HttpOnly session cookie |
| `/.netlify/functions/admin-logout` | clears the cookie |
| `/.netlify/functions/b2-list` | files + short-lived signed preview URLs |
| `/.netlify/functions/b2-upload` | issues a one-shot B2 upload target |
| `/.netlify/functions/b2-delete` | deletes an object |

Every endpoint except `admin-login`/`admin-logout` requires a valid session and
answers `401` without one.

### Environment variables

Copy `.env.example` to `.env` for local work, and set the same keys in Netlify
under **Site configuration -> Environment variables**:

```env
B2_KEY_ID=
B2_APPLICATION_KEY=
B2_BUCKET_ID=
B2_BUCKET_NAME=
ADMIN_PASSWORD=
```

Never prefix these with `VITE_` — that would bundle them into the client. `.env`
is gitignored; do not commit credentials.

The session cookie is an expiry timestamp signed with HMAC-SHA256, keyed off
`ADMIN_PASSWORD`. Rotating the password signs everyone out, which is the point.

### Bucket setup

Keep the bucket **private**. Previews use B2 download authorizations that
expire after an hour, so nothing is publicly readable.

The browser POSTs files directly to B2 — a Netlify Function request body is
capped near 6 MB, so videos cannot be proxied through one. That requires a CORS
rule on the bucket. Via the B2 CLI:

```bash
b2 bucket update <bucket-name> allPrivate --cors-rules '[{
  "corsRuleName": "adminUpload",
  "allowedOrigins": ["https://supf.in"],
  "allowedOperations": ["b2_upload_file"],
  "allowedHeaders": ["*"],
  "exposeHeaders": ["x-bz-file-id"],
  "maxAgeSeconds": 3600
}]'
```

Add your Netlify preview/localhost origin to `allowedOrigins` while testing.
Without this rule, listing, previewing and deleting still work — only uploading
fails, with a CORS error in the console.

### Local development

```bash
netlify dev        # serves the site AND the functions with .env loaded
```

Plain `npm run dev` does not run the functions, so `/admin` will report a
network error against `/.netlify/functions/*`.

### Accepted files

`.jpg .jpeg .png .webp .gif .mp4 .webm .mov`, up to 500 MB. The server decides
the object key and content type from its own extension allowlist — the MIME
type the browser reports is ignored. Uploads land under `images/` or `videos/`
with a sanitised filename plus a short random suffix.

---

## Author

**Sumit Ubale** — Photographer, Shrigonda / Ahilyanagar, Maharashtra
[Instagram](https://www.instagram.com/sumit_ubale_photography/)

For architecture details and conventions, see [AGENTS.md](AGENTS.md).
