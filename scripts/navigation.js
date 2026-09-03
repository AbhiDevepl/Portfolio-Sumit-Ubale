

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

  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
    this.toggle.classList.toggle('active');
    this.menu.classList.toggle('active');
    this.isOpen ? this.animateOpen() : this.animateClose();
  }

  animateOpen() {
    const links = this.menu.querySelectorAll('.mobile-nav-link');
    if (window.gsap) {
      gsap.timeline()
        .to(this.menu, { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)", duration: 0.8, ease: "power4.inOut" })
        .to(links, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power3.out" }, "-=0.3")
        .to(this.footer, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, "-=0.4");
    } else {
      // Fallback: simply show elements
      this.menu.style.clipPath = "polygon(0 0, 100% 0, 100% 100%, 0% 100%)";
      links.forEach(link => {
        link.style.opacity = '1';
        link.style.transform = 'translateY(0)';
      });
      if (this.footer) {
        this.footer.style.opacity = '1';
        this.footer.style.transform = 'translateY(0)';
      }
    }
  }

  animateClose() {
    const links = this.menu.querySelectorAll('.mobile-nav-link');
    if (window.gsap) {
      gsap.timeline()
        .to([links, this.footer], { y: 20, opacity: 0, duration: 0.4, ease: "power3.in" })
        .to(this.menu, { clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)", duration: 0.6, ease: "power4.inOut" });
    } else {
      // Fallback: simply hide elements
      this.menu.style.clipPath = "polygon(0 0, 100% 0, 100% 0, 0 0)";
      links.forEach(link => {
        link.style.opacity = '0';
        link.style.transform = 'translateY(20px)';
      });
      if (this.footer) {
        this.footer.style.opacity = '0';
        this.footer.style.transform = 'translateY(20px)';
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => { new Navigation(); });
