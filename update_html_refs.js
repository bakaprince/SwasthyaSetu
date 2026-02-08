const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const pagesDir = path.join(rootDir, 'pages');

function updateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Simple string replacements
    const replacements = [
        { from: 'src="../js/utils/helpers.js"', to: 'src="../js/utils/app-utils.js"' },
        { from: 'src="js/utils/helpers.js"', to: 'src="js/utils/app-utils.js"' },

        // Remove other files (commenting them out or removing lines)
        // We will just replace them with empty string if they exist on their own line
    ];

    replacements.forEach(rep => {
        content = content.replace(rep.from, rep.to);
    });

    // Remove validators.js and formatters.js lines
    // We'll use a regex for this as it's safer for whole lines
    content = content.replace(/<script\s+src=["'](\.\.\/)?js\/utils\/(validators|formatters)\.js["'][^>]*>\s*<\/script>\s*/g, '');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${path.basename(filePath)}`);
    } else {
        // Console log for debugging if it didn't update but we expected it to
        if (content.includes('helpers.js')) {
            console.log(`WARNING: Failed to update ${path.basename(filePath)} despite containing helpers.js`);
        }
    }
}

console.log('Starting String-based HTML update...');

// Update pages/*.html
if (fs.existsSync(pagesDir)) {
    const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));
    files.forEach(f => updateFile(path.join(pagesDir, f)));
}

console.log('HTML update complete.');
