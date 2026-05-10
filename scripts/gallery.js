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
    const all = this.allImages || window.contentLoader?.allImages || [];
    return Array.from(document.querySelectorAll('.gallery-item'))
      .filter(item => !item.classList.contains('is-hidden'))
      .map(item => {
        const idx = parseInt(item.dataset.index, 10);
        // Use cached data for O(1) metadata retrieval, avoiding expensive DOM queries
        if (all[idx]) return { ...all[idx], originalIndex: idx };

        // Fallback if data is not yet loaded (should not happen after init)
        const media = item.querySelector('img, video');
        return {
          src: media?.src || media?.dataset?.src || '',
          title: item.querySelector('.gallery-title')?.textContent,
          category: item.querySelector('.gallery-category')?.textContent || item.dataset.category,
          type: item.querySelector('video') ? 'video' : 'image',
          poster: item.querySelector('video')?.poster || '',
          originalIndex: idx
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
      // Use batch animations instead of individual tweens to reduce main-thread overhead
      gsap.killTweensOf(items);

      if (toHide.length > 0) {
        gsap.to(toHide, {
          autoAlpha: 0,
          scale: 0.96,
          y: 10,
          duration: 0.24,
          ease: 'power2.out',
          overwrite: true,
          onComplete: () => {
            toHide.forEach(item => {
              item.classList.add('is-hidden');
              item.style.display = 'none';
              item.style.pointerEvents = 'none';
            });
          }
        });
      }

      if (toShow.length > 0) {
        toShow.forEach(item => {
          item.classList.remove('is-hidden');
          gsap.set(item, { display: '', pointerEvents: 'auto' });
        });

        gsap.fromTo(
          toShow,
          { autoAlpha: 0, scale: 0.96, y: 14 },
          {
            autoAlpha: 1,
            scale: 1,
            y: 0,
            duration: 0.35,
            stagger: {
              each: 0.015,
              from: "start"
            },
            ease: 'power2.out',
            overwrite: true
          }
        );
      }
    } else {
      // Fallback if GSAP is not available
      items.forEach(item => {
        const isMatch = toShow.includes(item);
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
