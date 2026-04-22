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
        // 1. Keep supported image/video media across categories
        // Optimization: Use a map-sort-map pattern (Schwartzian Transform)
        // to pre-calculate sort keys and avoid redundant regex/splits.
        const mapped = [];
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          if (!img.src) continue;

          const lowerSrc = img.src.toLowerCase();
          const urlWithoutParams = lowerSrc.split('?')[0];
          const isVideo = urlWithoutParams.endsWith('.mp4') || urlWithoutParams.endsWith('.mov');
          const isJpg = !isVideo && (urlWithoutParams.endsWith('.jpg') || urlWithoutParams.endsWith('.jpeg'));

          if (isJpg || isVideo) {
            const match = urlWithoutParams.match(/(\d+)\.(jpe?g|mp4|mov)$/i);
            const num = match ? parseInt(match[1], 10) : 0;
            mapped.push({
              img,
              num,
              type: img.type || (isVideo ? 'video' : 'image'),
              category: categorySlug
            });
          }
        }

        // 2. Sort numerically based on filename
        mapped.sort((a, b) => a.num - b.num);

        // 3. Assign order and push to allImages
        for (let i = 0; i < mapped.length; i++) {
          const item = mapped[i];
          allImages.push({
            ...item.img,
            category: item.category,
            type: item.type,
            order: i, // used for pagination logic later
            _num: item.num // Store for final global sort
          });
        }
      });

      // 4. Final Global Sort by filename number (Rule 2)
      allImages.sort((a, b) => {
        if (a._num !== b._num) return a._num - b._num;
        // If numbers are same (e.g. 1.jpg from different folders), sort by src
        return a.src.localeCompare(b.src);
      });

      // 5. Assign global index after sorting to ensure correct Lightbox mapping
      for (let i = 0; i < allImages.length; i++) {
        allImages[i].globalIndex = i;
      }
    }

    this.allImages = allImages; // Store globally for GalleryManager to avoid DOM scraping

    // Create gallery items using DocumentFragment for performance
    const fragment = Core.DOM.createFragment(allImages, (image, index) => {
      image.category = image.category || 'uncategorized'; // Ensure category exists
      // Use the globalIndex for the item creation
      return Core.Media.createItem(image, image.globalIndex, allImages, (cat) => this.getCategoryName(cat));
    });
    
    galleryGrid.appendChild(fragment);
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

    // Create event items using DocumentFragment for batch injection performance
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
      
      const overlay = document.createElement('div');
      overlay.className = 'gallery-overlay';
      
      const title = document.createElement('h3');
      title.className = 'gallery-title';
      title.textContent = event.title;
      
      const category = document.createElement('p');
      category.className = 'gallery-category';
      category.textContent = event.category;
      
      overlay.appendChild(title);
      overlay.appendChild(category);
      
      item.appendChild(img);
      item.appendChild(overlay);
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
      this.data.socialProof.publications.forEach(pub => {
        const pubItem = document.createElement('span');
        pubItem.className = 'publication-item';
        pubItem.textContent = pub;
        publicationsContainer.appendChild(pubItem);
      });
    }

    // Populate awards
    const awardsContainer = document.getElementById('awards');
    if (awardsContainer && this.data?.socialProof?.awards) {
      awardsContainer.innerHTML = '';
      this.data.socialProof.awards.forEach(award => {
        const awardItem = document.createElement('li');
        awardItem.textContent = award;
        awardsContainer.appendChild(awardItem);
      });
    }

    // Populate clients
    const clientsContainer = document.getElementById('clients');
    if (clientsContainer && this.data?.socialProof?.clients) {
      clientsContainer.innerHTML = '';
      this.data.socialProof.clients.forEach(client => {
        const clientItem = document.createElement('span');
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
