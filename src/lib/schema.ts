/**
 * JSON-LD blocks, copied verbatim from the static pages.
 *
 * These are the structured-data payloads Google already indexes; the wording
 * is deliberately unchanged. Only the delivery mechanism moved — they are
 * still emitted into the prerendered HTML head.
 */
import { SITE } from './site'

const ADDRESS = SITE.address

function faqPage(questions: { name: string, text: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': questions.map(q => ({
      '@type': 'Question',
      'name': q.name,
      'acceptedAnswer': { '@type': 'Answer', 'text': q.text },
    })),
  }
}

/* ============================================================
   Home — index.html
   ============================================================ */

export const HOME_LOCAL_BUSINESS = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'Photographer'],
  'name': 'Sumit Ubale Photography',
  'image': 'https://exdevx.sirv.com/IMG_Hero_peub99.webp?profile=true',
  '@id': 'https://supf.in',
  'url': 'https://supf.in',
  'telephone': '+919552265951',
  'email': 'sumitubale5050@gmail.com',
  'priceRange': '$$',
  'description': 'Professional candid wedding photographer in Shrigonda, Maharashtra. Specializing in cinematic wedding films, pre-wedding shoots, and luxury visual storytelling across Ahilyanagar, Pune, and Mumbai.',
  'address': ADDRESS,
  'geo': {
    '@type': 'GeoCoordinates',
    'latitude': 18.6148,
    'longitude': 74.6953,
  },
  'areaServed': [
    { '@type': 'City', 'name': 'Shrigonda' },
    { '@type': 'City', 'name': 'Ahilyanagar' },
    { '@type': 'City', 'name': 'Pune' },
    { '@type': 'City', 'name': 'Mumbai' },
    { '@type': 'City', 'name': 'Nashik' },
    { '@type': 'State', 'name': 'Maharashtra' },
  ],
  'openingHoursSpecification': {
    '@type': 'OpeningHoursSpecification',
    'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    'opens': '09:00',
    'closes': '21:00',
  },
  'aggregateRating': {
    '@type': 'AggregateRating',
    'ratingValue': '5.0',
    'reviewCount': '47',
    'bestRating': '5',
    'worstRating': '1',
  },
  'sameAs': [
    'https://www.instagram.com/sumit_ubale_photography/',
  ],
  'hasOfferCatalog': {
    '@type': 'OfferCatalog',
    'name': 'Photography & Videography Services',
    'itemListElement': [
      {
        '@type': 'Offer',
        'itemOffered': {
          '@type': 'Service',
          'name': 'Candid Wedding Photography',
          'description': 'Authentic, emotion-driven wedding photography capturing unscripted moments across Shrigonda, Ahilyanagar, and Maharashtra.',
          'areaServed': 'Maharashtra',
        },
      },
      {
        '@type': 'Offer',
        'itemOffered': {
          '@type': 'Service',
          'name': 'Cinematic Wedding Films',
          'description': 'High-production cinematic wedding films and highlight reels for couples in Maharashtra.',
          'areaServed': 'Maharashtra',
        },
      },
      {
        '@type': 'Offer',
        'itemOffered': {
          '@type': 'Service',
          'name': 'Pre-Wedding Photoshoot',
          'description': 'Creative pre-wedding shoots at scenic locations across Ahilyanagar, Pune, and Maharashtra.',
          'areaServed': 'Maharashtra',
        },
      },
      {
        '@type': 'Offer',
        'itemOffered': {
          '@type': 'Service',
          'name': 'Drone Videography',
          'description': 'Breathtaking aerial drone shots and cinematic drone footage for weddings in Maharashtra.',
          'areaServed': 'Maharashtra',
        },
      },
    ],
  },
}

