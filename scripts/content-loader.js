/**
 * Content Loader
 * Fetches portfolio data from JSON and dynamically populates the page.
 * Optimized to prevent redundant fetches and handle configurable pagination.
 */

var ContentLoader = function() {
  this.dataUrls = ['data/portfolio.json', 'data/new_portfolio.json'];
  this.mediaData = {}; // Grouped by category
  this.allWork = []; // Flattened and randomized list for "All" view

  // Pagination and state tracking
  this.activeCategory = 'all';
  this.visibleImagesCount = 0;
  this.visibleVideosCount = 0;
  this.shuffledAll = []; // Persistent shuffle for 'all' category

  // Cache for DOM elements
  this.grid = document.getElementById('portfolio-inline-grid') || document.getElementById('gallery-grid');
  this.moreBtnWrapper = document.getElementById('portfolio-inline-more') || document.getElementById('load-more-container');
  this.loadMoreBtn = document.getElementById('inline-load-more-btn') || document.getElementById('load-more-btn');
  this.categoryBtns = document.querySelectorAll('.category-btn, .filter-chip');

  // Detect environment
  this.isHomepage = !!document.getElementById('portfolio-inline-grid');
  this.itemsPerPage = this.isHomepage ? 3 : 12;
};

/**
 * Initialize content loading
 */
ContentLoader.prototype.init = function() {
  var _this = this;
  if (!this.grid) return;

  // Safety check for Core dependencies
  if (!(window.Core && window.Core.Media)) {
    console.warn('Bolt: Core engine not found. Retrying in 100ms...');
    setTimeout(function() { _this.init(); }, 100);
    return;
  }

  this.loadData().then(function() {
    _this.setupListeners();
    _this.renderInitial();

    // Secondary initializations
    _this.populateEvents();
    _this.populateAbout();
  }).catch(function(error) {
    console.error('ContentLoader init error:', error);
  });
};

/**
 * Fetch and merge JSON data sources
 */
ContentLoader.prototype.loadData = function() {
  var _this = this;
  var fetchPromises = this.dataUrls.map(function(url) {
    return fetch(url).then(function(res) {
      return res.ok ? res.json() : null;
    }).catch(function() { return null; });
  });

  return Promise.all(fetchPromises).then(function(datasets) {
    var seenUrls = new Set();
    var tempAllWork = [];

    datasets.forEach(function(data) {
      if (!data) return;

      var imagesObj = (data.portfolio && data.portfolio.images) ? data.portfolio.images : data;
      if (!imagesObj) return;

      Object.keys(imagesObj).forEach(function(category) {
        if (!Array.isArray(imagesObj[category])) return;

        if (!_this.mediaData[category]) _this.mediaData[category] = [];

        imagesObj[category].forEach(function(item) {
          if (seenUrls.has(item.src)) return;
          seenUrls.add(item.src);

          var processedItem = Object.assign({}, item, {
            category: category,
            type: item.type === 'video' ? 'video' : 'image',
            title: item.title || item.alt || 'Portfolio Media',
            alt: item.alt || item.title || 'Portfolio Photography'
          });

          _this.mediaData[category].push(processedItem);
          tempAllWork.push(processedItem);
        });
      });

      if (data.recentEvents) _this.recentEvents = data.recentEvents;
      if (data.socialProof) _this.socialProof = data.socialProof;
      if (data.about) _this.aboutData = data.about;
    });

    // Assign originalIndex for Lightbox synchronization
    _this.allWork = tempAllWork.map(function(item, index) {
      item.originalIndex = index;
      return item;
    });

    _this.shuffledAll = _this.shuffleArray(_this.allWork.map(function(item) {
      return Object.assign({}, item);
    }));

    // Expose for external components like Lightbox
    window.GalleryManager = Object.assign(window.GalleryManager || {}, {
      renderCategory: function(cat) { return _this.renderCategory(cat); },
      getVisibleData: function() {
        if (_this.activeCategory === 'all') return _this.shuffledAll;
        var imgs = _this.getFilteredItems('image');
        var vids = _this.getFilteredItems('video');
        return imgs.concat(vids);
      }
    });
  });
};

ContentLoader.prototype.shuffleArray = function(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
};

ContentLoader.prototype.getCategoryName = function(slug) {
  var names = {
    'weddings': 'Weddings',
    'perwedding': 'Pre-Wedding',
    'pre-wedding-photos-and-videos': 'Pre-Wedding',
    'cinematics': 'Cinematics',
    'video': 'Cinematics'
  };
  return names[slug] || slug;
};

ContentLoader.prototype.getFilteredItems = function(type) {
  var categoryMap = {
    'pre-wedding-photos-and-videos': 'perwedding'
  };
  var key = categoryMap[this.activeCategory] || this.activeCategory;
  var list = this.activeCategory === 'all' ? this.shuffledAll : (this.mediaData[key] || []);
  return list.filter(function(item) { return item.type === type; });
};

