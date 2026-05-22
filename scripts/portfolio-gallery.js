/**
 * PORTFOLIO GALLERY SYSTEM
 * Premium, mobile-first gallery with advanced state management
 * and Instagram-like media viewer experience
 *
 * Integrates with existing Core.Lightbox, Core.VideoHover, and Core.VideoObserver
 */

// ========================================
// PERFORMANCE CONSTANTS & CACHES
// ========================================

/**
 * Category order for sorting.
 * Unknown categories sort to the top (index -1).
 */
const PORTFOLIO_CATEGORY_ORDER = [
  'weddings',
  'perwedding',
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

/**
 * O(1) weight lookup for categories.
 * Using Map for better performance in the sort comparator.
 */
const CATEGORY_WEIGHTS = new Map();
PORTFOLIO_CATEGORY_ORDER.forEach((cat, index) => {
  CATEGORY_WEIGHTS.set(cat, index);
});

/**
 * Memoization cache for formatted category names.
 */
const FORMATTED_CATEGORY_CACHE = new Map();

/**
 * Helper to format category names with memoization.
 */
function formatPortfolioCategoryName(slug) {
  if (!slug) return '';
  if (FORMATTED_CATEGORY_CACHE.has(slug)) {
    return FORMATTED_CATEGORY_CACHE.get(slug);
  }
  const formatted = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  FORMATTED_CATEGORY_CACHE.set(slug, formatted);
  return formatted;
}

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

  /**
   * Batch multiple state updates into a single notification.
   */
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
    this.mediaList = items;
    this.filteredList = items;
    this.notify();
  }

  setFilteredList(items) {
    this.filteredList = items;
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

  render(items, category) {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    this.animationFrame = requestAnimationFrame(() => {
      this._renderSync(items, category);
    });
  }

  /**
   * Optimized DOM update using DocumentFragment and replaceChildren.
   */
  _renderSync(items, category) {
    const fragment = document.createDocumentFragment();

    items.forEach((item, index) => {
      const element = this.createGalleryItem(item, index);
      if (element) {
        fragment.appendChild(element);
      }
    });

    // High-performance DOM clearing and replacement
    if (this.container.replaceChildren) {
      this.container.replaceChildren(fragment);
    } else {
      this.container.innerHTML = '';
      this.container.appendChild(fragment);
    }

    this.triggerRevealAnimations();
  }

  createGalleryItem(item, index) {
    const isVideo = item.type === 'video';
    const article = document.createElement('article');
    article.className = `gallery-item ${isVideo ? 'gallery-item--video' : 'gallery-item--image'} loading`;
    article.dataset.index = index;
    article.dataset.category = item.category || '';
    article.setAttribute('tabindex', '0');
    article.setAttribute('role', 'listitem');
    article.setAttribute('aria-label', `${item.title || 'Gallery item'}${isVideo ? ' (video)' : ''}`);

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

      if (window.Core?.VideoObserver) {
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

      if (window.Core?.VideoHover) {
        window.Core.VideoHover.init(media);
      }
    }

    const overlay = document.createElement('div');
    overlay.className = 'gallery-overlay';
    overlay.innerHTML = `
      <h3 class="gallery-item-title">${item.title || ''}</h3>
      <p class="gallery-item-category">${item.displayCategory || formatPortfolioCategoryName(item.category)}</p>
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
    icon.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
        <path d="M8 5v14l11-7z"/>
      </svg>
    `;
    return icon;
  }

  openLightbox(index) {
    if (!window.Core?.Lightbox) return;

    const state = this.state.getState();
    const items = state.filteredList.length > 0 ? state.filteredList : state.mediaList;

    const lightboxItems = items.map((item, i) => ({
      ...item,
      type: item.type || 'image',
      originalIndex: i
    }));

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
          stagger: {
            amount: 1.5 // Cap total stagger duration for large lists
          },
          ease: 'power2.out',
          scrollTrigger: {
            trigger: this.container,
            start: 'top 80%'
          }
        }
      );
    } else {
      items.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        const delay = Math.min(index * 0.05, 2); // Cap delay
        item.style.transition = `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`;

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
    this.touchThreshold = 48; // Minimum swipe distance
    this.navigationDebounce = false;
    this.debounceDelay = 150; // ms
  }

  init() {
    if (window.Core?.Lightbox) {
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

      if (deltaX < -this.touchThreshold) {
        this.navigate(1);
      } else if (deltaX > this.touchThreshold) {
        this.navigate(-1);
      }
    });
  }

  navigate(direction) {
    if (!window.Core?.Lightbox) return;
    if (this.navigationDebounce) return;

    this.navigationDebounce = true;
    setTimeout(() => {
      this.navigationDebounce = false;
    }, this.debounceDelay);

    const state = window.PortfolioGallery?.state?.getState();
    if (!state) return;

    const items = state.filteredList.length > 0 ? state.filteredList : state.mediaList;
    const len = items.length;
    if (len === 0) return;

    const currentIndex = window.Core.Lightbox.state.currentIndex;
    const newIndex = (currentIndex + direction + len) % len;

    window.Core.Lightbox.open(newIndex, items);
  }

  open(index) {
    if (!window.Core?.Lightbox) return;
    const state = this.state.getState();
    const items = state.filteredList.length > 0 ? state.filteredList : state.mediaList;
    if (items.length === 0) return;

    window.Core.Lightbox.open(index, items);
    this.isOpen = true;
  }

  close() {
    if (window.Core?.Lightbox) {
      window.Core.Lightbox.close();
      this.isOpen = false;
    }
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
      this.state.patchState({
        filteredList: allItems,
        activeCategory: 'all',
        currentIndex: 0
      });
      return;
    }

    const filtered = allItems.filter(item =>
      item.category === category ||
      (Array.isArray(item.categories) && item.categories.includes(category))
    );

    this.state.patchState({
      filteredList: filtered,
      activeCategory: category,
      currentIndex: 0
    });

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
    this.unsub = null;
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

    // Ensure we only have one subscription active
    if (this.unsub) this.unsub();
    this.unsub = this.state.subscribe((state) => {
      if (state.isLoading || state.hasError) return;
      this.renderer.render(state.filteredList, state.activeCategory);
    });

    try {
      this.state.setLoading(true);
      const data = await this.fetchData();
      const allItems = this.processData(data);

      this.state.patchState({
        mediaList: allItems,
        filteredList: allItems,
        isLoading: false
      });

      const chipsContainer = document.querySelector('.filter-chips-container');
      if (chipsContainer) {
        this.filterController = new FilterController(this.state, chipsContainer);
        this.filterController.selectFromURL();
      }

      this.modal = new ModalViewer(this.state);
      this.modal.init();

      if (window.Core?.Lightbox) {
        window.Core.Lightbox.init();
      }

    } catch (error) {
      console.error('Failed to load portfolio:', error);
      this.state.patchState({ hasError: true, isLoading: false });
      this.renderer.showError('Unable to load portfolio. Please try again.');
    }
  }

  async fetchData() {
    const response = await fetch('/data/portfolio.json');
    if (!response.ok) throw new Error('Fetch failed');
    return response.json();
  }

  /**
   * Optimized data processing using a Schwartzian Transform.
   * Pre-calculates category weights and memoized display names.
   */
  processData(data) {
    const allItems = [];
    const images = data.portfolio?.images || {};

    Object.keys(images).forEach((category) => {
      const items = images[category];
      if (Array.isArray(items)) {
        // Unknown categories sort to -1 (top) to match legacy indexOf behavior
        const catWeight = CATEGORY_WEIGHTS.has(category) ? CATEGORY_WEIGHTS.get(category) : -1;
        const displayCategory = formatPortfolioCategoryName(category);

        items.forEach((item, index) => {
          allItems.push({
            ...item,
            category,
            order: index,
            _catWeight: catWeight,
            displayCategory,
            id: item.id || `${category}-${index}`,
            title: item.title || `${displayCategory} ${index + 1}`,
            alt: item.alt || item.title || `${displayCategory} photography`,
            type: item.type || 'image'
          });
        });
      }
    });

    allItems.sort((a, b) => {
      if (a._catWeight !== b._catWeight) {
        return a._catWeight - b._catWeight;
      }
      return (a.order || 0) - (b.order || 0);
    });

    return allItems;
  }

  retry() {
    this.setup();
  }
}

// ========================================
// INITIALIZE
// ========================================
window.PortfolioGallery = new PortfolioGallery();
