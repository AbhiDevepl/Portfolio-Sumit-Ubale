import { useRef } from 'react'
import {
  CityGrid,
  LandingFinalCta,
  LandingGalleryStrip,
  LandingHero,
  LandingSection,
  LandingTestimonials,
  LocalSeoNote,
  PrimaryLink,
  WhatsAppButton,
} from '../components/landing/LandingBlocks'
import { LandingFaq } from '../components/landing/LandingFaq'
import { useLandingMotion } from '../components/landing/useLandingMotion'
import { WhatsAppCTA } from '../components/whatsapp/WhatsAppCTA'
import { CANDID_FAQ, CANDID_LOCAL_BUSINESS } from '../lib/schema'
import { Seo } from '../lib/seo'

const HERO_WHATSAPP = 'Hi Sumit! I am looking for a candid wedding photographer in Maharashtra. Can you share your packages?'
const BOOK_WHATSAPP = 'Hi Sumit! I need a candid wedding photographer in Maharashtra. Can we discuss?'
const FLOAT_WHATSAPP = 'Hi Sumit! I need a candid wedding photographer in Maharashtra.'

const CITIES = [
  'Pune', 'Mumbai', 'Nashik', 'Aurangabad', 'Kolhapur', 'Satara',
  'Solapur', 'Nagpur', 'Thane', 'Lonavala', 'Mahabaleshwar', 'Shrigonda',
]

const TESTIMONIALS = [
  {
    text: '"He has an eye for candid moments that most photographers miss. Our wedding in Pune was captured so authentically — every laugh, every tear. We are forever grateful."',
    author: '— Vikram & Aditi, Pune',
  },
  {
    text: '"We hired Sumit for our Mumbai wedding after seeing his work online. He captured moments we didn\'t even know were happening. The candid shots are our absolute favourites."',
    author: '— Amit & Riya, Mumbai',
  },
  {
    text: '"Best candid wedding photographer in Maharashtra, hands down. The way he blended into our Nashik wedding and captured every natural moment was incredible."',
    author: '— Rohan & Neha, Nashik',
  },
]

const FAQ = [
  {
    question: 'What is candid wedding photography?',
    answer: 'Candid wedding photography captures genuine, unscripted moments — tears, laughter, a stolen glance, a grandfather\'s smile — without posing or staging. The result is an authentic visual story that reflects the real emotion of your wedding day.',
  },
  {
    question: 'Does Sumit Ubale cover weddings across all of Maharashtra?',
    answer: 'Yes. Based in Shrigonda, Sumit and his team regularly travel across Maharashtra — including Pune, Mumbai, Nashik, Aurangabad, Kolhapur, Satara, and beyond. Outstation bookings include travel arrangements. Pan-India destination weddings are also accepted.',
  },
  {
    question: 'How is candid photography different from traditional photography?',
    answer: 'Traditional wedding photography focuses on posed group shots and formal portraits. Candid photography prioritizes natural, spontaneous moments. Sumit blends both styles to ensure you have timeless portraits and authentic storytelling shots in your final album.',
  },
  {
    question: 'How many photographers will be at my wedding?',
    answer: 'Depending on your package, we deploy 1 to 3 photographers. Large multi-function weddings benefit from multiple photographers covering simultaneous events (e.g., bridal prep and baraat simultaneously). We discuss team size during the booking consultation.',
  },
]

