/**
 * Service Page Loader
 * Dynamically populates the service.html template based on the slug
 */

class ServiceLoader {
  constructor() {
    this.servicesData = null;
    this.currentService = null;
  }

  async init() {
    const slug = this.getSlugFromURL();
    if (!slug) {
      console.warn('No service slug provided. Redirecting to home.');
      window.location.href = '/';
      return;
    }

    try {
      await this.loadData();
      this.currentService = this.servicesData.find(s => s.slug === slug);

      if (!this.currentService) {
        throw new Error('Service not found');
      }

      this.renderPage();
      this.initAnimations();
    } catch (error) {
      console.error('Error loading service:', error);
      document.body.innerHTML = `<div class="container" style="padding: 100px; text-align: center;"><h1>Service Not Found</h1><a href="/">Back to Home</a></div>`;
    }
  }

  getSlugFromURL() {
    // Supports both /service.html?service=weddings AND /weddings (if server configured)
    const params = new URLSearchParams(window.location.search);
    let slug = params.get('service') || params.get('s');
    
    // Fallback: Check path segments for /service/weddings style
    if (!slug) {
      const pathParts = window.location.pathname.split('/').filter(p => p);
      if (pathParts.length > 0 && pathParts[0] !== 'service.html') {
        slug = pathParts[pathParts.length - 1];
      }
    }
    
    return slug;
  }

  async loadData() {
    const response = await fetch('/data/services.json');
    const data = await response.json();
    this.servicesData = data.services;
  }

  renderPage() {
    const s = this.currentService;
    
    // Update Document Title
    document.title = `${s.title} — Sumit Ubale Photography`;

    // Populate Hero
    document.getElementById('service-title').textContent = s.title;
    document.getElementById('service-hero-desc').textContent = s.heroDescription;

    // Populate Story
    document.getElementById('service-story-text').textContent = s.story;

    // Populate Deliverables
    const list = document.getElementById('deliverables-list');
    list.innerHTML = '';
    s.deliverables.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      list.appendChild(li);
    });

    // Populate Random Featured Image
    this.renderRandomFeature(s);

    // Populate Gallery
    const gallery = document.getElementById('service-gallery');
    gallery.innerHTML = '';

    // Apply centered layout for cinematics or video-heavy pages
    if (s.slug === 'cinematics' || s.mediaType === 'videos') {
      gallery.classList.add('layout-centered');
    } else {
      gallery.classList.remove('layout-centered');
    }

    s.gallery.forEach((item, index) => {
      const mediaItem = document.createElement('div');
      mediaItem.className = `service-media-item ${item.type === 'video' ? 'landscape' : ''}`;
      
      let media;
      if (item.type === 'video') {
        media = document.createElement('video');
        
        // MANDATORY: No src attribute at start
        media.dataset.src = item.src;
        media.preload = 'none';
        media.muted = true;
        media.loop = true;
        media.playsInline = true;

        if (item.poster) {
          media.poster = item.poster;
        }
        
        // True lazy-load interaction state
        let isSourceSet = false;

        const handleLoad = () => {
          if (!isSourceSet) {
            media.src = media.dataset.src;
            media.load(); // Start fetching data
            isSourceSet = true;
            console.debug("Video source attached:", media.dataset.src);
          }
        };

        const handlePlay = () => {
          handleLoad();
          media.play().catch(e => console.warn("Playback prevented:", e));
        };

        const handleStop = () => {
          media.pause();
          media.currentTime = 0;
        };

        // UI Logic based on layout
        if (s.slug === 'cinematics' || s.mediaType === 'videos') {
          media.controls = true;
          
          // For theater mode, we load as soon as they hover/touch so it's ready for the click
          mediaItem.addEventListener('mouseenter', handleLoad);
          mediaItem.addEventListener('touchstart', handleLoad, { passive: true });
          
          // Also handle the case where they click the native controls before hovering
          media.addEventListener('play', handleLoad);
        } else {
          // Grid mode: Hover-to-play
          mediaItem.addEventListener('mouseenter', handlePlay);
          mediaItem.addEventListener('mouseleave', handleStop);

          // Mobile touch support
          mediaItem.addEventListener('touchstart', (e) => {
            handlePlay();
          }, { passive: true });
        }
      } else {
        media = document.createElement('img');
        media.src = item.src;
        media.alt = item.alt;
        media.loading = 'lazy';
      }

      mediaItem.appendChild(media);
      gallery.appendChild(mediaItem);
    });

    document.body.classList.remove('loading');
  }

  renderRandomFeature(service) {
    const container = document.getElementById('random-image-container');
    if (!container) return;

    // Filter only images for the feature
    const imageList = service.gallery.filter(item => item.type !== 'video');
    
    if (imageList.length > 0) {
      // Pick random image
      const randomIndex = Math.floor(Math.random() * imageList.length);
      const selectedImage = imageList[randomIndex];

      // Render image
      const img = document.createElement('img');
      img.src = selectedImage.src;
      img.alt = `Featured ${service.title}`;
      
      // Handle loading for smooth fade-in
      img.onload = () => {
        container.classList.add('loaded');
      };

      container.innerHTML = '';
      container.appendChild(img);
    } else {
      // Hide section if no images available
      container.closest('.service-featured-section').style.display = 'none';
    }
  }

  initAnimations() {
    if (window.gsap) {
      const runAnimations = () => {
        gsap.from('.stagger-reveal', {
          opacity: 0,
          y: 30,
          duration: 1,
          stagger: 0.2,
          ease: 'power3.out'
        });

        gsap.from('.service-media-item', {
          opacity: 0,
          scale: 0.95,
          duration: 0.8,
          stagger: 0.1,
          scrollTrigger: {
            trigger: '.service-gallery',
            start: 'top 80%'
          }
        });
      };

      if (document.body.classList.contains('loaded')) {
        runAnimations();
      } else {
        window.addEventListener('pageLoaded', runAnimations, { once: true });
      }
    }
  }
}

