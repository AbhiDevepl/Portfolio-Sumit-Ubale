/**
 * Gallery Loader
 * Handles dynamic content loading for the dedicated gallery results page
 */

class GalleryLoader {
  constructor() {
    this.data = null;
    this.category = this.getCategoryFromURL();
    this._imagesCache = {}; // Cache for aggregate/category images to bypass O(N) aggregation
    this._galleryDataCache = {}; // Cache for getGalleryData() results
    this._categoriesRendered = false; // Flag to render navigation buttons exactly once

    // Batch loading states for progressive rendering
    this.batchSize = 36;
    this.renderedCount = 0;
    this.itemsToRender = [];
    this.sentinel = null;
    this.observer = null;
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
    if (window.Core && typeof window.Core.fetchPortfolioData === 'function') {
      this.data = await window.Core.fetchPortfolioData();
    } else {
      const response = await fetch('/data/portfolio.json');
      this.data = await response.json();
    }
  }

  renderGallery() {
    const grid = document.getElementById('gallery-grid');
    const titleEl = document.getElementById('category-title');
    const categoriesContainer = document.getElementById('gallery-categories');
    
    // Update category title
    const categoryInfo = this.data.portfolio.categories.find(c => c.slug.toLowerCase() === this.category);
    if (titleEl) titleEl.textContent = categoryInfo ? categoryInfo.name : this.category.toUpperCase();

    // Render category buttons (navigation) - optimized to render exactly once and only toggle active class
    if (categoriesContainer) {
      if (!this._categoriesRendered) {
        categoriesContainer.innerHTML = '';
        const fragment = Core.DOM.createFragment(this.data.portfolio.categories, (cat) => {
          const btn = document.createElement('button');
          btn.className = `category-btn ${cat.slug === this.category ? 'active' : ''}`;
          btn.textContent = cat.name;
          btn.dataset.category = cat.slug;
          btn.onclick = () => {
            this.category = cat.slug;
            window.history.pushState({ category: cat.slug }, '', `?category=${cat.slug}`);
            this.renderGallery();
          };
          return btn;
        });
        categoriesContainer.appendChild(fragment);
        this._categoriesRendered = true;
      } else {
        const buttons = categoriesContainer.querySelectorAll('.category-btn');
        buttons.forEach(btn => {
          if (btn.dataset.category === this.category) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });
      }
    }

    // Aggregate images - optimized using lazy-initialized in-memory cache
    let images = this._imagesCache[this.category];
    if (!images) {
      if (this.category === 'all') {
        images = [];
        Object.values(this.data.portfolio.images).forEach(catImages => Array.prototype.push.apply(images, catImages));
      } else {
        const key = Object.keys(this.data.portfolio.images).find(k => k.toLowerCase() === this.category);
        images = this.data.portfolio.images[key] || [];
      }
      this._imagesCache[this.category] = images;
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

    // Clear previous progressive state
    this.cleanupSentinel();
    this.itemsToRender = images;
    this.renderedCount = 0;
    grid.innerHTML = '';

    // Render first batch
    this.renderNextBatch();

    document.body.classList.remove('loading');
  }

  renderNextBatch() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    const start = this.renderedCount;
    const end = Math.min(start + this.batchSize, this.itemsToRender.length);

    if (start >= this.itemsToRender.length) {
      this.cleanupSentinel();
      return;
    }

    const batchItems = this.itemsToRender.slice(start, end);
    const allItems = this.getGalleryData();

    const newlyCreatedElements = [];
    const fragment = Core.DOM.createFragment(batchItems, (img, idx) => {
      const absoluteIndex = start + idx;
      const element = this.createGalleryItem(img, absoluteIndex, allItems);
      if (element) {
        newlyCreatedElements.push(element);
      }
      return element;
    });

    // Remove sentinel before appending if it exists
    this.cleanupSentinel();

    // Append batch items to container
    grid.appendChild(fragment);
    this.renderedCount = end;

    // Trigger reveal animations on newly created elements
    this.triggerRevealAnimations(newlyCreatedElements);

    // If there are more items to load, setup sentinel
    if (this.renderedCount < this.itemsToRender.length) {
      this.setupSentinel();
    }
  }

  setupSentinel() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    this.sentinel = document.createElement('div');
    this.sentinel.className = 'gallery-sentinel';
    this.sentinel.style.height = '1px';
    this.sentinel.style.width = '100%';
    this.sentinel.style.clear = 'both';
    grid.appendChild(this.sentinel);

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.renderNextBatch();
        }
      });
    }, {
      rootMargin: '400px'
    });

    this.observer.observe(this.sentinel);
  }

  cleanupSentinel() {
    if (this.observer && this.sentinel) {
      this.observer.unobserve(this.sentinel);
    }
    if (this.sentinel && this.sentinel.parentNode) {
      this.sentinel.parentNode.removeChild(this.sentinel);
    }
    this.sentinel = null;
    this.observer = null;
  }

  createGalleryItem(image, index, allItems) {
    // Delegate to Core.Media to ensure consistent behavior across app
    return Core.Media.createItem(image, index, allItems, (cat) => this.category);
  }

  getGalleryData() {
    if (this._galleryDataCache[this.category]) {
      return this._galleryDataCache[this.category];
    }
    // Helper to get raw data for lightbox with injected category
    let result;
    if (this.category === 'all') {
      let all = [];
      Object.entries(this.data.portfolio.images).forEach(([catSlug, imgs]) => {
        const enriched = imgs.map(img => Object.assign({}, img, { category: catSlug }));
        Array.prototype.push.apply(all, enriched);
      });
      result = all;
    } else {
      const imgs = this.data.portfolio.images[this.category] || [];
      result = imgs.map(img => Object.assign({}, img, { category: this.category }));
    }
    this._galleryDataCache[this.category] = result;
    return result;
  }

  triggerRevealAnimations(newElements) {
    if (window.gsap) {
      window.gsap.fromTo(newElements,
        { opacity: 0, y: 20, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.05,
          ease: 'power2.out',
          overwrite: 'auto'
        }
      );
    } else {
      newElements.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px) scale(0.95)';
        item.style.transition = 'opacity 0.5s ease ' + (index * 0.05) + 's, transform 0.5s ease ' + (index * 0.05) + 's';

        setTimeout(() => {
          item.style.opacity = '1';
          item.style.transform = 'translateY(0) scale(1)';
        }, 50);
      });
    }
  }

  initAnimations() {
    const hasGsap = typeof window !== 'undefined' && window.gsap;

    // If GSAP is not loaded (e.g., CDN blocked), skip animations instead of throwing.
    if (!hasGsap) {
      console.warn('GalleryLoader: GSAP not available, skipping animations.');
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
