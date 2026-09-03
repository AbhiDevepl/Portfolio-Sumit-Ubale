import { Link, useSearchParams } from 'react-router-dom'
import { Gallery } from '../components/gallery/Gallery'
import { WhatsAppCTA } from '../components/whatsapp/WhatsAppCTA'
import { usePortfolioData } from '../hooks/usePortfolioData'
import { Seo } from '../lib/seo'
import { formatCategoryName } from '../lib/site'

export function GalleryPage() {
  const [searchParams] = useSearchParams()
  const slug = searchParams.get('category') ?? searchParams.get('c') ?? 'all'
  const { data } = usePortfolioData()

  const info = data?.portfolio.categories.find(entry => entry.slug === slug)
  const heading = info?.name ?? (slug === 'all' ? 'Gallery' : formatCategoryName(slug))

  return (
    <>
      <Seo
        title="Gallery - Sumit Ubale Photography | Wedding & Pre-Wedding Portfolio"
        description="Browse the full photography gallery – wedding, pre-wedding, haldi, engagement, and cinematic films by Sumit Ubale in Shrigonda, Maharashtra."
        canonical="https://supf.in/gallery"
        ogTitle="Gallery - Sumit Ubale Photography"
        ogDescription="Wedding, pre-wedding, and cinematic photography portfolio. Shrigonda, Maharashtra."
        twitterTitle="Gallery - Sumit Ubale Photography"
        twitterDescription="Wedding, pre-wedding, and cinematic photography portfolio. Shrigonda, Maharashtra."
      />

      <section className="gallery-page section">
        <div className="container">
          <div className="gallery-header">
            <Link to="/#portfolio" className="back-link">
              <span>&larr;</span> Back to Portfolio
            </Link>
            <h1 className="gallery-category-title" id="category-title">{heading}</h1>
          </div>

          <Gallery />
        </div>
      </section>

      <section className="section service-cta">
        <div className="container">
          <div className="cta-box">
            <h2 className="heading-lg">Ready to capture your story?</h2>
            <p className="body-lg">Let's create something timeless together.</p>
            <Link to="/#contact" className="btn-cta">Enquire Now</Link>
          </div>
        </div>
      </section>

      <WhatsAppCTA />
    </>
  )
}

export const Component = GalleryPage
export default GalleryPage
