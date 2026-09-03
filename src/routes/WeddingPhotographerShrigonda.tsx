import { useRef } from 'react'
import {
  LandingFinalCta,
  LandingGalleryStrip,
  LandingHero,
  LandingSection,
  LandingStats,
  LandingTestimonials,
  LocalSeoNote,
  PrimaryLink,
  WhatsAppButton,
} from '../components/landing/LandingBlocks'
import { LandingFaq } from '../components/landing/LandingFaq'
import { useLandingMotion } from '../components/landing/useLandingMotion'
import { WhatsAppCTA } from '../components/whatsapp/WhatsAppCTA'
import { SHRIGONDA_FAQ, SHRIGONDA_LOCAL_BUSINESS } from '../lib/schema'
import { Seo } from '../lib/seo'

const HERO_WHATSAPP = 'Hi Sumit! I am looking for a wedding photographer in Shrigonda. Can you share your packages?'
const BOOK_WHATSAPP = 'Hi Sumit! I want to book you as my wedding photographer in Shrigonda.'

const SERVICES = [
  { icon: '📸', name: 'Candid Wedding Photography', copy: ' — Authentic, unscripted storytelling capturing real emotions throughout your wedding day.' },
  { icon: '🎬', name: 'Cinematic Wedding Films', copy: ' — High-production highlight reels that you\'ll watch for decades.' },
  { icon: '💑', name: 'Pre-Wedding Shoots', copy: ' — Creative shoots at handpicked scenic locations across Maharashtra.' },
  { icon: '🚁', name: 'Drone Videography', copy: ' — Breathtaking aerial shots of your wedding venue and celebration.' },
  { icon: '🎊', name: 'Event Coverage', copy: ' — Haldi, Mehendi, Sangeet, Engagement & Reception — covered in full.' },
]

const TESTIMONIALS = [
  {
    text: '"Sumit is the best wedding photographer in Shrigonda — there\'s no doubt about it. He captured emotions we didn\'t even know were happening. Our wedding album is something our family will treasure forever."',
    author: '— Aniket & Priya, Shrigonda',
  },
  {
    text: '"From the very first meeting, Sumit made us feel at ease. The way he works — so quietly, so observantly — you almost forget he\'s there. But then you see the photos and you realize he caught everything."',
    author: '— Rahul & Sneha, Karjat',
  },
  {
    text: '"Highly recommend for anyone looking for a candid wedding photographer in Ahilyanagar. Professional, creative, and delivers beyond expectations. Our Haldi photos are simply stunning."',
    author: '— Swapnil & Kaveri, Jamkhed',
  },
]

const FAQ = [
  {
    question: 'Who is the best wedding photographer in Shrigonda?',
    answer: 'Sumit Ubale is widely regarded as Shrigonda\'s top candid wedding photographer, known for cinematic storytelling, raw emotion capture, and delivering world-class wedding albums. With over 100+ weddings covered across Ahilyanagar district, he brings unmatched local expertise and artistic vision.',
  },
  {
    question: 'What are the wedding photography packages in Shrigonda?',
    answer: 'Packages are fully customized based on your event. They range from single-day coverage to multi-day wedding packages including Haldi, Mehendi, Sangeet, and Reception. Each includes candid photography, edited digital gallery, and optional add-ons like drone footage and cinematic films. Contact us on WhatsApp for a custom quote.',
  },
  {
    question: 'Do you cover weddings in nearby villages and talukas?',
    answer: 'Yes — we cover all areas within Ahilyanagar district including Shrigonda, Karjat, Jamkhed, Parner, Rahuri, Sangamner, and neighboring talukas. Minimal travel charges apply for distant locations beyond our base.',
  },
  {
    question: 'How many days before should I book?',
    answer: 'We recommend booking at least 3–6 months in advance. Peak wedding season in Maharashtra (October to February) fills quickly. A small advance secures your date. WhatsApp us today to check your date\'s availability.',
  },
  {
    question: 'When will I receive my wedding photos?',
    answer: 'Edited digital photos are delivered within 3–4 weeks after your wedding. High-priority delivery options are available. Cinematic film edits may take up to 6–8 weeks depending on the complexity of the edit.',
  },
]

