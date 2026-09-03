import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export interface NavLinkSpec {
  label: string
  to: string
  cta?: boolean
}

/**
 * Shared navigation. Replaces both the hand-written <nav> in index.html and
 * the runtime Core.DOM.injectGlobalComponents() markup the sub-pages relied
 * on — a page that forgot to call it shipped with no navigation at all.
 */
const NAV_LINKS: NavLinkSpec[] = [
  { label: 'Everything', to: '/#portfolio' },
  { label: 'Albums', to: '/albums' },
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'Services', to: '/service/weddings' },
  { label: 'About', to: '/#about' },
  { label: 'Enquire', to: '/#contact', cta: true },
]

export function Nav({ menuOpen, onToggleMenu }: {
  menuOpen: boolean
  onToggleMenu: () => void
}) {
  const [scrolled, setScrolled] = useState(false)

  // State change, not an animation: it runs regardless of motion preference.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.9)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`nav${scrolled ? ' nav-scrolled' : ''}`} role="navigation" aria-label="Main navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo" aria-label="Home">SUMIT UBALE</Link>
        <div className="nav-menu">
          {NAV_LINKS.map(link => (
            <Link key={link.to} to={link.to} className={link.cta ? 'nav-cta' : 'nav-link'}>
              {link.label}
            </Link>
          ))}
        </div>
        <button
          className={`nav-toggle${menuOpen ? ' active' : ''}`}
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={onToggleMenu}
        >
          <span className="nav-toggle-line" />
          <span className="nav-toggle-line" />
        </button>
      </div>
    </nav>
  )
}
