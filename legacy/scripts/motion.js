/* ========================================
   MOTION SYSTEM
   Shared, GPU-friendly motion helpers built on GSAP + ScrollTrigger.

   Design notes:
   - Reveals use ONE IntersectionObserver rather than a ScrollTrigger per
     element. The portfolio grid can hold well over a thousand items, and one
     trigger each would be far more expensive than a single observer. GSAP
     still drives the actual tween.
   - ScrollTrigger is used where it is genuinely the right tool: scrubbed
     parallax tied to scroll position.
   - Everything animates transform/opacity/clip-path only, so nothing in here
     triggers layout.
   ======================================== */

window.Motion = (function () {
  const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const EASE = 'power3.out';

  // Everything we create, grouped by owner so a re-render can clean up after
  // itself instead of stacking duplicate triggers and observers.
  const groups = new Map();

  const hasGsap = () => !!window.gsap;
  const hasScrollTrigger = () => !!(window.gsap && window.ScrollTrigger);
  const isReduced = () => reduceQuery.matches;

  function blank(name) {
    return { triggers: [], observers: [], tweens: [], pending: new Set() };
  }

  function group(name) {
    if (!groups.has(name)) groups.set(name, blank(name));
    return groups.get(name);
  }

  /** Make an element plainly visible, undoing whatever reveal() staged. */
  function show(el) {
    el.style.opacity = '';
    el.style.transform = '';
    el.style.willChange = '';
    el.classList.add('is-revealed');
  }

  /**
   * Drop every trigger/observer/tween registered under an owner name.
   * Anything still waiting to be revealed is made visible rather than left
   * stranded at opacity 0 — content must never be lost to a teardown.
   */
  function kill(name) {
    const g = groups.get(name);
    if (!g) return;
    g.triggers.forEach(t => t.kill());
    g.observers.forEach(o => o.disconnect());
    g.tweens.forEach(t => t.kill());
    g.pending.forEach(show);
    groups.set(name, blank(name));
  }

  function toArray(targets) {
    if (!targets) return [];
    if (typeof targets === 'string') return Array.from(document.querySelectorAll(targets));
    if (targets.nodeType === 1) return [targets];
    return Array.from(targets);
  }

  /**
   * Fade/rise elements in as they enter the viewport.
   * Items entering together are staggered; items scrolled past are left alone.
   */
  function reveal(targets, opts = {}) {
    const items = toArray(targets);
    if (!items.length) return;

    const {
      y = 28,
      scale = 1,
      duration = 0.9,
      stagger = 0.06,
      threshold = 0.12,
      rootMargin = '0px 0px -8% 0px',
      owner = 'global'
    } = opts;

    // No GSAP or reduced motion: show everything, animate nothing.
    if (!hasGsap() || isReduced()) {
      items.forEach(el => {
        el.style.opacity = '';
        el.style.transform = '';
        el.classList.add('is-revealed');
      });
      return;
    }

    gsap.set(items, { opacity: 0, y, scale, force3D: true, willChange: 'transform, opacity' });
    const pending = group(owner).pending;
    items.forEach(el => pending.add(el));

    const observer = new IntersectionObserver((entries, obs) => {
      const entering = entries.filter(e => e.isIntersecting).map(e => e.target);
      if (!entering.length) return;
      entering.forEach(el => obs.unobserve(el));

      const tween = gsap.to(entering, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration,
        ease: EASE,
        stagger: { each: stagger, from: 'start' },
        overwrite: 'auto',
        onComplete() {
          // Drop the compositor hint once the work is done.
          entering.forEach(el => {
            el.style.willChange = 'auto';
            el.classList.add('is-revealed');
            pending.delete(el);
          });
        }
      });
      group(owner).tweens.push(tween);
    }, { threshold, rootMargin });

    items.forEach(el => observer.observe(el));
    group(owner).observers.push(observer);
  }

  /**
   * Scrubbed parallax. `amount` is a percentage of the element's own height,
   * so it stays proportional across breakpoints.
   */
  function parallax(target, opts = {}) {
    const el = toArray(target)[0];
    if (!el || !hasScrollTrigger() || isReduced()) return;

    const { amount = 12, trigger = el.parentElement || el, owner = 'global' } = opts;

    const tween = gsap.fromTo(el,
      { yPercent: -amount / 2 },
      {
        yPercent: amount / 2,
        ease: 'none',
        force3D: true,
        scrollTrigger: {
          trigger,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true
        }
      }
    );

    if (tween.scrollTrigger) group(owner).triggers.push(tween.scrollTrigger);
    group(owner).tweens.push(tween);
    return tween;
  }

  /** ScrollTrigger.refresh() after layout-changing work (images, re-renders). */
  function refresh() {
    if (hasScrollTrigger()) ScrollTrigger.refresh();
  }

  // If someone switches on reduced motion mid-session, stop scrubbing and
  // make sure nothing is left stuck at opacity 0.
  reduceQuery.addEventListener('change', (e) => {
    if (!e.matches) return;
    groups.forEach((_, name) => kill(name));
    document.querySelectorAll('[style*="opacity"]').forEach(el => {
      if (parseFloat(el.style.opacity) === 0) el.style.opacity = '';
    });
  });

  return { reveal, parallax, refresh, kill, get reduced() { return isReduced(); }, EASE };
})();
