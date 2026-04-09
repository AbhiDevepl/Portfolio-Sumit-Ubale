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

    // Lightbox Click via Event Delegation to avoid attaching 1,200+ individual listeners
    grid.addEventListener('click', (e) => {
      const item = e.target.closest('.gallery-item');
      if (item && !e.target.closest('video')) {
        const visibleItems = this.getVisibleData();
        const itemIndex = parseInt(item.dataset.index, 10);
        const index = visibleItems.findIndex(d => d.originalIndex === itemIndex);
        if (index !== -1) Core.Lightbox.open(index, visibleItems);
      }
    });
  },

  getVisibleData() {
    // Map currently visible items for the Lightbox
    // Use offsetParent !== null instead of getComputedStyle to avoid layout thrashing
    return Array.from(document.querySelectorAll('.gallery-item'))
      .filter(el => {
        const isVisible = el.offsetParent !== null;
        if (!isVisible) return false;
        // Check opacity for items currently animating out
        return parseFloat(el.style.opacity || '1') > 0.1;
      })
      .map(el => {
        const media = el.querySelector('img, video');
        return {
          src: media?.src || media?.dataset?.src || '',
          title: el.querySelector('.gallery-title')?.textContent || '',
          category: el.dataset.category,
          type: !!el.querySelector('video') ? 'video' : 'image',
          originalIndex: parseInt(el.dataset.index, 10)
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
    
    let matchCount = 0;
    let shownCount = 0;

    // Toggle visibility based on category and limit
    document.querySelectorAll('.gallery-item').forEach(el => {
      const itemCategory = el.dataset.category;
      const itemOrder = parseInt(el.dataset.order || '0', 10);
      const isMatch = category === 'all' || itemCategory === category;
      
      let shouldShow = false;
      if (isMatch) {
        matchCount++;
        
        if (category === 'all') {
          if (shownCount < this.currentLimit) {
            shouldShow = true;
            shownCount++;
          }
        } else {
          if (itemOrder < this.currentLimit) {
            shouldShow = true;
            shownCount++;
          }
        }
      }

      if (window.gsap) {
        gsap.to(el, {
          opacity: shouldShow ? 1 : 0,
          scale: shouldShow ? 1 : 0.95,
          duration: 0.4,
          display: shouldShow ? 'block' : 'none',
          ease: "power2.out",
          overwrite: true
        });
      } else {
        el.style.display = shouldShow ? 'block' : 'none';
        el.style.opacity = shouldShow ? '1' : '0';
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
