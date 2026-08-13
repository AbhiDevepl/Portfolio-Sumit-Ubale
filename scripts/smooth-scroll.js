const SMOOTH_EASING = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

let lenis = null;

if (typeof Lenis !== 'undefined') {
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
  if (typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
  }

  if (typeof gsap !== 'undefined') {
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }
}

// Anchor link smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return; // Prevent DOMException on empty/invalid hash links

    e.preventDefault();
    try {
      const target = document.querySelector(href);

      if (target) {
        if (lenis) {
          lenis.scrollTo(target, {
            offset: -100,
            duration: 1.5,
            easing: SMOOTH_EASING
          });
        } else {
          // Native smooth scroll fallback
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } catch (err) {
      console.warn('Smooth scroll failed for target selector:', href, err);
    }
  });
});

// Export for use in other scripts
window.lenisScroll = {
  stop: () => lenis && lenis.stop(),
  start: () => lenis && lenis.start(),
  instance: lenis
};

window.lenis = lenis;
