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

  getVisibleData() {
    // Optimization: Use pre-processed allImages if available instead of DOM scraping
    const sourceData = this.allImages || (window.contentLoader && window.contentLoader.allImages);

    const visibleElements = Array.from(document.querySelectorAll('.gallery-item'))
      .filter(item => !item.classList.contains('is-hidden'));

    if (sourceData) {
      return visibleElements.map((item, index) => {
        const originalIndex = parseInt(item.dataset.index, 10);
        const data = sourceData[originalIndex];
        return {
          ...data,
          index, // Current index in filtered view
          originalIndex
        };
      });
    }

    // Fallback if data source is not yet available
    return visibleElements.map((item, index) => {
      const media = item.querySelector('img, video');
      const src = media?.src || media?.dataset?.src || '';
      return {
        src,
        title: item.querySelector('.gallery-title')?.textContent,
        category: item.querySelector('.gallery-category')?.textContent || item.dataset.category,
        type: item.querySelector('video') ? 'video' : 'image',
        poster: item.querySelector('video')?.poster || '',
        index,
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
      // Kill all active animations on items to prevent conflicts
      gsap.killTweensOf(items);

      // Batch hide animations
      if (toHide.length > 0) {
        gsap.to(toHide, {
          autoAlpha: 0,
          scale: 0.96,
          y: 10,
          duration: 0.24,
          ease: 'power2.out',
          stagger: toHide.length > 50 ? 0.001 : 0, // Very slight stagger for large sets
          onComplete: () => {
            toHide.forEach(el => {
              el.classList.add('is-hidden');
              el.style.display = 'none';
              el.style.pointerEvents = 'none';
            });
          }
        });
      }

      // Batch show animations
      if (toShow.length > 0) {
        toShow.forEach(el => {
          el.classList.remove('is-hidden');
          gsap.set(el, { display: '', pointerEvents: 'auto' });
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
            stagger: toShow.length > 50 ? 0.002 : 0.01 // Reduced stagger for large sets
          }
        );
      }
    } else {
      items.forEach(item => {
        const isMatch = category === 'all' || item.dataset.category === category;
        item.classList.toggle('is-hidden', !isMatch);
        item.style.display = isMatch ? '' : 'none';
        item.style.opacity = isMatch ? '1' : '0';
        item.style.transform = isMatch ? 'scale(1)' : 'scale(0.96)';
        item.style.pointerEvents = isMatch ? 'auto' : 'none';
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
