import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ALBUMS_WHATSAPP_MESSAGE, WhatsAppCTA } from '../components/whatsapp/WhatsAppCTA'
import { usePortfolioData } from '../hooks/usePortfolioData'
import { useReveal } from '../hooks/useReveal'
import { Seo } from '../lib/seo'

/** Sirv needs `profile=true` on the cover URL for colour accuracy. */
function withSirvProfile(src: string): string {
  if (!src.includes('sirv.com') || src.includes('profile=true')) return src
  return `${src}${src.includes('?') ? '&' : '?'}profile=true`
}

export function Albums() {
  const gridRef = useRef<HTMLDivElement>(null)
  const { data } = usePortfolioData()

  // The cover is a random still, as it was before — seeded after mount so the
  // choice never differs between the prerendered HTML and the first render.
  const [seed, setSeed] = useState(0)
  useEffect(() => setSeed(Math.random()), [])

  const albums = useMemo(() => {
    if (!data) return []

    return data.portfolio.categories
      .filter(category => category.slug !== 'all' && (data.portfolio.images[category.slug]?.length ?? 0) > 0)
      .map((category) => {
        const stills = (data.portfolio.images[category.slug] ?? []).filter(item => item.type === 'image')
        const cover = stills[Math.floor(seed * stills.length)]
        return {
          ...category,
          cover: cover ? withSirvProfile(cover.src) : '/assets/images/cover/default.jpg',
        }
      })
  }, [data, seed])

  useReveal(gridRef, '.album-card', { y: 40, stagger: 0.08 }, [albums.length])

  return (
    <>
      <Seo
        title="Wedding Albums - Sumit Ubale Photography"
        description="Wedding album collections and prints by Sumit Ubale. Premium wedding photography albums in Shrigonda, Maharashtra."
        canonical="https://supf.in/albums"
        ogTitle="Wedding Albums - Sumit Ubale Photography"
        ogDescription="Premium wedding album collections. Shrigonda, Maharashtra."
        twitterTitle="Wedding Albums - Sumit Ubale Photography"
        twitterDescription="Premium wedding album collections. Shrigonda, Maharashtra."
      />

      <section className="albums-page section">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center' }}>
            <h1 className="heading-xl">Our Albums</h1>
            <p className="body-lg" style={{ maxWidth: '600px', margin: '0 auto' }}>
              Explore our categorized collections of moments captured in time.
            </p>
          </div>

          <div className="albums-grid" id="albums-grid" ref={gridRef}>
            {albums.map(album => (
              <Link
                key={album.slug}
                className="album-card"
                to={`/gallery?category=${album.slug}`}
                aria-label={`${album.name} gallery`}
              >
                <img src={album.cover} alt={album.name} className="album-image" loading="lazy" />
                <div className="album-content">
                  <h2 className="album-title">{album.name}</h2>
                  <span className="album-learn-more">Learn More</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <WhatsAppCTA message={ALBUMS_WHATSAPP_MESSAGE} />
    </>
  )
}

export const Component = Albums
export default Albums
