/* ========================================
   HERO ANIMATIONS
   ======================================== */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  
  // Hero elements
  const heroTitle = document.querySelector('.hero-title');
  const heroSubtitle = document.querySelector('.hero-subtitle');
  const heroImage = document.querySelector('.hero-image');
  const heroScrollCue = document.querySelector('.hero-scroll-cue');
  
  // Check if hero elements exist
  if (!heroTitle || !heroImage) {
    console.warn('⚠️ Hero elements not found');
    return;
  }
  
  /* ========================================
     Hero Title Reveal Animation
     ======================================== */
  
  // Animate hero title with weighted entrance
  gsap.from(heroTitle, {
    y: 80,
    opacity: 0,
    duration: 1.2,
    ease: "power4.out",
    delay: 0.2
  });
  
  // Animate subtitle if it exists
  if (heroSubtitle) {
    gsap.from(heroSubtitle, {
      y: 60,
      opacity: 0,
      duration: 1,
      ease: "power4.out",
      delay: 0.4
    });
  }
  
  // Animate scroll cue if it exists
  if (heroScrollCue) {
    gsap.from(heroScrollCue, {
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      delay: 1
    });
  }
  
  /* ========================================
     Hero Image Parallax (Scroll-based)
     ======================================== */
  
  gsap.to(heroImage, {
    yPercent: 10,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true
    }
  });
  
  /* ========================================
     Optional: Clip-Path Reveal Animation
     ======================================== */
  
  // Uncomment below for clip-path reveal effect
  /*
  gsap.set(heroImage, {
    clipPath: "inset(100% 0 0 0)"
  });
  
  gsap.to(heroImage, {
    clipPath: "inset(0% 0 0 0)",
    duration: 1.4,
    ease: "power4.out",
    delay: 0.1
  });
  */
  
  /* ========================================
     Navigation Blend Mode Toggle
     ======================================== */
  
  const nav = document.querySelector('.nav');
  
  if (nav) {
    ScrollTrigger.create({
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      onEnter: () => nav.classList.add('nav-blend'),
      onLeave: () => nav.classList.remove('nav-blend'),
      onEnterBack: () => nav.classList.add('nav-blend'),
      onLeaveBack: () => nav.classList.remove('nav-blend')
    });
    
    // Add scrolled class for background
    ScrollTrigger.create({
      trigger: ".hero",
      start: "bottom top",
      onEnter: () => nav.classList.add('nav-scrolled'),
      onLeaveBack: () => nav.classList.remove('nav-scrolled')
    });
  }
  
  console.log('✅ Hero animations initialized');
});
