window.GalleryManager = {
  activeCategory: 'all',
  elements: {
    items: [],
    categoryBtns: [],
    grid: null,
    loadMoreBtn: null,
    moreContainer: null
  },
  visibleData: [], // O(1) access to currently visible items for Lightbox
  refreshTimeout: null,
  
  init() {
    this.cacheElements();
    this.initFiltering();
    this.initGalleryInteractions();
    Core.Lightbox.init();
    this.checkURLState();
    console.log('✅ Gallery Manager optimized');
  },

  cacheElements() {
    this.elements.grid = document.getElementById('gallery-grid');
    this.elements.items = Array.from(document.querySelectorAll('.gallery-item')).map(item => {
      // Pre-calculate metadata to avoid DOM lookups during interactions/filtering
      const media = item.querySelector('img, video');
      return {
        el: item,
        category: item.dataset.category,
        preview: item.dataset.preview === 'true',
        index: parseInt(item.dataset.index),
        data: {
          src: media.src || media.dataset.src,
          title: item.querySelector('.gallery-title')?.innerText,
          category: item.dataset.category,
          type: item.querySelector('video') ? 'video' : 'image',
          originalIndex: parseInt(item.dataset.index)
        }
      };
    });
    this.elements.categoryBtns = document.querySelectorAll('.category-btn');
    this.elements.loadMoreBtn = document.getElementById('load-more-btn');
    this.elements.moreContainer = document.getElementById('portfolio-more');
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

    if (this.elements.loadMoreBtn) {
      this.elements.loadMoreBtn.onclick = () => {
        window.location.href = `/pages/gallery.html?category=${this.activeCategory}`;
      };
    }
    
    window.addEventListener('popstate', (e) => {
      this.filterGallery(e.state?.category || 'all');
    });
  },

  initGalleryInteractions() {
    if (!this.elements.grid) return;

    // Lightbox Click - Performance: Uses pre-calculated visibleData
    this.elements.grid.addEventListener('click', (e) => {
      const item = e.target.closest('.gallery-item');
      if (item && !e.target.closest('video')) {
        const index = this.visibleData.findIndex(d => d.originalIndex === parseInt(item.dataset.index));
        if (index !== -1) Core.Lightbox.open(index, this.visibleData);
      }
    });

    // NOTE: JS hover effects removed in favor of CSS transitions in components.css
    // This reduces main-thread execution and improves scroll performance.
  },

  getVisibleData() {
    // Optimized: Returns pre-calculated array updated during filterGallery()
    return this.visibleData;
  },
  
  filterGallery(category) {
    this.activeCategory = category;
    this.visibleData = []; // Reset visibility tracking
    
    this.elements.categoryBtns.forEach(btn => {
      const isActive = btn.dataset.category === category;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive);
    });
    
    let shownCount = 0;
    let hasHidden = false;

    this.elements.items.forEach(itemObj => {
      const { el, category: itemCategory, preview: isPreview, data } = itemObj;
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

      if (shouldShow) {
        this.visibleData.push(data);
      }

      // Performance: Use GSAP with overwrite for clean state transitions
      gsap.to(el, {
        opacity: shouldShow ? 1 : 0,
        scale: shouldShow ? 1 : 0.95,
        duration: 0.4,
        display: shouldShow ? 'block' : 'none',
        ease: "power2.out",
        overwrite: true
      });
    });

    if (this.elements.grid) {
      if (category === 'cinematics') {
        this.elements.grid.classList.add('layout-centered');
      } else {
        this.elements.grid.classList.remove('layout-centered');
      }
    }

    if (this.elements.moreContainer) {
      gsap.to(this.elements.moreContainer, {
        display: hasHidden ? 'flex' : 'none', 
        opacity: hasHidden ? 1 : 0,
        duration: 0.3,
        overwrite: true
      });
    }
    
    // Performance: Debounce ScrollTrigger refresh
    if (this.refreshTimeout) clearTimeout(this.refreshTimeout);
    this.refreshTimeout = setTimeout(() => {
      if (window.ScrollTrigger) ScrollTrigger.refresh();
      this.refreshTimeout = null;
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
