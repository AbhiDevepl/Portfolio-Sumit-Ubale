
const SMOOTH_EASING = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

const lenis = new Lenis({
  duration: 1.2,
  easing: SMOOTH_EASING,
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false});

// Integrate Lenis with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);


gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// Anchor link smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));

    if (target) {
      lenis.scrollTo(target, {
        offset: -100,
        duration: 1.5,
        easing: SMOOTH_EASING
      });
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
