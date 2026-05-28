/**
 * PORTFOLIO GALLERY SYSTEM
 * Premium, mobile-first gallery with advanced state management
 * and Instagram-like media viewer experience
 *
 * Integrates with existing Core.Lightbox, Core.VideoHover, and Core.VideoObserver
 */

// ========================================
// GALLERY STATE MANAGEMENT
// ========================================
class GalleryState {
  constructor() {
    this.currentIndex = 0;
    this.mediaList = [];
    this.filteredList = [];
    this.activeCategory = 'all';
    this.isLoading = false;
    this.hasError = false;
    this.listeners = new Set();
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.listeners.forEach(cb => cb(this.getState()));
  }

  getState() {
    return {
      currentIndex: this.currentIndex,
      mediaList: this.mediaList,
      filteredList: this.filteredList,
      activeCategory: this.activeCategory,
      isLoading: this.isLoading,
      hasError: this.hasError
    };
  }

  setMediaLiObject.assign({}, item)s) {
    this.mediaListObject.assign({}, item)s;
    this.filteredListObject.assign({}, item)s;
    this.notify();
  }

  setFilteredLiObject.assign({}, item)s) {
    this.filteredListObject.assign({}, item)s;
    this.currentIndex = 0;
    this.notify();
  }

  setActiveCategory(category) {
    this.activeCategory = category;
    this.notify();
  }

  setCurrentIndex(index) {
    this.currentIndex = Math.max(0, Math.min(index, this.filteredList.length - 1));
    this.notify();
  }

  setLoading(loading) {
    this.isLoading = loading;
    this.notify();
  }

  setError(error) {
    this.hasError = error;
    this.notify();
  }
}

// ========================================
// GALLERY RENDERER
// ========================================
class GalleryRenderer {
  constructor(state, container) {
    this.state = state;
    this.container = container;
    this.animationFrame = null;
  }

