import type { ReactNode } from 'react'
import { Head } from 'vite-react-ssg'
import { SITE } from './site'

export interface SeoProps {
  title: string
  description: string
  keywords?: string
  /** Absolute canonical URL, e.g. `https://supf.in/portfolio`. */
  canonical: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  /** Geo/ICBM tags — the location-targeted pages carry them. */
  geoPlacename?: string
  /** One entry per JSON-LD block. Emitted verbatim. */
  jsonLd?: unknown[]
  robots?: string
  /** Extra head tags a single route needs (og:video:type, for instance). */
  children?: ReactNode
}

/**
 * Dollar signs are emitted as their \u escape because the SSG injects the head with
 * String.replace(), where a literal `$$` in the replacement collapses to a
 * single `$` — which silently turned `"priceRange": "$$"` into `"$"`.
 * JSON parsers decode the escape, so the emitted data is unchanged.
 */
function serializeJsonLd(block: unknown): string {
  return JSON.stringify(block).replace(/\$/g, '\\u0024')
}

/**
 * Every <title>, meta tag, canonical link and JSON-LD block for a route.
 * Values are ported verbatim from the static pages; only the delivery
 * mechanism changed. Rendered into the prerendered HTML at build time, so a
 * crawler sees them without running any JavaScript.
 */
export function Seo({
  title,
  description,
  keywords,
  canonical,
  ogTitle = title,
  ogDescription = description,
  ogImage = SITE.ogImage,
  ogType = 'website',
  twitterTitle = title,
  twitterDescription = description,
  twitterImage = SITE.ogImage,
  geoPlacename,
  jsonLd = [],
  robots = 'index, follow',
  children,
}: SeoProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords ? <meta name="keywords" content={keywords} /> : null}
      <meta name="author" content={SITE.author} />
      <link rel="canonical" href={canonical} />
      <meta name="robots" content={robots} />

      {geoPlacename ? <meta name="geo.region" content={SITE.geo.region} /> : null}
      {geoPlacename ? <meta name="geo.placename" content={geoPlacename} /> : null}
      {geoPlacename ? <meta name="geo.position" content={SITE.geo.position} /> : null}
      {geoPlacename ? <meta name="ICBM" content={SITE.geo.icbm} /> : null}

      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE.name} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={twitterTitle} />
      <meta name="twitter:description" content={twitterDescription} />
      <meta name="twitter:image" content={twitterImage} />

      {children}

      {jsonLd.map((block, index) => (
        // eslint-disable-next-line react/no-array-index-key -- static, ordered list
        <script key={index} type="application/ld+json">
          {serializeJsonLd(block)}
        </script>
      ))}
    </Head>
  )
}
