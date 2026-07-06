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
    this.mediaData = {}; // Cache portfolio.images from JSON
    this.shuffledAll = []; // globally randomized items for 'all'
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
      
      // Initialize Gallery Interactions (after content is loaded)
      if (window.GalleryManager) {
        window.GalleryManager.init();
      } else {
        // Fallback for homepage if GalleryManager isn't used
        this.renderCategory('all');
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
        fetch(this.dataUrl).then(res => res.ok ? res.json() : null).catch(() => null),
        fetch(this.newDataUrl).then(res => res.ok ? res.json() : null).catch(() => null)
      ]);

      const oldData = results[0];
      const newData = results[1];

      this.data = oldData || newData; // Use for events/about info

      const portfolioData = [];
      const seenUrls = new Set();

      const integrate = (data) => {
        if (!data) return;
        const imagesObj = (data.portfolio && data.portfolio.images) || data;

        Object.keys(imagesObj).forEach(cat => {
          if (Array.isArray(imagesObj[cat])) {
            if (!this.mediaData[cat]) this.mediaData[cat] = [];

            imagesObj[cat].forEach(item => {
              if (seenUrls.has(item.src)) return;
              seenUrls.add(item.src);

              const normalized = {
                type: item.type === 'video' ? 'video' : 'image',
                category: cat,
                src: item.src,
                alt: item.alt || item.title || 'Portfolio media',
                poster: item.poster || item.thumb || '',
                title: item.title || ''
              };

              portfolioData.push(normalized);
              this.mediaData[cat].push(normalized);
            });
          }
        });
      };

      integrate(oldData);
      integrate(newData);

      // Globally randomize for 'all' view once
      for (let i = portfolioData.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = portfolioData[i];
        portfolioData[i] = portfolioData[j];
        portfolioData[j] = temp;
      }

      this.shuffledAll = portfolioData;
      return this.data;
    } catch (error) {
      throw new Error(`Failed to load portfolio data: ${error.message}`);
    }
  }

  /**
   * Helper to get category name from slug
   */
  getCategoryName(category) {
    return ContentLoader.CATEGORY_NAMES[category] || category;
  }

  /**
   * Get images for a category
   */
  getFilteredItems(category) {
    if (!this.mediaData) return [];

    if (category === 'all') {
      if (this.shuffledAll && this.shuffledAll.length > 0) {
        return this.shuffledAll;
      }
      // Fallback manual flatten
      const all = [];
      const cats = Object.keys(this.mediaData);
      for (let i = 0; i < cats.length; i++) {
        const catItems = this.mediaData[cats[i]];
        for (let j = 0; j < catItems.length; j++) {
          all.push(catItems[j]);
        }
      }
      return all;
    }

    return this.mediaData[category] || [];
  }

  /**
   * Render gallery items
   */
  renderCategory(category) {
    const grid = document.getElementById('portfolio-inline-grid');
    if (!grid) {
      this.renderFullGallery(category);
      return;
    }

    this.activeCategory = category;
    this.visibleImagesCount = 0;
    this.visibleVideosCount = 0;
    grid.innerHTML = '';

    if (category === 'cinematics' || category === 'video') {
      grid.classList.add('cinematics-mode');
    } else {
      grid.classList.remove('cinematics-mode');
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
   * Append items to grid (DocumentFragment for performance)
   */
  appendItems(imgCount, vidCount) {
    const grid = document.getElementById('portfolio-inline-grid');
    if (!grid) return;

    const allFiltered = this.getFilteredItems(this.activeCategory);
    const images = [];
    const videos = [];

    for (let i = 0; i < allFiltered.length; i++) {
      if (allFiltered[i].type === 'video') {
        videos.push(allFiltered[i]);
      } else {
        images.push(allFiltered[i]);
      }
    }

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
      this.updateLoadMoreButton(false, false);
      return;
    }

    const fragment = document.createDocumentFragment();
    toAppend.forEach((item, idx) => {
      const el = document.createElement('div');
      el.className = 'portfolio-item fade-in-up';
      el.dataset.type = item.type;
      el.style.animationDelay = (idx * 60) + 'ms';
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', (item.title || 'Open preview') + (item.category ? ', ' + item.category : ''));

      el.onclick = () => {
        if (window.Core && window.Core.Lightbox) {
          const targetIndex = allFiltered.indexOf(item);
          window.Core.Lightbox.open(targetIndex >= 0 ? targetIndex : 0, allFiltered);
        }
      };

      el.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          el.click();
        }
      };

      if (item.type === 'image') {
        const img = document.createElement('img');
        img.src = item.src;
        img.alt = item.alt || '';
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

        vid.onmouseenter = () => vid.play().catch(() => {});
        vid.onmouseleave = () => vid.pause();
        el.appendChild(vid);
      }
      fragment.appendChild(el);
    });

    grid.appendChild(fragment);

    const hasMoreImg = this.visibleImagesCount < images.length;
    const hasMoreVid = this.visibleVideosCount < videos.length;
    this.updateLoadMoreButton(hasMoreImg, hasMoreVid);
  }

  loadMore() {
    const grid = document.getElementById('portfolio-inline-grid');
    if (this.activeCategory === 'cinematics' || this.activeCategory === 'video') {
      if (grid) grid.innerHTML = '';
      this.appendItems(0, 1);
    } else {
      this.appendItems(3, 0);
    }
  }

  updateLoadMoreButton(hasMoreImg, hasMoreVid) {
    const moreBtnWrapper = document.getElementById('portfolio-inline-more');
    if (!moreBtnWrapper) return;

    let show = false;
    if (this.activeCategory === 'cinematics' || this.activeCategory === 'video') {
      show = hasMoreVid;
    } else if (this.activeCategory === 'all') {
      show = false;
    } else {
      show = hasMoreImg;
    }

    moreBtnWrapper.style.display = show ? 'block' : 'none';
  }

  /**
   * Full gallery rendering for pages/gallery.html
   */
  renderFullGallery(category) {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    const items = this.getFilteredItems(category);
    grid.innerHTML = '';

    if (items.length === 0) {
      grid.innerHTML = '<p class="no-items">No items found in this category.</p>';
      return;
    }

    const fragment = document.createDocumentFragment();
    items.forEach((item, index) => {
      if (window.Core && window.Core.Media) {
        const el = window.Core.Media.createItem(item, index, items, (cat) => this.getCategoryName(cat));
        fragment.appendChild(el);
      }
    });
    grid.appendChild(fragment);

    this.initLazyLoader();

    this.allImages = items.map((item, idx) => {
      const newItem = Object.assign({}, item);
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
      if (img.dataset.src) window.lazyImageObserver.observe(img);
    });
  }

  populateEvents() {
    const eventsGrid = document.querySelector('.events-grid');
    if (!eventsGrid || !(this.data && this.data.recentEvents)) return;

    eventsGrid.innerHTML = '';
    this.data.recentEvents.forEach(event => {
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
    const data = this.data;
    if (!data || !data.socialProof) return;

    const fill = (id, items, className) => {
      const container = document.getElementById(id);
      if (container && items) {
        container.innerHTML = '';
        items.forEach(text => {
          const el = document.createElement(className === 'li' ? 'li' : 'span');
          if (className !== 'li') el.className = className;
          el.textContent = text;
          container.appendChild(el);
        });
      }
    };

    fill('publications', data.socialProof.publications, 'publication-item');
    fill('awards', data.socialProof.awards, 'li');
    fill('clients', data.socialProof.clients, 'client-item');
  }

  handleError(error) {
    console.error('❌ Content loading error:', error);
    const grid = document.getElementById('gallery-grid') || document.getElementById('portfolio-inline-grid');
    if (grid) {
      grid.innerHTML = `<div class="content-error"><p>Unable to load content. Please refresh.</p><p class="error-details">${error.message}</p></div>`;
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.contentLoader = new ContentLoader();
    window.contentLoader.init();
  });
} else {
  window.contentLoader = new ContentLoader();
  window.contentLoader.init();
}
