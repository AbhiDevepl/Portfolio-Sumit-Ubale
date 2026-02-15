/* ========================================
   SECTION ANIMATIONS
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('section');
  if (sections.length === 0) return;

  const ctx = gsap.context(() => {
    // 1. Generic Reveal Observer (Highly efficient)
    const revealElements = document.querySelectorAll('.stagger-reveal, .scroll-reveal');
    Core.Observer.init(revealElements, (el) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out"
      });
    });

    // 2. Parallax Optimized (gpu-accelerated)
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
  });

  console.log('✅ Section animations initialized (optimized)');
});
