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
    
    // Optimization: Use O(1) lazy random probing to select a cover image without O(N) array allocation or full regex scanning
    const categoryItems = this.data.portfolio.images[category.slug] || [];
    const selectedImage = this.getRandomCoverImage(categoryItems);

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

  /**
   * Selects a random cover image in O(1) time complexity, avoiding full
   * O(N) array filtering and regex matching across hundreds of items.
   */
  getRandomCoverImage(items) {
    if (!items || items.length === 0) return null;

    const isImage = (item) => {
      if (!item) return false;
      if (item.type === 'image') return true;
      if (item.type === 'video') return false;
      const url = item.src ? item.src.split('?')[0] : '';
      return !url || /\.(jpe?g|png|webp|avif)$/i.test(url);
    };

    // O(1) probing: try up to 5 random items
    for (let i = 0; i < 5; i++) {
      const randIdx = Math.floor(Math.random() * items.length);
      const candidate = items[randIdx];
      if (isImage(candidate)) return candidate;
    }

    // Fallback if random attempts didn't hit an image
    return items.find(isImage) || null;
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
