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
              <div class="lightbox-loading" style="display: none;">
                <div class="spinner"></div>
                <p>Loading...</p>
              </div>
              <img class="lightbox-image" src="" alt="" style="display: none;">
              <div class="lightbox-video-wrapper" style="display: none;">
                <video class="lightbox-video" playsinline></video>
                <div class="video-overlay-controls">
                  <button class="video-play-pause" aria-label="Play/Pause">
                    <svg class="play-icon" width="80" height="80" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    <svg class="pause-icon" width="80" height="80" viewBox="0 0 24 24" fill="white" style="display: none;">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  </button>
                </div>
                <div class="video-controls-bar">
                  <button class="video-control-btn play-pause-small" aria-label="Play/Pause">
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
                  <button class="video-control-btn mute-btn" aria-label="Mute/Unmute">
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
                  <button class="video-control-btn fullscreen-btn" aria-label="Fullscreen">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                    </svg>
                  </button>
                </div>
              </div>
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
      const vidWrapper = this.state.container.querySelector('.lightbox-video-wrapper');
      const vidEl = this.state.container.querySelector('.lightbox-video');
      const loadingEl = this.state.container.querySelector('.lightbox-loading');
      const capEl = this.state.container.querySelector('.lightbox-caption');

      const isVid = item.type === 'video';
      
      // Show loading state
      if (isVid) {
        loadingEl.style.display = 'flex';
      }
      
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

      fadeOut([imgEl, vidWrapper], () => {
        if (isVid) {
          imgEl.style.display = 'none';
          vidWrapper.style.display = 'block';
          vidEl.src = item.src;
          vidEl.muted = false;
          vidEl.volume = 1;
          
          // When video can play, hide loading and play
          vidEl.addEventListener('canplay', () => {
            loadingEl.style.display = 'none';
            vidEl.play();
            fadeIn(vidWrapper);
          }, { once: true });
          
          // Handle loading errors
          vidEl.addEventListener('error', () => {
            loadingEl.style.display = 'none';
            console.error('Error loading video:', item.src);
          }, { once: true });
          
        } else {
          vidWrapper.style.display = 'none';
          vidEl.pause();
          vidEl.src = '';
          imgEl.style.display = 'block';
          imgEl.src = item.src;
          loadingEl.style.display = 'none';
          fadeIn(imgEl);
        }
        capEl.innerHTML = `<h3>${item.title || ''}</h3><p>${item.category || ''}</p>`;
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
        // Stop all other videos first
        this.stopAllVideos(videoElement);
        
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
      
      // Click/touch to play/pause (toggle)
      parent.addEventListener('click', (e) => {
        // Don't toggle if clicking overlay to open lightbox
        if (e.target.closest('.gallery-overlay')) return;
        
        if (videoElement.paused) {
          play();
        } else {
          stop();
        }
      });
    },
    
    // Stop all videos except the current one
    stopAllVideos(currentVideo) {
      const allVideos = document.querySelectorAll('.gallery-item video');
      allVideos.forEach(video => {
        if (video !== currentVideo && !video.paused) {
          video.pause();
          video.currentTime = 0;
        }
      });
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