export const HOME_FAQ = faqPage([
  {
    name: 'How much does a wedding photographer cost in Shrigonda?',
    text: 'Wedding photography packages in Shrigonda typically start from ₹25,000 and go up to ₹1,50,000 depending on coverage hours, number of photographers, album quality, and additional services like drone or cinematic films. Sumit Ubale Photography offers customized packages — contact us on WhatsApp for an exact quote.',
  },
  {
    name: 'Does Sumit Ubale Photography cover weddings outside Shrigonda?',
    text: 'Yes! We regularly cover weddings across Ahilyanagar, Pune, Mumbai, Nashik, and throughout Maharashtra. Outstation bookings include travel expenses. We also travel Pan-India for destination weddings.',
  },
  {
    name: 'How far in advance should I book a wedding photographer?',
    text: 'We recommend booking at least 3–6 months in advance, especially for peak wedding season (October–February). Popular dates fill up quickly. A small booking advance secures your date immediately.',
  },
  {
    name: 'What is included in a wedding photography package?',
    text: 'Our standard packages include full-day candid photography, edited digital photos, online gallery delivery, and an optional premium photo album. Add-ons include a cinematic highlight reel, drone videography, and pre-wedding photoshoots.',
  },
  {
    name: 'Can I see examples of your wedding photography in Shrigonda?',
    text: 'Absolutely. Visit our Portfolio page at supf.in/pages/portfolio.html or our Instagram @sumit_ubale_photography to view real wedding galleries from Shrigonda, Ahilyanagar, and across Maharashtra.',
  },
])

/* ============================================================
   Portfolio — pages/portfolio.html
   ============================================================ */

export const PORTFOLIO_LOCAL_BUSINESS = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'Photographer'],
  'name': 'Sumit Ubale Photography',
  'image': 'https://exdevx.sirv.com/IMG_Hero_peub99.webp?profile=true',
  '@id': 'https://supf.in',
  'url': 'https://supf.in',
  'telephone': '+919552265951',
  'email': 'sumitubale5050@gmail.com',
  'priceRange': '$$',
  'address': ADDRESS,
  'geo': {
    '@type': 'GeoCoordinates',
    'latitude': 18.6148,
    'longitude': 74.6953,
  },
}

/* ============================================================
   Services — pages/service.html
   ============================================================ */

export const SERVICE_PROFESSIONAL_SERVICE = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  'name': 'Sumit Ubale Photography',
  '@id': 'https://supf.in',
  'url': 'https://supf.in/pages/service.html',
  'telephone': '+919552265951',
  'email': 'sumitubale5050@gmail.com',
  'image': 'https://exdevx.sirv.com/IMG_Hero_peub99.webp?profile=true',
  'priceRange': '$$',
  'address': ADDRESS,
  'areaServed': [
    { '@type': 'City', 'name': 'Shrigonda' },
    { '@type': 'City', 'name': 'Ahilyanagar' },
    { '@type': 'City', 'name': 'Pune' },
    { '@type': 'City', 'name': 'Mumbai' },
    { '@type': 'State', 'name': 'Maharashtra' },
  ],
  'hasOfferCatalog': {
    '@type': 'OfferCatalog',
    'name': 'Photography Services',
    'itemListElement': [
      { '@type': 'Offer', 'itemOffered': { '@type': 'Service', 'name': 'Candid Wedding Photography', 'areaServed': 'Maharashtra' } },
      { '@type': 'Offer', 'itemOffered': { '@type': 'Service', 'name': 'Cinematic Wedding Films', 'areaServed': 'Maharashtra' } },
      { '@type': 'Offer', 'itemOffered': { '@type': 'Service', 'name': 'Pre-Wedding Photoshoot', 'areaServed': 'Maharashtra' } },
      { '@type': 'Offer', 'itemOffered': { '@type': 'Service', 'name': 'Drone Videography', 'areaServed': 'Maharashtra' } },
    ],
  },
}

/* ============================================================
   Landing page — wedding-photographer-shrigonda
   ============================================================ */

export const SHRIGONDA_LOCAL_BUSINESS = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'Photographer'],
  'name': 'Sumit Ubale Photography',
  '@id': 'https://supf.in',
  'url': 'https://supf.in/pages/wedding-photographer-shrigonda.html',
  'telephone': '+919552265951',
  'image': 'https://exdevx.sirv.com/IMG_Hero_peub99.webp?profile=true',
  'priceRange': '$$',
  'address': ADDRESS,
  'areaServed': [
    { '@type': 'City', 'name': 'Shrigonda' },
    { '@type': 'City', 'name': 'Ahilyanagar' },
    { '@type': 'State', 'name': 'Maharashtra' },
  ],
  'aggregateRating': {
    '@type': 'AggregateRating',
    'ratingValue': '5.0',
    'reviewCount': '47',
    'bestRating': '5',
  },
}

