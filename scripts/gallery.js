window.GalleryManager = {
  activeCategory: 'all',
  items: [], // Cached gallery elements
  categoryButtons: [], // Cached filter buttons
  visibleData: [], // Pre-calculated visible items for Lightbox
  
  init() {
    this.cacheElements();
    this.initFiltering();
    this.initGalleryInteractions();
    Core.Lightbox.init();

    // Initial population of visibleData for lightbox (handles initial load without filter interaction)
    this.updateVisibleData();

    this.checkURLState();
    console.log('✅ Gallery Manager optimized (Cached & Zero-Thrash)');
  },

  cacheElements() {
    this.items = Array.from(document.querySelectorAll('.gallery-item'));
    this.categoryButtons = Array.from(document.querySelectorAll('.category-btn'));
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
        const index = this.visibleData.findIndex(d => d.originalIndex === parseInt(item.dataset.index));
        if (index !== -1) Core.Lightbox.open(index, this.visibleData);
      }
    });

    // Integrated Hover Effects
    grid.addEventListener('mouseover', (e) => {
      const item = e.target.closest('.gallery-item');
      if (item) {
        const img = item.querySelector('.gallery-image');
        const overlay = item.querySelector('.gallery-overlay');
        gsap.to(img, { scale: 1.05, duration: 0.4, ease: "power2.out", overwrite: true });
        gsap.to(overlay, { opacity: 1, duration: 0.3, overwrite: true });
      }
    });

    grid.addEventListener('mouseout', (e) => {
      const item = e.target.closest('.gallery-item');
      if (item) {
        const img = item.querySelector('.gallery-image');
        const overlay = item.querySelector('.gallery-overlay');
        gsap.to(img, { scale: 1, duration: 0.4, ease: "power2.out", overwrite: true });
        gsap.to(overlay, { opacity: 0, duration: 0.3, overwrite: true });
      }
    });
  },

  /**
   * BOLT OPTIMIZATION: Removed window.getComputedStyle call which triggers
   * synchronous layout (thrashing). Instead, we track state in this.visibleData
   * during the filter phase.
   */
  getVisibleData() {
     return this.visibleData;
  },

  updateVisibleData() {
    this.visibleData = [];
    this.items.forEach(item => {
        // We only check if it's currently visible based on GSAP's set display property
        // This avoids layout thrashing if we do it once or use the cached shouldShow state.
        if (item.style.display !== 'none') {
            const media = item.querySelector('img, video');
            this.visibleData.push({
                src: media.src || media.dataset.src,
                title: item.querySelector('.gallery-title')?.innerText,
                category: item.dataset.category,
                type: item.querySelector('video') ? 'video' : 'image',
                originalIndex: parseInt(item.dataset.index)
            });
        }
    });
  },
  
  filterGallery(category) {
    this.activeCategory = category;
    const newVisibleData = [];
    
    // Use cached buttons
    this.categoryButtons.forEach(btn => {
      const isActive = btn.dataset.category === category;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive);
    });
    
    let shownCount = 0;
    let hasHidden = false;

    // Use cached items
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

      // If visible, add to visibleData cache for Lightbox (Prevents getComputedStyle later)
      if (shouldShow) {
          const media = item.querySelector('img, video');
          newVisibleData.push({
            src: media.src || media.dataset.src,
            title: item.querySelector('.gallery-title')?.innerText,
            category: item.dataset.category,
            type: item.querySelector('video') ? 'video' : 'image',
            originalIndex: parseInt(item.dataset.index)
          });
      }

      gsap.to(item, {
        opacity: shouldShow ? 1 : 0,
        scale: shouldShow ? 1 : 0.95,
        duration: 0.4,
        display: shouldShow ? 'block' : 'none',
        ease: "power2.out",
        overwrite: true
      });
    });

    this.visibleData = newVisibleData;

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
    
    // Debounce ScrollTrigger refresh for better performance during transitions
    clearTimeout(this.refreshTimeout);
    this.refreshTimeout = setTimeout(() => {
        if (window.ScrollTrigger) ScrollTrigger.refresh();
    }, 200);
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
