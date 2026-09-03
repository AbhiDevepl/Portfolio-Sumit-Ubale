import { useEffect } from 'react'
import { usePageLoaded } from '../../hooks/usePageLoaded'

/**
 * First-paint preloader, ported from legacy/scripts/loader.js + loader.css.
 *
 * The between-page transition that script also ran is gone: routes are now
 * client-side transitions with no document reload, so there is nothing to
 * cover.
 */
export function PageLoader() {
  const loaded = usePageLoaded()

  useEffect(() => {
    // Several stylesheets key off `body.loaded`.
    document.body.classList.toggle('loaded', loaded)
  }, [loaded])

  return (
    <div id="page-loader" className={loaded ? 'hidden' : ''} aria-hidden="true">
      <div className="loader-content">
        <div className="loader-logo">Sumit Ubale</div>
        <div className="loader-progress-bar">
          <div className="loader-progress-fill" />
        </div>
      </div>
    </div>
  )
}
