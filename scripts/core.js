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
                <p>Loading...</p>
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
      const self = this;
      const { container } = this.state;
      container.querySelector('.lightbox-close').onclick = function() { self.close(); };
      container.querySelector('.lightbox-overlay').onclick = function() { self.close(); };
      container.querySelector('.lightbox-prev').onclick = function() { self.nav(-1); };
      container.querySelector('.lightbox-next').onclick = function() { self.nav(1); };
      this.bindTouch();

      // Video controls
      this.bindVideoControls();

      document.addEventListener('keydown', function(e) {
        if (!self.state.active) return;
        if (e.key === 'Escape') self.close();
        if (e.key === 'ArrowLeft') self.nav(-1);
        if (e.key === 'ArrowRight') self.nav(1);
        if (e.key === ' ') {
          e.preventDefault();
          self.togglePlayPause();
        }
      });
    },

    bindTouch() {
      const self = this;
      const mediaContainer = this.state.container.querySelector('.lightbox-media-container');
      if (!mediaContainer) return;

      mediaContainer.addEventListener('touchstart', function(e) {
        if (!self.state.active || e.touches.length !== 1) return;
        self.state.touchActive = true;
        self.state.touchStartX = e.touches[0].clientX;
        self.state.touchCurrentX = e.touches[0].clientX;
      }, { passive: true });

      mediaContainer.addEventListener('touchmove', function(e) {
        if (!self.state.touchActive || e.touches.length !== 1) return;
        self.state.touchCurrentX = e.touches[0].clientX;
      }, { passive: true });

      mediaContainer.addEventListener('touchend', function() {
        if (!self.state.touchActive) return;

        const deltaX = self.state.touchCurrentX - self.state.touchStartX;
        self.state.touchActive = false;

        if (Math.abs(deltaX) < 48) return;
        self.nav(deltaX < 0 ? 1 : -1);
      });
    },

    bindVideoControls() {
      const self = this;
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
      playPauseOverlay.onclick = function() { self.togglePlayPause(); };
      playPauseSmall.onclick = function() { self.togglePlayPause(); };
      
      // Click video to play/pause
      video.onclick = function() { self.togglePlayPause(); };

      // Progress bar
      video.addEventListener('timeupdate', function() {
        const percent = (video.currentTime / video.duration) * 100;
        progress.value = percent;
        progressFilled.style.width = percent + '%';
        timeDisplay.textContent = self.formatTime(video.currentTime) + ' / ' + self.formatTime(video.duration);
      });

      progress.addEventListener('input', function(e) {
        const time = (e.target.value / 100) * video.duration;
        video.currentTime = time;
      });

      // Mute/Unmute
      muteBtn.onclick = function() {
        video.muted = !video.muted;
        self.updateMuteButton();
      };

      // Volume
      volumeSlider.addEventListener('input', function(e) {
        video.volume = e.target.value / 100;
        video.muted = video.volume === 0;
        self.updateMuteButton();
      });

      // Playback speed
      speedSelect.addEventListener('change', function(e) {
        video.playbackRate = parseFloat(e.target.value);
      });

      // Fullscreen
      fullscreenBtn.onclick = function() {
        if (wrapper.requestFullscreen) {
          wrapper.requestFullscreen();
        } else if (wrapper.webkitRequestFullscreen) {
          wrapper.webkitRequestFullscreen();
        } else if (wrapper.msRequestFullscreen) {
          wrapper.msRequestFullscreen();
        }
      };

      // Update play/pause icons
      video.addEventListener('play', function() { self.updatePlayPauseIcons(true); });
      video.addEventListener('pause', function() { self.updatePlayPauseIcons(false); });

      // Show/hide controls
      let controlsTimeout;
      const showControls = function() {
        container.querySelector('.video-controls-bar').style.opacity = '1';
        clearTimeout(controlsTimeout);
        controlsTimeout = setTimeout(function() {
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
      
      playIcons.forEach(function(icon) { icon.style.display = isPlaying ? 'none' : 'block'; });
      pauseIcons.forEach(function(icon) { icon.style.display = isPlaying ? 'block' : 'none'; });
      
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
      return mins + ':' + secs.toString().padStart(2, '0');
    },

    open(index, items) {
      this.state.items = items;
      this.state.currentIndex = index;
      this.state.active = true;
      this.updateContent();
      
      this.state.container.style.display = 'flex';
      this.state.container.setAttribute('aria-hidden', 'false');
      const self = this;
      requestAnimationFrame(function() { self.state.container.classList.add('active'); });
      document.body.classList.add('no-scroll');
      if (window.lenis) window.lenis.stop();
    },

    close() {
      const self = this;
      this.state.active = false;
      this.state.container.classList.remove('active');
      this.state.container.setAttribute('aria-hidden', 'true');
      const video = this.state.container.querySelector('.lightbox-video');
      if (video) { video.pause(); video.src = ''; }
      
      setTimeout(function() {
        self.state.container.style.display = 'none';
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
      const self = this;
      
      // Reset states
      imgEl.style.opacity = '0';
      vidWrapper.style.opacity = '0';
      loadingEl.style.display = 'none';
      vidEl.pause();

      // Slight delay to allow transition visibility
      requestAnimationFrame(function() {
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

          const onCanPlay = function() {
             loadingEl.style.display = 'none';
             vidWrapper.style.opacity = '1';
             vidEl.play().catch(function() {});
          };
          
          vidEl.oncanplay = onCanPlay;
          if (vidEl.readyState >= 3) onCanPlay();

          vidEl.onerror = function() {
             loadingEl.style.display = 'none';
             console.error('Error loading video');
          };

        } else {
          vidWrapper.style.display = 'none';
          vidEl.pause();
          vidEl.src = '';
          
          imgEl.style.display = 'block';
          imgEl.src = item.src;
          imgEl.alt = item.title || item.category || 'Gallery preview';
          
          imgEl.onload = function() { imgEl.style.opacity = '1'; };
          if (imgEl.complete) imgEl.style.opacity = '1';
        }
        
        captionTitle.textContent = item.title || (isVid ? 'Video preview' : 'Image preview');
        captionCategory.textContent = item.category || '';
        counterEl.textContent = (self.state.currentIndex + 1) + ' / ' + self.state.items.length;
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
      
      this.observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          const video = entry.target;
          
          if (entry.isIntersecting) {
            if (video.dataset.src && !video.src) {
              video.src = video.dataset.src;
              video.load();
            }
          }
          
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
      
      if (window.Core && window.Core.VideoObserver) {
         window.Core.VideoObserver.observe(videoElement);
      }

      const self = this;
      const play = function() {
        self.stopAllVideos(videoElement);
        
        if (videoElement.dataset.src && !videoElement.src) {
          videoElement.src = videoElement.dataset.src;
        }
        videoElement.play().catch(function() {});
      };

      const stop = function() {
        videoElement.pause();
        videoElement.currentTime = 0;
      };
      
      parent.addEventListener('click', function(e) {
        if (e.target.closest('.gallery-overlay')) return;
        videoElement.paused ? play() : stop();
      });
      
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      if (!isTouch) {
          parent.addEventListener('mouseenter', play);
          parent.addEventListener('mouseleave', stop);
      }
    },
    
    stopAllVideos(currentVideo) {
      document.querySelectorAll('video').forEach(function(video) {
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
    createItem(image, index, allItems, categoryFormatter) {
      const item = document.createElement('article');
      const isVideo = image.type === 'video';
      item.className = 'gallery-item ' + (isVideo ? 'gallery-item--video' : 'gallery-item--image') + ' reveal-item loading';
      item.dataset.index = index;
      if (image.category) item.dataset.category = image.category;
      if (image.order !== undefined) item.dataset.order = image.order;
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', (image.title || 'Open preview') + (image.category ? ', ' + image.category : ''));

      const openFilteredLightbox = function() {
        const fallbackItems = allItems.map(function(entry, entryIndex) {
          return Object.assign({}, entry, {
            originalIndex: entryIndex,
            type: entry.type || 'image'
          });
        });

        const visibleItems = (window.GalleryManager && window.GalleryManager.getVisibleData) ? window.GalleryManager.getVisibleData() : fallbackItems;
        const itemIndex = visibleItems.findIndex(function(entry) { return entry.originalIndex === index; });
        const targetIndex = itemIndex >= 0 ? itemIndex : index;

        if (window.Core && window.Core.Lightbox) {
          window.Core.Lightbox.open(targetIndex, visibleItems);
        }
      };

      const media = document.createElement(isVideo ? 'video' : 'img');
      media.className = 'gallery-image';
      
      media.style.opacity = '0';
      media.style.transition = 'opacity 0.6s ease-out';

      if (isVideo) {
        media.dataset.src = image.src;
        media.removeAttribute('src');
        media.preload = 'none';
        media.muted = true;
        media.loop = true;
        media.playsInline = true;
        
        if (image.poster) media.poster = image.poster;
        
        requestAnimationFrame(function() {
          media.style.opacity = '1';
          item.classList.remove('loading');
        });

      } else {
        media.src = image.src;
        media.loading = 'lazy';
        media.alt = image.title || '';
        
        media.onload = function() {
           media.style.opacity = '1';
           item.classList.remove('loading');
           media.classList.add('loaded');
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
      overlay.innerHTML = '<h3 class="gallery-title">' + (image.title || '') + '</h3><p class="gallery-category">' + displayCategory + '</p>';
      item.appendChild(overlay);

      const openItem = function(e) {
        if (!e.target.closest('video')) {
             openFilteredLightbox();
        }
      };
      
      if (isVideo) {
          item.onclick = openItem;
          overlay.onclick = function(e) {
              e.stopPropagation();
              openFilteredLightbox();
          };
      } else {
           item.onclick = function() { openFilteredLightbox(); };
      }

      item.addEventListener('keydown', function(e) {
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
      items.forEach(function(item, idx) {
        const rendered = renderer(item, idx);
        if (rendered) fragment.appendChild(rendered);
      });
      return fragment;
    },

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
