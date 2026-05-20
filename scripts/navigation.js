/**
 * Navigation System
 */

class Navigation {
  constructor() {
    this.nav = document.querySelector('.nav');
    this.toggle = document.querySelector('.nav-toggle');
    this.menu = document.querySelector('.mobile-menu');
    this.isOpen = false;
    this.init();
  }

  init() {
    if (!this.toggle || !this.menu) return;

    const self = this;
    this.toggle.onclick = function() { self.toggleMenu(); };

    this.menu.addEventListener('click', function(e) {
      if (e.target.classList.contains('mobile-nav-link')) {
        self.closeMenu();
      }
    });

    window.addEventListener('scroll', function() {
      if (window.scrollY > 50) {
        if (self.nav) self.nav.classList.add('scrolled');
      } else {
        if (self.nav) self.nav.classList.remove('scrolled');
      }
    }, { passive: true });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && self.isOpen) self.closeMenu();
    });
  }

  toggleMenu() {
    this.isOpen ? this.closeMenu() : this.openMenu();
  }

  openMenu() {
    this.isOpen = true;
    this.menu.classList.add('active');
    this.toggle.classList.add('active');
    document.body.classList.add('no-scroll');
  }

  closeMenu() {
    this.isOpen = false;
    this.menu.classList.remove('active');
    this.toggle.classList.remove('active');
    document.body.classList.remove('no-scroll');
  }
}

document.addEventListener('DOMContentLoaded', function() { new Navigation(); });
