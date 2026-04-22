
const fs = require('fs');

function testSortingAccuracy() {
    console.log('Testing sorting accuracy...');
    const portfolioPath = 'data/portfolio.json';
    if (!fs.existsSync(portfolioPath)) {
        console.error('Portfolio data not found');
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(portfolioPath, 'utf8'));
    const images = data.portfolio.images;

    const extractSortKey = (src) => {
        if (!src) return 0;
        const match = src.split('?')[0].match(/(\d+)\.(jpe?g|mp4|mov)$/i);
        return match ? parseInt(match[1], 10) : 0;
    };

    let allImages = [];
    Object.entries(images).forEach(([categorySlug, imgs]) => {
        const mapped = imgs
            .filter(img => {
                if (!img.src) return false;
                const lowerSrc = img.src.toLowerCase();
                const urlWithoutParams = lowerSrc.split('?')[0];
                return urlWithoutParams.endsWith('.jpg') ||
                       urlWithoutParams.endsWith('.jpeg') ||
                       urlWithoutParams.endsWith('.mp4') ||
                       urlWithoutParams.endsWith('.mov');
            })
            .map(img => {
                const srcWithoutParams = img.src.split('?')[0].toLowerCase();
                const type = img.type || (srcWithoutParams.endsWith('.mp4') || srcWithoutParams.endsWith('.mov') ? 'video' : 'image');
                return {
                    ...img,
                    category: categorySlug,
                    type,
                    sortKey: extractSortKey(img.src)
                };
            });

        mapped.sort((a, b) => a.sortKey - b.sortKey);

        // Verify intra-category sort
        for (let i = 1; i < mapped.length; i++) {
            if (mapped[i].sortKey < mapped[i-1].sortKey) {
                throw new Error(`Intra-category sort failure in ${categorySlug} at index ${i}: ${mapped[i-1].src} vs ${mapped[i].src}`);
            }
        }
        allImages.push(...mapped);
    });

    allImages.sort((a, b) => {
        if (a.sortKey !== b.sortKey) return a.sortKey - b.sortKey;
        return a.src.localeCompare(b.src);
    });

    // Verify global sort
    for (let i = 1; i < allImages.length; i++) {
        if (allImages[i].sortKey < allImages[i-1].sortKey) {
            throw new Error(`Global sort failure at index ${i}: ${allImages[i-1].src} vs ${allImages[i].src}`);
        }
        if (allImages[i].sortKey === allImages[i-1].sortKey) {
            if (allImages[i].src.localeCompare(allImages[i-1].src) < 0) {
                 throw new Error(`Global secondary sort failure at index ${i}: ${allImages[i-1].src} vs ${allImages[i].src}`);
            }
        }
    }

    console.log(`✅ Success: Verified ${allImages.length} items correctly sorted.`);
}

try {
    testSortingAccuracy();
} catch (e) {
    console.error('❌ Verification failed:', e.message);
    process.exit(1);
}
