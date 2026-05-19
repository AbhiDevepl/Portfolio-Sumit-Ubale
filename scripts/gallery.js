window.GalleryManager = {
  activeCategory: 'all',
  filteredItems: [],
  
  init: function() {
    this.initFiltering();
    this.initGalleryInteractions();
    if (window.Core && window.Core.Lightbox) {
      window.Core.Lightbox.init();
    }
    this.checkURLState();
  },
  
  initFiltering: function() {
    var container = document.querySelector('.portfolio-categories');
    var self = this;
    if (container) {
      container.addEventListener('click', function(e) {
        var btn = e.target.closest('.category-btn');
        if (btn) {
          var cat = btn.dataset.category;
          self.filterGallery(cat);
          self.updateURL(cat);
        }
      });
    }

    var btns = document.querySelectorAll('.category-btn');
    for (var i = 0; i < btns.length; i++) {
      (function(btn) {
        btn.addEventListener('pointerdown', function() { btn.classList.add('is-pressing'); });
        btn.addEventListener('pointerup', function() { btn.classList.remove('is-pressing'); });
        btn.addEventListener('pointercancel', function() { btn.classList.remove('is-pressing'); });
        btn.addEventListener('pointerleave', function() { btn.classList.remove('is-pressing'); });
      })(btns[i]);
    }
    
    window.addEventListener('popstate', function(e) {
      self.filterGallery((e.state && e.state.category) ? e.state.category : 'all');
    });
  },

  initGalleryInteractions: function() {
    var grid = document.getElementById('gallery-grid');
    if (!grid) return;
  },

  getVisibleData: function() {
    var all = this.allImages || (window.contentLoader && window.contentLoader.allImages) || [];
    var items = document.querySelectorAll('.gallery-item');
    var visibleData = [];

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (!item.classList.contains('is-hidden')) {
        var idx = parseInt(item.dataset.index, 10);
        // Use cached data for O(1) metadata retrieval
        if (all[idx]) {
          var entry = Object.assign({}, all[idx]);
          entry.originalIndex = idx;
          visibleData.push(entry);
        } else {
          // Fallback if data is not yet loaded
          var media = item.querySelector('img, video');
          var posterMedia = item.querySelector('video');
          visibleData.push({
            src: media ? (media.src || (media.dataset && media.dataset.src) || '') : '',
            title: item.querySelector('.gallery-title') ? item.querySelector('.gallery-title').textContent : '',
            category: (item.querySelector('.gallery-category') ? item.querySelector('.gallery-category').textContent : '') || item.dataset.category,
            type: item.querySelector('video') ? 'video' : 'image',
            poster: posterMedia ? posterMedia.poster : '',
            originalIndex: idx
          });
        }
      }
    }
    return visibleData;
  },
  
  filterGallery: function(category) {
    this.activeCategory = category;

    // Update button active state
    var btns = document.querySelectorAll('.category-btn');
    for (var i = 0; i < btns.length; i++) {
      var btn = btns[i];
      var isActive = btn.dataset.category === category;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive);
    }

    // Re-render gallery with filtered items from JSON
    if (window.contentLoader && window.contentLoader.renderCategory) {
      window.contentLoader.renderCategory(category);
    }

    // Update URL
    this.updateURL(category);

    // Refresh ScrollTrigger if available
    if (window.ScrollTrigger) {
      setTimeout(function() { ScrollTrigger.refresh(); }, 200);
    }
  },
  
  updateURL: function(category) {
    var url = new URL(window.location);
    if (category === 'all') {
      url.searchParams.delete('category');
    } else {
      url.searchParams.set('category', category);
    }
    window.history.pushState({ category: category }, '', url);
  },
  
  checkURLState: function() {
    var category = new URLSearchParams(window.location.search).get('category') || 'all';
    this.filterGallery(category);
  }
};

// Auto-init removed. Will be called by ContentLoader.
