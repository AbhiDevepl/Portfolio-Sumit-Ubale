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
        const itemsWithKeys = images
          .map(img => {
            if (!img.src) return null;
            const urlWithoutParams = img.src.split('?')[0];
            const lowerSrc = urlWithoutParams.toLowerCase();

            const isJpg = lowerSrc.endsWith('.jpg') || lowerSrc.endsWith('.jpeg');
            const isVideo = lowerSrc.endsWith('.mp4') || lowerSrc.endsWith('.mov');

            // Assign type once
            const type = isVideo ? 'video' : 'image';

            if (categorySlug !== 'cinematics' && !isJpg) return null;
            if (categorySlug === 'cinematics' && !isJpg && !isVideo) return null;

            // Extract numeric sort key once
            const match = urlWithoutParams.match(/(\d+)\.(jpe?g|mp4|mov)$/i);
            const sortKey = match ? parseInt(match[1], 10) : 0;

            return { ...img, sortKey, type };
          })
          .filter(Boolean);

        // 2. Sort numerically using pre-calculated keys
        itemsWithKeys.sort((a, b) => a.sortKey - b.sortKey);

        // 3. Assign order and push to global list
        itemsWithKeys.forEach((image, idx) => {
          allImages.push({
            ...image,
            category: categorySlug,
            order: idx // used for pagination logic later
          });
        });
      });

      // 4. Final Global Sort by pre-calculated sortKey
      allImages.sort((a, b) => {
        if (a.sortKey !== b.sortKey) return a.sortKey - b.sortKey;
        return a.src.localeCompare(b.src);
      });
    }

    // Expose for global access (e.g. Lightbox or GalleryManager)
    this.allImages = allImages;

    // Create gallery items using DocumentFragment for performance
    const fragment = Core.DOM.createFragment(allImages, (image, index) => {
      image.category = image.category || 'uncategorized'; // Ensure category exists
      return Core.Media.createItem(image, index, allImages, (cat) => this.getCategoryName(cat));
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

    // Create event items (reusing gallery item structure for consistency)
    this.data.recentEvents.forEach((event, index) => {
      // Use createGalleryItem styling/structure but appended to events grid
      // We manually recreate it here to ensure specific event classes if needed
      // or we can reuse createGalleryItem if we want identical behavior.
      // User asked for "like Portfolio", so let's stick to the Project Card style 
      // or the Gallery Item style. The HTML had .event-item structure.
      // Let's use the .event-item structure but make it dynamic.
      
      const item = document.createElement('div');
      item.className = 'event-item';
      
      const img = document.createElement('img');
      img.src = event.src;
      img.alt = event.alt || event.title;
      img.className = 'event-image';
      img.loading = 'lazy';
      
      // Maintain aspect ratio via CSS or style if variable
      // The CSS has :nth-child rules for aspect ratios, but data has valid aspect ratios.
      // We can override via style if needed, or let CSS handle it.
      // Let's adhere to the data if provided.
      if (event.aspectRatio) {
        img.style.aspectRatio = event.aspectRatio;
      }
      
      // Optional: Add overlay content like portfolio if desired?
      // The original HTML structure for events was just image.
      // "make same as a Recent Events like Portfolio" implies showing title/category.
      // Let's add an overlay similar to gallery items.
      
      const overlay = document.createElement('div');
      overlay.className = 'gallery-overlay'; // Reuse gallery overlay class
      
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
      
      // Add click listener for lightbox if we want events to open there too
      // We need to add it to the GalleryManager access if we do that.
      // For now, let's just make it visual.
      
      eventsGrid.appendChild(item);
    });
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
