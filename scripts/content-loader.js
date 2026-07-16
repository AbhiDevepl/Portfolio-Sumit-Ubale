/**
 * Content Loader
 * Fetches portfolio data from JSON and dynamically populates the page
 */

class ContentLoader {
  constructor() {
    this.data = {
      portfolio: { images: {} },
      recentEvents: [],
      socialProof: {}
    };
    this.allImages = []; // Cache for processed items
    this.mediaData = this.data.portfolio.images; // Cache portfolio.images from JSON

    // Homepage specific state
    this.visibleImagesCount = 0;
    this.visibleVideosCount = 0;
    this.activeCategory = 'all';
    this.portfolioData = []; // Flat list for homepage randomization
    this.seenUrls = new Set();
  }

  /**
   * Initialize content loading
   */
  async init() {
    try {
      await this.loadData();

      var isHomepage = !!document.getElementById('portfolio-inline-grid');

      if (isHomepage) {
        this.renderInlineInitial();
      } else {
        this.populateGallery();
      }
      
      // Initialize Gallery Interactions (after content is loaded)
      if (window.GalleryManager) {
        window.GalleryManager.init();
      }
      
      this.populateEvents();
      this.populateAbout();
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Fetch JSON data
   */
  async loadData() {
    var self = this;
    try {
      var urls = ['/data/portfolio.json', '/data/new_portfolio.json'];
      var responses = await Promise.all(urls.map(function(url) {
        return fetch(url).catch(function() { return { ok: false }; });
      }));

      var dataSources = await Promise.all(responses.map(function(res) {
        return res.ok ? res.json() : Promise.resolve(null);
      }));

      dataSources.forEach(function(source) {
        if (!source) return;

        // Merge mediaData
        var sourceMedia = (source.portfolio && source.portfolio.images) || source.mediaData;
        if (sourceMedia) {
          Object.keys(sourceMedia).forEach(function(category) {
            if (!self.mediaData[category]) {
              self.mediaData[category] = [];
            }

            sourceMedia[category].forEach(function(item) {
              var url = item.src || item.url;
              if (url && !self.seenUrls.has(url)) {
                self.seenUrls.add(url);

                var processedItem = {
                  type: (item.type === 'video' || category === 'video' || category === 'cinematics') ? 'video' : 'image',
                  category: category,
                  src: url,
                  alt: item.alt || item.title || 'Portfolio media',
                  poster: item.poster || item.thumb || '',
                  aspectRatio: item.aspectRatio || ''
                };

                self.mediaData[category].push(processedItem);
                self.portfolioData.push(processedItem);
              }
            });
          });
        }

        // Merge metadata
        if (source.recentEvents && source.recentEvents.length > 0) {
          self.data.recentEvents = source.recentEvents;
        }
        if (source.socialProof && Object.keys(source.socialProof).length > 0) {
          self.data.socialProof = source.socialProof;
        }
      });

      // Randomize for homepage freshness
      for (var i = this.portfolioData.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = this.portfolioData[i];
        this.portfolioData[i] = this.portfolioData[j];
        this.portfolioData[j] = temp;
      }

      return this.data;
    } catch (error) {
      throw new Error('Failed to load portfolio data: ' + error.message);
    }
  }

  /**
   * Populate gallery grid with images
   */
  populateGallery() {
    // Use renderCategory for initial load to ensure consistent behavior
    this.renderCategory('all');
  }

  /**
   * Helper to get category name from slug
   */
  getCategoryName(category) {
    return ContentLoader.CATEGORY_NAMES[category] || category;
  }

  /**
   * Get images for a category
   * @param {string} category - Category slug (or 'all')
   * @returns {Array} Array of image/video items
   */
  getFilteredItems(category) {
    var self = this;
    if (!this.mediaData) return [];

    if (category === 'all') {
      // Flatten all category arrays
      var all = [];
      Object.keys(this.mediaData).forEach(function(cat) {
        var arr = self.mediaData[cat];
        if (Array.isArray(arr)) {
          all.push.apply(all, arr);
        }
      });
      return all;
    }

    return this.mediaData[category] || [];
  }

  /**
   * Render gallery items for a category
   * @param {string} category - Category slug
   */
  renderCategory(category) {
    var self = this;
    var isHomepage = !!document.getElementById('portfolio-inline-grid');
    if (isHomepage) {
      this.activeCategory = category;
      this.renderInlineInitial();
      return;
    }

    var galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) return;

    var items = this.getFilteredItems(category);

    // Clear existing
    galleryGrid.innerHTML = '';

    if (items.length === 0) {
      galleryGrid.innerHTML = '<p class="no-items">No items found in this category.</p>';
      return;
    }

    // Create gallery items with proper structure
    var fragment = document.createDocumentFragment();

    items.forEach(function(item, index) {
      var isVideo = item.type === 'video';
      var el = document.createElement('article');
      el.className = 'gallery-item ' + (isVideo ? 'gallery-item--video' : 'gallery-item--image') + ' reveal-item loading';
      el.dataset.index = index;
      el.dataset.category = category === 'all' ? (item.category || 'uncategorized') : category;
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', (item.title || 'Open preview') + (item.category ? ', ' + item.category : ''));

      // Click handler for lightbox
      el.addEventListener('click', function() {
        var visibleItems = (window.GalleryManager && window.GalleryManager.getVisibleData) ? window.GalleryManager.getVisibleData() : items;
        var itemIndex = visibleItems.findIndex(function(entry) { return entry.originalIndex === index; });
        var targetIndex = itemIndex >= 0 ? itemIndex : index;

        if (window.Core && window.Core.Lightbox) {
          window.Core.Lightbox.open(targetIndex, visibleItems);
        }
      });

      // Keyboard handler
      el.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          el.click();
        }
      });

      if (isVideo) {
        var video = document.createElement('video');
        video.src = item.src;
        video.controls = true;
        video.playsInline = true;
        video.className = 'gallery-image';
        if (item.aspectRatio) video.style.aspectRatio = item.aspectRatio;
        el.appendChild(video);
      } else {
        var img = document.createElement('img');
        img.dataset.src = item.src; // Lazy load
        img.alt = item.alt || item.title || '';
        img.className = 'gallery-image';
        if (item.aspectRatio) img.style.aspectRatio = item.aspectRatio;
        el.appendChild(img);
      }

      // Add overlay
      var overlay = document.createElement('div');
      overlay.className = 'gallery-overlay';

      var title = document.createElement('h3');
      title.className = 'gallery-title';
      title.textContent = item.title || 'Untitled';

      var catLabel = document.createElement('p');
      catLabel.className = 'gallery-category';
      catLabel.textContent = self.getCategoryName(item.category || category);

      overlay.appendChild(title);
      overlay.appendChild(catLabel);
      el.appendChild(overlay);

      fragment.appendChild(el);
    });

    galleryGrid.appendChild(fragment);

    // Re-init lazy loader for new images
    this.initLazyLoader();

    // Update allImages cache for lightbox (with original index for lightbox navigation)
    this.allImages = items.map(function(item, idx) {
      var newItem = Object.assign({}, item);
      newItem.originalIndex = idx;
      return newItem;
    });
    if (window.GalleryManager) {
      window.GalleryManager.allImages = this.allImages;
    }
  }

  /**
   * Re-run IntersectionObserver on lazy images
   */
  initLazyLoader() {
    var lazyImages = document.querySelectorAll('#gallery-grid img[data-src]');

    // Create or reuse observer
    if (!window.lazyImageObserver) {
      window.lazyImageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            window.lazyImageObserver.unobserve(img);
          }
        });
      }, { rootMargin: '200px' });
    }

    // Observe new lazy images
    lazyImages.forEach(function(img) {
      if (img.dataset.src) {
        window.lazyImageObserver.observe(img);
      }
    });
  }

  /**
   * Homepage specific: Initial render
   */
  renderInlineInitial() {
    var grid = document.getElementById('portfolio-inline-grid');
    if (!grid) return;

    grid.innerHTML = '';
    this.visibleImagesCount = 0;
    this.visibleVideosCount = 0;

    // Toggle cinematics layout mode
    if (this.activeCategory === 'cinematics' || this.activeCategory === 'video') {
      grid.classList.add('cinematics-mode');
    } else {
      grid.classList.remove('cinematics-mode');
    }

    var iAdd = 0;
    var vAdd = 0;

    if (this.activeCategory === 'cinematics' || this.activeCategory === 'video') {
      vAdd = 1;
    } else if (this.activeCategory === 'all') {
      iAdd = 3;
      vAdd = 0;
    } else {
      iAdd = 3;
      vAdd = 1;
    }

    this.appendItems(iAdd, vAdd);
  }

  /**
   * Homepage specific: Append items
   */
  appendItems(imgCount, vidCount) {
    var self = this;
    var grid = document.getElementById('portfolio-inline-grid');
    var moreBtnWrapper = document.getElementById('portfolio-inline-more');
    if (!grid) return;

    var images = this.portfolioData.filter(function(item) {
      return (self.activeCategory === 'all' || item.category === self.activeCategory) && item.type === 'image';
    });
    var videos = this.portfolioData.filter(function(item) {
      return (self.activeCategory === 'all' || item.category === self.activeCategory) && item.type === 'video';
    });

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

    var frag = document.createDocumentFragment();

    toAppend.forEach(function(item, idx) {
      var el = document.createElement('div');
      el.className = 'portfolio-item fade-in-up';
      el.dataset.type = item.type;
      el.style.animationDelay = (idx * 60) + 'ms';

      if (item.type === 'image') {
        var img = document.createElement('img');
        img.src = item.src;
        img.alt = item.alt || 'Portfolio image';
        img.loading = 'lazy';
        img.decoding = 'async';
        el.appendChild(img);
      } else {
        var vid = document.createElement('video');
        vid.src = item.src;
        if (item.poster) vid.poster = item.poster;
        vid.muted = true;
        vid.loop = true;
        vid.setAttribute('playsinline', '');
        vid.preload = 'metadata';
        vid.addEventListener('mouseenter', function() {
          vid.play().catch(function() {});
        });
        vid.addEventListener('mouseleave', function() {
          vid.pause();
        });
        el.appendChild(vid);
      }

      frag.appendChild(el);
    });

    grid.appendChild(frag);

    var moreImg = this.visibleImagesCount < images.length;
    var moreVid = this.visibleVideosCount < videos.length;

    if (moreBtnWrapper) {
      if (this.activeCategory === 'cinematics' || this.activeCategory === 'video') {
        moreBtnWrapper.style.display = moreVid ? 'block' : 'none';
      } else if (this.activeCategory === 'all') {
        moreBtnWrapper.style.display = 'none';
      } else {
        moreBtnWrapper.style.display = moreImg ? 'block' : 'none';
      }
    }
  }

  /**
   * Homepage specific: Load more action
   */
  loadMore() {
    var grid = document.getElementById('portfolio-inline-grid');
    if (!grid) return;

    if (this.activeCategory === 'cinematics' || this.activeCategory === 'video') {
      grid.innerHTML = '';
      this.appendItems(0, 1);
    } else {
      this.appendItems(3, 0);
    }
  }

  /**
   * Populate events section
   */
  populateEvents() {
    var eventsGrid = document.querySelector('.events-grid');
    
    if (!eventsGrid || !this.data || !this.data.recentEvents) {
      return;
    }

    // Clear existing content
    eventsGrid.innerHTML = '';

    // Create event items
    this.data.recentEvents.forEach(function(event) {
      var item = document.createElement('div');
      item.className = 'event-item';
      
      var img = document.createElement('img');
      img.src = event.src;
      img.alt = event.alt || event.title;
      img.className = 'event-image';
      img.loading = 'lazy';
      
      if (event.aspectRatio) {
        img.style.aspectRatio = event.aspectRatio;
      }
      
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
   * Populate about section with social proof
   */
  populateAbout() {
    if (!this.data || !this.data.socialProof) return;

    // Populate publications
    var publicationsContainer = document.getElementById('publications');
    if (publicationsContainer && this.data.socialProof.publications) {
      publicationsContainer.innerHTML = '';
      this.data.socialProof.publications.forEach(function(pub) {
        var pubItem = document.createElement('span');
        pubItem.className = 'publication-item';
        pubItem.textContent = pub;
        publicationsContainer.appendChild(pubItem);
      });
    }

    // Populate awards
    var awardsContainer = document.getElementById('awards');
    if (awardsContainer && this.data.socialProof.awards) {
      awardsContainer.innerHTML = '';
      this.data.socialProof.awards.forEach(function(award) {
        var awardItem = document.createElement('li');
        awardItem.textContent = award;
        awardsContainer.appendChild(awardItem);
      });
    }

    // Populate clients
    var clientsContainer = document.getElementById('clients');
    if (clientsContainer && this.data.socialProof.clients) {
      clientsContainer.innerHTML = '';
      this.data.socialProof.clients.forEach(function(client) {
        var clientItem = document.createElement('span');
        clientItem.className = 'client-item';
        clientItem.textContent = client;
        clientsContainer.appendChild(clientItem);
      });
    }
  }

  /**
   * Handle errors
   */
  handleError(error) {
    console.error('❌ Content loading error:', error);

    // Show user-friendly error message
    var errorMessage = document.createElement('div');
    errorMessage.className = 'content-error';
    var p1 = document.createElement('p');
    p1.textContent = 'Unable to load portfolio content. Please try refreshing the page.';
    var p2 = document.createElement('p');
    p2.className = 'error-details';
    p2.textContent = error.message;
    errorMessage.appendChild(p1);
    errorMessage.appendChild(p2);

    // Try to insert error in gallery
    var galleryGrid = document.getElementById('gallery-grid') || document.getElementById('portfolio-inline-grid');
    if (galleryGrid) {
      galleryGrid.innerHTML = '';
      galleryGrid.appendChild(errorMessage);
    }
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
  'pre-wedding-photos-and-videos': 'Pre-Wedding',
  'cinematics': 'Cinematics'
};

// Initialize content loader when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    window.contentLoader = new ContentLoader();
    window.contentLoader.init();
  });
} else {
  window.contentLoader = new ContentLoader();
  window.contentLoader.init();
}
