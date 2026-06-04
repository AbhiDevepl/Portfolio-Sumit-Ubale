
const fs = require('fs');

// Mock formatCategoryName
function formatCategoryName(slug) {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function processDataOriginal(data) {
    const allItems = [];
    const images = data.portfolio?.images || {};

    // Flatten all category images
    for (const [category, items] of Object.entries(images)) {
      if (Array.isArray(items)) {
        items.forEach((item, index) => {
          allItems.push({
            ...item,
            category,
            order: index,
            // Ensure consistent property names
            id: item.id || `${category}-${index}`,
            title: item.title || `${formatCategoryName(category)} ${index + 1}`,
            alt: item.alt || item.title || `${formatCategoryName(category)} photography`,
            type: item.type || 'image'
          });
        });
      }
    }

    // Sort by category order, then by item order
    const categoryOrder = [
      'weddings',
      'pre-wedding-photos-and-videos',
      'engagement',
      'haldi',
      'maternity',
      'portraits',
      'cinematics',
      'kids',
      'events',
      'commercial'
    ];

    allItems.sort((a, b) => {
      const catA = categoryOrder.indexOf(a.category);
      const catB = categoryOrder.indexOf(b.category);

      if (catA !== catB) {
        return catA - catB;
      }

      return (a.order || 0) - (b.order || 0);
    });

    return allItems;
}

const categoryOrder = [
  'weddings',
  'pre-wedding-photos-and-videos',
  'engagement',
  'haldi',
  'maternity',
  'portraits',
  'cinematics',
  'kids',
  'events',
  'commercial'
];

const categoryWeights = {};
categoryOrder.forEach((cat, i) => categoryWeights[cat] = i);

const categoryNameCache = {};
function getFormattedCategoryName(slug) {
    if (!categoryNameCache[slug]) {
        categoryNameCache[slug] = slug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    return categoryNameCache[slug];
}

function processDataOptimized(data) {
    const images = data.portfolio?.images || {};
    const allItems = [];

    for (const [category, items] of Object.entries(images)) {
      if (Array.isArray(items)) {
        const catWeight = categoryWeights[category] ?? 999;
        const catName = getFormattedCategoryName(category);

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          allItems.push({
            ...item,
            category,
            order: i,
            _weight: catWeight,
            id: item.id || `${category}-${i}`,
            title: item.title || `${catName} ${i + 1}`,
            alt: item.alt || item.title || `${catName} photography`,
            type: item.type || 'image'
          });
        }
      }
    }

    allItems.sort((a, b) => {
      if (a._weight !== b._weight) {
        return a._weight - b._weight;
      }
      return a.order - b.order;
    });

    return allItems;
}

const data = JSON.parse(fs.readFileSync('data/portfolio.json', 'utf8'));

console.log('Items count:', 1016); // We know it's 1016

const iterations = 100;

console.time('Original');
for (let i = 0; i < iterations; i++) {
    processDataOriginal(data);
}
console.timeEnd('Original');

console.time('Optimized');
for (let i = 0; i < iterations; i++) {
    processDataOptimized(data);
}
console.timeEnd('Optimized');
