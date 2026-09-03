import { useLenis } from 'lenis/react'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useReducedMotion } from '../../hooks/useReducedMotion'

/**
 * Anchor and route scrolling. A full page load used to do this for free;
 * with client-side routing it has to be handled explicitly.
 *
 * Same offset and duration as the anchor binding in smooth-scroll.js, and the
 * same native fallback when Lenis is absent or reduced motion is on.
 */
export function ScrollToHash() {
  const { pathname, hash } = useLocation()
  const lenis = useLenis()
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'auto' })
      return
    }

    // The target may belong to a route that has only just mounted.
    const frame = requestAnimationFrame(() => {
      const target = document.querySelector(hash)
      if (!target) return

      if (lenis && !reduced) {
        lenis.scrollTo(target as HTMLElement, { offset: -100, duration: 1.5 })
      }
      else {
        target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
      }
    })

    return () => cancelAnimationFrame(frame)
  }, [pathname, hash, lenis, reduced])

  return null
}
