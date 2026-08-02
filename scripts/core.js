/**
 * CORE.JS - Shared Utilities & Engines
 * Centralized logic for Lightbox, Video handling, and DOM performance.
 */

(function() {
  let _portfolioDataPromise = null;
  let _servicesDataPromise = null;

  window.Core = {
    /**
     * CACHED PORTFOLIO FETCH
     * Utilizes a promise-based in-memory cache to deduplicate concurrent requests and avoid redundant
     * JSON parsing, falling back to sessionStorage for cross-navigation caching to save ~291KB bandwidth.
     */
    async fetchPortfolioData(url = '/data/portfolio.json') {
      if (_portfolioDataPromise) {
        return _portfolioDataPromise;
      }

      _portfolioDataPromise = (async () => {
        const cacheKey = 'sumit_portfolio_data';
        try {
          const cached = sessionStorage.getItem(cacheKey);
          if (cached) {
            return JSON.parse(cached);
          }
        } catch (e) {
          console.warn('SessionStorage cache access failed:', e);
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();

        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(data));
        } catch (e) {
          console.warn('SessionStorage write failed:', e);
        }
        return data;
      })().catch((err) => {
        _portfolioDataPromise = null; // Clear cache on failure so future attempts can retry
        throw err;
      });

      return _portfolioDataPromise;
    },

    /**
     * CACHED SERVICES FETCH
     * Utilizes a promise-based in-memory cache to deduplicate concurrent requests and avoid redundant
     * JSON parsing, falling back to sessionStorage for cross-navigation caching.
     */
    async fetchServicesData(url = '/data/services.json') {
      if (_servicesDataPromise) {
        return _servicesDataPromise;
      }

      _servicesDataPromise = (async () => {
        const cacheKey = 'sumit_services_data';
        try {
          const cached = sessionStorage.getItem(cacheKey);
          if (cached) {
            return JSON.parse(cached);
          }
        } catch (e) {
          console.warn('SessionStorage cache access failed:', e);
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();

        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(data));
        } catch (e) {
          console.warn('SessionStorage write failed:', e);
        }
        return data;
      })().catch((err) => {
        _servicesDataPromise = null; // Clear cache on failure so future attempts can retry
        throw err;
      });

      return _servicesDataPromise;
    },

    /**
     * LIGHTBOX ENGINE
     */
    Lightbox: {
    state: {
      active: false,
      currentIndex: 0,
      items: [],
      container: null,
      touchStartX: 0,
      touchCurrentX: 0,
      touchActive: false
    },

    init() {
      if (document.getElementById('lightbox')) return;
      
      const html = `
        <div id="lightbox" class="lightbox" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Fullscreen gallery preview">
          <div class="lightbox-overlay"></div>
          <div class="lightbox-content">
            <button class="lightbox-close" type="button" aria-label="Close preview">&times;</button>
            <button class="lightbox-prev" type="button" aria-label="Previous item">&#8249;</button>
            <button class="lightbox-next" type="button" aria-label="Next item">&#8250;</button>
            <div class="lightbox-media-container">
              <div class="lightbox-loading" style="display: none;">
                <div class="spinner"></div>
                <p>Loading\u2026</p>
              </div>
              <img class="lightbox-image" src="" alt="" style="display: none;">
              <div class="lightbox-video-wrapper" style="display: none;">
                <video class="lightbox-video" playsinline controls></video>
                <div class="video-overlay-controls">
                  <button class="video-play-pause" type="button" aria-label="Play or pause video">
                    <svg class="play-icon" width="80" height="80" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    <svg class="pause-icon" width="80" height="80" viewBox="0 0 24 24" fill="white" style="display: none;">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  </button>
                </div>
                <div class="video-controls-bar">
                  <button class="video-control-btn play-pause-small" type="button" aria-label="Play or pause video">
                    <svg class="play-icon-small" width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    <svg class="pause-icon-small" width="24" height="24" viewBox="0 0 24 24" fill="white" style="display: none;">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  </button>
                  <div class="video-progress-container">
                    <input type="range" class="video-progress" min="0" max="100" value="0" step="0.1">
                    <div class="video-progress-filled"></div>
                  </div>
                  <span class="video-time">0:00 / 0:00</span>
                  <button class="video-control-btn mute-btn" type="button" aria-label="Mute or unmute video">
                    <svg class="volume-icon" width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                    </svg>
                    <svg class="mute-icon" width="24" height="24" viewBox="0 0 24 24" fill="white" style="display: none;">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                    </svg>
                  </button>
                  <input type="range" class="volume-slider" min="0" max="100" value="100" step="1">
                  <select class="playback-speed" aria-label="Playback speed">
                    <option value="0.5">0.5x</option>
                    <option value="0.75">0.75x</option>
                    <option value="1" selected>1x</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2x</option>
                  </select>
                  <button class="video-control-btn fullscreen-btn" type="button" aria-label="Open video fullscreen">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div class="lightbox-caption">
              <div class="lightbox-caption-copy">
                <h3></h3>
                <p></p>
              </div>
              <div class="lightbox-counter" aria-live="polite"></div>
            </div>
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
      this.bindTouch();

      // Video controls
      this.bindVideoControls();

      document.addEventListener('keydown', (e) => {
        if (!this.state.active) return;
        if (e.key === 'Escape') this.close();
        if (e.key === 'ArrowLeft') this.nav(-1);
        if (e.key === 'ArrowRight') this.nav(1);
        if (e.key === ' ') {
          e.preventDefault();
          this.togglePlayPause();
        }
      });
    },

    bindTouch() {
      const mediaContainer = this.state.container.querySelector('.lightbox-media-container');
      if (!mediaContainer) return;

      mediaContainer.addEventListener('touchstart', (e) => {
        if (!this.state.active || e.touches.length !== 1) return;
        this.state.touchActive = true;
        this.state.touchStartX = e.touches[0].clientX;
        this.state.touchCurrentX = e.touches[0].clientX;
      }, { passive: true });

      mediaContainer.addEventListener('touchmove', (e) => {
        if (!this.state.touchActive || e.touches.length !== 1) return;
        this.state.touchCurrentX = e.touches[0].clientX;
      }, { passive: true });

      mediaContainer.addEventListener('touchend', () => {
        if (!this.state.touchActive) return;

        const deltaX = this.state.touchCurrentX - this.state.touchStartX;
        this.state.touchActive = false;

        if (Math.abs(deltaX) < 48) return;
        this.nav(deltaX < 0 ? 1 : -1);
      });
    },

    bindVideoControls() {
      const { container } = this.state;
      const video = container.querySelector('.lightbox-video');
      const wrapper = container.querySelector('.lightbox-video-wrapper');
      const playPauseOverlay = container.querySelector('.video-play-pause');
      const playPauseSmall = container.querySelector('.play-pause-small');
      const progress = container.querySelector('.video-progress');
      const progressFilled = container.querySelector('.video-progress-filled');
      const timeDisplay = container.querySelector('.video-time');
      const muteBtn = container.querySelector('.mute-btn');
      const volumeSlider = container.querySelector('.volume-slider');
      const speedSelect = container.querySelector('.playback-speed');
      const fullscreenBtn = container.querySelector('.fullscreen-btn');

      // Play/Pause overlay (center button)
      playPauseOverlay.onclick = () => this.togglePlayPause();
      playPauseSmall.onclick = () => this.togglePlayPause();
      
      // Click video to play/pause
      video.onclick = () => this.togglePlayPause();

      // Progress bar
      video.addEventListener('timeupdate', () => {
        const percent = (video.currentTime / video.duration) * 100;
        progress.value = percent;
        progressFilled.style.width = `${percent}%`;
        timeDisplay.textContent = `${this.formatTime(video.currentTime)} / ${this.formatTime(video.duration)}`;
      });

      progress.addEventListener('input', (e) => {
        const time = (e.target.value / 100) * video.duration;
        video.currentTime = time;
      });

      // Mute/Unmute
      muteBtn.onclick = () => {
        video.muted = !video.muted;
        this.updateMuteButton();
      };

      // Volume
      volumeSlider.addEventListener('input', (e) => {
        video.volume = e.target.value / 100;
        video.muted = video.volume === 0;
        this.updateMuteButton();
      });

      // Playback speed
      speedSelect.addEventListener('change', (e) => {
        video.playbackRate = parseFloat(e.target.value);
      });

      // Fullscreen
      fullscreenBtn.onclick = () => {
        if (wrapper.requestFullscreen) {
          wrapper.requestFullscreen();
        } else if (wrapper.webkitRequestFullscreen) {
          wrapper.webkitRequestFullscreen();
        } else if (wrapper.msRequestFullscreen) {
          wrapper.msRequestFullscreen();
        }
      };

      // Update play/pause icons
      video.addEventListener('play', () => this.updatePlayPauseIcons(true));
      video.addEventListener('pause', () => this.updatePlayPauseIcons(false));

      // Show/hide controls
      let controlsTimeout;
      const showControls = () => {
        container.querySelector('.video-controls-bar').style.opacity = '1';
        clearTimeout(controlsTimeout);
        controlsTimeout = setTimeout(() => {
          if (!video.paused) {
            container.querySelector('.video-controls-bar').style.opacity = '0';
          }
        }, 3000);
      };

      wrapper.addEventListener('mousemove', showControls);
      wrapper.addEventListener('touchstart', showControls);
    },

    togglePlayPause() {
      const video = this.state.container.querySelector('.lightbox-video');
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    },

    updatePlayPauseIcons(isPlaying) {
      const container = this.state.container;
      const playIcons = container.querySelectorAll('.play-icon, .play-icon-small');
      const pauseIcons = container.querySelectorAll('.pause-icon, .pause-icon-small');
      
      playIcons.forEach(icon => icon.style.display = isPlaying ? 'none' : 'block');
      pauseIcons.forEach(icon => icon.style.display = isPlaying ? 'block' : 'none');
      
      // Hide overlay controls when playing
      const overlay = container.querySelector('.video-overlay-controls');
      if (overlay) {
        overlay.style.opacity = isPlaying ? '0' : '1';
      }
    },

    updateMuteButton() {
      const video = this.state.container.querySelector('.lightbox-video');
      const volumeIcon = this.state.container.querySelector('.volume-icon');
      const muteIcon = this.state.container.querySelector('.mute-icon');
      
      volumeIcon.style.display = video.muted ? 'none' : 'block';
      muteIcon.style.display = video.muted ? 'block' : 'none';
    },

    formatTime(seconds) {
      if (isNaN(seconds)) return '0:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    open(index, items) {
      this.state.items = items;
      this.state.currentIndex = index;
      this.state.active = true;
      this.updateContent();
      
      this.state.container.style.display = 'flex';
      this.state.container.setAttribute('aria-hidden', 'false');
      requestAnimationFrame(() => this.state.container.classList.add('active'));
      document.body.classList.add('no-scroll');
      if (window.lenis) window.lenis.stop();
    },

    close() {
      this.state.active = false;
      this.state.container.classList.remove('active');
      this.state.container.setAttribute('aria-hidden', 'true');
      const video = this.state.container.querySelector('.lightbox-video');
      if (video) { video.pause(); video.src = ''; }
      
      setTimeout(() => {
        this.state.container.style.display = 'none';
        document.body.classList.remove('no-scroll');
        if (window.lenis) window.lenis.start();
      }, 300);
    },

    nav(dir) {
      this.pauseActiveVideo();
      const len = this.state.items.length;
      this.state.currentIndex = (this.state.currentIndex + dir + len) % len;
      this.updateContent();
    },

    pauseActiveVideo() {
      const video = this.state.container.querySelector('.lightbox-video');
      if (!video) return;
      video.pause();
    },

    updateContent() {
      const item = this.state.items[this.state.currentIndex];
      if (!item) return;

      const imgEl = this.state.container.querySelector('.lightbox-image');
      const vidWrapper = this.state.container.querySelector('.lightbox-video-wrapper');
      const vidEl = this.state.container.querySelector('.lightbox-video');
      const loadingEl = this.state.container.querySelector('.lightbox-loading');
      const captionTitle = this.state.container.querySelector('.lightbox-caption-copy h3');
      const captionCategory = this.state.container.querySelector('.lightbox-caption-copy p');
      const counterEl = this.state.container.querySelector('.lightbox-counter');

      const isVid = item.type === 'video';
      
      // Reset states
      imgEl.style.opacity = '0';
      vidWrapper.style.opacity = '0';
      loadingEl.style.display = 'none';
      vidEl.pause();

      // Slight delay to allow transition visibility
      requestAnimationFrame(() => {
        if (isVid) {
          loadingEl.style.display = 'flex';
          imgEl.style.display = 'none';
          vidWrapper.style.display = 'block';
          
          vidEl.removeAttribute('poster');
          vidEl.src = item.src;
          vidEl.muted = false;
          vidEl.volume = 1;
          vidEl.controls = true;
          if (item.poster) vidEl.poster = item.poster;

          // Event listeners with cleanup would be ideal, but for simplicity:
          const onCanPlay = () => {
             loadingEl.style.display = 'none';
             vidWrapper.style.opacity = '1';
             vidEl.play().catch(() => {});
          };
          
          vidEl.oncanplay = onCanPlay;
          // If already ready (cached)
          if (vidEl.readyState >= 3) onCanPlay();

          vidEl.onerror = () => {
             loadingEl.style.display = 'none';
             console.error('Error loading video');
          };

        } else {
          vidWrapper.style.display = 'none';
          vidEl.pause();
          vidEl.src = ''; // Unload video
          
          imgEl.style.display = 'block';
          imgEl.src = item.src;
          imgEl.alt = item.title || item.category || 'Gallery preview';
          
          imgEl.onload = () => { imgEl.style.opacity = '1'; };
          if (imgEl.complete) imgEl.style.opacity = '1';
        }
        
        captionTitle.textContent = item.title || (isVid ? 'Video preview' : 'Image preview');
        captionCategory.textContent = item.category || '';
        counterEl.textContent = `${this.state.currentIndex + 1} / ${this.state.items.length}`;
      });
    }
  },

  /**
   * INTERSECTION OBSERVER ENGINE
   * Handles scroll-based pausing and lazy loading
   */
  VideoObserver: {
    observer: null,
    
    init() {
      if (this.observer) return;
      
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const video = entry.target;
          
          // Lazy Load
          if (entry.isIntersecting) {
            if (video.dataset.src && !video.src) {
              video.src = video.dataset.src;
              video.load();
            }
          }
          
          // Auto Pause when out of view
          if (!entry.isIntersecting && !video.paused) {
            video.pause();
          }
        });
      }, { rootMargin: '50px 0px', threshold: 0.1 });
    },
    
    observe(video) {
      if (!this.observer) this.init();
      this.observer.observe(video);
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
      
      // Register with Observer for lazy loading/auto-pause
      if (window.Core.VideoObserver) {
         window.Core.VideoObserver.observe(videoElement);
      }

      const play = () => {
        this.stopAllVideos(videoElement);
        
        if (videoElement.dataset.src && !videoElement.src) {
          videoElement.src = videoElement.dataset.src;
        }
        videoElement.play().catch(() => {});
      };

      const stop = () => {
        videoElement.pause();
        videoElement.currentTime = 0;
      };
      
      // Touch/Click interaction
      parent.addEventListener('click', (e) => {
        if (e.target.closest('.gallery-overlay')) return;
        videoElement.paused ? play() : stop();
      });
      
      // Desktop Hover
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      if (!isTouch) {
          parent.addEventListener('mouseenter', play);
          parent.addEventListener('mouseleave', stop);
      }
    },
    
    stopAllVideos(currentVideo) {
      document.querySelectorAll('video').forEach(video => {
        if (video !== currentVideo && !video.paused && !video.closest('#lightbox')) {
          video.pause();
        }
      });
    }
  },

  /**
   * MEDIA FACTORY
   */
  Media: {
    createItem(image, index, allItems, categoryFormatter = null) {
      const item = document.createElement('article');
      const isVideo = image.type === 'video';
      item.className = `gallery-item ${isVideo ? 'gallery-item--video' : 'gallery-item--image'} reveal-item loading`;
      item.dataset.index = index;
      if (image.category) item.dataset.category = image.category;
      if (image.order !== undefined) item.dataset.order = image.order;
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', `${image.title || 'Open preview'}${image.category ? `, ${image.category}` : ''}`);

      const openFilteredLightbox = () => {
        const fallbackItems = allItems.map((entry, entryIndex) => {
          const newItem = Object.assign({}, entry);
          newItem.originalIndex = entryIndex;
          newItem.type = entry.type || 'image';
          return newItem;
        });

        const visibleItems = (window.GalleryManager && window.GalleryManager.getVisibleData) ? window.GalleryManager.getVisibleData() : fallbackItems;
        const itemIndex = visibleItems.findIndex((entry) => entry.originalIndex === index);
        const targetIndex = itemIndex >= 0 ? itemIndex : index;

        if (window.Core && window.Core.Lightbox) {
          window.Core.Lightbox.open(targetIndex, visibleItems);
        }
      };

      const media = document.createElement(isVideo ? 'video' : 'img');
      media.className = 'gallery-image';
      
      // Add explicit opacity transition support
      media.style.opacity = '0';
      media.style.transition = 'opacity 0.6s ease-out';

      if (isVideo) {
        media.dataset.src = image.src;
        media.removeAttribute('src'); // Ensure lazy load
        media.preload = 'none'; // Requirement
        media.muted = true;
        media.loop = true;
        media.playsInline = true;
        
        if (image.poster) media.poster = image.poster;
        
        // Show poster immediately as "loaded" state
        requestAnimationFrame(() => {
          media.style.opacity = '1';
          item.classList.remove('loading');
        });

      } else {
        media.src = image.src;
        media.loading = 'lazy';
        media.alt = image.title || '';
        
        media.onload = () => {
           media.style.opacity = '1';
           item.classList.remove('loading');
           media.classList.add('loaded'); // Keep class for CSS hooks
        };
        
        if (media.complete) {
             media.style.opacity = '1';
             item.classList.remove('loading');
             media.classList.add('loaded');
        }
      }

      item.appendChild(media);

      if (isVideo && window.Core && window.Core.VideoHover) {
        window.Core.VideoHover.init(media);
      }

      if (isVideo) {
        const playIcon = document.createElement('div');
        playIcon.className = 'gallery-video-play-icon';
        playIcon.setAttribute('aria-hidden', 'true');
        playIcon.innerHTML = `
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z"></path>
          </svg>
        `;
        item.appendChild(playIcon);
      }

      const overlay = document.createElement('div');
      overlay.className = 'gallery-overlay';
      const displayCategory = categoryFormatter ? categoryFormatter(image.category) : (image.category || '');
      overlay.innerHTML = `<h3 class="gallery-title">${image.title || ''}</h3><p class="gallery-category">${displayCategory}</p>`;
      item.appendChild(overlay);

      const openItem = (e) => {
        if (!e.target.closest('video')) { // If not clicking video directly (which toggles play)
             openFilteredLightbox();
        }
      };
      
      // For video items, we want custom behavior: 
      // Clicking the video toggles play (handled in VideoHover).
      // Clicking the OVERLAY opens lightbox.
      if (isVideo) {
          item.onclick = openItem;
          overlay.onclick = (e) => {
              e.stopPropagation(); // Stop video toggle
              openFilteredLightbox();
          };
      } else {
           item.onclick = () => openFilteredLightbox();
      }

      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openFilteredLightbox();
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
    },

    /**
     * Injects shared nav and footer into sub-pages (gallery, albums, service).
     * Called from page-specific loaders to avoid duplicating markup.
     */
    injectGlobalComponents() {
      const nav = document.getElementById('main-nav');
      if (nav) {
        nav.innerHTML = `
          <div class="nav-container">
            <a href="/" class="nav-logo">SUMIT UBALE</a>
            <div class="nav-menu">
              <a href="/#portfolio" class="nav-link">Everything</a>
              <a href="/pages/albums.html?s=all" class="nav-link">Albums</a>
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
  }
};
})();
