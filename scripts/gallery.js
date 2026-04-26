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
    const visibleItems = Array.from(document.querySelectorAll('.gallery-item'))
      .filter(item => !item.classList.contains('is-hidden'));

    // PERFORMANCE: Use pre-processed data if available to avoid expensive DOM scraping
    if (window.contentLoader && window.contentLoader.allImages) {
      return visibleItems.map(item => {
        const globalIndex = parseInt(item.dataset.index, 10);
        const data = window.contentLoader.allImages[globalIndex];

        return {
          ...data,
          originalIndex: globalIndex // Used for Lightbox state
        };
      });
    }

    // Fallback: Scraping (slower, but functional if contentLoader isn't ready)
    return visibleItems.map(item => {
      const media = item.querySelector('img, video');
      return {
        src: media?.getAttribute('src') || media?.dataset?.src || '',
        title: item.querySelector('.gallery-title')?.textContent || '',
        category: item.querySelector('.gallery-category')?.textContent || item.dataset.category || '',
        type: item.querySelector('video') ? 'video' : 'image',
        poster: item.querySelector('video')?.getAttribute('poster') || '',
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
    const visibleItems = [];

    items.forEach((item) => {
      const isMatch = category === 'all' || item.dataset.category === category;
      item.classList.toggle('is-filtered-in', isMatch);
      item.classList.toggle('is-filtered-out', !isMatch);

      if (window.gsap) {
        gsap.killTweensOf(item);

        if (isMatch) {
          item.classList.remove('is-hidden');
          gsap.set(item, { display: '', pointerEvents: 'auto' });
          gsap.fromTo(
            item,
            { autoAlpha: 0, scale: 0.96, y: 14 },
            { autoAlpha: 1, scale: 1, y: 0, duration: 0.35, ease: 'power2.out', overwrite: true }
          );
        } else {
          gsap.to(item, {
            autoAlpha: 0,
            scale: 0.96,
            y: 10,
            duration: 0.24,
            ease: 'power2.out',
            overwrite: true,
            onComplete: () => {
              item.classList.add('is-hidden');
              item.style.display = 'none';
              item.style.pointerEvents = 'none';
            }
          });
        }
      } else {
        item.classList.toggle('is-hidden', !isMatch);
        item.style.display = isMatch ? '' : 'none';
        item.style.opacity = isMatch ? '1' : '0';
        item.style.transform = isMatch ? 'scale(1)' : 'scale(0.96)';
      }

      if (isMatch) {
        item.style.display = '';
        item.style.pointerEvents = 'auto';
        visibleItems.push(item);
      }
    });

    this.filteredItems = visibleItems;

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
