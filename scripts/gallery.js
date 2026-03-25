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
    // Optimization: Use offsetParent to check for visibility instead of expensive getComputedStyle.
    // Elements with display: none will have offsetParent === null.
    // We also check inline opacity which is set by GSAP during filtering.
    // Using .textContent instead of .innerText for better performance as it avoids layout reflows.
    return Array.from(document.querySelectorAll('.gallery-item'))
      .filter(item => {
        const isVisible = item.offsetParent !== null;
        if (!isVisible) return false;

        // If GSAP has set an inline opacity, respect it.
        // Otherwise assume 1 if not explicitly hidden.
        const inlineOpacity = item.style.opacity;
        if (inlineOpacity !== "" && parseFloat(inlineOpacity) <= 0.1) return false;

        return true;
      })
      .map(item => {
        const media = item.querySelector('img, video');
        const src = media?.src || media?.dataset?.src || '';
        return {
          src,
          title: item.querySelector('.gallery-title')?.textContent,
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
