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
    return Array.from(document.querySelectorAll('.gallery-item'))
      .filter(item => !item.classList.contains('is-hidden'))
      .map(item => {
        const media = item.querySelector('img, video');
        const src = media?.src || media?.dataset?.src || '';
        return {
          src,
          title: item.querySelector('.gallery-title')?.textContent,
          category: item.querySelector('.gallery-category')?.textContent || item.dataset.category,
          type: item.querySelector('video') ? 'video' : 'image',
          poster: item.querySelector('video')?.poster || '',
          originalIndex: parseInt(item.dataset.index, 10)
        };
      });
  },
  
  filterGallery(category) {
    this.activeCategory = category;
    
    // 1. Update UI state for buttons
    const categoryBtns = document.querySelectorAll('.category-btn');
    for (let i = 0; i < categoryBtns.length; i++) {
      const btn = categoryBtns[i];
      const isActive = btn.dataset.category === category;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive);
    }
    
    const items = Array.from(document.querySelectorAll('.gallery-item'));
    const toShow = [];
    const toHide = [];

    // 2. Categorize items based on filter
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const isMatch = category === 'all' || item.dataset.category === category;

      item.classList.toggle('is-filtered-in', isMatch);
      item.classList.toggle('is-filtered-out', !isMatch);

      if (isMatch) {
        toShow.push(item);
      } else {
        toHide.push(item);
      }
    }

    this.filteredItems = toShow;

    // 3. Optimized Animations using GSAP Batching
    if (window.gsap) {
      // Kill all active tweens on items to prevent conflicts
      gsap.killTweensOf(items);

      // Handle items to hide
      if (toHide.length > 0) {
        gsap.to(toHide, {
          autoAlpha: 0,
          scale: 0.96,
          y: 10,
          duration: 0.2,
          ease: 'power2.out',
          stagger: {
            amount: Math.min(0.2, toHide.length * 0.01),
            from: "start"
          },
          onComplete: () => {
            toHide.forEach(el => {
              el.classList.add('is-hidden');
              el.style.display = 'none';
              el.style.pointerEvents = 'none';
            });
          }
        });
      }

      // Handle items to show
      if (toShow.length > 0) {
        toShow.forEach(el => {
          el.classList.remove('is-hidden');
          el.style.display = '';
          el.style.pointerEvents = 'auto';
        });

        gsap.fromTo(toShow,
          { autoAlpha: 0, scale: 0.96, y: 14 },
          {
            autoAlpha: 1,
            scale: 1,
            y: 0,
            duration: 0.3,
            ease: 'power2.out',
            stagger: {
              amount: Math.min(0.3, toShow.length * 0.02),
              from: "start"
            }
          }
        );
      }
    } else {
      // Fallback for no GSAP
      items.forEach(item => {
        const isMatch = toShow.includes(item);
        item.classList.toggle('is-hidden', !isMatch);
        item.style.display = isMatch ? '' : 'none';
        item.style.opacity = isMatch ? '1' : '0';
        item.style.transform = isMatch ? 'scale(1)' : 'scale(0.96)';
        item.style.pointerEvents = isMatch ? 'auto' : 'none';
      });
    }

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
