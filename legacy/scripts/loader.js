/**
 * Page Loader Logic
 * Handles the preloader lifecycle and the between-page transition.
 * The transition reuses the existing #page-loader overlay rather than
 * introducing a second full-screen element.
 */

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('page-loader');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Safety timeout to ensure loader isn't stuck forever
    const safetyTimeout = setTimeout(() => {
      hideLoader();
    }, 5000);

    const hideLoader = () => {
      if (loader && !loader.classList.contains('hidden')) {
        loader.classList.add('hidden');
        document.body.classList.add('loaded');
        clearTimeout(safetyTimeout);

        window.dispatchEvent(new CustomEvent('pageLoaded'));
      }
    };

    // Use load event so loader is not stuck; addEventListener avoids overwriting other handlers
    window.addEventListener('load', () => {
      setTimeout(hideLoader, 500);
    });

    // Coming back via the bfcache re-shows a cached page that may still be
    // mid-transition, so clear the overlay.
    window.addEventListener('pageshow', (e) => {
      if (!e.persisted || !loader) return;
      loader.classList.remove('is-leaving');
      loader.classList.add('hidden');
      document.body.classList.add('loaded');
    });

    if (!loader || reduced) return;

    // --- Leave transition -------------------------------------------------
    const isPlainLeftClick = (e) =>
      e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link || !isPlainLeftClick(e) || e.defaultPrevented) return;

      // Leave anything that is not a same-tab navigation to its own handler:
      // anchors, downloads, new tabs, mailto/tel/whatsapp, other origins.
      if (link.hasAttribute('download')) return;
      if (link.target && link.target !== '_self') return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;

      let url;
      try { url = new URL(href, window.location.href); } catch { return; }
      if (url.origin !== window.location.origin) return;
      if (url.href === window.location.href) return;
      // Same page, different hash — that is in-page scrolling, not navigation.
      if (url.pathname === window.location.pathname && url.hash) return;

      e.preventDefault();
      loader.classList.remove('hidden');
      loader.classList.add('is-leaving');

      // Navigate once the overlay has covered the page. The fallback timer
      // keeps navigation reliable if the transitionend never fires.
      let navigated = false;
      const go = () => {
        if (navigated) return;
        navigated = true;
        window.location.href = url.href;
      };
      loader.addEventListener('transitionend', go, { once: true });
      setTimeout(go, 420);
    });
  });
})();
