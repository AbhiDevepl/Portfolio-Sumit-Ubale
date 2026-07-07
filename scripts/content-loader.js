/**
 * Content Loader
 * Centralized logic for fetching and rendering portfolio data.
 * Optimized for performance and cross-page compatibility.
 */

class ContentLoader {
  constructor() {
    this.mediaData = {}; // category -> Array of items
    this.allShuffled = []; // For randomized 'all' display
    this.recentEvents = null;
    this.socialProof = null;

    // Pagination state for homepage
    this.activeCategory = 'all';
    this.visibleImagesCount = 0;
    this.visibleVideosCount = 0;
  }

  /**
   * Initialize content loading
   */
  async init() {
    try {
      await this.loadData();
      
      const isHomepage = !!document.getElementById('portfolio-inline-grid');
      const isGalleryPage = !!document.getElementById('gallery-grid');

      if (isHomepage) {
        this.setupHomepageListeners();
        this.renderHomepageGallery();
      }
      
      if (isGalleryPage) {
        this.renderFullGallery(this.activeCategory);
      }

      // Initialize global UI managers
      if (window.GalleryManager && typeof window.GalleryManager.init === 'function') {
        window.GalleryManager.init();
      } else if (window.GalleryManager && typeof window.GalleryManager.initFiltering === 'function') {
        window.GalleryManager.initFiltering();
        if (window.Core && window.Core.Lightbox) window.Core.Lightbox.init();
      }

      this.populateEvents();
      this.populateAbout();
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Parallel fetch and merge data sources
   */
  async loadData() {
    const urls = ['data/portfolio.json', 'data/new_portfolio.json'];

    // Parallel fetch for optimal network performance
    const responses = await Promise.all(urls.map(url =>
      fetch(url).then(res => res.ok ? res.json() : null).catch(() => null)
    ));

    const seenUrls = new Set();
    const allItems = [];

    responses.forEach(data => {
      if (!data) return;

      // Extract images object from various possible structures
      let imagesObj = null;
      if (data.portfolio && data.portfolio.images) {
        imagesObj = data.portfolio.images;
      } else if (data.images) {
        imagesObj = data.images;
      } else if (!data.recentEvents && !data.about) {
        imagesObj = data;
      }

      if (imagesObj) {
        Object.keys(imagesObj).forEach(cat => {
          if (!this.mediaData[cat]) this.mediaData[cat] = [];

          const items = imagesObj[cat];
          if (Array.isArray(items)) {
            items.forEach(item => {
              if (item && item.src && !seenUrls.has(item.src)) {
                seenUrls.add(item.src);

                const newItem = Object.assign({}, item);
                newItem.category = item.category || cat;
                newItem.type = item.type === 'video' ? 'video' : 'image';
                newItem.alt = item.alt || item.title || 'Portfolio media';
                newItem.poster = item.poster || item.thumb || '';

                this.mediaData[cat].push(newItem);
                allItems.push(newItem);
              }
            });
          }
        });
      }

      if (data.recentEvents && !this.recentEvents) this.recentEvents = data.recentEvents;
      if (data.socialProof && !this.socialProof) this.socialProof = data.socialProof;
    });

    // Create randomized 'all' pool for the homepage
    this.allShuffled = allItems.slice();
    for (let i = this.allShuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = this.allShuffled[i];
      this.allShuffled[i] = this.allShuffled[j];
      this.allShuffled[j] = temp;
    }
  }

  setupHomepageListeners() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-category');
        if (this.activeCategory !== cat) {
          this.activeCategory = cat;
          this.renderHomepageGallery();
        }
      });
    });

    const loadMoreBtn = document.getElementById('inline-load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        const isVideoOnly = (this.activeCategory === 'cinematics' || this.activeCategory === 'video');
        if (isVideoOnly) {
          const grid = document.getElementById('portfolio-inline-grid');
          if (grid) grid.innerHTML = '';
          this.appendHomepageItems(0, 1);
        } else {
          this.appendHomepageItems(3, 0);
        }
      });
    }
  }

  /**
   * Helper to get items for a category (O(1) lookup)
   */
  getItemsForCategory(category, type) {
    let source = [];
    if (category === 'all') {
      source = this.allShuffled;
    } else {
      source = this.mediaData[category] || [];
      // Support legacy key
      if (category === 'pre-wedding-photos-and-videos' && (!source.length)) {
        source = this.mediaData['perwedding'] || [];
      }
    }

    if (!type) return source;
    return source.filter(item => item.type === type);
  }

  /**
   * Renders homepage grid with pagination/cycling
   */
  renderHomepageGallery() {
    const grid = document.getElementById('portfolio-inline-grid');
    if (!grid) return;

    grid.innerHTML = '';
    this.visibleImagesCount = 0;
    this.visibleVideosCount = 0;

    const isVideoMode = (this.activeCategory === 'cinematics' || this.activeCategory === 'video');
    grid.classList.toggle('cinematics-mode', isVideoMode);

    let iAdd = 0, vAdd = 0;
    if (isVideoMode) {
      vAdd = 1;
    } else if (this.activeCategory === 'all') {
      iAdd = 3;
      vAdd = 0;
    } else {
      iAdd = 3;
      vAdd = 1;
    }
    this.appendHomepageItems(iAdd, vAdd);
  }

  appendHomepageItems(imgCount, vidCount) {
    const grid = document.getElementById('portfolio-inline-grid');
    if (!grid) return;

    const images = this.getItemsForCategory(this.activeCategory, 'image');
    const videos = this.getItemsForCategory(this.activeCategory, 'video');
    const allFiltered = [].concat(images, videos);

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
      const el = this.createMediaElement(item, allFiltered.indexOf(item), allFiltered, 'portfolio-item');
      el.style.animationDelay = (index * 60) + 'ms';
      fragment.appendChild(el);
    });

    grid.appendChild(fragment);
    this.updateLoadMoreVisibility(images.length, videos.length);
  }

  /**
   * Renders the full gallery for portfolio pages
   */
  renderFullGallery(category) {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    grid.innerHTML = '';
    const items = this.getItemsForCategory(category);

    if (items.length === 0) {
      grid.innerHTML = '<p class="no-items">No items found in this category.</p>';
      return;
    }

    const fragment = document.createDocumentFragment();
    items.forEach((item, index) => {
      fragment.appendChild(this.createMediaElement(item, index, items, 'gallery-item'));
    });

    grid.appendChild(fragment);
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  }

  /**
   * Implementation for GalleryManager's filtering
   */
  renderCategory(category) {
    this.activeCategory = category;
    if (document.getElementById('portfolio-inline-grid')) {
      this.renderHomepageGallery();
    } else if (document.getElementById('gallery-grid')) {
      this.renderFullGallery(category);
    }
  }

  /**
   * Centralized media element creation
   */
  createMediaElement(item, index, allItems, className) {
    let el;
    
    // Reuse Core factory if available for consistency
    if (window.Core && window.Core.Media && typeof window.Core.Media.createItem === 'function') {
      el = window.Core.Media.createItem(item, index, allItems);
      // Adjust class for layout compatibility
      if (className === 'portfolio-item') {
        el.className = el.className.replace('gallery-item', 'portfolio-item');
      }
      el.className += ' fade-in-up';
    } else {
      // Fallback implementation
      el = document.createElement('article');
      el.className = className + ' fade-in-up loading';
      el.dataset.type = item.type;

      const media = document.createElement(item.type === 'video' ? 'video' : 'img');
      media.src = item.src;
      media.className = 'gallery-image';

      if (item.type === 'image') {
        media.loading = 'lazy';
        media.setAttribute('decoding', 'async');
        media.alt = item.alt;
        media.onload = () => el.classList.remove('loading');
      } else {
        if (item.poster) media.poster = item.poster;
        media.muted = true;
        media.loop = true;
        media.setAttribute('playsinline', '');
        media.setAttribute('preload', 'metadata');
        el.classList.remove('loading');

        // Restore hover behavior
        el.addEventListener('mouseenter', () => media.play().catch(() => {}));
        el.addEventListener('mouseleave', () => { media.pause(); media.currentTime = 0; });
      }

      el.appendChild(media);
      el.addEventListener('click', () => {
        if (window.Core && window.Core.Lightbox) {
          window.Core.Lightbox.open(index, allItems);
        }
      });
    }

    return el;
  }

  updateLoadMoreVisibility(totalImages, totalVideos) {
    const moreBtnWrapper = document.getElementById('portfolio-inline-more');
    if (!moreBtnWrapper) return;

    const isVideoMode = (this.activeCategory === 'cinematics' || this.activeCategory === 'video');
    const hasMore = isVideoMode ? (this.visibleVideosCount < totalVideos) : (this.visibleImagesCount < totalImages);

    if (this.activeCategory === 'all') {
      moreBtnWrapper.style.display = 'none';
    } else {
      moreBtnWrapper.style.display = hasMore ? 'block' : 'none';
    }
  }

  populateEvents() {
    const grid = document.querySelector('.events-grid');
    if (!grid || !this.recentEvents) return;

    grid.innerHTML = '';
    this.recentEvents.forEach(event => {
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
      overlay.innerHTML = `<h3 class="gallery-title">${event.title}</h3><p class="gallery-category">${event.category}</p>`;
      
      item.appendChild(img);
      item.appendChild(overlay);
      grid.appendChild(item);
    });
  }

  populateAbout() {
    if (!this.socialProof) return;
    const data = this.socialProof;

    const containers = {
      'publications': 'publication-item',
      'awards': 'li',
      'clients': 'client-item'
    };

    Object.keys(containers).forEach(id => {
      const container = document.getElementById(id);
      if (container && data[id]) {
        container.innerHTML = '';
        data[id].forEach(text => {
          const el = document.createElement(id === 'awards' ? 'li' : 'span');
          if (id !== 'awards') el.className = containers[id];
          el.textContent = text;
          container.appendChild(el);
        });
      }
    });
  }

  handleError(error) {
    console.error('❌ Content loading error:', error);
    const grid = document.getElementById('portfolio-inline-grid') || document.getElementById('gallery-grid');
    if (grid) grid.innerHTML = '<p class="error-msg">Failed to load content. Please refresh.</p>';
  }
}

// Global initialization
(function() {
  const init = () => {
    window.contentLoader = new ContentLoader();
    window.contentLoader.init();
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
