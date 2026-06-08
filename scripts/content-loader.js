/**
 * Content Loader
 * Fetches portfolio data from JSON and dynamically populates the page
 */

var ContentLoader = function() {
  // Use relative paths to support non-root hosting
  this.dataUrls = ['data/portfolio.json', 'data/new_portfolio.json'];
  this.data = null;
  this.allImages = []; // Flattened and processed items
  this.mediaData = {}; // Merged raw portfolio images

  this.visibleImagesCount = 0;
  this.visibleVideosCount = 0;
  this.activeCategory = 'all';

  this.grid = null;
  this.moreBtnWrapper = null;
  this.loadMoreBtn = null;
};

ContentLoader.prototype.init = function() {
  var self = this;
  return this.loadData()
    .then(function() {
      // Setup UI elements if on homepage
      self.setupHomepageUI();

      self.populateGallery();
      
      // Initialize Gallery Interactions (after content is loaded)
      if (window.GalleryManager) {
        window.GalleryManager.init();
      }
      
      self.populateEvents();
      self.populateAbout();
    })
    ['catch'](function(error) {
      self.handleError(error);
    });
};

ContentLoader.prototype.setupHomepageUI = function() {
  var self = this;
  this.grid = document.getElementById('portfolio-inline-grid');
  this.moreBtnWrapper = document.getElementById('portfolio-inline-more');
  this.loadMoreBtn = document.getElementById('inline-load-more-btn');

  if (this.loadMoreBtn) {
    this.loadMoreBtn.addEventListener('click', function() {
      if (self.activeCategory === 'cinematics' || self.activeCategory === 'video') {
        if (self.grid) {
          self.grid.innerHTML = '';
        }
        self.appendItems(0, 1);
      } else {
        self.appendItems(3, 0);
      }
    });
  }

  // Category buttons on homepage
  var categoryBtns = document.querySelectorAll('.category-btn');
  if (categoryBtns.length > 0) {
    for (var i = 0; i < categoryBtns.length; i++) {
      (function(index) {
        var btn = categoryBtns[index];
        btn.addEventListener('click', function() {
          var newCategory = btn.getAttribute('data-category');
          if (self.activeCategory !== newCategory) {
            // Update button states
            for (var j = 0; j < categoryBtns.length; j++) {
              categoryBtns[j].classList.remove('active');
              categoryBtns[j].setAttribute('aria-selected', 'false');
            }
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            // GalleryManager handles button states and calls renderCategory
            if (window.GalleryManager && window.GalleryManager.filterGallery) {
               window.GalleryManager.filterGallery(newCategory);
            } else {
               self.renderCategory(newCategory);
            }
          }
        });
      })(i);
    }
  }
};

ContentLoader.prototype.loadData = function() {
  var self = this;
  var promises = this.dataUrls.map(function(url) {
    return fetch(url)
      .then(function(res) { return res.ok ? res.json() : null; })
      ['catch'](function() { return null; });
  });

  return Promise.all(promises).then(function(results) {
    self.mediaData = {};
    for (var i = 0; i < results.length; i++) {
      var data = results[i];
      if (!data) continue;

      // Handle both possible structures
      var images = (data.portfolio && data.portfolio.images) ? data.portfolio.images : data;

      var keys = Object.keys(images);
      for (var j = 0; j < keys.length; j++) {
        var cat = keys[j];
        if (Array.isArray(images[cat])) {
          if (!self.mediaData[cat]) {
            self.mediaData[cat] = [];
          }
          self.mediaData[cat] = self.mediaData[cat].concat(images[cat]);
        }
      }

      // Store first data source for other sections (events, etc.)
      if (!self.data) {
        self.data = data;
      }
    }

    // Process and flatten data
    self.processData();

    return self.data;
  })['catch'](function(error) {
    throw new Error('Failed to load portfolio data: ' + error.message);
  });
};

