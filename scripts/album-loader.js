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
    const response = await fetch('/data/portfolio.json');
    this.data = await response.json();
  }

  renderAlbums() {
    const grid = document.getElementById('albums-grid');
    if (!grid) return;

    grid.innerHTML = '';
    
    // We only want to show categories that have images
    const categories = this.data.portfolio.categories.filter(cat => {
        return cat.slug !== 'all' && (this.data.portfolio.images[cat.slug]?.length > 0);
    });

    categories.forEach((cat, index) => {
      const card = this.createAlbumCard(cat, index);
      grid.appendChild(card);
    });

    document.body.classList.remove('loading');
  }

  createAlbumCard(category, index) {
    const card = document.createElement('div');
    card.className = 'album-card stagger-reveal';
    
    // Get first image as cover
    const firstImage = this.data.portfolio.images[category.slug][0];
    const coverSrc = firstImage ? firstImage.src : '/assets/images/cover/default.jpg';
    const isVideo = firstImage?.type === 'video';

    card.innerHTML = `
      ${isVideo ? 
        `<video class="album-image" muted loop playsinline poster="${firstImage.poster || ''}"><source src="${coverSrc}" type="video/mp4"></video>` : 
        `<img src="${coverSrc}" alt="${category.name}" class="album-image" loading="lazy">`
      }
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

    // Video hover preview
    if (isVideo) {
        const video = card.querySelector('video');
        card.onmouseenter = () => video.play();
        card.onmouseleave = () => {
            video.pause();
            video.currentTime = 0;
        };
    }

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

// Global Nav Injection (Re-using or simple version)
function injectGlobalComponents() {
    const nav = document.getElementById('main-nav');
    if (nav) {
      nav.innerHTML = `
        <div class="nav-container">
          <a href="/" class="nav-logo">SUMIT UBALE</a>
          <div class="nav-menu">
            <a href="/#portfolio" class="nav-link">Everything</a>
            <a href="/pages/albums.html" class="nav-link">Albums</a>
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
  const loader = new AlbumLoader();
  loader.init();
});
