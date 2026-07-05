/**
 * Content Loader
 * Consolidated source for homepage and full gallery data fetching.
 * Optimized for performance and CI compatibility.
 */

class ContentLoader {
  constructor() {
    this.dataUrl = 'data/portfolio.json';
    this.newDataUrl = 'data/new_portfolio.json';
    this.mediaData = {};
    this.allShuffledItems = [];
    this.visibleCount = 0;
    this.itemsPerBatch = 6;
    this.activeCategory = 'all';

    // DOM Elements
    this.grid = document.getElementById('portfolio-inline-grid') || document.getElementById('gallery-grid');
    this.loadMoreBtn = document.getElementById('inline-load-more-btn');
    this.loadMoreWrapper = document.getElementById('portfolio-inline-more');
  }

  async init() {
    try {
      const data = await this.loadAllData();
      this.processMedia(data);
      this.setupListeners();

      // Secondary content from primary source (portfolio.json)
      const primaryData = data[0] || {};
      this.populateEvents(primaryData);
      this.populateAbout(primaryData);
      
      // Initial render
      this.renderInitial();

      // Initialize Gallery Interaction system if present
      if (window.GalleryManager && window.GalleryManager.init) {
        window.GalleryManager.init();
      }
    } catch (error) {
      console.error('ContentLoader init error:', error);
    }
  }

  /**
   * Fetch all portfolio data sources
   */
  async loadAllData() {
    const fetchJson = async (url) => {
      try {
        const res = await fetch(url);
        if (!res.ok) return null;
        return await res.json();
      } catch (e) {
        return null;
      }
    };

    return Promise.all([
      fetchJson(this.dataUrl),
      fetchJson(this.newDataUrl)
    ]);
  }

  /**
   * Process and deduplicate media items
   */
  processMedia(dataSources) {
    const seen = new Set();
    const media = {};

    for (let i = 0; i < dataSources.length; i++) {
      const data = dataSources[i];
      if (!data) continue;

      let target = null;
      if (data.portfolio && data.portfolio.images) {
          target = data.portfolio.images;
      } else if (data.images) {
          target = data.images;
      } else {
          target = data;
      }

      if (!target) continue;

      const categories = Object.keys(target);
      for (let k = 0; k < categories.length; k++) {
        const cat = categories[k];
        const items = target[cat];
        if (!Array.isArray(items)) continue;

        if (!media[cat]) media[cat] = [];

        for (let j = 0; j < items.length; j++) {
          const item = items[j];
          if (!item.src || seen.has(item.src)) continue;
          seen.add(item.src);

          media[cat].push({
            type: item.type === 'video' ? 'video' : 'image',
            category: cat,
            src: item.src,
            alt: item.alt || item.title || 'Portfolio media',
            title: item.title || '',
            poster: item.poster || item.thumb || ''
          });
        }
      }
    }

    this.mediaData = media;

    // Create shuffled "all" list for homepage variety
    const all = [];
    const cats = Object.keys(media);
    for (let x = 0; x < cats.length; x++) {
      const c = cats[x];
      const items = media[c];
      for (let y = 0; y < items.length; y++) {
        all.push(items[y]);
      }
    }

    // Fisher-Yates shuffle
    for (let l = all.length - 1; l > 0; l--) {
      const m = Math.floor(Math.random() * (l + 1));
      const temp = all[l];
      all[l] = all[m];
      all[m] = temp;
    }
    this.allShuffledItems = all;

    // Export for Lightbox compatibility
    this.allImages = all;
  }

  setupListeners() {
    if (this.loadMoreBtn) {
      this.loadMoreBtn.onclick = () => this.loadMore();
    }

    // Handle category buttons on homepage
    const categoryBtns = document.querySelectorAll('.category-btn');
    const self = this;
    for (let i = 0; i < categoryBtns.length; i++) {
        categoryBtns[i].onclick = function(e) {
            const cat = this.getAttribute('data-category');

            // Update active state
            for (let j = 0; j < categoryBtns.length; j++) {
                categoryBtns[j].classList.remove('active');
                categoryBtns[j].setAttribute('aria-selected', 'false');
            }
            this.classList.add('active');
            this.setAttribute('aria-selected', 'true');

            self.renderCategory(cat);
        };
    }
  }

  /**
   * Compatibility method for GalleryManager
   */
  renderCategory(category) {
    if (this.activeCategory === category) return;
    this.activeCategory = category;
    this.visibleCount = 0;
    if (this.grid) this.grid.innerHTML = '';
    this.renderInitial();
  }

  getFilteredItems() {
    if (this.activeCategory === 'all') {
      return this.allShuffledItems;
    }
    return this.mediaData[this.activeCategory] || [];
  }

  renderInitial() {
    if (!this.grid) return;

    const isHomepage = this.grid.id === 'portfolio-inline-grid';
    const isCinematic = this.activeCategory === 'cinematics' || this.activeCategory === 'video';

    if (isHomepage) {
      if (isCinematic) {
        this.grid.classList.add('cinematics-mode');
      } else {
        this.grid.classList.remove('cinematics-mode');
      }
    }

    this.loadMore();
  }

