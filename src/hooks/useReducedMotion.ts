import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Tracks the visitor's motion preference, including changes made mid-session.
 * Always false on the server and on the first client render, so hydration
 * matches; the effect corrects it before paint-relevant work happens in
 * useGSAP (which runs after this state settles).
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    setReduced(mq.matches)

    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}
