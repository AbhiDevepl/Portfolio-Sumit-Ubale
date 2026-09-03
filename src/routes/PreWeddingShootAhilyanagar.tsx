import { useRef } from 'react'
import {
  LandingFinalCta,
  LandingGalleryStrip,
  LandingHero,
  LandingLocations,
  LandingSection,
  LandingTestimonials,
  LocalSeoNote,
  PrimaryLink,
  WhatsAppButton,
} from '../components/landing/LandingBlocks'
import { LandingFaq } from '../components/landing/LandingFaq'
import { useLandingMotion } from '../components/landing/useLandingMotion'
import { WhatsAppCTA } from '../components/whatsapp/WhatsAppCTA'
import { PREWEDDING_FAQ, PREWEDDING_LOCAL_BUSINESS } from '../lib/schema'
import { Seo } from '../lib/seo'

const HERO_WHATSAPP = 'Hi Sumit! I want to book a pre-wedding shoot in Ahilyanagar. Can you share details?'
const BOOK_WHATSAPP = 'Hi Sumit! I want to book a pre-wedding shoot in Ahilyanagar.'

const LOCATIONS = [
  { name: 'Bhandardara Lake', desc: 'Serene backwaters, misty mountains, and dramatic sunsets — perfect for romantic moody frames.' },
  { name: 'Ahmednagar Fort', desc: 'Historic Mughal architecture as a backdrop creates powerful, timeless editorial-style portraits.' },
  { name: 'Mula Dam, Rahuri', desc: 'Expansive water views, golden light reflections, and open skies ideal for wide, cinematic breathing shots.' },
  { name: 'Shrigonda Farmlands', desc: 'Lush green sugarcane fields and rustic farm settings create an authentic, earthy Maharashtrian love story.' },
  { name: 'Wilson Dam, Bhandardara', desc: 'A historic British-era dam surrounded by forests — dramatic, unique, and rarely used for photography sessions.' },
  { name: 'Custom Location', desc: 'Have a special place in mind? Your college, your first date spot, or a family property — we\'ll make it work.' },
]

const TESTIMONIALS = [
  {
    text: '"Our pre-wedding shoot at Bhandardara was an absolute dream. Sumit knew exactly where to position us for the most magical light. The photos look like they\'re from a Bollywood film!"',
    author: '— Vishal & Pooja, Ahmednagar',
  },
  {
    text: '"We were very nervous about the camera, but Sumit made us laugh and feel so natural. The results were beyond what we imagined. Every frame tells our story."',
    author: '— Pratik & Shruti, Shrigonda',
  },
]

const FAQ = [
  {
    question: 'Where can I do a pre-wedding shoot in Ahilyanagar?',
    answer: 'Ahilyanagar offers many beautiful locations — the historic Ahmednagar Fort, serene Bhandardara Lake, the lush green fields around Shrigonda, the Mula Dam backwaters, and the scenic Western Ghats foothills. Sumit scouts the best location based on your vision and personality.',
  },
  {
    question: 'How much does a pre-wedding shoot cost in Ahilyanagar?',
    answer: 'Packages typically start from ₹8,000 and can go up to ₹30,000+ for full-day destination shoots at multiple locations. Contact us on WhatsApp for a custom quote based on your preferred location, date, and requirements.',
  },
  {
    question: 'What should we wear for the pre-wedding shoot?',
    answer: 'We recommend coordinated, complementary outfits — not identical. For outdoor shoots in Ahilyanagar, earthy tones, pastels, and floral patterns work beautifully. We send you a full styling guide after booking to help you prepare.',
  },
  {
    question: 'How many photos will I receive from the pre-wedding shoot?',
    answer: 'A standard pre-wedding session delivers 50–100 fully edited, high-resolution photos delivered via an online gallery. Extended sessions deliver more. All photos are color-graded with a consistent, cinematic edit style.',
  },
  {
    question: 'Do you also create a pre-wedding video/reel?',
    answer: 'Yes! We offer cinematic pre-wedding video reels as an add-on. These are short, beautifully edited films (2–4 minutes) perfect for sharing at your wedding reception or on social media. Ask us for details when you book.',
  },
]

