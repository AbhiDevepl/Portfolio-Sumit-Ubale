/**
 * WhatsApp Assistant Script
 * Handles context-aware pre-filled messages based on the current page.
 */

document.addEventListener('DOMContentLoaded', () => {
    const whatsappBtn = document.querySelector('.whatsapp-float');
    if (!whatsappBtn) return;

    const phoneNumber = '919552265951';
    let message = 'Hello I found your website and want to know about your photography services';

    // Context-aware message generation
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('albums.html')) {
        message = 'Hello I found your website and want to know about your wedding album and wedding photography collections';
    } else if (window.location.hash === '#portfolio') {
        message = 'Hello I found your website and want to know about your wedding photography portfolio';
    } else if (window.location.hash === '#contact') {
        message = 'Hello I found your website and want to book a photography session';
    }

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    // Update link
    whatsappBtn.setAttribute('href', whatsappUrl);

    // Show button with a slight delay for better UX
    setTimeout(() => {
        whatsappBtn.classList.add('loaded');
        
        // Add pulse animation after some time
        setTimeout(() => {
            whatsappBtn.classList.add('pulse');
        }, 3000);
    }, 1500);
});
