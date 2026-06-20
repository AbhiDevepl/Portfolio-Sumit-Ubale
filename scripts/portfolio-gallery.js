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
var GalleryState = function() {
  this.currentIndex = 0;
  this.mediaList = [];
  this.filteredList = [];
  this.activeCategory = 'all';
  this.isLoading = false;
  this.hasError = false;
  this.listeners = new Set();
};

GalleryState.prototype.subscribe = function(callback) {
  this.listeners.add(callback);
  var self = this;
  return function() { self.listeners.delete(callback); };
};

GalleryState.prototype.notify = function() {
  var self = this;
  this.listeners.forEach(function(cb) { cb(self.getState()); });
};

GalleryState.prototype.getState = function() {
  return {
    currentIndex: this.currentIndex,
    mediaList: this.mediaList,
    filteredList: this.filteredList,
    activeCategory: this.activeCategory,
    isLoading: this.isLoading,
    hasError: this.hasError
  };
};

GalleryState.prototype.setMediaList = function(items) {
  this.mediaList = items;
  this.filteredList = items;
  this.notify();
};

GalleryState.prototype.setFilteredList = function(items) {
  this.filteredList = items;
  this.currentIndex = 0;
  this.notify();
};

GalleryState.prototype.setActiveCategory = function(category) {
  this.activeCategory = category;
  this.notify();
};

GalleryState.prototype.setCurrentIndex = function(index) {
  this.currentIndex = Math.max(0, Math.min(index, this.filteredList.length - 1));
  this.notify();
};

GalleryState.prototype.setLoading = function(loading) {
  this.isLoading = loading;
  this.notify();
};

GalleryState.prototype.setError = function(error) {
  this.hasError = error;
  this.notify();
};

// ========================================
// GALLERY RENDERER
// ========================================
var GalleryRenderer = function(state, container) {
  this.state = state;
  this.container = container;
  this.animationFrame = null;
};

GalleryRenderer.prototype.render = function(items, category) {
  if (this.animationFrame) {
    cancelAnimationFrame(this.animationFrame);
  }

  var self = this;
  this.animationFrame = requestAnimationFrame(function() {
    self._renderSync(items, category);
  });
};

GalleryRenderer.prototype._renderSync = function(items, category) {
  var fragment = document.createDocumentFragment();

  for (var i = 0; i < items.length; i++) {
    var element = this.createGalleryItem(items[i], i);
    if (element) {
      fragment.appendChild(element);
    }
  }

  this.container.innerHTML = '';
  this.container.appendChild(fragment);
  this.triggerRevealAnimations();
};

GalleryRenderer.prototype.createGalleryItem = function(item, index) {
  var isVideo = item.type === 'video';
  var article = document.createElement('article');
  article.className = 'gallery-item ' + (isVideo ? 'gallery-item--video' : 'gallery-item--image');
  article.dataset.index = index;
  article.dataset.category = item.category || '';
  article.setAttribute('tabindex', '0');
  article.setAttribute('role', 'listitem');
  article.setAttribute('aria-label', (item.title || 'Gallery item') + (isVideo ? ' (video)' : ''));

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

  var title = document.createElement('h3');
  title.className = 'gallery-item-title';
  title.textContent = item.title || '';

  var catLabel = document.createElement('p');
  catLabel.className = 'gallery-item-category';
  catLabel.textContent = item.formattedCategory || this.formatCategory(item.category);

  overlay.appendChild(title);
  overlay.appendChild(catLabel);
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
};

GalleryRenderer.prototype.createPlayIcon = function() {
  var icon = document.createElement('div');
  icon.className = 'gallery-video-play-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>';
  return icon;
};

GalleryRenderer.prototype.formatCategory = function(category) {
  if (!category) return '';
  var pg = window.PortfolioGallery;
  if (pg && pg.categoryCache && pg.categoryCache[category]) {
    return pg.categoryCache[category];
  }
  return category
    .split('-')
    .map(function(word) { return word.charAt(0).toUpperCase() + word.slice(1); })
    .join(' ');
};

GalleryRenderer.prototype.openLightbox = function(index) {
  if (!(window.Core && window.Core.Lightbox)) return;

  var state = this.state.getState();
  var items = state.filteredList.length > 0 ? state.filteredList : state.mediaList;

  var lightboxItems = items.map(function(item, i) {
    var newItem = Object.assign({}, item);
    newItem.type = item.type || 'image';
    newItem.originalIndex = i;
    return newItem;
  });

  window.Core.Lightbox.open(index, lightboxItems);
};

