/**
 * Content Loader
 * Consolidated source for homepage and global content loading
 */

class ContentLoader {
  constructor() {
    this.dataUrl = '/data/portfolio.json';
    this.secondaryDataUrl = '/data/new_portfolio.json';
    this.data = null;
    this.portfolioData = [];
    this.activeCategory = 'all';
    this.visibleImagesCount = 0;
    this.visibleVideosCount = 0;

    // UI References
    this.inlineGrid = document.getElementById('portfolio-inline-grid');
    this.fullGrid = document.getElementById('gallery-grid');
    this.loadMoreWrapper = document.getElementById('portfolio-inline-more');
    this.loadMoreBtn = document.getElementById('inline-load-more-btn');
  }

  /**
   * Initialize content loading
   */
  async init() {
    try {
      await this.loadData();
      
      if (this.inlineGrid) {
        this.setupInlineGallery();
      } else if (this.fullGrid) {
        this.populateFullGallery();
      }
      
      this.populateEvents();
      this.populateAbout();

      // Initialize Gallery Interactions
      if (window.GalleryManager) {
        window.GalleryManager.init();
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Fetch and merge JSON data sources
   */
  async loadData() {
    try {
      var self = this;
      var results = await Promise.all([
        fetch(this.dataUrl).then(function(res) { return res.ok ? res.json() : null; }).catch(function() { return null; }),
        fetch(this.secondaryDataUrl).then(function(res) { return res.ok ? res.json() : null; }).catch(function() { return null; })
      ]);

      var mainData = results[0];
      var secondaryData = results[1];

      if (!mainData) throw new Error('Primary portfolio data missing');

      this.data = mainData;
      var seenUrls = new Set();
      var allItems = [];

      var processSource = function(source) {
        if (!source || !source.portfolio || !source.portfolio.images) return;
        var images = source.portfolio.images;

        Object.keys(images).forEach(function(category) {
          if (Array.isArray(images[category])) {
            images[category].forEach(function(item) {
              if (!seenUrls.has(item.src)) {
                seenUrls.add(item.src);
                var enriched = Object.assign({}, item);
                enriched.category = category;
                enriched.type = item.type === 'video' ? 'video' : 'image';
                allItems.push(enriched);
              }
            });
          }
        });

        // Merge metadata if present in secondary but missing in main
        if (source.recentEvents && (!self.data.recentEvents || self.data.recentEvents.length === 0)) {
          self.data.recentEvents = source.recentEvents;
        }
        if (source.socialProof && !self.data.socialProof) {
          self.data.socialProof = source.socialProof;
        }
      };

      processSource(mainData);
      processSource(secondaryData);

      // Randomize for homepage variety
      for (var i = allItems.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = allItems[i];
        allItems[i] = allItems[j];
        allItems[j] = temp;
      }

      this.portfolioData = allItems;
      return this.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get filtered items based on current state
   */
  getFilteredItems(type) {
    var self = this;
    return this.portfolioData.filter(function(item) {
      var activeCat = self.activeCategory;
      var itemCat = item.category;

      var isPreWeddingMatch = (activeCat === 'pre-wedding-photos-and-videos' || activeCat === 'perwedding') &&
                                (itemCat === 'pre-wedding-photos-and-videos' || itemCat === 'perwedding');

      var isCinematicMatch = (activeCat === 'cinematics' || activeCat === 'video') &&
                               (itemCat === 'cinematics' || itemCat === 'video');

      var categoryMatch = activeCat === 'all' ||
                           itemCat === activeCat ||
                           isPreWeddingMatch ||
                           isCinematicMatch;

      return categoryMatch && item.type === type;
    });
  }

  /**
   * Setup homepage-specific inline gallery
   */
  setupInlineGallery() {
    var self = this;
    this.renderInlineInitial();

    // Bind "Load More"
    if (this.loadMoreBtn) {
      this.loadMoreBtn.onclick = function() {
        if (self.activeCategory === 'cinematics' || self.activeCategory === 'video') {
          self.inlineGrid.innerHTML = '';
          self.appendInlineItems(0, 1);
        } else {
          self.appendInlineItems(3, 0);
        }
      };
    }

    // Intercept GalleryManager filtering to use this consolidated logic
    if (window.GalleryManager) {
      var originalFilter = window.GalleryManager.filterGallery.bind(window.GalleryManager);
      window.GalleryManager.filterGallery = function(category) {
        self.activeCategory = category;
        self.renderInlineInitial();
        originalFilter(category);
      };
    }
  }

  renderInlineInitial() {
    if (!this.inlineGrid) return;
    this.inlineGrid.innerHTML = '';
    this.visibleImagesCount = 0;
    this.visibleVideosCount = 0;

    var isCinematic = this.activeCategory === 'cinematics' || this.activeCategory === 'video';
    if (isCinematic) {
      this.inlineGrid.classList.add('cinematics-mode');
    } else {
      this.inlineGrid.classList.remove('cinematics-mode');
    }

    var iAdd = 0, vAdd = 0;
    if (isCinematic) {
      vAdd = 1;
    } else if (this.activeCategory === 'all') {
      iAdd = 3;
      vAdd = 0;
    } else {
      iAdd = 3;
      vAdd = 1;
    }
    this.appendInlineItems(iAdd, vAdd);
  }

  appendInlineItems(imgCount, vidCount) {
    var self = this;
    var images = this.getFilteredItems('image');
    var videos = this.getFilteredItems('video');
    var toAppend = [];

    for (var i = 0; i < imgCount; i++) {
      if (this.visibleImagesCount < images.length) {
        toAppend.push(images[this.visibleImagesCount]);
        this.visibleImagesCount++;
      }
    }

    for (var j = 0; j < vidCount; j++) {
      if (this.visibleVideosCount < videos.length) {
        toAppend.push(videos[this.visibleVideosCount]);
        this.visibleVideosCount++;
      }
    }

    if (toAppend.length === 0) return;

    var fragment = document.createDocumentFragment();
    toAppend.forEach(function(item, idx) {
      var globalIdx = self.portfolioData.indexOf(item);
      var el;

      // Use Core.Media if available for consistency
      if (window.Core && window.Core.Media) {
        el = window.Core.Media.createItem(item, globalIdx, self.portfolioData, self.getCategoryName.bind(self));
      } else {
        // Fallback if core.js is not loaded
        el = self.createFallbackItem(item, globalIdx, idx);
      }

      if (el) {
        // Add homepage-specific attribute for aspect ratio
        el.dataset.type = item.type;
        el.style.animationDelay = (idx * 100) + 'ms';
        fragment.appendChild(el);
      }
    });

    this.inlineGrid.appendChild(fragment);

    // Update Load More visibility
    if (this.loadMoreWrapper) {
      var moreImg = this.visibleImagesCount < images.length;
      var moreVid = this.visibleVideosCount < videos.length;

      var isCinematic = this.activeCategory === 'cinematics' || this.activeCategory === 'video';
      if (isCinematic) {
        this.loadMoreWrapper.style.display = moreVid ? 'block' : 'none';
      } else if (this.activeCategory === 'all') {
        this.loadMoreWrapper.style.display = 'none';
      } else {
        this.loadMoreWrapper.style.display = moreImg ? 'block' : 'none';
      }
    }

    // Re-init lazy loading
    if (this.initLazyLoader) this.initLazyLoader();
  }

  /**
   * Populate full gallery page (fallback if portfolio-gallery.js not used)
   */
  populateFullGallery() {
    this.renderCategory('all');
  }

  getCategoryName(category) {
    return ContentLoader.CATEGORY_NAMES[category] || category;
  }

  renderCategory(category) {
    var self = this;
    if (this.inlineGrid) {
      this.activeCategory = category;
      this.renderInlineInitial();
      return;
    }

    var grid = this.fullGrid;
    if (!grid) return;

    this.activeCategory = category;
    var items = this.portfolioData.filter(function(item) {
        var itemCat = item.category;
        var isPreWeddingMatch = (category === 'pre-wedding-photos-and-videos' || category === 'perwedding') &&
                                  (itemCat === 'pre-wedding-photos-and-videos' || itemCat === 'perwedding');

        var isCinematicMatch = (category === 'cinematics' || category === 'video') &&
                                 (itemCat === 'cinematics' || itemCat === 'video');

        return category === 'all' || itemCat === category || isPreWeddingMatch || isCinematicMatch;
    });

    grid.innerHTML = '';
    if (items.length === 0) {
      grid.innerHTML = '<p class="no-items">No items found.</p>';
      return;
    }

    var fragment = document.createDocumentFragment();
    items.forEach(function(item, index) {
      var el;
      if (window.Core && window.Core.Media) {
        el = window.Core.Media.createItem(item, index, items, self.getCategoryName.bind(self));
      } else {
        el = self.createFallbackItem(item, index, index);
      }
      if (el) fragment.appendChild(el);
    });

    grid.appendChild(fragment);
    this.initLazyLoader();
  }

  initLazyLoader() {
    var lazyImages = document.querySelectorAll('img[loading="lazy"], video[preload="none"]');
    if (window.Core && window.Core.VideoObserver) {
      lazyImages.forEach(function(el) {
        if (el.tagName === 'VIDEO') window.Core.VideoObserver.observe(el);
      });
    }
  }

  populateEvents() {
    var eventsGrid = document.querySelector('.events-grid');
    if (!eventsGrid || !this.data || !this.data.recentEvents) return;

    eventsGrid.innerHTML = '';
    this.data.recentEvents.forEach(function(event) {
      var item = document.createElement('div');
      item.className = 'event-item reveal-item';
      
      var img = document.createElement('img');
      img.src = event.src;
      img.alt = event.alt || event.title;
      img.className = 'event-image';
      img.loading = 'lazy';
      if (event.aspectRatio) img.style.aspectRatio = event.aspectRatio;
      
      var overlay = document.createElement('div');
      overlay.className = 'gallery-overlay';
      
      var title = document.createElement('h3');
      title.className = 'gallery-title';
      title.textContent = event.title;
      
      var category = document.createElement('p');
      category.className = 'gallery-category';
      category.textContent = event.category;
      
      overlay.appendChild(title);
      overlay.appendChild(category);
      item.appendChild(img);
      item.appendChild(overlay);
      eventsGrid.appendChild(item);
    });
  }

  /**
   * Fallback item creator if Core.Media is unavailable
   */
  createFallbackItem(item, index, batchIdx) {
    var self = this;
    var isVideo = item.type === 'video';
    var el = document.createElement('article');
    el.className = 'gallery-item ' + (isVideo ? 'gallery-item--video' : 'gallery-item--image') + ' reveal-item loading';
    el.dataset.index = index;
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');

    var media = document.createElement(isVideo ? 'video' : 'img');
    media.className = 'gallery-image';
    media.src = item.src;
    if (isVideo) {
      media.muted = true;
      media.playsInline = true;
      if (item.poster) media.poster = item.poster;
    } else {
      media.loading = 'lazy';
    }

    media.onload = function() {
      el.classList.remove('loading');
      media.style.opacity = '1';
    };

    el.appendChild(media);

    var overlay = document.createElement('div');
    overlay.className = 'gallery-overlay';
    overlay.innerHTML = '<h3 class="gallery-title">' + (item.title || "") + '</h3>';
    el.appendChild(overlay);

    el.onclick = function() {
      if (window.Core && window.Core.Lightbox) {
        window.Core.Lightbox.open(index, self.portfolioData);
      }
    };

    return el;
  }

  /**
   * User-facing error handling
   */
  handleError(error) {
    console.error('❌ Content loading error:', error);
    var grid = this.inlineGrid || this.fullGrid;
    if (grid) {
      grid.innerHTML = '<div class="content-error"><p>Unable to load portfolio content. Please try refreshing the page.</p></div>';
    }
  }

  populateAbout() {
    if (!this.data || !this.data.socialProof) return;
    var proof = this.data.socialProof;

    var updateContainer = function(id, items, itemClass) {
      var container = document.getElementById(id);
      if (container && items) {
        container.innerHTML = '';
        items.forEach(function(text) {
          var el = document.createElement(id === 'awards' ? 'li' : 'span');
          if (itemClass) el.className = itemClass;
          el.textContent = text;
          container.appendChild(el);
        });
      }
    };

    updateContainer('publications', proof.publications, 'publication-item');
    updateContainer('awards', proof.awards, null);
    updateContainer('clients', proof.clients, 'client-item');
  }
}

ContentLoader.CATEGORY_NAMES = {
  'weddings': 'Weddings',
  'portraits': 'Portraits',
  'commercial': 'Commercial',
  'events': 'Events',
  'maternity': 'Maternity',
  'kids': 'Kids',
  'haldi': 'Haldi',
  'engagement': 'Engagement',
  'perwedding': 'Pre-Wedding',
  'pre-wedding-photos-and-videos': 'Pre-Wedding',
  'cinematics': 'Cinematics',
  'video': 'Cinematics'
};

// Global initialization
document.addEventListener('DOMContentLoaded', function() {
  window.contentLoader = new ContentLoader();
  window.contentLoader.init();
});
