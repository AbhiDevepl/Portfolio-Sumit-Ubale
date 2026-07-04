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
    'perwedding': 'Pre-Wedding',
    'cinematics': 'Cinematics'
  };

  constructor() {
    this.dataUrl = 'data/portfolio.json';
    this.data = null;
    this.allImages = []; // Cache for processed items
    this.mediaData = null; // Cache portfolio.images from JSON
    this.shuffledAll = []; // Randomized 'all' category for consistent pagination
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
   * Fetch JSON data and merge with optional new_portfolio.json
   */
  async loadData() {
    try {
      const fetchOld = fetch(this.dataUrl);
      const fetchNew = fetch('data/new_portfolio.json').catch(() => null);

      const responses = await Promise.all([fetchOld, fetchNew]);
      const oldRes = responses[0];
      const newRes = responses[1];

      const oldData = oldRes.ok ? await oldRes.json() : null;
      const newData = (newRes && newRes.ok) ? await newRes.json() : null;

      if (!oldData) {
        throw new Error('Primary portfolio data failed to load');
      }

      this.data = oldData;

      // Merge images
      const mergedImages = (oldData.portfolio && oldData.portfolio.images) || {};
      const newImages = (newData && newData.portfolio && newData.portfolio.images) || (newData || {});

      const categories = Object.keys(newImages);
      for (let i = 0; i < categories.length; i++) {
        const cat = categories[i];
        if (Array.isArray(newImages[cat])) {
          if (!mergedImages[cat]) {
            mergedImages[cat] = [];
          }

          const currentCatItems = mergedImages[cat];
          const seen = new Set();
          for (let j = 0; j < currentCatItems.length; j++) {
            seen.add(currentCatItems[j].src);
          }

          const itemsToMerge = newImages[cat];
          for (let k = 0; k < itemsToMerge.length; k++) {
            const item = itemsToMerge[k];
            if (!seen.has(item.src)) {
              currentCatItems.push(item);
              seen.add(item.src);
            }
          }
        }
      }

      this.mediaData = mergedImages;

      // Initialize shuffledAll for consistent pagination
      this.initShuffledAll();

      return this.data;
    } catch (error) {
      throw new Error('Failed to load portfolio data: ' + error.message);
    }
  }

  /**
   * Create a randomized 'all' category for consistent pagination
   */
  initShuffledAll() {
    const all = [];
    const seenUrls = new Set();
    const categories = Object.keys(this.mediaData);

    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      const items = this.mediaData[cat];
      for (let j = 0; j < items.length; j++) {
        const item = items[j];
        if (!seenUrls.has(item.src)) {
          all.push(Object.assign({}, item, { category: cat }));
          seenUrls.add(item.src);
        }
      }
    }

    // Fisher-Yates shuffle
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = all[i];
      all[i] = all[j];
      all[j] = temp;
    }
    this.shuffledAll = all;
  }

  /**
   * Populate gallery grid with images
   */
  populateGallery() {
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
    if (!this.mediaData) {
      return [];
    }

    if (category === 'all') {
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
    // Handle inline grid (homepage)
    const inlineGrid = document.getElementById('portfolio-inline-grid');
    if (inlineGrid) {
      this.renderInlineGallery(category);
      return;
    }

    const galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) {
      return;
    }

    const items = this.getFilteredItems(category);

    // Clear existing
    galleryGrid.innerHTML = '';

    if (items.length === 0) {
      galleryGrid.innerHTML = '<p class="no-items">No items found in this category.</p>';
      return;
    }

    // Create gallery items with proper structure
    const fragment = document.createDocumentFragment();

    items.forEach((item, index) => {
      const isVideo = item.type === 'video';
      const el = document.createElement('article');
      el.className = 'gallery-item ' + (isVideo ? 'gallery-item--video' : 'gallery-item--image') + ' reveal-item loading';
      el.dataset.index = index;
      el.dataset.category = category === 'all' ? (item.category || 'uncategorized') : category;
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', (item.title || 'Open preview') + (item.category ? ', ' + item.category : ''));

      // Click handler for lightbox
      el.addEventListener('click', () => {
        const visibleItems = (window.GalleryManager && window.GalleryManager.getVisibleData) ? window.GalleryManager.getVisibleData() : items;
        const itemIndex = visibleItems.findIndex((entry) => entry.originalIndex === index);
        const targetIndex = itemIndex >= 0 ? itemIndex : index;

        if (window.Core && window.Core.Lightbox) {
          window.Core.Lightbox.open(targetIndex, visibleItems);
        }
      });

      // Keyboard handler
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          el.click();
        }
      });

      if (isVideo) {
        const video = document.createElement('video');
        video.src = item.src;
        video.controls = true;
        video.playsInline = true;
        video.className = 'gallery-image';
        if (item.aspectRatio) {
          video.style.aspectRatio = item.aspectRatio;
        }
        el.appendChild(video);
      } else {
        const img = document.createElement('img');
        img.dataset.src = item.src; // Lazy load
        img.alt = item.alt || item.title || '';
        img.className = 'gallery-image';
        if (item.aspectRatio) {
          img.style.aspectRatio = item.aspectRatio;
        }
        el.appendChild(img);
      }

      // Add overlay
      const overlay = document.createElement('div');
      overlay.className = 'gallery-overlay';

      const title = document.createElement('h3');
      title.className = 'gallery-title';
      title.textContent = item.title || 'Untitled';

      const catLabel = document.createElement('p');
      catLabel.className = 'gallery-category';
      catLabel.textContent = this.getCategoryName(item.category || category);

      overlay.appendChild(title);
      overlay.appendChild(catLabel);
      el.appendChild(overlay);

      fragment.appendChild(el);
    });

    galleryGrid.appendChild(fragment);

    // Re-init lazy loader for new images
    this.initLazyLoader();

    // Update allImages cache for lightbox
    this.allImages = items.map((item, idx) => Object.assign({}, item, { originalIndex: idx }));
    if (window.GalleryManager) {
      window.GalleryManager.allImages = this.allImages;
    }
  }

  /**
   * Render specific layout for homepage inline gallery
   */
  renderInlineGallery(category) {
    this.activeCategory = category;
    this.visibleImagesCount = 0;
    this.visibleVideosCount = 0;

    const grid = document.getElementById('portfolio-inline-grid');
    if (!grid) {
      return;
    }

    if (category === 'cinematics' || category === 'video') {
      grid.classList.add('cinematics-mode');
    } else {
      grid.classList.remove('cinematics-mode');
    }

    grid.innerHTML = '';

    let iAdd = 0;
    let vAdd = 0;

    if (category === 'cinematics' || category === 'video') {
      vAdd = 1;
    } else if (category === 'all') {
      iAdd = 3;
      vAdd = 0;
    } else {
      iAdd = 3;
      vAdd = 1;
    }

    this.appendInlineItems(iAdd, vAdd);

    // Bind load more button (only once)
    const loadMoreBtn = document.getElementById('inline-load-more-btn');
    if (loadMoreBtn && !loadMoreBtn.dataset.bound) {
      loadMoreBtn.addEventListener('click', () => {
        if (this.activeCategory === 'cinematics' || this.activeCategory === 'video') {
          const gridEl = document.getElementById('portfolio-inline-grid');
          if (gridEl) {
            gridEl.innerHTML = '';
          }
          this.appendInlineItems(0, 1);
        } else {
          this.appendInlineItems(3, 0);
        }
      });
      loadMoreBtn.dataset.bound = "true";
    }
  }

  /**
   * Append items to the inline grid
   */
  appendInlineItems(imgCount, vidCount) {
    const grid = document.getElementById('portfolio-inline-grid');
    const moreBtnWrapper = document.getElementById('portfolio-inline-more');
    if (!grid) {
      return;
    }

    let items = [];
    if (this.activeCategory === 'all') {
      items = this.shuffledAll;
    } else {
      items = this.mediaData[this.activeCategory] || [];
    }

    const images = [];
    const videos = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type === 'video') {
        videos.push(items[i]);
      } else {
        images.push(items[i]);
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
      return;
    }

    const frag = document.createDocumentFragment();
    for (let idx = 0; idx < toAppend.length; idx++) {
      const item = toAppend[idx];
      const el = document.createElement('div');
      el.className = 'portfolio-item fade-in-up';
      el.dataset.type = item.type || 'image';
      el.style.animationDelay = (idx * 60) + 'ms';

      if (item.type === 'video') {
        const vid = document.createElement('video');
        vid.src = item.src;
        if (item.poster) {
          vid.poster = item.poster;
        }
        vid.muted = true;
        vid.loop = true;
        vid.setAttribute('playsinline', '');
        vid.preload = 'metadata';
        vid.addEventListener('mouseenter', () => {
          vid.play().catch(() => {});
        });
        vid.addEventListener('mouseleave', () => {
          vid.pause();
        });
        el.appendChild(vid);
      } else {
        const img = document.createElement('img');
        img.src = item.src;
        img.alt = item.alt || item.title || 'Portfolio image';
        img.loading = 'lazy';
        img.decoding = 'async';
        el.appendChild(img);
      }

      // Lightbox integration for homepage grid
      el.addEventListener('click', () => {
        if (window.Core && window.Core.Lightbox) {
          const allFiltered = this.activeCategory === 'all' ? this.shuffledAll : (this.mediaData[this.activeCategory] || []);
          const itemIndex = allFiltered.indexOf(item);
          window.Core.Lightbox.open(itemIndex, allFiltered);
        }
      });

      frag.appendChild(el);
    }

    grid.appendChild(frag);

    const hasMoreImg = this.visibleImagesCount < images.length;
    const hasMoreVid = this.visibleVideosCount < videos.length;

    if (moreBtnWrapper) {
      if (this.activeCategory === 'cinematics' || this.activeCategory === 'video') {
        moreBtnWrapper.style.display = hasMoreVid ? 'block' : 'none';
      } else if (this.activeCategory === 'all') {
        moreBtnWrapper.style.display = 'none';
      } else {
        moreBtnWrapper.style.display = hasMoreImg ? 'block' : 'none';
      }
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
        entries.forEach((entry) => {
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
    lazyImages.forEach((img) => {
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
      return;
    }

    // Clear existing content
    eventsGrid.innerHTML = '';

    this.data.recentEvents.forEach((event) => {
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
      this.data.socialProof.publications.forEach((pub) => {
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
      this.data.socialProof.awards.forEach((award) => {
        const awardItem = document.createElement('li');
        awardItem.textContent = award;
        awardsContainer.appendChild(awardItem);
      });
    }

    // Populate clients
    const clientsContainer = document.getElementById('clients');
    if (clientsContainer && this.data && this.data.socialProof && this.data.socialProof.clients) {
      clientsContainer.innerHTML = '';
      this.data.socialProof.clients.forEach((client) => {
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

    const errorMessage = document.createElement('div');
    errorMessage.className = 'content-error';
    errorMessage.innerHTML = '<p>Unable to load portfolio content. Please try refreshing the page.</p><p class="error-details">' + error.message + '</p>';

    const galleryGrid = document.getElementById('gallery-grid') || document.getElementById('portfolio-inline-grid');
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
