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
    'perwedding': 'Pre-Wedding',
    'pre-wedding-photos-and-videos': 'Pre-Wedding',
    'cinematics': 'Cinematics',
    'video': 'Cinematics'
  };

  constructor() {
    this.dataUrl = 'data/portfolio.json';
    this.newDataUrl = 'data/new_portfolio.json';
    this.data = null;
    this.allImages = []; // Cache for processed items
    this.mediaData = null; // Cache portfolio.images from JSON
    this.shuffledAll = null; // Stably shuffled 'all' items
    this.visibleCount = 3; // Homepage initial limit
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
      this.initLoadMore();
      this.initFilters();
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Fetch JSON data and merge sources
   */
  async loadData() {
    try {
      const results = await Promise.all([
        fetch(this.dataUrl).then(res => (res.ok ? res.json() : null)).catch(() => null),
        fetch(this.newDataUrl).then(res => (res.ok ? res.json() : null)).catch(() => null)
      ]);

      const oldData = results[0];
      const newData = results[1];

      this.data = oldData || newData || { portfolio: { images: {} } };

      // Merge images from all categories in both files
      const mergedImages = {};
      const sources = [oldData, newData];

      sources.forEach(source => {
        if (source && source.portfolio && source.portfolio.images) {
          Object.keys(source.portfolio.images).forEach(cat => {
            if (!mergedImages[cat]) mergedImages[cat] = [];
            mergedImages[cat] = mergedImages[cat].concat(source.portfolio.images[cat]);
          });
        }
      });

      this.mediaData = mergedImages;

      // Pre-calculate and shuffle 'all' items for stability
      let all = [];
      Object.keys(this.mediaData).forEach(key => {
        const items = this.mediaData[key].map(item => Object.assign({}, item, { category: item.category || key }));
        all = all.concat(items);
      });
      this.shuffledAll = this.shuffleArray(all);

      return this.data;
    } catch (error) {
      throw new Error('Failed to load portfolio data: ' + error.message);
    }
  }

  /**
   * Fisher-Yates Shuffle
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
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
      return this.shuffledAll || [];
    }

    return this.mediaData[category] || [];
  }

  /**
   * Render gallery items for a category
   * @param {string} category - Category slug
   */
  renderCategory(category) {
    const isInline = !!document.getElementById('portfolio-inline-grid');
    let galleryGrid = document.getElementById('gallery-grid') || document.getElementById('portfolio-inline-grid');
    if (!galleryGrid) return;

    // Reset pagination when category changes
    if (this.activeCategory !== category) {
      this.activeCategory = category;
      this.visibleCount = ((category === 'cinematics' || category === 'video') && isInline) ? 1 : 3;
    }

    const allItems = this.getFilteredItems(category);
    // Homepage (inline grid) starts with a limit, full gallery shows all
    let items;
    if (isInline && (category === 'cinematics' || category === 'video')) {
      // Replacement behavior for cinematics: show only the CURRENT item
      items = allItems.slice(this.visibleCount - 1, this.visibleCount);
    } else {
      items = isInline ? allItems.slice(0, this.visibleCount) : allItems;
    }

    // Toggle cinematics layout mode for homepage grid
    if (isInline) {
      if (category === 'cinematics' || category === 'video') {
        galleryGrid.classList.add('cinematics-mode');
      } else {
        galleryGrid.classList.remove('cinematics-mode');
      }
    }

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
      // Use portfolio-item on homepage for specific CSS, gallery-item for shared styles
      const baseClass = isInline ? 'portfolio-item' : 'gallery-item';
      el.className = baseClass + ' ' + (isVideo ? 'gallery-item--video' : 'gallery-item--image') + ' reveal-item fade-in-up';
      el.dataset.index = index;
      el.dataset.category = category === 'all' ? (item.category || 'uncategorized') : category;
      el.dataset.type = item.type || 'image'; // Required for index.html CSS aspect-ratio
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', (item.title || 'Open preview') + (item.category ? ', ' + item.category : ''));

      // Click handler for lightbox
      el.addEventListener('click', () => {
        const visibleItems = (window.GalleryManager && window.GalleryManager.getVisibleData && window.GalleryManager.getVisibleData()) || allItems;
        const itemIndex = visibleItems.indexOf(item);
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
        if (item.poster) video.poster = item.poster;
        video.muted = true;
        video.loop = true;
        video.setAttribute('playsinline', '');
        video.className = 'gallery-image';
        if (item.aspectRatio) video.style.aspectRatio = item.aspectRatio;

        // Homepage hover behavior matching index.html
        if (isInline) {
          video.addEventListener('mouseenter', () => { video.play().catch(() => {}); });
          video.addEventListener('mouseleave', () => { video.pause(); });
        }

        el.appendChild(video);
      } else {
        const img = document.createElement('img');
        img.src = item.src; // Full load for initial items to avoid jumpy homepage
        img.alt = item.alt || item.title || '';
        img.className = 'gallery-image';
        img.loading = 'lazy';
        if (item.aspectRatio) img.style.aspectRatio = item.aspectRatio;
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

    // Update Load More button visibility
    const moreBtnWrapper = document.getElementById('portfolio-inline-more');
    if (moreBtnWrapper) {
      moreBtnWrapper.style.display = this.visibleCount < allItems.length ? 'block' : 'none';
    }

    // Update allImages cache for lightbox (sync with current filter)
    this.allImages = allItems;
    if (window.GalleryManager) {
      window.GalleryManager.allImages = this.allImages;
    }
  }

  /**
   * Initialize category filters for homepage
   */
  initFilters() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const isInline = !!document.getElementById('portfolio-inline-grid');
    if (!isInline || categoryBtns.length === 0) return;

    categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        categoryBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const newCategory = btn.getAttribute('data-category');
        if (this.activeCategory !== newCategory) {
          this.renderCategory(newCategory);
        }
      });
    });
  }

  /**
   * Initialize Load More button
   */
  initLoadMore() {
    const btn = document.getElementById('inline-load-more-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        // Special case: cinematics homepage grid shows only one video at a time
        const isInline = !!document.getElementById('portfolio-inline-grid');
        if ((this.activeCategory === 'cinematics' || this.activeCategory === 'video') && isInline) {
          this.visibleCount += 1;
          const total = this.getFilteredItems(this.activeCategory).length;
          if (this.visibleCount > total) this.visibleCount = 1;
        } else {
          this.visibleCount += 3;
        }

        this.renderCategory(this.activeCategory);

        // Refresh GSAP if available
        if (window.ScrollTrigger) {
          window.ScrollTrigger.refresh();
        }
      });
    }
  }

  /**
   * Re-run IntersectionObserver on lazy images
   */
  initLazyLoader() {
    const lazyImages = document.querySelectorAll('#gallery-grid img[data-src]');

    // Create or reuse observer
    if (!window.lazyImageObserver) {
      window.lazyImageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
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
    const eventsGrid = document.querySelector('.events-grid');
    
    if (!eventsGrid || !(this.data && this.data.recentEvents)) {
      console.warn('Events grid or data not found');
      return;
    }

    // Clear existing content
    eventsGrid.innerHTML = '';

    // Create event items (reusing gallery item structure for consistency)
    this.data.recentEvents.forEach(function(event) {
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
      this.data.socialProof.publications.forEach(function(pub) {
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
      this.data.socialProof.awards.forEach(function(award) {
        const awardItem = document.createElement('li');
        awardItem.textContent = award;
        awardsContainer.appendChild(awardItem);
      });
    }

    // Populate clients
    const clientsContainer = document.getElementById('clients');
    if (clientsContainer && this.data && this.data.socialProof && this.data.socialProof.clients) {
      clientsContainer.innerHTML = '';
      this.data.socialProof.clients.forEach(function(client) {
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
