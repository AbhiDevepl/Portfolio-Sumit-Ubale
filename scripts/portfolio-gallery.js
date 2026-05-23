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
    // Cancel pending animation frame
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
    var self = this;

    items.forEach(function(item, index) {
      var element = self.createGalleryItem(item, index);
      if (element) {
        fragment.appendChild(element);
      }
    });

    // Clear container and append new items using high-performance replaceChildren
    if (this.container.replaceChildren) {
      this.container.replaceChildren(fragment);
    } else {
      this.container.innerHTML = '';
      this.container.appendChild(fragment);
    }

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

    // Overlay with title/category - Optimized: Using DOM API instead of innerHTML
    var overlay = document.createElement('div');
    overlay.className = 'gallery-overlay';

    var h3 = document.createElement('h3');
    h3.className = 'gallery-item-title';
    h3.textContent = item.title || '';

    var p = document.createElement('p');
    p.className = 'gallery-item-category';
    p.textContent = this.formatCategory(item.category);

    overlay.appendChild(h3);
    overlay.appendChild(p);
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

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '28');
    svg.setAttribute('height', '28');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'white');

    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M8 5v14l11-7z');

    svg.appendChild(path);
    icon.appendChild(svg);
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

    // Ensure items have required properties - Optimized: Using Object.assign
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
      // Use GSAP if available - Optimized: Cap total stagger duration to 1.5s for large galleries
      window.GSAP.fromTo(items,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: {
            amount: 1.5
          },
          ease: 'power2.out',
          scrollTrigger: {
            trigger: this.container,
            start: 'top 80%'
          }
        }
      );
    } else {
      // Fallback to CSS animations - Optimized: Cap transition delay to 2s
      items.forEach(function(item, index) {
        var delay = Math.min(index * 0.05, 2);
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.5s ease ' + delay + 's, transform 0.5s ease ' + delay + 's';

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
    var lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    var mediaContainer = lightbox.querySelector('.lightbox-media-container');
    if (!mediaContainer) return;

    var self = this;
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
    if (!window.Core || !window.Core.Lightbox) return;

    // Debounce rapid navigation
    if (this.navigationDebounce) return;

    this.navigationDebounce = true;
    var self = this;
    setTimeout(function() {
      self.navigationDebounce = false;
    }, this.debounceDelay);

    var state = (window.PortfolioGallery && window.PortfolioGallery.state) ? window.PortfolioGallery.state.getState() : null;
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
    // Wait for DOM
    var self = this;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() { self.setup(); });
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
      var data = await this.fetchData();

      // Process and flatten items
      var allItems = this.processData(data);

      // Update state
      this.state.setMediaList(allItems);
      this.state.setLoading(false);

      // Initial render
      this.renderer.render(allItems, 'all');

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
    var images = (data.portfolio && data.portfolio.images) || {};

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

    // Optimized: Use a Map for O(1) priority lookups instead of indexOf
    var categoryPriority = new Map();
    categoryOrder.forEach(function(cat, index) { categoryPriority.set(cat, index); });

    // Flatten all category images
    var categories = Object.keys(images);
    for (var c = 0; c < categories.length; c++) {
      var category = categories[c];
      var items = images[category];
      if (Array.isArray(items)) {
        var catName = this.formatCategoryName(category);
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          // Optimized: Use Object.assign for better performance and compatibility
          allItems.push(Object.assign({}, item, {
            category: category,
            order: i,
            id: item.id || (category + '-' + i),
            title: item.title || (catName + ' ' + (i + 1)),
            alt: item.alt || item.title || (catName + ' photography'),
            type: item.type || 'image'
          }));
        }
      }
    }

    allItems.sort(function(a, b) {
      var catA = categoryPriority.has(a.category) ? categoryPriority.get(a.category) : 999;
      var catB = categoryPriority.has(b.category) ? categoryPriority.get(b.category) : 999;

      if (catA !== catB) {
        return catA - catB;
      }

      return (a.order || 0) - (b.order || 0);
    });

    return allItems;
  }

  formatCategoryName(slug) {
    var self = this;
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
