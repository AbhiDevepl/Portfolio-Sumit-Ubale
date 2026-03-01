window.GalleryManager = {
  activeCategory: 'all',
  items: [],
  categoryBtns: [],
  
  init() {
    this.cacheElements();
    this.initFiltering();
    this.initGalleryInteractions();
    Core.Lightbox.init();
    this.checkURLState();
    console.log('⚡ Gallery Manager: Elements cached & performance optimized');
  },

  /**
   * PERF: Cache DOM elements to avoid repeated queries
   */
  cacheElements() {
    this.items = Array.from(document.querySelectorAll('.gallery-item'));
    this.categoryBtns = Array.from(document.querySelectorAll('.category-btn'));
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

    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.onclick = () => {
        window.location.href = `/pages/gallery.html?category=${this.activeCategory}`;
      };
    }
    
    window.addEventListener('popstate', (e) => {
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

    // Integrated Hover Effects
    grid.addEventListener('mouseover', (e) => {
      const item = e.target.closest('.gallery-item');
      if (item) {
        // PERF: Only animate if we're entering a new item
        if (item === this._lastHovered) return;
        this._lastHovered = item;

        const img = item.querySelector('.gallery-image');
        const overlay = item.querySelector('.gallery-overlay');
        gsap.to(img, { scale: 1.05, duration: 0.4, ease: "power2.out", overwrite: true });
        gsap.to(overlay, { opacity: 1, duration: 0.3, overwrite: true });
      }
    });

    grid.addEventListener('mouseout', (e) => {
      const item = e.target.closest('.gallery-item');
      if (item) {
        this._lastHovered = null;
        const img = item.querySelector('.gallery-image');
        const overlay = item.querySelector('.gallery-overlay');
        gsap.to(img, { scale: 1, duration: 0.4, ease: "power2.out", overwrite: true });
        gsap.to(overlay, { opacity: 0, duration: 0.3, overwrite: true });
      }
    });
  },

  /**
   * PERF: Uses cached items and avoids getComputedStyle to eliminate layout thrashing
   */
  getVisibleData() {
    return this.items
      .filter(item => {
        // Check inline style first (set by GSAP) then fallback to offsetHeight
        return item.style.display !== 'none' && item.offsetHeight > 0;
      })
      .map(item => {
        const media = item.querySelector('img, video');
        return {
          src: media.src || media.dataset.src,
          title: item.querySelector('.gallery-title')?.innerText,
          category: item.dataset.category,
          type: media.tagName.toLowerCase() === 'video' ? 'video' : 'image',
          originalIndex: parseInt(item.dataset.index)
        };
      });
  },
  
  /**
   * PERF: Uses cached elements and batch animation updates
   */
  filterGallery(category) {
    this.activeCategory = category;
    
    this.categoryBtns.forEach(btn => {
      const isActive = btn.dataset.category === category;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive);
    });
    
    let shownCount = 0;
    let hasHidden = false;

    this.items.forEach(item => {
      const itemCategory = item.dataset.category;
      const isPreview = item.dataset.preview === 'true';
      const isMatch = category === 'all' || itemCategory === category;
      
      let shouldShow = false;
      if (isMatch) {
        if (category === 'all') {
          // STRICT LIMIT: Exactly 3 items for 'all' on homepage
          if (shownCount < 3) {
            shouldShow = true;
            shownCount++;
          } else {
            hasHidden = true;
          }
        } else {
          // Category-specific: Show all preview items
          if (isPreview) {
            shouldShow = true;
          } else {
            hasHidden = true;
          }
        }
      }

      // PERF: Only trigger animation if state is changing (optional, GSAP's overwrite:true handles this well)
      gsap.to(item, {
        opacity: shouldShow ? 1 : 0,
        scale: shouldShow ? 1 : 0.95,
        duration: 0.4,
        display: shouldShow ? 'block' : 'none',
        ease: "power2.out",
        overwrite: true
      });
    });

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
      gsap.to(moreContainer, { 
        display: hasHidden ? 'flex' : 'none', 
        opacity: hasHidden ? 1 : 0,
        duration: 0.3,
        overwrite: true
      });
    }
    
    // PERF: Throttled ScrollTrigger refresh
    if (this._refreshTimeout) clearTimeout(this._refreshTimeout);
    this._refreshTimeout = setTimeout(() => {
        if (window.ScrollTrigger) ScrollTrigger.refresh();
    }, 500);
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
