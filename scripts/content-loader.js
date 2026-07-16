/**
 * Content Loader
 * Fetches portfolio data from JSON and dynamically populates the page
 * Optimized for performance: consolidates logic, implements lazy loading,
 * and handles pagination for the homepage.
 */

class ContentLoader {
  constructor() {
    this.dataUrl = 'data/portfolio.json';
    this.data = null;
    this.portfolioData = []; // Flattened and randomized for homepage
    this.mediaData = {};     // Categorized data (merged)

    // Pagination state for homepage
    this.visibleImagesCount = 0;
    this.visibleVideosCount = 0;
    this.activeCategory = 'all';
  }

  /**
   * Initialize content loading
   */
  async init() {
    try {
      await this.loadData();

      var isHomepage = !!document.getElementById('portfolio-inline-grid');

      if (isHomepage) {
        this.setupHomepageGallery();
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
   * Fetch and process JSON data
   */
  async loadData() {
    var self = this;
    try {
      var promises = [
        fetch('data/portfolio.json').catch(function() { return null; }),
        fetch('data/new_portfolio.json').catch(function() { return null; })
      ];

      var responses = await Promise.all(promises);
      var res1 = responses[0];
      var res2 = responses[1];

      var data1 = null;
      if (res1 && res1.ok) data1 = await res1.json();

      var data2 = null;
      if (res2 && res2.ok) data2 = await res2.json();

      if (!data1 && !data2) {
        throw new Error("Failed to load portfolio data");
      }

      // Main data source for metadata
      this.data = data1 || data2;

      // Optimization: Cache flattened categories once during ingestion
      this.flatAll = [];

      var globalSeen = new Set();
      var integrate = function(data) {
        if (!data) return;
        var categoriesObj = (data.portfolio && data.portfolio.images) ? data.portfolio.images : data;
        Object.keys(categoriesObj).forEach(function(cat) {
          if (Array.isArray(categoriesObj[cat])) {
            if (!self.mediaData[cat]) self.mediaData[cat] = [];

            var formattedCat = self.getCategoryName(cat);

            categoriesObj[cat].forEach(function(item) {
              if (globalSeen.has(item.src)) return;
              globalSeen.add(item.src);

              var processed = {
                type: item.type === 'video' ? 'video' : 'image',
                category: cat,
                formattedCategory: formattedCat,
                src: item.src,
                alt: item.alt || item.title || (formattedCat + ' Photography'),
                poster: item.poster || item.thumb || '',
                title: item.title || '',
                aspectRatio: item.aspectRatio || ''
              };
              self.mediaData[cat].push(processed);
              self.portfolioData.push(processed);
            });
          }
        });
      };

      integrate(data1);
      integrate(data2);

      // Cache the full flattened list for the "All" category in Full Gallery mode
      this.flatAll = this.portfolioData.slice();

      // Randomize for homepage variety
      for (var i = this.portfolioData.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = this.portfolioData[i];
        this.portfolioData[i] = this.portfolioData[j];
        this.portfolioData[j] = temp;
      }

      return this.data;
    } catch (error) {
      throw new Error("Failed to load portfolio data: " + error.message);
    }
  }

  /**
   * Setup homepage-specific gallery logic (Pagination + Load More)
   */
  setupHomepageGallery() {
    var self = this;
    var loadMoreBtn = document.getElementById('inline-load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', function() {
        if (self.activeCategory === 'cinematics' || self.activeCategory === 'video') {
          var grid = document.getElementById('portfolio-inline-grid');
          if (grid) grid.innerHTML = '';
          self.appendItems(0, 1);
        } else {
          self.appendItems(3, 0);
        }
      });
    }

    this.renderInlineInitial();
  }

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

    var iAdd = 0, vAdd = 0;
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

  appendItems(imgCount, vidCount) {
    var self = this;
    var grid = document.getElementById('portfolio-inline-grid');
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

    for (var i = 0; i < vidCount; i++) {
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
        img.alt = item.alt;
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

        if (window.Core && window.Core.VideoHover) {
          window.Core.VideoHover.init(vid);
        } else {
          vid.addEventListener('mouseenter', function() { vid.play().catch(function() {}); });
          vid.addEventListener('mouseleave', function() { vid.pause(); });
        }
        el.appendChild(vid);
      }

      // Click handler for Lightbox
      el.addEventListener('click', function() {
        if (window.Core && window.Core.Lightbox) {
          var visibleItems = self.getHomepageVisibleItems();
          var targetIndex = -1;
          for (var k = 0; k < visibleItems.length; k++) {
            if (visibleItems[k].src === item.src) {
              targetIndex = k;
              break;
            }
          }
          window.Core.Lightbox.open(targetIndex >= 0 ? targetIndex : 0, visibleItems);
        }
      });

      frag.appendChild(el);
    });

    grid.appendChild(frag);

    this.updateLoadMoreVisibility(images.length, videos.length);
  }

