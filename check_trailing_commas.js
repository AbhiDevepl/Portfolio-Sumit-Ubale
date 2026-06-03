const fs = require('fs');
const path = require('path');

function checkFile(filepath) {
    const content = fs.readFileSync(filepath, 'utf8');
    const lines = content.split('\n');
    let inClass = false;
    let braceCount = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('class ')) {
            inClass = true;
        }

        if (inClass) {
            if (line.includes('{')) braceCount++;
            if (line.includes('}')) braceCount--;

            if (braceCount === 1) { // We are at class level
                if (/\}\s*,/.test(line)) {
                    console.log(`Possible trailing comma at ${filepath}:${i + 1}`);
                }
            }

            if (braceCount === 0) {
                inClass = false;
            }
        }
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (file.endswith('.js')) {
            checkFile(fullPath);
        }
    }
}

// Just check manually for now
['scripts/portfolio-gallery.js', 'scripts/content-loader.js'].forEach(checkFile);
