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
    this.dataUrl = 'data/portfolio.json';
    this.newDataUrl = 'data/new_portfolio.json';
    this.data = null;
    this.allImages = []; // Cache for processed items
    this.mediaData = {}; // Cache portfolio.images from JSON
    this.shuffledAll = []; // globally randomized items
    this.visibleImagesCount = 0;
    this.visibleVideosCount = 0;
    this.activeCategory = 'all';
  }

  /**
   * Initialize content loading
   */
  async init() {
    try {
      await this.loadData();
      
      // Initialize Gallery Interactions (after content is loaded)
      // GalleryManager.init() will trigger the first render via checkURLState
      if (window.GalleryManager) {
        window.GalleryManager.init();
      } else {
        this.renderCategory('all');
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
      const results = await Promise.all([
        fetch(this.dataUrl).then(res => res.ok ? res.json() : null).catch(() => null),
        fetch(this.newDataUrl).then(res => res.ok ? res.json() : null).catch(() => null)
      ]);

      const oldData = results[0];
      const newData = results[1];

      this.data = oldData || newData; // Use for events/about info

      const portfolioData = [];
      const seenUrls = new Set();

      const integrate = (data) => {
        if (!data) return;
        const imagesObj = (data.portfolio && data.portfolio.images) || data;

        Object.keys(imagesObj).forEach(cat => {
          if (Array.isArray(imagesObj[cat])) {
            // Ensure mediaData has the category array
            if (!this.mediaData[cat]) this.mediaData[cat] = [];

            imagesObj[cat].forEach(item => {
              if (seenUrls.has(item.src)) return;
              seenUrls.add(item.src);

              const normalized = {
                type: item.type === 'video' ? 'video' : 'image',
                category: cat,
                src: item.src,
                alt: item.alt || item.title || 'Portfolio media',
                poster: item.poster || item.thumb || '',
                title: item.title || ''
              };

              portfolioData.push(normalized);
              this.mediaData[cat].push(normalized);
            });
          }
        });
      };

      integrate(oldData);
      integrate(newData);

      // Globally randomize the array for 'all' view
      for (let i = portfolioData.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = portfolioData[i];
        portfolioData[i] = portfolioData[j];
        portfolioData[j] = temp;
      }

      this.shuffledAll = portfolioData;
      return this.data;
    } catch (error) {
      throw new Error(`Failed to load portfolio data: ${error.message}`);
    }
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
      // Return cached shuffled items instead of flattening on the fly
      if (this.shuffledAll && this.shuffledAll.length > 0) {
        return this.shuffledAll;
      }

      // Fallback: Manual flatten if shuffledAll is empty
      const all = [];
      const categories = Object.keys(this.mediaData);
      for (let i = 0; i < categories.length; i++) {
        const catItems = this.mediaData[categories[i]];
        for (let j = 0; j < catItems.length; j++) {
          all.push(catItems[j]);
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
    let grid = document.getElementById('portfolio-inline-grid');
    if (!grid) {
      // Fallback for full gallery pages if they use this class
      this.renderFullGallery(category);
      return;
    }

    this.activeCategory = category;
    this.visibleImagesCount = 0;
    this.visibleVideosCount = 0;
    grid.innerHTML = '';

    // Toggle cinematics layout mode
    if (category === 'cinematics' || category === 'video') {
      grid.classList.add('cinematics-mode');
    } else {
      grid.classList.remove('cinematics-mode');
    }

    let iAdd = 0, vAdd = 0;
    if (category === 'cinematics' || category === 'video') {
      vAdd = 1;
    } else if (category === 'all') {
      iAdd = 3;
      vAdd = 0;
    } else {
      iAdd = 3;
      vAdd = 1;
    }

    this.appendItems(iAdd, vAdd);
  }

  /**
   * Append items to the grid
   */
  appendItems(imgCount, vidCount) {
    const grid = document.getElementById('portfolio-inline-grid');
    if (!grid) return;

    const allFiltered = this.getFilteredItems(this.activeCategory);
    const images = [];
    const videos = [];

    for (let i = 0; i < allFiltered.length; i++) {
      if (allFiltered[i].type === 'video') {
        videos.push(allFiltered[i]);
      } else {
        images.push(allFiltered[i]);
      }
    }

    const toAppend = [];
    for (let i = 0; i < imgCount; i++) {
      if (this.visibleImagesCount < images.length) {
        toAppend.push(images[this.visibleImagesCount]);
        this.visibleImagesCount++;
      }
    }
    for (let i = 0; i < vidCount; i++) {
      if (this.visibleVideosCount < videos.length) {
        toAppend.push(videos[this.visibleVideosCount]);
        this.visibleVideosCount++;
      }
    }

    if (toAppend.length === 0) {
      this.updateLoadMoreButton(false, false);
      return;
    }

    const fragment = document.createDocumentFragment();
    toAppend.forEach((item, idx) => {
      const el = document.createElement('div');
      el.className = 'portfolio-item fade-in-up';
      el.dataset.type = item.type;
      el.style.animationDelay = (idx * 60) + 'ms';
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', (item.title || 'Open preview') + (item.category ? ', ' + item.category : ''));

      // Lightbox interaction
      el.onclick = () => {
        if (window.Core && window.Core.Lightbox) {
          // In 'all' view, we want to browse everything filtered.
          // For simplicity on homepage, we'll pass the current filtered items.
          const targetIndex = allFiltered.indexOf(item);
          window.Core.Lightbox.open(targetIndex >= 0 ? targetIndex : 0, allFiltered);
        }
      };

      el.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          el.click();
        }
      };

      if (item.type === 'image') {
        const img = document.createElement('img');
        img.src = item.src;
        img.alt = item.alt || '';
        img.loading = 'lazy';
        img.decoding = 'async';
        el.appendChild(img);
      } else {
        const vid = document.createElement('video');
        vid.src = item.src;
        if (item.poster) vid.poster = item.poster;
        vid.muted = true;
        vid.loop = true;
        vid.setAttribute('playsinline', '');
        vid.preload = 'metadata';

        vid.onmouseenter = () => vid.play().catch(() => {});
        vid.onmouseleave = () => vid.pause();
        el.appendChild(vid);
      }
      fragment.appendChild(el);
    });

    grid.appendChild(fragment);

    const hasMoreImg = this.visibleImagesCount < images.length;
    const hasMoreVid = this.visibleVideosCount < videos.length;
    this.updateLoadMoreButton(hasMoreImg, hasMoreVid);
  }

  /**
   * Load more action
   */
  loadMore() {
    const grid = document.getElementById('portfolio-inline-grid');
    if (this.activeCategory === 'cinematics' || this.activeCategory === 'video') {
      if (grid) grid.innerHTML = '';
      this.appendItems(0, 1);
    } else {
      this.appendItems(3, 0);
    }
  }

  /**
   * Update visibility of Load More button
   */
  updateLoadMoreButton(hasMoreImg, hasMoreVid) {
    const moreBtnWrapper = document.getElementById('portfolio-inline-more');
    if (!moreBtnWrapper) return;

    let show = false;
    if (this.activeCategory === 'cinematics' || this.activeCategory === 'video') {
      show = hasMoreVid;
    } else if (this.activeCategory === 'all') {
      show = false; // Homepage design: 'All' doesn't have load more
    } else {
      show = hasMoreImg;
    }

    moreBtnWrapper.style.display = show ? 'block' : 'none';
  }

  /**
   * Full gallery rendering (legacy support for pages/gallery.html)
   */
  renderFullGallery(category) {
    let grid = document.getElementById('gallery-grid');
    if (!grid) return;

    const items = this.getFilteredItems(category);
    grid.innerHTML = '';

    if (items.length === 0) {
      grid.innerHTML = '<p class="no-items">No items found in this category.</p>';
      return;
    }

    const fragment = document.createDocumentFragment();
    items.forEach((item, index) => {
      const el = Core.Media.createItem(item, index, items, (cat) => this.getCategoryName(cat));
      fragment.appendChild(el);
    });
    grid.appendChild(fragment);

    // Ensure lazy loader picks up new items
    this.initLazyLoader();

    this.allImages = items.map((item, idx) => {
      const newItem = {};
      Object.keys(item).forEach(key => newItem[key] = item[key]);
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
