const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'pages', 'records.html');
const content = fs.readFileSync(filePath, 'utf8');

console.log('File:', filePath);
console.log('Size:', content.length);

const target = 'src="../js/utils/helpers.js"';
const index = content.indexOf(target);

console.log('Target string:', target);
console.log('Found index:', index);

if (index !== -1) {
    console.log('Context:', content.substring(index - 10, index + 30));
    const newContent = content.replace(target, 'src="../js/utils/app-utils.js"');
    console.log('Replacement works:', newContent.includes('app-utils.js'));

    // Try to write it
    try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Write successful');
    } catch (e) {
        console.error('Write failed:', e);
    }
} else {
    // maybe single quotes?
    const target2 = "src='../js/utils/helpers.js'";
    console.log('Testing single quotes:', content.includes(target2));
}