ContentLoader.prototype.processData = function() {
  var self = this;
  this.allImages = [];
  if (!this.mediaData) return;

  var categories = Object.keys(this.mediaData);
  for (var i = 0; i < categories.length; i++) {
    var category = categories[i];
    var items = this.mediaData[category];
    if (Array.isArray(items)) {
      for (var j = 0; j < items.length; j++) {
        var item = items[j];
        self.allImages.push({
          type: item.type === 'video' ? 'video' : 'image',
          category: category,
          src: item.src,
          alt: item.alt ? item.alt : (item.title ? item.title : 'Portfolio media'),
          poster: item.poster ? item.poster : (item.thumb ? item.thumb : ''),
          title: item.title ? item.title : '',
          aspectRatio: item.aspectRatio ? item.aspectRatio : ''
        });
      }
    }
  }

  // Remove duplicates based on src
  var seen = {};
  this.allImages = this.allImages.filter(function(item) {
    if (seen[item.src]) return false;
    seen[item.src] = true;
    return true;
  });

  // Randomize for fresh experience
  for (var k = this.allImages.length - 1; k > 0; k--) {
    var rand = Math.floor(Math.random() * (k + 1));
    var temp = this.allImages[k];
    this.allImages[k] = this.allImages[rand];
    this.allImages[rand] = temp;
  }
};

ContentLoader.prototype.populateGallery = function() {
  this.renderCategory('all');
};

ContentLoader.prototype.getCategoryName = function(category) {
  var name = ContentLoader.CATEGORY_NAMES[category];
  return name ? name : category;
};

ContentLoader.prototype.getFilteredItems = function(category, type) {
  var items = category === 'all'
    ? this.allImages
    : this.allImages.filter(function(item) { return item.category === category; });

  if (type) {
    items = items.filter(function(item) { return item.type === type; });
  }

  return items;
};

ContentLoader.prototype.renderCategory = function(category) {
  this.activeCategory = category;

  // Check which grid we are targeting
  var inlineGrid = document.getElementById('portfolio-inline-grid');
  var fullGrid = document.getElementById('gallery-grid');
  var galleryGrid = fullGrid ? fullGrid : inlineGrid;

  if (!galleryGrid) return;

  if (inlineGrid) {
    // Incremental rendering for homepage
    this.renderIncremental(inlineGrid, category);
  } else {
    // Full rendering for other pages
    this.renderFull(fullGrid, category);
  }

  // Refresh ScrollTrigger if available
  if (window.ScrollTrigger) {
    setTimeout(function() { window.ScrollTrigger.refresh(); }, 200);
  }
};

ContentLoader.prototype.renderFull = function(container, category) {
  var self = this;
  var items = this.getFilteredItems(category);
  container.innerHTML = '';

  if (items.length === 0) {
    container.innerHTML = '<p class="no-items">No items found in this category.</p>';
    return;
  }

  var fragment = document.createDocumentFragment();
  for (var i = 0; i < items.length; i++) {
    var el = self.createGalleryItem(items[i], i, category);
    fragment.appendChild(el);
  }

  container.appendChild(fragment);
  this.initLazyLoader();

  // Update GalleryManager if it exists
  if (window.GalleryManager) {
    window.GalleryManager.allImages = items.map(function(item, idx) {
      var entry = {};
      for (var key in item) { if (item.hasOwnProperty(key)) entry[key] = item[key]; }
      entry.originalIndex = idx;
      return entry;
    });
  }
};

ContentLoader.prototype.renderIncremental = function(container, category) {
  container.innerHTML = '';
  this.visibleImagesCount = 0;
  this.visibleVideosCount = 0;

  // Toggle cinematics layout mode
  if (category === 'cinematics' || category === 'video') {
    container.classList.add('cinematics-mode');
  } else {
    container.classList.remove('cinematics-mode');
  }

  var iAdd = 0;
  var vAdd = 0;
  if (category === 'cinematics' || category === 'video') {
    vAdd = 1;
  } else if (category === 'all') {
    iAdd = 3;
    vAdd = 0;
  } else {
    iAdd = 3;
    vAdd = 1;
  }

  this.appendItems(iAdd, vAdd);
};

