/**
 * PORTFOLIO GALLERY SYSTEM
 */

// ========================================
// CONSTANTS & UTILITIES
// ========================================
const PORTFOLIO_CATEGORY_ORDER = [
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

const CATEGORY_WEIGHTS = new Map(PORTFOLIO_CATEGORY_ORDER.map(function(cat, i) { return [cat, i]; }));
const CATEGORY_NAME_CACHE = new Map();

function formatPortfolioCategoryName(slug) {
  if (!slug) return '';
  let formatted = CATEGORY_NAME_CACHE.get(slug);
  if (formatted !== undefined) return formatted;

  formatted = slug
    .split('-')
    .map(function(word) { return word.charAt(0).toUpperCase() + word.slice(1); })
    .join(' ');

  CATEGORY_NAME_CACHE.set(slug, formatted);
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
    return function() { this.listeners.delete(callback); }.bind(this);
  }

  patchState(updates) {
    const self = this;
    Object.keys(updates).forEach(function(key) {
      if (self.hasOwnProperty(key)) {
        self[key] = updates[key];
      }
    });
    this.notify();
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach(function(cb) { cb(state); });
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

    const self = this;
    this.animationFrame = requestAnimationFrame(function() {
      self._renderSync(items, category);
    });
  }

  _renderSync(items, category) {
    const state = this.state.getState();
    if (items.length === 0 && (state.isLoading || state.hasError)) return;

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < items.length; i++) {
      const element = this.createGalleryItem(items[i], i);
      if (element) {
        fragment.appendChild(element);
      }
    }

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
    article.className = 'gallery-item ' + (isVideo ? 'gallery-item--video' : 'gallery-item--image');
    article.dataset.index = index;
    article.dataset.category = item.category || '';
    article.setAttribute('tabindex', '0');
    article.setAttribute('role', 'listitem');
    article.setAttribute('aria-label', (item.title || 'Gallery item') + (isVideo ? ' (video)' : ''));

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

      media.addEventListener('loadedmetadata', function() {
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

      media.addEventListener('load', function() {
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
    overlay.innerHTML = '<h3 class="gallery-item-title">' + (item.title || '') + '</h3><p class="gallery-item-category">' + formatPortfolioCategoryName(item.category) + '</p>';
    article.appendChild(overlay);

    const self = this;
    article.addEventListener('click', function(e) {
      if (e.target.closest('video') && e.target !== media) return;
      self.openLightbox(index);
    });

    article.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        self.openLightbox(index);
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

  openLightbox(index) {
    if (!window.Core || !window.Core.Lightbox) return;

    const state = this.state.getState();
    const items = state.filteredList.length > 0 ? state.filteredList : state.mediaList;

    const lightboxItems = items.map(function(item, i) {
      const enriched = Object.assign({}, item);
      enriched.type = item.type || 'image';
      enriched.originalIndex = i;
      return enriched;
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
      items.forEach(function(item, index) {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.5s ease ' + (index * 0.05) + 's, transform 0.5s ease ' + (index * 0.05) + 's';

        setTimeout(function() {
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        }, 50);
      });
    }
  }

  showLoading() {
    this.container.innerHTML = '<div class="gallery-loading-state"><div class="gallery-loading-spinner"></div><p>Loading portfolio...</p></div>';
  }

  showError(message) {
    this.container.innerHTML = '<div class="gallery-error-state"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg><h3>Failed to load portfolio</h3><p>' + message + '</p><button class="gallery-retry-btn" onclick="window.PortfolioGallery.retry()">Try Again</button></div>';
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

    const self = this;
    mediaContainer.addEventListener('touchstart', function(e) {
      if (e.touches.length !== 1) return;
      self.touchStartX = e.touches[0].clientX;
      self.touchCurrentX = e.touches[0].clientX;
    }, { passive: true });

    mediaContainer.addEventListener('touchmove', function(e) {
      if (e.touches.length !== 1) return;
      self.touchCurrentX = e.touches[0].clientX;
    }, { passive: true });

    mediaContainer.addEventListener('touchend', function() {
      const deltaX = self.touchCurrentX - self.touchStartX;
      if (Math.abs(deltaX) < self.touchThreshold) return;
      if (self.navigationDebounce) return;

      self.navigationDebounce = true;
      setTimeout(function() {
        self.navigationDebounce = false;
      }, self.debounceDelay);

      if (deltaX < -self.touchThreshold) {
        self.navigate(1);
      } else if (deltaX > self.touchThreshold) {
        self.navigate(-1);
      }
    });
  }

  navigate(direction) {
    if (!window.Core || !window.Core.Lightbox) return;
    if (this.navigationDebounce) return;

    this.navigationDebounce = true;
    const self = this;
    setTimeout(function() {
      self.navigationDebounce = false;
    }, this.debounceDelay);

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
    const self = this;

    chips.forEach(function(chip) {
      chip.addEventListener('click', function() {
        self.setActiveChip(chip);
        const category = chip.dataset.category;
        self.filterByCategory(category);
      });

      chip.addEventListener('keydown', function(e) {
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
    chips.forEach(function(chip) {
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

    const filtered = allItems.filter(function(item) {
      return item.category === category ||
      (item.categories && item.categories.indexOf(category) !== -1);
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
    const container = this.chipsContainer;

    container.addEventListener('mousedown', function(e) {
      isDown = true;
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
      container.style.cursor = 'grabbing';
    });

    container.addEventListener('mouseleave', function() {
      isDown = false;
      container.style.cursor = 'grab';
    });

    container.addEventListener('mouseup', function() {
      isDown = false;
      container.style.cursor = 'grab';
    });

    container.addEventListener('mousemove', function(e) {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 2;
      container.scrollLeft = scrollLeft - walk;
    });

    container.style.scrollbarWidth = 'none';
    container.style.msOverflowStyle = 'none';
    const style = document.createElement('style');
    style.textContent = '.filter-chips-container::-webkit-scrollbar { display: none; }';
    document.head.appendChild(style);
  }

  selectFromURL() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');

    if (category) {
      const chip = this.chipsContainer.querySelector('[data-category="' + category + '"]');
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

  async init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() { this.setup(); }.bind(this));
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

      const self = this;
      this.state.subscribe(function(state) {
        self.renderer.render(state.filteredList, state.activeCategory);
      });

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
    if (!response.ok) throw new Error('Failed to fetch portfolio data');
    return response.json();
  }

  processData(data) {
    const allItems = [];
    const portfolio = data.portfolio || {};
    const images = portfolio.images || {};
    const keys = Object.keys(images);

    for (let i = 0; i < keys.length; i++) {
      const category = keys[i];
      const items = images[category];
      if (Array.isArray(items)) {
        const catName = formatPortfolioCategoryName(category);
        const catWeight = CATEGORY_WEIGHTS.get(category);
        const weight = catWeight !== undefined ? catWeight : 999;
        for (let j = 0; j < items.length; j++) {
          const item = items[j];
          item.category = category;
          item.order = j;
          item._catWeight = weight;
          item.id = item.id || (category + '-' + j);
          item.title = item.title || (catName + ' ' + (j + 1));
          item.alt = item.alt || item.title || (catName + ' photography');
          item.type = item.type || 'image';
          allItems.push(item);
        }
      }
    }

    allItems.sort(function(a, b) {
      if (a._catWeight !== b._catWeight) return a._catWeight - b._catWeight;
      return a.order - b.order;
    });

    return allItems;
  }

  retry() {
    this.state = new GalleryState();
    this.setup();
  }
}

window.PortfolioGallery = new PortfolioGallery();
