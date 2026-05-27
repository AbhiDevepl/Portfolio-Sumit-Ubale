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
    this.listeners = [];
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  patchState(updates) {
    Object.assign(this, updates);
    this.notify();
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach(cb => cb(state));
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

  setMediaList(items) {
    this.patchState({
      mediaList: items,
      filteredList: items
    });
  }

  setFilteredList(items) {
    this.patchState({
      filteredList: items,
      currentIndex: 0
    });
  }

  setActiveCategory(category) {
    this.patchState({ activeCategory: category });
  }

  setCurrentIndex(index) {
    const nextIndex = Math.max(0, Math.min(index, this.filteredList.length - 1));
    this.patchState({ currentIndex: nextIndex });
  }

  setLoading(loading) {
    this.patchState({ isLoading: loading });
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

  render(items, category) {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    this.animationFrame = requestAnimationFrame(() => {
      this._renderSync(items, category);
    });
  }

  _renderSync(items, category) {
    const fragment = document.createDocumentFragment();

    items.forEach((item, index) => {
      const element = this.createGalleryItem(item, index);
      if (element) {
        fragment.appendChild(element);
      }
    });

    // Clear container and append new items
    this.container.innerHTML = '';
    this.container.appendChild(fragment);

    // Trigger reveal animations
    this.triggerRevealAnimations();
  }

  createGalleryItem(item, index) {
    const isVideo = item.type === 'video';
    const article = document.createElement('article');
    article.className = `gallery-item ${isVideo ? 'gallery-item--video' : 'gallery-item--image'}`;
    article.dataset.index = index;
    article.dataset.category = item.category || '';
    article.setAttribute('tabindex', '0');
    article.setAttribute('role', 'listitem');
    article.setAttribute('aria-label', `${item.title || 'Gallery item'}${isVideo ? ' (video)' : ''}`);

    // Create media element
    const media = document.createElement(isVideo ? 'video' : 'img');
    media.className = 'gallery-media';
    media.style.opacity = '0';
    media.style.transition = 'opacity 0.6s ease-out';

    if (isVideo) {
      media.dataset.src = item.src;
      media.preload = 'none';
      media.muted = true;
      media.loop = true;
      media.playsInline = true;
      if (item.poster) media.poster = item.poster;

      media.addEventListener('loadedmetadata', () => {
        media.style.opacity = '1';
        article.classList.remove('loading');
      }, { once: true });

      if (window.Core && window.Core.VideoObserver) {
        window.Core.VideoObserver.observe(media);
      }
    } else {
      media.src = item.src;
      media.loading = 'lazy';
      media.alt = item.alt || item.title || 'Portfolio image';
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

    if (isVideo) {
      const playIcon = this.createPlayIcon();
      article.appendChild(playIcon);

      if (window.Core && window.Core.VideoHover) {
        window.Core.VideoHover.init(media);
      }
    }

    const overlay = document.createElement('div');
    overlay.className = 'gallery-overlay';
    overlay.innerHTML = `
      <h3 class="gallery-item-title">${item.title || ''}</h3>
      <p class="gallery-item-category">${this.formatCategory(item.category)}</p>
    `;
    article.appendChild(overlay);

    article.addEventListener('click', (e) => {
      if (e.target.closest('video') && e.target !== media) return;
      this.openLightbox(index);
    });

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
    icon.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>';
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
    if (!window.Core || !window.Core.Lightbox) return;

    const state = this.state.getState();
    const items = state.filteredList.length > 0 ? state.filteredList : state.mediaList;

    const lightboxItems = items.map((item, i) => {
      return Object.assign({}, item, {
        type: item.type || 'image',
        originalIndex: i
      });
    });

    window.Core.Lightbox.open(index, lightboxItems);
  }

  triggerRevealAnimations() {
    const items = this.container.querySelectorAll('.gallery-item');

    if (window.GSAP && window.ScrollTrigger) {
      window.GSAP.fromTo(items,
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
      items.forEach((item, i) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = `opacity 0.5s ease ${i * 0.05}s, transform 0.5s ease ${i * 0.05}s`;

        setTimeout(() => {
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
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
    this.touchThreshold = 48;
    this.navigationDebounce = false;
    this.debounceDelay = 150;
  }

  init() {
    if (window.Core && window.Core.Lightbox) {
      window.Core.Lightbox.init();
    }
    this.bindEnhancedGestures();
  }

  bindEnhancedGestures() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const mediaContainer = lightbox.querySelector('.lightbox-media-container');
    if (!mediaContainer) return;

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
      if (this.navigationDebounce) return;

      this.navigationDebounce = true;
      setTimeout(() => { this.navigationDebounce = false; }, this.debounceDelay);

      if (deltaX < -this.touchThreshold) {
        this.navigate(1);
      } else if (deltaX > this.touchThreshold) {
        this.navigate(-1);
      }
    });
  }

  navigate(direction) {
    if (!window.Core || !window.Core.Lightbox) return;
    if (this.navigationDebounce) return;

    this.navigationDebounce = true;
    setTimeout(() => { this.navigationDebounce = false; }, this.debounceDelay);

    if (!window.PortfolioGallery || !window.PortfolioGallery.state) return;
    const state = window.PortfolioGallery.state.getState();
    if (!state) return;

    const items = state.filteredList.length > 0 ? state.filteredList : state.mediaList;
    const len = items.length;

    if (len === 0) return;

    const currentIndex = window.Core.Lightbox.state.currentIndex;
    const newIndex = (currentIndex + direction + len) % len;

    window.Core.Lightbox.open(newIndex, items);
  }

  open(index) {
    if (!window.Core || !window.Core.Lightbox) return;

    const state = this.state.getState();
    const items = state.filteredList.length > 0 ? state.filteredList : state.mediaList;

    if (items.length === 0) return;

    window.Core.Lightbox.open(index, items);
    this.isOpen = true;
  }

  close() {
    if (!window.Core || !window.Core.Lightbox) return;
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

      chip.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          chip.click();
        }
      });
    });

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

    const filtered = allItems.filter(item => {
      return item.category === category || (item.categories && item.categories.indexOf(category) !== -1);
    });

    this.state.setFilteredList(filtered);
    this.state.setActiveCategory(category);
    this.updateURL(category);
  }

  updateURL(category) {
    const url = new URL(window.location);
    if (category === 'all') {
      url.searchParams.delete('category');
    } else {
      url.searchParams.set('category', category);
    }
    window.history.pushState({ category: category }, '', url);
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

    this.chipsContainer.style.scrollbarWidth = 'none';
    this.chipsContainer.style.msOverflowStyle = 'none';
    const style = document.createElement('style');
    style.textContent = '.filter-chips-container::-webkit-scrollbar { display: none; }';
    (document.head || document.getElementsByTagName('head')[0]).appendChild(style);
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
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  async setup() {
    this.container = document.getElementById('gallery-grid');
    if (!this.container) return;

    this.renderer = new GalleryRenderer(this.state, this.container);
    this.renderer.showLoading();
    this.state.setLoading(true);

    try {
      const data = await this.fetchData();
      const allItems = this.processData(data);

      this.state.setMediaList(allItems);
      this.state.setLoading(false);

      this.renderer.render(allItems, 'all');

      const chipsContainer = document.querySelector('.filter-chips-container');
      if (chipsContainer) {
        this.filterController = new FilterController(this.state, chipsContainer);
        this.filterController.selectFromURL();
      }

      this.modal = new ModalViewer(this.state);
      this.modal.init();

      if (window.Core && window.Core.Lightbox) {
        window.Core.Lightbox.init();
      }

    } catch (error) {
      console.error('Failed to load portfolio:', error);
      this.state.setError(true);
      this.renderer.showError('Unable to load portfolio. Please try again later.');
    }
  }

  async fetchData() {
    const response = await fetch('/data/portfolio.json');
    if (!response.ok) throw new Error('Failed to fetch portfolio data');
    return response.json();
  }

  /**
   * Process and flatten portfolio data with optimized sorting
   * Uses Schwartzian Transform for O(N log N) performance
   */
  processData(data) {
    const images = (data.portfolio && data.portfolio.images) ? data.portfolio.images : {};

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

    const weights = {};
    categoryOrder.forEach((cat, i) => { weights[cat] = i; });

    const transformed = [];
    Object.keys(images).forEach(category => {
      const items = images[category];
      if (Array.isArray(items)) {
        const weight = weights[category] !== undefined ? weights[category] : categoryOrder.length;
        items.forEach((item, j) => {
          const enriched = Object.assign({}, item, {
            category: category,
            order: j,
            id: item.id || `${category}-${j}`,
            title: item.title || `${this.formatCategoryName(category)} ${j + 1}`,
            alt: item.alt || item.title || `${this.formatCategoryName(category)} photography`,
            type: item.type || 'image'
          });

          transformed.push({
            item: enriched,
            sortKey: (weight * 1000000) + j
          });
        });
      }
    });

    return transformed
      .sort((a, b) => a.sortKey - b.sortKey)
      .map(t => t.item);
  }

  formatCategoryName(slug) {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  retry() {
    this.state = new GalleryState();
    this.setup();
  }
}

window.PortfolioGallery = new PortfolioGallery();
