# CLAUDE.md

Guidance for Claude Code and other coding agents working in this repository.

**The technical reference is [AGENTS.md](AGENTS.md).** Read it first — it
describes the data model, the script layout per page, the motion system and the
deployment config. This file only adds the things most likely to be got wrong.

## Ground rules

- **Static site, no build step.** Plain HTML/CSS/vanilla JS. Do not add React,
  Next.js, Vue, Three.js, a bundler, or a `package.json`. There is nothing to
  compile — files are served exactly as authored.
- **Do not migrate the CDN or image hosting.** Image URLs live in
  `data/portfolio.json`.
- **Do not add dependencies** for something a few lines of code can do.
- Preserve existing URLs, canonical tags, SEO copy and design unless the task
  is explicitly about changing them.

## Run and verify

```bash
python3 -m http.server 8000        # serve; file:// will not work
node tests/check-portfolio-data.mjs # data <-> filter-chip integrity
node --check scripts/<file>.js      # syntax
```

Run the data check after touching `data/portfolio.json` or the filter chips in
`pages/portfolio.html`.

## The traps

1. **The GSAP global is `window.gsap`, lowercase.** `window.GSAP` is undefined.
2. **Category slug = the key in `portfolio.images`.** A filter chip whose
   `data-category` does not match a key renders an empty grid with no error.
   The test catches this; run it.
3. **Sub-pages have empty `#main-nav` / `#main-footer` placeholders** filled by
   `Core.DOM.injectGlobalComponents()`. A page that does not call it ships with
   no navigation and no footer.
4. **Script order is load-bearing:** GSAP → ScrollTrigger → (Lenis) →
   `core.js` → `gsap-init.js` → `motion.js` → page script. `colors.js` must
   stay a blocking `<head>` script; it sets colour tokens before first paint.
5. **Reveals belong to `window.Motion`.** Do not hand-roll a second animation
   pass over the same elements — two systems writing the same `opacity` was a
   real bug here. Pass an `owner` and call `Motion.kill(owner)` before
   re-rendering.
6. **Never leave content at `opacity: 0`.** If GSAP fails to load or reduced
   motion is on, everything must still be visible. `motion.js` handles both —
   go through it.
7. **Most images are currently offline** (the Sirv account is deactivated; see
   AGENTS.md). Broken images are expected right now and are *not* a bug you
   introduced. Do not "fix" it by deleting portfolio data.

## Conventions

- Text from JSON goes in with `textContent`, never `innerHTML`.
- Keep `console.error` / `console.warn` for real failures; no debug logging.
- Redirects and headers go in `netlify.toml` only — not in `_redirects` or
  `_headers`, which were deliberately removed.
- Match surrounding style; keep diffs small and comment only where the reason
  is not obvious from the code.