export const SHRIGONDA_FAQ = faqPage([
  {
    name: 'Who is the best wedding photographer in Shrigonda?',
    text: 'Sumit Ubale is widely regarded as Shrigonda\'s top candid wedding photographer, known for cinematic storytelling, raw emotion capture, and delivering world-class wedding albums. With over 100+ weddings covered across Ahilyanagar district, he brings unmatched local expertise and artistic vision.',
  },
  {
    name: 'What are the wedding photography packages available in Shrigonda?',
    text: 'Packages are fully customized based on your event needs. They range from single-day coverage to multi-day wedding packages including Haldi, Mehendi, Sangeet, and Reception. Each package includes candid photography, edited digital gallery, and optional add-ons like drone footage and cinematic films.',
  },
  {
    name: 'Does the photographer travel to nearby villages and mandals?',
    text: 'Yes, we cover all areas within Ahilyanagar district including Shrigonda, Karjat, Jamkhed, Parner, Rahuri, Sangamner, and neighboring talukas. Minimal travel charges apply for distant locations.',
  },
])

/* ============================================================
   Landing page — pre-wedding-shoot-ahilyanagar
   ============================================================ */

export const PREWEDDING_LOCAL_BUSINESS = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'Photographer'],
  'name': 'Sumit Ubale Photography',
  '@id': 'https://supf.in',
  'url': 'https://supf.in/pages/pre-wedding-shoot-ahilyanagar.html',
  'telephone': '+919552265951',
  'image': 'https://exdevx.sirv.com/IMG_Hero_peub99.webp?profile=true',
  'priceRange': '$$',
  'address': ADDRESS,
  'areaServed': [
    { '@type': 'City', 'name': 'Ahilyanagar' },
    { '@type': 'City', 'name': 'Shrigonda' },
    { '@type': 'City', 'name': 'Pune' },
    { '@type': 'State', 'name': 'Maharashtra' },
  ],
  'hasOfferCatalog': {
    '@type': 'OfferCatalog',
    'name': 'Pre-Wedding Photography',
    'itemListElement': [
      { '@type': 'Offer', 'itemOffered': { '@type': 'Service', 'name': 'Pre-Wedding Photoshoot Ahilyanagar', 'areaServed': 'Ahilyanagar' } },
      { '@type': 'Offer', 'itemOffered': { '@type': 'Service', 'name': 'Outdoor Pre-Wedding Shoot Maharashtra', 'areaServed': 'Maharashtra' } },
    ],
  },
}

export const PREWEDDING_FAQ = faqPage([
  {
    name: 'Where can I do a pre-wedding shoot in Ahilyanagar?',
    text: 'Ahilyanagar offers many beautiful locations for pre-wedding shoots — the historic Ahmednagar Fort, the serene Bhandardara Lake, lush green fields around Shrigonda, the Mula Dam backwaters, and the scenic Western Ghats foothills. Sumit Ubale scouts the best location based on your vibe and personality.',
  },
  {
    name: 'How much does a pre-wedding shoot cost in Ahilyanagar?',
    text: 'Pre-wedding shoot packages in Ahilyanagar typically start from ₹8,000 and can go up to ₹30,000+ for full-day destination shoots including multiple locations, editing, and digital delivery. Contact us on WhatsApp for a custom quote based on your preferred location and date.',
  },
  {
    name: 'What should I wear for my pre-wedding shoot?',
    text: 'We recommend coordinated outfits — not matching, but complementary colors that photograph beautifully. For outdoor shoots in Ahilyanagar, earthy tones, pastels, and floral designs work exceptionally well. We provide a full styling guide after you book.',
  },
])

/* ============================================================
   Landing page — cinematic-wedding-films-maharashtra
   ============================================================ */

