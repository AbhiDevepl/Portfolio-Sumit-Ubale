/* ========================================
   HERO ANIMATIONS
   ======================================== */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  const heroVideo = document.querySelector('.hero-video');
  if (heroVideo && window.Core && window.Core.VideoObserver) {
    window.Core.VideoObserver.observe(heroVideo);
  }
  
  // Animate hero content
  const hero = document.querySelector('.hero');
  if (!hero) return;

  // Optimized GSAP Context for memory management
  const ctx = gsap.context(() => {
    // Hero Elements
    const title = hero.querySelector('.hero-title');
    const subtitle = hero.querySelector('.hero-subtitle');
    const scrollCue = hero.querySelector('.hero-scroll-cue');
    const image = hero.querySelector('.hero-image');

    // Reveal Animation
    gsap.timeline({ delay: 0.2 })
      .from(title, { y: 60, opacity: 0, duration: 1.2, ease: "power4.out" })
      .from(subtitle, { y: 30, opacity: 0, duration: 1, ease: "power4.out" }, "-=0.8")
      .from(scrollCue, { opacity: 0, duration: 0.8 }, "-=0.5");

    // Parallax (Promoted to hardware)
    if (image) {
      gsap.to(image, {
        yPercent: 15,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
    }

    // Nav State
    const nav = document.querySelector('.nav');
    if (nav) {
      ScrollTrigger.create({
        trigger: hero,
        start: "bottom 10%",
        onEnter: () => nav.classList.add('nav-scrolled'),
        onLeaveBack: () => nav.classList.remove('nav-scrolled')
      });
    }
  }, hero);

  console.log('✅ Hero animations initialized (Context-ready)');
});
