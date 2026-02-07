/* ========================================
   GALLERY INTERACTIONS & LOGIC
   ======================================== */

window.GalleryManager = {

  // State
  activeCategory: 'all',
  expandedCategories: [], // Tracks which categories are fully shown
  lightbox: null,
  currentImageIndex: 0,
  galleryItems: [],
  categoryButtons: [],

  /**
   * Initialize Gallery
   */
  init() {
    // Performance: Cache DOM elements to avoid repeated queries
    this.galleryItems = document.querySelectorAll('.gallery-item');
    this.categoryButtons = document.querySelectorAll('.category-btn');

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
    if (this.categoryButtons.length === 0) return;

    this.categoryButtons.forEach(button => {
      button.addEventListener('click', () => {
        const category = button.dataset.category;
        this.filterGallery(category);
        this.updateURL(category);
      });
    });

    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        const index = this.expandedCategories.indexOf(this.activeCategory);
        if (index === -1) {
          this.expandedCategories.push(this.activeCategory);
        } else {
          this.expandedCategories.splice(index, 1);
        }
        this.filterGallery(this.activeCategory);

        // Scroll to portfolio header if closing to maintain context
        if (index !== -1) {
          const portfolioSection = document.getElementById('portfolio');
          if (portfolioSection) {
            portfolioSection.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    }

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

    // Performance: Update active button state using cached buttons
    this.categoryButtons.forEach(btn => {
      const isActive = btn.dataset.category === category;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // Filter items using GSAP
    const isExpanded = this.expandedCategories.includes(category);
    let hasHiddenItems = false;

    this.galleryItems.forEach(item => {
      const itemCategory = item.dataset.category;
      const isPreview = item.dataset.preview === 'true';
      const isTargetCategory = category === 'all' || itemCategory === category;

      let shouldShow = false;
      if (isTargetCategory) {
        if (isExpanded || isPreview) {
          shouldShow = true;
        } else {
          hasHiddenItems = true;
        }
      }

      const isCurrentlyVisible = item.style.display !== 'none';

      if (shouldShow) {
        // Performance: Skip animation if already visible and at full opacity
        if (isCurrentlyVisible && gsap.getProperty(item, "opacity") === 1) return;

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
        // Performance: Skip animation if already hidden
        if (!isCurrentlyVisible) return;

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

    // Update Learn More button visibility and text
    const moreBtn = document.getElementById('load-more-btn');
    const moreContainer = document.getElementById('portfolio-more');

    if (moreContainer && moreBtn) {
      if (isExpanded) {
        moreContainer.style.display = 'flex';
        moreBtn.textContent = 'Show Less';
      } else if (hasHiddenItems) {
        moreContainer.style.display = 'flex';
        moreBtn.textContent = 'Learn More';
      } else {
        moreContainer.style.display = 'none';
      }
    }

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
    // Performance: Use cached gallery items
    this.galleryItems.forEach(item => {
      const image = item.querySelector('.gallery-image');
      const overlay = item.querySelector('.gallery-overlay');

      if (!image || !overlay) return;

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
          <div class="lightbox-media-container">
            <img class="lightbox-image" src="" alt="" style="display: none;">
            <video class="lightbox-video" controls muted loop style="display: none;"></video>
          </div>
          <div class="lightbox-caption"></div>
        </div>
      </div>
      <style>
        .lightbox { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.3s; }
        .lightbox.active { opacity: 1; pointer-events: auto; }
        .lightbox-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.95); }
        .lightbox-content { position: relative; z-index: 1001; max-width: 90vw; max-height: 90vh; width: 100%; display: flex; flex-direction: column; align-items: center; }
        .lightbox-media-container { max-width: 100%; max-height: 80vh; display: flex; align-items: center; justify-content: center; }
        .lightbox-image, .lightbox-video { max-width: 100%; max-height: 80vh; object-fit: contain; }
        .lightbox-close, .lightbox-prev, .lightbox-next { position: absolute; background: none; border: none; color: white; font-size: 3rem; cursor: pointer; padding: 1rem; z-index: 1002; }
        .lightbox-close { top: -4rem; right: 0; }
        .lightbox-prev { left: -4rem; top: 50%; transform: translateY(-50%); }
        .lightbox-next { right: -4rem; top: 50%; transform: translateY(-50%); }
        .lightbox-caption { margin-top: 1.5rem; text-align: center; color: white; }
        .lightbox-caption h3 { margin: 0; font-size: 1.5rem; font-family: var(--font-serif); }
        .lightbox-caption p { margin: 0.5rem 0 0; opacity: 0.8; font-family: var(--font-sans); text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.8rem; }
        body.no-scroll { overflow: hidden; }

        @media (max-width: 768px) {
          .lightbox-prev, .lightbox-next { display: none; }
          .lightbox-close { top: 1rem; right: 1rem; font-size: 2rem; }
        }
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
    // Stop any video
    const video = this.lightbox.querySelector('.lightbox-video');
    if (video) {
      video.pause();
      video.currentTime = 0;
    }

    setTimeout(() => {
      this.lightbox.style.display = 'none';
      document.body.classList.remove('no-scroll');
      if (window.lenis) window.lenis.start();
    }, 300);
  },

  navigateLightbox(direction) {
    const totalItems = this.galleryItems.length;
    let newIndex = this.currentImageIndex + direction;

    if (newIndex < 0) newIndex = totalItems - 1;
    if (newIndex >= totalItems) newIndex = 0;

    this.currentImageIndex = newIndex;
    this.updateLightboxContent();
  },

  updateLightboxContent() {
    const item = this.galleryItems[this.currentImageIndex];
    const imgEl = item.querySelector('img');
    const videoEl = item.querySelector('video');
    const isVideo = !!videoEl;

    const imgInfo = {
      src: isVideo ? (videoEl.getAttribute('src') || videoEl.dataset.src) : imgEl.getAttribute('src'),
      title: item.querySelector('.gallery-title')?.innerText || '',
      category: item.getAttribute('data-category'),
      isVideo: isVideo
    };

    const lightboxImg = this.lightbox.querySelector('.lightbox-image');
    const lightboxVid = this.lightbox.querySelector('.lightbox-video');
    const capEl = this.lightbox.querySelector('.lightbox-caption');

    // Quick fade out/in effect
    gsap.to([lightboxImg, lightboxVid], { opacity: 0, duration: 0.15, onComplete: () => {
      if (imgInfo.isVideo) {
        lightboxImg.style.display = 'none';
        lightboxVid.style.display = 'block';
        lightboxVid.src = imgInfo.src;
        lightboxVid.play();
      } else {
        lightboxVid.style.display = 'none';
        lightboxVid.pause();
        lightboxImg.style.display = 'block';
        lightboxImg.src = imgInfo.src;
      }

      capEl.innerHTML = `<h3>${imgInfo.title}</h3><p>${imgInfo.category}</p>`;
      gsap.to(imgInfo.isVideo ? lightboxVid : lightboxImg, { opacity: 1, duration: 0.15 });
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
