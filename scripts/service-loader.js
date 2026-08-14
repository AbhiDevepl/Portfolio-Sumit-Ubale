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
    let data;
    if (window.Core && typeof window.Core.fetchServicesData === 'function') {
      data = await window.Core.fetchServicesData();
    } else {
      const response = await fetch('/data/services.json');
      data = await response.json();
    }
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
    const deliverablesFragment = document.createDocumentFragment();
    s.deliverables.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      deliverablesFragment.appendChild(li);
    });
    list.appendChild(deliverablesFragment);

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

    const galleryFragment = document.createDocumentFragment();
    s.gallery.forEach((item, index) => {
      item.category = s.slug;
      const mediaItem = Core.Media.createItem(item, index, s.gallery);
      galleryFragment.appendChild(mediaItem);
    });
    gallery.appendChild(galleryFragment);

    document.body.classList.remove('loading');
  }

  renderRandomFeature(service) {
    const container = document.getElementById('random-image-container');
    if (!container) return;

    // Optimization: Use O(1) lazy random probing to select a featured image
    const galleryItems = service.gallery || [];
    const selectedImage = this.getRandomFeatureImage(galleryItems);

    if (selectedImage) {
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

  /**
   * Selects a random featured image in O(1) time complexity.
   */
  getRandomFeatureImage(items) {
    if (!items || items.length === 0) return null;

    const isImage = (item) => item && item.type !== 'video';

    for (let i = 0; i < 5; i++) {
      const randIdx = Math.floor(Math.random() * items.length);
      const candidate = items[randIdx];
      if (isImage(candidate)) return candidate;
    }

    return items.find(isImage) || null;
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
Core.DOM.injectGlobalComponents();

document.addEventListener('DOMContentLoaded', () => {
  const loader = new ServiceLoader();
  loader.init();
});
