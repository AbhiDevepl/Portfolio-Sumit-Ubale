/**
 * Content Loader
 * Fetches portfolio data from JSON and dynamically populates the page
 * Optimized for performance: consolidates logic, implements lazy loading,
 * and handles pagination for the homepage.
 */

class ContentLoader {
  constructor() {
    this.dataUrl = '/data/portfolio.json';
    this.data = null;
    this.allImages = []; // Cache for processed items
    this.mediaData = null; // Cache portfolio.images from JSON
    this.portfolioData = []; // Flattened and randomized for homepage
    this.currentlyAppendedItems = []; // In-memory tracking array to bypass DOM queries

    // Pagination state for homepage
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

      const isHomepage = !!document.getElementById('portfolio-inline-grid');

      if (isHomepage) {
        this.setupHomepageGallery();
      } else {
        this.populateGallery();
      }
      
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
   * Fetch and process JSON data
   */
  async loadData() {
    try {
      const [res1, res2] = await Promise.all([
        fetch('/data/portfolio.json').catch(() => null),
        fetch('/data/new_portfolio.json').catch(() => null)
      ]);

      const data1 = res1 && res1.ok ? await res1.json() : null;
      const data2 = res2 && res2.ok ? await res2.json() : null;

      if (!data1 && !data2) {
        throw new Error("Failed to load portfolio data");
      }

      this.data = data1 || data2;
      this.mediaData = this.data.portfolio.images;

      // Flatten categories for homepage
      this.portfolioData = [];
      const globalSeen = new Set();

      const integrate = (data) => {
        if (!data) return;
        const categoriesObj = (data.portfolio && data.portfolio.images) ? data.portfolio.images : data;
        Object.keys(categoriesObj).forEach(cat => {
          if (Array.isArray(categoriesObj[cat])) {
            categoriesObj[cat].forEach(item => {
              if (globalSeen.has(item.src)) return;
              globalSeen.add(item.src);

              const formattedCat = this.getCategoryName(cat);
              this.portfolioData.push({
                type: item.type === 'video' ? 'video' : 'image',
                category: cat,
                formattedCategory: formattedCat,
                src: item.src,
                alt: item.alt || item.title || (formattedCat + ' Photography'),
                poster: item.poster || item.thumb || '',
                title: item.title || '',
                aspectRatio: item.aspectRatio || ''
              });
            });
          }
        });
      };

      integrate(data1);
      integrate(data2);

      // Randomize for homepage variety
      for (let i = this.portfolioData.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.portfolioData[i], this.portfolioData[j]] = [this.portfolioData[j], this.portfolioData[i]];
      }

      return this.data;
    } catch (error) {
      throw new Error(`Failed to load portfolio data: ${error.message}`);
    }
  }

