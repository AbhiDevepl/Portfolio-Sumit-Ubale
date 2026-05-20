
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

function formatCategoryName(slug) {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function processDataOriginal(data) {
  const allItems = [];
  const images = data.portfolio?.images || {};

  for (const [category, items] of Object.entries(images)) {
    if (Array.isArray(items)) {
      items.forEach((item, index) => {
        allItems.push({
          ...item,
          category,
          order: index,
          id: item.id || `${category}-${index}`,
          title: item.title || `${formatCategoryName(category)} ${index + 1}`,
          alt: item.alt || item.title || `${formatCategoryName(category)} photography`,
          type: item.type || 'image'
        });
      });
    }
  }

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

// Optimized version
const categoryWeights = new Map(categoryOrder.map((cat, i) => [cat, i]));
const formattedCache = new Map();

function getFormattedCategory(slug) {
  if (formattedCache.has(slug)) return formattedCache.get(slug);
  const formatted = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  formattedCache.set(slug, formatted);
  return formatted;
}

function processDataOptimized(data) {
  const allItems = [];
  const images = data.portfolio.images || {};
  const categories = Object.keys(images);

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const items = images[category];
    if (Array.isArray(items)) {
      const formattedCat = getFormattedCategory(category);
      const catWeight = categoryWeights.has(category) ? categoryWeights.get(category) : 999;

      for (let j = 0; j < items.length; j++) {
        const item = items[j];
        allItems.push({
          ...item,
          category,
          _catWeight: catWeight,
          order: j,
          id: item.id || `${category}-${j}`,
          title: item.title || `${formattedCat} ${j + 1}`,
          alt: item.alt || item.title || `${formattedCat} photography`,
          type: item.type || 'image'
        });
      }
    }
  }

  allItems.sort((a, b) => {
    if (a._catWeight !== b._catWeight) {
      return a._catWeight - b._catWeight;
    }
    return (a.order || 0) - (b.order || 0);
  });

  return allItems;
}

// Generate dummy data
const dummyData = {
  portfolio: {
    images: {}
  }
};
categoryOrder.forEach(cat => {
  dummyData.portfolio.images[cat] = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    title: `Item ${i}`,
    src: `src-${i}.jpg`
  }));
});

// Run benchmark
const iterations = 500;

console.time('Original');
for (let i = 0; i < iterations; i++) {
  processDataOriginal(dummyData);
}
console.timeEnd('Original');

console.time('Optimized');
for (let i = 0; i < iterations; i++) {
  processDataOptimized(dummyData);
}
console.timeEnd('Optimized');
