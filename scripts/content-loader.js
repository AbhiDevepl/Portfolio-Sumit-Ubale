/**
 * Content Loader
 * Fetches portfolio data from JSON and dynamically populates the page
 */

class ContentLoader {
  constructor() {
    this.dataUrl = '/data/portfolio.json';
    this.newDataUrl = '/data/new_portfolio.json';
    this.data = null;
    this.allImages = [];
    this.mediaData = null;
    this.shuffledAll = [];
    this.visibleImagesCount = 0;
    this.visibleVideosCount = 0;
    this.activeCategory = 'all';
    this.seenSrcs = {};
  }

  async init() {
    try {
      await this.loadData();

      var inlineGrid = document.getElementById('portfolio-inline-grid');
      if (inlineGrid) {
        this.setupHomepageGallery();
      } else {
        this.populateGallery();
      }

      if (window.GalleryManager) {
        window.GalleryManager.init();
      }
      
      this.populateEvents();
      this.populateAbout();
    } catch (error) {
      this.handleError(error);
    }
  }

  async loadData() {
    var self = this;
    try {
      var res1 = await fetch(this.dataUrl);
      var oldData = (res1 && res1.ok) ? await res1.json() : null;

      var newData = null;
      try {
        var res2 = await fetch(this.newDataUrl);
        newData = (res2 && res2.ok) ? await res2.json() : null;
      } catch (e2) {}

      if (!oldData && !newData) {
        throw new Error('Failed to load portfolio data');
      }

      this.data = oldData || newData;
      this.mediaData = {};
      this.seenSrcs = {};

      var integrate = function(data) {
        if (!data) return;
        var images = (data.portfolio && data.portfolio.images) || data;
        var categories = Object.keys(images);
        categories.forEach(function(category) {
          var items = images[category];
          if (Array.isArray(items)) {
            if (!self.mediaData[category]) self.mediaData[category] = [];
            items.forEach(function(item) {
              if (!self.seenSrcs[item.src]) {
                self.seenSrcs[item.src] = true;
                var normalizedItem = Object.assign({}, item);
                normalizedItem.category = category;
                normalizedItem.type = item.type === 'video' ? 'video' : 'image';
                self.mediaData[category].push(normalizedItem);
              }
            });
          }
        });
      };

      integrate(oldData);
      integrate(newData);

      return this.data;
    } catch (error) {
      throw new Error('Failed to load portfolio data: ' + error.message);
    }
  }

  setupHomepageGallery() {
    var self = this;
    var allItems = [];
    var categories = Object.keys(this.mediaData);
    categories.forEach(function(cat) {
      var catItems = self.mediaData[cat];
      catItems.forEach(function(item) {
        allItems.push(item);
      });
    });

    for (var i = allItems.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = allItems[i];
      allItems[i] = allItems[j];
      allItems[j] = temp;
    }
    this.shuffledAll = allItems;

    var loadMoreBtn = document.getElementById('inline-load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.onclick = function() {
        if (self.activeCategory === 'cinematics') {
          var grid = document.getElementById('portfolio-inline-grid');
          if (grid) grid.innerHTML = '';
          self.appendHomepageItems(0, 1);
        } else {
          self.appendHomepageItems(3, 0);
        }
      };
    }

