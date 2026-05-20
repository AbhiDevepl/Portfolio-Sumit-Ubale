window.GalleryManager = {
  activeCategory: 'all',
  filteredItems: [],
  
  init: function() {
    this.initFiltering();
    this.initGalleryInteractions();
    if (window.Core && window.Core.Lightbox) window.Core.Lightbox.init();
    this.checkURLState();
  },
  
  initFiltering: function() {
    const container = document.querySelector('.portfolio-categories');
    const self = this;
    if (container) {
      container.addEventListener('click', function(e) {
        const btn = e.target.closest('.category-btn');
        if (btn) {
          const cat = btn.dataset.category;
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
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;
  },

  getVisibleData: function() {
    const all = this.allImages || (window.contentLoader && window.contentLoader.allImages) || [];
    return Array.prototype.slice.call(document.querySelectorAll('.gallery-item'))
      .filter(function(item) { return !item.classList.contains('is-hidden'); })
      .map(function(item) {
        const idx = parseInt(item.dataset.index, 10);
        if (all[idx]) return Object.assign({ originalIndex: idx }, all[idx]);

        const media = item.querySelector('img, video');
        return {
          src: (media && media.src) || (media && media.dataset && media.dataset.src) || '',
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

    document.querySelectorAll('.category-btn').forEach(function(btn) {
      const isActive = btn.dataset.category === category;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive);
    });

    if (window.contentLoader && window.contentLoader.renderCategory) {
      window.contentLoader.renderCategory(category);
    }

    this.updateURL(category);

    if (window.ScrollTrigger) {
      setTimeout(function() { ScrollTrigger.refresh(); }, 200);
    }
  },
  
  updateURL: function(category) {
    const url = new URL(window.location);
    category === 'all' ? url.searchParams.delete('category') : url.searchParams.set('category', category);
    window.history.pushState({ category: category }, '', url);
  },
  
  checkURLState: function() {
    const category = new URLSearchParams(window.location.search).get('category') || 'all';
    this.filterGallery(category);
  }
};