  loadMore() {
    const items = this.getFilteredItems();
    if (items.length === 0 && this.grid) {
        this.grid.innerHTML = '<p class="no-items">No items found.</p>';
        if (this.loadMoreWrapper) this.loadMoreWrapper.style.display = 'none';
        return;
    }

    const isHomepage = this.grid && this.grid.id === 'portfolio-inline-grid';
    const isCinematic = isHomepage && (this.activeCategory === 'cinematics' || this.activeCategory === 'video');

    // Homepage starts small for LCP; Batching for others
    const batchSize = isCinematic ? 1 : (this.visibleCount === 0 && isHomepage ? 4 : this.itemsPerBatch);

    if (isCinematic && this.visibleCount > 0) {
        this.grid.innerHTML = '';
    }

    const frag = document.createDocumentFragment();
    const end = Math.min(this.visibleCount + batchSize, items.length);

    for (let i = this.visibleCount; i < end; i++) {
      const item = items[i];
      const el = this.createMediaElement(item, i);
      frag.appendChild(el);
    }

    if (this.grid) this.grid.appendChild(frag);
    this.visibleCount = end;

    if (this.loadMoreWrapper) {
      this.loadMoreWrapper.style.display = this.visibleCount < items.length ? 'block' : 'none';
    }
  }

  createMediaElement(item, index) {
    const isHomepage = this.grid && this.grid.id === 'portfolio-inline-grid';
    const el = document.createElement(isHomepage ? 'div' : 'article');

    let className = isHomepage ? 'portfolio-item fade-in-up' : 'gallery-item reveal-item loading';
    if (!isHomepage) {
        className += (item.type === 'video' ? ' gallery-item--video' : ' gallery-item--image');
    }
    el.className = className;

    if (isHomepage) {
        el.dataset.type = item.type;
        el.style.animationDelay = (index % this.itemsPerBatch) * 60 + 'ms';
        el.setAttribute('aria-label', 'View ' + (item.title || item.alt || 'portfolio item'));
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');
        el.onkeydown = function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        };
    } else {
        el.dataset.index = index;
        el.dataset.category = item.category;
        el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'button');
        el.setAttribute('aria-label', (item.title || item.alt || 'Portfolio item') + (item.type === 'video' ? ' (video)' : ''));
    }

    if (item.type === 'video') {
      const vid = document.createElement('video');
      vid.src = item.src;
      if (item.poster) vid.poster = item.poster;
      vid.muted = true;
      vid.loop = true;
      vid.setAttribute('playsinline', '');
      vid.preload = 'metadata';

      if (isHomepage) {
          vid.onmouseenter = function() { vid.play().catch(function() {}); };
          vid.onmouseleave = function() { vid.pause(); };
      }
      el.appendChild(vid);
    } else {
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.alt;
      img.loading = 'lazy';
      img.decoding = 'async';
      if (!isHomepage) img.className = 'gallery-image';
      el.appendChild(img);
    }

    if (!isHomepage) {
      const overlay = document.createElement('div');
      overlay.className = 'gallery-overlay';

      const title = document.createElement('h3');
      title.className = 'gallery-title';
      title.textContent = item.title || '';

      const catLabel = document.createElement('p');
      catLabel.className = 'gallery-category';
      catLabel.textContent = ContentLoader.CATEGORY_NAMES[item.category] || item.category;

      overlay.appendChild(title);
      overlay.appendChild(catLabel);
      el.appendChild(overlay);

      el.onclick = () => {
          if (window.Core && window.Core.Lightbox) {
              window.Core.Lightbox.open(index, this.getFilteredItems());
          }
      };
    } else {
      // Lightbox for homepage
      el.onclick = () => {
          if (window.Core && window.Core.Lightbox) {
              const items = this.getFilteredItems();
              const idx = items.indexOf(item);
              window.Core.Lightbox.open(idx >= 0 ? idx : index, items);
          }
      };
    }

    return el;
  }

  populateEvents(data) {
    const eventsGrid = document.querySelector('.events-grid');
    if (!eventsGrid || !data.recentEvents) return;

    eventsGrid.innerHTML = '';
    const events = data.recentEvents;

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
      
      const cat = document.createElement('p');
      cat.className = 'gallery-category';
      cat.textContent = event.category;
      
      overlay.appendChild(title);
      overlay.appendChild(cat);
      
      item.appendChild(img);
      item.appendChild(overlay);
      eventsGrid.appendChild(item);
    }
  }

  populateAbout(data) {
    if (!data.socialProof) return;

    const populate = (id, items, className) => {
      const container = document.getElementById(id);
      if (!container || !items) return;
      container.innerHTML = '';
      for (let i = 0; i < items.length; i++) {
        const el = document.createElement(className === 'li' ? 'li' : 'span');
        if (className !== 'li') el.className = className;
        el.textContent = items[i];
        container.appendChild(el);
      }
    };

    populate('publications', data.socialProof.publications, 'publication-item');
    populate('awards', data.socialProof.awards, 'li');
    populate('clients', data.socialProof.clients, 'client-item');
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
  'perwedding': 'Pre-Wedding',
  'pre-wedding-photos-and-videos': 'Pre-Wedding',
  'cinematics': 'Cinematics',
  'video': 'Cinematics'
};

// Initialize
(function() {
  const init = function() {
    window.contentLoader = new ContentLoader();
    window.contentLoader.init();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
