/**
 * Content Loader
 * Fetches portfolio data from JSON and dynamically populates the page
 * Optimized with incremental rendering and unified data fetching.
 */

class ContentLoader {
  constructor() {
    this.dataUrl = '/data/portfolio.json';
    this.newDataUrl = '/data/new_portfolio.json';
    this.data = null;
    this.allImages = []; // Flattened and unified media list

    // Incremental rendering state
    this.visibleImagesCount = 0;
    this.visibleVideosCount = 0;
    this.activeCategory = 'all';
  }

  /**
   * Initialize content loading
   */
  init() {
    var _this = this;
    return this.loadData().then(function() {
      // Initialize Gallery Interactions (after content is loaded)
      if (window.GalleryManager) {
        window.GalleryManager.init();
      } else {
        _this.initInlineFilters();
      }
      
      // Initial render (All category)
      _this.renderCategory('all');
      _this.initLoadMore();

      _this.populateEvents();
      _this.populateAbout();
    }).catch(function(error) {
      _this.handleError(error);
    });
  }

  /**
   * Fetch JSON data from multiple sources and integrate
   */
  loadData() {
    var _this = this;
    try {
      return Promise.all([
        fetch(this.dataUrl).then(function(r) { return r.ok ? r.json() : null; }).catch(function() { return null; }),
        fetch(this.newDataUrl).then(function(r) { return r.ok ? r.json() : null; }).catch(function() { return null; })
      ]).then(function(results) {
        var res1 = results[0];
        var res2 = results[1];
        _this.data = res1 || { portfolio: { images: {} } };

        // Clear and integrate with O(1) deduplication
        _this.allImages = [];
        var seenSrcs = {};

        var integrate = function(data) {
          if (!data) return;
          var images = (data.portfolio && data.portfolio.images) ? data.portfolio.images : data;

          Object.keys(images).forEach(function(category) {
            if (Array.isArray(images[category])) {
              images[category].forEach(function(item) {
                if (!seenSrcs[item.src]) {
                  seenSrcs[item.src] = true;
                  var newItem = Object.assign({}, item);
                  newItem.category = category;
                  newItem.type = item.type === 'video' ? 'video' : 'image';
                  _this.allImages.push(newItem);
                }
              });
            }
          });
        };

        integrate(res1);
        integrate(res2);

        // Globally randomize the array so EVERY category shows randomly on page load
        _this.shuffleArray(_this.allImages);

        return _this.data;
      });
    } catch (error) {
      throw new Error('Failed to load portfolio data: ' + error.message);
    }
  }

  /**
   * Randomize array in place
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  }

  /**
   * Get images for a category and type
   */
  getFilteredItems(category, type) {
    return this.allImages.filter(function(item) {
      return (category === 'all' || item.category === category) && item.type === type;
    });
  }

  /**
   * Render gallery items for a category with incremental loading
   * @param {string} category - Category slug
   */
  renderCategory(category) {
    this.activeCategory = category;
    this.visibleImagesCount = 0;
    this.visibleVideosCount = 0;

    // Support both gallery-grid (portfolio.html/gallery.html) and portfolio-inline-grid (index.html)
    let grid = document.getElementById('portfolio-inline-grid') || document.getElementById('gallery-grid');
    if (!grid) return;

    // Clear existing
    grid.innerHTML = '';

    // Layout mode for cinematics
    if (category === 'cinematics') {
      grid.classList.add('cinematics-mode');
    } else {
      grid.classList.remove('cinematics-mode');
    }

    // Determine initial batch sizes
    let iAdd = 0, vAdd = 0;
    if (category === 'cinematics') {
      vAdd = 1;
    } else if (category === 'all') {
      iAdd = 3;
      vAdd = 0;
    } else {
      iAdd = 3;
      vAdd = 1;
    }

    this.appendItems(iAdd, vAdd);
  }

