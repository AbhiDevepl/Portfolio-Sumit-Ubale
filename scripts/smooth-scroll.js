(function() {
  const SMOOTH_EASING = function(t) {
    return Math.min(1, 1.001 - Math.pow(2, -10 * t));
  };

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
      infinite: false
    });

    // Integrate Lenis with GSAP ScrollTrigger if available
    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
    }

    if (typeof gsap !== 'undefined') {
      gsap.ticker.add(function(time) {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }

    // Anchor link smooth scroll using Lenis
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener('click', function(e) {
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
      stop: function() { lenis.stop(); },
      start: function() { lenis.start(); },
      instance: lenis
    };

    window.lenis = lenis;
  } else {
    // Graceful fallback for environments/pages where Lenis is not loaded
    console.warn('Lenis smooth scrolling library is not loaded. Falling back to native scrolling.');

    // Anchor link smooth scroll fallback using browser-native smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Stub export to prevent undefined reference errors in calling scripts
    window.lenisScroll = {
      stop: function() {},
      start: function() {},
      instance: null
    };
    window.lenis = null;
  }
})();
