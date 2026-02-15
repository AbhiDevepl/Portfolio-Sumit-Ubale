/* ========================================
   CONTACT FORM HANDLER
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  const contactForm = document.querySelector('.contact-form');
  
  if (!contactForm) {
    console.warn('⚠️ Contact form not found');
    return;
  }
  
  const nameInput = contactForm.querySelector('input[name="name"]');
  const emailInput = contactForm.querySelector('input[name="email"]');
  const messageInput = contactForm.querySelector('textarea[name="message"]');
  const submitButton = contactForm.querySelector('.form-submit');
  
  /* ========================================
     Form Validation
     ======================================== */
  
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  
  function validateForm() {
    let isValid = true;
    const errors = [];
    
    // Validate name
    if (!nameInput.value.trim()) {
      errors.push('Name is required');
      isValid = false;
      showFieldError(nameInput, 'Please enter your name');
    } else {
      clearFieldError(nameInput);
    }
    
    // Validate email
    if (!emailInput.value.trim()) {
      errors.push('Email is required');
      isValid = false;
      showFieldError(emailInput, 'Please enter your email');
    } else if (!validateEmail(emailInput.value.trim())) {
      errors.push('Invalid email format');
      isValid = false;
      showFieldError(emailInput, 'Please enter a valid email');
    } else {
      clearFieldError(emailInput);
    }
    
    // Validate message
    if (!messageInput.value.trim()) {
      errors.push('Message is required');
      isValid = false;
      showFieldError(messageInput, 'Please enter a message');
    } else if (messageInput.value.trim().length < 10) {
      errors.push('Message too short');
      isValid = false;
      showFieldError(messageInput, 'Message must be at least 10 characters');
    } else {
      clearFieldError(messageInput);
    }
    
    return isValid;
  }
  
  function showFieldError(field, message) {
    // Remove existing error
    clearFieldError(field);
    
    // Add error class
    field.classList.add('error');
    
    // Create error message
    const errorEl = document.createElement('span');
    errorEl.className = 'field-error';
    errorEl.textContent = message;
    errorEl.style.cssText = `
      display: block;
      color: ${window.SiteColors.state.error};
      font-size: 0.75rem;
      margin-top: 0.25rem;
      font-family: var(--font-sans);
    `;
    
    field.parentElement.appendChild(errorEl);
    
    // Animate error in
    gsap.from(errorEl, {
      opacity: 0,
      y: -5,
      duration: 0.3,
      ease: "power2.out"
    });
  }
  
  function clearFieldError(field) {
    field.classList.remove('error');
    const errorEl = field.parentElement.querySelector('.field-error');
    if (errorEl) {
      errorEl.remove();
    }
  }
  
  /* ========================================
     Input Focus Animations
     ======================================== */
  
  const formInputs = contactForm.querySelectorAll('.form-input, .form-textarea');
  
  formInputs.forEach(input => {
    input.addEventListener('focus', () => {
      gsap.to(input, {
        borderColor: 'var(--accent)',
        duration: 0.3,
        ease: "power2.out"
      });
    });
    
    input.addEventListener('blur', () => {
      if (!input.value) {
        gsap.to(input, {
          borderColor: 'rgba(255,255,255,0.05)',
          duration: 0.3,
          ease: "power2.out"
        });
      }
    });
  });
  
  /* ========================================
     Form Submission
     ======================================== */
  
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      // Shake animation for invalid form
      gsap.fromTo(contactForm, 
        { x: -10 },
        { 
          x: 0, 
          duration: 0.1, 
          repeat: 5, 
          yoyo: true,
          ease: "power1.inOut"
        }
      );
      return;
    }
    
    // Disable submit button
    submitButton.disabled = true;
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    
    // Collect form data
    const formData = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      message: messageInput.value.trim(),
      timestamp: new Date().toISOString()
    };
    
    try {
      // TODO: Replace with your actual form submission endpoint
      // Example: FormSpree, Netlify Forms, or custom backend
      
      // Simulated submission (replace with actual API call)
      await simulateFormSubmission(formData);
      
      // Success feedback
      showSuccessMessage();
      
      // Reset form
      contactForm.reset();
      
    } catch (error) {
      console.error('Form submission error:', error);
      showErrorMessage();
    } finally {
      // Re-enable submit button
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });
  
  /* ========================================
     Simulated Form Submission (Replace with real API)
     ======================================== */
  
  async function simulateFormSubmission(data) {
    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Form data:', data);
        resolve();
      }, 1500);
    });
  }
  
  /* ========================================
     Example: Real Form Submission with FormSpree
     ======================================== */
  
  /*
  async function submitToFormSpree(data) {
    const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Form submission failed');
    }
    
    return response.json();
  }
  */
  
  /* ========================================
     Success/Error Messages
     ======================================== */
  
  function showSuccessMessage() {
    const messageEl = createMessageElement(
      'Thank you! Your message has been sent successfully.',
      'success'
    );
    
    contactForm.parentElement.insertBefore(messageEl, contactForm);
    
    gsap.from(messageEl, {
      opacity: 0,
      y: -20,
      duration: 0.5,
      ease: "power2.out"
    });
    
    // Remove after 5 seconds
    setTimeout(() => {
      gsap.to(messageEl, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => messageEl.remove()
      });
    }, 5000);
  }
  
  function showErrorMessage() {
    const messageEl = createMessageElement(
      'Oops! Something went wrong. Please try again later.',
      'error'
    );
    
    contactForm.parentElement.insertBefore(messageEl, contactForm);
    
    gsap.from(messageEl, {
      opacity: 0,
      y: -20,
      duration: 0.5,
      ease: "power2.out"
    });
    
    // Remove after 5 seconds
    setTimeout(() => {
      gsap.to(messageEl, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => messageEl.remove()
      });
    }, 5000);
  }
  
  function createMessageElement(text, type) {
    const messageEl = document.createElement('div');
    messageEl.className = `form-message form-message-${type}`;
    messageEl.textContent = text;
    
    // const bgColor = type === 'success' ? '#4A483F' : '#C68B7A'; // Removed hardcoded colors
    
    messageEl.style.cssText = `
      padding: 1rem 1.5rem;
      margin-bottom: 1.5rem;
      background-color: var(--bg-surface);
      border: 1px solid ${type === 'success' ? window.SiteColors.text.primary : window.SiteColors.semantic.error};
      color: ${type === 'success' ? window.SiteColors.text.primary : window.SiteColors.semantic.error};
      border-radius: var(--radius-sm);
      font-family: var(--font-sans);
      font-size: 0.875rem;
      text-align: center;
    `;
    
    return messageEl;
  }
  
  console.log('✅ Contact form initialized');
});
