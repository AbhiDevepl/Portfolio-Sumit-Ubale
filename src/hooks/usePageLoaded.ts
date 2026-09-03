import { useEffect, useState } from 'react'

/** Delay between `load` firing and the preloader clearing, as in loader.js. */
const REVEAL_DELAY = 500
/** Safety net: never leave the overlay up, even if `load` never fires. */
const SAFETY_TIMEOUT = 5000

/**
 * True once the page has finished loading and the preloader has cleared.
 * The hero entrance waits on this so it does not play behind the overlay —
 * the same contract the old `pageLoaded` CustomEvent provided.
 */
export function usePageLoaded(): boolean {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let revealTimer: number
    const finish = () => setLoaded(true)

    if (document.readyState === 'complete') {
      revealTimer = window.setTimeout(finish, REVEAL_DELAY)
    }
    else {
      window.addEventListener('load', () => {
        revealTimer = window.setTimeout(finish, REVEAL_DELAY)
      }, { once: true })
    }

    const safety = window.setTimeout(finish, SAFETY_TIMEOUT)

    return () => {
      window.clearTimeout(revealTimer)
      window.clearTimeout(safety)
    }
  }, [])

  return loaded
}
