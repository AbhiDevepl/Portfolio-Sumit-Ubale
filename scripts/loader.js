/**
 * Page Loader Logic
 * Handles the visibility and lifecycle of the preloader
 */

(function() {
  document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('page-loader');
    
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
  });
})();
