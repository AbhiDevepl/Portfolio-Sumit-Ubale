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
        
        // Dispatch custom event for other scripts to know we're ready
        window.dispatchEvent(new CustomEvent('pageLoaded'));
        console.log('✨ Page fully loaded and transition complete');
      }
    };

    // Use window.onload to ensure all assets (images/fonts) are ready
    window.onload = () => {
      // Small delay for smooth aesthetic transition
      setTimeout(hideLoader, 500);
    };
  });
})();
