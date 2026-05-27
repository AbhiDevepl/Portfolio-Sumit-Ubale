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
    var self = this;
    return function() {
      var index = self.listeners.indexOf(callback);
      if (index > -1) {
        self.listeners.splice(index, 1);
      }
    };
  }

  patchState(updates) {
    Object.assign(this, updates);
    this.notify();
  }

  notify() {
    var state = this.getState();
    for (var i = 0; i < this.listeners.length; i++) {
      this.listeners[i](state);
    }
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
    var nextIndex = Math.max(0, Math.min(index, this.filteredList.length - 1));
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

    var self = this;
    this.animationFrame = requestAnimationFrame(function() {
      self._renderSync(items, category);
    });
  }

  _renderSync(items, category) {
    var fragment = document.createDocumentFragment();

    for (var i = 0; i < items.length; i++) {
      var element = this.createGalleryItem(items[i], i);
      if (element) {
        fragment.appendChild(element);
      }
    }

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
      var playIcon = this.createPlayIcon();
      article.appendChild(playIcon);

      if (window.Core && window.Core.VideoHover) {
        window.Core.VideoHover.init(media);
      }
    }

    var overlay = document.createElement('div');
    overlay.className = 'gallery-overlay';
    overlay.innerHTML = '<h3 class="gallery-item-title">' + (item.title || '') + '</h3>' +
                        '<p class="gallery-item-category">' + this.formatCategory(item.category) + '</p>';
    article.appendChild(overlay);

    var self = this;
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

    var lightboxItems = items.map(function(item, i) {
      return Object.assign({}, item, {
        type: item.type || 'image',
        originalIndex: i
      });
    });

    window.Core.Lightbox.open(index, lightboxItems);
  }

  triggerRevealAnimations() {
    var items = this.container.querySelectorAll('.gallery-item');

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
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.5s ease ' + (i * 0.05) + 's, transform 0.5s ease ' + (i * 0.05) + 's';

        (function(el) {
          setTimeout(function() {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }, 50);
        })(item);
      }
    }
  }

  showLoading() {
    this.container.innerHTML = '<div class="gallery-loading-state">' +
                               '<div class="gallery-loading-spinner"></div>' +
                               '<p>Loading portfolio...</p>' +
                               '</div>';
  }

  showError(message) {
    this.container.innerHTML = '<div class="gallery-error-state">' +
        '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
          '<circle cx="12" cy="12" r="10"/>' +
          '<path d="M12 8v4m0 4h.01"/>' +
        '</svg>' +
        '<h3>Failed to load portfolio</h3>' +
        '<p>' + message + '</p>' +
        '<button class="gallery-retry-btn" onclick="window.PortfolioGallery.retry()">' +
          'Try Again' +
        '</button>' +
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
    var lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    var mediaContainer = lightbox.querySelector('.lightbox-media-container');
    if (!mediaContainer) return;

    var self = this;
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
      if (self.navigationDebounce) return;

      self.navigationDebounce = true;
      setTimeout(function() { self.navigationDebounce = false; }, self.debounceDelay);

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

    var self = this;
    this.navigationDebounce = true;
    setTimeout(function() { self.navigationDebounce = false; }, this.debounceDelay);

    if (!window.PortfolioGallery || !window.PortfolioGallery.state) return;
    var state = window.PortfolioGallery.state.getState();
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
    if (!this.chipsContainer) return;

    var chips = this.chipsContainer.querySelectorAll('.filter-chip');
    var self = this;

    for (var i = 0; i < chips.length; i++) {
      (function(chip) {
        chip.addEventListener('click', function() {
          self.setActiveChip(chip);
          var category = chip.dataset.category;
          self.filterByCategory(category);
        });

        chip.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            chip.click();
          }
        });
      })(chips[i]);
    }

    this.initHorizontalScroll();
  }

  setActiveChip(activeChip) {
    var chips = this.chipsContainer.querySelectorAll('.filter-chip');
    for (var i = 0; i < chips.length; i++) {
      var chip = chips[i];
      chip.classList.remove('active');
      chip.setAttribute('aria-selected', 'false');
    }

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
    var isDown = false;
    var startX;
    var scrollLeft;
    var self = this;

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

    this.chipsContainer.style.scrollbarWidth = 'none';
    this.chipsContainer.style.msOverflowStyle = 'none';
    var style = document.createElement('style');
    style.textContent = '.filter-chips-container::-webkit-scrollbar { display: none; }';
    (document.head || document.getElementsByTagName('head')[0]).appendChild(style);
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
    var self = this;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() { self.setup(); });
    } else {
      this.setup();
    }
  }

  async setup() {
    this.container = document.getElementById('gallery-grid');
    if (!this.container) return;

    this.renderer = new GalleryRenderer(this.state, this.container);

    // Subscribe to state changes for reactive rendering
    var self = this;
    this.state.subscribe(function(state) {
      if (state.isLoading || state.hasError) return;
      self.renderer.render(state.filteredList, state.activeCategory);
    });

    this.renderer.showLoading();
    this.state.setLoading(true);

    try {
      var data = await this.fetchData();
      var allItems = this.processData(data);

      this.state.setMediaList(allItems);
      this.state.setLoading(false);

      var chipsContainer = document.querySelector('.filter-chips-container');
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
    var response = await fetch('/data/portfolio.json');
    if (!response.ok) throw new Error('Failed to fetch portfolio data');
    return response.json();
  }

  /**
   * Process and flatten portfolio data with optimized sorting
   * Uses Schwartzian Transform for O(N log N) performance
   */
  processData(data) {
    var images = (data.portfolio && data.portfolio.images) ? data.portfolio.images : {};

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

    var weights = {};
    for (var i = 0; i < categoryOrder.length; i++) {
      weights[categoryOrder[i]] = i;
    }

    var transformed = [];
    var self = this;
    var categories = Object.keys(images);

    for (var i = 0; i < categories.length; i++) {
      var category = categories[i];
      var items = images[category];
      if (Array.isArray(items)) {
        var weight = weights[category] !== undefined ? weights[category] : categoryOrder.length;
        for (var j = 0; j < items.length; j++) {
          var item = items[j];
          var enriched = Object.assign({}, item, {
            category: category,
            order: j,
            id: item.id || (category + '-' + j),
            title: item.title || (self.formatCategoryName(category) + ' ' + (j + 1)),
            alt: item.alt || item.title || (self.formatCategoryName(category) + ' photography'),
            type: item.type || 'image'
          });

          transformed.push({
            item: enriched,
            sortKey: (weight * 1000000) + j
          });
        }
      }
    }

    transformed.sort(function(a, b) {
      return a.sortKey - b.sortKey;
    });

    var result = [];
    for (var i = 0; i < transformed.length; i++) {
      result.push(transformed[i].item);
    }
    return result;
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

window.PortfolioGallery = new PortfolioGallery();
