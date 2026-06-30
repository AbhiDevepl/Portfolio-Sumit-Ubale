/**
 * Content Loader
 * Fetches portfolio data from JSON and dynamically populates the page
 */

class ContentLoader {
  constructor() {
    this.dataUrl = '/data/portfolio.json';
    this.newPortfolioUrl = '/data/new_portfolio.json';
    this.data = null;
    this.allImages = []; // Cache for processed items
    this.mediaData = null; // Cache portfolio.images from JSON

    // Homepage specific state
    this.homepageData = [];
    this.shuffledAll = [];
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

      const homepageGrid = document.getElementById('portfolio-inline-grid');
      if (homepageGrid) {
        this.initHomepageGallery();
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
   * Fetch JSON data
   */
  async loadData() {
    try {
      const [oldDataRes, newDataRes] = await Promise.all([
        fetch(this.dataUrl).then(res => res.ok ? res.json() : null).catch(() => null),
        fetch(this.newPortfolioUrl).then(res => res.ok ? res.json() : null).catch(() => null)
      ]);

      if (!oldDataRes && !newDataRes) {
        throw new Error('Failed to load portfolio data from all sources');
      }

      this.data = oldDataRes || newDataRes;

      // Merge media data from both sources
      this.mediaData = {};
      const integrate = (data) => {
        if (!data) return;
        const categoriesObj = (data.portfolio && data.portfolio.images) ? data.portfolio.images : data;
        Object.keys(categoriesObj).forEach(category => {
          if (Array.isArray(categoriesObj[category])) {
            if (!this.mediaData[category]) this.mediaData[category] = [];
            this.mediaData[category] = this.mediaData[category].concat(categoriesObj[category]);
          }
        });
      };

      integrate(oldDataRes);
      integrate(newDataRes);

      // Process for homepage logic
      this.homepageData = [];
      const seen = new Set();
      Object.keys(this.mediaData).forEach(category => {
        this.mediaData[category].forEach(item => {
          if (!seen.has(item.src)) {
            seen.add(item.src);
            this.homepageData.push({
              type: item.type === 'video' ? 'video' : 'image',
              category: category,
              src: item.src,
              alt: item.alt || item.title || 'Portfolio media',
              poster: item.poster || item.thumb || ''
            });
          }
        });
      });

      // Prepare shuffled version for 'all'
      this.shuffledAll = this.homepageData.slice();
      for (let i = this.shuffledAll.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = this.shuffledAll[i];
        this.shuffledAll[i] = this.shuffledAll[j];
        this.shuffledAll[j] = temp;
      }

      return this.data;
    } catch (error) {
      throw new Error(`Failed to load portfolio data: ${error.message}`);
    }
  }

  /**
   * Homepage Gallery Initialization
   */
  initHomepageGallery() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const loadMoreBtn = document.getElementById('inline-load-more-btn');

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
          this.renderHomepageInitial();
        }
      });
    });

    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        if (this.activeCategory === 'cinematics') {
          const grid = document.getElementById('portfolio-inline-grid');
          if (grid) grid.innerHTML = '';
          this.appendHomepageItems(0, 1);
        } else {
          this.appendHomepageItems(3, 0);
        }
      });
    }

    this.renderHomepageInitial();
  }

  renderHomepageInitial() {
    const grid = document.getElementById('portfolio-inline-grid');
    if (!grid) return;

    grid.innerHTML = '';
    this.visibleImagesCount = 0;
    this.visibleVideosCount = 0;

    if (this.activeCategory === 'cinematics') {
      grid.classList.add('cinematics-mode');
    } else {
      grid.classList.remove('cinematics-mode');
    }

    let iAdd = 0, vAdd = 0;
    if (this.activeCategory === 'cinematics') {
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

  getHomepageFilteredItems(type) {
    const source = this.activeCategory === 'all' ? this.shuffledAll : this.homepageData;
    return source.filter(item =>
      (this.activeCategory === 'all' || item.category === this.activeCategory) && item.type === type
    );
  }

  appendHomepageItems(imgCount, vidCount) {
    const grid = document.getElementById('portfolio-inline-grid');
    const moreBtnWrapper = document.getElementById('portfolio-inline-more');
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
      el.style.animationDelay = (idx * 60) + 'ms';

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
        vid.addEventListener('mouseenter', function() { vid.play().catch(function() {}); });
        vid.addEventListener('mouseleave', function() { vid.pause(); });
        el.appendChild(vid);
      }

      frag.appendChild(el);
    });

    grid.appendChild(frag);

    if (moreBtnWrapper) {
      const moreImg = this.visibleImagesCount < images.length;
      const moreVid = this.visibleVideosCount < videos.length;

      if (this.activeCategory === 'cinematics') {
        moreBtnWrapper.style.display = moreVid ? 'block' : 'none';
      } else if (this.activeCategory === 'all') {
        moreBtnWrapper.style.display = 'none';
      } else {
        moreBtnWrapper.style.display = moreImg ? 'block' : 'none';
      }
    }
  }

  /**
   * Populate gallery grid with images (Full Gallery Page)
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
    if (!this.mediaData) return [];

    if (category === 'all') {
      const allItems = [];
      const keys = Object.keys(this.mediaData);
      for (let i = 0; i < keys.length; i++) {
        const catItems = this.mediaData[keys[i]];
        if (Array.isArray(catItems)) {
          for (let j = 0; j < catItems.length; j++) {
            allItems.push(catItems[j]);
          }
        }
      }
      return allItems;
    }

    return this.mediaData[category] || [];
  }

  /**
   * Render gallery items for a category
   */
  renderCategory(category) {
    let galleryGrid = document.getElementById('gallery-grid');
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
      el.className = 'gallery-item ' + (isVideo ? 'gallery-item--video' : 'gallery-item--image') + ' reveal-item loading';
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

    this.allImages = items.map((item, idx) => {
        const newItem = {};
        for (const key in item) newItem[key] = item[key];
        newItem.originalIndex = idx;
        return newItem;
    });
    if (window.GalleryManager) {
      window.GalleryManager.allImages = this.allImages;
    }
  }

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

  populateEvents() {
    const eventsGrid = document.querySelector('.events-grid');
    
    if (!eventsGrid || !this.data || !this.data.recentEvents) {
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

  populateAbout() {
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

    const awardsContainer = document.getElementById('awards');
    if (awardsContainer && this.data && this.data.socialProof && this.data.socialProof.awards) {
      awardsContainer.innerHTML = '';
      this.data.socialProof.awards.forEach(award => {
        const awardItem = document.createElement('li');
        awardItem.textContent = award;
        awardsContainer.appendChild(awardItem);
      });
    }

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
  'cinematics': 'Cinematics',
  'perwedding': 'Pre-Wedding'
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.contentLoader = new ContentLoader();
    window.contentLoader.init();
  });
} else {
  window.contentLoader = new ContentLoader();
  window.contentLoader.init();
}
