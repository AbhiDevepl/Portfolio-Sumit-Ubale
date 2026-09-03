import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Footer } from './components/layout/Footer'
import { MobileMenu } from './components/layout/MobileMenu'
import { Nav } from './components/layout/Nav'
import { PageLoader } from './components/layout/PageLoader'
import { ScrollToHash } from './components/layout/ScrollToHash'
import { SmoothScroll } from './components/layout/SmoothScroll'

import './styles/tokens.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/components.css'
import './styles/animations.css'
import './styles/loader.css'
import './styles/lightbox-video.css'
import './styles/portfolio-gallery.css'
import './styles/service.css'
import './styles/landing.css'

// portfolio.json never changes within a session, so nothing needs refetching.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Number.POSITIVE_INFINITY,
    },
  },
})

/**
 * The shell every route renders inside: navigation, footer and smooth
 * scrolling in one place. The static site injected these at runtime from
 * Core.DOM.injectGlobalComponents(), which a page could simply forget to call.
 */
export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <QueryClientProvider client={queryClient}>
      <SmoothScroll>
        <ScrollToHash />
        <PageLoader />

        <a href="#main" className="skip-to-main">Skip to main content</a>

        <Nav menuOpen={menuOpen} onToggleMenu={() => setMenuOpen(open => !open)} />
        <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

        <main id="main">
          <Outlet />
        </main>

        <Footer />
      </SmoothScroll>
    </QueryClientProvider>
  )
}

export default Layout
