/**
 * Content Loader
 * Fetches portfolio data from JSON and dynamically populates the page
 */

class ContentLoader {
  constructor() {
    this.dataUrls = ['/data/portfolio.json', '/data/new_portfolio.json'];
    this.data = null;
    this.allImages = []; // Cache for processed items
    this.mediaData = {}; // Cache merged images from JSON sources
    this.visibleImagesCount = 0;
    this.visibleVideosCount = 0;
    this.activeCategory = 'all';
  }

  static get CATEGORY_NAMES() {
    return {
      'weddings': 'Weddings',
      'portraits': 'Portraits',
      'commercial': 'Commercial',
      'events': 'Events',
      'maternity': 'Maternity',
      'kids': 'Kids',
      'haldi': 'Haldi',
      'engagement': 'Engagement',
      'pre-wedding': 'Pre-Wedding',
      'pre-wedding-photos-and-videos': 'Pre-Wedding',
      'perwedding': 'Pre-Wedding',
      'cinematics': 'Cinematics',
      'video': 'Video'
    };
  }

  /**
   * Initialize content loading
   */
  async init() {
    try {
      await this.loadData();
      this.populateGallery();
      
      // Initialize Gallery Interactions (after content is loaded)
      if (window.GalleryManager && typeof window.GalleryManager.init === 'function') {
        window.GalleryManager.init();
      }
      
      this.populateEvents();
      this.populateAbout();
      this.setupLoadMore();
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Fetch JSON data from multiple sources and merge
   */
  async loadData() {
    try {
      const responses = await Promise.all(
        this.dataUrls.map(url => fetch(url).then(res => res.ok ? res.json() : null).catch(() => null))
      );

      // Main data object for non-gallery content (recentEvents, socialProof)
      this.data = responses[0] || responses[1] || {};

      // Merge images from all sources
      this.mediaData = {};
      responses.forEach(resp => {
        if (!resp) return;
        const images = (resp.portfolio && resp.portfolio.images) ? resp.portfolio.images : resp;

        Object.keys(images).forEach(cat => {
          if (Array.isArray(images[cat])) {
            if (!this.mediaData[cat]) this.mediaData[cat] = [];
            this.mediaData[cat] = this.mediaData[cat].concat(images[cat]);
          }
        });
      });

      // Flatten and process into identity-consistent objects
      this.allImages = [];
      const seenSrc = new Set();

      Object.keys(this.mediaData).forEach(category => {
        this.mediaData[category].forEach(item => {
          if (seenSrc.has(item.src)) return;
          seenSrc.add(item.src);

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
      });

      // Randomize the entire dataset for fresh "All" view
      this.shuffleArray(this.allImages);

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
   * Get images for a category from the randomized master list
   * @param {string} category - Category slug (or 'all')
   * @returns {Array} Array of image/video items
   */
  getFilteredItems(category) {
    if (category === 'all') {
      return this.allImages;
    }
    return this.allImages.filter(item => item.category === category);
  }

  /**
   * Render gallery items for a category
   * @param {string} category - Category slug
   */
  renderCategory(category) {
    this.activeCategory = category;
    const galleryGrid = document.getElementById('gallery-grid') || document.getElementById('portfolio-inline-grid');
    if (!galleryGrid) return;

    const isInlineGrid = galleryGrid.id === 'portfolio-inline-grid';

    // Reset counters for inline grid
    if (isInlineGrid) {
      this.visibleImagesCount = 0;
      this.visibleVideosCount = 0;
      galleryGrid.innerHTML = '';

      if (category === 'cinematics' || category === 'video') {
        galleryGrid.classList.add('cinematics-mode');
        this.appendInlineItems(0, 1);
      } else if (category === 'all') {
        galleryGrid.classList.remove('cinematics-mode');
        this.appendInlineItems(3, 0);
      } else {
        galleryGrid.classList.remove('cinematics-mode');
        this.appendInlineItems(3, 1);
      }
    } else {
      // Full render for gallery-grid (Portfolio page)
      const items = this.getFilteredItems(category);
      galleryGrid.innerHTML = '';

      if (items.length === 0) {
        galleryGrid.innerHTML = '<p class="no-items">No items found in this category.</p>';
        return;
      }

      const fragment = document.createDocumentFragment();
      items.forEach((item, index) => {
        fragment.appendChild(this.createGalleryItemElement(item, index, items));
      });
      galleryGrid.appendChild(fragment);
      this.initLazyLoader();
    }
  }

  /**
   * Append items for the homepage inline grid (pagination)
   */
  appendInlineItems(imgCount, vidCount) {
    const galleryGrid = document.getElementById('portfolio-inline-grid');
    if (!galleryGrid) return;

    const allFiltered = this.getFilteredItems(this.activeCategory);
    const images = allFiltered.filter(item => item.type === 'image');
    const videos = allFiltered.filter(item => item.type === 'video');

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

    const fragment = document.createDocumentFragment();
    toAppend.forEach((item, index) => {
      const el = document.createElement('div');
      el.className = 'portfolio-item fade-in-up';
      el.dataset.type = item.type;
      el.style.animationDelay = (index * 60) + 'ms';

      if (item.type === 'image') {
        const img = document.createElement('img');
        img.src = item.src;
        img.alt = item.alt;
        img.loading = 'lazy';
        img.setAttribute('decoding', 'async');
        el.appendChild(img);
      } else {
        const vid = document.createElement('video');
        vid.src = item.src;
        if (item.poster) vid.poster = item.poster;
        vid.muted = true;
        vid.loop = true;
        vid.setAttribute('playsinline', '');
        vid.setAttribute('preload', 'metadata');
        vid.addEventListener('mouseenter', function() { vid.play().catch(function() {}); });
        vid.addEventListener('mouseleave', function() { vid.pause(); });
        el.appendChild(vid);
      }

      // Fix: Use indexOf to find the correct index in the filtered array for Lightbox
      el.addEventListener('click', () => {
        if (window.Core && window.Core.Lightbox) {
          const actualIndex = allFiltered.indexOf(item);
          window.Core.Lightbox.open(actualIndex, allFiltered);
        }
      });

      fragment.appendChild(el);
    });

    galleryGrid.appendChild(fragment);
    this.updateLoadMoreVisibility(images.length, videos.length);
  }

  updateLoadMoreVisibility(totalImg, totalVid) {
    const moreBtnWrapper = document.getElementById('portfolio-inline-more');
    if (!moreBtnWrapper) return;

    let hasMore = false;
    if (this.activeCategory === 'cinematics' || this.activeCategory === 'video') {
      hasMore = this.visibleVideosCount < totalVid;
    } else if (this.activeCategory === 'all') {
      hasMore = false;
    } else {
      hasMore = this.visibleImagesCount < totalImg;
    }

    moreBtnWrapper.style.display = hasMore ? 'block' : 'none';
  }

  setupLoadMore() {
    const loadMoreBtn = document.getElementById('inline-load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        if (this.activeCategory === 'cinematics' || this.activeCategory === 'video') {
          const grid = document.getElementById('portfolio-inline-grid');
          if (grid) grid.innerHTML = '';
          this.appendInlineItems(0, 1);
        } else {
          this.appendInlineItems(3, 0);
        }
      });
    }
  }

  /**
   * Create a single gallery item element (for full gallery)
   */
  createGalleryItemElement(item, index, allItems) {
    const isVideo = item.type === 'video';
    const el = document.createElement('article');
    el.className = 'gallery-item ' + (isVideo ? 'gallery-item--video' : 'gallery-item--image') + ' reveal-item loading';
    el.dataset.index = index;
    el.dataset.category = item.category;
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', (item.title || 'Open preview') + (item.category ? ', ' + item.category : ''));

    el.addEventListener('click', () => {
      if (window.Core && window.Core.Lightbox) {
        window.Core.Lightbox.open(index, allItems);
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
      video.setAttribute('playsinline', '');
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
    catLabel.textContent = this.getCategoryName(item.category);

    overlay.appendChild(title);
    overlay.appendChild(catLabel);
    el.appendChild(overlay);

    return el;
  }

  /**
   * Re-run IntersectionObserver on lazy images
   */
  initLazyLoader() {
    const lazyImages = document.querySelectorAll('#gallery-grid img[data-src]');
    if (lazyImages.length === 0) return;

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
    if (!eventsGrid || !this.data || !this.data.recentEvents) return;

    eventsGrid.innerHTML = '';
    this.data.recentEvents.forEach((event) => {
      const item = document.createElement('div');
      item.className = 'event-item';
      
      const img = document.createElement('img');
      img.src = event.src;
      img.alt = event.alt || event.title;
      img.className = 'event-image';
      img.setAttribute('loading', 'lazy');
      
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
    if (!this.data || !this.data.socialProof) return;

    const publicationsContainer = document.getElementById('publications');
    if (publicationsContainer && this.data.socialProof.publications) {
      publicationsContainer.innerHTML = '';
      this.data.socialProof.publications.forEach((pub) => {
        const pubItem = document.createElement('span');
        pubItem.className = 'publication-item';
        pubItem.textContent = pub;
        publicationsContainer.appendChild(pubItem);
      });
    }

    const awardsContainer = document.getElementById('awards');
    if (awardsContainer && this.data.socialProof.awards) {
      awardsContainer.innerHTML = '';
      this.data.socialProof.awards.forEach((award) => {
        const awardItem = document.createElement('li');
        awardItem.textContent = award;
        awardsContainer.appendChild(awardItem);
      });
    }

    const clientsContainer = document.getElementById('clients');
    if (clientsContainer && this.data.socialProof.clients) {
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
    const galleryGrid = document.getElementById('gallery-grid') || document.getElementById('portfolio-inline-grid');
    if (galleryGrid) {
      galleryGrid.innerHTML = '<div class="content-error"><p>Unable to load portfolio content. Please try refreshing the page.</p></div>';
    }
  }
}

// Initialize content loader when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    window.contentLoader = new ContentLoader();
    window.contentLoader.init();
  });
} else {
  window.contentLoader = new ContentLoader();
  window.contentLoader.init();
}
