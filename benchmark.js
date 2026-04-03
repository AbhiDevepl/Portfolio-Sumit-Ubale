
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('data/portfolio.json', 'utf8'));

const category = 'all';

// Mocking the optimized GalleryLoader state
const categoryNames = {};
if (data.portfolio.categories) {
  data.portfolio.categories.forEach(cat => {
    categoryNames[cat.slug.toLowerCase()] = cat.name;
  });
}

function getGalleryData() {
    if (category === 'all') {
      let all = [];
      Object.entries(data.portfolio.images).forEach(([catSlug, imgs]) => {
        const enriched = imgs.map(img => ({ ...img, category: catSlug }));
        all.push(...enriched);
      });
      return all;
    }
    const imgs = data.portfolio.images[category] || [];
    return imgs.map(img => ({ ...img, category: category }));
}

function createGalleryItem(image, index) {
    // This simulates what Core.Media.createItem does with the data
    const allItems = getGalleryData();
    return { index, allItemsLength: allItems.length };
}

function renderGallery() {
    let images = [];
    if (category === 'all') {
      Object.values(data.portfolio.images).forEach(catImages => images.push(...catImages));
    } else {
      const key = Object.keys(data.portfolio.images).find(k => k.toLowerCase() === category);
      images = data.portfolio.images[key] || [];
    }

    console.time('renderGallery O(N^2)');
    const items = images.map((img, idx) => createGalleryItem(img, idx));
    console.timeEnd('renderGallery O(N^2)');
    console.log('Total items:', items.length);
}

function renderGalleryOptimized() {
    let images = [];
    if (category === 'all') {
      Object.values(data.portfolio.images).forEach(catImages => images.push(...catImages));
    } else {
      const key = Object.keys(data.portfolio.images).find(k => k.toLowerCase() === category);
      images = data.portfolio.images[key] || [];
    }

    console.time('renderGallery Optimized O(N)');
    const allGalleryData = getGalleryData();
    const items = images.map((img, idx) => {
        // simulate Core.Media.createItem
        const catName = categoryNames[img.category?.toLowerCase()] || img.category;
        return { index: idx, allItemsLength: allGalleryData.length, catName };
    });
    console.timeEnd('renderGallery Optimized O(N)');
    console.log('Total items:', items.length);
}

console.log("--- Benchmarking Gallery Rendering Logic ---");
renderGallery();
renderGalleryOptimized();
