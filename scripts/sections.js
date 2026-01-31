/* ========================================
   SECTION ANIMATIONS
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  /* ========================================
     About Section Scroll Reveal
     ======================================== */
  
  const aboutBlock = document.querySelector('.about-content');
  const aboutImage = document.querySelector('.about-image');
  
  if (aboutBlock) {
    gsap.from(aboutBlock, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".about",
        start: "top 75%"
      }
    });
  }
  
  if (aboutImage) {
    gsap.from(aboutImage, {
      y: 60,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".about",
        start: "top 75%"
      }
    });
  }
  
  /* ========================================
     Portfolio Section Animations
     ======================================== */
  
  const portfolioTitle = document.querySelector('.portfolio-title');
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  if (portfolioTitle) {
    gsap.from(portfolioTitle, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".portfolio",
        start: "top 80%"
      }
    });
  }
  
  // Stagger animation for gallery items
  if (galleryItems.length > 0) {
    gsap.from(galleryItems, {
      y: 60,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".gallery-grid",
        start: "top 75%"
      }
    });
  }
  
  /* ========================================
     Events Section Parallax
     ======================================== */
  
  const eventImages = document.querySelectorAll('.event-image');
  
  eventImages.forEach((image, index) => {
    // Alternate parallax direction for visual interest
    const yValue = index % 2 === 0 ? -50 : 50;
    
    gsap.to(image, {
      y: yValue,
      ease: "none",
      scrollTrigger: {
        trigger: image,
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });
  });
  
  // Events title reveal
  const eventsTitle = document.querySelector('.events-title');
  
  if (eventsTitle) {
    gsap.from(eventsTitle, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".events",
        start: "top 80%"
      }
    });
  }
  
  /* ========================================
     Contact Section Reveal
     ======================================== */
  
  const contactTitle = document.querySelector('.contact-title');
  const contactForm = document.querySelector('.contact-form');
  
  if (contactTitle) {
    gsap.from(contactTitle, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".contact",
        start: "top 75%"
      }
    });
  }
  
  if (contactForm) {
    gsap.from(contactForm, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      delay: 0.2,
      scrollTrigger: {
        trigger: ".contact",
        start: "top 75%"
      }
    });
  }
  
  /* ========================================
     Generic Scroll Reveal for Elements
     ======================================== */
  
  const scrollRevealElements = document.querySelectorAll('.scroll-reveal');
  
  scrollRevealElements.forEach(element => {
    gsap.from(element, {
      y: 60,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 80%"
      }
    });
  });
  
  /* ========================================
     Fast Scroll Reveals
     ======================================== */
  
  const scrollRevealFast = document.querySelectorAll('.scroll-reveal-fast');
  
  scrollRevealFast.forEach(element => {
    gsap.from(element, {
      y: 40,
      opacity: 0,
      duration: 0.6,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 85%"
      }
    });
  });
  
  console.log('✅ Section animations initialized');
});