    this.renderHomepageInitial();
  }

  renderHomepageInitial() {
    var grid = document.getElementById('portfolio-inline-grid');
    if (!grid) return;

    grid.innerHTML = '';
    this.visibleImagesCount = 0;
    this.visibleVideosCount = 0;

    if (this.activeCategory === 'cinematics') {
      grid.classList.add('cinematics-mode');
    } else {
      grid.classList.remove('cinematics-mode');
    }

    var iAdd = 0;
    var vAdd = 0;
    if (this.activeCategory === 'cinematics') {
      vAdd = 1;
    } else if (this.activeCategory === 'all') {
      iAdd = 3;
      vAdd = 0;
    } else {
      iAdd = 3;
      vAdd = 1;
    }
    this.appendHomepageItems(iAdd, vAdd);
  }

  appendHomepageItems(imgCount, vidCount) {
    var self = this;
    var grid = document.getElementById('portfolio-inline-grid');
    var moreBtnWrapper = document.getElementById('portfolio-inline-more');
    if (!grid) return;

    var items = this.activeCategory === 'all' ? this.shuffledAll : (this.mediaData[this.activeCategory] || []);
    var images = items.filter(function(item) { return item.type === 'image'; });
    var videos = items.filter(function(item) { return item.type === 'video'; });

    var toAppend = [];
    for (var j = 0; j < imgCount; j++) {
      if (this.visibleImagesCount < images.length) {
        toAppend.push(images[this.visibleImagesCount]);
        this.visibleImagesCount++;
      }
    }
    for (var k = 0; k < vidCount; k++) {
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

      el.onclick = function() {
        if (window.Core && window.Core.Lightbox) {
          var allFiltered = self.activeCategory === 'all' ? self.shuffledAll : items;
          var indexInSource = allFiltered.indexOf(item);
          window.Core.Lightbox.open(indexInSource, allFiltered);
        }
      };

      if (item.type === 'image') {
        var img = document.createElement('img');
        img.src = item.src;
        img.alt = item.alt || item.title || 'Portfolio image';
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
        vid.onmouseenter = function() { vid.play(); };
        vid.onmouseleave = function() { vid.pause(); };
        el.appendChild(vid);
      }
      frag.appendChild(el);
    });

    grid.appendChild(frag);

    if (moreBtnWrapper) {
      var moreImg = this.visibleImagesCount < images.length;
      var moreVid = this.visibleVideosCount < videos.length;

      if (this.activeCategory === 'cinematics') {
        moreBtnWrapper.style.display = moreVid ? 'block' : 'none';
      } else if (this.activeCategory === 'all') {
        moreBtnWrapper.style.display = 'none';
      } else {
        moreBtnWrapper.style.display = moreImg ? 'block' : 'none';
      }
    }
  }

  populateGallery() {
    this.renderCategory('all');
  }

  getCategoryName(category) {
    return ContentLoader.CATEGORY_NAMES[category] || category;
  }

  getFilteredItems(category) {
    var self = this;
    if (!this.mediaData) return [];
    if (category === 'all') {
      var all = [];
      var categories = Object.keys(this.mediaData);
      categories.forEach(function(cat) {
        var catItems = self.mediaData[cat];
        catItems.forEach(function(item) {
          all.push(item);
        });
      });
      return all;
    }
    return this.mediaData[category] || [];
  }

  renderCategory(category) {
    var self = this;
    var inlineGrid = document.getElementById('portfolio-inline-grid');
    if (inlineGrid) {
        this.activeCategory = category;
        this.renderHomepageInitial();
        return;
    }

    var galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) return;

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

      el.onclick = function() {
        var visibleItems = (window.GalleryManager && window.GalleryManager.getVisibleData) ? window.GalleryManager.getVisibleData() : items;
        var itemIndex = -1;
        for (var j = 0; j < visibleItems.length; j++) {
          if (visibleItems[j].originalIndex === index) {
            itemIndex = j;
            break;
          }
        }
        var targetIndex = itemIndex >= 0 ? itemIndex : index;

        if (window.Core && window.Core.Lightbox) {
          window.Core.Lightbox.open(targetIndex, visibleItems);
        }
      };

      el.onkeydown = function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          el.onclick();
        }
      };

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
        img.alt = item.alt || item.title || '';
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
      catLabel.textContent = self.getCategoryName(item.category || category);

      overlay.appendChild(title);
      overlay.appendChild(catLabel);
      el.appendChild(overlay);
      fragment.appendChild(el);
    });

    galleryGrid.appendChild(fragment);
    this.initLazyLoader();
    this.allImages = [];
    items.forEach(function(item, k) {
        var newItem = Object.assign({}, item);
        newItem.originalIndex = k;
        self.allImages.push(newItem);
    });
    if (window.GalleryManager) {
      window.GalleryManager.allImages = this.allImages;
    }
  }

  initLazyLoader() {
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

    var lazyImages = document.querySelectorAll('#gallery-grid img[data-src]');
    lazyImages.forEach(function(img) {
      if (img.dataset.src) {
        window.lazyImageObserver.observe(img);
      }
    });
  }

  populateEvents() {
    var eventsGrid = document.querySelector('.events-grid');
    if (!eventsGrid || !this.data || !this.data.recentEvents) {
      return;
    }

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

  populateAbout() {
    if (this.data && this.data.socialProof) {
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

        var awardsContainer = document.getElementById('awards');
        if (awardsContainer && this.data.socialProof.awards) {
          awardsContainer.innerHTML = '';
          this.data.socialProof.awards.forEach(function(award) {
            var awardItem = document.createElement('li');
            awardItem.textContent = award;
            awardsContainer.appendChild(awardItem);
          });
        }

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
  }

  handleError(error) {
    console.error('❌ Content loading error:', error);
    var errorMessage = document.createElement('div');
    errorMessage.className = 'content-error';
    errorMessage.innerHTML = '<p>Unable to load portfolio content. Please try refreshing the page.</p><p class="error-details">' + error.message + '</p>';

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
  'perwedding': 'Pre-Wedding',
  'cinematics': 'Cinematics'
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    window.contentLoader = new ContentLoader();
    window.contentLoader.init();
  });
} else {
  window.contentLoader = new ContentLoader();
  window.contentLoader.init();
}
