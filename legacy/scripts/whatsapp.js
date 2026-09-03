/**
 * WhatsApp Assistant Script
 * Smart context-aware WhatsApp messages for higher inquiry conversion
 */

document.addEventListener('DOMContentLoaded', () => {

    const whatsappBtn = document.querySelector('.whatsapp-float');
    if (!whatsappBtn) return;

    const phoneNumber = '919552265951';

    const siteName = "Sumit Ubale Photography";

    let message = 
`Hello 👋

I just visited your website and I'm interested in learning more about your photography services.

Could you please share more details about availability and packages?

Thank you!`;

    const path = window.location.pathname;
    const hash = window.location.hash;

    // Context specific messages
    if (path.includes('albums.html')) {

        message =
`Hello 👋

I saw the wedding albums on your website and they look amazing.

Could you please share details about your wedding album packages and pricing?

Thank you!`;

    }

    else if (hash === '#portfolio') {

        message =
`Hello 👋

I was viewing your photography portfolio on the website.

Your work looks beautiful. I would love to know more about booking you for a wedding or pre-wedding shoot.`;

    }

    else if (hash === '#contact') {

        message =
`Hello 👋

I would like to enquire about booking ${siteName} for a wedding / event.

Could you please share your availability and package details?`;

    }

    // Encode message
    const encodedMessage = encodeURIComponent(message);

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    whatsappBtn.setAttribute('href', whatsappUrl);

    // UX improvements
    setTimeout(() => {

        whatsappBtn.classList.add('loaded');

        setTimeout(() => {

            whatsappBtn.classList.add('pulse');

        }, 3000);

    }, 1200);

});