export function WeddingPhotographerShrigonda() {
  const rootRef = useRef<HTMLDivElement>(null)
  useLandingMotion(rootRef)

  return (
    <div ref={rootRef}>
      <Seo
        title="Wedding Photographer in Shrigonda – Sumit Ubale Photography"
        description="Looking for the best wedding photographer in Shrigonda? Sumit Ubale captures raw emotions, cinematic moments, and timeless stories. Serving Shrigonda, Ahilyanagar & all of Maharashtra."
        keywords="Wedding Photographer Shrigonda, Best Wedding Photographer Shrigonda, Candid Wedding Photographer Shrigonda, Wedding Photography Shrigonda, Wedding Photographer Ahilyanagar"
        canonical="https://supf.in/wedding-photographer-shrigonda"
        ogDescription="Professional candid wedding photographer in Shrigonda. Cinematic films, pre-wedding shoots & luxury storytelling across Maharashtra."
        twitterDescription="Professional candid wedding photographer in Shrigonda, Ahilyanagar & Maharashtra."
        geoPlacename="Shrigonda, Ahilyanagar"
        jsonLd={[SHRIGONDA_LOCAL_BUSINESS, SHRIGONDA_FAQ]}
      />

      <LandingHero
        eyebrow="Shrigonda · Ahilyanagar · Maharashtra"
        title={<>Wedding Photographer<br />in Shrigonda</>}
        sub="Capturing raw emotions, candid moments, and cinematic stories from weddings across Shrigonda, Ahilyanagar, and all of Maharashtra."
        focus="30%"
        opacity={0.45}
      >
        <WhatsAppButton message={HERO_WHATSAPP}>WhatsApp Us</WhatsAppButton>
        <PrimaryLink to="/#contact">Book a Date</PrimaryLink>
      </LandingHero>

      <LandingStats
        items={[
          { value: '100+', label: 'Weddings Covered' },
          { value: '10+', label: 'Years Experience' },
          { value: '5★', label: 'Average Rating' },
        ]}
      />

      <LandingSection
        label="About"
        headingId="about-heading"
        title={<>Shrigonda's Trusted <br />Wedding Photographer</>}
      >
        <p className="lp-body">Based in Shrigonda, Sumit Ubale has spent over a decade mastering the art of candid wedding photography across Ahilyanagar district and beyond. His approach is rooted in observation — letting moments unfold naturally rather than directing every frame.</p>
        <p className="lp-body">Whether it's the quiet exchange of garlands during the Varmala ceremony at Shrigonda's Rajwada Hall, the emotion-filled Haldi rituals, or the grandeur of a Sangeet night, Sumit's lens captures the soul of every Marathi wedding with cinematic precision.</p>
        <p className="lp-body">His work has been trusted by families from Shrigonda, Karjat, Jamkhed, Parner, Rahuri, and across the Ahilyanagar district for celebrations that deserved nothing less than the best.</p>
      </LandingSection>

      <LandingSection
        variant="alt"
        label="Portfolio"
        headingId="gallery-heading"
        title={<>Wedding Moments <br />from Shrigonda</>}
      >
        <LandingGalleryStrip
          images={[
            { src: 'https://exdevx.sirv.com/IMG_Hero_peub99.webp?w=500&q=80', alt: 'Candid wedding photography Shrigonda' },
            { src: 'https://exdevx.sirv.com/3.jpg?w=500&q=80', alt: 'Wedding portrait Ahilyanagar' },
            { src: 'https://exdevx.sirv.com/IMG_Hero_peub99.webp?w=500&q=80', alt: 'Bride candid wedding Shrigonda' },
          ]}
          cta={{ to: '/portfolio', label: 'View Full Portfolio' }}
        />
      </LandingSection>

      <LandingSection
        label="What We Offer"
        headingId="services-heading"
        title={<>Wedding Photography Services<br />in Shrigonda</>}
      >
        <p className="lp-body">Every wedding is different. Our packages are designed to cover every important moment — from the first invitation to the final farewell.</p>
        <ul className="lp-service-list">
          {SERVICES.map(service => (
            <li key={service.name}>
              <span className="lp-service-icon" aria-hidden="true">{service.icon}</span>
              <div><strong>{service.name}</strong>{service.copy}</div>
            </li>
          ))}
        </ul>
      </LandingSection>

      <LandingSection
        variant="alt"
        label="Client Reviews"
        headingId="testimonial-heading"
        title="What Shrigonda Couples Say"
      >
        <LandingTestimonials items={TESTIMONIALS} />
      </LandingSection>

      <LandingSection label="FAQ" headingId="faq-heading" title="Frequently Asked Questions">
        <LandingFaq items={FAQ} />
      </LandingSection>

      <LandingFinalCta
        ariaLabel="Book your wedding photographer"
        title={<>Ready to Book Your<br />Shrigonda Wedding Photographer?</>}
        sub="Dates fill fast. Secure yours today."
        whatsappMessage={BOOK_WHATSAPP}
      />

      <LocalSeoNote>
        Providing professional wedding photography services in <strong>Shrigonda</strong>, <strong>Karjat</strong>, <strong>Jamkhed</strong>, <strong>Parner</strong>, <strong>Rahuri</strong>, <strong>Sangamner</strong>, <strong>Ahilyanagar</strong>, Pune, Mumbai, Nashik, and throughout Maharashtra.
      </LocalSeoNote>

      <WhatsAppCTA message={HERO_WHATSAPP} />
    </div>
  )
}

export const Component = WeddingPhotographerShrigonda
export default WeddingPhotographerShrigonda
