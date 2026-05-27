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
    var _this = this;
    return function() {
      var index = _this.listeners.indexOf(callback);
      if (index > -1) _this.listeners.splice(index, 1);
    };
  }

  notify() {
    var _this = this;
    var state = this.getState();
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
    var _this = this;
    // Cancel pending animation frame
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    this.animationFrame = requestAnimationFrame(function() {
      _this._renderSync(items, category);
    });
  }

  _renderSync(items, category) {
    var _this = this;
    var fragment = document.createDocumentFragment();

    items.forEach(function(item, index) {
      var element = _this.createGalleryItem(item, index);
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
    var _this = this;
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
    overlay.innerHTML = '<h3 class="gallery-item-title">' + (item.title || '') + '</h3>' +
                        '<p class="gallery-item-category">' + this.formatCategory(item.category) + '</p>';
    article.appendChild(overlay);

    // Click handler
    article.addEventListener('click', function(e) {
      // If clicking video directly, let VideoHover handle play/pause
      if (e.target.closest && e.target.closest('video') && e.target !== media) return;
      _this.openLightbox(index);
    });

    // Keyboard handler
    article.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        _this.openLightbox(index);
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
    return category
      .split('-')
      .map(function(word) { return word.charAt(0).toUpperCase() + word.slice(1); })
      .join(' ');
  }

  openLightbox(index) {
    if (!window.Core || !window.Core.Lightbox) return;

    var state = this.state.getState();
    var items = state.filteredList.length > 0 ? state.filteredList : state.mediaList;

    // Ensure items have required properties
    var lightboxItems = items.map(function(item, i) {
      var newItem = Object.assign({}, item);
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
    this.container.innerHTML = '<div class="gallery-error-state">' +
        '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
          '<circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>' +
        '</svg>' +
        '<h3>Failed to load portfolio</h3>' +
        '<p>' + message + '</p>' +
        '<button class="gallery-retry-btn" onclick="window.PortfolioGallery.retry()">Try Again</button>' +
      '</div>';
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
    var _this = this;
    var lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    var mediaContainer = lightbox.querySelector('.lightbox-media-container');
    if (!mediaContainer) return;

    // Enhanced touch handling
    mediaContainer.addEventListener('touchstart', function(e) {
      if (e.touches.length !== 1) return;
      _this.touchStartX = e.touches[0].clientX;
      _this.touchCurrentX = e.touches[0].clientX;
    }, { passive: true });

    mediaContainer.addEventListener('touchmove', function(e) {
      if (e.touches.length !== 1) return;
      _this.touchCurrentX = e.touches[0].clientX;
    }, { passive: true });

    mediaContainer.addEventListener('touchend', function() {
      var deltaX = _this.touchCurrentX - _this.touchStartX;

      if (Math.abs(deltaX) < _this.touchThreshold) return;

      // Debounce navigation
      if (_this.navigationDebounce) return;

      _this.navigationDebounce = true;
      setTimeout(function() {
        _this.navigationDebounce = false;
      }, _this.debounceDelay);

      // Swipe left (deltaX < 0) = next, Swipe right (deltaX > 0) = previous
      if (deltaX < -_this.touchThreshold) {
        _this.navigate(1);
      } else if (deltaX > _this.touchThreshold) {
        _this.navigate(-1);
      }
    });
  }

  navigate(direction) {
    var _this = this;
    if (!window.Core || !window.Core.Lightbox) return;

    // Debounce rapid navigation
    if (this.navigationDebounce) return;

    this.navigationDebounce = true;
    setTimeout(function() {
      _this.navigationDebounce = false;
    }, this.debounceDelay);

    var state = window.PortfolioGallery && window.PortfolioGallery.state && window.PortfolioGallery.state.getState();
    if (!state) return;

    var items = state.filteredList.length > 0 ? state.filteredList : state.mediaList;
    var len = items.length;

    if (len === 0) return;

    var currentIndex = window.Core.Lightbox.state.currentIndex;
    var newIndex = (currentIndex + direction + len) % len;

    window.Core.Lightbox.open(newIndex, items);
  }

  open(index) {
    if (!window.Core || !window.Core.Lightbox) return;

    var state = this.state.getState();
    var items = state.filteredList.length > 0 ? state.filteredList : state.mediaList;

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
    var _this = this;
    if (!this.chipsContainer) return;

    var chips = this.chipsContainer.querySelectorAll('.filter-chip');

    chips.forEach(function(chip) {
      chip.addEventListener('click', function() {
        _this.setActiveChip(chip);
        var category = chip.dataset.category;
        _this.filterByCategory(category);
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
      return item.category === category ||
      (item.categories && item.categories.indexOf(category) !== -1);
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
    var _this = this;
    var isDown = false;
    var startX;
    var scrollLeft;

    this.chipsContainer.addEventListener('mousedown', function(e) {
      isDown = true;
      startX = e.pageX - _this.chipsContainer.offsetLeft;
      scrollLeft = _this.chipsContainer.scrollLeft;
      _this.chipsContainer.style.cursor = 'grabbing';
    });

    this.chipsContainer.addEventListener('mouseleave', function() {
      isDown = false;
      _this.chipsContainer.style.cursor = 'grab';
    });

    this.chipsContainer.addEventListener('mouseup', function() {
      isDown = false;
      _this.chipsContainer.style.cursor = 'grab';
    });

    this.chipsContainer.addEventListener('mousemove', function(e) {
      if (!isDown) return;
      e.preventDefault();
      var x = e.pageX - _this.chipsContainer.offsetLeft;
      var walk = (x - startX) * 2;
      _this.chipsContainer.scrollLeft = scrollLeft - walk;
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

  init() {
    var _this = this;
    // Wait for DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() { _this.setup(); });
    } else {
      this.setup();
    }
  }

  setup() {
    var _this = this;
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

    return this.fetchData().then(function(data) {
      // Process and flatten items
      var allItems = _this.processData(data);

      // Update state
      _this.state.setMediaList(allItems);
      _this.state.setLoading(false);

      // Initial render
      _this.renderer.render(allItems, 'all');

      // Initialize filter controller
      var chipsContainer = document.querySelector('.filter-chips-container');
      if (chipsContainer) {
        _this.filterController = new FilterController(_this.state, chipsContainer);
        _this.filterController.selectFromURL();
      }

      // Initialize modal viewer
      _this.modal = new ModalViewer(_this.state);
      _this.modal.init();

      // Initialize Core.Lightbox
      if (window.Core && window.Core.Lightbox) {
        window.Core.Lightbox.init();
      }
    }).catch(function(error) {
      console.error('Failed to load portfolio:', error);
      _this.state.setError(true);
      _this.renderer.showError('Unable to load portfolio. Please check your connection and try again.');
    });
  }

  fetchData() {
    return fetch('/data/portfolio.json').then(function(response) {
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio data');
      }
      return response.json();
    });
  }

  processData(data) {
    var _this = this;
    var allItems = [];
    var images = (data.portfolio && data.portfolio.images) ? data.portfolio.images : {};

    // Flatten all category images
    Object.keys(images).forEach(function(category) {
      var items = images[category];
      if (Array.isArray(items)) {
        items.forEach(function(item, index) {
          var newItem = Object.assign({}, item);
          newItem.category = category;
          newItem.order = index;
          // Ensure consistent property names
          newItem.id = item.id || (category + '-' + index);
          newItem.title = item.title || (_this.formatCategoryName(category) + ' ' + (index + 1));
          newItem.alt = item.alt || item.title || (_this.formatCategoryName(category) + ' photography');
          newItem.type = item.type || 'image';
          allItems.push(newItem);
        });
      }
    });

    // Sort by category order, then by item order
    var categoryOrder = [
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

    allItems.sort(function(a, b) {
      var catA = categoryOrder.indexOf(a.category);
      var catB = categoryOrder.indexOf(b.category);

      if (catA !== catB) {
        return catA - catB;
      }

      return (a.order || 0) - (b.order || 0);
    });

    return allItems;
  }

  formatCategoryName(slug) {
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
window.PortfolioGallery = new PortfolioGallery();
