const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/portfolio.json'), 'utf8'));
const rawImages = data.portfolio.images;

function runOld() {
    let allImages = [];
    Object.entries(rawImages).forEach(([categorySlug, images]) => {
        const validImages = images.filter(img => {
          if (!img.src) return false;
          const lowerSrc = img.src.toLowerCase();
          const urlWithoutParams = lowerSrc.split('?')[0];
          const isJpg = urlWithoutParams.endsWith('.jpg') || urlWithoutParams.endsWith('.jpeg');
          const isVideo = urlWithoutParams.endsWith('.mp4') || urlWithoutParams.endsWith('.mov');
          if (categorySlug === 'cinematics') return isJpg || isVideo;
          return isJpg;
        });

        validImages.sort((a, b) => {
          const aMatch = a.src.split('?')[0].match(/(\d+)\.(jpe?g|mp4|mov)$/i);
          const bMatch = b.src.split('?')[0].match(/(\d+)\.(jpe?g|mp4|mov)$/i);
          const aNum = aMatch ? parseInt(aMatch[1], 10) : 0;
          const bNum = bMatch ? parseInt(bMatch[1], 10) : 0;
          return aNum - bNum;
        });

        validImages.forEach((image, idx) => {
          allImages.push({
            ...image,
            category: categorySlug,
            order: idx
          });
        });
    });

    allImages.sort((a, b) => {
        const aMatch = a.src.split('?')[0].match(/(\d+)\.(jpe?g|mp4|mov)$/i);
        const bMatch = b.src.split('?')[0].match(/(\d+)\.(jpe?g|mp4|mov)$/i);
        const aNum = aMatch ? parseInt(aMatch[1], 10) : 0;
        const bNum = bMatch ? parseInt(bMatch[1], 10) : 0;
        if (aNum !== bNum) return aNum - bNum;
        return a.src.localeCompare(b.src);
    });
    return allImages;
}

function runNew() {
    const sortable = [];
    const numRegex = /(\d+)\.(jpe?g|mp4|mov)$/i;

    Object.entries(rawImages).forEach(([categorySlug, images]) => {
        images.forEach(img => {
          if (!img.src) return;
          const lowerSrc = img.src.toLowerCase();
          const urlWithoutParams = lowerSrc.split('?')[0];
          const isJpg = urlWithoutParams.endsWith('.jpg') || urlWithoutParams.endsWith('.jpeg');
          const isVideo = urlWithoutParams.endsWith('.mp4') || urlWithoutParams.endsWith('.mov');

          if (categorySlug === 'cinematics') {
             if (!isJpg && !isVideo) return;
          } else {
             if (!isJpg) return;
          }

          const match = urlWithoutParams.match(numRegex);
          const num = match ? parseInt(match[1], 10) : 0;

          sortable.push({
            img: { ...img, category: categorySlug },
            num: num,
            src: img.src
          });
        });
    });

    sortable.sort((a, b) => {
        if (a.num !== b.num) return a.num - b.num;
        return a.src.localeCompare(b.src);
    });

    const categoryCounters = {};
    return sortable.map(item => {
        const cat = item.img.category;
        item.img.order = categoryCounters[cat] || 0;
        categoryCounters[cat] = (categoryCounters[cat] || 0) + 1;
        return item.img;
    });
}

console.log('--- CORRECTNESS CHECK ---');
const oldResult = runOld();
const newResult = runNew();

if (oldResult.length !== newResult.length) {
    console.error(`FAIL: Length mismatch! Old: ${oldResult.length}, New: ${newResult.length}`);
    process.exit(1);
}

for (let i = 0; i < oldResult.length; i++) {
    if (oldResult[i].src !== newResult[i].src || oldResult[i].category !== newResult[i].category || oldResult[i].order !== newResult[i].order) {
        console.error(`FAIL: Mismatch at index ${i}`);
        console.error('Old:', oldResult[i]);
        console.error('New:', newResult[i]);
        process.exit(1);
    }
}
console.log(`SUCCESS: Results are identical. Total items: ${oldResult.length}`);

console.log('\n--- BENCHMARK (100 iterations) ---');
const iterations = 100;

console.time('Old Logic');
for (let i = 0; i < iterations; i++) runOld();
console.timeEnd('Old Logic');

console.time('New Logic');
for (let i = 0; i < iterations; i++) runNew();
console.timeEnd('New Logic');
