/**
 * Service Page Loader
 * Dynamically populates the service.html template based on the slug
 */

class ServiceLoader {
  constructor() {
    this.servicesData = null;
    this.currentService = null;
  }

  async init() {
    const slug = this.getSlugFromURL();
    if (!slug) {
      console.warn('No service slug provided. Redirecting to home.');
      window.location.href = '/';
      return;
    }

    try {
      await this.loadData();
      this.currentService = this.servicesData.find(s => s.slug === slug);

      if (!this.currentService) {
        throw new Error('Service not found');
      }

      this.renderPage();
      this.initAnimations();
    } catch (error) {
      console.error('Error loading service:', error);
      document.body.innerHTML = `<div class="container" style="padding: 100px; text-align: center;"><h1>Service Not Found</h1><a href="/">Back to Home</a></div>`;
    }
  }

  getSlugFromURL() {
    // Supports both /service.html?service=weddings AND /weddings (if server configured)
    const params = new URLSearchParams(window.location.search);
    let slug = params.get('service') || params.get('s');
    
    // Fallback: Check path segments for /service/weddings style
    if (!slug) {
      const pathParts = window.location.pathname.split('/').filter(p => p);
      if (pathParts.length > 0 && pathParts[0] !== 'service.html') {
        slug = pathParts[pathParts.length - 1];
      }
    }
    
    return slug;
  }

  async loadData() {
    const response = await fetch('/data/services.json');
    const data = await response.json();
    this.servicesData = data.services;
  }

  renderPage() {
    const s = this.currentService;
    
    // Update Document Title
    document.title = `${s.title} — Sumit Ubale Photography`;

    // Populate Hero
    document.getElementById('service-title').textContent = s.title;
    document.getElementById('service-hero-desc').textContent = s.heroDescription;

    // Populate Story
    document.getElementById('service-story-text').textContent = s.story;

    // Populate Deliverables
    const list = document.getElementById('deliverables-list');
    list.innerHTML = '';
    s.deliverables.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      list.appendChild(li);
    });

    // Populate Random Featured Image
    this.renderRandomFeature(s);

    // Populate Gallery
    const gallery = document.getElementById('service-gallery');
    gallery.innerHTML = '';

    // Apply centered layout for cinematics or video-heavy pages
    if (s.slug === 'cinematics' || s.mediaType === 'videos') {
      gallery.classList.add('layout-centered');
    } else {
      gallery.classList.remove('layout-centered');
    }

    s.gallery.forEach((item, index) => {
      image.category = s.slug; // Inject slug as category for display
      const mediaItem = Core.Media.createItem(image, index, s.gallery);
      gallery.appendChild(mediaItem);
    });

    document.body.classList.remove('loading');
  }

  renderRandomFeature(service) {
    const container = document.getElementById('random-image-container');
    if (!container) return;

    const imageList = service.gallery.filter(item => item.type !== 'video');
    if (imageList.length > 0) {
      const randomIndex = Math.floor(Math.random() * imageList.length);
      const selectedImage = imageList[randomIndex];

      const img = document.createElement('img');
      img.src = selectedImage.src;
      img.alt = `Featured ${service.title}`;
      img.onload = () => container.classList.add('loaded');

      container.innerHTML = '';
      container.appendChild(img);
    } else {
      const section = container.closest('.service-featured-section');
      if (section) section.style.display = 'none';
    }
  }

  initAnimations() {
    if (window.gsap) {
      const runAnimations = () => {
        gsap.from('.stagger-reveal', {
          opacity: 0,
          y: 30,
          duration: 1,
          stagger: 0.1,
          ease: 'power3.out'
        });

        gsap.from('.gallery-item', {
          opacity: 0,
          scale: 0.95,
          duration: 0.8,
          stagger: 0.05,
          scrollTrigger: {
            trigger: '.service-gallery',
            start: 'top 80%'
          }
        });
      };

      if (document.body.classList.contains('loaded')) runAnimations();
      else window.addEventListener('pageLoaded', runAnimations, { once: true });
    }
  }
}

// Initialize
Core.DOM.injectGlobalComponents();

document.addEventListener('DOMContentLoaded', () => {
  const loader = new ServiceLoader();
  loader.init();
});
