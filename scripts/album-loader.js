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
    
    // PERFORMANCE OPTIMIZATION: Replace O(N) filtering of all category images with O(1) lazy randomized probing.
    // Since categories contain up to 300+ items (e.g. candid/prewedding) which are mostly images,
    // probing a random index is highly likely (~99%+) to succeed immediately, completely bypassing
    // expensive array allocation and regex matching on hundreds of items.
    const items = this.data.portfolio.images[category.slug] || [];
    let selectedImage = null;

    if (items.length > 0) {
      const isImage = (item) => item && (item.type === 'image' || !item.type || item.src.match(/\.(jpe?g|png|webp)/i));

      // Attempt up to 5 randomized probes to find a valid image in O(1) time
      for (let attempt = 0; attempt < 5; attempt++) {
        const randomIndex = Math.floor(Math.random() * items.length);
        const probe = items[randomIndex];
        if (isImage(probe)) {
          selectedImage = probe;
          break;
        }
      }

      // Safe fallback: sequential search if randomized probes fail
      if (!selectedImage) {
        selectedImage = items.find(isImage);
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
