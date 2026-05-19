/**
 * Content Loader
 * Fetches portfolio data from JSON and dynamically populates the page
 */

var CONTENT_LOADER_CATEGORY_NAMES = {
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

class ContentLoader {
  constructor() {
    this.dataUrl = '/data/portfolio.json';
    this.data = null;
    this.allImages = []; // Cache for processed items
    this.mediaData = null; // Cache portfolio.images from JSON
  }

  /**
   * Initialize content loading
   */
  async init() {
    try {
      await this.loadData();
      this.populateGallery();
      
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
    try {
      var response = await fetch(this.dataUrl);

      if (!response.ok) {
        throw new Error('HTTP error! status: ' + response.status);
      }

      this.data = await response.json();
      // Cache media data once for filtering
      this.mediaData = (this.data && this.data.portfolio) ? this.data.portfolio.images : null;
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
    return CONTENT_LOADER_CATEGORY_NAMES[category] || category;
  }

  /**
   * Get images for a category
   * @param {string} category - Category slug (or 'all')
   * @returns {Array} Array of image/video items
   */
  getFilteredItems(category) {
    if (!this.mediaData) return [];

    if (category === 'all') {
      // Flatten all category arrays (compatible version)
      var all = [];
      var keys = Object.keys(this.mediaData);
      for (var i = 0; i < keys.length; i++) {
        var catItems = this.mediaData[keys[i]];
        if (Array.isArray(catItems)) {
          for (var j = 0; j < catItems.length; j++) {
            all.push(catItems[j]);
          }
        }
      }
      return all;
    }

    return this.mediaData[category] || [];
  }

  /**
   * Render gallery items for a category
   * @param {string} category - Category slug
   */
  renderCategory(category) {
    // Support both gallery-grid (portfolio.html/gallery.html) and portfolio-inline-grid (index.html)
    var galleryGrid = document.getElementById('gallery-grid') || document.getElementById('portfolio-inline-grid');
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
    var self = this;

    for (var i = 0; i < items.length; i++) {
      (function(index) {
        var item = items[index];
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
      })(i);
    }

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
        for (var i = 0; i < entries.length; i++) {
          var entry = entries[i];
          if (entry.isIntersecting) {
            var img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            window.lazyImageObserver.unobserve(img);
          }
        }
      }, { rootMargin: '200px' });
    }

    // Observe new lazy images
    for (var j = 0; j < lazyImages.length; j++) {
      var imgEl = lazyImages[j];
      if (imgEl.dataset.src) {
        window.lazyImageObserver.observe(imgEl);
      }
    }
  }



  /**
   * Populate events section
   */
  populateEvents() {
    var eventsGrid = document.querySelector('.events-grid');
    
    if (!eventsGrid || !this.data || !this.data.recentEvents) {
      console.warn('Events grid or data not found');
      return;
    }

    // Clear existing content
    eventsGrid.innerHTML = '';

    // Create event items (reusing gallery item structure for consistency)
    for (var i = 0; i < this.data.recentEvents.length; i++) {
      var event = this.data.recentEvents[i];
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
      overlay.className = 'gallery-overlay'; // Reuse gallery overlay class
      
      var title = document.createElement('h3');
      title.className = 'gallery-title';
      title.textContent = event.title;
      
      var categoryLabel = document.createElement('p');
      categoryLabel.className = 'gallery-category';
      categoryLabel.textContent = event.category;
      
      overlay.appendChild(title);
      overlay.appendChild(categoryLabel);
      
      item.appendChild(img);
      item.appendChild(overlay);
      
      eventsGrid.appendChild(item);
    }
  }

  /**
   * Populate about section with social proof
   */
  populateAbout() {
    // Populate publications
    var publicationsContainer = document.getElementById('publications');
    var pubData = (this.data && this.data.socialProof) ? this.data.socialProof.publications : null;
    if (publicationsContainer && pubData) {
      publicationsContainer.innerHTML = '';
      for (var i = 0; i < pubData.length; i++) {
        var pub = pubData[i];
        var pubItem = document.createElement('span');
        pubItem.className = 'publication-item';
        pubItem.textContent = pub;
        publicationsContainer.appendChild(pubItem);
      }
    }

    // Populate awards
    var awardsContainer = document.getElementById('awards');
    var awardData = (this.data && this.data.socialProof) ? this.data.socialProof.awards : null;
    if (awardsContainer && awardData) {
      awardsContainer.innerHTML = '';
      for (var j = 0; j < awardData.length; j++) {
        var award = awardData[j];
        var awardItem = document.createElement('li');
        awardItem.textContent = award;
        awardsContainer.appendChild(awardItem);
      }
    }

    // Populate clients
    var clientsContainer = document.getElementById('clients');
    var clientData = (this.data && this.data.socialProof) ? this.data.socialProof.clients : null;
    if (clientsContainer && clientData) {
      clientsContainer.innerHTML = '';
      for (var k = 0; k < clientData.length; k++) {
        var client = clientData[k];
        var clientItem = document.createElement('span');
        clientItem.className = 'client-item';
        clientItem.textContent = client;
        clientsContainer.appendChild(clientItem);
      }
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
    errorMessage.innerHTML = '<p>Unable to load portfolio content. Please try refreshing the page.</p>' +
      '<p class="error-details">' + error.message + '</p>';

    // Try to insert error in gallery
    var galleryGrid = document.getElementById('gallery-grid');
    if (galleryGrid) {
      galleryGrid.innerHTML = '';
      galleryGrid.appendChild(errorMessage);
    }
  }
}

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
