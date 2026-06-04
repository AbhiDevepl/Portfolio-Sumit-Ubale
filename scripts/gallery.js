window.GalleryManager = {
  activeCategory: 'all',
  filteredItems: [],
  
  init: function() {
    this.initFiltering();
    this.initGalleryInteractions();
    Core.Lightbox.init();
    this.checkURLState();
  },
  
  initFiltering: function() {
    var self = this;
    var container = document.querySelector('.portfolio-categories');
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

    document.querySelectorAll('.category-btn').forEach(function(btn) {
      btn.addEventListener('pointerdown', function() { btn.classList.add('is-pressing'); });
      btn.addEventListener('pointerup', function() { btn.classList.remove('is-pressing'); });
      btn.addEventListener('pointercancel', function() { btn.classList.remove('is-pressing'); });
      btn.addEventListener('pointerleave', function() { btn.classList.remove('is-pressing'); });
    });
    
    window.addEventListener('popstate', function(e) {
      self.filterGallery((e.state && e.state.category) || 'all');
    });
  },

  initGalleryInteractions: function() {
    var grid = document.getElementById('gallery-grid');
    if (!grid) return;
  },

  getVisibleData: function() {
    var all = this.allImages || (window.contentLoader && window.contentLoader.allImages) || [];
    return Array.from(document.querySelectorAll('.gallery-item'))
      .filter(function(item) { return !item.classList.contains('is-hidden'); })
      .map(function(item) {
        var idx = parseInt(item.dataset.index, 10);
        // Use cached data for O(1) metadata retrieval, avoiding expensive DOM queries
        if (all[idx]) {
          var entry = Object.assign({}, all[idx]);
          entry.originalIndex = idx;
          return entry;
        }

        // Fallback if data is not yet loaded (should not happen after init)
        var media = item.querySelector('img, video');
        return {
          src: (media && (media.src || media.dataset.src)) || '',
          title: (item.querySelector('.gallery-title') && item.querySelector('.gallery-title').textContent),
          category: (item.querySelector('.gallery-category') && item.querySelector('.gallery-category').textContent) || item.dataset.category,
          type: item.querySelector('video') ? 'video' : 'image',
          poster: (item.querySelector('video') && item.querySelector('video').poster) || '',
          originalIndex: idx
        };
      });
  },
  
  filterGallery: function(category) {
    this.activeCategory = category;

    // Update button active state
    document.querySelectorAll('.category-btn').forEach(function(btn) {
      var isActive = btn.dataset.category === category;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive);
    });

    // Re-render gallery with filtered items from JSON
    if (window.contentLoader && typeof window.contentLoader.renderCategory === 'function') {
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
    category === 'all' ? url.searchParams.delete('category') : url.searchParams.set('category', category);
    window.history.pushState({ category: category }, '', url);
  },
  
  checkURLState: function() {
    var category = new URLSearchParams(window.location.search).get('category') || 'all';
    this.filterGallery(category);
  }
};

// Auto-init removed. Will be called by ContentLoader.
