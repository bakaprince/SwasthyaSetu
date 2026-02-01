const fs = require('fs');
const path = require('path');

/**
 * Simple build script for SwasthyaSetu
 * Creates a production-ready distribution
 */

const BUILD_DIR = 'dist';
const SOURCE_DIRS = ['assets', 'components', 'css', 'js', 'pages', 'data'];
const SOURCE_FILES = ['index.html', 'README.md'];

console.log('🚀 Building SwasthyaSetu for production...\n');

// Create dist directory
if (!fs.existsSync(BUILD_DIR)) {
    fs.mkdirSync(BUILD_DIR);
    console.log('✅ Created dist directory');
}

// Copy directories
SOURCE_DIRS.forEach(dir => {
    if (fs.existsSync(dir)) {
        copyDir(dir, path.join(BUILD_DIR, dir));
        console.log(`✅ Copied ${dir}/`);
    }
});

// Copy files
SOURCE_FILES.forEach(file => {
    if (fs.existsSync(file)) {
        fs.copyFileSync(file, path.join(BUILD_DIR, file));
        console.log(`✅ Copied ${file}`);
    }
});

console.log('\n✨ Build complete! Files are in the dist/ directory');
console.log('📦 Ready to deploy to any static hosting service\n');

/**
 * Recursively copy directory
 */
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}