ContentLoader.prototype.appendItems = function(imgCount, vidCount) {
  var self = this;
  var images = this.getFilteredItems(this.activeCategory, 'image');
  var videos = this.getFilteredItems(this.activeCategory, 'video');

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
  for (var k = 0; k < toAppend.length; k++) {
    var el = this.createHomepageItem(toAppend[k], k);
    frag.appendChild(el);
  }

  if (this.grid) {
    this.grid.appendChild(frag);
  }

  // Update Load More button visibility
  if (this.moreBtnWrapper) {
    var moreImg = this.visibleImagesCount < images.length;
    var moreVid = this.visibleVideosCount < videos.length;

    if (this.activeCategory === 'cinematics' || this.activeCategory === 'video') {
      this.moreBtnWrapper.style.display = moreVid ? 'block' : 'none';
    } else if (this.activeCategory === 'all') {
      this.moreBtnWrapper.style.display = 'none';
    } else {
      this.moreBtnWrapper.style.display = moreImg ? 'block' : 'none';
    }
  }
};

ContentLoader.prototype.createHomepageItem = function(item, idx) {
  var self = this;
  var el = document.createElement('div');
  el.className = 'portfolio-item fade-in-up';
  el.dataset.type = item.type;
  el.style.animationDelay = (idx * 60) + 'ms';
  el.setAttribute('tabindex', '0');
  el.setAttribute('role', 'button');

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
    if (item.poster) {
      vid.poster = item.poster;
    }
    vid.muted = true;
    vid.loop = true;
    vid.setAttribute('playsinline', '');
    vid.preload = 'metadata';
    vid.addEventListener('mouseenter', function() { vid.play()['catch'](function() {}); });
    vid.addEventListener('mouseleave', function() { vid.pause(); });
    el.appendChild(vid);
  }

  // Add click for lightbox
  el.onclick = function() {
     if (window.Core && window.Core.Lightbox) {
       var grid = el.parentElement;
       if (!grid) return;

       var itemEls = grid.querySelectorAll('.portfolio-item');
       var items = [];
       for (var i = 0; i < itemEls.length; i++) {
          var itemEl = itemEls[i];
          var media = itemEl.querySelector('img, video');
          items.push({
            src: media.src,
            type: itemEl.dataset.type,
            poster: media.poster ? media.poster : '',
            alt: media.alt ? media.alt : ''
          });
       }

       var index = -1;
       var children = grid.children;
       for (var j = 0; j < children.length; j++) {
         if (children[j] === el) {
           index = j;
           break;
         }
       }
       window.Core.Lightbox.open(index, items);
     }
  };

  return el;
};

