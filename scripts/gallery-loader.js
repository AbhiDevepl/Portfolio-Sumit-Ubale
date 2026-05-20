/**
 * Gallery Loader
 */

class GalleryLoader {
  constructor() {
    this.data = null;
    this.category = this.getCategoryFromURL();
  }

  async init() {
    this.category = (this.category || 'all').toLowerCase();
    try {
      await this.loadData();
      if (window.Core && window.Core.Lightbox) Core.Lightbox.init();
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
    
    const categoryInfo = this.data.portfolio.categories.filter(function(c) { return c.slug.toLowerCase() === this.category; }.bind(this))[0];
    if (titleEl) titleEl.textContent = categoryInfo ? categoryInfo.name : this.category.toUpperCase();

    if (categoriesContainer) {
      categoriesContainer.innerHTML = '';
      const fragment = Core.DOM.createFragment(this.data.portfolio.categories, function(cat) {
        const btn = document.createElement('button');
        btn.className = 'category-btn ' + (cat.slug === this.category ? 'active' : '');
        btn.textContent = cat.name;
        btn.onclick = function() {
          this.category = cat.slug;
          window.history.pushState({ category: cat.slug }, '', '?category=' + cat.slug);
          this.renderGallery();
        }.bind(this);
        return btn;
      }.bind(this));
      categoriesContainer.appendChild(fragment);
    }

    let images = [];
    if (this.category === 'all') {
      const keys = Object.keys(this.data.portfolio.images);
      for(let i=0; i<keys.length; i++) {
          const catImgs = this.data.portfolio.images[keys[i]];
          for(let j=0; j<catImgs.length; j++) images.push(catImgs[j]);
      }
    } else {
      const key = Object.keys(this.data.portfolio.images).filter(function(k) { return k.toLowerCase() === this.category; }.bind(this))[0];
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
    const allItems = this.getGalleryData();
    const galleryFragment = Core.DOM.createFragment(images, function(img, idx) { return this.createGalleryItem(img, idx, allItems); }.bind(this));
    grid.appendChild(galleryFragment);

    if (window.ScrollTrigger) ScrollTrigger.refresh();
    document.body.classList.remove('loading');
  }

  createGalleryItem(image, index, allItems) {
    return Core.Media.createItem(image, index, allItems, function(cat) { return this.category; }.bind(this));
  }

  getGalleryData() {
    if (this.category === 'all') {
      let all = [];
      const keys = Object.keys(this.data.portfolio.images);
      for(let i=0; i<keys.length; i++) {
          const catSlug = keys[i];
          const imgs = this.data.portfolio.images[catSlug];
          for(let j=0; j<imgs.length; j++) {
              const enriched = Object.assign({}, imgs[j]);
              enriched.category = catSlug;
              all.push(enriched);
          }
      }
      return all;
    }
    const imgs = this.data.portfolio.images[this.category] || [];
    return imgs.map(function(img) {
        const enriched = Object.assign({}, img);
        enriched.category = this.category;
        return enriched;
    }.bind(this));
  }

  initAnimations() {
    const hasGsap = typeof window !== 'undefined' && window.gsap;
    const hasScrollTrigger = typeof window !== 'undefined' && window.ScrollTrigger;

    if (!hasGsap) {
      console.warn('GalleryLoader: GSAP not available, skipping animations.');
      const items = document.querySelectorAll('.reveal-item');
      for(let i=0; i<items.length; i++) items[i].style.opacity = 1;
      return;
    }

    setTimeout(function() {
      window.gsap.from('.stagger-reveal', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out',
        clearProps: 'all'
      });

      if (hasScrollTrigger) {
        ScrollTrigger.batch('.gallery-item', {
          start: 'top 95%',
          onEnter: function(batch) { return gsap.to(batch, {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            stagger: 0.05,
            ease: 'power2.out',
            overwrite: true
          }); },
          onEnterBack: function(batch) { return gsap.to(batch, { opacity: 1, scale: 1, overwrite: true }); }
        });
        
        ScrollTrigger.refresh();
      } else {
        window.gsap.to('.gallery-item', {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.05,
          ease: 'power2.out'
        });
      }
      
      document.body.classList.remove('loading');
    }, 100);
  }

  handleError(error) {
    const grid = document.getElementById('gallery-grid');
    if (grid) grid.innerHTML = '<div class="error-msg">Failed to load gallery: ' + error.message + '</div>';
    document.body.classList.remove('loading');
  }
}

if (window.Core && window.Core.DOM) Core.DOM.injectGlobalComponents();

document.addEventListener('DOMContentLoaded', function() {
    const loader = new GalleryLoader();
    loader.init();
});