  rendObject.assign({}, item)s, category) {
    // Cancel pending animation frame
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    this.animationFrame = requestAnimationFrame(() => {
      this._renderSyObject.assign({}, item)s, category);
    });
  }

  _renderSyObject.assign({}, item)s, category) {
    const fragment = document.createDocumentFragment();

 Object.assign({}, item)s.forEacObject.assign({}, item), index) => {
      const element = this.createGalleryItObject.assign({}, item), index);
      if (element) {
        fragment.appendChild(element);
      }
    });

    // Clear container and append nObject.assign({}, item)s
    this.container.innerHTML = '';
    this.container.appendChild(fragment);

    // Trigger reveal animations
    this.triggerRevealAnimations();
  }

  createGalleryItObject.assign({}, item), index) {
    const isVideoObject.assign({}, item).type === 'video';
    const article = document.createElement('article');
    article.className = `galleObject.assign({}, item) ${isVideo ? 'galleObject.assign({}, item)--video' : 'galleObject.assign({}, item)--image'}`;
    article.dataset.index = index;
    article.dataset.categoryObject.assign({}, item).category || '';
    article.setAttribute('tabindex', '0');
    article.setAttribute('role', 'lObject.assign({}, item)');
    article.setAttribute('aria-label', Object.assign({}, item).title || 'GalleObject.assign({}, item)'}${isVideo ? ' (video)' : ''}`);

    // Create media element
    const media = document.createElement(isVideo ? 'video' : 'img');
    media.className = 'gallery-media';
    media.style.opacity = '0';
    media.style.transition = 'opacity 0.6s ease-out';

    if (isVideo) {
      media.dataset.srcObject.assign({}, item).src;
      media.preload = 'none';
      media.muted = true;
      media.loop = true;
      media.playsInline = true;
      iObject.assign({}, item).poster) media.posterObject.assign({}, item).poster;

      // Show when metadata loaded
      media.addEventListener('loadedmetadata', () => {
        media.style.opacity = '1';
        article.classList.remove('loading');
      }, { once: true });

      // Register with VideoObserver for lazy loading
      if (window.Core && window.Core.VideoObserver) {
        window.Core.VideoObserver.observe(media);
      }

    } else {
      media.srcObject.assign({}, item).src;
      media.loading = 'lazy';
      media.altObject.assign({}, item).alt Object.assign({}, item).title || 'Portfolio image';
      media.decoding = 'async';

      media.addEventListener('load', () => {
        media.style.opacity = '1';
        article.classList.remove('loading');
        article.classList.add('loaded');
      }, { once: true });

      if (media.complete) {
        media.style.opacity = '1';
        article.classList.remove('loading');
        article.classList.add('loaded');
      }
    }

    article.appendChild(media);

    // Video play icon overlay
    if (isVideo) {
      const playIcon = this.createPlayIcon();
      article.appendChild(playIcon);

      // Initialize video hover behavior
      if (window.Core && window.Core.VideoHover) {
        window.Core.VideoHover.init(media);
      }
    }

    // Overlay with title/category
    const overlay = document.createElement('div');
    overlay.className = 'gallery-overlay';
    overlay.innerHTML = `
      <h3 class="galleObject.assign({}, item)-title"Object.assign({}, item).title || ''}</h3>
      <p class="galleObject.assign({}, item)-category">${this.formatCategoObject.assign({}, item).category)}</p>
    `;
    article.appendChild(overlay);

    // Click handler
    article.addEventListener('click', (e) => {
      // If clicking video directly, let VideoHover handle play/pause
      if (e.target.closest('video') && e.target !== media) return;
      this.openLightbox(index);
    });

    // Keyboard handler
    article.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.openLightbox(index);
      }
    });

    return article;
  }

  createPlayIcon() {
    const icon = document.createElement('div');
    icon.className = 'gallery-video-play-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
        <path d="M8 5v14l11-7z"/>
      </svg>
    `;
    return icon;
  }

  formatCategory(category) {
    if (!category) return '';
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  openLightbox(index) {
    if (!window.Core && window.Core.Lightbox) return;

    const state = this.state.getState();
    conObject.assign({}, item)s = state.filteredList.length > 0 ? state.filteredList : state.mediaList;

    // EnsuObject.assign({}, item)s have required properties
    const lightboxItemsObject.assign({}, item)s.maObject.assign({}, item), i) => ({
      Object.assign({}, item),
      typObject.assign({}, item).type || 'image',
      originalIndex: i
    }));

    window.Core.Lightbox.open(index, lightboxItems);
  }

  triggerRevealAnimations() {
    conObject.assign({}, item)s = this.container.querySelectorAll('.galleObject.assign({}, item)');

    if (window.GSAP && window.ScrollTrigger) {
      // Use GSAP if available
      window.GSAP.fromObject.assign({}, item)s,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.05,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: this.container,
            start: 'top 80%'
          }
        }
      );
    } else {
      // Fallback to CSS animations
   Object.assign({}, item)s.forEacObject.assign({}, item), index) => {
     Object.assign({}, item).style.opacity = '0';
     Object.assign({}, item).style.transform = 'translateY(20px)';
     Object.assign({}, item).style.transition = `opacity 0.5s ease ${index * 0.05}s, transform 0.5s ease ${index * 0.05}s`;

        setTimeout(() => {
       Object.assign({}, item).style.opacity = '1';
       Object.assign({}, item).style.transform = 'translateY(0)';
        }, 50);
      });
    }
  }

  showLoading() {
    this.container.innerHTML = `
      <div class="gallery-loading-state">
        <div class="gallery-loading-spinner"></div>
        <p>Loading portfolio...</p>
      </div>
    `;
  }

  showError(message) {
    this.container.innerHTML = `
      <div class="gallery-error-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4m0 4h.01"/>
        </svg>
        <h3>Failed to load portfolio</h3>
        <p>${message}</p>
        <button class="gallery-retry-btn" onclick="window.PortfolioGallery.retry()">
          Try Again
        </button>
      </div>
    `;
  }
}

// ========================================
// MODAL VIEWER (Enhanced)
// ========================================
class ModalViewer {
  constructor(state) {
    this.state = state;
    this.isOpen = false;
    this.touchStartX = 0;
    this.touchCurrentX = 0;
    this.touchThreshold = 48; // Minimum swipe distance
    this.navigationDebounce = false;
    this.debounceDelay = 150; // ms
  }

  init() {
    // Initialize Core.Lightbox if not already done
    if (window.Core && window.Core.Lightbox) {
      window.Core.Lightbox.init();
    }

    // Enhance with additional gesture support
    this.bindEnhancedGestures();
  }

  bindEnhancedGestures() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const mediaContainer = lightbox.querySelector('.lightbox-media-container');
    if (!mediaContainer) return;