ContentLoader.prototype.appendItems = function(imgCount, vidCount) {
  var _this = this;
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
  var allFiltered = images.concat(videos);

  toAppend.forEach(function(item, index) {
    var viewIndex = allFiltered.indexOf(item);
    var el = window.Core.Media.createItem(item, viewIndex, allFiltered, function(s) {
      return _this.getCategoryName(s);
    });

    el.dataset.type = item.type;
    el.classList.add('portfolio-item');
    el.classList.add('fade-in-up');
    el.style.animationDelay = (index * 100) + 'ms';

    fragment.appendChild(el);
  });

  this.grid.appendChild(fragment);
  this.updateMoreButton(images.length, videos.length);

  if (window.Core && window.Core.VideoObserver) {
    var videoEls = this.grid.querySelectorAll('video');
    for (var k = 0; k < videoEls.length; k++) {
      window.Core.VideoObserver.observe(videoEls[k]);
    }
  }
};

ContentLoader.prototype.updateMoreButton = function(totalImages, totalVideos) {
  if (!this.moreBtnWrapper) return;

  var hasMoreImg = this.visibleImagesCount < totalImages;
  var hasMoreVid = this.visibleVideosCount < totalVideos;
  var isCinematics = this.activeCategory === 'cinematics' || this.activeCategory === 'video';

  if (isCinematics) {
    this.moreBtnWrapper.style.display = hasMoreVid ? 'block' : 'none';
  } else if (this.activeCategory === 'all' && this.isHomepage) {
    this.moreBtnWrapper.style.display = 'none';
  } else {
    this.moreBtnWrapper.style.display = (hasMoreImg || hasMoreVid) ? 'block' : 'none';
  }
};

ContentLoader.prototype.renderCategory = function(category) {
  if (category) this.activeCategory = category;
  this.renderInitial();
};

ContentLoader.prototype.renderInitial = function() {
  if (!this.grid) return;
  this.grid.innerHTML = '';
  this.visibleImagesCount = 0;
  this.visibleVideosCount = 0;

  var isCinematics = this.activeCategory === 'cinematics' || this.activeCategory === 'video';

  if (isCinematics) {
    this.grid.classList.add('cinematics-mode');
    this.appendItems(0, 1);
  } else {
    this.grid.classList.remove('cinematics-mode');
    var iAdd = this.itemsPerPage;
    var vAdd = (this.activeCategory === 'all' && this.isHomepage) ? 0 : 1;
    this.appendItems(iAdd, vAdd);
  }
};

ContentLoader.prototype.setupListeners = function() {
  var _this = this;
  this.categoryBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var newCategory = btn.getAttribute('data-category');
      if (_this.activeCategory === newCategory) return;

      _this.categoryBtns.forEach(function(b) {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      _this.activeCategory = newCategory;
      _this.renderInitial();
    });
  });

  if (this.loadMoreBtn) {
    this.loadMoreBtn.addEventListener('click', function() {
      var isCinematics = _this.activeCategory === 'cinematics' || _this.activeCategory === 'video';
      if (isCinematics) {
        _this.grid.innerHTML = '';
        _this.appendItems(0, 1);
      } else {
        _this.appendItems(_this.itemsPerPage, 0);
      }
    });
  }
};

ContentLoader.prototype.populateEvents = function() {
  var eventsGrid = document.querySelector('.events-grid');
  if (!eventsGrid || !this.recentEvents) return;

  eventsGrid.innerHTML = '';
  var fragment = document.createDocumentFragment();

  this.recentEvents.forEach(function(event, index) {
    var item = document.createElement('div');
    item.className = 'event-item fade-in-up';
    item.style.animationDelay = (index * 100) + 'ms';

    var img = document.createElement('img');
    img.src = event.src;
    img.alt = event.alt || event.title;
    img.className = 'event-image';
    img.loading = 'lazy';
    img.setAttribute('decoding', 'async');

    if (event.aspectRatio) img.style.aspectRatio = event.aspectRatio;

    var overlay = document.createElement('div');
    overlay.className = 'gallery-overlay';
    overlay.innerHTML = '<h3 class="gallery-title">' + (event.title || '') + '</h3><p class="gallery-category">' + (event.category || '') + '</p>';

    item.appendChild(img);
    item.appendChild(overlay);
    fragment.appendChild(item);
  });

  eventsGrid.appendChild(fragment);
};

ContentLoader.prototype.populateAbout = function() {
  if (!this.socialProof) return;

  var populate = function(id, data) {
    var container = document.getElementById(id);
    if (container && data) {
      container.innerHTML = '';
      data.forEach(function(text) {
        var el = document.createElement(id === 'awards' ? 'li' : 'span');
        el.className = id.slice(0, -1) + '-item';
        el.textContent = text;
        container.appendChild(el);
      });
    }
  };

  populate('publications', this.socialProof.publications);
  populate('awards', this.socialProof.awards);
  populate('clients', this.socialProof.clients);
};

window.addEventListener('DOMContentLoaded', function() {
  window.contentLoader = new ContentLoader();
  window.contentLoader.init();
});
