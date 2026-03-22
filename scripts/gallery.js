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
    return Array.from(document.querySelectorAll('.gallery-item'))
      .filter(item => {
        // Optimization: Use offsetParent instead of getComputedStyle to avoid layout thrashing.
        // offsetParent is null if element or any ancestor is display: none.
        // Also check inline style for opacity if possible, but display: none is the primary filter.
        return item.offsetParent !== null && item.style.opacity !== '0';
      })
      .map(item => {
        const media = item.querySelector('img, video');
        const src = media?.src || media?.dataset?.src || '';
        return {
          src,
          title: item.querySelector('.gallery-title')?.textContent, // textContent is faster than innerText
          category: item.dataset.category,
          type: item.querySelector('video') ? 'video' : 'image',
          originalIndex: parseInt(item.dataset.index, 10)
        };
      });
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

    const toShow = [];
    const toHide = [];

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

      if (shouldShow) {
        toShow.push(item);
      } else {
        toHide.push(item);
      }
    });

    // Optimization: Batch GSAP animations to avoid overhead of 1200+ individual calls
    if (window.gsap) {
      if (toShow.length > 0) {
        gsap.to(toShow, {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          display: 'block',
          ease: "power2.out",
          overwrite: true
        });
      }
      if (toHide.length > 0) {
        gsap.to(toHide, {
          opacity: 0,
          scale: 0.95,
          duration: 0.4,
          display: 'none',
          ease: "power2.out",
          overwrite: true
        });
      }
    } else {
      // Graceful fallback without GSAP
      toShow.forEach(item => {
        item.style.display = 'block';
        item.style.opacity = '1';
      });
      toHide.forEach(item => {
        item.style.display = 'none';
        item.style.opacity = '0';
      });
    }

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