ContentLoader.prototype.createGalleryItem = function(item, index, category) {
  var self = this;
  var isVideo = item.type === 'video';
  var el = document.createElement('article');
  el.className = 'gallery-item ' + (isVideo ? 'gallery-item--video' : 'gallery-item--image') + ' reveal-item loading';
  el.dataset.index = index;
  el.dataset.category = category === 'all' ? (item.category ? item.category : 'uncategorized') : category;
  el.setAttribute('tabindex', '0');
  el.setAttribute('role', 'button');
  el.setAttribute('aria-label', (item.title ? item.title : 'Open preview') + (item.category ? ', ' + item.category : ''));

  // Click handler for lightbox
  el.addEventListener('click', function() {
    var visibleItems = (window.GalleryManager && window.GalleryManager.getVisibleData) ? window.GalleryManager.getVisibleData() : self.getFilteredItems(category);
    var itemIndex = -1;
    for (var i = 0; i < visibleItems.length; i++) {
      if (visibleItems[i].originalIndex === index) {
        itemIndex = i;
        break;
      }
    }
    var targetIndex = itemIndex >= 0 ? itemIndex : index;

    if (window.Core && window.Core.Lightbox) {
      window.Core.Lightbox.open(targetIndex, visibleItems);
    }
  });

  if (isVideo) {
    var video = document.createElement('video');
    video.src = item.src;
    video.controls = true;
    video.playsInline = true;
    video.className = 'gallery-image';
    if (item.aspectRatio) {
      video.style.aspectRatio = item.aspectRatio;
    }
    el.appendChild(video);
  } else {
    var img = document.createElement('img');
    img.dataset.src = item.src; // Lazy load
    img.alt = item.alt ? item.alt : (item.title ? item.title : '');
    img.className = 'gallery-image';
    if (item.aspectRatio) {
      img.style.aspectRatio = item.aspectRatio;
    }
    el.appendChild(img);
  }

  var overlay = document.createElement('div');
  overlay.className = 'gallery-overlay';
  overlay.innerHTML = '<h3 class="gallery-title">' + (item.title ? item.title : 'Untitled') + '</h3>' +
                       '<p class="gallery-category">' + self.getCategoryName(item.category ? item.category : category) + '</p>';
  el.appendChild(overlay);

  return el;
};

ContentLoader.prototype.initLazyLoader = function() {
  var self = this;
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

  for (var i = 0; i < lazyImages.length; i++) {
    var img = lazyImages[i];
    if (img.dataset.src) {
      window.lazyImageObserver.observe(img);
    }
  }
};

ContentLoader.prototype.populateEvents = function() {
  var self = this;
  var eventsGrid = document.querySelector('.events-grid');
  if (!eventsGrid || !this.data || !this.data.recentEvents) return;

  eventsGrid.innerHTML = '';
  var events = this.data.recentEvents;
  for (var i = 0; i < events.length; i++) {
    var event = events[i];
    var item = document.createElement('div');
    item.className = 'event-item';

    var img = document.createElement('img');
    img.src = event.src;
    img.alt = event.alt ? event.alt : event.title;
    img.className = 'event-image';
    img.loading = 'lazy';
    if (event.aspectRatio) {
      img.style.aspectRatio = event.aspectRatio;
    }

    var overlay = document.createElement('div');
    overlay.className = 'gallery-overlay';
    overlay.innerHTML = '<h3 class="gallery-title">' + event.title + '</h3>' +
                         '<p class="gallery-category">' + event.category + '</p>';

    item.appendChild(img);
    item.appendChild(overlay);
    eventsGrid.appendChild(item);
  }
};

ContentLoader.prototype.populateAbout = function() {
  var self = this;
  var populate = function(id, data) {
    var container = document.getElementById(id);
    if (container && data) {
      container.innerHTML = '';
      for (var i = 0; i < data.length; i++) {
        var text = data[i];
        var el = document.createElement(id === 'awards' ? 'li' : 'span');
        if (id !== 'awards') {
          el.className = id.slice(0, -1) + '-item';
        }
        el.textContent = text;
        container.appendChild(el);
      }
    }
  };

  if (this.data && this.data.socialProof) {
    populate('publications', this.data.socialProof.publications);
    populate('awards', this.data.socialProof.awards);
    populate('clients', this.data.socialProof.clients);
  }
};

ContentLoader.prototype.handleError = function(error) {
  console.error('❌ Content loading error:', error);
  var galleryGrid = document.getElementById('gallery-grid') || document.getElementById('portfolio-inline-grid');
  if (galleryGrid) {
    galleryGrid.innerHTML = '<div class="content-error">' +
      '<p>Unable to load portfolio content. Please try refreshing the page.</p>' +
      '<p class="error-details">' + error.message + '</p>' +
    '</div>';
  }
};

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
  'cinematics': 'Cinematics',
  'candid': 'Candid',
  'hero': 'Hero',
  'video': 'Video',
  'perwedding': 'Pre-Wedding',
  'model': 'Model'
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