  /**
   * Setup homepage-specific gallery logic (Pagination + Load More)
   */
  setupHomepageGallery() {
    const loadMoreBtn = document.getElementById('inline-load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        if (this.activeCategory === 'cinematics' || this.activeCategory === 'video') {
          const grid = document.getElementById('portfolio-inline-grid');
          if (grid) grid.innerHTML = '';
          this.appendItems(0, 1);
        } else {
          this.appendItems(3, 0);
        }
      });
    }

    // Set up category button click event listeners
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
          this.renderInlineInitial();
        }
      });
    });

    this.renderInlineInitial();
  }

  renderInlineInitial() {
    const grid = document.getElementById('portfolio-inline-grid');
    if (!grid) return;

    grid.innerHTML = '';
    this.visibleImagesCount = 0;
    this.visibleVideosCount = 0;
    this.currentlyAppendedItems = []; // Reset in-memory cache

    // Toggle cinematics layout mode
    if (this.activeCategory === 'cinematics' || this.activeCategory === 'video') {
      grid.classList.add('cinematics-mode');
    } else {
      grid.classList.remove('cinematics-mode');
    }

    let iAdd = 0;
    let vAdd = 0;
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

  appendItems(imgCount, vidCount) {
    const grid = document.getElementById('portfolio-inline-grid');
    if (!grid) return;

    const images = this.portfolioData.filter(item =>
      (this.activeCategory === 'all' || item.category === this.activeCategory) && item.type === 'image'
    );
    const videos = this.portfolioData.filter(item =>
      (this.activeCategory === 'all' || item.category === this.activeCategory) && item.type === 'video'
    );

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
      const el = document.createElement('div');
      el.className = 'portfolio-item fade-in-up';
      el.dataset.type = item.type;
      el.style.animationDelay = (idx * 60) + 'ms';

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

        if (window.Core && window.Core.VideoHover) {
          window.Core.VideoHover.init(vid);
        } else {
          vid.addEventListener('mouseenter', () => vid.play().catch(() => {}));
          vid.addEventListener('mouseleave', () => vid.pause());
        }
        el.appendChild(vid);
      }

      // Track item in our in-memory list with resolved absolute URLs
      this.currentlyAppendedItems.push({
        src: new URL(item.src, window.location.href).href,
        type: item.type,
        title: item.title || '',
        category: this.getCategoryName(this.activeCategory),
        poster: item.poster ? new URL(item.poster, window.location.href).href : ''
      });

      // Click handler for Lightbox
      el.addEventListener('click', () => {
        if (window.Core && window.Core.Lightbox) {
          const visibleItems = this.getHomepageVisibleItems();
          const targetIndex = visibleItems.findIndex(v => v.src === new URL(item.src, window.location.href).href);
          window.Core.Lightbox.open(targetIndex >= 0 ? targetIndex : 0, visibleItems);
        }
      });

      frag.appendChild(el);
    });

    grid.appendChild(frag);

    this.updateLoadMoreVisibility(images.length, videos.length);
  }

  getHomepageVisibleItems() {
    // Avoid expensive O(N) DOM querySelectorAll and nested querySelector loops by returning cached array
    return this.currentlyAppendedItems || [];
  }

  updateLoadMoreVisibility(totalImages, totalVideos) {
    const moreBtnWrapper = document.getElementById('portfolio-inline-more');
    if (!moreBtnWrapper) return;

    const moreImg = this.visibleImagesCount < totalImages;
    const moreVid = this.visibleVideosCount < totalVideos;

    if (this.activeCategory === 'cinematics' || this.activeCategory === 'video') {
      moreBtnWrapper.style.display = moreVid ? 'block' : 'none';
    } else if (this.activeCategory === 'all') {
      moreBtnWrapper.style.display = 'none';
    } else {
      moreBtnWrapper.style.display = moreImg ? 'block' : 'none';
    }
  }

  /**
   * Populate gallery grid (Full Gallery Mode)
   */
  populateGallery() {
    this.renderCategory('all');
  }

  /**
   * Helper to get category name
   */
  getCategoryName(category) {
    return ContentLoader.CATEGORY_NAMES[category] || category;
  }

  /**
   * Get items for a category
   */
  getFilteredItems(category) {
    if (!this.mediaData) return [];

    if (category === 'all') {
      return Object.values(this.mediaData).flat();
    }

    return this.mediaData[category] || [];
  }

  /**
   * Render gallery items for a category
   */
  renderCategory(category) {
    let galleryGrid = document.getElementById('gallery-grid') || document.getElementById('portfolio-inline-grid');
    if (!galleryGrid) return;

    if (galleryGrid.id === 'portfolio-inline-grid') {
      this.activeCategory = category;
      this.renderInlineInitial();
      return;
    }

    const items = this.getFilteredItems(category);
    galleryGrid.innerHTML = '';

    if (items.length === 0) {
      galleryGrid.innerHTML = '<p class="no-items">No items found in this category.</p>';
      return;
    }

    const fragment = document.createDocumentFragment();

    items.forEach((item, index) => {
      const isVideo = item.type === 'video';
      const el = document.createElement('article');
      el.className = `gallery-item ${isVideo ? 'gallery-item--video' : 'gallery-item--image'} reveal-item loading`;
      el.dataset.index = index;
      el.dataset.category = category === 'all' ? (item.category || 'uncategorized') : category;
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', (item.title || 'Open preview') + (item.category ? ', ' + item.category : ''));

      el.addEventListener('click', () => {
        const visibleItems = (window.GalleryManager && window.GalleryManager.getVisibleData) ? window.GalleryManager.getVisibleData() : items;
        const itemIndex = visibleItems.findIndex(entry => entry.originalIndex === index);
        const targetIndex = itemIndex >= 0 ? itemIndex : index;

        if (window.Core && window.Core.Lightbox) {
          window.Core.Lightbox.open(targetIndex, visibleItems);
        }
      });

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
        if (item.aspectRatio) video.style.aspectRatio = item.aspectRatio;
        el.appendChild(video);
      } else {
        const img = document.createElement('img');
        img.dataset.src = item.src;
        img.alt = item.alt || item.title || '';
        img.className = 'gallery-image';
        if (item.aspectRatio) img.style.aspectRatio = item.aspectRatio;
        el.appendChild(img);
      }

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
    this.initLazyLoader();

    this.allImages = items.map((item, idx) => Object.assign({}, item, { originalIndex: idx }));
    if (window.GalleryManager) {
      window.GalleryManager.allImages = this.allImages;
    }
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
    if (!eventsGrid || !this.data || !this.data.recentEvents) return;

    eventsGrid.innerHTML = '';

    this.data.recentEvents.forEach(event => {
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
    const sections = {
      'publications': 'publication-item',
      'awards': 'li',
      'clients': 'client-item'
    };

    Object.entries(sections).forEach(([id, className]) => {
      const container = document.getElementById(id);
      const data = (this.data && this.data.socialProof) ? this.data.socialProof[id] : undefined;
      if (container && data) {
        container.innerHTML = '';
        data.forEach(text => {
          const el = document.createElement(className === 'li' ? 'li' : 'span');
          if (className !== 'li') el.className = className;
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
      galleryGrid.innerHTML = `
        <div class="content-error">
          <p>Unable to load portfolio content. Please try refreshing the page.</p>
          <p class="error-details">${error.message}</p>
        </div>
      `;
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
  document.addEventListener('DOMContentLoaded', () => {
    window.contentLoader = new ContentLoader();
    window.contentLoader.init();
  });
} else {
  window.contentLoader = new ContentLoader();
  window.contentLoader.init();
}
