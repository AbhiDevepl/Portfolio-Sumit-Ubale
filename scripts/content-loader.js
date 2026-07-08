/**
 * Content Loader
 * Fetches portfolio data from JSON and dynamically populates the page.
 * Optimized to prevent redundant fetches and handle homepage pagination.
 */

class ContentLoader {
  constructor() {
    this.dataUrls = ['data/portfolio.json', 'data/new_portfolio.json'];
    this.mediaData = {}; // Grouped by category
    this.allWork = []; // Flattened and randomized list for "All" view

    // Pagination and state tracking
    this.activeCategory = 'all';
    this.visibleImagesCount = 0;
    this.visibleVideosCount = 0;
    this.shuffledAll = []; // Persistent shuffle for 'all' category

    // Cache for DOM elements
    this.grid = document.getElementById('portfolio-inline-grid') || document.getElementById('gallery-grid');
    this.moreBtnWrapper = document.getElementById('portfolio-inline-more');
    this.loadMoreBtn = document.getElementById('inline-load-more-btn');
    this.categoryBtns = document.querySelectorAll('.category-btn');
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
      'perwedding': 'Pre-Wedding',
      'pre-wedding-photos-and-videos': 'Pre-Wedding',
      'cinematics': 'Cinematics',
      'video': 'Cinematics'
    };
  }

  /**
   * Initialize content loading
   */
  async init() {
    if (!this.grid) return;

    // Safety check for Core dependencies
    if (!(window.Core && window.Core.Media)) {
      console.warn('Bolt: Core engine not found. Retrying in 100ms...');
      setTimeout(() => this.init(), 100);
      return;
    }

    try {
      await this.loadData();
      this.setupListeners();
      this.renderInitial();
      
      // Secondary initializations
      if (window.GalleryManager && typeof window.GalleryManager.init === 'function') {
        window.GalleryManager.init();
      }
      this.populateEvents();
      this.populateAbout();
    } catch (error) {
      console.error('ContentLoader init error:', error);
    }
  }

  /**
   * Fetch and merge JSON data sources
   */
  async loadData() {
    const fetchPromises = this.dataUrls.map(url =>
      fetch(url).then(res => res.ok ? res.json() : null).catch(() => null)
    );

    const datasets = await Promise.all(fetchPromises);
    const seenUrls = new Set();
    const tempAllWork = [];

    datasets.forEach(data => {
      if (!data) return;

      // Handle different JSON structures (legacy portfolio vs flat object)
      const imagesObj = (data.portfolio && data.portfolio.images) ? data.portfolio.images : data;
      if (!imagesObj) return;

      Object.keys(imagesObj).forEach(category => {
        if (!Array.isArray(imagesObj[category])) return;

        if (!this.mediaData[category]) this.mediaData[category] = [];

        imagesObj[category].forEach(item => {
          if (seenUrls.has(item.src)) return;
          seenUrls.add(item.src);

          const processedItem = Object.assign({}, item, {
            category: category,
            type: item.type === 'video' ? 'video' : 'image',
            title: item.title || item.alt || 'Portfolio Media',
            alt: item.alt || item.title || 'Portfolio Photography'
          });

          this.mediaData[category].push(processedItem);
          tempAllWork.push(processedItem);
        });
      });

      // Cache secondary data if present
      if (data.recentEvents) this.recentEvents = data.recentEvents;
      if (data.socialProof) this.socialProof = data.socialProof;
      if (data.about) this.aboutData = data.about;
    });

    this.allWork = tempAllWork;
    this.shuffledAll = this.shuffleArray(Object.assign([], this.allWork));

    // Compatibility alias and data source for Lightbox
    window.GalleryManager = {
      renderCategory: (cat) => this.renderCategory(cat),
      getVisibleData: () => {
        if (this.activeCategory === 'all') return this.shuffledAll;
        const imgs = this.getFilteredItems('image');
        const vids = this.getFilteredItems('video');
        return [].concat(imgs, vids);
      }
    };
  }

  /**
   * Utility to shuffle an array
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

  getCategoryName(slug) {
    return ContentLoader.CATEGORY_NAMES[slug] || slug;
  }

  /**
   * Get items filtered by category and type
   */
  getFilteredItems(type) {
    const list = this.activeCategory === 'all' ? this.shuffledAll : (this.mediaData[this.activeCategory] || []);
    return list.filter(item => {
      // Legacy category mapping
      if (this.activeCategory === 'pre-wedding-photos-and-videos' && item.category === 'perwedding') return item.type === type;
      return item.type === type;
    });
  }

  /**
   * Append a batch of items to the grid
   */
  appendItems(imgCount, vidCount) {
    const images = this.getFilteredItems('image');
    const videos = this.getFilteredItems('video');
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
    const allFiltered = [].concat(images, videos);

    toAppend.forEach((item, index) => {
      // Use optimized Media Factory from Core
      const el = window.Core.Media.createItem(item, allFiltered.indexOf(item), allFiltered, this.getCategoryName.bind(this));

      // Ensure aspect ratio attributes for CSS
      el.dataset.type = item.type;
      el.classList.add('portfolio-item');
      el.classList.add('fade-in-up');

      // Restore staggered entrance animation
      el.style.animationDelay = `${index * 100}ms`;

      fragment.appendChild(el);
    });

    this.grid.appendChild(fragment);
    this.updateMoreButton(images.length, videos.length);

    // Re-init lazy loading and video observers
    if (window.Core && window.Core.VideoObserver) {
      this.grid.querySelectorAll('video').forEach(v => window.Core.VideoObserver.observe(v));
    }
  }

  updateMoreButton(totalImages, totalVideos) {
    if (!this.moreBtnWrapper) return;

    const hasMoreImg = this.visibleImagesCount < totalImages;
    const hasMoreVid = this.visibleVideosCount < totalVideos;
    const isCinematics = this.activeCategory === 'cinematics' || this.activeCategory === 'video';

    if (isCinematics) {
      this.moreBtnWrapper.style.display = hasMoreVid ? 'block' : 'none';
    } else if (this.activeCategory === 'all') {
      this.moreBtnWrapper.style.display = 'none';
    } else {
      this.moreBtnWrapper.style.display = hasMoreImg ? 'block' : 'none';
    }
  }

  /**
   * Render gallery items for a category (compat alias for GalleryManager)
   */
  renderCategory(category) {
    if (category) this.activeCategory = category;
    this.renderInitial();
  }

  /**
   * Initial render for a category
   */
  renderInitial() {
    if (!this.grid) return;
    this.grid.innerHTML = '';
    this.visibleImagesCount = 0;
    this.visibleVideosCount = 0;

    const isCinematics = this.activeCategory === 'cinematics' || this.activeCategory === 'video';

    if (isCinematics) {
      this.grid.classList.add('cinematics-mode');
      this.appendItems(0, 1);
    } else {
      this.grid.classList.remove('cinematics-mode');
      // Homepage specific initial counts
      const iAdd = 3;
      const vAdd = this.activeCategory === 'all' ? 0 : 1;
      this.appendItems(iAdd, vAdd);
    }
  }

  setupListeners() {
    // Category filtering
    this.categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const newCategory = btn.getAttribute('data-category');
        if (this.activeCategory === newCategory) return;

        this.categoryBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        this.activeCategory = newCategory;
        this.renderInitial();
      });
    });

    // Load More action
    if (this.loadMoreBtn) {
      this.loadMoreBtn.addEventListener('click', () => {
        const isCinematics = this.activeCategory === 'cinematics' || this.activeCategory === 'video';
        if (isCinematics) {
          this.grid.innerHTML = '';
          this.appendItems(0, 1);
        } else {
          this.appendItems(3, 0);
        }
      });
    }
  }

  /**
   * Populate events section
   */
  populateEvents() {
    const eventsGrid = document.querySelector('.events-grid');
    if (!eventsGrid || !this.recentEvents) return;

    eventsGrid.innerHTML = '';
    const fragment = document.createDocumentFragment();

    this.recentEvents.forEach((event, index) => {
      const item = document.createElement('div');
      item.className = 'event-item fade-in-up';
      item.style.animationDelay = `${index * 100}ms`;
      
      const img = document.createElement('img');
      img.src = event.src;
      img.alt = event.alt || event.title;
      img.className = 'event-image';
      img.loading = 'lazy';
      img.decoding = 'async';
      
      if (event.aspectRatio) img.style.aspectRatio = event.aspectRatio;
      
      const overlay = document.createElement('div');
      overlay.className = 'gallery-overlay';
      overlay.innerHTML = `<h3 class="gallery-title">${event.title}</h3><p class="gallery-category">${event.category}</p>`;
      
      item.appendChild(img);
      item.appendChild(overlay);
      fragment.appendChild(item);
    });

    eventsGrid.appendChild(fragment);
  }

  /**
   * Populate about section with social proof
   */
  populateAbout() {
    if (!this.socialProof) return;

    const populate = (id, data) => {
      const container = document.getElementById(id);
      if (container && data) {
        container.innerHTML = '';
        data.forEach(text => {
          const el = document.createElement(id === 'awards' ? 'li' : 'span');
          el.className = id.slice(0, -1) + '-item';
          el.textContent = text;
          container.appendChild(el);
        });
      }
    };

    populate('publications', this.socialProof.publications);
    populate('awards', this.socialProof.awards);
    populate('clients', this.socialProof.clients);
  }
}

// Auto-initialize
window.addEventListener('DOMContentLoaded', () => {
  window.contentLoader = new ContentLoader();
  window.contentLoader.init();
});
