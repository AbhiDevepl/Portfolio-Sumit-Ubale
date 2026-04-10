window.GalleryManager = {
  activeCategory: 'all',
  currentLimit: 3,
  
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

    // Lightbox Click
    grid.addEventListener('click', (e) => {
      const item = e.target.closest('.gallery-item');
      if (item && !e.target.closest('video')) {
        const visibleItems = this.getVisibleData();
        const index = visibleItems.findIndex(d => d.originalIndex === parseInt(item.dataset.index));
        if (index !== -1) Core.Lightbox.open(index, visibleItems);
      }
    });

    // Integrated Hover Effects removed
  },

  getVisibleData() {
    // Optimization: Use pre-calculated data from ContentLoader instead of DOM scraping
    if (window.contentLoader && window.contentLoader.allImages) {
      const category = this.activeCategory;
      const limit = this.currentLimit;

      let filtered = window.contentLoader.allImages;
      if (category !== 'all') {
        filtered = filtered.filter(img => img.category === category);
      }

      // Limit to current visible count
      const visible = filtered.slice(0, limit);

      return visible.map((img, idx) => ({
        ...img,
        originalIndex: window.contentLoader.allImages.indexOf(img)
      }));
    }

    // Fallback if contentLoader not ready (should not happen in production)
    return [];
  },
  
  filterGallery(category) {
    this.activeCategory = category;
    
    document.querySelectorAll('.category-btn').forEach(btn => {
      const isActive = btn.dataset.category === category;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive);
    });
    
    // Convert to array to sort
    const items = Array.from(document.querySelectorAll('.gallery-item'));
    
    let matchCount = 0;
    let shownCount = 0;

    items.forEach(item => {
      const itemCategory = item.dataset.category;
      const order = parseInt(item.dataset.order || '0', 10);
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
        gsap.to(item, {
          opacity: shouldShow ? 1 : 0,
          scale: shouldShow ? 1 : 0.95,
          duration: 0.4,
          display: shouldShow ? 'block' : 'none',
          ease: "power2.out",
          overwrite: true
        });
      } else {
        // Graceful fallback without GSAP
        item.style.display = shouldShow ? 'block' : 'none';
        item.style.opacity = shouldShow ? '1' : '0';
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
