const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const pagesDir = path.join(rootDir, 'pages');
const logFile = path.join(rootDir, 'update_log.txt');
let logContent = '';

function log(msg) {
    console.log(msg);
    logContent += msg + '\n';
}

function updateFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;

        // Simple string replacements
        const replacements = [
            { from: 'src="../js/utils/helpers.js"', to: 'src="../js/utils/app-utils.js"' },
            { from: 'src="js/utils/helpers.js"', to: 'src="js/utils/app-utils.js"' },
            // Handle single quotes just in case
            { from: "src='../js/utils/helpers.js'", to: "src='../js/utils/app-utils.js'" },
            { from: "src='js/utils/helpers.js'", to: "src='js/utils/app-utils.js'" }
        ];

        replacements.forEach(rep => {
            content = content.replace(rep.from, rep.to);
        });

        // Remove validators/formatters
        content = content.replace(/<script\s+src=["'](\.\.\/)?js\/utils\/(validators|formatters)\.js["'][^>]*>\s*<\/script>\s*/g, '');

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            log(`Updated: ${path.basename(filePath)}`);
        } else {
            if (content.includes('helpers.js')) {
                log(`WARNING: ${path.basename(filePath)} still has helpers.js`);

                // Debug: show the line
                const lines = content.split('\n');
                const line = lines.find(l => l.includes('helpers.js'));
                log(`   Line: ${line ? line.trim() : 'NOT FOUND'}`);
            }
        }
    } catch (e) {
        log(`Error updating ${path.basename(filePath)}: ${e.message}`);
    }
}

log('Starting Sycn Update...');

if (fs.existsSync(pagesDir)) {
    const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));
    files.forEach(f => updateFile(path.join(pagesDir, f)));
}

fs.writeFileSync(logFile, logContent, 'utf8');
log('Done.');
