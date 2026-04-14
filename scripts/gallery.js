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

    // Lightbox Click (Event Delegation)
    grid.addEventListener('click', (e) => {
      const item = e.target.closest('.gallery-item');
      if (item && !e.target.closest('video')) {
        const visibleItems = this.getVisibleData();

        // Find by matching src as index might vary if DOM/Data out of sync
        // media.src returns absolute URL, so we use getAttribute('src') for relative path matching
        const media = item.querySelector('img, video');
        const targetSrc = media?.getAttribute('src') || media?.dataset?.src;
        const index = visibleItems.findIndex(d => d.src === targetSrc);

        if (index !== -1) Core.Lightbox.open(index, visibleItems);
      }
    });

    // Integrated Hover Effects removed
  },

  getVisibleData() {
    // High-performance data retrieval using pre-processed data
    // This avoids O(N) DOM scraping and layout-sensitive reads
    if (window.contentLoader && window.contentLoader.allImages) {
      const category = this.activeCategory;
      const limit = this.currentLimit;

      return window.contentLoader.allImages
        .filter(img => {
          const isMatch = category === 'all' || img.category === category;
          if (!isMatch) return false;

          // Check against current visible limit
          if (category === 'all') {
             // In 'all' view, we just check global count (rendered in order)
             // But wait, the filterGallery logic uses a global count for 'all'.
             // We need to mirror that logic exactly.
             return true; // We'll slice later
          } else {
             return img.order < limit;
          }
        })
        .slice(0, category === 'all' ? limit : Infinity)
        .map((img, index) => ({
          ...img,
          index // Lightbox expects the current visible index
        }));
    }

    // Fallback to DOM scraping if data not yet loaded
    return Array.from(document.querySelectorAll('.gallery-item'))
      .filter(item => item.offsetParent !== null)
      .map((item, index) => {
        const media = item.querySelector('img, video');
        return {
          src: media?.src || media?.dataset?.src || '',
          title: item.querySelector('.gallery-title')?.textContent,
          category: item.dataset.category,
          type: item.querySelector('video') ? 'video' : 'image',
          index
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