export const CINEMATIC_LOCAL_BUSINESS = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'Photographer'],
  'name': 'Sumit Ubale Photography',
  '@id': 'https://supf.in',
  'url': 'https://supf.in/pages/cinematic-wedding-films-maharashtra.html',
  'telephone': '+919552265951',
  'image': 'https://exdevx.sirv.com/IMG_Hero_peub99.webp?profile=true',
  'priceRange': '$$',
  'address': ADDRESS,
  'areaServed': [
    { '@type': 'State', 'name': 'Maharashtra' },
    { '@type': 'City', 'name': 'Pune' },
    { '@type': 'City', 'name': 'Mumbai' },
    { '@type': 'City', 'name': 'Nashik' },
    { '@type': 'City', 'name': 'Shrigonda' },
  ],
  'hasOfferCatalog': {
    '@type': 'OfferCatalog',
    'name': 'Wedding Videography Services',
    'itemListElement': [
      { '@type': 'Offer', 'itemOffered': { '@type': 'Service', 'name': 'Cinematic Wedding Film Maharashtra', 'areaServed': 'Maharashtra' } },
      { '@type': 'Offer', 'itemOffered': { '@type': 'Service', 'name': 'Wedding Highlight Reel', 'areaServed': 'Maharashtra' } },
      { '@type': 'Offer', 'itemOffered': { '@type': 'Service', 'name': 'Drone Wedding Videography', 'areaServed': 'Maharashtra' } },
    ],
  },
  'aggregateRating': {
    '@type': 'AggregateRating',
    'ratingValue': '5.0',
    'reviewCount': '47',
    'bestRating': '5',
  },
}

export const CINEMATIC_FAQ = faqPage([
  {
    name: 'What is a cinematic wedding film?',
    text: 'A cinematic wedding film is a professionally produced short film of your wedding day — typically 4 to 12 minutes — edited with colour grading, music, voiceovers, and storytelling techniques borrowed from filmmaking. Unlike traditional wedding videos, cinematic films are designed to be watched and rewatched as an emotional piece of art.',
  },
  {
    name: 'How long will my wedding film be?',
    text: 'Highlight reels are typically 3–5 minutes, designed for social media and quick sharing. Full-length cinematic films run 8–15 minutes and include all key moments — from the bride\'s preparation to the final dance. Extended documentary edits (30–90 minutes) covering raw footage are available as an add-on.',
  },
  {
    name: 'What is the difference between a highlight reel and a cinematic film?',
    text: 'A highlight reel is a 3–5 minute fast-cut edit featuring the best moments from your day set to music — perfect for Instagram and sharing. A cinematic film is a 8–15 minute narrative edit with story arc, colour grading, vows, emotional dialogue, and music — designed to be watched like a film. Both are available in our packages.',
  },
])

/* ============================================================
   Landing page — candid-photographer-maharashtra
   ============================================================ */

export const CANDID_LOCAL_BUSINESS = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'Photographer'],
  'name': 'Sumit Ubale Photography',
  '@id': 'https://supf.in',
  'url': 'https://supf.in/pages/candid-photographer-maharashtra.html',
  'telephone': '+919552265951',
  'image': 'https://exdevx.sirv.com/IMG_Hero_peub99.webp?profile=true',
  'priceRange': '$$',
  'address': ADDRESS,
  'areaServed': [
    { '@type': 'State', 'name': 'Maharashtra' },
    { '@type': 'City', 'name': 'Pune' },
    { '@type': 'City', 'name': 'Mumbai' },
    { '@type': 'City', 'name': 'Nashik' },
    { '@type': 'City', 'name': 'Aurangabad' },
    { '@type': 'City', 'name': 'Kolhapur' },
  ],
  'aggregateRating': {
    '@type': 'AggregateRating',
    'ratingValue': '5.0',
    'reviewCount': '47',
    'bestRating': '5',
  },
}

export const CANDID_FAQ = faqPage([
  {
    name: 'What is candid wedding photography?',
    text: 'Candid wedding photography captures genuine, unscripted moments — tears, laughter, a stolen glance, a grandfather\'s smile — without posing or staging. The result is an authentic visual story that reflects the real emotion of your wedding day rather than a rehearsed photo shoot.',
  },
  {
    name: 'Does Sumit Ubale cover weddings across all of Maharashtra?',
    text: 'Yes. Based in Shrigonda, Sumit and his team regularly travel across Maharashtra for weddings — including Pune, Mumbai, Nashik, Aurangabad, Kolhapur, Satara, and beyond. Outstation bookings include travel and accommodation arrangements. Pan-India destination weddings are also accepted.',
  },
  {
    name: 'How is candid photography different from traditional photography?',
    text: 'Traditional wedding photography focuses on posed group shots and formal portraits. Candid photography prioritizes natural, spontaneous moments — the varmala exchange, the first look, the tears during pheras. Both styles have value; Sumit blends them to ensure you have both timeless portraits and authentic storytelling shots.',
  },
])
