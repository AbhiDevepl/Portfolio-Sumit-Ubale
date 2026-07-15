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

class GalleryRenderer {
  constructor(state, container) {
    this.state = state;
    this.container = container;
    this.animationFrame = null;
  }

  render(items, category) {
    var self = this;
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

    this.container.innerHTML = '';
    this.container.appendChild(fragment);

    this.triggerRevealAnimations();
  }

  createGalleryItem(item, index) {
    var self = this;
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
    catLabel.textContent = item.formattedCategory || '';

    overlay.appendChild(title);
    overlay.appendChild(catLabel);
    article.appendChild(overlay);

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

  openLightbox(index) {
    if (!window.Core || !window.Core.Lightbox) return;

    var state = this.state.getState();
    var items = state.filteredList.length > 0 ? state.filteredList : state.mediaList;

    var lightboxItems = items.map(function(item, i) {
      var newItem = Object.assign({}, item);
      newItem.type = item.type || 'image';
      newItem.originalIndex = i;
      return newItem;
    });

    window.Core.Lightbox.open(index, lightboxItems);
  }

  triggerRevealAnimations() {
    if (window.GSAP && window.ScrollTrigger) {
      window.GSAP.fromTo(this.container.querySelectorAll('.gallery-item'),
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
      var items = this.container.querySelectorAll('.gallery-item');
      for (var i = 0; i < items.length; i++) {
        (function(item, idx) {
          item.style.opacity = '0';
          item.style.transform = 'translateY(20px)';
          item.style.transition = 'opacity 0.5s ease ' + (idx * 0.05) + 's, transform 0.5s ease ' + (idx * 0.05) + 's';

          setTimeout(function() {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }, 50);
        })(items[i], i);
      }
    }
  }

  showLoading() {
    this.container.innerHTML = '<div class="gallery-loading-state"><div class="gallery-loading-spinner"></div><p>Loading portfolio</p></div>';
  }

  showError(message) {
    var errorState = document.createElement('div');
    errorState.className = 'gallery-error-state';

    var icon = document.createElement('div');
    icon.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>';

    var title = document.createElement('h3');
    title.textContent = 'Failed to load portfolio';

    var msg = document.createElement('p');
    msg.textContent = message;

    var retryBtn = document.createElement('button');
    retryBtn.className = 'gallery-retry-btn';
    retryBtn.textContent = 'Try Again';
    retryBtn.onclick = function() {
      if (window.PortfolioGallery && window.PortfolioGallery.retry) {
        window.PortfolioGallery.retry();
      }
    };

    errorState.appendChild(icon);
    errorState.appendChild(title);
    errorState.appendChild(msg);
    errorState.appendChild(retryBtn);

    this.container.innerHTML = '';
    this.container.appendChild(errorState);
  }
}

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
    var self = this;
    var lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    var mediaContainer = lightbox.querySelector('.lightbox-media-container');
    if (!mediaContainer) return;

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
  }

  navigate(direction) {
    var self = this;
    if (!window.Core || !window.Core.Lightbox) return;
    if (this.navigationDebounce) return;

    this.navigationDebounce = true;
    setTimeout(function() {
      self.navigationDebounce = false;
    }, this.debounceDelay);

    var gallery = window.PortfolioGallery;
    var state = (gallery && gallery.state) ? gallery.state.getState() : null;
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

class FilterController {
  constructor(state, chipsContainer) {
    this.state = state;
    this.chipsContainer = chipsContainer;
    this.init();
  }

  init() {
    var self = this;
    if (!this.chipsContainer) return;
    var chips = this.chipsContainer.querySelectorAll('.filter-chip');
    chips.forEach(function(chip) {
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
    });
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
    var matchCategory = category === 'pre-wedding-photos-and-videos' ? 'perwedding' : category;
    var gallery = window.PortfolioGallery;
    if (gallery && gallery.categoryMap && gallery.categoryMap[matchCategory]) {
      this.state.setFilteredList(gallery.categoryMap[matchCategory]);
    } else {
      var filtered = allItems.filter(function(item) {
        return item.category === matchCategory || (item.categories && item.categories.indexOf(matchCategory) !== -1);
      });
      this.state.setFilteredList(filtered);
    }
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

class PortfolioGallery {
  constructor() {
    this.state = new GalleryState();
    this.container = null;
    this.renderer = null;
    this.modal = null;
    this.filterController = null;
    this.categoryMap = {};
    this.init();
  }

  async init() {
    var self = this;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() { self.setup(); });
    } else {
      this.setup();
    }
  }

  async setup() {
    this.container = document.getElementById('gallery-grid');
    if (!this.container) {
      console.error('Gallery container not found');
      return;
    }
    this.renderer = new GalleryRenderer(this.state, this.container);
    this.renderer.showLoading();
    this.state.setLoading(true);
    try {
      var data = await this.fetchData();
      var allItems = this.processData(data);
      this.state.setMediaList(allItems);
      this.state.setLoading(false);
      this.renderer.render(allItems, 'all');
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
    var self = this;
    this.categoryMap = {};
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
    var processedCategories = new Set();
    var processItems = function(sourceSlug) {
      var items = images[sourceSlug];
      if (Array.isArray(items) && !processedCategories.has(sourceSlug)) {
        var displaySlug = sourceSlug === 'perwedding' ? 'pre-wedding-photos-and-videos' : sourceSlug;
        var formattedName = self.formatCategoryName(displaySlug);
        var mappedItems = items.map(function(item, index) {
          var processed = Object.assign({}, item);
          processed.category = sourceSlug;
          processed.order = index;
          processed.id = item.id || (sourceSlug + "-" + index);
          processed.title = item.title || (formattedName + " " + (index + 1));
          processed.alt = item.alt || item.title || (formattedName + " photography");
          processed.type = item.type || 'image';
          processed.formattedCategory = formattedName;
          return processed;
        });
        Array.prototype.push.apply(allItems, mappedItems);
        processedCategories.add(sourceSlug);
      }
    };
    categoryOrder.forEach(function(orderSlug) {
      processItems(orderSlug === 'pre-wedding-photos-and-videos' ? 'perwedding' : orderSlug);
    });
    Object.keys(images).forEach(processItems);
    allItems.forEach(function(item) {
      var cats = [item.category];
      if (Array.isArray(item.categories)) {
        Array.prototype.push.apply(cats, item.categories);
      }
      cats.forEach(function(cat) {
        if (!self.categoryMap[cat]) {
          self.categoryMap[cat] = [];
        }
        self.categoryMap[cat].push(item);
      });
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

window.PortfolioGallery = new PortfolioGallery();