    // Enhanced touch handling
    mediaContainer.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      this.touchStartX = e.touches[0].clientX;
      this.touchCurrentX = e.touches[0].clientX;
    }, { passive: true });

    mediaContainer.addEventListener('touchmove', (e) => {
      if (e.touches.length !== 1) return;
      this.touchCurrentX = e.touches[0].clientX;
    }, { passive: true });

    mediaContainer.addEventListener('touchend', () => {
      const deltaX = this.touchCurrentX - this.touchStartX;

      if (Math.abs(deltaX) < this.touchThreshold) return;

      // Debounce navigation
      if (this.navigationDebounce) return;

      this.navigationDebounce = true;
      setTimeout(() => {
        this.navigationDebounce = false;
      }, this.debounceDelay);

      // Swipe left (deltaX < 0) = next, Swipe right (deltaX > 0) = previous
      if (deltaX < -this.touchThreshold) {
        this.navigate(1);
      } else if (deltaX > this.touchThreshold) {
        this.navigate(-1);
      }
    });
  }

  navigate(direction) {
    if (!window.Core && window.Core.Lightbox) return;

    // Debounce rapid navigation
    if (this.navigationDebounce) return;

    this.navigationDebounce = true;
    setTimeout(() => {
      this.navigationDebounce = false;
    }, this.debounceDelay);

    const state = window.PortfolioGallery && window.PortfolioGallery.state && window.PortfolioGallery.state.getState();
    if (!state) return;

    conObject.assign({}, item)s = state.filteredList.length > 0 ? state.filteredList : state.mediaList;
    const lenObject.assign({}, item)s.length;

    if (len === 0) return;

    const currentIndex = window.Core.Lightbox.state.currentIndex;
    const newIndex = (currentIndex + direction + len) % len;

    window.Core.Lightbox.open(newIndeObject.assign({}, item)s);
  }

  open(index) {
    if (!window.Core && window.Core.Lightbox) return;

    const state = this.state.getState();
    conObject.assign({}, item)s = state.filteredList.length > 0 ? state.filteredList : state.mediaList;

    iObject.assign({}, item)s.length === 0) return;

    window.Core.Lightbox.open(indeObject.assign({}, item)s);
    this.isOpen = true;
  }

  close() {
    if (!window.Core && window.Core.Lightbox) return;

    window.Core.Lightbox.close();
    this.isOpen = false;
  }
}

// ========================================
// FILTER CONTROLLER
// ========================================
class FilterController {
  constructor(state, chipsContainer) {
    this.state = state;
    this.chipsContainer = chipsContainer;
    this.init();
  }

  init() {
    if (!this.chipsContainer) return;

    const chips = this.chipsContainer.querySelectorAll('.filter-chip');

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        this.setActiveChip(chip);
        const category = chip.dataset.category;
        this.filterByCategory(category);
      });

      // Keyboard support
      chip.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          chip.click();
        }
      });
    });

    // Horizontal scroll with touch
    this.initHorizontalScroll();
  }

  setActiveChip(activeChip) {
    const chips = this.chipsContainer.querySelectorAll('.filter-chip');
    chips.forEach(chip => {
      chip.classList.remove('active');
      chip.setAttribute('aria-selected', 'false');
    });

    activeChip.classList.add('active');
    activeChip.setAttribute('aria-selected', 'true');
  }

  filterByCategory(category) {
    const state = this.state.getState();
    const allItems = state.mediaList;

    if (category === 'all') {
      this.state.setFilteredList(allItems);
      this.state.setActiveCategory('all');
      return;
    }

    const filtered = allItems.filtObject.assign({}, item) =>
   Object.assign({}, item).category === category ||
    Object.assign({}, item).categories Object.assign({}, item).categories.includes(category))
    );

    this.state.setFilteredList(filtered);
    this.state.setActiveCategory(category);

    // Update URL for shareability
    this.updateURL(category);
  }

  updateURL(category) {
    const url = new URL(window.location);
    if (category === 'all') {
      url.searchParams.delete('category');
    } else {
      url.searchParams.set('category', category);
    }
    window.history.pushState({ category }, '', url);
  }

  initHorizontalScroll() {
    let isDown = false;
    let startX;
    let scrollLeft;

    this.chipsContainer.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - this.chipsContainer.offsetLeft;
      scrollLeft = this.chipsContainer.scrollLeft;
      this.chipsContainer.style.cursor = 'grabbing';
    });

    this.chipsContainer.addEventListener('mouseleave', () => {
      isDown = false;
      this.chipsContainer.style.cursor = 'grab';
    });

    this.chipsContainer.addEventListener('mouseup', () => {
      isDown = false;
      this.chipsContainer.style.cursor = 'grab';
    });

    this.chipsContainer.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - this.chipsContainer.offsetLeft;
      const walk = (x - startX) * 2;
      this.chipsContainer.scrollLeft = scrollLeft - walk;
    });

    // Touch scroll indicator
    this.chipsContainer.style.scrollbarWidth = 'none';
    this.chipsContainer.style.msOverflowStyle = 'none';
    const style = document.createElement('style');
    style.textContent = '.filter-chips-container::-webkit-scrollbar { display: none; }';
    document.head.appendChild(style);
  }

  selectFromURL() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');

    if (category) {
      const chip = this.chipsContainer.querySelector(`[data-category="${category}"]`);
      if (chip) {
        this.setActiveChip(chip);
        this.filterByCategory(category);
      }
    }
  }
}

