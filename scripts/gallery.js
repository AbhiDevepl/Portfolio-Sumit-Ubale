/* ========================================
   GALLERY INTERACTIONS
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  /* ========================================
     Category Filtering
     ======================================== */
  
  const categoryButtons = document.querySelectorAll('.category-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  if (categoryButtons.length > 0) {
    categoryButtons.forEach(button => {
      button.addEventListener('click', () => {
        const category = button.dataset.category;
        
        // Update active button
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Filter gallery items
        galleryItems.forEach(item => {
          const itemCategory = item.dataset.category;
          
          if (category === 'all' || itemCategory === category) {
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
        
        // Refresh ScrollTrigger after filtering
        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 400);
      });
    });
  }
  
  /* ========================================
     Image Hover Interactions
     ======================================== */
  
  galleryItems.forEach(item => {
    const image = item.querySelector('.gallery-image');
    const overlay = item.querySelector('.gallery-overlay');
    
    if (image && overlay) {
      item.addEventListener('mouseenter', () => {
        gsap.to(image, {
          scale: 1.05,
          filter: 'grayscale(0%)',
          duration: 0.5,
          ease: "power2.out"
        });
        
        gsap.to(overlay, {
          opacity: 1,
          duration: 0.3,
          ease: "power2.out"
        });
      });
      
      item.addEventListener('mouseleave', () => {
        gsap.to(image, {
          scale: 1,
          filter: 'grayscale(0%)',
          duration: 0.5,
          ease: "power2.out"
        });
        
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.in"
        });
      });
    }
  });
  
  /* ========================================
     Lightbox / Modal (Simple Implementation)
     ======================================== */
  
  let currentImageIndex = 0;
  const lightbox = createLightbox();
  
  function createLightbox() {
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
    `;
    
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);
    
    const lightboxEl = document.getElementById('lightbox');
    const closeBtn = lightboxEl.querySelector('.lightbox-close');
    const prevBtn = lightboxEl.querySelector('.lightbox-prev');
    const nextBtn = lightboxEl.querySelector('.lightbox-next');
    const overlay = lightboxEl.querySelector('.lightbox-overlay');
    
    // Close lightbox
    closeBtn.addEventListener('click', closeLightbox);
    overlay.addEventListener('click', closeLightbox);
    
    // Navigation
    prevBtn.addEventListener('click', () => navigateLightbox(-1));
    nextBtn.addEventListener('click', () => navigateLightbox(1));
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (lightboxEl.style.display === 'flex') {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
      }
    });
    
    return lightboxEl;
  }
  
  function openLightbox(index) {
    currentImageIndex = index;
    const item = galleryItems[index];
    const image = item.querySelector('.gallery-image');
    const title = item.querySelector('.gallery-title')?.textContent || '';
    const category = item.querySelector('.gallery-category')?.textContent || '';
    
    const lightboxImage = lightbox.querySelector('.lightbox-image');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.innerHTML = `<h3>${title}</h3><p>${category}</p>`;
    
    lightbox.style.display = 'flex';
    document.body.classList.add('no-scroll');
    
    // Stop smooth scroll
    if (window.lenisScroll) {
      window.lenisScroll.stop();
    }
    
    // Animate in
    gsap.fromTo(lightbox.querySelector('.lightbox-content'), 
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.3, ease: "power2.out" }
    );
  }
  
  function closeLightbox() {
    gsap.to(lightbox.querySelector('.lightbox-content'), {
      scale: 0.9,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        lightbox.style.display = 'none';
        document.body.classList.remove('no-scroll');
        
        // Resume smooth scroll
        if (window.lenisScroll) {
          window.lenisScroll.start();
        }
      }
    });
  }
  
  function navigateLightbox(direction) {
    const visibleItems = Array.from(galleryItems).filter(item => item.style.display !== 'none');
    const currentVisibleIndex = visibleItems.indexOf(galleryItems[currentImageIndex]);
    let newIndex = currentVisibleIndex + direction;
    
    if (newIndex < 0) newIndex = visibleItems.length - 1;
    if (newIndex >= visibleItems.length) newIndex = 0;
    
    currentImageIndex = Array.from(galleryItems).indexOf(visibleItems[newIndex]);
    
    const item = galleryItems[currentImageIndex];
    const image = item.querySelector('.gallery-image');
    const title = item.querySelector('.gallery-title')?.textContent || '';
    const category = item.querySelector('.gallery-category')?.textContent || '';
    
    const lightboxImage = lightbox.querySelector('.lightbox-image');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    
    // Fade transition
    gsap.to(lightboxImage, {
      opacity: 0,
      duration: 0.2,
      onComplete: () => {
        lightboxImage.src = image.src;
        lightboxImage.alt = image.alt;
        lightboxCaption.innerHTML = `<h3>${title}</h3><p>${category}</p>`;
        
        gsap.to(lightboxImage, {
          opacity: 1,
          duration: 0.2
        });
      }
    });
  }
  
  // Click to open lightbox
  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      openLightbox(index);
    });
  });
  
  /* ========================================
     Lazy Loading Images
     ======================================== */
  
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.add('loaded');
          imageObserver.unobserve(img);
        }
      });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
  }
  
  console.log('✅ Gallery interactions initialized');
});

/* ========================================
   Lightbox Styles (Injected)
   ======================================== */

const lightboxStyles = `
  <style>
    .lightbox {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .lightbox-overlay {
      position: absolute;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.95);
    }
    
    .lightbox-content {
      position: relative;
      max-width: 90vw;
      max-height: 90vh;
      z-index: 1001;
    }
    
    .lightbox-image {
      max-width: 100%;
      max-height: 90vh;
      object-fit: contain;
    }
    
    .lightbox-close,
    .lightbox-prev,
    .lightbox-next {
      position: absolute;
      background: none;
      border: none;
      color: white;
      font-size: 3rem;
      cursor: pointer;
      padding: 1rem;
      transition: opacity 0.2s;
    }
    
    .lightbox-close {
      top: 1rem;
      right: 1rem;
    }
    
    .lightbox-prev {
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
    }
    
    .lightbox-next {
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
    }
    
    .lightbox-close:hover,
    .lightbox-prev:hover,
    .lightbox-next:hover {
      opacity: 0.7;
    }
    
    .lightbox-caption {
      position: absolute;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      color: white;
      text-align: center;
    }
    
    .lightbox-caption h3 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }
    
    .lightbox-caption p {
      font-size: 0.875rem;
      opacity: 0.8;
    }
  </style>
`;

document.head.insertAdjacentHTML('beforeend', lightboxStyles);
