/* ========================================
   SECTION ANIMATIONS
   Scroll-driven reveals and parallax for the home page.
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  const M = window.Motion;
  if (!M) return;

  // Opt-in reveal hook for any page: add data-reveal to an element.
  const optIn = document.querySelectorAll('[data-reveal]');
  if (optIn.length) M.reveal(optIn, { owner: 'opt-in' });

  // Legacy reveal classes, kept working for pages that still use them.
  const legacy = document.querySelectorAll('.scroll-reveal');
  if (legacy.length) M.reveal(legacy, { y: 40, owner: 'legacy' });

  // --- Section headings: a short, deliberate rise. Not every element on the
  // page, only the ones that introduce a section. ---
  const headings = document.querySelectorAll(
    '.section-title, .portfolio-title, .about-heading, .contact-title'
  );
  if (headings.length) M.reveal(headings, { y: 30, duration: 1, stagger: 0, owner: 'headings' });

  // --- About: image and copy arrive together but not identically. ---
  const aboutImageWrap = document.querySelector('.about-image-wrapper');
  const aboutContent = document.querySelector('.about-content');

  if (aboutImageWrap) {
    M.reveal(aboutImageWrap, { y: 46, duration: 1.2, owner: 'about' });
    // The wrapper clips, so the image can drift inside it on scroll.
    const aboutImage = aboutImageWrap.querySelector('.about-image');
    if (aboutImage) {
      if (window.gsap && !M.reduced) gsap.set(aboutImage, { scale: 1.12, force3D: true });
      M.parallax(aboutImage, { amount: 10, trigger: aboutImageWrap, owner: 'about' });
    }
  }
  if (aboutContent) M.reveal(aboutContent, { y: 30, duration: 1, owner: 'about' });

  // --- Filter chips: a light stagger as the portfolio section arrives. ---
  const chips = document.querySelectorAll('.portfolio-categories .category-btn');
  if (chips.length) M.reveal(chips, { y: 16, duration: 0.6, stagger: 0.04, owner: 'chips' });

  // --- Testimonials: staggered cards. ---
  const cards = document.querySelectorAll('.testimonial-card');
  if (cards.length) M.reveal(cards, { y: 38, duration: 0.95, stagger: 0.1, owner: 'testimonials' });

  // --- Contact block. ---
  const contactBits = document.querySelectorAll('.contact-subtitle, .contact-form, .contact-social');
  if (contactBits.length) M.reveal(contactBits, { y: 26, stagger: 0.08, owner: 'contact' });

  // Media finishing loading changes page height; re-measure scroll positions.
  window.addEventListener('load', () => M.refresh(), { once: true });
});
