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
    var self = this;
    return function() { self.listeners.delete(callback); };
  }

  notify() {
    var self = this;
    this.listeners.forEach(function(cb) { cb(self.getState()); });
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
    var self = this;
    // Cancel pending animation frame
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    this.animationFrame = requestAnimationFrame(function() {
      self._renderSync(items, category);
    });
  }

  _renderSync(items, category) {
    var self = this;
    var fragment = document.createDocumentFragment();

    items.forEach(function(item, index) {
      var element = self.createGalleryItem(item, index);
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
    var isVideo = item.type === 'video';
    var article = document.createElement('article');
    article.className = 'gallery-item ' + (isVideo ? 'gallery-item--video' : 'gallery-item--image');
    article.dataset.index = index;
    article.dataset.category = item.category || '';
    article.setAttribute('tabindex', '0');
    article.setAttribute('role', 'listitem');
    article.setAttribute('aria-label', (item.title || 'Gallery item') + (isVideo ? ' (video)' : ''));

    // Create media element
    var media = document.createElement(isVideo ? 'video' : 'img');
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

      // Show when metadata loaded
      media.addEventListener('loadedmetadata', function() {
        media.style.opacity = '1';
        article.classList.remove('loading');
      }, { once: true });

      // Register with VideoObserver for lazy loading
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

    // Video play icon overlay
    if (isVideo) {
      var playIcon = this.createPlayIcon();
      article.appendChild(playIcon);

      // Initialize video hover behavior
      if (window.Core && window.Core.VideoHover) {
        window.Core.VideoHover.init(media);
      }
    }

    // Overlay with title/category
    var overlay = document.createElement('div');
    overlay.className = 'gallery-overlay';

    var title = document.createElement('h3');
    title.className = 'gallery-item-title';
    title.textContent = item.title || '';

    var categoryEl = document.createElement('p');
    categoryEl.className = 'gallery-item-category';
    categoryEl.textContent = item.formattedCategory || this.formatCategory(item.category);

    overlay.appendChild(title);
    overlay.appendChild(categoryEl);
    article.appendChild(overlay);

    var self = this;
    // Click handler
    article.addEventListener('click', function(e) {
      // If clicking video directly, let VideoHover handle play/pause
      if (e.target.closest('video') && e.target !== media) return;
      self.openLightbox(index);
    });

    // Keyboard handler
    article.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        self.openLightbox(index);
      }
    });

    return article;
  }

  createPlayIcon() {
    var icon = document.createElement('div');
    icon.className = 'gallery-video-play-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>';
    return icon;
  }

  formatCategory(category) {
    if (!category) return '';
    if (window.PortfolioGallery && window.PortfolioGallery.formatCategoryName) {
        return window.PortfolioGallery.formatCategoryName(category);
    }
    return category
      .split('-')
      .map(function(word) { return word.charAt(0).toUpperCase() + word.slice(1); })
      .join(' ');
  }

  openLightbox(index) {
    if (!(window.Core && window.Core.Lightbox)) return;

    var state = this.state.getState();
    var items = state.filteredList.length > 0 ? state.filteredList : state.mediaList;

    // Ensure items have required properties
    var lightboxItems = items.map(function(item, i) {
      var newItem = {};
      Object.keys(item).forEach(function(key) { newItem[key] = item[key]; });
      newItem.type = item.type || 'image';
      newItem.originalIndex = i;
      return newItem;
    });

    window.Core.Lightbox.open(index, lightboxItems);
  }

  triggerRevealAnimations() {
    var items = this.container.querySelectorAll('.gallery-item');

    if (window.GSAP && window.ScrollTrigger) {
      // Use GSAP if available
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
      // Fallback to CSS animations
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
    var self = this;
    var lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    var mediaContainer = lightbox.querySelector('.lightbox-media-container');
    if (!mediaContainer) return;

    // Enhanced touch handling
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
      var deltaX = self.touchCurrentX - self.touchStartX;

      if (Math.abs(deltaX) < self.touchThreshold) return;

      // Debounce navigation
      if (self.navigationDebounce) return;

      self.navigationDebounce = true;
      setTimeout(function() {
        self.navigationDebounce = false;
      }, self.debounceDelay);

      // Swipe left (deltaX < 0) = next, Swipe right (deltaX > 0) = previous
      if (deltaX < -self.touchThreshold) {
        self.navigate(1);
      } else if (deltaX > self.touchThreshold) {
        self.navigate(-1);
      }
    });
  }

  navigate(direction) {
    if (!(window.Core && window.Core.Lightbox)) return;

    var self = this;
    // Debounce rapid navigation
    if (this.navigationDebounce) return;

    this.navigationDebounce = true;
    setTimeout(function() {
      self.navigationDebounce = false;
    }, this.debounceDelay);

    var globalPortfolio = window.PortfolioGallery;
    var state = (globalPortfolio && globalPortfolio.state && globalPortfolio.state.getState()) || null;
    if (!state) return;

    var items = state.filteredList.length > 0 ? state.filteredList : state.mediaList;
    var len = items.length;

    if (len === 0) return;

    var currentIndex = window.Core.Lightbox.state.currentIndex;
    var newIndex = (currentIndex + direction + len) % len;

    window.Core.Lightbox.open(newIndex, items);
  }

  open(index) {
    if (!(window.Core && window.Core.Lightbox)) return;

    var state = this.state.getState();
    var items = state.filteredList.length > 0 ? state.filteredList : state.mediaList;

    if (items.length === 0) return;

    window.Core.Lightbox.open(index, items);
    this.isOpen = true;
  }

  close() {
    if (!(window.Core && window.Core.Lightbox)) return;

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

    var self = this;
    var chips = this.chipsContainer.querySelectorAll('.filter-chip');

    chips.forEach(function(chip) {
      chip.addEventListener('click', function() {
        self.setActiveChip(chip);
        var category = chip.dataset.category;
        self.filterByCategory(category);
      });

      // Keyboard support
      chip.addEventListener('keydown', function(e) {
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
    var chips = this.chipsContainer.querySelectorAll('.filter-chip');
    chips.forEach(function(chip) {
      chip.classList.remove('active');
      chip.setAttribute('aria-selected', 'false');
    });

    activeChip.classList.add('active');
    activeChip.setAttribute('aria-selected', 'true');
  }

  filterByCategory(category) {
    var state = this.state.getState();
    var allItems = state.mediaList;

    if (category === 'all') {
      this.state.setFilteredList(allItems);
      this.state.setActiveCategory('all');
      return;
    }

    var filtered = allItems.filter(function(item) {
      return item.category === category || (item.categories && item.categories.indexOf(category) !== -1);
    });

    this.state.setFilteredList(filtered);
    this.state.setActiveCategory(category);

    // Update URL for shareability
    this.updateURL(category);
  }

  updateURL(category) {
    var url = new URL(window.location);
    if (category === 'all') {
      url.searchParams.delete('category');
    } else {
      url.searchParams.set('category', category);
    }
    window.history.pushState({ category: category }, '', url);
  }

  initHorizontalScroll() {
    var self = this;
    var isDown = false;
    var startX;
    var scrollLeft;

    this.chipsContainer.addEventListener('mousedown', function(e) {
      isDown = true;
      startX = e.pageX - self.chipsContainer.offsetLeft;
      scrollLeft = self.chipsContainer.scrollLeft;
      self.chipsContainer.style.cursor = 'grabbing';
    });

    this.chipsContainer.addEventListener('mouseleave', function() {
      isDown = false;
      self.chipsContainer.style.cursor = 'grab';
    });

    this.chipsContainer.addEventListener('mouseup', function() {
      isDown = false;
      self.chipsContainer.style.cursor = 'grab';
    });

    this.chipsContainer.addEventListener('mousemove', function(e) {
      if (!isDown) return;
      e.preventDefault();
      var x = e.pageX - self.chipsContainer.offsetLeft;
      var walk = (x - startX) * 2;
      self.chipsContainer.scrollLeft = scrollLeft - walk;
    });

    // Touch scroll indicator
    this.chipsContainer.style.scrollbarWidth = 'none';
    this.chipsContainer.style.msOverflowStyle = 'none';
    var style = document.createElement('style');
    style.textContent = '.filter-chips-container::-webkit-scrollbar { display: none; }';
    document.head.appendChild(style);
  }

  selectFromURL() {
    var params = new URLSearchParams(window.location.search);
    var category = params.get('category');

    if (category) {
      var chip = this.chipsContainer.querySelector('[data-category="' + category + '"]');
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
    var self = this;
    // Wait for DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() { self.setup(); });
    } else {
      this.setup();
    }
  }

  async setup() {
    var self = this;
    // Get container
    this.container = document.getElementById('gallery-grid');
    if (!this.container) {
      console.error('Gallery container not found');
      return;
    }

    // Initialize renderer
    this.renderer = new GalleryRenderer(this.state, this.container);

    // Subscribe renderer to state changes
    this.state.subscribe(function(state) {
      self.renderer.render(state.filteredList, state.activeCategory);
    });

    // Show loading state
    this.renderer.showLoading();
    this.state.setLoading(true);

    try {
      // Fetch data
      var data = await this.fetchData();

      // Process and flatten items
      var allItems = this.processData(data);

      // Update state
      this.state.setMediaList(allItems);
      this.state.setLoading(false);

      // Initial render handled by subscription if setup() completes after subscribe

      // Initialize filter controller
      var chipsContainer = document.querySelector('.filter-chips-container');
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
    var response = await fetch('/data/portfolio.json');
    if (!response.ok) {
      throw new Error('Failed to fetch portfolio data');
    }
    return response.json();
  }

  processData(data) {
    var allItems = [];
    var portfolio = data.portfolio || {};
    var images = portfolio.images || {};
    var weights = PortfolioGallery.CATEGORY_WEIGHTS;
    var formatCache = {};
    var self = this;

    // Flatten all category images
    var categories = Object.keys(images);
    for (var i = 0; i < categories.length; i++) {
        var category = categories[i];
        var items = images[category];
        if (Array.isArray(items)) {
            // Pre-calculate formatted category name once per category
            var formattedCategory = formatCache[category] || (formatCache[category] = self.formatCategoryName(category));
            var weight = weights[category] !== undefined ? weights[category] : 999;

            for (var j = 0; j < items.length; j++) {
                var item = items[j];
                var newItem = {};
                // Manual copy for compatibility
                Object.keys(item).forEach(function(key) { newItem[key] = item[key]; });

                newItem.category = category;
                newItem.order = j;
                newItem.formattedCategory = formattedCategory;
                newItem.weight = weight;
                newItem.id = item.id || (category + '-' + j);
                newItem.title = item.title || (formattedCategory + ' ' + (j + 1));
                newItem.alt = item.alt || newItem.title || (formattedCategory + ' photography');
                newItem.type = item.type || 'image';

                allItems.push(newItem);
            }
        }
    }

    // Sort by category weight, then by item order
    allItems.sort(function(a, b) {
      if (a.weight !== b.weight) {
        return a.weight - b.weight;
      }
      return (a.order || 0) - (b.order || 0);
    });

    return allItems;
  }

  formatCategoryName(slug) {
    if (!slug) return '';
    return slug
      .split('-')
      .map(function(word) { return word.charAt(0).toUpperCase() + word.slice(1); })
      .join(' ');
  }

  retry() {
    this.state = new GalleryState();
    this.setup();
  }
}

// ========================================
// INITIALIZE
// ========================================
PortfolioGallery.CATEGORY_ORDER = [
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

PortfolioGallery.CATEGORY_WEIGHTS = {};
PortfolioGallery.CATEGORY_ORDER.forEach(function(cat, index) {
  PortfolioGallery.CATEGORY_WEIGHTS[cat] = index;
});

window.PortfolioGallery = new PortfolioGallery();
