
const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/portfolio.json'), 'utf8'));
const rawImages = data.portfolio.images;

function originalSort() {
    let allImages = [];
    Object.entries(rawImages).forEach(([categorySlug, images]) => {
        const validImages = images.filter(img => {
            if (!img.src) return false;
            const lowerSrc = img.src.toLowerCase();
            const urlWithoutParams = lowerSrc.split('?')[0];
            const isJpg = urlWithoutParams.endsWith('.jpg') || urlWithoutParams.endsWith('.jpeg');
            const isVideo = urlWithoutParams.endsWith('.mp4') || urlWithoutParams.endsWith('.mov');
            return isJpg || isVideo;
        });

        validImages.sort((a, b) => {
            const aMatch = a.src.split('?')[0].match(/(\d+)\.(jpe?g|mp4|mov)$/i);
            const bMatch = b.src.split('?')[0].match(/(\d+)\.(jpe?g|mp4|mov)$/i);
            const aNum = aMatch ? parseInt(aMatch[1], 10) : 0;
            const bNum = bMatch ? parseInt(bMatch[1], 10) : 0;
            return aNum - bNum;
        });

        validImages.forEach((image, idx) => {
            const srcWithoutParams = image.src.split('?')[0].toLowerCase();
            const type = image.type || (srcWithoutParams.endsWith('.mp4') || srcWithoutParams.endsWith('.mov') ? 'video' : 'image');
            allImages.push({
                ...image,
                category: categorySlug,
                type,
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

function optimizedSort() {
    const regex = /(\d+)\.(jpe?g|mp4|mov)$/i;
    const allImages = [];

    for (const [categorySlug, images] of Object.entries(rawImages)) {
        const categoryMapped = [];
        for (let i = 0; i < images.length; i++) {
            const img = images[i];
            if (!img.src) continue;

            const srcParts = img.src.split('?');
            const srcWithoutParams = srcParts[0];
            const lowerSrc = srcWithoutParams.toLowerCase();

            const isVideo = lowerSrc.endsWith('.mp4') || lowerSrc.endsWith('.mov');
            const isJpg = lowerSrc.endsWith('.jpg') || lowerSrc.endsWith('.jpeg');

            if (!(isJpg || isVideo)) continue;

            const match = srcWithoutParams.match(regex);
            categoryMapped.push({
                img,
                num: match ? parseInt(match[1], 10) : 0,
                lowerSrc,
                isVideo
            });
        }

        categoryMapped.sort((a, b) => a.num - b.num);

        for (let i = 0; i < categoryMapped.length; i++) {
            const m = categoryMapped[i];
            allImages.push({
                ...m.img,
                category: categorySlug,
                type: m.img.type || (m.isVideo ? 'video' : 'image'),
                order: i,
                _sortNum: m.num,
                _srcLower: m.lowerSrc
            });
        }
    }

    allImages.sort((a, b) => {
        if (a._sortNum !== b._sortNum) return a._sortNum - b._sortNum;
        return a._srcLower.localeCompare(b._srcLower);
    });

    for (let i = 0; i < allImages.length; i++) {
        delete allImages[i]._sortNum;
        delete allImages[i]._srcLower;
    }

    return allImages;
}

console.time('Single Original Sort');
originalSort();
console.timeEnd('Single Original Sort');

console.time('Single Optimized Sort');
optimizedSort();
console.timeEnd('Single Optimized Sort');

const iterations = 100;
console.log(`Running ${iterations} iterations...`);

console.time('Original Sort Total');
for (let i = 0; i < iterations; i++) {
    originalSort();
}
console.timeEnd('Original Sort Total');

console.time('Optimized Sort Total');
for (let i = 0; i < iterations; i++) {
    optimizedSort();
}
console.timeEnd('Optimized Sort Total');

const res1 = originalSort();
const res2 = optimizedSort();
const parity = JSON.stringify(res1) === JSON.stringify(res2);
console.log('Parity check:', parity ? 'PASSED' : 'FAILED');
