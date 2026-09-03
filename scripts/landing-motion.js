/* ========================================
   SEO LANDING PAGE MOTION

   The four landing pages (wedding-photographer-shrigonda,
   pre-wedding-shoot-ahilyanagar, candid-photographer-maharashtra,
   cinematic-wedding-films-maharashtra) are self-contained but share one
   `.lp-*` class vocabulary, so a single script covers all of them.

   All work is delegated to window.Motion, which already handles
   prefers-reduced-motion, GSAP being absent, and observer cleanup. If GSAP
   never loads, Motion.reveal() leaves every element plainly visible — the
   copy on these pages is the whole point, so it must never depend on motion.
   ======================================== */

(() => {
  const Motion = window.Motion;
  if (!Motion) return;

  const has = (sel) => document.querySelector(sel);

  // --- Hero -------------------------------------------------------------
  // Above the fold, so the observer fires immediately: this reads as a
  // staggered entrance rather than a scroll reveal.
  Motion.reveal(
    '.lp-eyebrow, .lp-h1, .lp-hero-sub, .lp-cta-group',
    { y: 24, duration: 1, stagger: 0.12, threshold: 0, owner: 'lp-hero' }
  );

  // A slow drift on the hero backdrop. Small on purpose — the photograph is
  // the subject, not the effect.
  if (has('.lp-hero-bg')) {
    Motion.parallax('.lp-hero-bg', { amount: 10, trigger: '.lp-hero', owner: 'lp-hero' });
  }

  // --- Section headings -------------------------------------------------
  // Label and title rise together as each section comes up.
  document.querySelectorAll('.lp-section, .lp-section-alt, .lp-section-dark').forEach((section) => {
    const heading = section.querySelectorAll('.lp-section-label, .lp-section-title');
    if (heading.length) {
      Motion.reveal(heading, { y: 22, duration: 0.85, stagger: 0.08, owner: 'lp-sections' });
    }
  });

  // --- Card groups ------------------------------------------------------
  // Each group is revealed as its own set so the stagger restarts per row
  // instead of running one long cascade down the page.
  [
    '.lp-gallery-strip img',
    '.lp-testimonial-card',
    '.lp-location-card',
    '.lp-package',
    '.lp-process-step',
    '.lp-stat',
    '.lp-faq-item'
  ].forEach((selector) => {
    const items = document.querySelectorAll(selector);
    if (items.length) {
      Motion.reveal(items, { y: 28, duration: 0.8, stagger: 0.07, owner: 'lp-cards' });
    }
  });

  // --- Closing CTA ------------------------------------------------------
  if (has('.lp-final-cta')) {
    Motion.reveal('.lp-final-cta > *', { y: 26, duration: 0.9, stagger: 0.1, owner: 'lp-cta' });
  }
})();
