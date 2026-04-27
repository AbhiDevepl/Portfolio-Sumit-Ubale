const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/portfolio.json'), 'utf8'));

function originalSort() {
    const rawImages = data.portfolio.images;
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
    const rawImages = data.portfolio.images;
    let allImages = [];

    const sortRegex = /(\d+)\.(jpe?g|mp4|mov)$/i;

    Object.entries(rawImages).forEach(([categorySlug, images]) => {
        // Map-Sort-Map for category level
        const validWithKeys = images
            .map(img => {
                if (!img.src) return null;
                const srcWithoutParams = img.src.split('?')[0];
                const lowerSrc = srcWithoutParams.toLowerCase();

                const isJpg = lowerSrc.endsWith('.jpg') || lowerSrc.endsWith('.jpeg');
                const isVideo = lowerSrc.endsWith('.mp4') || lowerSrc.endsWith('.mov');

                if (!isJpg && !isVideo) return null;

                const match = srcWithoutParams.match(sortRegex);
                return {
                    img,
                    num: match ? parseInt(match[1], 10) : 0,
                    type: img.type || (isVideo ? 'video' : 'image')
                };
            })
            .filter(item => item !== null);

        validWithKeys.sort((a, b) => a.num - b.num);

        validWithKeys.forEach((item, idx) => {
            allImages.push({
                ...item.img,
                category: categorySlug,
                type: item.type,
                order: idx,
                _sortNum: item.num // Keep for global sort
            });
        });
    });

    // Global sort using pre-calculated numbers
    allImages.sort((a, b) => {
        if (a._sortNum !== b._sortNum) return a._sortNum - b._sortNum;
        return a.src.localeCompare(b.src);
    });

    // Cleanup temporary key
    return allImages.map(img => {
        const { _sortNum, ...rest } = img;
        return rest;
    });
}

// Warmup
for(let i=0; i<10; i++) {
    originalSort();
    optimizedSort();
}

console.time('Original Sort');
for(let i=0; i<100; i++) {
    originalSort();
}
console.timeEnd('Original Sort');

console.time('Optimized Sort');
for(let i=0; i<100; i++) {
    optimizedSort();
}
console.timeEnd('Optimized Sort');

// Verify correctness
const res1 = originalSort();
const res2 = optimizedSort();

console.log('Results length match:', res1.length === res2.length);
let match = true;
for(let i=0; i<res1.length; i++) {
    if (res1[i].src !== res2[i].src || res1[i].category !== res2[i].category || res1[i].type !== res2[i].type) {
        match = false;
        console.log(`Mismatch at index ${i}`);
        console.log('Orig:', res1[i]);
        console.log('Opt:', res2[i]);
        break;
    }
}
console.log('Results content match:', match);
