const fs = require('fs');
const content = fs.readFileSync('scripts/content-loader.js', 'utf8');
try {
    // Basic syntax check by creating a Function
    new Function(content);
    console.log('✅ Syntax check passed');
} catch (e) {
    console.error('❌ Syntax error in scripts/content-loader.js:', e);
    process.exit(1);
}