  /**
   * Append a batch of items to the grid
   */
  appendItems(imgCount, vidCount) {
    const grid = document.getElementById('portfolio-inline-grid') || document.getElementById('gallery-grid');
    if (!grid) return;

    const images = this.getFilteredItems(this.activeCategory, 'image');
    const videos = this.getFilteredItems(this.activeCategory, 'video');
    const _this = this;

    const toAppend = [];

    for (let i = 0; i < imgCount; i++) {
      if (this.visibleImagesCount < images.length) {
        toAppend.push(images[this.visibleImagesCount]);
        this.visibleImagesCount++;
      }
    }

    for (let i = 0; i < vidCount; i++) {
      if (this.visibleVideosCount < videos.length) {
        toAppend.push(videos[this.visibleVideosCount]);
        this.visibleVideosCount++;
      }
    }

    if (toAppend.length === 0) {
      if (grid.children.length === 0) {
        grid.innerHTML = '<p class="no-items">No items found in this category.</p>';
      }
      return;
    }

    const fragment = document.createDocumentFragment();

    toAppend.forEach(function(item, idx) {
      const el = document.createElement('div');
      el.className = 'portfolio-item fade-in-up gallery-item';
      el.dataset.type = item.type;
      el.dataset.index = _this.allImages.indexOf(item);
      el.style.animationDelay = (idx * 60) + 'ms';

      // Lightbox click handler
      el.addEventListener('click', function() {
         if (window.Core && window.Core.Lightbox) {
           // Get current context items for lightbox navigation
           const contextItems = _this.allImages.filter(function(i) {
             return (_this.activeCategory === 'all' || i.category === _this.activeCategory);
           });
           const targetIndex = contextItems.indexOf(item);
           window.Core.Lightbox.open(targetIndex >= 0 ? targetIndex : 0, contextItems);
         }
      });

      if (item.type === 'image') {
        const img = document.createElement('img');
        img.src = item.src;
        img.alt = item.alt || 'Portfolio image';
        img.loading = 'lazy';
        img.decoding = 'async';
        el.appendChild(img);
      } else {
        const vid = document.createElement('video');
        vid.src = item.src;
        // Optimization: Fallback to thumb if poster is missing
        if (item.poster || item.thumb) {
          vid.poster = item.poster || item.thumb;
        }
        vid.muted = true;
        vid.loop = true;
        vid.setAttribute('playsinline', '');
        vid.preload = 'metadata';

        // Hover/Touch play behavior
        el.addEventListener('mouseenter', function() { vid.play().catch(function() {}); });
        el.addEventListener('mouseleave', function() { vid.pause(); });

        el.appendChild(vid);
      }

      fragment.appendChild(el);
    });

    grid.appendChild(fragment);

    // Update "Load More" button visibility
    this.updateLoadMoreVisibility(images.length, videos.length);
  }

  /**
   * Update visibility of the Load More button
   */
  updateLoadMoreVisibility(totalImages, totalVideos) {
    const moreBtnWrapper = document.getElementById('portfolio-inline-more');
    if (!moreBtnWrapper) return;

    const moreImg = this.visibleImagesCount < totalImages;
    const moreVid = this.visibleVideosCount < totalVideos;

    let shouldShow = false;
    if (this.activeCategory === 'cinematics') {
      shouldShow = moreVid;
    } else if (this.activeCategory === 'all') {
      shouldShow = false; // Hide on 'all' as per spec
    } else {
      shouldShow = moreImg || moreVid;
    }

    moreBtnWrapper.style.display = shouldShow ? 'block' : 'none';
  }

  /**
   * Initialize Load More button click handler
   */
  initLoadMore() {
    const loadMoreBtn = document.getElementById('inline-load-more-btn');
    const _this = this;
    if (loadMoreBtn) {
      loadMoreBtn.onclick = function() {
        if (_this.activeCategory === 'cinematics') {
          const grid = document.getElementById('portfolio-inline-grid') || document.getElementById('gallery-grid');
          if (grid) grid.innerHTML = ''; // Replace for cinematics
          _this.appendItems(0, 1);
        } else {
          _this.appendItems(3, 0);
        }
      };
    }
  }

  /**
   * Fallback filter initialization if GalleryManager is missing
   */
  initInlineFilters() {
     const categoryBtns = document.querySelectorAll('.category-btn');
     const _this = this;
     categoryBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          categoryBtns.forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
          const newCategory = btn.getAttribute('data-category');
          if (_this.activeCategory !== newCategory) {
            _this.renderCategory(newCategory);
          }
        });
      });
  }

  /**
   * Helper to get category name from slug
   */
  getCategoryName(category) {
    return ContentLoader.CATEGORY_NAMES[category] || category;
  }

  /**
   * Populate events section
   */
  populateEvents() {
    const eventsGrid = document.querySelector('.events-grid');
    if (!eventsGrid || !this.data || !this.data.recentEvents) return;

    eventsGrid.innerHTML = '';
    this.data.recentEvents.forEach(function(event) {
      const item = document.createElement('div');
      item.className = 'event-item';
      
      const img = document.createElement('img');
      img.src = event.src;
      img.alt = event.alt || event.title;
      img.className = 'event-image';
      img.loading = 'lazy';
      
      if (event.aspectRatio) img.style.aspectRatio = event.aspectRatio;
      
      const overlay = document.createElement('div');
      overlay.className = 'gallery-overlay';
      
      const title = document.createElement('h3');
      title.className = 'gallery-title';
      title.textContent = event.title;
      
      const category = document.createElement('p');
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
    const containers = {
      'publications': 'publication-item',
      'awards': 'award-item',
      'clients': 'client-item'
    };
    const _this = this;

    Object.keys(containers).forEach(function(id) {
      const className = containers[id];
      const container = document.getElementById(id);
      if (container && _this.data && _this.data.socialProof && _this.data.socialProof[id]) {
        container.innerHTML = '';
        _this.data.socialProof[id].forEach(function(text) {
          const el = document.createElement(id === 'awards' ? 'li' : 'span');
          if (className) el.className = className;
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
    const grid = document.getElementById('portfolio-inline-grid') || document.getElementById('gallery-grid');
    if (grid) {
      grid.innerHTML = '<div class="content-error">' +
          '<p>Unable to load portfolio content. Please try refreshing.</p>' +
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
  'candid': 'Candid',
  'model': 'Model',
  'video': 'Video'
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
