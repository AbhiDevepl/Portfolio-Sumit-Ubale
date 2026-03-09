/**
 * Gallery Loader
 * Handles dynamic content loading for the dedicated gallery results page
 */

class GalleryLoader {
  constructor() {
    this.data = null;
    this.category = this.getCategoryFromURL();
  }

  async init() {
    this.category = (this.category || 'all').toLowerCase();
    // if (!this.category) { window.location.href = '/'; return; } // Removed redirect

    try {
      await this.loadData();
      Core.Lightbox.init();
      this.renderGallery();
      this.initAnimations();
    } catch (error) {
      console.error('Error loading gallery:', error);
      this.handleError(error);
    }
  }

  getCategoryFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('category') || params.get('c');
  }

  async loadData() {
    const response = await fetch('/data/portfolio.json');
    this.data = await response.json();
  }

  renderGallery() {
    const grid = document.getElementById('gallery-grid');
    const titleEl = document.getElementById('category-title');
    const categoriesContainer = document.getElementById('gallery-categories');
    
    // Update category title
    const categoryInfo = this.data.portfolio.categories.find(c => c.slug.toLowerCase() === this.category);
    if (titleEl) titleEl.textContent = categoryInfo ? categoryInfo.name : this.category.toUpperCase();

    // Render category buttons (navigation)
    if (categoriesContainer) {
      categoriesContainer.innerHTML = '';
      const fragment = Core.DOM.createFragment(this.data.portfolio.categories, (cat) => {
        const btn = document.createElement('button');
        btn.className = `category-btn ${cat.slug === this.category ? 'active' : ''}`;
        btn.textContent = cat.name;
        btn.onclick = () => {
          this.category = cat.slug;
          window.history.pushState({ category: cat.slug }, '', `?category=${cat.slug}`);
          this.renderGallery();
        };
        return btn;
      });
      categoriesContainer.appendChild(fragment);
    }

    // Aggregate and enrich images once for performance O(N) instead of O(N^2)
    const images = this.getGalleryData();
    
    if (!images.length) {
      if (grid) grid.innerHTML = '<p class="error-msg">No items found in this category.</p>';
      return;
    }

    if (grid) {
      if (this.category === 'cinematics') {
        grid.classList.add('layout-centered');
      } else {
        grid.classList.remove('layout-centered');
      }

      grid.innerHTML = '';
      const galleryFragment = Core.DOM.createFragment(images, (img, idx) => this.createGalleryItem(img, idx, images));
      grid.appendChild(galleryFragment);
    }

    if (window.ScrollTrigger) ScrollTrigger.refresh();
    document.body.classList.remove('loading');
  }

  createGalleryItem(image, index, allItems) {
    // Delegate to Core.Media to ensure consistent behavior across app
    // We pass the pre-calculated allItems array to avoid O(N^2) overhead
    return Core.Media.createItem(image, index, allItems, (cat) => this.category);
  }

  getGalleryData() {
    // Helper to get raw data for lightbox with injected category
    const categoryLower = this.category.toLowerCase();

    if (categoryLower === 'all') {
      let all = [];
      Object.entries(this.data.portfolio.images).forEach(([catSlug, imgs]) => {
        const enriched = imgs.map(img => ({ ...img, category: catSlug }));
        all.push(...enriched);
      });
      return all;
    }

    // Find key case-insensitively
    const key = Object.keys(this.data.portfolio.images).find(k => k.toLowerCase() === categoryLower);
    const imgs = key ? this.data.portfolio.images[key] : [];
    return imgs.map(img => ({ ...img, category: key || categoryLower }));
  }

  initAnimations() {
    const hasGsap = typeof window !== 'undefined' && window.gsap;
    const hasScrollTrigger = typeof window !== 'undefined' && window.ScrollTrigger;

    // If GSAP is not loaded (e.g., CDN blocked), skip animations instead of throwing.
    if (!hasGsap) {
      console.warn('GalleryLoader: GSAP not available, skipping animations.');
      document.querySelectorAll('.reveal-item').forEach(el => el.style.opacity = 1);
      return;
    }

    // Brief delay to ensure DOM layout is settled before initializing ScrollTrigger
    setTimeout(() => {
      window.gsap.from('.stagger-reveal', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out',
        clearProps: 'all' // Ensure clean state after animation
      });

      if (hasScrollTrigger) {
        // Use batch() for better performance with many items and reliable triggering
        ScrollTrigger.batch('.gallery-item', {
          start: 'top 95%', // Trigger slightly earlier
          onEnter: batch => gsap.to(batch, {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            stagger: 0.05,
            ease: 'power2.out',
            overwrite: true
          }),
          onEnterBack: batch => gsap.to(batch, { opacity: 1, scale: 1, overwrite: true }) // Keep visible when scrolling back
        });
        
        ScrollTrigger.refresh();
      } else {
        // Fallback if ScrollTrigger is missing
        window.gsap.to('.gallery-item', {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.05,
          ease: 'power2.out'
        });
      }
      
      // Force loader removal just in case
      document.body.classList.remove('loading');
    }, 100);
  }

  handleError(error) {
    const grid = document.getElementById('gallery-grid');
    if (grid) grid.innerHTML = `<div class="error-msg">Failed to load gallery: ${error.message}</div>`;
    document.body.classList.remove('loading');
  }
}

Core.DOM.injectGlobalComponents();

document.addEventListener('DOMContentLoaded', () => {
    const loader = new GalleryLoader();
    loader.init();
});
