/* ========================================
   HERO ANIMATIONS
   Cinematic entrance + scrubbed media parallax.
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  const heroVideo = document.querySelector('.hero-video');
  if (heroVideo && window.Core?.VideoObserver) {
    window.Core.VideoObserver.observe(heroVideo);
  }

  const hero = document.querySelector('.hero');
  if (!hero) return;

  const title = hero.querySelector('.hero-title');
  const subtitle = hero.querySelector('.hero-subtitle');
  const scrollCue = hero.querySelector('.hero-scroll-cue');
  const media = hero.querySelector('.hero-video') || hero.querySelector('.hero-media-wrapper');
  const nav = document.querySelector('.nav');

  const reduced = window.Motion ? window.Motion.reduced
    : window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Nav state flip is independent of motion preference — it is a state change,
  // not an animation.
  if (nav && window.ScrollTrigger) {
    ScrollTrigger.create({
      trigger: hero,
      start: 'bottom 10%',
      onEnter: () => nav.classList.add('nav-scrolled'),
      onLeaveBack: () => nav.classList.remove('nav-scrolled')
    });
  }

  if (!window.gsap || reduced) return;   // markup is visible by default

  const ctx = gsap.context(() => {
    // The media sits inside an overflow:hidden wrapper and is held slightly
    // oversized, so it can settle and later drift without exposing an edge.
    if (media) gsap.set(media, { scale: 1.14, force3D: true });

    const entrance = gsap.timeline({ paused: true, defaults: { ease: 'power4.out' } });

    if (media) {
      entrance.to(media, { scale: 1.06, duration: 2.4, ease: 'power2.out' }, 0);
    }

    if (title) {
      entrance.fromTo(title,
        { opacity: 0, y: 44, clipPath: 'inset(0 0 100% 0)' },
        { opacity: 1, y: 0, clipPath: 'inset(0 0 -2% 0)', duration: 1.25 },
        0.15
      );
    }

    if (subtitle) {
      entrance.fromTo(subtitle,
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 1 },
        '-=0.85'
      );
    }

    if (scrollCue) {
      entrance.fromTo(scrollCue,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.7 },
        '-=0.5'
      );
      // Gentle idle cue, started only once the entrance has landed.
      entrance.call(() => {
        gsap.to(scrollCue, {
          y: 8,
          duration: 1.6,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true
        });
      });
    }

    // Hold the entrance until the preloader is out of the way, otherwise it
    // plays behind the overlay and the visitor never sees it.
    if (document.body.classList.contains('loaded')) {
      entrance.play();
    } else {
      window.addEventListener('pageLoaded', () => entrance.play(), { once: true });
      // Safety net in case the loader never dispatches.
      gsap.delayedCall(5.5, () => { if (!entrance.progress()) entrance.play(); });
    }

    // Scrubbed parallax: the media drifts a little slower than the page.
    if (media && window.ScrollTrigger) {
      gsap.to(media, {
        yPercent: 12,
        ease: 'none',
        force3D: true,
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true
        }
      });
    }
  }, hero);

  window.addEventListener('pagehide', () => ctx.revert(), { once: true });
});
