/* ========================================
   SECTION ANIMATIONS
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('section');
  if (sections.length === 0) return;

  // Performance Optimization: Respect reduced-motion preferences immediately
  // to skip creating heavy GSAP contexts, ScrollTriggers, and IntersectionObservers.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.stagger-reveal, .scroll-reveal').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
    return;
  }

  if (window.gsap) {
    const ctx = gsap.context(() => {
      // 1. Generic Reveal Observer (IntersectionObserver for performance)
      const revealElements = document.querySelectorAll('.stagger-reveal, .scroll-reveal');
      if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              gsap.to(entry.target, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power3.out"
              });
              revealObserver.unobserve(entry.target);
            }
          });
        }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

        revealElements.forEach(el => revealObserver.observe(el));
      }

      // 2. Parallax Optimized (gpu-accelerated)
      if (window.ScrollTrigger) {
        const parallaxImages = document.querySelectorAll('.hero-image, .event-image');
        parallaxImages.forEach(img => {
          gsap.to(img, {
            y: (i, target) => target.classList.contains('hero-image') ? 100 : 50,
            ease: "none",
            scrollTrigger: {
              trigger: img.parentElement,
              start: "top bottom",
              end: "bottom top",
              scrub: true
            }
          });
        });
        // Note: Dynamic gallery items are rendered asynchronously and handled by
        // page-specific loaders (gallery-loader.js, portfolio-gallery.js) to avoid
        // querying empty NodeLists on DOMContentLoaded.
      }
    });
  } else {
    // Basic reveal fallback
    document.querySelectorAll('.stagger-reveal, .scroll-reveal').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  }
});
