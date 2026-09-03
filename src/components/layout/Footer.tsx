import { Link } from 'react-router-dom'

/** Site-links nav kept from index.html — these are the indexed SEO routes. */
const FOOTER_LINKS = [
  { label: 'Wedding Photographer Shrigonda', to: '/wedding-photographer-shrigonda' },
  { label: 'Pre-Wedding Shoot Ahilyanagar', to: '/pre-wedding-shoot-ahilyanagar' },
  { label: 'Candid Photographer Maharashtra', to: '/candid-photographer-maharashtra' },
  { label: 'Cinematic Wedding Films Maharashtra', to: '/cinematic-wedding-films-maharashtra' },
  { label: 'Services', to: '/service/weddings' },
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'Albums', to: '/albums' },
]

export function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <nav aria-label="Site links" className="footer-links">
          <ul>
            {FOOTER_LINKS.map(link => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="footer-text">
          &copy; {new Date().getFullYear()} Sumit Ubale Photography. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
