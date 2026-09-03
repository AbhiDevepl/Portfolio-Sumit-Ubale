import { useRef } from 'react'
import {
  LandingFinalCta,
  LandingGalleryStrip,
  LandingHero,
  LandingPackages,
  LandingProcess,
  LandingSection,
  LandingTestimonials,
  LocalSeoNote,
  PrimaryLink,
  WhatsAppButton,
} from '../components/landing/LandingBlocks'
import { LandingFaq } from '../components/landing/LandingFaq'
import { useLandingMotion } from '../components/landing/useLandingMotion'
import { WhatsAppCTA } from '../components/whatsapp/WhatsAppCTA'
import { CINEMATIC_FAQ, CINEMATIC_LOCAL_BUSINESS } from '../lib/schema'
import { Seo } from '../lib/seo'

const HERO_WHATSAPP = 'Hi Sumit! I want to book a cinematic wedding film in Maharashtra. Can you share packages?'
const BOOK_WHATSAPP = 'Hi Sumit! I want to book a cinematic wedding film in Maharashtra.'
const FLOAT_WHATSAPP = 'Hi Sumit! I want to book a cinematic wedding film.'

const PACKAGES = [
  {
    name: 'Highlight Reel',
    sub: '3–5 Minutes',
    features: ['Best moments distilled', 'Instagram & YouTube ready', 'Licensed music', 'Color graded', '4K delivery'],
  },
  {
    name: 'Cinematic Film',
    sub: '8–15 Minutes',
    featured: true,
    features: ['Full narrative arc', 'Vows + emotional dialogue', 'Custom music composition', 'Advanced color grading', '4K + DCI delivery', 'Drone aerial shots'],
  },
  {
    name: 'Documentary Edit',
    sub: '30–90 Minutes',
    features: ['Full ceremony coverage', 'All events included', 'Raw footage archive', 'Multiple camera angles', 'Full-day streaming ready'],
  },
]

const PROCESS = [
  { title: 'Pre-Production', desc: 'We learn your story. Shot list, music preferences, timeline, and venue walkthrough — all planned before the day.' },
  { title: 'Production', desc: 'On the wedding day, our camera team captures with cinema-grade lenses, gimbals, drones, and directional microphones.' },
  { title: 'Post-Production', desc: 'We edit in Adobe Premiere + DaVinci Resolve. Color grading, sound design, music sync, and story-driven assembly.' },
  { title: 'Delivery', desc: 'Your film is delivered via private online link and USB drive. Typically 6–8 weeks after your wedding day.' },
]

const TESTIMONIALS = [
  {
    text: '"I cried watching our wedding film for the third time. It\'s not just a video — it\'s our story, told like a Bollywood film. The music choice, the colour, the editing — all perfect."',
    author: '— Nikhil & Priyanka, Pune',
  },
  {
    text: '"Our parents watched the cinematic film three times in a row. The way Sumit captured the varmala and our vows — it felt like watching a feature film about our life."',
    author: '— Siddharth & Meghana, Nashik',
  },
  {
    text: '"The drone shots of our wedding venue were absolutely breathtaking. Our guests couldn\'t believe how cinematic everything looked. 10/10 would recommend to everyone."',
    author: '— Ajay & Supriya, Mumbai',
  },
]

const FAQ = [
  {
    question: 'What is a cinematic wedding film?',
    answer: 'A cinematic wedding film is a professionally produced short film — typically 4 to 12 minutes — edited with colour grading, music, voiceovers, and storytelling techniques borrowed from cinema. Unlike traditional wedding videos, cinematic films are designed to be watched and rewatched as an emotional piece of art.',
  },
  {
    question: 'How long will my wedding film be?',
    answer: 'Highlight reels are typically 3–5 minutes, designed for social sharing. Full cinematic films run 8–15 minutes with a complete story arc. Extended documentary edits (30–90 minutes) are available as an add-on for complete raw coverage.',
  },
  {
    question: 'What is the difference between a highlight reel and a cinematic film?',
    answer: 'A highlight reel is a 3–5 minute fast-cut edit featuring the best moments set to music — perfect for Instagram. A cinematic film is 8–15 minutes with a full narrative, vows, emotional dialogue, and story arc — designed to be watched like a film. Both are available in our packages.',
  },
  {
    question: 'How soon will I receive my wedding film?',
    answer: 'Highlight reels are typically delivered within 3–4 weeks. Full cinematic films take 6–8 weeks due to the depth of editing, color grading, and sound design involved. Priority turnaround options are available at an additional charge.',
  },
  {
    question: 'Do you include drone footage in the wedding film?',
    answer: 'Yes, drone aerial footage is available as an add-on or included in premium packages. We use licensed drones operated by certified pilots. Drone availability is subject to location clearance and weather conditions on the wedding day.',
  },
]