export function PreWeddingShootAhilyanagar() {
  const rootRef = useRef<HTMLDivElement>(null)
  useLandingMotion(rootRef)

  return (
    <div ref={rootRef}>
      <Seo
        title="Pre-Wedding Shoot in Ahilyanagar – Sumit Ubale Photography"
        description="Book a stunning pre-wedding photoshoot in Ahilyanagar with Sumit Ubale. Creative sessions at scenic locations across Shrigonda, Pune & Maharashtra with cinematic storytelling."
        keywords="Pre Wedding Shoot Ahilyanagar, Pre Wedding Photography Shrigonda, Pre Wedding Photographer Ahilyanagar, Pre Wedding Shoot Maharashtra, Pre Wedding Photographer Shrigonda"
        canonical="https://supf.in/pre-wedding-shoot-ahilyanagar"
        ogDescription="Creative pre-wedding photoshoots at scenic locations in Ahilyanagar, Shrigonda & Maharashtra. Cinematic storytelling by Sumit Ubale."
        twitterDescription="Creative pre-wedding photoshoots at scenic locations across Ahilyanagar & Maharashtra."
        geoPlacename="Ahilyanagar, Maharashtra"
        jsonLd={[PREWEDDING_LOCAL_BUSINESS, PREWEDDING_FAQ]}
      />

      <LandingHero
        eyebrow="Ahilyanagar · Shrigonda · Maharashtra"
        title={<>Pre-Wedding Shoot<br />in Ahilyanagar</>}
        sub="Create memories before the big day. Creative, cinematic, and deeply personal pre-wedding sessions at the most stunning locations across Ahilyanagar and Maharashtra."
        focus="40%"
        opacity={0.4}
      >
        <WhatsAppButton message={HERO_WHATSAPP}>WhatsApp Us</WhatsAppButton>
        <PrimaryLink to="/#contact">Book a Session</PrimaryLink>
      </LandingHero>

      <LandingSection
        label="Why Pre-Wedding?"
        headingId="about-heading"
        title={<>Your Story, Before<br /> the Wedding Day</>}
      >
        <p className="lp-body">A pre-wedding shoot is not just about having beautiful photographs. It's about discovering how you look together in front of a camera, building comfort with your photographer, and creating a visual narrative of your love story before the grand celebration begins.</p>
        <p className="lp-body">Sumit Ubale specializes in creating pre-wedding sessions that feel natural, joyful, and deeply cinematic. No stiff posing. No forced smiles. Just the two of you — at a location that speaks to your story — captured with an artist's eye.</p>
        <p className="lp-body">From the golden fields around Shrigonda to the misty ghats near Bhandardara, from urban cafés in Pune to the majestic Ahmednagar Fort, we know exactly how to make Ahilyanagar come alive in your frames.</p>
      </LandingSection>

      <LandingSection
        variant="alt"
        label="Top Locations"
        headingId="locations-heading"
        title={<>Best Pre-Wedding Shoot Locations<br />in Ahilyanagar</>}
      >
        <LandingLocations items={LOCATIONS} />
      </LandingSection>

      <LandingSection
        label="Our Work"
        headingId="gallery-heading"
        title={<>Pre-Wedding Photography<br />Portfolio</>}
      >
        <LandingGalleryStrip
          images={[
            { src: 'https://exdevx.sirv.com/IMG_Hero_peub99.webp?w=500&q=80', alt: 'Pre-wedding shoot Ahilyanagar couple' },
            { src: 'https://exdevx.sirv.com/3.jpg?w=500&q=80', alt: 'Pre-wedding photography Maharashtra' },
            { src: 'https://exdevx.sirv.com/IMG_Hero_peub99.webp?w=500&q=80', alt: 'Outdoor pre-wedding shoot Shrigonda' },
          ]}
          cta={{
            to: '/portfolio?category=pre-wedding-photos-and-videos',
            label: 'View Pre-Wedding Gallery',
          }}
        />
      </LandingSection>

      <LandingSection variant="alt" label="Reviews" headingId="testimonials-heading" title="What Couples Say">
        <LandingTestimonials items={TESTIMONIALS} />
      </LandingSection>

      <LandingSection label="FAQ" headingId="faq-heading" title="Pre-Wedding Shoot — Common Questions">
        <LandingFaq items={FAQ} />
      </LandingSection>

      <LandingFinalCta
        ariaLabel="Book your pre-wedding shoot"
        title={<>Book Your Pre-Wedding<br />Shoot Today</>}
        sub="Limited dates available each month. Enquire now to secure yours."
        whatsappMessage={BOOK_WHATSAPP}
      />

      <LocalSeoNote>
        Pre-wedding photography services across <strong>Ahilyanagar</strong>, <strong>Shrigonda</strong>, <strong>Karjat</strong>, <strong>Rahuri</strong>, <strong>Sangamner</strong>, Bhandardara, Pune, and all of Maharashtra.
      </LocalSeoNote>

      <WhatsAppCTA message={HERO_WHATSAPP} />
    </div>
  )
}

export const Component = PreWeddingShootAhilyanagar
export default PreWeddingShootAhilyanagar
