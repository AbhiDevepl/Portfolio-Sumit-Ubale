/**
 * Content Loader
 * Fetches portfolio data from JSON and dynamically populates the page.
 *
 * Performance Optimization (⚡ Bolt):
 * - Consolidates homepage data fetching to eliminate redundant requests (saves ~300KB).
 * - Implements centralized randomization and pagination for the homepage gallery.
 * - Uses DocumentFragment for efficient DOM batch updates.
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
    this.data = null;
    this.allImages = []; // Cache for processed items
    this.mediaData = {}; // Merged portfolio.images from all JSON sources
    this.visibleImagesCount = 0;
    this.visibleVideosCount = 0;
    this.activeCategory = 'all';
    this.portfolioData = []; // Combined and randomized for homepage
  }

  /**
   * Initialize content loading
   */
  async init() {
    try {
      await this.loadData();
      this.setupHomepageLoadMore();
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
   * Fetch JSON data from multiple sources in parallel
   */
  async loadData() {
    try {
      const [oldData, newData] = await Promise.all([
        fetch(this.dataUrl).then(res => res.ok ? res.json() : null).catch(() => null),
        fetch('data/new_portfolio.json').then(res => res.ok ? res.json() : null).catch(() => null)
      ]);

      if (!oldData && !newData) {
        throw new Error('No portfolio data available');
      }

      // Use oldData as primary for metadata (recentEvents, socialProof, etc.)
      this.data = oldData || newData;

      // Deep merge portfolio images from both sources
      this.mergeMediaData(oldData);
      this.mergeMediaData(newData);

      // Process for homepage specific needs
      this.integrateAndRandomize(oldData, newData);

      return this.data;
    } catch (error) {
      throw new Error(`Failed to load portfolio data: ${error.message}`);
    }
  }

  /**
   * Merges category-based media data into this.mediaData
   */
  mergeMediaData(source) {
    if (!source) return;
    const images = (source.portfolio && source.portfolio.images) ? source.portfolio.images : source;

    Object.keys(images).forEach(category => {
      if (Array.isArray(images[category])) {
        if (!this.mediaData[category]) {
          this.mediaData[category] = [];
        }
        // Avoid duplicate src entries during merge
        images[category].forEach(item => {
          const exists = this.mediaData[category].some(existing => existing.src === item.src);
          if (!exists) {
            this.mediaData[category].push(item);
          }
        });
      }
    });
  }

  /**
   * Merges data sources, flattens, and randomizes for homepage gallery
   */
  integrateAndRandomize(oldData, newData) {
    const combined = [];
    const process = (data) => {
      if (!data) return;
      const categoriesObj = (data.portfolio && data.portfolio.images) ? data.portfolio.images : data;
      Object.keys(categoriesObj).forEach(category => {
        if (Array.isArray(categoriesObj[category])) {
          categoriesObj[category].forEach(item => {
            combined.push({
              type: item.type === 'video' ? 'video' : 'image',
              category: category,
              src: item.src,
              alt: item.alt || item.title || 'Portfolio media',
              poster: item.poster || item.thumb || ''
            });
          });
        }
      });
    };

    process(oldData);
    process(newData);

    // Filter unique by src
    const seen = new Set();
    this.portfolioData = combined.filter(item => {
      if (seen.has(item.src)) return false;
      seen.add(item.src);
      return true;
    });

    // Fisher-Yates Shuffle for homepage variety
    for (let i = this.portfolioData.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.portfolioData[i], this.portfolioData[j]] = [this.portfolioData[j], this.portfolioData[i]];
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
   * Get flattened images for a category
   */
  getFilteredItems(category) {
    if (!this.mediaData) return [];

    if (category === 'all') {
      const all = [];
      Object.keys(this.mediaData).forEach(cat => {
        this.mediaData[cat].forEach(item => {
          all.push(item);
        });
      });
      return all;
    }

    return this.mediaData[category] || [];
  }

  /**
   * Render gallery items for a category
   */
  renderCategory(category) {
    // Detect homepage grid vs dedicated gallery page
    const inlineGrid = document.getElementById('portfolio-inline-grid');
    if (inlineGrid) {
      this.renderHomepageGallery(category);
      return;
    }

    const galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) return;

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
      el.setAttribute('aria-label', `${item.title || 'Open preview'}${item.category ? ', ' + item.category : ''}`);

      el.addEventListener('click', () => {
        const visibleItems = (window.GalleryManager && window.GalleryManager.getVisibleData && window.GalleryManager.getVisibleData()) || items;
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
      overlay.innerHTML = `
        <h3 class="gallery-title">${item.title || 'Untitled'}</h3>
        <p class="gallery-category">${this.getCategoryName(item.category || category)}</p>
      `;
      el.appendChild(overlay);

      fragment.appendChild(el);
    });

    galleryGrid.appendChild(fragment);
    this.initLazyLoader();

    // Cache with original index for lightbox navigation
    this.allImages = items.map((item, idx) => ({ ...item, originalIndex: idx }));
    if (window.GalleryManager) {
      window.GalleryManager.allImages = this.allImages;
    }
  }

  /**
   * Homepage specific rendering with pagination and randomization
   */
  renderHomepageGallery(category) {
    const grid = document.getElementById('portfolio-inline-grid');
    if (!grid) return;

    this.activeCategory = category;
    this.visibleImagesCount = 0;
    this.visibleVideosCount = 0;
    grid.innerHTML = '';

    if (category === 'cinematics') {
      grid.classList.add('cinematics-mode');
    } else {
      grid.classList.remove('cinematics-mode');
    }

    // Define initial batch size
    let iAdd = 0, vAdd = 0;
    if (category === 'cinematics') {
      vAdd = 1;
    } else if (category === 'all') {
      iAdd = 3;
      vAdd = 0;
    } else {
      iAdd = 3;
      vAdd = 1;
    }
    this.appendHomepageItems(iAdd, vAdd);
  }

  getHomepageFilteredItems(type) {
    return this.portfolioData.filter(item =>
      (this.activeCategory === 'all' || item.category === this.activeCategory) && item.type === type
    );
  }

  appendHomepageItems(imgCount, vidCount) {
    const grid = document.getElementById('portfolio-inline-grid');
    if (!grid) return;

    const images = this.getHomepageFilteredItems('image');
    const videos = this.getHomepageFilteredItems('video');
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
      el.style.animationDelay = `${idx * 60}ms`;

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
        vid.addEventListener('mouseenter', () => vid.play().catch(() => {}));
        vid.addEventListener('mouseleave', () => vid.pause());
        el.appendChild(vid);
      }

      frag.appendChild(el);
    });

    grid.appendChild(frag);
    this.updateHomepageLoadMoreVisibility(images.length, videos.length);
  }

  setupHomepageLoadMore() {
    const loadMoreBtn = document.getElementById('inline-load-more-btn');
    if (!loadMoreBtn) return;

    loadMoreBtn.onclick = () => {
      if (this.activeCategory === 'cinematics') {
        const grid = document.getElementById('portfolio-inline-grid');
        if (grid) grid.innerHTML = '';
        this.appendHomepageItems(0, 1);
      } else {
        this.appendHomepageItems(3, 0);
      }
    };

    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
      btn.onclick = () => {
        categoryBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const newCategory = btn.getAttribute('data-category');
        if (this.activeCategory !== newCategory) {
          this.renderHomepageGallery(newCategory);
        }
      };
    });
  }

  updateHomepageLoadMoreVisibility(totalImages, totalVideos) {
    const moreBtnWrapper = document.getElementById('portfolio-inline-more');
    if (!moreBtnWrapper) return;

    const moreImg = this.visibleImagesCount < totalImages;
    const moreVid = this.visibleVideosCount < totalVideos;

    if (this.activeCategory === 'cinematics') {
      moreBtnWrapper.style.display = moreVid ? 'block' : 'none';
    } else if (this.activeCategory === 'all') {
      moreBtnWrapper.style.display = 'none';
    } else {
      moreBtnWrapper.style.display = moreImg ? 'block' : 'none';
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
    if (!eventsGrid || !(this.data && this.data.recentEvents)) {
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
      overlay.innerHTML = `
        <h3 class="gallery-title">${event.title}</h3>
        <p class="gallery-category">${event.category}</p>
      `;
      
      item.appendChild(img);
      item.appendChild(overlay);
      eventsGrid.appendChild(item);
    });
  }

  /**
   * Populate about section with social proof
   */
  populateAbout() {
    const publicationsContainer = document.getElementById('publications');
    if (publicationsContainer && (this.data && this.data.socialProof && this.data.socialProof.publications)) {
      publicationsContainer.innerHTML = '';
      this.data.socialProof.publications.forEach(pub => {
        const pubItem = document.createElement('span');
        pubItem.className = 'publication-item';
        pubItem.textContent = pub;
        publicationsContainer.appendChild(pubItem);
      });
    }

    const awardsContainer = document.getElementById('awards');
    if (awardsContainer && (this.data && this.data.socialProof && this.data.socialProof.awards)) {
      awardsContainer.innerHTML = '';
      this.data.socialProof.awards.forEach(award => {
        const awardItem = document.createElement('li');
        awardItem.textContent = award;
        awardsContainer.appendChild(awardItem);
      });
    }

    const clientsContainer = document.getElementById('clients');
    if (clientsContainer && (this.data && this.data.socialProof && this.data.socialProof.clients)) {
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
    const errorMessage = document.createElement('div');
    errorMessage.className = 'content-error';
    errorMessage.innerHTML = `
      <p>Unable to load portfolio content. Please try refreshing the page.</p>
      <p class="error-details">${error.message}</p>
    `;

    const galleryGrid = document.getElementById('gallery-grid') || document.getElementById('portfolio-inline-grid');
    if (galleryGrid) {
      galleryGrid.innerHTML = '';
      galleryGrid.appendChild(errorMessage);
    }
  }
}

// Initialize content loader
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.contentLoader = new ContentLoader();
    window.contentLoader.init();
  });
} else {
  window.contentLoader = new ContentLoader();
  window.contentLoader.init();
}
