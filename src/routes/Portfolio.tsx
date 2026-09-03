import { Gallery } from '../components/gallery/Gallery'
import { PORTFOLIO_WHATSAPP_MESSAGE, WhatsAppCTA } from '../components/whatsapp/WhatsAppCTA'
import { PORTFOLIO_CATEGORIES, PORTFOLIO_CATEGORY_LABELS } from '../lib/categories'
import { PORTFOLIO_LOCAL_BUSINESS } from '../lib/schema'
import { Seo } from '../lib/seo'

export function Portfolio() {
  return (
    <>
      <Seo
        title="Portfolio – Sumit Ubale Photography | Wedding Photographer Shrigonda"
        description="Explore my portfolio of candid wedding photography, pre-wedding shoots, and cinematic films. Professional photography services in Shrigonda, Ahilyanagar, and Maharashtra."
        keywords="Wedding Photographer Shrigonda, Wedding Photographer Ahilyanagar, Candid Wedding Photographer Maharashtra, Pre Wedding Shoot Shrigonda, Portfolio"
        canonical="https://supf.in/portfolio"
        ogTitle="Portfolio – Sumit Ubale Photography"
        ogDescription="Explore my portfolio of candid wedding photography, pre-wedding shoots, and cinematic films."
        twitterTitle="Portfolio – Sumit Ubale Photography"
        twitterDescription="Explore my portfolio of candid wedding photography, pre-wedding shoots, and cinematic films."
        geoPlacename="Shrigonda, Ahilyanagar"
        jsonLd={[PORTFOLIO_LOCAL_BUSINESS]}
      />

      <div className="portfolio-page">
        <section className="portfolio-hero">
          <div className="container">
            <div className="portfolio-hero-content">
              <h1 className="portfolio-title">Portfolio</h1>
              <p className="portfolio-subtitle">Capturing moments that last forever</p>
            </div>
          </div>
        </section>

        <section className="portfolio-gallery-section">
          <div className="container">
            <Gallery
              categories={PORTFOLIO_CATEGORIES}
              labels={PORTFOLIO_CATEGORY_LABELS}
              variant="chips"
              order="curated"
            />
          </div>
        </section>
      </div>

      <WhatsAppCTA message={PORTFOLIO_WHATSAPP_MESSAGE} />
    </>
  )
}

export const Component = Portfolio
export default Portfolio
