/**
 * Smooth Scroll Engine Configuration (Lenis)
 * Optimized with defensive typeof checks to prevent script crashes on subpages
 * where Lenis or GSAP are absent, and implements high-performance native scrolling as fallback.
 */

const SMOOTH_EASING = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

if (typeof Lenis !== 'undefined') {
  const lenis = new Lenis({
    duration: 1.2,
    easing: SMOOTH_EASING,
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  });

  // Integrate Lenis with GSAP ScrollTrigger if available
  if (typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
  }

  if (typeof gsap !== 'undefined') {
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  // Anchor link smooth scroll using Lenis
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const href = this.getAttribute('href');
      // Safety check for empty or non-selector hashes
      if (href === '#') return;

      try {
        const target = document.querySelector(href);
        if (target) {
          lenis.scrollTo(target, {
            offset: -100,
            duration: 1.5,
            easing: SMOOTH_EASING
          });
        }
      } catch (err) {
        console.warn('Invalid scroll anchor selector:', href, err);
      }
    });
  });

  // Export for use in other scripts
  window.lenisScroll = {
    stop: () => lenis.stop(),
    start: () => lenis.start(),
    instance: lenis
  };

  window.lenis = lenis;
} else {
  // Graceful high-performance browser-native smooth scrolling fallback for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const href = this.getAttribute('href');
      if (href === '#') return;

      try {
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      } catch (err) {
        console.warn('Invalid scroll anchor selector:', href, err);
      }
    });
  });
}
