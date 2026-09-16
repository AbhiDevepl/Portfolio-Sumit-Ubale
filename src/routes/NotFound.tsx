import { Link } from 'react-router-dom'
import { Seo } from '../lib/seo'

/**
 * Client-side 404. Reached when in-app navigation lands on an unknown path.
 *
 * Note: a direct hit on an unknown URL is answered by Netlify, not by this
 * route — there is no dist/404.html yet, so Netlify serves its own page.
 */
export function NotFound() {
  return (
    <>
      <Seo
        title="Page not found — Sumit Ubale Photography"
        description="The page you are looking for doesn't exist or may have been moved."
        canonical="https://supf.in/"
        robots="noindex,follow"
      />

      <section className="section" style={{ minHeight: '70vh', display: 'grid', placeItems: 'center' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <p className="caption text-gray">Error 404</p>
          <h1 className="heading-lg">Page not found</h1>
          <p className="body-lg" style={{ maxWidth: '30rem', margin: '0 auto var(--space-8)' }}>
            Sorry, the page you are looking for doesn't exist or may have been moved.
          </p>
          <Link to="/" className="btn-cta">Back to Home</Link>
        </div>
      </section>
    </>
  )
}

export const Component = NotFound
export default NotFound
