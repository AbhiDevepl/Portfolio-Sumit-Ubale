window.GalleryManager = {
  activeCategory: 'all',
  currentLimit: 3,
  itemsCache: [], // Cache for DOM references and metadata
  
  init() {
    this.refresh();
    this.initFiltering();
    this.initGalleryInteractions();
    Core.Lightbox.init();
    this.checkURLState();
  },

  /**
   * Refreshes the cache and re-filters the gallery
   */
  refresh() {
    this.refreshItemsCache();
    this.filterGallery(this.activeCategory);
  },

  /**
   * Caches DOM references and extracts metadata to avoid repeated DOM queries.
   * This is critical for performance when dealing with 1,000+ items.
   */
  refreshItemsCache() {
    this.itemsCache = Array.from(document.querySelectorAll('.gallery-item')).map(item => {
      const media = item.querySelector('img, video');
      const title = item.querySelector('.gallery-title');
      const category = item.dataset.category;
      const type = item.querySelector('video') ? 'video' : 'image';
      const order = parseInt(item.dataset.order || '0', 10);
      const index = parseInt(item.dataset.index, 10);

      return {
        element: item,
        media,
        title: title ? title.textContent : '',
        category,
        type,
        order,
        index
      };
    });
  },
  
  initFiltering() {
    const container = document.querySelector('.portfolio-categories');
    if (container) {
      container.addEventListener('click', (e) => {
        const btn = e.target.closest('.category-btn');
        if (btn) {
          const cat = btn.dataset.category;
          this.currentLimit = 3; // Reset limit on category change
          this.filterGallery(cat);
          this.updateURL(cat);
        }
      });
    }

    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.onclick = () => {
        // Increase limit by 3 and re-filter
        this.currentLimit += 3;
        this.filterGallery(this.activeCategory);
      };
    }
    
    window.addEventListener('popstate', (e) => {
      this.currentLimit = 3;
      this.filterGallery(e.state?.category || 'all');
    });
  },

  initGalleryInteractions() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    /**
     * EVENT DELEGATION: Lightbox Click
     * Instead of 1,200+ individual listeners, we use a single listener on the grid.
     * This significantly reduces memory overhead and improves initialization speed.
     */
    grid.addEventListener('click', (e) => {
      const item = e.target.closest('.gallery-item');
      // If clicking anything in the item EXCEPT the video itself (which toggles play)
      if (item && !e.target.closest('video')) {
        const visibleItems = this.getVisibleData();
        const index = visibleItems.findIndex(d => d.originalIndex === parseInt(item.dataset.index));
        if (index !== -1) Core.Lightbox.open(index, visibleItems);
      }
    });

    // Integrated Hover Effects removed
  },

  getVisibleData() {
    // Use cached metadata and fast visibility checks
    return this.itemsCache
      .filter(item => {
        // offsetParent check is very fast to determine if item is display: none
        const isVisible = item.element.offsetParent !== null;
        if (!isVisible) return false;

        // Final check for opacity to ensure filtering animation completed or is active
        return parseFloat(item.element.style.opacity || '1') > 0.1;
      })
      .map(item => ({
        src: item.media?.src || item.media?.dataset?.src || '',
        title: item.title,
        category: item.category,
        type: item.type,
        originalIndex: item.index
      }));
  },
  
  filterGallery(category) {
    this.activeCategory = category;
    
    document.querySelectorAll('.category-btn').forEach(btn => {
      const isActive = btn.dataset.category === category;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive);
    });
    
    let matchCount = 0;
    let shownCount = 0;

    // Use itemsCache to avoid repeated querySelectorAll and dataset lookups
    this.itemsCache.forEach(item => {
      const itemCategory = item.category;
      const order = item.order;
      const isMatch = category === 'all' || itemCategory === category;
      
      let shouldShow = false;
      if (isMatch) {
        matchCount++;
        
        if (category === 'all') {
          // Use a simple global counter for 'all'
          if (shownCount < this.currentLimit) {
            shouldShow = true;
            shownCount++;
          }
        } else {
          // Use the per-category 'order' for specific categories
          if (order < this.currentLimit) {
            shouldShow = true;
            shownCount++;
          }
        }
      }

      if (window.gsap) {
        gsap.to(item.element, {
          opacity: shouldShow ? 1 : 0,
          scale: shouldShow ? 1 : 0.95,
          duration: 0.4,
          display: shouldShow ? 'block' : 'none',
          ease: "power2.out",
          overwrite: true
        });
      } else {
        // Graceful fallback without GSAP
        item.element.style.display = shouldShow ? 'block' : 'none';
        item.element.style.opacity = shouldShow ? '1' : '0';
      }
    });

    const hasHidden = matchCount > shownCount;

    const grid = document.getElementById('gallery-grid');
    if (grid) {
      if (category === 'cinematics') {
        grid.classList.add('layout-centered');
      } else {
        grid.classList.remove('layout-centered');
      }
    }

    const moreContainer = document.getElementById('portfolio-more');
    if (moreContainer) {
      if (window.gsap) {
        gsap.to(moreContainer, { 
          display: hasHidden ? 'flex' : 'none', 
          opacity: hasHidden ? 1 : 0,
          duration: 0.3,
          overwrite: true
        });
      } else {
        moreContainer.style.display = hasHidden ? 'flex' : 'none';
        moreContainer.style.opacity = hasHidden ? '1' : '0';
      }
    }
    
    if (window.ScrollTrigger) {
      setTimeout(() => ScrollTrigger.refresh(), 500);
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
