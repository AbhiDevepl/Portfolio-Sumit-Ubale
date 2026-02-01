/**
 * Navigation Logic
 * Handles mobile menu toggle and desktop interactions
 */

class Navigation {
  constructor() {
    this.toggle = document.querySelector('.nav-toggle');
    this.menu = document.querySelector('.mobile-menu');
    this.links = document.querySelectorAll('.mobile-nav-link');
    this.menuFooter = document.querySelector('.mobile-menu-footer');
    this.isOpen = false;
    
    this.init();
  }

  init() {
    if (!this.toggle || !this.menu) return;

    // Desktop hover animations
    this.initDesktopHover();

    // Mobile toggle
    this.toggle.addEventListener('click', () => this.toggleMenu());

    // Close on link click
    this.links.forEach(link => {
      link.addEventListener('click', () => {
        if (this.isOpen) this.toggleMenu();
      });
    });
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
    this.toggle.classList.toggle('active');
    this.menu.classList.toggle('active');

    if (this.isOpen) {
      this.animateOpen();
    } else {
      this.animateClose();
    }
  }

  animateOpen() {
    const tl = gsap.timeline();

    // Reveal Menu Overlay (Wipe down)
    tl.to(this.menu, {
      clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
      duration: 1,
      ease: "power4.inOut"
    });

    // Stagger in links
    tl.to(this.links, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.1,
      ease: "power3.out"
    }, "-=0.4");

    // Fade in footer
    tl.to(this.menuFooter, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power3.out"
    }, "-=0.6");
  }

  animateClose() {
    const tl = gsap.timeline();

    // Fade out elements
    tl.to([this.links, this.menuFooter], {
      y: 20,
      opacity: 0,
      duration: 0.5,
      ease: "power3.in"
    });

    // Hide Menu Overlay (Wipe up)
    tl.to(this.menu, {
      clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
      duration: 0.8,
      ease: "power4.inOut"
    });
  }

  initDesktopHover() {
    const desktopLinks = document.querySelectorAll('.nav-link');
    
    desktopLinks.forEach(link => {
      // Simple underline scale effect
      // Note: CSS might be enough, but GSAP allows more control if needed.
      // For now, let's keep it CSS-based as defined in styles (or enhance here).
      // Let's add a magnetic effect or something subtle if requested.
      // Based on plan: "Enhance hover states with underline animation"
      
      // We'll stick to CSS for performant hover states unless complex.
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new Navigation();
});
