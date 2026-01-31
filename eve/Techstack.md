

Here is how you should structure your development workflow for this specific project:



---



\## 1. Project Directory Structure



Since you are using the \*\*App Router\*\*, keep it clean and modular:



```text

/app

&nbsp; /layout.tsx       // Global fonts, Smooth Scroll (Lenis) setup

&nbsp; /page.tsx         // Main landing page (The design you shared)

/components

&nbsp; /sections

&nbsp;   /Hero.tsx       // Rani Singh Typography + Parallax

&nbsp;   /About.tsx      // Image/Text offset layout

&nbsp;   /Gallery.tsx    // The Rose-colored Portraits section

&nbsp;   /Events.tsx     // Asymmetric grid

&nbsp;   /Contact.tsx    // Footer \& Call to action

&nbsp; /ui

&nbsp;   /Button.tsx     // Reusable pill-shaped buttons

&nbsp;   /FadeIn.tsx     // GSAP wrapper for reveals

/public

&nbsp; /images           // Optimized .webp assets

/data

&nbsp; /portfolio.json   // Content for your gallery items



```



---



\## 2. Deep Dive: Implementation Details



\### 🎨 Styling (Tailwind + Typography)



To get that "Editorial" feel, you need to use specific utility classes.



\* \*\*The Typography:\*\* Use `tracking-tighter` and `leading-\[0.85]` for the headings. This creates that high-fashion overlapping look.

\* \*\*The Grid:\*\* Use `aspect-\[3/4]` or `aspect-\[4/5]` for your portrait images to maintain a consistent vertical "editorial" rhythm.



\### 🚀 Animations (GSAP + ScrollTrigger)



GSAP is perfect for the "Staggered Reveal" seen in the design.



\* \*\*Hero Reveal:\*\* Use a `clip-path` animation. Start the image with `clip-path: inset(100% 0 0 0)` and animate it to `0%` on load.

\* \*\*Scroll Parallax:\*\* As the user scrolls through "Special Events," the images should move at slightly different speeds (`y: -50` vs `y: 50`).

\* \*\*Smooth Scroll:\*\* Use \*\*Lenis\*\* (by Studio Freight). It’s the industry standard for Next.js sites to make scrolling feel buttery smooth.



\### 🖼️ Image Optimization



Since this is a photography site, performance is everything.



\* \*\*Next/Image:\*\* Use the `priority` prop for the Hero image to prevent LCP (Largest Contentful Paint) issues.

\* \*\*Placeholders:\*\* Use `placeholder="blur"` with base64 strings so the site feels fast even while high-res photos load.



---



\## 3. SEO \& Metadata



Next.js makes this easy. In your `layout.tsx`:



```typescript

export const metadata = {

&nbsp; title: 'Rani Singh Photography | Editorial \& Portrait Studio',

&nbsp; description: 'Award-winning photography studio specializing in curated editorial portraits and events.',

&nbsp; openGraph: {

&nbsp;   images: \['/og-image.jpg'], // Make sure to have a branded share image

&nbsp; },

}



```



---



\## 4. Next Step: Your First Component



To start, you should set up your \*\*Theme \& Layout\*\*.



\*\*Would you like me to generate the `layout.tsx` file for you, including the Google Font integration and the Lenis Smooth Scroll setup?\*\*

