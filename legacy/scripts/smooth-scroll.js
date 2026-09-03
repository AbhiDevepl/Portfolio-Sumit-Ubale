/* ========================================
   SMOOTH SCROLL (Lenis + ScrollTrigger)
   ======================================== */

(() => {
  const SMOOTH_EASING = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t));
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Anchor scrolling still has to work when Lenis is unavailable or the
  // visitor asked for reduced motion, so it falls back to native scrolling.
  const nativeAnchorScroll = (target) => {
    target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
  };

  const bindAnchors = (scrollTo) => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      anchor.addEventListener('click', (e) => {
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        scrollTo(target);
      });
    });
  };

  // Lenis is only loaded on pages that need it, and reduced motion opts out
  // of smoothing entirely. Either way this must not throw.
  if (typeof Lenis === 'undefined' || prefersReduced) {
    bindAnchors(nativeAnchorScroll);
    return;
  }

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

  // Drive Lenis from GSAP's ticker and keep ScrollTrigger in sync with it, so
  // scroll-linked animations read the same position Lenis is rendering.
  if (window.gsap) {
    if (window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      ScrollTrigger.refresh();
    }
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    // No GSAP on this page — run Lenis on its own rAF loop.
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  bindAnchors((target) => {
    lenis.scrollTo(target, { offset: -100, duration: 1.5, easing: SMOOTH_EASING });
  });

  window.lenis = lenis;
  window.lenisScroll = {
    stop: () => lenis.stop(),
    start: () => lenis.start(),
    instance: lenis
  };
})();
