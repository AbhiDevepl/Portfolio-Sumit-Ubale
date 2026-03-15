/**
 * Gallery Loader
 * Handles dynamic content loading for the dedicated gallery results page
 */

class GalleryLoader {
  constructor() {
    this.data = null;
    this.category = this.getCategoryFromURL();
    this.categoryNames = {}; // Cache for category names
  }

  async init() {
    this.category = (this.category || 'all').toLowerCase();

    try {
      await this.loadData();

      // Build category name lookup map once to avoid repeated O(N) array searches
      if (this.data?.portfolio?.categories) {
        this.data.portfolio.categories.forEach(cat => {
          this.categoryNames[cat.slug.toLowerCase()] = cat.name;
        });
      }

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
    
    // Update category title using cached names
    if (titleEl) {
      titleEl.textContent = this.categoryNames[this.category] || this.category.toUpperCase();
    }

    // Render category buttons (navigation)
    if (categoriesContainer && this.data?.portfolio?.categories) {
      categoriesContainer.innerHTML = '';
      const fragment = Core.DOM.createFragment(this.data.portfolio.categories, (cat) => {
        const btn = document.createElement('button');
        const isCurrent = cat.slug.toLowerCase() === this.category;
        btn.className = `category-btn ${isCurrent ? 'active' : ''}`;
        btn.textContent = cat.name;
        btn.onclick = () => {
          this.category = cat.slug.toLowerCase();
          window.history.pushState({ category: this.category }, '', `?category=${this.category}`);
          this.renderGallery();
        };
        return btn;
      });
      categoriesContainer.appendChild(fragment);
    }

    // Aggregate and enrich images once - O(N)
    // Optimized: previously this happened inside createGalleryItem for every item (O(N^2))
    let enrichedImages = [];
    const imagesSource = this.data.portfolio.images;

    if (this.category === 'all') {
      Object.entries(imagesSource).forEach(([catSlug, catImages]) => {
        const lowerSlug = catSlug.toLowerCase();
        catImages.forEach(img => {
          enrichedImages.push({ ...img, category: lowerSlug });
        });
      });
    } else {
      // Case-insensitive lookup for robustness
      const key = Object.keys(imagesSource).find(k => k.toLowerCase() === this.category);
      const catImages = imagesSource[key] || [];
      catImages.forEach(img => {
        enrichedImages.push({ ...img, category: this.category });
      });
    }
    
    if (!enrichedImages.length) {
      if (grid) grid.innerHTML = '<p class="error-msg">No items found in this category.</p>';
      return;
    }

    if (grid) {
      // Layout adjustment for cinematics
      if (this.category === 'cinematics') {
        grid.classList.add('layout-centered');
      } else {
        grid.classList.remove('layout-centered');
      }

      grid.innerHTML = '';
      // Pass pre-enriched images directly to avoid repeated data aggregation - O(N)
      const galleryFragment = Core.DOM.createFragment(enrichedImages, (img, idx) => {
        return Core.Media.createItem(img, idx, enrichedImages, (cat) => {
          return this.categoryNames[cat] || cat;
        });
      });
      grid.appendChild(galleryFragment);
    }

    if (window.ScrollTrigger) ScrollTrigger.refresh();
    document.body.classList.remove('loading');
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
