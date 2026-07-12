/**
 * Content Loader
 * Fetches portfolio data from JSON and dynamically populates the page
 * Consolidated logic for homepage and gallery pages
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
    this.dataSources = ['/data/portfolio.json', '/data/new_portfolio.json'];
    this.data = null;
    this.mediaData = {}; // Grouped by category
    this.allPortfolioData = []; // Flattened and deduplicated

    // Pagination state for homepage
    this.visibleImagesCount = 0;
    this.visibleVideosCount = 0;
    this.activeCategory = 'all';
    this.shuffledAll = []; // Randomized 'all' items for homepage
  }

  /**
   * Initialize content loading
   */
  async init() {
    try {
      await this.loadData();
      this.setupListeners();
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
   * Fetch JSON data from multiple sources and deduplicate
   */
  async loadData() {
    try {
      const results = await Promise.all(
        this.dataSources.map(url =>
          fetch(url)
            .then(res => res.ok ? res.json() : null)
            .catch(() => null)
        )
      );

      const combinedItems = [];
      const seenUrls = new Set();

      results.forEach(result => {
        if (!result) return;

        // Handle both formats: { portfolio: { images: { cat: [] } } } or { cat: [] }
        const images = (result.portfolio && result.portfolio.images) ? result.portfolio.images : result;

        // Cache data for recentEvents/socialProof from the main portfolio.json
        // Only update if the result actually contains the expected metadata to avoid overwriting with partial data
        if (result.portfolio && (result.portfolio.recentEvents || result.portfolio.socialProof)) {
            this.data = result;
        }

        Object.keys(images).forEach(category => {
          if (Array.isArray(images[category])) {
            images[category].forEach(item => {
              if (!seenUrls.has(item.src)) {
                seenUrls.add(item.src);
                const processedItem = Object.assign({}, item, {
                  category: category,
                  type: item.type === 'video' ? 'video' : 'image'
                });
                combinedItems.push(processedItem);

                // Group by category
                if (!this.mediaData[category]) this.mediaData[category] = [];
                this.mediaData[category].push(processedItem);
              }
            });
          }
        });
      });

      this.allPortfolioData = combinedItems;

      // Prepare shuffled 'all' for homepage
      this.shuffledAll = this.allPortfolioData.slice();
      for (let i = this.shuffledAll.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = this.shuffledAll[i];
        this.shuffledAll[i] = this.shuffledAll[j];
        this.shuffledAll[j] = temp;
      }

      return this.allPortfolioData;
    } catch (error) {
      throw new Error(`Failed to load portfolio data: ${error.message}`);
    }
  }

  /**
   * Setup UI event listeners
   */
  setupListeners() {
    // Category chips/buttons
    const categoryBtns = document.querySelectorAll('.category-btn');
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
          this.activeCategory = newCategory;
          this.renderInitial();
        }
      });
    });

    // Load More Button
    const loadMoreBtn = document.getElementById('inline-load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        if (this.activeCategory === 'cinematics' || this.activeCategory === 'video') {
          // Replace current video with the next one
          const grid = document.getElementById('portfolio-inline-grid');
          if (grid) grid.innerHTML = '';
          this.appendItems(0, 1);
        } else {
          this.appendItems(3, 0);
        }
      });
    }
  }

  /**
   * Populate gallery grid
   */
  populateGallery() {
    const isHomepage = !!document.getElementById('portfolio-inline-grid');
    if (isHomepage) {
      this.renderInitial();
    } else {
      this.renderCategory('all');
    }
  }

  /**
   * Helper to get category name from slug
   */
  getCategoryName(category) {
    return ContentLoader.CATEGORY_NAMES[category] || category;
  }

  /**
   * Get filtered items for a category
   */
  getFilteredItems(category, type = null) {
    let items = [];
    if (category === 'all') {
      items = this.shuffledAll;
    } else {
      items = this.mediaData[category] || [];
    }

    if (type) {
      return items.filter(item => item.type === type);
    }
    return items;
  }

  /**
   * Homepage specific initial render
   */
  renderInitial() {
    const grid = document.getElementById('portfolio-inline-grid');
    if (!grid) return;

    grid.innerHTML = '';
    this.visibleImagesCount = 0;
    this.visibleVideosCount = 0;

    // Toggle cinematics layout mode
    if (this.activeCategory === 'cinematics' || this.activeCategory === 'video') {
      grid.classList.add('cinematics-mode');
    } else {
      grid.classList.remove('cinematics-mode');
    }

    let iAdd = 0, vAdd = 0;
    if (this.activeCategory === 'cinematics' || this.activeCategory === 'video') {
      vAdd = 1;
    } else if (this.activeCategory === 'all') {
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
    const grid = document.getElementById('portfolio-inline-grid');
    const moreBtnWrapper = document.getElementById('portfolio-inline-more');
    if (!grid) return;

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

    if (toAppend.length === 0) {
        if (moreBtnWrapper) moreBtnWrapper.style.display = 'none';
        return;
    }

    const fragment = document.createDocumentFragment();

    toAppend.forEach((item, idx) => {
      // Use Core.Media if available, otherwise fallback to local creation
      let el;
      if (window.Core && window.Core.Media) {
          el = window.Core.Media.createItem(item, idx, toAppend, this.getCategoryName.bind(this));
          // Adjust for homepage specific classes
          el.classList.add('portfolio-item', 'fade-in-up');
          el.classList.remove('gallery-item');
          el.dataset.type = item.type;
          el.style.animationDelay = (idx * 100) + 'ms';
      } else {
          el = this.createLocalItem(item, idx);
          el.style.animationDelay = (idx * 100) + 'ms';
      }
      fragment.appendChild(el);
    });

    grid.appendChild(fragment);

    // Update "Load More" visibility
    if (moreBtnWrapper) {
        const hasMoreImages = this.visibleImagesCount < images.length;
        const hasMoreVideos = this.visibleVideosCount < videos.length;

        if (this.activeCategory === 'cinematics' || this.activeCategory === 'video') {
          moreBtnWrapper.style.display = hasMoreVideos ? 'block' : 'none';
        } else if (this.activeCategory === 'all') {
          moreBtnWrapper.style.display = 'none'; // Homepage 'all' doesn't have load more in original script
        } else {
          moreBtnWrapper.style.display = hasMoreImages ? 'block' : 'none';
        }
    }

    this.initLazyLoader();
  }

  /**
   * Fallback item creator if Core.js is missing
   */
  createLocalItem(item, idx) {
    const el = document.createElement('div');
    el.className = 'portfolio-item fade-in-up';
    el.dataset.type = item.type;

    if (item.type === 'image') {
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.alt || 'Portfolio image';
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

      if (window.Core && window.Core.VideoHover) {
          window.Core.VideoHover.init(vid);
      } else {
          vid.addEventListener('mouseenter', () => vid.play().catch(() => {}));
          vid.addEventListener('mouseleave', () => vid.pause());
      }
      el.appendChild(vid);
    }

    // Add overlay for consistency
    const overlay = document.createElement('div');
    overlay.className = 'gallery-overlay';
    overlay.innerHTML = '<h3 class="gallery-title">' + (item.title || '') + '</h3><p class="gallery-category">' + this.getCategoryName(item.category) + '</p>';
    el.appendChild(overlay);

    return el;
  }

  /**
   * Render gallery items for a category (Gallery Page)
   * @param {string} category - Category slug
   */
  renderCategory(category) {
    let galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) return;

    const items = this.getFilteredItems(category);

    // Clear existing
    galleryGrid.innerHTML = '';

    if (items.length === 0) {
      galleryGrid.innerHTML = '<p class="no-items">No items found in this category.</p>';
      return;
    }

    const fragment = document.createDocumentFragment();

    items.forEach((item, index) => {
      let el;
      if (window.Core && window.Core.Media) {
          el = window.Core.Media.createItem(item, index, items, this.getCategoryName.bind(this));
      } else {
          el = this.createLocalItem(item, index);
          el.className = 'gallery-item reveal-item';
      }
      fragment.appendChild(el);
    });

    galleryGrid.appendChild(fragment);
    this.initLazyLoader();
  }

  /**
   * Re-run IntersectionObserver on lazy images
   */
  initLazyLoader() {
    const lazyImages = document.querySelectorAll('img[data-src], video[data-src]');
    if (lazyImages.length === 0) return;

    if (!window.lazyImageObserver) {
      window.lazyImageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            if (el.tagName === 'IMG') {
                el.src = el.dataset.src;
            } else if (el.tagName === 'VIDEO') {
                el.src = el.dataset.src;
                el.load();
            }
            el.removeAttribute('data-src');
            window.lazyImageObserver.unobserve(el);
          }
        });
      }, { rootMargin: '200px' });
    }

    lazyImages.forEach(el => {
      if (el.dataset.src) {
        window.lazyImageObserver.observe(el);
      }
    });
  }

  /**
   * Populate events section
   */
  populateEvents() {
    const eventsGrid = document.querySelector('.events-grid');
    
    if (!eventsGrid || !this.data?.recentEvents) {
      return;
    }

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
    if (!this.data?.socialProof) return;

    const sections = {
      'publications': 'publications',
      'awards': 'awards',
      'clients': 'clients'
    };

    Object.entries(sections).forEach(([key, id]) => {
      const container = document.getElementById(id);
      if (container && this.data.socialProof[key]) {
        container.innerHTML = '';
        this.data.socialProof[key].forEach(text => {
          const el = document.createElement(key === 'awards' ? 'li' : 'span');
          if (key !== 'awards') el.className = (key.slice(0, -1)) + '-item';
          el.textContent = text;
          container.appendChild(el);
        });
      }
    });
  }

  /**
   * Handle errors
   */
  handleError(error) {
    console.error('❌ Content loading error:', error);
    const galleryGrid = document.getElementById('gallery-grid') || document.getElementById('portfolio-inline-grid');
    if (galleryGrid) {
      galleryGrid.innerHTML = '<div class="content-error"><p>Unable to load portfolio content. Please try refreshing the page.</p><p class="error-details">' + error.message + '</p></div>';
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
