window.GalleryManager = {
  activeCategory: 'all',
  currentLimit: 3,
  itemsCache: [],
  visibleData: [],
  
  init() {
    this.initGalleryInteractions();
    this.initFiltering();
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

    // Cache all gallery items' DOM references and metadata once for O(1) access
    const itemElements = grid.querySelectorAll('.gallery-item');
    this.itemsCache = Array.from(itemElements).map(el => {
      const media = el.querySelector('img, video');
      return {
        el,
        category: el.dataset.category,
        order: parseInt(el.dataset.order || '0', 10),
        index: parseInt(el.dataset.index, 10),
        metadata: {
          src: media?.src || media?.dataset?.src || '',
          title: el.querySelector('.gallery-title')?.textContent || '',
          category: el.dataset.category || '',
          type: el.querySelector('video') ? 'video' : 'image',
          originalIndex: parseInt(el.dataset.index, 10)
        }
      };
    });

    // Event Delegation: Single listener for the entire grid
    grid.addEventListener('click', (e) => {
      const itemEl = e.target.closest('.gallery-item');
      if (!itemEl) return;

      const overlay = e.target.closest('.gallery-overlay');
      const video = itemEl.querySelector('video');
      const isVideo = !!video;

      // Logic:
      // 1. If video and NOT clicking overlay -> toggle play (handled by VideoHover)
      // 2. Otherwise (image OR clicking video overlay) -> open Lightbox
      if (isVideo && !overlay) return;

      const originalIndex = parseInt(itemEl.dataset.index, 10);
      const index = this.visibleData.findIndex(d => d.originalIndex === originalIndex);
      if (index !== -1) Core.Lightbox.open(index, this.visibleData);
    });
  },

  // No longer used, replaced by O(1) this.visibleData lookup
  getVisibleData() {
    return this.visibleData;
  },
  
  filterGallery(category) {
    this.activeCategory = category;
    
    // Update category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
      const isActive = btn.dataset.category === category;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive);
    });
    
    let matchCount = 0;
    let shownCount = 0;
    const toShow = [];
    const toHide = [];
    const newVisibleData = [];

    // Use cached items instead of DOM queries for O(N) performance
    this.itemsCache.forEach(item => {
      const isMatch = category === 'all' || item.category === category;
      let shouldShow = false;

      if (isMatch) {
        matchCount++;
        if (category === 'all') {
          if (shownCount < this.currentLimit) {
            shouldShow = true;
            shownCount++;
          }
        } else {
          if (item.order < this.currentLimit) {
            shouldShow = true;
            shownCount++;
          }
        }
      }

      // Check current visibility to avoid redundant GSAP calls
      const isCurrentlyVisible = item.el.offsetParent !== null;

      if (shouldShow) {
        if (!isCurrentlyVisible) toShow.push(item.el);
        newVisibleData.push(item.metadata);
      } else {
        if (isCurrentlyVisible) toHide.push(item.el);
      }
    });

    // Update visibility data cache for Lightbox (O(1) access)
    this.visibleData = newVisibleData;

    // Batch GSAP animations to minimize frame overhead
    if (window.gsap) {
      if (toShow.length) {
        gsap.to(toShow, {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          display: 'block',
          ease: "power2.out",
          overwrite: true,
          stagger: toShow.length > 20 ? 0.01 : 0 // Only stagger large batches
        });
      }
      if (toHide.length) {
        gsap.to(toHide, {
          opacity: 0,
          scale: 0.95,
          duration: 0.3,
          display: 'none',
          ease: "power2.out",
          overwrite: true
        });
      }
    } else {
      toShow.forEach(el => { el.style.display = 'block'; el.style.opacity = '1'; });
      toHide.forEach(el => { el.style.display = 'none'; el.style.opacity = '0'; });
    }

    const hasHidden = matchCount > shownCount;
    const grid = document.getElementById('gallery-grid');
    if (grid) {
      grid.classList.toggle('layout-centered', category === 'cinematics');
    }

    const moreContainer = document.getElementById('portfolio-more');
    if (moreContainer) {
      const isVisible = moreContainer.offsetParent !== null;
      if (hasHidden !== isVisible) {
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
