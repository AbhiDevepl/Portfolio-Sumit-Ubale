/**
 * Album Loader
 * Dynamically populates the albums grid based on portfolio categories
 */

class AlbumLoader {
  constructor() {
    this.data = null;
  }

  async init() {
    try {
      await this.loadData();
      this.renderAlbums();
      this.initAnimations();
    } catch (error) {
      console.error('Error loading albums:', error);
    }
  }

  async loadData() {
    if (window.Core && typeof window.Core.fetchPortfolioData === 'function') {
      this.data = await window.Core.fetchPortfolioData();
    } else {
      const response = await fetch('/data/portfolio.json');
      this.data = await response.json();
    }
  }

  renderAlbums() {
    const grid = document.getElementById('albums-grid');
    if (!grid) return;

    grid.innerHTML = '';
    
    // We only want to show categories that have images
    const categories = this.data.portfolio.categories.filter(cat => {
        return cat.slug !== 'all' && (this.data.portfolio.images[cat.slug] && this.data.portfolio.images[cat.slug].length > 0);
    });

    const fragment = document.createDocumentFragment();

    categories.forEach((cat, index) => {
      const card = this.createAlbumCard(cat, index);
      fragment.appendChild(card);
    });

    grid.appendChild(fragment);

    document.body.classList.remove('loading');
  }

  createAlbumCard(category, index) {
    const card = document.createElement('div');
    card.className = 'album-card stagger-reveal';
    
    // Get a random cover image (non-videos) for this category
    const rawItems = this.data.portfolio.images[category.slug] || [];
    let selectedImage = null;

    if (rawItems.length > 0) {
      // Helper function to check if item is an image, safely ignoring URL query parameters
      const isImage = (item) => {
        if (!item) return false;
        if (item.type === 'video') return false;
        if (item.type === 'image') return true;
        const urlPath = (item.src || '').split('?')[0].toLowerCase();
        return !urlPath.endsWith('.mp4') && !urlPath.endsWith('.webm');
      };

      // Lazy randomized probing (up to 5 attempts) for O(1) selection without array allocations
      const len = rawItems.length;
      for (let i = 0; i < 5; i++) {
        const randomIndex = Math.floor(Math.random() * len);
        const item = rawItems[randomIndex];
        if (isImage(item)) {
          selectedImage = item;
          break;
        }
      }

      // Fallback to sequential find to ensure we still find one if the probes missed
      if (!selectedImage) {
        selectedImage = rawItems.find(isImage);
      }
    }

    let coverSrc = selectedImage ? selectedImage.src : '';

    card.innerHTML = `
      <img src="${coverSrc}" alt="${category.name}" class="album-image" loading="lazy">
      <div class="album-content">
        <h2 class="album-title">${category.name}</h2>
        <a href="/pages/gallery.html?category=${category.slug}" class="album-learn-more">Learn More</a>
      </div>
    `;

    // Click anywhere on card leads to gallery
    card.onclick = (e) => {
        if (!e.target.classList.contains('album-learn-more')) {
            window.location.href = `/pages/gallery.html?category=${category.slug}`;
        }
    };

    return card;
  }

  initAnimations() {
    const hasGsap = typeof window !== 'undefined' && window.gsap;
    const hasScrollTrigger = typeof window !== 'undefined' && window.ScrollTrigger;

    if (!hasGsap) {
      console.warn('AlbumLoader: GSAP not available, skipping animations.');
      return;
    }

    window.gsap.from('.stagger-reveal', {
      opacity: 0,
      y: 20,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: hasScrollTrigger ? {
        trigger: '.albums-grid',
        start: 'top 85%'
      } : undefined
    });
  }
}

Core.DOM.injectGlobalComponents();

document.addEventListener('DOMContentLoaded', () => {
  const loader = new AlbumLoader();
  loader.init();
});
