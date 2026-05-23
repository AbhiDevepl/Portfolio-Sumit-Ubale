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

    // Homepage pagination/lazy-render state
    this.visibleImagesCount = 0;
    this.visibleVideosCount = 0;
    this.itemsPerPage = 12; // Base number of items to show on home
    this.activeCategory = 'all';
    this.initialized = false;
  }

  /**
   * Initialize content loading
   */
  async init() {
    if (this.initialized) return;
    try {
      await this.loadData();
      this.initialized = true;

      this.shuffleData();
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
    if (this.data) return this.data;
    try {
      // Fetch both data sources to ensure no data loss
      const [oldRes, newRes] = await Promise.all([
        fetch(this.dataUrl),
        fetch('/data/new_portfolio.json').catch(() => null)
      ]);

      if (!oldRes.ok) {
        throw new Error(`HTTP error! status: ${oldRes.status}`);
      }

      const oldData = await oldRes.json();
      const newData = newRes && newRes.ok ? await newRes.json() : null;

      this.data = oldData;
      this.mediaData = Object.assign({}, oldData.portfolio.images);

      if (newData) {
        const categoriesObj = (newData.portfolio && newData.portfolio.images) ? newData.portfolio.images : (newData.portfolio && newData.portfolio.images ? newData.portfolio.images : newData);
        Object.keys(categoriesObj).forEach(cat => {
          if (Array.isArray(categoriesObj[cat])) {
            if (!this.mediaData[cat]) this.mediaData[cat] = [];
            // Merge unique by src
            categoriesObj[cat].forEach(item => {
              if (!this.mediaData[cat].find(i => i.src === item.src)) {
                this.mediaData[cat].push(item);
              }
            });
          }
        });
      }

      return this.data;
    } catch (error) {
      throw new Error(`Failed to load portfolio data: ${error.message}`);
    }
  }

  /**
   * Randomize data for homepage variety
   */
  shuffleData() {
    if (!this.mediaData) return;

    // Shuffle all items within their categories
    Object.keys(this.mediaData).forEach(cat => {
      const arr = this.mediaData[cat];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = Object.assign({}, arr[i]);
        arr[i] = Object.assign({}, arr[j]);
        arr[j] = temp;
      }
    });
  }

  /**
   * Populate gallery grid with images
   */
  populateGallery() {
    // Detect if we are on homepage with the inline grid
    const isHomepage = !!document.getElementById('portfolio-inline-grid');
    if (isHomepage) {
      this.renderInitialHome();
      this.setupLoadMore();
    } else {
      this.renderCategory('all');
    }
  }

  /**
   * Helper to get category name from slug
   */
  getCategoryName(category) {
    const names = {
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
    return names[category] || category;
  }

  /**
   * Get images for a category
   * @param {string} category - Category slug (or 'all')
   * @returns {Array} Array of image/video items
   */
  getFilteredItems(category) {
    if (!this.mediaData) return [];

    if (category === 'all') {
      // Flatten all category arrays using concat to ensure ES6 compatibility
      let all = [];
      const values = Object.keys(this.mediaData).map(key => this.mediaData[key]);
      for (let i = 0; i < values.length; i++) {
        all = all.concat(values[i]);
      }
      return all;
    }

    return this.mediaData[category] || [];
  }

  /**
   * Homepage specific initial render
   */
  renderInitialHome() {
    this.visibleImagesCount = 0;
    this.visibleVideosCount = 0;
    this.activeCategory = 'all';

    const grid = document.getElementById('portfolio-inline-grid');
    if (grid) {
      grid.innerHTML = '';
      grid.classList.remove('cinematics-mode');
    }

    this.appendHomeItems(9, 3); // Initial load: 9 images, 3 videos
  }

  /**
   * Setup Load More button for homepage
   */
  setupLoadMore() {
    const loadMoreBtn = document.getElementById('inline-load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.onclick = () => {
        if (this.activeCategory === 'cinematics') {
          const grid = document.getElementById('portfolio-inline-grid');
          if (grid) grid.innerHTML = '';
          this.appendHomeItems(0, 1);
        } else {
          this.appendHomeItems(6, 0);
        }
      };
    }

    // Listen for category changes from GalleryManager
    // We use a more robust event-driven approach if possible, or keep the patch but clean it
    if (window.GalleryManager) {
      const self = this;
      const originalFilter = window.GalleryManager.filterGallery;

      window.GalleryManager.filterGallery = function(category) {
        self.activeCategory = category;
        const grid = document.getElementById('portfolio-inline-grid');
        if (grid) {
          if (category === 'cinematics') {
            grid.classList.add('cinematics-mode');
            grid.innerHTML = '';
            self.visibleVideosCount = 0;
            self.appendHomeItems(0, 1);
          } else {
            grid.classList.remove('cinematics-mode');
            self.renderInitialHome();
          }
        }
        // Call original filter to update UI and other state
        return originalFilter.apply(this, arguments);
      };
    }
  }

  /**
   * Append items to homepage grid
   */
  appendHomeItems(imgCount, vidCount) {
    const grid = document.getElementById('portfolio-inline-grid');
    if (!grid) return;

    const allItems = this.getFilteredItems(this.activeCategory);
    const images = allItems.filter(item => item.type !== 'video');
    const videos = allItems.filter(item => item.type === 'video');

    const toAppend = [];
    for (let i = 0; i < imgCount && this.visibleImagesCount < images.length; i++) {
      toAppend.push(images[this.visibleImagesCount++]);
    }
    for (let i = 0; i < vidCount && this.visibleVideosCount < videos.length; i++) {
      toAppend.push(videos[this.visibleVideosCount++]);
    }

    if (toAppend.length === 0) return;

    const fragment = document.createDocumentFragment();
    toAppend.forEach((item, index) => {
      const el = this.createGalleryItemElement(item, index, toAppend);
      fragment.appendChild(el);
    });
    grid.appendChild(fragment);

    // Update Load More visibility
    const moreBtnWrapper = document.getElementById('portfolio-inline-more');
    if (moreBtnWrapper) {
      const hasMore = (this.activeCategory === 'cinematics')
        ? this.visibleVideosCount < videos.length
        : this.visibleImagesCount < images.length;
      moreBtnWrapper.style.display = hasMore ? 'block' : 'none';
    }

    this.initLazyLoader();
  }

  /**
   * Shared item element creator
   */
  createGalleryItemElement(item, index, items) {
    const isVideo = item.type === 'video';
    const el = document.createElement('article');

    // Detect if we are on homepage for specific animation classes
    const isHomepage = !!document.getElementById('portfolio-inline-grid');

    el.className = `gallery-item ${isVideo ? 'gallery-item--video' : 'gallery-item--image'} ${isHomepage ? 'fade-in-up' : 'reveal-item'} loading`;
    if (isHomepage) {
      el.style.animationDelay = `${(index % 12) * 60}ms`;
    }

    el.dataset.index = index;
    el.dataset.category = item.category || this.activeCategory;
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');

    // Click handler for lightbox
    el.addEventListener('click', (e) => {
      // If clicking video directly, let VideoHover handle it or toggle play
      if (isVideo && e.target.tagName === 'VIDEO') return;

      if (window.Core && window.Core.Lightbox) {
        window.Core.Lightbox.open(index, items);
      }
    });

    if (isVideo) {
      const video = document.createElement('video');
      video.src = item.src;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.className = 'gallery-image';

      // Restore hover to play
      el.addEventListener('mouseenter', () => video.play().catch(() => {}));
      el.addEventListener('mouseleave', () => video.pause());

      el.appendChild(video);

      // Initialize with VideoObserver if available
      if (window.Core && window.Core.VideoObserver) {
        window.Core.VideoObserver.observe(video);
      }
    } else {
      const img = document.createElement('img');
      img.dataset.src = item.src;
      img.className = 'gallery-image';
      img.alt = item.alt || item.title || '';
      el.appendChild(img);
    }

    const overlay = document.createElement('div');
    overlay.className = 'gallery-overlay';
    overlay.innerHTML = `<h3 class="gallery-title">${item.title || ''}</h3><p class="gallery-category">${this.getCategoryName(item.category || this.activeCategory)}</p>`;

    // Ensure clicking overlay opens lightbox even for videos
    overlay.onclick = (e) => {
      e.stopPropagation();
      if (window.Core && window.Core.Lightbox) {
        window.Core.Lightbox.open(index, items);
      }
    };

    el.appendChild(overlay);

    return el;
  }

  /**
   * Render gallery items for a category
   * @param {string} category - Category slug
   */
  renderCategory(category) {
    const galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) return;

    const items = this.getFilteredItems(category);
    galleryGrid.innerHTML = '';

    if (items.length === 0) {
      galleryGrid.innerHTML = '<p class="no-items">No items found in this category.</p>';
      return;
    }

    const fragment = document.createDocumentFragment();
    // For full gallery, we enrich items with originalIndex for lightbox
    const enrichedItems = items.map((item, idx) => Object.assign({}, item, { originalIndex: idx }));

    enrichedItems.forEach((item) => {
      const el = this.createGalleryItemElement(item, item.originalIndex, enrichedItems);
      fragment.appendChild(el);
    });

    galleryGrid.appendChild(fragment);

    // Re-init lazy loader for new images
    this.initLazyLoader();

    // Update allImages cache for lightbox
    this.allImages = enrichedItems;
    if (window.GalleryManager) {
      window.GalleryManager.allImages = this.allImages;
    }
  }

  /**
   * Re-run IntersectionObserver on lazy images
   */
  initLazyLoader() {
    const lazyImages = document.querySelectorAll('#gallery-grid img[data-src]');

    // Create or reuse observer
    if (!window.lazyImageObserver) {
      window.lazyImageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            window.lazyImageObserver.unobserve(img);
          }
        });
      }, { rootMargin: '200px' });
    }

    // Observe new lazy images
    lazyImages.forEach(img => {
      if (img.dataset.src) {
        window.lazyImageObserver.observe(img);
      }
    });
  }



  /**
   * Populate events section
   */
  populateEvents() {
    const eventsGrid = document.querySelector('.events-grid');
    
    if (!eventsGrid || !this.data || !this.data.recentEvents) {
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
    if (publicationsContainer && this.data && this.data.socialProof && this.data.socialProof.publications) {
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
    if (awardsContainer && this.data && this.data.socialProof && this.data.socialProof.awards) {
      awardsContainer.innerHTML = '';
      this.data.socialProof.awards.forEach(award => {
        const awardItem = document.createElement('li');
        awardItem.textContent = award;
        awardsContainer.appendChild(awardItem);
      });
    }

    // Populate clients
    const clientsContainer = document.getElementById('clients');
    if (clientsContainer && this.data && this.data.socialProof && this.data.socialProof.clients) {
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
