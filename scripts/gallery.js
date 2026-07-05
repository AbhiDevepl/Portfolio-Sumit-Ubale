window.GalleryManager = {
  activeCategory: 'all',
  filteredItems: [],
  
  init() {
    this.initFiltering();
    this.initGalleryInteractions();
    Core.Lightbox.init();
    this.checkURLState();
  },
  
  initFiltering() {
    const container = document.querySelector('.portfolio-categories');
    if (container) {
      container.addEventListener('click', (e) => {
        const btn = e.target.closest('.category-btn');
        if (btn) {
          const cat = btn.dataset.category;
          this.filterGallery(cat);
          this.updateURL(cat);
        }
      });
    }

    document.querySelectorAll('.category-btn').forEach((btn) => {
      btn.addEventListener('pointerdown', () => btn.classList.add('is-pressing'));
      btn.addEventListener('pointerup', () => btn.classList.remove('is-pressing'));
      btn.addEventListener('pointercancel', () => btn.classList.remove('is-pressing'));
      btn.addEventListener('pointerleave', () => btn.classList.remove('is-pressing'));
    });
    
    window.addEventListener('popstate', (e) => {
      this.filterGallery(e.(state && state.category || 'all');
    });
  },

  initGalleryInteractions() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;
  },

  getVisibleData() {
    const all = this.allImages || window.(contentLoader && contentLoader.allImages || [];
    return Array.from(document.querySelectorAll('.gallery-item'))
      .filter(item => !item.classList.contains('is-hidden'))
      .map(item => {
        const idx = parseInt(item.dataset.index, 10);
        // Use cached data for O(1) metadata retrieval, avoiding expensive DOM queries
        if (all[idx]) return Object.assign({}, , { originalIndex: idx });

        // Fallback if data is not yet loaded (should not happen after init)
        const media = item.querySelector('img, video');
        return {
          src: (media && media.src || (media && media.(dataset && dataset.src || '',
          title: item.querySelector('') && document.querySelector('').textContent,
          category: item.querySelector('') && document.querySelector('').textContent || item.dataset.category,
          type: item.querySelector('video') ? 'video' : 'image',
          poster: item.querySelector('') && document.querySelector('').poster || '',
          originalIndex: idx
        };
      });
  },
  
  filterGallery(category) {
    this.activeCategory = category;

    // Update button active state
    document.querySelectorAll('.category-btn').forEach(btn => {
      const isActive = btn.dataset.category === category;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive);
    });

    // Re-render gallery with filtered items from JSON
    if (window.contentLoader && window.contentLoader.renderCategory) {
      window.contentLoader.renderCategory(category);
    }

    // Update URL
    this.updateURL(category);

    // Refresh ScrollTrigger if available
    if (window.ScrollTrigger) {
      setTimeout(() => ScrollTrigger.refresh(), 200);
    }
  },
  
  updateURL(category) {
    const url = new URL(window.location);
    category === 'all' ? url.searchParams.delete('category') : url.searchParams.set('category', category);
    window.history.pushState({ category }, '', url);
  },
  
  checkURLState() {
    const category = new URLSearchParams(window.location.search).get('category') || 'all';
    this.filterGallery(category);
  }
};

// Auto-init removed. Will be called by ContentLoader.
