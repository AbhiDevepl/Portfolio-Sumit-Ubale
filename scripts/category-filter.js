/**
 * Category Filter Component
 *
 * Mobile-first horizontal scroll chip filter.
 * Features snap scrolling, gradient fade indicators, and smooth animations.
 *
 * @param {HTMLElement} container - The container element to render into
 * @param {Object} options - Configuration options
 * @param {Function} options.onCategoryChange - Callback when category changes
 * @param {string} options.initialCategory - Initial active category (default: 'all')
 * @param {string[]} options.categories - Array of category objects { id, label }
 */

class CategoryFilter {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      onCategoryChange: options.onCategoryChange || (() => {}),
      initialCategory: options.initialCategory || 'all',
      categories: options.categories || [
        { id: 'all', label: 'All' },
        { id: 'weddings', label: 'Weddings' },
        { id: 'engagement', label: 'Engagement' },
        { id: 'haldi', label: 'Haldi' },
        { id: 'mehndi', label: 'Mehndi' },
        { id: 'reception', label: 'Reception' }]};

    this.activeCategory = this.options.initialCategory;
    this.chipRefs = {};
    this.scrollContainer = null;

    this.init();
  }

  init() {
    this.render();
    this.attachEventListeners();
    this.showScrollHint();
  }

  render() {
    const { categories } = this.options;

    this.container.innerHTML = `
      <section class="category-filter">
        <h2 class="category-filter__title">Portfolio</h2>

        <div class="category-filter__wrapper">
          <!-- Left Fade -->
          <div class="category-filter__fade category-filter__fade--left"></div>

          <!-- Right Fade -->
          <div class="category-filter__fade category-filter__fade--right"></div>

          <!-- Scroll Container -->
          <div class="category-filter__scroll" role="tablist" aria-label="Portfolio categories">
            ${categories
              .map(
                (category) => `
              <button
                type="button"
                class="category-filter__chip ${
                  this.activeCategory === category.id
                    ? 'category-filter__chip--active'
                    : ''
                }"
                data-category="${category.id}"
                role="tab"
                aria-selected="${this.activeCategory === category.id}"
                aria-label="Filter by ${category.label}"
              >
                <span class="category-filter__chip-text">${category.label}</span>
                ${
                  this.activeCategory === category.id
                    ? '<span class="category-filter__chip-dot" aria-hidden="true"></span>'
                    : ''
                }
              </button>
            `
              )
              .join('')}

            <!-- Spacer for last item snap -->
            <div class="category-filter__spacer" aria-hidden="true"></div>
          </div>
        </div>

        <!-- Scroll Hint -->
        <div class="category-filter__hint" aria-hidden="true">
          <svg class="category-filter__hint-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l-4-4m0 0l4-4m-4 4h18"/>
          </svg>
          <span class="category-filter__hint-text">Swipe to explore</span>
          <svg class="category-filter__hint-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
          </svg>
        </div>
      </section>
    `;

    // Cache references
    this.scrollContainer = this.container.querySelector('.category-filter__scroll');
    this.chipRefs = {};
    this.container.querySelectorAll('.category-filter__chip').forEach((chip) => {
      const categoryId = chip.dataset.category;
      this.chipRefs[categoryId] = chip;
    });
  }

  attachEventListeners() {
    // Chip click handlers
    this.container.querySelectorAll('.category-filter__chip').forEach((chip) => {
      chip.addEventListener('click', (e) => {
        const categoryId = e.currentTarget.dataset.category;
        this.setActiveCategory(categoryId);
      });
    });

    // Hide scroll hint on scroll
    if (this.scrollContainer) {
      this.scrollContainer.addEventListener(
        'scroll',
        () => {
          this.hideScrollHint();
        },
        { once: true }
      );
    }
  }

  setActiveCategory(categoryId) {
    if (this.activeCategory === categoryId) return;

    // Update state
    const prevCategory = this.activeCategory;
    this.activeCategory = categoryId;

    // Update UI
    this.updateChipStyles(prevCategory, categoryId);

    // Auto-scroll into view
    this.scrollToChip(categoryId);

    // Trigger callback
    this.options.onCategoryChange(categoryId);
  }

  updateChipStyles(prevId, newId) {
    const prevChip = this.chipRefs[prevId];
    const newChip = this.chipRefs[newId];

    if (prevChip) {
      prevChip.classList.remove('category-filter__chip--active');
      prevChip.setAttribute('aria-selected', 'false');
      const dot = prevChip.querySelector('.category-filter__chip-dot');
      if (dot) dot.remove();
    }

    if (newChip) {
      newChip.classList.add('category-filter__chip--active');
      newChip.setAttribute('aria-selected', 'true');
      if (!newChip.querySelector('.category-filter__chip-dot')) {
        const dot = document.createElement('span');
        dot.className = 'category-filter__chip-dot';
        dot.setAttribute('aria-hidden', 'true');
        newChip.appendChild(dot);
      }
    }
  }

  scrollToChip(categoryId) {
    const chip = this.chipRefs[categoryId];
    if (!chip || !this.scrollContainer) return;

    const containerRect = this.scrollContainer.getBoundingClientRect();
    const chipRect = chip.getBoundingClientRect();

    const isInView =
      chipRect.left >= containerRect.left &&
      chipRect.right <= containerRect.right;

    if (!isInView) {
      chip.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'});
    }
  }

  showScrollHint() {
    const hint = this.container.querySelector('.category-filter__hint');
    if (hint) {
      hint.classList.add('category-filter__hint--visible');
    }
  }

  hideScrollHint() {
    const hint = this.container.querySelector('.category-filter__hint');
    if (hint) {
      hint.classList.remove('category-filter__hint--visible');
    }
  }

  destroy() {
    this.container.innerHTML = '';
    this.chipRefs = {};
    this.scrollContainer = null;
  }
}

// Auto-initialize if data attribute present
document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('[data-category-filter]');
  containers.forEach((container) => {
    const options = {};

    // Parse categories from data attribute if provided
    if (container.dataset.categories) {
      try {
        options.categories = JSON.parse(container.dataset.categories);
      } catch (e) {
        console.warn('Invalid categories JSON:', e);
      }
    }

    // Parse initial category
    if (container.dataset.initialCategory) {
      options.initialCategory = container.dataset.initialCategory;
    }

    // Parse callback
    if (container.dataset.onChange) {
      const callbackName = container.dataset.onChange;
      if (window[callbackName]) {
        options.onCategoryChange = window[callbackName];
      }
    }

    // Create instance and store on element
    container._categoryFilter = new CategoryFilter(container, options);
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CategoryFilter;
}