export function CinematicWeddingFilmsMaharashtra() {
  const rootRef = useRef<HTMLDivElement>(null)
  useLandingMotion(rootRef)

  return (
    <div ref={rootRef}>
      <Seo
        title="Cinematic Wedding Films in Maharashtra – Sumit Ubale Photography"
        description="High-production cinematic wedding films & highlight reels across Maharashtra. Sumit Ubale creates Bollywood-style wedding videos that tell your story with emotion, music, and cinematic brilliance."
        keywords="Cinematic Wedding Films Maharashtra, Wedding Videographer Maharashtra, Wedding Highlight Reel Maharashtra, Cinematic Wedding Video Pune, Wedding Cinematographer Shrigonda"
        canonical="https://supf.in/cinematic-wedding-films-maharashtra"
        ogDescription="Bollywood-style cinematic wedding films & highlight reels across Maharashtra. Emotion, music, and storytelling like no other."
        twitterDescription="High-production cinematic wedding films & highlight reels across Maharashtra."
        geoPlacename="Maharashtra, India"
        jsonLd={[CINEMATIC_LOCAL_BUSINESS, CINEMATIC_FAQ]}
      >
        <meta property="og:video:type" content="video/mp4" />
      </Seo>

      <LandingHero
        eyebrow="Pune · Mumbai · Nashik · All of Maharashtra"
        title={<>Cinematic Wedding<br />Films in<br />Maharashtra</>}
        sub="Your wedding isn't just a ceremony — it's a film waiting to be made. We create Bollywood-style cinematic wedding films that you'll watch for the rest of your life."
        focus="30%"
        opacity={0.45}
        overlay
      >
        <WhatsAppButton message={HERO_WHATSAPP}>WhatsApp Us</WhatsAppButton>
        <PrimaryLink to="/portfolio?category=cinematics">Watch Sample Films</PrimaryLink>
      </LandingHero>

      <LandingSection
        label="The Art"
        headingId="story-heading"
        title={<>Your Wedding, as a Film<br />You'll Watch Forever</>}
      >
        <p className="lp-body">A wedding video, done right, isn't documentation — it's cinema. Sumit Ubale approaches every wedding film with a director's eye. The emotional arc. The lighting. The music selection. The color grade. The way the edit breathes.</p>
        <p className="lp-body">He has shot cinematic wedding films from intimate village weddings in Shrigonda to multi-function destination celebrations at resorts in Lonavala and Mahabaleshwar. Each film is crafted uniquely for that couple's story — never templated, never generic.</p>
        <p className="lp-body">When the music swells and you see yourself on screen the way we saw you — you'll understand why cinematic wedding films are worth every rupee.</p>
      </LandingSection>

      <LandingSection
        variant="dark"
        label="Film Types"
        headingId="packages-heading"
        title={<>Choose Your<br />Film Format</>}
      >
        <LandingPackages items={PACKAGES} />
      </LandingSection>

      <LandingSection variant="alt" label="How It Works" headingId="process-heading" title="Our Film-Making Process">
        <LandingProcess items={PROCESS} />
      </LandingSection>

      <LandingSection
        label="Sample Work"
        headingId="gallery-heading"
        title={<>Cinematic Wedding<br />Film Stills</>}
      >
        <p className="lp-body">Each frame below is a still from an actual cinematic wedding film. The quality of the motion picture is what you'd expect — and more.</p>
        <LandingGalleryStrip
          wide
          images={[
            { src: 'https://exdevx.sirv.com/IMG_Hero_peub99.webp?w=800&q=80', alt: 'Cinematic wedding film still Maharashtra' },
            { src: 'https://exdevx.sirv.com/3.jpg?w=800&q=80', alt: 'Wedding highlight reel frame Pune' },
            { src: 'https://exdevx.sirv.com/IMG_Hero_peub99.webp?w=800&q=80', alt: 'Wedding cinematography still Mumbai' },
          ]}
          cta={{ to: '/portfolio?category=cinematics', label: 'Watch Films in Portfolio' }}
        />
      </LandingSection>

      <LandingSection
        variant="alt"
        label="Reviews"
        headingId="testimonials-heading"
        title={<>What Our Clients Say<br />About the Films</>}
      >
        <LandingTestimonials items={TESTIMONIALS} />
      </LandingSection>

      <LandingSection label="FAQ" headingId="faq-heading" title="Wedding Films — Your Questions">
        <LandingFaq items={FAQ} />
      </LandingSection>

      <LandingFinalCta
        ariaLabel="Book your wedding film"
        title={<>Let's Make Your<br />Wedding Film</>}
        sub="A film you'll watch for the rest of your life. Enquire now — dates fill fast."
        whatsappMessage={BOOK_WHATSAPP}
      />

      <LocalSeoNote>
        Cinematic wedding films across <strong>Pune</strong>, <strong>Mumbai</strong>, <strong>Nashik</strong>, Aurangabad, Lonavala, Mahabaleshwar, <strong>Shrigonda</strong>, and all of Maharashtra.
      </LocalSeoNote>

      <WhatsAppCTA message={FLOAT_WHATSAPP} />
    </div>
  )
}

export const Component = CinematicWeddingFilmsMaharashtra
export default CinematicWeddingFilmsMaharashtra
