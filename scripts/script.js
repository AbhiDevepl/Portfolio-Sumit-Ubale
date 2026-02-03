const initAll = () => {
    initHeroAnimations();
    initScrollAnimations();
    initParallax();
    console.log('🎬 Site animations synchronized with loader');
};

// Orchestrate with the page loader
if (document.body.classList.contains('loaded')) {
    initAll();
} else {
    window.addEventListener('pageLoaded', initAll, { once: true });
}

function initHeroAnimations() {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    tl.from('.hero-subtitle', {
        y: 50,
        opacity: 0,
        duration: 1,
        delay: 0.1 // Slight delay after loader fades
    })
    .from('.hero-title', {
        y: 80,
        opacity: 0,
        duration: 1.2,
    }, '-=0.6')
    .from('.hero-cta', {
        y: 30,
        opacity: 0,
        duration: 0.8,
    }, '-=0.4');
}

function initScrollAnimations() {
    // Existing scroll animations logic...
    gsap.utils.toArray('.section-title, .portraits-title, .events-title, .special-title').forEach(title => {
        gsap.from(title, {
            y: 60,
            opacity: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: title,
                start: 'top 85%',
                end: 'top 60%',
                toggleActions: 'play none none reverse'
            }
        });
    });

    gsap.utils.toArray('.about-description').forEach(desc => {
        gsap.from(desc, {
            y: 40,
            opacity: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: desc,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        });
    });

    gsap.utils.toArray('.about-image').forEach(img => {
        gsap.from(img, {
            y: 80,
            opacity: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: img,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        });
    });

    gsap.utils.toArray('.portrait-card').forEach((card, index) => {
        gsap.from(card, {
            y: 60,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: card,
                start: 'top 90%',
                toggleActions: 'play none none reverse'
            },
            delay: index * 0.15
        });
    });

    gsap.utils.toArray('.event-card').forEach((card, index) => {
        gsap.from(card, {
            y: 60,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: card,
                start: 'top 90%',
                toggleActions: 'play none none reverse'
            },
            delay: index * 0.15
        });
    });

    gsap.utils.toArray('.special-card').forEach((card, index) => {
        gsap.from(card, {
            y: 60,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: card,
                start: 'top 90%',
                toggleActions: 'play none none reverse'
            },
            delay: index * 0.15
        });
    });

    gsap.from('.contact-title', {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.contact-title',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
        }
    });

    gsap.from('.contact-text', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.contact-text',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
        }
    });

    gsap.from('.contact-btn', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.contact-btn',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
        }
    });
}

function initParallax() {
    gsap.to('.hero-image', {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true
        }
    });

    gsap.utils.toArray('.event-card img').forEach((img, index) => {
        const yMovement = index % 2 === 0 ? -30 : -50;

        gsap.to(img, {
            y: yMovement,
            ease: 'none',
            scrollTrigger: {
                trigger: img,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });
    });
}

// Global smoothness & interaction
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

const navButtons = document.querySelectorAll('.nav-cta, .contact-btn');
navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const contactSection = document.querySelector('#contact');
        if (contactSection) {
            window.scrollTo({
                top: contactSection.offsetTop,
                behavior: 'smooth'
            });
        }
    });
});
