import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { whatsappLink } from '../../lib/site'
import { WhatsAppIcon } from '../whatsapp/WhatsAppCTA'

/* ============================================================
   Hero
   ============================================================ */

export function LandingHero({ eyebrow, title, sub, children, focus = '30%', opacity = 0.45, overlay = false }: {
  eyebrow: string
  title: ReactNode
  sub: string
  /** CTA buttons. */
  children: ReactNode
  /** background-position Y for the backdrop. */
  focus?: string
  /** Backdrop opacity. */
  opacity?: number
  /** The left-to-right scrim used on the cinematic films page. */
  overlay?: boolean
}) {
  const style = { '--lp-hero-focus': focus, '--lp-hero-opacity': opacity } as CSSProperties

  return (
    <section className="lp-hero" aria-label="Hero section" style={style}>
      <div className="lp-hero-bg" role="presentation" aria-hidden="true" />
      {overlay && <div className="lp-hero-overlay" aria-hidden="true" />}
      <div className="lp-container">
        <div className="lp-hero-content">
          <p className="lp-eyebrow">{eyebrow}</p>
          <h1 className="lp-h1">{title}</h1>
          <p className="lp-hero-sub">{sub}</p>
          <div className="lp-cta-group">{children}</div>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   Calls to action
   ============================================================ */

export function WhatsAppButton({ message, children }: { message: string, children: ReactNode }) {
  return (
    <a
      href={whatsappLink(message)}
      className="lp-cta-whatsapp"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
    >
      <WhatsAppIcon size={20} />
      {children}
    </a>
  )
}

export function PrimaryLink({ to, dark = false, children }: { to: string, dark?: boolean, children: ReactNode }) {
  const className = `lp-cta-primary${dark ? ' lp-cta-primary--dark' : ''}`
  if (to.startsWith('tel:') || to.startsWith('http')) {
    return <a href={to} className={className}>{children}</a>
  }
  return <Link to={to} className={className}>{children}</Link>
}

/* ============================================================
   Sections
   ============================================================ */

export function LandingSection({ variant = 'default', label, title, headingId, children }: {
  variant?: 'default' | 'alt' | 'dark'
  label: string
  title: ReactNode
  headingId: string
  children?: ReactNode
}) {
  const className = variant === 'alt'
    ? 'lp-section-alt'
    : variant === 'dark' ? 'lp-section-dark' : 'lp-section'

  return (
    <section className={className} aria-labelledby={headingId}>
      <div className="lp-container">
        <p className="lp-section-label">{label}</p>
        <h2 className="lp-section-title" id={headingId}>{title}</h2>
        {children}
      </div>
    </section>
  )
}

/* ============================================================
   Stats
   ============================================================ */

export function LandingStats({ items }: { items: { value: string, label: string }[] }) {
  return (
    <div className="lp-stats" aria-label="Key statistics">
      {items.map(stat => (
        <div className="lp-stat" key={stat.label}>
          <span className="lp-stat-number">{stat.value}</span>
          <span className="lp-stat-label">{stat.label}</span>
        </div>
      ))}
    </div>
  )
}

/* ============================================================
   Gallery strip
   ============================================================ */

export function LandingGalleryStrip({ images, wide = false, cta }: {
  images: { src: string, alt: string }[]
  wide?: boolean
  cta?: { to: string, label: string }
}) {
  return (
    <>
      <div className={`lp-gallery-strip${wide ? ' lp-gallery-strip--wide' : ''}`}>
        {images.map((image, index) => (
          // eslint-disable-next-line react/no-array-index-key -- the same file appears twice by design
          <img key={`${image.src}-${index}`} src={image.src} alt={image.alt} loading="lazy" decoding="async" />
        ))}
      </div>
      {cta && (
        <div className="lp-strip-cta">
          <PrimaryLink to={cta.to} dark>{cta.label}</PrimaryLink>
        </div>
      )}
    </>
  )
}

/* ============================================================
   Testimonials
   ============================================================ */

export function LandingTestimonials({ items }: { items: { text: string, author: string }[] }) {
  return (
    <div className="lp-testimonials">
      {items.map(item => (
        <div className="lp-testimonial-card" key={item.author}>
          <div className="lp-stars" aria-label="5 out of 5 stars">★★★★★</div>
          <p className="lp-testimonial-text">{item.text}</p>
          <p className="lp-testimonial-author">{item.author}</p>
        </div>
      ))}
    </div>
  )
}

/* ============================================================
   Location cards / city tags
   ============================================================ */

export function LandingLocations({ items }: { items: { name: string, desc: string }[] }) {
  return (
    <div className="lp-locations-grid">
      {items.map(item => (
        <div className="lp-location-card" key={item.name}>
          <p className="lp-location-name">{item.name}</p>
          <p className="lp-location-desc">{item.desc}</p>
        </div>
      ))}
    </div>
  )
}

export function CityGrid({ cities }: { cities: string[] }) {
  return (
    <div className="lp-cities-grid" aria-label="Cities served">
      {cities.map(city => <div className="lp-city-tag" key={city}>{city}</div>)}
    </div>
  )
}

/* ============================================================
   Packages / process
   ============================================================ */

export function LandingPackages({ items }: {
  items: { name: string, sub: string, features: string[], featured?: boolean }[]
}) {
  return (
    <div className="lp-packages">
      {items.map(item => (
        <div className={`lp-package${item.featured ? ' lp-package--featured' : ''}`} key={item.name}>
          <p className="lp-package-name">{item.name}</p>
          <p className="lp-package-sub">{item.sub}</p>
          <ul className="lp-package-features">
            {item.features.map(feature => <li key={feature}>{feature}</li>)}
          </ul>
        </div>
      ))}
    </div>
  )
}

export function LandingProcess({ items }: { items: { title: string, desc: string }[] }) {
  return (
    <div className="lp-process">
      {items.map(item => (
        <div className="lp-process-step" key={item.title}>
          <p className="lp-process-title">{item.title}</p>
          <p className="lp-process-desc">{item.desc}</p>
        </div>
      ))}
    </div>
  )
}

/* ============================================================
   Closing CTA + local SEO note
   ============================================================ */

export function LandingFinalCta({ title, sub, whatsappMessage, whatsappLabel = 'WhatsApp Us Now', ariaLabel }: {
  title: ReactNode
  sub: string
  whatsappMessage: string
  whatsappLabel?: string
  ariaLabel: string
}) {
  return (
    <section className="lp-final-cta" aria-label={ariaLabel}>
      <h2>{title}</h2>
      <p>{sub}</p>
      <div className="lp-cta-group lp-cta-group--center">
        <WhatsAppButton message={whatsappMessage}>{whatsappLabel}</WhatsAppButton>
        <PrimaryLink to="tel:+919552265951">Call Us</PrimaryLink>
      </div>
    </section>
  )
}

export function LocalSeoNote({ children }: { children: ReactNode }) {
  return <div className="lp-local-seo">{children}</div>
}
