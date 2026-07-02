/**
 * Content Loader
 * Fetches portfolio data from JSON and dynamically populates the page
 */

class ContentLoader {
  constructor() {
    this.dataUrl = '/data/portfolio.json';
    this.newDataUrl = '/data/new_portfolio.json';
    this.data = null;
    this.allImages = []; // Cache for processed items
    this.mediaData = null; // Cache portfolio.images from JSON
    this.shuffledAll = []; // For homepage randomization consistency
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

      const inlineGrid = document.getElementById('portfolio-inline-grid');
      if (inlineGrid) {
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
   * Fetch JSON data from multiple sources and merge
   */
  async loadData() {
    try {
      const results = await Promise.all([
        fetch(this.dataUrl).then(res => (res.ok ? res.json() : null)).catch(() => null),
        fetch(this.newDataUrl).then(res => (res.ok ? res.json() : null)).catch(() => null)
      ]);

      const oldData = results[0];
      const newData = results[1];

      if (!oldData && !newData) {
        throw new Error('Failed to load portfolio data from all sources');
      }

      this.data = oldData || newData;
      this.mediaData = {};
      const seenSrcs = {};

      const integrate = (data) => {
        if (!data) return;
        const images = (data.portfolio && data.portfolio.images) || data;
        const categories = Object.keys(images);
        for (let i = 0; i < categories.length; i++) {
          const category = categories[i];
          if (Array.isArray(images[category])) {
            if (!this.mediaData[category]) {
              this.mediaData[category] = [];
            }
            const categoryItems = images[category];
            for (let j = 0; j < categoryItems.length; j++) {
              const item = categoryItems[j];
              // Global deduplication by src
              if (!seenSrcs[item.src]) {
                seenSrcs[item.src] = true;
                const normalizedItem = Object.assign({}, item);
                normalizedItem.category = category;
                normalizedItem.type = item.type === 'video' ? 'video' : 'image';
                this.mediaData[category].push(normalizedItem);
              }
            }
          }
        }
      };

      integrate(oldData);
      integrate(newData);

      return this.data;
    } catch (error) {
      throw new Error('Failed to load portfolio data: ' + error.message);
    }
  }

  /**
   * Homepage Gallery Setup
   */
  setupHomepageGallery() {
    // Flatten and shuffle for 'all' view
    const allItems = [];
    const categories = Object.keys(this.mediaData);
    for (let i = 0; i < categories.length; i++) {
      const catItems = this.mediaData[categories[i]];
      for (let j = 0; j < catItems.length; j++) {
        allItems.push(catItems[j]);
      }
    }

    // Randomize
    for (let k = allItems.length - 1; k > 0; k--) {
      const l = Math.floor(Math.random() * (k + 1));
      const temp = allItems[k];
      allItems[k] = allItems[l];
      allItems[l] = temp;
    }
    this.shuffledAll = allItems;

    const loadMoreBtn = document.getElementById('inline-load-more-btn');
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
    this.appendHomepageItems(iAdd, vAdd);
  }

  appendHomepageItems(imgCount, vidCount) {
    const grid = document.getElementById('portfolio-inline-grid');
    const moreBtnWrapper = document.getElementById('portfolio-inline-more');
    if (!grid) return;

    const items = this.activeCategory === 'all' ? this.shuffledAll : (this.mediaData[this.activeCategory] || []);
    const images = [];
    const videos = [];
    for (let i = 0; i < items.length; i++) {
        if (items[i].type === 'video') {
            videos.push(items[i]);
        } else {
            images.push(items[i]);
        }
    }

    const toAppend = [];
    for (let j = 0; j < imgCount; j++) {
      if (this.visibleImagesCount < images.length) {
        toAppend.push(images[this.visibleImagesCount]);
        this.visibleImagesCount++;
      }
    }
    for (let k = 0; k < vidCount; k++) {
      if (this.visibleVideosCount < videos.length) {
        toAppend.push(videos[this.visibleVideosCount]);
        this.visibleVideosCount++;
      }
    }

    if (toAppend.length === 0) return;

    const frag = document.createDocumentFragment();
    for (let l = 0; l < toAppend.length; l++) {
      const item = toAppend[l];
      const idx = l;
      const el = document.createElement('div');
      el.className = 'portfolio-item fade-in-up';
      el.dataset.type = item.type;
      el.style.animationDelay = (idx * 60) + 'ms';

      // Click handler for lightbox on homepage
      el.addEventListener('click', () => {
        if (window.Core && window.Core.Lightbox) {
          const allFiltered = this.activeCategory === 'all' ? this.shuffledAll : items;
          const indexInSource = allFiltered.indexOf(item);
          window.Core.Lightbox.open(indexInSource, allFiltered);
        }
      });

      if (item.type === 'image') {
        const img = document.createElement('img');
        img.src = item.src;
        img.alt = item.alt || item.title || 'Portfolio image';
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
        vid.addEventListener('mouseenter', () => { vid.play().catch(() => {}); });
        vid.addEventListener('mouseleave', () => { vid.pause(); });
        el.appendChild(vid);
      }
      frag.appendChild(el);
    }

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
   * Populate gallery grid with images (Full Portfolio Page)
   */
  populateGallery() {
    this.renderCategory('all');
  }

  getCategoryName(category) {
    return ContentLoader.CATEGORY_NAMES[category] || category;
  }

  getFilteredItems(category) {
    if (!this.mediaData) return [];
    if (category === 'all') {
      const all = [];
      const categories = Object.keys(this.mediaData);
      for (let i = 0; i < categories.length; i++) {
        const catItems = this.mediaData[categories[i]];
        for (let j = 0; j < catItems.length; j++) {
          all.push(catItems[j]);
        }
      }
      return all;
    }
    return this.mediaData[category] || [];
  }

  renderCategory(category) {
    const inlineGrid = document.getElementById('portfolio-inline-grid');
    if (inlineGrid) {
        this.activeCategory = category;
        this.renderHomepageInitial();
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
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const index = i;
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
          let itemIndex = -1;
          for (let j = 0; j < visibleItems.length; j++) {
            if (visibleItems[j].originalIndex === index) {
              itemIndex = j;
              break;
            }
          }
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
          img.dataset.src = item.src; // Lazy load
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
    }

    galleryGrid.appendChild(fragment);
    this.initLazyLoader();
    this.allImages = [];
    for (let k = 0; k < items.length; k++) {
        const newItem = Object.assign({}, items[k]);
        newItem.originalIndex = k;
        this.allImages.push(newItem);
    }
    if (window.GalleryManager) {
      window.GalleryManager.allImages = this.allImages;
    }
  }

  initLazyLoader() {
    if (!window.lazyImageObserver) {
      window.lazyImageObserver = new IntersectionObserver((entries) => {
        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i];
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            window.lazyImageObserver.unobserve(img);
          }
        }
      }, { rootMargin: '200px' });
    }

    const lazyImages = document.querySelectorAll('#gallery-grid img[data-src]');
    for (let i = 0; i < lazyImages.length; i++) {
      if (lazyImages[i].dataset.src) {
        window.lazyImageObserver.observe(lazyImages[i]);
      }
    }
  }

