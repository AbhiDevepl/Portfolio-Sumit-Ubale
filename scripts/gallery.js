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

    var btns = document.querySelectorAll('.category-btn');
    for (var i = 0; btns && i < btns.length; i++) {
      (function(btn) {
        btn.addEventListener('pointerdown', function() { btn.classList.add('is-pressing'); });
        btn.addEventListener('pointerup', function() { btn.classList.remove('is-pressing'); });
        btn.addEventListener('pointercancel', function() { btn.classList.remove('is-pressing'); });
        btn.addEventListener('pointerleave', function() { btn.classList.remove('is-pressing'); });
      })(btns[i]);
    }
    
    window.addEventListener('popstate', function(e) {
      var cat = (e.state && e.state.category) ? e.state.category : 'all';
      self.filterGallery(cat);
    });
  },

  initGalleryInteractions: function() {
    var grid = document.getElementById('gallery-grid');
    if (!grid) return;
  },

  getVisibleData: function() {
    var all = this.allImages || (window.contentLoader && window.contentLoader.allImages) || [];
    var items = document.querySelectorAll('.gallery-item');
    var visible = [];

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (!item.classList.contains('is-hidden')) {
        var idx = parseInt(item.dataset.index, 10);
        if (all[idx]) {
           visible.push(Object.assign({ originalIndex: idx }, all[idx]));
        } else {
           var media = item.querySelector('img, video');
           var titleEl = item.querySelector('.gallery-title');
           var catEl = item.querySelector('.gallery-category');
           var videoEl = item.querySelector('video');

           visible.push({
             src: (media && media.src) || (media && media.dataset && media.dataset.src) || '',
             title: titleEl ? titleEl.textContent : '',
             category: (catEl ? catEl.textContent : '') || item.dataset.category,
             type: videoEl ? 'video' : 'image',
             poster: videoEl ? videoEl.poster : '',
             originalIndex: idx
           });
        }
      }
    }
    return visible;
  },
  
  filterGallery: function(category) {
    this.activeCategory = category;

    var btns = document.querySelectorAll('.category-btn');
    for (var i = 0; i < btns.length; i++) {
      var btn = btns[i];
      var isActive = btn.dataset.category === category;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive);
    }

    if (window.contentLoader && window.contentLoader.renderCategory) {
      window.contentLoader.renderCategory(category);
    }

    this.updateURL(category);

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