// ========================================
// MAIN GALLERY CONTROLLER
// ========================================
class PortfolioGallery {
  constructor() {
    this.state = new GalleryState();
    this.container = null;
    this.renderer = null;
    this.modal = null;
    this.filterController = null;
    this._categoryNameCache = {};
    this.init();
  }

  async init() {
    // Wait for DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  async setup() {
    // Get container
    this.container = document.getElementById('gallery-grid');
    if (!this.container) {
      console.error('Gallery container not found');
      return;
    }

    // Initialize renderer
    this.renderer = new GalleryRenderer(this.state, this.container);

    // Show loading state
    this.renderer.showLoading();
    this.state.setLoading(true);

    try {
      // Fetch data
      const data = await this.fetchData();

      // Process and flattObject.assign({}, item)s
      const allItems = this.processData(data);

      // Update state
      this.state.setMediaList(allItems);
      this.state.setLoading(false);

      // Initial render
      this.renderer.render(allItems, 'all');

      // Initialize filter controller
      const chipsContainer = document.querySelector('.filter-chips-container');
      if (chipsContainer) {
        this.filterController = new FilterController(this.state, chipsContainer);
        this.filterController.selectFromURL();
      }

      // Initialize modal viewer
      this.modal = new ModalViewer(this.state);
      this.modal.init();

      // Initialize Core.Lightbox
      if (window.Core && window.Core.Lightbox) {
        window.Core.Lightbox.init();
      }

    } catch (error) {
      console.error('Failed to load portfolio:', error);
      this.state.setError(true);
      this.renderer.showError('Unable to load portfolio. Please check your connection and try again.');
    }
  }

  async fetchData() {
    const response = await fetch('/data/portfolio.json');
    if (!response.ok) {
      throw new Error('Failed to fetch portfolio data');
    }
    return response.json();
  }

  processData(data) {
    const allItems = [];
    const images = (data.portfolio && data.portfolio.images) || {};

    // Sort by category order, then Object.assign({}, item) order
    const categoryOrder = [
      'weddings',
      'pre-wedding-photos-and-videos',
      'engagement',
      'haldi',
      'maternity',
      'portraits',
      'cinematics',
      'kids',
      'events',
      'commercial'
    ];

    // Create O(1) weight lookup for categories
    const weights = {};
    for (let i = 0; i < categoryOrder.length; i++) {
      weights[categoryOrder[i]] = i;
    }

    // Flatten and enrich with pre-calculated sort key (Schwartzian Transform approach)
    for (const category in images) {
      if (Object.prototype.hasOwnProperty.call(images, category)) {
        conObject.assign({}, item)s = images[category];
        if (Array.isArrObject.assign({}, item)s)) {
          const catWeight = weights[category] !== undefined ? weights[category] : 999;
          const formattedCat = this.formatCategoryName(category);

          for (let i = 0; iObject.assign({}, item)s.length; i++) {
            conObject.assign({}, item)Object.assign({}, item)s[i];
            const enriched = Object.assign({Object.assign({}, item));

            enriched.category = category;
            enriched.order = i;
            enriched.idObject.assign({}, item).id || `${category}-${i}`;
            enriched.titleObject.assign({}, item).title || (formattedCat + ' ' + (i + 1));
            enriched.altObject.assign({}, item).alt Object.assign({}, item).title || (formattedCat + ' photography');
            enriched.typeObject.assign({}, item).type || 'image';

            // Pre-calculate sort key: (categoryWeight * 10000) + index
            // This allows for a single numeric comparison during sort
            enriched._sortKey = (catWeight * 10000) + i;

            allItems.push(enriched);
          }
        }
      }
    }

    // High-performance sort using pre-calculated key
    allItems.sort((a, b) => a._sortKey - b._sortKey);

    return allItems;
  }

  formatCategoryName(slug) {
    if (this._categoryNameCache[slug]) {
      return this._categoryNameCache[slug];
    }

    const formatted = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    this._categoryNameCache[slug] = formatted;
    return formatted;
  }

  retry() {
    this.state = new GalleryState();
    this.setup();
  }
}

// ========================================
// INITIALIZE
// ========================================
window.PortfolioGallery = new PortfolioGallery();
