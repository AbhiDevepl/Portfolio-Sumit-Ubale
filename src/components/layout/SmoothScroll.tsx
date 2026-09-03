import type { LenisRef } from 'lenis/react'
import { ReactLenis } from 'lenis/react'
import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { gsap, ScrollTrigger } from '../../lib/gsap'

/** Easing ported verbatim from legacy/scripts/smooth-scroll.js. */
export const SMOOTH_EASING = (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t))

/**
 * Smooth scrolling, driven from GSAP's ticker so ScrollTrigger reads the same
 * position Lenis is rendering. Reduced motion opts out entirely — native
 * scrolling then applies, which is what that preference asks for.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisRef>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return

    const update = (time: number) => {
      lenisRef.current?.lenis?.raf(time * 1000)
    }

    const lenis = lenisRef.current?.lenis
    lenis?.on('scroll', ScrollTrigger.update)

    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(update)
      lenis?.off('scroll', ScrollTrigger.update)
    }
  }, [reduced])

  if (reduced) return <>{children}</>

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        duration: 1.2,
        easing: SMOOTH_EASING,
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        touchMultiplier: 2,
        infinite: false,
        autoRaf: false,
      }}
    >
      {children}
    </ReactLenis>
  )
}
