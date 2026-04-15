/**
 * Content Loader
 * Fetches portfolio data from JSON and dynamically populates the page
 */

class ContentLoader {
  static CATEGORY_NAMES = {
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

  constructor() {
    this.dataUrl = '/data/portfolio.json';
    this.data = null;
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
      const response = await fetch(this.dataUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      this.data = await response.json();
      return this.data;
    } catch (error) {
      throw new Error(`Failed to load portfolio data: ${error.message}`);
    }
  }

  /**
   * Populate gallery grid with images
   */
  populateGallery() {
    const galleryGrid = document.getElementById('gallery-grid');
    
    if (!galleryGrid || !this.data?.portfolio?.images) {
      console.warn('Gallery grid or images data not found');
      return;
    }

    // Clear existing content
    galleryGrid.innerHTML = '';

    // Flatten images from object structure if necessary
    const rawImages = this.data.portfolio.images;
    let allImages = [];

    if (Array.isArray(rawImages)) {
      // Fallback for flat array (if still used)
      allImages = rawImages.map(img => ({ ...img, isPreview: true }));
    } else {
      // Grouped by category slug
      Object.entries(rawImages).forEach(([categorySlug, images]) => {
        // 1. Filter and pre-calculate sort keys (Schwartzian Transform)
        const processedImages = images
          .filter(img => {
            if (!img.src) return false;
            const lowerSrc = img.src.toLowerCase();
            const urlWithoutParams = lowerSrc.split('?')[0];
            const isJpg = urlWithoutParams.endsWith('.jpg') || urlWithoutParams.endsWith('.jpeg');
            const isVideo = urlWithoutParams.endsWith('.mp4') || urlWithoutParams.endsWith('.mov');
            return categorySlug === 'cinematics' ? (isJpg || isVideo) : isJpg;
          })
          .map(img => {
            // Extract numeric sort key once
            const match = img.src.split('?')[0].match(/(\d+)\.(jpe?g|mp4|mov)$/i);
            const lowerSrc = img.src.toLowerCase();
            const urlWithoutParams = lowerSrc.split('?')[0];
            const isVideo = urlWithoutParams.endsWith('.mp4') || urlWithoutParams.endsWith('.mov');

            return {
              ...img,
              _sortKey: match ? parseInt(match[1], 10) : 0,
              category: categorySlug,
              type: isVideo ? 'video' : 'image'
            };
          });

        // 2. Sort numerically based on pre-calculated key
        processedImages.sort((a, b) => a._sortKey - b._sortKey);

        // 3. Assign order and collect
        processedImages.forEach((image, idx) => {
          image.order = idx; // used for pagination logic later
          allImages.push(image);
        });
      });

      // 4. Final Global Sort by pre-calculated key
      allImages.sort((a, b) => {
        if (a._sortKey !== b._sortKey) return a._sortKey - b._sortKey;
        return a.src.localeCompare(b.src);
      });
    }

    // Create gallery items using DocumentFragment for performance
    // Use skipHandler: true to enable event delegation (handled by GalleryManager)
    const fragment = Core.DOM.createFragment(allImages, (image, index) => {
      image.category = image.category || 'uncategorized'; // Ensure category exists
      return Core.Media.createItem(image, index, allImages, (cat) => this.getCategoryName(cat), { skipHandler: true });
    });
    
    galleryGrid.appendChild(fragment);

    // Make processed images available globally for Lightbox
    this.allImages = allImages;
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
    
    if (!eventsGrid || !this.data?.recentEvents) {
      console.warn('Events grid or data not found');
      return;
    }

    // Clear existing content
    eventsGrid.innerHTML = '';

    // Create event items using DocumentFragment for performance
    const fragment = Core.DOM.createFragment(this.data.recentEvents, (event) => {
      const item = document.createElement('div');
      item.className = 'event-item';
      
      const img = document.createElement('img');
      img.src = event.src;
      img.alt = event.alt || event.title;
      img.className = 'event-image';
      img.loading = 'lazy';
      
      if (event.aspectRatio) {
        img.style.aspectRatio = event.aspectRatio;
      }
      
      item.appendChild(img);
      
      return item;
    });

    eventsGrid.appendChild(fragment);
  }

  /**
   * Populate about section with social proof
   */
  populateAbout() {
    // Populate publications
    const publicationsContainer = document.getElementById('publications');
    if (publicationsContainer && this.data?.socialProof?.publications) {
      publicationsContainer.innerHTML = '';
      const fragment = Core.DOM.createFragment(this.data.socialProof.publications, (pub) => {
        const pubItem = document.createElement('span');
        pubItem.className = 'publication-item';
        pubItem.textContent = pub;
        return pubItem;
      });
      publicationsContainer.appendChild(fragment);
    }

    // Populate awards
    const awardsContainer = document.getElementById('awards');
    if (awardsContainer && this.data?.socialProof?.awards) {
      awardsContainer.innerHTML = '';
      const fragment = Core.DOM.createFragment(this.data.socialProof.awards, (award) => {
        const awardItem = document.createElement('li');
        awardItem.textContent = award;
        return awardItem;
      });
      awardsContainer.appendChild(fragment);
    }

    // Populate clients
    const clientsContainer = document.getElementById('clients');
    if (clientsContainer && this.data?.socialProof?.clients) {
      clientsContainer.innerHTML = '';
      const fragment = Core.DOM.createFragment(this.data.socialProof.clients, (client) => {
        const clientItem = document.createElement('span');
        clientItem.className = 'client-item';
        clientItem.textContent = client;
        return clientItem;
      });
      clientsContainer.appendChild(fragment);
    }
  }

  /**
   * Handle errors
   */
  handleError(error) {
    console.error('❌ Content loading error:', error);

    // Show user-friendly error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'content-error';
    errorMessage.innerHTML = `
      <p>Unable to load portfolio content. Please try refreshing the page.</p>
      <p class="error-details">${error.message}</p>
    `;

    // Try to insert error in gallery
    const galleryGrid = document.getElementById('gallery-grid');
    if (galleryGrid) {
      galleryGrid.innerHTML = '';
      galleryGrid.appendChild(errorMessage);
    }
  }
}

// Initialize content loader when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.contentLoader = new ContentLoader();
    window.contentLoader.init();
  });
} else {
  window.contentLoader = new ContentLoader();
  window.contentLoader.init();
}
