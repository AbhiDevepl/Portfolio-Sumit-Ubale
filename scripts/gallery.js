window.GalleryManager = {
  activeCategory: 'all',
  // Cache DOM elements for performance
  elements: {
    grid: null,
    items: [],
    categories: null,
    categoryBtns: [],
    moreContainer: null
  },
  
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
    this.elements.items = Array.from(document.querySelectorAll('.gallery-item'));
    this.elements.categories = document.querySelector('.portfolio-categories');
    this.elements.categoryBtns = Array.from(document.querySelectorAll('.category-btn'));
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

    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.onclick = () => {
        window.location.href = `/pages/gallery.html?category=${this.activeCategory}`;
      };
    }
    
    window.addEventListener('popstate', (e) => {
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

    // Integrated Hover Effects
    grid.addEventListener('mouseover', (e) => {
      const item = e.target.closest('.gallery-item');
      if (item) {
        const img = item.querySelector('.gallery-image');
        const overlay = item.querySelector('.gallery-overlay');
        gsap.to(img, { scale: 1.05, duration: 0.4, ease: "power2.out", overwrite: true });
        gsap.to(overlay, { opacity: 1, duration: 0.3, overwrite: true });
      }
    });

    grid.addEventListener('mouseout', (e) => {
      const item = e.target.closest('.gallery-item');
      if (item) {
        const img = item.querySelector('.gallery-image');
        const overlay = item.querySelector('.gallery-overlay');
        gsap.to(img, { scale: 1, duration: 0.4, ease: "power2.out", overwrite: true });
        gsap.to(overlay, { opacity: 0, duration: 0.3, overwrite: true });
      }
    });
  },

  // Cache of visible items' data to avoid repeated DOM lookups and layout thrashing
  visibleData: [],

  getVisibleData() {
    // Optimization: Return cached visible items instead of calculating via getComputedStyle
    return this.visibleData;
  },
  
  filterGallery(category) {
    this.activeCategory = category;
    
    // Use cached buttons
    this.elements.categoryBtns.forEach(btn => {
      const isActive = btn.dataset.category === category;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive);
    });
    
    let shownCount = 0;
    let hasHidden = false;
    const newVisibleData = [];

    const isHomepage = window.location.pathname === '/' || window.location.pathname === '/index.html' || window.location.pathname.endsWith('/');

    // Use cached items
    this.elements.items.forEach(item => {
      const itemCategory = item.dataset.category;
      const isMatch = category === 'all' || itemCategory === category;
      
      let shouldShow = false;
      if (isMatch) {
        if (isHomepage) {
          if (category === 'all') {
            // Homepage 'all': limit to first 3 items
            if (shownCount < 3) {
              shouldShow = true;
              shownCount++;
            } else {
              hasHidden = true;
            }
          } else {
            // Homepage category-specific: show all available (already limited to previews by ContentLoader)
            shouldShow = true;
            hasHidden = true;
          }
        } else {
          // Full Gallery Page: show all matching items
          shouldShow = true;
        }
      }

      if (shouldShow) {
        const media = item.querySelector('img, video');
        newVisibleData.push({
          src: media.src || media.dataset.src,
          title: item.querySelector('.gallery-title')?.innerText,
          category: item.dataset.category,
          type: item.querySelector('video') ? 'video' : 'image',
          originalIndex: parseInt(item.dataset.index)
        });
      }

      gsap.to(item, {
        opacity: shouldShow ? 1 : 0,
        scale: shouldShow ? 1 : 0.95,
        duration: 0.4,
        display: shouldShow ? 'block' : 'none',
        ease: "power2.out",
        overwrite: true
      });
    });

    // Update the cached visible data for Lightbox
    this.visibleData = newVisibleData;

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
    
    setTimeout(() => ScrollTrigger.refresh(), 500);
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