GalleryRenderer.prototype.triggerRevealAnimations = function() {
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
      (function(idx) {
        var item = items[idx];
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.5s ease ' + (idx * 0.05) + 's, transform 0.5s ease ' + (idx * 0.05) + 's';

        setTimeout(function() {
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        }, 50);
      })(i);
    }
  }
};

GalleryRenderer.prototype.showLoading = function() {
  this.container.innerHTML = '<div class="gallery-loading-state"><div class="gallery-loading-spinner"></div><p>Loading portfolio...</p></div>';
};

GalleryRenderer.prototype.showError = function(message) {
  this.container.innerHTML = '<div class="gallery-error-state"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg><h3>Failed to load portfolio</h3><p>' + message + '</p><button class="gallery-retry-btn" onclick="window.PortfolioGallery.retry()">Try Again</button></div>';
};

// ========================================
// MODAL VIEWER
// ========================================
var ModalViewer = function(state) {
  this.state = state;
  this.isOpen = false;
  this.touchStartX = 0;
  this.touchCurrentX = 0;
  this.touchThreshold = 48;
  this.navigationDebounce = false;
  this.debounceDelay = 150;
};

ModalViewer.prototype.init = function() {
  if (window.Core && window.Core.Lightbox) {
    window.Core.Lightbox.init();
  }
  this.bindEnhancedGestures();
};

ModalViewer.prototype.bindEnhancedGestures = function() {
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
    setTimeout(function() {
      self.navigationDebounce = false;
    }, self.debounceDelay);

    if (deltaX < -self.touchThreshold) {
      self.navigate(1);
    } else if (deltaX > self.touchThreshold) {
      self.navigate(-1);
    }
  });
};

ModalViewer.prototype.navigate = function(direction) {
  if (!(window.Core && window.Core.Lightbox)) return;
  if (this.navigationDebounce) return;

  var self = this;
  this.navigationDebounce = true;
  setTimeout(function() {
    self.navigationDebounce = false;
  }, this.debounceDelay);

  var pg = window.PortfolioGallery;
  var state = (pg && pg.state && pg.state.getState()) || null;
  if (!state) return;

  var items = state.filteredList.length > 0 ? state.filteredList : state.mediaList;
  var len = items.length;
  if (len === 0) return;

  var currentIndex = window.Core.Lightbox.state.currentIndex;
  var newIndex = (currentIndex + direction + len) % len;
  window.Core.Lightbox.open(newIndex, items);
};

ModalViewer.prototype.open = function(index) {
  if (!(window.Core && window.Core.Lightbox)) return;
  var state = this.state.getState();
  var items = state.filteredList.length > 0 ? state.filteredList : state.mediaList;
  if (items.length === 0) return;
  window.Core.Lightbox.open(index, items);
  this.isOpen = true;
};

ModalViewer.prototype.close = function() {
  if (!(window.Core && window.Core.Lightbox)) return;
  window.Core.Lightbox.close();
  this.isOpen = false;
};

// ========================================
// FILTER CONTROLLER
// ========================================
var FilterController = function(state, chipsContainer) {
  this.state = state;
  this.chipsContainer = chipsContainer;
  this.init();
};

FilterController.prototype.init = function() {
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
};

FilterController.prototype.setActiveChip = function(activeChip) {
  var chips = this.chipsContainer.querySelectorAll('.filter-chip');
  for (var i = 0; i < chips.length; i++) {
    var chip = chips[i];
    chip.classList.remove('active');
    chip.setAttribute('aria-selected', 'false');
  }
  activeChip.classList.add('active');
  activeChip.setAttribute('aria-selected', 'true');
};

FilterController.prototype.filterByCategory = function(category) {
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
};

FilterController.prototype.updateURL = function(category) {
  var url = new URL(window.location);
  if (category === 'all') {
    url.searchParams.delete('category');
  } else {
    url.searchParams.set('category', category);
  }
  window.history.pushState({ category: category }, '', url);
};

FilterController.prototype.initHorizontalScroll = function() {
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
  document.head.appendChild(style);
};

