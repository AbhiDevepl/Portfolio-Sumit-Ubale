\## Project Overview



This repository contains a \*\*photography portfolio website\*\* designed to showcase wedding photography, cinematic films, and pre-wedding shoots.

The website is intended to be \*\*fast-loading, SEO optimized, and mobile-first\*\* to attract potential clients searching for wedding photographers in Maharashtra, India.



The site primarily targets \*\*Indian wedding photography clients\*\* and aims to rank in search engines for region-based keywords such as:



\* Wedding Photographer Shrigonda

\* Wedding Photographer Ahilyanagar

\* Candid Wedding Photographer Maharashtra

\* Pre Wedding Shoot Shrigonda



The website acts as a \*\*lead-generation portfolio\*\*, encouraging visitors to contact the photographer via WhatsApp or other contact methods.



---



\# Core Goals



1\. Provide a visually appealing photography portfolio.

2\. Maintain extremely fast page loading speeds.

3\. Optimize for SEO and local search rankings.

4\. Provide smooth navigation on mobile devices.

5\. Encourage users to contact the photographer easily.



The website should always prioritize:



\* Speed

\* SEO

\* Mobile responsiveness

\* Visual clarity

\* Simplicity



---



\# Tech Stack



The project uses a \*\*simple static website architecture\*\*.



Frontend:



\* HTML5

\* CSS3

\* Vanilla JavaScript



Assets:



\* JPG and JPEG images

\* SVG icons

\* favicon images



No framework or backend server is required.



---



\# Folder Structure



```

Portfolio-Sumit-Ubale

│

├── index.html

├── robots.txt

├── sitemap.xml

├── site.webmanifest

│

├── pages/

│   additional pages such as galleries

│

├── styles/

│   CSS files

│

├── scripts/

│   JavaScript files

│

├── data/

│   JSON or static data used by scripts

│

├── favicon.png

├── favicon.svg

│

└── images

```



The architecture is intentionally lightweight to ensure:



\* fast loading

\* easy deployment

\* simple maintainability



---



\# Development Principles



Claude should follow these rules when modifying code.



\## Performance First



Always prioritize performance.



\* Avoid heavy libraries

\* Avoid unnecessary JavaScript

\* Minimize DOM operations

\* Use lazy loading for images

\* Compress images where possible



\## SEO Friendly



Every page should support good SEO.



Requirements:



\* Proper meta tags

\* Open Graph tags

\* Structured headings

\* Alt text for images

\* Clean semantic HTML



Example structure:



```

<header>

<main>

<section>

<footer>

```



Avoid excessive nested div elements.



---



\# Image Handling Rules



Images should always follow these rules:



\* Use JPG or JPEG format

\* Avoid PNG unless transparency is required

\* Images should be compressed

\* Maximum recommended size: 300kb



For gallery sections:



\* Show only \*\*3 images at a time\*\*

\* Images should be loaded \*\*randomly from their category\*\*



Categories may include:



\* wedding

\* prewedding

\* cinematics

\* candid



Images must always match their category.



Example:



```

category=cinematics

```



should only load cinematic images.



---



\# UI Design Guidelines



The website design should feel:



\* elegant

\* cinematic

\* modern

\* minimal



Avoid:



\* flashy animations

\* excessive hover effects

\* heavy UI frameworks



Focus on:



\* smooth scrolling

\* clean typography

\* strong visual hierarchy



---



\# Contact and Lead Generation



The portfolio should make it easy for clients to contact the photographer.



Preferred contact methods:



\* WhatsApp

\* Phone

\* Instagram

\* Contact form



WhatsApp buttons should include a \*\*pre-filled message\*\*.



Example message:



```

Hello, I saw your photography portfolio and would like to inquire about wedding photography services.

```



---



\# Code Style



JavaScript should be:



\* clean

\* readable

\* modular

\* commented when necessary



Avoid:



\* deeply nested logic

\* unnecessary global variables

\* overly complex code



Prefer:



```

const

let

arrow functions

```



---



\# Accessibility



All UI elements should support accessibility.



Include:



\* alt text for images

\* readable color contrast

\* semantic HTML elements



---



\# Future Improvements



Possible future enhancements include:



\* blog section for SEO

\* dynamic gallery filtering

\* contact form backend

\* image lazy loading

\* CDN image delivery



---



\# Deployment



The site should remain compatible with static hosting providers such as:



\* Netlify

\* Vercel

\* GitHub Pages



Deployment should require \*\*no backend services\*\*.



---



\# Instructions for Claude



When assisting with this repository:



1\. Do not introduce heavy frameworks.

2\. Preserve fast loading speeds.

3\. Maintain SEO structure.

4\. Keep the design minimal and elegant.

5\. Only modify files when necessary.

6\. Always explain significant architectural changes.



Claude should act as a \*\*frontend performance and SEO assistant\*\* for this project.

