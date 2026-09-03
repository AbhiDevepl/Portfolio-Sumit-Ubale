/**
 * Typed models for public/data/portfolio.json and public/data/services.json.
 * Inferred from the actual files — the JSON schema is developer-maintained and
 * must not change, so these types follow it rather than the other way round.
 */

export type MediaType = 'image' | 'video'

export interface PortfolioCategory {
  id: string
  name: string
  /** Key into `PortfolioData.portfolio.images`. `all` is the pseudo-category. */
  slug: string
}

export interface PortfolioImage {
  id: number
  title: string
  type: MediaType
  src: string
  alt: string
  /** CSS aspect-ratio string, e.g. "3/4" or "16/9". */
  aspectRatio: string
}

export interface AboutInfo {
  name: string
  tagline: string
  bio: string
  image: string
  social: {
    instagram: string
    email: string
    phone: string
  }
}

export interface PortfolioData {
  portfolio: {
    categories: PortfolioCategory[]
    images: Record<string, PortfolioImage[]>
  }
  about: AboutInfo
}

/** A portfolio image with the category key it was found under attached. */
export interface GalleryItem extends PortfolioImage {
  category: string
}

/** Anything the lightbox can display. */
export interface LightboxItem {
  src: string
  type: MediaType
  title?: string
  alt?: string
  category?: string
  poster?: string
}

export interface ServiceGalleryItem {
  src: string
  alt: string
  type?: MediaType
}

export interface Service {
  slug: string
  title: string
  heroDescription: string
  story: string
  mediaType: 'photos' | 'videos' | 'mixed'
  deliverables: string[]
  gallery: ServiceGalleryItem[]
}

export interface ServicesData {
  services: Service[]
}
