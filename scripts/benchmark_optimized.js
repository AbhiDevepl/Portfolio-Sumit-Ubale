
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./data/portfolio.json', 'utf8'));

function benchmarkOptimizedLogic() {
  const rawImages = data.portfolio.images;
  const iterations = 100;
  const start = Date.now();

  for (let i = 0; i < iterations; i++) {
    let allImages = [];
    Object.entries(rawImages).forEach(([categorySlug, images]) => {
      const processedImages = images
        .map(img => {
          if (!img.src) return null;
          const urlWithoutParams = img.src.toLowerCase().split('?')[0];
          const isJpg = urlWithoutParams.endsWith('.jpg') || urlWithoutParams.endsWith('.jpeg');
          const isVideo = urlWithoutParams.endsWith('.mp4') || urlWithoutParams.endsWith('.mov');

          if (categorySlug === 'cinematics' ? (isJpg || isVideo) : isJpg) {
            const match = urlWithoutParams.match(/(\d+)\.(jpe?g|mp4|mov)$/i);
            return {
              ...img,
              type: isVideo ? 'video' : 'image',
              sortKey: match ? parseInt(match[1], 10) : 0
            };
          }
          return null;
        })
        .filter(img => img !== null);

      processedImages.sort((a, b) => a.sortKey - b.sortKey);

      processedImages.forEach((image, idx) => {
        allImages.push({
          ...image,
          category: categorySlug,
          order: idx
        });
      });
    });

    allImages.sort((a, b) => {
      if (a.sortKey !== b.sortKey) return a.sortKey - b.sortKey;
      return a.src.localeCompare(b.src);
    });
  }

  const end = Date.now();
  console.log(`Optimized Logic: Average execution time over ${iterations} iterations: ${(end - start) / iterations}ms`);
}

benchmarkOptimizedLogic();