// Global Nav & Footer Injection (Single source of truth)
function injectGlobalComponents() {
  const nav = document.getElementById('main-nav');
  if (nav) {
    nav.innerHTML = `
      <div class="nav-container">
        <a href="/" class="nav-logo">SUMIT UBALE</a>
        
        <div class="nav-menu">
          <a href="/#portfolio" class="nav-link">Everything</a>
          <a href="/service.html?s=weddings" class="nav-link">Weddings</a>
          <a href="/service.html?s=cinematics" class="nav-link">Films</a>
          <a href="/#about" class="nav-link">About</a>
          <a href="/#contact" class="nav-cta">Enquire</a>
        </div>

        <button class="nav-toggle" aria-label="Toggle navigation">
          <span class="nav-toggle-line"></span>
          <span class="nav-toggle-line"></span>
        </button>
      </div>

      <div class="mobile-menu">
        <div class="mobile-menu-container">
          <nav class="mobile-nav">
            <a href="/" class="mobile-nav-link">Home <span class="mobile-nav-num">01</span></a>
            <a href="/service.html?s=weddings" class="mobile-nav-link">Weddings <span class="mobile-nav-num">02</span></a>
            <a href="/service.html?s=pre-wedding-photos" class="mobile-nav-link">Pre-Wedding <span class="mobile-nav-num">03</span></a>
            <a href="/service.html?s=cinematics" class="mobile-nav-link">Cinematics <span class="mobile-nav-num">04</span></a>
            <a href="/#contact" class="mobile-nav-link">Contact <span class="mobile-nav-num">05</span></a>
          </nav>
        </div>
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

// Ensure components are injected BEFORE Navigation script initializes
injectGlobalComponents();

document.addEventListener('DOMContentLoaded', () => {
  const loader = new ServiceLoader();
  loader.init();
});
