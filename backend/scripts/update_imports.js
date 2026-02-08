const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            if (f !== 'node_modules' && f !== '.git') {
                walkDir(dirPath, callback);
            }
        } else {
            callback(path.join(dir, f));
        }
    });
}

walkDir(rootDir, (filepath) => {
    if (path.extname(filepath) === '.html') {
        let content = fs.readFileSync(filepath, 'utf8');
        let originalContent = content;

        // Regex to find script tags for utilities
        // Matches <script src=".../helpers.js" ...></script>
        const utilsRegex = /<script\s+src="[^"]*(helpers|validators|formatters)\.js"[^>]*><\/script>/g;

        if (utilsRegex.test(content)) {
            console.log(`Updating ${filepath}...`);

            // Determine relative path depth
            // simple check: if in root, js/utils/...; if in pages/, ../js/utils/...
            // But we can just use the existing path from the first match

            const match = content.match(/<script\s+src="([^"]*)(helpers|validators|formatters)\.js"[^>]*><\/script>/);
            if (match) {
                const fullSrc = match[1]; // e.g. "js/utils/" or "../js/utils/"
                const newScript = `<script src="${fullSrc}app-utils.js" defer></script>`;

                // Replace the first occurrence with app-utils.js
                content = content.replace(match[0], newScript);

                // Remove subsequent occurrences of helpers/validators/formatters
                content = content.replace(/<script\s+src="[^"]*(helpers|validators|formatters)\.js"[^>]*><\/script>/g, '');

                // Fix potential double newlines or messy formatting if needed, but keeping it simple is safer
            }

            if (content !== originalContent) {
                fs.writeFileSync(filepath, content, 'utf8');
                console.log(`✅ Updated ${filepath}`);
            }
        }
    }
});
