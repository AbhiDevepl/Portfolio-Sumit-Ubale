/**
 * Content Loader
 * Fetches portfolio data and populates home page sections
 */

class ContentLoader {
  constructor() {
    this.dataUrl = '/data/portfolio.json';
    this.data = null;
    this.portfolioData = [];
    this.visibleImagesCount = 0;
    this.visibleVideosCount = 0;
    this.activeCategory = 'all';
  }

  /**
   * Initialize loading
   */
  async init() {
    try {
      await this.loadData();
      
      const grid = document.getElementById('portfolio-inline-grid');
      if (grid) {
        this.initFiltering();
        this.initLoadMore();
        this.renderInitial();
      }
      
      this.populateEvents();
      this.populateAbout();
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Fetch and process data
   */
  async loadData() {
    const response = await fetch(this.dataUrl);
    if (!response.ok) {
      throw new Error('HTTP error! status: ' + response.status);
    }
    this.data = await response.json();

    const images = (this.data.portfolio && this.data.portfolio.images) ? this.data.portfolio.images : {};
    const temp = [];
    const seen = new Set();

    Object.keys(images).forEach((category) => {
      if (Array.isArray(images[category])) {
        images[category].forEach((item) => {
          if (!seen.has(item.src)) {
            seen.add(item.src);
            temp.push({
              type: item.type === 'video' ? 'video' : 'image',
              category: category,
              src: item.src,
              alt: item.alt || item.title || 'Portfolio media',
              poster: item.poster || item.thumb || '',
              title: item.title || ''
            });
          }
        });
      }
    });

    // Fisher-Yates Randomization
    for (let i = temp.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const holder = temp[i];
      temp[i] = temp[j];
      temp[j] = holder;
    }

    this.portfolioData = temp;
  }

  /**
   * Bind filter buttons
   */
  initFiltering() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        categoryBtns.forEach((b) => {
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
  }

  /**
   * Bind load more button
   */
  initLoadMore() {
    const loadMoreBtn = document.getElementById('inline-load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        if (this.activeCategory === 'cinematics') {
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
   * Get items filtered by type and active category
   */
  getFilteredItems(type) {
    return this.portfolioData.filter((item) => {
      const matchCategory = this.activeCategory === 'all' || item.category === this.activeCategory;
      return matchCategory && item.type === type;
    });
  }

  /**
   * Append items to grid
   */
  appendItems(imgCount, vidCount) {
    const grid = document.getElementById('portfolio-inline-grid');
    if (!grid) return;

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

    if (toAppend.length === 0) {
      this.updateLoadMoreVisibility(images.length, videos.length);
      return;
    }

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
        el.appendChild(img);
      } else {
        const vid = document.createElement('video');
        vid.src = item.src;
        if (item.poster) vid.poster = item.poster;
        vid.muted = true;
        vid.loop = true;
        vid.setAttribute('playsinline', '');
        vid.preload = 'metadata';

        vid.addEventListener('mouseenter', () => {
          const promise = vid.play();
          if (promise !== undefined) {
            promise.catch(() => {});
          }
        });
        vid.addEventListener('mouseleave', () => vid.pause());
        el.appendChild(vid);
      }

      frag.appendChild(el);
    });

    grid.appendChild(frag);
    this.updateLoadMoreVisibility(images.length, videos.length);
  }

  /**
   * Show/hide load more based on remaining items
   */
  updateLoadMoreVisibility(totalImages, totalVideos) {
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
   * Reset grid and render first batch
   */
  renderInitial() {
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

    let iAdd = 0;
    let vAdd = 0;

    if (this.activeCategory === 'cinematics') {
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
   * Compatibility alias for GalleryManager
   */
  renderCategory(category) {
    this.activeCategory = category;
    this.renderInitial();
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
   * Populate about section proof
   */
  populateAbout() {
    if (!this.data || !this.data.socialProof) return;
    const proof = this.data.socialProof;

    const publicationsContainer = document.getElementById('publications');
    if (publicationsContainer && proof.publications) {
      publicationsContainer.innerHTML = '';
      proof.publications.forEach((pub) => {
        const pubItem = document.createElement('span');
        pubItem.className = 'publication-item';
        pubItem.textContent = pub;
        publicationsContainer.appendChild(pubItem);
      });
    }

    const awardsContainer = document.getElementById('awards');
    if (awardsContainer && proof.awards) {
      awardsContainer.innerHTML = '';
      proof.awards.forEach((award) => {
        const awardItem = document.createElement('li');
        awardItem.textContent = award;
        awardsContainer.appendChild(awardItem);
      });
    }

    const clientsContainer = document.getElementById('clients');
    if (clientsContainer && proof.clients) {
      clientsContainer.innerHTML = '';
      proof.clients.forEach((client) => {
        const clientItem = document.createElement('span');
        clientItem.className = 'client-item';
        clientItem.textContent = client;
        clientsContainer.appendChild(clientItem);
      });
    }
  }

  /**
   * Generic error handler
   */
  handleError(error) {
    console.error('❌ Content loading error:', error);
    const grid = document.getElementById('portfolio-inline-grid');
    if (grid) {
      grid.innerHTML = '<p class="content-error">Unable to load content. Please try again later.</p>';
    }
  }
}

// Global initialization
(function() {
  const loader = new ContentLoader();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      loader.init();
    });
  } else {
    loader.init();
  }
  window.contentLoader = loader;
})();
