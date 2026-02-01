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

    // Create gallery items
    this.data.portfolio.images.forEach((image, index) => {
      const galleryItem = this.createGalleryItem(image, index);
      galleryGrid.appendChild(galleryItem);
    });

    console.log(`✅ Loaded ${this.data.portfolio.images.length} gallery images`);
  }

  /**
   * Create a single gallery item
   */
  createGalleryItem(image, index) {
    const item = document.createElement('div');
    item.className = `gallery-item ${image.aspectRatio || 'portrait'}`;
    item.setAttribute('data-category', image.category);
    item.setAttribute('data-index', index);

    // Create image element
    const img = document.createElement('img');
    img.src = image.src;
    img.alt = image.alt || image.title;
    img.className = 'gallery-image';
    img.loading = 'lazy';
    img.width = 800;
    img.height = image.aspectRatio === 'landscape' ? 600 : 1000;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'gallery-overlay';

    // Create title
    if (image.title) {
      const title = document.createElement('h3');
      title.className = 'gallery-title';
      title.textContent = image.title;
      overlay.appendChild(title);
    }

    // Create category
    if (image.category) {
      const category = document.createElement('p');
      category.className = 'gallery-category';
      category.textContent = this.getCategoryName(image.category);
      overlay.appendChild(category);
    }

    // Assemble item
    item.appendChild(img);
    item.appendChild(overlay);

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

    // Create testimonial items
    this.data.testimonials.forEach(testimonial => {
      const testimonialItem = this.createTestimonialItem(testimonial);
      testimonialsContainer.appendChild(testimonialItem);
    });

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

    // Create event items (reusing gallery item structure for consistency)
    this.data.recentEvents.forEach((event, index) => {
      // Use createGalleryItem styling/structure but appended to events grid
      // We manually recreate it here to ensure specific event classes if needed
      // or we can reuse createGalleryItem if we want identical behavior.
      // User asked for "like Portfolio", so let's stick to the Project Card style 
      // or the Gallery Item style. The HTML had .event-item structure.
      // Let's use the .event-item structure but make it dynamic.
      
      const item = document.createElement('div');
      item.className = 'event-item';
      
      const img = document.createElement('img');
      img.src = event.src;
      img.alt = event.alt || event.title;
      img.className = 'event-image';
      img.loading = 'lazy';
      
      // Maintain aspect ratio via CSS or style if variable
      // The CSS has :nth-child rules for aspect ratios, but data has valid aspect ratios.
      // We can override via style if needed, or let CSS handle it.
      // Let's adhere to the data if provided.
      if (event.aspectRatio) {
        img.style.aspectRatio = event.aspectRatio;
      }
      
      // Optional: Add overlay content like portfolio if desired?
      // The original HTML structure for events was just image.
      // "make same as a Recent Events like Portfolio" implies showing title/category.
      // Let's add an overlay similar to gallery items.
      
      const overlay = document.createElement('div');
      overlay.className = 'gallery-overlay'; // Reuse gallery overlay class
      
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
      
      // Add click listener for lightbox if we want events to open there too
      // We need to add it to the GalleryManager access if we do that.
      // For now, let's just make it visual.
      
      eventsGrid.appendChild(item);
    });
    
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
