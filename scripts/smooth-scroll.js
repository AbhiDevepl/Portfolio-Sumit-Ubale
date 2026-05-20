/**
 * Smooth Scroll initialization
 */

(function() {
  const SMOOTH_EASING = function(t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); };

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

    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
    }

    if (typeof gsap !== 'undefined' && gsap.ticker) {
      gsap.ticker.add(function(time) {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }

    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
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

    window.lenisScroll = {
      stop: function() { lenis.stop(); },
      start: function() { lenis.start(); },
      instance: lenis
    };
    window.lenis = lenis;
  }
})();
