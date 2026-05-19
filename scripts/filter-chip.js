/**
 * Portfolio Filter Component
 * Horizontal scrollable chip filter
 */

const PortfolioFilter = (function () {
  const categories = [
    { id: 'all', label: 'All', icon: null },
    { id: 'wedding', label: 'Weddings', icon: null },
    { id: 'engagement', label: 'Engagement', icon: null },
    { id: 'haldi', label: 'Haldi', icon: null },
    { id: 'maternity', label: 'Maternity', icon: null },
    { id: 'cinematics', label: 'Cinematics', icon: null },
    { id: 'pre-wedding', label: 'Pre-Wedding', icon: null },
    { id: 'portraits', label: 'Portraits', icon: null },
    { id: 'kids', label: 'Kids', icon: null }
  ];

  let activeCategory = 'all';
  let onFilterChange = null;

  function init(config = {}) {
    if (config.categories) {
      updateCategories(config.categories);
    }
    if (config.onFilterChange) {
      onFilterChange = config.onFilterChange;
    }
    activeCategory = config.initial || 'all';
    render();
    setupScrollIndicator();
  }

  function updateCategories(newCategories) {
    categories.length = 0;
    for (var i = 0; i < newCategories.length; i++) {
      categories.push(newCategories[i]);
    }
  }

  function setActiveCategory(id) {
    activeCategory = id;
    updateUI();
    if (onFilterChange) {
      onFilterChange(id);
    }
  }

  function getActiveCategory() {
    return activeCategory;
  }

  function render() {
    let container = document.getElementById('portfolio-filter');
    
    if (!container) {
      container = document.createElement('div');
      container.id = 'portfolio-filter';
      container.className = 'portfolio-filter';
      container.innerHTML = `
        <div class="portfolio-filter-inner">
          <h2 class="portfolio-filter-title">Portfolio</h2>
          <div class="filter-chips-wrapper">
            <div class="filter-chips" role="tablist" aria-label="Portfolio categories"></div>
          </div>
        </div>
      `;
    }

    const chipsContainer = container.querySelector('.filter-chips');
    if (chipsContainer) {
      chipsContainer.innerHTML = '';
      chipsContainer.appendChild(createChipsFragment());
    }

    updateUI();
  }

  function createChipsFragment() {
    const fragment = document.createDocumentFragment();
    
    categories.forEach(cat => {
      const chip = document.createElement('button');
      chip.className = `filter-chip ${cat.id === activeCategory ? 'active' : ''}`;
      chip.setAttribute('role', 'tab');
      chip.setAttribute('aria-selected', cat.id === activeCategory);
      chip.dataset.category = cat.id;
      
      let content = '';
      if (cat.icon) {
        content = `<span class="filter-chip-icon">${cat.icon}</span>`;
      }
      content += cat.label;
      chip.innerHTML = content;

      chip.addEventListener('click', () => {
        setActiveCategory(cat.id);
      });

      fragment.appendChild(chip);
    });

    return fragment;
  }

  function updateUI() {
    const chips = document.querySelectorAll('.filter-chip');
    chips.forEach(chip => {
      const isActive = chip.dataset.category === activeCategory;
      chip.classList.toggle('active', isActive);
      chip.setAttribute('aria-selected', isActive);
    });
  }

  function setupScrollIndicator() {
    const wrapper = document.querySelector('.filter-chips-wrapper');
    const chips = document.querySelector('.filter-chips');
    
    if (!wrapper || !chips) return;

    const hasOverflow = () => chips.scrollWidth > chips.clientWidth;

    const showFadeEdges = () => {
      if (!hasOverflow()) {
        wrapper.style.setProperty('--fade-start', '0');
        wrapper.style.setProperty('--fade-end', '0');
        return;
      }
      
      const start = chips.scrollLeft > 10 ? 1 : 0;
      const end = chips.scrollLeft + chips.clientWidth < chips.scrollWidth - 10 ? 1 : 0;
      
      wrapper.style.setProperty('--fade-start', start);
      wrapper.style.setProperty('--fade-end', end);
    };

    chips.addEventListener('scroll', showFadeEdges, { passive: true });
    showFadeEdges();
    
    let isDown = false;
    let startX;
    let scrollLeft;

    chips.addEventListener('mousedown', (e) => {
      isDown = true;
      chips.style.cursor = 'grabbing';
      startX = e.pageX - chips.offsetLeft;
      scrollLeft = chips.scrollLeft;
    });

    chips.addEventListener('mouseleave', () => {
      isDown = false;
      chips.style.cursor = '';
    });

    chips.addEventListener('mouseup', () => {
      isDown = false;
      chips.style.cursor = '';
    });

    chips.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - chips.offsetLeft;
      const walk = (x - startX) * 1.5;
      chips.scrollLeft = scrollLeft - walk;
    });
  }

  function destroy() {
    activeCategory = 'all';
    onFilterChange = null;
    const container = document.getElementById('portfolio-filter');
    if (container) {
      container.remove();
    }
  }

  return {
    init,
    setActiveCategory,
    getActiveCategory,
    updateCategories,
    destroy
  };
})();

Core.DOM.injectGlobalComponents();

document.addEventListener('DOMContentLoaded', () => {
  const existingFilter = document.getElementById('portfolio-filter');
  if (existingFilter) {
    PortfolioFilter.init({
      initial: new URLSearchParams(window.location.search).get('category') || 'all'
    });
  }
});