import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { GalleryGrid } from '../components/gallery/GalleryGrid'
import { Lightbox } from '../components/gallery/Lightbox'
import { WhatsAppCTA } from '../components/whatsapp/WhatsAppCTA'
import { useLightbox } from '../hooks/useLightbox'
import { getService, getServices } from '../hooks/useServicesData'
import { useReveal } from '../hooks/useReveal'
import { SERVICE_PROFESSIONAL_SERVICE } from '../lib/schema'
import { Seo } from '../lib/seo'
import type { LightboxItem } from '../types/portfolio'

/**
 * The four ?service= variants all canonicalised to /pages/service.html, so
 * that one URL is what search engines have indexed — and /pages/service.html
 * now 301s to /service/weddings. That page therefore keeps the old page's
 * title and descriptions verbatim; the other three are new URLs and get their
 * own copy, which also avoids four pages sharing one description.
 */
const LEGACY_SERVICE_SEO = {
  title: 'Wedding Photography Services – Sumit Ubale | Shrigonda, Maharashtra',
  description: 'Explore professional wedding photography, pre-wedding shoots, cinematic films, and drone videography services in Shrigonda, Ahilyanagar, Pune, and across Maharashtra.',
  ogTitle: 'Wedding Photography Services – Sumit Ubale Photography',
  ogDescription: 'Professional wedding photography, cinematic films, and pre-wedding shoots in Shrigonda, Ahilyanagar & Maharashtra.',
  twitterDescription: 'Professional wedding photography, cinematic films, and pre-wedding shoots in Shrigonda and Maharashtra.',
}

/**
 * A single service. services.json is imported at build time, so each of the
 * four services prerenders as real HTML instead of the client-side template
 * the old pages/service.html?service=… was.
 */
export function ServicePage() {
  const { slug } = useParams<{ slug: string }>()
  const service = getService(slug)
  const sectionRef = useRef<HTMLDivElement>(null)

  const items = useMemo<LightboxItem[]>(
    () => (service?.gallery ?? []).map(item => ({
      src: item.src,
      type: item.type ?? 'image',
      title: service?.title,
      alt: item.alt,
      category: service?.slug,
    })),
    [service],
  )

  const lightbox = useLightbox(items)

  // The featured still is random, as it was before — but only after mount, so
  // the prerendered HTML and the first client render agree.
  const stills = useMemo(() => items.filter(item => item.type !== 'video'), [items])
  const [featured, setFeatured] = useState(0)
  useEffect(() => {
    if (stills.length > 1) setFeatured(Math.floor(Math.random() * stills.length))
  }, [stills.length])

  useReveal(sectionRef, '.stagger-reveal', { y: 30, duration: 1, stagger: 0.1 })

  if (!service) {
    return (
      <div className="container" style={{ padding: '100px', textAlign: 'center' }}>
        <h1>Service Not Found</h1>
        <Link to="/">Back to Home</Link>
      </div>
    )
  }

  const centered = service.slug === 'cinematics' || service.mediaType === 'videos'
  const cover = stills[featured]

  const seo = service.slug === 'weddings'
    ? LEGACY_SERVICE_SEO
    : {
        title: `${service.title} — Sumit Ubale Photography`,
        description: service.heroDescription,
        ogTitle: `${service.title} – Sumit Ubale Photography`,
        ogDescription: service.heroDescription,
        twitterDescription: service.heroDescription,
      }

  return (
    <div id="service-page" ref={sectionRef}>
      <Seo
        title={seo.title}
        description={seo.description}
        keywords="Wedding Photography Services Shrigonda, Pre Wedding Shoot Ahilyanagar, Cinematic Wedding Films Maharashtra, Drone Videography Shrigonda, Wedding Photographer Packages Maharashtra"
        canonical={`https://supf.in/service/${service.slug}`}
        ogTitle={seo.ogTitle}
        ogDescription={seo.ogDescription}
        twitterTitle={seo.ogTitle}
        twitterDescription={seo.twitterDescription}
        geoPlacename="Shrigonda, Ahilyanagar"
        jsonLd={[SERVICE_PROFESSIONAL_SERVICE]}
      />

      <section className="service-hero" id="hero">
        <div className="container">
          <h1 className="service-title stagger-reveal" id="service-title">{service.title}</h1>
          <p className="service-hero-desc stagger-reveal" id="service-hero-desc">{service.heroDescription}</p>
        </div>
      </section>

      {cover && (
        <section className="section service-featured-section">
          <div className="container">
            <div id="random-image-container" className="featured-image-frame stagger-reveal loaded">
              <img src={cover.src} alt={`Featured ${service.title}`} />
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <div className="service-gallery" id="service-gallery">
            <GalleryGrid
              items={items}
              category={service.slug}
              centered={centered}
              onOpen={index => lightbox.open(index, items)}
            />
          </div>
        </div>
      </section>

      <section className="section bg-light">
        <div className="container container-narrow">
          <div className="service-content">
            <div className="service-story stagger-reveal">
              <h2 className="heading-md">The Story</h2>
              <p id="service-story-text">{service.story}</p>
            </div>

            <div className="service-deliverables stagger-reveal">
              <h2 className="heading-md">What's Included</h2>
              <ul className="deliverables-list" id="deliverables-list">
                {service.deliverables.map(item => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </div>
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

      <Lightbox controller={lightbox} />
      <WhatsAppCTA />
    </div>
  )
}

export const Component = ServicePage
export default ServicePage

/** Prerender every service, so each one ships as real HTML. */
export function getStaticPaths() {
  return getServices().map(service => `/service/${service.slug}`)
}
