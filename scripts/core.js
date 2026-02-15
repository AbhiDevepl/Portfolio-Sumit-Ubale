/**
 * CORE.JS - Shared Utilities & Engines
 * Centralized logic for Lightbox, Video handling, and DOM performance.
 */

window.Core = {
  /**
   * LIGHTBOX ENGINE
   */
  Lightbox: {
    state: {
      active: false,
      currentIndex: 0,
      items: [],
      container: null
    },

    init() {
      if (document.getElementById('lightbox')) return;
      
      const html = `
        <div id="lightbox" class="lightbox" aria-hidden="true" role="dialog">
          <div class="lightbox-overlay"></div>
          <div class="lightbox-content">
            <button class="lightbox-close" aria-label="Close">&times;</button>
            <button class="lightbox-prev" aria-label="Previous image">&#8249;</button>
            <button class="lightbox-next" aria-label="Next image">&#8250;</button>
            <div class="lightbox-media-container">
              <img class="lightbox-image" src="" alt="" style="display: none;">
              <video class="lightbox-video" controls muted loop style="display: none;"></video>
            </div>
            <div class="lightbox-caption"></div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', html);
      this.state.container = document.getElementById('lightbox');
      this.bindEvents();
    },

    bindEvents() {
      const { container } = this.state;
      container.querySelector('.lightbox-close').onclick = () => this.close();
      container.querySelector('.lightbox-overlay').onclick = () => this.close();
      container.querySelector('.lightbox-prev').onclick = () => this.nav(-1);
      container.querySelector('.lightbox-next').onclick = () => this.nav(1);

      document.addEventListener('keydown', (e) => {
        if (!this.state.active) return;
        if (e.key === 'Escape') this.close();
        if (e.key === 'ArrowLeft') this.nav(-1);
        if (e.key === 'ArrowRight') this.nav(1);
      });
    },

    open(index, items) {
      this.state.items = items;
      this.state.currentIndex = index;
      this.state.active = true;
      this.updateContent();
      
      this.state.container.style.display = 'flex';
      requestAnimationFrame(() => this.state.container.classList.add('active'));
      document.body.classList.add('no-scroll');
      if (window.lenis) window.lenis.stop();
    },

    close() {
      this.state.active = false;
      this.state.container.classList.remove('active');
      const video = this.state.container.querySelector('.lightbox-video');
      if (video) { video.pause(); video.src = ''; }
      
      setTimeout(() => {
        this.state.container.style.display = 'none';
        document.body.classList.remove('no-scroll');
        if (window.lenis) window.lenis.start();
      }, 300);
    },

    nav(dir) {
      const len = this.state.items.length;
      this.state.currentIndex = (this.state.currentIndex + dir + len) % len;
      this.updateContent();
    },

    updateContent() {
      const item = this.state.items[this.state.currentIndex];
      if (!item) return;

      const imgEl = this.state.container.querySelector('.lightbox-image');
      const vidEl = this.state.container.querySelector('.lightbox-video');
      const capEl = this.state.container.querySelector('.lightbox-caption');

      const isVid = item.type === 'video';
      
      // Gracefully skip animation if GSAP isn't available
      const hasGsap = typeof window !== 'undefined' && window.gsap;
      const fadeOut = (targets, onComplete) => {
        if (!hasGsap) {
          if (typeof onComplete === 'function') onComplete();
          return;
        }
        window.gsap.to(targets, { opacity: 0, duration: 0.15, onComplete });
      };

      const fadeIn = (target) => {
        if (!hasGsap) return;
        window.gsap.to(target, { opacity: 1, duration: 0.15 });
      };

      fadeOut([imgEl, vidEl], () => {
        if (isVid) {
          imgEl.style.display = 'none';
          vidEl.style.display = 'block';
          vidEl.src = item.src;
          vidEl.play();
        } else {
          vidEl.style.display = 'none';
          vidEl.pause();
          imgEl.style.display = 'block';
          imgEl.src = item.src;
        }
        capEl.innerHTML = `<h3>${item.title || ''}</h3><p>${item.category || ''}</p>`;
        fadeIn(isVid ? vidEl : imgEl);
      });
    }
  },

  /**
   * VIDEO HOVER ENGINE
   */
  VideoHover: {
    init(videoElement) {
      if (!videoElement || videoElement.tagName !== 'VIDEO') return;

      const parent = videoElement.closest('.gallery-item');
      if (!parent) return;

      const play = () => {
        // Only load src from data-src if not already loaded
        if (videoElement.dataset.src && !videoElement.src) {
          videoElement.src = videoElement.dataset.src;
        }
        videoElement.play().catch(() => {});
      };

      const stop = () => {
        videoElement.pause();
        videoElement.currentTime = 0;
      };

      parent.addEventListener('mouseenter', play);
      parent.addEventListener('mouseleave', stop);
      parent.addEventListener('touchstart', play, { passive: true });
    }
  },

  /**
   * MEDIA FACTORY
   */
  Media: {
    createItem(image, index, allItems, categoryFormatter = null) {
      const item = document.createElement('div');
      const sizeClass = image.aspectRatio === '16/9' ? 'landscape' : (image.aspectRatio || 'portrait');
      item.className = `gallery-item ${sizeClass} reveal-item loading`; // Start with loading class
      item.dataset.index = index;
      if (image.category) item.dataset.category = image.category;
      if (image.isPreview) item.dataset.preview = 'true';

      const isVideo = image.type === 'video';
      const media = document.createElement(isVideo ? 'video' : 'img');

      media.className = 'gallery-image'; // Default class (opacity: 0)

      if (isVideo) {
        media.dataset.src = image.src;
        media.preload = 'metadata'; // Ensure first frame loads
        media.muted = true;
        media.loop = true;
        media.playsInline = true;
        
        if (image.poster) media.poster = image.poster;
        
        // For videos, we can consider them "loaded" enough to show the poster immediately
        // or wait for canplay. Let's show immediately to avoid blank spaces if poster exists.
        requestAnimationFrame(() => {
            media.classList.add('loaded');
            item.classList.remove('loading');
        });

      } else {
        media.src = image.src;
        media.loading = 'lazy';
        media.alt = image.alt || image.title || '';
        
        // Add loaded class when image loads
        media.onload = () => {
            media.classList.add('loaded');
            item.classList.remove('loading');
        };
        
        // Handle cached images immediately
        if (media.complete) {
             media.classList.add('loaded');
             item.classList.remove('loading');
        }
      }

      item.appendChild(media);

      if (isVideo && window.Core && window.Core.VideoHover) {
        window.Core.VideoHover.init(media);
      }

      const overlay = document.createElement('div');
      overlay.className = 'gallery-overlay';
      
      const displayCategory = categoryFormatter ? categoryFormatter(image.category) : (image.category || '');
      
      overlay.innerHTML = `
        <h3 class="gallery-title">${image.title || ''}</h3>
        <p class="gallery-category">${displayCategory}</p>
      `;

      item.appendChild(overlay);

      item.addEventListener('click', (e) => {
        if (window.Core && window.Core.Lightbox) {
          window.Core.Lightbox.open(index, allItems);
        }
      });

      return item;
    }
  },

  /**
   * DOM UTILS
   */
  DOM: {
    createFragment(items, renderer) {
      const fragment = document.createDocumentFragment();
      items.forEach((item, idx) => {
        const rendered = renderer(item, idx);
        if (rendered) fragment.appendChild(rendered);
      });
      return fragment;
    }
  }
};
