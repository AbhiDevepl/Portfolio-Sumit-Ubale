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
    'cinematics': 'Cinematics',
    'candid': 'Candid',
    'hero': 'Hero',
    'video': 'Video',
    'perwedding': 'Pre-Wedding',
    'model': 'Model'
  };

  constructor() {
    this.dataUrls = ['/data/portfolio.json', '/data/new_portfolio.json'];
    this.data = null;
    this.allImages = []; // Flattened and processed items
    this.mediaData = {}; // Merged raw portfolio images

    this.visibleImagesCount = 0;
    this.visibleVideosCount = 0;
    this.activeCategory = 'all';

    this.grid = null;
    this.moreBtnWrapper = null;
    this.loadMoreBtn = null;
  }

  /**
   * Initialize content loading
   */
  async init() {
    try {
      await this.loadData();

      // Setup UI elements if on homepage
      this.setupHomepageUI();

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
   * Setup UI references and event listeners for homepage gallery
   */
  setupHomepageUI() {
    this.grid = document.getElementById('portfolio-inline-grid');
    this.moreBtnWrapper = document.getElementById('portfolio-inline-more');
    this.loadMoreBtn = document.getElementById('inline-load-more-btn');

    if (this.loadMoreBtn) {
      this.loadMoreBtn.addEventListener('click', () => {
        if (this.activeCategory === 'cinematics' || this.activeCategory === 'video') {
          if (this.grid) this.grid.innerHTML = '';
          this.appendItems(0, 1);
        } else {
          this.appendItems(3, 0);
        }
      });
    }

    // Category buttons on homepage
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const newCategory = btn.getAttribute('data-category');
        if (this.activeCategory !== newCategory) {
          // Update button states
          categoryBtns.forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
          });
          btn.classList.add('active');
          btn.setAttribute('aria-selected', 'true');

          // GalleryManager handles button states and calls renderCategory
          if (window.GalleryManager && window.GalleryManager.filterGallery) {
             window.GalleryManager.filterGallery(newCategory);
          } else {
             this.renderCategory(newCategory);
          }
        }
      });
    });
  }

  /**
   * Fetch JSON data from multiple sources
   */
  async loadData() {
    try {
      const results = await Promise.all(
        this.dataUrls.map(url =>
          fetch(url)
            .then(res => res.ok ? res.json() : null)
            .catch(() => null)
        )
      );

      this.mediaData = {};
      results.forEach(data => {
        if (!data) return;

        // Handle both possible structures
        const images = (data.portfolio && data.portfolio.images) ? data.portfolio.images : data;

        Object.keys(images).forEach(cat => {
          if (Array.isArray(images[cat])) {
            if (!this.mediaData[cat]) this.mediaData[cat] = [];
            this.mediaData[cat] = this.mediaData[cat].concat(images[cat]);
          }
        });

        // Store first data source for other sections (events, etc.)
        if (!this.data) this.data = data;
      });

      // Process and flatten data
      this.processData();

      return this.data;
    } catch (error) {
      throw new Error(`Failed to load portfolio data: ${error.message}`);
    }
  }

  /**
   * Process raw data into a flat array with metadata
   */
  processData() {
    this.allImages = [];
    if (!this.mediaData) return;

    Object.keys(this.mediaData).forEach(category => {
      if (Array.isArray(this.mediaData[category])) {
        this.mediaData[category].forEach(item => {
          this.allImages.push({
            type: item.type === 'video' ? 'video' : 'image',
            category: category,
            src: item.src,
            alt: item.alt || item.title || 'Portfolio media',
            poster: item.poster || item.thumb || '',
            title: item.title || '',
            aspectRatio: item.aspectRatio || ''
          });
        });
      }
    });

    // Remove duplicates based on src
    const seen = new Set();
    this.allImages = this.allImages.filter(item => {
      if (seen.has(item.src)) return false;
      seen.add(item.src);
      return true;
    });

    // Randomize for fresh experience
    for (let i = this.allImages.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.allImages[i], this.allImages[j]] = [this.allImages[j], this.allImages[i]];
    }
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
   * Get items for a category
   * @param {string} category - Category slug (or 'all')
   * @param {string} type - 'image' or 'video' (optional)
   * @returns {Array} Array of image/video items
   */
  getFilteredItems(category, type = null) {
    let items = category === 'all'
      ? this.allImages
      : this.allImages.filter(item => item.category === category);

    if (type) {
      items = items.filter(item => item.type === type);
    }

    return items;
  }

  /**
   * Render gallery items for a category
   * @param {string} category - Category slug
   */
  renderCategory(category) {
    this.activeCategory = category;

    // Check which grid we are targeting
    const inlineGrid = document.getElementById('portfolio-inline-grid');
    const fullGrid = document.getElementById('gallery-grid');
    const galleryGrid = fullGrid || inlineGrid;

    if (!galleryGrid) return;

    if (inlineGrid) {
      // Incremental rendering for homepage
      this.renderIncremental(inlineGrid, category);
    } else {
      // Full rendering for other pages
      this.renderFull(fullGrid, category);
    }

    // Refresh ScrollTrigger if available
    if (window.ScrollTrigger) {
      setTimeout(() => window.ScrollTrigger.refresh(), 200);
    }
  }

  /**
   * Render full gallery (for portfolio/gallery pages)
   */
  renderFull(container, category) {
    const items = this.getFilteredItems(category);
    container.innerHTML = '';

    if (items.length === 0) {
      container.innerHTML = '<p class="no-items">No items found in this category.</p>';
      return;
    }

    const fragment = document.createDocumentFragment();
    items.forEach((item, index) => {
      const el = this.createGalleryItem(item, index, category);
      fragment.appendChild(el);
    });

    container.appendChild(fragment);
    this.initLazyLoader();

    // Update GalleryManager if it exists
    if (window.GalleryManager) {
      window.GalleryManager.allImages = items.map((item, idx) => ({ ...item, originalIndex: idx }));
    }
  }

  /**
   * Initial rendering for homepage (incremental)
   */
  renderIncremental(container, category) {
    container.innerHTML = '';
    this.visibleImagesCount = 0;
    this.visibleVideosCount = 0;

    // Toggle cinematics layout mode
    if (category === 'cinematics' || category === 'video') {
      container.classList.add('cinematics-mode');
    } else {
      container.classList.remove('cinematics-mode');
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
   * Append items to the homepage grid
   */
  appendItems(imgCount, vidCount) {
    const images = this.getFilteredItems(this.activeCategory, 'image');
    const videos = this.getFilteredItems(this.activeCategory, 'video');

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

    if (toAppend.length === 0) return;

    const frag = document.createDocumentFragment();
    toAppend.forEach((item, idx) => {
      const el = this.createHomepageItem(item, idx);
      frag.appendChild(el);
    });

    if (this.grid) this.grid.appendChild(frag);

    // Update Load More button visibility
    if (this.moreBtnWrapper) {
      const moreImg = this.visibleImagesCount < images.length;
      const moreVid = this.visibleVideosCount < videos.length;

      if (this.activeCategory === 'cinematics' || this.activeCategory === 'video') {
        this.moreBtnWrapper.style.display = moreVid ? 'block' : 'none';
      } else if (this.activeCategory === 'all') {
        this.moreBtnWrapper.style.display = 'none';
      } else {
        this.moreBtnWrapper.style.display = moreImg ? 'block' : 'none';
      }
    }
  }

  /**
   * Create gallery item for homepage (matches index.html styles)
   */
  createHomepageItem(item, idx) {
    const el = document.createElement('div');
    el.className = 'portfolio-item fade-in-up';
    el.dataset.type = item.type;
    el.style.animationDelay = `${idx * 60}ms`;
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');

    if (item.type === 'image') {
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.alt;
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
      vid.addEventListener('mouseenter', () => vid.play().catch(() => {}));
      vid.addEventListener('mouseleave', () => vid.pause());
      el.appendChild(vid);
    }

    // Add click for lightbox
    el.onclick = () => {
       if (window.Core && window.Core.Lightbox) {
         const items = Array.from(this.grid.querySelectorAll('.portfolio-item')).map(itemEl => {
            const media = itemEl.querySelector('img, video');
            return {
              src: media.src,
              type: itemEl.dataset.type,
              poster: media.poster || '',
              alt: media.alt || ''
            };
         });
         const index = Array.from(this.grid.children).indexOf(el);
         window.Core.Lightbox.open(index, items);
       }
    };

    return el;
  }

  /**
   * Create gallery item (standard version)
   */
  createGalleryItem(item, index, category) {
    const isVideo = item.type === 'video';
    const el = document.createElement('article');
    el.className = `gallery-item ${isVideo ? 'gallery-item--video' : 'gallery-item--image'} reveal-item loading`;
    el.dataset.index = index;
    el.dataset.category = category === 'all' ? (item.category || 'uncategorized') : category;
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', `${item.title || 'Open preview'}${item.category ? ', ' + item.category : ''}`);

    // Click handler for lightbox
    el.addEventListener('click', () => {
      const visibleItems = window.GalleryManager?.getVisibleData?.() || this.getFilteredItems(category);
      const itemIndex = visibleItems.findIndex(entry => entry.originalIndex === index);
      const targetIndex = itemIndex >= 0 ? itemIndex : index;

      if (window.Core?.Lightbox) {
        window.Core.Lightbox.open(targetIndex, visibleItems);
      }
    });

    if (isVideo) {
      const video = document.createElement('video');
      video.src = item.src;
      video.controls = true;
      video.playsInline = true;
      video.className = 'gallery-image';
      if (item.aspectRatio) video.style.aspectRatio = item.aspectRatio;
      el.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.dataset.src = item.src; // Lazy load
      img.alt = item.alt || item.title || '';
      img.className = 'gallery-image';
      if (item.aspectRatio) img.style.aspectRatio = item.aspectRatio;
      el.appendChild(img);
    }

    const overlay = document.createElement('div');
    overlay.className = 'gallery-overlay';
    overlay.innerHTML = `<h3 class="gallery-title">${item.title || 'Untitled'}</h3>
                         <p class="gallery-category">${this.getCategoryName(item.category || category)}</p>`;
    el.appendChild(overlay);

    return el;
  }

  /**
   * Re-run IntersectionObserver on lazy images
   */
  initLazyLoader() {
    const lazyImages = document.querySelectorAll('#gallery-grid img[data-src]');

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
    if (!eventsGrid || !this.data?.recentEvents) return;

    eventsGrid.innerHTML = '';
    this.data.recentEvents.forEach((event) => {
      const item = document.createElement('div');
      item.className = 'event-item';
      
      const img = document.createElement('img');
      img.src = event.src;
      img.alt = event.alt || event.title;
      img.className = 'event-image';
      img.loading = 'lazy';
      if (event.aspectRatio) img.style.aspectRatio = event.aspectRatio;
      
      const overlay = document.createElement('div');
      overlay.className = 'gallery-overlay';
      overlay.innerHTML = `<h3 class="gallery-title">${event.title}</h3>
                           <p class="gallery-category">${event.category}</p>`;
      
      item.appendChild(img);
      item.appendChild(overlay);
      eventsGrid.appendChild(item);
    });
  }

  /**
   * Populate about section with social proof
   */
  populateAbout() {
    const populate = (id, data) => {
      const container = document.getElementById(id);
      if (container && data) {
        container.innerHTML = '';
        data.forEach(text => {
          const el = document.createElement(id === 'awards' ? 'li' : 'span');
          if (id !== 'awards') el.className = `${id.slice(0, -1)}-item`;
          el.textContent = text;
          container.appendChild(el);
        });
      }
    };

    if (this.data?.socialProof) {
      populate('publications', this.data.socialProof.publications);
      populate('awards', this.data.socialProof.awards);
      populate('clients', this.data.socialProof.clients);
    }
  }

  /**
   * Handle errors
   */
  handleError(error) {
    console.error('❌ Content loading error:', error);
    const galleryGrid = document.getElementById('gallery-grid') || document.getElementById('portfolio-inline-grid');
    if (galleryGrid) {
      galleryGrid.innerHTML = `<div class="content-error">
        <p>Unable to load portfolio content. Please try refreshing the page.</p>
        <p class="error-details">${error.message}</p>
      </div>`;
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
