/**
 * Portfolio Gallery Component
 *
 * A modern, mobile-first gallery with fullscreen lightbox modal.
 * Supports images and videos with keyboard navigation and touch swipe.
 *
 * @version 1.0.0
 * @author Claude
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? (module.exports = factory())
    : typeof define === 'function' && define.amd
    ? define(factory)
    : ((global = typeof globalThis !== 'undefined' ? globalThis : global || self), (global.PortfolioGallery = factory()));
})(this, function () {
  'use strict';

  /**
   * PortfolioGallery Class
   *
   * @param {string|HTMLElement} container - Container element or ID
   * @param {Object} options - Configuration options
   * @param {Array} options.items - Gallery items data
   * @param {Function} options.onItemClick - Callback when item is clicked
   * @param {string} options.modalClass - CSS class for modal
   */
  class PortfolioGallery {
    constructor(container, options = {}) {
      this.options = {
        items: [],
        onItemClick: null,
        modalClass: 'pg-modal',
        ...options,
      };

      this.container = typeof container === 'string' ? document.getElementById(container) : container;

      if (!this.container) {
        console.error('PortfolioGallery: Container not found');
        return;
      }

      this.currentIndex = 0;
      this.touchStartX = 0;
      this.touchEndX = 0;
      this.isModalOpen = false;
      this.currentVideo = null;
      this.observers = [];

      this.init();
    }

    /**
     * Initialize the gallery
     */
    init() {
      this.createGalleryHTML();
      this.renderGallery();
      this.setupModal();
      this.setupKeyboardNavigation();
      this.setupTouchSwipe();
    }

    /**
     * Create base HTML structure
     */
    createGalleryHTML() {
      // Add class to container
      this.container.classList.add('pg-container');

      // Create header
      const header = document.createElement('header');
      header.className = 'pg-header';
      header.innerHTML = `
        <h1 class="pg-title">Portfolio</h1>
        <p class="pg-subtitle">Capturing moments that last forever</p>
      `;

      // Create gallery grid
      const grid = document.createElement('div');
      grid.className = 'pg-grid';
      grid.id = 'pg-grid-' + this.generateId();

      this.container.appendChild(header);
      this.container.appendChild(grid);
      this.grid = grid;

      // Create modal
      this.createModal();
    }

    /**
     * Generate unique ID
     */
    generateId() {
      return Math.random().toString(36).substr(2, 9);
    }

    /**
     * Create modal HTML
     */
    createModal() {
      const modal = document.createElement('div');
      modal.className = 'pg-modal';
      modal.id = 'pg-modal-' + this.generateId();
      modal.setAttribute('aria-hidden', 'true');
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');

      modal.innerHTML = `
        <div class="pg-modal-content">
          <button class="pg-modal-close" aria-label="Close preview">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <button class="pg-modal-nav pg-modal-nav--prev" aria-label="Previous item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          <button class="pg-modal-nav pg-modal-nav--next" aria-label="Next item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>

          <div class="pg-modal-media">
            <div class="pg-modal-loading">
              <div class="pg-spinner"></div>
            </div>
          </div>

          <div class="pg-modal-caption">
            <h3 id="pg-modal-title-${this.generateId()}"></h3>
            <p id="pg-modal-category-${this.generateId()}"></p>
          </div>

          <div class="pg-modal-counter">
            <span class="pg-current-index">1</span> / <span class="pg-total-count">${this.options.items.length}</span>
          </div>

          <div class="pg-swipe-hint">Swipe to navigate</div>
        </div>
      `;

      document.body.appendChild(modal);
      this.modal = modal;

      // Cache DOM references
      this.modalMedia = modal.querySelector('.pg-modal-media');
      this.modalTitle = modal.querySelector('.pg-modal-caption h3');
      this.modalCategory = modal.querySelector('.pg-modal-caption p');
      this.modalCounter = modal.querySelector('.pg-current-index');
      this.modalTotal = modal.querySelector('.pg-total-count');
    }

    /**
     * Render gallery items
     */
    renderGallery() {
      const fragment = document.createDocumentFragment();

      this.options.items.forEach((item, index) => {
        const galleryItem = this.createGalleryItem(item, index);
        fragment.appendChild(galleryItem);
      });

      this.grid.appendChild(fragment);

      // Update total count
      if (this.modalTotal) {
        this.modalTotal.textContent = this.options.items.length;
      }
    }

    /**
     * Create a single gallery item
     */
    createGalleryItem(item, index) {
      const div = document.createElement('div');
      div.className = 'pg-item pg-item--loading';
      div.setAttribute('data-index', index);
      div.setAttribute('tabindex', '0');
      div.setAttribute('role', 'button');
      div.setAttribute('aria-label', `View ${item.title || 'item'}`);

      // Category tag
      if (item.category) {
        const categoryTag = document.createElement('span');
        categoryTag.className = 'pg-category';
        categoryTag.textContent = item.category;
        div.appendChild(categoryTag);
      }

      if (item.type === 'video') {
        // Video thumbnail with poster
        const video = document.createElement('video');
        video.className = 'pg-media';
        video.setAttribute('poster', item.poster || '');
        video.setAttribute('preload', 'metadata');
        video.muted = true;
        video.playsInline = true;
        video.loading = 'lazy';

        // Play icon overlay
        const overlay = document.createElement('div');
        overlay.className = 'pg-video-overlay';
        overlay.innerHTML = `
          <div class="pg-play-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        `;
        div.appendChild(overlay);

        // Duration badge
        if (item.duration) {
          const duration = document.createElement('span');
          duration.className = 'pg-duration';
          duration.textContent = item.duration;
          div.appendChild(duration);
        }

        // Lazy load video
        this.observeVideoLoad(video, item.src, div);
        div.appendChild(video);
      } else {
        // Image
        const img = document.createElement('img');
        img.className = 'pg-media';
        img.setAttribute('src', item.src);
        img.setAttribute('alt', item.title || '');
        img.setAttribute('loading', 'lazy');

        img.onload = () => {
          div.classList.remove('pg-item--loading');
          div.classList.add('pg-item--loaded');
        };

        img.onerror = () => {
          div.classList.remove('pg-item--loading');
          div.style.backgroundColor = '#fee2e2';
        };

        div.appendChild(img);
      }

      // Click handler
      div.addEventListener('click', () => this.openModal(index));
      div.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.openModal(index);
        }
      });

      return div;
    }

    /**
     * Observe video for lazy loading
     */
    observeVideoLoad(videoElement, src, container) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              videoElement.src = src;
              videoElement.load();
              container.classList.remove('pg-item--loading');
              container.classList.add('pg-item--loaded');
              observer.unobserve(videoElement);
            }
          });
        },
        { rootMargin: '50px' }
      );

      observer.observe(videoElement);
      this.observers.push(observer);
    }

    /**
     * Setup modal event listeners
     */
    setupModal() {
      // Close button
      this.modal.querySelector('.pg-modal-close').addEventListener('click', () => this.closeModal());

      // Navigation buttons
      this.modal.querySelector('.pg-modal-nav--prev').addEventListener('click', () => this.navigate(-1));
      this.modal.querySelector('.pg-modal-nav--next').addEventListener('click', () => this.navigate(1));

      // Close on backdrop click
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.closeModal();
        }
      });
    }

    /**
     * Open modal at index
     */
    openModal(index) {
      this.currentIndex = index;
      this.isModalOpen = true;

      document.body.classList.add('pg-modal-open');
      this.modal.classList.add('pg-modal--active');
      this.modal.setAttribute('aria-hidden', 'false');

      // Trigger callback
      if (typeof this.options.onItemClick === 'function') {
        this.options.onItemClick(this.options.items[index], index);
      }

      this.loadModalContent();
    }

    /**
     * Close modal
     */
    closeModal() {
      this.isModalOpen = false;

      // Pause any playing video
      if (this.currentVideo) {
        this.currentVideo.pause();
        this.currentVideo = null;
      }

      document.body.classList.remove('pg-modal-open');
      this.modal.classList.remove('pg-modal--active');
      this.modal.setAttribute('aria-hidden', 'true');

      // Clear content after animation
      setTimeout(() => {
        if (!this.isModalOpen) {
          this.modalMedia.innerHTML = `
            <div class="pg-modal-loading">
              <div class="pg-spinner"></div>
            </div>
          `;
        }
      }, 300);
    }

    /**
     * Load content in modal
     */
    loadModalContent() {
      const item = this.options.items[this.currentIndex];

      if (!item) return;

      // Update counter and caption
      this.modalCounter.textContent = this.currentIndex + 1;
      this.modalTitle.textContent = item.title || '';
      this.modalCategory.textContent = item.category || '';

      // Clear previous content
      this.modalMedia.innerHTML = `
        <div class="pg-modal-loading">
          <div class="pg-spinner"></div>
        </div>
      `;

      if (item.type === 'video') {
        this.loadVideo(item);
      } else {
        this.loadImage(item);
      }
    }

    /**
     * Load image in modal
     */
    loadImage(item) {
      const img = document.createElement('img');
      img.className = 'pg-modal-image';
      img.src = item.fullSrc || item.src;
      img.alt = item.title || '';

      img.onload = () => {
        this.modalMedia.innerHTML = '';
        this.modalMedia.appendChild(img);
      };

      img.onerror = () => {
        this.showError('Failed to load image');
      };
    }

    /**
     * Load video in modal
     */
    loadVideo(item) {
      const video = document.createElement('video');
      video.className = 'pg-modal-video';
      video.src = item.src;
      video.controls = true;
      video.autoplay = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('poster', item.poster || '');

      video.onloadeddata = () => {
        this.modalMedia.innerHTML = '';
        this.modalMedia.appendChild(video);
        this.currentVideo = video;
      };

      video.onerror = () => {
        this.showError('Failed to load video');
      };
    }

    /**
     * Show error message
     */
    showError(message) {
      this.modalMedia.innerHTML = `
        <div class="pg-modal-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>${message}</p>
        </div>
      `;
    }

    /**
     * Navigate to next/previous item
     */
    navigate(direction) {
      // Pause current video before navigating
      if (this.currentVideo) {
        this.currentVideo.pause();
        this.currentVideo = null;
      }

      this.currentIndex = (this.currentIndex + direction + this.options.items.length) % this.options.items.length;
      this.loadModalContent();
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
      document.addEventListener('keydown', (e) => {
        if (!this.isModalOpen) return;

        switch (e.key) {
          case 'Escape':
            this.closeModal();
            break;
          case 'ArrowLeft':
            e.preventDefault();
            this.navigate(-1);
            break;
          case 'ArrowRight':
            e.preventDefault();
            this.navigate(1);
            break;
        }
      });
    }

    /**
     * Setup touch swipe
     */
    setupTouchSwipe() {
      const modalContent = this.modal.querySelector('.pg-modal-content');

      modalContent.addEventListener('touchstart', (e) => {
        this.touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      modalContent.addEventListener('touchend', (e) => {
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe();
      }, { passive: true });

      // Add touched class for opacity change
      modalContent.addEventListener('touchstart', () => {
        this.modal.classList.add('pg-modal--touched');
      }, { once: true });
    }

    /**
     * Handle swipe gesture
     */
    handleSwipe() {
      const swipeThreshold = 50;
      const diff = this.touchStartX - this.touchEndX;

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          // Swiped left - go next
          this.navigate(1);
        } else {
          // Swiped right - go previous
          this.navigate(-1);
        }
      }
    }

    /**
     * Update gallery items
     */
    setItems(items) {
      this.options.items = items;
      this.grid.innerHTML = '';
      this.renderGallery();
    }

    /**
     * Destroy the gallery
     */
    destroy() {
      // Clean up observers
      this.observers.forEach((observer) => observer.disconnect());
      this.observers = [];

      // Remove modal
      if (this.modal && this.modal.parentNode) {
        this.modal.parentNode.removeChild(this.modal);
      }

      // Clear container
      this.container.innerHTML = '';

      // Remove body class
      document.body.classList.remove('pg-modal-open');
    }
  }

  return PortfolioGallery;
});
