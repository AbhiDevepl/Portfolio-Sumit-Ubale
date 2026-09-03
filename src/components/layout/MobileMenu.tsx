import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap, useGSAP } from '../../lib/gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { SITE } from '../../lib/site'

const MOBILE_LINKS = [
  { label: 'Home', to: '/', num: '01' },
  { label: 'Portfolio', to: '/#portfolio', num: '04' },
  { label: 'Albums', to: '/albums', num: '05' },
  { label: 'Gallery', to: '/portfolio', num: '06' },
  { label: 'About', to: '/#about', num: '07' },
  { label: 'Enquire', to: '/#contact', num: '08' },
]

const OPEN_CLIP = 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)'
const CLOSED_CLIP = 'polygon(0 0, 100% 0, 100% 0, 0 0)'

/**
 * Full-screen mobile overlay. Timing values ported verbatim from
 * legacy/scripts/navigation.js.
 */
export function MobileMenu({ open, onClose }: { open: boolean, onClose: () => void }) {
  const menuRef = useRef<HTMLDivElement>(null)
  const opened = useRef(false)
  const reduced = useReducedMotion()

  useGSAP(() => {
    const menu = menuRef.current
    if (!menu) return

    // Nothing to do until the menu has been opened once: the closed state is
    // the CSS default, so animating it on mount would be busywork.
    if (open) opened.current = true
    else if (!opened.current) return

    const links = menu.querySelectorAll('.mobile-nav-link')
    const footer = menu.querySelector('.mobile-menu-footer')

    if (reduced) {
      // No animation, but the panel must still open and close.
      gsap.set(menu, { clipPath: open ? OPEN_CLIP : CLOSED_CLIP })
      gsap.set([links, footer], { y: 0, opacity: open ? 1 : 0 })
      return
    }

    if (open) {
      gsap.timeline()
        .to(menu, { clipPath: OPEN_CLIP, duration: 0.8, ease: 'power4.inOut' })
        .to(links, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out' }, '-=0.3')
        .to(footer, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, '-=0.4')
    }
    else {
      gsap.timeline()
        .to([links, footer], { y: 20, opacity: 0, duration: 0.4, ease: 'power3.in' })
        .to(menu, { clipPath: CLOSED_CLIP, duration: 0.6, ease: 'power4.inOut' })
    }
  }, { dependencies: [open, reduced] })

  return (
    <div className={`mobile-menu${open ? ' active' : ''}`} ref={menuRef}>
      <div className="mobile-menu-container">
        <nav className="mobile-nav">
          {MOBILE_LINKS.map(link => (
            <Link key={link.to} to={link.to} className="mobile-nav-link" onClick={onClose}>
              {link.label}
              {' '}
              <span className="mobile-nav-num">{link.num}</span>
            </Link>
          ))}
        </nav>
        <div className="mobile-menu-footer">
          <p className="mobile-menu-text">Based in Shrigonda Maharashtra India</p>
          <div className="mobile-social">
            <a href={SITE.instagram} className="mobile-social-link" target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
