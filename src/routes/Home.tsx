import { AboutSection } from '../components/home/AboutSection'
import { ContactSection } from '../components/home/ContactSection'
import { Hero } from '../components/home/Hero'
import { PortfolioSection } from '../components/home/PortfolioSection'
import { Testimonials } from '../components/home/Testimonials'
import { WhatsAppCTA } from '../components/whatsapp/WhatsAppCTA'
import { HOME_FAQ, HOME_LOCAL_BUSINESS } from '../lib/schema'
import { Seo } from '../lib/seo'

export function Home() {
  return (
    <>
      <Seo
        title="Sumit Ubale Photography – Wedding Photographer in Shrigonda"
        description="Professional candid wedding photographer in Shrigonda, Maharashtra. Specializing in cinematic wedding films, pre-wedding shoots, and luxury visual storytelling."
        keywords="Wedding Photographer Shrigonda, Best Wedding Photographer Shrigonda, Professional Wedding Photographer Shrigonda, Wedding Photography Shrigonda, Candid Wedding Photographer Shrigonda, Pre Wedding Shoot Shrigonda"
        canonical="https://supf.in"
        ogDescription="Professional candid wedding photographer and filmmaker specializing in luxury wedding storytelling in Maharashtra."
        twitterDescription="Expert candid wedding photography and cinematic films in Shrigonda, Ahilyanagar, and Pune."
        geoPlacename="Shrigonda, Ahilyanagar"
        jsonLd={[HOME_LOCAL_BUSINESS, HOME_FAQ]}
      />

      <Hero />
      <AboutSection />
      <PortfolioSection />
      <Testimonials />
      <ContactSection />

      <WhatsAppCTA />
    </>
  )
}

export const Component = Home
export default Home
