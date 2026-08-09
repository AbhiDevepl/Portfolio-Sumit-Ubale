/**
 * SMOOTH SCROLL & LENIS INTEGRATION
 * Handles smooth scrolling engine, anchor link navigation,
 * and GSAP ticker sync.
 *
 * Optimized to be defensive and resilient:
 * Bypasses initialization and falls back gracefully to browser-native smooth scrolling
 * on pages (such as pages/portfolio.html) or environments where Lenis/GSAP are absent,
 * preventing fatal uncaught reference errors.
 */

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
    infinite: false
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
    e.preventDefault();
    const href = this.getAttribute('href');
    const target = document.querySelector(href);

    if (target) {
      if (lenis) {
        lenis.scrollTo(target, {
          offset: -100,
          duration: 1.5,
          easing: SMOOTH_EASING
        });
      } else {
        // Fallback: browser-native smooth scroll with header offset
        const rect = target.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const offsetTop = rect.top + scrollTop - 100;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    }
  });
});

// Export for use in other scripts
window.lenisScroll = {
  stop: () => lenis ? lenis.stop() : undefined,
  start: () => lenis ? lenis.start() : undefined,
  instance: lenis
};

window.lenis = lenis;
