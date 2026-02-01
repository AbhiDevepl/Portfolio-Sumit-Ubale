/* ========================================
   GALLERY INTERACTIONS & LOGIC
   ======================================== */

window.GalleryManager = {
  
  // State
  activeCategory: 'all',
  lightbox: null,
  currentImageIndex: 0,
  galleryItems: [],
  
  /**
   * Initialize Gallery
   */
  init() {
    this.galleryItems = document.querySelectorAll('.gallery-item');
    this.initFiltering();
    this.initHoverEffects();
    this.initLightbox();
    this.checkURLState();
    
    // Lazy loading fallback
    this.initLazyLoading();
    
    console.log('✅ Gallery Manager initialized');
  },
  
  /**
   * Initialize Filtering Logic
   */
  initFiltering() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    if (categoryButtons.length === 0) return;
    
    categoryButtons.forEach(button => {
      button.addEventListener('click', () => {
        const category = button.dataset.category;
        this.filterGallery(category);
        this.updateURL(category);
      });
    });
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', (e) => {
      const category = e.state?.category || 'all';
      this.filterGallery(category, false); // Don't push state again
    });
  },
  
  /**
   * Filter Gallery Items
   * @param {string} category - Category slug to filter by
   */
  filterGallery(category) {
    this.activeCategory = category;
    
    // Update active button state
    document.querySelectorAll('.category-btn').forEach(btn => {
      if (btn.dataset.category === category) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      }
    });
    
    // Filter items using GSAP
    this.galleryItems = document.querySelectorAll('.gallery-item');
    
    this.galleryItems.forEach(item => {
      const itemCategory = item.dataset.category;
      const shouldShow = category === 'all' || itemCategory === category;
      
      if (shouldShow) {
        gsap.to(item, {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: "power2.out",
          onStart: () => {
            item.style.display = 'block';
          }
        });
      } else {
        gsap.to(item, {
          opacity: 0,
          scale: 0.9,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => {
            item.style.display = 'none';
          }
        });
      }
    });
    
    // Refresh ScrollTrigger layout
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 450);
  },
  
  /**
   * Update URL without reloading
   */
  updateURL(category) {
    const url = new URL(window.location);
    if (category === 'all') {
      url.searchParams.delete('category');
    } else {
      url.searchParams.set('category', category);
    }
    window.history.pushState({ category }, '', url);
  },
  
  /**
   * Check URL on load for active filter
   */
  checkURLState() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    if (category) {
      this.filterGallery(category);
    }
  },
  
  /**
   * Initialize Hover Effects
   */
  initHoverEffects() {
    // Re-select items to ensure we catch dynamic content
    const items = document.querySelectorAll('.gallery-item');
    
    items.forEach(item => {
      const image = item.querySelector('.gallery-image');
      const overlay = item.querySelector('.gallery-overlay');
      
      if (!image || !overlay) return;
      
      // Remove old listeners to prevent duplicates if re-initialized
      // Use cloneNode to strip listeners, then replace (careful with this approach) - 
      // safer to just rely on unique initialization call or clean up.
      // For now, simpler event delegation or direct attach assuming single init.
      
      item.addEventListener('mouseenter', () => {
        gsap.to(image, { scale: 1.05, filter: 'grayscale(0%)', duration: 0.5 });
        gsap.to(overlay, { opacity: 1, duration: 0.3 });
      });
      
      item.addEventListener('mouseleave', () => {
        gsap.to(image, { scale: 1, filter: 'grayscale(0%)', duration: 0.5 });
        gsap.to(overlay, { opacity: 0, duration: 0.3 });
      });
      
      // Lightbox click
      item.addEventListener('click', () => {
        // Find current index among ALL items (not just visible) to keep index logic simple
        // or filter visible only. Let's use all items for index context.
        const index = parseInt(item.dataset.index);
        this.openLightbox(index);
      });
    });
  },
  
  /**
   * Initialize Lightbox
   */
  initLightbox() {
    // Only create if not exists
    if (document.getElementById('lightbox')) return;
    
    const lightboxHTML = `
      <div class="lightbox" id="lightbox" style="display: none;">
        <div class="lightbox-overlay"></div>
        <div class="lightbox-content">
          <button class="lightbox-close" aria-label="Close lightbox">&times;</button>
          <button class="lightbox-prev" aria-label="Previous image">&#8249;</button>
          <button class="lightbox-next" aria-label="Next image">&#8250;</button>
          <img class="lightbox-image" src="" alt="">
          <div class="lightbox-caption"></div>
        </div>
      </div>
      <style>
        .lightbox { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.3s; }
        .lightbox.active { opacity: 1; pointer-events: auto; }
        .lightbox-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.95); }
        .lightbox-content { position: relative; z-index: 1001; max-width: 90vw; max-height: 90vh; }
        .lightbox-image { max-width: 100%; max-height: 90vh; object-fit: contain; }
        .lightbox-close, .lightbox-prev, .lightbox-next { position: absolute; background: none; border: none; color: white; font-size: 3rem; cursor: pointer; padding: 1rem; z-index: 1002; }
        .lightbox-close { top: 1rem; right: 1rem; }
        .lightbox-prev { left: 1rem; top: 50%; transform: translateY(-50%); }
        .lightbox-next { right: 1rem; top: 50%; transform: translateY(-50%); }
        .lightbox-caption { position: absolute; bottom: 2rem; left: 0; right: 0; text-align: center; color: white; text-shadow: 0 1px 3px rgba(0,0,0,0.8); }
        .lightbox-caption h3 { margin: 0; font-size: 1.5rem; font-family: var(--font-serif); }
        .lightbox-caption p { margin: 0.5rem 0 0; opacity: 0.8; font-family: var(--font-sans); text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.8rem; }
        body.no-scroll { overflow: hidden; }
      </style>
    `;
    
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);
    this.lightbox = document.getElementById('lightbox');
    
    // Event Listeners
    this.lightbox.querySelector('.lightbox-close').addEventListener('click', () => this.closeLightbox());
    this.lightbox.querySelector('.lightbox-overlay').addEventListener('click', () => this.closeLightbox());
    this.lightbox.querySelector('.lightbox-prev').addEventListener('click', () => this.navigateLightbox(-1));
    this.lightbox.querySelector('.lightbox-next').addEventListener('click', () => this.navigateLightbox(1));
    
    document.addEventListener('keydown', (e) => {
      if (!this.lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') this.closeLightbox();
      if (e.key === 'ArrowLeft') this.navigateLightbox(-1);
      if (e.key === 'ArrowRight') this.navigateLightbox(1);
    });
  },
  
  openLightbox(index) {
    this.currentImageIndex = index;
    this.updateLightboxContent();
    
    this.lightbox.style.display = 'flex';
    // Small delay to allow display:flex to apply before opacity transition
    requestAnimationFrame(() => {
      this.lightbox.classList.add('active');
    });
    
    document.body.classList.add('no-scroll');
    if (window.lenis) window.lenis.stop();
  },
  
  closeLightbox() {
    this.lightbox.classList.remove('active');
    setTimeout(() => {
      this.lightbox.style.display = 'none';
      document.body.classList.remove('no-scroll');
      if (window.lenis) window.lenis.start();
    }, 300);
  },
  
  navigateLightbox(direction) {
    // Navigate only through VISIBLE items if filter is active?
    // For simplicity, let's navigate all items but skip hidden ones
    // Or just simple index navigation:
    
    const totalItems = this.galleryItems.length;
    let newIndex = this.currentImageIndex + direction;
    
    if (newIndex < 0) newIndex = totalItems - 1;
    if (newIndex >= totalItems) newIndex = 0;
    
    // Check if hidden (due to filter)
    // If hidden, keep moving in same direction until visible found
    /*
    let item = this.galleryItems[newIndex];
    while (item.style.display === 'none') {
        newIndex += direction;
        if (newIndex < 0) newIndex = totalItems - 1;
        if (newIndex >= totalItems) newIndex = 0;
        item = this.galleryItems[newIndex];
        // Break infinite loop if all hidden (shouldn't happen)
        if (newIndex === this.currentImageIndex) break; 
    }
    */
   
    this.currentImageIndex = newIndex;
    this.updateLightboxContent();
  },
  
  updateLightboxContent() {
    const item = this.galleryItems[this.currentImageIndex];
    const imgInfo = {
      src: item.querySelector('img').getAttribute('src'), // Get actual src
      title: item.querySelector('.gallery-title')?.innerText || '',
      category: item.getAttribute('data-category')
    };
    
    const imgEl = this.lightbox.querySelector('.lightbox-image');
    const capEl = this.lightbox.querySelector('.lightbox-caption');
    
    // Quick fade out/in effect for image
    gsap.to(imgEl, { opacity: 0, duration: 0.15, onComplete: () => {
      imgEl.src = imgInfo.src;
      capEl.innerHTML = `<h3>${imgInfo.title}</h3><p>${imgInfo.category}</p>`;
      gsap.to(imgEl, { opacity: 1, duration: 0.15 });
    }});
  },
  
  initLazyLoading() {
     // Native lazy loading is used on createGalleryItem in content-loader
     // This is just a backup or for other images
     const lazyImages = document.querySelectorAll('img[loading="lazy"]:not([src])');
     if ('IntersectionObserver' in window) {
       const obs = new IntersectionObserver(entries => {
         entries.forEach(entry => {
           if (entry.isIntersecting) {
             const img = entry.target;
             img.src = img.dataset.src;
             obs.unobserve(img);
           }
         });
       });
       lazyImages.forEach(img => obs.observe(img));
     }
  }
};

// Auto-init removed. Will be called by ContentLoader.