FilterController.prototype.selectFromURL = function() {
  var params = new URLSearchParams(window.location.search);
  var category = params.get('category');
  if (category) {
    var chip = this.chipsContainer.querySelector('[data-category="' + category + '"]');
    if (chip) {
      this.setActiveChip(chip);
      this.filterByCategory(category);
    }
  }
};

// ========================================
// MAIN GALLERY CONTROLLER
// ========================================
var PortfolioGallery = function() {
  this.state = new GalleryState();
  this.container = null;
  this.renderer = null;
  this.modal = null;
  this.filterController = null;
  this.categoryCache = {};
  this.init();
};

PortfolioGallery.prototype.init = function() {
  var self = this;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { self.setup(); });
  } else {
    this.setup();
  }
};

PortfolioGallery.prototype.setup = function() {
  this.container = document.getElementById('gallery-grid');
  if (!this.container) return;

  this.renderer = new GalleryRenderer(this.state, this.container);
  this.renderer.showLoading();
  this.state.setLoading(true);

  var self = this;
  this.fetchData().then(function(data) {
    var allItems = self.processData(data);
    self.state.setMediaList(allItems);
    self.state.setLoading(false);
    self.renderer.render(allItems, 'all');

    self.state.subscribe(function(state) {
      self.renderer.render(state.filteredList, state.activeCategory);
    });

    var chipsContainer = document.querySelector('.filter-chips-container');
    if (chipsContainer) {
      self.filterController = new FilterController(self.state, chipsContainer);
      self.filterController.selectFromURL();
    }

    self.modal = new ModalViewer(self.state);
    self.modal.init();

    if (window.Core && window.Core.Lightbox) {
      window.Core.Lightbox.init();
    }
  }).catch(function(error) {
    self.state.setError(true);
    self.renderer.showError('Unable to load portfolio. Please check your connection and try again.');
  });
};

PortfolioGallery.prototype.fetchData = function() {
  return fetch('/data/portfolio.json').then(function(response) {
    if (!response.ok) throw new Error('Failed to fetch portfolio data');
    return response.json();
  });
};

PortfolioGallery.prototype.processData = function(data) {
  var images = (data.portfolio && data.portfolio.images) || {};
  var categories = Object.keys(images);
  var entries = [];

  for (var i = 0; i < categories.length; i++) {
    var category = categories[i];
    var items = images[category];
    if (!Array.isArray(items)) continue;

    var formattedCategory = this.formatCategoryName(category);
    var weight = PortfolioGallery.CATEGORY_WEIGHTS[category] !== undefined ? PortfolioGallery.CATEGORY_WEIGHTS[category] : 999;

    for (var j = 0; j < items.length; j++) {
      entries.push({
        item: items[j],
        weight: weight,
        order: j,
        category: category,
        formattedCategory: formattedCategory
      });
    }
  }

  entries.sort(function(a, b) {
    if (a.weight !== b.weight) return a.weight - b.weight;
    return a.order - b.order;
  });

  var allItems = new Array(entries.length);
  for (var k = 0; k < entries.length; k++) {
    var entry = entries[k];
    var item = entry.item;
    item.category = entry.category;
    item.formattedCategory = entry.formattedCategory;
    item.weight = entry.weight;
    item.order = entry.order;
    if (!item.id) item.id = entry.category + '-' + entry.order;
    if (!item.title) item.title = entry.formattedCategory + ' ' + (entry.order + 1);
    if (!item.alt) item.alt = item.title || (entry.formattedCategory + ' photography');
    if (!item.type) item.type = 'image';
    allItems[k] = item;
  }
  return allItems;
};

PortfolioGallery.prototype.formatCategoryName = function(slug) {
  if (this.categoryCache[slug]) return this.categoryCache[slug];
  var formatted = slug
    .split('-')
    .map(function(word) { return word.charAt(0).toUpperCase() + word.slice(1); })
    .join(' ');
  this.categoryCache[slug] = formatted;
  return formatted;
};

PortfolioGallery.prototype.retry = function() {
  this.state = new GalleryState();
  this.setup();
};

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
for (var m = 0; m < PortfolioGallery.CATEGORY_ORDER.length; m++) {
  PortfolioGallery.CATEGORY_WEIGHTS[PortfolioGallery.CATEGORY_ORDER[m]] = m;
}

window.PortfolioGallery = new PortfolioGallery();