export function CandidPhotographerMaharashtra() {
  const rootRef = useRef<HTMLDivElement>(null)
  useLandingMotion(rootRef)

  return (
    <div ref={rootRef}>
      <Seo
        title="Candid Wedding Photographer in Maharashtra – Sumit Ubale Photography"
        description="Award-winning candid wedding photographer serving all of Maharashtra — Pune, Mumbai, Nashik, Aurangabad & beyond. Authentic storytelling, real emotions, cinematic frames."
        keywords="Candid Wedding Photographer Maharashtra, Candid Photographer Pune, Candid Wedding Photography Mumbai, Candid Photographer Nashik, Best Candid Wedding Photographer Maharashtra"
        canonical="https://supf.in/candid-photographer-maharashtra"
        ogDescription="Authentic candid wedding photography across Pune, Mumbai, Nashik, and all of Maharashtra. Real emotions. Unscripted moments."
        twitterDescription="Authentic candid wedding photography across Pune, Mumbai, Nashik & all of Maharashtra."
        geoPlacename="Maharashtra, India"
        jsonLd={[CANDID_LOCAL_BUSINESS, CANDID_FAQ]}
      />

      <LandingHero
        eyebrow="Pune · Mumbai · Nashik · All of Maharashtra"
        title={<>Candid Wedding<br />Photographer<br />in Maharashtra</>}
        sub="Real stories. Real people. Real emotions. Candid wedding photography that feels as alive as your most precious memories — across every corner of Maharashtra."
        focus="35%"
        opacity={0.38}
      >
        <WhatsAppButton message={HERO_WHATSAPP}>WhatsApp Us</WhatsAppButton>
        <PrimaryLink to="/#contact">Enquire Now</PrimaryLink>
      </LandingHero>

      <LandingSection
        label="The Philosophy"
        headingId="philosophy-heading"
        title={<>Candid Photography Is<br />About Truth</>}
      >
        <p className="lp-body">Sumit Ubale doesn't believe in directing every frame. His philosophy is simple: be invisible, be patient, be ready. The greatest wedding photographs aren't planned — they happen in the space between instructions, in the genuine exchanges between people who love each other.</p>
        <p className="lp-body">With over 10 years of experience shooting weddings across Maharashtra — from intimate village functions in Shrigonda to grand destination weddings in Lonavala — Sumit has honed the ability to read a room, anticipate moments, and capture emotion before it fades.</p>
        <p className="lp-body">The result is a wedding album that doesn't just show what happened — it makes you feel it all over again.</p>
      </LandingSection>

      <LandingSection
        variant="alt"
        label="Coverage Area"
        headingId="cities-heading"
        title={<>Cities We Cover<br />Across Maharashtra</>}
      >
        <p className="lp-body">Based in Shrigonda, we travel extensively across Maharashtra for weddings of all sizes.</p>
        <CityGrid cities={CITIES} />
        <p className="lp-body lp-body--note">Pan-India destination weddings also accepted. Travel and accommodation included in outstation packages.</p>
      </LandingSection>

      <LandingSection label="Portfolio" headingId="gallery-heading" title="Candid Wedding Gallery">
        <LandingGalleryStrip
          images={[
            { src: 'https://exdevx.sirv.com/IMG_Hero_peub99.webp?w=500&q=80', alt: 'Candid wedding moment Maharashtra' },
            { src: 'https://exdevx.sirv.com/3.jpg?w=500&q=80', alt: 'Candid wedding photographer Pune' },
            { src: 'https://exdevx.sirv.com/IMG_Hero_peub99.webp?w=500&q=80', alt: 'Candid wedding photography Mumbai' },
          ]}
          cta={{ to: '/portfolio', label: 'View Full Wedding Gallery' }}
        />
      </LandingSection>

      <LandingSection
        variant="alt"
        label="Testimonials"
        headingId="testimonials-heading"
        title="What Maharashtra Couples Say"
      >
        <LandingTestimonials items={TESTIMONIALS} />
      </LandingSection>

      <LandingSection label="FAQ" headingId="faq-heading" title="Frequently Asked Questions">
        <LandingFaq items={FAQ} />
      </LandingSection>

      <LandingFinalCta
        ariaLabel="Book candid photographer"
        title={<>Book Maharashtra's Top<br />Candid Wedding Photographer</>}
        sub="Authentic stories. Cinematic delivery. Unforgettable albums."
        whatsappMessage={BOOK_WHATSAPP}
      />

      <LocalSeoNote>
        Candid wedding photography across <strong>Pune</strong>, <strong>Mumbai</strong>, <strong>Nashik</strong>, <strong>Aurangabad</strong>, <strong>Kolhapur</strong>, <strong>Satara</strong>, Solapur, Nagpur, Lonavala, Mahabaleshwar, <strong>Shrigonda</strong>, and all of Maharashtra.
      </LocalSeoNote>

      <WhatsAppCTA message={FLOAT_WHATSAPP} />
    </div>
  )
}

export const Component = CandidPhotographerMaharashtra
export default CandidPhotographerMaharashtra
