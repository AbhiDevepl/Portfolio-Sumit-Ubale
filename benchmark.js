
const images = {};
for (let i = 0; i < 11; i++) {
  const cat = `cat${i}`;
  images[cat] = [];
  for (let j = 0; j < 109; j++) {
    images[cat].push({ src: `img${j}.jpg`, title: `Image ${j}` });
  }
}
const total = 11 * 109;
const data = { portfolio: { images } };

function getGalleryData(category) {
    if (category === 'all') {
      let all = [];
      Object.entries(data.portfolio.images).forEach(([catSlug, imgs]) => {
        const enriched = imgs.map(img => ({ ...img, category: catSlug }));
        all.push(...enriched);
      });
      return all;
    }
    const imgs = data.portfolio.images[category] || [];
    return imgs.map(img => ({ ...img, category }));
}

function renderGallery(category) {
    const items = category === 'all' ? Object.values(images).flat() : images[category];
    const results = [];
    console.time('O(N^2) renderGallery');
    items.forEach((img, idx) => {
        results.push(getGalleryData(category));
    });
    console.timeEnd('O(N^2) renderGallery');
}

function renderGalleryOptimized(category) {
    const items = category === 'all' ? Object.values(images).flat() : images[category];
    const results = [];
    console.time('O(N) renderGallery');
    const allData = getGalleryData(category);
    items.forEach((img, idx) => {
        results.push(allData);
    });
    console.timeEnd('O(N) renderGallery');
}

console.log(`Benchmarking with ${total} items...`);
renderGallery('all');
renderGalleryOptimized('all');
