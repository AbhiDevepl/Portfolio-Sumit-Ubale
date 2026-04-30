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
      this.filterGallery(e.state?.category || 'all');
    });
  },

  initGalleryInteractions() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;
  },

  /**
   * Optimized getVisibleData to avoid O(N) DOM scraping
   * Maps visible DOM elements to pre-processed data on window.contentLoader
   */
  getVisibleData() {
    const allImages = window.contentLoader?.allImages;
    if (!allImages) return [];

    return Array.from(document.querySelectorAll('.gallery-item'))
      .filter(item => !item.classList.contains('is-hidden'))
      .map(item => {
        const idx = parseInt(item.dataset.index, 10);
        const data = allImages[idx];
        return {
          ...data,
          originalIndex: idx,
          index: idx // Backward compatibility
        };
      });
  },
  
  /**
   * Batch-optimized filtering to minimize layout thrashing and GSAP overhead
   */
  filterGallery(category) {
    this.activeCategory = category;
    
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => {
      const isActive = btn.dataset.category === category;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive);
    });
    
    const items = Array.from(document.querySelectorAll('.gallery-item'));
    const toShow = [];
    const toHide = [];

    items.forEach((item) => {
      const isMatch = category === 'all' || item.dataset.category === category;
      item.classList.toggle('is-filtered-in', isMatch);
      item.classList.toggle('is-filtered-out', !isMatch);

      if (isMatch) {
        toShow.push(item);
      } else {
        toHide.push(item);
      }
    });

    if (window.gsap) {
      // 1. Kill all current animations in one pass
      gsap.killTweensOf(items);

      // 2. Batch hide non-matching items
      if (toHide.length > 0) {
        gsap.to(toHide, {
          autoAlpha: 0,
          scale: 0.96,
          y: 10,
          duration: 0.24,
          ease: 'power2.out',
          stagger: 0.005, // Subtle stagger for performance and elegance
          onComplete: () => {
            toHide.forEach(item => {
              item.classList.add('is-hidden');
              item.style.display = 'none';
              item.style.pointerEvents = 'none';
            });
          }
        });
      }

      // 3. Batch show matching items
      if (toShow.length > 0) {
        toShow.forEach(item => {
          item.classList.remove('is-hidden');
          item.style.display = '';
          item.style.pointerEvents = 'auto';
        });

        gsap.fromTo(
          toShow,
          { autoAlpha: 0, scale: 0.96, y: 14 },
          {
            autoAlpha: 1,
            scale: 1,
            y: 0,
            duration: 0.35,
            ease: 'power2.out',
            stagger: 0.01,
            overwrite: true
          }
        );
      }
    } else {
      // Fallback if GSAP is not available
      toHide.forEach(item => {
        item.classList.add('is-hidden');
        item.style.display = 'none';
      });
      toShow.forEach(item => {
        item.classList.remove('is-hidden');
        item.style.display = '';
        item.style.opacity = '1';
        item.style.transform = 'scale(1)';
      });
    }

    this.filteredItems = toShow;

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
      moreContainer.style.display = 'none';
      moreContainer.style.opacity = '0';
    }
    
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