  getHomepageVisibleItems() {
    var self = this;
    var items = [];
    var els = document.querySelectorAll('#portfolio-inline-grid .portfolio-item');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var media = el.querySelector('img, video');
      if (media) {
        items.push({
          src: media.src,
          type: el.dataset.type,
          title: '',
          category: self.getCategoryName(self.activeCategory)
        });
      }
    }
    return items;
  }

  updateLoadMoreVisibility(totalImages, totalVideos) {
    var moreBtnWrapper = document.getElementById('portfolio-inline-more');
    if (!moreBtnWrapper) return;

    var moreImg = this.visibleImagesCount < totalImages;
    var moreVid = this.visibleVideosCount < totalVideos;

    if (this.activeCategory === 'cinematics' || this.activeCategory === 'video') {
      moreBtnWrapper.style.display = moreVid ? 'block' : 'none';
    } else if (this.activeCategory === 'all') {
      moreBtnWrapper.style.display = 'none';
    } else {
      moreBtnWrapper.style.display = moreImg ? 'block' : 'none';
    }
  }

  /**
   * Populate gallery grid (Full Gallery Mode)
   */
  populateGallery() {
    this.renderCategory('all');
  }

  /**
   * Helper to get category name
   */
  getCategoryName(category) {
    return ContentLoader.CATEGORY_NAMES[category] || category;
  }

  /**
   * Get items for a category
   */
  getFilteredItems(category) {
    if (category === 'all') {
      return this.flatAll || [];
    }
    return this.mediaData[category] || [];
  }

  /**
   * Render gallery items for a category
   */
  renderCategory(category) {
    var self = this;
    var galleryGrid = document.getElementById('gallery-grid') || document.getElementById('portfolio-inline-grid');
    if (!galleryGrid) return;

    if (galleryGrid.id === 'portfolio-inline-grid') {
      this.activeCategory = category;
      this.renderInlineInitial();
      return;
    }

    var items = this.getFilteredItems(category);
    galleryGrid.innerHTML = '';

    if (items.length === 0) {
      galleryGrid.innerHTML = '<p class="no-items">No items found in this category.</p>';
      return;
    }

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

      el.addEventListener('click', function() {
        if (window.Core && window.Core.Lightbox) {
          window.Core.Lightbox.open(index, items);
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
        img.dataset.src = item.src;
        img.alt = item.alt;
        img.className = 'gallery-image';
        if (item.aspectRatio) img.style.aspectRatio = item.aspectRatio;
        el.appendChild(img);
      }

      var overlay = document.createElement('div');
      overlay.className = 'gallery-overlay';

      var title = document.createElement('h3');
      title.className = 'gallery-title';
      title.textContent = item.title || 'Untitled';

      var catLabel = document.createElement('p');
      catLabel.className = 'gallery-category';
      catLabel.textContent = item.formattedCategory || self.getCategoryName(item.category || category);

      overlay.appendChild(title);
      overlay.appendChild(catLabel);
      el.appendChild(overlay);

      fragment.appendChild(el);
    });

    galleryGrid.appendChild(fragment);
    this.initLazyLoader();
  }

  /**
   * Re-run IntersectionObserver on lazy images
   */
  initLazyLoader() {
    var lazyImages = document.querySelectorAll('#gallery-grid img[data-src]');

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

    lazyImages.forEach(function(img) {
      if (img.dataset.src) {
        window.lazyImageObserver.observe(img);
      }
    });
  }

  /**
   * Populate events section
   */
  populateEvents() {
    var eventsGrid = document.querySelector('.events-grid');
    if (!eventsGrid || !this.data || !this.data.recentEvents) return;

    eventsGrid.innerHTML = '';

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
    var self = this;
    var sections = {
      'publications': 'publication-item',
      'awards': 'li',
      'clients': 'client-item'
    };

    Object.keys(sections).forEach(function(id) {
      var className = sections[id];
      var container = document.getElementById(id);
      var data = (self.data && self.data.socialProof) ? self.data.socialProof[id] : null;
      if (container && data) {
        container.innerHTML = '';
        data.forEach(function(text) {
          var el = document.createElement(className === 'li' ? 'li' : 'span');
          if (className !== 'li') el.className = className;
          el.textContent = text;
          container.appendChild(el);
        });
      }
    });
  }

  /**
   * Handle errors
   */
  handleError(error) {
    console.error('❌ Content loading error:', error);
    var galleryGrid = document.getElementById('gallery-grid') || document.getElementById('portfolio-inline-grid');
    if (galleryGrid) {
      galleryGrid.innerHTML = '<div class="content-error">' +
          '<p>Unable to load portfolio content. Please try refreshing the page.</p>' +
          '<p class="error-details">' + error.message + '</p>' +
        '</div>';
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
  'perwedding': 'Pre-Wedding',
  'pre-wedding-photos-and-videos': 'Pre-Wedding',
  'cinematics': 'Cinematics',
  'video': 'Cinematics'
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
