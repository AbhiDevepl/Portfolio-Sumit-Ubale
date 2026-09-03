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

    // Aggregate images
    let images = [];
    if (this.category === 'all') {
      Object.values(this.data.portfolio.images).forEach(catImages => images.push(...catImages));
    } else {
      const key = Object.keys(this.data.portfolio.images).find(k => k.toLowerCase() === this.category);
      images = this.data.portfolio.images[key] || [];
    }
    
    if (!images.length) {
      grid.innerHTML = '<p class="error-msg">No items found in this category.</p>';
      return;
    }

    if (grid) {
      if (this.category === 'cinematics') {
        grid.classList.add('layout-centered');
      } else {
        grid.classList.remove('layout-centered');
      }
    }

    grid.innerHTML = '';
    // Hoist getGalleryData to avoid O(N^2) rendering bottleneck (1192 items)
    const allItems = this.getGalleryData();
    const galleryFragment = Core.DOM.createFragment(images, (img, idx) => this.createGalleryItem(img, idx, allItems));
    grid.appendChild(galleryFragment);

    window.Motion?.kill('gallery-grid');
    window.Motion?.reveal(grid.children, { y: 36, stagger: 0.045, owner: 'gallery-grid' });

    if (window.ScrollTrigger) ScrollTrigger.refresh();
    document.body.classList.remove('loading');
  }

  createGalleryItem(image, index, allItems) {
    // Delegate to Core.Media to ensure consistent behavior across app
    return Core.Media.createItem(image, index, allItems, (cat) => this.category);
  }

  getGalleryData() {
    // Helper to get raw data for lightbox with injected category
    if (this.category === 'all') {
      let all = [];
      Object.entries(this.data.portfolio.images).forEach(([catSlug, imgs]) => {
        const enriched = imgs.map(img => ({ ...img, category: catSlug }));
        all.push(...enriched);
      });
      return all;
    }
    const imgs = this.data.portfolio.images[this.category] || [];
    return imgs.map(img => ({ ...img, category: this.category }));
  }

  // Page-header reveal only. Grid items are owned by Motion.reveal() in
  // renderGallery(); animating them here too meant two systems writing the
  // same opacity, and a ScrollTrigger.batch left behind on every re-render.
  initAnimations() {
    if (!window.gsap || window.Motion?.reduced) return;

    gsap.from('.stagger-reveal', {
      opacity: 0,
      y: 20,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power2.out',
      clearProps: 'all'
    });
  }

  handleError(error) {
    const grid = document.getElementById('gallery-grid');
    if (grid) {
      grid.innerHTML = '';
      const msg = document.createElement('div');
      msg.className = 'error-msg';
      msg.textContent = `Failed to load gallery: ${error.message}`;
      grid.appendChild(msg);
    }
    document.body.classList.remove('loading');
  }
}

Core.DOM.injectGlobalComponents();

document.addEventListener('DOMContentLoaded', () => {
    const loader = new GalleryLoader();
    loader.init();
});
