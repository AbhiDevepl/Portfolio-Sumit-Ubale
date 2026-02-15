

class Navigation {
  constructor() {
    this.toggle = document.querySelector('.nav-toggle');
    this.menu = document.querySelector('.mobile-menu');
    this.footer = document.querySelector('.mobile-menu-footer');
    this.isOpen = false;
    this.init();
  }

  init() {
    if (!this.toggle || !this.menu) return;

    this.toggle.onclick = () => this.toggleMenu();

    // Event delegation for mobile links
    this.menu.addEventListener('click', (e) => {
      if (e.target.closest('.mobile-nav-link') && this.isOpen) {
        this.toggleMenu();
      }
    });

    console.log('✅ Navigation optimized');
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
    this.toggle.classList.toggle('active');
    this.menu.classList.toggle('active');
    this.isOpen ? this.animateOpen() : this.animateClose();
  }

  animateOpen() {
    const links = this.menu.querySelectorAll('.mobile-nav-link');
    gsap.timeline()
      .to(this.menu, { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)", duration: 0.8, ease: "power4.inOut" })
      .to(links, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power3.out" }, "-=0.3")
      .to(this.footer, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, "-=0.4");
  }

  animateClose() {
    const links = this.menu.querySelectorAll('.mobile-nav-link');
    gsap.timeline()
      .to([links, this.footer], { y: 20, opacity: 0, duration: 0.4, ease: "power3.in" })
      .to(this.menu, { clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)", duration: 0.6, ease: "power4.inOut" });
  }
}

document.addEventListener('DOMContentLoaded', () => { new Navigation(); });
