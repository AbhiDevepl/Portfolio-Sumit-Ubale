import type { RefObject } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'
import { useReducedMotion } from './useReducedMotion'

export interface RevealOptions {
  y?: number
  scale?: number
  duration?: number
  stagger?: number
  threshold?: number
  rootMargin?: string
}

/**
 * Fade/rise elements in as they enter the viewport.
 *
 * Ported from legacy/scripts/motion.js. The design note there still applies:
 * reveals use ONE IntersectionObserver rather than a ScrollTrigger per element,
 * because the portfolio grid can hold well over a thousand items. GSAP still
 * drives the tween; only transform and opacity are animated, so nothing here
 * triggers layout.
 *
 * Content is never left stranded at opacity 0: with reduced motion on, or when
 * the effect is torn down mid-flight, everything is made plainly visible.
 */
export function useReveal(
  scope: RefObject<HTMLElement | null>,
  selector: string,
  opts: RevealOptions = {},
  dependencies: unknown[] = [],
) {
  const reduced = useReducedMotion()
  const {
    y = 28,
    scale = 1,
    duration = 0.9,
    stagger = 0.06,
    threshold = 0.12,
    rootMargin = '0px 0px -8% 0px',
  } = opts

  useGSAP(() => {
    const root = scope.current
    if (!root) return

    const items = Array.from(root.querySelectorAll<HTMLElement>(selector))
    if (!items.length) return

    const show = (el: HTMLElement) => {
      el.style.opacity = ''
      el.style.transform = ''
      el.style.willChange = ''
      el.classList.add('is-revealed')
    }

    // Reduced motion: show everything, animate nothing.
    if (reduced) {
      items.forEach(show)
      return
    }

    gsap.set(items, { opacity: 0, y, scale, force3D: true, willChange: 'transform, opacity' })

    const pending = new Set(items)

    const observer = new IntersectionObserver((entries, obs) => {
      const entering = entries.filter(e => e.isIntersecting).map(e => e.target as HTMLElement)
      if (!entering.length) return
      entering.forEach(el => obs.unobserve(el))

      gsap.to(entering, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration,
        ease: 'power3.out',
        stagger: { each: stagger, from: 'start' },
        overwrite: 'auto',
        onComplete() {
          // Drop the compositor hint once the work is done.
          entering.forEach(el => {
            el.style.willChange = 'auto'
            el.classList.add('is-revealed')
            pending.delete(el)
          })
        },
      })
    }, { threshold, rootMargin })

    items.forEach(el => observer.observe(el))

    return () => {
      observer.disconnect()
      pending.forEach(show)
    }
  }, { scope, dependencies: [reduced, selector, ...dependencies], revertOnUpdate: true })
}

/**
 * Scrubbed parallax. `amount` is a percentage of the element's own height,
 * so it stays proportional across breakpoints. Ported from motion.js.
 */
export function useParallax(
  scope: RefObject<HTMLElement | null>,
  selector: string,
  opts: { amount?: number, triggerSelector?: string } = {},
  dependencies: unknown[] = [],
) {
  const reduced = useReducedMotion()
  const { amount = 12, triggerSelector } = opts

  useGSAP(() => {
    const root = scope.current
    if (!root || reduced) return

    const el = root.querySelector<HTMLElement>(selector)
    if (!el) return

    const trigger = (triggerSelector && root.querySelector(triggerSelector))
      || el.parentElement
      || el

    gsap.fromTo(el,
      { yPercent: -amount / 2 },
      {
        yPercent: amount / 2,
        ease: 'none',
        force3D: true,
        scrollTrigger: {
          trigger,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      },
    )
  }, { scope, dependencies: [reduced, selector, ...dependencies], revertOnUpdate: true })
}

/** ScrollTrigger.refresh() after layout-changing work (images, re-renders). */
export function refreshScrollTriggers() {
  ScrollTrigger.refresh()
}