  populateEvents() {
    const eventsGrid = document.querySelector('.events-grid');
    if (!eventsGrid || !this.data || !this.data.recentEvents) {
      return;
    }

    eventsGrid.innerHTML = '';
    const events = this.data.recentEvents;
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
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
    }
  }

  populateAbout() {
    if (this.data && this.data.socialProof) {
        const publicationsContainer = document.getElementById('publications');
        if (publicationsContainer && this.data.socialProof.publications) {
          publicationsContainer.innerHTML = '';
          const pubs = this.data.socialProof.publications;
          for (let i = 0; i < pubs.length; i++) {
            const pubItem = document.createElement('span');
            pubItem.className = 'publication-item';
            pubItem.textContent = pubs[i];
            publicationsContainer.appendChild(pubItem);
          }
        }

        const awardsContainer = document.getElementById('awards');
        if (awardsContainer && this.data.socialProof.awards) {
          awardsContainer.innerHTML = '';
          const awards = this.data.socialProof.awards;
          for (let j = 0; j < awards.length; j++) {
            const awardItem = document.createElement('li');
            awardItem.textContent = awards[j];
            awardsContainer.appendChild(awardItem);
          }
        }

        const clientsContainer = document.getElementById('clients');
        if (clientsContainer && this.data.socialProof.clients) {
          clientsContainer.innerHTML = '';
          const clients = this.data.socialProof.clients;
          for (let k = 0; k < clients.length; k++) {
            const clientItem = document.createElement('span');
            clientItem.className = 'client-item';
            clientItem.textContent = clients[k];
            clientsContainer.appendChild(clientItem);
          }
        }
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
  'perwedding': 'Pre-Wedding',
  'cinematics': 'Cinematics'
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
