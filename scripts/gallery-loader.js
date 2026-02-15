/**
 * Gallery Loader
 * Handles dynamic content loading for the dedicated gallery results page
 */

class GalleryLoader {
  constructor() {
    this.data = null;
    this.category = this.getCategoryFromURL();
  }

  async init() {
    this.category = (this.category || 'all').toLowerCase();
    // if (!this.category) { window.location.href = '/'; return; } // Removed redirect

    try {
      await this.loadData();
      Core.Lightbox.init();
      this.renderGallery();
      this.initAnimations();
    } catch (error) {
      console.error('Error loading gallery:', error);
      this.handleError(error);
    }
  }

  getCategoryFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('category') || params.get('c');
  }

  async loadData() {
    const response = await fetch('/data/portfolio.json');
    this.data = await response.json();
  }

  renderGallery() {
    const grid = document.getElementById('gallery-grid');
    const titleEl = document.getElementById('category-title');
    const categoriesContainer = document.getElementById('gallery-categories');
    
    // Update category title
    const categoryInfo = this.data.portfolio.categories.find(c => c.slug.toLowerCase() === this.category);
    if (titleEl) titleEl.textContent = categoryInfo ? categoryInfo.name : this.category.toUpperCase();

    // Render category buttons (navigation)
    if (categoriesContainer) {
      categoriesContainer.innerHTML = '';
      const fragment = Core.DOM.createFragment(this.data.portfolio.categories, (cat) => {
        const btn = document.createElement('button');
        btn.className = `category-btn ${cat.slug === this.category ? 'active' : ''}`;
        btn.textContent = cat.name;
        btn.onclick = () => {
          this.category = cat.slug;
          window.history.pushState({ category: cat.slug }, '', `?category=${cat.slug}`);
          this.renderGallery();
        };
        return btn;
      });
      categoriesContainer.appendChild(fragment);
    }

    // Aggregate images
    let images = [];
    if (this.category === 'all') {
      Object.values(this.data.portfolio.images).forEach(catImages => images.push(...catImages));
    } else {
      const key = Object.keys(this.data.portfolio.images).find(k => k.toLowerCase() === this.category);
      images = this.data.portfolio.images[key] || [];
    }
    
    if (!images.length) {
      grid.innerHTML = '<p class="error-msg">No items found in this category.</p>';
      return;
    }

    if (grid) {
      if (this.category === 'cinematics') {
        grid.classList.add('layout-centered');
      } else {
        grid.classList.remove('layout-centered');
      }
    }

    grid.innerHTML = '';
    const galleryFragment = Core.DOM.createFragment(images, (img, idx) => this.createGalleryItem(img, idx));
    grid.appendChild(galleryFragment);

    if (window.ScrollTrigger) ScrollTrigger.refresh();
    document.body.classList.remove('loading');
  }

  createGalleryItem(image, index) {
    const item = document.createElement('div');
    const sizeClass = image.aspectRatio === '16/9' ? 'landscape' : (image.aspectRatio || 'portrait');
    item.className = `gallery-item ${sizeClass} reveal-item`;
    item.dataset.index = index;

    const isVideo = image.type === 'video';
    const media = document.createElement(isVideo ? 'video' : 'img');
    
    if (isVideo) {
      media.src = image.src; // ✓ Set src directly for preload to work
      media.dataset.src = image.src; // Keep for VideoHover compatibility
      media.preload = 'metadata'; // Changed from 'none' to show first frame
      media.muted = media.loop = media.playsInline = true;
      media.className = 'gallery-image';
      if (image.poster) media.poster = image.poster;
      
      // Add loaded class for videos immediately
      requestAnimationFrame(() => {
        media.classList.add('loaded');
      });
      
      Core.VideoHover.init(media);
    } else {
      media.src = image.src;
      media.className = 'gallery-image';
      media.loading = 'lazy';
      
      // Add loaded class when image loads
      media.onload = () => {
        media.classList.add('loaded');
      };
      
      // Handle already cached images
      if (media.complete) {
        media.classList.add('loaded');
      }
    }

    const overlay = document.createElement('div');
    overlay.className = 'gallery-overlay';
    overlay.innerHTML = `
      <h2 class="gallery-title">${image.title || ''}</h2>
      <p class="gallery-category">${this.category}</p>
    `;

    item.append(media, overlay);
    item.onclick = () => {
      const allItems = this.getGalleryData();
      Core.Lightbox.open(index, allItems);
    };

    return item;
  }

  getGalleryData() {
    // Helper to get raw data for lightbox with injected category
    if (this.category === 'all') {
      let all = [];
      Object.entries(this.data.portfolio.images).forEach(([catSlug, imgs]) => {
        const enriched = imgs.map(img => ({ ...img, category: catSlug }));
        all.push(...enriched);
      });
      return all;
    }
    const imgs = this.data.portfolio.images[this.category] || [];
    return imgs.map(img => ({ ...img, category: this.category }));
  }

  initAnimations() {
    const hasGsap = typeof window !== 'undefined' && window.gsap;
    const hasScrollTrigger = typeof window !== 'undefined' && window.ScrollTrigger;

    // If GSAP is not loaded (e.g., CDN blocked), skip animations instead of throwing.
    if (!hasGsap) {
      console.warn('GalleryLoader: GSAP not available, skipping animations.');
      return;
    }

    window.gsap.from('.stagger-reveal', {
      opacity: 0,
      y: 20,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power2.out'
    });

    window.gsap.from('.gallery-item', {
      opacity: 0,
      scale: 0.9,
      duration: 0.6,
      stagger: 0.05,
      ease: 'power2.out',
      scrollTrigger: hasScrollTrigger ? {
        trigger: '#gallery-grid',
        start: 'top 85%'
      } : undefined
    });
  }

  handleError(error) {
    const grid = document.getElementById('gallery-grid');
    if (grid) grid.innerHTML = `<div class="error-msg">Failed to load gallery: ${error.message}</div>`;
  }
}

// Global Nav & Footer Injection (Single source of truth)
function injectGlobalComponents() {
  const nav = document.getElementById('main-nav');
  if (nav) {
    nav.innerHTML = `
      <div class="nav-container">
        <a href="/" class="nav-logo">SUMIT UBALE</a>
        <div class="nav-menu">
          <a href="/#portfolio" class="nav-link">Everything</a>
          <a href="/pages/service.html?s=weddings" class="nav-link">Weddings</a>
          <a href="/pages/service.html?s=cinematics" class="nav-link">Films</a>
          <a href="/#about" class="nav-link">About</a>
          <a href="/#contact" class="nav-cta">Enquire</a>
        </div>
        <button class="nav-toggle" aria-label="Toggle navigation">
          <span class="nav-toggle-line"></span>
          <span class="nav-toggle-line"></span>
        </button>
      </div>
    `;
  }

  const footer = document.getElementById('main-footer');
  if (footer) {
    footer.innerHTML = `
      <div class="container">
        <p>&copy; ${new Date().getFullYear()} Sumit Ubale Photography. All rights reserved.</p>
      </div>
    `;
  }
}

injectGlobalComponents();

document.addEventListener('DOMContentLoaded', () => {
    const loader = new GalleryLoader();
    loader.init();
});
