
const categoryOrder = [
  'weddings', 'pre-wedding-photos-and-videos', 'engagement', 'haldi',
  'maternity', 'portraits', 'cinematics', 'kids', 'events', 'commercial'
];

function generateData(count) {
  const images = {};
  categoryOrder.forEach(cat => {
    images[cat] = Array.from({ length: count / categoryOrder.length }, (_, i) => ({
      id: i,
      title: `Item ${i}`
    }));
  });
  return { portfolio: { images } };
}

function enrich(item, category, j) {
  return Object.assign({}, item, {
    category: category,
    order: j,
    id: item.id || `${category}-${j}`,
    title: item.title || `${category} ${j + 1}`,
    alt: item.alt || item.title || `${category} photography`,
    type: item.type || 'image'
  });
}

function newProcessData(data) {
  const images = data.portfolio.images;
  const weights = {};
  categoryOrder.forEach((cat, i) => { weights[cat] = i; });

  const transformed = [];
  Object.keys(images).forEach(category => {
    const items = images[category];
    const weight = weights[category] !== undefined ? weights[category] : categoryOrder.length;
    items.forEach((item, j) => {
      transformed.push({
        item: enrich(item, category, j),
        sortKey: (weight * 1000000) + j
      });
    });
  });

  return transformed
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(t => t.item);
}

const data = generateData(1000);

// Warm up
for(let i=0; i<100; i++) newProcessData(data);

console.time('New Sort (1k items, 1000 runs)');
for(let i=0; i<1000; i++) newProcessData(data);
console.timeEnd('New Sort (1k items, 1000 runs)');
