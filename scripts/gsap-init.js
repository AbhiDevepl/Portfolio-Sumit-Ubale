/* ========================================
   GSAP INITIALIZATION
   ======================================== */

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Global GSAP configuration
gsap.config({
  nullTargetWarn: false,
  trialWarn: false,
});

// Set default ease for all GSAP animations
gsap.defaults({
  ease: "power3.out",
  duration: 0.8,
});

// ScrollTrigger defaults
ScrollTrigger.defaults({
  toggleActions: "play none none none",
  scroller: window,
});

// Refresh ScrollTrigger on window resize (debounced)
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    ScrollTrigger.refresh();
  }, 250);
});

// Refresh ScrollTrigger after all images are loaded
window.addEventListener("load", () => {
  ScrollTrigger.refresh();
});

console.log("✅ GSAP initialized with ScrollTrigger");
