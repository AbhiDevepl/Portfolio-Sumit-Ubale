const fs = require('fs');

const data = JSON.parse(fs.readFileSync('data/portfolio.json', 'utf8'));
const rawImages = data.portfolio.images;

function currentSort() {
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
            allImages.push({ ...image, category: categorySlug, order: idx });
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
    let allImages = [];
    const extractNum = (src) => {
        const match = src.split('?')[0].match(/(\d+)\.(jpe?g|mp4|mov)$/i);
        return match ? parseInt(match[1], 10) : 0;
    };

    Object.entries(rawImages).forEach(([categorySlug, images]) => {
        // 1. Map to include pre-calculated sort key and type
        const processed = images
            .map(img => {
                if (!img.src) return null;
                const urlWithoutParams = img.src.split('?')[0].toLowerCase();
                const isJpg = urlWithoutParams.endsWith('.jpg') || urlWithoutParams.endsWith('.jpeg');
                const isVideo = urlWithoutParams.endsWith('.mp4') || urlWithoutParams.endsWith('.mov');

                let isValid = isJpg;
                if (categorySlug === 'cinematics') isValid = isJpg || isVideo;

                if (!isValid) return null;

                return {
                    ...img,
                    _sortKey: extractNum(img.src),
                    type: isVideo ? 'video' : 'image' // also pre-calculate type
                };
            })
            .filter(img => img !== null);

        // 2. Sort using pre-calculated key
        processed.sort((a, b) => a._sortKey - b._sortKey);

        // 3. Assign order and push to all
        processed.forEach((image, idx) => {
            allImages.push({
                ...image,
                category: categorySlug,
                order: idx
            });
        });
    });

    // 4. Final Global Sort using pre-calculated key
    allImages.sort((a, b) => {
        if (a._sortKey !== b._sortKey) return a._sortKey - b._sortKey;
        return a.src.localeCompare(b.src);
    });

    // Remove temp sort key if desired, but here we can just leave it or map it out
    return allImages;
}

const ITERATIONS = 100;

console.time('Current');
for (let i = 0; i < ITERATIONS; i++) {
    currentSort();
}
console.timeEnd('Current');

console.time('Optimized');
for (let i = 0; i < ITERATIONS; i++) {
    optimizedSort();
}
console.timeEnd('Optimized');

// Verification
const res1 = currentSort();
const res2 = optimizedSort();
console.log('Result length match:', res1.length === res2.length);
let match = true;
for (let i = 0; i < res1.length; i++) {
    if (res1[i].src !== res2[i].src) {
        match = false;
        break;
    }
}
console.log('Result content match:', match);
