const SMOOTH_EASING = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

// Defensive check to avoid crash if Lenis library is not loaded
const hasLenis = typeof Lenis !== 'undefined';
const hasScrollTrigger = typeof ScrollTrigger !== 'undefined';
const hasGsap = typeof gsap !== 'undefined';

let lenis = null;

if (hasLenis) {
  lenis = new Lenis({
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

  // Integrate Lenis with GSAP ScrollTrigger
  if (hasScrollTrigger) {
    lenis.on('scroll', ScrollTrigger.update);
  }

  if (hasGsap) {
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }
}

// Anchor link smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const href = this.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);

    if (target) {
      if (lenis) {
        lenis.scrollTo(target, {
          offset: -100,
          duration: 1.5,
          easing: SMOOTH_EASING
        });
      } else {
        // Native fallback smooth scrolling when Lenis is absent
        const offsetPosition = target.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  });
});

// Export for use in other scripts with safe fallbacks
window.lenisScroll = {
  stop: () => { if (lenis) lenis.stop(); },
  start: () => { if (lenis) lenis.start(); },
  instance: lenis
};

window.lenis = lenis;
