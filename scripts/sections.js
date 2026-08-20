/* ========================================
   SECTION ANIMATIONS
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('section');
  if (sections.length === 0) return;

  // Optimization: Skip heavy GSAP/ScrollTrigger/Observer setup for prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
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

        // 3. Gallery Stagger
        const galleryGrids = document.querySelectorAll('.gallery-grid, .full-gallery-grid');
        galleryGrids.forEach(grid => {
          gsap.from(grid.querySelectorAll('.gallery-item'), {
            opacity: 0,
            y: 30,
            duration: 0.8,
            stagger: 0.05,
            ease: "power3.out",
            scrollTrigger: {
              trigger: grid,
              start: "top 85%"
            }
          });
        });
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
