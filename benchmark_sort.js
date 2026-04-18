const images = [];
for (let i = 0; i < 1200; i++) {
    images.push({
        src: `https://example.com/assets/${Math.floor(Math.random() * 2000)}.jpg`
    });
}

function originalSort(allImages) {
    const start = Date.now();
    allImages.sort((a, b) => {
        const aMatch = a.src.split('?')[0].match(/(\d+)\.(jpe?g|mp4|mov)$/i);
        const bMatch = b.src.split('?')[0].match(/(\d+)\.(jpe?g|mp4|mov)$/i);
        const aNum = aMatch ? parseInt(aMatch[1], 10) : 0;
        const bNum = bMatch ? parseInt(bMatch[1], 10) : 0;
        if (aNum !== bNum) return aNum - bNum;
        return a.src.localeCompare(b.src);
    });
    return Date.now() - start;
}

function optimizedSort(allImages) {
    const start = Date.now();
    // Schwartzian Transform
    const mapped = allImages.map(img => {
        const match = img.src.split('?')[0].match(/(\d+)\.(jpe?g|mp4|mov)$/i);
        return {
            img,
            sortKey: match ? parseInt(match[1], 10) : 0
        };
    });

    mapped.sort((a, b) => {
        if (a.sortKey !== b.sortKey) return a.sortKey - b.sortKey;
        return a.img.src.localeCompare(b.img.src);
    });

    const result = mapped.map(el => el.img);
    return Date.now() - start;
}

let totalOriginal = 0;
let totalOptimized = 0;
const iterations = 100;

for (let i = 0; i < iterations; i++) {
    totalOriginal += originalSort([...images]);
    totalOptimized += optimizedSort([...images]);
}

console.log(`Original Sort Avg: ${totalOriginal / iterations}ms`);
console.log(`Optimized Sort Avg: ${totalOptimized / iterations}ms`);
console.log(`Speedup: ${(totalOriginal / totalOptimized).toFixed(2)}x`);
