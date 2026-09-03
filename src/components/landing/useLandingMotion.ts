import type { RefObject } from 'react'
import { useParallax, useReveal } from '../../hooks/useReveal'

/**
 * The shared landing-page motion, ported from legacy/scripts/landing-motion.js.
 *
 * Offsets are deliberately small (12-16px). On a photography page a large
 * travel distance reads as a template slide-in; a short rise reads as a fade
 * and keeps attention on the image. Everything goes through the reveal hook,
 * which already handles reduced motion — the copy on these pages is the whole
 * point, so it must never depend on motion.
 */
export function useLandingMotion(root: RefObject<HTMLElement | null>) {
  // Above the fold, so the observer fires immediately: this reads as a
  // staggered entrance rather than a scroll reveal.
  useReveal(root, '.lp-eyebrow, .lp-h1, .lp-hero-sub, .lp-cta-group', {
    y: 14,
    duration: 0.85,
    stagger: 0.08,
    threshold: 0,
  })

  // A slow drift on the hero backdrop. Small on purpose — the photograph is
  // the subject, not the effect.
  useParallax(root, '.lp-hero-bg', { amount: 10, triggerSelector: '.lp-hero' })

  // Label and title rise together as each section comes up.
  useReveal(root, '.lp-section-label, .lp-section-title', {
    y: 12,
    duration: 0.7,
    stagger: 0.06,
  })

  useReveal(
    root,
    '.lp-gallery-strip img, .lp-testimonial-card, .lp-location-card, .lp-city-tag, .lp-package, .lp-process-step, .lp-stat, .lp-faq-item',
    { y: 16, duration: 0.7, stagger: 0.04 },
  )

  useReveal(root, '.lp-final-cta > *', { y: 14, duration: 0.75, stagger: 0.07 })
}
