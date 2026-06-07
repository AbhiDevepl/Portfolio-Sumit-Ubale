/**
 * Content Loader
 * Fetches portfolio data from JSON and dynamically populates the page
 */

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
    var self = this;
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
      this.mediaData = this.data.portfolio.images;
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
    return ContentLoader.CATEGORY_NAMES[category] || category;
  }

  /**
   * Get images for a category
   * @param {string} category - Category slug (or 'all')
   * @returns {Array} Array of image/video items
   */
  getFilteredItems(category) {
    if (!this.mediaData) return [];

    if (category === 'all') {
      // Flatten all category arrays (avoid .flat() for compatibility)
      var keys = Object.keys(this.mediaData);
      var all = [];
      for (var i = 0; i < keys.length; i++) {
        all = all.concat(this.mediaData[keys[i]]);
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
    var self = this;
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

    items.forEach(function(item, index) {
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
        var visibleItems = (window.GalleryManager && window.GalleryManager.getVisibleData && window.GalleryManager.getVisibleData()) || items;
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
    });

    galleryGrid.appendChild(fragment);

    // Re-init lazy loader for new images
    this.initLazyLoader();

    // Update allImages cache for lightbox (with original index for lightbox navigation)
    this.allImages = items.map(function(item, idx) {
      var newItem = {};
      for (var key in item) newItem[key] = item[key];
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

    // Observe new lazy images
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
    
    if (!eventsGrid || !this.data || !this.data.recentEvents) {
      console.warn('Events grid or data not found');
      return;
    }

    // Clear existing content
    eventsGrid.innerHTML = '';

    // Create event items (reusing gallery item structure for consistency)
    this.data.recentEvents.forEach(function(event, index) {
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
    // Populate publications
    var publicationsContainer = document.getElementById('publications');
    if (publicationsContainer && this.data && this.data.socialProof && this.data.socialProof.publications) {
      publicationsContainer.innerHTML = '';
      this.data.socialProof.publications.forEach(function(pub) {
        var pubItem = document.createElement('span');
        pubItem.className = 'publication-item';
        pubItem.textContent = pub;
        publicationsContainer.appendChild(pubItem);
      });
    }

    // Populate awards
    var awardsContainer = document.getElementById('awards');
    if (awardsContainer && this.data && this.data.socialProof && this.data.socialProof.awards) {
      awardsContainer.innerHTML = '';
      this.data.socialProof.awards.forEach(function(award) {
        var awardItem = document.createElement('li');
        awardItem.textContent = award;
        awardsContainer.appendChild(awardItem);
      });
    }

    // Populate clients
    var clientsContainer = document.getElementById('clients');
    if (clientsContainer && this.data && this.data.socialProof && this.data.socialProof.clients) {
      clientsContainer.innerHTML = '';
      this.data.socialProof.clients.forEach(function(client) {
        var clientItem = document.createElement('span');
        clientItem.className = 'client-item';
        clientItem.textContent = client;
        clientsContainer.appendChild(clientItem);
      });
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
    errorMessage.innerHTML = '<p>Unable to load portfolio content. Please try refreshing the page.</p><p class="error-details">' + error.message + '</p>';

    // Try to insert error in gallery
    var galleryGrid = document.getElementById('gallery-grid');
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
  'cinematics': 'Cinematics'
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
