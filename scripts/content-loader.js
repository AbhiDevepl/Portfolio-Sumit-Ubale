/**
 * Content Loader
 * Fetches portfolio data from JSON and dynamically populates the page
 */

class ContentLoader {
  constructor() {
    this.dataUrl = '/data/portfolio.json';
    this.data = null;
  }

  /**
   * Initialize content loading
   */
  async init() {
    try {
      await this.loadData();
      this.populateGallery();

      // Initialize Gallery Interactions (after content is loaded)
      if (window.GalleryManager) {
        window.GalleryManager.init();
      }

      this.populateTestimonials();
      this.populateEvents();
      this.populateAbout();
      console.log('✅ Content loaded successfully');
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Fetch JSON data
   */
  async loadData() {
    try {
      const response = await fetch(this.dataUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.data = await response.json();
      return this.data;
    } catch (error) {
      throw new Error(`Failed to load portfolio data: ${error.message}`);
    }
  }

  /**
   * Populate gallery grid with images
   */
  populateGallery() {
    const galleryGrid = document.getElementById('gallery-grid');

    if (!galleryGrid || !this.data?.portfolio?.images) {
      console.warn('Gallery grid or images data not found');
      return;
    }

    // Clear existing content
    galleryGrid.innerHTML = '';

    // Flatten images from object structure if necessary
    const rawImages = this.data.portfolio.images;
    let allImages = [];

    if (Array.isArray(rawImages)) {
      // Fallback for flat array (if still used)
      allImages = rawImages.map(img => ({ ...img, isPreview: true }));
    } else {
      // Grouped by category slug
      Object.entries(rawImages).forEach(([categorySlug, images]) => {
        // Separate videos and images for selection
        const videos = images.filter(i => i.type === 'video');
        const photos = images.filter(i => i.type !== 'video');

        // Select 1 random video for preview
        const randomVideoIndex = videos.length > 0 ? Math.floor(Math.random() * videos.length) : -1;

        images.forEach((image) => {
          let isPreview = false;

          if (image.type === 'video') {
            const vidIdx = videos.indexOf(image);
            if (vidIdx === randomVideoIndex) isPreview = true;
          } else {
            const photoIdx = photos.indexOf(image);
            if (photoIdx !== -1 && photoIdx < 3) isPreview = true;
          }

          allImages.push({
            ...image,
            category: categorySlug, // Ensure category is assigned
            isPreview: isPreview
          });
        });
      });
    }

    // Create gallery items using DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    allImages.forEach((image, index) => {
      const galleryItem = this.createGalleryItem(image, index);
      fragment.appendChild(galleryItem);
    });
    galleryGrid.appendChild(fragment);

    console.log(`✅ Loaded ${allImages.length} gallery images`);
  }

  /**
   * Create a single gallery item
   */
  createGalleryItem(image, index) {
    const item = document.createElement('div');
    // Simplified class mapping
    let sizeClass = image.aspectRatio === '16/9' ? 'landscape' : (image.aspectRatio || 'portrait');
    item.className = `gallery-item ${sizeClass}`;
    item.setAttribute('data-category', image.category);
    item.setAttribute('data-index', index);
    item.setAttribute('data-preview', image.isPreview ? 'true' : 'false');

    // Create image or video element
    let media;
    if (image.type === 'video') {
      media = document.createElement('video');

      // MANDATORY: Do NOT set src attribute initially
      media.dataset.src = image.src;

      // Initial state properties
      media.preload = 'none';
      media.muted = true;
      media.loop = true;
      media.playsInline = true;
      media.className = 'gallery-image video-preview';

      // Load poster image if provided
      if (image.poster) {
        media.poster = image.poster;
      }
    } else {
      media = document.createElement('img');
      media.src = image.src;
      media.className = 'gallery-image';
      media.loading = 'lazy';
      media.width = 800;
      media.height = image.aspectRatio === 'landscape' ? 600 : 1000;
    }
    media.alt = image.alt || image.title;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'gallery-overlay';

    // ... (overlay content)
    if (image.title) {
      const title = document.createElement('h2'); // Use semantic title
      title.className = 'gallery-title';
      title.textContent = image.title;
      overlay.appendChild(title);
    }
    if (image.category) {
      const category = document.createElement('p');
      category.className = 'gallery-category';
      category.textContent = this.getCategoryName(image.category);
      overlay.appendChild(category);
    }

    // Assemble item
    item.appendChild(media);
    item.appendChild(overlay);

    // TRUE LAZY-LOAD HOVER SYSTEM
    if (image.type === 'video') {
      let isSourceSet = false;

      const handleHoverIn = () => {
        if (!isSourceSet) {
          // Attach src only on interaction
          media.src = media.dataset.src;
          media.load(); // Explicitly trigger hardware-accelerated loading
          isSourceSet = true;
        }
        media.play().catch(e => {
          // Fallback for browsers that block autoplay
          console.debug("Autoplay pending interaction", e);
        });
      };

      const handleHoverOut = () => {
        media.pause();
        media.currentTime = 0; // Reset for next watch

        // Optional: To TRULY stop network data if the user is extremely concerned:
        // media.removeAttribute('src');
        // media.load();
        // isSourceSet = false;
        // However, standard pause is usually sufficient for chunked streams.
      };

      // Desktop
      item.addEventListener('mouseenter', handleHoverIn);
      item.addEventListener('mouseleave', handleHoverOut);

      // Mobile / Touch (Tap to play)
      item.addEventListener('touchstart', (e) => {
        if (!isSourceSet) handleHoverIn();
      }, { passive: true });

      item.addEventListener('click', (e) => {
        // Stop bubbling on mobile to prevent Lightbox opening while just trying to play
        if (window.matchMedia('(max-width: 768px)').matches) {
          if (media.paused) {
            handleHoverIn();
            e.stopPropagation();
            e.preventDefault();
          }
        }
      });
    }

    return item;
  }

  /**
   * Get category display name
   */
  getCategoryName(slug) {
    const category = this.data?.portfolio?.categories?.find(cat => cat.slug === slug);
    return category ? category.name : slug;
  }

  /**
   * Populate testimonials section
   */
  populateTestimonials() {
    const testimonialsContainer = document.getElementById('testimonials-container');

    if (!testimonialsContainer || !this.data?.testimonials) {
      console.warn('Testimonials container or data not found');
      return;
    }

    // Clear existing content
    testimonialsContainer.innerHTML = '';

    // Create testimonial items using DocumentFragment
    const fragmentTestimonials = document.createDocumentFragment();
    this.data.testimonials.forEach(testimonial => {
      const testimonialItem = this.createTestimonialItem(testimonial);
      fragmentTestimonials.appendChild(testimonialItem);
    });
    testimonialsContainer.appendChild(fragmentTestimonials);

    console.log(`✅ Loaded ${this.data.testimonials.length} testimonials`);
  }

  /**
   * Populate events section
   */
  populateEvents() {
    const eventsGrid = document.querySelector('.events-grid');

    if (!eventsGrid || !this.data?.recentEvents) {
      console.warn('Events grid or data not found');
      return;
    }

    // Clear existing content
    eventsGrid.innerHTML = '';

    // Create event items using DocumentFragment
    const fragmentEvents = document.createDocumentFragment();
    this.data.recentEvents.forEach((event, index) => {
      const item = document.createElement('div');
      item.className = 'event-item';

      const img = document.createElement('img');
      img.src = event.src;
      img.alt = event.alt || event.title;
      img.className = 'event-image';
      img.loading = 'lazy';

      if (event.aspectRatio) {
        img.style.aspectRatio = event.aspectRatio;
      }

      const overlay = document.createElement('div');
      overlay.className = 'gallery-overlay';

      const title = document.createElement('h3');
      title.className = 'gallery-title';
      title.textContent = event.title;

      const category = document.createElement('p');
      category.className = 'gallery-category';
      category.textContent = event.category;

      overlay.appendChild(title);
      overlay.appendChild(category);

      item.appendChild(img);
      item.appendChild(overlay);

      fragmentEvents.appendChild(item);
    });
    eventsGrid.appendChild(fragmentEvents);

    console.log(`✅ Loaded ${this.data.recentEvents.length} events`);
  }

  /**
   * Create a single testimonial item
   */
  createTestimonialItem(testimonial) {
    const item = document.createElement('div');
    item.className = 'testimonial-item';

    // Quote
    const quote = document.createElement('blockquote');
    quote.className = 'testimonial-quote';
    quote.textContent = `"${testimonial.quote}"`;
    item.appendChild(quote);

    // Author info
    const author = document.createElement('div');
    author.className = 'testimonial-author';

    const name = document.createElement('p');
    name.className = 'testimonial-name';
    name.textContent = testimonial.name;
    author.appendChild(name);

    if (testimonial.role) {
      const role = document.createElement('p');
      role.className = 'testimonial-role';
      role.textContent = testimonial.role;
      author.appendChild(role);
    }

    item.appendChild(author);

    return item;
  }

  /**
   * Populate about section with social proof
   */
  populateAbout() {
    // Populate publications
    const publicationsContainer = document.getElementById('publications');
    if (publicationsContainer && this.data?.socialProof?.publications) {
      publicationsContainer.innerHTML = '';
      this.data.socialProof.publications.forEach(pub => {
        const pubItem = document.createElement('span');
        pubItem.className = 'publication-item';
        pubItem.textContent = pub;
        publicationsContainer.appendChild(pubItem);
      });
    }

    // Populate awards
    const awardsContainer = document.getElementById('awards');
    if (awardsContainer && this.data?.socialProof?.awards) {
      awardsContainer.innerHTML = '';
      this.data.socialProof.awards.forEach(award => {
        const awardItem = document.createElement('li');
        awardItem.textContent = award;
        awardsContainer.appendChild(awardItem);
      });
    }

    // Populate clients
    const clientsContainer = document.getElementById('clients');
    if (clientsContainer && this.data?.socialProof?.clients) {
      clientsContainer.innerHTML = '';
      this.data.socialProof.clients.forEach(client => {
        const clientItem = document.createElement('span');
        clientItem.className = 'client-item';
        clientItem.textContent = client;
        clientsContainer.appendChild(clientItem);
      });
    }

    console.log('✅ Loaded social proof data');
  }

  /**
   * Handle errors
   */
  handleError(error) {
    console.error('❌ Content loading error:', error);

    // Show user-friendly error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'content-error';
    errorMessage.innerHTML = `
      <p>Unable to load portfolio content. Please try refreshing the page.</p>
      <p class="error-details">${error.message}</p>
    `;

    // Try to insert error in gallery
    const galleryGrid = document.getElementById('gallery-grid');
    if (galleryGrid) {
      galleryGrid.innerHTML = '';
      galleryGrid.appendChild(errorMessage);
    }

    // Optionally show fallback content
    this.showFallbackContent();
  }

  /**
   * Show fallback content if data fails to load
   */
  showFallbackContent() {
    console.log('📦 Showing fallback content');

    // You can add static fallback content here
    // For example, show a message or load from localStorage
  }

  /**
   * Get data (for external use)
   */
  getData() {
    return this.data;
  }
}

// Initialize content loader when DOM is ready
let contentLoader;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContentLoader);
} else {
  initContentLoader();
}

function initContentLoader() {
  contentLoader = new ContentLoader();
  contentLoader.init();
}

// Export for use in other scripts
window.contentLoader = contentLoader;
